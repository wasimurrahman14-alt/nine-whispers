import cors from 'cors';
import express from 'express';
import { createServer } from 'node:http';
import { Server, type Socket } from 'socket.io';
import type { ClientToServerEvents, Room, ServerToClientEvents } from '@six-of-shadows/shared';
import { CHARACTERS, CLUE_MAX_NUMBER, CLUE_MIN_NUMBER, MAX_PLAYERS, MAX_SELECT } from '@six-of-shadows/shared';
import { applyAbility } from './abilities.js';
import { computeScoreDelta, shuffle } from './game.js';
import {
  advanceAfterReveal,
  beginBoardForCurrentTurn,
  clearMatchInternals,
  computeTurnPlan,
  startMatch,
} from './match.js';
import { redactRoomFor } from './redact.js';
import { createRoom, getRoom, getUsedWords, joinRoom, removeEmptyRoomIfLobby } from './rooms.js';
import { bindSocket, createSession, newPlayerId, playerForSocket, resolveSession, socketForPlayer, unbindSocket } from './sessions.js';

const PORT = Number(process.env.PORT ?? 3001);
const ROLE_REVEAL_MS = 2200;
// Generous enough to cover the staggered reveal + 3s score display animation
// the client runs entirely on its own timing after one broadcast.
const TURN_RESULT_MS = 6500;
// How long an ability-use announcement stays up before the server clears it
// — long enough to cover Pirate's one-by-one word-shuffle animation.
const ABILITY_ANNOUNCE_MS = 2200;

const app = express();
app.use(cors());
app.get('/health', (_req, res) => res.json({ ok: true }));

const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: { origin: '*' },
});

function emitRoomState(room: Room): void {
  for (const player of room.players) {
    const socketId = socketForPlayer(player.id);
    if (!socketId) continue;
    io.to(socketId).emit('roomState', redactRoomFor(room, player.id));
  }
}

function scheduleRoleRevealThenBoard(room: Room): void {
  setTimeout(() => {
    const current = getRoom(room.code);
    if (!current || current.match.phase !== 'roleReveal') return;
    beginBoardForCurrentTurn(current, getUsedWords(current.code));
    emitRoomState(current);
  }, ROLE_REVEAL_MS);
}

function scheduleAdvanceAfterReveal(room: Room): void {
  setTimeout(() => {
    const current = getRoom(room.code);
    if (!current || current.match.phase !== 'turnResult') return;
    const result = advanceAfterReveal(current);
    emitRoomState(current);
    if (result === 'next') scheduleRoleRevealThenBoard(current);
  }, TURN_RESULT_MS);
}

io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
  socket.on('createRoom', ({ name, code }, ack) => {
    const trimmed = name.trim().slice(0, 20);
    if (!trimmed) return ack({ ok: false, error: 'Name is required.' });
    const playerId = newPlayerId();
    const result = createRoom(playerId, trimmed, code);
    if ('error' in result) return ack({ ok: false, error: result.error });
    const sessionToken = createSession(result.room.code, playerId);
    bindSocket(socket.id, { roomCode: result.room.code, playerId });
    socket.join(result.room.code);
    ack({ ok: true, code: result.room.code, playerId, sessionToken });
    emitRoomState(result.room);
  });

  socket.on('joinRoom', ({ code, name }, ack) => {
    const trimmed = name.trim().slice(0, 20);
    if (!trimmed) return ack({ ok: false, error: 'Name is required.' });
    const playerId = newPlayerId();
    const result = joinRoom(code, playerId, trimmed);
    if ('error' in result) return ack({ ok: false, error: result.error });
    const sessionToken = createSession(result.room.code, playerId);
    bindSocket(socket.id, { roomCode: result.room.code, playerId });
    socket.join(result.room.code);
    ack({ ok: true, playerId, sessionToken });
    emitRoomState(result.room);
  });

  socket.on('rejoin', ({ code, sessionToken }, ack) => {
    const ref = resolveSession(sessionToken);
    if (!ref || ref.roomCode !== code.toUpperCase()) {
      return ack({ ok: false, error: 'Session not found — please rejoin with your name.' });
    }
    const room = getRoom(ref.roomCode);
    const player = room?.players.find((p) => p.id === ref.playerId);
    if (!room || !player) {
      return ack({ ok: false, error: 'That match no longer exists — please rejoin with your name.' });
    }
    bindSocket(socket.id, ref);
    player.connected = true;
    socket.join(room.code);
    ack({ ok: true });
    emitRoomState(room);
  });

  function withRoom(fn: (room: Room, playerId: string) => void) {
    const ref = playerForSocket(socket.id);
    if (!ref) {
      socket.emit('errorMessage', { message: 'You are not in a room.' });
      return;
    }
    const room = getRoom(ref.roomCode);
    if (!room) return;
    fn(room, ref.playerId);
  }

  socket.on('selectTeam', ({ team }) => {
    withRoom((room, playerId) => {
      if (room.match.phase !== 'lobby') return;
      const teamCount = room.players.filter((p) => p.team === team).length;
      const player = room.players.find((p) => p.id === playerId);
      if (!player) return;
      if (player.team !== team && teamCount >= 2) {
        socket.emit('errorMessage', { message: 'That team already has 2 players.' });
        return;
      }
      player.team = team;
      emitRoomState(room);
    });
  });

  socket.on('randomizeTeams', () => {
    withRoom((room, playerId) => {
      if (room.match.phase !== 'lobby') return;
      if (room.leaderId !== playerId) return;
      const shuffled = shuffle(room.players);
      shuffled.forEach((p, i) => {
        p.team = i % 2 === 0 ? 'gold' : 'silver';
      });
      emitRoomState(room);
    });
  });

  socket.on('startCharacterSelect', () => {
    withRoom((room, playerId) => {
      if (room.match.phase !== 'lobby') return;
      if (room.leaderId !== playerId) {
        socket.emit('errorMessage', { message: 'Only the room leader can start the match.' });
        return;
      }
      if (room.players.length !== MAX_PLAYERS) {
        socket.emit('errorMessage', { message: 'Need exactly 4 players to start.' });
        return;
      }
      const gold = room.players.filter((p) => p.team === 'gold').length;
      const silver = room.players.filter((p) => p.team === 'silver').length;
      if (gold !== 2 || silver !== 2) {
        socket.emit('errorMessage', { message: 'Each team needs exactly 2 players.' });
        return;
      }
      room.match.phase = 'characterSelect';
      room.locked = true;
      computeTurnPlan(room);
      emitRoomState(room);
    });
  });

  socket.on('selectCharacter', ({ character }) => {
    withRoom((room, playerId) => {
      if (room.match.phase !== 'characterSelect') return;
      const player = room.players.find((p) => p.id === playerId);
      if (!player) return;
      if (character) {
        const teammateHasIt = room.players.some(
          (p) => p.id !== playerId && p.team === player.team && p.character === character,
        );
        if (teammateHasIt) {
          socket.emit('errorMessage', { message: 'Your teammate already picked that character.' });
          return;
        }
      }
      player.character = character;
      if (!character) player.ready = false;
      emitRoomState(room);
    });
  });

  socket.on('setReady', ({ ready }) => {
    withRoom((room, playerId) => {
      if (room.match.phase !== 'characterSelect') return;
      const player = room.players.find((p) => p.id === playerId);
      if (!player) return;
      if (ready && !player.character) {
        socket.emit('errorMessage', { message: 'Pick a character before readying up.' });
        return;
      }
      player.ready = ready;
      emitRoomState(room);

      const allReady = room.players.length === MAX_PLAYERS && room.players.every((p) => p.ready);
      if (allReady) {
        startMatch(room);
        emitRoomState(room);
        scheduleRoleRevealThenBoard(room);
      }
    });
  });

  socket.on('sendClue', ({ word, number }) => {
    withRoom((room, playerId) => {
      const turn = room.match.currentTurn;
      if (room.match.phase !== 'board' || !turn || turn.revealed) return;
      if (turn.clueGiverId !== playerId) {
        socket.emit('errorMessage', { message: 'Only the clue-giver can send a clue.' });
        return;
      }
      if (turn.clue !== null) {
        socket.emit('errorMessage', { message: 'A clue has already been sent this turn.' });
        return;
      }
      const trimmed = word.trim().slice(0, 30);
      if (!trimmed) {
        socket.emit('errorMessage', { message: 'Clue cannot be empty.' });
        return;
      }
      if (!Number.isInteger(number) || number < CLUE_MIN_NUMBER || number > CLUE_MAX_NUMBER) {
        socket.emit('errorMessage', { message: `Number must be between ${CLUE_MIN_NUMBER} and ${CLUE_MAX_NUMBER}.` });
        return;
      }
      turn.clue = { word: trimmed, number };
      emitRoomState(room);
    });
  });

  socket.on('useAbility', ({ targetIndex }) => {
    withRoom((room, playerId) => {
      const result = applyAbility(room, playerId, getUsedWords(room.code), targetIndex);
      if (!result.ok) {
        socket.emit('errorMessage', { message: result.error });
        return;
      }
      emitRoomState(room);
      setTimeout(() => {
        const current = getRoom(room.code);
        const turn = current?.match.currentTurn;
        if (turn) {
          turn.lastAbilityUse = null;
          emitRoomState(current!);
        }
      }, ABILITY_ANNOUNCE_MS);
    });
  });

  socket.on('updateSelection', ({ selected }) => {
    withRoom((room, playerId) => {
      const turn = room.match.currentTurn;
      if (room.match.phase !== 'board' || !turn || turn.revealed) return;
      if (turn.guesserId !== playerId) return;
      if (turn.clue === null) return;
      const unique = Array.from(new Set(selected));
      const valid =
        unique.length === selected.length &&
        unique.length <= MAX_SELECT &&
        unique.every((i) => Number.isInteger(i) && i >= 0 && i < turn.cards.length && i !== turn.sacrificedIndex);
      if (!valid) return;
      turn.liveSelected = unique;
      emitRoomState(room);
    });
  });

  socket.on('lockIn', ({ selected }) => {
    withRoom((room, playerId) => {
      const turn = room.match.currentTurn;
      if (room.match.phase !== 'board' || !turn || turn.revealed) return;
      if (turn.guesserId !== playerId) {
        socket.emit('errorMessage', { message: 'Only the guesser can lock in a selection.' });
        return;
      }
      if (turn.clue === null) {
        socket.emit('errorMessage', { message: 'Wait for the clue before guessing.' });
        return;
      }
      const unique = Array.from(new Set(selected));
      const valid =
        unique.length === selected.length &&
        unique.length <= MAX_SELECT &&
        unique.every((i) => Number.isInteger(i) && i >= 0 && i < turn.cards.length && i !== turn.sacrificedIndex);
      if (!valid) {
        socket.emit('errorMessage', { message: 'Invalid selection.' });
        return;
      }
      const delta = computeScoreDelta(turn.cards, unique, turn.actingTeam, turn.sacrificedIndex, turn.shieldActive);
      room.match.scores.gold += delta.gold;
      room.match.scores.silver += delta.silver;
      turn.selected = unique;
      turn.revealed = true;
      turn.scoreDelta = delta;
      room.match.phase = 'turnResult';
      emitRoomState(room);
      scheduleAdvanceAfterReveal(room);
    });
  });

  socket.on('rematch', () => {
    withRoom((room) => {
      if (room.match.phase !== 'end') return;
      clearMatchInternals(room.code);
      room.match = {
        phase: 'characterSelect',
        scores: { gold: 0, silver: 0 },
        turnPlan: [],
        currentTurnIndex: -1,
        currentTurn: null,
        winner: null,
        suddenDeathTriggered: false,
      };
      room.players.forEach((p) => {
        p.character = null;
        p.ready = false;
        p.abilityUsed = false;
      });
      computeTurnPlan(room);
      emitRoomState(room);
    });
  });

  socket.on('goHome', () => {
    withRoom((room, playerId) => {
      if (room.leaderId !== playerId) return;
      // Allowed from 'characterSelect' too so the leader's Home click still
      // wins even if another player's Rematch reached the server first.
      if (room.match.phase !== 'end' && room.match.phase !== 'characterSelect') return;
      clearMatchInternals(room.code);
      room.match = {
        phase: 'lobby',
        scores: { gold: 0, silver: 0 },
        turnPlan: [],
        currentTurnIndex: -1,
        currentTurn: null,
        winner: null,
        suddenDeathTriggered: false,
      };
      room.players.forEach((p) => {
        p.character = null;
        p.ready = false;
        p.abilityUsed = false;
      });
      room.locked = false;
      emitRoomState(room);
    });
  });

  socket.on('disconnect', () => {
    const ref = unbindSocket(socket.id);
    if (!ref) return;
    const room = getRoom(ref.roomCode);
    if (!room) return;
    const player = room.players.find((p) => p.id === ref.playerId);
    if (player) player.connected = false;
    emitRoomState(room);
    removeEmptyRoomIfLobby(room.code);
  });
});

app.get('/characters', (_req, res) => res.json(CHARACTERS));

httpServer.listen(PORT, () => {
  console.log(`Nine Whispers server listening on :${PORT}`);
});

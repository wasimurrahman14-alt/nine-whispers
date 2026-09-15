import type { MatchState, Player, Room } from '@six-of-shadows/shared';
import { MAX_PLAYERS } from '@six-of-shadows/shared';

const ROOM_CODE_PATTERN = /^[A-Za-z]{4}$/;

const rooms = new Map<string, Room>();
/** Tracks the word pool already used within a room's current match. */
const usedWords = new Map<string, Set<string>>();

function freshMatchState(): MatchState {
  return {
    phase: 'lobby',
    scores: { gold: 0, silver: 0 },
    turnPlan: [],
    currentTurnIndex: -1,
    currentTurn: null,
    winner: null,
    suddenDeathTriggered: false,
  };
}

export function createRoom(
  leaderId: string,
  leaderName: string,
  code: string,
): { room: Room } | { error: string } {
  const normalized = code.toUpperCase();
  if (!ROOM_CODE_PATTERN.test(normalized)) {
    return { error: 'Room code must be exactly 4 letters.' };
  }
  if (rooms.has(normalized)) {
    return { error: 'That room code is already taken — pick a different one.' };
  }
  const leader: Player = {
    id: leaderId,
    name: leaderName,
    isLeader: true,
    team: null,
    character: null,
    ready: false,
    abilityUsed: false,
    connected: true,
  };
  const room: Room = { code: normalized, leaderId, locked: false, players: [leader], match: freshMatchState() };
  rooms.set(normalized, room);
  usedWords.set(normalized, new Set());
  return { room };
}

export function getRoom(code: string): Room | undefined {
  return rooms.get(code.toUpperCase());
}

export function getUsedWords(code: string): Set<string> {
  let set = usedWords.get(code);
  if (!set) {
    set = new Set();
    usedWords.set(code, set);
  }
  return set;
}

export function joinRoom(code: string, playerId: string, name: string): { room: Room } | { error: string } {
  const room = getRoom(code);
  if (!room) return { error: 'Room not found.' };
  if (room.locked) return { error: 'This room has already started — new players can no longer join.' };
  if (room.players.length >= MAX_PLAYERS) return { error: 'This room is full (4 players max).' };
  const player: Player = {
    id: playerId,
    name,
    isLeader: false,
    team: null,
    character: null,
    ready: false,
    abilityUsed: false,
    connected: true,
  };
  room.players.push(player);
  return { room };
}

/** A room is only ever auto-cleaned while still in the lobby — once a match
 * starts it's held for the rest of the match no matter who's connected. */
export function removeEmptyRoomIfLobby(code: string): void {
  const room = rooms.get(code);
  if (room && room.match.phase === 'lobby' && room.players.every((p) => !p.connected)) {
    rooms.delete(code);
    usedWords.delete(code);
  }
}

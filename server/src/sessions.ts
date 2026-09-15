import { randomUUID } from 'node:crypto';

interface PlayerRef {
  roomCode: string;
  playerId: string;
}

/** sessionToken -> player, created at join/create, looked up on rejoin.
 * Survives across reconnects — this is what a reloaded browser presents. */
const sessions = new Map<string, PlayerRef>();

/** socketId -> player, the live routing table. Rebuilt on every connect or
 * rejoin, cleared (not the session) on disconnect. */
const socketToPlayer = new Map<string, PlayerRef>();
/** playerId -> the socket currently representing them, if any (absent while
 * disconnected). The reverse of socketToPlayer, for targeted emits. */
const playerToSocket = new Map<string, string>();

export function createSession(roomCode: string, playerId: string): string {
  const token = randomUUID();
  sessions.set(token, { roomCode, playerId });
  return token;
}

export function resolveSession(sessionToken: string): PlayerRef | undefined {
  return sessions.get(sessionToken);
}

export function bindSocket(socketId: string, ref: PlayerRef): void {
  socketToPlayer.set(socketId, ref);
  playerToSocket.set(ref.playerId, socketId);
}

export function unbindSocket(socketId: string): PlayerRef | undefined {
  const ref = socketToPlayer.get(socketId);
  socketToPlayer.delete(socketId);
  if (ref && playerToSocket.get(ref.playerId) === socketId) {
    playerToSocket.delete(ref.playerId);
  }
  return ref;
}

export function playerForSocket(socketId: string): PlayerRef | undefined {
  return socketToPlayer.get(socketId);
}

export function socketForPlayer(playerId: string): string | undefined {
  return playerToSocket.get(playerId);
}

export function newPlayerId(): string {
  return randomUUID();
}

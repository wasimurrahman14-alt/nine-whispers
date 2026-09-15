import type { CharacterId, RedactedRoom, Team } from './types';

type JoinAck = { ok: true; playerId: string; sessionToken: string } | { ok: false; error: string };
type CreateAck =
  | { ok: true; code: string; playerId: string; sessionToken: string }
  | { ok: false; error: string };

/** Client -> server events. */
export interface ClientToServerEvents {
  createRoom: (payload: { name: string; code: string }, ack: (res: CreateAck) => void) => void;
  joinRoom: (payload: { code: string; name: string }, ack: (res: JoinAck) => void) => void;
  rejoin: (
    payload: { code: string; sessionToken: string },
    ack: (res: { ok: true } | { ok: false; error: string }) => void,
  ) => void;
  selectTeam: (payload: { team: Team }) => void;
  randomizeTeams: () => void;
  beginMatch: () => void;
  selectCharacter: (payload: { character: CharacterId | null }) => void;
  setReady: (payload: { ready: boolean }) => void;
  sendClue: (payload: { word: string; number: number }) => void;
  useAbility: (payload: { targetIndex?: number }) => void;
  updateSelection: (payload: { selected: number[] }) => void;
  lockIn: (payload: { selected: number[] }) => void;
  rematch: () => void;
  goHome: () => void;
}

/** Server -> client events. */
export interface ServerToClientEvents {
  roomState: (room: RedactedRoom) => void;
  errorMessage: (payload: { message: string }) => void;
}

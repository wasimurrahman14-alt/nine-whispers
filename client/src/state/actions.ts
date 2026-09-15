import type { CharacterId, Team } from '@six-of-shadows/shared';
import { socket } from '../lib/socket';
import { clearSession, saveSession } from './session';

export function createRoom(name: string, code: string) {
  return new Promise<{ ok: true; code: string } | { ok: false; error: string }>((resolve) => {
    socket.emit('createRoom', { name, code }, (res) => {
      if (res.ok) saveSession({ code: res.code, playerId: res.playerId, sessionToken: res.sessionToken });
      resolve(res.ok ? { ok: true, code: res.code } : res);
    });
  });
}

export function joinRoom(code: string, name: string) {
  return new Promise<{ ok: true } | { ok: false; error: string }>((resolve) => {
    socket.emit('joinRoom', { code, name }, (res) => {
      if (res.ok) saveSession({ code: code.toUpperCase(), playerId: res.playerId, sessionToken: res.sessionToken });
      resolve(res.ok ? { ok: true } : res);
    });
  });
}

export function rejoin(code: string, sessionToken: string) {
  return new Promise<{ ok: true } | { ok: false; error: string }>((resolve) => {
    socket.emit('rejoin', { code, sessionToken }, (res) => {
      if (!res.ok) clearSession();
      resolve(res);
    });
  });
}

export const selectTeam = (team: Team) => socket.emit('selectTeam', { team });
export const randomizeTeams = () => socket.emit('randomizeTeams');
export const startCharacterSelect = () => socket.emit('startCharacterSelect');
export const selectCharacter = (character: CharacterId | null) => socket.emit('selectCharacter', { character });
export const setReady = (ready: boolean) => socket.emit('setReady', { ready });
export const sendClue = (word: string, number: number) => socket.emit('sendClue', { word, number });
export const useAbility = (targetIndex?: number) => socket.emit('useAbility', { targetIndex });
export const updateSelection = (selected: number[]) => socket.emit('updateSelection', { selected });
export const lockIn = (selected: number[]) => socket.emit('lockIn', { selected });
export const rematch = () => socket.emit('rematch');
export const goHome = () => socket.emit('goHome');

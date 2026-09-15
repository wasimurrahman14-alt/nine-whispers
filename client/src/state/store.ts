import { create } from 'zustand';
import type { RedactedRoom } from '@six-of-shadows/shared';
import { socket } from '../lib/socket';
import { rejoin } from './actions';
import { loadSession } from './session';

interface StoreState {
  room: RedactedRoom | null;
  myId: string | null;
  error: string | null;
  setError: (message: string | null) => void;
}

export const useStore = create<StoreState>((set, get) => {
  let hasConnectedOnce = false;

  // The very first 'connect' is handled by the normal join/create/rejoin
  // flow. Any connect after that is a *reconnect* — a dropped connection
  // (network blip, a free-tier host sleeping/restarting, etc.) that
  // socket.io recovered from on its own. If we were mid-room when that
  // happened, the screen would otherwise sit frozen on stale pre-drop
  // state forever, since nothing else re-syncs it. Silently rejoin to
  // recover live sync automatically.
  socket.on('connect', () => {
    // A successful (re)connect always invalidates any earlier "could not
    // connect" message — clear it whether or not a rejoin follows.
    set({ error: null });
    if (!hasConnectedOnce) {
      hasConnectedOnce = true;
      return;
    }
    const wasInRoom = get().room !== null;
    const saved = loadSession();
    if (!wasInRoom || !saved) return;
    rejoin(saved.code, saved.sessionToken).then((res) => {
      if (!res.ok) set({ room: null, myId: null });
    });
  });

  socket.on('roomState', (room) => set({ room, myId: room.youAre }));
  socket.on('errorMessage', ({ message }) => set({ error: message }));
  socket.on('connect_error', () => set({ error: 'Could not connect to the game server.' }));

  return {
    room: null,
    myId: null,
    error: null,
    setError: (message) => set({ error: message }),
  };
});

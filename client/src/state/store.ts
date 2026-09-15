import { create } from 'zustand';
import type { RedactedRoom } from '@six-of-shadows/shared';
import { socket } from '../lib/socket';

interface StoreState {
  room: RedactedRoom | null;
  myId: string | null;
  error: string | null;
  setError: (message: string | null) => void;
}

export const useStore = create<StoreState>((set) => {
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

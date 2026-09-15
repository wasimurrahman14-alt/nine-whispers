import { io, type Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '@six-of-shadows/shared';

// In production this is set at build time to the deployed backend's public
// URL (see README — "Deploying"). Locally it's unset, so we fall back to
// the same LAN-friendly guess as before: whatever host the page was loaded
// from, on the server's default port.
const serverUrl = import.meta.env.VITE_SERVER_URL ?? `${window.location.protocol}//${window.location.hostname}:3001`;

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(serverUrl, {
  autoConnect: true,
});

# Nine Whispers

A real-time, 4-player (2v2) party word-guessing game with a dark purple/black nebula aesthetic: two rival teams, nine word cards a turn, a typed clue with a hint number, and four characters with one-time abilities.

## Stack

- `server/` — Node + TypeScript, Express + Socket.io. Holds all match state in memory (no database); one Socket.io room per game room.
- `client/` — Vite + React + TypeScript + Tailwind v4, `socket.io-client`, React Router.
- `packages/shared/` — types, the word bank, character definitions, and the socket event contract shared by both sides.

## Running it

```bash
npm install
npm run dev
```

This starts the server on port 3001 and the client (Vite) on port 5173. Open `http://localhost:5173`.

## Playing over your home wifi (so 4 phones/laptops can join)

The client connects to the Socket.io server at `${your machine's hostname}:3001`, and Vite's dev server is started with `--host` (via `server: { host: true }` in `vite.config.ts`), so both are reachable from other devices on the same network — no extra setup needed.

1. Find your machine's LAN IP (shown in the `npm run dev` output as "Network: http://<ip>:5173/", or run `ipconfig getifaddr en0` on macOS wifi).
2. Have the room leader open `http://<your-ip>:5173`, hit Create Room, and pick a 4-letter room code.
3. Share `http://<your-ip>:5173/room/<CODE>` with the other 3 players — they can open it on their phones' browsers, same wifi network.

## Reconnection

There's no login, but a player's seat *does* survive a reload or dropped connection: on join, the browser saves a session token to `localStorage`. Reopening the same room URL in the same browser silently resumes that exact seat — team, character, ability-used status, and score — with no re-entry of a name. Other players see a greyed-out avatar with a small badge while someone's disconnected; nothing times out or reassigns their seat, so the game simply waits for them if it's their turn. This only works within the same browser (it's `localStorage`-based) — a different browser or device is treated as a new player.

## Project structure notes

- The server is the sole source of truth for game state. It computes a **redacted view per player** (card colors hidden from an active guesser pre-reveal — except a one-card exception for Ninja's sacrificed card — and opposing-team character picks hidden during character select) and pushes it over `roomState` — the client never decides what it's allowed to see.
- Player identity is decoupled from the socket connection (`server/src/sessions.ts`) specifically to support reconnection: a stable `playerId` survives across sockets, looked up via a session token on `rejoin`.
- Turn order, role assignment (clue-giver/guesser swap), dealing, scoring, and all four character-ability restrictions are enforced server-side (`server/src/match.ts`, `server/src/game.ts`, `server/src/abilities.ts`), not just hidden in the UI.
- The word bank (`packages/shared/src/words.ts`) is an original list written for this project.
- The reveal-sequencing animation (selected cards flip one at a time, then the rest together, then a turn-score badge before it folds into the running total) is entirely client-side timing over one server broadcast — the server just sends the final revealed turn once.

## Assumptions flagged per the spec's request to flag rather than guess

- **Knight's Shield** negates every red card in that turn's selection, not just one — the spec's "for that card only" phrasing was ambiguous between per-card and per-turn; per-turn is the more sensible reading of a once-per-game ability.
- **Locking in a guess requires a clue to have been sent first** — implied by the mechanic, not stated explicitly.
- **Tiebreaker**: one sudden-death round (one extra turn per team) if tied after 6 turns; still tied after that is a draw.
- **Grid layout**: 3×3, per the spec's own suggested default.
- **Word list**: an original ~330-word bank, carried forward from the prior build.
- **Room cleanup**: a room is only auto-deleted while still in the lobby phase; once a match starts it's held for the rest of the match regardless of who's connected.
- **Auto-rejoin scope**: only triggers when a saved session's room code matches the current `/room/:code` URL, so visiting the bare landing page always shows a normal Create/Join choice.

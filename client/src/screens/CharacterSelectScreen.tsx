import { useState } from 'react';
import type { CharacterId } from '@six-of-shadows/shared';
import { CLUE_GIVER_CHARACTERS, GUESSER_CHARACTERS } from '@six-of-shadows/shared';
import { goHome, selectCharacter, setReady } from '../state/actions';
import { useStore } from '../state/store';
import { Avatar } from '../components/Avatar';
import { CharacterCard } from '../components/CharacterCard';

export default function CharacterSelectScreen() {
  const room = useStore((s) => s.room)!;
  const myId = useStore((s) => s.myId)!;
  const me = room.players.find((p) => p.id === myId)!;
  const teammate = room.players.find((p) => p.team === me.team && p.id !== myId);
  const [expanded, setExpanded] = useState<CharacterId | null>(null);

  const teamReady = room.players.filter((p) => p.team === me.team).every((p) => p.ready);
  // The first two planned turns are each team's opening turn (turns always
  // strictly alternate teams), so showing both gives every team — not just
  // whoever goes first — enough info to plan their character picks.
  const openingTurns = room.match.turnPlan.slice(0, 2);

  function renderGroup(defs: typeof CLUE_GIVER_CHARACTERS) {
    return defs.map((def) => (
      <CharacterCard
        key={def.id}
        def={def}
        expanded={expanded === def.id}
        onToggleExpand={() => setExpanded(expanded === def.id ? null : def.id)}
        selectedByMe={me.character === def.id}
        takenByTeammate={teammate?.character === def.id}
        onSelect={() => selectCharacter(me.character === def.id ? null : def.id)}
      />
    ));
  }

  return (
    <div className="relative mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-10">
      <button
        onClick={goHome}
        className="absolute right-6 top-10 text-sm text-ink-muted underline hover:text-ink"
      >
        Home
      </button>
      <h1 className="text-center font-display text-3xl font-bold text-ink">Choose Your Character</h1>

      <div className="flex justify-center gap-6">
        {room.players.map((p) => (
          <div key={p.id} className="flex flex-col items-center gap-1">
            <Avatar name={p.name} team={p.team} size="sm" connected={p.connected} />
            <span className="text-xs text-ink-muted">{p.name}</span>
          </div>
        ))}
      </div>

      {openingTurns.length > 0 && (
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-center text-sm text-ink-muted">
          {openingTurns.map((t, i) => {
            const cg = room.players.find((p) => p.id === t.clueGiverId);
            const g = room.players.find((p) => p.id === t.guesserId);
            if (!cg || !g) return null;
            return (
              <p key={t.turnNumber}>
                Turn {i + 1}: Team {t.actingTeam === 'gold' ? 'Gold' : 'Silver'}
                {i === 0 ? ' plays first' : ' plays second'} — <span className="font-semibold text-ink">{cg.name}</span> gives
                the clue, <span className="font-semibold text-ink">{g.name}</span> guesses.
              </p>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div>
          <h2 className="mb-3 text-center text-sm uppercase tracking-wide text-ink-muted">Clue-Givers</h2>
          <div className="flex flex-col gap-3">{renderGroup(CLUE_GIVER_CHARACTERS)}</div>
        </div>
        <div>
          <h2 className="mb-3 text-center text-sm uppercase tracking-wide text-ink-muted">Guessers</h2>
          <div className="flex flex-col gap-3">{renderGroup(GUESSER_CHARACTERS)}</div>
        </div>
      </div>

      <div className="mt-auto flex flex-col items-center gap-3">
        <p className="text-ink-muted">
          Teammate: {teammate ? teammate.character ?? 'choosing…' : '—'}
        </p>
        <button
          onClick={() => setReady(!me.ready)}
          disabled={!me.character}
          className={`w-full max-w-xs rounded-xl px-6 py-4 font-display text-xl font-bold disabled:cursor-not-allowed disabled:opacity-40 ${
            me.ready ? 'bg-card-green text-bg' : 'bg-accent text-bg hover:bg-accent-hover'
          }`}
        >
          {me.ready ? 'Ready!' : 'Ready Up'}
        </button>
        <p className="text-sm text-ink-muted">{teamReady ? 'Your team is ready.' : 'Waiting for your team…'}</p>
      </div>
    </div>
  );
}

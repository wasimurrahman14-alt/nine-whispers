import { TOTAL_TURNS } from '@six-of-shadows/shared';
import { useStore } from '../state/store';

export default function RoleRevealScreen() {
  const room = useStore((s) => s.room)!;
  const planned = room.match.turnPlan[room.match.currentTurnIndex];
  if (!planned) return null;

  const clueGiver = room.players.find((p) => p.id === planned.clueGiverId);
  const guesser = room.players.find((p) => p.id === planned.guesserId);
  const teamColor = planned.actingTeam === 'gold' ? 'text-team-gold' : 'text-team-silver';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm uppercase tracking-widest text-ink-muted">
        {planned.isSuddenDeath ? 'Sudden Death' : `Turn ${planned.turnNumber} of ${TOTAL_TURNS}`}
      </p>
      <h1 key={planned.turnNumber} className={`role-reveal-anim font-display text-5xl font-bold ${teamColor}`}>
        Team {planned.actingTeam === 'gold' ? 'Gold' : 'Silver'}
      </h1>
      <p className="text-lg">
        <span className="font-semibold">{clueGiver?.name}</span> is giving the clue
      </p>
      <p className="text-lg">
        <span className="font-semibold">{guesser?.name}</span> is guessing
      </p>
    </div>
  );
}

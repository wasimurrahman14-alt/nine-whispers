import { goHome, rematch } from '../state/actions';
import { useStore } from '../state/store';

export default function EndScreen() {
  const room = useStore((s) => s.room)!;
  const { gold, silver } = room.match.scores;
  const winner = room.match.winner;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="text-sm uppercase tracking-widest text-ink-muted">Match Complete</p>
      <h1 className="font-display text-4xl font-bold">
        {winner === 'draw' ? "It's a Draw" : `Team ${winner === 'gold' ? 'Gold' : 'Silver'} Wins`}
      </h1>
      <div className="flex gap-10">
        <div className="text-team-gold">
          <p className="font-display text-5xl font-bold">{gold}</p>
          <p className="text-sm uppercase tracking-wide">Gold</p>
        </div>
        <div className="text-team-silver">
          <p className="font-display text-5xl font-bold">{silver}</p>
          <p className="text-sm uppercase tracking-wide">Silver</p>
        </div>
      </div>
      <div className="flex gap-4">
        <button
          onClick={goHome}
          className="rounded-xl border-2 border-accent px-8 py-4 font-display text-xl font-bold text-accent hover:bg-accent hover:text-bg"
        >
          Home
        </button>
        <button
          onClick={rematch}
          className="rounded-xl bg-accent px-8 py-4 font-display text-xl font-bold text-bg hover:bg-accent-hover"
        >
          Rematch
        </button>
      </div>
    </div>
  );
}

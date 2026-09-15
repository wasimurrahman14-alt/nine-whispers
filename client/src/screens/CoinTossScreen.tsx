import { useStore } from '../state/store';
import coinGold from '../assets/coin-gold.png';
import coinSilver from '../assets/coin-silver.png';

export default function CoinTossScreen() {
  const room = useStore((s) => s.room)!;
  // The turn plan (and therefore who goes first) is already computed by the
  // time this screen mounts — the flip animates toward a result the server
  // already picked, rather than the client deciding anything itself.
  const firstTeam = room.match.turnPlan[0]?.actingTeam ?? 'gold';
  const teamColor = firstTeam === 'gold' ? 'text-team-gold' : 'text-team-silver';
  const teamLabel = firstTeam === 'gold' ? 'Gold' : 'Silver';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 px-6 text-center">
      <p className="text-sm uppercase tracking-widest text-ink-muted">Coin Toss</p>

      <div className="coin-toss-perspective">
        <div
          key={firstTeam}
          className={`coin-toss-coin ${firstTeam === 'gold' ? 'coin-toss-anim-gold' : 'coin-toss-anim-silver'}`}
        >
          <img src={coinGold} alt="Gold" className="coin-toss-face" />
          <img src={coinSilver} alt="Silver" className="coin-toss-face coin-toss-face-back" />
        </div>
      </div>

      <p key={`${firstTeam}-label`} className={`coin-toss-result-anim font-display text-3xl font-bold ${teamColor}`}>
        Team {teamLabel} Goes First
      </p>
    </div>
  );
}

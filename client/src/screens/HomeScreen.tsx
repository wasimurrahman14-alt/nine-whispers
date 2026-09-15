import type { Player, Team } from '@six-of-shadows/shared';
import { beginMatch, randomizeTeams, selectTeam } from '../state/actions';
import { useStore } from '../state/store';
import { Avatar } from '../components/Avatar';
import logo from '../assets/logo.png';

export default function HomeScreen() {
  const room = useStore((s) => s.room)!;
  const myId = useStore((s) => s.myId)!;
  const me = room.players.find((p) => p.id === myId);
  const isLeader = room.leaderId === myId;

  const gold = room.players.filter((p) => p.team === 'gold');
  const silver = room.players.filter((p) => p.team === 'silver');
  const allOnTeams = room.players.length === 4 && gold.length === 2 && silver.length === 2;

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center gap-8 px-6 py-10">
      <img src={logo} alt="Nine Whispers" className="w-full max-w-xs" />

      <div className="w-full rounded-xl border border-border bg-surface p-4 text-center">
        <p className="mb-2 text-sm uppercase tracking-wide text-ink-muted">Share this room code</p>
        <p className="font-display text-3xl font-bold tracking-[0.3em]">{room.code}</p>
      </div>

      <div>
        <p className="mb-3 text-center text-sm uppercase tracking-wide text-ink-muted">
          Players ({room.players.length}/4)
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {room.players.map((p) => (
            <div key={p.id} className="flex flex-col items-center gap-1">
              <Avatar name={p.name} team={p.team} connected={p.connected} />
              <span className="text-sm">
                {p.name}
                {p.id === room.leaderId ? ' ★' : ''}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid w-full grid-cols-2 gap-4">
        <TeamColumn
          label="Team Gold"
          team="gold"
          players={gold}
          mine={me?.team === 'gold'}
          disabled={me?.team !== 'gold' && gold.length >= 2}
          onJoin={() => selectTeam('gold')}
        />
        <TeamColumn
          label="Team Silver"
          team="silver"
          players={silver}
          mine={me?.team === 'silver'}
          disabled={me?.team !== 'silver' && silver.length >= 2}
          onJoin={() => selectTeam('silver')}
        />
      </div>

      {isLeader && (
        <button
          onClick={randomizeTeams}
          className="rounded-lg border border-border bg-surface px-4 py-2 text-sm hover:bg-surface-hover"
        >
          Randomize Teams
        </button>
      )}

      <button
        disabled={!allOnTeams || !isLeader}
        onClick={beginMatch}
        className="w-full rounded-xl bg-accent px-6 py-5 font-display text-2xl font-bold text-bg shadow-lg hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
      >
        Ready
      </button>
      {allOnTeams && !isLeader && (
        <p className="-mt-4 text-sm text-ink-muted">Only the room leader can start the match.</p>
      )}
    </div>
  );
}

function TeamColumn({
  label,
  team,
  players,
  mine,
  disabled,
  onJoin,
}: {
  label: string;
  team: Team;
  players: Player[];
  mine: boolean;
  disabled: boolean;
  onJoin: () => void;
}) {
  const colorText = team === 'gold' ? 'text-team-gold' : 'text-team-silver';
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface p-4">
      <p className={`font-display text-lg font-bold ${colorText}`}>{label}</p>
      <div className="flex min-h-14 flex-col gap-1">
        {players.map((p) => (
          <span key={p.id} className="text-sm">
            {p.name}
          </span>
        ))}
      </div>
      <button
        onClick={onJoin}
        disabled={mine || disabled}
        className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40"
      >
        {mine ? 'Joined' : 'Join'}
      </button>
    </div>
  );
}

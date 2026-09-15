interface AvatarProps {
  name: string;
  team?: 'gold' | 'silver' | null;
  size?: 'sm' | 'md' | 'lg';
  connected?: boolean;
}

const SIZE_CLASSES = {
  sm: 'w-9 h-9 text-sm',
  md: 'w-14 h-14 text-xl',
  lg: 'w-20 h-20 text-3xl',
};

const BADGE_SIZE = {
  sm: 'w-2.5 h-2.5',
  md: 'w-3.5 h-3.5',
  lg: 'w-4 h-4',
};

export function Avatar({ name, team, size = 'md', connected = true }: AvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  const ring = team === 'gold' ? 'ring-team-gold' : team === 'silver' ? 'ring-team-silver' : 'ring-border';
  const bg = team === 'gold' ? 'bg-team-gold-soft' : team === 'silver' ? 'bg-team-silver-soft' : 'bg-surface';
  return (
    <div className="relative inline-flex">
      <div
        className={`flex items-center justify-center rounded-full font-display font-bold text-ink ring-2 ${bg} ${ring} ${SIZE_CLASSES[size]} ${
          connected ? '' : 'opacity-40 grayscale'
        }`}
      >
        {initial}
      </div>
      {!connected && (
        <span
          title="Disconnected"
          className={`absolute -bottom-0.5 -right-0.5 rounded-full bg-danger ring-2 ring-bg ${BADGE_SIZE[size]}`}
        />
      )}
    </div>
  );
}

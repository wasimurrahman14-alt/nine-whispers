const ENTRIES: { swatch: 'split' | 'red' | 'white' | 'green'; label: string; points: string }[] = [
  { swatch: 'split', label: 'Team-color card', points: '+1' },
  { swatch: 'red', label: 'Red card', points: '−2' },
  { swatch: 'white', label: 'White card', points: '0' },
  { swatch: 'green', label: 'Green card', points: '+3*' },
];

const SWATCH_CLASS: Record<'red' | 'white' | 'green', string> = {
  red: 'bg-card-red',
  white: 'bg-card-white',
  green: 'bg-card-green',
};

export function CardLegend() {
  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        {ENTRIES.map((e) => (
          <div key={e.label} className="flex items-center gap-2">
            {e.swatch === 'split' ? (
              <span
                className="h-4 w-4 flex-shrink-0 rounded"
                style={{
                  background:
                    'linear-gradient(135deg, var(--color-team-gold) 50%, var(--color-team-silver) 50%)',
                }}
              />
            ) : (
              <span className={`h-4 w-4 flex-shrink-0 rounded ${SWATCH_CLASS[e.swatch]}`} />
            )}
            <span className="text-sm text-ink-muted">
              {e.label} <span className="font-semibold text-ink">{e.points}</span>
            </span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-center text-xs text-ink-muted">
        * Green only scores if at least one team-color card was also selected that turn — otherwise it's 0.
      </p>
    </div>
  );
}

import type { CharacterDef } from '@six-of-shadows/shared';
import { CHARACTER_PORTRAITS } from '../lib/portraits';

interface CharacterCardProps {
  def: CharacterDef;
  expanded: boolean;
  selectedByMe: boolean;
  takenByTeammate: boolean;
  onToggleExpand: () => void;
  onSelect: () => void;
}

export function CharacterCard({
  def,
  expanded,
  selectedByMe,
  takenByTeammate,
  onToggleExpand,
  onSelect,
}: CharacterCardProps) {
  const portrait = CHARACTER_PORTRAITS[def.id];
  return (
    <div
      className={`rounded-xl border-2 p-4 transition-colors ${
        selectedByMe || takenByTeammate ? 'border-accent bg-surface-hover' : 'border-border bg-surface'
      }`}
    >
      <button type="button" onClick={onToggleExpand} className="flex w-full items-center justify-between gap-3 text-left">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-bg-elevated font-display text-lg font-bold">
            {portrait ? <img src={portrait} alt="" className="h-full w-full object-cover brightness-125 contrast-110" /> : def.name.charAt(0)}
          </div>
          <div>
            <p className="font-display text-lg font-bold">{def.name}</p>
            <p className="text-xs text-ink-muted">{def.abilityName}</p>
          </div>
        </div>
        <span className="text-ink-muted">{expanded ? '▲' : '▼'}</span>
      </button>
      {takenByTeammate && (
        <p className="mt-2 text-xs font-semibold text-accent">Your teammate has selected</p>
      )}
      {expanded && (
        <div className="mt-3 flex flex-col gap-2 text-sm text-ink-muted">
          <p className="italic">{def.tagline}</p>
          <p>{def.abilityText}</p>
          <button
            type="button"
            disabled={takenByTeammate}
            onClick={onSelect}
            className={`mt-1 rounded-lg px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${
              selectedByMe ? 'bg-danger text-bg' : 'bg-accent text-bg hover:bg-accent-hover'
            }`}
          >
            {takenByTeammate ? 'Taken by teammate' : selectedByMe ? 'Unselect' : 'Select'}
          </button>
        </div>
      )}
    </div>
  );
}

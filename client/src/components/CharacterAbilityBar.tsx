import type { CharacterDef } from '@six-of-shadows/shared';
import { CHARACTER_PORTRAITS } from '../lib/portraits';

interface CharacterAbilityBarProps {
  def: CharacterDef;
  abilityUsed: boolean;
  canUse: boolean;
  targeting: boolean;
  onUse: () => void;
}

export function CharacterAbilityBar({ def, abilityUsed, canUse, targeting, onUse }: CharacterAbilityBarProps) {
  const portrait = CHARACTER_PORTRAITS[def.id];
  return (
    <div className="flex items-start gap-4 rounded-xl border border-border bg-surface p-3">
      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-bg-elevated font-display text-lg font-bold">
        {portrait ? <img src={portrait} alt="" className="h-full w-full object-cover brightness-125 contrast-110" /> : def.name.charAt(0)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-display font-bold">
          {def.name} — {def.abilityName}
        </p>
        <p className="text-sm text-ink-muted">{def.abilityText}</p>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-danger">
          {def.role === 'clueGiver' ? 'Clue-giver ability only' : 'Guesser ability only'}
        </p>
      </div>
      <button
        type="button"
        disabled={!canUse || abilityUsed}
        onClick={onUse}
        className="flex-shrink-0 rounded-lg border-2 border-accent px-4 py-2 text-sm font-semibold text-accent hover:bg-accent hover:text-bg disabled:cursor-not-allowed disabled:border-border disabled:text-ink-muted"
      >
        {abilityUsed ? 'Used' : targeting ? 'Pick a target…' : 'Use'}
      </button>
    </div>
  );
}

import type { CSSProperties } from 'react';
import type { CardColor } from '@six-of-shadows/shared';

// Revealed cards use solid fills so they read clearly against the dark,
// unfilled style of a not-yet-revealed card (see the fallback below).
const COLOR_STYLES: Record<CardColor, string> = {
  gold: 'border-team-gold bg-team-gold text-bg',
  silver: 'border-team-silver bg-team-silver text-bg',
  green: 'border-card-green bg-card-green text-bg',
  red: 'border-card-red bg-card-red text-ink',
  white: 'border-card-white bg-card-white text-bg',
};

// Matches the theme tokens in index.css — used for the reveal glow, which
// needs a real color value rather than a Tailwind class.
const GLOW_HEX: Record<CardColor, string> = {
  gold: '#d8b34a',
  silver: '#90a0b3',
  green: '#4fae6c',
  red: '#c9524c',
  white: '#e9e4d6',
};

interface WordCardProps {
  word: string;
  color: CardColor | null;
  selectable?: boolean;
  selected?: boolean;
  /** Plays a longer, more deliberate flip — used for the guesser's picked
   * cards so they're easier to watch resolve than the rest of the board. */
  slow?: boolean;
  onClick?: () => void;
}

export function WordCard({ word, color, selectable, selected, slow, onClick }: WordCardProps) {
  const colorClass = color ? COLOR_STYLES[color] : 'border-border bg-surface text-ink';
  return (
    <button
      type="button"
      disabled={!selectable}
      onClick={onClick}
      style={color ? ({ '--glow': GLOW_HEX[color] } as CSSProperties) : undefined}
      className={`${slow ? 'card-flip-anim-slow' : 'card-flip-anim'} relative flex h-20 items-center justify-center rounded-xl border-2 px-2 text-center font-display text-sm font-semibold transition-transform sm:h-24 sm:text-base ${colorClass} ${
        selectable ? 'cursor-pointer hover:-translate-y-0.5' : 'cursor-default'
      } ${selected ? 'ring-4 ring-accent scale-[1.03]' : ''}`}
    >
      {word}
    </button>
  );
}

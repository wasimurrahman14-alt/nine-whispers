import { useState } from 'react';
import type { Clue } from '@six-of-shadows/shared';
import { CLUE_MAX_NUMBER, CLUE_MIN_NUMBER } from '@six-of-shadows/shared';

interface ClueBarProps {
  isClueGiver: boolean;
  clue: Clue | null;
  onSend: (word: string, number: number) => void;
}

const NUMBERS = Array.from({ length: CLUE_MAX_NUMBER - CLUE_MIN_NUMBER + 1 }, (_, i) => CLUE_MIN_NUMBER + i);

export function ClueBar({ isClueGiver, clue, onSend }: ClueBarProps) {
  const [word, setWord] = useState('');
  const [number, setNumber] = useState(NUMBERS[0]);

  if (clue) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-xl border border-border bg-surface px-4 py-3">
        <span className="text-sm uppercase tracking-wide text-ink-muted">Clue</span>
        <span className="font-display text-xl font-bold">{clue.word}</span>
        <span className="rounded-full bg-accent px-2.5 py-0.5 text-sm font-bold text-bg">{clue.number}</span>
      </div>
    );
  }

  if (!isClueGiver) {
    return (
      <div className="rounded-xl border border-border bg-surface px-4 py-3 text-center text-ink-muted">
        Waiting for the clue…
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface p-3 sm:flex-row sm:justify-center">
      <input
        value={word}
        onChange={(e) => setWord(e.target.value)}
        placeholder="Your one-word clue"
        maxLength={30}
        className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-center outline-none focus:border-accent sm:w-48"
      />
      <div className="flex gap-1">
        {NUMBERS.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setNumber(n)}
            className={`h-9 w-9 rounded-lg border font-display font-bold ${
              number === n ? 'border-accent bg-accent text-bg' : 'border-border bg-bg-elevated text-ink hover:bg-surface-hover'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <button
        type="button"
        disabled={!word.trim()}
        onClick={() => onSend(word.trim(), number)}
        className="rounded-lg bg-accent px-4 py-2 font-semibold text-bg hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
      >
        Send
      </button>
    </div>
  );
}

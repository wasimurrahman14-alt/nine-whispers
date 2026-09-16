/**
 * Soundex — a cheap phonetic fingerprint used to keep soundalike pairs
 * (Bear/Bare, Waist/Waste) off the same board together. Two words that
 * sound alike collapse to the same 4-character code; anything that isn't
 * a soundalike almost always produces a different one.
 */
const SOUNDEX_CODES: Record<string, string> = {
  B: '1', F: '1', P: '1', V: '1',
  C: '2', G: '2', J: '2', K: '2', Q: '2', S: '2', X: '2', Z: '2',
  D: '3', T: '3',
  L: '4',
  M: '5', N: '5',
  R: '6',
};

export function soundex(word: string): string {
  const letters = word.toUpperCase().replace(/[^A-Z]/g, '');
  if (!letters) return '';

  const first = letters[0];
  let code = '';
  let prevDigit = SOUNDEX_CODES[first] ?? '';

  for (let i = 1; i < letters.length; i++) {
    const letter = letters[i];
    const digit = SOUNDEX_CODES[letter];
    if (digit) {
      if (digit !== prevDigit) code += digit;
      prevDigit = digit;
    } else if (letter !== 'H' && letter !== 'W') {
      // A vowel (or Y) breaks the "same digit" run; H/W are transparent to
      // it, matching the standard Soundex rule.
      prevDigit = '';
    }
  }

  return (first + code + '000').slice(0, 4);
}

/** True if any two words in the list share a Soundex code. */
export function hasPhoneticCollision(words: string[]): boolean {
  const seen = new Set<string>();
  for (const word of words) {
    const code = soundex(word);
    if (seen.has(code)) return true;
    seen.add(code);
  }
  return false;
}

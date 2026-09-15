import type { CharacterId, CharacterRole } from './types';

export interface CharacterDef {
  id: CharacterId;
  name: string;
  role: CharacterRole;
  tagline: string;
  abilityName: string;
  abilityText: string;
  /** Whether using this ability requires clicking a target card first. */
  needsTarget: boolean;
}

export const CHARACTERS: Record<CharacterId, CharacterDef> = {
  pirate: {
    id: 'pirate',
    name: 'Pirate',
    role: 'clueGiver',
    tagline: 'A Caribbean raider who rewrites the rules of engagement.',
    abilityName: 'Word Shuffle',
    abilityText:
      'Randomly replace 4 of the 9 words on the board with new words. Colors in those slots stay the same — only the word text changes. Usable once per game, any time before the reveal on your clue-giver turn.',
    needsTarget: false,
  },
  vampire: {
    id: 'vampire',
    name: 'Vampire',
    role: 'clueGiver',
    tagline: 'A gothic predator who erases danger before it bites.',
    abilityName: 'Targeted Swap',
    abilityText:
      'Choose one red card on the board — it turns white, and a randomly chosen white card turns red, so the board still has 3 red / 2 white overall. Usable once per game, any time before the reveal on your clue-giver turn.',
    needsTarget: true,
  },
  ninja: {
    id: 'ninja',
    name: 'Ninja',
    role: 'guesser',
    tagline: 'A stealth operative who sacrifices certainty for safety.',
    abilityName: 'Reveal & Sacrifice',
    abilityText:
      'At the start of your turn, pick one of the 9 cards to reveal its true color to you. That card is removed from consideration — it cannot score any points this turn — and you guess normally from the remaining 8. Usable once per game, before you lock in a selection on your guesser turn.',
    needsTarget: true,
  },
  knight: {
    id: 'knight',
    name: 'Knight',
    role: 'guesser',
    tagline: 'A medieval champion who guesses without fear.',
    abilityName: 'Shield',
    abilityText:
      'Declare Shield before locking in your guess: if any of your selected cards turn out to be red, their -2 penalty is negated for this turn. Usable once per game, on your guesser turn.',
    needsTarget: false,
  },
};

export const CLUE_GIVER_CHARACTERS: CharacterDef[] = [CHARACTERS.pirate, CHARACTERS.vampire];
export const GUESSER_CHARACTERS: CharacterDef[] = [CHARACTERS.ninja, CHARACTERS.knight];

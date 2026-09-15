import type { Card, CardColor, PlannedTurn, Team } from '@six-of-shadows/shared';
import { GREEN_CARDS_PER_TURN, RED_CARDS_PER_TURN, TEAM_CARDS_PER_TURN, WHITE_CARDS_PER_TURN, WORDS } from '@six-of-shadows/shared';

export function shuffle<T>(arr: T[]): T[] {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function roleForTeamTurn(
  initialClueGiver: string,
  initialGuesser: string,
  teamTurnIndex: number,
): { clueGiverId: string; guesserId: string } {
  return teamTurnIndex % 2 === 0
    ? { clueGiverId: initialClueGiver, guesserId: initialGuesser }
    : { clueGiverId: initialGuesser, guesserId: initialClueGiver };
}

export interface TeamInitialRoles {
  gold: { clueGiver: string; guesser: string };
  silver: { clueGiver: string; guesser: string };
}

/** Builds `turnsPerTeam` turns for each team, flatly alternating starting
 * with `firstTeam`, continuing the clue-giver/guesser alternation from
 * `teamTurnStart` (0-indexed, per-team turn count so far). */
export function planTurns(
  firstTeam: Team,
  teamInitial: TeamInitialRoles,
  teamTurnStart: number,
  turnsPerTeam: number,
  turnNumberStart: number,
  isSuddenDeath: boolean,
): PlannedTurn[] {
  const teamOrder: Team[] = firstTeam === 'gold' ? ['gold', 'silver'] : ['silver', 'gold'];
  const plan: PlannedTurn[] = [];
  let turnNumber = turnNumberStart;
  for (let t = 0; t < turnsPerTeam; t++) {
    const teamTurnIndex = teamTurnStart + t;
    for (const team of teamOrder) {
      const { clueGiver, guesser } = teamInitial[team];
      const { clueGiverId, guesserId } = roleForTeamTurn(clueGiver, guesser, teamTurnIndex);
      plan.push({ turnNumber, actingTeam: team, clueGiverId, guesserId, isSuddenDeath });
      turnNumber++;
    }
  }
  return plan;
}

export function dealCards(actingTeam: Team, usedWords: Set<string>): Card[] {
  const count = TEAM_CARDS_PER_TURN + RED_CARDS_PER_TURN + WHITE_CARDS_PER_TURN + GREEN_CARDS_PER_TURN;
  let pool = WORDS.filter((w) => !usedWords.has(w));
  if (pool.length < count) {
    usedWords.clear();
    pool = WORDS.slice();
  }
  const words = shuffle(pool).slice(0, count);
  words.forEach((w) => usedWords.add(w));
  const colors: CardColor[] = shuffle([
    ...Array(TEAM_CARDS_PER_TURN).fill(actingTeam),
    ...Array(RED_CARDS_PER_TURN).fill('red'),
    ...Array(WHITE_CARDS_PER_TURN).fill('white'),
    ...Array(GREEN_CARDS_PER_TURN).fill('green'),
  ]);
  return words.map((word, i) => ({ word, color: colors[i] }));
}

/** Pirate — Word Shuffle: replace 4 of 9 words, colors unchanged. */
export function replaceFourWords(cards: Card[], usedWords: Set<string>): Card[] {
  const replaceCount = 4;
  let pool = WORDS.filter((w) => !usedWords.has(w) && !cards.some((c) => c.word === w));
  if (pool.length < replaceCount) {
    usedWords.clear();
    pool = WORDS.filter((w) => !cards.some((c) => c.word === w));
  }
  const replacementWords = shuffle(pool).slice(0, replaceCount);
  const slotsToReplace = shuffle(cards.map((_, i) => i)).slice(0, replaceCount);
  const next = cards.map((c) => ({ ...c }));
  slotsToReplace.forEach((slot, i) => {
    next[slot] = { word: replacementWords[i], color: next[slot].color };
    usedWords.add(replacementWords[i]);
  });
  return next;
}

/** Vampire — Targeted Swap: the chosen red card becomes white, and a
 * randomly chosen white card becomes red, preserving the 3-red/2-white
 * counts. */
export function targetedSwap(cards: Card[], redIndex: number): Card[] {
  if (cards[redIndex]?.color !== 'red') return cards;
  const whiteIndexes = cards.map((c, i) => (c.color === 'white' ? i : -1)).filter((i) => i !== -1);
  if (whiteIndexes.length === 0) return cards;
  const chosenWhite = whiteIndexes[Math.floor(Math.random() * whiteIndexes.length)];
  return cards.map((c, i) => {
    if (i === redIndex) return { ...c, color: 'white' };
    if (i === chosenWhite) return { ...c, color: 'red' };
    return c;
  });
}

export function computeScoreDelta(
  cards: Card[],
  selected: number[],
  actingTeam: Team,
  sacrificedIndex: number | null,
  shieldActive: boolean,
): { gold: number; silver: number } {
  const scorable = selected.filter((i) => i !== sacrificedIndex);
  const anyTeamCardSelected = scorable.some((i) => cards[i].color === actingTeam);

  let delta = 0;
  for (const i of scorable) {
    const color = cards[i].color;
    if (color === actingTeam) delta += 1;
    else if (color === 'red') delta += shieldActive ? 0 : -2;
    else if (color === 'green') delta += anyTeamCardSelected ? 3 : 0;
  }

  return actingTeam === 'gold' ? { gold: delta, silver: 0 } : { gold: 0, silver: delta };
}

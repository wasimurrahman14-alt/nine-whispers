export type Team = 'gold' | 'silver';

export type CharacterId = 'ninja' | 'knight' | 'pirate' | 'vampire';

export type CharacterRole = 'clueGiver' | 'guesser';

export type CardColor = 'gold' | 'silver' | 'green' | 'red' | 'white';

export type MatchPhase =
  | 'lobby'
  | 'characterSelect'
  | 'roleReveal'
  | 'board'
  | 'turnResult'
  | 'end';

export interface Player {
  id: string;
  name: string;
  isLeader: boolean;
  team: Team | null;
  character: CharacterId | null;
  ready: boolean;
  abilityUsed: boolean;
  connected: boolean;
}

export interface Card {
  word: string;
  color: CardColor;
}

export interface PlannedTurn {
  turnNumber: number;
  actingTeam: Team;
  clueGiverId: string;
  guesserId: string;
  isSuddenDeath: boolean;
}

export interface Clue {
  word: string;
  number: number;
}

export interface TurnState {
  turnNumber: number;
  actingTeam: Team;
  clueGiverId: string;
  guesserId: string;
  isSuddenDeath: boolean;
  cards: Card[];
  clue: Clue | null;
  /** Ninja's Reveal & Sacrifice target — revealed to the guesser only,
   * excluded from scoring even if it ends up in `selected`. */
  sacrificedIndex: number | null;
  /** Knight's Shield, declared for this turn — zeroes every red penalty in
   * the eventual selection. */
  shieldActive: boolean;
  /** The guesser's in-progress picks, broadcast live so everyone can watch
   * them select — indices only, never colors, so this never leaks
   * information the guesser isn't meant to have. */
  liveSelected: number[];
  selected: number[] | null;
  revealed: boolean;
  scoreDelta: { gold: number; silver: number } | null;
  /** Set briefly whenever a character ability is used, so all four clients
   * can show an announcement; cleared automatically by the server shortly
   * after. */
  lastAbilityUse: { playerId: string; playerName: string; characterName: string; abilityName: string } | null;
}

export interface MatchState {
  phase: MatchPhase;
  scores: { gold: number; silver: number };
  turnPlan: PlannedTurn[];
  currentTurnIndex: number;
  currentTurn: TurnState | null;
  winner: Team | 'draw' | null;
  suddenDeathTriggered: boolean;
}

export interface Room {
  code: string;
  leaderId: string;
  locked: boolean;
  players: Player[];
  match: MatchState;
}

/** What a specific socket is allowed to see — card colors stripped for an
 * active guesser pre-reveal (except their own sacrificed card), everyone
 * else always sees the truth. */
export type RedactedCard = { word: string; color: CardColor | null };

export interface RedactedTurnState extends Omit<TurnState, 'cards'> {
  cards: RedactedCard[];
}

export interface RedactedMatchState extends Omit<MatchState, 'currentTurn'> {
  currentTurn: RedactedTurnState | null;
}

export interface RedactedRoom extends Omit<Room, 'match'> {
  match: RedactedMatchState;
  youAre: string;
}

export const MAX_PLAYERS = 4;
export const CARDS_PER_TURN = 9;
export const TEAM_CARDS_PER_TURN = 3;
export const RED_CARDS_PER_TURN = 3;
export const WHITE_CARDS_PER_TURN = 2;
export const GREEN_CARDS_PER_TURN = 1;
export const MAX_SELECT = 4;
export const TURNS_PER_TEAM = 3;
export const TOTAL_TURNS = TURNS_PER_TEAM * 2;
export const CLUE_MIN_NUMBER = 1;
export const CLUE_MAX_NUMBER = 4;
export const ROOM_CODE_LENGTH = 4;

import type { Player, Room, Team } from '@six-of-shadows/shared';
import { TURNS_PER_TEAM } from '@six-of-shadows/shared';
import { dealCards, planTurns, shuffle, type TeamInitialRoles } from './game.js';

interface MatchInternals {
  firstTeam: Team;
  teamInitial: TeamInitialRoles;
}

const internals = new Map<string, MatchInternals>();

function initialRolesFor(pair: Player[]): { clueGiver: string; guesser: string } {
  const [a, b] = shuffle(pair.map((p) => p.id));
  return { clueGiver: a, guesser: b };
}

/** Randomizes the whole match's turn plan as soon as teams are locked in
 * (character select begins), so the character-select screen can show turn
 * 1's roles before anyone readies up. */
export function computeTurnPlan(room: Room): void {
  const gold = room.players.filter((p) => p.team === 'gold');
  const silver = room.players.filter((p) => p.team === 'silver');
  const firstTeam: Team = Math.random() < 0.5 ? 'gold' : 'silver';
  const teamInitial: TeamInitialRoles = {
    gold: initialRolesFor(gold),
    silver: initialRolesFor(silver),
  };
  internals.set(room.code, { firstTeam, teamInitial });
  room.match.turnPlan = planTurns(firstTeam, teamInitial, 0, TURNS_PER_TEAM, 1, false);
}

/** Begins the match using the already-computed turn plan (no re-randomizing). */
export function startMatch(room: Room): void {
  room.match.currentTurnIndex = 0;
  room.match.scores = { gold: 0, silver: 0 };
  room.match.winner = null;
  room.match.suddenDeathTriggered = false;
  room.match.currentTurn = null;
  room.match.phase = 'roleReveal';
  room.players.forEach((p) => (p.abilityUsed = false));
  room.locked = true;
}

export function beginBoardForCurrentTurn(room: Room, usedWords: Set<string>): void {
  const planned = room.match.turnPlan[room.match.currentTurnIndex];
  room.match.currentTurn = {
    turnNumber: planned.turnNumber,
    actingTeam: planned.actingTeam,
    clueGiverId: planned.clueGiverId,
    guesserId: planned.guesserId,
    isSuddenDeath: planned.isSuddenDeath,
    cards: dealCards(planned.actingTeam, usedWords),
    clue: null,
    sacrificedIndex: null,
    shieldActive: false,
    liveSelected: [],
    selected: null,
    revealed: false,
    scoreDelta: null,
    lastAbilityUse: null,
  };
  room.match.phase = 'board';
}

/**
 * Called after a reveal is shown. Returns 'next' if another role-reveal
 * should follow (room.match is left on 'roleReveal', ready for
 * beginBoardForCurrentTurn), or 'ended' if the match is now over.
 */
export function advanceAfterReveal(room: Room): 'next' | 'ended' {
  const nextIndex = room.match.currentTurnIndex + 1;
  if (nextIndex < room.match.turnPlan.length) {
    room.match.currentTurnIndex = nextIndex;
    room.match.currentTurn = null;
    room.match.phase = 'roleReveal';
    return 'next';
  }

  const { gold, silver } = room.match.scores;
  if (gold === silver && !room.match.suddenDeathTriggered) {
    room.match.suddenDeathTriggered = true;
    const int = internals.get(room.code);
    if (int) {
      const extra = planTurns(
        int.firstTeam,
        int.teamInitial,
        TURNS_PER_TEAM,
        1,
        room.match.turnPlan.length + 1,
        true,
      );
      room.match.turnPlan = [...room.match.turnPlan, ...extra];
      room.match.currentTurnIndex = nextIndex;
      room.match.currentTurn = null;
      room.match.phase = 'roleReveal';
      return 'next';
    }
  }

  room.match.phase = 'end';
  room.match.currentTurn = null;
  room.match.winner = gold === silver ? 'draw' : gold > silver ? 'gold' : 'silver';
  return 'ended';
}

export function clearMatchInternals(code: string): void {
  internals.delete(code);
}

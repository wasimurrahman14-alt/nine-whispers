import type { Room } from '@six-of-shadows/shared';
import { CHARACTERS } from '@six-of-shadows/shared';
import { replaceFourWords, targetedSwap } from './game.js';

export type AbilityResult = { ok: true } | { ok: false; error: string };

export function applyAbility(
  room: Room,
  playerId: string,
  usedWords: Set<string>,
  targetIndex?: number,
): AbilityResult {
  const turn = room.match.currentTurn;
  if (room.match.phase !== 'board' || !turn || turn.revealed) {
    return { ok: false, error: 'No active turn to use an ability on.' };
  }
  const player = room.players.find((p) => p.id === playerId);
  if (!player) return { ok: false, error: 'Player not found.' };
  if (!player.character) return { ok: false, error: 'You have no character selected.' };
  if (player.abilityUsed) return { ok: false, error: 'You have already used your ability this game.' };

  function announce(): void {
    if (!player!.character) return;
    const def = CHARACTERS[player!.character];
    turn!.lastAbilityUse = {
      playerId: player!.id,
      playerName: player!.name,
      characterName: def.name,
      abilityName: def.abilityName,
    };
  }

  switch (player.character) {
    case 'ninja': {
      if (turn.guesserId !== playerId) return { ok: false, error: 'Only the guesser can use Ninja.' };
      if (turn.clue === null) return { ok: false, error: 'Wait for the clue before using your ability.' };
      if (turn.selected !== null) return { ok: false, error: 'Too late — you already locked in a selection.' };
      if (targetIndex == null || !turn.cards[targetIndex]) {
        return { ok: false, error: 'Pick a valid card to sacrifice.' };
      }
      turn.sacrificedIndex = targetIndex;
      player.abilityUsed = true;
      announce();
      return { ok: true };
    }
    case 'knight': {
      if (turn.guesserId !== playerId) return { ok: false, error: 'Only the guesser can use Knight.' };
      if (turn.clue === null) return { ok: false, error: 'Wait for the clue before using your ability.' };
      if (turn.selected !== null) return { ok: false, error: 'Too late — you already locked in a selection.' };
      turn.shieldActive = true;
      player.abilityUsed = true;
      announce();
      return { ok: true };
    }
    case 'pirate': {
      if (turn.clueGiverId !== playerId) return { ok: false, error: 'Only the clue-giver can use Pirate.' };
      if (turn.clue !== null) return { ok: false, error: 'Too late — you already sent the clue.' };
      turn.cards = replaceFourWords(turn.cards, usedWords);
      player.abilityUsed = true;
      announce();
      return { ok: true };
    }
    case 'vampire': {
      if (turn.clueGiverId !== playerId) return { ok: false, error: 'Only the clue-giver can use Vampire.' };
      if (turn.clue !== null) return { ok: false, error: 'Too late — you already sent the clue.' };
      if (targetIndex == null || turn.cards[targetIndex]?.color !== 'red') {
        return { ok: false, error: 'Pick a valid red card to target.' };
      }
      turn.cards = targetedSwap(turn.cards, targetIndex);
      player.abilityUsed = true;
      announce();
      return { ok: true };
    }
    default:
      return { ok: false, error: 'Unknown character.' };
  }
}

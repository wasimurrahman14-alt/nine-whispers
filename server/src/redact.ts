import type { RedactedRoom, RedactedTurnState, Room, TurnState } from '@six-of-shadows/shared';

function redactTurn(turn: TurnState, forPlayerId: string): RedactedTurnState {
  const isGuesser = turn.guesserId === forPlayerId;
  const hideColors = isGuesser && !turn.revealed;
  return {
    ...turn,
    cards: turn.cards.map((c, i) => {
      // Ninja's sacrificed card is revealed to the guesser as a one-card
      // exception to the normal "guesser sees no colors" rule.
      const visibleToSacrificingGuesser = isGuesser && i === turn.sacrificedIndex;
      const hide = hideColors && !visibleToSacrificingGuesser;
      return { word: c.word, color: hide ? null : c.color };
    }),
  };
}

export function redactRoomFor(room: Room, forPlayerId: string): RedactedRoom {
  const me = room.players.find((p) => p.id === forPlayerId);
  const hideOpposingCharacters = room.match.phase === 'characterSelect';
  const players = room.players.map((p) =>
    hideOpposingCharacters && me && p.team !== me.team ? { ...p, character: null } : p,
  );
  return {
    code: room.code,
    leaderId: room.leaderId,
    locked: room.locked,
    players,
    youAre: forPlayerId,
    match: {
      ...room.match,
      currentTurn: room.match.currentTurn ? redactTurn(room.match.currentTurn, forPlayerId) : null,
    },
  };
}

import { useEffect, useRef, useState } from 'react';
import type { Player, Team } from '@six-of-shadows/shared';
import { CHARACTERS, MAX_SELECT, TOTAL_TURNS } from '@six-of-shadows/shared';
import { lockIn, sendClue, updateSelection, useAbility } from '../state/actions';
import { useStore } from '../state/store';
import { CardLegend } from '../components/CardLegend';
import { CharacterAbilityBar } from '../components/CharacterAbilityBar';
import { ClueBar } from '../components/ClueBar';
import { WordCard } from '../components/WordCard';
import { CHARACTER_PORTRAITS } from '../lib/portraits';

const STAGGER_MS = 450;
const POPUP_DELAY_MS = 300;
const POPUP_DURATION_MS = 3000;
const SHUFFLE_STAGGER_MS = 400;

export default function BoardScreen() {
  const room = useStore((s) => s.room)!;
  const myId = useStore((s) => s.myId)!;
  const turn = room.match.currentTurn;
  const me = room.players.find((p) => p.id === myId)!;
  const amActingGuesser = turn?.guesserId === myId;

  const [selected, setSelected] = useState<number[]>([]);
  const [targeting, setTargeting] = useState(false);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
  const [turnScorePopup, setTurnScorePopup] = useState<{ team: Team; delta: number } | null>(null);
  const [displayScores, setDisplayScores] = useState(room.match.scores);
  const [shuffleWords, setShuffleWords] = useState<string[] | null>(null);
  const prevTurnNumberRef = useRef<number | null>(null);
  const prevWordsRef = useRef<string[]>([]);

  useEffect(() => {
    setSelected([]);
    setTargeting(false);
  }, [turn?.turnNumber]);

  // Broadcast the guesser's in-progress picks live — indices only, never
  // colors, so opposing/clue-giver viewers can watch selections happen.
  useEffect(() => {
    if (!amActingGuesser) return;
    updateSelection(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, amActingGuesser]);

  useEffect(() => {
    if (!turn) return;

    if (!turn.revealed) {
      setDisplayScores(room.match.scores);
      setRevealedIndices(new Set());
      setTurnScorePopup(null);
      return;
    }

    const delta = turn.scoreDelta ? turn.scoreDelta[turn.actingTeam] : 0;
    const frozen = { ...room.match.scores };
    frozen[turn.actingTeam] -= delta;
    setDisplayScores(frozen);
    setRevealedIndices(new Set());

    const timers: ReturnType<typeof setTimeout>[] = [];
    const selectedIdx = turn.selected ?? [];
    let revealFinishedAt = 0;

    // Selected cards flip one at a time first (everyone watches them
    // resolve), then the rest flip together — same sequence for every
    // viewer, since non-guessers already see colors and just get the
    // animation cue while guessers get colors revealed at this pace too.
    selectedIdx.forEach((idx, i) => {
      const at = (i + 1) * STAGGER_MS;
      timers.push(setTimeout(() => setRevealedIndices((prev) => new Set(prev).add(idx)), at));
      revealFinishedAt = at;
    });
    revealFinishedAt += STAGGER_MS;
    timers.push(
      setTimeout(() => setRevealedIndices(new Set(turn.cards.map((_, i) => i))), revealFinishedAt),
    );

    timers.push(
      setTimeout(() => setTurnScorePopup({ team: turn.actingTeam, delta }), revealFinishedAt + POPUP_DELAY_MS),
    );
    timers.push(
      setTimeout(() => {
        setDisplayScores(room.match.scores);
        setTurnScorePopup(null);
      }, revealFinishedAt + POPUP_DELAY_MS + POPUP_DURATION_MS),
    );

    return () => timers.forEach(clearTimeout);
    // Deliberately only re-runs on a turn/reveal transition, not whenever
    // scores or cards change — see index.css/BoardScreen animation notes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn?.turnNumber, turn?.revealed]);

  // Detects Pirate's Word Shuffle (word text changing mid-turn, not a fresh
  // deal) and animates the changed slots in one at a time for everyone.
  useEffect(() => {
    if (!turn) return;
    const newWords = turn.cards.map((c) => c.word);
    const isNewTurn = prevTurnNumberRef.current !== turn.turnNumber;
    const prevWords = prevWordsRef.current;

    if (!isNewTurn && prevWords.length === newWords.length) {
      const changedIdx: number[] = [];
      newWords.forEach((w, i) => {
        if (w !== prevWords[i]) changedIdx.push(i);
      });
      if (changedIdx.length > 0) {
        setShuffleWords([...prevWords]);
        const timers: ReturnType<typeof setTimeout>[] = [];
        changedIdx.forEach((idx, i) => {
          timers.push(
            setTimeout(() => {
              setShuffleWords((prev) => {
                const base = prev ?? newWords;
                const next = [...base];
                next[idx] = newWords[idx];
                return next;
              });
            }, (i + 1) * SHUFFLE_STAGGER_MS),
          );
        });
        timers.push(setTimeout(() => setShuffleWords(null), (changedIdx.length + 1) * SHUFFLE_STAGGER_MS));
        prevTurnNumberRef.current = turn.turnNumber;
        prevWordsRef.current = newWords;
        return () => timers.forEach(clearTimeout);
      }
    }

    prevTurnNumberRef.current = turn.turnNumber;
    prevWordsRef.current = newWords;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn?.cards]);

  if (!turn) return null;

  const amActingClueGiver = turn.clueGiverId === myId;
  const clueGiver = room.players.find((p) => p.id === turn.clueGiverId)!;
  const guesser = room.players.find((p) => p.id === turn.guesserId)!;
  const activeDisconnected = [clueGiver, guesser].find((p) => !p.connected);

  const myAbilityDef = me.character ? CHARACTERS[me.character] : null;
  const canUseAbility =
    !turn.revealed &&
    !me.abilityUsed &&
    !!myAbilityDef &&
    ((myAbilityDef.role === 'clueGiver' && amActingClueGiver && turn.clue === null) ||
      (myAbilityDef.role === 'guesser' && amActingGuesser && turn.clue !== null));

  const displaySelected = amActingGuesser ? selected : (turn.liveSelected ?? []);

  function cardColorFor(i: number) {
    if (!turn) return null;
    const raw = turn.cards[i].color;
    if (!turn.revealed || turn.guesserId !== myId) return raw;
    return revealedIndices.has(i) ? raw : null;
  }

  function isTargetable(i: number): boolean {
    if (!targeting || !turn) return false;
    if (me.character === 'ninja') return true;
    if (me.character === 'vampire') return turn.cards[i].color === 'red';
    return false;
  }

  function handleCardClick(index: number) {
    if (!turn || turn.revealed) return;
    if (targeting) {
      if (!isTargetable(index)) return;
      useAbility(index);
      setTargeting(false);
      return;
    }
    if (!amActingGuesser || turn.clue === null || index === turn.sacrificedIndex) return;
    setSelected((prev) => {
      if (prev.includes(index)) return prev.filter((i) => i !== index);
      if (prev.length >= MAX_SELECT) return prev;
      return [...prev, index];
    });
  }

  function handleUseAbility() {
    if (!myAbilityDef) return;
    if (myAbilityDef.needsTarget) {
      setTargeting(true);
      return;
    }
    useAbility();
  }

  const actingDelta = turnScorePopup ? turnScorePopup.delta : null;

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-4 py-8">
      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-ink-muted">
          {turn.isSuddenDeath ? 'Sudden Death' : `Round ${turn.turnNumber} of ${TOTAL_TURNS}`}
        </p>
        <div className="flex items-start justify-between">
          <TeamInfo team="gold" players={room.players.filter((p) => p.team === 'gold')} score={displayScores.gold} acting={turn.actingTeam === 'gold'} />
          <div className="relative mt-4 flex flex-col items-center">
            <p className="font-display text-2xl font-bold text-ink-muted">vs</p>
            {turnScorePopup && (
              <div className="pointer-events-none absolute top-full z-10 mt-1 flex justify-center">
                <p
                  className={`turn-score-anim whitespace-nowrap font-display text-2xl font-bold ${
                    turnScorePopup.team === 'gold' ? 'text-team-gold' : 'text-team-silver'
                  }`}
                >
                  {actingDelta !== null && actingDelta >= 0 ? `+${actingDelta}` : actingDelta}
                </p>
              </div>
            )}
            {!turnScorePopup && turn.lastAbilityUse && (
              <div className="pointer-events-none absolute top-full z-10 mt-1 flex justify-center">
                <p className="announce-anim whitespace-nowrap rounded-full border border-accent bg-surface px-3 py-1 text-xs font-semibold text-accent sm:text-sm">
                  {turn.lastAbilityUse.playerName} is using their ability… {turn.lastAbilityUse.characterName} — {turn.lastAbilityUse.abilityName}
                </p>
              </div>
            )}
          </div>
          <TeamInfo
            team="silver"
            players={room.players.filter((p) => p.team === 'silver')}
            score={displayScores.silver}
            acting={turn.actingTeam === 'silver'}
            align="right"
          />
        </div>
        <p className="mt-4 border-t border-border pt-3 text-center text-sm text-ink-muted">
          {turn.isSuddenDeath ? 'Sudden Death — ' : ''}
          Team {turn.actingTeam === 'gold' ? 'Gold' : 'Silver'} is playing — {clueGiver.name} is giving the clue,{' '}
          {guesser.name} is guessing.
        </p>
      </div>

      {activeDisconnected && (
        <div className="rounded-xl border border-danger bg-surface px-4 py-3 text-center text-danger">
          Waiting for {activeDisconnected.name} to reconnect…
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {turn.cards.map((c, i) => {
          const displayColor = cardColorFor(i);
          const displayWord = shuffleWords ? shuffleWords[i] : c.word;
          // Non-guesser viewers already see every card's true color for the
          // whole turn, so the reveal animation there is purely a "here's
          // what they picked" cue — only the guesser's selected cards ever
          // animate for them, never the rest of the board.
          const isSelectedCard = (turn.selected ?? []).includes(i);
          const pulseToken = amActingGuesser
            ? (revealedIndices.has(i) ? 'R' : 'H')
            : (isSelectedCard && revealedIndices.has(i) ? 'R' : 'H');
          return (
            <WordCard
              key={`${i}-${displayColor ?? 'hidden'}-${displayWord}-${pulseToken}`}
              word={displayWord}
              color={displayColor}
              slow={isSelectedCard}
              selectable={
                !turn.revealed &&
                (isTargetable(i) || (amActingGuesser && !targeting && turn.clue !== null && i !== turn.sacrificedIndex))
              }
              selected={displaySelected.includes(i)}
              onClick={() => handleCardClick(i)}
            />
          );
        })}
      </div>

      <ClueBar isClueGiver={amActingClueGiver} clue={turn.clue} onSend={sendClue} />

      {amActingGuesser && !turn.revealed && (
        <div className="flex flex-col items-center gap-2">
          {!turn.clue && <p className="text-sm text-ink-muted">Waiting for the clue before you can guess…</p>}
          <button
            onClick={() => lockIn(selected)}
            disabled={!turn.clue}
            className="rounded-xl bg-accent px-8 py-3 font-display text-lg font-bold text-bg hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            Check ({selected.length}/{MAX_SELECT})
          </button>
        </div>
      )}

      {myAbilityDef && (
        <CharacterAbilityBar
          def={myAbilityDef}
          abilityUsed={me.abilityUsed}
          canUse={canUseAbility}
          targeting={targeting}
          onUse={handleUseAbility}
        />
      )}

      <CardLegend />
    </div>
  );
}

function TeamInfo({
  team,
  players,
  score,
  acting,
  align = 'left',
}: {
  team: Team;
  players: Player[];
  score: number;
  acting: boolean;
  align?: 'left' | 'right';
}) {
  const color = team === 'gold' ? 'text-team-gold' : 'text-team-silver';
  const ring = team === 'gold' ? 'ring-team-gold' : 'ring-team-silver';
  return (
    <div className={`flex flex-col gap-2 ${align === 'right' ? 'items-end text-right' : 'items-start text-left'} ${acting ? 'opacity-100' : 'opacity-60'}`}>
      <p className={`font-display text-sm font-bold uppercase tracking-wide ${color}`}>Team {team === 'gold' ? 'Gold' : 'Silver'}</p>
      <p key={score} className="score-pulse-anim font-display text-3xl font-bold">
        {score}
      </p>
      <div className={`flex gap-3 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
        {players.map((p) => (
          <div key={p.id} className="flex flex-col items-center gap-1">
            <div className={`relative h-11 w-11 overflow-hidden rounded-full bg-surface ring-2 ${ring} ${p.connected ? '' : 'opacity-40 grayscale'}`}>
              {p.character && CHARACTER_PORTRAITS[p.character] ? (
                <img src={CHARACTER_PORTRAITS[p.character]} alt="" className="h-full w-full object-cover brightness-125 contrast-110" />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-display font-bold">
                  {p.name.charAt(0).toUpperCase()}
                </div>
              )}
              {!p.connected && <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-danger ring-2 ring-bg" />}
            </div>
            <span className="max-w-[4.5rem] truncate text-xs">{p.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

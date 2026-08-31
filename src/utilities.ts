import type { Bye, CompletedRound, Game } from '@echecs/tournament';

interface Contribution {
  isVUR: boolean;
  opponentScore: number;
  value: number;
}

const VUR_BYE_KINDS = new Set<Bye['kind']>(['half', 'zero']);

function scoreFor(player: string, game: Game): number {
  if (game.result === 'draw') {
    return 0.5;
  }
  if (game.result === 'none') {
    return 0;
  }
  return (game.result === 'white' && game.white === player) ||
    (game.result === 'black' && game.black === player)
    ? 1
    : 0;
}

function gamesForPlayer(player: string, rounds: CompletedRound[]): Game[] {
  return rounds
    .flatMap((r) => r.games)
    .filter((g) => g.white === player || g.black === player);
}

function byeForPlayer(player: string, round: CompletedRound): Bye | undefined {
  return round.byes.find((b) => b.player === player);
}

function isByeVUR(bye: Bye): boolean {
  return VUR_BYE_KINDS.has(bye.kind);
}

function isForfeitVUR(player: string, game: Game): boolean {
  if (game.forfeit === undefined) {
    return false;
  }
  if (game.forfeit === 'both') {
    return true;
  }
  return (
    (game.forfeit === 'white' && game.white === player) ||
    (game.forfeit === 'black' && game.black === player)
  );
}

function isTerminalBye(
  player: string,
  rounds: CompletedRound[],
  roundIndex: number,
): boolean {
  const remainingRounds = rounds.slice(roundIndex + 1);
  for (const round of remainingRounds) {
    const bye = byeForPlayer(player, round);
    if (bye !== undefined) {
      if (!isByeVUR(bye)) {
        return false;
      }
      continue;
    }
    if (
      round.games.some(
        (g) =>
          (g.white === player || g.black === player) &&
          !isForfeitVUR(player, g),
      )
    ) {
      return false;
    }
  }
  return true;
}

function score(player: string, rounds: CompletedRound[]): number {
  let sum = 0;
  for (const g of gamesForPlayer(player, rounds)) {
    sum += scoreFor(player, g);
  }
  for (const round of rounds) {
    const bye = byeForPlayer(player, round);
    if (bye !== undefined) {
      if (bye.kind === 'full' || bye.kind === 'pairing') {
        sum += 1;
      } else if (bye.kind === 'half') {
        sum += 0.5;
      }
    }
  }
  return sum;
}

function adjustedScore(player: string, rounds: CompletedRound[]): number {
  let sum = 0;
  for (const [roundIndex, round] of rounds.entries()) {
    const bye = byeForPlayer(player, round);
    if (bye !== undefined) {
      if (isByeVUR(bye) && isTerminalBye(player, rounds, roundIndex)) {
        sum += 0.5;
      } else if (bye.kind === 'full' || bye.kind === 'pairing') {
        sum += 1;
      } else if (bye.kind === 'half') {
        sum += 0.5;
      }
      continue;
    }
    const playerGames = round.games.filter(
      (g) => g.white === player || g.black === player,
    );
    for (const g of playerGames) {
      sum += scoreFor(player, g);
    }
  }
  return sum;
}

function dummyScoreForBye(player: string, rounds: CompletedRound[]): number {
  const playerOwnScore = score(player, rounds);
  return Math.min(playerOwnScore, rounds.length * 0.5);
}

function dummyScoreForForfeit(
  player: string,
  rounds: CompletedRound[],
  game: Game,
): number {
  const playerOwnScore = score(player, rounds);
  const opponent = game.white === player ? game.black : game.white;
  return Math.min(playerOwnScore, adjustedScore(opponent, rounds));
}

function cutLeastSignificant(items: Contribution[]): Contribution[] {
  if (items.length === 0) {
    return [...items];
  }
  let leastSignificant: Contribution = items[0] as Contribution;
  for (const c of items) {
    if (
      c.opponentScore < leastSignificant.opponentScore ||
      (c.opponentScore === leastSignificant.opponentScore &&
        c.value < leastSignificant.value)
    ) {
      leastSignificant = c;
    }
  }
  let lowestVUR: Contribution | undefined;
  for (const c of items) {
    if (c.isVUR && (lowestVUR === undefined || c.value < lowestVUR.value)) {
      lowestVUR = c;
    }
  }
  const toCut =
    lowestVUR !== undefined && lowestVUR.value >= leastSignificant.value
      ? lowestVUR
      : leastSignificant;
  const cutIndex = items.indexOf(toCut);
  return items.filter((_, index) => index !== cutIndex);
}

function contributions(
  player: string,
  rounds: CompletedRound[],
): Contribution[] {
  const result: Contribution[] = [];

  for (const round of rounds) {
    const bye = byeForPlayer(player, round);
    if (bye !== undefined) {
      const dummy = dummyScoreForBye(player, rounds);
      const byePoints =
        bye.kind === 'full' || bye.kind === 'pairing'
          ? 1
          : bye.kind === 'half'
            ? 0.5
            : 0;
      result.push({
        isVUR: isByeVUR(bye),
        opponentScore: dummy,
        value: byePoints * dummy,
      });
      continue;
    }

    const playerGames = round.games.filter(
      (g) => g.white === player || g.black === player,
    );
    for (const g of playerGames) {
      const playerResult = scoreFor(player, g);

      if (g.forfeit === undefined) {
        const opponent = g.white === player ? g.black : g.white;
        const adjScore = adjustedScore(opponent, rounds);
        result.push({
          isVUR: false,
          opponentScore: adjScore,
          value: playerResult * adjScore,
        });
      } else {
        const dummy = dummyScoreForForfeit(player, rounds, g);
        result.push({
          isVUR: isForfeitVUR(player, g),
          opponentScore: dummy,
          value: playerResult * dummy,
        });
      }
    }
  }

  return result;
}

export {
  adjustedScore,
  cutLeastSignificant,
  contributions,
  dummyScoreForBye,
  dummyScoreForForfeit,
  gamesForPlayer,
  isTerminalBye,
  score,
  scoreFor,
};

export type { Contribution };

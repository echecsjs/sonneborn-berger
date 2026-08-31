import { contributions, cutLeastSignificant } from './utilities.js';

import type { Tiebreak } from '@echecs/tournament';

const sonnebornBergerCut1: Tiebreak = (player, rounds, _players) =>
  cutLeastSignificant(contributions(player, rounds)).reduce(
    (sum, c) => sum + c.value,
    0,
  );

export { sonnebornBergerCut1, sonnebornBergerCut1 as tiebreak };

export type {
  Bye,
  CompletedRound,
  Game,
  Pairing,
  Player,
} from '@echecs/tournament';

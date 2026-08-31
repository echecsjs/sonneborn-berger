import { contributions, cutLeastSignificant } from './utilities.js';

import type { Tiebreak } from '@echecs/tournament';

const sonnebornBergerCut2: Tiebreak = (player, rounds, _players) =>
  cutLeastSignificant(
    cutLeastSignificant(contributions(player, rounds)),
  ).reduce((sum, c) => sum + c.value, 0);

export { sonnebornBergerCut2, sonnebornBergerCut2 as tiebreak };

export type {
  Bye,
  CompletedRound,
  Game,
  Pairing,
  Player,
} from '@echecs/tournament';

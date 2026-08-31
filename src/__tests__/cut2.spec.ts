import { describe, expect, it } from 'vitest';

import { sonnebornBergerCut1 } from '../cut1.js';
import { sonnebornBergerCut2 } from '../cut2.js';

import type { CompletedRound, Player } from '@echecs/tournament';

const PLAYERS: Player[] = [
  { id: 'A', points: 2.5, rank: 1 },
  { id: 'B', points: 1.5, rank: 2 },
  { id: 'C', points: 1.5, rank: 3 },
  { id: 'D', points: 0.5, rank: 4 },
];

const ROUNDS: CompletedRound[] = [
  {
    byes: [],
    games: [
      { black: 'B', result: 'white', white: 'A' },
      { black: 'D', result: 'draw', white: 'C' },
    ],
  },
  {
    byes: [],
    games: [
      { black: 'C', result: 'draw', white: 'A' },
      { black: 'D', result: 'white', white: 'B' },
    ],
  },
  {
    byes: [],
    games: [
      { black: 'D', result: 'white', white: 'A' },
      { black: 'C', result: 'draw', white: 'B' },
    ],
  },
];

const VUR_PLAYERS: Player[] = [
  { id: 'A', points: 2.5, rank: 1 },
  { id: 'B', points: 1.5, rank: 2 },
  { id: 'C', points: 0.5, rank: 4 },
  { id: 'D', points: 1, rank: 3 },
];

const VUR_ROUNDS: CompletedRound[] = [
  {
    byes: [],
    games: [
      { black: 'B', result: 'white', white: 'A' },
      { black: 'D', result: 'draw', white: 'C' },
    ],
  },
  {
    byes: [
      { kind: 'half', player: 'A' },
      { kind: 'zero', player: 'D' },
    ],
    games: [{ black: 'C', result: 'white', white: 'B' }],
  },
  {
    byes: [],
    games: [
      { black: 'C', result: 'white', white: 'A' },
      { black: 'D', result: 'draw', white: 'B' },
    ],
  },
];

describe('sonnebornBergerCut2', () => {
  it('cuts the two least significant contributions', () => {
    expect(sonnebornBergerCut2('A', ROUNDS, PLAYERS)).toBe(1.5);
  });

  it('reapplies the VUR cut-exception on the second cut (FIDE 16.5.2)', () => {
    expect(sonnebornBergerCut2('A', VUR_ROUNDS, VUR_PLAYERS)).toBe(1.5);
  });
});

describe('sonnebornBergerCut1 regression', () => {
  it('keeps existing behaviour via the shared helper', () => {
    expect(sonnebornBergerCut1('A', VUR_ROUNDS, VUR_PLAYERS)).toBe(2);
  });
});

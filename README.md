# Sonneborn-Berger

[![npm](https://img.shields.io/npm/v/@echecs/sonneborn-berger)](https://www.npmjs.com/package/@echecs/sonneborn-berger)
[![Coverage](https://codecov.io/gh/echecsjs/sonneborn-berger/branch/main/graph/badge.svg)](https://codecov.io/gh/echecsjs/sonneborn-berger)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Spec](https://img.shields.io/badge/Spec-FIDE-green.svg)](SPEC.md)

**Sonneborn-Berger** is a TypeScript library implementing the Sonneborn-Berger
tiebreak for chess tournaments, following the
[FIDE Tiebreak Regulations](https://handbook.fide.com/chapter/TieBreakRegulations032026)
(section 9.1). Zero runtime dependencies.

## Installation

```bash
npm install @echecs/sonneborn-berger
```

## Quick Start

```typescript
import { sonnebornBerger } from '@echecs/sonneborn-berger';
import type { Game, GameKind } from '@echecs/sonneborn-berger';

// games[n] = round n+1; Game has no `round` field
const games: Game[][] = [
  [{ black: 'B', result: 1, white: 'A' }], // round 1
  [{ black: 'C', result: 0.5, white: 'A' }], // round 2
  [{ black: 'A', result: 0, white: 'D' }], // round 3
  // Unplayed rounds use kind to classify the bye type (FIDE article 16)
  [{ black: '', kind: 'half-bye', result: 0.5, white: 'A' }], // round 4
];

const score = sonnebornBerger('A', games);
// Returns sum of defeated opponents' scores plus half of drawn opponents' scores
```

## API

All functions accept `(player: string, games: Game[][])` and return `number`.
Round is determined by array position: `games[0]` = round 1, `games[1]` = round
2, etc. The `Game` type has no `round` field.

The optional `kind?: GameKind` field on `Game` classifies unplayed rounds for
FIDE article 16 compliance. Valid values: `'forfeit-loss'`, `'forfeit-win'`,
`'full-bye'`, `'half-bye'`, `'pairing-bye'`, `'zero-bye'`. When absent the game
is treated as a normal over-the-board result.

### Root export (`@echecs/sonneborn-berger`)

```typescript
import { sonnebornBerger, tiebreak } from '@echecs/sonneborn-berger';
import type { Game, GameKind, Player, Result } from '@echecs/sonneborn-berger';
```

#### `sonnebornBerger(player, games)`

**FIDE section 9.1** — Full Sonneborn-Berger score. For each game played by
`player`, adds the final tournament score of the opponent multiplied by the
result (1 for a win, 0.5 for a draw, 0 for a loss). Byes are excluded. Primarily
used in round-robin tournaments. Compliant with FIDE article 16 unplayed rounds
management when `kind` is present on games.

`tiebreak` is an alias for `sonnebornBerger`.

### `/cut1` subpath export (`@echecs/sonneborn-berger/cut1`)

```typescript
import { sonnebornBergerCut1, tiebreak } from '@echecs/sonneborn-berger/cut1';
import type {
  Game,
  GameKind,
  Player,
  Result,
} from '@echecs/sonneborn-berger/cut1';
```

#### `sonnebornBergerCut1(player, games)`

**FIDE section 9.1** — Sonneborn-Berger minus the lowest-contributing opponent.
Computes all per-opponent contributions and removes the one with the smallest
value before summing. Returns `0` when no games have been played.

`tiebreak` is an alias for `sonnebornBergerCut1`.

### `/cut2` subpath export (`@echecs/sonneborn-berger/cut2`)

```typescript
import { sonnebornBergerCut2, tiebreak } from '@echecs/sonneborn-berger/cut2';
import type {
  Game,
  GameKind,
  Player,
  Result,
} from '@echecs/sonneborn-berger/cut2';
```

#### `sonnebornBergerCut2(player, games)`

**FIDE section 9.1** — Sonneborn-Berger minus the two lowest-contributing
opponents (FIDE C.07 9.1 + 14.2). Computes all per-opponent contributions and
removes the two with the smallest values before summing, reapplying the
Cut-Exception (FIDE 16.5.2) at each cut so VUR contributions are prioritised for
removal. Returns `0` when no games have been played.

`tiebreak` is an alias for `sonnebornBergerCut2`.

## License

MIT

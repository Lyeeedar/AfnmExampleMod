---
layout: default
title: Local Map Items
parent: Item Types
grand_parent: Item System
nav_order: 22
---

# Local Map Items

Local map items give players access to a sequence of sequential combat encounters — similar in spirit to PoE-style maps. Using one opens a run of fights scaled to the player's current realm, with optional modifiers that increase difficulty and scale up drop rewards.

## Interface

```typescript
interface LocalMapItem extends ItemBase {
  kind: 'local_map';

  /** Cultivation realm this map targets. Must match the location's realm. */
  realm: Realm;

  /** Number of sequential fights triggered when the map is used. */
  encounterCount: { min: number; max: number };

  /**
   * Optional modifier that enhances enemies and scales up rewards.
   * Omit for a plain map with no enemy enhancements.
   */
  modifier?: LocalMapModifier;
}
```

## LocalMapModifier

A modifier toughens every enemy in the run and scales the loot:

```typescript
interface LocalMapModifier {
  /** Display name shown in the UI (e.g. "Bulwark", "Frenzied"). */
  name: string;

  /** Multiplier applied to non-core drops and shard rewards. */
  yieldMult: number;

  /** Added to the enemy's HP stat multiplier. */
  hpBonus: number;

  /** Added to the enemy's power stat multiplier. */
  powerBonus: number;

  /** Pool of buffs to draw from — a random subset is applied to each enemy. */
  buffPool: Buff[];

  /** Minimum number of buffs drawn from the pool per enemy. */
  minBuffs: number;

  /** Maximum number of buffs drawn from the pool per enemy. */
  maxBuffs: number;
}
```

Modifier effects applied at runtime to each enemy in the run:

- `statMultipliers.hp` increased by `hpBonus`
- `statMultipliers.power` increased by `powerBonus`
- `imageScale` increased by 15%
- A random draw of `minBuffs`–`maxBuffs` buffs from `buffPool` added to the enemy's `spawnCondition.buffs`
- All non-Spirit Core, non-trophy drops multiplied by `yieldMult`
- `shardMult` multiplied by `yieldMult`
- All phases are modified identically to the root enemy

## Defining a Local Map

### Plain map (no modifier)

```typescript
import { LocalMapItem } from '../types/item';
import mapIcon from '../assets/item/myMap.png';

export const scoutMap: LocalMapItem = {
  kind: 'local_map',
  name: 'Scout Map Fragment',
  description: { text: 'A crudely marked chart of the outer ranges.' },
  icon: mapIcon,
  rarity: 'qitouched',
  realm: 'qiCondensation',
  encounterCount: { min: 3, max: 5 },
  stacks: 1,
};
```

### Modified map

```typescript
import { LocalMapItem, LocalMapModifier } from '../types/item';
import { Buff } from '../types/buff';
import mapIcon from '../assets/item/eliteMap.png';
import buffIcon from '../assets/item/eliteMapBuff.png';

const enragedBuff: Buff = {
  name: 'Enraged',
  icon: buffIcon,
  canStack: false,
  stats: {
    power: { value: 0.25, stat: 'power' },
  },
  stacks: 1,
};

const wrathfulModifier: LocalMapModifier = {
  name: 'Wrathful',
  yieldMult: 2.5,
  hpBonus: 0.2,
  powerBonus: 0.5,
  buffPool: [enragedBuff],
  minBuffs: 1,
  maxBuffs: 1,
};

export const wrathfulMap: LocalMapItem = {
  kind: 'local_map',
  name: 'Wrathful Territory Map',
  description: { text: 'The red ink is unmistakably blood.' },
  icon: mapIcon,
  rarity: 'empowered',
  realm: 'meridianOpening',
  encounterCount: { min: 5, max: 8 },
  modifier: wrathfulModifier,
  stacks: 1,
};
```

## Built-in Modifiers

The game ships three modifier presets in `src/util/localMapModifiers.ts`. Import them directly when your map fits one of these archetypes:

| Export             | `name`     | `yieldMult` | `hpBonus` | `powerBonus` | Buff draws | Flavour                  |
| ------------------ | ---------- | ----------- | --------- | ------------ | ---------- | ------------------------ |
| `bulwarkModifier`  | `Bulwark`  | ×2          | +0.4      | +0.1         | 2–4        | Armoured, tanky          |
| `frenziedModifier` | `Frenzied` | ×2          | +0.15     | +0.4         | 2–4        | Aggressive, high offence |
| `ancientModifier`  | `Ancient`  | ×3          | +0.6      | +0.5         | 3–5        | Hardest all-round        |

```typescript
import { bulwarkModifier } from '../../util/localMapModifiers';

export const bulwarkMap: LocalMapItem = {
  kind: 'local_map',
  name: 'Bulwark Territory Scroll',
  description: { text: 'Fortified beasts hold this ground.' },
  icon: bulwarkScrollIcon,
  rarity: 'empowered',
  realm: 'coreFormation',
  encounterCount: { min: 4, max: 6 },
  modifier: bulwarkModifier,
  stacks: 1,
};
```

## Design Notes

- **`encounterCount`**: A range of `{ min: 3, max: 6 }` is a comfortable default. Very short runs (min 1) feel underwhelming; very long runs (max 15+) risk fatigue without proportional reward.
- **`yieldMult`**: Scale it with difficulty. A modifier adding +0.5 power warrants at least ×2; +1.0+ power warrants ×3 or more.
- **`buffPool` size**: A pool of 4–6 buffs with `minBuffs: 2` and `maxBuffs: 4` gives each run distinct character. Pools smaller than `maxBuffs` will apply all available buffs every run.
- **Spirit Cores and trophies** are excluded from the `yieldMult` multiplier — only material-type drops are scaled up.

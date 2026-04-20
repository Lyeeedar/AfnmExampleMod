---
layout: default
title: Local Map Items
parent: Item Types
grand_parent: Item System
nav_order: 21
---

# Local Map Items

Local map items send the player into a sequential series of combat encounters against beasts. They are the primary driver of the local map system, where the player clears a series of fights at a specific realm to earn drops and cultivation resources.

## Interface

```typescript
export interface LocalMapItem extends ItemBase {
  kind: 'local_map';
  realm: Realm;
  encounterCount: { min: number; max: number };
  modifier?: LocalMapModifier;
}
```

**Fields**:
- `realm` — The cultivation realm this map applies to. Must match the realm tier of the location where it is used.
- `encounterCount` — Number of sequential fights generated when the map is activated. The actual count is chosen randomly between `min` and `max` inclusive.
- `modifier` — Optional. If present, applies stat bonuses and buff pools to each enemy, and scales up the drop yield. If absent, fights are plain encounters with no modifications.

## LocalMapModifier

```typescript
export interface LocalMapModifier {
  name: string;
  displayName?: Translatable;
  yieldMult: number;
  hpBonus: number;
  powerBonus: number;
  buffPool: Buff[];
  minBuffs: number;
  maxBuffs: number;
}
```

**Fields**:
- `name` — Internal identifier for the modifier.
- `displayName` — Optional translated display name shown in the UI.
- `yieldMult` — Multiplier applied to all drops and shard rewards from the encounter chain.
- `hpBonus` — Flat bonus added to the HP stat multiplier of each enemy.
- `powerBonus` — Flat bonus added to the power stat multiplier of each enemy.
- `buffPool` — Array of buffs to draw from. Each enemy receives a random subset.
- `minBuffs` — Minimum number of buffs drawn from the pool per enemy.
- `maxBuffs` — Maximum number of buffs drawn from the pool per enemy.

## Built-in Modifiers

The game ships three modifiers in `src/util/localMapModifiers.ts` that you can import in your mod:

```typescript
import { bulwarkModifier, frenziedModifier, ancientModifier } from 'afnm/util/localMapModifiers';
```

- **bulwarkModifier** — Fortified beasts with high defense, barrier generation, and school resistances. Good for defensive challenge maps.
- **frenziedModifier** — Aggressive beasts with high power and offensive buffs. Good for high-risk, high-reward maps.
- **ancientModifier** — Ancient beasts with balanced boosts and unique ability pools. For end-game challenge content.

You can also define custom modifiers by constructing a `LocalMapModifier` object directly.

## Registration

Register a local map item with the game using `addItem`:

```typescript
window.modAPI.actions.addItem(myLocalMap);
```

Once registered, distribute it through shops, auctions, or event steps as you would any other item.

## Examples

### Standard scout map (no modifier)

```typescript
import { LocalMapItem } from 'afnm/types';
import mapIcon from './assets/my-map.png';

export const thornwoodScoutMap: LocalMapItem = {
  kind: 'local_map',
  name: 'Thornwood Scout Map',
  description: 'A rough sketch of beast territory in the Thornwood. The marks are dense near the eastern ridge.',
  icon: mapIcon,
  stacks: 1,
  rarity: 'mundane',
  realm: 'bodyForging',
  encounterCount: { min: 10, max: 14 },
};
```

### Modified map using a custom modifier

```typescript
import { LocalMapItem, LocalMapModifier } from 'afnm/types';
import { myCustomBuff } from './buffs';
import mapIcon from './assets/cursed-map.png';

const cursedModifier: LocalMapModifier = {
  name: 'Cursed',
  yieldMult: 1.5,
  hpBonus: 5,
  powerBonus: 8,
  buffPool: [myCustomBuff],
  minBuffs: 1,
  maxBuffs: 2,
};

export const cursedGroveMap: LocalMapItem = {
  kind: 'local_map',
  name: 'Cursed Grove Map',
  description: 'The ink runs in strange directions. The creatures marked here are wrong in ways that resist easy description.',
  icon: mapIcon,
  stacks: 1,
  rarity: 'qitouched',
  realm: 'meridianOpening',
  encounterCount: { min: 8, max: 12 },
  modifier: cursedModifier,
};
```

### Using a built-in modifier

```typescript
import { bulwarkModifier } from 'afnm/util/localMapModifiers';
import mapIcon from './assets/bulwark-map.png';

export const fortressMap: LocalMapItem = {
  kind: 'local_map',
  name: 'Fortress Den Map',
  description: 'Thick walls, thick hides. The creatures inside have been growing for decades.',
  icon: mapIcon,
  stacks: 1,
  rarity: 'qitouched',
  realm: 'qiCondensation',
  encounterCount: { min: 11, max: 15 },
  modifier: bulwarkModifier,
};

window.modAPI.actions.addItem(fortressMap);
window.modAPI.actions.addItemToShop(fortressMap, 3, 'Nine Mountain Sect', 'qiCondensation');
```

## Design Notes

- **No modifier = easier, lower reward.** Scout maps are the baseline: straightforward fights, no buff penalties, standard drop rates.
- **Higher `yieldMult` justifies harder maps.** If enemies are tankier or hit harder, increase `yieldMult` to compensate. A common range is `1.3` to `2.0` for modified maps.
- **Keep `encounterCount` ranges tight.** A spread of 4–5 (e.g. `min: 10, max: 14`) gives meaningful variance without making the map feel unpredictable.
- **`realm` gates map use.** A player below the required realm cannot activate the map. Match the realm to the encounter difficulty.

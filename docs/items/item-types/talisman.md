---
layout: default
title: Talisman
parent: Item Types
grand_parent: Item System
nav_order: 13
---

# Talisman Items

Combat accessories that provide buffs during battles.

## Interface

```typescript
interface TalismanItem extends ItemBase {
  kind: 'talisman';
  buffs: { buff: Buff; buffStacks: Scaling }[];
  upgradeHarmonies?: Record<HarmonyType, HarmonyUpgrade[]>;
}
```

## Properties

- **buffs**: Array of buffs to apply during combat
- **buffStacks**: Uses Scaling to determine how many stacks to apply
- **upgradeHarmonies**: Optional harmony upgrades that modify the talisman's stats. Keys are `HarmonyType` values (`'eccentricDecree'`, `'alchemical'`, `'enhancingEcho'`). Each entry is an array of upgrades applied when the talisman is attuned through that harmony type. See [Harmony Stat Step](#harmony-stat-step) and [Harmony Stat Upgrade](#harmony-stat-upgrade) below.

## Example

```typescript
export const powerTalisman: TalismanItem = {
  kind: 'talisman',
  name: 'Power Talisman',
  description: 'Increases combat power.',
  icon: talismanIcon,
  stacks: 1,
  rarity: 'qitouched',
  realm: 'qiCondensation',
  buffs: [
    {
      buff: powerBuff,
      buffStacks: { value: 3, stat: undefined }
    }
  ]
};
```

## Enchantments

Talismans can be enchanted to modify their properties:

```typescript
interface TalismanEnchantment extends Enchantment {
  itemKind: 'talisman';
  combatStats: Partial<CombatStatsMap>;
  buffs?: { buff: Buff; buffStacks: Scaling }[];
}
```

## Harmony Stat Step

Adds a ranked step upgrade to a numeric field on the talisman's buff. Use when each rank of the harmony should add a fixed value:

```typescript
import { harmonyStatStep } from '../../../util/harmonyUpgradeHelpers';

export const recursionTalismanS: TalismanItem = {
  kind: 'talisman',
  name: 'Recursion Talisman S',
  // ...
  buffs: [
    {
      buff: makeRecursionBuff('Recursion S', 10, { procs: 'procs', limit: 'recursionLimit' }),
      buffStacks: { value: 1, stat: undefined },
    },
  ],
  upgradeHarmonies: {
    alchemical: [
      harmonyStatStep('procs', 'Activations', 13, {
        step: 1,
        exclusive: true,
        tooltip: 'Each <name>Formation</name> activation repeats <num>{change}</num> more time(s)',
      }),
    ],
    enhancingEcho: [
      harmonyStatStep('recursionLimit', 'Formation Part Limit', 13, {
        step: 1,
        exclusive: true,
      }),
    ],
  },
};
```

Parameters:
- **`fieldKey`** — The buff field name to modify, for example 'procs' or 'amount'
- **`displayName`** — Human-readable name for the step shown in the UI
- **`steps`** — Number of ranks in this step track
- **`opts.step`** — Numeric increment per rank
- **`opts.exclusive`** — When true, only the highest unlocked rank applies (no cumulative stacking)
- **`opts.tooltip`** — Optional formatted tooltip string with {change} placeholder for the per-rank value

## Harmony Stat Upgrade

Adds a continuous upgrade to a buff stat field. Use when the harmony should scale a stat percentage without discrete steps:

```typescript
import { harmonyStatUpgrade } from '../../../util/harmonyUpgradeHelpers';

upgradeHarmonies: {
  eccentricDecree: [
    harmonyStatUpgrade('itemEffectiveness', 'Item Effectiveness', {
      tooltip: 'Increase <name>Item Effectiveness</name> by <num>{change}%</num>',
    }),
  ],
},
```

Parameters:
- **`statKey`** — The stat field on the buff's Scaling object to upgrade
- **`displayName`** — Human-readable name
- **`opts.tooltip`** — Optional formatted tooltip with {change} for the per-rank increment

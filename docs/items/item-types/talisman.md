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
  buffs: {
    buff: Buff;
    buffStacks: Scaling;
  }[];
  upgradeHarmonies?: Partial<Record<RecipeHarmonyType, ItemHarmonyUpgrade[]>>;
}
```

## Properties

- **buffs**: Array of buffs to apply during combat
- **buffStacks**: Uses Scaling to determine how many stacks to apply
- **upgradeHarmonies**: Optional harmony upgrade mappings for sublime-quality talismans. Secondary effects on the talisman's buffs can be tagged with `upgradeKey` in the buff's Scaling fields, then mapped to harmony types here so they scale with crafting quality. See `docs/items/item-types/clothing.md` for the full harmony upgrade helpers and mapping syntax.

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

## Harmony Upgrades

Talismans with secondary effects (e.g. a barrier-to-temporary-health conversion) can expose those effects to the crafting harmony system. Tag the relevant Scaling field with `upgradeKey`, then map harmony types to upgrade keys on the item:

```typescript
import { harmonyStatUpgrade } from 'afnm-types';

const sublimeHarmonies: TalismanItem['upgradeHarmonies'] = {
  resonance: harmonyStatUpgrade('tempHpBoost', 'Temporary Health Boost'),
  forge: harmonyStatUpgrade('barrierConversion', 'Barrier to Temporary Health'),
};

export const goldTalisman: TalismanItem = {
  kind: 'talisman',
  name: 'Gold Talisman',
  // ...
  buffs: [{
    buff: {
      // ...
      stats: {
        temphpBoost: {
          value: 10,
          upgradeKey: 'tempHpBoost',
        },
      },
    },
    buffStacks: { value: 1, stat: undefined },
  }],
  upgradeHarmonies: sublimeHarmonies,
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
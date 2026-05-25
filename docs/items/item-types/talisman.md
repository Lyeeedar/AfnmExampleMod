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
}
```

## Properties

- **buffs**: Array of buffs to apply during combat
- **buffStacks**: Uses Scaling to determine how many stacks to apply

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

## Realm-Specific Talismans

Talismans can be gated to specific realms and sold through token currency systems in markets. The `tokenCurrency.tokenStock` field uses a realm-keyed object where items from all realms up to and including the player's current realm are shown:

```typescript
// In a market building's tokenCurrency
tokenCurrency: {
  currencyItem: serpentToken,
  tokenStock: {
    pillarCreation: [
      { item: { ...jadeSerpentTransportSeal, stacks: 9 }, tokenCost: 1 },
      { item: { ...yuMaiDelverTalismanV, stacks: 1 }, tokenCost: 9 },
    ],
    lifeFlourishing: [
      { item: { ...yuMaiDelverTalismanVI, stacks: 1 }, tokenCost: 15 },
    ],
    // Higher realms show no items
    worldShaping: [],
    innerGenesis: [],
    soulAscension: [],
  },
}
```

The game iterates through realms in order and includes items from all realms up to the player's current realm. This pattern allows different items to appear at different progression stages.

## Combat Behavior

Talismans apply their buffs when combat begins. Each talisman in the player's inventory with a valid `buff` will apply those buffs to the player entity at the start of each combat encounter.

A talisman that provides `bloomResistance` (negating stacks of `bloomExposure` at combat start) could be implemented as:

```typescript
const bloomResistance: Buff = {
  name: 'Bloom Resistance',
  icon: bloomIcon,
  canStack: true,
  stats: undefined,
  tooltip: 'At the start of combat, negates one stack of <name>Bloom Exposure</name> per stack.',
  onCombatStartEffects: [
    {
      kind: 'consumeSelf',
      buff: bloomExposure,
      amount: { value: 1, stat: undefined, scaling: 'stacks' },
    },
    {
      kind: 'negate',
    },
  ],
  stacks: 1,
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

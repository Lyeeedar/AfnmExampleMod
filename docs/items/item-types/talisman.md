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

## Balance Note

The `buffStacks` value in a talisman's `Scaling` is capped at a maximum of **5 stacks** per unique buff, regardless of the `value` set. For example, a talisman granting `Alchemic Synergy` with `buffStacks: { value: 10, stat: 0 }` will apply at most 5 stacks. This cap applies uniformly to all talismans, including base-game ones. If you are creating custom talismans that grant stacking buffs, keep this cap in mind when designing balance.

## Enchantments

Talismans can be enchanted to modify their properties:

```typescript
interface TalismanEnchantment extends Enchantment {
  itemKind: 'talisman';
  combatStats: Partial<CombatStatsMap>;
  buffs?: { buff: Buff; buffStacks: Scaling }[];
}
```

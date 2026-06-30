---
layout: default
title: Mount
parent: Item Types
grand_parent: Item System
nav_order: 18
---

# Mount Items

Transportation equipment providing travel speed and bonuses.

## Interface

```typescript
interface MountItem extends ItemBase {
  kind: 'mount';
  speed: number;
  charisma?: number;
  masteryPoints?: number;
  qiAbsorption?: number;
  buffs?: { buff: Buff; buffStacks: Scaling; condition?: Condition }[];
}
```

## Properties

- **speed**: Travel speed multiplier
- **charisma**: Optional social stat bonus
- **masteryPoints**: Optional mastery point generation
- **qiAbsorption**: Optional qi regeneration during travel
- **buffs**: Buffs to apply at the start of each combat. Each entry can optionally include a `condition` that must be met for the buff to be applied.

## Buffs on Mounts

Mounts can grant buffs to the player at the start of each combat encounter. The buffs are applied with the stack count specified by `buffStacks`.

A common pattern for time-limited buffs is a **countdown buff**: a buff with `canStack: true`, an initial `stacks` value equal to the desired duration in rounds, and an `onRoundEffects` entry of `{ kind: 'add', amount: { value: -1, stat: undefined } }`. Each round, the stack count decrements by 1. When stacks reach 1, the buff expires.

```typescript
// Example: a 3-round combat buff granted by a mount
const vigorBlessing: Buff = {
  name: 'Vigor Blessing',
  icon: vigorIcon,
  canStack: true,          // allows multiple stacks
  stats: {
    power: { value: 0.15, stat: 'power' },
  },
  onRoundEffects: [
    { kind: 'add', amount: { value: -1, stat: undefined } }, // decrement stacks each round
  ],
  stacks: 3,               // starts at 3, expires after 3 rounds
};

export const swiftSteed: MountItem = {
  kind: 'mount',
  name: 'Swift Steed',
  description: 'A loyal steed blessed with vigor.',
  icon: steedIcon,
  stacks: 1,
  rarity: 'empowered',
  realm: 'qiCondensation',
  speed: 200,
  buffs: [
    { buff: vigorBlessing, buffStacks: { value: 1, stat: undefined } },
  ],
};
```

## Example

```typescript
export const windHorse: MountItem = {
  kind: 'mount',
  name: 'Wind Horse',
  description: 'Swift mount with wind affinity.',
  icon: horseIcon,
  stacks: 1,
  rarity: 'qitouched',
  realm: 'qiCondensation',
  speed: 150,
  charisma: 10,
  qiAbsorption: 5
};
```

## Enchantments

```typescript
interface MountEnchantment extends Enchantment {
  itemKind: 'mount';
  charisma?: number;
  speed?: number;
}
```

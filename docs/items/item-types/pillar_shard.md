---
layout: default
title: Pillar Shard
parent: Item Types
grand_parent: Item System
nav_order: 8
---

# Pillar Shard Items

Crystalline fragments for soul pillar construction in Pillar Creation realm.

## Interface

```typescript
export interface PillarShardItem extends ItemBase {
  kind: 'pillar_shard';
  tooltip: Translatable;        // Functional description
  maxInstances?: number;        // Maximum allowed in pillar
  stability?: number;           // Modifies pillar stability when placed (negative = unstable)

  variants?: PillarShardVariant[];  // Customizable options

  // Portal mechanic: entrance collects beams, exit emits them elsewhere
  // The variant index determines the portal channel (entrance index N connects to exit index N)
  portal?: {
    type: 'entrance' | 'exit';
  };

  // Network connectivity
  inputs?: {
    left?: number;
    right?: number;
    bottom?: number;
    top?: number;
  };
  output?: {
    mode: 'flat' | 'multiply' | 'add';
    left: number;
    top: number;
    right: number;
    bottom: number;
  };
}

export interface PillarShardVariant {
  title: string;
  displayName?: Translatable;
  icon: string;

  physicalStats?: Partial<Record<PhysicalStatistic, number>>;
  socialStats?: Partial<Record<SocialStatistic, number>>;
  combatBuffs?: { buff: Buff; buffStacks: Scaling }[];
  craftingBuffs?: { buff: CraftingBuff; buffStacks: Scaling }[];
  dropletRegen?: number;
  maxDroplets?: number;
}
```

## Key Properties

- **tooltip**: Describes shard functionality
- **maxInstances**: Prevents overuse in pillar construction
- **stability**: Adjusts pillar stability when this shard is placed (negative values decrease stability)
- **variants**: Multiple configurations for same shard base; the player chooses one when placing the shard in their pillar
- **portal**: Marks the shard as a portal entrance or exit — entrances absorb qither from below and route it to all matching-colour exit shards on the pillar
- **inputs/output**: Network connectivity for energy flow

## Combat-Active Pillar Shards

Some pillar shards grant combat buffs during fights rather than (or in addition to) pillar network effects. These shards use the `variants` field with `combatBuffs` to define the buffs they provide. The `buffStacks` field uses the `Scaling` interface — supply `{ value: N, stat: undefined }` for a flat N stacks:

```typescript
export const sixfoldAttunementShard: PillarShardItem = {
  kind: 'pillar_shard',
  tooltip: 'Grants the following effect during combat...',
  inputs: { bottom: 6 },
  name: 'Sixfold Attunement Shard',
  variants: [
    {
      title: 'Sixfold Attunement Shard',
      icon: iconAsset,
      combatBuffs: [
        {
          buff: sixfoldAttunementBuff,
          buffStacks: {
            value: 1,
            stat: undefined,
          },
        },
      ],
    },
  ],
  stability: -50,
  maxInstances: 1,
  icon: iconAsset,
  stacks: 1,
  rarity: 'transcendent',
  realm: 'pillarCreation',
};
```

## Portal Mechanic

Portal shards route qither between non-adjacent positions on the pillar. Each entrance–exit pair is colour-coded: an entrance at variant index N connects to the exit at the same variant index. Multiple entrances of the same colour pool their power before splitting it equally across all matching exits.

```typescript
// Portal entrance — absorbs from bottom, routes to matching exits
export const portalEntrance: PillarShardItem = {
  kind: 'pillar_shard',
  portal: { type: 'entrance' },
  tooltip: 'Absorbs qither from below and sends it to matching Portal Exit shards.',
  inputs: { bottom: 1 },
  name: 'Portal Entrance',
  variants: [
    { title: 'Vermillion', icon: vermillionIcon },
    { title: 'Azure',      icon: azureIcon },
  ],
  // ...other required fields
};

// Portal exit — emits the received qither upwards
export const portalExit: PillarShardItem = {
  kind: 'pillar_shard',
  portal: { type: 'exit' },
  tooltip: 'Emits qither received from matching Portal Entrance shards.',
  output: { mode: 'flat', top: 0, left: 0, right: 0, bottom: 0 }, // power set at runtime
  name: 'Portal Exit',
  variants: [
    { title: 'Vermillion', icon: vermillionExitIcon },
    { title: 'Azure',      icon: azureExitIcon },
  ],
  // ...other required fields
};
```

## Examples

```typescript
// Simple enhancement shard
export const enhancer: PillarShardItem = {
  kind: 'pillar_shard',
  tooltip: 'Strengthens the qither beam by 1.',
  inputs: { bottom: 1 },
  output: {
    mode: 'add',
    left: 0,
    top: 1,
    right: 0,
    bottom: 0,
  },
  maxInstances: 5,
  name: 'Tigao Shard',
  description: 'What qitheric energy is, and how it interacts with the world, is still a mystery to many.',
  icon: icon,
  stacks: 1,
  rarity: 'transcendent',
  realm: 'pillarCreation',
};

// Splitting/routing shard
export const tSplitter: PillarShardItem = {
  kind: 'pillar_shard',
  tooltip: 'Splits the qither beam in two.',
  inputs: { bottom: 2 },
  output: {
    mode: 'multiply',
    left: 0.5,
    top: 0,
    right: 0.5,
    bottom: 0,
  },
  name: 'Fenli Shard (Front)',
  description: 'A cultivator\'s soul pillar is formed of three things. Qi, to energise and swell its form. Qither, provided by a primordial source, to give it life. And shards, to absorb the qitheric energy and give the eventual world its shape.',
  icon: icon,
  stacks: 1,
  rarity: 'empowered',
  realm: 'pillarCreation',
};

// Source shard with unique output
export const originFragment: PillarShardItem = {
  kind: 'pillar_shard',
  tooltip: 'Emits 9 Qither. Additionally emits 1 Qither in opposing directions.',
  output: {
    mode: 'flat',
    left: 1,
    top: 9,
    right: 1,
    bottom: 0,
  },
  maxInstances: 1,
  name: 'Origin Fragment',
  description: 'A fragment of something truly fundamental, retrieved from the depths of the Yinying Mine. It feels strangely familiar to the touch, as if you both originated from the same primordial source.',
  icon: icon,
  stacks: 1,
  rarity: 'transcendent',
  realm: 'pillarCreation',
  valueTier: 0,
};
```

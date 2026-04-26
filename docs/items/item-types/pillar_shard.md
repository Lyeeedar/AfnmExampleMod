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
  icon: string;
  physicalStats?: Partial<Record<PhysicalStatistic, number>>;
  socialStats?: Partial<Record<SocialStatistic, number>>;
}
```

## Key Properties

- **tooltip**: Describes shard functionality
- **maxInstances**: Prevents overuse in pillar construction
- **stability**: Adjusts pillar stability when this shard is placed (negative values decrease stability)
- **variants**: Multiple configurations for same shard base
- **portal**: Marks the shard as a portal entrance or exit — entrances absorb qither from below and route it to all matching-colour exit shards on the pillar
- **inputs/output**: Network connectivity for energy flow

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
// Multi-variant combat shard with choices
export const attackGem: PillarShardItem = {
  kind: 'pillar_shard',
  tooltip: 'Grants either +15% Power, +5% Crit Chance, or +50% Crit Damage in combat. The stat affected can be chosen when it is placed.',
  inputs: { bottom: 5 },
  name: 'Expression of Destruction Gem',
  variants: [
    {
      title: 'Power',
      icon: powerIcon,
      combatBuffs: [{
        buff: {
          name: 'Expression of Destruction Gem',
          icon: powerIcon,
          canStack: false,
          stats: { power: { value: 0.15, stat: 'power' } },
          onRoundEffects: [],
          stacks: 1,
        },
        buffStacks: { value: 1, stat: undefined },
      }],
    },
    {
      title: 'Crit Chance',
      icon: critIcon,
      combatBuffs: [{
        buff: {
          name: 'Expression of Destruction Gem',
          icon: critIcon,
          canStack: false,
          stats: { critchance: { value: 5, stat: undefined } },
          onRoundEffects: [],
          stacks: 1,
        },
        buffStacks: { value: 1, stat: undefined },
      }],
    }
  ],
  stability: -10,
  maxInstances: 1,
  description: 'The Jade Forest has long stood as one of the centers of cultivation in the world.',
  icon: powerIcon,
  stacks: 1,
  rarity: 'resplendent',
  realm: 'pillarCreation',
};

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
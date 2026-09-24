---
layout: default
title: Combat Step
parent: Event Step Types
grand_parent: Events System
nav_order: 22
description: 'Initiate combat encounters with enemies'
---

# Combat Step

## Introduction

Initiates turn-based combat encounters with specified enemies and branching outcomes.

## Interface

```typescript
interface CombatStep {
  kind: 'combat';
  condition?: string;
  enemies: EnemyEntity[];
  enemyBuilders?: EnemyBuilderData[];
  playerBuffs?: Buff[];
  numEnemies?: number;
  isSpar?: boolean;
  fromExploration?: boolean;
  soloOnly?: boolean;
  bgm?: string[];
  victory: EventStep[];
  defeat: EventStep[];
}

/** Serializable rules for assembling one enemy from a pool of authored phases. */
interface RandomPhaseEnemyBuilder {
  kind: 'randomPhases';
  options: EnemyEntity[];
  phaseCount: number;
  requiredPools?: EnemyEntity[][];
  finalPool?: EnemyEntity[];
}
```

## Properties

- **`kind`** - Always `'combat'`

- **`enemies`** - Array of enemy entities to fight. Either the full list to fight, or the pool to draw from if `numEnemies` is set.

- **`enemyBuilders`** (optional) - Enemy definitions assembled when combat begins. Use `RandomPhaseEnemyBuilder` to define an enemy whose phase is selected randomly from a pool at combat start. Each builder produces one enemy; combine multiple builders to assemble complex multi-phase enemies from authored pieces.

  ```typescript
  enemyBuilders: [
    {
      kind: 'randomPhases',
      options: [starRivenMawPhase1, starRivenMawPhase2, starRivenMawPhase3],
      phaseCount: 1,
      finalPool: [starRivenMawHeartForm],
    },
  ],
  ```

- **`playerBuffs`** (optional) - Buffs to apply to the player

- **`numEnemies`** (optional) - Number of enemies to spawn. If set, will select this number randomly from the enemies pool

- **`isSpar`** (optional) - Whether this is a sparring match. When `true`, the player's HP and any injuries sustained are restored after combat. However, items and qi droplets consumed during the fight are **not** returned. Use this for training fights and friendly duels where the outcome should not leave the player permanently injured, but should still make them think about what they spend.

- **`fromExploration`** (optional) - Set on wandering-monster combats generated while exploring a location. Gates manifestation combat support, which only accompanies the player during exploration, not arena, spar, or story fights.

- **`soloOnly`** (optional) - When `true`, the fight is a 1-on-1 duel: following-character and expedition-team companion buffs are skipped, so the player faces the enemy alone. Use for solo challenges such as progenitor echoes.

- **`bgm`** (optional) - Background music for combat

- **`victory`** - Steps to execute on victory

- **`defeat`** - Steps to execute on defeat

- **`condition`** (optional) - Conditional execution

## Examples

### Basic Combat

```typescript
{
  kind: 'combat',
  enemies: [
    mountainBear
  ],
  victory: [
    { kind: 'text', text: 'You defeated the mountain bear!' },
    { kind: 'addItem', item: { name: 'BearHide' }, amount: '1' }
  ],
  defeat: [
    { kind: 'text', text: 'The bear overpowers you.' },
  ]
}
```

### Horde battle

```typescript
{
  kind: 'combat',
  enemies: [
    ratascar, ratascar, ratascar
  ],
  victory: [
    { kind: 'text', text: 'You defeat the swarm of ratascar' },
  ],
  defeat: [
    { kind: 'text', text: 'The swarm overwhelms you and you flee' },
  ]
}
```

### Randomised group

```typescript
{
  kind: 'combat',
  enemies: [
    ratascar, gorashi, xingKulei, stellarShard, gravityAnomaly
  ],
  numEnemies: 2,
  victory: [
    { kind: 'text', text: 'You defeat the pair of beasts' },
  ],
  defeat: [
    { kind: 'text', text: 'You lose and run' },
  ]
}
```

### Enemy built from random phases

```typescript
{
  kind: 'combat',
  enemies: [],
  enemyBuilders: [
    {
      kind: 'randomPhases',
      options: [mawPrismForm, mawFilamentForm, mawVeilForm],
      phaseCount: 2,
      finalPool: [mawHeartForm],
    },
  ],
  victory: [
    { kind: 'text', text: 'The Star-Riven Maw collapses.' },
  ],
  defeat: [
    { kind: 'text', text: 'The Maw consumes you.' },
  ],
}
```

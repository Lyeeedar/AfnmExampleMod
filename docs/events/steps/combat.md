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
  enemyBuilders?: RandomPhaseEnemyBuilder[];
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
  firstPool?: EnemyEntity[];
}
```

## Properties

- **`kind`** - Always `'combat'`

- **`enemies`** - Array of enemy entities to fight. Either the full list to fight, or the pool to draw from if `numEnemies` is set.

- **`enemyBuilders`** (optional) - Each builder assembles one multi-phase enemy when this combat step starts. Use this to vary a boss's middle phases while keeping a recognizable opening and finale. Built enemies join the `enemies` list. Multiple builders produce separate enemies, each with its own phases. See [Building a boss with random phases](#building-a-boss-with-random-phases) for configuration and testing.

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

### Building a boss with random phases

First author each form as a complete [EnemyEntity](../../enemies/enemy-structure.md), including its stances, rotation and drops. Give every form a distinct `name`. The variables below represent your own imported enemy definitions. A restrained opening can introduce the boss's mechanic, two interchangeable middle forms can vary the challenge, and a fixed finale can provide a consistent payoff. These are design choices, not required phase roles.

```typescript
const bossFight: CombatStep = {
  kind: 'combat',
  enemies: [],
  enemyBuilders: [
    {
      kind: 'randomPhases',
      options: [openingForm, assaultForm, guardForm, finalForm],
      phaseCount: 4,
      firstPool: [openingForm],
      finalPool: [finalForm],
    },
  ],
  victory: [], // Add your reward and quest-progress steps here.
  defeat: [], // Add your loss outcome here.
};
```

`phaseCount` counts the opening and finale as well as the middle phases. With this example, the opening and finale are fixed and the two middle forms appear in random order. Set `phaseCount: 3` to select only one of those middle forms.

Configure the builder fields as follows:

- `options` is the complete pool of eligible forms. Include every form referenced by any other pool here. Selection removes forms from availability, so a form cannot be selected twice.
- `firstPool` chooses one eligible form for the opening. A single entry fixes the opening, while several entries allow a choice of openers. Omit it to let the opening participate in the shuffled selection.
- `finalPool` chooses one eligible form for the last phase. Omit it to leave the ending unfixed.
- `requiredPools` chooses one available form from each supplied pool. Use it to guarantee a particular kind of middle phase, such as one defensive form. These selections are shuffled with the other unfixed forms, so pool order does not prescribe phase order.
- `phaseCount` must be an integer from `1` to `options.length`. Each supplied opening or finale pool reserves one slot. The number of required pools must fit in the remaining slots.

Keep opening, finale and required pools disjoint unless you have checked that every possible draw leaves an available candidate for each later pool. The opening is chosen first, then the finale, then each required pool. An empty pool or a pool exhausted by an earlier selection causes an error. Supplying both opening and finale pools requires at least two slots.

The assembled enemy uses the opening form as its root and replaces its `phases` with the remaining selected forms. Author standalone forms rather than nesting additional `phases` inside them. Drops from all selected forms are combined on the root, so distribute rewards across forms with the total boss reward in mind.

Put `bossFight` in your event's `steps` and register that event through a [triggered event](../triggered-events.md#location-introduction-event), or include it in a registered location's interaction. Keep `enemies: []` when this builder should supply the whole encounter. Leave `numEnemies` unset when you want to fight every enemy supplied by the step.

On a test save, trigger the encounter repeatedly. Check the opening, each allowed middle order and the finale, then finish the fight to check combined drops and both outcome branches. Also test any optional pool combinations with a smaller `phaseCount` so that every reserved pool still has a slot and an available form.

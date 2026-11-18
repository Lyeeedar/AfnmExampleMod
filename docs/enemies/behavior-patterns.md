---
layout: default
title: Behavior Patterns
parent: Enemies
nav_order: 4
---

# Enemy Behavior Patterns

Understanding enemy AI and stance rotation systems is crucial for creating dynamic, engaging combat encounters. This guide covers the behavior system that drives enemy decision-making.

## Stance System Overview

### How Stances Work

Enemies cycle through predefined stances, each containing a sequence of techniques. The stance system provides:

1. **Predictability**: Players can learn and counter patterns
2. **Variety**: Different stances create tactical diversity
3. **Adaptation**: Conditional rules respond to combat state

### Stance Execution Flow

```
1. At combat setup and after each round, check eligible rotation overrides in order
2. If no override applies, use stance rotation rules
3. Select stance based on rule type (single/random)
4. Execute techniques in order
5. At the end of the round, use the resulting combat state to select the next stance
```

## Rotation Rules

### Single Stance Rule

Deterministic stance selection:

```typescript
interface SingleStance {
  kind: "single";
  condition?: string;
  stance: string;
  repeatable?: boolean;
  alternatives?: StanceRule[];
}
```

### Random Stance Rule

Non-deterministic selection from pool:

```typescript
const randomRotation: StanceRule = {
  kind: 'random',
  stances: ['attack_a', 'attack_b', 'attack_c'],
  condition: 'hp < 0.8 * maxhp',   // When to use this pool
};
```

### Rotation Overrides

Use `EnemyEntity.rotationOverrides` to select a named stance in response to combat state. The first eligible override wins and the normal `stanceRotation` resumes from its pending entry when no override applies. A health threshold reached during a round affects the next stance selection.

For a one-time recovery round, define a stance named `desperate` in `EnemyEntity.stances` with your defensive or healing techniques, then add this property to the enemy:

```typescript
rotationOverrides: [
  {
    kind: 'single',
    stance: 'desperate',
    condition: 'hp < 0.2 * maxhp',
    repeatable: false,
  },
],
```

Omitting `repeatable` has the same effect as setting it to `false`. The override can be selected once for that enemy phase. Use `true` for a response that should remain eligible at each selection while its condition holds. A repeatable override with no condition always qualifies, so place it last if you want more specific overrides to have a chance.

Put the completed [enemy definition](enemy-structure.md#stances) in an [event combat step](../events/steps/combat.md), or register it as a `LocationEnemy` with [`addEnemiesToLocation`](../concepts/modapi.md#modifying-existing-locations). Fight it through the threshold and keep it alive for another round below 20% health. Check that it finishes its current round, uses `desperate` for one round, then resumes the regular rotation. Start a fresh fight with [reduced starting health](enemy-structure.md#spawn-conditions) to check that the override also works as an opener.

## Common Behavior Patterns

### The Berserker

Increasingly aggressive as health decreases:

```typescript
stanceRotation: [
  {
    kind: 'single',
    stance: 'balanced',
    condition: 'hp > 0.5 * maxhp',
  },
  {
    kind: 'single',
    stance: 'aggressive',
    condition: 'hp <= 0.5 * maxhp && hp > 0.25 * maxhp',
  },
  {
    kind: 'single',
    stance: 'berserk',
    condition: 'hp <= 0.25 * maxhp',
  },
];
```

### The Cycler

Predictable pattern rotation:

```typescript
stanceRotation: [
  { kind: 'single', stance: 'setup' },
  { kind: 'single', stance: 'attack' },
  { kind: 'single', stance: 'attack' },
  { kind: 'single', stance: 'recover' },
];
```

### The Chaos Agent

Choose randomly among several defined stances:

```typescript
stanceRotation: [
  {
    kind: 'random',
    stances: ['chaos_a', 'chaos_b', 'chaos_c', 'chaos_d'],
  },
];
```

### The Phaser

Distinct combat phases:

```typescript
// rotationOverrides only accepts SingleStance (kind: 'single').
// Use stanceRotation for random selections; rotationOverrides for conditional phase triggers.
rotationOverrides: [
  // Phase 1: Teaching mechanics
  {
    kind: 'single',
    stance: 'phase1',
    condition: 'hp > 0.66 * maxhp',
    repeatable: true // Allow repeating this stance while the condition is true
  },
  // Phase 2: Increased difficulty (use this stance while in the middle health band)
  {
    kind: 'single',
    stance: 'phase2_a',
    condition: 'hp <= 0.66 * maxhp && hp > 0.33 * maxhp',
    repeatable: true
  },
  // Phase 3: Desperation
  {
    kind: 'single',
    stance: 'phase3_desperate',
    condition: 'hp <= 0.33 * maxhp',
    repeatable: true
  }
]
```

## Conditional Logic

### Available Variables

Variables accessible in condition strings:

**Combat Statistics (Self):**

- `hp` - Current health
- `maxhp` - Maximum health
- `power` - Attack power
- `defense` - Defense value
- `barrier` - Current barrier
- `maxbarrier` - Maximum barrier
- `toxicity` - Current toxicity
- `maxtoxicity` - Maximum toxicity

**Buff Variables:**

- `BuffName` - Stack count of named buff (for example, `Rage` for rage stacks and `0` if absent)
- Use the buff’s expression key. For a name with spaces such as `Iron Shell`, use `Iron_Shell`.

**Target Variables:**

- `target.hp` - Player's current health
- `target.maxhp` - Player's maximum health
- `target.power` - Player's power
- `target.<stat>` - Any combat statistic on the target

### Condition Examples

```typescript
// Health-based
'hp < 0.5 * maxhp'; // Below 50% health
'hp <= 100'; // At or below 100 HP

// Target-based
'target.hp < 0.5 * target.maxhp'; // Player below 50% health
'target.hp > hp'; // Player has more health than enemy

// Buff-based
'Rage >= 3'; // 3+ rage stacks
'Weakened > 0'; // Has weakened debuff
'Strengthened == 0'; // No strengthened buff

// Complex conditions
'hp < 0.3 * maxhp && target.power > power'; // Low health AND player stronger
'barrier > 0 || Shielded > 0'; // Has barrier or shield buff
```

## Advanced Patterns

### Reactive Counters

Respond to player's current state:

```typescript
// React to player's health
rotationOverrides: [
  {
    kind: 'single',
    stance: 'aggressive',
    condition: 'target.hp < 0.3 * target.maxhp', // Player is wounded
    repeatable: true,
  },
  {
    kind: 'single',
    stance: 'defensive',
    condition: 'target.hp > 0.8 * target.maxhp', // Player is healthy
    repeatable: true,
  },
];
```

### Combo Sequences

Build up to powerful finishers:

```typescript
stances: [
  {
    name: 'combo_builder',
    techniques: [
      setup1, // Apply "Combo1" buff
      setup2, // Apply "Combo2" buff
      setup3, // Apply "Combo3" buff
      finisher, // Massive damage if all 3 buffs present
    ],
  },
];
```

### Stat-Based Responses

React to comparative power levels:

```typescript
rotationOverrides: [
  {
    kind: 'single',
    stance: 'cautious',
    condition: 'target.power > power * 1.2', // Player much stronger
    repeatable: true,
  },
  {
    kind: 'single',
    stance: 'bullying',
    condition: 'power > target.power * 1.5', // Enemy much stronger
    repeatable: true,
  },
];
```

### Resource Management

Put the charging stance in the regular rotation. Give the payoff stance a technique that consumes the Energy stacks so the charge condition can clear and the regular rotation can resume.

```typescript
// Build energy stance
{
  name: 'charge_up',
  techniques: [chargeEnergy, chargeEnergy, minorAttack]
},

// Spend energy when enough is built
rotationOverrides: [
  {
    kind: 'single',
    stance: 'unleash_power',
    condition: 'Energy >= 5', // Use buff name directly
    repeatable: true // Eligible whenever a new round is selected with at least 5 stacks
  }
]
```

## Stance Design Best Practices

### Technique Ordering

1. **Opener**: Setup/buff techniques first
2. **Body**: Main damage/effects
3. **Finisher**: Powerful cap or transition

Example:

```typescript
techniques: [
  buff, // Opener
  attack, // Body
  attack, // Body
  heavyAttack, // Finisher
];
```

## Examples

### Tournament Fighter

Strategic cultivator with multiple approaches:

```typescript
{
  stances: [
    { name: 'probe', techniques: [lightAttack, dodge, lightAttack] },
    { name: 'pressure', techniques: [combo1, combo2, combo3] },
    { name: 'finisher', techniques: [lightAttack, ultSetup, ultimate] },
    { name: 'defensive', techniques: [dodge, dodge, dodge] }
  ],
  stanceRotation: [
    { kind: 'single', stance: 'probe' },
    { kind: 'single', stance: 'pressure' },
    { kind: 'single', stance: 'pressure' },
    { kind: 'single', stance: 'finisher' }
  ],
  rotationOverrides: [
    {
      kind: 'single',
      stance: 'defensive',
      condition: 'hp < 0.3 * maxhp',
      repeatable: false
    }
  ]
}
```

### Wild Beast

Instinct-driven creature:

```typescript
{
  stances: [
    { name: 'hunt', techniques: [stalk, pounce, maul] },
    { name: 'feast', techniques: [bite, bite, regenerate] },
    { name: 'flee', techniques: [dodge, retreat, hide] }
  ],
  stanceRotation: [
    {
      kind: 'random',
      stances: ['hunt', 'feast'],
      condition: 'hp > 0.3 * maxhp'
    },
    {
      kind: 'single',
      stance: 'flee',
      condition: 'hp <= 0.3 * maxhp'
    }
  ]
}
```
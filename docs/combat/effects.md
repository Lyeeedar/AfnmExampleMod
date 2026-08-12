---
layout: default
title: Effect Types
parent: Combat System
nav_order: 2
description: 'All available buff effect types with real examples'
---

# Effect Types

Buff effects define what happens when a buff triggers. All effects extend the `BaseBuff` interface and can have optional conditions and trigger keys.

## Base Effect Properties

### `condition`

Optional condition that must be met for the effect to trigger.

### `triggerKey`

Optional key used for triggered effects system.

## Damage Effects

### `damage`

Deals damage to the enemy.

```typescript
{
  kind: 'damage',
  amount: { value: 1.0, stat: 'power' },
  hits?: { value: 3, stat: undefined }, // Optional multiple hits
  damageType?: 'true' | 'corrupt' | 'disruption' // Optional special damage
}
```

**Example from game:**

```typescript
// From a celestial technique
{
  kind: 'damage',
  amount: { value: 0.8, stat: 'power' },
  damageType: 'true'
}
```

### `damageSelf`

Deals damage to yourself.

```typescript
{
  kind: 'damageSelf',
  amount: { value: 0.03, stat: 'maxhp' },
  damageType?: 'true' | 'corrupt' | 'disruption'
}
```

**Example from Profane Exchange:**

```typescript
// Intercept effect that converts corruption into self-damage
{
  kind: 'damageSelf',
  amount: { value: 0.03, stat: 'maxhp', upgradeKey: 'hpCost' },
  damageType: 'true'
}
```

## Healing and Protection

### `heal`

Restores health.

```typescript
{
  kind: 'heal',
  amount: { value: 0.25, stat: 'power' },
  hits?: { value: 2, stat: undefined } // Optional multiple heals
}
```

**Example from Restoring Fragrance:**

```typescript
// After-technique healing
{
  kind: 'heal',
  amount: { value: 0.25, stat: 'power', upgradeKey: 'power' }
}
```

### `barrier`

Grants barrier (damage absorption).

```typescript
{
  kind: 'barrier',
  amount: { value: 0.9, stat: 'power' },
  hits?: { value: 1, stat: undefined }
}
```

**Example from Advancing Fist:**

```typescript
{
  kind: 'barrier',
  amount: { value: 0.9, stat: 'power', upgradeKey: 'barrier' }
}
```

### `repair`

Restores health to barrier-type buffs that have taken damage.

```typescript
{
  kind: 'repair',
  amount: { value: 0.5, stat: 'power' },
  group: 'shield',
  rule: 'lowestHealth'
}
```

**Parameters:**

- **`group`** — Selects which buffs to repair. Matched against the buff's `name`, `buffType`, or any flag set on it (same matching rules as `modifyBuffGroup`).
- **`rule`** — `'all'` repairs every matching buff; `'lowestHealth'` targets the most damaged one; `'highestHealth'` targets the least damaged.

**Example — repair the most damaged shield buff:**

```typescript
{
  kind: 'repair',
  amount: { value: 0.3, stat: 'power' },
  group: 'shield',
  rule: 'lowestHealth'
}
```

## Buff Management

### `buffSelf`

Grants a buff to yourself.

```typescript
{
  kind: 'buffSelf',
  amount: { value: 2, stat: undefined },
  buff: targetBuff,
  instances?: { value: number, stat?: string }, // Number of separate buff instances to create (supports Scaling)
  silent?: true, // Don't show application message
  hideBuff?: true // Don't show buff in tooltips
}
```

### `consumeSelf`

Removes a buff from yourself.

```typescript
{
  kind: 'consumeSelf',
  amount: { value: 1, stat: undefined },
  buff: targetBuff // Can be Buff object or string name
}
```

### `buffTarget`

Gives a buff to the enemy.

```typescript
{
  kind: 'buffTarget',
  amount: { value: 3, stat: undefined },
  buff: debuffBuff,
  hideBuff?: true, // Don't show buff in tooltips
  initialState?: Record<string, Scaling> // Seeds the created buff's internalState (evaluated in this effect's context)
}
```

**New in recent update:** `initialState` seeds the created buff's `internalState` at application time, with each value resolved in the effect's scaling scope. This mirrors the `initialState` field already available on `buffSelf`. It is useful for debuffs that track a value derived from the technique's context — for example, a debuff that stores how much damage was absorbed during the application and exposes it via `stateTooltip`.

### `consumeTarget`

Removes a buff from the enemy.

```typescript
{
  kind: 'consumeTarget',
  amount: { value: 2, stat: undefined },
  buff: enemyBuff
}
```

## Stack Manipulation

### `add`

Adds or removes stacks from the current buff.

```typescript
{
  kind: 'add',
  amount: { value: -1, stat: undefined } // Remove 1 stack
}
```

**Example from Moonchill:**

```typescript
// Consume 1 stack after each technique
{
  kind: 'add',
  amount: { value: -1, stat: undefined }
}
```

### `multiply`

Multiplies the current stack count.

```typescript
{
  kind: 'multiply',
  amount: { value: 2 } // Double stacks (multiply by 2)
}
```

### `negate`

Removes all stacks of the current buff.

```typescript
{
  kind: 'negate';
}
```

### `mergeSelf`

Combines multiple stacks from one buff into fewer stacks of another buff. Unlike `convertSelf` which transfers stacks one-for-one, `mergeSelf` condenses a ratio of source stacks into target stacks.

```typescript
{
  kind: 'mergeSelf',
  source?: sourceBuff, // If omitted, uses the current buff
  sourceStacks: { value: 2, stat: undefined },
  target: targetBuff,
  targetStacks: { value: 1, stat: undefined }
}
```

**Example — condense 2 source stacks into 1 target stack:**

```typescript
{
  kind: 'mergeSelf',
  sourceStacks: { value: 2, stat: undefined },
  target: condensingBuff,
  targetStacks: { value: 1, stat: undefined }
}
```

**Use case**: Efficiency mechanics where lower-tier resource buffs are consolidated into higher-tier forms. For example, a technique that generates multiple weak stacks which should be merged into a single stronger stack rather than accumulating separately.

## Advanced Effects

### `convertSelf`

Converts stacks of one buff into stacks of another buff, one-for-one. Unlike `mergeSelf`, this transfers all available stacks at the point of execution rather than merging by a ratio.

```typescript
{
  kind: 'convertSelf',
  source: sourceBuff,  // Buff to take stacks from
  target: targetBuff,  // Buff to add stacks to
  amount: { value: 1, stat: undefined } // Stacks to convert per application
}
```

**Example — inscription upgrade chain (used in `onRoundEffects`):**

```typescript
{
  kind: 'convertSelf',
  source: baseInscription,
  target: forbiddenInscription,
  amount: { value: 1, stat: undefined },
}
```

**Use case**: Escalating resource mechanics where lower-tier buffs automatically promote to higher-tier versions at the end of each round.

### `setState`

Sets or increments a named state variable that persists for the duration of combat. State variables can be read in conditions using their key name.

```typescript
{
  kind: 'setState',
  key: 'variableName',      // Arbitrary string key
  value: { value: 1, stat: undefined },
  mode?: 'set' | 'add'      // 'set' overwrites, 'add' increments (default: 'set')
}
```

**Example — counting triggers this technique:**

```typescript
// In triggeredBuffEffects — increment counter each time a trigger fires
{
  kind: 'setState',
  key: 'triggersThisTechnique',
  value: { value: 1, stat: undefined },
  mode: 'add',
}

// Reset counter after processing
{
  kind: 'setState',
  key: 'triggersThisTechnique',
  value: { value: 0, stat: undefined },
  mode: 'set',
}
```

Reading the variable in a condition:

```typescript
condition: {
  kind: 'condition',
  condition: 'triggersThisTechnique > 0',
}
```

**Use case**: Tracking counts or flags within a single combat session that drive conditional effects, such as "if this buff triggered more than twice this technique, deal bonus damage."

### `trigger`

Triggers custom events for other systems.

```typescript
{
  kind: 'trigger',
  triggerKey: 'customEvent',
  amount: { value: 1, stat: undefined },
  triggerTooltip?: 'Explanation of what this trigger does'
}
```

### `cleanseToxicity`

Removes or adds toxicity.

```typescript
{
  kind: 'cleanseToxicity',
  amount: { value: 10, stat: undefined } // Positive removes, negative adds
}
```

### `modifyBuffGroup`

Modifies all buffs of a specific group.

```typescript
{
  kind: 'modifyBuffGroup',
  group: 'celestial',
  amount: { value: 1, stat: undefined }
}
```

### `consumeInventoryItem`

Consumes an item from the player's inventory. The effect silently does nothing if the item is not present.

```typescript
{
  kind: 'consumeInventoryItem',
  itemName: 'Qi Replenishing Pill', // Exact display name of the item
  amount: { value: 1, stat: undefined }
}
```

**Use case**: Equipment or mount effects that deplete consumable items as part of their activation (for example, a mount that burns a special pill each round to provide its bonus).

### `permanentStatChange`

Permanently modifies a physical or social statistic on the player. The change takes effect after combat ends. The amount is floored to an integer.

Only applies when the technique is used by the player — enemy techniques with this effect kind are ignored.

```typescript
{
  kind: 'permanentStatChange',
  stat: 'muscles',            // Any PhysicalStatistic or SocialStatistic
  amount: { value: 5, stat: undefined }
}
```

**Valid `stat` values:**

Physical statistics:
- `'flesh'` — Max Health and Barrier Effectiveness
- `'muscles'` — Power and Qi Intensity
- `'meridians'` — Qi Control and Artefact Power
- `'dantian'` — Max Barrier, Max Qi Pool, and Qi Absorption
- `'digestion'` — Toxicity Resistance and Item Effectiveness
- `'eyes'` — Critical Chance and Critical Multiplier

Social statistics:
- `'charisma'` — Presence and shop prices
- `'battlesense'` — Stance count and stance-switch power bonus
- `'craftskill'` — Qi Control and Qi Intensity bonus
- `'artefactslots'` — Number of equippable artefacts
- `'talismanslots'` — Number of equippable talismans
- `'condenseEfficiency'` — Qi to Qi Droplet conversion rate
- `'pillsPerRound'` — Items usable per combat round
- `'age'` — Current age
- `'lifespan'` — Maximum lifespan

**Use case**: Combat consumables that permanently enhance the player's physical or social attributes when used during a fight.

**Example — a pill that permanently boosts muscles by 1:**

```typescript
{
  kind: 'permanentStatChange',
  stat: 'muscles',
  amount: { value: 1, stat: undefined }
}
```

## Scaling System

All effects use the **[Scaling](../concepts/scaling)** interface for amount calculations:

```typescript
interface Scaling {
  value: number; // Base value
  stat?: CombatStatistic; // Stat to scale from
  scaling?: string; // Custom scaling variable (e.g. 'stacks', a buff name)
  eqn?: string; // Expression multiplied onto the result
  additiveEqn?: string; // Expression added to the result (after eqn multiplication)
  max?: Scaling; // Maximum value cap
  upgradeKey?: string; // Reference for upgrades
}
```

The `eqn` field enables complex calculations within the scaling value itself. For example, the Meteor buff uses `eqn` to scale its damage with the meteor's current mass:

```typescript
{
  kind: 'damage',
  amount: {
    value: 3,
    stat: 'power',
    eqn: '1 + (state.mass * 0.2)',  // Base 3x power, plus 20% per mass
  },
}
```

See the [Scaling](../concepts/scaling) docs for the full formula and all available scaling patterns.

### Common Scaling Patterns

**Power Scaling:**

```typescript
amount: { value: 1.2, stat: 'power' }
```

**Stack Scaling:**

```typescript
amount: { value: 0.1, stat: 'power', scaling: 'stacks' }
```

**Percentage of Max HP:**

```typescript
amount: { value: 0.05, stat: 'maxhp' }
```

**Capped Scaling:**

```typescript
amount: {
  value: 0.05,
  stat: 'power',
  scaling: 'stacks',
  max: { value: 1, stat: 'power' }
}
```

## Element Resistance and Amplification

When a technique has one or more element types, the target's resistance for each element is checked. The highest resistance value (positive or negative) is selected and applied to the damage:

- **Positive resistance** reduces incoming damage, capped at 90% reduction. For example, 50% resistance multiplies damage by 0.5.
- **Negative resistance** amplifies incoming damage with no lower cap. For example, -20% resistance multiplies damage by 1.2.

The system selects the single most impactful resistance value, so mixing positive and negative values picks whichever helps or hurts the target most.

```typescript
// Example: target has 30% Blossom resistance
// A Blossom technique dealing 100 damage would deal 70 damage

// Example: target has -15% Blood resistance (vulnerable to blood)
// A Blood technique dealing 100 damage would deal 115 damage
```

This applies only when the technique has element types set. Techniques with no element type skip resistance checks entirely.

## Damage Types

Special damage types bypass certain protections:

### `'true'`

Ignores both barrier and defense.

### `'corrupt'`

Ignores defense but not barrier.

### `'disruption'`

Only affects barrier, not health.

## Condition Examples

### Multiple Hits with Scaling

```typescript
{
  kind: 'damage',
  amount: { value: 0.3, stat: 'power' },
  hits: {
    value: 0.5, // 1 hit per 2 stacks
    scaling: 'bloodCorruption',
    max: { value: 3, stat: undefined } // Max 3 hits
  }
}
```

### Conditional Effects

```typescript
{
  kind: 'heal',
  amount: { value: 0.2, stat: 'power' },
  condition: {
    kind: 'hp',
    percentage: 50,
    mode: 'less'
  }
}
```

### Chance-Based Effects

```typescript
{
  kind: 'buffSelf',
  buff: shieldBuff,
  amount: { value: 1, stat: undefined },
  condition: {
    kind: 'chance',
    percentage: 25
  }
}
```

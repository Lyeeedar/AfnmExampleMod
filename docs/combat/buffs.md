---
layout: default
title: Buff System Overview
parent: Combat System
nav_order: 1
description: 'Core concepts and mechanics of the AFNM buff system'
---

# Buff System Overview

Buffs are the core of AFNM's combat system. They represent temporary effects, enhancements, debuffs, and resource pools that drive combat mechanics. Understanding buffs is essential because techniques primarily work by creating and manipulating buffs.

## Complete Buff Interface

```typescript
import { Buff, BuffEffect, Scaling } from 'afnm-types';

interface Buff {
  // Identity
  name: string; // Unique identifier displayed to players
  icon: string; // Image asset for visual representation

  // Stacking behavior
  canStack: boolean; // Whether multiple instances can exist
  stacks: number; // Current number of stacks
  maxStacks?: number; // Optional stack limit

  // Visual properties
  colour?: string; // Optional background color for buff icon
  effectHint?: string; // Brief description when tooltip is not sufficient
  tooltip?: string; // Custom tooltip with dynamic placeholders (see below)
  additionalTooltip?: string; // Extra tooltip lines appended after the main one
  combatImage?: CombatImage; // Visual effects during combat

  // Combat properties
  stats?: { [key in CombatStatistic]?: Scaling }; // Passive stat modifications
  type?: TechniqueElement; // Element type for enhancement/affinity
  noneType?: string; // Subtype for techniques with no element
  buffType?: string; // Grouping for modifyBuffGroup effects
  flag?: string; // Marker string for flag-based lookups
  priority?: number; // Execution order (lower = earlier)

  // Effect timing
  onCombatStartEffects?: BuffEffect[]; // Once when combat begins
  onRoundStartEffects?: BuffEffect[]; // Start of each round
  beforeTechniqueEffects?: BuffEffect[]; // Before each technique
  afterTechniqueEffects?: BuffEffect[]; // After each technique
  onStackGainEffects?: BuffEffect[]; // When gaining stacks
  onRoundEffects?: BuffEffect[]; // End of each round

  // Advanced mechanics
  interceptBuffEffects?: {
    /** The buff to intercept. Can also be a string buff name. Omit when using only statFilter. */
    buff?: Buff | string;
    /** Match any incoming buff that grants one of these stats. Catches mod-added buffs too. */
    statFilter?: CombatStatistic[];
    /** Effects to run when intercepted. Runs once per application regardless of stack count. */
    effects: BuffEffect[];
    /** Blocks this many incoming stacks. Omit for a pure listener (effects fire but the buff still applies). */
    blockAmount?: Scaling;
  }[]; // Intercept other buff applications
  triggeredBuffEffects?: TriggeredEffect[]; // Respond to custom triggers
  blockTriggerEffects?: BlockTriggerEffect[]; // Block specific triggers
  damageInterceptorEffects?: DamageInterceptorEffect[]; // Modify incoming damage
  techniqueAmplifierEffects?: TechniqueAmplifierEffect[]; // Amplify outgoing effects
  buffAmplifierEffects?: BuffAmplifierEffect[]; // Modify buff creation on self
  condition?: TechniqueCondition; // When buff effects are active (see TechniqueCondition types for buff:'self' support)
  removeOnConditionFailed?: boolean; // Remove buff if condition stops being met
  allowTriggers?: boolean; // On TechniqueCondition: let triggers fire even when condition fails
  /** Mastery upgrade key -- scales the condition's count by the active technique mastery. */
  upgradeKey?: string;

  // Multiple-instance support
  allowMultipleInstances?: boolean; // Keep independent copies instead of merging by name
  maxInstances?: number; // Cap on concurrent independent instances

  // State tracking
  storedVariables?: Record<string, string>; // Template expressions evaluated once at creation
  storedValues?: Record<string, number>; // Computed results from storedVariables
  internalState?: Record<string, number>; // Mutable runtime state (updated during combat)
  initialState?: Record<string, string>; // Expressions evaluated to seed internalState
  stateTooltip?: string; // Template rendering internalState values in tooltips
  /** Override the value shown in the buff icon's stack badge. Evaluated against a scope exposing `internalState` and `stacks`. Defaults to `stacks`. Useful for non-stacking buffs that track a live value (e.g. a chain counter). */
  iconBadgeValue?: Scaling;

  // Entity reference
  applicationEntity?: CombatEntity; // Entity that applied this buff (for debuffs)

  // System properties
  cantUpgrade?: boolean; // Prevent mastery upgrades
  hidden?: boolean; // Hide from buff list and tooltips
  deweight?: boolean; // Hide from combat buff row (for passive mastery markers)
  charisma?: number; // NPC relationship modifier
  masteryPoints?: number; // Technique mastery points granted
  speed?: number; // Turn order modifier
  /** Marks this buff as a finisher for boost purposes. Effects gain <n>finisherBoost</n>. */
  isFinisher?: boolean;
  /**
   * Strips the holder's barrier once combat has finished setting up, after the
   * Meridian barrier fill and every `onCombatStartEffects` have run. Use for buffs
   * that turn the holder's own barrier against them. They must never open a fight
   * holding any barrier.
   */
  removeBarrierOnCombatStart?: boolean;
  enhancement?: number;

  // Guardian (sub-entity HP pool)
  guardianIntercept?: {
    maxHp: Scaling;
    onDestroyed?: BuffEffect[]; // Fires when guardian HP reaches 0
  };
  guardianHp?: number; // Runtime current HP of the guardian
  guardianMaxHp?: number; // Runtime max HP of the guardian

  // Persistence
  persistence?: BuffPersistence; // Controls behaviour outside combat

  // Auxiliary tooltip suppression (issue #8943)
  /**
   * Optional expression evaluated against the same buff-aware scope as `childBuffs.condition`
   * (exposes `stacks`, `internalState`, `storedValues`). When truthy, the auxiliary
   * tooltips that this buff would normally surface are suppressed:
   *  - barrier effects: hides the "Barrier" mechanic aux tooltip
   *  - temporaryHealth effects: hides the "Temporary Health" mechanic aux tooltip
   *  - effects that reference another buff (buffSelf/buffTarget/consumeSelf/consumeTarget/
   *    convertSelf/merge/repair/modifyBuffGroup): hides the referenced buff's aux tooltip
   * Use to hide the generic explanation when the player is already familiar with the
   * mechanic in this specific context, or when the buff is sourced from a tooltip fragment
   * that already explains it.
   */
  hideAuxTooltip?: string;

  // Horde battle transfer (issue #8941)
  /**
   * When the buff's holder is the current enemy and dies mid-fight (i.e. a horde
   * battle), this flag causes the buff to be deep-cloned onto the next enemy that
   * takes its place, preserving `stacks`, `internalState`, `storedValues`,
   * `guardianHp`, and any other accumulated runtime state. Unmarked buffs are
   * discarded with the dying enemy as before.
   */
  transferOnTargetDeath?: boolean;

  // Cached hash of static fields (set automatically, do not assign)
  _staticHash?: number;
}
```

## Buff Lifecycle

Understanding when and how buffs execute is crucial for creating effective combat content:

### 1. Application Phase

When a buff is applied to a character, the system:

- Checks if the buff can stack with existing instances
- Resolves `storedVariables` expressions and stores results in `storedValues`
- Evaluates `initialState` expressions to seed `internalState`
- Applies any intercept effects from other buffs
- Updates the character's buff list

### 2. Execution Phase

During combat, buffs execute their effects based on timing:

- **Priority order**: Lower `priority` values execute first
- **Timing triggers**: Each timing type executes at its designated moment
- **Condition checks**: Effects only execute if conditions are met (unless `allowTriggers: true` on the condition)

### 3. Modification Phase

Buffs can be modified during combat:

- Stack counts can increase/decrease
- `internalState` values can be updated via `setState` effects
- Effects can be intercepted or triggered
- Buffs can be consumed or negated

### 4. Cleanup Phase

Buffs are removed when:

- Stack count reaches zero (through `add` effects with negative values)
- Explicitly consumed by techniques or other buffs
- Combat ends (most buffs do not persist unless `persistence` is set)

## Effect Timing

Buffs can trigger effects at different times during combat:

### `onCombatStartEffects`

Triggers once when combat begins. Used for setup effects.

### `onRoundStartEffects`

Triggers at the start of each round, before any techniques are used.

### `beforeTechniqueEffects`

Triggers before each technique use.

### `afterTechniqueEffects`

Triggers after each technique use.

### `onStackGainEffects`

Triggers when this buff gains stacks.

### `onRoundEffects`

Triggers at the end of each round, after all techniques have been used.

### Advanced Timing

- **`interceptBuffEffects`** - Intercepts when specific buffs are applied
- **`triggeredBuffEffects`** - Responds to custom trigger events. See [Triggers](triggers) for details
- **`blockTriggerEffects`** - Prevents specific triggers from executing on this buff
- **`damageInterceptorEffects`** - Modifies or reacts to incoming damage before it is applied
- **`techniqueAmplifierEffects`** - Amplifies outgoing damage/barrier/heal effects
- **`buffAmplifierEffects`** - Modifies stack count when buffs are created on self
- **`priority`** - Controls execution order (lower numbers execute first). Buffs whose `beforeTechniqueEffects` contain a `{ kind: 'damage', damageType: 'disruption' }` effect receive an automatic priority offset of -100, so they always execute before other buffs at the same `priority` value.

## Scaling Fields

The `stats` field on a buff uses `Scaling` objects to define stat bonuses. Beyond basic `value` and `stat`, the following fields control how those bonuses are modified:

### `scaling`

A variable multiplied onto the result. Usually the name of a buff whose stack count acts as the multiplier:

```typescript
stats: {
  power: {
    value: 0.06,
    stat: 'power',
    scaling: 'stacks',      // multiplies by this buff's own stack count
    max: { value: 3.6, stat: 'power' },
  },
},
```

Can also reference another buff's name:

```typescript
scaling: 'SomeOtherBuff',  // multiplies by SomeOtherBuff's stack count
```

### `eqn`

A string expression multiplied onto the final result. This enables cross-buff logic where one buff's presence modifies another buff's effect:

```typescript
stats: {
  frostbiteStacks: {
    value: 1,
    stat: undefined,
    scaling: 'stacks',
    eqn: `1 + (${flag(frozenStormBuff.name)} ? 1 : 0)`,
  },
},
```

The expression can reference any flag. Use `window.modAPI.utils.flag(buff.name)` to convert a buff name to its flag key, then include it in the expression. The expression is evaluated at runtime, so it can check whether another buff is active.

### `additiveEqn`

Like `eqn`, but the result is **added** to the final value rather than multiplied:

```typescript
stats: {
  power: {
    value: 0.1,
    stat: 'power',
    additiveEqn: 'maxhp * 0.01',  // adds 1% of max HP to the power bonus
  },
},
```

### `customScaling`

A fixed multiplier applied to the `scaling` value. Use when you want a flat percentage bonus per stack of another buff:

```typescript
stats: {
  celestialBoost: {
    value: 5,
    stat: undefined,
    customScaling: {
      multiplier: 0.3,
      scaling: 'stacks',           // 30% more per stack of this buff
    },
  },
},
```

### `scalingMax`

A cap applied only to the resolved `scaling` multiplier (the stack count or other variable), before that capped value is multiplied onto `value`:

```typescript
stats: {
  hits: {
    value: 1,
    stat: undefined,
    scaling: 'stacks',
    scalingMax: { value: 5, stat: undefined },  // cap the multiplier at 5
  },
},
```

This is distinct from `max`, which caps the final computed result.

### `removeEqnForTooltip`

When `true`, the `eqn` is ignored for tooltip display so the shown amount is the base `value * stat` instead of the current state-scaled value (which can be 0):

```typescript
{
  value: 1,
  stat: 'power',
  eqn: 'someCondition ? 100 : 0',
  removeEqnForTooltip: true,  // tooltip shows base value, not conditional result
}
```

## Auxiliary Tooltip Suppression

The `hideAuxTooltip` field lets a buff suppress its own auxiliary ("aux") tooltips — the generic mechanic explanations that appear for barrier, temporary health, and referenced buffs. This is useful when the buff's own `tooltip` already explains the mechanic, or when the context makes it self-evident.

The field accepts an expression string evaluated against the same buff-aware scope as `childBuffs.condition` (exposes `stacks`, `internalState`, `storedValues`). When the expression evaluates truthy, aux tooltips are hidden.

```typescript
{
  name: 'Arcane Barrier',
  icon: arcaneBarrierIcon,
  // ...other fields...
  hideAuxTooltip: '1',  // always hide the Barrier aux tooltip
}
```

```typescript
{
  name: 'Chain Lightning',
  icon: chainLightningIcon,
  // ...other fields...
  // Only hide the referenced buff's aux tooltip once stacks are high enough
  hideAuxTooltip: 'stacks >= 3',
}
```

Available aux tooltip targets:
- **Barrier effects**: hides the "Barrier" mechanic aux
- **temporaryHealth effects**: hides the "Temporary Health" mechanic aux
- **Buff-reference effects** (buffSelf/buffTarget/consumeSelf/consumeTarget/convertSelf/merge/repair/modifyBuffGroup): hides the referenced buff's aux tooltip

## Custom Tooltips

The `tooltip` field on a buff supports dynamic placeholders that resolve at render time:

- `<name>BuffName</name>` - Inserts the display name of another buff, styled as a buff link
- `{heal.amount}` - Inserts the calculated amount from a `heal` effect in `triggeredBuffEffects`
- `{barrier.amount}` - Inserts the calculated amount from a `barrier` effect in `triggeredBuffEffects`
- `{damageSelf.amount}` - Inserts the calculated amount from a `damageSelf` effect in `onRoundEffects` or similar timings
- `{state.variableName}` - Inserts a value from `internalState` (requires `stateTooltip` to be set)

The placeholder key is determined by the effect kind. For `damageSelf`, use `{damageSelf.amount}`. For `damage` (enemy damage), use `{damage.amount}`. The key is the effect's `kind` value followed by `.amount`:

```typescript
// onRoundEffects using damageSelf -- tooltip must use {damageSelf.amount}
onRoundEffects: [
  {
    kind: 'damageSelf',
    amount: { value: 0.5, stat: 'power', scaling: 'stacks' },
  },
],
tooltip: 'At the end of each round, take {damageSelf.amount} damage per stack.',
```

This allows buffs to display context-sensitive values that depend on other stats or effects:

```typescript
tooltip: 'When this is converted into <name>Moonlight</name>, gain {heal.amount} health.',
```

## Multiple Independent Instances

By default, buffs are merged by name. Applying the same buff twice just adds stacks. Set `allowMultipleInstances: true` to keep separate copies:

```typescript
{
  name: 'Blood Orb',
  allowMultipleInstances: true,
  maxInstances: 3, // Cap at 3 concurrent Blood Orbs; oldest is removed when exceeded
}
```

When a new instance would exceed `maxInstances`, the one with the least health (or lowest stacks as fallback) is removed.

## Internal State

Buffs can track mutable runtime state using `internalState`. This is useful for counters, thresholds, or flags that persist for the duration of combat but change during it:

```typescript
{
  name: 'Accumulated Power',
  internalState: { powerAccumulated: 0 },
  initialState: { powerAccumulated: 'maxhp * 0.1' }, // Seed from current max HP
  stateTooltip: '{powerAccumulated} / {damageThreshold} power accumulated',
  triggeredBuffEffects: [
    {
      trigger: 'takeDamage',
      effects: [
        { kind: 'setState', key: 'powerAccumulated', value: { value: 1, stat: undefined }, mode: 'add' }
      ]
    }
  ]
}
```

`internalState` values are updated via the `setState` buff effect with `mode: 'add'` or `mode: 'set'`.

## Stored Variables

`storedVariables` captures values at buff creation time using template expressions. Results are stored in `storedValues`:

```typescript
{
  name: 'Snapshot Power',
  storedVariables: { powerAtCreation: 'power' },
  storedValues: { powerAtCreation: 150 }, // Evaluated once when buff is applied
  condition: {
    kind: 'condition',
    condition: 'powerAtCreation > 100', // Can be used in conditions
  }
}
```

Unlike `internalState`, `storedValues` are fixed at application time and cannot be modified.

## Buff Persistence

By default, buffs are combat-scoped only. Use `persistence` to control behaviour outside combat:

```typescript
{
  name: 'Monthly Fortification',
  persistence: {
    persistAfterCombat: true,  // Survives combat; written to player.monthBuffs
    decayPerMonth: 1, // Lose 1 stack at the end of each in-game month
  }
}
```

## Guardian Sub-Entity

A buff can declare a guardian: a secondary HP pool that sits in front of the character's actual HP:

```typescript
{
  name: 'Blood Shield',
  guardianIntercept: {
    maxHp: { value: 0.3, stat: 'maxhp' },
    onDestroyed: [
      // Effects fire when guardian HP reaches 0
      { kind: 'buffSelf', amount: { value: 1, stat: undefined }, buff: brokenShieldBuff }
    ]
  }
}
```

When the guardian intercepts damage, damage goes to `guardianHp` first. When `guardianHp` reaches 0, `onDestroyed` effects fire and `guardianMaxHp` is cleared.

## Horde Battle Transfer

In horde battles (where multiple enemies fight the player sequentially), buffs with `transferOnTargetDeath: true` are preserved when the current enemy dies. The buff is deep-cloned onto the next enemy, carrying over all accumulated state:

```typescript
{
  name: 'Corruption Stack',
  icon: corruptionIcon,
  canStack: true,
  transferOnTargetDeath: true,  // Survives across enemies in horde fights
  // ...other fields...
}
```

State that transfers:
- `stacks` — current stack count
- `internalState` — any tracked counters or flags
- `storedValues` — values captured at creation time
- `guardianHp` / `guardianMaxHp` — guardian sub-entity state

Buffs without this flag are discarded when the enemy dies, matching the previous behaviour.

## Real Examples

### Resource Buffer - Sunlight

```typescript
import { Buff } from 'afnm-types';
import sunIcon from '../assets/icons/sunlight.png';

export const sunlight: Buff = {
  name: 'Sunlight',
  icon: sunIcon,
  canStack: true,
  type: 'celestial',
  stats: {
    power: {
      value: 0.06,
      stat: 'power',
      scaling: 'stacks',
      max: { value: 3.6, stat: 'power' },
    },
  },
  tooltip: 'When this is converted into <name>Moonlight</name>, gain {heal.amount} health.',
  triggeredBuffEffects: [
    {
      trigger: 'celestialRotation',
      effects: [
        {
          kind: 'heal',
          amount: { value: 0.3, stat: 'power' },
        },
      ],
    },
  ],
  stacks: 1,
  combatImage: {
    image: sunIcon,
    position: 'floating',
    entrance: 'rotate',
    stacksScale: 0.15,
  },
  cantUpgrade: true,
};
```

### Self-Consuming Effect - Moonchill

```typescript
import { Buff } from 'afnm-types';
import moonchillIcon from '../assets/icons/moonchill.png';

export const moonchill: Buff = {
  name: 'Moonchill',
  icon: moonchillIcon,
  type: 'celestial',
  canStack: true,
  stats: {
    power: { value: -0.3, stat: 'power' },
  },
  beforeTechniqueEffects: [
    {
      kind: 'add',
      amount: { value: -1, stat: undefined },
    },
  ],
  onRoundEffects: [],
  stacks: 1,
  cantUpgrade: true,
};
```

### Dual-Resource Buffer - Moonlight

Moonlight demonstrates buffs that grant multiple stat types and use triggered effects for conversion interactions:

```typescript
import { Buff } from 'afnm-types';
import moonIcon from '../assets/icons/moonlight.png';

export const moonlight: Buff = {
  name: 'Moonlight',
  icon: moonIcon,
  type: 'celestial',
  canStack: true,
  stats: {
    protection: {
      value: 3,
      stat: undefined,
      scaling: 'stacks',
      max: { value: 180, stat: undefined },
    },
    barrierMitigation: {
      value: 1,
      stat: undefined,
      scaling: 'stacks',
      max: { value: 60, stat: undefined },
    },
  },
  tooltip: 'When this is converted into <name>Sunlight</name>, gain {barrier.amount} barrier.',
  triggeredBuffEffects: [
    {
      trigger: 'celestialRotation',
      effects: [
        {
          kind: 'barrier',
          amount: { value: 0.3, stat: 'power' },
        },
      ],
    },
  ],
  stacks: 1,
  combatImage: {
    image: moonIcon,
    position: 'floating',
    entrance: 'rotate',
    stacksScale: 0.15,
  },
  cantUpgrade: true,
};
```

### Conditional Buff - Lunar Attunement

```typescript
import { Buff } from 'afnm-types';
import lunarAttunementIcon from '../assets/icons/lunar-attunement.png';

export const lunarAttunement: Buff = {
  name: 'Lunar Attunement',
  icon: lunarAttunementIcon,
  canStack: true,
  condition: {
    kind: 'condition',
    condition: `${window.modAPI.utils.flag(moonlight.name)} > 0`,
    tooltip: 'If you have <name>Moonlight</name> then',
  },
  stats: {
    celestialBoost: {
      value: 5,
      stat: undefined,
      scaling: 'stacks',
      max: { value: 50, stat: undefined },
    },
  },
  onRoundEffects: [],
  stacks: 1,
  cantUpgrade: true,
};
```

### Healing Over Time - Restoring Fragrance

```typescript
import { Buff } from 'afnm-types';
import icon from '../assets/icons/restoring-fragrance.png';

const restoringFragranceBuff: Buff = {
  name: 'Restoring Fragrance',
  icon: icon,
  canStack: true,
  stats: undefined,
  type: 'blossom',
  afterTechniqueEffects: [
    {
      kind: 'heal',
      amount: { value: 0.25, stat: 'power', upgradeKey: 'power' },
    },
  ],
  onRoundEffects: [
    {
      kind: 'add',
      amount: { value: -1, stat: undefined },
    },
  ],
  stacks: 1,
};
```

## Stack Management

Buffs use different stacking behaviors:

### Standard Stacking

- `canStack: true` - Multiple instances combine their stacks
- `maxStacks` - Optional limit to prevent infinite stacking

### Non-Stacking

- `canStack: false` - Only one instance can exist
- Applying again refreshes or replaces the existing buff

### Multiple Independent Instances

- `allowMultipleInstances: true` - Each application creates a separate copy
- `maxInstances` - Cap on how many concurrent copies can exist

## Conditions

Buffs can have conditional effects that only trigger under specific circumstances:

### Buff Conditions

```typescript
condition: {
  kind: 'buff',
  buff: targetBuff,
  count: 3,
  mode: 'more'
}
```

### HP Conditions

```typescript
condition: {
  kind: 'hp',
  percentage: 50,
  mode: 'less'
}
```

### Custom Conditions

```typescript
condition: {
  kind: 'condition',
  condition: 'custom_flag > 0',
  tooltip: 'When condition is met'
}
```

### Chance Conditions

```typescript
condition: {
  kind: 'chance',
  percentage: 30
}
```

### Inventory Item Conditions

```typescript
condition: {
  kind: 'inventoryItem',
  itemName: 'Qi Replenishing Pill',
  count: 1,
  mode: 'more'
}
```

### Allowing Triggers to Fire on Failed Conditions

By default, a failed condition blocks all effects including `triggeredBuffEffects`. Set `allowTriggers: true` on the condition to let triggers fire even when the main condition fails:

```typescript
condition: {
  kind: 'hp',
  percentage: 50,
  mode: 'less',
  allowTriggers: true, // triggeredBuffEffects still run even at > 50% HP
}
```

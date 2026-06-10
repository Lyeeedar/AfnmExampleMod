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
  interceptBuffEffects?: InterceptEffect[]; // Intercept other buff applications
  triggeredBuffEffects?: TriggeredEffect[]; // Respond to custom triggers
  blockTriggerEffects?: BlockTriggerEffect[]; // Block specific triggers
  damageInterceptorEffects?: DamageInterceptorEffect[]; // Modify incoming damage
  techniqueAmplifierEffects?: TechniqueAmplifierEffect[]; // Amplify outgoing effects
  buffAmplifierEffects?: BuffAmplifierEffect[]; // Modify buff creation on self
  condition?: TechniqueCondition; // When buff effects are active
  removeOnConditionFailed?: boolean; // Remove buff if condition stops being met
  allowTriggers?: boolean; // On TechniqueCondition: let triggers fire even when condition fails

  // Multiple-instance support
  allowMultipleInstances?: boolean; // Keep independent copies instead of merging by name
  maxInstances?: number; // Cap on concurrent independent instances

  // State tracking
  storedVariables?: Record<string, string>; // Template expressions evaluated once at creation
  storedValues?: Record<string, number>; // Computed results from storedVariables
  internalState?: Record<string, number>; // Mutable runtime state (updated during combat)
  initialState?: Record<string, string>; // Expressions evaluated to seed internalState
  stateTooltip?: string; // Template rendering internalState values in tooltips

  // Entity reference
  applicationEntity?: CombatEntity; // Entity that applied this buff (for debuffs)

  // System properties
  cantUpgrade?: boolean; // Prevent mastery upgrades
  hidden?: boolean; // Hide from buff list and tooltips
  charisma?: number; // NPC relationship modifier
  masteryPoints?: number; // Technique mastery points granted
  speed?: number; // Turn order modifier

  // Guardian (sub-entity HP pool)
  guardianIntercept?: {
    maxHp: Scaling;
    onDestroyed?: BuffEffect[]; // Fires when guardian HP reaches 0
  };
  guardianHp?: number; // Runtime current HP of the guardian
  guardianMaxHp?: number; // Runtime max HP of the guardian

  // Persistence
  persistence?: BuffPersistence; // Controls behaviour outside combat

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

## Custom Tooltips

The `tooltip` field on a buff supports dynamic placeholders that resolve at render time:

- `<name>BuffName</name>` - Inserts the display name of another buff, styled as a buff link
- `{heal.amount}` - Inserts the calculated amount from a `heal` effect in `triggeredBuffEffects`
- `{barrier.amount}` - Inserts the calculated amount from a `barrier` effect in `triggeredBuffEffects`
- `{state.variableName}` - Inserts a value from `internalState` (requires `stateTooltip` to be set)

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

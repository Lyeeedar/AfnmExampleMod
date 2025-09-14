---
layout: default
title: Buff System Overview
parent: Combat System
nav_order: 1
description: 'Core concepts and mechanics of the AFNM buff system'
---

# Buff System Overview

Buffs are the core of AFNM's combat system. They represent temporary effects, enhancements, debuffs, and resource pools that drive combat mechanics.

## Buff Structure

Every buff is defined by the `Buff` interface with these key properties:

### Basic Properties

- **`name`** - Unique identifier displayed to players
- **`icon`** - Image asset for visual representation
- **`canStack`** - Whether multiple instances can exist
- **`stacks`** - Current number of stacks
- **`maxStacks`** - Optional stack limit

### Visual Properties

- **`colour`** - Optional background color for the buff icon
- **`effectHint`** - Optional short description of the buff's purpose if there's not enough information in the tooltip
- **`tooltip`** - Custom tooltip text (auto-generated if not provided)
- **`combatImage`** - Visual effects during combat

### Stats and Enhancement

- **`stats`** - Passive stat modifications
- **`type`** - Element type for enhancement calculations and applying affinity

## Effect Timing

Buffs can trigger effects at different times during combat:

### `onCombatStartEffects`

Triggers once when combat begins. Used for setup effects.

### `onRoundStartEffects`

Triggers at the start of each round, before any techniques are used.

### `onTechniqueEffects`

Triggers before each technique use (default) or after if `afterTechnique: true`.

### `onRoundEffects`

Triggers at the end of each round, after all techniques have been used.

### Advanced Timing

- **`interceptBuffEffects`** - Intercepts when specific buffs are applied
- **`triggeredBuffEffects`** - Responds to custom trigger events
- **`priority`** - Controls execution order (lower numbers execute first)

## Real Examples

### Resource Buffer - Sunlight

```typescript
export const sunlight: Buff = {
  name: 'Sunlight',
  icon: sunIcon,
  canStack: true,
  effectHint: 'Used to empower Celestial techniques',
  stats: {
    power: {
      value: 0.05,
      stat: 'power',
      scaling: 'stacks',
      max: { value: 1, stat: 'power' },
    },
  },
  onTechniqueEffects: [],
  onRoundEffects: [],
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
export const moonchill: Buff = {
  name: 'Moonchill',
  icon: moonchillIcon,
  type: 'celestial',
  canStack: true,
  stats: {
    power: { value: -0.3, stat: 'power' },
  },
  onTechniqueEffects: [
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

### Conditional Buff - Lunar Attunement

```typescript
export const lunarAttunement: Buff = {
  name: 'Lunar Attunement',
  icon: lunarAttunementIcon,
  canStack: true,
  maxStacks: 10,
  condition: {
    kind: 'condition',
    condition: `${flag(moonlight.name)} > 0`,
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
  onTechniqueEffects: [],
  onRoundEffects: [],
  stacks: 1,
  cantUpgrade: true,
};
```

### Healing Over Time - Restoring Fragrance

```typescript
const restoringFragranceBuff: Buff = {
  name: 'Restoring Fragrance',
  icon: icon,
  canStack: true,
  stats: undefined,
  type: 'blossom',
  afterTechnique: true,
  onTechniqueEffects: [
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

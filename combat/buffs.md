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
  effectHint?: string; // Brief description when tooltip isn't sufficient
  tooltip?: string; // Custom tooltip with dynamic placeholders (see below)
  combatImage?: CombatImage; // Visual effects during combat

  // Combat properties
  stats?: { [key: string]: Scaling }; // Passive stat modifications
  type?: TechniqueElement; // Element type for enhancement/affinity
  buffType?: string; // Grouping for modifyBuffGroup effects
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
  condition?: BuffCondition; // When buff effects are active

  // System properties
  cantUpgrade?: boolean; // Prevent mastery upgrades
}
```

## Buff Lifecycle

Understanding when and how buffs execute is crucial for creating effective combat content:

### 1. Application Phase

When a buff is applied to a character, the system:

- Checks if the buff can stack with existing instances
- Applies any intercept effects from other buffs
- Updates the character's buff list

### 2. Execution Phase

During combat, buffs execute their effects based on timing:

- **Priority order**: Lower `priority` values execute first
- **Timing triggers**: Each timing type executes at its designated moment
- **Condition checks**: Effects only execute if conditions are met

### 3. Modification Phase

Buffs can be modified during combat:

- Stack counts can increase/decrease
- Effects can be intercepted or triggered
- Buffs can be consumed or negated

### 4. Cleanup Phase

Buffs are removed when:

- Stack count reaches zero (through `add` effects with negative values)
- Explicitly consumed by techniques or other buffs
- Combat ends (most buffs don't persist)

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
- **`priority`** - Controls execution order (lower numbers execute first). Buffs whose `beforeTechniqueEffects` contain a `{ kind: 'damage', damageType: 'disruption' }` effect receive an automatic priority offset of -100, so they always execute before other buffs at the same `priority` value.

## Custom Tooltips

The `tooltip` field on a buff supports dynamic placeholders that resolve at render time:

- `<name>BuffName</name>` - Inserts the display name of another buff, styled as a buff link
- `{heal.amount}` - Inserts the calculated amount from a `heal` effect in `triggeredBuffEffects`
- `{barrier.amount}` - Inserts the calculated amount from a `barrier` effect in `triggeredBuffEffects`

This allows buffs to display context-sensitive values that depend on other stats or effects:

```typescript
tooltip: 'When this is converted into <name>Moonlight</name>, gain {heal.amount} health.',
```

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

## Combat Stats Reference

The following combat stats are available for use in buff `stats` definitions:

### Defensive Stats

- **`defense`** (Armour) - Base resistance to damage. Damage reduction from defence caps at **70%**.
- **`protection`** - Reduces damage taken to health with diminishing returns. Does not affect barrier damage. Calculation caps at 90% DR.
- **`dr`** (Damage Resistance) - Reduces damage taken to health. Multiple sources multiply together. Does not affect barrier damage. Multiple sources multiply together.
- **`barrierMitigation`** - Controls how efficiently barrier absorbs damage. At 0, 1 barrier absorbs 1 damage. Above 0 uses square-root scaling, capping at 90% DR at 500 barrier mitigation.
- **`barrierBleed`** - Causes this percentage of damage to bypass barrier and strike health directly.
- **`cultivatorResistance`** - Resistance to corrupt damage type.
- **`vulnerability`** - Increases damage taken to health (not barrier). Multiple sources add together.

### Offensive Stats

- **`power`** - Affects damage dealt, healing, barrier gained, and buff/debuff strength.
- **`artefactpower`** - Strength of artefact techniques and Formation Parts.
- **`critchance`** - Chance for critical effect. Above 100% converts to bonus crit multiplier at 1:3 ratio.
- **`critmultiplier`** - Critical hit damage multiplier.
- **`overcrit`** - Allows critical hits to chain up to 9 additional times. Capped at 90%.
- **`lifesteal`** - Percentage of damage dealt recovered as health.

### Boost Stats

- **`fistBoost`**, **`blossomBoost`**, **`weaponBoost`**, **`cloudBoost`**, **`bloodBoost`**, **`celestialBoost`** - School-specific damage boosts.
- **`damageBoost`** - Modifies all non-true damage by a percentage.
- **`healingBoost`** - Modifies all healing received by a percentage.
- **`barrierBoost`** - Modifies all barrier gained by a percentage.
- **`temphpBoost`** - Modifies temporary health gained by a percentage.

### Resource Stats

- **`maxhp`** / **`hp`** - Maximum and current health.
- **`maxbarrier`** / **`barrier`** - Maximum and current barrier.
- **`maxtoxicity`** / **`toxicity`** - Maximum and current toxicity.
- **`qiDroplets`** - Currency for techniques and formations.
- **`pillsPerRound`** - Items usable per round.
- **`itemEffectiveness`** - Effectiveness of pills, concoctions, and Formation Parts.

### Disable Stats

- **`fistDisabled`**, **`bloodDisabled`**, **`blossomDisabled`**, **`cloudDisabled`**, **`celestialDisabled`**, **`weaponDisabled`**, **`noneDisabled`** - Disable techniques of that school.
- **`pillsDisabled`** / **`dropletsDisabled`** - Disable item usage.

### Affinity Stats

- **`fistAffinity`**, **`blossomAffinity`**, **`weaponAffinity`**, **`cloudAffinity`**, **`bloodAffinity`**, **`celestialAffinity`**, **`noneAffinity`** - Root bonuses for each school.
---
layout: default
title: Technique System
parent: Combat System
nav_order: 6
description: 'Core concepts and structure of the AFNM technique system'
---

# Technique System

Techniques are active combat abilities that players use to deal damage, apply buffs, and manipulate resources. Unlike buffs which have ongoing effects, techniques execute their effects immediately when used.

## Complete Technique Interface

```typescript
import {
  Technique,
  TechniqueEffect,
  TechniqueCost,
  TechniqueRequirement,
} from 'afnm-types';

interface Technique {
  // Identity
  name: string; // Display name
  icon: string; // Visual representation
  type: TechniqueElement; // School/element type
  realm?: Realm; // Minimum cultivation level
  tooltip?: string; // Custom description (auto-generated if omitted)

  // Resource costs (consumed when used)
  costs?: TechniqueCost[]; // Buff stacks to consume
  toxicityCost?: number; // Toxicity granted when used
  dropletCost?: number; // Special resource cost

  // Requirements (must be met but not consumed)
  requirements?: TechniqueRequirement[]; // Conditions for usage

  // Usage restrictions
  maxInstances?: number; // Uses per stance (default: 3)
  stanceRestriction?: 'opener' | 'finisher'; // Position in stance sequence
  disableCrystalDrop?: boolean; // Exclude from technique crystal drops

  // Effects and mechanics
  effects: TechniqueEffect[]; // What happens when used
  triggeredEffects?: { trigger: string, effects: TechniqueEffect[] }[]; // Effects that can be triggered by the base effects
  enhancement?: number; // Bonus from element matching
  secondaryType?: TechniqueElement | 'origin'; // Additional element

  // Mastery system
  upgradeMasteries?: { [key: string]: TechniqueMasteryRarityMap }; // Fixed upgrades
  masteryKindPools?: TechniqueEffectKind[]; // Random upgrade pools
}
```

### Base Technique Effect Properties

All technique effects (`TechniqueEffect` types) extend `BaseTechniqueEffect` which provides common optional fields:

```typescript
interface BaseTechniqueEffect {
  condition?: TechniqueCondition;  // Optional condition that must be met
  triggerKey?: string;             // Key used for triggered effects system
  isAdditionalTooltip?: boolean;    // Marks additional tooltip entries
  cantUpgrade?: boolean;            // Prevent mastery upgrades on this effect
  statChanges?: Partial<{ [key in CombatStatistic]: Scaling }>; // Stat modifications
  /**
   * Optional expression evaluated against the technique tooltip's variable
   * scope. When truthy, the auxiliary tooltips that this effect would
   * normally surface are suppressed:
   *  - barrier effects: the "Barrier" mechanic aux tooltip
   *  - temporaryHealth effects: the "Temporary Health" mechanic aux tooltip
   *  - effects that reference a buff (buffSelf/buffTarget/consumeSelf/
   *    consumeTarget/convertSelf/mergeSelf): the referenced buff's
   *    auxiliary tooltip
   * Mirror of the same property on BaseBuff (issue #8943).
   */
  hideAuxTooltip?: string;
}
```

## Element Types

The `type` field determines which cultivation school the technique belongs to:

### Primary Schools

- **`'celestial'`** - Sun/moon duality, light/shadow manipulation
- **`'blood'`** - Life force manipulation, corruption mechanics
- **`'blossom'`** - Nature-based, growth and healing effects
- **`'fist'`** - Martial arts, momentum and flow
- **`'weapon'`** - Tool-based combat, metal manipulation
- **`'cloud'`** - Storm effects, weather manipulation

### Special Types

- **`'none'`** - Universal techniques not tied to any school
- **`secondaryType`** - Additional element for dual-school techniques

Element types affect:

- **Enhancement scaling** - Techniques gain bonuses from matching element buffs
- **Affinity calculations** - Damage/healing modified by element affinity
- **School identity** - Each school has distinct mechanical themes

## Realm

The `realm` field sets the realm of technique crystals this technique will drop from, and where its sorted in the various menus:

```typescript
realm: 'bodyForging'; // Available from Body Forging realm
realm: 'coreFormation'; // Requires Core Formation or higher
```

- **Purpose**: Organises techniques based on expected acquisition time
- **Balance**: Higher realms generally have more complex/powerful techniques that take advantage of longer stance lengths
- **Optional**: If omitted, technique is not dropped from technique crystals, and must be acquire through some other means

## Resource Costs

Techniques can consume various resources when used:

### Buff Costs

The most common cost type - consumes buff stacks:

```typescript
costs: [
  {
    buff: fragrantBlossom,     // Buff object to consume
    amount: 4,                 // Stacks required
    upgradeKey?: 'cost'        // Can be reduced through mastery
  }
]
```

**Example from Restoring Fragrance:**

```typescript
costs: [
  {
    buff: fragrantBlossom,
    amount: 4,
    upgradeKey: 'cost', // Mastery can reduce to 3 stacks
  },
];
```

### Toxicity Costs

Direct toxicity increases:

```typescript
toxicityCost: 15; // Grants 15 toxicity when used
```

### Droplet Costs

Special resource for unique techniques:

```typescript
dropletCost: 1; // Consume 1 droplet when used
```

**Use cases:**

- Rare or ultimate techniques
- Cross-school abilities
- Special progression rewards

## Requirements

Requirements must be met for the technique to be usable, but are not consumed:

```typescript
requirements: [
  {
    buff: requiredBuff,        // Buff that must be present
    amount: 3,                 // Minimum stacks needed
    mode?: 'more',             // 'more', 'less', or 'equal' (default 'more')
    upgradeKey?: 'requirement' // Can be modified through mastery
  }
]
```

**Use cases:**

- **Setup requirements**: Need specific buffs active before use
- **Conditional access**: Technique only available in certain states
- **Scaling effects**: Higher requirements for more powerful versions

## Usage Restrictions

### Maximum Instances

Limits how many times a technique can be used per stance:

```typescript
maxInstances: 1; // Can only be used once per stance
```

**Use cases:**

- Powerful techniques
- Setup abilities that should not be spammed
- Weaker techniques that would benefit from more than the usual 3 instances

### Stance Restrictions

Controls when in a stance sequence the technique can be used:

```typescript
stanceRestriction: 'opener'; // Must be first technique in stance
stanceRestriction: 'finisher'; // Must be last technique in stance
```

**Strategic implications:**

- **Openers**: Set up resources/conditions for the stance
- **Finishers**: Capitalize on resources built during the stance
- **Flexible**: No restriction allows use anywhere in sequence

### Disabling Crystal Drops

Set `disableCrystalDrop: true` to exclude a technique from technique crystal drops. This is useful for techniques that are only obtainable through special means (e.g. spirit techniques unlocked via the spirit tree):

## Complete Examples

### Simple Damage Technique - Advancing Fist

```typescript
import { Technique } from 'afnm-types';
import icon from '../assets/techniques/advancing-fist.png';

export const advancingFist: Technique = {
  name: 'Advancing Fist',
  icon: icon,
  type: 'fist',
  realm: 'bodyForging',
  effects: [
    {
      kind: 'damage',
      amount: { value: 0.9, stat: 'power', upgradeKey: 'power' },
    },
    {
      kind: 'barrier',
      amount: { value: 0.9, stat: 'power', upgradeKey: 'barrier' },
    },
    {
      kind: 'buffSelf',
      buff: window.modAPI.gameData.techniqueBuffs.fist.flow,
      amount: { value: 1, stat: undefined, upgradeKey: 'stacks' },
    },
  ],
};
```

**Analysis:**

- **Basic technique**: No costs or requirements, usable from Body Forging
- **Multi-effect**: Deals damage, grants barrier, generates Flow resource
- **Upgradeable**: All three effects can be improved through mastery

### Resource Management - Restoring Fragrance

```typescript
import { Technique } from 'afnm-types';
import icon from '../assets/techniques/restoring-fragrance.png';

export const restoringFragrance: Technique = {
  name: 'Restoring Fragrance',
  icon: icon,
  type: 'blossom',
  realm: 'coreFormation',
  costs: [
    {
      buff: window.modAPI.gameData.techniqueBuffs.blossom.fragrantBlossom,
      amount: 4,
      upgradeKey: 'cost',
    },
  ],
  effects: [
    {
      kind: 'buffSelf',
      buff: {
        // Buff implementation...
      },
      amount: { value: 1, stat: undefined, upgradeKey: 'stacks' },
    },
  ],
};
```

**Analysis:**

- **Resource cost**: Consumes 4 Fragrant Blossom stacks
- **Higher realm**: Requires Core Formation
- **Buff creation**: Creates a healing-over-time buff
- **Cost reduction**: Mastery can reduce resource cost

### Conditional Toggle - Profane Exchange

```typescript
import { Technique, Buff } from 'afnm-types';
import icon from '../assets/techniques/profane-exchange.png';

const profaneExchangeBuff: Buff = {
  // Buff implementation...
}

export const profaneExchange: Technique = {
  name: 'Profane Exchange',
  icon: icon,
  type: 'blood',
  realm: 'meridianOpening',
  effects: [
    {
      kind: 'buffSelf',
      buff: profaneExchangeBuff,
      condition: {
        kind: 'condition',
        condition: `original_${window.modAPI.utils.flag(profaneExchangeBuff.name)} == 0`,
      },
      amount: { value: 1, stat: undefined },
    },
    {
      kind: 'consumeSelf',
      buff: profaneExchangeBuff,
      condition: {
        kind: 'condition',
        condition: `original_${window.modAPI.utils.flag(profaneExchangeBuff.name)} == 1`,
      },
      amount: { value: 1, stat: undefined },
    },
  ],
};
```

**Analysis:**

- **Toggle behavior**: First use applies buff, second use removes it
- **Conditional effects**: Each effect only executes under specific conditions
- **State-dependent**: Same technique does different things based on current state

### Resource Conversion - Sunrise

```typescript
import { Technique } from 'afnm-types';
import icon from '../assets/techniques/sunrise.png';

export const sunrise: Technique = {
  name: 'Sunrise',
  icon: icon,
  type: 'celestial',
  realm: 'bodyForging',
  effects: [
    {
      kind: 'buffSelf',
      buff: window.modAPI.gameData.techniqueBuffs.celestial.solarAttunement,
      amount: { value: 1, stat: undefined, upgradeKey: 'attuneStacks' },
    },
    {
      kind: 'buffSelf',
      buff: window.modAPI.gameData.techniqueBuffs.celestial.sunlight,
      amount: { value: 1, stat: undefined, upgradeKey: 'stacks' },
    },
    {
      kind: 'convertSelf',
      source: window.modAPI.gameData.techniqueBuffs.celestial.moonlight,
      target: window.modAPI.gameData.techniqueBuffs.celestial.sunlight,
      amount: { value: 1, stat: undefined, scaling: window.modAPI.gameData.techniqueBuffs.celestial.moonlight.name },
      triggerKey: celestialRotation,
    },
  ],
};
```

**Analysis:**

- **Multi-function**: Generates resources, attunement, and converts existing resources
- **School mechanics**: Demonstrates celestial sun/moon transformation
- **Trigger system**: Fires celestial rotation event for other systems
- **Scaling conversion**: Converts all existing Moonlight to Sunlight

## Stances and Styles

Stances group techniques into ordered sequences that execute automatically during combat. Each combatant maintains a current stance (the active technique sequence) and a library of stored stances.

### StoredStance and StoredStyle

The `PlayerEntity` and `EnemyEntity` types expose stances via `storedStyles`, a list of `StoredStyle` objects. Each `StoredStyle` holds a named style that contains ordered `StoredStance` entries:

```typescript
interface StoredStyle {
  name: string;
  id: string;
  autoName?: boolean;
  stances: StoredStance[];
  conditionalCycles?: ConditionalCycle[];
}

interface StoredStance {
  name: string;
  autoName?: boolean;
  techniques: string[];
  stanceRule?: StoredRule;
}
```

### Stance Rule Types

Each `StoredStance` can declare a `stanceRule` to control when it fires:

```typescript
// Fires as the first technique of the combat
{ kind: 'opener', position: 0 }

// Fires in rotation at a fixed position
{ kind: 'rotation', position: 2 }

// Fires only when a condition is true; keeps firing while the condition remains true
{
  kind: 'conditional',
  position: 1,
  condition: TechniqueCondition,
  maxCount?: number, // Maximum times this stance fires across the whole combat
}

// Fires in rotation at a fixed position, but only while a condition is true
{ kind: 'conditionalRotation', position: 2, condition: TechniqueCondition }
```

### Conditional Stance Counters

For combatants using the unified stance selector (players, manifested figments, evoked figments), the `enemyStanceData` field tracks per-stance usage so `ConditionalStoredRule.maxCount` is enforced:

```typescript
enemyStanceData?: {
  playerStanceIndex: number;
  usedPlayerStanceOpeners: boolean[];
  lastPlayerStance: string;
  lastCycleKey?: string;
  usedConditionalStanceCounts?: Record<string, number>;
};
```

### Manifested and Evoked Life Forms

When a manifested or evoked life form (such as a figment) uses player-style stances, the stance configuration is forwarded from the figment data into the combat entity via `playerStyleStances` and `playerStyleCycles`. This ensures the unified `selectNextStoredStance` selector evaluates both the player entity and life-form entities using the same algorithm.

**For modders adding manifested figments:** Seed `playerStyleStances` and `playerStyleCycles` on the combat entity so conditional stance rules and `maxCount` enforcement behave consistently with the player entity.

## Mastery System

Techniques can be upgraded through the mastery system. All mastery helpers are available on `window.modAPI.utils`.

### Quick Reference

```typescript
upgradeMasteries: {
  power: window.modAPI.utils.createPowerUpgradeMap('power', 'empowered'),
  cost: window.modAPI.utils.createCostUpgradeMap('cost', 'empowered', fragrantBlossom.name, -1),
  stacks: window.modAPI.utils.createStacksUpgradeMap('stacks', 'empowered', buffName, 1),
}
```

### Upgrade Keys

Properties with `upgradeKey` can be modified by mastery:

- **Damage/healing amounts**: Increase effectiveness
- **Resource costs**: Reduce consumption
- **Stack generation**: Generate more resources
- **Requirements**: Modify usage conditions

### Mastery Helper Reference

All helpers accept `(key: string, rarity: Rarity, ...)` and return a `TechniqueMasteryRarityMap`.

#### Generic Builders

These give you full control but require explicit per-rarity definitions:

- **`createUpgradeMap(key, rarity, upgrades)`** - Explicit per-rarity tooltip/change/shouldMultiply. Omit a rarity by passing `undefined` for that tier.
- **`createUpgradeMapSimple(key, rarity, tooltip, shouldMultiply, changes, renderTransform?)`** - One tooltip template with `{change}` placeholder; per-rarity numbers in `changes`. `renderTransform` lets you customise the displayed value (e.g. converting to percentages).
- **`createUpgradeMapStepped(key, rarity, tooltip, maxChange, shouldMultiply?, renderTransform?)`** - Automatically steps the value from `maxChange/5` (mundane) up to `maxChange` (incandescent), dropping rarities whose value reaches zero or flips sign.

#### Percentage Helpers (5% mundane to 30% transcendent)

These are shorthand for common multiplicative patterns:

- **`create30PercentUpgradeMap(key, rarity, tooltip)`** - Arbitrary key at 5-30% multiplicative.
- **`createPowerUpgradeMap(key, rarity)`** - Technique base power (named `basePower`).
- **`createScalingUpgradeMap(key, rarity)`** - Technique scaling stat multiplier.
- **`createDamageUpgradeMap(key, rarity)`** - Damage dealt.
- **`createHealingUpgradeMap(key, rarity)`** - Health restored.
- **`createBarrierUpgradeMap(key, rarity)`** - Barrier granted.
- **`createTemporaryHealthUpgradeMap(key, rarity)`** - Temporary health granted.

#### Named Buff Helpers

These auto-generate tooltips referencing a specific buff:

- **`createStacksUpgradeMap(key, rarity, buffName, maxChange)`** - Stacks of a buff gained by the technique. Pass negative `maxChange` for reductions.
- **`createCleanseUpgradeMap(key, rarity, buffName, maxChange, verb)`** - Stacks of a buff removed by a cleanse. `verb` controls the tooltip word (e.g. `'cleansed'`, `'consumed'`).
- **`createStacksInflictedUpgradeMap(key, rarity, buffName, maxChange)`** - Stacks of a buff inflicted on the target.
- **`createCostUpgradeMap(key, rarity, buffName, maxChange)`** - Buff cost of an effect (pass negative to reduce).
- **`createRequirementUpgradeMap(key, rarity, buffName, maxChange)`** - Buff requirement of an effect (pass negative to reduce).
- **`createMaxIncreaseUpgradeMap(key, rarity, buffName, maxChange)`** - Maximum stacks of one or more buffs. `buffName` can be a string or an array of names joined with `'and'` in the tooltip.

#### Special Helpers

- **`createSingleTierMastery(mastery)`** - Wrap a single `TechniqueMastery` so it can only roll at transcendent rarity.
- **`createRoundBuffMap(buff, rarity, chanceStep, effectKind?)`** - Grants `buff` with a chance that scales per rarity (`chanceStep * tier` at each step; above 100% grants one guaranteed stack plus a chance at a second). `effectKind` is `'buffSelf'` (default) or `'buffTarget'`.
- **`createStackingRoundBuffMap(buff, rarity, stacks, effectKind?)`** - Grants a fixed `stacks` per rarity (0 to skip that rarity).
- **`createFullKindMap(rarityMap)`** - Expand a rarity-map keyed by mastery name into a full `kind` map so the same masteries are offered for every technique effect kind. Use when building a custom mastery pool.

### Mastery Pools

```typescript
masteryKindPools: ['damage', 'heal', 'buffSelf'];
```

Determines which effect types can receive random mastery bonuses, allowing for build customization beyond fixed upgrades.

### Overwrite Effects Mastery

The `overwriteEffects` kind replaces a technique's entire effects list when unlocked. Use it for transcendent-tier upgrades that fundamentally change how a technique works rather than just scaling its numbers.

```typescript
interceptOnly: {
  rarity: 'transcendent',
  mundane: undefined,
  qitouched: undefined,
  empowered: undefined,
  resplendent: undefined,
  incandescent: undefined,
  transcendent: {
    kind: 'overwriteEffects',
    tooltip: 'The puppet no longer provides barrier, but increases its damage interception.',
    newEffects: [
      {
        kind: 'buffSelf',
        buff: alteredBuff,
        amount: { value: 1, stat: undefined },
      },
    ],
  },
}
```

## Triggered Effects

The `triggeredEffects` field allows technique effects to trigger additional effect chains:

```typescript
triggeredEffects: [
  {
    trigger: 'onHit',
    effects: [
      {
        kind: 'buffSelf',
        buff: someBuff,
        amount: { value: 1, stat: undefined },
      },
    ],
  },
],
```

Triggers fire when specific combat events occur. See the [Triggers](../combat/triggers/) page for full documentation.

## Hiding Auxiliary Tooltips

Individual technique effects can suppress their auxiliary tooltips using `hideAuxTooltip`. When the expression evaluates truthy, the following auxiliary tooltips are hidden:

- `barrier` effects: hides the "Barrier" mechanic aux tooltip
- `temporaryHealth` effects: hides the "Temporary Health" mechanic aux tooltip
- Effects that reference a buff (`buffSelf`, `buffTarget`, `consumeSelf`, `consumeTarget`, `convertSelf`, `mergeSelf`): hides the referenced buff's aux tooltip

This mirrors the same property on `BaseBuff` (issue #8943). Use it when the effect's context already makes the mechanic obvious, or when the buff is sourced from a tooltip fragment that already explains it.

```typescript
{
  kind: 'barrier',
  amount: { value: 0.5, stat: 'power' },
  hideAuxTooltip: 'stacks >= 3', // Hide barrier aux when player has 3 or more stacks
}
```

---
layout: default
title: Crafting Buff System
parent: Crafting System
nav_order: 1
description: 'Core concepts and mechanics of the AFNM crafting buff system'
---

# Crafting Buff System

Crafting buffs are temporary enhancements that modify your crafting statistics and capabilities during the crafting process. They are essential for overcoming difficult recipes and achieving high-quality results.

## Buff Structure

Every crafting buff follows the `CraftingBuff` interface:

```typescript
interface CraftingBuff {
  name: string; // Unique identifier
  displayName?: Translatable; // Optional translated display name
  icon: string; // Visual representation
  canStack: boolean; // Whether buff can stack

  // Stack management
  stacks: number; // Current stack count
  maxStacks?: number; // Maximum stack limit
  stacksAreMonths?: boolean; // If true, stacks represent in-game months (used for time-limited buffs)

  // Visual properties
  effectHint?: Translatable; // Brief hint text shown in the crafting UI
  tooltip?: Translatable; // Custom description (use tr() for deferred translation)
  statsTooltip?: Translatable; // Stats-specific tooltip override (use tr() for deferred translation)
  displayLocation: CraftingBuffDisplayLocation; // Where buff appears in UI
  // Locations: 'none' | 'avatar' | 'companion' | 'stabilityLeft' | 'stabilityRight' |
  // 'perfectionLeft' | 'perfectionRight' | 'completionLeft' | 'completionRight'
  companionImage?: string; // Full-body character image; only used when displayLocation === 'companion'

  // Stat modifications
  stats: Partial<{ [key in CraftingStatistic]: Scaling }> | undefined;

  // Main effects that always trigger
  effects: CraftingBuffEffect[];

  // Technique-specific triggers
  onFusion?: CraftingBuffEffect[]; // Triggers on fusion techniques
  onRefine?: CraftingBuffEffect[]; // Triggers on refine techniques
  onStabilize?: CraftingBuffEffect[]; // Triggers on stabilize techniques
  onSupport?: CraftingBuffEffect[]; // Triggers on support techniques

  // Scaling properties
  baseScaling?: number; // Base scaling value for stat effects
  stacksScaling?: number; // Per-stack scaling multiplier

  // Upgrade flag
  cantUpgrade?: boolean; // If true, cannot be upgraded via mastery

  // Animation triggers - fired in the UI when certain events occur during crafting
  // Valid values: 'bump' | 'buff' | 'completion' | 'perfection' | 'stabilityup' | 'stabilitydown' | 'pool'
  animations?: (
    'bump' | 'buff' | 'completion' | 'perfection' | 'stabilityup' | 'stabilitydown' | 'pool'
  )[];

  // Advanced fields
  bonusHiddenPotential?: Scaling; // Grants bonus hidden potential to the crafted item when this buff is active
  /**
   * Lifts the perfection/completion cap by this many threshold steps. Each step added
   * past the recipe's natural cap stretches the bar to one more 1.3x-scaled threshold
   * on top of whatever `canOvercraft`/`sublimeItem` already allow, so a +1 buff turns
   * a 5-step cap into a 6-step cap. The cap is computed once per craft and threaded
   * through `getMaxCompletion` / `getMaxPerfection`. Composes additively with
   * `canOvercraft` and `sublimeItem`; floored at one step so a build with neither
   * still has a reachable cap even if the boost is negative.
   */
  bonusMaximumQuality?: Scaling;
  /**
   * Awards this many hidden potential stars on the finished item if the craft reaches
   * the maximum possible perfection tier (i.e. the highest quality the recipe and any
   * `bonusMaximumQuality` buffs together define). Grants nothing on partial-perfect
   * finishes; pair with `bonusMaximumQuality` if you want the buff to do anything on
   * lower tiers. Mirrors the read path for `bonusHiddenPotential` in the crafting
   * completion handler.
   */
  bonusQuality?: Scaling;
  realm?: Realm; // Minimum realm required for this buff to apply its effects
  deweight?: boolean; // Hide from the crafting buff row; surface only in the expanded effects panel (use for passive mastery markers the player does not need to track live during crafting)
}
```

## Tooltip Translation

The `tooltip` and `statsTooltip` fields accept a `Translatable` value, either a plain string or a `TranslatableString` created with `tr()`. Use `tr()` for deferred translation so the text is resolved at render time rather than module load time:

```typescript
import { tr } from 'afnm-types';

// Plain string (translated as-is)
tooltip: 'Grants bonus stability on each fusion.',

// Deferred translation (recommended for data definitions)
tooltip: tr(
  'Grants bonus stability on each fusion.',
  {},
  'craftingBuff',
),
```

The `tr()` function takes the translation key string, a variables record, and an optional context string. See the [Translation](../advanced-mods/translation) docs for full details.

## Core Crafting Statistics

Buffs modify these key statistics:

- **Qi Intensity** (`intensity`) - Increases completion from fusion actions
- **Qi Control** (`control`) - Increases perfection from refine actions
- **Max Qi Pool** (`maxpool`) - Maximum qi pool size
- **Qi Pool** (`pool`) - Current qi pool (usually only read, not set via stats)
- **Max Toxicity** (`maxtoxicity`) - Maximum toxicity capacity
- **Toxicity** (`toxicity`) - Current toxicity level (read-only; useful as a scaling stat in expressions)
- **Toxicity Resistance** (`resistance`) - Reduces toxicity accumulation; positive values are capped at 90% (additional resistance has no further effect)
- **Crit Chance** (`critchance`) - Chance for enhanced effects
- **Crit Multiplier** (`critmultiplier`) - Damage/effect multiplier on critical actions
- **Pool Cost Multiplier** (`poolCostPercentage`) - Reduces qi costs (negative values reduce cost)
- **Stability Cost Multiplier** (`stabilityCostPercentage`) - Reduces stability loss (negative values reduce cost)
- **Action Success Chance** (`successChanceBonus`) - Improves technique success rate
- **Pills Per Action** (`pillsPerRound`) - Number of pills usable per crafting action
- **Item Effectiveness** (`itemEffectiveness`) - Effectiveness of consumables used during crafting
- **Completion Boost** (`completionBoost`) - Multiplies completion gains (1 + boost/100)
- **Perfection Boost** (`perfectionBoost`) - Multiplies perfection gains (1 + boost/100)
- **Stability Boost** (`stabilityBoost`) - Multiplies stability gains and losses; does not affect costs (1 + boost/100)
- **Qi Boost** (`qiBoost`) - Multiplies qi pool gains and restoration; does not affect costs (1 + boost/100)

## Quality Cap Buffs

Two fields on `CraftingBuff` extend the quality tier system beyond its default limits.

### `bonusMaximumQuality`

Lifts the perfection and completion caps by additional threshold steps. Each step adds one 1.3x-scaled threshold on top of what `canOvercraft` and `sublimeItem` already allow. Compose it additively with those recipe flags:

```typescript
// A flame that raises the cap by 1 step at base tier and 2 steps at upgraded tier
const myFlame: FlameItem = {
  kind: 'flame',
  buffs: [{
    buff: {
      name: `My Flame (${realmToTier[e]})`,
      icon: myFlameIcon,
      canStack: false,
      stats: undefined,
      effects: [],
      stacks: 1,
      displayLocation: 'none',
      bonusMaximumQuality: {
        value: realms.indexOf(e) >= realms.indexOf('pillarCreation') ? 2 : 1,
        stat: undefined,
      },
    },
    buffStacks: { value: 1, stat: undefined },
  }],
  // ...
};
```

The cap is computed once per craft and passed as `maxStepsBoost` to `getMaxCompletion` / `getMaxPerfection`. It is floored at one step so a recipe with no `canOvercraft` and no `sublimeItem` always has a reachable cap.

### `bonusQuality`

Awards hidden potential stars on the finished item only when the craft reaches the maximum possible perfection tier. Grants nothing on partial-perfect finishes. Pair it with `bonusMaximumQuality` if you want the buff to have any effect at lower tiers:

```typescript
const myFlameBuff: CraftingBuff = {
  name: 'My Flame',
  icon: myFlameIcon,
  canStack: false,
  stats: undefined,
  effects: [],
  stacks: 1,
  displayLocation: 'none',
  // Awards 1 bonus star at lifeFlourishing realm and above
  bonusMaximumQuality: { value: 1, stat: undefined },
  bonusQuality: { value: 1, stat: undefined },
};
```

## Buff Categories

### Stat Enhancement Buffs

Direct improvements to crafting statistics:

```typescript
export const empowerIntensity: CraftingBuff = {
  name: 'Empower Intensity',
  icon: intensityIcon,
  canStack: true,
  maxStacks: 10,
  stats: {
    intensity: { value: 0.15, stat: undefined, scaling: 'stacks' },
  },
  effects: [],
  stacks: 1,
  displayLocation: 'completionRight',
};
```

### Cost Reduction Buffs

Lower resource consumption:

```typescript
export const skillfulManipulation: CraftingBuff = {
  name: 'Skillful Manipulation',
  icon: skillIcon,
  canStack: true,
  stats: {
    poolCostPercentage: { value: -0.2, stat: undefined },
  },
  effects: [
    {
      kind: 'addStack',
      stacks: { value: -1, stat: undefined }, // Loses stack per action
    },
  ],
  stacks: 3,
  displayLocation: 'avatar',
};
```

### Conditional Buffs

Activate effects only when specific techniques are used:

```typescript
export const fusionEnlightenment: CraftingBuff = {
  name: 'Fusion Enlightenment',
  icon: fusionIcon,
  canStack: false,
  stats: undefined,
  effects: [],
  onFusion: [
    {
      kind: 'completion',
      amount: { value: 8, stat: 'intensity' },
    },
  ],
  stacks: 1,
  displayLocation: 'completionRight',
};
```

### Resource Generation Buffs

Restore or preserve resources:

```typescript
export const gentleReenergisation: CraftingBuff = {
  name: 'Gentle Re-energisation',
  icon: energyIcon,
  canStack: true,
  stats: undefined,
  effects: [
    {
      kind: 'pool',
      amount: { value: 5, stat: undefined },
    },
    {
      kind: 'addStack',
      stacks: { value: -1, stat: undefined }, // Loses stack per turn
    },
  ],
  stacks: 5,
  displayLocation: 'avatar',
};
```

## Buff Effect Types

Buffs can produce these effect types:

### Completion Effect

Advances craft completion:

```typescript
{ kind: 'completion', amount: { value: 10, stat: 'intensity' } }
```

### Perfection Effect

Improves item quality:

```typescript
{ kind: 'perfection', amount: { value: 5, stat: 'control' } }
```

### Stability Effect

Modifies current stability only (not maximum):

```typescript
{ kind: 'stability', amount: { value: 3, stat: undefined } }
```

**Important:** This restores/reduces your active stability pool without changing the cap.

### Max Stability Effect

Changes the maximum stability ceiling:

```typescript
{ kind: 'maxStability', amount: { value: 1, stat: undefined } }
```

**Important:** This modifies how much stability you can have total. Reducing max below current will force current down.

### Pool Effect

Restores qi pool:

```typescript
{ kind: 'pool', amount: { value: 10, stat: undefined } }
```

### Create Buff Effect

Generates other buffs:

```typescript
{ kind: 'createBuff', buff: otherBuff, stacks: { value: 2, stat: undefined } }
```

### Add Stack Effect

Modifies buff's own stacks:

```typescript
{ kind: 'addStack', stacks: { value: -1, stat: undefined } }
```

### Change Toxicity Effect

Modifies toxicity levels:

```typescript
{ kind: 'changeToxicity', amount: { value: -5, stat: undefined } }
```

### Negate Effect

Cancels other buff effects for this trigger. Used to prevent a buff from acting under certain conditions:

```typescript
{ kind: 'negate' }
```

## Conditional Effects

Every buff effect type supports an optional `condition` field that makes the effect conditional. Conditions use the same `CraftingTechniqueCondition` type as technique effects:

```typescript
// Only restore stability when current stability is below 30%
{
  kind: 'stability',
  amount: { value: 5, stat: undefined },
  condition: { kind: 'stability', percentage: 30, mode: 'less' },
}

// Grant completion with a 40% chance
{
  kind: 'completion',
  amount: { value: 8, stat: 'intensity' },
  condition: { kind: 'chance', percentage: 40 },
}

// Negate this buff's effects unless a specific buff is active
{
  kind: 'negate',
  condition: { kind: 'buff', buff: concentrationBuff, count: 1, mode: 'less' },
}
```

Available condition kinds:

| Kind          | Fields                                                    | Description                                      |
| ------------- | --------------------------------------------------------- | ------------------------------------------------ |
| `chance`      | `percentage: number`                                      | Random chance (0-100)                           |
| `buff`        | `buff: CraftingBuff | 'self'`, `count: number`, `mode: 'more' | 'less' | 'equal'` | Based on stack count of a buff |
| `stability`   | `percentage: number`, `mode: 'more' | 'less'`           | Based on current stability as % of max           |
| `perfection`  | `percentage: number`, `mode: 'more' | 'less'`           | Based on perfection progress %                   |
| `completion`  | `percentage: number`, `mode: 'more' | 'less'`           | Based on completion progress %                   |
| `pool`        | `percentage: number`, `mode: 'more' | 'less'`           | Based on current qi pool as % of max             |
| `toxicity`    | `percentage: number`, `mode: 'more' | 'less'`           | Based on current toxicity as % of max            |
| `condition`   | `condition: string`                                       | Based on recipe condition state (e.g. `'positive'`) |

## Buff Triggers

Buffs can activate through different trigger mechanisms:

### Main Effects

Always active effects that apply continuously or on specific conditions:

```typescript
effects: [
  {
    kind: 'stability',
    amount: { value: 2, stat: undefined },
  },
];
```

### On Fusion

Triggers specifically when fusion techniques are used:

```typescript
onFusion: [
  {
    kind: 'completion',
    amount: { value: 5, stat: undefined },
  },
];
```

### On Refine

Triggers specifically when refine techniques are used:

```typescript
onRefine: [
  {
    kind: 'perfection',
    amount: { value: 3, stat: undefined },
  },
];
```

### On Stabilize

Triggers specifically when stabilize techniques are used:

```typescript
onStabilize: [
  {
    kind: 'maxStability',
    amount: { value: 1, stat: undefined },
  },
];
```

### On Support

Triggers specifically when support techniques are used:

```typescript
onSupport: [
  {
    kind: 'createBuff',
    buff: focusBuff,
    stacks: { value: 2, stat: undefined },
  },
];
```

## Stack Management

Buffs can lose or gain stacks through their effects:

### Self-Consuming Effects

Buffs can reduce their own stacks through `addStack` effects:

```typescript
effects: [
  {
    kind: 'addStack',
    stacks: { value: -1, stat: undefined }, // Loses 1 stack
  },
];
```

### Technique-Triggered Consumption

Buffs can lose stacks when specific techniques are used:

```typescript
onFusion: [
  {
    kind: 'perfection',
    amount: { value: 10, stat: undefined },
  },
  {
    kind: 'addStack',
    stacks: { value: -1, stat: undefined }, // Consume on use
  },
];
```

## Buff Display -- Deweighting Passive Markers

The `deweight` flag hides a buff from the main crafting buff row, surfacing it only in the expanded effects popout:

```typescript
export const passiveMasteryMarker: CraftingBuff = {
  name: 'Mastery Insight',
  icon: masteryIcon,
  canStack: true,
  stats: undefined,
  effects: [],
  stacks: 1,
  displayLocation: 'none',
  deweight: true, // Player doesn't need to track this live during crafting
};
```

Mark passive, self-refreshing mastery markers and item markers that get refreshed every round with `deweight: true`. These should be the first buffs to spill into the expand list when the row is space-constrained.

## Buff Interactions

### Stacking Behavior

- **Additive stacking** - Each stack adds its full effect
- **Max stacks** - Prevents infinite accumulation
- **Non-stackable** - Only one instance can exist

### Buff Synergies

Some buffs work better together:

```typescript
// Focus buff enhances other techniques
export const focus: CraftingBuff = {
  name: 'Focus',
  icon: focusIcon,
  canStack: true,
  maxStacks: 20,
  stats: undefined,
  effects: [],
  // Consumed by powerful techniques for bonus effects
  stacks: 1,
};
```

---
layout: default
title: Crafting Techniques
parent: Crafting System
nav_order: 3
description: 'How to define and register crafting techniques'
---

# Crafting Techniques

Crafting techniques are active abilities used during the crafting process to manipulate materials, manage resources, and influence outcomes.

## Interface

```typescript
interface CraftingTechnique {
  id: string;
  name: Translatable;
  description: Translatable;
  icon: SvgIconType | CustomSvgIcon;

  type: CraftingTechniqueType; // 'fusion' | 'refine' | 'support' | 'stabilize'

  // Resource costs
  stabilityCost?: number;       // Stability removed from current when used
  maxStabilityCost?: number;     // Stability removed from max when used
  poolCost?: number;             // Qi drawn from pool when used

  // Effects
  effects: CraftingEffect[];     // What happens when technique is used

  // Mastery upgrades
  upgradeMasteries?: { [key: string]: CraftingTechniqueMasteryRarityMap };
  masteryKindPools?: CraftingEffectKind[];

  // Visual
  colour?: string;               // CSS colour for the technique's effect particles
  particleIcon?: string;         // Override particle image

  // UI
  isItem?: boolean;              // Technique is granted by an item (e.g. pills)
  successChance?: number;        // 0-1 chance of success; defaults to 1
  critThreshold?: number;         // Threshold for perfection/crit success; defaults to 0.9
}
```

## Technique Types

Four technique types drive all crafting:

### Fusion (`fusion`)

Increases **completion** progress. The foundational technique type for basic crafting.

```typescript
type: 'fusion',
effects: [
  {
    kind: 'completion',
    amount: { value: 1, stat: 'control', upgradeKey: 'completion' },
  }
]
```

### Refine (`refine`)

Increases **perfection** progress. Higher risk/reward — often has stricter requirements or higher stability costs.

```typescript
type: 'refine',
effects: [
  {
    kind: 'perfection',
    amount: { value: 1.5, stat: 'control', upgradeKey: 'perfection' },
  }
]
```

### Support (`support`)

Applies helpful **buffs** to the crafter or the craft itself. Does not directly advance progress.

```typescript
type: 'support',
effects: [
  {
    kind: 'buffSelf',
    buff: swiftHands,
    amount: { value: 1, stat: undefined, upgradeKey: 'stacks' },
  }
]
```

### Stabilize (`stabilize`)

Restores **current stability** and applies stability-related buffs. Critical for managing risk in complex crafts.

```typescript
type: 'stabilize',
effects: [
  {
    kind: 'stability',
    amount: { value: 0.5, stat: 'control', upgradeKey: 'stability' },
  }
]
```

## Resource Costs

Understanding stability costs is critical for balanced technique design:

```typescript
// Low impact — only affects current stability
stabilityCost: 5,

// High impact — reduces the cap, limiting future technique use
maxStabilityCost: 10,

// Qi pool consumption
poolCost: 20,
```

**Stability mechanics:**

- Current stability falling to 0 causes craft failure
- Max stability sets the ceiling for current stability
- Techniques that reduce max stability without restoring current first are dangerous
- The `noMaxStabilityLoss` flag on effects preserves max stability (only current drops)

## Effects Reference

### Completion (`completion`)

Advances the completion meter:

```typescript
{
  kind: 'completion',
  amount: Scaling,
}
```

### Perfection (`perfection`)

Advances the perfection meter:

```typescript
{
  kind: 'perfection',
  amount: Scaling,
}
```

### Stability (`stability`)

Restores current stability:

```typescript
{
  kind: 'stability',
  amount: Scaling,
}
```

### Buff Effects

Apply or consume crafting buffs:

```typescript
// Apply a crafting buff to the crafter
{
  kind: 'buffSelf',
  buff: craftingBuff,
  amount: Scaling,
}

// Apply a crafting buff to the craft
{
  kind: 'buffCraft',
  buff: craftBuff,
  amount: Scaling,
}

// Consume stacks of a crafting buff
{
  kind: 'consumeSelf',
  buff: craftingBuff,
  amount: Scaling,
}
```

### Conditional Effects

Effects can be conditional based on current crafting state:

```typescript
{
  kind: 'perfection',
  amount: { value: 1, stat: 'control', upgradeKey: 'perfection' },
  condition: {
    kind: 'condition',
    condition: 'currentStability > 50',
  },
}
```

### Scaling Reference

All `amount` fields use the `Scaling` type for stat-based values:

```typescript
{
  value: number;          // Base value
  stat?: StatName;       // Stat to scale from (e.g. 'control', 'intensity')
  upgradeKey?: string;   // Links to mastery upgrade
  equation?: string;      // Custom equation using {stat}
}
```

The game supports these stats for crafting techniques: `control`, `intensity`, `pool`, `power`, `qiAbsorption`, `masteryPoints`, `charisma`, `speed`.

## Registration

Use `addCraftingTechnique` to register a technique with the game:

```typescript
window.modAPI.actions.addCraftingTechnique({
  id: 'my_custom_technique',
  name: 'Custom Fusion',
  description: 'A powerful completion technique.',
  icon: MyCustomIcon,
  type: 'fusion',
  stabilityCost: 10,
  poolCost: 15,
  effects: [
    {
      kind: 'completion',
      amount: { value: 2, stat: 'control' },
    },
  ],
});
```

## Mastery System

Crafting techniques can be upgraded through the mastery system. All helper functions are available on `window.modAPI.utils`.

### Quick Reference

```typescript
upgradeMasteries: {
  completion: window.modAPI.utils.createCraftingCompletionUpgradeMap('completion', 'empowered'),
  perfection: window.modAPI.utils.createCraftingPerfectionUpgradeMap('perfection', 'empowered'),
  pool: window.modAPI.utils.createCraftingPoolUpgradeMap('pool', 'empowered'),
  stability: window.modAPI.utils.createCraftingStabilityUpgradeMap('stability', 'empowered'),
  stacks: window.modAPI.utils.createCraftingStacksUpgradeMap('stacks', 'resplendent', 'Empower Intensity', 2),
  cost: window.modAPI.utils.createCraftingCostUpgradeMap('poolCost', 'empowered', 'Qi Pool', -5),
}
```

### Rarity Tiers

Crafting technique masteries use the same rarity tiers as combat techniques:

| Tier | Value |
|------|-------|
| mundane | 1 |
| qitouched | 2 |
| empowered | 3 |
| resplendent | 4 |
| incandescent | 5 |
| transcendent | 6 |

Use the **tier value** (left column) when specifying `startRarity` arguments in helper functions.

### Upgrade Types

The `upgradeMasteries` field maps upgrade keys to a `CraftingTechniqueMasteryRarityMap`, defining how the technique improves at each mastery tier. Use the helper functions from the mastery system:

#### Effect Upgrades

Increase completion/perfection/pool/stability amounts multiplicatively (5% mundane to 30% transcendent):

```typescript
upgradeMasteries: {
  completion: window.modAPI.utils.createCraftingCompletionUpgradeMap('completion', 'empowered'),
  perfection: window.modAPI.utils.createCraftingPerfectionUpgradeMap('perfection', 'empowered'),
  pool: window.modAPI.utils.createCraftingPoolUpgradeMap('pool', 'empowered'),
  stability: window.modAPI.utils.createCraftingStabilityUpgradeMap('stability', 'empowered'),
}
```

Each function takes `(upgradeKey: string, startRarity: Rarity)`. The `upgradeKey` must match the `upgradeKey` on the `Scaling` object of the effect you want upgraded.

There is also `createCraftingPowerUpgradeMap(key, rarity, tooltip)` for custom effect scaling — it applies the same multiplicative upgrade percentages but accepts a custom tooltip string.

#### Generic Builders

For full control over per-rarity values:

- **`createCraftingUpgradeMap(key, rarity, upgrades)`** — Explicit per-rarity tooltip/change/shouldMultiply. Omit a rarity by passing `undefined`.
- **`createCraftingUpgradeMapSimple(key, rarity, tooltip, shouldMultiply, changes, renderTransform?)`** — One tooltip template with `{change}` placeholder; per-rarity numbers in `changes`.
- **`createCraftingUpgradeMapStepped(key, rarity, tooltip, maxChange)`** — Automatically steps the value from `maxChange/5` (mundane) up to `maxChange` (incandescent).

#### Buff Stack Upgrades

Increase the number of buff stacks granted:

```typescript
upgradeMasteries: {
  stacks: window.modAPI.utils.createCraftingStacksUpgradeMap('stacks', 'resplendent', 'Empower Intensity', 2),
}
```

`createCraftingStacksUpgradeMap(key, startRarity, buffName, maxChange)` — `maxChange` is the maximum stack change at Transcendent tier.

#### Cost Reductions

Lower resource consumption (pool cost, stability cost):

```typescript
upgradeMasteries: {
  poolCost: window.modAPI.utils.createCraftingCostUpgradeMap('poolCost', 'empowered', 'Qi Pool', -5),
}
```

`createCraftingCostUpgradeMap(key, startRarity, costName, maxChange)` — `costName` appears in the mastery tooltip. Use negative `maxChange` to reduce costs.

#### Max Amount Increases

Increase the maximum amount of a stepped value:

```typescript
upgradeMasteries: {
  maxStacks: window.modAPI.utils.createCraftingMaxIncreaseUpgradeMap('maxStacks', 'resplendent', 3),
}
```

`createCraftingMaxIncreaseUpgradeMap(key, startRarity, maxChange)` — useful for techniques that cap at a certain amount.

#### Success Improvements

Success chance is **automatically added** by the game as a mastery bonus for any technique with `successChance < 1`. You do not need to define it in `upgradeMasteries`.

### `masteryKindPools`

By default, the game determines which mastery upgrades are available based on a technique's effect kinds (completion, perfection, pool, stability, etc.). Setting `masteryKindPools` overrides this list:

```typescript
masteryKindPools: ['completion', 'pool'], // Only offer completion and pool mastery upgrades
```

This is useful when a technique has multiple effect kinds but you only want mastery selection to draw from a subset.

### Custom Thresholds

A recipe can define a named **custom threshold** — a quality milestone that runs its own event outcome in place of the sublime one when cleared. This lets a craft award different results depending on how well the player performed beyond mere perfection.

Define the threshold in the recipe:

```typescript
export const myRecipe: Recipe = {
  id: 'my_recipe',
  name: 'Celestial Pill',
  // ... other fields ...
  customThreshold: {
    name: 'Celestial Radiance',
    threshold: 3, // Clear at 3 perfection tiers above perfect
    tooltip: 'Achieve true perfection with the celestial radiance.',
  },
  sublimeSteps: [{ kind: 'text', text: 'You produce a sublime pill.' }],
  perfectSteps: [{ kind: 'text', text: 'You produce a perfect pill.' }],
  outcomeSteps: [
    // Called when custom threshold is NOT met (falls back to sublime outcome)
    { kind: 'text', text: 'The pill absorbs the celestial energy.' },
    // Called when custom threshold IS met
    { kind: 'text', text: 'The pill blazes with celestial radiance!' },
  ],
};
```

The `CraftCustomThreshold` interface:

```typescript
interface CraftCustomThreshold {
  /** Title shown on the quality bar. */
  name: Translatable;
  /** Quality tiers the craft has to reach to clear the mark. */
  threshold: number;
  /** Tooltip for the bar. A generic line is used when this is unset. Both this and
   *  the generic line are given `{needed}` (the threshold) and `{name}`. */
  tooltip?: Translatable;
}
```

When the threshold is met, the craft's `outcomeSteps` fires with the threshold's name available via `{name}` in text. When it is not met, the sublime outcome fires instead.

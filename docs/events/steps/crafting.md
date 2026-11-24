---
layout: default
title: Crafting Step
parent: Event Step Types
grand_parent: Events System
nav_order: 24
description: 'Initiate crafting'
---

# Crafting Step

## Introduction

The Crafting Step initiates crafting challenges with different branches based on the results.

## Interface

```typescript
interface CraftingStep {
  kind: 'crafting';
  condition?: string;
  recipe: string;
  basicCraftSkill: number;
  perfectCraftSkill: number;
  sublimeCraftSkill?: number;
  customThreshold?: CraftingStepCustomThreshold;
  sublime?: EventStep[];
  perfect: EventStep[];
  basic: EventStep[];
  failed: EventStep[];
  useCurrentBackground?: boolean;
  buffs?: CraftingBuff[];
  forceSublimeCrafting?: boolean;
}
```

## Properties

- `kind` - Always `'crafting'`

- `recipe` - Exact `name` of the [registered recipe](../../crafting/recipes.md#registering-recipes-via-the-mod-api)

- `basicCraftSkill` - Craft skill given on basic result

- `perfectCraftSkill` - Craft skill given on perfect result

- `sublimeCraftSkill` - Craft skill given on sublime result (optional)

- `sublime` - Steps for a Sublime result. If omitted or empty, the Sublime result uses `perfect`.

- `perfect` - Steps for perfect outcome

- `basic` - Steps for basic success

- `failed` - Steps for failed crafting

- `useCurrentBackground` - Keep current screen background (optional)

- `buffs` - Applied crafting buffs (optional)

- `forceSublimeCrafting` - Force sublime crafting mode (optional)

- `condition` - Conditional execution (optional)

## Reward a quality target

To give a crafting commission a bonus outcome, set `customThreshold` on the crafting step in your [event's step list](../events.md). The step's threshold supplies the quality mark for this attempt. A positive threshold lets the craft build Perfection beyond its normal cap, up to the recipe realm's limit.

`CraftingStepCustomThreshold` uses the [quality mark fields](../../crafting/recipes.md#custom-thresholds) `name`, `threshold`, and optional `tooltip`, plus a `steps` array and optional `requiresSublime`. Set `threshold` to the minimum total quality tiers the finished craft must earn. A successful craft at or above the mark runs the custom `steps` in place of its usual outcome branch. Leave `requiresSublime` unset to accept any successful result that reaches the mark. Set it to `true` when the commission also requires a Sublime result, and ensure that the recipe and event allow Sublime crafting. An empty custom branch, a missed requirement, or a failed craft uses the usual outcome branch.

Given a registered `commissionRecipe` and a flag your event checks for the bonus, this step sets the flag on a successful craft with at least two quality tiers. Raise the threshold for a harder quality target within the recipe's reachable range.

```typescript
{
  kind: 'crafting',
  recipe: commissionRecipe.name,
  basicCraftSkill: 0,
  perfectCraftSkill: 1,
  basic: [],
  perfect: [],
  failed: [],
  customThreshold: {
    name: 'Commission Quality',
    threshold: 2,
    steps: [{ kind: 'flag', flag: 'myModCommissionBonus', value: '1', global: true }],
  },
}
```

## Examples

```typescript
{
  kind: 'crafting',
  recipe: healingPillIRecipe.name,
  basicCraftSkill: 0,
  perfectCraftSkill: 1,
  perfect: [{ kind: 'text', text: 'Perfect pill created!' }],
  basic: [{ kind: 'text', text: 'Basic pill created.' }],
  failed: [{ kind: 'text', text: 'Crafting failed.' }]
}
```

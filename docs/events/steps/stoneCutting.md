---
layout: default
title: Stone Cutting Step
parent: Event Step Types
grand_parent: Events System
nav_order: 54
description: "Interactive spirit stone cutting mini-game"
---

# Stone Cutting Step

## Introduction

The Stone Cutting Step presents an interactive mini-game where the player cuts spirit stones from a raw stone. The player can choose to unveil the stone (revealing what tier of stone they cut) or proceed to cut directly. Stone cutting can have costs, discounts, and free cuts controlled by step parameters.

## Interface

```typescript
interface StoneCuttingStep extends BaseEventStep {
  kind: 'stoneCutting';
  /** Realm determining stone quality range (e.g. 'qiCondensation', 'coreFormation') */
  realm: Realm;
  /** Percentage discount to apply to cutting costs (0-100). Evaluated as expression. */
  discountPercentage?: string;
  /** Number of stones the player can cut for free. Evaluated as expression. */
  freeCount?: string;
}
```

## Properties

- **`kind`** - Always `'stoneCutting'`

- **`realm`** - The realm tier that determines the quality range and value of stones. Higher realms yield better stones.

- **`discountPercentage`** *(optional)* - A percentage discount (0-100) applied to the cutting cost. Supports dynamic expressions evaluated at runtime (see [Flags](../concepts/flags)). A `discountPercentage` of 50 halves the cost.

- **`freeCount`** *(optional)* - Number of stones the player can cut without paying the cost. Each free cut increments an internal counter; once exhausted, normal costs apply. Supports dynamic expressions evaluated at runtime.

## How It Works

On entering the step, the player sees a raw stone and two options: **Unveil** (reveals the stone tier before committing) or **Cut** (cuts immediately). The cost for each attempt is:

```
baseCost = getNumericReward(1500, realm, 'Late') * (turn + 1)
finalCost = floor(baseCost * (1 - discountPercentage / 100))
```

If `freeCount` is set and `stonesBoughtForFree < freeCount`, the cost is `0` instead.

Stones have five quality tiers from lowest to highest: **Chaff**, **Earthly**, **Spirit**, **Heavenly**, and **Mysterious**. Each cut attempt produces one stone at a tier determined by the realm and a random roll.

After the mini-game, the player receives their cut stones as items.

## Example

```typescript
// Basic stone cutting at Qi Condensation realm
{
  kind: 'stoneCutting',
  realm: 'qiCondensation',
}

// Stone cutting with 20% discount
{
  kind: 'stoneCutting',
  realm: 'coreFormation',
  discountPercentage: '20',
}

// Stone cutting with 3 free cuts, then 50% discount on additional cuts
{
  kind: 'stoneCutting',
  realm: 'pillarCreation',
  freeCount: '3',
  discountPercentage: '50',
}
```

## Stone Quality Tiers

| Tier | Description |
|------|-------------|
| Chaff | Lowest quality, minimal value |
| Earthly | Common quality |
| Spirit | Standard quality |
| Heavenly | Rare quality |
| Mysterious | Highest quality, rare drop |
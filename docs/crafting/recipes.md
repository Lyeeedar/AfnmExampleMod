---
layout: default
title: Crafting Recipes
parent: Crafting System
nav_order: 2
description: 'How to define and register crafting recipes in AFNM'
---

# Crafting Recipes

Recipes are items that unlock crafting at the crafting hall. Each recipe defines what it produces, what ingredients are required, and how difficult the craft is.

## RecipeItem Structure

```typescript
interface RecipeItem {
  kind: 'recipe';
  name: string;        // Recipe item name (e.g. "Radiant Focus Pill Recipe")
  description: string; // Flavour text shown in the compendium
  icon: string;        // Icon image import
  rarity: Rarity;      // Item rarity
  realm: Realm;        // Minimum realm to obtain/view this recipe
  stacks: number;      // Stack size (almost always 1)

  baseItem: Item;      // Basic-quality crafted result
  perfectItem: Item;   // Perfect-quality crafted result
  sublimeItem?: Item;  // Optional sublime-quality crafted result

  realmProgress: 'Early' | 'Middle' | 'Late'; // Complexity within the realm
  difficulty: RecipeDifficulty;

  ingredients: {
    item: Item;
    quantity: number;
  }[];

  // Optional overrides
  conditionEffectOverride?: RecipeConditionEffect; // Override default condition type
  harmonyTypeOverride?: RecipeHarmonyType;         // Override default harmony system
}
```

## Recipe Difficulty

```typescript
type RecipeDifficulty = 'easy' | 'medium' | 'hard' | 'veryhard' | 'veryhard+' | 'extreme';
```

Higher difficulty raises the bar during the crafting mini-game: stability costs increase, starting values are lower, and completion thresholds are tougher.

## Realm Progress

`realmProgress` controls how demanding the craft is within its realm:

| Value    | Meaning                     |
| -------- | --------------------------- |
| `Early`  | Accessible at realm entry   |
| `Middle` | Requires mid-realm progress |
| `Late`   | Requires late-realm mastery |

## Harmony Types

Each recipe uses one of four harmony systems during crafting. By default the game assigns a harmony type based on the item category. Use `harmonyTypeOverride` to force a specific type:

| Value         | Description                                          |
| ------------- | ---------------------------------------------------- |
| `forge`       | Forging — heat-based combo system                    |
| `alchemical`  | Alchemy — charge-and-combo system                    |
| `inscription` | Inscription — pattern-block system                   |
| `resonance`   | Resonance — technique-type matching resonance system |

## Registering Recipes via the Mod API

### Add to the Sect Recipe Library

Makes the recipe purchasable at the crafting hall:

```typescript
modAPI.addRecipeToLibrary(myRecipe);
```

### Add to the Research System

Associates a recipe with a base item so players can unlock it through the Vault of Infinite Reflections:

```typescript
// Players who obtain ancientScroll can research myRecipe
modAPI.addRecipeToResearch(ancientScroll, myRecipe);
```

## Full Example

```typescript
import recipeIcon from './assets/recipe-icon.png';
import { ironheartPill, ironheartPillPlus } from './items/ironheartPill';
import { ironwoodBark } from './items/ironwoodBark';
import { spiritCrystal } from './items/spiritCrystal';

export const ironheartPillRecipe: RecipeItem = {
  kind: 'recipe',
  name: 'Ironheart Pill Recipe',
  description: 'A tattered slip of parchment dense with alchemical notation.',
  icon: recipeIcon,
  rarity: 'mundane',
  realm: 'qi',
  stacks: 1,
  baseItem: ironheartPill,
  perfectItem: ironheartPillPlus,
  realmProgress: 'Middle',
  difficulty: 'medium',
  ingredients: [
    { item: ironwoodBark, quantity: 3 },
    { item: spiritCrystal, quantity: 1 },
  ],
};

// In your mod entry point:
export function init(modAPI) {
  modAPI.addRecipeToLibrary(ironheartPillRecipe);
}
```

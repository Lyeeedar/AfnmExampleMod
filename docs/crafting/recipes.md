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
  displayPerfect?: boolean; // When true, recipe screen shows the perfect-quality item as the representative instead of baseItem
  hideFromCompendium?: boolean; // Prevents the recipe from appearing in the compendium


  realmProgress: 'Early' | 'Middle' | 'Late'; // Complexity within the realm
  difficulty: RecipeDifficulty;

  ingredients: {
    item: Item;
    quantity: number;
  }[];

  // Optional overrides
  conditionEffectOverride?: RecipeConditionEffect; // Override default condition type
  harmonyTypeOverride?: RecipeHarmonyType;         // Override default harmony system
  perfectionEffectOverride?: 'quality';           // Controls what perfection affects in the crafted item
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

## Perfection Effect Override

Set `perfectionEffectOverride` to `'quality'` to make perfection affect the quality tier of the crafted item (basic/perfect/sublime) rather than applying a stat modifier. This is used by most recipes in the game.

```typescript
perfectionEffectOverride: 'quality';
```

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


## Display Flags

### `displayPerfect`

When `displayPerfect: true`, the recipe screen shows the **perfect-quality item** as the representative item for this recipe, rather than the base item. The base item is still used as a fallback if `perfectItem` is not defined.

```typescript
export const radiantFocusPillRecipe: RecipeItem = {
  kind: 'recipe',
  // ...
  baseItem: radiantFocusPill,
  perfectItem: radiantFocusPillPlus,
  displayPerfect: true, // show the + version in the recipe screen
  // ...
};
```

### Defensive Handling for Missing `perfectItem`

The game handles cases where `displayPerfect` is `true` but `perfectItem` is `undefined` (from mods or corrupted saves) by falling back to `baseItem`. Similarly, the recipe sorter uses `baseItem` as a fallback for both sides of comparisons when either item is missing, ensuring the recipe screen never crashes.

When implementing recipe-based mods, always ensure `perfectItem` is defined if `displayPerfect` is used, and prefer using the `displayPerfect` flag over manually constructing parallel item sets for the UI.

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
  realm: 'qiCondensation',
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

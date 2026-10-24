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
  perfectionEffectOverride?: 'quality';           // Controls what perfection affects in the crafted item

  // Optional presentation and behaviour flags
  displayPerfect?: boolean;       // Show the perfect result in the compendium
  displaySublime?: boolean;       // Show the sublime result, takes precedence over displayPerfect
  hideFromCompendium?: boolean;   // Keep the recipe out of the compendium
  disableInstantCraft?: boolean;  // Require the manual crafting process even when instant crafting is unlocked
  forceSublimeCrafting?: boolean; // Forces manual crafts to use a harmony and removes the basic craft option
  complexityMultiplier?: number;  // Scales the Completion and Perfection this recipe demands

  // Optional custom quality threshold
  customThreshold?: CraftCustomThreshold; // A named quality mark shown as its own bar above Completion

  /** Fixed starting stability for recipes with a restricted crafting window. */
  startingStability?: number;
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

Each recipe uses one of nine harmony systems during crafting. By default the game assigns a harmony type based on the item category. Use `harmonyTypeOverride` to force a specific type:

| Value             | Name                | Harmony rule                                                                 |
| ---------------- | ------------------- | ----------------------------------------------------------------------------- |
| `forge`           | Forge Works         | Maintain the heat of the cauldron to maintain Harmony                         |
| `alchemical`      | Alchemical Arts     | Mix the energies of different actions to maintain Harmony                     |
| `inscription`     | Inscribed Patterns  | Follow the inscribed pattern blocks to maintain Harmony                        |
| `resonance`       | Spiritual Resonance | Build the resonance of singular action types to maintain Harmony              |
| `formless`        | Formless Way        | Requires 100% more Completion and Perfection                                  |
| `enhancingEcho`   | Enhancing Echo      | Use your actions in echoing pairs to maintain Harmony                         |
| `eccentricDecree` | Eccentric Decree    | Pour your focus into one bar at a time to maintain Harmony, starting on Completion |
| `captivatingCadence` | Captivating Cadence | Build a Cadence by changing action types. Each chain point grants Harmony, Qi Intensity and Qi Control. Repeating the previous action type resets the chain, loses 50 Harmony and reduces max Stability by 1 |
| `returningCycle`  | Returning Cycle     | Store all Qi Pool spent. Every 10% of your starting Qi Pool spent grants 1 Charge. A Stabilize action spends the charges for Harmony and Returned Precision stacks, each of which grants crit chance |

## Perfection Effect Override

Set `perfectionEffectOverride` to `'quality'` to make perfection affect the quality tier of the crafted item (basic/perfect/sublime) rather than applying a stat modifier. This is used by most recipes in the game.

```typescript
perfectionEffectOverride: 'quality';
```

## Custom Thresholds

A custom threshold displays a quality mark as its own bar above the Completion and Perfection bars while the craft is worked. The bar shows how many quality tiers the craft has cleared versus the threshold the mark requires.

```typescript
interface CraftCustomThreshold {
  /** Title shown on the bar. */
  name: Translatable;
  /** Quality tiers the craft has to reach to clear the mark. */
  threshold: number;
  /** Tooltip for the bar. A generic line is used when this is unset.
   *  Both this and the generic line receive `{needed}` (the threshold value)
   *  and `{name}` (the bar title). */
  tooltip?: Translatable;
}
```

**How quality tiers work:** A finished craft earns quality tiers based on how well it scores on Perfection. The first tier clears the threshold and is spent reaching the perfect or sublime result; any tiers above that are bonuses. The bar fills as the player works the pot, and a cleared mark turns a distinct colour.

**In events:** When a craft comes out of a crafting event step, the event's `customThreshold` field sets the mark. Clearing it runs the threshold's own event steps in place of the sublime result.

```typescript
const myThreshold: CraftCustomThreshold = {
  name: tr('Masterwork'),
  threshold: 3,
  tooltip: tr('You need <num>{needed}</num> quality tiers to earn the Masterwork designation.'),
};
```

**Requires Sublime:** Set `requiresSublime: true` on `CraftingStepCustomThreshold` to also require the Sublime quality tier in addition to the custom threshold:

```typescript
{
  kind: 'crafting',
  basicCraftSkill: 1, perfectCraftSkill: 2,
  basic: [], perfect: [], failed: [],
  recipe: vaultSlipRecipe,
  customThreshold: {
    name: tr('Vault Quality'),
    threshold: 2,
    requiresSublime: true,
    steps: [
      { kind: 'text', text: 'The vault slip resonance resonates...' },
    ],
  },
}
```

## Starting Stability

Set `startingStability` on a `RecipeItem` to override the default starting stability for recipes with a restricted crafting window. The game calculates a default based on difficulty and realm, but fixed recipes may need a specific value.

```typescript
startingStability: 0.5,
```

## Registering Recipes via the Mod API

### Add to the Sect Recipe Library

Makes the recipe purchasable at the crafting hall:

```typescript
modAPI.actions.addRecipeToLibrary(myRecipe);
```

### Add to the Research System

Associates a recipe with a base item so players can unlock it through the Vault of Infinite Reflections:

```typescript
// Players who obtain ancientScroll can research myRecipe
modAPI.actions.addRecipeToResearch(ancientScroll, myRecipe);
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
  modAPI.actions.addRecipeToLibrary(ironheartPillRecipe);
}
```

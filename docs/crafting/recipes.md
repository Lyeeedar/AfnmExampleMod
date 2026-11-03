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

Higher `difficulty` increases the Completion and Perfection targets. It does not directly raise technique stability costs or lower starting stability. Choose `medium` as a starting point for an ordinary recipe and test harder settings for optional mastery challenges. See the [recipe difficulty reference](../items/recipes.md#difficulty-system) for the valid choices and their relative effects.

To build a demanding recipe, start with `realm` matching the intended crafting tier and `realmProgress` matching the intended point within that tier. Tune `difficulty` first. Use `complexityMultiplier` when you need finer control: `1.2` demands about 20% more Completion and Perfection than the same recipe without the override, while leaving starting stability unchanged. This also compounds with the chosen harmony's target multiplier on sublime crafts.

Choose [ingredients](../items/recipes.md#ingredient-system) separately from the crafting challenge. Increasing ingredient quantity changes what the player must supply, not the recipe's progress targets. As a design recommendation, test with readily obtainable ingredients first, then choose quantities and acquisition sources appropriate to how often the output should be crafted.

## Realm Progress

`realmProgress` tunes the expected crafting capability within the recipe's realm. It scales the targets rather than enforcing a cultivation-stage unlock:

| Value    | Meaning                     |
| -------- | --------------------------- |
| `Early`  | Targets tuned for realm entry |
| `Middle` | Targets tuned for mid-realm progress |
| `Late`   | Targets tuned for late-realm progress |

## Harmony Types

For sublime crafting, omit `harmonyTypeOverride` to let the player choose an unlocked harmony. The fallback when none are unlocked is `formless`. Set the override to pin a specific harmony when the action pattern is part of your recipe's intended challenge. It does not by itself unlock sublime crafting. `forceSublimeCrafting: true` makes manual crafts use a harmony and removes the basic craft option.

For example, set `harmonyTypeOverride: 'forge'` for a heat-management challenge, or use `'formless'` for a challenge without an action-pattern minigame. A sublime craft also applies the selected harmony's target multiplier, so test the override together with `difficulty` and `complexityMultiplier`. The supported identifiers are:

| Value             | Name                | Harmony rule                                                                 |
| ---------------- | ------------------- | ----------------------------------------------------------------------------- |
| `forge`           | Forge Works         | Maintain the heat of the cauldron to maintain Harmony                         |
| `alchemical`      | Alchemical Arts     | Mix the energies of different actions to maintain Harmony                     |
| `inscription`     | Inscribed Patterns  | Follow the inscribed pattern blocks to maintain Harmony                        |
| `resonance`       | Spiritual Resonance | Build the resonance of singular action types to maintain Harmony              |
| `formless`        | Formless Way        | Holds Harmony at 33 without an action pattern and multiplies Completion and Perfection targets by 1.5                                  |
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

Set `startingStability` on a `RecipeItem` to replace the default of 60 stability points. Use a smaller positive value when the recipe should offer a shorter crafting window, or a larger value when it should allow more actions before stabilization is needed. This is an absolute number of points, not a fraction of the default. Technique costs and stabilization effects still determine how long the craft lasts.

```typescript
startingStability: 40,
```

## Registering Recipes via the Mod API

### Add to the Sect Recipe Library

Register your recipe and its mod-owned output and ingredient items with `window.modAPI.actions.addItem` before adding a way to acquire it. Adding a recipe to the library makes it purchasable at the crafting hall:

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
import type { RecipeItem } from 'afnm-types';
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

// In a content module imported by your mod entry point:
for (const item of [ironheartPill, ironheartPillPlus, ironwoodBark, spiritCrystal]) {
  window.modAPI.actions.addItem(item);
}
window.modAPI.actions.addItem(ironheartPillRecipe);
window.modAPI.actions.addRecipeToLibrary(ironheartPillRecipe);
```

## Test the Recipe Challenge

Load the mod using the [packaging and testing guide](../guides/packaging-testing.md), obtain and learn the recipe through its configured acquisition route, and supply the listed ingredients. Start a manual craft with equipment and techniques representative of the intended tier. Check that Completion is achievable, then attempt a perfect result. If sublime crafting is available, test it separately with the intended harmony because its progress targets differ.

Change one setting at a time. Raise `difficulty` or `complexityMultiplier` when progress targets are too easy. Lower `startingStability` only when a tighter action window is the intended challenge. If you leave harmony selection open, try more than one unlocked harmony before deciding the recipe is balanced.

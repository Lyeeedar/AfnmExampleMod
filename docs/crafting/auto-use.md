---
layout: default
title: Crafting Auto-Use System
parent: Crafting System
nav_order: 4
description: 'How auto-use rules work during crafting and how to define them'
---

# Crafting Auto-Use System

The crafting auto-use system lets players configure automatic consumption of reagents and pills during a craft, driven by rule conditions. This mirrors the combat auto-use system but operates on the crafting variable scope.

## Overview

Auto-use rules are organised into **loadouts** -- a named collection of rules that apply to specific crafting slots. Players can switch between stored loadouts, and the game maintains a `currentCraftingAutoUseLoadout` active during crafting and `storedCraftingAutoUseLoadouts` for saved presets.

The system lives on the player entity:

```typescript
interface PlayerEntity {
  currentCraftingAutoUseLoadout?: AutoUseLoadout;
  storedCraftingAutoUseLoadouts?: AutoUseLoadout[];
}
```

## Loadout Structure

An `AutoUseLoadout` contains ordered slots for each item category:

```typescript
interface AutoUseLoadout {
  id: string;
  name: string;
  reagentSlots: AutoUseItem[]; // Fire only at step 0
  pillSlots: AutoUseItem[];    // Fire every crafting step
}
```

### Reagents vs Pills

- **Reagent slots** (`reagentSlots`): Applied only at the first step of crafting (step 0). Use these for setup buffs that should not reapply mid-craft.
- **Pill slots** (`pillSlots`): Applied after every technique, each step of the craft. Use these for ongoing sustain or adaptive buffs.

Items eligible for auto-use are `CraftingPillItem` (pills with `pillKind === 'crafting'`) and `CraftingReagentItem`.

## Auto-Use Item Rules

Each `AutoUseItem` in a slot defines an item to use and the conditions under which it fires:

```typescript
interface AutoUseItem {
  item?: string;       // Item name (as registered in game data)
  blocks: RuleBlocks;  // Two-level condition structure; empty = always fire
  maxCount?: number;   // Maximum uses per craft (default: unlimited)
}
```

## Condition Keys

The rule editor offers these static condition keys, with buff names appended dynamically:

| Condition key             | Value type | Description                                   |
| ------------------------ | ---------- | --------------------------------------------- |
| `Qi Pool`                | percentage | Current qi pool as a % of max pool           |
| `Toxicity`               | percentage | Current toxicity as a % of max toxicity       |
| `Completion`             | percentage | Craft completion as a % of target             |
| `Perfection`             | percentage | Perfection progress as a % of max             |
| `Stability`              | percentage | Current stability as a % of max               |
| `Step`                   | raw        | Current crafting step number                  |
| `Qi Droplets`            | raw        | Player qi droplets                            |
| `Harmony Value`          | raw        | Numeric harmony gauge, roughly -100 to 100    |
| `Harmony Type`           | enum       | Which harmony style the recipe uses            |
| `Recipe Condition`       | enum       | The recipe condition archetype                |
| `Current Condition`      | enum       | The current polarity (veryNegative...veryPositive) |

Percentage conditions accept values 0-100 and compare against the resource's ratio (e.g. `pool/maxpool < 0.5`). Raw conditions compare directly against the raw number.

Buff names are dynamically appended from the active crafting buffs, allowing rules to gate on stack counts (e.g. `"My Buff == 0"` to fire before the buff applies).

## Enum Conditions

`Harmony Type`, `Recipe Condition`, and `Current Condition` are enum conditions. Their values select a named state rather than a number. The rule engine uses a **flag-variable** approach: each named state gets its own 0/1 flag variable keyed by a prefix, and only the active state has its flag set to 1.

| Condition             | Flag prefix                          | Example expression                        |
| --------------------- | ------------------------------------ | ----------------------------------------- |
| Harmony Type          | `Harmony: Forge Works`               | `Harmony: Forge Works == 1`               |
| Recipe Condition      | `Recipe Condition: Perfectable`       | `Recipe Condition: Perfectable == 1`      |
| Current Condition     | `Condition: positive`                | `Condition: positive == 1`                |

The enum value stored in the rule is an **index** into a stable ordering, not the name itself. This index is resolved to a flag key at evaluation time.

### Stable Orderings

The index-to-name mappings are stable and append-only:

**Harmony types** (`HARMONY_TYPE_ORDER`):
```
0: forge (Forge Works)
1: alchemical (Alchemical Arts)
2: inscription (Inscribed Patterns)
3: resonance (Spiritual Resonance)
4: formless (Formless Way)
5: enhancingEcho (Enhancing Echo)
6: eccentricDecree (Eccentric Decree)
```

**Polarity** (`CRAFTING_POLARITY_ORDER`, most negative to most positive):
```
0: veryNegative
1: negative
2: neutral
3: positive
4: veryPositive
```

**Recipe conditions** follow the canonical `craftingConditions` data ordering.

## Available Harmony Types for Conditions

The `Harmony Type` condition dropdown is filtered to the harmonies the player has unlocked in their current realm. Use `getUnlockedHarmonies(player, breakthrough)` to determine which types are valid. The dropdown indices always reference `HARMONY_TYPE_ORDER` directly, so unlocked harmonies are hidden but the index mapping is unchanged.

## Expression Generation

The rule engine compiles `RuleBlocks` to an `evalExp`-compatible boolean expression using `ruleBlocksToCraftingExpression`. This maps each condition key to a crafting variable:

| Condition        | Expression output                         |
| ---------------- | ----------------------------------------- |
| Qi Pool          | `pool/maxpool < 0.5`                     |
| Toxicity         | `toxicity/maxtoxicity > 0.8`              |
| Completion       | `completion/maxcompletion >= 1`           |
| Perfection       | `perfection/maxperfection < 0.2`          |
| Stability        | `stability/maxstability <= 0.1`           |
| Step             | `step >= 2`                              |
| Qi Droplets      | `qiDroplets > 3`                         |
| Harmony Value    | `harmony > 50`                           |
| Harmony Type     | `Harmony: <name> == 1`                   |
| Recipe Condition | `Recipe Condition: <name> == 1`          |
| Current Condition| `Condition: <name> == 1`                 |
| Buff name        | `<flag(buffName)> == 0` (stack count)    |

The `flag()` helper converts names to valid identifier-safe keys for the expression evaluator.

## Rule Editor UI

The crafting auto-use dialog (`ManageCraftingAutoUseItemsDialog`) presents two sections:

1. **Reagents** -- drag-to-reorder list of `reagentSlots`. Only fire at step 0.
2. **Pills** -- drag-to-reorder list of `pillSlots`. Fire every step after techniques resolve.

Each row exposes:
- An item picker (filtered to crafting pills and reagents, grouped by realm)
- A rule editor (`RuleBlockEditor`) for setting conditions
- A `RuleSummaryBox` showing the compiled expression in human-readable form
- A max-count field (optional use limit per craft)
- Drag handles and delete buttons

The `RuleBlockEditor` uses `buildCraftingConditionKeys` to populate its dropdown, filtered to the player's unlocked harmonies and reachable buff names.

## Validation and Sanitisation

`sanitizeCraftingRuleBlocks` coerces loaded rule blocks to be valid for the current editor context:
- Conditions not in `allowedKeys` fall back to the first allowed key
- Enum conditions snap to a real option value if the stored value is invalid
- Invalid comparison operators default to `==`

Use this when loading saved rules to ensure the editor dropdowns open on valid selections.

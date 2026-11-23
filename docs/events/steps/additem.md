---
layout: default
title: Add Item Step
parent: Event Step Types
grand_parent: Events System
nav_order: 6
description: 'Give items to player inventory'
---

# Add Item Step

Gives items to the player's inventory as rewards, loot, or gifts. If looking to add multiple items, use the [Add Multiple Item Step](addmultipleitem) instead. If you wish to add a random item from a pool, use [Drop Item Step](dropitem) instead.

## Interface

```typescript
interface AddItemStep {
  kind: 'addItem';
  condition?: string;
  item: ItemDesc;
  amount: string;
}
```

## Properties

**`kind`** - Always `'addItem'`

**`item`** - Description of the item to add, including name and any modifiers. This must either be the name of an item already in the game, or one added by `window.modAPI.actions.addItem`

**`amount`** - String expression for the quantity to add. Can be literal numbers or mathematical expressions.

**`condition`** _(optional)_ - Flag expression that must evaluate to true for the step to execute.

## Examples

### Basic Item Addition

```typescript
{
  kind: 'addItem',
  item: { name: 'Spirit Grass' },
  amount: '5'
}
```

### Variable Amount

```typescript
{
  kind: 'addItem',
  item: { name: 'Experience Pills' },
  amount: 'realm * 2'
}
```

## Reward a random attunement gem

Use `item.dropAttunements` when a quest should give an attunement gem whose technique and mastery vary with the player. Use the exact base item name `Attunement Gem` for combat equipment or `Crafting Attunement Gem` for cauldrons and flames.

- `realm` is the highest realm from which the roll may select techniques. Eligible techniques must have an incandescent mastery entry of kind `upgrade` or `overwriteEffects`.
- `count` is the requested number of distinct techniques per gem. Use a positive whole number. If fewer techniques qualify, the roll uses the available candidates. An empty pool yields a gem without attunements.
- Use `school` to narrow a combat gem to a combat school, or `craftingType` to narrow a crafting gem to `fusion`, `refine`, `stabilize`, or `support`. Omit the filter for a broader pool. The roll favors techniques the player has used.
- `bonusSlotChance` gives the gem a chance at one more distinct technique when a candidate is available. Use a fraction from 0 to 1. Omission means no bonus slot.

For a reward themed around refining, add this step to your [event sequence](../index):

```typescript
{
  kind: 'addItem',
  item: {
    name: 'Crafting Attunement Gem',
    dropAttunements: { realm: 'coreFormation', craftingType: 'refine', count: 1 },
  },
  amount: '1',
}
```

This awards one gem with one eligible refining technique if the pool contains a match. Run the event and check that the gem can be applied to a cauldron or flame. Changing `amount` to `2` rolls two separate gems.

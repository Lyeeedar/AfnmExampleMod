---
layout: default
title: Add To Found Step
parent: Event Step Types
nav_order: 100
description: 'Documentation for adding items to expedition found inventory'
---

# Add To Found Step

The `addToFound` step type adds items to the expedition's "found" inventory. Items in the found inventory are recovered on successful expedition completion but lost on failure.

## Interface

```typescript
interface AddItemsToFoundStep {
  kind: 'addToFound';
  /** Array of items and their quantities to add to found inventory */
  items: { item: ItemDesc; count: number }[];
  /** Optional condition expression that must evaluate to true for this step to execute */
  condition?: string;
}
```

## Behavior

When this step executes:

1. Each item in the `items` array is added to `state.expedition.foundItems`
2. The items appear in the expedition's "found items" display during the expedition
3. If the expedition ends **successfully** (`endExpedition` with `failed: false`), found items are transferred to the player's inventory
4. If the expedition ends in **failure** (`endExpedition` with `failed: true`), all found items are **lost**

### Recovering Items on Failure

To prevent items from being lost on expedition failure, use the [Add To Extracted Step](addtoextracted) instead. Items in the extraction slots survive even when the expedition fails.

## Example

```typescript
{
  kind: 'addToFound',
  items: [
    { item: 'jadeShard', count: 3 }
  ]
}
```

```typescript
{
  kind: 'addToFound',
  // Only add items if the player has explored the treasure room
  condition: 'foundTreasureRoom == 1',
  items: [
    { item: 'ancientArtifact', count: 1 },
    { item: 'spiritStone', count: 50 }
  ]
}
```

## ItemDesc

The `item` field accepts either a string item ID or an `ItemDesc` object:

```typescript
// String item ID
item: 'jadeShard'

// ItemDesc object with custom amount
item: { id: 'jadeShard', amount: 100 }
```

## See Also

- [Add To Extracted Step](addtoextracted) - Add items to extraction slots (survive failure)
- [End Expedition Step](endexpedition) - End an expedition
- [Increase Instability Step](instability) - Increase expedition instability
- [Expedition System](../expedition) - Overview of the expedition system

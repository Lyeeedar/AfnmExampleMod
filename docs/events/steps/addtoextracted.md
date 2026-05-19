---
layout: default
title: Add To Extracted Step
parent: Event Step Types
nav_order: 101
description: 'Documentation for adding items to expedition extraction slots (survives failure)'
---

# Add To Extracted Step

The `addToExtracted` step type adds items to the expedition's extraction slots. Items in extraction slots are **preserved even when the expedition fails** and are transferred to the player's inventory when the expedition ends (whether success or failure).

## Interface

```typescript
interface AddItemsToExtractedStep {
  kind: 'addToExtracted';
  /** Number of extraction slots to consume (items are taken from player inventory) */
  extractSlots: number;
  /** Optional condition expression that must evaluate to true for this step to execute */
  condition?: string;
}
```

## Behavior

When this step executes:

1. The player is shown an item picker dialog (if not using in a tile event handler context)
2. The player selects items from their inventory to place in extraction slots
3. Selected items are moved from the player's inventory to `state.expedition.extractedItems`
4. These items are **not** in the "found" inventory and are not at risk during the expedition
5. When the expedition ends (via `endExpedition`), extracted items are transferred to the player's inventory **regardless of success/failure**

### Extraction Slots

The `extractSlots` parameter limits how many item slots can be used for extraction. This is typically set by the expedition tile (e.g., an Extract tile might allow 2-3 extraction slots). The player chooses which items from their inventory to fill these slots.

### Contrast with Add To Found

| Aspect | `addToFound` | `addToExtracted` |
|--------|-------------|------------------|
| Item source | Directly added in the step | Player selects from inventory |
| Survives failure | No (lost on `failed: true`) | Yes (always recovered) |
| Use case | Guaranteed rewards | Player-chosen insurance |

## Example

```typescript
{
  kind: 'addToExtracted',
  // Player can extract up to 2 items
  extractSlots: 2
}
```

```typescript
{
  kind: 'addToExtracted',
  // Only allow extraction if player has the extraction skill
  condition: 'hasExtractionSkill == 1',
  extractSlots: 3
}
```

## Usage in Tile Events

In the context of expedition tile events (like an Extract tile), this step is typically included in the tile's `intro` event steps. The player automatically sees the extraction UI when the tile event begins.

```typescript
const extractTileIntro: EventStep[] = [
  {
    kind: 'text',
    text: 'You find a cache of valuable materials. Select up to 2 items to extract safely.'
  },
  {
    kind: 'addToExtracted',
    extractSlots: 2
  }
];
```

## See Also

- [Add To Found Step](addtofound) - Add items to found inventory (lost on failure)
- [End Expedition Step](endexpedition) - End an expedition
- [Increase Instability Step](instability) - Increase expedition instability
- [Expedition System](../expedition) - Overview of the expedition system

---
layout: default
title: Remove Item Step
parent: Event Step Types
grand_parent: Events System
nav_order: 7
description: 'Remove items from player inventory'
---

# Remove Item Step

## Introduction

The Remove Item Step removes items from the player's inventory, typically as payment, consumption, or quest requirements. It handles various scenarios from simple item costs to complex alternative payment options, ensuring players can spend resources as part of their cultivation journey.

This step provides flexible payment mechanisms and supports alternate item options, making it essential for creating meaningful resource costs and consumption mechanics in events.

## Interface

```typescript
interface RemoveItemStep {
  kind: 'removeItem';
  condition?: string;
  item: ItemDesc;
  alternates?: ItemDesc[];
  amount: string;
}
```

## Properties

### Required Properties

**`kind`** - Always `'removeItem'`

- Identifies this as an item removal step

**`item`** - Primary item to remove

- Uses `ItemDesc` format for flexible item specification
- Must reference an existing item by name
- This is the preferred item to remove if available

**`amount`** - Quantity expression

- String expression that evaluates to the number of items to remove
- Can be literal numbers, mathematical expressions, or flag references
- Evaluated when the step executes

### Optional Properties

**`condition`** - Conditional execution

- [Flag expression](../../concepts/flags) that must be true for removal to occur
- Step is skipped if condition fails
- Useful for conditional costs based on player state

**`alternates`** - Alternative items

- Array of `ItemDesc` objects that can be removed instead of the primary item
- System checks primary item first, then alternates in order
- First available item type gets removed
- Useful for flexible payment systems

## Item Removal Priority

The step evaluates items in priority order: `item` first, then each entry in `alternates` in order. For each entry, it checks if the player has enough of that item to satisfy the remaining amount. The first item type the player has enough of is removed.

**Message display**: The "You lose X" message shows the display name of the item that was actually removed, not necessarily the primary `item`. If an alternate was removed, the message reflects that alternate's name. This matters for quests with flexible payment where the player needs to know precisely which item was taken.

## Examples

### Simple Payment

```typescript
{
  kind: 'removeItem',
  item: { name: 'Spirit Stone' },
  amount: '1'
}
```

### Quest Item Consumption

```typescript
{
  kind: 'removeItem',
  item: { name: 'Ancient Key Fragment' },
  amount: '3'
}
```

### Variable Costs

```typescript
{
  kind: 'removeItem',
  item: { name: 'Cultivation Pill' },
  amount: 'realm + 1'  // Higher realms pay more
}
```

### Flexible Payment Options

```typescript
{
  kind: 'removeItem',
  item: { name: 'Gold Spirit Stone' },
  alternates: [
    { name: 'Silver Spirit Stone' },
    { name: 'Copper Spirit Stone' }
  ],
  amount: '3'
}
```

When the player has none of the primary item but has enough alternates, the message correctly shows which alternate was removed. For example, "You lose 3 Silver Spirit Stone." rather than the primary item name.

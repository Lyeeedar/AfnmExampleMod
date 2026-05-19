---
layout: default
title: End Expedition Step
parent: Event Step Types
nav_order: 99
description: 'Documentation for ending an expedition event step'
---

# End Expedition Step

The `endExpedition` step type ends the current expedition, displaying either a success or failure result screen based on the `failed` flag.

## Interface

```typescript
interface EndExpeditionStep {
  kind: 'endExpedition';
  /** When true, shows the failure screen. When false, shows the success screen. */
  failed: boolean;
  /** Optional condition expression that must evaluate to true for this step to execute */
  condition?: string;
}
```

## Behavior

When this step executes:

1. Checks the `failed` flag to determine outcome
2. Processes extracted items (transfers items in the extraction slots to the player's inventory)
3. Displays the appropriate result dialog:
   - **Success** (`failed: false`): Shows recovered items, expedition summary
   - **Failure** (`failed: true`): Shows lost items (grayscaled), any extracted items that were saved

### Success Flow

```typescript
{
  kind: 'endExpedition',
  failed: false
}
```

When `failed: false`, the expedition is considered successful. Items that were added to extracted via `addToExtracted` steps are transferred to the player inventory.

### Failure Flow

```typescript
{
  kind: 'endExpedition',
  failed: true
}
```

When `failed: true`:
- All items in the "found" inventory are lost
- Items in the "extracted" inventory (added via `addToExtracted`) are preserved and transferred to the player
- The failure screen displays both the lost items (grayscaled) and any recovered extracted items

## Example

```typescript
// End expedition successfully
{
  kind: 'endExpedition',
  failed: false
}
```

```typescript
// End expedition as a failure (e.g., player died in combat)
// The condition ensures this only triggers when party is wiped out
{
  kind: 'endExpedition',
  failed: true,
  condition: 'partyAliveMembers == 0'
}
```

## See Also

- [Increase Instability Step](instability) - Increase expedition instability
- [Add To Found Step](addtofound) - Add items to expedition found inventory
- [Add To Extracted Step](addtoextracted) - Add items to extraction slots (survive failure)
- [Expedition System](../expedition) - Overview of the expedition system

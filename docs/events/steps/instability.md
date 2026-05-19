---
layout: default
title: Increase Instability Step
parent: Event Step Types
nav_order: 98
description: 'Documentation for the expedition instability event step'
---

# Increase Instability Step

The `instability` step type increases the current expedition's instability value. This is used exclusively within expedition tile events to simulate spatial destabilization as the expedition progresses.

## Interface

```typescript
interface IncreaseInstabilityStep {
  kind: 'instability';
  /** Optional condition expression that must evaluate to true for the step to execute */
  condition?: string;
}
```

## Behavior

When this step executes, it:

1. Calculates the base instability increase (always 7%)
2. Applies a reduction based on the Stabilizer role effectiveness on the expedition team
3. Applies the modified increase to `state.expedition.instability` (capped at 100%)
4. Logs a text entry to the event history showing the increase and current total

### Stabilizer Calculation

The stabilizer reduces the instability increase by their effectiveness percentage:

```
instabilityToAdd = Math.round(7 * (1 - totalStabilizerEffectiveness / 100))
```

Where `totalStabilizerEffectiveness` is the sum of each stabilizer member's role effectiveness. Role effectiveness is derived from the member's rarity and role type.

The minimum increase is 1% (even if stabilizers provide 100% effectiveness, the region cannot be completely stabilized).

### Instability Cap

Instability is capped at 100%. Once instability reaches 100%:

- Challenge nodes become visible and their connections replace bypass routes
- Further instability increases show the message "The region's instability can grow no further"
- Instability affects tile difficulty scaling (enemy health, count, power, debuff strength)

## Example

```typescript
{
  kind: 'instability',
  // Step executes unconditionally
}
```

```typescript
{
  kind: 'instability',
  // Only increases instability if the player has explored at least 3 tiles
  condition: 'exploredTiles >= 3'
}
```

## Usage in Tile Events

This step is automatically added to tile event generation for certain tile types. You can also include it manually in custom tile intro events:

```typescript
const myTileEvent = {
  location: 'someExpedition',
  steps: [
    {
      kind: 'text',
      text: 'The air shimmers with unstable qi.'
    },
    {
      kind: 'instability'
    }
  ]
};
```

## See Also

- [End Expedition Step](endexpedition) - End an expedition
- [Add To Found Step](addtofound) - Add items to expedition found inventory
- [Expedition System](../expedition) - Overview of the expedition system

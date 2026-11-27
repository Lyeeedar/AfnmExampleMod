---
layout: default
title: Spawn Map Event Step
parent: Event Step Types
grand_parent: Events System
description: 'Spend an item to reveal a map encounter'
---

# Spawn Map Event Step

Use `spawnMapEvent` in a choice or custom building to let the player spend a token to reveal a temporary encounter. Set up a registered location with [map events and shared scheduling settings](../../locations/location-structure.md#map-events). The step uses that location's encounter pool and adds a marker immediately, even when its scheduled spawn timer is still running. It leaves that timer unchanged.

Set `location` to the exact registered location name. Set `cost.item` to the exact item name and `cost.amount` to a positive whole number of units from the player's inventory. The step checks that the location has `mapEventSettings`, that its active count is below `maxActive`, and that an encounter meets its condition and is not already active. Selection is random and favors encounters that have appeared less recently.

On success the step removes the cost, adds the marker, and runs `success`. If payment or spawning is unavailable, it runs `unavailable` and leaves the inventory untouched. The encounter's own steps run when the player selects the marker.

Put this step in a [choice's children](choice.md) or in a [custom building's eventSteps](../../locations/building-types.md#custom-building). This example spends three units of a registered token and sets an event-local flag on success. The branch arrays can also report the outcome to the player.

```typescript
{
  kind: 'spawnMapEvent',
  location: trialLocation.name,
  cost: { item: trialToken.name, amount: 3 },
  success: [{ kind: 'flag', flag: 'myModTrialRevealed', value: '1', global: false }],
  unavailable: [],
}
```

Test with an eligible encounter and sufficient tokens, then repeat while the pool has no eligible inactive encounters, while the location is full, and with insufficient tokens. Check which branch runs, how many tokens remain, and whether a new marker appears.

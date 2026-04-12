---
layout: default
title: Lifecycle hooks
parent: Advanced mods
nav_order: 1
---

# Mod Hooks Documentation

This document describes the available mod hooks that allow mods to intercept and modify game behavior at specific points.

All hooks are registered via `window.modAPI.hooks`:

```typescript
window.modAPI.hooks.onCreateEnemyCombatEntity((enemy, combatEntity, gameFlags) => {
  // ...
  return combatEntity;
});
```

---

## Combat Hooks

### `onCreateEnemyCombatEntity`

Intercepts the creation of enemy combat entities, allowing modifications to enemy stats, abilities, or equipment before combat begins.

**Parameters:**
- `enemy: EnemyEntity` - The base enemy definition
- `combatEntity: CombatEntity` - The combat entity being created
- `gameFlags: Record<string, number>` - Current game flags/state

**Returns:** Modified `CombatEntity`

**Example:**
```typescript
window.modAPI.hooks.onCreateEnemyCombatEntity((enemy, combatEntity, gameFlags) => {
  // Make the entire game harder
  combatEntity.stats.power *= 1.2;
  combatEntity.stats.defense *= 1.2;

  // Modify defense for specific enemy types
  if (enemy.name.includes('Stone')) {
    combatEntity.stats.defense *= 1.5;
  }

  return combatEntity;
});
```

### `onCalculateDamage`

Intercepts combat damage after all base reductions. Called for every damage application. Return the new damage value.

**Parameters:**
- `attacker: CombatEntity` - The entity dealing damage
- `defender: CombatEntity` - The entity receiving damage
- `damage: number` - Post-reduction damage value
- `damageType: DamageType | undefined` - The type of damage
- `gameFlags: Record<string, number>` - Current game flags/state

**Returns:** `number` - Modified damage value

**Example:**
```typescript
window.modAPI.hooks.onCalculateDamage((attacker, defender, damage, damageType, gameFlags) => {
  if (gameFlags.iron_body && defender.entityType === 'Player') {
    return Math.floor(damage * 0.8);
  }
  return damage;
});
```

### `onBeforeCombat`

Fires before combat is initialized. Allows modifying the enemy list and the player's starting combat entity. Return modified copies — mutations to the originals are not used.

**Parameters:**
- `enemies: EnemyEntity[]` - The enemies about to be fought
- `playerState: CombatEntity` - The player's starting combat entity
- `gameFlags: Record<string, number>` - Current game flags/state

**Returns:** `{ enemies: EnemyEntity[]; playerState: CombatEntity }` - Modified copies

**Example:**
```typescript
window.modAPI.hooks.onBeforeCombat((enemies, playerState, gameFlags) => {
  if (gameFlags.hard_mode) {
    const scaled = enemies.map(e => ({ ...e, stats: { ...e.stats, hp: e.stats.hp * 2 } }));
    return { enemies: scaled, playerState };
  }
  return { enemies, playerState };
});
```

---

## Crafting Hooks

### `onDeriveRecipeDifficulty`

Modifies the difficulty and stats of crafting recipes during the crafting process.

**Parameters:**
- `recipe: RecipeItem` - The recipe being crafted
- `recipeStats: CraftingRecipeStats` - The calculated recipe statistics:
  - `completion: number` - Completion threshold
  - `perfection: number` - Perfection threshold
  - `stability: number` - Stability value
  - `conditionType: RecipeConditionEffect` - Recipe condition effect
  - `harmonyType: RecipeHarmonyType` - Recipe harmony type
- `gameFlags: Record<string, number>` - Current game flags/state

**Returns:** Modified `CraftingRecipeStats`

**Example:**
```typescript
window.modAPI.hooks.onDeriveRecipeDifficulty((recipe, recipeStats, gameFlags) => {
  if (gameFlags.unlockedUltimateCauldron === 1) {
    recipeStats.completion *= 0.8;
    recipeStats.perfection *= 0.8;
  }

  if (gameFlags.totalCraftsCompleted > 100) {
    recipeStats.stability *= 1.2;
  }

  return recipeStats;
});
```

---

## Completion Hooks

These hooks trigger after specific game activities complete during an event, allowing mods to inject additional event steps into the event flow.

### `onCompleteCombat`

Triggers after combat ends, allowing for custom victory/defeat consequences.

**Parameters:**
- `eventStep: CombatStep | FightCharacterStep` - The event step that triggered the combat
- `victory: boolean` - Whether the player won
- `playerCombatState: CombatEntity` - The player's combat state at end
- `foughtEnemies: EnemyEntity[]` - The enemies that were fought
- `droppedItems: Item[]` - Items dropped by enemies at the end of combat
- `gameFlags: Record<string, number>` - Current game flags/state

**Returns:** `EventStep[]` - Additional event steps to execute

**Example:**
```typescript
window.modAPI.hooks.onCompleteCombat((eventStep, victory, playerCombatState, foughtEnemies, droppedItems, gameFlags) => {
  const events: EventStep[] = [];

  if (!victory && eventStep.kind === 'combat' && !eventStep.isSpar) {
    events.push({ kind: 'text', text: 'You fall, vision narrowing to black.' });
    events.push({ kind: 'changeSocialStat', stat: 'lifespan', amount: '-lifespan' });
  }

  if (victory && playerCombatState.stats.hp === playerCombatState.stats.maxHp) {
    events.push({ kind: 'addItem', item: { name: 'Flawless Victory Token' }, amount: '1' });
  }

  return events;
});
```

### `onCompleteTournament`

Triggers after tournament participation with placement results.

**Parameters:**
- `eventStep: TournamentStep` - The event step that triggered the tournament
- `tournamentState: 'victory' | 'second' | 'defeat'` - Tournament placement
- `gameFlags: Record<string, number>` - Current game flags/state

**Returns:** `EventStep[]` - Additional event steps to execute

**Example:**
```typescript
window.modAPI.hooks.onCompleteTournament((eventStep, tournamentState, gameFlags) => {
  const events: EventStep[] = [];

  if (tournamentState === 'victory' && !gameFlags.firstTournamentVictory) {
    events.push({ kind: 'unlockLocation', location: 'Champion Training Grounds' });
    events.push({ kind: 'flag', global: false, flag: 'firstTournamentVictory', value: '1' });
  }

  return events;
});
```

### `onCompleteDualCultivation`

Triggers after dual cultivation attempts.

**Parameters:**
- `eventStep: DualCultivationStep` - The event step that triggered dual cultivation
- `success: boolean` - Whether the dual cultivation succeeded
- `gameFlags: Record<string, number>` - Current game flags/state

**Returns:** `EventStep[]` - Additional event steps to execute

**Example:**
```typescript
window.modAPI.hooks.onCompleteDualCultivation((eventStep, success, gameFlags) => {
  const events: EventStep[] = [];

  if (success) {
    const streak = (gameFlags.dualCultivationStreak || 0) + 1;
    events.push({ kind: 'qi', amount: '' + (100 * streak) });
    events.push({ kind: 'flag', global: false, flag: 'dualCultivationStreak', value: '' + streak });
  } else if (gameFlags.dualCultivationStreak > 0) {
    events.push({ kind: 'flag', global: false, flag: 'dualCultivationStreak', value: '0' });
  }

  return events;
});
```

### `onCompleteCrafting`

Triggers after crafting attempts, successful or failed.

**Parameters:**
- `eventStep: CraftingStep` - The event step that triggered the crafting
- `item: CraftingResult | undefined` - The crafted item (`undefined` if failed)
- `gameFlags: Record<string, number>` - Current game flags/state

**Returns:** `EventStep[]` - Additional event steps to execute

**Example:**
```typescript
window.modAPI.hooks.onCompleteCrafting((eventStep, item, gameFlags) => {
  const events: EventStep[] = [];

  if (item && item.quality >= 4) {
    events.push({ kind: 'reputation', name: 'Celadon Flame Brewers', amount: '' + (item.quality * 5) });
  }

  return events;
});
```

### `onCompleteAuction`

Triggers after participating in auctions.

**Parameters:**
- `eventStep: AuctionStep` - The event step that triggered the auction
- `itemsBought: AuctionItem[]` - Items successfully purchased
- `gameFlags: Record<string, number>` - Current game flags/state

**Returns:** `EventStep[]` - Additional event steps to execute

**Example:**
```typescript
window.modAPI.hooks.onCompleteAuction((eventStep, itemsBought, gameFlags) => {
  const events: EventStep[] = [];

  if (itemsBought.length >= 5) {
    events.push({ kind: 'addItem', item: { name: 'Bulk Buyer Token' }, amount: '1' });
  }

  return events;
});
```

### `onCompleteStoneCutting`

Triggers after stone cutting activities.

**Parameters:**
- `eventStep: StoneCuttingStep` - The event step that triggered stone cutting
- `gameFlags: Record<string, number>` - Current game flags/state

**Returns:** `EventStep[]` - Additional event steps to execute

**Example:**
```typescript
window.modAPI.hooks.onCompleteStoneCutting((eventStep, gameFlags) => {
  const events: EventStep[] = [];

  const stonesCount = (gameFlags.totalStonesCut || 0) + 1;
  events.push({ kind: 'flag', global: false, flag: 'totalStonesCut', value: '' + stonesCount });

  if (stonesCount === 100) {
    events.push({ kind: 'addItem', item: { name: 'Master Stone Cutter Badge' }, amount: '1' });
  }

  return events;
});
```

---

## Event Item Hooks

### `onEventDropItem`

Intercepts items granted by event steps (`addItem`, `addMultipleItem`, `dropItem`). Return a modified `ItemDesc` to change the item name or stack count. Return `stacks <= 0` to suppress the item entirely.

**Parameters:**
- `item: ItemDesc` - The item being granted (name and optional stacks)
- `step: AddItemStep | AddMultipleItemStep | DropItemStep` - The event step granting the item
- `gameFlags: Record<string, number>` - Current game flags/state

**Returns:** Modified `ItemDesc`

**Example:**
```typescript
window.modAPI.hooks.onEventDropItem((item, step, gameFlags) => {
  // Double Iron Ore drops in bonus mode
  if (gameFlags.item_bonus && item.name === 'Iron Ore') {
    return { ...item, stacks: (item.stacks ?? 1) * 2 };
  }
  // Suppress a specific item entirely
  if (gameFlags.banned_items && item.name === 'Forbidden Herb') {
    return { ...item, stacks: 0 };
  }
  return item;
});
```

---

## Exploration Hooks

### `onGenerateExploreEvents`

Modifies the pool of exploration events before one is selected. Fired after base-game eligibility filtering, so every event in the array was already eligible to fire. Add, remove, or reorder events to influence what the player encounters.

**Parameters:**
- `locationId: string` - The current location identifier
- `events: LocationEvent[]` - The filtered event pool
- `gameFlags: Record<string, number>` - Current game flags/state

**Returns:** `LocationEvent[]` - Modified event pool

**Important Warning on Weighted Events:**
In the 0.6.50 runtime, `onGenerateExploreEvents` fires *before* the game expands weighted explore candidates into repeated `{ index, event }` entries. Repeat-penalty bookkeeping (`currentLocationLastEvent` / `currentLocationLastEventCount`) is keyed by that expanded weighted event index. If your mod needs to precisely modify drop rates or probabilities without breaking repeat-penalty semantics, you may still need to carefully scope your modifications or narrowly patch the final weighted candidate array in combination with this hook.

**Example:**
```typescript
window.modAPI.hooks.onGenerateExploreEvents((locationId, events, gameFlags) => {
  if (gameFlags.lucky_mode) {
    return [...events, myBonusEvent];
  }
  return events;
});
```

---

## Location Hooks

### `onLocationEnter`

Fires when the player moves to a new location. This is an observation hook — it does not return a value.

**Parameters:**
- `locationId: string` - The identifier of the location entered
- `gameFlags: Record<string, number>` - Current game flags/state

**Example:**
```typescript
window.modAPI.hooks.onLocationEnter((locationId, gameFlags) => {
  if (locationId === 'Ancient Library') {
    console.log('Player entered the Ancient Library');
  }
});
```

---

## Loot Hooks

### `onLootDrop`

Fires when combat loot is distributed to the player after a fight. This is an observation hook — it does not return a value. Use `onCompleteCombat` if you need to modify or add drops.

**Parameters:**
- `items: Item[]` - The items distributed to the player
- `gameFlags: Record<string, number>` - Current game flags/state

**Example:**
```typescript
window.modAPI.hooks.onLootDrop((items, gameFlags) => {
  items.forEach(item => console.log('Received loot:', item.name));
});
```

---

## Time Hooks

### `onAdvanceDay`

Fires when the game advances time (player rests, travels, etc.).

**Parameters:**
- `days: number` - Number of days advanced
- `gameFlags: Record<string, number>` - Current game flags/state

**Example:**
```typescript
window.modAPI.hooks.onAdvanceDay((days, gameFlags) => {
  console.log('Time passed:', days, 'days');
});
```

### `onAdvanceMonth`

Fires once for each month rollover that occurs during a day advance. If the player skips multiple months at once, this fires once per month rolled over.

**Parameters:**
- `month: number` - The new month (1–12)
- `year: number` - The current year
- `gameFlags: Record<string, number>` - Current game flags/state

**Example:**
```typescript
window.modAPI.hooks.onAdvanceMonth((month, year, gameFlags) => {
  if (month === 3) {
    window.modAPI.actions.startEvent(mySpringFestivalEvent);
  }
});
```

---

## Redux Hooks

### `onReduxAction`

Fires after every Redux state update. Receives the action type, the state before, and the state after. Return a modified copy of `stateAfter` to override what is stored, or return `stateAfter` unchanged.

**This hook runs inside the reducer.** Keep the implementation fast and avoid side-effects. Thrown exceptions are caught and logged.

**Parameters:**
- `actionType: string` - The Redux action type string
- `stateBefore: RootState` - Game state before the action
- `stateAfter: RootState` - Game state after the action

**Returns:** `RootState` - The state to store (return `stateAfter` unchanged if not modifying)

**Example:**
```typescript
window.modAPI.hooks.onReduxAction((actionType, stateBefore, stateAfter) => {
  if (actionType === 'inventory/addItem') {
    if (stateAfter.gameData.flags?.hard_mode) {
      // Double every item added in hard mode
      return { ...stateAfter, inventory: myDoubledInventory(stateAfter.inventory) };
    }
  }
  return stateAfter;
});
```

---

## State Access and UI

These functions are on the root `window.modAPI` object, not under `window.modAPI.hooks`.

### `subscribe`

Subscribe to any Redux state change. The callback is called after every dispatched action. Returns an unsubscribe function.

```typescript
const unsub = window.modAPI.subscribe(() => {
  const snap = window.modAPI.getGameStateSnapshot();
  if (snap) updateMyOverlay(snap.player.player.stats.hp);
});

// Stop listening later
unsub();
```

### `getGameStateSnapshot`

Returns a read-only snapshot of the complete game state, or `null` if no save is loaded.

```typescript
const snap = window.modAPI.getGameStateSnapshot();
if (snap) {
  console.log('Player realm:', snap.player.player.realm);
  console.log('Spirit stones:', snap.inventory.money);
}
```

### `injectUI`

Inject React content into a named slot inside an existing game dialog or screen. Returns `void`.

**Slot names:**
- For dialogs: the dialog's DOM **id** (e.g. `'combat-victory'`). Open the game in dev mode and inspect the element to find the id for the dialog you want to target.
- For screens: the `ScreenType` value (e.g. `'combat'`, `'location'`)

**Parameters passed to your generator:**
- `api` — `ModReduxAPI` with game state, actions, and components
- `element` — root DOM element of the slot; use `querySelector` to find children
- `inject(selector, content, mode?)` — portal helper:
  - `selector`: CSS selector to target inside `element`
  - `content`: React node to render
  - `mode`: `'overlay'` (default, floats over target) or `'inline'` (inserts as a sibling after target)

```typescript
window.modAPI.injectUI('combat-victory', (api, element, inject) => {
  return inject(
    '[aria-live="assertive"]',
    <button style={{ pointerEvents: 'auto' }} onClick={() => console.log('bonus!')}>
      Claim Bonus
    </button>,
    'inline'
  );
});
```

To add UI to a full mod screen instead, see [Adding Screens](adding-screens).

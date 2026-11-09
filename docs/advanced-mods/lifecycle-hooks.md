---
layout: default
title: Lifecycle hooks
parent: Advanced mods
nav_order: 1
---

# Mod Hooks Documentation

This document describes the available mod hooks that allow mods to intercept and modify game behavior at specific points.

All hooks are registered via `window.modAPI.hooks`. Every hook returns a function — call it to remove the interceptor:

```typescript
const unsubscribe = window.modAPI.hooks.onCreateEnemyCombatEntity((enemy, combatEntity, gameFlags) => {
  // ...
  return combatEntity;
});

// Later: stop intercepting
unsubscribe();
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

Fires before combat is initialized. Allows modifying the enemy list and the player's starting combat entity. Return modified copies; mutations to the originals are not used.

**Parameters:**
- `enemies: EnemyEntity[]` - The enemies about to be fought
- `playerState: CombatEntity` - The player's starting combat entity
- `gameFlags: Record<string, number>` - Current game flags/state

**Returns:** `{ enemies: EnemyEntity[]; playerState: CombatEntity }` - Modified copies

**Example:**
```typescript
window.modAPI.hooks.onBeforeCombat((enemies, playerState, gameFlags) => {
  if (gameFlags.hard_mode) {
    const scaled = enemies.map(e => ({ ...e, statMultipliers: { ...e.statMultipliers, hp: (e.statMultipliers?.hp ?? 1) * 2 } }));
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

### `onModifyRecipeIngredients`

Modifies the ingredients or amounts used in a recipe before crafting calculations run. This fires before `onDeriveRecipeDifficulty`.

**Parameters:**
- `recipe: RecipeItem` - The recipe being crafted
- `gameFlags: Record<string, number>` - Current game flags/state

**Returns:** Modified `RecipeItem`

**Example:**
```typescript
window.modAPI.hooks.onModifyRecipeIngredients((recipe, gameFlags) => {
  if (gameFlags.efficient_crafting) {
    const modified = { ...recipe };
    modified.ingredients = recipe.ingredients.map(ing => ({
      ...ing,
      quantity: Math.max(1, Math.floor(ing.quantity * 0.5)),
    }));
    return modified;
  }
  return recipe;
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

  if (victory && playerCombatState.stats.hp === playerCombatState.stats.maxhp) {
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
- `eventStep: DualCultivationStep` - The event step that triggered the dual cultivation
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
- `item: CraftingResult | undefined` - The craft result. `undefined` if the craft failed before producing a result. The result's `state` field is `'failed'`, `'basic'`, `'perfect'`, or `'sublime'`. Replicated pills are in `replicatedPills`; refunded materials are in `refund` for failed crafts. `qualityTiers` holds the quality tier count.
- `gameFlags: Record<string, number>` - Current game flags/state

**Returns:** `EventStep[]` - Additional event steps to execute

**Example:**
```typescript
window.modAPI.hooks.onCompleteCrafting((eventStep, item, gameFlags) => {
  const events: EventStep[] = [];

  if (item && item.state !== 'failed') {
    // Award favour for high-quality crafts
    if ((item.qualityTiers ?? 0) >= 4) {
      events.push({ kind: 'reputation', name: 'Celadon Flame Brewers', amount: '' + ((item.qualityTiers ?? 0) * 5) });
    }
    // Handle replicated pills - these are separate from the crafted item
    item.replicatedPills?.forEach((pill) => {
      events.push({ kind: 'addItem', item: pill, amount: '1' });
    });
  } else if (item) {
    // Failed craft: check for refunded materials
    item.refund?.forEach((mat) => {
      events.push({ kind: 'addItem', item: mat, amount: '1' });
    });
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

Use this hook to add a bonus encounter to an existing exploration location, remove an encounter under a mod setting, or change an event's rarity without replacing the location definition. The hook receives the location's event definitions before their conditions and cooldowns are checked. Returned events still pass those checks and participate in the game's encounter selection. Returning an event does not force it to run on the next exploration.

**Parameters:**

- `locationId: string` - The current location's registered name. Scope changes to the intended location.
- `events: LocationEvent[]` - The current event definitions, including changes from earlier hooks.
- `gameFlags: Record<string, number>` - Current expression variables and flags.

**Returns:** `LocationEvent[]` - The replacement event pool. Return the input unchanged when your rule does not apply.

### Add a Conditional Bonus Encounter

Define a `LocationEvent` using the [location event fields](../locations/location-structure#events), then register the hook from a module imported by `src/modContent/index.ts`. For example, this helper attaches a mod-owned encounter to one registered location:

```typescript
import type { LocationEvent } from 'afnm-types';

function registerBonusEncounter(locationName: string, bonusEvent: LocationEvent) {
  return window.modAPI.hooks.onGenerateExploreEvents((locationId, events) => {
    if (locationId !== locationName || events.includes(bonusEvent)) return events;
    return [...events, bonusEvent];
  });
}
```

Call the helper once with your location name and event definition, and retain its returned function if you need to remove the hook. Put progression requirements in the event's `condition` and repeat spacing in its `cooldown`. Choose `rarity` to influence relative selection frequency. Lower rarities receive more selection weight, but competing encounters and repetition penalties also affect the result. Prefer changing definitions in the returned array over duplicating an encounter to increase its chances. Preserve array order where possible because reordering can change which encounter receives the repetition penalty.

For an encounter that always belongs to your own location, supply it directly in `GameLocation.events` instead. Use this hook when the pool needs a conditional modification across existing definitions. See [Location Structure](../locations/location-structure) for location registration and event configuration.

Test in the target location and an unrelated location. Try both true and false event conditions, then trigger the encounter and verify its cooldown on subsequent explorations. Repeat exploration enough times to distinguish random selection from an eligibility problem.

---

## Location Hooks

### `onLocationEnter`

Fires when the player moves to a new location.

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

Fires when combat loot is distributed to the player after a fight. Use `onCompleteCombat` if you need to modify or add drops.

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
- `month: number` - The new month (1 to 12)
- `year: number` - The current year
- `gameFlags: Record<string, number>` - Current game flags/state

**Example:**
```typescript
window.modAPI.hooks.onAdvanceMonth((month, year, gameFlags) => {
  if (month === 3) {
    console.log('Spring festival month:', year);
  }
});
```

---

## New Game Hooks

### `onNewGame`

Fires when the player starts a new game (including after the optional tutorial). Called after all character creation choices are finalized but before the game state is committed. Use it to grant starting resources or initialize character-specific flags while preserving the selected backgrounds and alternative start.

**Parameters:**
- `intent: NewGameIntent` - The full new game state:
  - `items: ItemDesc[]` - items granted at game start
  - `techniques: string[]` - technique IDs granted at game start
  - `recipes: string[]` - recipe IDs granted at game start
  - `destinies: string[]` - destiny IDs granted at game start
  - `quests: string[]` - quest IDs granted at game start
  - `money: number` - starting silver
  - `favour: number` - starting favour
  - `flags: Record<string, number>` - initial character flags, including background contributions
  - `player: PlayerEntity` - the player entity after backgrounds are applied
  - `craftingActions: string[]` - crafting action IDs granted at game start

**Returns:** `NewGameIntent` - modified intent (spread the original intent to preserve all required fields)

### Configure Starting Resources and Flags

Register the hook from a module imported by `src/modContent/index.ts`. This example gives each new character extra starting money and a character-specific flag that your mod's event conditions can read:

```typescript
window.modAPI.hooks.onNewGame((intent) => ({
  ...intent,
  money: intent.money + 500,
  flags: { ...intent.flags, myModStarted: 1 },
}));
```

Return a spread copy so other mods' starting items, techniques and quests remain intact. To grant your own content, register the definitions first and append their registered names to the corresponding intent arrays. `items` takes `ItemDesc` entries rather than names alone. See [Registering Items](../items/item-structure#1-adding-items-to-the-game) and [Flags](../concepts/flags) for content definitions and flag conditions.

The hook receives background flags and starting resources already collected into the intent. Its `player` also includes the alternative start's `modifyPlayer` result. Hooks run in registration order, and each receives the preceding hook's changes. This hook configures new characters only. Test both the normal opening and the skip route you support, then save and reload to verify the flag persists without granting the starting bonus again.

For rewards during an existing game, return event steps from the relevant [completion hook](#completion-hooks). For interface settings, use the supported actions described in [Adding Screens](adding-screens#custom-data). Use [state subscriptions](#subscribe) for a display that needs to refresh when game data changes.

---

## Equipment Hooks

### `onDeriveEquipmentUpgradeRequirement`

Called before the equipment upgrade dialog is shown. Allows mutating upgrade cost items and result item quality tier and hidden potential, but not the base item.

**Parameters:**
- `baseItem: Item` - The item being upgraded
- `costItems: Item[]` - Items consumed as upgrade cost
- `resultItem: { resultItemName: string; resultQualityTier: number; resultHiddenPotential?: number; resultEnchantment?: EnchantmentDesc }` - Preview of the result item
- `gameFlags: Record<string, number>` - Current game flags/state

**Returns:** `{ costItems?: Item[]; resultItem?: Partial<{ resultItemName: string; resultQualityTier: number; resultHiddenPotential: number; resultEnchantment: EnchantmentDesc }> } | undefined`

**Example:**
```typescript
window.modAPI.hooks.onDeriveEquipmentUpgradeRequirement((baseItem, costItems, resultItem, gameFlags) => {
  return {
    costItems,
    resultItem: { ...resultItem, resultQualityTier: resultItem.resultQualityTier + 2 },
  };
});
```

### `onCompleteEquipmentUpgrade`

Called when an equipment upgrade completes. Read-only: cannot modify the result item. Use `onDeriveEquipmentUpgradeRequirement` to change the result before the upgrade.

**Parameters:**
- `baseItem: Item` - The item that was upgraded
- `costItems: Item[]` - Items that were consumed
- `resultItem: Item` - The resulting upgraded item
- `gameFlags: Record<string, number>` - Current game flags/state

**Example:**
```typescript
window.modAPI.hooks.onCompleteEquipmentUpgrade((baseItem, costItems, resultItem, gameFlags) => {
  console.log('Upgraded:', resultItem.name, 'from', baseItem.name);
});
```

### `onDeriveEquipmentReforgeRequirement`

Called before the equipment reforge dialog is shown. Allows mutating reforge cost items and result item quality tier and hidden potential, but not the base item.

**Parameters:**
- `baseItem: Item` - The item being reforged
- `costItems: Item[]` - Items consumed as reforge cost
- `resultItem: { resultItemName: string; resultQualityTier: number; resultHiddenPotential?: number; resultEnchantment?: EnchantmentDesc }` - Preview of the result item
- `gameFlags: Record<string, number>` - Current game flags/state

**Returns:** `{ costItems?: Item[]; resultItem?: Partial<{ resultItemName: string; resultQualityTier: number; resultHiddenPotential: number; resultEnchantment: EnchantmentDesc }> } | undefined`

**Example:**
```typescript
window.modAPI.hooks.onDeriveEquipmentReforgeRequirement((baseItem, costItems, resultItem, gameFlags) => {
  return { costItems, resultItem: { ...resultItem, resultQualityTier: 10 } };
});
```

### `onCompleteEquipmentReforge`

Called after the reforge completes, before the result dialog is shown. Allows modifying the cost items and result item.

**Parameters:**
- `baseItem: Item` - The item that was reforged
- `costItems: Item[]` - Items that were consumed
- `resultItem: Item` - The resulting reforged item
- `gameFlags: Record<string, number>` - Current game flags/state

**Returns:** `{ costItems?: Item[]; resultItem?: Item } | undefined`

**Example:**
```typescript
window.modAPI.hooks.onCompleteEquipmentReforge((baseItem, costItems, resultItem, gameFlags) => {
  return {
    costItems,
    resultItem: resultItem ? { ...resultItem, valueTier: (resultItem.valueTier ?? 0) + 1 } : undefined,
  };
});
```

### `onDeriveEquipmentReharmonizeRequirement`

Called before the retarget requirements are shown, when the player changes an item's harmony type. Allows changing the material costs and the resulting item.

**Parameters:**
- `baseItem: Item` - The item being retargeted
- `costItems: Item[]` - Items consumed as the retarget cost
- `resultItem: Item` - The retargeted item: the same item with a new harmony type and half its previous quality, the removed quality returned as hidden potential
- `gameFlags: Record<string, number>` - Current game flags/state

**Returns:** `{ costItems?: Item[]; resultItem?: Item } | undefined`

The returned `costItems` replaces the entire cost list and the returned `resultItem` replaces the entire resulting item. Nothing is merged field by field, unlike `onDeriveEquipmentReforgeRequirement`, whose `resultItem` is a preview descriptor that is merged field by field. Return a complete `Item` if you change it. Hooks run in registration order and each one receives the output of the previous.

**Example:**
```typescript
window.modAPI.hooks.onDeriveEquipmentReharmonizeRequirement((baseItem, costItems, resultItem, gameFlags) => {
  return {
    costItems,
    resultItem: { ...resultItem, hiddenPotential: (resultItem.hiddenPotential ?? 0) + 1 },
  };
});
```

### `onCompleteEquipmentReharmonize`

Called after the retarget completes, before the result dialog is shown. Allows modifying the resulting item.

**Parameters:**
- `baseItem: Item` - The item that was retargeted
- `costItems: Item[]` - Items that were consumed
- `resultItem: Item` - The resulting retargeted item
- `gameFlags: Record<string, number>` - Current game flags/state

**Returns:** `{ costItems?: Item[]; resultItem?: Item } | undefined`

**Example:**
```typescript
window.modAPI.hooks.onCompleteEquipmentReharmonize((baseItem, costItems, resultItem, gameFlags) => {
  return {
    costItems,
    resultItem: resultItem ? { ...resultItem, valueTier: (resultItem.valueTier ?? 0) + 1 } : undefined,
  };
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
  if (snap) updateMyOverlay(snap.player.player.hp);
});

// Stop listening later
unsub();
```

For read-only overlays, advisors, and inspectors, `subscribe()` plus `getGameStateSnapshot()` should be your first integration path. Render the result through [UI injection](#injectui) or a [custom screen](adding-screens), and make changes through the actions provided by the Mod API.

**Reactive patterns with `subscribe()`:**

```typescript
// Rate-limited reactive updates
let lastUpdate = 0;
window.modAPI.subscribe(() => {
  const now = Date.now();
  if (now - lastUpdate < 250) return; // Throttle to 4 Hz
  lastUpdate = now;

  const snap = window.modAPI.getGameStateSnapshot();
  if (snap) refreshMyPanel(snap);
});

// Selective re-render — only update when a specific slice changes
let lastLocation: string | null = null;
window.modAPI.subscribe(() => {
  const snap = window.modAPI.getGameStateSnapshot();
  const current = snap?.location?.current ?? null;
  if (current !== lastLocation) {
    lastLocation = current;
    onLocationChanged(current);
  }
});
```

### `getGameStateSnapshot`

Returns a read-only snapshot of the complete game state. When no save is loaded, AFNM returns the default base state.

```typescript
const snap = window.modAPI.getGameStateSnapshot();
console.log('Player realm:', snap.player.player.realm);
console.log('Spirit stones:', snap.inventory.money);
```

### `injectUI`

Inject React content into a named slot inside an existing game dialog or screen.

**Slot names:**
- For dialogs: the dialog's DOM **id** (e.g. `'combat-victory'`). Open the game in dev mode and inspect the element to find the id for the dialog you want to target.
- For screens: the `ScreenType` value (e.g. `'combat'`, `'location'`)

**Parameters passed to your generator:**
- `api` — `ModReduxAPI` with game state, actions, and components
- `inject(selector, content, placement?)` — portal helper:
  - `selector`: CSS selector scoped to the target slot, or an `HTMLElement`
  - `content`: React node to render
  - `placement`: `'after'` by default for selectors, with options like `'before'`, `'appendChild'`, `'prependChild'`, `'overlay'`, and replacement/wrap placements

```typescript
window.modAPI.injectUI('combat-victory', (api, inject) => {
  inject(
    '[aria-live="assertive"]',
    <api.components.GameButton onClick={() => console.log('bonus!')}>
      Claim Bonus
    </api.components.GameButton>,
    'after'
  );
});
```

To add UI to a full mod screen instead, see [Adding Screens](adding-screens).

---
layout: default
title: Best Practices
parent: Advanced mods
nav_order: 6
---

# Best Practices

Patterns, defensive coding techniques, and architectural guidance learned from shipping real AFNM mods.

---

## Mod Archetypes

Not every mod adds items and locations. Before writing code, identify which archetype your mod falls into — this determines which parts of the ModAPI you lean on and how to structure the project.

### Content Addition

The most common mod type. You add new items, characters, locations, quests, events, recipes, enemies, or crafting techniques to the game world. The rest of these docs focus primarily on this pattern.

**Default stack:** `actions.addItem()`, `actions.addLocation()`, `actions.addQuest()`, event definitions, shop/auction integration, asset imports.

### Narrative / Story

Quest chains, branching event sequences, calendar events, triggered events, and companion interactions. A specialization of content addition focused on event flow.

**Default stack:** `actions.addQuest()`, `actions.addCalendarEvent()`, `actions.addTriggeredEvent()`, event step arrays, `utils.createQuestionAnswerList()` for branching dialogue, flags for tracking progress.

### Quality-of-Life / UI Tool

Custom screens, stat viewers, inventory helpers, map tools, crafting assistants, or any mod that adds a new interface without changing gameplay.

**Default stack:** `addScreen()` for full-page interfaces, `injectUI()` for small affordances in existing dialogs, `useSelector()` and `useGameFlags()` for state, `actions.setModData()` for persistent mod state. See [Add a tool to a dialog](#add-a-tool-to-a-dialog).

### Gameplay Modifier

Changes probabilities, rewards, event pools, stat math, difficulty, or any settings-driven behavior without adding new content.

**Default stack:** mutation hooks (`onCalculateDamage`, `onBeforeCombat`, `onDeriveRecipeDifficulty`, `onEventDropItem`, `onGenerateExploreEvents`), numeric global flags for settings, `registerOptionsUI()` for a settings panel.

### Overhaul / Rebalance

Wholesale changes to game balance — enemy stats, crafting difficulty, damage formulas, reward scaling.

**Default stack:** `onCreateEnemyCombatEntity` for enemy stats, `onCalculateDamage` for damage formulas, `onDeriveRecipeDifficulty` for crafting, `onBeforeCombat` for encounters. Use `onReduxAction` only as a last resort.

### Cosmetic / Personalization

Player sprites, alternative starts, character backgrounds, starting treasures, new music or sound effects.

**Default stack:** `actions.addPlayerSprite()`, `actions.addMusic()`, and `actions.addSfx()` for presentation. Use [`actions.addAlternativeStart()`](../concepts/modapi.md#specialized-content) for a custom starting location and opening event.

#### Add a character creation choice

Use `actions.addChildBackground(background)` in your mod entry point when you want a selectable childhood with its own grants. Give the `Background` a distinct `name` and a `description` that explains the choice. For example, set `spiritStones: 10` for a childhood that provides a small starting purse. Use the optional second argument to display a React glyph beside the choice.

Use `actions.addStartingTreasure(treasure)` when the choice is a starting reward bundle. Supply a `StartingTreasure` with `name`, `description`, and an `items` array of complete item objects. For a starter kit, reuse the item objects your mod registers with `actions.addItem()`.

Enable the mod, start a fresh character, and select the childhood or treasure you registered. Finish character creation and check the starting currency or equipment and inventory. Create a second character with a different choice to confirm that the grant depends on the selection. For grants that apply across character creation choices, see the [new-game hook](lifecycle-hooks.md#onnewgame).

### Read-Only Advisor / Overlay

Mods that explain, visualize, or recommend without mutating gameplay. These mods observe game state and present information to the player.

**Default stack:** `getGameStateSnapshot()`, `subscribe()`, `injectUI()` for local entry points. See [Add a tool to a dialog](#add-a-tool-to-a-dialog).

### Search / Simulation / Optimizer

Mods that predict future turns, compare multiple possible lines, or automate decision-making.

**Default stack:** strict separation between live game integration and pure simulation logic, authoritative local math for hypothetical evaluation, replayable test fixtures.

---

## Defensive Coding Patterns

### Optional Chaining on ModAPI Access

The ModAPI surface can change across game versions. Always use optional chaining when accessing methods:

```typescript
// Defensive — works even if the hook is removed in a future version
window.modAPI?.hooks?.onGenerateExploreEvents?.((locationId, events, gameFlags) => {
  return events;
});

// Defensive state access
const snapshot = window.modAPI?.getGameStateSnapshot?.() ?? null;
```

### Duplicate Installation Guard

Mods can be initialized multiple times due to hot-reload or mod manager re-application. Guard against double-registration:

```typescript
window.__myModInstalled ??= {};
if (window.__myModInstalled['my-mod-name']) {
  return;
}
window.__myModInstalled['my-mod-name'] = true;

// Safe to register hooks, UI, etc.
```

Declare the global in your type definitions:

```typescript
declare global {
  interface Window {
    __myModInstalled?: Record<string, boolean>;
  }
}
```

### Default Flag Initialization

Always initialize expected flags on startup rather than assuming they exist:

```typescript
function ensureDefaults() {
  const flags = window.modAPI?.actions?.getGlobalFlags?.() ?? {};
  if (flags['myMod.enabled'] === undefined) {
    window.modAPI?.actions?.setGlobalFlag?.('myMod.enabled', 1);
  }
}
```

---

## Global Flag Best Practices

### Namespacing

Use dot-notation with your mod name as prefix to avoid collisions with other mods:

```typescript
// Good — namespaced
'myMod.enabled'
'myMod.difficulty'
'myMod.multiplier'

// Bad — could collide with other mods or the base game
'enabled'
'difficulty'
```

### Legacy Flag Migration

When renaming flags between versions, migrate old values on startup:

```typescript
function migrateLegacyFlags() {
  const flags = window.modAPI?.actions?.getGlobalFlags?.() ?? {};

  // Migrate old key to new key
  if (flags['oldModName.setting'] !== undefined && flags['newModName.setting'] === undefined) {
    window.modAPI?.actions?.setGlobalFlag?.('newModName.setting', flags['oldModName.setting']);
  }
}
```

### Boolean Storage

Global flags are numeric only. Store booleans as `0` / `1`:

```typescript
const enabled = (flags['myMod.enabled'] ?? 1) !== 0;
window.modAPI?.actions?.setGlobalFlag?.('myMod.enabled', enabled ? 0 : 1);
```

---

## Debug API Pattern

Expose a debug object on `window` so you (and users reporting bugs) can inspect mod state from the browser console:

```typescript
const debugApi = {
  getConfig: () => ({ ...currentConfig }),
  getSnapshot: () => window.modAPI?.getGameStateSnapshot?.() ?? null,
  getLastLocation: () => lastKnownLocation,
  logState: () => {
    console.log('[MyMod] Config:', currentConfig);
    console.log('[MyMod] Snapshot:', window.modAPI?.getGameStateSnapshot?.());
  },
};

declare global {
  interface Window { __myModDebug?: Record<string, typeof debugApi> }
}

window.__myModDebug ??= {};
window.__myModDebug['my-mod-name'] = debugApi;
```

Users can then open the dev console and run:

```javascript
window.__myModDebug['my-mod-name'].getConfig()
window.__myModDebug['my-mod-name'].logState()
```

---

## Options UI: createElement vs JSX

The `registerOptionsUI` component receives `api: ModReduxAPI`. The template supports JSX in `.tsx` files. If you prefer a `.ts` component, import `createElement` from React; Webpack uses the game's shared React runtime:

```typescript
import { createElement } from 'react';
import type { ModOptionsFC } from 'afnm-types';

const MyOptions: ModOptionsFC = ({ api }) => {
  const flags = window.modAPI.actions.getGlobalFlags();
  const enabled = (flags['myMod.enabled'] ?? 1) === 1;
  const GameButton = api.components.GameButton ?? 'button';
  return createElement('div', { style: { padding: '8px' } }, [
    createElement('div', { key: 'title', style: { fontWeight: 700 } }, 'My Mod Settings'),
    createElement(
      GameButton,
      { key: 'toggle', onClick: () => window.modAPI.actions.setGlobalFlag('myMod.enabled', enabled ? 0 : 1) },
      enabled ? 'Disable' : 'Enable',
    ),
  ]);
};

window.modAPI?.actions?.registerOptionsUI?.(MyOptions);
```

Both JSX and createElement produce the same result — use whichever your build pipeline supports.

---

## Add a tool to a dialog

Register `window.modAPI.injectUI(slotName, generator)` in your mod entry point. Choose the dialog slot where the tool is relevant. For example, `combat-victory` is a place to show a reminder after a successful fight. The generator receives the mod UI API and an `inject(selector, content, placement?)` helper. Pass an empty selector to append to the slot root by default. To position content beside a specific element, use a selector scoped to the slot and pass a placement such as `'after'`. See the [UI Injection reference](../concepts/modapi.md#ui-injection) for placement options.

Put this registration in a `.tsx` file to use JSX:

```tsx
window.modAPI.injectUI('combat-victory', (_api, inject) => {
  inject('', <p>Check whether your mod quest needs another victory.</p>);
});
```

Win a fight with the mod enabled and check that the reminder appears inside the victory dialog. Dismiss it and win another fight to confirm that the dialog mounts one copy each time. For a tool that needs an entire page, see [Adding Screens](adding-screens.md).

---

## Hook Risk Classification

### Observation Hooks

- `onLocationEnter` — fires when the player moves to a new location
- `onLootDrop` — fires when combat loot is distributed
- `onAdvanceDay` / `onAdvanceMonth` — fires on time progression

Use these for logging or updating your mod's own state in response to gameplay.

### Mutation Hooks

These return a value that the game uses, meaning your code directly affects gameplay:

- `onCalculateDamage` — modifies damage values
- `onEventDropItem` — modifies or suppresses item drops
- `onCreateEnemyCombatEntity` — modifies enemy stats
- `onBeforeCombat` — modifies enemy list and player state
- `onDeriveRecipeDifficulty` — modifies crafting difficulty
- `onGenerateExploreEvents` — modifies the event pool

Return the original value when your condition does not match.

---

## Runtime Verification

When docs, types, and actual runtime behavior disagree, trust the installed runtime.

### Installed-Runtime Oracle Pattern

Extract and inspect the shipped game bundle to check the bindings for a documented API:

```bash
# Extract the installed game bundle
npx -y @electron/asar extract "/path/to/Ascend From Nine Mountains/resources/app.asar" ./tmp/afnm-runtime

# Search for specific API names
rg -n "registerOptionsUI|injectUI|onGenerateExploreEvents" ./tmp/afnm-runtime/dist-electron

# Check for specific hook existence
rg -n "onAdvanceDay|onAdvanceMonth|onBeforeCombat" ./tmp/afnm-runtime/dist-electron
```

Test the call in game to verify that it behaves as your mod expects.

---

## Non-Steam Testing Workflow

When you need a live client test without Steam relaunch loops:

1. Create an empty file named `disable_steam` beside the game executable
2. If available, use `launch-native.sh` (Linux) or launch the executable directly
3. For DevTools access, launch with `--remote-debugging-port=9222`
4. **Critical:** Delete `disable_steam` when finished — leaving it behind blocks Workshop mod loading

```bash
# Linux example
touch "/path/to/Ascend From Nine Mountains/disable_steam"
"/path/to/Ascend From Nine Mountains/launch-native.sh"
# Or with DevTools:
"/path/to/Ascend From Nine Mountains/Ascend From Nine Mountains" --remote-debugging-port=9222
# When done:
rm "/path/to/Ascend From Nine Mountains/disable_steam"
```

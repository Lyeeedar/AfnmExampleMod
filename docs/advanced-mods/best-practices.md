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

**Default stack:** `addScreen()` for full-page interfaces, `injectUI()` for small affordances in existing dialogs, `useSelector()` and `useGameFlags()` for state, `actions.setModData()` for persistent mod state. Persistent overlay mounted to `document.body` if the UI must survive screen transitions.

### Gameplay Modifier

Changes probabilities, rewards, event pools, stat math, difficulty, or any settings-driven behavior without adding new content.

**Default stack:** mutation hooks (`onCalculateDamage`, `onBeforeCombat`, `onDeriveRecipeDifficulty`, `onEventDropItem`, `onGenerateExploreEvents`), numeric global flags for settings, `registerOptionsUI()` for a settings panel.

### Overhaul / Rebalance

Wholesale changes to game balance — enemy stats, crafting difficulty, damage formulas, reward scaling.

**Default stack:** `onCreateEnemyCombatEntity` for enemy stats, `onCalculateDamage` for damage formulas, `onDeriveRecipeDifficulty` for crafting, `onBeforeCombat` for encounters. Use `onReduxAction` only as a last resort.

### Cosmetic / Personalization

Player sprites, alternative starts, new backgrounds, custom rooms, new music or sound effects.

**Default stack:** `actions.addPlayerSprite()`, `actions.addAlternativeStart()`, `actions.addBirthBackground()`, `actions.addRoom()`, `actions.addMusic()`, `actions.addSfx()`, `utils.generateSkipTutorialFlags()`.

### Read-Only Advisor / Overlay

Mods that explain, visualize, or recommend without mutating gameplay. These mods observe game state and present information to the player.

**Default stack:** `getGameStateSnapshot()`, `subscribe()`, `injectUI()` for local entry points. Persistent body-mounted overlay only if the UI must survive screen and dialog transitions. No mutation hooks.

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
window.modAPI?.actions?.setGlobalFlag?.('myMod.enabled', enabled ? 1 : 0);
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

The `registerOptionsUI` component receives the game's React runtime, but JSX compilation depends on your build setup. If JSX is not available in the options panel context, use `window.React.createElement` directly:

```typescript
const MyOptions: ModOptionsFC = ({ api }) => {
  const ReactRuntime = window.React;
  if (!ReactRuntime?.createElement) return null;

  const createElement = ReactRuntime.createElement.bind(ReactRuntime);
  const flags = api.actions.getGlobalFlags();
  const enabled = (flags['myMod.enabled'] ?? 1) === 1;
  const GameButton = api.components.GameButton ?? 'button';

  return createElement('div', { style: { padding: '8px' } }, [
    createElement('div', { key: 'title', style: { fontWeight: 700 } }, 'My Mod Settings'),
    createElement(
      GameButton,
      { key: 'toggle', onClick: () => api.actions.setGlobalFlag('myMod.enabled', enabled ? 0 : 1) },
      enabled ? 'Disable' : 'Enable',
    ),
  ]);
};

window.modAPI?.actions?.registerOptionsUI?.(MyOptions);
```

Both JSX and createElement produce the same result — use whichever your build pipeline supports.

---

## Persistent Overlay vs injectUI

### When to Use `injectUI()`

Use slot injection when the action belongs to one dialog or screen:

```typescript
window.modAPI.injectUI('combat-victory', (api, element, inject) => {
  return inject(
    '[aria-live="assertive"]',
    <button onClick={() => console.log('bonus!')}>Claim Bonus</button>,
    'inline',
  );
});
```

### When to Use a Persistent Overlay

Use a body-mounted overlay when the affordance must survive location, combat, event, and crafting screen transitions:

```typescript
function mountPersistentOverlay() {
  const container = document.createElement('div');
  container.id = 'my-mod-overlay';
  container.style.cssText = 'position:fixed;top:8px;right:8px;z-index:9999;pointer-events:auto;';
  document.body.appendChild(container);

  // Render your React component into the container
  const root = (window as any).ReactDOM?.createRoot?.(container);
  if (root) {
    root.render(<MyOverlayApp />);
  }
}
```

**Choose deliberately.** If a small injected affordance solves the problem, avoid the overhead of a persistent overlay.

---

## Hook Risk Classification

Not all hooks carry the same risk. Understand what each hook does before adopting it.

### Observation Hooks (Safe)

These fire for informational purposes and do not return a value that modifies gameplay:

- `onLocationEnter` — fires when the player moves to a new location
- `onLootDrop` — fires when combat loot is distributed
- `onAdvanceDay` / `onAdvanceMonth` — fires on time progression

These are safe to use for logging, triggering side-channel behavior (e.g., showing advice), or updating mod-internal state.

### Mutation Hooks (Use With Care)

These return a value that the game uses, meaning your code directly affects gameplay:

- `onCalculateDamage` — modifies damage values
- `onEventDropItem` — modifies or suppresses item drops
- `onCreateEnemyCombatEntity` — modifies enemy stats
- `onBeforeCombat` — modifies enemy list and player state
- `onDeriveRecipeDifficulty` — modifies crafting difficulty
- `onGenerateExploreEvents` — modifies the event pool

Always return the original value unchanged if your condition does not match. Never forget the `return` statement.

### Dangerous Hooks

- `onReduxAction` — runs inside the Redux reducer. Keep it fast, deterministic, and free of side-effects. Avoid network requests, UI work, and heavy computation here. If `subscribe()` can solve the problem, prefer that.

---

## Runtime Verification

When docs, types, and actual runtime behavior disagree, trust the installed runtime.

### Installed-Runtime Oracle Pattern

Extract and inspect the shipped game bundle before building against undocumented behavior:

```bash
# Extract the installed game bundle
npx -y @electron/asar extract "/path/to/Ascend From Nine Mountains/resources/app.asar" ./tmp/afnm-runtime

# Search for specific API names
rg -n "registerOptionsUI|injectUI|onGenerateExploreEvents" ./tmp/afnm-runtime/dist-electron

# Check for specific hook existence
rg -n "onAdvanceDay|onAdvanceMonth|onBeforeCombat" ./tmp/afnm-runtime/dist-electron
```

This is faster and more reliable than launching the full game just to confirm a symbol exists. Use it as your default parity check when the documentation might be out of date.

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

---

## What You Cannot Hook

Some game behaviors have no ModAPI interception point. Knowing these limitations saves time:

- **World map events** (`EventTrigger.tsx`) — events triggered on location entry via the map have no hook. Workarounds include state manipulation, event replacement via `addMapEventsToLocation`, or adding events through `addEventsToLocation` instead.
- **Auto-battle state** — not exposed in `getGameStateSnapshot()`. If you need auto-battle status, you may need DOM inspection as a fallback.
- **Crafting action dispatch** — the ModAPI does not expose a public way to dispatch native crafting actions. `onDeriveRecipeDifficulty` and `onCompleteCrafting` let you observe and modify the process, but not drive it.

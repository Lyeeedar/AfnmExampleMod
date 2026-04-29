---
layout: default
title: ModAPI Reference
parent: Core Concepts
nav_order: 1
description: 'Complete reference for the AFNM ModAPI system'
---

# ModAPI Reference

The ModAPI provides access to game data, content registration functions, and utility helpers for mod development.

## Structure

The ModAPI is available globally as `window.modAPI` with four main sections:

```typescript
interface ModAPI {
  gameData: {
    /* Access to all game content */
  };
  actions: {
    /* Functions to add new content */
  };
  utils: {
    /* Helper functions for mod development */
  };
  hooks: {
    /* Interceptors for game behavior */
  };
}
```

## Game Data Access

Access existing game content through `window.modAPI.gameData`:

### Core Collections

- **`items`** - `Record<string, Item>` - All items in the game
- **`characters`** - `Record<string, Character>` - All NPCs and characters
- **`techniques`** - `Record<string, Technique>` - All cultivation techniques
- **`locations`** - `Record<string, GameLocation>` - All game locations
- **`quests`** - `Record<string, Quest>` - All available quests
- **`manuals`** - `Record<string, ManualItem>` - All technique manuals
- **`destinies`** - `Record<string, Destiny>` - All destiny definitions
- **`calendarEvents`** - `CalendarEvent[]` - All registered calendar events
- **`triggeredEvents`** - `TriggeredEvent[]` - All registered triggered events

### Realm-Based Collections

- **`auction`** - `Record<Realm, AuctionItemDef[]>` - Auction items by realm
- **`breakthroughs`** - `Record<Realm, Breakthrough[]>` - Breakthrough requirements
- **`crops`** - `Record<Realm, Crop[]>` - Crops available by realm
- **`mineChambers`** - `Record<Realm, Record<RealmProgress, MineChamber[]>>` - Mine chambers by realm and progress
- **`uncutStones`** - `Record<Realm, UncutStonePool | undefined>` - Uncut stone pools by realm

### Specialized Collections

- **`backgrounds`** - Character backgrounds by life stage:
  - `birth: Background[]`
  - `child: Background[]`
  - `teen: Background[]`
- **`craftingTechniques`** - `Record<string, CraftingTechnique>` - All crafting techniques
- **`techniqueBuffs`** - School-specific technique buffs:
  - `blood`, `blossom`, `celestial`, `cloud`, `fist`, `weapon`
- **`guilds`** - `Record<string, Guild>` - All guilds
- **`enchantments`** - `Enchantment[]` - All equipment enchantments
- **`fallenStars`** - `FallenStar[]` - All fallen star events
- **`rooms`** - `Room[]` - All house rooms
- **`mysticalRegionBlessings`** - `Blessing[]` - All mystical region blessings
- **`dualCultivationTechniques`** - `IntimateTechnique[]` - All dual cultivation techniques
- **`monsters`** - `EnemyEntity[]` - All registered enemy entities
- **`puppets`** - `PuppetType[]` - All training ground puppet types
- **`alternativeStarts`** - `AlternativeStart[]` - All alternative game starts (first entry is always the default)
- **`researchableMap`** - `Record<string, RecipeItem[]>` - Maps base item keys to researchable recipes
- **`recipeConditionEffects`** - `RecipeConditionEffect[]` - All crafting condition effects
- **`harmonyConfigs`** - `Record<RecipeHarmonyType, HarmonyTypeConfig>` - Harmony type configurations
- **`itemTypeToHarmonyType`** - `Record<ItemKind, RecipeHarmonyType>` - Maps item kinds to harmony types
- **`tutorials`** - Tutorial system data:
  - `newGameTutorials: Tutorial[]` — Base game tutorials played during a new game
  - `tutorialTriggers: TriggeredEvent[]` — Triggered events forming the opening sequence

## Content Registration

Add new content through `window.modAPI.actions`:

### Items and Equipment

```typescript
window.modAPI.actions.addItem(item: Item)
window.modAPI.actions.addItemToShop(item, stacks, location, realm, valueModifier?, reputation?)
window.modAPI.actions.addItemToGuild(item, stacks, guild, rank, valueModifier?, reputation?)
window.modAPI.actions.addItemToAuction(item, chance, condition, countOverride?, countMultiplier?)
window.modAPI.actions.addItemToFallenStar(item, realm)
window.modAPI.actions.addToSectShop(item, stacks, realm, valueModifier?, reputation?)
```

- **`addItemToGuild`** — Add an item to a guild's rank shop. `guild` is the guild name, `rank` is the minimum rank required to purchase.
- **`addItemToFallenStar`** — Add an item to the drop table for fallen stars of a given realm.
- **`addToSectShop`** — Add an item to the Nine Mountain Sect's Favour Exchange shop at the specified realm tier. Optionally apply a price multiplier and gate the item behind a reputation tier. Items without a reputation tier go into `itemPool[realm]`; items with a tier go into `reputationPool[realm]`.

```typescript
// Add item to sect shop at qiCondensation tier
window.modAPI.actions.addToSectShop(myItem, 3, 'qiCondensation');

// With price multiplier and reputation gate
window.modAPI.actions.addToSectShop(myRareItem, 1, 'coreFormation', 2.0, 'Honored');
```

### Characters and Backgrounds

```typescript
window.modAPI.actions.addCharacter(character: Character)
window.modAPI.actions.addBirthBackground(background: Background)
window.modAPI.actions.addChildBackground(background: Background)
window.modAPI.actions.addTeenBackground(background: Background)
```

### Cultivation Content

```typescript
window.modAPI.actions.addBreakthrough(realm: Realm, breakthrough: Breakthrough)
window.modAPI.actions.addTechnique(technique: Technique)
window.modAPI.actions.addManual(manual: ManualItem)
window.modAPI.actions.addCraftingTechnique(technique: CraftingTechnique)
window.modAPI.actions.addDestiny(destiny: Destiny)
```

**Note on `addTechnique`:** When `technique.realm` is set, the game automatically creates and registers a corresponding technique item (used in the debug inventory and item systems). If `technique.realm` is undefined, no item is created.

### World Content

```typescript
window.modAPI.actions.addLocation(location: GameLocation)
window.modAPI.actions.linkLocations(existing: string, link: ConditionalLink | ExplorationLink)
window.modAPI.actions.registerRootLocation(locationName: string, condition: string)
window.modAPI.actions.addQuest(quest: Quest)
window.modAPI.actions.addCalendarEvent(event: CalendarEvent)
window.modAPI.actions.addTriggeredEvent(event: TriggeredEvent)
```

#### `registerRootLocation`

Mark an existing location as a discovery root. Root locations are entry points for the map discovery system, all locations reachable from a root are discovered when its condition is met. Use this for secret areas or alternative starting points that are not connected to the main map.

```typescript
// Always-active root
window.modAPI.actions.registerRootLocation('Hidden Valley', '1');

// Unlocks after a flag is set
window.modAPI.actions.registerRootLocation('Ancient Ruins', 'foundAncientMap == 1');
```

### Modifying Existing Locations

Add content to locations that already exist in the game:

```typescript
window.modAPI.actions.addBuildingsToLocation(location: string, buildings: LocationBuilding[])
window.modAPI.actions.addEnemiesToLocation(location: string, enemies: LocationEnemy[])
window.modAPI.actions.addEventsToLocation(location: string, events: LocationEvent[])
window.modAPI.actions.addExplorationEventsToLocation(location: string, events: LocationEvent[])
window.modAPI.actions.addMapEventsToLocation(location: string, mapEvents: LocationMapEvent[])
window.modAPI.actions.addMissionsToLocation(location: string, missions: SectMission[])
window.modAPI.actions.addCraftingMissionsToLocation(location: string, missions: CraftingMission[])
```

All functions take the location key as their first argument. The location must already exist (either as a base game location or one you registered with `addLocation`).

#### `addQuestToRequestBoard`

Add a quest to a location's request board so players can accept it as a commission:

```typescript
window.modAPI.actions.addQuestToRequestBoard(
  quest: Quest,
  realm: Realm,
  rarity: Rarity,
  condition: string,
  location: string,
)
```

- **`quest`** — The quest definition. If the quest is not already registered, it is automatically added to the quest registry.
- **`realm`** — The realm tier this quest appears under on the request board (e.g. `'qiCondensation'`).
- **`rarity`** — Controls the display tier of the request. Valid values: `'mundane'`, `'qitouched'`, `'empowered'`, `'resplendent'`, `'incandescent'`, `'transcendent'`.
- **`condition`** — Flag expression that must be true for the quest to appear (e.g. `'1'` for always available, `'myMod_unlocked == 1'` for conditional).
- **`location`** — The location key. The location must have a `requestBoard` building, an error is thrown if the location does not exist or has no request board.

```typescript
// Example: add a gathering quest to the Liang Tiao Village request board
window.modAPI.actions.addQuestToRequestBoard(
  myGatheringQuest,
  'qiCondensation',
  'qitouched',
  '1',
  'Liang Tiao Village',
);
```

### Custom Screens

Register a full-page screen that players can navigate to:

```typescript
window.modAPI.actions.addScreen({
  key: string;          // Screen identifier for navigation
  component: ModScreenFC; // Your React functional component
  music?: string;        // Optional music track name
  ambience?: string;    // Optional ambient sound
  priority?: number;    // Optional priority for screen resolution
})
```

- **`key`** — Use `setScreen('yourKey')` to navigate to this screen from other screens or button click handlers.
- **`component`** — A `ModScreenFC` receiving `screenAPI: ModReduxAPI` as props. The screen API gives you hooks (`useSelector`, `useGameFlags`, `usePlaySfx`, `useKeybinding`), actions (`setScreen`, `setFlag`, `changeMoney`, `addItem`, `advanceDays`, etc.), and pre-styled components (`GameDialog`, `GameButton`, `GameIconButton`, `BackgroundImage`, `PlayerComponent`).
- Custom screens cannot be navigated to from event steps. The built-in `changeScreen` event step only supports the game's own screen types. To navigate to a mod screen mid-event, use a completion hook (e.g. `onCompleteCombat`) that calls `window.modAPI.actions.setScreen()`.

**Example screen:**

```typescript
const MyScreen: ModScreenFC = ({ screenAPI }) => {
  const { useSelector, actions, components } = screenAPI;
  const { GameDialog, GameButton, BackgroundImage, PlayerComponent } = components;
  const player = useSelector((state) => state.player.player);

  return (
    <Box position="relative" flexGrow={1} display="flex" flexDirection="column">
      <BackgroundImage image="town.png" />
      <GameDialog title="My Screen" onClose={() => actions.setScreen('location')}>
        <Typography>Hello, {player.forename}!</Typography>
        <GameButton onClick={() => actions.changeMoney(100)}>Get Stones</GameButton>
      </GameDialog>
      <Box position="absolute" width="100%" height="100%" display="flex" flexDirection="column">
        <Box flexGrow={1} />
        <Box display="flex">
          <PlayerComponent />
        </Box>
      </Box>
    </Box>
  );
};

window.modAPI.actions.addScreen({ key: 'myScreen', component: MyScreen });
```

For full documentation on building screens, see [Adding Screens](../advanced-mods/adding-screens).

### UI Injection

Inject React content into named slots inside existing game dialogs or screens:

```typescript
window.modAPI.injectUI(slotName: string, generator: (api: ModReduxAPI, element: HTMLElement, inject: InjectHelper) => void)
```

**Slot names:**
- For dialogs: the dialog's DOM **id** (e.g. `'combat-victory'`). Open the game in dev mode and inspect the element to find the id for the dialog you want to target.
- For full screens: the `ScreenType` value (e.g. `'combat'`, `'location'`, `'crafting'`, `'jadeCutting'`). You can also target specific sub-slots within screens (e.g. `'combat-topBarPlayerInfo'`, `'crafting-craftingScreen'`, `'stoneCutting-jadeCuttingScreen'`).

**The `inject` helper:**

```typescript
inject(selector: string, content: ReactNode, mode?: 'overlay' | 'inline')
```

- **`selector`** — CSS selector to target inside `element`
- **`content`** — React node to render
- **`mode`** — `'overlay'` (default, floats over target) or `'inline'` (inserts as a sibling after target)

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

For a full list of available slots on each screen, see the screen-specific slot names added to combat, crafting, and jade cutting screens. Use dev tools to inspect elements for the complete set of available injection points.

### Specialized Content

```typescript
window.modAPI.actions.addCrop(realm: Realm, crop: Crop)
window.modAPI.actions.addMineChamber(realm: Realm, progress: RealmProgress, chamber: MineChamber)
window.modAPI.actions.addGuild(guild: Guild)
window.modAPI.actions.addDualCultivationTechnique(technique: IntimateTechnique)
window.modAPI.actions.addEnchantment(enchantment: Enchantment)
window.modAPI.actions.addFallenStar(fallenStar: FallenStar)
window.modAPI.actions.addRoom(room: Room)
window.modAPI.actions.addMysticalRegionBlessing(blessing: Blessing)
window.modAPI.actions.addPuppetType(puppet: PuppetType)
window.modAPI.actions.addAlternativeStart(start: AlternativeStart)
window.modAPI.actions.addPlayerSprite(sprite: PlayerSprite)
```

- **`addMysticalRegionBlessing`** — Register a new blessing for mystical regions.
- **`addPuppetType`** — Register a new puppet type for the training ground.
- **`addAlternativeStart`** — Register an alternative game start. Players select from available starts when creating a new game. The `AlternativeStart` defines the opening event, starting location, starting items, and starting money.
- **`addPlayerSprite`** — Register a custom player sprite that appears in character creation alongside the defaults for the specified gender.

### Crafting System

```typescript
window.modAPI.actions.addRecipeToLibrary(item: RecipeItem)
window.modAPI.actions.addRecipeToResearch(baseItem: Item, recipe: RecipeItem)
window.modAPI.actions.addResearchableRecipe(baseItem: string, recipe: RecipeItem)
window.modAPI.actions.addUncutStone(realm: Realm, uncutStone: Item)
window.modAPI.actions.addHarmonyType(harmonyType: RecipeHarmonyType, config: HarmonyTypeConfig)
window.modAPI.actions.overrideItemTypeToHarmonyType(mapping: Partial<Record<ItemKind, RecipeHarmonyType>>)
```

### Global Flags

```typescript
window.modAPI.actions.setGlobalFlag(flag: string, value: number)
window.modAPI.actions.getGlobalFlags(): Record<string, number>
```

Global flags persist across all save files and are automatically injected into game flags. Use them for mod data that is not tied to a specific save (for example, high scores or global unlock states).

```typescript
window.modAPI.actions.setGlobalFlag('myMod_highScore', 42);
const flags = window.modAPI.actions.getGlobalFlags();
const highScore = flags['myMod_highScore'] ?? 0;
```

**Flag conventions:**
- Use dot-notation with your mod name as prefix to avoid collisions: `'myMod.enabled'`, `'myMod.difficulty'`
- Store booleans as `0` / `1` and normalize any legacy values on startup
- Initialize expected flags to defaults on mod load rather than assuming they exist
- When renaming flags between versions, migrate old values to the new keys so existing users retain their settings

### Keybinding Registration

Register custom keyboard shortcuts that players can rebind in the game settings Controls tab:

```typescript
window.modAPI.actions.registerKeybinding(definition: KeybindingDefinition)
```

- **`definition.action`** — Unique action name (e.g. `'myMod.specialAction'`)
- **`definition.category`** — Display category for grouping in the controls UI (e.g. `'general'`, `'combat'`)
- **`definition.displayName`** — Human-readable name shown in the controls UI
- **`definition.description`** — Tooltip description
- **`definition.defaultKey`** — Default key binding (e.g. `'F'`, `'Shift+KeyG'`)
- **`definition.allowRebind`** — Whether players can rebind this key

```typescript
window.modAPI.actions.registerKeybinding({
  action: 'myMod.specialAction',
  category: 'general',
  displayName: 'Special Action',
  description: 'Performs a special action',
  defaultKey: 'F',
  allowRebind: true,
});
```

Registered keybindings appear in the Controls settings UI under a "Mods" section. Call `registerKeybinding` during mod initialization. Keybindings are permanent for the session once registered.

### Mod Settings UI

```typescript
window.modAPI.actions.registerOptionsUI(component: ModOptionsFC)
```

Register a React settings component for your mod in the game's mod-loading dialog. This is the preferred home for cross-save configuration such as toggles, sliders, and mode selectors.

Global flags are numeric, so store booleans as `0` / `1` and normalize any legacy values yourself.

**JSX example** (if your build pipeline supports JSX):

```typescript
const MyModOptions: ModOptionsFC = ({ api }) => {
  const flags = api.actions.getGlobalFlags();
  const enabled = (flags['myMod.enabled'] ?? 1) === 1;
  const GameButton = api.components.GameButton ?? 'button';

  return (
    <GameButton
      onClick={() => api.actions.setGlobalFlag('myMod.enabled', enabled ? 0 : 1)}
    >
      {enabled ? 'Disable Mod' : 'Enable Mod'}
    </GameButton>
  );
};

window.modAPI.actions.registerOptionsUI(MyModOptions);
```

**createElement alternative** (works regardless of build setup):

If JSX is not available in your options panel context, use `window.React.createElement` directly. Both approaches produce the same result:

```typescript
const MyModOptions: ModOptionsFC = ({ api }) => {
  const ReactRuntime = window.React;
  if (!ReactRuntime?.createElement) return null;

  const createElement = ReactRuntime.createElement.bind(ReactRuntime);
  const flags = api.actions.getGlobalFlags();
  const enabled = (flags['myMod.enabled'] ?? 1) === 1;
  const GameButton = api.components.GameButton ?? 'button';

  return createElement(
    GameButton,
    { onClick: () => api.actions.setGlobalFlag('myMod.enabled', enabled ? 0 : 1) },
    enabled ? 'Disable Mod' : 'Enable Mod',
  );
};

window.modAPI?.actions?.registerOptionsUI?.(MyModOptions);
```

### Audio

```typescript
window.modAPI.actions.addMusic(name: string, path: string[])
window.modAPI.actions.addSfx(name: string, path: string)
```

Note: When adding audio files the compiler will not know they exist at first, so you will get errors when trying to use the new names you added. To get around that, you will need to cast it to the expected type `'my_music' as MusicName` manually. This is essentially just saying to the compiler, 'trust me, this exists'.

## Mod Hooks

Intercept and modify game behavior at specific points through `window.modAPI.hooks`:

### Player Combat Hooks

#### `onCreatePlayerCombatEntity`

Modify the player's combat entity after it is created but before combat begins.

```typescript
window.modAPI.hooks.onCreatePlayerCombatEntity((player, combatEntity, breakthrough, flags) => {
  if (flags.enhanced_powers) {
    combatEntity.stats.power *= 1.2;
  }
  return combatEntity;
});
```

- **`player`** — The `PlayerEntity` from the Redux store
- **`combatEntity`** — The newly created `CombatEntity` for the player
- **`breakthrough`** — The current `BreakthroughState` (realm and progress)
- **`flags`** — Current game flags

#### `onCreatePlayerCraftingEntity`

Modify the player's crafting entity after it is created.

```typescript
window.modAPI.hooks.onCreatePlayerCraftingEntity((player, craftingEntity, breakthrough, characters, flags) => {
  if (flags.master_craftsman) {
    craftingEntity.stats.control *= 1.2;
  }
  return craftingEntity;
});
```

- **`player`** — The `PlayerEntity`
- **`craftingEntity`** — The newly created `CraftingEntity` for the player
- **`breakthrough`** — The current `BreakthroughState`
- **`characters`** — The `CharactersState` from Redux (may be undefined)
- **`flags`** — Current game flags

### Crafting Hooks

#### `onBeforeCraft`

Modify the recipe or recipe stats before crafting begins. Also allows modifying the player crafting entity.

```typescript
window.modAPI.hooks.onBeforeCraft((player, recipe, recipeStats, flags) => {
  if (flags.sharp_tools && recipeStats.difficulty > 100) {
    return { recipeStats: { ...recipeStats, difficulty: recipeStats.difficulty * 0.9 } };
  }
  return undefined;
});
```

- **`player`** — The current `CraftingEntity`
- **`recipe`** — The `RecipeItem` being crafted
- **`recipeStats`** — The calculated `CraftingRecipeStats` (completion, perfection, stability thresholds)
- **`flags`** — Current game flags

Return `{ recipe?: RecipeItem; recipeStats?: CraftingRecipeStats; player?: CraftingEntity }` to modify any of these, or `undefined` to leave them unchanged.

#### `onDeriveRecipeDifficulty`

Modify the difficulty and stats of crafting recipes during the crafting process.

```typescript
window.modAPI.hooks.onDeriveRecipeDifficulty((recipe, recipeStats, flags) => {
  if (flags.unlockedUltimateCauldron === 1) {
    recipeStats.completion *= 0.8;
    recipeStats.perfection *= 0.8;
  }
  return recipeStats;
});
```

### Combat Hooks

#### `onCreateEnemyCombatEntity`

Modify enemy stats after the combat entity is created.

```typescript
window.modAPI.hooks.onCreateEnemyCombatEntity((enemy, combatEntity, flags) => {
  if (flags.hard_mode) {
    combatEntity.stats.hp *= 1.5;
    combatEntity.stats.power *= 1.2;
  }
  return combatEntity;
});
```

#### `onBeforeCombat`

Modify the enemy list and player state before combat starts. Return modified copies, mutations to the originals are not used.

```typescript
window.modAPI.hooks.onBeforeCombat((enemies, playerState, flags) => {
  if (flags.hard_mode) {
    const scaled = enemies.map(e => ({ ...e, stats: { ...e.stats, hp: e.stats.hp * 2 } }));
    return { enemies: scaled, playerState };
  }
  return { enemies, playerState };
});
```

#### `onCalculateDamage`

Modify damage after all base reductions are applied.

```typescript
window.modAPI.hooks.onCalculateDamage((attacker, defender, damage, damageType, flags) => {
  if (flags.iron_body && defender.entityType === 'Player') {
    return Math.floor(damage * 0.8);
  }
  return damage;
});
```

### Completion Hooks

These fire after specific activities complete and can inject additional event steps:

#### `onCompleteCombat`

```typescript
window.modAPI.hooks.onCompleteCombat((eventStep, victory, playerState, enemies, droppedItems, flags) => {
  const events: EventStep[] = [];
  if (!victory && eventStep.kind === 'combat' && !eventStep.isSpar) {
    events.push({ kind: 'text', text: 'You fall, vision narrowing to black.' });
    events.push({ kind: 'changeSocialStat', stat: 'lifespan', amount: '-lifespan' });
  }
  return events;
});
```

#### `onCompleteTournament`

```typescript
window.modAPI.hooks.onCompleteTournament((eventStep, tournamentState, flags) => {
  const events: EventStep[] = [];
  if (tournamentState === 'victory' && !flags.firstTournamentVictory) {
    events.push({ kind: 'unlockLocation', location: 'Champion Training Grounds' });
  }
  return events;
});
```

#### `onCompleteDualCultivation`, `onCompleteCrafting`, `onCompleteAuction`, `onCompleteStoneCutting`

Analogous to `onCompleteCombat`. Each receives the relevant event step, outcome data, and flags, and returns additional `EventStep[]` to inject.

### Event Hooks

#### `onEventDropItem`

Intercept items granted by `addItem`, `addMultipleItem`, or `dropItem` event steps. Return a modified `ItemDesc` to change the item or suppress it entirely (return `stacks <= 0`).

```typescript
window.modAPI.hooks.onEventDropItem((item, step, flags) => {
  if (flags.item_bonus && item.name === 'Iron Ore') {
    return { ...item, stacks: (item.stacks ?? 1) * 2 };
  }
  return item;
});
```

### Exploration Hooks

#### `onGenerateExploreEvents`

Modify the pool of exploration events before one is selected. Fires after base-game eligibility filtering.

```typescript
window.modAPI.hooks.onGenerateExploreEvents((locationId, events, flags) => {
  if (flags.lucky_mode) {
    return [...events, myBonusEvent];
  }
  return events;
});
```

### Location Hooks

#### `onLocationEnter`

Fires when the player enters a new location. Observation only, no return value.

```typescript
window.modAPI.hooks.onLocationEnter((locationId, flags) => {
  console.log('Entered:', locationId);
});
```

### Loot Hooks

#### `onLootDrop`

Fires when combat loot is distributed. Observation only.

```typescript
window.modAPI.hooks.onLootDrop((items, flags) => {
  items.forEach(item => console.log('Loot:', item.name));
});
```

### Time Hooks

#### `onAdvanceDay` / `onAdvanceMonth`

Fire on time progression. Observation only.

```typescript
window.modAPI.hooks.onAdvanceDay((days, flags) => {
  console.log('Days passed:', days);
});

window.modAPI.hooks.onAdvanceMonth((month, year, flags) => {
  if (month === 3) {
    window.modAPI.actions.startEvent(mySpringFestival);
  }
});
```

### Redux Hooks

#### `onReduxAction`

Fires after every Redux action. Runs inside the reducer, keep it fast, deterministic, and side-effect free. Return a modified `stateAfter` to override what is stored.

```typescript
window.modAPI.hooks.onReduxAction((actionType, stateBefore, stateAfter, payload) => {
  if (actionType === 'inventory/addItem' && stateAfter.gameData.flags?.hard_mode) {
    return { ...stateAfter, inventory: doubleInventory(stateAfter.inventory) };
  }
  return stateAfter;
});
```

#### `onReduxActionPayload`

Fires before the reducer runs. Allows modifying or dropping an action. Return `null` to drop the action entirely.

```typescript
window.modAPI.hooks.onReduxActionPayload((actionType, payload) => {
  if (actionType === 'inventory/removeItem') {
    const p = payload as { name: string; stacks: number };
    if (window.modAPI.gameData.items[p.name]?.kind === 'blueprint') {
      return null; // prevent blueprint removal
    }
  }
  return payload;
});
```

## Utility Functions

Helper functions through `window.modAPI.utils`:

### State Access

```typescript
window.modAPI.subscribe(callback: () => void): () => void
window.modAPI.getGameStateSnapshot(): RootState | null
window.modAPI.utils.determineCurrentScreen(rootState: RootState): ScreenType
```

- **`subscribe`** — Subscribe to any Redux state change. The callback is called after every dispatched action. Returns an unsubscribe function. Prefer this over direct store access.
- **`getGameStateSnapshot`** — Returns a read-only snapshot of the complete game state, or `null` if no save is loaded.
- **`determineCurrentScreen`** — Determines the current screen type from the Redux root state. Useful in custom screens or hooks to branch behavior based on where the player is.

```typescript
// Rate-limited reactive updates
let lastUpdate = 0;
window.modAPI.subscribe(() => {
  const now = Date.now();
  if (now - lastUpdate < 250) return;
  lastUpdate = now;
  const snap = window.modAPI.getGameStateSnapshot();
  if (snap) refreshMyPanel(snap);
});

// Determine current screen
const screen = window.modAPI.utils.determineCurrentScreen(store.getState());
```

### Enemy Modifiers

```typescript
window.modAPI.utils.alpha(enemy: EnemyEntity) // Elite version
window.modAPI.utils.alphaPlus(enemy: EnemyEntity) // Enhanced elite
window.modAPI.utils.realmbreaker(enemy: EnemyEntity) // Multiple realmbreaker variants
window.modAPI.utils.corrupted(enemy: EnemyEntity) // Corrupted version
```

### Enemy Scaling

```typescript
window.modAPI.utils.scaleEnemy(base: EnemyEntity, realm: Realm, realmProgress: RealmProgress)
window.modAPI.utils.calculateEnemyHp(enemy: EnemyEntity)
window.modAPI.utils.calculateEnemyPower(enemy: EnemyEntity)
```

Use these when creating enemies that need to appear at multiple realm tiers:

```typescript
const scaledBandit = window.modAPI.utils.scaleEnemy(baseBandit, 'coreFormation', 'Middle');
```

### Quest Creation

```typescript
window.modAPI.utils.createCombatEvent(enemy: LocationEnemy)
window.modAPI.utils.createCullingMission(monster, location, description, favour)
window.modAPI.utils.createCollectionMission(item, location, description, favour)
window.modAPI.utils.createDeliveryMission(items, count, location, description, preDeliverySteps, postDeliverySteps, favour)
window.modAPI.utils.createHuntQuest(monster, location, description, encounter, spiritStones, reputation, reputationName, maxReputation, characterEncounter?)
window.modAPI.utils.createPackQuest(monster, location, description, encounter, spiritStones, reputation, reputationName, maxReputation)
window.modAPI.utils.createDeliveryQuest(location, description, predelivery, item, amount, postdelivery, spiritStones, reputation, reputationName, maxReputation)
window.modAPI.utils.createFetchQuest(title, description, srcLocation, srcHint, srcSteps, dstLocation, dstHint, dstSteps, spiritStones, reputation, reputationName, maxReputation)
window.modAPI.utils.createCraftingMission(recipe, cost, location, appraiser, description, introSteps, sublimeSteps, perfectSteps, basicSteps, failureSteps, favour)
```

- **`createDeliveryMission`** — Simple delivery quest (favour reward only).
- **`createPackQuest`** — Hunt quest targeting a group of the same monster type.
- **`createDeliveryQuest`** — Full delivery quest with spirit stone and reputation rewards.
- **`createFetchQuest`** — Two-location fetch quest with source and destination events.
- **`createCraftingMission`** — Crafting hall commission with separate outcome steps for each quality tier (sublime, perfect, basic, failure).

### Balance Calculations

```typescript
window.modAPI.utils.getExpectedHealth(realm: Realm, progress: RealmProgress)
window.modAPI.utils.getExpectedPower(realm: Realm, progress: RealmProgress)
window.modAPI.utils.getExpectedDefense(realm: Realm, progress: RealmProgress)
window.modAPI.utils.getExpectedBarrier(realm: Realm, progress: RealmProgress)
window.modAPI.utils.getExpectedToxicity(realm: Realm, progress: RealmProgress)
window.modAPI.utils.getExpectedPool(realm: Realm, progress: RealmProgress)
window.modAPI.utils.getExpectedIntensity(realm: Realm, progress: RealmProgress)
window.modAPI.utils.getExpectedControl(realm: Realm, progress: RealmProgress)
window.modAPI.utils.getExpectedPlayerPower(realm: Realm, progress: RealmProgress)
window.modAPI.utils.getExpectedArtefactPower(realm: Realm, progress: RealmProgress)
window.modAPI.utils.getRealmQi(realm: Realm, realmProgress: RealmProgress)
window.modAPI.utils.getBreakthroughQi(realm: Realm, realmProgress: RealmProgress)
window.modAPI.utils.getNumericReward(base: number, realm: Realm, progress: RealmProgress)
window.modAPI.utils.getPillRealmMultiplier(realm: Realm)
window.modAPI.utils.getCraftingEquipmentStats(realm: Realm, realmProgress: RealmProgress, factors: { pool: number; control: number; intensity: number }, type: 'cauldron' | 'flame')
```

- **`getExpectedBarrier`** — Expected max barrier for a player in the given realm.
- **`getExpectedToxicity`** — Expected toxicity resistance.
- **`getExpectedPool`** — Expected crafting qi pool size.
- **`getExpectedIntensity`** — Expected crafting intensity.
- **`getExpectedControl`** — Expected crafting control.
- **`getExpectedArtefactPower`** — Expected artefact power stat.
- **`getBreakthroughQi`** — Qi cost for a breakthrough at the given realm and progress.
- **`getPillRealmMultiplier`** — Multiplier applied to pill effectiveness based on realm. Use when computing flat consumable values.

### Equipment Calculations

```typescript
window.modAPI.utils.getClothingDefense(realm: Realm, scale: number)
window.modAPI.utils.getClothingCharisma(realm: Realm, mult: number)
window.modAPI.utils.getBreakthroughCharisma(realm: Realm, mult: number)
```

### Event Helpers

```typescript
window.modAPI.utils.createQuestionAnswerList(key: string, questions: QuestionAnswer[], exit: QuestionAnswer, showExitOnAllComplete?: boolean)
window.modAPI.utils.flag(flag: string) // Convert flag name to game flag format
window.modAPI.utils.evalExp(exp: string, flags: Record<string, number>) // Evaluate an expression using the given flags, then floor it if the number is greater than 3
window.modAPI.utils.evalExpNoFloor(exp: string, flags: Record<string, number>) // The above but without the floor
window.modAPI.utils.evaluateScaling(scaling: Scaling, variables: Record<string, number>, stanceLength: number, preMaxTransform?: (value: number) => number)
window.modAPI.utils.generateSkipTutorialFlags(tutorials: Tutorial[], triggers: TriggeredEvent[])
```

- **`evaluateScaling`** — Evaluate a `Scaling` object against a variables map. Applies base value, stat multipliers, equations, custom scaling, and max constraints. Useful when computing item or technique values in code.
- **`generateSkipTutorialFlags`** — Generate the flags needed to skip tutorials for an alternative start. For each tutorial, sets `{name}`, `{name}Started`, `{name}Completed`; for each trigger, sets `{name}` and `{name}Started`.

### Tooltip Utilities

Format and expand tooltip strings using the game's tooltip system:

```typescript
window.modAPI.utils.parseTooltipLine(tooltip: string): React.ReactNode
window.modAPI.utils.expandTooltipTemplate(template: string, templateValues: Map<string, string>, addPeriod?: boolean): string
window.modAPI.utils.expandTooltipTags(template: string): string
```

- **`parseTooltipLine`** — Parse a tooltip string and return a React node with styled formatting. Handles colour tags, element tags, buff/item references, and numbers.
- **`expandTooltipTemplate`** — Expand a template string by replacing `{{key}}` placeholders with values from the map. Optionally appends a period.
- **`expandTooltipTags`** — Expand `<tag>` syntax in a template string to their display equivalents.

These utilities use the same formatting system as the game's built-in tooltips, ensuring consistent styling when you render custom tooltips in mod UI.

```typescript
// Styled tooltip output for a custom buff display
const tooltipNode = window.modAPI.utils.parseTooltipLine('Applies [[blood corruption]] to target for 3 turns');

// Expand template with dynamic values
const expanded = window.modAPI.utils.expandTooltipTemplate(
  'Power scales with {{stat}} (base {{base}})',
  new Map([['stat', 'Control'], ['base', '50']]),
  true,
);
```

### Text Formatting

These helpers produce styled HTML strings for use in event text steps:

```typescript
window.modAPI.utils.col(text: string | number, col: string) // Color any text with a CSS color
window.modAPI.utils.loc(text: string | number) // Purple, location names
window.modAPI.utils.rlm(realm: Realm, progress?: RealmProgress) // Styled realm name
window.modAPI.utils.num(number: string | number) // Styled number
window.modAPI.utils.buf(buff: string) // Pink, buff names
window.modAPI.utils.itm(item: string) // Pink, item names
window.modAPI.utils.char(text: string | number) // Green, character names
window.modAPI.utils.elem(element: TechniqueElement) // Styled technique element
```

Use these inside event `text` fields to produce consistent in-game styling:

```typescript
{
  kind: 'text',
  text: `You travel to ${window.modAPI.utils.loc('Iron Peak Sect')} and meet ${window.modAPI.utils.char('Elder Zhang')}, who offers you ${window.modAPI.utils.itm('Spirit Core (III)')}.`
}
```

### Crafting Utilities

```typescript
window.modAPI.utils.previewCraftingTechnique(technique: CraftingTechnique, state: CraftingState): CraftingState
```

Preview the outcome of a crafting technique given the current crafting state. Returns the predicted `CraftingState` with `progressState.completion` and other metrics.

```typescript
const craftingState = api.useSelector(state => state.crafting);
const technique = api.craftingTechniqueFromKnown(knownTechnique);
const preview = window.modAPI.utils.previewCraftingTechnique(technique, craftingState);
console.log('Completion after:', preview.progressState?.completion);
```

## Components

The `ModReduxAPI.components` object provides pre-styled UI components for use in mod screens, injected UI, and options panels:

```typescript
const { GameDialog, GameButton, GameIconButton, BackgroundImage, PlayerComponent, GameTooltip, GameTooltipBox, TooltipLine } = api.components;
```

### `GameDialog`

Main content container with built-in title and close button:

```typescript
<GameDialog
  title="Dialog Title"
  onClose={() => actions.setScreen('location')}  // Omit to disable close button
  removePad={false}
  showBackdrop={true}
  width="md"  // 'sm' | 'md' | 'lg'
>
  Your content here
</GameDialog>
```

### `GameButton`

Styled button matching the game theme:

```typescript
<GameButton
  onClick={() => handleClick()}
  disabled={false}
  keybinding={"Enter"}  // Keybinding that triggers click when pressed
  keyPriority={1}
  fancyBorder={false}  // When true, shows animated border like the combat fight button
>
  Button Text
</GameButton>
```

### `GameIconButton`

Button with an icon (expects an MUI icon component):

```typescript
<GameIconButton onClick={() => handleClick()}>
  <CloseIcon />
</GameIconButton>
```

### `BackgroundImage`

Screen background with optional particle effects:

```typescript
<BackgroundImage
  image="path/to/background.png"
  screenEffect="dust"  // 'dust', 'snow', 'rain', etc.
/>
```

### `PlayerComponent`

Shows the player character. Always include in location/event screens unless you custom-render the character elsewhere:

```typescript
<PlayerComponent />
```

### `GameTooltip`, `GameTooltipBox`, `TooltipLine`

Styled tooltip components matching the game's tooltip system. Use these to display formatted buff, item, or technique information in mod UI:

```typescript
<GameTooltip>
  <GameTooltipBox title="My Buff">
    <TooltipLine left="Effect" right="Deal 50 damage" />
    <TooltipLine left="Duration" right="3 turns" />
  </GameTooltipBox>
</GameTooltip>
```

`TooltipLine` accepts `left` (label) and `right` (value) strings. `parseTooltipLine` in `utils` can format raw tooltip strings with colour tags, element tags, buff/item references, and numbers into styled `ReactNode` output suitable for use in these components.

## Examples

### Adding a Custom Item

```typescript
const myTreasure: TreasureItem = {
  kind: 'treasure',
  name: 'The Best Treasure',
  description: 'Wooo mod content.',
  icon: icon,
  stacks: 1,
  rarity: 'mundane',
  realm: 'coreFormation',
};

window.modAPI.actions.addItem(myTreasure);
```

For docs on the more advanced features of the Mod API, then see the **[Advanced Mods](../advanced-mods/)** page.

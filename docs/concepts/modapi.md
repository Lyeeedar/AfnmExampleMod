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

The ModAPI is available globally as `window.modAPI` with five main sections:

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
  components: ModReduxAPI['components'];
}
```

The `components` field exposes the same pre-styled React components available through `api.components` inside mod screens (GameDialog, GameButton, GameIconButton, BackgroundImage, PlayerComponent, ItemComponent, GameTooltip, GameTooltipBox, TooltipLine, every tooltip variant under `tooltips`, and every recipe component under `recipes`). Unlike `api.components`, which is only available inside a mod screen's render function, `window.modAPI.components` is accessible from **any** mod code, including helper functions, exported mod scripts, and options UI. The shape is identical: `window.modAPI.components.GameButton` works the same as `api.components.GameButton` inside a screen.

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
- **`mineConfigs`** - `Record<string, MineConfig>` - Full mine configuration registry. Each entry exposes `chambers`, `pathingMonsters`, `depthStrata`, sickness buff, combat flavour text, music, and ambience for any registered mine. The key is the stable mine id string (e.g. `'yinying'`, `'yuMai'`).
- **`uncutStones`** - `Record<Realm, UncutStonePool | undefined>` - Uncut stone pools by realm

### Specialized Collections

- **`backgrounds`** - Character backgrounds by life stage:
  - `birth: Background[]`
  - `child: Background[]`
  - `teen: Background[]`
- **`craftingTechniques`** - `Record<string, CraftingTechnique>` - All crafting techniques
- **`techniqueBuffs`** - School-specific technique buffs:
  - `blood`, `blossom`, `celestial`, `cloud`, `fist`, `weapon`
- **`buffs`** - `Record<string, Buff>` - A flat registry of every combat `Buff` in the game, keyed by buff name, regardless of where it is defined. Buffs are gathered from combat techniques, items (corruption debuffs, pill effects, clothing/talisman/artefact/formation buffs), monster definitions, enchantments, and more. This is the general counterpart to `techniqueBuffs` (which only exposes a hand-picked set of the main school buffs): it lists buffs the same way `techniques` lists techniques. When two buffs share a name the first one wins. Read this to look up any buff definition at runtime:

  ```typescript
  const rot = window.modAPI.gameData.buffs['Rot'];
  const stackingBuffs = Object.values(window.modAPI.gameData.buffs).filter((b) => b.canStack);
  ```

- **`guilds`** - `Record<string, Guild>` - All guilds
- **`enchantments`** - `Enchantment[]` - All equipment enchantments
- **`fallenStars`** - `FallenStar[]` - All fallen star events
- **`rooms`** - `Room[]` - All house rooms
- **`mysticalRegionBlessings`** - `Blessing[]` - All mystical region blessings
- **`expeditionTiles`** - `Record<string, ExpeditionTiles[]>` - Registry of expedition tile pools keyed by expedition name. Each entry exposes every tile definition the expedition may spawn from, including universal tiles (entrance, exit, extract, rest) and any combat, treasure, boss, buff, debuff, challenge, or boonBane tiles that have been added to the pool. Read this to inspect an expedition's contents and use `addExpeditionTiles` to extend or replace the tile list.
- **`mysticalRegionDefinitions`** - `Record<string, MysticalRegionDefinition>` - Registry of moddable mystical region definitions keyed by `definition.id`. Add a new entry with `actions.addMysticalRegionDefinition`, then point a `MysticalKeyItem`'s `overrideRegion` field at the id to redirect that key into the new region without redefining the key.
- **`dualCultivationTechniques`** - `IntimateTechnique[]` - All dual cultivation techniques
- **`monsters`** - `EnemyEntity[]` - All registered enemy entities
- **`soulShardDelves`** - `Record<string, SoulShardDelveConfig>` - All soul shard delve configurations keyed by delve key. Each entry exposes the delve's monster pools (mob / elite / boss), boss room, threshold events, intensity rewards, and recharge rate. See `addSoulShardDelve` for the registration action.
- **`puppets`** - `PuppetType[]` - All training ground puppet types
- **`alternativeStarts`** - `AlternativeStart[]` - All alternative game starts (first entry is always the default)
- **`researchableMap`** - `Record<string, RecipeItem[]>` - Maps base item keys to researchable recipes
- **`recipeConditionEffects`** - `RecipeConditionEffect[]` - All crafting condition effects
- **`harmonyConfigs`** - `Record<RecipeHarmonyType, HarmonyTypeConfig>` - Harmony type configurations
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
window.modAPI.actions.startEvent(event: GameEvent): boolean
window.modAPI.actions.startCombat(enemies: EnemyEntity[], playerBuffs: Buff[], locationBackgroundOverride?: { backgroundImage: string, screenEffect: ScreenEffectType }): void
```

#### `registerRootLocation`

Mark an existing location as a discovery root. Root locations are entry points for the map discovery system, all locations reachable from a root are discovered when its condition is met. Use this for secret areas or alternative starting points that are not connected to the main map.

```typescript
// Always-active root
window.modAPI.actions.registerRootLocation('Hidden Valley', '1');

// Unlocks after a flag is set
window.modAPI.actions.registerRootLocation('Ancient Ruins', 'foundAncientMap == 1');
```

#### `startEvent`

Start a game event programmatically at runtime. Returns `true` if the event started, or `false` if an event was already active.

**Important:** If an event is already in progress, `startEvent` silently returns `false` — it will not interrupt or overwrite the running event. Use the return value to guard side-effects (such as quest consumption or item removal) that should only happen when the event actually begins.

```typescript
window.modAPI.actions.startEvent({
  location: 'Liang Tiao Village',
  steps: [{ kind: 'text', text: 'A stranger approaches you.' }],
});
```

```typescript
// Always check the return value when your mod's logic depends on the event firing
const started = window.modAPI.actions.startEvent(myEvent);
if (started) {
  // Quest consumed here — safe, because the event actually started
  dispatch(removeQuest('myQuest'));
} else {
  // Event was blocked — do not consume quest items, flags, etc.
}
```

#### `startCombat`

Initiate a combat encounter programmatically:

```typescript
// Basic combat
window.modAPI.actions.startCombat([ratascar], []);

// Combat with player buffs and custom background
window.modAPI.actions.startCombat(
  [bossEnemy],
  [strengthBuff],
  { backgroundImage: 'boss_arena.png', screenEffect: 'mist' },
);
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
      <GameDialog id="my-screen" title="My Screen" onClose={() => actions.setScreen('location')}>
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
window.modAPI.injectUI(slotName: string, generator: (api: ModReduxAPI, inject: InjectHelper) => void)
```

**Slot names:**
- For dialogs: the dialog's DOM **id** (e.g. `'combat-victory'`). Open the game in dev mode and inspect the element to find the id for the dialog you want to target.
- For full screens: the `ScreenType` value (e.g. `'combat'`, `'location'`, `'crafting'`, `'jadeCutting'`). You can also target specific sub-slots within screens (e.g. `'combat-topBarPlayerInfo'`, `'crafting-craftingScreen'`, `'stoneCutting-jadeCuttingScreen'`).

**The `inject` helper:**

```typescript
inject(selector: string | HTMLElement, content: ReactNode, placement?: InjectPlacement)
```

- **`selector`** — CSS selector scoped to the target slot, or an `HTMLElement`
- **`content`** — React node to render
- **`placement`** — Where to place content. For selector targets, `'after'` is the default. Other supported placements include `'before'`, `'appendChild'`, `'prependChild'`, `'overlay'`, replacement, and wrapping placements.

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

For a full list of available slots on each screen, see the screen-specific slot names added to combat, crafting, and jade cutting screens. Use dev tools to inspect elements for the complete set of available injection points.

### Specialized Content

```typescript
window.modAPI.actions.addCrop(realm: Realm, crop: Crop)
window.modAPI.actions.addMineConfig(mineId: string, config: MineConfig)
window.modAPI.actions.addMineChamber(mineId: string, realm: Realm, progress: RealmProgress, chamber: MineChamber)
window.modAPI.actions.addGuild(guild: Guild)
window.modAPI.actions.addDualCultivationTechnique(technique: IntimateTechnique)
window.modAPI.actions.addEnchantment(enchantment: Enchantment)
window.modAPI.actions.addFallenStar(fallenStar: FallenStar)
window.modAPI.actions.addRoom(room: Room)
window.modAPI.actions.addMysticalRegionBlessing(blessing: Blessing)
window.modAPI.actions.addExpeditionTiles(expeditionName: string, tiles: ExpeditionTiles[])
window.modAPI.actions.addMysticalRegionDefinition(definition: MysticalRegionDefinition)
window.modAPI.actions.addPuppetType(puppet: PuppetType)
window.modAPI.actions.addAlternativeStart(start: AlternativeStart)
window.modAPI.actions.addSoulShardDelve(delve: SoulShardDelveConfig)
window.modAPI.actions.addPlayerSprite(sprite: PlayerSprite)
```

- **`addMysticalRegionBlessing`** — Register a new blessing for mystical regions.
- **`addExpeditionTiles`** — Register tile definitions for an expedition so they can appear when the expedition is generated. If the expedition already exists in `gameData.expeditionTiles`, the provided tiles are appended to its existing tile pool. If the expedition name is new, a fresh pool is created and registered so subsequent generation calls can spawn tiles from it. Combine with a matching `addLocation` (or an existing expedition location) that uses an `expedition` building with `name: <expeditionName>` to expose the new expedition to players.
- **`addMysticalRegionDefinition`** — Register a new moddable mystical region definition. Point a `MysticalKeyItem`'s `overrideRegion` field at the definition's `id` to redirect that key into the new region. Any field left undefined falls back to the key's own overrides (or realm defaults). The `eventSteps` map lets you inject event sequences at any combination of progress stages; when set for a stage, an event portal is shown before the default step and clicking it dispatches the supplied steps as a normal event.
- **`addPuppetType`** — Register a new puppet type for the training ground.
- **`addAlternativeStart`** — Register an alternative game start. Players select from available starts when creating a new game. The `AlternativeStart` defines the opening event, starting location, starting items, and starting money.
- **`addSoulShardDelve`** — Register a new soul shard delve. Delves are randomised combat dungeons themed around a single memory shard. Each config supplies the mob / elite / boss monster pools, the boss room, threshold events, and intensity rewards earned as the delve progresses.
- **`addPlayerSprite`** — Register a custom player sprite that appears in character creation alongside the defaults for the specified gender.

```typescript
interface PlayerSprite {
  id: string;
  name: string;
  gender: Sex | 'both';
  sprites: PlayerSpriteImages;
}

interface PlayerSpriteImages {
  base: string;
  aggressive: string;
  defensive: string;
  hit: string;
  offensive: string;
  support: string;
  utility: string;
  craftingSupport?: string;
  craftingStabilize?: string;
  craftingRefine?: string;
  craftingFusion?: string;
}
```

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
### Save Data

Mod-specific data that persists with the save file:

```typescript
window.modAPI.actions.setModData(modName: string, key: string, data: unknown)
window.modAPI.actions.removeModData(modName: string, key: string)
```

Save-paired data lives in the Redux store alongside the save file. Unlike global flags, save-paired data is tied to a specific save and is not shared across saves.

```typescript
// Store custom per-save data
window.modAPI.actions.setModData('myMod', 'customNPC_affinity', { npcId: 'elder_li', value: 75 });

// Read it back via useSelector
const npcAffinity = useSelector((state) => state.modData('myMod')?.customNPC_affinity);

// Remove a key when no longer needed
window.modAPI.actions.removeModData('myMod', 'customNPC_affinity');
```

- **`setModData`** — Store any JSON-serializable data namespaced under your mod name. Persists with the save file. Use for quest state, NPC relationships, discovered secrets, or any other per-save data.
- **`removeModData`** — Remove a specific key from your mod's save-paired data thereafter.

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


### Game Settings

Access the player's current game settings at runtime via `useGameSettings`:

```typescript
window.modAPI.utils.useGameSettings(): GameSettingsProps;
```

Returns the full `GameSettingsProps` object containing all player preferences. Reading these values in your mod lets you adjust behaviour to match the player's chosen settings.

**`GameSettingsProps` fields:**

| Field | Type | Description |
|-------|------|-------------|
| `enableStancePreview` | `boolean` | Show stance preview on technique hover |
| `removeCombatNumbers` | `boolean` | Hide floating damage/heal numbers |
| `fastRewardAnimations` | `boolean` | Speed up reward popup animations |
| `showCraftingRawNumbers` | `boolean` | Show exact crafting stat values |
| `skipSeenDialogue` | `boolean` | Skip dialogue the player has already seen |
| `skipDialogueMode` | `'flash' | 'instant' | 'none'` | How to skip seen dialogue |
| `hideEmptySlotWarnings` | `boolean` | Suppress empty equipment slot warnings |
| `pauseAutoBattleOnLowHealth` | `boolean` | Pause auto-battle when below threshold |
| `sexuality` | `string` | Player's configured sexuality setting |
| `eventHistoryLimit` | `number` | Max dialogue history entries to keep |
| `tooltipLockTimeMs` | `number` | Mouse-lock duration for tooltips (ms) |
| `combatZoom` | `number` | Combat viewport scale (0.5 to 1.5, default 1.0) |

**Example:**

```typescript
const settings = window.modAPI.utils.useGameSettings();
if (settings.combatZoom < 1.0) {
  // Player prefers a zoomed-out combat view
  myModEffect.intensity *= settings.combatZoom;
}
```

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

#### `onModifyRecipeIngredients`

Modify recipe ingredients before they are used in the crafting process. Fires before `onDeriveRecipeDifficulty` and `onBeforeCraft`.

```typescript
window.modAPI.hooks.onModifyRecipeIngredients((recipe, flags) => {
  if (flags.efficient_crafting) {
    const modified = { ...recipe };
    modified.ingredients = recipe.ingredients.map(ing => ({
      ...ing,
      count: Math.max(1, Math.floor(ing.count * 0.5)),
    }));
    return modified;
  }
  return recipe;
});
```

- **`recipe`** — The `RecipeItem` whose ingredients to modify
- **`flags`** — Current game flags

Return a modified `RecipeItem` to change the ingredients, or the original `recipe` to leave it unchanged.

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

### Lifecycle Hooks

#### `onNewGame`

Fires when a new game is started, before any data is loaded. Use to set up initial mod state, global flags, or start events for a new playthrough.

```typescript
window.modAPI.hooks.onNewGame((intent: NewGameIntent) => {
  // Initialize global flags for new game
  window.modAPI.actions.setGlobalFlag('myMod.initialized', 1);
  // Start a custom intro event
  window.modAPI.actions.startEvent(myIntroEvent);
});
```

- **`intent`** — `NewGameIntent` containing `characterName`, `characterType`, `background`, `alternativeStart`, `difficulty`, `mods`, and `seed`. Use this to branch mod setup based on the selected character configuration.

The `NewGameIntent` structure:

```typescript
interface NewGameIntent {
  characterName: string;
  characterType: 'npc' | 'normal';
  background?: Background;       // Selected background, or undefined for 'normal' character type
  alternativeStart?: AlternativeStart;  // Alternative start data if one was selected
  difficulty: string;
  mods: string[];
  seed: number;
}
```

#### `onGameLoad`

Fires after a saved game is fully loaded. Use to restore per-save mod state, validate global flags, or trigger post-load events.

```typescript
window.modAPI.hooks.onGameLoad((state: RootState) => {
  // Validate or migrate mod flags on load
  const flags = state.gameData.flags;
  if (flags.myMod_version === undefined) {
    window.modAPI.actions.setModData('myMod', 'needsMigration', true);
  }
});
```

- **`state`** — The complete `RootState` Redux snapshot of the loaded save, before the game begins rendering. Use `state.gameData.flags` for flag values, `state.player` for character data, and other slices as needed.

#### `onDeleteCharacter`

Fires when a character save is deleted from the Load page. Use to clean up per-character mod configuration.

```typescript
window.modAPI.hooks.onDeleteCharacter((saveInfo: Save) => {
  myModConfig.deleteCharacterConfig(saveInfo.dbName);
});
```

- **`saveInfo`** — A `Save` object containing metadata about the deleted save:

```typescript
interface Save {
  dbName: string;          // Unique database key
  playerName: string;      // Display name
  forename?: string;
  surname?: string;
  icon: string;
  realm: string;           // Realm name
  realmProgress: string;   // Realm progress name
  age: number;
  createdAt: number;        // Unix timestamp (ms)
  lastPlayed?: number;     // Unix timestamp (ms)
  playtime: number;        // Seconds played
  version: string;         // Game version at save time
  mods: string[];          // Mods active when save was created
  location?: string;       // Last location
  screen?: string;         // Last screen type
}
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

### Combat Step Hooks

These hooks fire around individual steps of the combat round queue (player technique, enemy technique, artefact, party member, buffs, end-of-round). They fire from `CombatScreen.tsx` and allow mods to inspect and modify the combat state mid-round, or cancel a step entirely.

#### `onCombatBeforeStep`

Fires before each step in the round queue. Return a modified `CurrentCombatState` to change combat state, a cancel object `{ cancel: true, logMessage: string }` to skip the step and log a message, or `null` to continue as normal.

```typescript
window.modAPI.hooks.onCombatBeforeStep((step, ctx) => {
  if (step.kind === 'player' && ctx.roundNum >= 5) {
    return { cancel: true, logMessage: 'You refuse to continue after 5 rounds.' };
  }
  return null;
});
```

- **`step`** -- The `RoundStep` being executed (`{ kind: 'player' }`, `{ kind: 'enemy' }`, `{ kind: 'playerArtefact', index: 0 }`, `{ kind: 'buffs' }`, `{ kind: 'end' }`, etc.)
- **`ctx`** -- The current `CurrentCombatState` snapshot at the point before the step executes

#### `onCombatAfterStep`

Fires after each step in the round queue completes. Return a modified `CurrentCombatState` to change what gets stored, or `null` to keep the default.

```typescript
window.modAPI.hooks.onCombatAfterStep((step, ctx) => {
  if (step.kind === 'enemy' && ctx.playerState && ctx.playerState.stats.hp <= 0) {
    // Custom death handling
    return { ...ctx, combatState: 'defeat' };
  }
  return null;
});
```

#### `onCombatRoundStart`

Fires at the start of each combat round, after the round queue is built but before any steps execute. Useful for round-based setup effects.

```typescript
window.modAPI.hooks.onCombatRoundStart((ctx) => {
  console.log('Round', ctx.roundNum, 'starting');
  return null; // or return a modified ctx to apply changes
});
```

#### `onCombatRoundEnd`

Fires at the end of each combat round (when the `{ kind: 'end' }` step completes). Useful for end-of-round effects, cleanup, or applying accumulated state changes.

```typescript
window.modAPI.hooks.onCombatRoundEnd((ctx) => {
  // Clean up temporary buffs at end of round 3
  if (ctx.roundNum === 3) {
    const cleaned = { ...ctx };
    return cleaned;
  }
  return null;
});
```

#### `onConsumeItem`

Fires when the player consumes a pill, concoction, or combat consumable during combat.

```typescript
window.modAPI.hooks.onConsumeItem((item, target, flags) => {
  console.log('Consumed:', item.name, 'target hp:', target.stats.hp);
});
```

- **`item`** -- The `Item` being consumed
- **`target`** -- The `CombatEntity` receiving the item
- **`flags`** -- Current game flags

### Combat State Access

During active combat, `modAPI.combat` provides direct access to the current combat state and allows mods to pause and resume the combat screen to inject custom UI or trigger events.

```typescript
if (modAPI.combat) {
  const state = modAPI.combat.getCombatState();
  modAPI.combat.setCombatState({ ...state, playerState: { ...state.playerState, stats: { ...state.playerState.stats, hp: 500 } } });
  console.log('In combat:', modAPI.combat.isInCombat());
  console.log('Log:', modAPI.combat.getCombatLog());
}
```

- **`modAPI.combat.getCombatState()`** -- Returns the current `CurrentCombatState`, or `undefined` if not in combat
- **`modAPI.combat.setCombatState(state)`** -- Overwrites the current combat state (use to modify HP, buffs, round number, etc.)
- **`modAPI.combat.getCombatLog()`** -- Returns the array of `CombatLogEntry` entries so far
- **`modAPI.combat.isInCombat()`** -- Returns `true` if a combat is in progress

To pause combat and show a custom screen, mods can call `window.modAPI.actions.setCombatPaused(true)` from a hook or UI injection. The `CombatScreen` returns `null` while paused, allowing a parent component to render custom UI instead. Call `window.modAPI.actions.setCombatPaused(false)` to resume.

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
window.modAPI.utils.subscribe(callback: () => void): () => void
window.modAPI.utils.getGameStateSnapshot(): RootState
window.modAPI.utils.determineCurrentScreen(rootState: RootState): ScreenType
```

- **`subscribe`** — Subscribe to any Redux state change. The callback is called after every dispatched action. Returns an unsubscribe function. Prefer this over direct store access.
- **`getGameStateSnapshot`** — Returns a read-only snapshot of the complete game state. When no save is loaded, the default base state is returned.
- **`determineCurrentScreen`** — Determines the current screen type from the Redux root state. Useful in custom screens or hooks to branch behavior based on where the player is.

```typescript
// Rate-limited reactive updates
let lastUpdate = 0;
window.modAPI.utils.subscribe(() => {
  const now = Date.now();
  if (now - lastUpdate < 250) return;
  lastUpdate = now;
  const snap = window.modAPI.utils.getGameStateSnapshot();
  refreshMyPanel(snap);
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
window.modAPI.utils.getMaxCompletion(recipe: RecipeItem, recipeStats: CraftingRecipeStats, realm: Realm, maxStepsBoost?: number): { flat: number; percentage: number }
window.modAPI.utils.getMaxPerfection(recipe: RecipeItem, recipeStats: CraftingRecipeStats, realm: Realm, maxStepsBoost?: number): { flat: number; percentage: number }
```

- **`getExpectedBarrier`** — Expected max barrier for a player in the given realm.
- **`getExpectedToxicity`** — Expected toxicity resistance.
- **`getExpectedPool`** — Expected crafting qi pool size.
- **`getExpectedIntensity`** — Expected crafting intensity.
- **`getExpectedControl`** — Expected crafting control.
- **`getExpectedArtefactPower`** — Expected artefact power stat.
- **`getBreakthroughQi`** — Qi cost for a breakthrough at the given realm and progress.
- **`getPillRealmMultiplier`** — Multiplier applied to pill effectiveness based on realm. Use when computing flat consumable values.

### Crafting Quality Cap Utilities

The crafting system uses a threshold-based quality tier model. Each tier requires reaching a 1.3x-scaled checkpoint; `canOvercraft` adds one step and `sublimeItem` adds a second. Two utility functions let mods read and compute the current quality cap:

```typescript
window.modAPI.utils.getMaxCompletion(recipe: RecipeItem, recipeStats: CraftingRecipeStats, realm: Realm, maxStepsBoost?: number): { flat: number; percentage: number }
window.modAPI.utils.getMaxPerfection(recipe: RecipeItem, recipeStats: CraftingRecipeStats, realm: Realm, maxStepsBoost?: number): { flat: number; percentage: number }
```

- **`getMaxCompletion`** — Returns the completion cap as a `{ flat, percentage }` pair. The `flat` value is the raw threshold step the player must reach. The `percentage` is the normalised progress bar value. Pass `maxStepsBoost` from `getMaxStepsBoost` (see below) when computing against a live crafting entity that carries `bonusMaximumQuality` buffs.

- **`getMaxPerfection`** — Same shape as `getMaxCompletion`, but for the perfection cap. Both functions compose additively with `canOvercraft` and `sublimeItem`, and both floor at one step so a recipe with neither still has a reachable cap.

**Computing `maxStepsBoost`:**

```typescript
const entity = window.modAPI.utils.createPlayerCraftingEntity(player, breakthrough, characters);
// Sum every active buff's bonusMaximumQuality value
const maxStepsBoost = (entity.buffs ?? []).reduce((boost, buff) => {
  if (buff.bonusMaximumQuality) {
    const val = window.modAPI.utils.evaluateScaling(
      { ...buff.bonusMaximumQuality, eqn: undefined },
      { ...entity.stats, stacks: 1 },
      1,
    );
    boost += Math.floor(val);
  }
  return boost;
}, 0);

const cap = window.modAPI.utils.getMaxPerfection(recipe, recipeStats, realm, maxStepsBoost);
```

The `bonusMaximumQuality` field lifts the quality tier cap by additional threshold steps. Each step adds one 1.3x-scaled checkpoint on top of whatever `canOvercraft` and `sublimeItem` already allow. The new cap is computed once per craft and threaded through `getMaxCompletion` and `getMaxPerfection` via the `maxStepsBoost` parameter.

**Awarding bonus quality stars:**

When a craft reaches the maximum possible perfection tier, `bonusQuality` buffs on the active entity award hidden potential stars on the finished item. Compute the bonus like this:

```typescript
const bonusQuality = (entity.buffs ?? []).reduce((bonus, buff) => {
  if (buff.bonusQuality) {
    const val = window.modAPI.utils.evaluateScaling(
      { ...buff.bonusQuality, eqn: undefined },
      { ...entity.stats, stacks: 1 },
      1,
    );
    bonus += Math.floor(val);
  }
  return bonus;
}, 0);
// Add bonusQuality to the crafted item's hidden potential
```

### Altar Utilities

```typescript
window.modAPI.utils.getLocationAltarReward(locationName: string): CompressionAltarBuilding['breakthroughReward'] | undefined
window.modAPI.utils.getCoreFormationAltarStats(breakthrough: BreakthroughState): CoreFormationAltarStats
```

- **`getLocationAltarReward`** — Returns the breakthrough reward granted by the altar at a specific location, or `undefined` if the location has no altar reward. Reflects mod-added or modified altars once the mod has finished loading.

- **`getCoreFormationAltarStats`** — Aggregate every altar the player has beaten in `breakthrough.coreFormation` into a single `CoreFormationAltarStats` (combat/crafting Scalings plus the per-altar breakdown). Modded golden-core breakthroughs must call this from their `dynamicStats` to pick up altar buffs in the same way the basegame `gemCore`/`flaringPearlCore`/etc. breakthroughs do.

```typescript
// Example: custom golden-core breakthrough using altar stats
dynamicStats: (args) => ({
  physicalStats: {},
  socialStats: {},
  combatStats: window.modAPI.utils.getCoreFormationAltarStats(args.breakthrough).combatStats,
  craftingStats: window.modAPI.utils.getCoreFormationAltarStats(args.breakthrough).craftingStats,
})
```

The `CoreFormationAltarStats` interface:

```typescript
interface CoreFormationAltarStats {
  /** Aggregated combat stat rewards as `Scaling`. Same-shape contributions
   *  (matching `stat` field) from multiple altars are summed into one entry;
   *  the rare different-shape collision drops to the first contributor so
   *  display stays simple. Consumers that need the resolved numeric value
   *  (entity creators) should evaluate each Scaling against the relevant
   *  entity stats. */
  combatStats: Partial<{ [key in CombatStatistic]: Scaling }>;
  /** Aggregated crafting stat rewards as `Scaling`. */
  craftingStats: Partial<{ [key in CraftingStatistic]: Scaling }>;
  /** Per-altar breakdown - retains the raw Scaling each altar contributed so
   *  UI can render per-altar lines (e.g. the altar screen tooltip). */
  altarContributions: {
    locationName: string;
    combatStats: Partial<{ [key in CombatStatistic]: Scaling }>;
    craftingStats: Partial<{ [key in CraftingStatistic]: Scaling }>;
  }[];
}
```

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
window.modAPI.utils.evalExp(exp: string, flags: Record<string, number>) // Evaluate an expression using the given flags, then floors the result
window.modAPI.utils.evalExpNoFloor(exp: string, flags: Record<string, number>) // Evaluates without flooring
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
- **`expandTooltipTemplate`** — Expand a template string by replacing {% raw %}`{{key}}`{% endraw %} placeholders with values from the map. Optionally appends a period.
- **`expandTooltipTags`** — Expand `<tag>` syntax in a template string to their display equivalents.

These utilities use the same formatting system as the game's built-in tooltips, ensuring consistent styling when you render custom tooltips in mod UI.

{% raw %}
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
{% endraw %}

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


### Player Entity Utilities

```typescript
window.modAPI.utils.createPlayerCombatEntity(player: PlayerEntity, breakthrough: BreakthroughState, gameFlags?: Record<string, number>): CombatEntity
window.modAPI.utils.createPlayerCraftingEntity(player: PlayerEntity, breakthrough: BreakthroughState, characters?: CharactersState, options?: { noCompanionBuff?: boolean }, gameFlags?: Record<string, number>): CraftingEntity
```

Create full player entities for tooltips, calculations, and custom mechanics. Both functions apply breakthrough stats, scaling, destinies, and mod hooks.

- **`createPlayerCombatEntity`** — Create a combat entity for damage calculations, tooltips, or custom combat mechanics. Returns a `CombatEntity` with all stats computed from the player's current breakthrough state.

- **`createPlayerCraftingEntity`** — Create a crafting entity for crafting tooltips, preview calculations, or custom crafting mechanics. Takes optional `characters` state for companion bonuses, and `options.noCompanionBuff` to skip those bonuses.

```typescript
// Create a combat entity for tooltip display
const player = window.modAPI.utils.getGameStateSnapshot().player.player;
const breakthrough = window.modAPI.utils.getGameStateSnapshot().player.breakthrough;
if (player && breakthrough) {
  const combatEntity = window.modAPI.utils.createPlayerCombatEntity(player, breakthrough, flags);
  // Use for damage calculations, technique effect previews, etc.
}

// Create a crafting entity for crafting previews
const craftingEntity = window.modAPI.utils.createPlayerCraftingEntity(player, breakthrough, characters);
```


## Components

The `ModReduxAPI.components` object provides pre-styled UI components for use in mod screens, injected UI, and options panels. It also exposes the full set of game tooltip variants and recipe display components under `api.components.tooltips` and `api.components.recipes`:

```typescript
// Core layout and base components
const { ItemComponent, GameDialog, GameButton, GameIconButton, BackgroundImage, PlayerComponent } = api.components;

// Game tooltip variants — use these instead of re-implementing from GameTooltip primitives
const tooltips = api.components.tooltips;
// tooltips.ItemTooltip, tooltips.ItemTooltipWithLocation, tooltips.ItemHeaderComponent,
// tooltips.BuffTooltip, tooltips.ArtefactTooltip, tooltips.CondensationArtTooltip,
// tooltips.CraftingActionItemTooltip, tooltips.CraftingBuffTooltip, tooltips.CraftingConditionTooltip,
// tooltips.CraftingEquipmentTooltip, tooltips.CraftingEquipmentEnchantmentTooltip,
// tooltips.CraftingReagentTooltip, tooltips.CraftingTechniqueTooltip,
// tooltips.CraftingTechniqueMasteryTooltip, tooltips.ElixirTooltip, tooltips.PillTooltip,
// tooltips.ConcoctionTooltip, tooltips.TechniqueTooltip,
// tooltips.TechniqueCrystalTooltip, tooltips.TechniqueItemTooltip, tooltips.TechniqueMasteryTooltip,
// tooltips.TechniqueShardTooltip, tooltips.BlueprintTooltip, tooltips.CharacterTooltip,
// tooltips.DestinyTooltip, tooltips.ManualTooltip, tooltips.BackgroundTooltip,
// tooltips.MountTooltip, tooltips.MountEnchantmentTooltip, tooltips.ClothingTooltip,
// tooltips.ClothingEnchantmentTooltip, tooltips.TalismanTooltip, tooltips.TalismanEnchantmentTooltip,
// tooltips.ArtefactEnchantmentTooltip, tooltips.ArtefactTechniqueTooltip,
// tooltips.CondensationArtEnchantmentTooltip, tooltips.CropTooltip, tooltips.FruitTooltip,
// tooltips.DeviceTooltip, tooltips.EnchantmentItemTooltip, tooltips.OreExtractorTooltip,
// tooltips.QiDensityFormationTooltip, tooltips.LocalMapTooltip, tooltips.MysticalKeyTooltip,
// tooltips.PillarPatternTooltip, tooltips.PillarShardTooltip, tooltips.LifeEssenceTooltip,
// tooltips.IntimateResourceTooltip, tooltips.IntimateTechniqueTooltip, tooltips.IntimateTraitTooltip,
// tooltips.AuctionAbilityTooltip, tooltips.AuctionResourceTooltip,
// tooltips.RecipeConditionEffectTooltip

// Recipe display components — render the full crafting recipe UI in mod screens
const recipes = api.components.recipes;
// recipes.RecipesComponent, recipes.RecipeRow, recipes.RecipeDetails,
// recipes.RecipeIngredients, recipes.RecipeCraftingBuffs, recipes.RecipeResultColumns,
// recipes.RecipeCraftButtons, recipes.RecipePinButton, recipes.RecipeFilters
```

### `ItemComponent`

Renders an inventory grid item icon with tooltip and click handling. Use for displaying items in mod UI:

```typescript
<ItemComponent
  item={item}
  equipped={false}
  onClick={() => handleItemClick(item)}
/>
```

All available props are defined in `src/types/components.ts` as `ItemComponentProps`. Key props include:

| Prop | Type | Description |
|------|------|-------------|
| `item` | `Item` | The item to render. Required. |
| `equipped` | `boolean` | Draws the equipped highlight around the cell. |
| `onClick` | `() => void` | Callback fired when the item is clicked. |
| `size` | `string` | CSS size of the square cell, e.g. `64px`. |
| `borderThickness` | `string` | Thickness of the border. |
| `hideKnown` | `boolean` | Hides the "already known" overlay on recipes and manuals. |
| `removeOverlays` | `boolean` | Renders icon and border only, no stack count or state overlays. |
| `showIfZero` | `boolean` | Shows the stack count even when the player holds none. |
| `disabled` | `boolean` | Disables interaction. |
| `inLoadout` | `boolean` | Used when rendering in a loadout screen. |
| `producesRange` | `{ min: number; max: number }` | Shows a `min - max` range under the icon. |
| `expedition` | `boolean` | Used for expedition item display. |

### `GameDialog`

Main content container with built-in title and close button:

```typescript
<GameDialog
  id="my-dialog"  // Required. Unique identifier for this dialog
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

All available props are defined in `src/types/components.ts` as `PlayerComponentProps`:

| Prop | Type | Description |
|------|------|-------------|
| `keybindingPriority` | `number` | Priority passed to the panel's keybindings. Raise it above a surrounding screen's priority so the player panel wins shared keys while it is the focused surface. |

### Tooltip Variants

All tooltip components accept the same props as their game-internal counterparts, documented in `src/types/components.ts`. The interfaces are named `{Component}Props` (e.g. `BuffTooltipProps`, `ItemTooltipProps`). Use `api.components.tooltips.BuffTooltip` to render a buff tooltip, `api.components.tooltips.ItemTooltip` for items, and so on. Each renders the full styled tooltip with all automatic formatting.

**Key props that recur across most tooltip components:**

| Prop | Type | Description |
|------|------|-------------|
| `entity` | `CombatEntity` | Stat context the tooltip resolves numbers against. Build with `createPlayerCombatEntity`. |
| `craftingEntity` | `CraftingEntity` | Crafting stat context for crafting-related tooltips. Build with `createPlayerCraftingEntity`. |
| `player` | `PlayerEntity` | Player reference for additional context. |
| `alreadyCreated` | `Set<string>` | Names of buffs/effects whose nested tooltips have already been rendered, preventing repetition. Pass a fresh `new Set<string>()` for a top-level popup. |
| `isAux` | `boolean` | Marks the tooltip as a nested/auxiliary tooltip. |

**Example:**

```typescript
// Render a buff tooltip in mod UI
const BuffTooltip = api.components.tooltips.BuffTooltip;
const entity = window.modAPI.utils.createPlayerCombatEntity();
<BuffTooltip buff={myBuff} entity={entity} alreadyCreated={new Set()} />

// Render an item tooltip
const ItemTooltip = api.components.tooltips.ItemTooltip;
<ItemTooltip item={myItem} entity={entity} player={player} equipped={undefined} />
```

### Recipe Display Components

Use `api.components.recipes.RecipesComponent` to embed the full recipe list and crafting UI in a mod screen:

```typescript
const { RecipesComponent } = api.components.recipes;
<RecipesComponent />
```

Use individual recipe components to build custom recipe interfaces:

```typescript
const { RecipeRow, RecipeDetails, RecipeIngredients } = api.components.recipes;
<RecipeRow recipe={myRecipe} onSelect={() => setSelected(myRecipe)} selected={isSelected} />
<RecipeDetails recipe={selectedRecipe} />
<RecipeIngredients recipe={selectedRecipe} />
```

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

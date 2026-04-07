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

The ModAPI is available globally as `window.modAPI` with three main sections:

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
```

- **`addItemToGuild`** — Add an item to a guild's rank shop. `guild` is the guild name, `rank` is the minimum rank required to purchase.
- **`addItemToFallenStar`** — Add an item to the drop table for fallen stars of a given realm.

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

Mark an existing location as a discovery root. Root locations are entry points for the map discovery system — all locations reachable from a root are discovered when its condition is met. Use this for secret areas or alternative starting points that are not connected to the main map.

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
- **`location`** — The location key. The location must have a `requestBoard` building — an error is thrown if the location does not exist or has no request board.

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

### Audio

```typescript
window.modAPI.actions.addMusic(name: string, path: string[])
window.modAPI.actions.addSfx(name: string, path: string)
```

Note: When adding audio files the compiler won't know they exist at first, so you will get errors when trying to use the new names you added. To get around that, you will need to cast it to the expected type `'my_music' as MusicName` manually. This is essentially just saying to the compiler 'trust me, this exists'.

## Utility Functions

Helper functions through `window.modAPI.utils`:

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

### Text Formatting

These helpers produce styled HTML strings for use in event text steps:

```typescript
window.modAPI.utils.col(text: string | number, col: string) // Color any text with a CSS color
window.modAPI.utils.loc(text: string | number) // Purple — location names
window.modAPI.utils.rlm(realm: Realm, progress?: RealmProgress) // Styled realm name
window.modAPI.utils.num(number: string | number) // Styled number
window.modAPI.utils.buf(buff: string) // Pink — buff names
window.modAPI.utils.itm(item: string) // Pink — item names
window.modAPI.utils.char(text: string | number) // Green — character names
window.modAPI.utils.elem(element: TechniqueElement) // Styled technique element
```

Use these inside event `text` fields to produce consistent in-game styling:

```typescript
{
  kind: 'text',
  text: `You travel to ${window.modAPI.utils.loc('Iron Peak Sect')} and meet ${window.modAPI.utils.char('Elder Zhang')}, who offers you ${window.modAPI.utils.itm('Spirit Core (III)')}.`
}
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

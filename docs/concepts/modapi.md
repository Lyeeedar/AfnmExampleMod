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
  - `newGameTutorials: Tutorial[]`  --  Base game tutorials played during a new game
  - `tutorialTriggers: TriggeredEvent[]`  --  Triggered events forming the opening sequence

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

- **`addItemToGuild`**  --  Add an item to a guild's rank shop. `guild` is the guild name, `rank` is the minimum rank required to purchase.
- **`addItemToFallenStar`**  --  Add an item to the drop table for fallen stars of a given realm.
- **`addToSectShop`**  --  Add an item to the Nine Mountain Sect's Favour Exchange shop at the specified realm tier. Optionally apply a price multiplier and gate the item behind a reputation tier. Items without a reputation tier go into `itemPool[realm]`; items with a tier go into `reputationPool[realm]`.

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

- **`quest`**  --  The quest definition. If the quest is not already registered, it is automatically added to the quest registry.
- **`realm`**  --  The realm tier this quest appears under on the request board (e.g. `'qiCondensation'`).
- **`rarity`**  --  Controls the display tier of the request. Valid values: `'mundane'`, `'qitouched'`, `'empowered'`, `'resplendent'`, `'incandescent'`, `'transcendent'`.
- **`condition`**  --  Flag expression that must be true for the quest to appear (e.g. `'1'` for always available, `'myMod_unlocked == 1'` for conditional).
- **`location`**  --  The location key. The location must have a `requestBoard` building, an error is thrown if the location does not exist or has no request board.

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

### Enemies and Combat

```typescript
window.modAPI.actions.addEnemy(enemy: EnemyEntity)
window.modAPI.actions.addEnemyToLocation(location: string, enemy: LocationEnemy)
window.modAPI.actions.addPuppet(puppet: PuppetType)
```

### Calendar and Events

```typescript
window.modAPI.actions.addCalendarEvent(event: CalendarEvent)
window.modAPI.actions.addTriggeredEvent(event: TriggeredEvent)
window.modAPI.actions.addGuildRank(guild: string, rank: GuildRank)
```

### Utilities and Helpers

```typescript
window.modAPI.actions.addTranslation(key: string, value: string)
window.modAPI.actions.addTranslationObject(obj: Record<string, string>)
```

### Mod API

```typescript
window.modAPI.actions.addHook(hook: ModHook)
```

## Utility Functions

Utility functions are accessed through `window.modAPI.utils`:

### State Access

```typescript
window.modAPI.subscribe(callback: () => void): () => void
window.modAPI.getGameStateSnapshot(): RootState | null
window.modAPI.utils.determineCurrentScreen(rootState: RootState): ScreenType
```

- **`subscribe`**  --  Subscribe to any Redux state change. The callback is called after every dispatched action. Returns an unsubscribe function. Prefer this over direct store access.
- **`getGameStateSnapshot`**  --  Returns a read-only snapshot of the complete game state, or `null` if no save is loaded.
- **`determineCurrentScreen`**  --  Determines the current screen type from the Redux root state. Useful in custom screens or hooks to branch behavior based on where the player is.

### Redux Selectors

Selectors retrieve values from the Redux store:

```typescript
window.modAPI.select(resource: string, ...args: any[]): unknown
window.modAPI.selectMany(...resources: string[]): Record<string, unknown>
```

- **`select`**  --  Call a Redux selector with the given arguments. The `resource` string is the selector path (e.g. `'player.realm'`). Returns the selected value or `undefined` if not found.
- **`selectMany`**  --  Retrieve multiple values at once. Accepts any number of resource strings and returns a record mapping each resource to its value.

```typescript
// Get a single value
const realm = window.modAPI.select('player.realm');

// Get multiple values
const { realm, progress, name } = window.modAPI.selectMany(
  'player.realm',
  'player.realmProgress',
  'player.name',
);
```

### State Slice Access

Access top-level state slices directly:

```typescript
window.modAPI.player: PlayerState
window.modAPI.characters: CharactersState
window.modAPI.inventory: InventoryState
window.modAPI.cultivation: CultivationState
window.modAPI.calendar: CalendarState
window.modAPI.location: LocationState
window.modAPI.quest: QuestState
window.modAPI.combat: CombatState
window.modAPI.crafting: CraftingState
```

Each slice provides direct access to its domain:

- **`player`**  --  Player stats, realm, breakthrough state, equipment, and equipped techniques
- **`characters`**  --  NPC states, relationships, companion status, and party members
- **`inventory`**  --  All items in the player's possession
- **`cultivation`**  --  Techniques, manuals, cultivation progress, and spiritual stats
- **`calendar`**  --  Current day, season, active events, and festival states
- **`location`**  --  Current location, discovered areas, and available exits
- **`quest`**  --  Active quests, completed quests, and quest log entries
- **`combat`**  --  Combat state, enemies, stances, and battle outcomes
- **`crafting`**  --  Crafting queues, active techniques, and recipe progress

```typescript
const player = window.modAPI.player;
const realm = player.realm;  // 'qiCondensation'
const breakthrough = player.breakthrough;
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

- **`createDeliveryMission`**  --  Simple delivery quest (favour reward only).
- **`createPackQuest`**  --  Hunt quest targeting a group of the same monster type.
- **`createDeliveryQuest`**  --  Full delivery quest with spirit stone and reputation rewards.

### Player Stat Calculations

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

- **`getExpectedBarrier`**  --  Expected max barrier for a player in the given realm.
- **`getExpectedToxicity`**  --  Expected toxicity resistance.
- **`getExpectedPool`**  --  Expected crafting qi pool size.
- **`getExpectedIntensity`**  --  Expected crafting intensity.
- **`getExpectedControl`**  --  Expected crafting control.
- **`getExpectedArtefactPower`**  --  Expected artefact power stat.
- **`getBreakthroughQi`**  --  Qi cost for a breakthrough at the given realm and progress.
- **`getPillRealmMultiplier`**  --  Multiplier applied to pill effectiveness based on realm. Use when computing flat consumable values.

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

- **`evaluateScaling`**  --  Evaluate a `Scaling` object against a variables map. Applies base value, stat multipliers, equations, custom scaling, and max constraints. Useful when computing item or technique values in code.
- **`generateSkipTutorialFlags`**  --  Generate the flags needed to skip tutorials for an alternative start. For each tutorial, sets `{name}`, `{name}Started`, `{name}Completed`; for each trigger, sets `{name}` and `{name}Started`.

### Tooltip Utilities

```typescript
window.modAPI.utils.parseTooltipLine(tooltip: string): React.ReactNode
window.modAPI.utils.expandTooltipTemplate(template: string, templateValues: Map<string, string>, addPeriod?: boolean): string
window.modAPI.utils.expandTooltipTags(template: string): string
```

- **`parseTooltipLine`**  --  Parse a tooltip string and return a React node with styled formatting. Handles colour tags, element tags, buff/item references, and numbers.
- **`expandTooltipTemplate`**  --  Expand a template string by replacing `{{key}}` placeholders with values from the map. Optionally appends a period.
- **`expandTooltipTags`**  --  Expand `<tag>` syntax in a template string to their display equivalents.

```typescript
const tooltipNode = window.modAPI.utils.parseTooltipLine('Applies [[blood corruption]] to target for 3 turns');

// Expand template with dynamic values
const expanded = window.modAPI.utils.expandTooltipTemplate(
  'Power scales with {{stat}} (base {{base}})',
  new Map([['stat', 'Control'], ['base', '50']]),
  true,
);
```

### Display Styling Utilities

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

### Player Entity Utilities

```typescript
window.modAPI.utils.createPlayerCombatEntity(player: PlayerEntity, breakthrough: BreakthroughState, gameFlags?: Record<string, number>): CombatEntity
window.modAPI.utils.createPlayerCraftingEntity(player: PlayerEntity, breakthrough: BreakthroughState, characters?: CharactersState, options?: { noCompanionBuff?: boolean }, gameFlags?: Record<string, number>): CraftingEntity
window.modAPI.utils.getMaxQiDroplets(player: PlayerEntity, breakthrough: BreakthroughState): number
```

Create full player entities for tooltips, calculations, and custom mechanics. Both functions apply breakthrough stats, scaling, destinies, and mod hooks.

- **`createPlayerCombatEntity`**  --  Create a combat entity for damage calculations, tooltips, or custom combat mechanics. Returns a `CombatEntity` with all stats computed from the player's current breakthrough state.

- **`createPlayerCraftingEntity`**  --  Create a crafting entity for crafting tooltips, preview calculations, or custom crafting mechanics. Takes optional `characters` state for companion bonuses, and `options.noCompanionBuff` to skip those bonuses.

- **`getMaxQiDroplets`**  --  Calculate the maximum Qi Droplets the player can hold based on their condensation art and breakthrough state. Returns the maximum droplets (0 if no vessel is equipped). Useful for displaying capacity in tooltips or calculating overflow when crafting consumables.

```typescript
// Create a combat entity for tooltip display
const player = window.modAPI.getGameStateSnapshot()?.player.player;
const breakthrough = window.modAPI.getGameStateSnapshot()?.player.breakthrough;
if (player && breakthrough) {
  const combatEntity = window.modAPI.utils.createPlayerCombatEntity(player, breakthrough, flags);
  // Use for damage calculations, technique effect previews, etc.
}

// Create a crafting entity for crafting previews
const craftingEntity = window.modAPI.utils.createPlayerCraftingEntity(player, breakthrough, characters);
```

## Hooks

Hooks intercept and modify game behavior:

```typescript
window.modAPI.hooks.onCreatePlayerCombatEntity(interceptor: (entity: CombatEntity, player: PlayerEntity, breakthrough: BreakthroughState, gameFlags?: Record<string, number>) => CombatEntity): void
window.modAPI.hooks.onModifyTechniqueEffect(interceptor: (effect: TechniqueEffect, technique: Technique, source: 'item' | 'technique' | 'buff') => TechniqueEffect): void
window.modAPI.hooks.onModifyItemTooltip(interceptor: (tooltip: string, item: Item, player: PlayerEntity) => string): void
window.modAPI.hooks.onPreDamageCalculation(interceptor: (damage: DamageCalculation, context: DamageContext) => DamageCalculation): void
window.modAPI.hooks.onPostDamageCalculation(interceptor: (result: DamageResult, damage: DamageCalculation) => DamageResult): void
```

### Key Hooks

- **`onCreatePlayerCombatEntity`**  --  Called when a player combat entity is created. Modify the entity before it is used in combat calculations. Useful for applying mod-specific stat bonuses or adjusting base values.

```typescript
window.modAPI.hooks.onCreatePlayerCombatEntity((entity, player, breakthrough) => {
  // Add 10% bonus to all stats from a mod-specific destiny
  return {
    ...entity,
    stats: {
      ...entity.stats,
      power: entity.stats.power * 1.1,
    },
  };
});
```

- **`onModifyTechniqueEffect`**  --  Called when a technique effect is computed. Modify effect values before they are applied. Useful for adjusting effect scaling or adding conditional modifiers.

- **`onModifyItemTooltip`**  --  Called when an item tooltip is generated. Modify the tooltip string before it is displayed. Useful for adding mod-specific tooltips or conditional information.

- **`onPreDamageCalculation`**  --  Called before damage is computed. Modify the damage calculation input. Useful for adjusting base damage, adding miss chances, or applying custom damage multipliers.

- **`onPostDamageCalculation`**  --  Called after damage is computed but before it is applied. Modify the result. Useful for adding post-damage effects like leech or barrier breaking.

## Components

The `ModReduxAPI.components` object provides pre-styled UI components for use in mod screens, injected UI, and options panels:

```typescript
const { GameDialog, GameButton, GameIconButton, BackgroundImage, PlayerComponent, GameTooltip, GameTooltipBox, TooltipLine } = api.components;
```

### Dialog Components

- **`GameDialog`**  --  Modal dialog with standard game styling. Props: `open`, `onClose`, `title`, `children`, `actions?`, `maxWidth?`.
- **`GameButton`**  --  Standard game button with hover states and disabled styling. Props: `onClick`, `children`, `disabled?`, `variant?`, `size?`.
- **`GameIconButton`**  --  Icon button for toolbars and compact actions. Props: `onClick`, `icon`, `tooltip?`, `disabled?`.

```typescript
<GameDialog open={showDialog} onClose={() => setShowDialog(false)} title="My Mod Dialog">
  <p>Content goes here</p>
  <GameButton onClick={() => setShowDialog(false)}>Close</GameButton>
</GameDialog>
```

### Display Components

- **`BackgroundImage`**  --  Full-screen background image with fade support. Props: `src`, `opacity?`, `speed?`.
- **`PlayerComponent`**  --  Compact player summary for use in UI panels. Props: `player`, `breakthrough?`, `showEquipment?`.

### Tooltip Components

- **`GameTooltip`**  --  Wrapper that shows a tooltip on hover. Props: `content`, `children`, `placement?`.
- **`GameTooltipBox`**  --  Styled tooltip box with title and content sections. Props: `title?`, `children`, `maxWidth?`.
- **`TooltipLine`**  --  Single line in a tooltip with left/right alignment. Props: `left`, `right`, `highlight?`.

```typescript
<GameTooltip content={<GameTooltipBox title="Item Name">Item description</GameTooltipBox>}>
  <span>Hover me</span>
</GameTooltip>

<TooltipLine left="Power" right="100" />
<TooltipLine left="Critical" right="15%" highlight />
```

## Key Types

### PlayerEntity

The `PlayerEntity` represents the player character with all their stats and properties:

```typescript
interface PlayerEntity {
  id: string;
  name: string;
  realm: Realm;
  realmProgress: RealmProgress;
  level: number;
  experience: number;
  stats: {
    health: number;
    power: number;
    defense: number;
    barrier: number;
    toxicity: number;
    control: number;
    intensity: number;
    pool: number;
    speed: number;
    charisma: number;
  };
  equipment: Record<EquipmentSlot, Item | null>;
  techniques: Technique[];
  attributes: Record<string, number>;
  backgrounds: BackgroundId[];
  currentQi: number;
  currentHealth: number;
  currentBarrier: number;
}
```

### CombatEntity

The `CombatEntity` extends `PlayerEntity` with combat-specific fields:

```typescript
interface CombatEntity extends PlayerEntity {
  maxHealth: number;
  maxBarrier: number;
  maxQi: number;
  currentHealth: number;
  currentBarrier: number;
  currentQi: number;
  stance: Technique[];
  buffs: CombatBuff[];
  elementalResistances: Record<TechniqueElement, number>;
  combatBonuses: CombatBonus[];
  appliedEffects: AppliedEffect[];
}
```

### Item

Items are the core building blocks for equipment, consumables, and quest objects:

```typescript
interface Item {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: ItemKind;
  rarity: Rarity;
  value: number;
  stackable: boolean;
  effects?: ItemEffect[];
  equippable?: boolean;
  equipmentSlot?: EquipmentSlot;
  duration?: number;
  charges?: number;
  conditions?: Condition[];
}
```

`TooltipLine` accepts `left` (label) and `right` (value) strings. `parseTooltipLine` in `utils` can format raw tooltip strings with colour tags, element tags, buff/item references, and numbers into styled `ReactNode` output suitable for use in these components.

## Examples

### Adding a Custom Item

```typescript
const myItem: Item = {
  id: 'myMod/myItem',
  name: 'Spirit Enhancement Crystal',
  description: 'A crystal infused with spiritual energy. Use during crafting to boost success rates.',
  icon: 'myMod/crystal',
  type: 'material',
  rarity: 'empowered',
  value: 500,
  stackable: true,
};

window.modAPI.actions.addItem(myItem);
```

### Adding a Custom Enemy

```typescript
const myEnemy: EnemyEntity = {
  id: 'myMod/bandit',
  name: 'Rogue Cultivator',
  description: 'A wandering cultivator with no sect affiliation.',
  icon: 'bandit',
  type: 'humanoid',
  realm: 'meridianOpening',
  baseStats: {
    health: 500,
    power: 50,
    defense: 20,
    barrier: 100,
  },
  techniques: ['basicStrike', 'qiShield'],
  drops: [
    { itemId: 'spiritStone', chance: 0.5, count: [1, 3] },
  ],
};

window.modAPI.actions.addEnemy(myEnemy);
```

### Adding a Custom Location

```typescript
const hiddenValley: GameLocation = {
  id: 'Hidden Valley',
  name: 'Hidden Valley',
  description: 'A secluded valley surrounded by mountains. Spiritual energy is unusually dense here.',
  realm: 'qiCondensation',
  image: 'valley',
  enemies: [],
  events: [],
  buildings: [],
  connections: ['Mountain Path'],
};

window.modAPI.actions.addLocation(hiddenValley);
window.modAPI.actions.registerRootLocation('Hidden Valley', 'foundHiddenValley == 1');
```

### Creating a Quest

```typescript
const gatherQuest = window.modAPI.utils.createCollectionMission(
  'myMod/rareHerb',
  'Liang Tiao Village',
  'Gather rare herbs from the forest',
  50,
);

window.modAPI.actions.addQuest(gatherQuest);
window.modAPI.actions.addQuestToRequestBoard(
  gatherQuest,
  'qiCondensation',
  'qitouched',
  '1',
  'Liang Tiao Village',
);
```

### Using Hooks

```typescript
// Modify player combat entity when created
window.modAPI.hooks.onCreatePlayerCombatEntity((entity, player, breakthrough) => {
  // Apply a 5% power bonus from a mod-specific source
  return {
    ...entity,
    stats: {
      ...entity.stats,
      power: entity.stats.power * 1.05,
    },
  };
});
```

### Accessing Game State

```typescript
// Subscribe to state changes
const unsubscribe = window.modAPI.subscribe(() => {
  const state = window.modAPI.getGameStateSnapshot();
  if (state) {
    const realm = state.player.realm;
    const health = state.player.currentHealth;
    console.log(`Player at ${realm}: ${health} health`);
  }
});

// Later, when done
unsubscribe();
```

## Realm Progression

The game tracks ten realms of cultivation:

| Realm | Key Character |
|-------|---------------|
| Mundane | Mortal beginnings |
| Body Forging | Tempering the physical form |
| Meridian Opening | Opening energy pathways |
| Qi Condensation | Gathering and condensing Qi |
| Core Formation | Forming the spirit core |
| Pillar Creation | Building spiritual pillars |
| Life Flourishing | Thriving with spiritual life |
| World Shaping | Molding world energy |
| Inner Genesis | Generating inner power |
| Soul Ascension | Ascending beyond mortal limits |

Each realm has three progress tiers: `Early`, `Middle`, `Late`.

## Item Rarity

Items have six rarity tiers:

| Rarity | Description |
|--------|-------------|
| `mundane` | Common items with no spiritual properties |
| `qitouched` | Items infused with trace spiritual energy |
| `empowered` | Items with notable spiritual power |
| `resplendent` | Radiant items of considerable strength |
| `incandescent` | Brilliant items near spiritual perfection |
| `transcendent` | Items that transcend mortal limits |

## Utility Reference

### Keybind Registration

```typescript
window.modAPI.utils.registerKeybind(action: string, displayText: string, defaultBinding?: string): void
window.modAPI.utils.getRegisteredKeybindValue(action: string): RegisteredKeybind | undefined


`RegisteredKeybind` has the following shape:

```typescript
interface RegisteredKeybind {
  action: string;
  displayText: string;
  code: string;
  modifiers: string[];
}
```

Register a custom keybind for your mod:

```typescript
window.modAPI.utils.registerKeybind('myMod.specialAction', 'Special Action', 'KeyF');
```

Retrieve the current keybind:

```typescript
const binding = window.modAPI.utils.getRegisteredKeybindValue('myMod.specialAction');
if (binding) {
  console.log(`Special action is bound to ${binding.displayText} (${binding.code})`);
  // Use binding.code to compare against KeyboardEvent.code
}
```

## Condition Strings

Conditions are flag expressions evaluated at runtime to determine if something should appear or trigger. They use a simple expression syntax:

- Single flag: `'flagName'` (true if flagName == 1)
- Comparison: `'flagName > 5'`, `'health < 50'`
- Logical: `'flag1 == 1 && flag2 > 3'`, `'flag1 == 1 || flag2 == 1'`

Common flags set by the game:
- `player.realm` -- Current realm
- `player.realmProgress` -- Current progress (Early/Middle/Late)
- `player.level` -- Player level
- `player.hasItem` -- Boolean, true if player has a specific item
- `quest.active` -- Boolean, true if a quest is active

## Scaling Objects

Many game values use `Scaling` objects for dynamic adjustment:

```typescript
interface Scaling {
  base: number;
  perLevel?: number;
  statMultiplier?: {
    stat: StatName;
    multiplier: number;
  };
  equation?: string;
  max?: number;
  min?: number;
}
```

The `evaluateScaling` utility computes the final value:

```typescript
const result = window.modAPI.utils.evaluateScaling(
  { base: 10, perLevel: 2, max: 100 },
  { level: 20, power: 50 },
  4, // stanceLength for stance-based effects
);
```

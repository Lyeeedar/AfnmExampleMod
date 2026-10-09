---
layout: default
title: Building Types
parent: Location System
nav_order: 3
---

# Building Types

Buildings provide interactive services and content within locations. Each building type offers specific functionality, from commerce and healing to quest distribution and cultivation.

## Basic Buildings

### Healer

Provides healing services to restore health and remove injuries:

```typescript
interface HealerBuilding {
  kind: "healer";
  condition?: string;
  disabled?: string;
  offset?: { x: number; y: number; };
}
```

### Cultivation Chamber

Allows meditation and qi cultivation:

```typescript
{
  kind: 'cultivation'
}
```

### Manual Pavilion

Access to combat technique manuals:

```typescript
{
  kind: 'manual'
}
```

### Crafting (Furnace Pagoda)

Alchemy and item crafting:

```typescript
{
  kind: 'crafting'
}
```

### Treasure Vault

Banking and storage services:

```typescript
{
  kind: 'vault',
  slips: vaultSlips, // Record<Realm, TokenItem> defined by your mod
  itemPool: vaultOfferings // Record<Realm, VaultOffering[]>
}
```

### Material Compendium

Encyclopedia of crafting materials:

```typescript
{
  kind: 'compendium'
}
```

### Mystical Region

Portal to special cultivation areas:

```typescript
{
  kind: 'mysticalRegion'
}
```

### Expedition

Portal to expedition dungeons. Expedition buildings require a name matching an existing expedition tile pool (registered by the base game or via modAPI.actions.addExpeditionTiles).

```typescript
interface ExpeditionBuilding {
  kind: "expedition";
  name: string;
  displayName?: Translatable;
  teamCount: number;
  realm: Realm;
  condition?: string;
  disabled?: string;
  offset?: { x: number; y: number; };
}
```

Example:

```typescript
{
  kind: 'expedition',
  name: 'Tai Kong',
  displayName: 'Tai Kong Expedition',
  teamCount: 3,
  realm: 'qiCondensation',
}
```

The name field is the expedition identifier. It must match the expeditionName passed to api.actions.addExpeditionTiles(expeditionName, tiles) so that the tile pool is correctly associated with this building. See Expedition Tiles below for how to register tiles for a custom expedition.

### Training Ground

Combat training and sparring:

```typescript
{
  kind: 'trainingGround'
}
```

### Research (Vault of Infinite Reflections)

Research and experimentation facility:

```typescript
{
  kind: 'research'
}
```

### Reforge Workshop

Item reforging and enhancement:

```typescript
{
  kind: 'reforge'
}
```

### Furnace of Ten Thousand Flames

Advanced alchemy furnace for high-tier crafting:

```typescript
{
  kind: 'tenThousandFlames'
}
```

## Commerce Buildings

### Market

General marketplace with realm-specific inventory:

```typescript
interface MarketBuilding {
  kind: "market";
  tokenCurrency?: MarketTokenCurrency;
  displayName?: Translatable;
  itemPool: Record<Realm, ShopItem[]>;
  reputationPool?: Record<Realm, ShopItem[]>;
  costMultiplier: number;
  refreshMonths: number;
  condition?: string;
  disabled?: string;
  offset?: { x: number; y: number; };
}
```

### Favour Exchange

Special shop using favour currency:

```typescript
{
  kind: 'favourExchange',
  itemPool: emptyShopPool,      // Same as market
  costMultiplier: 2.0,
  refreshMonths: 1
}
```

### Enchantment Shop

Shop for purchasing item enchantments:

```typescript
{
  kind: 'enchantmentShop',
  costMultiplier: 1.5,   // Base price multiplier
  refreshMonths: 1,       // Inventory refresh period
  stockCount: 6           // Number of enchantments available at a time
}
```

## Mission Buildings

### Mission Hall

Sect missions with rewards and crafting commissions:

```typescript
{
  kind: 'mission'
}
```

Missions and crafting commissions are defined at location level:
```typescript
missions: [
  {
    realm: 'bodyForging',
    rarity: 'mundane',
    quest: 'ratascar_culling',
    condition: '1'
  }
]
```

To offer crafting commissions at a location, set offersCraftingMissions: true on the mission building and use addCraftingMissionsToLocation from the mod API. Crafting commissions require the player to craft an item to a quality threshold, appraised by an NPC who delivers separate outcome event steps for sublime, perfect, basic, and failure results.

### Request Board

Player-requested tasks:

```typescript
{
  kind: 'requestBoard',
  requests: {
    mundane: [],
    qiCondensation: [],
    coreFormation: [],
    pillarCreation: [],
    lifeFlourishing: [],
    worldShaping: [],
    innerGenesis: [],
    soulAscension: [],
    bodyForging: [
      {
        quest: 'herb_collection',
        condition: '1',
        rarity: 'mundane'
      }
    ],
    meridianOpening: [],
    // ...other realms
  }
}
```

## Resource Buildings

### Herb Field

Herb gathering location:

```typescript
{ kind: 'herbField', condition: 'farmingUnlocked == 1' }
```

### Yinying Mine

Mining for ores and gems:

```typescript
{ kind: 'mine', mineId: 'myModMine', condition: 'miningUnlocked == 1' }
```

## Special Buildings

### Recipe Library

Access to crafting recipes:

```typescript
{
  kind: 'recipe',
  recipePool: {
    mundane: [],
    qiCondensation: [],
    coreFormation: [],
    pillarCreation: [],
    lifeFlourishing: [],
    worldShaping: [],
    innerGenesis: [],
    soulAscension: [],
    bodyForging: [
      'recuperation_pill_recipe',
      'iron_skin_pill_recipe',
      'clothing_blank_recipe'
    ],
    meridianOpening: [],
    // ...other realms
  }
}
```

### Library

Books and lore:

```typescript
{
  kind: 'library', title: 'Ancient Archives',
  categories: [{
    name: 'History', condition: '1',
    books: [{ title: 'Rise of the Nine Mountains', author: 'Elder Shou', condition: 'historyInterest == 1', contents: 'Long ago, when the heavens...' }],
  }],
}
```

### House

Player housing:

```typescript
{
  kind: 'house',
  houseDef: {
    name: 'Heaven-Touched House',
    description: 'Your rebuilt childhood home...',
    background: homeImage,
    screenEffect: 'dust',
    qiDensity: 1000,
    fixedRooms: [],
    freeRooms: '3',
    transportSeal: liangTiaoSeal
  },
  unlockCondition: 'houseRepaired == 1',
  condition: 'houseRepaired == 1'
}
```

### Rumour Trader

A trader who sells whispered secrets about hidden locations. Each rumour has a cost and a revealed hint that points toward a discovery opportunity.

```typescript
{
  kind: 'rumours', traderName: 'Old Huo the Altar-Mapper',
  rumours: [{
    key: 'myRumour_key', title: 'The Secret Chamber', cost: 2000, costRealm: 'coreFormation',
    hint: 'Deep beneath the ancient ruins lies a hidden chamber...',
    condition: 'secretFound == 0', foundCondition: 'altar_MySecretChamber == 1',
  }],
}
```

condition: Optional. When set, the rumour is hidden unless the condition evaluates to true. Use this to gate rumours behind prerequisites or to hide hardmode-only secrets.

foundCondition: Optional. An expression evaluated to determine whether the player has already acted on this rumour. Drives the 'Found' status badge on the trader card so players can see at a glance which secrets they have already discovered. Typical values are the same flag the discovery event sets (for example ancestralAltarFound == 1) or an item-presence check.

Per-rumour state: The game tracks which rumours the player has purchased in RumoursBuildingState.purchased (a list of rumour keys). Use this to prevent a rumour from appearing again after purchase, or to show different dialogue when returning to the trader.

### Compression Altar

Core compression service. Grants a temporary buff on use and a permanent breakthroughReward on the first compression at each altar.

```typescript
{
  kind: 'altar',
  buff: {
    name: 'Meditative Surge', icon: 'assets/meditative-surge.png',
    tooltip: 'Your core has been compressed.', canStack: true, stacks: 1,
    stats: { power: { value: 0.2, stat: 'power', scaling: 'stacks' } },
  },
  breakthroughReward: {
    combatStats: { power: { value: 0.03, stat: 'power' } },
    craftingStats: { poolCostPercentage: { value: -3, stat: undefined } },
  },
}
```

breakthroughReward is optional. If omitted, compressing at the altar grants no permanent bonus. Each unique altar (identified by location name or house name) can grant its breakthroughReward once per playthrough. The same altar visited again provides only the temporary buff.

Available CombatStatistic keys include power, protection, critchance, critmultiplier, resistance, and dr.

Available CraftingStatistic keys include control, intensity, critchance, critmultiplier, successChanceBonus, and poolCostPercentage. A poolCostPercentage bonus of -3 reduces Qi Pool costs by 3 percentage points.

### Guild

Guild headquarters:

```typescript
interface GuildBuilding {
  kind: "guild";
  condition?: string;
  guild: string;
  position: CustomBuildingPosition;
  disabled?: string;
  offset?: { x: number; y: number; };
}
```

Items sold in a token-based guild rank shop declare a fixed token price:

```typescript
const rankShopItem: ShopItem = {
  name: myItem.name,
  stacks: 1,
  tokenCost: 3, // Fixed price in the guild's token currency
};
```

Important: When a guild declares token, every item in its rankShop must declare tokenCost. Items without it would be charged in spirit stones instead.

### Custom Building

Fully customizable building with event steps:

```typescript
{
  kind: 'custom',
  name: 'Mysterious Shop',
  icon: shopIcon,
  position: 'middleright',  // Screen position
  condition: 'mysteryUnlocked == 1',
  eventSteps: [
    {
      kind: 'text',
      text: 'You enter the mysterious shop...'
    },
    {
      kind: 'choice',
      choices: [
        {
          text: 'Browse wares',
          children: []
        },
        {
          text: 'Leave',
          children: [
            { kind: 'exit' }
          ]
        }
      ]
    }
  ]
}
```

Position options for custom buildings:
- 'top', 'topleft', 'topright'
- 'belowtop', 'belowtopleft', 'belowtopright'
- 'middleleft', 'middle', 'middleright'
- 'bottom', 'bottomleft', 'bottomright'

## Mod-Specific Buildings

### Mod Building

A custom building that navigates to a registered mod screen. Use modBuilding alongside window.modAPI.actions.addScreen() to integrate fully custom UI into a location.

```typescript
{
  kind: 'modBuilding', name: 'Mysterious Device', displayName: 'Mysterious Device',
  icon: myCustomIcon, screen: 'myModScreen', position: 'middleleft',
  condition: 'deviceUnlocked == 1', disabled: 'deviceBusy == 1',
}
```

The screen field must match the key used when registering the screen with window.modAPI.actions.addScreen(). See Adding Screens for how to create and register mod screens.

```typescript
// Register the screen
window.modAPI.actions.addScreen({
  key: 'myModScreen',
  component: MyModScreenComponent,
});

// Add the building to a location
window.modAPI.actions.addBuildingsToLocation('Liang Tiao Village', [
  {
    kind: 'modBuilding',
    name: 'Ancient Device',
    icon: deviceIcon,
    screen: 'myModScreen',
    position: 'top',
    condition: '1',
  }
]);
```

## Building Properties

### Common Properties

All buildings support these optional fields:

```typescript
{
  kind: BuildingType,      // Required building type
  condition?: string,       // When building is available
  disabled?: string,        // When building is disabled
  position?: {            // Normalized position in location scene artwork
    x: number,
    y: number
  }
}
```

### Conditional Availability

Control when buildings appear:

```typescript
{
  kind: 'market',
  condition: 'marketBuilt == 1 && realm >= meridianOpening',
  itemPool: emptyShopPool,
  costMultiplier: 1,
  refreshMonths: 1,
  // ...other properties
}
```

### Disabled State

Temporarily disable buildings:

```typescript
{
  kind: 'healer',
  disabled: 'injured == 0',  // Disabled when not injured
}
```

## Complete Example

```typescript
export const myLocation: GameLocation = {
  ...baseLocation, // A complete GameLocation defined by your mod

  buildings: [
    // Basic services
    { kind: 'healer' },
    { kind: 'crafting' },

    // Market with reputation items
    {
      kind: 'market',
      itemPool: {
        meridianOpening: [],
        mundane: [],
        qiCondensation: [],
        coreFormation: [],
        pillarCreation: [],
        lifeFlourishing: [],
        worldShaping: [],
        innerGenesis: [],
        soulAscension: [],
        bodyForging: [
          { name: 'Healing Pill I', stacks: 5 },
          { name: 'Small Claw', stacks: 10 }
        ]
      },
      reputationPool: {
        mundane: [],
        meridianOpening: [],
        qiCondensation: [],
        coreFormation: [],
        pillarCreation: [],
        lifeFlourishing: [],
        worldShaping: [],
        innerGenesis: [],
        soulAscension: [],
        bodyForging: [
          {
            name: 'Rare Manual',
            stacks: 1,
            reputation: 'exalted',
            valueModifier: 10
          }
        ]
      },
      costMultiplier: 1.8,
      refreshMonths: 2
    },

    // Custom event building
    {
      kind: 'custom',
      name: 'Elder\'s Residence',
      icon: elderIcon,
      position: 'top',
      condition: 'elderQuestComplete == 1',
      eventSteps: [
        {
          kind: 'speech',
          character: 'Village Elder',
          text: 'Welcome back, young cultivator...'
        },
        // ...more events
      ]
    },

    // Conditional library
    {
      kind: 'library',
      condition: 'libraryUnlocked == 1',
      title: 'Village Archives',
      categories: [
        {
          name: 'Local History',
          condition: '1',
          books: []
        }
      ]
    },

    // Mod screen building
    {
      kind: 'modBuilding',
      name: 'Alchemist Workshop',
      icon: workshopIcon,
      screen: 'myAlchemistScreen',
      position: 'middleright',
      condition: 'workshopBuilt == 1',
    }
  ]
};
```

## Expedition Tiles

For the small tile examples below, define shared base properties once:

```typescript
const baseTile: Omit<EntranceTile, 'kind'> = {
  name: 'Frozen Reach Tile',
  icon: 'assets/tile.png',
  bg: 'assets/frozen-reach.png',
  description: 'A chamber in the Frozen Reach.',
  rarity: 'mundane',
  intro: [],
};
```

Give each registered tile a unique name when building your tile pool.

Expeditions use a tile-based dungeon generation system. Each tile has a kind (entrance, exit, combat, treasure, etc.) and defines connections to neighbouring tiles.

Tiles are registered via api.actions.addExpeditionTiles(expeditionName, tiles) and are keyed by the same expedition identifier used in the expedition building name field. An expedition building without any tiles registered will use the default game tiles.

Reading existing tiles:

```typescript
// Inspect the tile pool for an existing expedition
const tilePool = window.modAPI.gameData.expeditionTiles['Tai Kong'];
const treasureTiles = tilePool.filter((t) => t.kind === 'treasure');
```

Registering tiles for a custom expedition:

```typescript
// Register a new expedition with a custom treasure tile
window.modAPI.actions.addExpeditionTiles('Frozen Reach', [
  {
    kind: 'treasure',
    name: 'Glacial Cache',
    icon: 'mod://icons/ice.png',
    bg: 'mod://backgrounds/iceBG.png',
    description: 'A cache pulsing with cold qi.',
    rarity: 'resplendent',
    intro: [{ kind: 'text', text: 'You uncover a cache of frozen treasures.' }],
  },
]);
```

### Tile Kinds

All tile types share these base fields:

```typescript
interface BaseTile {
  name: string;              // Display name
  icon: string;              // Icon path (use 'mod://' for mod assets)
  bg: string;               // Background image path
  description: Translatable; // Shown when the tile is revealed
  rarity: Rarity;            // 'mundane' | 'qitouched' | 'empowered' | 'resplendent' | 'incandescent' | 'transcendent'
  intro: EventStep[];        // Event steps shown when entering this tile
}
```

entrance - Starting tile. Exactly one per expedition.

```typescript
{ ...baseTile, kind: 'entrance' }
```

exit - Goal tile. Reaching this tile completes the expedition.

```typescript
{ ...baseTile, kind: 'exit' }
```

extract - Grants extraction rewards (materials, items).

```typescript
{ ...baseTile, kind: 'extract', extractCount: 3 }
```

combat - Triggers a combat encounter.

```typescript
interface CombatTile {
  kind: "combat";
  modifier?: number;
  enemyCount?: number;
  items?: { item: ItemDesc; count: number; }[];
  name: string;
  icon: string;
  bg: string;
  description: Translatable;
  rarity: Rarity;
  intro: EventStep[];
}
```

rest - Restores team health and removes debuffs.

```typescript
{ ...baseTile, kind: 'rest', baseRestore: 50 }
```

treasure - Grants treasure room loot.

```typescript
{ ...baseTile, kind: 'treasure' }
```

boss - Triggers a boss fight with scaled rewards.

```typescript
interface BossTile {
  kind: "boss";
  modifier?: number;
  items?: { item: ItemDesc; count: number; }[];
  name: string;
  icon: string;
  bg: string;
  description: Translatable;
  rarity: Rarity;
  intro: EventStep[];
}
```

buff - Applies a positive buff to the team.

```typescript
{ ...baseTile, kind: 'buff' }
```

debuff - Applies a negative debuff to the team.

```typescript
{ ...baseTile, kind: 'debuff' }
```

challenge - High-difficulty combat with extra rewards.

```typescript
interface ChallengeTile {
  kind: "challenge";
  modifier?: number;
  items?: { item: ItemDesc; count: number; }[];
  name: string;
  icon: string;
  bg: string;
  description: Translatable;
  rarity: Rarity;
  intro: EventStep[];
}
```

puzzle - A puzzle encounter, optionally with enemies.

```typescript
interface PuzzleTile {
  kind: "puzzle";
  enemies?: boolean;
  name: string;
  icon: string;
  bg: string;
  description: Translatable;
  rarity: Rarity;
  intro: EventStep[];
}
```

boonBane - Random beneficial or harmful effect.

```typescript
{ ...baseTile, kind: 'boonBane' }
```

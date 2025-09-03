# AFNM Mod Guide

## Introduction

This guide is to help anyone who wishes to create mods for Ascend From Nine Mountains. You can find the game [here](https://lyeeedar.itch.io/ascend-from-nine-mountains).

## Getting Started

### Step 1: Clone the project and install dependencies

First step will be forking, cloning, or downloading this example project. You can then open it in an editor (my recommendation is vscode). If you haven't done any typescript work before, vscode should prompt you to download node and other dependencies.

Once you have done this, you should be able to run `npm install`. This will download all the project dependencies.

### Step 2: Set your mod metadata

Open the `package.json`. At the top of this file you can find the following block:

```json
"name": "my-game-mod",
"version": "0.0.1",
"description": "A mod for AFNM",
"author": {
    "name": "<your name>"
},
```

Edit the content of these fields to be whatever works for your mod.

### Step 3: Start building your mod

You are now ready to start building out your mod! Navigate to `src/modContent/index.ts`. Here is where you can add whatever content you want your mod to contain. A global mod api has been provided, that contains the following set of data:

```typescript
export interface ModAPI {
  gameData: {
    backgrounds: {
      birth: Background[];
      child: Background[];
      teen: Background[];
    };
    auction: Record<Realm, AuctionItemDef[]>;
    items: Record<string, Item>;
    characters: Record<string, Character>;
    breakthroughs: Record<Realm, Breakthrough[]>;
    calendarEvents: CalendarEvent[];
    craftingTechniques: Record<string, CraftingTechnique>;
    recipeConditionEffects: RecipeConditionEffect[];
    destinies: Record<string, Destiny>;
    triggeredEvents: TriggeredEvent[];
    crops: Record<Realm, Crop[]>;
    locations: Record<string, GameLocation>;
    manuals: Record<string, Manual>;
    mineChambers: Record<Realm, Record<RealmProgress, MineChamber[]>>;
    quests: Record<string, Quest>;
    techniques: Record<string, Technique>;
    techniqueBuffs: {
      blood: {
        bloodCorruption: Buff;
        bloodReinforcement: Buff;
        lifeforceCorruption: Buff;
        empoweredBlood: Buff;
        hardenedBlood: Buff;
        pureBlood: Buff;
        bloodEcho: Buff;
      };
      blossom: {
        fragrantBlossom: Buff;
        fatalFlora: Buff;
        razorBlossom: Buff;
        ironBlossom: Buff;
        witheringBlossom: Buff;
        soilDepletion: Buff;
      };
      celestial: {
        sunlight: Buff;
        moonlight: Buff;
        moonchill: Buff;
        sunfury: Buff;
        lunarAttunement: Buff;
        solarAttunement: Buff;
        moonScorched: Buff;
      };
      cloud: {
        clouds: Buff;
      };
      fist: {
        flow: Buff;
        deadlyFocus: Buff;
        rippleForce: Buff;
        transcendentFocus: Buff;
        weakness: Buff;
        goldenAura: Buff;
      };
      weapon: {
        metalShard: Buff;
        metalFragment: Buff;
        magnetizedMetal: Buff;
        stormOfSteel: Buff;
      };
    };
    guilds: Record<string, Guild>;
    dualCultivationTechniques: IntimateTechnique[];
    enchantments: Enchantment[];
    fallenStars: FallenStar[];
    rooms: Room[];
    researchableMap: Record<string, RecipeItem[]>;
    uncutStones: Record<Realm, UncutStonePool | undefined>;
    mysticalRegionBlessings: Blessing[];
  };
  actions: {
    addBirthBackground: (background: Background) => void;
    addChildBackground: (background: Background) => void;
    addTeenBackground: (background: Background) => void;
    addItem: (item: Item) => void;
    addItemToShop: (
      item: Item,
      stacks: number,
      location: string,
      realm: Realm,
      valueModifier?: number,
      reputation?: ReputationTier,
    ) => void;
    addRecipeToLibrary: (item: RecipeItem) => void;
    addItemToAuction: (
      item: Item,
      chance: number,
      condition: string,
      countOverride?: number,
      countMultiplier?: number,
    ) => void;
    addRecipeToResearch: (baseItem: Item, recipe: RecipeItem) => void;
    addCharacter: (character: Character) => void;
    addBreakthrough: (realm: Realm, breakthrough: Breakthrough) => void;
    addCalendarEvent: (event: CalendarEvent) => void;
    addCraftingTechnique: (technique: CraftingTechnique) => void;
    addDestiny: (destiny: Destiny) => void;
    addTriggeredEvent: (event: TriggeredEvent) => void;
    addCrop: (realm: Realm, crop: Crop) => void;
    addLocation: (location: GameLocation) => void;
    linkLocations: (
      existing: string,
      link: ConditionalLink | ExplorationLink,
    ) => void;
    addManual: (manual: Manual) => void;
    addMineChamber: (
      realm: Realm,
      progress: RealmProgress,
      chamber: MineChamber,
    ) => void;
    addQuest: (quest: Quest) => void;
    addTechnique: (technique: Technique) => void;
    addMusic: (name: string, path: string[]) => void;
    addSfx: (name: string, path: string) => void;
    addGuild: (guild: Guild) => void;
    addDualCultivationTechnique: (technique: IntimateTechnique) => void;
    addEnchantment: (enchantment: Enchantment) => void;
    addFallenStar: (fallenStar: FallenStar) => void;
    addRoom: (room: Room) => void;
    addResearchableRecipe: (baseItem: string, recipe: RecipeItem) => void;
    addUncutStone: (realm: Realm, uncutStone: Item) => void;
    addMysticalRegionBlessing: (blessing: Blessing) => void;
  };
  utils: {
    alpha: (enemy: EnemyEntity) => EnemyEntity;
    alphaPlus: (enemy: EnemyEntity) => EnemyEntity;
    realmbreaker: (enemy: EnemyEntity) => EnemyEntity[];
    corrupted: (enemy: EnemyEntity) => EnemyEntity;
    createCombatEvent: (enemy: LocationEnemy) => LocationEvent;
    createCullingMission: (
      monster: EnemyEntity,
      location: string,
      description: string,
      favour: number,
    ) => Quest;
    createCollectionMission: (
      item: Item,
      location: string,
      description: string,
      favour: number,
    ) => Quest;
    createDeliveryMission: (
      items: Item[],
      count: number,
      location: string,
      description: string,
      preDeliverySteps: EventStep[],
      postDeliverySteps: EventStep[],
      favour: number,
    ) => Quest;
    createHuntQuest: (
      monster: EnemyEntity,
      location: string,
      description: string,
      encounter: string,
      spiritStones: number,
      reputation: number,
      reputationName: string,
      maxReputation: ReputationTier,
      characterEncounter?: CharacterRequestEncounter,
    ) => Quest;
    createPackQuest: (
      monster: EnemyEntity,
      location: string,
      description: string,
      encounter: string,
      spiritStones: number,
      reputation: number,
      reputationName: string,
      maxReputation: ReputationTier,
    ) => Quest;
    createDeliveryQuest: (
      location: string,
      description: string,
      predelivery: EventStep[],
      item: Item,
      amount: number,
      postdelivery: EventStep[],
      spiritStones: number,
      reputation: number,
      reputationName: string,
      maxReputation: ReputationTier,
    ) => Quest;
    createFetchQuest: (
      title: string,
      description: string,
      srcLocation: string,
      srcHint: string,
      srcSteps: EventStep[],
      dstLocation: string,
      dstHint: string,
      dstSteps: EventStep[],
      spiritStones: number,
      reputation: number,
      reputationName: string,
      maxReputation: ReputationTier,
    ) => Quest;
    createQuestionAnswerList: (
      key: string,
      questions: QuestionAnswer[],
      exit: QuestionAnswer,
      showExitOnAllComplete?: boolean,
    ) => EventStep[];
    getExpectedHealth: (realm: Realm, progress: RealmProgress) => number;
    getExpectedPower: (realm: Realm, progress: RealmProgress) => number;
    getExpectedDefense: (realm: Realm, progress: RealmProgress) => number;
    getExpectedBarrier: (realm: Realm, progress: RealmProgress) => number;
    getExpectedToxicity: (realm: Realm, progress: RealmProgress) => number;
    getExpectedPool: (realm: Realm, progress: RealmProgress) => number;
    getExpectedIntensity: (realm: Realm, progress: RealmProgress) => number;
    getExpectedControl: (realm: Realm, progress: RealmProgress) => number;
    getExpectedPlayerPower: (realm: Realm, progress: RealmProgress) => number;
    getExpectedArtefactPower: (realm: Realm, progress: RealmProgress) => number;
    getBreakthroughCharisma: (realm: Realm, mult: number) => number;
    getClothingDefense: (realm: Realm, scale: number) => number;
    getClothingCharisma: (realm: Realm, mult: number) => number;
    getRealmQi: (realm: Realm, realmProgress: RealmProgress) => number;
    getBreakthroughQi: (realm: Realm, realmProgress: RealmProgress) => number;
    getNumericReward: (
      base: number,
      realm: Realm,
      progress: RealmProgress,
    ) => number;
  };
}
```

This contains 3 blocks.

- `data`: This block contains all the current game data, mostly in maps of `name` -> `object`. It is not advised to edit any of the objects in here directly, though that can be done if desired.
- `actions`: This block contains function you can use to register your new content into the game. Note: You need to always 'add' a thing before you use it. e.g. if you want to have an item be purchaseable, you need to call both `addItem` and `addItemToShop`.
- `utils`: This block contains utility functions designed to make it easier to create new content.

#### Assets

If you have any images you want to add to your new content, then the image itself goes in the `src/assets` folder, and then the relative path to that image is used to import it like:

```typescript
import icon from '../assets/image.png';
```

### Step 4: Package your mod

Once you have completed work on your mod, you are ready to package for sharing with others (or for testing in game). To do this, simply run the command `npm run build`. This will compile the content to a single file `mod.js` and all the referenced assets, then zip it up. You can find the final zip in the `builds` folder.

### Step 5: Test your mod

To test the mod, create a new `mods` folder in the root of the game directory (the same one that contains the game exe). Place the zip of your mod into this folder, so the final structure looks like:

```
├── Ascend from Nine Mountains.exe
└── mods/
    └── my-afnm-mod-0.0.1.zip
```

You might also find it useful to enable `devMode` when doing this (so you can see any errors in the console). You can do this by adding a file called `devMode` to this same directory (no extension). This will make the structure look like this:

```
├── Ascend from Nine Mountains.exe
├── devMode
└── mods/
    └── my-afnm-mod-0.0.1.zip
```

To make changes, simply rebuild your mod and place into the folder, then restart the game.

### Step 6: Release your mod to the Steam Workshop

Once you are happy with how your mod behaves, you are ready to release it to the Workshop for others to use. You can find the uploader executable at `/uploader/Mod Uploader 1.0.0 Portable.exe`. Running this will allow you to edit any of your existing uploaded mods, or upload a new one. You can also edit your uploaded mod manually after upload in the steam workshop UI.

### Step 7: Feedback

I am always interested in feedback on the features of the mod framework, so if there's something you are trying to do but aren't able to, then drop me a message on discord or raise an issue in this project. I will always endeavour to made the framework powerful enough to handle all your exciting ideas!

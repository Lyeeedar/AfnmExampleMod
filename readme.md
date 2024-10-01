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
      };
      blossom: {
        fragrantBlossom: Buff;
        fatalFlora: Buff;
        razorBlossom: Buff;
        ironBlossom: Buff;
      };
      celestial: {
        sunlight: Buff;
        moonlight: Buff;
        moonchill: Buff;
        sunfury: Buff;
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
      };
      weapon: {
        metalShard: Buff;
        metalFragment: Buff;
      };
    };
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
    linkLocations: (existing: string, link: ConditionalLink | ExplorationLink) => void;
    addManual: (manual: Manual) => void;
    addMineChamber: (realm: Realm, progress: RealmProgress, chamber: MineChamber) => void;
    addQuest: (quest: Quest) => void;
    addTechnique: (technique: Technique) => void;
  };
  utils: {
    alpha: (enemy: EnemyEntity) => EnemyEntity;
    alphaPlus: (enemy: EnemyEntity) => EnemyEntity;
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
    deriveRecipeDifficulty: (
      realm: Realm,
      realmProgress: RealmProgress,
      difficulty: RecipeDifficulty,
      kind: ItemKind,
    ) => {
      completion: number;
      perfection: number;
      stability: number;
      conditions?: CraftingCondition[];
    };
    getExpectedHealth: (realm: Realm, progress: RealmProgress) => number;
    getExpectedPower: (realm: Realm, progress: RealmProgress) => number;
    getExpectedDefense: (realm: Realm, progress: RealmProgress) => number;
    getExpectedBarrier: (realm: Realm, progress: RealmProgress) => number;
    getExpectedToxicity: (realm: Realm, progress: RealmProgress) => number;
    getExpectedPool: (realm: Realm, progress: RealmProgress) => number;
    getExpectedIntensity: (realm: Realm, progress: RealmProgress) => number;
    getExpectedControl: (realm: Realm, progress: RealmProgress) => number;
    getExpectedArtefactPower: (realm: Realm, progress: RealmProgress) => number;
    getBreakthroughCharisma: (realm: Realm, mult: number) => number;
    getClothingDefense: (realm: Realm, scale: number) => number;
    getClothingCharisma: (realm: Realm, mult: number) => number;
    getRealmQi: (realm: Realm, realmProgress: RealmProgress) => number;
    getBreakthroughQi: (realm: Realm, realmProgress: RealmProgress) => number;
    getNumericReward: (base: number, realm: Realm, progress: RealmProgress) => number;
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

### Step 5: Use your mod

To use the mod, create a new `mods` folder in the root of the game directory (the same one that contains the game exe). Unzip your mod into this folder, so the final structure looks like:

```
├── Ascend from Nine Mountains.exe
└── mods/
    └── my-afnm-mod-0.0.1/
        ├── mod.js
        └── assets/
            └── *.png
```

You might also find it useful to enable `devMode` when doing this (so you can see any errors in the console). You can do this by adding a file called `devMode` to this same directory (no extension). This will make the structure look like this:

```
├── Ascend from Nine Mountains.exe
├── devMode
└── mods/
    └── my-afnm-mod-0.0.1/
        ├── mod.js
        └── assets/
            └── *.png
```

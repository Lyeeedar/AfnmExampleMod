---
layout: default
title: Mod Development
parent: Guides
nav_order: 2
description: 'Building content with the AFNM ModAPI'
---

# Mod Development

## Introduction

Now that your environment is set up, it's time to start building actual content for your mod! This guide covers the ModAPI, its three main components, and how to create your first items, characters, and events.

The root entry point of your mod is `src/modContent/index.ts`. You can split your mod over multiple files, but all must be imported into this root one for the content to be loaded.

At the window level you have access to the ModAPI. This is a set of helpers to allow you to more easily integrate your mod content into the game. It can be accessed from any file in your mod under the `window.modAPI` path.

## Understanding the ModAPI

The ModAPI is your gateway to the game's systems. It's structured into three main sections:

### 1. gameData - The Game's Current State

```typescript
window.modAPI.gameData;
```

This contains all existing game content in maps of `name` → `object`:

- `items` - All current items in the game
- `characters` - NPCs and their data
- `locations` - All game locations
- `techniques` - Combat and cultivation techniques
- `quests` - Available quests
- And much more...

**Important:** Though you 'can' modify these object directly (such as to edit existing content) it is not recommended! Use the `actions` functions instead to have better integration into the game itself.

### 2. actions - Adding Your Content

```typescript
window.modAPI.actions;
```

These functions register your new content into the game:

**Core Content:**

- `addItem(item)` - Add new items
- `addCharacter(character)` - Add NPCs
- `addLocation(location)` - Add new areas
- `addTechnique(technique)` - Add cultivation techniques
- `addQuest(quest)` - Add questlines

**Integration Functions:**

- `addItemToShop(item, stacks, location, ...)` - Make items purchasable
- `addItemToAuction(item, chance, condition, ...)` - Add to auctions
- `linkLocations(existing, link)` - Connect areas
- `addCalendarEvent(event)` - Add seasonal events

**Rule:** Always `add` something before using it elsewhere. For example, call both `addItem()` and `addItemToShop()` to create a purchasable item.

### 3. utils - Helper Functions

```typescript
window.modAPI.utils;
```

Utility functions to make content creation easier:

**Enemy Scaling:**

- `alpha(enemy)` - Create alpha variant (+50% stats)
- `realmbreaker(enemy)` - Create multiple realm variants
- `corrupted(enemy)` - Add corruption effects

**Quest Creation:**

- `createCullingMission(...)` - Kill X enemies quest
- `createDeliveryMission(...)` - Fetch/deliver quest
- `createHuntQuest(...)` - Hunt specific enemy

**Balance Helpers:**

- `getExpectedPower(realm, progress)` - Recommended stats by realm
- `getExpectedHealth(realm, progress)` - HP scaling guidelines
- `getNumericReward(base, realm, progress)` - Scale rewards properly

## Your First Content

### Creating Your First Item

Let's create a simple consumable item:

```typescript
// src/modContent/index.ts
import icon from '../assets/mystic-tea.png';

// Create the item
const mysticTea = {
  name: 'Mystic Tea',
  description: 'A soothing blend that calms the spirit and restores qi.',
  icon,
  rarity: 'Common',
  itemKind: 'Consumable',
  value: 100,
  effects: [
    {
      kind: 'restoreQi',
      amount: { value: 50 },
    },
    {
      kind: 'buffSelf',
      buff: 'calmMind', // Reference to a buff you'll create
      duration: 3,
    },
  ],
};

// Register it with the game
window.modAPI.actions.addItem(mysticTea);

// Make it available in shops
window.modAPI.actions.addItemToShop(
  mysticTea,
  5, // 5 in stock
  'Liang Tiao Village', // Location
  'bodyForging', // Required realm
);
```

### Working with Assets

When you reference images or other assets:

1. **Place the file** in `src/assets/` folder
2. **Import it** at the top of your file
3. **Use the import** in your content

```typescript
import mysticTeaIcon from '../assets/items/mystic-tea.png';
import elderPortrait from '../assets/characters/elder-chen.png';
import locationBackground from '../assets/locations/tea-garden.jpg';

// Then use in your content:
const item = {
  name: 'Mystic Tea',
  icon: mysticTeaIcon, // Use the import
  // ... rest of item definition
};
```

## Advanced Patterns

### Content Organization

As your mod grows, organize your content into logical modules:

```typescript
// src/modContent/index.ts
import { initializeItems } from './items';
import { initializeCharacters } from './characters';
import { initializeLocations } from './locations';
import { initializeQuests } from './quests';

// Initialize all content modules
initializeItems();
initializeCharacters();
initializeLocations();
initializeQuests();
```

```typescript
// src/modContent/items.ts
export function initializeItems() {
  // Create tea-related items
  const mysticTea = {
    /* ... */
  };
  const dragonWellTea = {
    /* ... */
  };

  window.modAPI.actions.addItem(mysticTea);
  window.modAPI.actions.addItem(dragonWellTea);

  // Add to shops
  window.modAPI.actions.addItemToShop(
    mysticTea,
    10,
    'townMarket',
    'bodyForging',
  );
}
```

### Scaling and Balance

Use the utility functions to create properly balanced content:

```typescript
// Create realm-appropriate rewards
const rewardAmount = window.modAPI.utils.getNumericReward(
  100,
  'coreFormation',
  'middle',
);
```

You now have the foundation to create rich, integrated content for AFNM! Continue to learn about packaging and testing your creations.

Next: **[Packaging & Testing](packaging-testing)**

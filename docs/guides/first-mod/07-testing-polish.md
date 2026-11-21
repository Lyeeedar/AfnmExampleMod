---
layout: default
title: Packaging & Testing
parent: Your First Mod
grand_parent: Guides
nav_order: 7
description: 'Package your mod and load it in-game'
---

# Step 7: Packaging & Testing

Your mod is complete! Now let's package it up and get it running in the actual game.

## Checking Your File Structure

Before building, verify every file from the tutorial is in the right place. Relative to your project root, your files should look like this:

```
your-mod-project/                  # Project root (contains package.json)
├── package.json                   # Mod name, version, author (Step 1)
└── src/
    └── modContent/
        ├── index.ts               # Entry point that initializes everything
        ├── items/
        │   └── teaItems.ts        # Tea items & buffs (Step 2)
        ├── crops/
        │   └── teaCrops.ts        # Growable tea crops (Step 2)
        ├── characters/
        │   └── teaMasters.ts      # Master Chen NPC (Step 3)
        ├── locations/
        │   └── teaBrewery.ts      # Tea house building (Step 4)
        ├── quests/
        │   └── teaQuests.ts       # Restoration quest (Step 5)
        └── events/
            └── teaQuestEvents.ts  # Quest distribution trigger (Step 6)
```

## Building Your Mod

Keep the template's `src/mod.ts` as the bundle entry point. It imports `src/modContent/index.ts`, where you connect the tutorial's registration functions.

```typescript
import { initializeTeaItems } from './items/teaItems';
import { initializeTeaCrops } from './crops/teaCrops';
import { initializeTeaCharacters } from './characters/teaMasters';
import { initializeTeaBrewery } from './locations/teaBrewery';
import { initializeTeaQuests } from './quests/teaQuests';
import { initializeTeaQuestEvents } from './events/teaQuestEvents';

function initializeMysticalTeaGarden() {
  console.log('🍵 Initializing Mystical Tea Garden Mod...');

  initializeTeaItems();
  initializeTeaCrops();
  initializeTeaCharacters();
  initializeTeaBrewery();
  initializeTeaQuests();
  initializeTeaQuestEvents();

  console.log('✅ Mystical Tea Garden Mod loaded successfully!');
}

initializeMysticalTeaGarden();
```

Build your mod by running this in a terminal from your **project root** (the folder containing `package.json`):

```bash
npm run build
```

This creates a `.zip` file in your project's `builds/` folder. See [Building Your Mod Package](../packaging-testing#building-your-mod-package) for the expected archive layout.

## Loading Your Mod

1. Find your archive in `builds/`, for example `mystical-tea-garden-1.0.0.zip`.
2. Follow [Installing Your Mod for Testing](../packaging-testing#installing-your-mod-for-testing) to locate `mods/` for your installation. Copy the ZIP there intact.
3. Start the game with the local mod enabled. If you are checking the console, look for the initialization messages from your own code. Then use the test below to verify the registered content is reachable.

## Testing Your Mod In-Game

1. **Create a new character** or use one in Meridian Opening realm or higher

2. **Visit Liang Tiao Village** - you should see the discovery event fire:

   ```
   "As you explore Liang Tiao Village, you notice an elderly man sitting by an abandoned building, looking wistful."
   ```

3. **Check your quest journal** - "The Forgotten Tea House" should appear

4. **Talk to Master Chen** to start the quest

5. **Test the progression**:
   - Collect 5 Green Tea Leaves (buy from shops or grow in herb garden)
   - Return to Master Chen and complete the quest
   - Verify his shop opens with tea items
   - Visit the Tea House building (if you added locations)

## Congratulations!

You've successfully created and deployed a complete AFNM mod! Your tea house mod demonstrates:

- ✅ Items with buffs and effects
- ✅ Growable crops for the herb garden
- ✅ NPCs with dialogue and shops
- ✅ Custom locations with interactive systems
- ✅ Quest systems with proper progression
- ✅ Triggered events for natural discovery

This foundation can be extended with additional teas, more complex quests, seasonal content, and quests. Happy modding!

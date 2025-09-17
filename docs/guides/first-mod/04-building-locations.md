---
layout: default
title: Building Locations
parent: Your First Mod
grand_parent: Guides
nav_order: 4
description: 'Creating interactive buildings and location content'
---

# Step 4: Building Locations

With items and characters ready, we need a place for players to interact with them. In AFNM, locations can contain buildings that provide services, interactive events, and atmospheric content. Let's create Master Chen's tea house as a custom building.

## Understanding Location vs Building

In AFNM's architecture:
- **Locations** are world map areas like "Liang Tiao Village"
- **Buildings** are interactive structures within locations like "Tea House"

Since Liang Tiao Village already exists in the base game, we'll add our tea house as a [custom building](../../locations/building-types.md#custom-buildings) rather than creating a new location.

## Building System Overview

The [building types documentation](../../locations/building-types.md) shows that AFNM supports many building types. For our tea house, we'll use a **custom building** because we need:

1. **Interactive brewing system** - Transform raw tea leaves into consumable teas
2. **Character interactions** - Access Master Chen's dialogue and shop
3. **Quest-gated content** - Only appears after completing the discovery quest

## Creating the Tea House Building

Create `src/modContent/locations/teaBrewery.ts`:

```typescript
import { CustomBuilding, EventStep } from 'afnm-types';
import { greenTeaLeaves, jasmineTeaLeaves, brewedGreenTea, brewedJasmineTea } from '../items/teaItems';

// Tea House Interactive Events
const teaHouseSteps: EventStep[] = [
  {
    kind: 'text',
    text: 'You enter Master Chen\'s restored tea house. The atmosphere is serene, with the gentle aroma of carefully brewed teas filling the air.',
  },
  {
    kind: 'choice',
    choices: [
      {
        text: `Brew Green Tea (Requires 3 ${greenTeaLeaves.name})`,
        condition: {
          kind: 'item',
          item: { name: greenTeaLeaves.name },
          amount: 3,
        },
        children: [
          {
            kind: 'removeItem',
            item: { name: greenTeaLeaves.name },
            amount: '3',
          },
          {
            kind: 'addItem',
            item: { name: brewedGreenTea.name },
            amount: '1',
          },
          {
            kind: 'text',
            text: 'You carefully steep the green tea leaves in perfectly heated water. The gentle brewing process creates a calming, aromatic tea.',
          },
        ],
      },
      {
        text: `Brew Jasmine Tea (Requires 2 ${jasmineTeaLeaves.name})`,
        condition: {
          kind: 'item',
          item: { name: jasmineTeaLeaves.name },
          amount: 2,
        },
        children: [
          {
            kind: 'removeItem',
            item: { name: jasmineTeaLeaves.name },
            amount: '2',
          },
          {
            kind: 'addItem',
            item: { name: brewedJasmineTea.name },
            amount: '1',
          },
          {
            kind: 'text',
            text: 'The delicate jasmine flowers release their essence into the hot water, creating a spiritually uplifting brew that enhances one\'s qi awareness.',
          },
        ],
      },
      {
        text: 'Learn about tea brewing techniques',
        children: [
          {
            kind: 'text',
            text: 'Master Chen explains: "The art of tea brewing is meditation in motion. Each leaf must be treated with respect, each temperature precisely controlled. Only through harmony between cultivator and tea can true spiritual benefits be achieved."',
          },
        ],
      },
      {
        text: 'Talk to Master Chen',
        showCondition: 'teaHouseUnlocked == 1',
        children: [
          {
            kind: 'talkToCharacter',
            character: 'Master Chen',
          },
        ],
      },
      {
        text: 'Visit Master Chen\'s shop',
        showCondition: 'teaHouseUnlocked == 1',
        children: [
          {
            kind: 'tradeWithCharacter',
            character: 'Master Chen',
          },
        ],
      },
      {
        text: 'Leave the tea house',
        children: [
          {
            kind: 'text',
            text: 'You bow respectfully and leave the peaceful tea house.',
          },
        ],
      },
    ],
  },
];

// Tea House Building Definition
export const teaHouseBuilding: CustomBuilding = {
  kind: 'custom',
  name: 'Master Chen\'s Tea House',
  icon: 'https://placeholder-icon.png',
  position: 'middleright',
  condition: 'teaHouseUnlocked == 1',
  eventSteps: teaHouseSteps,
};

export function initializeTeaBrewery() {
  console.log('🍵 Adding tea house to Liang Tiao Village...');

  // Add building to existing location
  const liangTiaoVillage = window.modAPI.gameData.locations['Liang Tiao Village'];

  if (liangTiaoVillage) {
    if (!liangTiaoVillage.buildings) {
      liangTiaoVillage.buildings = [];
    }
    liangTiaoVillage.buildings.push(teaHouseBuilding);
    console.log('✅ Added Tea House building to Liang Tiao Village');
  } else {
    console.warn('⚠️ Liang Tiao Village not found');
  }
}
```

## Understanding Custom Buildings

### Building Definition
Custom buildings use the [CustomBuilding interface](../../locations/building-types.md#custom-buildings):

```typescript
{
  kind: 'custom',              // Building type
  name: string,                // Display name
  icon: string,                // Visual icon
  position: BuildingPosition,  // Screen placement
  condition?: string,          // Availability condition
  eventSteps: EventStep[]      // Interactive content
}
```

### Building Position
The [building documentation](../../locations/building-types.md#custom-buildings) shows available positions:

- **Top row**: `'topleft'`, `'top'`, `'topright'`
- **Below top**: `'belowtopleft'`, `'belowtop'`, `'belowtopright'`
- **Middle row**: `'middleleft'`, `'middle'`, `'middleright'`
- **Bottom row**: `'bottomleft'`, `'bottom'`, `'bottomright'`

We use `'middleright'` to place the tea house prominently but not centrally.

### Conditional Availability
```typescript
condition: 'teaHouseUnlocked == 1'
```

This uses [flag expressions](../../concepts/flags.md) to only show the building after quest completion. Players must discover and restore the tea house before they can use it.

## Interactive Event System

The tea house uses [EventSteps](../../events/event-steps.md) to create interactive content:

### Item-Based Crafting
```typescript
{
  text: `Brew Green Tea (Requires 3 ${greenTeaLeaves.name})`,
  condition: {
    kind: 'item',           // Check player inventory
    item: { name: greenTeaLeaves.name },
    amount: 3,
  },
  children: [
    {
      kind: 'removeItem',   // Consume ingredients
      item: { name: greenTeaLeaves.name },
      amount: '3',
    },
    {
      kind: 'addItem',      // Create product
      item: { name: brewedGreenTea.name },
      amount: '1',
    }
  ]
}
```

Players can transform - players convert raw materials into finished goods.

### Character Interactions
```typescript
{
  text: 'Talk to Master Chen',
  showCondition: 'teaHouseUnlocked == 1',
  children: [
    {
      kind: 'talkToCharacter',
      character: 'Master Chen',
    },
  ],
}
```

The `talkToCharacter` step connects to our Master Chen character, triggering his dialogue interaction.

### Trading System
```typescript
{
  text: 'Visit Master Chen\'s shop',
  children: [
    {
      kind: 'tradeWithCharacter',
      character: 'Master Chen',
    },
  ],
}
```

The `tradeWithCharacter` step activates the character's shop interaction.

## Choice Conditions vs Show Conditions

Notice two different condition types:

### Choice Conditions
```typescript
condition: {
  kind: 'item',
  item: { name: greenTeaLeaves.name },
  amount: 3,
}
```
**Complex objects** that check game state. If condition fails, choice is disabled but still visible.

### Show Conditions
```typescript
showCondition: 'teaHouseUnlocked == 1'
```
**Simple strings** using [flag expressions](../../concepts/flags.md). If condition fails, choice is completely hidden.

## Adding Buildings to Existing Locations

Since we're modifying an existing location rather than creating new one, we access it through the [ModAPI gameData](../../concepts/modapi.md#game-data-access):

```typescript
// Access existing location
const liangTiaoVillage = window.modAPI.gameData.locations['Liang Tiao Village'];

if (liangTiaoVillage) {
  // Ensure buildings array exists
  if (!liangTiaoVillage.buildings) {
    liangTiaoVillage.buildings = [];
  }

  // Add our custom building
  liangTiaoVillage.buildings.push(teaHouseBuilding);
}
```

**Always check for existence** - locations might not exist if base game changes or other mods modify them.

## Design Principles for Interactive Buildings

### Meaningful Choices
Each interaction should serve a purpose:
- **Brewing** transforms materials into useful consumables
- **Learning** provides world-building and gameplay education
- **Character access** connects to established NPC systems

### Resource Economics
The brewing system creates value chains:
```
Raw Materials → Brewing Process → Finished Products
(3 tea leaves) → (player action) → (1 brewed tea with buffs)
```

This **3:1 conversion ratio** makes brewing worthwhile while consuming excess materials.

### Atmospheric Writing
Each interaction includes descriptive text that:
- **Sets the mood** - "serene atmosphere with gentle aroma"
- **Explains mechanics** - "meditation in motion"
- **Provides feedback** - "creating a calming, aromatic tea"

## Updating Your Main Index

Update `src/modContent/index.ts` to initialize the tea house:

```typescript
import { initializeTeaItems } from './items/teaItems';
import { initializeTeaCharacters } from './characters/teaMasters';
import { initializeTeaBrewery } from './locations/teaBrewery';

function initializeMysticalTeaGarden() {
  console.log('🍵 Initializing Mystical Tea Garden Mod...');

  // Order is critical for dependencies
  initializeTeaItems();       // Items first
  initializeTeaCharacters();  // Characters second (reference items)
  initializeTeaBrewery();     // Locations third (reference items & characters)

  console.log('✅ Mystical Tea Garden Mod loaded successfully!');
}
```

## Location Integration Patterns

### Quest-Gated Content
```typescript
condition: 'questFlag == 1'  // Only after quest completion
```

### Progressive Unlocks
```typescript
// Basic version available early
condition: 'discovered == 1',

// Advanced version requires progression
condition: 'discovered == 1 && realm >= 3'
```

### Seasonal Content
```typescript
condition: 'yearMonth >= 3 && yearMonth <= 5'  // Spring only
```

## Alternative Building Types

If your content needs differ, consider other [building types](../../locations/building-types.md):

### Market Building
For simple item sales:
```typescript
{
  kind: 'market',
  itemPool: {
    meridianOpening: [greenTeaLeaves]
  }
}
```

### Recipe Library
For crafting instructions:
```typescript
{
  kind: 'recipe',
  recipePool: {
    qiCondensation: ['tea_brewing_manual']
  }
}
```

### Library Building
For lore and world-building:
```typescript
{
  kind: 'library',
  categories: [
    {
      name: 'Tea Cultivation',
      books: [...]
    }
  ]
}
```

## Common Building Mistakes

### Missing Location Checks
```typescript
// WRONG - will crash if location doesn't exist
const village = window.modAPI.gameData.locations['Village'];
village.buildings.push(myBuilding);

// RIGHT - defensive programming
const village = window.modAPI.gameData.locations['Village'];
if (village) {
  if (!village.buildings) village.buildings = [];
  village.buildings.push(myBuilding);
}
```

### Overly Complex Event Trees
```typescript
// WRONG - confusing nested choices
{
  kind: 'choice',
  choices: [
    {
      text: 'Brewing submenu',
      children: [
        {
          kind: 'choice',  // Nested choice within choice
          choices: [...]   // Too many layers
        }
      ]
    }
  ]
}

// RIGHT - flat, clear structure
{
  kind: 'choice',
  choices: [
    { text: 'Brew Green Tea', children: [...] },
    { text: 'Brew Jasmine Tea', children: [...] },
    { text: 'Learn Techniques', children: [...] }
  ]
}
```

### Inconsistent Condition Types
```typescript
// WRONG - mixing condition types
condition: 'hasItems == 1',      // String condition
condition: { kind: 'item', ... } // Object condition - wrong place

// RIGHT - use appropriate condition type for context
showCondition: 'hasItems == 1',  // String for show/hide
condition: { kind: 'item', ... }  // Object for complex checks
```

## Next Steps

With our interactive tea house complete, we need quests to guide players through discovering and using it. Let's create [the quest system](05-quest-system.md) that will:

- Guide players to discover the abandoned tea house
- Create a restoration storyline with Master Chen
- Unlock the building's full functionality
- Provide meaningful rewards and progression

The quest system will tie together all our previous work - items, characters, and locations.

## Troubleshooting

**Building not appearing**: Check the `condition` flag is set correctly and verify the target location exists.

**Interactions not working**: Ensure `character` names in `talkToCharacter` steps match exactly with character definitions.

**Item conditions failing**: Verify item names match exactly, including capitalization and punctuation.

**TypeScript errors**: Use `getDiagnostics` to identify specific interface requirement issues.
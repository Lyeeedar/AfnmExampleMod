---
layout: default
title: Adding Characters
parent: Your First Mod
grand_parent: Guides
nav_order: 3
description: 'Creating NPCs with dialogue, shops, and interactions'
---

# Step 3: Adding Characters

Now that we have items, we need NPCs to interact with them. Characters in AFNM are complex entities that can have dialogue, shops, combat stats, and location-based behaviors. Let's create Master Chen, our tea house proprietor.

## Understanding Character Architecture

The [Character System documentation](../../characters/character-structure.md) shows that AFNM characters use a sophisticated multi-definition system. Characters can have different behaviors, stats, and interactions based on game conditions like player realm or story progress.

### Core Character Structure

Every character needs:
- **Basic identity** (name, bio, images)
- **Availability condition** (when the character appears)
- **Character definitions** (realm-specific behaviors and stats)

### Character Definition Types

Characters can have three types of definitions:
- **`neutral`** - Peaceful NPCs with dialogue and shops
- **`enemy`** - Hostile characters for combat encounters
- **`companion`** - Followers who can join your party

For Master Chen, we'll use a `neutral` definition since he's a peaceful merchant.

## Creating Master Chen

Create `src/modContent/characters/teaMasters.ts`:

```typescript
import { Character, EventStep } from 'afnm-types';
import { greenTeaLeaves, jasmineTeaLeaves, brewedGreenTea } from '../items/teaItems';

// Master Chen's dialogue when talked to
const talkToMasterChenSteps: EventStep[] = [
  {
    kind: 'speech',
    character: 'Master Chen',
    text: 'Welcome to my humble tea house, young cultivator. The way of tea is a path to inner harmony and spiritual balance.',
  },
  {
    kind: 'choice',
    choices: [
      {
        text: 'Tell me about tea cultivation',
        children: [
          {
            kind: 'speech',
            character: 'Master Chen',
            text: 'Tea cultivation is not merely about growing plants - it is about nurturing qi within nature itself. Each leaf must be tended with patience and respect.',
          },
          {
            kind: 'text',
            text: 'Master Chen\'s eyes gleam with wisdom as he speaks of the ancient tea cultivation techniques.',
          },
        ],
      },
      {
        text: 'What makes your tea special?',
        children: [
          {
            kind: 'speech',
            character: 'Master Chen',
            text: 'My teas are infused with qi through careful cultivation and brewing techniques passed down through generations. Each cup can aid a cultivator\'s meditation.',
          },
        ],
      },
      {
        text: 'Thank you for your wisdom',
        children: [
          {
            kind: 'speech',
            character: 'Master Chen',
            text: 'May the path of tea bring you clarity in your cultivation journey.',
          },
        ],
      },
    ],
  },
];

const shopWithMasterChenSteps: EventStep[] = [
  {
    kind: 'text',
    text: 'Master Chen presents his finest tea leaves and brewing supplies.',
  },
];

export const masterChen: Character = {
  name: 'Master Chen',
  displayName: 'Master Chen',
  allegiance: undefined, // Independent character
  bio: 'A venerable tea master who has spent decades perfecting the art of cultivation through tea. His knowledge of tea brewing and its spiritual benefits is unmatched in the region.',
  condition: '1', // Always available once added
  portrait: 'https://placeholder-portrait.png',
  image: 'https://placeholder-character.png',
  definitions: [
    {
      kind: 'neutral',
      condition: '1', // This definition is always active
      realm: 'qiCondensation',
      realmProgress: 'Late',

      // Combat stats (if player fights Master Chen)
      stats: [
        {
          condition: '1',
          stats: {
            difficulty: 'medium',
            battleLength: 'medium',
            stances: [], // No combat techniques - peaceful character
            stanceRotation: [],
            rotationOverrides: [],
            drops: [
              {
                item: greenTeaLeaves,
                amount: 2,
                chance: 0.5,
              },
            ],
          },
        },
      ],

      // Where to find Master Chen
      locations: [
        {
          kind: 'static',
          condition: '1',
          location: 'Liang Tiao Village',
        },
      ],

      encounters: [], // No random encounters

      // Dialogue interaction
      talkInteraction: [
        {
          condition: '1',
          event: talkToMasterChenSteps,
        },
      ],

      // Shop interaction - only available after tea house is unlocked
      shopInteraction: [
        {
          condition: 'teaHouseUnlocked == 1',
          stock: {
            mundane: [],
            bodyForging: [],
            meridianOpening: [
              greenTeaLeaves,
            ],
            qiCondensation: [
              jasmineTeaLeaves,
              brewedGreenTea,
            ],
            coreFormation: [],
            pillarCreation: [],
            lifeFlourishing: [],
            worldShaping: [],
            innerGenesis: [],
            soulAscension: [],
          },
          costMultiplier: 1.2, // 20% markup
          introSteps: shopWithMasterChenSteps,
          exitSteps: [
            {
              kind: 'text',
              text: 'Master Chen bows respectfully as you complete your purchase.',
            },
          ],
        },
      ],
    },
  ],
};
```

## Understanding Character Components

### Character Identity
```typescript
name: 'Master Chen',        // Unique identifier - used in scripts and references
displayName: 'Master Chen', // What players see (can be different from name)
allegiance: undefined,      // Faction (undefined = independent)
bio: 'A venerable tea master...' // Character description for tooltips
```

### Availability Conditions
Characters use [flag expressions](../../concepts/flags.md) to control when they appear:
```typescript
condition: '1',  // Always available
condition: 'questComplete == 1', // Only after completing a quest
condition: 'realm >= 3', // Only for Core Formation+ players
```

### Character Definitions

The [character structure](../../characters/character-structure.md#character-definitions) explains that definitions allow different behaviors based on conditions. Our Master Chen has one neutral definition that's always active.

#### Realm and Progress
```typescript
realm: 'qiCondensation',      // Character's cultivation level
realmProgress: 'Late',        // Early/Middle/Late stage
```
This affects the character's power level and appropriate interactions.

#### Combat Stats
Even peaceful characters need combat stats in case players fight them:
```typescript
stats: [{
  condition: '1',
  stats: {
    difficulty: 'medium',        // How challenging to fight
    battleLength: 'medium',      // How long combat lasts
    stances: [],                 // Combat techniques (empty = peaceful)
    drops: [...]                 // What they drop when defeated
  }
}]
```

### Location System

Characters use the [location system](../../characters/character-structure.md#location-system) to move through the world:

```typescript
locations: [{
  kind: 'static',           // Stays in one place
  condition: '1',           // When this location applies
  location: 'Liang Tiao Village'  // Where to find them
}]
```

Alternative location types:
- **`wander`** - Follows a set route between locations
- **`random`** - Randomly moves between specified locations

### Interaction Systems

Characters support multiple interaction types:

#### Talk Interaction
```typescript
talkInteraction: [{
  condition: '1',                    // When dialogue is available
  event: talkToMasterChenSteps       // Dialogue event steps
}]
```

#### Shop Interaction
```typescript
shopInteraction: [{
  condition: 'teaHouseUnlocked == 1',    // Shop only after quest
  stock: {                               // Items organized by realm
    meridianOpening: [greenTeaLeaves],
    qiCondensation: [jasmineTeaLeaves, brewedGreenTea]
  },
  costMultiplier: 1.2,                   // 20% markup
  introSteps: [...],                     // Opening dialogue
  exitSteps: [...]                       // Closing dialogue
}]
```

## Shop Stock Organization

Notice how shop stock is organized by [cultivation realm](../../concepts/scaling.md). This creates natural progression - higher realm items are only available to players who have reached that level.

**All realms must be specified** (even if empty) to satisfy the TypeScript interface:
```typescript
stock: {
  mundane: [],           // Available to all players
  bodyForging: [],       // Starting realm
  meridianOpening: [...], // Second realm items
  qiCondensation: [...],  // Third realm items
  coreFormation: [],     // Fourth realm
  pillarCreation: [],    // Fifth realm
  lifeFlourishing: [],   // Sixth realm
  worldShaping: [],      // Seventh realm
  innerGenesis: [],      // Eighth realm
  soulAscension: [],     // Final realm
}
```

## Creating Dialogue Trees

The dialogue system uses [EventSteps](../../events/event-steps.md) to create interactive conversations:

```typescript
{
  kind: 'choice',
  choices: [
    {
      text: 'Tell me about tea cultivation',  // Player choice
      children: [                            // What happens if chosen
        {
          kind: 'speech',                    // NPC speaks
          character: 'Master Chen',
          text: 'Tea cultivation is...'
        },
        {
          kind: 'text',                      // Narrative text
          text: 'Master Chen\'s eyes gleam...'
        }
      ]
    }
  ]
}
```

### Best Practices for Dialogue

1. **Vary sentence structure** - Mix short and long sentences
2. **Show character personality** - Each NPC should have a distinct voice
3. **Provide useful information** - Help players understand game mechanics
4. **Include world-building** - Add lore that makes the world feel alive

## Registering the Character

```typescript
export const allTeaCharacters: Character[] = [masterChen];

export function initializeTeaCharacters() {
  console.log('👤 Adding tea master characters...');

  allTeaCharacters.forEach((character) => {
    window.modAPI.actions.addCharacter(character);
  });

  console.log(`✅ Added ${allTeaCharacters.length} tea characters`);
}
```

Characters must be registered through the [ModAPI](../../concepts/modapi.md#characters-and-backgrounds) to appear in-game.

## Updating Your Main Index

Update `src/modContent/index.ts` to initialize characters:

```typescript
import { initializeTeaItems } from './items/teaItems';
import { initializeTeaCharacters } from './characters/teaMasters';

function initializeMysticalTeaGarden() {
  console.log('🍵 Initializing Mystical Tea Garden Mod...');

  // Items first - characters reference them in shops
  initializeTeaItems();

  // Characters second - locations reference them
  initializeTeaCharacters();

  console.log('✅ Mystical Tea Garden Mod loaded successfully!');
}
```

## Character Design Principles

### Meaningful Interactions
Every interaction should serve a purpose:
- **Dialogue** reveals character personality and world lore
- **Shop** provides useful items with logical pricing
- **Location** makes sense for the character's role

### Conditional Complexity
Use conditions to create progression:
```typescript
// Shop unlocks after quest completion
condition: 'teaHouseUnlocked == 1'

// Different dialogue based on player progress
condition: 'realm >= 3 && metBefore == 0'
```

### Economic Balance
Shop pricing should reflect item value:
- **`costMultiplier: 1.0`** - Fair prices for basic merchants
- **`costMultiplier: 1.2`** - Premium for specialists like Master Chen
- **`costMultiplier: 0.8`** - Discount for faction allies

## Common Character Mistakes

### Missing Realm Stock Entries
```typescript
// WRONG - will cause TypeScript errors
stock: {
  meridianOpening: [someItem]
  // Missing other realms
}

// RIGHT - all realms specified
stock: {
  mundane: [],
  bodyForging: [],
  meridianOpening: [someItem],
  qiCondensation: [],
  // ... etc
}
```

### Overpowered Shop Items
```typescript
// WRONG - high-tier item in basic shop
meridianOpening: [powerfulSword]

// RIGHT - items match realm progression
qiCondensation: [enhancedSword],
coreFormation: [powerfulSword]
```

### Bland Dialogue
```typescript
// WRONG - generic, boring
text: 'Hello. I sell items.'

// RIGHT - character personality and world-building
text: 'Welcome, young cultivator. Each tea leaf here has been blessed by decades of careful cultivation.'
```

## Next Steps

With Master Chen created, we need somewhere for him to conduct business. Let's create [the tea house building](04-building-locations.md) where players can:

- Brew teas from raw materials
- Purchase items from Master Chen's shop
- Experience the restored atmosphere after completing quests

The location system will reference both our items and character, to create the complete tea house experience.

## Troubleshooting

**Character not appearing**: Check the `condition` field and ensure any referenced flags are set correctly.

**Shop not working**: Verify `shopInteraction` condition and ensure all realm stock entries are present.

**Dialogue errors**: Check that `character` names in `speech` events match the character's `name` field exactly.

**TypeScript errors**: Run `npx tsc --noEmit` to see specific error messages and verify all required interface fields are present.
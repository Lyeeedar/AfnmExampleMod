---
layout: default
title: Quest System
parent: Your First Mod
grand_parent: Guides
nav_order: 5
description: 'Creating multi-step quests with events and progression'
---

# Step 5: Quest System

Quests tie all your mod content together into a cohesive player experience. AFNM's quest system is powerful and flexible, supporting everything from simple collection tasks to complex multi-branched storylines. Let's create two quests that guide players through discovering and restoring our tea house.

## Understanding Quest Architecture

The [Quest System documentation](../../quests/index.md) shows that quests consist of:

1. **Basic metadata** (name, description, category)
2. **Sequential steps** that players must complete
3. **Rewards** given upon completion
4. **Optional conditions** for failure or gating

Our tea house story needs two connected quests:
- **"The Forgotten Tea House"** - Discovery and initial exploration
- **"Master of Tea"** - Restoration and meeting Master Chen

## Quest Categories

The [quest structure guide](../../quests/quest-structure.md#category-system) defines six quest categories:

- **`main`** - Core storyline progression
- **`side`** - Optional character stories and world building
- **`missionHall`** - Sect-based assignments
- **`craftingHall`** - Artisan skill development
- **`requestBoard`** - Community needs
- **`guild`** - Organization-specific content

Our tea house quests fit perfectly in the **`side`** category - they're optional character-driven stories that build the world.

## Creating the Discovery Quest

Create `src/modContent/quests/teaQuests.ts`:

```typescript
import { Quest, EventStep } from 'afnm-types';
import { greenTeaLeaves, brewedGreenTea } from '../items/teaItems';

// First quest: Discovering the tea house
const teaHouseDiscoveryEvents: EventStep[] = [
  {
    kind: 'text',
    text: 'While exploring Liang Tiao Village, you notice an old building with a faded sign depicting a tea cup.',
  },
  {
    kind: 'choice',
    choices: [
      {
        text: 'Investigate the building',
        children: [
          {
            kind: 'text',
            text: 'Pushing open the wooden door, you discover a dusty but well-preserved tea house. Ancient brewing equipment sits covered in cloth.',
          },
          {
            kind: 'choice',
            choices: [
              {
                text: 'Search for clues about the owner',
                children: [
                  {
                    kind: 'text',
                    text: 'Among the dust, you find a letter written in elegant calligraphy. It mentions Master Chen, a tea cultivator who once ran this establishment.',
                  },
                  {
                    kind: 'flag',
                    flag: 'foundTeaHouseClue',
                    value: '1',
                    global: true,
                  },
                ],
              },
              {
                text: 'Clean up the tea house',
                showCondition: 'foundTeaHouseClue == 1',
                children: [
                  {
                    kind: 'text',
                    text: 'You spend time clearing away dust and arranging the tea brewing equipment. The house begins to look welcoming again.',
                  },
                  {
                    kind: 'flag',
                    flag: 'cleanedTeaHouse',
                    value: '1',
                    global: true,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        text: 'Leave for now',
        children: [
          {
            kind: 'text',
            text: 'You decide to come back later when you have more time to investigate.',
          },
        ],
      },
    ],
  },
];

export const discoverTeaHouseQuest: Quest = {
  name: 'The Forgotten Tea House',
  description: 'Investigate the mysterious old building in Liang Tiao Village and uncover its secrets.',
  category: 'side',
  steps: [
    {
      kind: 'event',
      hint: 'Discover the abandoned tea house',
      event: {
        location: 'Liang Tiao Village',
        steps: teaHouseDiscoveryEvents,
      },
    },
    {
      kind: 'condition',
      hint: 'Find clues about the owner',
      completionCondition: 'foundTeaHouseClue == 1',
    },
    {
      kind: 'condition',
      hint: 'Clean the tea house',
      completionCondition: 'cleanedTeaHouse == 1',
    },
  ],
  rewards: [
    {
      kind: 'item',
      item: { name: greenTeaLeaves.name },
      amount: 5,
    },
  ],
};
```

## Understanding Quest Steps

Our discovery quest uses three [quest step types](../../quests/quest-steps.md):

### Event Quest Step
```typescript
{
  kind: 'event',
  hint: 'Discover the abandoned tea house',
  event: {
    location: 'Liang Tiao Village',
    steps: teaHouseDiscoveryEvents,
  },
}
```

**Event steps** are the most powerful quest step type. They present full interactive narratives with:
- **Dialogue and choices** that affect the story
- **Flag management** to track player decisions
- **World-building** that makes locations feel alive

### Condition Quest Step
```typescript
{
  kind: 'condition',
  hint: 'Find clues about the owner',
  completionCondition: 'foundTeaHouseClue == 1',
}
```

**Condition steps** wait for specific [flag expressions](../../concepts/flags.md) to become true. They're perfect for:
- **Gating progression** behind specific player actions
- **Tracking discoveries** like finding clues
- **Ensuring completion** of important story beats

## Event System Integration

Our quest events use the [Event System](../../events/index.md) extensively:

### Progressive Choices
```typescript
{
  text: 'Clean up the tea house',
  showCondition: 'foundTeaHouseClue == 1',  // Only after finding clues
  children: [...]
}
```

The `showCondition` creates **progressive revelation** - players must find clues before they can clean the house.

### Global Flag Management
```typescript
{
  kind: 'flag',
  flag: 'foundTeaHouseClue',
  value: '1',
  global: true,    // Persists across game saves
}
```

**Always use `global: true`** for quest flags. Without it, flags disappear when the game restarts.

### Atmospheric Writing
Each event step includes descriptive text that:
- **Sets the scene** - "faded sign depicting a tea cup"
- **Creates mystery** - "letter written in elegant calligraphy"
- **Shows progress** - "begins to look welcoming again"

## Creating the Restoration Quest

Let's add a second quest that continues the story:

```typescript
// Second quest: Restoring the tea house
const findMasterChenEvents: EventStep[] = [
  {
    kind: 'text',
    text: 'Based on the letter you found, you begin searching for Master Chen around Liang Tiao Village.',
  },
  {
    kind: 'choice',
    choices: [
      {
        text: 'Ask the villagers about Master Chen',
        children: [
          {
            kind: 'text',
            text: 'The villagers speak fondly of Master Chen. "He used to run the finest tea house in the village," one elder tells you. "He\'s been living quietly near the village outskirts since it closed."',
          },
          {
            kind: 'flag',
            flag: 'learnedAboutMasterChen',
            value: '1',
            global: true,
          },
        ],
      },
      {
        text: 'Visit the village outskirts',
        showCondition: 'learnedAboutMasterChen == 1',
        children: [
          {
            kind: 'text',
            text: 'You find Master Chen tending to a small tea garden behind a modest dwelling. He looks up as you approach.',
          },
          {
            kind: 'speech',
            character: 'Master Chen',
            text: 'Ah, a young cultivator. I sense you have discovered my old tea house. It has been many years since I last brewed there.',
          },
          {
            kind: 'choice',
            choices: [
              {
                text: 'Ask him to reopen the tea house',
                children: [
                  {
                    kind: 'speech',
                    character: 'Master Chen',
                    text: 'Reopen the tea house... it would require much work. The equipment needs restoration, and I would need fresh tea leaves to begin brewing again.',
                  },
                  {
                    kind: 'speech',
                    character: 'Master Chen',
                    text: 'If you could bring me 10 Green Tea Leaves to start with, I would consider returning to my old establishment.',
                  },
                  {
                    kind: 'flag',
                    flag: 'masterChenRequest',
                    value: '1',
                    global: true,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

const completeTeaHouseRestoration: EventStep[] = [
  {
    kind: 'removeItem',
    item: { name: greenTeaLeaves.name },
    amount: '10',
  },
  {
    kind: 'speech',
    character: 'Master Chen',
    text: 'Excellent! These tea leaves are of fine quality. With these, I can begin brewing once more.',
  },
  {
    kind: 'speech',
    character: 'Master Chen',
    text: 'I will return to the tea house and restore it to its former glory. Thank you for reminding an old man of his purpose.',
  },
  {
    kind: 'flag',
    flag: 'teaHouseUnlocked',
    value: '1',
    global: true,
  },
  {
    kind: 'addItem',
    item: { name: brewedGreenTea.name },
    amount: '3',
  },
];

export const restoreTeaHouseQuest: Quest = {
  name: 'Master of Tea',
  description: 'Help Master Chen restore his tea house to its former glory.',
  category: 'side',
  steps: [
    {
      kind: 'event',
      hint: 'Find Master Chen',
      event: {
        location: 'Liang Tiao Village',
        steps: findMasterChenEvents,
      },
    },
    {
      kind: 'condition',
      hint: 'Learn about Master Chen\'s request',
      completionCondition: 'masterChenRequest == 1',
    },
    {
      kind: 'collect',
      hint: 'Gather 10 Green Tea Leaves',
      item: greenTeaLeaves.name,
      amount: 10,
    },
    {
      kind: 'speakToCharacter',
      hint: 'Bring the tea leaves to Master Chen',
      character: 'Master Chen',
      event: completeTeaHouseRestoration,
    },
  ],
  rewards: [
    {
      kind: 'item',
      item: { name: brewedGreenTea.name },
      amount: 3,
    },
    {
      kind: 'money',
      amount: 500,
    },
  ],
};
```

## Advanced Quest Step Types

The restoration quest demonstrates additional [quest step types](../../quests/quest-steps.md):

### Collect Quest Step
```typescript
{
  kind: 'collect',
  hint: 'Gather 10 Green Tea Leaves',
  item: greenTeaLeaves.name,
  amount: 10,
}
```

**Collect steps** track specific items in the player's inventory. They complete automatically when the player has enough items.

### Speak to Character Quest Step
```typescript
{
  kind: 'speakToCharacter',
  hint: 'Bring the tea leaves to Master Chen',
  character: 'Master Chen',
  event: completeTeaHouseRestoration,
}
```

**Speak steps** require talking to specific NPCs. They can include custom events that trigger during the conversation.

## Quest Rewards

The [quest structure](../../quests/quest-structure.md) supports multiple reward types:

### Item Rewards
```typescript
{
  kind: 'item',
  item: { name: brewedGreenTea.name },
  amount: 3,
}
```

### Money Rewards
```typescript
{
  kind: 'money',
  amount: 500,
}
```

Other reward types include:
- **`technique`** - Combat abilities
- **`recipe`** - Crafting recipes
- **`reputation`** - Faction standing
- **`experience`** - Cultivation progress

## Registering Quests

```typescript
export const allTeaQuests: Quest[] = [discoverTeaHouseQuest, restoreTeaHouseQuest];

export function initializeTeaQuests() {
  console.log('📜 Adding tea house quests...');

  allTeaQuests.forEach((quest) => {
    window.modAPI.actions.addQuest(quest);
  });

  console.log(`✅ Added ${allTeaQuests.length} tea quests`);
}
```

Quests must be registered through the [ModAPI](../../concepts/modapi.md#world-content) before they can be distributed to players.

## Updating Your Main Index

Update `src/modContent/index.ts` to initialize quests:

```typescript
import { initializeTeaItems } from './items/teaItems';
import { initializeTeaCharacters } from './characters/teaMasters';
import { initializeTeaBrewery } from './locations/teaBrewery';
import { initializeTeaQuests } from './quests/teaQuests';

function initializeMysticalTeaGarden() {
  console.log('🍵 Initializing Mystical Tea Garden Mod...');

  // Dependencies first
  initializeTeaItems();
  initializeTeaCharacters();
  initializeTeaBrewery();

  // Quests reference all above systems
  initializeTeaQuests();

  console.log('✅ Mystical Tea Garden Mod loaded successfully!');
}
```

## Quest Design Principles

### Meaningful Progression
Each step should feel significant:
- **Discovery** reveals new information
- **Investigation** requires player engagement
- **Collection** creates resource goals
- **Delivery** provides story resolution

### Connected Storylines
Our quests form a complete narrative arc:
1. **Discovery** → Find the abandoned tea house
2. **Investigation** → Learn about Master Chen
3. **Collection** → Gather materials for restoration
4. **Resolution** → Unlock the tea house functionality

### Resource Integration
Quests should connect to your mod's economy:
- **Reward items** players can use (tea leaves, brewed tea)
- **Require resources** that create meaningful choices
- **Unlock content** that provides ongoing value

### Player Agency
Give players meaningful choices:
```typescript
{
  text: 'Investigate the building',  // Player chooses to engage
  text: 'Leave for now',            // Player can defer/skip
}
```

Even when choices lead to the same outcome, they make players feel involved in the story.

## Common Quest Mistakes

### Missing Global Flags
```typescript
// WRONG - flag disappears on game restart
{
  kind: 'flag',
  flag: 'questProgress',
  value: '1'
}

// RIGHT - flag persists across saves
{
  kind: 'flag',
  flag: 'questProgress',
  value: '1',
  global: true
}
```

### Unclear Quest Hints
```typescript
// WRONG - player doesn't know what to do
hint: 'Continue the quest'

// RIGHT - specific actionable instruction
hint: 'Find Master Chen in Liang Tiao Village'
```

### Broken Character References
```typescript
// WRONG - character name doesn't match exactly
character: 'master chen',      // lowercase
character: 'Master Chen ',     // extra space

// RIGHT - exact match with character definition
character: 'Master Chen'
```

### Overly Complex Events
```typescript
// WRONG - too many nested choices
{
  kind: 'choice',
  choices: [
    {
      text: 'Option 1',
      children: [
        {
          kind: 'choice',  // Nested choice
          choices: [
            {
              text: 'Sub-option A',
              children: [
                {
                  kind: 'choice',  // Triple nested!
                  // ... too complex
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}

// RIGHT - keep events focused and linear
{
  kind: 'choice',
  choices: [
    {
      text: 'Investigate further',
      children: [
        { kind: 'text', text: 'You discover...' },
        { kind: 'flag', flag: 'discovered', value: '1', global: true }
      ]
    }
  ]
}
```

## Next Steps

With quests created, we need a way to give them to players. AFNM uses triggered events for automatic quest distribution. Let's create [quest distribution system](06-quest-distribution.md) that:

- Automatically starts the first quest when players visit Liang Tiao Village
- Triggers the second quest when the first is completed
- Feels natural and non-intrusive to the player experience

The quest distribution system will complete our mod's automated progression flow.

## Troubleshooting

**Quest not completing**: Check that `completionCondition` flags are set correctly and use exact flag names.

**Character interactions failing**: Verify `character` names in quest steps match character definitions exactly.

**Event choices not appearing**: Check `showCondition` expressions and ensure referenced flags are set properly.

**TypeScript errors**: Use `getDiagnostics` to identify specific interface requirement issues with quest steps or rewards.
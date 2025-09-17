---
layout: default
title: Quest Distribution
parent: Your First Mod
grand_parent: Guides
nav_order: 6
description: 'Setting up triggered events to automatically give quests to players'
---

# Step 6: Quest Distribution

Having created quests is only half the battle - players need a way to receive them! AFNM uses triggered events to automatically distribute quests based on player actions and conditions. Let's create a quest distribution system that feels natural and engaging.

## Understanding Quest Distribution

The [Quest System documentation](../../quests/index.md#event-system-integration) explains that quests integrate tightly with the event system. Specifically, the [AddQuest event step](../../events/steps/addquest.md) allows events to give quests to players.

### Why Triggered Events?

Manual quest distribution (talking to NPCs, reading notice boards) works for some content, but triggered events provide:

- **Seamless integration** - Quests appear when contextually appropriate
- **Discovery-driven** - Exploration naturally leads to new content
- **Non-intrusive** - Players aren't forced into dialogue they don't want
- **Contextual relevance** - Quests appear when players can actually complete them

## Quest Distribution Architecture

Our tea house story needs two distribution triggers:

1. **First quest** - Triggered when player first visits Liang Tiao Village
2. **Second quest** - Triggered when first quest is completed

We'll use [triggered events](../../events/triggered-events.md) to handle this automatically.

## Creating Quest Distribution Events

Create `src/modContent/events/teaQuestEvents.ts`:

```typescript
import { TriggeredEvent, GameEvent } from 'afnm-types';

// Event that gives the discovery quest to players
const teaHouseQuestStartEvent: GameEvent = {
  location: 'Liang Tiao Village',
  steps: [
    {
      kind: 'text',
      text: 'As you explore Liang Tiao Village, something catches your attention in the distance.',
    },
    {
      kind: 'quest',
      quest: 'The Forgotten Tea House',
    },
    {
      kind: 'flag',
      flag: 'startedTeaHouseQuest',
      value: '1',
      global: true,
    },
  ],
};

// Triggered event for the first quest
export const teaHouseQuestTrigger: TriggeredEvent = {
  event: teaHouseQuestStartEvent,
  name: 'teaHouseDiscoveryStart',
  trigger: 'startedTeaHouseQuest == 0',
  screens: ['location'],
  locations: ['Liang Tiao Village'],
  triggerChance: 1.0,
};

// Event that gives the second quest after completing the first
const teaHouseRestoreQuestEvent: GameEvent = {
  location: 'Liang Tiao Village',
  steps: [
    {
      kind: 'text',
      text: 'With the tea house now discovered and cleaned, a new opportunity presents itself.',
    },
    {
      kind: 'quest',
      quest: 'Master of Tea',
    },
    {
      kind: 'flag',
      flag: 'startedRestoreQuest',
      value: '1',
      global: true,
    },
  ],
};

// Triggered event for the second quest
export const teaHouseRestoreQuestTrigger: TriggeredEvent = {
  event: teaHouseRestoreQuestEvent,
  name: 'teaHouseRestoreStart',
  trigger: 'cleanedTeaHouse == 1 && startedRestoreQuest == 0',
  screens: ['location'],
  locations: ['Liang Tiao Village'],
  triggerChance: 1.0,
};

export const allTeaQuestTriggers: TriggeredEvent[] = [
  teaHouseQuestTrigger,
  teaHouseRestoreQuestTrigger,
];

export function initializeTeaQuestEvents() {
  console.log('🎯 Adding tea quest triggered events...');

  allTeaQuestTriggers.forEach((trigger) => {
    window.modAPI.actions.addTriggeredEvent(trigger);
  });

  console.log(`✅ Added ${allTeaQuestTriggers.length} tea quest triggers`);
}
```

## Understanding Triggered Events

The [Triggered Events documentation](../../events/triggered-events.md) shows the sophisticated trigger system AFNM provides.

### TriggeredEvent Interface
```typescript
interface TriggeredEvent {
  event: GameEvent;              // The event to execute
  name: string;                  // Unique identifier
  trigger: string;               // Condition expression
  screens: GameScreen[];         // Which screens can trigger
  locations?: string[];          // Optional location restriction
  triggerChance?: number;        // Probability of triggering
  resetMonths?: {                // Cooldown between triggers
    min: number;
    max: number;
  };
  usesCooldown?: boolean;        // Uses global encounter cooldown
}
```

### Trigger Conditions

Our first trigger uses a simple condition:
```typescript
trigger: 'startedTeaHouseQuest == 0'
```

This [flag expression](../../concepts/flags.md) ensures the quest is only given once - after the flag is set, the condition becomes false.

Our second trigger uses a compound condition:
```typescript
trigger: 'cleanedTeaHouse == 1 && startedRestoreQuest == 0'
```

This ensures the restoration quest only appears after:
- The first quest is completed (`cleanedTeaHouse == 1`)
- The second quest hasn't been started yet (`startedRestoreQuest == 0`)

### Screen and Location Targeting

```typescript
screens: ['location'],                // Only on location/exploration screen
locations: ['Liang Tiao Village'],    // Only at this specific location
```

**Screen targeting** ensures events only trigger during appropriate gameplay:
- `'location'` - Exploration and location interaction screen
- `'market'` - Marketplace screen
- `'inventory'` - Inventory management screen
- `'home'` - Rest/home screen

**Location targeting** restricts where events can fire. Without this, our tea house quest could trigger anywhere!

### Trigger Probability

```typescript
triggerChance: 1.0  // 100% chance when conditions are met
```

We use certainty (1.0) because quest distribution should be reliable. Other use cases might use lower chances:
- `0.1` - 10% chance for rare random encounters
- `0.05` - 5% chance for very rare events
- `0.3` - 30% chance for common but not guaranteed events

## The AddQuest Event Step

The core of quest distribution is the [AddQuest step](../../events/steps/addquest.md):

```typescript
{
  kind: 'quest',
  quest: 'The Forgotten Tea House',
}
```

This step:
1. **Finds the quest** by name in the registered quest list
2. **Adds it to the player's quest log**
3. **Starts tracking** the quest's first step
4. **Shows notifications** to inform the player

**Quest names must match exactly** - capitalization and punctuation matter!

## Flag Management for Quest Distribution

Each triggered event sets a flag to prevent re-triggering:

```typescript
{
  kind: 'flag',
  flag: 'startedTeaHouseQuest',
  value: '1',
  global: true,
}
```

This creates a progression chain:
1. **Player visits village** → `startedTeaHouseQuest` becomes 1
2. **Player completes first quest** → `cleanedTeaHouse` becomes 1
3. **Player visits village again** → Second quest triggers
4. **Second quest starts** → `startedRestoreQuest` becomes 1

## Event Design Principles

### Contextual Introduction
```typescript
{
  kind: 'text',
  text: 'As you explore Liang Tiao Village, something catches your attention in the distance.',
}
```

Don't just dump quests on players - provide narrative context that explains why this quest is appearing now.

### Immediate Quest Delivery
```typescript
{
  kind: 'quest',
  quest: 'The Forgotten Tea House',
}
```

Give the quest immediately after the introduction. Don't make players hunt for where to actually accept it.

### Progress Tracking
```typescript
{
  kind: 'flag',
  flag: 'startedTeaHouseQuest',
  value: '1',
  global: true,
}
```

Always set flags to track quest distribution. This prevents duplicate quests and enables complex trigger conditions.

## Registering Triggered Events

```typescript
export function initializeTeaQuestEvents() {
  console.log('🎯 Adding tea quest triggered events...');

  allTeaQuestTriggers.forEach((trigger) => {
    window.modAPI.actions.addTriggeredEvent(trigger);
  });

  console.log(`✅ Added ${allTeaQuestTriggers.length} tea quest triggers`);
}
```

Triggered events must be registered through the [ModAPI](../../concepts/modapi.md#world-content) to function.

## Updating Your Main Index

Update `src/modContent/index.ts` to initialize quest events:

```typescript
import { initializeTeaItems } from './items/teaItems';
import { initializeTeaCharacters } from './characters/teaMasters';
import { initializeTeaBrewery } from './locations/teaBrewery';
import { initializeTeaQuests } from './quests/teaQuests';
import { initializeTeaQuestEvents } from './events/teaQuestEvents';

function initializeMysticalTeaGarden() {
  console.log('🍵 Initializing Mystical Tea Garden Mod...');

  // Foundation systems
  initializeTeaItems();
  initializeTeaCharacters();
  initializeTeaBrewery();

  // Quest content
  initializeTeaQuests();        // Quests must exist before events can reference them
  initializeTeaQuestEvents();   // Events distribute the quests

  console.log('✅ Mystical Tea Garden Mod loaded successfully!');
}
```

**Order matters** - quests must be registered before events can distribute them!

## Advanced Triggered Event Patterns

### Timed Events
```typescript
{
  event: seasonalEvent,
  name: 'springFestival',
  trigger: 'yearMonth >= 3 && yearMonth <= 5',  // Spring months
  screens: ['location'],
  triggerChance: 0.2,
  resetMonths: { min: 12, max: 12 }  // Once per year
}
```

### Progression Gates
```typescript
{
  event: advancedQuestEvent,
  name: 'masterChallenge',
  trigger: 'realm >= 4 && completedBasicQuests >= 10',
  screens: ['location'],
  triggerChance: 1.0
}
```

### Random Encounters
```typescript
{
  event: mysteriousStrangerEvent,
  name: 'strangerEncounter',
  trigger: 'explorationCount >= 50',
  screens: ['location'],
  locations: ['Forest Path', 'Mountain Trail'],
  triggerChance: 0.15,
  resetMonths: { min: 2, max: 6 }
}
```

## Testing Quest Distribution

1. **Check trigger conditions**: Use debug commands to verify flag states
2. **Test location restriction**: Ensure events only fire at specified locations
3. **Verify screen targeting**: Events should only trigger on appropriate screens
4. **Confirm quest delivery**: Check that quests actually appear in the quest log
5. **Test progression chains**: Ensure second quest only appears after first completion

## Common Distribution Mistakes

### Missing Location Restrictions
```typescript
// WRONG - quest triggers anywhere in the game
{
  event: teaQuestEvent,
  trigger: 'condition == 1',
  screens: ['location']
  // No location specified!
}

// RIGHT - quest only triggers at relevant location
{
  event: teaQuestEvent,
  trigger: 'condition == 1',
  screens: ['location'],
  locations: ['Liang Tiao Village']
}
```

### Forgetting Progress Flags
```typescript
// WRONG - quest retriggers every time conditions are met
{
  kind: 'quest',
  quest: 'My Quest'
  // No flag to track quest was given!
}

// RIGHT - flag prevents retriggering
[
  {
    kind: 'quest',
    quest: 'My Quest'
  },
  {
    kind: 'flag',
    flag: 'myQuestStarted',
    value: '1',
    global: true
  }
]
```

### Quest Name Mismatches
```typescript
// WRONG - names don't match exactly
quest: 'the forgotten tea house',  // lowercase
// vs quest definition:
name: 'The Forgotten Tea House',   // proper capitalization

// RIGHT - exact name match
quest: 'The Forgotten Tea House'
```

### Overly Complex Conditions
```typescript
// WRONG - complex condition that's hard to debug
trigger: 'realm >= 3 && (questA == 1 || questB == 1) && (season == "spring" || season == "summer") && playerFame >= 100'

// RIGHT - simple, clear conditions
trigger: 'realm >= 3 && advancedQuestsUnlocked == 1'
```

## Alternative Distribution Methods

While triggered events are ideal for our tea house story, other distribution methods include:

### NPC Quest Givers
Characters can offer quests directly through dialogue:
```typescript
// In character talkInteraction
{
  kind: 'choice',
  choices: [
    {
      text: 'Do you have any tasks for me?',
      children: [
        {
          kind: 'quest',
          quest: 'Delivery Mission'
        }
      ]
    }
  ]
}
```

### Notice Boards
Request board buildings can distribute quests:
```typescript
{
  kind: 'requestBoard',
  requests: {
    meridianOpening: [
      {
        quest: 'herb_collection',
        condition: '1',
        rarity: 'mundane'
      }
    ]
  }
}
```

### Calendar Events
Scheduled events can give seasonal quests:
```typescript
// In calendar event definition
{
  kind: 'quest',
  quest: 'Harvest Festival Preparation'
}
```

## Next Steps

With quest distribution complete, our mod is functionally finished! However, no mod is complete without proper testing and polish. Let's move on to [testing and polish](07-testing-polish.md) where we'll:

- Test all mod components thoroughly
- Handle edge cases and error conditions
- Add finishing touches and quality-of-life improvements
- Prepare the mod for distribution

The final step will ensure our tea house mod provides a smooth, bug-free experience for players.

## Troubleshooting

**Triggered events not firing**: Check trigger conditions, screen targeting, and location restrictions. Verify flags are set correctly.

**Quests appearing multiple times**: Ensure progress flags are set and trigger conditions account for them.

**Events triggering at wrong times**: Check compound conditions and verify flag states at different points in quest progression.

**Quest not found errors**: Verify quest names match exactly between distribution events and quest definitions.
---
layout: default
title: Quest Steps
parent: Quest System
nav_order: 2
description: 'Complete guide to all quest step types and their usage'
---

# Quest Steps

Quest steps are the building blocks of quest progression. Each step represents a specific objective the player must complete to advance the questline.

## Step Types Overview

```typescript
type QuestStep =
  | EventQuestStep
  | ConditionQuestStep
  | CollectQuestStep
  | MissionHallQuestStep
  | FlagValueQuestStep
  | SpeakToCharacterQuestStep
  | KillQuestStep
  | WaitQuestStep
  | RaidQuestStep;
```

All quest steps share a common base structure:

```typescript
interface QuestStepBase {
  hint: Translatable; // Displayed to player in quest log
}
```

### Dynamic Hint Variables

Hints accept plain strings (the common case) or translation key objects (`Translatable` type). Plain string hints support dynamic substitution. Any game flag can be referenced using `{flagName}` and it will be replaced with the flag's current value. Certain step types also support step-specific substitutions:

| Step type    | Variable      | Replaced with                              |
|--------------|---------------|--------------------------------------------|
| `collect`    | `{held}`      | Current count of held items                |
| `kill`       | `{killed}`    | Number of enemies killed so far            |
| `flagValue`  | `{value}`     | Current flag value                         |
| `flagValue`  | `{target}`    | Target value required to complete the step |
| `raid`       | `{completed}` | Number of fallen star raids completed      |

**Example using dynamic substitution:**
```typescript
{
  kind: 'kill',
  hint: 'Defeat 10 Spirit Beasts in the Crossroads ({killed}/10)',
  enemy: 'SpiritBeast',
  amount: 10
}
```

## Event Quest Step

Triggers a full interactive event with dialogue, choices, and story progression:

```typescript
interface EventQuestStep {
  kind: 'event';
  hint: Translatable;
  event: GameEvent; // Full event definition
  completionCondition?: string; // Optional additional completion requirement
}
```

For details on how to configure an event, see the events documentation **[Events](../events/)**

### Usage

Event steps are the most powerful and flexible quest step type. They can:

- Present narrative content with full dialogue trees
- Offer meaningful player choices that affect outcomes
- Trigger combat encounters
- Modify game state through items, flags, and character changes
- Create memorable story moments

### Example

```typescript
{
  kind: 'event',
  hint: 'Meet Lu Gian at the crossroads',
  event: {
    location: 'Crossroads',
    steps: [
      {
        kind: 'text',
        text: 'A thick cloud swirls over the crossroads as you arrive...'
      },
      {
        kind: 'speech',
        character: 'Lu Gian',
        text: '"Finally! I was so bored I started blasting the Ratascar..."'
      },
      {
        kind: 'choice',
        choices: [
          {
            text: 'Ask about the mission',
            children: [/* more event steps */]
          }
        ]
      }
    ]
  }
}
```

### Completion Conditions

Event steps normally complete when their event finishes. The optional `completionCondition` adds extra requirements using mathematical expressions if you wish the player to first have to achieve some condition:

```typescript
{
  kind: 'event',
  hint: 'Confront Zhiwu at the Star Draped Peak',
  completionCondition: 'zhiwuDefeated == 1', // Must defeat Zhiwu
  event: {
    // Event that might include combat
  }
}
```

**Common completion condition patterns:**

```typescript
// Player progression
'realm >= meridianOpening'; // Meridian Opening or higher
'qi > 5000'; // Sufficient qi amount

// Item requirements
'Spirit_Herb >= 3'; // Item quantities (use item flag names)
'storage_Rare_Component >= 1'; // Storage quantities

// Flag checks
'tutorialComplete == 1'; // Boolean flags (1 = true, 0 = false)
'questProgress >= 5'; // Numeric thresholds

// Time conditions
'month >= 12'; // True once 12 game months have elapsed since game start (running total)
'month >= questStartMonth + 6'; // Relative: set questStartMonth = month via a flag step when quest begins

// Complex logic
'realm >= meridianOpening && qi > 1000'; // Multiple requirements
'money >= 500 || favour >= 1000'; // Alternative requirements
```

### Usage

- **Challenge based** if the user needs to repeatedly challenge some encounter or other task, with progress only happening on success
- **External conditions** if the quest should require other quests/events to progress, and this step is just a simple event to point the player at that task

For detailed information about available variables and flag management, see the [Flags System](../concepts/flags.md) documentation.

## Condition Quest Step

Waits for a specific game state condition to be met:

```typescript
interface ConditionQuestStep {
  kind: 'condition';
  hint: Translatable;
  completionCondition: string; // Expression that must evaluate to true
}
```

### Usage

Condition steps are perfect for:

- Waiting for player progression (realm advancement, skill gains)
- Requiring resource accumulation (qi, items, money)
- Checking tutorial completion
- Waiting for other quest completion
- Time-based delays

### Examples

```typescript
// Player progression
{
  kind: 'condition',
  hint: 'Break through to the Body Forging realm',
  completionCondition: 'realm >= bodyForging'
}

// Resource requirements
{
  kind: 'condition',
  hint: 'Gather 1000 qi for mastery training',
  completionCondition: 'qi >= 1000'
}

// Tutorial completion
{
  kind: 'condition',
  hint: 'Learn the basics of crafting',
  completionCondition: 'craftingTutorialCompleted == 1'
}

// Complex conditions
{
  kind: 'condition',
  hint: 'Achieve Foundation Establishment and gain sect reputation',
  completionCondition: 'realm >= meridianOpening && Nine_Mountain_Sect >= 50'
}
```

Condition steps use the same mathematical expressions as event step completion conditions. See the [Flags System](../concepts/flags.md) for available variables and patterns.

## Collect Quest Step

Requires gathering specific items:

```typescript
interface CollectQuestStep {
  kind: 'collect';
  hint: Translatable;
  item: string; // Primary item name
  alternates?: string[]; // Alternative items that count
  amount: number; // Quantity required
  completionCondition?: string; // Optional bypass: if true, step completes regardless of item count
}
```

### Usage

Collection steps create gathering objectives:

- Resource collection for crafting
- Ingredient hunting for recipes
- Material gathering for construction
- Trophy collection from exploration

### Examples

```typescript
// Simple collection
{
  kind: 'collect',
  hint: 'Gather 5 Spirit Herbs (held: {held})',
  item: 'SpiritHerb',
  amount: 5
}

// With alternatives
{
  kind: 'collect',
  hint: 'Collect healing materials',
  item: 'HealingHerb',
  alternates: ['HealingPill', 'RestorativeTonic'],
  amount: 3
}
```

The `{held}` placeholder in hints is replaced with the current count of held items (including alternates).

The optional `completionCondition` is a bypass: if the expression evaluates to true, the step is considered complete without checking item counts. This is useful when items may have been consumed as part of quest progression.

## Kill Quest Step

Requires defeating specific enemies:

```typescript
interface KillQuestStep {
  kind: 'kill';
  hint: Translatable;
  enemy: string; // Enemy type identifier
  amount: number; // Number to defeat
}
```

### Usage

Kill steps provide combat objectives:

- Clearing dangerous areas
- Proving combat prowess
- Collecting enemy-specific materials
- Territorial control missions

### Example

```typescript
{
  kind: 'kill',
  hint: 'Defeat 10 Spirit Beasts in the crossroads ({killed}/10)',
  enemy: 'SpiritBeast',
  amount: 10
}
```

The `{killed}` placeholder in hints is replaced with the current kill count for this step.

## Mission Hall Quest Step

Requires completing sect missions:

```typescript
interface MissionHallQuestStep {
  kind: 'missionHall';
  hint: Translatable;
  consume?: {
    item: string; // Item to consume
    amount: number; // Quantity to consume
  };
}
```

### Usage

Mission hall steps integrate with the sect mission system:

- Demonstrating sect loyalty
- Gaining mission experience
- Accessing mission-specific rewards
- Consuming special mission items

### Examples

```typescript
// Basic mission completion
{
  kind: 'missionHall',
  hint: 'Complete a sect mission to prove your dedication'
}

// With item consumption
{
  kind: 'missionHall',
  hint: 'Use the special mission token',
  consume: {
    item: 'EliteMissionToken',
    amount: 1
  }
}
```

## Raid Quest Step

Requires completing a number of fallen star raids:

```typescript
interface RaidQuestStep {
  kind: 'raid';
  hint: Translatable;
  amount: number; // Number of fallen star raids to complete
}
```

### Usage

Raid steps require the player to clear fallen star locations a specified number of times. When a quest containing a `raid` step is added to the player's quest log, the game automatically unlocks the Fallen Star screen (`fallenStarsUnlocked` flag is set to `1`).

Each fallen star raid the player completes increments a global raid counter for all active quests simultaneously, so a single raid run counts toward every active `raid` step at once.

### Example

```typescript
{
  kind: 'raid',
  amount: 5,
  hint: 'Clear 5 fallen star sites for our collectors ({completed} completed)'
}
```

The `{completed}` placeholder in hints is replaced with the current number of fallen star raids completed.

## Flag Value Quest Step

Waits for a specific flag to reach a target value:

```typescript
interface FlagValueQuestStep {
  kind: 'flagValue';
  hint: Translatable;
  flag: string; // Flag identifier
  value: number; // Target value
}
```

### Usage

Flag value steps track specific progression markers:

- Story milestone achievement
- Character relationship progress
- World state changes
- Custom progression systems

### Example

```typescript
{
  kind: 'flagValue',
  hint: 'Reach trusted status with the village ({value}/{target})',
  flag: 'villageReputation',
  value: 75
}
```

The `{value}` placeholder is replaced with the flag's current value; `{target}` is replaced with the required value.

## Speak To Character Quest Step

Requires conversation with a specific NPC:

```typescript
interface SpeakToCharacterQuestStep {
  kind: 'speakToCharacter';
  hint: Translatable;
  character: string; // Character identifier
  event: EventStep[]; // Conversation content
  completionCondition?: string; // Optional additional requirement (uses same format as other steps)
}
```

### Usage

Speak steps create focused character interactions:

- Information gathering
- Relationship building
- Quest delivery and updates
- Character-specific storylines

### Example

```typescript
{
  kind: 'speakToCharacter',
  hint: 'Report back to Elder Chen',
  character: 'ElderChen',
  event: [
    {
      kind: 'speech',
      character: 'ElderChen',
      text: 'You have returned. Tell me of your journey.'
    },
    {
      kind: 'choice',
      choices: [
        {
          text: 'The mission was successful',
          children: [
            {
              kind: 'speech',
              character: 'ElderChen',
              text: 'Excellent work, disciple.'
            }
          ]
        }
      ]
    }
  ]
}
```

## Wait Quest Step

Creates time-based delays for story pacing:

```typescript
interface WaitQuestStep {
  kind: 'wait';
  hint: Translatable;
  months: number; // In-game months to wait
}
```

### Usage

Wait steps provide narrative timing:

- Character recovery periods
- Training montages
- Seasonal changes
- Building dramatic tension

### Example

```typescript
{
  kind: 'wait',
  hint: 'Wait for Zhiwu to emerge from the Mystical Region',
  months: 12 // One year wait
}
```

## Step Design Best Practices

### Hint Writing

Quest hints should be:

- **Clear and actionable**: Tell players exactly what to do
- **Contextual**: Reference locations and characters by name
- **Motivating**: Explain why the action matters
- **Concise**: Fit comfortably in quest log UI

**Good hints:**

- "Meet Lu Gian at the crossroads to begin your mission"
- "Defeat 10 Spirit Beasts to prove your combat skills ({killed}/10)"
- "Gather 5 Spirit Herbs from the Moonlit Valley"

**Poor hints:**

- "Go somewhere"
- "Kill things"
- "Find stuff"

### Step Sequencing

Design step sequences to:

- **Build narrative momentum**: Each step should advance the story
- **Vary gameplay**: Mix dialogue, combat, exploration, and collection
- **Respect player time**: Avoid repetitive or tedious objectives
- **Create natural breakpoints**: Allow players to pause between major beats, but only if that makes sense within the story
- **Allow checkpoints**: If there is a challenge, allow the player to retry the challenge directly without the need to read through the preceding dialogue

### Completion Conditions

Write robust completion conditions:

- **Test edge cases**: What if player has excess items?
- **Consider alternatives**: Can objectives be met multiple ways?
- **Avoid softlocks**: Ensure conditions are always achievable
- **Use clear logic**: Complex conditions should be well-documented

Completion conditions are mathematical expressions that can reference:

- Player stats (realm, qi, power, etc.)
- Item quantities (using proper flag names)
- Custom flags set by events
- Time variables (year, month, day)
- Reputation values

See the [Flags System](../concepts/flags.md) documentation for complete variable reference and examples.

### Event Integration

When using event steps:

- **Match scope to importance**: Major story beats deserve full events
- **Provide meaningful choices**: Don't include empty decision points
- **Consider consequences**: Choices should feel impactful
- **Maintain character voice**: NPCs should speak consistently

## Step Dependencies

Steps execute sequentially, but completion can be tracked independently. This allows for:

### Non-Linear Completion

```typescript
// Player might complete step 3 before step 2
// Both will be marked complete when conditions are met
steps: [
  {
    kind: 'condition',
    hint: 'Reach Body Forging',
    completionCondition: 'realm >= bodyForging',
  },
  { kind: 'collect', hint: 'Gather herbs', item: 'Herb', amount: 5 },
  { kind: 'kill', hint: 'Defeat beasts', enemy: 'Beast', amount: 3 },
];
```

### Prerequisite Chains

```typescript
// Later steps can reference earlier completion
steps: [
  { kind: 'event', hint: 'Meet the master' /* sets masterMet flag */ },
  {
    kind: 'condition',
    hint: 'Wait for training',
    completionCondition: 'masterMet == 1 && day >= 7',
  },
];
```

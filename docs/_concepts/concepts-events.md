---
layout: default
title: Events
parent: Core Concepts
---

# Events

Events are the primary system for creating interactive content in Ascend from Nine Mountains. They control dialogue, character interactions, storylines, and all dynamic gameplay moments.

## What Events Are

An **Event** is a sequence of **steps** that execute in order to create an interactive experience. Events can:

- Display text and dialogue
- Present choices to the player
- Give or take items and resources
- Trigger combat encounters
- Modify game state through flags
- Change locations and unlock content
- Control the flow of story and gameplay

## Event Structure

### GameEvent

The core event definition containing the actual content:

```typescript
interface GameEvent {
  location: string; // Where this event takes place
  steps: EventStep[]; // The sequence of actions to perform
  onCompleteFlags?: { flag: string; value: number }[]; // Flags set when event ends
}
```

## How Events Are Started

Events can be started in many different ways:

### Triggered Events

Automatic events that fire based on conditions - see [Triggered Events](/concepts/concepts-triggered-events/)

### Character Interactions

Events started by talking to, trading with, or fighting NPCs

### Location Events

Events built into location definitions that fire when visiting

### Quest Steps

Events as part of quest progression and storylines

### Item Usage

Events triggered by using consumable items

### Calendar Events

Time-based events that occur on specific dates

### Other Event Steps

Events can start other events as part of their step sequence

## Real Example

From the game's Crystal Shore entrance event:

```typescript
const crystalShoreEnterEvent: GameEvent = {
  location: 'Crystal Shore',
  steps: [
    {
      kind: 'text',
      text: "You're striding towards the edge of the bubbling lake...",
    },
    {
      kind: 'speech',
      character: 'Yufu Chen',
      text: "I wouldn't do that, if I were you...",
    },
    {
      kind: 'choice',
      choices: [
        {
          text: 'Why are you helping me?',
          children: [
            {
              kind: 'speech',
              character: 'Yufu Chen',
              text: 'These waters are large enough for everyone...',
            },
          ],
        },
        {
          text: 'Follow her',
          children: [],
        },
      ],
    },
    {
      kind: 'flag',
      flag: 'feitengLakeResistanceUnlocked',
      value: '1',
      global: true,
    },
  ],
};
```

This example shows a complete event with narrative text, dialogue, player choices, and flag setting. The event would be used by a [Triggered Event](concepts-triggered-events.md) or other system to actually execute it.

## Event Steps

Events are built from **Event Steps** - individual actions that make up the event sequence. Each step represents a single action or interaction.

### Common Step Properties

Most event steps share these properties:

#### Condition

All steps can have an optional `condition` that must be true for the step to execute:

```typescript
{
  kind: 'text',
  condition: 'realm >= 3',  // Only execute if Core Formation or higher
  text: 'Your advanced cultivation shows.'
}
```

#### Sound Effects

Many steps support sound effects:

```typescript
{
  kind: 'text',
  text: 'Thunder crashes overhead!',
  sfx: 'CloudAttack'  // Play thunder sound effect
}
```

### Step Execution

Steps execute **sequentially** in the order they appear in the `steps` array. Steps with failing conditions are **skipped**.

## Next Steps

Learn about the different types of Event Steps:

- **[Event Steps Overview](/concepts/concepts-event-steps/)** - Complete guide to all step types
- **[Triggered Events](/concepts/concepts-triggered-events/)** - How to automatically trigger events
- **[Flags](/concepts/concepts-flags/)** - State management system used by events

Understanding these systems will allow you to create rich, interactive experiences that respond to player choices and game state.

---

[← Flags](/concepts/concepts-flags/) | [Event Steps →](/concepts/concepts-event-steps/) | [Triggered Events →](/concepts/concepts-triggered-events/)

---
layout: default
title: Event Steps
---

# Event Steps

Event Steps are the building blocks of [Events](/concepts/concepts-events/). Each step represents a single action or interaction that occurs during an event sequence.

## Step Categories

Event steps are organized into logical categories based on their functionality:

### [Text & Speech](/concepts/concepts-event-steps-text-speech/)

Display narrative content and dialogue:

- **Text Step** - Narration and description
- **Speech Step** - Character dialogue

### [Choices](/concepts/concepts-event-steps-choices/)

Player decision points and branching:

- **Choice Step** - Present options to the player
- **Conditional branching** - Different paths based on choice

### [State Management](/concepts/concepts-event-steps-state/)

Modify game state and flags:

- **Flag Step** - Set or modify flag values
- **Conditional Step** - Execute steps based on conditions

### [Items & Resources](/concepts/concepts-event-steps-items/)

Manage player inventory and resources:

- **Add Item Step** - Give items to player
- **Remove Item Step** - Take items from player
- **Change Money Step** - Modify spirit stones
- **Change Favour Step** - Adjust favour points

### [Combat & Challenges](/concepts/concepts-event-steps-combat/)

Create encounters and challenges:

- **Combat Step** - Battle encounters
- **Crafting Step** - Crafting challenges

### [Character Interaction](/concepts/concepts-event-steps-characters/)

Manage NPCs and relationships:

- **Set Character Step** - Place character at location
- **Clear Character Step** - Remove character
- **Talk/Trade/Fight Character Steps** - Interact with NPCs

### [World & Location](/concepts/concepts-event-steps-world/)

Modify the game world:

- **Change Location Step** - Move player or change scene
- **Unlock Location Step** - Make new areas accessible
- **Pass Time Step** - Advance the calendar

### [Advanced Systems](/concepts/concepts-event-steps-advanced/)

Specialized functionality:

- **Create/Consume Buff Steps** - Manage temporary effects
- **Quest Step** - Start quests
- **Analytics Step** - Track progression
- **Label/Goto Steps** - Flow control

## Common Step Properties

Most event steps share these common properties:

### Condition

All steps can have an optional `condition` that must be true for the step to execute:

```typescript
{
  kind: 'text',
  condition: 'realm >= 3',  // Only execute if Core Formation or higher
  text: 'Your advanced cultivation shows.'
}
```

## Step Execution

Steps execute **sequentially** in the order they appear in the `steps` array:

```typescript
steps: [
  { kind: 'text', text: 'You approach the door...' },      // Step 1
  { kind: 'text', text: 'It creaks open slowly...' },      // Step 2
  { kind: 'speech', character: 'Guard', text: 'Halt!' },   // Step 3
  { kind: 'choice', choices: [...] }                       // Step 4
]
```

### Conditional Execution

Steps with failing conditions are **skipped**:

```typescript
steps: [
  { kind: 'text', text: 'You enter the room.' }, // Always executes
  {
    kind: 'text',
    condition: 'hasKey == 1', // Only if player has key
    text: 'You use your key to unlock the chest.',
  },
  { kind: 'text', text: 'You continue exploring.' }, // Always executes
];
```

### Branching with Choice Steps

Choice steps create **branches** - different paths through the event:

```typescript
{
  kind: 'choice',
  choices: [
    {
      text: 'Be polite',
      children: [
        { kind: 'text', text: 'You bow respectfully.' },
        { kind: 'flag', flag: 'politeness', value: '1', global: true }
      ]
    },
    {
      text: 'Be rude',
      children: [
        { kind: 'text', text: 'You scoff dismissively.' },
        { kind: 'flag', flag: 'rudeness', value: '1', global: true }
      ]
    }
  ]
}
```

## Next Steps

Choose a step category to learn about specific step types and see detailed examples:

- **[Text & Speech](/concepts/concepts-event-steps-text-speech/)** - Start here for basic narrative
- **[Choices](/concepts/concepts-event-steps-choices/)** - Essential for interactive content
- **[State Management](/concepts/concepts-event-steps-state/)** - Control game state with flags
- **[Items & Resources](/concepts/concepts-event-steps-items/)** - Manage player inventory
- **[Combat & Challenges](/concepts/concepts-event-steps-combat/)** - Create encounters
- **[Character Interaction](/concepts/concepts-event-steps-characters/)** - Work with NPCs
- **[World & Location](/concepts/concepts-event-steps-world/)** - Modify the game world
- **[Advanced Systems](/concepts/concepts-event-steps-advanced/)** - Specialized functionality

---

[← Events](/concepts/concepts-events/) | [Text & Speech →](/concepts/concepts-event-steps-text-speech/)

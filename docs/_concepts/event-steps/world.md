---
layout: default
title: World & Location Steps
---

# World & Location Steps

These steps manage the game world, location transitions, time progression, and environmental systems. They control where players can go, how time passes, and what areas of the game become accessible.

## Change Location Step

Moves the event to a different location, changing the background and available context.

### Interface

```typescript
interface ChangeLocationStep {
  kind: 'location';
  condition?: string;
  location: string;
  updatePlayerLocation?: boolean;
}
```

### Properties

- **`kind`** - Always `'location'`
- **`condition`** (optional) - [Flag expression](../flags.md) that must be true for the step to execute
- **`location`** - Name of the location to change to
- **`updatePlayerLocation`** (optional) - Whether to update the player's actual world location

### Examples

#### Story Scene Transition

```typescript
[
  {
    kind: 'text',
    text: 'The magical sword carries you swiftly across the landscape.',
  },
  {
    kind: 'location',
    location: 'Nine Mountain Sect',
  },
  {
    kind: 'text',
    text: 'The great peaks of the Nine Mountain Sect rise before you, golden dome shimmering in the air.',
  },
];
```

#### Temporary Location Change

```typescript
{
  kind: 'location',
  location: 'Secret Chamber',
  updatePlayerLocation: false  // Don't change player's world position
}
```

#### Player Movement

```typescript
[
  {
    kind: 'text',
    text: 'You follow the winding path deeper into the mountains.',
  },
  {
    kind: 'location',
    location: 'Mountain Peak',
    updatePlayerLocation: true, // Player has actually travelled here
  },
];
```

## Unlock Location Step

Makes a new location available for the player to visit on the world map.

### Interface

```typescript
interface UnlockLocationStep {
  kind: 'unlockLocation';
  condition?: string;
  location: string;
}
```

### Properties

- **`kind`** - Always `'unlockLocation'`
- **`condition`** (optional) - [Flag expression](../flags.md) that must be true for the step to execute
- **`location`** - Name of the location to unlock

### Examples

#### Discovery Through Travel

```typescript
[
  {
    kind: 'text',
    text: 'After many days of travel along the northern road a small complex of buildings comes into view, nestled into an outcropping of rocks. Warm light spills from its windows, accompanied by the sound of merry voices.',
  },
  {
    kind: 'unlockLocation',
    location: 'Jiao Rest Stop',
  },
];
```

#### Quest Reward Access

```typescript
[
  {
    kind: 'speech',
    character: 'Guardian',
    text: '"You have proven yourself worthy. The inner sanctum is now open to you."',
  },
  {
    kind: 'unlockLocation',
    location: 'Inner Sanctum',
  },
];
```

#### Progressive Exploration

```typescript
[
  {
    kind: 'text',
    text: 'With the ancient seal broken, the path to the forbidden valley lies open.',
  },
  {
    kind: 'unlockLocation',
    location: 'Valley of Hungry Souls',
  },
];
```

## Change Screen Step

Switches the player to a different game screen or interface.

### Interface

```typescript
interface ChangeScreenStep {
  kind: 'changeScreen';
  condition?: string;
  screen: GameScreen;
}
```

### Properties

- **`kind`** - Always `'changeScreen'`
- **`condition`** (optional) - [Flag expression](../flags.md) that must be true for the step to execute
- **`screen`** - The game screen to switch to (e.g., 'research', 'crafting', 'location')

### Examples

#### Research Facility Access

```typescript
[
  {
    kind: 'text',
    text: 'The ancient research facility hums to life as you repair the final component.',
  },
  {
    kind: 'changeScreen',
    screen: 'research',
  },
];
```

#### Forced Interface Access

```typescript
[
  {
    kind: 'speech',
    character: 'Master Craftsman',
    text: '"Let me show you the advanced techniques directly."',
  },
  {
    kind: 'changeScreen',
    screen: 'crafting',
  },
];
```

## Pass Time Step

Advances the game calendar by a specified number of days.

### Interface

```typescript
interface PassTimeStep {
  kind: 'passTime';
  condition?: string;
  days: string;
}
```

### Properties

- **`kind`** - Always `'passTime'`
- **`condition`** (optional) - [Flag expression](../flags.md) that must be true for the step to execute
- **`days`** - Expression for the number of days to advance

### Examples

#### Activity Duration

```typescript
[
  {
    kind: 'text',
    text: 'You search the mountain for a sign of the strangely-living creatures of cloth.',
  },
  {
    kind: 'passTime',
    days: '1',
  },
  {
    kind: 'text',
    text: 'After a full day of searching, you finally spot movement among the rocks.',
  },
];
```

#### Training Period

```typescript
[
  {
    kind: 'text',
    text: 'You enter secluded cultivation, focusing entirely on your inner development.',
  },
  {
    kind: 'passTime',
    days: '7',
  },
  {
    kind: 'text',
    text: 'A week of intensive meditation brings new insights to your cultivation.',
  },
];
```

#### Variable Time Passage

```typescript
{
  kind: 'passTime',
  days: 'realm >= 4 ? 3 : 5'  // Higher realms need less time
}
```

#### Intimate Activities

```typescript
[
  {
    kind: 'text',
    text: 'You and your partner spend intimate time together, deepening your bond.',
  },
  {
    kind: 'passTime',
    days: '1',
  },
  {
    kind: 'text',
    text: 'The time spent together has brought you closer.',
  },
];
```

## Exit Step

Ends the current event sequence immediately, with optional quest completion control.

### Interface

```typescript
interface ExitStep {
  kind: 'exit';
  preventQuestStepCompletion?: boolean;
  condition?: string;
}
```

### Properties

- **`kind`** - Always `'exit'`
- **`preventQuestStepCompletion`** (optional) - Prevents quest progression if true
- **`condition`** (optional) - [Flag expression](../flags.md) that must be true for the step to execute

### Examples

#### Early Event Termination

```typescript
[
  {
    kind: 'conditional',
    branches: [
      {
        condition: 'playerTooWeak == 1',
        children: [
          {
            kind: 'text',
            text: 'Recognizing you are not yet ready for this challenge, you withdraw.',
          },
          {
            kind: 'exit',
          },
        ],
      },
    ],
  },
];
```

#### Quest Failure Exit

```typescript
[
  {
    kind: 'text',
    text: 'Your failure to complete the task correctly ruins the entire mission.',
  },
  {
    kind: 'exit',
    preventQuestStepCompletion: true,
  },
];
```

#### Conditional Escape Route

```typescript
{
  kind: 'exit',
  condition: 'hasEscapeItem == 1'
}
```

## Label and Goto Label Steps

Create control flow within events, allowing for loops and complex branching.

### Label Step Interface

```typescript
interface LabelStep {
  kind: 'label';
  condition?: string;
  label: string;
}
```

### Goto Label Step Interface

```typescript
interface GotoLabelStep {
  kind: 'gotoLabel';
  condition?: string;
  label: string;
}
```

### Properties

- **`kind`** - Always `'label'` or `'gotoLabel'`
- **`condition`** (optional) - [Flag expression](../flags.md) that must be true for the step to execute
- **`label`** - The label name to mark or jump to

### Examples

#### Simple Loop

```typescript
[
  {
    kind: 'label',
    label: 'trainingLoop',
  },
  {
    kind: 'text',
    text: 'You practice your technique diligently.',
  },
  {
    kind: 'flag',
    flag: 'practiceCount',
    value: 'practiceCount + 1',
    global: false,
  },
  {
    kind: 'conditional',
    branches: [
      {
        condition: 'practiceCount < 3',
        children: [
          {
            kind: 'gotoLabel',
            label: 'trainingLoop',
          },
        ],
      },
    ],
  },
  {
    kind: 'text',
    text: 'After much practice, you feel your skills have improved.',
  },
];
```

#### Retry Mechanism

```typescript
[
  {
    kind: 'label',
    label: 'attemptChallenge',
  },
  {
    kind: 'text',
    text: 'You prepare to face the challenge once more.',
  },
  {
    kind: 'crafting',
    recipe: 'Difficult Recipe',
    basicCraftSkill: 5,
    perfectCraftSkill: 7,
    perfect: [
      {
        kind: 'text',
        text: 'Success! You have mastered the technique.',
      },
    ],
    basic: [
      {
        kind: 'text',
        text: 'Adequate, but you know you can do better.',
      },
      {
        kind: 'choice',
        choices: [
          {
            text: 'Try again',
            children: [
              {
                kind: 'gotoLabel',
                label: 'attemptChallenge',
              },
            ],
          },
          {
            text: 'Accept the result',
            children: [],
          },
        ],
      },
    ],
    failed: [
      {
        kind: 'text',
        text: 'The attempt fails. Will you try again?',
      },
      {
        kind: 'gotoLabel',
        label: 'attemptChallenge',
      },
    ],
  },
];
```

## Real Game Examples

### Tutorial Transportation

```typescript
// From tutorial.ts - flying sword transport to sect
{
  kind: 'text',
  text: 'Before you have even a moment to prepare yourself, the sword explodes into motion. Wind tears at your face from the sheer speed with which you are moving.'
},
{
  kind: 'location',
  location: 'Nine Mountain Sect'
},
{
  kind: 'text',
  text: 'It takes less than an hour for the great peaks of the Nine Mountain Sect to rise before you, a journey that should have taken weeks.'
}
```

### Location Discovery

```typescript
// From northernRoad.ts - discovering Jiao Rest Stop
{
  kind: 'text',
  text: 'After many days of travel along the northern road a small complex of buildings comes into view, nestled into an outcropping of rocks. Warm light spills from its windows, accompanied by the sound of merry voices. A welcome respite from the monotony of the endless plains you have been surrounded with for so long.'
},
{
  kind: 'unlockLocation',
  location: 'Jiao Rest Stop'
}
```

### Facility Activation

```typescript
// From wastelandWorkshop.ts - research facility access
{
  kind: 'text',
  text: 'The ancient facility hums to life as you repair the final component.'
},
{
  kind: 'analytics',
  type: 'progression',
  eventName: 'vaultRepaired'
},
{
  kind: 'changeScreen',
  screen: 'research'
}
```

### Activity Time Passage

```typescript
// From secondMountain.ts - creature searching
{
  kind: 'text',
  text: 'You search the mountain for a sign of the strangely-living creatures of cloth.'
},
{
  kind: 'passTime',
  days: '1'
},
{
  kind: 'text',
  text: 'After a full day of searching, you finally spot movement among the rocks.'
}
```

### Intimate Time Passage

```typescript
// From shenHendaCity.ts - dual cultivation time
{
  kind: 'text',
  text: 'You spend intimate time together with your cultivation partner.'
},
{
  kind: 'passTime',
  days: '1'
},
{
  kind: 'text',
  text: 'The shared cultivation session leaves you both energized and closer.'
}
```

## Best Practices

### Location Management

- **Narrative context** - Always provide story reasons for location changes
- **Visual consistency** - Ensure location descriptions match their visual appearance
- **Player agency** - Don't move players without their understanding or consent
- **Location logic** - Maintain geographical consistency in travel sequences

### Exploration Design

- **Progressive discovery** - Unlock locations as part of natural story progression
- **Meaningful access** - Ensure unlocked locations provide valuable content
- **Exploration rewards** - Make discovery feel rewarding and significant
- **Clear boundaries** - Help players understand what areas are accessible

### Time Management

- **Activity scaling** - Match time passage to the scope of activities
- **Calendar integration** - Consider seasonal events and time-sensitive content
- **Progression pacing** - Don't skip too much time without player understanding
- **Narrative consistency** - Ensure time passage makes sense in context

### Control Flow

- **Clear logic** - Use labels and gotos sparingly and with clear purpose
- **Avoid infinite loops** - Always provide exit conditions
- **Player choice** - Give players control over repetitive activities
- **Performance consideration** - Complex loops can impact event performance

### Interface Transitions

- **User expectations** - Only change screens when it makes narrative sense
- **Clear purpose** - Explain why the interface is changing
- **Return path** - Ensure players can get back to where they were
- **State preservation** - Maintain important event state across screen changes

## Common Patterns

### Journey Sequence

```typescript
[
  {
    kind: 'text',
    text: 'You set out on the long journey to the distant mountains.',
  },
  {
    kind: 'passTime',
    days: '5',
  },
  {
    kind: 'location',
    location: 'Mountain Pass',
  },
  {
    kind: 'text',
    text: 'After five days of travel, the mountain pass comes into view.',
  },
];
```

### Discovery and Access

```typescript
[
  {
    kind: 'text',
    text: 'Your exploration reveals a hidden entrance behind the waterfall.',
  },
  {
    kind: 'unlockLocation',
    location: 'Secret Cave',
  },
  {
    kind: 'choice',
    choices: [
      {
        text: 'Enter immediately',
        children: [
          {
            kind: 'location',
            location: 'Secret Cave',
            updatePlayerLocation: true,
          },
        ],
      },
      {
        text: 'Return later',
        children: [
          {
            kind: 'text',
            text: 'You make note of the location for future exploration.',
          },
        ],
      },
    ],
  },
];
```

### Training Montage

```typescript
[
  {
    kind: 'text',
    text: 'You begin intensive training in the secluded valley.',
  },
  {
    kind: 'location',
    location: 'Training Valley',
    updatePlayerLocation: false,
  },
  {
    kind: 'passTime',
    days: '14',
  },
  {
    kind: 'text',
    text: 'Two weeks of rigorous practice have sharpened your abilities significantly.',
  },
  {
    kind: 'addItem',
    item: { name: 'Training Manual' },
    amount: '1',
  },
];
```

### Facility Integration

```typescript
[
  {
    kind: 'text',
    text: 'The ancient workshop springs to life as you insert the final power crystal.',
  },
  {
    kind: 'unlockLocation',
    location: 'Ancient Workshop',
  },
  {
    kind: 'changeScreen',
    screen: 'crafting',
  },
];
```

### Emergency Exit

```typescript
[
  {
    kind: 'conditional',
    branches: [
      {
        condition: 'dangerLevel > playerPower',
        children: [
          {
            kind: 'text',
            text: 'Sensing overwhelming danger, you immediately retreat.',
          },
          {
            kind: 'location',
            location: 'Safe Haven',
          },
          {
            kind: 'exit',
          },
        ],
      },
    ],
  },
  // ... normal event content continues if condition not met
];
```

---

[← Character Interactions](characters.md) | [Advanced Systems →](advanced.md)

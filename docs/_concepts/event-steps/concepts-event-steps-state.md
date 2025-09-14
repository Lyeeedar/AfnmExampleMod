---
layout: default
title: State Management Steps
---

# State Management Steps

State management steps control game state and create branching logic based on conditions. These are the core steps for creating dynamic, responsive events.

## Flag Step

Sets or modifies flag values to remember player choices, track progress, and store game state.

### Interface

```typescript
interface SetFlagStep {
  kind: 'flag';
  condition?: string;
  global: boolean;
  flag: string;
  value: string;
}
```

### Properties

- **`kind`** - Always `'flag'`
- **`condition`** (optional) - [Flag expression](/concepts/concepts-flags/) that must be true for the step to execute
- **`global`** - Whether to store the flag permanently (`true`) or only for the current event (`false`)
- **`flag`** - The flag name/key to set
- **`value`** - Expression that evaluates to the number to store (see [Flags](/concepts/concepts-flags/))

### Examples

#### Basic Flag Setting

```typescript
{
  kind: 'flag',
  flag: 'metElderLi',
  value: '1',
  global: true
}
```

#### Incrementing Counters

```typescript
{
  kind: 'flag',
  flag: 'questsCompleted',
  value: 'questsCompleted + 1',  // Increment existing value
  global: true
}
```

#### Time-Based Flags

```typescript
{
  kind: 'flag',
  flag: 'lastVisitMonth',
  value: 'month',  // Store current month
  global: true
}
```

#### Conditional Flag Setting

```typescript
{
  kind: 'flag',
  condition: 'realm >= 4',
  flag: 'impressedNPC',
  value: '1',
  global: true
}
```

#### Event-Only Flags

```typescript
{
  kind: 'flag',
  flag: 'temporaryChoice',
  value: '2',
  global: false  // Only exists during this event
}
```

## Conditional Step

Executes different step sequences based on conditions - the primary branching mechanism for events.

### Interface

```typescript
interface ConditionalStep {
  kind: 'conditional';
  condition?: string;
  branches: { condition: string; children: EventStep[] }[];
}
```

### Properties

- **`kind`** - Always `'conditional'`
- **`condition`** (optional) - [Flag expression](/concepts/concepts-flags/) that must be true for the entire step to execute
- **`branches`** - Array of condition/children pairs that are evaluated in order

### Examples

#### Simple Branching

```typescript
{
  kind: 'conditional',
  branches: [
    {
      condition: 'metElderLi == 0',
      children: [
        { kind: 'text', text: 'You encounter Elder Li for the first time.' },
        { kind: 'flag', flag: 'metElderLi', value: '1', global: true }
      ]
    },
    {
      condition: 'metElderLi >= 1',
      children: [
        { kind: 'text', text: 'Elder Li greets you warmly.' }
      ]
    }
  ]
}
```

#### Realm-Based Reactions

```typescript
{
  kind: 'conditional',
  branches: [
    {
      condition: 'realm >= 5',  // Pillar Creation or higher
      children: [
        {
          kind: 'text',
          text: 'The man takes a few steps forward, before stumbling and paling rapidly.'
        },
        {
          kind: 'speech',
          character: 'Alchemist Boy',
          text: 'Y-y-you broke through...? Please forgive my rudeness great cultivator!'
        }
      ]
    },
    {
      condition: 'realm < 5',  // Below Pillar Creation
      children: [
        {
          kind: 'text',
          text: 'The man rushes forward, raising his voice and pointing at your face.'
        },
        {
          kind: 'speech',
          character: 'Alchemist Boy',
          text: 'You still owe me, and I won\'t be ignored!'
        }
      ]
    }
  ]
}
```

#### Complex Team-Up Logic

```typescript
{
  kind: 'conditional',
  branches: [
    {
      condition: '((partyUpLingxi == 1) && (tombTeamUpLG != 1))',
      children: [
        {
          kind: 'speech',
          character: 'Lingxi Gian',
          text: 'A site directed and made by the world\'s most recent ascender... This is an opportunity I would not turn down.'
        },
        {
          kind: 'flag',
          flag: 'tombTeamUpLG',
          value: '1',
          global: true
        }
      ]
    },
    {
      condition: '((partyUpAeiMa == 1) && (tombTeamUpAM != 1))',
      children: [
        {
          kind: 'speech',
          character: 'Aei Ma',
          text: 'The tomb holds secrets worth discovering. I shall accompany you.'
        },
        {
          kind: 'flag',
          flag: 'tombTeamUpAM',
          value: '1',
          global: true
        }
      ]
    }
  ]
}
```

#### Time-Based Conditions

```typescript
{
  kind: 'conditional',
  branches: [
    {
      condition: 'yearMonth >= 6 && yearMonth <= 8',  // Summer months
      children: [
        { kind: 'text', text: 'The summer heat makes cultivation more challenging.' }
      ]
    },
    {
      condition: 'yearMonth >= 12 || yearMonth <= 2',  // Winter months  
      children: [
        { kind: 'text', text: 'The winter cold helps focus your mind.' }
      ]
    },
    {
      condition: '1',  // Default case
      children: [
        { kind: 'text', text: 'The weather is pleasant for cultivation.' }
      ]
    }
  ]
}
```

## Branch Evaluation

Conditional branches are evaluated **in order**, and only the **first matching branch** executes:

```typescript
{
  kind: 'conditional',
  branches: [
    {
      condition: 'realm >= 8',  // Checked first
      children: [{ kind: 'text', text: 'You are a Soul Separation expert!' }]
    },
    {
      condition: 'realm >= 5',  // Only checked if realm < 8
      children: [{ kind: 'text', text: 'You have reached Pillar Creation!' }]
    },
    {
      condition: '1',  // Default case - always matches if reached
      children: [{ kind: 'text', text: 'You are still growing in power.' }]
    }
  ]
}
```

## Global vs Event Flags

### Global Flags (`global: true`)
- **Persistent** - Saved permanently in the game
- **Cross-event** - Accessible from any event or system
- **Character progress** - Track long-term player choices and achievements

```typescript
{
  kind: 'flag',
  flag: 'completedMainQuest',
  value: '1',
  global: true  // Remembered forever
}
```

### Event Flags (`global: false`)
- **Temporary** - Only exist during the current event
- **Local state** - For tracking choices within a single event
- **Cleanup automatic** - Removed when event ends

```typescript
{
  kind: 'flag',
  flag: 'askedAboutWeather',
  value: '1',
  global: false  // Forgotten after event
}
```

## Real Game Examples

### Team-Up Tracking

```typescript
{
  kind: 'conditional',
  branches: [
    {
      condition: '((partyUpLingxi == 1) && (tombTeamUpLG != 1))',
      children: [
        {
          kind: 'speech',
          character: 'Lingxi Gian',
          text: '"My confidence stems from my strength and while my talent is second to none, that does not mean I am complacent. The rewards for trial takers are compelling to anyone."'
        },
        {
          kind: 'flag',
          flag: 'tombTeamUpLG',
          value: '1',
          global: true
        }
      ]
    }
  ]
}
```

### Progression Recognition

```typescript
{
  kind: 'conditional',
  branches: [
    {
      condition: 'realm >= 5',
      children: [
        {
          kind: 'text',
          text: 'The man takes a few steps forward, before stumbling and paling rapidly.'
        },
        {
          kind: 'speech',
          character: 'Generic Alchemist Boy',
          text: '"Y-y-you broke through...? Pl-please forgive my rudeness great cultivator. I got to be apart of such a grand figures rise, so you can instead consider that garden a gift."'
        }
      ]
    },
    {
      condition: 'realm < 5',
      children: [
        {
          kind: 'text',
          text: 'The man rushes forward, before raising his voice higher and pointing at your face.'
        }
      ]
    }
  ]
}
```

## Best Practices

### Flag Management
- **Use meaningful names** - `metElderLi` not `flag1`
- **Prefix mod flags** - `myMod_playerChoice` to avoid conflicts
- **Document flag meanings** - Keep track of what each flag represents
- **Use global for persistence** - Character progress, story choices
- **Use event flags for temporary state** - Dialogue tracking, menu state

### Conditional Logic
- **Order branches carefully** - Most specific conditions first
- **Always include defaults** - Use `condition: '1'` for catch-all cases
- **Keep conditions readable** - Break complex logic into multiple flags if needed
- **Test all paths** - Ensure every branch can be reached and works correctly

### State Design
- **Avoid flag bloat** - Don't create unnecessary flags
- **Use counters wisely** - Increment rather than creating separate flags
- **Consider cleanup** - Some old flags may become obsolete
- **Plan for expansion** - Design flag structure to accommodate future content

## Common Patterns

### First-Time Interactions
```typescript
[
  {
    kind: 'conditional',
    branches: [
      {
        condition: 'metCharacter == 0',
        children: [
          { kind: 'text', text: 'You meet someone new...' },
          { kind: 'flag', flag: 'metCharacter', value: '1', global: true }
        ]
      },
      {
        condition: '1',
        children: [
          { kind: 'text', text: 'You see a familiar face...' }
        ]
      }
    ]
  }
]
```

### Progress Tracking
```typescript
[
  {
    kind: 'flag',
    flag: 'questProgress',
    value: 'questProgress + 1',
    global: true
  },
  {
    kind: 'conditional',
    branches: [
      {
        condition: 'questProgress >= 5',
        children: [
          { kind: 'text', text: 'You have made significant progress!' }
        ]
      }
    ]
  }
]
```

### Seasonal Events
```typescript
{
  kind: 'conditional',
  branches: [
    {
      condition: 'yearMonth == 12',
      children: [
        { kind: 'text', text: 'Winter festival decorations fill the streets.' }
      ]
    },
    {
      condition: 'yearMonth >= 3 && yearMonth <= 5',
      children: [
        { kind: 'text', text: 'Spring blossoms create a peaceful atmosphere.' }
      ]
    }
  ]
}
```

---

[← Choices](concepts-event-steps-choices/) | [Items & Resources →](concepts-event-steps-items/)
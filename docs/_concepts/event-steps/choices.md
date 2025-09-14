---
layout: default
title: Choice Steps
---

# Choice Steps

Choice steps present the player with options to choose from, creating branching dialogue and different story paths. They are essential for interactive content.

## Choice Step

Creates a menu of choices for the player to select from. Each choice leads to its own sequence of child steps.

### Interface

```typescript
interface ChoiceStep {
  kind: 'choice';
  condition?: string;
  choices: ChoiceStepChoice[];
}

interface ChoiceStepChoice {
  text: string;
  showCondition?: string;
  condition?: EventChoiceCondition;
  hideIfDisabled?: boolean;
  children: EventStep[];
}
```

### Properties

- **`kind`** - Always `'choice'`
- **`condition`** (optional) - [Flag expression](../flags.md) that must be true for the entire choice step to appear
- **`choices`** - Array of individual choice options

### Choice Properties

- **`text`** - The text displayed for this choice option
- **`showCondition`** (optional) - [Flag expression](../flags.md) - choice only appears if true
- **`condition`** (optional) - Structured condition object (see below)
- **`hideIfDisabled`** (optional) - If true, hide the choice when its condition fails (instead of graying it out)
- **`children`** - Array of event steps that execute when this choice is selected

## Basic Choice Example

```typescript
{
  kind: 'choice',
  choices: [
    {
      text: 'Be respectful',
      children: [
        { 
          kind: 'text', 
          text: 'You bow politely to the elder.' 
        },
        {
          kind: 'flag',
          flag: 'politeResponse',
          value: '1',
          global: true
        }
      ]
    },
    {
      text: 'Be defiant',
      children: [
        { 
          kind: 'text', 
          text: 'You stand tall and meet the elder\'s gaze defiantly.' 
        },
        {
          kind: 'flag',
          flag: 'defiantResponse', 
          value: '1',
          global: true
        }
      ]
    }
  ]
}
```

## Conditional Choice Display

### Using showCondition

Only show certain choices based on flags:

```typescript
{
  kind: 'choice',
  choices: [
    {
      text: '"What was that device you used?"',
      showCondition: 'plateAsked == 0',  // Only show if haven't asked before
      children: [
        {
          kind: 'speech',
          character: 'Guard',
          text: 'Oh, this? It\'s an Internal Qi Sensor...'
        },
        {
          kind: 'flag',
          flag: 'plateAsked',
          value: '1',
          global: false
        }
      ]
    },
    {
      text: 'Leave',
      children: [
        { kind: 'exit' }
      ]
    }
  ]
}
```

### Dynamic Choice Generation

Choices can be generated programmatically:

```typescript
{
  kind: 'choice',
  choices: techniqueElements
    .filter(e => e !== 'none')
    .map(element => ({
      text: elementToName[element],  // "Fist", "Weapon", etc.
      children: [
        {
          kind: 'addItem',
          item: { name: fruitMap[element].name },
          amount: '1'
        }
      ]
    }))
}
```

## Event Choice Conditions

For more complex conditions, use structured `EventChoiceCondition` objects:

### Realm Condition

```typescript
{
  text: 'Advanced cultivation technique',
  condition: {
    kind: 'realm',
    realm: 'coreFormation',
    mode: 'more'  // 'more' | 'exact' | 'less'
  },
  children: [...]
}
```

### Item Condition

```typescript
{
  text: 'Use Spirit Grass',
  condition: {
    kind: 'item',
    item: { name: 'Spirit Grass' },
    amount: 5
  },
  children: [...]
}
```

### Money Condition

```typescript
{
  text: 'Pay 1000 Spirit Stones',
  condition: {
    kind: 'money',
    amount: 1000
  },
  children: [...]
}
```

### Physical Statistic Condition

```typescript
{
  text: 'Use your keen eyesight',
  condition: {
    kind: 'physicalStatistic',
    stat: 'eyes',
    amount: 50
  },
  children: [...]
}
```

### Multiple Conditions

```typescript
{
  text: 'Complex option',
  condition: {
    kind: 'multiple',
    conditions: [
      {
        kind: 'realm',
        realm: 'qiCondensation',
        mode: 'more'
      },
      {
        kind: 'money', 
        amount: 500
      }
    ]
  },
  children: [...]
}
```

## Available Condition Types

- **`realm`** - Check cultivation realm
- **`physicalStatistic`** - Check physical stats (eyes, meridians, etc.)
- **`socialStatistic`** - Check social stats (age, charisma, etc.)
- **`item`** - Check item possession
- **`buff`** - Check buff presence
- **`money`** - Check spirit stone amount
- **`favour`** - Check favour points
- **`qi`** - Check qi amount
- **`affinity`** - Check technique element affinity
- **`reputation`** - Check reputation level
- **`multiple`** - Combine multiple conditions

## Real Game Example

From the Mausoleum Gate event:

```typescript
{
  kind: 'choice',
  choices: [
    {
      text: '"What was that thing you used at the gate?"',
      showCondition: 'plateAsked == 0',
      children: [
        {
          kind: 'speech',
          character: 'Shen Henda Guard',
          text: '"Oh, this?" He gestures at the small plate hanging from his belt. "Internal Qi Sensor. It helps identify a person by the dominant, or recent qi cycling through them."'
        },
        {
          kind: 'flag',
          flag: 'plateAsked',
          value: '1',
          global: false
        },
        {
          kind: 'speech',
          character: 'Shen Henda Guard',
          text: '"Do you have any other questions?"'
        },
        {
          kind: 'gotoLabel',
          label: 'questions'
        }
      ]
    },
    {
      text: '"Tell me about the incident."',
      showCondition: 'incidentAsked == 0', 
      children: [
        // More dialogue and flag setting...
      ]
    },
    {
      text: 'Thank him and leave',
      children: [
        {
          kind: 'speech',
          character: 'Shen Henda Guard',
          text: '"Safe travels, cultivator."'
        }
      ]
    }
  ]
}
```

## Best Practices

### Choice Text
- **Keep choices concise** - Players should quickly understand their options
- **Use quotation marks** for dialogue choices
- **Be specific** - Vague choices frustrate players
- **Show consequences** - Hint at what the choice might lead to

### Choice Structure
- **Provide meaningful options** - Each choice should lead somewhere different
- **Include a safe exit** - Always give players a way out of a conversation
- **Balance choice count** - 2-4 choices work best; too many overwhelm players
- **Consider personality** - Let players express different character traits

### Conditional Logic
- **Use showCondition for optional content** - Additional questions, special options
- **Use condition for requirements** - Choices that need specific stats or items
- **Set flags to track choices** - Remember what players have selected before
- **Test all paths** - Ensure every choice branch works correctly

## Common Patterns

### Information Gathering
```typescript
{
  kind: 'choice',
  choices: [
    {
      text: '"Tell me about this place"',
      showCondition: 'askedAboutPlace == 0',
      children: [
        // Exposition about the location
        { kind: 'flag', flag: 'askedAboutPlace', value: '1', global: false }
      ]
    },
    {
      text: '"What brings you here?"',
      showCondition: 'askedPersonalQuestion == 0',
      children: [
        // Character backstory
        { kind: 'flag', flag: 'askedPersonalQuestion', value: '1', global: false }
      ]
    },
    {
      text: 'Bid farewell',
      children: [{ kind: 'exit' }]
    }
  ]
}
```

### Skill-Based Choices
```typescript
{
  kind: 'choice',
  choices: [
    {
      text: 'Use your sharp eyes to examine the mechanism (Eyes 60+)',
      condition: {
        kind: 'physicalStatistic',
        stat: 'eyes',
        amount: 60
      },
      children: [
        { kind: 'text', text: 'Your keen vision reveals a hidden switch...' }
      ]
    },
    {
      text: 'Force the door with brute strength',
      children: [
        { kind: 'text', text: 'You slam your shoulder against the door...' }
      ]
    }
  ]
}
```

### Resource Transactions
```typescript
{
  kind: 'choice',
  choices: [
    {
      text: 'Pay 500 Spirit Stones for the manual',
      condition: {
        kind: 'money',
        amount: 500
      },
      children: [
        { kind: 'money', amount: '-500' },
        { kind: 'addItem', item: { name: 'Cultivation Manual' }, amount: '1' }
      ]
    },
    {
      text: 'Decline the offer',
      children: [
        { kind: 'text', text: 'You shake your head and walk away.' }
      ]
    }
  ]
}
```

---

[← Text & Speech](text-speech.md) | [State Management →](state.md)
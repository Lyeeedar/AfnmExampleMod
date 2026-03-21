---
layout: default
title: Choice Step
parent: Event Step Types
grand_parent: Events System
nav_order: 3
description: "Player decision points and branching narratives"
---

# Choice Step

Presents players with decision options that branch storylines and create interactive experiences.

## Interface

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

## Properties

**`kind`** - Always `'choice'`

**`condition`** *(optional)* - Flag expression that must be true for the entire choice step to appear.

**`choices`** - Array of choice options available to the player.

### ChoiceStepChoice Properties

**`text`** - Display text shown to the player for this choice.

**`showCondition`** *(optional)* - Flag expression controlling whether this choice appears in the menu.

**`condition`** *(optional)* - Structured requirement condition (realm, stats, items, etc.) that determines if the choice is available.

**`hideIfDisabled`** *(optional)* - If true, hide choices with failed conditions; if false, show as grayed-out.

**`children`** - Event steps that execute when this choice is selected.

## Examples

### Basic Choice
```typescript
{
  kind: 'choice',
  choices: [
    {
      text: 'Be respectful and bow deeply',
      children: [
        { kind: 'text', text: 'You bow politely to the elder, showing proper respect.' },
        { kind: 'flag', flag: 'respectfulApproach', value: '1', global: true }
      ]
    },
    {
      text: 'Stand proudly and assert your strength',
      children: [
        { kind: 'text', text: 'You stand tall, meeting the elder\'s gaze with determination.' },
        { kind: 'flag', flag: 'defiantApproach', value: '1', global: true }
      ]
    }
  ]
}
```

### Conditional Choice
```typescript
{
  kind: 'choice',
  choices: [
    {
      text: 'Demonstrate advanced cultivation technique (Core Formation+)',
      condition: {
        kind: 'realm',
        realm: 'coreFormation',
        mode: 'more'
      },
      children: [
        { kind: 'text', text: 'Your demonstration leaves the audience in awe.' },
        { kind: 'favour', amount: '20' }
      ]
    },
    {
      text: 'Share basic cultivation insights',
      children: [
        { kind: 'text', text: 'You offer fundamental cultivation advice.' },
        { kind: 'favour', amount: '5' }
      ]
    }
  ]
}
```

### Item Requirement Choice
```typescript
{
  kind: 'choice',
  choices: [
    {
      text: 'Offer Spirit Grass as payment (Requires 5)',
      condition: {
        kind: 'item',
        item: { name: 'Spirit Grass' },
        amount: 5
      },
      children: [
        { kind: 'removeItem', item: { name: 'Spirit Grass' }, amount: '5' },
        { kind: 'addItem', item: { name: 'Rare Manual' }, amount: '1' }
      ]
    },
    {
      text: 'Pay 1000 Spirit Stones',
      condition: {
        kind: 'money',
        amount: 1000
      },
      children: [
        { kind: 'money', amount: '-1000' },
        { kind: 'addItem', item: { name: 'Rare Manual' }, amount: '1' }
      ]
    }
  ]
}
```

### Health Requirement Choice
```typescript
{
  kind: 'choice',
  choices: [
    {
      text: 'Push through the pain (requires 50%+ health)',
      condition: {
        kind: 'hp',
        amount: 50,
        mode: 'more'
      },
      children: [
        { kind: 'text', text: 'You grit your teeth and press on.' }
      ]
    },
    {
      text: 'Retreat and recover',
      children: [
        { kind: 'text', text: 'Caution wins today.' }
      ]
    }
  ]
}
```

## Condition Types

Available condition types: `realm`, `physicalStatistic`, `socialStatistic`, `item`, `money`, `favour`, `qi`, `buff`, `affinity`, `reputation`, `hp`, `multiple`.

### `realm`
```typescript
{ kind: 'realm'; realm: Realm; mode?: 'more' | 'exact' | 'less' | 'lessOrEqual' }
```
Requires the player to be at a certain cultivation realm. Default `mode` is `'more'` (realm or higher).

### `physicalStatistic`
```typescript
{ kind: 'physicalStatistic'; stat: PhysicalStatistic; amount: number }
```
Requires a minimum value for a physical stat (e.g. `'muscles'`, `'agility'`).

### `socialStatistic`
```typescript
{ kind: 'socialStatistic'; stat: SocialStatistic; amount: number }
```
Requires a minimum value for a social stat (e.g. `'charm'`, `'knowledge'`).

### `item`
```typescript
{ kind: 'item'; item: ItemDesc; amount: number }
```
Requires the player to have at least `amount` of the specified item.

### `money`
```typescript
{ kind: 'money'; amount: number }
```
Requires the player to have at least `amount` spirit stones.

### `favour`
```typescript
{ kind: 'favour'; amount: number }
```
Requires the player to have at least `amount` favour.

### `qi`
```typescript
{ kind: 'qi'; amount: number }
```
Requires the player to have at least `amount` qi.

### `buff`
```typescript
{ kind: 'buff'; buff: string }
```
Requires the player to have a specific active buff by name.

### `affinity`
```typescript
{ kind: 'affinity'; affinity: string; amount: number }
```
Requires a minimum value for a school affinity.

### `reputation`
```typescript
{ kind: 'reputation'; name: string; tier: ReputationTier }
```
Requires the player to have at least the specified reputation tier with a named faction.

### `hp`
```typescript
{ kind: 'hp'; amount: number; mode: 'more' | 'equal' | 'less' }
```
Requires the player's current HP to be above, equal to, or below a threshold (as a percentage of max HP).

### `multiple`
```typescript
{ kind: 'multiple'; conditions: EventChoiceCondition[] }
```
Requires all listed conditions to be met simultaneously.

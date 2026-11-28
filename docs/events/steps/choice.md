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
  text: Translatable;
  school?: TechniqueElement;
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

**`school`** *(optional)* - Set the tint of `<elem>…</elem>` text in this option. Use it when labeling a school-themed branch with words other than the exact school name. Choose `blood`, `blossom`, `fist`, `cloud`, `weapon`, `celestial` or `none` for Neutral. If omitted, the game infers the tint from the first element tag when it contains an exact English school name and uses the default element tint otherwise. The choice's requirements and effects come from `condition` and `children`.

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
      text: 'Demonstrate a <elem>sword form</elem>',
      school: 'weapon',
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

Use `condition.item` to decide which inventory stacks count toward the required amount. Match the registered item by name and omit `corruption` to accept it in any corruption state. Set `corruption` to a corruption name to require that corruption, including an item's innate corruption. Set it to `null` to match a copy explicitly cleared of its innate corruption. A copy with no corruption field still uses its innate corruption, if any. For a payment branch, specify the same corruption rule in the [Remove Item step](removeitem.md). The requirement counts matching stacks across the inventory. Removal takes from the first matching stack for each supplied descriptor, so test payments with the item spread across multiple stacks.

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

## Condition Types

Available condition types: `realm`, `physicalStatistic`, `socialStatistic`, `item`, `money`, `favour`, `qi`, `buff`, `affinity`, `reputation`, `multiple`.

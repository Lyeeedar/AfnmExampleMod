---
layout: default
title: Create Buff Step
parent: Event Step Types
grand_parent: Events System
nav_order: 26
description: 'Apply temporary buffs or debuffs to player'
---

# Create Buff Step

## Introduction

The Create Buff Step applies buffs to the player with specified amounts and persistence options. When used in expedition contexts, buff amounts are modified by team composition and expedition instability.

## Interface

```typescript
interface CreateBuffStep {
  kind: 'createBuff';
  condition?: string;
  buff: Buff;
  amount: string;
  persistBeyondEvent?: boolean;
  /** When true, applies as a debuff that is reduced by qiFlow roles and increased by expedition instability */
  debuff?: boolean;
}
```

## Properties

- `kind` - Always `'createBuff'`

- `buff` - Buff object to create

- `amount` - Amount expression as string. In expedition contexts, this is modified by team qiFlow contribution and expedition instability.

- `persistBeyondEvent` - Whether buff persists beyond the event. If true, each stack lasts for 1 day (or as specified by `stacksAreDays`/`stacksAreMonths` on the buff).

- `debuff` - When true, the buff is treated as a debuff and affected by expedition mechanics differently than regular buffs.

- `condition` - Conditional execution (optional)

## Expedition Team Interaction

When a `createBuff` step fires during an expedition event, the amount is modified based on team composition and expedition instability:

1. **QiFlow Role Contribution**: Team members with the `qiflow` role provide aid bonuses based on their effectiveness rating.

2. **Instability Modifier**: Expedition instability (ranging from 0 to ~1.0) modifies buff amounts, reducing buffs and amplifying debuffs.

**For regular buffs** (`debuff` is false or unset):
```
finalAmount = baseAmount × (1 + aid/100) × (1 - instability)
```

**For debuffs** (`debuff` is true):
```
finalAmount = baseAmount × (1 - aid/100 + instability)
```

Where `aid` is the sum of effectiveness ratings for all qiFlow team members.

The `getRoleEffectiveness` function calculates role effectiveness based on rarity:

- `fighter`: `(rarityIndex + 1) × 10`
- `archaeologist`: `rarityIndex + 1`
- `healer`: `(rarityIndex + 1) × 10`
- `qiflow`: `(rarityIndex + 1) × 10`
- `stabilizer`: `(rarityIndex + 1) × 15`
- `surveyor`: `(rarityIndex + 1) × 10`

The final amount is floored to an integer with a minimum of 1.

## Stack Duration

Buffs that persist beyond events use the buff's `stacksAreDays` or `stacksAreMonths` properties to determine duration:

- **`stacksAreDays: true`** - Each stack represents 1 day. Stacks decay over time.
- **`stacksAreMonths: true`** - Each stack represents 1 month. Stacks decay at month end.
- **Default** - Each stack lasts 1 day.

When `persistBeyondEvent` is true, the `amount` parameter specifies the number of stacks to create. Each stack's duration is determined by the buff definition.

## Examples

### Basic Buff Creation

```typescript
{
  kind: 'createBuff',
  buff: {
    name: 'Test buff',
    icon: '',
    canStack: true,
    stats: {
      power: {
        value: 0.01,
        stat: 'power',
      },
    },
    stacks: 1,
    stacksAreDays: true,
  },
  amount: '240',
  persistBeyondEvent: true,
}
```

### Debuff with Expedition Modifiers

```typescript
{
  kind: 'createBuff',
  buff: {
    name: 'Test debuff',
    icon: '',
    canStack: true,
    stats: {
      power: {
        value: -0.01,
        stat: 'power',
      },
    },
    stacks: 1,
    stacksAreDays: true,
  },
  amount: '240',
  persistBeyondEvent: true,
  debuff: true,
}
```

### Conditional Buff with Expression Amount

```typescript
{
  kind: 'createBuff',
  buff: 'meditation_focus',
  amount: 'playerRealm * 5',
  persistBeyondEvent: true,
  condition: 'realm >= coreFormation'
}
```

### Buff with Stack Duration in Months

```typescript
{
  kind: 'createBuff',
  buff: {
    name: 'Seasonal Blessing',
    icon: blessingIcon,
    canStack: true,
    stats: {
      charisma: { value: 2, stat: undefined },
    },
    stacks: 1,
    stacksAreMonths: true,
  },
  amount: '3',
  persistBeyondEvent: true,
}
```
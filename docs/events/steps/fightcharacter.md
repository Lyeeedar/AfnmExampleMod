---
layout: default
title: Fight Character Step
parent: Event Step Types
grand_parent: Events System
nav_order: 21
description: 'Initiate combat encounter with specific character'
---

# Fight Character Step

## Introduction

Initiates a combat encounter with a specific character with branching outcomes.

## Interface

```typescript
interface FightCharacterStep {
  kind: 'fightCharacter';
  condition?: string;
  character: string;
  isSpar?: boolean;
  spawnCondition?: {
    hpMult: number;
    buffs: Buff[];
  };
  victory: EventStep[];
  defeat: EventStep[];
}
```

## Properties

- **`kind`** - Always `'fightCharacter'`

- **`character`** - Character to fight

- **`isSpar`** (optional) - Whether this is a sparring match. When `true`, the player's HP and any injuries sustained are restored after combat. However, items and qi droplets consumed during the fight are **not** returned — the resource cost of consumables still applies. Use this for training fights and friendly duels where the outcome shouldn't leave the player permanently injured, but should still make them think about what they spend.

- **`spawnCondition`** (optional) - HP multiplier and buffs for opponent

- **`victory`** - Steps to execute on victory

- **`defeat`** - Steps to execute on defeat

- **`condition`** (optional) - Conditional execution

## Examples

### Basic Combat

```typescript
{
  kind: 'fightCharacter',
  character: 'RivalCultivator',
  victory: [
    { kind: 'text', text: 'You emerge victorious!' },
    { kind: 'reputation', name: 'sect', amount: '5' }
  ],
  defeat: [
    { kind: 'text', text: 'You suffer a humbling defeat.' },
  ]
}
```

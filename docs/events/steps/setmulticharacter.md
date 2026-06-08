---
layout: default
title: Set Multi Character Step
parent: Event Step Types
grand_parent: Events System
nav_order: 34.5
description: 'Display multiple characters in a split-screen conversation'
---

# Set Multi Character Step

## Introduction

Displays a split-screen conversation with characters arranged in two opposing groups — a left group facing right and a right group facing left. Each group shows one character at a time: the most recent speaker from that group, or the first member listed until one speaks.

This enables conversations with three or more participants without alternating between individual characters.

## Interface

```typescript
interface SetMultiCharacterStep {
  kind: 'setMultiCharacter';
  /** Character keys in the left-hand group (face right). */
  left: string[];
  /** Character keys in the right-hand group (face left). */
  right: string[];
  condition?: string;
}
```

## Properties

- **`kind`** - Always `'setMultiCharacter'`
- **`left`** - Array of character keys for the left group. The most recent speaker from this group is displayed, or the first listed until one speaks.
- **`right`** - Array of character keys for the right group. The most recent speaker from this group is displayed, or the first listed until one speaks.
- **`condition`** (optional) - Conditional execution

## Behavior

- When a `speech` step fires for a character in the `left` group, that character is highlighted on the left side and the other side is dimmed.
- When a `speech` step fires for a character in the `right` group, that character is highlighted on the right side and the other side is dimmed.
- A `text` step or a speech from a character in neither group dims both sides.
- A `clearCharacter` step exits multi-character mode and returns to single-character mode.

## Examples

```typescript
// A three-way dispute between the player and two factions
{
  kind: 'setMultiCharacter',
  left: ['Aeima'],
  right: ['ShenHenda', 'JiuhuaLin']
}
```

```typescript
// A council scene with multiple advisors on each side
{
  kind: 'setMultiCharacter',
  left: ['Elder1', 'Elder2', 'Elder3'],
  right: ['Disciple1', 'Disciple2']
}
```

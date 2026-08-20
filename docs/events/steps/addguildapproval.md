```markdown
---
---
layout: default
title: Add Guild Approval Step
parent: Event Step Types
grand_parent: Events System
nav_order: 5
description: 'Add approval points to specific guilds'
---

# Add Guild Approval Step

## Introduction

The Add Guild Approval Step increases a player's approval rating with specific guilds in AFNM. Guild approval represents standing, reputation, and respect within an organization, affecting access to guild-specific benefits like shops, quests, and promotions.

## Interface

```typescript
interface AddGuildApprovalStep {
  kind: 'addGuildApproval';
  condition?: string;
  guild: string;
  amount: string;
  /** Optional rank cap. When set, approval is only granted when the player's
   *  current guild rank is <= maxRank. Use this to prevent current-rank missions
   *  from awarding promotion progress. */
  maxRank?: number;
}
```

## Properties

### Required Properties

**kind** - Always 'addGuildApproval'

**guild** - Guild name to modify approval for. Must match an existing guild name exactly.

**amount** - Approval points to add as a string expression.

### Optional Properties

**condition** - Flag expression that must be true for approval to be added.

**maxRank** - Rank ceiling for this approval grant. When set, the step is suppressed (no approval awarded) if the player's rank in the target guild exceeds `maxRank`. Use this for guild mission boards where completing a mission of a given rank should award tokens and items but not further rank progress — only missions one rank above the player's current rank should advance them.

## Basic Examples

### Simple Mission Reward

```typescript
{
  kind: 'addGuildApproval',
  guild: 'Immortal Fang Society',
  amount: '3'
}
```

### Rank-Capped Mission Reward

```typescript
{
  kind: 'addGuildApproval',
  guild: 'Star Observers',
  amount: '2',
  maxRank: 1   // only awards approval to players ranked 1 or below; rank-2+ players get tokens/items but no approval
}
```

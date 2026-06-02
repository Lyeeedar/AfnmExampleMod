---
layout: default
title: Conditional Step
parent: Event Step Types
grand_parent: Events System
nav_order: 5
description: 'Execute steps based on game state conditions'
---

# Conditional Step

Executes different step sequences based on game state conditions, enabling dynamic, responsive events. Only the FIRST matching branch will run.

## Interface

```typescript
interface ConditionalStep {
  kind: 'conditional';
  condition?: string;
  branches: { condition: string; children: EventStep[] }[];
}
```

## Properties

**`kind`** - Always `'conditional'`

**`condition`** _(optional)_ - Flag expression that must evaluate to true for the step to execute.

**`branches`** - Array of conditional branches. Each branch has a `condition` string and `children` array of steps to execute if the condition is true. Only the first branch with a true condition will run

## Behaviour

**Branches evaluate in order, and the first matching branch executes.** The remaining branches are skipped entirely. This means:

- Place more specific conditions before more general ones (e.g., `'realm >= coreFormation && chasmLoops >= 15'` before `'realm >= coreFormation'` before `'1'`).
- If you need multiple independent conditions to fire, use separate `conditional` steps rather than combining them into one step with many branches.

If no branch condition is true, the conditional step does nothing.

## Examples

### Simple Conditional override

```typescript
{
  kind: 'conditional',
  branches: [
    {
      condition: 'realm >= qiCondensation',
      children: [
        { kind: 'text', text: 'Your cultivation is sufficient for this challenge.' }
      ]
    },
    {
      condition: '1',
      children: [
        { kind: 'text', text: 'You need more cultivation to proceed safely.' }
      ]
    }
  ]
}
```

### Multiple Branches

```typescript
{
  kind: 'conditional',
  branches: [
    {
      condition: 'realm >= pillarCreation', // First valid branch executes, so put more specific ones earlier
      children: [
        { kind: 'speech', character: 'Elder', text: 'A true powerhouse! Welcome, honored one.' }
      ]
    },
    {
      condition: 'realm >= coreFormation',
      children: [
        { kind: 'speech', character: 'Elder', text: 'A Core Formation cultivator. Impressive.' }
      ]
    },
    {
      condition: '1', // Put general case last
      children: [
        { kind: 'speech', character: 'Elder', text: 'Still in the early stages. Keep training.' }
      ]
    }
  ]
}
```

### Multiple independent conditionals

When you need two conditions evaluated independently (so both can fire in the same step), use two separate conditional steps:

```typescript
// These run in order; each only fires its first matching branch.
// If the first conditional's first branch fires, the second conditional still runs independently.
[
  {
    kind: 'conditional',
    branches: [
      {
        condition: 'altarQuestStarted == 0 && realm >= coreFormation',
        children: [{ kind: 'addQuest', quest: 'altar_quest' }]
      }
    ]
  },
  {
    kind: 'conditional',
    branches: [
      {
        condition: 'sanctuaryQuestStarted == 0 && realm >= coreFormation && chasmLoops >= 15',
        children: [{ kind: 'addQuest', quest: 'chasm_sanctuary_quest' }]
      }
    ]
  }
]
```

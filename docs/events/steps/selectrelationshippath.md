---
layout: default
title: Select Relationship Path Step
parent: Event Step Types
grand_parent: Events System
nav_order: 14
description: "Direct a character's relationship progression down a named branch"
---

# Select Relationship Path Step

The Select Relationship Path Step locks a character's relationship onto a named branch defined in `relationshipPaths`. Once a path is selected, all future `progressRelationship` steps follow that branch's `CharacterRelationshipDefinition[]` instead of the default `relationship` array. Selecting a path also resets the character's relationship index and approval to 0, so the player starts the new path from its first tier.

Use this step when a player makes a story choice that should lead to a fundamentally different relationship trajectory with a companion — for example, choosing between a martial rivalry path and a scholarly friendship path.

## Interface

```typescript
interface SelectRelationshipPathStep {
  kind: 'selectRelationshipPath';
  condition?: string;
  character: string;
  path: string;
}
```

## Properties

**`kind`** - Always `'selectRelationshipPath'`

**`character`** - Character name (case-sensitive string). Must reference a character that has a `relationshipPaths` field containing the named path.

**`path`** - The key into the character's `relationshipPaths` record. Must exactly match a key defined in `relationshipPaths` on the character; if the key does not exist the step is a no-op.

**`condition`** (optional) - Flag expression for conditional execution. The step is skipped if the condition evaluates to false.

## Defining Relationship Paths on a Character

To use this step, the target character must define `relationshipPaths` alongside (or instead of) `relationship`:

```typescript
const myCompanion: Character = {
  name: 'Mei Xing',
  // ...
  relationshipPaths: {
    rival: rivalRelationshipProgression,
    friend: friendRelationshipProgression,
  },
};
```

Each value is a `CharacterRelationshipDefinition[]` — the same structure as the standard `relationship` array. The character may also keep a default `relationship` array for players who never reach a `selectRelationshipPath` step.

## Examples

### Branching at a Story Choice

```typescript
[
  {
    kind: 'text',
    text: 'She offers her hand. The choice will shape everything between you.',
  },
  {
    kind: 'choice',
    choices: [
      {
        text: 'Take her hand — you would be allies',
        children: [
          {
            kind: 'selectRelationshipPath',
            character: 'Mei Xing',
            path: 'friend',
          },
          {
            kind: 'speech',
            character: 'Mei Xing',
            text: 'Good. Then we are agreed.',
          },
        ],
      },
      {
        text: 'Step back — rivals make each other stronger',
        children: [
          {
            kind: 'selectRelationshipPath',
            character: 'Mei Xing',
            path: 'rival',
          },
          {
            kind: 'speech',
            character: 'Mei Xing',
            text: 'So be it. Prove yourself worthy of being my rival.',
          },
        ],
      },
    ],
  },
]
```

### Conditional Path Selection

```typescript
[
  {
    kind: 'selectRelationshipPath',
    condition: 'playerChoseRivalry == 1',
    character: 'Mei Xing',
    path: 'rival',
  },
  {
    kind: 'selectRelationshipPath',
    condition: 'playerChoseRivalry == 0',
    character: 'Mei Xing',
    path: 'friend',
  },
]
```

## Important Notes

- **Approval and index reset**: Selecting a path resets both `approval` and `relationshipIndex` to 0 for that character. The player earns their way up through the new path from the beginning.
- **No-op on unknown path**: If `path` does not match any key in `relationshipPaths`, the step does nothing. No error is thrown.
- **One path at a time**: There is no way to switch back to the default `relationship` array once a path is selected. Design paths to be permanent story branches.
- **Use with `progressRelationship`**: After selecting a path, all subsequent `progressRelationship` steps for that character will use the chosen path's tier list.

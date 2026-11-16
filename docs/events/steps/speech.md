---
layout: default
title: Speech Step
parent: Event Step Types
grand_parent: Events System
nav_order: 2
description: 'Character dialogue and conversations'
---

# Speech Step

Creates character dialogue by displaying text attributed to a specific character.

## Interface

```typescript
interface SpeechStep {
  kind: 'speech';
  condition?: string;
  character: string;
  hideRealm?: boolean;
  text: string;
}
```

## Properties

**`kind`** - Always `'speech'`

**`character`** - Name of the speaking character. Must match the character name as defined in your mod.

**`text`** - The dialogue content. Supports HTML formatting and templates like `{forename}`, `{surname}`, `{fullname}`, and gender-specific text using `{male option|female option}`.

**`condition`** _(optional)_ - Flag expression that must evaluate to true for the speech to occur.

**`hideRealm`** _(optional)_ - Set to `true` for dialogue set earlier in a character's life, when their current cultivation realm would misrepresent the scene. It hides the automatically added realm tier beside the speaker's name and the realm details in the speaker-name tooltip. The event history also omits the portrait's character tooltip for that line. Omit it or set it to `false` for ordinary dialogue with current realm information. This is a per-step display option. It does not change the character's realm, combat strength, or portrait, and it does not remove realm text written into a name or dialogue string.

### Dialogue Set in the Past

Keep `character` pointing to your registered NPC and add `hideRealm: true` to each speech step in the past scene. Put those steps in a [GameEvent](../events), then attach it to a supported event source such as a [TriggeredEvent](../triggered-events). This example assumes your mod has already registered Elder Chen and Sect Grounds:

```typescript
import type { TriggeredEvent } from 'afnm-types';

const pastGreeting: TriggeredEvent = {
  name: 'exampleModPastGreeting',
  trigger: '1',
  screens: ['location'],
  locations: ['Sect Grounds'],
  event: {
    location: 'Sect Grounds',
    steps: [
      {
        kind: 'speech',
        character: 'Elder Chen',
        hideRealm: true,
        text: '"Welcome to our humble sect, young cultivator. Your journey begins now."',
      },
    ],
  },
};

window.modAPI.actions.addTriggeredEvent(pastGreeting);
```

Import the module from your mod's content entry point so registration runs. On a fresh test save, visit Sect Grounds and check the speaker banner, its tooltip, and the event history. Confirm that the portrait and dialogue still appear and that current realm details are hidden. Also test an ordinary speech step without `hideRealm` to confirm its realm information remains available. If you need a different portrait for the past scene, configure the [character artwork](../../characters/character-structure) separately.

## Examples

### Basic Dialogue

```typescript
{
  kind: 'speech',
  character: 'Elder Chen',
  text: `"Welcome to our humble sect, young cultivator. Your journey begins now."`
}
```

### Multi-Character Conversation

```typescript
[
  {
    kind: 'speech',
    character: 'Elder Li',
    text: `"Welcome to our sect. Disciple Wang will show you around."`,
  },
  {
    kind: 'speech',
    character: 'Disciple Wang',
    text: `"Master, should I show them to the training grounds first?"`,
  },
  {
    kind: 'speech',
    character: 'Elder Li',
    text: `"Yes, and make sure they understand our rules."`,
  },
];
```

### Using Templates

```typescript
{
  kind: 'speech',
  character: 'Sect Recruiter',
  text:  `"Welcome to our ranks, {young man/young lady}. Training begins at dawn."`
}
```

```typescript
{
  kind: 'speech',
  character: 'Pi Lip',
  text:  `"Great to see you {forename}"`
}
```

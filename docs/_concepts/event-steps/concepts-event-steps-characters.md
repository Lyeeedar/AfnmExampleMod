---
layout: default
title: Character Interactions Steps
---

# Character Interactions Steps

These steps manage relationships, social dynamics, and character-specific gameplay systems. They handle approval ratings, relationship progression, team-ups, and intimate cultivation partnerships.

## Approval Step

Modifies a character's approval rating toward the player, affecting relationship progression and available interactions.

### Interface

```typescript
interface ApprovalStep {
  kind: 'approval';
  condition?: string;
  character: string;
  amount: string;
}
```

### Properties

- **`kind`** - Always `'approval'`
- **`condition`** (optional) - [Flag expression](/concepts/concepts-flags/) that must be true for the step to execute
- **`character`** - Name of the character whose approval changes
- **`amount`** - Expression for approval change (positive increases, negative decreases)

### Examples

#### Quest Success Approval

```typescript
{
  kind: 'approval',
  character: 'Lingxi Gian',
  amount: '4'
}
```

#### Scaled Approval Rewards

```typescript
{
  kind: 'approval',
  character: 'Sect Elder',
  amount: 'realm >= 4 ? 3 : 1'  // More approval for higher cultivation
}
```

#### Disapproval from Bad Choices

```typescript
{
  kind: 'approval',
  character: 'Master Chen',
  amount: '-2'  // Negative approval
}
```

## Progress Relationship Step

Advances the player's relationship with a character to the next tier when approval thresholds are met. This should normally be done as part of the characters 'relationship advancement' event.

### Interface

```typescript
interface ProgressRelationshipStep {
  kind: 'progressRelationship';
  condition?: string;
  character: string;
}
```

### Properties

- **`kind`** - Always `'progressRelationship'`
- **`condition`** (optional) - [Flag expression](/concepts/concepts-flags/) that must be true for the step to execute
- **`character`** - Name of the character whose relationship may progress

### Examples

#### Natural Relationship Progression

```typescript
[
  {
    kind: 'text',
    text: 'Your shared experiences have brought you closer together.',
  },
  {
    kind: 'progressRelationship',
    character: 'Beishi Ji',
  },
];
```

#### Post-Quest Relationship Growth

```typescript
[
  {
    kind: 'speech',
    character: 'Zi Liang',
    text: '"Thank you for standing by me through this ordeal, {forename}. I won\'t forget your loyalty."',
  },
  {
    kind: 'progressRelationship',
    character: 'Zi Liang',
  },
];
```

## Team Up Step

Creates temporary combat partnerships where characters fight alongside the player.

### Interface

```typescript
interface TeamUpStep {
  kind: 'teamUp';
  condition?: string;
  character: string;
  fallbackBuff?: Omit<Buff, 'name' | 'icon'>;
}
```

### Properties

- **`kind`** - Always `'teamUp'`
- **`condition`** (optional) - [Flag expression](/concepts/concepts-flags/) that must be true for the step to execute
- **`character`** - Name of the character joining the player's party
- **`fallbackBuff`** (optional) - Buff to apply if character's normal team-up isn't available

### Examples

#### Story Team-Up

```typescript
{
  kind: 'teamUp',
  character: 'Beishi Ji'
}
```

#### Quest Partnership

```typescript
[
  {
    kind: 'speech',
    character: 'Aei Ma',
    text: '"We\'ll face this together, {forename}. My strength is yours."',
  },
  {
    kind: 'teamUp',
    character: 'Aei Ma',
  },
];
```

#### Team-Up with Fallback

```typescript
{
  kind: 'teamUp',
  character: 'Pi Lip',
  fallbackBuff: {
    stats: {
      maxbarrier: { value: 0.1, stat: 'maxbarrier' }
    },
    onTechniqueEffects: [
      {
        kind: 'heal',
        amount: { value: 0.15, stat: 'power' }
      }
    ]
  }
}
```

## Add Follower Step

Adds a character as a temporary follower with ongoing benefits and interactions.

### Interface

```typescript
interface AddFollowerStep {
  kind: 'addFollower';
  condition?: string;
  character: string;
  followDef: FollowCharacterDefinition | undefined;
}
```

### Properties

- **`kind`** - Always `'addFollower'`
- **`condition`** (optional) - [Flag expression](/concepts/concepts-flags/) that must be true for the step to execute
- **`character`** - Name of the character becoming a follower
- **`followDef`** - Follower definition including buffs, duration, and interactions

### Examples

#### Recruitment Success

```typescript
{
  kind: 'addFollower',
  character: 'Junior Disciple',
  followDef: {
    formParty: [
      {
        kind: 'speech',
        character: 'Junior Disciple',
        text: '"I\'ll follow your lead, Senior!"'
      }
    ],
    duration: 7,
    buff: {
      canStack: false,
      stats: {
        maxbarrier: { value: 0.05, stat: 'maxbarrier' }
      }
    },
    cooldown: 2,
    dissolveParty: [
      {
        kind: 'speech',
        character: 'Junior Disciple',
        text: '"Thank you for letting me accompany you, Senior."'
      }
    ]
  }
}
```

## Clear Team Up Step

Removes all current team-up partners, returning the player to solo status.

### Interface

```typescript
interface ClearTeamUpStep {
  kind: 'clearTeamUp';
  condition?: string;
}
```

### Properties

- **`kind`** - Always `'clearTeamUp'`
- **`condition`** (optional) - [Flag expression](/concepts/concepts-flags/) that must be true for the step to execute

### Examples

#### End of Mission

```typescript
[
  {
    kind: 'text',
    text: 'With the mission complete, your companions bid you farewell.',
  },
  {
    kind: 'clearTeamUp',
  },
];
```

#### Separation Event

```typescript
[
  {
    kind: 'speech',
    character: 'Ally',
    text: '"Our paths must diverge here. Until we meet again."',
  },
  {
    kind: 'clearTeamUp',
  },
];
```

## Dual Cultivation Step

Initiates intimate cultivation sessions between partners, testing compatibility and providing cultivation benefits.

### Interface

```typescript
interface DualCultivationStep {
  kind: 'dualCultivation';
  condition?: string;
  character: string;
  traits: IntimateTrait[];
  success: EventStep[];
  failure: EventStep[];
}
```

### Properties

- **`kind`** - Always `'dualCultivation'`
- **`condition`** (optional) - [Flag expression](/concepts/concepts-flags/) that must be true for the step to execute
- **`character`** - Name of the cultivation partner
- **`traits`** - Array of intimate traits affecting the session
- **`success`** - Steps executed when the session succeeds
- **`failure`** - Steps executed when the session fails

### Examples

#### Partner Cultivation Session

```typescript
{
  kind: 'dualCultivation',
  character: 'Aei Ma',
  traits: ['passionate', 'experienced'],
  success: [
    {
      kind: 'qi',
      amount: 'maxqi * 0.4'
    },
    {
      kind: 'text',
      text: 'Your qi intertwines like a dance, like a fight, like the rush of racing through storm-wracked skies together. Wild and perfect and free.'
    }
  ],
  failure: [
    {
      kind: 'text',
      text: 'Despite your best efforts, your cultivation styles clash rather than harmonize.'
    },
    {
      kind: 'qi',
      amount: 'maxqi * 0.1'
    }
  ]
}
```

#### Learning Experience

```typescript
{
  kind: 'dualCultivation',
  character: 'Zi Liang',
  traits: ['gentle', 'supportive'],
  success: [
    {
      kind: 'qi',
      amount: 'maxqi * 0.3'
    },
    {
      kind: 'text',
      text: 'Together you explore the gentle flow of dual cultivation, finding harmony in synchronized breathing and shared energy.'
    },
    {
      kind: 'approval',
      character: 'Zi Liang',
      amount: '2'
    }
  ],
  failure: [
    {
      kind: 'text',
      text: 'The attempt doesn\'t quite work as planned, but you both learn from the experience.'
    },
    {
      kind: 'approval',
      character: 'Zi Liang',
      amount: '1'
    }
  ]
}
```

## Talk To Character Step

Immediately inserts the selected characters talk interaction steps into the current conversation. Often a simple way of allowing multiple methods for showing the same text (through the event, and through interacting with the character directly).

### Interface

```typescript
interface TalkToCharacterStep {
  kind: 'talkToCharacter';
  condition?: string;
  character: string;
}
```

### Properties

- **`kind`** - Always `'talkToCharacter'`
- **`condition`** (optional) - [Flag expression](/concepts/concepts-flags/) that must be true for the step to execute
- **`character`** - Name of the character to talk to

### Examples

#### Standard Character Interaction

```typescript
[
  {
    kind: 'text',
    text: "The First Elder's imposing presence focuses on you as you approach.",
  },
  {
    kind: 'talkToCharacter',
    character: 'First Elder',
  },
];
```

#### Quest Direction

```typescript
[
  {
    kind: 'text',
    text: 'You seek out the quest giver to discuss your progress.',
  },
  {
    kind: 'talkToCharacter',
    character: 'Quest Master',
  },
];
```

## Trade With Character Step

Opens the trading interface with a merchant or character who offers goods and services. The character MUST has a shop interaction for this to succeed.

### Interface

```typescript
interface TradeWithCharacterStep {
  kind: 'tradeWithCharacter';
  condition?: string;
  character: string;
}
```

### Properties

- **`kind`** - Always `'tradeWithCharacter'`
- **`condition`** (optional) - [Flag expression](/concepts/concepts-flags/) that must be true for the step to execute
- **`character`** - Name of the character to trade with

### Examples

#### Merchant Interaction

```typescript
[
  {
    kind: 'text',
    text: "The merchant's stall displays an array of cultivation resources.",
  },
  {
    kind: 'tradeWithCharacter',
    character: 'Spirit Stone Merchant',
  },
];
```

#### Specialized Trader

```typescript
[
  {
    kind: 'speech',
    character: 'Artifact Dealer',
    text: '"Interested in some rare treasures, cultivator?"',
  },
  {
    kind: 'tradeWithCharacter',
    character: 'Artifact Dealer',
  },
];
```

## Craft With Character Step

Opens the collaborative crafting interface with a character who can assist with alchemical or artifact creation.

### Interface

```typescript
interface CraftWithCharacterStep {
  kind: 'craftWithCharacter';
  condition?: string;
  character: string;
}
```

### Properties

- **`kind`** - Always `'craftWithCharacter'`
- **`condition`** (optional) - [Flag expression](/concepts/concepts-flags/) that must be true for the step to execute
- **`character`** - Name of the character to craft with

### Examples

#### Master Alchemist Collaboration

```typescript
[
  {
    kind: 'speech',
    character: 'Master Alchemist',
    text: '"Let us combine our skills to create something extraordinary."',
  },
  {
    kind: 'craftWithCharacter',
    character: 'Master Alchemist',
  },
];
```

#### Sect Crafting Partnership

```typescript
[
  {
    kind: 'text',
    text: "You approach the sect's artifact forger for assistance with your project.",
  },
  {
    kind: 'craftWithCharacter',
    character: 'Sect Forger',
  },
];
```

## Fight Character Step

Initiates combat with a character, typically for sparring, duels, or hostile encounters.

### Interface

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

### Properties

- **`kind`** - Always `'fightCharacter'`
- **`condition`** (optional) - [Flag expression](/concepts/concepts-flags/) that must be true for the step to execute
- **`character`** - Name of the character to fight
- **`isSpar`** (optional) - If true, makes this a non-lethal sparring match
- **`spawnCondition`** (optional) - Modifies the character's combat stats
- **`victory`** - Steps executed when the player wins
- **`defeat`** - Steps executed when the player loses

### Examples

#### Friendly Sparring

```typescript
{
  kind: 'fightCharacter',
  character: 'Senior Brother',
  isSpar: true,
  victory: [
    {
      kind: 'speech',
      character: 'Senior Brother',
      text: '"Excellent improvement, Junior Brother! Your technique has grown refined."'
    },
    {
      kind: 'approval',
      character: 'Senior Brother',
      amount: '3'
    }
  ],
  defeat: [
    {
      kind: 'speech',
      character: 'Senior Brother',
      text: '"Don\'t be discouraged. With more practice, you\'ll surpass even me."'
    },
    {
      kind: 'approval',
      character: 'Senior Brother',
      amount: '1'
    }
  ]
}
```

#### Hostile Encounter

```typescript
{
  kind: 'fightCharacter',
  character: 'Rogue Cultivator',
  spawnCondition: {
    hpMult: 0.8,  // Slightly weakened
    buffs: [injuredBuff]
  },
  victory: [
    {
      kind: 'text',
      text: 'The rogue cultivator yields, recognizing your superior power.'
    },
    {
      kind: 'money',
      amount: '500'
    }
  ],
  defeat: [
    {
      kind: 'text',
      text: 'The rogue cultivator proves too cunning, forcing your retreat.'
    },
    {
      kind: 'changeHp',
      amount: '-100'
    }
  ]
}
```

---

[← Combat & Challenges](concepts-event-steps-combat/) | [World & Location →](concepts-event-steps-world/)

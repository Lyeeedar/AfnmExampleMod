---
layout: default
title: Combat & Challenges Steps
parent: Event Steps
grand_parent: Core Concepts
nav_order: 5
---

# Combat & Challenges Steps

These steps handle combat encounters, crafting challenges, and competitive tournaments. They create skill-based gameplay that tests the player's progression and decision-making abilities.

## Combat Step

Initiates tactical combat encounters with enemies, including victory and defeat outcomes.

### Interface

```typescript
interface CombatStep {
  kind: 'combat';
  condition?: string;
  enemies: EnemyEntity[];
  playerBuffs?: Buff[];
  numEnemies?: number;
  isSpar?: boolean;
  bgm?: string[];
  victory: EventStep[];
  defeat: EventStep[];
}
```

### Properties

- **`kind`** - Always `'combat'`
- **`condition`** (optional) - [Flag expression]({{ site.baseurl }}/concepts/concepts-flags/) that must be true for the step to execute
- **`enemies`** - Array of enemy entities to fight against
- **`playerBuffs`** (optional) - Temporary buffs applied to the player during combat
- **`numEnemies`** (optional) - Limits how many enemies from the array actually participate
- **`isSpar`** (optional) - If true, makes this a non-lethal training fight
- **`bgm`** (optional) - Background music tracks to play during combat
- **`victory`** - Event steps executed when the player wins
- **`defeat`** - Event steps executed when the player loses

### Examples

#### Basic Enemy Encounter

```typescript
{
  kind: 'combat',
  enemies: [
    {
      name: 'Wild Beast',
      realm: 'bodyForging',
      // ... enemy stats and abilities, but best if defined separate
    }
  ],
  victory: [
    {
      kind: 'text',
      text: 'The wild beast falls before your superior cultivation.'
    },
    {
      kind: 'addItem',
      item: { name: 'Beast Core' },
      amount: '1'
    }
  ],
  defeat: [
    {
      kind: 'text',
      text: 'The beast proves too strong, forcing you to retreat.'
    },
  ]
}
```

#### Multiple Enemy Combat (fixed sequence)

```typescript
{
  kind: 'combat',
  enemies: [
    stellarFragment, stellarFragment, voidLord
  ],
  victory: [
    {
      kind: 'text',
      text: 'Despite the overwhelming pressure these beasts radiate, you manage to take them down.'
    }
  ],
  defeat: [
    {
      kind: 'text',
      text: 'Despite being injured, these beasts prove to be a terrifying force through and through.'
    }
  ]
}
```

#### Multiple Enemy Combat (random selection)

```typescript
{
  kind: 'combat',
  enemies: [
    stellarFragment, gravityDemon, voidLord, vorpalFury, grandHorror
  ],
  numEnemies: 3,
  victory: [
    {
      kind: 'text',
      text: 'Despite the overwhelming pressure these beasts radiate, you manage to take them down.'
    }
  ],
  defeat: [
    {
      kind: 'text',
      text: 'Despite being injured, these beasts prove to be a terrifying force through and through.'
    }
  ]
}
```

#### Sparring Match

```typescript
{
  kind: 'combat',
  enemies: [seniorDisciple],
  isSpar: true,
  victory: [
    {
      kind: 'text',
      text: 'Your senior brother nods approvingly at your improvement.'
    },
    {
      kind: 'approval',
      character: 'Senior Brother',
      amount: '2'
    }
  ],
  defeat: [
    {
      kind: 'text',
      text: 'Your senior brother offers constructive advice on your technique.'
    }
  ]
}
```

## Crafting Step

Challenges players to create items through the crafting system with different success levels.

### Interface

```typescript
interface CraftingStep {
  kind: 'crafting';
  condition?: string;
  recipe: string;
  basicCraftSkill: number;
  perfectCraftSkill: number;
  sublimeCraftSkill?: number;
  sublime?: EventStep[];
  perfect: EventStep[];
  basic: EventStep[];
  failed: EventStep[];
  useCurrentBackground?: boolean;
  buffs?: CraftingBuff[];
  forceSublimeCrafting?: boolean;
}
```

### Properties

- **`kind`** - Always `'crafting'`
- **`condition`** (optional) - [Flag expression]({{ site.baseurl }}/concepts/concepts-flags/) that must be true for the step to execute
- **`recipe`** - Name of the recipe to attempt crafting
- **`basicCraftSkill`** - Craft skill given on basic success. This should rarely be anything over 0 as otherwise it becomes too easy to farm craft skill
- **`perfectCraftSkill`** - Craft skill given on perfect success
- **`sublimeCraftSkill`** (optional) - Craft skill given on sublime success
- **`sublime`** (optional) - Steps executed on sublime crafting success
- **`perfect`** - Steps executed on perfect crafting success
- **`basic`** - Steps executed on basic crafting success
- **`failed`** - Steps executed on crafting failure
- **`useCurrentBackground`** (optional) - Maintains current scene background instead of the default crafting forge
- **`buffs`** (optional) - Crafting buffs applied during the attempt
- **`forceSublimeCrafting`** (optional) - Forces sublime-tier crafting rules

### Examples

#### Character Recipe Challenge

```typescript
{
  kind: 'crafting',
  recipe: 'Lingxi\'s Advanced Pill',
  basicCraftSkill: 0,
  perfectCraftSkill: 1,
  sublimeCraftSkill: 2,
  sublime: [
    {
      kind: 'text',
      text: 'The pill that you create is truly sublime, smooth and perfect and shimmering with power.'
    },
    {
      kind: 'speech',
      character: 'Lingxi Gian',
      text: '"Impressive feat, even if the recipe has flaws."'
    },
    {
      kind: 'approval',
      character: 'Lingxi Gian',
      amount: '4'
    }
  ],
  perfect: [
    {
      kind: 'text',
      text: 'You successfully craft a perfect pill, meeting expectations.'
    },
    {
      kind: 'approval',
      character: 'Lingxi Gian',
      amount: '2'
    }
  ],
  basic: [
    {
      kind: 'text',
      text: 'Your crafting succeeds, though the result is merely adequate.'
    },
    {
      kind: 'approval',
      character: 'Lingxi Gian',
      amount: '1'
    }
  ],
  failed: [
    {
      kind: 'text',
      text: 'The ingredients turn to ash in your hands. You have failed.'
    },
    {
      kind: 'speech',
      character: 'Lingxi Gian',
      text: '"Perhaps you need more practice before attempting my recipes."'
    }
  ]
}
```

#### Quest Crafting Challenge

```typescript
{
  kind: 'crafting',
  recipe: 'Master\'s Secret Formula',
  basicCraftSkill: 0,
  perfectCraftSkill: 5,
  buffs: [
    {
      name: 'Ancient Wisdom',
      // ... buff properties
    }
  ],
  perfect: [
    {
      kind: 'text',
      text: 'The ancient formula comes together perfectly under your skilled hands.'
    },
    {
      kind: 'addItem',
      item: { name: 'Perfect Elixir' },
      amount: '1'
    }
  ],
  basic: [
    {
      kind: 'text',
      text: 'You manage to complete the formula, though not without some imperfections.'
    },
    {
      kind: 'addItem',
      item: { name: 'Adequate Elixir' },
      amount: '1'
    }
  ],
  failed: [
    {
      kind: 'text',
      text: 'The complex formula proves beyond your current abilities.'
    }
  ]
}
```

## Tournament Step

Organizes competitive tournaments with multiple rounds and rankings.

### Interface

```typescript
interface TournamentStep {
  kind: 'tournament';
  condition?: string;
  title: string;
  participantPool: EnemyEntity[];
  participantCharacters?: string[];
  participantBuffs: Buff[];
  guaranteedWinner?: string;
  victory: EventStep[];
  secondPlace?: EventStep[];
  defeat: EventStep[];
}
```

### Properties

- **`kind`** - Always `'tournament'`
- **`condition`** (optional) - [Flag expression]({{ site.baseurl }}/concepts/concepts-flags/) that must be true for the step to execute
- **`title`** - Display name for the tournament
- **`participantPool`** - Enemy entities that serve as tournament opponents
- **`participantCharacters`** (optional) - Named characters also participating
- **`participantBuffs`** - Buffs applied to all participants (including player)
- **`guaranteedWinner`** (optional) - Character guaranteed to win if player doesn't
- **`victory`** - Steps executed when player wins the tournament
- **`secondPlace`** (optional) - Steps executed when player comes in second
- **`defeat`** - Steps executed when player is eliminated early

### Examples

#### Festival Tournament

```typescript
{
  kind: 'tournament',
  title: 'Ying Meihua Tournament (III)',
  participantPool: [
    // Array of Core Formation cultivators
    coreFormationDisciple1,
    coreFormationDisciple2,
    coreFormationExpert
  ],
  participantBuffs: [
    {
      name: 'Ying Meihua Tournament',
      icon: 'fist_crystal.png',
      canStack: false,
      stats: {
        blossomDisabled: { value: 1, stat: undefined },
        bloodDisabled: { value: 1, stat: undefined },
        // ...
      }
    }
  ],
  victory: [
    {
      kind: 'text',
      text: 'The crowd erupts as you stand victorious in the tournament arena!'
    },
    {
      kind: 'addItem',
      item: { name: 'Tournament Champion Trophy' },
      amount: '1'
    },
    {
      kind: 'money',
      amount: '5000'
    },
  ],
  secondPlace: [
    {
      kind: 'text',
      text: 'Though you didn\'t win, your performance in the finals was impressive.'
    },
    {
      kind: 'money',
      amount: '2000'
    },
  ],
  defeat: [
    {
      kind: 'text',
      text: 'You are eliminated in the early rounds, but gain valuable experience.'
    },
    {
      kind: 'money',
      amount: '500'
    },
  ]
}
```

#### Sect Competition

```typescript
{
  kind: 'tournament',
  title: 'Inner Disciple Examination',
  participantPool: sectionDisciples,
  participantCharacters: ['Rival Disciple', 'Senior Brother'],
  guaranteedWinner: 'Senior Brother',
  participantBuffs: [
    {
      name: 'Formal Combat Rules',
      // ... rule-enforcing buff
    }
  ],
  victory: [
    {
      kind: 'text',
      text: 'Your victory earns you recognition as an inner disciple!'
    },
    {
      kind: 'flag',
      flag: 'innerDisciple',
      value: '1',
      global: true
    }
  ],
  defeat: [
    {
      kind: 'text',
      text: 'Though you didn\'t advance this time, your efforts were noted by the elders.'
    },
    {
      kind: 'approval',
      character: 'Sect Elder',
      amount: '1'
    }
  ]
}
```

## Enemy Spawn Conditions

Combat steps can modify enemies before the fight begins:

```typescript
{
  ...baseEnemy,
  spawnCondition: {
    hpMult: 0.75,        // 75% of normal HP
    buffs: [weakenedBuff] // Additional debuffs
  }
}
```

### Spawn Condition Properties

- **`hpMult`** - Multiplier for enemy HP (0.5 = half health, 2.0 = double health)
- **`buffs`** - Array of buffs to apply to the enemy at combat start

## Real Game Examples

### Star Calamity Combat

```typescript
// From beishiJi closeFriends relationship event
{
  kind: 'speech',
  character: 'Beishi Ji',
  text: '"Lets go, we have to help!"'
},
{
  kind: 'teamUp',
  character: 'Beishi Ji'
},
{
  kind: 'combat',
  enemies: [
    {
      ...stellarFragment,
      image: stellarFragmentImg,
      spawnCondition: { hpMult: 0.55, buffs: [] }
    },
    {
      ...stellarFragment,
      image: stellarFragmentImg,
      spawnCondition: { hpMult: 0.65, buffs: [] }
    },
    {
      ...celestialDiscordance,
      image: celestialDiscordanceImg,
      spawnCondition: { hpMult: 0.55, buffs: [] }
    }
  ],
  victory: [
    {
      kind: 'text',
      text: 'Despite the overwhelming pressure these beasts radiate, you manage to take them down.'
    },
    {
      kind: 'speech',
      character: 'Beishi Ji',
      text: '"{forename}, look!" she says, before pointing to the skies.'
    }
  ],
  defeat: [
    {
      kind: 'text',
      text: 'Despite being injured, these beasts prove to be a terrifying force through and through.'
    },
    {
      kind: 'speech',
      character: 'Beishi Ji',
      text: 'Beishi Ji cries out in pure terror; "{forename} NO!!"'
    }
  ]
}
```

### Master's Recipe Test

```typescript
// From Lingxi Gian crafting interaction
{
  kind: 'speech',
  character: 'Lingxi Gian',
  text: '"Let\'s see if you can manage to impress me this time."'
},
{
  kind: 'crafting',
  recipe: 'Lingxi\'s Advanced Recipe',
  basicCraftSkill: 1,
  perfectCraftSkill: 1,
  sublimeCraftSkill: 2,
  sublime: [
    {
      kind: 'text',
      text: 'The pill that you create is truly sublime, smooth and perfect and shimmering with power. Yet, it feels wrong, far too stable to be consumed.'
    },
    {
      kind: 'speech',
      character: 'Lingxi Gian',
      text: '"Not exactly the resounding success I was hoping for, but you produced my recipe more than perfectly."'
    },
    {
      kind: 'approval',
      character: 'Lingxi Gian',
      amount: '4'
    }
  ],
  perfect: [
    {
      kind: 'speech',
      character: 'Lingxi Gian',
      text: '"Adequate work. You followed the instructions properly."'
    }
  ],
  basic: [
    {
      kind: 'speech',
      character: 'Lingxi Gian',
      text: '"Barely acceptable, but you completed the recipe without disaster."'
    }
  ],
  failed: [
    {
      kind: 'speech',
      character: 'Lingxi Gian',
      text: '"Perhaps you should practice more before attempting my advanced recipes."'
    }
  ]
}
```

### Festival Fighting Tournament

```typescript
// From Ying Meihua festival
{
  kind: 'text',
  text: 'A giant gong sounds, and you shuffle out amongst the others to stand on the arena ground. The crowd roars, and the tournament begins.'
},
{
  kind: 'tournament',
  title: 'Ying Meihua Tournament (III)',
  participantPool: tournamentFistIII,
  participantBuffs: [
    {
      name: 'Ying Meihua Tournament',
      icon: fistCrystalIcon,
      canStack: false,
      stats: {
        blossomDisabled: { value: 1, stat: undefined },
        bloodDisabled: { value: 1, stat: undefined }
      }
    }
  ],
  victory: [
    {
      kind: 'text',
      text: 'You stand triumphant as the tournament champion!'
    }
  ],
  defeat: [
    {
      kind: 'text',
      text: 'Though eliminated, you gained valuable combat experience.'
    }
  ]
}
```

## Best Practices

### Combat Design

- **Balance difficulty** - Scale enemies appropriately to player progression
- **Meaningful outcomes** - Both victory and defeat should advance the story
- **Enemy variety** - Use different enemy types to create tactical diversity
- **Spawn conditions** - Adjust enemy strength for narrative context

### Crafting Challenges

- **Skill requirements** - Set appropriate thresholds for different success levels
- **Failure consequences** - Make failure interesting, not just frustrating
- **Success rewards** - Scale rewards with difficulty and success level

### Challenge Pacing

- **Build tension** - Use dialogue and description before challenges
- **Celebrate success** - Acknowledge player achievements appropriately
- **Learn from failure** - Provide growth opportunities when players lose
- **Maintain stakes** - Make outcomes matter to the player's journey

## Common Patterns

### Story Boss Fights

```typescript
[
  {
    kind: 'text',
    text: 'The ancient guardian rises, sensing your intrusion.',
  },
  {
    kind: 'combat',
    enemies: [ancientGuardian],
    bgm: ['boss_battle.ogg'],
    victory: [
      {
        kind: 'text',
        text: 'The guardian crumbles to dust, its duty finally ended.',
      },
      { kind: 'addItem', item: { name: "Guardian's Core" }, amount: '1' },
      { kind: 'unlockLocation', location: 'Inner Sanctum' },
    ],
    defeat: [
      {
        kind: 'text',
        text: "The guardian's power overwhelms you. You must grow stronger.",
      },
      { kind: 'exit' },
    ],
  },
];
```

### Skill Testing Sequences

```typescript
[
  {
    kind: 'text',
    text: 'The master watches intently as you prepare the delicate materials.',
  },
  {
    kind: 'crafting',
    recipe: "Master's Test Recipe",
    basicCraftSkill: 0,
    perfectCraftSkill: 6,
    perfect: [
      {
        kind: 'speech',
        character: 'Master',
        text: '"Exceptional work. You have earned my recognition."',
      },
      { kind: 'flag', flag: 'masterApproval', value: '1', global: true },
    ],
    basic: [
      {
        kind: 'speech',
        character: 'Master',
        text: '"Adequate. Continue practicing."',
      },
    ],
    failed: [
      {
        kind: 'speech',
        character: 'Master',
        text: '"You are not yet ready for advanced techniques."',
      },
    ],
  },
];
```

### Competitive Events

```typescript
[
  {
    kind: 'tournament',
    title: 'Sect Advancement Trials',
    participantPool: sectDisciples,
    participantBuffs: [formalCombatRules],
    victory: [
      {
        kind: 'text',
        text: 'Your victory earns recognition from the sect elders.',
      },
      { kind: 'reputation', name: 'Nine Mountain Sect', amount: '5' },
      { kind: 'flag', flag: 'sectionAdvancement', value: '1', global: true },
    ],
    secondPlace: [
      {
        kind: 'text',
        text: 'A strong showing, though not quite enough for advancement.',
      },
      { kind: 'reputation', name: 'Nine Mountain Sect', amount: '2' },
    ],
    defeat: [
      {
        kind: 'text',
        text: 'Eliminated early, but the experience was valuable.',
      },
      { kind: 'reputation', name: 'Nine Mountain Sect', amount: '1' },
    ],
  },
];
```

---

[← Items & Resources](concepts-event-steps-items/) | [Character Interactions →](concepts-event-steps-characters/)

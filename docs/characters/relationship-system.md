---
layout: default
title: Relationship System
parent: Character System
nav_order: 5
---

# Relationship System

The relationship system allows companions to develop deep bonds with the player through approval mechanics, relationship tiers, party formation, and intimate interactions including dual cultivation.

## Relationship Categories

Four main relationship categories define the bond level:

```typescript
type CharacterRelationship = 'Hostile' | 'Neutral' | 'Friendly' | 'Intimate';
```

Each category has distinct visual indicators:

- **Hostile**: Red border, attack/threaten options available
- **Neutral**: Gray border, basic interactions only
- **Friendly**: Green border, party and advanced interactions
- **Intimate**: Pink border, dual cultivation and maximum benefits

### Gaining Approval

```typescript
// Gift giving
{
  kind: 'approval',
  character: 'Companion Name',
  amount: '3'  // Can be negative for disapproval
}

// Sparring victory
{
  kind: 'approval',
  character: 'Companion Name',
  amount: '1'
}

// Quest completion
{
  kind: 'approval',
  character: 'Companion Name',
  amount: '5'
}
```

## Relationship Definition Structure

```typescript
interface CharacterRelationshipDefinition {
  requiredApproval: number; // Minimum approval needed to unlock progression event to next tier
  relationshipCategory: CharacterRelationship;
  name: string; // Tier name (e.g., "Best Friend")
  tooltip: Translatable; // Description shown in UI

  followCharacter?: FollowCharacterDefinition; // Party mechanics
  dualCultivation?: DualCultivationDefinition; // Intimate interactions

  progressionEvent: {
    // Event to reach next tier
    name: string; // Event title
    tooltip: Translatable; // Event description
    event: EventStep[]; // Event content
    locationOverride?: string; // Specific location required
    requirement?: {
      // Additional requirements
      condition: string;
      tooltip: Translatable;
    };
  };

  /**
   * Alternative progression event used when the player's sexuality setting does not match
   * the character's gender. Should lead naturally to a platonic or sworn path without any
   * romantic overtures. Uses the same name, tooltip, and requirement as progressionEvent.
   */
  platonicProgressionEvent?: {
    event: EventStep[];
    locationOverride?: string;
  };
}
```

## Relationship Tiers Example

```typescript
const relationshipProgression: CharacterRelationshipDefinition[] = [
  // Tier 1: Acquaintance (progression event unlocks at 5 approval)
  {
    requiredApproval: 5,
    relationshipCategory: 'Neutral',
    name: 'Acquaintance',
    tooltip: "You've just met and know little about each other.",

    progressionEvent: {
      name: 'First Conversation',
      tooltip: 'Get to know your new acquaintance',
      event: [
        {
          kind: 'speech',
          character: 'Companion',
          text: "It's nice to finally talk properly...",
        },
        // Dialogue about background
        {
          kind: 'progressRelationship',
          character: 'Companion',
        },
      ],
    },
  },

  // Tier 2: Friend (progression event unlocks at 6 approval)
  {
    requiredApproval: 6,
    relationshipCategory: 'Friendly',
    name: 'Friend',
    tooltip: 'A trusted friend who will aid you in battle.',

    followCharacter: {
      formParty: [
        {
          kind: 'speech',
          character: 'Companion',
          text: "Let's travel together!",
        },
      ],
      duration: 3,
      buff: {
        canStack: false,
        stats: {
          defense: { value: 1.5, stat: 'power' },
        },
        onRoundEffects: [],
        stacks: 1,
      },
      cooldown: 5,
      dissolveParty: [
        {
          kind: 'speech',
          character: 'Companion',
          text: 'I need to handle my own affairs for now.',
        },
      ],
    },

    progressionEvent: {
      name: 'Deeper Bonds',
      tooltip: 'Your friendship deepens',
      requirement: {
        condition: 'realm >= meridianOpening',
        tooltip: 'Reach Meridian Opening realm',
      },
      event: [
        // Emotional conversation
      ],
    },
  },

  // Tier 3: Close Friend (progression event unlocks at 8 approval)
  {
    requiredApproval: 8,
    relationshipCategory: 'Friendly',
    name: 'Close Friend',
    tooltip: 'Your bond is unbreakable.',

    followCharacter: {
      duration: 5, // Longer party duration
      buff: {
        // Stronger buffs
        stats: {
          defense: { value: 2.5, stat: 'power' },
          barrierMitigation: { value: 5, stat: undefined },
        },
      },
      cooldown: 3, // Shorter cooldown
    },

    progressionEvent: {
      name: 'A Moment of Truth',
      tooltip: 'Something important is about to happen',
      locationOverride: 'Nine Mountain Sect', // Will override the character location whilst this event is available
      event: [
        // Confession or major revelation
      ],
    },
  },

  // Tier 4: Sworn Sibling (progression event unlocks at 10 approval)
  {
    requiredApproval: 10,
    relationshipCategory: 'Friendly',
    name: 'Sworn Brother/Sister',
    tooltip: 'Bound by oath and honor.',

    followCharacter: {
      duration: 7,
      buff: {
        stats: {
          defense: { value: 3, stat: 'power' },
          barrierMitigation: { value: 8, stat: undefined },
        },
        beforeTechniqueEffects: [
          {
            kind: 'damage',
            amount: { value: 0.1, stat: 'power' },
          },
        ],
      },
      cooldown: 2,
    },

    progressionEvent: {
      name: 'Oath Ceremony',
      tooltip: 'Become sworn siblings',
      requirement: {
        condition: 'realm >= qiCondensation && defeated_boss == 1',
        tooltip: 'Reach Qi Condensation and defeat a major enemy together',
      },
      event: [
        {
          kind: 'text',
          text: 'You perform the ancient ceremony...',
        },
        {
          kind: 'speech',
          character: 'Companion',
          text: 'From this day forward, we are family.',
        },
        {
          kind: 'progressRelationship',
          character: 'Companion',
        },
      ],
    },
  },

  // Tier 5: Partner (progression event unlocks at 10 approval)
  {
    requiredApproval: 10,
    relationshipCategory: 'Intimate',
    name: 'Partner',
    tooltip: 'Your hearts beat as one.',

    followCharacter: {
      duration: 10,
      buff: {
        // Maximum combat buffs
        stats: {
          defense: { value: 4, stat: 'power' },
          barrierMitigation: { value: 10, stat: undefined },
          power: { value: 0.5, stat: 'power' },
        },
        beforeTechniqueEffects: [
          {
            kind: 'damage',
            amount: { value: 0.15, stat: 'power' },
          },
        ],
      },
      cooldown: 1,
    },

    dualCultivation: {
      condition: '1',
      traits: [lovesTender, lovesPassionate], // Required trait objects
      intro: [
        {
          kind: 'speech',
          character: 'Companion',
          text: 'Shall we cultivate together, my love?',
        },
      ],
      success: [
        {
          kind: 'qi',
          amount: 'maxqi * 0.3',
        },
        {
          kind: 'approval',
          character: 'Companion',
          amount: '1',
        },
        {
          kind: 'text',
          text: 'Your qi harmonizes perfectly, strengthening both of you.',
        },
      ],
      failure: [
        {
          kind: 'text',
          text: 'Your techniques clash, but the attempt brings you closer.',
        },
      ],
    },

    progressionEvent: {
      name: 'Eternal Bond',
      tooltip: 'Become Dao Partners',
      requirement: {
        condition: 'realm >= coreFormation',
        tooltip: 'Reach Core Formation realm',
      },
      event: [
        // Dao partner ceremony
      ],
    },
  },

  // Tier 6: Dao Partner (progression event unlocks at 10 approval)
  {
    requiredApproval: 10,
    relationshipCategory: 'Intimate',
    name: 'Dao Partner',
    tooltip: 'Your souls are forever intertwined.',

    followCharacter: {
      duration: -1, // Unlimited
      buff: {
        // Transcendent buffs
        stats: {
          defense: { value: 5, stat: 'power' },
          barrierMitigation: { value: 15, stat: undefined },
          power: { value: 1, stat: 'power' },
          healthMax: { value: 0.5, stat: 'healthMax' },
        },
        beforeTechniqueEffects: [
          {
            kind: 'damage',
            amount: { value: 0.2, stat: 'power' },
          },
        ],
        onRoundEffects: [
          {
            kind: 'heal',
            amount: { value: 0.05, stat: 'healthMax' },
          },
        ],
      },
      cooldown: 0, // No cooldown
    },

    dualCultivation: {
      condition: '1',
      traits: [lovesTender, lovesPassionate, energetic],
      intro: [
        {
          kind: 'speech',
          character: 'Companion',
          text: 'Our souls resonate as one.',
        },
      ],
      success: [
        {
          kind: 'qi',
          amount: 'maxqi * 0.5', // Maximum qi gain
        },
        {
          kind: 'approval',
          character: 'Companion',
          amount: '2',
        },
        {
          kind: 'buff',
          buff: 'Harmonized Souls', // Temporary combat buff
          duration: 30,
        },
      ],
      failure: [], // Cannot fail at this level
    },

    progressionEvent: {
      name: '', // No further progression
      tooltip: '',
      event: [],
    },
  },
];
```

## Party System

Companions can join the player's party (normally unlocked Friendly relationship or higher).

```typescript
interface FollowCharacterDefinition {
  formParty: EventStep[];     // Party formation dialogue
  duration: number;           // Days in party (-1 for unlimited)
  buff: Omit<Buff, 'name' | 'icon'>;          // Combat bonuses while in party
  craftingBuff?: Omit<CraftingBuff, 'name' | 'icon'>; // Optional crafting bonuses while in party
  cooldown: number;           // Days before can party again
  dissolveParty: EventStep[]; // Party dissolution dialogue
  supportsJoiningParty?: boolean; // If true, the companion can join the player's party via the party UI (max 3)
}
```

### Party Buffs Scale with Relationship

```typescript
// Friend tier buffs
buff: {
  stats: {
    defense: { value: 1.5, stat: 'power' }
  }
}

// Close Friend tier buffs
buff: {
  stats: {
    defense: { value: 2.5, stat: 'power' },
    barrierMitigation: { value: 5, stat: undefined }
  }
}

// Dao Partner tier buffs
buff: {
  stats: {
    defense: { value: 5, stat: 'power' },
    power: { value: 1, stat: 'power' },
    healthMax: { value: 0.5, stat: 'healthMax' }
  },
  onRoundEffects: [{
    kind: 'heal',
    amount: { value: 0.05, stat: 'healthMax' }
  }]
}
```

### Crafting Buffs in Party

`craftingBuff` applies a crafting buff to the player while the companion is in the party. It uses the same structure as a regular `CraftingBuff` minus `name` and `icon`:

```typescript
craftingBuff: {
  canStack: false,
  stats: {
    successChanceBonus: { value: 0.06, stat: undefined },
    itemEffectiveness: { value: 6, stat: undefined },
  },
  effects: [],
  stacks: 1,
  displayLocation: 'none',
},
```

### Joining Party

`supportsJoiningParty: true` allows the companion to be added to the player's party through the party management UI, up to a maximum of three companions. Without this flag the companion can still form a party via their interaction dialogue, but they will not appear in the party management panel.

## Dual Cultivation

Available at Intimate relationship levels for deep qi sharing.

```typescript
interface DualCultivationDefinition {
  condition: string; // Additional requirements
  traits: IntimateTrait[]; // Required traits for success
  intro: EventStep[]; // Initiation dialogue
  success: EventStep[]; // Successful cultivation
  failure: EventStep[]; // Failed attempt
}
```

### Intimate Traits

Success in dual cultivation depends on matching traits:

```typescript
// Import trait objects from the game's intimateTraits module
import {
  lovesRough,      // Prefers rough intimacy
  lovesTender,     // Prefers tender intimacy
  lovesPassionate, // Passionate lover
  aggressiveLover, // Dislikes tender approaches (tender/passionate penalty)
  hardToPlease,    // High satisfaction threshold
  hairTrigger,     // Lower satisfaction threshold — quick to finish
  energetic,       // Extra starting energy
  lowStamina,      // Reduced starting energy
  painTolerant,    // Higher pain threshold
  sensitive,       // Lower pain threshold
} from 'afnm-types/data/dualCultivation/intimateTraits';
```

Traits are `IntimateTrait` objects, not string literals. Import them from the game package and pass them directly in the `traits` array:

```typescript
dualCultivation: {
  condition: '1',
  traits: [lovesTender, lovesPassionate],
  // ...
}
```

### Dual Cultivation Rewards

```typescript
// Partner level (basic intimacy)
success: [
  {
    kind: 'qi',
    amount: 'maxqi * 0.3', // 30% max qi
  },
  {
    kind: 'approval',
    character: 'Companion',
    amount: '1',
  },
];

// Dao Partner level (perfect unity)
success: [
  {
    kind: 'qi',
    amount: 'maxqi * 0.5', // 50% max qi
  },
  {
    kind: 'approval',
    character: 'Companion',
    amount: '2',
  },
  {
    kind: 'buff',
    buff: 'Harmonized Cultivation',
    duration: 7, // Week-long buff
  },
];
```

## Progression Events

Special events that advance the relationship to the next tier.

### Event Requirements

```typescript
requirement: {
  condition: 'realm >= qiCondensation && quest_complete == 1', // Block advancement until the player reaches Qi Condensation and completes a specific character sidequest
  tooltip: 'Reach Qi Condensation and complete the quest'
}
```

### Location Override

Force events to occur at specific locations:

```typescript
locationOverride: 'Nine Mountain Sect'; // Must be at sect
```

### Progression Event Example

```typescript
progressionEvent: {
  name: 'Heart to Heart',
  tooltip: 'Have an important conversation',
  requirement: {
    condition: 'realm >= meridianOpening',
    tooltip: 'Reach Meridian Opening realm'
  },
  locationOverride: 'Starlit Peak',
  event: [
    {
      kind: 'text',
      text: 'You meet at the peak under the stars...'
    },
    {
      kind: 'speech',
      character: 'Companion',
      text: 'There\'s something I need to tell you...'
    },
    {
      kind: 'choice',
      choices: [
        {
          text: 'I feel the same way',
          children: [
            {
              kind: 'speech',
              character: 'Companion',
              text: 'Really? You do?'
            },
            {
              kind: 'progressRelationship',
              character: 'Companion'
            }
          ]
        },
        {
          text: 'We should remain friends',
          children: [
            {
              kind: 'speech',
              character: 'Companion',
              text: 'I... I understand.'
            },
            {
              kind: 'approval',
              character: 'Companion',
              amount: '-2'
            }
          ]
        }
      ]
    }
  ]
}
```

## Implementation Best Practices

### Approval Pacing

Balance approval gains to create meaningful progression:

- **Small gains (1-2)**: Regular interactions, sparring
- **Medium gains (3-5)**: Gifts, quest completion
- **Large gains (6-10)**: Major story events, breakthrough aid

### Relationship Gates

Use requirements to pace relationship progression:

```typescript
// Early relationship - no requirements
requirement: undefined

// Mid relationship - realm gate
requirement: {
  condition: 'realm >= meridianOpening',
  tooltip: 'Reach Meridian Opening'
}

// Late relationship - story gate
requirement: {
  condition: 'realm >= qiCondensation && main_quest_complete == 1',
  tooltip: 'Complete the main questline'
}
```

### Narrative Consistency

Maintain character voice across relationship tiers:

```typescript
// Acquaintance - Formal
text: 'It is good to meet a fellow disciple.';

// Friend - Casual
text: 'Hey! Good to see you again!';

// Close Friend - Warm
text: 'I was just thinking about you!';

// Partner - Intimate
text: "My love, you've returned to me.";

// Dao Partner - Transcendent
text: 'Our souls sing in harmony once more.';
```

### Visual Feedback

The game automatically handles visual indicators:

- Character portrait border color changes
- Relationship status in character menu
- Heart icons at intimate levels
- Approval bar showing progress to next tier

## Branching Relationship Paths

Companions can have multiple named relationship progressions — for example, a friendship path and a rivalry path. The player is directed onto a branch by a `selectRelationshipPath` event step. Once a path is selected, all future `progressRelationship` steps follow that branch's tier list.

### Defining Paths

Add a `relationshipPaths` field to the character definition alongside (or instead of) the default `relationship` array:

```typescript
const myCompanion: Character = {
  name: 'Mei Xing',
  relationship: defaultRelationshipTiers, // Used if no path is selected
  relationshipPaths: {
    friend: friendRelationshipTiers,
    rival: rivalRelationshipTiers,
  },
  // ...other fields
};
```

Each value in `relationshipPaths` is a `CharacterRelationshipDefinition[]` identical in structure to the default `relationship` array.

### Selecting a Path

Use the `selectRelationshipPath` event step to lock the character onto a named branch:

```typescript
{
  kind: 'selectRelationshipPath',
  character: 'Mei Xing',
  path: 'rival',
}
```

Selecting a path resets the character's relationship index and approval to 0. The player then earns their way up through the new path from the first tier. Once a path is selected it persists — there is no way to revert to the default `relationship` array.

### Example: Two-Path Companion

```typescript
const friendPath: CharacterRelationshipDefinition[] = [
  {
    requiredApproval: 5,
    relationshipCategory: 'Friendly',
    name: 'Ally',
    tooltip: 'A reliable friend and ally.',
    progressionEvent: {
      name: 'Trust Formed',
      tooltip: 'Your friendship deepens',
      event: [
        { kind: 'speech', character: 'Mei Xing', text: 'I am glad we chose this path.' },
        { kind: 'progressRelationship', character: 'Mei Xing' },
      ],
    },
  },
  // ...further tiers
];

const rivalPath: CharacterRelationshipDefinition[] = [
  {
    requiredApproval: 5,
    relationshipCategory: 'Friendly',
    name: 'Acknowledged Rival',
    tooltip: 'She respects your strength.',
    progressionEvent: {
      name: 'First Test',
      tooltip: 'Prove yourself in sparring',
      event: [
        { kind: 'speech', character: 'Mei Xing', text: 'You are stronger than I expected.' },
        { kind: 'progressRelationship', character: 'Mei Xing' },
      ],
    },
  },
  // ...further tiers
];

const meiXing: Character = {
  name: 'Mei Xing',
  relationship: defaultPath, // fallback if the branching event never fires
  relationshipPaths: {
    friend: friendPath,
    rival: rivalPath,
  },
  // ...other fields
};
```

See also: [Select Relationship Path Step](../events/steps/selectrelationshippath) for the event step reference.

## Complete Relationship Example

```typescript
const companionRelationships: CharacterRelationshipDefinition[] = [
  {
    requiredApproval: 0,
    relationshipCategory: 'Neutral',
    name: 'Stranger',
    tooltip: "A fellow cultivator you've recently encountered.",
    progressionEvent: {
      name: 'Breaking the Ice',
      tooltip: 'Have your first real conversation',
      event: [
        /* introduction dialogue */
      ],
    },
  },
  {
    requiredApproval: 5,
    relationshipCategory: 'Friendly',
    name: 'Friend',
    tooltip: 'A dependable ally in your cultivation journey.',
    followCharacter: {
      formParty: [
        /* party formation */
      ],
      duration: 3,
      buff: {
        /* combat bonuses */
      },
      cooldown: 5,
      dissolveParty: [
        /* party end */
      ],
    },
    progressionEvent: {
      name: 'Shared Secrets',
      tooltip: 'Learn about their past',
      requirement: {
        condition: 'realm >= meridianOpening',
        tooltip: 'Reach Meridian Opening',
      },
      event: [
        /* backstory reveal */
      ],
    },
  },
  {
    requiredApproval: 15,
    relationshipCategory: 'Intimate',
    name: 'Lover',
    tooltip: 'Your hearts are intertwined.',
    followCharacter: {
      duration: 7,
      buff: {
        /* enhanced bonuses */
      },
      cooldown: 1,
    },
    dualCultivation: {
      condition: '1',
      traits: [lovesPassionate, sensitive],
      intro: [
        /* initiation */
      ],
      success: [
        /* qi gains and bonuses */
      ],
      failure: [
        /* minor setback */
      ],
    },
    progressionEvent: {
      name: 'Eternal Vow',
      tooltip: 'Make your bond permanent',
      requirement: {
        condition: 'realm >= coreFormation',
        tooltip: 'Both reach Core Formation',
      },
      locationOverride: 'Sacred Grove',
      event: [
        /* dao partner ceremony */
      ],
    },
  },
];

// Attach to character
const myCompanion: Character = {
  name: 'Companion Name',
  relationship: companionRelationships,
  // ...other properties
};
```

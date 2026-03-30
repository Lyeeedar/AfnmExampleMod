---
layout: default
title: Character Structure
parent: Character System
nav_order: 1
---

# Character Structure

The `Character` interface defines the core structure for all NPCs in the game, from simple merchants to complex companions.

## Core Character Interface

```typescript
interface Character {
  name: string; // Unique identifier
  displayName?: Translatable; // Optional display name (localisation key or plain string)
  allegiance: string | undefined; // Faction affiliation
  bio?: string; // Character description (optional)
  manualDescription?: string; // Alternate description used in certain UI contexts

  condition: string; // When character appears

  /** Gender used for sexuality filtering on romantic relationship progression events. */
  gender?: 'male' | 'female' | 'neutral';

  definitions: CharacterDefinition[]; // Realm-based definitions
  relationship?: CharacterRelationshipDefinition[]; // Companion only
  relationshipPaths?: Record<string, CharacterRelationshipDefinition[]>; // Named alternate relationship branches
  followInteraction?: FollowCharacterDefinition; // Party mechanics

  portrait: string; // Portrait image path
  image: string; // Full character image
  imageScale?: number; // Image scaling factor

  // Optional stance-specific pose images (used during combat display)
  supportImage?: { image: string; scale: number };
  defensiveImage?: { image: string; scale: number };
  utilityImage?: { image: string; scale: number };
  aggressiveImage?: { image: string; scale: number };
  offensiveImage?: { image: string; scale: number };
  hitImage?: { image: string; scale: number };

  // Optional conditional image override (replaces portrait, image, and pose images when condition is true)
  imageOverride?: {
    image: string;
    portrait: string;
    supportImage?: { image: string; scale: number };
    defensiveImage?: { image: string; scale: number };
    utilityImage?: { image: string; scale: number };
    aggressiveImage?: { image: string; scale: number };
    offensiveImage?: { image: string; scale: number };
    hitImage?: { image: string; scale: number };
    condition: string; // When this override is active
  }[];
}
```

## Character Definitions

Characters can have multiple definitions that activate based on conditions, typically realm progression:

```typescript
type CharacterDefinition =
  | NeutralCharacterDefinition
  | EnemyCharacterDefinition
  | CompanionCharacterDefinition;
```

### Base Definition Properties

All character definitions share these core properties:

```typescript
interface BaseCharacterDefinition {
  kind: 'neutral' | 'enemy' | 'companion';

  condition: string; // When this definition is active

  realm: Realm; // Character's cultivation realm
  realmProgress: RealmProgress; // Early/Middle/Late

  stats: CharacterStats[]; // Combat statistics
  locations: CharacterLocation[]; // Where to find character

  encounters: CharacterEncounter[]; // Random events
  breakthroughEncounter?: CharacterEncounter; // Special encounter

  customInteractions?: CustomCharacterInteractionBlock[]; // Custom actions
}
```

## Character Stats

Combat statistics for when the character is fought:

```typescript
interface CharacterStats {
  condition: string; // When these stats apply
  stats: Omit<
    EnemyEntity,
    'name' | 'image' | 'imageScale' | 'realm' | 'realmProgress'
  >;
}
```

The stats field uses the same structure as `EnemyEntity` with these key properties:

```typescript
interface EnemyEntity {
  difficulty:
    | 'veryeasy'
    | 'easy'
    | 'mediumEasy'
    | 'medium'
    | 'medium+'
    | 'mediumhard'
    | 'hard'
    | 'hard+'
    | 'veryhard'
    | 'veryhard+'
    | 'veryhard++'
    | 'veryhard+++'
    | 'veryhard++++';

  battleLength:
    | 'halfround'
    | '1round'
    | 'veryshort'
    | 'short'
    | 'medium'
    | 'long'
    | 'verylong'
    | 'verylong+'
    | 'verylong++'
    | 'verylong+++'
    | 'verylong++++';

  stances: Stance[]; // Combat stances
  stanceRotation: StanceRule[]; // Rotation logic
  rotationOverrides: SingleStance[]; // Override conditions

  drops: {
    // Loot on defeat
    item: Item;
    amount: number;
    chance: number;
    condition?: string;
  }[];

  talismans?: ItemDesc[]; // Equipment
  artefacts?: ItemDesc[];
  affinities?: Partial<Record<TechniqueElement, number>>; // School affinities

  // Optional properties
  pillsPerRound?: number;
  pills?: {
    condition: string;
    pill: CombatPillItem | ConcoctionItem | CombatItem;
  }[];
  qiDroplets?: number;
  spawnCondition?: {
    hpMult: number;
    buffs: Buff[];
  };
  statMultipliers?: {
    hp?: number;
    power?: number;
  };
}
```

### Stance Structure

```typescript
interface Stance {
  name: string;
  techniques: Technique[]; // Array of technique objects
}

// Stance rotation rules
type StanceRule = SingleStance | RandomStance;

interface SingleStance {
  kind: 'single';
  condition?: string;
  stance: string; // Stance name to use
  repeatable?: boolean;
  alternatives?: StanceRule[];
}

interface RandomStance {
  kind: 'random';
  condition?: string;
  stances: string[]; // Random stance names
  repeatable?: boolean;
  alternatives?: StanceRule[];
}
```

## Location System

Characters move through the world using four location types:

### Static Location

Character stays at one location:

```typescript
{
  kind: 'static',
  condition: '1',
  location: 'Nine Mountain Sect'
}
```

### Wander Location

Character follows a set route:

```typescript
{
  kind: 'wander',
  condition: '1',
  route: [
    {
      location: 'Nine Mountain Sect',
      duration: { min: 2, max: 4 }  // Days at location
    },
    {
      location: 'Shen Henda City',
      duration: { min: 1, max: 2 }
    }
  ]
}
```

### Random Location

Character moves randomly between locations:

```typescript
{
  kind: 'random',
  condition: '1',
  locations: [
    {
      location: 'Crossroads',
      duration: { min: 1, max: 3 }
    },
    {
      location: 'Heian Forest',
      duration: { min: 2, max: 5 }
    }
  ]
}
```

### Star Location

Character positions themselves based on a ranking relative to others. Useful for making a character appear at wherever the player is strongest or weakest:

```typescript
{
  kind: 'star',
  condition: '1',
  mode: 'highest' | 'more' | 'less' | 'lowest',
  fallbackLocation: 'Nine Mountain Sect',
  percentage: 0.7  // Required for 'more' and 'less' modes
}
```

- `highest` — the location where the player has the highest relevant stat
- `lowest` — the location where the player has the lowest relevant stat
- `more` — locations where the player is above `percentage` of the range
- `less` — locations where the player is below `percentage` of the range
- `fallbackLocation` — used when no matching location is found

## Character Encounters

Random events that trigger when meeting the character:

```typescript
interface CharacterEncounter {
  id: string; // Unique encounter ID
  condition: string; // When encounter can trigger
  event: EventStep[]; // Event content
  cooldown: { min: number; max: number }; // Days between triggers
  locations?: string[]; // Specific locations only
}
```

Example encounter:

```typescript
{
  id: 'pi_lip_crafting_request',
  condition: 'realm >= meridianOpening',
  cooldown: { min: 10, max: 20 },
  event: [
    {
      kind: 'text',
      text: 'Pi Lip waves you over excitedly.'
    },
    {
      kind: 'speech',
      character: 'Pi Lip',
      text: 'I need help gathering materials!'
    }
    // More event steps...
  ]
}
```

## Complete Example

```typescript
const myCharacter: Character = {
  name: 'Scholar Wei',
  allegiance: 'Nine Mountains',
  bio: 'A dedicated researcher of ancient cultivation techniques...',

  condition: '1',  // Always available

  portrait: 'assets/wei_portrait.png',
  image: 'assets/wei_full.png',

  definitions: [
    {
      kind: 'neutral',
      condition: '1',
      realm: 'meridianOpening',
      realmProgress: 'Middle',

      stats: [{
        condition: '1',
        stats: {
          difficulty: 'medium',
          battleLength: 'medium',
          stances: [...],
          drops: [
            { name: 'Spirit Stone', amount: 50 }
          ],
          affinities: {
            celestial: 60
          }
        }
      }],

      locations: [{
        kind: 'static',
        condition: '1',
        location: 'Sect Library'
      }],

      encounters: [],

      talkInteraction: [{
        condition: '1',
        event: [
          {
            kind: 'speech',
            character: 'Scholar Wei',
            text: 'Knowledge is the path to immortality.'
          }
        ]
      }],

      shopInteraction: [{
        condition: '1',
        stock: {
          meridianOpening: [
            manualItem1,
            manualItem2
          ]
        },
        costMultiplier: 1.5,
        introSteps: [...],
        exitSteps: [...]
      }]
    }
  ]
};
```

## Registering Characters

Add characters to your mod:

```typescript
window.modAPI.actions.addCharacter(myCharacter);
```

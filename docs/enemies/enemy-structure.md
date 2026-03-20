---
layout: default
title: Enemy Structure
parent: Enemies
nav_order: 1
---

# Enemy Structure

The `EnemyEntity` interface defines the complete structure for all enemies in AFNM. Understanding this structure is essential for creating balanced and engaging combat encounters.

## Core Properties

### Basic Information

```typescript
interface EnemyEntity {
  name: string; // Internal identifier (used in conditions)
  displayName?: Translatable; // Optional player-facing name (overrides name in UI)
  image: string; // Path to enemy sprite/image
  imageScale: number; // Visual scaling factor (typically 0.5-3)
  imageOffset?: {
    // Optional position adjustment
    x: number;
    y: number;
  };
  disableBreathing?: boolean; // Disable idle animation
}
```

### Stance Images

You can provide alternate images that display during specific technique types. Each accepts an optional `scale` and `imageOffset`:

```typescript
{
  supportImage?: { image: string; scale?: number; imageOffset?: { x: number; y: number } };
  defensiveImage?: { image: string; scale?: number; imageOffset?: { x: number; y: number } };
  utilityImage?: { image: string; scale?: number; imageOffset?: { x: number; y: number } };
  aggressiveImage?: { image: string; scale?: number; imageOffset?: { x: number; y: number } };
  offensiveImage?: { image: string; scale?: number; imageOffset?: { x: number; y: number } };
  hitImage?: { image: string; scale?: number; imageOffset?: { x: number; y: number } };
}
```

These swap in automatically when the enemy uses a technique of the matching type. Omit any you do not need.

### Realm & Progression

```typescript
{
  realm: Realm; // Cultivation realm (qiCondensation, meridianOpening, etc.)
  realmProgress: RealmProgress; // Early, Middle, or Late stage
  difficulty: EnemyDifficulty; // Difficulty tier (see below)
  battleLength: BattleLength; // Expected combat duration
}
```

#### Difficulty Tiers

How much damage the enemy will do over its lifetime. Damage per round is `damage / battle length`.

| Tier                         | Description            | Use Case             |
| ---------------------------- | ---------------------- | -------------------- |
| `veryeasy`                   | Trivial opponents      | Tutorial, farming    |
| `easy`                       | Below player level     | Warm-up encounters   |
| `mediumEasy`                 | Slightly below level   | Standard mobs        |
| `medium`                     | Equal to player        | Regular encounters   |
| `medium+`                    | Slightly challenging   | Elite variants       |
| `mediumhard`                 | Moderately challenging | Mini-bosses          |
| `hard`                       | Significant challenge  | Bosses               |
| `hard+`                      | Very challenging       | Elite bosses         |
| `veryhard` to `veryhard++++` | Extreme challenges     | Legendary encounters |

#### Battle Length

How long it should survive.

| Length      | Rounds | Description          |
| ----------- | ------ | -------------------- |
| `halfround` | <1     | Instant kill enemies |
| `1round`    | 1      | Single exchange      |
| `veryshort` | 2-3    | Quick encounters     |
| `short`     | 4-6    | Standard fights      |
| `medium`    | 7-10   | Tactical battles     |
| `long`      | 11-15  | Endurance tests      |
| `verylong`+ | 16+    | Marathon battles     |

#### Note on stats

You cannot set stats directly. They are derived from the difficulty and battle length to give roughly that level of danger. You can then modify these after the fact with `spawnCondition` to add flat multipliers on top if necessary.

## Combat Configuration

### Stances

Stances define technique sequences that enemies cycle through:

```typescript
{
  stances: Stance[];            // Array of available stances
  stanceRotation: StanceRule[]; // Rules for stance switching (single or random)
  rotationOverrides: SingleStance[]; // Conditional overrides — only SingleStance allowed here
}
```

#### Stance Definition

```typescript
interface Stance {
  name: string; // Unique identifier
  techniques: Technique[]; // Ordered technique sequence
}
```

#### Stance Rotation Rules

`stanceRotation` accepts both `SingleStance` and `RandomStance`. `rotationOverrides` only accepts `SingleStance`.

```typescript
type StanceRule = SingleStance | RandomStance;

interface SingleStance {
  kind: 'single';
  stance: string; // Stance name to use
  condition?: string; // Mathematical condition
  repeatable?: boolean; // Can be triggered multiple times
  alternatives?: StanceRule[]; // Fallback options
}

interface RandomStance {
  kind: 'random';
  stances: string[]; // Pool of stances to choose from
  condition?: string;
  repeatable?: boolean;
  alternatives?: StanceRule[];
}
```

### Equipment & Pills

```typescript
{
  clothing?: ItemDesc;       // Worn clothing/armor
  talismans?: ItemDesc[];    // Equipped talismans
  artefacts?: ItemDesc[];    // Equipped artefacts
  affinities?: Partial<Record<TechniqueElement, number>>; // Elemental affinities

  pillsPerRound?: number;    // Pills consumption limit per round
  pills?: {                  // Conditional pill usage
    condition: string;       // When to use (e.g., "hp < 0.5 * maxhp")
    pill: CombatPillItem | ConcoctionItem | CombatItem;
  }[];
}
```

## Special Properties

### Spawn Conditions

```typescript
{
  spawnCondition?: {
    hpMult: number;          // HP multiplier when spawned (e.g. 0.5 to spawn at half health)
    buffs: Buff[];           // Pre-applied buffs
  };

  spawnRoar?: SoundEffectName; // Sound effect on spawn
}
```

### Stat Multipliers

```typescript
{
  statMultipliers?: {
    hp?: number;    // Health multiplier
    power?: number; // Damage multiplier
  };
}
```

### Character Flag

```typescript
{
  isCharacter?: boolean; // True for NPC combatants. Rescales HP to player range and adds defense to compensate
}
```

## Multi-Phase & Party Configuration

### Phases

Enemies can move through distinct combat phases:

```typescript
{
  phases?: EnemyEntity[]; // Additional phases; only processed on the root enemy
}
```

When a phase ends, the game swaps in the next `EnemyEntity` from the `phases` array. Use `rotationOverrides` with HP conditions inside each phase to drive stance flow.

### Party Members

Enemies can fight alongside allies:

```typescript
{
  party?: PartyMemberConfig[];      // Allies that fight on the enemy's side
  preservePartyMembers?: boolean;   // Keep party members alive through phase transitions
}
```

`PartyMemberConfig` is an alias for `EnemyEntity`.

## Rewards Configuration

### Drop System

```typescript
{
  drops: {
    item: Item;         // Item to drop
    amount: number;     // Quantity
    chance: number;     // Drop rate (0-1)
    condition?: string; // Optional condition
  }[];

  shardMult?: number; // Pillar shard multiplier
  qiMult?: number;    // Qi reward multiplier
}
```

### Special Flags

```typescript
{
  hideFromCompendium?: boolean; // Hide from bestiary
  qiDroplets?: number;         // Qi droplet rewards
}
```

## Advanced Configuration

### Preconfigured Combat Entity

For complex enemies, you can provide a complete `CombatEntity` configuration:

```typescript
{
  preconfiguredCombatEntity?: CombatEntity;
}
```

This allows precise control over initial combat state, including custom stat distributions, pre-applied buffs, and rendering configuration.

## Enemy Variant Utilities

The ModAPI provides helpers on `ModAPI.utils` to generate stronger variants of any enemy:

### alpha

```typescript
const alphaBandit = ModAPI.utils.alpha(bandit);
```

- Name gains ` Alpha` suffix
- `imageScale` x1.2
- `statMultipliers.hp` and `statMultipliers.power` both +0.3
- `shardMult` x1.5
- Non-core drop quantities doubled (Spirit Cores and trophies unchanged)
- All `phases` entries recursively alpha-ified

### alphaPlus

```typescript
const eliteBandit = ModAPI.utils.alphaPlus(bandit);
```

- Name gains ` Alpha+` suffix
- `imageScale` x1.35
- `statMultipliers.hp` and `statMultipliers.power` both +0.6
- `shardMult` x2
- Non-core drop quantities tripled
- All `phases` entries recursively alpha-ified

### realmbreaker

Returns an array of enhanced enemies for realmbreaker hunt missions:

```typescript
const horde = ModAPI.utils.realmbreaker(demon); // returns EnemyEntity[]
```

Realmbreaker enemies have escalating power buff stacks and per-round barrier generation.

### corrupted

```typescript
const corruptedBeast = ModAPI.utils.corrupted(beast);
```

- Name set to `'Corrupted Noble'`
- `statMultipliers.hp` and `statMultipliers.power` both +0.35
- All `phases` entries recursively corrupted

## Example Implementation

```typescript
const exampleEnemy: EnemyEntity = {
  name: 'Corrupted Spirit Beast',
  image: 'path/to/sprite.png',
  imageScale: 1.5,
  realm: 'qiCondensation',
  realmProgress: 'Middle',
  difficulty: 'medium',
  battleLength: 'short',

  stances: [
    {
      name: 'aggressive',
      techniques: [clawStrike, bite, clawStrike, roar],
    },
    {
      name: 'defensive',
      techniques: [harden, regenerate, clawStrike],
    },
  ],

  stanceRotation: [
    { kind: 'single', stance: 'aggressive' },
    {
      kind: 'single',
      stance: 'defensive',
      condition: 'hp < 0.3 * maxhp',
    },
  ],

  rotationOverrides: [],

  drops: [
    { item: spiritCore, amount: 1, chance: 0.5 },
    { item: beastFang, amount: 2, chance: 0.8 },
  ],
};
```

## Condition Expressions

Conditions use mathematical expressions with available variables:

- `hp`, `maxhp` - Current and maximum health
- `round` - Current combat round
- `power`, `defense` - Combat stats
- `buffStacks('BuffName')` - Check buff stack count
- `hasBuff('BuffName')` - Check if buff exists
- `enemyhp`, `enemymaxhp` - Target's health values

Examples:

- `"hp < 0.5 * maxhp"` - Below 50% health
- `"round > 3"` - After round 3
- `"buffStacks('Rage') >= 3"` - 3+ Rage stacks

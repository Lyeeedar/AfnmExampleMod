---
layout: default
title: Flags
parent: Core Concepts
---

# Flags

Flags are the game's primary system for storing and tracking state. They allow you to remember player choices, track progress, and control the flow of events.

## What Flags Are

Flags are **key-value pairs** where:

- **Key**: A string identifier (e.g., `"playerMetCharacter"`)
- **Value**: A number that can represent:
  - Simple boolean (0 = false, 1 = true)
  - Counters (0, 1, 2, 3...)
  - Complex data through math expressions

## Types of Flags

### Global Flags

Persistent across the entire game - saved permanently.

```typescript
{
  kind: 'flag',
  flag: 'playerCompletedTutorial',
  value: '1',
  global: true,  // Saved permanently
}
```

### Event Flags

Temporary - only exist during the current event sequence.

```typescript
{
  kind: 'flag',
  flag: 'dialogueChoice',
  value: '2',
  global: false,  // Only for this event
}
```

## Setting Flag Values

Flags store **numbers only**. When setting a flag, the `value` field is evaluated and the resulting number is stored.

```typescript
// These all store numbers:
value: '1'; // Stores: 1
value: 'month'; // Stores: 15 (if current month is 15)
value: 'existingFlag + 1'; // Stores: 6 (if existingFlag was 5)
value: 'power * 2'; // Stores: 200 (if player power is 100)
```

The flag itself contains only the final number - no expression is stored.

## Reading Flags in Conditions

Use flags in `condition` strings to control event flow:

### Simple Checks

```typescript
condition: 'playerMetBoss == 1'; // Has met boss
condition: 'questProgress >= 5'; // Quest far enough
condition: 'tutorialComplete != 1'; // Tutorial not done
```

### Complex Logic

```typescript
// Multiple conditions
condition: 'playerLevel >= 10 && hasWeapon == 1';

// Using OR logic
condition: 'path1Complete == 1 || path2Complete == 1';

// Math operations
condition: 'totalScore >= requiredScore * 2';
```

## Practical Examples

### Tracking Conversations

```typescript
// First time meeting an NPC
{
  kind: 'conditional',
  branches: [
    {
      condition: 'metElderLi == 0',
      children: [
        { kind: 'text', text: 'You encounter Elder Li for the first time.' },
        { kind: 'flag', flag: 'metElderLi', value: '1', global: true }
      ]
    },
    {
      condition: 'metElderLi >= 1',
      children: [
        { kind: 'text', text: 'Elder Li greets you warmly.' }
      ]
    }
  ]
}
```

### Counting Player Actions

```typescript
// Increment a counter each time player helps someone
{
  kind: 'flag',
  flag: 'helpedPeople',
  value: 'helpedPeople + 1',
  global: true
}

// Check if they've helped enough people
{
  kind: 'conditional',
  branches: [
    {
      condition: 'helpedPeople >= 5',
      children: [
        { kind: 'text', text: 'Your reputation for kindness precedes you.' }
      ]
    }
  ]
}
```

### Time-Based Events

```typescript
// Remember what month something happened
{
  kind: 'flag',
  flag: 'festivalMonth',
  value: 'month',
  global: true
}

// Check if enough time has passed
{
  kind: 'conditional',
  branches: [
    {
      condition: 'month - festivalMonth >= 6',
      children: [
        { kind: 'text', text: 'Half a year has passed since the festival.' }
      ]
    }
  ]
}
```

## Flag Organization

Create organized flag constants for maintainability:

```typescript
// In your mod files
export const modFlags = {
  playerMetMaster: 'myMod_playerMetMaster',
  questProgress: 'myMod_questProgress',
  specialChoice: 'myMod_specialChoice',
};

// Use in events
{
  kind: 'flag',
  flag: modFlags.playerMetMaster,
  value: '1',
  global: true
}
```

## Best Practices

1. **Prefix your flags** - Use your mod name to avoid conflicts: `myMod_flagName`
2. **Use meaningful names** - `completedIntroQuest` not `flag1`
3. **Global for persistent data** - Player choices, progress, unlocks
4. **Event flags for temporary state** - Dialogue choices, temporary calculations
5. **Document your flags** - Keep track of what each flag means and its possible values

## Available Global Flags

The game automatically provides these flags in all conditions and expressions:

### Player Stats

- `power`, `defense`, `barrier`, `control`, `intensity`, `critchance`, `lifesteal` - Combat stats
- `maxpool`, `pool`, `maxtoxicity`, `toxicity`, `resistance` - Crafting stats
- `eyes`, `meridians`, `dantian`, `muscles`, `digestion`, `flesh` - Physical stats
- `age`, `lifespan`, `battlesense`, `craftskill`, `artefactslots`, `talismanslots` - Social stats
- `charisma` - Total charisma from items and techniques

### Player State

- `qi` - Current qi amount
- `qiDroplets` - Current qi droplets
- `maxqi` - Maximum qi for breakthrough
- `realmqi` - Qi needed for current realm
- `realm` - Realm as number (0=mundane, 1=bodyForging, etc.)
- `realmProgress` - Progress as number (0=Early, 1=Middle, 2=Late)
- `injured` - 1 if injured/no stances, 0 otherwise

### Inventory & Equipment

- `money` / `spiritstones` - Spirit stones amount
- `favour` - Favour points
- Item names as flag keys (see Flag Helper Function below)
- `storage_` + item flag - Storage stack count
- `equipped_` + item flag - 1 if item equipped
- `clothing`, `cauldron`, `flame`, `artefact`, `talisman` - Equipment realm numbers

### Time & Calendar

- `year` - Current year
- `yearMonth` - Current month (1-12)
- `day` - Current day

### Affinities

- `fist`, `weapon`, `blossom`, `celestial`, `cloud`, `blood` - Affinity levels

### Techniques & Destinies

- `TechniqueName` - 1 if player knows the technique
- `DestinyName` - 1 if player has the destiny
- Destiny upgrade keys with their rank values

### Reputation

- All reputation names as their numeric values

## Flag Helper Function

**Important**: When referencing items by name in conditions, you must use the `flag()` helper function from the mod api to convert item names to valid flag keys.

The `flag()` function converts item names by replacing all non-alphanumeric characters with underscores:

```typescript
const flag = window.modAPI.utils.flag;

// Examples from the actual game:
flag('Greater Spirit Grass'); // becomes: 'Greater_Spirit_Grass'
flag('Boiling Breath Pill'); // becomes: 'Boiling_Breath_Pill'
flag('Corrupt Void Key (III)'); // becomes: 'Corrupt_Void_Key__III_'
```

### Real Game Examples

```typescript
// From shenHenda alchemist buyer event:
condition: `${flag(greaterSpiritGrass.name)} >= 5`;
// Becomes: Greater_Spirit_Grass >= 5

// From character trade conditions:
disableCondition: `${flag(boilingBreathPill.name)} == 0`;
// Becomes: Boiling_Breath_Pill == 0

// Checking storage:
condition: `storage_${flag(corruptVoidKeyIII.name)} == 0`;
// Becomes: storage_Corrupt_Void_Key__III_ == 0
```

## Usage Examples

```typescript
// Check if player is strong enough
condition: 'power >= 100';

// Check cultivation level
condition: 'realm >= 4'; // Core Formation or higher

// Check if player has item (using proper flag conversion)
condition: 'Starshard >= 5'; // Simple name works
condition: 'Spirit_Grass >= 10'; // Complex names need flag() conversion

// Check equipment
condition: 'equipped_celestial_crown == 1';

// Time-based checks
condition: 'yearMonth >= 6'; // Summer or later

// Complex conditions
condition: 'realm >= 3 && power >= 50 && money >= 1000';
```

Flags are fundamental to creating dynamic, responsive content that remembers the player's journey through your mod.

---

[← Core Concepts](/concepts/index/) | [Events →](/concepts/concepts-events/)

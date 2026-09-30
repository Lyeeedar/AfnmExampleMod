---
layout: default
title: Flags System
parent: Core Concepts
nav_order: 1
description: 'State management and tracking in AFNM mods'
---

# Flags System

## Introduction

Flags are the backbone of state management in Ascend from Nine Mountains. They serve as the game's memory system, allowing you to track player choices, quest progress, character interactions, and any other persistent or temporary data your mod needs to remember.

Think of flags as a simple database where you can store numbers and retrieve them later to make decisions about how events unfold.

## Core Concepts

### What Are Flags?

Flags are **key-value pairs** consisting of:

- **Key**: A unique string identifier (e.g., `"playerMetElder"`)
- **Value**: A numeric value that can represent booleans, counters, or complex data

### Flag Types

**Global Flags**

- Persist across the entire game session
- Saved permanently with the game state
- Use for: player progress, unlocked content, important choices

**Event Flags**

- Temporary storage during event sequences
- Automatically cleared when the event ends
- Use for: dialogue branches, temporary calculations, step-by-step logic

## Deep Dive: Flag Mechanics

### Setting Flag Values

When you set a flag, the `value` field is evaluated as a mathematical expression, and the resulting number is stored:

```typescript
{
  kind: 'flag',
  flag: 'questProgress',
  value: 'questProgress + 1',  // Evaluates current value + 1
  global: true
}
```

**Expression Examples:**

```typescript
value: '1'; // Stores: 1
value: 'month'; // Stores: current month (e.g., 15)
value: 'existingFlag + 1'; // Stores: previous value + 1
value: 'power * 2'; // Stores: player's power x 2
```

### Reading Flags in Conditions

Use flags in `condition` strings to control event flow:

```typescript
// Simple boolean check
condition: 'playerMetBoss == 1';

// Numeric comparison
condition: 'questProgress >= 5';

// Complex logic with multiple flags
condition: 'playerLevel >= 10 && hasWeapon == 1';

// Mathematical operations
condition: 'totalScore >= requiredScore * 2';
```

## Practical Examples

### Tracking First Meetings

```typescript
{
  kind: 'conditional',
  branches: [
    {
      condition: 'metElderLi == 0',
      children: [
        {
          kind: 'text',
          text: 'You encounter Elder Li for the first time.'
        },
        {
          kind: 'flag',
          flag: 'metElderLi',
          value: '1',
          global: true
        }
      ]
    },
    {
      condition: 'metElderLi >= 1',
      children: [
        {
          kind: 'text',
          text: 'Elder Li greets you warmly.'
        }
      ]
    }
  ]
}
```

### Progressive Counters

```typescript
// Increment helper counter
{
  kind: 'flag',
  flag: 'helpedPeople',
  value: 'helpedPeople + 1',
  global: true
}

// Check reputation threshold
{
  kind: 'conditional',
  branches: [
    {
      condition: 'helpedPeople >= 5',
      children: [
        {
          kind: 'text',
          text: 'Your reputation for kindness precedes you.'
        }
      ]
    }
  ]
}
```

### Time-Based Logic

```typescript
// Remember when something happened
{
  kind: 'flag',
  flag: 'festivalMonth',
  value: 'yearMonth',
  global: true
}

// Check elapsed time
{
  kind: 'conditional',
  branches: [
    {
      condition: 'month - festivalMonth >= 6',
      children: [
        {
          kind: 'text',
          text: 'Half a year has passed since the festival.'
        }
      ]
    }
  ]
}
```

## Built-in Game Flags

The game automatically provides numerous flags representing the current game state. These are available in all `condition` strings and `value` expressions.

### Player Stats

Combat and crafting stats, each backed by the player's current entity values:

- `power`, `defense`, `barrier` - Combat stats
- `control`, `intensity` - Crafting stats
- `qi` - Current Qi
- `maxqi` - Maximum Qi (breakthrough-scaled)
- `realmqi` - Qi required for the next realm milestone
- `qiDroplets` - Current Qi Droplets
- `realm` - Realm index (`mundane` = 0, `bodyForging` = 1, ..., `soulAscension` = 9)
- `realmProgress` - Realm progress index (Foundation = 0, Establishment = 1, etc.)
- `money`, `spiritstones` - Both point to the same inventory gold field; `spiritstones` is the conventional name in conditions
- `favour` - Current faction favour

### Time and Calendar

- `year`, `month`, `yearMonth`, `day` - Current game time
- `month` - Total game months elapsed (increments by 1 each month; use for time-difference calculations)
- `yearMonth` - The current month in the year, 1 to 12

### Character State

- `age`, `lifespan` - Character age and remaining lifespan in years
- `injured` - `1` when HP is critically low or the character has no stances
- `charisma` - Current charisma value

### Affinities and Ranks

- Affinity levels: `fist`, `weapon`, `blossom`, `celestial`, `cloud`, `blood`
- Sect rank helpers: `innerDisciple`, `coreDisciple`, `elder` - each `1` when at or above that rank

### Inventory and Equipment

- Item names as flags, set to the stack count in inventory
- `storage_` + item flag - Storage quantities
- `equipped_` + item flag - `1` when the item is equipped
- `recipe_` + item flag - `1` when the recipe is known

### Buff Stacks

Active buff stacks are exposed as `buff_<flagName>` for use in conditions:

```typescript
condition: 'buff_Flow >= 5'; // Check Flow buff stack count
```

### Expedition and Combat

- `expeditionAlone` - `1` when the player entered the expedition without party members
- `activeFallenStars` - Number of currently active fallen star sites

### Realm and Rarity Indices

All realm and rarity names are exposed as their index values, useful for comparisons:

```typescript
condition: 'realm >= 5'; // Core Formation or above
```

Realms: `mundane` = 0, `bodyForging` = 1, `meridianOpening` = 2, `qiCondensation` = 3, `coreFormation` = 4, `pillarCreation` = 5, `lifeFlourishing` = 6, `worldShaping` = 7, `innerGenesis` = 8, `soulAscension` = 9

Rarities: `mundane` = 0, `qitouched` = 1, `empowered` = 2, `resplendent` = 3, `incandescent` = 4, `transcendent` = 5

## Advanced Techniques

### Flag Helper Function

For items with complex names, use the `flag()` helper to convert names to valid flag keys:

```typescript
const flag = window.modAPI.utils.flag;

// Convert item names properly
flag('Greater Spirit Grass'); // becomes: 'Greater_Spirit_Grass'
flag('Corrupt Void Key (III)'); // becomes: 'Corrupt_Void_Key__III_'

// Use in conditions
condition: `${flag(itemName)} >= 5`;
condition: `storage_${flag(itemName)} > 0`;
```

### Organized Flag Management

```typescript
// Define flag constants for maintainability
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

## Tips and Best Practices

### Naming Conventions

- **Prefix your flags**: Use `myMod_flagName` to avoid conflicts
- **Use descriptive names**: `completedIntroQuest` not `flag1`
- **Be consistent**: Establish patterns and stick to them

### Storage Strategy

- **Global flags** for persistent data: player choices, progress, unlocks
- **Event flags** for temporary state: dialogue options, calculations
- **Document your flags**: Keep track of meanings and possible values

### Common Patterns

```typescript
// Boolean flags (0 = false, 1 = true)
condition: 'hasKeyItem == 1';

// Threshold checks for progression
condition: 'questStage >= 3';

// Time-based unlock conditions
condition: 'month >= 6 && completedPreQuest == 1';

// Resource requirement checks
condition: 'money >= 1000 && power >= 50';
```

The flags system is incredibly flexible and powerful. Master it, and you will be able to create dynamic, responsive content that adapts to each player's unique journey through your mod.

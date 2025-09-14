---
layout: default
title: Getting Started
---

# Getting Started with Modding

This guide will walk you through creating your first mod for Ascend from Nine Mountains using the TypeScript-based modding API.

## Prerequisites

- **Node.js**
- **npm**
- **Text editor** with TypeScript support (VS Code recommended)
- **Basic TypeScript/JavaScript knowledge**

## Setting Up Your Mod Project

### 1. Clone the Example Mod

Start by cloning or downloading this example mod project as a template:

```bash
git clone [repository-url] my-afnm-mod
cd my-afnm-mod
npm install
```

### 2. Project Structure

Your mod project follows this structure:

```
my-afnm-mod/
├── src/
│   ├── mod.ts              # Main mod entry point
│   ├── modContent/
│   │   └── index.ts        # Your mod content goes here
│   ├── assets/             # Images and other assets
│   └── global.d.ts         # TypeScript declarations
├── package.json            # Project configuration
├── webpack.config.js       # Build configuration
└── builds/                 # Compiled mod files
```

### 3. Understanding the Mod API

The modding system provides three main components through `window.modAPI`:

#### `modAPI.actions`

Functions to add content to the game:

- `addItem()` - Add new items
- `addTechnique()` - Add combat techniques
- `addCharacter()` - Add NPCs
- `addLocation()` - Add new areas
- And many more...

#### `modAPI.gameData`

Access to existing game data for reference:

- `items` - All game items
- `techniques` - All combat techniques
- `techniqueBuffs` - Predefined combat buffs
- `characters` - All NPCs
- And much more...

#### `modAPI.utils`

Utility functions for common tasks:

- Enemy scaling functions (`alpha`, `corrupted`)
- Quest creation helpers
- Statistical calculations

## Creating Your First Item

Let's create a simple treasure item. In `src/modContent/index.ts`:

```typescript
import { TreasureItem } from 'afnm-types';
import icon from '../assets/image.png';

const myTreasure: TreasureItem = {
  kind: 'treasure',
  name: 'Ethereal Crystal Shard',
  description:
    'A small fragment of crystallized spiritual energy. Its surface shimmers with otherworldly light.',
  icon: icon,
  stacks: 1,
  rarity: 'qitouched',
  realm: 'coreFormation',
  valueTier: 3,
};

window.modAPI.actions.addItem(myTreasure);
```

## Creating Your First Technique

Here's how to add a combat technique (based on the game's Palm Blast technique):

```typescript
import { Technique } from 'afnm-types';
import icon from '../assets/technique-icon.png';

const myTechnique: Technique = {
  name: 'Spirit Palm',
  icon: icon,
  type: 'fist',
  realm: 'bodyForging',
  costs: [
    {
      buff: window.modAPI.gameData.techniqueBuffs.fist.flow,
      amount: 1,
    },
  ],
  effects: [
    {
      kind: 'damage',
      amount: {
        value: 1.5,
        stat: 'power',
      },
    },
  ],
};

window.modAPI.actions.addTechnique(myTechnique);
```

## Building Your Mod

1. **Development Build:**

   ```bash
   npm run build
   ```

2. **Package for Distribution:**
   ```bash
   npm run zip
   ```

This creates a `.zip` file in the `builds/` directory ready for distribution.

## Installing Your Mod

1. Place the `.zip` file in the game's mods directory
2. Launch the game
3. Your mod content will be automatically loaded

## Core Modding Concepts

### Cultivation Realms

The game's progression is built around cultivation realms. Content must be balanced for specific realms:

- `mundane` - No cultivation (Tier -)
- `bodyForging` - First cultivation realm (Tier I)
- `meridianOpening` - (Tier II)
- `qiCondensation` - (Tier III)
- `coreFormation` - (Tier IV)
- `pillarCreation` - (Tier V)
- `lifeFlourishing` - (Tier VI)
- And higher...

Items and techniques should specify their appropriate realm for proper game balance.

### Rarity System

Items have six rarity tiers that affect their power and value:

- `mundane` - Basic items (Tier I)
- `qitouched` - Slightly enhanced (Tier II)
- `empowered` - Notably powerful (Tier III)
- `resplendent` - Very rare (Tier IV)
- `incandescent` - Extremely rare (Tier V)
- `transcendent` - Legendary tier (Tier VI)

## Next Steps

Once you can build and install your first mod:

1. Study [Core Concepts](concepts/)
2. Browse [Asset Types](assets/) for specific content creation guides

---

[← Home](index.md) | [Core Concepts →](concepts/)

---
layout: default
title: Project Setup
parent: Your First Mod
grand_parent: Guides
nav_order: 1
description: 'Understanding mod structure and development workflow'
---

# Step 1: Project Setup

Before writing any code, let's understand how AFNM mods are organized and why structure matters for successful mod development.

## Understanding Mod Architecture

AFNM mods follow a **modular architecture** where each game system has its own folder:

```
src/modContent/
├── index.ts          # Main entry point - orchestrates everything
├── items/            # Item definitions (materials, consumables, equipment)
├── characters/       # NPC definitions (dialogue, shops, combat stats)
├── locations/        # Custom buildings and location modifications
├── quests/           # Quest definitions and storylines
├── events/           # Triggered events and quest distribution
├── techniques/       # Combat techniques and cultivation abilities
└── crops/            # Farmable plants and materials
```

## Why This Structure Matters

### Dependency Management

Game systems depend on each other in a specific order:

```
Items (foundation)
  ↓
Characters (sell/use items)
  ↓
Locations (contain characters & items)
  ↓
Quests (reference all of the above)
  ↓
Events (distribute quests)
```

### AFNM Conventions

This structure matches the base game, making your mod feel native and professional.

## The index.ts Entry Point

Every mod needs a main initialization file. This file is responsible for:

1. **Importing** all mod systems
2. **Initializing** them in the correct order
3. **Providing logging** for debugging

Here's the pattern we'll follow:

```typescript
// Import all initialization functions
import { initializeTeaItems } from './items/teaItems';
import { initializeTeaCharacters } from './characters/teaMasters';
import { initializeTeaQuests } from './quests/teaQuests';
// ... etc

function initializeMod() {
  console.log('🍵 Initializing Tea House Mod...');

  initializeTeaItems();
  initializeTeaCharacters();
  initializeTeaQuests();

  console.log('✅ Tea House Mod loaded successfully!');
}

initializeMod();
```

## Core AFNM Concepts

### ModAPI Interface

All game interaction happens through `window.modAPI`:

```typescript
// Adding content to the game
window.modAPI.actions.addItem(myItem);
window.modAPI.actions.addCharacter(myNPC);
window.modAPI.actions.addQuest(myQuest);

// Accessing game data
const existingLocation = window.modAPI.gameData.locations['Liang Tiao Village'];
const buffDefinition = window.modAPI.gameData.techniqueBuffs.fist.flow;
```

### TypeScript Integration

AFNM uses **strict TypeScript** for good reasons:

- **Catch errors early** - Before they crash the game
- **IntelliSense support** - Auto-completion shows available properties
- **API documentation** - Types document what properties are required
- **Refactoring safety** - Changes propagate correctly throughout code

**Never use `any` types** - they bypass all safety mechanisms.

## Setting Up Your Environment

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Verify TypeScript works**:

   Open the project in VS Code and check the Problems panel for any TypeScript errors

3. **Set up your editor** for TypeScript auto-completion and error highlighting

## Next Steps

Now that you understand the architecture, let's start building content. We'll begin with the foundation that everything else depends on: [creating items](02-creating-items.md).

The items we create will be used by:

- Characters (in their shops)
- Locations (for brewing interactions)
- Quests (as rewards and requirements)
- Events (given to players)

---
layout: default
title: Packaging & Testing
parent: Guides
nav_order: 3
description: 'Building and testing your AFNM mod'
---

# Packaging & Testing

## Introduction

Once you've created your mod content, you need to package it for distribution and thoroughly test it to ensure it works correctly in the game. This guide covers the build process, testing strategies, to allow you to quickly get your ideas into the game.

The packaging system compiles your TypeScript code, bundles assets, and creates a distributable ZIP file that the game can load.

## Building Your Mod

### The Build Process

When you run the build command, several things happen automatically:

1. **TypeScript Compilation** - Your `.ts` files are compiled to a single JavaScript file
2. **Asset Bundling** - Images and other resources are processed and included
3. **ZIP Creation** - Everything is packaged into a single mod file

```bash
# Standard build - creates distributable mod
npm run build
```

### Build Output

After running `npm run build`, you'll find your packaged mod in the `builds/` folder:

```
builds/
└── my-mod-1.0.0.zip
    ├── mod.js           # Compiled mod code
    ├── assets/          # Your images and resources
    │   ├── items/
    │   ├── characters/
    │   └── locations/
    └── package.json     # Mod metadata
```

### Build Configuration

The build process is configured through several files:

**`package.json`** - Contains mod metadata that appears in-game:

```json
{
  "name": "my-cultivation-mod",
  "version": "1.0.0",
  "description": "Adds new tea-based cultivation techniques",
  "author": {
    "name": "TeaMaster"
  }
}
```

**`tsconfig.json`** - TypeScript compilation settings (usually no changes needed)

**`vite.config.ts`** - Build tool configuration (advanced users only)

## Testing Your Mod

### Setting Up Test Environment

To test your mod, you need to install it in the game:

1. **Locate your game directory** - Find where the game executable is installed
2. **Create a mods folder** - Make a new `mods/` directory next to the game exe
3. **Copy your mod** - Place your built ZIP file in the mods folder

**Final structure:**

```
Game Directory/
├── Ascend from Nine Mountains.exe
└── mods/
    └── my-cultivation-mod-1.0.0.zip
```

Then restart the game, and you should see your mod be loaded.

### Enabling Debug Mode

For easier testing and debugging, enable dev mode:

1. **Create a devMode file** - Add an empty file named `devMode` (no extension) next to the game exe
2. **Enhanced logging** - The game will show detailed console output
3. **Error visibility** - Mod errors will be clearly displayed

**Structure with dev mode:**

```
Game Directory/
├── Ascend from Nine Mountains.exe
├── devMode                          # Empty file, no extension
└── mods/
    └── my-cultivation-mod-1.0.0.zip
```

Your mod is now ready for thorough testing! Once you're confident it works correctly, you can move on to publishing it for the community.

Next: **[Publishing Your Mod](publishing)**

# AFNM Mod Guide

## Quick Overview

This project provides a complete framework for creating mods for **Ascend From Nine Mountains**. You can find the game [here](https://store.steampowered.com/app/3992260/Ascend_From_Nine_Mountains/).

## Documentation

For comprehensive guides on modding AFNM, visit our **[complete documentation site](https://lyeeedar.github.io/AfnmExampleMod/)**:

### Step-by-Step Guides

- **[Project Setup](https://lyeeedar.github.io/AfnmExampleMod/guides/project-setup.html)** - Environment setup and first steps
- **[Mod Development](https://lyeeedar.github.io/AfnmExampleMod/guides/mod-development)** - Using the ModAPI and building content
- **[Packaging & Testing](https://lyeeedar.github.io/AfnmExampleMod/guides/packaging-testing)** - Building and testing your mod
- **[Publishing](https://lyeeedar.github.io/AfnmExampleMod/guides/publishing)** - Releasing to Steam Workshop
- **[Your First Mod](https://lyeeedar.github.io/AfnmExampleMod/guides/first-mod)** - Full guide putting the above steps together to make a mod

### Core Concepts

- **[Flags System](https://lyeeedar.github.io/AfnmExampleMod/concepts/flags)** - State management and tracking
- **[Scaling System](https://lyeeedar.github.io/AfnmExampleMod/concepts/scaling)** - Dynamic value calculations
- **[ModAPI](https://lyeeedar.github.io/AfnmExampleMod/concepts/modapi)** - Overview of the modding API

## Quick Start

Use **Node.js 22 or newer**. This template targets **AFNM 0.7.16** with **React 19.3** and **Material UI 9.4**. Keep `afnm-types` and the UI packages compatible with the game version you are modding.

1. **Clone/fork** this repository
2. **Install dependencies**: `npm install`
3. **Edit** `package.json` with your mod details
4. **Start coding** in `src/modContent/index.ts`
5. **Check types**: `npm run typecheck`
6. **Build your mod**: `npm run build`
7. **Test** by placing the ZIP from `builds/` in the game's `mods/` folder

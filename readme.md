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

1. **Clone/fork** this repository
2. **Install dependencies**: `npm install`
3. **Edit** `package.json` with your mod details
4. **Start coding** in `src/modContent/index.ts`
5. **Build your mod**: `npm run build`
6. **Test** by placing the zip in the game's `mods/` folder

## Documentation checks

Run `npm test` before changing the guides or upgrading `afnm-types`. It scans every TypeScript fence under `docs/`, checks complete object examples and documented interface fields against the installed types, verifies ModAPI paths, and compiles the assembled Tea House tutorial. Regression checks ensure missing character gender, invalid nested scaling, and removed API actions are rejected. `npm run validate-docs` runs the documentation checks without the regression fixtures; `npm run typecheck` checks the template source.

Field-only snippets and API signature listings are illustrative fragments. References to mod-specific assets and content are treated as external inputs; use an in-game test to verify those resources and runtime behavior.

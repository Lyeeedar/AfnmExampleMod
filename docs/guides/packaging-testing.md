---
layout: default
title: Packaging & Testing
parent: Guides
nav_order: 3
description: 'Building and testing your AFNM mod'
---

# Packaging & Testing

Build the same ZIP you intend to distribute, install it locally, and test the route a player takes to reach your content.

## Building Your Mod Package

Set `name`, `version`, `description`, and `author.name` in your project's `package.json`. The template uses `name` and `version` for the ZIP filename and embeds the metadata in the JavaScript bundle. The entry point in `src/mod.ts` imports your content and exports `getMetadata()`, which the game calls when it loads the mod. The template supplies `gameVersion` from `afnm-types`, so keep that dependency aligned with the game version you are testing. See [Project Setup](project-setup#keeping-dependencies-compatible).

From the project root, run:

```bash
npm run build
```

Find the ZIP in `builds/`. For a project named `mystic-tea-cultivation` at version `1.0.0`, the output is `builds/mystic-tea-cultivation-1.0.0.zip`. Open it in an archive viewer to check its layout:

```text
mystic-tea-cultivation-1.0.0.zip
├── mod.js
├── assets/          # Included if the mod imports assets
└── translations/    # Included if the project supplies translation JSON files
```

The loader reads `mod.js` from the root of the ZIP. If you package the build output yourself, put `mod.js` and its companion directories directly at the archive root. A ZIP containing an outer project directory will fail to load.

If the build cannot resolve an image, check the import path relative to the source file that imports it. If the build reports TypeScript errors, resolve them before copying a ZIP from `builds/`, since that folder may still contain an earlier build.

## Installing Your Mod for Testing

1. Find the `mods/` directory for the game you will launch. Create it if needed.

   | Game installation | Location of `mods/` |
   | --- | --- |
   | Packaged game | Beside the game executable. For Steam, use **Properties → Installed Files → Browse** to locate the installation. |
   | Linux AppImage | Beside the `.AppImage` file you launch. |
   | Game running from a development checkout | Under the game application root. |

2. Copy the built archive directly into `mods/`. Use a lowercase `.zip` extension and leave the archive intact. The local scan checks files directly inside `mods/`.
3. Start the game and make sure the local mod is enabled. When iterating, keep one copy of your test mod in `mods/`. If you change the package version, remove the older ZIP before restarting so the loader finds only the intended build.

## Testing Your Mod In-Game

1. Use a test save that meets the requirements you authored. For content that runs at character creation, test with a fresh character.
2. Follow the content's distribution path. For a shop item, visit the shop where you registered the stock, then check the item's name and icon, purchase it, and try its effect. For a quest reward, complete the relevant objective and verify that the intended reward arrives.
3. If your content has a condition, also test with the condition unmet. For example, try a realm-gated item with eligible and ineligible characters to check the restriction you configured.

### Troubleshooting

| Symptom | What to check |
| --- | --- |
| The local ZIP is missing from mod loading | Check the platform-specific directory above, the `.zip` extension, and that the archive is directly inside `mods/`. |
| The ZIP is found but fails to load | Check the mod loading error for the failing step. Verify that `mod.js` is at the archive root, that `src/mod.ts` exports the template's `getMetadata()`, and that it imports your registration code. |
| The mod loads but its content is missing | Trace both registration and distribution. For example, `window.modAPI.actions.addItem()` registers an item definition, and `addItemToShop()` places stock in a shop. Check the names used by both calls and the authored availability requirements. See the [ModAPI reference](../concepts/modapi). |
| Content appears but artwork is missing | Check the source import, inspect the ZIP for the emitted asset, and retest with the rebuilt archive. |

For each iteration, rebuild, replace the test archive, restart the game, and repeat the in-game action that reaches the changed content. Once the ZIP passes your checks, continue to [Publishing Your Mod](publishing).

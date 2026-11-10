---
layout: default
title: Packaging & Testing
parent: Guides
nav_order: 3
description: 'Building and testing your AFNM mod'
---

# Packaging & Testing

## What This Guide Covers

Now that you've created mod content, you need to package it into a format the game can understand and test it thoroughly. This guide will show you how to:

- Build your mod into a distributable package
- Install and test your mod in the actual game
- Debug common issues and verify everything works
- Set up a smooth development workflow

Think of packaging as "exporting" your mod from development format into something the game can load and run.

## Building Your Mod Package

### The Build Process Explained

The template bundles `src/mod.ts`, which imports your content from `src/modContent/index.ts`. Keep that wrapper and its default export containing `getMetadata()` so the game can identify the loaded mod. Add your content imports and registration calls under `modContent`, following [Mod Development](mod-development).

### Building Your Mod

From the project root, run:

```bash
npm run typecheck
npm run build
```

The template's build script extracts mod translation strings before Webpack runs. Webpack compiles the code, emits imported assets and embeds the metadata from `package.json`. The postbuild scripts copy translation JSON files and ZIP the contents of `dist/<package-name>/` into `builds/<package-name>-<version>.zip`.

Check that both commands succeed and that the ZIP has a fresh modification time. Before distributing it, open the archive and check its contents.

### Understanding Build Output

For a project named `mystic-tea-cultivation` at version `1.0.0`, the ZIP layout is:

```
builds/mystic-tea-cultivation-1.0.0.zip
├── mod.js
├── mod.js.map
├── assets/
│   └── vigor-pill.png
└── translations/
    └── ...json files copied from your project's translations folder
```

Assets and translation files depend on your project contents. `mod.js` must be directly at the archive root. ZIP the contents of the output directory, without an enclosing project or `dist` folder. The loader extracts the archive and reads that root `mod.js`.

### Build Configuration Files

- `package.json` supplies the mod name, version, description and author. The template embeds these in the JavaScript metadata export. A separate `package.json` inside the ZIP is not required. See [Personalizing Your Mod](project-setup#personalizing-your-mod).
- `src/mod.ts` supplies `getMetadata()` and the game version from `afnm-types`.
- `webpack.config.js` keeps the bundle name `mod.js`, the `AFNMMod` default export and the `mod://` asset prefix. Preserve these settings when customizing the build so the loader can find the module and resolve packaged assets.
- `tsconfig.json` controls TypeScript checking.

### Common Build Issues

**"Cannot find module '../assets/my-image.png'"**

- Your image file path is wrong or the file doesn't exist
- Solution: Check the file exists and the import path is correct

**"Build failed with TypeScript errors"**

- There are syntax errors in your code
- Solution: Look at the error messages, fix the red underlines in VS Code

**"Out of memory" or very slow builds**

- Your image files might be too large
- Solution: Resize images to the recommended sizes (256x256 for items, 1536x1536 for characters) and ensure files are under 100KB each

## Installing Your Mod for Testing

### Step 1: Find Your Game Installation

**Steam version:**

1. Open Steam Library
2. Right-click "Ascend from Nine Mountains"
3. Properties → Installed Files → Browse
4. This opens your game directory

**Typical locations:**

- **Steam:** `C:\Program Files (x86)\Steam\steamapps\common\Ascend from Nine Mountains\`
- **Direct download:** Wherever you installed it

**You should see:** `Ascend from Nine Mountains.exe` in this folder

### Step 2: Create Mods Folder

**In your game directory:**

1. Create a new folder called `mods` (lowercase, no spaces)
2. **Final structure should be:**
   ```
   Ascend from Nine Mountains/           # ← Game directory
   ├── Ascend from Nine Mountains.exe    # ← Game executable
   └── mods/                             # ← New folder you create
   ```

### Step 3: Install Your Mod

1. **Copy your mod ZIP file** from your project's `builds/` folder
2. **Paste it into the `mods/` folder** you just created
3. **Do NOT unzip it** - the game loads ZIP files directly

**Final structure:**

```
Ascend from Nine Mountains/
├── Ascend from Nine Mountains.exe
└── mods/
    └── mystic-tea-cultivation-1.0.0.zip    # ← Your mod
```

## Verifying API Compatibility

Use the `afnm-types` version for the game you are testing and run `npm run typecheck` before packaging. Consult the [ModAPI reference](../concepts/modapi) for registration methods and [Lifecycle Hooks](../advanced-mods/lifecycle-hooks) for callbacks. Keep the template's metadata wrapper so loading errors can identify a game-version mismatch.

Test the specific API through a small mod-owned definition or callback. For an item, register it with `addItem`, distribute it with `addItemToShop`, then purchase and use it as described in [Mod Development](mod-development#your-first-item---step-by-step). For a hook, use the registration and testing steps in its lifecycle reference. Check the mod's loading result as well as its behavior in-game. Finding an identifier in an installed bundle does not establish that a mod can call it or that its inputs are supported.

## Testing Your Mod In-Game

### Step 1: Launch the Game

1. **Start the game** normally (from Steam or by double-clicking the exe)
2. **Check the main menu** - you should see mod loading messages
3. **Look for your mod name** in the loading text

**Signs your mod loaded successfully:**

- No error popups on startup
- Mod name appears in loading messages
- Game starts normally

### Direct Binary Testing Without Steam Relaunch Loops

If you need to launch the executable directly instead of going through Steam, current runtimes support a `disable_steam` sentinel file beside the game executable.

**Safe workflow:**

1. Create an empty file named `disable_steam` beside the executable
2. Launch using `launch-native.sh` (Linux), or the executable directly
3. For browser DevTools access, launch with `--remote-debugging-port=9222` and open `chrome://inspect` in Chrome
4. Delete `disable_steam` when you finish testing

**Critical warning:** If you leave `disable_steam` behind, Workshop mods will stop loading until you remove it. Always clean up after testing.

```bash
# Linux example
touch "/path/to/Ascend From Nine Mountains/disable_steam"
"/path/to/Ascend From Nine Mountains/launch-native.sh"
# When done:
rm "/path/to/Ascend From Nine Mountains/disable_steam"
```

### Step 2: Test Your Content

**If you created an item (like our Mystic Tea example):**

1. **Start a new game** or load an existing save
2. **Visit the shop** where you added your item (e.g., Liang Tiao Village)
3. **Look for your item** in the shop inventory
4. **Try purchasing and using it**

**What to verify:**

- ✅ Item appears in shop with correct name and icon
- ✅ Item can be purchased (if you have enough money)
- ✅ Item effects work when consumed
- ✅ No error messages or crashes

### Enabling Debug Mode (Highly Recommended)

Debug mode shows detailed information about what's happening, making it much easier to troubleshoot issues.

**To enable debug mode:**

1. **Go to your game directory** (same folder as the exe)
2. **Create a new file** called `devMode` (no file extension)
   - Right-click in empty space → New → Text Document
   - Name it `devMode` (delete the `.txt` part)
3. **Restart the game**

**With debug mode enabled:**

- Console window appears showing detailed logs
- Mod loading information is visible
- Error messages are more descriptive
- You can see exactly what your mod is doing

**Structure with debug mode:**

```
Ascend from Nine Mountains/
├── Ascend from Nine Mountains.exe
├── devMode                              # ← Empty file, no extension
└── mods/
    └── mystic-tea-cultivation-1.0.0.zip
```

### Reading Debug Output

**Good signs in debug console:**

```
Loading mod: mystic-tea-cultivation-1.0.0.zip
Mod loaded successfully: mystic-tea-cultivation
Added item: Mystic Tea
Added item to shop: Mystic Tea at Liang Tiao Village
```

**Warning signs:**

```
Error loading mod: mystic-tea-cultivation-1.0.0.zip
TypeError: Cannot read property 'addItem' of undefined
Image not found: ../assets/missing-image.png
```

## Troubleshooting Common Issues

### Mod Not Loading

**"Mod doesn't appear in loading messages"**

- Check ZIP file is in correct `mods/` folder
- Ensure file isn't corrupted (try rebuilding: `npm run build`)
- Verify game directory is correct

**"Mod loads but content doesn't appear"**

- Enable debug mode to see error messages
- Check your `package.json` has correct mod name
- Verify you're calling `window.modAPI.actions.addItem()` etc.

### Content Not Working

**"Item doesn't appear in shop"**

- Verify the location name is spelled correctly ('Liang Tiao Village')
- Check you called both `addItem()` and `addItemToShop()`
- Ensure your realm requirement isn't too high

**"Images not showing"**

- Check image files exist in `src/assets/`
- Verify import paths are correct (`../assets/my-image.png`)
- Try rebuilding your mod

**"Effects not working"**

- Check effect names are spelled correctly ('restoreQi' not 'restoreQI')
- Verify syntax matches the examples
- Enable debug mode to see runtime errors

### Performance Issues

**"Game is slow/laggy with mod"**

- Check image file sizes (should be under 100KB each)
- Avoid creating too many items/NPCs at once
- Use `npm run build` not `npm run dev` for testing

## Development Workflow

### Efficient Testing Cycle

**For quick iteration:**

1. **Make changes** to your mod code
2. **Build:** `npm run build`
3. **Copy new ZIP** to game's `mods/` folder (overwrite old one)
4. **Restart game** to test changes
5. **Repeat**

**Pro tip:** Keep both VS Code and the game folder open in separate windows for quick file copying.

### Version Management

**Before major changes:**

```bash
# Save your current work
git add .
git commit -m "Working tea item before adding NPCs"
```

**When releasing updates:**

```json
// In package.json, bump the version
"version": "1.0.1"  // Increment for bug fixes
"version": "1.1.0"  // Increment for new features
```

## Next Steps

🎉 **Excellent!** Your mod is now working in-game. You've successfully:

**✅ Completed the full development cycle:**

- Created mod content with the ModAPI
- Built a distributable package
- Installed and tested in the actual game
- Learned to debug issues when they arise

**Ready to share your creation?** The final step is publishing to Steam Workshop so other players can enjoy your mod.

Continue to: **[Publishing Your Mod](publishing)**

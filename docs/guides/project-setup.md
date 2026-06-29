---
layout: default
title: Project Setup
parent: Guides
nav_order: 1
description: 'Setting up your development environment for AFNM modding'
---

# Project Setup

## What We're Building

In this guide, you'll set up a complete modding environment that lets you:

- Write mod code with helpful auto-completion (IntelliSense)
- Automatically build and package your mod
- Test changes quickly without manual file copying

Think of this as setting up a workshop with all the right tools before you start crafting.

## Prerequisites & Installation

### What You Need

Before we begin, you'll need to install a few tools. Don't worry - they're all free and we'll walk through each one.

**Required Tools:**

### 1. Node.js (JavaScript Runtime)

Node.js lets us run the build tools that compile and package your mod.

**Windows Installation:**

1. Go to [nodejs.org](https://nodejs.org/)
2. Click "Get Node.js"
3. Run the downloaded installer (.msi file)
4. Restart any open command prompts after installation

**Verify it worked:**

```bash
# Open Command Prompt or PowerShell and run:
node --version
# Should show something like: v18.17.0
```

### 2. Code Editor (VS Code Recommended)

You can use any text editor, but VS Code provides the best experience with auto-completion and error highlighting.

**Windows Installation:**

1. Go to [code.visualstudio.com](https://code.visualstudio.com/)
2. Download and run the installer
3. During setup, check "Add to PATH" and "Register Code as editor for supported file types"

### 3. Git (Version Control)

Git helps you manage your code changes and download the mod template.

**Windows Installation:**

1. Go to [Github Desktop](https://desktop.github.com/download/)
2. Download and run the installer
3. Use default settings (they're fine for our needs)

## Getting the Mod Template

Now that your tools are installed, let's get the starter template for your mod.

### Step 1: Choose Your Base Template

You have two options to start your project from:

**Option A: Standard Template** _Best if you want a simple setup with only the required features, or don't use AI assistants_

**Visit the template:** [AFNM Example Mod](https://github.com/Lyeeedar/AfnmExampleMod)

**Option B: Agent Mod Template (Unofficial)**
_Best if you use AI coding agents (Cursor, Claude Code, Copilot, Windsurf, Cline, etc.) or want a modern bun-based scaffold with runtime validation and Workshop packaging built in._

_Note: This is managed by a community member, so theres is no guarantee of support._

**Visit the template:** [AFNM Agent Mod Template](https://github.com/lemon07r/AfnmAgentModTemplate)

### Step 2: Download the template

1. Click the green **Code** Button.
2. Click **Open with Github Desktop**.
3. Leave all settings as default, they are fine for our purposes

Once done, Github Desktop will download the repository to your machine. 

### Step 3: Open Your Project

1. Click **Open with VS Code** in Github Desktop

VS Code will open with your project files visible in the sidebar.

### Step 4: Install Project Dependencies

Dependencies are pre-built code libraries that your mod uses (like TypeScript compiler, build tools, etc.).

**In VS Code:**

1. **Open the terminal:** View → Terminal (or Ctrl+`)
2. **Run the install command:**
   ```bash
   npm install
   ```

**What this downloads:**

- TypeScript compiler and AFNM type definitions (for auto-completion)
- Build tools (Vite, Rollup) that package your mod
- Development utilities for testing and debugging

**This may take 1-2 minutes.** You'll see a progress indicator as packages download.

**Success indicators:**

- No red error messages
- A new `node_modules/` folder appears in your project
- VS Code shows TypeScript IntelliSense when you open `.ts` files
- Note: Warnings that may be shown (such as outdated packages) can be ignored

**Common Issues:**

- **"npm: command not found"** - Node.js wasn't installed correctly. Reinstall, or restart vscode if you have already installed.
- **Permission errors on Windows** - Try running VS Code as Administrator, or use PowerShell instead of Command Prompt.

## Personalizing Your Mod

### Step 5: Update Mod Information

Your mod needs a name, description, and author information. This appears in-game and on Steam Workshop.

**Open `package.json`** (in your project root) and find this section:

```json
{
  "name": "my-game-mod",
  "version": "0.0.1",
  "description": "A mod for AFNM",
  "author": {
    "name": "<your name>"
  }
}
```

**Update it to something like:**

```json
{
  "name": "mystic-tea-cultivation",
  "version": "1.0.0",
  "description": "Adds tea-based cultivation techniques and mystical tea gardens to explore",
  "author": {
    "name": "TeaMaster92"
  }
}
```

**Field Guidelines:**

- **name**: Lowercase, use hyphens instead of spaces (this becomes your mod's technical ID)
- **version**: Start with "1.0.0" for your first release
- **description**: 1-2 sentences explaining what your mod adds
- **author.name**: Your modding alias (avoid using your real name for privacy)

### Step 6: Test Your Setup

Let's verify everything is working correctly by building your mod:

**In VS Code terminal, run:**

```bash
# Build your mod package
npm run build
```

This command:

- Compiles your TypeScript code
- Bundles your assets
- Creates a packaged mod ready for the game
- Outputs a ZIP file in the `builds/` folder

**If you see errors:** Double-check that you installed Node.js correctly and ran `npm install` without errors.

**Success indicators:**

- No red error messages
- A new `builds/` folder appears
- Inside `builds/` you should see a ZIP file like `my-mod-1.0.0.zip`

## Understanding Your Project

### Project Structure Explained

Here's what each folder and file does in your mod project:

```
your-mod-project/
├── src/
│   ├── modContent/
│   │   └── index.ts              # ← Your mod code goes here
│   └── assets/                   # ← Images, sounds, etc.
├── builds/                       # ← Generated mod packages (appears after build)
├── docs/                         # ← This documentation site
├── package.json                  # ← Mod information and settings
├── tsconfig.json                 # ← TypeScript compiler settings
└── node_modules/                 # ← Downloaded dependencies (don't edit)
```

**Key files you'll work with:**

- **`src/modContent/index.ts`** - This is where you write your mod logic
- **`src/assets/`** - Put your images, sounds, and other files here
- **`package.json`** - Contains your mod's name, version, and description
- **`builds/`** - Contains packaged mod files ready for the game

**Files you can ignore:**

- **`node_modules/`** - Auto-generated, never edit these files
- **`tsconfig.json`** - Compiler settings, rarely needs changes
- **`docs/`** - The documentation website you're reading now

## Development Workflow

### Essential Commands

Here are the commands you'll use regularly while developing your mod:

```bash
# Install dependencies (run once after downloading template)
npm install

# Build mod package for testing in-game
npm run build
```

**Important:** Unlike web development, you can't run mods directly with `npm run dev`. You must build your mod and install it in the game to test it.

**Typical workflow:**

1. Edit your mod files in VS Code
2. Run `npm run build` to package your mod
3. Copy the ZIP file from `builds/` to your game's `mods/` folder
4. Restart the game to test your changes
5. Repeat the cycle for iteration

### VS Code Setup Tips

**Recommended Extensions** (VS Code should auto-suggest these):

- **TypeScript and JavaScript Language Features** (built-in, should be enabled)
- **Prettier - Code formatter** (keeps your code neat)

**Useful VS Code features:**

- **Auto-completion:** Type `window.modAPI.` and VS Code shows available functions
- **Error highlighting:** Red squiggly lines show syntax errors
- **Integrated terminal:** View → Terminal to run commands without leaving VS Code

### Version Control (Optional but Recommended)

Git helps you track changes and backup your work. Basic workflow:

```bash
# Save your current work
git add .
git commit -m "Added my first tea item"

# Create a branch for new features
git checkout -b feature/tea-garden-location

# Push to GitHub (if you forked the repo)
git push origin main
```

**Or use GitHub Desktop** for a visual interface: [desktop.github.com](https://desktop.github.com/)

## Troubleshooting

### Common Setup Issues

**"npm: command not found"**

- Node.js wasn't installed correctly
- Solution: Reinstall Node.js, ensure "Add to PATH" is checked, restart VS Code

**"No TypeScript IntelliSense"**

- VS Code isn't recognizing TypeScript files
- Solution: Open a `.ts` file, then press Ctrl+Shift+P, type "TypeScript: Restart TS Server"

**Build errors about missing files**

- Dependencies weren't installed properly
- Solution: Delete `node_modules/` folder, run `npm install` again

**Permission errors on Windows**

- Windows blocking npm from writing files
- Solution: Run VS Code as Administrator, or use PowerShell instead of Command Prompt

## Next Steps

🎉 **Congratulations!** Your development environment is now set up and ready for modding.

**You now have:**

- ✅ A working mod project with auto-completion
- ✅ Build tools that package your mod automatically
- ✅ A development workflow for quick iteration

**Ready to create content?** Continue to: **[Mod Development Guide](mod-development)**

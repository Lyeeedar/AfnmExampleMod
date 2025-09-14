---
layout: default
title: Project Setup
parent: Guides
nav_order: 1
description: 'Setting up your development environment for AFNM modding'
---

# Project Setup

## Introduction

Before you can start creating content for your AFNM mod, you need to properly configure your development environment and project metadata. This guide will walk you through cloning the template, installing dependencies, and customizing the project for your specific mod.

## Development Environment

### Prerequisites

- **Node.js**
- **Code Editor** (Visual Studio Code recommended)
- **Git** (for version control)
- **Basic TypeScript knowledge** (helpful but not required)

### Step 1: Get the Template

You have a couple options to start your project:

**Option A: Fork the Repository (Recommended)**

1. Visit the [AFNM Example Mod repository](https://github.com/Lyeeedar/AfnmExampleMod)
2. Click **"Fork"** to create your own copy
3. Clone your fork: `git clone https://github.com/YOUR-USERNAME/AfnmExampleMod.git`

**Option B: Download the Template**

1. Download the repository as a ZIP file
2. Extract it to your desired location
3. Initialize a new git repository: `git init`

### Step 2: Install Dependencies

Open a terminal in your project directory and run:

```bash
npm install
```

This will download all necessary dependencies including:

- TypeScript compiler and type definitions
- Build tools (Vite, Rollup)
- AFNM type definitions for IntelliSense
- Development utilities

If you're using VS Code and haven't worked with TypeScript before, it should automatically prompt you to install recommended extensions.

## Project Configuration

### Step 3: Configure Mod Metadata

Open `package.json` in your project root. You'll see a configuration block at the top:

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

**Customize these fields:**

```json
{
  "name": "my-awesome-cultivation-mod",
  "version": "1.0.0",
  "description": "Adds new cultivation techniques and mystical locations",
  "author": {
    "name": "YourModdingName"
  }
}
```

### Naming Guidelines

- **name**: Use lowercase with hyphens, no spaces
- **version**: Follow semantic versioning (major.minor.patch)
- **description**: Brief, descriptive summary of your mod's features
- **author.name**: Your preferred modding alias. Using your real name is not recommended

### Step 4: Verify Setup

Test that everything is working correctly:

```bash
# Run the development build
npm run dev

# Build the mod package
npm run build
```

If successful, you should see:

- No compilation errors
- A `builds/` folder with your packaged mod
- TypeScript IntelliSense working in your editor

## Project Structure

Understanding the project layout will help you navigate and organize your content:

```
AfnmExampleMod/
├── src/
│   ├── modContent/
│   │   └── index.ts          # Your main mod entry point
│   ├── assets/               # Images and other resources
│   └── types/                # TypeScript type definitions
├── builds/                   # Generated mod packages
├── docs/                     # Documentation (this site)
├── package.json             # Project metadata
└── tsconfig.json           # TypeScript configuration
```

### Key Files

- **`src/modContent/index.ts`** - Where you'll write your mod logic
- **`src/assets/`** - Store images, sounds, and other resources
- **`package.json`** - Contains your mod's metadata and version
- **`builds/`** - Generated when you run `npm run build`

## Development Workflow

### Basic Commands

```bash
# Install dependencies (run once after setup)
npm install

# Development mode with file watching
npm run dev

# Build final mod package
npm run build

# Clean build artifacts
npm run clean
```

### IDE Setup (VS Code)

**Recommended Extensions:**

- TypeScript and JavaScript Language Features (built-in)
- Prettier - Code formatter

**Settings for optimal experience:**

1. Enable TypeScript IntelliSense
2. Set up auto-formatting on save
3. Configure Git integration for version control

### Version Control

It's highly recommended to use Git for your mod development:

```bash
# Initialize repository (if not already done)
git init

# Add your changes
git add .

# Commit your work
git commit -m "Initial mod setup"

# Create development branch
git checkout -b feature/new-techniques
```

Or even better, use **[Github Desktop](https://desktop.github.com/download/)** to make working with git simple.

## Next Steps

With your environment set up, you're ready to start building content! The next step is learning about the ModAPI and creating your first mod content.

Continue to: **[Mod Development Guide](mod-development)**

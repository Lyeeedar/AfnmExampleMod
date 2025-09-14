---
layout: default
title: Publishing Your Mod
parent: Guides
nav_order: 4
description: 'Releasing your AFNM mod to the Steam Workshop'
---

# Publishing Your Mod

## Introduction

Congratulations on creating your AFNM mod! Now it's time to share your work with the cultivation community. This guide covers publishing to the Steam Workshop, managing updates, and building a following for your mod.

The Steam Workshop integration makes it easy for players to discover, install, and automatically update your mods, providing the best experience for both creators and users.

## Steam Workshop Publishing

### Prerequisites

Before you can publish your mod:

- **Steam Account** - You need to own Ascend from Nine Mountains on Steam
- **Completed Mod** - Your mod should be thoroughly tested and polished
- **Final Build** - A packaged mod ZIP file from `npm run build`
- **Workshop Agreement** - You'll need to accept Steam's Workshop terms

### Using the Mod Uploader

AFNM provides a dedicated uploader tool for Steam Workshop publishing:

**Location:** `/uploader/Mod Uploader 1.0.0 Portable.exe` (in your fork of this repository)

### Publishing Process

1. **Create New Mod Entry**

   - Click "Upload New Mod"
   - Select your mod's ZIP file from the `builds/` folder

2. **Configure Workshop Listing**

   - **Title**: Use your mod's name from `package.json`
   - **Description**: Detailed explanation of features and content
   - **Preview Image**: Eye-catching screenshot or logo
   - **Tags**: Relevant categories (techniques, items, locations, etc.)
   - **Visibility**: Public, Friends-only, or Private

3. **Upload Process**

   - Click "Upload" to begin the process
   - The tool will package and upload your content
   - Steam will process and validate the submission

4. **Workshop Page Creation**

   - Once uploaded, Steam generates a Workshop page
   - You can edit details directly in the Steam Workshop UI
   - Add additional screenshots, detailed changelog, etc.

5. **Updating your mod**
   - If you wish to make changes, then simply select the mod from the list of your mods in the uploader, change the settings, and click `update` again.

### Workshop Page Optimization

**Writing Effective Descriptions:**

```
# Tea Master's Journey - A Cultivation Mod

Transform your cultivation experience with the ancient art of tea mastery!

## Features
✨ 20+ New Tea-Based Items - Restore qi, boost stats, unlock hidden potential
🏮 5 Unique NPCs - Meet tea masters with deep wisdom and challenging quests
⚔️ 3 New Cultivation Techniques - Harness the power of spiritual brewing
🗺️ 2 Custom Locations - Explore mystical tea gardens and ancient breweries

## Requirements
- Any cultivation realm (content scales appropriately)
- Compatible with existing saves
- No conflicts with other major mods
```

**Essential Elements:**

- **Clear feature list** - Bullet points work well
- **Requirements** - Realm, save compatibility, conflicts
- **Screenshots** - Show your content in action
- **Installation notes** - Any special requirements

Welcome to the AFNM modding community! Your contribution helps make the cultivation journey richer for all players.

---
layout: default
title: Quest System
nav_order: 6
has_children: true
description: 'Documentation for the AFNM quest system'
---

# Quest System

The quest system provides structured storylines, character development, and progression goals that guide players through their cultivation journey.

## Documentation

### [Quest Structure](quest-structure.md)
Quest interfaces, categories, rewards, and failure conditions

### [Quest Steps](quest-steps.md)
Objective types, completion rules, and usage examples


### [Quest Examples](examples.md)
Complete, annotated quest implementations

## Quick Reference

### Quest Categories

- **`main`** - Core storyline progression
- **`side`** - Optional character stories and world building
- **`missionHall`** - Sect-based combat and exploration missions
- **`vaultMission`** - Vault assignments
- **`craftingMission`** - Crafting commissions
- **`requestBoard`** - Community-driven tasks with quick turnaround
- **`guild`** - Organization-specific storylines and advancement
- **`breakthrough`** - Cultivation guidance quests

Use `side` for an optional story quest, or `main` for a central storyline. Categories group quests and affect category-specific handling. Choosing a category does not put a quest on a mission board or start it. See [Quest Structure](quest-structure.md#category-system) for the category reference.

### Register and start a quest

1. Define a `Quest` imported from `afnm-types`, with a unique `name`, a category, sequential `steps`, and `rewards`. Choose objectives from [Quest Steps](quest-steps.md) according to what the player must do. For example, a `collect` objective checks held items, while a `sell` objective counts sales made while that objective is current.
2. In a content module imported by `src/mod.ts`, call `window.modAPI.actions.addQuest(yourQuest)`. This registers the definition for references by name.
3. Put `{ kind: 'quest', quest: yourQuest.name }` in an event the player can reach, such as a registered [triggered event](../events/triggered-events.md). This [Add Quest step](../events/steps/addquest.md) starts the registered quest for the player. Gate a one-time offer with a mod-owned flag so it cannot be offered again after completion.
4. For a directly granted side quest, script the actual reward grants in its events. The `rewards` list provides the preview. See [Reward System](quest-structure.md#reward-system) before promising items or currency.
5. On a test save, trigger the offer, check that the quest enters the log, and complete each objective. Test actions both before and after their objective becomes current, then verify the actual reward and that a one-time offer stays closed after completion.

### Common objective choices

- **`event`** - Interactive storylines with dialogue and choices
- **`condition`** - Wait for specific game state conditions
- **`collect`** - Gather items or resources
- **`kill`** - Defeat specific enemies
- **`missionHall`** - Return to a Mission Hall to claim mission rewards
- **`speakToCharacter`** - Have conversations with NPCs
- **`flagValue`** - Wait for flag to reach target value
- **`wait`** - Time-based delays for story pacing
- **`raid`** - Complete fallen star raids
- **`sell`** - Sell a named item while the objective is current
- **`expedition`** - Complete qualifying expeditions while the objective is current

See [Quest Steps](quest-steps.md) for the full reference, including exploration events, optional conversations, and [progress timing](quest-steps.md#step-dependencies).

### Event System Integration

Quests use the [Event System](../events/):

- Event steps contain full [GameEvents](../events/events.md)
- Completion conditions often use [flags](../concepts/flags.md)
- Events can [add quests](../events/steps/addquest.md) to start storylines

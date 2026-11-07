---
layout: default
title: Quest Structure
parent: Quest System
nav_order: 1
description: 'Detailed breakdown of quest interfaces and properties'
---

# Quest Structure

This page provides a comprehensive breakdown of the quest data structures and their properties.

## Quest Interface

The core quest definition that contains all quest metadata and progression:

```typescript
interface Quest {
  name: string; // Internal identifier used in code references
  displayName?: Translatable; // Optional player-facing name (falls back to name)
  description: Translatable; // Quest summary in quest log
  category: 'main' | 'side' | 'missionHall' | 'vaultMission' | 'craftingMission' | 'requestBoard' | 'guild' | 'breakthrough'; // Determines where quest appears
  guild?: string; // Required for guild category quests
  steps: QuestStep[]; // Sequential objectives
  rewards: QuestReward[]; // Benefits upon completion
  acceptFlags?: Record<string, number>; // Flags set when the quest is accepted
  abandonment?: { throughStep: number; flags: Record<string, number> };
  failureCondition?: string; // Optional failure trigger
  cost?: number; // Optional cost to accept quest
  timeCostDays?: number; // Days consumed by completing the quest's current event
}
```

### Name and Description

**Name**: The internal identifier for the quest. Used in code references, flags, and the quest registry. Must be unique.

**Display Name**: Optional player-facing title. When set, this is shown in the quest log and notifications instead of `name`. Supports the `Translatable` type, so it can be a plain string or a translation key object.

**Description**: Brief summary that explains the quest's purpose and context. Should intrigue players without spoiling story beats.

```typescript
name: 'theWanderingHerb',          // Internal ID (used in code)
displayName: 'The Wandering Herb', // Shown to players (optional)
description: 'Hua Tong has tasked you with finding and returning a sentient herb that escaped his gardens.'
```

If `displayName` is omitted, the player sees `name` directly.

### Category System

Determines quest organization and availability:

```typescript
type QuestCategory =
  | 'main'
  | 'side'
  | 'missionHall'
  | 'vaultMission'
  | 'craftingMission'
  | 'requestBoard'
  | 'guild'
  | 'breakthrough';
```

#### Main Quests

- Core storyline progression
- Typically linear and required
- Unlock major game features
- High narrative importance

#### Side Quests

- Optional character stories
- World building and lore
- Recurring characters
- Multi-part questlines

#### Mission Hall Quests

- Sect-based assignments
- Regular income source
- Combat and exploration focus
- Reputation building

#### Crafting Mission Quests

- Crafting commissions at the Mission Hall
- Commissioned by NPCs who appraise the craft
- Separate outcome steps for each quality tier (sublime, perfect, basic, failure)
- Crafting system integration

#### Request Board Quests

- Community needs
- Quick objectives
- Immediate rewards
- Social system integration

#### Guild Quests

- Organization-specific content
- Exclusive storylines
- Guild advancement
- Factional conflicts

Use `vaultMission` for vault assignments and `breakthrough` for cultivation guidance objectives. A category groups the quest but does not register it or start it for the player. Register with `window.modAPI.actions.addQuest`, then use an [Add Quest step](../events/steps/addquest.md) to start a directly granted quest.

### Guild Specification

For guild category quests, specify the organization:

```typescript
category: 'guild',
guild: 'ShadowMoonSect' // Must match guild identifier
```

### Cost System

Optional upfront payment required to accept the quest. Used by crafting mission commissions:

```typescript
cost: 500; // Player pays 500 sect favour to start quest
```

### Failure Conditions

Optional string expression that causes quests to be removed from the quest list early:

```typescript
failureCondition: 'realm > 3 || someQuestFlag == 1';
```

**Common patterns:**

- **Mutually exclusive quests**: `otherQuestCompletedFlag == 1` — remove the quest when a competing questline resolves first
- **Realm gates**: `realm > 3` — fail a low-realm quest if the player over-levels past the intended range
- **Reputation thresholds**: `Nine_Mountain_Sect < -50` — use the faction flag name directly (faction name with spaces replaced by underscores)
- **Time limits**: `month > questStartMonth + 12` — where `questStartMonth` is a flag you set via a `flag` step when the quest begins

All condition variables are numeric. Reputation values are stored as flat flags using the faction name with spaces replaced by underscores (e.g. `Nine_Mountain_Sect`). Item quantities use the item's flag name (e.g. `Spirit_Herb`). String comparisons are not supported.

Note quests are also removed when all the steps in the quest are completed. This is simply a way to remove the quest early.

### Allowing a project to be cancelled

Use `abandonment` on a mod-owned quest when the player should be able to withdraw during preparation, but must commit once work begins. Pair it with `acceptFlags` if accepting the quest reserves a project or blocks competing offers.

```typescript
// Fields to include in your Quest definition:
acceptFlags: { myModProjectActive: 1 },
abandonment: {
  throughStep: 1,
  flags: { myModProjectActive: 0 },
},
```

`throughStep` is an inclusive, zero-based index into `steps`. Here cancellation is allowed while objective 0 or 1 is current, and stops being available at objective 2. Choose the last cancellable objective deliberately, for example the collection objective before an irreversible construction event. The current objective follows completion conditions as well as completed events. See [Quest Steps](quest-steps.md) when deciding where to place the cutoff.

On cancellation, the game sets every named global flag to the supplied numeric value and removes the active quest. Only list flags your project owns. Cancellation does not refund payments, return contributed items or undo event effects. Settle any promised refunds through your authored events rather than relying on this field. Also release project reservations in your normal completion and failure paths as needed, since `abandonment.flags` only runs when the player cancels.

Without `abandonment`, `missionHall`, `vaultMission`, `requestBoard` and `craftingMission` quests allow abandonment. Other categories do not. Supplying `abandonment` replaces that default with the step cutoff, including for those mission categories. An empty `flags: {}` is useful when you need the cutoff without reservation cleanup.

Register the completed Quest with `window.modAPI.actions.addQuest`, and start it using an [Add Quest step](../events/steps/addquest.md). On a test save with the tutorial completed, cancel at the first and last allowed objectives and check that the reservation flag allows the intended offers again. In a separate run, advance beyond the cutoff and verify cancellation is unavailable. Reaccepting a cancelled quest starts its objectives again and applies `acceptFlags` again, so test that earlier event rewards cannot be repeatedly claimed if you permit reacceptance.

### Time Cost

The `timeCostDays` field indicates how many days are consumed when the quest's current event step resolves. This value is shown to the player so they know the time commitment before accepting:

```typescript
timeCostDays: 13;
```

Not all quests have a meaningful time cost; omit the field when the quest does not advance the calendar.

## Reward System

Quests can show a preview of the rewards to be gained on quest completion. Note, the quest WILL NOT grant these itself, they need to be scripted in as part of an event. This is just a way to indicate this to the player:

```typescript
type QuestReward =
  | ItemQuestReward
  | MoneyQuestReward
  | FavourQuestReward
  | ReputationQuestReward
  | GuildApprovalQuestReward;
```

### Item Rewards

Grant specific items and quantities:

```typescript
{
  kind: 'item',
  item: { name: 'HealingPill' }, // Item descriptor
  amount: 5 // Quantity to give
}
```

### Spirit Stone Rewards

Provide direct currency:

```typescript
{
  kind: 'money',
  amount: 1000
}
```

### Favour Rewards

Grant sect favour points:

```typescript
{
  kind: 'favour',
  amount: 500
}
```

### Reputation Rewards

Modify standing with specific factions:

```typescript
interface ReputationQuestReward {
  kind: "reputation";
  amount: number;
  name: string;
  max?: number;
}
```

### Guild Approval Rewards

Advance standing within guilds:

```typescript
{
  kind: 'approval',
  amount: 10, // Approval points
  guild: 'CraftingGuild' // Guild identifier
}
```

## Quest Design Philosophy

### Player Agency

Good quests provide meaningful choices that affect outcomes and character development. Use branching dialogue and multiple solution paths.

### Narrative Integration

Quests should feel natural within the world and contribute to character relationships, faction dynamics, and personal growth.

### Progressive Difficulty

Structure quests to match player progression, introducing new mechanics and challenges as cultivation advances.

### Emotional Investment

Create memorable characters and situations that players care about. The best quests have stakes beyond just mechanical rewards.

## Getting Started with Quests

See [Quest Examples](examples.md) for complete annotated implementations, and [Quest Steps](quest-steps.md) for detailed documentation on each step type.

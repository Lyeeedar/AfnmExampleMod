---
layout: default
title: Soul Shard Delves
parent: Combat
nav_order: 8
description: 'Soul shard delve locations, structure, and progression'
---

# Soul Shard Delves

Soul shard delves are repeatable dungeon encounters where players deploy placed shards on a grid to accumulate qither, unlock rewards, and fight progressively harder enemies.

## SoulShardDelveConfig

Delve locations are defined as `SoulShardDelveConfig` objects:

```typescript
interface SoulShardDelveConfig {
  key: string;
  location: string;

  /** Events played when each threshold is crossed, in order. */
  thresholdEvents: GameEvent[];

  /** One-time rewards granted at each intensity milestone. */
  intensityRewards: DelveIntensityReward[];
  rechargeMonths: number;
  monsters: RegionMonsters;
  boss: DelveRoom;
}
```

## Intensity Rewards

Each delve awards one-time rewards at fixed intensity milestones. Rewards are one of four types:

```typescript
type DelveIntensityReward =
  | { intensity: number; reward: ItemDesc }            // Item drop
  | { intensity: number; minorAspectId: string }        // Minor aspect unlock
  | { intensity: number; unlockTechnique: string }        // Technique unlock
  | { intensity: number; unlockCraftingTechnique: string } // Crafting technique unlock
  | { intensity: number; physicalStat: PhysicalStatistic; amount: number }; // Physical stat boost
```

## Intensity Thresholds

The current milestone thresholds are:

| Threshold | Reward type |
|-----------|-------------|
| 40 | Minor aspect |
| 80 | Technique/crafting technique or stat boost |
| 120 | Technique/crafting technique or stat boost |
| 160 | Final unlock (technique or crafting technique) |

Intensity is accumulated per run based on the qither throughput of the placed shard grid. Higher grid complexity and more source power allow faster progression toward the 160-intensity cap.

## Progression State

Persistent state for a delve is stored in `SoulShardProgression`:

```typescript
interface SoulShardProgression {
  accumulatedQither: number;   // Total qither across all completed runs
  thresholdIndex: number;      // Number of thresholds already cleared
  placedShards: PersistedPlacedShard[];
  sourcePower: number;         // Current source power (recharges monthly)
  rechargeProgress: number;    // Months elapsed toward next recharge
  claimedIntensityRewards: number;
  hasEnteredRun?: boolean;
}
```

## Delve Room Stages

Each delve is structured as a series of rooms, each with one stage:

```typescript
type DelveRoomStageKind = 'combat' | 'blessing' | 'curse' | 'reward' | 'event';
```

Combat rooms scale enemy HP and power by the current difficulty multiplier, which increases with total qither used to activate absorbers: `difficultyMultiplier = 1 + totalQither * 0.01`.

## Creating a Delve Location

To add a new soul shard delve location:

1. Define the `SoulShardDelveConfig` with `key`, `location`, `thresholdEvents`, `intensityRewards`, `monsters`, and `boss` room.
2. Register it via the mod loading system (locations are added through the standard location registration flow).
3. Ensure the corresponding location entry exists and has the appropriate exploration requirements.

The `boss` room is fought after all vestige rooms are cleared and always includes the delve's narrative capstone event.

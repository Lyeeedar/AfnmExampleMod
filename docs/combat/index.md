---
layout: default
title: Combat System
nav_order: 4
has_children: true
description: 'Understanding the AFNM combat buff system'
---

# Combat System

The combat system in AFNM revolves around buffs and their interactions. Understanding how buffs work is essential for creating balanced and engaging combat content.

## Core Components

- **[Buff System Overview](buffs)** - Core concepts and mechanics
- **[Effect Types](effects)** - All available buff effect types with examples
- **[Buff Interceptions](interceptions)** - How buffs can intercept and modify other buffs
- **[Triggers](triggers)** - How buffs can activate based on combat events
- **[Combat Images](images)** - Visual representation system for buffs
- **[Tooltips](tooltips)** - Dynamic tooltip generation system
- **[Technique System](techniques)** - Active combat abilities and mastery


## Test a technique or enemy without opening combat

Use `window.modAPI.utils` to run a local combat simulation when balancing a [technique](techniques.md), buff, or enemy matchup. Register your content first through the [Mod API](../concepts/modapi.md#content-registration), then supply a complete test player with the intended known techniques, stance rules and equipment, a breakthrough definition, and your enemy definition. Use the same test build to compare alternative content designs. Repeat trials because combat can involve random outcomes.

This helper tests a player build against one enemy without player consumables. Call it from your mod's test tooling after the game exposes `window.modAPI`:

```typescript
import type {
  BreakthroughState,
  CombatState,
  EnemyEntity,
  PlayerEntity,
} from 'afnm-types';

function testMatchup(
  player: PlayerEntity,
  breakthrough: BreakthroughState,
  enemy: EnemyEntity,
  flags: Record<string, number>,
) {
  const u = window.modAPI.utils;
  const payload: CombatState = {
    player,
    breakthrough,
    playerState: u.createPlayerCombatEntity(player, breakthrough, flags),
    enemies: [enemy],
    enemyState: u.createEnemyCombatEntity(enemy, flags),
    background: '',
    screenEffect: 'mist',
  };
  let state = u.initCombat(payload, flags, []);

  for (let round = 0; round < 25 && !state.combatState; round++) {
    state = u.beginRound(state);
    state = u.advanceRoundBurst(state);
    // Read or copy measurements/logs here before discarding presentation output.
    u.dropRenderOutput(state);
  }

  return {
    outcome: state.combatState ?? 'round limit',
    playerHp: state.playerState?.stats.hp,
    enemyHp: state.enemyState?.stats.hp,
  };
}
```

The 25-round cap is a testing choice to bound stalemates. Treat `round limit` as unresolved, rather than a win. These calls return simulation results, not quest rewards or a completed encounter in the player's save. Supply detached test inputs rather than mutating a live fight. Empty inventory input and the absence of player auto-use calls make this a useful baseline for testing the content's own strength. Enemy pill behavior still runs when the enemy definition supplies it.

### Simulation utilities

Use these APIs together as in `testMatchup` above:

| Utility | Behavior and authoring use |
| --- | --- |
| `createPlayerCombatEntity(player, breakthrough, flags?)` | Resolves a test player's combat stats and mod hooks. Supply the breakthrough and flags appropriate to the build you want to balance. |
| `createEnemyCombatEntity(enemy, flags)` | Resolves your enemy definition into a combatant for the test. |
| `initCombat(payload, flags, inventoryItems)` | Returns an initialized `CurrentCombatState` from a `CombatState` payload. Provide both combatants and the complete player definition. It applies combat setup, including player equipment and initial stance selection. The third argument is an array of `InventoryItemState` records for the test. |
| `beginRound(state)` | Returns the state prepared for a new round. Call once before advancing that round's steps. |
| `advanceRound(state)` | Returns the state after one combat step. Choose this when inspecting exactly when a buff or technique acts. |
| `advanceRoundBurst(state, onStep?, maxSteps?)` | Runs remaining steps in the current round and returns the resulting state. `maxSteps` defaults to 100000. A smaller cap can leave steps pending, so finish them before beginning another round. The callback sees a mutable working state after each step. Copy the values you want to retain, or use `cloneCombatState`, rather than storing that reference. |
| `cloneCombatState(state)` | Copies an initialized fight with independent mutable combatant data. Use it to branch a test from the same combat situation. It does not seed or reset randomness. |
| `dropRenderOutput(state)` | Clears logs, messages and animation output in place. Use at round boundaries when keeping only measurements. Copy any desired logs first. |
| `withAssessmentObserver(observer, run)` | Installs a hit-measurement callback for a synchronous `run()` and returns its result. Use it to distinguish damage reaching health, barrier and temporary health when balancing a defensive buff. The callback receives `(state, receiver, measurement, dealer)`, with an optional dealer. It restores the prior observer even if the run throws. Do not use an async run or keep it across an `await`. |

For example, wrap the round runner in `withAssessmentObserver` and accumulate `measurement.health`, `measurement.barrier` and `measurement.temporaryHealth` separately. Filter by `receiver.entityType` if you want measurements for only one side. These values describe observed hits, so use them alongside the final outcome rather than treating them as a complete win-rate assessment.

For specialized harnesses, `initialisePlayerCombatEquipment(player, combatEntity, combatState)` adds equipment, enchantment and harmony buffs in place, and `updatePlayerStanceFromRule(player, playerState, combatState)` selects and applies a stance from that player's rules in place. Normal initialization and round execution already call these routines. Use them only when your harness explicitly owns those setup or stance-selection stages, to avoid applying setup twice.

To test player consumables, `getAvailableAutoUseItems(slots, entity, opponent, inventoryItems, pillTracking, autoUseRowTracking, enabled?)` selects eligible slots and returns `{ slot, rowIndex }` entries. The inventory here is `ItemDesc[]`, and `enabled` defaults to `true`. Pass the results to `consumeAutoUseItems(state, available, inventoryItems, playerRealm, toxMultiplier, maxToxicity, pillsLimit, onSfx?)`, then retain its returned `state` and `consumedSlots`. The optional sound callback receives `Eat`, `CraftFail` or `CrystalCrack`. Supply the test build's actual toxicity and pill limits. These helpers are for a harness that models consumption explicitly. The baseline example above omits consumption so that gear and technique comparisons do not depend on a consumable loadout.

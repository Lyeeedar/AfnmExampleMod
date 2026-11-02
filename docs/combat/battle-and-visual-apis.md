---
layout: default
title: Battle and Visual APIs
parent: Combat System
nav_order: 9
description: 'Battle wave triggers, terrain choices, and combat presentation fields'
---

# Battle and Visual APIs

Squad battles use `BattleEncounter` and `EventBattleSetup`. An event's `kind: 'battle'` step authors its encounter through `setup: EventBattleSetup`. These battle definitions are separate from the one-on-one `kind: 'combat'` step.

## Battle Wave Triggers

Both `BattleEncounter.waves` and `EventBattleSetup.waves` accept this trigger shape alongside each wave's `units`:

```typescript
export type BattleWaveTrigger =
  | { delay: number; enemiesBelow?: number }
  | { delay?: never; enemiesBelow: number };
```

- `delay` schedules arrival against the battle's reinforcement clock. That clock can advance faster as enemy numbers fall, so it is not a guaranteed wall-clock delay.
- `enemiesBelow` releases the next pending wave as a whole group when the living enemy count is strictly below the threshold. Enemy summons with an owner do not contribute to that count.
- With both fields, the next pending count-triggered wave arrives when its count threshold is met or its scheduled reinforcement time is reached.
- Count-triggered waves retain their authored order. Delay-only reserves can also be drawn forward in parts to replenish depleted enemy forces.

For example, given an existing `EventBattleSetup` named `setup` and valid enemy definitions in `reinforcements`:

```typescript
setup.waves = [
  { enemiesBelow: 4, units: reinforcements },
  { delay: 105, enemiesBelow: 4, units: reinforcements },
];
```

`EventBattleSetup` wave units accept `BattleUnitDefinition` or `BattleEnemySetup` entries, allowing automatic placement. Runtime `BattleEncounter` wave units are `BattleEnemyPlacement` entries with positions.

**Migration note:** Existing `{ delay, units }` waves remain valid. Code reading wave definitions must handle an absent `delay` on count-only waves.

## Battle Terrain Choices

`EventBattleSetup.arena` uses `BattleArenaTerrain`. The expanded terrain union includes these choices, among others:

| Setting | Terrain identifiers |
|---|---|
| Settlements and halls | `villageLane`, `timberHall`, `silkWorkshop`, `cityBrick`, `receptionHall`, `outpostYard` |
| Forests and gardens | `herbBeds`, `rootClearing`, `petalGrove`, `orchardSoil` |
| Mountains and passes | `mountainTerrace`, `highlandSlate`, `shadowRavine`, `redPass`, `ashPass`, `basaltRidge` |
| Ruins and tombs | `fallenStarRubble`, `excavationCamp`, `jadeRuinFloor`, `barrowEarth`, `sealedVault`, `cryptTiles` |
| Workshops and special arenas | `forgeBrick`, `alchemyTiles`, `bronzeWorkshop`, `mechanismFloor`, `spatialGlass`, `observatoryFloor` |
| Wastes and rocky ground | `wasteDunes`, `cinderField`, `lavaRock`, `redSand`, `saltFlat`, `blackSand` |

For example, `setup.arena = 'villageLane'` selects a village battlefield. Existing terrain identifiers remain valid. Consult `src/types/battle.ts` for the complete union.

## Shield Combat Images

A buff's `combatImage` can use `position: 'shield'`. `ShieldCombatImage` extends the shared image properties with an optional fixed `scale`:

```typescript
export interface ShieldCombatImage extends BaseCombatImage {
  position: 'shield';
  scale?: number;
}
```

The image attaches between its owner and an opponent without creating a separate body. The built-in Dream Layer buff uses this position. This field controls presentation. Damage prevention must still be defined in the buff's effects.

See [Combat Images](images) for shared fields such as `image` and `imageOverrides`.

## VFX Lighting and Beam Sizing

`VfxAction` and `VfxIdentity` accept optional `lighting`:

```typescript
export interface VfxLight {
  colour: string;
  intensity?: number;
}
```

For example, `lighting: { colour: '#78caff', intensity: 1 }` opts luminous artwork into light emission. The renderer requires a six-digit hexadecimal colour such as `#78caff`. Intensity defaults to `1`. Ordinary effects without `lighting` emit no light, and lighting does not change simulation state.

VFX definitions are registered through `window.modAPI.actions.addCombatVfx(definition)`, where `definition` is a complete `TechniqueVfx`. Existing registered definitions are available through `window.modAPI.gameData.combatVfx`. Lighting belongs on the definition's actions or identity, not on the `TechniqueVfx` wrapper.

`VfxCast.beamHeight?: number` caps full beam thickness in local drawing units using the source's visible height. It is cast presentation context, not a `VfxAction` authoring field. The renderer uses `90` when the cast omits it.

**Migration note:** The lighting and beam-height fields are optional. Existing VFX definitions remain valid, and existing combat-image positions remain available alongside `shield`.

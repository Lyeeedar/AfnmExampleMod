---
layout: default
title: Combat Triggers
parent: Combat System
nav_order: 3
description: 'Complete reference for buff trigger keys in AFNM combat'
---

# Combat Triggers

Buff `triggeredBuffEffects` and `blockTriggerEffects` respond to named trigger events fired during combat. This page documents every trigger key available for use in `triggeredBuffEffects[].trigger` and `blockTriggerEffects[].trigger`.

## Timing Triggers

Fired at fixed points in the combat round:

| Trigger | When it fires |
|---------|---------------|
| `afterTechnique` | After any technique resolves |

## Round Triggers

Fired at the start or end of a combat round:

| Trigger | When it fires |
|---------|---------------|
| `onCombatStart` | Once when combat begins |
| `onRoundStart` | At the start of each round, before techniques |
| `onRoundEnd` | At the end of each round, after all techniques |

## Damage and Healing Triggers

Fired when health or barrier changes:

| Trigger | When it fires |
|---------|---------------|
| `barrierBroken` | When the holder's barrier reaches zero |
| `barrierGained` | When the holder gains barrier |
| `blockDamage` | When incoming damage is blocked (e.g. full DR) |
| `critBarrier` | When a barrier critically absorbs |
| `critDamage` | When the holder takes a critical hit |
| `critHeal` | When the holder critically heals |
| `critTempHealth` | When temporary health critically absorbs |
| `damageBlocked` | When incoming damage is fully blocked |
| `damageHp` | When the holder takes HP damage |
| `fullBarrier` | When the holder's barrier is full |
| `fullHeal` | When the holder is fully healed |
| `fullTempHealth` | When the holder's temporary health is full |
| `healthHealed` | When the holder is healed |
| `overHeal` | When healing exceeds max HP |
| `overTempHealth` | When temporary health exceeds its cap |
| `takeDamage` | When the holder takes any damage |
| `takeEnemyDamage` | When the enemy takes damage |
| `tempHealthAbsorbed` | When temporary health absorbs damage |
| `tempHealthBlocked` | When temporary health blocks damage |
| `tempHealthDepleted` | When temporary health reaches zero |
| `temporaryHealthGained` | When the holder gains temporary health |

## Typed Damage Triggers

`takeDamage-<damage type>` fires for a specific damage type:

```
takeDamage-true      // True damage
takeDamage-corrupt   // Corrupt damage
takeDamage-disruption // Disruption damage
takeDamage-normal     // Normal damage
```

## Source-Labelled Damage Triggers

`damageHp-<damage source>` fires for damage from a specific source:

```
damageHp-normal  // Normal-type damage
damageHp-weapon   // Weapon school damage
damageHp-blood    // Blood school damage
damageHp-fist     // Fist school damage
damageHp-celestial // Celestial school damage
damageHp-cloud    // Cloud school damage
damageHp-blossom  // Blossom school damage
damageHp-none     // Neutral school damage
```

## Effect-Kind Triggers

`use.<effect kind>` fires when a specific effect kind is executed by or on the holder:

```
use.damage           use.barrier          use.temporaryHealth
use.heal             use.buffSelf         use.consumeSelf
use.buffTarget       use.consumeTarget    use.negate
use.add              use.multiply         use.merge
use.trigger          use.cleanseToxicity  use.modifyBuffGroup
use.setState         use.convertSelf      use.repair
use.consumeInventoryItem use.defer         use.mergeSelf
use.permanentStatChange
```

Also: `use.<technique school>` (`use.weapon`, `use.blood`, etc.), `use.origin`, and `use.artefact`.

## Technique and Buff Effect Triggers

Fired by specific technique or buff effect executions:

```
technique.use.damage         technique.use.heal
technique.use.damageSelf    technique.use.barrier
technique.use.temporaryHealth technique.use.buffSelf
technique.use.buffTarget     technique.use.consumeSelf
technique.use.consumeTarget  technique.use.negate
technique.use.add           technique.use.multiply
technique.use.merge          technique.use.trigger
technique.use.cleanseToxicity technique.use.modifyBuffGroup
technique.use.setState      technique.use.convertSelf
technique.use.repair        technique.use.consumeInventoryItem
technique.use.defer         technique.use.mergeSelf
technique.use.permanentStatChange

buff.use.damage             buff.use.heal
buff.use.damageSelf        buff.use.barrier
buff.use.temporaryHealth
buff.use.buffSelf          buff.use.buffTarget
buff.use.consumeSelf       buff.use.consumeTarget
// ... all BuffEffect kinds
```

## Special Triggers

| Trigger | When it fires |
|---------|---------------|
| `meteorMassBoost` | When meteor mass boost is recalculated |
| `consume.<buff name>` | When stacks of the named buff are consumed |
| `spend.<buff name>` | When the named buff is spent |
| `createBuff.<buff name>` | When the named buff is created |
| `guardianBroken.<buff name>` | When a guardian buff on the holder breaks |
| `convert.<source>.<target>` | When a buff is converted from source to target |

## Custom Triggers

Any custom trigger key declared by a `trigger` effect's `triggerKey` field can be used as a trigger name, allowing mods to define their own events:

```typescript
// Declaring a custom trigger in a buff:
{
  kind: 'trigger',
  triggerKey: 'myMod_customEvent',
  effects: [/* ... */],
}

// Listening for it:
{
  triggeredBuffEffects: [{
    trigger: 'myMod_customEvent',
    effects: [/* ... */],
  }],
}
```

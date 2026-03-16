---
layout: default
title: Set Content Realm Override
parent: Event Step Types
grand_parent: Events System
nav_order: 24
description: 'Unlock higher-tier shop, auction, and herb garden access based on player reputation'
---

# Set Content Realm Override

## Introduction

The `setContentRealmOverride` step unlocks access to higher-tier shops, auctions, and herb garden stock for the player, based on their combat reputation rather than their own cultivation realm. This allows players who regularly defeat higher-realm opponents to access content above their own realm.

The override only ever upgrades — it will not lower a previously granted access level. Upgrades are permanent for the save.

## Interface

```typescript
interface SetContentRealmOverrideStep {
  kind: 'setContentRealmOverride';
  condition?: string;
  realm: Realm;
}
```

## Properties

**`kind`** — Always `'setContentRealmOverride'`.

**`realm`** — The realm tier to unlock. Must be a valid `Realm` string (e.g. `'bodyForging'`, `'meridianOpening'`, `'qiCondensation'`, `'coreFormation'`).

**`condition`** — Optional flag expression. The step is skipped if the condition evaluates to false.

## Behaviour

When the step executes:

1. The player's current `contentRealmOverride` is read.
2. If the requested `realm` is **higher** than the current override, the override is updated and the player sees a notification: *"Your reputation now grants access to \<Realm\>-tier shops, auctions, and herb supplies."*
3. If the requested `realm` is equal to or lower than the current override, nothing happens — the step is silently skipped.

The override affects which tier of goods is available in shops, the Chenmai auction, and the herb garden. It does **not** change what cultivation techniques or techniques the player can use.

## Example

The built-in combat recognition system uses this step after a player accumulates three below-realm tournament victories at a festival:

```typescript
{
  kind: 'setContentRealmOverride',
  realm: 'qiCondensation',
}
```

Combined with a condition to fire it only after enough wins:

```typescript
{
  kind: 'setContentRealmOverride',
  condition: `${belowRealmTournamentWinsFlag} >= 3`,
  realm: 'qiCondensation',
}
```

## When to Use

Use this step when an event should reward a player's combat prowess by expanding their access to higher-tier goods — for example, after winning a prestigious tournament or impressing a powerful merchant faction.

Do **not** use this to gate cultivation content (techniques, breakthroughs) — use `overridePlayerRealm` for that.

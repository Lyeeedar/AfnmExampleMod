---
layout: default
title: Drop Item Step
parent: Event Step Types
grand_parent: Events System
nav_order: 11
description: 'Configure random item rewards for an event'
---

# Drop Item Step

Use `dropItem` in an [event step list](../events.md) for a random reward weighted toward lower-rarity items. Supply the exact registered item names in `items` and set `count` to a string expression that yields the number of draws. Each draw grants one unit before any mod drop hooks run. Include a non-trophy fallback when the pool contains trophies, since trophies already in inventory or storage are removed from the pool.

The entry shape requires an `amount` string. Set it to `'1'` for `dropItem`, which uses the draw count to determine quantities. For a guaranteed reward with a configurable amount, use [Add Item](additem.md).

```typescript
{
  kind: 'dropItem',
  items: [
    { item: { name: healingHerb.name }, amount: '1' },
    { item: { name: spiritCrystal.name }, amount: '1' },
  ],
  count: '2',
}
```

With these two registered items, the step rolls twice. Both draws can pick the same item.

## Match rewards to the player's combat schools

Use `schoolBiasedDrop` for rewards such as manuals or relics that should tend to suit the player's fighting style. Group the entries in `table` by school using `weapon`, `blood`, `fist`, `celestial`, `cloud`, `blossom`, or `none` for Neutral. You can omit schools. Each draw picks a nonempty school based on the player's combat history, with some chance for every included school. Without a relevant history, the nonempty schools are equally likely. The draw then picks an entry uniformly within that school.

Both `count` and each entry's `amount` are expressions, rounded down. Nonpositive results give no draws or exclude the entry, respectively. Ordinary items can repeat across draws and their amounts add together. A trophy already in inventory or storage is excluded, and a trophy drawn by this step cannot be drawn again in the same step, even if listed under several schools.

```typescript
{
  kind: 'schoolBiasedDrop',
  table: {
    weapon: [{ item: { name: weaponTalisman.name }, amount: '2' }],
    cloud: [{ item: { name: cloudTalisman.name }, amount: '1' }],
  },
  count: '1',
}
```

This awards two weapon talismans or one cloud talisman, depending on the school selected. Register custom rewards with `window.modAPI.actions.addItem` before using their names in the table. To offer a choice of encounters whose rewards can use this pattern, see [Spawn Map Event](spawnmapevent.md).

---
layout: default
title: Pillar Pattern
parent: Item Types
grand_parent: Item System
nav_order: 9
---

# Pillar Pattern Items

Preset shard layouts that players can apply to their soul pillar in one step during Pillar Creation.

## Interface

```typescript
export interface PillarPatternItem extends ItemBase {
  kind: 'pillar_pattern';
  shards: {
    name: string;                          // Name of the shard to place
    pos: { x: number; y: number; rotation: number }; // Grid position and rotation (0-3)
    overrideInput?: {                      // Override default input power on specific sides
      top?: number;
      bottom?: number;
      left?: number;
      right?: number;
    };
  }[];
}
```

## Key Properties

- **shards**: Ordered list of shards that make up the pattern. Each entry references a shard by its `name` field and specifies where to place it.
- **pos.x / pos.y**: Grid coordinates within the pillar. `x = 0, y = 0` is the centre.
- **pos.rotation**: Rotation in 90-degree steps (0 = default, 1 = 90 deg, 2 = 180 deg, 3 = 270 deg).
- **overrideInput**: Overrides the input power on one or more sides of the placed shard. Useful when a shard's default input configuration does not match the pattern routing.

## Notes

- The player must own all referenced shards in their inventory for the pattern to be applied.
- Pillar patterns use `realm: 'pillarCreation'` — they are acquired and used at the same stage as shards.
- Patterns are cosmetic or convenience items; the underlying shards remain independent items.

## Example

```typescript
import { PillarPatternItem } from 'afnm-types';
import icon from '../assets/item/blueprint/blueprint.png';
import { separatorRight } from '../pillarShards/pc/channelling/jadeMine/separatorRight';
import { mergeAverage } from '../pillarShards/pc/channelling/craftable/mergeAverage';

export const torrentSchema: PillarPatternItem = {
  kind: 'pillar_pattern',
  name: 'Torrent Schema',
  description:
    'How exactly a shard can produce more qither than it consumes is what makes shards so curious to scholars and cultivators alike, and none are more curious than the Tiaofen.',
  icon: icon,
  stacks: 1,
  rarity: 'resplendent',
  realm: 'pillarCreation',
  shards: [
    { name: separatorRight.name, pos: { x: -1, y: 0, rotation: 0 } },
    { name: mergeAverage.name,   pos: { x:  0, y: 0, rotation: 3 }, overrideInput: { left: 1 } },
    { name: separatorRight.name, pos: { x: -1, y: 1, rotation: 0 } },
    { name: mergeAverage.name,   pos: { x:  0, y: 1, rotation: 3 }, overrideInput: { left: 1 } },
  ],
};
```

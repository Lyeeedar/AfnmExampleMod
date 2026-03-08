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
    pos: { x: number; y: number; rotation: number }; // Grid position and rotation (0–3)
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
- **pos.rotation**: Rotation in 90-degree steps (0 = default, 1 = 90°, 2 = 180°, 3 = 270°).
- **overrideInput**: Overrides the input power on one or more sides of the placed shard. Useful when a shard's default input configuration doesn't match the pattern routing.

## Notes

- The player must own all referenced shards in their inventory for the pattern to be applied.
- Pillar patterns use `realm: 'pillarCreation'` — they are acquired and used at the same stage as shards.
- Patterns are cosmetic/convenience items; the underlying shards remain independent items.

## Example

```typescript
import { PillarPatternItem } from 'afnm-types';
import icon from '../assets/item/blueprint/blueprint.png';
import { tSplitter } from '../pillarShards/tSplitter';
import { redirectLeft } from '../pillarShards/redirectLeft';
import { redirectRight } from '../pillarShards/redirectRight';
import { diandengShard } from '../pillarShards/diandengShard';
import { splitRight } from '../pillarShards/splitRight';
import { splitLeft } from '../pillarShards/splitLeft';

export const heavenwardSchema: PillarPatternItem = {
  kind: 'pillar_pattern',
  name: 'Heavenward Schema',
  description:
    'A rare and sought-after arrangement that places the Diandeng Shard at the heart of a symmetric routing structure, feeding qither evenly in three directions.',
  icon: icon,
  stacks: 1,
  rarity: 'resplendent',
  realm: 'pillarCreation',
  shards: [
    { name: splitRight.name,    pos: { x: -1, y: 1, rotation: 3 } },
    { name: tSplitter.name,     pos: { x:  0, y: 1, rotation: 0 }, overrideInput: { bottom: 3 } },
    { name: splitLeft.name,     pos: { x:  1, y: 1, rotation: 1 } },
    { name: redirectRight.name, pos: { x: -1, y: 0, rotation: 0 } },
    { name: diandengShard.name, pos: { x:  0, y: 0, rotation: 0 } },
    { name: redirectLeft.name,  pos: { x:  1, y: 0, rotation: 0 } },
  ],
};
```

---
layout: default
title: Condensation Art
parent: Item Types
grand_parent: Item System
nav_order: 12
---

# Condensation Art Items

Techniques for qi condensation and droplet creation.

## Interface

```typescript
interface CondensationArtItem extends ItemBase {
  kind: 'condensation_art';

  /** Condensation arts are always qiCondensation realm — this is fixed by the type. */
  realm: 'qiCondensation';
  /** Suppresses the realm numeral (III) drawn in the item's top-left corner. */
  hideRealmTier: true;

  patternBg: string;        // Background pattern image
  patternOpacity: number;   // Visual opacity

  artName: string; // Short name used in breakthrough text
  statChange: Partial<Record<PhysicalStatistic, number>>;
  restoredDroplets?: number; // Droplets restored by the art
  maxDroplets: number;     // Maximum droplet capacity
}
```

## Properties

- **patternBg/patternOpacity**: Visual representation
- **artName/statChange**: Breakthrough name and permanent physical stat changes
- **maxDroplets**: Storage capacity limit

## Example

```typescript
export const basicCondensationArt: CondensationArtItem = {
  kind: 'condensation_art',
  name: 'Basic Qi Condensation',
  description: 'Fundamental condensation technique.',
  icon: condensationIcon,
  stacks: 1,
  rarity: 'mundane',
  realm: 'qiCondensation',
  hideRealmTier: true,
  artName: 'Basic Qi Condensation',
  statChange: {},

  patternBg: 'basic_pattern.png',
  patternOpacity: 0.7,
  maxDroplets: 5
};
```

## Enchantments

```typescript
interface CondensationArtEnchantment extends Enchantment {
  itemKind: 'condensation_art';
  condenseEfficiency?: number;
  restoredDroplets?: number;
}
```

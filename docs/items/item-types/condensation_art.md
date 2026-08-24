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

  condenseCost: number;     // Qi cost to condense
  hpCost?: number;         // Optional HP cost
  moneyCost?: number;      // Optional spirit stone cost
  producedDroplets: number; // Droplets created per use
  maxDroplets: number;     // Maximum droplet capacity
}
```

## Properties

- **patternBg/patternOpacity**: Visual representation
- **condenseCost**: Primary qi cost for condensation
- **hpCost/moneyCost**: Optional additional costs
- **producedDroplets**: Output per condensation
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
  // realm and hideRealmTier are set automatically — do not override them

  patternBg: 'basic_pattern.png',
  patternOpacity: 0.7,
  condenseCost: 10,
  producedDroplets: 1,
  maxDroplets: 5
};
```

## Enchantments

```typescript
interface CondensationArtEnchantment extends Enchantment {
  itemKind: 'condensation_art';
  condenseEfficiency?: number;
  producedDroplets?: number;
}
```

---
layout: default
title: Pill
parent: Item Types
grand_parent: Item System
nav_order: 9
---

# Pill Items

Consumables providing temporary enhancements, limited by toxicity to prevent overuse.

## Base Interface

```typescript
interface BasePillItem extends ItemBase {
  kind: 'pill';
  pillKind: PillKind;
}

type PillKind = 'combat' | 'crafting' | 'advancement' | 'consumable';
```

## Pill Types

### Combat Pills
```typescript
interface CombatPillItem extends BasePillItem {
  pillKind: 'combat';
  toxicity: number;                    // Toxicity cost
  effects: TechniqueEffect[];          // Combat effects
  tooltip?: string;
}
```

### Crafting Pills
```typescript
interface CraftingPillItem extends BasePillItem {
  pillKind: 'crafting';
  toxicity: number;                    // Toxicity cost
  effects: CraftingTechniqueEffect[];  // Crafting effects
}
```

### Advancement Pills (No toxicity)
```typescript
interface MiscPillItem extends BasePillItem {
  pillKind: 'advancement';
  toxicity?: undefined;
}
```

### Consumable Pills (Permanent stats)
```typescript
interface ConsumablePillItem extends BasePillItem {
  pillKind: 'consumable';
  max: number;                         // Usage limit per character lifetime
  physicalStats: Partial<Record<PhysicalStatistic, number>>;  // Permanent physical stat gains
  socialStats: Partial<Record<SocialStatistic, number>>;      // Permanent social stat gains
  rawStats?: Partial<Record<CombatStatistic | CraftingStatistic, Scaling>>; // Permanent combat/crafting stat bonuses
  toxicity?: undefined;
}
```

The `rawStats` field grants permanent bonuses to combat or crafting statistics. These bonuses apply to the player's base combat and crafting entities whenever the pill is consumed, and they scale using the same `Scaling` system as technique effects:

```typescript
interface Scaling {
  value: number;          // Base value added
  stat?: CombatStatistic | CraftingStatistic | PhysicalStatistic | SocialStatistic | TechniqueElement;
                          // Optional stat to scale the base value against
  scaling?: string;       // Buff name or 'stacks'/'consumed' to multiply the result
  eqn?: string;           // Expression multiplied onto the result (e.g. '1 + (power * 0.01)')
}
```

Valid `CombatStatistic` values include: `maxhp`, `power`, `defense`, `critchance`, `critmultiplier`, `dr`, `resistance`, `lifesteal`, `damageBoost`, `healingBoost`, `barrierBoost`, and the element affinity/boost/resistance stats.

Valid `CraftingStatistic` values include: `maxpool`, `pool`, `itemEffectiveness`, `control`, `intensity`, `critchance`, `critmultiplier`, `resistance`, and others.

## Examples

```typescript
// Combat pill
export const healingPill: CombatPillItem = {
  pillKind: 'combat',
  kind: 'pill',
  name: 'Healing Pill',
  toxicity: 25,
  effects: [{
    kind: 'heal',
    amount: { value: 50, stat: undefined, eqn: '1 + (itemEffectiveness * 0.01)' },
  }],
  // ... base properties
};

// Permanent physical stat improvement
export const strengthElixir: ConsumablePillItem = {
  pillKind: 'consumable',
  kind: 'pill',
  name: 'Strength Elixir',
  max: 3,
  physicalStats: { muscles: 5 },
  socialStats: {},
  // ... base properties
};

// Permanent combat stat improvement using rawStats
export const powerElixir: ConsumablePillItem = {
  pillKind: 'consumable',
  kind: 'pill',
  name: 'Power Elixir',
  max: 5,
  physicalStats: {},
  socialStats: {},
  rawStats: {
    power: { value: 10, stat: undefined },
    critchance: { value: 2, stat: undefined },
  },
  // ... base properties
};

// Permanent crafting stat improvement using rawStats
export const artisanElixir: ConsumablePillItem = {
  pillKind: 'consumable',
  kind: 'pill',
  name: 'Artisan Elixir',
  max: 3,
  physicalStats: {},
  socialStats: {},
  rawStats: {
    itemEffectiveness: { value: 5, stat: undefined },
    control: { value: 3, stat: undefined },
  },
  // ... base properties
};
```

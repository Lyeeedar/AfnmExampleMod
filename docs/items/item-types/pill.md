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

type PillKind = 'combat' | 'crafting' | 'advancement' | 'consumable' | 'appearance_change';
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
  tooltip?: string;
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
  stacks: number;                      // Inherited from ItemBase; set to 1 for consumables
  physicalStats: Partial<Record<PhysicalStatistic, number>>;  // Permanent physical stat gains
  socialStats: Partial<Record<SocialStatistic, number>>;      // Permanent social stat gains
  rawStats?: Partial<Record<CombatStatistic | CraftingStatistic, Scaling>>; // Permanent combat/crafting stat bonuses
  consumptionGroup?: string;           // Optional shared consumption group name
  groupCap?: number;                   // Lifetime cap for the entire consumption group
  flagEffect?: {                       // Optional: iterate a flag value on consumption
    flag: string;                      // Flag key to modify
    amount: number;                    // Value to add (or subtract if negative)
  };
  tooltip?: string;                    // Optional tooltip shown in the consumption dialogue
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

### Appearance Change Pills
```typescript
interface AppearanceChangePillItem extends BasePillItem {
  pillKind: 'appearance_change';
  toxicity?: undefined;
}
```

Appearance change pills let the player alter their character's appearance. They have no toxicity and no extra fields beyond the base item properties.

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
  stacks: 1,
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
  stacks: 1,
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
  stacks: 1,
  physicalStats: {},
  socialStats: {},
  rawStats: {
    itemEffectiveness: { value: 5, stat: undefined },
    control: { value: 3, stat: undefined },
  },
  // ... base properties
};

// Shared consumption group: all pills with the same group share a combined cap
// Players can only consume groupCap pills total across all pills in the group
export const sharedFortitudePill: ConsumablePillItem = {
  pillKind: 'consumable',
  kind: 'pill',
  name: 'Minor Fortitude Pill',
  max: 5,
  stacks: 1,
  physicalStats: { muscles: 2 },
  socialStats: {},
  consumptionGroup: 'fortitude_pills',  // Shares cap with other 'fortitude_pills' pills
  groupCap: 10,                         // Total cap across all pills in the group
  // ... base properties
};

// Flag effect: iterate a flag when consumed
// Useful for tracking cumulative pill bonuses or unlocking gated content
export const jadeDroplet: ConsumablePillItem = {
  pillKind: 'consumable',
  kind: 'pill',
  name: 'Jade Droplet',
  description: 'A luminous droplet of condensed spiritual essence.',
  icon: jadeDropletIcon,
  max: 99,
  stacks: 1,
  physicalStats: {},
  socialStats: {},
  flagEffect: {
    flag: 'myMod_jadeDropletsConsumed',
    amount: 1,
  },
  rarity: 'resplendent',
  realm: 'qiCondensation',
  // ... base properties
};
```
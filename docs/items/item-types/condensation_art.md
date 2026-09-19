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

  /** Condensation arts are always qiCondensation realm, fixed by the type. */
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

  /** Custom tooltip text. When absent, one is auto-generated from triggeredBuffEffects. */
  tooltip?: string;

  /**
   * Buff effects triggered by specific condensation actions. Each entry specifies
   * a trigger and the effects to apply when it fires. Use this to grant buffs
   * when the player condenses qi or consumes droplets.
   */
  triggeredBuffEffects?: TriggeredBuffEffect[];
}
```

## Properties

- **patternBg/patternOpacity**: Visual representation
- **condenseCost**: Primary qi cost for condensation
- **hpCost/moneyCost**: Optional additional costs
- **producedDroplets**: Output per condensation
- **maxDroplets**: Storage capacity limit
- **tooltip**: Custom tooltip string. When not set, the game auto-generates a tooltip from `triggeredBuffEffects`.
- **triggeredBuffEffects**: Buff effects triggered by specific events during condensation. See [Triggered Buff Effects](#triggered-buff-effects) below.

## Example

```typescript
export const basicCondensationArt: CondensationArtItem = {
  kind: 'condensation_art',
  name: 'Basic Qi Condensation',
  description: 'Fundamental condensation technique.',
  icon: condensationIcon,
  stacks: 1,
  rarity: 'mundane',
  // realm and hideRealmTier are set automatically; do not override them

  patternBg: 'basic_pattern.png',
  patternOpacity: 0.7,
  condenseCost: 10,
  producedDroplets: 1,
  maxDroplets: 5
};
```

## Triggered Buff Effects

Condensation arts can attach buffs to specific triggers during the condensation cycle via `triggeredBuffEffects`. This lets a single condensation art grant both passive stat buffs and conditional effects that respond to the player's condensation behavior.

### TriggeredBuffEffect Interface

```typescript
interface TriggeredBuffEffect {
  /** The event that fires this effect. */
  trigger: 'consume.qiDroplets';
  /** Effects applied when the trigger fires. */
  effects: CraftingBuffEffect[];
}
```

### Supported Triggers

| Trigger | When it fires |
|---------|--------------|
| `consume.qiDroplets` | Each time the player consumes a Qi Droplet |

### Effects

Each `TriggeredBuffEffect` contains an array of `CraftingBuffEffect`. See the [Crafting Buff System](../crafting/buffs) docs for the full list of available effect kinds.

### Example

A condensation art that grants a stacking buff each time the player consumes a Qi Droplet:

```typescript
export const immortalCondensationArt: CondensationArtItem = {
  kind: 'condensation_art',
  name: 'Immolation Art',
  description: '...',
  icon: immolationIcon,
  stacks: 1,
  rarity: 'resplendent',

  patternBg: 'immolation_pattern.png',
  patternOpacity: 0.8,
  condenseCost: 12,
  producedDroplets: 2,
  maxDroplets: 18,

  tooltip:
    'Each time you consume a <name>Qi Droplet</name>, gain <num>1</num> stack of <name>Qi Immolation</name>.',

  triggeredBuffEffects: [
    {
      trigger: 'consume.qiDroplets',
      effects: [
        {
          kind: 'buffSelf',
          buff: {
            name: 'Qi Immolation',
            icon: qiImmolationIcon,
            canStack: true,
            type: 'none',
            stats: {},
            stacks: 1,
            onRoundEffects: [
              {
                kind: 'damage',
                amount: {
                  value: 0.5,
                  stat: 'power',
                  scaling: 'stacks',
                },
              },
            ],
          },
          amount: {
            value: 1,
            stat: undefined,
          },
        },
      ],
    },
  ],
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

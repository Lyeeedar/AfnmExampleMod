---
layout: default
title: Clothing
parent: Item Types
grand_parent: Item System
nav_order: 1
---

# Clothing Items

Armor and robes providing combat stats and charisma.

## Interface

```typescript
interface ClothingItem extends ItemBase {
  kind: 'clothing';
  charisma: number;
  qiAbsorption?: number;
  masteryPoints?: number;
  stats: Partial<CombatStatsMap>;
  buffs?: { buff: Buff; buffStacks: Scaling; condition?: Condition }[];
}
```

## Properties

- **stats**: Stats given by the clothing. Should always contain defense, but optionally can contain much more
- **charisma**: Social stat bonus
- **qiAbsorption**: Optional qi regeneration boost
- **masteryPoints**: Optional bonus points when mastering techniques / actions
- **buffs**: Buffs to give at the start of each combat. Each entry can optionally include a `condition` that must be met for the buff to be applied

## Examples

```typescript
// Basic charisma and defense clothing
export const sectDiscipleGarb: ClothingItem = {
  kind: 'clothing',
  charisma: window.modAPI.utils.getClothingCharisma('bodyForging', 0.7),
  stats: {
    defense: window.modAPI.utils.getClothingDefense('bodyForging', 0.85),
    maxbarrier: Math.floor(window.modAPI.utils.getExpectedHealth() * 0.1),
  },
  name: 'Nine Mountain Disciple Garb (I)',
  description: 'Clothing emblazoned with the markings of the Nine Mountain Sect.',
  icon: sectDiscipleGarbIcon,
  stacks: 1,
  rarity: 'mundane',
  realm: 'bodyForging',
};

// Armor with buffs and special stats
export const shadowPlate: ClothingItem = {
  kind: 'clothing',
  charisma: window.modAPI.utils.getClothingCharisma('qiCondensation', 0.3),
  stats: {
    defense: window.modAPI.utils.getClothingDefense('qiCondensation', 1),
    power: Math.floor(window.modAPI.utils.getExpectedPower() * 0.2),
    critchance: 2.5,
    barrierMitigation: 3,
  },
  buffs: [{
    buff: shadowSickness,
    buffStacks: { value: 1, stat: undefined },
  }],
  name: 'Shadow Plate',
  description: 'Armour crafted with shadow power that slowly saps lifeforce.',
  icon: icon,
  stacks: 0,
  rarity: 'empowered',
  realm: 'qiCondensation',
};

// Specialized school-focused clothing
export const fistMastersRegalia: ClothingItem = {
  kind: 'clothing',
  charisma: window.modAPI.utils.getClothingCharisma('pillarCreation', 0.9),
  stats: {
    defense: window.modAPI.utils.getClothingDefense('pillarCreation', 0.7),
    fistBoost: 10,
    critdam: 20,
  },
  buffs: [{
    buff: {
      name: "Fist Master's Regalia",
      icon: icon,
      canStack: false,
      stats: undefined,
      onRoundStartEffects: [
        { kind: 'buffSelf', buff: flow, amount: { value: 3, stat: undefined } },
        { kind: 'buffSelf', buff: rippleForce, amount: { value: 1, stat: undefined } }
      ],
      onRoundEffects: [],
      stacks: 1,
    },
    buffStacks: { value: 1, stat: undefined },
  }],
  name: "Fist Master's Regalia",
  description: 'Regalia promoting comfort and ease of movement for fist techniques.',
  icon: icon,
  stacks: 1,
  rarity: 'empowered',
  realm: 'pillarCreation',
};

// Clothing with a conditional buff
export const meteorfallMantle: ClothingItem = {
  kind: 'clothing',
  charisma: window.modAPI.utils.getClothingCharisma('lifeFlourishing', 0.8),
  stats: {
    defense: window.modAPI.utils.getClothingDefense('lifeFlourishing', 0.5),
    barrierMitigation: 6,
    celestialBoost: 20,
  },
  buffs: [{
    buff: {
      name: 'Meteorfall Mantle',
      icon: iconAsset,
      canStack: false,
      stats: undefined,
      tooltip: `At the start of each round, if Sunlight and Moonlight are equal then summon a Meteor.`,
      onRoundStartEffects: [
        {
          kind: 'buffSelf',
          condition: {
            kind: 'condition',
            condition: `${sunlight.name} == ${moonlight.name}`,
          },
          buff: meteor,
          amount: { value: 1, stat: undefined },
        },
      ],
      stacks: 1,
    },
    buffStacks: { value: 1, stat: undefined },
  }],
  name: 'Meteorfall Mantle',
  description: 'Mantle associated with celestial cultivators who pursue meteors aggressively.',
  icon: iconAsset,
  stacks: 1,
  rarity: 'empowered',
  realm: 'lifeFlourishing',
};
```

## Enchantments

Clothing can be enchanted to add combat stats and other bonuses:

```typescript
interface ClothingEnchantment extends Enchantment {
  itemKind: 'clothing';
  combatStats?: Partial<CombatStatsMap>;
  charisma?: number;
  masteryPoints?: number;
  qiAbsorption?: number;
  restoredDroplets?: number;
  buffs?: { buff: Buff; buffStacks: Scaling }[];
}
```
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
  setBonus?: EquipmentSetBonus;
  charisma: number;
  qiAbsorption?: number;
  masteryPoints?: number;
  stats: Partial<CombatStatsMap>;
  buffs?: { buff: Buff; buffStacks: Scaling }[];
  upgradeHarmonies?: Partial<Record<RecipeHarmonyType, ItemHarmonyUpgrade>>;
}
```

## Properties

- **setBonus**: Optional cumulative equipment set rewards. See [Equipment Set Bonuses](../item-structure#equipment-set-bonuses).
- **stats**: Stats given by the clothing. Should always contain defense, but optionally can contain much more
- **charisma**: Social stat bonus
- **qiAbsorption**: Optional qi regeneration boost
- **masteryPoints**: Optional bonus points when mastering techniques / actions
- **buffs**: Buffs to give at the start of each combat
- **upgradeHarmonies**: Harmony upgrade mappings that let the item's secondary effects scale with crafting quality. See the Harmony Upgrades section below for full details.

## Examples

```typescript
// Basic charisma and defense clothing
export const sectDiscipleGarb: ClothingItem = {
  kind: 'clothing',
  charisma: window.modAPI.utils.getClothingCharisma('bodyForging', 0.7),
  stats: {
    defense: window.modAPI.utils.getClothingDefense('bodyForging', 0.85),
    maxbarrier: Math.floor(window.modAPI.utils.getExpectedHealth('bodyForging', 'Early') * 0.1),
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
    power: Math.floor(window.modAPI.utils.getExpectedPower('qiCondensation', 'Early') * 0.2),
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
    critmultiplier: 20,
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
```

## Harmony Upgrades

Clothing with secondary effects, such as per-combat-stack buffs granted at combat start or per-rotation granted effects, can expose those effects to the crafting harmony system. This lets the item's quality tier in the Furnace of Ten Thousand Flames improve the secondary effect, giving high-quality crafted clothing a meaningful advantage beyond raw stat numbers.

The system uses two coordinated changes on the item definition:

### 1. Tag the buff's per-stack value with upgradeKey

In the item's `buffs` array, give the relevant `Scaling` object an `upgradeKey` string. This key identifies the field that harmony upgrades can target:

```typescript
buffs: [{
  buff: {
    name: 'Crystalline Conduit',
    // ...
    stats: {
      barrierMitigation: {
        value: 1.5,
        stat: undefined,
        upgradeKey: 'conduitBarrierMit',   // marks this field as harmonizable
        eqn: `${flag(aspectType)} * 0.1`,
        max: { value: 30, stat: undefined },
      },
    },
  },
  buffStacks: { value: 1, stat: undefined },
}],
```

Valid fields that can carry `upgradeKey` on a `Scaling` object include any numeric stat in `buff.stats` (e.g. `barrierMitigation`, `critchance`, `power`) and the `amount` field of `beforeTechniqueEffects` or `afterTechniqueEffects` entries.

### 2. Map harmony types to upgrade keys with upgradeHarmonies

On the item itself, add an `upgradeHarmonies` map. Each entry pairs a harmony type with one `ItemHarmonyUpgrade` object that describes how the tagged field scales with quality:

```typescript
upgradeHarmonies: {
  resonance: harmonyStatStep('conduitBarrierMit', 'Barrier Effectiveness', 5, { step: 0.5 }),
  inscription: harmonyStatStep('conduitCrit', 'Critical Chance', 5, { step: 0.5 }),
  forge: harmonyStacksStep('conduitCloudScale', 'Cloud Boost', 5),
  enhancingEcho: harmonyStatStep('conduitPower', 'Power', 5, { step: 0.01 }),
},
```

Copy the local helpers from [Item Structure](../item-structure.md#helper-functions) into your mod:

| Helper | Effect | Default threshold |
|--------|--------|-----------------|
| `harmonyStatUpgrade(upgradeKey, stat, options?)` | Multiplies the tagged field by +N% per quality tier | threshold 4, +20% |
| `harmonyStatStep(upgradeKey, stat, threshold, options?)` | Adds a fixed step per threshold quality tiers | step 1 |
| `harmonyStacksStep(upgradeKey, buffName, threshold, options?)` | Adds step to a buff's grant stacks per threshold tiers | step 1 |

`harmonyStatUpgrade` accepts `threshold` and `percent`. `harmonyStatStep` accepts `step` and a boolean `percent` for its label. `harmonyStacksStep` accepts `step`. For a custom tooltip, change the returned object's `tooltip` field.

### Harmony upgrade tooltips and the {change} placeholder

The local helpers use `{change}` in their tooltips for the amount supplied by the game. The stat or buff label is included directly in the string. For custom phrasing, set `tooltip` on the returned upgrade object.

### Complete example: clothing with harmony-upgraded secondary effect

```typescript
// Copy the local harmony helper functions from the Item Structure guide.
// They are mod utilities, rather than exports from afnm-types.
import { aspectType } from '../../techniques/cloud/cloud';
import { flag } from '../../../util/flag';

export const crystallineConduitS: ClothingItem = {
  kind: 'clothing',
  name: 'Crystalline Conduit (S)',
  charisma: 0,
  stats: {},
  description: 'A conduit robe that channels cloud qi.',
  icon: 'assets/conduit.png',
  stacks: 1,
  rarity: 'transcendent',
  realm: 'qiCondensation',
  // ...
  upgradeHarmonies: {
    resonance: harmonyStatStep('conduitBarrierMit', 'Barrier Effectiveness', 5, { step: 0.5 }),
    inscription: harmonyStatStep('conduitCrit', 'Critical Chance', 5, { step: 0.5 }),
    forge: harmonyStacksStep('conduitCloudScale', 'Cloud Boost', 5),
    enhancingEcho: harmonyStatStep('conduitPower', 'Power', 5, { step: 0.01 }),
  },
  buffs: [{
    buff: {
      icon: 'assets/example.png',
      canStack: false,
      stacks: 1,
      name: 'Crystalline Conduit',
      // ...
      stats: {
        barrierMitigation: {
          value: 1.5,
          stat: undefined,
          upgradeKey: 'conduitBarrierMit',
          eqn: `${flag(aspectType)} * 0.1`,
          max: { value: 30, stat: undefined },
        },
        critchance: {
          value: 1.5,
          stat: undefined,
          upgradeKey: 'conduitCrit',
          eqn: `${flag(aspectType)} * 0.1`,
          max: { value: 30, stat: undefined },
        },
        cloudBoost: {
          value: 0.1,
          stat: undefined,
          upgradeKey: 'conduitCloudScale',
          eqn: `${flag(aspectType)} * 0.1`,
          max: { value: 3, stat: undefined },
        },
        power: {
          value: 0.03,
          stat: 'power',
          upgradeKey: 'conduitPower',
          eqn: `${flag(aspectType)} * 0.1`,
          max: { value: 0.6, stat: undefined },
        },
      },
    },
    buffStacks: { value: 1, stat: undefined },
  }],
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

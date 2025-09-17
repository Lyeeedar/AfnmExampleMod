---
layout: default
title: Creating Items
parent: Your First Mod
grand_parent: Guides
nav_order: 2
description: 'Building your first items with buffs and effects'
---

# Step 2: Creating Items

For our tea house mod, we need items that players can actually interact with. Let's think about what a tea house would offer:

1. **Tea ingredients** that players can collect or buy
2. **Finished teas** that players can drink for benefits

This gives us a natural progression: raw materials → finished products. Players can collect tea leaves, then buy or brew finished teas for buffs.

## Why These Item Types?

We'll create two types of items:

**Material items** (`CraftingItem`) - These are ingredients like tea leaves. We use the 'material' kind because:

- Players can gather/buy them in bulk (high stack counts)
- Other systems (NPCs, crafting) can reference them as ingredients
- They represent the "input" side of our tea economy

**Consumable items** (`CombatItem`) - These are finished teas players drink. We use 'consumable' because:

- They provide temporary buffs when used
- They have limited uses (encouraging repeated purchases)
- They represent the "output" side - the reason players want tea leaves

## Creating Our Tea Items

Create `src/modContent/items/teaItems.ts`:

```typescript
import { CraftingItem, CombatItem, Buff } from 'afnm-types';

const icon = 'https://placeholder-icon.png';

// First, we need buff definitions for our consumables
export const calmMindBuff: Buff = {
  name: 'Calm Mind',
  icon: icon,
  canStack: true,
  stats: {
    resistance: {
      value: 5,
      stat: undefined,
      scaling: 'stacks',
    },
    critchance: {
      value: 10,
      stat: undefined,
      scaling: 'stacks',
    },
  },
  onTechniqueEffects: [],
  onRoundEffects: [],
  stacks: 1,
};

// Tea Leaves - the raw ingredient players collect
export const greenTeaLeaves: CraftingItem = {
  kind: 'material',
  name: 'Green Tea Leaves',
  description: 'Fresh tea leaves suitable for basic brewing.',
  icon: icon,
  stacks: 1,
  rarity: 'mundane', // Basic ingredient
  realm: 'meridianOpening', // Inventory sorting
};

// Brewed Tea - the finished product players actually use
export const brewedGreenTea: CombatItem = {
  kind: 'consumable',
  name: 'Brewed Green Tea',
  description: 'A calming tea that enhances focus and resilience.',
  icon: icon,
  stacks: 1,
  rarity: 'mundane',
  realm: 'meridianOpening',
  effects: [
    {
      kind: 'buffSelf',
      buff: calmMindBuff,
      amount: { value: 3, stat: undefined }, // Gives 3 stacks
    },
    {
      kind: 'heal',
      amount: {
        value: Math.floor(
          window.modAPI.utils.getExpectedHealth('meridianOpening', 'Late') *
            0.8,
        ),
      }, // 80% heal in the meridian opening realm
    },
  ],
};

// Higher tier version to show progression
export const jasmineTeaLeaves: CraftingItem = {
  kind: 'material',
  name: 'Jasmine Tea Leaves',
  description: 'Fragrant jasmine-infused tea leaves.',
  icon: icon,
  stacks: 1,
  rarity: 'qitouched', // Better quality
  realm: 'qiCondensation',
};

export const spiritualClarityBuff: Buff = {
  name: 'Spiritual Clarity',
  icon: icon,
  canStack: true,
  tooltip: 'Enhanced spiritual awareness from refined tea.',
  stats: {
    power: {
      value: 25,
      stat: 'power',
      scaling: 'stacks',
    },
    itemEffectiveness: {
      value: 20,
      stat: undefined,
      scaling: 'stacks',
    },
  },
  onTechniqueEffects: [],
  onRoundEffects: [],
  stacks: 1,
};

export const brewedJasmineTea: CombatItem = {
  kind: 'consumable',
  name: 'Brewed Jasmine Tea',
  description: 'An aromatic tea that sharpens spiritual awareness.',
  icon: icon,
  stacks: 1,
  rarity: 'qitouched',
  realm: 'qiCondensation',
  effects: [
    {
      kind: 'buffSelf',
      buff: spiritualClarityBuff,
      amount: { value: 2, stat: undefined },
    },
    {
      kind: 'heal',
      amount: {
        value: Math.floor(
          window.modAPI.utils.getExpectedHealth('qiCondensation', 'Late') * 0.8,
        ),
      }, // 80% heal in the qi condensation realm
    },
  ],
};
```

## Why This Structure Works

**Buffs are separate objects** because they can be reused. Multiple items, techniques, or effects might all grant "Calm Mind" - so we define it once and reference it.

**Effects array** lets consumables do multiple things. Our teas both buff the player AND heal them. This makes them more valuable than single-effect items.

**Rarity progression** shows quality differences. Jasmine tea is 'qitouched' (better) than green tea's 'mundane' rating, so it costs more and provides stronger effects.

**Stack counts matter**:

- Materials (50 stacks) - players collect lots of these
- Consumables (10 stacks) - limited use items that get consumed

## Registering Items

```typescript
export const allTeaItems = [
  greenTeaLeaves,
  jasmineTeaLeaves,
  brewedGreenTea,
  brewedJasmineTea,
];

export function initializeTeaItems() {
  console.log('🍃 Adding tea items...');

  allTeaItems.forEach((item) => {
    window.modAPI.actions.addItem(item);
  });

  console.log(`✅ Added ${allTeaItems.length} tea items`);
}
```

## Connect to Your Mod

Update `src/modContent/index.ts`:

```typescript
import { initializeTeaItems } from './items/teaItems';

function initializeMysticalTeaGarden() {
  console.log('🍵 Initializing Mystical Tea Garden Mod...');

  initializeTeaItems();

  console.log('✅ Mystical Tea Garden Mod loaded successfully!');
}

initializeMysticalTeaGarden();
```

## What We've Created

- **Green Tea Leaves** - Basic material players can buy/find
- **Brewed Green Tea** - Entry-level consumable that gives defensive buffs
- **Jasmine Tea Leaves** - Higher tier material for advanced players
- **Brewed Jasmine Tea** - Premium consumable with offensive buffs

This creates a simple but complete tea economy. Players can collect ingredients, NPCs can sell finished products, and there's clear progression from basic to advanced teas.

## Next Steps

Now we need [a character to sell these items](03-adding-characters.md) - Master Chen, our tea house proprietor who will explain the benefits of each tea and run the shop.

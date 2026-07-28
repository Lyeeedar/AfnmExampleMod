---
layout: default
title: Item Structure
parent: Item System
nav_order: 1
description: 'Core item interfaces, shared fields, and rarity system'
---

# Item Structure

All items in AFNM share a common base structure while extending into specialized types. Understanding this structure is essential for creating balanced, functional items.

## Core Item Interface

Every item implements the `ItemBase` interface:

```typescript
interface ItemBase {
  kind: ItemKind; // Item category/type
  name: string; // Display name
  description: string; // Lore and description text
  icon: string; // Asset path for visual representation
  stacks: number; // Default quantity in inventory
  rarity: Rarity; // Quality tier
  realm: Realm | 'any'; // Cultivation requirement
  valueTier?: number; // Economic worth modifier
  upgradedFrom?: Item; // Upgrade chain tracking
  upgradeHarmonies?: Partial<Record<RecipeHarmonyType, ItemHarmonyUpgrade[]>>; // Craft harmony upgrades
  dropHarmonies?: RecipeHarmonyType[]; // Harmony types eligible when item drops with quality
}
```

## Upgrade Harmonies

Items can define upgrades that activate when the item is crafted with a specific harmony type and quality tier. This allows crafted equipment to grow stronger based on the harmony and quality of the craft.

### ItemHarmonyUpgrade Interface

```typescript
interface ItemHarmonyUpgrade {
  threshold: number;       // Minimum quality tier to activate (1=basic, 2=perfect, 3+=sublime tiers)
  upgradeKey: string;      // Identifier matching upgradeKey on tagged fields
  change: number;          // Amount to add, or multiplier when shouldMultiply is true
  shouldMultiply?: boolean; // If true, value += value * change (percentage increase)
  tooltip: Translatable;   // Description of the upgrade
  exclusive?: boolean;     // When true, this upgrade cannot be borrowed by other harmonies
}
```

### Tagging Fields with upgradeKey

Fields that support upgradeKey are scaled when the item is crafted with a matching harmony above the threshold. The field value is adjusted by the upgrade change.

**Supported locations:**

- `Scaling.upgradeKey` -- on buff stat amounts and technique effect amounts:

  ```typescript
  // In a Buff stat definition
  const myBuff: Buff = {
    name: 'My Buff',
    stats: {
      power: {
        value: 10,
        stat: undefined,
        upgradeKey: 'powerBonus', // Tagged for upgrade scaling
      },
    },
  };

  // In an ArtefactTechnique effect amount
  const attack: ArtefactTechnique = {
    icon: attackIcon,
    effects: [{
      kind: 'damage',
      amount: {
        value: 0.5,
        stat: 'artefactpower',
        upgradeKey: 'damageBonus', // Tagged for upgrade scaling
      },
    }],
  };
  ```

- `Buff.maxStacks` -- controls stack ceiling for stackable buffs:

  ```typescript
  const stackingBuff: Buff = {
    name: 'Stacking Buff',
    canStack: true,
    maxStacks: 5,
    upgradeKey: 'maxStacksBonus', // Tagged -- raising maxStacks lets the buff stack higher
    stacks: 1,
  };
  ```

### Helper Functions

The game provides three helpers (imported from `harmonyUpgradeHelpers`) to generate `ItemHarmonyUpgrade` objects:

```typescript
import {
  harmonyStatUpgrade,  // Multiply a stat by +X% per threshold tier
  harmonyStatStep,     // Add a fixed step to a stat per threshold tier
  harmonyStacksStep,   // Add stacks to a buff per threshold tier
} from 'harmonyUpgradeHelpers';
```

#### harmonyStatUpgrade -- Percentage Multiplier

Multiply a tagged field by +percent% for every threshold quality tiers reached.

```typescript
// "Increase power by 20% per 4 quality tiers"
harmonyStatUpgrade('powerBonus', 'Power', { threshold: 4, percent: 20 });

// With a custom threshold (every 3 tiers, +15%)
harmonyStatUpgrade('critBonus', 'Crit Chance', { threshold: 3, percent: 15 });
```

#### harmonyStatStep -- Additive Step

Add a fixed step to a tagged field for every threshold quality tiers reached.

```typescript
// "Increase defence by 5 per 4 quality tiers"
harmonyStatStep('defenseStep', 'Defense', 4, { step: 5 });

// Percentage variant -- step is shown with a % suffix
harmonyStatStep('speedStep', 'Speed', 2, { step: 3, percent: true });
```

#### harmonyStacksStep -- Stack Grant

Add stacks to a buff maxStacks for every threshold quality tiers reached. Stack grants are exclusive by default -- a harmony cannot borrow another harmony stack upgrade.

```typescript
// "Increase Iron Blossom max stacks by 6 per 4 quality tiers"
harmonyStacksStep('ironStacks', ironBlossom.name, 4, { step: 6 });

// Non-exclusive variant
harmonyStacksStep('razorStacks', razorBlossom.name, 4, { step: 6, exclusive: false });
```

### Defining upgradeHarmonies on an Item

Attach upgradeHarmonies to any equipment item:

```typescript
import { harmonyStacksStep, harmonyStatStep, harmonyStatUpgrade } from 'harmonyUpgradeHelpers';

export const eclipsePetalMantleS: ClothingItem = {
  kind: 'clothing',
  // ... other fields
  upgradeHarmonies: {
    forge: [harmonyStacksStep('ironStacks', ironBlossom.name, 6)],
    resonance: [harmonyStatStep('stats_blossomBoost', 'Blossom Boost', 7, { step: 10, percent: true })],
    alchemical: [
      harmonyStatStep('stats_celestialBoost', 'Celestial Boost', 7, { step: 10, percent: true }),
    ],
    inscription: [harmonyStacksStep('razorStacks', razorBlossom.name, 6)],
    eccentricDecree: [harmonyStatUpgrade('stats_maxbarrier', 'Max Barrier')],
    enhancingEcho: [harmonyStatUpgrade('stats_charisma', 'Charisma')],
  },
};
```

**Inheriting upgrades on upgraded items:** When a higher-tier item is upgraded from a lower-tier one, copy the upgradeHarmonies object so all tiers benefit:

```typescript
export const eclipsePetalMantleUV: ClothingItem = {
  kind: 'clothing',
  upgradedFrom: eclipsePetalMantleS,
  upgradeHarmonies: eclipsePetalMantleS.upgradeHarmonies, // Inherit from base tier
};
```

### dropHarmonies -- Harmony Selection for Dropped Items

Items that can drop with quality (not crafted) use dropHarmonies to restrict which harmony types are eligible for the random roll that generates harmonyAugment:

```typescript
// Item can only drop with forge or alchemical harmony
dropHarmonies: ['forge', 'alchemical'],

// Empty array (default) means all harmony types are eligible
dropHarmonies: [],
```

## Item Categories

AFNM supports 36 distinct item categories:

### Equipment Types

```typescript
'clothing'; // Armor and robes
'talisman'; // Accessories with buffs
'artefact'; // Powerful items with techniques
'cauldron'; // Alchemy equipment
'flame'; // Crafting heat sources
'mount'; // Transportation items
'ore_extractor'; // Mine ore extraction devices
```

### Consumable Types

```typescript
'pill'; // Temporary enhancements
'elixir'; // Qi restoration
'concoction'; // Combat consumables
'consumable'; // Formation parts
'recuperation'; // Rest enhancement
'fruit'; // Permanent improvements
'reagent'; // Crafting enhancers
```

### Technique Types

```typescript
'technique'; // Combat abilities
'action'; // Crafting abilities
'manual'; // Full combat style manuals with stances
```

### Progression Types

```typescript
'breakthrough'; // Realm advancement
'condensation_art'; // Qi droplet generation
'pillar_shard'; // Advanced cultivation
'pillar_pattern'; // Pillar shard arrangement patterns
'life_essence'; // Life cultivation essences
```

### Crafting Types

```typescript
'recipe'; // Crafting instructions
'material'; // Base components
'enchantment'; // Equipment upgrades
'upgrade'; // Enhancement materials
```

### Farm & Utility Types

```typescript
'device'; // Automated farm devices
```

### Special Types

```typescript
'mystical_key'; // Region access
'transport_seal'; // Location travel
'formation'; // Environmental enhancement
'trophy'; // Achievements
'token'; // Currency/exchange
'treasure'; // Collectibles
'blueprint'; // Construction
'flare'; // Utility items
'local_map'; // Local map combat encounters
```

## Economic System

All items are given a base priced based on their type, rarity, realm, enchantments/quality, and the valueTier specified. Additionally, a random offset based on the items title is applied to give variance between goods.

### Value Modifiers

- **valueTier**: Multiplies base price (optional)
- **rarity**: Affects pricing multipliers
- **realm**: Higher realms increase value
- **enchantment**: Adds significant value

## Enchantment System

Items can be enhanced through enchantments:

```typescript
interface Enchantment {
  kind: string; // Enchantment type
  realm: Realm; // Required realm
  rarity: Rarity; // Enchantment quality
  itemKind: ItemKind; // Compatible item type
  name: string; // Display name
}
```

### Enchantment Benefits

- **Combat Stats**: Additional power, defense, etc.
- **Utility Effects**: Qi absorption, mastery points
- **Special Abilities**: Unique buff applications
- **Economic Value**: Significant price increases

## Integration Points

Items must be registered with the game and integrated into acquisition sources.

### 1. Adding Items to the Game

All items must be registered through the ModAPI:

```typescript
// Register the item with the game
window.modAPI.actions.addItem(myCustomItem);
```

This adds the item to the global item registry, making it available for:
- Inventory management
- Trading systems
- Quest rewards
- Event integration

### 2. Item Acquisition Sources

Once registered, items need acquisition sources for players to obtain them:

#### Shop Integration
```typescript
// Add to location-based shops
window.modAPI.actions.addItemToShop(
  myItem,           // Item to sell
  5,                // Stack size
  'Nine Mountain Sect', // Shop location
  'bodyForging',    // Required realm
  1.2,              // Price multiplier (optional)
  'friendly'        // Required reputation (optional)
);
```

#### Auction House
```typescript
// Add to auction rotation
window.modAPI.actions.addItemToAuction(
  myItem,           // Item to auction
  0.15,             // Appearance chance (15%)
  '1',              // Condition for availability. Normally always available (1)
  3,                // Stack override (optional)
  1.5               // Count multiplier (optional)
);
```

#### Combat Drops
Items are added to enemy loot through character/location definitions:
```typescript
// In enemy/character definitions
{
  kind: 'addItem',
  item: { name: 'My Custom Sword' },
  amount: '1',
}
```

#### Quest Rewards
Items can be quest objectives or rewards:
```typescript
// Quest step reward
{
  kind: 'collect',
  item: 'My Custom Material',
  amount: 5,
}

// Quest completion reward
{
  kind: 'addItem',
  item: { name: 'Quest Reward Item' },
  amount: '1',
}
```

#### Event Integration
Items work in events through EventSteps:
```typescript
// Give item to player
{ kind: 'addItem', item: { name: 'Story Item' }, amount: '1' }

// Remove item from player
{ kind: 'removeItem', item: { name: 'Consumed Item' }, amount: '1' }

// Check if player has item
{
  kind: 'conditional',
  branches: [{
    condition: 'My_Custom_Item >= 1',
    children: [/* event steps */]
  }]
}
```

#### Crafting Integration
Items integrate with crafting as materials or outputs:

**Recipe Ingredients**:
```typescript
ingredients: [
  { item: myCustomMaterial, quantity: 3 },
  { item: anotherItem, quantity: 1 },
]
```

**Recipe Outputs**:
```typescript
baseItem: myCustomCraftedItem,
perfectItem: myCustomCraftedItemPlus,
```

**Research System**:
```typescript
window.modAPI.actions.addRecipeToResearch(baseItemName, recipeItem);
```

### 3. Economic Integration

Items automatically integrate with the economy based on kind, rarity, realm, valueTier, and enchantment.

### 4. Flag Integration

Items automatically create flags for use in conditions:
- Item names are converted to flag format: "My Item Name" -> "My_Item_Name"
- Available in inventory: My_Item_Name >= 1
- In storage: storage_My_Item_Name >= 1
- Equipped status: equipped_My_Item_Name == 1

### 5. Common Integration Patterns

**Progressive Equipment**:
```typescript
// Add basic version to early shops
window.modAPI.actions.addItemToShop(basicSword, 1, 'Sect Armory', 'bodyForging');

// Add enhanced version to later shops
window.modAPI.actions.addItemToShop(enhancedSword, 1, 'Core Armory', 'coreFormation');

// Add powerful version to auctions
window.modAPI.actions.addItemToAuction(powerfulSword, 0.05, 'realm >= 4');
```

**Crafting Material Chain**:
```typescript
// Basic material from gathering/shops
window.modAPI.actions.addItemToShop(rawMaterial, 10, 'Material Shop', 'bodyForging');

// Processed material requires recipe
const processingRecipe = {
  kind: 'recipe',
  ingredients: [{ item: rawMaterial, quantity: 3 }],
  baseItem: processedMaterial,
  // ...
};

// Final item uses processed material
const finalItemRecipe = {
  kind: 'recipe',
  ingredients: [{ item: processedMaterial, quantity: 2 }],
  baseItem: finalItem,
  // ...
};
```

**Story Item Progression**:
```typescript
// Quest gives broken item
{ kind: 'addItem', item: { name: 'Broken Sword' }, amount: '1' }

// Repair quest requires materials + broken item
{
  kind: 'condition',
  completionCondition: 'Broken_Sword >= 1 && Repair_Material >= 5'
}

// Quest completion gives repaired version
{ kind: 'addItem', item: { name: 'Restored Sword' }, amount: '1' }
```

This integration system ensures items feel natural within the game world while providing multiple acquisition paths for different player preferences and progression styles.

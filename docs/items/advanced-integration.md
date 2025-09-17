---
layout: default
title: Advanced Item Integration
parent: Item System
nav_order: 4
---

# Advanced Item Integration

Beyond basic item creation, the ModAPI provides sophisticated systems for integrating items into shops, auctions, and specialized systems like stone cutting. This guide covers advanced item placement and economic integration.

## Shop Integration

### Basic Shop Addition

Add items to location-based shops with realm and reputation requirements:

```typescript
window.modAPI.actions.addItemToShop(
  item,                    // Item to add
  stacks,                  // Quantity available
  location,                // Location name
  realm,                   // Minimum realm requirement
  valueModifier?,          // Price multiplier (optional)
  reputation?              // Reputation tier requirement (optional)
);
```

### Example: Shop Integration

```typescript
const enhancedSword: ArtefactItem = {
  kind: 'artefact',
  name: 'Thunder Cleaver',
  description: 'A blade crackling with elemental power.',
  icon: swordIcon,
  // ... other properties
};

// Add to a major city shop
window.modAPI.actions.addItemToShop(
  enhancedSword,
  3, // 3 in stock
  'Blazing Dawn City', // Location
  'coreFormation', // Core Formation minimum
  1.5, // 50% price increase
  'respected', // Requires respected reputation tier
);
```

### Shop Configuration

Shop items integrate with existing location market systems:

- **Stock Refresh**: Items restock based on location's `refreshMonths` setting
- **Dynamic Pricing**: Base item value modified by `valueModifier` and location `costMultiplier`
- **Reputation Gates**: Items locked behind faction reputation tier requirements ('neutral', 'friendly', 'respected', 'honoured', 'revered', 'exalted')
- **Realm Progression**: Higher realm items appear as players advance

## Auction System

### Auction Item Addition

Add items to realm-based auction houses with conditional availability:

```typescript
window.modAPI.actions.addItemToAuction(
  item,                    // Item to auction
  chance,                  // Spawn probability (0-1)
  condition,               // Availability condition
  countOverride?,          // Custom quantity (optional)
  countMultiplier?         // Quantity scaling (optional)
);
```

### Example: Auction Integration

```typescript
const rarePill: PillItem = {
  kind: 'pill',
  name: 'Void Essence Pill',
  description: 'Enhances cultivation of void techniques.',
  icon: pillIcon,
  // ... other properties
};

// Add to high-realm auctions
window.modAPI.actions.addItemToAuction(
  rarePill,
  0.15, // 15% chance to appear
  '1', // Always available
  2, // Always 2 pills
  1.0, // No quantity scaling
);
```

### Auction Mechanics

Auction items appear in realm-appropriate auction houses:

- **Spawn Probability**: Items appear based on `chance` parameter
- **Conditional Logic**: Use game state conditions to control availability
- **Quantity Control**: Override default quantities or scale with progression
- **Bidding Integration**: Players compete for rare items through the auction system

## Stone Cutting System

### Uncut Stone Addition

Add items to realm-based stone cutting pools for mystical region rewards:

```typescript
window.modAPI.actions.addUncutStone(
  realm, // Realm tier
  uncutStone, // Item that can be cut
);
```

### Example: Stone Cutting

```typescript
const mysticalGem: MaterialItem = {
  kind: 'material',
  name: 'Celestial Jade Fragment',
  description: 'Raw celestial energy crystallized into jade.',
  icon: gemIcon,
  rarity: 'empowered',
  realm: 'pillarCreation',
  // ... other properties
};

// Add to Nascent Soul stone cutting
window.modAPI.actions.addUncutStone('pillarCreation', mysticalGem);
```

### Stone Cutting Integration

Uncut stones are obtained from mystical region exploration:

- **Realm Pools**: Each realm has its own stone cutting pool
- **Random Selection**: Players receive random stones from their realm pool
- **Cutting Results**: Stones can be cut into various refined materials
- **Progression Rewards**: Higher realm stones yield more valuable materials

## Advanced Examples

### Complete Integration Package

```typescript
// Create a valuable artefact
const legendaryWeapon: ArtefactItem = {
  kind: 'artefact',
  name: 'Starfall Spear',
  description: 'A spear forged from fallen star metal, radiating cosmic power.',
  icon: spearIcon,
  rarity: 'resplendent',
  realm: 'pillarCreation',
  // ... combat stats and techniques
};

// Add to multiple distribution channels
window.modAPI.actions.addItem(legendaryWeapon);

// Rare shop appearance in capital city
window.modAPI.actions.addItemToShop(
  legendaryWeapon,
  1, // Only 1 in stock
  'Starfall Capital',
  'coreFormation',
  3.0, // Triple price
  'exalted', // Requires exalted reputation
);

// Very rare auction appearance
window.modAPI.actions.addItemToAuction(
  legendaryWeapon,
  0.05, // 5% chance
  'completedStarfallQuest == 1',
  1, // Single item
  1.0,
);
```

### Tiered Item Distribution

```typescript
// Create a series of realm-appropriate items
const basicTalisman: TalismanItem = {
  kind: 'talisman',
  name: 'Iron Ward Pendant',
  // ... basic stats
  realm: 'qiCondensation',
};

const advancedTalisman: TalismanItem = {
  kind: 'talisman',
  name: 'Stellar Ward Pendant',
  // ... enhanced stats
  realm: 'coreFormation',
};

// Add basic version to early shops
window.modAPI.actions.addItemToShop(
  basicTalisman,
  5,
  'Starter Village',
  'qiCondensation',
  1.0,
);

// Add advanced version to auction
window.modAPI.actions.addItemToAuction(advancedTalisman, 0.25, 'realm >= 3', 2);
```

## Herb Garden Crop System

### Adding Crops to the Herb Garden

The herb garden allows players to grow crops that produce materials for crafting and cultivation. Each crop consumes and produces specific soil conditions, creating a strategic resource management system.

### Crop Structure

```typescript
interface Crop {
  item: string; // Name of the item produced
  yield: number; // Quantity produced per harvest
  growthDays: number; // Days required to mature
  cost?: {
    // Soil condition consumed (optional)
    condition: string; // Soil condition name
    amount: number; // Amount consumed
  };
  change?: {
    // Soil condition produced (optional)
    condition: string; // Soil condition name
    amount: number; // Amount produced
  };
}
```

### Soil Conditions and Usage

The herb garden operates on a soil condition economy with the following materials:

**Basic Conditions:**

- **Vita** - Basic life energy, starting soil condition. Produced by basic crops, consumed by most plants.
- **Condensed Vita** - Refined life energy. Created from Vita, used for advanced crops.
- **Aurum** - Golden earth essence. Mid-tier condition, bridges Vita to higher tiers.
- **Etherite** - Mystical ethereal essence. High-value condition for rare materials.
- **Arcana** - Arcane magical essence. Rare, high-yield soil for premium crops.

**Advanced Conditions:**

- **Growing** - Enhanced growth properties. Cycles with Arcana and Blazing.
- **Blazing** - Fire-infused soil. Transforms to Rotting and cycles with Growing.
- **Rotting** - Decomposition-rich earth. Converts to Frozen.
- **Frozen** - Ice-preserved soil. Transforms back to Blazing or Growing.

### Soil Condition Cycles

**Basic Cycle (Body Forging/Meridian Opening):**

```
Vita → Aurum → Condensed Vita → Vita (expanded)
```

- Spirit Grass produces Vita from nothing
- Plants consume Vita to produce Aurum
- Aurum converts to Condensed Vita
- Condensed Vita expands back to more Vita

**Advanced Cycle (Qi Condensation/Core Formation):**

```
Vita → Condensed Vita → Etherite → Aurum
Aurum → Etherite → Arcana → Aurum (amplified)
```

- Higher crops create Condensed Vita from Vita (6:10 ratio)
- Etherite comes from Condensed Vita or Aurum
- Arcana is the premium tier, converting back to large Aurum amounts
- Some crops cycle Etherite back to Aurum for sustainability

**Advanced Cycle (Pillar Creation):**

```
Arcana → Growing → Blazing → Rotting → Frozen → Growing/Blazing
```

- Arcana transitions to Growing (1:1 ratio)
- Growing branches to Blazing (multiple crops)
- Blazing can cycle back to Growing or advance to Rotting
- Rotting transforms to Frozen
- Frozen completes cycle back to Blazing or Growing

### When to Use Each Condition

- **Vita** - Entry-level crops, basic materials, soil generation
- **Aurum** - Mid-tier plants, bridging to advanced materials
- **Condensed Vita** - Advanced herb production, Etherite generation
- **Etherite** - Rare materials, high-value items, Arcana prerequisites
- **Arcana** - Premium crops, maximum yield conversions, gateway to advanced cycle
- **Growing** - Cycles with Arcana and Blazing for rare materials
- **Blazing** - Fire-element materials, transforms to decomposition cycle
- **Rotting** - Death/decay materials, gateway to preservation
- **Frozen** - Preservation/ice materials, completes advanced cycle

### Adding a Crop Example

```typescript
// Define your crop using string names for conditions
const mysticHerbCrop = {
  item: 'Mystic Herb',
  yield: 3, // Produces 3 mystic herbs
  growthDays: 15, // Takes 15 days to grow
  cost: {
    condition: 'Vita', // Consumes Vita soil
    amount: 5, // Consumes 5 Vita
  },
  change: {
    condition: 'Aurum', // Produces Aurum soil
    amount: 2, // Produces 2 Aurum
  },
};

// Add the crop to the appropriate realm using ModAPI
window.modAPI.actions.addCrop('qiCondensation', mysticHerbCrop);
```

### Crop Design Strategies

#### Resource Transformation

Create crops that convert common soil conditions into rarer ones:

```typescript
const alchemicalFlowerCrop = {
  item: 'Alchemical Flower',
  yield: 2,
  growthDays: 25,
  cost: {
    condition: 'Vita',
    amount: 8,
  },
  change: {
    condition: 'Etherite',
    amount: 1,
  },
};
window.modAPI.actions.addCrop('coreFormation', alchemicalFlowerCrop);
```

#### Pure Production

Some crops only produce soil conditions without consuming them:

```typescript
const soilEnricherCrop = {
  item: 'Soil Enricher',
  yield: 1,
  growthDays: 10,
  change: {
    condition: 'Vita',
    amount: 3,
  },
};
window.modAPI.actions.addCrop('bodyForging', soilEnricherCrop);
```

#### Resource Consumption

Advanced crops may consume rare conditions without producing any:

```typescript
const etherealBlossomCrop = {
  item: 'Ethereal Blossom',
  yield: 4,
  growthDays: 30,
  cost: {
    condition: 'Etherite',
    amount: 3,
  },
};
window.modAPI.actions.addCrop('pillarCreation', etherealBlossomCrop);
```

### Integration Steps

1. **Create the Item**: Define your material/treasure item first using `window.modAPI.actions.addItem()`
2. **Define the Crop**: Create the crop object with string names for conditions
3. **Add the Crop**: Use `window.modAPI.actions.addCrop(realm, cropObject)`

### Complete Example

```typescript
// 1. First create your item
const mysticHerb = {
  kind: 'material',
  name: 'Mystic Herb',
  description: 'A shimmering herb infused with spiritual energy.',
  icon: 'path/to/icon.png',
  rarity: 'empowered',
  realm: 'qiCondensation',
  // ... other item properties
};
window.modAPI.actions.addItem(mysticHerb);

// 2. Then create and add the crop
const mysticHerbCrop = {
  item: 'Mystic Herb',
  yield: 3,
  growthDays: 15,
  cost: {
    condition: 'Vita',
    amount: 5,
  },
  change: {
    condition: 'Aurum',
    amount: 2,
  },
};
window.modAPI.actions.addCrop('qiCondensation', mysticHerbCrop);
```

### Soil Condition Balance

Design crops following these established conversion patterns:

**Vita Economy:**

- Entry crops produce 1-3 Vita from nothing
- Basic crops consume 1-4 Vita, produce 1-2 Aurum
- Advanced crops consume 7-10 Vita, produce 5-6 Condensed Vita

**Aurum Bridge:**

- Consume 1-6 Aurum to produce 1-8 Condensed Vita
- Consume 4-6 Aurum to produce 1-6 Etherite
- High-tier crops convert Arcana back to 14+ Aurum

**Premium Tiers:**

- Etherite costs 2-6 Condensed Vita or 4-6 Aurum
- Arcana requires 3-5 Etherite, yields 4+ of lower tiers
- Maintain cycles so players don't get stuck without basic materials

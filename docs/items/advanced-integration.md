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

## Best Practices

### Economic Balance

- **Price Scaling**: Use `valueModifier` to maintain economic balance
- **Availability Control**: Limit powerful items through reputation tiers or rare spawns
- **Realm Progression**: Ensure items are appropriately gated by cultivation level

### Distribution Strategy

- **Multiple Channels**: Use shops, auctions, and stone cutting for different item types
- **Conditional Access**: Gate special items behind quest completion or achievements
- **Rarity Management**: Balance common shop items vs. rare auction appearances

### Integration Considerations

- **Location Theme**: Match item types to location atmosphere and lore
- **Player Progression**: Ensure items support natural character advancement
- **Economic Impact**: Consider how new items affect existing market balance

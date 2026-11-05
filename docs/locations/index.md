---
layout: default
title: Location System
nav_order: 9
has_children: true
description: 'Documentation for the AFNM location system'
---

# Location System

Locations form the world of Ascend from Nine Mountains, serving as hubs for exploration, commerce, cultivation, and adventure. Each location represents a distinct area with its own atmosphere, challenges, and opportunities.

## Documentation

### [Location Structure](location-structure)
Core location interface, required fields, and optional properties

### [Connecting Locations](connecting-locations)
Exploration links, conditional connections, and world navigation

### [Building Types](building-types)
All building types with configuration and examples

## Build a token exchange

Use a [market building](building-types#market) with `tokenCurrency` when rewards from your mod should buy a curated set of items rather than goods priced in spirit stones. Put the `MarketBuilding` in your [location's `buildings` array](location-structure), then register the location with `window.modAPI.actions.addLocation`. To add an exchange to an existing location, call `window.modAPI.actions.addBuildingsToLocation(locationName, [exchange])` after that location exists. No shopkeeper character is required.

`id` gives a market its own stock identity. Use a unique, stable ID for each market at the same location, especially when adding an exchange alongside an ordinary market. Omitting it uses the default market identity. `displayName` supplies the building's visible label.

`tokenCurrency.currencyItem` is the full `Item` used for payment. `tokenCurrency.tokenStock` contains an array for every `Realm`. Each entry has an `item: ShopItem` and `tokenCost: number`. The item's `stacks` is the stock available per refresh, and `tokenCost` is the currency cost per unit. Set `buyAsStack: true` on the entry to require purchase of the entire offered stack for that price instead. An item's optional `condition` expression gates its availability. Use distinct item names for listings so their prices are unambiguous.

Keep the required `itemPool`, `costMultiplier`, and `refreshMonths` fields. Token markets use `tokenStock` instead of `itemPool`, and their fixed token prices do not use the ordinary price multiplier. Supply empty arrays for unused realms. Stock normally includes eligible entries through the player's content tier. If those tiers contain no eligible entries, the market searches higher tiers until it finds stock, so realm grouping alone is not a strict progression gate. Use item `condition` expressions when early access must be prevented.

`tokenSell` lets players exchange only the items you explicitly accept for currency tokens. Each group's `itemMap` contains full item definitions keyed by name, and `tokensPerItem` is the number of tokens granted for each unit sold. Without accepted entries, the exchange only sells goods to the player. If an item appears in more than one group, the first group's rate wins. As a design precaution, keep buyback rates below purchase prices and exclude easily crafted or farmed goods unless earning tokens that way is intentional.

`rotation: { stockCount: 8 }` offers up to eight eligible listings each calendar month. Use a positive safe integer. The schedule covers the eligible catalogue before repeating, and the final month of a cycle can have fewer offers. Purchases and reopening the exchange do not reroll or refill that month's stock. Omit `rotation` to offer the full eligible catalogue with the normal `refreshMonths` stock refresh. Choose rotation for a large reward catalogue whose availability should vary over time, and full stock when players should always be able to redeem a particular reward.

This helper builds a market from item definitions supplied by your mod. Import the types from `afnm-types` and register your currency and reward items with `window.modAPI.actions.addItem` before adding the building.

```typescript
import type { Item, MarketBuilding, Realm } from 'afnm-types';

function makeExchange(currency: Item, reward: Item): MarketBuilding {
  const emptyPool: Record<Realm, []> = {
    mundane: [], bodyForging: [], meridianOpening: [], qiCondensation: [],
    coreFormation: [], pillarCreation: [], lifeFlourishing: [],
    worldShaping: [], innerGenesis: [], soulAscension: [],
  };

  return {
    kind: 'market',
    id: 'myModRewardExchange',
    displayName: 'Reward Exchange',
    itemPool: emptyPool,
    costMultiplier: 1,
    refreshMonths: 1,
    tokenCurrency: {
      currencyItem: currency,
      tokenStock: {
        ...emptyPool,
        mundane: [{ item: { ...reward, stacks: 3 }, tokenCost: 20 }],
      },
    },
    tokenSell: [{ itemMap: { [reward.name]: reward }, tokensPerItem: 5 }],
  };
}
```

Call `makeExchange(myCurrency, myReward)` with your registered definitions and pass the result to `addBuildingsToLocation`. This example sells up to three reward units per refresh at 20 tokens each and buys each back for five tokens. To offer a three-unit bundle for 20 tokens total, add `buyAsStack: true` beside `tokenCost`.

Use the [packaging and testing guide](../guides/packaging-testing) to load the mod. Obtain the currency through your mod's reward route, then check a purchase deducts the intended amount and reduces stock. Test accepted and unaccepted sell items, and confirm a second market at the same location keeps independent stock. For rotation, use more listings than `stockCount`, advance a calendar month, and check both the new offers and that reopening the shop preserves purchases.

## Quick Reference

### Core Properties

Every location requires these essential fields:

```typescript
{
  name: string;                  // Unique identifier
  description: string;           // Narrative description
  image: string;                // Background image path
  icon: string;                 // Map icon image path
  screenEffect: ScreenEffectType; // Visual atmosphere
  music: MusicName;             // Background music
  ambience: AmbienceName;       // Ambient sound effects
  position: { x: number; y: number }; // Map coordinates
  size: 'tiny' | 'small' | 'normal' | 'large'; // Map icon size
  unlocks: (ConditionalLink | ExplorationLink)[]; // Connected locations
}
```

### Optional Features

Locations can include various optional content:

**Buildings**: Interactive structures providing services
- Markets, healers, crafting halls
- Mission boards, libraries, custom buildings

**Combat Content**: Enemies and challenges
- Location-specific enemies with intro events
- Rarity-based spawn rates

**Events**: Dynamic content and encounters
- Random location events
- Exploration-triggered events
- Map events with cooldowns

**Progression Elements**: Realm and reputation systems
- Realm requirements and progression levels
- Location-specific reputation tracking

### Location Categories

**Villages & Settlements**
- Trading hubs with markets
- Quest givers and mission boards
- Crafting facilities

**Wilderness Areas**
- Enemy encounters
- Resource gathering
- Exploration opportunities

**Sect Territories**
- Training grounds
- Libraries and pavilions
- Specialized cultivation chambers

**Mystical Regions**
- High-risk, high-reward areas
- Unique environmental effects
- Rare resources and enemies

**Cities & Courts**
- Advanced markets
- Political intrigue
- High-level services

### Integration Points

Locations integrate with multiple game systems:

**World Navigation**
- Map-based travel system
- Distance and travel time calculations
- Exploration-based discovery

**Economic System**
- Location-specific markets
- Regional price variations
- Reputation-based discounts

**Quest System**
- Mission halls and request boards
- Location-specific quest chains
- Delivery and travel quests

**Combat System**
- Enemy spawn points
- Boss encounters
- Training grounds

**Character Progression**
- Realm-appropriate challenges
- Reputation building
- Skill acquisition locations

The location system provides the spatial framework for gameplay, creating a living world where players explore, trade, fight, and advance through the cultivation realms.
---
layout: default
title: Miscellaneous
parent: Item Types
grand_parent: Item System
nav_order: 20
---

# Miscellaneous Item Types

Several item types in AFNM use only the base ItemBase interface without additional fields or mechanics. These items rely on their name, description, rarity, and realm to convey their purpose.

## Simple Item Types

### Breakthrough Items
```typescript
export interface BreakthroughItem extends ItemBase {
  kind: 'breakthrough';
  // No additional fields
}
```
**Purpose**: Required consumables for realm advancement
**Usage**: Consumed during cultivation breakthroughs

### Token Items
```typescript
export interface TokenItem extends ItemBase {
  kind: 'token';
  // No additional fields
}
```
**Purpose**: Currency or exchange items
**Usage**: Trade, quests, or special vendors

### Trophy Items
```typescript
export interface TrophyItem extends ItemBase {
  kind: 'trophy';
  hint: string;           // Hint about how to earn
  achievementID: string;  // Achievement system link
}
```
**Purpose**: Achievement rewards and collectibles
**Usage**: Display accomplishments, unlock achievements

### Treasure Items
```typescript
export interface TreasureItem extends ItemBase {
  kind: 'treasure';
  isCollectible?: boolean;  // Optional collection tracking
}
```
**Purpose**: Valuable items from enemies or exploration
**Usage**: Selling, crafting materials, or collections

### Upgrade Items
```typescript
export interface UpgradeItem extends ItemBase {
  kind: 'upgrade';
  // No additional fields
}
```
**Purpose**: Equipment enhancement materials
**Usage**: Improve existing items' stats or quality

### Flare Items
```typescript
export interface FlareItem extends ItemBase {
  kind: 'flare';
  // No additional fields
}
```
**Purpose**: Used to explore the mine
**Usage**: Spendable resource

### Recuperation Items
```typescript
export interface RecuperationItem extends ItemBase {
  kind: 'recuperation';
  // No additional fields
}
```
**Purpose**: Healing/recovery consumables
**Usage**: Restore health between combats

### Elixir Items
```typescript
export interface ElixirItem extends ItemBase {
  kind: 'elixir';
  qi: number;  // Amount of qi restored
}
```
**Purpose**: Qi restoration consumables
**Usage**: Replenish qi during cultivation

### Transport Seal Items
```typescript
export interface TransportSealItem extends ItemBase {
  kind: 'transport_seal';
  destination: string;  // Location identifier
}
```
**Purpose**: Fast travel consumables
**Usage**: Teleport to specific locations

## Life Essence Items

Life essence items are cultivation resources tied to the life system. Each essence levels up as the player invests in it, granting new buffs and techniques at each threshold.

```typescript
export interface LifeEssenceItem extends ItemBase {
  kind: 'life_essence';
  thresholds: {
    level: number;      // Level at which this threshold activates
    buffs: Buff[];      // Buffs granted permanently at this level
    techniques: Technique[]; // Techniques unlocked at this level
  }[];
}
```

**Fields**:
- `thresholds` — ordered list of level milestones. Each threshold fires once when the essence reaches that level, permanently applying the listed buffs and unlocking the listed techniques.

**Example**:
```typescript
export const myEssence: LifeEssenceItem = {
  kind: 'life_essence',
  name: 'Ember Essence',
  description: 'A concentrated fragment of living flame, warm to the touch.',
  icon: emberIcon,
  stacks: 1,
  rarity: 'empowered',
  realm: 'bodyForging',
  thresholds: [
    {
      level: 1,
      buffs: [hearthwardBuff],
      techniques: [],
    },
    {
      level: 5,
      buffs: [],
      techniques: [flameTouchTechnique],
    },
  ],
};
```

## Device Items

Device items are functional farm objects. When placed, they operate automatically based on their `deviceEffects`.

```typescript
export interface DeviceItem extends ItemBase {
  kind: 'device';
  deviceEffects: Array<{
    type: 'harvester' | 'growthBoost' | 'yieldBoost' | 'universalSoil';
    harvestInterval?: number;  // For 'harvester': days between auto-harvests
    boostAmount?: number;      // For 'growthBoost'/'yieldBoost': fractional boost (e.g. 0.25 = 25%)
    soilConditions?: string[]; // For 'universalSoil': soil condition IDs to provide
  }>;
}
```

**Effect types**:
- `harvester` — automatically collects mature plants every `harvestInterval` days
- `growthBoost` — speeds up plant growth by `boostAmount`
- `yieldBoost` — increases harvest yield by `boostAmount`
- `universalSoil` — provides the listed soil conditions to all plants in the plot

**Example**:
```typescript
export const autoHarvester: DeviceItem = {
  kind: 'device',
  name: 'Spirit Harvester',
  description: 'Golden blades hum as they collect mature essence from nearby plants.',
  icon: harvesterIcon,
  stacks: 1,
  rarity: 'resplendent',
  realm: 'bodyForging',
  valueTier: 2,
  deviceEffects: [{ type: 'harvester', harvestInterval: 30 }],
};
```

## Manual Items

Manual items contain a full combat style: a set of named stances each containing an ordered list of technique names. When the player reads a manual, they gain access to all stances defined within it.

```typescript
export interface ManualItem extends ItemBase {
  kind: 'manual';
  style: ManualStyle;
}

interface ManualStyle {
  name: string;           // Style name (usually matches the manual's display name)
  stances: ManualStance[];
}

interface ManualStance {
  name: string;           // Stance name shown to the player
  stance: string[];       // Ordered list of technique names in this stance
  stanceRule?: StoredRule; // Optional auto-switch rule (see below)
}
```

**Stance rules** control automatic stance switching during combat. Without a rule, the stance is always available for the player to select manually. With a rule, the game may switch stances automatically based on combat state.

Common rule types:
```typescript
// Switch to this stance while a buff is below a threshold
stanceRule: {
  kind: 'conditional',
  check: '<',            // '<' | '<=' | '>' | '>=' | '==' | '!='
  condition: 'BuffName', // The buff to check (stack count)
  value: 30,             // Threshold value
}

// Use this stance in a fixed rotation position
stanceRule: {
  kind: 'rotation',
  position: 0,           // Position in the rotation cycle (0-indexed)
}
```

**Example**:
```typescript
export const ironFistManual: ManualItem = {
  kind: 'manual',
  name: 'Iron Fist Canon',
  description: 'A worn manual dense with diagrams of striking postures.',
  icon: fistManualIcon,
  stacks: 1,
  rarity: 'empowered',
  realm: 'bodyForging',
  style: {
    name: 'Iron Fist',
    stances: [
      {
        name: 'Crushing Advance',
        stance: ['Iron Strike', 'Bone Crack', 'Iron Guard', 'Smashing Blow'],
      },
      {
        name: 'Defensive Hold',
        stance: ['Iron Guard', 'Iron Guard', 'Iron Strike', 'Bone Crack'],
        stanceRule: {
          kind: 'conditional',
          check: '<',
          condition: 'Iron Shell',
          value: 3,
        },
      },
    ],
  },
};
```

Techniques referenced in `stance` arrays must already exist in the game (either from the base game or registered by your mod). Register a manual with:
```typescript
window.modAPI.actions.addManual(ironFistManual);
```

## Common Properties

All these items inherit from ItemBase:
- `kind`: The item type identifier
- `name`: Display name
- `description`: Flavor text and usage hints
- `icon`: Visual representation
- `stacks`: Stack size
- `rarity`: Item quality tier
- `realm`: Associated cultivation realm
- `valueTier?`: Optional economic value indicator

## Implementation Example

```typescript
// Simple breakthrough item
export const meridianNeedle: BreakthroughItem = {
  kind: 'breakthrough',
  name: 'Meridian Cleansing Needle',
  description: 'Clears impurities from meridians during breakthrough.',
  icon: needleIcon,
  stacks: 1,
  rarity: 'qitouched',
  realm: 'meridianOpening'
};

// Trophy with achievement link
export const bossDefeatTrophy: TrophyItem = {
  kind: 'trophy',
  name: 'Demon Lord\'s Crown',
  description: 'Proof of defeating the Demon Lord.',
  icon: crownIcon,
  stacks: 1,
  rarity: 'resplendent',
  realm: 'coreFormation',
  hint: 'Defeat the Demon Lord in single combat',
  achievementID: 'ACH_DEMON_LORD'
};

// Collectible treasure
export const ancientCoin: TreasureItem = {
  kind: 'treasure',
  name: 'Ancient Spirit Coin',
  description: 'Currency from a lost cultivation empire.',
  icon: coinIcon,
  stacks: 99,
  rarity: 'mundane',
  realm: 'any',
  isCollectible: true
};

// Qi restoration elixir
export const minorQiElixir: ElixirItem = {
  kind: 'elixir',
  name: 'Minor Qi Elixir',
  description: 'Restores a small amount of qi.',
  icon: elixirIcon,
  stacks: 10,
  rarity: 'mundane',
  realm: 'bodyForging',
  qi: 50  // Restores 50 qi
};

// Transport seal for fast travel
export const marketSeal: TransportSealItem = {
  kind: 'transport_seal',
  name: 'Market District Seal',
  description: 'Instantly transports you to the Market District.',
  icon: sealIcon,
  stacks: 1,
  rarity: 'mundane',
  realm: 'any',
  destination: 'market_district'
};
```

## Design Notes

These item types are intentionally simple:
- **No complex mechanics**: Functionality comes from game systems, not item properties
- **Flexible usage**: Can be repurposed for various game features
- **Easy to extend**: New items just need base properties
- **Clear purpose**: Name and description convey all necessary information

For items requiring special mechanics or additional data, use the more complex item types like `pill`, `technique`, `artefact`, etc.

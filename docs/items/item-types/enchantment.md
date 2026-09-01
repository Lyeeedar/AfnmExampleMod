---
layout: default
title: Enchantment
parent: Item Types
grand_parent: Item System
nav_order: 11
---

# Enchantment

Enchantments are persistent modifications applied to equipment. Unlike consumable items, an enchanted equipment slot retains its bonus as long as the enchantment is socketed. Enchantments are registered via `addEnchantment` and referenced by kind name in save data.

## Enchantment Interfaces

The `addEnchantment` action accepts one of several `Enchantment` subtypes, each targeting a specific equipment kind and exposing different stat fields.

### Base Interface

```typescript
interface Enchantment {
  kind: string;        // Unique identifier (e.g. 'pillRecovery_cauldron_mundane_mundane')
  realm: Realm;
  rarity: Rarity;
  itemKind: ItemKind;  // 'clothing' | 'cauldron' | 'flame' | 'talisman' | 'mount'
  name: string;         // Display name shown in the enchantment tooltip
  displayName?: Translatable;
}
```

### ClothingEnchantment

Enchantments socketed into clothing. Grants combat stats, charisma, mastery points, qi absorption, or buffs. Also used by the Brewers Guild for Pill Recovery enchantments.

```typescript
interface ClothingEnchantment extends Enchantment {
  itemKind: 'clothing';
  combatStats?: Partial<CombatStatsMap>;  // e.g. { power: 1, defense: 2 }
  charisma?: number;
  masteryPoints?: number;
  qiAbsorption?: number;
  restoredDroplets?: number;              // Conditional droplet restoration on technique use
  buffs?: { buff: Buff; buffStacks: Scaling }[];
}
```

### CraftingEquipmentEnchantment

Enchantments socketed into crafting equipment (cauldrons or flames). Grants crafting stats and is used for cauldron-based effects.

```typescript
interface CraftingEquipmentEnchantment extends Enchantment {
  itemKind: 'cauldron' | 'flame';
  stats: Partial<CraftingStatsMap>;       // e.g. { control: 1, pillReplication: 1 }
}
```

The `pillReplication` crafting stat causes the cauldron to produce bonus pills when the recipe's perfection is high enough. The `itemEffectiveness` stat scales the magnitude of the replication bonus.

### TalismanEnchantment

Enchantments socketed into talismans.

```typescript
interface TalismanEnchantment extends Enchantment {
  itemKind: 'talisman';
  combatStats: Partial<CombatStatsMap>;
  buffs?: { buff: Buff; buffStacks: Scaling }[];
  restoredDroplets?: number;
}
```

### MountEnchantment

Enchantments socketed into mounts.

```typescript
interface MountEnchantment extends Enchantment {
  itemKind: 'mount';
  charisma?: number;
  speed?: number;
  masteryPoints?: number;
  qiAbsorption?: number;
  explorationBonus?: number;
  buffs?: { buff: Buff; buffStacks: Scaling }[];
}
```

## Registration

```typescript
window.modAPI.actions.addEnchantment(enchantment: Enchantment)
```

Enchantments are indexed by `kind` within their equipment category (`clothing`, `cauldron`, `flame`, `talisman`, `mount`). Registering an enchantment makes it available for socketting onto matching equipment.

## Enchantment Item

The `enchantment` item kind (`kind: 'enchantment'`) is a separate item type representing a physical enchantment stone that can be traded, sold, or used as a quest reward. It is distinct from the `Enchantment` interfaces above:

```typescript
interface EnchantmentItem extends ItemBase {
  kind: 'enchantment';
  targetKind: ItemKind;      // Which equipment kind this stone enchants
  enchantmentKind: string;  // Matches the 'kind' field of a registered Enchantment
}
```

## Examples

### Clothing Enchantment with Combat Stats

```typescript
const powerBoost: ClothingEnchantment = {
  kind: 'powerBoost_clothing_coreFormation_resplendent',
  realm: 'coreFormation',
  rarity: 'resplendent',
  itemKind: 'clothing',
  name: 'Power Boost',
  combatStats: { power: 1 },
};

window.modAPI.actions.addEnchantment(powerBoost);
```

### Crafting Equipment Enchantment (Pill Recovery)

Pill Recovery cauldron enchantments grant `pillReplication` (chance to produce a bonus pill) and `itemEffectiveness` (scales the bonus magnitude):

```typescript
// Pill Recovery for cauldrons — one registration per realm/rarity tier
const pillRecoveryCauldron: CraftingEquipmentEnchantment = {
  kind: `pillRecovery_cauldron_${realm}_${rarity}`,
  realm,
  rarity,
  itemKind: 'cauldron',
  name: 'Pill Recovery',
  stats: {
    pillReplication: 1,
    itemEffectiveness: Math.floor((realmIndex - 2) * 3 + rarityIndex * 3),
  },
};

window.modAPI.actions.addEnchantment(pillRecoveryCauldron);
```

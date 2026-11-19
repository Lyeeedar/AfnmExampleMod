---
layout: default
title: Flame
parent: Item Types
grand_parent: Item System
nav_order: 5
---

# Flame Items

Crafting equipment providing energy for alchemy.

## Interface

```typescript
interface FlameItem extends CraftingEquipmentItem {
  kind: 'flame';
}

interface CraftingEquipmentItem extends ItemBase {
  stats: Partial<CraftingStatsMap>;
  buffs?: { buff: CraftingBuff; buffStacks: Scaling }[];
}
```

## Properties

- **stats**: Crafting stat bonuses (control, intensity, etc.)
- **buffs**: Optional crafting buffs to apply

## Let a loadout carry another flame

Set `stats.extraFlameSlots` on a `FlameItem` or `CauldronItem` when equipping it should make room for additional flames. The player has one slot by default. Each whole point of the combined bonus adds a slot, with capacity always at least one. A flame can supply the slot it needs when equipped. Give the bonus to a cauldron if the choice should depend on which vessel the player uses.

For example, given your complete `FlameItem` definition named `customFlame`, preserve its other crafting stats and add one slot before [registering the item](../item-structure#1-adding-items-to-the-game):

```typescript
const supportFlame: FlameItem = {
  ...customFlame,
  stats: { ...customFlame.stats, extraFlameSlots: 1 },
};
window.modAPI.actions.addItem(supportFlame);
```

Consider a smaller control or intensity bonus for a support flame if its main benefit should come from pairing with a specialised flame. Make both flames obtainable through an [item acquisition source](../item-structure#2-item-acquisition-sources). [Load your mod](../../guides/packaging-testing) and equip the support flame with an ordinary flame. Verify that both remain equipped, then unequip the support flame and check that the remaining flame still fits in the default slot.

## Examples

```typescript
// Basic flame using helper function for stats
export const bifangFlame: FlameItem = {
  kind: 'flame',
  stats: window.modAPI.utils.getCraftingEquipmentStats(
    'meridianOpening',
    'Early',
    {
      pool: 0.4,
      control: 0.3,
      intensity: 0.3,
    },
    'flame',
  ),
  name: 'Bifang Flame',
  description: 'A crafting flame harvested from the corpse of a Bifang Crane. The heavenly fire burns as long as there is qi available to it, and can be controlled with pinpoint precision by a skilled wielder.',
  icon: flameIcon,
  stacks: 1,
  rarity: 'resplendent',
  realm: 'meridianOpening',
  valueTier: 0,
};

// Advanced flame with buffs and complex effects
export const stellarFlame: FlameItem = {
  kind: 'flame',
  stats: window.modAPI.utils.getCraftingEquipmentStats(
    'pillarCreation',
    'Late',
    {
      pool: 1,
      control: 0.35,
      intensity: 0.35,
    },
    'flame',
  ),
  buffs: [{
    buff: {
      name: 'Stellar Flame',
      icon: stellarIcon,
      canStack: false,
      stats: undefined,
      effects: [],
      onFusion: [{
        kind: 'createBuff',
        buff: {
          name: 'Burn Impurities',
          icon: stellarIcon,
          canStack: true,
          stats: {
            control: {
              value: 0.05,
              stat: 'control',
              scaling: 'stacks',
              max: { value: 0.5, stat: 'control' },
            },
          },
          effects: [],
          onFusion: [],
          onRefine: [{ kind: 'negate' }],
          stacks: 1,
          displayLocation: 'perfectionRight',
        },
        stacks: { value: 1, stat: undefined },
      }],
      onRefine: [/* ... similar buff creation */],
      stacks: 1,
      displayLocation: 'none',
    },
    buffStacks: { value: 1, stat: undefined },
  }],
  name: 'Stellar Flame',
  description: 'A crafting flame purified from stellar fire of a fallen star. Something in its essence burns at the very reality it touches, a phenomenon a skilled crafter can utilize to excise even the minutest of impurities.',
  icon: stellarIcon,
  stacks: 1,
  rarity: 'incandescent',
  realm: 'pillarCreation',
  valueTier: 0,
};
```
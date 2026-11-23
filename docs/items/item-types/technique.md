---
layout: default
title: Technique
parent: Item Types
grand_parent: Item System
nav_order: 7
---

# Technique Items

Items that teach or enhance combat techniques.

## Base Interface

```typescript
interface BaseTechniqueItem extends ItemBase {
  kind: 'technique';
  subKind: TechniqueItemKind;
}

type TechniqueItemKind = 'technique' | 'crystal' | 'shard' | 'enhance';
```

## Technique Types

### Direct technique items (to sell techniques in shops)
```typescript
interface TechniqueItem extends BaseTechniqueItem {
  subKind: 'technique';
  technique: string;           // Technique name to learn
  element: TechniqueElement;   // Technique school
}
```

### Technique Crystals
```typescript
interface TechniqueCrystalItem extends BaseTechniqueItem {
  subKind: 'crystal';
  techniques: string[];         // Primary techniques
  fallbackTechniques: string[]; // Techniques to drop when the primary techniques are all unlocked. Normally should contain all the techniques for the realms below this one
}
```

### Technique Shards
```typescript
interface TechniqueShardItem extends BaseTechniqueItem {
  subKind: 'shard';
  crystal: string;  // Crystal this shard belongs to
}
```

### Enhancement Dust
```typescript
interface TechniqueEnhancementDust extends BaseTechniqueItem {
  subKind: 'enhance';
  element: 'none';  // Universal enhancement
  realm: 'any';
}
```

## Examples

```typescript
// Item that teaches one technique
export const basicPunchItem: TechniqueItem = {
  subKind: 'technique',
  technique: 'Basic Punch',
  kind: 'technique',
  name: 'Basic Punch',
  element: 'fist',
  description: "The knowledge of how to perform the 'Basic Punch' technique.",
  icon: basicPunchIcon,
  stacks: 1,
  rarity: 'mundane',
  realm: 'bodyForging',
};

// Technique crystal with primary and fallback techniques
export const fistCrystalII: TechniqueCrystalItem = {
  subKind: 'crystal',
  kind: 'technique',
  name: 'Technique Crystal II (Fist)',
  description: 'The crystal of an unformed Fist technique. Focus on it to unveil the technique locked within, or convert to Enhancement Dust.',
  techniques: ['Power Fist', 'Iron Palm Strike'], // This realms techniques
  fallbackTechniques: ['Basic Punch', 'Focused Strike'], // The previous realms techniques
  icon: fistCrystalIcon,
  stacks: 1,
  rarity: 'mundane',
  realm: 'meridianOpening',
};

// Technique shard (crafting component)
export const celestialShardI: TechniqueShardItem = {
  subKind: 'shard',
  kind: 'technique',
  name: 'Technique Shard I (Celestial)',
  description: 'The shard of a Celestial technique. Combine 10 to form a Technique Crystal.',
  crystal: 'Technique Crystal I (Celestial)',
  icon: celestialShardIcon,
  stacks: 1,
  rarity: 'mundane',
  realm: 'bodyForging',
  valueTier: 0.075,
};

// Enhancement dust (universal upgrade)
export const enhancementDust: TechniqueEnhancementDust = {
  subKind: 'enhance',
  element: 'none',
  kind: 'technique',
  name: 'Enhancement Dust',
  description: 'The qi-infused remnants of a powdered technique crystal. Can be absorbed by a cultivator to enhance a technique and increase its effectiveness.',
  icon: dustIcon,
  stacks: 1,
  rarity: 'qitouched',
  realm: 'any',
  valueTier: 0.35,
};
```

## Choose a manual's cover technique

A `ManualItem` bundles a combat style with stances. Use `highlightTechnique` when a signature technique should supply the cover's school and artwork even though another technique comes first in the style. Set it to the exact `name` of a registered technique in the manual's stances. The default is the first resolvable technique in stance order. If no technique resolves, the artwork comes from the manual's `icon`.

For a manual whose stances already include your signature technique, register that [technique](../../combat/techniques) before registering the manual:

```typescript
window.modAPI.actions.addTechnique(signatureTechnique);
window.modAPI.actions.addManual({
  ...myManual,
  highlightTechnique: signatureTechnique.name,
});
```

Use your complete `ManualItem` for `myManual`. The highlighted technique changes the cover. The manual teaches the stances defined in `style`. Inspect the manual in game to check that the intended artwork appears.

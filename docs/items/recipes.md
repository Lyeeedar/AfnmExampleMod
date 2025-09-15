---
layout: default
title: Recipe System
parent: Item System
nav_order: 2
description: 'Crafting recipes, ingredients, and difficulty mechanics'
---

# Recipe System

Recipes are the foundation of the crafting system, defining how materials transform into useful items. Understanding recipe structure and mechanics is essential for creating balanced crafting progression.

## Recipe Structure

Recipes are specialized items that contain crafting instructions:

```typescript
interface RecipeItem extends ItemBase {
  kind: 'recipe';

  // Output items for different quality levels
  baseItem: Item; // Basic crafting result
  perfectItem: Item; // Perfect quality result
  sublimeItem?: Item; // Sublime quality result (high-tier only)

  // Crafting requirements
  realmProgress: RealmProgress; // Required cultivation stage
  difficulty: RecipeDifficulty; // Crafting challenge level
  ingredients: {
    // Required materials
    item: Item;
    quantity: number;
  }[];

  // Optional overrides
  conditionEffectOverride?: RecipeConditionEffect;
  harmonyTypeOverride?: RecipeHarmonyType;

  // Advanced options
  displayPerfect?: boolean;
  hideFromCompendium?: boolean;
}
```

## Quality Tiers

Recipes produce different quality outputs based on crafting success:

### Basic Quality

- Default output for successful crafting
- Requires meeting minimum requirements
- Standard stats and effects

### Perfect Quality

- Enhanced version with improved stats
- Requires higher skill and favourable conditions
- Often 20-50% better than basic version

### Sublime Quality

- Ultimate version available only for high-tier recipes
- Exceptional stats and unique effects
- Only available for Core Formation realm and above

### Quality Examples

```typescript
// Healing Pill Recipe progression
export const healingPillRecipeIV: RecipeItem = {
  name: 'Healing Pill (IV) Recipe',
  realm: 'coreFormation',

  baseItem: { ...healingPillMap.coreFormation, stacks: 5 }, // Basic
  perfectItem: { ...healingPillPlusMap.coreFormation, stacks: 5 }, // Perfect
  sublimeItem: { ...healingPillSMap.coreFormation, stacks: 5 }, // Sublime

  ingredients: [
    { item: spiritFlameGrass, quantity: 4 },
    { item: celestialBlossom, quantity: 1 },
  ],

  realmProgress: 'Early',
  difficulty: 'easy',
};
```

## Difficulty System

Recipes use a structured difficulty progression:

```typescript
type RecipeDifficulty = 'easy' | 'medium' | 'hard' | 'extreme';
```

### Difficulty Effects

**Easy**

- Basic recipes for new crafters
- High success rates
- Minimal skill requirements
- Common materials only

**Medium**

- Intermediate recipes
- Moderate skill requirements
- Mix of common and uncommon materials
- Introduces complexity

**Hard**

- Advanced recipes for experienced crafters
- High skill requirements
- Rare materials required
- Complex harmony patterns

**Extreme**

- Master-tier recipes
- Maximum skill requirements
- Legendary materials
- Punishing failure consequences

## Realm Progression

Recipes gate content by cultivation stage:

```typescript
type RealmProgress = 'Early' | 'Middle' | 'Late';
```

### Progression Gating

- **Early**: Entry-level recipes for new cultivators
- **Middle**: Intermediate recipes requiring some advancement
- **Late**: Advanced recipes for experienced practitioners

### Scaling Examples

```typescript
// Body Forging realm progression
healingPillRecipeI: { realm: 'bodyForging', realmProgress: 'Early' }

// Core Formation realm progression
healingPillRecipeIV: { realm: 'coreFormation', realmProgress: 'Early' }
```

## Harmony Types

Recipes can override default harmony mechanics:

```typescript
type RecipeHarmonyType = 'forge' | 'alchemical' | 'inscription' | 'resonance';
```

### Harmony Mechanics

**Forge Works**

- Heat management system
- Fusion actions increase heat, others decrease
- Optimal heat range provides bonuses

**Alchemical Arts**

- Action combination system
- Every 3 actions create effects
- Specific combinations grant bonuses

**Inscribed Patterns**

- Block-based action requirements
- Must follow prescribed patterns
- Invalid actions cause severe penalties

**Spiritual Resonance**

- Single action type focus
- Building resonance grants stacking bonuses
- Switching types causes penalties

## Ingredient System

Recipes require specific materials in exact quantities:

### Material Types

**Basic Materials**

- Common herbs and minerals
- Low-tier requirements
- Readily available through gathering

**Distillations**

- Processed materials requiring sub-recipes
- Mid-tier crafting components
- Created through material refinement

**Rare Components**

- Unique materials from specific sources
- High-tier recipe requirements
- Often require exploration or combat

### Ingredient Examples

```typescript
// Simple recipe - basic materials
ingredients: [
  { item: lesserSpiritGrass, quantity: 5 },
  { item: lesserYuheHerb, quantity: 1 },
];

// Advanced recipe - processed materials
ingredients: [{ item: fleshweavingDistillation, quantity: 2 }];

// Complex recipe - multiple rare materials
ingredients: [
  { item: spiritFlameGrass, quantity: 4 },
  { item: celestialBlossom, quantity: 1 },
];
```

## Condition Effects

Recipes can specify custom condition behaviors:

```typescript
interface RecipeConditionEffect {
  name: string;
  conditionEffects: Record<
    CraftingCondition,
    {
      tooltip: string;
      effects: CraftingConditionEffect[];
    }
  >;
}
```

### Condition Types

- **Neutral**: Balanced state
- **Positive**: Favorable conditions
- **Negative**: Resistant conditions
- **Very Positive**: Brilliant conditions
- **Very Negative**: Corrupted conditions

## Recipe Categories

Recipes span all major item categories:

### Equipment Recipes

- **Clothing**: Armor and robes
- **Artefacts**: Powerful weapons
- **Talismans**: Accessory items
- **Cauldrons**: Crafting equipment

### Consumable Recipes

- **Pills**: Combat and crafting enhancement
- **Concoctions**: Combat consumables
- **Elixirs**: Qi restoration items

### Material Recipes

- **Distillations**: Processed materials
- **Blanks**: Equipment crafting bases
- **Components**: Specialized materials

### Special Recipes

- **Mystical Keys**: Region access items
- **Formations**: Environmental enhancements
- **Breakthrough Pills**: Advancement items

## Recipe Design Guidelines

### Progression Balance

- **Linear Scaling**: Each tier should meaningfully improve on the last
- **Material Availability**: Ensure ingredients match expected player resources
- **Skill Requirements**: Difficulty should match realm expectations

### Economic Integration

- **Cost Effectiveness**: Recipes should provide value for material investment
- **Market Position**: Consider how crafted items compete with drops/purchases
- **Resource Sinks**: Higher-tier recipes should consume valuable materials

### Player Experience

- **Clear Upgrades**: Recipe tiers should offer obvious improvements
- **Experimentation**: Allow players to discover optimal crafting strategies
- **Specialization**: Support different crafting focuses and builds

## Implementation Examples

### Basic Progression Recipe

```typescript
export const healingPillRecipeBodyForging: RecipeItem = {
  kind: 'recipe',
  name: 'Healing Pill (I) Recipe',
  description:
    'The recipe for a Healing Pill suitable for a Body Forging cultivator.',
  icon: pillRecipeIcon,
  stacks: 1,
  rarity: 'mundane',
  realm: 'bodyForging',

  baseItem: { ...healingPillMap.bodyForging, stacks: 5 },
  perfectItem: { ...healingPillPlusMap.bodyForging, stacks: 5 },

  ingredients: [
    { item: lesserSpiritGrass, quantity: 5 },
    { item: lesserYuheHerb, quantity: 1 },
  ],

  realmProgress: 'Early',
  difficulty: 'easy',
};
```

### Advanced Master Recipe

```typescript
export const celestialTalonRecipe: RecipeItem = {
  kind: 'recipe',
  name: 'Celestial Talon Recipe',
  description:
    'Instructions for forging a weapon that channels the power of the stars.',
  icon: artefactRecipeIcon,
  stacks: 1,
  rarity: 'legendary',
  realm: 'coreFormation',

  baseItem: celestialTalon,
  perfectItem: celestialTalonPerfect,
  sublimeItem: celestialTalonSublime,

  ingredients: [
    { item: starryOrchid, quantity: 3 },
    { item: celestialEssence, quantity: 2 },
    { item: artefactBlank, quantity: 1 },
  ],

  realmProgress: 'Late',
  difficulty: 'extreme',
  harmonyTypeOverride: 'forge',
};
```

The recipe system provides structured progression that rewards player advancement while maintaining crafting challenge and economic balance throughout the cultivation journey.

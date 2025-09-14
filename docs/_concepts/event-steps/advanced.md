---
layout: default
title: Advanced Systems Steps
---

# Advanced Systems Steps

These steps handle specialized game systems including reputation, progression tracking, technique unlocking, and complex player choice mechanics. They provide advanced functionality for sophisticated mod development.

## Change Reputation Step

Modifies the player's reputation with various factions or organizations.

### Interface

```typescript
interface ChangeReputationStep {
  kind: 'reputation';
  condition?: string;
  amount: string;
  name: string;
  max?: ReputationTier;
}
```

### Properties

- **`kind`** - Always `'reputation'`
- **`condition`** (optional) - [Flag expression](/concepts/flags/) that must be true for the step to execute
- **`amount`** - Expression for reputation change (positive increases, negative decreases)
- **`name`** - Name of the reputation category
- **`max`** (optional) - Maximum reputation tier this change can reach

### Examples

#### Quest Success Reputation

```typescript
{
  kind: 'reputation',
  amount: '10',
  name: 'Nine Mountain Sect'
}
```

## Unlock Technique Step

Grants the player access to new combat or cultivation techniques.

### Interface

```typescript
interface UnlockTechniqueStep {
  kind: 'unlockTechnique';
  condition?: string;
  technique: string;
}
```

### Properties

- **`kind`** - Always `'unlockTechnique'`
- **`condition`** (optional) - [Flag expression](/concepts/flags/) that must be true for the step to execute
- **`technique`** - Name of the technique to unlock. This must refer to an existing technique or a new technique you have added to the game using the `addTechnique` modAPI function.

### Examples

#### Ancient Knowledge Discovery

```typescript
[
  {
    kind: 'text',
    text: 'Almost involuntarily, you raise your hands and touch each crystal in turn. In an instant, they dissolve and you <i>know</i>.',
  },
  {
    kind: 'unlockTechnique',
    technique: 'Hemorrhagic Overload',
  },
  {
    kind: 'unlockTechnique',
    technique: 'Crimson Tide',
  },
];
```

#### Master's Teaching

```typescript
[
  {
    kind: 'speech',
    character: 'Grand Master',
    text: '"You have proven yourself worthy of learning the forbidden arts."',
  },
  {
    kind: 'unlockTechnique',
    technique: 'Void Rending Strike',
  },
];
```

#### Breakthrough Reward

```typescript
[
  {
    kind: 'text',
    text: 'As your cultivation advances, new techniques become available to you.',
  },
  {
    kind: 'unlockTechnique',
    technique: 'Pillar Formation Technique',
  },
];
```

## Unlock Crafting Technique Step

Grants access to new crafting methods and recipes.

### Interface

```typescript
interface UnlockCraftingTechniqueStep {
  kind: 'unlockCraftingTechnique';
  condition?: string;
  craftingTechnique: string;
}
```

### Properties

- **`kind`** - Always `'unlockCraftingTechnique'`
- **`condition`** (optional) - [Flag expression](/concepts/flags/) that must be true for the step to execute
- **`craftingTechnique`** - Name of the crafting technique to unlock. This must refer to an existing crafting action or a new action you have added to the game using the `addCraftingTechnique` modAPI function.

### Examples

#### Ancient Recipe Discovery

```typescript
[
  {
    kind: 'text',
    text: 'The ancient scroll reveals secrets of pill refinement unknown to modern alchemists.',
  },
  {
    kind: 'unlockCraftingTechnique',
    technique: 'Celestial Refinement',
  },
];
```

#### Master Craftsman Teaching

```typescript
[
  {
    kind: 'speech',
    character: 'Master Alchemist',
    text: '"I shall teach you the technique that has been passed down through generations."',
  },
  {
    kind: 'unlockCraftingTechnique',
    technique: 'Triple Flame Method',
  },
];
```

## Add Recipe Step

Adds specific recipes to the player's crafting knowledge.

### Interface

```typescript
interface AddRecipeStep {
  kind: 'addRecipe';
  condition?: string;
  recipe: string;
}
```

### Properties

- **`kind`** - Always `'addRecipe'`
- **`condition`** (optional) - [Flag expression](/concepts/flags/) that must be true for the step to execute
- **`recipe`** - Name of the recipe to add. This must refer to an existing recipe or a new recipe you have added to the game using the `addItem` modAPI function.

### Examples

#### Research Reward

```typescript
[
  {
    kind: 'text',
    text: 'Your research into spirit herbs yields a new pill formula.',
  },
  {
    kind: 'addRecipe',
    recipe: 'Enhanced Spirit Pill',
  },
];
```

#### Character Teaching

```typescript
[
  {
    kind: 'speech',
    character: 'Herb Master',
    text: '"Here is the recipe for my special healing elixir."',
  },
  {
    kind: 'addRecipe',
    recipe: "Master's Healing Elixir",
  },
];
```

## Give Item Step

Presents the player with a choice of items to give from their inventory, allowing a cleaner UI for selective branching.

### Interface

```typescript
interface GiveItemStep {
  kind: 'giveItem';
  condition?: string;
  description: string;
  itemNames: string[];
  branches: {
    item: string;
    children: EventStep[];
  }[];
  cancel: EventStep[];
}
```

### Properties

- **`kind`** - Always `'giveItem'`
- **`condition`** (optional) - [Flag expression](/concepts/flags/) that must be true for the step to execute
- **`description`** - Text describing the choice presented to the player
- **`itemNames`** - Array of item names the player can choose from. Each option will only be presented if the player carries at least one of that item in their inventory
- **`branches`** - Event sequences for each item choice
- **`cancel`** - Event steps if player cancels the selection

### Examples

#### Puppet Core Selection

```typescript
{
  kind: 'giveItem',
  description: "Select a technique crystal (V) to be inserted into the puppet's core",
  itemNames: [
    'Blood Crystal V',
    'Blossom Crystal V',
    'Weapon Crystal V',
    'Fist Crystal V',
    'Cloud Crystal V',
    'Celestial Crystal V'
  ],
  branches: [
    {
      item: 'Blood Crystal V',
      children: [
        {
          kind: 'text',
          text: 'The blood crystal pulses with dark energy as it merges with the puppet.'
        },
        {
          kind: 'addItem',
          item: { name: 'Blood Puppet' },
          amount: '1'
        }
      ]
    },
    {
      item: 'Blossom Crystal V',
      children: [
        {
          kind: 'text',
          text: 'Natural energy flows through the puppet as the blossom crystal takes hold.'
        },
        {
          kind: 'addItem',
          item: { name: 'Nature Puppet' },
          amount: '1'
        }
      ]
    }
  ],
  cancel: [
    {
      kind: 'text',
      text: 'You decide to wait before making such an important choice.'
    }
  ]
}
```

## Change HP Step

Directly modifies the player's health points.

### Interface

```typescript
interface ChangeHpStep {
  kind: 'changeHp';
  condition?: string;
  amount: string;
}
```

### Properties

- **`kind`** - Always `'changeHp'`
- **`condition`** (optional) - [Flag expression](/concepts/flags/) that must be true for the step to execute
- **`amount`** - Expression for HP change (positive heals, negative damages)

### Examples

#### Healing Event

```typescript
{
  kind: 'changeHp',
  amount: '100'
}
```

#### Environmental Damage

```typescript
{
  kind: 'changeHp',
  amount: '-50'
}
```

#### Percentage-Based Effects

```typescript
{
  kind: 'changeHp',
  amount: 'maxhp * 0.25'  // Heal 25% of max HP
}
```

---

[← World & Location](world/) | [API Reference →](../api-reference/)

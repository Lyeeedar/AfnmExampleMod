---
layout: default
title: Items & Resources Steps
---

# Items & Resources Steps

These steps handle inventory management, currency changes, and resource manipulation. They form the economic foundation of events by adding rewards, removing costs, and managing player resources.

## Add Item Step

Gives items to the player's inventory with flexible quantity calculations.

### Interface

```typescript
interface AddItemStep {
  kind: 'addItem';
  condition?: string;
  item: ItemDesc;
  amount: string;
}
```

### Properties

- **`kind`** - Always `'addItem'`
- **`condition`** (optional) - [Flag expression](/concepts/flags/) that must be true for the step to execute
- **`item`** - Item to add. Normally just a { name: string } unless you wish to add enchantments or quality.
- **`amount`** - Expression that evaluates to the quantity (see [Flags](/concepts/flags/))

### Examples

#### Quest Rewards

```typescript
{
  kind: 'addItem',
  item: { name: 'True Awakening Pill' },
  amount: '1'
}
```

#### Multiple Items

```typescript
{
  kind: 'addItem',
  item: { name: 'Recuperation Pill' },
  amount: '3'
}
```

#### Scaled Rewards

```typescript
{
  kind: 'addItem',
  item: { name: 'Soul Stone' },
  amount: 'realm + 2'  // More stones for higher realms
}
```

## Add Multiple Items Step

Efficiently adds several different items in a single step.

### Interface

```typescript
interface AddMultipleItemStep {
  kind: 'addMultipleItem';
  condition?: string;
  items: { item: ItemDesc; amount: string }[];
}
```

### Properties

- **`kind`** - Always `'addMultipleItem'`
- **`condition`** (optional) - [Flag expression](/concepts/flags/) that must be true for the step to execute
- **`items`** - Array of item/amount pairs to add simultaneously

### Examples

#### Generous Noble Reward

```typescript
{
  kind: 'addMultipleItem',
  items: [
    {
      item: { name: 'Zongshi Ingot' },
      amount: '7'
    },
    {
      item: { name: 'Pressure Essence Crystal' },
      amount: '2'
    }
  ]
}
```

#### Breakthrough Aid Package

```typescript
{
  kind: 'addMultipleItem',
  items: [
    {
      item: { name: 'Qi Condensation Pill' },
      amount: '5'
    },
    {
      item: { name: 'Spirit Stone' },
      amount: '10'
    },
    {
      item: { name: 'Meditation Manual' },
      amount: '1'
    }
  ]
}
```

## Remove Item Step

Removes items from the player's inventory, often as payment or consumption.

### Interface

```typescript
interface RemoveItemStep {
  kind: 'removeItem';
  condition?: string;
  item: ItemDesc;
  alternates?: ItemDesc[];
  amount: string;
}
```

### Properties

- **`kind`** - Always `'removeItem'`
- **`condition`** (optional) - [Flag expression](/concepts/flags/) that must be true for the step to execute
- **`item`** - Primary item to remove
- **`alternates`** (optional) - Alternative items that can be removed instead
- **`amount`** - Expression for quantity to remove

### Examples

#### Spirit Core Payment

```typescript
{
  kind: 'removeItem',
  item: { name: 'Body Forging Spirit Core' },
  amount: '1'
}
```

#### Flexible Payment Options

```typescript
{
  kind: 'removeItem',
  item: { name: 'Gold Spirit Stone' },
  alternates: [
    { name: 'Silver Spirit Stone' },
    { name: 'Copper Spirit Stone' }
  ],
  amount: '3'
}
```

#### Quest Consumption

```typescript
{
  kind: 'removeItem',
  item: { name: 'Ancient Key Fragment' },
  amount: 'fragmentsNeeded'
}
```

## Replace Item Step

Transforms one item into another, useful for upgrades or transmutations. This will also replace equipped items directly.

### Interface

```typescript
interface ReplaceItemStep {
  kind: 'replaceItem';
  condition?: string;
  source: ItemDesc;
  target: ItemDesc;
}
```

### Properties

- **`kind`** - Always `'replaceItem'`
- **`condition`** (optional) - [Flag expression](/concepts/flags/) that must be true for the step to execute
- **`source`** - Item to be replaced
- **`target`** - Item to replace it with

### Examples

#### Pill Refinement

```typescript
{
  kind: 'replaceItem',
  source: { name: 'Crude Healing Pill' },
  target: { name: 'Refined Healing Pill' }
}
```

#### Weapon Upgrade

```typescript
{
  kind: 'replaceItem',
  source: { name: 'Iron Sword' },
  target: { name: 'Spirit Iron Sword' }
}
```

## Money Step

Adds or removes currency from the player's reserves.

### Interface

```typescript
interface ChangeMoneyStep {
  kind: 'money';
  condition?: string;
  amount: string;
}
```

### Properties

- **`kind`** - Always `'money'`
- **`condition`** (optional) - [Flag expression](/concepts/flags/) that must be true for the step to execute
- **`amount`** - Expression for currency change (positive adds, negative removes)

### Examples

#### Quest Reward Money

```typescript
{
  kind: 'money',
  amount: '1000'
}
```

#### Scaled Rewards

```typescript
{
  kind: 'money',
  amount: 'realm * 500'  // Higher realms earn more
}
```

#### Payment Cost

```typescript
{
  kind: 'money',
  amount: '-250'  // Negative removes money
}
```

## Qi Step

Modifies the player's qi reserves for cultivation progress.

### Interface

```typescript
interface QiStep {
  kind: 'qi';
  condition?: string;
  amount: string;
}
```

### Properties

- **`kind`** - Always `'qi'`
- **`condition`** (optional) - [Flag expression](/concepts/flags/) that must be true for the step to execute
- **`amount`** - Expression for qi change (positive adds, negative removes)

### Examples

#### Cultivation Reward

```typescript
{
  kind: 'qi',
  amount: '500'
}
```

#### Festival Qi Gathering

```typescript
{
  kind: 'qi',
  amount: ""+Math.floor(window.modAPI.utils.getRealmQi("bodyForging", "Late"))
}
```

#### Qi Drain Penalty

```typescript
{
  kind: 'qi',
  amount: '-100'
}
```

## Drop Item Step

Gives the player a random selection of items from a larger pool. Normally used for repeatable events that encourage repeatability to acquire the rarer items from the pool.

### Interface

```typescript
interface DropItemStep {
  kind: 'dropItem';
  condition?: string;
  items: { item: ItemDesc; amount: string }[];
  count: string;
}
```

### Properties

- **`kind`** - Always `'dropItem'`
- **`condition`** (optional) - [Flag expression](/concepts/flags/) that must be true for the step to execute
- **`items`** - Array of possible items that can be dropped
- **`count`** - Expression for how many items to drop

### Examples

#### Combat Loot

```typescript
{
  kind: 'dropItem',
  items: [
    { item: { name: 'Beast Core' }, amount: '1' },
    { item: { name: 'Spirit Stone' }, amount: '2' },
    { item: { name: 'Rare Herb' }, amount: '1' }
  ],
  count: '2'  // Drops 2 random items from the list
}
```

#### Treasure Chest

```typescript
{
  kind: 'dropItem',
  items: [
    { item: { name: 'Ancient Scroll' }, amount: '1' },
    { item: { name: 'Mystic Gem' }, amount: '3' }
  ],
  count: '1'
}
```

## ItemDesc Format

All item steps use the `ItemDesc` interface to specify items:

```typescript
interface ItemDesc {
  name: string;
  stacks?: number;
  enchantment?: EnchantmentDesc;
  qualityTier?: number;
}
```

### Basic Item Reference

```typescript
{
  name: 'Spirit Stone';
}
```

### Item with Quality

By convention quality should only be applied to equippable items. However, all items with numeric values support quality, if you wish to design new uses for the quality system.

```typescript
{
  name: 'Nine Mountain Sword',
  qualityTier: 3
}
```

### Enchanted Item

Enchantments must be pulled from the existing enchantment pool, or from ones added through the `addEnchantment` modAPI function.

```typescript
{
  name: 'Iron Sword',
  enchantment: {
    kind: 'sharpness',
    rarity: 'uncommon'
  }
}
```

## Real Game Examples

### Tutorial Item Giving

```typescript
// From tutorial.ts - Lu Gian gives recuperation pill
{
  kind: 'speech',
  character: 'Lu Gian',
  text: '"Here, take this Recuperation Pill, I want to get you out of my hair before the end of the week."'
},
{
  kind: 'addItem',
  item: { name: 'Mundane Recuperation Pill' },
  amount: '1'
}
```

### Noble Encounter Rewards

```typescript
// From nobleRivals.ts - generous reward from grateful noble
{
  kind: 'speech',
  character: 'He Xiaobo',
  text: '"{forename}! Ah... Al- Always a pleasure to see you..." He Xiaobo stutters out with difficulty. "I have here some items as t-thanks again."'
},
{
  kind: 'addMultipleItem',
  items: [
    {
      item: { name: 'Zongshi Ingot' },
      amount: '7'
    },
    {
      item: { name: 'Pressure Essence Crystal' },
      amount: '2'
    }
  ]
}
```

### Spirit Trading

```typescript
// From forgeSpirit.ts - paying spirit core for service
{
  kind: 'speech',
  character: 'Forge Spirit',
  text: '"Here you go"'
},
{
  kind: 'removeItem',
  item: { name: 'Body Forging Spirit Core' },
  amount: '1'
},
{
  kind: 'speech',
  character: 'Forge Spirit',
  text: '"Yes, finally!" The Forge Spirit exclaims, before gliding forward to grab at the core in your hand.'
}
```

## Best Practices

### Item Management

- **Use meaningful names** - Reference items by their exact `name` property
- **Check availability** - Use conditions to verify players have required items
- **Provide feedback** - Combine with text/speech steps to explain what happened
- **Handle alternatives** - Use `alternates` in `removeItem` for flexible costs

### Resource Balance

- **Scale rewards appropriately** - Higher realm players should get better rewards
- **Consider progression** - Don't give items that skip content stages
- **Balance risk/reward** - Harder challenges should provide better resources
- **Maintain economy** - Avoid excessive currency/resource inflation

### User Experience

- **Clear communication** - Always explain why items are added/removed
- **Logical flow** - Remove costs before showing failure, add rewards after success
- **Batch operations** - Use `addMultipleItem` for multiple rewards
- **Meaningful choices** - Let players decide how to spend resources

## Common Patterns

### Quest Completion Rewards

```typescript
[
  {
    kind: 'text',
    text: 'The quest giver smiles and hands you a small pouch.',
  },
  {
    kind: 'addItem',
    item: { name: 'Spirit Stone' },
    amount: '5',
  },
  {
    kind: 'money',
    amount: '1000',
  },
];
```

### Trading Sequences

```typescript
[
  {
    kind: 'removeItem',
    item: { name: 'Rare Herb' },
    amount: '3',
  },
  {
    kind: 'text',
    text: 'The merchant examines your herbs and nods approvingly.',
  },
  {
    kind: 'addItem',
    item: { name: 'Cultivation Pill' },
    amount: '1',
  },
];
```

### Conditional Resource Management

```typescript
{
  kind: 'conditional',
  branches: [
    {
      condition: 'realm >= 4',
      children: [
        {
          kind: 'addItem',
          item: { name: 'High Grade Spirit Stone' },
          amount: '2'
        }
      ]
    },
    {
      condition: '1',  // Default case
      children: [
        {
          kind: 'addItem',
          item: { name: 'Low Grade Spirit Stone' },
          amount: '5'
        }
      ]
    }
  ]
}
```

---

[← State Management](state/) | [Combat & Challenges →](combat/)

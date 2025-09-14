---
layout: default
title: Buffs and Resources
---

# Buffs and Resources

Buffs are the core resource system in Ascend from Nine Mountains. They represent temporary effects, accumulated resources, and state modifications during both combat and crafting. Rather than tracking resources through separate systems, the game uses a unified buff system that can represent everything from simple status effects to complex resource pools.

## Core Concept: Everything is a Buff

The key insight is that buffs aren't just status effects - they're the game's universal resource system:

- **Combat Resources** - Flow, momentum, essence pools
- **Status Effects** - Poison, burning, shields
- **Technique Requirements** - Costs that must be paid
- **Stacking Mechanics** - Resources that accumulate and consume
- **Conditional States** - Triggers based on buff presence

## Buff Architecture

### Combat Buffs

Used during battle encounters to track resources and effects:

```typescript
interface Buff {
  name: string;
  icon: string;
  canStack: boolean; // Can have multiple stacks
  stacks: number; // Current stack count
  maxStacks?: number; // Maximum allowed stacks

  // Stat modifications (see Scaling documentation)
  stats?: Partial<{ [key in CombatStatistic]: Scaling }>;

  // Conditional application
  condition?: TechniqueCondition;

  // Effect triggers
  onTechniqueEffects: BuffEffect[]; // When using techniques
  onRoundEffects: BuffEffect[]; // Each round
  onRoundStartEffects?: BuffEffect[]; // Start of round
  onCombatStartEffects?: BuffEffect[]; // Start of combat
}
```

### Crafting Buffs

Used during crafting to manage the crafting state:

```typescript
interface CraftingBuff {
  name: string;
  icon: string;
  canStack: boolean;
  stacks: number;
  maxStacks?: number;

  // Stat modifications for crafting
  stats?: Partial<{ [key in CraftingStatistic]: Scaling }>;

  // Crafting-specific triggers
  effects: CraftingBuffEffect[]; // General effects
  onFusion?: CraftingBuffEffect[]; // During fusion
  onRefine?: CraftingBuffEffect[]; // During refinement
  onStabilize?: CraftingBuffEffect[]; // During stabilization
  onSupport?: CraftingBuffEffect[]; // During support actions

  // Visual positioning
  displayLocation: CraftingBuffDisplayLocation;
}
```

## Resource System Design

### Stacking Resources

Buffs naturally implement resource accumulation through stacks:

```typescript
// Example: Flow resource for fist techniques
const flow: Buff = {
  name: 'Flow',
  icon: 'flow-icon',
  canStack: true,
  maxStacks: 10,
  stacks: 0,
  onTechniqueEffects: [], // No inherent effects
};
```

### Resource Generation

Techniques generate resources by creating buff stacks:

```typescript
// Basic fist attack generates Flow
effects: [
  {
    kind: 'damage',
    amount: { value: 1, stat: 'power' }, // See Scaling for details
  },
  {
    kind: 'buffSelf',
    buff: flow,
    amount: { value: 1 }, // Add 1 Flow stack
  },
];
```

### Resource Consumption

Techniques consume resources through costs:

```typescript
// Advanced technique costs Flow
costs: [
  {
    buff: flow,
    amount: 3, // Requires 3 Flow stacks
  },
];
```

## Buff as State Machine

Buffs can represent complex state machines through conditions and effects:

### Conditional Activation

```typescript
// Buff that only works at low health
condition: {
  kind: 'hp',
  percentage: 30,
  mode: 'less'
}
```

### State Transitions

```typescript
// Buff that transforms into another buff
onRoundEffects: [
  {
    kind: 'merge',
    sourceStacks: { value: 3 }, // When reaching 3 stacks
    targetBuff: evolvedBuff, // Transform into this
    targetStacks: { value: 1 }, // At this ratio
  },
];
```

## Visual Representation

Buffs include comprehensive visual systems:

### Combat Visuals

```typescript
combatImage: {
  position: 'floating',        // Positioning style
  image: 'buff-visual.png',
  stacksScale: 0.1,            // Size increase per stack
  entrance: 'grow'             // Entrance animation
}
```

### Crafting Display

```typescript
displayLocation: 'avatar',      // Where to show in crafting UI
baseScaling: 1.0,               // Base size
stacksScaling: 0.05             // Growth per stack
```

## Buff Interactions

### Buff Interception

Buffs can intercept and modify other buffs:

```typescript
interceptBuffEffects: [
  {
    buff: targetBuff,
    effects: [
      { kind: 'multiply', amount: { value: 2 } }, // Double the effect
    ],
    cancelApplication: false, // Still apply the original
  },
];
```

### Triggered Effects

Buffs can respond to game events:

```typescript
triggeredBuffEffects: [
  {
    trigger: 'onDamageDealt',
    effects: [{ kind: 'heal', amount: { value: 0.1, stat: 'damage' } }],
  },
];
```

## Design Philosophy

### Why Buffs as Resources?

1. **Unified System** - One system handles all temporary states
2. **Visual Clarity** - Players see resources as buff icons
3. **Natural Stacking** - Resources accumulate as buff stacks
4. **Conditional Logic** - Built-in support for complex conditions
5. **Effect Timing** - Multiple trigger points for different phases

### Best Practices

1. **Clear Naming** - Resource buffs should have intuitive names
2. **Visual Feedback** - Use animations to show resource changes
3. **Stack Limits** - Set reasonable maxStacks for resources
4. **Tooltip Clarity** - Explain what the resource does
5. **Consistent Patterns** - Follow school-specific resource conventions

## Common Patterns

## Tooltip System

### Auto-Generated Tooltips

Most buff tooltips are **automatically generated** based on the buff's effects and stats. The system analyzes your buff definition and creates appropriate descriptions:

```typescript
// This buff will auto-generate: "+10% Power per stack"
const rage: Buff = {
  name: 'Rage',
  stats: {
    power: { value: 0.1, stat: 'stacks' },
  },
};

// Auto-generates: "After each technique deal n damage" - Where the n is calculated from the current combat stats
const burning: Buff = {
  name: 'Burning',
  onTechniqueEffects: [
    { kind: 'damage', amount: { value: 50, stat: 'power' } },
  ],
};
```

### Custom Tooltips with Templates

For complex mechanics, use custom tooltips with template variables:

```typescript
const complex: Buff = {
  name: 'Storm Convergence',
  tooltip:
    'Every <num>3</num> stacks merge into <num>1</num> {buff} for {damage.amount} damage.',
  onRoundEffects: [
    {
      kind: 'merge',
      sourceStacks: { value: 3 },
      targetBuff: lightning,
      targetStacks: { value: 1 },
    },
    { kind: 'damage', amount: { value: 100 } },
  ],
};
```

### Template Variables

Available variables extract values from buff effects:

#### Effect Variables

- `{damage.amount}` - Damage value
- `{heal.amount}` - Healing value
- `{barrier.amount}` - Barrier value
- `{buffSelf.amount}` - Self buff stacks
- `{buffSelf.buff}` - Self buff name
- `{consumeSelf.amount}` - Consumed stacks
- `{consumeSelf.buff}` - Consumed buff name

#### Indexed Variables

- `{[0].amount}` - First effect's amount
- `{[1].buff}` - Second effect's buff name

#### Block-Specific Variables

- `{technique.*}` - From onTechniqueEffects
- `{round.*}` - From onRoundEffects
- `{roundStart.*}` - From onRoundStartEffects

#### Scaling Information

- `{damage.amount.scaling}` - Shows " (scales with Power)"
- `{heal.amount.scaling}` - Shows " (scales with stat)"

### Formatting Tags

Use HTML-like tags for visual styling:

```typescript
tooltip: `Deal <num>{damage.amount}</num> damage to enemies with <name>Poison</name>.
  <br />
  {or} heal for <num>{heal.amount}</num> if target is allied.`;
```

#### Color Tags

- `<num>value</num>` - Orange numbers
- `<name>text</name>` or `<n>text</n>` - Reference color
- `<shard>text</shard>` - Purple shard color

#### Structure Tags

- `{or}` - Styled "or" separator
- `{else}` - Styled "else" separator
- `<br />` - Line break

### Stats Tooltip

For stat-specific explanations, use `statsTooltip`:

```typescript
const balanced: Buff = {
  name: 'Perfect Balance',
  stats: {
    power: { value: 0.2 },
    defense: { value: 0.2 },
  },
  statsTooltip:
    'Balance bonus: <num>+20%</num> to both offense and defense when calm.',
};
```

### Tooltip Examples

#### Complex Effect Chain

```typescript
const combo: Buff = {
  name: 'Combo',
  icon: 'combo-icon',
  canStack: true,
  maxStacks: 5,
  // Auto-generates: "+10% Power per stack. At the end of the round consume 1 stack."
  stats: {
    power: { value: 0.1, stat: 'stacks' },
  },
  onRoundEffects: [{ kind: 'consumeSelf', amount: { value: 1 } }],
};
```

#### Conditional Tooltip

```typescript
const lastStand: Buff = {
  name: 'Last Stand',
  tooltip:
    'When below <num>25%</num> HP: gain <num>100%</num> Power and <num>50%</num> Life Steal.',
  condition: { kind: 'hp', percentage: 25, mode: 'less' },
  stats: {
    power: { value: 1.0 },
    lifesteal: { value: 0.5 },
  },
};
```

#### Dynamic Template

```typescript
const evolving: Buff = {
  name: 'Evolution',
  tooltip:
    'After {technique.consumeSelf.amount} techniques, transform into {round.buffSelf.buff}.',
  onTechniqueEffects: [{ kind: 'consumeSelf', amount: { value: 1 } }],
  onRoundEffects: [
    {
      kind: 'buffSelf',
      condition: { kind: 'buff', buff: 'self', count: 0, mode: 'equal' },
      buff: evolved,
      amount: { value: 1 },
    },
  ],
};
```

## Next Steps

- **[Scaling](/concepts/concepts-scaling/)** - Understanding value calculations
- **[Combat Buffs](/concepts/concepts-buffs-combat-buffs/)** - Detailed combat buff reference
- **[Crafting Buffs](/concepts/concepts-buffs-crafting-buffs/)** - Crafting buff system
- **[Buff Design Patterns](/concepts/concepts-buffs-design-patterns/)** - Best practices and examples

---

[← Events](/concepts/concepts-events/) | [Combat Buffs →](/concepts/concepts-buffs-combat-buffs/)

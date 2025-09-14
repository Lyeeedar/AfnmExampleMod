---
layout: default
title: Combat Buffs
parent: Buffs and Resources
grand_parent: Core Concepts
nav_order: 1
---

# Combat Buffs

Combat buffs are temporary effects and resources used during battle. They track everything from accumulated resources to status effects, implementing the game's entire combat resource economy.

## Buff Structure

### Core Properties

```typescript
interface Buff {
  // Identity
  name: string; // Unique identifier
  icon: string; // Visual icon path
  colour?: string; // Tint color for the icon

  // Stacking behavior
  canStack: boolean; // Whether multiple stacks allowed
  stacks: number; // Current stack count
  maxStacks?: number; // Maximum stack limit

  // Display
  tooltip?: string; // Detailed tooltip text
  statsTooltip?: string; // Additional stat information

  // Gameplay
  flag?: string; // Flag key for condition checking
  priority?: number; // Execution order (higher = first)
  afterTechnique?: boolean; // Execute after technique resolution
}
```

### Stat Modifications

Buffs can modify combat statistics using [Scaling]({{ site.baseurl }}/concepts/concepts-scaling/):

```typescript
stats?: Partial<{ [key in CombatStatistic]: Scaling }>;

// Example: +10% power per stack
stats: {
  power: { value: 0.1, stat: 'stacks' }  // See Scaling documentation
}

// Available combat statistics:
// power, defense, barrier, control, intensity,
// critchance, lifesteal, speed
```

## Buff Conditions

Control when buffs are active or applied:

### Chance Condition

```typescript
condition: {
  kind: 'chance',
  percentage: 50  // 50% chance to trigger
}
```

### Buff Count Condition

```typescript
condition: {
  kind: 'buff',
  buff: poisonBuff,    // Or 'self' for this buff
  count: 3,
  mode: 'more'         // more, less, or equal
}
```

### HP Threshold Condition

```typescript
condition: {
  kind: 'hp',
  percentage: 30,
  mode: 'less'         // Trigger below 30% HP
}
```

### Custom Condition

```typescript
condition: {
  kind: 'condition',
  condition: 'power > 100 && realm >= 3',
  tooltip: 'Requires 100+ power and Core Formation'
}
```

## Buff Effects

### Effect Timing

Buffs trigger effects at specific combat phases:

```typescript
// When any technique is used
onTechniqueEffects: BuffEffect[];

// At end of each round
onRoundEffects: BuffEffect[];

// At start of each round
onRoundStartEffects?: BuffEffect[];

// Once at combat start
onCombatStartEffects?: BuffEffect[];
```

### Damage Effects

```typescript
// Deal damage to enemy (uses Scaling system)
{
  kind: 'damage',
  amount: { value: 2, stat: 'power' },  // 2x power - see Scaling docs
  hits: { value: 3, stat: undefined },  // Hit 3 times
  damageType: 'corrupt'                // Damage type
}

// Damage self
{
  kind: 'damageSelf',
  amount: { value: 0.1, stat: 'maxHp' },  // 10% max HP
  damageType: 'true'                      // True damage
}
```

### Healing and Barriers

```typescript
// Heal
{
  kind: 'heal',
  amount: { value: 50 },           // Flat healing
  hits: { value: 1, stat: 'stacks' } // Once per stack
}

// Create barrier
{
  kind: 'barrier',
  amount: { value: 100 },
  hits: { value: 1 }
}
```

### Buff Manipulation

```typescript
// Add buff to self
{
  kind: 'buffSelf',
  buff: rageBuff,
  amount: { value: 2 },  // Add 2 stacks
  silent: true           // No notification
}

// Add buff to target
{
  kind: 'buffTarget',
  buff: weaknessBuff,
  amount: { value: 1 }
}

// Consume buff from self
{
  kind: 'consumeSelf',
  buff: flowBuff,        // Can be buff object or string
  amount: { value: 3 }   // Remove 3 stacks
}

// Consume buff from target
{
  kind: 'consumeTarget',
  buff: shieldBuff,
  amount: { value: 1 }
}
```

### Advanced Effects

```typescript
// Negate an effect
{
  kind: 'negate',
  condition: { kind: 'chance', percentage: 50 }
}

// Add to a value
{
  kind: 'add',
  amount: { value: 5 }
}

// Multiply a value
{
  kind: 'multiply',
  amount: { value: 1.5 }  // 150% multiplier
}

// Merge buffs
{
  kind: 'merge',
  sourceStacks: { value: 3 },      // Consume 3 of source
  targetBuff: evolvedBuff,          // Create this buff
  targetStacks: { value: 1 }        // With 1 stack
}

// Trigger custom effect
{
  kind: 'trigger',
  triggerKey: 'onBlock',
  amount: { value: 1 },
  triggerTooltip: 'Triggers block effects'
}

// Cleanse toxicity (for pills)
{
  kind: 'cleanseToxicity',
  amount: { value: 10 }
}

// Modify buff group
{
  kind: 'modifyBuffGroup',
  group: 'poison',
  amount: { value: 2 }  // Double all poison buffs
}
```

## Buff Interactions

### Intercepting Other Buffs

React when specific buffs are applied:

```typescript
interceptBuffEffects: [
  {
    buff: damageBuff,
    effects: [
      { kind: 'multiply', amount: { value: 0.5 } }, // Halve damage
    ],
    cancelApplication: false, // Still apply the damage
  },
];
```

### Triggered Effects

Respond to combat events:

```typescript
triggeredBuffEffects: [
  {
    trigger: 'onCrit',
    effects: [{ kind: 'buffSelf', buff: focusBuff, amount: { value: 1 } }],
  },
];

// Common triggers:
// 'onDamageDealt', 'onDamageTaken', 'onCrit',
// 'onBlock', 'onDodge', 'onKill'
```

## Visual Systems

### Combat Image Positioning

```typescript
combatImage: {
  image: 'buff-visual.png',
  position: 'floating',  // Positioning style

  // Position types:
  // 'scatter' - Random placement
  // 'arc' - Curved arrangement
  // 'floating' - Above character
  // 'overlay' - On character
  // 'companion' - Beside character
  // 'ground' - Below character
  // 'formation' - Strategic placement
}
```

### Visual Scaling

```typescript
combatImage: {
  position: 'floating',
  baseScale: 1.0,         // Starting size
  stacksScale: 0.1,       // Size increase per stack
  entrance: 'grow',       // Entrance animation

  // Stack-based image swapping
  imageOverrides: [
    { stacks: 5, image: 'buff-empowered.png' },
    { stacks: 10, image: 'buff-max.png' }
  ]
}
```

### Animations

```typescript
combatImage: {
  animations: ['buff', 'bump', 'attack'],
  animateOnEntity: true,  // Animate on character model

  // Animation triggers:
  // 'buff' - When gaining stacks
  // 'debuff' - When losing stacks
  // 'bump' - On any change
  // 'attack' - When attacking
}
```

## Buff Types and Groups

### Buff Types

```typescript
buffType?: string;           // Category identifier
buffTypeTooltip?: string;    // Category description
endureStatus?: boolean;      // Persists through rounds

// Used for grouping similar effects
buffType: 'poison'
buffTypeTooltip: 'Toxic damage over time'
```

### Element Types

```typescript
type?: TechniqueElement;     // Primary element
secondaryType?: TechniqueElement | 'origin';
noneType?: string;           // Custom type if no element

// Elements: 'fist', 'weapon', 'blossom',
//           'celestial', 'cloud', 'blood'
```

## Resource Buff Patterns

### Simple Resource

```typescript
const momentum: Buff = {
  name: 'Momentum',
  icon: 'momentum-icon',
  canStack: true,
  maxStacks: 10,
  stacks: 0,
  onTechniqueEffects: [],
  onRoundEffects: [],
};
```

### Decaying Resource

```typescript
const focus: Buff = {
  name: 'Focus',
  icon: 'focus-icon',
  canStack: true,
  maxStacks: 5,
  onRoundEffects: [
    {
      kind: 'consumeSelf',
      amount: { value: 1 }, // Lose 1 per round
    },
  ],
};
```

### Scaling Resource

```typescript
const rage: Buff = {
  name: 'Rage',
  icon: 'rage-icon',
  canStack: true,
  maxStacks: 10,
  stats: {
    power: { value: 0.05, stat: 'stacks' }, // +5% per stack
    defense: { value: -0.03, stat: 'stacks' }, // -3% per stack
  },
};
```

### Transforming Resource

```typescript
const charge: Buff = {
  name: 'Lightning Charge',
  icon: 'charge-icon',
  canStack: true,
  maxStacks: 5,
  onRoundEffects: [
    {
      kind: 'merge',
      condition: { kind: 'buff', buff: 'self', count: 5, mode: 'equal' },
      sourceStacks: { value: 5 },
      targetBuff: lightningStrike,
      targetStacks: { value: 1 },
    },
  ],
};
```

## Status Effect Patterns

### Damage Over Time

```typescript
const burn: Buff = {
  name: 'Burning',
  icon: 'fire-icon',
  canStack: true,
  onRoundEffects: [
    {
      kind: 'damage',
      amount: { value: 10, stat: 'stacks' },
    },
    {
      kind: 'consumeSelf',
      amount: { value: 1 },
    },
  ],
};
```

### Stat Debuff

```typescript
const weakness: Buff = {
  name: 'Weakened',
  icon: 'weak-icon',
  canStack: false,
  stats: {
    power: { value: -0.25 }, // -25% power
    defense: { value: -0.25 }, // -25% defense
  },
  stacks: 1,
};
```

### Conditional Buff

```typescript
const lastStand: Buff = {
  name: 'Last Stand',
  icon: 'laststand-icon',
  condition: {
    kind: 'hp',
    percentage: 25,
    mode: 'less',
  },
  stats: {
    power: { value: 2.0 }, // Double power
    lifesteal: { value: 0.5 }, // 50% lifesteal
  },
};
```

## Best Practices

1. **Clear Resource Identity** - Each buff should have a distinct purpose
2. **Visual Feedback** - Use animations and scaling for clarity
3. **Balanced Stacking** - Set reasonable max stacks
4. **Condition Clarity** - Make trigger conditions obvious
5. **Effect Timing** - Choose appropriate trigger phases
6. **Tooltip Information** - Explain mechanics clearly
7. **Type Consistency** - Follow elemental school patterns

---

[← Buffs Overview]({{ site.baseurl }}/concepts/concepts-buffs/) | [Scaling]({{ site.baseurl }}/concepts/concepts-scaling/) | [Crafting Buffs →]({{ site.baseurl }}/concepts/concepts-buffs-crafting-buffs/) | [Design Patterns →]({{ site.baseurl }}/concepts/concepts-buffs-design-patterns/)

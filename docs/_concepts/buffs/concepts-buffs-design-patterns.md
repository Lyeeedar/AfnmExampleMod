---
layout: default
title: Buff Design Patterns
parent: Buffs and Resources
grand_parent: Core Concepts
nav_order: 3
---

# Buff Design Patterns

This guide covers proven design patterns and best practices for creating engaging buff systems that enhance gameplay while maintaining balance and clarity.

## Core Design Principles

### 1. Buffs Are Resources

Think of buffs as a resource economy rather than just status effects:

- **Generation** - How players create the resource
- **Storage** - Stack limits and decay rates
- **Consumption** - What players spend resources on
- **Value** - The strategic worth of accumulating vs spending

### 2. Visual Clarity

Players must instantly understand buff states:

- **Icon Design** - Unique, recognizable icons
- **Stack Visualization** - Clear stack count display
- **Animation Feedback** - Visual responses to changes
- **Positioning** - Logical placement in UI

### 3. Strategic Depth

Buffs should create interesting decisions:

- **Risk vs Reward** - Trade-offs for powerful effects
- **Timing Windows** - Optimal moments to use resources
- **Synergy Potential** - Combinations with other mechanics
- **Counter-play** - Ways to interact with opponent's buffs

## Combat Resource Patterns

For detailed information on how values are calculated, see the [Scaling]({{ site.baseurl }}/concepts/concepts-scaling/) documentation.

### The Basic Resource Loop

Foundation pattern for school-specific resources:

```typescript
// 1. Resource Generation (Basic attacks generate)
const generateFlow: Technique = {
  name: 'Swift Strike',
  effects: [
    { kind: 'damage', amount: { value: 1, stat: 'power' } },
    { kind: 'buffSelf', buff: flowResource, amount: { value: 1 } }
  ]
};

// 2. Resource Storage (Stacking buff)
const flowResource: Buff = {
  name: 'Flow',
  icon: 'flow-icon',
  canStack: true,
  maxStacks: 10,
  tooltip: 'Momentum for advanced techniques'
};

// 3. Resource Consumption (Powerful techniques cost)
const consumeFlow: Technique = {
  name: 'Devastating Palm',
  costs: [{ buff: flowResource, amount: 3 }],
  effects: [
    { kind: 'damage', amount: { value: 3, stat: 'power' } }
  ]
};
```

### The Combo System

Rewards consecutive actions:

```typescript
const combo: Buff = {
  name: 'Combo Counter',
  icon: 'combo-icon',
  canStack: true,
  maxStacks: 5,

  // Each stack increases damage
  stats: {
    power: { value: 0.1, stat: 'stacks' }  // +10% per combo
  },

  // Decay if not maintained
  onRoundEffects: [
    { kind: 'consumeSelf', amount: { value: 1 } }
  ],

  // Visual scaling with stacks
  combatImage: {
    position: 'floating',
    stacksScale: 0.15,
    animations: ['buff', 'bump']
  }
};
```

### The Transformation Resource

Accumulates then transforms:

```typescript
const charge: Buff = {
  name: 'Storm Charge',
  icon: 'charge-icon',
  canStack: true,
  maxStacks: 5,

  // Transform at max stacks
  onRoundEffects: [{
    kind: 'merge',
    condition: { kind: 'buff', buff: 'self', count: 5, mode: 'equal' },
    sourceStacks: { value: 5 },
    targetBuff: lightningForm,
    targetStacks: { value: 3 }  // 3 rounds of empowered form
  }]
};

const lightningForm: Buff = {
  name: 'Lightning Form',
  icon: 'lightning-form-icon',
  canStack: true,
  stats: {
    power: { value: 0.5 },      // +50% power
    speed: { value: 20 },        // +20 speed
    critchance: { value: 0.25 }  // +25% crit
  },
  onRoundEffects: [
    { kind: 'consumeSelf', amount: { value: 1 } }  // Limited duration
  ]
};
```

### The Risk-Reward Resource

Power with drawbacks:

```typescript
const berserk: Buff = {
  name: 'Berserk Rage',
  icon: 'berserk-icon',
  canStack: true,
  maxStacks: 10,

  // Massive power, but lose defense
  stats: {
    power: { value: 0.15, stat: 'stacks' },     // +15% power per stack
    defense: { value: -0.1, stat: 'stacks' },    // -10% defense per stack
    lifesteal: { value: 0.05, stat: 'stacks' }   // +5% lifesteal to survive
  },

  // Self-damage at high stacks
  onRoundEffects: [{
    kind: 'damageSelf',
    condition: { kind: 'buff', buff: 'self', count: 7, mode: 'more' },
    amount: { value: 0.05, stat: 'maxHp' }
  }]
};
```

### The Threshold Resource

Different effects at stack levels:

```typescript
const essence: Buff = {
  name: 'Celestial Essence',
  icon: 'essence-icon',
  canStack: true,
  maxStacks: 10,

  // Tier 1: Basic enhancement (1-3 stacks)
  stats: {
    power: { value: 0.05, stat: 'stacks' }
  },

  // Tier 2: Defensive bonus (4-6 stacks)
  onRoundStartEffects: [{
    kind: 'barrier',
    condition: { kind: 'buff', buff: 'self', count: 4, mode: 'more' },
    amount: { value: 20, stat: 'stacks' }
  }],

  // Tier 3: Ultimate ability (7+ stacks)
  triggeredBuffEffects: [{
    trigger: 'onTechniqueUse',
    effects: [{
      kind: 'damage',
      condition: { kind: 'buff', buff: 'self', count: 7, mode: 'more' },
      amount: { value: 1, stat: 'power' }  // Echo damage
    }]
  }]
};
```

## Crafting Resource Patterns

### The Stability Manager

Balances risk and control:

```typescript
const steadyHand: CraftingBuff = {
  name: 'Steady Hand',
  icon: 'steady-icon',
  canStack: true,
  maxStacks: 3,
  displayLocation: 'stabilityRight',

  // Increases stability but slows progress
  effects: [
    { kind: 'stability', amount: { value: 5, stat: 'stacks' } },
    { kind: 'completion', amount: { value: -2, stat: 'stacks' } }
  ],

  // Bonus max stability
  onStabilize: [
    { kind: 'maxStability', amount: { value: 10, stat: 'stacks' } }
  ]
};
```

### The Quality Enhancer

Improves outcome at a cost:

```typescript
const refinement: CraftingBuff = {
  name: 'Precise Refinement',
  icon: 'refine-icon',
  canStack: true,
  displayLocation: 'perfectionLeft',

  // High perfection when conditions are right
  effects: [{
    kind: 'perfection',
    condition: { kind: 'stability', percentage: 60, mode: 'more' },
    amount: { value: 3, stat: 'stacks' }
  }],

  // Consumes pool rapidly
  onRefine: [
    { kind: 'pool', amount: { value: -5, stat: 'stacks' } }
  ]
};
```

### The Catalyst System

Triggers under specific conditions:

```typescript
const catalyst: CraftingBuff = {
  name: 'Reactive Catalyst',
  icon: 'catalyst-icon',
  canStack: true,
  maxStacks: 5,
  displayLocation: 'avatar',

  // Activates at high perfection
  effects: [{
    kind: 'completion',
    condition: { kind: 'perfection', percentage: 75, mode: 'more' },
    amount: { value: 5, stat: 'stacks' }
  }],

  // Consumes itself when triggered
  onFusion: [{
    kind: 'addStack',
    condition: { kind: 'perfection', percentage: 75, mode: 'more' },
    stacks: { value: -1 }
  }]
};
```

## Status Effect Patterns

### The Spreading Debuff

Contagious negative effects:

```typescript
const plague: Buff = {
  name: 'Plague',
  icon: 'plague-icon',
  canStack: true,
  buffType: 'disease',

  // Damage over time
  onRoundEffects: [
    { kind: 'damage', amount: { value: 5, stat: 'stacks' } }
  ],

  // Spreads on death
  triggeredBuffEffects: [{
    trigger: 'onDeath',
    effects: [{
      kind: 'buffTarget',  // Affects nearby enemies
      buff: plague,
      amount: { value: 0.5, stat: 'stacks' }  // Half stacks
    }]
  }]
};
```

### The Defensive Shell

Temporary protection:

```typescript
const aegis: Buff = {
  name: 'Divine Aegis',
  icon: 'aegis-icon',
  canStack: false,

  // Blocks next 3 attacks
  maxStacks: 3,
  stacks: 3,

  // Intercept and negate damage
  interceptBuffEffects: [{
    buff: 'damage',
    effects: [
      { kind: 'consumeSelf', amount: { value: 1 } },
      { kind: 'negate' }
    ],
    cancelApplication: true
  }],

  // Visual shows remaining blocks
  combatImage: {
    position: 'overlay',
    imageOverrides: [
      { stacks: 2, image: 'aegis-cracked.png' },
      { stacks: 1, image: 'aegis-broken.png' }
    ]
  }
};
```

## School-Specific Patterns

### Fist School - Flow and Momentum

```typescript
// Core resource: Flow
// Pattern: Build up → Spend for burst
const fistPattern = {
  resource: 'Flow',
  generation: 'Basic attacks',
  consumption: 'Powerful techniques',
  synergy: 'Combo chains, stance dancing'
};
```

### Weapon School - Forge and Metal

```typescript
// Core resource: Momentum
// Pattern: Consistent generation → Sustained pressure
const weaponPattern = {
  resource: 'Momentum',
  generation: 'Any attack',
  consumption: 'Enhanced attacks',
  synergy: 'Equipment scaling, automation'
};
```

### Cloud School - Storm and Lightning

```typescript
// Core resource: Storm Charge
// Pattern: Accumulate → Transform → Unleash
const cloudPattern = {
  resource: 'Storm Charge',
  generation: 'Lightning techniques',
  consumption: 'Transformation states',
  synergy: 'Weather effects, chain reactions'
};
```

### Celestial School - Light and Dark

```typescript
// Dual resources: Solar/Lunar Essence
// Pattern: Balance opposites for maximum effect
const celestialPattern = {
  resources: ['Solar Essence', 'Lunar Essence'],
  generation: 'Alternating techniques',
  consumption: 'Unified techniques',
  synergy: 'Day/night cycles, balance bonuses'
};
```

### Blossom School - Growth and Nature

```typescript
// Core resource: Vitality
// Pattern: Cultivate → Bloom → Harvest
const blossomPattern = {
  resource: 'Vitality',
  generation: 'Healing and support',
  consumption: 'Area effects',
  synergy: 'Damage over time, regeneration'
};
```

### Blood School - Sacrifice and Power

```typescript
// Core resource: Blood Essence
// Pattern: Sacrifice health → Gain power
const bloodPattern = {
  resource: 'Blood Essence',
  generation: 'Self-damage, enemy kills',
  consumption: 'Devastating attacks',
  synergy: 'Life steal, corruption/purification'
};
```

## Balancing Guidelines

### Stack Limits

- **Basic Resources**: 5-10 stacks (frequent use)
- **Power Resources**: 3-5 stacks (strategic use)
- **Ultimate Resources**: 1-3 stacks (rare, powerful)

### Generation Rates

- **Fast**: 1-2 per action (spam-friendly)
- **Moderate**: 1 per 2-3 actions (tactical)
- **Slow**: 1 per 4+ actions (precious)

### Consumption Costs

- **Low**: 1-2 stacks (basic techniques)
- **Medium**: 3-4 stacks (core techniques)
- **High**: 5+ stacks (ultimate techniques)

### Decay Rates

- **None**: Permanent until used
- **Slow**: -1 per 3 rounds (maintains pressure)
- **Medium**: -1 per round (use it or lose it)
- **Fast**: -2+ per round (immediate use required)

## Visual Design Guidelines

### Icon Principles

1. **Distinct Silhouettes** - Recognizable at small sizes
2. **Color Coding** - Consistent color = consistent function
3. **Stack Indicators** - Visual count representation
4. **Animation States** - Different states for gain/loss

### Position Strategy

**Combat**:
- Resources: `floating` or `arc`
- Debuffs: `overlay`
- Summons: `companion`
- Area effects: `ground`

**Crafting**:
- General: `avatar`
- Quality: `perfectionLeft/Right`
- Stability: `stabilityLeft/Right`
- Progress: `completionLeft/Right`

### Animation Feedback

- **Gain**: `buff`, scale up
- **Loss**: `debuff`, scale down
- **Activate**: `attack`, glow effect
- **Transform**: Morph animation
- **Expire**: Fade out

## Testing Checklist

When designing buffs, verify:

1. ✓ Clear purpose and identity
2. ✓ Appropriate stack limits
3. ✓ Balanced generation/consumption
4. ✓ Visual clarity and feedback
5. ✓ Interesting strategic decisions
6. ✓ Synergy with existing systems
7. ✓ No infinite loops or exploits
8. ✓ Scales appropriately with realm
9. ✓ Tooltip explains mechanics
10. ✓ Fun to use and play against

## Common Pitfalls

### Avoid These Mistakes

1. **Overcomplexity** - Too many conditions confuse players
2. **Hidden Mechanics** - All effects should be visible
3. **Runaway Scaling** - Exponential growth breaks balance
4. **Mandatory Resources** - Don't force single strategies
5. **Unclear Visuals** - Players must understand at a glance
6. **Infinite Loops** - Always include exit conditions
7. **One-Dimensional** - Resources should enable multiple strategies

## Summary

Great buff design creates engaging resource management, strategic depth, and satisfying gameplay loops. Focus on clarity, balance, and fun interactions. Test thoroughly and iterate based on how buffs feel in actual play.

Remember: **Buffs are not just effects - they're the heartbeat of combat and crafting gameplay.**

---

[← Crafting Buffs]({{ site.baseurl }}/concepts/concepts-buffs-crafting-buffs/) | [Buffs Overview]({{ site.baseurl }}/concepts/concepts-buffs/)
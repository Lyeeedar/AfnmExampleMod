---
layout: default
title: Scaling
parent: Core Concepts
---

# Scaling

Scaling is the mathematical foundation that determines all value calculations in Ascend from Nine Mountains. Every damage, healing, buff effect, and stat modifier uses the Scaling system to create dynamic, progression-based gameplay.

## The Scaling Interface

```typescript
interface Scaling {
  value: number; // Base multiplier
  stat?: string; // Stat to multiply by
  scaling?: string; // Special scaling mode
  eqn?: string; // Custom equation
  max?: Scaling; // Cap the final value
  divideByStanceLength?: boolean; // For stance techniques
  upgradeKey?: string; // Links to mastery upgrades
  buff?: Buff; // Reference another buff
}
```

## Core Pattern: Base × Stat × Scaling × Equation

The evaluation order is: `value * stat * scaling * eqn`

## Pattern 1: Flat Values (No Stat Scaling)

**When to use**: Fixed effects, buff stacks, equation-only calculations, utility effects, resource generation/consumption

```typescript
// Fixed damage amount (rare, usually for utility)
{
  value: 100,
  stat: undefined  // No stat multiplication
}

// Fixed stacks granted (very common)
{
  value: 3,
  stat: undefined  // Always 3 stacks
}

// Equation-only calculation
{
  value: 1,
  stat: undefined,
  eqn: 'toxicity * 2'  // Only uses equation result
}

// Scaling-only (no base stat multiplication)
{
  value: 1,
  stat: undefined,
  scaling: 'stacks'  // 1 per stack, no stat involved
}

```

**Real examples**:

Concentrate Force uses flat buff name scaling:

```typescript
amount: {
  value: 1,
  stat: undefined,
  scaling: rippleForce.name,  // 1 per Ripple Force stack
  max: {
    value: 7,
    stat: undefined,
    upgradeKey: 'maxStacks'  // Max increases with mastery
  }
}
```

Transcend Focus uses flat equation value:

```typescript
amount: {
  value: 1,
  stat: undefined,
  eqn: `${flag(deadlyFocus.name)} / 5`  // 1 per 5 Deadly Focus, no stat scaling
}
```

Unveil the Skies uses flat floor calculation:

```typescript
amount: {
  value: 1,
  stat: undefined,
  eqn: `floor(${flag(clouds.name)} / 20)`  // 1 per 20 cloud stacks
}
```

**When to use `stat: undefined`**:

- **Utility effects** - Cleanse, dispel, status removal
- **Resource generation** - Fixed stack amounts
- **Equation-only scaling** - When equation provides all the scaling
- **Pure scaling effects** - When scaling/buff name provides the multiplier
- **Caps and limits** - Max values that don't scale with stats
- **Upgrade-driven values** - When upgradeKey provides progression
- **Conditional flat bonuses** - Fixed amounts under certain conditions

## Pattern 2: Basic Stat Scaling

**When to use**: Most technique effects, simple buff bonuses

```typescript
// Basic damage: 150% of power
{
  value: 1.5,
  stat: 'power'
}

// Defense-based barrier: 300% of defense
{
  value: 3,
  stat: 'defense'
}

// Crafting: 80% of control for perfection
{
  value: 0.8,
  stat: 'control'
}
```

**Real example**: Sun Blast technique deals `2 × power` damage:

```typescript
amount: {
  value: 2,
  stat: 'power',
  upgradeKey: 'power'  // Improves with mastery
}
```

## Pattern 3: Stack-Based Scaling

**When to use**: Buff effects that scale with stacks, resource consumption

```typescript
// Damage per stack
{
  value: 0.3,
  stat: 'power',
  scaling: 'stacks'  // 30% power per stack
}

// Fixed amount per stack
{
  value: 10,
  scaling: 'stacks'  // 10 damage per stack
}
```

**Real example**: Blossom technique damage scales with Vitality stacks:

```typescript
onTechniqueEffects: [
  {
    kind: 'damage',
    amount: {
      value: 0.3,
      stat: 'power',
      scaling: 'stacks', // 30% power per Vitality stack
    },
  },
];
```

## Pattern 4: Stat-Based Scaling

**When to use**: Effects that scale with game state (toxicity, stability, pool)

```typescript
// Scale with current toxicity
{
  value: 0.1,
  stat: 'power',
  scaling: 'toxicity'  // Power × toxicity level
}

// Scale with stability percentage
{
  value: -100,
  scaling: 'stability'  // Costs current stability
}
```

**Real example**: Lianjin Bandolier power scales with toxicity:

```typescript
stats: {
  power: {
    value: 0.005,
    stat: 'power',
    scaling: 'toxicity',  // 0.5% power per toxicity point
    max: { value: 1, stat: 'power' }  // Capped at 100% power
  }
}
```

## Pattern 5: Buff Name Scaling

**When to use**: Effects that scale with specific buff stacks

```typescript
// Scale with named buff stacks
{
  value: 1,
  scaling: buffName  // Uses that buff's stack count
}
```

**Real example**: Concentrate Force scales with Ripple Force stacks:

```typescript
amount: {
  value: 1,
  scaling: rippleForce.name,  // 1 per Ripple Force stack
  max: {
    value: 7,
    upgradeKey: 'maxStacks'  // Max stacks increase with mastery
  }
}
```

## Pattern 6: Target Buff Scaling

**When to use**: Effects based on enemy/ally buffs

```typescript
// Scale with target's buff stacks
{
  value: 2,
  stat: 'power',
  scaling: 'target.' + debuffName  // Power × target's debuff stacks
}
```

**Real example**: Celestial Discordance scales with target's discord:

```typescript
amount: {
  value: 1,
  scaling: 'target.' + harmonicDiscord.name  // Damage per target's discord
}
```

## Pattern 7: Equation-Based Scaling

**When to use**: Complex calculations, percentages, conditional logic

```typescript
// Toxicity percentage
{
  value: 3,
  stat: 'power',
  eqn: 'toxicity/maxtoxicity'  // Power × toxicity percentage
}

// Buff counting with division
{
  value: 1,
  eqn: `floor(${flag(buffName)} / 20)`  // 1 per 20 buff stacks
}

// Multi-buff addition
{
  value: 4,
  eqn: `${flag(buff1.name)} + ${flag(buff2.name)}`  // Sum of two buffs
}
```

**Real example**: Transcend Focus uses flag division:

```typescript
amount: {
  value: 1,
  eqn: `${flag(deadlyFocus.name)} / 5`  // 1 per 5 Deadly Focus
}
```

## Pattern 8: Capped Scaling

**When to use**: Preventing runaway scaling, balance caps

```typescript
// Stat scaling with percentage cap
{
  value: 0.05,
  stat: 'power',
  scaling: 'stacks',
  max: { value: 2, stat: 'power' }  // Max 200% power bonus
}

// Fixed cap
{
  value: 10,
  scaling: 'stacks',
  max: { value: 100 }  // Max 100 regardless of stacks
}
```

**Real example**: Ripple Force power bonus caps at 200%:

```typescript
stats: {
  power: {
    value: 0.05,          // 5% per stack
    stat: 'power',
    scaling: 'stacks',
    max: {
      value: 2,           // Cap at 200% power
      stat: 'power'
    }
  }
}
```

## Pattern 9: Upgrade Key Integration

**When to use**: Techniques that improve with mastery

```typescript
// Basic upgrade scaling
{
  value: 0.65,
  stat: 'intensity',
  upgradeKey: 'completion'  // Improves with mastery level
}

// Upgrade affects max value
{
  value: 3,
  scaling: 'stacks',
  max: {
    value: 5,
    upgradeKey: 'maxStacks'  // Max stacks increase with mastery
  }
}
```

## Common Stat Values

### Combat Stats

- `power` - Primary damage stat
- `defense` - Damage reduction
- `maxhp`, `barrier` - Health and shields
- `critchance`, `lifesteal` - Combat mechanics
- Element boosts: `fistBoost`, `weaponBoost`, `blossomBoost`, `celestialBoost`, `cloudBoost`, `bloodBoost`

### Crafting Stats

- `control` - Perfection effectiveness
- `intensity` - Completion effectiveness
- `maxpool`, `pool` - Qi management
- `critchance` - Crafting critical chance
- `stabilityCostPercentage`, `poolCostPercentage` - Cost modifiers

### Physical Stats

- `flesh`, `muscles`, `dantian`, `meridians`, `eyes`, `digestion` - Core physical attributes

## Special Scaling Values

### Built-in Values

- `'stacks'` - Current buff stacks (most common)
- `'consumed'` - Recently consumed stacks
- `'toxicity'` - Current toxicity level
- `'stability'` - Current stability value
- `'pool'` - Current qi pool

### Dynamic Values

- `buffName` - Any buff's stack count
- `'target.buffName'` - Target's buff stacks
- Flag expressions via `flag()` helper function

## Real-World Examples

### Fist School: Stack Accumulation

```typescript
// Generate Flow stacks
{
  kind: 'buffSelf',
  buff: flow,
  amount: { value: 1 }  // Always 1 stack
}

// Spend Flow for damage
{
  kind: 'damage',
  amount: {
    value: 0.8,           // 80% power per Flow stack
    stat: 'power',
    scaling: flow.name
  }
}
```

### Weapon School: Progressive Scaling

```typescript
// Momentum builds over time
stats: {
  power: {
    value: 0.02,          // 2% power per stack
    stat: 'power',
    scaling: 'stacks',
    max: {
      value: 0.5,         // Cap at 50% power
      stat: 'power'
    }
  }
}
```

### Celestial School: Dual Buff Synergy

```typescript
// Power from both light/dark attunement
stats: {
  celestialBoost: {
    value: 4,
    eqn: `${flag(lunarAttunement.name)} + ${flag(solarAttunement.name)}`
  }
}
```

### Blood School: Risk/Reward Scaling

```typescript
// More power at higher toxicity
{
  value: 0.1,
  stat: 'power',
  scaling: 'toxicity',   // Risk increases reward
  max: {
    value: 3,           // Cap at 300% power
    stat: 'power'
  }
}
```

### Crafting: State-Based Effects

```typescript
// Bonus when stability is low (risky crafting)
{
  kind: 'perfection',
  amount: {
    value: 20,
    eqn: 'stability < 30 ? 20 : 0'  // Bonus when desperate
  }
}
```

## Design Guidelines

### Scaling Multipliers

- **Basic effects**: 0.5-1.2x stat
- **Strong effects**: 1.5-2.5x stat
- **Ultimate effects**: 3.0-4.0x stat
- **Per-stack scaling**: 0.05-0.1x stat per stack

### When to Use Each Pattern

1. **Flat values (`stat: undefined`)**:

   - Utility effects that shouldn't scale with power
   - Resource generation/consumption
   - Equation-only calculations
   - Pure scaling/buff-dependent effects
   - Fixed caps and upgrade-driven values

2. **Basic stat scaling**: Standard damage/healing that grows with stats
3. **Stack scaling**: Resource systems, combo effects
4. **Stat scaling**: State-dependent effects (toxicity, stability)
5. **Buff name scaling**: Cross-buff interactions
6. **Equation scaling**: Complex conditions, percentages
7. **Capped scaling**: Balanced power progression

### Stat vs Flat Decision Tree

**Use `stat: undefined` when**:

- Effect is purely utility (cleanse, dispel)
- Amount comes entirely from equation or scaling
- Fixed resource amounts regardless of power
- Upgrade keys provide the progression
- Effect shouldn't benefit from stat growth

**Use stat scaling when**:

- Effect should grow with character power
- Standard damage/healing/barrier effects
- Buff bonuses that scale with stats
- Effects that become more powerful as player progresses

### Balance Considerations

- Always use `max` for percentage-based scaling
- Consider upgrade keys for player progression
- Test equations thoroughly for edge cases
- Use meaningful stat relationships (power for damage, control for perfection)

## Common Mistakes

1. **No caps on percentage scaling** - Leads to exponential growth
2. **Wrong stat relationships** - Defense scaling damage makes no sense
3. **Complex equations without testing** - Can break in unexpected ways
4. **Missing upgrade keys** - No progression feels bad
5. **Inconsistent scaling patterns** - Confuses players

The key to good scaling design is understanding that players will optimize around your scaling patterns, so make them intuitive and balanced.

---

[← Core Concepts](/concepts/index/) | [Buffs →](/concepts/concepts-buffs/) | [Events →](/concepts/concepts-events/)

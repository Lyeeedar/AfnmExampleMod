---
layout: default
title: Scaling
---

# Scaling

Scaling is the fundamental system that determines how values in Ascend from Nine Mountains are calculated. It appears everywhere - damage calculations, buff effects, healing amounts, crafting outcomes, and more. Understanding scaling is essential for creating balanced and interesting content.

## What is Scaling?

Scaling defines a numeric value that can be:
- **Static** - A fixed number
- **Dynamic** - Based on statistics, buff stacks, or other variables
- **Complex** - Using custom equations and caps
- **Conditional** - Different values based on game state

## The Scaling Interface

```typescript
interface Scaling {
  value: number;                    // Base multiplier or fixed value
  stat?: string;                    // Optional stat to scale with
  scaling?: 'stacks' | 'consumed' | string; // Special scaling modes
  eqn?: string;                     // Custom equation for complex scaling
  max?: Scaling;                    // Maximum value cap
  divideByStanceLength?: boolean;   // For stance-based techniques
  upgradeKey?: string;              // For upgrade-based scaling
  buff?: Buff;                      // Reference buff for scaling
}
```

## Basic Scaling Patterns

### Fixed Value

The simplest form - a static number:

```typescript
// Always deals exactly 50 damage
{ value: 50 }

// Always heals for 100
{ value: 100 }

// Always adds 3 stacks
{ value: 3 }
```

### Single Stat Scaling

Scales with one statistic:

```typescript
// 1.5x power as damage
{ value: 1.5, stat: 'power' }

// 2x defense as barrier
{ value: 2, stat: 'defense' }

// 0.3x maxhp as healing
{ value: 0.3, stat: 'maxhp' }
```

### Stack-Based Scaling

Use the `scaling` property for buff stacks:

```typescript
// Scale with current buff stacks
{ value: 10, scaling: 'stacks' }

// Scale with consumed stacks
{ value: 5, scaling: 'consumed' }

// In a buff definition
const rage: Buff = {
  name: 'Rage',
  canStack: true,
  stats: {
    // +10% power per stack
    power: { value: 0.1, scaling: 'stacks' }
  },
  onRoundEffects: [
    // Deal 5 damage per stack
    { kind: 'damage', amount: { value: 5, scaling: 'stacks' } }
  ]
};
```

### Custom Equations

For complex calculations:

```typescript
// Custom equation scaling
{
  value: 1,
  eqn: 'power * 0.5 + defense * 0.3'
}

// Conditional equation
{
  value: 1,
  eqn: 'hp < maxhp * 0.5 ? power * 2 : power'
}
```

### Capped Scaling

Limit maximum values:

```typescript
// Damage capped at 1000
{
  value: 2,
  stat: 'power',
  max: { value: 1000 }
}

// Stacks capped at player level
{
  value: 1,
  scaling: 'stacks',
  max: { value: 1, stat: 'level' }
}
```

## Combat Scaling Examples

### Damage Calculations

```typescript
// Basic attack - scales with power
const basicStrike: Technique = {
  name: 'Basic Strike',
  effects: [
    { kind: 'damage', amount: { value: 1, stat: 'power' } }
  ]
};

// Heavy attack - higher multiplier
const heavyStrike: Technique = {
  name: 'Heavy Strike',
  effects: [
    { kind: 'damage', amount: { value: 2.5, stat: 'power' } }
  ]
};

// Multi-hit with fixed hits
const flurry: Technique = {
  name: 'Flurry',
  effects: [
    {
      kind: 'damage',
      amount: { value: 0.5, stat: 'power' },
      hits: { value: 3 }  // Hit 3 times
    }
  ]
};

// Percentage-based damage
const percentDamage: Technique = {
  name: 'Vital Strike',
  effects: [
    { kind: 'damage', amount: { value: 0.15, stat: 'enemyMaxHp' } }
  ]
};
```

### Healing Patterns

```typescript
// Flat healing
{ kind: 'heal', amount: { value: 50 } }

// Scale with power (typical for most healing)
{ kind: 'heal', amount: { value: 1.2, stat: 'power' } }

// Percentage of max HP
{ kind: 'heal', amount: { value: 0.25, stat: 'maxhp' } }

// Scale with missing health
{ kind: 'heal', amount: { value: 1, eqn: 'maxhp - hp' } }
```

### Barrier Generation

```typescript
// Fixed barrier
{ kind: 'barrier', amount: { value: 100 } }

// Power-based barrier
{ kind: 'barrier', amount: { value: 2, stat: 'power' } }

// Scaling with buff stacks
{
  kind: 'barrier',
  amount: { value: 20, scaling: 'stacks' }  // 20 barrier per stack
}
```

## Buff Effect Scaling

### Resource Generation

```typescript
// Generate fixed stacks
{
  kind: 'buffSelf',
  buff: flowBuff,
  amount: { value: 1 }  // Always 1 stack
}

// Generate based on damage dealt
{
  kind: 'buffSelf',
  buff: rageBuff,
  amount: { value: 0.1, stat: 'damageDealt' }  // 1 stack per 10 damage
}

// Generate based on existing stacks
{
  kind: 'buffSelf',
  buff: momentumBuff,
  amount: { value: 0.5, scaling: 'stacks' }  // Half of current stacks
}
```

### Resource Consumption

```typescript
// Consume fixed amount
{
  kind: 'consumeSelf',
  amount: { value: 3 }  // Always consume 3
}

// Consume all stacks
{
  kind: 'consumeSelf',
  amount: { value: 1, scaling: 'stacks' }  // Consume all
}

// Consume percentage of stacks
{
  kind: 'consumeSelf',
  amount: { value: 0.5, scaling: 'stacks' }  // Consume half
}
```

## Crafting Scaling Examples

### Completion and Perfection

```typescript
// Fixed completion bonus
{ kind: 'completion', amount: { value: 10 } }

// Scale with crafting skill
{ kind: 'completion', amount: { value: 0.2, stat: 'craftskill' } }

// Scale with buff stacks
{ kind: 'perfection', amount: { value: 3, scaling: 'stacks' } }

// Complex scaling with control and intensity
{
  kind: 'perfection',
  amount: { value: 1, eqn: 'control * 0.5 + intensity * 0.3' }
}
```

### Pool Management

```typescript
// Restore fixed pool
{ kind: 'pool', amount: { value: 15 } }

// Restore based on max pool
{ kind: 'pool', amount: { value: 0.3, stat: 'maxpool' } }

// Drain based on toxicity
{ kind: 'pool', amount: { value: -0.5, stat: 'toxicity' } }
```

## Advanced Scaling Features

### Custom Equations

The `eqn` field allows complex mathematical expressions:

```typescript
// Health-based scaling
{ value: 1, eqn: '(maxhp - hp) / maxhp * 100' }

// Multi-stat calculations
{ value: 1, eqn: 'power * 0.6 + defense * 0.4' }

// Conditional scaling
{ value: 1, eqn: 'stacks > 5 ? power * 2 : power' }

// Realm-based scaling
{ value: 1, eqn: 'power * (1 + realm * 0.1)' }
```

### Upgrade Scaling

For techniques that improve with mastery:

```typescript
{
  value: 100,
  stat: 'power',
  upgradeKey: 'basicStrike',  // References technique upgrade level
  eqn: 'power * (1 + upgradeLevel * 0.1)'
}
```

### Stance-Based Scaling

For techniques affected by stance length:

```typescript
{
  value: 200,
  stat: 'power',
  divideByStanceLength: true  // Damage spread across stance duration
}
```

### Buff Reference Scaling

Scale based on other buffs:

```typescript
{
  value: 10,
  buff: otherBuff,  // References another buff
  scaling: 'stacks'  // Uses that buff's stacks
}
```

## Available Statistics

### Combat Statistics
- `maxhp`, `hp` - Health values
- `maxbarrier`, `barrier` - Shield values
- `power` - Primary damage stat
- `defense` - Damage reduction
- `critchance`, `critdam` - Critical hit stats
- `lifesteal` - Health recovery on damage
- Element boosts: `fistBoost`, `weaponBoost`, `blossomBoost`, `celestialBoost`, `cloudBoost`, `bloodBoost`
- Affinities: `fistAffinity`, `weaponAffinity`, etc.
- Resistances: `fistResistance`, `weaponResistance`, etc.

### Crafting Statistics
- `maxpool`, `pool` - Qi pool values
- `control` - Perfection effectiveness
- `intensity` - Completion effectiveness
- `critchance`, `critmultiplier` - Crafting crits
- `maxtoxicity`, `toxicity`, `resistance` - Toxicity handling
- `itemEffectiveness` - Pill/reagent effectiveness

### Physical Statistics
- `flesh` - Health and barrier effectiveness
- `muscles` - Power and intensity
- `dantian` - Qi pool and barrier capacity
- `meridians` - Control and artefact power
- `eyes` - Critical chance and damage
- `digestion` - Toxicity resistance and item effectiveness

### Social Statistics
- `craftskill` - Crafting bonuses
- `battlesense` - Combat experience
- `charisma` - Social interactions
- `age`, `lifespan` - Character aging

## Special Scaling Keywords

### Dynamic Values
- `damageDealt` - Last damage dealt
- `damageTaken` - Last damage received
- `enemyMaxHp`, `enemyHp` - Target health
- `stacks` - Current buff stacks (via scaling property)
- `consumed` - Recently consumed stacks (via scaling property)

### Realm and Progress
- `realm` - Cultivation realm (0=mundane, 1=bodyForging, etc.)
- `realmProgress` - Progress within realm (0=early, 1=middle, 2=late)

## Balancing Guidelines

### Damage Scaling
- **Basic attacks**: 0.8-1.2x power
- **Strong attacks**: 1.5-2.5x power
- **Ultimate attacks**: 3.0-4.0x power
- **Multi-hit**: 0.3-0.6x power per hit

### Healing Scaling
- **Minor healing**: 0.5-1.0x power
- **Major healing**: 1.2-2.0x power
- **Percentage healing**: 10-25% max HP

### Barrier Scaling
- **Light barriers**: 1.0-2.0x power
- **Heavy barriers**: 2.5-4.0x power
- **Temporary barriers**: 0.5-1.5x power per stack

### Resource Generation
- **Basic techniques**: 1-2 stacks
- **Advanced techniques**: 3-5 stacks
- **Percentage-based**: 10-50% of stat value

## Common Patterns

### Progressive Scaling
```typescript
// Increases with realm
{ value: 50, stat: 'realm', eqn: '50 + realm * 25' }
```

### Threshold Scaling
```typescript
// Bonus damage at low health
{ value: 1, stat: 'power', eqn: 'hp < maxhp * 0.3 ? power * 1.5 : power' }
```

### Efficiency Scaling
```typescript
// More efficient at higher stacks
{ value: 10, scaling: 'stacks', eqn: 'stacks * (1 + stacks * 0.1)' }
```

### Diminishing Returns
```typescript
// Logarithmic scaling
{ value: 1, stat: 'power', eqn: 'power * log(1 + stacks)' }
```

## Best Practices

1. **Start Simple** - Use basic stat scaling before complex equations
2. **Test Thoroughly** - Equations can have unexpected interactions
3. **Use Caps** - Prevent runaway scaling with max values
4. **Clear Purpose** - Each scaling should have a clear gameplay reason
5. **Consistent Patterns** - Similar effects should scale similarly
6. **Document Equations** - Complex formulas need explanatory tooltips

## Common Pitfalls

1. **Division by Zero** - Always check for zero denominators
2. **Integer Overflow** - Very large calculations can break
3. **Circular References** - Don't reference stats that reference back
4. **Missing Stats** - Ensure referenced stats actually exist
5. **Performance** - Complex equations calculated frequently can lag

Scaling is the mathematical foundation that makes cultivation progression meaningful and strategic choices impactful.

---

[← Core Concepts](/concepts/) | [Buffs →](/concepts/buffs/) | [Events →](/concepts/events/)
---
layout: default
title: Crafting Buffs
---

# Crafting Buffs

Crafting buffs manage the state and resources during pill refinement and item crafting. They track everything from accumulated energies to crafting conditions, implementing a sophisticated crafting resource system.

## Crafting Buff Structure

### Core Properties

```typescript
interface CraftingBuff {
  // Identity
  name: string;
  icon: string;

  // Stacking
  canStack: boolean;
  stacks: number;
  maxStacks?: number;

  // Display
  tooltip?: string;
  statsTooltip?: string;

  // Visual positioning in crafting UI
  displayLocation: CraftingBuffDisplayLocation;

  // Visual scaling
  baseScaling?: number;
  stacksScaling?: number;

  // Animation triggers
  animations?: CraftingAnimation[];
}
```

### Display Locations

Where buffs appear in the crafting interface:

```typescript
type CraftingBuffDisplayLocation =
  | 'none'              // Hidden
  | 'avatar'            // On player avatar
  | 'stabilityLeft'     // Left of stability bar
  | 'stabilityRight'    // Right of stability bar
  | 'perfectionLeft'    // Left of perfection bar
  | 'perfectionRight'   // Right of perfection bar
  | 'completionLeft'    // Left of completion bar
  | 'completionRight';  // Right of completion bar
```

### Stat Modifications

Modify crafting statistics using [Scaling](/concepts/scaling/):

```typescript
stats?: Partial<{ [key in CraftingStatistic]: Scaling }>;

// Available crafting statistics:
// maxpool - Maximum qi pool
// pool - Current qi pool
// maxtoxicity - Maximum toxicity tolerance
// toxicity - Current toxicity level
// resistance - Toxicity resistance
```

## Crafting Conditions

Control when buffs apply or trigger:

### Buff Count Condition

```typescript
condition: {
  kind: 'buff',
  buff: heatBuff,      // Or 'self' for this buff
  count: 3,
  mode: 'more'         // more, less, or equal
}
```

### Crafting State Conditions

```typescript
// Perfection threshold
condition: {
  kind: 'perfection',
  percentage: 80,
  mode: 'more'         // Trigger above 80% perfection
}

// Stability threshold
condition: {
  kind: 'stability',
  percentage: 50,
  mode: 'less'         // Trigger below 50% stability
}

// Completion threshold
condition: {
  kind: 'completion',
  percentage: 90,
  mode: 'more'         // Trigger above 90% completion
}

// Pool threshold
condition: {
  kind: 'pool',
  percentage: 25,
  mode: 'less'         // Trigger below 25% pool
}

// Toxicity threshold
condition: {
  kind: 'toxicity',
  percentage: 75,
  mode: 'more'         // Trigger above 75% toxicity
}
```

### Other Conditions

```typescript
// Chance-based
condition: {
  kind: 'chance',
  percentage: 30       // 30% chance
}

// Custom condition
condition: {
  kind: 'condition',
  condition: 'craftskill >= 50'
}
```

## Crafting Effects

### Effect Timing

Buffs trigger at different crafting phases:

```typescript
// General effects (always active)
effects: CraftingBuffEffect[];

// Technique-specific triggers
onFusion?: CraftingBuffEffect[];    // During fusion techniques
onRefine?: CraftingBuffEffect[];    // During refinement techniques
onStabilize?: CraftingBuffEffect[]; // During stabilization techniques
onSupport?: CraftingBuffEffect[];   // During support techniques
```

### Crafting State Effects

```typescript
// Modify completion
{
  kind: 'completion',
  amount: { value: 10 }  // +10 completion
}

// Modify perfection
{
  kind: 'perfection',
  amount: { value: 5, stat: 'stacks' }  // +5 per stack
}

// Modify stability
{
  kind: 'stability',
  amount: { value: -10 }  // -10 stability
}

// Modify max stability
{
  kind: 'maxStability',
  amount: { value: 20 }  // +20 max stability
}

// Modify qi pool
{
  kind: 'pool',
  amount: { value: 15 }  // +15 qi pool
}
```

### Buff Manipulation

```typescript
// Create another buff
{
  kind: 'createBuff',
  buff: catalystBuff,
  stacks: { value: 2 }  // Create with 2 stacks
}

// Add stacks to this buff
{
  kind: 'addStack',
  stacks: { value: 1, stat: 'craftskill' }  // Add craftskill stacks
}
```

### Special Effects

```typescript
// Negate an effect
{
  kind: 'negate',
  condition: { kind: 'chance', percentage: 50 }
}

// Change toxicity
{
  kind: 'changeToxicity',
  amount: { value: -5 }  // Reduce toxicity by 5
}
```

## Animation System

Visual feedback for crafting actions:

```typescript
animations?: [
  'bump',           // Generic change
  'buff',           // Positive effect
  'completion',     // Completion increase
  'perfection',     // Perfection increase
  'stabilityup',    // Stability increase
  'stabilitydown',  // Stability decrease
  'pool'            // Pool change
]
```

## Crafting Resource Patterns

### Basic Crafting Resource

```typescript
const heat: CraftingBuff = {
  name: 'Heat',
  icon: 'heat-icon',
  canStack: true,
  maxStacks: 10,
  displayLocation: 'avatar',
  effects: [],
  stacks: 0
};
```

### Perfection Booster

```typescript
const precision: CraftingBuff = {
  name: 'Precision Focus',
  icon: 'precision-icon',
  canStack: true,
  maxStacks: 5,
  displayLocation: 'perfectionRight',
  effects: [
    {
      kind: 'perfection',
      amount: { value: 2, stat: 'stacks' }  // +2 perfection per stack
    }
  ],
  animations: ['perfection', 'buff']
};
```

### Stability Manager

```typescript
const balance: CraftingBuff = {
  name: 'Harmonious Balance',
  icon: 'balance-icon',
  canStack: false,
  displayLocation: 'stabilityLeft',
  onStabilize: [
    {
      kind: 'stability',
      amount: { value: 15 }  // +15 stability when stabilizing
    },
    {
      kind: 'maxStability',
      amount: { value: 10 }  // +10 max stability
    }
  ],
  animations: ['stabilityup']
};
```

### Pool Enhancer

```typescript
const overflow: CraftingBuff = {
  name: 'Qi Overflow',
  icon: 'overflow-icon',
  canStack: true,
  maxStacks: 3,
  displayLocation: 'avatar',
  stats: {
    maxpool: { value: 10, stat: 'stacks' }  // +10 max pool per stack
  },
  effects: [
    {
      kind: 'pool',
      amount: { value: 5, stat: 'stacks' }  // Restore 5 pool per stack
    }
  ],
  animations: ['pool', 'buff']
};
```

### Conditional Catalyst

```typescript
const catalyst: CraftingBuff = {
  name: 'Volatile Catalyst',
  icon: 'catalyst-icon',
  canStack: true,
  displayLocation: 'avatar',
  effects: [
    {
      kind: 'completion',
      condition: {
        kind: 'perfection',
        percentage: 70,
        mode: 'more'
      },
      amount: { value: 3, stat: 'stacks' }  // +3 completion per stack if >70% perfection
    }
  ]
};
```

### Toxicity Cleanser

```typescript
const purify: CraftingBuff = {
  name: 'Purifying Essence',
  icon: 'purify-icon',
  canStack: true,
  displayLocation: 'avatar',
  onRefine: [
    {
      kind: 'changeToxicity',
      amount: { value: -2, stat: 'stacks' }  // -2 toxicity per stack
    }
  ],
  stats: {
    resistance: { value: 5, stat: 'stacks' }  // +5 resistance per stack
  }
};
```

## Technique Integration

### Fusion Specialist

```typescript
const fusionMaster: CraftingBuff = {
  name: 'Fusion Mastery',
  icon: 'fusion-icon',
  canStack: true,
  maxStacks: 5,
  displayLocation: 'avatar',
  onFusion: [
    {
      kind: 'perfection',
      amount: { value: 5 }
    },
    {
      kind: 'completion',
      amount: { value: 3, stat: 'stacks' }
    }
  ]
};
```

### Refinement Expert

```typescript
const refineExpert: CraftingBuff = {
  name: 'Refinement Expertise',
  icon: 'refine-icon',
  canStack: false,
  displayLocation: 'perfectionLeft',
  onRefine: [
    {
      kind: 'perfection',
      amount: { value: 10 }
    },
    {
      kind: 'stability',
      amount: { value: -5 }  // Trade stability for perfection
    }
  ]
};
```

## Complex Patterns

### Stacking Transformation

```typescript
const accumulation: CraftingBuff = {
  name: 'Energy Accumulation',
  icon: 'accumulate-icon',
  canStack: true,
  maxStacks: 5,
  displayLocation: 'avatar',
  effects: [
    {
      kind: 'createBuff',
      condition: {
        kind: 'buff',
        buff: 'self',
        count: 5,
        mode: 'equal'
      },
      buff: energyBurst,
      stacks: { value: 1 }
    },
    {
      kind: 'addStack',
      condition: {
        kind: 'buff',
        buff: 'self',
        count: 5,
        mode: 'equal'
      },
      stacks: { value: -5 }  // Reset to 0
    }
  ]
};
```

### Risk-Reward Buff

```typescript
const unstable: CraftingBuff = {
  name: 'Unstable Power',
  icon: 'unstable-icon',
  canStack: true,
  displayLocation: 'avatar',
  effects: [
    {
      kind: 'perfection',
      amount: { value: 8, stat: 'stacks' }
    },
    {
      kind: 'stability',
      amount: { value: -4, stat: 'stacks' }
    }
  ],
  animations: ['perfection', 'stabilitydown']
};
```

### Threshold Trigger

```typescript
const breakthrough: CraftingBuff = {
  name: 'Breakthrough',
  icon: 'breakthrough-icon',
  canStack: false,
  displayLocation: 'completionRight',
  effects: [
    {
      kind: 'completion',
      condition: {
        kind: 'completion',
        percentage: 80,
        mode: 'more'
      },
      amount: { value: 20 }  // Bonus at high completion
    }
  ]
};
```

## Visual Design

### Positioning Strategy

- **avatar** - General buffs, resources
- **stabilityLeft/Right** - Stability-related effects
- **perfectionLeft/Right** - Perfection-related effects
- **completionLeft/Right** - Completion-related effects

### Animation Guidelines

- Use **'buff'** for positive effects
- Use **'stabilitydown'** for risky effects
- Use **'perfection'** when improving quality
- Use **'completion'** when progressing crafting
- Use **'pool'** for qi pool changes
- Combine animations for complex effects

## Best Practices

1. **Clear Purpose** - Each buff should have a specific crafting role
2. **Visual Placement** - Position buffs near related UI elements
3. **Animation Feedback** - Use animations to show effect impact
4. **Risk vs Reward** - Balance positive and negative effects
5. **Technique Synergy** - Design buffs that work with specific techniques
6. **Conditional Depth** - Use conditions for strategic gameplay
7. **Stack Management** - Set appropriate stack limits
8. **Tooltip Clarity** - Explain crafting mechanics clearly

---

[← Combat Buffs](/concepts/combat-buffs/) | [Scaling](/concepts/scaling/) | [Design Patterns →](/concepts/design-patterns/)
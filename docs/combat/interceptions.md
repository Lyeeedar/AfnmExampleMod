---
layout: default
title: Buff Interceptions
parent: Combat System
nav_order: 3
description: 'How buffs can intercept and modify other buffs'
---

# Buff Interceptions

The buff system includes a powerful interception mechanism that allows buffs to modify, replace, or cancel the application of other buffs.

## Interception Structure

Interceptions are defined in the `interceptBuffEffects` array of a buff:

```typescript
interceptBuffEffects?: {
  buff: Buff;                    // The buff to intercept
  effects: BuffEffect[];         // Effects to trigger instead
  cancelApplication: boolean;    // Whether to prevent the original buff
}[]
```

## Real Example - Profane Exchange

The best example of interception comes from the Blood school's Profane Exchange technique:

```typescript
import { Buff } from 'afnm-types';
import icon from '../assets/buffs/profane-exchange.png';

export const profaneExchangeBuff: Buff = {
  name: 'Profane Exchange',
  icon: icon,
  canStack: false,
  stats: undefined,
  tooltip:
    'You no longer gain {buff}. Instead, lose <num>3%</num> health as <name>True Damage</name> per stack you would have gained.',

  onRoundEffects: [],

  interceptBuffEffects: [
    {
      buff: window.modAPI.gameData.techniqueBuffs.blood.bloodCorruption, // Intercept Blood Corruption
      effects: [
        {
          kind: 'damageSelf',
          amount: {
            value: 0.03,
            stat: 'maxhp',
            upgradeKey: 'hpCost',
          },
          damageType: 'true',
        },
      ],
      cancelApplication: true, // Prevent the original buff
    },
  ],

  stacks: 1,
  priority: -1, // Execute before other buffs
};
```

This intercept completely transforms how Blood Corruption works:

- **Normal behavior:** Gain Blood Corruption stacks
- **With Profane Exchange:** Take 3% max HP as true damage instead
- **Result:** Blood techniques become high-risk, high-reward

## Interception Mechanics

### Priority System

Interceptions use the buff's `priority` value to determine execution order:

- Lower numbers execute first
- Profane Exchange uses `priority: -1` to ensure it intercepts before other effects

### Multiple Interceptions

A single buff can intercept multiple different buffs:

```typescript
interceptBuffEffects: [
  {
    buff: firstBuff,
    effects: [
      /* effects for first buff */
    ],
    cancelApplication: true,
  },
  {
    buff: secondBuff,
    effects: [
      /* effects for second buff */
    ],
    cancelApplication: false, // Allow original buff but add effects
  },
];
```

### Partial Interception

When `cancelApplication: false`, the original buff is still applied, but additional effects trigger:

```typescript
{
  buff: targetBuff,
  effects: [
    {
      kind: 'heal',
      amount: { value: 0.1, stat: 'power' }
    }
  ],
  cancelApplication: false  // Original buff applies + healing
}
```

## Guardian Interception

When a buff declares `guardianIntercept`, it acts as a damage shield that absorbs a percentage of incoming damage before it reaches the owner. When the guardian's HP reaches zero, the buff is permanently removed.

### Guardian Structure

```typescript
guardianIntercept?: {
  percent: Scaling;     // Percentage of incoming damage redirected to guardian HP
  maxHp: Scaling;       // Maximum HP for the guardian, evaluated at buff creation
  refreshMode?: 'refresh' | 'extend';  // How re-application combines with existing HP
  canUpgrade?: boolean;
  onDestroyed?: BuffEffect[];  // Effects fired on the owner when the guardian is destroyed
};
```

### The `onDestroyed` Hook

When a guardian is destroyed (its HP reaches zero), any `onDestroyed` effects declared on the `guardianIntercept` block are executed. This is equivalent to adding a `triggeredBuffEffects` entry with `trigger: 'guardianBroken.${name}'`, but declared directly on the guardian for convenience.

The effects execute with:
- **`source`**: The guardian's owner (the character who has the guardian buff)
- **`target`**: The attacker who destroyed the guardian

```typescript
// Example: A guardian that explodes when destroyed
{
  name: 'Ritual Shield',
  icon: shieldIcon,
  canStack: false,
  guardianIntercept: {
    percent: { value: 0.50 },  // Absorb 50% of incoming damage
    maxHp: { value: 0.30, stat: 'maxhp' },  // Guardian HP = 30% of max HP
    onDestroyed: [
      {
        kind: 'damage',
        amount: { value: 0.25, stat: 'power' },
        damageType: 'true',
      },
    ],
  },
}
```

When this guardian is destroyed, it deals 25% of the owner's power as true damage back to the attacker.

### Auto-Generated Tooltip

Tooltips for `onDestroyed` are auto-generated using the "When destroyed, ..." prefix. The trigger description will include the effect details automatically. No custom tooltip is required unless you want different wording than the default.

## Advanced Interception Patterns

### Stack Conversion

Convert incoming buff stacks into different amounts:

```typescript
interceptBuffEffects: [
  {
    buff: incomingBuff,
    effects: [
      {
        kind: 'buffSelf',
        buff: differentBuff,
        amount: { value: 2, stat: undefined }, // 1 incoming = 2 different
      },
    ],
    cancelApplication: true,
  },
];
```

### Conditional Interception

Combine with effect conditions for situational interceptions:

```typescript
interceptBuffEffects: [
  {
    buff: targetBuff,
    effects: [
      {
        kind: 'damage',
        amount: { value: 0.5, stat: 'power' },
        condition: {
          kind: 'hp',
          percentage: 50,
          mode: 'less',
        },
      },
    ],
    cancelApplication: true,
  },
];
```

### Resource Redirection

Redirect resource generation to different pools:

```typescript
interceptBuffEffects: [
  {
    buff: normalResource,
    effects: [
      {
        kind: 'buffSelf',
        buff: alternativeResource,
        amount: { value: 1, stat: undefined },
      },
      {
        kind: 'heal',
        amount: { value: 0.05, stat: 'maxhp' },
      },
    ],
    cancelApplication: true,
  },
];
```

## Tooltip Integration

Interceptions do not automatically appear in tooltips, but the variables within them do. Therefore, a custom tooltip must be written to display them.

```typescript
tooltip: 'You no longer gain {buff}. Instead, lose <num>3%</num> health as <name>True Damage</name> per stack you would have gained.';
```

The `{buff}` placeholder is automatically replaced with the intercepted buff's name in the tooltip system.

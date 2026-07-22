---
layout: default
title: Buff Interceptions
parent: Combat System
nav_order: 3
description: 'How buffs can intercept and modify other buffs'
---

# Buff Interceptions

The buff system includes a powerful interception mechanism that allows buffs to intercept, modify, or cancel the application of other buffs.

## Interception Structure

Interceptions are defined in the `interceptBuffEffects` array of a buff. Each entry can match an incoming buff by name, by stat contribution, or both:

```typescript
interceptBuffEffects?: {
  /**
   * Buffs this interceptor reacts to. Either a specific buff (matched by
   * name) or leave it unset when only `statFilter` should drive matching.
   */
  buff?: Buff | string;
  /**
   * When set, this interceptor reacts to ANY incoming buff whose `stats`
   * map evaluates to a non-zero contribution against any of these stats.
   * Lets modders build category-wide rules (e.g. "intercept every buff that
   * grants Power") without listing every applicable buff by name, so the
   * interceptor can also catch buff names introduced by later mods.
   *
   * Can be combined with `buff` to broaden the criterion: an entry with
   * both set matches an incoming buff when EITHER the name OR the stat
   * filter is satisfied. At least one of `buff` / `statFilter` must be
   * set, since an entry with neither matches nothing.
   *
   * Each listed stat is matched independently, so `['power', 'defense']`
   * matches any buff contributing non-zero to Power OR Defense.
   */
  statFilter?: CombatStatistic[];
  effects: BuffEffect[];
  /**
   * How many of the incoming stacks this interceptor blocks before the buff is
   * applied. Evaluated once per application (NOT per stack) with `incoming` (the
   * remaining incoming stack count) available. The blocked stacks are removed
   * from the application, so `{ value: 9999 }` blocks all of them. Omit to block
   * nothing (a pure listener that reacts without consuming any stacks).
   *
   * Either way the `effects` run exactly ONCE, with `intercepted` set to the
   * number of stacks this interceptor handled (the blocked count, or the full
   * incoming count for a pure listener), so an effect can scale itself per stack
   * via `eqn: 'intercepted'` instead of the engine looping the effect per stack.
   */
  blockAmount?: Scaling;
}[]
```

**Migration from the old `cancelApplication` field:**
- `cancelApplication: true` → set `blockAmount: { value: 9999 }` (blocks all stacks; effects fire once with `intercepted = incoming`)
- `cancelApplication: false` → omit `blockAmount` entirely (effects fire as a pure listener without consuming any stacks)

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
      blockAmount: { value: 9999 }, // Block all incoming stacks — cancels the application
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
    effects: [/* effects for first buff */],
    blockAmount: { value: 9999 }, // Block all — cancels the application
  },
  {
    buff: secondBuff,
    effects: [/* effects for second buff */],
    // blockAmount omitted — pure listener, original buff still applies
  },
];
```

### Partial Interception (Listener Pattern)

When `blockAmount` is omitted, the interceptor is a pure listener: the original buff still applies normally, but the effects also fire at the same time:

```typescript
{
  buff: targetBuff,
  effects: [
    {
      kind: 'heal',
      amount: { value: 0.1, stat: 'power' }
    }
  ],
  // blockAmount omitted — original buff applies + bonus healing fires as a listener
}
```

### Stat Filter — Category-Wide Interception

Use `statFilter` to intercept any buff that grants a specific stat, without listing every buff by name:

```typescript
// Intercept every buff that grants Power (catches mod-added buffs too)
interceptBuffEffects: [
  {
    statFilter: ['power'],
    effects: [
      {
        kind: 'buffSelf',
        buff: powerTracker,
        amount: { value: 1, stat: undefined },
      },
    ],
    blockAmount: { value: 9999 }, // Block the incoming buff entirely
  },
];
```

Combine `buff` and `statFilter` to broaden matching — a buff is intercepted when it matches **either** criterion:

```typescript
interceptBuffEffects: [
  {
    buff: specificDebuff,          // Match by name
    statFilter: ['power'],         // OR match any buff that grants Power
    effects: [/* intercept effects */],
  },
];
```

## Guardian Interception

When a buff declares `guardianIntercept`, it acts as a damage shield that absorbs a percentage of incoming damage before it reaches the owner. When the guardian's HP reaches zero, the buff is permanently removed.

### Guardian Structure

```typescript
guardianIntercept?: {
  percent: Scaling;     // Percentage of incoming damage redirected to guardian HP
  maxHp: Scaling;        // Maximum HP for the guardian, evaluated at buff creation
  refreshMode?: 'refresh' | 'extend';  // How re-application combines with existing HP
  target?: 'all' | 'healthOnly';        // Which damage portion the guardian intercepts
  canUpgrade?: boolean;
  onDestroyed?: BuffEffect[];  // Effects fired on the owner when the guardian is destroyed
};
```

### The `target` Field

The `target` field controls which portion of incoming damage the guardian intercepts:

- **`'all'`** (default): Intercepts the configured percent of total incoming damage at the pre-barrier location. This is the legacy behavior. Damage is intercepted before barrier absorption, so the guardian absorbs raw damage that would otherwise be reduced by the owner's barrier.

- **`'healthOnly'`**: Skips the pre-barrier interception entirely. The guardian instead absorbs a percent of the damage that would actually reach HP, after all other reductions (barrier, other interceptors, damage reduction, temporary health) have been applied. This lets mods build guardians that do not interfere with barrier-gated effects.

```typescript
// Example: A guardian that only activates after barrier is fully breached
{
  name: 'Final Ward',
  icon: wardIcon,
  canStack: false,
  guardianIntercept: {
    percent: { value: 0.50 },
    maxHp: { value: 0.20, stat: 'maxhp' },
    target: 'healthOnly',  // Absorbs damage that reaches HP, not raw pre-barrier damage
  },
}
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
    blockAmount: { value: 9999 }, // Block the original application
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
    blockAmount: { value: 9999 },
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
    blockAmount: { value: 9999 },
  },
];
```

## Tooltip Integration

Interceptions do not automatically appear in tooltips, but the variables within them do. Therefore, a custom tooltip must be written to display them.

```typescript
tooltip: 'You no longer gain {buff}. Instead, lose <num>3%</num> health as <name>True Damage</name> per stack you would have gained.';
```

The `{buff}` placeholder is automatically replaced with the intercepted buff's name in the tooltip system.

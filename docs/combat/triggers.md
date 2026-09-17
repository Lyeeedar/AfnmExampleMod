---
layout: default
title: Triggers
parent: Combat System
nav_order: 7
description: 'How to hook buffs into the combat lifecycle'
---


# Combat Triggers

Buffs can trigger effects off the back of a variety of other parts of the combat lifecycle. Building off these allows you to create rich and detailed combat effects.

## Table of Contents

1. [Buff Timing Triggers](#buff-timing-triggers)
2. [Action-Based Triggers](#action-based-triggers)
3. [Resource Management Triggers](#resource-management-triggers)
4. [Damage and Healing Triggers](#damage-and-healing-triggers)
5. [Special System Triggers](#special-system-triggers)
6. [Custom Triggers](#custom-triggers)
7. [Variables Available in Buff Conditions](#variables-available-in-buff-conditions)

---

## Buff Timing Triggers

These triggers are related to when buffs are processed during combat rounds.

### `beforeTechniqueEffects`
- **When it triggers:** Before any technique is executed by the buff owner
- **Condition:** Automatically triggered when the entity with this buff uses any technique
- **Usage:** Used for pre-technique modifications, costs, requirements, and effects
- **Examples:** Enhancing damage, modifying technique properties, applying costs

### `afterTechniqueEffects`
- **When it triggers:** After any technique is executed by the buff owner
- **Condition:** Automatically triggered when the entity with this buff uses any technique
- **Usage:** Effects that react to or follow up on technique execution
- **Examples:** Post-technique healing, delayed damage, follow-up buffs

### `onStackGainEffects`
- **When it triggers:** When this buff gains stacks
- **Condition:** Automatically triggered whenever the stack count increases
- **Usage:** Effects that scale with or react to stacking
- **Examples:** Building secondary buffs, tracking stack milestones

### `onRoundEffects`
- **When it triggers:** At the end of each combat round
- **Condition:** Automatically triggered at round end for all entities with buffs that have these effects
- **Usage:** End-of-round processing like DoT damage, healing over time, buff decay, stack management
- **Examples:** Poison damage, regeneration, buff duration reduction

### `onRoundStartEffects`
- **When it triggers:** At the beginning of each combat round
- **Condition:** Automatically triggered at round start for all entities with buffs that have these effects
- **Usage:** Start-of-round effects like barrier restoration, buff application, preparation effects
- **Examples:** Shield regeneration, stance preparation, round-based buff application

### `onCombatStartEffects`
- **When it triggers:** At the very beginning of combat
- **Condition:** Automatically triggered when combat begins for entities with buffs that have these effects
- **Usage:** Combat initialization effects, stance setup, initial preparations
- **Examples:** Initial barrier application, combat preparation buffs

---

## Action-Based Triggers

These triggers are based on specific actions taken during combat.

### `use.{techniqueType}`
- **When it triggers:** When a technique of a specific type is used
- **Condition:** Triggered when the entity uses any technique matching the specified type
- **Usage:** Type-specific bonuses and effects based on technique element
- **Examples:**
  - `use.fist` - Triggers when using fist techniques
  - `use.blood` - Triggers when using blood techniques

### `use.{specificEffect}`
- **When it triggers:** When a technique with a specific effect type is used
- **Condition:** Triggered based on the technique's effect kinds
- **Usage:** Effect-specific bonuses and reactions
- **Examples:**
  - `use.damage` - When using techniques that deal damage
  - `use.heal` - When using techniques that heal
  - `use.buffSelf` - When using techniques that apply buffs to self
  - `use.buffTarget` - When using techniques that buff the target
  - `use.damageSelf` - When using techniques that deal self-damage

### `use.artefact`
- **When it triggers:** When an artefact activates during a technique
- **Condition:** Triggered once per technique execution that causes an artefact to fire
- **Usage:** Artefact synergy effects, bonuses that scale with artefact usage

### `technique.use.{TechniqueEffectKind}`
- **When it triggers:** When the buff owner's technique executes a specific effect kind during its resolution
- **Condition:** Fires as each effect within the technique resolves, not when the technique is selected
- **Usage:** Granular reactions to individual effect applications within a technique sequence
- **TechniqueEffectKind values:** `damage`, `damageSelf`, `heal`, `barrier`, `temporaryHealth`, `buffSelf`, `consumeSelf`, `buffTarget`, `consumeTarget`, `negate`, `add`, `multiply`, `merge`, `trigger`, `cleanseToxicity`, `modifyBuffGroup`, `setState`, `convertSelf`, `repair`, `consumeInventoryItem`, `defer`, `mergeSelf`, `permanentStatChange`
- **Examples:**
  - `technique.use.damageSelf` - Fires when the technique deals self-damage (e.g. Blood Amplification)
  - `technique.use.buffSelf` - Fires when the technique applies a buff to self
  - `technique.use.barrier` - Fires when the technique grants barrier

### `buff.use.{BuffEffectKind}`
- **When it triggers:** When the buff owner's buff system fires a specific effect kind
- **Condition:** Fires as buff effects resolve, distinct from `technique.use.*` which fires for technique effects
- **Usage:** Reacting to specific buff effect applications
- **BuffEffectKind values:** `damage`, `damageSelf`, `heal`, `barrier`, `temporaryHealth`, `buffSelf`, `consumeSelf`, `buffTarget`, `consumeTarget`, `negate`, `add`, `multiply`, `merge`, `trigger`, `cleanseToxicity`, `modifyBuffGroup`, `setState`, `convertSelf`, `repair`, `consumeInventoryItem`, `defer`

---

## Resource Management Triggers

These triggers relate to spending and consuming resources during combat.

### `spend.{resourceName}`
- **When it triggers:** When a specific resource is spent as a technique cost
- **Condition:** Triggered when techniques consume specific resources through their cost requirements
- **Usage:** Resource-spending bonuses, cost reductions, spending-based effects
- **Examples:**
  - `spend.Qi Vial` - Triggers when Qi Vials are consumed for technique costs
  - `spend.{buffName}` - Triggers when specific buffs are consumed as costs

### `consume.{buffName}`
- **When it triggers:** When a specific buff is consumed/removed
- **Condition:** Triggered when buffs are removed through consumption, expiration, or manual removal
- **Usage:** Buff consumption effects, cleanup effects, consume-based bonuses
- **Examples:** Special effects when certain buffs expire or are consumed

---

## Damage and Healing Triggers

These triggers relate to taking or dealing damage and healing.

### `takeDamage`
- **Condition:** Triggered every time the entity receives unblocked damage from any source (after defense calculations)
- **Usage:** Damage-based reactions, defensive responses, damage-triggered effects

### `takeDamage-normal`
- **Condition:** Triggered when the entity receives untyped (physical) damage. Use for damage-type-specific reactions alongside `takeDamage`.
- **Usage:** Type-specific defensive responses

### `takeDamage-{damageType}`
- **Condition:** Triggered when the entity receives damage of the specified type (`true`, `corrupt`, `disrupt`, etc.)
- **Usage:** Type-specific defensive or offensive reactions

### `blockDamage`
- **Condition:** Triggered every time the entity fully blocks damage from a hit (using barrier or damage resistance)
- **Usage:** Reflection effects, counters, parry mechanics

### `damageHp`
- **Condition:** Triggered every time the entity deals damage to the opponents health (so not blocked by barrier or damage resistance)
- **Usage:** Poison effects, leech mechanics

### `damageHp-{damageSource}`
- **Condition:** Triggered when the entity deals HP damage from a specific source. `damageSource` can be `normal` or a technique school (`weapon`, `blood`, `fist`, `celestial`, `cloud`, `blossom`, `none`)
- **Usage:** Source-specific damage reactions

### `damageBlocked`
- **Condition:** Triggered every time the entity fails to break through barrier or damage resistance, and does 0 damage
- **Usage:** Recoil effects, powerup mechanics

### `damageSelf`
- **Condition:** Triggered for each 1% of max HP dealt as self-damage
- **Usage:** Self-harm penalties, masochistic bonuses, self-damage reactions

### `damageSelf-{damageType}`
- **Condition:** Triggered for each 1% of max HP dealt as self-damage of the specified type
- **Usage:** Type-specific self-damage reactions

### `fullHeal`
- **Condition:** Triggered when the entity heals itself from less than full health to full health
- **Usage:** Overheal effects, Healthy buff activations

### `fullBarrier`
- **Condition:** Triggered when the entity refills its barrier from less than full to full
- **Usage:** Overbarrier effects

### `overHeal`
- **Condition:** Triggered when the entity heals while already at full health
- **Usage:** Overheal bonuses, effects that activate on excess healing

### `critDamage`
- **Condition:** Triggered when the entity deals a critical hit that damages the opponent's HP (not blocked)
- **Usage:** Crit-damage amplifiers, bonus effects on critical strikes

### `critHeal`
- **Condition:** Triggered when a healing effect critically heals the entity
- **Usage:** Enhanced healing-crit bonuses, healing-crit reactions

### `critBarrier`
- **Condition:** Triggered when a barrier application critically increases the entity's barrier
- **Usage:** Barrier-crit bonuses, shield amplification effects

### `fullTempHealth`
- **Condition:** Triggered when the entity's temporary health is fully consumed or expires
- **Usage:** Temporary health exhaustion effects

### `overTempHealth`
- **Condition:** Triggered when the entity gains temporary health while already holding the maximum
- **Usage:** Over-tempHealth bonuses

### `tempHealthAbsorbed`
- **Condition:** Triggered when temporary health absorbs damage
- **Usage:** Temporary health absorption reactions

### `tempHealthBlocked`
- **Condition:** Triggered when temporary health prevents a hit from reaching HP
- **Usage:** Temp health block reactions

### `tempHealthDepleted`
- **Condition:** Triggered when temporary health reaches zero from damage absorption
- **Usage:** Temp health depletion effects

### `temporaryHealthGained`
- **Condition:** Triggered when the entity gains temporary health from any source
- **Usage:** Temporary health gain reactions

### `critTempHealth`
- **Condition:** Triggered when a temporary health application exceeds the current cap and creates overflow
- **Usage:** Overflow temporary health effects

### `barrierBroken`
- **Condition:** Triggered when the entity's barrier is fully depleted
- **Usage:** Barrier break reactions, debuffs on break

### `barrierGained`
- **Condition:** Triggered when the entity gains barrier from any source
- **Usage:** Barrier gain reactions

### `healthHealed`
- **Condition:** Triggered when the entity is healed for any amount (including overheal)
- **Usage:** Healing reactions, tracking

### `afterTechnique`
- **Condition:** Triggered after any technique resolves (both the caster's own technique and techniques used by other entities against them)
- **Usage:** General post-technique reactions

---

## Special System Triggers

These triggers are related to specific game systems and mechanics.

### `interceptBuffEffects`
- **When it triggers:** When specific buffs are about to be applied
- **Condition:** Triggered when buffs matching the interception criteria are being applied
- **Usage:** Buff interception, application modification, buff blocking
- **Properties:**
  - `cancelApplication: true` - Prevents the buff from being applied
  - `cancelApplication: false` - Triggers effects but allows buff application
- **Examples:** Immunity effects, buff transformation, application penalties

### `triggeredBuffEffects`
- **When it triggers:** Based on custom trigger strings
- **Condition:** Triggered when the specified trigger string is activated
- **Usage:** Custom trigger-based effects, complex conditional interactions
- **Properties:**
  - `listenToOpponent: true` - This trigger also fires when the opponent triggers the same event
- **Examples:** Formation triggers, contingency effects, custom reaction systems

### `blockTriggerEffects`
- **When it triggers:** Prevents specific triggers from executing on this buff
- **Condition:** When the specified trigger string is about to fire on this buff
- **Usage:** Suppressing unwanted trigger effects from other buffs
- **Properties:**
  - `trigger: string` - The trigger to block
  - `condition?: TechniqueCondition` - Optional condition; blocking only applies if condition is met
  - `effects?: BuffEffect[]` - Effects to run instead of blocking outright

### `damageInterceptorEffects`
- **When it triggers:** Before incoming damage is applied to the entity
- **Condition:** Runs whenever damage would be dealt to this entity
- **Usage:** Modifying incoming damage (multiply, reduce, or add expressions), or reacting to it before it lands

**`InterceptorPhase` type:**

```typescript
type InterceptorPhase = 'beforeGuardian' | 'preBarrier' | 'postBarrier';
```

The damage pipeline executes interceptors in this order:

| Phase | When it runs | Use case |
|-------|-------------|----------|
| `'beforeGuardian'` | Very start of the pipeline, before guardian/puppet interception and every other mitigation | Full-negation effects (e.g. a Grace Period that zeroes a hit before puppets absorb it) |
| `'preBarrier'` | After guardian/puppet interception, before barrier absorption | Default. Damage reduction, reflect effects |
| `'postBarrier'` | After barrier absorption, before damage reduction | Effects that should see post-barrier net damage |

- **`trigger?: TechniqueCondition`** - Condition that must be met for the interceptor to run
- **`damageModifier: DamageModifier`** - How to modify the damage (`multiply`, `reduce`, or `expression`)
- **`effects?: BuffEffect[]`** - Additional effects to run when the interceptor fires
- **`phase?: InterceptorPhase`** - Which phase of the damage pipeline this interceptor runs in. Defaults to `'preBarrier'`. (The old `afterBarrier` boolean field is no longer used: use `phase: 'postBarrier'` instead of `afterBarrier: true` and `phase: 'preBarrier'` instead of `afterBarrier: false`.)
- **`damageTypes?: (DamageType | 'normal')[]`** - Restrict to specific damage types; `'normal'` matches untyped physical damage

**Example:**

```typescript
damageInterceptorEffects: [
  {
    damageModifier: { kind: 'multiply', value: 0.5 }, // Reduce incoming damage by 50%
    effects: [
      { kind: 'buffSelf', amount: { value: 1, stat: undefined }, buff: defensiveStance }
    ],
    damageTypes: ['normal', 'true']
  }
]
```

### `techniqueAmplifierEffects`
- **When it triggers:** Before outgoing damage, barrier, heal, or temporary health effects are applied
- **Usage:** Amplifying the entity's own outgoing effects (e.g., increase all damage by 50%)
- **Properties:**
  - `trigger?: TechniqueCondition` - Optional condition
  - `amplifier: { kind: 'multiply', value: number, cantUpgrade?: boolean }` - Multiplier to apply
  - `effects?: BuffEffect[]` - Effects to run when amplifying (e.g., consume stacks of the amplifier buff)
  - `appliesTo: ('damage' | 'barrier' | 'heal' | 'tempHealth')[]` - Which effect kinds to amplify

**Example:**

```typescript
techniqueAmplifierEffects: [
  {
    amplifier: { kind: 'multiply', value: 1.5 }, // +50% to all outgoing damage
    appliesTo: ['damage'],
    effects: [
      { kind: 'consumeSelf', amount: { value: 1, stat: undefined }, buff: empoweredBuff }
    ]
  }
]
```

### `buffAmplifierEffects`
- **When it triggers:** When a buff is created on the entity that has this effect
- **Usage:** Modifying how many stacks are granted when a specific buff is applied to self
- **Properties:**
  - `trigger?: TechniqueCondition` - Optional condition
  - `target: string` - Matches buffs by name, buffType, or flag
  - `modifier: { kind: 'add' | 'multiply', value: number, cantUpgrade?: boolean }` - How to modify stacks
  - `effects?: BuffEffect[]` - Effects to run when amplifying (e.g., consume stacks of the amplifier)

**Example:**

```typescript
buffAmplifierEffects: [
  {
    target: 'Blood Corruption',
    modifier: { kind: 'add', value: 1 }, // +1 extra stack when Blood Corruption is applied
    effects: [
      { kind: 'consumeSelf', amount: { value: 1, stat: undefined }, buff: amplifierBuff }
    ]
  }
]
```

---

## Custom Triggers

These are specific custom triggers used by various systems in the game.

### `contingency`
- **When it triggers:** Special trigger used by Immortal Fang techniques
- **Condition:** Activated by specific Immortal Fang technique interactions
- **Usage:** Contingency-based effects in the Immortal Fang technique school
- **Examples:** Emergency responses, backup effects, failure contingencies

### `Formation` (formationCoreFlag)
- **When it triggers:** When formation-based effects are activated
- **Condition:** Triggered by formation system interactions
- **Usage:** Formation-specific bonuses and effects
- **Examples:** Formation technique synergies, group combat bonuses

### `guardianBroken.{buffName}`
- **When it triggers:** When a guardian sub-entity (declared via `guardianIntercept`) reaches 0 HP
- **Condition:** Equivalent to a `triggeredBuffEffects` entry with `trigger: 'guardianBroken.${name}'` on the guardian buff itself
- **Usage:** Effects that fire when a guardian is destroyed

### `spend.{buffName}`
- **When it triggers:** When the entity spends a specific buff as a technique cost
- **Condition:** Triggered when a technique cost removes the named buff
- **Usage:** Spending-based bonuses, cost reduction effects

### `createBuff.{buffName}`
- **When it triggers:** When a buff with the specified name is applied to the entity
- **Condition:** Fires whenever that buff is applied, including from non-technique sources
- **Usage:** Reacting to specific buff applications from anywhere

### `convert.{sourceBuff}.{targetBuff}`
- **When it triggers:** When the entity converts the source buff into the target buff
- **Condition:** Fires on buff conversion effects
- **Usage:** Conversion-based reactions, tracking

### `meteorMassBoost`
- **When it triggers:** When the meteor mass boost system applies a multiplier
- **Condition:** Fires during meteor-based combat effects
- **Usage:** Meteor boost synergy effects

---

## Implementation Notes

### Trigger Processing Order
1. **Pre-Technique:** `beforeTechniqueEffects` are processed before technique execution
2. **Technique Execution:** Main technique effects with embedded triggers
3. **Post-Technique:** Various action-based triggers (`use.*`, `spend.*`, `afterTechnique`)
4. **Damage/Healing:** `takeDamage`, `damageSelf` triggers during damage processing
5. **End of Round:** `onRoundEffects` at round conclusion
6. **Start of Round:** `onRoundStartEffects` at round beginning

### Priority System
- Buffs with **higher** `priority` values are processed **first**
- Default priority is 0 if not specified
- Buffs with priority 1 execute before priority 0, which executes before priority -1

### Parent Buff Prevention
- Triggers cannot activate buffs that are already in the parent chain
- Prevents infinite recursion in buff trigger chains
- Each trigger call maintains a list of parent buff names to avoid cycles

### Condition Evaluation
- All triggers respect buff conditions (`TechniqueCondition`)
- Failed conditions may remove buffs if `removeOnConditionFailed` is true
- Condition types include: `chance`, `buff`, `hp`, `condition`, and `inventoryItem`
- Use `allowTriggers: true` on a condition to let `triggeredBuffEffects` fire even when the condition fails

---

## Variables Available in Buff Conditions

Buff conditions and stance rule expressions have access to a set of named variables that describe the current combat state. These are evaluated lazily: only variables actually referenced by an expression are computed.

### `round`
- **Type:** number
- **Value:** The current combat round, **1-based**, matching the round number shown in the combat UI (Round 1, Round 2, etc.)
- **Availability:** Read in any buff condition expression and in stance rule condition expressions

> **Note:** Prior to game version 2026-08-09, `round` returned a 0-based value (0 during the UI's Round 1, 1 during Round 2, etc.). If you have existing stance rules that compare `round` to a number, verify they still behave as intended after updating. A rule written as `round == 1` now fires on Round 1 as intended, whereas previously it fired on Round 2.

### Other common variables

| Variable | Type | Description |
|----------|------|-------------|
| `hp` | number | Current HP of the entity |
| `maxhp` | number | Maximum HP of the entity |
| `barrier` | number | Current barrier of the entity |
| `power` | number | Current power stat |
| `{buffName}` | number | Stack count of the named buff (use the actual buff name) |
| `triggeringStacks` | number | Stack count of the **triggering buff** -- the buff whose hook is currently executing. Only set inside `triggeredBuffEffects` or timing-effect hooks when the trigger fires. Useful for effects that scale with the stacks of the buff that triggered them (e.g. a `defer` effect that reads how many stacks the original `onStackGainEffects` fired with). Unset (undefined) when no triggering buff context exists. |

---

## Usage Examples

### Basic Damage Reaction
```typescript
triggeredBuffEffects: [
  {
    trigger: 'takeDamage',
    effects: [
      {
        kind: 'heal',
        amount: { value: 10, stat: "power" }
      }
    ]
  }
]
```

### Resource Spending Bonus
```typescript
triggeredBuffEffects: [
  {
    trigger: 'spend.Qi Vial',
    effects: [
      {
        kind: 'buff',
        buff: strengthBuff,
        amount: { value: 1, stat: undefined }
      }
    ]
  }
]
```

### Technique Type Synergy
```typescript
triggeredBuffEffects: [
  {
    trigger: 'use.fist',
    effects: [
      {
        kind: 'damage',
        amount: { value: 1, stat: 'power' },
      }
    ]
  }
]
```

### Listen to Opponent
```typescript
triggeredBuffEffects: [
  {
    trigger: 'use.damage',
    listenToOpponent: true, // Also triggers when the OPPONENT uses damage
    effects: [
      { kind: 'buffSelf', amount: { value: 1, stat: undefined }, buff: counterStance }
    ]
  }
]
```

### Damage Interceptor
```typescript
damageInterceptorEffects: [
  {
    damageModifier: { kind: 'reduce', percent: 30 },
    damageTypes: ['normal']
  }
]
```

### Technique Amplifier
```typescript
techniqueAmplifierEffects: [
  {
    amplifier: { kind: 'multiply', value: 1.5 },
    appliesTo: ['damage', 'heal'],
    effects: [
      { kind: 'consumeSelf', amount: { value: 1, stat: undefined }, buff: focusBuff }
    ]
  }
]
```

---
layout: default
title: Triggered Events
parent: Core Concepts
---

# Triggered Events

TriggeredEvents are one way to automatically start [Events](/concepts/concepts-events/) based on specific conditions. They watch for opportunities to fire events when the player is on certain screens or at certain locations.

## What Triggered Events Are

A **TriggeredEvent** wraps a [GameEvent](/concepts/concepts-events/) with trigger conditions that control when and where it activates automatically:

```typescript
interface TriggeredEvent {
  event: GameEvent;           // The actual event content
  name: string;               // Unique identifier
  trigger: string;            // Condition for when to trigger (flag expression)
  screens: GameScreen[];      // Which screens this can trigger on
  locations?: string[];       // Which locations this can trigger at
  triggerChance?: number;     // Random chance (0.0 - 1.0) to trigger
  resetMonths?: { min: number; max: number }; // Cooldown between triggers
  usesCooldown?: boolean;     // Whether this uses the global encounter cooldown (3 days)
}
```

## How Triggered Events Work

1. **Game checks triggers** - Evaluates all TriggeredEvents for current screen/location
2. **Condition evaluation** - Tests `trigger` condition using current [flags](concepts-flags.md)
3. **Random chance** - Applies `triggerChance` if specified
4. **Cooldown check** - Verifies cooldown period has passed
5. **Event execution** - Processes the GameEvent's steps in sequence

## Trigger Conditions

The `trigger` field uses [flag expressions](/concepts/concepts-flags/) to determine when an event can fire:

```typescript
trigger: '1'                    // Always trigger
trigger: 'tutorialComplete == 0' // Only if tutorial not done
trigger: 'realm >= 3 && visitedLocation == 0' // Multiple conditions
```

## Screen and Location Targeting

### Screen Targeting
The `screens` array specifies which game screens can trigger this event:

- `'location'` - Location/exploration screen
- `'market'` - Marketplace screen  
- `'inventory'` - Inventory screen
- `'home'` - Home/rest screen
- And others...

### Location Targeting
The optional `locations` array restricts triggering to specific locations:

```typescript
locations: ['Crystal Shore']           // Only at Crystal Shore
locations: ['Sect Grounds', 'Library'] // Multiple locations
// No locations = can trigger anywhere (if screen matches)
```

## Trigger Chance and Cooldowns

Control random and timed triggering:

```typescript
triggerChance: 0.3    // 30% chance when conditions are met
resetMonths: { min: 3, max: 6 }  // Wait 3-6 months between triggers
usesCooldown: true    // Uses global 3-day cooldown between any triggered events
```

## Example Triggered Event

From the game's Crystal Shore entrance event:

```typescript
const crystalShoreEnterEvent: GameEvent = {
  location: 'Crystal Shore',
  steps: [
    {
      kind: 'text',
      text: "You're striding towards the edge of the bubbling lake...",
    },
    {
      kind: 'speech',
      character: 'Yufu Chen',
      text: "I wouldn't do that, if I were you...",
    },
    // ... more steps
  ],
};

const crystalShoreEnterEventTrigger: TriggeredEvent = {
  event: crystalShoreEnterEvent,
  name: 'crystalShoreEnterEvent',
  trigger: '1',                    // Always trigger when conditions met
  screens: ['location'],           // Only on location screen
  locations: ['Crystal Shore']     // Only at Crystal Shore
};
```

## Adding Triggered Events to Your Mod

```typescript
// Define your event
const myEvent: GameEvent = {
  location: 'My Location',
  steps: [
    { kind: 'text', text: 'Something interesting happens...' }
  ],
};

// Create the trigger
const myEventTrigger: TriggeredEvent = {
  event: myEvent,
  name: 'myCustomEvent',
  trigger: 'playerLevel >= 5',
  screens: ['location'],
  locations: ['My Location']
};

// Register with the game
window.modAPI.actions.addTriggeredEvent(myEventTrigger);
```

## When to Use Triggered Events

TriggeredEvents are ideal for:

- **Location introductions** - First-time visit events
- **Random encounters** - Chance-based events while exploring
- **Progression gates** - Events that fire when player reaches certain milestones
- **Recurring events** - Events that repeat with cooldowns
- **Contextual events** - Events specific to certain screens or situations

## Other Ways Events Can Start

Remember, TriggeredEvents are just one way to start events. Events can also be started by:

- **Character interactions** - Talking to NPCs
- **Location events** - Built into location definitions
- **Quest steps** - Events as part of quest progression
- **Item usage** - Consumables that trigger events
- **Calendar events** - Time-based events
- **Other event steps** - Events calling other events

---

[← Events](/concepts/concepts-events/) | [Event Steps →](/concepts/concepts-event-steps/)
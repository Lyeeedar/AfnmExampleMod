---
layout: default
title: Location Structure
parent: Location System
nav_order: 1
---

# Location Structure

The GameLocation interface defines all properties available for creating locations in the game world.

## Required Fields

Every location must define these core properties:

### Basic Information

```typescript
name: string;         // Unique identifier used internally
displayName?: string; // Optional display name (defaults to name)
description: string;  // Narrative description shown to players
```

The name field serves as the location unique identifier throughout the game. Use the displayName field when you want to show a different name to players.

### Visual Properties

```typescript
image: string;                    // Background image path
icon: string;                     // Map icon image path
screenEffect: ScreenEffectType;   // Visual atmosphere effect
locationArt?: string;             // Isometric scene image path (generated art)
locationArtOverride?: { condition: string; image: string }[]; // Conditional scene artwork
```

Set `screenEffect` on your `GameLocation` before [registering it](#registering-locations). It selects an ambient visual overlay for the location background, so choose one that fits your artwork. It does not change encounters or apply combat effects. Supported values are:

- Weather and landscape: `'rain'`, `'snow'`, `'mist'`, `'sun'`, `'driftingLeaves'`, `'dust'`.
- Furnaces and interiors: `'smoke'`, `'forge'`, `'steam'`.
- Underwater scenes: `'bubbles'`.
- Magical environments: `'sparkle'`, `'chromatic'`, `'aurora'`, `'fireflies'`, `'jadeForest'`.

For example, use `screenEffect: 'mist'` for a mist-covered location. Load the mod and visit the location to check the overlay against your background image.

locationArt points to an isometric scene image for this location. When set, the location screen renders the scene artwork instead of the standard background image. The value should be a path to a generated scene image (for example nineMountainSectSceneImage).

### Audio Properties

```typescript
music: MusicName;       // Background music track
ambience: AmbienceName; // Ambient sound effects
```

Music and ambience names must match registered audio files in the game.

### Map Properties

```typescript
position: { x: number; y: number };           // World map coordinates
size: 'tiny' | 'small' | 'normal' | 'large'; // Icon size on map
```

Position coordinates determine where the location appears on the world map. Size affects how prominently it displays.

### Connections

```typescript
unlocks: (ConditionalLink | ExplorationLink)[];  // Connected locations
```

Every location must define its connections to other locations, even if the array is empty. See Connecting Locations for details.

## Optional Fields

### Tutorial Context and Leaving

`tutorialContext?: string` selects the tutorial surface used while the location screen is open.

`leaveAction` replaces the location's leave action with a named event-step sequence:

```typescript
leaveAction?: {
  name: Translatable;
  alternateName?: { condition: string; name: Translatable };
  icon: string;
  coordinates?: { x: number; y: number };
  steps: EventStep[];
};
```

### Realm Requirements

```typescript
realm?: Realm;                   // Minimum realm to access
realmProgress?: RealmProgress;   // Specific progress level
```

Example:
```typescript
realm: 'qiCondensation',
realmProgress: 'Middle',
```

### Buildings

```typescript
buildings?: LocationBuilding[];  // Interactive structures
```

Buildings provide services and interactions. See Building Types for all available options.

### Combat Content

```typescript
enemies?: LocationEnemy[];       // Combat encounters
```

Enemy encounters with intro events:
```typescript
enemies: [
  {
    enemy: gorashi,
    rarity: 'qitouched',
    condition: '1',
    intro: [
      {
        kind: 'text',
        text: 'A Gorashi emerges from the undergrowth...'
      }
    ]
  }
]
```

Enemy Integration: Enemies must be defined as EnemyEntity objects before being added to locations. See the Enemy Entities documentation for complete enemy design and implementation guidance, including stance systems, behavior patterns, and combat mechanics.

### Events

```typescript
events?: LocationEvent[];           // Random events
explorationEvent?: LocationEvent[];  // First-time exploration events
mapEvents?: LocationMapEvent[];      // Timed map events
```

#### Location Events
Random events that can trigger when visiting:
```typescript
events: [
  {
    event: [],           // Event steps
    rarity: 'mundane',      // Spawn frequency
    triggerChance: 0.1,     // Override rarity (optional)
    noCooldown: true,       // Skip the between-event cooldown (optional)
    condition: 'realm >= qiCondensation', // When available
    cooldown: {             // Optional per-event cooldown
      key: 'my_event_key', // Unique flag key for this event
      min: 5,              // Minimum days before can retrigger
      max: 15              // Maximum days before can retrigger
    },
    pity: true             // Optional: include in global pity pool
  }
]
```

triggerChance: Overrides the rarity-based probability for this event.

noCooldown: When true, this event bypasses the standard between-event cooldown, allowing it to fire on consecutive explorations.

cooldown: Prevents an event from firing again for a random number of days in min, max. The key must be unique across your mod events. It is stored as a flag to track the cooldown.

pity: Marks the event as part of the global pity pool. All pity events share a counter (globalSpecialEventPity) that increments each exploration where at least one pity event was eligible but none fired. Any pity event firing resets the counter to zero. The event effective rarity weight is multiplied by min(1 + counter times 0.1, 5), reaching 5 times after roughly 40 consecutive failed attempts. Each player also receives a fixed per-event multiplier (drawn from a shuffled odds list seeded by their name), so some events are naturally easier or harder to find for a given player. Setting pity: true on rare one-time discovery events ensures no player is permanently locked out of them.

#### Exploration Events
Special events that trigger during exploration:
```typescript
explorationEvent: [
  {
    event: [],
    rarity: 'mundane',
    condition: 'exploreWarning == 0'
  }
]
```

#### Map Events

Use `GameLocation.mapEvents` to offer encounters as temporary map markers. Each `LocationMapEvent` supplies a unique `name` within its location, an `image` asset, a `realm`, a `condition` expression, and the `event: EventStep[]` sequence to run when selected. Build that sequence with the [event system](../events/index). Use `condition` to gate eligibility, including any realm restriction you need. The selection check uses this expression rather than enforcing the event's `realm` as a minimum player realm.

Choose the scheduling mode to suit your encounter design:

- Omit `mapEventSettings` for one active event at a time, with a separate `cooldown` for each event. Eligible events are checked in array order, so the first ready event takes the slot. Use this for a small, ordered encounter pool.
- Set `mapEventSettings: { maxActive, spawnMonths: { min, max } }` on the location for a shared timer and multiple active events. `maxActive` caps simultaneous markers. Each successful scheduled spawn starts a random delay in the inclusive `spawnMonths` range. An update adds at most one event, rather than filling every empty slot. Use this for a region with several encounters available together.

All map-event timers use **calendar months**. `persist` is the lifetime of a marker. It starts at age zero and expires when its age exceeds `persist`, or when its condition becomes false. Starting the encounter consumes the marker. Choose a longer lifetime if players must travel far to reach it.

Without shared settings, `cooldown: { min, max }` sets the inclusive random delay after an event is consumed or expires. The first delay is drawn from zero through `cooldown.max`. With shared settings, the individual `cooldown` field is still required in each definition but is not used for scheduling. The shared timer controls new spawns instead. An already-active event cannot be selected again, and recently selected events are less likely to recur. Keep event names unique and stable so markers resolve to the intended definition.

`mapIconScale` scales the marker image and its base, defaulting to `1`. Use a smaller positive value, such as `0.5`, when several large encounter images would crowd the same location.

This helper adds two encounters to a complete location definition supplied by your mod. Pass your authored step arrays and packaged icon paths to it, then register the returned location:

```typescript
import type { EventStep, GameLocation } from 'afnm-types';

function withMapEncounters(
  location: GameLocation,
  patrolIcon: string,
  patrolSteps: EventStep[],
  cacheIcon: string,
  cacheSteps: EventStep[],
): GameLocation {
  return {
    ...location,
    mapEventSettings: { maxActive: 2, spawnMonths: { min: 1, max: 2 } },
    mapEvents: [
      {
        name: 'myModPatrol',
        image: patrolIcon,
        mapIconScale: 0.5,
        realm: 'meridianOpening',
        condition: 'realm >= meridianOpening',
        cooldown: { min: 1, max: 2 },
        persist: 4,
        event: patrolSteps,
      },
      {
        name: 'myModSupplyCache',
        image: cacheIcon,
        mapIconScale: 0.5,
        realm: 'meridianOpening',
        condition: 'realm >= meridianOpening',
        cooldown: { min: 1, max: 2 },
        persist: 4,
        event: cacheSteps,
      },
    ],
  };
}
```

Call `window.modAPI.actions.addLocation(withMapEncounters(myLocation, patrolIcon, patrolSteps, cacheIcon, cacheSteps))` with your definitions. This helper replaces the supplied location's map-event pool, so include every encounter you want in the returned array. Connect the location using [Connecting Locations](connecting-locations). As a design recommendation, supply more eligible encounters than active slots if you want the available choices to vary, and allow enough persistence for more than one scheduled spawn to coexist.

Follow [Packaging and Testing](../guides/packaging-testing) to load the mod. Test below and above the condition's realm threshold, advance calendar months to check spawn spacing and persistence, and confirm that the active count stays within `maxActive`. Select each marker and verify that its steps run and the marker disappears. Also test a false condition while its marker is active. To test individual cooldown scheduling, omit `mapEventSettings` and check that only one event is offered at a time.

### Gathering Event

```typescript
gatheringEvent?: LocationGatheringEvent;
```

A special event that fires when the player visits a location that currently has multiple named characters present. Use it to create social or atmospheric scenes, moments that emerge naturally from character congregation rather than from exploration or time.

```typescript
gatheringEvent: {
  steps: [
    {
      kind: 'text',
      text: 'The tavern is unusually crowded tonight...'
    },
    // ...more event steps
  ],
  triggerChance?: 0.3,              // Probability of firing (0 to 1, optional)
  resetMonths?: { min: 2, max: 6 }, // Cooldown before it can fire again (optional)
  minCharacters?: 3                 // Minimum characters present to trigger (default: 3)
}
```

The gathering event respects both the global encounter cooldown and a per-location gathering cooldown. It will not fire if fewer than minCharacters named characters are currently at this location (the default threshold is 3).

### Missions

```typescript
missions?: SectMission[];        // Sect mission board
crafting?: CraftingMission[];     // Crafting hall missions
```

Mission definitions for mission halls:
```typescript
missions: [
  {
    realm: 'bodyForging',
    rarity: 'mundane',
    quest: 'leachongCulling',
    condition: '1'
  }
]
```

### Reputation

```typescript
reputationName?: string;  // Reputation faction name
```

If defined, the location tracks player reputation for shops and other features.

### Exploration Override

```typescript
explorationCountOverride?: number;  // Custom exploration count
```

Override the default exploration requirement (normally 3 explorations per unlock).

## Complete Example

```typescript
export const liangTiaoVillage: GameLocation = {
  // Required fields
  name: 'Liang Tiao Village',
  description: 'A small village at the crux of two rivers...',
  image: villageBg,
  icon: villageIcon,
  screenEffect: 'rain',
  music: 'Liangtiao',
  ambience: 'Rain',
  position: { x: 2019, y: 406 },
  size: 'normal',

  // Connections
  unlocks: [
    {
      location: lingyuMoor,
      condition: 'moorUnlocked == 1',
      distance: 3
    }
  ],

  // Optional features
  reputationName: 'Liang Tiao Village',

  buildings: [
    { kind: 'healer' },
    { kind: 'crafting' },
    {
      kind: 'market',
      itemPool: emptyShopPool,
      costMultiplier: 1.7,
      refreshMonths: 3
    }
  ],

  missions: [
    {
      realm: 'bodyForging',
      rarity: 'qitouched',
      quest: 'clothingBlankDelivery',
      condition: '1'
    }
  ],

  gatheringEvent: {
    steps: [
      {
        kind: 'text',
        text: 'The village is busier than usual. Stalls have sprung up along the main road...'
      }
    ],
    resetMonths: { min: 3, max: 8 },
    minCharacters: 3
  }
};
```

## Registering Locations

Add locations to your mod using the global mod API:

```typescript
// Access the mod API via window.modAPI
window.modAPI.actions.addLocation(myCustomLocation);
```

The mod API is globally available through window.modAPI and provides access to all game data and actions for modifying the game.

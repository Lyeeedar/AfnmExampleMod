---
layout: default
title: Combat Images
parent: Combat System
nav_order: 4
description: "Visual representation system for buffs in combat"
---

# Combat Images

Buffs can display visual effects during combat through the `combatImage` property. These images provide visual feedback about active buffs and their intensity.

## Base Combat Image Properties

Choose a `combatImage.position` to suit the buff's role, then provide the fields for that position. The examples below are property blocks to place inside a [`Buff` definition](../combat/buffs). Asset names such as `sunIcon` stand for image imports from your mod. See [Changing artwork with another buff](#changing-artwork-with-another-buff) for a complete registration example.

The image-based positions below accept `image`, optional `animations` (`'buff'`, `'bump'`, `'attack'`, `'debuff'`) and optional `animateOnEntity`. Most also accept `imageOverrides` for stack thresholds. `baseStand` uses its own fields and does not accept `imageOverrides`. This page shows selected positions, rather than a complete shared interface. For a protective image between the holder and opponent, see the [shield example](battle-and-visual-apis#shield-combat-images).

## Position Types

### Floating

Use `floating` for an object above the holder's head. Choose `entrance: 'rotate'` or `'grow'` for its entrance animation.

```typescript
combatImage: {
  position: 'floating',
  image: sunIcon,
  entrance: 'rotate',     // How the image appears
  stacksScale: 0.15,              // Scale increase per stack
  zIndex: 1,                      // Stacking order; higher renders in front
  mergedImage: {                  // Special combined image
    image: eclipseIcon,
    otherBuff: 'Moonlight'
  }
}
```

**Example from Sunlight:**

```typescript
combatImage: {
  image: sunIcon,
  position: 'floating',
  entrance: 'rotate',
  stacksScale: 0.15
}
```

**Example from Moonlight (with merge):**

```typescript
combatImage: {
  image: moonIcon,
  position: 'floating',
  entrance: 'rotate',
  stacksScale: 0.15,
  mergedImage: {
    image: eclipseIcon,
    otherBuff: sunlight.name  // Shows eclipse when both exist
  }
}
```

### Overlay

Use `overlay` for artwork masked to the character. The example includes optional opacity, scale and scrolling settings. Set `scroll.direction` to `'up'` or `'down'`.

```typescript
combatImage: {
  position: 'overlay',
  image: overlayImage,
  baseOpacity: 0.3,          // Starting opacity
  stacksOpacity: 0.05,       // Opacity increase per stack
  baseScale: 1.0,            // Starting scale
  stacksScale: 0.1,          // Scale increase per stack
  scroll: {                  // Scrolling animation
    direction: 'up',
    duration: 2000,           // Animation duration in ms
    stacksSpeedUp: 0.1       // Speed increase per stack
  }
}
```

**Example from Flow:**

```typescript
combatImage: {
  position: 'overlay',
  image: overlayImage,
  baseOpacity: 0.6,
  stacksOpacity: 0.05
}
```

**Example from Moonchill:**

```typescript
combatImage: {
  position: 'overlay',
  image: moonchillOverlay,
  baseOpacity: 0.3,
  stacksOpacity: 0.05
}
```

### Arc

Images arranged in an arc pattern.

```typescript
combatImage: {
  position: 'arc',
  image: arcImage,
  showSingleInstance: true,   // Only show one regardless of stacks
  baseScale: 1.0,
  stacksScale: 0.1
}
```

### Scatter

Randomly positioned images above the character.

```typescript
combatImage: {
  position: 'scatter',
  image: scatterImage
}
```

### Companion

Images that act like combat companions, standing behind the character.

```typescript
combatImage: {
  position: 'companion',
  image: companionImage,
  scale: 1.0,
  stacksScale: 0.1
}
```

### Ground

Images that appear on the ground surface.

```typescript
combatImage: {
  position: 'ground',
  image: groundImage,
  scale: 1.0,
  stacksScale: 0.1
}
```

### Formation

Images arranged in formation patterns.

```typescript
combatImage: {
  position: 'formation',
  image: formationImage,
  scale: 1.0,
  showSingleInstance: true
}
```

### Base Stand

Images that replace the dark blurred disc the avatar stands on during combat. Only the last active baseStand buff applies. When a new one is applied, it replaces the previous stand image, following the same priority rule as `transformation` and `avatarEffect`.

```typescript
combatImage: {
  position: 'baseStand',
  image: standImage,            // The image rendered as the stand
  opacity: 1.0,                // Opacity of the stand image (default: 1)
  animations: ['buff'],
  animateOnEntity: true,
}
```

**Example -- a field of flowers as the avatar stand:**

```typescript
combatImage: {
  position: 'baseStand',
  image: flowerFieldImage,
  opacity: 0.9,
}
```

## Advanced Features

### Image Overrides

Display different images based on stack count:

```typescript
combatImage: {
  position: 'floating',
  image: baseImage,
  imageOverrides: [
    { stacks: 5, image: tier1Image },
    { stacks: 10, image: tier2Image },
    { stacks: 20, image: maxImage }
  ]
}
```

### Changing Artwork with Another Buff

Use `Buff.combatImageByBuff` when a resource or summoned object's appearance should show that a separate empowering buff is active. Set `buff` to that buff's exact `name`, including spaces and capitalization. A match requires a positive stack count on the same owner. It does not match a `buffType` or flag, and it does not check the opponent.

Keep a default `combatImage` on the displayed buff. Put a complete position configuration in `combatImageByBuff.image`, rather than only an image path. While the named buff is active, this configuration takes priority over both `combatImageByState` and the default image. When the named buff is absent, selection falls back to state-based artwork if configured, then the default. This option changes appearance only. Define any mechanical empowerment separately through [buff effects](buffs).

To make a floating resource visibly respond to an empowering buff:

1. Import the normal and empowered art into your mod content module. Use the same position and similar image dimensions for both to keep the resource recognizable.
2. Define the empowering buff and the resource buff. Point the resource's `combatImageByBuff.buff` at the empowering buff's name.
3. Apply each buff through a technique's `buffSelf` effect and register the techniques with [`actions.addTechnique`](../concepts/modapi#cultivation-content). Buffs are attached to the technique definitions here and need no separate registration call.

This example assumes you add `orb.png` and `orb-charged.png` to `src/assets/` in the example mod. Place the code in `src/modContent/index.ts`, which the mod entry imports:

```typescript
import type { Buff, Technique } from 'afnm-types';
import orbImage from '../assets/orb.png';
import chargedOrbImage from '../assets/orb-charged.png';

const charge: Buff = {
  name: 'Example Orb Charge',
  icon: chargedOrbImage,
  canStack: false,
  stacks: 1,
  stats: undefined,
};

const orb: Buff = {
  name: 'Example Orb',
  icon: orbImage,
  canStack: false,
  stacks: 1,
  stats: undefined,
  combatImage: {
    position: 'floating',
    image: orbImage,
    entrance: 'grow',
  },
  combatImageByBuff: {
    buff: charge.name,
    image: {
      position: 'floating',
      image: chargedOrbImage,
      entrance: 'grow',
    },
  },
};

const summonOrb: Technique = {
  name: 'Example Summon Orb',
  icon: orbImage,
  type: 'celestial',
  realm: 'bodyForging',
  effects: [
    { kind: 'buffSelf', buff: orb, amount: { value: 1, stat: undefined } },
  ],
};

const chargeOrb: Technique = {
  name: 'Example Charge Orb',
  icon: chargedOrbImage,
  type: 'celestial',
  realm: 'bodyForging',
  effects: [
    { kind: 'buffSelf', buff: charge, amount: { value: 1, stat: undefined } },
  ],
};

window.modAPI.actions.addTechnique(summonOrb);
window.modAPI.actions.addTechnique(chargeOrb);
```

For a visual test, use these techniques in a test enemy's stance in the order `summonOrb`, then `chargeOrb`, following [stance setup and encounter registration](techniques#stances-and-styles). Confirm the orb starts with the normal artwork and changes after the charge is applied. Also test the reverse order, since the alternate image should work when the charge already exists before the orb is created. Add a test technique with a `consumeSelf` effect for `charge` and `amount: { value: 1, stat: undefined }`, then verify that consuming the charge restores the normal image. These example buffs deliberately have no stat effects, so the test isolates artwork selection.

### Merge Images

Show special combined visuals when multiple buffs are present:

```typescript
combatImage: {
  position: 'floating',
  image: moonIcon,
  mergedImage: {
    image: eclipseIcon,
    otherBuff: 'Sunlight'  // When both Moonlight and Sunlight exist
  }
}
```

## Scaling Mechanics

### Stack-Based Scaling

Many images scale their visual properties based on stack count:

- **`stacksScale`** - Size increase per stack
- **`stacksOpacity`** - Opacity increase per stack
- **`stacksSpeedUp`** - Animation speed increase per stack

### Base Properties

Set the baseline visual properties:

- **`baseScale`** - Starting size
- **`baseOpacity`** - Starting opacity
- **`scale`** - Fixed size (does not change with stacks)

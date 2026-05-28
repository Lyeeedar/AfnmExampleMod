---
layout: default
title: Player Sprites
parent: Characters
nav_order: 5
description: 'Adding custom player sprites for character creation'
---

# Player Sprites

Custom player sprites allow modders to add new character appearance options that appear in the character creation screen alongside the built-in sprites.

## Registering a Sprite

Use `window.modAPI.actions.addPlayerSprite` to register a custom sprite:

```typescript
window.modAPI.actions.addPlayerSprite(sprite: PlayerSprite)
```

## PlayerSprite Interface

```typescript
interface PlayerSprite {
  /** Unique identifier for this sprite */
  id: string;
  /** Display name shown in character creation */
  name: string;
  /** Which gender this sprite is available for: 'male', 'female', or 'both' */
  gender: Sex | 'both';
  /** The sprite images for different poses and situations */
  sprites: PlayerSpriteImages;
}
```

## PlayerSpriteImages Interface

```typescript
interface PlayerSpriteImages {
  /** Base/idle image shown in most UI contexts */
  base: string;
  /** Image shown when using aggressive stance techniques */
  aggressive: string;
  /** Image shown when using defensive stance techniques */
  defensive: string;
  /** Image shown when the player is hit */
  hit: string;
  /** Image shown when using offensive stance techniques */
  offensive: string;
  /** Image shown when using support stance techniques */
  support: string;
  /** Image shown when using utility stance techniques */
  utility: string;
  /** Image shown during crafting support technique (optional) */
  craftingSupport?: string;
  /** Image shown during crafting stabilize technique (optional) */
  craftingStabilize?: string;
  /** Image shown during crafting refine technique (optional) */
  craftingRefine?: string;
  /** Image shown during crafting fusion technique (optional) */
  craftingFusion?: string;
}
```

All fields are required except the four `crafting*` fields, which default to the combat sprite for their stance if omitted.

## Example

```typescript
import { PlayerSprite } from 'afnm-types';

const mySprite: PlayerSprite = {
  id: 'myCultivator',
  name: 'My Custom Cultivator',
  gender: 'male',
  sprites: {
    base: myBaseImage,
    aggressive: myAggressiveImage,
    defensive: myDefensiveImage,
    hit: myHitImage,
    offensive: myOffensiveImage,
    support: mySupportImage,
    utility: myUtilityImage,
    craftingSupport: myCraftSupportImage,
    craftingStabilize: myCraftStabilizeImage,
    craftingRefine: myCraftRefineImage,
    craftingFusion: myCraftFusionImage,
  }
};

window.modAPI.actions.addPlayerSprite(mySprite);
```

## Image Requirements

Images should be provided as base64-encoded data URLs or asset paths accessible at runtime. Recommended formats: WebP or PNG with transparency. The game will handle scaling and cropping for different contexts (combat poses, UI portraits, crafting stance icons).

## Gender Availability

Set `gender` to `'male'`, `'female'`, or `'both'` to control which character creation screens the sprite appears on. Sprites registered with `'both'` appear for all players regardless of gender selection.

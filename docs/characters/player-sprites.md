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
window.modAPI.actions.addPlayerSprite(mySprite);
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
  /** Preferred unified pose pack, with optional conditional variants */
  image?: EntityImage;
  /** @deprecated Use image instead */
  sprites?: PlayerSpriteImages;
  /** @deprecated Use image.variants instead */
  variants?: PlayerSpriteVariant[];
}
```

## Unified Image Packs

For new sprites, use `image: EntityImage`. Its base pose key is `idle`, and all pose fields are optional. The pack also accepts per-pose scale/offset fields and `variants: ImagePack[]`.

Variants are evaluated in order; the first non-zero or empty `condition` wins. Missing poses inherit from the base pack. Combat and crafting variants can use live variables such as `hp`, `maxhp`, `pool`, and `stability`, as well as game flags.

To correct the facing of a pose set in combat and events, set `flipX: true` on your registered sprite's `image`. This mirrors the pose pack horizontally, including poses filled by fallback. Omit the field to keep the art's original orientation. A matching variant inherits the base setting unless it supplies its own `flipX`. For example, with `image.flipX: true`, set `flipX: false` on a variant whose art already faces the intended direction. Select the sprite and check both packs in combat if your variant changes the facing.

## Give a Player Sprite a Dual Cultivation Pose

Set `image.dualCultivationImageOverrides` on the registered sprite to change its art during dual cultivation. Each entry can set an idle `image`, a `condition` evaluated against game flags and session values, and an exact `lastUsedTechnique` name. Omitting a selector leaves it unrestricted. The last entry that meets both selectors wins, so put broad matches first and more specific ones later. The active pose pack's `idle` fills in when the winning entry has no `image` or no entry matches.

For a temporary pose when a technique applies satisfaction or pain, set `givingImages.satisfaction` or `givingImages.pain` on the same entry. Pain takes precedence when both occur together. If the winning entry has no art for the chosen reaction, the idle pose stays visible. A matching `image.variants` entry inherits the base override list when it omits the field and replaces the whole list when it supplies one.

## Legacy PlayerSpriteImages Interface

`sprites` and the top-level `variants` field remain available for backwards compatibility. Use `image` and `image.variants` for new work.

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
  image: {
    idle: myBaseImage,
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
    dualCultivationImageOverrides: [
      { condition: 'energy < maxEnergy * 0.25', image: myTiredImage },
    ],
    variants: [
      { title: 'Wounded', condition: 'hp < maxhp * 0.5', idle: myHitImage },
    ],
  }
};

window.modAPI.actions.addPlayerSprite(mySprite);
```

In this example, the selected sprite switches to `myTiredImage` while remaining energy is below one quarter of the session maximum. Package that image alongside the other poses. Select the sprite in character creation, enter a dual cultivation session, and check the pose on both sides of the threshold. Adjust the fraction to change when the pose appears. See [Relationship System](relationship-system.md) for configuring the partner relationship that offers the session.

## Image Requirements

Images should be provided as base64-encoded data URLs or asset paths accessible at runtime. Recommended formats: WebP or PNG with transparency. The game will handle scaling and cropping for different contexts (combat poses, UI portraits, crafting stance icons).

## Gender Availability

Set `gender` to `'male'`, `'female'`, or `'both'` to control which character creation screens the sprite appears on. Sprites registered with `'both'` appear for all players regardless of gender selection.

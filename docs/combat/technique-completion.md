---
layout: default
title: Technique Completion Reactions
parent: Combat System
nav_order: 8
---

# Reward a technique after it resolves

Give a build a reason to use techniques from a particular school by applying a buff that reacts to `technique.complete`. For example, let Cloud techniques heal the fighter while a stance setup buff is active. Completion timing lets the triggering technique resolve its own effects before the heal occurs.

On your [buff](buffs.md), add an entry to [`triggeredBuffEffects`](triggers.md#triggeredbuffeffects). Put the school condition on the effect you want to restrict. This fragment is a property of the buff definition.

```typescript
triggeredBuffEffects: [
  {
    trigger: 'technique.complete',
    effects: [
      {
        kind: 'heal',
        condition: { kind: 'condition', condition: 'school_cloud > 0' },
        amount: { value: 10, stat: 'power' },
      },
    ],
  },
],
```

The reaction runs when the holder finishes resolving a technique and survives. In the effect condition, the matching school flags are `1` and the others are `0`. Use `school_blood`, `school_blossom`, `school_fist`, `school_cloud`, `school_weapon`, `school_celestial`, `school_none` for Neutral, or `school_origin` for Origin. A [hybrid technique](techniques.md#hybrid-techniques) sets each of its listed school flags. An Origin technique sets only `school_origin` for this trigger, so use `school_cloud > 0 || school_origin > 0` if both should qualify.

Apply the buff with a `buffSelf` effect on a [setup technique](techniques.md#complete-examples). Register that technique with [`window.modAPI.actions.addTechnique`](../concepts/modapi.md#cultivation-content) and give the test character access to it through a [manual](../items/item-types/miscellaneous.md#manual-items). A qualifying setup technique can trigger the buff it just applied. Use a Neutral setup technique if you want the first heal to require a follow-up attack.

Test while the character is missing health. With the buff active, run a Cloud technique, a technique without Cloud, and a Cloud hybrid. Check the combat log for a heal after the Cloud and hybrid techniques resolve. Give the buff a limited lifetime if you want the build to periodically spend a technique slot refreshing it.

---
layout: default
title: Crafting Auto-Use System
parent: Crafting System
nav_order: 4
description: 'Author crafting consumables for player-configured auto-use'
---

# Crafting Auto-Use System

To provide a crafting aid that players can consume automatically, author a crafting pill or reagent and register it as an item. Choose the item kind for the role you want: reagents are available only at the first step of a craft, while crafting pills can support the player throughout the craft. Players configure when to consume owned items through their auto-use rules.

## Define and Distribute the Item

1. For a repeatable crafting aid, define a `CraftingPillItem` with `kind: 'pill'` and `pillKind: 'crafting'`. Use the [crafting pill interface](../items/item-types/pill.md#crafting-pills) for its fields.
2. For an opening preparation, define a `CraftingReagentItem` with `kind: 'reagent'`. Along with the common item fields, supply `toxicity: number` and `effects: CraftingTechniqueEffect[]`. Both item types use crafting effects, rather than combat effects.
3. Choose effects for a concrete role. A `pool` effect can restore Qi for later techniques. A `createBuff` effect can prepare a temporary bonus. See [crafting techniques](techniques.md) for effect examples, [buffs](buffs.md) for buff definitions, and [scaling](../concepts/scaling.md) for amount configuration.
4. Register the complete definition with `window.modAPI.actions.addItem(myCraftingAid)` in a content module imported by your mod entry point. Give the player a supported acquisition route, such as [shop stock](../items/advanced-integration.md#basic-shop-addition) or a [recipe](recipes.md).

Treat `toxicity` as part of the item's design budget. Effective toxicity also depends on the consuming character. Automatic consumption must fit the remaining toxicity capacity and the character's per-round item-use allowance, so a large restorative effect with a high toxicity cost may be less repeatable than a small one. A nonstacking buff that is already active can also prevent automatic reuse.

## Test Consumption

Load your mod using the [packaging and testing guide](../guides/packaging-testing.md), obtain the item through its acquisition route, and add it to a crafting auto-use rule. For a reagent, test the intended benefit at the opening step. For a pill, test after spending the resource it restores or after its buff expires. Check the crafting log, inventory consumption, effect and toxicity gain.

Test with representative crafting equipment and enough copies for repeated use. If an item does not fire, check the player's rule, remaining inventory, toxicity capacity, item-use allowance and existing buff before changing its effect amounts. Keep the mod's authoring work in the registered item definition and its acquisition route.

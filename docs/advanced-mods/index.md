---
layout: default
title: Advanced mods
nav_order: 11
has_children: true
description: 'Documentation for the advanced features of the Mod API'
---

# Advanced Modding

Beyond content addition / modification, a variety of more advanced hooks have been provided to allow a mod to edit fundamental features of how Afnm works.

- [Lifecycle Hooks](lifecycle-hooks) — intercept combat, crafting, events, loot, and more
- [Adding Screens](adding-screens) — create full custom UI screens and persistent overlays
- [Harmony Type Docs](harmony-type-docs) — define custom crafting harmony types
- [External Network Requests](networking) — fetch data from remote APIs and servers
- [Translation](translation) — localise your mod content
- [Best Practices](best-practices) — defensive coding, debug APIs, and mod architecture patterns

## Customize the Spatial Ring

Use `window.modAPI.hooks.onItemAction(kind, interceptor)` when the standard inventory layout works for your mod and you want to add or change actions for an item kind. For event actions specific to an item you own, use the item's [`actions` field](../items/item-structure.md) instead.

The interceptor receives the current `InventoryActionGroup[]` and the resolved `Item`. Return the groups to display. The game starts with the combined native and item-defined actions and runs matching hooks in registration order, passing each result to the next hook. Keep groups you want to preserve and return the input for items your mod leaves alone. A group needs an `id` and a `buttons` array. A button needs a `label` and an `onClick` callback. Set `disabled` when your action is unavailable. The hook can run while the inventory is determining which actions to show, so put side effects in the click callback and check your own action's prerequisites there.

For a different layout, register a React component with `window.modAPI.ui.overrideInventory({ component, contexts, priority })`. It replaces the contents of the dialog and keeps the game's dialog controls. Use `contexts: ['player']` for the player's ring, `['event']` for the ring opened during an event, or omit `contexts` to cover both. The highest priority matching registration wins. Priority defaults to zero and ties favor the first registration. A render error restores the native inventory. Both registration calls return a function that removes that registration.

Inside the replacement component, use the supplied `screenAPI` to keep native item behavior. A row can call `screenAPI.actions.inspectItem(item)` to open the native action panel for an owned `ItemDesc`. It returns `false` when the panel cannot open for that item. For inline controls, call `screenAPI.useItemActions(item)` during render and pass its current `groups` to `screenAPI.components.InventoryActions`. A stack that has left the ring yields an empty group list. Use the live groups so action availability stays current and the game's follow-up dialogs still open.

For example, register a component that shows native controls inline for a single owned item variant:

```tsx
window.modAPI.ui.overrideInventory({
  contexts: ['player'],
  component: function WorkshopRing({ screenAPI }) {
    const { groups } = screenAPI.useItemActions({ name: 'Workshop Study Pill' });
    return <screenAPI.components.InventoryActions groups={groups} />;
  },
});
```

Use the name of a registered item for a simple stack, or pass the owned variant's descriptor when your layout offers several variants. To test this focused layout, open the player's ring with the named pill in inventory, try its native action, and check that the controls disappear when the last pill is used. Open the ring from an event to check the chosen context. See [Adding Screens](adding-screens.md) for React and TSX setup.

---
layout: default
title: Quest Examples
parent: Quest System
nav_order: 4
description: 'Register and start a side quest from a location event'
---

# Quest Examples

## Offer a one-time quest at a location

Use a [triggered event](../events/triggered-events.md) to offer a quest when the player visits a location. Register the [quest definition](quest-structure.md) with `addQuest`, then reference its exact `name` in the offer's [Add Quest step](../events/steps/addquest.md). Use a unique global flag to keep the offer closed after it runs.

Use an [event objective](quest-steps.md#event-quest-step) when the player should open a separate scene from the location. Without a `completionCondition`, finishing the scene completes the objective. For a directly granted side quest, put any payout in the scene itself and list the same reward in `rewards` for the [preview](quest-structure.md#reward-system).

Put this in a content module imported by your mod entry point. The example uses Liang Tiao Village, so you can test it on a save with access to that location.

```typescript
import type { Quest, TriggeredEvent } from 'afnm-types';

const location = 'Liang Tiao Village';
const offeredFlag = 'exampleCourierOfferReceived';
const payment = 20;

const quest: Quest = {
  name: 'exampleModCourierPayment',
  displayName: 'Courier Payment',
  description: 'Collect your courier payment in Liang Tiao Village.',
  category: 'side',
  steps: [
    {
      kind: 'event',
      hint: 'Open Courier Payment in Liang Tiao Village.',
      event: {
        location,
        steps: [{ kind: 'money', amount: String(payment) }],
      },
    },
  ],
  rewards: [{ kind: 'money', amount: payment }],
};

const offer: TriggeredEvent = {
  name: 'exampleModCourierOffer',
  trigger: `${offeredFlag} == 0`,
  screens: ['location'],
  locations: [location],
  event: {
    location,
    steps: [
      { kind: 'quest', quest: quest.name },
      { kind: 'flag', flag: offeredFlag, value: '1', global: true },
    ],
  },
};

window.modAPI.actions.addQuest(quest);
window.modAPI.actions.addTriggeredEvent(offer);
```

Visit the village on a test save where the offer flag is unset. Finish the offer and check that the quest appears in the log. Then open **Courier Payment** at the village and finish the scene. The quest should complete and grant 20 Spirit Stones. Leave and return to verify that the offer stays closed.

For a quest that sends the player elsewhere, keep the offer's location and set the objective's `event.location` to the destination. Update the hint to match. Adjust `payment` to change both the preview and the payout.

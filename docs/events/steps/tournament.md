---
layout: default
title: Tournament Step
parent: Event Step Types
grand_parent: Events System
nav_order: 25
description: 'Register tournament configurations and launch bracket competitions'
---

# Tournament Step

A tournament event launches a registered `TournamentConfig` by its `id`. Register the configuration during mod initialization, then use a `TournamentStep` to select the event's consequences. Opponents, bracket size, rewards, and commentary belong to the configuration.

## Event Step

```typescript
interface TournamentStep {
  kind: 'tournament';
  condition?: string;
  tournamentId: string;
  victory: EventStep[];
  secondPlace?: EventStep[];
  defeat: EventStep[];
  placementBranches?: TournamentPlacementBranch[];
}

interface TournamentPlacementBranch {
  placementMin: number;
  steps: EventStep[];
}
```

`tournamentId` must match a configuration registered with `window.modAPI.actions.addTournamentConfig`. `victory`, `secondPlace`, and `defeat` run according to the player's final result. An additional `placementBranches` entry can provide rank-based consequences; the narrowest qualifying cutoff wins.

## Registering a Tournament

The roster is a function returning authored `EnemyEntity` objects. Choose a realm matching those enemies. The competitors below are enemies defined elsewhere in your mod; import them before using this example.

```typescript
import { TournamentConfig, TournamentStep } from 'afnm-types';

const harvestTournament: TournamentConfig = {
  id: 'myMod_harvestTournament',
  title: 'Village Harvest Tournament',
  realm: 'bodyForging',
  entrantCount: 8,
  roster: () => [villageChampion, travelingMartialArtist, youngProdigy, veteranFighter],
  participantBuffs: [],
  rewards: [
    { placementMin: 1, money: 5000, items: [{ name: 'Village Champion Medal' }] },
    { placementMin: 2, money: 2000, items: [] },
    { placementMin: 8, money: 500, items: [] },
  ],
};

window.modAPI.actions.addTournamentConfig(harvestTournament);

const harvestTournamentStep: TournamentStep = {
  kind: 'tournament',
  tournamentId: harvestTournament.id,
  victory: [{ kind: 'text', text: 'The crowd cheers for the new village champion!' }],
  secondPlace: [{ kind: 'text', text: 'You earn the respect of the village.' }],
  defeat: [{ kind: 'text', text: 'The competition gives you valuable experience.' }],
};
```

Register every item named in the reward ladder before the tournament runs. The ladder pays cumulatively: the champion receives the top-eight, top-two, and champion tiers. Avoid also paying those rewards in the event branches unless you intend an additional reward.

## Configuration Options

Use the exported `TournamentConfig` from `afnm-types` as the authoritative interface. Its required fields are `id`, `title`, `realm`, `roster`, and `participantBuffs`.

| Field | Purpose |
| --- | --- |
| `entrantCount` | Total bracket size, including the player. Set it explicitly for a small tournament; the default is 64. |
| `rosterOnly` | Use the saved roster without filling vacancies with anonymous fighters. |
| `participantCharacters` | Conditional entries for named NPCs. |
| `participantBuffs` | Buffs applied to tournament participants. |
| `guaranteedWinner` | An authored winner override. |
| `entryFee` | Amount displayed as the registration fee. Deduct it in the entry event. |
| `rewards` | Cumulative placement rewards; each tier requires an `items` array, which may be empty. |
| `announcerIntro` | Conditional opening credentials and optional flavour lines. |
| `announcerCharacter` | Named NPC providing commentary. |
| `announcerChatter` | Replacement announcer line pools. |
| `crowdChatter` | Additional occasion-specific crowd lines. |
| `roundKinds` | `'combat'`, `'crafting'`, or an array assigning the kind for each round. |
| `randomThirdPlace` | Randomly assign third and fourth places to the losing semifinalists. |

## Conditional Entry and Commentary

Assume `arenaCompetitors` contains the enemies defined by your mod:

```typescript
const arenaTournament: TournamentConfig = {
  id: 'myMod_arenaOpen',
  title: 'Shen Henda Arena Open',
  realm: 'coreFormation',
  entrantCount: 8,
  roster: () => arenaCompetitors,
  participantBuffs: [],
  entryFee: 500,
  announcerIntro: {
    credentials: [
      {
        condition: 'myMod_arenaWins >= 3',
        countFlag: 'myMod_arenaWins',
        lines: ['{player} returns with {n} prior victories!'],
      },
      { condition: '1', lines: ['A new challenger enters the arena!'] },
    ],
  },
  rewards: [
    { placementMin: 1, money: 5000, items: [] },
    { placementMin: 8, items: [{ name: 'Participation Ribbon' }] },
  ],
};

window.modAPI.actions.addTournamentConfig(arenaTournament);

const arenaEntry: EventStep = {
  kind: 'choice',
  choices: [{
    text: 'Enter the tournament (500 spirit stones)',
    condition: { kind: 'money', amount: 500 },
    children: [
      { kind: 'money', amount: '-500' },
      {
        kind: 'tournament',
        tournamentId: arenaTournament.id,
        victory: [{ kind: 'flag', flag: 'myMod_arenaWins', value: 'myMod_arenaWins + 1', global: true }],
        defeat: [{ kind: 'text', text: 'You are eliminated from the tournament.' }],
      },
    ],
  }],
};
```

The `entryFee` metadata describes the fee; the `money` event step above performs the deduction. Keep the displayed fee, choice requirement, and deduction consistent.

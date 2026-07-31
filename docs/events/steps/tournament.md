---
layout: default
title: Tournament Step
parent: Event Step Types
grand_parent: Events System
nav_order: 25
description: 'Create multi-round tournament competitions with bracket-style progression'
---

# Tournament Step

## Introduction

The Tournament Step creates structured competitive events where the player participates in bracket-style tournaments against multiple opponents. Tournaments are ideal for festival events, sect competitions, and major story milestones that showcase the player's growing cultivation prowess.

The system automatically manages tournament bracket progression, opponent selection from participant pools, and handles victory/defeat outcomes at different stages including first place, second place, and elimination scenarios.

## Supporting Types

### TournamentRewardTier

Describes one rung of a tournament's placement-reward ladder. Tiers are cumulative: a champion (rank 1) collects every tier.

```typescript
interface TournamentRewardTier {
  /** Best final rank still awarded this tier (e.g. 8 = top eight, 1 = champion only). */
  placementMin: number;
  /** Spirit stones awarded. */
  money?: number;
  /** Items awarded; each entry's `stacks` is the quantity (defaults to 1). */
  items: ItemDesc[];
}
```

### TournamentIntroEntry

One conditional announcer line for a tournament's opening. The `condition` is a flag expression evaluated the same way event `condition`s are.

```typescript
interface TournamentIntroEntry {
  /** Flag expression; the entry applies when it evaluates truthy. */
  condition: string;
  /** A few announcer variants; one is picked. `{player}` and `{n}` fill at play time. */
  lines: string[];
  /** Optional flag whose value fills `{n}` in the lines (e.g. a win count). */
  countFlag?: string;
}
```

### TournamentIntro

A tournament's announcer opening: the strongest matching credential, then an optional flavour line.

```typescript
interface TournamentIntro {
  /** Credentials, most impressive first; the first whose condition holds is spoken. */
  credentials: TournamentIntroEntry[];
  /** Optional flavour (e.g. how far under the field's realm), spoken after the credential. */
  flavour?: TournamentIntroEntry[];
}
```

### TournamentCrowdChatter

Extra crowd chatter for one tournament, mixed into the shared pools rather than replacing them. Each field feeds the pool of the same name.

```typescript
interface TournamentCrowdChatter {
  /** Idle gossip with no fighter named. */
  generic?: string[];
  /** Idle gossip naming a live fighter, via `{fighter}`. */
  fighter?: string[];
  /** Short shouts answering an announcer call. */
  hype?: string[];
  /** Idle gossip once the field is down to four. */
  semi?: string[];
  /** Idle gossip once the field is down to two. */
  final?: string[];
  /** Idle gossip once a champion is crowned, via `{champion}`. */
  champion?: string[];
}
```

## Interface

```typescript
interface TournamentStep {
  kind: 'tournament';
  condition?: string;
  title: string;
  participantPool: EnemyEntity[];
  participantCharacters?: string[];
  participantBuffs: Buff[];
  guaranteedWinner?: string;
  victory: EventStep[];
  secondPlace?: EventStep[];
  defeat: EventStep[];
  /** The announcer's opening credentials for this tournament, reacting to the player's record. */
  announcerIntro?: TournamentIntro;
  /**
   * Stable, non-translated key identifying this tournament. Harvested player
   * builds are stored and looked up under it.
   */
  tournamentKey?: string;
  /**
   * Spirit stones this tournament charged at the registration booth, matching the `money` step
   * the entry choice deducts. The prize displays read purses against it, so a haul shows as a
   * multiple of what the player paid to walk in. Omitted where entry is free (story bouts).
   */
  entryFee?: number;
  /** Placement-reward ladder for this tournament (paid cumulatively by final placement). */
  rewards?: TournamentRewardTier[];
  /** Occasion-specific crowd lines, mixed into the shared chatter pools. */
  crowdChatter?: TournamentCrowdChatter;
}
```

## Properties

### Required Properties

**`kind`** - Always `'tournament'`

- Identifies this as a tournament competition step

**`title`** - Tournament display name

- String shown to players during the tournament
- Should be descriptive and thematic
- Examples: "Ying Meihua Festival Tournament", "Sect Ranking Competition"

**`participantPool`** - Array of possible opponents

- Pool of `EnemyEntity` objects representing potential tournament participants
- System randomly selects 7 opponents from this pool for an 8-person bracket
- Can include duplicates if pool is smaller than needed

**`participantBuffs`** - Buffs applied during tournament

- Array of `Buff` objects applied to the player during all tournament fights
- Often used to restrict technique schools or provide thematic bonuses
- Applied automatically when tournament begins, removed when finished

**`victory`** - Steps for winning the tournament

- Event steps executed when player wins first place
- Typically includes rewards, reputation gains, and celebration narrative
- Should provide meaningful recognition for the achievement

**`defeat`** - Steps for elimination

- Event steps executed when player is eliminated before the finals
- Usually consolation narrative and minor rewards for participation
- Helps maintain positive player experience even in defeat

### Optional Properties

**`condition`** - Conditional execution

- [Flag expression](../../concepts/flags) that must be true for tournament to occur
- Tournament is skipped if condition fails
- Useful for one-time events or progression gates

**`participantCharacters`** - Named character participants

- Array of character names to include as tournament opponents
- These characters are converted to `EnemyEntity` objects and added to the participant pool
- Useful for story-driven tournaments featuring specific rivals or allies

**`guaranteedWinner`** - Character guaranteed to reach finals

- Name of a character who will always advance to face the player in the finals
- Must be present in either `participantPool` or `participantCharacters`
- Creates dramatic final confrontations with specific story characters

**`secondPlace`** - Steps for reaching finals but losing

- Event steps executed when player reaches the final match but loses
- Provides distinct narrative and rewards for getting second place
- If not specified, `defeat` steps are used for final match losses

**`announcerIntro`** - Announcer opening

- `TournamentIntro` describing the announcer's credential lines and optional flavour
- Each `credentials` entry's `condition` is evaluated as a flag expression; the first match is spoken
- The `{player}` placeholder fills with the player's name at play time
- Use `countFlag` to fill `{n}` in lines with a flag value (e.g. a win count)

**`tournamentKey`** - Stable tournament identifier

- Non-translated string key identifying this tournament
- Player builds harvested by the system are stored and looked up under this key
- Omit for one-off story tournaments where build storage is not needed

**`entryFee`** - Registration cost

- Spirit stones deducted at the registration choice
- The prize display reads winnings as a multiple of this fee
- Omit for free-entry story bouts

**`rewards`** - Placement-reward ladder

- Array of `TournamentRewardTier` sorted by decreasing `placementMin`
- Each tier is awarded cumulatively by final placement: rank 1 gets every tier
- `placementMin` is the best rank that still earns that tier (e.g. 8 = top 8, 1 = champion only)
- `money` and `items` fields on each tier specify the payout for that tier

**`crowdChatter`** - Occasion-specific crowd lines

- `TournamentCrowdChatter` mixed into the shared crowd line pools
- Each populated field adds to the pool of the same name (`generic`, `fighter`, `hype`, `semi`, `final`, `champion`)
- Template placeholders `{fighter}` and `{champion}` fill with fighter/champion names at play time

## Basic Examples

### Simple Festival Tournament

```typescript
{
  kind: 'tournament',
  title: 'Village Harvest Tournament',
  participantPool: [
    // Array of EnemyEntity objects representing local competitors
    villageChampion,
    travelingMartialArtist,
    youngProdigy,
    veteranFighter
  ],
  participantBuffs: [
    {
      name: 'Tournament Rules',
      icon: 'tournament_icon',
      canStack: false,
      stats: {
        weaponDisabled: { value: 1, stat: undefined }
      },
      onRoundEffects: [],
      stacks: 1
    }
  ],
  victory: [
    {
      kind: 'text',
      text: 'The crowd erupts in cheers as you claim victory! You have proven yourself the strongest warrior in the village.'
    },
    {
      kind: 'money',
      amount: '5000'
    },
    {
      kind: 'addItem',
      item: { name: 'Village Champion Medal' },
      amount: '1'
    }
  ],
  defeat: [
    {
      kind: 'text',
      text: 'Though you fought valiantly, you were eliminated from the tournament. The experience has taught you much about combat.'
    },
    {
      kind: 'money',
      amount: '500'
    }
  ]
}
```

### Sect Ranking Tournament

```typescript
{
  kind: 'tournament',
  title: 'Inner Sect Ranking Competition',
  participantPool: innerSectDisciples,
  participantBuffs: [],
  victory: [
    {
      kind: 'text',
      text: 'Your mastery has been acknowledged by all. You now stand at the pinnacle of the inner sect disciples.'
    },
    {
      kind: 'changeReputation',
      name: 'Sect Standing',
      amount: '3'
    },
    {
      kind: 'addItem',
      item: { name: 'Inner Sect Champion Robes' },
      amount: '1'
    }
  ],
  secondPlace: [
    {
      kind: 'text',
      text: 'You fought admirably and reached the finals, earning the respect of your sect brothers and sisters.'
    },
    {
      kind: 'changeReputation',
      name: 'Sect Standing',
      amount: '2'
    }
  ],
  defeat: [
    {
      kind: 'text',
      text: 'The competition was fierce, but you gained valuable experience fighting against fellow disciples.'
    },
    {
      kind: 'changeReputation',
      name: 'Sect Standing',
      amount: '-1'
    }
  ]
}
```

### Tournament with Rewards and Announcer

```typescript
{
  kind: 'tournament',
  title: 'Shen Henda Arena Open',
  tournamentKey: 'shenHendaArenaOpen',
  entryFee: 500,
  announcerIntro: {
    credentials: [
      {
        condition: 'shenHendaArenaOpen_wins >= 3',
        lines: [
          '{player} returns to the Shen Henda Arena with {n} prior victories under their belt.',
        ],
        countFlag: 'shenHendaArenaOpen_wins',
      },
      {
        condition: 'realm >= coreFormation',
        lines: [
          'A Core Formation cultivator enters the arena. The field will have their hands full.',
        ],
      },
      {
        condition: 'true',
        lines: [
          'A new challenger steps into the Shen Henda Arena. Let the competition begin!',
        ],
      },
    ],
  },
  rewards: [
    { placementMin: 1, money: 5000, items: [{ name: 'Champion\'s Seal' }] },
    { placementMin: 2, money: 2000, items: [{ name: 'Finalist Medal' }] },
    { placementMin: 8, items: [{ name: 'Participation Ribbon' }] },
  ],
  participantPool: arenaCompetitors,
  participantBuffs: [],
  victory: [
    { kind: 'money', amount: '5000' },
    { kind: 'text', text: 'You are crowned Shen Henda Arena Champion!' },
  ],
  defeat: [
    { kind: 'money', amount: '500' },
    { kind: 'text', text: 'You were eliminated before the finals.' },
  ],
}
```

## Tournament Mechanics

### Bracket Structure

Tournaments in AFNM use an 8-person single-elimination bracket:

- 7 opponents selected from participant pool
- Player always participates as the 8th contestant
- 3 rounds: Quarterfinals → Semifinals → Finals
- Each round consists of 4 → 2 → 1 matches

### Opponent Selection

The system automatically handles opponent selection:

1. Randomly selects 7 unique opponents from the participant pool
2. If pool has fewer than 7 unique entities, can select duplicates
3. Characters from `participantCharacters` are converted to enemies and added
4. If `guaranteedWinner` is specified, they occupy one of the 7 slots

### Tournament Progression

- **Player wins match**: Advances to next round
- **Player loses match**: Tournament ends with `defeat` or `secondPlace` outcomes
- **Non-player matches**: Determined randomly, unless `guaranteedWinner` is involved

### Outcome Resolution

Tournament results trigger different event sequences:

- **Victory**: Player wins finals → `victory` steps
- **Second Place**: Player loses finals → `secondPlace` steps (if provided) or `defeat` steps
- **Elimination**: Player loses before finals → `defeat` steps

---

## Summary

The Tournament Step enables developers to create bracket-style competitions with three distinct outcomes: victory (first place), second place (reaching finals but losing), and defeat (elimination before finals). Key configuration options include:

- **`participantPool`** and **`participantCharacters`**: Define who competes
- **`guaranteedWinner`**: Ensures a specific character reaches the finals for dramatic confrontations
- **`participantBuffs`**: Apply modifiers during all tournament matches
- **`victory`**, **`secondPlace`**, and **`defeat`**: Define narrative and rewards for each outcome
- **`announcerIntro`**: Custom announcer opening lines reacting to the player's record
- **`entryFee`** and **`rewards`**: Configure paid entry and a cumulative reward ladder by placement
- **`crowdChatter`**: Add occasion-specific crowd lines to the shared pools
- **`tournamentKey`**: Stable key for storing harvested player builds across runs

The system handles bracket generation and progression automatically, requiring only the configuration of opponents and outcomes.

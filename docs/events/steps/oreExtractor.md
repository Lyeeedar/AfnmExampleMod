---
layout: default
title: Ore Extractor Step
parent: Event Step Types
grand_parent: Events System
nav_order: 999
description: 'Offer ore extractor installation in a mine vein chamber'
---

# Ore Extractor Step

Presents the player with a choice to install an ore extractor into a freshly reached vein chamber. The step defers to EventOreExtractorComponent, which reads the event's source location and chamber data to record the install in the mine state. Ore extractors automatically mine their vein each month, collected from the mine screen, without requiring the player to revisit the chamber.

## Interface

```typescript
interface OreExtractorStep extends BaseEventStep {
  kind: 'oreExtractor';
  /** Item name of the ore this vein yields (e.g. 'Spirit Iron Ore'). */
  ore: string;
  /** Realm of the vein. Only extractors at this realm tier or higher can be installed. */
  realm: Realm;
}
```

## Properties

**kind** - Always 'oreExtractor'

**ore** - Exact item name string for the ore this vein chamber produces. The game uses this to determine what is mined each month.

**realm** - The cultivation realm of the vein. Extractors crafted for realms below this tier cannot be installed. Extractors of the matching realm or any higher realm are valid choices. Realm tiers (lowest to highest): mundane, bodyForging, meridianOpening, qiCondensation, coreFormation, pillarCreation, lifeFlourishing, worldShaping, innerGenesis, soulAscension.

## How It Works

When the step executes:

1. The game identifies the current mine location and the vein chamber the player just reached.
2. EventOreExtractorComponent queries the player's inventory for all OreExtractorItem instances whose realm field is greater than or equal to the vein's realm.
3. The player is shown a choice dialog listing each compatible extractor (grouped by grade: base, +, and S) with its monthly extraction rate.
4. Selecting an extractor installs it into the chamber: from the next month onward, ore accumulates automatically each month at the extractor's extractionSpeed (fractional amounts accumulate over time).
5. The extractor is consumed from the player's inventory on install.

If no compatible extractor is in the player's inventory, the choice is disabled with a message prompting the player to craft or acquire one.

## Extraction Rates

Extraction speed = baseRate(realmIndex) x gradeMultiplier

| Grade | Rarity | Multiplier |
|-------|--------|------------|
| Base  | Resplendent | 1.0x |
| +     | Incandescent | 1.5x |
| S     | Transcendent | 2.0x |

baseRate(index) = Math.round((0.5 + 0.25 x max(0, index - 2)) x 100) / 100

| Vein Realm       | Index | Base Rate (ore/mo) | +   | S   |
|------------------|-------|--------------------|-----|-----|
| Body Forging     | 1     | 0                  | --  | --  |
| Meridian Opening | 2     | 0                  | --  | --  |
| Qi Condensation  | 3     | 0.50               | 0.75| 1.00|
| Core Formation   | 4     | 1.00               | 1.50| 2.00|
| Pillar Creation  | 5     | 1.25               | 1.88| 2.50|

Extractors cannot be installed into veins below Qi Condensation realm.

## Example

### Offer extractor installation in a Core Formation vein

```typescript
{
  kind: 'oreExtractor',
  ore: 'Spirit Iron Ore',
  realm: 'coreFormation'
}
```

The player will see any Body Forging, Meridian Opening, Qi Condensation, Core Formation, or higher realm extractors in their inventory as install options. Meridian Opening is the lowest realm that can be installed into a Core Formation vein.

### Install a rarer ore extractor in a high-realm vein

```typescript
{
  kind: 'oreExtractor',
  ore: 'Mystic Crystal Shard',
  realm: 'pillarCreation'
}
```

Only extractors at pillarCreation realm or higher can be installed here.

## Ore Extractor Items

Ore extractors are crafted items registered under the ore_extractor kind. They are not purchased from shops. Each extractor specifies:

```typescript
interface OreExtractorItem extends ItemBase {
  kind: 'ore_extractor';
  /** Ores mined per month once installed. May be fractional; amounts accumulate. */
  extractionSpeed: number;
}
```

The three standard grades are defined in src/data/items/oreExtractor/oreExtractors.ts:
- oreExtractorMap - Resplendent, base multiplier
- oreExtractorMapPlus - Incandescent, 1.5x multiplier
- oreExtractorMapS - Transcendent, 2.0x multiplier

See the Device Items documentation for the full interface and registration example.

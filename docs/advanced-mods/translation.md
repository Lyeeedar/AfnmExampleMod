---
layout: default
title: Translation
parent: Advanced mods
nav_order: 4
---

# Translations

The mod API also allows for providing custom translations for the game. This can override existing languages (merging the translations from the mod with the base game translations) or add new ones.

## Extracting Translations

### Base Game

To extract all the game text, open the game in dev mode. Then, from the debug menu select the 'Translations' menu. In this dialog, you can export the translation file of any language currently registered, or just a completely fresh file if desired.

### Mods

Translation extraction is built into the mod build pipeline. When you run `npm run build`, a `translations/template.json` file is automatically generated from your mod's source code before compilation. This template contains all translatable strings found in your mod (item names, descriptions, technique names, etc.).

You can also run extraction manually at any time:

```bash
npm run extract-translations
```

The generated `translations/template.json` is automatically included in your built mod zip, so localisers can find it alongside your `mod.js`.

### For localisers

1. Export the mod translations using the same flow as the base game translations.
2. Copy it to a new file named after the language code, e.g. `translations/ru.json`
3. Fill in the translated values for each key
4. Either submit back to the mod author, or publish your own mod that provides the translations exactly as you would for base game ones.

## Providing Translations

### Automatic (recommended)

Place completed translation files in the `translations/` folder with the language code as the filename (e.g., `translations/ru.json`, `translations/es.json`). These are automatically included in the mod zip during build.

At game load time, the game reads all translation files from every mod's `translations/` folder and merges them into the active language. Later mods in the load order override earlier ones.

No code changes are needed — just drop the JSON files in and build.

### Manual (via mod API)

For advanced use cases (e.g., dynamically choosing translations), you can register translations in code using `addTranslation`:

```typescript
import ruTranslations from './translations/ru.json';
api.addTranslation('ru', ruTranslations);
```

Translations registered via `addTranslation()` take priority over auto-loaded files, so manual registration can be used to override or supplement the auto-loaded translations.

### Re-extraction and migration

When you re-run extraction, any existing language files in `translations/` are automatically migrated to the new template structure, preserving previously completed translations.

## Using Translations in Code

The mod API exposes three translation utilities in `api.utils` for use in your mod's runtime code.

### `api.utils.t` — Translate a string

Translates a string or `TranslatableString` object to the currently active language. Use this inside event callbacks, hooks, or React components — anywhere the translation can be resolved at call time.

```typescript
// Simple string
const label = api.utils.t('Continue');

// With variable substitution
const msg = api.utils.t('You have {count} spirit stones', { count: player.money });

// With a disambiguation context
const text = api.utils.t('Strike', {}, 'combat.technique');
```

**Do not call `t()` at module load time** — the active language may not be set yet. Use `tr()` instead for data definitions that are evaluated before the UI renders.

### `api.utils.tPlural` — Plural-aware translation

Returns the singular or plural form depending on `count`. The plural form should include a `{count}` placeholder.

```typescript
const label = api.utils.tPlural(days, '1 day remaining', '{count} days remaining');
// count=1 → "1 day remaining"
// count=3 → "3 days remaining"

// With additional variables
const msg = api.utils.tPlural(items, '{count} item found in {location}', '{count} items found in {location}', { location: placeName });
```

### `api.utils.tr` — Deferred translation (for data definitions)

Creates a `TranslatableString` object that is resolved at render time, not at module load time. Use this when building data objects (items, techniques, event descriptions) so translations work correctly regardless of load order.

```typescript
const myItem: ItemDesc = {
  name: 'Spirit Core',
  description: api.utils.tr('A dense crystallisation of pure qi.'),
};

// With variable substitution resolved at render time
const myBuff: Buff = {
  name: api.utils.tr('Enhanced Meridians'),
  description: api.utils.tr('Increases qi capacity by {amount}%', { amount: 25 }),
};
```

The key difference: `t()` resolves immediately (use in callbacks and components); `tr()` defers resolution until the string is displayed (use in static data definitions).

## Utilities

To make it easier to manage the task of translation, a helper application has been built. You can find it here: [Community Translation App](https://drive.google.com/file/d/1j-IekRMLPPUYECiAHAMpZDnw1irqbxu0/view?usp=drive_link).

This lets you open a translations file exported from the debug menu and quickly browse and edit it.

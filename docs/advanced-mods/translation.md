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

## Utilities

To make it easier to manage the task of translation, a helper application has been built. You can find it here: [Community Translation App](https://drive.google.com/file/d/1j-IekRMLPPUYECiAHAMpZDnw1irqbxu0/view?usp=drive_link).

This lets you open a translations file exported from the debug menu and quickly browse and edit it.

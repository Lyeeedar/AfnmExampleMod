---
layout: default
title: Translation
parent: Advanced mods
nav_order: 4
---

# Translations

The mod API allows providing custom translations for the game. These can override existing languages (merging mod translations with base game translations) or add new ones entirely.

## Extracting Game Text

To extract the base game's text, open the game in dev mode. From the debug menu select the 'Translations' menu. In this dialog, you can export the translation file of any language currently registered, or a completely blank template.

## Translating Your Mod Content

If your mod adds new text (item names, event text, technique descriptions, etc.), you can make that content translatable. The `afnm-types` package includes a CLI tool that scans your mod's TypeScript source and generates a template file for translators to fill in.

### Generating a Translation Template

Run the extraction tool from your mod's root directory:

```bash
npx afnm-extract-translations --src ./src --output ./translations
```

This scans your source code and writes `translations/template.json` containing all the strings that can be translated. Share this file with translators — they copy it and fill in their target language.

Options:

| Flag | Default | Description |
|------|---------|-------------|
| `--src <path>` | `./src` | Path to the mod source directory |
| `--output <path>` | `./translations` | Output directory for the template file |

### Registering Translations

Once a translation file is complete (e.g. `translations/ru.json`), register it in your mod's entry point:

```typescript
import ruTranslations from './translations/ru.json';

api.addTranslation('ru', ruTranslations);
```

Registrations via `api.addTranslation` take precedence over auto-loaded translations from the same mod. If multiple mods provide translations for the same language, later mods override earlier ones.

## Providing Translations for the Base Game

To provide translations for existing game text, use `api.addTranslation` with a translation file exported from the debug menu:

```typescript
import myTranslations from './translations/en.json';

api.addTranslation('en', myTranslations);
```

If a player installs a mod that provides translations, the game will default to that language.

## Utilities

A community translation helper application makes it easier to browse and edit translation files. You can find it here: [Community Translation App](https://drive.google.com/file/d/1j-IekRMLPPUYECiAHAMpZDnw1irqbxu0/view?usp=drive_link).

Open a translations file exported from the debug menu and quickly browse and edit it.

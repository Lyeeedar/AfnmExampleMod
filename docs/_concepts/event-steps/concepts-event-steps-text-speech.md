---
layout: default
title: Text & Speech Steps
---

# Text & Speech Steps

Text and Speech steps are the foundation of narrative content in events. They display text to the player and create dialogue with characters.

## Text Step

Displays narrative text, descriptions, and general information to the player.

### Interface

```typescript
interface TextStep {
  kind: 'text';
  condition?: string;
  text: string;
  sfx?: SoundEffectName;
}
```

### Properties

- **`kind`** - Always `'text'`
- **`condition`** (optional) - [Flag expression](/concepts/concepts-flags/) that must be true for the step to execute
- **`text`** - The text content to display to the player
- **`sfx`** (optional) - Sound effect to play when the text appears

### Example

```typescript
{
  kind: 'text',
  text: 'You stride towards the edge of the bubbling lake, heat rising with each step.'
}
```

### With Conditional Display

```typescript
{
  kind: 'text',
  condition: 'realm >= 3',
  text: 'Your advanced cultivation allows you to withstand the intense heat.'
}
```

### With Sound Effect

```typescript
{
  kind: 'text',
  text: 'Thunder crashes overhead as storm clouds gather!',
  sfx: 'Hit'  // Play impact sound
}
```

## Speech Step

Displays dialogue from a specific character, with the character's name shown.

### Interface

```typescript
interface SpeechStep {
  kind: 'speech';
  condition?: string;
  character: string;
  text: string;
}
```

### Properties

- **`kind`** - Always `'speech'`
- **`condition`** (optional) - [Flag expression](/concepts/concepts-flags/) that must be true for the step to execute
- **`character`** - Name of the character speaking
- **`text`** - The dialogue text

### Example

```typescript
{
  kind: 'speech',
  character: 'Yufu Chen',
  text: "I wouldn't do that, if I were you. Unless you have a death wish, of course."
}
```

### Multiple Character Dialogue

```typescript
[
  {
    kind: 'speech',
    character: 'Elder Li',
    text: 'Welcome to our sect, young cultivator.',
  },
  {
    kind: 'speech',
    character: 'Disciple Wang',
    text: 'Master, should I show them to their quarters?',
  },
  {
    kind: 'speech',
    character: 'Elder Li',
    text: 'Yes, and make sure they understand our rules.',
  },
];
```

## Text Templates

There are a number of templates that can be added to text and speech steps to allow for configuring the text based displayed dynamically.

### Player Name

You can use the `{forename}`, `{surname}`, and `{fullname}` templates to insert whatever names the player chose into the text.

```typescript
{
  kind: 'speech',
  character: 'Beishi Ji',
  text: `"Hey there {forename}."`
}
```

### Gender specific phrases

If a chunk of text, title, or phrase should be configured based on the players' selected gender then the `{male|female}` template can be used. This will show the text on the left of the `|` for male, and right for female.

```typescript
{
  kind: "speech",
  character: "Old Trader",
  text: "Good morning young {master|lady}. How may this one serve you."
}
```

## Text customisation

The text displayed is html, so the full styling of its contents can be fully configured using html tags.

```typescript
{
  kind: 'text',
  text: 'Today has been a <b>really</b> bad day. <span style="color: green; textShadow: -1px 1px 0 #000, 1px 1px 0 #000, 1px -1px 0 #000, -1px -1px 0 #000;">Power</span> flows through you.'
}
```

## Real Game Example

From the Animated Masterpiece unlock event:

```typescript
const steps: EventStep[] = [
  {
    kind: 'text',
    text: 'As you leave the site of the stitch activity, arms laden with heart fibers, you hear a soft voice behind you.',
  },
  {
    kind: 'speech',
    character: 'Needle Fairy',
    text: "Good day, disciple. Hard at work, I see. The fibers you've brought me, the battle testing you are putting my creations through, it is all invaluable data.",
  },
  {
    kind: 'speech',
    character: 'Needle Fairy',
    text: 'So, I think you are ready for something a little more... advanced.',
  },
];
```

## Best Practices

### Text Steps

- **Keep paragraphs focused** - Each text step should cover one main idea or moment
- **Use vivid descriptions** - Paint a picture with your words to immerse players
- **Match the tone** - Maintain consistency with the cultivation/xianxia theme
- **Consider pacing** - Break up long descriptions into multiple steps

### Speech Steps

- **Character voice** - Each character should have a distinct way of speaking
- **Use character names consistently** - Make sure the character name matches exactly
- **Natural dialogue** - Write how people actually speak, not formal prose
- **Show personality** - Let character traits come through in their speech

### Sound Effects

- **Use sparingly** - Not every text needs a sound effect
- **Match the content** - Choose sounds that enhance the text's meaning
- **Consider context** - Dramatic moments benefit more from sound effects
- **Test combinations** - Some sound effects work better with certain types of text

## Common Patterns

### Narrative Introduction

```typescript
[
  {
    kind: 'text',
    text: 'You approach the ancient temple, its weathered stones humming with spiritual energy.',
  },
  {
    kind: 'text',
    text: 'Carved dragons spiral up the pillars, their eyes seeming to track your movement.',
  },
];
```

### Character Introduction

```typescript
[
  {
    kind: 'text',
    text: 'A figure emerges from the shadows, robes billowing in the wind.',
  },
  {
    kind: 'speech',
    character: 'Mysterious Cultivator',
    text: 'So, another seeker comes to test their worth. How... predictable.',
  },
];
```

### Reaction Text

```typescript
[
  {
    kind: 'speech',
    character: 'Master Zhang',
    text: 'Impressive! Your cultivation has grown considerably.',
  },
  {
    kind: 'text',
    condition: 'realm >= 5',
    text: 'The master nods approvingly, clearly recognizing your advanced realm.',
  },
];
```

---

[← Event Steps](../concepts-event-steps/) | [Choices →](concepts-event-steps-choices/)

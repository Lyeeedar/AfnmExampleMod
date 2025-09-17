---
layout: default
title: Testing & Polish
parent: Your First Mod
grand_parent: Guides
nav_order: 7
description: 'Testing your mod, debugging issues, and adding final polish'
---

# Step 7: Testing & Polish

With all systems implemented, your tea house mod is functionally complete! However, a good mod requires thorough testing, error handling, and quality-of-life improvements. Let's ensure your mod provides a smooth, professional experience for players.

## Comprehensive Testing Strategy

### 1. TypeScript Validation

Always start with static analysis:

```bash
# Check for TypeScript errors
npx tsc --noEmit

# Or use the getDiagnostics tool in Claude Code
```

**Common TypeScript issues to verify**:
- All interface properties are present and correctly typed
- Item names match exactly between files
- Character names match between definitions and references
- Flag names are consistent across quest steps and events

### 2. System Integration Testing

Test each component in isolation, then together:

#### Item Testing
- Items appear in debug menus/admin commands
- Buffs apply correctly when consuming items
- Stack sizes work as expected
- Rarity colors display properly

#### Character Testing
- Master Chen appears in Liang Tiao Village
- Dialogue interactions work without errors
- Shop only appears after `teaHouseUnlocked == 1`
- Shop stock organized correctly by realm
- Combat stats don't crash if player fights the character

#### Location Testing
- Tea house building appears after quest completion
- Building positioned correctly (`middleright`)
- Brewing interactions consume/create items properly
- Character interactions (talk/trade) function correctly

#### Quest Testing
- First quest triggers when visiting Liang Tiao Village
- Quest steps complete in proper sequence
- Flags are set correctly (`foundTeaHouseClue`, `cleanedTeaHouse`, etc.)
- Second quest only appears after first quest completion
- Quest rewards are delivered properly

#### Event Testing
- Triggered events fire at appropriate times
- Events don't retrigger after flags are set
- Location restrictions work correctly
- Screen targeting functions properly

### 3. Edge Case Testing

#### Resource Scarcity
- What happens if player has no tea leaves for brewing?
- Does the tea house handle empty inventory gracefully?
- Are error messages helpful and clear?

#### Quest State Issues
- What if player fights Master Chen before meeting him peacefully?
- What happens if flags get set out of order?
- Can quests be completed in unexpected sequences?

#### Save/Load Compatibility
- Do global flags persist across game restarts?
- Does the tea house remain unlocked after reloading?
- Are quest states preserved correctly?

## Error Handling and Defensive Programming

### Location Existence Checks

Our current tea brewery code includes defensive programming:

```typescript
export function initializeTeaBrewery() {
  console.log('🍵 Adding tea house to Liang Tiao Village...');

  const liangTiaoVillage = window.modAPI.gameData.locations['Liang Tiao Village'];

  if (liangTiaoVillage) {
    if (!liangTiaoVillage.buildings) {
      liangTiaoVillage.buildings = [];
    }
    liangTiaoVillage.buildings.push(teaHouseBuilding);
    console.log('✅ Added Tea House building to Liang Tiao Village');
  } else {
    console.warn('⚠️ Liang Tiao Village not found, tea house building created but not linked');
  }
}
```

**Why this matters**: If another mod removes or renames Liang Tiao Village, our mod won't crash the game.

### Item Reference Validation

Consider adding validation to ensure referenced items exist:

```typescript
export function initializeTeaCharacters() {
  console.log('👤 Adding tea master characters...');

  // Validate that required items exist
  const requiredItems = [greenTeaLeaves.name, jasmineTeaLeaves.name, brewedGreenTea.name];
  const missingItems = requiredItems.filter(itemName =>
    !window.modAPI.gameData.items[itemName]
  );

  if (missingItems.length > 0) {
    console.warn(`⚠️ Missing items for tea characters: ${missingItems.join(', ')}`);
  }

  allTeaCharacters.forEach((character) => {
    window.modAPI.actions.addCharacter(character);
  });

  console.log(`✅ Added ${allTeaCharacters.length} tea characters`);
}
```

### Graceful Degradation

Design systems to work even when components are missing:

```typescript
// In tea house building events
{
  text: 'Talk to Master Chen',
  showCondition: 'teaHouseUnlocked == 1',
  children: [
    {
      kind: 'conditional',
      branches: [
        {
          condition: 'characterExists("Master Chen")',  // Hypothetical check
          children: [
            {
              kind: 'talkToCharacter',
              character: 'Master Chen',
            }
          ]
        },
        {
          condition: '1',  // Fallback
          children: [
            {
              kind: 'text',
              text: 'Master Chen seems to have stepped away momentarily.',
            }
          ]
        }
      ]
    }
  ],
}
```

## Quality-of-Life Improvements

### Enhanced Descriptions

Add flavor text that enhances immersion:

```typescript
// Instead of just "You brew tea"
text: 'You carefully steep the green tea leaves in perfectly heated water. The gentle brewing process creates a calming, aromatic tea.',

// Instead of just "Quest complete"
text: 'Master Chen hands you three cups of freshly brewed green tea as a token of gratitude.',
```

### Helpful Player Feedback

Provide clear information about requirements and results:

```typescript
// Clear requirement indication
text: `Brew Green Tea (Requires 3 ${greenTeaLeaves.name})`

// Informative success feedback
text: 'The delicate jasmine flowers release their essence into the hot water, creating a spiritually uplifting brew that enhances one\'s qi awareness.'
```

### Consistent Terminology

Ensure all text uses consistent terms:
- "Tea house" vs "tea house" vs "Tea House"
- "Master Chen" vs "master Chen"
- "Liang Tiao Village" vs "Liang Tiao village"

**Create a style guide** for your mod and follow it consistently.

## Performance Considerations

### Efficient Event Conditions

Use simple conditions when possible:

```typescript
// Efficient
trigger: 'startedTeaHouseQuest == 0'

// Less efficient (but sometimes necessary)
trigger: 'realm >= 3 && questsCompleted >= 5 && hasVisitedLocation("Temple")'
```

### Reasonable Trigger Chances

Don't make triggered events fire too frequently:

```typescript
// Good for quest distribution
triggerChance: 1.0

// Good for rare encounters
triggerChance: 0.1

// Avoid very frequent random events
triggerChance: 0.8  // Too high for random content
```

## Mod Compatibility

### Avoiding Conflicts

**Unique Names**: Ensure all your content has unique identifiers:
```typescript
// Good - clearly mod-prefixed
name: 'Master Chen',
flag: 'teaHouseUnlocked',
quest: 'The Forgotten Tea House'

// Risky - could conflict with other mods
name: 'Merchant',
flag: 'unlocked',
quest: 'Find the House'
```

**Graceful Fallbacks**: Handle missing dependencies:
```typescript
if (!window.modAPI.gameData.locations['Liang Tiao Village']) {
  console.warn('Tea House Mod: Liang Tiao Village not found, creating fallback location reference');
  // Could create alternative quest distribution or skip that content
}
```

### Mod Load Order

Document any dependencies or load order requirements:

```typescript
// At top of index.ts
/**
 * Tea House Mod
 *
 * Dependencies:
 * - Base game locations (Liang Tiao Village)
 * - No other mod dependencies
 *
 * Compatible with:
 * - Most other content mods
 * - Location enhancement mods
 *
 * Potential conflicts:
 * - Mods that remove or significantly modify Liang Tiao Village
 * - Mods that use the same character name "Master Chen"
 */
```

## Documentation and User Experience

### Console Logging

Provide clear feedback during mod loading:

```typescript
export function initializeMysticalTeaGarden() {
  console.log('🍵 Initializing Mystical Tea Garden Mod...');
  console.log('📦 Version: 1.0.0');
  console.log('👤 Author: [Your Name]');

  // Detailed progress logging
  initializeTeaItems();       // Logs: "✅ Added 4 tea items"
  initializeTeaCharacters();  // Logs: "✅ Added 1 tea characters"
  initializeTeaBrewery();     // Logs: "✅ Added Tea House building to Liang Tiao Village"
  initializeTeaQuests();      // Logs: "✅ Added 2 tea quests"
  initializeTeaQuestEvents(); // Logs: "✅ Added 2 tea quest triggers"

  console.log('✅ Mystical Tea Garden Mod loaded successfully!');
  console.log('🎯 Visit Liang Tiao Village to begin your tea cultivation journey');
}
```

### Player Instructions

Consider adding in-game guidance:

```typescript
// In first quest trigger event
{
  kind: 'text',
  text: 'As you explore Liang Tiao Village, you notice an old building with a faded sign depicting a tea cup. This could be the start of an interesting discovery...',
}
```

## Final Checklist

Before releasing your mod, verify:

### ✅ Technical Requirements
- [ ] No TypeScript errors (`getDiagnostics` clean)
- [ ] All items register successfully
- [ ] Character appears and functions correctly
- [ ] Tea house building appears after quest completion
- [ ] Both quests distribute and complete properly
- [ ] All flags set correctly and persist across saves

### ✅ User Experience
- [ ] Clear quest objectives and hints
- [ ] Helpful error messages for edge cases
- [ ] Consistent writing style and terminology
- [ ] Engaging dialogue and descriptions
- [ ] Balanced rewards and requirements

### ✅ Compatibility
- [ ] Handles missing dependencies gracefully
- [ ] Uses unique names for all content
- [ ] Doesn't interfere with base game systems
- [ ] Clear console logging for debugging

### ✅ Polish
- [ ] All placeholder content replaced (icons, images, etc.)
- [ ] Proper formatting and code organization
- [ ] Comprehensive error handling
- [ ] Performance optimized (efficient conditions, etc.)

## Debugging Common Issues

### Quest Not Appearing
1. Check console for triggered event registration
2. Verify trigger conditions are being met
3. Ensure quest names match exactly
4. Confirm screen and location targeting is correct

### Building Not Visible
1. Verify `teaHouseUnlocked` flag is set
2. Check that Liang Tiao Village exists in game data
3. Confirm building array is properly initialized
4. Ensure building position is valid

### Character Interactions Failing
1. Check character name consistency
2. Verify shop condition (`teaHouseUnlocked == 1`)
3. Ensure all realm stock entries are present
4. Confirm character is registered successfully

### Items Not Working
1. Verify items are registered before other systems use them
2. Check buff effect structures match AFNM interfaces
3. Ensure item names are unique and consistent
4. Confirm stack sizes and rarity values are valid

## Publishing Your Mod

Once testing is complete:

1. **Clean up code** - Remove debug logging, unused imports, commented code
2. **Update version numbers** - Use semantic versioning (1.0.0)
3. **Write documentation** - README with installation and usage instructions
4. **Package properly** - Follow AFNM mod distribution guidelines
5. **Test on clean installation** - Verify mod works on fresh game install

## Conclusion

Congratulations! You've built a complete AFNM mod that demonstrates:

- **Item system** with materials and consumables
- **Character system** with dialogue and shops
- **Location system** with custom buildings
- **Quest system** with multi-step progression
- **Event system** with triggered quest distribution

Your tea house mod serves as a solid foundation for more complex projects. The patterns and techniques you've learned - dependency management, TypeScript integration, flag-based progression, and defensive programming - apply to all AFNM modding.

**Next steps for expanding your mod**:
- Add more tea varieties with unique effects
- Create seasonal tea festivals and events
- Implement advanced brewing techniques as unlockable skills
- Add tea master training questlines
- Create tea cultivation farming mechanics

The skills you've developed here will serve you well in creating any type of AFNM content. Happy modding!

## Troubleshooting Resources

**TypeScript errors**: Use `getDiagnostics` tool for detailed error information with line numbers

**Flag debugging**: Use in-game debug commands to check flag states

**Event testing**: Add temporary console.log statements to event steps to trace execution

**Documentation**: Reference the [complete AFNM documentation](../../) for detailed API information

**Community**: Engage with other modders for advice, collaboration, and troubleshooting assistance
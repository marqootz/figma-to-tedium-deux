# Position, Variant Switching, and Animation Architecture

## Overview

This document outlines the refactored architecture that properly separates three distinct but connected concepts:

1. **Positioning** - Default export state for all instances and component sets
2. **Variant Switching** - Instant switching between variants without animation
3. **Animation** - Temporary manipulation of node values during transitions

## 1. Positioning

### Default Export State
All instances and component sets (regardless of nesting) get the following default positioning:

```css
position: relative;
top: 0px;
left: 0px;
```

### Implementation
- **File**: `src/html/layout-styles.ts`
- **Function**: `computeLayoutStyles()`
- **Logic**: Simplified to only apply positioning to `INSTANCE`, `COMPONENT_SET`, and `COMPONENT` types

### Key Principles
- This is the **original export state** from Figma
- Elements maintain this positioning throughout their lifecycle
- No animation or variant switching should permanently alter this state
- This provides a consistent foundation for all other operations

## 2. Variant Switching

### Instant Switching System
Variant switching is implemented as a simple slideshow-like system that switches between variants instantly.

### Implementation
- **File**: `src/html/events/variant-handler.ts`
- **Function**: `createVariantSwitchingHandler()`
- **Behavior**: Instant show/hide using CSS classes

### Key Principles
- **No animation** - variants switch instantly like a slideshow
- **Maintains original positioning** - all variants keep their `position: relative; top: 0px; left: 0px`
- **Simple state management** - uses `variant-active` and `variant-hidden` classes
- **Part of animation system** - but doesn't introduce animation itself

### Process
1. User clicks variant button
2. All variants in component set are hidden (`variant-hidden` class)
3. Selected variant is shown (`variant-active` class)
4. All variants maintain their original positioning
5. Timeout reactions are started for the newly active variant

## 3. Animation

### Temporary Value Manipulation
Animation temporarily manipulates node values during transitions, but returns to original state when complete.

### Implementation
- **File**: `src/html/events/transition-handler.ts`
- **Function**: `createSmartAnimateHandler()`
- **Behavior**: Temporary manipulation with cleanup

### Key Principles
- **Temporary only** - all changes are reverted after animation
- **Original state preservation** - stores and restores original values
- **Animation curves** - uses easing functions to modify how values change over time
- **Cleanup phase** - ensures elements return to their export state

### Process
1. **Store Original State** - Save current element state before animation
2. **Apply Initial State** - Set elements to match source variant's visual state
3. **Animate** - Use CSS transitions to animate to target state
4. **Cleanup** - Restore original state and positioning
5. **Return to Export State** - Elements are back to their original Figma export state

### Animation Types
- **SMART_ANIMATE** - Smooth transitions with easing
- **BOUNCY** - Bouncy transitions with overshoot/undershoot
- **DISSOLVE** - Fade transitions
- **Default** - Simple show/hide

## Architecture Benefits

### Clear Separation of Concerns
- **Positioning** is handled once during export
- **Variant switching** is handled by variant handler
- **Animation** is handled by transition handler

### Predictable State Management
- Elements always return to their original export state
- No permanent side effects from animations
- Consistent positioning across all operations

### Simplified Debugging
- Each concept has its own handler
- Clear data flow between components
- Easier to identify and fix issues

### Better Performance
- Reduced complexity in each handler
- Fewer conflicts between different operations
- More efficient state management

## File Structure

```
src/html/
├── layout-styles.ts          # Positioning logic
├── events/
│   ├── variant-handler.ts    # Variant switching (instant)
│   ├── transition-handler.ts # Animation (temporary)
│   └── property-detector.ts  # Change detection
```

## Usage Examples

### Variant Switching (No Animation)
```javascript
// User clicks variant button
// Result: Instant switch between variants
// All variants maintain position: relative; top: 0px; left: 0px
```

### Animation During Transition
```javascript
// User triggers reaction with SMART_ANIMATE
// Result: 
// 1. Elements temporarily change position/color/etc.
// 2. Animation plays with easing curve
// 3. Elements return to original export state
// 4. Variant switch completes
```

### Combined Workflow
```javascript
// 1. Export: All elements get position: relative; top: 0px; left: 0px
// 2. User interaction triggers reaction
// 3. Animation temporarily manipulates element values
// 4. Animation completes, elements return to original state
// 5. Variant switch occurs (instant)
// 6. New variant is active with original positioning
```

## Migration Notes

### Breaking Changes
- Simplified positioning logic
- Removed complex animation coordination
- Cleaner separation between handlers

### Benefits
- More predictable behavior
- Easier to maintain and debug
- Better performance
- Clearer code organization

### Testing
- Test variant switching works instantly
- Test animations return to original state
- Test positioning remains consistent
- Test nested component behavior

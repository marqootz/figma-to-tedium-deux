# Three-Phase Animation System

## Overview

The animation system has been reorganized to follow a clear three-phase pattern: **Setup**, **Animate**, and **Cleanup**. This organization makes the animation logic more predictable, maintainable, and easier to debug.

## Architecture

### Phase 1: Setup 🎬
- **Purpose**: Sets initial values on nodes/variants/instances/sets/etc. Primes HTML for animation from variant 1 to 2
- **Key Functions**:
  - `setupAnimationSession()` - Creates and initializes the animation session
  - Sets initial state for all variants (source visible, others hidden)
  - Prepares target variant but keeps it hidden
  - Returns an `AnimationSession` object to track the animation state

### Phase 2: Animate 🎭
- **Purpose**: Performs copy of source, hides source, animates values if necessary
- **Key Functions**:
  - `animateVariantTransition()` - Main animation orchestration function
  - `createElementCopy()` - Creates an exact copy of the source variant
  - `animateCopyToDestination()` - Animates the copy to match the destination
  - `findElementsWithPropertyChanges()` - Detects what needs to be animated
  - `applyAnimationChange()` - Applies individual animation changes

### Phase 3: Cleanup 🧹
- **Purpose**: Deletes copy, shows target variant, resets animation system so it's ready to repeat process between next 2 variants
- **Key Functions**:
  - `cleanupAnimationSession()` - Performs final cleanup operations
  - Removes the animation copy from DOM
  - Shows the destination variant with proper positioning
  - Ensures all nested components are visible
  - Resets animation system state
  - Starts timeout reactions for the new active variant

## Key Components

### AnimationSession Interface
```typescript
interface AnimationSession {
  sourceElement: HTMLElement;
  targetElement: HTMLElement;
  sourceCopy: HTMLElement | null;
  allVariants: HTMLElement[];
  transitionType: string;
  transitionDuration: number;
  isActive: boolean;
}
```

### Main Entry Points
- `handleAnimatedVariantSwitch()` - Main function for animated variant transitions
- `performInstantVariantSwitch()` - Function for instant variant switches (no animation)

## File Structure

```
src/html/events/
├── animation-system.ts           # Core animation types and interfaces
├── three-phase-transition-handler.ts  # Main three-phase implementation
├── index.ts                      # Exports and event handling setup
└── ...                          # Other supporting modules
```

## Usage Example

```javascript
// The system automatically uses the three-phase pattern when calling:
window.handleAnimatedVariantSwitch(
  sourceElement,      // Current active variant
  destinationElement, // Target variant
  allVariants,        // Array of all variants in the component set
  transitionType,     // Animation type (e.g., 'SMART_ANIMATE')
  transitionDuration  // Duration in seconds
);
```

## Benefits of Three-Phase Organization

1. **Clear Separation of Concerns**: Each phase has a specific responsibility
2. **Predictable Flow**: The sequence is always Setup → Animate → Cleanup
3. **Easier Debugging**: Issues can be isolated to specific phases
4. **Better Error Handling**: Each phase can be cleaned up independently
5. **Reusable Components**: Each phase can be tested and modified independently
6. **State Management**: The AnimationSession tracks the entire animation lifecycle

## Animation Types Supported

- **SIMPLE**: opacity, color, corner radius, etc.
- **SIZE**: width, height - related to layout sizing
- **TRANSFORM**: translate, rotation, scale - affects parent/children layout

## Translation Conditions

- **ABSOLUTE**: parent has no auto-layout OR ignore auto-layout enabled
- **RELATIVE_PADDING**: animate padding between variants
- **RELATIVE_ALIGNMENT**: change alignment between variants

## Integration with Existing System

The three-phase system integrates seamlessly with the existing:
- Reaction handling system
- Timeout management
- Nested component support
- Variant switching logic

## Migration from Previous System

The new system maintains backward compatibility while providing:
- Better organization
- Improved error handling
- Clearer debugging information
- More predictable animation behavior

## Future Enhancements

The three-phase structure makes it easy to add:
- Animation queuing
- Parallel animations
- Animation cancellation
- Performance optimizations
- Custom animation phases

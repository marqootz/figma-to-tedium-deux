# Modular Animation System Integration Guide

## Overview

This guide explains how to integrate the new modular animation system into the existing Figma-to-Tedium codebase. The new system provides a unified approach to handle animations based on three types and three translation conditions.

## What's New

### 1. Animation System (`src/html/events/animation-system.ts`)
- **Animation Types**: SIMPLE, SIZE, TRANSFORM
- **Translation Conditions**: ABSOLUTE, RELATIVE_PADDING, RELATIVE_ALIGNMENT
- **Change Detection**: Automatic detection of property changes
- **Context-Aware Application**: Animations adapt to layout context

### 2. Modular Transition Handler (`src/html/events/modular-transition-handler.ts`)
- **Unified Translation**: Handles horizontal and vertical translation consistently
- **Copy-Based Animation**: Uses the existing copy approach with new logic
- **Conditional Logic**: Applies different animation strategies based on context

### 3. Enhanced Type System
- **AnimationChange Interface**: Structured change detection results
- **ElementAnimationContext**: Context for animation operations
- **Type Safety**: Full TypeScript support for animation operations

## Integration Steps

### Step 1: Update Imports

The new system is already exported from the events index file. You can import it in your code:

```typescript
import {
  AnimationType,
  TranslationCondition,
  detectAnimationChanges,
  applyAnimationChange,
  getEasingFunction
} from './events';
```

### Step 2: Replace Existing Animation Logic

#### Before (Current System)
```typescript
// Current approach - hardcoded for horizontal translation
if (changes.positionX && changes.positionX.changed) {
  element.style.left = changes.positionX.targetValue + 'px';
}
if (changes.positionY && changes.positionY.changed) {
  element.style.top = changes.positionY.targetValue + 'px';
}
```

#### After (Modular System)
```typescript
// New approach - handles all translation conditions
const animationChanges = detectAnimationChanges(
  sourceElement, 
  targetElement, 
  sourceNode, 
  targetNode, 
  parentNode
);

animationChanges.forEach(change => {
  applyAnimationChange(element, change, duration, easing);
});
```

### Step 3: Update HTML Generation

The modular transition handler is automatically included in the generated HTML. The system provides both the old and new handlers for backward compatibility.

### Step 4: Test the Integration

Use the provided test file to validate the system:

```bash
# Run the test file to see the system in action
npx ts-node src/html/events/animation-system.test.ts
```

## Migration Strategy

### Phase 1: Parallel Implementation
- Keep the existing transition handler
- Add the new modular handler alongside it
- Test both systems in parallel

### Phase 2: Gradual Migration
- Update specific animation scenarios to use the new system
- Monitor performance and behavior
- Gradually replace old logic

### Phase 3: Full Migration
- Remove the old transition handler
- Use only the modular system
- Update all animation-related code

## Key Benefits

### 1. Unified Translation Handling
```typescript
// Before: Only horizontal translation worked
if (changes.positionX && changes.positionX.changed) {
  element.style.left = changes.positionX.targetValue + 'px';
}

// After: Both horizontal and vertical work consistently
const changes = detectAnimationChanges(sourceElement, targetElement, sourceNode, targetNode, parentNode);
changes.forEach(change => {
  if (change.type === AnimationType.TRANSFORM) {
    applyAnimationChange(element, change, duration, easing);
  }
});
```

### 2. Context-Aware Animations
```typescript
// The system automatically determines the correct approach
const translationCondition = getTranslationCondition(element, node, parentNode);

switch (translationCondition) {
  case TranslationCondition.ABSOLUTE:
    // Use direct positioning
    break;
  case TranslationCondition.RELATIVE_PADDING:
    // Animate parent padding
    break;
  case TranslationCondition.RELATIVE_ALIGNMENT:
    // Animate parent alignment
    break;
}
```

### 3. Type Safety
```typescript
// Full TypeScript support
const change: AnimationChange = {
  type: AnimationType.TRANSFORM,
  property: 'translateX',
  sourceValue: 0,
  targetValue: 100,
  changed: true,
  translationCondition: TranslationCondition.ABSOLUTE
};
```

## Configuration Options

### Animation Type Detection
You can customize which properties belong to which animation types:

```typescript
// In animation-system.ts
const simpleProperties = [
  'opacity', 'color', 'backgroundColor', 'cornerRadius', 'borderRadius',
  'fontSize', 'fontWeight', 'textAlign', 'letterSpacing', 'lineHeight'
];

const sizeProperties = [
  'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight'
];

const transformProperties = [
  'translateX', 'translateY', 'translateZ', 'rotation', 'scale', 'transform'
];
```

### Translation Condition Logic
You can modify the logic for determining translation conditions:

```typescript
// In animation-system.ts
export function getTranslationCondition(element: HTMLElement, node: FigmaNode, parentNode?: FigmaNode): TranslationCondition {
  const ignoreAutoLayout = (node as any).layoutPositioning === 'ABSOLUTE';
  const parentHasAutoLayout = parentNode && 
                             parentNode.type === 'FRAME' && 
                             parentNode.layoutMode && 
                             parentNode.layoutMode !== 'NONE';
  
  if (ignoreAutoLayout || !parentHasAutoLayout) {
    return TranslationCondition.ABSOLUTE;
  }
  
  // Add your custom logic here
  return TranslationCondition.RELATIVE_PADDING;
}
```

## Testing

### Unit Tests
The system includes comprehensive unit tests:

```typescript
// Test animation type classification
expect(getAnimationType('opacity')).toBe(AnimationType.SIMPLE);
expect(getAnimationType('width')).toBe(AnimationType.SIZE);
expect(getAnimationType('translateX')).toBe(AnimationType.TRANSFORM);

// Test translation condition detection
expect(getTranslationCondition(element, absoluteNode, parentNode))
  .toBe(TranslationCondition.ABSOLUTE);
```

### Integration Tests
Test the full animation flow:

```typescript
// Test complete animation detection and application
const changes = detectAnimationChanges(sourceElement, targetElement, sourceNode, targetNode, parentNode);
expect(changes).toHaveLength(2);
expect(changes[0].type).toBe(AnimationType.TRANSFORM);
expect(changes[0].translationCondition).toBe(TranslationCondition.ABSOLUTE);
```

## Performance Considerations

### 1. Change Detection Optimization
- Only detects changes for properties that actually differ
- Uses efficient computed style comparison
- Avoids unnecessary DOM queries

### 2. Animation Application
- Batches multiple property changes
- Uses appropriate CSS transitions
- Minimizes DOM manipulation

### 3. Memory Management
- Cleans up animation contexts after completion
- Removes temporary elements
- Prevents memory leaks

## Troubleshooting

### Common Issues

#### 1. Animation Not Working
- Check if the element has the correct `data-figma-id`
- Verify that the source and target elements exist
- Ensure the animation system is properly loaded

#### 2. Wrong Translation Condition
- Check the element's `layoutPositioning` property
- Verify the parent's `layoutMode` setting
- Review the translation condition logic

#### 3. Performance Issues
- Monitor the number of elements being animated
- Check for excessive DOM queries
- Verify that animations are being cleaned up properly

### Debug Mode
Enable debug logging to troubleshoot issues:

```typescript
// The system includes comprehensive debug logging
console.log('DEBUG: Animation changes detected:', animationChanges);
console.log('DEBUG: Translation condition:', translationCondition);
console.log('DEBUG: Applying animation change:', change);
```

## Future Enhancements

### 1. Rotation and Scale Support
```typescript
// Future enhancement
const transformProperties = [
  'translateX', 'translateY', 'translateZ', 
  'rotation', 'scale', 'transform',
  'rotateX', 'rotateY', 'rotateZ',
  'scaleX', 'scaleY', 'scaleZ'
];
```

### 2. Advanced Layout Detection
```typescript
// Future enhancement
export function getAdvancedLayoutContext(element: HTMLElement): LayoutContext {
  // Detect nested auto-layout containers
  // Handle complex layout scenarios
  // Support for CSS Grid and Flexbox
}
```

### 3. Animation Presets
```typescript
// Future enhancement
export const AnimationPresets = {
  FIGMA_SMART_ANIMATE: {
    duration: 0.3,
    easing: 'ease-in-out',
    properties: ['transform', 'opacity', 'size']
  },
  FIGMA_BOUNCY: {
    duration: 0.5,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    properties: ['transform']
  }
};
```

## Conclusion

The modular animation system provides a robust, type-safe, and context-aware approach to handling animations in the Figma-to-Tedium project. It solves the current limitation where only horizontal translation works by providing a unified system that handles all translation conditions and animation types consistently.

The system is designed to be backward compatible and can be integrated gradually, allowing for thorough testing and validation before full migration.

# Modular Animation System

## Overview

The modular animation system is designed to handle animations logically and conditionally based on the type of property being animated and the layout context of the element. This system addresses the current limitation where horizontal translation works but vertical breaks, by providing a unified approach to handle translation regardless of direction.

## Animation Types

The system categorizes animations into three main types:

### 1. Simple Animations (Type 1)
**Properties**: opacity, color, corner radius, etc.
**Impact**: Minimal effect on other nodes, parents, or children
**Examples**:
- `opacity`: 0.5 → 1.0
- `backgroundColor`: #ff0000 → #00ff00
- `cornerRadius`: 0px → 8px
- `fontSize`: 14px → 16px

**Implementation**: Direct CSS property transitions

### 2. Size Animations (Type 2)
**Properties**: width, height, min/max dimensions
**Impact**: Affects layout sizing values and may influence sibling elements
**Examples**:
- `width`: 100px → 200px
- `height`: 50px → 75px
- `minWidth`: 80px → 120px

**Implementation**: CSS dimension transitions with layout consideration

### 3. Transform Animations (Type 3)
**Properties**: translate, rotation, scale
**Impact**: Intimate relationships with parent and children layout settings
**Examples**:
- `translateX`: 0px → 100px
- `translateY`: 0px → 50px
- `rotation`: 0deg → 45deg
- `scale`: 1 → 1.5

**Implementation**: Context-aware positioning based on translation conditions

## Translation Conditions

The system handles translation based on three conditions that determine how an object moves in Figma:

### 1. Absolute Positioning (Condition 1)
**Trigger**: 
- Parent has no auto-layout (simple frame)
- OR element has "ignore auto-layout" enabled

**Behavior**: Element moves using direct positioning values
**Implementation**: 
```css
element.style.left = targetX + 'px';
element.style.top = targetY + 'px';
```

**Use Case**: Elements positioned absolutely within their container

### 2. Relative by Padding (Condition 2)
**Trigger**: Parent has auto-layout AND padding values change between variants

**Behavior**: Element moves by animating the padding between variants
**Implementation**:
```css
parent.style.paddingLeft = targetPadding + 'px';
parent.style.paddingTop = targetPadding + 'px';
```

**Use Case**: Elements within auto-layout containers where spacing changes

### 3. Relative by Alignment (Condition 3)
**Trigger**: Parent has auto-layout AND alignment values change between variants

**Behavior**: Element moves by changing the alignment (left/right/top/bottom) between variants
**Implementation**:
```css
parent.style.justifyContent = targetAlignment;
parent.style.alignItems = targetAlignment;
```

**Use Case**: Elements within auto-layout containers where alignment changes

## System Architecture

### Core Components

1. **Animation System** (`src/html/events/animation-system.ts`)
   - Defines animation types and translation conditions
   - Provides change detection logic
   - Handles animation application

2. **Modular Transition Handler** (`src/html/events/modular-transition-handler.ts`)
   - Uses the animation system for variant switching
   - Provides the JavaScript runtime for animations
   - Handles the copy-based animation approach

### Key Functions

#### `getAnimationType(property: string): AnimationType`
Determines which animation type a property belongs to.

#### `getTranslationCondition(element, node, parentNode): TranslationCondition`
Determines the translation condition based on layout context.

#### `detectAnimationChanges(sourceElement, targetElement, sourceNode, targetNode, parentNode): AnimationChange[]`
Detects what properties have changed and how they should be animated.

#### `applyAnimationChange(element, change, duration, easing): void`
Applies an animation change based on its type and condition.

## Implementation Details

### Change Detection Process

1. **Element Analysis**: Examine source and target elements
2. **Property Comparison**: Compare computed styles for differences
3. **Type Classification**: Categorize each change by animation type
4. **Condition Determination**: Determine translation condition for transform changes
5. **Change Recording**: Create animation change objects with metadata

### Animation Application Process

1. **Context Setup**: Create animation context for each element
2. **Transition Setup**: Configure CSS transitions based on property type
3. **Value Application**: Apply target values using appropriate method
4. **Progress Monitoring**: Track animation completion
5. **Cleanup**: Restore original state after animation

### Translation Handling

#### Absolute Positioning
```javascript
if (translationCondition === TranslationCondition.ABSOLUTE) {
  if (property === 'translateX') {
    element.style.left = `${targetValue}px`;
  } else if (property === 'translateY') {
    element.style.top = `${targetValue}px`;
  }
}
```

#### Relative by Padding
```javascript
if (translationCondition === TranslationCondition.RELATIVE_PADDING) {
  if (element.parentElement) {
    const paddingProperty = property.replace('parent_', '');
    element.parentElement.style[paddingProperty] = `${targetValue}px`;
  }
}
```

#### Relative by Alignment
```javascript
if (translationCondition === TranslationCondition.RELATIVE_ALIGNMENT) {
  if (element.parentElement) {
    const alignmentProperty = property.replace('parent_', '');
    element.parentElement.style[alignmentProperty] = targetValue;
  }
}
```

## Benefits

### 1. Unified Translation Handling
- Solves the horizontal vs vertical translation issue
- Provides consistent behavior regardless of direction
- Handles all three translation conditions automatically

### 2. Context-Aware Animations
- Animations adapt to the layout context
- Respects auto-layout vs absolute positioning
- Maintains proper parent-child relationships

### 3. Modular Design
- Easy to extend with new animation types
- Clear separation of concerns
- Testable individual components

### 4. Performance Optimized
- Only animates properties that actually change
- Uses appropriate CSS transitions
- Minimal DOM manipulation

## Future Enhancements

### 1. Rotation and Scale Support
- Extend transform animations to include rotation and scale
- Handle complex transform combinations
- Maintain proper layout relationships

### 2. Advanced Layout Detection
- Better detection of auto-layout vs manual layout
- Support for nested auto-layout containers
- Handling of complex layout scenarios

### 3. Animation Presets
- Predefined animation combinations
- Figma-like animation presets
- Custom easing functions

### 4. Performance Monitoring
- Animation performance metrics
- Frame rate monitoring
- Optimization suggestions

## Usage Example

```javascript
// The system automatically detects and handles animations
const changes = detectAnimationChanges(sourceElement, targetElement, sourceNode, targetNode, parentNode);

changes.forEach(change => {
  applyAnimationChange(element, change, duration, easing);
});
```

This modular approach ensures that animations work consistently across all directions and layout contexts, solving the current limitation where only horizontal translation works properly.

import { FigmaNode } from '../../types';

// Animation types as defined by the user
export enum AnimationType {
  SIMPLE = 'SIMPLE',      // opacity, color, corner radius, etc.
  SIZE = 'SIZE',          // width, height - related to layout sizing
  TRANSFORM = 'TRANSFORM' // translate, rotation, scale - affects parent/children layout
}

// Translation conditions as defined by the user
export enum TranslationCondition {
  ABSOLUTE = 'ABSOLUTE',           // parent has no auto-layout OR ignore auto-layout enabled
  RELATIVE_PADDING = 'RELATIVE_PADDING', // animate padding between variants
  RELATIVE_ALIGNMENT = 'RELATIVE_ALIGNMENT' // change alignment between variants
}

// Animation change detection result
export interface AnimationChange {
  type: AnimationType;
  property: string;
  sourceValue: any;
  targetValue: any;
  changed: boolean;
  translationCondition?: TranslationCondition;
}

// Element animation context
export interface ElementAnimationContext {
  element: HTMLElement;
  node: FigmaNode;
  parentNode?: FigmaNode | undefined;
  changes: AnimationChange[];
}

/**
 * Determines the animation type for a given property
 */
export function getAnimationType(property: string): AnimationType {
  // Simple properties that don't affect layout
  const simpleProperties = [
    'opacity', 'color', 'backgroundColor', 'cornerRadius', 'borderRadius',
    'fontSize', 'fontWeight', 'textAlign', 'letterSpacing', 'lineHeight'
  ];
  
  // Size properties that affect layout
  const sizeProperties = [
    'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight'
  ];
  
  // Transform properties that have intimate relationships with parent/children
  const transformProperties = [
    'translateX', 'translateY', 'translateZ', 'rotation', 'scale', 'transform'
  ];
  
  if (simpleProperties.includes(property)) {
    return AnimationType.SIMPLE;
  } else if (sizeProperties.includes(property)) {
    return AnimationType.SIZE;
  } else if (transformProperties.includes(property)) {
    return AnimationType.TRANSFORM;
  }
  
  // Default to simple for unknown properties
  return AnimationType.SIMPLE;
}

/**
 * Determines the translation condition for an element
 */
export function getTranslationCondition(element: HTMLElement, node: FigmaNode, parentNode?: FigmaNode): TranslationCondition {
  // Check if element has ignore auto-layout enabled
  const ignoreAutoLayout = (node as any).layoutPositioning === 'ABSOLUTE';
  
  // Check if parent has auto-layout
  const parentHasAutoLayout = parentNode && 
                             parentNode.type === 'FRAME' && 
                             parentNode.layoutMode && 
                             parentNode.layoutMode !== 'NONE';
  
  // Condition 1: Absolute positioning
  if (ignoreAutoLayout || !parentHasAutoLayout) {
    return TranslationCondition.ABSOLUTE;
  }
  
  // Condition 2: Relative by padding (if parent has auto-layout and padding changes)
  if (parentHasAutoLayout) {
    // Check if padding values differ between variants
    // This would be detected during change detection
    return TranslationCondition.RELATIVE_PADDING;
  }
  
  // Condition 3: Relative by alignment (if parent has auto-layout and alignment changes)
  if (parentHasAutoLayout) {
    // Check if alignment values differ between variants
    // This would be detected during change detection
    return TranslationCondition.RELATIVE_ALIGNMENT;
  }
  
  // Default to absolute
  return TranslationCondition.ABSOLUTE;
}

/**
 * Detects animation changes between source and target elements
 */
export function detectAnimationChanges(
  sourceElement: HTMLElement, 
  targetElement: HTMLElement,
  sourceNode: FigmaNode,
  targetNode: FigmaNode,
  parentNode?: FigmaNode
): AnimationChange[] {
  const changes: AnimationChange[] = [];
  
  // Get computed styles for comparison
  const sourceStyle = window.getComputedStyle(sourceElement);
  const targetStyle = window.getComputedStyle(targetElement);
  
  // Check simple properties
  const simpleProperties = ['opacity', 'backgroundColor', 'color'];
  simpleProperties.forEach(property => {
    const sourceValue = sourceStyle[property as any];
    const targetValue = targetStyle[property as any];
    
    if (sourceValue !== targetValue) {
      changes.push({
        type: AnimationType.SIMPLE,
        property,
        sourceValue,
        targetValue,
        changed: true
      });
    }
  });
  
  // Check size properties
  const sizeProperties = ['width', 'height'];
  sizeProperties.forEach(property => {
    const sourceValue = parseFloat(sourceStyle[property as any]) || 0;
    const targetValue = parseFloat(targetStyle[property as any]) || 0;
    
    if (Math.abs(sourceValue - targetValue) > 1) {
      changes.push({
        type: AnimationType.SIZE,
        property,
        sourceValue,
        targetValue,
        changed: true
      });
    }
  });
  
  // Check transform properties (translation)
  const translationCondition = getTranslationCondition(sourceElement, sourceNode, parentNode);
  
  // Check position changes based on translation condition
  if (translationCondition === TranslationCondition.ABSOLUTE) {
    // For absolute positioning, check left/top changes
    const sourceLeft = parseFloat(sourceStyle.left) || 0;
    const targetLeft = parseFloat(targetStyle.left) || 0;
    const sourceTop = parseFloat(sourceStyle.top) || 0;
    const targetTop = parseFloat(targetStyle.top) || 0;
    
    if (Math.abs(sourceLeft - targetLeft) > 1) {
      changes.push({
        type: AnimationType.TRANSFORM,
        property: 'translateX',
        sourceValue: sourceLeft,
        targetValue: targetLeft,
        changed: true,
        translationCondition
      });
    }
    
    if (Math.abs(sourceTop - targetTop) > 1) {
      changes.push({
        type: AnimationType.TRANSFORM,
        property: 'translateY',
        sourceValue: sourceTop,
        targetValue: targetTop,
        changed: true,
        translationCondition
      });
    }
  } else if (translationCondition === TranslationCondition.RELATIVE_PADDING) {
    // For relative padding, check if parent padding changes
    const sourceParent = sourceElement.parentElement;
    const targetParent = targetElement.parentElement;
    
    if (sourceParent && targetParent) {
      const sourceParentStyle = window.getComputedStyle(sourceParent);
      const targetParentStyle = window.getComputedStyle(targetParent);
      
      const paddingProperties = ['paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom'];
      paddingProperties.forEach(property => {
        const sourceValue = parseFloat(sourceParentStyle[property as any]) || 0;
        const targetValue = parseFloat(targetParentStyle[property as any]) || 0;
        
        if (Math.abs(sourceValue - targetValue) > 1) {
          changes.push({
            type: AnimationType.TRANSFORM,
            property: `parent_${property}`,
            sourceValue,
            targetValue,
            changed: true,
            translationCondition
          });
        }
      });
    }
  } else if (translationCondition === TranslationCondition.RELATIVE_ALIGNMENT) {
    // For relative alignment, check if parent alignment changes
    const sourceParent = sourceElement.parentElement;
    const targetParent = targetElement.parentElement;
    
    if (sourceParent && targetParent) {
      const sourceParentStyle = window.getComputedStyle(sourceParent);
      const targetParentStyle = window.getComputedStyle(targetParent);
      
      // Check both parent and element alignment properties
      const alignmentProperties = ['justifyContent', 'alignItems', 'textAlign', 'verticalAlign'];
      
      // Check parent alignment changes
      alignmentProperties.forEach(property => {
        const sourceValue = sourceParentStyle[property as any];
        const targetValue = targetParentStyle[property as any];
        
        // console.log(`DEBUG: Checking parent ${property}:`, { sourceValue, targetValue, changed: sourceValue !== targetValue });
        
        if (sourceValue !== targetValue) {
          changes.push({
            type: AnimationType.TRANSFORM,
            property: 'parent_' + property,
            sourceValue: sourceValue as any,
            targetValue: targetValue as any,
            changed: true,
            translationCondition
          });
        }
      });
      
      // Check element's own alignment properties
      alignmentProperties.forEach(property => {
        const sourceValue = (sourceStyle as any)[property];
        const targetValue = (targetStyle as any)[property];
        
        // console.log(`DEBUG: Checking element ${property}:`, { sourceValue, targetValue, changed: sourceValue !== targetValue });
        
        if (sourceValue !== targetValue) {
          changes.push({
            type: AnimationType.TRANSFORM,
            property: property,
            sourceValue: sourceValue,
            targetValue: targetValue,
            changed: true,
            translationCondition
          });
        }
      });
      
      // Check for flexbox-specific properties
      const flexProperties = ['flexDirection', 'flexWrap', 'alignContent', 'justifyItems'];
      flexProperties.forEach(property => {
        const sourceValue = (sourceParentStyle as any)[property];
        const targetValue = (targetParentStyle as any)[property];
        
        // console.log(`DEBUG: Checking flex ${property}:`, { sourceValue, targetValue, changed: sourceValue !== targetValue });
        
        if (sourceValue !== targetValue) {
          changes.push({
            type: AnimationType.TRANSFORM,
            property: 'parent_' + property,
            sourceValue: sourceValue as any,
            targetValue: targetValue as any,
            changed: true,
            translationCondition
          });
        }
      });
      
      // Check for position changes that might be due to alignment
      // Even if alignment values are the same, the computed position might differ
      const sourceRect = sourceElement.getBoundingClientRect();
      const targetRect = targetElement.getBoundingClientRect();
      const sourceParentRect = sourceParent.getBoundingClientRect();
      const targetParentRect = targetParent.getBoundingClientRect();
      
      // Calculate relative positions within their containers
      const sourceRelativeX = sourceRect.left - sourceParentRect.left;
      const targetRelativeX = targetRect.left - targetParentRect.left;
      const sourceRelativeY = sourceRect.top - sourceParentRect.top;
      const targetRelativeY = targetRect.top - targetParentRect.top;
      
      // If there's a significant position difference, it might be due to alignment
      if (Math.abs(sourceRelativeX - targetRelativeX) > 1) {
        changes.push({
          type: AnimationType.TRANSFORM,
          property: 'alignTranslateX',
          sourceValue: sourceRelativeX,
          targetValue: targetRelativeX,
          changed: true,
          translationCondition
        });
      }
      
      if (Math.abs(sourceRelativeY - targetRelativeY) > 1) {
        changes.push({
          type: AnimationType.TRANSFORM,
          property: 'alignTranslateY',
          sourceValue: sourceRelativeY,
          targetValue: targetRelativeY,
          changed: true,
          translationCondition
        });
      }
    }
  }
  
  return changes;
}

/**
 * Creates animation context for an element
 */
export function createAnimationContext(
  element: HTMLElement,
  node: FigmaNode,
  parentNode?: FigmaNode
): ElementAnimationContext {
  return {
    element,
    node,
    parentNode,
    changes: []
  };
}

/**
 * Applies animation changes to an element based on its type and condition
 */
export function applyAnimationChange(
  element: HTMLElement,
  change: AnimationChange,
  duration: number,
  easing: string
): void {
  const { type, property, targetValue, translationCondition } = change;
  
  // Set up transition
  const transitionProperty = getTransitionProperty(property, type, translationCondition);
  element.style.transition = `${transitionProperty} ${duration}s ${easing}`;
  
  // Apply the change based on type and condition
  switch (type) {
    case AnimationType.SIMPLE:
      applySimpleAnimation(element, property, targetValue);
      break;
      
    case AnimationType.SIZE:
      applySizeAnimation(element, property, targetValue);
      break;
      
    case AnimationType.TRANSFORM:
      applyTransformAnimation(element, property, targetValue, translationCondition);
      break;
  }
}

/**
 * Gets the appropriate CSS transition property for an animation
 */
function getTransitionProperty(property: string, type: AnimationType, translationCondition?: TranslationCondition): string {
  switch (type) {
    case AnimationType.SIMPLE:
      return property;
      
    case AnimationType.SIZE:
      return property;
      
    case AnimationType.TRANSFORM:
      if (translationCondition === TranslationCondition.ABSOLUTE) {
        return property === 'translateX' ? 'left' : 'top';
      } else if (translationCondition === TranslationCondition.RELATIVE_PADDING) {
        return property.replace('parent_', '');
      } else if (translationCondition === TranslationCondition.RELATIVE_ALIGNMENT) {
        return property.replace('parent_', '');
      }
      return 'transform';
  }
}

/**
 * Applies simple animations (opacity, color, etc.)
 */
function applySimpleAnimation(element: HTMLElement, property: string, targetValue: any): void {
  element.style[property as any] = targetValue;
}

/**
 * Applies size animations (width, height)
 */
function applySizeAnimation(element: HTMLElement, property: string, targetValue: number): void {
  element.style[property as any] = `${targetValue}px`;
}

/**
 * Applies transform animations based on translation condition
 */
function applyTransformAnimation(
  element: HTMLElement, 
  property: string, 
  targetValue: any, 
  translationCondition?: TranslationCondition
): void {
  switch (translationCondition) {
    case TranslationCondition.ABSOLUTE:
      // Use direct positioning
      if (property === 'translateX') {
        element.style.left = `${targetValue}px`;
      } else if (property === 'translateY') {
        element.style.top = `${targetValue}px`;
      }
      break;
      
    case TranslationCondition.RELATIVE_PADDING:
      // Apply padding to parent
      if (element.parentElement) {
        const paddingProperty = property.replace('parent_', '');
        element.parentElement.style[paddingProperty as any] = `${targetValue}px`;
      }
      break;
      
    case TranslationCondition.RELATIVE_ALIGNMENT:
      // Apply alignment to parent
      if (element.parentElement) {
        const alignmentProperty = property.replace('parent_', '');
        element.parentElement.style[alignmentProperty as any] = targetValue;
      }
      break;
      
    default:
      // Fallback to transform
      if (property === 'translateX') {
        element.style.transform = `translateX(${targetValue}px)`;
      } else if (property === 'translateY') {
        element.style.transform = `translateY(${targetValue}px)`;
      }
      break;
  }
}

/**
 * Maps Figma animation types to CSS easing functions
 */
export function getEasingFunction(animationType: string): string {
  switch (animationType) {
    case 'EASE_IN_AND_OUT_BACK':
      return 'cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    case 'EASE_IN_AND_OUT':
      return 'ease-in-out';
    case 'EASE_IN':
      return 'ease-in';
    case 'EASE_OUT':
      return 'ease-out';
    case 'LINEAR':
      return 'linear';
    case 'BOUNCY':
      return 'cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    case 'GENTLE':
      return 'ease-in-out';
    case 'SMART_ANIMATE':
      return 'ease-in-out';
    default:
      return 'ease-out';
  }
}

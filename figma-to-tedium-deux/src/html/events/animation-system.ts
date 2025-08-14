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

// Animation session state
export interface AnimationSession {
  sourceElement: HTMLElement;
  targetElement: HTMLElement;
  sourceCopy: HTMLElement | null;
  allVariants: HTMLElement[];
  transitionType: string;
  transitionDuration: number;
  isActive: boolean;
}

/**
 * PHASE 1: SETUP - Sets initial values on nodes/variants/instances/sets/etc.
 * Primes HTML for animation from variant 1 to 2
 */
export function setupAnimationSession(
  sourceElement: HTMLElement,
  targetElement: HTMLElement,
  allVariants: HTMLElement[],
  transitionType: string,
  transitionDuration: number
): AnimationSession {
  console.log('🎬 SETUP PHASE: Initializing animation session');
  
  // Create animation session
  const session: AnimationSession = {
    sourceElement,
    targetElement,
    sourceCopy: null,
    allVariants,
    transitionType,
    transitionDuration,
    isActive: true
  };

  // Set initial state for all variants
  allVariants.forEach(variant => {
    if (variant === sourceElement) {
      // Source variant should be visible initially
      variant.classList.add('variant-active');
      variant.classList.remove('variant-hidden');
      variant.style.visibility = 'visible';
      variant.style.opacity = '1';
    } else {
      // All other variants should be hidden
      variant.classList.add('variant-hidden');
      variant.classList.remove('variant-active');
      variant.style.visibility = 'hidden';
      variant.style.opacity = '0';
    }
  });

  // Prepare target variant but keep it hidden
  targetElement.classList.add('variant-active');
  targetElement.classList.remove('variant-hidden');
  targetElement.style.visibility = 'hidden';
  targetElement.style.opacity = '0';

  console.log('✅ SETUP PHASE: Animation session initialized');
  return session;
}

/**
 * PHASE 2: ANIMATE - Performs copy of source, hides source, animates values if necessary
 */
export async function animateVariantTransition(session: AnimationSession): Promise<void> {
  console.log('🎭 ANIMATE PHASE: Starting variant transition animation');
  
  if (!session.isActive) {
    console.log('❌ ANIMATE PHASE: Session is not active, skipping animation');
    return;
  }

  // Create a copy of the source variant
  session.sourceCopy = createElementCopy(session.sourceElement);
  console.log('📋 ANIMATE PHASE: Created source element copy');

  // Insert the copy into the DOM
  const sourceParent = session.sourceElement.parentElement;
  if (sourceParent && session.sourceCopy) {
    sourceParent.appendChild(session.sourceCopy);
    console.log('📋 ANIMATE PHASE: Inserted copy into DOM');
  }

  // Hide the original source element
  session.sourceElement.style.opacity = '0';
  session.sourceElement.style.visibility = 'hidden';

  // Hide all other variants
  session.allVariants.forEach(variant => {
    if (variant !== session.sourceElement) {
      variant.style.opacity = '0';
      variant.style.visibility = 'hidden';
    }
  });

  // Animate the copy to match the destination
  if (session.sourceCopy) {
    await animateCopyToDestination(
      session.sourceCopy,
      session.targetElement,
      session.sourceElement,
      session.transitionType,
      session.transitionDuration.toString()
    );
  }

  console.log('✅ ANIMATE PHASE: Animation completed');
}

/**
 * PHASE 3: CLEANUP - Deletes copy, shows target variant, resets animation system
 */
export function cleanupAnimationSession(session: AnimationSession): void {
  console.log('🧹 CLEANUP PHASE: Cleaning up animation session');

  // Remove the copy
  if (session.sourceCopy) {
    session.sourceCopy.remove();
    session.sourceCopy = null;
    console.log('🗑️ CLEANUP PHASE: Removed source copy');
  }

  // Hide the original source element permanently
  session.sourceElement.style.opacity = '0';
  session.sourceElement.style.visibility = 'hidden';
  session.sourceElement.classList.add('variant-hidden');
  session.sourceElement.classList.remove('variant-active');

  // Show the destination variant with proper positioning
  session.targetElement.style.visibility = 'visible';
  session.targetElement.style.opacity = '1';
  session.targetElement.style.display = 'flex';
  session.targetElement.classList.add('variant-active');
  session.targetElement.classList.remove('variant-hidden');

  // Reset any absolute positioning that might have been applied during animation
  session.targetElement.style.position = 'relative';
  session.targetElement.style.left = '';
  session.targetElement.style.top = '';
  session.targetElement.style.transform = '';

  // Ensure all nested components within the destination variant are visible
  const nestedElements = session.targetElement.querySelectorAll('[data-figma-id]');
  nestedElements.forEach(nestedElement => {
    if (nestedElement.classList.contains('variant-hidden')) {
      nestedElement.classList.remove('variant-hidden');
    }
    
    if (!nestedElement.classList.contains('variant-hidden')) {
      (nestedElement as HTMLElement).style.visibility = 'visible';
      (nestedElement as HTMLElement).style.opacity = '1';
      if (window.getComputedStyle(nestedElement).display === 'none') {
        (nestedElement as HTMLElement).style.display = 'flex';
      }
    }
  });

  // Hide all other variants
  session.allVariants.forEach(variant => {
    if (variant !== session.targetElement) {
      variant.classList.add('variant-hidden');
      variant.classList.remove('variant-active');
      variant.style.opacity = '0';
      variant.style.visibility = 'hidden';
    }
  });

  // Mark session as inactive
  session.isActive = false;

  console.log('✅ CLEANUP PHASE: Animation session cleaned up');
}

/**
 * Helper function to create element copy
 */
function createElementCopy(sourceElement: HTMLElement): HTMLElement {
  console.log('📋 Creating element copy for:', sourceElement.getAttribute('data-figma-name') || sourceElement.getAttribute('data-figma-id'));
  
  const copy = sourceElement.cloneNode(true) as HTMLElement;
  copy.setAttribute('data-figma-id', sourceElement.getAttribute('data-figma-id') + '-copy');
  copy.setAttribute('data-is-animation-copy', 'true');
  
  // Position the copy absolutely over the source element
  const sourceRect = sourceElement.getBoundingClientRect();
  const parentRect = sourceElement.parentElement!.getBoundingClientRect();
  
  copy.style.position = 'absolute';
  copy.style.top = (sourceRect.top - parentRect.top) + 'px';
  copy.style.left = (sourceRect.left - parentRect.left) + 'px';
  copy.style.transform = 'none';
  copy.style.margin = '0';
  copy.style.padding = '0';
  
  // Set high z-index
  const allElements = document.querySelectorAll('*');
  let maxZIndex = 0;
  allElements.forEach(el => {
    const zIndex = parseInt(window.getComputedStyle(el).zIndex) || 0;
    if (zIndex > maxZIndex) maxZIndex = zIndex;
  });
  
  const copyZIndex = maxZIndex + 1000;
  copy.style.zIndex = copyZIndex.toString();
  copy.style.pointerEvents = 'none';
  copy.style.transform = 'translateZ(0)';
  copy.style.willChange = 'transform, left, top';
  
  // Preserve original overflow, display, and visibility from source element
  const sourceComputedStyle = window.getComputedStyle(sourceElement);
  copy.style.overflow = sourceComputedStyle.overflow;
  copy.style.display = sourceComputedStyle.display;
  copy.style.visibility = sourceComputedStyle.visibility;
  copy.style.opacity = '1';

  // Ensure all nodes in the copy are visible
  const copyChildren = copy.querySelectorAll('*');
  copyChildren.forEach(child => {
    (child as HTMLElement).style.opacity = '1';
  });

  console.log('📋 Copy creation completed');
  return copy;
}

/**
 * Helper function to animate copy to destination
 */
async function animateCopyToDestination(
  copy: HTMLElement,
  destination: HTMLElement,
  originalSourceElement: HTMLElement,
  transitionType: string,
  transitionDuration: string
): Promise<void> {
  return new Promise((resolve) => {
    // Update copy content to match destination content
    updateCopyContentToMatchDestination(copy, destination);
    
    // Find elements with property changes
    const elementsToAnimate = findElementsWithPropertyChanges(destination, copy, originalSourceElement);
    const easingFunction = getEasingFunction(transitionType);
    const duration = parseFloat(transitionDuration || '0.3');
    
    if (elementsToAnimate.length > 0) {
      console.log('🎭 Animating copy with', elementsToAnimate.length, 'elements');
      
      // Setup animation for each element
      elementsToAnimate.forEach(({ element, changes }) => {
        // Handle nested instance variant switch
        if (changes.isNestedInstanceVariantSwitch) {
          handleNestedInstanceVariantSwitch(element, changes);
          return;
        }
        
        // Apply animation changes
        const animationChanges = convertChangesToAnimationChanges(changes);
        animationChanges.forEach(change => {
          applyAnimationChange(element, change, duration, easingFunction);
        });
      });
      
      // Monitor animation completion
      let completedAnimations = 0;
      const totalAnimations = elementsToAnimate.length;
      
      const onTransitionEnd = (event: TransitionEvent) => {
        const targetElement = event.target as HTMLElement;
        const propertyName = event.propertyName;
        
        const animatedElement = elementsToAnimate.find(({ element }) => 
          targetElement === element || element.contains(targetElement)
        );
        
        if (animatedElement) {
          completedAnimations++;
          if (completedAnimations >= totalAnimations) {
            console.log('🎭 All animations completed');
            copy.removeEventListener('transitionend', onTransitionEnd);
            resolve();
          }
        }
      };
      
      copy.addEventListener('transitionend', onTransitionEnd);
      
      // Fallback timeout
      setTimeout(() => {
        console.log('🎭 Animation completed via timeout');
        copy.removeEventListener('transitionend', onTransitionEnd);
        resolve();
      }, duration * 1000 + 500);
    } else {
      resolve();
    }
  });
}

/**
 * Helper function to update copy content to match destination
 */
function updateCopyContentToMatchDestination(copy: HTMLElement, destination: HTMLElement): void {
  console.log('📋 Updating copy content to match destination');
  
  const copyElements = copy.querySelectorAll('[data-figma-id]');
  const destinationElements = destination.querySelectorAll('[data-figma-id]');
  
  // Create a map of destination elements by name
  const destinationElementMap = new Map();
  destinationElements.forEach(element => {
    const name = element.getAttribute('data-figma-name') || element.getAttribute('data-figma-id');
    if (name) {
      destinationElementMap.set(name, element);
    }
  });
  
  // Update each copy element's content to match destination
  copyElements.forEach(copyElement => {
    const copyElementName = copyElement.getAttribute('data-figma-name') || copyElement.getAttribute('data-figma-id');
    const destinationElement = destinationElementMap.get(copyElementName);
    
    if (destinationElement) {
      // Update text content
      if (destinationElement.textContent !== copyElement.textContent) {
        copyElement.textContent = destinationElement.textContent;
      }
      
      // Update innerHTML for more complex content, but preserve positioning
      if (destinationElement.innerHTML !== copyElement.innerHTML) {
        // Preserve positioning before updating content
        const allNestedElements = copyElement.querySelectorAll('[data-figma-id]');
        const originalPositions = new Map();
        
        allNestedElements.forEach(nestedElement => {
          const nestedElementName = nestedElement.getAttribute('data-figma-name') || nestedElement.getAttribute('data-figma-id');
          const computedStyle = window.getComputedStyle(nestedElement);
          originalPositions.set(nestedElementName, {
            position: computedStyle.position,
            left: computedStyle.left,
            top: computedStyle.top,
            transform: computedStyle.transform
          });
        });
        
        // Also preserve the copy element itself
        const copyComputedStyle = window.getComputedStyle(copyElement);
        originalPositions.set(copyElementName, {
          position: copyComputedStyle.position,
          left: copyComputedStyle.left,
          top: copyComputedStyle.top,
          transform: copyComputedStyle.transform
        });
        
        // Update the innerHTML
        copyElement.innerHTML = destinationElement.innerHTML;
        
        // Restore positioning after content update
        originalPositions.forEach((positionData, elementName) => {
          const elementToRestore = elementName === copyElementName ? 
            copyElement : 
            copyElement.querySelector('[data-figma-name="' + elementName + '"]') ||
            copyElement.querySelector('[data-figma-id="' + elementName + '"]');
          
          if (elementToRestore) {
            (elementToRestore as HTMLElement).style.position = positionData.position;
            (elementToRestore as HTMLElement).style.left = positionData.left;
            (elementToRestore as HTMLElement).style.top = positionData.top;
            (elementToRestore as HTMLElement).style.transform = positionData.transform;
          }
        });
      }
      
      // Update specific attributes that might contain content
      const contentAttributes = ['data-content', 'data-text', 'title', 'alt'];
      contentAttributes.forEach(attr => {
        const destValue = destinationElement.getAttribute(attr);
        const copyValue = copyElement.getAttribute(attr);
        if (destValue !== copyValue && destValue !== null) {
          copyElement.setAttribute(attr, destValue);
        }
      });
    }
  });
  
  // Ensure all elements in the copy have opacity 1
  const allCopyElements = copy.querySelectorAll('*');
  allCopyElements.forEach(element => {
    (element as HTMLElement).style.opacity = '1';
  });
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
      return 'ease-in-out'; // Use standard ease-in-out to eliminate back effect
    case 'EASE_IN_AND_OUT':
      return 'ease-in-out';
    case 'EASE_IN':
      return 'ease-in';
    case 'EASE_OUT':
      return 'ease-out';
    case 'LINEAR':
      return 'linear';
    case 'BOUNCY':
      return 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'; // Bouncy curve
    case 'GENTLE':
      return 'ease-in-out';
    case 'SMART_ANIMATE':
      return 'ease-in-out';
    default:
      return 'ease-out';
  }
}

/**
 * Helper function to find elements with property changes between variants
 */
function findElementsWithPropertyChanges(
  targetVariant: HTMLElement,
  currentVariant: HTMLElement,
  originalSourceVariant: HTMLElement
): Array<{ element: HTMLElement; sourceElement: HTMLElement; changes: any }> {
  console.log('🔍 Finding elements with property changes');
  
  // Check if this is a nested instance with internal variants
  let isNestedInstance = false;
  let parentInstance = null;
  let parentComponentSet = null;
  
  if (originalSourceVariant) {
    parentComponentSet = originalSourceVariant.closest('[data-figma-type="COMPONENT_SET"]');
    if (parentComponentSet) {
      parentInstance = parentComponentSet.closest('[data-figma-type="INSTANCE"]');
      if (parentInstance) {
        isNestedInstance = true;
        console.log('🔍 Detected nested instance structure');
      }
    }
  }
  
  if (isNestedInstance) {
    console.log('🔍 Handling nested instance variant switch');
    
    const sourceComponentSet = parentComponentSet;
    const targetComponentSet = targetVariant.querySelector('[data-figma-type="COMPONENT_SET"]');
    
    if (sourceComponentSet && targetComponentSet) {
      const sourceActiveVariant = sourceComponentSet.querySelector('.variant-active');
      const targetActiveVariant = targetComponentSet.querySelector('.variant-active');
      
      if (sourceActiveVariant && targetActiveVariant) {
        return [{
          element: parentInstance || currentVariant,
          sourceElement: parentInstance || originalSourceVariant,
          changes: {
            hasChanges: true,
            isNestedInstanceVariantSwitch: true,
            sourceVariant: sourceActiveVariant,
            targetVariant: targetActiveVariant
          }
        }];
      }
    }
  }
  
  const targetElements = targetVariant.querySelectorAll('[data-figma-id]');
  const sourceElements = currentVariant.querySelectorAll('[data-figma-id]');
  const sourceElementMap = new Map();
  const elementsToAnimate = [];

  // Build source element map by name
  sourceElements.forEach(sourceElement => {
    const sourceName = sourceElement.getAttribute('data-figma-name') || sourceElement.getAttribute('data-figma-id');
    if (sourceName) {
      sourceElementMap.set(sourceName, sourceElement);
    }
  });

  // Check for parent alignment changes first
  const parentAlignmentChanges = [];
  targetElements.forEach(element => {
    const targetName = element.getAttribute('data-figma-name') || element.getAttribute('data-figma-id');
    const sourceElement = sourceElementMap.get(targetName);
    
    if (sourceElement) {
      const sourceParent = sourceElement.parentElement;
      const targetParent = element.parentElement;
      
      if (sourceParent && targetParent) {
        const sourceParentStyle = window.getComputedStyle(sourceParent);
        const targetParentStyle = window.getComputedStyle(targetParent);
        
        if (sourceParentStyle.justifyContent !== targetParentStyle.justifyContent ||
            sourceParentStyle.alignItems !== targetParentStyle.alignItems) {
          
          const parentChanges = {
            hasChanges: true,
            justifyContent: { 
              changed: sourceParentStyle.justifyContent !== targetParentStyle.justifyContent,
              sourceValue: sourceParentStyle.justifyContent,
              targetValue: targetParentStyle.justifyContent
            },
            alignItems: { 
              changed: sourceParentStyle.alignItems !== targetParentStyle.alignItems,
              sourceValue: sourceParentStyle.alignItems,
              targetValue: targetParentStyle.alignItems
            }
          };
          
          parentAlignmentChanges.push({
            element: sourceElement,
            sourceElement: sourceElement,
            changes: parentChanges
          });
        }
      }
    }
  });
  
  // If we found parent alignment changes, prioritize those
  if (parentAlignmentChanges.length > 0) {
    elementsToAnimate.push(...parentAlignmentChanges);
  } else {
    // Check for child position changes
    targetElements.forEach(element => {
      const targetName = element.getAttribute('data-figma-name') || element.getAttribute('data-figma-id');
      const sourceElement = sourceElementMap.get(targetName);
      
      if (sourceElement) {
        const changes = detectPropertyChanges(element as HTMLElement, sourceElement, originalSourceVariant);
        
        if (changes.hasChanges) {
          elementsToAnimate.push({
            element: sourceElement,
            sourceElement: sourceElement,
            changes: changes
          });
        }
      }
    });
  }
  
  console.log('🔍 Found', elementsToAnimate.length, 'elements to animate');
  return elementsToAnimate;
}

/**
 * Helper function to detect property changes between elements
 */
function detectPropertyChanges(
  targetElement: HTMLElement,
  sourceElement: HTMLElement,
  originalSourceVariant: HTMLElement
): any {
  const changes = {
    hasChanges: false,
    positionX: { changed: false, sourceValue: null, targetValue: null },
    positionY: { changed: false, sourceValue: null, targetValue: null },
    backgroundColor: { changed: false, sourceValue: null, targetValue: null },
    color: { changed: false, sourceValue: null, targetValue: null },
    justifyContent: { changed: false, sourceValue: null, targetValue: null },
    alignItems: { changed: false, sourceValue: null, targetValue: null }
  };

  try {
    const sourceStyle = window.getComputedStyle(sourceElement);
    const targetStyle = window.getComputedStyle(targetElement);
    
    // Check for parent alignment changes first
    const sourceParent = sourceElement.parentElement;
    const targetParent = targetElement.parentElement;
    
    if (sourceParent && targetParent) {
      const sourceParentStyle = window.getComputedStyle(sourceParent);
      const targetParentStyle = window.getComputedStyle(targetParent);
      
      if (sourceParentStyle.justifyContent !== targetParentStyle.justifyContent ||
          sourceParentStyle.alignItems !== targetParentStyle.alignItems) {
        
        changes.hasChanges = true;
        changes.justifyContent = { 
          changed: sourceParentStyle.justifyContent !== targetParentStyle.justifyContent,
          sourceValue: sourceParentStyle.justifyContent,
          targetValue: targetParentStyle.justifyContent
        };
        changes.alignItems = { 
          changed: sourceParentStyle.alignItems !== targetParentStyle.alignItems,
          sourceValue: sourceParentStyle.alignItems,
          targetValue: targetParentStyle.alignItems
        };
        
        return changes;
      }
    }
  } catch (error) {
    console.log('Error in parent alignment check:', error);
  }

  try {
    const sourceStyle = window.getComputedStyle(sourceElement);
    const targetStyle = window.getComputedStyle(targetElement);
    
    // Use Figma coordinates directly for comparison
    const sourceFigmaY = parseFloat(originalSourceVariant.getAttribute('data-figma-y')) || 0;
    const targetFigmaY = parseFloat(targetElement.getAttribute('data-figma-y')) || 0;
    const sourceFigmaX = parseFloat(originalSourceVariant.getAttribute('data-figma-x')) || 0;
    const targetFigmaX = parseFloat(targetElement.getAttribute('data-figma-x')) || 0;
    
    const sourceRelativeLeft = sourceFigmaX;
    const sourceRelativeTop = sourceFigmaY;
    const targetRelativeLeft = targetFigmaX;
    const targetRelativeTop = targetFigmaY;
    
    // Check if the node has ignore auto layout enabled
    const ignoreAutoLayout = sourceElement.getAttribute('data-layout-positioning') === 'ABSOLUTE';
    
    // Check if the node's parent has auto layout
    const sourceParent = sourceElement.parentElement;
    const targetParent = targetElement.parentElement;
    const parentHasAutoLayout = sourceParent && targetParent && 
      sourceParent.getAttribute('data-layout-mode') && 
      sourceParent.getAttribute('data-layout-mode') !== 'NONE';
    
    // Determine if this node should be animated
    let shouldAnimatePosition = false;
    
    if (Math.abs(sourceRelativeLeft - targetRelativeLeft) > 1 || Math.abs(sourceRelativeTop - targetRelativeTop) > 1) {
      if (ignoreAutoLayout || !parentHasAutoLayout) {
        shouldAnimatePosition = true;
      } else {
        shouldAnimatePosition = true;
      }
    }
    
    // Apply position changes if animation is needed
    if (shouldAnimatePosition) {
      if (Math.abs(sourceRelativeLeft - targetRelativeLeft) > 1) {
        changes.positionX.changed = true;
        changes.positionX.sourceValue = 0;
        changes.positionX.targetValue = targetRelativeLeft - sourceRelativeLeft;
        changes.hasChanges = true;
      }
      
      if (Math.abs(sourceRelativeTop - targetRelativeTop) > 1) {
        changes.positionY.changed = true;
        changes.positionY.sourceValue = 0;
        changes.positionY.targetValue = targetRelativeTop - sourceRelativeTop;
        changes.hasChanges = true;
      }
    }

    // Check style changes (non-position)
    const sourceBg = sourceStyle.backgroundColor || 'rgba(0, 0, 0, 0)';
    const targetBg = targetStyle.backgroundColor || 'rgba(0, 0, 0, 0)';
    
    if (sourceBg !== targetBg) {
      changes.backgroundColor.changed = true;
      changes.backgroundColor.sourceValue = sourceBg;
      changes.backgroundColor.targetValue = targetBg;
      changes.hasChanges = true;
    }
    
    if (sourceStyle.color !== targetStyle.color) {
      changes.color.changed = true;
      changes.color.sourceValue = sourceStyle.color;
      changes.color.targetValue = targetStyle.color;
      changes.hasChanges = true;
    }
    
    // Check alignment changes
    if (sourceStyle.justifyContent !== targetStyle.justifyContent) {
      changes.justifyContent.changed = true;
      changes.justifyContent.sourceValue = sourceStyle.justifyContent;
      changes.justifyContent.targetValue = targetStyle.justifyContent;
      
      if (shouldAnimatePosition) {
        changes.hasChanges = true;
      }
    }
    
    if (sourceStyle.alignItems !== targetStyle.alignItems) {
      changes.alignItems.changed = true;
      changes.alignItems.sourceValue = sourceStyle.alignItems;
      changes.alignItems.targetValue = targetStyle.alignItems;
      
      if (shouldAnimatePosition) {
        changes.hasChanges = true;
      }
    }
    
  } catch (error) {
    console.log('Error detecting property changes:', error);
  }

  return changes;
}

/**
 * Helper function to handle nested instance variant switch
 */
function handleNestedInstanceVariantSwitch(element: HTMLElement, changes: any): void {
  console.log('🔄 Handling nested instance variant switch');
  
  const sourceComponentSet = element.querySelector('[data-figma-type="COMPONENT_SET"]');
  if (sourceComponentSet) {
    // Hide current active variant
    const currentActiveVariant = sourceComponentSet.querySelector('.variant-active');
    if (currentActiveVariant) {
      currentActiveVariant.classList.remove('variant-active');
      currentActiveVariant.classList.add('variant-hidden');
    }
    
    // Show target variant
    const targetVariant = changes.targetVariant;
    if (targetVariant) {
      targetVariant.classList.add('variant-active');
      targetVariant.classList.remove('variant-hidden');
    }
  }
}

/**
 * Helper function to convert changes to animation changes
 */
function convertChangesToAnimationChanges(changes: any): AnimationChange[] {
  const animationChanges: AnimationChange[] = [];
  
  // Handle position changes - use combined transform for simultaneous X and Y movement
  const hasPositionX = changes.positionX && changes.positionX.changed;
  const hasPositionY = changes.positionY && changes.positionY.changed;
  
  if (hasPositionX || hasPositionY) {
    const translateX = hasPositionX ? changes.positionX.targetValue : 0;
    const translateY = hasPositionY ? changes.positionY.targetValue : 0;
    
    animationChanges.push({
      type: AnimationType.TRANSFORM,
      property: 'translate',
      sourceValue: { x: 0, y: 0 },
      targetValue: { x: translateX, y: translateY },
      changed: true,
      translationCondition: TranslationCondition.ABSOLUTE
    });
  }
  
  // Handle color changes
  if (changes.backgroundColor && changes.backgroundColor.changed) {
    animationChanges.push({
      type: AnimationType.SIMPLE,
      property: 'backgroundColor',
      sourceValue: changes.backgroundColor.sourceValue,
      targetValue: changes.backgroundColor.targetValue,
      changed: true
    });
  }
  
  if (changes.color && changes.color.changed) {
    animationChanges.push({
      type: AnimationType.SIMPLE,
      property: 'color',
      sourceValue: changes.color.sourceValue,
      targetValue: changes.color.targetValue,
      changed: true
    });
  }
  
  return animationChanges;
}

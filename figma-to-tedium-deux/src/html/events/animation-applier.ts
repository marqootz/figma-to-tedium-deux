/**
 * Animation Application Module
 * 
 * Responsible for applying animations to elements based on detected changes.
 * This module handles the logic for setting up CSS transitions, applying
 * property changes, and managing the animation lifecycle.
 */

import { AnimationType, TranslationCondition } from './animation-detector';

// Animation change interface
export interface AnimationChange {
  type: string;
  property: string;
  sourceValue: any;
  targetValue: any;
  changed: boolean;
  translationCondition?: string;
  isCombinedTransform?: boolean;
}

/**
 * Get easing function for animation type
 */
export function getEasingFunction(animationType: string): string {
  switch (animationType) {
    case 'EASE_IN_AND_OUT_BACK':
      return 'ease-in-out';
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

/**
 * Apply animation change to an element
 */
export function applyAnimationChange(
  element: HTMLElement, 
  change: AnimationChange, 
  duration: number, 
  easing: string,
  destination?: HTMLElement
): void {
  const { type, property, targetValue, translationCondition } = change;
  
  console.log('DEBUG: Applying animation change:', { type, property, targetValue, translationCondition });
  
  // Get transition property
  let transitionProperty = property;
  if (type === AnimationType.TRANSFORM) {
    if (translationCondition === TranslationCondition.ABSOLUTE) {
      transitionProperty = property === 'translateX' ? 'left' : 'top';
    } else if (translationCondition === TranslationCondition.RELATIVE_PADDING) {
      transitionProperty = property.replace('parent_', '');
    } else if (translationCondition === TranslationCondition.RELATIVE_ALIGNMENT) {
      if (property === 'alignTranslateX' || property === 'alignTranslateY') {
        transitionProperty = property === 'alignTranslateX' ? 'left' : 'top';
      } else if (property.startsWith('parent_')) {
        // For alignment changes, animate the element's position instead of the parent's alignment
        if (property === 'parent_justifyContent') {
          // Use the target element's actual position from the destination variant
          const sourceElementName = element.getAttribute('data-figma-name');
          const targetElement = destination?.querySelector(`[data-figma-name="${sourceElementName}"]`);
          
          if (targetElement) {
            const targetRect = targetElement.getBoundingClientRect();
            const parent = element.parentElement;
            const parentRect = parent?.getBoundingClientRect();
            
            if (parent && parentRect) {
              // Calculate the target position relative to the parent
              const targetLeft = targetRect.left - parentRect.left;
              
              console.log('DEBUG: Calculating justifyContent animation using target position:', {
                currentLeft: element.getBoundingClientRect().left - parentRect.left,
                targetLeft: targetLeft,
                targetElementId: targetElement.getAttribute('data-figma-id'),
                targetElementName: sourceElementName,
                justifyContent: targetValue
              });
              
              // Set transition for left position
              element.style.transition = `left ${duration}s ${easing}`;
              element.style.left = `${targetLeft}px`;
              
              console.log('DEBUG: Applied justifyContent animation via target position:', {
                property: 'left',
                transitionProperty: 'left',
                targetValue: `${targetLeft}px`
              });
              
              return; // Skip the default handling
            }
          } else {
            console.log('DEBUG: Target element not found in destination by name:', sourceElementName);
          }
        } else if (property === 'parent_alignItems') {
          // Use the target element's actual position from the destination variant
          const sourceElementName = element.getAttribute('data-figma-name');
          const targetElement = destination?.querySelector(`[data-figma-name="${sourceElementName}"]`);
          
          if (targetElement) {
            const targetRect = targetElement.getBoundingClientRect();
            const parent = element.parentElement;
            const parentRect = parent?.getBoundingClientRect();
            
            if (parent && parentRect) {
              // Calculate the target position relative to the parent
              const targetTop = targetRect.top - parentRect.top;
              
              console.log('DEBUG: Calculating alignItems animation using target position:', {
                currentTop: element.getBoundingClientRect().top - parentRect.top,
                targetTop: targetTop,
                targetElementId: targetElement.getAttribute('data-figma-id'),
                targetElementName: sourceElementName,
                alignItems: targetValue
              });
              
              // Set transition for top position
              element.style.transition = `top ${duration}s ${easing}`;
              element.style.top = `${targetTop}px`;
              
              console.log('DEBUG: Applied alignItems animation via target position:', {
                property: 'top',
                transitionProperty: 'top',
                targetValue: `${targetTop}px`
              });
              
              return; // Skip the default handling
            }
          } else {
            console.log('DEBUG: Target element not found in destination by name:', sourceElementName);
          }
        }
        transitionProperty = property.replace('parent_', '');
      } else {
        transitionProperty = property;
      }
    }
  }
  
  // Set up transition
  element.style.transition = `${transitionProperty} ${duration}s ${easing}`;
  
  // Apply the change based on type and condition
  switch (type) {
    case AnimationType.SIMPLE:
      (element.style as any)[property] = targetValue;
      break;
      
    case AnimationType.SIZE:
      (element.style as any)[property] = `${targetValue}px`;
      break;
      
    case AnimationType.TRANSFORM:
      if (translationCondition === TranslationCondition.ABSOLUTE) {
        if (change.isCombinedTransform && property === 'translate') {
          // Handle combined X and Y transform for simultaneous movement
          const { x: translateX, y: translateY } = targetValue;
          
          // Use CSS transform for hardware-accelerated simultaneous animation
          element.style.transition = `transform ${duration}s ${easing}`;
          element.style.transform = `translate(${translateX}px, ${translateY}px)`;
          
          console.log('DEBUG: Applying combined transform animation:', {
            translateX: translateX,
            translateY: translateY,
            elementName: element.getAttribute('data-figma-name'),
            currentTransform: element.style.transform,
            targetTransform: `translate(${translateX}px, ${translateY}px)`
          });
        } else if (property === 'translateX') {
          // For additive position changes, add the difference to current position
          const currentLeft = parseFloat(element.style.left) || 0;
          const newLeft = currentLeft + targetValue;
          element.style.left = `${newLeft}px`;
          
          console.log('DEBUG: Applying additive translateX animation:', {
            currentLeft: currentLeft,
            targetValue: targetValue,
            newLeft: newLeft,
            elementName: element.getAttribute('data-figma-name')
          });
        } else if (property === 'translateY') {
          // For additive position changes, add the difference to current position
          const currentTop = parseFloat(element.style.top) || 0;
          const newTop = currentTop + targetValue;
          element.style.top = `${newTop}px`;
          
          console.log('DEBUG: Applying additive translateY animation:', {
            currentTop: currentTop,
            targetValue: targetValue,
            newTop: newTop,
            elementName: element.getAttribute('data-figma-name')
          });
        }
      } else if (translationCondition === TranslationCondition.RELATIVE_PADDING) {
        if (element.parentElement) {
          const paddingProperty = property.replace('parent_', '');
          (element.parentElement.style as any)[paddingProperty] = `${targetValue}px`;
        }
      } else if (translationCondition === TranslationCondition.RELATIVE_ALIGNMENT) {
        if (property === 'alignTranslateX') {
          element.style.left = `${targetValue}px`;
        } else if (property === 'alignTranslateY') {
          element.style.top = `${targetValue}px`;
        } else if (property.startsWith('parent_')) {
          if (element.parentElement) {
            const alignmentProperty = property.replace('parent_', '');
            (element.parentElement.style as any)[alignmentProperty] = targetValue;
          }
        } else {
          // Direct property change on the element
          (element.style as any)[property] = targetValue;
        }
      }
      break;
  }
  
  console.log('DEBUG: Applied change:', { property, transitionProperty, targetValue });
}

/**
 * Apply multiple animation changes to an element
 */
export function applyAnimationChanges(
  element: HTMLElement,
  changes: AnimationChange[],
  duration: number,
  easing: string,
  destination?: HTMLElement
): void {
  changes.forEach(change => {
    applyAnimationChange(element, change, duration, easing, destination);
  });
}

/**
 * Setup animation for element with property changes
 */
export function setupElementAnimation(
  element: HTMLElement,
  changes: any,
  duration: number,
  easing: string,
  destination?: HTMLElement
): void {
  console.log('DEBUG: Processing element with changes:', changes);
  
  // Convert the detected changes to animation changes
  const animationChanges: AnimationChange[] = [];
  
  // Handle position changes - use combined transform for simultaneous X and Y movement
  const hasPositionX = changes.positionX && changes.positionX.changed;
  const hasPositionY = changes.positionY && changes.positionY.changed;
  
  if (hasPositionX || hasPositionY) {
    // Create a single combined transform animation
    const translateX = hasPositionX ? changes.positionX.targetValue : 0;
    const translateY = hasPositionY ? changes.positionY.targetValue : 0;
    
    animationChanges.push({
      type: AnimationType.TRANSFORM,
      property: 'translate',
      sourceValue: { x: 0, y: 0 },
      targetValue: { x: translateX, y: translateY },
      changed: true,
      translationCondition: TranslationCondition.ABSOLUTE,
      isCombinedTransform: true
    });
    
    console.log('DEBUG: Created combined transform animation:', {
      translateX: translateX,
      translateY: translateY,
      elementName: element.getAttribute('data-figma-name')
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
  
  // Handle alignment changes
  if (changes.justifyContent && changes.justifyContent.changed) {
    // Calculate the position difference that the alignment change creates
    const parent = element.parentElement;
    if (parent) {
      const parentRect = parent.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const elementWidth = elementRect.width;
      
      // Calculate current position relative to parent
      const currentLeft = elementRect.left - parentRect.left;
      
      // Calculate target position based on alignment change
      let targetLeft = currentLeft;
      if (changes.justifyContent.targetValue === 'flex-end') {
        targetLeft = parentRect.width - elementWidth;
      } else if (changes.justifyContent.targetValue === 'center') {
        targetLeft = (parentRect.width - elementWidth) / 2;
      } else if (changes.justifyContent.targetValue === 'flex-start') {
        targetLeft = 0;
      }
      
      // Only animate if there's actually a position difference
      if (Math.abs(currentLeft - targetLeft) > 1) {
        console.log('DEBUG: Calculating justifyContent position animation:', {
          currentLeft: currentLeft,
          targetLeft: targetLeft,
          justifyContent: changes.justifyContent.targetValue,
          parentWidth: parentRect.width,
          elementWidth: elementWidth
        });
        
        // Animate the position, NOT the alignment
        element.style.transition = `left ${duration}s ${easing}`;
        element.style.left = `${targetLeft}px`;
        
        console.log('DEBUG: Applied justifyContent position animation:', {
          property: 'left',
          transitionProperty: 'left',
          targetValue: `${targetLeft}px`
        });
      } else {
        console.log('DEBUG: JustifyContent change detected but no position difference - skipping animation');
      }
      
      // Don't add to animationChanges array since we're handling it directly
      return;
    }
  }
  
  if (changes.alignItems && changes.alignItems.changed) {
    // Calculate the position difference that the alignment change creates
    const parent = element.parentElement;
    if (parent) {
      const parentRect = parent.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const elementHeight = elementRect.height;
      
      // Calculate current position relative to parent
      const currentTop = elementRect.top - parentRect.top;
      
      // Calculate target position based on alignment change
      let targetTop = currentTop;
      if (changes.alignItems.targetValue === 'flex-end') {
        targetTop = parentRect.height - elementHeight;
      } else if (changes.alignItems.targetValue === 'center') {
        targetTop = (parentRect.height - elementHeight) / 2;
      } else if (changes.alignItems.targetValue === 'flex-start') {
        targetTop = 0;
      }
      
      // Only animate if there's actually a position difference
      if (Math.abs(currentTop - targetTop) > 1) {
        console.log('DEBUG: Calculating alignItems position animation:', {
          currentTop: currentTop,
          targetTop: targetTop,
          alignItems: changes.alignItems.targetValue,
          parentHeight: parentRect.height,
          elementHeight: elementHeight
        });
        
        // Animate the position, NOT the alignment
        element.style.transition = `top ${duration}s ${easing}`;
        element.style.top = `${targetTop}px`;
        
        console.log('DEBUG: Applied alignItems position animation:', {
          property: 'top',
          transitionProperty: 'top',
          targetValue: `${targetTop}px`
        });
      } else {
        console.log('DEBUG: AlignItems change detected but no position difference - skipping animation');
      }
      
      // Don't add to animationChanges array since we're handling it directly
      return;
    }
  }
  
  // Note: justifyContent and alignItems changes are handled directly above
  // and only applied if there's an actual position difference
  
  console.log('DEBUG: Converted to animation changes:', animationChanges);
  
  // Apply each change
  animationChanges.forEach(change => {
    applyAnimationChange(element, change, duration, easing, destination);
  });
}

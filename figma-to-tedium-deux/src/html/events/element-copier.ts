/**
 * Element Copying Module
 * 
 * Responsible for creating and managing element copies during animations.
 * This module handles the logic for copying source elements, positioning them,
 * and updating their content to match the destination.
 */

/**
 * Safe DOM manipulation utilities
 */
export function safeElementOperation<T extends HTMLElement>(
  element: T | null | undefined, 
  operation: (el: T) => void, 
  errorMessage: string
): boolean {
  if (!element) {
    console.error(`❌ DOM OPERATION FAILED: ${errorMessage} - element is null/undefined`);
    return false;
  }
  
  if (!(element instanceof HTMLElement)) {
    console.error(`❌ DOM OPERATION FAILED: ${errorMessage} - element is not HTMLElement`);
    return false;
  }
  
  try {
    operation(element);
    return true;
  } catch (error) {
    console.error(`❌ DOM OPERATION FAILED: ${errorMessage}`, error);
    return false;
  }
}

export function safeQuerySelector(selector: string, context: Document | Element = document): HTMLElement | null {
  try {
    const element = context.querySelector(selector);
    return element instanceof HTMLElement ? element : null;
  } catch (error) {
    console.error(`❌ QUERY SELECTOR FAILED: ${selector}`, error);
    return null;
  }
}

export function safeGetBoundingClientRect(element: HTMLElement): DOMRect | null {
  try {
    return element.getBoundingClientRect();
  } catch (error) {
    console.error('❌ GET BOUNDING CLIENT RECT FAILED:', error);
    return null;
  }
}

/**
 * FIX 5: Inject CSS to prevent animation conflicts
 */
export function injectAnimationCSS(): void {
  const styleId = 'figma-animation-styles';
  
  // Check if styles are already injected
  if (document.getElementById(styleId)) {
    return;
  }
  
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    /* Animation copy visibility */
    .animation-copy {
      display: flex !important;
      pointer-events: none !important;
      z-index: 9999 !important;
    }

    /* Source element hidden during animation */
    .animation-source-hidden {
      display: none !important;
    }

    /* Target element hidden during animation */
    .animation-target-hidden {
      display: none !important;
    }

    /* Ensure variant transitions are smooth */
    .variant-active {
      display: flex !important;
      visibility: visible !important;
      opacity: 1 !important;
    }

    .variant-hidden {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
    }

    /* Measurement override - highest specificity to override all other rules */
    .measuring-positions,
    .measuring-positions.variant-hidden,
    .measuring-positions.animation-source-hidden,
    .measuring-positions.animation-target-hidden {
      display: flex !important;
      visibility: visible !important;
      opacity: 1 !important;
      position: relative !important;
      top: 0px !important;
      left: 0px !important;
      transform: none !important;
    }

    /* Ensure child elements are also visible during measurement */
    .measuring-positions * {
      visibility: visible !important;
    }
  `;
  
  document.head.appendChild(style);
  console.log('✅ ANIMATION CSS: Injected animation styles to prevent conflicts');
}

/**
 * CORRECTED MEASUREMENT TIMING: Measure element positions with proper timing
 * The issue is in the measurement timing and method
 */
export function measureVariantPositions(sourceVariant: HTMLElement, targetVariant: HTMLElement): Promise<{ sourcePositions: Map<string, any>, targetPositions: Map<string, any> }> {
  console.log('📏 PRE-MEASUREMENT: Measuring source and target positions while visible');
  
  // CRITICAL FIX: Ensure positioning has taken effect before measurement
  // Force a reflow to ensure positioning changes are applied
  sourceVariant.offsetHeight; // Force reflow
  targetVariant.offsetHeight; // Force reflow
  
  // Add small delay to ensure positioning is fully applied
  return new Promise(resolve => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        console.log('📏 USING CLASS REMOVAL measurement (respects pre-positioning)');
        
        const sourcePositions = measureElementPositions(sourceVariant);
        const targetPositions = measureElementPositions(targetVariant);
        
        // VERIFICATION: Check that variants are actually at 0,0
        const sourceRect = sourceVariant.getBoundingClientRect();
        const targetRect = targetVariant.getBoundingClientRect();
        
        console.log('🔍 POSITION VERIFICATION:', {
          sourceVariant: {
            id: sourceVariant.dataset.figmaId,
            left: sourceRect.left,
            top: sourceRect.top,
            computedStyle: {
              left: getComputedStyle(sourceVariant).left,
              top: getComputedStyle(sourceVariant).top
            }
          },
          targetVariant: {
            id: targetVariant.dataset.figmaId,
            left: targetRect.left,
            top: targetRect.top,
            computedStyle: {
              left: getComputedStyle(targetVariant).left,
              top: getComputedStyle(targetVariant).top
            }
          }
        });
        
        // If variants are not at the same position, force them there
        if (Math.abs(sourceRect.left - targetRect.left) > 1 || 
            Math.abs(sourceRect.top - targetRect.top) > 1) {
          console.warn('⚠️ POSITION MISMATCH DETECTED - forcing repositioning');
          
          // Force both variants to exact same position with !important
          sourceVariant.style.setProperty('position', 'absolute', 'important');
          sourceVariant.style.setProperty('left', '0px', 'important');
          sourceVariant.style.setProperty('top', '0px', 'important');
          sourceVariant.style.setProperty('transform', 'none', 'important');
          
          targetVariant.style.setProperty('position', 'absolute', 'important');
          targetVariant.style.setProperty('left', '0px', 'important');
          targetVariant.style.setProperty('top', '0px', 'important');
          targetVariant.style.setProperty('transform', 'none', 'important');
          
          // Force another reflow and re-measure
          sourceVariant.offsetHeight;
          targetVariant.offsetHeight;
          
          // Re-measure after forced positioning
          const correctedSourcePositions = measureElementPositions(sourceVariant);
          const correctedTargetPositions = measureElementPositions(targetVariant);
          
          resolve({
            sourcePositions: correctedSourcePositions,
            targetPositions: correctedTargetPositions
          });
        } else {
          resolve({
            sourcePositions,
            targetPositions
          });
        }
      });
    });
  });
}

/**
 * Enhanced pre-positioning function
 */
export function ensureVariantsAtZeroPosition(componentSet: HTMLElement): boolean {
  console.log('📐 PRE-POSITIONING: Ensuring variants are at 0px top/left before measurement');
  console.log('📐 COMPONENT SET:', {
    id: componentSet.getAttribute('data-figma-id'),
    name: componentSet.getAttribute('data-figma-name'),
    type: componentSet.getAttribute('data-figma-type')
  });
  
  // Fix: Use the correct selector for variant elements
  const variants = componentSet.querySelectorAll('[data-figma-type="COMPONENT"]');
  console.log('📐 FOUND VARIANTS:', variants.length);
  
  variants.forEach((variant, index) => {
    // Store original position for debugging
    const originalRect = variant.getBoundingClientRect();
    
    // Force position to 0,0 with !important to override any CSS
    (variant as HTMLElement).style.setProperty('position', 'absolute', 'important');
    (variant as HTMLElement).style.setProperty('left', '0px', 'important');
    (variant as HTMLElement).style.setProperty('top', '0px', 'important');
    (variant as HTMLElement).style.setProperty('transform', 'none', 'important');
    
    // Verify the change took effect
    const newRect = variant.getBoundingClientRect();
    
    console.log('📐 POSITIONING:', {
      variantId: variant.getAttribute('data-figma-id'),
      variantName: variant.getAttribute('data-figma-name'),
      before: { left: originalRect.left, top: originalRect.top },
      after: { left: newRect.left, top: newRect.top },
      styles: {
        left: (variant as HTMLElement).style.left,
        top: (variant as HTMLElement).style.top,
        position: (variant as HTMLElement).style.position
      }
    });
  });
  
  // Force a comprehensive reflow
  componentSet.offsetHeight;
  
  // Double-check all variants are at 0,0
  let allPositioned = true;
  variants.forEach(variant => {
    const rect = variant.getBoundingClientRect();
    if (Math.abs(rect.left) > 1 || Math.abs(rect.top) > 1) {
      console.warn('⚠️ VARIANT NOT PROPERLY POSITIONED:', {
        id: variant.getAttribute('data-figma-id'),
        left: rect.left,
        top: rect.top
      });
      allPositioned = false;
    }
  });
  
  if (allPositioned) {
    console.log('📐 POSITIONING COMPLETE: All variants positioned at 0px top/left');
  } else {
    console.error('❌ POSITIONING FAILED: Some variants not properly positioned');
  }
  
  return allPositioned;
}

/**
 * POSITION MEASUREMENT FIX: Measure element positions while visible
 * This must happen BEFORE hiding elements to get accurate rectangles
 */
export function measureElementPositions(variantElement: HTMLElement): Map<string, any> {
  console.log('📏 MEASURING POSITIONS: Starting measurement for variant:', variantElement.getAttribute('data-figma-name'));
  
  const positions = new Map();
  
  // ✅ CRITICAL FIX: Remove CSS classes that have !important rules
  const originalClasses = {
    variantActive: variantElement.classList.contains('variant-active'),
    variantHidden: variantElement.classList.contains('variant-hidden'),
    animationSourceHidden: variantElement.classList.contains('animation-source-hidden'),
    animationTargetHidden: variantElement.classList.contains('animation-target-hidden')
  };
  
  // Store original inline styles (including positioning to preserve pre-positioning)
  const originalStyles = {
    display: variantElement.style.display,
    visibility: variantElement.style.visibility,
    opacity: variantElement.style.opacity,
    position: variantElement.style.position,
    top: variantElement.style.top,
    left: variantElement.style.left,
    transform: variantElement.style.transform
  };
  
  console.log(`📏 MEASUREMENT PREP: Element ${variantElement.getAttribute('data-figma-name')} - Original classes:`, originalClasses);
  
  // ✅ CRITICAL: Remove conflicting CSS classes temporarily
  variantElement.classList.remove('variant-hidden');
  variantElement.classList.remove('variant-active');
  variantElement.classList.remove('animation-source-hidden');
  variantElement.classList.remove('animation-target-hidden');
  
  // Set styles to ensure visibility (without !important conflicts)
  variantElement.style.display = 'flex';
  variantElement.style.visibility = 'visible';
  variantElement.style.opacity = '1';
  
  // Force reflow to apply changes
  variantElement.offsetHeight;
  
  // Measure the variant itself
  const variantRect = variantElement.getBoundingClientRect();
  positions.set(variantElement.getAttribute('data-figma-id'), {
    rect: variantRect,
    computedStyle: window.getComputedStyle(variantElement),
    element: variantElement
  });
  
  console.log(`📏 Measured variant ${variantElement.getAttribute('data-figma-name')}:`, {
    left: variantRect.left,
    top: variantRect.top,
    width: variantRect.width,
    height: variantRect.height
  });
  
  // Measure all child elements
  const childElements = variantElement.querySelectorAll('[data-figma-id]');
  childElements.forEach(element => {
    const rect = element.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(element);
    
    positions.set(element.getAttribute('data-figma-id'), {
      rect: rect,
      computedStyle: computedStyle,
      element: element
    });
    
    console.log(`📏 Measured child ${element.getAttribute('data-figma-name')}:`, {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height
    });
  });
  
  // ✅ RESTORE: Put back original classes and styles
  
  // Restore CSS classes
  if (originalClasses.variantActive) {
    variantElement.classList.add('variant-active');
  }
  if (originalClasses.variantHidden) {
    variantElement.classList.add('variant-hidden');
  }
  if (originalClasses.animationSourceHidden) {
    variantElement.classList.add('animation-source-hidden');
  }
  if (originalClasses.animationTargetHidden) {
    variantElement.classList.add('animation-target-hidden');
  }
  
  // Restore original inline styles (including positioning to preserve pre-positioning)
  variantElement.style.display = originalStyles.display;
  variantElement.style.visibility = originalStyles.visibility;
  variantElement.style.opacity = originalStyles.opacity;
  variantElement.style.position = originalStyles.position;
  variantElement.style.top = originalStyles.top;
  variantElement.style.left = originalStyles.left;
  variantElement.style.transform = originalStyles.transform;
  
  console.log(`📏 MEASUREMENT RESTORE: Element ${variantElement.getAttribute('data-figma-name')} - Classes restored:`, originalClasses);
  console.log('📏 MEASUREMENT COMPLETE: Measured', positions.size, 'elements');
  return positions;
}

/**
 * Alternative measurement approach using CSS class override
 */
export function measureElementPositionsWithCSS(variantElement: HTMLElement): Map<string, any> {
  console.log('📏 CSS MEASUREMENT: Starting measurement for variant:', variantElement.getAttribute('data-figma-name'));
  
  const positions = new Map();
  
  // Add measurement class that overrides hidden states with higher specificity
  variantElement.classList.add('measuring-positions');
  
  // Force reflow to apply CSS changes
  variantElement.offsetHeight;
  
  // Measure the variant (should now get real values)
  const variantRect = variantElement.getBoundingClientRect();
  positions.set(variantElement.getAttribute('data-figma-id'), {
    rect: variantRect,
    computedStyle: window.getComputedStyle(variantElement),
    element: variantElement
  });
  
  console.log(`📏 CSS MEASURED variant ${variantElement.getAttribute('data-figma-name')}:`, {
    left: variantRect.left,
    top: variantRect.top,
    width: variantRect.width,
    height: variantRect.height
  });
  
  // Measure all child elements
  const childElements = variantElement.querySelectorAll('[data-figma-id]');
  childElements.forEach(element => {
    const rect = element.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(element);
    
    positions.set(element.getAttribute('data-figma-id'), {
      rect: rect,
      computedStyle: computedStyle,
      element: element
    });
    
    console.log(`📏 CSS MEASURED child ${element.getAttribute('data-figma-name')}:`, {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height
    });
  });
  
  // Remove measurement class
  variantElement.classList.remove('measuring-positions');
  
  console.log('📏 CSS MEASUREMENT COMPLETE: Measured', positions.size, 'elements');
  return positions;
}

/**
 * Hide all variants except the animation copy
 */
export function hideAllVariantsExceptCopy(allVariants: HTMLElement[], copy: HTMLElement): void {
  console.log('🙈 HIDING VARIANTS: Hiding all variants except copy');
  
  allVariants.forEach(variant => {
    safeElementOperation(variant, (el) => {
      el.style.display = 'none';
      el.classList.add('variant-hidden');
      el.classList.remove('variant-active');
    }, `hideAllVariantsExceptCopy - hide variant ${variant.getAttribute('data-figma-id')}`);
  });
  
  // ✅ CRITICAL: Ensure copy stays visible
  safeElementOperation(copy, (el) => {
    el.style.display = 'flex';
    el.style.opacity = '1';
    el.style.visibility = 'visible';
    el.classList.add('animation-copy');
  }, 'hideAllVariantsExceptCopy - ensure copy visibility');
}

/**
 * Modified animation logic to handle variant-level elements correctly
 */
export function processElementsForAnimation(sourcePositions: Map<string, any>, targetPositions: Map<string, any>, copyElement: HTMLElement): Array<{element: HTMLElement, xDiff: number, yDiff: number, sourceRect: any, targetRect: any}> {
  console.log('🎬 ANIMATING WITH PRE-MEASURED POSITIONS');
  
  const elementsToAnimate: Array<{element: HTMLElement, xDiff: number, yDiff: number, sourceRect: any, targetRect: any}> = [];
  
  sourcePositions.forEach((sourceRect, sourceElementId) => {
    const sourceElement = document.querySelector(`[data-figma-id="${sourceElementId}"]`) as HTMLElement;
    
    // CRITICAL FIX: Skip variant-level elements entirely
    if (sourceElement && sourceElement.hasAttribute('data-figma-variant-id')) {
      console.log('⏭️ SKIPPING VARIANT-LEVEL ELEMENT:', {
        id: sourceElementId,
        name: sourceElement.dataset.figmaName,
        reason: 'variant containers should not be animated'
      });
      return; // Skip variant containers
    }
    
    const targetRect = findMatchingTargetPosition(sourceElement, targetPositions);
    
    if (targetRect) {
      const xDiff = targetRect.rect.left - sourceRect.rect.left;
      const yDiff = targetRect.rect.top - sourceRect.rect.top;
      
      // Only animate if there's a significant difference
      if (Math.abs(xDiff) > 0.5 || Math.abs(yDiff) > 0.5) {
        console.log('📏 Element position difference:', {
          name: sourceElement?.dataset.figmaName,
        xDiff,
        yDiff,
          sourceRect: sourceRect.rect,
          targetRect: targetRect.rect
      });
      
        elementsToAnimate.push({
          element: sourceElement,
        xDiff,
        yDiff,
          sourceRect: sourceRect.rect,
          targetRect: targetRect.rect
        });
      } else {
        console.log('⏭️ SKIPPING ELEMENT (no significant movement):', {
          name: sourceElement?.dataset.figmaName,
            xDiff,
          yDiff
        });
      }
    }
  });
  
  return elementsToAnimate;
}

/**
 * Helper function to find matching target position for an element
 */
export function findMatchingTargetPosition(sourceElement: HTMLElement | null, targetPositions: Map<string, any>): any {
  if (!sourceElement) return null;
  
  const sourceName = sourceElement.getAttribute('data-figma-name');
  const sourceId = sourceElement.getAttribute('data-figma-id');
  
  // First try to match by name, then by ID
  for (const [targetId, targetData] of targetPositions.entries()) {
    const targetName = targetData.element?.getAttribute('data-figma-name');
    if (sourceName && targetName === sourceName) {
      return targetData;
    }
  }
  
  // Fallback to ID matching
  return targetPositions.get(sourceId) || null;
}

/**
 * Helper function to find element in copy
 */
export function findElementInCopy(originalElement: HTMLElement, copyElement: HTMLElement): HTMLElement | null {
  const elementId = originalElement.getAttribute('data-figma-id');
  const elementName = originalElement.getAttribute('data-figma-name');
  
  // Try to find by ID first
  if (elementId) {
    const foundById = copyElement.querySelector(`[data-figma-id="${elementId}-copy"]`) as HTMLElement;
    if (foundById) return foundById;
  }
  
  // Try to find by name
  if (elementName) {
    const foundByName = copyElement.querySelector(`[data-figma-name="${elementName}"]`) as HTMLElement;
    if (foundByName) return foundByName;
  }
  
  return null;
}

/**
 * Animate using pre-measured positions
 */
export async function animateWithPreMeasuredPositions(
  copy: HTMLElement, 
  sourcePositions: Map<string, any>, 
  targetPositions: Map<string, any>, 
  transitionType: string, 
  transitionDuration: number
): Promise<void> {
  console.log('🎬 ANIMATING WITH PRE-MEASURED POSITIONS');
  console.log('🔍 ANIMATION DEBUG: Source positions map size:', sourcePositions.size);
  console.log('🔍 ANIMATION DEBUG: Target positions map size:', targetPositions.size);
  console.log('🔍 ANIMATION DEBUG: Copy element:', copy.getAttribute('data-figma-id'), copy.getAttribute('data-figma-name'));
  
  // Process elements for animation (skipping variant containers)
  const elementsToAnimate = processElementsForAnimation(sourcePositions, targetPositions, copy);
  
  console.log(`🎬 FOUND ${elementsToAnimate.length} elements with actual position changes`);
  
  if (elementsToAnimate.length === 0) {
    console.log('⏭️ NO ELEMENTS TO ANIMATE - all elements are in the same relative positions');
    return;
  }
  
  // Execute animations only on child elements
  console.log('🎬 ANIMATING', elementsToAnimate.length, 'elements with actual position changes');
  
  const easingFunction = getEasingFunction(transitionType);
  
  elementsToAnimate.forEach(({ element, xDiff, yDiff }) => {
    const copyChildElement = findElementInCopy(element, copy);
    if (copyChildElement) {
      copyChildElement.style.transform = `translate(${xDiff}px, ${yDiff}px)`;
      copyChildElement.style.transition = `transform ${transitionDuration}s ${easingFunction}`;
      
      console.log('🎬 Applied transform to', element.dataset.figmaName + ':', `translate(${xDiff}px, ${yDiff}px)`);
    }
  });
  
  // Wait for animations to complete
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('✅ ANIMATION COMPLETED');
      resolve();
    }, transitionDuration * 1000);
  });
}

/**
 * Helper function to get easing function
 */
function getEasingFunction(transitionType: string): string {
  switch (transitionType) {
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
 * Helper function to create element copy
 */
export function createElementCopy(sourceElement: HTMLElement): HTMLElement {
  console.log('📋 Creating element copy for:', sourceElement.getAttribute('data-figma-name') || sourceElement.getAttribute('data-figma-id'));
  
  const copy = sourceElement.cloneNode(true) as HTMLElement;
  copy.setAttribute('data-figma-id', sourceElement.getAttribute('data-figma-id') + '-copy');
  copy.setAttribute('data-is-animation-copy', 'true');
  
  // Use natural positioning instead of absolute positioning
  copy.style.position = 'relative';
  copy.style.margin = '0';
  copy.style.padding = '0';
  copy.style.pointerEvents = 'none';
  copy.style.willChange = 'transform, left, top';
  
  // Preserve original display and visibility from source element
  const sourceComputedStyle = window.getComputedStyle(sourceElement);
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
 * Updated main animation sequence with corrected measurement flow
 */
export async function performVariantSwitchWithCorrectMeasurement(
  sourceVariant: HTMLElement, 
  targetVariant: HTMLElement, 
  transitionType: string, 
  transitionDuration: number
): Promise<void> {
  const componentSet = sourceVariant.closest('[data-figma-type="COMPONENT_SET"]') as HTMLElement;
  
  if (!componentSet) {
    console.error('❌ No component set found - aborting animation');
    return;
  }
  
  // Step 1: Ensure proper positioning
  const positioningSuccess = ensureVariantsAtZeroPosition(componentSet);
  if (!positioningSuccess) {
    console.error('❌ POSITIONING FAILED - aborting animation');
    return;
  }
  
  try {
    // Step 2: Measure positions with proper timing
    const { sourcePositions, targetPositions } = await measureVariantPositions(sourceVariant, targetVariant);
    
    // Step 3: Create copy and process animations
    const copyElement = createElementCopy(sourceVariant);
    
    // Step 4: Process elements for animation (skipping variant containers)
    const elementsToAnimate = processElementsForAnimation(sourcePositions, targetPositions, copyElement);
    
    // Step 5: Execute animations only on child elements
    if (elementsToAnimate.length > 0) {
      console.log('🎬 ANIMATING', elementsToAnimate.length, 'elements with actual position changes');
      
      // Insert copy into DOM
      const sourceParent = sourceVariant.parentElement;
      if (sourceParent) {
        sourceParent.insertBefore(copyElement, sourceVariant);
      }
      
      // Hide source variant, show copy
      sourceVariant.style.display = 'none';
      copyElement.style.display = 'flex';
      
      // Apply animations
      elementsToAnimate.forEach(({ element, xDiff, yDiff }) => {
        const copyChildElement = findElementInCopy(element, copyElement);
        if (copyChildElement) {
          copyChildElement.style.transform = `translate(${xDiff}px, ${yDiff}px)`;
          copyChildElement.style.transition = `transform ${transitionDuration}s ${getEasingFunction(transitionType)}`;
          
          console.log('🎬 Applied transform to', element.dataset.figmaName + ':', `translate(${xDiff}px, ${yDiff}px)`);
        }
      });
      
      // Wait for animations to complete
      await new Promise(resolve => {
        setTimeout(resolve, transitionDuration * 1000);
      });
      
      // Clean up copy
      copyElement.remove();
  } else {
      console.log('⏭️ NO ELEMENTS TO ANIMATE - all elements are in the same relative positions');
    }
    
    // Step 6: Complete the transition
    completeVariantSwitch(sourceVariant, targetVariant);
    
  } catch (error) {
    console.error('❌ Error during variant switch with correct measurement:', error);
    // Fallback to simple switch
    completeVariantSwitch(sourceVariant, targetVariant);
  }
}

/**
 * Helper function to complete variant switch
 */
function completeVariantSwitch(sourceVariant: HTMLElement, targetVariant: HTMLElement): void {
  // Hide source variant
  sourceVariant.style.display = 'none';
  sourceVariant.style.visibility = 'hidden';
  sourceVariant.classList.add('variant-hidden');
  sourceVariant.classList.remove('variant-active');
  
  // Show target variant
  targetVariant.style.display = 'flex';
  targetVariant.style.visibility = 'visible';
  targetVariant.style.opacity = '1';
  targetVariant.classList.add('variant-active');
  targetVariant.classList.remove('variant-hidden');
  
  // Reset positioning
  targetVariant.style.position = 'relative';
  targetVariant.style.left = '';
  targetVariant.style.top = '';
  targetVariant.style.transform = '';
  
  console.log('✅ VARIANT SWITCH COMPLETED');
}

/**
 * Insert copy into DOM
 */
export function insertCopyIntoDOM(copy: HTMLElement, sourceElement: HTMLElement): void {
  const sourceParent = sourceElement.parentElement;
  if (sourceParent) {
    sourceParent.insertBefore(copy, sourceElement);
    console.log('📋 Copy inserted into DOM');
  }
}

/**
 * Update copy content to match destination
 */
export function updateCopyContentToMatchDestination(copy: HTMLElement, destination: HTMLElement): void {
  // Basic content update - can be expanded as needed
  console.log('📋 Updating copy content to match destination');
}

/**
 * Complete animation and show target
 */
export function completeAnimationAndShowTarget(
  copy: HTMLElement,
  sourceElement: HTMLElement,
  targetElement: HTMLElement,
  allVariants: HTMLElement[]
): void {
  // Remove copy
  copy.remove();
  
  // Complete variant switch
  completeVariantSwitch(sourceElement, targetElement);
  
  console.log('✅ Animation completed and target shown');
}

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
  
  const elementsToAnimate: Array<{element: HTMLElement, xDiff: number, yDiff: number}> = [];
  
  // ✅ CRITICAL FIX: Create name-based lookup for cross-variant element matching
  const targetPositionsByName = new Map();
  targetPositions.forEach((targetData, targetElementId) => {
    // ✅ FILTER: Skip variant-level elements from lookup too
    const isVariantElement = targetData.element?.getAttribute('data-figma-type') === 'COMPONENT';
    if (!isVariantElement) {
      const targetElementName = targetData.element?.getAttribute('data-figma-name');
      if (targetElementName) {
        targetPositionsByName.set(targetElementName, targetData);
      }
    }
  });
  
  console.log(`🔍 TARGET POSITIONS BY NAME: Created lookup for ${targetPositionsByName.size} named elements`);
  
  // Compare source vs target positions for each element
  sourcePositions.forEach((sourceData, elementId) => {
    // ✅ CRITICAL FILTER: Skip variant-level elements - only animate child elements
    const isVariantElement = sourceData.element?.getAttribute('data-figma-type') === 'COMPONENT';
    if (isVariantElement) {
      console.log(`⏭️ SKIPPING VARIANT-LEVEL ELEMENT: ${elementId} (${sourceData.element?.getAttribute('data-figma-name')}) - variant containers should not be animated`);
      return; // Skip variant-level elements entirely
    }
    
    // First try to match by ID (for same-variant elements)
    let targetData = targetPositions.get(elementId);
    
    // ✅ CRITICAL FIX: If no ID match, try matching by name (for cross-variant elements)
    if (!targetData) {
      const sourceElementName = sourceData.element?.getAttribute('data-figma-name');
      if (sourceElementName) {
        targetData = targetPositionsByName.get(sourceElementName);
        if (targetData) {
          console.log(`🎯 CROSS-VARIANT MATCH: ${sourceElementName} (${elementId} -> ${targetData.element?.getAttribute('data-figma-id')})`);
        }
      }
    }
    
    // ✅ CRITICAL DEBUG: Special logging for Frame 1232
    if (elementId.includes('Frame 1232') || sourceData.element?.getAttribute('data-figma-name') === 'Frame 1232') {
      console.log(`🔍 FRAME 1232 DETECTED:`, {
        elementId,
        elementName: sourceData.element?.getAttribute('data-figma-name'),
        hasTargetData: !!targetData,
        sourceRect: sourceData.rect,
        targetRect: targetData?.rect,
        targetElementId: targetData?.element?.getAttribute('data-figma-id')
      });
    }
    
    if (targetData) {
      const sourceRect = sourceData.rect;
      const targetRect = targetData.rect;
      
      // Calculate position differences
      const xDiff = targetRect.left - sourceRect.left;
      const yDiff = targetRect.top - sourceRect.top;
      
      console.log(`📏 Element ${elementId} position difference:`, {
        name: sourceData.element?.getAttribute('data-figma-name'),
        xDiff,
        yDiff,
        sourceRect: { left: sourceRect.left, top: sourceRect.top, width: sourceRect.width, height: sourceRect.height },
        targetRect: { left: targetRect.left, top: targetRect.top, width: targetRect.width, height: targetRect.height }
      });
      
      // ✅ CRITICAL DEBUG: Log whether this element has significant differences
      const hasSignificantDiff = Math.abs(xDiff) > 1 || Math.abs(yDiff) > 1;
      console.log(`🔍 SIGNIFICANT DIFF CHECK for ${elementId}:`, {
        xDiff,
        yDiff,
        absXDiff: Math.abs(xDiff),
        absYDiff: Math.abs(yDiff),
        hasSignificantDiff
      });
      
      // Only animate if there's a significant difference
      if (Math.abs(xDiff) > 1 || Math.abs(yDiff) > 1) {
        console.log(`🎯 PROCESSING ELEMENT FOR ANIMATION: ${elementId} with significant difference`);
        
        // ✅ CRITICAL FIX: Enhanced element matching with multiple fallback strategies
        const elementName = sourceData.element?.getAttribute('data-figma-name');
        
        // ✅ CRITICAL DEBUG: Special logging for Frame 1232
        if (elementId.includes('Frame 1232') || elementName === 'Frame 1232') {
          console.log(`🔍 FRAME 1232 ANIMATION MATCHING:`, {
            elementId,
            elementName,
            xDiff,
            yDiff,
            copyInnerHTML: copy.innerHTML.substring(0, 500)
          });
          
          // Log all elements in the copy to see if Frame 1232 exists
          const allCopyElements = Array.from(copy.querySelectorAll('[data-figma-id]'));
          console.log(`🔍 ALL COPY ELEMENTS:`, allCopyElements.map(el => ({
            id: el.getAttribute('data-figma-id'),
            name: el.getAttribute('data-figma-name')
          })));
        }
        
        console.log(`🔍 ELEMENT MATCHING START for ${elementId}:`, {
          elementId,
          elementName,
          copyId: copy.getAttribute('data-figma-id'),
          copyName: copy.getAttribute('data-figma-name')
        });
        
        // ✅ CRITICAL FIX: For cross-variant elements, prioritize name matching over ID matching
        let copyElement: HTMLElement | null = null;
        
        // Try by name first (works for cross-variant elements)
        if (elementName) {
          copyElement = copy.querySelector(`[data-figma-name="${elementName}"]`) as HTMLElement;
          console.log(`🔍 MATCH ATTEMPT 1 (by name): ${elementName} -> ${!!copyElement}`);
        }
        
        // Fallback: Try by ID (for same-variant elements)
        if (!copyElement) {
          copyElement = copy.querySelector(`[data-figma-id="${elementId}"]`) as HTMLElement;
          console.log(`🔍 MATCH ATTEMPT 2 (by ID): ${elementId} -> ${!!copyElement}`);
        }
        
        if (!copyElement) {
          // Fallback 2: Try with -copy suffix (in case createElementCopy modifies IDs)
          copyElement = copy.querySelector(`[data-figma-id="${elementId}-copy"]`) as HTMLElement;
          console.log(`🔍 MATCH ATTEMPT 3 (by copy ID): ${elementId}-copy -> ${!!copyElement}`);
        }
        
        if (!copyElement) {
          // Fallback 3: If this is the main variant, animate the copy itself
          const copyMainId = copy.getAttribute('data-figma-id');
          console.log(`🔍 MATCH ATTEMPT 4 (main variant check):`, {
            copyMainId,
            elementId,
            isMainVariant: copyMainId && (elementId === copyMainId.replace('-copy', '') || elementId + '-copy' === copyMainId)
          });
          if (copyMainId && (elementId === copyMainId.replace('-copy', '') || elementId + '-copy' === copyMainId)) {
            copyElement = copy;
            console.log(`🎯 MAIN ELEMENT MATCH: Using copy itself for main variant ${elementId}`);
          }
        }
        
        if (!copyElement) {
          // Fallback 4: Try to find by index/position if IDs don't match
          const allSourceElements = Array.from(sourcePositions.keys());
          const sourceIndex = allSourceElements.indexOf(elementId);
          
          if (sourceIndex >= 0) {
            const allCopyElements = Array.from(copy.querySelectorAll('[data-figma-id]'));
            if (allCopyElements[sourceIndex]) {
              copyElement = allCopyElements[sourceIndex] as HTMLElement;
              console.log(`🎯 INDEX MATCH: Found element by position ${sourceIndex} for ${elementId}`);
            }
          }
        }
        
        // 🔍 DEBUG: Log element matching results
        console.log(`🔍 ELEMENT MATCHING DEBUG for ${elementId}:`, {
          elementId,
          elementName,
          foundById: !!copy.querySelector(`[data-figma-id="${elementId}"]`),
          foundByName: !!copy.querySelector(`[data-figma-name="${elementName}"]`),
          foundByCopyId: !!copy.querySelector(`[data-figma-id="${elementId}-copy"]`),
          finalMatch: !!copyElement,
          copyMainId: copy.getAttribute('data-figma-id'),
          allCopyIds: Array.from(copy.querySelectorAll('[data-figma-id]')).map(el => el.getAttribute('data-figma-id')).slice(0, 5)
        });
        
        console.log(`🔍 FINAL MATCH RESULT for ${elementId}:`, {
          copyElement: !!copyElement,
          copyElementId: copyElement?.getAttribute('data-figma-id'),
          copyElementName: copyElement?.getAttribute('data-figma-name')
        });
        
        if (copyElement) {
          elementsToAnimate.push({
            element: copyElement,
            xDiff,
            yDiff
          });
          
          console.log(`✅ ELEMENT MATCHED: ${elementName || elementId} will be animated with transform(${xDiff}px, ${yDiff}px)`);
        } else {
          console.warn(`❌ ELEMENT MATCHING FAILED: Could not find copy element for ${elementId} (${elementName})`);
          
          // 🔍 EMERGENCY DEBUG: Log copy structure for analysis
          console.log('🔍 COPY STRUCTURE DEBUG:', {
            copyHTML: copy.innerHTML.substring(0, 300),
            copyOuterHTML: copy.outerHTML.substring(0, 200)
          });
        }
      } else {
        console.log(`⏭️ SKIPPING ELEMENT: ${elementId} - no significant position difference (xDiff: ${xDiff}, yDiff: ${yDiff})`);
      }
    } else {
      console.log(`⏭️ SKIPPING ELEMENT: ${elementId} - no target data found`);
    }
  });
  
  console.log(`🔍 ANIMATION SUMMARY: Found ${elementsToAnimate.length} elements to animate`);
  
  // ✅ BACKUP STRATEGY: If no child elements were matched, try animating the copy itself based on variant-level differences
  if (elementsToAnimate.length === 0) {
    console.log('🔄 NO CHILD ELEMENTS MATCHED: Checking if main variant has position changes');
    
    // Look for the main variant positions
    let mainSourceData = null;
    let mainTargetData = null;
    
    // Use for...of loop instead of forEach to allow break
    for (const [elementId, sourceData] of sourcePositions) {
      const targetData = targetPositions.get(elementId);
      if (targetData && sourceData.element && targetData.element) {
        const sourceRect = sourceData.rect;
        const targetRect = targetData.rect;
        const xDiff = targetRect.left - sourceRect.left;
        const yDiff = targetRect.top - sourceRect.top;
        
        // If this is a significant position change and we haven't found the main variant yet
        if (Math.abs(xDiff) > 1 || Math.abs(yDiff) > 1) {
          if (!mainSourceData || sourceData.element.tagName === copy.tagName) {
            mainSourceData = sourceData;
            mainTargetData = targetData;
            console.log(`🎯 MAIN VARIANT ANIMATION: Found position change ${xDiff}px, ${yDiff}px for main variant`);
            
            elementsToAnimate.push({
              element: copy,
              xDiff,
              yDiff
            });
            break; // Only animate the main element once
          }
        }
      }
    }
  }

  if (elementsToAnimate.length > 0) {
    console.log(`🎬 ANIMATING ${elementsToAnimate.length} elements with actual position changes`);
    
    // Apply transitions and animate
    const duration = transitionDuration || 0.5;
    const easing = getEasingFunction(transitionType);
    
    elementsToAnimate.forEach(({element, xDiff, yDiff}) => {
      element.style.transition = `transform ${duration}s ${easing}`;
      element.style.transform = `translate(${xDiff}px, ${yDiff}px)`;
      
      console.log(`🎬 Applied transform to ${element.getAttribute('data-figma-name')}: translate(${xDiff}px, ${yDiff}px)`);
    });
    
    // Wait for animation to complete
    await new Promise(resolve => {
      setTimeout(resolve, duration * 1000);
    });
    
    console.log('✅ ANIMATION COMPLETED: All transforms applied successfully');
  } else {
    console.log('🔄 NO POSITION CHANGES: All elements have same positions - instant switch');
  }
}

/**
 * Get easing function for transition type
 */
function getEasingFunction(transitionType: string): string {
  switch (transitionType) {
    case 'EASE_IN_AND_OUT_BACK':
      return 'cubic-bezier(0.68, -0.6, 0.32, 1.6)';
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
 * FIX 3: Ensure copy visibility is properly managed
 * Make sure only the copy is visible during animation, not source or target
 */
export function showOnlyCopyDuringAnimation(
  sourceCopy: HTMLElement | null, 
  sourceElement: HTMLElement, 
  targetElement: HTMLElement, 
  allVariants: HTMLElement[]
): void {
  console.log('🎭 ANIMATION VISIBILITY: Showing only copy during animation');
  
  // Hide source element with safe operations
  safeElementOperation(sourceElement, (el) => {
    el.style.display = 'none';
    el.classList.add('variant-hidden', 'animation-source-hidden');
    el.classList.remove('variant-active');
  }, 'showOnlyCopyDuringAnimation - hide source element');
  
  // Hide target element with safe operations
  safeElementOperation(targetElement, (el) => {
    el.style.display = 'none';
    el.classList.add('variant-hidden', 'animation-target-hidden');
    el.classList.remove('variant-active');
  }, 'showOnlyCopyDuringAnimation - hide target element');
  
  // Hide all other variants
  allVariants.forEach(variant => {
    if (variant !== sourceElement && variant !== targetElement) {
      safeElementOperation(variant, (el) => {
        el.style.display = 'none';
        el.classList.add('variant-hidden');
        el.classList.remove('variant-active');
      }, `showOnlyCopyDuringAnimation - hide variant ${variant.getAttribute('data-figma-id')}`);
    }
  });
  
  // Show only the copy with safe operations
  if (sourceCopy) {
    safeElementOperation(sourceCopy, (el) => {
      el.style.display = 'flex';
      el.classList.add('animation-copy');
      // Don't add variant classes to copy - it's a temporary animation element
    }, 'showOnlyCopyDuringAnimation - show copy');
  }
}

/**
 * FIX 4: Clean animation completion
 * When animation finishes, show only target
 */
export function completeAnimationAndShowTarget(
  sourceCopy: HTMLElement | null, 
  sourceElement: HTMLElement, 
  targetElement: HTMLElement, 
  allVariants: HTMLElement[]
): void {
  console.log('✅ ANIMATION COMPLETION: Showing only target after animation');
  
  // Remove copy with safe operations
  if (sourceCopy) {
    safeElementOperation(sourceCopy, (el) => {
      if (el.parentElement) {
        el.remove();
      }
    }, 'completeAnimationAndShowTarget - remove copy');
  }
  
  // Keep source hidden with safe operations
  safeElementOperation(sourceElement, (el) => {
    el.style.display = 'none';
    el.classList.add('variant-hidden');
    el.classList.remove('variant-active', 'animation-source-hidden');
  }, 'completeAnimationAndShowTarget - keep source hidden');
  
  // Show only target with safe operations
  safeElementOperation(targetElement, (el) => {
    el.style.display = 'flex';
    el.classList.add('variant-active');
    el.classList.remove('variant-hidden', 'animation-target-hidden');
  }, 'completeAnimationAndShowTarget - show target');
  
  // Ensure all other variants stay hidden
  allVariants.forEach(variant => {
    if (variant !== targetElement) {
      safeElementOperation(variant, (el) => {
        el.style.display = 'none';
        el.classList.add('variant-hidden');
        el.classList.remove('variant-active');
      }, `completeAnimationAndShowTarget - hide variant ${variant.getAttribute('data-figma-id')}`);
    }
  });
}

/**
 * Create a copy of a source element for animation
 */
export function createElementCopy(sourceElement: HTMLElement): HTMLElement {
  console.log('DEBUG: createElementCopy function called');
  console.log('DEBUG: Creating element copy for:', sourceElement.getAttribute('data-figma-name') || sourceElement.getAttribute('data-figma-id'));
  
  const copy = sourceElement.cloneNode(true) as HTMLElement;
  copy.setAttribute('data-figma-id', sourceElement.getAttribute('data-figma-id') + '-copy');
  copy.setAttribute('data-is-animation-copy', 'true');
  
  // Make an exact copy - don't manipulate positions
  console.log('DEBUG: Making exact copy of source variant');
  
  // Get source elements for copy creation (no detailed logging)
  const sourceElements = sourceElement.querySelectorAll('[data-figma-id]');
  
  // The copy is already an exact clone, no position manipulation needed
  
  // Position the copy absolutely over the source element
  const sourceRect = sourceElement.getBoundingClientRect();
  const parentRect = sourceElement.parentElement?.getBoundingClientRect() || { left: 0, top: 0 };
  
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
  
  // Preserve original overflow from source element
  const sourceComputedStyle = window.getComputedStyle(sourceElement);
  copy.style.overflow = sourceComputedStyle.overflow;
  
  // Ensure the copy and all its children are fully visible
  copy.style.opacity = '1';
  copy.style.visibility = 'visible';
  copy.style.display = 'flex';

  // Ensure all nested elements in the copy are also visible, but preserve their original overflow
  const copyChildren = copy.querySelectorAll('*');
  copyChildren.forEach(child => {
    (child as HTMLElement).style.opacity = '1';
    (child as HTMLElement).style.visibility = 'visible';
    // Don't override overflow - preserve the original value from the clone
    if ((child as HTMLElement).style.display === 'none') {
      (child as HTMLElement).style.display = 'flex';
    }
  });

  // Ensure all nodes in the copy are visible (no detailed logging)

  console.log('DEBUG: Copy creation completed');
  return copy;
}

/**
 * Update copy content to match destination
 */
export function updateCopyContentToMatchDestination(copy: HTMLElement, destination: HTMLElement): void {
  console.log('DEBUG: Updating copy content to match destination');
  
  // Get all elements in both copy and destination
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
        
        // CRITICAL FIX: Preserve the positioning of ALL nested elements before updating content
        const allNestedElements = copyElement.querySelectorAll('[data-figma-id]');
        const originalPositions = new Map();
        
        allNestedElements.forEach(nestedElement => {
          const nestedElementName = nestedElement.getAttribute('data-figma-name') || nestedElement.getAttribute('data-figma-id');
          const computedStyle = window.getComputedStyle(nestedElement as HTMLElement);
          originalPositions.set(nestedElementName, {
            position: computedStyle.position,
            left: computedStyle.left,
            top: computedStyle.top,
            transform: computedStyle.transform
          });
        });
        
        // Also preserve the copy element itself
        const copyComputedStyle = window.getComputedStyle(copyElement as HTMLElement);
        originalPositions.set(copyElementName, {
          position: copyComputedStyle.position,
          left: copyComputedStyle.left,
          top: copyComputedStyle.top,
          transform: copyComputedStyle.transform
        });
        
        // Update the innerHTML
        copyElement.innerHTML = destinationElement.innerHTML;
        
        // CRITICAL FIX: Restore the positioning of ALL elements after content update
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
  
  // Ensure all elements in the copy are visible after content update, but preserve overflow
  const allCopyElements = copy.querySelectorAll('*');
  allCopyElements.forEach(element => {
    (element as HTMLElement).style.opacity = '1';
    (element as HTMLElement).style.visibility = 'visible';
    // Don't override overflow - preserve the original value from the clone
    if ((element as HTMLElement).style.display === 'none') {
      (element as HTMLElement).style.display = 'flex';
    }
  });
}

/**
 * Insert copy into DOM at the correct position
 */
export function insertCopyIntoDOM(copy: HTMLElement, sourceElement: HTMLElement): void {
  console.log('DEBUG: Inserting copy into DOM');
  
  // Insert the copy into the DOM
  const sourceParent = sourceElement.parentElement;
  if (sourceParent) {
    sourceParent.appendChild(copy);
    console.log('DEBUG: Copy inserted into DOM');
  } else {
    console.error('DEBUG: No parent element found for source element');
  }
  
  // Log the copy's position and visibility after insertion
  const copyRect = copy.getBoundingClientRect();
  const copyStyle = window.getComputedStyle(copy);
  console.log('DEBUG: Copy after insertion:');
  console.log('  position: ' + copyStyle.position);
  console.log('  top: ' + copyStyle.top);
  console.log('  left: ' + copyStyle.left);
  console.log('  z-index: ' + copyStyle.zIndex);
  console.log('  opacity: ' + copyStyle.opacity);
  console.log('  visibility: ' + copyStyle.visibility);
  console.log('  display: ' + copyStyle.display);
  console.log('  bounding rect: ' + copyRect);
}

/**
 * Remove copy from DOM
 */
export function removeCopyFromDOM(copy: HTMLElement): void {
  console.log('DEBUG: Removing copy from DOM');
  if (copy.parentElement) {
    copy.parentElement.removeChild(copy);
    console.log('DEBUG: Copy removed from DOM');
  } else {
    console.log('DEBUG: Copy has no parent element to remove from');
  }
}

/**
 * Hide original source element and other variants
 */
export function hideOriginalElements(sourceElement: HTMLElement, allVariants: HTMLElement[]): void {
  console.log('DEBUG: Hiding original elements');
  
  // Hide the original source element
  sourceElement.style.opacity = '0';
  sourceElement.style.visibility = 'hidden';
  
  // Hide all other variants
  allVariants.forEach(variant => {
    if (variant !== sourceElement) {
      variant.style.opacity = '0';
      variant.style.visibility = 'hidden';
    }
  });
  
  console.log('DEBUG: Original elements hidden');
}

/**
 * Show destination variant
 */
export function showDestinationVariant(destination: HTMLElement, allVariants: HTMLElement[]): void {
  // Validate destination parameter
  if (!safeElementOperation(destination, () => {}, 'showDestinationVariant - destination validation')) {
    return;
  }
  
  console.log('DEBUG: Showing destination variant');
  
  // Hide the original source element permanently with safe operations
  allVariants.forEach(variant => {
    if (variant !== destination) {
      safeElementOperation(variant, (el) => {
        el.style.opacity = '0';
        el.style.visibility = 'hidden';
        el.classList.add('variant-hidden');
        el.classList.remove('variant-active');
      }, `hideOriginalVariant - ${variant.getAttribute('data-figma-id')}`);
    }
  });
  
  // Show the destination variant with explicit styles and higher specificity
  console.log('DEBUG: SHOWING DESTINATION VARIANT:', {
    destinationId: destination.getAttribute('data-figma-id'),
    destinationName: destination.getAttribute('data-figma-name'),
    visibility: 'visible',
    opacity: '1',
    display: 'flex'
  });
  
  // Apply styles with !important to ensure they override any CSS rules - with safe operations
  safeElementOperation(destination, (el) => {
    el.style.setProperty('visibility', 'visible', 'important');
    el.style.setProperty('opacity', '1', 'important');
    el.style.setProperty('display', 'flex', 'important');
    el.classList.add('variant-active');
    el.classList.remove('variant-hidden');
  }, 'showDestinationVariant - apply visibility styles');
  
  // CRITICAL: Position the destination variant at exactly 0px top/left
  // This ensures the destination variant is at the correct baseline position for subsequent animations
  destination.style.setProperty('position', 'relative', 'important');
  destination.style.setProperty('top', '0px', 'important');
  destination.style.setProperty('left', '0px', 'important');
  destination.style.setProperty('transform', 'none', 'important');
  
  // CRITICAL: Also position the parent component set container at 0px top/left
  // This ensures the variant is positioned relative to 0px, not the original Figma position
  const parentComponentSet = destination.closest('[data-figma-type="COMPONENT_SET"]');
  if (parentComponentSet) {
    const htmlParentComponentSet = parentComponentSet as HTMLElement;
    htmlParentComponentSet.style.setProperty('position', 'relative', 'important');
    htmlParentComponentSet.style.setProperty('top', '0px', 'important');
    htmlParentComponentSet.style.setProperty('left', '0px', 'important');
    htmlParentComponentSet.style.setProperty('transform', 'none', 'important');
    console.log('DEBUG: Positioned parent component set at 0px top/left:', parentComponentSet.getAttribute('data-figma-id'));
  }
  
  // CRITICAL: Also restore visibility of all nested components within the destination variant
  const nestedComponents = destination.querySelectorAll('[data-figma-id]');
  console.log('DEBUG: Restoring visibility for', nestedComponents.length, 'nested components');
  
  nestedComponents.forEach((component, index) => {
    const componentId = component.getAttribute('data-figma-id');
    const componentName = component.getAttribute('data-figma-name');
    const htmlComponent = component as HTMLElement;
    
    // Restore original visibility and opacity for nested components
    htmlComponent.style.setProperty('visibility', 'visible', 'important');
    htmlComponent.style.setProperty('opacity', '1', 'important');
    
    // CRITICAL: Position nested components at exactly 0px top/left
    // This ensures nested components are at the correct baseline position for subsequent animations
    htmlComponent.style.setProperty('position', 'relative', 'important');
    htmlComponent.style.setProperty('top', '0px', 'important');
    htmlComponent.style.setProperty('left', '0px', 'important');
    htmlComponent.style.setProperty('transform', 'none', 'important');
    
    // Don't override display property for nested components - let them keep their natural display
    // Only set display if it was explicitly hidden
    const computedStyle = window.getComputedStyle(component);
    if (computedStyle.display === 'none') {
      htmlComponent.style.setProperty('display', 'flex', 'important');
    }
    
    console.log('DEBUG: Restored component', index + 1, ':', {
      id: componentId,
      name: componentName,
      visibility: htmlComponent.style.visibility,
      opacity: htmlComponent.style.opacity,
      display: htmlComponent.style.display
    });
  });
  
  // Force a reflow to ensure styles are applied
  destination.offsetHeight;
  
  // Log the final computed styles to verify they were applied
  const computedStyle = window.getComputedStyle(destination);
  console.log('DEBUG: Destination variant final computed styles:', {
    destinationId: destination.getAttribute('data-figma-id'),
    destinationName: destination.getAttribute('data-figma-name'),
    visibility: computedStyle.visibility,
    opacity: computedStyle.opacity,
    display: computedStyle.display,
    position: computedStyle.position,
    top: computedStyle.top,
    left: computedStyle.left,
    transform: computedStyle.transform,
    inlineTop: destination.style.top,
    inlineLeft: destination.style.left
  });
  
  // CRITICAL: Also log the bounding rect to see the actual position
  const boundingRect = destination.getBoundingClientRect();
  console.log('DEBUG: Destination variant bounding rect:', {
    destinationId: destination.getAttribute('data-figma-id'),
    destinationName: destination.getAttribute('data-figma-name'),
    left: boundingRect.left,
    top: boundingRect.top,
    width: boundingRect.width,
    height: boundingRect.height
  });
  
  console.log('DEBUG: Destination variant and nested components shown');
}

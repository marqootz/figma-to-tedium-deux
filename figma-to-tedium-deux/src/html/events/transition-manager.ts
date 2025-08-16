/**
 * Transition Manager Module
 * 
 * Responsible for managing the overall transition lifecycle, including
 * animation monitoring, completion detection, and cleanup.
 */

import { findElementsWithPropertyChanges } from './animation-detector';
import { setupElementAnimation, getEasingFunction } from './animation-applier';
import { 
  createElementCopy, 
  updateCopyContentToMatchDestination, 
  insertCopyIntoDOM, 
  removeCopyFromDOM,
  hideOriginalElements,
  showDestinationVariant
} from './element-copier';

// Global transition lock to prevent multiple simultaneous transitions
let isTransitionInProgress = false;
let currentTransitionPromise: Promise<void> | null = null;

/**
 * Animate copy to destination
 */
export function animateCopyToDestination(
  copy: HTMLElement, 
  destination: HTMLElement, 
  originalSourceElement: HTMLElement, 
  transitionType: string, 
  transitionDuration: number
): Promise<void> {
  return new Promise((resolve) => {
    // Update copy content to match destination content
    updateCopyContentToMatchDestination(copy, destination);
    
    // Find elements with property changes
    const elementsToAnimate = findElementsWithPropertyChanges(destination, copy, originalSourceElement);
    
    const easingFunction = getEasingFunction(transitionType);
    const duration = parseFloat(transitionDuration.toString() || '0.3');
    
    if (elementsToAnimate.length > 0) {
      console.log('DEBUG: Animating copy with', elementsToAnimate.length, 'elements using modular system');
      
      // Setup animation for each element using the changes already detected
      elementsToAnimate.forEach(({ element, sourceElement, changes }) => {
        setupElementAnimation(element, changes, duration, easingFunction, destination);
      });
      
      // Force reflow
      copy.offsetHeight;
      
      // Monitor animation progress using transition end events
      let completedAnimations = 0;
      const totalAnimations = elementsToAnimate.length;
      
      console.log('DEBUG: Setting up animation monitoring for', totalAnimations, 'elements');
      
      // Track which elements have actually been animated and their transition properties
      const animatedElementsSet = new Set();
      const transitionProperties = new Map(); // Track which properties are being transitioned
      
      // Also track which elements have been processed to avoid double-counting
      const processedElements = new Set();
      
      // Track if animation has completed to stop sub-frame tracking
      let animationCompleted = false;
      
      // Set up transition properties for monitoring
      elementsToAnimate.forEach(({ element, changes }, index) => {
        const elementName = element.getAttribute('data-figma-name') || element.getAttribute('data-figma-id');
        const elementProperties: string[] = [];
        
        // Check for combined transform or individual position changes
        const hasPositionX = changes.positionX && changes.positionX.changed;
        const hasPositionY = changes.positionY && changes.positionY.changed;
        
        if (hasPositionX || hasPositionY) {
          // Use transform for combined movement, or individual properties for single-axis movement
          if (hasPositionX && hasPositionY) {
            elementProperties.push('transform'); // Combined transform
          } else {
            if (hasPositionX) elementProperties.push('left');
            if (hasPositionY) elementProperties.push('top');
          }
        }
        if (changes.backgroundColor && changes.backgroundColor.changed) {
          elementProperties.push('background-color');
        }
        if (changes.color && changes.color.changed) {
          elementProperties.push('color');
        }
        if (changes.justifyContent && changes.justifyContent.changed) {
          elementProperties.push('left');
        }
        if (changes.alignItems && changes.alignItems.changed) {
          elementProperties.push('top');
        }
        
        // Remove duplicates and set the properties
        const uniqueProperties = [...new Set(elementProperties)];
        transitionProperties.set(element, uniqueProperties);
      });
      
      const onTransitionEnd = (event: TransitionEvent) => {
        const targetElement = event.target as HTMLElement;
        const propertyName = event.propertyName;
        
        console.log('🎯 TRANSITION END EVENT:', {
          targetElement: targetElement.getAttribute('data-figma-name') || targetElement.getAttribute('data-figma-id'),
          propertyName: propertyName,
          timestamp: Date.now()
        });
        
        // Find which element this transition belongs to
        const animatedElement = elementsToAnimate.find(({ element }) => 
          targetElement === element || element.contains(targetElement)
        );
        
        if (animatedElement) {
          const elementKey = animatedElement.element;
          const expectedProperties = transitionProperties.get(elementKey) || [];
          
          // Check if this is a property we're expecting to transition
          if (expectedProperties.includes(propertyName)) {
            // Remove this property from the expected list
            const updatedProperties = expectedProperties.filter(p => p !== propertyName);
            transitionProperties.set(elementKey, updatedProperties);
            
            // If all properties for this element have completed, mark the element as done
            if (updatedProperties.length === 0 && !animatedElementsSet.has(elementKey)) {
              animatedElementsSet.add(elementKey);
              completedAnimations++;
              
              if (completedAnimations >= totalAnimations) {
                console.log('🎯 All animations completed via transition end');
                animationCompleted = true;
                copy.removeEventListener('transitionend', onTransitionEnd);
                copy.removeEventListener('transitionend', onCopyTransitionEnd);
                childElements.forEach(child => {
                  child.removeEventListener('transitionend', onTransitionEnd);
                });
                clearTimeout(fallbackTimeout);
                clearInterval(intervalId);
                clearInterval(progressCheckInterval);
                resolve();
              }
            }
          }
        } else {
          // Check if this is a child element that might be part of an animated element
          const parentAnimatedElement = elementsToAnimate.find(({ element }) => 
            element.contains(targetElement)
          );
          
          if (parentAnimatedElement && !processedElements.has(targetElement)) {
            processedElements.add(targetElement);
            
            // For child elements, we'll use a simpler approach - just count unique elements
            const elementKey = parentAnimatedElement.element;
            if (!animatedElementsSet.has(elementKey)) {
              animatedElementsSet.add(elementKey);
              completedAnimations++;
              
              if (completedAnimations >= totalAnimations) {
                console.log('🎯 All animations completed via child transition');
                animationCompleted = true;
                copy.removeEventListener('transitionend', onTransitionEnd);
                copy.removeEventListener('transitionend', onCopyTransitionEnd);
                childElements.forEach(child => {
                  child.removeEventListener('transitionend', onTransitionEnd);
                });
                clearTimeout(fallbackTimeout);
                clearInterval(intervalId);
                clearInterval(progressCheckInterval);
                resolve();
              }
            }
          }
        }
      };
      
      // Add a more aggressive monitoring approach - check if animations are actually complete
      const checkAnimationProgressDetailed = () => {
        let actuallyCompleted = 0;
        elementsToAnimate.forEach(({ element, changes }) => {
          const computedStyle = window.getComputedStyle(element);
          const elementName = element.getAttribute('data-figma-name') || element.getAttribute('data-figma-id');
          
          // Only log position when there's a significant change or completion
          const currentLeft = parseFloat(computedStyle.left) || 0;
          const currentTop = parseFloat(computedStyle.top) || 0;
          const currentTransform = computedStyle.transform;
          
          // Check if the element has reached its target position
          let isComplete = false;
          
          if (changes.positionY && changes.positionY.changed) {
            const targetTop = changes.positionY.targetValue;
            const difference = Math.abs(currentTop - targetTop);
            
            if (difference < 5) { // Allow for small rounding differences
              isComplete = true;
            }
          }
          
          if (changes.positionX && changes.positionX.changed) {
            const targetLeft = changes.positionX.targetValue;
            const difference = Math.abs(currentLeft - targetLeft);
            
            if (difference < 5) { // Allow for small rounding differences
              isComplete = true;
            }
          }
          
          if (isComplete && !animatedElementsSet.has(element)) {
            console.log('🎯 POSITION CHECK COMPLETED:', {
              elementName: elementName,
              currentLeft: currentLeft,
              currentTop: currentTop,
              targetLeft: changes.positionX?.targetValue || 0,
              targetTop: changes.positionY?.targetValue || 0,
              timestamp: Date.now()
            });
            animatedElementsSet.add(element);
            actuallyCompleted++;
          }
        });
        
        if (actuallyCompleted > 0) {
          completedAnimations += actuallyCompleted;
          
          if (completedAnimations >= totalAnimations) {
            console.log('🎯 All animations completed via position check');
            animationCompleted = true;
            copy.removeEventListener('transitionend', onTransitionEnd);
            copy.removeEventListener('transitionend', onCopyTransitionEnd);
            childElements.forEach(child => {
              child.removeEventListener('transitionend', onTransitionEnd);
            });
            clearInterval(intervalId);
            clearInterval(progressCheckInterval);
            resolve();
          }
        }
      };
      
      // Log animation start details
      console.log('🎬 ANIMATION START:', {
        totalElements: elementsToAnimate.length,
        transitionType: transitionType,
        transitionDuration: transitionDuration,
        easingFunction: getEasingFunction(transitionType),
        elements: elementsToAnimate.map(({ element, changes }) => ({
          elementName: element.getAttribute('data-figma-name') || element.getAttribute('data-figma-id'),
          initialLeft: parseFloat(window.getComputedStyle(element).left) || 0,
          initialTop: parseFloat(window.getComputedStyle(element).top) || 0,
          targetLeft: changes.positionX?.targetValue || 0,
          targetTop: changes.positionY?.targetValue || 0,
          hasPositionX: changes.positionX?.changed || false,
          hasPositionY: changes.positionY?.changed || false
        }))
      });
      
      // Add simplified animation progress tracking (no sub-frame logging)
      let animationStartTime = Date.now();
      
      const checkAnimationProgressSimple = () => {
        // Stop tracking if animation has completed
        if (animationCompleted) {
          return;
        }
        
        const currentTime = Date.now();
        const elapsed = currentTime - animationStartTime;
        
        // Only log significant progress milestones (every 100ms)
        if (elapsed % 100 < 16) { // Log roughly every 100ms
          console.log('🎬 ANIMATION PROGRESS:', {
            elapsed: elapsed + 'ms',
            elements: elementsToAnimate.length,
            transitionType: transitionType,
            transitionDuration: transitionDuration
          });
        }
      };
      
      // Check progress every 100ms instead of 16ms
      const progressInterval = setInterval(checkAnimationProgressSimple, 100);
      
      // Stop progress tracking after animation duration + buffer
      setTimeout(() => {
        clearInterval(progressInterval);
        console.log('🎬 PROGRESS TRACKING COMPLETED');
        
        // CRITICAL FIX: Stop all animation monitoring when the animation should be complete
        // This prevents the monitoring from continuing to track the destination variant
        if (!animationCompleted) {
          console.log('🎬 FORCING ANIMATION COMPLETION - stopping all monitoring');
          animationCompleted = true;
          copy.removeEventListener('transitionend', onTransitionEnd);
          copy.removeEventListener('transitionend', onCopyTransitionEnd);
          childElements.forEach(child => {
            child.removeEventListener('transitionend', onTransitionEnd);
          });
          clearTimeout(fallbackTimeout);
          clearInterval(intervalId);
          clearInterval(progressInterval);
          
          // CRITICAL FIX: Ensure the copy has the final position before resolving
          elementsToAnimate.forEach(({ element, changes }) => {
            const elementName = element.getAttribute('data-figma-name') || element.getAttribute('data-figma-id');
            const computedStyle = window.getComputedStyle(element);
            console.log('🎬 FINAL POSITION BEFORE RESOLVE:', {
              elementName: elementName,
              finalLeft: computedStyle.left,
              finalTop: computedStyle.top,
              targetLeft: changes.positionX?.targetValue || 0,
              targetTop: changes.positionY?.targetValue || 0
            });
          });
          
          resolve();
        }
      }, parseFloat(transitionDuration.toString() || '0.3') * 1000 + 500);
      
      // Set up periodic position checking with simplified logging
      const progressCheckInterval = setInterval(checkAnimationProgressDetailed, 100); // Check every 100ms
      
      // Store the interval ID so we can clear it later
      const intervalId = progressCheckInterval;
      
      // Also listen for transitions on the copy element itself
      const onCopyTransitionEnd = (event: TransitionEvent) => {
        const propertyName = event.propertyName;
        
        // Since the copy itself isn't animated, we need to find which child element this transition belongs to
        // The transition end event on the copy usually means one of its animated children has completed
        const animatedElement = elementsToAnimate.find(({ element }) => 
          copy.contains(element)
        );
        
        if (animatedElement) {
          const elementKey = animatedElement.element;
          const expectedProperties = transitionProperties.get(elementKey) || [];
          
          // Check if this is a property we're expecting to transition
          if (expectedProperties.includes(propertyName)) {
            // Remove this property from the expected list
            const updatedProperties = expectedProperties.filter(p => p !== propertyName);
            transitionProperties.set(elementKey, updatedProperties);
            
            // If all properties for this element have completed, mark the element as done
            if (updatedProperties.length === 0 && !animatedElementsSet.has(elementKey)) {
              animatedElementsSet.add(elementKey);
              completedAnimations++;
              
              if (completedAnimations >= totalAnimations) {
                console.log('🎯 All animations completed via property completion');
                animationCompleted = true;
                copy.removeEventListener('transitionend', onTransitionEnd);
                copy.removeEventListener('transitionend', onCopyTransitionEnd);
                childElements.forEach(child => {
                  child.removeEventListener('transitionend', onTransitionEnd);
                });
                clearTimeout(fallbackTimeout);
                clearInterval(intervalId);
                clearInterval(progressCheckInterval);
                resolve();
              }
            }
          }
        }
      };
      
      // Add transition end listener to the copy element and all its children
      copy.addEventListener('transitionend', onTransitionEnd);
      copy.addEventListener('transitionend', onCopyTransitionEnd);
      
      // Also listen for transitions on child elements that might be animated
      const childElements = copy.querySelectorAll('*');
      childElements.forEach(child => {
        child.addEventListener('transitionend', onTransitionEnd);
      });
      
      // Fallback timeout in case transition events don't fire
      const fallbackTimeout = setTimeout(() => {
        // Check if animations are actually complete by examining the computed styles
        let actuallyCompleted = 0;
        elementsToAnimate.forEach(({ element, changes }) => {
          const computedStyle = window.getComputedStyle(element);
          
          // If transition is 'none' or empty, animation is likely complete
          if (!computedStyle.transition || computedStyle.transition === 'none' || computedStyle.transition === 'all 0s ease 0s') {
            actuallyCompleted++;
          }
        });
        
        console.log('🎯 All animations completed via fallback timeout');
        animationCompleted = true;
        copy.removeEventListener('transitionend', onTransitionEnd);
        copy.removeEventListener('transitionend', onCopyTransitionEnd);
        childElements.forEach(child => {
          child.removeEventListener('transitionend', onTransitionEnd);
        });
        clearInterval(intervalId);
        clearInterval(progressInterval);
        resolve();
      }, parseFloat(transitionDuration.toString() || '0.3') * 1000 + 2000); // Add 2s buffer for more reliability
    } else {
      resolve();
    }
  });
}

/**
 * Handle animated variant switching
 */
export async function handleAnimatedVariantSwitch(
  sourceElement: HTMLElement, 
  destination: HTMLElement, 
  allVariants: HTMLElement[], 
  transitionType: string, 
  transitionDuration: number
): Promise<void> {
  console.log('🔄 VARIANT SWITCH SEQUENCE START:', {
    sourceId: sourceElement.getAttribute('data-figma-id'),
    sourceName: sourceElement.getAttribute('data-figma-name'),
    destinationId: destination.getAttribute('data-figma-id'),
    destinationName: destination.getAttribute('data-figma-name'),
    transitionType: transitionType,
    transitionDuration: transitionDuration,
    totalVariants: allVariants.length
  });
  
  // Create a copy of the source variant
  const sourceCopy = createElementCopy(sourceElement);
  console.log('DEBUG: Element copy created successfully');
  
  // Insert the copy into the DOM
  insertCopyIntoDOM(sourceCopy, sourceElement);
  
  // Hide the original source element and all other variants
  hideOriginalElements(sourceElement, allVariants);
  
  // Prepare the destination variant but keep it hidden for now
  destination.classList.add('variant-active');
  destination.classList.remove('variant-hidden');
  destination.style.visibility = 'hidden';
  destination.style.opacity = '0';
  
  // DON'T pre-position the destination variant - let the copy do all the animation work
  // The destination variant should remain in its natural position
  
  // Force reflow
  destination.offsetHeight;
  
  // Animate the copy to match the destination
  await animateCopyToDestination(sourceCopy, destination, sourceElement, transitionType, transitionDuration);
  
  // Animation complete - simply remove the copy and show the destination variant
  console.log('✅ ANIMATION COMPLETED - removing copy and showing destination variant');
  removeCopyFromDOM(sourceCopy);
  
  // Show the destination variant
  showDestinationVariant(destination, allVariants);
  
  // Force a reflow to ensure the position changes are applied before starting reactions
  destination.offsetHeight;
  
  // Start timeout reactions
  console.log('⏰ STARTING TIMEOUT REACTIONS for destination variant');
  if (window.startTimeoutReactionsForNewlyActiveVariant) {
    window.startTimeoutReactionsForNewlyActiveVariant(destination);
  }
  if (window.startTimeoutReactionsForNestedComponents) {
    window.startTimeoutReactionsForNestedComponents(destination);
  }
  
  console.log('✅ VARIANT SWITCH SEQUENCE COMPLETED:', {
    sourceId: sourceElement.getAttribute('data-figma-id'),
    destinationId: destination.getAttribute('data-figma-id'),
    transitionType: transitionType
  });
}

/**
 * Perform instant variant switch
 */
export function performInstantVariantSwitch(allVariants: HTMLElement[], destination: HTMLElement): void {
  console.log('⚡ PERFORMING INSTANT VARIANT SWITCH');
  
  // Hide all variants
  allVariants.forEach(variant => {
    variant.classList.add('variant-hidden');
    variant.classList.remove('variant-active');
    variant.style.display = 'none';
    variant.style.visibility = 'hidden';
    variant.style.opacity = '0';
    // Don't reset positions for hidden variants - let them keep their natural positions
    if (!variant.style.position || variant.style.position === 'static') {
      variant.style.position = 'relative';
    }
  });
  
  // Show destination variant
  destination.classList.add('variant-active');
  destination.classList.remove('variant-hidden');
  destination.style.display = 'flex';
  destination.style.visibility = 'visible';
  destination.style.opacity = '1';
  // Don't reset position for destination - let it keep its natural position
  if (!destination.style.position || destination.style.position === 'static') {
    destination.style.position = 'relative';
  }
  
  console.log('✅ INSTANT VARIANT SWITCH COMPLETED:', {
    destinationId: destination.getAttribute('data-figma-id'),
    destinationName: destination.getAttribute('data-figma-name'),
    display: destination.style.display,
    visibility: destination.style.visibility,
    opacity: destination.style.opacity
  });
  
  // Start timeout reactions
  if (window.startTimeoutReactionsForNewlyActiveVariant) {
    window.startTimeoutReactionsForNewlyActiveVariant(destination);
  }
  if (window.startTimeoutReactionsForNestedComponents) {
    window.startTimeoutReactionsForNestedComponents(destination);
  }
}

/**
 * Get transition lock status
 */
export function getTransitionLockStatus(): { isTransitionInProgress: boolean; currentTransitionPromise: Promise<void> | null } {
  return { isTransitionInProgress, currentTransitionPromise };
}

/**
 * Set transition lock
 */
export function setTransitionLock(inProgress: boolean, promise: Promise<void> | null = null): void {
  isTransitionInProgress = inProgress;
  currentTransitionPromise = promise;
}

/**
 * Clear transition lock
 */
export function clearTransitionLock(): void {
  isTransitionInProgress = false;
  currentTransitionPromise = null;
}

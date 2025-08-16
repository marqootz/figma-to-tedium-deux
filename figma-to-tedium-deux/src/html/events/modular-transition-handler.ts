/**
 * New Modular Transition Handler
 * 
 * This file orchestrates the modular animation system by importing functions
 * from the separate modules and providing the main entry point for the
 * animation system.
 */

import { 
  handleAnimatedVariantSwitch, 
  performInstantVariantSwitch, 
  setTransitionLock, 
  clearTransitionLock,
  getTransitionLockStatus
} from './transition-manager';

// Global timer tracking
const activeTimers = new Map();

/**
 * Clears all active timeout reactions
 */
function clearAllTimeoutReactions(): void {
  console.log('DEBUG: Clearing all timeout reactions');
  activeTimers.forEach((timeoutId, elementId) => {
    clearTimeout(timeoutId);
    console.log('DEBUG: Cleared timeout for element:', elementId);
  });
  activeTimers.clear();
}

/**
 * Starts timeout reactions for nested components within a parent element
 */
function startTimeoutReactionsForNestedComponents(parentElement: HTMLElement): void {
  if (!parentElement) return;
  
  // Find all nested components with timeout reactions within the parent
  const nestedComponents = parentElement.querySelectorAll('[data-has-reactions="true"]');
  
  nestedComponents.forEach(element => {
    const elementId = element.getAttribute('data-figma-id');
    const elementName = element.getAttribute('data-figma-name');
    const computedStyle = window.getComputedStyle(element);
    
    // Only start timers for elements that are actually visible
    if (computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden') {
      const trigger = JSON.parse(element.getAttribute('data-reaction-trigger') || '{}');
      
      if (trigger.type === 'AFTER_TIMEOUT' && !activeTimers.has(elementId)) {
        console.log('DEBUG: Starting timeout reaction for nested component:', elementId, 'name:', elementName);
        const timeoutId = setTimeout(() => {
          activeTimers.delete(elementId);
          const actionType = element.getAttribute('data-reaction-action-type');
          const destinationId = element.getAttribute('data-reaction-destination');
          const transitionType = element.getAttribute('data-reaction-transition-type');
          const transitionDuration = element.getAttribute('data-reaction-transition-duration');
          
          handleReaction(element, destinationId, transitionType, transitionDuration);
        }, (trigger.timeout || 0) * 1000);
        activeTimers.set(elementId, timeoutId);
      } else if (activeTimers.has(elementId)) {
        console.log('DEBUG: Skipping nested component', elementId, 'name:', elementName, '- timer already active');
      }
    } else {
      console.log('DEBUG: Skipping nested component', elementId, 'name:', elementName, '- not visible');
    }
  });
}

/**
 * Starts timeout reactions for a specific newly active variant
 */
function startTimeoutReactionsForNewlyActiveVariant(newlyActiveElement: HTMLElement): void {
  if (!newlyActiveElement) return;
  
  const elementId = newlyActiveElement.getAttribute('data-figma-id');
  const elementName = newlyActiveElement.getAttribute('data-figma-name');
  const parentComponent = newlyActiveElement.closest('[data-figma-type="COMPONENT_SET"]');
  const parentName = parentComponent ? parentComponent.getAttribute('data-figma-name') : 'none';
  
  console.log('DEBUG: Processing newly active variant:', elementId, 'name:', elementName, 'parent:', parentName);
  
  // Only start timers for variants that are actually visible (not hidden by CSS)
  const computedStyle = window.getComputedStyle(newlyActiveElement);
  
  if (computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden') {
    const trigger = JSON.parse(newlyActiveElement.getAttribute('data-reaction-trigger') || '{}');
    const actionType = newlyActiveElement.getAttribute('data-reaction-action-type');
    const destinationId = newlyActiveElement.getAttribute('data-reaction-destination');
    const transitionType = newlyActiveElement.getAttribute('data-reaction-transition-type');
    const transitionDuration = newlyActiveElement.getAttribute('data-reaction-transition-duration');
    
    // Handle timeout reactions only for active variants that don't have an active timer
    if (trigger.type === 'AFTER_TIMEOUT' && !activeTimers.has(elementId)) {
      console.log('DEBUG: Starting timeout reaction for newly active variant:', elementId, 'name:', elementName, 'timeout:', trigger.timeout, 'parent:', parentName);
      const timeoutId = setTimeout(() => {
        activeTimers.delete(elementId); // Clear the timer when it completes
        handleReaction(newlyActiveElement, destinationId, transitionType, transitionDuration);
      }, (trigger.timeout || 0) * 1000);
      activeTimers.set(elementId, timeoutId);
    } else if (activeTimers.has(elementId)) {
      console.log('DEBUG: Skipping newly active variant', elementId, 'name:', elementName, '- timer already active');
    }
    
    // CRITICAL FIX: Also start timeout reactions for any nested components within this newly active variant
    startTimeoutReactionsForNestedComponents(newlyActiveElement);
  } else {
    console.log('DEBUG: Skipping newly active variant', elementId, 'name:', elementName, '- not visible (display:', computedStyle.display, 'visibility:', computedStyle.visibility, ')');
  }
}

/**
 * Main reaction handler function
 */
function handleReaction(sourceElement: Element, destinationId: string | null, transitionType: string, transitionDuration: string): void {
  console.log('🎯 REACTION TRIGGERED:', {
    sourceId: sourceElement.getAttribute('data-figma-id'),
    sourceName: sourceElement.getAttribute('data-figma-name'),
    destinationId: destinationId,
    transitionType: transitionType,
    transitionDuration: transitionDuration
  });
  
  // Get current transition lock status
  const lockStatus = getTransitionLockStatus();
  
  // Prevent multiple simultaneous transitions
  if (lockStatus.isTransitionInProgress) {
    console.log('⚠️ TRANSITION ALREADY IN PROGRESS - skipping');
    return;
  }
  
  // Set transition lock
  setTransitionLock(true);
  
  // Safety timeout
  const safetyTimeout = setTimeout(() => {
    const currentLockStatus = getTransitionLockStatus();
    if (currentLockStatus.isTransitionInProgress) {
      console.log('WARNING: Transition lock stuck, forcing release');
      clearTransitionLock();
    }
  }, 10000); // Increased to 10 seconds
  
  if (destinationId) {
    const destination = document.querySelector(`[data-figma-id="${destinationId}"]`);
    
    if (!destination) {
      console.error('Destination element not found:', destinationId);
      clearTimeout(safetyTimeout);
      clearTransitionLock();
      return;
    }
    
    // Check if this is a variant switch within a component set
    const sourceComponentSet = sourceElement.closest('[data-figma-type="COMPONENT_SET"]');
    const destinationComponentSet = destination.closest('[data-figma-type="COMPONENT_SET"]');
    
    if (sourceComponentSet && destinationComponentSet && sourceComponentSet === destinationComponentSet) {
      // This is a variant switch
      console.log('🔄 VARIANT SWITCH DETECTED:', {
        componentSetId: sourceComponentSet.getAttribute('data-figma-id'),
        componentSetName: sourceComponentSet.getAttribute('data-figma-name')
      });
      
      const componentSet = sourceComponentSet;
      const allVariants = Array.from(componentSet.children).filter(child => 
        child.getAttribute('data-figma-type') === 'COMPONENT'
      );
      
      console.log('📊 VARIANT ANALYSIS:', {
        totalVariants: allVariants.length,
        variantIds: allVariants.map(v => v.getAttribute('data-figma-id')),
        variantNames: allVariants.map(v => v.getAttribute('data-figma-name'))
      });
      
      // Check if transition type is null/undefined (instant transition) or a recognized animated type
      const isAnimated = transitionType === 'SMART_ANIMATE' || 
                        transitionType === 'BOUNCY' || 
                        transitionType === 'EASE_IN_AND_OUT' || 
                        transitionType === 'EASE_IN_AND_OUT_BACK' || 
                        transitionType === 'EASE_IN' || 
                        transitionType === 'EASE_OUT' || 
                        transitionType === 'LINEAR' || 
                        transitionType === 'GENTLE';
      
      // Only use fallback values if we have a recognized animated transition type
      const effectiveTransitionType = isAnimated ? (transitionType || 'EASE_OUT') : transitionType;
      const effectiveTransitionDuration = isAnimated ? parseFloat(transitionDuration || '0.3') : parseFloat(transitionDuration || '0');
      
      if (isAnimated) {
        console.log('🎬 ANIMATED TRANSITION SELECTED:', {
          transitionType: effectiveTransitionType,
          transitionDuration: effectiveTransitionDuration
        });
        
        // Use the modular transition manager for animated variant switching
        handleAnimatedVariantSwitch(sourceElement as HTMLElement, destination as HTMLElement, allVariants as HTMLElement[], effectiveTransitionType, effectiveTransitionDuration)
          .then(() => {
            clearTimeout(safetyTimeout);
            clearTransitionLock();
          })
          .catch((error) => {
            console.error('Modular animation error:', error);
            clearTimeout(safetyTimeout);
            clearTransitionLock();
          });
      } else {
        console.log('⚡ INSTANT TRANSITION SELECTED:', {
          transitionType: effectiveTransitionType,
          reason: 'Not recognized as animated transition type'
        });
        
        performInstantVariantSwitch(allVariants as HTMLElement[], destination as HTMLElement);
        clearTimeout(safetyTimeout);
        clearTransitionLock();
      }
    } else {
      // This is a regular transition (not variant switching)
      if (transitionType === 'DISSOLVE') {
        console.log('🎭 DISSOLVE TRANSITION SELECTED:', {
          transitionType: transitionType,
          transitionDuration: transitionDuration
        });
        
        // Hide source element
        (sourceElement as HTMLElement).style.opacity = '0';
        (sourceElement as HTMLElement).style.visibility = 'hidden';
        
        // Show destination after delay
        setTimeout(() => {
          destination.classList.add('variant-active');
          destination.classList.remove('variant-hidden');
          (destination as HTMLElement).style.opacity = '1';
          (destination as HTMLElement).style.visibility = 'visible';
          
          startTimeoutReactionsForNewlyActiveVariant(destination as HTMLElement);
          startTimeoutReactionsForNestedComponents(destination as HTMLElement);
          
          clearTimeout(safetyTimeout);
          clearTransitionLock();
        }, parseFloat(transitionDuration || '300'));
      } else {
        console.log('⚡ INSTANT TRANSITION SELECTED (non-variant):', {
          transitionType: transitionType,
          reason: 'Not a dissolve transition'
        });
        
        destination.classList.add('variant-active');
        destination.classList.remove('variant-hidden');
        (destination as HTMLElement).style.opacity = '1';
        (destination as HTMLElement).style.visibility = 'visible';
        
        startTimeoutReactionsForNewlyActiveVariant(destination as HTMLElement);
        startTimeoutReactionsForNestedComponents(destination as HTMLElement);
        
        clearTimeout(safetyTimeout);
        clearTransitionLock();
      }
    }
  } else {
    // Handle case where destinationId is null (final variant - no further transitions)
    clearTimeout(safetyTimeout);
    clearTransitionLock();
  }
}

/**
 * Creates the modular smart animate handler that returns the string literal for eval
 */
export function createModularSmartAnimateHandler(): string {
  return `
    // Global transition lock to prevent multiple simultaneous transitions
    let isTransitionInProgress = false;
    let currentTransitionPromise = null;
    
    // Global timer tracking
    const activeTimers = new Map();
    
    // Import the modular functions (these will be available in the eval context)
    const { 
      handleAnimatedVariantSwitch, 
      performInstantVariantSwitch, 
      setTransitionLock, 
      clearTransitionLock,
      getTransitionLockStatus
    } = window.modularAnimationSystem || {};
    
    // Clear all timeout reactions function
    function clearAllTimeoutReactions() {
      console.log('DEBUG: Clearing all timeout reactions');
      activeTimers.forEach((timeoutId, elementId) => {
        clearTimeout(timeoutId);
        console.log('DEBUG: Cleared timeout for element:', elementId);
      });
      activeTimers.clear();
    }
    
    // Start timeout reactions for nested components
    function startTimeoutReactionsForNestedComponents(parentElement) {
      if (!parentElement) return;
      
      const nestedComponents = parentElement.querySelectorAll('[data-has-reactions="true"]');
      
      nestedComponents.forEach(element => {
        const elementId = element.getAttribute('data-figma-id');
        const elementName = element.getAttribute('data-figma-name');
        const computedStyle = window.getComputedStyle(element);
        
        if (computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden') {
          const trigger = JSON.parse(element.getAttribute('data-reaction-trigger') || '{}');
          
          if (trigger.type === 'AFTER_TIMEOUT' && !activeTimers.has(elementId)) {
            console.log('DEBUG: Starting timeout reaction for nested component:', elementId, 'name:', elementName);
            const timeoutId = setTimeout(() => {
              activeTimers.delete(elementId);
              const actionType = element.getAttribute('data-reaction-action-type');
              const destinationId = element.getAttribute('data-reaction-destination');
              const transitionType = element.getAttribute('data-reaction-transition-type');
              const transitionDuration = element.getAttribute('data-reaction-transition-duration');
              
              handleReaction(element, destinationId, transitionType, transitionDuration);
            }, (trigger.timeout || 0) * 1000);
            activeTimers.set(elementId, timeoutId);
          } else if (activeTimers.has(elementId)) {
            console.log('DEBUG: Skipping nested component', elementId, 'name:', elementName, '- timer already active');
          }
        } else {
          console.log('DEBUG: Skipping nested component', elementId, 'name:', elementName, '- not visible');
        }
      });
    }
    
    // Start timeout reactions for newly active variant
    function startTimeoutReactionsForNewlyActiveVariant(newlyActiveElement) {
      if (!newlyActiveElement) return;
      
      const elementId = newlyActiveElement.getAttribute('data-figma-id');
      const elementName = newlyActiveElement.getAttribute('data-figma-name');
      const parentComponent = newlyActiveElement.closest('[data-figma-type="COMPONENT_SET"]');
      const parentName = parentComponent ? parentComponent.getAttribute('data-figma-name') : 'none';
      
      console.log('DEBUG: Processing newly active variant:', elementId, 'name:', elementName, 'parent:', parentName);
      
      const computedStyle = window.getComputedStyle(newlyActiveElement);
      
      if (computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden') {
        const trigger = JSON.parse(newlyActiveElement.getAttribute('data-reaction-trigger') || '{}');
        const actionType = newlyActiveElement.getAttribute('data-reaction-action-type');
        const destinationId = newlyActiveElement.getAttribute('data-reaction-destination');
        const transitionType = newlyActiveElement.getAttribute('data-reaction-transition-type');
        const transitionDuration = newlyActiveElement.getAttribute('data-reaction-transition-duration');
        
        if (trigger.type === 'AFTER_TIMEOUT' && !activeTimers.has(elementId)) {
          console.log('DEBUG: Starting timeout reaction for newly active variant:', elementId, 'name:', elementName, 'timeout:', trigger.timeout, 'parent:', parentName);
          const timeoutId = setTimeout(() => {
            activeTimers.delete(elementId);
            handleReaction(newlyActiveElement, destinationId, transitionType, transitionDuration);
          }, (trigger.timeout || 0) * 1000);
          activeTimers.set(elementId, timeoutId);
        } else if (activeTimers.has(elementId)) {
          console.log('DEBUG: Skipping newly active variant', elementId, 'name:', elementName, '- timer already active');
        }
        
        startTimeoutReactionsForNestedComponents(newlyActiveElement);
      } else {
        console.log('DEBUG: Skipping newly active variant', elementId, 'name:', elementName, '- not visible (display:', computedStyle.display, 'visibility:', computedStyle.visibility, ')');
      }
    }
    
    // Main reaction handler function
    function handleReaction(sourceElement, destinationId, transitionType, transitionDuration) {
      console.log('🎯 REACTION TRIGGERED:', {
        sourceId: sourceElement.getAttribute('data-figma-id'),
        sourceName: sourceElement.getAttribute('data-figma-name'),
        destinationId: destinationId,
        transitionType: transitionType,
        transitionDuration: transitionDuration
      });
      
      // Prevent multiple simultaneous transitions
      if (isTransitionInProgress) {
        console.log('⚠️ TRANSITION ALREADY IN PROGRESS - skipping');
        return;
      }
      
      // Set transition lock
      isTransitionInProgress = true;
      
      // Safety timeout
      const safetyTimeout = setTimeout(() => {
        if (isTransitionInProgress) {
          console.log('WARNING: Transition lock stuck, forcing release');
          isTransitionInProgress = false;
          currentTransitionPromise = null;
        }
      }, 10000);
      
      if (destinationId) {
        const destination = document.querySelector(\`[data-figma-id="\${destinationId}"]\`);
        
        if (!destination) {
          console.error('Destination element not found:', destinationId);
          clearTimeout(safetyTimeout);
          isTransitionInProgress = false;
          return;
        }
        
        // Check if this is a variant switch within a component set
        const sourceComponentSet = sourceElement.closest('[data-figma-type="COMPONENT_SET"]');
        const destinationComponentSet = destination.closest('[data-figma-type="COMPONENT_SET"]');
        
        if (sourceComponentSet && destinationComponentSet && sourceComponentSet === destinationComponentSet) {
          // This is a variant switch
          console.log('🔄 VARIANT SWITCH DETECTED:', {
            componentSetId: sourceComponentSet.getAttribute('data-figma-id'),
            componentSetName: sourceComponentSet.getAttribute('data-figma-name')
          });
          
          const componentSet = sourceComponentSet;
          const allVariants = Array.from(componentSet.children).filter(child => 
            child.getAttribute('data-figma-type') === 'COMPONENT'
          );
          
          console.log('📊 VARIANT ANALYSIS:', {
            totalVariants: allVariants.length,
            variantIds: allVariants.map(v => v.getAttribute('data-figma-id')),
            variantNames: allVariants.map(v => v.getAttribute('data-figma-name'))
          });
          
          // Check if transition type is recognized as animated
          const isAnimated = transitionType === 'SMART_ANIMATE' || 
                            transitionType === 'BOUNCY' || 
                            transitionType === 'EASE_IN_AND_OUT' || 
                            transitionType === 'EASE_IN_AND_OUT_BACK' || 
                            transitionType === 'EASE_IN' || 
                            transitionType === 'EASE_OUT' || 
                            transitionType === 'LINEAR' || 
                            transitionType === 'GENTLE';
          
          const effectiveTransitionType = isAnimated ? (transitionType || 'EASE_OUT') : transitionType;
          const effectiveTransitionDuration = isAnimated ? parseFloat(transitionDuration || '0.3') : parseFloat(transitionDuration || '0');
          
          if (isAnimated) {
            console.log('🎬 ANIMATED TRANSITION SELECTED:', {
              transitionType: effectiveTransitionType,
              transitionDuration: effectiveTransitionDuration
            });
            
            // Use the modular transition manager for animated variant switching
            const animatedVariantSwitch = window.handleAnimatedVariantSwitch || 
                                        (window.modularAnimationSystem && window.modularAnimationSystem.handleAnimatedVariantSwitch);
            
            if (animatedVariantSwitch) {
              currentTransitionPromise = animatedVariantSwitch(sourceElement, destination, allVariants, effectiveTransitionType, effectiveTransitionDuration)
                .then(() => {
                  clearTimeout(safetyTimeout);
                  isTransitionInProgress = false;
                  currentTransitionPromise = null;
                })
                .catch((error) => {
                  console.error('Modular animation error:', error);
                  clearTimeout(safetyTimeout);
                  isTransitionInProgress = false;
                  currentTransitionPromise = null;
                });
            } else {
              console.error('handleAnimatedVariantSwitch not available in window or modularAnimationSystem');
              clearTimeout(safetyTimeout);
              isTransitionInProgress = false;
            }
          } else {
            console.log('⚡ INSTANT TRANSITION SELECTED:', {
              transitionType: effectiveTransitionType,
              reason: 'Not recognized as animated transition type'
            });
            
            const instantVariantSwitch = window.performInstantVariantSwitch || 
                                        (window.modularAnimationSystem && window.modularAnimationSystem.performInstantVariantSwitch);
            
            if (instantVariantSwitch) {
              instantVariantSwitch(allVariants, destination);
            } else {
              console.error('performInstantVariantSwitch not available in window or modularAnimationSystem');
            }
            clearTimeout(safetyTimeout);
            isTransitionInProgress = false;
          }
        } else {
          // This is a regular transition (not variant switching)
          if (transitionType === 'DISSOLVE') {
            console.log('🎭 DISSOLVE TRANSITION SELECTED:', {
              transitionType: transitionType,
              transitionDuration: transitionDuration
            });
            
            // Hide source element
            sourceElement.style.opacity = '0';
            sourceElement.style.visibility = 'hidden';
            
            // Show destination after delay
            setTimeout(() => {
              destination.classList.add('variant-active');
              destination.classList.remove('variant-hidden');
              destination.style.opacity = '1';
              destination.style.visibility = 'visible';
              
              startTimeoutReactionsForNewlyActiveVariant(destination);
              startTimeoutReactionsForNestedComponents(destination);
              
              clearTimeout(safetyTimeout);
              isTransitionInProgress = false;
            }, parseFloat(transitionDuration || '300'));
          } else {
            console.log('⚡ INSTANT TRANSITION SELECTED (non-variant):', {
              transitionType: transitionType,
              reason: 'Not a dissolve transition'
            });
            
            destination.classList.add('variant-active');
            destination.classList.remove('variant-hidden');
            destination.style.opacity = '1';
            destination.style.visibility = 'visible';
            
            startTimeoutReactionsForNewlyActiveVariant(destination);
            startTimeoutReactionsForNestedComponents(destination);
            
            clearTimeout(safetyTimeout);
            isTransitionInProgress = false;
          }
        }
      } else {
        // Handle case where destinationId is null (final variant - no further transitions)
        clearTimeout(safetyTimeout);
        isTransitionInProgress = false;
      }
    }
    
    // Make functions globally available
    window.handleReaction = handleReaction;
    window.startTimeoutReactionsForNewlyActiveVariant = startTimeoutReactionsForNewlyActiveVariant;
    window.startTimeoutReactionsForNestedComponents = startTimeoutReactionsForNestedComponents;
    window.clearAllTimeoutReactions = clearAllTimeoutReactions;
  `;
}

// Export the functions for use in the browser entry
export {
  handleReaction,
  startTimeoutReactionsForNewlyActiveVariant,
  startTimeoutReactionsForNestedComponents,
  clearAllTimeoutReactions
};

/**
 * New Modular Transition Handler
 * 
 * A clean, modular implementation that uses the extracted animation modules.
 * This maintains the exact same functionality as the original working system
 * but with better organization and separation of concerns.
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
 * Clear all timeout reactions
 */
function clearAllTimeoutReactions(): void {
  activeTimers.forEach((timeoutId) => {
    clearTimeout(timeoutId);
  });
  activeTimers.clear();
}

/**
 * Start timeout reactions for nested components
 */
function startTimeoutReactionsForNestedComponents(parentElement: HTMLElement): void {
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
          const destinationId = element.getAttribute('data-reaction-destination');
          const transitionType = element.getAttribute('data-reaction-transition-type');
          const transitionDuration = element.getAttribute('data-reaction-transition-duration');
          
          if (window.handleReaction) {
            window.handleReaction(element as HTMLElement, destinationId, transitionType, transitionDuration);
          }
        }, (trigger.timeout || 0) * 1000);
        activeTimers.set(elementId, timeoutId);
      }
    }
  });
}

/**
 * Start timeout reactions for newly active variant
 */
function startTimeoutReactionsForNewlyActiveVariant(newlyActiveElement: HTMLElement): void {
  if (!newlyActiveElement) return;
  
  const elementId = newlyActiveElement.getAttribute('data-figma-id');
  const elementName = newlyActiveElement.getAttribute('data-figma-name');
  const computedStyle = window.getComputedStyle(newlyActiveElement);
  
  if (computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden') {
    const trigger = JSON.parse(newlyActiveElement.getAttribute('data-reaction-trigger') || '{}');
    const destinationId = newlyActiveElement.getAttribute('data-reaction-destination');
    const transitionType = newlyActiveElement.getAttribute('data-reaction-transition-type');
    const transitionDuration = newlyActiveElement.getAttribute('data-reaction-transition-duration');
    
    if (trigger.type === 'AFTER_TIMEOUT' && !activeTimers.has(elementId)) {
      console.log('DEBUG: Starting timeout reaction for newly active variant:', elementId, 'name:', elementName);
      const timeoutId = setTimeout(() => {
        activeTimers.delete(elementId);
        if (window.handleReaction) {
          window.handleReaction(newlyActiveElement, destinationId, transitionType, transitionDuration);
        }
      }, (trigger.timeout || 0) * 1000);
      activeTimers.set(elementId, timeoutId);
    }
    
    // Start timeout reactions for nested components
    startTimeoutReactionsForNestedComponents(newlyActiveElement);
  }
}

/**
 * Main reaction handler function
 */
function handleReaction(
  sourceElement: HTMLElement, 
  destinationId: string | null, 
  transitionType: string, 
  transitionDuration: string
): void {
  console.log('🎯 REACTION TRIGGERED:', {
    sourceId: sourceElement.getAttribute('data-figma-id'),
    sourceName: sourceElement.getAttribute('data-figma-name'),
    destinationId: destinationId,
    transitionType: transitionType,
    transitionDuration: transitionDuration
  });
  
  // Prevent multiple simultaneous transitions
  const { isTransitionInProgress } = getTransitionLockStatus();
  if (isTransitionInProgress) {
    console.log('❌ Transition already in progress, skipping reaction');
    return;
  }
  
  // Set transition lock
  setTransitionLock(true);
  
  // Safety timeout
  const safetyTimeout = setTimeout(() => {
    if (getTransitionLockStatus().isTransitionInProgress) {
      console.log('WARNING: Transition lock stuck, forcing release');
      clearTransitionLock();
    }
  }, 10000);
  
  if (destinationId) {
    const destination = document.querySelector(`[data-figma-id="${destinationId}"]`) as HTMLElement;
    
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
      console.log('🔄 VARIANT SWITCH DETECTED');
      
      const componentSet = sourceComponentSet;
      const allVariants = Array.from(componentSet.children).filter(child =>
        child.getAttribute('data-figma-type') === 'COMPONENT'
      ) as HTMLElement[];
      
      console.log('📊 VARIANT ANALYSIS:', {
        totalVariants: allVariants.length,
        variantIds: allVariants.map(v => v.getAttribute('data-figma-id')),
        variantNames: allVariants.map(v => v.getAttribute('data-figma-name'))
      });
      
      // Check if transition type is animated
      const isAnimated = transitionType === 'SMART_ANIMATE' || 
                        transitionType === 'BOUNCY' || 
                        transitionType === 'EASE_IN_AND_OUT' || 
                        transitionType === 'EASE_IN_AND_OUT_BACK' || 
                        transitionType === 'EASE_IN' || 
                        transitionType === 'EASE_OUT' || 
                        transitionType === 'LINEAR' || 
                        transitionType === 'GENTLE';
      
      const effectiveTransitionType = isAnimated ? (transitionType || 'EASE_OUT') : transitionType;
      const effectiveTransitionDuration = isAnimated ? (transitionDuration || '0.3') : transitionDuration;
      
      if (isAnimated) {
        console.log('🎬 ANIMATED TRANSITION SELECTED:', {
          transitionType: effectiveTransitionType,
          transitionDuration: effectiveTransitionDuration
        });
        
        // Clear any pending timeout reactions to prevent conflicts
        clearAllTimeoutReactions();
        
        const transitionPromise = handleAnimatedVariantSwitch(
          sourceElement, 
          destination, 
          allVariants, 
          effectiveTransitionType, 
          parseFloat(effectiveTransitionDuration)
        );
        
        setTransitionLock(true, transitionPromise);
        
        transitionPromise
          .then(() => {
            clearTimeout(safetyTimeout);
            clearTransitionLock();
          })
          .catch((error) => {
            console.error('Animation error:', error);
            clearTimeout(safetyTimeout);
            clearTransitionLock();
          });
      } else {
        console.log('⚡ INSTANT TRANSITION SELECTED');
        
        performInstantVariantSwitch(allVariants, destination);
        clearTimeout(safetyTimeout);
        clearTransitionLock();
      }
    } else {
      // This is a regular transition (not variant switching)
      if (transitionType === 'DISSOLVE') {
        console.log('🎭 DISSOLVE TRANSITION SELECTED');
        
        // Hide source element
        sourceElement.style.opacity = '0';
        sourceElement.style.visibility = 'hidden';
        
        // Show destination after delay
        setTimeout(() => {
          destination.classList.add('variant-active');
          destination.classList.remove('variant-hidden');
          destination.style.opacity = '1';
          destination.style.visibility = 'visible';
          
          if (window.startTimeoutReactionsForNewlyActiveVariant) {
            window.startTimeoutReactionsForNewlyActiveVariant(destination);
          }
          if (window.startTimeoutReactionsForNestedComponents) {
            window.startTimeoutReactionsForNestedComponents(destination);
          }
          
          clearTimeout(safetyTimeout);
          clearTransitionLock();
        }, parseFloat(transitionDuration || '300'));
      } else {
        console.log('⚡ INSTANT TRANSITION SELECTED (non-variant)');
        
        destination.classList.add('variant-active');
        destination.classList.remove('variant-hidden');
        destination.style.opacity = '1';
        destination.style.visibility = 'visible';
        
        if (window.startTimeoutReactionsForNewlyActiveVariant) {
          window.startTimeoutReactionsForNewlyActiveVariant(destination);
        }
        if (window.startTimeoutReactionsForNestedComponents) {
          window.startTimeoutReactionsForNestedComponents(destination);
        }
        
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
 * Create the modular smart animate handler
 */
export function createModularSmartAnimateHandler(): string {
  return `
    // Global transition lock to prevent multiple simultaneous transitions
    let isTransitionInProgress = false;
    let currentTransitionPromise = null;
    
    // Global timer tracking
    const activeTimers = new Map();
    
    // Clear all timeout reactions
    function clearAllTimeoutReactions() {
      activeTimers.forEach((timeoutId) => {
        clearTimeout(timeoutId);
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
              const destinationId = element.getAttribute('data-reaction-destination');
              const transitionType = element.getAttribute('data-reaction-transition-type');
              const transitionDuration = element.getAttribute('data-reaction-transition-duration');
              
              if (window.handleReaction) {
                window.handleReaction(element, destinationId, transitionType, transitionDuration);
              }
            }, (trigger.timeout || 0) * 1000);
            activeTimers.set(elementId, timeoutId);
          }
        }
      });
    }
    
    // Start timeout reactions for newly active variant
    function startTimeoutReactionsForNewlyActiveVariant(newlyActiveElement) {
      if (!newlyActiveElement) return;
      
      const elementId = newlyActiveElement.getAttribute('data-figma-id');
      const elementName = newlyActiveElement.getAttribute('data-figma-name');
      const computedStyle = window.getComputedStyle(newlyActiveElement);
      
      if (computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden') {
        const trigger = JSON.parse(newlyActiveElement.getAttribute('data-reaction-trigger') || '{}');
        const destinationId = newlyActiveElement.getAttribute('data-reaction-destination');
        const transitionType = newlyActiveElement.getAttribute('data-reaction-transition-type');
        const transitionDuration = newlyActiveElement.getAttribute('data-reaction-transition-duration');
        
        if (trigger.type === 'AFTER_TIMEOUT' && !activeTimers.has(elementId)) {
          console.log('DEBUG: Starting timeout reaction for newly active variant:', elementId, 'name:', elementName);
          const timeoutId = setTimeout(() => {
            activeTimers.delete(elementId);
            if (window.handleReaction) {
              window.handleReaction(newlyActiveElement, destinationId, transitionType, transitionDuration);
            }
          }, (trigger.timeout || 0) * 1000);
          activeTimers.set(elementId, timeoutId);
        }
        
        // Start timeout reactions for nested components
        startTimeoutReactionsForNestedComponents(newlyActiveElement);
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
        console.log('❌ Transition already in progress, skipping reaction');
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
          console.log('🔄 VARIANT SWITCH DETECTED');
          
          const componentSet = sourceComponentSet;
          const allVariants = Array.from(componentSet.children).filter(child =>
            child.getAttribute('data-figma-type') === 'COMPONENT'
          );
          
          console.log('📊 VARIANT ANALYSIS:', {
            totalVariants: allVariants.length,
            variantIds: allVariants.map(v => v.getAttribute('data-figma-id')),
            variantNames: allVariants.map(v => v.getAttribute('data-figma-name'))
          });
          
          // Check if transition type is animated
          const isAnimated = transitionType === 'SMART_ANIMATE' || 
                            transitionType === 'BOUNCY' || 
                            transitionType === 'EASE_IN_AND_OUT' || 
                            transitionType === 'EASE_IN_AND_OUT_BACK' || 
                            transitionType === 'EASE_IN' || 
                            transitionType === 'EASE_OUT' || 
                            transitionType === 'LINEAR' || 
                            transitionType === 'GENTLE';
          
          const effectiveTransitionType = isAnimated ? (transitionType || 'EASE_OUT') : transitionType;
          const effectiveTransitionDuration = isAnimated ? (transitionDuration || '0.3') : transitionDuration;
          
          if (isAnimated) {
            console.log('🎬 ANIMATED TRANSITION SELECTED:', {
              transitionType: effectiveTransitionType,
              transitionDuration: effectiveTransitionDuration
            });
            
            // Clear any pending timeout reactions to prevent conflicts
            clearAllTimeoutReactions();
            
            // Use the modular animation system
            currentTransitionPromise = handleAnimatedVariantSwitch(
              sourceElement, 
              destination, 
              allVariants, 
              effectiveTransitionType, 
              parseFloat(effectiveTransitionDuration)
            );
            
            currentTransitionPromise
              .then(() => {
                clearTimeout(safetyTimeout);
                isTransitionInProgress = false;
                currentTransitionPromise = null;
              })
              .catch((error) => {
                console.error('Animation error:', error);
                clearTimeout(safetyTimeout);
                isTransitionInProgress = false;
                currentTransitionPromise = null;
              });
          } else {
            console.log('⚡ INSTANT TRANSITION SELECTED');
            
            performInstantVariantSwitch(allVariants, destination);
            clearTimeout(safetyTimeout);
            isTransitionInProgress = false;
            currentTransitionPromise = null;
          }
        } else {
          // This is a regular transition (not variant switching)
          if (transitionType === 'DISSOLVE') {
            console.log('🎭 DISSOLVE TRANSITION SELECTED');
            
            // Hide source element
            sourceElement.style.opacity = '0';
            sourceElement.style.visibility = 'hidden';
            
            // Show destination after delay
            setTimeout(() => {
              destination.classList.add('variant-active');
              destination.classList.remove('variant-hidden');
              destination.style.opacity = '1';
              destination.style.visibility = 'visible';
              
              if (window.startTimeoutReactionsForNewlyActiveVariant) {
                window.startTimeoutReactionsForNewlyActiveVariant(destination);
              }
              if (window.startTimeoutReactionsForNestedComponents) {
                window.startTimeoutReactionsForNestedComponents(destination);
              }
              
              clearTimeout(safetyTimeout);
              isTransitionInProgress = false;
            }, parseFloat(transitionDuration || '300'));
          } else {
            console.log('⚡ INSTANT TRANSITION SELECTED (non-variant)');
            
            destination.classList.add('variant-active');
            destination.classList.remove('variant-hidden');
            destination.style.opacity = '1';
            destination.style.visibility = 'visible';
            
            if (window.startTimeoutReactionsForNewlyActiveVariant) {
              window.startTimeoutReactionsForNewlyActiveVariant(destination);
            }
            if (window.startTimeoutReactionsForNestedComponents) {
              window.startTimeoutReactionsForNestedComponents(destination);
            }
            
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

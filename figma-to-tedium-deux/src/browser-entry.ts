// Browser-only entry point for the refactored system
// This file only includes code that runs in the browser, not in the Figma plugin

// Declare global types
declare global {
  interface Window {
    handleReaction?: (sourceElement: Element, destinationId: string | null, transitionType: string, transitionDuration: string) => void;
    handleAnimatedVariantSwitch?: (sourceElement: HTMLElement, destination: HTMLElement, allVariants: HTMLElement[], transitionType: string, transitionDuration: number) => Promise<void>;
    performInstantVariantSwitch?: (allVariants: HTMLElement[], destination: HTMLElement) => void;
    startTimeoutReactionsForNewlyActiveVariant?: (newlyActiveElement: HTMLElement) => void;
    startTimeoutReactionsForNestedComponents?: (parentElement: HTMLElement) => void;
    clearAllTimeoutReactions?: () => void;
    setTransitionLock?: (inProgress: boolean, promise?: Promise<void>) => void;
    clearTransitionLock?: () => void;
    getTransitionLockStatus?: () => { isTransitionInProgress: boolean; currentTransitionPromise: Promise<void> | null };

    modularAnimationSystem?: {
      handleAnimatedVariantSwitch: (sourceElement: HTMLElement, destination: HTMLElement, allVariants: HTMLElement[], transitionType: string, transitionDuration: number) => Promise<void>;
      performInstantVariantSwitch: (allVariants: HTMLElement[], destination: HTMLElement) => void;
      setTransitionLock: (inProgress: boolean, promise?: Promise<void>) => void;
      clearTransitionLock: () => void;
      getTransitionLockStatus: () => { isTransitionInProgress: boolean; currentTransitionPromise: Promise<void> | null };
    };
  }
}

// Import all the event handling and animation modules
export * from './html/events';
export * from './html/events/three-phase-transition-handler';
export * from './html/events/variant-handler';
export * from './html/events/reaction-handler';
export * from './html/events/initializer';
export * from './html/events/attributes';

// Import animation CSS injection
import { injectAnimationCSS } from './html/events/element-copier';

// Import the modular animation functions
import { 
  handleAnimatedVariantSwitch, 
  performInstantVariantSwitch, 
  setTransitionLock, 
  clearTransitionLock,
  getTransitionLockStatus
} from './html/events/transition-manager';

import {
  handleReaction,
  startTimeoutReactionsForNewlyActiveVariant,
  startTimeoutReactionsForNestedComponents,
  clearAllTimeoutReactions
} from './html/events/modular-transition-handler';

// Import the modular transition handler function
import { createModularSmartAnimateHandler } from './html/events/modular-transition-handler';

// Store the function for later execution
let modularTransitionHandlerCode: string | null = null;

// Function to execute the modular transition handler when needed
function executeModularTransitionHandler() {
  if (!modularTransitionHandlerCode) {
    modularTransitionHandlerCode = createModularSmartAnimateHandler();
  }
  
  try {
    eval(modularTransitionHandlerCode);
    console.log('DEBUG: Modular transition handler executed successfully');
    return true;
  } catch (error) {
    console.error('DEBUG: Error executing modular transition handler:', error);
    return false;
  }
}

// CRITICAL: Expose functions immediately when script loads, not waiting for DOM
if (typeof window !== 'undefined') {
  console.log('DEBUG: Refactored system loaded in browser');
  
  // Expose functions immediately to ensure they're available for eval context
  window.handleAnimatedVariantSwitch = handleAnimatedVariantSwitch;
  window.performInstantVariantSwitch = performInstantVariantSwitch;
  window.handleReaction = handleReaction;
  window.startTimeoutReactionsForNewlyActiveVariant = startTimeoutReactionsForNewlyActiveVariant;
  window.startTimeoutReactionsForNestedComponents = startTimeoutReactionsForNestedComponents;
  window.clearAllTimeoutReactions = clearAllTimeoutReactions;
  window.setTransitionLock = setTransitionLock;
  window.clearTransitionLock = clearTransitionLock;
  window.getTransitionLockStatus = getTransitionLockStatus;
  
  // Also expose the modular system for the eval context
  window.modularAnimationSystem = {
    handleAnimatedVariantSwitch,
    performInstantVariantSwitch,
    setTransitionLock,
    clearTransitionLock,
    getTransitionLockStatus
  };
  
  console.log('DEBUG: Functions exposed immediately to window object');
  
  // ✅ FIX: Inject animation CSS styles immediately
  injectAnimationCSS();
  
  // Wait for DOM to be ready for the rest of initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSystem);
  } else {
    initializeSystem();
  }
}

function initializeSystem() {
  console.log('DEBUG: Initializing refactored system with modular transition handler');
  
  // Functions are already exposed to window object from the immediate execution above
  
  // Debug: Log what we're exposing
  console.log('DEBUG: Exposing functions globally:', {
    handleAnimatedVariantSwitch: typeof window.handleAnimatedVariantSwitch,
    performInstantVariantSwitch: typeof window.performInstantVariantSwitch,
    handleReaction: typeof window.handleReaction,
    modularAnimationSystem: typeof window.modularAnimationSystem
  });
  
  // Debug: Check if the imported functions are actually functions
  console.log('DEBUG: Imported function types:', {
    handleAnimatedVariantSwitch: typeof handleAnimatedVariantSwitch,
    performInstantVariantSwitch: typeof performInstantVariantSwitch,
    handleReaction: typeof handleReaction
  });
  
  // Debug: Check if the functions are null/undefined
  console.log('DEBUG: Function null checks:', {
    'handleAnimatedVariantSwitch === null': handleAnimatedVariantSwitch === null,
    'handleAnimatedVariantSwitch === undefined': handleAnimatedVariantSwitch === undefined,
    'performInstantVariantSwitch === null': performInstantVariantSwitch === null,
    'performInstantVariantSwitch === undefined': performInstantVariantSwitch === undefined,
    'handleReaction === null': handleReaction === null,
    'handleReaction === undefined': handleReaction === undefined
  });
  
  // Debug: Check if the functions are actually being assigned
  console.log('DEBUG: Function assignment verification:', {
    'window.handleAnimatedVariantSwitch === handleAnimatedVariantSwitch': window.handleAnimatedVariantSwitch === handleAnimatedVariantSwitch,
    'window.performInstantVariantSwitch === performInstantVariantSwitch': window.performInstantVariantSwitch === performInstantVariantSwitch,
    'window.handleReaction === handleReaction': window.handleReaction === handleReaction
  });
  
  // Execute the modular transition handler to expose handleReaction and variant switching functions
  if (executeModularTransitionHandler()) {
    console.log('DEBUG: Modular transition handler executed successfully');
  } else {
    console.error('DEBUG: Failed to execute modular transition handler');
  }
  
  // Check if the functions are available
  setTimeout(() => {
    if (window.handleReaction) {
      console.log('DEBUG: handleReaction function is available globally');
    } else {
      console.error('DEBUG: handleReaction function not found - the modular transition handler may not be properly loaded');
    }
    
    if (window.handleAnimatedVariantSwitch) {
      console.log('DEBUG: handleAnimatedVariantSwitch function is available globally');
    } else {
      console.error('DEBUG: handleAnimatedVariantSwitch function not found');
    }
    
    if (window.performInstantVariantSwitch) {
      console.log('DEBUG: performInstantVariantSwitch function is available globally');
    } else {
      console.error('DEBUG: performInstantVariantSwitch function not found');
    }
    
    if (window.startTimeoutReactionsForNewlyActiveVariant) {
      console.log('DEBUG: startTimeoutReactionsForNewlyActiveVariant function is available globally');
    } else {
      console.error('DEBUG: startTimeoutReactionsForNewlyActiveVariant function not found');
    }
    
    if (window.startTimeoutReactionsForNestedComponents) {
      console.log('DEBUG: startTimeoutReactionsForNestedComponents function is available globally');
    } else {
      console.error('DEBUG: startTimeoutReactionsForNestedComponents function not found');
    }
    
    if (window.clearAllTimeoutReactions) {
      console.log('DEBUG: clearAllTimeoutReactions function is available globally');
    } else {
      console.error('DEBUG: clearAllTimeoutReactions function not found');
    }
  }, 100);
  
  console.log('DEBUG: Modular transition handler functions available');
}

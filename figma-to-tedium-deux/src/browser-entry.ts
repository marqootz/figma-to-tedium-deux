// Browser-only entry point for the refactored system
// This file only includes code that runs in the browser, not in the Figma plugin

// Declare global types
declare global {
  interface Window {
    handleReaction?: (sourceElement: Element, destinationId: string | null, transitionType: string, transitionDuration: string) => void;
    handleAnimatedVariantSwitch?: (sourceElement: Element, destination: Element, allVariants: Element[], transitionType: string, transitionDuration: string) => Promise<void>;
    performInstantVariantSwitch?: (allVariants: Element[], destination: Element) => void;
  }
}

// Import all the event handling and animation modules
export * from './html/events';
export * from './html/events/three-phase-transition-handler';
export * from './html/events/variant-handler';
export * from './html/events/reaction-handler';
export * from './html/events/property-detector';
export * from './html/events/initializer';
export * from './html/events/attributes';

// Import the three-phase transition handler function
import { createThreePhaseTransitionHandler } from './html/events/three-phase-transition-handler';

// Store the function for later execution
let threePhaseTransitionHandlerCode: string | null = null;

// Function to execute the three-phase transition handler when needed
function executeThreePhaseTransitionHandler() {
  if (!threePhaseTransitionHandlerCode) {
    threePhaseTransitionHandlerCode = createThreePhaseTransitionHandler();
  }
  
  try {
    eval(threePhaseTransitionHandlerCode);
    console.log('DEBUG: Three-phase transition handler executed successfully');
    return true;
  } catch (error) {
    console.error('DEBUG: Error executing three-phase transition handler:', error);
    return false;
  }
}

// Initialize the system when loaded in browser
if (typeof window !== 'undefined') {
  console.log('DEBUG: Refactored system loaded in browser');
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSystem);
  } else {
    initializeSystem();
  }
}

function initializeSystem() {
  console.log('DEBUG: Initializing refactored system');
  
  // Execute the three-phase transition handler to expose handleReaction and variant switching functions
  if (executeThreePhaseTransitionHandler()) {
    console.log('DEBUG: Three-phase transition handler executed successfully');
  } else {
    console.error('DEBUG: Failed to execute three-phase transition handler');
  }
  
  // Check if the functions are available
  setTimeout(() => {
    if (window.handleReaction) {
      console.log('DEBUG: handleReaction function is available globally');
    } else {
      console.error('DEBUG: handleReaction function not found - the three-phase transition handler may not be properly loaded');
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
  }, 100);
  
  console.log('DEBUG: Refactored system functions available');
}

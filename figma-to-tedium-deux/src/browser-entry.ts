// Browser-only entry point for the refactored system
// This file only includes code that runs in the browser, not in the Figma plugin

// Declare global types
declare global {
  interface Window {
    handleReaction?: (sourceElement: Element, destinationId: string | null, transitionType: string, transitionDuration: string) => void;
  }
}

// Import all the event handling and animation modules
export * from './html/events';
export * from './html/events/modular-transition-handler';
export * from './html/events/variant-handler';
export * from './html/events/reaction-handler';
export * from './html/events/property-detector';
export * from './html/events/initializer';
export * from './html/events/attributes';

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
  
  // Execute the modular transition handler to expose handleReaction
  if (executeModularTransitionHandler()) {
    console.log('DEBUG: Modular transition handler executed successfully');
  } else {
    console.error('DEBUG: Failed to execute modular transition handler');
  }
  
  // Check if the function is available
  setTimeout(() => {
    if (window.handleReaction) {
      console.log('DEBUG: handleReaction function is available globally');
    } else {
      console.error('DEBUG: handleReaction function not found - the modular transition handler may not be properly loaded');
    }
  }, 100);
  
  console.log('DEBUG: Refactored system functions available');
}

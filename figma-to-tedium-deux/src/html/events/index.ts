// Re-export all event functions
export { generateReactionAttributes, generateVariantAttributes } from './attributes';
export { createVariantSwitchingHandler } from './variant-handler';
export { createReactionHandler, createTimeoutHandler } from './reaction-handler';
export { createPropertyDetector } from './property-detector';
export { createSmartAnimateHandler } from './transition-handler';
export { createComponentSetInitializer } from './initializer';

// Import all handler functions for use in the main generator
import { createVariantSwitchingHandler } from './variant-handler';
import { createReactionHandler, createTimeoutHandler } from './reaction-handler';
import { createPropertyDetector } from './property-detector';
import { createSmartAnimateHandler } from './transition-handler';
import { createComponentSetInitializer } from './initializer';

// Main event handling JavaScript generator
export function generateEventHandlingJavaScript(): string {
  return `
    // Event handling for interactive elements
    document.addEventListener('DOMContentLoaded', function() {
      ${createVariantSwitchingHandler()}
      ${createReactionHandler()}
      ${createTimeoutHandler()}
      ${createPropertyDetector()}
      ${createSmartAnimateHandler()}
      ${createComponentSetInitializer()}
    });
  `;
}

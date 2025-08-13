// Re-export all event functions
export { generateReactionAttributes, generateVariantAttributes } from './attributes';
export { createVariantSwitchingHandler } from './variant-handler';
export { createReactionHandler, createTimeoutHandler } from './reaction-handler';
export { createPropertyDetector } from './property-detector';
// export { createSmartAnimateHandler } from './transition-handler';
export { createModularSmartAnimateHandler } from './modular-transition-handler';
export { createComponentSetInitializer } from './initializer';

// Export animation system types and functions
export {
  AnimationType,
  TranslationCondition,
  AnimationChange,
  ElementAnimationContext,
  getAnimationType,
  getTranslationCondition,
  detectAnimationChanges,
  createAnimationContext,
  applyAnimationChange,
  getEasingFunction
} from './animation-system';

// Import all handler functions for use in the main generator
import { createVariantSwitchingHandler } from './variant-handler';
import { createReactionHandler, createTimeoutHandler } from './reaction-handler';
import { createPropertyDetector } from './property-detector';
// import { createSmartAnimateHandler } from './transition-handler';
import { createModularSmartAnimateHandler } from './modular-transition-handler';
import { createComponentSetInitializer } from './initializer';

// Main event handling JavaScript generator
export function generateEventHandlingJavaScript(): string {
  return `
    // Event handling for interactive elements
    console.log('DEBUG: Event handling JavaScript loaded');
    
    // Global function for testing event handlers
    window.handleFigmaEvent = function(eventType, elementId) {
      console.log('DEBUG: Manual event trigger:', eventType, elementId);
      const element = document.querySelector(\`[data-figma-id="\${elementId}"]\`);
      if (element) {
        if (eventType === 'click') {
          element.click();
        } else if (eventType === 'variant-switch') {
          const variantButton = element.querySelector('[data-variant], [data-variant-property-1]');
          if (variantButton) {
            variantButton.click();
          }
        }
      }
    };
    
    document.addEventListener('DOMContentLoaded', function() {
      console.log('DEBUG: DOMContentLoaded event fired');
      ${createVariantSwitchingHandler()}
      ${createReactionHandler()}
      ${createTimeoutHandler()}
      ${createPropertyDetector()}
      ${createModularSmartAnimateHandler()}
      ${createComponentSetInitializer()}
      console.log('DEBUG: All event handlers initialized');
    });
    
    // Also run immediately if DOM is already loaded
    if (document.readyState === 'loading') {
      console.log('DEBUG: DOM still loading, waiting for DOMContentLoaded');
    } else {
      console.log('DEBUG: DOM already loaded, running handlers immediately');
      ${createVariantSwitchingHandler()}
      ${createReactionHandler()}
      ${createTimeoutHandler()}
      ${createPropertyDetector()}
      ${createModularSmartAnimateHandler()}
      ${createComponentSetInitializer()}
      console.log('DEBUG: All event handlers initialized (immediate)');
    }
  `;
}

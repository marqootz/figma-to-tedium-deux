// Re-export all event functions
export { generateReactionAttributes, generateVariantAttributes } from './attributes';
export { createVariantSwitchingHandler } from './variant-handler';
export { createReactionHandler, createTimeoutHandler } from './reaction-handler';
export { createThreePhaseTransitionHandler } from './three-phase-transition-handler';
export { createComponentSetInitializer } from './initializer';

// Export only the types we need for the three-phase system
export type {
  AnimationType,
  TranslationCondition,
  AnimationChange,
  ElementAnimationContext,
  AnimationSession
} from './animation-system';

// Import all handler functions for use in the main generator
import { createVariantSwitchingHandler } from './variant-handler';
import { createReactionHandler, createTimeoutHandler } from './reaction-handler';
import { createThreePhaseTransitionHandler } from './three-phase-transition-handler';
import { createComponentSetInitializer } from './initializer';

// Main event handling JavaScript generator
export function generateEventHandlingJavaScript(): string {
  return `
    // Reference the external refactored-system.js file
    // This file contains all the animation and event handling logic
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
    
    // Global timer tracking
    const activeTimers = new Map();
    
    // CRITICAL FIX: Add click event handlers for reaction elements
    ${createReactionHandler()}
    
    // Function to start timeout reactions for nested components within a parent element
    function startTimeoutReactionsForNestedComponents(parentElement) {
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
              
              if (window.handleReaction) {
                window.handleReaction(element, destinationId, transitionType, transitionDuration);
              } else {
                console.error('DEBUG: handleReaction function not found in external script');
              }
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
    
    // Function to start timeout reactions for a specific newly active variant
    function startTimeoutReactionsForNewlyActiveVariant(newlyActiveElement) {
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
            if (window.handleReaction) {
              window.handleReaction(newlyActiveElement, destinationId, transitionType, transitionDuration);
            } else {
              console.error('DEBUG: handleReaction function not found in external script');
            }
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
    
    // Function to start timeout reactions for the initial visible variant
    function startTimeoutReactionsForInitialVariant() {
      // Find the first visible variant that should start the flow
      const componentSets = document.querySelectorAll('[data-figma-type="COMPONENT_SET"]');
      console.log('DEBUG: Found', componentSets.length, 'component sets');
      
      // Also check for any elements with reactions
      const allReactionElements = document.querySelectorAll('[data-has-reactions="true"]');
      console.log('DEBUG: Found', allReactionElements.length, 'total elements with reactions');
      
      // Log details about reaction elements
      allReactionElements.forEach((element, index) => {
        const elementId = element.getAttribute('data-figma-id');
        const elementName = element.getAttribute('data-figma-name');
        const trigger = JSON.parse(element.getAttribute('data-reaction-trigger') || '{}');
        const computedStyle = window.getComputedStyle(element);
        
        console.log('DEBUG: Reaction element', index + 1, ':', {
          id: elementId,
          name: elementName,
          trigger: trigger,
          display: computedStyle.display,
          visibility: computedStyle.visibility,
          isActive: element.classList.contains('variant-active'),
          isHidden: element.classList.contains('variant-hidden')
        });
      });
      
      componentSets.forEach(componentSet => {
        const componentSetName = componentSet.getAttribute('data-figma-name');
        const activeVariants = componentSet.querySelectorAll('.variant-active[data-has-reactions="true"]');
        console.log('DEBUG: Component set', componentSetName, 'has', activeVariants.length, 'active variants with reactions');
        
        // Only start timers for the first active variant in each component set
        if (activeVariants.length > 0) {
          const firstActiveVariant = activeVariants[0];
          const elementId = firstActiveVariant.getAttribute('data-figma-id');
          const elementName = firstActiveVariant.getAttribute('data-figma-name');
          const computedStyle = window.getComputedStyle(firstActiveVariant);
          
          console.log('DEBUG: Processing initial variant:', elementId, 'name:', elementName, 'in component set:', componentSetName);
          
          // Only start timer if the variant is actually visible
          if (computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden') {
            const trigger = JSON.parse(firstActiveVariant.getAttribute('data-reaction-trigger') || '{}');
            
            if (trigger.type === 'AFTER_TIMEOUT' && !activeTimers.has(elementId)) {
              console.log('DEBUG: Starting initial timeout reaction for:', elementId, 'name:', elementName, 'timeout:', trigger.timeout, 'in component set:', componentSetName);
              
              const timeoutId = setTimeout(() => {
                console.log('DEBUG: Timeout triggered for element:', elementId, 'name:', elementName);
                activeTimers.delete(elementId);
                const actionType = firstActiveVariant.getAttribute('data-reaction-action-type');
                const destinationId = firstActiveVariant.getAttribute('data-reaction-destination');
                const transitionType = firstActiveVariant.getAttribute('data-reaction-transition-type');
                const transitionDuration = firstActiveVariant.getAttribute('data-reaction-transition-duration');
                
                console.log('DEBUG: Calling handleReaction with:', {
                  destinationId: destinationId,
                  transitionType: transitionType,
                  transitionDuration: transitionDuration
                });
                
                // Call the handleReaction function from the external refactored-system.js
                if (window.handleReaction) {
                  window.handleReaction(firstActiveVariant, destinationId, transitionType, transitionDuration);
                } else {
                  console.error('DEBUG: handleReaction function not found in external script');
                }
              }, (trigger.timeout || 0) * 1000);
              
              activeTimers.set(elementId, timeoutId);
              console.log('DEBUG: Created timeout timer for element:', elementId, 'timeout ID:', timeoutId, 'duration:', (trigger.timeout || 0) * 1000, 'ms');
            } else {
              console.log('DEBUG: Skipping initial variant', elementId, 'name:', elementName, '- no timeout trigger or timer already active');
            }
            
            // CRITICAL FIX: Also start timeout reactions for any nested components within this initial variant
            startTimeoutReactionsForNestedComponents(firstActiveVariant);
          } else {
            console.log('DEBUG: Skipping initial variant', elementId, 'name:', elementName, '- not visible (display:', computedStyle.display, 'visibility:', computedStyle.visibility, ')');
          }
        }
      });
      
      // Also check for any non-variant elements with reactions
      const nonVariantReactionElements = document.querySelectorAll('[data-has-reactions="true"]:not([data-figma-type="COMPONENT"])');
      nonVariantReactionElements.forEach(element => {
        const elementId = element.getAttribute('data-figma-id');
        const elementName = element.getAttribute('data-figma-name');
        const computedStyle = window.getComputedStyle(element);
        
        if (computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden') {
          const trigger = JSON.parse(element.getAttribute('data-reaction-trigger') || '{}');
          
          if (trigger.type === 'AFTER_TIMEOUT' && !activeTimers.has(elementId)) {
            console.log('DEBUG: Starting timeout reaction for initial non-variant element:', elementId, 'name:', elementName);
            const timeoutId = setTimeout(() => {
              activeTimers.delete(elementId);
              const actionType = element.getAttribute('data-reaction-action-type');
              const destinationId = element.getAttribute('data-reaction-destination');
              const transitionType = element.getAttribute('data-reaction-transition-type');
              const transitionDuration = element.getAttribute('data-reaction-transition-duration');
              
              if (window.handleReaction) {
                window.handleReaction(element, destinationId, transitionType, transitionDuration);
              } else {
                console.error('DEBUG: handleReaction function not found in external script');
              }
            }, (trigger.timeout || 0) * 1000);
            activeTimers.set(elementId, timeoutId);
            
            // CRITICAL FIX: Also start timeout reactions for any nested components within this element
            startTimeoutReactionsForNestedComponents(element);
          } else {
            console.log('DEBUG: Skipping initial non-variant element', elementId, 'name:', elementName, '- no timeout trigger or timer already active');
          }
        } else {
          console.log('DEBUG: Skipping initial non-variant element', elementId, 'name:', elementName, '- not visible');
        }
      });
    }
    
    document.addEventListener('DOMContentLoaded', function() {
      console.log('DEBUG: DOMContentLoaded event fired');
      console.log('DEBUG: Using external refactored-system.js file');
      console.log('DEBUG: Starting component set initialization...');
      
      // Initialize component sets
      const componentSets = document.querySelectorAll('[data-figma-type="COMPONENT_SET"]');
      console.log('DEBUG: Found', componentSets.length, 'component sets');
      console.log('DEBUG: Component sets found:', Array.from(componentSets).map(cs => cs.getAttribute('data-figma-name')));
      
      componentSets.forEach(componentSet => {
        const componentSetId = componentSet.getAttribute('data-figma-id');
        const componentSetName = componentSet.getAttribute('data-figma-name');
        const componentSetType = componentSet.getAttribute('data-figma-type');
        const parentType = componentSet.parentElement ? componentSet.parentElement.getAttribute('data-figma-type') : 'NONE';
        const parentId = componentSet.parentElement ? componentSet.parentElement.getAttribute('data-figma-id') : 'NONE';
        
        console.log('Initializing component set/instance with', componentSet.children.length, 'variants:', {
          componentSetId: componentSetId,
          componentSetName: componentSetName,
          componentSetType: componentSetType,
          parentType: parentType,
          parentId: parentId
        });
        
        // Get all variants (COMPONENT elements)
        const variants = Array.from(componentSet.children).filter(child => 
          child.getAttribute('data-figma-type') === 'COMPONENT'
        );
        
        if (variants.length > 0) {
          // Set first variant as active
          const firstVariant = variants[0];
          const firstVariantId = firstVariant.getAttribute('data-figma-id');
          console.log('Set first variant as active (with reactions):', firstVariantId, 'in component set:', componentSetId);
          firstVariant.classList.add('variant-active');
          firstVariant.classList.remove('variant-hidden');
          
          // Hide all other variants
          variants.slice(1).forEach(variant => {
            const variantId = variant.getAttribute('data-figma-id');
            console.log('Set variant as hidden:', variantId, 'in component set:', componentSetId);
            variant.classList.add('variant-hidden');
            variant.classList.remove('variant-active');
          });
        }
      });
      
      // Start timeout reactions after a short delay
      setTimeout(() => {
        console.log('DEBUG: Starting initial timeout reactions');
        startTimeoutReactionsForInitialVariant();
      }, 100);
    });
    
    // Export timeout reaction functions for use by the three-phase transition handler
    window.startTimeoutReactionsForNewlyActiveVariant = startTimeoutReactionsForNewlyActiveVariant;
    window.startTimeoutReactionsForNestedComponents = startTimeoutReactionsForNestedComponents;
  `;
}

// Generate script tag that references the external file
export function generateExternalScriptReference(): string {
  return `<script src="refactored-system.js?v=${Date.now()}"></script>`;
}

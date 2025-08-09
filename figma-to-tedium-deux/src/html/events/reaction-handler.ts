// Reaction handling and timeout management
export function createReactionHandler(): string {
  return `
      // Handle reactions - click, press, and drag
      const reactionElements = document.querySelectorAll('[data-has-reactions="true"]');
      reactionElements.forEach(element => {
        const trigger = JSON.parse(element.getAttribute('data-reaction-trigger') || '{}');
        const actionType = element.getAttribute('data-reaction-action-type');
        const destinationId = element.getAttribute('data-reaction-destination');
        const transitionType = element.getAttribute('data-reaction-transition-type');
        const transitionDuration = element.getAttribute('data-reaction-transition-duration');
        
        // Handle click, press, and drag reactions
        element.addEventListener('click', function() {
          console.log('DEBUG: Click event triggered on element:', {
            id: this.getAttribute('data-figma-id'),
            name: this.getAttribute('data-figma-name'),
            type: this.getAttribute('data-figma-type'),
            trigger: trigger,
            actionType: actionType,
            destinationId: destinationId,
            transitionType: transitionType,
            transitionDuration: transitionDuration
          });
          
          if (trigger.type === 'ON_CLICK' || trigger.type === 'ON_PRESS') {
            console.log('DEBUG: Processing click reaction for element:', this.getAttribute('data-figma-id'));
            handleReaction(this, destinationId, transitionType, transitionDuration);
          }
        });
        
        // Handle drag reactions
        element.addEventListener('mousedown', function() {
          if (trigger.type === 'ON_DRAG') {
            handleReaction(this, destinationId, transitionType, transitionDuration);
          }
        });
      });
  `;
}

export function createTimeoutHandler(): string {
  return `
      // Track which variants have active timers (for preventing duplicate timers during the same activation)
      const activeTimers = new Map(); // elementId -> timeoutId
      
      // Function to start timeout reactions for active variants
      function startTimeoutReactionsForActiveVariants() {
        // Look for both variant-active elements with reactions AND any elements with reactions that don't have variant properties
        const activeVariants = document.querySelectorAll('.variant-active[data-has-reactions="true"]');
        const reactionElements = document.querySelectorAll('[data-has-reactions="true"]');
        
        console.log('DEBUG: Found', activeVariants.length, 'active variants with reactions');
        console.log('DEBUG: Found', reactionElements.length, 'total elements with reactions');
        
        // Process active variants first
        activeVariants.forEach(element => {
          const elementId = element.getAttribute('data-figma-id');
          const elementName = element.getAttribute('data-figma-name');
          const parentComponent = element.closest('[data-figma-type="COMPONENT_SET"]');
          const parentName = parentComponent ? parentComponent.getAttribute('data-figma-name') : 'none';
          
          console.log('DEBUG: Processing variant:', elementId, 'name:', elementName, 'parent:', parentName);
          
          // Only start timers for variants that are actually visible (not hidden by CSS)
          const computedStyle = window.getComputedStyle(element);
          
          if (computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden') {
            const trigger = JSON.parse(element.getAttribute('data-reaction-trigger') || '{}');
            const actionType = element.getAttribute('data-reaction-action-type');
            const destinationId = element.getAttribute('data-reaction-destination');
            const transitionType = element.getAttribute('data-reaction-transition-type');
            const transitionDuration = element.getAttribute('data-reaction-transition-duration');
            
            // Handle timeout reactions only for active variants that don't have an active timer
            if (trigger.type === 'AFTER_TIMEOUT' && !activeTimers.has(elementId)) {
              console.log('DEBUG: Starting timeout reaction for:', elementId, 'name:', elementName, 'timeout:', trigger.timeout, 'parent:', parentName);
              const timeoutId = setTimeout(() => {
                activeTimers.delete(elementId); // Clear the timer when it completes
                handleReaction(element, destinationId, transitionType, transitionDuration);
              }, (trigger.timeout || 0) * 1000);
              activeTimers.set(elementId, timeoutId);
            } else if (activeTimers.has(elementId)) {
              console.log('DEBUG: Skipping variant', elementId, 'name:', elementName, '- timer already active');
            }
          } else {
            console.log('DEBUG: Skipping variant', elementId, 'name:', elementName, '- not visible (display:', computedStyle.display, 'visibility:', computedStyle.visibility, ')');
          }
        });
        
        // Also process any reaction elements that don't have variant properties (like 6461:693)
        reactionElements.forEach(element => {
          const elementId = element.getAttribute('data-figma-id');
          const elementName = element.getAttribute('data-figma-name');
          
          // Skip if this element was already processed as a variant
          if (element.classList.contains('variant-active')) {
            return;
          }
          
          // Skip if this element has variant properties (it will be handled by variant logic)
          if (element.hasAttribute('data-variant-property-1')) {
            return;
          }
          
          const parentComponent = element.closest('[data-figma-type="COMPONENT_SET"]');
          const parentName = parentComponent ? parentComponent.getAttribute('data-figma-name') : 'none';
          
          console.log('DEBUG: Processing non-variant reaction element:', elementId, 'name:', elementName, 'parent:', parentName);
          
          // Only start timers for elements that are actually visible (not hidden by CSS)
          const computedStyle = window.getComputedStyle(element);
          
          if (computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden') {
            const trigger = JSON.parse(element.getAttribute('data-reaction-trigger') || '{}');
            const actionType = element.getAttribute('data-reaction-action-type');
            const destinationId = element.getAttribute('data-reaction-destination');
            const transitionType = element.getAttribute('data-reaction-transition-type');
            const transitionDuration = element.getAttribute('data-reaction-transition-duration');
            
            // Handle timeout reactions only for elements that don't have an active timer
            if (trigger.type === 'AFTER_TIMEOUT' && !activeTimers.has(elementId)) {
              console.log('DEBUG: Starting timeout reaction for non-variant element:', elementId, 'name:', elementName, 'timeout:', trigger.timeout, 'parent:', parentName);
              const timeoutId = setTimeout(() => {
                activeTimers.delete(elementId); // Clear the timer when it completes
                handleReaction(element, destinationId, transitionType, transitionDuration);
              }, (trigger.timeout || 0) * 1000);
              activeTimers.set(elementId, timeoutId);
            } else if (activeTimers.has(elementId)) {
              console.log('DEBUG: Skipping non-variant element', elementId, 'name:', elementName, '- timer already active');
            }
          } else {
            console.log('DEBUG: Skipping non-variant element', elementId, 'name:', elementName, '- not visible (display:', computedStyle.display, 'visibility:', computedStyle.visibility, ')');
          }
        });
      }
      
      // Function to start timeout reactions for nested components when their parent becomes visible
      function startTimeoutReactionsForNestedComponents(parentElement) {
        if (!parentElement) return;
        
        // Find all nested components with timeout reactions within the parent
        const nestedComponents = parentElement.querySelectorAll('[data-has-reactions="true"][data-reaction-trigger*="AFTER_TIMEOUT"]');
        
        nestedComponents.forEach(component => {
          const elementId = component.getAttribute('data-figma-id');
          const elementName = component.getAttribute('data-figma-name');
          const parentComponent = component.closest('[data-figma-type="COMPONENT_SET"]');
          const parentName = parentComponent ? parentComponent.getAttribute('data-figma-name') : 'none';
          
          console.log('DEBUG: Processing nested component:', elementId, 'name:', elementName, 'parent:', parentName);
          
          // Only start timers for nested components that are actually visible
          const computedStyle = window.getComputedStyle(component);
          
          if (computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden') {
            const trigger = JSON.parse(component.getAttribute('data-reaction-trigger') || '{}');
            
            if (trigger.type === 'AFTER_TIMEOUT' && !activeTimers.has(elementId)) {
              console.log('DEBUG: Starting timeout reaction for nested component:', elementId, 'name:', elementName, 'timeout:', trigger.timeout, 'parent:', parentName);
              const timeoutId = setTimeout(() => {
                activeTimers.delete(elementId);
                const actionType = component.getAttribute('data-reaction-action-type');
                const destinationId = component.getAttribute('data-reaction-destination');
                const transitionType = component.getAttribute('data-reaction-transition-type');
                const transitionDuration = component.getAttribute('data-reaction-transition-duration');
                handleReaction(component, destinationId, transitionType, transitionDuration);
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
      
      // CRITICAL FIX: Only start timeout reactions for the initial visible variant
      // Instead of starting timers for all variant-active elements immediately,
      // we wait for the first variant transition or user interaction
      function startTimeoutReactionsForInitialVariant() {
        // Find the first visible variant that should start the flow
        // This is typically the first variant in a component set that's marked as active
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
              
              // Skip nested components that should only start when their parent becomes visible
              // Allow independent components to start their timers on page load
              // Check if this component set is nested within another component set
              const parentComponentSet = componentSet.closest('[data-figma-type="COMPONENT_SET"]');
              const isNestedComponent = parentComponentSet && parentComponentSet !== componentSet;
              
              if (isNestedComponent) {
                console.log('DEBUG: Skipping initial variant', elementId, 'name:', elementName, '- nested component, will start when parent becomes visible');
                return;
              }
              
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
                  handleReaction(firstActiveVariant, destinationId, transitionType, transitionDuration);
                }, (trigger.timeout || 0) * 1000);
                activeTimers.set(elementId, timeoutId);
                console.log('DEBUG: Created timeout timer for element:', elementId, 'timeout ID:', timeoutId, 'duration:', (trigger.timeout || 0) * 1000, 'ms');
                
                // CRITICAL FIX: Also start timeout reactions for any nested components within this initial variant
                startTimeoutReactionsForNestedComponents(firstActiveVariant);
              } else {
                console.log('DEBUG: Skipping initial variant', elementId, 'name:', elementName, '- no timeout trigger or timer already active');
              }
            } else {
              console.log('DEBUG: Skipping initial variant', elementId, 'name:', elementName, '- not visible (display:', computedStyle.display, 'visibility:', computedStyle.visibility, ')');
            }
          }
          
          // CRITICAL FIX: Also check for non-variant reaction elements in this component set
          const reactionElements = componentSet.querySelectorAll('[data-has-reactions="true"]');
          reactionElements.forEach(element => {
            const elementId = element.getAttribute('data-figma-id');
            const elementName = element.getAttribute('data-figma-name');
            
            // Skip if this element was already processed as a variant
            if (element.classList.contains('variant-active')) {
              return;
            }
            
            // Skip if this element has variant properties (it will be handled by variant logic)
            if (element.hasAttribute('data-variant-property-1')) {
              return;
            }
            
            const computedStyle = window.getComputedStyle(element);
            
            console.log('DEBUG: Processing initial non-variant reaction element:', elementId, 'name:', elementName, 'in component set:', componentSetName);
            
            // Only start timer if the element is actually visible
            if (computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden') {
              const trigger = JSON.parse(element.getAttribute('data-reaction-trigger') || '{}');
              
              // Skip nested components that should only start when their parent becomes visible
              const parentComponentSet = componentSet.closest('[data-figma-type="COMPONENT_SET"]');
              const isNestedComponent = parentComponentSet && parentComponentSet !== componentSet;
              
              if (isNestedComponent) {
                console.log('DEBUG: Skipping initial non-variant element', elementId, 'name:', elementName, '- nested component, will start when parent becomes visible');
                return;
              }
              
              if (trigger.type === 'AFTER_TIMEOUT' && !activeTimers.has(elementId)) {
                console.log('DEBUG: Starting initial timeout reaction for non-variant element:', elementId, 'name:', elementName, 'timeout:', trigger.timeout, 'in component set:', componentSetName);
                const timeoutId = setTimeout(() => {
                  activeTimers.delete(elementId);
                  const actionType = element.getAttribute('data-reaction-action-type');
                  const destinationId = element.getAttribute('data-reaction-destination');
                  const transitionType = element.getAttribute('data-reaction-transition-type');
                  const transitionDuration = element.getAttribute('data-reaction-transition-duration');
                  handleReaction(element, destinationId, transitionType, transitionDuration);
                }, (trigger.timeout || 0) * 1000);
                activeTimers.set(elementId, timeoutId);
                
                // Also start timeout reactions for any nested components within this element
                startTimeoutReactionsForNestedComponents(element);
              } else {
                console.log('DEBUG: Skipping initial non-variant element', elementId, 'name:', elementName, '- no timeout trigger or timer already active');
              }
            } else {
              console.log('DEBUG: Skipping initial non-variant element', elementId, 'name:', elementName, '- not visible (display:', computedStyle.display, 'visibility:', computedStyle.visibility, ')');
            }
          });
        });
      }
      
      // Start timeout reactions for the initial visible variant after a short delay
      // to ensure CSS classes and visibility are properly applied
      console.log('DEBUG: Setting up initial timeout reactions');
      setTimeout(() => {
        console.log('DEBUG: Starting initial timeout reactions');
        startTimeoutReactionsForInitialVariant();
      }, 100);
  `;
}

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
          if (trigger.type === 'ON_CLICK' || trigger.type === 'ON_PRESS') {
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
        const activeVariants = document.querySelectorAll('.variant-active[data-has-reactions="true"]');
        activeVariants.forEach(element => {
          const elementId = element.getAttribute('data-figma-id');
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
              console.log('DEBUG: Starting timeout reaction for:', elementId, 'timeout:', trigger.timeout);
              const timeoutId = setTimeout(() => {
                activeTimers.delete(elementId); // Clear the timer when it completes
                handleReaction(element, destinationId, transitionType, transitionDuration);
              }, (trigger.timeout || 0) * 1000);
              activeTimers.set(elementId, timeoutId);
            } else if (activeTimers.has(elementId)) {
              console.log('DEBUG: Skipping variant', elementId, '- timer already active');
            }
          }
        });
      }
      
      // Start timeout reactions for initially active variants after a short delay
      // to ensure CSS classes and visibility are properly applied
      setTimeout(() => {
        startTimeoutReactionsForActiveVariants();
      }, 100);
  `;
}

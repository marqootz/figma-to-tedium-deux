import { FigmaNode, Reaction, VariantProperties } from '../types';
import { safeToString, escapeHtmlAttribute, safeHasProperty } from './utils';

// Event attribute generation
export function generateReactionAttributes(node: FigmaNode): Record<string, string> {
  const attributes: Record<string, string> = {};
  
  if (safeHasProperty(node, 'reactions') && (node as any).reactions && (node as any).reactions.length > 0) {
    const reactions = (node as any).reactions as Reaction[];
    const firstReaction = reactions[0];
    
    if (firstReaction) {
      attributes['data-has-reactions'] = 'true';
      attributes['data-reaction-count'] = String(reactions.length);
      
      if (firstReaction.trigger) {
        attributes['data-reaction-trigger'] = escapeHtmlAttribute(JSON.stringify(firstReaction.trigger));
      }
      
      // Check both action and actions fields
      let actionToUse: any = null;
      if (firstReaction.action) {
        actionToUse = firstReaction.action;
      } else if (firstReaction.actions && firstReaction.actions.length > 0) {
        actionToUse = firstReaction.actions[0];
      }
      
      if (actionToUse && actionToUse.type) {
        attributes['data-reaction-action-type'] = actionToUse.type;
        
        if (actionToUse.destinationId) {
          attributes['data-reaction-destination'] = actionToUse.destinationId;
        }
        
        // Extract transition data from the action
        if (actionToUse.transition && actionToUse.transition.type) {
          attributes['data-reaction-transition-type'] = actionToUse.transition.type;
          if (actionToUse.transition.duration) {
            attributes['data-reaction-transition-duration'] = String(actionToUse.transition.duration);
          }
        }
      }
    }
  }
  
  return attributes;
}

export function generateVariantAttributes(node: FigmaNode): Record<string, string> {
  const attributes: Record<string, string> = {};
  
  if (safeHasProperty(node, 'variantProperties') && (node as any).variantProperties) {
    const variantProps = (node as any).variantProperties as VariantProperties;
    
    Object.entries(variantProps).forEach(([key, value]) => {
      const cleanKey = key.toLowerCase().replace(/\s+/g, '-');
      attributes[`data-variant-${cleanKey}`] = escapeHtmlAttribute(safeToString(value));
    });
  }
  
  return attributes;
}

// Event JavaScript generation
export function generateEventHandlingJavaScript(): string {
  return `
    // Event handling for interactive elements
    document.addEventListener('DOMContentLoaded', function() {
      // Handle variant switching - support both data-variant and data-variant-property-* attributes
      const variantButtons = document.querySelectorAll('[data-variant], [data-variant-property-1]');
      variantButtons.forEach(button => {
        button.addEventListener('click', function() {
          const variant = this.getAttribute('data-variant') || this.getAttribute('data-variant-property-1');
          const targetId = this.getAttribute('data-target');
          
          if (targetId) {
            const target = document.querySelector(\`[data-figma-id="\${targetId}"]\`);
            if (target) {
              // Reset opacity for all variants to ensure clean state
              target.querySelectorAll('[data-variant], [data-variant-property-1]').forEach(el => {
                el.style.opacity = '1'; // Reset opacity to 1 for all variants
                el.classList.add('variant-hidden');
                el.classList.remove('variant-active');
              });
              
              // Show selected variant
              const selectedVariant = target.querySelector(\`[data-variant="\${variant}"], [data-variant-property-1="\${variant}"]\`);
              if (selectedVariant) {
                selectedVariant.style.opacity = '1'; // Ensure selected variant has opacity 1
                selectedVariant.classList.add('variant-active');
                selectedVariant.classList.remove('variant-hidden');
              }
            }
          }
        });
      });
      
      // Handle reactions - both click and timeout
      const reactionElements = document.querySelectorAll('[data-has-reactions="true"]');
      reactionElements.forEach(element => {
        const trigger = JSON.parse(element.getAttribute('data-reaction-trigger') || '{}');
        const actionType = element.getAttribute('data-reaction-action-type');
        const destinationId = element.getAttribute('data-reaction-destination');
        const transitionType = element.getAttribute('data-reaction-transition-type');
        const transitionDuration = element.getAttribute('data-reaction-transition-duration');
        
        // Handle click reactions
        element.addEventListener('click', function() {
          if (trigger.type === 'ON_CLICK') {
            handleReaction(this, destinationId, transitionType, transitionDuration);
          }
        });
      });
      
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
      
      // Helper function to find elements with property changes between variants
      function findElementsWithPropertyChanges(targetVariant, currentVariant) {
        if (!currentVariant) return [];
        
        const targetElements = targetVariant.querySelectorAll('[data-figma-id]');
        const sourceElements = currentVariant.querySelectorAll('[data-figma-id]');
        const sourceElementMap = new Map();
        const elementsToAnimate = [];

        // Build source element map by name
        sourceElements.forEach(function(sourceElement) {
          const sourceName = sourceElement.getAttribute('data-figma-name') || sourceElement.getAttribute('data-figma-id');
          if (sourceName) {
            sourceElementMap.set(sourceName, sourceElement);
          }
        });

        // Analyze each target element for property changes
        targetElements.forEach(function(element) {
          const targetName = element.getAttribute('data-figma-name') || element.getAttribute('data-figma-id');
          const sourceElement = sourceElementMap.get(targetName);
          
          if (sourceElement) {
            const changes = detectPropertyChanges(element, sourceElement);
            
            if (changes.hasChanges) {
              elementsToAnimate.push({
                element: element,
                sourceElement: sourceElement,
                changes: changes
              });
              console.log('DEBUG: Found element with property changes:', targetName, 'changes:', changes);
            }
          }
        });
        
        return elementsToAnimate;
      }

      // Helper function to detect property changes between elements
      function detectPropertyChanges(targetElement, sourceElement) {
        const changes = {
          hasChanges: false,
          positionX: { changed: false, sourceValue: null, targetValue: null },
          positionY: { changed: false, sourceValue: null, targetValue: null },
          backgroundColor: { changed: false, sourceValue: null, targetValue: null },
          justifyContent: { changed: false, sourceValue: null, targetValue: null },
          alignItems: { changed: false, sourceValue: null, targetValue: null }
        };

        // Check position changes by comparing the computed styles
        const sourceStyle = window.getComputedStyle(sourceElement);
        const targetStyle = window.getComputedStyle(targetElement);
        
        // Check left position changes
        const sourceLeft = parseFloat(sourceStyle.left) || 0;
        const targetLeft = parseFloat(targetStyle.left) || 0;
        
        // Log detailed information about the elements
        const sourceName = sourceElement.getAttribute('data-figma-name');
        const targetName = targetElement.getAttribute('data-figma-name');
        const sourceId = sourceElement.getAttribute('data-figma-id');
        const targetId = targetElement.getAttribute('data-figma-id');
        
        console.log('DEBUG: Analyzing elements:');
        console.log('  Source:', sourceName, 'ID:', sourceId, 'Left:', sourceLeft);
        console.log('  Target:', targetName, 'ID:', targetId, 'Left:', targetLeft);
        
        // Log parent container dimensions
        const sourceContainer = sourceElement.closest('[data-figma-type="COMPONENT_SET"], [data-figma-type="COMPONENT"]');
        const targetContainer = targetElement.closest('[data-figma-type="COMPONENT_SET"], [data-figma-type="COMPONENT"]');
        
        if (sourceContainer) {
          const sourceContainerRect = sourceContainer.getBoundingClientRect();
          console.log('  Source container dimensions:', sourceContainerRect.width, 'x', sourceContainerRect.height);
        }
        
        if (targetContainer) {
          const targetContainerRect = targetContainer.getBoundingClientRect();
          console.log('  Target container dimensions:', targetContainerRect.width, 'x', targetContainerRect.height);
        }
        
        // Log viewport dimensions
        console.log('  Viewport dimensions:', window.innerWidth, 'x', window.innerHeight);
        
        // Log element dimensions
        const sourceRect = sourceElement.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();
        console.log('  Source element dimensions:', sourceRect.width, 'x', sourceRect.height);
        console.log('  Target element dimensions:', targetRect.width, 'x', targetRect.height);
        
        if (Math.abs(sourceLeft - targetLeft) > 1) {
          changes.positionX.changed = true;
          changes.positionX.sourceValue = sourceLeft;
          changes.positionX.targetValue = targetLeft;
          changes.hasChanges = true;
          console.log('DEBUG: Position X change detected:', sourceLeft, '->', targetLeft);
        }
        
        // Check top position changes
        const sourceTop = parseFloat(sourceStyle.top) || 0;
        const targetTop = parseFloat(targetStyle.top) || 0;
        
        if (Math.abs(sourceTop - targetTop) > 1) {
          changes.positionY.changed = true;
          changes.positionY.sourceValue = sourceTop;
          changes.positionY.targetValue = targetTop;
          changes.hasChanges = true;
          console.log('DEBUG: Position Y change detected:', sourceTop, '->', targetTop);
        }

        // Check style changes
        if (sourceStyle.backgroundColor !== targetStyle.backgroundColor) {
          changes.backgroundColor.changed = true;
          changes.backgroundColor.sourceValue = sourceStyle.backgroundColor;
          changes.backgroundColor.targetValue = targetStyle.backgroundColor;
          changes.hasChanges = true;
        }
        
        if (sourceStyle.justifyContent !== targetStyle.justifyContent) {
          changes.justifyContent.changed = true;
          changes.justifyContent.sourceValue = sourceStyle.justifyContent;
          changes.justifyContent.targetValue = targetStyle.justifyContent;
          changes.hasChanges = true;
        }
        
        if (sourceStyle.alignItems !== targetStyle.alignItems) {
          changes.alignItems.changed = true;
          changes.alignItems.sourceValue = sourceStyle.alignItems;
          changes.alignItems.targetValue = targetStyle.alignItems;
          changes.hasChanges = true;
        }

        return changes;
      }
      
      // Helper function to handle reaction transitions
      function handleReaction(sourceElement, destinationId, transitionType, transitionDuration) {
        if (destinationId) {
          const destination = document.querySelector(\`[data-figma-id="\${destinationId}"]\`);
          if (destination) {
            // Handle different transition types
            if (transitionType === 'DISSOLVE') {
              // Dissolve transition
              sourceElement.style.opacity = '0';
              setTimeout(() => {
                sourceElement.classList.add('variant-hidden');
                sourceElement.classList.remove('variant-active');
                sourceElement.style.opacity = '1'; // Reset source element opacity for next cycle
                destination.classList.add('variant-active');
                destination.classList.remove('variant-hidden');
                destination.style.opacity = '1';
                
                // Start timeout reactions for the newly active destination variant
                startTimeoutReactionsForActiveVariants();
              }, parseFloat(transitionDuration || '300'));
            } else if (transitionType === 'SMART_ANIMATE') {
              // Smart animate transition - sophisticated implementation
              console.log('DEBUG: SMART_ANIMATE transition started');
              
              // Find elements with property changes
              const elementsToAnimate = findElementsWithPropertyChanges(destination, sourceElement);
              console.log('DEBUG: Found', elementsToAnimate.length, 'elements to animate');
              
              // Setup phase: Make destination visible but with source positions
              destination.classList.add('variant-active');
              destination.classList.remove('variant-hidden');
              destination.style.visibility = 'visible';
              destination.style.display = 'flex';
              destination.style.position = 'absolute';
              destination.style.top = '0';
              destination.style.left = '0';
              destination.style.width = '100%';
              destination.style.height = '100%';
              
              // Setup each element for animation
              elementsToAnimate.forEach(function(item) {
                const element = item.element;
                const sourceElement = item.sourceElement;
                const changes = item.changes;
                
                console.log('DEBUG: Setting up element for animation:', element.getAttribute('data-figma-id'));
                console.log('DEBUG: Changes detected:', changes);
                
                // Log current element state
                const elementRect = element.getBoundingClientRect();
                const elementStyle = window.getComputedStyle(element);
                console.log('DEBUG: Element current state:');
                console.log('  Position:', elementStyle.left, elementStyle.top);
                console.log('  Dimensions:', elementRect.width, 'x', elementRect.height);
                console.log('  Container dimensions:', element.closest('[data-figma-type="COMPONENT_SET"]').getBoundingClientRect());
                
                // Store original styles
                element.setAttribute('data-original-styles', JSON.stringify({
                  position: element.style.position,
                  left: element.style.left,
                  top: element.style.top,
                  transform: element.style.transform,
                  backgroundColor: element.style.backgroundColor,
                  justifyContent: element.style.justifyContent,
                  alignItems: element.style.alignItems
                }));
                
                // Store calculated end position if we recalculated it
                if (changes.positionX.changed && changes.positionX.targetValue > 1000) {
                  // We'll store the calculated value after we recalculate it
                  element.setAttribute('data-needs-recalculation', 'true');
                }
                
                // Set target elements to starting element values
                if (changes.positionX.changed || changes.positionY.changed) {
                  element.style.position = 'absolute';
                  
                  // Use the computed style values directly
                  if (changes.positionX.changed) {
                    element.style.left = changes.positionX.sourceValue + 'px';
                    console.log('DEBUG: Setting initial left position:', changes.positionX.sourceValue + 'px');
                  }
                  
                  if (changes.positionY.changed) {
                    element.style.top = changes.positionY.sourceValue + 'px';
                    console.log('DEBUG: Setting initial top position:', changes.positionY.sourceValue + 'px');
                  }
                }
                
                // Calculate correct end position for elements moving to the right (off-screen positions)
                if (changes.positionX.changed && changes.positionX.targetValue > 1000) {
                  const container = element.closest('[data-figma-type="COMPONENT_SET"], [data-figma-type="COMPONENT"]');
                  if (container) {
                    const containerRect = container.getBoundingClientRect();
                    const elementRect = element.getBoundingClientRect();
                    
                    if (containerRect.width > 0 && elementRect.width > 0) {
                      // For flex-end positioning, the element should be flush against the right edge
                      // The gap is for spacing between elements, not from the edge
                      const calculatedEndPosition = containerRect.width - elementRect.width;
                      changes.positionX.targetValue = calculatedEndPosition;
                      // Store the calculated value for cleanup
                      element.setAttribute('data-calculated-end-position', calculatedEndPosition.toString());
                      console.log('DEBUG: Recalculated end position:', calculatedEndPosition, 'container width:', containerRect.width, 'element width:', elementRect.width);
                    }
                  }
                }
                
                if (changes.backgroundColor.changed) {
                  element.style.backgroundColor = changes.backgroundColor.sourceValue;
                }
                
                if (changes.justifyContent.changed) {
                  element.style.justifyContent = changes.justifyContent.sourceValue;
                }
                
                if (changes.alignItems.changed) {
                  element.style.alignItems = changes.alignItems.sourceValue;
                }
                
                // Add transition
                element.style.transition = \`all \${transitionDuration || 0.3}s ease-in-out\`;
              });
              
              // Execution phase: Animate to target values
              setTimeout(() => {
                elementsToAnimate.forEach(function(item) {
                  const element = item.element;
                  const changes = item.changes;
                  
                  console.log('DEBUG: Executing animation for element:', element.getAttribute('data-figma-id'));
                  
                  if (changes.positionX.changed || changes.positionY.changed) {
                    // Use the computed style values directly
                    if (changes.positionX.changed) {
                      const startLeft = parseFloat(window.getComputedStyle(element).left) || 0;
                      const endLeft = changes.positionX.targetValue;
                      
                      console.log('DEBUG: Animation movement:');
                      console.log('  Starting left position:', startLeft);
                      console.log('  Target left position:', endLeft);
                      console.log('  Movement distance:', endLeft - startLeft);
                      
                      element.style.left = endLeft + 'px';
                      console.log('DEBUG: Animating to left position:', endLeft + 'px');
                    }
                    
                    if (changes.positionY.changed) {
                      element.style.top = changes.positionY.targetValue + 'px';
                      console.log('DEBUG: Animating to top position:', changes.positionY.targetValue + 'px');
                    }
                  }
                  
                  if (changes.backgroundColor.changed) {
                    element.style.backgroundColor = changes.backgroundColor.targetValue;
                  }
                  
                  if (changes.justifyContent.changed) {
                    element.style.justifyContent = changes.justifyContent.targetValue;
                  }
                  
                  if (changes.alignItems.changed) {
                    element.style.alignItems = changes.alignItems.targetValue;
                  }
                });
              }, 50); // Small delay to ensure setup is complete
              
              // Cleanup phase: Restore original styles after animation
              setTimeout(() => {
                elementsToAnimate.forEach(function(item) {
                  const element = item.element;
                  const originalStyles = JSON.parse(element.getAttribute('data-original-styles') || '{}');
                  
                  console.log('DEBUG: Cleaning up element:', element.getAttribute('data-figma-id'));
                  
                  // Remove transition
                  element.style.transition = '';
                  
                  // Restore original values, but use calculated end position if available
                  if (originalStyles.position) element.style.position = originalStyles.position;
                  
                  // Check if we have a calculated end position to use instead of original
                  const calculatedEndPosition = element.getAttribute('data-calculated-end-position');
                  if (calculatedEndPosition) {
                    // For elements that were recalculated, we need to restore the proper layout
                    // Remove absolute positioning and let the parent's flexbox handle positioning
                    element.style.position = '';
                    element.style.left = '';
                    element.style.top = '';
                    console.log('DEBUG: Restored flexbox layout for element with calculated position');
                  } else if (originalStyles.left) {
                    element.style.left = originalStyles.left;
                  }
                  
                  if (originalStyles.top) element.style.top = originalStyles.top;
                  if (originalStyles.transform) element.style.transform = originalStyles.transform;
                  if (originalStyles.backgroundColor) element.style.backgroundColor = originalStyles.backgroundColor;
                  if (originalStyles.justifyContent) element.style.justifyContent = originalStyles.justifyContent;
                  if (originalStyles.alignItems) element.style.alignItems = originalStyles.alignItems;
                  
                  // Remove stored data
                  element.removeAttribute('data-original-styles');
                  element.removeAttribute('data-calculated-end-position');
                  element.removeAttribute('data-needs-recalculation');
                });
                
                // Hide source variant and reset its opacity for next cycle
                sourceElement.classList.add('variant-hidden');
                sourceElement.classList.remove('variant-active');
                sourceElement.style.opacity = '1'; // Reset source element opacity for next cycle
                
                console.log('DEBUG: SMART_ANIMATE transition completed');
                
                // Start timeout reactions for the newly active destination variant
                startTimeoutReactionsForActiveVariants();
              }, parseFloat(transitionDuration || '300') * 1000 + 100);
              
            } else {
              // Default transition - simple show/hide using CSS classes
              sourceElement.classList.add('variant-hidden');
              sourceElement.classList.remove('variant-active');
              sourceElement.style.opacity = '1'; // Reset source element opacity for next cycle
              destination.classList.add('variant-active');
              destination.classList.remove('variant-hidden');
              destination.style.opacity = '1'; // Ensure destination has opacity 1
              
              // Start timeout reactions for the newly active destination variant
              startTimeoutReactionsForActiveVariants();
            }
          }
        }
      }
      
      // Initialize component set variants - hide all but the first one
      const componentSets = document.querySelectorAll('[data-figma-type="COMPONENT_SET"]');
      componentSets.forEach(componentSet => {
        const variants = componentSet.querySelectorAll('[data-variant-property-1]');
        if (variants.length > 1) {
          console.log('Initializing component set with', variants.length, 'variants');
          // Reset opacity for all variants to ensure clean initial state
          variants.forEach(variant => {
            variant.style.opacity = '1'; // Ensure all variants start with opacity 1
          });
          // The first variant should already have variant-active class
          // All others should have variant-hidden class
          variants.forEach((variant, index) => {
            if (index === 0) {
              variant.classList.add('variant-active');
              variant.classList.remove('variant-hidden');
            } else {
              variant.classList.add('variant-hidden');
              variant.classList.remove('variant-active');
            }
          });
        }
      });
    });
  `;
} 
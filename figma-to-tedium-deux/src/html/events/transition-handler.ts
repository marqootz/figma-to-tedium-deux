// Transition handling logic
export function createSmartAnimateHandler(): string {
  return `
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
              
              // Ensure destination is visible and positioned before analysis
              destination.classList.add('variant-active');
              destination.classList.remove('variant-hidden');
              destination.style.visibility = 'visible';
              destination.style.display = 'flex';
              destination.style.position = 'absolute';
              destination.style.top = '0';
              destination.style.left = '0';
              destination.style.width = '100%';
              destination.style.height = '100%';
              destination.style.opacity = '1';
              
              // Force a reflow to ensure the destination is properly rendered
              destination.offsetHeight;
              
              // Find elements with property changes
              const elementsToAnimate = findElementsWithPropertyChanges(destination, sourceElement);
              console.log('DEBUG: Found', elementsToAnimate.length, 'elements to animate');
              
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
  `;
}

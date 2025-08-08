// Transition handling logic
export function createSmartAnimateHandler(): string {
  return `
      // Helper function to ensure tap targets are visible after variant transitions
      function ensureTapTargetsVisible(variant) {
        console.log('DEBUG: Ensuring tap targets are visible in variant:', variant.getAttribute('data-figma-id'));
        
        // Find all tap targets (elements with reactions) in the variant
        const tapTargets = variant.querySelectorAll('[data-has-reactions="true"]');
        tapTargets.forEach(target => {
          const computedStyle = window.getComputedStyle(target);
          console.log('DEBUG: Tap target visibility check:', target.getAttribute('data-figma-id'), 'display:', computedStyle.display, 'visibility:', computedStyle.visibility);
          
          // Ensure tap targets are visible and clickable
          if (computedStyle.display === 'none') {
            // The issue is that the parent variant has variant-hidden class
            // We need to force the display to override the inherited display: none
            target.style.setProperty('display', 'flex');
            console.log('DEBUG: Restored tap target display to flex:', target.getAttribute('data-figma-id'));
          }
          if (computedStyle.visibility === 'hidden') {
            target.style.setProperty('visibility', 'visible');
            console.log('DEBUG: Restored tap target visibility:', target.getAttribute('data-figma-id'));
          }
        });
      }

      // Helper function to handle reaction transitions
      function handleReaction(sourceElement, destinationId, transitionType, transitionDuration) {
        if (destinationId) {
          const destination = document.querySelector(\`[data-figma-id="\${destinationId}"]\`);
          if (destination) {
            console.log('DEBUG: handleReaction called:', {
              sourceId: sourceElement.getAttribute('data-figma-id'),
              sourceType: sourceElement.getAttribute('data-figma-type'),
              destinationId: destinationId,
              destinationType: destination.getAttribute('data-figma-type')
            });
            
            // CRITICAL FIX: Check if this is a variant switch within a component set
            // Find the common parent component set for both source and destination
            const sourceComponentSet = sourceElement.closest('[data-figma-type="COMPONENT_SET"]');
            const destinationComponentSet = destination.closest('[data-figma-type="COMPONENT_SET"]');
            
            console.log('DEBUG: Component set detection:', {
              sourceComponentSetId: sourceComponentSet?.getAttribute('data-figma-id'),
              sourceComponentSetName: sourceComponentSet?.getAttribute('data-figma-name'),
              destinationComponentSetId: destinationComponentSet?.getAttribute('data-figma-id'),
              destinationComponentSetName: destinationComponentSet?.getAttribute('data-figma-name'),
              sameComponentSet: sourceComponentSet === destinationComponentSet
            });
            
            // CRITICAL FIX: Handle the case where source is an INSTANCE and destination is a COMPONENT
            // This happens when the instance has a reaction that targets a component within its child component set
            if (sourceElement.getAttribute('data-figma-type') === 'INSTANCE' && 
                destination.getAttribute('data-figma-type') === 'COMPONENT' && 
                destinationComponentSet) {
              
              console.log('DEBUG: This is an instance-to-component transition within a component set');
              
              // Find the component set that contains the destination
              const componentSet = destinationComponentSet;
              const allVariants = Array.from(componentSet.children).filter(child => 
                child.getAttribute('data-figma-type') === 'COMPONENT'
              );
              
              console.log('DEBUG: Found', allVariants.length, 'variants in component set for switching');
              console.log('DEBUG: Variant IDs:', allVariants.map(v => v.getAttribute('data-figma-id')));
              
              // Handle animation for variant switching
              if (transitionType === 'SMART_ANIMATE') {
                console.log('DEBUG: SMART_ANIMATE variant transition started');
                
                // Find the currently active variant to animate from
                const activeVariant = allVariants.find(variant => 
                  variant.classList.contains('variant-active')
                );
                
                if (activeVariant) {
                  console.log('DEBUG: Animating from active variant:', activeVariant.getAttribute('data-figma-id'));
                  
                  // Store original destination dimensions for restoration after animation
                  const originalDestinationWidth = destination.style.width;
                  const originalDestinationHeight = destination.style.height;
                  
                  // Ensure destination is visible and positioned before analysis
                  destination.classList.add('variant-active');
                  destination.classList.remove('variant-hidden');
                  destination.style.visibility = 'visible';
                  destination.style.display = 'flex';
                  destination.style.position = 'relative';
                  destination.style.top = '0';
                  destination.style.left = '0';
                  destination.style.opacity = '1';
                  
                  // Force a reflow to ensure the destination is properly rendered before analysis
                  destination.offsetHeight;
                  
                  // Immediately ensure tap targets are visible in the destination variant
                  ensureTapTargetsVisible(destination);
                  
                  // Force a reflow to ensure the destination is properly rendered
                  destination.offsetHeight;
                  
                  // Double-check tap targets are visible after reflow
                  ensureTapTargetsVisible(destination);
                  
                  // Hide source element during animation to prevent visual conflicts
                  activeVariant.style.opacity = '0';
                  
                  // Find elements with property changes
                  const elementsToAnimate = findElementsWithPropertyChanges(destination, activeVariant);
                  console.log('DEBUG: Found', elementsToAnimate.length, 'elements to animate in variant transition');
                  
                  // If no elements found, try a different approach - look for background color changes
                  if (elementsToAnimate.length === 0) {
                    console.log('DEBUG: No elements found for animation, checking for background color changes');
                    const sourceFrames = activeVariant.querySelectorAll('[data-figma-type="FRAME"]');
                    const targetFrames = destination.querySelectorAll('[data-figma-type="FRAME"]');
                    
                    sourceFrames.forEach((sourceFrame, index) => {
                      if (targetFrames[index]) {
                        const sourceStyle = window.getComputedStyle(sourceFrame);
                        const targetStyle = window.getComputedStyle(targetFrames[index]);
                        
                        if (sourceStyle.backgroundColor !== targetStyle.backgroundColor) {
                          console.log('DEBUG: Found background color change:', sourceStyle.backgroundColor, '->', targetStyle.backgroundColor);
                          elementsToAnimate.push({
                            element: targetFrames[index],
                            sourceElement: sourceFrame,
                            changes: {
                              hasChanges: true,
                              positionX: { changed: false, sourceValue: null, targetValue: null },
                              positionY: { changed: false, sourceValue: null, targetValue: null },
                              backgroundColor: {
                                changed: true,
                                sourceValue: sourceStyle.backgroundColor,
                                targetValue: targetStyle.backgroundColor
                              },
                              color: { changed: false, sourceValue: null, targetValue: null },
                              justifyContent: { changed: false, sourceValue: null, targetValue: null },
                              alignItems: { changed: false, sourceValue: null, targetValue: null },
                              width: { changed: false, sourceValue: null, targetValue: null },
                              height: { changed: false, sourceValue: null, targetValue: null },
                              opacity: { changed: false, sourceValue: null, targetValue: null },
                              transform: { changed: false, sourceValue: null, targetValue: null }
                            }
                          });
                        }
                      }
                    });
                  }
                  
                  // Animate the changes
                  if (elementsToAnimate.length > 0) {
                    console.log('DEBUG: Starting SMART_ANIMATE for variant transition');
                    
                    // Animate each element with changes
                    elementsToAnimate.forEach(({ element, sourceElement, changes }) => {
                      if (changes.hasChanges) {
                        console.log('DEBUG: Animating element:', element.getAttribute('data-figma-id'));
                        
                        // Apply initial state (matching source)
                        if (changes.backgroundColor && changes.backgroundColor.changed) {
                          element.style.backgroundColor = changes.backgroundColor.sourceValue;
                        }
                        
                        // Apply initial position state
                        if (changes.positionX && changes.positionX.changed) {
                          element.style.position = 'absolute';
                          element.style.left = changes.positionX.sourceValue + 'px';
                        }
                        if (changes.positionY && changes.positionY.changed) {
                          element.style.position = 'absolute';
                          element.style.top = changes.positionY.sourceValue + 'px';
                        }
                        
                        // Calculate correct end position for elements moving to the right (off-screen positions)
                        if (changes.positionX && changes.positionX.changed && changes.positionX.targetValue > 1000) {
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
                        
                        // Animate to target state
                        setTimeout(() => {
                          if (changes.backgroundColor && changes.backgroundColor.changed) {
                            element.style.transition = \`background-color \${parseFloat(transitionDuration || '0.3')}s ease-out\`;
                            element.style.backgroundColor = changes.backgroundColor.targetValue;
                          }
                          
                          if (changes.positionX && changes.positionX.changed) {
                            element.style.transition = \`left \${parseFloat(transitionDuration || '0.3')}s ease-out\`;
                            element.style.left = changes.positionX.targetValue + 'px';
                          }
                          
                          if (changes.positionY && changes.positionY.changed) {
                            element.style.transition = \`top \${parseFloat(transitionDuration || '0.3')}s ease-out\`;
                            element.style.top = changes.positionY.targetValue + 'px';
                          }
                        }, 50);
                      }
                    });
                    
                    // Restore destination dimensions after animation
                    setTimeout(() => {
                      destination.style.width = originalDestinationWidth;
                      destination.style.height = originalDestinationHeight;
                      destination.style.position = '';
                      destination.style.top = '';
                      destination.style.left = '';
                      
                      // Clean up animated elements - restore proper layout
                      elementsToAnimate.forEach(({ element }) => {
                        const calculatedEndPosition = element.getAttribute('data-calculated-end-position');
                        if (calculatedEndPosition) {
                          // For elements that were recalculated, we need to restore the proper layout
                          // Remove absolute positioning and let the parent's flexbox handle positioning
                          element.style.position = '';
                          element.style.left = '';
                          element.style.top = '';
                          console.log('DEBUG: Restored flexbox layout for element with calculated position:', element.getAttribute('data-figma-id'));
                        }
                        // Remove stored data
                        element.removeAttribute('data-calculated-end-position');
                      });
                      
                      // Hide all other variants
                      allVariants.forEach(variant => {
                        if (variant !== destination) {
                          variant.classList.add('variant-hidden');
                          variant.classList.remove('variant-active');
                          variant.style.opacity = '1'; // Reset opacity
                        }
                      });
                      
                      // Start timeout reactions for the newly active destination variant
                      startTimeoutReactionsForNewlyActiveVariant(destination);
                      // Start timeout reactions for nested components within the destination
                      startTimeoutReactionsForNestedComponents(destination);
                    }, parseFloat(transitionDuration || '0.3') * 1000 + 100);
                  } else {
                    console.log('DEBUG: No animation elements found, performing instant switch');
                    
                    // Hide all variants in the component set
                    allVariants.forEach(variant => {
                      variant.classList.add('variant-hidden');
                      variant.classList.remove('variant-active');
                      variant.style.opacity = '1'; // Reset opacity
                    });
                    
                    // Show the destination variant
                    destination.classList.add('variant-active');
                    destination.classList.remove('variant-hidden');
                    
                    // Start timeout reactions for the newly active destination variant
                    startTimeoutReactionsForNewlyActiveVariant(destination);
                    // Start timeout reactions for nested components within the destination
                    startTimeoutReactionsForNestedComponents(destination);
                  }
                } else {
                  console.log('DEBUG: No active variant found, performing instant switch');
                  
                  // Hide all variants in the component set
                  allVariants.forEach(variant => {
                    variant.classList.add('variant-hidden');
                    variant.classList.remove('variant-active');
                  });
                  
                  // Show the destination variant
                  destination.classList.add('variant-active');
                  destination.classList.remove('variant-hidden');
                  
                  // Start timeout reactions for the newly active destination variant
                  startTimeoutReactionsForNewlyActiveVariant(destination);
                  // Start timeout reactions for nested components within the destination
                  startTimeoutReactionsForNestedComponents(destination);
                }
              } else {
                // For non-SMART_ANIMATE transitions, perform instant switch
                console.log('DEBUG: Performing instant variant switch');
                
                // Hide all variants in the component set
                allVariants.forEach(variant => {
                  variant.classList.add('variant-hidden');
                  variant.classList.remove('variant-active');
                });
                
                // Show the destination variant
                destination.classList.add('variant-active');
                destination.classList.remove('variant-hidden');
                
                // Start timeout reactions for the newly active destination variant
                startTimeoutReactionsForNewlyActiveVariant(destination);
                // Start timeout reactions for nested components within the destination
                startTimeoutReactionsForNestedComponents(destination);
              }
              
              return; // Exit early for variant switching
            }
            
            // CRITICAL FIX: Handle the case where source is a COMPONENT and destination is a COMPONENT
            // This happens when a component has a reaction that targets another component in the same component set
            if (sourceElement.getAttribute('data-figma-type') === 'COMPONENT' && 
                destination.getAttribute('data-figma-type') === 'COMPONENT' && 
                sourceComponentSet && destinationComponentSet && sourceComponentSet === destinationComponentSet) {
              
              console.log('DEBUG: This is a component-to-component transition within the same component set');
              
              // Find the component set that contains both source and destination
              const componentSet = sourceComponentSet;
              const allVariants = Array.from(componentSet.children).filter(child => 
                child.getAttribute('data-figma-type') === 'COMPONENT'
              );
              
              console.log('DEBUG: Found', allVariants.length, 'variants in component set for switching');
              console.log('DEBUG: Variant IDs:', allVariants.map(v => v.getAttribute('data-figma-id')));
              
              // Handle animation for variant switching
              if (transitionType === 'SMART_ANIMATE') {
                console.log('DEBUG: SMART_ANIMATE component-to-component transition started');
                
                // Store original destination dimensions for restoration after animation
                const originalDestinationWidth = destination.style.width;
                const originalDestinationHeight = destination.style.height;
                
                // Ensure destination is visible and positioned before analysis
                destination.classList.add('variant-active');
                destination.classList.remove('variant-hidden');
                destination.style.visibility = 'visible';
                destination.style.display = 'flex';
                destination.style.position = 'relative';
                destination.style.top = '0';
                destination.style.left = '0';
                destination.style.opacity = '1';
                
                // Force a reflow to ensure the destination is properly rendered before analysis
                destination.offsetHeight;
                
                // Immediately ensure tap targets are visible in the destination variant
                ensureTapTargetsVisible(destination);
                
                // Force a reflow to ensure the destination is properly rendered
                destination.offsetHeight;
                
                // Double-check tap targets are visible after reflow
                ensureTapTargetsVisible(destination);
                
                // Hide source element during animation to prevent visual conflicts
                sourceElement.style.opacity = '0';
                
                // Find elements with property changes
                const elementsToAnimate = findElementsWithPropertyChanges(destination, sourceElement);
                console.log('DEBUG: Found', elementsToAnimate.length, 'elements to animate in component transition');
                
                // If no elements found, try a different approach - look for background color changes
                if (elementsToAnimate.length === 0) {
                  console.log('DEBUG: No elements found for animation, checking for background color changes');
                  const sourceFrames = sourceElement.querySelectorAll('[data-figma-type="FRAME"]');
                  const targetFrames = destination.querySelectorAll('[data-figma-type="FRAME"]');
                  
                  sourceFrames.forEach((sourceFrame, index) => {
                    if (targetFrames[index]) {
                      const sourceStyle = window.getComputedStyle(sourceFrame);
                      const targetStyle = window.getComputedStyle(targetFrames[index]);
                      
                      if (sourceStyle.backgroundColor !== targetStyle.backgroundColor) {
                        console.log('DEBUG: Found background color change:', sourceStyle.backgroundColor, '->', targetStyle.backgroundColor);
                        elementsToAnimate.push({
                          element: targetFrames[index],
                          sourceElement: sourceFrame,
                          changes: {
                            hasChanges: true,
                            positionX: { changed: false, sourceValue: null, targetValue: null },
                            positionY: { changed: false, sourceValue: null, targetValue: null },
                            backgroundColor: {
                              changed: true,
                              sourceValue: sourceStyle.backgroundColor,
                              targetValue: targetStyle.backgroundColor
                            },
                            color: { changed: false, sourceValue: null, targetValue: null },
                            justifyContent: { changed: false, sourceValue: null, targetValue: null },
                            alignItems: { changed: false, sourceValue: null, targetValue: null },
                            width: { changed: false, sourceValue: null, targetValue: null },
                            height: { changed: false, sourceValue: null, targetValue: null },
                            opacity: { changed: false, sourceValue: null, targetValue: null },
                            transform: { changed: false, sourceValue: null, targetValue: null }
                          }
                        });
                      }
                    }
                  });
                }
                
                // Animate the changes
                if (elementsToAnimate.length > 0) {
                  console.log('DEBUG: Starting SMART_ANIMATE for component transition');
                  
                  // Animate each element with changes
                  elementsToAnimate.forEach(({ element, sourceElement, changes }) => {
                    if (changes.hasChanges) {
                      console.log('DEBUG: Animating element:', element.getAttribute('data-figma-id'));
                      
                      // Apply initial state (matching source)
                      if (changes.backgroundColor && changes.backgroundColor.changed) {
                        element.style.backgroundColor = changes.backgroundColor.sourceValue;
                      }
                      
                      // Apply initial position state
                      if (changes.positionX && changes.positionX.changed) {
                        element.style.position = 'absolute';
                        element.style.left = changes.positionX.sourceValue + 'px';
                      }
                      if (changes.positionY && changes.positionY.changed) {
                        element.style.position = 'absolute';
                        element.style.top = changes.positionY.sourceValue + 'px';
                      }
                      
                      // Calculate correct end position for elements moving to the right (off-screen positions)
                      if (changes.positionX && changes.positionX.changed && changes.positionX.targetValue > 1000) {
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
                      
                      // Animate to target state
                      setTimeout(() => {
                        if (changes.backgroundColor && changes.backgroundColor.changed) {
                          element.style.transition = \`background-color \${parseFloat(transitionDuration || '0.3')}s ease-out\`;
                          element.style.backgroundColor = changes.backgroundColor.targetValue;
                        }
                        
                        if (changes.positionX && changes.positionX.changed) {
                          element.style.transition = \`left \${parseFloat(transitionDuration || '0.3')}s ease-out\`;
                          element.style.left = changes.positionX.targetValue + 'px';
                        }
                        
                        if (changes.positionY && changes.positionY.changed) {
                          element.style.transition = \`top \${parseFloat(transitionDuration || '0.3')}s ease-out\`;
                          element.style.top = changes.positionY.targetValue + 'px';
                        }
                      }, 50);
                    }
                  });
                  
                  // Restore destination dimensions after animation
                  setTimeout(() => {
                    destination.style.width = originalDestinationWidth;
                    destination.style.height = originalDestinationHeight;
                    destination.style.position = '';
                    destination.style.top = '';
                    destination.style.left = '';
                    
                    // Clean up animated elements - restore proper layout
                    elementsToAnimate.forEach(({ element }) => {
                      const calculatedEndPosition = element.getAttribute('data-calculated-end-position');
                      if (calculatedEndPosition) {
                        // For elements that were recalculated, we need to restore the proper layout
                        // Remove absolute positioning and let the parent's flexbox handle positioning
                        element.style.position = '';
                        element.style.left = '';
                        element.style.top = '';
                        console.log('DEBUG: Restored flexbox layout for element with calculated position:', element.getAttribute('data-figma-id'));
                      }
                      // Remove stored data
                      element.removeAttribute('data-calculated-end-position');
                    });
                    
                    // Hide all other variants
                    allVariants.forEach(variant => {
                      if (variant !== destination) {
                        variant.classList.add('variant-hidden');
                        variant.classList.remove('variant-active');
                        variant.style.opacity = '1'; // Reset opacity
                      }
                    });
                    
                    // Start timeout reactions for the newly active destination variant
                    startTimeoutReactionsForNewlyActiveVariant(destination);
                    // Start timeout reactions for nested components within the destination
                    startTimeoutReactionsForNestedComponents(destination);
                  }, parseFloat(transitionDuration || '0.3') * 1000 + 100);
                } else {
                  console.log('DEBUG: No animation elements found, performing instant switch');
                  
                  // Hide all variants in the component set (including the source)
                  allVariants.forEach(variant => {
                    variant.classList.add('variant-hidden');
                    variant.classList.remove('variant-active');
                    variant.style.opacity = '1'; // Reset opacity
                  });
                  
                  // Show the destination variant
                  destination.classList.add('variant-active');
                  destination.classList.remove('variant-hidden');
                  
                  // Start timeout reactions for the newly active destination variant
                  startTimeoutReactionsForNewlyActiveVariant(destination);
                  // Start timeout reactions for nested components within the destination
                  startTimeoutReactionsForNestedComponents(destination);
                }
              } else {
                // For non-SMART_ANIMATE transitions, perform instant switch
                console.log('DEBUG: Performing instant component-to-component switch');
                
                // Hide all variants in the component set (including the source)
                allVariants.forEach(variant => {
                  variant.classList.add('variant-hidden');
                  variant.classList.remove('variant-active');
                });
                
                // Show the destination variant
                destination.classList.add('variant-active');
                destination.classList.remove('variant-hidden');
                
                // Start timeout reactions for the newly active destination variant
                startTimeoutReactionsForNewlyActiveVariant(destination);
                // Start timeout reactions for nested components within the destination
                startTimeoutReactionsForNestedComponents(destination);
              }
              
              return; // Exit early for variant switching
            }
            
            if (sourceComponentSet && destinationComponentSet && sourceComponentSet === destinationComponentSet) {
              console.log('DEBUG: This is a variant switch within component set:', sourceComponentSet.getAttribute('data-figma-id'));
              
              // This is a variant switch - handle it properly by switching variants within the component set
              const componentSet = sourceComponentSet;
              const allVariants = Array.from(componentSet.children).filter(child => 
                child.getAttribute('data-figma-type') === 'COMPONENT' &&
                (child.getAttribute('data-variant') || child.getAttribute('data-variant-property-1'))
              );
              
              console.log('DEBUG: Found', allVariants.length, 'variants in component set for switching');
              console.log('DEBUG: Variant IDs:', allVariants.map(v => v.getAttribute('data-figma-id')));
              
              // Hide all variants in the component set
              allVariants.forEach(variant => {
                variant.classList.add('variant-hidden');
                variant.classList.remove('variant-active');
                console.log('DEBUG: Hidden variant:', variant.getAttribute('data-figma-id'));
              });
              
              // Show the destination variant
              destination.classList.add('variant-active');
              destination.classList.remove('variant-hidden');
              console.log('DEBUG: Activated destination variant:', destination.getAttribute('data-figma-id'));
              
              // Start timeout reactions for the newly active destination variant
              startTimeoutReactionsForNewlyActiveVariant(destination);
              // Start timeout reactions for nested components within the destination
              startTimeoutReactionsForNestedComponents(destination);
              
              return; // Exit early for variant switching
            }
            
            // Original logic for non-variant transitions
            console.log('DEBUG: This is a non-variant transition - falling back to original logic');
            
            // Immediately hide the source element to prevent multiple variants being visible
            sourceElement.classList.add('variant-hidden');
            sourceElement.classList.remove('variant-active');
            
            // Handle different transition types
            if (transitionType === 'DISSOLVE') {
              // Dissolve transition
              sourceElement.style.opacity = '0';
              setTimeout(() => {
                sourceElement.style.opacity = '1'; // Reset source element opacity for next cycle
                destination.classList.add('variant-active');
                destination.classList.remove('variant-hidden');
                destination.style.opacity = '1';
                
                // Ensure tap targets are visible in the destination variant
                ensureTapTargetsVisible(destination);
                
                // Start timeout reactions for the newly active destination variant
                startTimeoutReactionsForNewlyActiveVariant(destination);
                // Start timeout reactions for nested components within the destination
                startTimeoutReactionsForNestedComponents(destination);
              }, parseFloat(transitionDuration || '300'));
            } else if (transitionType === 'SMART_ANIMATE') {
              // Smart animate transition - sophisticated implementation
              console.log('DEBUG: SMART_ANIMATE transition started');
              
              // Store original destination dimensions for restoration after animation
              // This ensures we respect the designer's Figma dimensions after animation completes
              const originalDestinationWidth = destination.style.width;
              const originalDestinationHeight = destination.style.height;
              
              // Ensure destination is visible and positioned before analysis
              destination.classList.add('variant-active');
              destination.classList.remove('variant-hidden');
              destination.style.visibility = 'visible';
              destination.style.display = 'flex';
              destination.style.position = 'relative';
              destination.style.top = '0';
              destination.style.left = '0';
              destination.style.opacity = '1';
              
              // Force a reflow to ensure the destination is properly rendered before analysis
              destination.offsetHeight;
              
              // Immediately ensure tap targets are visible in the destination variant
              // This prevents the brief invisible moment during the first transition
              ensureTapTargetsVisible(destination);
              
              // Force a reflow to ensure the destination is properly rendered
              destination.offsetHeight;
              
              // Double-check tap targets are visible after reflow
              ensureTapTargetsVisible(destination);
              
              // Hide source element during animation to prevent visual conflicts
              sourceElement.style.opacity = '0';
              
              // Find elements with property changes
              const elementsToAnimate = findElementsWithPropertyChanges(destination, sourceElement);
              console.log('DEBUG: Found', elementsToAnimate.length, 'elements to animate');
              
              // If no elements found, try a different approach - look for background color changes
              if (elementsToAnimate.length === 0) {
                console.log('DEBUG: No elements found for animation, checking for background color changes');
                const sourceFrames = sourceElement.querySelectorAll('[data-figma-type="FRAME"]');
                const targetFrames = destination.querySelectorAll('[data-figma-type="FRAME"]');
                
                sourceFrames.forEach((sourceFrame, index) => {
                  if (targetFrames[index]) {
                    const sourceStyle = window.getComputedStyle(sourceFrame);
                    const targetStyle = window.getComputedStyle(targetFrames[index]);
                    
                    if (sourceStyle.backgroundColor !== targetStyle.backgroundColor) {
                      console.log('DEBUG: Found background color change:', sourceStyle.backgroundColor, '->', targetStyle.backgroundColor);
                      elementsToAnimate.push({
                        element: targetFrames[index],
                        sourceElement: sourceFrame,
                        changes: {
                          hasChanges: true,
                          positionX: { changed: false, sourceValue: null, targetValue: null },
                          positionY: { changed: false, sourceValue: null, targetValue: null },
                          backgroundColor: {
                            changed: true,
                            sourceValue: sourceStyle.backgroundColor,
                            targetValue: targetStyle.backgroundColor
                          },
                          color: { changed: false, sourceValue: null, targetValue: null },
                          justifyContent: { changed: false, sourceValue: null, targetValue: null },
                          alignItems: { changed: false, sourceValue: null, targetValue: null }
                        }
                      });
                    }
                  }
                });
              }
              
              // If still no elements found, create a simple fade transition
              if (elementsToAnimate.length === 0) {
                console.log('DEBUG: No specific elements found, creating fade transition');
                // Hide source immediately
                sourceElement.style.opacity = '0';
                
                // Show destination with fade in
                destination.style.opacity = '0';
                destination.style.transition = \`opacity \${transitionDuration || 0.3}s ease-out\`;
                
                // Immediately ensure tap targets are visible in the destination variant
                ensureTapTargetsVisible(destination);
                
                setTimeout(() => {
                  destination.style.opacity = '1';
                }, 10);
                
                // Cleanup after animation
                setTimeout(() => {
                  destination.style.transition = '';
                  sourceElement.style.opacity = '1';
                  destination.style.opacity = '1';
                  
                  // Ensure tap targets are visible in the destination variant
                  ensureTapTargetsVisible(destination);
                  
                  startTimeoutReactionsForNewlyActiveVariant(destination);
                  // Start timeout reactions for nested components within the destination
                  startTimeoutReactionsForNestedComponents(destination);
                }, parseFloat(transitionDuration || '300') * 1000 + 100);
                
                return; // Exit early for fade transition
              }
              
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
                  color: element.style.color,
                  justifyContent: element.style.justifyContent,
                  alignItems: element.style.alignItems
                }));
                
                // Store calculated end position if we recalculated it
                if (changes.positionX && changes.positionX.changed && changes.positionX.targetValue > 1000) {
                  // We'll store the calculated value after we recalculate it
                  element.setAttribute('data-needs-recalculation', 'true');
                }
                
                // Set target elements to starting element values (source element's visual state)
                if ((changes.positionX && changes.positionX.changed) || (changes.positionY && changes.positionY.changed)) {
                  element.style.position = 'absolute';
                  
                  // Use the computed style values directly
                  if (changes.positionX && changes.positionX.changed) {
                    element.style.left = changes.positionX.sourceValue + 'px';
                    console.log('DEBUG: Setting initial left position:', changes.positionX.sourceValue + 'px');
                  }
                  
                  if (changes.positionY && changes.positionY.changed) {
                    element.style.top = changes.positionY.sourceValue + 'px';
                    console.log('DEBUG: Setting initial top position:', changes.positionY.sourceValue + 'px');
                  }
                }
                
                // For visual changes, start with source element's visual properties
                if (changes.color && changes.color.changed) {
                  element.style.color = changes.color.sourceValue;
                  console.log('DEBUG: Setting initial color:', changes.color.sourceValue);
                }
                
                if (changes.backgroundColor && changes.backgroundColor.changed) {
                  element.style.backgroundColor = changes.backgroundColor.sourceValue;
                  console.log('DEBUG: Setting initial background color:', changes.backgroundColor.sourceValue);
                }
                
                // Also copy any other visual properties that might affect the appearance
                const sourceStyle = window.getComputedStyle(sourceElement);
                const targetStyle = window.getComputedStyle(element);
                
                // Copy font properties to ensure text rendering is consistent
                if (sourceStyle.fontSize !== targetStyle.fontSize) {
                  element.style.fontSize = sourceStyle.fontSize;
                }
                if (sourceStyle.fontWeight !== targetStyle.fontWeight) {
                  element.style.fontWeight = sourceStyle.fontWeight;
                }
                if (sourceStyle.fontFamily !== targetStyle.fontFamily) {
                  element.style.fontFamily = sourceStyle.fontFamily;
                }
                
                // Calculate correct end position for elements moving to the right (off-screen positions)
                if (changes.positionX && changes.positionX.changed && changes.positionX.targetValue > 1000) {
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
                
                if (changes.backgroundColor && changes.backgroundColor.changed) {
                  element.style.backgroundColor = changes.backgroundColor.sourceValue;
                }
                
                if (changes.color && changes.color.changed) {
                  element.style.color = changes.color.sourceValue;
                }
                
                if (changes.justifyContent && changes.justifyContent.changed) {
                  element.style.justifyContent = changes.justifyContent.sourceValue;
                }
                
                if (changes.alignItems && changes.alignItems.changed) {
                  element.style.alignItems = changes.alignItems.sourceValue;
                }
                
                // Add transition with proper easing
                const duration = transitionDuration || 0.3;
                element.style.transition = \`all \${duration}s cubic-bezier(0.4, 0.0, 0.2, 1)\`;
                console.log('DEBUG: Applied transition:', element.style.transition);
                              });
              
              // Force a reflow to ensure all initial styles are applied before animation
              destination.offsetHeight;
              
              // Execution phase: Animate to target values
              setTimeout(() => {
                elementsToAnimate.forEach(function(item) {
                  const element = item.element;
                  const changes = item.changes;
                  
                  console.log('DEBUG: Executing animation for element:', element.getAttribute('data-figma-id'));
                  
                  if ((changes.positionX && changes.positionX.changed) || (changes.positionY && changes.positionY.changed)) {
                    // Use the computed style values directly
                    if (changes.positionX && changes.positionX.changed) {
                      const startLeft = parseFloat(window.getComputedStyle(element).left) || 0;
                      const endLeft = changes.positionX.targetValue;
                      
                      console.log('DEBUG: Animation movement:');
                      console.log('  Starting left position:', startLeft);
                      console.log('  Target left position:', endLeft);
                      console.log('  Movement distance:', endLeft - startLeft);
                      
                      element.style.left = endLeft + 'px';
                      console.log('DEBUG: Animating to left position:', endLeft + 'px');
                    }
                    
                    if (changes.positionY && changes.positionY.changed) {
                      element.style.top = changes.positionY.targetValue + 'px';
                      console.log('DEBUG: Animating to top position:', changes.positionY.targetValue + 'px');
                    }
                  }
                  
                  if (changes.backgroundColor && changes.backgroundColor.changed) {
                    element.style.backgroundColor = changes.backgroundColor.targetValue;
                    console.log('DEBUG: Animating background color to:', changes.backgroundColor.targetValue);
                  }
                  
                  if (changes.color && changes.color.changed) {
                    element.style.color = changes.color.targetValue;
                    console.log('DEBUG: Animating color to:', changes.color.targetValue);
                  }
                  
                  if (changes.justifyContent && changes.justifyContent.changed) {
                    element.style.justifyContent = changes.justifyContent.targetValue;
                  }
                  
                  if (changes.alignItems && changes.alignItems.changed) {
                    element.style.alignItems = changes.alignItems.targetValue;
                  }
                });
                              }, 10); // Reduced delay for smoother animation
              
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
                  if (originalStyles.color) element.style.color = originalStyles.color;
                  if (originalStyles.justifyContent) element.style.justifyContent = originalStyles.justifyContent;
                  if (originalStyles.alignItems) element.style.alignItems = originalStyles.alignItems;
                  
                  // Remove stored data
                  element.removeAttribute('data-original-styles');
                  element.removeAttribute('data-calculated-end-position');
                  element.removeAttribute('data-needs-recalculation');
                });
                
                // Reset source element opacity for next cycle
                sourceElement.style.opacity = '1';
                
                // Restore original destination dimensions
                // This respects the designer's Figma dimensions after animation completes
                if (originalDestinationWidth) destination.style.width = originalDestinationWidth;
                if (originalDestinationHeight) destination.style.height = originalDestinationHeight;
                
                // Ensure destination is fully visible
                destination.style.opacity = '1';
                
                // Ensure tap targets are visible in the destination variant
                ensureTapTargetsVisible(destination);
                
                console.log('DEBUG: SMART_ANIMATE transition completed');
                
                // Start timeout reactions for the newly active destination variant
                startTimeoutReactionsForNewlyActiveVariant(destination);
                // Start timeout reactions for nested components within the destination
                startTimeoutReactionsForNestedComponents(destination);
              }, parseFloat(transitionDuration || '300') * 1000 + 100);
              
            } else {
              // Default transition - simple show/hide using CSS classes
              sourceElement.style.opacity = '1'; // Reset source element opacity for next cycle
              destination.classList.add('variant-active');
              destination.classList.remove('variant-hidden');
              destination.style.opacity = '1'; // Ensure destination has opacity 1
              
                              // Ensure tap targets are visible in the destination variant
                ensureTapTargetsVisible(destination);
                
                // Start timeout reactions for the newly active destination variant
                startTimeoutReactionsForNewlyActiveVariant(destination);
                // Start timeout reactions for nested components within the destination
                startTimeoutReactionsForNestedComponents(destination);
            }
          }
        }
      }
  `;
}

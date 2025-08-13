// Animation transition handling logic - copy-based approach
export function createSmartAnimateHandler(): string {
  return `
      // Global transition lock to prevent multiple simultaneous transitions
      let isTransitionInProgress = false;
      
      // Helper function to map Figma animation types to CSS easing functions
      function getEasingFunction(animationType) {
        switch (animationType) {
          case 'EASE_IN_AND_OUT_BACK':
            return 'ease-in-out';
          case 'EASE_IN_AND_OUT':
            return 'ease-in-out';
          case 'EASE_IN':
            return 'ease-in';
          case 'EASE_OUT':
            return 'ease-out';
          case 'LINEAR':
            return 'linear';
          case 'BOUNCY':
            return 'cubic-bezier(0.68, -0.55, 0.265, 1.55)';
          case 'GENTLE':
            return 'ease-in-out'; // Gentle is typically a smooth ease-in-out
          case 'SMART_ANIMATE':
            // SMART_ANIMATE should use the actual easing type from the reaction data
            // For now, default to ease-in-out which is commonly used for smart animate
            return 'ease-in-out';
          default:
            return 'ease-out';
        }
      }
      
      // Helper function to create a deep copy of an element
      function createElementCopy(sourceElement) {
        const copy = sourceElement.cloneNode(true);
        copy.setAttribute('data-figma-id', sourceElement.getAttribute('data-figma-id') + '-copy');
        copy.setAttribute('data-is-animation-copy', 'true');
        
        // Preserve current animated positions from source element
        const copyElements = copy.querySelectorAll('*');
        copyElements.forEach(element => {
          if (element.hasAttribute('data-figma-id')) {
            const sourceElementId = element.getAttribute('data-figma-id');
            const sourceElementMatch = sourceElement.querySelector(\`[data-figma-id="\${sourceElementId}"]\`);
            
            if (sourceElementMatch) {
              // Preserve current animated positions from source
              const currentLeft = sourceElementMatch.style.left || window.getComputedStyle(sourceElementMatch).left || '0px';
              const currentTop = sourceElementMatch.style.top || window.getComputedStyle(sourceElementMatch).top || '0px';
              
              element.style.position = 'relative';
              element.style.left = currentLeft;
              element.style.top = currentTop;
              
              // Force remove any existing inline styles that might interfere
              element.style.removeProperty('transform');
              element.style.removeProperty('margin');
              element.style.removeProperty('padding');
              
              // Force the style to be applied by setting it again
              element.style.setProperty('left', currentLeft, 'important');
              element.style.setProperty('top', currentTop, 'important');
              
              console.log('DEBUG: Preserved copy element position:', element.getAttribute('data-figma-id'), {
                position: element.style.position,
                left: element.style.left,
                top: element.style.top,
                sourceLeft: currentLeft,
                sourceTop: currentTop,
                computedLeft: window.getComputedStyle(element).left,
                computedTop: window.getComputedStyle(element).top,
                elementRect: element.getBoundingClientRect()
              });
            } else {
              // Fallback to original positions if source element not found
              element.style.position = 'relative';
              element.style.left = '0px';
              element.style.top = '0px';
              
              console.log('DEBUG: Reset copy element (no source found):', element.getAttribute('data-figma-id'), {
                position: element.style.position,
                left: element.style.left,
                top: element.style.top
              });
            }
          }
        });
        
        // Debug: List all elements in the copy with their IDs
        console.log('DEBUG: All elements in copy:', Array.from(copy.querySelectorAll('[data-figma-id]')).map(el => ({
          id: el.getAttribute('data-figma-id'),
          left: el.style.left,
          top: el.style.top
        })));
        
        // Get the source element's computed position
        const sourceRect = sourceElement.getBoundingClientRect();
        const parentRect = sourceElement.parentElement.getBoundingClientRect();
        
        // Position the copy absolutely over the source element
        copy.style.position = 'absolute';
        copy.style.top = (sourceRect.top - parentRect.top) + 'px';
        copy.style.left = (sourceRect.left - parentRect.left) + 'px';
        

        
        // Override any inline styles that might interfere with positioning
        copy.style.transform = 'none'; // Remove any transforms
        copy.style.margin = '0'; // Remove margins
        copy.style.padding = '0'; // Remove padding
        
        // Ensure copy is always on top by finding the highest z-index in the document
        const allElements = document.querySelectorAll('*');
        let maxZIndex = 0;
        allElements.forEach(el => {
          const zIndex = parseInt(window.getComputedStyle(el).zIndex) || 0;
          if (zIndex > maxZIndex) maxZIndex = zIndex;
        });
        
        // Set copy z-index higher than any existing element
        const copyZIndex = maxZIndex + 1000;
        copy.style.zIndex = copyZIndex.toString();
        copy.style.pointerEvents = 'none'; // Prevent interaction with copy
        copy.style.transform = 'translateZ(0)'; // Create new stacking context and enable hardware acceleration
        copy.style.willChange = 'transform, left, top'; // Optimize for animations
        
        console.log('DEBUG: Copy z-index management:', {
          maxZIndexFound: maxZIndex,
          copyZIndex: copyZIndex,
          copyPosition: copy.style.position,
          copyTop: copy.style.top,
          copyLeft: copy.style.left
        });
        
        console.log('DEBUG: Copy positioned at:', {
          sourceTop: sourceRect.top - parentRect.top,
          sourceLeft: sourceRect.left - parentRect.left,
          sourceRect: sourceRect,
          parentRect: parentRect,
          copyPosition: copy.style.position,
          copyTop: copy.style.top,
          copyLeft: copy.style.left
        });
        
        return copy;
      }
      
      // Helper function to animate copy to destination values
      function animateCopyToDestination(copy, destination, transitionType, transitionDuration) {
        return new Promise((resolve) => {
          // Find elements with property changes
          const elementsToAnimate = findElementsWithPropertyChanges(destination, copy);
          
          if (elementsToAnimate.length > 0) {
            console.log('DEBUG: Animating copy with', elementsToAnimate.length, 'elements');
            console.log('DEBUG: Elements to animate:', elementsToAnimate.map(({ element, changes }) => ({
              id: element.getAttribute('data-figma-id'),
              left: element.style.left,
              top: element.style.top,
              hasPositionX: changes.positionX?.changed || false,
              hasPositionY: changes.positionY?.changed || false
            })));
            
            // Setup animation for each element in the copy
            elementsToAnimate.forEach(({ element, sourceElement, changes }) => {
              const easingFunction = getEasingFunction(transitionType);
              const duration = parseFloat(transitionDuration || '0.3');
              
              console.log('DEBUG: Animation setup for element:', element.getAttribute('data-figma-id'), {
                transitionType: transitionType,
                easingFunction: easingFunction,
                duration: duration
              });
              
              // Build transition string
              const transitionProperties = [];
              if (changes.backgroundColor && changes.backgroundColor.changed) {
                transitionProperties.push(\`background-color \${duration}s \${easingFunction}\`);
              }
              if (changes.color && changes.color.changed) {
                transitionProperties.push(\`color \${duration}s \${easingFunction}\`);
              }
              if (changes.opacity && changes.opacity.changed) {
                transitionProperties.push(\`opacity \${duration}s \${easingFunction}\`);
              }
              if (changes.positionX && changes.positionX.changed) {
                transitionProperties.push(\`left \${duration}s \${easingFunction}\`);
              }
              if (changes.positionY && changes.positionY.changed) {
                transitionProperties.push(\`top \${duration}s \${easingFunction}\`);
              }
              if (changes.width && changes.width.changed) {
                transitionProperties.push(\`width \${duration}s \${easingFunction}\`);
              }
              if (changes.height && changes.height.changed) {
                transitionProperties.push(\`height \${duration}s \${easingFunction}\`);
              }
              
              // Apply transition
              if (transitionProperties.length > 0) {
                element.style.transition = transitionProperties.join(', ');
                console.log('DEBUG: Applied transition to element:', element.getAttribute('data-figma-id'), 'transition:', element.style.transition);
                
                // Verify transition was applied
                setTimeout(() => {
                  const computedTransition = window.getComputedStyle(element).transition;
                  console.log('DEBUG: Verified transition for element:', element.getAttribute('data-figma-id'), 'computed transition:', computedTransition);
                }, 0);
              }
            });
            
            // Force reflow to ensure transitions are applied
            copy.offsetHeight;
            
                    // Apply target values to animate the copy with proper timing
        requestAnimationFrame(() => {
          console.log('DEBUG: Applying target values to copy elements');
          
          // Log initial positions before animation
          elementsToAnimate.forEach(({ element, changes }) => {
            console.log('DEBUG: Initial position of element:', element.getAttribute('data-figma-id'), {
              top: element.style.top,
              left: element.style.left,
              transition: element.style.transition,
              computedTransition: window.getComputedStyle(element).transition
            });
          });
              
              elementsToAnimate.forEach(({ element, changes }) => {
                if (changes.backgroundColor && changes.backgroundColor.changed) {
                  element.style.backgroundColor = changes.backgroundColor.targetValue;
                }
                if (changes.color && changes.color.changed) {
                  element.style.color = changes.color.targetValue;
                }
                if (changes.opacity && changes.opacity.changed) {
                  element.style.opacity = changes.opacity.targetValue;
                }
                if (changes.positionX && changes.positionX.changed) {
                  // Set the target position directly (not relative to current position)
                  const targetLeft = parseFloat(changes.positionX.targetValue);
                  
                  console.log('DEBUG: Before position change - element:', element.getAttribute('data-figma-id'), {
                    currentLeft: element.style.left,
                    currentPosition: element.style.position,
                    targetLeft: targetLeft,
                    elementRect: element.getBoundingClientRect()
                  });
                  
                  element.style.left = targetLeft + 'px';
                  
                  console.log('DEBUG: After position change - element:', element.getAttribute('data-figma-id'), {
                    newLeft: element.style.left,
                    elementRect: element.getBoundingClientRect()
                  });
                  
                  console.log('DEBUG: Applied position change to copy:', element.getAttribute('data-figma-id'), 'from:', element.style.left || '0px', 'to:', targetLeft + 'px', 'target:', targetLeft, 'easing:', getEasingFunction(transitionType));
                }
                if (changes.positionY && changes.positionY.changed) {
                  // Set the target position directly (not relative to current position)
                  const targetTop = parseFloat(changes.positionY.targetValue);
                  
                  console.log('DEBUG: Position Y animation details:', {
                    elementId: element.getAttribute('data-figma-id'),
                    sourceValue: changes.positionY.sourceValue,
                    targetValue: changes.positionY.targetValue,
                    parsedTargetTop: targetTop,
                    currentTop: element.style.top,
                    easing: getEasingFunction(transitionType)
                  });
                  
                  element.style.top = targetTop + 'px';
                  console.log('DEBUG: Applied position change to copy:', element.getAttribute('data-figma-id'), 'from:', element.style.top || '0px', 'to:', targetTop + 'px', 'target:', targetTop, 'easing:', getEasingFunction(transitionType));
                }
                if (changes.width && changes.width.changed) {
                  element.style.width = changes.width.targetValue + 'px';
                }
                if (changes.height && changes.height.changed) {
                  element.style.height = changes.height.targetValue + 'px';
                }
              });
            }, 16);
            
            // Monitor animation progress
            const animationDuration = parseFloat(transitionDuration || '0.3') * 1000;
            const checkInterval = 100; // Check every 100ms
            let checkCount = 0;
            
                          const progressCheck = setInterval(() => {
                checkCount++;
                elementsToAnimate.forEach(({ element, changes }) => {
                  const elementRect = element.getBoundingClientRect();
                  console.log('DEBUG: Animation progress check', checkCount, 'for element:', element.getAttribute('data-figma-id'), {
                    top: element.style.top,
                    left: element.style.left,
                    computedTop: getComputedStyle(element).top,
                    computedLeft: getComputedStyle(element).left,
                    boundingRect: elementRect,
                    isVisible: elementRect.width > 0 && elementRect.height > 0,
                    viewportPosition: {
                      x: elementRect.x,
                      y: elementRect.y,
                      right: elementRect.right,
                      bottom: elementRect.bottom
                    }
                  });
                });
              
              if (checkCount * checkInterval >= animationDuration) {
                clearInterval(progressCheck);
                console.log('DEBUG: Animation completed, removing copy');
                resolve();
              }
            }, checkInterval);
          } else {
            // No elements to animate, resolve immediately
            resolve();
          }
        });
      }
      
      // Helper function to perform instant variant switch (no animation)
      function performInstantVariantSwitch(allVariants, destination) {
        console.log('DEBUG: Performing instant variant switch');
        
        // Hide all variants
        allVariants.forEach(variant => {
          variant.classList.add('variant-hidden');
          variant.classList.remove('variant-active');
          // Ensure all variants maintain their original positioning
          variant.style.position = 'relative';
          variant.style.top = '0px';
          variant.style.left = '0px';
        });
        
        // Show destination variant
        destination.classList.add('variant-active');
        destination.classList.remove('variant-hidden');
        // Ensure destination maintains its original positioning
        destination.style.position = 'relative';
        destination.style.top = '0px';
        destination.style.left = '0px';
        
        // Start timeout reactions
        startTimeoutReactionsForNewlyActiveVariant(destination);
        startTimeoutReactionsForNestedComponents(destination);
      }
      
      // Helper function to handle animated variant switching using copy approach
      async function handleAnimatedVariantSwitch(sourceElement, destination, allVariants, transitionType, transitionDuration) {
        console.log('DEBUG: Starting animated variant switch with copy approach');
        console.log('  Transition type:', transitionType, 'Duration:', transitionDuration);
        
        // Create a copy of the source variant
        const sourceCopy = createElementCopy(sourceElement);
        
        // Insert the copy into the DOM (positioned over the source)
        const sourceParent = sourceElement.parentElement;
        sourceParent.appendChild(sourceCopy);
        
        // Hide the original source element and all other variants for testing
        sourceElement.style.opacity = '0';
        sourceElement.style.visibility = 'hidden';
        
        // Hide all other variants too for clean testing
        allVariants.forEach(variant => {
          if (variant !== sourceElement) {
            variant.style.opacity = '0';
            variant.style.visibility = 'hidden';
          }
        });
        
        console.log('DEBUG: Copy created and positioned:', {
          copyId: sourceCopy.getAttribute('data-figma-id'),
          copyPosition: sourceCopy.style.position,
          copyTop: sourceCopy.style.top,
          copyLeft: sourceCopy.style.left,
          copyOpacity: sourceCopy.style.opacity,
          copyZIndex: sourceCopy.style.zIndex,
          copyDisplay: sourceCopy.style.display,
          copyVisibility: sourceCopy.style.visibility,
          copyTransform: sourceCopy.style.transform,
          copyWillChange: sourceCopy.style.willChange
        });
        
        // Log the copy's actual DOM position and visibility
        setTimeout(() => {
          const copyRect = sourceCopy.getBoundingClientRect();
          const copyComputedStyle = window.getComputedStyle(sourceCopy);
          console.log('DEBUG: Copy DOM position and visibility:', {
            copyId: sourceCopy.getAttribute('data-figma-id'),
            boundingRect: copyRect,
            computedPosition: copyComputedStyle.position,
            computedTop: copyComputedStyle.top,
            computedLeft: copyComputedStyle.left,
            computedOpacity: copyComputedStyle.opacity,
            computedZIndex: copyComputedStyle.zIndex,
            computedDisplay: copyComputedStyle.display,
            computedVisibility: copyComputedStyle.visibility,
            computedTransform: copyComputedStyle.transform,
            isVisible: copyRect.width > 0 && copyRect.height > 0 && copyComputedStyle.opacity !== '0',
            parentOverflow: window.getComputedStyle(sourceCopy.parentElement).overflow
          });
        }, 100);
        
        // Show the destination variant (but keep it hidden visually)
        destination.classList.add('variant-active');
        destination.classList.remove('variant-hidden');
        destination.style.visibility = 'hidden'; // Hidden but active for calculations
        
        // Force reflow to ensure destination is rendered for calculations
        destination.offsetHeight;
        
        // Animate the copy to match the destination
        await animateCopyToDestination(sourceCopy, destination, transitionType, transitionDuration);
        
        // Animation complete - restore normal behavior
        sourceCopy.remove(); // Remove the copy
        
        // Reset source element visibility
        sourceElement.style.opacity = '1';
        sourceElement.style.visibility = 'visible';
        
        console.log('DEBUG: Animation completed - normal behavior restored');
        
        // Properly activate the destination variant
        destination.style.visibility = 'visible';
        destination.style.opacity = '1';
        destination.classList.add('variant-active');
        destination.classList.remove('variant-hidden');
        
        // Ensure destination has proper positioning
        destination.style.position = 'relative';
        destination.style.top = '0px';
        destination.style.left = '0px';
        
        // Hide all other variants
        allVariants.forEach(variant => {
          if (variant !== destination) {
            variant.classList.add('variant-hidden');
            variant.classList.remove('variant-active');
            variant.style.position = 'relative';
            variant.style.top = '0px';
            variant.style.left = '0px';
            variant.style.opacity = '0';
            variant.style.visibility = 'hidden';
          }
        });
        
        console.log('DEBUG: Normal mode - copy removed, destination variant active and visible');
        
        // Start timeout reactions
        startTimeoutReactionsForNewlyActiveVariant(destination);
        startTimeoutReactionsForNestedComponents(destination);
      }
      
      // Helper function to handle reaction transitions
      function handleReaction(sourceElement, destinationId, transitionType, transitionDuration) {
        console.log('DEBUG: handleReaction called');
        console.log('  Source element ID:', sourceElement.getAttribute('data-figma-id'));
        console.log('  Destination ID:', destinationId);
        console.log('  Transition type:', transitionType, 'Duration:', transitionDuration);
        
        // Prevent multiple simultaneous transitions
        if (isTransitionInProgress) {
          console.log('DEBUG: Transition already in progress, skipping');
          return;
        }
        
        // Set transition lock
        isTransitionInProgress = true;
        
        // Safety timeout
        const safetyTimeout = setTimeout(() => {
          if (isTransitionInProgress) {
            console.log('WARNING: Transition lock stuck, forcing release');
            isTransitionInProgress = false;
          }
        }, 5000);
        
        if (destinationId) {
          const destination = document.querySelector(\`[data-figma-id="\${destinationId}"]\`);
          
          if (!destination) {
            console.log('ERROR: Destination element not found:', destinationId);
            clearTimeout(safetyTimeout);
            isTransitionInProgress = false;
            return;
          }
          
          // Check if this is a variant switch within a component set
          const sourceComponentSet = sourceElement.closest('[data-figma-type="COMPONENT_SET"]');
          const destinationComponentSet = destination.closest('[data-figma-type="COMPONENT_SET"]');
          
          if (sourceComponentSet && destinationComponentSet && sourceComponentSet === destinationComponentSet) {
            // This is a variant switch
            const componentSet = sourceComponentSet;
            const allVariants = Array.from(componentSet.children).filter(child => 
              child.getAttribute('data-figma-type') === 'COMPONENT'
            );
            
            console.log('DEBUG: Transition type check:', {
              transitionType: transitionType,
              transitionDuration: transitionDuration,
              isAnimated: transitionType === 'SMART_ANIMATE' || transitionType === 'BOUNCY' || 
                         transitionType === 'EASE_IN_AND_OUT' || transitionType === 'EASE_IN_AND_OUT_BACK' || 
                         transitionType === 'EASE_IN' || transitionType === 'EASE_OUT' || 
                         transitionType === 'LINEAR'
            });
            
            if (transitionType === 'SMART_ANIMATE' || transitionType === 'BOUNCY' || 
                transitionType === 'EASE_IN_AND_OUT' || transitionType === 'EASE_IN_AND_OUT_BACK' || 
                transitionType === 'EASE_IN' || transitionType === 'EASE_OUT' || 
                transitionType === 'LINEAR' || transitionType === 'GENTLE') {
              console.log('DEBUG: Using animated variant switching');
              // Handle animated variant switching with copy approach
              handleAnimatedVariantSwitch(sourceElement, destination, allVariants, transitionType, transitionDuration)
                .then(() => {
                  clearTimeout(safetyTimeout);
                  isTransitionInProgress = false;
                })
                .catch((error) => {
                  console.error('Animation error:', error);
                  clearTimeout(safetyTimeout);
                  isTransitionInProgress = false;
                });
            } else {
              console.log('DEBUG: Using instant variant switching - transition type not recognized:', transitionType);
              // Handle instant variant switching
              performInstantVariantSwitch(allVariants, destination);
              clearTimeout(safetyTimeout);
              isTransitionInProgress = false;
            }
          } else {
            // This is a regular transition (not variant switching)
            // Handle different transition types
            if (transitionType === 'DISSOLVE') {
              // Dissolve transition
              sourceElement.style.opacity = '0';
              setTimeout(() => {
                sourceElement.style.opacity = '1';
                destination.classList.add('variant-active');
                destination.classList.remove('variant-hidden');
                destination.style.opacity = '1';
                
                startTimeoutReactionsForNewlyActiveVariant(destination);
                startTimeoutReactionsForNestedComponents(destination);
                
                clearTimeout(safetyTimeout);
                isTransitionInProgress = false;
              }, parseFloat(transitionDuration || '300'));
            } else {
              // Default transition - simple show/hide
              sourceElement.style.opacity = '1';
              destination.classList.add('variant-active');
              destination.classList.remove('variant-hidden');
              destination.style.opacity = '1';
              
              startTimeoutReactionsForNewlyActiveVariant(destination);
              startTimeoutReactionsForNestedComponents(destination);
              
              clearTimeout(safetyTimeout);
              isTransitionInProgress = false;
            }
          }
        } else {
          // No destination ID provided
          clearTimeout(safetyTimeout);
          isTransitionInProgress = false;
        }
      }
      
      // Make function globally available
      window.handleReaction = handleReaction;
    `;
}
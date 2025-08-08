// Transition handling logic
export function createSmartAnimateHandler(): string {
  return `
      // Global transition lock to prevent multiple simultaneous transitions
      let isTransitionInProgress = false;
      
      // Helper function to map Figma animation types to CSS easing functions
      function getEasingFunction(animationType) {
        switch (animationType) {
          case 'EASE_IN_AND_OUT_BACK':
            return 'cubic-bezier(0.68, -0.55, 0.265, 1.55)';
          case 'EASE_IN_AND_OUT':
            return 'ease-in-out';
          case 'EASE_IN':
            return 'ease-in';
          case 'EASE_OUT':
            return 'ease-out';
          case 'LINEAR':
            return 'linear';
          case 'BOUNCY':
            return 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'; // Bouncy animation
          default:
            return 'ease-out'; // Default fallback
        }
      }
      
      // Helper function to create bouncy animation keyframes
      function createBouncyKeyframes(elementId, startPosition, endPosition, duration) {
        const style = document.createElement('style');
        const keyframeName = \`bouncy-\${elementId.replace(/[^a-zA-Z0-9]/g, '')}\`;
        
        style.textContent = \`
          @keyframes \${keyframeName} {
            0% { transform: translateX(\${startPosition}px); }
            60% { transform: translateX(\${endPosition + (endPosition - startPosition) * 0.1}px); }
            80% { transform: translateX(\${endPosition - (endPosition - startPosition) * 0.05}px); }
            100% { transform: translateX(\${endPosition}px); }
          }
        \`;
        
        document.head.appendChild(style);
        return keyframeName;
      }
      
      // Helper function to apply bouncy animation to an element
      function applyBouncyAnimation(element, startPosition, endPosition, duration) {
        const elementId = element.getAttribute('data-figma-id');
        const keyframeName = createBouncyKeyframes(elementId, startPosition, endPosition, duration);
        
        element.style.animation = \`\${keyframeName} \${duration}s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards\`;
        
        // Clean up the keyframes after animation
        setTimeout(() => {
          element.style.animation = '';
          const styleElement = document.querySelector(\`style[data-keyframe="\${keyframeName}"]\`);
          if (styleElement) {
            styleElement.remove();
          }
        }, duration * 1000 + 100);
      }
      
      // Helper function to detect property changes between elements
      function detectPropertyChanges(targetElement, sourceElement) {
        const changes = {
          hasChanges: false,
          positionX: { changed: false, sourceValue: null, targetValue: null },
          positionY: { changed: false, sourceValue: null, targetValue: null },
          backgroundColor: { changed: false, sourceValue: null, targetValue: null },
          color: { changed: false, sourceValue: null, targetValue: null },
          justifyContent: { changed: false, sourceValue: null, targetValue: null },
          alignItems: { changed: false, sourceValue: null, targetValue: null },
          width: { changed: false, sourceValue: null, targetValue: null },
          height: { changed: false, sourceValue: null, targetValue: null }
        };

        try {
          // Check position changes by comparing the computed styles
          const sourceStyle = window.getComputedStyle(sourceElement);
          const targetStyle = window.getComputedStyle(targetElement);
          
          // Check left position changes
          const sourceLeft = parseFloat(sourceStyle.left) || 0;
          const targetLeft = parseFloat(targetStyle.left) || 0;
          
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
          const sourceBg = sourceStyle.backgroundColor || 'rgba(0, 0, 0, 0)';
          const targetBg = targetStyle.backgroundColor || 'rgba(0, 0, 0, 0)';
          
          if (sourceBg !== targetBg) {
            changes.backgroundColor.changed = true;
            changes.backgroundColor.sourceValue = sourceBg;
            changes.backgroundColor.targetValue = targetBg;
            changes.hasChanges = true;
            console.log('DEBUG: Background color change detected:', sourceBg, '->', targetBg);
          }
          
          if (sourceStyle.color !== targetStyle.color) {
            changes.color.changed = true;
            changes.color.sourceValue = sourceStyle.color;
            changes.color.targetValue = targetStyle.color;
            changes.hasChanges = true;
            console.log('DEBUG: Color change detected:', sourceStyle.color, '->', targetStyle.color);
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
          
          // Check width changes
          const sourceWidth = parseFloat(sourceStyle.width) || sourceElement.offsetWidth;
          const targetWidth = parseFloat(targetStyle.width) || targetElement.offsetWidth;
          
          if (Math.abs(sourceWidth - targetWidth) > 1) {
            changes.width.changed = true;
            changes.width.sourceValue = sourceWidth;
            changes.width.targetValue = targetWidth;
            changes.hasChanges = true;
            console.log('DEBUG: Width change detected:', sourceWidth, '->', targetWidth);
          }
          
          // Check height changes
          const sourceHeight = parseFloat(sourceStyle.height) || sourceElement.offsetHeight;
          const targetHeight = parseFloat(targetStyle.height) || targetElement.offsetHeight;
          
          if (Math.abs(sourceHeight - targetHeight) > 1) {
            changes.height.changed = true;
            changes.height.sourceValue = sourceHeight;
            changes.height.targetValue = targetHeight;
            changes.hasChanges = true;
            console.log('DEBUG: Height change detected:', sourceHeight, '->', targetHeight);
          }
        } catch (error) {
          console.log('DEBUG: Error detecting property changes:', error);
        }

        return changes;
      }
      
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

      // Helper function to setup destination for animation
      function setupDestinationForAnimation(destination) {
        destination.classList.add('variant-active');
        destination.classList.remove('variant-hidden');
        destination.style.visibility = 'visible';
        destination.style.display = 'flex';
        destination.style.position = 'absolute';
        destination.style.top = '0';
        destination.style.left = '0';
        destination.style.opacity = '1';
        
        // Force reflows and ensure tap targets are visible
        destination.offsetHeight;
        ensureTapTargetsVisible(destination);
        destination.offsetHeight;
        ensureTapTargetsVisible(destination);
      }

      // Helper function to perform instant variant switch
      function performInstantVariantSwitch(allVariants, destination) {
        // Hide all variants in the component set
        allVariants.forEach(variant => {
          variant.classList.add('variant-hidden');
          variant.classList.remove('variant-active');
          variant.style.opacity = '1'; // Reset opacity
        });
        
        // Show the destination variant
        destination.classList.add('variant-active');
        destination.classList.remove('variant-hidden');
        
        // Start timeout reactions
        startTimeoutReactionsForNewlyActiveVariant(destination);
        startTimeoutReactionsForNestedComponents(destination);
      }

      // Helper function to cleanup after animation
      function cleanupAfterAnimation(destination, originalDestinationWidth, originalDestinationHeight, elementsToAnimate, allVariants) {
        // Restore destination dimensions
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
        
        // Start timeout reactions
        startTimeoutReactionsForNewlyActiveVariant(destination);
        startTimeoutReactionsForNestedComponents(destination);
        
        // Release transition lock
        isTransitionInProgress = false;
        console.log('DEBUG: Transition lock released');
      }

      // Helper function to handle variant switching
      function handleVariantSwitching(sourceElement, destination, allVariants, transitionType, transitionDuration) {
        if (transitionType === 'SMART_ANIMATE' || transitionType === 'BOUNCY') {
          console.log('DEBUG: SMART_ANIMATE/BOUNCY variant transition started');
          
          // Store original destination dimensions for restoration after animation
          const originalDestinationWidth = destination.style.width;
          const originalDestinationHeight = destination.style.height;
          
          // Setup destination for animation
          setupDestinationForAnimation(destination);
          
          // Hide source element during animation to prevent visual conflicts
          sourceElement.style.opacity = '0';
          
          // Find elements with property changes
          const elementsToAnimate = findElementsWithPropertyChanges(destination, sourceElement);
          console.log('DEBUG: Found', elementsToAnimate.length, 'elements to animate in variant transition');
          
          // If no elements found, try background color changes
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
              console.log('DEBUG: Starting SMART_ANIMATE/BOUNCY for variant transition');
            
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
                
                // Apply initial size state
                if (changes.width && changes.width.changed) {
                  element.style.width = changes.width.sourceValue + 'px';
                  console.log('DEBUG: Setting initial width:', changes.width.sourceValue + 'px');
                }
                if (changes.height && changes.height.changed) {
                  element.style.height = changes.height.sourceValue + 'px';
                  console.log('DEBUG: Setting initial height:', changes.height.sourceValue + 'px');
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
                  // Get the easing function based on the transition type
                  const easingFunction = getEasingFunction(transitionType);
                  console.log('DEBUG: Using easing function:', easingFunction, 'for transition type:', transitionType);
                  
                  if (changes.backgroundColor && changes.backgroundColor.changed) {
                    element.style.transition = \`background-color \${parseFloat(transitionDuration || '0.3')}s \${easingFunction}\`;
                    element.style.backgroundColor = changes.backgroundColor.targetValue;
                  }
                  
                  if (changes.positionX && changes.positionX.changed) {
                    if (transitionType === 'BOUNCY') {
                      // Use bouncy animation for position changes
                      const startPos = changes.positionX.sourceValue;
                      const endPos = changes.positionX.targetValue;
                      const duration = parseFloat(transitionDuration || '0.3');
                      applyBouncyAnimation(element, startPos, endPos, duration);
                    } else {
                      element.style.transition = \`left \${parseFloat(transitionDuration || '0.3')}s \${easingFunction}\`;
                      element.style.left = changes.positionX.targetValue + 'px';
                    }
                  }
                  
                  if (changes.positionY && changes.positionY.changed) {
                    element.style.transition = \`top \${parseFloat(transitionDuration || '0.3')}s \${easingFunction}\`;
                    element.style.top = changes.positionY.targetValue + 'px';
                  }
                  
                  if (changes.width && changes.width.changed) {
                    element.style.transition = \`width \${parseFloat(transitionDuration || '0.3')}s \${easingFunction}\`;
                    element.style.width = changes.width.targetValue + 'px';
                    console.log('DEBUG: Animating width to:', changes.width.targetValue + 'px');
                  }
                  
                  if (changes.height && changes.height.changed) {
                    element.style.transition = \`height \${parseFloat(transitionDuration || '0.3')}s \${easingFunction}\`;
                    element.style.height = changes.height.targetValue + 'px';
                    console.log('DEBUG: Animating height to:', changes.height.targetValue + 'px');
                  }
                }, 50);
              }
            });
            
            // Cleanup after animation
            setTimeout(() => {
              cleanupAfterAnimation(destination, originalDestinationWidth, originalDestinationHeight, elementsToAnimate, allVariants);
            }, parseFloat(transitionDuration || '0.3') * 1000 + 100);
          } else {
            console.log('DEBUG: No animation elements found, performing instant switch');
            performInstantVariantSwitch(allVariants, destination);
            
            // Release transition lock
            isTransitionInProgress = false;
            console.log('DEBUG: Transition lock released');
          }
        } else {
          // For non-SMART_ANIMATE transitions, perform instant switch
          console.log('DEBUG: Performing instant variant switch');
          performInstantVariantSwitch(allVariants, destination);
          
          // Release transition lock
          isTransitionInProgress = false;
          console.log('DEBUG: Transition lock released');
        }
      }

      // Helper function to handle reaction transitions
      function handleReaction(sourceElement, destinationId, transitionType, transitionDuration) {
        // Prevent multiple simultaneous transitions
        if (isTransitionInProgress) {
          console.log('DEBUG: Transition already in progress, skipping this call');
          return;
        }
        
        if (destinationId) {
          const destination = document.querySelector(\`[data-figma-id="\${destinationId}"]\`);
          if (destination) {
            console.log('DEBUG: handleReaction called:', {
              sourceId: sourceElement.getAttribute('data-figma-id'),
              sourceType: sourceElement.getAttribute('data-figma-type'),
              destinationId: destinationId,
              destinationType: destination.getAttribute('data-figma-type')
            });
            
            // Set transition lock
            isTransitionInProgress = true;
            console.log('DEBUG: Transition lock acquired');
            
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
              
              // Check if the destination has a data-target attribute (indicating it's a variant reference)
              const targetId = destination.getAttribute('data-target');
              const variantProperty = destination.getAttribute('data-variant-property-1');
              
              if (targetId && variantProperty) {
                console.log('DEBUG: Destination has target reference:', {
                  targetId: targetId,
                  variantProperty: variantProperty,
                  destinationId: destination.getAttribute('data-figma-id')
                });
                
                // Find the target component set
                const targetComponentSet = document.querySelector(\`[data-figma-id="\${targetId}"]\`);
                if (targetComponentSet && targetComponentSet.getAttribute('data-figma-type') === 'COMPONENT_SET') {
                  console.log('DEBUG: Found target component set:', targetComponentSet.getAttribute('data-figma-id'));
                  
                  // Find the specific variant within the target component set
                  const targetVariant = targetComponentSet.querySelector(\`[data-variant-property-1="\${variantProperty}"]\`);
                  if (targetVariant) {
                    console.log('DEBUG: Found target variant:', targetVariant.getAttribute('data-figma-id'));
                    
                    // Get all variants in the target component set
                    const allVariants = Array.from(targetComponentSet.children).filter(child => 
                      child.getAttribute('data-figma-type') === 'COMPONENT'
                    );
                    
                    console.log('DEBUG: Found', allVariants.length, 'variants in target component set for switching');
                    console.log('DEBUG: Variant IDs:', allVariants.map(v => v.getAttribute('data-figma-id')));
                    
                    // Handle animation for variant switching to the target variant
                    handleVariantSwitching(sourceElement, targetVariant, allVariants, transitionType, transitionDuration);
                    
                    return; // Exit early for variant switching
                  } else {
                    console.log('DEBUG: Target variant not found for property:', variantProperty);
                  }
                } else {
                  console.log('DEBUG: Target component set not found:', targetId);
                }
              }
              
              // Fallback to original logic if no target reference
              const componentSet = destinationComponentSet;
              const allVariants = Array.from(componentSet.children).filter(child => 
                child.getAttribute('data-figma-type') === 'COMPONENT'
              );
              
              console.log('DEBUG: Found', allVariants.length, 'variants in component set for switching');
              console.log('DEBUG: Variant IDs:', allVariants.map(v => v.getAttribute('data-figma-id')));
              
              // Handle animation for variant switching
              handleVariantSwitching(sourceElement, destination, allVariants, transitionType, transitionDuration);
              
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
              handleVariantSwitching(sourceElement, destination, allVariants, transitionType, transitionDuration);
              
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
              
              // CRITICAL FIX: Add delay to transition lock release to prevent variant handler conflicts
              setTimeout(() => {
                // Release transition lock
                isTransitionInProgress = false;
                console.log('DEBUG: Transition lock released (delayed)');
              }, 100); // 100ms delay to ensure variant handler doesn't interfere
              
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
                
                // Release transition lock
                isTransitionInProgress = false;
                console.log('DEBUG: Transition lock released');
              }, parseFloat(transitionDuration || '300'));
            } else if (transitionType === 'SMART_ANIMATE' || transitionType === 'BOUNCY') {
              // Smart animate transition - sophisticated implementation
              console.log('DEBUG: SMART_ANIMATE/BOUNCY transition started');
              
              // Store original destination dimensions for restoration after animation
              // This ensures we respect the designer's Figma dimensions after animation completes
              const originalDestinationWidth = destination.style.width;
              const originalDestinationHeight = destination.style.height;
              
              // Ensure destination is visible and positioned before analysis
              destination.classList.add('variant-active');
              destination.classList.remove('variant-hidden');
              destination.style.visibility = 'visible';
              destination.style.display = 'flex';
              destination.style.position = 'absolute';
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
                
                // Release transition lock
                isTransitionInProgress = false;
                console.log('DEBUG: Transition lock released');
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
              
              // Release transition lock
              isTransitionInProgress = false;
              console.log('DEBUG: Transition lock released');
            }
          }
        }
      }
    `;
}
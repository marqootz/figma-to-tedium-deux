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
      
      // Helper function to create bouncy animation keyframes for X movement only
      function createBouncyKeyframes(elementId, startPosition, endPosition, duration) {
        const style = document.createElement('style');
        const keyframeName = \`bouncy-\${elementId.replace(/[^a-zA-Z0-9]/g, '')}\`;
        
        const overshoot = endPosition + (endPosition - startPosition) * 0.1;
        const undershoot = endPosition - (endPosition - startPosition) * 0.05;
        
        const keyframeCSS = \`
          @keyframes \${keyframeName} {
            0% { transform: translateX(\${startPosition}px); }
            60% { transform: translateX(\${overshoot}px); }
            80% { transform: translateX(\${undershoot}px); }
            100% { transform: translateX(\${endPosition}px); }
          }
        \`;
        
        console.log('DEBUG: Creating bouncy keyframes:');
        console.log('  Keyframe name:', keyframeName);
        console.log('  Start position:', startPosition, 'px');
        console.log('  End position:', endPosition, 'px');
        console.log('  Overshoot position:', overshoot, 'px');
        console.log('  Undershoot position:', undershoot, 'px');
        console.log('  Generated CSS:', keyframeCSS);
        
        style.textContent = keyframeCSS;
        style.setAttribute('data-keyframe', keyframeName);
        document.head.appendChild(style);
        return keyframeName;
      }
      
      // Helper function to create coordinated bouncy animation keyframes for both X and Y
      function createCoordinatedBouncyKeyframes(elementId, startX, endX, startY, endY, duration) {
        const style = document.createElement('style');
        const keyframeName = \`bouncy-coordinated-\${elementId.replace(/[^a-zA-Z0-9]/g, '')}\`;
        
        const overshootX = endX + (endX - startX) * 0.1;
        const undershootX = endX - (endX - startX) * 0.05;
        const overshootY = endY + (endY - startY) * 0.1;
        const undershootY = endY - (endY - startY) * 0.05;
        
        const keyframeCSS = \`
          @keyframes \${keyframeName} {
            0% { transform: translate(0px, 0px); }
            60% { transform: translate(\${overshootX - startX}px, \${overshootY - startY}px); }
            80% { transform: translate(\${undershootX - startX}px, \${undershootY - startY}px); }
            100% { transform: translate(\${endX - startX}px, \${endY - startY}px); }
          }
        \`;
        
        console.log('DEBUG: Creating coordinated bouncy keyframes:');
        console.log('  Keyframe name:', keyframeName);
        console.log('  Start position:', startX + 'px, ' + startY + 'px');
        console.log('  End position:', endX + 'px, ' + endY + 'px');
        console.log('  Overshoot position:', overshootX + 'px, ' + overshootY + 'px');
        console.log('  Undershoot position:', undershootX + 'px, ' + undershootY + 'px');
        console.log('  Generated CSS:', keyframeCSS);
        
        style.textContent = keyframeCSS;
        style.setAttribute('data-keyframe', keyframeName);
        document.head.appendChild(style);
        return keyframeName;
      }
      
      // Helper function to apply bouncy animation to an element (X movement only)
      function applyBouncyAnimation(element, startPosition, endPosition, duration) {
        const elementId = element.getAttribute('data-figma-id');
        const keyframeName = createBouncyKeyframes(elementId, startPosition, endPosition, duration);
        
        console.log('DEBUG: Bouncy animation details:');
        console.log('  Element ID:', elementId);
        console.log('  Start position:', startPosition, 'px');
        console.log('  End position:', endPosition, 'px');
        console.log('  Duration:', duration, 's');
        console.log('  Keyframe name:', keyframeName);
        console.log('  Element position before animation:', element.style.position);
        console.log('  Element left before animation:', element.style.left);
        
        element.style.animation = \`\${keyframeName} \${duration}s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards\`;
        
        // Log the animation style that was applied
        console.log('DEBUG: Applied animation style:', element.style.animation);
        
        // Add frame-by-frame logging during animation
        const animationStartTime = Date.now();
        const animationDuration = duration * 1000;
        
        const logFrame = () => {
          const elapsed = Date.now() - animationStartTime;
          const progress = Math.min(elapsed / animationDuration, 1);
          
          const computedStyle = window.getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          
          console.log(\`DEBUG: Single-axis animation frame at \${progress.toFixed(2)} progress (\${elapsed}ms):\`, {
            elementId: element.getAttribute('data-figma-id'),
            position: element.style.position,
            left: element.style.left,
            top: element.style.top,
            computedLeft: computedStyle.left,
            computedTop: computedStyle.top,
            transform: computedStyle.transform,
            rectX: rect.x,
            rectY: rect.y,
            rectLeft: rect.left,
            rectTop: rect.top
          });
          
          if (progress < 1) {
            requestAnimationFrame(logFrame);
          }
        };
        
        // Start frame logging on next frame
        requestAnimationFrame(logFrame);
        
        // Clean up the keyframes after animation and ensure final position is maintained
        setTimeout(() => {
          console.log('DEBUG: Cleaning up bouncy animation for element:', elementId);
          console.log('DEBUG: Element position before cleanup:', element.style.position);
          console.log('DEBUG: Element left before cleanup:', element.style.left);
          console.log('DEBUG: Element computed left before cleanup:', window.getComputedStyle(element).left);
          console.log('DEBUG: Element transform before cleanup:', window.getComputedStyle(element).transform);
          
          // Remove the animation
          element.style.animation = '';
          
          // CRITICAL FIX: Ensure the final position is maintained by setting the left property
          // The transform from the keyframe animation should be converted to left positioning
          element.style.left = endPosition + 'px';
          
          console.log('DEBUG: Element position after cleanup:', element.style.position);
          console.log('DEBUG: Element left after cleanup:', element.style.left);
          console.log('DEBUG: Element computed left after cleanup:', window.getComputedStyle(element).left);
          
          const styleElement = document.querySelector(\`style[data-keyframe="\${keyframeName}"]\`);
          if (styleElement) {
            styleElement.remove();
          }
        }, duration * 1000 + 100);
      }
      
      // Helper function to apply coordinated bouncy animation for both X and Y movement
      function applyCoordinatedBouncyAnimation(element, startX, endX, startY, endY, duration) {
        const elementId = element.getAttribute('data-figma-id');
        
        console.log('DEBUG: Starting coordinated bouncy animation:', elementId);
        
        // Calculate the movement distances
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        
        // Calculate overshoot and undershoot (same as before)
        const overshootX = deltaX * 1.1; // 10% overshoot
        const undershootX = deltaX * 0.95; // 5% undershoot
        const overshootY = deltaY * 1.1;
        const undershootY = deltaY * 0.95;
        
        // Set up the animation using direct top/left manipulation
        const animationStartTime = Date.now();
        const animationDuration = duration * 1000;
        
        const animate = () => {
          const elapsed = Date.now() - animationStartTime;
          const progress = Math.min(elapsed / animationDuration, 1);
          
          // Calculate current position using bouncy easing
          let currentX, currentY;
          
          if (progress <= 0.6) {
            // First phase: move to overshoot
            const phaseProgress = progress / 0.6;
            currentX = startX + (overshootX * phaseProgress);
            currentY = startY + (overshootY * phaseProgress);
          } else if (progress <= 0.8) {
            // Second phase: move to undershoot
            const phaseProgress = (progress - 0.6) / 0.2;
            currentX = startX + overshootX + ((undershootX - overshootX) * phaseProgress);
            currentY = startY + overshootY + ((undershootY - overshootY) * phaseProgress);
          } else {
            // Final phase: move to target
            const phaseProgress = (progress - 0.8) / 0.2;
            currentX = startX + undershootX + ((deltaX - undershootX) * phaseProgress);
            currentY = startY + undershootY + ((deltaY - undershootY) * phaseProgress);
          }
          
          // Apply the position directly
          element.style.left = currentX + 'px';
          element.style.top = currentY + 'px';
          
          // Animation frame processing (logging removed for cleaner output)
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            // Animation complete - ensure final position
            element.style.left = endX + 'px';
            element.style.top = endY + 'px';
            
            console.log('DEBUG: Coordinated animation completed:', elementId);
          }
        };
        
        // Start the animation
        requestAnimationFrame(animate);
      }
      
      // Helper function to apply coordinated smooth animation for both X and Y movement
      function applyCoordinatedSmoothAnimation(element, startX, endX, startY, endY, duration) {
        const elementId = element.getAttribute('data-figma-id');
        
        console.log('DEBUG: Starting coordinated smooth animation:', elementId);
        
        // Calculate the movement distances
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        
        // Set up the animation using direct top/left manipulation
        const animationStartTime = Date.now();
        const animationDuration = duration * 1000;
        
        const animate = () => {
          const elapsed = Date.now() - animationStartTime;
          const progress = Math.min(elapsed / animationDuration, 1);
          
          // Calculate current position using smooth easing (ease-in-out)
          const easeProgress = progress < 0.5 ? 
            2 * progress * progress : 
            1 - Math.pow(-2 * progress + 2, 2) / 2;
          
          const currentX = startX + (deltaX * easeProgress);
          const currentY = startY + (deltaY * easeProgress);
          
          // Apply the position directly
          element.style.left = currentX + 'px';
          element.style.top = currentY + 'px';
          
          // Animation frame processing (logging removed for cleaner output)
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            // Animation complete - ensure final position
            element.style.left = endX + 'px';
            element.style.top = endY + 'px';
            
            console.log('DEBUG: Coordinated smooth animation completed:', elementId);
          }
        };
        
        // Start the animation
        requestAnimationFrame(animate);
      }
      
      // Note: detectPropertyChanges is now defined in property-detector.ts
      // This prevents duplicate function definitions and ensures we use the improved implementation
      
      // Helper function to ensure tap targets are visible after variant transitions
      function ensureTapTargetsVisible(variant) {
        
        // Find all tap targets (elements with reactions) in the variant
        const tapTargets = variant.querySelectorAll('[data-has-reactions="true"]');
        tapTargets.forEach(target => {
          const computedStyle = window.getComputedStyle(target);
          
          // Ensure tap targets are visible and clickable
          if (computedStyle.display === 'none') {
            // The issue is that the parent variant has variant-hidden class
            // We need to force the display to override the inherited display: none
            target.style.setProperty('display', 'flex');
          }
          if (computedStyle.visibility === 'hidden') {
            target.style.setProperty('visibility', 'visible');
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
        destination.style.opacity = '1'; // Keep visible but elements will be positioned
        
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
        
        // Clean up animated elements - preserve final animated position
        elementsToAnimate.forEach(({ element }) => {
          const calculatedEndPosition = element.getAttribute('data-calculated-end-position');
          const originalPosition = element.getAttribute('data-original-position');
          const originalLeft = element.getAttribute('data-original-left');
          const originalTop = element.getAttribute('data-original-top');
          
                            // CRITICAL FIX: Preserve the final animated position instead of resetting to natural layout
                  // This ensures the element stays in its final animated position for the next cycle
                  // Only remove the transform property that might interfere
                  element.style.transform = '';
                  
                  // CRITICAL FIX: Ensure the element maintains its absolute positioning for the next animation cycle
                  // This prevents the element from being reset to its natural layout position
                  if (element.style.position === 'absolute' && (element.style.left || element.style.top)) {
                    // Keep the absolute positioning and current position for the next animation
                    console.log('DEBUG: Preserving absolute positioning for next animation cycle:', {
                      elementId: element.getAttribute('data-figma-id'),
                      position: element.style.position,
                      left: element.style.left,
                      top: element.style.top
                    });
                  }
          
          console.log('DEBUG: Cleanup - Preserve final animated position:', {
            elementId: element.getAttribute('data-figma-id'),
            elementName: element.getAttribute('data-figma-name'),
            finalPosition: element.style.position,
            finalLeft: element.style.left,
            finalTop: element.style.top,
            finalTransform: element.style.transform,
            finalComputedLeft: window.getComputedStyle(element).left,
            finalComputedTop: window.getComputedStyle(element).top,
            finalRect: element.getBoundingClientRect()
          });
          
          // Remove stored data
          element.removeAttribute('data-calculated-end-position');
          element.removeAttribute('data-original-position');
          element.removeAttribute('data-original-left');
          element.removeAttribute('data-original-top');
        });
        
                        // Hide all other variants
                console.log('DEBUG: Hiding all variants except destination');
                allVariants.forEach(variant => {
                  if (variant !== destination) {
                    console.log('  Hiding variant:', variant.getAttribute('data-figma-name'));
                    variant.classList.add('variant-hidden');
                    variant.classList.remove('variant-active');
                    variant.style.opacity = '1'; // Reset opacity
                  } else {
                    console.log('  Keeping destination variant visible:', variant.getAttribute('data-figma-name'));
                  }
                });
        
        // Start timeout reactions
        startTimeoutReactionsForNewlyActiveVariant(destination);
        startTimeoutReactionsForNestedComponents(destination);
        
        // Release transition lock
        isTransitionInProgress = false;
      }

      // Helper function to handle variant switching
      function handleVariantSwitching(sourceElement, destination, allVariants, transitionType, transitionDuration) {
        console.log('=== VARIANT SWITCHING START ===');
        console.log('DEBUG: handleVariantSwitching called');
        console.log('  Source element ID:', sourceElement.getAttribute('data-figma-id'), 'Name:', sourceElement.getAttribute('data-figma-name'));
        console.log('  Destination element ID:', destination.getAttribute('data-figma-id'), 'Name:', destination.getAttribute('data-figma-name'));
        console.log('  Transition type:', transitionType, 'Duration:', transitionDuration);
        console.log('  All variants count:', allVariants.length);
        console.log('  Transition lock status:', isTransitionInProgress);
        
        // Log current variant states
        allVariants.forEach((variant, index) => {
          const isActive = variant.classList.contains('variant-active');
          const isHidden = variant.classList.contains('variant-hidden');
          console.log('  Variant ' + (index + 1) + ': ' + variant.getAttribute('data-figma-name') + ' - Active: ' + isActive + ', Hidden: ' + isHidden);
        });
        
        if (transitionType === 'SMART_ANIMATE' || transitionType === 'BOUNCY') {
          
          // Store original destination dimensions for restoration after animation
          const originalDestinationWidth = destination.style.width;
          const originalDestinationHeight = destination.style.height;
          
          // Setup destination for animation
          setupDestinationForAnimation(destination);
          
          // Hide source element during animation to prevent visual conflicts
          sourceElement.style.opacity = '0';
          
          // Find elements with property changes
          console.log('DEBUG: Calling findElementsWithPropertyChanges...');
          const elementsToAnimate = findElementsWithPropertyChanges(destination, sourceElement);
          console.log('DEBUG: findElementsWithPropertyChanges returned', elementsToAnimate.length, 'elements');
          
          // If no elements found, try background color changes
          if (elementsToAnimate.length === 0) {
            const sourceFrames = sourceElement.querySelectorAll('[data-figma-type="FRAME"]');
            const targetFrames = destination.querySelectorAll('[data-figma-type="FRAME"]');
            
            sourceFrames.forEach((sourceFrame, index) => {
              if (targetFrames[index]) {
                const sourceStyle = window.getComputedStyle(sourceFrame);
                const targetStyle = window.getComputedStyle(targetFrames[index]);
                
                if (sourceStyle.backgroundColor !== targetStyle.backgroundColor) {
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
              console.log('DEBUG: Starting animation for', elementsToAnimate.length, 'elements');
            
            // Animate each element with changes
            elementsToAnimate.forEach(({ element, sourceElement, changes }, index) => {
              console.log('DEBUG: Animating element ' + (index + 1) + ':', element.getAttribute('data-figma-name'));
              console.log('  Element ID:', element.getAttribute('data-figma-id'));
              console.log('  Changes detected:', changes);
              if (changes.hasChanges) {
                
                // Apply initial state (matching source)
                if (changes.backgroundColor && changes.backgroundColor.changed) {
                  element.style.backgroundColor = changes.backgroundColor.sourceValue;
                }
                
                // Store original positioning before animation
                const originalPosition = element.style.position;
                const originalLeft = element.style.left;
                const originalTop = element.style.top;
                
                // Apply initial position state using absolute positioning for variant transitions
                if (changes.positionX && changes.positionX.changed) {
                  console.log('DEBUG: Applying initial X position:', changes.positionX.sourceValue + 'px');
                  element.style.position = 'absolute';
                  element.style.left = changes.positionX.sourceValue + 'px';
                } else {
                  console.log('DEBUG: No X position change to apply');
                }
                if (changes.positionY && changes.positionY.changed) {
                  console.log('DEBUG: Applying initial Y position:', changes.positionY.sourceValue + 'px');
                  element.style.position = 'absolute';
                  element.style.top = changes.positionY.sourceValue + 'px';
                } else {
                  console.log('DEBUG: No Y position change to apply');
                }
                
                // Store original values for restoration
                element.setAttribute('data-original-position', originalPosition);
                element.setAttribute('data-original-left', originalLeft);
                element.setAttribute('data-original-top', originalTop);
                
                // Apply initial size state
                if (changes.width && changes.width.changed) {
                  element.style.width = changes.width.sourceValue + 'px';
                }
                if (changes.height && changes.height.changed) {
                  element.style.height = changes.height.sourceValue + 'px';
                }
                
                // Apply initial padding state
                if (changes.paddingLeft && changes.paddingLeft.changed) {
                  element.style.paddingLeft = changes.paddingLeft.sourceValue + 'px';
                }
                if (changes.paddingRight && changes.paddingRight.changed) {
                  element.style.paddingRight = changes.paddingRight.sourceValue + 'px';
                }
                if (changes.paddingTop && changes.paddingTop.changed) {
                  element.style.paddingTop = changes.paddingTop.sourceValue + 'px';
                }
                if (changes.paddingBottom && changes.paddingBottom.changed) {
                  element.style.paddingBottom = changes.paddingBottom.sourceValue + 'px';
                }
                
                // Apply initial margin state
                if (changes.marginLeft && changes.marginLeft.changed) {
                  element.style.marginLeft = changes.marginLeft.sourceValue + 'px';
                }
                if (changes.marginRight && changes.marginRight.changed) {
                  element.style.marginRight = changes.marginRight.sourceValue + 'px';
                }
                if (changes.marginTop && changes.marginTop.changed) {
                  element.style.marginTop = changes.marginTop.sourceValue + 'px';
                }
                if (changes.marginBottom && changes.marginBottom.changed) {
                  element.style.marginBottom = changes.marginBottom.sourceValue + 'px';
                }
                
                // Apply initial opacity state
                if (changes.opacity && changes.opacity.changed) {
                  element.style.opacity = changes.opacity.sourceValue;
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
                    }
                  }
                }
                
                // Animate to target state using a small delay to ensure initial state is applied
                setTimeout(() => {
                  // Force a reflow to ensure initial state is applied
                  element.offsetHeight;
                  
                  // Add a small delay to ensure the initial position is visible before animating
                  setTimeout(() => {
                  
                  // Clear any existing transitions to prevent conflicts
                  element.style.transition = 'none';
                  element.offsetHeight; // Force reflow after clearing transitions
                  
                  // Get the easing function based on the transition type
                  const easingFunction = getEasingFunction(transitionType);
                  
                  // Build transition string for all properties that will animate
                  const transitionProperties = [];
                  if (changes.backgroundColor && changes.backgroundColor.changed) {
                    transitionProperties.push(\`background-color \${parseFloat(transitionDuration || '0.3')}s \${easingFunction}\`);
                  }
                  if (changes.positionX && changes.positionX.changed && transitionType !== 'BOUNCY') {
                    transitionProperties.push(\`left \${parseFloat(transitionDuration || '0.3')}s \${easingFunction}\`);
                  }
                  if (changes.positionY && changes.positionY.changed) {
                    transitionProperties.push(\`top \${parseFloat(transitionDuration || '0.3')}s \${easingFunction}\`);
                  }
                  if (changes.width && changes.width.changed) {
                    transitionProperties.push(\`width \${parseFloat(transitionDuration || '0.3')}s \${easingFunction}\`);
                  }
                  if (changes.height && changes.height.changed) {
                    transitionProperties.push(\`height \${parseFloat(transitionDuration || '0.3')}s \${easingFunction}\`);
                  }
                  if (changes.paddingLeft && changes.paddingLeft.changed) {
                    transitionProperties.push(\`padding-left \${parseFloat(transitionDuration || '0.3')}s \${easingFunction}\`);
                  }
                  if (changes.paddingRight && changes.paddingRight.changed) {
                    transitionProperties.push(\`padding-right \${parseFloat(transitionDuration || '0.3')}s \${easingFunction}\`);
                  }
                  if (changes.paddingTop && changes.paddingTop.changed) {
                    transitionProperties.push(\`padding-top \${parseFloat(transitionDuration || '0.3')}s \${easingFunction}\`);
                  }
                  if (changes.paddingBottom && changes.paddingBottom.changed) {
                    transitionProperties.push(\`padding-bottom \${parseFloat(transitionDuration || '0.3')}s \${easingFunction}\`);
                  }
                  if (changes.marginLeft && changes.marginLeft.changed) {
                    transitionProperties.push(\`margin-left \${parseFloat(transitionDuration || '0.3')}s \${easingFunction}\`);
                  }
                  if (changes.marginRight && changes.marginRight.changed) {
                    transitionProperties.push(\`margin-right \${parseFloat(transitionDuration || '0.3')}s \${easingFunction}\`);
                  }
                  if (changes.marginTop && changes.marginTop.changed) {
                    transitionProperties.push(\`margin-top \${parseFloat(transitionDuration || '0.3')}s \${easingFunction}\`);
                  }
                  if (changes.marginBottom && changes.marginBottom.changed) {
                    transitionProperties.push(\`margin-bottom \${parseFloat(transitionDuration || '0.3')}s \${easingFunction}\`);
                  }
                  if (changes.opacity && changes.opacity.changed) {
                    transitionProperties.push(\`opacity \${parseFloat(transitionDuration || '0.3')}s \${easingFunction}\`);
                  }
                  
                  // Apply the combined transition
                  if (transitionProperties.length > 0) {
                    element.style.transition = transitionProperties.join(', ');
                  }
                  
                  // Apply target values
                  if (changes.backgroundColor && changes.backgroundColor.changed) {
                    element.style.backgroundColor = changes.backgroundColor.targetValue;
                  }
                  
                  // CRITICAL FIX: Use coordinated bouncy animation for ALL bouncy transitions
                  // This provides consistent behavior whether it's single-axis or dual-axis
                  const hasXChange = changes.positionX && changes.positionX.changed;
                  const hasYChange = changes.positionY && changes.positionY.changed;
                  
                  // CRITICAL FIX: Use coordinated animation for ALL position changes, regardless of transition type
                  // This ensures consistent behavior and eliminates hitches
                  if (hasXChange || hasYChange) {
                    // Use coordinated animation for any position changes
                    const startX = hasXChange ? changes.positionX.sourceValue : parseFloat(element.style.left) || 0;
                    const endX = hasXChange ? changes.positionX.targetValue : parseFloat(element.style.left) || 0;
                    const startY = hasYChange ? changes.positionY.sourceValue : parseFloat(element.style.top) || 0;
                    const endY = hasYChange ? changes.positionY.targetValue : parseFloat(element.style.top) || 0;
                    const duration = parseFloat(transitionDuration || '0.3');
                    
                    console.log('DEBUG: Using coordinated animation for position changes:');
                    console.log('  Transition type:', transitionType);
                    console.log('  X:', startX + 'px -> ' + endX + 'px', hasXChange ? '(changing)' : '(static)');
                    console.log('  Y:', startY + 'px -> ' + endY + 'px', hasYChange ? '(changing)' : '(static)');
                    console.log('  Element rect before coordinated animation:', element.getBoundingClientRect());
                    console.log('  Element style before animation - position:', element.style.position, 'left:', element.style.left, 'top:', element.style.top);
                    console.log('  Element computed style before animation - left:', window.getComputedStyle(element).left, 'top:', window.getComputedStyle(element).top);
                    
                    // CRITICAL FIX: Disable CSS transitions when using coordinated animation
                    // This prevents conflicts between requestAnimationFrame and CSS transitions
                    element.style.transition = 'none';
                    
                    if (transitionType === 'BOUNCY') {
                      applyCoordinatedBouncyAnimation(element, startX, endX, startY, endY, duration);
                    } else {
                      // Use smooth animation for non-bouncy transitions
                      applyCoordinatedSmoothAnimation(element, startX, endX, startY, endY, duration);
                    }
                  } else {
                    // Handle non-position changes
                    console.log('DEBUG: No position changes to animate');
                  }
                  
                  if (changes.width && changes.width.changed) {
                    element.style.width = changes.width.targetValue + 'px';
                  }
                  
                  if (changes.height && changes.height.changed) {
                    element.style.height = changes.height.targetValue + 'px';
                  }
                  
                  if (changes.paddingLeft && changes.paddingLeft.changed) {
                    element.style.paddingLeft = changes.paddingLeft.targetValue + 'px';
                  }
                  
                  if (changes.paddingRight && changes.paddingRight.changed) {
                    element.style.paddingRight = changes.paddingRight.targetValue + 'px';
                  }
                  
                  if (changes.paddingTop && changes.paddingTop.changed) {
                    element.style.paddingTop = changes.paddingTop.targetValue + 'px';
                  }
                  
                  if (changes.paddingBottom && changes.paddingBottom.changed) {
                    element.style.paddingBottom = changes.paddingBottom.targetValue + 'px';
                  }
                  
                  if (changes.marginLeft && changes.marginLeft.changed) {
                    element.style.marginLeft = changes.marginLeft.targetValue + 'px';
                  }
                  
                  if (changes.marginRight && changes.marginRight.changed) {
                    element.style.marginRight = changes.marginRight.targetValue + 'px';
                  }
                  
                  if (changes.marginTop && changes.marginTop.changed) {
                    element.style.marginTop = changes.marginTop.targetValue + 'px';
                  }
                  
                  if (changes.marginBottom && changes.marginBottom.changed) {
                    element.style.marginBottom = changes.marginBottom.targetValue + 'px';
                  }
                  
                  if (changes.opacity && changes.opacity.changed) {
                    element.style.opacity = changes.opacity.targetValue;
                  }
                }, 50); // Small delay to ensure initial position is visible before animating
              }, 16); // Small delay to ensure initial state is applied
              }
            });
            
            // Cleanup after animation
            setTimeout(() => {
              cleanupAfterAnimation(destination, originalDestinationWidth, originalDestinationHeight, elementsToAnimate, allVariants);
            }, parseFloat(transitionDuration || '0.3') * 1000 + 100);
          } else {
            performInstantVariantSwitch(allVariants, destination);
            
            // Release transition lock
            isTransitionInProgress = false;
          }
        } else {
          // For non-SMART_ANIMATE transitions, perform instant switch
          performInstantVariantSwitch(allVariants, destination);
          
          // Release transition lock
          isTransitionInProgress = false;
        }
      }

      // Helper function to handle reaction transitions
      console.log('DEBUG: Defining handleReaction function...');
      function handleReaction(sourceElement, destinationId, transitionType, transitionDuration) {
        console.log('=== REACTION HANDLER START ===');
        console.log('DEBUG: handleReaction called');
        console.log('  Source element ID:', sourceElement.getAttribute('data-figma-id'), 'Name:', sourceElement.getAttribute('data-figma-name'));
        console.log('  Destination ID:', destinationId);
        console.log('  Transition type:', transitionType, 'Duration:', transitionDuration);
        console.log('  Transition in progress:', isTransitionInProgress);
        console.log('  Timestamp:', new Date().toISOString());
        
        // Prevent multiple simultaneous transitions
        if (isTransitionInProgress) {
          console.log('DEBUG: Transition already in progress, skipping');
          console.log('=== REACTION HANDLER BLOCKED ===');
          return;
        }
        
        // CRITICAL FIX: Set transition lock immediately to prevent race conditions
        console.log('DEBUG: Setting transition lock');
        isTransitionInProgress = true;
        
        if (destinationId) {
          console.log('DEBUG: Looking for destination element with ID:', destinationId);
          const destination = document.querySelector(\`[data-figma-id="\${destinationId}"]\`);
          console.log('DEBUG: Destination element found:', !!destination);
          if (destination) {
            console.log('DEBUG: Destination element details:', {
              id: destination.getAttribute('data-figma-id'),
              name: destination.getAttribute('data-figma-name'),
              type: destination.getAttribute('data-figma-type')
            });
            
            // Transition lock already set above
            
            // CRITICAL FIX: Check if this is a variant switch within a component set
            // Find the common parent component set for both source and destination
            const sourceComponentSet = sourceElement.closest('[data-figma-type="COMPONENT_SET"]');
            const destinationComponentSet = destination.closest('[data-figma-type="COMPONENT_SET"]');
            
            console.log('DEBUG: Component set analysis:');
            console.log('  Source component set found:', !!sourceComponentSet);
            console.log('  Destination component set found:', !!destinationComponentSet);
            if (sourceComponentSet) {
              console.log('  Source component set ID:', sourceComponentSet.getAttribute('data-figma-id'));
            }
            if (destinationComponentSet) {
              console.log('  Destination component set ID:', destinationComponentSet.getAttribute('data-figma-id'));
            }
            
            // CRITICAL FIX: Handle the case where source is an INSTANCE and destination is a COMPONENT
            // This happens when the instance has a reaction that targets a component within its child component set
            console.log('DEBUG: Checking INSTANCE -> COMPONENT case');
            console.log('  Source type:', sourceElement.getAttribute('data-figma-type'));
            console.log('  Destination type:', destination.getAttribute('data-figma-type'));
            console.log('  Has destination component set:', !!destinationComponentSet);
            
            if (sourceElement.getAttribute('data-figma-type') === 'INSTANCE' && 
                destination.getAttribute('data-figma-type') === 'COMPONENT' && 
                destinationComponentSet) {
              
              // Check if the destination has a data-target attribute (indicating it's a variant reference)
              const targetId = destination.getAttribute('data-target');
              const variantProperty = destination.getAttribute('data-variant-property-1');
              
              if (targetId && variantProperty) {
                
                // Find the target component set
                const targetComponentSet = document.querySelector(\`[data-figma-id="\${targetId}"]\`);
                if (targetComponentSet && targetComponentSet.getAttribute('data-figma-type') === 'COMPONENT_SET') {
                  
                  // Find the specific variant within the target component set
                  const targetVariant = targetComponentSet.querySelector(\`[data-variant-property-1="\${variantProperty}"]\`);
                  if (targetVariant) {
                    
                    // Get all variants in the target component set
                    const allVariants = Array.from(targetComponentSet.children).filter(child => 
                      child.getAttribute('data-figma-type') === 'COMPONENT'
                    );
                    
                    
                                  // Handle animation for variant switching to the target variant
              console.log('DEBUG: Calling handleVariantSwitching for INSTANCE -> COMPONENT case');
              handleVariantSwitching(sourceElement, targetVariant, allVariants, transitionType, transitionDuration);
              
              return; // Exit early for variant switching
                  } else {
                  }
                } else {
                }
              }
              
              // Fallback to original logic if no target reference
              const componentSet = destinationComponentSet;
              const allVariants = Array.from(componentSet.children).filter(child => 
                child.getAttribute('data-figma-type') === 'COMPONENT'
              );
              
              
              // Handle animation for variant switching
              handleVariantSwitching(sourceElement, destination, allVariants, transitionType, transitionDuration);
              
              return; // Exit early for variant switching
            }
            
            // CRITICAL FIX: Handle the case where source is a COMPONENT and destination is a COMPONENT
            // This happens when a component has a reaction that targets another component in the same component set
            if (sourceElement.getAttribute('data-figma-type') === 'COMPONENT' && 
                destination.getAttribute('data-figma-type') === 'COMPONENT' && 
                sourceComponentSet && destinationComponentSet && sourceComponentSet === destinationComponentSet) {
              
              // Find the component set that contains both source and destination
              const componentSet = sourceComponentSet;
              const allVariants = Array.from(componentSet.children).filter(child => 
                child.getAttribute('data-figma-type') === 'COMPONENT'
              );
              
              // Handle animation for variant switching
              handleVariantSwitching(sourceElement, destination, allVariants, transitionType, transitionDuration);
              
              return; // Exit early for variant switching
            }
            
            if (sourceComponentSet && destinationComponentSet && sourceComponentSet === destinationComponentSet) {
              
              // This is a variant switch - handle it properly by switching variants within the component set
              const componentSet = sourceComponentSet;
              const allVariants = Array.from(componentSet.children).filter(child => 
                child.getAttribute('data-figma-type') === 'COMPONENT' &&
                (child.getAttribute('data-variant') || child.getAttribute('data-variant-property-1'))
              );
              
              
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
              
              // CRITICAL FIX: Add delay to transition lock release to prevent variant handler conflicts
              setTimeout(() => {
                // Release transition lock
                isTransitionInProgress = false;
              }, 100); // 100ms delay to ensure variant handler doesn't interfere
              
              return; // Exit early for variant switching
            }
            
            // Original logic for non-variant transitions
            
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
              }, parseFloat(transitionDuration || '300'));
            } else if (transitionType === 'SMART_ANIMATE' || transitionType === 'BOUNCY') {
              // Smart animate transition - sophisticated implementation
              
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
              
              // If no elements found, try a different approach - look for background color changes
              if (elementsToAnimate.length === 0) {
                const sourceFrames = sourceElement.querySelectorAll('[data-figma-type="FRAME"]');
                const targetFrames = destination.querySelectorAll('[data-figma-type="FRAME"]');
                
                sourceFrames.forEach((sourceFrame, index) => {
                  if (targetFrames[index]) {
                    const sourceStyle = window.getComputedStyle(sourceFrame);
                    const targetStyle = window.getComputedStyle(targetFrames[index]);
                    
                    if (sourceStyle.backgroundColor !== targetStyle.backgroundColor) {
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
                
                
                // Log current element state
                const elementRect = element.getBoundingClientRect();
                const elementStyle = window.getComputedStyle(element);
                
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
                  }
                  
                  if (changes.positionY && changes.positionY.changed) {
                    element.style.top = changes.positionY.sourceValue + 'px';
                  }
                }
                
                // For visual changes, start with source element's visual properties
                if (changes.color && changes.color.changed) {
                  element.style.color = changes.color.sourceValue;
                }
                
                if (changes.backgroundColor && changes.backgroundColor.changed) {
                  element.style.backgroundColor = changes.backgroundColor.sourceValue;
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
                // Only recalculate if the target position is clearly off-screen (much larger than container)
                if (changes.positionX && changes.positionX.changed && changes.positionX.targetValue > 1000) {
                  const container = element.closest('[data-figma-type="COMPONENT_SET"], [data-figma-type="COMPONENT"]');
                  if (container) {
                    const containerRect = container.getBoundingClientRect();
                    const elementRect = element.getBoundingClientRect();
                    
                    // Only recalculate if the target position is significantly larger than the container
                    // This prevents incorrect recalculation for normal positioning like 53px -> 76px
                    if (containerRect.width > 0 && elementRect.width > 0 && changes.positionX.targetValue > containerRect.width * 2) {
                      // For flex-end positioning, the element should be flush against the right edge
                      // The gap is for spacing between elements, not from the edge
                      const calculatedEndPosition = containerRect.width - elementRect.width;
                      changes.positionX.targetValue = calculatedEndPosition;
                      // Store the calculated value for cleanup
                      element.setAttribute('data-calculated-end-position', calculatedEndPosition.toString());
                      console.log('DEBUG: Recalculated off-screen position from', changes.positionX.targetValue, 'to', calculatedEndPosition);
                    } else {
                      console.log('DEBUG: Skipping position recalculation - target position', changes.positionX.targetValue, 'is within reasonable bounds');
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
              });
              
              // Force a reflow to ensure all initial styles are applied before animation
              destination.offsetHeight;
              
              // Execution phase: Animate to target values
              setTimeout(() => {
                elementsToAnimate.forEach(function(item) {
                  const element = item.element;
                  const changes = item.changes;
                  
                  
                  if ((changes.positionX && changes.positionX.changed) || (changes.positionY && changes.positionY.changed)) {
                    // Use the computed style values directly
                    if (changes.positionX && changes.positionX.changed) {
                      const startLeft = parseFloat(window.getComputedStyle(element).left) || 0;
                      const endLeft = changes.positionX.targetValue;
                      
                      
                      element.style.left = endLeft + 'px';
                    }
                    
                    if (changes.positionY && changes.positionY.changed) {
                      element.style.top = changes.positionY.targetValue + 'px';
                    }
                  }
                  
                  if (changes.backgroundColor && changes.backgroundColor.changed) {
                    element.style.backgroundColor = changes.backgroundColor.targetValue;
                  }
                  
                  if (changes.color && changes.color.changed) {
                    element.style.color = changes.color.targetValue;
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
                console.log('=== CLEANUP PHASE START ===');
                console.log('DEBUG: Starting cleanup phase for animation');
                elementsToAnimate.forEach(function(item) {
                  const element = item.element;
                  const originalStyles = JSON.parse(element.getAttribute('data-original-styles') || '{}');
                  
                  
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
                  } else {
                    // For position animations, keep the final animated position
                    // Don't restore original left/top values as they would revert the animation
                    // Only restore other properties that weren't animated
                  }
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
                
                
                // Start timeout reactions for the newly active destination variant
                startTimeoutReactionsForNewlyActiveVariant(destination);
                // Start timeout reactions for nested components within the destination
                startTimeoutReactionsForNestedComponents(destination);
                
                // Release transition lock
                console.log('DEBUG: Releasing transition lock (animation cleanup)');
                isTransitionInProgress = false;
                console.log('=== VARIANT SWITCHING COMPLETE ===');
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
              console.log('DEBUG: Releasing transition lock (default transition)');
              isTransitionInProgress = false;
              console.log('=== REACTION HANDLER COMPLETE ===');
            }
          }
        }
        console.log('=== DEBUG: handleReaction function completed ===');
      }
      
      // Test if function is available
      console.log('DEBUG: handleReaction function defined, typeof:', typeof handleReaction);
      
      // Make function globally available
      window.handleReaction = handleReaction;
      console.log('DEBUG: handleReaction made globally available, typeof window.handleReaction:', typeof window.handleReaction);
    `;
}
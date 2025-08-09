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
          height: { changed: false, sourceValue: null, targetValue: null },
          paddingLeft: { changed: false, sourceValue: null, targetValue: null },
          paddingRight: { changed: false, sourceValue: null, targetValue: null },
          paddingTop: { changed: false, sourceValue: null, targetValue: null },
          paddingBottom: { changed: false, sourceValue: null, targetValue: null },
          marginLeft: { changed: false, sourceValue: null, targetValue: null },
          marginRight: { changed: false, sourceValue: null, targetValue: null },
          marginTop: { changed: false, sourceValue: null, targetValue: null },
          marginBottom: { changed: false, sourceValue: null, targetValue: null },
          opacity: { changed: false, sourceValue: null, targetValue: null }
        };

        try {
          // Check if this is a static layout element that shouldn't animate
          const elementName = targetElement.getAttribute('data-figma-name');
          const elementType = targetElement.getAttribute('data-figma-type');
          
          // Exclude only specific static layout elements from position animation
          const isStaticLayoutElement = elementName === 'bg' || 
                                      elementName === 'Frame 59' || 
                                      elementName === 'Frame 60';
          
          // Check if element is part of auto layout (should ignore position changes but allow other changes)
          const isPartOfAutoLayout = targetElement.getAttribute('data-layout-positioning') === 'AUTO' && 
                                    targetElement.parentElement && 
                                    targetElement.parentElement.getAttribute('data-layout-mode');
          
          // Check if auto layout element has explicit position values (should animate)
          // Instead of checking if inline styles are empty, check if there are position changes between variants
          const sourceStyle = window.getComputedStyle(sourceElement);
          const targetStyle = window.getComputedStyle(targetElement);
          const sourceLeft = parseFloat(sourceStyle.left) || 0;
          const targetLeft = parseFloat(targetStyle.left) || 0;
          const sourceTop = parseFloat(sourceStyle.top) || 0;
          const targetTop = parseFloat(targetStyle.top) || 0;
          
          // CRITICAL FIX: For variant transitions, we need to check the actual Figma positioning
          // The computed styles might not reflect the actual variant positioning
          const sourceFigmaX = parseFloat(sourceElement.getAttribute('data-figma-x')) || 0;
          const targetFigmaX = parseFloat(targetElement.getAttribute('data-figma-x')) || 0;
          const sourceFigmaY = parseFloat(sourceElement.getAttribute('data-figma-y')) || 0;
          const targetFigmaY = parseFloat(targetElement.getAttribute('data-figma-y')) || 0;
          
          const hasPositionChanges = Math.abs(sourceLeft - targetLeft) > 1 || Math.abs(sourceTop - targetTop) > 1 ||
                                   Math.abs(sourceFigmaX - targetFigmaX) > 1 || Math.abs(sourceFigmaY - targetFigmaY) > 1;
          const hasExplicitPosition = hasPositionChanges;
          

          
                      if (isStaticLayoutElement) {
            } else if (isPartOfAutoLayout && !hasExplicitPosition) {
            // Note: We still check for padding, margin, and opacity changes even for auto layout elements
                      } else {
              // Check position changes by comparing the computed styles
              // Reuse the already declared sourceStyle and targetStyle variables
              
              
              // Check left position changes (only for non-static, non-auto-layout elements)
              // Reuse the already calculated sourceLeft and targetLeft
            
            // Check for position changes using both computed styles and Figma attributes
            const sourceFigmaX = parseFloat(sourceElement.getAttribute('data-figma-x')) || 0;
            const targetFigmaX = parseFloat(targetElement.getAttribute('data-figma-x')) || 0;
            const sourceFigmaY = parseFloat(sourceElement.getAttribute('data-figma-y')) || 0;
            const targetFigmaY = parseFloat(targetElement.getAttribute('data-figma-y')) || 0;
            
            // Use Figma positioning if available, otherwise fall back to computed styles
            const actualSourceLeft = sourceFigmaX || sourceLeft;
            const actualTargetLeft = targetFigmaX || targetLeft;
            
                          if (Math.abs(actualSourceLeft - actualTargetLeft) > 1) { // Reduced threshold for better sensitivity
                changes.positionX.changed = true;
                changes.positionX.sourceValue = actualSourceLeft;
                changes.positionX.targetValue = actualTargetLeft;
                changes.hasChanges = true;
              }
            
            // Check top position changes (only for non-static, non-auto-layout elements)
            // Reuse the already calculated sourceTop and targetTop
            
            
            
            // Use Figma positioning if available, otherwise fall back to computed styles
            const actualSourceTop = sourceFigmaY || sourceTop;
            const actualTargetTop = targetFigmaY || targetTop;
            
                          if (Math.abs(actualSourceTop - actualTargetTop) > 1) { // Reduced threshold for better sensitivity
                changes.positionY.changed = true;
                changes.positionY.sourceValue = actualSourceTop;
                changes.positionY.targetValue = actualTargetTop;
                changes.hasChanges = true;
              }
          }

          // Check style changes (for all elements, including auto layout)
          // Reuse the already declared sourceStyle and targetStyle variables
          const sourceBg = sourceStyle.backgroundColor || 'rgba(0, 0, 0, 0)';
          const targetBg = targetStyle.backgroundColor || 'rgba(0, 0, 0, 0)';
          
          if (sourceBg !== targetBg) {
            changes.backgroundColor.changed = true;
            changes.backgroundColor.sourceValue = sourceBg;
            changes.backgroundColor.targetValue = targetBg;
            changes.hasChanges = true;
          }
          
          if (sourceStyle.color !== targetStyle.color) {
            changes.color.changed = true;
            changes.color.sourceValue = sourceStyle.color;
            changes.color.targetValue = targetStyle.color;
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
          
          // Check width changes
          const sourceWidth = parseFloat(sourceStyle.width) || sourceElement.offsetWidth;
          const targetWidth = parseFloat(targetStyle.width) || targetElement.offsetWidth;
          
          if (Math.abs(sourceWidth - targetWidth) > 1) {
            changes.width.changed = true;
            changes.width.sourceValue = sourceWidth;
            changes.width.targetValue = targetWidth;
            changes.hasChanges = true;
          }
          
          // Check height changes
          const sourceHeight = parseFloat(sourceStyle.height) || sourceElement.offsetHeight;
          const targetHeight = parseFloat(targetStyle.height) || targetElement.offsetHeight;
          
          if (Math.abs(sourceHeight - targetHeight) > 1) {
            changes.height.changed = true;
            changes.height.sourceValue = sourceHeight;
            changes.height.targetValue = targetHeight;
            changes.hasChanges = true;
          }
          
          // Check padding changes
          const sourcePaddingLeft = parseFloat(sourceStyle.paddingLeft) || 0;
          const targetPaddingLeft = parseFloat(targetStyle.paddingLeft) || 0;
          if (Math.abs(sourcePaddingLeft - targetPaddingLeft) > 1) {
            changes.paddingLeft.changed = true;
            changes.paddingLeft.sourceValue = sourcePaddingLeft;
            changes.paddingLeft.targetValue = targetPaddingLeft;
            changes.hasChanges = true;
          }
          
          const sourcePaddingRight = parseFloat(sourceStyle.paddingRight) || 0;
          const targetPaddingRight = parseFloat(targetStyle.paddingRight) || 0;
          if (Math.abs(sourcePaddingRight - targetPaddingRight) > 1) {
            changes.paddingRight.changed = true;
            changes.paddingRight.sourceValue = sourcePaddingRight;
            changes.paddingRight.targetValue = targetPaddingRight;
            changes.hasChanges = true;
          }
          
          const sourcePaddingTop = parseFloat(sourceStyle.paddingTop) || 0;
          const targetPaddingTop = parseFloat(targetStyle.paddingTop) || 0;
          if (Math.abs(sourcePaddingTop - targetPaddingTop) > 1) {
            changes.paddingTop.changed = true;
            changes.paddingTop.sourceValue = sourcePaddingTop;
            changes.paddingTop.targetValue = targetPaddingTop;
            changes.hasChanges = true;
          }
          
          const sourcePaddingBottom = parseFloat(sourceStyle.paddingBottom) || 0;
          const targetPaddingBottom = parseFloat(targetStyle.paddingBottom) || 0;
          if (Math.abs(sourcePaddingBottom - targetPaddingBottom) > 1) {
            changes.paddingBottom.changed = true;
            changes.paddingBottom.sourceValue = sourcePaddingBottom;
            changes.paddingBottom.targetValue = targetPaddingBottom;
            changes.hasChanges = true;
          }
          
          // Check margin changes
          const sourceMarginLeft = parseFloat(sourceStyle.marginLeft) || 0;
          const targetMarginLeft = parseFloat(targetStyle.marginLeft) || 0;
          if (Math.abs(sourceMarginLeft - targetMarginLeft) > 1) {
            changes.marginLeft.changed = true;
            changes.marginLeft.sourceValue = sourceMarginLeft;
            changes.marginLeft.targetValue = targetMarginLeft;
            changes.hasChanges = true;
          }
          
          const sourceMarginRight = parseFloat(sourceStyle.marginRight) || 0;
          const targetMarginRight = parseFloat(targetStyle.marginRight) || 0;
          if (Math.abs(sourceMarginRight - targetMarginRight) > 1) {
            changes.marginRight.changed = true;
            changes.marginRight.sourceValue = sourceMarginRight;
            changes.marginRight.targetValue = targetMarginRight;
            changes.hasChanges = true;
          }
          
          const sourceMarginTop = parseFloat(sourceStyle.marginTop) || 0;
          const targetMarginTop = parseFloat(targetStyle.marginTop) || 0;
          if (Math.abs(sourceMarginTop - targetMarginTop) > 1) {
            changes.marginTop.changed = true;
            changes.marginTop.sourceValue = sourceMarginTop;
            changes.marginTop.targetValue = targetMarginTop;
            changes.hasChanges = true;
          }
          
          const sourceMarginBottom = parseFloat(sourceStyle.marginBottom) || 0;
          const targetMarginBottom = parseFloat(targetStyle.marginBottom) || 0;
          if (Math.abs(sourceMarginBottom - targetMarginBottom) > 1) {
            changes.marginBottom.changed = true;
            changes.marginBottom.sourceValue = sourceMarginBottom;
            changes.marginBottom.targetValue = targetMarginBottom;
            changes.hasChanges = true;
          }
          
          // Check opacity changes
          const sourceOpacity = parseFloat(sourceStyle.opacity) || 1;
          const targetOpacity = parseFloat(targetStyle.opacity) || 1;
          if (Math.abs(sourceOpacity - targetOpacity) > 0.01) {
            changes.opacity.changed = true;
            changes.opacity.sourceValue = sourceOpacity;
            changes.opacity.targetValue = targetOpacity;
            changes.hasChanges = true;
          }
          
        } catch (error) {
          // Error handling for property detection
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
            }
          }
        });
        
        return elementsToAnimate;
      }
      
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
        
        // Clean up animated elements - restore original positioning
        elementsToAnimate.forEach(({ element }) => {
          const calculatedEndPosition = element.getAttribute('data-calculated-end-position');
          const originalPosition = element.getAttribute('data-original-position');
          const originalLeft = element.getAttribute('data-original-left');
          const originalTop = element.getAttribute('data-original-top');
          
          if (calculatedEndPosition) {
            // For elements that were recalculated, we need to restore the proper layout
            // Remove relative positioning and let the parent's flexbox handle positioning
            element.style.position = '';
            element.style.left = '';
            element.style.top = '';
          } else {
            // Restore original positioning values
            if (originalPosition !== null) element.style.position = originalPosition;
            if (originalLeft !== null) element.style.left = originalLeft;
            if (originalTop !== null) element.style.top = originalTop;
          }
          
          // Remove stored data
          element.removeAttribute('data-calculated-end-position');
          element.removeAttribute('data-original-position');
          element.removeAttribute('data-original-left');
          element.removeAttribute('data-original-top');
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
      }

      // Helper function to handle variant switching
      function handleVariantSwitching(sourceElement, destination, allVariants, transitionType, transitionDuration) {
        if (transitionType === 'SMART_ANIMATE' || transitionType === 'BOUNCY') {
          
          // Store original destination dimensions for restoration after animation
          const originalDestinationWidth = destination.style.width;
          const originalDestinationHeight = destination.style.height;
          
          // Setup destination for animation
          setupDestinationForAnimation(destination);
          
          // Hide source element during animation to prevent visual conflicts
          sourceElement.style.opacity = '0';
          
          // Find elements with property changes
          const elementsToAnimate = findElementsWithPropertyChanges(destination, sourceElement);
          
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
            
            // Animate each element with changes
            elementsToAnimate.forEach(({ element, sourceElement, changes }) => {
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
                  element.style.position = 'absolute';
                  element.style.left = changes.positionX.sourceValue + 'px';
                }
                if (changes.positionY && changes.positionY.changed) {
                  element.style.position = 'absolute';
                  element.style.top = changes.positionY.sourceValue + 'px';
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
                  
                  if (changes.positionX && changes.positionX.changed) {
                    if (transitionType === 'BOUNCY') {
                      // Use bouncy animation for position changes
                      const startPos = changes.positionX.sourceValue;
                      const endPos = changes.positionX.targetValue;
                      const duration = parseFloat(transitionDuration || '0.3');
                      applyBouncyAnimation(element, startPos, endPos, duration);
                    } else {
                      element.style.left = changes.positionX.targetValue + 'px';
                    }
                  }
                  
                  if (changes.positionY && changes.positionY.changed) {
                    element.style.top = changes.positionY.targetValue + 'px';
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
      function handleReaction(sourceElement, destinationId, transitionType, transitionDuration) {
        
        // Prevent multiple simultaneous transitions
        if (isTransitionInProgress) {
          return;
        }
        
        if (destinationId) {
          const destination = document.querySelector(\`[data-figma-id="\${destinationId}"]\`);
          if (destination) {
            
            // Set transition lock
            isTransitionInProgress = true;
            
            // CRITICAL FIX: Check if this is a variant switch within a component set
            // Find the common parent component set for both source and destination
            const sourceComponentSet = sourceElement.closest('[data-figma-type="COMPONENT_SET"]');
            const destinationComponentSet = destination.closest('[data-figma-type="COMPONENT_SET"]');
            
            // CRITICAL FIX: Handle the case where source is an INSTANCE and destination is a COMPONENT
            // This happens when the instance has a reaction that targets a component within its child component set
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
                
                
                // Start timeout reactions for the newly active destination variant
                startTimeoutReactionsForNewlyActiveVariant(destination);
                // Start timeout reactions for nested components within the destination
                startTimeoutReactionsForNestedComponents(destination);
                
                // Release transition lock
                isTransitionInProgress = false;
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
            }
          }
        }
      }
    `;
}
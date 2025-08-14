import type { 
  AnimationType, 
  TranslationCondition, 
  AnimationChange, 
  ElementAnimationContext,
  AnimationSession
} from './animation-system';

/**
 * Creates a three-phase transition handler that follows the setup, animate, cleanup pattern
 */
export function createThreePhaseTransitionHandler(): string {
  return `
    // Global transition lock to prevent multiple simultaneous transitions
    let isTransitionInProgress = false;
    let currentTransitionPromise = null;
    let currentAnimationSession = null;
    
    // Animation types
    const AnimationType = {
      SIMPLE: 'SIMPLE',
      SIZE: 'SIZE', 
      TRANSFORM: 'TRANSFORM'
    };
    
    // Translation conditions
    const TranslationCondition = {
      ABSOLUTE: 'ABSOLUTE',
      RELATIVE_PADDING: 'RELATIVE_PADDING',
      RELATIVE_ALIGNMENT: 'RELATIVE_ALIGNMENT'
    };
    
    /**
     * PHASE 1: SETUP - Sets initial values on nodes/variants/instances/sets/etc.
     * Primes HTML for animation from variant 1 to 2
     */
    function setupAnimationSession(sourceElement, targetElement, allVariants, transitionType, transitionDuration) {
      console.log('🎬 SETUP PHASE: Initializing animation session');
      
      // Create animation session
      const session = {
        sourceElement,
        targetElement,
        sourceCopy: null,
        allVariants,
        transitionType,
        transitionDuration,
        isActive: true
      };

      // Set initial state for all variants
      allVariants.forEach(variant => {
        if (variant === sourceElement) {
          // Source variant should be visible initially
          variant.classList.add('variant-active');
          variant.classList.remove('variant-hidden');
          variant.style.visibility = 'visible';
          variant.style.opacity = '1';
        } else {
          // All other variants should be hidden
          variant.classList.add('variant-hidden');
          variant.classList.remove('variant-active');
          variant.style.visibility = 'hidden';
          variant.style.opacity = '0';
        }
      });

      // Prepare target variant but keep it hidden
      targetElement.classList.add('variant-active');
      targetElement.classList.remove('variant-hidden');
      targetElement.style.visibility = 'hidden';
      targetElement.style.opacity = '0';

      console.log('✅ SETUP PHASE: Animation session initialized');
      return session;
    }
    
    /**
     * PHASE 2: ANIMATE - Performs copy of source, hides source, animates values if necessary
     */
    async function animateVariantTransition(session) {
      console.log('🎭 ANIMATE PHASE: Starting variant transition animation');
      
      if (!session.isActive) {
        console.log('❌ ANIMATE PHASE: Session is not active, skipping animation');
        return;
      }

      // Create a copy of the source variant
      session.sourceCopy = createElementCopy(session.sourceElement);
      console.log('📋 ANIMATE PHASE: Created source element copy');

      // Insert the copy into the DOM
      const sourceParent = session.sourceElement.parentElement;
      if (sourceParent && session.sourceCopy) {
        sourceParent.appendChild(session.sourceCopy);
        console.log('📋 ANIMATE PHASE: Inserted copy into DOM');
      }

      // Hide the original source element
      session.sourceElement.style.opacity = '0';
      session.sourceElement.style.visibility = 'hidden';

      // Hide all other variants
      session.allVariants.forEach(variant => {
        if (variant !== session.sourceElement) {
          variant.style.opacity = '0';
          variant.style.visibility = 'hidden';
        }
      });

      // Animate the copy to match the destination
      if (session.sourceCopy) {
        await animateCopyToDestination(
          session.sourceCopy,
          session.targetElement,
          session.sourceElement,
          session.transitionType,
          session.transitionDuration
        );
      }

      console.log('✅ ANIMATE PHASE: Animation completed');
    }
    
    /**
     * PHASE 3: CLEANUP - Deletes copy, shows target variant, resets animation system
     */
    function cleanupAnimationSession(session) {
      console.log('🧹 CLEANUP PHASE: Cleaning up animation session');

      // Remove the copy
      if (session.sourceCopy) {
        session.sourceCopy.remove();
        session.sourceCopy = null;
        console.log('🗑️ CLEANUP PHASE: Removed source copy');
      }

      // Hide the original source element permanently
      session.sourceElement.style.opacity = '0';
      session.sourceElement.style.visibility = 'hidden';
      session.sourceElement.classList.add('variant-hidden');
      session.sourceElement.classList.remove('variant-active');

      // Show the destination variant with proper positioning
      session.targetElement.style.visibility = 'visible';
      session.targetElement.style.opacity = '1';
      session.targetElement.style.display = 'flex';
      session.targetElement.classList.add('variant-active');
      session.targetElement.classList.remove('variant-hidden');

      // Reset any absolute positioning that might have been applied during animation
      session.targetElement.style.position = 'relative';
      session.targetElement.style.left = '';
      session.targetElement.style.top = '';
      session.targetElement.style.transform = '';

      // Ensure all nested components within the destination variant are visible
      const nestedElements = session.targetElement.querySelectorAll('[data-figma-id]');
      nestedElements.forEach(nestedElement => {
        if (nestedElement.classList.contains('variant-hidden')) {
          nestedElement.classList.remove('variant-hidden');
        }
        
        if (!nestedElement.classList.contains('variant-hidden')) {
          nestedElement.style.visibility = 'visible';
          nestedElement.style.opacity = '1';
          if (window.getComputedStyle(nestedElement).display === 'none') {
            nestedElement.style.display = 'flex';
          }
        }
      });

      // Hide all other variants
      session.allVariants.forEach(variant => {
        if (variant !== session.targetElement) {
          variant.classList.add('variant-hidden');
          variant.classList.remove('variant-active');
          variant.style.opacity = '0';
          variant.style.visibility = 'hidden';
        }
      });

      // Mark session as inactive
      session.isActive = false;

      console.log('✅ CLEANUP PHASE: Animation session cleaned up');
    }
    
    /**
     * Helper function to create element copy
     */
    function createElementCopy(sourceElement) {
      console.log('📋 Creating element copy for:', sourceElement.getAttribute('data-figma-name') || sourceElement.getAttribute('data-figma-id'));
      
      const copy = sourceElement.cloneNode(true);
      copy.setAttribute('data-figma-id', sourceElement.getAttribute('data-figma-id') + '-copy');
      copy.setAttribute('data-is-animation-copy', 'true');
      
      // Position the copy absolutely over the source element
      const sourceRect = sourceElement.getBoundingClientRect();
      const parentRect = sourceElement.parentElement.getBoundingClientRect();
      
      copy.style.position = 'absolute';
      copy.style.top = (sourceRect.top - parentRect.top) + 'px';
      copy.style.left = (sourceRect.left - parentRect.left) + 'px';
      copy.style.transform = 'none';
      copy.style.margin = '0';
      copy.style.padding = '0';
      
      // Set high z-index
      const allElements = document.querySelectorAll('*');
      let maxZIndex = 0;
      allElements.forEach(el => {
        const zIndex = parseInt(window.getComputedStyle(el).zIndex) || 0;
        if (zIndex > maxZIndex) maxZIndex = zIndex;
      });
      
      const copyZIndex = maxZIndex + 1000;
      copy.style.zIndex = copyZIndex.toString();
      copy.style.pointerEvents = 'none';
      copy.style.transform = 'translateZ(0)';
      copy.style.willChange = 'transform, left, top';
      
      // Preserve original overflow, display, and visibility from source element
      const sourceComputedStyle = window.getComputedStyle(sourceElement);
      copy.style.overflow = sourceComputedStyle.overflow;
      copy.style.display = sourceComputedStyle.display;
      copy.style.visibility = sourceComputedStyle.visibility;
      copy.style.opacity = '1';

      // Ensure all nodes in the copy are visible
      const copyChildren = copy.querySelectorAll('*');
      copyChildren.forEach(child => {
        child.style.opacity = '1';
      });

      console.log('📋 Copy creation completed');
      return copy;
    }
    
    /**
     * Helper function to animate copy to destination
     */
    async function animateCopyToDestination(copy, destination, originalSourceElement, transitionType, transitionDuration) {
      return new Promise((resolve) => {
        // Update copy content to match destination content
        updateCopyContentToMatchDestination(copy, destination);
        
        // Find elements with property changes
        const elementsToAnimate = findElementsWithPropertyChanges(destination, copy, originalSourceElement);
        const easingFunction = getEasingFunction(transitionType);
        const duration = parseFloat(transitionDuration || '0.3');
        
        if (elementsToAnimate.length > 0) {
          console.log('🎭 Animating copy with', elementsToAnimate.length, 'elements');
          
          // Setup animation for each element
          elementsToAnimate.forEach(({ element, changes }) => {
            // Handle nested instance variant switch
            if (changes.isNestedInstanceVariantSwitch) {
              handleNestedInstanceVariantSwitch(element, changes);
              return;
            }
            
            // Apply animation changes
            const animationChanges = convertChangesToAnimationChanges(changes);
            animationChanges.forEach(change => {
              applyAnimationChange(element, change, duration, easingFunction);
            });
          });
          
          // Monitor animation completion
          let completedAnimations = 0;
          const totalAnimations = elementsToAnimate.length;
          
          const onTransitionEnd = (event) => {
            const targetElement = event.target;
            const propertyName = event.propertyName;
            
            const animatedElement = elementsToAnimate.find(({ element }) => 
              targetElement === element || element.contains(targetElement)
            );
            
            if (animatedElement) {
              completedAnimations++;
              if (completedAnimations >= totalAnimations) {
                console.log('🎭 All animations completed');
                copy.removeEventListener('transitionend', onTransitionEnd);
                resolve();
              }
            }
          };
          
          copy.addEventListener('transitionend', onTransitionEnd);
          
          // Fallback timeout
          setTimeout(() => {
            console.log('🎭 Animation completed via timeout');
            copy.removeEventListener('transitionend', onTransitionEnd);
            resolve();
          }, duration * 1000 + 500);
        } else {
          resolve();
        }
      });
    }
    
    /**
     * Helper function to update copy content to match destination
     */
    function updateCopyContentToMatchDestination(copy, destination) {
      console.log('📋 Updating copy content to match destination');
      
      const copyElements = copy.querySelectorAll('[data-figma-id]');
      const destinationElements = destination.querySelectorAll('[data-figma-id]');
      
      // Create a map of destination elements by name
      const destinationElementMap = new Map();
      destinationElements.forEach(element => {
        const name = element.getAttribute('data-figma-name') || element.getAttribute('data-figma-id');
        if (name) {
          destinationElementMap.set(name, element);
        }
      });
      
      // Update each copy element's content to match destination
      copyElements.forEach(copyElement => {
        const copyElementName = copyElement.getAttribute('data-figma-name') || copyElement.getAttribute('data-figma-id');
        const destinationElement = destinationElementMap.get(copyElementName);
        
        if (destinationElement) {
          // Update text content
          if (destinationElement.textContent !== copyElement.textContent) {
            copyElement.textContent = destinationElement.textContent;
          }
          
          // Update innerHTML for more complex content, but preserve positioning
          if (destinationElement.innerHTML !== copyElement.innerHTML) {
            // Preserve positioning before updating content
            const allNestedElements = copyElement.querySelectorAll('[data-figma-id]');
            const originalPositions = new Map();
            
            allNestedElements.forEach(nestedElement => {
              const nestedElementName = nestedElement.getAttribute('data-figma-name') || nestedElement.getAttribute('data-figma-id');
              const computedStyle = window.getComputedStyle(nestedElement);
              originalPositions.set(nestedElementName, {
                position: computedStyle.position,
                left: computedStyle.left,
                top: computedStyle.top,
                transform: computedStyle.transform
              });
            });
            
            // Also preserve the copy element itself
            const copyComputedStyle = window.getComputedStyle(copyElement);
            originalPositions.set(copyElementName, {
              position: copyComputedStyle.position,
              left: copyComputedStyle.left,
              top: copyComputedStyle.top,
              transform: copyComputedStyle.transform
            });
            
            // Update the innerHTML
            copyElement.innerHTML = destinationElement.innerHTML;
            
            // Restore positioning after content update
            originalPositions.forEach((positionData, elementName) => {
              const elementToRestore = elementName === copyElementName ? 
                copyElement : 
                copyElement.querySelector('[data-figma-name="' + elementName + '"]') ||
                copyElement.querySelector('[data-figma-id="' + elementName + '"]');
              
              if (elementToRestore) {
                elementToRestore.style.position = positionData.position;
                elementToRestore.style.left = positionData.left;
                elementToRestore.style.top = positionData.top;
                elementToRestore.style.transform = positionData.transform;
              }
            });
          }
          
          // Update specific attributes that might contain content
          const contentAttributes = ['data-content', 'data-text', 'title', 'alt'];
          contentAttributes.forEach(attr => {
            const destValue = destinationElement.getAttribute(attr);
            const copyValue = copyElement.getAttribute(attr);
            if (destValue !== copyValue && destValue !== null) {
              copyElement.setAttribute(attr, destValue);
            }
          });
        }
      });
      
      // Ensure all elements in the copy have opacity 1
      const allCopyElements = copy.querySelectorAll('*');
      allCopyElements.forEach(element => {
        element.style.opacity = '1';
      });
    }
    
    /**
     * Helper function to find elements with property changes between variants
     */
    function findElementsWithPropertyChanges(targetVariant, currentVariant, originalSourceVariant) {
      console.log('🔍 Finding elements with property changes');
      
      // Check if this is a nested instance with internal variants
      let isNestedInstance = false;
      let parentInstance = null;
      let parentComponentSet = null;
      
      if (originalSourceVariant) {
        parentComponentSet = originalSourceVariant.closest('[data-figma-type="COMPONENT_SET"]');
        if (parentComponentSet) {
          parentInstance = parentComponentSet.closest('[data-figma-type="INSTANCE"]');
          if (parentInstance) {
            isNestedInstance = true;
            console.log('🔍 Detected nested instance structure');
          }
        }
      }
      
      if (isNestedInstance) {
        console.log('🔍 Handling nested instance variant switch');
        
        const sourceComponentSet = parentComponentSet;
        const targetComponentSet = targetVariant.querySelector('[data-figma-type="COMPONENT_SET"]');
        
        if (sourceComponentSet && targetComponentSet) {
          const sourceActiveVariant = sourceComponentSet.querySelector('.variant-active');
          const targetActiveVariant = targetComponentSet.querySelector('.variant-active');
          
          if (sourceActiveVariant && targetActiveVariant) {
            return [{
              element: parentInstance || currentVariant,
              sourceElement: parentInstance || originalSourceVariant,
              changes: {
                hasChanges: true,
                isNestedInstanceVariantSwitch: true,
                sourceVariant: sourceActiveVariant,
                targetVariant: targetActiveVariant
              }
            }];
          }
        }
      }
      
      const targetElements = targetVariant.querySelectorAll('[data-figma-id]');
      const sourceElements = currentVariant.querySelectorAll('[data-figma-id]');
      const sourceElementMap = new Map();
      const elementsToAnimate = [];

      // Build source element map by name
      sourceElements.forEach(sourceElement => {
        const sourceName = sourceElement.getAttribute('data-figma-name') || sourceElement.getAttribute('data-figma-id');
        if (sourceName) {
          sourceElementMap.set(sourceName, sourceElement);
        }
      });

      // Check for parent alignment changes first
      const parentAlignmentChanges = [];
      targetElements.forEach(element => {
        const targetName = element.getAttribute('data-figma-name') || element.getAttribute('data-figma-id');
        const sourceElement = sourceElementMap.get(targetName);
        
        if (sourceElement) {
          const sourceParent = sourceElement.parentElement;
          const targetParent = element.parentElement;
          
          if (sourceParent && targetParent) {
            const sourceParentStyle = window.getComputedStyle(sourceParent);
            const targetParentStyle = window.getComputedStyle(targetParent);
            
            if (sourceParentStyle.justifyContent !== targetParentStyle.justifyContent ||
                sourceParentStyle.alignItems !== targetParentStyle.alignItems) {
              
              const parentChanges = {
                hasChanges: true,
                justifyContent: { 
                  changed: sourceParentStyle.justifyContent !== targetParentStyle.justifyContent,
                  sourceValue: sourceParentStyle.justifyContent,
                  targetValue: targetParentStyle.justifyContent
                },
                alignItems: { 
                  changed: sourceParentStyle.alignItems !== targetParentStyle.alignItems,
                  sourceValue: sourceParentStyle.alignItems,
                  targetValue: targetParentStyle.alignItems
                }
              };
              
              parentAlignmentChanges.push({
                element: sourceElement,
                sourceElement: sourceElement,
                changes: parentChanges
              });
            }
          }
        }
      });
      
      // If we found parent alignment changes, prioritize those
      if (parentAlignmentChanges.length > 0) {
        elementsToAnimate.push(...parentAlignmentChanges);
      } else {
        // Check for child position changes
        targetElements.forEach(element => {
          const targetName = element.getAttribute('data-figma-name') || element.getAttribute('data-figma-id');
          const sourceElement = sourceElementMap.get(targetName);
          
          if (sourceElement) {
            const changes = detectPropertyChanges(element, sourceElement, originalSourceVariant);
            
            if (changes.hasChanges) {
              elementsToAnimate.push({
                element: sourceElement,
                sourceElement: sourceElement,
                changes: changes
              });
            }
          }
        });
      }
      
      console.log('🔍 Found', elementsToAnimate.length, 'elements to animate');
      return elementsToAnimate;
    }
    
    /**
     * Helper function to detect property changes between elements
     */
    function detectPropertyChanges(targetElement, sourceElement, originalSourceVariant) {
      const changes = {
        hasChanges: false,
        positionX: { changed: false, sourceValue: null, targetValue: null },
        positionY: { changed: false, sourceValue: null, targetValue: null },
        backgroundColor: { changed: false, sourceValue: null, targetValue: null },
        color: { changed: false, sourceValue: null, targetValue: null },
        justifyContent: { changed: false, sourceValue: null, targetValue: null },
        alignItems: { changed: false, sourceValue: null, targetValue: null }
      };

      try {
        const sourceStyle = window.getComputedStyle(sourceElement);
        const targetStyle = window.getComputedStyle(targetElement);
        
        // Check for parent alignment changes first
        const sourceParent = sourceElement.parentElement;
        const targetParent = targetElement.parentElement;
        
        if (sourceParent && targetParent) {
          const sourceParentStyle = window.getComputedStyle(sourceParent);
          const targetParentStyle = window.getComputedStyle(targetParent);
          
          if (sourceParentStyle.justifyContent !== targetParentStyle.justifyContent ||
              sourceParentStyle.alignItems !== targetParentStyle.alignItems) {
            
            changes.hasChanges = true;
            changes.justifyContent = { 
              changed: sourceParentStyle.justifyContent !== targetParentStyle.justifyContent,
              sourceValue: sourceParentStyle.justifyContent,
              targetValue: targetParentStyle.justifyContent
            };
            changes.alignItems = { 
              changed: sourceParentStyle.alignItems !== targetParentStyle.alignItems,
              sourceValue: sourceParentStyle.alignItems,
              targetValue: targetParentStyle.alignItems
            };
            
            return changes;
          }
        }
      } catch (error) {
        console.log('Error in parent alignment check:', error);
      }

      try {
        const sourceStyle = window.getComputedStyle(sourceElement);
        const targetStyle = window.getComputedStyle(targetElement);
        
        // Use Figma coordinates directly for comparison
        const sourceFigmaY = parseFloat(originalSourceElement.getAttribute('data-figma-y')) || 0;
        const targetFigmaY = parseFloat(targetElement.getAttribute('data-figma-y')) || 0;
        const sourceFigmaX = parseFloat(originalSourceElement.getAttribute('data-figma-x')) || 0;
        const targetFigmaX = parseFloat(targetElement.getAttribute('data-figma-x')) || 0;
        
        const sourceRelativeLeft = sourceFigmaX;
        const sourceRelativeTop = sourceFigmaY;
        const targetRelativeLeft = targetFigmaX;
        const targetRelativeTop = targetFigmaY;
        
        // Check if the node has ignore auto layout enabled
        const ignoreAutoLayout = sourceElement.getAttribute('data-layout-positioning') === 'ABSOLUTE';
        
        // Check if the node's parent has auto layout
        const parentHasAutoLayout = sourceParent && targetParent && 
          sourceParent.getAttribute('data-layout-mode') && 
          sourceParent.getAttribute('data-layout-mode') !== 'NONE';
        
        // Determine if this node should be animated
        let shouldAnimatePosition = false;
        
        if (Math.abs(sourceRelativeLeft - targetRelativeLeft) > 1 || Math.abs(sourceRelativeTop - targetRelativeTop) > 1) {
          if (ignoreAutoLayout || !parentHasAutoLayout) {
            shouldAnimatePosition = true;
          } else {
            shouldAnimatePosition = true;
          }
        }
        
        // Apply position changes if animation is needed
        if (shouldAnimatePosition) {
          if (Math.abs(sourceRelativeLeft - targetRelativeLeft) > 1) {
            changes.positionX.changed = true;
            changes.positionX.sourceValue = 0;
            changes.positionX.targetValue = targetRelativeLeft - sourceRelativeLeft;
            changes.hasChanges = true;
          }
          
          if (Math.abs(sourceRelativeTop - targetRelativeTop) > 1) {
            changes.positionY.changed = true;
            changes.positionY.sourceValue = 0;
            changes.positionY.targetValue = targetRelativeTop - sourceRelativeTop;
            changes.hasChanges = true;
          }
        }

        // Check style changes (non-position)
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
        
        // Check alignment changes
        if (sourceStyle.justifyContent !== targetStyle.justifyContent) {
          changes.justifyContent.changed = true;
          changes.justifyContent.sourceValue = sourceStyle.justifyContent;
          changes.justifyContent.targetValue = targetStyle.justifyContent;
          
          if (shouldAnimatePosition) {
            changes.hasChanges = true;
          }
        }
        
        if (sourceStyle.alignItems !== targetStyle.alignItems) {
          changes.alignItems.changed = true;
          changes.alignItems.sourceValue = sourceStyle.alignItems;
          changes.alignItems.targetValue = targetStyle.alignItems;
          
          if (shouldAnimatePosition) {
            changes.hasChanges = true;
          }
        }
        
      } catch (error) {
        console.log('Error detecting property changes:', error);
      }

      return changes;
    }
    
    /**
     * Helper function to handle nested instance variant switch
     */
    function handleNestedInstanceVariantSwitch(element, changes) {
      console.log('🔄 Handling nested instance variant switch');
      
      const sourceComponentSet = element.querySelector('[data-figma-type="COMPONENT_SET"]');
      if (sourceComponentSet) {
        // Hide current active variant
        const currentActiveVariant = sourceComponentSet.querySelector('.variant-active');
        if (currentActiveVariant) {
          currentActiveVariant.classList.remove('variant-active');
          currentActiveVariant.classList.add('variant-hidden');
        }
        
        // Show target variant
        const targetVariant = changes.targetVariant;
        if (targetVariant) {
          targetVariant.classList.add('variant-active');
          targetVariant.classList.remove('variant-hidden');
        }
      }
    }
    
    /**
     * Helper function to convert changes to animation changes
     */
    function convertChangesToAnimationChanges(changes) {
      const animationChanges = [];
      
      // Handle position changes - use combined transform for simultaneous X and Y movement
      const hasPositionX = changes.positionX && changes.positionX.changed;
      const hasPositionY = changes.positionY && changes.positionY.changed;
      
      if (hasPositionX || hasPositionY) {
        const translateX = hasPositionX ? changes.positionX.targetValue : 0;
        const translateY = hasPositionY ? changes.positionY.targetValue : 0;
        
        animationChanges.push({
          type: AnimationType.TRANSFORM,
          property: 'translate',
          sourceValue: { x: 0, y: 0 },
          targetValue: { x: translateX, y: translateY },
          changed: true,
          translationCondition: TranslationCondition.ABSOLUTE
        });
      }
      
      // Handle color changes
      if (changes.backgroundColor && changes.backgroundColor.changed) {
        animationChanges.push({
          type: AnimationType.SIMPLE,
          property: 'backgroundColor',
          sourceValue: changes.backgroundColor.sourceValue,
          targetValue: changes.backgroundColor.targetValue,
          changed: true
        });
      }
      
      if (changes.color && changes.color.changed) {
        animationChanges.push({
          type: AnimationType.SIMPLE,
          property: 'color',
          sourceValue: changes.color.sourceValue,
          targetValue: changes.color.targetValue,
          changed: true
        });
      }
      
      return animationChanges;
    }
    
    /**
     * Helper function to apply animation changes
     */
    function applyAnimationChange(element, change, duration, easing) {
      const { type, property, targetValue, translationCondition } = change;
      
      console.log('🎭 Applying animation change:', { type, property, targetValue, translationCondition });
      
      // Get transition property
      let transitionProperty = property;
      if (type === AnimationType.TRANSFORM) {
        if (translationCondition === TranslationCondition.ABSOLUTE) {
          transitionProperty = property === 'translateX' ? 'left' : 'top';
        } else if (translationCondition === TranslationCondition.RELATIVE_PADDING) {
          transitionProperty = property.replace('parent_', '');
        } else if (translationCondition === TranslationCondition.RELATIVE_ALIGNMENT) {
          transitionProperty = property.replace('parent_', '');
        }
      }
      
      // Set up transition
      element.style.transition = \`\${transitionProperty} \${duration}s \${easing}\`;
      
      // Apply the change based on type and condition
      switch (type) {
        case AnimationType.SIMPLE:
          element.style[property] = targetValue;
          break;
          
        case AnimationType.SIZE:
          element.style[property] = \`\${targetValue}px\`;
          break;
          
        case AnimationType.TRANSFORM:
          if (translationCondition === TranslationCondition.ABSOLUTE) {
            if (change.isCombinedTransform && property === 'translate') {
              // Handle combined X and Y transform for simultaneous movement
              const { x: translateX, y: translateY } = targetValue;
              
              // Use CSS transform for hardware-accelerated simultaneous animation
              element.style.transition = \`transform \${duration}s \${easing}\`;
              element.style.transform = \`translate(\${translateX}px, \${translateY}px)\`;
            } else if (property === 'translateX') {
              // For additive position changes, add the difference to current position
              const currentLeft = parseFloat(element.style.left) || 0;
              const newLeft = currentLeft + targetValue;
              element.style.left = \`\${newLeft}px\`;
            } else if (property === 'translateY') {
              // For additive position changes, add the difference to current position
              const currentTop = parseFloat(element.style.top) || 0;
              const newTop = currentTop + targetValue;
              element.style.top = \`\${newTop}px\`;
            }
          } else if (translationCondition === TranslationCondition.RELATIVE_PADDING) {
            if (element.parentElement) {
              const paddingProperty = property.replace('parent_', '');
              element.parentElement.style[paddingProperty] = \`\${targetValue}px\`;
            }
          } else if (translationCondition === TranslationCondition.RELATIVE_ALIGNMENT) {
            if (property === 'alignTranslateX') {
              element.style.left = \`\${targetValue}%\`;
            } else if (property === 'alignTranslateY') {
              element.style.top = \`\${targetValue}%\`;
            } else if (property.startsWith('parent_')) {
              if (element.parentElement) {
                const alignmentProperty = property.replace('parent_', '');
                element.parentElement.style[alignmentProperty] = targetValue;
              }
            } else {
              element.style[property] = targetValue;
            }
          }
          break;
      }
      
      console.log('🎭 Applied change:', { property, transitionProperty, targetValue });
    }
    
    /**
     * Helper function to get easing function
     */
    function getEasingFunction(animationType) {
      switch (animationType) {
        case 'EASE_IN_AND_OUT_BACK':
          return 'cubic-bezier(0.68, -0.6, 0.32, 1.6)';
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
          return 'ease-in-out';
        case 'SMART_ANIMATE':
          return 'ease-in-out';
        default:
          return 'ease-out';
      }
    }
    
    /**
     * Main function to handle animated variant switching using the three-phase system
     */
    async function handleAnimatedVariantSwitch(sourceElement, destination, allVariants, transitionType, transitionDuration) {
      console.log('🔄 THREE-PHASE VARIANT SWITCH START:', {
        sourceId: sourceElement.getAttribute('data-figma-id'),
        sourceName: sourceElement.getAttribute('data-figma-name'),
        destinationId: destination.getAttribute('data-figma-id'),
        destinationName: destination.getAttribute('data-figma-name'),
        transitionType: transitionType,
        transitionDuration: transitionDuration,
        totalVariants: allVariants.length
      });
      
      // Check if transition is already in progress
      if (isTransitionInProgress) {
        console.log('❌ Transition already in progress, skipping');
        return;
      }
      
      isTransitionInProgress = true;
      
      try {
        // PHASE 1: SETUP
        const session = setupAnimationSession(sourceElement, destination, allVariants, transitionType, transitionDuration);
        currentAnimationSession = session;
        
        // PHASE 2: ANIMATE
        await animateVariantTransition(session);
        
        // PHASE 3: CLEANUP
        cleanupAnimationSession(session);
        
        // Start timeout reactions for the new active variant
        if (window.startTimeoutReactionsForNewlyActiveVariant) {
          window.startTimeoutReactionsForNewlyActiveVariant(destination);
        }
        if (window.startTimeoutReactionsForNestedComponents) {
          window.startTimeoutReactionsForNestedComponents(destination);
        }
        
        console.log('✅ THREE-PHASE VARIANT SWITCH COMPLETED');
        
      } catch (error) {
        console.error('❌ Error during three-phase variant switch:', error);
        
        // Cleanup on error
        if (currentAnimationSession) {
          cleanupAnimationSession(currentAnimationSession);
        }
      } finally {
        isTransitionInProgress = false;
        currentAnimationSession = null;
      }
    }
    
    /**
     * Function to perform instant variant switch (no animation)
     */
    function performInstantVariantSwitch(allVariants, destination) {
      console.log('⚡ PERFORMING INSTANT VARIANT SWITCH');
      
      // Hide all variants
      allVariants.forEach(variant => {
        variant.classList.add('variant-hidden');
        variant.classList.remove('variant-active');
        variant.style.display = 'none';
        variant.style.visibility = 'hidden';
        variant.style.opacity = '0';
        if (!variant.style.position || variant.style.position === 'static') {
          variant.style.position = 'relative';
        }
      });
      
      // Show destination variant
      destination.classList.add('variant-active');
      destination.classList.remove('variant-hidden');
      destination.style.display = 'flex';
      destination.style.visibility = 'visible';
      destination.style.opacity = '1';
      if (!destination.style.position || destination.style.position === 'static') {
        destination.style.position = 'relative';
      }
      
      console.log('✅ INSTANT VARIANT SWITCH COMPLETED');
      
      // Start timeout reactions
      if (window.startTimeoutReactionsForNewlyActiveVariant) {
        window.startTimeoutReactionsForNewlyActiveVariant(destination);
      }
      if (window.startTimeoutReactionsForNestedComponents) {
        window.startTimeoutReactionsForNestedComponents(destination);
      }
    }
    
    // Export the main function for external use
    window.handleAnimatedVariantSwitch = handleAnimatedVariantSwitch;
    window.performInstantVariantSwitch = performInstantVariantSwitch;
    
    console.log('✅ Three-phase transition handler loaded');
  `;
}

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

      // CRITICAL FIX: Reset all variants to a clean state first
      allVariants.forEach(variant => {
        // Reset any residual styling from previous animations
        variant.style.position = 'relative';
        variant.style.left = '';
        variant.style.top = '';
        variant.style.transform = '';
        variant.style.transition = '';
        
        // Reset all nested elements within each variant
        const nestedElements = variant.querySelectorAll('[data-figma-id]');
        nestedElements.forEach(nestedElement => {
          nestedElement.style.position = 'relative';
          nestedElement.style.left = '';
          nestedElement.style.top = '';
          nestedElement.style.transform = '';
          nestedElement.style.transition = '';
        });
      });

      // Set initial state for all variants - only use display
      allVariants.forEach(variant => {
        if (variant === sourceElement) {
          // Source variant should be visible initially
          variant.classList.add('variant-active');
          variant.classList.remove('variant-hidden');
          variant.style.display = 'flex';
        } else {
          // All other variants should be hidden
          variant.classList.add('variant-hidden');
          variant.classList.remove('variant-active');
          variant.style.display = 'none';
        }
      });

      // Prepare target variant but keep it hidden
      targetElement.classList.add('variant-active');
      targetElement.classList.remove('variant-hidden');
      targetElement.style.display = 'none';

      // PHASE 1 IMPROVEMENT: Create copy in setup but keep it hidden
      session.sourceCopy = createElementCopy(session.sourceElement);
      console.log('📋 SETUP PHASE: Created source element copy (hidden)');
      console.log('🔍 DEBUG: Copy after creation - children:', session.sourceCopy ? session.sourceCopy.children.length : 'null');
      console.log('🔍 DEBUG: Copy after creation - innerHTML length:', session.sourceCopy ? session.sourceCopy.innerHTML.length : 'null');
      
      // Insert the copy into the DOM but keep it hidden
      const sourceParent = session.sourceElement.parentElement;
      if (sourceParent && session.sourceCopy) {
        console.log('🔍 DEBUG: About to insert copy. Source parent:', sourceParent.tagName, sourceParent.getAttribute('data-figma-id'));
        console.log('🔍 DEBUG: Copy element before insertion:', session.sourceCopy.tagName, session.sourceCopy.getAttribute('data-figma-id'));
        
        sourceParent.insertBefore(session.sourceCopy, session.sourceElement);
        
        console.log('🔍 DEBUG: Copy inserted. Checking DOM...');
        console.log('🔍 DEBUG: Copy in DOM after insertion:', document.contains(session.sourceCopy));
        console.log('🔍 DEBUG: Copy parent after insertion:', session.sourceCopy.parentElement ? session.sourceCopy.parentElement.tagName : 'null');
        console.log('🔍 DEBUG: Copy next sibling:', session.sourceCopy.nextElementSibling ? session.sourceCopy.nextElementSibling.getAttribute('data-figma-id') : 'null');
        console.log('🔍 DEBUG: Copy previous sibling:', session.sourceCopy.previousElementSibling ? session.sourceCopy.previousElementSibling.getAttribute('data-figma-id') : 'null');
        
        hideCopy(session.sourceCopy, 'setup phase - keeping hidden until animation starts');
        console.log('📋 SETUP PHASE: Inserted copy into DOM (hidden)');
        console.log('🔍 DEBUG: Copy after insertion - parent:', session.sourceCopy.parentElement ? 'exists' : 'null');
        console.log('🔍 DEBUG: Copy after insertion - display:', session.sourceCopy.style.display);
      } else {
        console.log('❌ ERROR: Cannot insert copy - sourceParent:', !!sourceParent, 'session.sourceCopy:', !!session.sourceCopy);
      }

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

      // PHASE 2 IMPROVEMENT: Show the copy and hide the source
      if (session.sourceCopy) {
        // Show the copy that was created in setup phase using enhanced display control
        showCopy(session.sourceCopy, 'animate phase - starting animation');
        console.log('📋 ANIMATE PHASE: Showed copy (created in setup phase)');
      }

      // Hide the original source element - only use display
      session.sourceElement.style.display = 'none';
      console.log('📋 ANIMATE PHASE: Hidden source element');
      console.log('🔍 DEBUG: Source element display:', session.sourceElement.style.display);
      
      // ENHANCED DISPLAY CONTROL: Detailed copy status logging
      const copyStatus = getCopyDisplayStatus(session.sourceCopy);
      console.log('🔍 DEBUG: Copy display status:', copyStatus);
      console.log('🔍 DEBUG: Copy element children count:', session.sourceCopy ? session.sourceCopy.children.length : 'null');
      console.log('🔍 DEBUG: Copy element innerHTML length:', session.sourceCopy ? session.sourceCopy.innerHTML.length : 'null');

      // Hide all other variants - only use display
      session.allVariants.forEach(variant => {
        if (variant !== session.sourceElement) {
          variant.style.display = 'none';
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
      console.log('🔄 PHASE TRANSITION: Animate → Cleanup');
    }
    
    /**
     * PHASE 3: CLEANUP - Deletes copy, shows target variant, resets animation system
     */
    function cleanupAnimationSession(session) {
      console.log('🧹 CLEANUP PHASE: Starting cleanup');
      console.log('🧹 CLEANUP PHASE: Removing copy and showing target variant');

      // Remove the copy (proper three-phase cleanup)
      if (session.sourceCopy) {
        console.log('🔍 DEBUG: About to remove copy. Copy in DOM:', document.contains(session.sourceCopy));
        console.log('🔍 DEBUG: Copy parent before removal:', session.sourceCopy.parentElement ? session.sourceCopy.parentElement.tagName : 'null');
        console.log('🔍 DEBUG: Copy final transform:', window.getComputedStyle(session.sourceCopy).transform);
        console.log('🔍 DEBUG: Copy final position:', {
          left: window.getComputedStyle(session.sourceCopy).left,
          top: window.getComputedStyle(session.sourceCopy).top,
          position: window.getComputedStyle(session.sourceCopy).position
        });
        console.log('🔍 DEBUG: Copy visibility before removal:', isCopyVisible(session.sourceCopy) ? 'visible' : 'hidden');
        
        // Log the final state of Frame 1232 in the copy before removal
        const frame1232InCopy = session.sourceCopy.querySelector('[data-figma-name="Frame 1232"]');
        if (frame1232InCopy) {
          console.log('🔍 DEBUG: Frame 1232 in copy final transform:', window.getComputedStyle(frame1232InCopy).transform);
          console.log('🔍 DEBUG: Frame 1232 in copy final style.transform:', frame1232InCopy.style.transform);
        }
        
        // ENHANCED DISPLAY CONTROL: Hide copy before removal for cleaner cleanup
        hideCopy(session.sourceCopy, 'cleanup phase - hiding before removal');
        
        session.sourceCopy.remove();
        session.sourceCopy = null;
        console.log('🗑️ CLEANUP PHASE: Removed source copy');
      } else {
        console.log('❌ ERROR: No copy to remove in cleanup phase');
      }

      // Hide the original source element permanently - only use display
      session.sourceElement.style.display = 'none';
      session.sourceElement.classList.add('variant-hidden');
      session.sourceElement.classList.remove('variant-active');

      // CRITICAL FIX: Reset all variants to a clean state before showing the destination
      // BUT DO NOT clear transforms from the copy - leave it in final animated state
      session.allVariants.forEach(variant => {
        // Reset any residual styling from animations
        variant.style.position = 'relative';
        variant.style.left = '';
        variant.style.top = '';
        variant.style.transform = '';
        variant.style.transition = '';
        
        // Reset all nested elements within each variant
        // BUT EXCLUDE the copy element - don't clear its transforms
        const nestedElements = variant.querySelectorAll('[data-figma-id]');
        nestedElements.forEach(nestedElement => {
          // Skip if this is part of the copy element
          if (nestedElement.closest('[data-is-animation-copy="true"]')) {
            console.log('🔍 DEBUG: Skipping transform clear for copy element:', nestedElement.getAttribute('data-figma-name'));
            return;
          }
          
          nestedElement.style.position = 'relative';
          nestedElement.style.left = '';
          nestedElement.style.top = '';
          nestedElement.style.transform = '';
          nestedElement.style.transition = '';
        });
      });
      


      // Show the destination variant with proper positioning - only use display
      session.targetElement.style.display = 'flex';
      session.targetElement.classList.add('variant-active');
      session.targetElement.classList.remove('variant-hidden');

      // Reset any absolute positioning that might have been applied during animation
      session.targetElement.style.position = 'relative';
      session.targetElement.style.left = '';
      session.targetElement.style.top = '';
      session.targetElement.style.transform = '';

      // Ensure all nested components within the destination variant are visible - only use display
      const nestedElements = session.targetElement.querySelectorAll('[data-figma-id]');
      nestedElements.forEach(nestedElement => {
        if (nestedElement.classList.contains('variant-hidden')) {
          nestedElement.classList.remove('variant-hidden');
        }
        
        if (!nestedElement.classList.contains('variant-hidden')) {
          if (window.getComputedStyle(nestedElement).display === 'none') {
            nestedElement.style.display = 'flex';
          }
        }
      });

      // Hide all other variants - only use display
      session.allVariants.forEach(variant => {
        if (variant !== session.targetElement) {
          variant.classList.add('variant-hidden');
          variant.classList.remove('variant-active');
          variant.style.display = 'none';
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
      
      // CRITICAL FIX: Inherit exact positioning from source element to prevent visual glitches
      const sourceComputedStyle = window.getComputedStyle(sourceElement);
      copy.style.position = sourceComputedStyle.position;
      copy.style.left = sourceComputedStyle.left;
      copy.style.top = sourceComputedStyle.top;
      copy.style.right = sourceComputedStyle.right;
      copy.style.bottom = sourceComputedStyle.bottom;
      copy.style.margin = '0';
      copy.style.padding = '0';
      copy.style.pointerEvents = 'none';
      copy.style.willChange = 'transform, left, top';
      copy.style.zIndex = sourceComputedStyle.zIndex;
      
      // ENHANCED DISPLAY CONTROL: Initialize copy as hidden
      copy.style.display = 'none';
      
      // CRITICAL FIX: Only use display for visibility, never opacity or visibility
      // Remove any opacity or visibility styles that might have been inherited
      copy.style.opacity = '';
      copy.style.visibility = '';

      console.log('📋 Copy creation completed');
      return copy;
    }
    
    /**
     * ENHANCED DISPLAY CONTROL: Show copy element
     */
    function showCopy(copy, reason = '') {
      if (!copy) {
        console.log('❌ ERROR: Cannot show copy - copy element is null');
        return;
      }
      
      // Determine the appropriate display value based on the original source element
      const sourceElement = document.querySelector('[data-figma-id="' + copy.getAttribute('data-figma-id').replace('-copy', '') + '"]');
      let displayValue = 'flex'; // Default fallback
      
      if (sourceElement) {
        const sourceComputedStyle = window.getComputedStyle(sourceElement);
        displayValue = sourceComputedStyle.display;
      }
      
      copy.style.display = displayValue;
      console.log('👁️ DISPLAY CONTROL: Showed copy element' + (reason ? ' (' + reason + ')' : ''));
      console.log('🔍 DEBUG: Copy display set to:', displayValue);
    }
    
    /**
     * ENHANCED DISPLAY CONTROL: Hide copy element
     */
    function hideCopy(copy, reason = '') {
      if (!copy) {
        console.log('❌ ERROR: Cannot hide copy - copy element is null');
        return;
      }
      
      copy.style.display = 'none';
      console.log('🙈 DISPLAY CONTROL: Hidden copy element' + (reason ? ' (' + reason + ')' : ''));
    }
    
    /**
     * ENHANCED DISPLAY CONTROL: Check if copy is visible
     */
    function isCopyVisible(copy) {
      if (!copy) return false;
      
      const computedStyle = window.getComputedStyle(copy);
      return computedStyle.display !== 'none';
    }
    
    /**
     * ENHANCED DISPLAY CONTROL: Get copy display status for debugging
     */
    function getCopyDisplayStatus(copy) {
      if (!copy) {
        return {
          exists: false,
          visible: false,
          display: 'null',
          computedDisplay: 'null'
        };
      }
      
      const computedStyle = window.getComputedStyle(copy);
      return {
        exists: true,
        visible: isCopyVisible(copy),
        display: copy.style.display,
        computedDisplay: computedStyle.display,
        inDOM: document.contains(copy)
      };
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
            // Handle nested instance variant switch as additional step (not replacement)
            if (changes.isNestedInstanceVariantSwitch) {
              handleNestedInstanceVariantSwitch(element, changes);
            }
            
            // Always apply movement animations (even for nested instances)
            const animationChanges = convertChangesToAnimationChanges(changes, element, originalSourceElement, destination);
            animationChanges.forEach(change => {
              applyAnimationChange(element, change, duration, easingFunction);
            });
          });
          
          // Monitor animation completion
          const completedElements = new Set();
          const totalAnimations = elementsToAnimate.length;
          
          const onTransitionEnd = (event) => {
            const targetElement = event.target;
            const propertyName = event.propertyName;
            
            console.log('🎭 Transition end event fired:', {
              target: targetElement.getAttribute('data-figma-name') || targetElement.getAttribute('data-figma-id'),
              propertyName: propertyName,
              currentTransform: window.getComputedStyle(targetElement).transform
            });
            
            // Find which animated element this transition belongs to
            const animatedElement = elementsToAnimate.find(({ element }) => 
              targetElement === element || element.contains(targetElement)
            );
            
            if (animatedElement) {
              completedElements.add(animatedElement.element);
              console.log('🎭 Element animation completed:', animatedElement.element.getAttribute('data-figma-name') || animatedElement.element.getAttribute('data-figma-id'), 'Completed:', completedElements.size, '/', totalAnimations);
              
              if (completedElements.size >= totalAnimations) {
                console.log('🎭 All animations completed');
                // Remove all event listeners
                elementsToAnimate.forEach(({ element }) => {
                  element.removeEventListener('transitionend', onTransitionEnd);
                });
                resolve();
              }
            }
          };
          
          // Attach transitionend listener to each animated element
          elementsToAnimate.forEach(({ element }) => {
            console.log('🎭 Attaching transitionend listener to:', element.getAttribute('data-figma-name') || element.getAttribute('data-figma-id'));
            element.addEventListener('transitionend', onTransitionEnd);
          });
          
          // Fallback timeout
          setTimeout(() => {
            console.log('🎭 Animation completed via timeout');
            // Remove all event listeners
            elementsToAnimate.forEach(({ element }) => {
              element.removeEventListener('transitionend', onTransitionEnd);
            });
            resolve();
          }, duration * 1000 + 3000);
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
      
      // Note: Nested instance detection is logged but doesn't bypass movement animations
      if (isNestedInstance) {
        console.log('🔍 Detected nested instance structure - will handle both movement and internal variant switching');
      }
      
      const targetElements = targetVariant.querySelectorAll('[data-figma-id]');
      const sourceElements = currentVariant.querySelectorAll('[data-figma-id]');
      const sourceElementMap = new Map();
      const elementsToAnimate = [];

      console.log('🔍 DEBUG: Found', targetElements.length, 'target elements and', sourceElements.length, 'source elements');

      // Build source element map by name
      sourceElements.forEach(sourceElement => {
        const sourceName = sourceElement.getAttribute('data-figma-name') || sourceElement.getAttribute('data-figma-id');
        if (sourceName) {
          sourceElementMap.set(sourceName, sourceElement);
          console.log('🔍 DEBUG: Mapped source element:', sourceName);
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
              
              // Find all children of the parent that should be animated
              const parentElement = sourceElement.parentElement;
              const childrenToAnimate = parentElement ? Array.from(parentElement.children) : [];
              
              childrenToAnimate.forEach(child => {
                parentAlignmentChanges.push({
                  element: child, // Animate the child, not the parent
                  sourceElement: child,
                  changes: parentChanges
                });
              });
            }
          }
        }
      });
      
      // Check for child position changes regardless of parent alignment changes
      console.log('🔍 DEBUG: About to check', targetElements.length, 'child elements for position changes');
      targetElements.forEach(element => {
          const targetName = element.getAttribute('data-figma-name') || element.getAttribute('data-figma-id');
          const sourceElement = sourceElementMap.get(targetName);
          
          console.log('🔍 DEBUG: Processing element in forEach:', targetName);
          console.log('🔍 DEBUG: Target element data-figma-y:', element.getAttribute('data-figma-y'));
          console.log('🔍 DEBUG: Checking element:', targetName, 'sourceElement found:', !!sourceElement);
          
          if (sourceElement) {
            // Use original source variant for property detection, not the copy
            const originalSourceElement = originalSourceVariant.querySelector('[data-figma-name="' + targetName + '"]') || 
                                        originalSourceVariant.querySelector('[data-figma-id="' + sourceElement.getAttribute('data-figma-id') + '"]');
            
            console.log('🔍 DEBUG: originalSourceElement lookup result for ' + targetName + ':', originalSourceElement ? originalSourceElement.getAttribute('data-figma-id') : 'null');
            console.log('🔍 DEBUG: originalSourceElement found:', !!originalSourceElement);
            console.log('🔍 DEBUG: Original source element data-figma-y:', originalSourceElement ? originalSourceElement.getAttribute('data-figma-y') : 'null');
            
            if (originalSourceElement) {
              console.log('🔍 DEBUG: Calling detectPropertyChanges for:', targetName);
              const changes = detectPropertyChanges(element, originalSourceElement, originalSourceElement);
              
              console.log('🔍 DEBUG: Changes detected:', changes.hasChanges, changes);
              
              if (changes.hasChanges) {
                console.log('🔍 DEBUG: Adding element to animation list:', targetName);
                elementsToAnimate.push({
                  element: sourceElement, // Use copy for animation
                  sourceElement: sourceElement, // Use copy for animation
                  changes: changes
                });
              } else {
                console.log('🔍 DEBUG: No changes detected for:', targetName);
              }
            }
          }
        });
      
      // Also add parent alignment changes if any were found
      if (parentAlignmentChanges.length > 0) {
        console.log('🔍 DEBUG: Found', parentAlignmentChanges.length, 'parent alignment changes');
        console.log('🔍 DEBUG: Parent alignment changes:', parentAlignmentChanges);
        parentAlignmentChanges.forEach((change, index) => {
          console.log('🔍 DEBUG: Parent alignment change', index, ':', {
            element: change.element.getAttribute('data-figma-name') || change.element.getAttribute('data-figma-id'),
            justifyContent: change.changes.justifyContent,
            alignItems: change.changes.alignItems
          });
        });
        elementsToAnimate.push(...parentAlignmentChanges);
      }
      
      console.log('🔍 Found', elementsToAnimate.length, 'elements to animate');
      return elementsToAnimate;
    }
    
    /**
     * Helper function to detect property changes between elements
     */
    function detectPropertyChanges(targetElement, sourceElement, originalSourceElement) {
      console.log('🔍 DEBUG: detectPropertyChanges called for:', {
        targetElement: targetElement.getAttribute('data-figma-name'),
        sourceElement: sourceElement.getAttribute('data-figma-name'),
        originalSourceElement: originalSourceElement.getAttribute('data-figma-name')
      });

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
            
            // CRITICAL FIX: Don't return early - continue to check for individual element position changes
            // This allows both parent alignment changes AND individual element position changes to be detected
          }
        }
      } catch (error) {
        console.log('Error in parent alignment check:', error);
      }

      try {
        const sourceStyle = window.getComputedStyle(sourceElement);
        const targetStyle = window.getComputedStyle(targetElement);
        
        // Check for parent alignment changes first
        const sourceParent = sourceElement.parentElement;
        const targetParent = targetElement.parentElement;
        
        // Use Figma coordinates directly for comparison
        const sourceFigmaY = parseFloat(originalSourceElement.getAttribute('data-figma-y')) || 0;
        const targetFigmaY = parseFloat(targetElement.getAttribute('data-figma-y')) || 0;
        const sourceFigmaX = parseFloat(originalSourceElement.getAttribute('data-figma-x')) || 0;
        const targetFigmaX = parseFloat(targetElement.getAttribute('data-figma-x')) || 0;
        
        const sourceRelativeLeft = sourceFigmaX;
        const sourceRelativeTop = sourceFigmaY;
        const targetRelativeLeft = targetFigmaX;
        const targetRelativeTop = targetFigmaY;

        console.log('🔍 DEBUG: Position comparison for', targetElement.getAttribute('data-figma-name'), ':', {
          sourceFigmaX,
          sourceFigmaY,
          targetFigmaX,
          targetFigmaY,
          xDifference: Math.abs(sourceFigmaX - targetFigmaX),
          yDifference: Math.abs(sourceFigmaY - targetFigmaY),
          shouldAnimateX: Math.abs(sourceRelativeLeft - targetRelativeLeft) > 1,
          shouldAnimateY: Math.abs(sourceRelativeTop - targetRelativeTop) > 1
        });
        
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
    function convertChangesToAnimationChanges(changes, element, originalSourceElement, destination) {
      const animationChanges = [];
      
      console.log('🎭 Converting changes to animation changes:', changes);
      
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
          translationCondition: TranslationCondition.ABSOLUTE,
          isCombinedTransform: true
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
      
      // Handle parent alignment changes - convert to transform-based animations
      if (changes.justifyContent && changes.justifyContent.changed) {
        // Convert justifyContent changes to transform-based animations
        const justifyContentValue = changes.justifyContent.targetValue;
        let translateX = 0;
        
        if (justifyContentValue === 'center') {
          translateX = 0; // Already centered
        } else if (justifyContentValue === 'flex-start') {
          translateX = -50; // Move to start
        } else if (justifyContentValue === 'flex-end') {
          translateX = 50; // Move to end
        }
        
        if (translateX !== 0) {
          animationChanges.push({
            type: AnimationType.TRANSFORM,
            property: 'translateX',
            sourceValue: 0,
            targetValue: translateX,
            changed: true,
            translationCondition: TranslationCondition.ABSOLUTE
          });
        }
      }
      
      if (changes.alignItems && changes.alignItems.changed) {
        // Convert alignItems changes to transform-based animations using actual position differences
        const alignItemsValue = changes.alignItems.targetValue;
        const sourceAlignItems = changes.alignItems.sourceValue;
        
        console.log('🔍 DEBUG: alignItems conversion:', {
          sourceValue: sourceAlignItems,
          targetValue: alignItemsValue
        });
        
        // Get the actual position differences from Figma coordinates
        const sourceFigmaY = parseFloat(originalSourceElement.getAttribute('data-figma-y')) || 0;
        const targetFigmaY = parseFloat(element.getAttribute('data-figma-y')) || 0;
        const yDifference = targetFigmaY - sourceFigmaY;
        
        console.log('🔍 DEBUG: Position-based translateY calculation:', {
          sourceFigmaY,
          targetFigmaY,
          yDifference
        });
        
        // Use the actual position difference instead of hardcoded values
        const translateY = yDifference;
        
        console.log('🔍 DEBUG: Calculated translateY:', translateY);
        
        if (translateY !== 0) {
          animationChanges.push({
            type: AnimationType.TRANSFORM,
            property: 'translateY',
            sourceValue: 0,
            targetValue: translateY,
            changed: true,
            translationCondition: TranslationCondition.ABSOLUTE
          });
        }
      }
      
      console.log('🎭 Created animation changes:', animationChanges);
      return animationChanges;
    }
    
    /**
     * Helper function to apply animation changes
     */
    function applyAnimationChange(element, change, duration, easing) {
      const { type, property, targetValue, translationCondition } = change;
      
      console.log('🎭 Applying animation change:', { type, property, targetValue, translationCondition });
      console.log('🔍 DEBUG: Element initial transform:', window.getComputedStyle(element).transform);
                    console.log('🔍 DEBUG: Element initial position:', {
                left: window.getComputedStyle(element).left,
                top: window.getComputedStyle(element).top,
                position: window.getComputedStyle(element).position
              });
              console.log('🔍 DEBUG: Element initial display:', window.getComputedStyle(element).display);
              console.log('🔍 DEBUG: Element initial width/height:', {
                width: window.getComputedStyle(element).width,
                height: window.getComputedStyle(element).height
              });
      
      // Get transition property
      let transitionProperty = property;
      if (type === AnimationType.TRANSFORM) {
        if (translationCondition === TranslationCondition.ABSOLUTE) {
          // CRITICAL FIX: Use 'transform' for all transform animations, not 'top' or 'left'
          transitionProperty = 'transform';
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
              // Get current transform state
              const currentTransform = window.getComputedStyle(element).transform;
              console.log('🔍 DEBUG: Current transform before animation:', currentTransform);
              
              // Set initial state explicitly
              element.style.transition = 'none'; // No transition for initial state
              element.style.transform = 'translateX(0px)'; // Start at source position
              
              // Force a reflow to ensure initial state is applied
              element.offsetHeight;
              
              // Verify initial state was applied
              const initialTransform = window.getComputedStyle(element).transform;
              console.log('🔍 DEBUG: Initial transform after setting:', initialTransform);
              
              // Now animate to target state
              element.style.transition = \`transform \${duration}s \${easing}\`;
              element.style.transform = \`translateX(\${targetValue}px)\`;
              
              // Force a reflow to ensure the animation starts
              element.offsetHeight;
              
              // Verify target state was applied
              const finalTransform = window.getComputedStyle(element).transform;
              console.log('🔍 DEBUG: Final transform after setting:', finalTransform);
              console.log('🔍 DEBUG: Expected transform should be: matrix(1, 0, 0, 1, ' + targetValue + ', 0)');
              console.log('🔍 DEBUG: Element.style.transform value:', element.style.transform);
            } else if (property === 'translateY') {
              // Use transform translateY with proper initial state
              console.log('🔍 DEBUG: Using transform translateY for animation');
              
              // Get current transform state
              const currentTransform = window.getComputedStyle(element).transform;
              console.log('🔍 DEBUG: Current transform before animation:', currentTransform);
              
              // Set initial state explicitly with no transition
              element.style.transition = 'none';
              element.style.transform = 'translateY(0px)';
              
              // Force a reflow to ensure initial state is applied
              element.offsetHeight;
              
              // Verify initial state was applied
              const initialTransform = window.getComputedStyle(element).transform;
              console.log('🔍 DEBUG: Initial transform after setting:', initialTransform);
              
              // Now animate to target state immediately
              element.style.transition = \`transform \${duration}s \${easing}\`;
              element.style.transform = \`translateY(\${targetValue}px)\`;
              
              // Force a reflow to ensure the animation starts
              element.offsetHeight;
              
              // Verify target state was applied
              const finalTransform = window.getComputedStyle(element).transform;
              console.log('🔍 DEBUG: Final transform after setting:', finalTransform);
              console.log('🔍 DEBUG: Expected transform should be: matrix(1, 0, 0, 1, 0, ' + targetValue + ')');
              console.log('🔍 DEBUG: Element.style.transform value:', element.style.transform);
              console.log('🔍 DEBUG: Element.style.transition value:', element.style.transition);
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
      
      // Determine the actual transition property used
      let actualTransitionProperty = transitionProperty;
      if (type === AnimationType.TRANSFORM && translationCondition === TranslationCondition.ABSOLUTE) {
        actualTransitionProperty = 'transform';
      }
      
      console.log('🎭 Applied change:', { property, transitionProperty: actualTransitionProperty, targetValue });
      console.log('🔍 DEBUG: Element computed style after change:');
      console.log('  - transform:', window.getComputedStyle(element).transform);
      console.log('  - transition:', window.getComputedStyle(element).transition);
      console.log('  - display:', window.getComputedStyle(element).display);
      console.log('  - position:', window.getComputedStyle(element).position);
      console.log('  - left:', window.getComputedStyle(element).left);
      console.log('  - top:', window.getComputedStyle(element).top);
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
     * Main reaction handler function - entry point for all reactions
     */
    function handleReaction(sourceElement, destinationId, transitionType, transitionDuration) {
      console.log('🎯 REACTION TRIGGERED:', {
        sourceId: sourceElement.getAttribute('data-figma-id'),
        sourceName: sourceElement.getAttribute('data-figma-name'),
        destinationId: destinationId,
        transitionType: transitionType,
        transitionDuration: transitionDuration
      });
      
      // Check if transition is already in progress
      if (isTransitionInProgress) {
        console.log('❌ Transition already in progress, skipping reaction');
        return;
      }
      
      // Find the destination element
      const destination = document.querySelector('[data-figma-id="' + destinationId + '"]');
      if (!destination) {
        console.error('❌ Destination element not found:', destinationId);
        return;
      }
      
      // Find all variants in the same component set
      const componentSet = sourceElement.closest('[data-figma-type="COMPONENT_SET"]');
      if (!componentSet) {
        console.error('❌ Component set not found for source element');
        return;
      }
      
      const allVariants = Array.from(componentSet.children).filter(child => 
        child.getAttribute('data-figma-type') === 'COMPONENT'
      );
      
      console.log('🎯 Found', allVariants.length, 'variants in component set');
      
      // Determine if we should animate or perform instant switch
      if (transitionType && transitionType !== 'INSTANT' && transitionDuration && parseFloat(transitionDuration) > 0) {
        // Use animated variant switch
        console.log('🎭 Using animated variant switch');
        handleAnimatedVariantSwitch(sourceElement, destination, allVariants, transitionType, transitionDuration);
      } else {
        // Use instant variant switch
        console.log('⚡ Using instant variant switch');
        performInstantVariantSwitch(allVariants, destination);
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
      
      // Hide all variants - only use display
      allVariants.forEach(variant => {
        variant.classList.add('variant-hidden');
        variant.classList.remove('variant-active');
        variant.style.display = 'none';
        if (!variant.style.position || variant.style.position === 'static') {
          variant.style.position = 'relative';
        }
      });
      
      // Show destination variant - only use display
      destination.classList.add('variant-active');
      destination.classList.remove('variant-hidden');
      destination.style.display = 'flex';
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
    
    // Export the main functions for external use
    window.handleReaction = handleReaction;
    window.handleAnimatedVariantSwitch = handleAnimatedVariantSwitch;
    window.performInstantVariantSwitch = performInstantVariantSwitch;
    
    console.log('✅ Three-phase transition handler loaded');
  `;
}

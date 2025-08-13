import { 
  AnimationType, 
  TranslationCondition, 
  AnimationChange, 
  ElementAnimationContext,
  detectAnimationChanges,
  createAnimationContext,
  applyAnimationChange,
  getEasingFunction
} from './animation-system';

/**
 * Creates a modular smart animate handler that uses the new animation system
 */
export function createModularSmartAnimateHandler(): string {
  return `
      // Global transition lock to prevent multiple simultaneous transitions
      let isTransitionInProgress = false;
      let currentTransitionPromise = null;
      
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
      
      // Helper function to determine animation type for a property
      function getAnimationType(property) {
        const simpleProperties = [
          'opacity', 'color', 'backgroundColor', 'cornerRadius', 'borderRadius',
          'fontSize', 'fontWeight', 'textAlign', 'letterSpacing', 'lineHeight'
        ];
        
        const sizeProperties = [
          'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight'
        ];
        
        const transformProperties = [
          'translateX', 'translateY', 'translateZ', 'rotation', 'scale', 'transform'
        ];
        
        if (simpleProperties.includes(property)) {
          return AnimationType.SIMPLE;
        } else if (sizeProperties.includes(property)) {
          return AnimationType.SIZE;
        } else if (transformProperties.includes(property)) {
          return AnimationType.TRANSFORM;
        }
        
        return AnimationType.SIMPLE;
      }
      
      // Helper function to determine translation condition
      function getTranslationCondition(element, node, parentNode) {
        const ignoreAutoLayout = node.layoutPositioning === 'ABSOLUTE';
        
        const parentHasAutoLayout = parentNode && 
                                   parentNode.type === 'FRAME' && 
                                   parentNode.layoutMode && 
                                   parentNode.layoutMode !== 'NONE';
        
        if (ignoreAutoLayout || !parentHasAutoLayout) {
          return TranslationCondition.ABSOLUTE;
        }
        
        if (parentHasAutoLayout) {
          // For now, default to padding-based relative positioning
          // This could be enhanced to detect which type of relative positioning is needed
          return TranslationCondition.RELATIVE_PADDING;
        }
        
        return TranslationCondition.ABSOLUTE;
      }
      
      // Helper function to detect animation changes
      function detectAnimationChanges(sourceElement, targetElement, sourceNode, targetNode, parentNode) {
        const changes = [];
        
        const sourceStyle = window.getComputedStyle(sourceElement);
        const targetStyle = window.getComputedStyle(targetElement);
        
        // Check simple properties
        const simpleProperties = ['opacity', 'backgroundColor', 'color'];
        simpleProperties.forEach(property => {
          const sourceValue = sourceStyle[property];
          const targetValue = targetStyle[property];
          
          if (sourceValue !== targetValue) {
            changes.push({
              type: AnimationType.SIMPLE,
              property,
              sourceValue,
              targetValue,
              changed: true
            });
          }
        });
        
        // Check size properties
        const sizeProperties = ['width', 'height'];
        sizeProperties.forEach(property => {
          const sourceValue = parseFloat(sourceStyle[property]) || 0;
          const targetValue = parseFloat(targetStyle[property]) || 0;
          
          if (Math.abs(sourceValue - targetValue) > 1) {
            changes.push({
              type: AnimationType.SIZE,
              property,
              sourceValue,
              targetValue,
              changed: true
            });
          }
        });
        
        // Check transform properties based on translation condition
        const translationCondition = getTranslationCondition(sourceElement, sourceNode, parentNode);
        
        console.log('DEBUG: Translation condition detected:', translationCondition);
        
        if (translationCondition === TranslationCondition.ABSOLUTE) {
          // Check left/top changes for absolute positioning
          const sourceLeft = parseFloat(sourceStyle.left) || 0;
          const targetLeft = parseFloat(targetStyle.left) || 0;
          const sourceTop = parseFloat(sourceStyle.top) || 0;
          const targetTop = parseFloat(targetStyle.top) || 0;
          
          if (Math.abs(sourceLeft - targetLeft) > 1) {
            changes.push({
              type: AnimationType.TRANSFORM,
              property: 'translateX',
              sourceValue: sourceLeft,
              targetValue: targetLeft,
              changed: true,
              translationCondition
            });
          }
          
          if (Math.abs(sourceTop - targetTop) > 1) {
            changes.push({
              type: AnimationType.TRANSFORM,
              property: 'translateY',
              sourceValue: sourceTop,
              targetValue: targetTop,
              changed: true,
              translationCondition
            });
          }
        } else if (translationCondition === TranslationCondition.RELATIVE_PADDING) {
          // Check parent padding changes
          const sourceParent = sourceElement.parentElement;
          const targetParent = targetElement.parentElement;
          
          if (sourceParent && targetParent) {
            const sourceParentStyle = window.getComputedStyle(sourceParent);
            const targetParentStyle = window.getComputedStyle(targetParent);
            
            const paddingProperties = ['paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom'];
            paddingProperties.forEach(property => {
              const sourceValue = parseFloat(sourceParentStyle[property]) || 0;
              const targetValue = parseFloat(targetParentStyle[property]) || 0;
              
              if (Math.abs(sourceValue - targetValue) > 1) {
                changes.push({
                  type: AnimationType.TRANSFORM,
                  property: \`parent_\${property}\`,
                  sourceValue,
                  targetValue,
                  changed: true,
                  translationCondition
                });
              }
            });
          }
        } else if (translationCondition === TranslationCondition.RELATIVE_ALIGNMENT) {
          // Check parent alignment changes - ENHANCED FOR JUSTIFYCONTENT
          const sourceParent = sourceElement.parentElement;
          const targetParent = targetElement.parentElement;
          
          if (sourceParent && targetParent) {
            const sourceParentStyle = window.getComputedStyle(sourceParent);
            const targetParentStyle = window.getComputedStyle(targetParent);
            
            // Check alignment properties with detailed logging
            const alignmentProperties = ['justifyContent', 'alignItems', 'textAlign', 'verticalAlign'];
            
            console.log('DEBUG: Checking alignment properties for RELATIVE_ALIGNMENT');
            
            alignmentProperties.forEach(property => {
              const sourceValue = sourceParentStyle[property];
              const targetValue = targetParentStyle[property];
              
              console.log(\`DEBUG: Parent \${property}:\`, { sourceValue, targetValue, changed: sourceValue !== targetValue });
              
              if (sourceValue !== targetValue) {
                changes.push({
                  type: AnimationType.TRANSFORM,
                  property: \`parent_\${property}\`,
                  sourceValue: sourceValue || '',
                  targetValue: targetValue || '',
                  changed: true,
                  translationCondition
                });
              }
            });
            
            // Check element's own alignment properties
            alignmentProperties.forEach(property => {
              const sourceValue = sourceStyle[property];
              const targetValue = targetStyle[property];
              
              console.log(\`DEBUG: Element \${property}:\`, { sourceValue, targetValue, changed: sourceValue !== targetValue });
              
              if (sourceValue !== targetValue) {
                changes.push({
                  type: AnimationType.TRANSFORM,
                  property: property,
                  sourceValue: sourceValue || '',
                  targetValue: targetValue || '',
                  changed: true,
                  translationCondition
                });
              }
            });
            
            // Check for flexbox-specific properties
            const flexProperties = ['flexDirection', 'flexWrap', 'alignContent', 'justifyItems'];
            flexProperties.forEach(property => {
              const sourceValue = sourceParentStyle[property];
              const targetValue = targetParentStyle[property];
              
              console.log(\`DEBUG: Flex \${property}:\`, { sourceValue, targetValue, changed: sourceValue !== targetValue });
              
              if (sourceValue !== targetValue) {
                changes.push({
                  type: AnimationType.TRANSFORM,
                  property: \`parent_\${property}\`,
                  sourceValue: sourceValue || '',
                  targetValue: targetValue || '',
                  changed: true,
                  translationCondition
                });
              }
            });
            
            // Check for position changes that might be due to alignment
            // Even if alignment values are the same, the computed position might differ
            const sourceRect = sourceElement.getBoundingClientRect();
            const targetRect = targetElement.getBoundingClientRect();
            const sourceParentRect = sourceParent.getBoundingClientRect();
            const targetParentRect = targetParent.getBoundingClientRect();
            
            // Calculate relative positions within their containers
            const sourceRelativeX = sourceRect.left - sourceParentRect.left;
            const targetRelativeX = targetRect.left - targetParentRect.left;
            const sourceRelativeY = sourceRect.top - sourceParentRect.top;
            const targetRelativeY = targetRect.top - targetParentRect.top;
            
            console.log('DEBUG: Relative position analysis:', {
              sourceRelativeX,
              targetRelativeX,
              sourceRelativeY,
              targetRelativeY,
              xDifference: Math.abs(sourceRelativeX - targetRelativeX),
              yDifference: Math.abs(sourceRelativeY - targetRelativeY)
            });
            
            // If there's a significant position difference, it might be due to alignment
            if (Math.abs(sourceRelativeX - targetRelativeX) > 1) {
              changes.push({
                type: AnimationType.TRANSFORM,
                property: 'alignTranslateX',
                sourceValue: sourceRelativeX,
                targetValue: targetRelativeX,
                changed: true,
                translationCondition
              });
            }
            
            if (Math.abs(sourceRelativeY - targetRelativeY) > 1) {
              changes.push({
                type: AnimationType.TRANSFORM,
                property: 'alignTranslateY',
                sourceValue: sourceRelativeY,
                targetValue: targetRelativeY,
                changed: true,
                translationCondition
              });
            }
          }
        }
        
        console.log('DEBUG: Total changes detected:', changes.length, changes);
        return changes;
      }
      
      // Helper function to apply animation changes
      function applyAnimationChange(element, change, duration, easing) {
        const { type, property, targetValue, translationCondition, destination } = change;
        
        console.log('DEBUG: Applying animation change:', { type, property, targetValue, translationCondition });
        
        // Get transition property
        let transitionProperty = property;
        if (type === AnimationType.TRANSFORM) {
          if (translationCondition === TranslationCondition.ABSOLUTE) {
            transitionProperty = property === 'translateX' ? 'left' : 'top';
          } else if (translationCondition === TranslationCondition.RELATIVE_PADDING) {
            transitionProperty = property.replace('parent_', '');
          } else if (translationCondition === TranslationCondition.RELATIVE_ALIGNMENT) {
            if (property === 'alignTranslateX' || property === 'alignTranslateY') {
              transitionProperty = property === 'alignTranslateX' ? 'left' : 'top';
            } else if (property.startsWith('parent_')) {
              // For alignment changes, animate the element's position instead of the parent's alignment
              if (property === 'parent_justifyContent') {
                // Use the target element's actual position from the destination variant
                const sourceElementName = element.getAttribute('data-figma-name');
                const targetElement = destination.querySelector(\`[data-figma-name="\${sourceElementName}"]\`);
                
                if (targetElement) {
                  const targetRect = targetElement.getBoundingClientRect();
                  const parent = element.parentElement;
                  const parentRect = parent.getBoundingClientRect();
                  
                  // Calculate the target position relative to the parent
                  const targetLeft = targetRect.left - parentRect.left;
                  
                  console.log('DEBUG: Calculating justifyContent animation using target position:', {
                    currentLeft: element.getBoundingClientRect().left - parentRect.left,
                    targetLeft: targetLeft,
                    targetElementId: targetElement.getAttribute('data-figma-id'),
                    targetElementName: sourceElementName,
                    justifyContent: targetValue
                  });
                  
                  // Set transition for left position
                  element.style.transition = \`left \${duration}s \${easing}\`;
                  element.style.left = \`\${targetLeft}px\`;
                  
                  console.log('DEBUG: Applied justifyContent animation via target position:', {
                    property: 'left',
                    transitionProperty: 'left',
                    targetValue: \`\${targetLeft}px\`
                  });
                  
                  return; // Skip the default handling
                } else {
                  console.log('DEBUG: Target element not found in destination by name:', sourceElementName);
                }
              } else if (property === 'parent_alignItems') {
                // Use the target element's actual position from the destination variant
                const sourceElementName = element.getAttribute('data-figma-name');
                const targetElement = destination.querySelector(\`[data-figma-name="\${sourceElementName}"]\`);
                
                if (targetElement) {
                  const targetRect = targetElement.getBoundingClientRect();
                  const parent = element.parentElement;
                  const parentRect = parent.getBoundingClientRect();
                  
                  // Calculate the target position relative to the parent
                  const targetTop = targetRect.top - parentRect.top;
                  
                  console.log('DEBUG: Calculating alignItems animation using target position:', {
                    currentTop: element.getBoundingClientRect().top - parentRect.top,
                    targetTop: targetTop,
                    targetElementId: targetElement.getAttribute('data-figma-id'),
                    targetElementName: sourceElementName,
                    alignItems: targetValue
                  });
                  
                  // Set transition for top position
                  element.style.transition = \`top \${duration}s \${easing}\`;
                  element.style.top = \`\${targetTop}px\`;
                  
                  console.log('DEBUG: Applied alignItems animation via target position:', {
                    property: 'top',
                    transitionProperty: 'top',
                    targetValue: \`\${targetTop}px\`
                  });
                  
                  return; // Skip the default handling
                } else {
                  console.log('DEBUG: Target element not found in destination by name:', sourceElementName);
                }
              }
              transitionProperty = property.replace('parent_', '');
            } else {
              transitionProperty = property;
            }
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
                
                console.log('DEBUG: Applying combined transform animation:', {
                  translateX: translateX,
                  translateY: translateY,
                  elementName: element.getAttribute('data-figma-name')
                });
              } else if (property === 'translateX') {
                // For additive position changes, add the difference to current position
                const currentLeft = parseFloat(element.style.left) || 0;
                const newLeft = currentLeft + targetValue;
                element.style.left = \`\${newLeft}px\`;
                
                console.log('DEBUG: Applying additive translateX animation:', {
                  currentLeft: currentLeft,
                  targetValue: targetValue,
                  newLeft: newLeft,
                  elementName: element.getAttribute('data-figma-name')
                });
              } else if (property === 'translateY') {
                // For additive position changes, add the difference to current position
                const currentTop = parseFloat(element.style.top) || 0;
                const newTop = currentTop + targetValue;
                element.style.top = \`\${newTop}px\`;
                
                console.log('DEBUG: Applying additive translateY animation:', {
                  currentTop: currentTop,
                  targetValue: targetValue,
                  newTop: newTop,
                  elementName: element.getAttribute('data-figma-name')
                });
              }
            } else if (translationCondition === TranslationCondition.RELATIVE_PADDING) {
              if (element.parentElement) {
                const paddingProperty = property.replace('parent_', '');
                element.parentElement.style[paddingProperty] = \`\${targetValue}px\`;
              }
            } else if (translationCondition === TranslationCondition.RELATIVE_ALIGNMENT) {
              if (property === 'alignTranslateX') {
                element.style.left = \`\${targetValue}px\`;
              } else if (property === 'alignTranslateY') {
                element.style.top = \`\${targetValue}px\`;
              } else if (property.startsWith('parent_')) {
                if (element.parentElement) {
                  const alignmentProperty = property.replace('parent_', '');
                  element.parentElement.style[alignmentProperty] = targetValue;
                }
              } else {
                // Direct property change on the element
                element.style[property] = targetValue;
              }
            }
            break;
        }
        
        console.log('DEBUG: Applied change:', { property, transitionProperty, targetValue });
      }
      
      // Helper function to get easing function
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
            return 'ease-in-out';
          case 'SMART_ANIMATE':
            return 'ease-in-out';
          default:
            return 'ease-out';
        }
      }
      
      // Helper function to create element copy
      function createElementCopy(sourceElement) {
        console.log('DEBUG: createElementCopy function called');
        console.log('DEBUG: Creating element copy for:', sourceElement.getAttribute('data-figma-name') || sourceElement.getAttribute('data-figma-id'));
        
        const copy = sourceElement.cloneNode(true);
        copy.setAttribute('data-figma-id', sourceElement.getAttribute('data-figma-id') + '-copy');
        copy.setAttribute('data-is-animation-copy', 'true');
        
        // Make an exact copy - don't manipulate positions
        console.log('DEBUG: Making exact copy of source variant');
        
        // Get source elements for copy creation (no detailed logging)
        const sourceElements = sourceElement.querySelectorAll('[data-figma-id]');
        
        // The copy is already an exact clone, no position manipulation needed
        
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
        
        // Ensure the copy container doesn't clip its children
        copy.style.overflow = 'visible';
        
        // Ensure the copy and all its children are fully visible
        copy.style.opacity = '1';
        copy.style.visibility = 'visible';
        copy.style.display = 'flex';

        // Ensure all nested elements in the copy are also visible
        const copyChildren = copy.querySelectorAll('*');
        copyChildren.forEach(child => {
          child.style.opacity = '1';
          child.style.visibility = 'visible';
          child.style.overflow = 'visible';
          if (child.style.display === 'none') {
            child.style.display = 'flex';
          }
        });

        // Ensure all nodes in the copy are visible (no detailed logging)
        
        console.log('DEBUG: Copy creation completed');
        return copy;
      }
      
      // Helper function to update copy content to match destination
      function updateCopyContentToMatchDestination(copy, destination) {
        console.log('DEBUG: Updating copy content to match destination');
        
        // Get all elements in both copy and destination
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
              
              // CRITICAL FIX: Preserve the positioning of ALL nested elements before updating content
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
              
              // CRITICAL FIX: Restore the positioning of ALL elements after content update
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
        
        // Ensure all elements in the copy are visible after content update

        // Ensure all elements in the copy are visible after content update
        const allCopyElements = copy.querySelectorAll('*');
        allCopyElements.forEach(element => {
          element.style.opacity = '1';
          element.style.visibility = 'visible';
          element.style.overflow = 'visible';
          if (element.style.display === 'none') {
            element.style.display = 'flex';
          }
        });
      }
      
      // Helper function to animate copy to destination
      function animateCopyToDestination(copy, destination, originalSourceElement, transitionType, transitionDuration) {
        return new Promise((resolve) => {
          // Update copy content to match destination content
          updateCopyContentToMatchDestination(copy, destination);
          
          // Find elements with property changes
          const elementsToAnimate = findElementsWithPropertyChanges(destination, copy, originalSourceElement);
          
          const easingFunction = getEasingFunction(transitionType);
          const duration = parseFloat(transitionDuration || '0.3');
          
          if (elementsToAnimate.length > 0) {
            console.log('DEBUG: Animating copy with', elementsToAnimate.length, 'elements using modular system');
            
            // Setup animation for each element using the changes already detected
            elementsToAnimate.forEach(({ element, sourceElement, changes }) => {
              console.log('DEBUG: Processing element with changes:', changes);
              
              // Convert the detected changes to animation changes
              const animationChanges = [];
              
              // Handle position changes - use combined transform for simultaneous X and Y movement
              const hasPositionX = changes.positionX && changes.positionX.changed;
              const hasPositionY = changes.positionY && changes.positionY.changed;
              
              if (hasPositionX || hasPositionY) {
                // Create a single combined transform animation
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
                
                console.log('DEBUG: Created combined transform animation:', {
                  translateX: translateX,
                  translateY: translateY,
                  elementName: element.getAttribute('data-figma-name')
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
              
              // Handle alignment changes
              if (changes.justifyContent && changes.justifyContent.changed) {
                // Calculate the position difference that the alignment change creates
                const parent = element.parentElement;
                if (parent) {
                  const parentRect = parent.getBoundingClientRect();
                  const elementRect = element.getBoundingClientRect();
                  const elementWidth = elementRect.width;
                  
                  // Calculate current position relative to parent
                  const currentLeft = elementRect.left - parentRect.left;
                  
                  // Calculate target position based on alignment change
                  let targetLeft = currentLeft;
                  if (changes.justifyContent.targetValue === 'flex-end') {
                    targetLeft = parentRect.width - elementWidth;
                  } else if (changes.justifyContent.targetValue === 'center') {
                    targetLeft = (parentRect.width - elementWidth) / 2;
                  } else if (changes.justifyContent.targetValue === 'flex-start') {
                    targetLeft = 0;
                  }
                  
                  // Only animate if there's actually a position difference
                  if (Math.abs(currentLeft - targetLeft) > 1) {
                    console.log('DEBUG: Calculating justifyContent position animation:', {
                      currentLeft: currentLeft,
                      targetLeft: targetLeft,
                      justifyContent: changes.justifyContent.targetValue,
                      parentWidth: parentRect.width,
                      elementWidth: elementWidth
                    });
                    
                    // Animate the position, NOT the alignment
                    element.style.transition = \`left \${duration}s \${easingFunction}\`;
                    element.style.left = \`\${targetLeft}px\`;
                    
                    console.log('DEBUG: Applied justifyContent position animation:', {
                      property: 'left',
                      transitionProperty: 'left',
                      targetValue: \`\${targetLeft}px\`
                    });
                  } else {
                    console.log('DEBUG: JustifyContent change detected but no position difference - skipping animation');
                  }
                  
                  // Don't add to animationChanges array since we're handling it directly
                  return;
                }
              }
              
              if (changes.alignItems && changes.alignItems.changed) {
                // Calculate the position difference that the alignment change creates
                const parent = element.parentElement;
                if (parent) {
                  const parentRect = parent.getBoundingClientRect();
                  const elementRect = element.getBoundingClientRect();
                  const elementHeight = elementRect.height;
                  
                  // Calculate current position relative to parent
                  const currentTop = elementRect.top - parentRect.top;
                  
                  // Calculate target position based on alignment change
                  let targetTop = currentTop;
                  if (changes.alignItems.targetValue === 'flex-end') {
                    targetTop = parentRect.height - elementHeight;
                  } else if (changes.alignItems.targetValue === 'center') {
                    targetTop = (parentRect.height - elementHeight) / 2;
                  } else if (changes.alignItems.targetValue === 'flex-start') {
                    targetTop = 0;
                  }
                  
                  // Only animate if there's actually a position difference
                  if (Math.abs(currentTop - targetTop) > 1) {
                    console.log('DEBUG: Calculating alignItems position animation:', {
                      currentTop: currentTop,
                      targetTop: targetTop,
                      alignItems: changes.alignItems.targetValue,
                      parentHeight: parentRect.height,
                      elementHeight: elementHeight
                    });
                    
                    // Animate the position, NOT the alignment
                    element.style.transition = \`top \${duration}s \${easingFunction}\`;
                    element.style.top = \`\${targetTop}px\`;
                    
                    console.log('DEBUG: Applied alignItems position animation:', {
                      property: 'top',
                      transitionProperty: 'top',
                      targetValue: \`\${targetTop}px\`
                    });
                  } else {
                    console.log('DEBUG: AlignItems change detected but no position difference - skipping animation');
                  }
                  
                  // Don't add to animationChanges array since we're handling it directly
                  return;
                }
              }
              
              // Note: justifyContent and alignItems changes are handled directly above
              // and only applied if there's an actual position difference
              
              console.log('DEBUG: Converted to animation changes:', animationChanges);
              
                          // Apply each change
            animationChanges.forEach(change => {
              applyAnimationChange(element, change, duration, easingFunction);
            });
          });
          
          // Force reflow
          copy.offsetHeight;
          

          

            

            
            // Monitor animation progress using transition end events
            let completedAnimations = 0;
            const totalAnimations = elementsToAnimate.length;
            
            console.log('DEBUG: Setting up animation monitoring for', totalAnimations, 'elements');
            
            // Track which elements have actually been animated and their transition properties
            const animatedElementsSet = new Set();
            const transitionProperties = new Map(); // Track which properties are being transitioned
            
            // Also track which elements have been processed to avoid double-counting
            const processedElements = new Set();
            
            // Track if animation has completed to stop sub-frame tracking
            let animationCompleted = false;
            
            // Set up transition properties for monitoring
            elementsToAnimate.forEach(({ element, changes }, index) => {
              const elementName = element.getAttribute('data-figma-name') || element.getAttribute('data-figma-id');
              const elementProperties = [];
              
              // Check for combined transform or individual position changes
              const hasPositionX = changes.positionX && changes.positionX.changed;
              const hasPositionY = changes.positionY && changes.positionY.changed;
              
              if (hasPositionX || hasPositionY) {
                // Use transform for combined movement, or individual properties for single-axis movement
                if (hasPositionX && hasPositionY) {
                  elementProperties.push('transform'); // Combined transform
                } else {
                  if (hasPositionX) elementProperties.push('left');
                  if (hasPositionY) elementProperties.push('top');
                }
              }
              if (changes.backgroundColor && changes.backgroundColor.changed) {
                elementProperties.push('background-color');
              }
              if (changes.color && changes.color.changed) {
                elementProperties.push('color');
              }
              if (changes.justifyContent && changes.justifyContent.changed) {
                elementProperties.push('left');
              }
              if (changes.alignItems && changes.alignItems.changed) {
                elementProperties.push('top');
              }
              
              // Remove duplicates and set the properties
              const uniqueProperties = [...new Set(elementProperties)];
              transitionProperties.set(element, uniqueProperties);
            });
            
            const onTransitionEnd = (event) => {
              const targetElement = event.target;
              const propertyName = event.propertyName;
              
              console.log('🎯 TRANSITION END EVENT:', {
                targetElement: targetElement.getAttribute('data-figma-name') || targetElement.getAttribute('data-figma-id'),
                propertyName: propertyName,
                timestamp: Date.now()
              });
              
              // Find which element this transition belongs to
              const animatedElement = elementsToAnimate.find(({ element }) => 
                targetElement === element || element.contains(targetElement)
              );
              
              if (animatedElement) {
                const elementKey = animatedElement.element;
                const expectedProperties = transitionProperties.get(elementKey) || [];
                
                // Check if this is a property we're expecting to transition
                if (expectedProperties.includes(propertyName)) {
                  // Remove this property from the expected list
                  const updatedProperties = expectedProperties.filter(p => p !== propertyName);
                  transitionProperties.set(elementKey, updatedProperties);
                  
                  // If all properties for this element have completed, mark the element as done
                                  if (updatedProperties.length === 0 && !animatedElementsSet.has(elementKey)) {
                  animatedElementsSet.add(elementKey);
                  completedAnimations++;
                  
                  if (completedAnimations >= totalAnimations) {
                    console.log('🎯 All animations completed via transition end');
                    animationCompleted = true;
                    copy.removeEventListener('transitionend', onTransitionEnd);
                    copy.removeEventListener('transitionend', onCopyTransitionEnd);
                    childElements.forEach(child => {
                      child.removeEventListener('transitionend', onTransitionEnd);
                    });
                    clearTimeout(fallbackTimeout);
                    clearInterval(intervalId);
                    clearInterval(progressCheckInterval);
                    resolve();
                  }
                }
                }
              } else {
                // Check if this is a child element that might be part of an animated element
                const parentAnimatedElement = elementsToAnimate.find(({ element }) => 
                  element.contains(targetElement)
                );
                
                if (parentAnimatedElement && !processedElements.has(targetElement)) {
                  processedElements.add(targetElement);
                  
                  // For child elements, we'll use a simpler approach - just count unique elements
                  const elementKey = parentAnimatedElement.element;
                  if (!animatedElementsSet.has(elementKey)) {
                    animatedElementsSet.add(elementKey);
                    completedAnimations++;
                    
                    if (completedAnimations >= totalAnimations) {
                      console.log('🎯 All animations completed via child transition');
                      animationCompleted = true;
                      copy.removeEventListener('transitionend', onTransitionEnd);
                      copy.removeEventListener('transitionend', onCopyTransitionEnd);
                      childElements.forEach(child => {
                        child.removeEventListener('transitionend', onTransitionEnd);
                      });
                      clearTimeout(fallbackTimeout);
                      clearInterval(intervalId);
                      clearInterval(progressCheckInterval);
                      resolve();
                    }
                  }
                }
              }
            };
            
            // Add a more aggressive monitoring approach - check if animations are actually complete
            const checkAnimationProgressDetailed = () => {
              let actuallyCompleted = 0;
              elementsToAnimate.forEach(({ element, changes }) => {
                const computedStyle = window.getComputedStyle(element);
                const elementName = element.getAttribute('data-figma-name') || element.getAttribute('data-figma-id');
                
                // Only log position when there's a significant change or completion
                const currentLeft = parseFloat(computedStyle.left) || 0;
                const currentTop = parseFloat(computedStyle.top) || 0;
                const currentTransform = computedStyle.transform;
                
                // Check if the element has reached its target position
                let isComplete = false;
                
                if (changes.positionY && changes.positionY.changed) {
                  const targetTop = changes.positionY.targetValue;
                  const difference = Math.abs(currentTop - targetTop);
                  
                  if (difference < 5) { // Allow for small rounding differences
                    isComplete = true;
                  }
                }
                
                if (changes.positionX && changes.positionX.changed) {
                  const targetLeft = changes.positionX.targetValue;
                  const difference = Math.abs(currentLeft - targetLeft);
                  
                  if (difference < 5) { // Allow for small rounding differences
                    isComplete = true;
                  }
                }
                
                if (isComplete && !animatedElementsSet.has(element)) {
                  console.log('🎯 POSITION CHECK COMPLETED:', {
                    elementName: elementName,
                    currentLeft: currentLeft,
                    currentTop: currentTop,
                    targetLeft: changes.positionX?.targetValue || 0,
                    targetTop: changes.positionY?.targetValue || 0,
                    timestamp: Date.now()
                  });
                  animatedElementsSet.add(element);
                  actuallyCompleted++;
                }
              });
              
              if (actuallyCompleted > 0) {
                completedAnimations += actuallyCompleted;
                
                if (completedAnimations >= totalAnimations) {
                  console.log('🎯 All animations completed via position check');
                  animationCompleted = true;
                  copy.removeEventListener('transitionend', onTransitionEnd);
                  copy.removeEventListener('transitionend', onCopyTransitionEnd);
                  childElements.forEach(child => {
                    child.removeEventListener('transitionend', onTransitionEnd);
                  });
                  clearInterval(intervalId);
                  clearInterval(progressCheckInterval);
                  resolve();
                }
              }
            };
            
            // Log animation start details
            console.log('🎬 ANIMATION START:', {
              totalElements: elementsToAnimate.length,
              transitionType: transitionType,
              transitionDuration: transitionDuration,
              easingFunction: getEasingFunction(transitionType),
              elements: elementsToAnimate.map(({ element, changes }) => ({
                elementName: element.getAttribute('data-figma-name') || element.getAttribute('data-figma-id'),
                initialLeft: parseFloat(window.getComputedStyle(element).left) || 0,
                initialTop: parseFloat(window.getComputedStyle(element).top) || 0,
                targetLeft: changes.positionX?.targetValue || 0,
                targetTop: changes.positionY?.targetValue || 0,
                hasPositionX: changes.positionX?.changed || false,
                hasPositionY: changes.positionY?.changed || false
              }))
            });
            
            // Add simplified animation progress tracking (no sub-frame logging)
            let animationStartTime = Date.now();
            
            const checkAnimationProgressSimple = () => {
              // Stop tracking if animation has completed
              if (animationCompleted) {
                return;
              }
              
              const currentTime = Date.now();
              const elapsed = currentTime - animationStartTime;
              
              // Only log significant progress milestones (every 100ms)
              if (elapsed % 100 < 16) { // Log roughly every 100ms
                console.log('🎯 ANIMATION PROGRESS:', {
                  elapsed: elapsed + 'ms',
                  elements: elementsToAnimate.length,
                  transitionType: transitionType,
                  transitionDuration: transitionDuration
                });
              }
            };
            
            // Check progress every 100ms instead of 16ms
            const progressInterval = setInterval(checkAnimationProgressSimple, 100);
            
            // Stop progress tracking after animation duration + buffer
            setTimeout(() => {
              clearInterval(progressInterval);
              console.log('🎯 PROGRESS TRACKING COMPLETED');
              
                      // CRITICAL FIX: Stop all animation monitoring when the animation should be complete
        // This prevents the monitoring from continuing to track the destination variant
        if (!animationCompleted) {
          console.log('🎯 FORCING ANIMATION COMPLETION - stopping all monitoring');
          animationCompleted = true;
          copy.removeEventListener('transitionend', onTransitionEnd);
          copy.removeEventListener('transitionend', onCopyTransitionEnd);
          childElements.forEach(child => {
            child.removeEventListener('transitionend', onTransitionEnd);
          });
          clearTimeout(fallbackTimeout);
          clearInterval(intervalId);
          clearInterval(progressInterval);
          
          // CRITICAL FIX: Ensure the copy has the final position before resolving
          elementsToAnimate.forEach(({ element, changes }) => {
            const elementName = element.getAttribute('data-figma-name') || element.getAttribute('data-figma-id');
            const computedStyle = window.getComputedStyle(element);
            console.log('🎯 FINAL POSITION BEFORE RESOLVE:', {
              elementName: elementName,
              finalLeft: computedStyle.left,
              finalTop: computedStyle.top,
              targetLeft: changes.positionX?.targetValue || 0,
              targetTop: changes.positionY?.targetValue || 0
            });
          });
          
          resolve();
        }
            }, parseFloat(transitionDuration || '0.3') * 1000 + 500);
            
            // Set up periodic position checking with simplified logging
            const progressCheckInterval = setInterval(checkAnimationProgressDetailed, 100); // Check every 100ms
            
            // Store the interval ID so we can clear it later
            const intervalId = progressCheckInterval;
            
            // Also listen for transitions on the copy element itself
            const onCopyTransitionEnd = (event) => {
              const propertyName = event.propertyName;
              
              // Since the copy itself isn't animated, we need to find which child element this transition belongs to
              // The transition end event on the copy usually means one of its animated children has completed
              const animatedElement = elementsToAnimate.find(({ element }) => 
                copy.contains(element)
              );
              
              if (animatedElement) {
                const elementKey = animatedElement.element;
                const expectedProperties = transitionProperties.get(elementKey) || [];
                
                // Check if this is a property we're expecting to transition
                if (expectedProperties.includes(propertyName)) {
                  // Remove this property from the expected list
                  const updatedProperties = expectedProperties.filter(p => p !== propertyName);
                  transitionProperties.set(elementKey, updatedProperties);
                  
                  // If all properties for this element have completed, mark the element as done
                  if (updatedProperties.length === 0 && !animatedElements.has(elementKey)) {
                    animatedElements.add(elementKey);
                    completedAnimations++;
                    
                    if (completedAnimations >= totalAnimations) {
                      console.log('🎯 All animations completed via property completion');
                      animationCompleted = true;
                      copy.removeEventListener('transitionend', onTransitionEnd);
                      copy.removeEventListener('transitionend', onCopyTransitionEnd);
                      childElements.forEach(child => {
                        child.removeEventListener('transitionend', onTransitionEnd);
                      });
                      clearTimeout(fallbackTimeout);
                      clearInterval(intervalId);
                      clearInterval(progressCheckInterval);
                      resolve();
                    }
                  }
                }
              }
            };
            
            // Add transition end listener to the copy element and all its children
            copy.addEventListener('transitionend', onTransitionEnd);
            copy.addEventListener('transitionend', onCopyTransitionEnd);
            
            // Also listen for transitions on child elements that might be animated
            const childElements = copy.querySelectorAll('*');
            childElements.forEach(child => {
              child.addEventListener('transitionend', onTransitionEnd);
            });
            
            // Fallback timeout in case transition events don't fire
            const fallbackTimeout = setTimeout(() => {
              // Check if animations are actually complete by examining the computed styles
              let actuallyCompleted = 0;
              elementsToAnimate.forEach(({ element, changes }) => {
                const computedStyle = window.getComputedStyle(element);
                
                // If transition is 'none' or empty, animation is likely complete
                if (!computedStyle.transition || computedStyle.transition === 'none' || computedStyle.transition === 'all 0s ease 0s') {
                  actuallyCompleted++;
                }
              });
              
              console.log('🎯 All animations completed via fallback timeout');
              animationCompleted = true;
              copy.removeEventListener('transitionend', onTransitionEnd);
              copy.removeEventListener('transitionend', onCopyTransitionEnd);
              childElements.forEach(child => {
                child.removeEventListener('transitionend', onTransitionEnd);
              });
              clearInterval(intervalId);
              clearInterval(progressInterval);
              resolve();
            }, parseFloat(transitionDuration || '0.3') * 1000 + 2000); // Add 2s buffer for more reliability
          } else {
            resolve();
          }
        });
      }
      
      // Helper function to get node data from element (placeholder)
      function getNodeDataFromElement(element) {
        // This would need to be implemented to extract Figma node data from DOM elements
        // For now, return a basic structure
        return {
          type: element.getAttribute('data-figma-type') || 'UNKNOWN',
          layoutPositioning: element.getAttribute('data-layout-positioning') || 'AUTO',
          layoutMode: element.getAttribute('data-layout-mode') || 'NONE'
        };
      }
      
      // Helper function to find elements with property changes
      function findElementsWithPropertyChanges(targetVariant, currentVariant, originalSourceVariant) {
        if (!currentVariant) {
          return [];
        }
        
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
        targetElements.forEach(function(element, index) {
          const targetName = element.getAttribute('data-figma-name') || element.getAttribute('data-figma-id');
          const sourceElement = sourceElementMap.get(targetName);
          
          if (sourceElement) {
            const changes = detectPropertyChanges(element, sourceElement, originalSourceVariant);
            
            if (changes.hasChanges) {
              elementsToAnimate.push({
                element: sourceElement,  // Use SOURCE element (from copy) instead of target
                sourceElement: sourceElement,
                changes: changes
              });
            }
          }
        });
        
        return elementsToAnimate;
      }

      // Helper function to detect property changes between elements
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
          
          // STEP 1: Check if the node has position changes using bounding rectangles (accounts for flexbox alignment)
          const targetRect = targetElement.getBoundingClientRect();
          
          // Get parent rectangles for relative positioning
          const sourceParent = sourceElement.parentElement;
          const targetParent = targetElement.parentElement;
          const targetParentRect = targetParent ? targetParent.getBoundingClientRect() : { left: 0, top: 0 };
          
          // For the source element (copy), use computed styles since it's positioned absolutely
          // For the target element, use bounding rect for accurate positioning
          // Calculate the position differences between source and target
          // Use the original source element's position, not the copy's position
          const originalSourceElement = originalSourceVariant.querySelector('[data-figma-name="' + sourceElement.getAttribute('data-figma-name') + '"]');
          const originalSourceStyle = originalSourceElement ? window.getComputedStyle(originalSourceElement) : sourceStyle;
          const originalSourceRect = originalSourceElement ? originalSourceElement.getBoundingClientRect() : sourceElement.getBoundingClientRect();
          const originalSourceParent = originalSourceElement ? originalSourceElement.parentElement : sourceElement.parentElement;
          const originalSourceParentRect = originalSourceParent ? originalSourceParent.getBoundingClientRect() : sourceParentRect;
          
          // Calculate positions based on element centers, not top-left corners
          const sourceCenterX = originalSourceRect.left + originalSourceRect.width / 2 - originalSourceParentRect.left;
          const sourceCenterY = originalSourceRect.top + originalSourceRect.height / 2 - originalSourceParentRect.top;
          const targetCenterX = targetRect.left + targetRect.width / 2 - targetParentRect.left;
          const targetCenterY = targetRect.top + targetRect.height / 2 - targetParentRect.top;
          
          // Convert center positions back to top-left positions for the element
          const sourceLeft = sourceCenterX - originalSourceRect.width / 2;
          const sourceTop = sourceCenterY - originalSourceRect.height / 2;
          const targetLeft = targetCenterX - targetRect.width / 2;
          const targetTop = targetCenterY - targetRect.height / 2;
          
          // STEP 2: Check if the node has ignore auto layout enabled
          const ignoreAutoLayout = sourceElement.getAttribute('data-layout-positioning') === 'ABSOLUTE';
          
          // STEP 3: Check if the node's parent has auto layout
          const parentHasAutoLayout = sourceParent && targetParent && 
            sourceParent.getAttribute('data-layout-mode') && 
            sourceParent.getAttribute('data-layout-mode') !== 'NONE';
          

          
          // Determine if this node should be animated based on the 3-point logic
          let shouldAnimatePosition = false;
          let animationType = 'ABSOLUTE';
          
          if (Math.abs(sourceLeft - targetLeft) > 1 || Math.abs(sourceTop - targetTop) > 1) {
            // Node has position changes
            if (ignoreAutoLayout) {
              // Node ignores auto layout - animate absolutely
              shouldAnimatePosition = true;
              animationType = 'ABSOLUTE';
              console.log('DEBUG: Node has position changes and ignores auto layout - animating absolutely');
            } else if (!parentHasAutoLayout) {
              // Node's parent doesn't have auto layout - animate absolutely
              shouldAnimatePosition = true;
              animationType = 'ABSOLUTE';
              console.log('DEBUG: Node has position changes and parent has no auto layout - animating absolutely');
            } else {
              // Node has position changes and parent has auto layout - ANIMATE the node
              // The node moves due to parent's alignment changes, so we animate it smoothly
              shouldAnimatePosition = true;
              animationType = 'ABSOLUTE';
              console.log('DEBUG: Node has position changes and parent has auto layout - ANIMATING (node moves due to parent alignment)');
            }
          } else {
            // No position changes - no animation needed
            shouldAnimatePosition = false;
            console.log('DEBUG: No position changes detected - no animation needed');
          }
          
          // Apply position changes if animation is needed
          if (shouldAnimatePosition) {
            if (Math.abs(sourceLeft - targetLeft) > 1) {
              changes.positionX.changed = true;
              changes.positionX.sourceValue = 0; // Start from 0 (additive animation)
              changes.positionX.targetValue = targetLeft - sourceLeft; // Add the difference to current position
              changes.hasChanges = true;
              
              // Debug the position calculation
              console.log('DEBUG: Additive position calculation for X:', {
                sourceLeft: sourceLeft,
                targetLeft: targetLeft,
                difference: targetLeft - sourceLeft,
                elementName: sourceElement.getAttribute('data-figma-name')
              });
            }
            
            if (Math.abs(sourceTop - targetTop) > 1) {
              changes.positionY.changed = true;
              changes.positionY.sourceValue = 0; // Start from 0 (additive animation)
              changes.positionY.targetValue = targetTop - sourceTop; // Add the difference to current position
              changes.hasChanges = true;
              
              // Debug the position calculation
              console.log('DEBUG: Additive position calculation for Y:', {
                sourceTop: sourceTop,
                targetTop: targetTop,
                difference: targetTop - sourceTop,
                elementName: sourceElement.getAttribute('data-figma-name')
              });
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
          
          // Only mark alignment changes as requiring animation if there's an actual position difference
          if (sourceStyle.justifyContent !== targetStyle.justifyContent) {
            changes.justifyContent.changed = true;
            changes.justifyContent.sourceValue = sourceStyle.justifyContent;
            changes.justifyContent.targetValue = targetStyle.justifyContent;
            
            // Only set hasChanges if there's an actual position difference to animate
            if (shouldAnimatePosition) {
              changes.hasChanges = true;
            }
          }
          
          if (sourceStyle.alignItems !== targetStyle.alignItems) {
            changes.alignItems.changed = true;
            changes.alignItems.sourceValue = sourceStyle.alignItems;
            changes.alignItems.targetValue = targetStyle.alignItems;
            
            // Only set hasChanges if there's an actual position difference to animate
            if (shouldAnimatePosition) {
              changes.hasChanges = true;
            }
          }
        } catch (error) {
          console.error('Error detecting property changes:', error);
        }

        return changes;
      }
      
      // Helper function to handle animated variant switching
      async function handleAnimatedVariantSwitch(sourceElement, destination, allVariants, transitionType, transitionDuration) {
        console.log('🔄 VARIANT SWITCH SEQUENCE START:', {
          sourceId: sourceElement.getAttribute('data-figma-id'),
          sourceName: sourceElement.getAttribute('data-figma-name'),
          destinationId: destination.getAttribute('data-figma-id'),
          destinationName: destination.getAttribute('data-figma-name'),
          transitionType: transitionType,
          transitionDuration: transitionDuration,
          totalVariants: allVariants.length
        });
        
        // Create a copy of the source variant
        const sourceCopy = createElementCopy(sourceElement);
        console.log('DEBUG: Element copy created successfully');
        
        // Insert the copy into the DOM
        const sourceParent = sourceElement.parentElement;
        sourceParent.appendChild(sourceCopy);
        console.log('DEBUG: Copy inserted into DOM');
        
        // Log the copy's position and visibility after insertion
        const copyRect = sourceCopy.getBoundingClientRect();
        const copyStyle = window.getComputedStyle(sourceCopy);
        console.log('DEBUG: Copy after insertion:');
        console.log('  position: ' + copyStyle.position);
        console.log('  top: ' + copyStyle.top);
        console.log('  left: ' + copyStyle.left);
        console.log('  z-index: ' + copyStyle.zIndex);
        console.log('  opacity: ' + copyStyle.opacity);
        console.log('  visibility: ' + copyStyle.visibility);
        console.log('  display: ' + copyStyle.display);
        console.log('  bounding rect: ' + copyRect);
        
        // Hide the original source element and all other variants
        sourceElement.style.opacity = '0';
        sourceElement.style.visibility = 'hidden';
        
        allVariants.forEach(variant => {
          if (variant !== sourceElement) {
            variant.style.opacity = '0';
            variant.style.visibility = 'hidden';
          }
        });
        
        // Prepare the destination variant but keep it hidden for now
        destination.classList.add('variant-active');
        destination.classList.remove('variant-hidden');
        destination.style.visibility = 'hidden';
        destination.style.opacity = '0';
        
        // DON'T pre-position the destination variant - let the copy do all the animation work
        // The destination variant should remain in its natural position
        
        // Force reflow
        destination.offsetHeight;
        
        // Animate the copy to match the destination
        await animateCopyToDestination(sourceCopy, destination, sourceElement, transitionType, transitionDuration);
        
        // Animation complete - simply remove the copy and show the destination variant
        console.log('✅ ANIMATION COMPLETED - removing copy and showing destination variant');
        sourceCopy.remove();
        
        // Hide the original source element permanently
        sourceElement.style.opacity = '0';
        sourceElement.style.visibility = 'hidden';
        sourceElement.classList.add('variant-hidden');
        sourceElement.classList.remove('variant-active');
        
        // Simply show the destination variant - don't touch its positioning
        console.log('🎯 SHOWING DESTINATION VARIANT:', {
          destinationId: destination.getAttribute('data-figma-id'),
          destinationName: destination.getAttribute('data-figma-name'),
          visibility: 'visible',
          opacity: '1',
          display: 'flex'
        });
        destination.style.visibility = 'visible';
        destination.style.opacity = '1';
        destination.style.display = 'flex';
        destination.classList.add('variant-active');
        destination.classList.remove('variant-hidden');
        
        // Hide all other variants
        allVariants.forEach(variant => {
          if (variant !== destination) {
            variant.classList.add('variant-hidden');
            variant.classList.remove('variant-active');
            // Don't reset positions for hidden variants - let them keep their natural positions
            if (!variant.style.position || variant.style.position === 'static') {
              variant.style.position = 'relative';
            }
            variant.style.opacity = '0';
            variant.style.visibility = 'hidden';
          }
        });
        
        // Force a reflow to ensure the position changes are applied before starting reactions
        destination.offsetHeight;
        
        // Start timeout reactions
        console.log('⏰ STARTING TIMEOUT REACTIONS for destination variant');
        startTimeoutReactionsForNewlyActiveVariant(destination);
        startTimeoutReactionsForNestedComponents(destination);
        
        console.log('✅ VARIANT SWITCH SEQUENCE COMPLETED:', {
          sourceId: sourceElement.getAttribute('data-figma-id'),
          destinationId: destination.getAttribute('data-figma-id'),
          transitionType: transitionType
        });
      }
      
      // Helper function to perform instant variant switch
      function performInstantVariantSwitch(allVariants, destination) {
        console.log('⚡ PERFORMING INSTANT VARIANT SWITCH');
        
        // Hide all variants
        allVariants.forEach(variant => {
          variant.classList.add('variant-hidden');
          variant.classList.remove('variant-active');
          variant.style.display = 'none';
          variant.style.visibility = 'hidden';
          variant.style.opacity = '0';
          // Don't reset positions for hidden variants - let them keep their natural positions
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
        // Don't reset position for destination - let it keep its natural position
        if (!destination.style.position || destination.style.position === 'static') {
          destination.style.position = 'relative';
        }
        
        console.log('✅ INSTANT VARIANT SWITCH COMPLETED:', {
          destinationId: destination.getAttribute('data-figma-id'),
          destinationName: destination.getAttribute('data-figma-name'),
          display: destination.style.display,
          visibility: destination.style.visibility,
          opacity: destination.style.opacity
        });
        
        // Start timeout reactions
        startTimeoutReactionsForNewlyActiveVariant(destination);
        startTimeoutReactionsForNestedComponents(destination);
      }
      
      // Main reaction handler function
      function handleReaction(sourceElement, destinationId, transitionType, transitionDuration) {
        console.log('🎯 REACTION TRIGGERED:', {
          sourceId: sourceElement.getAttribute('data-figma-id'),
          sourceName: sourceElement.getAttribute('data-figma-name'),
          destinationId: destinationId,
          transitionType: transitionType,
          transitionDuration: transitionDuration
        });
        
        // Prevent multiple simultaneous transitions
        if (isTransitionInProgress) {
          console.log('⚠️ TRANSITION ALREADY IN PROGRESS - skipping');
          return;
        }
        
        // Set transition lock
        isTransitionInProgress = true;
        
        // Safety timeout
        const safetyTimeout = setTimeout(() => {
          if (isTransitionInProgress) {
            console.log('WARNING: Transition lock stuck, forcing release');
            isTransitionInProgress = false;
            currentTransitionPromise = null;
          }
        }, 10000); // Increased to 10 seconds
        
        if (destinationId) {
          const destination = document.querySelector(\`[data-figma-id="\${destinationId}"]\`);
          
          if (!destination) {
            console.error('Destination element not found:', destinationId);
            clearTimeout(safetyTimeout);
            isTransitionInProgress = false;
            return;
          }
          
          // Check if this is a variant switch within a component set
          const sourceComponentSet = sourceElement.closest('[data-figma-type="COMPONENT_SET"]');
          const destinationComponentSet = destination.closest('[data-figma-type="COMPONENT_SET"]');
          
          if (sourceComponentSet && destinationComponentSet && sourceComponentSet === destinationComponentSet) {
            // This is a variant switch
            console.log('🔄 VARIANT SWITCH DETECTED:', {
              componentSetId: sourceComponentSet.getAttribute('data-figma-id'),
              componentSetName: sourceComponentSet.getAttribute('data-figma-name')
            });
            
            const componentSet = sourceComponentSet;
            const allVariants = Array.from(componentSet.children).filter(child => 
              child.getAttribute('data-figma-type') === 'COMPONENT'
            );
            
            console.log('📊 VARIANT ANALYSIS:', {
              totalVariants: allVariants.length,
              variantIds: allVariants.map(v => v.getAttribute('data-figma-id')),
              variantNames: allVariants.map(v => v.getAttribute('data-figma-name'))
            });
            
            // Check if transition type is null/undefined (instant transition) or a recognized animated type
            const isAnimated = transitionType === 'SMART_ANIMATE' || 
                              transitionType === 'BOUNCY' || 
                              transitionType === 'EASE_IN_AND_OUT' || 
                              transitionType === 'EASE_IN_AND_OUT_BACK' || 
                              transitionType === 'EASE_IN' || 
                              transitionType === 'EASE_OUT' || 
                              transitionType === 'LINEAR' || 
                              transitionType === 'GENTLE';
            
            // Only use fallback values if we have a recognized animated transition type
            const effectiveTransitionType = isAnimated ? (transitionType || 'EASE_OUT') : transitionType;
            const effectiveTransitionDuration = isAnimated ? (transitionDuration || '0.3') : transitionDuration;
            
            if (isAnimated) {
              console.log('🎬 ANIMATED TRANSITION SELECTED:', {
                transitionType: effectiveTransitionType,
                transitionDuration: effectiveTransitionDuration
              });
              
              currentTransitionPromise = handleAnimatedVariantSwitch(sourceElement, destination, allVariants, effectiveTransitionType, effectiveTransitionDuration)
                .then(() => {
                  clearTimeout(safetyTimeout);
                  isTransitionInProgress = false;
                  currentTransitionPromise = null;
                })
                .catch((error) => {
                  console.error('Modular animation error:', error);
                  clearTimeout(safetyTimeout);
                  isTransitionInProgress = false;
                  currentTransitionPromise = null;
                });
            } else {
              console.log('⚡ INSTANT TRANSITION SELECTED:', {
                transitionType: effectiveTransitionType,
                reason: 'Not recognized as animated transition type'
              });
              
              performInstantVariantSwitch(allVariants, destination);
              clearTimeout(safetyTimeout);
              isTransitionInProgress = false;
              currentTransitionPromise = null;
            }
          } else {
            // This is a regular transition (not variant switching)
            if (transitionType === 'DISSOLVE') {
              console.log('🎭 DISSOLVE TRANSITION SELECTED:', {
                transitionType: transitionType,
                transitionDuration: transitionDuration
              });
              
              // Hide source element
              sourceElement.style.opacity = '0';
              sourceElement.style.visibility = 'hidden';
              
              // Show destination after delay
              setTimeout(() => {
                destination.classList.add('variant-active');
                destination.classList.remove('variant-hidden');
                destination.style.opacity = '1';
                destination.style.visibility = 'visible';
                
                startTimeoutReactionsForNewlyActiveVariant(destination);
                startTimeoutReactionsForNestedComponents(destination);
                
                clearTimeout(safetyTimeout);
                isTransitionInProgress = false;
                currentTransitionPromise = null;
              }, parseFloat(transitionDuration || '300'));
            } else {
              console.log('⚡ INSTANT TRANSITION SELECTED (non-variant):', {
                transitionType: transitionType,
                reason: 'Not a dissolve transition'
              });
              
              destination.classList.add('variant-active');
              destination.classList.remove('variant-hidden');
              destination.style.opacity = '1';
              destination.style.visibility = 'visible';
              
              startTimeoutReactionsForNewlyActiveVariant(destination);
              startTimeoutReactionsForNestedComponents(destination);
              
              clearTimeout(safetyTimeout);
              isTransitionInProgress = false;
              currentTransitionPromise = null;
            }
          }
        } else {
          // Handle case where destinationId is null (final variant - no further transitions)
          clearTimeout(safetyTimeout);
          isTransitionInProgress = false;
          currentTransitionPromise = null;
        }
      }
      
      // Global timer tracking
      const activeTimers = new Map();
      
      // Function to start timeout reactions for nested components within a parent element
      function startTimeoutReactionsForNestedComponents(parentElement) {
        if (!parentElement) return;
        
        // Find all nested components with timeout reactions within the parent
        const nestedComponents = parentElement.querySelectorAll('[data-has-reactions="true"]');
        
        nestedComponents.forEach(element => {
          const elementId = element.getAttribute('data-figma-id');
          const elementName = element.getAttribute('data-figma-name');
          const computedStyle = window.getComputedStyle(element);
          
          // Only start timers for elements that are actually visible
          if (computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden') {
            const trigger = JSON.parse(element.getAttribute('data-reaction-trigger') || '{}');
            
            if (trigger.type === 'AFTER_TIMEOUT' && !activeTimers.has(elementId)) {
              console.log('DEBUG: Starting timeout reaction for nested component:', elementId, 'name:', elementName);
              const timeoutId = setTimeout(() => {
                activeTimers.delete(elementId);
                const actionType = element.getAttribute('data-reaction-action-type');
                const destinationId = element.getAttribute('data-reaction-destination');
                const transitionType = element.getAttribute('data-reaction-transition-type');
                const transitionDuration = element.getAttribute('data-reaction-transition-duration');
                
                handleReaction(element, destinationId, transitionType, transitionDuration);
              }, (trigger.timeout || 0) * 1000);
              activeTimers.set(elementId, timeoutId);
            } else if (activeTimers.has(elementId)) {
              console.log('DEBUG: Skipping nested component', elementId, 'name:', elementName, '- timer already active');
            }
          } else {
            console.log('DEBUG: Skipping nested component', elementId, 'name:', elementName, '- not visible');
          }
        });
      }
      
      // Function to start timeout reactions for a specific newly active variant
      function startTimeoutReactionsForNewlyActiveVariant(newlyActiveElement) {
        if (!newlyActiveElement) return;
        
        const elementId = newlyActiveElement.getAttribute('data-figma-id');
        const elementName = newlyActiveElement.getAttribute('data-figma-name');
        const parentComponent = newlyActiveElement.closest('[data-figma-type="COMPONENT_SET"]');
        const parentName = parentComponent ? parentComponent.getAttribute('data-figma-name') : 'none';
        
        console.log('DEBUG: Processing newly active variant:', elementId, 'name:', elementName, 'parent:', parentName);
        
        // Only start timers for variants that are actually visible (not hidden by CSS)
        const computedStyle = window.getComputedStyle(newlyActiveElement);
        
        if (computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden') {
          const trigger = JSON.parse(newlyActiveElement.getAttribute('data-reaction-trigger') || '{}');
          const actionType = newlyActiveElement.getAttribute('data-reaction-action-type');
          const destinationId = newlyActiveElement.getAttribute('data-reaction-destination');
          const transitionType = newlyActiveElement.getAttribute('data-reaction-transition-type');
          const transitionDuration = newlyActiveElement.getAttribute('data-reaction-transition-duration');
          
          // Handle timeout reactions only for active variants that don't have an active timer
          if (trigger.type === 'AFTER_TIMEOUT' && !activeTimers.has(elementId)) {
            console.log('DEBUG: Starting timeout reaction for newly active variant:', elementId, 'name:', elementName, 'timeout:', trigger.timeout, 'parent:', parentName);
            const timeoutId = setTimeout(() => {
              activeTimers.delete(elementId); // Clear the timer when it completes
              handleReaction(newlyActiveElement, destinationId, transitionType, transitionDuration);
            }, (trigger.timeout || 0) * 1000);
            activeTimers.set(elementId, timeoutId);
          } else if (activeTimers.has(elementId)) {
            console.log('DEBUG: Skipping newly active variant', elementId, 'name:', elementName, '- timer already active');
          }
          
          // CRITICAL FIX: Also start timeout reactions for any nested components within this newly active variant
          startTimeoutReactionsForNestedComponents(newlyActiveElement);
        } else {
          console.log('DEBUG: Skipping newly active variant', elementId, 'name:', elementName, '- not visible (display:', computedStyle.display, 'visibility:', computedStyle.visibility, ')');
        }
      }
      
      // Make functions globally available
      window.handleReaction = handleReaction;
      window.startTimeoutReactionsForNewlyActiveVariant = startTimeoutReactionsForNewlyActiveVariant;
      window.startTimeoutReactionsForNestedComponents = startTimeoutReactionsForNestedComponents;
    `;
}

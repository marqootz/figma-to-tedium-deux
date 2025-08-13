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
              const elementName = element.getAttribute('data-figma-name');
              const isFrame1232 = elementName === 'Frame 1232';
              
              if (property === 'translateX') {
                // For position changes, we need to move relative to the current position
                const currentLeft = parseFloat(element.style.left) || 0;
                const newLeft = currentLeft + targetValue;
                element.style.left = \`\${newLeft}px\`;
              } else if (property === 'translateY') {
                // For position changes, we need to move relative to the current position
                const currentTop = parseFloat(element.style.top) || 0;
                const newTop = currentTop + targetValue;
                element.style.top = \`\${newTop}px\`;
                if (isFrame1232) {
                  console.log('🎯 Frame 1232 Y:', currentTop, '->', newTop);
                }
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
        
        // Preserve current positions from source element
        const copyElements = copy.querySelectorAll('*');
        copyElements.forEach(element => {
          if (element.hasAttribute('data-figma-id')) {
            const sourceElementId = element.getAttribute('data-figma-id');
            const sourceElementMatch = sourceElement.querySelector(\`[data-figma-id="\${sourceElementId}"]\`);
            
            if (sourceElementMatch) {
              const currentLeft = sourceElementMatch.style.left || window.getComputedStyle(sourceElementMatch).left || '0px';
              const currentTop = sourceElementMatch.style.top || window.getComputedStyle(sourceElementMatch).top || '0px';
              
              element.style.position = 'relative';
              element.style.left = currentLeft;
              element.style.top = currentTop;
              
              element.style.removeProperty('transform');
              element.style.removeProperty('margin');
              element.style.removeProperty('padding');
              
              element.style.setProperty('left', currentLeft, 'important');
              element.style.setProperty('top', currentTop, 'important');
            } else {
              element.style.position = 'relative';
              element.style.left = '0px';
              element.style.top = '0px';
            }
          }
        });
        
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

        // Debug: Log the initial visibility properties of all nodes in the copy
        console.log('DEBUG: Copy element visibility properties:');
        const nodesWithFigmaId = copy.querySelectorAll('[data-figma-id]');
        console.log('DEBUG: Found', nodesWithFigmaId.length, 'nodes with data-figma-id in copy');
        
        nodesWithFigmaId.forEach((node, index) => {
          const figmaName = node.getAttribute('data-figma-name') || 'Unknown';
          console.log('  Node', index + 1, '(' + figmaName + '):');
          console.log('    opacity:', window.getComputedStyle(node).opacity);
          console.log('    display:', window.getComputedStyle(node).display);
          console.log('    visibility:', window.getComputedStyle(node).visibility);
          console.log('    position:', window.getComputedStyle(node).position);
          console.log('    left:', window.getComputedStyle(node).left);
          console.log('    top:', window.getComputedStyle(node).top);
        });
        
        // Log the opacity and display properties of each node in the copy
        console.log('DEBUG: Copy element visibility properties:');
        const copyNodes = copy.querySelectorAll('[data-figma-id]');
        console.log('DEBUG: Found', copyNodes.length, 'nodes with data-figma-id in copy');
        copyNodes.forEach((node, index) => {
          const nodeName = node.getAttribute('data-figma-name') || node.getAttribute('data-figma-id');
          const computedStyle = window.getComputedStyle(node);
          const opacity = computedStyle.opacity;
          const display = computedStyle.display;
          const visibility = computedStyle.visibility;
          const position = computedStyle.position;
          const left = computedStyle.left;
          const top = computedStyle.top;
          
          console.log('  Node ' + (index + 1) + ' (' + nodeName + '):');
          console.log('    opacity: ' + opacity);
          console.log('    display: ' + display);
          console.log('    visibility: ' + visibility);
          console.log('    position: ' + position);
          console.log('    left: ' + left);
          console.log('    top: ' + top);
        });
        
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
          
          console.log('DEBUG: Checking content for', copyElementName);
          console.log('  Copy textContent:', copyElement.textContent);
          console.log('  Copy innerHTML:', copyElement.innerHTML.substring(0, 200));
          if (destinationElement) {
            console.log('  Destination textContent:', destinationElement.textContent);
            console.log('  Destination innerHTML:', destinationElement.innerHTML.substring(0, 200));
          }
          
          if (destinationElement) {
            // Update text content
            if (destinationElement.textContent !== copyElement.textContent) {
              const oldText = copyElement.textContent;
              copyElement.textContent = destinationElement.textContent;
              console.log('DEBUG: Updated text content for', copyElementName, 'from', oldText, 'to', destinationElement.textContent);
            }
            
            // Update innerHTML for more complex content
            if (destinationElement.innerHTML !== copyElement.innerHTML) {
              const oldHTML = copyElement.innerHTML;
              copyElement.innerHTML = destinationElement.innerHTML;
              console.log('DEBUG: Updated innerHTML for', copyElementName, 'from', oldHTML.substring(0, 100), 'to', destinationElement.innerHTML.substring(0, 100));
            }
            
            // Update specific attributes that might contain content
            const contentAttributes = ['data-content', 'data-text', 'title', 'alt'];
            contentAttributes.forEach(attr => {
              const destValue = destinationElement.getAttribute(attr);
              const copyValue = copyElement.getAttribute(attr);
              if (destValue !== copyValue && destValue !== null) {
                copyElement.setAttribute(attr, destValue);
                console.log('DEBUG: Updated attribute', attr, 'for', copyElementName, 'to', destValue);
              }
            });
          }
        });
        
        // Log the visibility properties after content update
        console.log('DEBUG: Copy element visibility properties after content update:');
        const copyNodes = copy.querySelectorAll('[data-figma-id]');
        copyNodes.forEach((node, index) => {
          const nodeName = node.getAttribute('data-figma-name') || node.getAttribute('data-figma-id');
          const computedStyle = window.getComputedStyle(node);
          const opacity = computedStyle.opacity;
          const display = computedStyle.display;
          const visibility = computedStyle.visibility;
          const position = computedStyle.position;
          const left = computedStyle.left;
          const top = computedStyle.top;
          
          console.log('  Node ' + (index + 1) + ' (' + nodeName + '):');
          console.log('    opacity: ' + opacity);
          console.log('    display: ' + display);
          console.log('    visibility: ' + visibility);
          console.log('    position: ' + position);
          console.log('    left: ' + left);
          console.log('    top: ' + top);
        });

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
      function animateCopyToDestination(copy, destination, transitionType, transitionDuration) {
        return new Promise((resolve) => {
          // Update copy content to match destination content
          updateCopyContentToMatchDestination(copy, destination);
          
          // Find elements with property changes
          const elementsToAnimate = findElementsWithPropertyChanges(destination, copy);
          
          const easingFunction = getEasingFunction(transitionType);
          const duration = parseFloat(transitionDuration || '0.3');
          
          if (elementsToAnimate.length > 0) {
            console.log('DEBUG: Animating copy with', elementsToAnimate.length, 'elements using modular system');
            
            // Setup animation for each element using the changes already detected
            elementsToAnimate.forEach(({ element, sourceElement, changes }) => {
              console.log('DEBUG: Processing element with changes:', changes);
              
              // Convert the detected changes to animation changes
              const animationChanges = [];
              
              // Handle position changes
              if (changes.positionX && changes.positionX.changed) {
                animationChanges.push({
                  type: AnimationType.TRANSFORM,
                  property: 'translateX',
                  sourceValue: changes.positionX.sourceValue,
                  targetValue: changes.positionX.targetValue,
                  changed: true,
                  translationCondition: TranslationCondition.ABSOLUTE
                });
              }
              
              if (changes.positionY && changes.positionY.changed) {
                animationChanges.push({
                  type: AnimationType.TRANSFORM,
                  property: 'translateY',
                  sourceValue: changes.positionY.sourceValue,
                  targetValue: changes.positionY.targetValue,
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
            const animatedElements = new Set();
            const transitionProperties = new Map(); // Track which properties are being transitioned
            
            // Also track which elements have been processed to avoid double-counting
            const processedElements = new Set();
            
            // Set up transition properties for monitoring
            elementsToAnimate.forEach(({ element, changes }, index) => {
              const elementName = element.getAttribute('data-figma-name') || element.getAttribute('data-figma-id');
              const elementProperties = [];
              
              if (changes.positionX && changes.positionX.changed) {
                elementProperties.push('left', 'top');
              }
              if (changes.positionY && changes.positionY.changed) {
                elementProperties.push('left', 'top');
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
              
              console.log('DEBUG: Element', elementName, 'will transition properties:', uniqueProperties);
            });
            
            const onTransitionEnd = (event) => {
              const targetElement = event.target;
              const propertyName = event.propertyName;
              const elementName = targetElement.getAttribute('data-figma-name') || targetElement.getAttribute('data-figma-id');
              
              console.log('DEBUG: Transition end event for property:', propertyName, 'on element:', elementName);
              
              // Find which element this transition belongs to
              const animatedElement = elementsToAnimate.find(({ element }) => 
                targetElement === element || element.contains(targetElement)
              );
              
              if (animatedElement) {
                const elementKey = animatedElement.element;
                const expectedProperties = transitionProperties.get(elementKey) || [];
                
                console.log('DEBUG: Found matching animated element, expected properties:', expectedProperties);
                
                // Check if this is a property we're expecting to transition
                if (expectedProperties.includes(propertyName)) {
                  // Remove this property from the expected list
                  const updatedProperties = expectedProperties.filter(p => p !== propertyName);
                  transitionProperties.set(elementKey, updatedProperties);
                  
                  console.log('DEBUG: Property', propertyName, 'transition completed, remaining properties for this element:', updatedProperties);
                  
                  // If all properties for this element have completed, mark the element as done
                  if (updatedProperties.length === 0 && !animatedElements.has(elementKey)) {
                    animatedElements.add(elementKey);
                    completedAnimations++;
                    console.log('DEBUG: All transitions completed for element:', completedAnimations, '/', totalAnimations);
                    
                    if (completedAnimations >= totalAnimations) {
                      console.log('🎯 All animations completed');
                      copy.removeEventListener('transitionend', onTransitionEnd);
                      copy.removeEventListener('transitionend', onCopyTransitionEnd);
                      childElements.forEach(child => {
                        child.removeEventListener('transitionend', onTransitionEnd);
                      });
                      clearTimeout(fallbackTimeout);
                      clearInterval(intervalId);
                      resolve();
                    }
                  }
                } else {
                  console.log('DEBUG: Ignoring transition for unexpected property:', propertyName);
                }
              } else {
                // Check if this is a child element that might be part of an animated element
                const parentAnimatedElement = elementsToAnimate.find(({ element }) => 
                  element.contains(targetElement)
                );
                
                if (parentAnimatedElement && !processedElements.has(targetElement)) {
                  processedElements.add(targetElement);
                  console.log('DEBUG: Child element transition detected, marking parent as potentially complete');
                  
                  // For child elements, we'll use a simpler approach - just count unique elements
                  const elementKey = parentAnimatedElement.element;
                  if (!animatedElements.has(elementKey)) {
                    animatedElements.add(elementKey);
                    completedAnimations++;
                    console.log('DEBUG: Child transition completed for element:', completedAnimations, '/', totalAnimations, 'for element:', targetElement.getAttribute('data-figma-name') || targetElement.getAttribute('data-figma-id'));
                    
                    if (completedAnimations >= totalAnimations) {
                      console.log('DEBUG: All animations completed via child transitions');
                      copy.removeEventListener('transitionend', onTransitionEnd);
                      copy.removeEventListener('transitionend', onCopyTransitionEnd);
                      childElements.forEach(child => {
                        child.removeEventListener('transitionend', onTransitionEnd);
                      });
                      clearTimeout(fallbackTimeout);
                      clearInterval(intervalId);
                      resolve();
                    }
                  }
                } else {
                  // Check if this is a transition on the copy element itself (which contains animated children)
                  if (targetElement === copy) {
                    console.log('DEBUG: Transition end event on copy element - this should be handled by onCopyTransitionEnd');
                  } else {
                    console.log('DEBUG: Transition end event for element not in our animation list');
                  }
                }
              }
            };
            
            // Add a more aggressive monitoring approach - check if animations are actually complete
            const checkAnimationProgress = () => {
              console.log('DEBUG: Position check running...');
              let actuallyCompleted = 0;
              elementsToAnimate.forEach(({ element, changes }) => {
                const computedStyle = window.getComputedStyle(element);
                const elementName = element.getAttribute('data-figma-name') || element.getAttribute('data-figma-id');
                
                // Check if the element has reached its target position
                let isComplete = false;
                
                if (changes.positionY && changes.positionY.changed) {
                  const currentTop = parseFloat(computedStyle.top) || 0;
                  const targetTop = changes.positionY.targetValue;
                  const difference = Math.abs(currentTop - targetTop);
                  
                  console.log('DEBUG: Position check for', elementName, 'currentTop:', currentTop, 'targetTop:', targetTop, 'difference:', difference);
                  
                  if (difference < 5) { // Allow for small rounding differences
                    isComplete = true;
                    console.log('DEBUG: Element', elementName, 'position animation appears complete:', currentTop, '->', targetTop);
                  }
                }
                
                if (changes.positionX && changes.positionX.changed) {
                  const currentLeft = parseFloat(computedStyle.left) || 0;
                  const targetLeft = changes.positionX.targetValue;
                  const difference = Math.abs(currentLeft - targetLeft);
                  
                  console.log('DEBUG: Position check for', elementName, 'currentLeft:', currentLeft, 'targetLeft:', targetLeft, 'difference:', difference);
                  
                  if (difference < 5) { // Allow for small rounding differences
                    isComplete = true;
                    console.log('DEBUG: Element', elementName, 'position animation appears complete:', currentLeft, '->', targetLeft);
                  }
                }
                
                if (isComplete && !animatedElements.has(element)) {
                  animatedElements.add(element);
                  actuallyCompleted++;
                  console.log('DEBUG: Element', elementName, 'marked as complete via position check');
                }
              });
              
              if (actuallyCompleted > 0) {
                completedAnimations += actuallyCompleted;
                console.log('DEBUG: Position check completed animations:', completedAnimations, '/', totalAnimations);
                
                if (completedAnimations >= totalAnimations) {
                  console.log('DEBUG: All animations completed via position check');
                  copy.removeEventListener('transitionend', onTransitionEnd);
                  copy.removeEventListener('transitionend', onCopyTransitionEnd);
                  childElements.forEach(child => {
                    child.removeEventListener('transitionend', onTransitionEnd);
                  });
                  clearTimeout(fallbackTimeout);
                  clearInterval(progressCheckInterval);
                  resolve();
                }
              }
            };
            
            // Set up periodic position checking
            const progressCheckInterval = setInterval(checkAnimationProgress, 100); // Check every 100ms
            console.log('DEBUG: Position-based monitoring interval set up');
            
            // Store the interval ID so we can clear it later
            const intervalId = progressCheckInterval;
            
            // Also listen for transitions on the copy element itself
            const onCopyTransitionEnd = (event) => {
              const propertyName = event.propertyName;
              console.log('DEBUG: Copy transition end event fired for property:', propertyName);
              
              // Since the copy itself isn't animated, we need to find which child element this transition belongs to
              // The transition end event on the copy usually means one of its animated children has completed
              const animatedElement = elementsToAnimate.find(({ element }) => 
                copy.contains(element)
              );
              
              if (animatedElement) {
                const elementKey = animatedElement.element;
                const expectedProperties = transitionProperties.get(elementKey) || [];
                
                console.log('DEBUG: Found animated child element in copy, expected properties:', expectedProperties);
                
                // Check if this is a property we're expecting to transition
                if (expectedProperties.includes(propertyName)) {
                  // Remove this property from the expected list
                  const updatedProperties = expectedProperties.filter(p => p !== propertyName);
                  transitionProperties.set(elementKey, updatedProperties);
                  
                  console.log('DEBUG: Property', propertyName, 'transition completed on copy child, remaining properties for this element:', updatedProperties);
                  
                  // If all properties for this element have completed, mark the element as done
                  if (updatedProperties.length === 0 && !animatedElements.has(elementKey)) {
                    animatedElements.add(elementKey);
                    completedAnimations++;
                    console.log('DEBUG: All transitions completed for copy child element:', completedAnimations, '/', totalAnimations);
                    
                    if (completedAnimations >= totalAnimations) {
                      console.log('DEBUG: All animations completed');
                      copy.removeEventListener('transitionend', onTransitionEnd);
                      copy.removeEventListener('transitionend', onCopyTransitionEnd);
                      childElements.forEach(child => {
                        child.removeEventListener('transitionend', onTransitionEnd);
                      });
                      clearTimeout(fallbackTimeout);
                      clearInterval(intervalId);
                      resolve();
                    }
                  }
                } else {
                  console.log('DEBUG: Ignoring copy transition for unexpected property:', propertyName);
                }
              } else {
                console.log('DEBUG: Copy transition end event but no animated children found');
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
              console.log('DEBUG: Animation fallback timeout reached');
              console.log('DEBUG: Completed animations:', completedAnimations, '/', totalAnimations);
              console.log('DEBUG: Remaining transition properties:', Array.from(transitionProperties.entries()));
              
              // Check if animations are actually complete by examining the computed styles
              let actuallyCompleted = 0;
              elementsToAnimate.forEach(({ element, changes }) => {
                const computedStyle = window.getComputedStyle(element);
                const elementName = element.getAttribute('data-figma-name') || element.getAttribute('data-figma-id');
                
                console.log('DEBUG: Checking if element', elementName, 'animation is actually complete:');
                console.log('  transition:', computedStyle.transition);
                console.log('  transform:', computedStyle.transform);
                console.log('  left:', computedStyle.left);
                console.log('  top:', computedStyle.top);
                
                // If transition is 'none' or empty, animation is likely complete
                if (!computedStyle.transition || computedStyle.transition === 'none' || computedStyle.transition === 'all 0s ease 0s') {
                  actuallyCompleted++;
                  console.log('DEBUG: Element', elementName, 'appears to be complete (no active transition)');
                }
              });
              
              console.log('DEBUG: Actually completed animations:', actuallyCompleted, '/', totalAnimations);
              
              copy.removeEventListener('transitionend', onTransitionEnd);
              copy.removeEventListener('transitionend', onCopyTransitionEnd);
              childElements.forEach(child => {
                child.removeEventListener('transitionend', onTransitionEnd);
              });
              clearInterval(intervalId);
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
      function findElementsWithPropertyChanges(targetVariant, currentVariant) {
        console.log('DEBUG: findElementsWithPropertyChanges called');
        console.log('  Target variant ID:', targetVariant.getAttribute('data-figma-id'), 'Name:', targetVariant.getAttribute('data-figma-name'));
        console.log('  Current variant ID:', currentVariant.getAttribute('data-figma-id'), 'Name:', currentVariant.getAttribute('data-figma-name'));
        
        if (!currentVariant) {
          console.log('DEBUG: No current variant provided, returning empty array');
          return [];
        }
        
        const targetElements = targetVariant.querySelectorAll('[data-figma-id]');
        const sourceElements = currentVariant.querySelectorAll('[data-figma-id]');
        const sourceElementMap = new Map();
        const elementsToAnimate = [];

        console.log('DEBUG: Found', targetElements.length, 'target elements and', sourceElements.length, 'source elements');

        // Build source element map by name
        sourceElements.forEach(function(sourceElement) {
          const sourceName = sourceElement.getAttribute('data-figma-name') || sourceElement.getAttribute('data-figma-id');
          if (sourceName) {
            sourceElementMap.set(sourceName, sourceElement);
            console.log('  Mapped source element:', sourceName, '->', sourceElement.getAttribute('data-figma-id'));
          }
        });

        // Analyze each target element for property changes
        targetElements.forEach(function(element, index) {
          const targetName = element.getAttribute('data-figma-name') || element.getAttribute('data-figma-id');
          const sourceElement = sourceElementMap.get(targetName);
          
          console.log('DEBUG: Analyzing target element ' + (index + 1) + ':', targetName);
          console.log('  Target element ID:', element.getAttribute('data-figma-id'));
          console.log('  Source element found:', !!sourceElement);
          
          if (sourceElement) {
            console.log('  Source element ID:', sourceElement.getAttribute('data-figma-id'));
            const changes = detectPropertyChanges(element, sourceElement);
            
            if (changes.hasChanges) {
              elementsToAnimate.push({
                element: sourceElement,  // Use SOURCE element (from copy) instead of target
                sourceElement: sourceElement,
                changes: changes
              });
            }
          } else {
            console.log('DEBUG: No matching source element found for:', targetName);
          }
        });
        
        console.log('DEBUG: Returning', elementsToAnimate.length, 'elements to animate');
        return elementsToAnimate;
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
          alignItems: { changed: false, sourceValue: null, targetValue: null }
        };

        try {
          const sourceStyle = window.getComputedStyle(sourceElement);
          const targetStyle = window.getComputedStyle(targetElement);
          
          // STEP 1: Check if the node has position changes using bounding rectangles (accounts for flexbox alignment)
          const sourceRect = sourceElement.getBoundingClientRect();
          const targetRect = targetElement.getBoundingClientRect();
          
          // Get parent rectangles for relative positioning
          const sourceParent = sourceElement.parentElement;
          const targetParent = targetElement.parentElement;
          const sourceParentRect = sourceParent ? sourceParent.getBoundingClientRect() : { left: 0, top: 0 };
          const targetParentRect = targetParent ? targetParent.getBoundingClientRect() : { left: 0, top: 0 };
          
          // Calculate relative positions within their containers
          const sourceLeft = sourceRect.left - sourceParentRect.left;
          const targetLeft = targetRect.left - targetParentRect.left;
          const sourceTop = sourceRect.top - sourceParentRect.top;
          const targetTop = targetRect.top - targetParentRect.top;
          
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
            const elementName = sourceElement.getAttribute('data-figma-name');
            const isFrame1232 = elementName === 'Frame 1232';
            
            if (Math.abs(sourceLeft - targetLeft) > 1) {
              changes.positionX.changed = true;
              changes.positionX.sourceValue = 0; // Start from current position (0 since we're animating the copy)
              changes.positionX.targetValue = targetLeft - sourceLeft; // Calculate the difference to move
              changes.hasChanges = true;
              if (isFrame1232) {
                console.log('🎯 Frame 1232 X movement:', sourceLeft, '->', targetLeft, 'difference:', targetLeft - sourceLeft);
              }
            }
            
            if (Math.abs(sourceTop - targetTop) > 1) {
              changes.positionY.changed = true;
              changes.positionY.sourceValue = 0; // Start from current position (0 since we're animating the copy)
              changes.positionY.targetValue = targetTop - sourceTop; // Calculate the difference to move
              changes.hasChanges = true;
              if (isFrame1232) {
                console.log('🎯 Frame 1232 Y movement:', sourceTop, '->', targetTop, 'difference:', targetTop - sourceTop);
              }
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
            console.log('DEBUG: Background color change detected:', sourceBg, '->', targetBg);
          }
          
          if (sourceStyle.color !== targetStyle.color) {
            changes.color.changed = true;
            changes.color.sourceValue = sourceStyle.color;
            changes.color.targetValue = targetStyle.color;
            changes.hasChanges = true;
            console.log('DEBUG: Color change detected:', sourceStyle.color, '->', targetStyle.color);
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
          console.log('DEBUG: Error detecting property changes:', error);
        }

        // Debug: Log what caused hasChanges to be true
        if (changes.hasChanges) {
          console.log('DEBUG: hasChanges is true for', sourceElement.getAttribute('data-figma-name'), 'due to:');
          if (changes.positionX.changed) console.log('  - positionX change');
          if (changes.positionY.changed) console.log('  - positionY change');
          if (changes.backgroundColor.changed) console.log('  - backgroundColor change');
          if (changes.color.changed) console.log('  - color change');
          if (changes.justifyContent.changed) console.log('  - justifyContent change');
          if (changes.alignItems.changed) console.log('  - alignItems change');
        }

        return changes;
      }
      
      // Helper function to handle animated variant switching
      async function handleAnimatedVariantSwitch(sourceElement, destination, allVariants, transitionType, transitionDuration) {
        console.log('DEBUG: Starting modular animated variant switch');
        console.log('DEBUG: About to create element copy');
        
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
        
        // Force reflow
        destination.offsetHeight;
        
        // Animate the copy to match the destination
        await animateCopyToDestination(sourceCopy, destination, transitionType, transitionDuration);
        
        console.log('DEBUG: Animation completed, transitioning to destination variant');
        
        // Animation complete - restore normal behavior
        sourceCopy.remove();
        
        // Hide the original source element permanently
        sourceElement.style.opacity = '0';
        sourceElement.style.visibility = 'hidden';
        sourceElement.classList.add('variant-hidden');
        sourceElement.classList.remove('variant-active');
        
        // Properly activate the destination variant
        destination.style.visibility = 'visible';
        destination.style.opacity = '1';
        destination.style.display = 'flex';
        destination.classList.add('variant-active');
        destination.classList.remove('variant-hidden');
        
        // Ensure destination has proper positioning
        destination.style.position = 'relative';
        destination.style.top = '0px';
        destination.style.left = '0px';
        
        // Ensure all nested elements in the destination are also visible
        const destinationChildren = destination.querySelectorAll('*');
        destinationChildren.forEach(child => {
          child.style.opacity = '1';
          child.style.visibility = 'visible';
          if (child.style.display === 'none') {
            child.style.display = 'flex';
          }
        });
        
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
        
        // Start timeout reactions
        startTimeoutReactionsForNewlyActiveVariant(destination);
        startTimeoutReactionsForNestedComponents(destination);
      }
      
      // Helper function to perform instant variant switch
      function performInstantVariantSwitch(allVariants, destination) {
        console.log('DEBUG: Performing instant variant switch');
        
        // Hide all variants
        allVariants.forEach(variant => {
          variant.classList.add('variant-hidden');
          variant.classList.remove('variant-active');
          variant.style.position = 'relative';
          variant.style.top = '0px';
          variant.style.left = '0px';
        });
        
        // Show destination variant
        destination.classList.add('variant-active');
        destination.classList.remove('variant-hidden');
        destination.style.position = 'relative';
        destination.style.top = '0px';
        destination.style.left = '0px';
        
        // Start timeout reactions
        startTimeoutReactionsForNewlyActiveVariant(destination);
        startTimeoutReactionsForNestedComponents(destination);
      }
      
      // Main reaction handler function
      function handleReaction(sourceElement, destinationId, transitionType, transitionDuration) {
        console.log('DEBUG: Modular handleReaction called');
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
            currentTransitionPromise = null;
          }
        }, 10000); // Increased to 10 seconds
        
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
            
            const isAnimated = transitionType === 'SMART_ANIMATE' || 
                              transitionType === 'BOUNCY' || 
                              transitionType === 'EASE_IN_AND_OUT' || 
                              transitionType === 'EASE_IN' || 
                              transitionType === 'EASE_OUT' || 
                              transitionType === 'LINEAR' || 
                              transitionType === 'GENTLE';
            
            if (isAnimated) {
              console.log('DEBUG: Using modular animated variant switching');
              currentTransitionPromise = handleAnimatedVariantSwitch(sourceElement, destination, allVariants, transitionType, transitionDuration)
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
              console.log('DEBUG: Using instant variant switching');
              performInstantVariantSwitch(allVariants, destination);
              clearTimeout(safetyTimeout);
              isTransitionInProgress = false;
              currentTransitionPromise = null;
            }
                      } else {
              // This is a regular transition (not variant switching)
              if (transitionType === 'DISSOLVE') {
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
                  currentTransitionPromise = null;
                }, parseFloat(transitionDuration || '300'));
              } else {
                sourceElement.style.opacity = '1';
                destination.classList.add('variant-active');
                destination.classList.remove('variant-hidden');
                destination.style.opacity = '1';
                
                startTimeoutReactionsForNewlyActiveVariant(destination);
                startTimeoutReactionsForNestedComponents(destination);
                
                clearTimeout(safetyTimeout);
                isTransitionInProgress = false;
                currentTransitionPromise = null;
              }
            }
        } else {
          // Handle case where destinationId is null (final variant - no further transitions)
          console.log('DEBUG: Destination ID is null - animation cycle complete, stopping at final variant');
          clearTimeout(safetyTimeout);
          isTransitionInProgress = false;
          currentTransitionPromise = null;
        }
      }
      
      // Make function globally available
      window.handleReaction = handleReaction;
    `;
}

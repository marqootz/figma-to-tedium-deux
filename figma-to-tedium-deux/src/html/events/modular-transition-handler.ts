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
              if (property === 'translateX') {
                element.style.left = \`\${targetValue}px\`;
              } else if (property === 'translateY') {
                element.style.top = \`\${targetValue}px\`;
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
        
        return copy;
      }
      
      // Helper function to animate copy to destination
      function animateCopyToDestination(copy, destination, transitionType, transitionDuration) {
        return new Promise((resolve) => {
          // Find elements with property changes
          const elementsToAnimate = findElementsWithPropertyChanges(destination, copy);
          
          if (elementsToAnimate.length > 0) {
            console.log('DEBUG: Animating copy with', elementsToAnimate.length, 'elements using modular system');
            
            const easingFunction = getEasingFunction(transitionType);
            const duration = parseFloat(transitionDuration || '0.3');
            
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
                  
                  // Don't add to animationChanges array since we're handling it directly
                  return;
                }
              }
              
              // For other alignment changes, add to animationChanges array
              if (changes.justifyContent && changes.justifyContent.changed) {
                animationChanges.push({
                  type: AnimationType.TRANSFORM,
                  property: 'parent_justifyContent',
                  sourceValue: changes.justifyContent.sourceValue,
                  targetValue: changes.justifyContent.targetValue,
                  changed: true,
                  translationCondition: TranslationCondition.RELATIVE_ALIGNMENT,
                  destination: destination // Pass destination for target element lookup
                });
              }
              
              if (changes.alignItems && changes.alignItems.changed) {
                animationChanges.push({
                  type: AnimationType.TRANSFORM,
                  property: 'parent_alignItems',
                  sourceValue: changes.alignItems.sourceValue,
                  targetValue: changes.alignItems.targetValue,
                  changed: true,
                  translationCondition: TranslationCondition.RELATIVE_ALIGNMENT,
                  destination: destination // Pass destination for target element lookup
                });
              }
              
              console.log('DEBUG: Converted to animation changes:', animationChanges);
              
              // Apply each change
              animationChanges.forEach(change => {
                applyAnimationChange(element, change, duration, easingFunction);
              });
            });
            
            // Force reflow
            copy.offsetHeight;
            
            // Apply target values
            requestAnimationFrame(() => {
              elementsToAnimate.forEach(({ element, sourceElement, changes }) => {
                // Convert the detected changes to animation changes (same as above)
                const animationChanges = [];
                
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
                
                if (changes.justifyContent && changes.justifyContent.changed) {
                  animationChanges.push({
                    type: AnimationType.TRANSFORM,
                    property: 'parent_justifyContent',
                    sourceValue: changes.justifyContent.sourceValue,
                    targetValue: changes.justifyContent.targetValue,
                    changed: true,
                    translationCondition: TranslationCondition.RELATIVE_ALIGNMENT,
                    destination: destination // Pass destination for target element lookup
                  });
                }
                
                if (changes.alignItems && changes.alignItems.changed) {
                  animationChanges.push({
                    type: AnimationType.TRANSFORM,
                    property: 'parent_alignItems',
                    sourceValue: changes.alignItems.sourceValue,
                    targetValue: changes.alignItems.targetValue,
                    changed: true,
                    translationCondition: TranslationCondition.RELATIVE_ALIGNMENT,
                    destination: destination // Pass destination for target element lookup
                  });
                }
                
                animationChanges.forEach(change => {
                  applyAnimationChange(element, change, duration, easingFunction);
                });
              });
            });
            
            // Monitor animation progress
            const animationDuration = parseFloat(transitionDuration || '0.3') * 1000;
            const checkInterval = 100;
            let checkCount = 0;
            
            const progressCheck = setInterval(() => {
              checkCount++;
              if (checkCount * checkInterval >= animationDuration) {
                clearInterval(progressCheck);
                console.log('DEBUG: Modular animation completed');
                resolve();
              }
            }, checkInterval);
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
              console.log('DEBUG: Found element with property changes:', targetName, 'changes:', changes);
            } else {
              console.log('DEBUG: No changes detected for element:', targetName);
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
          // Check position changes by comparing the computed styles
          const sourceStyle = window.getComputedStyle(sourceElement);
          const targetStyle = window.getComputedStyle(targetElement);
          
          // Check left position changes - use Figma data attributes for more accurate positioning
          const sourceLeft = parseFloat(sourceStyle.left) || 0;
          const targetLeft = parseFloat(targetStyle.left) || 0;
          
          // Get Figma position data for more accurate target positioning
          const sourceFigmaX = parseFloat(sourceElement.getAttribute('data-figma-x')) || 0;
          const targetFigmaX = parseFloat(targetElement.getAttribute('data-figma-x')) || 0;
          
          // CRITICAL FIX: Check if the source element has a transform applied from a previous animation
          // If so, we need to account for that in the position calculation
          const sourceTransform = sourceStyle.transform;
          let sourceTransformOffset = 0;
          if (sourceTransform && sourceTransform !== 'none') {
            // Extract translateX value from transform matrix
            const matrix = new DOMMatrix(sourceTransform);
            sourceTransformOffset = matrix.m41; // m41 is the translateX value
            console.log('DEBUG: Source element has transform:', sourceTransform, 'translateX offset:', sourceTransformOffset);
          }
          
          // Log detailed information about the elements
          const sourceName = sourceElement.getAttribute('data-figma-name');
          const targetName = targetElement.getAttribute('data-figma-name');
          const sourceId = sourceElement.getAttribute('data-figma-id');
          const targetId = targetElement.getAttribute('data-figma-id');
          
          console.log('DEBUG: Analyzing elements:');
          console.log('  Source:', sourceName, 'ID:', sourceId, 'Left:', sourceLeft, 'FigmaX:', sourceFigmaX);
          console.log('  Target:', targetName, 'ID:', targetId, 'Left:', targetLeft, 'FigmaX:', targetFigmaX);
          
          // Log parent container dimensions
          const sourceContainer = sourceElement.closest('[data-figma-type="COMPONENT_SET"], [data-figma-type="COMPONENT"]');
          const targetContainer = targetElement.closest('[data-figma-type="COMPONENT_SET"], [data-figma-type="COMPONENT"]');
          
          if (sourceContainer) {
            const sourceContainerRect = sourceContainer.getBoundingClientRect();
            console.log('  Source container dimensions:', sourceContainerRect.width, 'x', sourceContainerRect.height);
          }
          
          if (targetContainer) {
            const targetContainerRect = targetContainer.getBoundingClientRect();
            console.log('  Target container dimensions:', targetContainerRect.width, 'x', targetContainerRect.height);
          }
          
          // Log viewport dimensions
          console.log('  Viewport dimensions:', window.innerWidth, 'x', window.innerHeight);
          
          // Log element dimensions
          const sourceRect = sourceElement.getBoundingClientRect();
          const targetRect = targetElement.getBoundingClientRect();
          console.log('  Source element dimensions:', sourceRect.width, 'x', sourceRect.height);
          console.log('  Target element dimensions:', targetRect.width, 'x', targetRect.height);
          
          // Check if target element is properly rendered
          if (targetRect.width === 0 && targetRect.height === 0) {
            console.log('DEBUG: Target element has zero dimensions, skipping animation');
            return changes;
          }
          
          // CRITICAL FIX: Use current computed position for source if element has been animated
          // This ensures we detect changes from the actual current position, not the original Figma position
          const sourceHasBeenAnimated = sourceElement.style.position === 'absolute' && 
                                       (sourceElement.style.left || sourceElement.style.top);
          
          // Calculate target position by scaling Figma coordinates to actual rendered size
          // Use SOURCE element's parent (copy) for scaling since we're animating the copy
          const sourceContainerForScaling = sourceElement.closest('[data-figma-type="COMPONENT_SET"], [data-figma-type="COMPONENT"]');
          const targetContainerForScaling = sourceElement.closest('[data-figma-type="COMPONENT_SET"], [data-figma-type="COMPONENT"]');
          
          let finalTargetLeft = 0; // Start with 0, will be calculated below
          // Always use computed styles for consistency
          let finalSourceLeft = parseFloat(sourceStyle.left) || 0;
          
          // Add transform offset if present
          finalSourceLeft += sourceTransformOffset;
          
          // STEP 1-2: Query source and target to observe value differences
          // Check for alignment/justify differences between source and target parents
          const sourceParent = sourceElement.parentElement;
          const targetParent = targetElement.parentElement;
          
          if (sourceParent && targetParent) {
            const sourceParentStyle = window.getComputedStyle(sourceParent);
            const targetParentStyle = window.getComputedStyle(targetParent);
            
            const sourceJustifyContent = sourceParentStyle.justifyContent;
            const targetJustifyContent = targetParentStyle.justifyContent;
            const sourceAlignItems = sourceParentStyle.alignItems;
            const targetAlignItems = targetParentStyle.alignItems;
            
            console.log('DEBUG: Alignment analysis:', {
              sourceJustifyContent,
              targetJustifyContent,
              sourceAlignItems,
              targetAlignItems,
              sourceElementId: sourceElement.getAttribute('data-figma-id'),
              targetElementId: targetElement.getAttribute('data-figma-id')
            });
            
            // STEP 3: If there's an alignment/justify difference, it's ultimately a position change
            const hasJustifyChange = sourceJustifyContent !== targetJustifyContent;
            const hasAlignChange = sourceAlignItems !== targetAlignItems;
            
            if (hasJustifyChange || hasAlignChange) {
              console.log('DEBUG: Alignment/justify change detected - calculating position difference');
              
              // STEP 4: Query the corresponding nodes in source and target to find absolute/computed position
              const sourceRect = sourceElement.getBoundingClientRect();
              const targetRect = targetElement.getBoundingClientRect();
              const sourceParentRect = sourceParent.getBoundingClientRect();
              const targetParentRect = targetParent.getBoundingClientRect();
              
              // Calculate relative positions within their containers
              const sourceRelativeLeft = sourceRect.left - sourceParentRect.left;
              const targetRelativeLeft = targetRect.left - targetParentRect.left;
              const sourceRelativeTop = sourceRect.top - sourceParentRect.top;
              const targetRelativeTop = targetRect.top - targetParentRect.top;
              
              console.log('DEBUG: Position analysis:', {
                sourceRelativeLeft,
                targetRelativeLeft,
                sourceRelativeTop,
                targetRelativeTop,
                xDifference: Math.abs(sourceRelativeLeft - targetRelativeLeft),
                yDifference: Math.abs(sourceRelativeTop - targetRelativeTop)
              });
              
              // STEP 5: Calculate position difference
              const xDifference = targetRelativeLeft - sourceRelativeLeft;
              const yDifference = targetRelativeTop - sourceRelativeTop;
              
              // STEP 6: Set up animation values
              if (Math.abs(xDifference) > 1) {
                finalTargetLeft = finalSourceLeft + xDifference;
                console.log('DEBUG: X position change calculated:', {
                  sourceLeft: finalSourceLeft,
                  targetLeft: finalTargetLeft,
                  difference: xDifference,
                  justifyChange: hasJustifyChange ? (sourceJustifyContent + ' -> ' + targetJustifyContent) : 'none'
                });
              }
              
              if (Math.abs(yDifference) > 1) {
                finalTargetTop = finalSourceTop + yDifference;
                console.log('DEBUG: Y position change calculated:', {
                  sourceTop: finalSourceTop,
                  targetTop: finalTargetTop,
                  difference: yDifference,
                  alignChange: hasAlignChange ? (sourceAlignItems + ' -> ' + targetAlignItems) : 'none'
                });
              }
            } else {
              console.log('DEBUG: No alignment/justify changes detected');
              // Fallback to direct position comparison if no alignment changes
              const sourceRect = sourceElement.getBoundingClientRect();
              const targetRect = targetElement.getBoundingClientRect();
              const sourceParentRect = sourceParent.getBoundingClientRect();
              const targetParentRect = targetParent.getBoundingClientRect();
              
              const sourceRelativeLeft = sourceRect.left - sourceParentRect.left;
              const targetRelativeLeft = targetRect.left - targetParentRect.left;
              const sourceRelativeTop = sourceRect.top - sourceParentRect.top;
              const targetRelativeTop = targetRect.top - targetParentRect.top;
              
              finalTargetLeft = targetRelativeLeft;
              finalTargetTop = targetRelativeTop;
            }
          } else {
            console.log('DEBUG: No parent elements found, using fallback calculation');
            finalTargetLeft = parseFloat(targetStyle.left) || 0;
            finalTargetTop = parseFloat(targetStyle.top) || 0;
          }
          
          console.log('DEBUG: X Position Analysis:');
          console.log('  Source has been animated:', sourceHasBeenAnimated);
          console.log('  Source computed left:', sourceLeft, 'Source Figma X:', sourceFigmaX, 'Transform offset:', sourceTransformOffset, 'Final source left:', finalSourceLeft);
          console.log('  Target computed left:', targetLeft, 'Target Figma X:', targetFigmaX, 'Final target left:', finalTargetLeft);
          
          if (Math.abs(finalSourceLeft - finalTargetLeft) > 1) {
            changes.positionX.changed = true;
            changes.positionX.sourceValue = finalSourceLeft;
            changes.positionX.targetValue = finalTargetLeft;
            changes.hasChanges = true;
            console.log('DEBUG: Position X change detected:', finalSourceLeft, '->', finalTargetLeft, '(scaled from Figma coordinates)');
            console.log('DEBUG: Position X change details:');
            console.log('  Source element rect:', sourceElement.getBoundingClientRect());
            console.log('  Target element rect:', targetElement.getBoundingClientRect());
            console.log('  Source element computed style:', window.getComputedStyle(sourceElement).left);
            console.log('  Target element computed style:', window.getComputedStyle(targetElement).left);
          } else {
            console.log('DEBUG: No X position change detected - difference:', Math.abs(finalSourceLeft - finalTargetLeft));
          }
          
          // Y position calculation is now handled in the X position section above
          // where we calculate both X and Y positions together based on alignment changes
          
          console.log('DEBUG: Y Position Analysis:');
          console.log('  Final source top:', finalSourceTop);
          console.log('  Final target top:', finalTargetTop);
          console.log('  Difference:', Math.abs(finalSourceTop - finalTargetTop));
          
          if (Math.abs(finalSourceTop - finalTargetTop) > 1) {
            changes.positionY.changed = true;
            changes.positionY.sourceValue = finalSourceTop;
            changes.positionY.targetValue = finalTargetTop;
            changes.hasChanges = true;
            console.log('DEBUG: Position Y change detected:', finalSourceTop, '->', finalTargetTop);
          } else {
            console.log('DEBUG: No Y position change detected - difference:', Math.abs(finalSourceTop - finalTargetTop));
          }

          // Check style changes - use more specific comparison
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
        } catch (error) {
          console.log('DEBUG: Error detecting property changes:', error);
        }

        return changes;
      }
      
      // Helper function to handle animated variant switching
      async function handleAnimatedVariantSwitch(sourceElement, destination, allVariants, transitionType, transitionDuration) {
        console.log('DEBUG: Starting modular animated variant switch');
        
        // Create a copy of the source variant
        const sourceCopy = createElementCopy(sourceElement);
        
        // Insert the copy into the DOM
        const sourceParent = sourceElement.parentElement;
        sourceParent.appendChild(sourceCopy);
        
        // Hide the original source element and all other variants
        sourceElement.style.opacity = '0';
        sourceElement.style.visibility = 'hidden';
        
        allVariants.forEach(variant => {
          if (variant !== sourceElement) {
            variant.style.opacity = '0';
            variant.style.visibility = 'hidden';
          }
        });
        
        // Show the destination variant (but keep it hidden visually)
        destination.classList.add('variant-active');
        destination.classList.remove('variant-hidden');
        destination.style.visibility = 'hidden';
        
        // Force reflow
        destination.offsetHeight;
        
        // Animate the copy to match the destination
        await animateCopyToDestination(sourceCopy, destination, transitionType, transitionDuration);
        
        // Animation complete - restore normal behavior
        sourceCopy.remove();
        
        // Reset source element visibility
        sourceElement.style.opacity = '1';
        sourceElement.style.visibility = 'visible';
        
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
            
            const isAnimated = transitionType === 'SMART_ANIMATE' || 
                              transitionType === 'BOUNCY' || 
                              transitionType === 'EASE_IN_AND_OUT' || 
                              transitionType === 'EASE_IN' || 
                              transitionType === 'EASE_OUT' || 
                              transitionType === 'LINEAR' || 
                              transitionType === 'GENTLE';
            
            if (isAnimated) {
              console.log('DEBUG: Using modular animated variant switching');
              handleAnimatedVariantSwitch(sourceElement, destination, allVariants, transitionType, transitionDuration)
                .then(() => {
                  clearTimeout(safetyTimeout);
                  isTransitionInProgress = false;
                })
                .catch((error) => {
                  console.error('Modular animation error:', error);
                  clearTimeout(safetyTimeout);
                  isTransitionInProgress = false;
                });
            } else {
              console.log('DEBUG: Using instant variant switching');
              performInstantVariantSwitch(allVariants, destination);
              clearTimeout(safetyTimeout);
              isTransitionInProgress = false;
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
            }
          }
        } else {
          clearTimeout(safetyTimeout);
          isTransitionInProgress = false;
        }
      }
      
      // Make function globally available
      window.handleReaction = handleReaction;
    `;
}

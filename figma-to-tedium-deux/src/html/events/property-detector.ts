// Property change detection logic
export function createPropertyDetector(): string {
  return `
      // Helper function to find elements with property changes between variants
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
          
          // CRITICAL FIX: Scale position from component set dimensions to instance dimensions
          // The target element is positioned in the component set (2619.125px) but needs to be scaled to the instance (346px)
          const targetComputedStyle = window.getComputedStyle(targetElement);
          let targetContainerX = targetElement.parentElement;
          
          // Walk up the DOM tree to find the nearest INSTANCE container
          while (targetContainerX && targetContainerX.getAttribute('data-figma-type') !== 'INSTANCE') {
            targetContainerX = targetContainerX.parentElement;
          }
          
          if (targetContainerX) {
            const containerRectX = targetContainerX.getBoundingClientRect();
            const targetElementRectX = targetElement.getBoundingClientRect();
            
            // Get the original Figma X position from the target element
            const figmaX = parseFloat(targetElement.getAttribute('data-figma-x')) || 0;
            
            // Scale factor: instance width / component set width
            // From JSON: component set width = 2619.125px, instance width = 346px
            const componentSetWidth = 2619.125;
            const instanceWidth = containerRectX.width;
            const scaleFactor = instanceWidth / componentSetWidth;
            
            // Scale the Figma X position to fit within the instance
            // Account for the object's width to prevent overflow
            const objectWidth = targetElementRectX.width;
            const scaledPosition = figmaX * scaleFactor;
            
            // Ensure the object doesn't overflow the container
            finalTargetLeft = Math.min(scaledPosition, instanceWidth - objectWidth);
            
            console.log('DEBUG: Position calculation with object size:', {
              figmaX: figmaX,
              scaleFactor: scaleFactor,
              scaledPosition: scaledPosition,
              objectWidth: objectWidth,
              instanceWidth: instanceWidth,
              finalTargetLeft: finalTargetLeft
            });
            
            console.log('DEBUG: Using scaled INSTANCE-relative position calculation:', {
              targetElementLeft: targetElementRectX.left,
              containerLeft: containerRectX.left,
              containerWidth: containerRectX.width,
              figmaX: figmaX,
              componentSetWidth: componentSetWidth,
              scaleFactor: scaleFactor,
              finalTargetLeft: finalTargetLeft,
              targetElement: targetElement.getAttribute('data-figma-name') || targetElement.getAttribute('data-figma-id'),
              containerElement: targetContainerX.tagName + (targetContainerX.className ? '.' + targetContainerX.className : ''),
              containerType: targetContainerX.getAttribute('data-figma-type'),
              containerId: targetContainerX.getAttribute('data-figma-id'),
              targetComputedLeft: targetComputedStyle.left
            });
          } else {
            // Fallback to computed values if no instance found
            finalTargetLeft = parseFloat(targetComputedStyle.left) || 0;
            console.log('DEBUG: Using computed values fallback:', {
              targetComputedLeft: targetComputedStyle.left,
              finalTargetLeft: finalTargetLeft,
              targetElement: targetElement.getAttribute('data-figma-name') || targetElement.getAttribute('data-figma-id')
            });
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
          
          // Check top position changes - use Figma data attributes for more accurate positioning
          const sourceTop = parseFloat(sourceStyle.top) || 0;
          const targetTop = parseFloat(targetStyle.top) || 0;
          
          // Get Figma position data for more accurate target positioning
          const sourceFigmaY = parseFloat(sourceElement.getAttribute('data-figma-y')) || 0;
          const targetFigmaY = parseFloat(targetElement.getAttribute('data-figma-y')) || 0;
          
          // CRITICAL FIX: Check if the source element has a transform applied from a previous animation
          // If so, we need to account for that in the position calculation
          let sourceTransformYOffset = 0;
          if (sourceTransform && sourceTransform !== 'none') {
            // Extract translateY value from transform matrix
            const matrix = new DOMMatrix(sourceTransform);
            sourceTransformYOffset = matrix.m42; // m42 is the translateY value
            console.log('DEBUG: Source element has transform:', sourceTransform, 'translateY offset:', sourceTransformYOffset);
          }
          
          // Calculate target position by scaling Figma coordinates to actual rendered size
          let finalTargetTop = 0; // Start with 0, will be calculated below
          // Always use computed styles for consistency
          let finalSourceTop = parseFloat(sourceStyle.top) || 0;
          
          // Add transform offset if present
          finalSourceTop += sourceTransformYOffset;
          
          // CRITICAL FIX: Scale position from component set dimensions to instance dimensions
          // The target element is positioned in the component set but needs to be scaled to the instance
          const targetComputedStyleY = window.getComputedStyle(targetElement);
          let targetContainerY = targetElement.parentElement;
          
          // Walk up the DOM tree to find the nearest INSTANCE container
          while (targetContainerY && targetContainerY.getAttribute('data-figma-type') !== 'INSTANCE') {
            targetContainerY = targetContainerY.parentElement;
          }
          
          if (targetContainerY) {
            const containerRectY = targetContainerY.getBoundingClientRect();
            const targetElementRectY = targetElement.getBoundingClientRect();
            
            // Get the original Figma Y position from the target element
            const figmaY = parseFloat(targetElement.getAttribute('data-figma-y')) || 0;
            
            // Scale factor: instance height / component set height
            // From JSON: component set height = 214px, instance height = 84px
            const componentSetHeight = 214;
            const instanceHeight = containerRectY.height;
            const scaleFactorY = instanceHeight / componentSetHeight;
            
            // Scale the Figma Y position to fit within the instance
            // Account for the object's height to prevent overflow
            const objectHeight = targetElementRectY.height;
            const scaledPositionY = figmaY * scaleFactorY;
            
            // Ensure the object doesn't overflow the container
            finalTargetTop = Math.min(scaledPositionY, instanceHeight - objectHeight);
            
            console.log('DEBUG: Y Position calculation with object size:', {
              figmaY: figmaY,
              scaleFactorY: scaleFactorY,
              scaledPositionY: scaledPositionY,
              objectHeight: objectHeight,
              instanceHeight: instanceHeight,
              finalTargetTop: finalTargetTop
            });
            
            console.log('DEBUG: Using scaled INSTANCE-relative position calculation Y:', {
              targetElementTop: targetElementRectY.top,
              containerTop: containerRectY.top,
              containerHeight: containerRectY.height,
              figmaY: figmaY,
              componentSetHeight: componentSetHeight,
              scaleFactorY: scaleFactorY,
              finalTargetTop: finalTargetTop,
              targetElement: targetElement.getAttribute('data-figma-name') || targetElement.getAttribute('data-figma-id'),
              containerElement: targetContainerY.tagName + (targetContainerY.className ? '.' + targetContainerY.className : ''),
              containerType: targetContainerY.getAttribute('data-figma-type'),
              containerId: targetContainerY.getAttribute('data-figma-id'),
              targetComputedTop: targetComputedStyleY.top
            });
          } else {
            // Fallback to computed values if no instance found
            finalTargetTop = parseFloat(targetComputedStyleY.top) || 0;
            console.log('DEBUG: Using computed values fallback Y:', {
              targetComputedTop: targetComputedStyleY.top,
              finalTargetTop: finalTargetTop,
              targetElement: targetElement.getAttribute('data-figma-name') || targetElement.getAttribute('data-figma-id')
            });
          }
          
          console.log('DEBUG: Y Position Analysis:');
          console.log('  Source computed top:', sourceTop, 'Source Figma Y:', sourceFigmaY, 'Transform offset:', sourceTransformYOffset, 'Final source top:', finalSourceTop);
          console.log('  Target computed top:', targetTop, 'Target Figma Y:', targetFigmaY, 'Final target top:', finalTargetTop);
          
          if (Math.abs(finalSourceTop - finalTargetTop) > 1) {
            changes.positionY.changed = true;
            changes.positionY.sourceValue = finalSourceTop;
            changes.positionY.targetValue = finalTargetTop;
            changes.hasChanges = true;
            console.log('DEBUG: Position Y change detected:', finalSourceTop, '->', finalTargetTop, '(scaled from Figma coordinates)');
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
  `;
}

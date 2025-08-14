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
          
          // Get element dimensions for validation
          const sourceRect = sourceElement.getBoundingClientRect();
          const targetRect = targetElement.getBoundingClientRect();
          
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
          let finalTargetTop = 0; // Start with 0, will be calculated below
          // Always use computed styles for consistency
          let finalSourceLeft = parseFloat(sourceStyle.left) || 0;
          let finalSourceTop = parseFloat(sourceStyle.top) || 0;
          
          // Add transform offset if present
          finalSourceLeft += sourceTransformOffset;
          
          // Check if the source element has a transform applied from a previous animation
          // If so, we need to account for that in the position calculation
          let sourceTransformYOffset = 0;
          if (sourceTransform && sourceTransform !== 'none') {
            // Extract translateY value from transform matrix
            const matrix = new DOMMatrix(sourceTransform);
            sourceTransformYOffset = matrix.m42; // m42 is the translateY value
            console.log('DEBUG: Source element has transform:', sourceTransform, 'translateY offset:', sourceTransformYOffset);
          }
          
          // Add transform offset if present
          finalSourceTop += sourceTransformYOffset;
          
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
            

            
            // STEP 3: If there's an alignment/justify difference, it's ultimately a position change
            const hasJustifyChange = sourceJustifyContent !== targetJustifyContent;
            const hasAlignChange = sourceAlignItems !== targetAlignItems;
            
            if (hasJustifyChange || hasAlignChange) {
              
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
              

              
              // STEP 5: Calculate position difference
              const xDifference = targetRelativeLeft - sourceRelativeLeft;
              const yDifference = targetRelativeTop - sourceRelativeTop;
              
              // STEP 6: Set up animation values
              if (Math.abs(xDifference) > 1) {
                finalTargetLeft = finalSourceLeft + xDifference;

              }
              
              if (Math.abs(yDifference) > 1) {
                finalTargetTop = finalSourceTop + yDifference;

              }
            } else {
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
          
          console.log('DEBUG: Background color comparison for', targetElement.getAttribute('data-figma-name') + ':');
          console.log('  Source background:', sourceBg);
          console.log('  Target background:', targetBg);
          console.log('  Are they different?', sourceBg !== targetBg);
          
          if (sourceBg !== targetBg) {
            changes.backgroundColor.changed = true;
            changes.backgroundColor.sourceValue = sourceBg;
            changes.backgroundColor.targetValue = targetBg;
            changes.hasChanges = true;
            console.log('DEBUG: Background color change detected:', sourceBg, '->', targetBg);
          } else {
            console.log('DEBUG: No background color change detected');
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

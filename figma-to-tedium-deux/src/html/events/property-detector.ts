// Property change detection logic
export function createPropertyDetector(): string {
  return `
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
          
          // Check left position changes
          const sourceLeft = parseFloat(sourceStyle.left) || 0;
          const targetLeft = parseFloat(targetStyle.left) || 0;
          
          // Log detailed information about the elements
          const sourceName = sourceElement.getAttribute('data-figma-name');
          const targetName = targetElement.getAttribute('data-figma-name');
          const sourceId = sourceElement.getAttribute('data-figma-id');
          const targetId = targetElement.getAttribute('data-figma-id');
          
          console.log('DEBUG: Analyzing elements:');
          console.log('  Source:', sourceName, 'ID:', sourceId, 'Left:', sourceLeft);
          console.log('  Target:', targetName, 'ID:', targetId, 'Left:', targetLeft);
          
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

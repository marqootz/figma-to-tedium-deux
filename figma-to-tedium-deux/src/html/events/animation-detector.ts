/**
 * Animation Detection Module
 * 
 * Responsible for detecting what needs to be animated between source and target elements.
 * This module handles the logic for identifying property changes, position changes,
 * and determining the appropriate animation type for each change.
 */

// Animation types
export const AnimationType = {
  SIMPLE: 'SIMPLE',
  SIZE: 'SIZE', 
  TRANSFORM: 'TRANSFORM'
} as const;

// Translation conditions
export const TranslationCondition = {
  ABSOLUTE: 'ABSOLUTE',
  RELATIVE_PADDING: 'RELATIVE_PADDING',
  RELATIVE_ALIGNMENT: 'RELATIVE_ALIGNMENT'
} as const;

// Animation change interface
export interface AnimationChange {
  type: string;
  property: string;
  sourceValue: any;
  targetValue: any;
  changed: boolean;
  translationCondition?: string;
  isCombinedTransform?: boolean;
}

// Element animation context
export interface ElementAnimationContext {
  element: HTMLElement;
  node: any; // FigmaNode type
  parentNode?: any; // FigmaNode type
  changes: AnimationChange[];
}

/**
 * Determine animation type for a property
 */
export function getAnimationType(property: string): string {
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

/**
 * Determine translation condition for an element
 */
export function getTranslationCondition(element: HTMLElement, node: any, parentNode?: any): string {
  const ignoreAutoLayout = node?.layoutPositioning === 'ABSOLUTE';
  
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

/**
 * Detect animation changes between source and target elements
 */
export function detectAnimationChanges(
  sourceElement: HTMLElement, 
  targetElement: HTMLElement, 
  sourceNode: any, 
  targetNode: any, 
  parentNode?: any
): AnimationChange[] {
  const changes: AnimationChange[] = [];
  
  const sourceStyle = window.getComputedStyle(sourceElement);
  const targetStyle = window.getComputedStyle(targetElement);
  
  // Check simple properties
  const simpleProperties = ['opacity', 'backgroundColor', 'color'];
  simpleProperties.forEach(property => {
    const sourceValue = sourceStyle[property as any];
    const targetValue = targetStyle[property as any];
    
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
    const sourceValue = parseFloat(sourceStyle[property as any]) || 0;
    const targetValue = parseFloat(targetStyle[property as any]) || 0;
    
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
            property: `parent_${property}`,
            sourceValue,
            targetValue,
            changed: true,
            translationCondition
          });
        }
      });
    }
  } else if (translationCondition === TranslationCondition.RELATIVE_ALIGNMENT) {
    // Check parent alignment changes
    const sourceParent = sourceElement.parentElement;
    const targetParent = targetElement.parentElement;
    
    if (sourceParent && targetParent) {
      const sourceParentStyle = window.getComputedStyle(sourceParent);
      const targetParentStyle = window.getComputedStyle(targetParent);
      
      // Check alignment properties
      const alignmentProperties = ['justifyContent', 'alignItems', 'textAlign', 'verticalAlign'];
      
      console.log('DEBUG: Checking alignment properties for RELATIVE_ALIGNMENT');
      
      alignmentProperties.forEach(property => {
        const sourceValue = sourceParentStyle[property as any];
        const targetValue = targetParentStyle[property as any];
        
        console.log(`DEBUG: Parent ${property}:`, { sourceValue, targetValue, changed: sourceValue !== targetValue });
        
        if (sourceValue !== targetValue) {
          changes.push({
            type: AnimationType.TRANSFORM,
            property: `parent_${property}`,
            sourceValue: sourceValue || '',
            targetValue: targetValue || '',
            changed: true,
            translationCondition
          });
        }
      });
      
      // Check element's own alignment properties
      alignmentProperties.forEach(property => {
        const sourceValue = sourceStyle[property as any];
        const targetValue = targetStyle[property as any];
        
        console.log(`DEBUG: Element ${property}:`, { sourceValue, targetValue, changed: sourceValue !== targetValue });
        
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
        const sourceValue = sourceParentStyle[property as any];
        const targetValue = targetParentStyle[property as any];
        
        console.log(`DEBUG: Flex ${property}:`, { sourceValue, targetValue, changed: sourceValue !== targetValue });
        
        if (sourceValue !== targetValue) {
          changes.push({
            type: AnimationType.TRANSFORM,
            property: `parent_${property}`,
            sourceValue: sourceValue || '',
            targetValue: targetValue || '',
            changed: true,
            translationCondition
          });
        }
      });
      
      // Check for position changes that might be due to alignment
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

/**
 * Get node data from element (placeholder)
 */
export function getNodeDataFromElement(element: HTMLElement): any {
  // This would need to be implemented to extract Figma node data from DOM elements
  // For now, return a basic structure
  return {
    type: element.getAttribute('data-figma-type') || 'UNKNOWN',
    layoutPositioning: element.getAttribute('data-layout-positioning') || 'AUTO',
    layoutMode: element.getAttribute('data-layout-mode') || 'NONE'
  };
}

/**
 * Find elements with property changes
 */
export function findElementsWithPropertyChanges(
  targetVariant: HTMLElement, 
  currentVariant: HTMLElement, 
  originalSourceVariant: HTMLElement
): Array<{element: HTMLElement, sourceElement: HTMLElement, changes: any}> {
  if (!currentVariant) {
    return [];
  }
  
  const targetElements = targetVariant.querySelectorAll('[data-figma-id]');
  const sourceElements = currentVariant.querySelectorAll('[data-figma-id]');
  const sourceElementMap = new Map();
  const elementsToAnimate: Array<{element: HTMLElement, sourceElement: HTMLElement, changes: any}> = [];

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
      const changes = detectPropertyChanges(element as HTMLElement, sourceElement as HTMLElement, originalSourceVariant);
      
      if (changes.hasChanges) {
        elementsToAnimate.push({
          element: sourceElement as HTMLElement,  // Use SOURCE element (from copy) instead of target
          sourceElement: sourceElement as HTMLElement,
          changes: changes
        });
      }
    }
  });
  
  return elementsToAnimate;
}

/**
 * Detect property changes between elements
 */
export function detectPropertyChanges(
  targetElement: HTMLElement, 
  sourceElement: HTMLElement, 
  originalSourceVariant: HTMLElement
): any {
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
    
    // Debug: Log the computed styles of both elements to understand their positioning
    console.log('DEBUG: Source element computed styles:', {
      elementName: sourceElement.getAttribute('data-figma-name'),
      position: sourceStyle.position,
      top: sourceStyle.top,
      left: sourceStyle.left,
      transform: sourceStyle.transform,
      display: sourceStyle.display
    });
    
    console.log('DEBUG: Target element computed styles:', {
      elementName: targetElement.getAttribute('data-figma-name'),
      position: targetStyle.position,
      top: targetStyle.top,
      left: targetStyle.left,
      transform: targetStyle.transform,
      display: targetStyle.display
    });
    
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
    const originalSourceStyle = originalSourceElement ? window.getComputedStyle(originalSourceElement as HTMLElement) : sourceStyle;
    const originalSourceRect = originalSourceElement ? originalSourceElement.getBoundingClientRect() : sourceElement.getBoundingClientRect();
    const originalSourceParent = originalSourceElement ? originalSourceElement.parentElement : sourceElement.parentElement;
    const originalSourceParentRect = originalSourceParent ? originalSourceParent.getBoundingClientRect() : sourceParent?.getBoundingClientRect() || { left: 0, top: 0 };
    
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
    
    // Debug position detection
    console.log('DEBUG: Position detection for element:', sourceElement.getAttribute('data-figma-name'));
    console.log('DEBUG: Original source element found:', !!originalSourceElement);
    console.log('DEBUG: Source rect:', { 
      left: originalSourceRect.left, 
      top: originalSourceRect.top, 
      width: originalSourceRect.width, 
      height: originalSourceRect.height 
    });
    console.log('DEBUG: Target rect:', { 
      left: targetRect.left, 
      top: targetRect.top, 
      width: targetRect.width, 
      height: targetRect.height 
    });
    console.log('DEBUG: Source parent rect:', { 
      left: originalSourceParentRect.left, 
      top: originalSourceParentRect.top 
    });
    console.log('DEBUG: Target parent rect:', { 
      left: targetParentRect.left, 
      top: targetParentRect.top 
    });
    console.log('DEBUG: Calculated centers:', { 
      sourceCenterX, 
      sourceCenterY, 
      targetCenterX, 
      targetCenterY 
    });
    console.log('DEBUG: Final positions:', { sourceLeft, sourceTop, targetLeft, targetTop });
    console.log('DEBUG: Position differences:', { 
      xDiff: Math.abs(sourceLeft - targetLeft), 
      yDiff: Math.abs(sourceTop - targetTop) 
    });
    
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

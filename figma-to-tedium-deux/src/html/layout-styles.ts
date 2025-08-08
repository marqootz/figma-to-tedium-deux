import { FigmaNode, ComputedStyles } from '../types';

// Layout and flexbox styles computation
export function computeLayoutStyles(node: FigmaNode, parentNode?: FigmaNode): ComputedStyles {
  const layoutStyles: ComputedStyles = {};
  
  // --- POSITIONING LOGIC ---
  // Determine if this element should get position: relative
  
  // Case 1: Container elements that establish positioning context
  const isContainerElement = node.type === 'INSTANCE' || 
                           node.type === 'COMPONENT_SET' || 
                           node.type === 'COMPONENT';
  
  // Case 2: Frames with auto-layout that have children (need positioning context for children)
  const isFrameWithAutoLayout = node.type === 'FRAME' && 
                               node.layoutMode && 
                               node.children && 
                               node.children.length > 0;
  
  // Case 3: ANY child of an auto-layout frame (needs position: relative + 0px)
  const isChildOfAutoLayoutFrame = parentNode && 
                                  parentNode.type === 'FRAME' && 
                                  parentNode.layoutMode;
  
  if (isContainerElement || isFrameWithAutoLayout || isChildOfAutoLayoutFrame) {
    layoutStyles.position = 'relative';
    
    // For children of auto-layout frames, also set top/left to 0px
    if (isChildOfAutoLayoutFrame) {
      layoutStyles.top = '0px';
      layoutStyles.left = '0px';
    }
  }
  
  // --- AUTO-LAYOUT STYLES ---
  if (node.layoutMode) {
    // Set display: flex for flexbox properties to work, but without !important
    // so CSS classes can override it
    layoutStyles.display = 'flex';
    
    // Flex direction
    if (node.layoutMode === 'HORIZONTAL') {
      layoutStyles['flex-direction'] = 'row';
    } else if (node.layoutMode === 'VERTICAL') {
      layoutStyles['flex-direction'] = 'column';
    }
    
    // Justify content (primary axis)
    if (node.primaryAxisAlignItems) {
      switch (node.primaryAxisAlignItems) {
        case 'MIN': layoutStyles['justify-content'] = 'flex-start'; break;
        case 'MAX': layoutStyles['justify-content'] = 'flex-end'; break;
        case 'CENTER': layoutStyles['justify-content'] = 'center'; break;
        case 'SPACE_BETWEEN': layoutStyles['justify-content'] = 'space-between'; break;
        case 'SPACE_AROUND': layoutStyles['justify-content'] = 'space-around'; break;
      }
    }
    
    // Align items (counter axis)
    if (node.counterAxisAlignItems) {
      switch (node.counterAxisAlignItems) {
        case 'MIN': layoutStyles['align-items'] = 'flex-start'; break;
        case 'MAX': layoutStyles['align-items'] = 'flex-end'; break;
        case 'CENTER': layoutStyles['align-items'] = 'center'; break;
        case 'STRETCH': layoutStyles['align-items'] = 'stretch'; break;
      }
    }
    
    // Gap (item spacing) - handle negative gaps with margins
    if (node.itemSpacing !== undefined) {
      if (['SPACE_BETWEEN', 'SPACE_AROUND'].includes(node.primaryAxisAlignItems || '')) {
        // Explicitly set gap to 0 for space layouts that handle spacing internally
        layoutStyles.gap = '0px';
      } else if (node.itemSpacing < 0) {
        // Negative gap: use negative margins instead
        // This will be handled in the parent container's child processing
        layoutStyles.gap = '0px';
      } else {
        // Positive gap: use normal gap
        layoutStyles.gap = `${node.itemSpacing}px`;
      }
    }
  }
  
  return layoutStyles;
} 
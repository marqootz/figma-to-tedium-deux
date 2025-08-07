import { FigmaNode, ComputedStyles } from '../types';

// Sizing and positioning styles computation
export function computeSizingStyles(node: FigmaNode, parentNode?: FigmaNode): ComputedStyles {
  const sizingStyles: ComputedStyles = {};
  
  // --- IGNORE LAYOUT (Relative Positioning) ---
  if ((node as any).layoutPositioning === 'ABSOLUTE') {
    sizingStyles.position = 'relative';
    
    // Use Figma coordinates directly, but compensate for parent padding
    if (node.x !== undefined && node.y !== undefined) {
      if (parentNode) {
        // Compensate for parent's padding since Figma coordinates already include padding
        const parentPaddingLeft = parentNode.paddingLeft || 0;
        const parentPaddingTop = parentNode.paddingTop || 0;
        
        const compensatedX = node.x - parentPaddingLeft;
        const compensatedY = node.y - parentPaddingTop;
        
        sizingStyles.left = `${compensatedX}px`;
        sizingStyles.top = `${compensatedY}px`;
      } else {
        // No parent, use coordinates directly
        sizingStyles.left = `${node.x}px`;
        sizingStyles.top = `${node.y}px`;
      }
    }
  }
  
  // --- SIZING ---
  if (node.width !== undefined) {
    sizingStyles.width = `${node.width}px`;
  }
  if (node.height !== undefined) {
    sizingStyles.height = `${node.height}px`;
  }
  
  // Layout sizing
  if (node.layoutSizingHorizontal === 'FILL') {
    sizingStyles.width = '100%';
  } else if (node.layoutSizingHorizontal === 'HUG') {
    sizingStyles.width = 'fit-content';
  }
  
  if (node.layoutSizingVertical === 'FILL') {
    sizingStyles.height = '100%';
  } else if (node.layoutSizingVertical === 'HUG') {
    sizingStyles.height = 'fit-content';
  }
  
  // --- POSITIONING (only if not ignoring layout) ---
  if ((node as any).layoutPositioning !== 'ABSOLUTE') {
    if (node.x !== undefined) {
      sizingStyles.left = `${node.x}px`;
    }
    if (node.y !== undefined) {
      sizingStyles.top = `${node.y}px`;
    }
  }
  
  // --- PADDING ---
  if (node.paddingLeft) sizingStyles['padding-left'] = `${node.paddingLeft}px`;
  if (node.paddingRight) sizingStyles['padding-right'] = `${node.paddingRight}px`;
  if (node.paddingTop) sizingStyles['padding-top'] = `${node.paddingTop}px`;
  if (node.paddingBottom) sizingStyles['padding-bottom'] = `${node.paddingBottom}px`;
  
  // --- CLIP CONTENT ---
  if ((node as any).clipsContent === true) {
    sizingStyles.overflow = 'hidden';
  }
  
  return sizingStyles;
} 
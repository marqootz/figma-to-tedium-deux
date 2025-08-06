import { FigmaNode, ComputedStyles } from '../types';

// Sizing and positioning styles computation
export function computeSizingStyles(node: FigmaNode): ComputedStyles {
  const sizingStyles: ComputedStyles = {};
  
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
  }
  if (node.layoutSizingVertical === 'FILL') {
    sizingStyles.height = '100%';
  }
  
  // --- POSITIONING ---
  if (node.x !== undefined) {
    sizingStyles.left = `${node.x}px`;
  }
  if (node.y !== undefined) {
    sizingStyles.top = `${node.y}px`;
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
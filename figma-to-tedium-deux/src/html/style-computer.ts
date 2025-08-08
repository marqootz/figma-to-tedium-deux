import { FigmaNode, ComputedStyles } from '../types';
import { computeLayoutStyles } from './layout-styles';
import { computeSizingStyles } from './sizing-styles';
import { computeBorderStyles } from './border-styles';
import { computeTextStyles } from './text-styles';
import { computeFillStyles } from './fill-styles';
import { safeHasProperty } from './utils';

// Main style computation orchestrator
export function computeNodeStyles(node: FigmaNode, parentNode?: FigmaNode): ComputedStyles {
  const computedStyles: ComputedStyles = {};
  
  // Get node appearance opacity (this should multiply all other opacity values)
  const nodeOpacity = safeHasProperty(node, 'opacity') ? (node as any).opacity : 1;
  
  // Compute all style categories
  const fillStyles = computeFillStyles(node, nodeOpacity);
  const layoutStyles = computeLayoutStyles(node, parentNode);
  const sizingStyles = computeSizingStyles(node, parentNode);
  const borderStyles = computeBorderStyles(node, nodeOpacity);
  const textStyles = computeTextStyles(node, nodeOpacity);
  
  // Merge all styles (later styles override earlier ones)
  Object.assign(computedStyles, fillStyles);
  Object.assign(computedStyles, layoutStyles);
  Object.assign(computedStyles, sizingStyles);
  Object.assign(computedStyles, borderStyles);
  Object.assign(computedStyles, textStyles);
  
  return computedStyles;
} 
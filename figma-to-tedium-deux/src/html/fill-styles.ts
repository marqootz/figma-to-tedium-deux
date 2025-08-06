import { FigmaNode, ComputedStyles } from '../types';
import { convertGradientToCSS } from './gradient-converter';

// Fill and background styles computation
export function computeFillStyles(node: FigmaNode, nodeOpacity: number): ComputedStyles {
  const fillStyles: ComputedStyles = {};
  
  // --- FILLS ---
  if ((node as any).fills && Array.isArray((node as any).fills) && (node as any).fills.length > 0) {
    const fill = (node as any).fills[0];
    if (fill.type === 'SOLID' && fill.color) {
      const { r, g, b, a = 1 } = fill.color;
      // Combine color alpha with fill opacity and node appearance opacity
      const fillOpacity = fill.opacity !== undefined ? fill.opacity : 1;
      const finalAlpha = a * fillOpacity * nodeOpacity;
      const rgba = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${finalAlpha})`;
      
      if (node.type === 'TEXT') {
        fillStyles.color = rgba;
      } else {
        fillStyles['background-color'] = rgba;
      }
    } else if (fill.type === 'GRADIENT_LINEAR' || fill.type === 'GRADIENT_RADIAL') {
      // Handle gradients
      const gradientCSS = convertGradientToCSS(fill, nodeOpacity);
      if (gradientCSS) {
        if (node.type === 'TEXT') {
          fillStyles.color = gradientCSS;
        } else {
          fillStyles['background-image'] = gradientCSS;
        }
      }
    }
  }
  
  return fillStyles;
} 
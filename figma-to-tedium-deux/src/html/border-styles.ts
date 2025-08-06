import { FigmaNode, ComputedStyles } from '../types';
import { convertGradientToCSS } from './gradient-converter';

// Border and stroke styles computation
export function computeBorderStyles(node: FigmaNode, nodeOpacity: number): ComputedStyles {
  const borderStyles: ComputedStyles = {};
  
  // --- BORDERS ---
  if ((node as any).strokes && Array.isArray((node as any).strokes) && (node as any).strokes.length > 0) {
    const stroke = (node as any).strokes[0];
    if (stroke.type === 'SOLID' && stroke.color) {
      const { r, g, b, a = 1 } = stroke.color;
      const strokeOpacity = stroke.opacity !== undefined ? stroke.opacity : 1;
      const finalAlpha = a * strokeOpacity * nodeOpacity;
      const strokeColor = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${finalAlpha})`;
      const strokeWeight = node.strokeWeight || 1;
      borderStyles.border = `${strokeWeight}px solid ${strokeColor}`;
    } else if (stroke.type === 'GRADIENT_LINEAR' || stroke.type === 'GRADIENT_RADIAL') {
      // Handle gradient strokes using multiple background layers technique
      const gradientCSS = convertGradientToCSS(stroke, nodeOpacity);
      if (gradientCSS) {
        const strokeWeight = node.strokeWeight || 1;
        
        // Determine the background color for the inner layer
        let innerBackground = 'transparent';
        if ((node as any).fills && Array.isArray((node as any).fills) && (node as any).fills.length > 0) {
          const fill = (node as any).fills[0];
          if (fill.type === 'SOLID' && fill.color) {
            const { r, g, b, a = 1 } = fill.color;
            const fillOpacity = fill.opacity !== undefined ? fill.opacity : 1;
            const finalAlpha = a * fillOpacity * nodeOpacity;
            innerBackground = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${finalAlpha})`;
          }
        }
        
        // Set up the multiple background layers for gradient border
        borderStyles.border = `double ${strokeWeight}px transparent`;
        borderStyles['background-image'] = `${innerBackground}, ${gradientCSS}`;
        borderStyles['background-origin'] = 'border-box';
        borderStyles['background-clip'] = 'padding-box, border-box';
      }
    }
  }
  
  // --- CORNER RADIUS ---
  if (node.cornerRadius !== undefined) {
    borderStyles['border-radius'] = `${node.cornerRadius}px`;
  }
  
  return borderStyles;
} 
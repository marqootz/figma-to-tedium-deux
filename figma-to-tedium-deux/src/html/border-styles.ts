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
        
        // Set up the multiple background layers for gradient border
        // First layer is always linear-gradient(white,white) for gradient borders
        borderStyles.border = `double ${strokeWeight}px transparent`;
        borderStyles['background-image'] = `linear-gradient(white,white),${gradientCSS}`;
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
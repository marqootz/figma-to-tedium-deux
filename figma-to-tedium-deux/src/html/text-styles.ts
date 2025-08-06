import { FigmaNode, ComputedStyles } from '../types';
import { convertGradientToCSS } from './gradient-converter';

// Text-specific styles computation
export function computeTextStyles(node: FigmaNode, nodeOpacity: number): ComputedStyles {
  const textStyles: ComputedStyles = {};
  
  if (node.type === 'TEXT') {
    if (node.fontSize) {
      textStyles['font-size'] = `${node.fontSize}px`;
    }
    
    // Font family - use fontName like the original project
    if ((node as any).fontName && (node as any).fontName) {
      if (typeof (node as any).fontName === 'object' && (node as any).fontName.family) {
        const figmaFamily = String((node as any).fontName.family);
        console.log(`[DEBUG] Font family from fontName: ${figmaFamily}`);
        // Use exact Figma font names - no substitutions
        textStyles['font-family'] = `${figmaFamily}, sans-serif`;
      }
    } else if (node.fontFamily) {
      console.log(`[DEBUG] Font family from fontFamily: ${node.fontFamily}`);
      textStyles['font-family'] = `${node.fontFamily}`;
    } else {
      console.log(`[DEBUG] No font family found for node: ${node.name}`);
      console.log(`[DEBUG] Node fontName:`, (node as any).fontName);
      console.log(`[DEBUG] Node fontFamily:`, node.fontFamily);
      // Default to CircularXX TT for testing
      textStyles['font-family'] = `CircularXX TT, sans-serif`;
    }
    
    // Font weight - use fontName style like the original project
    if ((node as any).fontName && (node as any).fontName) {
      if (typeof (node as any).fontName === 'object' && (node as any).fontName.style) {
        const figmaStyle = String((node as any).fontName.style);
        // Convert Figma font style to CSS font weight
        let cssWeight = figmaStyle;
        if (typeof figmaStyle === 'string') {
          if (figmaStyle.includes('Bold')) cssWeight = '700';
          else if (figmaStyle.includes('Medium')) cssWeight = '500';
          else if (figmaStyle.includes('Light')) cssWeight = '300';
          else if (figmaStyle.includes('Thin')) cssWeight = '100';
          else cssWeight = '400'; // Regular/Book
        }
        textStyles['font-weight'] = cssWeight;
      }
    } else if (node.fontWeight) {
      textStyles['font-weight'] = String(node.fontWeight);
    }
    
    if (node.textAlignHorizontal) {
      textStyles['text-align'] = node.textAlignHorizontal.toLowerCase();
    }
    
    if (node.letterSpacing) {
      if (typeof node.letterSpacing === 'object' && node.letterSpacing.value) {
        const unit = node.letterSpacing.unit === 'PERCENT' ? '%' : 'px';
        textStyles['letter-spacing'] = `${node.letterSpacing.value}${unit}`;
      } else if (typeof node.letterSpacing === 'number') {
        textStyles['letter-spacing'] = `${node.letterSpacing}px`;
      }
    }
    
    if (node.lineHeight) {
      // Handle object with value and unit
      if (typeof node.lineHeight === 'object' && node.lineHeight.value) {
        if (node.lineHeight.unit === 'AUTO' || node.lineHeight.unit === 'Auto' || node.lineHeight.unit === 'auto') {
          textStyles['line-height'] = '100%';
        } else {
          const value = node.lineHeight.value;
          // Figma line height is always percentage, convert to CSS percentage
          textStyles['line-height'] = `${value}%`;
        }
      }
      // Handle number (assume percentage)
      else if (typeof node.lineHeight === 'number') {
        textStyles['line-height'] = `${node.lineHeight}%`;
      }
      // Handle string "auto" values
      else if (typeof node.lineHeight === 'string' && (node.lineHeight === 'AUTO' || node.lineHeight === 'Auto' || node.lineHeight === 'auto')) {
        textStyles['line-height'] = '100%';
      }
      // Default to 100% if no valid line height
      else {
        textStyles['line-height'] = '100%';
      }
    }
  }
  
  return textStyles;
} 
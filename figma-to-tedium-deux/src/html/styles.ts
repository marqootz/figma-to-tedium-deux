import { FigmaNode, ComputedStyles } from '../types';

// Utility functions
function safeHasProperty(obj: any, prop: string): boolean {
  return obj && typeof obj === 'object' && prop in obj;
}

function safeToString(value: any): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

// CSS computation
export function computeNodeStyles(node: FigmaNode): ComputedStyles {
  const computedStyles: ComputedStyles = {};
  
  // Get node appearance opacity (this should multiply all other opacity values)
  const nodeOpacity = safeHasProperty(node, 'opacity') ? (node as any).opacity : 1;
  
  // --- FILLS ---
  if (safeHasProperty(node, 'fills') && (node as any).fills && (node as any).fills.length > 0) {
    const fill = (node as any).fills[0];
    if (fill.type === 'SOLID' && fill.color) {
      const { r, g, b, a = 1 } = fill.color;
      // Combine color alpha with fill opacity and node appearance opacity
      const fillOpacity = fill.opacity !== undefined ? fill.opacity : 1;
      const finalAlpha = a * fillOpacity * nodeOpacity;
      const rgba = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${finalAlpha})`;
      
      if (node.type === 'TEXT') {
        computedStyles.color = rgba;
      } else {
        computedStyles['background-color'] = rgba;
      }
    }
  }
  
  // --- LAYOUT STYLES ---
  if (node.layoutMode) {
    computedStyles.display = 'flex';
    
    // Flex direction
    if (node.layoutMode === 'HORIZONTAL') {
      computedStyles['flex-direction'] = 'row';
    } else if (node.layoutMode === 'VERTICAL') {
      computedStyles['flex-direction'] = 'column';
    }
    
    // Justify content (primary axis)
    if (node.primaryAxisAlignItems) {
      switch (node.primaryAxisAlignItems) {
        case 'MIN': computedStyles['justify-content'] = 'flex-start'; break;
        case 'MAX': computedStyles['justify-content'] = 'flex-end'; break;
        case 'CENTER': computedStyles['justify-content'] = 'center'; break;
        case 'SPACE_BETWEEN': computedStyles['justify-content'] = 'space-between'; break;
        case 'SPACE_AROUND': computedStyles['justify-content'] = 'space-around'; break;
      }
    }
    
    // Align items (counter axis)
    if (node.counterAxisAlignItems) {
      switch (node.counterAxisAlignItems) {
        case 'MIN': computedStyles['align-items'] = 'flex-start'; break;
        case 'MAX': computedStyles['align-items'] = 'flex-end'; break;
        case 'CENTER': computedStyles['align-items'] = 'center'; break;
        case 'STRETCH': computedStyles['align-items'] = 'stretch'; break;
      }
    }
    
    // Gap (item spacing) - don't add gap for space layouts that handle spacing internally
    if (node.itemSpacing && !['SPACE_BETWEEN', 'SPACE_AROUND'].includes(node.primaryAxisAlignItems || '')) {
      computedStyles.gap = `${node.itemSpacing}px`;
    } else if (['SPACE_BETWEEN', 'SPACE_AROUND'].includes(node.primaryAxisAlignItems || '')) {
      // Explicitly set gap to 0 for space layouts that handle spacing internally
      computedStyles.gap = '0px';
    }
  }
  
  // --- SIZING ---
  if (node.width !== undefined) {
    computedStyles.width = `${node.width}px`;
  }
  if (node.height !== undefined) {
    computedStyles.height = `${node.height}px`;
  }
  
  // Layout sizing
  if (node.layoutSizingHorizontal === 'FILL') {
    computedStyles.width = '100%';
  }
  if (node.layoutSizingVertical === 'FILL') {
    computedStyles.height = '100%';
  }
  
  // --- POSITIONING ---
  if (node.x !== undefined) {
    computedStyles.left = `${node.x}px`;
  }
  if (node.y !== undefined) {
    computedStyles.top = `${node.y}px`;
  }
  
  // --- BORDERS ---
  if (safeHasProperty(node, 'strokes') && (node as any).strokes && (node as any).strokes.length > 0) {
    const stroke = (node as any).strokes[0];
    if (stroke.type === 'SOLID' && stroke.color) {
      const { r, g, b, a = 1 } = stroke.color;
      const strokeOpacity = stroke.opacity !== undefined ? stroke.opacity : 1;
      const finalAlpha = a * strokeOpacity * nodeOpacity;
      const strokeColor = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${finalAlpha})`;
      const strokeWeight = node.strokeWeight || 1;
      computedStyles.border = `${strokeWeight}px solid ${strokeColor}`;
    }
  }
  
  // --- CORNER RADIUS ---
  if (node.cornerRadius !== undefined) {
    computedStyles['border-radius'] = `${node.cornerRadius}px`;
  }
  
  // --- CLIP CONTENT ---
  if (safeHasProperty(node, 'clipsContent') && (node as any).clipsContent === true) {
    computedStyles.overflow = 'hidden';
  }
  
  // --- PADDING ---
  if (node.paddingLeft) computedStyles['padding-left'] = `${node.paddingLeft}px`;
  if (node.paddingRight) computedStyles['padding-right'] = `${node.paddingRight}px`;
  if (node.paddingTop) computedStyles['padding-top'] = `${node.paddingTop}px`;
  if (node.paddingBottom) computedStyles['padding-bottom'] = `${node.paddingBottom}px`;
  
  // --- TEXT STYLES ---
  if (node.type === 'TEXT') {
    if (node.fontSize) {
      computedStyles['font-size'] = `${node.fontSize}px`;
    }
    
    // Font family - use fontName like the original project
    if (safeHasProperty(node, 'fontName') && (node as any).fontName) {
      if (typeof (node as any).fontName === 'object' && safeHasProperty((node as any).fontName, 'family')) {
        const figmaFamily = safeToString((node as any).fontName.family);
        console.log(`[DEBUG] Font family from fontName: ${figmaFamily}`);
        // Use exact Figma font names - no substitutions
        computedStyles['font-family'] = `${figmaFamily}, sans-serif`;
      }
    } else if (node.fontFamily) {
      console.log(`[DEBUG] Font family from fontFamily: ${node.fontFamily}`);
      computedStyles['font-family'] = `${node.fontFamily}`;
    } else {
      console.log(`[DEBUG] No font family found for node: ${node.name}`);
      console.log(`[DEBUG] Node fontName:`, node.fontName);
      console.log(`[DEBUG] Node fontFamily:`, node.fontFamily);
      // Default to CircularXX TT for testing
      computedStyles['font-family'] = `CircularXX TT, sans-serif`;
    }
    
    // Font weight - use fontName style like the original project
    if (safeHasProperty(node, 'fontName') && (node as any).fontName) {
      if (typeof (node as any).fontName === 'object' && safeHasProperty((node as any).fontName, 'style')) {
        const figmaStyle = safeToString((node as any).fontName.style);
        // Convert Figma font style to CSS font weight
        let cssWeight = figmaStyle;
        if (typeof figmaStyle === 'string') {
          if (figmaStyle.includes('Bold')) cssWeight = '700';
          else if (figmaStyle.includes('Medium')) cssWeight = '500';
          else if (figmaStyle.includes('Light')) cssWeight = '300';
          else if (figmaStyle.includes('Thin')) cssWeight = '100';
          else cssWeight = '400'; // Regular/Book
        }
        computedStyles['font-weight'] = cssWeight;
      }
    } else if (node.fontWeight) {
      computedStyles['font-weight'] = String(node.fontWeight);
    }
    
    if (node.textAlignHorizontal) {
      computedStyles['text-align'] = node.textAlignHorizontal.toLowerCase();
    }
    
    if (node.letterSpacing) {
      if (typeof node.letterSpacing === 'object' && node.letterSpacing.value) {
        const unit = node.letterSpacing.unit === 'PERCENT' ? '%' : 'px';
        computedStyles['letter-spacing'] = `${node.letterSpacing.value}${unit}`;
      } else if (typeof node.letterSpacing === 'number') {
        computedStyles['letter-spacing'] = `${node.letterSpacing}px`;
      }
    }
    
    if (node.lineHeight) {
      // Handle object with value and unit
      if (typeof node.lineHeight === 'object' && node.lineHeight.value) {
        if (node.lineHeight.unit === 'AUTO' || node.lineHeight.unit === 'Auto' || node.lineHeight.unit === 'auto') {
          computedStyles['line-height'] = '100%';
        } else {
          const value = node.lineHeight.value;
          // Figma line height is always percentage, convert to CSS percentage
          computedStyles['line-height'] = `${value}%`;
        }
      }
      // Handle number (assume percentage)
      else if (typeof node.lineHeight === 'number') {
        computedStyles['line-height'] = `${node.lineHeight}%`;
      }
      // Handle string "auto" values
      else if (typeof node.lineHeight === 'string' && (node.lineHeight === 'AUTO' || node.lineHeight === 'Auto' || node.lineHeight === 'auto')) {
        computedStyles['line-height'] = '100%';
      }
      // Default to 100% if no valid line height
      else {
        computedStyles['line-height'] = '100%';
      }
    }
  }
  
  return computedStyles;
} 
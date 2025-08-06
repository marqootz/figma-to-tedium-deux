import { FigmaNode, ComputedStyles } from '../types';

// Utility functions
function safeHasProperty(obj: any, prop: string): boolean {
  return obj && typeof obj === 'object' && prop in obj;
}

function safeToString(value: any): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

// Convert Figma gradient to CSS gradient
function convertGradientToCSS(gradient: any, nodeOpacity: number): string {
  if (!gradient.gradientStops || !Array.isArray(gradient.gradientStops)) {
    return '';
  }

  // Convert gradient stops to CSS format
  const stops = gradient.gradientStops.map((stop: any) => {
    const { r, g, b, a = 1 } = stop.color;
    const stopOpacity = stop.opacity !== undefined ? stop.opacity : 1;
    const finalAlpha = a * stopOpacity * nodeOpacity;
    const color = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${finalAlpha})`;
    
    // Convert Figma position (0-1) to CSS percentage (0-100)
    let position = stop.position;
    if (typeof position === 'number') {
      // Figma uses 0-1 range, CSS uses 0-100%
      position = Math.max(0, Math.min(100, position * 100));
      position = position.toFixed(2);
    } else {
      position = '0';
    }
    
    return `${color} ${position}%`;
  }).join(', ');

  if (gradient.type === 'GRADIENT_LINEAR') {
    // Handle linear gradient direction using gradientTransform matrix
    let direction = 'to right'; // default
    if (gradient.gradientTransform) {
      // Parse gradient transform matrix for linear gradients
      const transform = gradient.gradientTransform;
      if (transform && Array.isArray(transform) && transform.length >= 2) {
        // gradientTransform is a 2x3 matrix: [[a, b, c], [d, e, f]]
        // where a, d control x-direction scaling/shearing
        // and b, e control y-direction scaling/shearing
        const [a, b, c] = transform[0];
        const [d, e, f] = transform[1];
        
        // Calculate the angle from the transformation matrix
        // The angle is determined by the direction vector [a, d]
        if (Math.abs(a) > 0.001 || Math.abs(d) > 0.001) {
          // Calculate angle from the transformation matrix
          // Subtract 270 degrees to correct the rotation offset
          const angle = Math.atan2(d, a) * 180 / Math.PI - 270;
          direction = `${angle}deg`;
        }
      }
    }
    return `linear-gradient(${direction}, ${stops})`;
  } else if (gradient.type === 'GRADIENT_RADIAL') {
    // Handle radial gradient using gradientTransform matrix
    let shape = 'circle';
    let size = 'farthest-corner';
    let position = 'center';
    
    if (gradient.gradientTransform) {
      // Parse gradient transform matrix for radial gradients
      const transform = gradient.gradientTransform;
      if (transform && Array.isArray(transform) && transform.length >= 2) {
        // gradientTransform is a 2x3 matrix: [[a, b, c], [d, e, f]]
        // where c, f control translation (center position)
        // and a, d, b, e control scaling and rotation
        const [a, b, c] = transform[0];
        const [d, e, f] = transform[1];
        
        // Convert translation values (c, f) to CSS percentages
        const centerXPercent = Math.max(0, Math.min(100, c * 100));
        const centerYPercent = Math.max(0, Math.min(100, f * 100));
        
        // Use center if position is very small (near 0)
        if (Math.abs(centerXPercent) < 0.1 && Math.abs(centerYPercent) < 0.1) {
          position = 'center';
        } else {
          position = `${centerXPercent.toFixed(2)}% ${centerYPercent.toFixed(2)}%`;
        }
        
        // Calculate radius from the transformation matrix
        // The radius is determined by the scaling factors
        const scaleX = Math.sqrt(a * a + d * d);
        const scaleY = Math.sqrt(b * b + e * e);
        const radius = Math.max(scaleX, scaleY);
        
        // Map radius to CSS size keywords
        if (radius > 0 && radius < 0.5) {
          size = 'closest-side';
        } else if (radius > 0.5 && radius < 1) {
          size = 'farthest-side';
        } else if (radius > 1 && radius < 1.5) {
          size = 'closest-corner';
        } else {
          size = 'farthest-corner'; // Default size
        }
      }
    }
    
    return `radial-gradient(${shape} ${size} at ${position}, ${stops})`;
  }

  return '';
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
    } else if (fill.type === 'GRADIENT_LINEAR' || fill.type === 'GRADIENT_RADIAL') {
      // Handle gradients
      const gradientCSS = convertGradientToCSS(fill, nodeOpacity);
      if (gradientCSS) {
        if (node.type === 'TEXT') {
          computedStyles.color = gradientCSS;
        } else {
          computedStyles['background-image'] = gradientCSS;
        }
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
    
    // Gap (item spacing) - handle negative gaps with margins
    if (node.itemSpacing !== undefined) {
      if (['SPACE_BETWEEN', 'SPACE_AROUND'].includes(node.primaryAxisAlignItems || '')) {
        // Explicitly set gap to 0 for space layouts that handle spacing internally
        computedStyles.gap = '0px';
      } else if (node.itemSpacing < 0) {
        // Negative gap: use negative margins instead
        // This will be handled in the parent container's child processing
        computedStyles.gap = '0px';
      } else {
        // Positive gap: use normal gap
        computedStyles.gap = `${node.itemSpacing}px`;
      }
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
    } else if (stroke.type === 'GRADIENT_LINEAR' || stroke.type === 'GRADIENT_RADIAL') {
      // Handle gradient strokes
      const gradientCSS = convertGradientToCSS(stroke, nodeOpacity);
      if (gradientCSS) {
        const strokeWeight = node.strokeWeight || 1;
        // For gradient borders, we need to use background-image with border
        computedStyles['background-image'] = gradientCSS;
        computedStyles.border = `${strokeWeight}px solid transparent`;
        computedStyles['background-clip'] = 'border-box';
      }
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
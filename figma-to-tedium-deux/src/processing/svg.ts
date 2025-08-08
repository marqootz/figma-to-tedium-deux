// SVG conversion utilities - matches figma-to-tedium approach
// This module provides utilities for converting Figma vector nodes to SVG
// but is not used in the main HTML generation (which only handles TEXT nodes)

declare function btoa(data: string): string;
declare function atob(data: string): string;

export function base64Encode(str: string): string {
  if (typeof btoa !== 'undefined') {
    return btoa(str);
  }
  // Fallback for environments without btoa (Figma plugin environment)
  const utf8 = unescape(encodeURIComponent(str));
  let result = '';
  let i = 0;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  while (i < utf8.length) {
    const c1 = utf8.charCodeAt(i++);
    const c2 = utf8.charCodeAt(i++);
    const c3 = utf8.charCodeAt(i++);
    const e1 = c1 >> 2;
    const e2 = ((c1 & 3) << 4) | (c2 >> 4);
    const e3 = isNaN(c2) ? 64 : (((c2 & 15) << 2) | (c3 >> 6));
    const e4 = isNaN(c3) ? 64 : (c3 & 63);
    result += chars.charAt(e1) + chars.charAt(e2) + chars.charAt(e3) + chars.charAt(e4);
  }
  return result;
}

function base64Decode(str: string): string {
  if (typeof atob !== 'undefined') {
    return atob(str);
  }
  // Fallback for environments without atob (Figma plugin environment)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let result = '';
  let i = 0;
  
  // Remove any padding
  str = str.replace(/=+$/, '');
  
  while (i < str.length) {
    const e1 = chars.indexOf(str.charAt(i++));
    const e2 = chars.indexOf(str.charAt(i++));
    const e3 = chars.indexOf(str.charAt(i++));
    const e4 = chars.indexOf(str.charAt(i++));
    
    const c1 = (e1 << 2) | (e2 >> 4);
    const c2 = ((e2 & 15) << 4) | (e3 >> 2);
    const c3 = ((e3 & 3) << 6) | e4;
    
    result += String.fromCharCode(c1);
    if (e3 !== 64) result += String.fromCharCode(c2);
    if (e4 !== 64) result += String.fromCharCode(c3);
  }
  
  return result;
}

interface CustomRGB {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export function colorToRGBA(color: CustomRGB, opacity: number = 1): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = (color.a ?? 1) * opacity;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function getVectorStyles(vector: any) {
  const styles = {
    fills: [] as string[],
    strokes: [] as string[],
    strokeWeight: vector.strokeWeight || 0,
    gradients: [] as any[]
  };

  // Process fills
  if (vector.fills && Array.isArray(vector.fills)) {
    styles.fills = vector.fills.map((fill: any, fillIndex: number) => {
      if (fill.type === 'SOLID') {
        const color = fill.color;
        const opacity = fill.opacity ?? 1;
        const r = Math.round(color.r * 255);
        const g = Math.round(color.g * 255);
        const b = Math.round(color.b * 255);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      } else if (fill.type === 'GRADIENT_LINEAR' || fill.type === 'GRADIENT_RADIAL') {
        const gradientId = `gradient-${vector.id}-${fillIndex}`;
        styles.gradients.push({
          id: gradientId,
          type: fill.type,
          fill: fill
        });
        return `url(#${gradientId})`;
      }
      return 'none';
    });
  }

  // Process strokes
  if (vector.strokes && Array.isArray(vector.strokes)) {
    styles.strokes = vector.strokes.map((stroke: any) => {
      if (stroke.type === 'SOLID') {
        const color = stroke.color;
        const opacity = stroke.opacity ?? 1;
        const r = Math.round(color.r * 255);
        const g = Math.round(color.g * 255);
        const b = Math.round(color.b * 255);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      }
      return 'none';
    });
  }

  return styles;
}

function createSVGGradientDefinitions(gradients: any[]): string {
  if (gradients.length === 0) return '';
  
  const defs = gradients.map(gradient => {
    const { id, type, fill } = gradient;
    if (type === 'GRADIENT_LINEAR') {
      const stops = fill.gradientStops.map((stop: any) => {
        const color = colorToRGBA(stop.color, stop.opacity);
        return `<stop offset="${stop.position}%" stop-color="${color}" />`;
      }).join('');
      return `<linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="0%">${stops}</linearGradient>`;
    } else if (type === 'GRADIENT_RADIAL') {
      const stops = fill.gradientStops.map((stop: any) => {
        const color = colorToRGBA(stop.color, stop.opacity);
        return `<stop offset="${stop.position}%" stop-color="${color}" />`;
      }).join('');
      return `<radialGradient id="${id}" cx="50%" cy="50%" r="50%">${stops}</radialGradient>`;
    }
    return '';
  }).join('');
  
  return defs ? `<defs>${defs}</defs>` : '';
}

export function encodeSVGToBase64(svg: string): string {
  return base64Encode(svg);
}

export async function convertVectorToSVG(node: any): Promise<string> {
  console.log('DEBUG: Converting vector to SVG:', {
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    hasVectorPaths: !!node.vectorPaths,
    vectorPathsLength: node.vectorPaths?.length || 0,
    hasFills: !!node.fills,
    fillsLength: node.fills?.length || 0,
    hasBounds: !!node.absoluteRenderBounds,
    hasWidth: !!node.width,
    hasHeight: !!node.height,
    availableProperties: Object.keys(node).filter(key => !key.startsWith('_'))
  });
  
  // Use width/height from node if bounds are not available
  const width = node.width || (node.absoluteRenderBounds ? node.absoluteRenderBounds.width : 0);
  const height = node.height || (node.absoluteRenderBounds ? node.absoluteRenderBounds.height : 0);
  
  if (!width || !height) {
    console.warn('No valid dimensions found for vector node:', {
      nodeId: node.id,
      nodeName: node.name,
      width: node.width,
      height: node.height,
      bounds: node.absoluteRenderBounds
    });
    return '';
  }

  const styles = getVectorStyles(node);
  
  // Check for blur effects and add filter definitions
  let blurFilterDef = '';
  let blurFilterRef = '';
  
  if (node.effects && Array.isArray(node.effects)) {
    const blur = node.effects.find((effect: any) => effect.type === 'LAYER_BLUR' || effect.type === 'BACKGROUND_BLUR');
    if (blur) {
      const filterId = `blur-${node.id}`;
      blurFilterDef = `<filter id="${filterId}">
    <feGaussianBlur stdDeviation="${blur.radius}" />
  </filter>`;
      blurFilterRef = ` filter="url(#${filterId})"`;
    }
  }
  
  if (!node.vectorPaths || !Array.isArray(node.vectorPaths)) {
    console.warn('No vector paths found for vector:', {
      nodeId: node.id,
      nodeName: node.name,
      vectorPaths: node.vectorPaths
    });
    return '';
  }
  
  const paths = node.vectorPaths.map((path: any, index: number) => {
    console.log('DEBUG: Processing vector path:', {
      pathIndex: index,
      pathData: path.data,
      pathDataLength: path.data?.length || 0
    });
    
    const fill = styles.fills.length === 1 ? styles.fills[0] : (styles.fills[index] || 'none');
    const stroke = styles.strokes.length === 1 ? styles.strokes[0] : (styles.strokes[index] || 'none');
    const strokeWidth = styles.strokeWeight || 0;
    
    // Decode path data from base64
    let decodedPathData = path.data;
    try {
      if (/^[A-Za-z0-9+/=]+$/.test(path.data)) {
        decodedPathData = base64Decode(path.data);
        console.log('DEBUG: Decoded base64 path data:', {
          originalLength: path.data?.length || 0,
          decodedLength: decodedPathData?.length || 0,
          firstChars: decodedPathData?.substring(0, 50) || 'empty'
        });
      }
      
      if (!decodedPathData || decodedPathData.trim() === '') {
        console.warn('Empty decoded path data for path index:', index);
        return '';
      }
      
      const validCommands = ['M', 'L', 'H', 'V', 'C', 'S', 'Q', 'T', 'A', 'Z'];
      const firstChar = decodedPathData.trim().charAt(0).toUpperCase();
      if (!validCommands.includes(firstChar)) {
        console.warn('Invalid SVG path command:', firstChar);
        return '';
      }
      
    } catch (error) {
      console.warn('Error decoding path data:', error);
      decodedPathData = path.data;
    }
    
    return `<path d="${decodedPathData}" 
            fill="${fill}" 
            stroke="${stroke}" 
            stroke-width="${String(strokeWidth)}"
            fill-rule="nonzero"${blurFilterRef} />`;
  }).join('\n    ');
  
  if (!paths) {
    console.warn('No path data found for vector');
    return '';
  }

  // Create gradient definitions if any gradients exist
  const gradientDefs = createSVGGradientDefinitions(styles.gradients);
  
  // Wrap paths in a group element
  const wrappedPaths = `<g id="${node.name.replace(/\s+/g, '_')}">\n    ${paths}\n</g>`;
  
  return gradientDefs + '\n    ' + wrappedPaths;
}

export function convertRectangleToSVG(node: any): string {
  const svg = `<svg viewBox="0 0 ${node.width} ${node.height}" xmlns="http://www.w3.org/2000/svg">`;
  let fillColor = 'none';
  if (node.fills && Array.isArray(node.fills) && node.fills.length > 0) {
    const fill = node.fills[0];
    if (fill.type === 'SOLID') {
      fillColor = colorToRGBA(fill.color, fill.opacity);
    }
  }
  const rx = node.cornerRadius && typeof node.cornerRadius === 'number' ? node.cornerRadius : 0;
  return `${svg}<rect width="${node.width}" height="${node.height}" fill="${fillColor}" rx="${rx}"/></svg>`;
}

export function convertEllipseToSVG(node: any): string {
  const svg = `<svg viewBox="0 0 ${node.width} ${node.height}" xmlns="http://www.w3.org/2000/svg">`;
  let fillColor = 'none';
  if (node.fills && Array.isArray(node.fills) && node.fills.length > 0) {
    const fill = node.fills[0];
    if (fill.type === 'SOLID') {
      fillColor = colorToRGBA(fill.color, fill.opacity);
    }
  }
  const cx = node.width / 2;
  const cy = node.height / 2;
  const rx = node.width / 2;
  const ry = node.height / 2;
  return `${svg}<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fillColor}"/></svg>`;
} 
// Convert Figma gradient to CSS gradient
export function convertGradientToCSS(gradient: any, nodeOpacity: number): string {
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
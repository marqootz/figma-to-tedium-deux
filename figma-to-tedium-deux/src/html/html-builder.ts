import { FigmaNode, OverrideData } from '../types';
import { computeNodeStyles } from './styles';
import { generateReactionAttributes, generateVariantAttributes } from './events';
import { applyOverrides } from '../processing/nodes';
import { convertVectorToSVG, convertRectangleToSVG, convertEllipseToSVG } from '../processing/svg';
import { convertImageToHTML } from './image-converter';
import { getTagName, generateNodeAttributes } from './node-attributes';
import { generateNodeContent } from './node-content';
import { safeToString } from './utils';

export async function buildComponentSetHTMLAsync(node: FigmaNode, overrideData: OverrideData = {}): Promise<string> {
  // Apply overrides
  const processedNode = applyOverrides(node, overrideData);
  
  // Handle SVG nodes differently
  if (processedNode.type === 'VECTOR') {
    const svg = await convertVectorToSVG(processedNode);
    const width = safeToString(processedNode.width || 0);
    const height = safeToString(processedNode.height || 0);
    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">${svg}</svg>`;
  }
  
  // Handle image nodes (either IMAGE type or RECTANGLE with IMAGE fill)
  if (processedNode.type === 'IMAGE' || 
      (processedNode.type === 'RECTANGLE' && processedNode.fills && 
       Array.isArray(processedNode.fills) && 
       processedNode.fills.some(fill => fill.type === 'IMAGE'))) {
    return await convertImageToHTML(processedNode);
  }
  
  if (processedNode.type === 'RECTANGLE') {
    return convertRectangleToSVG(processedNode);
  }
  
  if (processedNode.type === 'ELLIPSE') {
    return convertEllipseToSVG(processedNode);
  }
  
  // Compute styles for non-SVG nodes
  const computedStyles = computeNodeStyles(processedNode);
  
  // Generate attributes
  const attributes = generateNodeAttributes(processedNode, overrideData);
  
  // Generate reaction attributes
  const reactionAttributes = generateReactionAttributes(processedNode);
  
  // Generate variant attributes
  const variantAttributes = generateVariantAttributes(processedNode);
  
  // Combine all attributes
  const allAttributes = [
    ...attributes,
    ...Object.entries(reactionAttributes).map(([key, value]) => `${key}="${value}"`),
    ...Object.entries(variantAttributes).map(([key, value]) => `${key}="${value}"`)
  ];
  
  // Convert styles to CSS string and handle pseudo-elements
  console.log(`[DEBUG] Computed styles for node ${processedNode.name}:`, computedStyles);
  
  // Extract pseudo-element CSS if present
  let pseudoElementCSS = '';
  const cleanStyles = { ...computedStyles };
  if ((cleanStyles as any).pseudoElementCSS) {
    pseudoElementCSS = (cleanStyles as any).pseudoElementCSS;
    delete (cleanStyles as any).pseudoElementCSS;
  }
  
  const styleString = Object.entries(cleanStyles)
    .filter(([property, value]) => value !== undefined && value !== null && value !== '')
    .map(([property, value]) => `${property}: ${value}`)
    .join('; ');
  console.log(`[DEBUG] Style string for node ${processedNode.name}:`, styleString);
  
  // Generate content
  const content = generateNodeContent(processedNode);
  
  // Generate children HTML with negative margin handling
  let childrenHTML = '';
  if (processedNode.children && processedNode.children.length > 0) {
    const childrenWithMargins = await Promise.all(
      processedNode.children.map(async (child: FigmaNode, index: number) => {
        let childHTML = await buildComponentSetHTMLAsync(child, overrideData);
        
        // Handle negative margins for negative gap values
        if (processedNode.itemSpacing !== undefined && processedNode.itemSpacing < 0) {
          const negativeMargin = processedNode.itemSpacing / 2; // Split the negative gap
          const isVertical = processedNode.layoutMode === 'VERTICAL';
          const isHorizontal = processedNode.layoutMode === 'HORIZONTAL';
          
          if (isVertical || isHorizontal) {
            const isFirst = index === 0;
            const isLast = index === (processedNode.children?.length || 0) - 1;
            
            // Determine which margins to apply based on position
            let marginStyles = '';
            
            if (isVertical) {
              // Vertical layout: apply margin-top to all except first, margin-bottom to all except last
              if (!isFirst) {
                marginStyles += `margin-top: ${negativeMargin}px; `;
              }
              if (!isLast) {
                marginStyles += `margin-bottom: ${negativeMargin}px; `;
              }
            } else if (isHorizontal) {
              // Horizontal layout: apply margin-left to all except first, margin-right to all except last
              if (!isFirst) {
                marginStyles += `margin-left: ${negativeMargin}px; `;
              }
              if (!isLast) {
                marginStyles += `margin-right: ${negativeMargin}px; `;
              }
            }
            
            // Add margins to the child's style
            if (marginStyles) {
              childHTML = childHTML.replace(
                /style="([^"]*)"/,
                `style="$1; ${marginStyles.trim()}"`
              );
            }
          }
        }
        
        return childHTML;
      })
    );
    
    childrenHTML = childrenWithMargins.join('\n');
  }
  
  // Build the HTML
  const tagName = getTagName(processedNode);
  const openTag = `<${tagName} ${allAttributes.join(' ')} style="${styleString}">`;
  const closeTag = `</${tagName}>`;
  
  // Add pseudo-element CSS if present
  if (pseudoElementCSS) {
    // Create a style tag with the pseudo-element CSS
    const styleTag = `<style>
      [data-figma-id="${processedNode.id}"] ${pseudoElementCSS}
    </style>`;
    return `${styleTag}${openTag}${content}${childrenHTML}${closeTag}`;
  }
  
  return `${openTag}${content}${childrenHTML}${closeTag}`;
} 
import { FigmaNode, OverrideData } from '../types';
import { computeNodeStyles } from './styles';
import { generateReactionAttributes, generateVariantAttributes } from './events';
import { applyOverrides, getComponentSetFromInstance } from '../processing/nodes';
import { convertVectorToSVG, convertRectangleToSVG, convertEllipseToSVG } from '../processing/svg';
import { convertImageToHTML } from './image-converter';
import { getTagName, generateNodeAttributes } from './node-attributes';
import { generateNodeContent } from './node-content';
import { safeToString } from './utils';

export async function buildComponentSetHTMLAsync(node: FigmaNode, overrideData: OverrideData = {}, parentNode?: FigmaNode): Promise<string> {
  // Check if this is an instance of a component set
  const componentSetComponents = await getComponentSetFromInstance(node);
  
  if (componentSetComponents.length > 0) {
    console.log(`Building HTML for component set with ${componentSetComponents.length} components`);
    
    // Generate HTML for all components in the set
    const componentHTMLs = await Promise.all(
      componentSetComponents.map(async (component, index) => {
        // IMPORTANT: Don't call buildComponentSetHTMLAsync recursively on components created from instances
        // This prevents infinite recursion
        if (component.isInstanceComponent) {
          console.log('Processing instance component directly, avoiding recursion');
          // Process the component directly without checking for component sets again
          let componentHTML = await processNodeDirectly(component, overrideData, parentNode);
          
          // For component set variants, ensure they all start at the same position (top: 0)
          // This is crucial for SMART_ANIMATE to work properly
          if (componentHTML.includes('style="')) {
            // Replace any top positioning with top: 0 for variants
            componentHTML = componentHTML.replace(
              /style="([^"]*)"/,
              (match, styleContent) => {
                // Remove any top positioning and ensure variants start at the same position
                const updatedStyle = styleContent
                  .replace(/top:\s*[^;]+;?\s*/g, '') // Remove any top positioning
                  .replace(/position:\s*[^;]+;?\s*/g, '') // Remove any position
                  + '; top: 0; position: absolute; width: 100%; height: 100%;';
                return `style="${updatedStyle}"`;
              }
            );
          }
          
          // Add visibility control classes for variants
          if (index === 0) {
            // First variant should be visible initially
            return componentHTML.replace('<div', '<div class="variant-active"');
          } else {
            // Other variants should be hidden initially
            return componentHTML.replace('<div', '<div class="variant-hidden"');
          }
        }
        return await buildComponentSetHTMLAsync(component, overrideData, parentNode);
      })
    );
    
    // Wrap all components in a component set container
    const containerAttributes = [
      `data-figma-type="COMPONENT_SET"`,
      `data-figma-id="${node.id}"`,
      `data-figma-name="${node.name}"`,
      `style="position: relative; width: 100%; height: 100%;"`
    ];
    
    const containerOpenTag = `<div ${containerAttributes.join(' ')}>`;
    const containerCloseTag = '</div>';
    
    // Return all components wrapped in the container
    return `${containerOpenTag}${componentHTMLs.join('\n')}${containerCloseTag}`;
  }
  
  // Process the node directly
  return await processNodeDirectly(node, overrideData, parentNode);
}

// Helper function to process a node directly without checking for component sets
async function processNodeDirectly(node: FigmaNode, overrideData: OverrideData = {}, parentNode?: FigmaNode): Promise<string> {
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
  const computedStyles = computeNodeStyles(processedNode, parentNode);
  
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
  
  // Convert styles to CSS string
  console.log(`[DEBUG] Computed styles for node ${processedNode.name}:`, computedStyles);
  const styleString = Object.entries(computedStyles)
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
        let childHTML = await buildComponentSetHTMLAsync(child, overrideData, processedNode);
        
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
  
  return `${openTag}${content}${childrenHTML}${closeTag}`;
} 
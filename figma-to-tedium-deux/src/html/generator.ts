import { FigmaNode, OverrideData, ComputedStyles } from '../types';
import { computeNodeStyles } from './styles';
import { generateReactionAttributes, generateVariantAttributes } from './events';
import { applyOverrides } from '../processing/nodes';
import { convertVectorToSVG, convertRectangleToSVG, convertEllipseToSVG } from '../processing/svg';

// Utility functions
function safeHasProperty(obj: any, prop: string): boolean {
  return obj && typeof obj === 'object' && prop in obj;
}

function safeToString(value: any): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// HTML generation functions
export function getTagName(node: FigmaNode): string {
  switch (node.type) {
    case 'TEXT':
      return 'p';
    case 'VECTOR':
    case 'RECTANGLE':
    case 'ELLIPSE':
      return 'svg';
    default:
      return 'div';
  }
}

export function generateNodeAttributes(node: FigmaNode, overrideData: OverrideData): string[] {
  const attributes = [
    `data-figma-id="${safeToString(node.id)}"`,
    `data-figma-name="${escapeHtmlAttribute(safeToString(node.name))}"`,
    `data-figma-type="${safeToString(node.type)}"`
  ];
  
  // Add component set ID for component sets
  if (node.type === 'COMPONENT_SET') {
    attributes.push(`data-component-set-id="${safeToString(node.id)}"`);
  }
  
  // Add variant ID for components (variants)
  if (node.type === 'COMPONENT') {
    attributes.push(`data-variant-id="${safeToString(node.id)}"`);
  }
  
  // Add original positioning and styling data for smart animate
  if (typeof node.x === 'number') {
    attributes.push(`data-original-x="${node.x}"`);
  }
  if (typeof node.y === 'number') {
    attributes.push(`data-original-y="${node.y}"`);
  }
  if (typeof node.width === 'number') {
    attributes.push(`data-original-width="${node.width}"`);
  }
  if (typeof node.height === 'number') {
    attributes.push(`data-original-height="${node.height}"`);
  }
  if (typeof node.opacity === 'number') {
    attributes.push(`data-original-opacity="${node.opacity}"`);
  }
  if (typeof node.cornerRadius === 'number') {
    attributes.push(`data-original-border-radius="${node.cornerRadius}"`);
  }
  if (node.layoutMode) {
    attributes.push(`data-original-layout-mode="${node.layoutMode}"`);
  }
  if (node.primaryAxisAlignItems) {
    attributes.push(`data-original-primary-axis-align="${node.primaryAxisAlignItems}"`);
  }
  if (node.counterAxisAlignItems) {
    attributes.push(`data-original-counter-axis-align="${node.counterAxisAlignItems}"`);
  }
  
  // Add background color from fills
  if (node.fills && Array.isArray(node.fills) && node.fills.length > 0) {
    const fill = node.fills[0];
    if (fill && fill.type === 'SOLID' && fill.color) {
      const { r, g, b } = fill.color;
      const a = fill.opacity !== undefined ? fill.opacity : 1;
      const backgroundColor = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
      attributes.push(`data-original-background-color="${backgroundColor}"`);
    }
  }
  
  // Add text color for TEXT nodes
  if (node.type === 'TEXT' && node.fills && Array.isArray(node.fills) && node.fills.length > 0) {
    const fill = node.fills[0];
    if (fill && fill.type === 'SOLID' && fill.color) {
      const { r, g, b } = fill.color;
      const a = fill.opacity !== undefined ? fill.opacity : 1;
      const color = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
      attributes.push(`data-original-color="${color}"`);
    }
  }
  
  // Add text properties for TEXT nodes
  if (node.type === 'TEXT') {
    if (typeof node.fontSize === 'number') {
      attributes.push(`data-original-font-size="${node.fontSize}"`);
    }
    if (node.fontWeight) {
      attributes.push(`data-original-font-weight="${node.fontWeight}"`);
    }
    if (node.textAlignHorizontal) {
      attributes.push(`data-original-text-align="${node.textAlignHorizontal.toLowerCase()}"`);
    }
    if (typeof node.letterSpacing === 'number') {
      attributes.push(`data-original-letter-spacing="${node.letterSpacing}"`);
    }
  }
  
  // Add override data
  if (overrideData) {
    Object.entries(overrideData).forEach(([key, value]) => {
      attributes.push(`data-override-${key.toLowerCase()}="${escapeHtmlAttribute(safeToString(value))}"`);
    });
  }
  
  return attributes;
}

export function generateNodeContent(node: FigmaNode): string {
  // Handle text content for TEXT nodes only
  if (node.type === 'TEXT' && (node as any).characters) {
    return escapeHtmlAttribute((node as any).characters);
  }
  
  // For all other node types, return empty content
  // Node names and variant info should not be visible text
  return '';
}

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
  
  // Convert styles to CSS string
  console.log(`[DEBUG] Computed styles for node ${processedNode.name}:`, computedStyles);
  const styleString = Object.entries(computedStyles)
    .filter(([property, value]) => value !== undefined && value !== null && value !== '')
    .map(([property, value]) => `${property}: ${value}`)
    .join('; ');
  console.log(`[DEBUG] Style string for node ${processedNode.name}:`, styleString);
  
  // Generate content
  const content = generateNodeContent(processedNode);
  
  // Generate children HTML
  let childrenHTML = '';
  if (processedNode.children && processedNode.children.length > 0) {
    childrenHTML = await Promise.all(
      processedNode.children.map(async (child: FigmaNode) => {
        return await buildComponentSetHTMLAsync(child, overrideData);
      })
    ).then(children => children.join('\n'));
  }
  
  // Build the HTML
  const tagName = getTagName(processedNode);
  const openTag = `<${tagName} ${allAttributes.join(' ')} style="${styleString}">`;
  const closeTag = `</${tagName}>`;
  
  return `${openTag}${content}${childrenHTML}${closeTag}`;
} 
import { FigmaNode, OverrideData, ComputedStyles } from '../types';
import { computeNodeStyles } from './styles';
import { generateReactionAttributes, generateVariantAttributes } from './events';
import { applyOverrides } from '../processing/nodes';
import { convertVectorToSVG, convertRectangleToSVG, convertEllipseToSVG } from '../processing/svg';

// Declare global Figma types
declare const figma: any;

// Image conversion function
export async function convertImageToHTML(node: FigmaNode): Promise<string> {
  const width = safeToString(node.width || 0);
  const height = safeToString(node.height || 0);
  const alt = escapeHtmlAttribute(safeToString(node.name || 'Image'));
  
  // Check if we have image hash in fills array
  let imageHash = null;
  if (node.fills && Array.isArray(node.fills) && node.fills.length > 0) {
    const imageFill = node.fills.find(fill => fill.type === 'IMAGE');
    if (imageFill && (imageFill as any).imageHash) {
      imageHash = (imageFill as any).imageHash;
    }
  }
  
  // Also check direct imageHash property for backward compatibility
  if (!imageHash && (node as any).imageHash) {
    imageHash = (node as any).imageHash;
  }
  
  if (imageHash) {
    try {
      console.log('Attempting to load image with hash:', imageHash);
      
      // Check if the image hash is valid
      if (!imageHash || typeof imageHash !== 'string') {
        throw new Error('Invalid image hash: ' + imageHash);
      }
      
      // Get the image using the official Figma API
      const image = figma.getImageByHash(imageHash);
      console.log('Image object retrieved:', image);
      
      if (!image) {
        throw new Error('Image not found for hash: ' + imageHash);
      }
      
      const bytes = await image.getBytesAsync();
      console.log('Image bytes retrieved, length:', bytes.length);
      
      // Convert to base64 for embedding in HTML
      const uint8Array = new Uint8Array(bytes);
      
      // Custom base64 conversion (btoa might not be available in Figma plugin environment)
      const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      let base64Data = '';
      
      for (let i = 0; i < uint8Array.length; i += 3) {
        const byte1 = uint8Array[i] || 0;
        const byte2 = i + 1 < uint8Array.length ? (uint8Array[i + 1] || 0) : 0;
        const byte3 = i + 2 < uint8Array.length ? (uint8Array[i + 2] || 0) : 0;
        
        const chunk1 = byte1 >> 2;
        const chunk2 = ((byte1 & 3) << 4) | (byte2 >> 4);
        const chunk3 = ((byte2 & 15) << 2) | (byte3 >> 6);
        const chunk4 = byte3 & 63;
        
        base64Data += base64Chars[chunk1];
        base64Data += base64Chars[chunk2];
        base64Data += i + 1 < uint8Array.length ? base64Chars[chunk3] : '=';
        base64Data += i + 2 < uint8Array.length ? base64Chars[chunk4] : '=';
      }
      
      console.log('Base64 conversion successful, length:', base64Data.length);
      
      // Determine image format (assuming PNG for now)
      const imageFormat = 'image/png';
      
      return `<img src="data:${imageFormat};base64,${base64Data}" width="${width}" height="${height}" alt="${alt}" style="object-fit: cover;" data-image-hash="${imageHash}" />`;
    } catch (error) {
      console.error('Failed to load image:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace',
        imageHash: imageHash
      });
      // Fallback to informative placeholder if image loading fails
      return `<div style="width: ${width}px; height: ${height}px; background: linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%); background-size: 20px 20px; background-position: 0 0, 0 10px, 10px -10px, -10px 0px; display: flex; align-items: center; justify-content: center; border: 2px dashed #ccc; color: #666; font-family: Arial, sans-serif; font-size: 12px; text-align: center;" data-figma-type="image-placeholder" data-image-hash="${imageHash}">
        <div>
          <div style="font-weight: bold; margin-bottom: 4px;">📷 Image</div>
          <div style="font-size: 10px; color: #999;">${width} × ${height}px</div>
          <div style="font-size: 9px; color: #ccc; margin-top: 4px;">Hash: ${imageHash ? (imageHash as string).substring(0, 8) + '...' : 'N/A'}</div>
        </div>
      </div>`;
    }
  }
  
  // Fallback for nodes without image hash
  return `<div style="width: ${width}px; height: ${height}px; background-color: #f0f0f0; display: flex; align-items: center; justify-content: center; border: 1px dashed #ccc; color: #999; font-family: Arial, sans-serif; font-size: 12px;" data-figma-type="image-placeholder">Image Placeholder</div>`;
}

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
  // Check if this is an image node (either IMAGE type or RECTANGLE with IMAGE fill)
  if (node.type === 'IMAGE') {
    return 'img';
  }
  
  // Check if RECTANGLE has IMAGE fill
  if (node.type === 'RECTANGLE' && node.fills && Array.isArray(node.fills)) {
    const hasImageFill = node.fills.some(fill => fill.type === 'IMAGE');
    if (hasImageFill) {
      return 'img';
    }
  }
  
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
import { FigmaNode, OverrideData } from '../types';
import { safeToString, escapeHtmlAttribute, safeAttributeValue } from './utils';

export function getTagName(node: FigmaNode): string {
  switch (node.type) {
    case 'TEXT':
      return 'p';
    case 'RECTANGLE':
    case 'ELLIPSE':
    case 'VECTOR':
    case 'LINE':
    case 'POLYGON':
    case 'STAR':
    case 'BOOLEAN_OPERATION':
    case 'FRAME':
    case 'GROUP':
    case 'COMPONENT':
    case 'COMPONENT_SET':
    case 'INSTANCE':
    case 'SLICE':
    case 'DOCUMENT':
    case 'PAGE':
    case 'CANVAS':
    default:
      return 'div';
  }
}

export function generateNodeAttributes(node: FigmaNode, overrideData: OverrideData): string[] {
  const attributes: string[] = [];
  
  // Add data-figma-id attribute
  if (node.id) {
    attributes.push(`data-figma-id="${escapeHtmlAttribute(safeAttributeValue(node.id))}"`);
  }
  
  // Add data-figma-name attribute
  if (node.name) {
    attributes.push(`data-figma-name="${escapeHtmlAttribute(safeAttributeValue(node.name))}"`);
  }
  
  // Add data-figma-type attribute
  if (node.type) {
    attributes.push(`data-figma-type="${escapeHtmlAttribute(safeAttributeValue(node.type))}"`);
  }
  
  // Add override data attributes
  if (overrideData && Object.keys(overrideData).length > 0) {
    Object.entries(overrideData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        attributes.push(`data-override-${key}="${escapeHtmlAttribute(safeAttributeValue(value))}"`);
      }
    });
  }
  
  // Add variant attributes for components that are variants
  if (node.type === 'COMPONENT' && node.name) {
    // Check if the name contains variant information (e.g., "Property 1=default")
    const variantMatch = node.name.match(/^([^=]+)=(.+)$/);
    
    if (variantMatch && variantMatch.length >= 3) {
      const propertyName = variantMatch[1]!.toLowerCase().replace(/\s+/g, '-');
      const propertyValue = variantMatch[2]!;
      const attributeName = `data-variant-${propertyName}`;
      const attributeValue = escapeHtmlAttribute(safeAttributeValue(propertyValue));
      attributes.push(`${attributeName}="${attributeValue}"`);
    }
  }
  
  // Add layout mode attribute for debugging
  if (node.layoutMode) {
    attributes.push(`data-layout-mode="${escapeHtmlAttribute(safeAttributeValue(node.layoutMode))}"`);
  }
  
  // Add primary axis alignment attribute
  if (node.primaryAxisAlignItems) {
    attributes.push(`data-primary-axis="${escapeHtmlAttribute(safeAttributeValue(node.primaryAxisAlignItems))}"`);
  }
  
  // Add counter axis alignment attribute
  if (node.counterAxisAlignItems) {
    attributes.push(`data-counter-axis="${escapeHtmlAttribute(safeAttributeValue(node.counterAxisAlignItems))}"`);
  }
  
  // Add item spacing attribute
  if (node.itemSpacing !== undefined) {
    attributes.push(`data-item-spacing="${safeAttributeValue(node.itemSpacing)}"`);
  }
  
  // Add sizing attributes
  if (node.layoutSizingHorizontal) {
    attributes.push(`data-sizing-horizontal="${escapeHtmlAttribute(safeAttributeValue(node.layoutSizingHorizontal))}"`);
  }
  if (node.layoutSizingVertical) {
    attributes.push(`data-sizing-vertical="${escapeHtmlAttribute(safeAttributeValue(node.layoutSizingVertical))}"`);
  }
  
  // Add padding attributes
  if (node.paddingLeft !== undefined) {
    attributes.push(`data-padding-left="${safeAttributeValue(node.paddingLeft)}"`);
  }
  if (node.paddingRight !== undefined) {
    attributes.push(`data-padding-right="${safeAttributeValue(node.paddingRight)}"`);
  }
  if (node.paddingTop !== undefined) {
    attributes.push(`data-padding-top="${safeAttributeValue(node.paddingTop)}"`);
  }
  if (node.paddingBottom !== undefined) {
    attributes.push(`data-padding-bottom="${safeAttributeValue(node.paddingBottom)}"`);
  }
  
  // Add text-specific attributes
  if (node.type === 'TEXT') {
    if (node.fontSize !== undefined) {
      attributes.push(`data-font-size="${safeAttributeValue(node.fontSize)}"`);
    }
    if (node.fontWeight !== undefined) {
      attributes.push(`data-font-weight="${safeAttributeValue(node.fontWeight)}"`);
    }
    if (node.textAlignHorizontal) {
      attributes.push(`data-text-align="${escapeHtmlAttribute(safeAttributeValue(node.textAlignHorizontal))}"`);
    }
    if (node.letterSpacing !== undefined) {
      if (typeof node.letterSpacing === 'object' && node.letterSpacing.value) {
        attributes.push(`data-letter-spacing="${safeAttributeValue(node.letterSpacing.value)}"`);
      } else if (typeof node.letterSpacing === 'number') {
        attributes.push(`data-letter-spacing="${safeAttributeValue(node.letterSpacing)}"`);
      }
    }
    if (node.lineHeight !== undefined) {
      if (typeof node.lineHeight === 'object' && node.lineHeight.value) {
        attributes.push(`data-line-height="${safeAttributeValue(node.lineHeight.value)}"`);
      } else if (typeof node.lineHeight === 'number') {
        attributes.push(`data-line-height="${safeAttributeValue(node.lineHeight)}"`);
      }
    }
  }
  
  // Add visual attributes
  if (node.opacity !== undefined) {
    attributes.push(`data-opacity="${safeAttributeValue(node.opacity)}"`);
  }
  if (node.cornerRadius !== undefined) {
    attributes.push(`data-corner-radius="${safeAttributeValue(node.cornerRadius)}"`);
  }
  if (node.strokeWeight !== undefined) {
    attributes.push(`data-stroke-weight="${safeAttributeValue(node.strokeWeight)}"`);
  }
  
  // Add clipping attribute
  if ((node as any).clipsContent === true) {
    attributes.push('data-clips-content="true"');
  }
  
  // Add layout positioning attribute
  if ((node as any).layoutPositioning) {
    attributes.push(`data-layout-positioning="${escapeHtmlAttribute(safeAttributeValue((node as any).layoutPositioning))}"`);
  }
  
  // Add Figma position attributes for animation detection
  if (node.x !== undefined && node.x !== null) {
    attributes.push(`data-figma-x="${safeAttributeValue(node.x)}"`);
  }
  if (node.y !== undefined && node.y !== null) {
    attributes.push(`data-figma-y="${safeAttributeValue(node.y)}"`);
  }
  
  return attributes;
} 
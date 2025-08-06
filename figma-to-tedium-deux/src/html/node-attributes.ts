import { FigmaNode, OverrideData } from '../types';
import { safeToString, escapeHtmlAttribute } from './utils';

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
    attributes.push(`data-figma-id="${escapeHtmlAttribute(node.id)}"`);
  }
  
  // Add data-figma-name attribute
  if (node.name) {
    attributes.push(`data-figma-name="${escapeHtmlAttribute(node.name)}"`);
  }
  
  // Add data-figma-type attribute
  if (node.type) {
    attributes.push(`data-figma-type="${escapeHtmlAttribute(node.type)}"`);
  }
  
  // Add override data attributes
  if (overrideData && Object.keys(overrideData).length > 0) {
    Object.entries(overrideData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        attributes.push(`data-override-${key}="${escapeHtmlAttribute(String(value))}"`);
      }
    });
  }
  
  // Add layout mode attribute for debugging
  if (node.layoutMode) {
    attributes.push(`data-layout-mode="${escapeHtmlAttribute(node.layoutMode)}"`);
  }
  
  // Add primary axis alignment attribute
  if (node.primaryAxisAlignItems) {
    attributes.push(`data-primary-axis="${escapeHtmlAttribute(node.primaryAxisAlignItems)}"`);
  }
  
  // Add counter axis alignment attribute
  if (node.counterAxisAlignItems) {
    attributes.push(`data-counter-axis="${escapeHtmlAttribute(node.counterAxisAlignItems)}"`);
  }
  
  // Add item spacing attribute
  if (node.itemSpacing !== undefined) {
    attributes.push(`data-item-spacing="${node.itemSpacing}"`);
  }
  
  // Add sizing attributes
  if (node.layoutSizingHorizontal) {
    attributes.push(`data-sizing-horizontal="${escapeHtmlAttribute(node.layoutSizingHorizontal)}"`);
  }
  if (node.layoutSizingVertical) {
    attributes.push(`data-sizing-vertical="${escapeHtmlAttribute(node.layoutSizingVertical)}"`);
  }
  
  // Add padding attributes
  if (node.paddingLeft !== undefined) {
    attributes.push(`data-padding-left="${node.paddingLeft}"`);
  }
  if (node.paddingRight !== undefined) {
    attributes.push(`data-padding-right="${node.paddingRight}"`);
  }
  if (node.paddingTop !== undefined) {
    attributes.push(`data-padding-top="${node.paddingTop}"`);
  }
  if (node.paddingBottom !== undefined) {
    attributes.push(`data-padding-bottom="${node.paddingBottom}"`);
  }
  
  // Add text-specific attributes
  if (node.type === 'TEXT') {
    if (node.fontSize !== undefined) {
      attributes.push(`data-font-size="${node.fontSize}"`);
    }
    if (node.fontWeight !== undefined) {
      attributes.push(`data-font-weight="${node.fontWeight}"`);
    }
    if (node.textAlignHorizontal) {
      attributes.push(`data-text-align="${escapeHtmlAttribute(node.textAlignHorizontal)}"`);
    }
    if (node.letterSpacing !== undefined) {
      if (typeof node.letterSpacing === 'object' && node.letterSpacing.value) {
        attributes.push(`data-letter-spacing="${node.letterSpacing.value}"`);
      } else if (typeof node.letterSpacing === 'number') {
        attributes.push(`data-letter-spacing="${node.letterSpacing}"`);
      }
    }
    if (node.lineHeight !== undefined) {
      if (typeof node.lineHeight === 'object' && node.lineHeight.value) {
        attributes.push(`data-line-height="${node.lineHeight.value}"`);
      } else if (typeof node.lineHeight === 'number') {
        attributes.push(`data-line-height="${node.lineHeight}"`);
      }
    }
  }
  
  // Add visual attributes
  if (node.opacity !== undefined) {
    attributes.push(`data-opacity="${node.opacity}"`);
  }
  if (node.cornerRadius !== undefined) {
    attributes.push(`data-corner-radius="${node.cornerRadius}"`);
  }
  if (node.strokeWeight !== undefined) {
    attributes.push(`data-stroke-weight="${node.strokeWeight}"`);
  }
  
  // Add clipping attribute
  if ((node as any).clipsContent === true) {
    attributes.push('data-clips-content="true"');
  }
  
  return attributes;
} 
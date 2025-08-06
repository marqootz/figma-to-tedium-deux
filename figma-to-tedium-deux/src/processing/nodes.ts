import { FigmaNode, OverrideData } from '../types';

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

// Node processing functions
export function getAllNodeIds(node: FigmaNode): string[] {
  const ids = [node.id];
  if (node.children) {
    for (const child of node.children) {
      ids.push(...getAllNodeIds(child));
    }
  }
  return ids;
}

export function findNodeById(node: FigmaNode, id: string): FigmaNode | null {
  if (node.id === id) return node;
  if (node.children) {
    for (const child of node.children) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
  }
  return null;
}

export function applyOverrides(node: FigmaNode, overrideData: OverrideData): FigmaNode {
  // Simple implementation - just return the node
  // In a full implementation, this would apply dynamic overrides
  return node;
}

export function figmaNodeToObject(node: any): any {
  const commonProps = [
    'id', 'name', 'type', 'x', 'y', 'width', 'height', 'opacity',
    'fills', 'strokes', 'strokeWeight', 'cornerRadius', 'layoutMode',
    'primaryAxisAlignItems', 'counterAxisAlignItems', 'itemSpacing',
    'layoutSizingHorizontal', 'layoutSizingVertical', 'paddingLeft',
    'paddingRight', 'paddingTop', 'paddingBottom', 'fontSize',
    'fontName', 'fontFamily', 'fontWeight', 'textAlignHorizontal',
    'letterSpacing', 'lineHeight', 'characters', 'variantProperties',
    'reactions', 'children'
  ];

  const result: any = {};
  
  for (const prop of commonProps) {
    if (safeHasProperty(node, prop)) {
      result[prop] = (node as any)[prop];
    }
  }

  return result;
}

export async function exportNodeToVerboseJSON(node: any, parentId: string | null = null): Promise<any> {
  // Use figmaNodeToObject to get all properties including fontName
  const baseNodeData = figmaNodeToObject(node);
  
  const nodeData = {
    ...baseNodeData,
    parentId: parentId,
    children: node.children ? await Promise.all(
      node.children.map((child: any) => exportNodeToVerboseJSON(child, node.id))
    ) : []
  };

  return nodeData;
} 
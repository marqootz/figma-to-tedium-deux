import { FigmaNode } from '../types';
import { safeToString } from './utils';

export function generateNodeContent(node: FigmaNode): string {
  // For text nodes, return the text content
  if (node.type === 'TEXT' && (node as any).characters) {
    return safeToString((node as any).characters);
  }
  
  // For other node types, return empty content
  return '';
} 
import { FigmaNode } from '../types';
import { safeToString } from './utils';

export function generateNodeContent(node: FigmaNode): string {
  // For text nodes, return the text content with line breaks converted to <br> tags
  if (node.type === 'TEXT' && (node as any).characters) {
    const textContent = safeToString((node as any).characters);
    // Convert \n characters to <br> tags for proper line breaks in HTML
    return textContent.replace(/\n/g, '<br>');
  }
  
  // For other node types, return empty content
  return '';
} 
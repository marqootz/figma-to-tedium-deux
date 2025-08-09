import { FigmaNode } from '../types';
import { safeToString } from './utils';

// Function to detect if a frame is a video frame
export function isVideoFrame(node: FigmaNode): boolean {
  return typeof node.name === 'string' && node.name.startsWith('[VIDEO]');
}

// Function to extract video filename from frame name
export function extractVideoFilename(node: FigmaNode): string | null {
  if (!isVideoFrame(node)) return null;
  
  // Extract the filename after [VIDEO] prefix
  const match = node.name.match(/^\[VIDEO\]\s*(.+)$/);
  const extracted = match && match[1] ? match[1].trim() : null;
  // Return null if the extracted string is empty
  return extracted && extracted.length > 0 ? extracted : null;
}

// Function to generate video HTML content
function generateVideoContent(node: FigmaNode): string {
  const filename = extractVideoFilename(node);
  if (!filename) return '';
  
  // Generate video element with the specified structure
  // Use relative path for video files and add CSS for scaling
  return `<video controls preload="metadata" style="width: 100%; height: 100%; object-fit: contain;">
    <source src="video/${filename}" type="video/mp4">
    Your browser does not support the video tag.
  </video>`;
}

export function generateNodeContent(node: FigmaNode): string {
  // Check if this is a video frame first
  if (isVideoFrame(node)) {
    return generateVideoContent(node);
  }
  
  // For text nodes, return the text content with line breaks converted to <br> tags
  if (node.type === 'TEXT' && (node as any).characters) {
    const textContent = safeToString((node as any).characters);
    // Convert \n characters to <br> tags for proper line breaks in HTML
    return textContent.replace(/\n/g, '<br>');
  }
  
  // For other node types, return empty content
  return '';
} 
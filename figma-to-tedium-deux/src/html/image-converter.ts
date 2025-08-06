import { FigmaNode } from '../types';
import { safeToString, escapeHtmlAttribute } from './utils';

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
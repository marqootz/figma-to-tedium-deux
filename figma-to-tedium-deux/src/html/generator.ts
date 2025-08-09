// Re-export the main function from the new modular structure
export { buildComponentSetHTMLAsync } from './html-builder';
export { convertImageToHTML } from './image-converter';
export { getTagName, generateNodeAttributes, isVideoFrame, extractVideoFilename } from './node-attributes';
export { generateNodeContent } from './node-content'; 
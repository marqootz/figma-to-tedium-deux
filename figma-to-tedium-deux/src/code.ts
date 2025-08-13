// Import modules
import { buildComponentSetHTMLAsync } from './html/generator';
import { getEmbeddedFontStyles } from './processing/fonts';
import { getAllNodeIds, exportNodeToVerboseJSON } from './processing/nodes';
import { loadFonts } from './processing/fonts';
import { generateEventHandlingJavaScript } from './html/events';

// Declare global Figma types
declare const figma: any;
declare const __html__: string;

// Main plugin code
figma.showUI(__html__, { width: 400, height: 340 });

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'export-html') {
    try {
      console.log('Received export-html message in backend');
      const selection = figma.currentPage.selection;
      if (selection.length === 0) {
        figma.notify('Please select at least one element to export as HTML');
        return;
      }
      
      console.log('Processing', selection.length, 'selected nodes');
      
      // Load fonts for all selected nodes
      for (const node of selection) {
        await loadFonts(node);
      }
      
      // Generate HTML for each selected node
      const htmlResults = await Promise.all(
        selection.map(async (node) => {
          const totalNodes = getAllNodeIds(node).length;
          console.log('Total nodes including children:', totalNodes);
          return await buildComponentSetHTMLAsync(node);
        })
      );
      
      // Combine all HTML results with global CSS and JavaScript
      const finalHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <style>
    ${getEmbeddedFontStyles()}
    html, body { box-sizing: border-box; margin: 0; padding: 0; width: 100vw; height: 100vh; overflow: hidden; }
    p { margin: 0; }
    /* Component set sizing - only apply 100% if not explicitly set to fixed dimensions */
    /* This ensures components without explicit dimensions fill their container */
    [data-figma-id]:not([style*="width:"]):not([style*="height:"]) { width: 100%; height: 100%; }
    /* Variant visibility classes */
    .variant-active {
      display: flex !important;
    }
    .variant-hidden {
      display: none !important;
    }
    /* Let JavaScript handle component visibility instead of CSS rules */
    /* This allows the variant handler to properly manage which components are visible */
    /* Components will be shown/hidden by the JavaScript variant switching logic */
    /* Dissolve transition overrides */
    .dissolve-source, .dissolve-target {
      display: block !important;
    }
    .dissolve-source {
      opacity: 1;
    }
    .dissolve-target {
      opacity: 0;
    }
    /* Smart animate transition overrides */
    .smart-animate-source, .smart-animate-target {
      display: block !important;
    }
    .smart-animate-source {
      opacity: 1;
    }
    .smart-animate-target {
      opacity: 1;
    }
    /* iOS font loading optimization */
    * {
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
  </style>
</head>
<body>
${htmlResults.join('\n')}
<!-- Reference the external refactored-system.js file -->
<script src="refactored-system.js"></script>
<script>
${generateEventHandlingJavaScript()}
</script>
</body>
</html>`;
      
      console.log('Sending HTML to UI, length:', finalHTML.length);
      figma.ui.postMessage({ type: 'export-html', html: finalHTML, nodeCount: selection.length });
      figma.notify('Export completed successfully');
    } catch (error) {
      console.error('Export error:', error);
      figma.notify(`Export failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  if (msg.type === 'export-json') {
    try {
      console.log('Received export-json message in backend');
      const selection = figma.currentPage.selection;
      if (selection.length === 0) {
        figma.notify('Please select at least one element to export as JSON');
        return;
      }
      
      // Export all selected nodes as a JSON array
      const jsonResults = await Promise.all(
        selection.map(async (node) => await exportNodeToVerboseJSON(node, node.parent ? node.parent.id : null))
      );
      
      const jsonString = JSON.stringify(jsonResults, null, 2);
      console.log('Generated JSON string:', jsonString.slice(0, 500)); // Log first 500 chars for brevity
      
      // Send the JSON string to the UI for download
      figma.ui.postMessage({ type: 'export-json', json: jsonString });
      figma.notify('JSON export completed');
    } catch (error) {
      console.error('JSON export error:', error);
      figma.notify(`JSON export failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  if (msg.type === 'get-selected-node') {
    try {
      console.log('Received get-selected-node message in backend');
      const selection = figma.currentPage.selection;
      
      if (selection.length === 0) {
        // No node selected
        figma.ui.postMessage({ type: 'selected-node-info', nodeId: null });
        return;
      }
      
      // Get the first selected node's ID
      const selectedNodeId = selection[0].id;
      console.log('Selected node ID:', selectedNodeId);
      
      // Send the node ID back to the UI
      figma.ui.postMessage({ type: 'selected-node-info', nodeId: selectedNodeId });
    } catch (error) {
      console.error('Error getting selected node:', error);
      figma.ui.postMessage({ type: 'selected-node-info', nodeId: null });
    }
  }
}; 
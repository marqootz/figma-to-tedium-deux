#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { buildComponentSetHTMLAsync } from '../src/html/generator';
import { getEmbeddedFontStyles } from '../src/processing/fonts';
import { getAllNodeIds, exportNodeToVerboseJSON } from '../src/processing/nodes';
import { generateEventHandlingJavaScript } from '../src/html/events';
import { FigmaNode } from '../src/types';

const execAsync = promisify(exec);

// Browser launching function
async function launchBrowser(filePath: string) {
  try {
    const absolutePath = path.resolve(filePath);
    const url = `file://${absolutePath}`;
    
    console.log('🌐 Launching browser with developer tools...');
    
    // Launch Chrome with developer tools
    const command = process.platform === 'darwin' 
      ? `open -a "Google Chrome" --args --new-window --auto-open-devtools-for-tabs "${url}"`
      : process.platform === 'win32'
      ? `start chrome --new-window --auto-open-devtools-for-tabs "${url}"`
      : `google-chrome --new-window --auto-open-devtools-for-tabs "${url}"`;
    
    await execAsync(command);
    console.log('✅ Browser launched successfully!');
    console.log('📝 Open browser console to see debug logs');
    
  } catch (error) {
    console.error('❌ Failed to launch browser:', error);
    console.log('💡 You can manually open the HTML file in your browser');
  }
}

// Mock Figma environment
const mockFigma = {
  currentPage: {
    selection: [] as any[]
  },
  notify: (message: string) => console.log(`[FIGMA NOTIFY] ${message}`),
  ui: {
    postMessage: (data: any) => console.log(`[FIGMA UI] ${JSON.stringify(data, null, 2)}`)
  }
};

// Mock global figma object
(global as any).figma = mockFigma;

// Sample mock node data for testing
const createMockNode = (overrides: Partial<FigmaNode> = {}): FigmaNode => ({
  id: 'mock-node-1',
  name: 'Test Component',
  type: 'FRAME',
  width: 400,
  height: 300,
  x: 0,
  y: 0,
  children: [
    {
      id: 'mock-child-1',
      name: 'Text Element',
      type: 'TEXT',
      width: 200,
      height: 50,
      x: 100,
      y: 125,
      fontSize: 16,
      fontName: { family: 'Inter', style: 'Regular' },
      characters: 'Hello World',
      textAlignHorizontal: 'CENTER'
    },
    {
      id: 'mock-child-2',
      name: 'Rectangle',
      type: 'RECTANGLE',
      width: 100,
      height: 100,
      x: 150,
      y: 100,
      fills: [{ type: 'SOLID', color: { r: 0.2, g: 0.6, b: 1 } }],
      cornerRadius: 8
    }
  ],
  ...overrides
});

// Mock component set data
const createMockComponentSet = (): FigmaNode => ({
  id: 'mock-component-set',
  name: 'Button=default',
  type: 'COMPONENT',
  width: 120,
  height: 40,
  x: 0,
  y: 0,
  fills: [{ type: 'SOLID', color: { r: 0.2, g: 0.6, b: 1 } }],
  cornerRadius: 6,
  children: [
    {
      id: 'mock-button-text',
      name: 'Button Text',
      type: 'TEXT',
      width: 80,
      height: 20,
      x: 20,
      y: 10,
      fontSize: 14,
      fontName: { family: 'Inter', style: 'Medium' },
      characters: 'Button',
      textAlignHorizontal: 'CENTER',
      fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]
    }
  ]
});

// Mock video frame data
const createMockVideoFrame = (): FigmaNode => ({
  id: 'mock-video-frame',
  name: 'Video Frame',
  type: 'FRAME',
  width: 320,
  height: 240,
  x: 0,
  y: 0,
  fills: [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }],
  children: [
    {
      id: 'mock-video-element',
      name: 'Video Element',
      type: 'RECTANGLE',
      width: 300,
      height: 200,
      x: 10,
      y: 20,
      fills: [{ type: 'SOLID', color: { r: 0.2, g: 0.2, b: 0.2 } }]
    }
  ]
});

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  console.log('🎨 Figma-to-Tedium Development CLI');
  console.log('=====================================\n');

  if (!command) {
    console.log('Available commands:');
    console.log('  test-node     - Test with a simple mock node');
    console.log('  test-component - Test with a mock component set');
    console.log('  test-video    - Test with a mock video frame');
    console.log('  test-json     - Test JSON export functionality');
    console.log('  test-file     - Test with a JSON file (provide path)');
    console.log('  help          - Show this help message');
    return;
  }

  try {
    switch (command) {
      case 'test-node':
        await testWithMockNode();
        break;
      
      case 'test-component':
        await testWithMockComponent();
        break;
      
      case 'test-video':
        await testWithMockVideo();
        break;
      
      case 'test-json':
        await testJsonExport();
        break;
      
      case 'test-file':
        const filePath = args[1];
        if (!filePath) {
          console.error('❌ Please provide a JSON file path');
          return;
        }
        await testWithJsonFile(filePath);
        break;
      
      case 'help':
        console.log('Available commands:');
        console.log('  test-node     - Test with a simple mock node');
        console.log('  test-component - Test with a mock component set');
        console.log('  test-video    - Test with a mock video frame');
        console.log('  test-json     - Test JSON export functionality');
        console.log('  test-file     - Test with a JSON file (provide path)');
        console.log('  help          - Show this help message');
        break;
      
      default:
        console.error(`❌ Unknown command: ${command}`);
        console.log('Run "npm run dev:cli help" for available commands');
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

async function testWithMockNode() {
  console.log('🧪 Testing with mock node...\n');
  
  const mockNode = createMockNode();
  mockFigma.currentPage.selection = [mockNode];
  
  console.log('📊 Node structure:');
  console.log(JSON.stringify(mockNode, null, 2));
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test HTML generation
  console.log('🔨 Generating HTML...');
  const html = await buildComponentSetHTMLAsync(mockNode);
  
  console.log('📄 Generated HTML:');
  console.log(html);
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test full export process
  console.log('🚀 Testing full export process...');
  await simulateExportProcess([mockNode]);
}

async function testWithMockComponent() {
  console.log('🧪 Testing with mock component set...\n');
  
  const mockComponent = createMockComponentSet();
  mockFigma.currentPage.selection = [mockComponent];
  
  console.log('📊 Component structure:');
  console.log(JSON.stringify(mockComponent, null, 2));
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test HTML generation
  console.log('🔨 Generating HTML...');
  const html = await buildComponentSetHTMLAsync(mockComponent);
  
  console.log('📄 Generated HTML:');
  console.log(html);
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test full export process
  console.log('🚀 Testing full export process...');
  await simulateExportProcess([mockComponent]);
}

async function testWithMockVideo() {
  console.log('🧪 Testing with mock video frame...\n');
  
  const mockVideo = createMockVideoFrame();
  mockFigma.currentPage.selection = [mockVideo];
  
  console.log('📊 Video frame structure:');
  console.log(JSON.stringify(mockVideo, null, 2));
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test HTML generation
  console.log('🔨 Generating HTML...');
  const html = await buildComponentSetHTMLAsync(mockVideo);
  
  console.log('📄 Generated HTML:');
  console.log(html);
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test full export process
  console.log('🚀 Testing full export process...');
  await simulateExportProcess([mockVideo]);
}

async function testJsonExport() {
  console.log('🧪 Testing JSON export...\n');
  
  const mockNode = createMockNode();
  mockFigma.currentPage.selection = [mockNode];
  
  console.log('📊 Exporting node to JSON...');
  const jsonResult = await exportNodeToVerboseJSON(mockNode, null);
  
  console.log('📄 Generated JSON:');
  console.log(JSON.stringify(jsonResult, null, 2));
}

async function testWithJsonFile(filePath: string) {
  console.log(`🧪 Testing with JSON file: ${filePath}\n`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return;
  }
  
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const parsedData = JSON.parse(fileContent);
    
    // Handle nested array structure: [[{nodeData}]]
    let nodeData = parsedData;
    if (Array.isArray(parsedData) && parsedData.length > 0) {
      if (Array.isArray(parsedData[0])) {
        // Handle [[{nodeData}]] structure
        nodeData = parsedData[0];
      }
      // If it's [{nodeData}], use it directly
    }
    
    console.log('📊 Loaded node data structure:');
    console.log('Original structure type:', Array.isArray(parsedData) ? `Array with ${parsedData.length} items` : typeof parsedData);
    if (Array.isArray(nodeData)) {
      console.log('Processed structure: Array with', nodeData.length, 'items');
      console.log('First item type:', typeof nodeData[0]);
      console.log('First item keys:', nodeData[0] ? Object.keys(nodeData[0]) : 'undefined');
    }
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test HTML generation
    console.log('🔨 Generating HTML...');
    const html = await buildComponentSetHTMLAsync(nodeData);
    
    console.log('📄 Generated HTML:');
    console.log(html);
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test full export process
    console.log('🚀 Testing full export process...');
    await simulateExportProcess(Array.isArray(nodeData) ? nodeData : [nodeData]);
    
  } catch (error) {
    console.error('❌ Error reading or parsing JSON file:', error);
  }
}

async function simulateExportProcess(nodes: any[]) {
  console.log('🔄 Simulating full export process...\n');
  
  try {
    console.log('📊 Processing', nodes.length, 'selected nodes');
    
    // Simulate font loading (mock)
    console.log('📚 Loading fonts...');
    for (const node of nodes) {
      console.log(`  - Loading fonts for node: ${node.name || node.id}`);
    }
    
    // Generate HTML for each selected node
    const htmlResults = await Promise.all(
      nodes.map(async (node) => {
        const totalNodes = getAllNodeIds(node).length;
        console.log(`📦 Total nodes including children for ${node.name || node.id}:`, totalNodes);
        return await buildComponentSetHTMLAsync(node);
      })
    );
    
    // Generate event handling JavaScript
    console.log('🔧 Generating event handling JavaScript...');
    const eventJavaScript = generateEventHandlingJavaScript();
    console.log('📝 Event JavaScript length:', eventJavaScript.length);
    console.log('📝 Event JavaScript preview:', eventJavaScript.substring(0, 200) + '...');
    
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
    [data-figma-id]:not([style*="width:"]):not([style*="height:"]) { width: 100%; height: 100%; }
    .variant-active { display: flex !important; }
    .variant-hidden { display: none !important; }
    .dissolve-source, .dissolve-target { display: block !important; }
    .dissolve-source { opacity: 1; }
    .dissolve-target { opacity: 0; }
    .smart-animate-source, .smart-animate-target { display: block !important; }
    .smart-animate-source { opacity: 1; }
    .smart-animate-target { opacity: 1; }
    * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
    
    /* Debug panel styles */
    .debug-panel {
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 15px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 12px;
      max-width: 300px;
      z-index: 10000;
      backdrop-filter: blur(10px);
    }
    .debug-panel h3 {
      margin: 0 0 10px 0;
      color: #4CAF50;
    }
    .debug-panel p {
      margin: 5px 0;
      line-height: 1.4;
    }
    .debug-panel .status {
      color: #FFC107;
    }
    .debug-panel .error {
      color: #F44336;
    }
    .debug-panel .success {
      color: #4CAF50;
    }
  </style>
</head>
<body>
${htmlResults.join('\n')}

<!-- Debug Panel -->
<div class="debug-panel">
  <h3>🔍 Debug Info</h3>
  <p><strong>Node Count:</strong> <span id="node-count">Loading...</span></p>
  <p><strong>Event Handlers:</strong> <span id="event-status">Loading...</span></p>
  <p><strong>Animations:</strong> <span id="animation-status">Loading...</span></p>
  <p><strong>Console:</strong> <span class="success">Open DevTools → Console</span></p>
</div>

<!-- Reference the external refactored-system.js file -->
<script src="../dist-refactored/refactored-system.js?v=${Date.now()}"></script>
<script>
${eventJavaScript}

// Debug logging and status updates
(function() {
  console.log('🔍 Debug: HTML loaded successfully');
  console.log('📊 Node data:', ${JSON.stringify(nodes, null, 2)});
  
  // Update debug panel
  function updateDebugPanel() {
    const nodeCount = document.querySelectorAll('[data-figma-id]').length;
    document.getElementById('node-count').textContent = nodeCount;
    
    // Check for event handlers - look for both global function and actual event listeners
    const hasGlobalHandler = typeof window.handleFigmaEvent === 'function';
    const hasEventElements = document.querySelectorAll('[data-has-reactions="true"], [data-variant], [data-variant-property-1]').length > 0;
    const hasEventHandlers = hasGlobalHandler && hasEventElements;
    document.getElementById('event-status').textContent = hasEventHandlers ? '✅ Loaded' : '❌ Missing';
    document.getElementById('event-status').className = hasEventHandlers ? 'success' : 'error';
    
    // Check for animation data
    const hasAnimations = document.querySelectorAll('[data-reaction-destination]').length > 0;
    document.getElementById('animation-status').textContent = hasAnimations ? '✅ Found' : '❌ None';
    document.getElementById('animation-status').className = hasAnimations ? 'success' : 'error';
    
    console.log('🔍 Debug: Found', nodeCount, 'Figma nodes');
    console.log('🔍 Debug: Event handlers', hasEventHandlers ? 'loaded' : 'missing');
    console.log('🔍 Debug: Animation data', hasAnimations ? 'found' : 'none');
    
    // Log all nodes with their properties
    document.querySelectorAll('[data-figma-id]').forEach((node, index) => {
      const figmaId = node.getAttribute('data-figma-id');
      const reactionDestination = node.getAttribute('data-reaction-destination');
      const reactionActionType = node.getAttribute('data-reaction-action-type');
      const reactionTriggerType = node.getAttribute('data-reaction-trigger-type');
      const computedStyle = window.getComputedStyle(node);
      
      console.log(\`🔍 Node \${index + 1}:\`, {
        id: figmaId,
        tagName: node.tagName,
        className: node.className,
        hasReactions: !!reactionDestination,
        reactionDestination: reactionDestination,
        reactionActionType: reactionActionType,
        reactionTriggerType: reactionTriggerType,
        computedStyle: {
          width: computedStyle.width,
          height: computedStyle.height,
          display: computedStyle.display,
          position: computedStyle.position
        }
      });
    });
  }
  
  // Run after DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateDebugPanel);
  } else {
    updateDebugPanel();
  }
  
  // Also run after a short delay to catch any dynamic content
  setTimeout(updateDebugPanel, 100);
})();
</script>
</body>
</html>`;
    
    console.log('✅ Export completed successfully!');
    console.log('📏 Final HTML length:', finalHTML.length);
    
    // Save to file for inspection
    const outputPath = path.join(__dirname, '../dev-output.html');
    fs.writeFileSync(outputPath, finalHTML);
    console.log('💾 HTML saved to:', outputPath);
    
    // Copy refactored-system.js to the same directory as the HTML file
    const outputDir = path.dirname(outputPath);
    const refactoredSystemPath = path.join(__dirname, '../dist-refactored/refactored-system.js');
    const targetRefactoredSystemPath = path.join(outputDir, 'refactored-system.js');
    
    if (fs.existsSync(refactoredSystemPath)) {
      fs.copyFileSync(refactoredSystemPath, targetRefactoredSystemPath);
      console.log(`📄 Copied refactored-system.js to: ${path.resolve(targetRefactoredSystemPath)}`);
    } else {
      console.warn('⚠️  refactored-system.js not found at:', refactoredSystemPath);
      console.warn('   Make sure to run "npm run build:refactored" first');
    }
    
    // Launch browser with developer tools
    await launchBrowser(outputPath);
    
  } catch (error) {
    console.error('❌ Export error:', error);
    throw error;
  }
}

// Run the CLI
if (require.main === module) {
  main().catch(console.error);
}

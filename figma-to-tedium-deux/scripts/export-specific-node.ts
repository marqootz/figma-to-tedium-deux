#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { buildComponentSetHTMLAsync } from '../src/html/generator';
import { getEmbeddedFontStyles } from '../src/processing/fonts';
import { getAllNodeIds } from '../src/processing/nodes';
import { generateEventHandlingJavaScript } from '../src/html/events';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Mock Figma environment for CLI
const mockFigma = {
  currentPage: {
    selection: [] as any[]
  },
  notify: (message: string) => console.log(`[FIGMA NOTIFY] ${message}`),
  ui: {
    postMessage: (data: any) => console.log(`[FIGMA UI] ${JSON.stringify(data, null, 2)}`)
  }
};

(global as any).figma = mockFigma;

interface FigmaNodeResponse {
  nodes: {
    [nodeId: string]: {
      document: any;
      components: { [key: string]: any };
      schemaVersion: number;
      styles: { [key: string]: any };
    };
  };
}

interface ParsedFigmaUrl {
  fileKey: string;
  nodeId: string;
  projectName: string;
}

function parseFigmaUrl(url: string): ParsedFigmaUrl | null {
  try {
    // Handle different Figma URL formats
    const urlObj = new URL(url);
    
    // Extract file key from path
    const pathParts = urlObj.pathname.split('/');
    const fileKeyIndex = pathParts.findIndex(part => part === 'file' || part === 'design');
    
    if (fileKeyIndex === -1 || fileKeyIndex + 1 >= pathParts.length) {
      return null;
    }
    
    const fileKey = pathParts[fileKeyIndex + 1];
    
    // Extract node ID from query parameters
    const nodeId = urlObj.searchParams.get('node-id');
    if (!nodeId) {
      return null;
    }
    
    // Extract project name (optional)
    const projectName = pathParts[fileKeyIndex + 2] || 'Unknown Project';
    
    // Convert dash to colon in node ID if needed (Figma API expects colon format)
    const normalizedNodeId = decodeURIComponent(nodeId).replace(/-/g, ':');
    
    return {
      fileKey,
      nodeId: normalizedNodeId,
      projectName
    };
  } catch (error) {
    console.error('Error parsing Figma URL:', error);
    return null;
  }
}

async function launchBrowser(filePath: string, openDevTools: boolean = true) {
  const absolutePath = path.resolve(filePath);
  const fileUrl = `file://${absolutePath}`;
  
  console.log('🌐 Launching browser...');
  console.log(`📄 File: ${absolutePath}`);
  console.log(`🔗 URL: ${fileUrl}`);
  
  try {
    const platform = process.platform;
    let command: string;
    
    if (platform === 'darwin') {
      // macOS
      if (openDevTools) {
        // Open Chrome with dev tools
        command = `open -a "Google Chrome" --args --auto-open-devtools-for-tabs "${fileUrl}"`;
      } else {
        command = `open "${fileUrl}"`;
      }
    } else if (platform === 'win32') {
      // Windows
      if (openDevTools) {
        command = `start chrome --auto-open-devtools-for-tabs "${fileUrl}"`;
      } else {
        command = `start chrome "${fileUrl}"`;
      }
    } else {
      // Linux
      if (openDevTools) {
        command = `google-chrome --auto-open-devtools-for-tabs "${fileUrl}"`;
      } else {
        command = `google-chrome "${fileUrl}"`;
      }
    }
    
    await execAsync(command);
    console.log('✅ Browser launched successfully!');
    
    if (openDevTools) {
      console.log('🔧 Developer tools should open automatically');
      console.log('📊 You can now see both export logs (above) and browser console logs');
    }
    
  } catch (error) {
    console.error('❌ Failed to launch browser:', error);
    console.log('💡 You can manually open the HTML file in your browser');
  }
}

async function exportSpecificNode(
  fileKey: string, 
  nodeId: string, 
  accessToken: string,
  outputPath?: string,
  launchBrowserFlag: boolean = true
) {
  console.log('🎨 Figma Node Exporter');
  console.log('========================\n');
  
  console.log(`📁 File Key: ${fileKey}`);
  console.log(`🎯 Node ID: ${nodeId}`);
  console.log(`🔑 Using access token: ${accessToken.substring(0, 10)}...\n`);

  try {
    // Step 1: Get node data from Figma API
    console.log('📡 Fetching node data from Figma API...');
    const response = await fetch(
      `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${nodeId}`,
      {
        headers: { 
          'X-Figma-Token': accessToken,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
    }

    const data: FigmaNodeResponse = await response.json();
    
    if (!data.nodes[nodeId]) {
      throw new Error(`Node ${nodeId} not found in file ${fileKey}`);
    }

    const nodeData = data.nodes[nodeId].document;
    console.log('✅ Node data retrieved successfully');
    console.log(`📊 Node name: ${nodeData.name}`);
    console.log(`📊 Node type: ${nodeData.type}\n`);

    // Step 2: Generate HTML using your existing logic
    console.log('🔨 Generating HTML...');
    const html = await buildComponentSetHTMLAsync(nodeData);
    
    console.log('📄 Generated HTML:');
    console.log(html);
    console.log('\n' + '='.repeat(50) + '\n');

    // Step 3: Create complete HTML document with enhanced debugging
    console.log('🚀 Creating complete HTML document...');
    const finalHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>${nodeData.name} - Figma Export</title>
  <style>
    ${getEmbeddedFontStyles()}
    html, body { 
      box-sizing: border-box; 
      margin: 0; 
      padding: 20px; 
      width: 100vw; 
      min-height: 100vh; 
      background: #f5f5f5;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid #eee;
    }
    .header h1 {
      margin: 0;
      color: #333;
      font-size: 24px;
    }
    .header p {
      margin: 5px 0 0 0;
      color: #666;
      font-size: 14px;
    }
    .debug-info {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      padding: 15px;
      margin-bottom: 20px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 12px;
    }
    .export-content {
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 10px;
      background: #fafafa;
    }
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
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${nodeData.name}</h1>
      <p>Exported from Figma • Node ID: ${nodeId} • File: ${fileKey}</p>
    </div>
    
    <div class="debug-info">
      <strong>🐛 Debug Information:</strong><br>
      • Node Type: ${nodeData.type}<br>
      • Export Time: ${new Date().toISOString()}<br>
      • File Key: ${fileKey}<br>
      • Node ID: ${nodeId}<br>
      • Check browser console for detailed logs
    </div>
    
    <div class="export-content">
      ${html}
    </div>
  </div>
  
  <script>
    // Enhanced debugging and logging
    console.log('🎨 Figma Export Debug Console');
    console.log('=============================');
    console.log('Node Name:', '${nodeData.name}');
    console.log('Node Type:', '${nodeData.type}');
    console.log('Node ID:', '${nodeId}');
    console.log('File Key:', '${fileKey}');
    console.log('Export Time:', new Date().toISOString());
    console.log('=============================\n');
    
    // Log all elements with Figma data attributes
    const figmaElements = document.querySelectorAll('[data-figma-id]');
    console.log('📊 Found', figmaElements.length, 'Figma elements:');
    figmaElements.forEach((el, index) => {
      const figmaId = el.getAttribute('data-figma-id');
      const figmaName = el.getAttribute('data-figma-name');
      const figmaType = el.getAttribute('data-figma-type');
      console.log(\`  \${index + 1}. \${figmaName} (\${figmaType}) - ID: \${figmaId}\`);
    });
    
    // Log computed styles for debugging
    console.log('\\n🎨 Computed Styles:');
    figmaElements.forEach((el, index) => {
      const figmaName = el.getAttribute('data-figma-name');
      const styles = window.getComputedStyle(el);
      console.log(\`\\n\${figmaName}:\`, {
        width: styles.width,
        height: styles.height,
        position: styles.position,
        display: styles.display,
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        fontSize: styles.fontSize,
        fontFamily: styles.fontFamily
      });
    });
    
    <!-- Reference the external refactored-system.js file -->
    <script src="refactored-system.js?v=${Date.now()}"></script>
    <script>
    // Enhanced event handling with logging
    ${generateEventHandlingJavaScript()}
    
    // Additional debugging for animations and interactions
    console.log('\\n🎬 Animation System Ready');
    console.log('🎯 Event Handlers Loaded');
    console.log('📱 Component Ready for Testing\\n');
  </script>
</body>
</html>`;

    // Step 4: Save to file
    const defaultOutputPath = `export-${nodeData.name.replace(/[^a-zA-Z0-9]/g, '-')}.html`;
    const finalOutputPath = outputPath || defaultOutputPath;
    
    fs.writeFileSync(finalOutputPath, finalHTML);
    
    // Step 4.5: Copy refactored-system.js to the same directory as the HTML file
    const outputDir = path.dirname(finalOutputPath);
    const refactoredSystemPath = path.join(__dirname, '../dist-refactored/refactored-system.js');
    const targetRefactoredSystemPath = path.join(outputDir, 'refactored-system.js');
    
    if (fs.existsSync(refactoredSystemPath)) {
      fs.copyFileSync(refactoredSystemPath, targetRefactoredSystemPath);
      console.log(`📄 Copied refactored-system.js to: ${path.resolve(targetRefactoredSystemPath)}`);
    } else {
      console.warn('⚠️  refactored-system.js not found at:', refactoredSystemPath);
      console.warn('   Make sure to run "npm run build:refactored" first');
    }
    
    console.log('✅ Export completed successfully!');
    console.log(`📏 Final HTML length: ${finalHTML.length}`);
    console.log(`💾 HTML saved to: ${path.resolve(finalOutputPath)}`);
    
    // Step 5: Save raw JSON for future use
    const jsonPath = finalOutputPath.replace('.html', '.json');
    fs.writeFileSync(jsonPath, JSON.stringify(nodeData, null, 2));
    console.log(`📄 Raw JSON saved to: ${path.resolve(jsonPath)}`);

    // Step 6: Launch browser if requested
    if (launchBrowserFlag) {
      await launchBrowser(finalOutputPath);
    }

  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('🎨 Figma Node Exporter - URL Mode');
    console.log('==================================\n');
    console.log('Usage: npm run export-node <figma-url> <access-token> [output-path] [--no-browser]');
    console.log('');
    console.log('Examples:');
    console.log('  npm run export-node "https://www.figma.com/file/abc123/Project?node-id=1:2" your-token');
    console.log('  npm run export-node "https://www.figma.com/design/abc123/Project?node-id=1:2" your-token export.html');
    console.log('  npm run export-node "https://www.figma.com/file/abc123/Project?node-id=1:2" your-token export.html --no-browser');
    console.log('');
    console.log('Legacy Usage (manual parameters):');
    console.log('  npm run export-node <file-key> <node-id> <access-token> [output-path] [--no-browser]');
    console.log('');
    console.log('To get your Figma access token:');
    console.log('  1. Go to Figma.com → Settings → Account');
    console.log('  2. Scroll down to "Personal access tokens"');
    console.log('  3. Click "Generate new token"');
    console.log('');
    console.log('Supported URL formats:');
    console.log('  • https://www.figma.com/file/FILE_KEY/Project?node-id=NODE_ID');
    console.log('  • https://www.figma.com/design/FILE_KEY/Project?node-id=NODE_ID');
    console.log('  • https://www.figma.com/proto/FILE_KEY/Project?node-id=NODE_ID');
    console.log('');
    console.log('Debugging:');
    console.log('  • Browser will open automatically with developer tools');
    console.log('  • Check both CLI output and browser console for logs');
    console.log('  • Use --no-browser flag to skip browser launch');
    return;
  }

  // Check for --no-browser flag
  const noBrowserFlag = args.includes('--no-browser');
  const filteredArgs = args.filter(arg => arg !== '--no-browser');
  const launchBrowserFlag = !noBrowserFlag;

  // Check if first argument looks like a URL
  const firstArg = filteredArgs[0];
  if (firstArg.startsWith('http') && firstArg.includes('figma.com')) {
    // URL mode
    const parsed = parseFigmaUrl(firstArg);
    if (!parsed) {
      console.error('❌ Could not parse Figma URL. Please check the format.');
      console.log('Supported formats:');
      console.log('  • https://www.figma.com/file/FILE_KEY/Project?node-id=NODE_ID');
      console.log('  • https://www.figma.com/design/FILE_KEY/Project?node-id=NODE_ID');
      return;
    }

    const accessToken = filteredArgs[1];
    const outputPath = filteredArgs[2];

    console.log('🔗 Parsed Figma URL:');
    console.log(`   📁 File Key: ${parsed.fileKey}`);
    console.log(`   🎯 Node ID: ${parsed.nodeId}`);
    console.log(`   📋 Project: ${parsed.projectName}\n`);

    await exportSpecificNode(parsed.fileKey, parsed.nodeId, accessToken, outputPath, launchBrowserFlag);
  } else {
    // Legacy mode (manual parameters)
    if (filteredArgs.length < 3) {
      console.error('❌ Legacy mode requires: <file-key> <node-id> <access-token> [output-path] [--no-browser]');
      return;
    }

    const [fileKey, nodeId, accessToken, outputPath] = filteredArgs;
    await exportSpecificNode(fileKey, nodeId, accessToken, outputPath, launchBrowserFlag);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

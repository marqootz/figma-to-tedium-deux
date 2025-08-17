#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { buildComponentSetHTMLAsync } from '../src/html/generator';
import { getEmbeddedFontStyles } from '../src/processing/fonts';
import { generateSimpleTransitionHandler } from '../src/html/events/simple-animation-system';

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

async function testSimpleAnimationExport(inputFile: string, outputFile?: string) {
  console.log('🎬 Simple Animation Export Test');
  console.log('================================\n');
  
  if (!fs.existsSync(inputFile)) {
    console.error(`❌ Input file not found: ${inputFile}`);
    process.exit(1);
  }

  try {
    // Step 1: Load the Figma node data
    console.log('📁 Loading Figma node data...');
    const rawData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
    
    // Handle nested array structure [[{...}]]
    let nodeData = rawData;
    if (Array.isArray(rawData) && rawData.length > 0) {
      if (Array.isArray(rawData[0]) && rawData[0].length > 0) {
        nodeData = rawData[0][0]; // Extract the actual node from [[{...}]]
      } else {
        nodeData = rawData[0]; // Extract from [{...}]
      }
    }
    
    console.log('✅ Node data loaded successfully');
    console.log(`📊 Node name: ${nodeData.name}`);
    console.log(`📊 Node type: ${nodeData.type}\n`);

    // Step 2: Generate HTML using the simple animation system
    console.log('🔨 Generating HTML with simple animation system...');
    const html = await buildComponentSetHTMLAsync(nodeData);
    
    // Step 3: Generate the simple transition handler
    console.log('🎭 Generating simple transition handler...');
    const simpleTransitionHandler = generateSimpleTransitionHandler();

    // Step 4: Create complete HTML document with simple animation system
    console.log('🚀 Creating complete HTML document...');
    const finalHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>Simple Animation Test - ${nodeData.name}</title>
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
    .test-controls {
      margin: 20px 0;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 5px;
      border: 1px solid #dee2e6;
    }
    .test-controls h3 {
      margin: 0 0 10px 0;
      color: #495057;
    }
    .test-button {
      background: #007bff;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      margin: 5px;
      font-size: 14px;
    }
    .test-button:hover {
      background: #0056b3;
    }
    .test-button:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }
    .debug-info {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      padding: 15px;
      margin: 20px 0;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 12px;
      white-space: pre-wrap;
      max-height: 300px;
      overflow-y: auto;
    }
    .export-content {
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 10px;
      background: #fafafa;
      margin: 20px 0;
    }
    p { margin: 0; }
    [data-figma-id]:not([style*="width:"]):not([style*="height:"]) { width: 100%; height: 100%; }
    .variant-active { display: flex !important; }
    .variant-hidden { display: none !important; }
    * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎬 Simple Animation Test</h1>
      <p>Testing simple animation system with Figma export • Node: ${nodeData.name}</p>
    </div>

    <div class="test-controls">
      <h3>🧪 Test Controls</h3>
      <p>Use these buttons to test the simple animation system:</p>
      <button class="test-button" onclick="testSimpleAnimation()">Test Simple Animation</button>
      <button class="test-button" onclick="testColorAnimation()">Test Color Animation</button>
      <button class="test-button" onclick="testShadowAnimation()">Test Shadow Animation</button>
      <button class="test-button" onclick="testSizeAnimation()">Test Size Animation</button>
      <button class="test-button" onclick="testInstantSwitch()">Test Instant Switch</button>
      <button class="test-button" onclick="resetAnimation()">Reset</button>
      <button class="test-button" onclick="clearLogs()">Clear Logs</button>
    </div>

    <div class="export-content">
      <h3>📦 Exported Content</h3>
      ${html}
    </div>

    <div class="debug-info" id="debugInfo">
      Debug information will appear here...
    </div>
  </div>

  <!-- Simple Animation System -->
  <script>
    // Simple animation system functions
    ${simpleTransitionHandler}

    // Test functions
    let debugLogs = [];
    let isAnimating = false;
    
    function log(message, type = 'info') {
      const timestamp = new Date().toLocaleTimeString();
      const logEntry = \`[\${timestamp}] \${message}\`;
      debugLogs.push(logEntry);
      
      console.log(logEntry);
      
      // Update debug display
      const debugInfo = document.getElementById('debugInfo');
      debugInfo.textContent = debugLogs.slice(-20).join('\\n'); // Show last 20 logs
    }
    
    function clearLogs() {
      debugLogs = [];
      document.getElementById('debugInfo').textContent = 'Debug information will appear here...';
    }
    
    function resetAnimation() {
      log('Resetting animation state...', 'info');
      
      // Reset all variants to initial state
      const variants = document.querySelectorAll('[data-figma-type="COMPONENT"]');
      
      if (variants.length === 0) {
        log('No components found to reset', 'info');
        return;
      }
      
      if (variants.length === 1) {
        // Single component - reset to original state
        const component = variants[0];
        component.style.transition = '';
        component.style.backgroundColor = '';
        component.style.transform = '';
        component.style.boxShadow = '';
        component.style.width = '';
        component.style.height = '';
        log('Single component reset to original state', 'success');
      } else {
        // Multiple variants - reset to first variant active
        variants.forEach((variant, index) => {
          if (index === 0) {
            variant.style.display = 'flex';
            variant.classList.add('variant-active');
            variant.classList.remove('variant-hidden');
          } else {
            variant.style.display = 'none';
            variant.classList.add('variant-hidden');
            variant.classList.remove('variant-active');
          }
        });
        log('Multiple variants reset to first variant active', 'success');
      }
      
      isAnimating = false;
      log('Animation reset complete.', 'success');
    }
    
    function testSimpleAnimation() {
      if (isAnimating) {
        log('Animation already in progress...', 'error');
        return;
      }
      
      log('Starting simple animation test...', 'info');
      isAnimating = true;
      
      // Check if we have multiple variants
      const variants = document.querySelectorAll('[data-figma-type="COMPONENT"]');
      
      if (variants.length < 2) {
        log('No multiple variants found. Creating synthetic test...', 'info');
        
        // Create a synthetic animation test by modifying the existing component
        const component = document.querySelector('[data-figma-type="COMPONENT"]');
        if (!component) {
          log('Error: Could not find any component', 'error');
          isAnimating = false;
          return;
        }
        
        // Store original styles
        const originalStyles = {
          backgroundColor: component.style.backgroundColor,
          transform: component.style.transform,
          boxShadow: component.style.boxShadow,
          width: component.style.width,
          height: component.style.height
        };
        
        // Animate to a different state
        component.style.transition = 'all 1s ease-in-out';
        component.style.backgroundColor = '#ff6b6b';
        component.style.transform = 'translate(50px, 20px)';
        component.style.boxShadow = '0 8px 16px rgba(0,0,0,0.3)';
        component.style.width = '350px';
        component.style.height = '250px';
        
        // Animate back after 2 seconds
        setTimeout(() => {
          component.style.backgroundColor = originalStyles.backgroundColor;
          component.style.transform = originalStyles.transform;
          component.style.boxShadow = originalStyles.boxShadow;
          component.style.width = originalStyles.width;
          component.style.height = originalStyles.height;
          
          setTimeout(() => {
            component.style.transition = '';
            log('Synthetic animation test completed!', 'success');
            isAnimating = false;
          }, 1000);
        }, 2000);
        
        return;
      }
      
      const sourceVariant = variants[0];
      const targetVariant = variants[1];
      
      if (!sourceVariant || !targetVariant) {
        log('Error: Could not find source or target variants', 'error');
        isAnimating = false;
        return;
      }
      
      // Create synthetic position difference for testing
      const originalTargetTransform = targetVariant.style.transform;
      const originalTargetLeft = targetVariant.style.left;
      const originalTargetTop = targetVariant.style.top;
      
      // Temporarily move target variant to create position difference
      targetVariant.style.transform = 'translate(50px, 30px)';
      
      // Force a reflow to ensure the transform is applied before measuring
      targetVariant.offsetHeight;
      
      // Use the simple animation system
      if (window.handleSimpleAnimatedVariantSwitch) {
        window.handleSimpleAnimatedVariantSwitch(
          sourceVariant,
          targetVariant,
          Array.from(variants),
          'SMART_ANIMATE',
          1.0
        ).then(() => {
          // Reset target variant position
          targetVariant.style.transform = originalTargetTransform;
          targetVariant.style.left = originalTargetLeft;
          targetVariant.style.top = originalTargetTop;
          
          log('Simple animation completed successfully!', 'success');
          isAnimating = false;
        }).catch((error) => {
          // Reset target variant position on error
          targetVariant.style.transform = originalTargetTransform;
          targetVariant.style.left = originalTargetLeft;
          targetVariant.style.top = originalTargetTop;
          
          log('Error during animation: ' + error.message, 'error');
          isAnimating = false;
        });
      } else {
        log('Error: Simple animation system not loaded', 'error');
        isAnimating = false;
      }
    }
    
    function testColorAnimation() {
      log('Testing color animation...', 'info');
      
      const component = document.querySelector('[data-figma-type="COMPONENT"]');
      if (!component) {
        log('Error: Could not find component', 'error');
        return;
      }
      
      // Store original color
      const originalColor = component.style.backgroundColor;
      
      // Animate through different colors
      component.style.transition = 'background-color 0.5s ease-in-out';
      
      const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
      let colorIndex = 0;
      
      const colorAnimation = setInterval(() => {
        component.style.backgroundColor = colors[colorIndex];
        colorIndex = (colorIndex + 1) % colors.length;
        
        if (colorIndex === 0) {
          clearInterval(colorAnimation);
          setTimeout(() => {
            component.style.backgroundColor = originalColor;
            setTimeout(() => {
              component.style.transition = '';
              log('Color animation test completed!', 'success');
            }, 500);
          }, 500);
        }
      }, 1000);
    }
    
    function testShadowAnimation() {
      log('Testing shadow animation...', 'info');
      
      const component = document.querySelector('[data-figma-type="COMPONENT"]');
      if (!component) {
        log('Error: Could not find component', 'error');
        return;
      }
      
      // Store original shadow
      const originalShadow = component.style.boxShadow;
      
      // Animate through different shadows
      component.style.transition = 'box-shadow 0.5s ease-in-out';
      
      const shadows = [
        '0 2px 4px rgba(0,0,0,0.1)',
        '0 4px 8px rgba(0,0,0,0.2)',
        '0 8px 16px rgba(0,0,0,0.3)',
        '0 16px 32px rgba(0,0,0,0.4)',
        '0 2px 4px rgba(0,0,0,0.1)'
      ];
      let shadowIndex = 0;
      
      const shadowAnimation = setInterval(() => {
        component.style.boxShadow = shadows[shadowIndex];
        shadowIndex = (shadowIndex + 1) % shadows.length;
        
        if (shadowIndex === 0) {
          clearInterval(shadowAnimation);
          setTimeout(() => {
            component.style.boxShadow = originalShadow;
            setTimeout(() => {
              component.style.transition = '';
              log('Shadow animation test completed!', 'success');
            }, 500);
          }, 500);
        }
      }, 1000);
    }
    
    function testSizeAnimation() {
      log('Testing size animation...', 'info');
      
      const component = document.querySelector('[data-figma-type="COMPONENT"]');
      if (!component) {
        log('Error: Could not find component', 'error');
        return;
      }
      
      // Store original size
      const originalWidth = component.style.width;
      const originalHeight = component.style.height;
      
      // Animate through different sizes
      component.style.transition = 'width 0.5s ease-in-out, height 0.5s ease-in-out';
      
      const sizes = [
        { width: '350px', height: '250px' },
        { width: '400px', height: '300px' },
        { width: '250px', height: '150px' },
        { width: '300px', height: '200px' }
      ];
      let sizeIndex = 0;
      
      const sizeAnimation = setInterval(() => {
        component.style.width = sizes[sizeIndex].width;
        component.style.height = sizes[sizeIndex].height;
        sizeIndex = (sizeIndex + 1) % sizes.length;
        
        if (sizeIndex === 0) {
          clearInterval(sizeAnimation);
          setTimeout(() => {
            component.style.width = originalWidth;
            component.style.height = originalHeight;
            setTimeout(() => {
              component.style.transition = '';
              log('Size animation test completed!', 'success');
            }, 500);
          }, 500);
        }
      }, 1000);
    }
    
    function testInstantSwitch() {
      log('Testing instant switch...', 'info');
      
      const variants = document.querySelectorAll('[data-figma-type="COMPONENT"]');
      
      if (variants.length < 2) {
        log('No multiple variants found. Creating synthetic instant switch...', 'info');
        
        const component = document.querySelector('[data-figma-type="COMPONENT"]');
        if (!component) {
          log('Error: Could not find component', 'error');
          return;
        }
        
        // Toggle between two states instantly
        const isAlternate = component.style.backgroundColor === 'rgb(255, 107, 107)';
        
        if (isAlternate) {
          component.style.backgroundColor = '';
          component.style.transform = '';
          component.style.boxShadow = '';
          log('Switched back to original state', 'success');
        } else {
          component.style.backgroundColor = '#ff6b6b';
          component.style.transform = 'translate(50px, 20px)';
          component.style.boxShadow = '0 8px 16px rgba(0,0,0,0.3)';
          log('Switched to alternate state', 'success');
        }
        
        return;
      }
      
      const sourceVariant = variants[0];
      const targetVariant = variants[1];
      
      if (!sourceVariant || !targetVariant) {
        log('Error: Could not find source or target variants', 'error');
        return;
      }
      
      if (window.performInstantVariantSwitch) {
        window.performInstantVariantSwitch(Array.from(variants), targetVariant);
        log('Instant switch completed!', 'success');
      } else {
        log('Error: Instant switch function not found', 'error');
      }
    }
    
    // Override console.log to capture debug output
    const originalConsoleLog = console.log;
    console.log = function(...args) {
      originalConsoleLog.apply(console, args);
      
      // Capture animation-related logs
      const message = args.join(' ');
      if (message.includes('🎬') || message.includes('📋') || message.includes('📊') || 
          message.includes('✅') || message.includes('⏰') || message.includes('🔄') ||
          message.includes('⚡') || message.includes('SIMPLE ANIMATION') ||
          message.includes('VARIANT SWITCH')) {
        
        // Add to debug logs without calling log() to avoid recursion
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = \`[\${timestamp}] \${message}\`;
        debugLogs.push(logEntry);
        
        // Update debug display
        const debugInfo = document.getElementById('debugInfo');
        debugInfo.textContent = debugLogs.slice(-20).join('\\n'); // Show last 20 logs
      }
    };
    
    // Initialize
    document.addEventListener('DOMContentLoaded', function() {
      log('Simple animation test page loaded successfully.', 'success');
      log('Simple animation system ready for testing.', 'info');
      resetAnimation();
    });
  </script>
</body>
</html>`;

    // Step 5: Save the HTML file
    const outputPath = outputFile || `simple-animation-test-${Date.now()}.html`;
    fs.writeFileSync(outputPath, finalHTML);
    
    console.log('✅ HTML file generated successfully!');
    console.log(`📁 Output file: ${outputPath}`);
    console.log(`📊 File size: ${(finalHTML.length / 1024).toFixed(2)} KB`);
    
    // Step 6: File ready for manual opening
    console.log('\n📁 File ready for manual opening:');
    console.log(`   ${outputPath}`);

  } catch (error) {
    console.error('❌ Error during export:', error);
    process.exit(1);
  }
}

// CLI interface
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: npm run test-simple-animation <input-file> [output-file]');
  console.log('');
  console.log('Examples:');
  console.log('  npm run test-simple-animation sample-figma-node.json');
  console.log('  npm run test-simple-animation sample-figma-node.json my-test.html');
  process.exit(1);
}

const inputFile = args[0];
const outputFile = args[1];

testSimpleAnimationExport(inputFile, outputFile);

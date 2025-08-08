const fs = require('fs');
const path = require('path');

// Simple CSS build script for the plugin
function buildCSS() {
  console.log('Building CSS...');
  
  // Check if shared-htmls/stylesheet.css exists
  const cssPath = path.join(__dirname, '../shared-htmls/stylesheet.css');
  const outputPath = path.join(__dirname, '../dist/font-styles.css');
  
  if (fs.existsSync(cssPath)) {
    try {
      const cssContent = fs.readFileSync(cssPath, 'utf8');
      
      // Basic CSS optimization (remove comments, minify)
      const optimizedCSS = cssContent
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
        .replace(/\s+/g, ' ') // Collapse whitespace
        .replace(/;\s*}/g, '}') // Remove trailing semicolons
        .trim();
      
      // Ensure dist directory exists
      const distDir = path.dirname(outputPath);
      if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
      }
      
      fs.writeFileSync(outputPath, optimizedCSS);
      console.log(`CSS built successfully: ${outputPath}`);
    } catch (error) {
      console.error('Error building CSS:', error);
    }
  } else {
    console.log('No CSS file found at shared-htmls/stylesheet.css');
  }
}

buildCSS();

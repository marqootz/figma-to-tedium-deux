const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building Figma to Tedium Deux Plugin...\n');

try {
  // Build main plugin
  console.log('📦 Building main plugin...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Main plugin built successfully\n');

  // Build refactored system
  console.log('🔧 Building refactored system...');
  execSync('npm run build:refactored', { stdio: 'inherit' });
  console.log('✅ Refactored system built successfully\n');

  // Build CSS
  console.log('🎨 Building CSS...');
  execSync('npm run build:css', { stdio: 'inherit' });
  console.log('✅ CSS build completed\n');

  // Verify build outputs
  console.log('🔍 Verifying build outputs...');
  
  const distFiles = [
    'dist/code.js',
    'dist-refactored/refactored-system.js'
  ];
  
  let allFilesExist = true;
  distFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const stats = fs.statSync(file);
      console.log(`✅ ${file} (${(stats.size / 1024).toFixed(1)} KB)`);
    } else {
      console.log(`❌ ${file} - MISSING`);
      allFilesExist = false;
    }
  });

  if (allFilesExist) {
    console.log('\n🎉 All builds completed successfully!');
    console.log('\n📋 Build Summary:');
    console.log('   • Main plugin: dist/code.js');
    console.log('   • Refactored system: dist-refactored/refactored-system.js');
    console.log('   • UI: ui.html');
    console.log('   • Manifest: manifest.json');
    console.log('\n🚀 Plugin is ready to use in Figma!');
  } else {
    console.log('\n❌ Some build outputs are missing. Please check the build process.');
    process.exit(1);
  }

} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
}

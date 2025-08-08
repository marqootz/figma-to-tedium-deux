const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Figma to Tedium Deux Plugin...\n');

// Check required files
const requiredFiles = [
  { path: 'manifest.json', description: 'Plugin manifest' },
  { path: 'ui.html', description: 'Plugin UI' },
  { path: 'dist/code.js', description: 'Main plugin code' },
  { path: 'dist-refactored/refactored-system.js', description: 'Refactored system' },
  { path: 'package.json', description: 'Package configuration' },
  { path: 'tsconfig.json', description: 'TypeScript configuration' }
];

let allFilesExist = true;
console.log('📁 Checking required files:');
requiredFiles.forEach(({ path: filePath, description }) => {
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✅ ${description}: ${filePath} (${(stats.size / 1024).toFixed(1)} KB)`);
  } else {
    console.log(`❌ ${description}: ${filePath} - MISSING`);
    allFilesExist = false;
  }
});

// Check manifest.json structure
console.log('\n📋 Checking manifest.json:');
try {
  const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
  const requiredManifestFields = ['name', 'id', 'api', 'main', 'ui'];
  let manifestValid = true;
  
  requiredManifestFields.forEach(field => {
    if (manifest[field]) {
      console.log(`✅ ${field}: ${manifest[field]}`);
    } else {
      console.log(`❌ ${field}: MISSING`);
      manifestValid = false;
    }
  });
  
  if (manifestValid) {
    console.log('✅ Manifest.json is properly configured');
  } else {
    console.log('❌ Manifest.json has missing required fields');
    allFilesExist = false;
  }
} catch (error) {
  console.log('❌ Error reading manifest.json:', error.message);
  allFilesExist = false;
}

// Check package.json scripts
console.log('\n📦 Checking package.json scripts:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredScripts = ['build', 'build:refactored', 'dev', 'build:all'];
  
  requiredScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      console.log(`✅ ${script}: ${packageJson.scripts[script]}`);
    } else {
      console.log(`❌ ${script}: MISSING`);
      allFilesExist = false;
    }
  });
} catch (error) {
  console.log('❌ Error reading package.json:', error.message);
  allFilesExist = false;
}

// Check TypeScript configuration
console.log('\n⚙️ Checking TypeScript configuration:');
try {
  const tsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
  if (tsConfig.compilerOptions) {
    console.log('✅ TypeScript configuration found');
    console.log(`   • Target: ${tsConfig.compilerOptions.target || 'ES5'}`);
    console.log(`   • Module: ${tsConfig.compilerOptions.module || 'CommonJS'}`);
  } else {
    console.log('❌ TypeScript configuration missing compilerOptions');
    allFilesExist = false;
  }
} catch (error) {
  console.log('❌ Error reading tsconfig.json:', error.message);
  allFilesExist = false;
}

// Final summary
console.log('\n' + '='.repeat(50));
if (allFilesExist) {
  console.log('🎉 Plugin verification completed successfully!');
  console.log('\n📋 Plugin Components:');
  console.log('   • Main plugin code: dist/code.js');
  console.log('   • Refactored system: dist-refactored/refactored-system.js');
  console.log('   • User interface: ui.html');
  console.log('   • Plugin manifest: manifest.json');
  console.log('\n🚀 The plugin is ready to be loaded in Figma!');
  console.log('\n📝 To use this plugin in Figma:');
  console.log('   1. Open Figma');
  console.log('   2. Go to Plugins > Development > Import plugin from manifest...');
  console.log('   3. Select the manifest.json file from this directory');
  console.log('   4. The plugin will be available in your development plugins');
} else {
  console.log('❌ Plugin verification failed. Please check the missing components above.');
  process.exit(1);
}

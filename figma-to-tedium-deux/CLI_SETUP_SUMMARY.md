# Development CLI Setup Summary

## ✅ What Was Created

I've successfully set up a development CLI environment that allows you to execute your Figma plugin's export logic outside of Figma. Here's what was implemented:

### 1. **CLI Script** (`scripts/dev-cli.ts`)
- Mock Figma environment with console output
- Multiple test scenarios (mock nodes, components, video frames)
- Support for testing with real JSON data
- Full export process simulation

### 2. **TypeScript Configuration** (`tsconfig.cli.json`)
- Separate TypeScript config for CLI environment
- Includes DOM types for browser APIs
- Proper module resolution

### 3. **NPM Scripts** (added to `package.json`)
- `npm run dev:cli` - Run with ts-node (development)
- `npm run dev:cli:build` - Build and run compiled version

### 4. **Sample Data** (`samples/sample-figma-node.json`)
- Realistic Figma node data for testing
- Includes components, instances, text, and reactions

### 5. **Documentation** (`docs/development/DEV_CLI.md`)
- Complete usage guide
- Troubleshooting tips
- Customization instructions

## 🚀 How to Use

### Quick Start
```bash
# Test with mock data
npm run dev:cli test-node
npm run dev:cli test-component
npm run dev:cli test-video

# Test with real Figma data
npm run dev:cli test-file samples/sample-figma-node.json

# Get help
npm run dev:cli help
```

### Development Workflow
1. **Export JSON from Figma**: Use your plugin's JSON export feature
2. **Save to file**: Save the exported data to a `.json` file
3. **Test with CLI**: Process the data and see console output
4. **Iterate**: Make changes and test again without reloading Figma

## 🎯 Benefits

### Direct Console Access
- See all `console.log` outputs directly in your terminal
- No need to open Figma's developer console
- Better formatting and readability

### Faster Development
- No need to reload the Figma plugin for every change
- Instant feedback on code modifications
- Easy to test different node structures

### Better Debugging
- Set breakpoints in your IDE
- Use debugging tools like VS Code's debugger
- Step through code execution

### Comprehensive Testing
- Test with various node types and structures
- Validate HTML output without Figma context
- Compare different export scenarios

## 📊 What You'll See

The CLI provides detailed output including:
- 📊 **Node Structure**: Complete JSON representation
- 🔨 **HTML Generation**: Step-by-step process
- 📄 **Generated HTML**: Final output
- 🚀 **Full Export Process**: Complete workflow simulation
- 💾 **File Output**: Saves to `dev-output.html` for inspection

## 🔧 Customization

### Adding New Test Cases
Edit `scripts/dev-cli.ts` and add new mock data functions:

```typescript
const createMyCustomNode = (): FigmaNode => ({
  // Your custom node structure
});

// Add to the main() function switch statement
case 'test-custom':
  await testWithCustomNode();
  break;
```

### Modifying Output
The CLI saves generated HTML to `dev-output.html`. You can modify the output path or add additional formats in the `simulateExportProcess` function.

## 🎉 Ready to Use!

Your development environment is now set up and ready for rapid iteration. You can:

1. **Test your export logic** with various node types
2. **Debug issues** with direct console access
3. **Validate HTML output** without Figma context
4. **Iterate quickly** on your plugin's functionality

This setup will significantly speed up your plugin development by providing immediate feedback and easier debugging capabilities.

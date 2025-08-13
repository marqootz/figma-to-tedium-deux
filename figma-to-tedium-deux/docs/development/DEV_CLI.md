# Development CLI

The Development CLI allows you to execute your Figma plugin's export logic outside of Figma, providing direct console output and making it easier to debug and observe the export process.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install ts-node for CLI execution:
```bash
npm install --save-dev ts-node
```

## Usage

### Quick Start

Run the CLI with ts-node (recommended for development):
```bash
npm run dev:cli
```

Or build and run the compiled version:
```bash
npm run dev:cli:build
```

### Available Commands

#### Test with Mock Data

```bash
# Test with a simple mock node
npm run dev:cli test-node

# Test with a mock component set
npm run dev:cli test-component

# Test with a mock video frame
npm run dev:cli test-video

# Test JSON export functionality
npm run dev:cli test-json
```

#### Test with Real Figma Data

```bash
# Test with a JSON file containing Figma node data
npm run dev:cli test-file samples/sample-figma-node.json
```

#### Get Help

```bash
npm run dev:cli help
```

## What You'll See

The CLI provides detailed console output showing:

- 📊 **Node Structure**: Complete JSON representation of the node being processed
- 🔨 **HTML Generation**: Step-by-step HTML generation process
- 📄 **Generated HTML**: The final HTML output
- 🚀 **Full Export Process**: Complete simulation of the plugin's export workflow
- 💾 **File Output**: Saves the generated HTML to `dev-output.html` for inspection

## Mock Data Types

### Simple Node
A basic frame with text and rectangle elements for testing fundamental functionality.

### Component Set
A button component with variant properties and component instances for testing component logic.

### Video Frame
A frame with video-specific elements for testing video export functionality.

## Using Real Figma Data

1. **Export from Figma Plugin**: Use your plugin's JSON export feature to save node data
2. **Save as JSON**: Save the exported data to a `.json` file
3. **Test with CLI**: Use the `test-file` command to process the real data

Example workflow:
```bash
# 1. Export JSON from Figma plugin
# 2. Save to samples/my-figma-data.json
# 3. Test with CLI
npm run dev:cli test-file samples/my-figma-data.json
```

## Benefits

### Direct Console Access
- See all console.log outputs directly in your terminal
- No need to open Figma's developer console
- Better formatting and readability

### Faster Iteration
- No need to reload the Figma plugin for every change
- Instant feedback on code modifications
- Easy to test different node structures

### Debugging
- Set breakpoints in your IDE
- Use debugging tools like VS Code's debugger
- Step through code execution

### Testing
- Test with various node types and structures
- Validate HTML output without Figma context
- Compare different export scenarios

## File Structure

```
figma-to-tedium-deux/
├── scripts/
│   └── dev-cli.ts          # Main CLI script
├── samples/
│   └── sample-figma-node.json  # Sample data for testing
├── tsconfig.cli.json       # TypeScript config for CLI
└── dev-output.html         # Generated HTML output (created after running)
```

## Customization

### Adding New Mock Data

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

The CLI saves generated HTML to `dev-output.html`. You can modify the output path or add additional output formats in the `simulateExportProcess` function.

## Troubleshooting

### TypeScript Errors
If you encounter TypeScript errors, ensure you're using the correct tsconfig:
```bash
npm run dev:cli:build
```

### Module Resolution
If modules can't be found, check that all imports are correct and the TypeScript configuration includes the right paths.

### Mock Figma Environment
The CLI mocks the Figma environment. If you need additional Figma APIs, add them to the `mockFigma` object in `dev-cli.ts`.

## Integration with Development Workflow

1. **Development**: Use CLI for rapid iteration and testing
2. **Validation**: Test with real Figma data exported from your plugin
3. **Debugging**: Use IDE debugging tools with the CLI
4. **Documentation**: Generate examples and test cases

This development process significantly speeds up your plugin development by providing immediate feedback and easier debugging capabilities.

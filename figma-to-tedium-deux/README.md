# Figma to Tedium (Refactored)

A Figma plugin that converts Figma designs to HTML with modular architecture for better maintainability.

## Project Structure

### Core Modules

#### HTML Generation (`src/html/`)
- **`generator.ts`** - Main entry point, re-exports from modular structure
- **`html-builder.ts`** - Main HTML building orchestration
- **`image-converter.ts`** - Image conversion and base64 encoding
- **`node-attributes.ts`** - HTML attribute generation
- **`node-content.ts`** - Node content generation
- **`utils.ts`** - Common utility functions

#### Style System (`src/html/`)
- **`styles.ts`** - Main entry point for styles, re-exports from modular structure
- **`style-computer.ts`** - Main style computation orchestrator
- **`gradient-converter.ts`** - Gradient to CSS conversion
- **`layout-styles.ts`** - Flexbox and layout styles
- **`sizing-styles.ts`** - Width, height, positioning styles
- **`border-styles.ts`** - Border and stroke styles
- **`text-styles.ts`** - Text-specific styles
- **`fill-styles.ts`** - Background and fill styles

#### Processing (`src/processing/`)
- **`nodes.ts`** - Node processing and overrides
- **`svg.ts`** - SVG conversion utilities
- **`fonts.ts`** - Font loading and embedding

#### Events (`src/html/`)
- **`events.ts`** - Event handling and variant management

### Key Benefits of Modular Structure

1. **Single Responsibility**: Each module has a clear, focused purpose
2. **Maintainability**: Smaller files are easier to understand and modify
3. **Testability**: Individual modules can be tested in isolation
4. **Reusability**: Modules can be imported and used independently
5. **Scalability**: New features can be added as separate modules

### Module Dependencies

```
generator.ts (entry point)
├── html-builder.ts
│   ├── image-converter.ts
│   ├── node-attributes.ts
│   ├── node-content.ts
│   └── style-computer.ts
│       ├── fill-styles.ts
│       ├── layout-styles.ts
│       ├── sizing-styles.ts
│       ├── border-styles.ts
│       ├── text-styles.ts
│       └── gradient-converter.ts
└── utils.ts
```

## Development

### Build Commands
```bash
npm run build          # Production build
npm run build:refactored  # Build refactored system
npm run build:all      # Build all components
npm run dev           # Development build with watch
npm run dev:refactored # Development build for refactored system
npm run build:css     # Build CSS assets
npm run verify        # Verify plugin components
```

### Adding New Features

1. **New Style Type**: Create a new module in `src/html/` (e.g., `animation-styles.ts`)
2. **New Node Type**: Add to `node-attributes.ts` and `html-builder.ts`
3. **New Converter**: Create a new converter module and import in `html-builder.ts`

## Architecture Principles

- **Separation of Concerns**: Each module handles one specific aspect
- **Composition over Inheritance**: Modules are composed together rather than inherited
- **Dependency Injection**: Dependencies are explicitly imported
- **Interface Segregation**: Modules expose only what's needed
- **Open/Closed Principle**: Easy to extend without modifying existing code

## Layout Features Support

### **HUG Sizing**
- **Horizontal HUG**: `layoutSizingHorizontal === 'HUG'` → `width: fit-content`
- **Vertical HUG**: `layoutSizingVertical === 'HUG'` → `height: fit-content`
- **Both HUG**: Both dimensions set to `fit-content`

### **FILL Sizing**
- **Horizontal FILL**: `layoutSizingHorizontal === 'FILL'` → `width: 100%`
- **Vertical FILL**: `layoutSizingVertical === 'FILL'` → `height: 100%`

### **Ignore Layout**
- **Absolute Positioning**: `layoutPositioning === 'ABSOLUTE'` → `position: absolute`
- **Coordinate Positioning**: Uses `x` and `y` coordinates for precise placement
- **Parent Relative**: Positioned absolutely with respect to parent container

## Plugin Installation

The plugin is now built and ready to use in Figma!

### Quick Start
1. **Open Figma**
2. **Go to Plugins > Development > Import plugin from manifest...**
3. **Select the `manifest.json` file from this directory**
4. **The plugin will be available in your development plugins**

### Plugin Features
- **Export HTML**: Convert Figma designs to HTML with embedded styles
- **Export JSON**: Export design data as JSON for further processing
- **Refactored System**: Advanced export system with modular architecture
- **Font Embedding**: Automatic font loading and embedding
- **Event Handling**: Support for Figma interactions and animations
- **Responsive Design**: Maintains layout and styling across devices

## Gradient Border Support

The plugin now supports gradient borders using the multiple background layers technique:

```css
.gradient-border-box {
  border: double 4px transparent;
  border-radius: 15px;
  background-image: linear-gradient(white, white), 
                    linear-gradient(to right, red, blue, green);
  background-origin: border-box;
  background-clip: padding-box, border-box;
}
```

This technique uses multiple background layers:
- **Inner layer**: Matches the element's background color
- **Outer layer**: The gradient border
- **background-origin**: border-box starts from the border edge
- **background-clip**: padding-box clips inner background, border-box clips gradient

This ensures proper gradient border rendering across all browsers and maintains the border radius correctly.

## File Size Improvements

### Before Refactoring
- `generator.ts`: 371 lines (14KB)
- `styles.ts`: 345 lines (14KB)

### After Refactoring
- Largest file: `text-styles.ts`: 91 lines (3.8KB)
- Average file size: ~2KB
- Better code organization and maintainability 
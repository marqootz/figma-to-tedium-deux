import { FigmaNode } from '../types';

// Declare global Figma types
declare const figma: any;

// Font loading functions
export async function loadFonts(node: FigmaNode): Promise<void> {
  if (node.type === 'TEXT' && (node as any).fontName) {
    try {
      await figma.loadFontAsync((node as any).fontName);
    } catch (error) {
      console.warn(`Failed to load font for node ${node.name}:`, error);
    }
  }
  
  if (node.children) {
    for (const child of node.children) {
      await loadFonts(child);
    }
  }
}

// Font CSS generation
export function getEmbeddedFontStyles(): string {
  return `
    /* iOS-compatible font declarations - using consistent font-family names */
    
    /* TrueType fonts - "CircularXX TT" family with font-weight and font-style variations */
    @font-face {
      font-family: "CircularXX TT";
      src: url("fonts/CircularXXTT-Thin.ttf") format("truetype");
      font-weight: 100;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: "CircularXX TT";
      src: url("fonts/CircularXXTT-ThinItalic.ttf") format("truetype");
      font-weight: 100;
      font-style: italic;
      font-display: swap;
    }
    @font-face {
      font-family: "CircularXX TT";
      src: url("fonts/CircularXXTT-Light.ttf") format("truetype");
      font-weight: 300;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: "CircularXX TT";
      src: url("fonts/CircularXXTT-LightItalic.ttf") format("truetype");
      font-weight: 300;
      font-style: italic;
      font-display: swap;
    }
    @font-face {
      font-family: "CircularXX TT";
      src: url("fonts/CircularXXTT-Regular.ttf") format("truetype");
      font-weight: 400;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: "CircularXX TT";
      src: url("fonts/CircularXXTT-Italic.ttf") format("truetype");
      font-weight: 400;
      font-style: italic;
      font-display: swap;
    }
    @font-face {
      font-family: "CircularXX TT";
      src: url("fonts/CircularXXTT-Book.ttf") format("truetype");
      font-weight: 450;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: "CircularXX TT";
      src: url("fonts/CircularXXTT-BookItalic.ttf") format("truetype");
      font-weight: 450;
      font-style: italic;
      font-display: swap;
    }
    @font-face {
      font-family: "CircularXX TT";
      src: url("fonts/CircularXXTT-Medium.ttf") format("truetype");
      font-weight: 500;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: "CircularXX TT";
      src: url("fonts/CircularXXTT-MediumItalic.ttf") format("truetype");
      font-weight: 500;
      font-style: italic;
      font-display: swap;
    }
    @font-face {
      font-family: "CircularXX TT";
      src: url("fonts/CircularXXTT-Bold.ttf") format("truetype");
      font-weight: 700;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: "CircularXX TT";
      src: url("fonts/CircularXXTT-BoldItalic.ttf") format("truetype");
      font-weight: 700;
      font-style: italic;
      font-display: swap;
    }
    @font-face {
      font-family: "CircularXX TT";
      src: url("fonts/CircularXXTT-Black.ttf") format("truetype");
      font-weight: 900;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: "CircularXX TT";
      src: url("fonts/CircularXXTT-BlackItalic.ttf") format("truetype");
      font-weight: 900;
      font-style: italic;
      font-display: swap;
    }
    @font-face {
      font-family: "CircularXX TT";
      src: url("fonts/CircularXXTT-ExtraBlack.ttf") format("truetype");
      font-weight: 950;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: "CircularXX TT";
      src: url("fonts/CircularXXTT-ExtraBlackItalic.ttf") format("truetype");
      font-weight: 950;
      font-style: italic;
      font-display: swap;
    }
  `;
} 
// Figma node types and interfaces
export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  opacity?: number;
  cornerRadius?: number;
  layoutMode?: string;
  primaryAxisAlignItems?: string;
  counterAxisAlignItems?: string;
  itemSpacing?: number;
  layoutSizingHorizontal?: string;
  layoutSizingVertical?: string;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  fontSize?: number;
  fontWeight?: number;
  textAlignHorizontal?: string;
  letterSpacing?: number | { value: number; unit: string };
  lineHeight?: number | { value: number; unit: string } | string;
  fills?: Fill[];
  strokes?: Stroke[];
  strokeWeight?: number;
  effects?: any[];
  vectorPaths?: any[];
  // Image-specific properties
  imageHash?: string;
  imageTransform?: number[][];
  // Clipping properties
  clipsContent?: boolean;
  // Layout properties
  layoutPositioning?: string;
  [key: string]: any;
}

export interface FontName {
  family: string;
  style: string;
}

export interface Color {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export interface Fill {
  type: string;
  color?: Color;
  opacity?: number;
  gradientStops?: GradientStop[];
  gradientTransform?: number[][];
  gradientHandlePositions?: Vector[];
}

export interface Vector {
  x: number;
  y: number;
}

export interface GradientStop {
  position: number;
  color: Color;
  opacity?: number;
}

export interface Stroke {
  type: string;
  color?: Color;
  weight?: number;
  gradientStops?: GradientStop[];
  gradientTransform?: number[][];
  gradientHandlePositions?: Vector[];
}

export interface Reaction {
  trigger: {
    type: string;
    timeout?: number;
  };
  action?: {
    type: string;
    destinationId?: string;
    transition?: {
      type: string;
      duration?: number;
      easing?: {
        type: string;
      };
    };
  };
  actions?: Array<{
    type: string;
    destinationId?: string;
    transition?: {
      type: string;
      duration?: number;
      easing?: {
        type: string;
      };
    };
  }>;
  transition?: {
    type: string;
    duration?: number;
  };
}

export interface VariantProperties {
  [key: string]: string | number | boolean;
}

// Utility types
export type OverrideData = Record<string, any>;
export type ComputedStyles = Record<string, string>; 
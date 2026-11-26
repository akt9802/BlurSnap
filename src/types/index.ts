// Geometry Types
export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Tool Types
export type ToolType =
  | 'select'
  | 'blur'
  | 'pixelate'
  | 'solid-cover'
  | 'highlighter'
  | 'pen'
  | 'arrow'
  | 'line'
  | 'rectangle'
  | 'circle'
  | 'text';

export type RedactionStyle = 'solid' | 'pixelate' | 'blur';

// Layer and Transform
export interface Transform {
  rotation: number; // degrees
  scale: number;
  flipX: boolean;
  flipY: boolean;
}

export interface LayerInfo {
  zIndex: number;
  visible: boolean;
  locked: boolean;
}

// Redaction
export interface Redaction {
  id: string;
  bounds: Rect | Point[];
  style: RedactionStyle;
  color?: string;
  intensity?: number;
  enabled: boolean;
  transform?: Transform;
  layer: LayerInfo;
}

// Annotation Types
export type Annotation =
  | ArrowAnnotation
  | LineAnnotation
  | RectangleAnnotation
  | CircleAnnotation
  | FreehandAnnotation
  | TextAnnotation;

export interface ArrowAnnotation {
  id: string;
  type: 'arrow';
  start: Point;
  end: Point;
  color: string;
  strokeWidth: number;
  arrowHeadStyle: 'single' | 'double' | 'none';
  layer: LayerInfo;
}

export interface LineAnnotation {
  id: string;
  type: 'line';
  start: Point;
  end: Point;
  color: string;
  strokeWidth: number;
  style: 'solid' | 'dashed' | 'dotted';
  layer: LayerInfo;
}

export interface RectangleAnnotation {
  id: string;
  type: 'rectangle';
  bounds: Rect;
  color: string;
  strokeWidth: number;
  filled: boolean;
  opacity: number;
  layer: LayerInfo;
}

export interface CircleAnnotation {
  id: string;
  type: 'circle';
  center: Point;
  radius: number;
  color: string;
  strokeWidth: number;
  filled: boolean;
  opacity: number;
  layer: LayerInfo;
}

export interface FreehandAnnotation {
  id: string;
  type: 'freehand';
  points: Point[];
  color: string;
  strokeWidth: number;
  smoothing: number;
  layer: LayerInfo;
}

export interface TextAnnotation {
  id: string;
  type: 'text';
  position: Point;
  text: string;
  color: string;
  fontSize: number;
  fontFamily: string;
  bold: boolean;
  italic: boolean;
  backgroundColor?: string;
  layer: LayerInfo;
}

// Highlight
export interface Highlight {
  id: string;
  bounds: Rect | Point[];
  color: string;
  opacity: number;
  layer: LayerInfo;
}

// Tool Settings
export interface ToolSettings {
  activeTool: ToolType;
  color: string;
  strokeWidth: number;
  opacity: number;
  fontSize?: number;
  fontFamily?: string;
  blurIntensity?: number;
  pixelSize?: number;
  filled: boolean;
}

// Selection State
export interface SelectionState {
  selectedIds: string[];
  selectionBounds?: Rect;
}

// Editor Document
export interface EditorDocument {
  id: string;
  fileName: string;
  mimeType: string;
  width: number;
  height: number;
  redactions: Redaction[];
  annotations: Annotation[];
  highlights: Highlight[];
  viewport: {
    zoom: number;
    panX: number;
    panY: number;
  };
}

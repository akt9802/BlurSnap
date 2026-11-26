import { create } from 'zustand';
import type {
  ToolType,
  ToolSettings,
  Redaction,
  Annotation,
  Highlight,
  SelectionState,
} from '../types';

interface EditorState {
  // Tool state
  toolSettings: ToolSettings;
  setActiveTool: (tool: ToolType) => void;
  setToolColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  setOpacity: (opacity: number) => void;
  
  // Document elements
  redactions: Redaction[];
  annotations: Annotation[];
  highlights: Highlight[];
  
  addRedaction: (redaction: Redaction) => void;
  addAnnotation: (annotation: Annotation) => void;
  addHighlight: (highlight: Highlight) => void;
  
  removeElement: (id: string) => void;
  
  // Selection
  selection: SelectionState;
  setSelection: (selectedIds: string[]) => void;
  clearSelection: () => void;
  
  // History
  history: {
    past: any[];
    future: any[];
  };
  undo: () => void;
  redo: () => void;
  
  // Zoom
  zoom: number;
  setZoom: (zoom: number) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  // Initial tool settings
  toolSettings: {
    activeTool: 'select',
    color: '#3B82F6',
    strokeWidth: 3,
    opacity: 1,
    fontSize: 16,
    fontFamily: 'Inter',
    blurIntensity: 10,
    pixelSize: 10,
    filled: false,
  },

  setActiveTool: (tool) =>
    set((state) => ({
      toolSettings: { ...state.toolSettings, activeTool: tool },
    })),

  setToolColor: (color) =>
    set((state) => ({
      toolSettings: { ...state.toolSettings, color },
    })),

  setStrokeWidth: (strokeWidth) =>
    set((state) => ({
      toolSettings: { ...state.toolSettings, strokeWidth },
    })),

  setOpacity: (opacity) =>
    set((state) => ({
      toolSettings: { ...state.toolSettings, opacity },
    })),

  // Document elements
  redactions: [],
  annotations: [],
  highlights: [],

  addRedaction: (redaction) =>
    set((state) => ({
      redactions: [...state.redactions, redaction],
    })),

  addAnnotation: (annotation) =>
    set((state) => ({
      annotations: [...state.annotations, annotation],
    })),

  addHighlight: (highlight) =>
    set((state) => ({
      highlights: [...state.highlights, highlight],
    })),

  removeElement: (id) =>
    set((state) => ({
      redactions: state.redactions.filter((r) => r.id !== id),
      annotations: state.annotations.filter((a) => a.id !== id),
      highlights: state.highlights.filter((h) => h.id !== id),
    })),

  // Selection
  selection: {
    selectedIds: [],
  },

  setSelection: (selectedIds) =>
    set({ selection: { selectedIds } }),

  clearSelection: () =>
    set({ selection: { selectedIds: [] } }),

  // History
  history: {
    past: [],
    future: [],
  },

  undo: () => {
    // TODO: Implement undo logic
    console.log('Undo');
  },

  redo: () => {
    // TODO: Implement redo logic
    console.log('Redo');
  },

  // Zoom
  zoom: 1,
  setZoom: (zoom) => set({ zoom }),
}));

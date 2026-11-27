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
  isEditingText: boolean;
  setIsEditingText: (isEditing: boolean) => void;
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
  
  updateAnnotation: (id: string, updates: Partial<Annotation>) => void;
  updateRedaction: (id: string, updates: Partial<Redaction>) => void;
  updateHighlight: (id: string, updates: Partial<Highlight>) => void;
  
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
  
  // Reset
  resetEditor: () => void;
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

  isEditingText: false,
  setIsEditingText: (isEditing) => set({ isEditingText: isEditing }),

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
    set((state) => {
      const newState = {
        redactions: [...state.redactions, redaction],
        history: {
          past: [...state.history.past, {
            redactions: state.redactions,
            annotations: state.annotations,
            highlights: state.highlights,
          }],
          future: [], // Clear future when new action is added
        },
      };
      return newState;
    }),

  addAnnotation: (annotation) =>
    set((state) => {
      const newState = {
        annotations: [...state.annotations, annotation],
        history: {
          past: [...state.history.past, {
            redactions: state.redactions,
            annotations: state.annotations,
            highlights: state.highlights,
          }],
          future: [],
        },
      };
      return newState;
    }),

  addHighlight: (highlight) =>
    set((state) => {
      const newState = {
        highlights: [...state.highlights, highlight],
        history: {
          past: [...state.history.past, {
            redactions: state.redactions,
            annotations: state.annotations,
            highlights: state.highlights,
          }],
          future: [],
        },
      };
      return newState;
    }),

  removeElement: (id) =>
    set((state) => {
      const newState = {
        redactions: state.redactions.filter((r) => r.id !== id),
        annotations: state.annotations.filter((a) => a.id !== id),
        highlights: state.highlights.filter((h) => h.id !== id),
        history: {
          past: [...state.history.past, {
            redactions: state.redactions,
            annotations: state.annotations,
            highlights: state.highlights,
          }],
          future: [],
        },
      };
      return newState;
    }),

  // Update elements (for moving, resizing, etc.)
  updateAnnotation: (id: string, updates: Partial<Annotation>) =>
    set((state) => ({
      annotations: state.annotations.map(a => a.id === id ? { ...a, ...updates } as Annotation : a),
    })),

  updateRedaction: (id: string, updates: Partial<Redaction>) =>
    set((state) => ({
      redactions: state.redactions.map(r => r.id === id ? { ...r, ...updates } : r),
    })),

  updateHighlight: (id: string, updates: Partial<Highlight>) =>
    set((state) => ({
      highlights: state.highlights.map(h => h.id === id ? { ...h, ...updates } : h),
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
    set((state) => {
      if (state.history.past.length === 0) return state;

      const previous = state.history.past[state.history.past.length - 1];
      const newPast = state.history.past.slice(0, -1);

      return {
        redactions: previous.redactions,
        annotations: previous.annotations,
        highlights: previous.highlights,
        history: {
          past: newPast,
          future: [
            {
              redactions: state.redactions,
              annotations: state.annotations,
              highlights: state.highlights,
            },
            ...state.history.future,
          ],
        },
      };
    });
  },

  redo: () => {
    set((state) => {
      if (state.history.future.length === 0) return state;

      const next = state.history.future[0];
      const newFuture = state.history.future.slice(1);

      return {
        redactions: next.redactions,
        annotations: next.annotations,
        highlights: next.highlights,
        history: {
          past: [
            ...state.history.past,
            {
              redactions: state.redactions,
              annotations: state.annotations,
              highlights: state.highlights,
            },
          ],
          future: newFuture,
        },
      };
    });
  },

  // Zoom
  zoom: 1,
  setZoom: (zoom) => set({ zoom }),
  
  // Reset everything
  resetEditor: () => set({
    redactions: [],
    annotations: [],
    highlights: [],
    selection: { selectedIds: [] },
    history: { past: [], future: [] },
  }),
}));

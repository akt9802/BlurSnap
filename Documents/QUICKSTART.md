# BlurSnap - Quick Start Guide

## 🚀 Getting Started

### 1. Installation
```bash
cd /Users/amankumar/Personal-Work/Coding/BlurSnap
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

The app will be available at **http://localhost:5173** (or 5174 if 5173 is in use)

### 3. Project Structure
```
BlurSnap/
├── src/
│   ├── components/
│   │   ├── upload/
│   │   │   └── UploadScreen.tsx      # Drag-and-drop upload UI
│   │   ├── editor/
│   │   │   ├── Editor.tsx             # Main editor layout
│   │   │   ├── EditorCanvas.tsx       # Canvas rendering
│   │   │   └── PropertiesPanel.tsx    # Tool properties sidebar
│   │   └── toolbar/
│   │       └── Toolbar.tsx            # Tool palette
│   ├── store/
│   │   └── editorStore.ts             # Zustand state management
│   ├── types/
│   │   └── index.ts                   # TypeScript definitions
│   ├── App.tsx                        # Main app component
│   └── main.tsx                       # Entry point
├── Documents/
│   ├── mainDoc.md                     # Complete specification
│   ├── STATUS.md                      # Development status
│   └── QUICKSTART.md                  # This file
└── package.json
```

## 🎯 Current Features

### ✅ Working Now
- Upload screen with drag-and-drop
- File validation (PNG, JPEG, WebP, max 20MB)
- Editor layout with toolbar and properties panel
- Tool selection (11 tools)
- Zoom controls
- State management setup

### 🚧 Coming Next
- Drawing tools implementation
- Blur/pixelate/solid cover effects
- Highlighter
- Annotations (arrows, shapes, text)
- Export functionality

## 🛠️ Development Workflow

### Making Changes

1. **Edit a component:**
   ```bash
   # Component files are in src/components/
   # Vite will hot-reload automatically
   ```

2. **Add new state:**
   ```typescript
   // Edit src/store/editorStore.ts
   // Add new state properties and actions
   ```

3. **Add new types:**
   ```typescript
   // Edit src/types/index.ts
   // Define new interfaces
   ```

### Testing Your Changes

1. Upload a test image (any PNG/JPEG)
2. Try switching between tools
3. Check properties panel updates
4. Test zoom controls

## 📖 Key Files to Know

### `src/App.tsx`
Main app component that switches between upload and editor views.

### `src/components/upload/UploadScreen.tsx`
Handles image upload, drag-and-drop, and file validation.

### `src/components/editor/Editor.tsx`
Main editor layout with toolbar, canvas, and properties panel.

### `src/components/editor/EditorCanvas.tsx`
Canvas rendering logic (base + overlay canvas system).

### `src/components/toolbar/Toolbar.tsx`
Tool palette with 11 tools and undo/redo.

### `src/components/editor/PropertiesPanel.tsx`
Tool settings (color, stroke width, opacity, etc.).

### `src/store/editorStore.ts`
Zustand store for managing editor state.

### `src/types/index.ts`
TypeScript type definitions for all data models.

## 🎨 Design System

### Colors
- **Primary:** Blue (#3B82F6) to Purple (#8B5CF6)
- **Background:** Gray-50 (#F9FAFB)
- **Text:** Gray-900 (dark), Gray-600 (medium)
- **Borders:** Gray-200

### Components
- **Buttons:** Rounded-lg (8px), hover states, transitions
- **Panels:** White background, border-gray-200
- **Spacing:** 4px increments (p-2, p-4, p-6, etc.)

## 🔧 Common Tasks

### Add a New Tool

1. Add tool type to `src/types/index.ts`:
   ```typescript
   export type ToolType = 'select' | 'your-new-tool' | ...;
   ```

2. Add tool to toolbar in `src/components/toolbar/Toolbar.tsx`:
   ```typescript
   const tools: Tool[] = [
     // ...existing tools
     { id: 'your-new-tool', name: 'Your Tool', icon: <Icon />, shortcut: 'Y' },
   ];
   ```

3. Add tool settings in `src/components/editor/PropertiesPanel.tsx`

4. Implement tool logic (coming next milestone)

### Update Styling

All styles use Tailwind CSS classes:
```tsx
<div className="bg-white border border-gray-200 rounded-lg p-4">
  {/* Your content */}
</div>
```

### Add State

Edit `src/store/editorStore.ts`:
```typescript
interface EditorState {
  yourNewState: string;
  setYourNewState: (value: string) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  yourNewState: 'default',
  setYourNewState: (value) => set({ yourNewState: value }),
}));
```

## 🐛 Troubleshooting

### Port Already in Use
Vite will automatically try another port (5174, 5175, etc.)

### TypeScript Errors
```bash
# Check for type errors
npm run build
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### Tailwind Not Working
Check that:
1. `tailwind.config.js` exists
2. `postcss.config.js` exists
3. `src/index.css` has `@tailwind` directives

## 📚 Resources

- **Main Documentation:** `Documents/mainDoc.md`
- **Development Status:** `Documents/STATUS.md`
- **React Docs:** https://react.dev
- **Tailwind CSS:** https://tailwindcss.com
- **Zustand:** https://github.com/pmndrs/zustand
- **Vite:** https://vitejs.dev

## 🎯 Next Steps

1. **Implement Rectangle Tool** (Priority 1)
   - Add mouse event handlers
   - Convert coordinates
   - Draw preview
   - Store in state

2. **Implement Blur Effect** (Priority 1)
   - Canvas filter API
   - Apply to regions
   - Export with blur

3. **Implement Export** (Priority 1)
   - Offscreen canvas
   - Render all layers
   - Download PNG

---

**Happy Coding! 🚀**

For questions, check `mainDoc.md` or the code comments.

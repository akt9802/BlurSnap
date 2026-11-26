# BlurSnap

**A lightweight, privacy-first screenshot editor for manual image editing and privacy protection.**

BlurSnap lets users import an image, manually blur or redact any region they choose, add highlights and annotations, and export a flattened image. Users have complete control over what to hide or emphasize in their screenshots.

The application runs entirely in the browser. No account, database, custom backend, or cloud image upload is required.

## 1. Product Overview

Screenshots are frequently shared in bug reports, support tickets, documentation, chat applications, tutorials, and social media.

Before sharing, people often need to hide:
- Email addresses
- Phone numbers
- Names and personal details
- Account IDs and tokens
- Private messages and notifications
- Any manually selected area

BlurSnap simplifies this process:

1. Import a screenshot.
2. Manually select and blur/redact any regions.
3. Highlight important areas.
4. Add arrows, shapes, text annotations, and drawings.
5. Apply visual effects and styling.
6. Export the final image.

**Core principle:** Complete user control, privacy first.

Users have full authority to decide what to hide, blur, or highlight. No automatic detection means no false sense of security - you control every edit explicitly.

## 2. Goals and Non-Goals

### Goals for v1

- Run entirely in the browser.
- Support PNG, JPEG, and WebP.
- Support manual rectangular selection and redaction.
- Offer solid cover, pixelation, and blur effects.
- Provide highlighter tool for emphasizing content.
- Add arrows, rectangle outlines, circles, and text labels.
- Support freehand drawing and pen tool.
- Add color picker for all tools.
- Support undo and redo.
- Export a flattened PNG.
- Work without authentication or cloud storage.
- Give users complete control over all edits.

### Non-Goals for v1

- User accounts or collaboration.
- Cloud image storage.
- Custom backend or database.
- Automatic detection of sensitive information.
- OCR or AI-powered features.
- Advanced photo editing (filters, adjustments, layers).
- Generative image editing.
- Native desktop or mobile applications.

## 3. Target Users

### Developers
- Hide API keys, emails, and customer information before sharing screenshots.
- Redact information before opening public GitHub issues.
- Annotate UI bugs with arrows and labels.

### Customer Support Teams
- Hide customer contact details.
- Prepare screenshots for documentation.

### Content Creators
- Hide private notifications.
- Highlight UI elements in tutorials.

### Everyday Users
- Hide private information before posting screenshots online.
- Annotate screenshots without installing a large editor.

## 4. Core Features

### 4.1 Image Import

Supported formats:
- PNG
- JPEG / JPG
- WebP

Requirements:
- Drag-and-drop upload.
- File picker.
- File type and size validation.
- Display image dimensions.
- Replace and clear image.
- Handle invalid or corrupted images.
- No server uploads.

Suggested initial file size limit: 20 MB.

### 4.2 Manual Editing Tools

BlurSnap provides a comprehensive set of tools for users to manually edit their images. Users have complete control and authority over every edit.

**Selection and Redaction Tools:**
- **Rectangle Select** - Draw rectangular regions to blur/redact
- **Freeform Select** - Draw custom shapes for precise selection
- **Quick Select** - Click and drag for instant selection

**Privacy Tools:**
- **Blur Tool** - Apply blur effect to selected regions
- **Pixelate Tool** - Pixelate selected areas
- **Solid Cover** - Completely hide regions with solid color
- Adjustable intensity for all effects

**Highlight and Emphasis Tools:**
- **Highlighter** - Transparent color overlay (like a marker)
  - Multiple colors (yellow, green, pink, blue, orange)
  - Adjustable opacity and thickness
  - Rectangle and freeform shapes
- **Spotlight** - Dim everything except highlighted region
- **Border/Frame** - Add colored borders to emphasize areas

**Drawing and Annotation Tools:**
- **Pen Tool** - Freehand drawing
- **Arrow Tool** - Point to specific areas
- **Line Tool** - Draw straight lines
- **Shape Tools** - Rectangles, circles, polygons
- **Text Tool** - Add text labels and callouts
- **Emoji/Sticker** - Add visual markers

**Styling Options:**
- Color picker for all tools
- Stroke width adjustment
- Fill/outline options
- Opacity control
- Font selection for text

Tool interaction:
- Select and modify any element after creation
- Move, resize, rotate elements
- Layer order control (bring forward, send back)
- Group/ungroup elements
- Delete individual or multiple elements

### 4.3 Manual Redaction

Users should be able to:
- Draw rectangular regions.
- Move and resize regions.
- Delete regions.
- Add multiple redactions.
- Choose redaction styles.

Redaction styles:

**Solid Cover**
- Completely covers selected pixels.
- Safest option.
- Recommended default.

**Pixelate**
- Replaces details with larger pixel blocks.

**Blur**
- Applies a blur effect to selected pixels.

Important: A light blur may leave text recognizable. Solid opaque covers should be recommended for sensitive information.

### 4.4 Annotations and Visual Elements

Support a rich set of annotation tools:

**Basic Annotations:**
- Arrows (single and double-headed)
- Lines (straight and curved)
- Rectangles (filled and outline)
- Circles and ellipses
- Polygons and custom shapes
- Text labels with customizable fonts
- Text boxes with backgrounds
- Callouts and speech bubbles

**Highlight Elements:**
- Highlighter marks (semi-transparent overlays)
- Underlines and brackets
- Emphasis borders
- Spotlight effects

**Drawing Elements:**
- Freehand pen strokes
- Smooth curves
- Dotted and dashed lines
- Custom brush sizes

Allow users to:
- Select and edit any annotation
- Move, resize, and rotate elements
- Change colors, opacity, and stroke width
- Adjust layer order (z-index)
- Group and ungroup elements
- Duplicate elements
- Delete single or multiple elements
- Apply consistent styling across elements

### 4.5 Undo and Redo

Support undo and redo for:
- Adding redactions.
- Moving and resizing redactions.
- Deleting redactions.
- Changing redaction styles.
- Adding and deleting annotations.
- Editing annotation text.

Use immutable state history or a command-based approach. Avoid storing full-resolution image copies for every action.

### 4.6 Export

Support:
- PNG export by default.
- JPEG export as a future enhancement.

Export requirements:
- Render the original image into a new offscreen canvas.
- Apply all enabled redactions.
- Render annotations.
- Export a flattened image.
- Preserve source dimensions.
- Handle large images and errors gracefully.

**Critical requirement:** The exported image must not contain the unredacted source as a hidden or removable layer. Solid redactions must replace the underlying pixels.

Example filename:

`blursnap-redacted-2026-11-27.png`

## 5. Recommended Technology Stack

| Area | Technology | Purpose |
|---|---|---|
| Language | TypeScript | Type safety |
| UI | React | Component-based UI |
| Build tool | Vite | Fast development and static build |
| Styling | Tailwind CSS | Styling |
| Canvas | HTML Canvas 2D API | Image rendering and editing |
| State management | Zustand | Editor state |
| Validation | Zod | Validate structured data |
| Icons | Lucide React | Icons |
| Color Picker | react-colorful | Color selection |
| Gestures | @use-gesture/react | Drawing and touch support |
| Unit testing | Vitest | Logic testing |
| Component testing | Testing Library | UI testing |
| E2E testing | Playwright | Browser testing |
| Hosting | Vercel / Cloudflare Pages | Static hosting |
| CI | GitHub Actions | Automated testing |

### Why Vite instead of Next.js?

BlurSnap is a browser-based image editor. It does not need:
- Server-side rendering.
- Server actions.
- API routes.
- A database.

Vite + React + TypeScript provides a simpler architecture and generates a static application.

### Initial Setup

```bash
npm create vite@latest blursnap -- --template react-ts

cd blursnap

npm install

npm install zustand zod lucide-react react-colorful @use-gesture/react

npm install -D tailwindcss @tailwindcss/vite

npm install -D vitest @testing-library/react @testing-library/user-event

npm install -D @playwright/test
```

Follow the current installation instructions for each dependency when setting up the project.

Start with the Canvas 2D API rather than adding a large canvas library immediately. Consider Konva or Fabric.js later if object selection and transformations become difficult to maintain.

## 6. Architecture

```text
                  Browser
                     |
          +----------+----------+
          |                     |
        React               Editor Store
          |                     |
          |                Document Model
          |                     |
          +----------+----------+
                     |
                 Editor Engine
                     |
          +----------+----------+
          |          |          |
        Canvas      Tool       Export
       Renderer    Manager    Renderer
          |          |          |
          +----------+----------+
                     |
               Local Browser
                Memory Only
```

There is no application server in this architecture.

### Module Responsibilities

**UI Layer**
- Upload screen.
- Editor layout.
- Toolbar with tool palette.
- Inspector and properties panel.
- Color picker.
- Layer panel.
- Export dialog.

**Editor State**
- Image metadata.
- Redaction regions.
- Annotations and drawings.
- Highlight overlays.
- Selected elements.
- Active tool and settings.
- Zoom and pan.
- Undo and redo history.
- Layer order and visibility.

**Editor Engine**
- Coordinate conversion.
- Pointer and touch handling.
- Selection and multi-select.
- Moving, resizing, and rotating.
- Hit testing.
- Rendering pipeline.
- Layer management.

**Tool Manager**
- Tool lifecycle and state.
- Brush and pen rendering.
- Shape drawing.
- Text editing.
- Transform handles.
- Snapping and guides.

**Export Service**
- Offscreen rendering.
- Redaction application.
- Effect rendering (blur, pixelate).
- Annotation rendering.
- Highlight compositing.
- Image encoding.
- Download handling.

## 7. Coordinate System and Canvas Design

This is one of the most important implementation decisions.

Suppose the original screenshot is 2400 × 1600 pixels but is displayed at 900 × 600 CSS pixels.

Never store redaction positions in screen coordinates.

Always store them relative to the original image.

```ts
type Point = {
  x: number;
  y: number;
};

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};
```

For example:

```ts
const redaction = {
  x: 500,
  y: 300,
  width: 250,
  height: 80,
};
```

This region always refers to the original image, regardless of zoom or viewport size.

### Rendering Process

1. Calculate the displayed image scale and offset.
2. Convert source coordinates to display coordinates.
3. Draw the image.
4. Draw redaction and annotation overlays.
5. Convert pointer coordinates back to source coordinates during editing.
6. Clamp regions to image boundaries.

### Canvas Layers

Use two stacked canvases:

**Base Canvas**
- Displays the original screenshot.

**Overlay Canvas**
- Displays redaction previews.
- Selection borders.
- Resize handles.
- Annotations.

For export, create a separate offscreen canvas at the original image dimensions. Draw the source image, redactions, and annotations into it.

## 8. Data Models

These are in-memory TypeScript models, not database schemas.

### Editor Document

```ts
type EditorDocument = {
  id: string;
  fileName: string;
  mimeType: string;
  width: number;
  height: number;
  redactions: Redaction[];
  annotations: Annotation[];
  highlights: Highlight[];
  drawings: Drawing[];
  currentTool: ToolType;
  toolSettings: ToolSettings;
  selection: SelectionState;
  viewport: {
    zoom: number;
    panX: number;
    panY: number;
  };
  history: HistoryEntry[];
  historyIndex: number;
};

type Highlight = {
  id: string;
  bounds: Rect | Point[];
  color: string;
  opacity: number;
  layer: LayerInfo;
};

type Drawing = {
  id: string;
  points: Point[];
  color: string;
  strokeWidth: number;
  smoothing: number;
  layer: LayerInfo;
};
```

### Redaction

```ts
type RedactionStyle = "solid" | "pixelate" | "blur";

type Redaction = {
  id: string;
  bounds: Rect | Point[]; // Rect for rectangular, Point[] for freeform
  style: RedactionStyle;
  color?: string; // For solid covers
  intensity?: number; // Blur/pixelate strength (1-100)
  enabled: boolean;
  transform?: Transform;
  layer: LayerInfo;
};
```

### Annotation

```ts
type Annotation =
  | {
      id: string;
      type: "arrow";
      start: Point;
      end: Point;
      color: string;
      strokeWidth: number;
      arrowHeadStyle: "single" | "double" | "none";
    }
  | {
      id: string;
      type: "rectangle";
      bounds: Rect;
      color: string;
      strokeWidth: number;
      filled: boolean;
      opacity: number;
    }
  | {
      id: string;
      type: "circle";
      center: Point;
      radius: number;
      color: string;
      strokeWidth: number;
      filled: boolean;
      opacity: number;
    }
  | {
      id: string;
      type: "line";
      start: Point;
      end: Point;
      color: string;
      strokeWidth: number;
      style: "solid" | "dashed" | "dotted";
    }
  | {
      id: string;
      type: "freehand";
      points: Point[];
      color: string;
      strokeWidth: number;
      smoothing: number;
    }
  | {
      id: string;
      type: "highlighter";
      bounds: Rect | Point[];
      color: string;
      opacity: number;
    }
  | {
      id: string;
      type: "text";
      position: Point;
      text: string;
      color: string;
      fontSize: number;
      fontFamily: string;
      bold: boolean;
      italic: boolean;
      backgroundColor?: string;
    };

type Transform = {
  rotation: number; // degrees
  scale: number;
  flipX: boolean;
  flipY: boolean;
};

type LayerInfo = {
  zIndex: number;
  visible: boolean;
  locked: boolean;
};
```

### Tool State

```ts
type ToolType =
  | "select"
  | "blur"
  | "pixelate"
  | "solid-cover"
  | "highlighter"
  | "pen"
  | "arrow"
  | "line"
  | "rectangle"
  | "circle"
  | "text"
  | "eraser";

type ToolSettings = {
  activeTool: ToolType;
  color: string;
  strokeWidth: number;
  opacity: number;
  fontSize?: number;
  fontFamily?: string;
  blurIntensity?: number;
  pixelSize?: number;
  filled: boolean;
};

type SelectionState = {
  selectedIds: string[];
  selectionBounds?: Rect;
  transformHandles: TransformHandle[];
};
```

Never log image content or user data to the console.

## 9. Manual Tool Implementation

### Tool System Architecture

Each tool follows a consistent lifecycle:

```ts
interface Tool {
  onStart(point: Point, state: EditorState): void;
  onMove(point: Point, state: EditorState): void;
  onEnd(point: Point, state: EditorState): void;
  onCancel(state: EditorState): void;
  render(ctx: CanvasRenderingContext2D, state: EditorState): void;
}
```

### Drawing Tools

**Freehand/Pen Tool:**
- Capture pointer events and store points.
- Apply smoothing using Catmull-Rom or Bezier curves.
- Optimize point array (remove redundant points).
- Support pressure sensitivity (if available).
- Render with anti-aliasing.

**Shape Tools (Rectangle, Circle, Line):**
- Capture start and end points.
- Show live preview during drawing.
- Support constraint keys (Shift for perfect shapes).
- Handle all drag directions correctly.
- Support filled and outline modes.

**Highlighter Tool:**
- Similar to freehand but with transparency.
- Use multiply or overlay blend mode.
- Support both free-form and rectangular highlights.
- Pre-defined color palette (yellow, green, pink, blue, orange).
- Adjustable opacity (default 30-50%).

### Blur and Redaction Tools

**Blur Implementation:**
```ts
function applyBlur(
  ctx: CanvasRenderingContext2D,
  bounds: Rect,
  intensity: number
): void {
  // Extract region to temporary canvas
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d')!;
  
  // Apply blur using CSS filter or custom algorithm
  tempCtx.filter = `blur(${intensity}px)`;
  tempCtx.drawImage(sourceCanvas, ...);
  
  // Draw back to main canvas
  ctx.drawImage(tempCanvas, bounds.x, bounds.y);
}
```

**Pixelate Implementation:**
- Divide region into blocks.
- Sample average color for each block.
- Fill each block with solid color.
- Adjustable block size.

**Solid Cover:**
- Simple filled rectangle or path.
- Use selected color.
- Ensure 100% opacity for export.

### Text Tool

- Click to place text cursor.
- Render input overlay at clicked position.
- Support common text formatting (font, size, color, bold, italic).
- Optional background box.
- Convert to image on commit.

### Selection and Transform

- Hit testing for all element types.
- Multi-select with Shift or marquee.
- Display transform handles (corners, edges, rotation).
- Support move, resize, and rotate.
- Maintain aspect ratio with Shift.
- Snap to other elements (optional).

### Color and Styling System

**Color Picker:**
- Hex input field.
- RGB/HSL sliders.
- Opacity/alpha control.
- Recent colors palette.
- Pre-defined color swatches.
- Eyedropper tool to sample colors from image.

**Highlighter Colors:**
Pre-defined semi-transparent colors optimized for visibility:
- Yellow (#FFFF00, 40% opacity)
- Green (#00FF00, 40% opacity)
- Pink (#FF00FF, 40% opacity)
- Blue (#00BFFF, 40% opacity)
- Orange (#FFA500, 40% opacity)

**Redaction Colors:**
Solid opaque colors for privacy:
- Black (#000000)
- White (#FFFFFF)
- Gray (#808080)
- Custom color picker for brand matching

**Annotation Colors:**
Full palette available for arrows, shapes, text, and pen:
- Primary colors
- Secondary colors
- Custom colors
- Saved favorites

**Style Persistence:**
- Remember last used color per tool.
- Save tool presets (color + stroke + opacity).
- Quick access to recently used styles.

## 10. User Experience and Workflow

### Typical User Journey

1. **Import** - Drag and drop or select a screenshot
2. **Hide Sensitive Info** - Use blur, pixelate, or solid cover tools to redact private information
3. **Emphasize Important Areas** - Use highlighter to draw attention to key parts
4. **Annotate** - Add arrows, shapes, and text to explain or point out details
5. **Draw** - Use pen tool for freehand annotations or diagrams
6. **Review** - Check entire image to ensure nothing sensitive is visible
7. **Export** - Download flattened PNG with all edits permanently applied

### Tool Organization in UI

**Primary Toolbar (Left side):**
- Select/Move tool (V)
- Blur tool (B)
- Pixelate tool
- Solid cover tool
- Highlighter (H)
- Pen/Draw tool (P)
- Arrow tool (A)
- Line tool (L)
- Rectangle tool (R)
- Circle tool
- Text tool (T)

**Properties Panel (Right side):**
- Color picker
- Stroke width slider
- Opacity slider
- Fill/outline toggle
- Intensity controls (blur, pixelate)
- Font settings (for text)
- Layer order buttons

**Bottom Bar:**
- Zoom controls
- Undo/Redo
- Export button

### Interaction Patterns

**Creating elements:**
1. Select tool from toolbar
2. Adjust settings in properties panel
3. Click and drag on canvas to create
4. Release to commit

**Editing elements:**
1. Use Select tool (V) or click element directly
2. Transform handles appear
3. Drag to move, drag handles to resize
4. Hold Shift for constrained proportions
5. Modify properties in properties panel

**Multiple selection:**
1. Hold Shift and click elements, or
2. Drag marquee selection box
3. Transform all selected elements together

## 11. Privacy and Security

Privacy is the most important part of BlurSnap.

### Local Processing

- Do not upload screenshots.
- All editing happens client-side in the browser.
- Do not collect screenshots in analytics.
- Avoid logging filenames or image data.
- Keep images in memory in v1.
- Do not persist screenshots in localStorage or IndexedDB without explicit user consent.
- Clearly communicate local processing to users.
- No external API calls for image processing.

### Export Safety

- Export flattened raster images.
- Paint solid redactions with full opacity.
- Do not rely on CSS overlays for final redaction.
- Do not include the original image as a hidden layer.
- Test the actual exported pixels.
- Preserve original dimensions unless the user chooses otherwise.

### Important Warning

BlurSnap gives you complete control over your edits - this means you are responsible for identifying and hiding sensitive information.

No automatic detection is performed. Users must carefully review the entire screenshot and manually redact all sensitive information before sharing. For highly sensitive information, use solid opaque covers rather than blur or pixelation.

## 11. Project Folder Structure

```text
blursnap/
├── public/
│   └── icons/
├── src/
│   ├── app/
│   │   └── App.tsx
│   ├── components/
│   │   ├── upload/
│   │   ├── editor/
│   │   │   ├── Canvas.tsx
│   │   │   ├── OverlayCanvas.tsx
│   │   │   └── TransformHandles.tsx
│   │   ├── toolbar/
│   │   │   ├── ToolPalette.tsx
│   │   │   ├── ColorPicker.tsx
│   │   │   └── ToolSettings.tsx
│   │   ├── inspector/
│   │   │   ├── PropertiesPanel.tsx
│   │   │   └── LayersPanel.tsx
│   │   └── common/
│   ├── features/
│   │   ├── image-import/
│   │   ├── redaction/
│   │   │   ├── BlurTool.ts
│   │   │   ├── PixelateTool.ts
│   │   │   └── SolidCoverTool.ts
│   │   ├── annotations/
│   │   │   ├── ArrowTool.ts
│   │   │   ├── ShapeTool.ts
│   │   │   ├── TextTool.ts
│   │   │   └── HighlighterTool.ts
│   │   ├── drawing/
│   │   │   ├── PenTool.ts
│   │   │   ├── LineTool.ts
│   │   │   └── smoothing.ts
│   │   ├── selection/
│   │   │   ├── SelectTool.ts
│   │   │   ├── transform.ts
│   │   │   └── multi-select.ts
│   │   └── export/
│   ├── canvas/
│   │   ├── renderer.ts
│   │   ├── coordinates.ts
│   │   ├── hit-testing.ts
│   │   ├── effects.ts
│   │   └── layers.ts
│   ├── tools/
│   │   ├── Tool.interface.ts
│   │   ├── ToolManager.ts
│   │   └── tool-registry.ts
│   ├── services/
│   │   ├── image-loader.ts
│   │   ├── export-service.ts
│   │   └── history-service.ts
│   ├── store/
│   │   ├── editor-store.ts
│   │   └── tool-store.ts
│   ├── models/
│   │   ├── editor.ts
│   │   ├── geometry.ts
│   │   ├── annotation.ts
│   │   └── redaction.ts
│   ├── utils/
│   │   ├── smoothing.ts
│   │   └── color.ts
│   └── main.tsx
├── tests/
│   ├── unit/
│   └── e2e/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── README.md
├── LICENSE
└── .github/
    └── workflows/
        └── ci.yml
```

Do not create every file on day one. Add modules as implementation requires them.

## 12. Implementation Roadmap

### Milestone 1 — Upload and Display

- Scaffold Vite + React + TypeScript.
- Build the upload screen.
- Support drag-and-drop and file picker.
- Validate image type and size.
- Decode and display the image.
- Show image dimensions.
- Add replace and clear actions.
- Implement zoom and pan controls.

**Completion criteria:** Users can open a screenshot and view it correctly at different viewport sizes and zoom levels.

### Milestone 2 — Basic Tool System

- Implement Tool interface and lifecycle.
- Create ToolManager for tool switching.
- Add tool palette UI.
- Implement rectangular selection tool.
- Store geometry in original image coordinates.
- Display selection with transform handles.

**Completion criteria:** Users can select a tool and draw basic rectangles that remain correctly positioned at all zoom levels.

### Milestone 3 — Redaction Tools

- Implement solid cover tool (opaque rectangles).
- Add blur effect tool with intensity control.
- Add pixelate tool with adjustable pixel size.
- Support tool settings panel (color, intensity).
- Allow moving and resizing redactions.
- Add delete functionality.

**Completion criteria:** Users can create, modify, and delete blur/redaction regions with different styles.

### Milestone 4 — Safe Export

- Create offscreen canvas at original dimensions.
- Render source image.
- Apply all redactions (blur, pixelate, solid cover).
- Render all annotations.
- Export flattened PNG.
- Test exported pixels for security.
- Add download and error handling.

**Completion criteria:** Exported image is completely flattened with no way to recover hidden content.

### Milestone 5 — Annotation Tools

- Implement arrow tool (single and double-headed).
- Add line tool (solid, dashed, dotted).
- Add shape tools (rectangle, circle).
- Implement text tool with font picker.
- Add color picker for all tools.
- Support stroke width adjustment.

**Completion criteria:** Users can add various annotations with custom colors and styles.

### Milestone 6 — Highlighter and Drawing

- Implement highlighter tool with transparency.
- Add pre-defined highlighter colors.
- Support both rectangular and freeform highlights.
- Implement pen/freehand drawing tool.
- Add stroke smoothing algorithm.
- Support different brush sizes.

**Completion criteria:** Users can highlight regions and draw freeform annotations naturally.

### Milestone 7 — Transform and Layers

- Implement selection tool (click and marquee).
- Add multi-select support (Shift-click).
- Display transform handles (move, resize, rotate).
- Add layer panel showing all elements.
- Support layer reordering (z-index).
- Add show/hide and lock/unlock per layer.

**Completion criteria:** Users can select, transform, and manage multiple elements across layers.

### Milestone 8 — History and Shortcuts

- Implement command pattern for undo/redo.
- Support undo/redo for all operations.
- Add keyboard shortcuts (Ctrl+Z, Delete, Esc, etc.).
- Add keyboard navigation for tools.
- Display current tool and shortcuts in UI.

**Completion criteria:** All editing actions can be undone and redone reliably.

### Milestone 9 — Polish and UX

- Responsive editor layout for different screen sizes.
- Mobile touch support.
- Loading states and progress indicators.
- Error handling and user feedback.
- Tooltips and help text.
- Keyboard accessibility (tab navigation, focus states).
- Dark mode support.

**Completion criteria:** App is polished, accessible, and works well on various devices.

### Milestone 10 — Testing and Publish

- Write unit tests for coordinate conversion, hit testing, tools.
- Write E2E tests for complete workflows.
- Add privacy regression test (verify redacted content is gone).
- Create privacy statement and documentation.
- Add screenshots and video demo.
- Deploy to static hosting.
- Create public GitHub repository with README.

## 13. Testing Strategy

Privacy-sensitive software requires tests for the exported result, not just the editor preview.

### Unit Tests

Test:
- Coordinate conversion at different zoom levels.
- Rectangle and shape normalization for all drag directions.
- Clamping to image boundaries.
- Hit testing for all element types.
- Transform calculations (move, resize, rotate).
- Layer ordering and visibility.
- Stroke smoothing algorithms.
- Color conversion and manipulation.
- Undo/redo state transitions.
- Export dimensions and MIME type.
- Blur and pixelate algorithms.

### End-to-End Tests

Use Playwright to test:

1. Upload a valid image.
2. Reject an unsupported image.
3. Select blur tool and draw a redaction.
4. Switch to highlighter and highlight a region.
5. Add an arrow annotation.
6. Add text with custom color.
7. Select and move an element.
8. Use undo and redo.
9. Change layer order.
10. Export the image.
11. Reopen the exported image.
12. Verify redacted pixels are properly blurred/covered.
13. Verify no network requests contain screenshot data.
14. Test keyboard shortcuts work correctly.
15. Test touch interactions on mobile viewport.

### Privacy Regression Test

Create a test image containing a known secret string. Redact the region with a solid cover, export it, decode the result, and verify that pixels inside the redacted region contain the cover color rather than the original pixels.

## 14. Performance Considerations

- Start with a reasonable file-size limit (20MB recommended).
- Use a separate overlay canvas for UI elements.
- Avoid redrawing the original image on every pointer event.
- Implement dirty-region tracking for canvas redraws.
- Throttle pointer events during drawing (use requestAnimationFrame).
- Optimize freehand paths (reduce point count without losing quality).
- Cache rendered elements when possible.
- Use offscreen canvas for complex effects.
- Implement smart undo history (avoid storing full image copies).
- Lazy-load tools and features.
- Test large screenshots (4K+ resolution) on lower-powered devices.
- Profile canvas rendering performance regularly.
- Clean up object URLs and canvas references to prevent memory leaks.

## 15. Accessibility

- Give toolbar actions accessible labels and tooltips.
- Support keyboard navigation.
- Provide visible focus states.
- Do not communicate state through color alone.
- Make dialogs keyboard and screen-reader friendly.
- Maintain readable contrast.

Suggested shortcuts:

| Shortcut | Action |
|---|---|
| V | Select tool |
| B | Blur tool |
| P | Pen/drawing tool |
| H | Highlighter |
| T | Text tool |
| A | Arrow tool |
| R | Rectangle tool |
| L | Line tool |
| Ctrl/Cmd + Z | Undo |
| Ctrl/Cmd + Shift + Z | Redo |
| Ctrl/Cmd + D | Duplicate selected |
| Delete / Backspace | Delete selected |
| Esc | Cancel/deselect |
| Ctrl/Cmd + A | Select all |
| Ctrl/Cmd + S | Open export dialog |
| Space (hold) | Pan mode |
| Ctrl/Cmd + + | Zoom in |
| Ctrl/Cmd + - | Zoom out |
| Ctrl/Cmd + 0 | Reset zoom |
| [ / ] | Adjust brush size |
| Shift (hold) | Constrain proportions/angles |

Avoid overriding browser shortcuts unexpectedly. Make all shortcuts configurable if possible.

## 16. Deployment and Publishing

Possible static hosting:
- GitHub Pages.
- Cloudflare Pages.
- Vercel.

The core application should work over HTTPS and require no server secrets or environment variables.

Before publishing:
- Verify screenshots are never sent over the network.
- Verify all processing happens client-side only.
- Verify no backend or database is required.
- Publish an accurate privacy statement.
- Add a license.
- Add screenshots and a short demo video.
- Document browser support and limitations.
- Test the production deployment on various browsers.
- Test with different image sizes and formats.

## 17. MVP Acceptance Criteria

The first public version is ready when users can:

- Open BlurSnap in a browser.
- Import PNG, JPEG, or WebP images.
- Manually blur regions with adjustable intensity.
- Apply pixelation and solid cover redactions.
- Highlight regions with the highlighter tool.
- Draw freehand with the pen tool.
- Add arrows, lines, shapes (rectangle, circle).
- Add text annotations with color customization.
- Select, move, resize, and delete elements.
- Reorder layers (bring forward, send back).
- Undo and redo all actions.
- Use keyboard shortcuts for common tools.
- Zoom and pan the canvas.
- Export a flattened PNG with all edits applied.
- Use the app without an account.
- Complete the workflow without uploading the screenshot to a server.

Advanced features like custom brushes, filters, batch processing, and JPEG export can follow once the core workflow is reliable and user-tested.

## 18. Future Improvements

Only consider these after the MVP has real users:

**Advanced Editing:**
- More shape tools (polygon, star, speech bubble).
- Gradient fills.
- Custom brush creation.
- Eraser tool.
- Magic wand/lasso selection tools.
- Crop and resize image.
- Image filters and adjustments.
- Drop shadow and effects.

**Workflow Enhancements:**
- Browser extension for screenshot capture.
- Desktop application.
- Templates and presets (save common tool settings).
- Batch processing multiple images.
- Copy final image to clipboard.
- Save/load projects with editable layers.
- Animation export (GIF with annotations).

**Collaboration (with privacy consideration):**
- Share view-only links with time expiration.
- Export with watermark/attribution.
- Optional local project history with explicit consent.

**Accessibility:**
- Screen reader improvements.
- Voice commands for tools.
- High contrast mode.
- Keyboard-only editing mode.

Do not add cloud sync, automatic uploads, or AI features without a clear user need and strict privacy model.

## 19. Product Success Metrics

Measure usefulness rather than vanity metrics:

- Successful exports.
- Percentage of users completing upload-to-export.
- Common workflow failure points.
- User feedback and repeat usage.

If analytics are added, collect only privacy-safe aggregate events with clear disclosure and consent. Never collect screenshots, recognized text, or redacted content.

## 20. Development Principles

1. **Local-first:** screenshots stay in the browser, no server uploads.
2. **User control:** users have complete authority over every edit, no automatic detection.
3. **Manual workflow:** explicit, intentional editing rather than AI suggestions.
4. **Solid redaction first:** make opaque redaction reliable before decorative effects.
5. **Original coordinates:** geometry is stored relative to the source image, not display.
6. **Flattened export:** the final image must not reveal hidden content by removing layers.
7. **Privacy by default:** no analytics on image content, no logging of user data.
8. **Progressive enhancement:** start with core tools, add advanced features later.
9. **Small scope:** ship the focused workflow before expanding it.
10. **Honest documentation:** explain capabilities and limitations clearly.
11. **Accessibility matters:** keyboard navigation and screen reader support from day one.

## 21. First Development Task

Start with only:

1. Scaffold Vite + React + TypeScript.
2. Install dependencies: Zustand, Tailwind, Lucide icons.
3. Create the upload screen with drag-and-drop support.
4. Load a local image using an object URL.
5. Display it in a responsive editor area with proper scaling.
6. Implement basic tool system (Tool interface + ToolManager).
7. Add a simple toolbar with tool selection.
8. Implement rectangle tool that draws on overlay canvas.
9. Store rectangles in original image coordinates.
10. Export a new PNG with the rectangles rendered as solid covers.
11. Test that exported image is flattened and coordinates are preserved.

Focus on getting the core coordinate system, tool lifecycle, and export pipeline working correctly before adding more tools. Do not add blur, highlighter, or other advanced features until the basic rectangle redaction and export work reliably.

---

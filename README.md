# BlurSnap

**A lightweight, privacy-first screenshot editor for manual image editing and privacy protection.**

BlurSnap lets you import an image, manually blur or redact any region you choose, add highlights and annotations, and export a flattened image. You have complete control over what to hide or emphasize in your screenshots.

## 🌟 Features

- **🔒 Privacy First** - All editing happens in your browser. No uploads, no tracking, no cloud storage.
- **✨ Complete Control** - You decide what to blur, highlight, or annotate. No AI guessing.
- **🚀 Fast & Simple** - Intuitive tools for quick edits. Export and share in seconds.

### Tools

- **Blur** - Apply adjustable blur effects to hide sensitive information
- **Pixelate** - Pixelate regions with customizable pixel size
- **Solid Cover** - Completely hide areas with solid color overlays
- **Highlighter** - Transparent color overlays to emphasize content
- **Pen** - Freehand drawing with smooth strokes
- **Shapes** - Arrows, lines, rectangles, and circles
- **Text** - Add text annotations with custom fonts and colors

## 🛠️ Tech Stack

- **React** + **TypeScript** - Component-based UI with type safety
- **Vite** - Fast development and optimized builds
- **Tailwind CSS** - Utility-first styling
- **Zustand** - Lightweight state management
- **Lucide React** - Beautiful icons
- **react-colorful** - Color picker
- **Canvas API** - Image rendering and editing

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:5173`

## 📖 Usage

1. **Upload** - Drag and drop or select a screenshot (PNG, JPEG, or WebP)
2. **Edit** - Use the toolbar to blur, highlight, and annotate
3. **Export** - Download your edited image as a flattened PNG

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `V` | Select tool |
| `B` | Blur tool |
| `H` | Highlighter |
| `P` | Pen tool |
| `A` | Arrow tool |
| `L` | Line tool |
| `R` | Rectangle tool |
| `T` | Text tool |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Shift + Z` | Redo |
| `Delete` | Delete selected element |

## 🔐 Privacy

- **No server uploads** - Images never leave your browser
- **No tracking** - We don't collect any usage data
- **Local processing** - All editing happens client-side
- **No dependencies on external APIs** - Completely self-contained

## 📝 Project Structure

```
BlurSnap/
├── src/
│   ├── components/      # React components
│   │   ├── upload/     # Upload screen
│   │   ├── editor/     # Main editor components
│   │   └── toolbar/    # Tool palette
│   ├── store/          # Zustand state management
│   ├── types/          # TypeScript type definitions
│   └── App.tsx         # Main app component
├── Documents/          # Project documentation
└── public/             # Static assets
```

## 🗺️ Roadmap

### Current Status - MVP (Milestone 1-2)

✅ Upload and display images  
✅ Basic tool system  
✅ Toolbar UI  
⏳ Redaction tools implementation  
⏳ Export functionality  

### Upcoming Features

- Complete blur, pixelate, and solid cover tools
- Highlighter with multiple colors
- Freehand drawing with pen tool
- Shape tools (arrows, rectangles, circles)
- Text annotations
- Undo/redo system
- Transform handles (move, resize, rotate)
- Layer management
- Export as PNG

## 🤝 Contributing

Contributions are welcome! This is an open-source project focused on privacy and user control.

## 📄 License

MIT License - feel free to use this project for any purpose.

## 🙏 Acknowledgments

- Inspired by the need for a simple, privacy-focused screenshot editor
- Built with modern web technologies
- No dependency on external AI or cloud services

---

**Made with ❤️ for privacy-conscious users**

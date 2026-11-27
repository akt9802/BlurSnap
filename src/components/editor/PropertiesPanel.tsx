import { useEditorStore } from '../../store/editorStore';
import { Palette, Minus, Plus } from 'lucide-react';

const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#000000', // Black
  '#FFFFFF', // White
];

const HIGHLIGHTER_COLORS = [
  { name: 'Yellow', color: '#FFFF00' },
  { name: 'Green', color: '#00FF00' },
  { name: 'Pink', color: '#FF00FF' },
  { name: 'Blue', color: '#00BFFF' },
  { name: 'Orange', color: '#FFA500' },
];

export default function PropertiesPanel() {
  const { toolSettings, setToolColor, setStrokeWidth, setOpacity, annotations, selection, updateAnnotation } = useEditorStore();
  const tool = toolSettings.activeTool;
  const selectedText = annotations.find(
    (ann) => ann.type === 'text' && selection.selectedIds.includes(ann.id)
  );
  const fontSize = selectedText?.type === 'text'
    ? selectedText.fontSize
    : (toolSettings.fontSize || 24);

  const changeFontSize = (nextSize: number) => {
    const size = Math.max(12, Math.min(240, nextSize));
    useEditorStore.setState((state) => ({
      toolSettings: { ...state.toolSettings, fontSize: size },
    }));
    if (selectedText?.type === 'text') {
      updateAnnotation(selectedText.id, { fontSize: size });
    }
  };

  const showColorPicker = ['pen', 'arrow', 'line', 'rectangle', 'circle', 'text', 'solid-cover'].includes(tool);
  const showStrokeWidth = ['pen', 'arrow', 'line', 'rectangle', 'circle'].includes(tool);
  const showHighlighterColors = tool === 'highlighter';
  const showOpacity = tool === 'highlighter';
  const showTextSettings = tool === 'text' || selectedText?.type === 'text';

  return (
    <div className="w-72 h-full min-h-0 bg-white border-l border-gray-200 flex flex-col text-gray-900">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Properties
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Tool Info */}
        <div>
          <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Active Tool</h3>
          <div className="text-sm font-medium text-gray-900 capitalize">
            {tool.replace('-', ' ')}
          </div>
        </div>

        {showTextSettings && (
          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase mb-3">Font Size</h3>
            {selectedText?.type === 'text' && (
              <p className="text-xs text-gray-500 mb-2">Selected: {selectedText.text}</p>
            )}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => changeFontSize(fontSize - 2)}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-900 transition-colors"
                aria-label="Decrease font size"
              >
                <Minus className="w-4 h-4" strokeWidth={2.5} />
              </button>
              <div className="flex-1 text-center text-sm font-semibold text-gray-900">
                {fontSize}px
              </div>
              <button
                type="button"
                onClick={() => changeFontSize(fontSize + 2)}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-900 transition-colors"
                aria-label="Increase font size"
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}

        {/* Highlighter Colors */}
        {showHighlighterColors && (
          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase mb-3">Color</h3>
            <div className="grid grid-cols-5 gap-2">
              {HIGHLIGHTER_COLORS.map(({ name, color }) => (
                <button
                  key={color}
                  onClick={() => setToolColor(color)}
                  className={`
                    aspect-square rounded-lg border-2 transition-all
                    ${toolSettings.color === color
                      ? 'border-blue-500 scale-110'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  style={{ backgroundColor: color }}
                  title={name}
                />
              ))}
            </div>
          </div>
        )}

        {/* Regular Color Picker */}
        {showColorPicker && (
          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase mb-3">Color</h3>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setToolColor(color)}
                  className={`
                    aspect-square rounded-lg border-2 transition-all
                    ${toolSettings.color === color
                      ? 'border-blue-500 scale-110'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  style={{ backgroundColor: color }}
                  title={color}
                >
                  {color === '#FFFFFF' && (
                    <div className="w-full h-full border border-gray-300 rounded-md" />
                  )}
                </button>
              ))}
            </div>
            <input
              type="color"
              value={toolSettings.color}
              onChange={(e) => setToolColor(e.target.value)}
              className="mt-2 w-full h-10 rounded-lg cursor-pointer"
            />
          </div>
        )}

        {/* Stroke Width */}
        {showStrokeWidth && (
          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase mb-3">Stroke Width</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStrokeWidth(Math.max(1, toolSettings.strokeWidth - 1))}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-900 transition-colors"
              >
                <Minus className="w-4 h-4" strokeWidth={2.5} />
              </button>
              <div className="flex-1 text-center text-sm font-semibold text-gray-900">
                {toolSettings.strokeWidth}px
              </div>
              <button
                onClick={() => setStrokeWidth(Math.min(20, toolSettings.strokeWidth + 1))}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-900 transition-colors"
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              value={toolSettings.strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="w-full mt-2"
            />
          </div>
        )}

        {/* Opacity */}
        {showOpacity && (
          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase mb-3">Opacity</h3>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{Math.round(toolSettings.opacity * 100)}%</span>
              <input
                type="range"
                min="10"
                max="100"
                value={toolSettings.opacity * 100}
                onChange={(e) => setOpacity(Number(e.target.value) / 100)}
                className="flex-1"
              />
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">How to use</h3>
          <div className="text-sm text-gray-600 space-y-1">
            {tool === 'select' && <p>Click to select elements. Drag to move them.</p>}
            {tool === 'blur' && <p>Click and drag to blur sensitive areas.</p>}
            {tool === 'pixelate' && <p>Click and drag to pixelate regions.</p>}
            {tool === 'solid-cover' && <p>Click and drag to cover areas completely.</p>}
            {tool === 'highlighter' && <p>Click and drag to highlight important content.</p>}
            {tool === 'pen' && <p>Click and drag to draw freehand.</p>}
            {tool === 'arrow' && <p>Click and drag to draw an arrow.</p>}
            {tool === 'line' && <p>Click and drag to draw a line.</p>}
            {tool === 'rectangle' && <p>Click and drag to draw a rectangle.</p>}
            {tool === 'circle' && <p>Click and drag to draw a circle.</p>}
            {tool === 'text' && <p>Click empty space to add text. Click existing text to edit it. Drag it to move it.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

import {
  MousePointer2,
  Blend,
  Grid3x3,
  Square,
  Highlighter,
  Pen,
  ArrowRight,
  Minus,
  RectangleHorizontal,
  Circle,
  Type,
  Undo2,
  Redo2,
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import type { ToolType } from '../../types';

interface Tool {
  id: ToolType;
  name: string;
  icon: React.ReactNode;
  shortcut?: string;
}

const tools: Tool[] = [
  { id: 'select', name: 'Select', icon: <MousePointer2 />, shortcut: 'V' },
  { id: 'blur', name: 'Blur', icon: <Blend />, shortcut: 'B' },
  { id: 'pixelate', name: 'Pixelate', icon: <Grid3x3 /> },
  { id: 'solid-cover', name: 'Solid Cover', icon: <Square /> },
  { id: 'highlighter', name: 'Highlighter', icon: <Highlighter />, shortcut: 'H' },
  { id: 'pen', name: 'Pen', icon: <Pen />, shortcut: 'P' },
  { id: 'arrow', name: 'Arrow', icon: <ArrowRight />, shortcut: 'A' },
  { id: 'line', name: 'Line', icon: <Minus />, shortcut: 'L' },
  { id: 'rectangle', name: 'Rectangle', icon: <RectangleHorizontal />, shortcut: 'R' },
  { id: 'circle', name: 'Circle', icon: <Circle /> },
  { id: 'text', name: 'Text', icon: <Type />, shortcut: 'T' },
];

export default function Toolbar() {
  const { toolSettings, setActiveTool, undo, redo, history } = useEditorStore();
  const activeTool = toolSettings.activeTool;
  
  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  return (
    <div className="w-20 bg-white border-r border-gray-200 flex flex-col py-4">
      {/* Tools */}
      <div className="flex-1 flex flex-col gap-1 px-2">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`
              relative group h-14 rounded-lg flex flex-col items-center justify-center
              transition-all duration-150
              ${activeTool === tool.id
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }
            `}
            title={`${tool.name}${tool.shortcut ? ` (${tool.shortcut})` : ''}`}
          >
            <div className="w-5 h-5">
              {tool.icon}
            </div>
            {tool.shortcut && (
              <span className="text-[10px] mt-0.5 font-medium opacity-60">
                {tool.shortcut}
              </span>
            )}

            {/* Tooltip */}
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {tool.name}
              {tool.shortcut && (
                <span className="ml-2 text-gray-400">({tool.shortcut})</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Undo/Redo */}
      <div className="border-t border-gray-200 pt-2 flex flex-col gap-1 px-2">
        <button
          onClick={undo}
          disabled={!canUndo}
          className={`h-12 rounded-lg flex items-center justify-center transition-colors ${
            canUndo
              ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              : 'text-gray-300 cursor-not-allowed'
          }`}
          title={`Undo (Ctrl+Z)${canUndo ? ` - ${history.past.length} action(s)` : ''}`}
        >
          <Undo2 className="w-5 h-5" />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className={`h-12 rounded-lg flex items-center justify-center transition-colors ${
            canRedo
              ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              : 'text-gray-300 cursor-not-allowed'
          }`}
          title={`Redo (Ctrl+Shift+Z)${canRedo ? ` - ${history.future.length} action(s)` : ''}`}
        >
          <Redo2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

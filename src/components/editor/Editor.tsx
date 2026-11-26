import { useState } from 'react';
import { X, Download, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import EditorCanvas from './EditorCanvas';
import Toolbar from '../toolbar/Toolbar';
import PropertiesPanel from './PropertiesPanel';

interface EditorProps {
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  fileName: string;
  onClear: () => void;
}

export default function Editor({
  imageUrl,
  imageWidth,
  imageHeight,
  fileName,
  onClear,
}: EditorProps) {
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.25));
  const handleResetZoom = () => setZoom(1);

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export clicked');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            BlurSnap
          </h1>
          <div className="h-6 w-px bg-gray-300" />
          <div className="text-sm">
            <p className="font-medium text-gray-900">{fileName}</p>
            <p className="text-gray-500 text-xs">
              {imageWidth} × {imageHeight} px
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={onClear}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Close and upload new image"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Toolbar */}
        <Toolbar />

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Canvas Container */}
          <div className="flex-1 overflow-auto bg-gray-100 relative">
            <EditorCanvas
              imageUrl={imageUrl}
              imageWidth={imageWidth}
              imageHeight={imageHeight}
              zoom={zoom}
            />
          </div>

          {/* Bottom Controls */}
          <div className="bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Zoom:</span>
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 hover:bg-white rounded transition-colors"
                  title="Zoom out"
                >
                  <ZoomOut className="w-4 h-4 text-gray-700" />
                </button>
                <span className="px-3 text-sm font-medium text-gray-900 min-w-[60px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-1.5 hover:bg-white rounded transition-colors"
                  title="Zoom in"
                >
                  <ZoomIn className="w-4 h-4 text-gray-700" />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-1" />
                <button
                  onClick={handleResetZoom}
                  className="p-1.5 hover:bg-white rounded transition-colors"
                  title="Reset zoom"
                >
                  <RotateCcw className="w-4 h-4 text-gray-700" />
                </button>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              <span className="font-medium text-gray-700">Tip:</span> Use keyboard shortcuts for quick actions
            </div>
          </div>
        </div>

        {/* Right Properties Panel */}
        <PropertiesPanel />
      </div>
    </div>
  );
}

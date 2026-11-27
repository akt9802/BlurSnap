import { useState } from 'react';
import UploadScreen from './components/upload/UploadScreen';
import Editor from './components/editor/Editor';
import { useEditorStore } from './store/editorStore';

function App() {
  const resetEditor = useEditorStore((state) => state.resetEditor);
  
  const [imageData, setImageData] = useState<{
    file: File;
    url: string;
    width: number;
    height: number;
  } | null>(null);

  const handleImageLoad = (file: File, url: string, width: number, height: number) => {
    // Clear previous edits
    resetEditor();
    setImageData({ file, url, width, height });
  };

  const handleClear = () => {
    if (imageData) {
      URL.revokeObjectURL(imageData.url);
      setImageData(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {!imageData ? (
        <UploadScreen onImageLoad={handleImageLoad} />
      ) : (
        <Editor
          imageUrl={imageData.url}
          imageWidth={imageData.width}
          imageHeight={imageData.height}
          fileName={imageData.file.name}
          onClear={handleClear}
        />
      )}
    </div>
  );
}

export default App;

import { useState } from 'react';
import UploadScreen from './components/upload/UploadScreen';
import Editor from './components/editor/Editor';

function App() {
  const [imageData, setImageData] = useState<{
    file: File;
    url: string;
    width: number;
    height: number;
  } | null>(null);

  const handleImageLoad = (file: File, url: string, width: number, height: number) => {
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

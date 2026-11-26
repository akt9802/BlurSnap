import { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface UploadScreenProps {
  onImageLoad: (file: File, url: string, width: number, height: number) => void;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

export default function UploadScreen({ onImageLoad }: UploadScreenProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateAndLoadImage = useCallback((file: File) => {
    setError(null);

    // Validate file type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Please upload a PNG, JPEG, or WebP image.');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('File size must be less than 20MB.');
      return;
    }

    // Load image to get dimensions
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      onImageLoad(file, url, img.width, img.height);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      setError('Failed to load image. Please try another file.');
    };

    img.src = url;
  }, [onImageLoad]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      validateAndLoadImage(files[0]);
    }
  }, [validateAndLoadImage]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndLoadImage(files[0]);
    }
  }, [validateAndLoadImage]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <ImageIcon className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            BlurSnap
          </h1>
        </div>
        <p className="text-gray-600 text-lg max-w-md mx-auto">
          Privacy-first screenshot editor. Blur, highlight, and annotate your images - all in your browser.
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`
          relative w-full max-w-2xl rounded-2xl border-2 border-dashed
          transition-all duration-200 cursor-pointer
          ${isDragging
            ? 'border-blue-500 bg-blue-50 scale-105'
            : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
          }
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <div className="p-16 text-center">
          <div className="mb-6 flex justify-center">
            <div className={`
              w-20 h-20 rounded-full flex items-center justify-center
              transition-colors duration-200
              ${isDragging ? 'bg-blue-100' : 'bg-gray-100'}
            `}>
              <Upload className={`w-10 h-10 ${isDragging ? 'text-blue-600' : 'text-gray-400'}`} />
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            {isDragging ? 'Drop your image here' : 'Upload an image'}
          </h2>
          
          <p className="text-gray-500 mb-6">
            Drag and drop or{' '}
            <span className="text-blue-600 font-medium">browse</span>
            {' '}to choose a file
          </p>

          <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <span className="font-medium text-gray-500">PNG</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span className="font-medium text-gray-500">JPEG</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span className="font-medium text-gray-500">WebP</span>
            </span>
            <span>•</span>
            <span>Max 20MB</span>
          </div>
        </div>

        <input
          id="file-input"
          type="file"
          accept=".png,.jpg,.jpeg,.webp"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-6 max-w-2xl w-full">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Features */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🔒</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Privacy First</h3>
          <p className="text-sm text-gray-600">All editing happens in your browser. No uploads, no tracking.</p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">✨</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Complete Control</h3>
          <p className="text-sm text-gray-600">You decide what to blur, highlight, or annotate. No AI guessing.</p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🚀</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Fast & Simple</h3>
          <p className="text-sm text-gray-600">Intuitive tools for quick edits. Export and share in seconds.</p>
        </div>
      </div>
    </div>
  );
}

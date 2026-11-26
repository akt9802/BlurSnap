import { useEffect, useRef, useState } from 'react';

interface EditorCanvasProps {
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  zoom: number;
}

export default function EditorCanvas({
  imageUrl,
  imageWidth,
  imageHeight,
  zoom,
}: EditorCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const baseCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  // Load image
  useEffect(() => {
    const img = new Image();
    img.onload = () => setImage(img);
    img.src = imageUrl;
  }, [imageUrl]);

  // Draw image on base canvas
  useEffect(() => {
    if (!image || !baseCanvasRef.current) return;

    const canvas = baseCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match image
    canvas.width = imageWidth;
    canvas.height = imageHeight;

    // Clear and draw image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, imageWidth, imageHeight);
  }, [image, imageWidth, imageHeight]);

  // Setup overlay canvas
  useEffect(() => {
    if (!overlayCanvasRef.current) return;

    const canvas = overlayCanvasRef.current;
    canvas.width = imageWidth;
    canvas.height = imageHeight;
  }, [imageWidth, imageHeight]);

  const displayWidth = imageWidth * zoom;
  const displayHeight = imageHeight * zoom;

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center p-8"
    >
      <div
        className="relative shadow-2xl"
        style={{
          width: displayWidth,
          height: displayHeight,
        }}
      >
        {/* Base Canvas - displays the image */}
        <canvas
          ref={baseCanvasRef}
          className="absolute top-0 left-0 w-full h-full"
          style={{
            imageRendering: zoom > 1 ? 'pixelated' : 'auto',
          }}
        />
        
        {/* Overlay Canvas - for drawing tools and annotations */}
        <canvas
          ref={overlayCanvasRef}
          className="absolute top-0 left-0 w-full h-full cursor-crosshair"
        />
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import type { Point } from '../../types';

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
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null);
  const [drawingPath, setDrawingPath] = useState<Point[]>([]);
  
  // Text tool state
  const [textInput, setTextInput] = useState<{ position: Point; text: string } | null>(null);

  const { toolSettings, redactions, annotations, highlights, addRedaction, addAnnotation, addHighlight } = useEditorStore();

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

  // Convert screen coordinates to image coordinates
  const screenToImageCoords = (clientX: number, clientY: number): Point => {
    if (!overlayCanvasRef.current) return { x: 0, y: 0 };

    const rect = overlayCanvasRef.current.getBoundingClientRect();
    const scaleX = imageWidth / rect.width;
    const scaleY = imageHeight / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  // Render all stored elements
  const renderElements = () => {
    if (!baseCanvasRef.current || !image) return;

    const canvas = baseCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and redraw base image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, imageWidth, imageHeight);

    // Draw redactions
    redactions.forEach((redaction) => {
      if (!redaction.enabled) return;

      if (Array.isArray(redaction.bounds)) return; // Skip freeform for now

      const { x, y, width, height } = redaction.bounds;

      switch (redaction.style) {
        case 'solid':
          ctx.fillStyle = redaction.color || '#000000';
          ctx.fillRect(x, y, width, height);
          break;

        case 'blur':
          // Save the region
          const imageData = ctx.getImageData(x, y, width, height);
          
          // Create temporary canvas for blur
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = width;
          tempCanvas.height = height;
          const tempCtx = tempCanvas.getContext('2d');
          
          if (tempCtx) {
            tempCtx.putImageData(imageData, 0, 0);
            tempCtx.filter = `blur(${redaction.intensity || 10}px)`;
            tempCtx.drawImage(tempCanvas, 0, 0);
            ctx.drawImage(tempCanvas, x, y);
          }
          break;

        case 'pixelate':
          const pixelSize = redaction.intensity || 10;
          const tempCanvas2 = document.createElement('canvas');
          tempCanvas2.width = width;
          tempCanvas2.height = height;
          const tempCtx2 = tempCanvas2.getContext('2d');
          
          if (tempCtx2) {
            tempCtx2.drawImage(canvas, x, y, width, height, 0, 0, width, height);
            
            // Pixelate
            for (let py = 0; py < height; py += pixelSize) {
              for (let px = 0; px < width; px += pixelSize) {
                const pixel = tempCtx2.getImageData(px, py, 1, 1).data;
                tempCtx2.fillStyle = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
                tempCtx2.fillRect(px, py, pixelSize, pixelSize);
              }
            }
            
            ctx.drawImage(tempCanvas2, x, y);
          }
          break;
      }
    });

    // Draw highlights
    highlights.forEach((highlight) => {
      if (Array.isArray(highlight.bounds)) {
        // Freeform highlight
        if (highlight.bounds.length < 2) return;
        
        ctx.strokeStyle = highlight.color;
        ctx.lineWidth = 20;
        ctx.globalAlpha = highlight.opacity;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        ctx.moveTo(highlight.bounds[0].x, highlight.bounds[0].y);
        for (let i = 1; i < highlight.bounds.length; i++) {
          ctx.lineTo(highlight.bounds[i].x, highlight.bounds[i].y);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
      } else {
        // Rectangle highlight
        ctx.fillStyle = highlight.color;
        ctx.globalAlpha = highlight.opacity;
        ctx.fillRect(highlight.bounds.x, highlight.bounds.y, highlight.bounds.width, highlight.bounds.height);
        ctx.globalAlpha = 1;
      }
    });

    // Draw annotations
    annotations.forEach((annotation) => {
      ctx.strokeStyle = annotation.type === 'arrow' ? annotation.color : 
                        annotation.type === 'line' ? annotation.color :
                        annotation.type === 'rectangle' ? annotation.color :
                        annotation.type === 'circle' ? annotation.color :
                        annotation.type === 'freehand' ? annotation.color : '#000';
      
      ctx.lineWidth = 'strokeWidth' in annotation ? annotation.strokeWidth : 3;

      switch (annotation.type) {
        case 'arrow':
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          ctx.moveTo(annotation.start.x, annotation.start.y);
          ctx.lineTo(annotation.end.x, annotation.end.y);
          ctx.stroke();

          // Arrow head (filled triangle)
          const angle = Math.atan2(
            annotation.end.y - annotation.start.y,
            annotation.end.x - annotation.start.x
          );
          const arrowLength = Math.max(20, annotation.strokeWidth * 4);
          const arrowWidth = Math.PI / 7;
          
          ctx.fillStyle = annotation.color;
          ctx.beginPath();
          ctx.moveTo(annotation.end.x, annotation.end.y);
          ctx.lineTo(
            annotation.end.x - arrowLength * Math.cos(angle - arrowWidth),
            annotation.end.y - arrowLength * Math.sin(angle - arrowWidth)
          );
          ctx.lineTo(
            annotation.end.x - arrowLength * Math.cos(angle + arrowWidth),
            annotation.end.y - arrowLength * Math.sin(angle + arrowWidth)
          );
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;

        case 'line':
          ctx.beginPath();
          ctx.moveTo(annotation.start.x, annotation.start.y);
          ctx.lineTo(annotation.end.x, annotation.end.y);
          ctx.stroke();
          break;

        case 'rectangle':
          ctx.strokeRect(annotation.bounds.x, annotation.bounds.y, annotation.bounds.width, annotation.bounds.height);
          break;

        case 'circle':
          ctx.beginPath();
          ctx.arc(annotation.center.x, annotation.center.y, annotation.radius, 0, Math.PI * 2);
          ctx.stroke();
          break;

        case 'freehand':
          if (annotation.points.length < 2) return;
          
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          ctx.moveTo(annotation.points[0].x, annotation.points[0].y);
          for (let i = 1; i < annotation.points.length; i++) {
            ctx.lineTo(annotation.points[i].x, annotation.points[i].y);
          }
          ctx.stroke();
          break;

        case 'text':
          ctx.font = `${annotation.fontSize}px ${annotation.fontFamily}`;
          ctx.fillStyle = annotation.color;
          if (annotation.backgroundColor) {
            const metrics = ctx.measureText(annotation.text);
            ctx.fillStyle = annotation.backgroundColor;
            ctx.fillRect(
              annotation.position.x,
              annotation.position.y - annotation.fontSize,
              metrics.width,
              annotation.fontSize + 4
            );
            ctx.fillStyle = annotation.color;
          }
          ctx.fillText(annotation.text, annotation.position.x, annotation.position.y);
          break;
      }
    });
  };

  // Re-render elements when they change
  useEffect(() => {
    renderElements();
  }, [redactions, annotations, highlights, image]);

  // Draw preview on overlay canvas
  const drawPreview = () => {
    if (!overlayCanvasRef.current) return;

    const canvas = overlayCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear overlay
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!startPoint || !currentPoint) return;

    const tool = toolSettings.activeTool;
    ctx.strokeStyle = toolSettings.color;
    ctx.fillStyle = toolSettings.color;
    ctx.lineWidth = toolSettings.strokeWidth;
    ctx.globalAlpha = toolSettings.opacity;

    switch (tool) {
      case 'rectangle':
      case 'solid-cover':
        const width = currentPoint.x - startPoint.x;
        const height = currentPoint.y - startPoint.y;
        if (tool === 'solid-cover') {
          ctx.fillRect(startPoint.x, startPoint.y, width, height);
        } else {
          ctx.strokeRect(startPoint.x, startPoint.y, width, height);
        }
        break;

      case 'circle':
        const radius = Math.sqrt(
          Math.pow(currentPoint.x - startPoint.x, 2) +
          Math.pow(currentPoint.y - startPoint.y, 2)
        );
        ctx.beginPath();
        ctx.arc(startPoint.x, startPoint.y, radius, 0, Math.PI * 2);
        ctx.stroke();
        break;

      case 'arrow':
      case 'line':
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(currentPoint.x, currentPoint.y);
        ctx.stroke();

        // Draw arrow head
        if (tool === 'arrow') {
          const angle = Math.atan2(
            currentPoint.y - startPoint.y,
            currentPoint.x - startPoint.x
          );
          const arrowLength = Math.max(20, toolSettings.strokeWidth * 4);
          const arrowWidth = Math.PI / 7;
          
          ctx.fillStyle = toolSettings.color;
          ctx.beginPath();
          ctx.moveTo(currentPoint.x, currentPoint.y);
          ctx.lineTo(
            currentPoint.x - arrowLength * Math.cos(angle - arrowWidth),
            currentPoint.y - arrowLength * Math.sin(angle - arrowWidth)
          );
          ctx.lineTo(
            currentPoint.x - arrowLength * Math.cos(angle + arrowWidth),
            currentPoint.y - arrowLength * Math.sin(angle + arrowWidth)
          );
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
        break;

      case 'pen':
      case 'highlighter':
        if (drawingPath.length > 1) {
          ctx.beginPath();
          ctx.moveTo(drawingPath[0].x, drawingPath[0].y);
          for (let i = 1; i < drawingPath.length; i++) {
            ctx.lineTo(drawingPath[i].x, drawingPath[i].y);
          }
          ctx.stroke();
        }
        break;

      case 'blur':
      case 'pixelate':
        const w = currentPoint.x - startPoint.x;
        const h = currentPoint.y - startPoint.y;
        ctx.strokeStyle = '#3B82F6';
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(startPoint.x, startPoint.y, w, h);
        ctx.setLineDash([]);
        break;
    }

    ctx.globalAlpha = 1;
  };

  // Mouse down handler
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = screenToImageCoords(e.clientX, e.clientY);
    
    // Special handling for text tool
    if (toolSettings.activeTool === 'text') {
      setTextInput({ position: point, text: '' });
      return;
    }
    
    setIsDrawing(true);
    setStartPoint(point);
    setCurrentPoint(point);
    setDrawingPath([point]);
  };

  // Mouse move handler
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const point = screenToImageCoords(e.clientX, e.clientY);
    setCurrentPoint(point);

    // For pen and highlighter, add to path
    if (toolSettings.activeTool === 'pen' || toolSettings.activeTool === 'highlighter') {
      setDrawingPath((prev) => [...prev, point]);
    }

    drawPreview();
  };

  // Handle text input submission
  const handleTextSubmit = () => {
    if (!textInput || !textInput.text.trim()) {
      setTextInput(null);
      return;
    }

    addAnnotation({
      id: Date.now().toString(),
      type: 'text',
      position: textInput.position,
      text: textInput.text,
      color: toolSettings.color,
      fontSize: toolSettings.fontSize || 24,
      fontFamily: toolSettings.fontFamily || 'Arial',
      bold: false,
      italic: false,
      layer: { zIndex: 0, visible: true, locked: false },
    });

    setTextInput(null);
  };

  // Mouse up handler
  const handleMouseUp = () => {
    if (!isDrawing || !startPoint || !currentPoint) return;

    const tool = toolSettings.activeTool;

    // Create element based on tool type
    switch (tool) {
      case 'rectangle':
        addAnnotation({
          id: Date.now().toString(),
          type: 'rectangle',
          bounds: {
            x: Math.min(startPoint.x, currentPoint.x),
            y: Math.min(startPoint.y, currentPoint.y),
            width: Math.abs(currentPoint.x - startPoint.x),
            height: Math.abs(currentPoint.y - startPoint.y),
          },
          color: toolSettings.color,
          strokeWidth: toolSettings.strokeWidth,
          filled: false,
          opacity: toolSettings.opacity,
          layer: { zIndex: 0, visible: true, locked: false },
        });
        break;

      case 'circle':
        const radius = Math.sqrt(
          Math.pow(currentPoint.x - startPoint.x, 2) +
          Math.pow(currentPoint.y - startPoint.y, 2)
        );
        addAnnotation({
          id: Date.now().toString(),
          type: 'circle',
          center: startPoint,
          radius,
          color: toolSettings.color,
          strokeWidth: toolSettings.strokeWidth,
          filled: false,
          opacity: toolSettings.opacity,
          layer: { zIndex: 0, visible: true, locked: false },
        });
        break;

      case 'arrow':
        addAnnotation({
          id: Date.now().toString(),
          type: 'arrow',
          start: startPoint,
          end: currentPoint,
          color: toolSettings.color,
          strokeWidth: toolSettings.strokeWidth,
          arrowHeadStyle: 'single',
          layer: { zIndex: 0, visible: true, locked: false },
        });
        break;

      case 'line':
        addAnnotation({
          id: Date.now().toString(),
          type: 'line',
          start: startPoint,
          end: currentPoint,
          color: toolSettings.color,
          strokeWidth: toolSettings.strokeWidth,
          style: 'solid',
          layer: { zIndex: 0, visible: true, locked: false },
        });
        break;

      case 'highlighter':
        addHighlight({
          id: Date.now().toString(),
          bounds: drawingPath,
          color: toolSettings.color,
          opacity: toolSettings.opacity,
          layer: { zIndex: 0, visible: true, locked: false },
        });
        break;

      case 'pen':
        addAnnotation({
          id: Date.now().toString(),
          type: 'freehand',
          points: drawingPath,
          color: toolSettings.color,
          strokeWidth: toolSettings.strokeWidth,
          smoothing: 0.5,
          layer: { zIndex: 0, visible: true, locked: false },
        });
        break;

      case 'solid-cover':
      case 'blur':
      case 'pixelate':
        addRedaction({
          id: Date.now().toString(),
          bounds: {
            x: Math.min(startPoint.x, currentPoint.x),
            y: Math.min(startPoint.y, currentPoint.y),
            width: Math.abs(currentPoint.x - startPoint.x),
            height: Math.abs(currentPoint.y - startPoint.y),
          },
          style: tool === 'blur' ? 'blur' : tool === 'pixelate' ? 'pixelate' : 'solid',
          color: toolSettings.color,
          intensity: tool === 'blur' ? toolSettings.blurIntensity : toolSettings.pixelSize,
          enabled: true,
          layer: { zIndex: 0, visible: true, locked: false },
        });
        break;
    }

    // Reset drawing state
    setIsDrawing(false);
    setStartPoint(null);
    setCurrentPoint(null);
    setDrawingPath([]);

    // Clear overlay
    if (overlayCanvasRef.current) {
      const ctx = overlayCanvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, imageWidth, imageHeight);
    }
  };

  // Draw preview on mouse move
  useEffect(() => {
    if (isDrawing) {
      drawPreview();
    }
  }, [currentPoint, drawingPath]);

  const displayWidth = imageWidth * zoom;
  const displayHeight = imageHeight * zoom;

  // Get cursor style based on active tool
  const getCursorStyle = () => {
    switch (toolSettings.activeTool) {
      case 'select':
        return 'default';
      case 'pen':
      case 'highlighter':
        return 'crosshair';
      case 'text':
        return 'text';
      default:
        return 'crosshair';
    }
  };

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
          className="absolute top-0 left-0 w-full h-full"
          style={{ cursor: getCursorStyle() }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />

        {/* Text Input Overlay */}
        {textInput && (
          <div
            className="absolute"
            style={{
              left: `${(textInput.position.x / imageWidth) * 100}%`,
              top: `${(textInput.position.y / imageHeight) * 100}%`,
              transform: 'translate(0, -50%)',
            }}
          >
            <input
              type="text"
              autoFocus
              value={textInput.text}
              onChange={(e) => setTextInput({ ...textInput, text: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleTextSubmit();
                } else if (e.key === 'Escape') {
                  setTextInput(null);
                }
              }}
              onBlur={handleTextSubmit}
              className="px-3 py-2 border-2 border-blue-500 rounded-lg shadow-lg"
              style={{
                fontSize: `${((toolSettings.fontSize || 24) / imageHeight) * displayHeight}px`,
                color: toolSettings.color,
                fontFamily: toolSettings.fontFamily || 'Arial',
                minWidth: '200px',
              }}
              placeholder="Type text..."
            />
          </div>
        )}
      </div>
    </div>
  );
}

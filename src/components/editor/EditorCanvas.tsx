import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
  const [textInput, setTextInput] = useState<{
    position: Point;
    text: string;
    screenX: number;
    screenY: number;
    editingId?: string;
  } | null>(null);
  const textFieldRef = useRef<HTMLInputElement>(null);
  const ignoreBlurUntil = useRef(0);
  const textPointerRef = useRef<{ id: string; x: number; y: number; moved: boolean } | null>(null);

  // Selection and movement state
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
  const [originalBounds, setOriginalBounds] = useState<any>(null);
  const [hoverHandle, setHoverHandle] = useState<string | null>(null);

  const { 
    toolSettings, 
    redactions, 
    annotations, 
    highlights, 
    addRedaction, 
    addAnnotation, 
    addHighlight, 
    updateAnnotation,
    updateRedaction,
    updateHighlight,
    setSelection,
    setIsEditingText
  } = useEditorStore();

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

  // Get transform handles for an element
  const getTransformHandles = (elementId: string) => {
    const element = [...annotations, ...redactions, ...highlights].find(e => e.id === elementId);
    if (!element) return null;

    let bounds = null;
    if ('bounds' in element && !Array.isArray(element.bounds)) {
      bounds = element.bounds;
    } else if ('start' in element && 'end' in element) {
      bounds = {
        x: Math.min(element.start.x, element.end.x),
        y: Math.min(element.start.y, element.end.y),
        width: Math.abs(element.end.x - element.start.x),
        height: Math.abs(element.end.y - element.start.y),
      };
    } else if ('center' in element && 'radius' in element) {
      bounds = {
        x: element.center.x - element.radius,
        y: element.center.y - element.radius,
        width: element.radius * 2,
        height: element.radius * 2,
      };
    } else if ('type' in element && element.type === 'text') {
      const canvas = overlayCanvasRef.current;
      const ctx = canvas?.getContext('2d');
      let textWidth = Math.max(24, (element.text.length * element.fontSize) / 2);
      if (ctx) {
        ctx.font = `${element.fontSize}px ${element.fontFamily || 'Arial'}`;
        textWidth = Math.max(24, ctx.measureText(element.text).width);
      }
      bounds = {
        x: element.position.x,
        y: element.position.y - element.fontSize,
        width: textWidth,
        height: element.fontSize,
      };
    }

    if (!bounds) return null;

    const handleSize = 8;
    const isText = 'type' in element && element.type === 'text';
    const outset = isText ? 10 : 0;
    const handles = {
      'top-left': { x: bounds.x - handleSize / 2 - outset, y: bounds.y - handleSize / 2 - outset, width: handleSize, height: handleSize },
      'top-right': { x: bounds.x + bounds.width - handleSize / 2 + outset, y: bounds.y - handleSize / 2 - outset, width: handleSize, height: handleSize },
      'bottom-right': { x: bounds.x + bounds.width - handleSize / 2 + outset, y: bounds.y + bounds.height - handleSize / 2 + outset, width: handleSize, height: handleSize },
      'bottom-left': { x: bounds.x - handleSize / 2 - outset, y: bounds.y + bounds.height - handleSize / 2 + outset, width: handleSize, height: handleSize },
    };

    if (isText) {
      return { ...handles, bounds };
    }

    return {
      ...handles,
      'top': { x: bounds.x + bounds.width / 2 - handleSize / 2, y: bounds.y - handleSize / 2, width: handleSize, height: handleSize },
      'right': { x: bounds.x + bounds.width - handleSize / 2, y: bounds.y + bounds.height / 2 - handleSize / 2, width: handleSize, height: handleSize },
      'bottom': { x: bounds.x + bounds.width / 2 - handleSize / 2, y: bounds.y + bounds.height - handleSize / 2, width: handleSize, height: handleSize },
      'left': { x: bounds.x - handleSize / 2, y: bounds.y + bounds.height / 2 - handleSize / 2, width: handleSize, height: handleSize },
      bounds,
    };
  };

  // Check if point is on a resize handle
  const hitTestHandle = (point: Point, elementId: string): string | null => {
    const handles = getTransformHandles(elementId);
    if (!handles) return null;

    for (const [name, handle] of Object.entries(handles)) {
      if (name === 'bounds') continue;
      const h = handle as { x: number; y: number; width: number; height: number };
      if (point.x >= h.x && point.x <= h.x + h.width &&
          point.y >= h.y && point.y <= h.y + h.height) {
        return name;
      }
    }
    return null;
  };

  // Hit testing - check if point is inside an element
  const hitTest = (point: Point): string | null => {

    // Check annotations (reverse order to check top elements first)
    for (let i = annotations.length - 1; i >= 0; i--) {
      const ann = annotations[i];
      
      if (ann.type === 'rectangle') {
        const { x, y, width, height } = ann.bounds;
        if (point.x >= x && point.x <= x + width && point.y >= y && point.y <= y + height) {
          return ann.id;
        }
      } else if (ann.type === 'circle') {
        const dist = Math.sqrt(
          Math.pow(point.x - ann.center.x, 2) + Math.pow(point.y - ann.center.y, 2)
        );
        if (dist <= ann.radius + 10) { // 10px tolerance
          return ann.id;
        }
      } else if (ann.type === 'arrow' || ann.type === 'line') {
        // Check if point is near the line
        const dx = ann.end.x - ann.start.x;
        const dy = ann.end.y - ann.start.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const dot = ((point.x - ann.start.x) * dx + (point.y - ann.start.y) * dy) / (length * length);
        
        if (dot >= 0 && dot <= 1) {
          const projX = ann.start.x + dot * dx;
          const projY = ann.start.y + dot * dy;
          const distance = Math.sqrt(Math.pow(point.x - projX, 2) + Math.pow(point.y - projY, 2));
          
          if (distance <= 10) { // 10px tolerance
            return ann.id;
          }
        }
      } else if (ann.type === 'text') {
        // Simple bounding box for text
        const textWidth = (ann.text.length * ann.fontSize) / 2;
        if (point.x >= ann.position.x && point.x <= ann.position.x + textWidth &&
            point.y >= ann.position.y - ann.fontSize && point.y <= ann.position.y) {
          return ann.id;
        }
      } else if (ann.type === 'freehand') {
        // Check if point is near any part of the path
        for (let j = 0; j < ann.points.length - 1; j++) {
          const p1 = ann.points[j];
          const dist = Math.sqrt(Math.pow(point.x - p1.x, 2) + Math.pow(point.y - p1.y, 2));
          if (dist <= 10) {
            return ann.id;
          }
        }
      }
    }

    // Check redactions
    for (let i = redactions.length - 1; i >= 0; i--) {
      const red = redactions[i];
      if (Array.isArray(red.bounds)) continue;
      
      const { x, y, width, height } = red.bounds;
      if (point.x >= x && point.x <= x + width && point.y >= y && point.y <= y + height) {
        return red.id;
      }
    }

    // Check highlights
    for (let i = highlights.length - 1; i >= 0; i--) {
      const high = highlights[i];
      if (Array.isArray(high.bounds)) continue;
      
      const { x, y, width, height } = high.bounds;
      if (point.x >= x && point.x <= x + width && point.y >= y && point.y <= y + height) {
        return high.id;
      }
    }

    return null;
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
          if (textInput?.editingId === annotation.id) break;
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
  }, [redactions, annotations, highlights, image, textInput?.editingId]);

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
    
    // Clear hover state
    setHoverHandle(null);
    
    // Text tool: clicking existing text selects it. Empty canvas opens a new box.
    if (toolSettings.activeTool === 'text') {
      const elementId = hitTest(point);
      const clickedText = annotations.find((ann) => ann.id === elementId && ann.type === 'text');
      if (clickedText && clickedText.type === 'text') {
        textPointerRef.current = {
          id: clickedText.id,
          x: e.clientX,
          y: e.clientY,
          moved: false,
        };
        setSelectedElement(clickedText.id);
        setSelection([clickedText.id]);
        setIsDragging(true);
        setDragOffset({
          x: point.x - clickedText.position.x,
          y: point.y - clickedText.position.y,
        });
        return;
      }

      e.preventDefault();
      const rect = overlayCanvasRef.current?.getBoundingClientRect();
      const screenX = rect ? rect.left + (point.x / imageWidth) * rect.width : e.clientX;
      const screenY = rect ? rect.top + (point.y / imageHeight) * rect.height : e.clientY;
      ignoreBlurUntil.current = Date.now() + 600;
      setTextInput({ position: point, text: '', screenX, screenY });
      setIsEditingText(true);
      return;
    }
    
    // Check if clicking on a resize handle of selected element
    if (selectedElement) {
      const handle = hitTestHandle(point, selectedElement);
      if (handle) {
        setIsResizing(true);
        setResizeHandle(handle);
        const handles = getTransformHandles(selectedElement);
        if (handles) {
          setOriginalBounds(handles.bounds);
        }
        return;
      }
    }

    // Check if clicking on any element (for moving)
    const elementId = hitTest(point);
    if (elementId) {
      setSelectedElement(elementId);
      setSelection([elementId]);
      setIsDragging(true);
      
      // Calculate offset for smooth dragging
      const element = [...annotations, ...redactions, ...highlights].find(e => e.id === elementId);
      if (element) {
        if ('bounds' in element && !Array.isArray(element.bounds)) {
          setDragOffset({
            x: point.x - element.bounds.x,
            y: point.y - element.bounds.y,
          });
        } else if ('start' in element) {
          setDragOffset({
            x: point.x - element.start.x,
            y: point.y - element.start.y,
          });
        } else if ('center' in element) {
          setDragOffset({
            x: point.x - element.center.x,
            y: point.y - element.center.y,
          });
        } else if ('position' in element) {
          setDragOffset({
            x: point.x - element.position.x,
            y: point.y - element.position.y,
          });
        }
      }
      return;
    }

    // No element clicked - deselect and start drawing
    setSelectedElement(null);
    setSelection([]);
    
    // Start drawing new element
    setIsDrawing(true);
    setStartPoint(point);
    setCurrentPoint(point);
    setDrawingPath([point]);
  };

  // Mouse move handler
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = screenToImageCoords(e.clientX, e.clientY);

    if (textPointerRef.current) {
      const dx = e.clientX - textPointerRef.current.x;
      const dy = e.clientY - textPointerRef.current.y;
      if (dx * dx + dy * dy > 16) {
        textPointerRef.current.moved = true;
      }
    }

    // Update hover handle if not currently dragging or resizing
    if (!isDragging && !isResizing && selectedElement) {
      const handle = hitTestHandle(point, selectedElement);
      setHoverHandle(handle);
    }

    // Handle resizing
    if (isResizing && selectedElement && originalBounds && resizeHandle) {
      const element = [...annotations, ...redactions, ...highlights].find(el => el.id === selectedElement);
      if (!element) return;

      let newBounds = { ...originalBounds };

      // Calculate new bounds based on which handle is being dragged
      switch (resizeHandle) {
        case 'top-left':
          newBounds.width = originalBounds.x + originalBounds.width - point.x;
          newBounds.height = originalBounds.y + originalBounds.height - point.y;
          newBounds.x = point.x;
          newBounds.y = point.y;
          break;
        case 'top':
          newBounds.height = originalBounds.y + originalBounds.height - point.y;
          newBounds.y = point.y;
          break;
        case 'top-right':
          newBounds.width = point.x - originalBounds.x;
          newBounds.height = originalBounds.y + originalBounds.height - point.y;
          newBounds.y = point.y;
          break;
        case 'right':
          newBounds.width = point.x - originalBounds.x;
          break;
        case 'bottom-right':
          newBounds.width = point.x - originalBounds.x;
          newBounds.height = point.y - originalBounds.y;
          break;
        case 'bottom':
          newBounds.height = point.y - originalBounds.y;
          break;
        case 'bottom-left':
          newBounds.width = originalBounds.x + originalBounds.width - point.x;
          newBounds.height = point.y - originalBounds.y;
          newBounds.x = point.x;
          break;
        case 'left':
          newBounds.width = originalBounds.x + originalBounds.width - point.x;
          newBounds.x = point.x;
          break;
      }

      // Ensure minimum size
      if (newBounds.width < 10) newBounds.width = 10;
      if (newBounds.height < 10) newBounds.height = 10;

      if ('type' in element && element.type === 'text') {
        const heightScale = newBounds.height / Math.max(1, originalBounds.height);
        const widthScale = newBounds.width / Math.max(1, originalBounds.width);
        const scale = resizeHandle === 'left' || resizeHandle === 'right'
          ? widthScale
          : resizeHandle === 'top' || resizeHandle === 'bottom'
            ? heightScale
            : Math.max(widthScale, heightScale);
        const newSize = Math.round(Math.max(12, Math.min(240, originalBounds.height * scale)));
        updateAnnotation(selectedElement, { fontSize: newSize });
        return;
      }

      // Update element with new bounds
      if ('bounds' in element && !Array.isArray(element.bounds)) {
        if (redactions.find(r => r.id === selectedElement)) {
          updateRedaction(selectedElement, { bounds: newBounds });
        } else if (highlights.find(h => h.id === selectedElement)) {
          updateHighlight(selectedElement, { bounds: newBounds });
        } else {
          updateAnnotation(selectedElement, { bounds: newBounds } as any);
        }
      }
      return;
    }

    // Handle dragging (moving)
    if (isDragging && selectedElement) {
      const newX = point.x - dragOffset.x;
      const newY = point.y - dragOffset.y;

      const annotation = annotations.find(a => a.id === selectedElement);
      if (annotation) {
        if (annotation.type === 'rectangle') {
          const bounds = annotation.bounds as { x: number; y: number; width: number; height: number };
          updateAnnotation(selectedElement, { bounds: { ...bounds, x: newX, y: newY } } as any);
        } else if (annotation.type === 'circle') {
          updateAnnotation(selectedElement, { center: { x: newX, y: newY } } as any);
        } else if (annotation.type === 'arrow' || annotation.type === 'line') {
          const dx = annotation.end.x - annotation.start.x;
          const dy = annotation.end.y - annotation.start.y;
          updateAnnotation(selectedElement, {
            start: { x: newX, y: newY },
            end: { x: newX + dx, y: newY + dy },
          } as any);
        } else if (annotation.type === 'text') {
          updateAnnotation(selectedElement, { position: { x: newX, y: newY } } as any);
        }
        return;
      }

      const redaction = redactions.find(r => r.id === selectedElement);
      if (redaction && !Array.isArray(redaction.bounds)) {
        const bounds = redaction.bounds;
        updateRedaction(selectedElement, { bounds: { ...bounds, x: newX, y: newY } });
        return;
      }

      const highlight = highlights.find(h => h.id === selectedElement);
      if (highlight && !Array.isArray(highlight.bounds)) {
        const bounds = highlight.bounds;
        updateHighlight(selectedElement, { bounds: { ...bounds, x: newX, y: newY } });
        return;
      }
    }

    // Regular drawing mode
    if (!isDrawing) return;

    setCurrentPoint(point);

    // For pen and highlighter, add to path
    if (toolSettings.activeTool === 'pen' || toolSettings.activeTool === 'highlighter') {
      setDrawingPath((prev) => [...prev, point]);
    }

    drawPreview();
  };

  const openTextEditor = (annotationId: string) => {
    const annotation = annotations.find((ann) => ann.id === annotationId && ann.type === 'text');
    if (!annotation || annotation.type !== 'text') return;

    const rect = overlayCanvasRef.current?.getBoundingClientRect();
    const screenX = rect
      ? rect.left + (annotation.position.x / imageWidth) * rect.width
      : 0;
    const screenY = rect
      ? rect.top + (annotation.position.y / imageHeight) * rect.height
      : 0;

    ignoreBlurUntil.current = Date.now() + 600;
    setTextInput({
      position: annotation.position,
      text: annotation.text,
      screenX,
      screenY,
      editingId: annotation.id,
    });
    setIsEditingText(true);
  };

  // Handle text input submission
  const handleTextSubmit = () => {
    if (!textInput || !textInput.text.trim()) {
      setTextInput(null);
      setIsEditingText(false);
      return;
    }

    if (textInput.editingId) {
      updateAnnotation(textInput.editingId, { text: textInput.text });
      setSelectedElement(textInput.editingId);
      setSelection([textInput.editingId]);
      setTextInput(null);
      setIsEditingText(false);
      return;
    }

    const textId = Date.now().toString();
    addAnnotation({
      id: textId,
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

    // Auto-select the text
    setSelectedElement(textId);
    setSelection([textId]);
    setTextInput(null);
    setIsEditingText(false);
  };

  const handleTextBlur = () => {
    if (Date.now() < ignoreBlurUntil.current) {
      textFieldRef.current?.focus();
      return;
    }
    handleTextSubmit();
  };

  useEffect(() => {
    if (!textInput) return;
    const timer = window.setTimeout(() => {
      const field = textFieldRef.current;
      if (!field) return;
      field.focus();
      const end = field.value.length;
      field.setSelectionRange(end, end);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [textInput?.screenX, textInput?.screenY]);

  // Mouse up handler
  const handleMouseUp = () => {
    // Stop resizing
    if (isResizing) {
      setIsResizing(false);
      setResizeHandle(null);
      setOriginalBounds(null);
      return;
    }

    // Stop dragging. A click that did not move opens the text for editing.
    if (isDragging) {
      const pending = textPointerRef.current;
      textPointerRef.current = null;
      setIsDragging(false);
      if (pending && !pending.moved) {
        openTextEditor(pending.id);
      }
      return;
    }

    if (!isDrawing || !startPoint || !currentPoint) return;

    const tool = toolSettings.activeTool;

    // Create element based on tool type
    const newId = Date.now().toString();
    
    switch (tool) {
      case 'rectangle':
        addAnnotation({
          id: newId,
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
          id: newId,
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
          id: newId,
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
          id: newId,
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
          id: newId,
          bounds: drawingPath,
          color: toolSettings.color,
          opacity: toolSettings.opacity,
          layer: { zIndex: 0, visible: true, locked: false },
        });
        break;

      case 'pen':
        addAnnotation({
          id: newId,
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
          id: newId,
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

    // Auto-select the newly created element
    setSelectedElement(newId);
    setSelection([newId]);

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

  // Draw selection highlight and transform handles on overlay
  useEffect(() => {
    if (!overlayCanvasRef.current) return;

    const canvas = overlayCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear overlay if not drawing
    if (!isDrawing && !selectedElement) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    if (!selectedElement || isDrawing || textInput?.editingId === selectedElement) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const handles = getTransformHandles(selectedElement);
    if (!handles) return;

    const bounds = handles.bounds;
    const selected = [...annotations, ...redactions, ...highlights].find((el) => el.id === selectedElement);
    const pad = selected && 'type' in selected && selected.type === 'text' ? 8 : 0;

    // Draw selection box
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(bounds.x - pad, bounds.y - pad, bounds.width + pad * 2, bounds.height + pad * 2);
    ctx.setLineDash([]);

    // Draw transform handles
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2;

    Object.entries(handles).forEach(([name, handle]) => {
      if (name === 'bounds') return;
      const h = handle as { x: number; y: number; width: number; height: number };
      
      // Draw handle
      ctx.fillRect(h.x, h.y, h.width, h.height);
      ctx.strokeRect(h.x, h.y, h.width, h.height);
    });
  }, [selectedElement, annotations, redactions, highlights, isDrawing, textInput?.editingId]);

  const displayWidth = imageWidth * zoom;
  const displayHeight = imageHeight * zoom;

  // Get cursor style based on active tool and hover state
  const getCursorStyle = () => {
    // Resizing cursor
    if (isResizing) {
      switch (resizeHandle) {
        case 'top-left':
        case 'bottom-right':
          return 'nwse-resize';
        case 'top-right':
        case 'bottom-left':
          return 'nesw-resize';
        case 'top':
        case 'bottom':
          return 'ns-resize';
        case 'left':
        case 'right':
          return 'ew-resize';
      }
    }

    // Hovering over resize handle
    if (hoverHandle) {
      switch (hoverHandle) {
        case 'top-left':
        case 'bottom-right':
          return 'nwse-resize';
        case 'top-right':
        case 'bottom-left':
          return 'nesw-resize';
        case 'top':
        case 'bottom':
          return 'ns-resize';
        case 'left':
        case 'right':
          return 'ew-resize';
      }
    }

    // Dragging
    if (isDragging) return 'grabbing';
    
    // Hovering over selected element
    if (selectedElement && !hoverHandle) return 'move';

    // Default tool cursors
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

        {textInput &&
          createPortal(
            <input
              ref={textFieldRef}
              type="text"
              value={textInput.text}
              onMouseDown={(e) => e.stopPropagation()}
              onChange={(e) => {
                setTextInput({ ...textInput, text: e.target.value });
              }}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleTextSubmit();
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  setTextInput(null);
                  setIsEditingText(false);
                }
              }}
              onBlur={handleTextBlur}
              className="fixed z-[1000] px-3 py-2 border-2 border-blue-500 rounded-lg shadow-lg bg-white text-gray-900 outline-none"
              style={{
                left: textInput.screenX,
                top: textInput.screenY,
                fontSize: 18,
                minWidth: 180,
                color: toolSettings.color,
              }}
              placeholder={textInput.editingId ? 'Edit, then Enter' : 'Type, then Enter'}
            />,
            document.body
          )}
      </div>
    </div>
  );
}

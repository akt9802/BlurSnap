import type { Redaction, Annotation, Highlight } from '../types';

export async function exportImage(
  imageUrl: string,
  imageWidth: number,
  imageHeight: number,
  redactions: Redaction[],
  annotations: Annotation[],
  highlights: Highlight[],
  fileName: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Create offscreen canvas
    const canvas = document.createElement('canvas');
    canvas.width = imageWidth;
    canvas.height = imageHeight;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    // Load and draw the image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      // Draw base image
      ctx.drawImage(img, 0, 0, imageWidth, imageHeight);

      // Apply redactions
      redactions.forEach((redaction) => {
        if (!redaction.enabled || Array.isArray(redaction.bounds)) return;

        const { x, y, width, height } = redaction.bounds;

        switch (redaction.style) {
          case 'solid':
            ctx.fillStyle = redaction.color || '#000000';
            ctx.fillRect(x, y, width, height);
            break;

          case 'blur':
            const blurCanvas = document.createElement('canvas');
            blurCanvas.width = width;
            blurCanvas.height = height;
            const blurCtx = blurCanvas.getContext('2d');
            
            if (blurCtx) {
              blurCtx.drawImage(canvas, x, y, width, height, 0, 0, width, height);
              blurCtx.filter = `blur(${redaction.intensity || 10}px)`;
              blurCtx.drawImage(blurCanvas, 0, 0);
              ctx.drawImage(blurCanvas, x, y);
            }
            break;

          case 'pixelate':
            const pixelSize = redaction.intensity || 10;
            const pixelCanvas = document.createElement('canvas');
            pixelCanvas.width = width;
            pixelCanvas.height = height;
            const pixelCtx = pixelCanvas.getContext('2d');
            
            if (pixelCtx) {
              pixelCtx.drawImage(canvas, x, y, width, height, 0, 0, width, height);
              
              for (let py = 0; py < height; py += pixelSize) {
                for (let px = 0; px < width; px += pixelSize) {
                  const pixel = pixelCtx.getImageData(px, py, 1, 1).data;
                  pixelCtx.fillStyle = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
                  pixelCtx.fillRect(px, py, pixelSize, pixelSize);
                }
              }
              
              ctx.drawImage(pixelCanvas, x, y);
            }
            break;
        }
      });

      // Draw highlights
      highlights.forEach((highlight) => {
        if (Array.isArray(highlight.bounds)) {
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
          ctx.fillStyle = highlight.color;
          ctx.globalAlpha = highlight.opacity;
          ctx.fillRect(highlight.bounds.x, highlight.bounds.y, highlight.bounds.width, highlight.bounds.height);
          ctx.globalAlpha = 1;
        }
      });

      // Draw annotations
      annotations.forEach((annotation) => {
        ctx.strokeStyle = 'color' in annotation ? annotation.color : '#000';
        ctx.lineWidth = 'strokeWidth' in annotation ? annotation.strokeWidth : 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        switch (annotation.type) {
          case 'arrow':
            ctx.beginPath();
            ctx.moveTo(annotation.start.x, annotation.start.y);
            ctx.lineTo(annotation.end.x, annotation.end.y);
            ctx.stroke();

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

      // Export as PNG
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Could not create image blob'));
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        // Generate filename: originalname-edited.png (or -edited-1, -edited-2, etc if file exists)
        const baseName = fileName.replace(/\.[^/.]+$/, ''); // Remove extension
        link.download = `${baseName}-edited.png`;
        
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        resolve();
      }, 'image/png');
    };

    img.onerror = () => {
      reject(new Error('Could not load image'));
    };

    img.src = imageUrl;
  });
}

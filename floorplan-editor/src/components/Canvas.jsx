import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import useFloodFill from '../hooks/useFloodFill';
import { TOOLS } from '../hooks/useToolState';

const Canvas = forwardRef(({ selectedImage, historyImageData, toolState, onEditComplete, onInitialDraw }, ref) => {
  const containerRef = useRef(null);
  const imageCanvasRef = useRef(null);
  const textCanvasRef = useRef(null);
  const selectionCanvasRef = useRef(null);
  const [canvasScale, setCanvasScale] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const { floodFill } = useFloodFill();
  
  // State for the text input
  const [textInput, setTextInput] = useState({
    visible: false,
    x: 0,
    y: 0,
    value: '',
    editing: false,
    editingId: null
  });
  
  // State for text dragging
  const [dragState, setDragState] = useState({
    isDragging: false,
    textId: null,
    offsetX: 0,
    offsetY: 0
  });

  // Expose functions through the ref
  useImperativeHandle(ref, () => ({
    saveImage: () => {
      saveImage();
    },
    getImageData: () => {
      return getImageData();
    },
    setImageData: (imageData) => {
      setImageData(imageData);
    },
    drawImage: () => {
      drawImage(false); // Don't trigger initial draw callback on demand
    },
    resetToOriginalImage: () => {
      resetToOriginalImage();
    }
  }));

  // Get the current image data from the canvas
  const getImageData = () => {
    if (!imageCanvasRef.current) return null;
    
    const canvas = imageCanvasRef.current;
    const ctx = canvas.getContext('2d');
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  };
  
  // Set image data to the canvas
  const setImageData = (imageData) => {
    if (!imageCanvasRef.current || !imageData) return;
    
    const canvas = imageCanvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);
  };

  // Reset the canvas to show the original image without any edits
  const resetToOriginalImage = () => {
    if (!imageCanvasRef.current || !selectedImage) return;
    
    drawImage(false);
  };

  const drawImage = (isInitialDraw = true) => {
    const canvas = imageCanvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (selectedImage) {
      const img = new Image();
      img.onload = () => {
        const canvasAspectRatio = canvas.width / canvas.height;
        const imageAspectRatio = img.width / img.height;
        let drawWidth, drawHeight, x, y;

        if (canvasAspectRatio > imageAspectRatio) {
          // Canvas is wider than the image
          drawHeight = canvas.height;
          drawWidth = drawHeight * imageAspectRatio;
          x = (canvas.width - drawWidth) / 2;
          y = 0;
        } else {
          // Canvas is taller than or same aspect as the image
          drawWidth = canvas.width;
          drawHeight = drawWidth / imageAspectRatio;
          x = 0;
          y = (canvas.height - drawHeight) / 2;
        }
        
        ctx.drawImage(img, x, y, drawWidth, drawHeight);
        
        // If we have edited image data from history, apply it now
        if (historyImageData) {
          ctx.putImageData(historyImageData, 0, 0);
        }
        
        // Store the scale information for coordinate mapping
        setCanvasScale({
          x,
          y,
          width: drawWidth,
          height: drawHeight,
          originalWidth: img.width,
          originalHeight: img.height
        });

        if (isInitialDraw && onInitialDraw) {
          onInitialDraw(ctx.getImageData(0, 0, canvas.width, canvas.height));
        }
      };
      img.src = selectedImage.dataUrl;
    }
  };

  // Draw text elements on the text canvas
  const drawTextElements = () => {
    if (!textCanvasRef.current) return;
    
    const canvas = textCanvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear the text canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw each text element
    toolState.textElements.forEach(el => {
      ctx.font = `${el.bold ? 'bold ' : ''}${el.size || 16}px Arial`;
      ctx.fillStyle = el.color || '#000000';
      ctx.fillText(el.text, el.x, el.y);
    });
  };

  // Apply color directly to a given set of pixels
  const applyColorToPixels = (pixels) => {
    if (pixels.length === 0) return;
    
    const canvas = imageCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Convert hex color to RGB
    const hex = toolState.selectedColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Apply the color to each selected pixel
    for (const [x, y] of pixels) {
      if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
        const pos = (y * canvas.width + x) * 4;
        data[pos] = r;
        data[pos + 1] = g;
        data[pos + 2] = b;
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    // Notify that an edit was completed
    if (onEditComplete) onEditComplete();
  };

  // Calculate text dimensions for better hit detection
  const getTextDimensions = (text, size, bold = false) => {
    if (!textCanvasRef.current) return { width: 0, height: 0 };
    
    const ctx = textCanvasRef.current.getContext('2d');
    ctx.font = `${bold ? 'bold ' : ''}${size || 16}px Arial`;
    const metrics = ctx.measureText(text);
    
    // Approximate height since measureText doesn't provide height
    const height = size || 16; // Font size
    
    return {
      width: metrics.width,
      height: height
    };
  };

  // Find a text element at a given position with improved hit detection
  const findTextElementAtPosition = (x, y) => {
    return toolState.textElements.find(el => {
      const { width, height } = getTextDimensions(el.text, el.size, el.bold);
      
      // Check if the point is within the text bounding box
      return (
        x >= el.x && 
        x <= el.x + width && 
        y >= el.y - height && 
        y <= el.y
      );
    });
  };

  // Handle text input submission
  const handleTextSubmit = () => {
    if (!textInput.value.trim()) {
      // Don't add empty text
      setTextInput(prev => ({ ...prev, visible: false }));
      return;
    }

    if (textInput.editing && textInput.editingId) {
      // Update existing text
      toolState.updateTextElement(textInput.editingId, { 
        text: textInput.value, 
        color: toolState.selectedColor 
      });
    } else {
      // Add new text
      toolState.addTextElement(
        textInput.x, 
        textInput.y, 
        textInput.value, 
        toolState.selectedColor, 
        toolState.selectedTextSize,
        toolState.selectedBold
      );
    }

    // Hide the input
    setTextInput(prev => ({ ...prev, visible: false }));

    // Redraw the text canvas to show the new text
    drawTextElements();
    
    // Notify that an edit was completed
    if (onEditComplete) onEditComplete();
  };

  // Handle mouse down event
  const handleMouseDown = (e) => {
    if (!selectedImage) return;
    
    const rect = selectionCanvasRef.current.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);
    
    if (toolState.activeTool === TOOLS.MAGIC_BRUSH) {
      // Perform flood fill and apply color immediately
      const pixels = floodFill(imageCanvasRef.current, x, y, 5); // 5 is the color tolerance
      if (pixels.length > 0) {
        applyColorToPixels(pixels);
      }
    } else if (toolState.activeTool === TOOLS.TEXT) {
      // Check if the click is near an existing text element
      const clickedTextElement = findTextElementAtPosition(x, y);
      
      if (clickedTextElement) {
        // Edit existing text
        setTextInput({
          visible: true,
          x: clickedTextElement.x,
          y: clickedTextElement.y,
          value: clickedTextElement.text,
          editing: true,
          editingId: clickedTextElement.id
        });
      } else {
        // Add new text
        setTextInput({
          visible: true,
          x,
          y,
          value: '',
          editing: false,
          editingId: null
        });
      }
    } else if (toolState.activeTool === TOOLS.POINTER) {
      // Check if we're clicking on a text element
      const clickedTextElement = findTextElementAtPosition(x, y);
      
      if (clickedTextElement) {
        // Start dragging
        setDragState({
          isDragging: true,
          textId: clickedTextElement.id,
          offsetX: clickedTextElement.x - x,
          offsetY: clickedTextElement.y - y
        });
      }
    }
  };
  
  // Handle mouse move for dragging text
  const handleMouseMove = (e) => {
    if (!dragState.isDragging || toolState.activeTool !== TOOLS.POINTER) return;
    
    const rect = selectionCanvasRef.current.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);
    
    // Update text position
    const newX = x + dragState.offsetX;
    const newY = y + dragState.offsetY;
    
    toolState.moveTextElement(dragState.textId, newX, newY);
    
    // Only redraw the text canvas, not the image canvas
    drawTextElements();
  };
  
  // Handle mouse up to end dragging
  const handleMouseUp = () => {
    if (dragState.isDragging) {
      setDragState({
        isDragging: false,
        textId: null,
        offsetX: 0,
        offsetY: 0
      });
      
      // Notify that an edit was completed
      if (onEditComplete) onEditComplete();
    }
  };

  // Save the image as a download
  const saveImage = () => {
    if (!imageCanvasRef.current || !textCanvasRef.current) return;
    
    // Create a temporary canvas to combine image and text
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    // Set dimensions to match the image canvas
    tempCanvas.width = imageCanvasRef.current.width;
    tempCanvas.height = imageCanvasRef.current.height;
    
    // Draw the image canvas content (which includes the image and any color changes)
    tempCtx.drawImage(imageCanvasRef.current, 0, 0);
    
    // Draw the text canvas content on top
    tempCtx.drawImage(textCanvasRef.current, 0, 0);
    
    // Create a download link
    const link = document.createElement('a');
    link.download = 'floor-plan-edited.png';
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
  };

  // We'll use a ResizeObserver to keep the canvases' dimensions in sync with their container.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(entries => {
      const entry = entries[0];
      const { width, height } = entry.contentRect;
      
      imageCanvasRef.current.width = width;
      imageCanvasRef.current.height = height;
      textCanvasRef.current.width = width;
      textCanvasRef.current.height = height;
      selectionCanvasRef.current.width = width;
      selectionCanvasRef.current.height = height;
      
      drawImage(false); // On resize, just redraw without triggering initial draw
      drawTextElements();
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [selectedImage]);

  // Effect to draw the image initially and when it changes, and clear selections
  useEffect(() => {
    if (selectedImage) {
      drawImage();
      // Also redraw other elements
      drawTextElements();
    }
  }, [selectedImage]);

  // Effect to focus the text input when it becomes visible
  useEffect(() => {
    if (textInput.visible) {
      // We need to wait for the input to be rendered
      setTimeout(() => {
        const input = document.getElementById('text-input');
        if (input) {
          input.focus();
        }
      }, 0);
    }
  }, [textInput.visible]);

  // Effect to redraw text elements when they change
  useEffect(() => {
    if (selectedImage) {
      drawTextElements();
    }
  }, [toolState.textElements]);

  useEffect(() => {
    if (historyImageData && imageCanvasRef.current) {
      const ctx = imageCanvasRef.current.getContext('2d');
      ctx.putImageData(historyImageData, 0, 0);
    }
  }, [historyImageData]);

  return (
    <div ref={containerRef} className="flex-grow bg-gray-700 relative overflow-hidden">
      <canvas
        ref={imageCanvasRef}
        className="absolute top-0 left-0"
        style={{ zIndex: 1 }}
      />
      <canvas
        ref={textCanvasRef}
        className="absolute top-0 left-0"
        style={{ zIndex: 2 }}
      />
      <canvas
        ref={selectionCanvasRef}
        className="absolute top-0 left-0"
        style={{ 
          zIndex: 3, 
          cursor: toolState.activeTool === TOOLS.POINTER ? 'move' :
                  toolState.activeTool === TOOLS.MAGIC_BRUSH ? 'crosshair' : 
                  toolState.activeTool === TOOLS.TEXT ? 'text' : 'default',
          pointerEvents: toolState.activeTool === TOOLS.MAGIC_BRUSH || toolState.activeTool === TOOLS.POINTER || toolState.activeTool === TOOLS.TEXT ? 'auto' : 'none'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      {textInput.visible && (
        <input
          id="text-input"
          type="text"
          className="absolute bg-white border border-gray-300 p-1"
          style={{
            left: `${textInput.x}px`,
            top: `${textInput.y - 20}px`,
            zIndex: 4,
            minWidth: '100px'
          }}
          value={textInput.value}
          onChange={(e) => setTextInput(prev => ({ ...prev, value: e.target.value }))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleTextSubmit();
            } else if (e.key === 'Escape') {
              setTextInput(prev => ({ ...prev, visible: false }));
            }
          }}
          onBlur={handleTextSubmit}
        />
      )}
    </div>
  );
});

export default Canvas; 
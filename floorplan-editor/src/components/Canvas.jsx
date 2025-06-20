import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { AnimatePresence } from 'framer-motion';
import useFloodFill from '../hooks/useFloodFill';
import { TOOLS } from '../hooks/useToolState';
import { useToolContext } from '../contexts/ToolContext';
import TextInput from './TextInput';
import LoadingOverlay from './LoadingOverlay';
import ContextualFillButton from './ContextualFillButton';
import NoImagePlaceholder from './NoImagePlaceholder';
import { hexToRgb } from '../utils/colorUtils';
import { calculateImageDimensions, getColorAtPosition } from '../utils/canvasUtils';

const Canvas = forwardRef(({ selectedImage, historyImageData, onEditComplete, onInitialDraw }, ref) => {
  const toolState = useToolContext();
  const containerRef = useRef(null);
  const imageCanvasRef = useRef(null);
  const textCanvasRef = useRef(null);
  const selectionCanvasRef = useRef(null);
  const [canvasScale, setCanvasScale] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(false);
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

  // State for marquee selection rectangle
  const [selectionRect, setSelectionRect] = useState(null); // { x, y, width, height }
  const [isSelectingRect, setIsSelectingRect] = useState(false);

  // Expose functions through the ref
  useImperativeHandle(ref, () => ({
    saveImage,
    getImageData,
    setImageData,
    drawImage: () => drawImage(false),
    resetToOriginalImage,
    fillSelection
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
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (selectedImage) {
      setIsLoading(true);
      const img = new Image();
      img.onload = () => {
        const { x, y, width: drawWidth, height: drawHeight } = calculateImageDimensions(
          canvas.width, 
          canvas.height, 
          img.width, 
          img.height
        );
        
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
        
        setIsLoading(false);
      };
      
      img.onerror = () => {
        setIsLoading(false);
        // Could add an error state here
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
    const { r, g, b } = hexToRgb(toolState.selectedColor);
    
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

  // Handle deleting a text element
  const handleTextDelete = () => {
    if (!textInput.editing || !textInput.editingId) return;

    // Use the delete function from the tool state hook
    toolState.deleteTextElement(textInput.editingId);

    // Hide the input popup
    setTextInput({ visible: false, value: '', editing: false, editingId: null });
    
    // Notify that an edit was completed
    if (onEditComplete) onEditComplete();
  };

  // Get pointer position (works for both mouse and touch)
  const getPointerPosition = (e) => {
    const rect = selectionCanvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    return {
      x: Math.floor(clientX - rect.left),
      y: Math.floor(clientY - rect.top)
    };
  };

  // Handle pointer down event (mouse down or touch start)
  const handlePointerDown = (e) => {
    if (!selectedImage) return;
    
    const { x, y } = getPointerPosition(e);
    
    if (toolState.activeTool === TOOLS.MAGIC_BRUSH) {
      // Show loading indicator during processing
      setIsLoading(true);
      
      // Use setTimeout to allow the loading indicator to render
      setTimeout(() => {
        // Perform flood fill and apply color immediately
        const pixels = floodFill(imageCanvasRef.current, x, y, 5); // 5 is the color tolerance
        if (pixels.length > 0) {
          applyColorToPixels(pixels);
        }
        setIsLoading(false);
      }, 10);
    } else if (toolState.activeTool === TOOLS.COLOR_PICKER) {
      // Get color at clicked position
      if (!imageCanvasRef.current) return;
      const ctx = imageCanvasRef.current.getContext('2d');
      const color = getColorAtPosition(ctx, x, y);
      
      if (color) {
        toolState.setSelectedColor(color);
        // Show a brief visual feedback
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 300);
      }
    } else if (toolState.activeTool === TOOLS.MARQUEE_SELECT) {
      // Start a new selection rectangle
      setSelectionRect({ x, y, width: 0, height: 0 });
      setIsSelectingRect(true);
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
  
  // Handle pointer move for dragging text
  const handlePointerMove = (e) => {
    const { x, y } = getPointerPosition(e);

    if (toolState.activeTool === TOOLS.MARQUEE_SELECT && isSelectingRect) {
      // Update selection rectangle dimensions
      setSelectionRect(prev => prev ? { ...prev, width: x - prev.x, height: y - prev.y } : prev);
      drawSelectionVisualization();
      return;
    }

    if (!dragState.isDragging || toolState.activeTool !== TOOLS.POINTER) return;

    // Update text position
    const newX = x + dragState.offsetX;
    const newY = y + dragState.offsetY;
    
    toolState.moveTextElement(dragState.textId, newX, newY);
    
    // Only redraw the text canvas, not the image canvas
    drawTextElements();
  };
  
  // Handle pointer up to end dragging
  const handlePointerUp = () => {
    if (isSelectingRect && toolState.activeTool === TOOLS.MARQUEE_SELECT) {
      setIsSelectingRect(false);
      drawSelectionVisualization(); // Ensure final rectangle drawn
      return;
    }
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
    
    setIsLoading(true);
    
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
    
    // Small delay to ensure UI updates
    setTimeout(() => {
      setIsLoading(false);
      link.click();
    }, 100);
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

  // Redraw selection visualization whenever the selection rectangle changes
  useEffect(() => {
    drawSelectionVisualization();
  }, [selectionRect]);

  // Clear selection when switching away from marquee select tool
  useEffect(() => {
    if (toolState.activeTool !== TOOLS.MARQUEE_SELECT) {
      setSelectionRect(null);
      clearSelectionVisualization();
    }
  }, [toolState.activeTool]);

  // Determine cursor style based on active tool
  const getCursorStyle = () => {
    switch (toolState.activeTool) {
      case TOOLS.MAGIC_BRUSH:
        return 'crosshair';
      case TOOLS.TEXT:
        return 'text';
      case TOOLS.COLOR_PICKER:
        return 'copy';
      case TOOLS.MARQUEE_SELECT:
        return 'crosshair';
      default:
        return 'default';
    }
  };

  // Compute position for contextual fill button
  const getFillButtonPosition = () => {
    if (!selectionRect || isSelectingRect || toolState.activeTool !== TOOLS.MARQUEE_SELECT) return null;
    const rectX = selectionRect.width < 0 ? selectionRect.x + selectionRect.width : selectionRect.x;
    const rectY = selectionRect.height < 0 ? selectionRect.y + selectionRect.height : selectionRect.y;
    const rectW = Math.abs(selectionRect.width);
    const offset = 8;
    const btnX = rectX + rectW + offset;
    const btnY = Math.max(0, rectY - 40); // 40px above rect
    return { x: btnX, y: btnY };
  };

  // Fill the current selection rectangle with the selected color
  function fillSelection() {
    if (!selectionRect || !imageCanvasRef.current) return;

    const canvas = imageCanvasRef.current;
    const ctx = canvas.getContext('2d');

    // Determine normalized rectangle (handle negative width/height)
    const rectX = selectionRect.width < 0 ? selectionRect.x + selectionRect.width : selectionRect.x;
    const rectY = selectionRect.height < 0 ? selectionRect.y + selectionRect.height : selectionRect.y;
    const rectW = Math.abs(selectionRect.width);
    const rectH = Math.abs(selectionRect.height);

    // Clamp to canvas bounds
    const x = Math.max(0, rectX);
    const y = Math.max(0, rectY);
    const w = Math.min(rectW, canvas.width - x);
    const h = Math.min(rectH, canvas.height - y);

    if (w === 0 || h === 0) return;

    ctx.fillStyle = toolState.selectedColor;
    ctx.fillRect(x, y, w, h);

    // Clear the selection visualization
    clearSelectionVisualization();
    setSelectionRect(null);

    // Notify that an edit was completed
    if (onEditComplete) onEditComplete();
  }

  // Clear selection rectangle drawing from the selection canvas
  const clearSelectionVisualization = () => {
    if (!selectionCanvasRef.current) return;
    const sctx = selectionCanvasRef.current.getContext('2d');
    sctx.clearRect(0, 0, selectionCanvasRef.current.width, selectionCanvasRef.current.height);
  };

  // Draw selection rectangle visualization
  const drawSelectionVisualization = () => {
    if (!selectionCanvasRef.current) return;
    const sctx = selectionCanvasRef.current.getContext('2d');
    sctx.clearRect(0, 0, selectionCanvasRef.current.width, selectionCanvasRef.current.height);

    if (!selectionRect) return;

    sctx.setLineDash([6]);
    sctx.lineWidth = 1;
    sctx.strokeStyle = 'rgba(59,130,246,0.9)'; // blue-ish

    const rectX = selectionRect.width < 0 ? selectionRect.x + selectionRect.width : selectionRect.x;
    const rectY = selectionRect.height < 0 ? selectionRect.y + selectionRect.height : selectionRect.y;
    const rectW = Math.abs(selectionRect.width);
    const rectH = Math.abs(selectionRect.height);

    sctx.strokeRect(rectX, rectY, rectW, rectH);
  };

  return (
    <div
      ref={containerRef}
      className="flex-grow relative overflow-hidden transition-colors duration-300 bg-light-canvas-bg dark:bg-dark-canvas-bg bg-cover bg-center"
    >
      {/* Canvas layers */}
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
        className={`absolute top-0 left-0 ${getCursorStyle()}`}
        style={{ 
          zIndex: 3,
          pointerEvents: [TOOLS.MAGIC_BRUSH, TOOLS.POINTER, TOOLS.TEXT, TOOLS.COLOR_PICKER, TOOLS.MARQUEE_SELECT].includes(toolState.activeTool) ? 'auto' : 'none'
        }}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      />

      {/* Component layers */}
      <LoadingOverlay isLoading={isLoading} />
      
      <AnimatePresence>
        <TextInput 
          textInput={textInput}
          onTextChange={(value) => setTextInput(prev => ({ ...prev, value }))}
          onSubmit={handleTextSubmit}
          onCancel={() => setTextInput(prev => ({ ...prev, visible: false }))}
          onDelete={handleTextDelete}
        />
      </AnimatePresence>

      {!selectedImage && <NoImagePlaceholder />}
      
      <ContextualFillButton 
        position={getFillButtonPosition()} 
        onClick={fillSelection} 
      />
    </div>
  );
});

export default Canvas; 
import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useFloodFill from '../hooks/useFloodFill';
import { TOOLS } from '../hooks/useToolState';
import { FaSpinner, FaFont, FaCheck, FaTimes } from 'react-icons/fa';

const Canvas = forwardRef(({ selectedImage, historyImageData, toolState, onEditComplete, onInitialDraw }, ref) => {
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
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (selectedImage) {
      setIsLoading(true);
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

  // Get color at a specific position on the canvas
  const getColorAtPosition = (x, y) => {
    if (!imageCanvasRef.current) return null;
    
    const canvas = imageCanvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Get pixel data at the clicked position
    const pixelData = ctx.getImageData(x, y, 1, 1).data;
    
    // Convert RGB to hex
    const r = pixelData[0];
    const g = pixelData[1];
    const b = pixelData[2];
    
    // Format as hex color
    const hex = '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
    
    return hex;
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
      const color = getColorAtPosition(x, y);
      if (color) {
        toolState.setSelectedColor(color);
        // Show a brief visual feedback
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 300);
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
  
  // Handle pointer move for dragging text
  const handlePointerMove = (e) => {
    if (!dragState.isDragging || toolState.activeTool !== TOOLS.POINTER) return;
    
    const { x, y } = getPointerPosition(e);
    
    // Update text position
    const newX = x + dragState.offsetX;
    const newY = y + dragState.offsetY;
    
    toolState.moveTextElement(dragState.textId, newX, newY);
    
    // Only redraw the text canvas, not the image canvas
    drawTextElements();
  };
  
  // Handle pointer up to end dragging
  const handlePointerUp = () => {
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

  // Determine cursor style based on active tool
  const getCursorStyle = () => {
    switch (toolState.activeTool) {
      case TOOLS.MAGIC_BRUSH:
        return 'crosshair';
      case TOOLS.TEXT:
        return 'text';
      case TOOLS.COLOR_PICKER:
        return 'copy';
      default:
        return 'default';
    }
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
          pointerEvents: toolState.activeTool === TOOLS.MAGIC_BRUSH || toolState.activeTool === TOOLS.POINTER || toolState.activeTool === TOOLS.TEXT || toolState.activeTool === TOOLS.COLOR_PICKER ? 'auto' : 'none'
        }}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-70 dark:bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-20">
          <motion.div 
            className="p-4 rounded-full bg-white dark:bg-gray-800"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          >
            <FaSpinner className="text-primary-500 dark:text-primary-400 text-2xl" />
          </motion.div>
        </div>
      )}

      {/* Text input popup */}
      <AnimatePresence>
        {textInput.visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 border border-gray-200 dark:border-gray-700"
            style={{
              left: `${textInput.x}px`,
              top: `${textInput.y - 60}px`,
              width: '220px'
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {textInput.editing ? 'Edit Text' : 'Add Text'}
              </div>
              <button 
                onClick={() => setTextInput({ ...textInput, visible: false })}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            <input
              id="text-input"
              type="text"
              className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary-300 dark:focus:ring-primary-700 focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none transition-colors"
              value={textInput.value}
              onChange={(e) => setTextInput(prev => ({ ...prev, value: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleTextSubmit();
                }
              }}
              placeholder="Enter text..."
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleTextSubmit}
                className="px-3 py-1.5 bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 text-white rounded-md hover:shadow-sm flex items-center text-sm transition-colors"
                disabled={!textInput.value.trim()}
              >
                <FaCheck className="mr-1" /> 
                {textInput.editing ? 'Update' : 'Add'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No image placeholder */}
      {!selectedImage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-400 dark:text-gray-500">
            <FaFont className="mx-auto text-5xl mb-3 opacity-30" />
            <p className="text-lg font-medium">Select or upload a floor plan to edit</p>
            <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">The canvas will display your selected image</p>
          </div>
        </div>
      )}

      {/* Tool hint overlay - show based on active tool */}
      {selectedImage && !textInput.visible && !isLoading && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-black bg-opacity-70 dark:bg-opacity-90 text-white text-sm rounded-full z-10 pointer-events-none">
            
          </div>
        )}
    </div>
  );
});

export default Canvas; 
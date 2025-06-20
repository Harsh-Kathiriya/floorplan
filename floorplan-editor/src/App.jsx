import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Toolbar from './components/Toolbar';
import Canvas from './components/Canvas';
import useToolState from './hooks/useToolState';

function App() {
  // Basic state for images
  const [images, setImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  
  // Reference to the canvas component
  const canvasRef = useRef();
  
  // Tool state for the editor
  const toolState = useToolState();
  
  // Enhanced edit history state - stores ALL state for each image
  // Format: { [imageId]: { history: [], currentIndex: 0 } }
  // where history is an array of states, each containing:
  // - textElements: array of text elements
  // - imageData: canvas image data (or null for initial state)
  // - selections: array of selections
  const [editHistory, setEditHistory] = useState({});
  
  // Helper to get the current image ID
  const getCurrentImageId = () => {
    if (selectedImageIndex === null || !images[selectedImageIndex]) return null;
    return images[selectedImageIndex].id;
  };
  
  // Helper to get the current history entry
  const getCurrentHistoryEntry = () => {
    const imageId = getCurrentImageId();
    if (!imageId || !editHistory[imageId]) return null;
    
    const { history, currentIndex } = editHistory[imageId];
    return history[currentIndex] || null;
  };
  
  // Initialize history for a new image
  const initializeHistory = (imageId, initialTextElements = []) => {
    setEditHistory(prev => ({
      ...prev,
      [imageId]: {
        history: [{
          textElements: initialTextElements,
          imageData: null, // Initial state has no image modifications
          selectedTextSize: 16,
          selectedBold: false
        }],
        currentIndex: 0
      }
    }));
  };
  
  // Record a new edit in the history
  const recordEdit = () => {
    const imageId = getCurrentImageId();
    if (!imageId) return;
    
    // Get current canvas state
    const imageData = canvasRef.current?.getImageData() || null;
    
    // Create new history entry
    const newEntry = {
      textElements: [...toolState.textElements],
      imageData,
      selectedTextSize: toolState.selectedTextSize,
      selectedBold: toolState.selectedBold
    };
    
    const areEntriesEqual = (a, b) => {
      if (!a || !b) return false;
      if (a.selectedTextSize !== b.selectedTextSize) return false;
      if (a.selectedBold !== b.selectedBold) return false;
      // Compare textElements
      if (a.textElements.length !== b.textElements.length) return false;
      for (let i = 0; i < a.textElements.length; i++) {
        if (JSON.stringify(a.textElements[i]) !== JSON.stringify(b.textElements[i])) {
          return false;
        }
      }
      // Compare imageData dimensions
      if (a.imageData && b.imageData) {
        if (a.imageData.width !== b.imageData.width || a.imageData.height !== b.imageData.height) {
          return false;
        }
        // Sample pixels every 1000th byte to avoid heavy compare
        const dataA = a.imageData.data;
        const dataB = b.imageData.data;
        const len = dataA.length;
        for (let idx = 0; idx < len; idx += 4000) { // every 1000 pixels (4 bytes each)
          if (dataA[idx] !== dataB[idx]) return false;
        }
      } else if (a.imageData || b.imageData) {
        // One has imageData, other null
        return false;
      }
      return true;
    };

    setEditHistory(prev => {
      const imageHistory = prev[imageId] || { history: [], currentIndex: -1 };
      const { history, currentIndex } = imageHistory;
      
      const lastEntry = history[currentIndex];
      if (areEntriesEqual(lastEntry, newEntry)) {
        // No actual changes, skip recording
        return prev;
      }

      // Remove any future history that would be lost by this new edit
      const newHistory = history.slice(0, currentIndex + 1);
      
      return {
        ...prev,
        [imageId]: {
          history: [...newHistory, newEntry],
          currentIndex: newHistory.length
        }
      };
    });
  };
  
  // Apply a history entry to the canvas and tool state
  const applyHistoryEntry = (entry) => {
    if (!entry) return;
    
    // Update tool state
    toolState.setTextElements(entry.textElements);
    toolState.setSelectedTextSize(entry.selectedTextSize || 16);
    toolState.setSelectedBold(entry.selectedBold || false);
    
    // No longer set image data here; Canvas will handle applying historyImageData prop.
  };
  
  // Handle undo action
  const handleUndo = () => {
    const imageId = getCurrentImageId();
    if (!imageId) return;
    
    setEditHistory(prev => {
      const imageHistory = prev[imageId];
      if (!imageHistory || imageHistory.currentIndex <= 0) return prev;
      
      const newIndex = imageHistory.currentIndex - 1;
      const entryToApply = imageHistory.history[newIndex];
      
      // Apply the previous state
      applyHistoryEntry(entryToApply);
      
      return {
        ...prev,
        [imageId]: {
          ...imageHistory,
          currentIndex: newIndex
        }
      };
    });
  };
  
  // Handle redo action
  const handleRedo = () => {
    const imageId = getCurrentImageId();
    if (!imageId) return;
    
    setEditHistory(prev => {
      const imageHistory = prev[imageId];
      if (!imageHistory || imageHistory.currentIndex >= imageHistory.history.length - 1) return prev;
      
      const newIndex = imageHistory.currentIndex + 1;
      const entryToApply = imageHistory.history[newIndex];
      
      // Apply the next state
      applyHistoryEntry(entryToApply);
      
      return {
        ...prev,
        [imageId]: {
          ...imageHistory,
          currentIndex: newIndex
        }
      };
    });
  };
  
  // Handle image upload
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const newImagesData = [];

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const imageId = `image-${Date.now()}-${newImagesData.length}`;
          newImagesData.push({
            id: imageId,
            name: file.name,
            dataUrl: e.target.result,
            width: img.width,
            height: img.height,
          });

          // Initialize history for this new image
          initializeHistory(imageId);

          if (newImagesData.length === files.length) {
            const allNewImages = [...images, ...newImagesData];
            setImages(allNewImages);
            if (selectedImageIndex === null) {
              setSelectedImageIndex(images.length);
            }
          }
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle image selection
  const handleImageSelect = (index) => {
    if (index === selectedImageIndex) return;
    
    // Save current state before switching
    const currentImageId = getCurrentImageId();
    if (currentImageId) {
      recordEdit();
    }
    
    setSelectedImageIndex(index);
    
    // Load the selected image's state
    if (index !== null && images[index]) {
      const newImageId = images[index].id;
      
      // Initialize history if it doesn't exist
      if (!editHistory[newImageId]) {
        initializeHistory(newImageId);
        // Clear text elements for new image with no history
        toolState.setTextElements([]);
      } else {
        // Apply the current history entry for this image
        const imageHistory = editHistory[newImageId];
        const currentEntry = imageHistory.history[imageHistory.currentIndex];
        applyHistoryEntry(currentEntry); // Will update text and other states; Canvas applies image later
      }
    }
  };
  
  // Handle initial image draw
  const handleInitialDraw = (imageData) => {
    const imageId = getCurrentImageId();
    if (!imageId) return;
    
    // If this is the first edit and we don't have image data yet,
    // update the initial history entry with the image data
    setEditHistory(prev => {
      const imageHistory = prev[imageId];
      if (!imageHistory || imageHistory.history.length !== 1 || imageHistory.currentIndex !== 0) {
        return prev;
      }
      
      const updatedEntry = {
        ...imageHistory.history[0],
        imageData
      };
      
      return {
        ...prev,
        [imageId]: {
          history: [updatedEntry],
          currentIndex: 0
        }
      };
    });
  };
  
  // Save the current image
  const saveImage = () => {
    if (canvasRef.current) {
      canvasRef.current.saveImage();
    }
  };
  
  // Set up keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
            handleRedo();
          } else {
            handleUndo();
          }
        } else if (e.key === 'y') {
          e.preventDefault();
          handleRedo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  // Determine if undo/redo are available
  const canUndo = () => {
    const imageId = getCurrentImageId();
    if (!imageId || !editHistory[imageId]) return false;
    return editHistory[imageId].currentIndex > 0;
  };
  
  const canRedo = () => {
    const imageId = getCurrentImageId();
    if (!imageId || !editHistory[imageId]) return false;
    return editHistory[imageId].currentIndex < editHistory[imageId].history.length - 1;
  };
  
  const selectedImage = selectedImageIndex !== null ? images[selectedImageIndex] : null;
  const currentHistoryEntry = getCurrentHistoryEntry();

  return (
    <div className="h-screen w-screen bg-gray-200 flex flex-col font-sans">
      <header className="bg-white shadow-md z-10">
        <h1 className="text-xl font-bold p-4">Floor Plan Editor</h1>
      </header>
      <div className="flex flex-grow overflow-hidden">
        <Sidebar 
          images={images} 
          onImageUpload={handleImageUpload}
          onImageSelect={handleImageSelect}
          selectedImageIndex={selectedImageIndex}
        />
        <main className="flex-grow flex flex-col">
          <Toolbar 
            activeTool={toolState.activeTool}
            setActiveTool={toolState.setActiveTool}
            selectedColor={toolState.selectedColor}
            setSelectedColor={toolState.setSelectedColor}
            selectedTextSize={toolState.selectedTextSize}
            setSelectedTextSize={toolState.setSelectedTextSize}
            selectedBold={toolState.selectedBold}
            setSelectedBold={toolState.setSelectedBold}
            saveImage={saveImage}
            undo={handleUndo}
            redo={handleRedo}
            canUndo={canUndo()}
            canRedo={canRedo()}
          />
          <Canvas 
            ref={canvasRef}
            selectedImage={selectedImage} 
            historyImageData={currentHistoryEntry?.imageData || null}
            toolState={toolState}
            onEditComplete={recordEdit}
            onInitialDraw={handleInitialDraw}
          />
        </main>
      </div>
      </div>
  );
}

export default App;

import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaBars, FaTimes, FaChevronLeft, FaChevronRight, FaInfoCircle, FaHome } from 'react-icons/fa';
import Sidebar from './components/Sidebar';
import Toolbar from './components/Toolbar';
import Canvas from './components/Canvas';
import useToolState from './hooks/useToolState';
import DeveloperInfo from './components/DeveloperInfo';
import ThemeToggle, { useTheme } from './components/ThemeToggle';
import SaveDialog from './components/SaveDialog';

function App() {
  // Basic state for images
  const [images, setImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  
  // Reference to the canvas component
  const canvasRef = useRef();
  
  // Tool state for the editor
  const toolState = useToolState();
  
  // State for responsive sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Enhanced edit history state - stores ALL state for each image
  // Format: { [imageId]: { history: [], currentIndex: 0 } }
  // where history is an array of states, each containing:
  // - textElements: array of text elements
  // - imageData: canvas image data (or null for initial state)
  // - selections: array of selections
  const [editHistory, setEditHistory] = useState({});
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  
  // Get theme context
  const { theme } = useTheme();
  
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
  
  // Handle deleting an image from the sidebar
  const handleImageDelete = (indexToDelete) => {
    if (!images[indexToDelete]) return;

    const imageToDelete = images[indexToDelete];
    // Use a simple confirmation dialog
    if (!window.confirm(`Are you sure you want to delete "${imageToDelete.name}"? This action cannot be undone.`)) {
      return;
    }

    const imageIdToDelete = imageToDelete.id;

    // Filter out the deleted image
    const newImages = images.filter((_, index) => index !== indexToDelete);
    
    // Remove the history for the deleted image
    const newEditHistory = { ...editHistory };
    delete newEditHistory[imageIdToDelete];

    // Update state
    setImages(newImages);
    setEditHistory(newEditHistory);

    // Adjust the selected image index after deletion
    if (selectedImageIndex === indexToDelete) {
      // If the active image was deleted, select a new one
      if (newImages.length === 0) {
        setSelectedImageIndex(null); // No images left
      } else if (indexToDelete >= newImages.length) {
        // If the last image was deleted, select the new last one
        setSelectedImageIndex(newImages.length - 1);
      } else {
        // An image in the middle was deleted, select the one now at the same index
        handleImageSelect(indexToDelete);
      }
    } else if (selectedImageIndex > indexToDelete) {
      // If an image before the active one was deleted, decrement the index
      setSelectedImageIndex(prevIndex => prevIndex - 1);
    }
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
      
      // Auto-close sidebar on mobile after selecting an image
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
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
      // Show confirmation dialog
      setIsSaveDialogOpen(true);
    }
  };
  
  // Set up keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Use 'metaKey' for Command on Mac, and 'ctrlKey' for Control on other OS
      const isModifier = e.metaKey || e.ctrlKey;

      if (isModifier && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      } else if (isModifier && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleUndo, handleRedo]);

  // Check window size to set initial sidebar state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
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

  // Toggle sidebar function
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="h-screen w-screen bg-gray-50 dark:bg-dark-canvas flex flex-col font-sans overflow-hidden transition-colors duration-300">
      {/* App Header */}
      <header className="bg-white dark:bg-dark-sidebar border-b border-gray-200 dark:border-dark-border shadow-sm z-20 transition-colors duration-300">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={toggleSidebar}
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 md:hidden transition-colors duration-300"
                aria-label="Toggle sidebar"
              >
                {isSidebarOpen ? <FaTimes /> : <FaBars />}
              </button>
              <div className="flex items-center gap-2">
                <FaHome className="text-primary-600 dark:text-primary-400 text-xl" />
                <h1 className="text-xl font-bold text-gray-800 dark:text-white tracking-tight">
                  Floor Plan Editor
                </h1>
              </div>
            </div>
            
            <div className="flex-grow flex justify-center items-center px-4">
              <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs text-center">
                {selectedImage ? `Editing: ${selectedImage.name}` : 'No image selected'}
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center space-x-4">
               <ThemeToggle />
               <button
                 onClick={() => setIsInfoModalOpen(true)}
                 className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-3 py-1.5 rounded-md text-sm font-medium shadow-sm transition-all duration-150"
                 title="About the developer"
               >
                 About Me
               </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-grow overflow-hidden relative">
        {/* Sidebar - Animated for mobile */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ x: -320 }} 
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", bounce: 0.1, duration: 0.5 }}
              className="absolute md:relative z-20 h-full md:block"
            >
              <Sidebar 
                images={images} 
                onImageUpload={handleImageUpload}
                onImageSelect={handleImageSelect}
                selectedImageIndex={selectedImageIndex}
                onClose={() => setIsSidebarOpen(false)}
                onDeleteImage={handleImageDelete}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sidebar Toggle Button - Visible on larger screens */}
        <div 
          className="hidden md:flex absolute left-0 top-1/2 transform -translate-y-1/2 z-30"
          style={{ marginLeft: isSidebarOpen ? '260px' : '0px' }}
        >
          <button
            onClick={toggleSidebar}
            className="bg-white dark:bg-dark-sidebar rounded-r-md p-1 shadow-md border border-l-0 border-gray-200 dark:border-dark-border text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300"
          >
            {isSidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
          </button>
        </div>

        {/* Semi-transparent overlay for mobile when sidebar is open */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-10 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

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

      {/* Empty image state - show only when sidebar is closed on mobile and no image selected */}
      {!selectedImage && !isSidebarOpen && (
        <div className="absolute inset-0 flex items-center justify-center z-5">
          <div className="text-center p-8 bg-white dark:bg-dark-card rounded-xl shadow-xl max-w-md mx-auto border border-gray-100 dark:border-dark-border transition-colors duration-300">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaHome className="text-2xl text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">No Floor Plan Selected</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Open the sidebar to upload or select a floor plan to edit</p>
            <button 
              onClick={toggleSidebar} 
              className="bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 text-white font-medium py-2.5 px-5 rounded-lg transition-colors shadow-sm"
            >
              <FaBars className="inline mr-2" /> Open Sidebar
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {isInfoModalOpen && (
          <DeveloperInfo onClose={() => setIsInfoModalOpen(false)} />
        )}
        {isSaveDialogOpen && (
          <SaveDialog onClose={() => setIsSaveDialogOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;


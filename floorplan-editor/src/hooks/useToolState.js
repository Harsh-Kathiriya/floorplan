import { useState } from 'react';

// Tool types
export const TOOLS = {
  POINTER: 'pointer',
  MAGIC_BRUSH: 'magic_brush',
  TEXT: 'text',
  COLOR_PICKER: 'color_picker',
};

/**
 * Custom hook to manage the state of the editor's tools.
 */
const useToolState = () => {
  // The currently active tool
  const [activeTool, setActiveTool] = useState(TOOLS.MAGIC_BRUSH);
  
  // The currently selected color (default to light blue)
  const [selectedColor, setSelectedColor] = useState('#ADD8E6');
  
  // The currently selected text size
  const [selectedTextSize, setSelectedTextSize] = useState(16);
  
  // Whether new text should be bold
  const [selectedBold, setSelectedBold] = useState(false);
  
  // For the text tool
  const [textElements, setTextElements] = useState([]);
  const [activeTextId, setActiveTextId] = useState(null);
  
  // Add a new text element
  const addTextElement = (x, y, text, color = '#000000', size = 16, bold = false) => {
    const newElement = {
      id: Date.now(), // Simple unique ID
      x,
      y,
      text,
      color,
      size,
      bold
    };
    setTextElements(prev => [...prev, newElement]);
    return newElement.id;
  };

  // Update an existing text element
  const updateTextElement = (id, updates) => {
    setTextElements(prev => 
      prev.map(el => {
        if (el.id === id) {
          return { ...el, ...updates };
        }
        return el;
      })
    );
  };

  // Delete a text element
  const deleteTextElement = (id) => {
    setTextElements(prev => prev.filter(el => el.id !== id));
  };
  
  // Move a text element to a new position
  const moveTextElement = (id, newX, newY) => {
    updateTextElement(id, { x: newX, y: newY });
  };
  
  return {
    activeTool,
    setActiveTool,
    selectedColor,
    setSelectedColor,
    selectedTextSize,
    setSelectedTextSize,
    selectedBold,
    setSelectedBold,
    textElements,
    setTextElements,
    activeTextId,
    setActiveTextId,
    addTextElement,
    updateTextElement,
    moveTextElement,
    deleteTextElement
  };
};

export default useToolState; 
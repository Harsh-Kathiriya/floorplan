import { useState } from 'react';

// Tool types
export const TOOLS = {
  POINTER: 'pointer',
  MAGIC_BRUSH: 'magic_brush',
  TEXT: 'text',
  COLOR_PICKER: 'color_picker',
  MARQUEE_SELECT: 'marquee_select',
};

/**
 * Custom hook to manage the state of the editor's tools.
 */
const useToolState = () => {
  // Tool selection state
  const [activeTool, setActiveTool] = useState(TOOLS.MAGIC_BRUSH);
  
  // Color state
  const [selectedColor, setSelectedColor] = useState('#ADD8E6');
  
  // Text formatting state
  const [selectedTextSize, setSelectedTextSize] = useState(16);
  const [selectedBold, setSelectedBold] = useState(false);
  
  // Text elements state
  const [textElements, setTextElements] = useState([]);
  const [activeTextId, setActiveTextId] = useState(null);
  
  // Text element operations
  const addTextElement = (x, y, text, color = '#000000', size = 16, bold = false) => {
    const newElement = {
      id: Date.now(),
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

  const updateTextElement = (id, updates) => {
    setTextElements(prev => 
      prev.map(el => el.id === id ? { ...el, ...updates } : el)
    );
  };

  const deleteTextElement = (id) => {
    setTextElements(prev => prev.filter(el => el.id !== id));
  };
  
  const moveTextElement = (id, newX, newY) => {
    updateTextElement(id, { x: newX, y: newY });
  };
  
  return {
    // Tool selection
    activeTool,
    setActiveTool,
    
    // Color selection
    selectedColor,
    setSelectedColor,
    
    // Text formatting
    selectedTextSize,
    setSelectedTextSize,
    selectedBold,
    setSelectedBold,
    
    // Text elements
    textElements,
    setTextElements,
    activeTextId,
    setActiveTextId,
    
    // Text operations
    addTextElement,
    updateTextElement,
    moveTextElement,
    deleteTextElement
  };
};

export default useToolState; 
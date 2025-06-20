import React from 'react';
import { TOOLS } from '../hooks/useToolState';
import { FaMagic, FaFont, FaMousePointer, FaSave, FaUndo, FaRedo, FaBold } from 'react-icons/fa';

// It's a good practice to use an icon library for toolbar buttons.
// For now, we'll use simple text labels.
// Example: import { FaMagic, FaSquare, FaPalette } from 'react-icons/fa';

const COLORS = {
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  PINK: '#FFC0CB',
  YELLOW: '#FFFFE0',
  BLUE: '#ADD8E6',
  GREEN: '#90EE90',
  PURPLE: '#E6E6FA',
};

const TEXT_SIZES = [12, 16, 24, 36, 48];

const Toolbar = ({ 
  activeTool, setActiveTool, 
  selectedColor, setSelectedColor,
  selectedTextSize, setSelectedTextSize,
  selectedBold, setSelectedBold,
  saveImage, 
  undo, redo, canUndo, canRedo 
}) => {
  return (
    <div className="bg-gray-100 p-2 border-b border-gray-200 flex items-center space-x-4 flex-wrap">
      <div>
        <h3 className="text-sm font-semibold mb-1">Tools</h3>
        <div className="flex space-x-1">
          <button 
            className={`p-2 rounded ${activeTool === TOOLS.POINTER ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`} 
            title="Pointer"
            onClick={() => setActiveTool(TOOLS.POINTER)}
          >
            <FaMousePointer className="text-lg" />
          </button>
          <button 
            className={`p-2 rounded ${activeTool === TOOLS.MAGIC_BRUSH ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`} 
            title="Magic Brush"
            onClick={() => setActiveTool(TOOLS.MAGIC_BRUSH)}
          >
            <FaMagic className="text-lg" />
          </button>
          <button 
            className={`p-2 rounded ${activeTool === TOOLS.TEXT ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`} 
            title="Text Tool"
            onClick={() => setActiveTool(TOOLS.TEXT)}
          >
            <FaFont className="text-lg" />
          </button>
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-1">History</h3>
        <div className="flex space-x-1">
          <button 
            onClick={undo}
            disabled={!canUndo}
            className="p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
            title="Undo (Cmd+Z)"
          >
            <FaUndo />
          </button>
          <button 
            onClick={redo}
            disabled={!canRedo}
            className="p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
            title="Redo (Cmd+Y)"
          >
            <FaRedo />
          </button>
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-1">Color</h3>
        <div className="flex items-center space-x-1">
            {Object.values(COLORS).map(color => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-7 h-7 rounded-full border-2 ${selectedColor === color ? 'border-blue-500' : 'border-gray-300'}`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
        </div>
      </div>

      {activeTool === TOOLS.TEXT && (
        <div>
          <h3 className="text-sm font-semibold mb-1">Text Size</h3>
          <select 
            value={selectedTextSize}
            onChange={(e) => setSelectedTextSize(Number(e.target.value))}
            className="p-2 rounded border border-gray-300"
          >
            {TEXT_SIZES.map(size => (
              <option key={size} value={size}>{size}px</option>
            ))}
          </select>
          <button
            onClick={() => setSelectedBold(!selectedBold)}
            className={`ml-2 p-2 rounded border ${selectedBold ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`}
            title="Toggle Bold"
          >
            <FaBold />
          </button>
        </div>
      )}

      <div className="flex-grow"></div>

      <div>
        <h3 className="text-sm font-semibold mb-1">Actions</h3>
        <div className="flex space-x-2">
          <button 
            onClick={saveImage}
            className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white font-bold flex items-center space-x-1"
          >
            <FaSave />
            <span>Save Image</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar; 
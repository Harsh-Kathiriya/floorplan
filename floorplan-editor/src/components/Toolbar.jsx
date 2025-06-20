import React, { useState } from 'react';
import { TOOLS } from '../hooks/useToolState';
import { HexColorPicker } from 'react-colorful';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Transition } from '@headlessui/react';
import { 
  FaMagic, 
  FaFont, 
  FaMousePointer, 
  FaSave, 
  FaUndo, 
  FaRedo, 
  FaBold, 
  FaPalette,
  FaChevronDown,
  FaCheck,
  FaAngleLeft,
  FaAngleRight,
  FaEyeDropper
} from 'react-icons/fa';

// Predefined color palette with more modern colors
const COLORS = {
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  INDIGO: '#818CF8',
  CYAN: '#67E8F9',
  EMERALD: '#6EE7B7',
  AMBER: '#FBBF24',
  ROSE: '#FB7185',
  PURPLE: '#A78BFA',
};

// Text sizes with better labeling
const TEXT_SIZES = [
  { value: 12, label: 'XS' },
  { value: 16, label: 'S' },
  { value: 24, label: 'M' },
  { value: 36, label: 'L' },
  { value: 48, label: 'XL' }
];

const Toolbar = ({ 
  activeTool, setActiveTool, 
  selectedColor, setSelectedColor,
  selectedTextSize, setSelectedTextSize,
  selectedBold, setSelectedBold,
  saveImage, 
  undo, redo, canUndo, canRedo 
}) => {
  // State for color picker visibility
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  // For mobile toolbar view
  const [activeSection, setActiveSection] = useState(null);
  const [activePage, setActivePage] = useState(0);
  // Determine if we're on mobile based on screen width
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Update isMobile state on resize
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setActiveSection(null);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Toggle a section open/closed for mobile view
  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? null : section);
  };
  
  // Split toolbar sections into pages for mobile swiping
  const toolbarSections = [
    { id: 'tools', label: 'Tools' },
    { id: 'history', label: 'History' },
    { id: 'color', label: 'Color' },
    activeTool === TOOLS.TEXT ? { id: 'text', label: 'Text Options' } : null,
    { id: 'actions', label: 'Actions' }
  ].filter(Boolean);
  
  // For mobile pagination
  const visibleSections = isMobile 
    ? [toolbarSections[activePage]] 
    : toolbarSections;

  // Button style helper function
  const btnClass = (isActive) => 
    `p-2 rounded-md ${isActive 
      ? 'bg-primary-500 dark:bg-primary-600 text-white shadow-sm' 
      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-100'} 
     transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary-300 dark:focus:ring-primary-700 focus:ring-opacity-50`;

  const getInstructionText = () => {
    switch(activeTool) {
      case TOOLS.MAGIC_BRUSH:
        return 'Click to fill areas with selected color';
      case TOOLS.TEXT:
        return 'Click to add text';
      case TOOLS.POINTER:
        return 'Click and drag to move text';
      case TOOLS.COLOR_PICKER:
        return 'Click on the image to pick a color';
      default:
        return 'Select a tool to get started';
    }
  };

  return (
    <div className="bg-white dark:bg-dark-sidebar border-b border-gray-200 dark:border-dark-border shadow-sm transition-colors duration-300">
      {/* Mobile toolbar header with pagination controls */}
      {isMobile && (
        <div className="py-1 px-3 flex items-center justify-between border-b border-gray-200 dark:border-dark-border">
          <button 
            onClick={() => setActivePage(Math.max(0, activePage - 1))}
            disabled={activePage === 0}
            className="p-1 text-gray-500 dark:text-gray-400 disabled:text-gray-300 dark:disabled:text-gray-600"
          >
            <FaAngleLeft className="text-lg" />
          </button>
          
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
            {toolbarSections[activePage]?.label}
          </div>
          
          <button 
            onClick={() => setActivePage(Math.min(toolbarSections.length - 1, activePage + 1))}
            disabled={activePage === toolbarSections.length - 1}
            className="p-1 text-gray-500 dark:text-gray-400 disabled:text-gray-300 dark:disabled:text-gray-600"
          >
            <FaAngleRight className="text-lg" />
          </button>
        </div>
      )}
      
      <div className={`p-2 flex ${isMobile ? 'flex-col' : 'flex-wrap items-center'} space-y-2 md:space-y-0 md:space-x-4`}>
        <div className="flex flex-wrap items-center space-x-4">
          {/* Tools Section */}
          {visibleSections.map((section) => (
            <div 
              key={section.id} 
              className={`${isMobile ? 'w-full' : ''}`}
            >
              {/* Section title - collapsible on mobile */}
              {!isMobile && (
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  {section.label}
                </h3>
              )}
              
              {/* Tools */}
              {section.id === 'tools' && (
                <div className="flex space-x-1">
                  <button 
                    className={btnClass(activeTool === TOOLS.POINTER)}
                    title="Select & Move"
                    onClick={() => setActiveTool(TOOLS.POINTER)}
                  >
                    <FaMousePointer className="text-lg" />
                  </button>
                  <button 
                    className={btnClass(activeTool === TOOLS.MAGIC_BRUSH)}
                    title="Magic Fill"
                    onClick={() => setActiveTool(TOOLS.MAGIC_BRUSH)}
                  >
                    <FaMagic className="text-lg" />
                  </button>
                  <button 
                    className={btnClass(activeTool === TOOLS.TEXT)}
                    title="Add Text"
                    onClick={() => setActiveTool(TOOLS.TEXT)}
                  >
                    <FaFont className="text-lg" />
                  </button>
                  <button 
                    className={btnClass(activeTool === TOOLS.COLOR_PICKER)}
                    title="Color Picker"
                    onClick={() => setActiveTool(TOOLS.COLOR_PICKER)}
                  >
                    <FaEyeDropper className="text-lg" />
                  </button>
                </div>
              )}
              
              {/* History */}
              {section.id === 'history' && (
                <div className="flex space-x-1">
                  <button 
                    onClick={undo}
                    disabled={!canUndo}
                    className={`${btnClass(false)} disabled:opacity-50 disabled:cursor-not-allowed`}
                    title="Undo (Cmd+Z)"
                  >
                    <FaUndo />
                  </button>
                  <button 
                    onClick={redo}
                    disabled={!canRedo}
                    className={`${btnClass(false)} disabled:opacity-50 disabled:cursor-not-allowed`}
                    title="Redo (Cmd+Y)"
                  >
                    <FaRedo />
                  </button>
                </div>
              )}
              
              {/* Color picker with dropdown */}
              {section.id === 'color' && (
                <div className="relative">
                  <Menu as="div" className="relative inline-block text-left">
                    <Menu.Button className="flex items-center space-x-2 rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-150">
                      <div 
                        className="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 shadow-sm" 
                        style={{ backgroundColor: selectedColor }}
                      />
                      <FaChevronDown className="text-gray-500 dark:text-gray-400" />
                    </Menu.Button>
                    
                    <Transition
                      as={React.Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute left-0 z-30 mt-2 w-60 origin-top-left rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-gray-700 focus:outline-none p-3">
                        <div className="p-2">
                          <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Preset Colors</h4>
                          <div className="grid grid-cols-4 gap-2 mb-3">
                            {Object.values(COLORS).map(color => (
                              <button
                                key={color}
                                onClick={() => setSelectedColor(color)}
                                className={`w-8 h-8 rounded-full border-2 ${selectedColor === color ? 'border-primary-500 dark:border-primary-400 ring-2 ring-primary-200 dark:ring-primary-900' : 'border-gray-200 dark:border-gray-700'}`}
                                style={{ backgroundColor: color }}
                                title={color}
                              >
                                {selectedColor === color && (
                                  <FaCheck className={`text-center mx-auto ${['#FFFFFF'].includes(color) ? 'text-black' : 'text-white'}`} />
                                )}
                              </button>
                            ))}
                          </div>
                          <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Custom Color</h4>
                          <HexColorPicker color={selectedColor} onChange={setSelectedColor} className="w-full" />
                          <div className="mt-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                            {selectedColor}
                          </div>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              )}
              
              {/* Text options */}
              {section.id === 'text' && activeTool === TOOLS.TEXT && (
                <div className="flex items-center space-x-2">
                  <Menu as="div" className="relative inline-block text-left">
                    <Menu.Button className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <span className="mr-1">{selectedTextSize}px</span>
                      <FaChevronDown className="inline text-gray-500 dark:text-gray-400 text-xs" />
                    </Menu.Button>
                    <Transition
                      as={React.Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute left-0 z-10 mt-1 w-32 origin-top-left rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-gray-700 focus:outline-none">
                        <div className="py-1">
                          {TEXT_SIZES.map(size => (
                            <Menu.Item key={size.value}>
                              {({ active }) => (
                                <button
                                  onClick={() => setSelectedTextSize(size.value)}
                                  className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''} ${
                                    selectedTextSize === size.value ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'
                                  } group flex w-full items-center px-4 py-2 text-sm justify-between`}
                                >
                                  <span>{size.label}</span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">{size.value}px</span>
                                  {selectedTextSize === size.value && (
                                    <FaCheck className="ml-2 h-4 w-4 text-primary-500 dark:text-primary-400" />
                                  )}
                                </button>
                              )}
                            </Menu.Item>
                          ))}
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                  <button
                    onClick={() => setSelectedBold(!selectedBold)}
                    className={`${btnClass(selectedBold)}`}
                    title="Toggle Bold"
                  >
                    <FaBold />
                  </button>
                </div>
              )}
              
              {/* Actions/Save button */}
              {section.id === 'actions' && (
                <button 
                  onClick={saveImage}
                  className="px-4 py-2 rounded-md bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium shadow-sm transition-all duration-150 flex items-center"
                >
                  <FaSave className="mr-2" />
                  <span>Save</span>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-grow"></div>

        {/* Instructional Text */}
        {!isMobile && (
          <div className="hidden md:flex items-center text-md text-gray-700 dark:text-gray-300 pr-4">
            <p>{getInstructionText()}</p>
          </div>
        )}
      </div>
      
      {/* Pagination dots for mobile */}
      {isMobile && toolbarSections.length > 1 && (
        <div className="flex justify-center pb-1 pt-1 space-x-1">
          {toolbarSections.map((section, index) => (
            <button
              key={section.id}
              className={`w-2 h-2 rounded-full ${activePage === index ? 'bg-primary-500 dark:bg-primary-400' : 'bg-gray-300 dark:bg-gray-600'}`}
              onClick={() => setActivePage(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Toolbar; 
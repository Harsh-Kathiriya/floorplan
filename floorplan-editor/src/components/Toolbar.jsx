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
  FaEyeDropper,
  FaBorderStyle
} from 'react-icons/fa';
import Tooltip from './Tooltip';

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

const TOOL_TIPS = {
  [TOOLS.POINTER]: {
    title: 'Select & Move',
    description: 'Click to select or drag to move objects.',
  },
  [TOOLS.MAGIC_BRUSH]: {
    title: 'Magic Fill',
    description: 'Click an area to fill with color.',
  },
  [TOOLS.TEXT]: {
    title: 'Add Text',
    description: 'Click on the canvas to add a text box.',
  },
  [TOOLS.COLOR_PICKER]: {
    title: 'Color Picker',
    description: 'Select a color from the canvas.',
  },
  [TOOLS.MARQUEE_SELECT]: {
    title: 'Marquee Select',
    description: 'Drag to create a rectangular selection.',
  },
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
  const btnClass = (isActive) => 
    `p-2.5 rounded-lg ${isActive 
      ? 'bg-primary-500 dark:bg-primary-600 text-white shadow-md' 
      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-100'} 
     transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-600 focus:ring-opacity-75`;

  const sectionClass = "flex flex-col space-y-2";
  const labelClass = "text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider";

  return (
    <div className="bg-white dark:bg-dark-sidebar border-b border-gray-200 dark:border-dark-border shadow-sm transition-colors duration-300">
      <div className="p-3 flex items-start justify-between space-x-6">
        {/* Left and Center Sections */}
        <div className="flex items-start space-x-6">
          {/* Tools */}
          <div className={sectionClass}>
            <h3 className={labelClass}>Tools</h3>
            <div className="flex space-x-1.5">
              <Tooltip {...TOOL_TIPS[TOOLS.POINTER]}>
                <button 
                  className={btnClass(activeTool === TOOLS.POINTER)}
                  onClick={() => setActiveTool(TOOLS.POINTER)}
                >
                  <FaMousePointer className="text-lg" />
                </button>
              </Tooltip>
              <Tooltip {...TOOL_TIPS[TOOLS.MAGIC_BRUSH]}>
                <button 
                  className={btnClass(activeTool === TOOLS.MAGIC_BRUSH)}
                  onClick={() => setActiveTool(TOOLS.MAGIC_BRUSH)}
                >
                  <FaMagic className="text-lg" />
                </button>
              </Tooltip>
              <Tooltip {...TOOL_TIPS[TOOLS.TEXT]}>
                <button 
                  className={btnClass(activeTool === TOOLS.TEXT)}
                  onClick={() => setActiveTool(TOOLS.TEXT)}
                >
                  <FaFont className="text-lg" />
                </button>
              </Tooltip>
              <Tooltip {...TOOL_TIPS[TOOLS.COLOR_PICKER]}>
                <button 
                  className={btnClass(activeTool === TOOLS.COLOR_PICKER)}
                  onClick={() => setActiveTool(TOOLS.COLOR_PICKER)}
                >
                  <FaEyeDropper className="text-lg" />
                </button>
              </Tooltip>
              <Tooltip {...TOOL_TIPS[TOOLS.MARQUEE_SELECT]}>
                <button 
                  className={btnClass(activeTool === TOOLS.MARQUEE_SELECT)}
                  onClick={() => setActiveTool(TOOLS.MARQUEE_SELECT)}
                >
                  <FaBorderStyle className="text-lg" />
                </button>
              </Tooltip>
            </div>
          </div>
          
          {/* Divider */}
          <div className="border-l border-gray-200 dark:border-gray-700 h-14 self-center"></div>

          {/* History */}
          <div className={sectionClass}>
            <h3 className={labelClass}>History</h3>
            <div className="flex space-x-1.5">
              <Tooltip title="Undo" description="Cmd/Ctrl + Z">
                <button 
                  onClick={undo}
                  disabled={!canUndo}
                  className={`${btnClass(false)} disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  <FaUndo />
                </button>
              </Tooltip>
              <Tooltip title="Redo" description="Cmd/Ctrl + Y">
                <button 
                  onClick={redo}
                  disabled={!canRedo}
                  className={`${btnClass(false)} disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  <FaRedo />
                </button>
              </Tooltip>
            </div>
          </div>
          
          {/* Divider */}
          <div className="border-l border-gray-200 dark:border-gray-700 h-14 self-center"></div>

          {/* Color Picker */}
          <div className={sectionClass}>
            <h3 className={labelClass}>Color</h3>
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center space-x-2 rounded-lg p-1 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-150">
                <div 
                  className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600 shadow-sm" 
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
                <Menu.Items className="absolute left-0 z-30 mt-2 w-60 origin-top-left rounded-lg bg-white dark:bg-gray-800 shadow-xl ring-1 ring-black ring-opacity-5 dark:ring-gray-700 focus:outline-none p-3">
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-1">Preset Colors</h4>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {Object.values(COLORS).map(color => (
                      <Menu.Item key={color}>
                        <button
                          onClick={() => setSelectedColor(color)}
                          className={`w-10 h-10 rounded-full border-2 transition-all ${selectedColor.toLowerCase() === color.toLowerCase() ? 'border-primary-500 dark:border-primary-400 ring-2 ring-primary-300 dark:ring-primary-800' : 'border-gray-200 dark:border-gray-700'}`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      </Menu.Item>
                    ))}
                  </div>
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 my-2 px-1">Custom Color</h4>
                  <HexColorPicker color={selectedColor} onChange={setSelectedColor} className="!w-full" />
                  <div className="mt-3 text-center text-sm font-mono text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900/50 rounded-md py-1">
                    {selectedColor}
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>

          {/* Text Options */}
          {activeTool === TOOLS.TEXT && (
            <>
              {/* Divider */}
              <div className="border-l border-gray-200 dark:border-gray-700 h-14 self-center"></div>
              <div className={sectionClass}>
                <h3 className={labelClass}>Text Options</h3>
                <div className="flex items-center space-x-2">
                  <Menu as="div" className="relative">
                    <Menu.Button className="bg-white dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center">
                      <span>{selectedTextSize}px</span>
                      <FaChevronDown className="ml-2 text-gray-500 dark:text-gray-400 text-xs" />
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
                                    selectedTextSize === size.value ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'
                                  } group flex w-full items-center px-4 py-2 text-sm justify-between`}
                                >
                                  <span>{size.label} ({size.value}px)</span>
                                </button>
                              )}
                            </Menu.Item>
                          ))}
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                  <Tooltip title="Bold" description="Toggle bold text">
                    <button
                      onClick={() => setSelectedBold(!selectedBold)}
                      className={`${btnClass(selectedBold)} w-[44px] h-[44px] flex items-center justify-center`}
                    >
                      <span className="font-bold text-lg">B</span>
                    </button>
                  </Tooltip>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-start space-x-6">
          {/* Actions */}
          <div className={sectionClass}>
            <h3 className={labelClass}>Actions</h3>
            <Tooltip title="Save Image" description="Download your floor plan as a PNG." position="right">
              <button 
                onClick={saveImage}
                className="px-5 py-2.5 rounded-lg bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 text-white font-semibold shadow-md transition-all duration-200 flex items-center text-base"
              >
                <FaSave className="mr-2.5" />
                <span>Save</span>
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toolbar; 
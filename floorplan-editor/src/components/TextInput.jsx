import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaCheck, FaTrash } from 'react-icons/fa';

/**
 * Text input popup component for adding/editing text on the canvas
 */
const TextInput = ({ 
  textInput, 
  onTextChange, 
  onSubmit, 
  onCancel, 
  onDelete 
}) => {
  // Focus the input when it becomes visible
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

  if (!textInput.visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="absolute z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 border border-gray-200 dark:border-gray-700"
      style={{
        left: `${textInput.x}px`,
        top: `${Math.max(10, textInput.y - 70)}px`, // Position above, with boundary check
        width: '240px'
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {textInput.editing ? 'Edit Text' : 'Add Text'}
        </div>
        <button 
          onClick={onCancel}
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
        onChange={(e) => onTextChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onSubmit();
          } else if (e.key === 'Escape') {
            onCancel();
          }
        }}
        placeholder="Enter text..."
      />
      <div className="flex justify-between items-center mt-3">
        {textInput.editing ? (
          <button
            onClick={onDelete}
            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white rounded-md hover:shadow-sm flex items-center text-sm transition-colors"
          >
            <FaTrash className="mr-1.5" />
            Delete
          </button>
        ) : (
          <div /> /* Placeholder to keep alignment */
        )}
        <button
          onClick={onSubmit}
          className="px-3 py-1.5 bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 text-white rounded-md hover:shadow-sm flex items-center text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!textInput.value.trim()}
        >
          <FaCheck className="mr-1.5" /> 
          {textInput.editing ? 'Update' : 'Add'}
        </button>
      </div>
    </motion.div>
  );
};

export default TextInput; 
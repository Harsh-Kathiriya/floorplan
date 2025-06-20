import React from 'react';
import { FaFillDrip } from 'react-icons/fa';

/**
 * Contextual fill button that appears when a selection is made
 */
const ContextualFillButton = ({ position, onClick }) => {
  if (!position) return null;
  
  return (
    <button
      onClick={onClick}
      className="absolute z-20 p-2 rounded-md bg-primary-500 hover:bg-primary-600 text-white shadow-lg flex items-center justify-center"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
    >
      <FaFillDrip />
    </button>
  );
};

export default ContextualFillButton; 
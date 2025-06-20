import React from 'react';
import { FaFont } from 'react-icons/fa';

/**
 * Placeholder component shown when no image is selected
 */
const NoImagePlaceholder = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center text-gray-400 dark:text-gray-500">
        <FaFont className="mx-auto text-5xl mb-3 opacity-30" />
        <p className="text-lg font-medium">Select or upload a floor plan to edit</p>
        <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">The canvas will display your selected image</p>
      </div>
    </div>
  );
};

export default NoImagePlaceholder; 
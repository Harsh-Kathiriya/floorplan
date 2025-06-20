import React from 'react';
import { FaTimes, FaImage, FaUpload, FaPlus } from 'react-icons/fa';
import { MdOutlineImageNotSupported } from 'react-icons/md';
import { motion } from 'framer-motion';

const Sidebar = ({ images, onImageUpload, onImageSelect, selectedImageIndex, onClose }) => {
  return (
    <aside className="w-[280px] md:w-72 h-full bg-white dark:bg-dark-sidebar shadow-lg border-r border-gray-200 dark:border-dark-border flex flex-col transition-colors duration-300">
      <div className="p-4 border-b border-gray-200 dark:border-dark-border flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white py-2">Floor Plans</h2>
        <button 
          onClick={onClose}
          className="md:hidden p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Close sidebar"
        >
          <FaTimes className="text-lg" />
        </button>
      </div>

      <div className="p-4">
        <label 
          htmlFor="file-upload" 
          className="flex items-center justify-center w-full cursor-pointer bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium py-2.5 px-4 rounded-lg transition-all shadow-sm duration-150 ease-in-out"
        >
          <FaUpload className="mr-2" />
          <span>Upload Floor Plans</span>
        </label>
        <input 
          id="file-upload" 
          type="file" 
          multiple 
          className="hidden" 
          onChange={onImageUpload} 
          accept="image/png, image/jpeg" 
        />
      </div>

      <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        Your Floor Plans
      </div>
      
      <div className="flex-grow overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {images.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-6 text-gray-500 dark:text-gray-400">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
              <MdOutlineImageNotSupported className="text-3xl text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-sm font-medium">No floor plans uploaded yet</p>
            <p className="text-xs mt-1 text-gray-400 dark:text-gray-500">Upload images to get started</p>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {images.map((image, index) => (
              <motion.li 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className={`rounded-lg overflow-hidden cursor-pointer transition-all duration-200 border ${
                  selectedImageIndex === index 
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-sm' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
                onClick={() => onImageSelect(index)}
              >
                <div className="flex items-center p-2.5">
                  <div className="w-14 h-14 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 mr-3">
                    {image.dataUrl ? (
                      <img 
                        src={image.dataUrl} 
                        alt={image.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                        <FaImage className="text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${selectedImageIndex === index ? 'text-primary-700 dark:text-primary-400 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                      {image.name}
                    </p>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {Math.round(image.width)} × {Math.round(image.height)}
                      </span>
                      {selectedImageIndex === index && (
                        <span className="ml-2 px-1.5 py-0.5 text-[10px] font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded">
                          Selected
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
      
      <div className="mt-auto p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 text-center">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-2">
            <FaPlus className="text-gray-500 dark:text-gray-400 text-xs" />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Drag and drop files here or use the upload button
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar; 
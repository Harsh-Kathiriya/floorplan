import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaTrash, FaExclamationTriangle } from 'react-icons/fa';

const DeleteConfirmationDialog = ({ onClose, onConfirm, imageName }) => {
  // Close dialog on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative"
      >
        <div className="p-8 text-center space-y-6 flex flex-col items-center">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <FaExclamationTriangle className="text-red-500 dark:text-red-400 text-3xl" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Delete Floor Plan?</h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Are you sure you want to delete <strong className="break-all">"{imageName}"</strong>? 
            <br />
            This action cannot be undone.
          </p>

          <div className="flex justify-center items-center space-x-4 w-full pt-4">
            <button
              onClick={onClose}
              className="w-full px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-offset-gray-800 transition-all shadow-sm"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="w-full inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800 transition-all shadow-sm"
            >
              <FaTrash className="mr-2" />
              Delete
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DeleteConfirmationDialog; 
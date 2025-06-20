import React from 'react';
import { motion } from 'framer-motion';
import { FaSpinner } from 'react-icons/fa';

/**
 * Loading overlay component with spinner animation
 */
const LoadingOverlay = ({ isLoading }) => {
  if (!isLoading) return null;
  
  return (
    <div className="absolute inset-0 bg-black bg-opacity-70 dark:bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-20">
      <motion.div 
        className="p-4 rounded-full bg-white dark:bg-gray-800"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      >
        <FaSpinner className="text-primary-500 dark:text-primary-400 text-2xl" />
      </motion.div>
    </div>
  );
};

export default LoadingOverlay; 
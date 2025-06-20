import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Tooltip = ({ children, title, description, position = 'center' }) => {
  const [isHovered, setIsHovered] = useState(false);

  const positionClasses = {
    center: 'left-1/2 -translate-x-1/2',
    right: 'right-0',
    left: 'left-0'
  };

  const arrowPositionClasses = {
    center: 'left-1/2 -translate-x-1/2',
    right: 'right-4',
    left: 'left-4'
  };

  return (
    <div 
      className="relative flex items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      {children}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute ${positionClasses[position]} top-full mt-3 w-max max-w-xs z-50 pointer-events-none`}
          >
            <div className="bg-gray-800 dark:bg-black text-white rounded-lg shadow-xl px-4 py-2 relative">
              <div className={`absolute ${arrowPositionClasses[position]} -top-1 w-3 h-3 bg-gray-800 dark:bg-black transform rotate-45`} />
              <h4 className="font-bold text-sm text-center">{title}</h4>
              {description && <p className="text-xs text-gray-300 dark:text-gray-400 mt-1 text-center">{description}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tooltip; 
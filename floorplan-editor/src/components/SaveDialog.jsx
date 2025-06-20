import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaCheckCircle, FaEnvelope, FaCode, FaTools, FaBrain } from 'react-icons/fa';
import harshPhoto from '../assets/1I2A2601.JPG';

const SaveDialog = ({ onClose }) => {
  // Close dialog on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Close"
        >
          <FaTimes />
        </button>

        <div className="p-8 text-center space-y-6 flex flex-col items-center">
          <div className="flex justify-center mb-2">
            <FaCheckCircle className="text-green-500 text-5xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Image Downloaded!</h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Your floor plan has been successfully downloaded. This editor was created by <span className="font-semibold">Harsh Kathiriya, a student at the University of Alabama</span>.
          </p>

          {/* Developer Photo */}
          <img
            src={harshPhoto}
            alt="Harsh Kathiriya"
            className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-md mx-auto"
          />

          {/* Quick Skills */}
          <div className="text-left space-y-2 mt-4">
            <div className="flex items-center text-sm text-gray-700 dark:text-gray-300"><FaCode className="mr-2 text-indigo-400" />Professional Web Apps</div>
            <div className="flex items-center text-sm text-gray-700 dark:text-gray-300"><FaTools className="mr-2 text-sky-400" />Custom Web Tools</div>
            <div className="flex items-center text-sm text-gray-700 dark:text-gray-300"><FaBrain className="mr-2 text-emerald-400" />AI Automation</div>
          </div>

          <p className="text-gray-600 dark:text-gray-300 text-sm mt-4">
            Need further assistance or custom features? I'm available as a <span className="font-semibold">student assistant</span>. Let's collaborate!
          </p>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            If you encounter any issues or have suggestions for improvement, feel free to reach out.
          </p>

          <a
            href="mailto:hckathiriya@crimson.ua.edu"
            className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition-all shadow-sm"
          >
            <FaEnvelope className="mr-2" /> Hire / Contact Harsh
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default SaveDialog; 
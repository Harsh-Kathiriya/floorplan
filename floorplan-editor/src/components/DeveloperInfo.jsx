import React from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaEnvelope, FaUserGraduate, FaTools, FaCode, FaDatabase, FaBrain, FaFilm, FaServer, FaPaintBrush } from 'react-icons/fa';
import harshPhoto from '../assets/1I2A2601.JPG'; // Make sure the path is correct

const DeveloperInfo = ({ onClose }) => {
  const skills = [
    { icon: <FaCode className="text-indigo-400" />, text: 'Professional Websites & Web Apps' },
    { icon: <FaTools className="text-sky-400" />, text: 'Custom Web Tools & Solutions' },
    { icon: <FaBrain className="text-emerald-400" />, text: 'AI Automation for Manual Tasks' },
    { icon: <FaDatabase className="text-amber-400" />, text: 'Data Scraping & Analytics' },
    { icon: <FaFilm className="text-rose-400" />, text: 'AI-Powered Audio & Video Generation' },
    { icon: <FaServer className="text-purple-400" />, text: 'Local LLM & Vector DB Setup' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden transition-colors duration-300">
        {/* Left Side: Image and Basic Info */}
        <div className="w-full md:w-1/3 bg-gray-50 dark:bg-gray-900 p-8 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="relative mb-4">
            <img 
              src={harshPhoto} 
              alt="Harsh Kathiriya"
              className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-white dark:border-gray-700"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Harsh Kathiriya</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Student Developer</p>
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-300 space-y-1">
            <div className="flex items-center justify-center">
              <FaUserGraduate className="mr-2 text-gray-400 dark:text-gray-500" />
              <span>University of Alabama</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Computer Science, Senior</p>
          </div>
        </div>

        {/* Right Side: Detailed Info */}
        <div className="w-full md:w-2/3 p-8 flex flex-col overflow-y-auto">
          <div className="flex-grow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">About Me</h3>
              <button 
                onClick={onClose}
                className="p-2 rounded-full text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm leading-relaxed">
              I'm a senior Computer Science student specializing in the rapid prototyping of web applications and AI-powered tools. My goal is to create elegant, efficient solutions to complex problems.
            </p>

            <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center">
              <FaPaintBrush className="mr-3 text-indigo-500 dark:text-indigo-400" />
              How I Can Help
            </h4>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
              I'm available as a <b>student worker</b> who can help build innovative web tools and AI automations to enhance your workflow. 
              <br />
              <br />
              By combining the latest technologies with practical solutions, I can help streamline your processes and bring fresh ideas to your projects. Let's work together to make your vision a reality.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {skills.map(skill => (
                <div key={skill.text} className="flex items-start p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-colors duration-300">
                  <div className="mr-3 text-xl flex-shrink-0 mt-1">{skill.icon}</div>
                  <span className="text-sm text-gray-700 dark:text-gray-200">{skill.text}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Footer / Contact */}
          <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Interested in collaborating?</p>
            <a 
              href="mailto:hckathiriya@crimson.ua.edu"
              className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition-all shadow-sm"
            >
              <FaEnvelope className="mr-2" />
              Contact Me
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DeveloperInfo; 
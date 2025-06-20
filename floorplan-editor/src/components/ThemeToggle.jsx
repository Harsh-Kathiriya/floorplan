import React, { useState, useEffect, createContext, useContext } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';
import { motion } from 'framer-motion';

// Create a context for theme management
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Check if user has a theme preference in localStorage or prefers dark mode
  const getInitialTheme = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedPrefs = window.localStorage.getItem('color-theme');
      if (typeof storedPrefs === 'string') {
        return storedPrefs;
      }

      const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
      if (userMedia.matches) {
        return 'dark';
      }
    }

    return 'light'; // Default theme
  };

  const [theme, setTheme] = useState(getInitialTheme);

  // Function to toggle theme
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('color-theme', newTheme);
  };

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

// The actual toggle button component
const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      className="flex w-16 h-8 p-1 rounded-full cursor-pointer transition-all duration-300 bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
      onClick={toggleTheme}
      role="button"
      tabIndex={0}
    >
      <div className="flex justify-between items-center w-full">
        <motion.div
          className={`flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300 ${
            isDark 
              ? "transform translate-x-8 bg-gray-700" 
              : "transform translate-x-0 bg-white"
          }`}
        >
          {isDark ? (
            <FaMoon className="w-3.5 h-3.5 text-blue-200" />
          ) : (
            <FaSun className="w-3.5 h-3.5 text-yellow-500" />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ThemeToggle; 
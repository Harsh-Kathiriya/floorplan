import React, { createContext, useContext } from 'react';
import useToolState from '../hooks/useToolState';

// Create context
const ToolContext = createContext(null);

/**
 * Provider component for tool state
 */
export const ToolProvider = ({ children }) => {
  const toolState = useToolState();
  
  return (
    <ToolContext.Provider value={toolState}>
      {children}
    </ToolContext.Provider>
  );
};

/**
 * Hook to use the tool context
 */
export const useToolContext = () => {
  const context = useContext(ToolContext);
  if (!context) {
    throw new Error('useToolContext must be used within a ToolProvider');
  }
  return context;
}; 
/**
 * Compares two history entries to check if they are equal
 * @param {Object} entryA - First history entry
 * @param {Object} entryB - Second history entry
 * @returns {boolean} - Whether the entries are equal
 */
export const areHistoryEntriesEqual = (entryA, entryB) => {
  if (!entryA || !entryB) return false;
  
  // Compare basic properties
  if (entryA.selectedTextSize !== entryB.selectedTextSize) return false;
  if (entryA.selectedBold !== entryB.selectedBold) return false;
  
  // Compare textElements
  if (entryA.textElements.length !== entryB.textElements.length) return false;
  for (let i = 0; i < entryA.textElements.length; i++) {
    if (JSON.stringify(entryA.textElements[i]) !== JSON.stringify(entryB.textElements[i])) {
      return false;
    }
  }
  
  // Compare imageData dimensions
  if (entryA.imageData && entryB.imageData) {
    if (entryA.imageData.width !== entryB.imageData.width || 
        entryA.imageData.height !== entryB.imageData.height) {
      return false;
    }
    
    // Sample pixels to catch changes (checking every 100 pixels for efficiency)
    const dataA = entryA.imageData.data;
    const dataB = entryB.imageData.data;
    const len = dataA.length;
    for (let idx = 0; idx < len; idx += 400) { // every 100 pixels (4 bytes each)
      if (dataA[idx] !== dataB[idx]) return false;
    }
  } else if (entryA.imageData || entryB.imageData) {
    // One has imageData, other doesn't
    return false;
  }
  
  return true;
};

/**
 * Creates a new history entry
 * @param {Array} textElements - Array of text elements
 * @param {ImageData} imageData - Canvas image data
 * @param {number} selectedTextSize - Selected text size
 * @param {boolean} selectedBold - Whether bold text is selected
 * @returns {Object} - New history entry
 */
export const createHistoryEntry = (textElements, imageData, selectedTextSize, selectedBold) => {
  return {
    textElements: [...textElements],
    imageData,
    selectedTextSize,
    selectedBold
  };
};

/**
 * Adds a new entry to the history
 * @param {Object} history - Current history object with history array and currentIndex
 * @param {Object} newEntry - New history entry to add
 * @returns {Object} - Updated history object
 */
export const addHistoryEntry = (history, newEntry) => {
  const { history: entries, currentIndex } = history;
  const lastEntry = entries[currentIndex];
  
  // Skip if no changes
  if (areHistoryEntriesEqual(lastEntry, newEntry)) {
    return history;
  }
  
  // Remove any future history that would be lost by this new edit
  const newEntries = entries.slice(0, currentIndex + 1);
  
  return {
    history: [...newEntries, newEntry],
    currentIndex: newEntries.length
  };
}; 
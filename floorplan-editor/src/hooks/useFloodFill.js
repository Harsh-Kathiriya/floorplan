import { useCallback } from 'react';

/**
 * Custom hook that provides a flood fill algorithm.
 */
const useFloodFill = () => {
  /**
   * Performs a flood fill algorithm on a canvas starting from a given point.
   * @param {HTMLCanvasElement} canvas - The canvas to perform the flood fill on.
   * @param {number} startX - The starting X coordinate.
   * @param {number} startY - The starting Y coordinate.
   * @param {number} tolerance - The color tolerance (0-255).
   * @returns {Array} - An array of [x, y] coordinates that were filled.
   */
  const floodFill = useCallback((canvas, startX, startY, tolerance = 1) => {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;
    
    // Get the color of the starting pixel
    const startPos = (startY * width + startX) * 4;
    const startR = data[startPos];
    const startG = data[startPos + 1];
    const startB = data[startPos + 2];
    
    // Check if a pixel's color is similar to the starting pixel's color
    const isSimilarColor = (pos) => {
      const r = data[pos];
      const g = data[pos + 1];
      const b = data[pos + 2];
      
      return (
        Math.abs(r - startR) <= tolerance &&
        Math.abs(g - startG) <= tolerance &&
        Math.abs(b - startB) <= tolerance
      );
    };
    
    // Array to store the pixels that were filled
    const filledPixels = [];
    
    // Set to keep track of visited pixels
    const visited = new Set();
    
    // Queue for the flood fill algorithm
    const queue = [[startX, startY]];
    
    // Process the queue
    while (queue.length > 0) {
      const [x, y] = queue.shift();
      
      // Skip if out of bounds
      if (x < 0 || x >= width || y < 0 || y >= height) {
        continue;
      }
      
      // Skip if already visited
      const key = `${x},${y}`;
      if (visited.has(key)) {
        continue;
      }
      
      // Mark as visited
      visited.add(key);
      
      // Check if the color is similar
      const pos = (y * width + x) * 4;
      if (!isSimilarColor(pos)) {
        continue;
      }
      
      // Add to filled pixels
      filledPixels.push([x, y]);
      
      // Add neighbors to the queue
      queue.push([x + 1, y]);
      queue.push([x - 1, y]);
      queue.push([x, y + 1]);
      queue.push([x, y - 1]);
    }
    
    return filledPixels;
  }, []);
  
  return { floodFill };
};

export default useFloodFill; 
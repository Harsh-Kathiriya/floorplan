/**
 * Calculates the dimensions for drawing an image on a canvas while maintaining aspect ratio
 * @param {number} canvasWidth - Width of the canvas
 * @param {number} canvasHeight - Height of the canvas
 * @param {number} imageWidth - Width of the image
 * @param {number} imageHeight - Height of the image
 * @returns {Object} - Object with x, y, width, height properties
 */
export const calculateImageDimensions = (canvasWidth, canvasHeight, imageWidth, imageHeight) => {
  const canvasAspectRatio = canvasWidth / canvasHeight;
  const imageAspectRatio = imageWidth / imageHeight;
  let drawWidth, drawHeight, x, y;

  if (canvasAspectRatio > imageAspectRatio) {
    // Canvas is wider than the image
    drawHeight = canvasHeight;
    drawWidth = drawHeight * imageAspectRatio;
    x = (canvasWidth - drawWidth) / 2;
    y = 0;
  } else {
    // Canvas is taller than or same aspect as the image
    drawWidth = canvasWidth;
    drawHeight = drawWidth / imageAspectRatio;
    x = 0;
    y = (canvasHeight - drawHeight) / 2;
  }

  return { x, y, width: drawWidth, height: drawHeight };
};

/**
 * Gets the color at a specific position on a canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {string} - Hex color code
 */
export const getColorAtPosition = (ctx, x, y) => {
  // Get pixel data at the clicked position
  const pixelData = ctx.getImageData(x, y, 1, 1).data;
  
  // Convert RGB to hex
  const r = pixelData[0];
  const g = pixelData[1];
  const b = pixelData[2];
  
  // Format as hex color
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}; 
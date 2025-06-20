import React from 'react';

const Sidebar = ({ images, onImageUpload, onImageSelect, selectedImageIndex }) => {
  return (
    <aside className="w-64 bg-gray-100 p-4 border-r border-gray-200 flex flex-col">
      <h2 className="text-lg font-bold mb-4">Floor Plans</h2>
      <div className="mb-4">
        <label htmlFor="file-upload" className="w-full text-center cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded block">
          Upload Images
        </label>
        <input id="file-upload" type="file" multiple className="hidden" onChange={onImageUpload} accept="image/png, image/jpeg" />
      </div>
      <ul className="space-y-2 flex-grow overflow-y-auto">
        {images.length === 0 && (
          <li className="text-gray-500 text-center mt-4">No images uploaded.</li>
        )}
        {images.map((image, index) => (
          <li 
            key={index} 
            className={`p-2 rounded cursor-pointer truncate ${selectedImageIndex === index ? 'bg-blue-200 font-semibold' : 'hover:bg-gray-200'}`}
            onClick={() => onImageSelect(index)}
            title={image.name}
          >
            {image.name}
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar; 
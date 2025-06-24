# Floor Plan Editor

[![Live Demo](https://img.shields.io/badge/demo-online-green.svg)](https://floorplan-nu.vercel.app/)

An interactive web-based floor plan editor that allows users to upload, edit, and customize floor plans with various tools and features. I built this to help the departments at my University.


## 🌟 Features

- **Upload & Manage Multiple Floor Plans**: Upload and switch between multiple floor plan images
- **Magic Fill Tool**: Intelligently fill areas with selected colors
- **Text Tool**: Add, edit, move, and format text on floor plans
- **Color Picker**: Select colors from the floor plan or use the color palette
- **Marquee Selection**: Select and fill rectangular areas
- **Pointer Tool**: Select and move text elements
- **Undo/Redo**: Full history management for all edits
- **Save & Export**: Download edited floor plans as PNG images
- **Dark/Light Mode**: Toggle between dark and light themes


## 🚀 Live Demo

Visit the live application: [Floor Plan Editor](https://floorplan-nu.vercel.app/)


## 🛠️ Technologies Used

- **React**: Frontend library for building the user interface
- **Vite**: Build tool and development server
- **TailwindCSS**: Utility-first CSS framework for styling
- **Framer Motion**: Animation library for smooth transitions
- **React Colorful**: Color picker component
- **Headless UI**: Unstyled, accessible UI components
- **React Icons**: Icon library
- **Canvas API**: For drawing and image manipulation


## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn


## 🔧 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/floorplan.git
   cd floorplan/floorplan-editor
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:5173`


## 📝 Usage Guide

1. **Upload a Floor Plan**:
   - Click the "Upload Floor Plans" button in the sidebar
   - Select an image file from your device

2. **Edit the Floor Plan**:
   - **Magic Fill Tool**: Click on an area to fill it with the selected color
   - **Text Tool**: Click anywhere to add text, or click on existing text to edit it
   - **Color Picker**: Click on any part of the image to sample its color
   - **Marquee Select**: Click and drag to create a selection, then use the fill button
   - **Pointer Tool**: Select and move text elements

3. **Save Your Work**:
   - Click the "Save" button to download your edited floor plan as a PNG image


## 🏗️ Project Structure

```
floorplan-editor/
├── src/
│   ├── components/      # React components for UI elements
│   ├── contexts/        # React Context for global state management (e.g., ToolContext)
│   ├── hooks/           # Custom React hooks for complex logic (e.g., useFloodFill)
│   ├── utils/           # Helper functions for canvas, colors, and history
│   ├── assets/          # Static assets like images and icons
│   ├── App.jsx          # Main application component and state orchestrator
│   └── main.jsx         # Application entry point
├── public/              # Public assets
└── index.html           # HTML entry point
```


## 🛠️ Implementation Details

This section covers the core concepts behind the editor's functionality.

### Core Architecture & State Management

- **Central State (`App.jsx`)**: `App.jsx` is the main component, managing global state such as the image list and the `editHistory` object.
  
- **Per-Image History** (TODO - Implement a better approach to improve memory efficiency): The editor maintains a separate undo/redo stack for each image. Each history entry is a complete snapshot of the canvas `ImageData` and all text elements. This approach is simple and reliable but can be memory-intensive.
  
- **Tooling State (`ToolContext`)**: To avoid prop-drilling, `ToolContext` provides shared state (active tool, selected color, etc.) from the `useToolState` hook directly to components like the `Toolbar` and `Canvas`.

### Canvas & Rendering

Performance is optimized using a layered approach with three distinct `<canvas>` elements:

1.  **Image Canvas (Bottom)**: Renders the base image and permanent color fills.
2.  **Text Canvas (Middle)**: A transparent layer dedicated to drawing text elements.
3.  **Interaction Canvas (Top)**: Handles all user input (mouse/touch) and renders temporary visuals like selection boxes.

### Key Feature Implementation

- **Magic Fill**: The `useFloodFill` hook implements a queue-based **Flood Fill algorithm**. It returns an array of pixels within a specified color `tolerance`, which the `Canvas` component then colors.
  
- **Text Tool**: Clicking the canvas with the Text tool renders a `TextInput` component. On submission, the text is added to the state and drawn onto the Text Canvas.
  
- **Undo/Redo History**: The `historyUtils.js` module manages the history stack. After each edit, a new state snapshot is created, and `areHistoryEntriesEqual` prevents storing duplicate states. The undo/redo functions simply navigate through this array of snapshots.

- **Marquee Selection**: The user draws a selection rectangle on the Interaction Canvas. A contextual button then appears, allowing the user to fill the selected area on the Image Canvas.


## 🚢 Deployment

The application is deployed on Vercel. To deploy your own version:

1. Fork the repository
2. Sign up for a [Vercel](https://vercel.com) account
3. Import your forked repository
4. Deploy with default settings


## 🧰 Development

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run lint` - Run ESLint to check for code issues
- `npm run preview` - Preview the production build locally


## 👨‍💻 Developer

This project was developed by Harsh Kathiriya, a Computer Science student at the University of Alabama.


## 📄 License

This project is available for use under the MIT License.

---

Made with ❤️ by Harsh Kathiriya

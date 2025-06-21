# Floor Plan Editor

[![Live Demo](https://img.shields.io/badge/demo-online-green.svg)](https://floorplan-nu.vercel.app/)

An interactive web-based floor plan editor that allows users to upload, edit, and customize floor plans with various tools and features.

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
│   ├── components/      # React components
│   ├── contexts/        # React contexts
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utility functions
│   ├── assets/          # Static assets
│   ├── App.jsx          # Main application component
│   └── main.jsx         # Application entry point
├── public/              # Public assets
└── index.html           # HTML entry point
```

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

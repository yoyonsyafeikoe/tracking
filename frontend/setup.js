import { writeFileSync, mkdirSync } from 'fs';

// Create folders
mkdirSync('src', { recursive: true });
mkdirSync('src/pages', { recursive: true });
mkdirSync('src/routes', { recursive: true });
mkdirSync('src/store', { recursive: true });

// package.json
writeFileSync('package.json', `
{
  "name": "node-tracker-frontend",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@reduxjs/toolkit": "^1.9.5",
    "axios": "^1.5.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-redux": "^8.1.1",
    "react-router-dom": "^6.22.0",
    "socket.io-client": "^4.7.2"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^0.2.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.38",
    "tailwindcss": "^4.0.2",
    "vite": "^5.2.0"
  }
}
`.trim());

// vite.config.js
writeFileSync('vite.config.js', `
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
`.trim());

// tailwind.config.js
writeFileSync('tailwind.config.js', `
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
}
`.trim());

// postcss.config.js
writeFileSync('postcss.config.js', `
import tailwindcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';

export default {
  plugins: [
    tailwindcss(),
    autoprefixer()
  ]
}
`.trim());

// index.html
writeFileSync('index.html', `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Node Tracker Frontend</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`.trim());

// src/index.css
writeFileSync('src/index.css', `
@tailwind base;
@tailwind components;
@tailwind utilities;
`.trim());

// src/main.jsx
writeFileSync('src/main.jsx', `
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store/store';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
`.trim());

// src/App.jsx
writeFileSync('src/App.jsx', `
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
`.trim());

// src/routes/AppRoutes.jsx
writeFileSync('src/routes/AppRoutes.jsx', `
import { Routes, Route } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import AdminDashboard from '../pages/AdminDashboard';
import DriverDashboard from '../pages/DriverDashboard';
import GuideDashboard from '../pages/GuideDashboard';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/driver" element={<DriverDashboard />} />
      <Route path="/guide" element={<GuideDashboard />} />
    </Routes>
  );
}
`.trim());

// src/pages/LoginPage.jsx
writeFileSync('src/pages/LoginPage.jsx', `
export default function LoginPage() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <h1 className="text-3xl font-bold">Login Page</h1>
    </div>
  );
}
`.trim());

// src/pages/AdminDashboard.jsx
writeFileSync('src/pages/AdminDashboard.jsx', `
export default function AdminDashboard() {
  return (
    <h1 className="text-2xl text-center mt-10">Admin Dashboard</h1>
  );
}
`.trim());

// src/pages/DriverDashboard.jsx
writeFileSync('src/pages/DriverDashboard.jsx', `
export default function DriverDashboard() {
  return (
    <h1 className="text-2xl text-center mt-10">Driver Dashboard</h1>
  );
}
`.trim());

// src/pages/GuideDashboard.jsx
writeFileSync('src/pages/GuideDashboard.jsx', `
export default function GuideDashboard() {
  return (
    <h1 className="text-2xl text-center mt-10">Guide Dashboard</h1>
  );
}
`.trim());

// src/store/store.js
writeFileSync('src/store/store.js', `
import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
  reducer: {},
});
`.trim());

console.log('✅ Project structure created successfully!');

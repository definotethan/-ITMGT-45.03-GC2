// src/main.jsx
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Absolute-from-src to avoid any relative path ambiguity
import './styles/global.css'; // Your unified CSS, ensure this file exists

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Suspense fallback={<div>Loading…</div>}>
      <App />
    </Suspense>
  </React.StrictMode>
);


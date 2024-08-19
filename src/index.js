import React from 'react';
import App from './App.js';
import './styles/styles.css';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

const appElement = document.getElementById('app');
if (appElement) {
    const root = createRoot(appElement); // Create a root.
    root.render(
        <React.StrictMode>
           <BrowserRouter>
              <App />
           </BrowserRouter>
        </React.StrictMode>
     ); // Initial render
} else {
    console.error('Failed to find the root element');
}

if (module.hot) {
   module.hot.accept('./styles/styles.css', function() {
       require('./styles/styles.css');
   });
}
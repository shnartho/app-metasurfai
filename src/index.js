import React from 'react';
import { App } from './App';
import './styles/styles.css';
import { createRoot } from 'react-dom/client';

const appElement = document.getElementById('app');
if (appElement) {
    const root = createRoot(appElement); // Create a root.
    root.render(<App />); // Initial render
} else {
    console.error('Failed to find the root element');
}
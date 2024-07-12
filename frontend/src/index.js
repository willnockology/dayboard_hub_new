import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './global.css';

const container = document.getElementById('root');
const root = createRoot(container); // createRoot instead of ReactDOM.render
root.render(<App />);

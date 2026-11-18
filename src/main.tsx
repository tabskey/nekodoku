import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './theme.css';

// Follows the device for now; the Options screen (Phase 5) will override it.
document.documentElement.dataset.theme = window.matchMedia(
  '(prefers-color-scheme: light)',
).matches
  ? 'light'
  : 'dark';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

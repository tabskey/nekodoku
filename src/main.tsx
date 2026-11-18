import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { OptionsProvider } from './state/OptionsProvider';
import './theme.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <OptionsProvider>
      <App />
    </OptionsProvider>
  </StrictMode>,
);

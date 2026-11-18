import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { unlockAudio } from './audio/audio';
import { ProfileProvider } from './state/ProfileProvider';
import './theme.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProfileProvider>
      <App />
    </ProfileProvider>
  </StrictMode>,
);

// Browsers only allow audio after a gesture; resuming on every tap also
// recovers a context the system suspended (iOS does this in the background).
window.addEventListener('pointerdown', unlockAudio, { capture: true });

// Production only: in dev the worker would cache stale modules between reloads.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`);
}

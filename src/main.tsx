import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { unlockAudio } from './audio/audio';
import { registerServiceWorker } from './pwa/update';
import { ProfileProvider } from './state/ProfileProvider';
import './theme.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProfileProvider>
      <App />
    </ProfileProvider>
  </StrictMode>,
);

// Browsers only allow audio after a gesture, so the music starts on the
// player's first touch, click or key, anywhere. iOS counts only the end of a
// touch or a click, not its start, so listen to all of them. Resuming on
// every one also recovers a context the system suspended (iOS does this in
// the background); once running, unlockAudio does nothing.
for (const type of [
  'pointerdown',
  'pointerup',
  'touchend',
  'click',
  'keydown',
]) {
  window.addEventListener(type, unlockAudio, { capture: true });
}

registerServiceWorker();

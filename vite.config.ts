/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// GitHub Pages serves this app from /nekodoku/, so every asset URL must be
// relative to that path. See "Routing on GitHub Pages" in docs/ARCHITECTURE.md.
export default defineConfig({
  base: '/nekodoku/',
  plugins: [react()],
  test: {
    environment: 'node',
    // No tests exist yet; game-logic tests start in roadmap Phase 2.
    passWithNoTests: true,
  },
});

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
    // Coverage for SonarQube: lcov is the format it reads. Run with
    // `npm run test:coverage`; the report lands in coverage/ (git-ignored).
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/test/**'],
    },
  },
});

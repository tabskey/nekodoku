/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';

// Writes dist/sw.js from src/sw.js with the list of every built file, so the
// service worker can cache the whole game, hashed file names included.
function serviceWorker(): Plugin {
  let root = '';
  let outDir = '';
  return {
    name: 'nekodoku-sw',
    apply: 'build',
    configResolved(config) {
      root = config.root;
      outDir = resolve(root, config.build.outDir);
    },
    closeBundle() {
      const files = readdirSync(outDir, {
        recursive: true,
        withFileTypes: true,
      })
        .filter((entry) => entry.isFile())
        .map((entry) =>
          join(entry.parentPath, entry.name)
            .slice(outDir.length + 1)
            .replaceAll('\\', '/'),
        )
        .filter((file) => file !== 'sw.js' && file !== 'index.html')
        .sort();
      const list = ['./', ...files];
      const version = createHash('sha256')
        .update(list.join('\n'))
        .update(readFileSync(join(outDir, 'index.html')))
        .digest('hex')
        .slice(0, 12);
      const source = readFileSync(resolve(root, 'src/sw.js'), 'utf8')
        .replace('__CACHE__', `nekodoku-${version}`)
        .replace('__FILES__', JSON.stringify(list));
      writeFileSync(join(outDir, 'sw.js'), source);
    },
  };
}

// GitHub Pages serves this app from /nekodoku/, so every asset URL must be
// relative to that path. See "Routing on GitHub Pages" in docs/ARCHITECTURE.md.
export default defineConfig({
  base: '/nekodoku/',
  plugins: [react(), serviceWorker()],
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

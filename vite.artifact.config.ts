import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { viteSingleFile } from 'vite-plugin-singlefile'
import path from 'node:path'

/**
 * Preview build: the whole app as ONE self-contained HTML file — JS, CSS and
 * fonts inlined as data URIs, no service worker. Used for sharing a runnable
 * preview (e.g. a Claude artifact) without deploying.
 *
 *   npm run build:artifact   →  dist-artifact/index.html
 */
export default defineConfig({
  base: './',
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, 'src') },
  },
  plugins: [
    react(),
    tailwindcss(),
    // Keeps the virtual pwa-register module resolvable as a no-op.
    VitePWA({ disable: true }),
    viteSingleFile(),
  ],
  build: {
    outDir: 'dist-artifact',
    assetsInlineLimit: 100_000_000,
  },
})

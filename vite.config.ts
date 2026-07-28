/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'

// GitHub Pages serves project sites under /<repo-name>/. Deriving the base
// from CI's repository variable means renaming the repo needs no code change —
// the next deploy simply lands on the new URL.
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'mealslots'

export default defineConfig({
  base: `/${repoName}/`,
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, 'src') },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icons/apple-touch-icon.png'],
      manifest: {
        name: 'Nom Nom Gacha',
        short_name: 'Nom Nom',
        description:
          'A friendly food slot machine that helps you decide what to eat. Every spin is a win!',
        lang: 'nb',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '.',
        scope: '.',
        background_color: '#F5EFDF',
        theme_color: '#F5EFDF',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // The whole app must work offline; fonts and icons are precached.
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        // Control open pages as soon as the first install activates, so the
        // app is offline-capable from the very first visit.
        clientsClaim: true,
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    globals: false,
  },
})

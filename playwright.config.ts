import { defineConfig, devices } from '@playwright/test'
import fs from 'node:fs'

// The remote dev container pre-installs Chromium at a fixed path; CI installs
// its own matching browsers via `playwright install`.
const preinstalledChromium = '/opt/pw-browsers/chromium'
const executablePath =
  !process.env.CI && fs.existsSync(preinstalledChromium) ? preinstalledChromium : undefined

// Must match the base path derivation in vite.config.ts.
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'mealslots'
const baseURL = `http://localhost:4173/${repoName}/`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  timeout: 45_000,
  use: {
    baseURL,
    trace: 'on-first-retry',
    launchOptions: {
      ...(executablePath ? { executablePath } : {}),
      // The remote dev container runs as root, where Chromium's sandbox
      // cannot start; CI runs unprivileged and ignores the flag's absence.
      args: process.env.CI ? [] : ['--no-sandbox'],
    },
  },
  projects: [
    // Both projects run on the Chromium engine (the only browser installed
    // here and in CI); the iPhone project contributes its viewport, touch and
    // device-scale characteristics rather than the WebKit engine.
    { name: 'android', use: { ...devices['Pixel 7'], browserName: 'chromium' } },
    { name: 'ios', use: { ...devices['iPhone 14'], browserName: 'chromium' } },
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173 --strictPort',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})

import { defineConfig, devices } from '@playwright/test'
import fs from 'node:fs'

// The remote dev container pre-installs Chromium at a fixed path; CI installs
// its own matching browsers via `playwright install`.
const preinstalledChromium = '/opt/pw-browsers/chromium'
const executablePath =
  !process.env.CI && fs.existsSync(preinstalledChromium) ? preinstalledChromium : undefined

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  timeout: 45_000,
  use: {
    baseURL: 'http://localhost:4173/mealslots/',
    trace: 'on-first-retry',
    launchOptions: executablePath ? { executablePath } : {},
  },
  projects: [
    { name: 'android', use: { ...devices['Pixel 7'] } },
    { name: 'ios', use: { ...devices['iPhone 14'] } },
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173/mealslots/',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})

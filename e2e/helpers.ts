import type { Page } from '@playwright/test'

export const PIN = ['1', '2', '3', '4']

export async function enterPin(page: Page, digits: string[] = PIN): Promise<void> {
  for (const d of digits) {
    await page.getByRole('button', { name: d, exact: true }).click()
  }
}

/** Walk the first-run wizard in English with PIN 1234, keeping seed foods. */
export async function completeOnboarding(page: Page): Promise<void> {
  await page.getByTestId('onb-lang-en').click()
  await page.getByTestId('onb-next').click()
  await page.getByTestId('onb-next').click()
  await enterPin(page) // set
  await enterPin(page) // confirm
  await page.getByTestId('onb-done').click()
}

/** Seeded URL so every spin is deterministic. */
export function appUrl(seed = 42): string {
  return `./?testSeed=${seed}`
}

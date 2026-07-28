import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { appUrl, completeOnboarding, enterPin } from './helpers'

test.describe('first run', () => {
  test('onboarding reaches the machine in a handful of taps', async ({ page }) => {
    await page.goto(appUrl())
    await expect(page.getByTestId('onb-lang-en')).toBeVisible()
    await completeOnboarding(page)
    await expect(page.getByTestId('spin')).toBeVisible()
    // Onboarding survives a reload.
    await page.reload()
    await expect(page.getByTestId('spin')).toBeVisible()
  })

  test('onboarding is accessible', async ({ page }) => {
    await page.goto(appUrl())
    // Let entrance animations finish — axe reads blended colors mid-fade.
    await page.waitForTimeout(700)
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })
})

test.describe('spinning', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(appUrl())
    await completeOnboarding(page)
  })

  test('spin → celebrate → eat → collection credit', async ({ page }) => {
    await page.getByTestId('spin').click()
    await expect(page.getByTestId('result-name')).toBeVisible({ timeout: 10_000 })
    const name = (await page.getByTestId('result-name').textContent())!.trim()
    expect(name.length).toBeGreaterThan(0)

    await page.getByRole('button', { name: "Let's eat!" }).click()
    await expect(page.getByTestId('result-name')).toBeHidden({ timeout: 5_000 })

    await page.getByTestId('nav-collection').click()
    const unlocked = page.locator('[data-testid="collection-card"][data-unlocked="true"]')
    await expect(unlocked).toHaveCount(1)
    await expect(unlocked).toContainText(name)
  })

  test('spin again respins without logging', async ({ page }) => {
    await page.getByTestId('spin').click()
    await expect(page.getByTestId('result-name')).toBeVisible({ timeout: 10_000 })
    await page.getByRole('button', { name: 'Spin again' }).click()
    await expect(page.getByTestId('result-name')).toBeHidden({ timeout: 5_000 })
    await expect(page.getByTestId('result-name')).toBeVisible({ timeout: 10_000 })
    await page.getByRole('button', { name: "Let's eat!" }).click()
    await expect(page.getByTestId('result-name')).toBeHidden({ timeout: 5_000 })
    await page.getByTestId('nav-collection').click()
    await expect(
      page.locator('[data-testid="collection-card"][data-unlocked="true"]'),
    ).toHaveCount(1)
  })

  test('meal type switching changes the pool', async ({ page }) => {
    // Breakfast-only foods must never land on a dinner spin.
    await page.getByTestId('meal-dinner').click()
    await page.getByTestId('spin').click()
    await expect(page.getByTestId('result-name')).toBeVisible({ timeout: 10_000 })
    const name = (await page.getByTestId('result-name').textContent())!.trim()
    expect(['Yogurt', 'Oatmeal', 'Toast']).not.toContain(name)
  })

  test('machine screen is accessible', async ({ page }) => {
    // Let entrance animations finish — axe reads blended colors mid-fade.
    await page.waitForTimeout(700)
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })
})

test.describe('star drops', () => {
  test('a guaranteed star drop shows the golden reveal', async ({ page }) => {
    await page.goto(appUrl(7))
    await completeOnboarding(page)

    // Parent enables star drops at max chance and marks a dinner food as star.
    await page.getByTestId('nav-settings').click()
    await enterPin(page)
    await page.getByTestId('food-row-pizza').click()
    await page.getByTestId('food-star').check()
    await page.getByTestId('save-food').click()
    await page.getByTestId('section-machine').click()
    await page.getByTestId('star-toggle').check()
    // Max the slider via keyboard for reliability.
    const slider = page.locator('input[type="range"]')
    await slider.focus()
    for (let i = 0; i < 20; i++) await page.keyboard.press('ArrowRight')
    await page.getByTestId('back').click()

    // 15% chance with a fixed seed: spin until the star lands (bounded).
    await page.getByTestId('meal-dinner').click()
    let sawStar = false
    for (let i = 0; i < 30 && !sawStar; i++) {
      await page.getByTestId('spin').click()
      await expect(page.getByTestId('result-name')).toBeVisible({ timeout: 10_000 })
      sawStar = await page
        .getByText(/RARE FOOD!/)
        .isVisible()
        .catch(() => false)
      if (!sawStar) {
        await page.getByRole('button', { name: 'Spin again' }).click()
        await expect(page.getByTestId('result-name')).toBeHidden({ timeout: 5_000 })
      }
    }
    expect(sawStar).toBe(true)
    await expect(page.getByTestId('result-name')).toHaveText('Pizza')
  })
})

test.describe('parent settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(appUrl())
    await completeOnboarding(page)
    await page.getByTestId('nav-settings').click()
    await enterPin(page)
  })

  test('wrong PIN is rejected', async ({ page }) => {
    await page.getByTestId('back').click()
    await page.getByTestId('nav-settings').click()
    await enterPin(page, ['9', '9', '9', '9'])
    await expect(page.getByRole('alert')).toContainText('Wrong PIN')
    await enterPin(page)
    await expect(page.getByTestId('section-foods')).toBeVisible()
  })

  test('food CRUD: add, edit, delete', async ({ page }) => {
    await page.getByTestId('add-food').click()
    await page.getByTestId('food-name').fill('Dumplings')
    await page.getByRole('button', { name: 'noodles', exact: true }).click()
    await page.getByTestId('save-food').click()
    await expect(page.getByTestId('food-list')).toContainText('Dumplings')

    await page.getByTestId('food-row-noodles').click()
    await page.getByTestId('food-name').fill('Gyoza')
    await page.getByTestId('save-food').click()
    await expect(page.getByTestId('food-list')).toContainText('Gyoza')

    await page.getByTestId('food-row-noodles').click()
    await page.getByTestId('delete-food').click()
    await page.getByTestId('confirm-delete').click()
    await expect(page.getByTestId('food-list')).not.toContainText('Gyoza')
  })

  test('disabling every breakfast food produces the friendly empty state', async ({ page }) => {
    for (const iconId of ['porridge', 'oatmeal', 'bread', 'yogurt', 'toast']) {
      await page.getByTestId(`food-row-${iconId}`).click()
      await page.getByRole('checkbox', { name: 'In the machine' }).uncheck()
      await page.getByTestId('save-food').click()
    }
    await page.getByTestId('back').click()
    await page.getByTestId('meal-breakfast').click()
    await expect(page.getByTestId('empty-state')).toBeVisible()
    await expect(page.getByTestId('spin')).toBeHidden()
  })

  test('language switch localizes the machine', async ({ page }) => {
    await page.getByTestId('section-app').click()
    await page.getByTestId('lang-nb').click()
    await expect(page.getByTestId('section-foods')).toContainText('Matretter')
    await page.getByTestId('back').click()
    await expect(page.getByTestId('spin')).toHaveText('SPINN')
    await expect(page.getByTestId('meal-dinner')).toContainText('Middag')
  })

  test('theme switch stamps the document', async ({ page }) => {
    await page.getByTestId('section-app').click()
    await page.getByTestId('theme-night').click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'night')
    await page.getByTestId('theme-day').click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'day')
  })

  test('export downloads a backup and import round-trips', async ({ page }) => {
    await page.getByTestId('section-data').click()
    const downloadPromise = page.waitForEvent('download')
    await page.getByTestId('export').click()
    const download = await downloadPromise
    const path = await download.path()
    expect(path).toBeTruthy()

    // Import the same file back and confirm the preview mentions 15 foods.
    const chooserPromise = page.waitForEvent('filechooser')
    await page.getByTestId('import').click()
    const chooser = await chooserPromise
    await chooser.setFiles(path!)
    await expect(page.getByRole('dialog')).toContainText('15 foods')
    await page.getByRole('button', { name: 'Import', exact: true }).click()
    await expect(page.getByRole('dialog')).toBeHidden()
  })

  test('settings screen is accessible', async ({ page }) => {
    // Let entrance animations finish — axe reads blended colors mid-fade.
    await page.waitForTimeout(700)
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })
})

test.describe('offline PWA', () => {
  test('the app works offline after first load', async ({ page, context }) => {
    await page.goto(appUrl())
    await completeOnboarding(page)
    // Let the service worker install, precache everything and take control.
    await page.waitForFunction(
      () => navigator.serviceWorker.controller != null,
      undefined,
      { timeout: 30_000 },
    )

    await context.setOffline(true)
    await page.reload()
    await expect(page.getByTestId('spin')).toBeVisible({ timeout: 15_000 })
    await page.getByTestId('spin').click()
    await expect(page.getByTestId('result-name')).toBeVisible({ timeout: 10_000 })
    await context.setOffline(false)
  })
})

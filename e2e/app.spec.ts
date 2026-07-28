import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import jsQR from 'jsqr'
import { appUrl, completeOnboarding, enterPin } from './helpers'
import { decodeSetupPayload } from '../src/data/qr'

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

  test('spin → result lines → tap to eat → collection credit', async ({ page }) => {
    await page.getByTestId('spin').click()
    await expect(page.getByTestId('result-line')).toHaveCount(3, { timeout: 10_000 })
    const firstLine = page.getByTestId('result-line').first()
    const name = (await firstLine.textContent())!.trim()
    expect(name.length).toBeGreaterThan(0)

    await firstLine.click()
    await expect(firstLine).toContainText('✓')
    await expect(page.getByTestId('enjoy')).toBeVisible()

    await page.getByTestId('nav-collection').click()
    const unlocked = page.locator('[data-testid="collection-card"][data-unlocked="true"]')
    await expect(unlocked).toHaveCount(1)
    await expect(unlocked).toContainText(name)
  })

  test('spinning again replaces the result without logging', async ({ page }) => {
    await page.getByTestId('spin').click()
    await expect(page.getByTestId('result-line')).toHaveCount(3, { timeout: 10_000 })
    // No modal to dismiss — the spin button itself is the "spin again".
    await page.getByTestId('spin').click()
    await expect(page.getByTestId('result-line')).toHaveCount(0)
    await expect(page.getByTestId('result-line')).toHaveCount(3, { timeout: 10_000 })
    await page.getByTestId('result-line').first().click()
    await page.getByTestId('nav-collection').click()
    await expect(
      page.locator('[data-testid="collection-card"][data-unlocked="true"]'),
    ).toHaveCount(1)
  })

  test('meal type switching changes the pool', async ({ page }) => {
    // Breakfast-only foods must never land on a dinner spin.
    await page.getByTestId('meal-dinner').click()
    await page.getByTestId('spin').click()
    await expect(page.getByTestId('result-line')).toHaveCount(3, { timeout: 10_000 })
    for (const line of await page.getByTestId('result-line').all()) {
      const name = (await line.textContent())!.trim()
      expect(['Yogurt', 'Oatmeal', 'Toast']).not.toContain(name)
    }
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
      await expect(page.getByTestId('result-line')).toHaveCount(3, { timeout: 10_000 })
      sawStar = await page
        .getByText(/RARE FOOD!/)
        .isVisible()
        .catch(() => false)
    }
    expect(sawStar).toBe(true)
    // A star drop fills every reel with the challenge food.
    for (const line of await page.getByTestId('result-line').all()) {
      await expect(line).toHaveText('Pizza')
    }
  })
})

test.describe('jackpots', () => {
  test('three of a kind fires the in-place fireworks banner, no popup', async ({ page }) => {
    await page.goto(appUrl())
    await completeOnboarding(page)

    // Leave only one breakfast food enabled → every reel lands on it.
    await page.getByTestId('nav-settings').click()
    await enterPin(page)
    for (const iconId of ['porridge', 'oatmeal', 'bread', 'yogurt']) {
      await page.getByTestId(`food-row-${iconId}`).click()
      await page.getByRole('checkbox', { name: 'In the machine' }).uncheck()
      await page.getByTestId('save-food').click()
    }
    await page.getByTestId('back').click()

    await page.getByTestId('meal-breakfast').click()
    await page.getByTestId('spin').click()
    await expect(page.getByTestId('jackpot-banner')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByTestId('jackpot-banner')).toContainText('JACKPOT!')
    // The celebration happens in the playing area — no dialog appears...
    await expect(page.getByRole('dialog')).toHaveCount(0)
    // ...the result lines all show the food, and the banner auto-dismisses.
    for (const line of await page.getByTestId('result-line').all()) {
      await expect(line).toHaveText('Toast')
    }
    await expect(page.getByTestId('jackpot-banner')).toBeHidden({ timeout: 5_000 })
  })

  test('a custom combination can be added in settings', async ({ page }) => {
    await page.goto(appUrl())
    await completeOnboarding(page)
    await page.getByTestId('nav-settings').click()
    await enterPin(page)
    await page.getByTestId('section-machine').click()
    await expect(page.getByTestId('jackpot-threeofakind')).toBeChecked()
    await page.getByTestId('add-combo').click()
    await expect(page.getByTestId('jackpot-combo')).toHaveCount(1)
    // The combination survives a reload.
    await page.reload()
    await page.getByTestId('nav-settings').click()
    await enterPin(page)
    await page.getByTestId('section-machine').click()
    await expect(page.getByTestId('jackpot-combo')).toHaveCount(1)
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
    await expect(page.getByRole('dialog')).toContainText('This backup contains 15 foods')
    await page.getByRole('button', { name: 'Import', exact: true }).click()
    await expect(page.getByRole('dialog')).toBeHidden()
  })

  test('setup share round-trips without touching history', async ({ page }) => {
    // Log a meal first so there is history to preserve.
    await page.getByTestId('back').click()
    await page.getByTestId('spin').click()
    await expect(page.getByTestId('result-line')).toHaveCount(3, { timeout: 10_000 })
    await page.getByTestId('result-line').first().click()

    await page.getByTestId('nav-settings').click()
    await enterPin(page)
    await page.getByTestId('section-data').click()
    const downloadPromise = page.waitForEvent('download')
    await page.getByTestId('share-setup').click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toContain('setup')
    const path = await download.path()

    const chooserPromise = page.waitForEvent('filechooser')
    await page.getByTestId('import').click()
    const chooser = await chooserPromise
    await chooser.setFiles(path!)
    await expect(page.getByRole('dialog')).toContainText('This setup contains 15 foods')
    await page.getByRole('button', { name: 'Import', exact: true }).click()
    await expect(page.getByRole('dialog')).toBeHidden()

    // History survived the setup import.
    await page.getByTestId('section-history').click()
    await expect(page.getByTestId('history-list').locator('li')).toHaveCount(1)
  })

  test('the setup QR code renders and actually decodes to the setup', async ({ page }) => {
    await page.getByTestId('section-data').click()
    await page.getByTestId('show-qr').click()
    await expect(page.getByTestId('qr-canvas')).toBeVisible()

    // The canvas paints asynchronously; poll until jsQR can read it.
    let payload = ''
    await expect(async () => {
      const image = await page.evaluate(() => {
        const canvas = document.querySelector('[data-testid="qr-canvas"]') as HTMLCanvasElement
        const ctx = canvas.getContext('2d')
        if (!ctx || canvas.width === 0) return null
        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height)
        return { data: Array.from(pixels.data), width: pixels.width, height: pixels.height }
      })
      expect(image).not.toBeNull()
      const code = jsQR(new Uint8ClampedArray(image!.data), image!.width, image!.height)
      expect(code).not.toBeNull()
      payload = code!.data
    }).toPass({ timeout: 10_000 })

    const json = await decodeSetupPayload(payload)
    const setup = JSON.parse(json)
    expect(setup.app).toBe('nomnom-gacha')
    expect(setup.kind).toBe('setup')
    expect(setup.foods).toHaveLength(15)
    expect(setup.machine.slotMode).toBe('single')
    expect(setup.log).toBeUndefined()
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
    await expect(page.getByTestId('result-line')).toHaveCount(3, { timeout: 10_000 })
    await context.setOffline(false)
  })
})

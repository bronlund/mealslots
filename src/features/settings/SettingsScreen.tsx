import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Food, Language, MealType, ThemeChoice } from '../../data/types'
import { MEAL_TYPES } from '../../data/types'
import { useAppStore, persistNow } from '../../data/store'
import { eligibleFoods } from '../../engine/spin'
import { exportState, parseImport, type ImportPreview } from '../../data/exportImport'
import { hashPin, makeSalt } from '../../data/pin'
import { FoodIconSvg } from '../../icons/foods'
import { Panel } from '../../components/Panel'
import { Button } from '../../components/Button'
import { Pill } from '../../components/Pill'
import { PinPad } from '../../components/PinPad'
import { Modal } from '../../components/Modal'
import { FoodEditor, type FoodDraft } from './FoodEditor'

type Section = 'foods' | 'machine' | 'app' | 'history' | 'data'
const SECTIONS: Section[] = ['foods', 'machine', 'app', 'history', 'data']

export function SettingsScreen() {
  const { t } = useTranslation()
  const [section, setSection] = useState<Section>('foods')

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-center font-display text-2xl font-bold text-gold-deep">
        {t('settings.title')}
      </h1>
      <div className="flex flex-wrap justify-center gap-1.5">
        {SECTIONS.map((s) => (
          <Pill key={s} active={section === s} onClick={() => setSection(s)} data-testid={`section-${s}`}>
            {t(`settings.${s}`)}
          </Pill>
        ))}
      </div>
      {section === 'foods' && <FoodsSection />}
      {section === 'machine' && <MachineSection />}
      {section === 'app' && <AppSection />}
      {section === 'history' && <HistorySection />}
      {section === 'data' && <DataSection />}
    </div>
  )
}

function FoodsSection() {
  const { t } = useTranslation()
  const foods = useAppStore((s) => s.foods)
  const addFood = useAppStore((s) => s.addFood)
  const updateFood = useAppStore((s) => s.updateFood)
  const deleteFood = useAppStore((s) => s.deleteFood)
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<Food | null>(null)
  const [creating, setCreating] = useState(false)

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = q ? foods.filter((f) => f.name.toLowerCase().includes(q)) : foods
    return [...list].sort((a, b) => a.name.localeCompare(b.name))
  }, [foods, query])

  const open = creating || editing != null

  function handleSave(draft: FoodDraft) {
    if (editing) {
      updateFood(editing.id, draft)
    } else {
      addFood(draft)
    }
    setEditing(null)
    setCreating(false)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('settings.searchFoods')}
          className="min-h-11 flex-1 rounded-lg border-2 border-gold bg-surface px-3 font-body text-base text-ink"
        />
        <Button variant="primary" onClick={() => setCreating(true)} data-testid="add-food">
          + {t('settings.addFood')}
        </Button>
      </div>
      <ul className="flex flex-col gap-2" data-testid="food-list">
        {shown.map((food) => (
          <li key={food.id}>
            <button
              onClick={() => setEditing(food)}
              data-testid={`food-row-${food.iconId}`}
              className={`flex w-full items-center gap-3 rounded-xl border-2 border-gold bg-surface p-2 text-left shadow-panel ${
                food.enabled ? '' : 'opacity-50'
              }`}
            >
              <span className="h-11 w-11 shrink-0">
                <FoodIconSvg iconId={food.iconId} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-body text-base font-bold text-ink">
                  {food.isStar && <span aria-label={t('settings.starBadge')}>⭐ </span>}
                  {food.name}
                </span>
                <span className="block truncate font-body text-xs text-ink-soft">
                  {food.mealTypes.map((m) => t(`meal.${m}`)).join(' · ')}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <FoodEditor
        open={open}
        editingFood={editing}
        initial={
          editing
            ? {
                name: editing.name,
                iconId: editing.iconId,
                enabled: editing.enabled,
                weight: editing.weight,
                isStar: editing.isStar,
                mealTypes: [...editing.mealTypes],
                comboCategory: editing.comboCategory,
              }
            : null
        }
        onSave={handleSave}
        onDelete={
          editing
            ? () => {
                deleteFood(editing.id)
                setEditing(null)
              }
            : undefined
        }
        onClose={() => {
          setEditing(null)
          setCreating(false)
        }}
      />
    </div>
  )
}

function MachineSection() {
  const { t } = useTranslation()
  const settings = useAppStore((s) => s.settings)
  const foods = useAppStore((s) => s.foods)
  const updateSettings = useAppStore((s) => s.updateSettings)

  const mealsWithoutFoods = MEAL_TYPES.filter(
    (meal: MealType) => eligibleFoods(foods, meal, { star: false }).length === 0,
  )

  return (
    <Panel ornate={false} className="flex flex-col gap-5 p-4">
      <fieldset>
        <legend className="mb-1 font-body text-base font-bold text-ink">{t('settings.slotMode')}</legend>
        <div className="flex gap-1.5">
          <Pill
            active={settings.slotMode === 'single'}
            onClick={() => updateSettings({ slotMode: 'single' })}
          >
            {t('settings.slotModeSingle')}
          </Pill>
          <Pill
            active={settings.slotMode === 'combo'}
            onClick={() => updateSettings({ slotMode: 'combo' })}
            data-testid="mode-combo"
          >
            {t('settings.slotModeCombo')}
          </Pill>
        </div>
        <p className="mt-1 font-body text-xs text-ink-soft">
          {settings.slotMode === 'single'
            ? t('settings.slotModeSingleHint')
            : t('settings.slotModeComboHint')}
        </p>
      </fieldset>

      <fieldset>
        <label className="flex items-center justify-between gap-2 font-body text-base font-bold text-ink">
          ⭐ {t('settings.starDrops')}
          <input
            type="checkbox"
            checked={settings.starDropsEnabled}
            onChange={(e) => updateSettings({ starDropsEnabled: e.target.checked })}
            className="h-6 w-6 accent-(--nn-star)"
            data-testid="star-toggle"
          />
        </label>
        <p className="mt-1 font-body text-xs text-ink-soft">{t('settings.starDropsHint')}</p>
        {settings.starDropsEnabled && (
          <label className="mt-2 flex items-center gap-3 font-body text-sm font-semibold text-ink">
            {t('settings.starChance')}
            <input
              type="range"
              min={1}
              max={15}
              value={Math.round(settings.starChance * 100)}
              onChange={(e) => updateSettings({ starChance: Number(e.target.value) / 100 })}
              className="flex-1 accent-(--nn-star)"
            />
            <span className="w-10 text-right tabular-nums">
              {Math.round(settings.starChance * 100)} %
            </span>
          </label>
        )}
      </fieldset>

      <fieldset>
        <legend className="mb-1 font-body text-base font-bold text-ink">{t('settings.antiRepeat')}</legend>
        <div className="flex flex-wrap gap-1.5">
          {([0, 24, 36, 48] as const).map((hours) => (
            <Pill
              key={hours}
              active={settings.antiRepeatHours === hours}
              onClick={() => updateSettings({ antiRepeatHours: hours })}
            >
              {hours === 0 ? t('settings.antiRepeatOff') : t('settings.antiRepeatHours', { hours })}
            </Pill>
          ))}
        </div>
        <p className="mt-1 font-body text-xs text-ink-soft">{t('settings.antiRepeatHint')}</p>
      </fieldset>

      {mealsWithoutFoods.length > 0 && (
        <p className="rounded-lg border-2 border-danger p-2 font-body text-xs text-danger">
          {mealsWithoutFoods.map((meal) => t('settings.noFoodsForMeal', { meal: t(`meal.${meal}`) })).join(' ')}
        </p>
      )}
    </Panel>
  )
}

function AppSection() {
  const { t } = useTranslation()
  const settings = useAppStore((s) => s.settings)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const [changingPin, setChangingPin] = useState(false)
  const [pinStep, setPinStep] = useState<{ first: string } | null>(null)
  const [pinError, setPinError] = useState('')

  async function handlePinChange(pin: string) {
    if (pinStep == null) {
      setPinStep({ first: pin })
      setPinError('')
      return
    }
    if (pin !== pinStep.first) {
      setPinError(t('pin.mismatch'))
      setPinStep(null)
      return
    }
    const salt = makeSalt()
    updateSettings({ pinSalt: salt, pinHash: await hashPin(pin, salt) })
    setChangingPin(false)
    setPinStep(null)
  }

  return (
    <Panel ornate={false} className="flex flex-col gap-5 p-4">
      <fieldset>
        <legend className="mb-1 font-body text-base font-bold text-ink">{t('settings.language')}</legend>
        <div className="flex gap-1.5">
          {(['nb', 'en'] as Language[]).map((lang) => (
            <Pill
              key={lang}
              active={settings.language === lang}
              onClick={() => updateSettings({ language: lang })}
              data-testid={`lang-${lang}`}
            >
              {lang === 'nb' ? 'Norsk' : 'English'}
            </Pill>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-1 font-body text-base font-bold text-ink">{t('settings.theme')}</legend>
        <div className="flex flex-wrap gap-1.5">
          {(['system', 'day', 'night'] as ThemeChoice[]).map((theme) => (
            <Pill
              key={theme}
              active={settings.theme === theme}
              onClick={() => updateSettings({ theme })}
              data-testid={`theme-${theme}`}
            >
              {t(`settings.theme${theme.charAt(0).toUpperCase()}${theme.slice(1)}`)}
            </Pill>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-3">
        <label className="flex items-center justify-between font-body text-base font-bold text-ink">
          {t('settings.sound')}
          <input
            type="checkbox"
            checked={settings.soundOn}
            onChange={(e) => updateSettings({ soundOn: e.target.checked })}
            className="h-6 w-6 accent-(--nn-accent)"
          />
        </label>
        <label className="flex items-center justify-between font-body text-base font-bold text-ink">
          {t('settings.haptics')}
          <input
            type="checkbox"
            checked={settings.hapticsOn}
            onChange={(e) => updateSettings({ hapticsOn: e.target.checked })}
            className="h-6 w-6 accent-(--nn-accent)"
          />
        </label>
        <fieldset>
          <legend className="mb-1 font-body text-base font-bold text-ink">{t('settings.motion')}</legend>
          <div className="flex flex-wrap gap-1.5">
            {(['system', 'on', 'off'] as const).map((choice) => (
              <Pill
                key={choice}
                active={settings.reducedMotion === choice}
                onClick={() => updateSettings({ reducedMotion: choice })}
              >
                {t(
                  choice === 'system'
                    ? 'settings.motionSystem'
                    : choice === 'on'
                      ? 'settings.motionOn'
                      : 'settings.motionOff',
                )}
              </Pill>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="border-t-2 border-gold pt-3">
        {changingPin ? (
          <div className="flex flex-col items-center gap-2">
            <PinPad
              label={pinStep == null ? t('pin.set') : t('pin.confirm')}
              error={pinError}
              onSubmit={(pin) => void handlePinChange(pin)}
            />
            <Button onClick={() => setChangingPin(false)}>{t('settings.cancel')}</Button>
          </div>
        ) : (
          <Button onClick={() => setChangingPin(true)}>{t('settings.changePin')}</Button>
        )}
      </div>
    </Panel>
  )
}

function HistorySection() {
  const { t, i18n } = useTranslation()
  const log = useAppStore((s) => s.log)
  const foods = useAppStore((s) => s.foods)
  const clearHistory = useAppStore((s) => s.clearHistory)
  const [confirming, setConfirming] = useState(false)

  const foodName = (id: string) => foods.find((f) => f.id === id)?.name ?? '?'
  const formatter = new Intl.DateTimeFormat(i18n.language === 'nb' ? 'nb-NO' : 'en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <Panel ornate={false} className="flex flex-col gap-3 p-4">
      {log.length === 0 ? (
        <p className="text-center font-body text-sm text-ink-soft">{t('settings.historyEmpty')}</p>
      ) : (
        <>
          <ul className="flex flex-col gap-2" data-testid="history-list">
            {log.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between gap-2 rounded-lg border-2 border-gold bg-surface p-2 font-body text-sm"
              >
                <span className="min-w-0">
                  <span className="block truncate font-bold text-ink">
                    {entry.wasStar && '⭐ '}
                    {entry.foodIds.map(foodName).join(' + ')}
                  </span>
                  <span className="text-xs text-ink-soft">
                    {formatter.format(new Date(entry.at))} · {t(`meal.${entry.mealType}`)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          {confirming ? (
            <div className="flex flex-col gap-2">
              <p className="font-body text-sm text-ink">{t('settings.clearHistoryConfirm')}</p>
              <div className="flex gap-2">
                <Button variant="danger" onClick={() => { clearHistory(); setConfirming(false) }}>
                  {t('settings.clearHistory')}
                </Button>
                <Button onClick={() => setConfirming(false)}>{t('settings.cancel')}</Button>
              </div>
            </div>
          ) : (
            <Button variant="danger" onClick={() => setConfirming(true)}>
              {t('settings.clearHistory')}
            </Button>
          )}
        </>
      )}
    </Panel>
  )
}

function DataSection() {
  const { t } = useTranslation()
  const replaceState = useAppStore((s) => s.replaceState)
  const fileInput = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [importError, setImportError] = useState('')

  function handleExport() {
    const s = useAppStore.getState()
    const json = exportState(
      { schemaVersion: s.schemaVersion, onboarded: s.onboarded, foods: s.foods, log: s.log, settings: s.settings },
      new Date(),
    )
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nomnom-gacha-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleFile(file: File) {
    setImportError('')
    const text = await file.text()
    const s = useAppStore.getState()
    try {
      setPreview(
        parseImport(text, {
          schemaVersion: s.schemaVersion,
          onboarded: s.onboarded,
          foods: s.foods,
          log: s.log,
          settings: s.settings,
        }),
      )
    } catch (err) {
      const kind = err instanceof Error && err.message === 'not-json' ? 'NotJson' : 'NotNomnom'
      setImportError(t(`settings.importError${kind}`))
    }
  }

  return (
    <Panel ornate={false} className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-1">
        <Button onClick={handleExport} data-testid="export">
          ⬇ {t('settings.export')}
        </Button>
        <p className="font-body text-xs text-ink-soft">{t('settings.exportHint')}</p>
      </div>
      <div className="flex flex-col gap-1">
        <Button onClick={() => fileInput.current?.click()} data-testid="import">
          ⬆ {t('settings.import')}
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleFile(file)
            e.target.value = ''
          }}
        />
        {importError && (
          <p role="alert" className="font-body text-sm font-semibold text-danger">
            {importError}
          </p>
        )}
      </div>
      <Modal open={preview != null} onClose={() => setPreview(null)} label={t('settings.import')}>
        {preview && (
          <div className="flex flex-col gap-3">
            <p className="font-body text-base text-ink">
              {t('settings.importPreview', { foods: preview.foods, log: preview.logEntries })}
            </p>
            <div className="flex gap-2">
              <Button
                variant="primary"
                onClick={() => {
                  replaceState(preview.state)
                  persistNow()
                  setPreview(null)
                }}
              >
                {t('settings.importConfirm')}
              </Button>
              <Button onClick={() => setPreview(null)}>{t('settings.cancel')}</Button>
            </div>
          </div>
        )}
      </Modal>
    </Panel>
  )
}

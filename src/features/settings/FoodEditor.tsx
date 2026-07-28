import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ComboCategory, Food, MealType, Weight } from '../../data/types'
import { MEAL_TYPES } from '../../data/types'
import { ICON_IDS, FoodIconSvg } from '../../icons/foods'
import { Modal } from '../../components/Modal'
import { Button } from '../../components/Button'
import { Pill } from '../../components/Pill'

export interface FoodDraft {
  name: string
  iconId: string
  enabled: boolean
  weight: Weight
  isStar: boolean
  mealTypes: MealType[]
  comboCategory?: ComboCategory
}

interface FoodEditorProps {
  open: boolean
  initial: FoodDraft | null
  editingFood: Food | null
  onSave: (draft: FoodDraft) => void
  onDelete?: () => void
  onClose: () => void
}

const EMPTY_DRAFT: FoodDraft = {
  name: '',
  iconId: 'plate',
  enabled: true,
  weight: 'normal',
  isStar: false,
  mealTypes: ['dinner'],
}

export function FoodEditor({ open, initial, editingFood, onSave, onDelete, onClose }: FoodEditorProps) {
  const { t } = useTranslation()
  const [draft, setDraft] = useState<FoodDraft>(EMPTY_DRAFT)
  const [confirmDelete, setConfirmDelete] = useState(false)
  // Re-sync the local draft each time the modal opens for a different target.
  const [syncedFor, setSyncedFor] = useState<string | null>(null)
  const targetKey = editingFood?.id ?? (open ? 'new' : null)
  if (open && targetKey !== syncedFor) {
    setDraft(initial ?? EMPTY_DRAFT)
    setConfirmDelete(false)
    setSyncedFor(targetKey)
  }
  if (!open && syncedFor !== null) setSyncedFor(null)

  function toggleMeal(meal: MealType) {
    setDraft((d) => {
      const has = d.mealTypes.includes(meal)
      if (has && d.mealTypes.length === 1) return d
      return {
        ...d,
        mealTypes: has ? d.mealTypes.filter((m) => m !== meal) : [...d.mealTypes, meal],
      }
    })
  }

  const canSave = draft.name.trim().length > 0

  return (
    <Modal open={open} onClose={onClose} label={editingFood ? t('settings.editFood') : t('settings.addFood')}>
      <div className="flex flex-col gap-4">
        <h3 className="font-display text-lg font-bold text-gold-deep">
          {editingFood ? t('settings.editFood') : t('settings.addFood')}
        </h3>

        <label className="flex flex-col gap-1 font-body text-sm font-semibold text-ink">
          {t('settings.name')}
          <input
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            data-testid="food-name"
            className="min-h-11 rounded-lg border-2 border-gold bg-surface px-3 font-body text-base text-ink"
          />
        </label>

        <fieldset>
          <legend className="mb-1 font-body text-sm font-semibold text-ink">{t('settings.icon')}</legend>
          <div className="grid max-h-40 grid-cols-6 gap-1.5 overflow-y-auto rounded-lg border-2 border-gold bg-surface-alt p-2">
            {ICON_IDS.map((iconId) => (
              <button
                key={iconId}
                onClick={() => setDraft((d) => ({ ...d, iconId }))}
                aria-label={iconId}
                aria-pressed={draft.iconId === iconId}
                className={`aspect-square rounded-lg border-2 p-0.5 ${
                  draft.iconId === iconId ? 'border-accent bg-surface shadow-glow' : 'border-transparent'
                }`}
              >
                <FoodIconSvg iconId={iconId} />
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-1 font-body text-sm font-semibold text-ink">
            {t('settings.mealTypes')}
          </legend>
          <div className="flex flex-wrap gap-1.5">
            {MEAL_TYPES.map((meal) => (
              <Pill key={meal} active={draft.mealTypes.includes(meal)} onClick={() => toggleMeal(meal)}>
                {t(`meal.${meal}`)}
              </Pill>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-1 font-body text-sm font-semibold text-ink">{t('settings.weight')}</legend>
          <div className="flex gap-1.5">
            {(['less', 'normal', 'more'] as Weight[]).map((w) => (
              <Pill key={w} active={draft.weight === w} onClick={() => setDraft((d) => ({ ...d, weight: w }))}>
                {t(`settings.weight${w === 'less' ? 'Less' : w === 'normal' ? 'Normal' : 'More'}`)}
              </Pill>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-1 font-body text-sm font-semibold text-ink">
            {t('settings.comboCategory')}
          </legend>
          <div className="flex flex-wrap gap-1.5">
            {([undefined, 'base', 'protein', 'extra'] as (ComboCategory | undefined)[]).map((cat) => (
              <Pill
                key={cat ?? 'none'}
                active={draft.comboCategory === cat}
                onClick={() => setDraft((d) => ({ ...d, comboCategory: cat }))}
              >
                {cat === undefined
                  ? t('settings.comboNone')
                  : t(`settings.combo${cat.charAt(0).toUpperCase()}${cat.slice(1)}`)}
              </Pill>
            ))}
          </div>
        </fieldset>

        <div className="flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 font-body text-sm font-semibold text-ink">
            <input
              type="checkbox"
              checked={draft.enabled}
              onChange={(e) => setDraft((d) => ({ ...d, enabled: e.target.checked }))}
              className="h-5 w-5 accent-(--nn-accent)"
            />
            {t('settings.enabled')}
          </label>
          <label className="flex items-center gap-2 font-body text-sm font-semibold text-ink">
            <input
              type="checkbox"
              checked={draft.isStar}
              onChange={(e) => setDraft((d) => ({ ...d, isStar: e.target.checked }))}
              className="h-5 w-5 accent-(--nn-star)"
              data-testid="food-star"
            />
            ⭐ {t('settings.starFood')}
          </label>
        </div>
        {draft.isStar && <p className="font-body text-xs text-ink-soft">{t('settings.starFoodHint')}</p>}

        {editingFood && onDelete && (
          <div className="border-t-2 border-gold pt-3">
            {confirmDelete ? (
              <div className="flex flex-col gap-2">
                <p className="font-body text-sm text-ink">
                  {t('settings.deleteConfirm', { name: editingFood.name })}
                </p>
                <div className="flex gap-2">
                  <Button variant="danger" onClick={onDelete} data-testid="confirm-delete">
                    {t('settings.delete')}
                  </Button>
                  <Button onClick={() => setConfirmDelete(false)}>{t('settings.cancel')}</Button>
                </div>
              </div>
            ) : (
              <Button variant="danger" onClick={() => setConfirmDelete(true)} data-testid="delete-food">
                {t('settings.delete')}
              </Button>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <Button
            variant="primary"
            className="flex-1"
            disabled={!canSave}
            onClick={() => onSave({ ...draft, name: draft.name.trim() })}
            data-testid="save-food"
          >
            {t('settings.save')}
          </Button>
          <Button className="flex-1" onClick={onClose}>
            {t('settings.cancel')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

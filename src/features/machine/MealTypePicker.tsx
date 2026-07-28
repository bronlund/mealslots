import { useTranslation } from 'react-i18next'
import type { MealType } from '../../data/types'
import { MEAL_TYPES } from '../../data/types'
import { Pill } from '../../components/Pill'

const MEAL_EMOJI: Record<MealType, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '✨',
}

interface MealTypePickerProps {
  value: MealType
  onChange: (mealType: MealType) => void
  disabled?: boolean
}

export function MealTypePicker({ value, onChange, disabled }: MealTypePickerProps) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-wrap justify-center gap-2" role="group" aria-label={t('settings.mealTypes')}>
      {MEAL_TYPES.map((meal) => (
        <Pill
          key={meal}
          active={value === meal}
          disabled={disabled}
          onClick={() => onChange(meal)}
          data-testid={`meal-${meal}`}
        >
          <span aria-hidden="true">{MEAL_EMOJI[meal]} </span>
          {t(`meal.${meal}`)}
        </Pill>
      ))}
    </div>
  )
}

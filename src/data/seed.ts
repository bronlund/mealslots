import type { ComboCategory, Food, Language, MealType, Weight } from './types'
import { newId } from './types'

interface SeedFood {
  iconId: string
  name: Record<Language, string>
  mealTypes: MealType[]
  comboCategory?: ComboCategory
}

/** The starter set from the project plan (§5.4) — a starting point meant to be
 *  pruned to the child's actual safe foods during onboarding. */
export const SEED_FOODS: SeedFood[] = [
  { iconId: 'pasta', name: { en: 'Pasta', nb: 'Pasta' }, mealTypes: ['lunch', 'dinner'], comboCategory: 'base' },
  { iconId: 'rice', name: { en: 'Rice', nb: 'Ris' }, mealTypes: ['dinner'], comboCategory: 'base' },
  { iconId: 'porridge', name: { en: 'Porridge', nb: 'Grøt' }, mealTypes: ['breakfast', 'dinner'] },
  { iconId: 'oatmeal', name: { en: 'Oatmeal', nb: 'Havregrøt' }, mealTypes: ['breakfast'] },
  { iconId: 'soup', name: { en: 'Soup', nb: 'Suppe' }, mealTypes: ['lunch', 'dinner'] },
  { iconId: 'tortilla', name: { en: 'Tortilla wrap', nb: 'Tortilla' }, mealTypes: ['lunch', 'dinner'], comboCategory: 'base' },
  { iconId: 'pizza', name: { en: 'Pizza', nb: 'Pizza' }, mealTypes: ['dinner'] },
  { iconId: 'pancakes', name: { en: 'Pancakes', nb: 'Pannekaker' }, mealTypes: ['dinner', 'snack'] },
  { iconId: 'fish-fingers', name: { en: 'Fish fingers', nb: 'Fiskepinner' }, mealTypes: ['dinner'], comboCategory: 'protein' },
  { iconId: 'meatballs', name: { en: 'Meatballs', nb: 'Kjøttboller' }, mealTypes: ['dinner'], comboCategory: 'protein' },
  { iconId: 'sausage', name: { en: 'Sausages', nb: 'Pølser' }, mealTypes: ['lunch', 'dinner'], comboCategory: 'protein' },
  { iconId: 'burger', name: { en: 'Burger', nb: 'Burger' }, mealTypes: ['dinner'] },
  { iconId: 'bread', name: { en: 'Bread slice', nb: 'Brødskive' }, mealTypes: ['breakfast', 'lunch', 'snack'], comboCategory: 'base' },
  { iconId: 'yogurt', name: { en: 'Yogurt', nb: 'Yoghurt' }, mealTypes: ['breakfast', 'snack'] },
  { iconId: 'toast', name: { en: 'Toast', nb: 'Toast' }, mealTypes: ['breakfast', 'snack'] },
]

export function buildSeedFoods(language: Language, now: Date): Food[] {
  return SEED_FOODS.map((seed) => {
    const food: Food = {
      id: newId(),
      name: seed.name[language],
      iconId: seed.iconId,
      enabled: true,
      weight: 'normal' as Weight,
      isStar: false,
      mealTypes: [...seed.mealTypes],
      createdAt: now.toISOString(),
    }
    if (seed.comboCategory) food.comboCategory = seed.comboCategory
    return food
  })
}

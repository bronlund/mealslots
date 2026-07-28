import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import nb from './nb.json'
import type { Language } from '../data/types'

export function detectLanguage(): Language {
  const candidates = navigator.languages ?? [navigator.language]
  for (const lang of candidates) {
    if (lang?.toLowerCase().startsWith('nb') || lang?.toLowerCase().startsWith('no')) return 'nb'
    if (lang?.toLowerCase().startsWith('en')) return 'en'
  }
  return 'nb'
}

export function initI18n(language: Language): typeof i18n {
  void i18n.use(initReactI18next).init({
    resources: { en: { translation: en }, nb: { translation: nb } },
    lng: language,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    returnEmptyString: false,
  })
  return i18n
}

export function setLanguage(language: Language): void {
  void i18n.changeLanguage(language)
  document.documentElement.lang = language
}

export default i18n

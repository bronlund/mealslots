import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/cinzel/600.css'
import '@fontsource/cinzel/700.css'
import '@fontsource/nunito/400.css'
import '@fontsource/nunito/600.css'
import '@fontsource/nunito/700.css'
import '@fontsource/nunito/800.css'
import './styles/global.css'
import { initI18n, detectLanguage } from './i18n'
import { useAppStore } from './data/store'
import { App } from './app/App'

const stored = useAppStore.getState()
initI18n(stored.onboarded ? stored.settings.language : detectLanguage())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

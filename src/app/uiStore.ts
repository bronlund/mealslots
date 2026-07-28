import { create } from 'zustand'

export type Screen = 'machine' | 'collection' | 'settings'

interface UiStore {
  screen: Screen
  /** True while the parent has an unlocked settings session. */
  settingsUnlocked: boolean
  setScreen: (screen: Screen) => void
  unlockSettings: () => void
  lockSettings: () => void
}

export const useUiStore = create<UiStore>((set) => ({
  screen: 'machine',
  settingsUnlocked: false,
  setScreen: (screen) =>
    set((s) => ({
      screen,
      // Leaving settings re-locks the parent area.
      settingsUnlocked: screen === 'settings' ? s.settingsUnlocked : false,
    })),
  unlockSettings: () => set({ settingsUnlocked: true }),
  lockSettings: () => set({ settingsUnlocked: false }),
}))

import { create } from 'zustand'
import type { MaterialType } from './engine/verlet'

interface AppState {
  material: MaterialType
  setMaterial: (m: MaterialType) => void
  tearMode: boolean
  setTearMode: (t: boolean) => void
  showPins: boolean
  setShowPins: (s: boolean) => void
  showStress: boolean
  setShowStress: (s: boolean) => void
  windEnabled: boolean
  setWindEnabled: (w: boolean) => void
  windStrength: number
  setWindStrength: (s: number) => void
  paused: boolean
  setPaused: (p: boolean) => void
  stats: { points: number; constraints: number; broken: number; fps: number }
  setStats: (s: Partial<AppState['stats']>) => void
  showOnboarding: boolean
  setShowOnboarding: (s: boolean) => void
}

export const useStore = create<AppState>((set) => ({
  material: 'silk',
  setMaterial: (m) => set({ material: m }),
  tearMode: false,
  setTearMode: (t) => set({ tearMode: t }),
  showPins: true,
  setShowPins: (s) => set({ showPins: s }),
  showStress: false,
  setShowStress: (s) => set({ showStress: s }),
  windEnabled: false,
  setWindEnabled: (w) => set({ windEnabled: w }),
  windStrength: 0.5,
  setWindStrength: (s) => set({ windStrength: s }),
  paused: false,
  setPaused: (p) => set({ paused: p }),
  stats: { points: 0, constraints: 0, broken: 0, fps: 60 },
  setStats: (s) => set((state) => ({ stats: { ...state.stats, ...s } })),
  showOnboarding: !localStorage.getItem('tensile-onboarded'),
  setShowOnboarding: (s) => set({ showOnboarding: s }),
}))

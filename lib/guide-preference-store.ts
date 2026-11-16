import { create } from 'zustand'

interface GuidePreferenceState {
  guideEnabled: boolean
  setGuideEnabled: (enabled: boolean) => void
}

export const useGuidePreferenceStore = create<GuidePreferenceState>((set) => ({
  guideEnabled: true,
  setGuideEnabled: (enabled) => set({ guideEnabled: enabled }),
}))

'use client'

import { create } from 'zustand'
import type {
  AppTab,
  AuthMode,
  EventRecord,
  SessionUser,
  View,
} from './types'

interface AppState {
  view: View
  authMode: AuthMode
  user: SessionUser | null
  hydrated: boolean

  // Event creation wizard
  wizardTemplateId: string | null

  // App shell
  events: EventRecord[]
  currentEvent: EventRecord | null
  appTab: AppTab
  builderOpen: boolean

  // Public preview
  publicSlug: string | null

  setView: (view: View) => void
  openAuth: (mode: AuthMode) => void
  openOnboarding: (templateId?: string | null) => void
  setUser: (user: SessionUser | null) => void
  setHydrated: (v: boolean) => void
  setEvents: (events: EventRecord[]) => void
  setCurrentEvent: (event: EventRecord | null) => void
  setAppTab: (tab: AppTab) => void
  setBuilderOpen: (open: boolean) => void
  openPublic: (slug: string) => void
  closePublic: () => void
  reset: () => void
}

export const useApp = create<AppState>((set) => ({
  view: 'marketing',
  authMode: 'login',
  user: null,
  hydrated: false,

  wizardTemplateId: null,

  events: [],
  currentEvent: null,
  appTab: 'overview',
  builderOpen: false,

  publicSlug: null,

  setView: (view) => set({ view, builderOpen: false }),
  openAuth: (authMode) => set({ view: 'auth', authMode }),
  openOnboarding: (templateId = null) => set({ view: 'onboarding', wizardTemplateId: templateId }),
  setUser: (user) => set({ user }),
  setHydrated: (hydrated) => set({ hydrated }),
  setEvents: (events) => set({ events }),
  setCurrentEvent: (currentEvent) => set({ currentEvent }),
  setAppTab: (appTab) => set({ appTab, builderOpen: false }),
  setBuilderOpen: (builderOpen) => set({ builderOpen }),
  openPublic: (publicSlug) => set({ view: 'public', publicSlug }),
  closePublic: () => set({ view: 'app', publicSlug: null, builderOpen: false }),
  reset: () =>
    set({
      view: 'marketing',
      user: null,
      events: [],
      currentEvent: null,
      appTab: 'overview',
      builderOpen: false,
      publicSlug: null,
    }),
}))

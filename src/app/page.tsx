'use client'

import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { useApp } from '@/lib/store'
import { api } from '@/lib/api'
import type { EventRecord, SessionUser } from '@/lib/types'
import MarketingSite from '@/components/marketing/MarketingSite'
import AuthScreen from '@/components/auth/AuthScreen'
import CreateEventWizard from '@/components/onboarding/CreateEventWizard'
import AppShell from '@/components/app/AppShell'
import WebsiteBuilder from '@/components/builder/WebsiteBuilder'
import PublicEventSite from '@/components/public/PublicEventSite'
import AdminPanel from '@/components/admin/AdminPanel'

export default function Home() {
  const view = useApp((s) => s.view)
  const builderOpen = useApp((s) => s.builderOpen)
  const currentEvent = useApp((s) => s.currentEvent)
  const publicSlug = useApp((s) => s.publicSlug)
  const hydrated = useApp((s) => s.hydrated)
  const setHydrated = useApp((s) => s.setHydrated)
  const setUser = useApp((s) => s.setUser)
  const setEvents = useApp((s) => s.setEvents)
  const closePublic = useApp((s) => s.closePublic)

  // Hydrate session on load
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { user } = await api<{ user: SessionUser | null }>('/api/auth/me')
        if (user && !cancelled) {
          setUser(user)
          try {
            const { events } = await api<{ events: EventRecord[] }>('/api/events')
            if (!cancelled) setEvents(events)
          } catch {
            // ignore
          }
        }
      } catch {
        // not signed in
      }
      if (!cancelled) setHydrated(true)
    })()
    return () => {
      cancelled = true
    }
  }, [setHydrated, setUser, setEvents])

  if (!hydrated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-label="Loading" />
        <p className="text-sm text-muted-foreground">Loading Online RSVP…</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen">
      {view === 'marketing' && <MarketingSite />}
      {view === 'auth' && <AuthScreen />}
      {view === 'onboarding' && <CreateEventWizard />}
      {view === 'app' && (builderOpen && currentEvent ? <WebsiteBuilder /> : <AppShell />)}
      {view === 'public' && (
        <PublicEventSite
          slug={publicSlug ?? currentEvent?.slug ?? 'john-emily'}
          onExit={() => closePublic()}
        />
      )}
      {view === 'admin' && <AdminPanel />}
    </main>
  )
}

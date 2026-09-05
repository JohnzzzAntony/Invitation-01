'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { api, formatDate } from '@/lib/api'
import SectionRenderer from '@/components/sections/SectionRenderer'
import RsvpFlow from '@/components/public/RsvpFlow'
import type {
  EventRecord,
  QuestionRecord,
  RenderEventData,
  SectionData,
  SectionSettings,
  SubEventRecord,
} from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { CalendarHeart, EyeOff, Lock, X } from 'lucide-react'

// ============================================================
// PublicEventSite — renders the published event website
// (also used for builder "Preview mode" with onExit).
// ============================================================

type PublicEvent = EventRecord & { subEvents: SubEventRecord[]; questions: QuestionRecord[] }

interface PublicEventSiteProps {
  slug: string
  onExit?: () => void
}

export default function PublicEventSite({ slug, onExit }: PublicEventSiteProps) {
  const [event, setEvent] = useState<PublicEvent | null>(null)
  const [notFoundSlug, setNotFoundSlug] = useState<string | null>(null)

  // password gate
  const [unlocked, setUnlocked] = useState(false)
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState('')

  // rsvp overlay
  const [rsvpOpen, setRsvpOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await api<{ event: PublicEvent }>(`/api/public/${slug}`)
        if (cancelled) return
        setEvent(res.event)
        setUnlocked(false)
        setPw('')
        setPwError('')
        setNotFoundSlug(null)
      } catch {
        if (!cancelled) setNotFoundSlug(slug)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [slug])

  // document title
  useEffect(() => {
    if (event) document.title = `${event.name} | ${formatDate(event.eventDate)}`
    return () => {
      document.title = 'Online RSVP'
    }
  }, [event])

  const renderEvent: RenderEventData | null = useMemo(() => {
    if (!event) return null
    return {
      name: event.name,
      slug: event.slug,
      type: event.type,
      status: event.status,
      eventDate: event.eventDate,
      startTime: event.startTime,
      endTime: event.endTime,
      venue: event.venue,
      address: event.address,
      description: event.description,
      hostNames: event.hostNames,
      contactEmail: event.contactEmail,
      contactPhone: event.contactPhone,
      theme: event.theme,
      settings: event.settings,
      gallery: event.gallery ?? [],
      accommodations: event.accommodations ?? [],
      registryItems: event.registryItems ?? [],
      subEvents: event.subEvents ?? [],
      questions: event.questions ?? [],
    }
  }, [event])

  const visibleSections: SectionData[] = useMemo(
    () => (event?.sections ?? []).filter((s) => s.visible),
    [event]
  )

  const isActive = event !== null && event.slug === slug

  // ---------- loading skeleton ----------
  if (!isActive && notFoundSlug !== slug) {
    return (
      <div className="min-h-screen bg-white p-0">
        <Skeleton className="h-[60vh] w-full rounded-none" />
        <div className="mx-auto max-w-2xl space-y-4 p-10">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <div className="grid grid-cols-3 gap-4 pt-6">
            <Skeleton className="aspect-square" />
            <Skeleton className="aspect-square" />
            <Skeleton className="aspect-square" />
          </div>
        </div>
      </div>
    )
  }

  // ---------- 404 ----------
  if (notFoundSlug === slug || !event) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F8F6] p-6">
        <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 text-center shadow-sm">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <EyeOff className="h-5 w-5 text-muted-foreground" />
          </span>
          <h1 className="font-heading text-xl font-semibold">Event not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This event doesn&apos;t exist or is no longer available.
          </p>
          {onExit ? (
            <Button variant="outline" className="mt-6" onClick={onExit}>
              Go back
            </Button>
          ) : null}
        </div>
      </div>
    )
  }

  const { theme, settings } = event

  // ---------- password gate ----------
  if (settings.rsvpMode === 'password' && !unlocked) {
    const submit = (e: React.FormEvent) => {
      e.preventDefault()
      if (pw === (settings.rsvpPassword ?? '')) {
        setPwError('')
        setUnlocked(true)
      } else {
        setPwError('Incorrect password — please try again.')
      }
    }
    return (
      <div
        className="flex min-h-screen items-center justify-center p-6"
        style={{ background: `linear-gradient(180deg, ${theme.secondary} 0%, ${theme.background} 100%)`, color: theme.text, fontFamily: `'${theme.bodyFont}', sans-serif` }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm rounded-2xl border p-8 text-center shadow-lg"
          style={{ backgroundColor: theme.background, borderColor: `${theme.primary}33` }}
        >
          <span
            className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: theme.secondary, color: theme.primary }}
          >
            <Lock className="h-6 w-6" />
          </span>
          <h1 className="text-2xl font-medium" style={{ fontFamily: `'${theme.headingFont}', serif` }}>
            This event is private
          </h1>
          <p className="mt-2 text-sm opacity-70">Enter the password you received with your invitation.</p>
          <form onSubmit={submit} className="mt-6 space-y-3">
            <div className="space-y-1.5 text-left">
              <Label htmlFor="event-password" className="sr-only">
                Event password
              </Label>
              <Input
                id="event-password"
                type="password"
                value={pw}
                onChange={(e) => {
                  setPw(e.target.value)
                  setPwError('')
                }}
                placeholder="Password"
                autoFocus
              />
              {pwError ? <p className="text-xs text-red-600">{pwError}</p> : null}
            </div>
            <button
              type="submit"
              className="min-h-11 w-full rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-85"
              style={{ backgroundColor: theme.primary, borderRadius: theme.buttonStyle === 'square' ? 0 : theme.buttonStyle === 'pill' ? 999 : 8 }}
            >
              Enter Event
            </button>
          </form>
          {onExit ? (
            <Button variant="ghost" className="mt-3" onClick={onExit}>
              Go back
            </Button>
          ) : null}
        </motion.div>
      </div>
    )
  }

  // ---------- site ----------
  const openRsvp = () => setRsvpOpen(true)

  return (
    <div
      className="relative min-h-screen"
      style={{ background: theme.background, color: theme.text, fontFamily: `'${theme.bodyFont}', sans-serif` }}
    >
      {/* guestlist banner */}
      {settings.rsvpMode === 'guestlist' ? (
        <div
          className="sticky top-0 z-30 flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-white"
          style={{ backgroundColor: theme.primary }}
        >
          <Lock className="h-3.5 w-3.5" /> Private guest list — RSVP is by invitation only
        </div>
      ) : null}

      {/* sections */}
      <main>
        {visibleSections.map((section, i) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, ...(motionVariant(section.settings)) }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, delay: Math.min(i * 0.03, 0.15), ease: 'easeOut' }}
          >
            <SectionRenderer section={section} event={renderEvent as RenderEventData} mode="live" onRsvp={openRsvp} />
          </motion.div>
        ))}
        {visibleSections.length === 0 ? (
          <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
            <CalendarHeart className="h-8 w-8 opacity-40" style={{ color: theme.primary }} />
            <p className="text-sm opacity-70">Details coming soon.</p>
          </div>
        ) : null}
      </main>

      {/* RSVP flow overlay */}
      {rsvpOpen ? (
        <RsvpFlow eventId={event.id} onClose={() => setRsvpOpen(false)} eventName={event.name} />
      ) : null}

      {/* preview mode exit bar */}
      {onExit ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2"
        >
          <Button
            onClick={onExit}
            className="rounded-full bg-foreground pl-3 pr-4 text-background shadow-xl hover:bg-foreground/90"
            size="lg"
          >
            <X className="h-4 w-4" /> Exit preview
          </Button>
        </motion.div>
      ) : null}
    </div>
  )
}

// framer-motion initial variant per section animation setting
function motionVariant(settings: SectionSettings): { y?: number; scale?: number } {
  switch (settings.animation) {
    case 'slide':
      return { y: 40 }
    case 'scale':
      return { scale: 0.96 }
    case 'fade':
      return { y: 18 }
    default:
      return { y: 0 }
  }
}

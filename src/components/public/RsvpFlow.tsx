'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { api, formatDate, formatTime } from '@/lib/api'
import type {
  EventSettings,
  EventTheme,
  QuestionRecord,
  SubEventRecord,
} from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  CalendarPlus,
  Check,
  CheckCircle2,
  ChevronLeft,
  Loader2,
  Minus,
  Plus,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

// ============================================================
// RsvpFlow — full-screen multi-step RSVP overlay.
// Personalized via guest token, or public name/email entry.
// ============================================================

interface RsvpGuestInfo {
  id: string
  name: string
  email: string
  status: string
  partySize: number
  maxParty: number
  meal: string | null
  dietary: string | null
  groupName: string | null
}

interface RsvpContext {
  guest: RsvpGuestInfo | null
  event: {
    id: string
    name: string
    slug: string
    eventDate: string
    startTime: string
    endTime: string
    venue: string
    address: string
    hostNames: string
    timezone: string
    settings: EventSettings
    theme: EventTheme
  }
  questions: QuestionRecord[]
  subEvents: SubEventRecord[]
}

interface RsvpFlowProps {
  eventId: string
  token?: string
  onClose: () => void
  eventName?: string
}

const MEAL_DEFAULTS = ['Chicken', 'Beef', 'Fish', 'Vegetarian', 'Vegan']
const TOTAL_STEPS = 5

export default function RsvpFlow({ eventId, token, onClose, eventName }: RsvpFlowProps) {
  const [ctx, setCtx] = useState<RsvpContext | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  // step: 1 welcome · 2 attending · 3 party · 4 details · 5 review/decline · 6 done
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState<1 | -1>(1)

  // form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [attending, setAttending] = useState<boolean | null>(null)
  const [partySize, setPartySize] = useState(1)
  const [guestNames, setGuestNames] = useState('')
  const [subEventIds, setSubEventIds] = useState<string[]>([])
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [declineMessage, setDeclineMessage] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  // ---------- load context ----------
  useEffect(() => {
    let cancelled = false
    const qs = token ? `?token=${encodeURIComponent(token)}` : ''
    api<RsvpContext>(`/api/events/${eventId}/rsvp${qs}`)
      .then((res) => {
        if (cancelled) return
        setCtx(res)
        // Prefills
        if (res.guest) {
          setName(res.guest.name)
          setEmail(res.guest.email)
          const mp = res.guest.maxParty > 0 ? res.guest.maxParty : res.event.settings.maxGuests || 5
          setPartySize(Math.min(Math.max(1, res.guest.partySize || 1), Math.max(1, mp)))
        }
        // Initialize checkbox answers as arrays + meal default
        const init: Record<string, string | string[]> = {}
        for (const q of res.questions) {
          if (q.type === 'checkbox') init[q.id] = []
          else if (q.type === 'meal') init[q.id] = res.guest?.meal && q.options.includes(res.guest.meal) ? res.guest.meal : ''
        }
        setAnswers(init)
      })
      .catch((e: Error) => {
        if (!cancelled) setLoadError(e.message || 'Could not load the RSVP form')
      })
    return () => {
      cancelled = true
    }
  }, [eventId, token])

  const theme: EventTheme = ctx?.event.theme ?? {
    primary: '#9A7B5B',
    secondary: '#F6F1EA',
    text: '#272727',
    background: '#FFFFFF',
    headingFont: 'Cormorant Garamond',
    bodyFont: 'Inter',
    buttonStyle: 'rounded',
    borderRadius: 8,
    spacing: 1,
  }

  const btnRadius = theme.buttonStyle === 'square' ? 0 : theme.buttonStyle === 'pill' ? 999 : 8
  const headingStyle = { fontFamily: `'${theme.headingFont}', serif`, color: theme.text }
  const bodyStyle = { fontFamily: `'${theme.bodyFont}', sans-serif`, color: theme.text }

  const maxParty = useMemo(() => {
    if (!ctx) return 5
    if (ctx.guest && ctx.guest.maxParty > 0) return ctx.guest.maxParty
    return ctx.event.settings.maxGuests || 5
  }, [ctx])

  const rsvpSubEvents = useMemo(
    () => (ctx?.subEvents ?? []).filter((s) => s.rsvpRequired),
    [ctx]
  )

  const hasStep4 = rsvpSubEvents.length > 0 || (ctx?.questions.length ?? 0) > 0

  const go = useCallback((next: number) => {
    setDirection(next > step ? 1 : -1)
    setStep(next)
    setErrors({})
  }, [step])

  // ---------- validation ----------
  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {}
    if (!token) {
      if (!name.trim()) errs.name = 'Please enter your name'
      if (!email.trim()) errs.email = 'Please enter your email'
      else if (!/^\S+@\S+\.\S+$/.test(email.trim())) errs.email = 'Please enter a valid email'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const validateStep4 = (): boolean => {
    if (!ctx) return false
    const errs: Record<string, string> = {}
    for (const q of ctx.questions) {
      if (!q.required) continue
      const v = answers[q.id]
      const empty = Array.isArray(v) ? v.length === 0 : !v || !String(v).trim()
      if (empty) errs[q.id] = 'This field is required'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ---------- submit ----------
  const submit = async () => {
    if (!ctx) return
    setSubmitting(true)
    try {
      const finalAnswers: Record<string, string | string[]> = { ...answers }
      if (!attending) {
        // map decline message to the message question if one exists, else _message
        const messageQ = ctx.questions.find((q) => q.label.toLowerCase().includes('message'))
        if (messageQ) finalAnswers[messageQ.id] = declineMessage
        else finalAnswers['_message'] = declineMessage
      }
      const mealQ = ctx.questions.find((q) => q.type === 'meal')
      const mealValue = mealQ ? finalAnswers[mealQ.id] : undefined
      await api(`/api/events/${eventId}/rsvp`, {
        method: 'POST',
        body: {
          token,
          name: name.trim(),
          email: email.trim(),
          attending: Boolean(attending),
          partySize: attending ? partySize : 0,
          answers: finalAnswers,
          subEventIds: attending ? subEventIds : [],
          ...(mealValue && !Array.isArray(mealValue) && mealValue ? { meal: mealValue } : {}),
        },
      })
      go(6)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not submit RSVP')
    } finally {
      setSubmitting(false)
    }
  }

  // ---------- helpers ----------
  const firstName = (name || ctx?.guest?.name || 'friend').split(' ')[0]

  const toggleSubEvent = (id: string) => {
    setSubEventIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const setAnswer = (id: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
    setErrors((prev) => {
      if (!prev[id]) return prev
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const toggleCheckboxOption = (id: string, option: string) => {
    const current = Array.isArray(answers[id]) ? (answers[id] as string[]) : []
    setAnswer(id, current.includes(option) ? current.filter((o) => o !== option) : [...current, option])
  }

  const downloadIcs = () => {
    if (!ctx) return
    const ev = ctx.event
    const pad = (n: number) => String(n).padStart(2, '0')
    const stamp = (dateIso: string, time: string) => {
      const [y, m, d] = dateIso.split('-')
      const [hh, mm] = (time || '12:00').split(':')
      return `${y}${m}${d}T${pad(Number(hh) || 12)}${pad(Number(mm) || 0)}00`
    }
    const start = stamp(ev.eventDate, ev.startTime)
    let end: string
    if (ev.endTime) {
      end = stamp(ev.eventDate, ev.endTime)
    } else {
      const d = new Date(`${ev.eventDate}T${ev.startTime || '12:00'}:00`)
      d.setHours(d.getHours() + 2)
      end = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`
    }
    const escapeIcs = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Online RSVP//EN',
      'BEGIN:VEVENT',
      `UID:${Date.now()}-${ev.id}@onlinersvp`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${escapeIcs(ev.name)}`,
      `LOCATION:${escapeIcs([ev.venue, ev.address].filter(Boolean).join(', '))}`,
      `DESCRIPTION:${escapeIcs(ev.hostNames ? `Hosted by ${ev.hostNames}` : ev.name)}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${ev.name.replace(/[^\w\s-]/g, '').trim() || 'event'}.ics`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Calendar file downloaded')
  }

  // ---------- render ----------
  const stepDot = step >= 6 ? TOTAL_STEPS : step - 1

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ backgroundColor: theme.secondary }}
      role="dialog"
      aria-modal="true"
      aria-label={`RSVP for ${eventName ?? 'event'}`}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-2xl shadow-2xl"
        style={{ backgroundColor: theme.background, fontFamily: `'${theme.bodyFont}', sans-serif` }}
      >
        {/* close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close RSVP"
          className="absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-black/5"
          style={{ color: theme.text }}
        >
          <X className="h-4 w-4" />
        </button>

        {/* progress dots */}
        {step < 6 ? (
          <div className="flex items-center justify-center gap-1.5 pt-5" aria-label={`Step ${step} of ${TOTAL_STEPS}`}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <span
                key={i}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i === stepDot ? 18 : 6,
                  backgroundColor: i <= stepDot ? theme.primary : `${theme.primary}30`,
                }}
              />
            ))}
          </div>
        ) : null}

        {/* body */}
        <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto p-6 md:p-8">
          {loadError ? (
            <div className="py-10 text-center">
              <p className="text-lg font-medium" style={headingStyle}>
                Something went wrong
              </p>
              <p className="mt-2 text-sm opacity-70" style={bodyStyle}>
                {loadError}
              </p>
              <Button className="mt-6" onClick={onClose}>
                Close
              </Button>
            </div>
          ) : !ctx ? (
            <div className="flex min-h-56 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" style={{ color: theme.primary }} />
            </div>
          ) : (
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 24 * direction }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 * direction }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                {/* ---------- STEP 1 — welcome ---------- */}
                {step === 1 ? (
                  <div className="text-center">
                    {token && ctx.guest ? (
                      <>
                        <p className="text-xs font-medium uppercase tracking-[0.25em]" style={{ color: theme.primary }}>
                          You&apos;re invited!
                        </p>
                        <h1 className="mt-2 text-3xl font-medium" style={headingStyle}>
                          Hello {firstName}!
                        </h1>
                        <p className="mt-3 text-sm opacity-75" style={bodyStyle}>
                          {ctx.event.name} · {formatDate(ctx.event.eventDate)}
                        </p>
                        {ctx.guest.groupName ? (
                          <p className="mt-1 inline-block rounded-full px-3 py-1 text-[11px]" style={{ backgroundColor: theme.secondary, color: theme.primary }}>
                            {ctx.guest.groupName} · Party of up to {ctx.guest.maxParty}
                          </p>
                        ) : null}
                      </>
                    ) : (
                      <>
                        <p className="text-xs font-medium uppercase tracking-[0.25em]" style={{ color: theme.primary }}>
                          You&apos;re invited!
                        </p>
                        <h1 className="mt-2 text-3xl font-medium" style={headingStyle}>
                          {eventName ?? ctx.event.name}
                        </h1>
                        <p className="mt-3 text-sm opacity-75" style={bodyStyle}>
                          {formatDate(ctx.event.eventDate)} · {formatTime(ctx.event.startTime)}
                        </p>
                        <div className="mt-6 space-y-3 text-left">
                          <div className="space-y-1.5">
                            <Label htmlFor="rsvp-name" className="text-xs">
                              Your name
                            </Label>
                            <Input
                              id="rsvp-name"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="Jane Doe"
                              autoComplete="name"
                            />
                            {errors.name ? <p className="text-xs text-red-600">{errors.name}</p> : null}
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="rsvp-email" className="text-xs">
                              Email
                            </Label>
                            <Input
                              id="rsvp-email"
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="jane@example.com"
                              autoComplete="email"
                            />
                            {errors.email ? <p className="text-xs text-red-600">{errors.email}</p> : null}
                          </div>
                        </div>
                        {ctx.event.settings.rsvpMode === 'guestlist' ? (
                          <p className="mt-4 text-xs opacity-70" style={bodyStyle}>
                            This event uses a private guest list — use the personal link from your invitation for the best
                            experience.
                          </p>
                        ) : null}
                      </>
                    )}
                    <ThemedSubmitButton theme={theme} radius={btnRadius} className="mt-8 w-full" onClick={() => validateStep1() && go(2)}>
                      Continue
                    </ThemedSubmitButton>
                  </div>
                ) : null}

                {/* ---------- STEP 2 — attending ---------- */}
                {step === 2 ? (
                  <div className="text-center">
                    <h1 className="text-2xl font-medium md:text-3xl" style={headingStyle}>
                      {token && ctx.guest ? `Will you join us, ${firstName}?` : 'Will you be joining us?'}
                    </h1>
                    <div className="mt-8 space-y-3">
                      <button
                        type="button"
                        onClick={() => {
                          setAttending(true)
                          go(hasStep4 ? 3 : 5)
                        }}
                        className="flex min-h-16 w-full items-center justify-center gap-2 px-6 py-4 text-sm font-semibold tracking-wider transition-opacity hover:opacity-85"
                        style={{
                          borderRadius: btnRadius,
                          backgroundColor: theme.primary,
                          color: '#FFFFFF',
                        }}
                      >
                        <Check className="h-4 w-4" /> YES, I&apos;LL BE THERE
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAttending(false)
                          go(5)
                        }}
                        className="flex min-h-16 w-full items-center justify-center px-6 py-4 text-sm font-semibold tracking-wider transition-colors hover:bg-black/5"
                        style={{
                          borderRadius: btnRadius,
                          border: `1.5px solid ${theme.primary}66`,
                          color: theme.text,
                        }}
                      >
                        <X className="h-4 w-4" /> NO, I CAN&apos;T MAKE IT
                      </button>
                    </div>
                    <BackLink theme={theme} onClick={() => go(1)} />
                  </div>
                ) : null}

                {/* ---------- STEP 3 — party ---------- */}
                {step === 3 ? (
                  <div className="text-center">
                    <h1 className="text-2xl font-medium md:text-3xl" style={headingStyle}>
                      Who will be attending?
                    </h1>
                    <p className="mt-2 text-sm opacity-70" style={bodyStyle}>
                      Including yourself — up to {maxParty} guest{maxParty === 1 ? '' : 's'}.
                    </p>
                    <div
                      className="mx-auto mt-7 flex w-fit items-center gap-5 rounded-xl border px-6 py-4"
                      style={{ borderColor: `${theme.primary}33` }}
                    >
                      <button
                        type="button"
                        aria-label="Decrease party size"
                        onClick={() => setPartySize((p) => Math.max(1, p - 1))}
                        disabled={partySize <= 1}
                        className="flex h-10 w-10 items-center justify-center rounded-full transition-opacity hover:opacity-80 disabled:opacity-30"
                        style={{ backgroundColor: theme.secondary, color: theme.primary }}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-10 text-center text-3xl font-semibold tabular-nums" style={{ ...headingStyle, color: theme.primary }}>
                        {partySize}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase party size"
                        onClick={() => setPartySize((p) => Math.min(maxParty, p + 1))}
                        disabled={partySize >= maxParty}
                        className="flex h-10 w-10 items-center justify-center rounded-full transition-opacity hover:opacity-80 disabled:opacity-30"
                        style={{ backgroundColor: theme.secondary, color: theme.primary }}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-6 space-y-1.5 text-left">
                      <Label htmlFor="rsvp-guestnames" className="text-xs">
                        Guest names (optional)
                      </Label>
                      <Textarea
                        id="rsvp-guestnames"
                        rows={2}
                        value={guestNames}
                        onChange={(e) => setGuestNames(e.target.value)}
                        placeholder="e.g. Tom Doe, Amy Smith"
                      />
                    </div>
                    <div className="mt-7 flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => go(2)}>
                        <ChevronLeft className="h-4 w-4" /> Back
                      </Button>
                      <ThemedSubmitButton
                        theme={theme}
                        radius={btnRadius}
                        className="flex-1"
                        onClick={() => go(hasStep4 ? 4 : 5)}
                      >
                        Continue
                      </ThemedSubmitButton>
                    </div>
                  </div>
                ) : null}

                {/* ---------- STEP 4 — sub-events + questions ---------- */}
                {step === 4 ? (
                  <div>
                    <h1 className="text-center text-2xl font-medium md:text-3xl" style={headingStyle}>
                      A few details
                    </h1>

                    {rsvpSubEvents.length > 0 ? (
                      <div className="mt-6">
                        <p className="mb-2 text-xs font-semibold tracking-wider uppercase" style={{ color: theme.primary }}>
                          Which parts will you attend?
                        </p>
                        <div className="space-y-2">
                          {rsvpSubEvents.map((s) => (
                            <label
                              key={s.id}
                              htmlFor={`se-${s.id}`}
                              className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-black/[0.02]"
                              style={{ borderColor: `${theme.primary}33` }}
                            >
                              <Checkbox
                                id={`se-${s.id}`}
                                checked={subEventIds.includes(s.id)}
                                onCheckedChange={() => toggleSubEvent(s.id)}
                                className="mt-0.5"
                              />
                              <span className="min-w-0">
                                <span className="block text-sm font-medium" style={bodyStyle}>
                                  {s.name}
                                </span>
                                <span className="block text-xs opacity-70" style={bodyStyle}>
                                  {formatDate(s.date)}
                                  {s.startTime ? `, ${formatTime(s.startTime)}` : ''}
                                  {s.venue ? ` · ${s.venue}` : ''}
                                </span>
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {ctx.questions.length > 0 ? (
                      <div className="mt-6 space-y-5">
                        {ctx.questions.map((q) => (
                          <QuestionField
                            key={q.id}
                            question={q}
                            value={answers[q.id]}
                            error={errors[q.id]}
                            theme={theme}
                            onChange={(v) => setAnswer(q.id, v)}
                          />
                        ))}
                      </div>
                    ) : null}

                    <div className="mt-7 flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => go(3)}>
                        <ChevronLeft className="h-4 w-4" /> Back
                      </Button>
                      <ThemedSubmitButton
                        theme={theme}
                        radius={btnRadius}
                        className="flex-1"
                        onClick={() => validateStep4() && go(5)}
                      >
                        Continue
                      </ThemedSubmitButton>
                    </div>
                  </div>
                ) : null}

                {/* ---------- STEP 5 — review (yes) / decline (no) ---------- */}
                {step === 5 ? (
                  attending ? (
                    <div>
                      <h1 className="text-center text-2xl font-medium md:text-3xl" style={headingStyle}>
                        Almost done!
                      </h1>
                      <p className="mt-2 text-center text-sm opacity-70" style={bodyStyle}>
                        Please review your response.
                      </p>
                      <div
                        className="mt-6 divide-y rounded-xl border text-sm"
                        style={{ borderColor: `${theme.primary}26`, ...bodyStyle }}
                      >
                        <ReviewRow label="Name" value={ctx.guest ? ctx.guest.name : name} theme={theme} />
                        <ReviewRow label="Attending" value="Yes — can't wait!" theme={theme} />
                        <ReviewRow label="Party size" value={`${partySize} guest${partySize === 1 ? '' : 's'}`} theme={theme} />
                        {guestNames.trim() ? <ReviewRow label="Guests" value={guestNames} theme={theme} /> : null}
                        {subEventIds.length > 0 ? (
                          <ReviewRow
                            label="Events"
                            value={rsvpSubEvents
                              .filter((s) => subEventIds.includes(s.id))
                              .map((s) => s.name)
                              .join(', ')}
                            theme={theme}
                          />
                        ) : null}
                        {ctx.questions
                          .filter((q) => {
                            const v = answers[q.id]
                            return Array.isArray(v) ? v.length > 0 : v && String(v).trim()
                          })
                          .map((q) => (
                            <ReviewRow
                              key={q.id}
                              label={q.label}
                              value={Array.isArray(answers[q.id]) ? (answers[q.id] as string[]).join(', ') : String(answers[q.id])}
                              theme={theme}
                            />
                          ))}
                      </div>
                      <div className="mt-7 flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => go(hasStep4 ? 4 : 3)}>
                          <ChevronLeft className="h-4 w-4" /> Back
                        </Button>
                        <ThemedSubmitButton theme={theme} radius={btnRadius} className="flex-1" disabled={submitting} onClick={() => void submit()}>
                          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                          Submit RSVP
                        </ThemedSubmitButton>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <h1 className="text-2xl font-medium md:text-3xl" style={headingStyle}>
                        We&apos;re sorry you can&apos;t make it
                      </h1>
                      <p className="mt-2 text-sm opacity-70" style={bodyStyle}>
                        You will be missed, {firstName}. Leave a message if you&apos;d like.
                      </p>
                      <div className="mt-6 space-y-1.5 text-left">
                        <Label htmlFor="rsvp-message" className="text-xs">
                          Message (optional)
                        </Label>
                        <Textarea
                          id="rsvp-message"
                          rows={3}
                          value={declineMessage}
                          onChange={(e) => setDeclineMessage(e.target.value)}
                          placeholder="A message for the hosts…"
                        />
                      </div>
                      <div className="mt-7 flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => go(2)}>
                          <ChevronLeft className="h-4 w-4" /> Back
                        </Button>
                        <ThemedSubmitButton theme={theme} radius={btnRadius} className="flex-1" disabled={submitting} onClick={() => void submit()}>
                          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                          Submit RSVP
                        </ThemedSubmitButton>
                      </div>
                    </div>
                  )
                ) : null}

                {/* ---------- STEP 6 — success ---------- */}
                {step === 6 ? (
                  <div className="py-4 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.05 }}
                      className="mx-auto flex h-20 w-20 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${theme.primary}1F`, color: theme.primary }}
                    >
                      <CheckCircle2 className="h-11 w-11" />
                    </motion.div>
                    <h1 className="mt-5 text-3xl font-medium" style={headingStyle}>
                      {attending ? "You're confirmed!" : 'Response received'}
                    </h1>
                    <p className="mt-2 text-sm opacity-75" style={bodyStyle}>
                      {attending ? "We can't wait to see you." : 'Thank you for letting us know.'}
                    </p>
                    <p className="mt-4 text-sm" style={bodyStyle}>
                      <span className="font-medium" style={{ color: theme.primary }}>
                        {ctx.event.name}
                      </span>
                      <br />
                      {formatDate(ctx.event.eventDate)} · {ctx.event.venue}
                    </p>
                    <div className="mt-7 space-y-2.5">
                      {attending ? (
                        <ThemedSubmitButton theme={theme} radius={btnRadius} className="w-full" onClick={downloadIcs}>
                          <CalendarPlus className="h-4 w-4" /> Add to Calendar
                        </ThemedSubmitButton>
                      ) : null}
                      <Button variant="outline" className="w-full" onClick={onClose}>
                        Back to Website
                      </Button>
                      {ctx.event.settings.allowEdit ? (
                        <button
                          type="button"
                          className="text-xs underline underline-offset-4 opacity-60 transition-opacity hover:opacity-100"
                          style={{ color: theme.text }}
                          onClick={() => {
                            setAttending(null)
                            go(2)
                          }}
                        >
                          Change response
                        </button>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------- small themed pieces ----------

function ThemedSubmitButton({
  theme,
  radius,
  children,
  onClick,
  className = '',
  disabled = false,
}: {
  theme: EventTheme
  radius: number
  children: React.ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-11 items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-85 disabled:opacity-60 ${className}`}
      style={{ borderRadius: radius, backgroundColor: theme.primary, color: '#FFFFFF', fontFamily: `'${theme.bodyFont}', sans-serif` }}
    >
      {children}
    </button>
  )
}

function BackLink({ theme, onClick }: { theme: EventTheme; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-5 inline-flex items-center gap-1 text-xs opacity-60 transition-opacity hover:opacity-100"
      style={{ color: theme.text, fontFamily: `'${theme.bodyFont}', sans-serif` }}
    >
      <ChevronLeft className="h-3.5 w-3.5" /> Back
    </button>
  )
}

function ReviewRow({ label, value, theme }: { label: string; value: string; theme: EventTheme }) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-2.5">
      <span className="shrink-0 text-xs uppercase tracking-wider opacity-55" style={{ color: theme.text }}>
        {label}
      </span>
      <span className="text-right text-sm" style={{ color: theme.text }}>
        {value}
      </span>
    </div>
  )
}

// ---------- question renderer ----------

function QuestionField({
  question,
  value,
  error,
  theme,
  onChange,
}: {
  question: QuestionRecord
  value: string | string[] | undefined
  error?: string
  theme: EventTheme
  onChange: (v: string | string[]) => void
}) {
  const qid = `q-${question.id}`
  const strValue = typeof value === 'string' ? value : ''
  const arrValue = Array.isArray(value) ? value : []

  const labelEl = (
    <Label htmlFor={qid} className="text-xs font-medium">
      {question.label}
      {question.required ? <span className="ml-1 text-red-600">*</span> : null}
    </Label>
  )

  let control: React.ReactNode = null
  switch (question.type) {
    case 'textarea':
      control = (
        <Textarea
          id={qid}
          rows={3}
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.options[0] ?? ''}
        />
      )
      break
    case 'number':
      control = (
        <Input
          id={qid}
          type="number"
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.options[0] ?? ''}
        />
      )
      break
    case 'yesno':
      control = (
        <RadioGroup value={strValue} onValueChange={(v) => onChange(v)} className="flex gap-6">
          {['Yes', 'No'].map((opt) => (
            <div key={opt} className="flex items-center gap-2">
              <RadioGroupItem value={opt} id={`${qid}-${opt}`} />
              <Label htmlFor={`${qid}-${opt}`} className="text-sm font-normal">
                {opt}
              </Label>
            </div>
          ))}
        </RadioGroup>
      )
      break
    case 'radio':
    case 'select':
      control = (
        <RadioGroup value={strValue} onValueChange={(v) => onChange(v)} className="space-y-2.5">
          {question.options.map((opt) => (
            <div key={opt} className="flex items-center gap-2">
              <RadioGroupItem value={opt} id={`${qid}-${opt}`} />
              <Label htmlFor={`${qid}-${opt}`} className="text-sm font-normal">
                {opt}
              </Label>
            </div>
          ))}
        </RadioGroup>
      )
      break
    case 'checkbox':
      control = (
        <div className="space-y-2.5">
          {question.options.map((opt) => (
            <div key={opt} className="flex items-center gap-2.5">
              <Checkbox
                id={`${qid}-${opt}`}
                checked={arrValue.includes(opt)}
                onCheckedChange={() => onChange(arrValue.includes(opt) ? arrValue.filter((o) => o !== opt) : [...arrValue, opt])}
              />
              <Label htmlFor={`${qid}-${opt}`} className="text-sm font-normal">
                {opt}
              </Label>
            </div>
          ))}
        </div>
      )
      break
    case 'meal':
      control = (
        <RadioGroup value={strValue} onValueChange={(v) => onChange(v)} className="grid grid-cols-2 gap-2">
          {(question.options.length > 0 ? question.options : MEAL_DEFAULTS).map((opt) => (
            <Label
              key={opt}
              htmlFor={`${qid}-${opt}`}
              className="flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 text-sm font-normal transition-colors hover:bg-black/[0.02]"
              style={{
                borderColor: strValue === opt ? theme.primary : `${theme.primary}33`,
                backgroundColor: strValue === opt ? `${theme.primary}0F` : 'transparent',
              }}
            >
              <RadioGroupItem value={opt} id={`${qid}-${opt}`} />
              {opt}
            </Label>
          ))}
        </RadioGroup>
      )
      break
    case 'date':
      control = <Input id={qid} type="date" value={strValue} onChange={(e) => onChange(e.target.value)} />
      break
    default:
      control = (
        <Input
          id={qid}
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.options[0] ?? ''}
        />
      )
  }

  return (
    <div className="space-y-2">
      {question.type !== 'checkbox' ? labelEl : <Label className="text-xs font-medium">{question.label}{question.required ? <span className="ml-1 text-red-600">*</span> : null}</Label>}
      {control}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  )
}

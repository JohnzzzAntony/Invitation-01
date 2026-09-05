'use client'

// ============================================================
// Task 6-a — Create Event Wizard (3 steps)
// 1. Event type → 2. Details → 3. Design
// Preselects store.wizardTemplateId when opened from a template.
// ============================================================

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Baby,
  Briefcase,
  Cake,
  Check,
  CircleEllipsis,
  Gem,
  Heart,
  PartyPopper,
  Search,
  Sparkles,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import { useApp } from '@/lib/store'
import { api } from '@/lib/api'
import type { EventRecord, TemplateRecord } from '@/lib/types'
import { TemplateMiniPreview } from '@/components/shared/TemplateMiniPreview'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

// ---------- constants ----------

const EVENT_TYPES = [
  { key: 'wedding', label: 'Wedding', icon: Heart },
  { key: 'engagement', label: 'Engagement', icon: Gem },
  { key: 'birthday', label: 'Birthday', icon: Cake },
  { key: 'anniversary', label: 'Anniversary', icon: Sparkles },
  { key: 'baby-shower', label: 'Baby shower', icon: Baby },
  { key: 'corporate', label: 'Corporate', icon: Briefcase },
  { key: 'party', label: 'Party', icon: PartyPopper },
  { key: 'other', label: 'Other', icon: CircleEllipsis },
]

// event type → template category used to rank templates first
const TYPE_TO_CATEGORY: Record<string, string | null> = {
  wedding: 'wedding',
  engagement: 'wedding',
  anniversary: 'wedding',
  birthday: 'birthday',
  'baby-shower': 'baby',
  corporate: 'corporate',
  party: 'party',
  other: null,
}

const TIMEZONES = [
  'Asia/Dubai',
  'Europe/London',
  'Europe/Paris',
  'America/New_York',
  'Asia/Singapore',
  'Australia/Sydney',
]

const STEP_LABELS = ['Event type', 'Details', 'Design']

interface DetailsForm {
  name: string
  eventDate: string
  startTime: string
  endTime: string
  timezone: string
  hostNames: string
  venue: string
  address: string
  description: string
}

const emptyForm: DetailsForm = {
  name: '',
  eventDate: '',
  startTime: '17:00',
  endTime: '23:00',
  timezone: 'Asia/Dubai',
  hostNames: '',
  venue: '',
  address: '',
  description: '',
}

export default function CreateEventWizard() {
  const user = useApp((s) => s.user)
  const wizardTemplateId = useApp((s) => s.wizardTemplateId)
  const setView = useApp((s) => s.setView)
  const setEvents = useApp((s) => s.setEvents)
  const setCurrentEvent = useApp((s) => s.setCurrentEvent)
  const setAppTab = useApp((s) => s.setAppTab)

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [type, setType] = useState<string | null>(null)
  const [form, setForm] = useState<DetailsForm>(emptyForm)
  const [formErrors, setFormErrors] = useState<{ name?: boolean; eventDate?: boolean }>({})

  const [templates, setTemplates] = useState<TemplateRecord[] | null>(null)
  const [templatesLoading, setTemplatesLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [styleFilter, setStyleFilter] = useState('all')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(wizardTemplateId)
  const [creating, setCreating] = useState(false)

  const todayIso = useMemo(() => {
    const d = new Date()
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
  }, [])

  useEffect(() => {
    let alive = true
    api<{ templates: TemplateRecord[] }>('/api/templates')
      .then((d) => {
        if (alive) setTemplates(d.templates)
      })
      .catch(() => {
        if (alive) toast.error('Could not load designs')
      })
      .finally(() => {
        if (alive) setTemplatesLoading(false)
      })
    return () => {
      alive = false
    }
  }, [])

  const setField = (key: keyof DetailsForm, value: string) => {
    setForm((f) => ({ ...f, [key]: value }))
    if (key === 'name' || key === 'eventDate') {
      setFormErrors((e) => ({ ...e, [key]: false }))
    }
  }

  const styles = useMemo(
    () => Array.from(new Set((templates ?? []).map((t) => t.style))),
    [templates]
  )

  const visibleTemplates = useMemo(() => {
    if (!templates) return []
    const q = search.trim().toLowerCase()
    const cat = type ? TYPE_TO_CATEGORY[type] : null
    let list = templates
    if (styleFilter !== 'all') list = list.filter((t) => t.style === styleFilter)
    if (q) {
      list = list.filter((t) =>
        [t.name, t.style, t.category, ...(t.tags ?? [])].join(' ').toLowerCase().includes(q)
      )
    }
    // templates matching the chosen event type appear first
    return [...list].sort((a, b) => Number(b.category === cat) - Number(a.category === cat))
  }, [templates, search, styleFilter, type])

  const goStep2 = () => {
    if (!type) {
      toast.error('Please choose an event type first')
      return
    }
    setStep(2)
  }

  const goStep3 = () => {
    const errs = {
      name: !form.name.trim(),
      eventDate: !form.eventDate,
    }
    setFormErrors(errs)
    if (errs.name || errs.eventDate) {
      toast.error('Please add an event name and date')
      return
    }
    setStep(3)
  }

  const cancel = () => setView(user ? 'app' : 'marketing')

  const create = async (templateId: string | null) => {
    if (creating) return
    if (!type) {
      toast.error('Please choose an event type first')
      setStep(1)
      return
    }
    if (!form.name.trim() || !form.eventDate) {
      toast.error('Please add an event name and date')
      setStep(2)
      return
    }
    setCreating(true)
    try {
      const { event } = await api<{ event: EventRecord }>('/api/events', {
        body: {
          name: form.name.trim(),
          type,
          eventDate: form.eventDate,
          startTime: form.startTime,
          endTime: form.endTime,
          timezone: form.timezone,
          venue: form.venue,
          address: form.address,
          description: form.description,
          hostNames: form.hostNames,
          templateId,
        },
      })
      setCurrentEvent(event)
      try {
        const d = await api<{ events: EventRecord[] }>('/api/events')
        setEvents(d.events ?? [])
      } catch {
        // non-fatal — dashboard can refetch
      }
      toast.success('Event created!')
      setAppTab('overview')
      setView('app')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not create the event')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* top bar */}
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span
              className="flex size-8 items-center justify-center rounded-lg text-white"
              style={{ backgroundColor: '#9A7B5B' }}
            >
              <Heart className="size-4 fill-current" aria-hidden />
            </span>
            <span className="text-[15px] font-semibold tracking-tight">Create a new event</span>
          </div>
          <button
            type="button"
            onClick={cancel}
            className="flex size-11 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Close wizard"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 md:py-12">
        {/* progress */}
        <ol className="mx-auto mb-10 flex max-w-lg items-center justify-center" aria-label="Wizard progress">
          {STEP_LABELS.map((label, i) => {
            const n = i + 1
            const done = n < step
            const active = n === step
            return (
              <li key={label} className="flex items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <span
                    className={cn(
                      'flex size-9 items-center justify-center rounded-full border text-sm font-medium transition-colors',
                      done && 'border-transparent bg-primary text-primary-foreground',
                      active && 'border-transparent bg-[#9A7B5B] text-white ring-4 ring-[#9A7B5B]/20',
                      !done && !active && 'bg-muted text-muted-foreground'
                    )}
                    aria-current={active ? 'step' : undefined}
                  >
                    {done ? <Check className="size-4" aria-hidden /> : n}
                  </span>
                  <span
                    className={cn(
                      'hidden text-xs font-medium sm:block',
                      active ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {label}
                  </span>
                </div>
                {n < STEP_LABELS.length && (
                  <span
                    className={cn('mx-2 mb-0 h-px w-8 sm:w-14 sm:mb-5', done ? 'bg-primary' : 'bg-border')}
                    aria-hidden
                  />
                )}
              </li>
            )
          })}
        </ol>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
            >
              <h1 className="font-display text-center text-3xl font-semibold tracking-tight">
                What are you celebrating?
              </h1>
              <p className="mt-2 text-center text-muted-foreground">
                We&apos;ll tailor templates and sections to your occasion.
              </p>

              <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {EVENT_TYPES.map((t) => {
                  const selected = type === t.key
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setType(t.key)}
                      aria-pressed={selected}
                      className={cn(
                        'flex min-h-[104px] flex-col items-center justify-center gap-3 rounded-2xl border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
                        selected && 'border-transparent ring-2 ring-primary'
                      )}
                    >
                      <span
                        className={cn(
                          'flex size-11 items-center justify-center rounded-full transition-colors',
                          selected ? 'bg-primary text-primary-foreground' : 'bg-[#F6F1EA] text-[#9A7B5B]'
                        )}
                      >
                        <t.icon className="size-5" aria-hidden />
                      </span>
                      <span className="text-sm font-medium">{t.label}</span>
                    </button>
                  )
                })}
              </div>

              <div className="mt-10 flex justify-end">
                <Button size="lg" className="h-11 px-8" disabled={!type} onClick={goStep2}>
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
            >
              <h1 className="font-display text-center text-3xl font-semibold tracking-tight">
                Event details
              </h1>
              <p className="mt-2 text-center text-muted-foreground">
                You can change all of this later in the dashboard.
              </p>

              <form
                className="mt-10 grid gap-4 sm:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  goStep3()
                }}
                noValidate
              >
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="ev-name">
                    Event name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="ev-name"
                    value={form.name}
                    onChange={(e) => setField('name', e.target.value)}
                    placeholder="e.g. John & Emily's Wedding"
                    className={cn('h-11', formErrors.name && 'border-destructive')}
                    aria-invalid={formErrors.name}
                  />
                  {formErrors.name && (
                    <p className="text-xs text-destructive">Event name is required</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ev-date">
                    Event date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="ev-date"
                    type="date"
                    value={form.eventDate}
                    min={todayIso}
                    onChange={(e) => setField('eventDate', e.target.value)}
                    className={cn('h-11', formErrors.eventDate && 'border-destructive')}
                    aria-invalid={formErrors.eventDate}
                  />
                  {formErrors.eventDate && (
                    <p className="text-xs text-destructive">Event date is required</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ev-timezone">Timezone</Label>
                  <Select value={form.timezone} onValueChange={(v) => setField('timezone', v)}>
                    <SelectTrigger id="ev-timezone" className="h-11">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ev-start">Start time</Label>
                  <Input
                    id="ev-start"
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setField('startTime', e.target.value)}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ev-end">End time</Label>
                  <Input
                    id="ev-end"
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setField('endTime', e.target.value)}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="ev-hosts">Host names</Label>
                  <Input
                    id="ev-hosts"
                    value={form.hostNames}
                    onChange={(e) => setField('hostNames', e.target.value)}
                    placeholder="e.g. John Carter & Emily Rose"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ev-venue">Venue</Label>
                  <Input
                    id="ev-venue"
                    value={form.venue}
                    onChange={(e) => setField('venue', e.target.value)}
                    placeholder="e.g. The Palm Ballroom"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ev-address">Address</Label>
                  <Input
                    id="ev-address"
                    value={form.address}
                    onChange={(e) => setField('address', e.target.value)}
                    placeholder="Street, city, country"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="ev-description">Description</Label>
                  <Textarea
                    id="ev-description"
                    value={form.description}
                    onChange={(e) => setField('description', e.target.value)}
                    placeholder="A short introduction your guests will see on the website…"
                    className="min-h-24"
                  />
                </div>

                <div className="mt-4 flex justify-between sm:col-span-2">
                  <Button type="button" variant="outline" size="lg" className="h-11 px-8" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button type="submit" size="lg" className="h-11 px-8">
                    Continue
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
            >
              <h1 className="font-display text-center text-3xl font-semibold tracking-tight">
                Choose your design
              </h1>
              <p className="mt-2 text-center text-muted-foreground">
                {type
                  ? `Designs for ${EVENT_TYPES.find((t) => t.key === type)?.label.toLowerCase() ?? 'your'} events are shown first.`
                  : 'Pick a starting point — everything can be customized later.'}
              </p>

              <div className="mx-auto mt-8 max-w-xl">
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search designs…"
                    className="h-11 pl-9"
                    aria-label="Search designs"
                  />
                </div>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStyleFilter('all')}
                    aria-pressed={styleFilter === 'all'}
                    className={cn(
                      'min-h-[36px] rounded-full border px-3.5 text-xs font-medium transition-colors',
                      styleFilter === 'all'
                        ? 'border-transparent bg-primary text-primary-foreground'
                        : 'bg-background text-muted-foreground hover:bg-accent hover:text-foreground'
                    )}
                  >
                    All styles
                  </button>
                  {styles.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStyleFilter(s)}
                      aria-pressed={styleFilter === s}
                      className={cn(
                        'min-h-[36px] rounded-full border px-3.5 text-xs font-medium capitalize transition-colors',
                        styleFilter === s
                          ? 'border-transparent bg-primary text-primary-foreground'
                          : 'bg-background text-muted-foreground hover:bg-accent hover:text-foreground'
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="scrollbar-thin mt-8 max-h-[460px] overflow-y-auto pr-1">
                {templatesLoading ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="rounded-2xl border bg-card p-3">
                        <Skeleton className="h-36 w-full rounded-xl" />
                        <Skeleton className="mt-3 h-4 w-2/3" />
                      </div>
                    ))}
                  </div>
                ) : visibleTemplates.length === 0 ? (
                  <div className="py-16 text-center">
                    <p className="text-muted-foreground">
                      No designs match your search — try a different keyword or style.
                    </p>
                    <Button
                      variant="ghost"
                      className="mt-3"
                      onClick={() => {
                        setSearch('')
                        setStyleFilter('all')
                      }}
                    >
                      Clear filters
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {visibleTemplates.map((t) => {
                      const selected = selectedTemplateId === t.id
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setSelectedTemplateId(t.id)}
                          aria-pressed={selected}
                          className={cn(
                            'group relative overflow-hidden rounded-2xl border bg-card text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
                            selected && 'border-transparent ring-2 ring-primary'
                          )}
                        >
                          <div
                            className="pointer-events-none h-36 select-none overflow-hidden border-b bg-muted"
                            aria-hidden
                          >
                            <TemplateMiniPreview
                              theme={t.theme}
                              sections={t.sections}
                              className="h-full w-full transition-transform duration-500 group-hover:scale-[1.03]"
                            />
                          </div>
                          <div className="p-3">
                            <div className="flex items-center justify-between gap-2">
                              <span className="truncate text-sm font-semibold">{t.name}</span>
                              <Badge variant="secondary" className="shrink-0 capitalize">
                                {t.style}
                              </Badge>
                            </div>
                            <p className="mt-0.5 text-xs capitalize text-muted-foreground">
                              {t.category} template
                            </p>
                          </div>
                          {selected && (
                            <span className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
                              <Check className="size-4" aria-hidden />
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="mt-8 flex flex-col-reverse items-center justify-between gap-3 sm:flex-row">
                <Button variant="outline" size="lg" className="h-11 px-8" onClick={() => setStep(2)}>
                  Back
                </Button>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="h-11 px-6"
                    disabled={creating}
                    onClick={() => create(null)}
                  >
                    Start from scratch
                  </Button>
                  <Button
                    size="lg"
                    className="h-11 px-8 text-white"
                    style={{ backgroundColor: '#9A7B5B' }}
                    disabled={!selectedTemplateId || creating}
                    onClick={() => create(selectedTemplateId)}
                  >
                    {creating ? (
                      'Creating…'
                    ) : (
                      <>
                        <Check className="size-4" aria-hidden />
                        Use This Design
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

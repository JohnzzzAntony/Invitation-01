'use client'

import { useEffect, useMemo, useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { sectionPaddingClass } from '@/lib/sections'
import { formatDate, formatTime, money } from '@/lib/api'
import type {
  EventTheme,
  RenderEventData,
  SectionData,
  SubEventRecord,
} from '@/lib/types'
import {
  CalendarDays,
  ChevronDown,
  Clock,
  ExternalLink,
  Gift,
  Heart,
  Mail,
  MapPin,
  Phone,
  Shirt,
  Star,
} from 'lucide-react'
import { toast } from 'sonner'

// ============================================================
// SectionRenderer — schema-driven website renderer.
// Maps section.type → fully themed visual component.
// Used by the builder canvas (mode='edit') and the public
// event site (mode='live').
// ============================================================

export interface SectionRendererProps {
  section: SectionData
  event: RenderEventData
  mode: 'edit' | 'live'
  onRsvp?: () => void
}

// ---------- helpers ----------

export function buttonRadius(theme: EventTheme): number {
  switch (theme.buttonStyle) {
    case 'square':
      return 0
    case 'pill':
      return 999
    default:
      return 8
  }
}

function padBase(padding: SectionData['settings']['padding']): number {
  switch (padding) {
    case 'sm':
      return 40
    case 'lg':
      return 120
    default:
      return 88
  }
}

function Heading({
  children,
  theme,
  size = 'md',
  light = false,
}: {
  children: React.ReactNode
  theme: EventTheme
  size?: 'sm' | 'md' | 'lg'
  light?: boolean
}) {
  const sizes = {
    sm: 'text-2xl md:text-3xl',
    md: 'text-3xl md:text-4xl',
    lg: 'text-4xl md:text-5xl',
  } as const
  return (
    <h2
      className={`${sizes[size]} font-medium tracking-tight`}
      style={{
        fontFamily: `'${theme.headingFont}', serif`,
        color: light ? '#FFFFFF' : theme.text,
      }}
    >
      {children}
    </h2>
  )
}

function Subtitle({
  children,
  theme,
  light = false,
}: {
  children: React.ReactNode
  theme: EventTheme
  light?: boolean
}) {
  return (
    <p
      className="mt-3 text-sm md:text-base opacity-80"
      style={{ fontFamily: `'${theme.bodyFont}', sans-serif`, color: light ? '#FFFFFF' : theme.text }}
    >
      {children}
    </p>
  )
}

function ThemedButton({
  theme,
  children,
  onClick,
  variant = 'solid',
  className = '',
}: {
  theme: EventTheme
  children: React.ReactNode
  onClick?: () => void
  variant?: 'solid' | 'outline' | 'inverse'
  className?: string
}) {
  const base: React.CSSProperties = {
    borderRadius: buttonRadius(theme),
    fontFamily: `'${theme.bodyFont}', sans-serif`,
  }
  const styles: React.CSSProperties =
    variant === 'solid'
      ? { ...base, backgroundColor: theme.primary, color: '#FFFFFF' }
      : variant === 'inverse'
        ? { ...base, backgroundColor: '#FFFFFF', color: theme.primary }
        : {
            ...base,
            backgroundColor: 'transparent',
            color: theme.primary,
            border: `1.5px solid ${theme.primary}`,
          }
  return (
    <button
      type="button"
      onClick={onClick}
      style={styles}
      className={`inline-flex min-h-11 items-center justify-center gap-2 px-6 py-3 text-sm font-medium transition-all hover:opacity-85 ${className}`}
    >
      {children}
    </button>
  )
}

function editRsvpHint(mode: 'edit' | 'live') {
  if (mode === 'edit') toast.info('RSVP opens on the published site')
}

// ---------- Hero ----------

function HeroSection({ section, event, mode, onRsvp }: SectionRendererProps) {
  const { theme } = event
  const c = section.content
  const hasImage = Boolean(section.settings.bgImage)
  const screen = section.settings.height === 'screen'
  return (
    <div
      className={`flex w-full flex-col items-center justify-center px-6 py-24 text-center md:py-28 ${
        screen ? (mode === 'edit' ? 'md:min-h-[70vh]' : 'min-h-screen') : 'min-h-[440px]'
      }`}
    >
      <p
        className="mb-4 text-xs font-medium uppercase tracking-[0.35em]"
        style={{
          fontFamily: `'${theme.bodyFont}', sans-serif`,
          color: hasImage ? 'rgba(255,255,255,0.85)' : theme.primary,
        }}
      >
        {c.subheading}
      </p>
      <h1
        className="max-w-3xl text-5xl leading-[1.05] font-medium tracking-tight md:text-7xl"
        style={{ fontFamily: `'${theme.headingFont}', serif`, color: hasImage ? '#FFFFFF' : theme.text }}
      >
        {c.heading}
      </h1>
      {c.dateText ? (
        <p
          className="mt-6 text-lg md:text-2xl"
          style={{
            fontFamily: `'${theme.headingFont}', serif`,
            color: hasImage ? 'rgba(255,255,255,0.92)' : theme.text,
          }}
        >
          {c.dateText}
        </p>
      ) : null}
      {c.locationText ? (
        <p
          className="mt-2 inline-flex items-center gap-1.5 text-sm"
          style={{
            fontFamily: `'${theme.bodyFont}', sans-serif`,
            color: hasImage ? 'rgba(255,255,255,0.75)' : theme.primary,
          }}
        >
          <MapPin className="h-4 w-4" /> {c.locationText}
        </p>
      ) : null}
      {c.buttonText ? (
        <ThemedButton
          theme={theme}
          variant={hasImage ? 'inverse' : 'solid'}
          className="mt-10"
          onClick={() => (mode === 'live' && onRsvp ? onRsvp() : editRsvpHint(mode))}
        >
          {c.buttonText}
        </ThemedButton>
      ) : null}
      <div
        className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2"
        style={{ color: hasImage ? 'rgba(255,255,255,0.8)' : theme.primary }}
      >
        <ChevronDown className="h-5 w-5 animate-bounce" />
      </div>
    </div>
  )
}

// ---------- Text ----------

function TextSection({ section, event }: SectionRendererProps) {
  const { theme } = event
  return (
    <div className="mx-auto max-w-2xl px-6">
      <Heading theme={theme}>{section.content.heading}</Heading>
      <p
        className="mt-5 leading-relaxed whitespace-pre-line"
        style={{ fontFamily: `'${theme.bodyFont}', sans-serif`, color: theme.text, opacity: 0.85 }}
      >
        {section.content.body}
      </p>
    </div>
  )
}

// ---------- Story ----------

function StorySection({ section, event }: SectionRendererProps) {
  const { theme } = event
  const c = section.content
  return (
    <div className="mx-auto grid max-w-5xl items-center gap-10 px-6 md:grid-cols-2">
      <div>
        <Heading theme={theme} size="lg">
          {c.heading}
        </Heading>
        <div className="mt-4 mb-6 h-0.5 w-14 rounded-full" style={{ backgroundColor: theme.primary }} />
        <p
          className="leading-loose whitespace-pre-line"
          style={{ fontFamily: `'${theme.bodyFont}', sans-serif`, color: theme.text, opacity: 0.85 }}
        >
          {c.body}
        </p>
      </div>
      <div className="overflow-hidden shadow-lg" style={{ borderRadius: theme.borderRadius * 2 }}>
        {c.image ? (
          <img src={c.image} alt={c.heading || 'Story'} className="aspect-[4/5] w-full object-cover" />
        ) : (
          <div
            className="flex aspect-[4/5] w-full items-center justify-center"
            style={{ backgroundColor: theme.secondary, color: theme.primary }}
          >
            <Heart className="h-10 w-10 opacity-40" />
          </div>
        )}
      </div>
    </div>
  )
}

// ---------- Countdown ----------

function CountdownSection({ section, event }: SectionRendererProps) {
  const { theme } = event
  const target = useMemo(() => {
    const t = `${event.eventDate}T${event.startTime || '12:00'}:00`
    const d = new Date(t)
    return isNaN(d.getTime()) ? new Date(`${event.eventDate}T12:00:00`) : d
  }, [event.eventDate, event.startTime])

  const [now, setNow] = useState<number>(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const diff = target.getTime() - now
  const passed = diff <= 0
  const parts = [
    { label: 'Days', value: Math.floor(diff / 86_400_000) },
    { label: 'Hours', value: Math.floor(diff / 3_600_000) % 24 },
    { label: 'Minutes', value: Math.floor(diff / 60_000) % 60 },
    { label: 'Seconds', value: Math.floor(diff / 1000) % 60 },
  ]

  return (
    <div className="mx-auto max-w-3xl px-6">
      <Heading theme={theme}>{section.content.heading}</Heading>
      {passed ? (
        <p
          className="mt-8 text-3xl font-medium md:text-4xl"
          style={{ fontFamily: `'${theme.headingFont}', serif`, color: theme.primary }}
        >
          It&apos;s the big day!
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-4 gap-3 md:gap-6">
          {parts.map((p) => (
            <div
              key={p.label}
              className="flex flex-col items-center justify-center border py-5 md:py-8"
              style={{
                borderRadius: theme.borderRadius,
                borderColor: `${theme.primary}33`,
                backgroundColor: theme.secondary,
              }}
            >
              <span
                className="text-3xl font-semibold tabular-nums md:text-5xl"
                style={{ fontFamily: `'${theme.headingFont}', serif`, color: theme.primary }}
              >
                {Math.max(0, p.value)}
              </span>
              <span
                className="mt-2 text-[10px] font-medium uppercase tracking-[0.2em] md:text-xs"
                style={{ fontFamily: `'${theme.bodyFont}', sans-serif`, color: theme.text, opacity: 0.7 }}
              >
                {p.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------- Details ----------

function DetailsSection({ section, event }: SectionRendererProps) {
  const { theme } = event
  const cards = [
    {
      icon: CalendarDays,
      title: 'When',
      lines: [
        formatDate(event.eventDate),
        [event.startTime ? formatTime(event.startTime) : '', event.endTime ? formatTime(event.endTime) : '']
          .filter(Boolean)
          .join(' – '),
      ].filter(Boolean),
    },
    {
      icon: MapPin,
      title: 'Where',
      lines: [event.venue, event.address].filter(Boolean),
    },
  ]
  return (
    <div className="mx-auto max-w-3xl px-6">
      <Heading theme={theme}>{section.content.heading}</Heading>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <div
            key={card.title}
            className="flex flex-col items-center border p-8 text-center"
            style={{
              borderRadius: theme.borderRadius * 2,
              borderColor: `${theme.primary}26`,
              backgroundColor: theme.background,
            }}
          >
            <span
              className="mb-4 flex h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: theme.secondary, color: theme.primary }}
            >
              <card.icon className="h-5 w-5" />
            </span>
            <h3 className="text-xl font-medium" style={{ fontFamily: `'${theme.headingFont}', serif`, color: theme.text }}>
              {card.title}
            </h3>
            {card.lines.map((line) => (
              <p
                key={line}
                className="mt-1 text-sm"
                style={{ fontFamily: `'${theme.bodyFont}', sans-serif`, color: theme.text, opacity: 0.75 }}
              >
                {line}
              </p>
            ))}
          </div>
        ))}
      </div>
      {section.content.note ? (
        <p
          className="mt-8 inline-flex items-start justify-center gap-2 text-sm italic"
          style={{ fontFamily: `'${theme.bodyFont}', sans-serif`, color: theme.primary }}
        >
          <Shirt className="mt-0.5 h-4 w-4 shrink-0" /> {section.content.note}
        </p>
      ) : null}
    </div>
  )
}

// ---------- Schedule (sub-events timeline) ----------

function ScheduleSection({ section, event }: SectionRendererProps) {
  const { theme } = event
  const items: SubEventRecord[] = event.subEvents ?? []
  return (
    <div className="mx-auto max-w-2xl px-6">
      <Heading theme={theme}>{section.content.heading}</Heading>
      {items.length === 0 ? (
        <p className="mt-6 text-sm opacity-60" style={{ fontFamily: `'${theme.bodyFont}', sans-serif`, color: theme.text }}>
          No schedule yet.
        </p>
      ) : (
        <div className="relative mt-10">
          <div className="absolute top-2 bottom-2 left-[7px] w-px opacity-30" style={{ backgroundColor: theme.primary }} />
          <div className="space-y-8">
            {items.map((s) => (
              <div key={s.id} className="relative pl-10 text-left">
                <span
                  className="absolute top-1.5 left-0 h-[15px] w-[15px] rounded-full border-4"
                  style={{ borderColor: theme.primary, backgroundColor: theme.background }}
                />
                <h3 className="text-xl font-medium" style={{ fontFamily: `'${theme.headingFont}', serif`, color: theme.text }}>
                  {s.name}
                </h3>
                <p
                  className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm"
                  style={{ fontFamily: `'${theme.bodyFont}', sans-serif`, color: theme.primary }}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" /> {formatDate(s.date)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> {formatTime(s.startTime)}
                    {s.endTime ? ` – ${formatTime(s.endTime)}` : ''}
                  </span>
                </p>
                {s.venue ? (
                  <p className="mt-1 text-sm" style={{ fontFamily: `'${theme.bodyFont}', sans-serif`, color: theme.text, opacity: 0.75 }}>
                    {s.venue}
                  </p>
                ) : null}
                {s.dressCode ? (
                  <p
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium"
                    style={{
                      fontFamily: `'${theme.bodyFont}', sans-serif`,
                      color: theme.primary,
                      backgroundColor: theme.secondary,
                      borderRadius: 999,
                      padding: '4px 12px',
                    }}
                  >
                    <Shirt className="h-3 w-3" /> Dress code: {s.dressCode}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ---------- Gallery ----------

function GallerySection({ section, event }: SectionRendererProps) {
  const { theme } = event
  const images = event.gallery ?? []
  const [lightbox, setLightbox] = useState<number | null>(null)
  return (
    <div className="mx-auto max-w-5xl px-6">
      <Heading theme={theme}>{section.content.heading}</Heading>
      {section.content.subtitle ? <Subtitle theme={theme}>{section.content.subtitle}</Subtitle> : null}
      {images.length === 0 ? (
        <div className="mt-8 grid grid-cols-3 gap-3 opacity-40">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex aspect-square items-center justify-center border border-dashed"
              style={{ borderColor: theme.primary, borderRadius: theme.borderRadius }}
            >
              <Heart className="h-6 w-6" style={{ color: theme.primary }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {images.map((img, i) => (
            <button
              key={`${img.url}-${i}`}
              type="button"
              onClick={() => setLightbox(i)}
              className="group overflow-hidden focus:outline-none"
              style={{ borderRadius: theme.borderRadius }}
              aria-label={img.caption || `Photo ${i + 1}`}
            >
              <img
                src={img.url}
                alt={img.caption || `Gallery photo ${i + 1}`}
                className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
      <Dialog open={lightbox !== null} onOpenChange={(open) => !open && setLightbox(null)}>
        <DialogContent
          className="max-w-3xl border-none bg-transparent p-0 shadow-none [&>button]:rounded-full [&>button]:bg-black/60 [&>button]:p-1 [&>button]:text-white"
          style={{ backgroundColor: 'transparent' }}
        >
          <DialogTitle className="sr-only">{images[lightbox ?? 0]?.caption || 'Gallery photo'}</DialogTitle>
          {lightbox !== null && images[lightbox] ? (
            <div className="flex flex-col items-center gap-3">
              <img
                src={images[lightbox].url}
                alt={images[lightbox].caption || 'Gallery photo'}
                className="max-h-[75vh] w-auto rounded-lg object-contain shadow-2xl"
              />
              {images[lightbox].caption ? (
                <p className="text-sm text-white/90" style={{ fontFamily: `'${theme.bodyFont}', sans-serif` }}>
                  {images[lightbox].caption}
                </p>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ---------- Map ----------

function MapSection({ section, event }: SectionRendererProps) {
  const { theme } = event
  const query = encodeURIComponent([event.venue, event.address].filter(Boolean).join(', '))
  return (
    <div className="mx-auto max-w-4xl px-6">
      <Heading theme={theme}>{section.content.heading}</Heading>
      <div
        className="relative mt-8 flex min-h-[320px] flex-col items-center justify-center p-10 text-center"
        style={{
          borderRadius: theme.borderRadius * 2,
          background: `linear-gradient(135deg, ${theme.secondary} 0%, ${theme.background} 60%, ${theme.secondary} 100%)`,
          border: `1px solid ${theme.primary}26`,
        }}
      >
        {/* faux map grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, ${theme.primary}0F 0, ${theme.primary}0F 1px, transparent 1px, transparent 44px), repeating-linear-gradient(90deg, ${theme.primary}0F 0, ${theme.primary}0F 1px, transparent 1px, transparent 44px)`,
          }}
          aria-hidden="true"
        />
        <span
          className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full shadow-md"
          style={{ backgroundColor: theme.primary, color: '#FFFFFF' }}
        >
          <MapPin className="h-7 w-7" />
        </span>
        <h3
          className="relative z-10 mt-5 text-2xl font-medium"
          style={{ fontFamily: `'${theme.headingFont}', serif`, color: theme.text }}
        >
          {event.venue}
        </h3>
        {event.address ? (
          <p
            className="relative z-10 mt-1 max-w-md text-sm"
            style={{ fontFamily: `'${theme.bodyFont}', sans-serif`, color: theme.text, opacity: 0.7 }}
          >
            {event.address}
          </p>
        ) : null}
        {query ? (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${query}`}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 mt-6 inline-flex min-h-11 items-center gap-2 px-6 py-2.5 text-sm font-medium transition-opacity hover:opacity-85"
            style={{
              borderRadius: buttonRadius(theme),
              backgroundColor: theme.primary,
              color: '#FFFFFF',
              fontFamily: `'${theme.bodyFont}', sans-serif`,
            }}
          >
            <ExternalLink className="h-4 w-4" /> Open in Google Maps
          </a>
        ) : null}
      </div>
    </div>
  )
}

// ---------- Accommodation ----------

function AccommodationSection({ section, event }: SectionRendererProps) {
  const { theme } = event
  const hotels = event.accommodations ?? []
  return (
    <div className="mx-auto max-w-5xl px-6">
      <Heading theme={theme}>{section.content.heading}</Heading>
      {section.content.subtitle ? <Subtitle theme={theme}>{section.content.subtitle}</Subtitle> : null}
      {hotels.length === 0 ? (
        <p className="mt-6 text-sm opacity-60" style={{ fontFamily: `'${theme.bodyFont}', sans-serif`, color: theme.text }}>
          Accommodation options coming soon.
        </p>
      ) : (
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {hotels.map((h) => (
            <div
              key={h.id}
              className="flex flex-col border p-6 text-left"
              style={{
                borderRadius: theme.borderRadius * 2,
                borderColor: `${theme.primary}26`,
                backgroundColor: theme.background,
              }}
            >
              <h3 className="text-lg font-medium" style={{ fontFamily: `'${theme.headingFont}', serif`, color: theme.text }}>
                {h.name}
              </h3>
              <div className="mt-1.5 flex items-center gap-0.5" style={{ color: theme.primary }} aria-label={`${h.stars} stars`}>
                {Array.from({ length: Math.max(0, Math.min(5, h.stars)) }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              {h.distance ? (
                <p
                  className="mt-2 inline-flex items-center gap-1.5 text-xs"
                  style={{ fontFamily: `'${theme.bodyFont}', sans-serif`, color: theme.text, opacity: 0.65 }}
                >
                  <MapPin className="h-3 w-3" /> {h.distance}
                </p>
              ) : null}
              {h.price ? (
                <p
                  className="mt-1 text-sm font-semibold"
                  style={{ fontFamily: `'${theme.bodyFont}', sans-serif`, color: theme.primary }}
                >
                  {h.price}
                </p>
              ) : null}
              {h.description ? (
                <p
                  className="mt-3 flex-1 text-xs leading-relaxed"
                  style={{ fontFamily: `'${theme.bodyFont}', sans-serif`, color: theme.text, opacity: 0.75 }}
                >
                  {h.description}
                </p>
              ) : (
                <div className="flex-1" />
              )}
              {h.url ? (
                <a
                  href={h.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex min-h-11 items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium transition-opacity hover:opacity-85"
                  style={{
                    borderRadius: buttonRadius(theme),
                    border: `1.5px solid ${theme.primary}`,
                    color: theme.primary,
                    fontFamily: `'${theme.bodyFont}', sans-serif`,
                  }}
                >
                  Visit website <ExternalLink className="h-3 w-3" />
                </a>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------- Registry ----------

function RegistrySection({ section, event, mode }: SectionRendererProps) {
  const { theme } = event
  const items = event.registryItems ?? []
  const contribute = (name: string, url?: string) => {
    if (mode === 'edit') {
      toast.info('Contributions open on the published site')
      return
    }
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
    toast.success(`Thank you for considering "${name}"!`)
  }
  return (
    <div className="mx-auto max-w-5xl px-6">
      <Heading theme={theme}>{section.content.heading}</Heading>
      {section.content.subtitle ? <Subtitle theme={theme}>{section.content.subtitle}</Subtitle> : null}
      {items.length === 0 ? (
        <p className="mt-6 text-sm opacity-60" style={{ fontFamily: `'${theme.bodyFont}', sans-serif`, color: theme.text }}>
          Registry coming soon.
        </p>
      ) : (
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {items.map((item) => {
            const pct = item.target > 0 ? Math.min(100, Math.round((item.raised / item.target) * 100)) : 0
            return (
              <div
                key={item.id}
                className="flex flex-col border p-6 text-left"
                style={{
                  borderRadius: theme.borderRadius * 2,
                  borderColor: `${theme.primary}26`,
                  backgroundColor: theme.background,
                }}
              >
                <span
                  className="mb-4 flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: theme.secondary, color: theme.primary }}
                >
                  <Gift className="h-4 w-4" />
                </span>
                <h3 className="text-lg font-medium" style={{ fontFamily: `'${theme.headingFont}', serif`, color: theme.text }}>
                  {item.name}
                </h3>
                {item.description ? (
                  <p
                    className="mt-2 flex-1 text-xs leading-relaxed"
                    style={{ fontFamily: `'${theme.bodyFont}', sans-serif`, color: theme.text, opacity: 0.75 }}
                  >
                    {item.description}
                  </p>
                ) : (
                  <div className="flex-1" />
                )}
                {item.target > 0 ? (
                  <div className="mt-4">
                    <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: `${theme.primary}26` }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: theme.primary }}
                      />
                    </div>
                    <p
                      className="mt-1.5 text-[11px]"
                      style={{ fontFamily: `'${theme.bodyFont}', sans-serif`, color: theme.text, opacity: 0.6 }}
                    >
                      {money(item.raised)} raised of {money(item.target)} ({pct}%)
                    </p>
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={() => contribute(item.name, item.url)}
                  className="mt-5 inline-flex min-h-11 items-center justify-center px-4 py-2 text-xs font-medium transition-opacity hover:opacity-85"
                  style={{
                    borderRadius: buttonRadius(theme),
                    backgroundColor: theme.primary,
                    color: '#FFFFFF',
                    fontFamily: `'${theme.bodyFont}', sans-serif`,
                  }}
                >
                  Contribute
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ---------- RSVP CTA ----------

function RsvpSection({ section, event, mode, onRsvp }: SectionRendererProps) {
  const { theme } = event
  const c = section.content
  return (
    <div className="mx-auto max-w-3xl px-6">
      <div
        className="px-8 py-14 text-center shadow-lg md:px-16"
        style={{ borderRadius: theme.borderRadius * 2, backgroundColor: theme.primary }}
      >
        <h2 className="text-3xl font-medium tracking-tight text-white md:text-4xl" style={{ fontFamily: `'${theme.headingFont}', serif` }}>
          {c.heading}
        </h2>
        {c.subtitle ? (
          <p className="mt-3 text-sm text-white/80 md:text-base" style={{ fontFamily: `'${theme.bodyFont}', sans-serif` }}>
            {c.subtitle}
          </p>
        ) : null}
        <ThemedButton
          theme={theme}
          variant="inverse"
          className="mt-8"
          onClick={() => (mode === 'live' && onRsvp ? onRsvp() : editRsvpHint(mode))}
        >
          {c.buttonText || 'RSVP Now'}
        </ThemedButton>
      </div>
    </div>
  )
}

// ---------- Contact ----------

function ContactSection({ section, event }: SectionRendererProps) {
  const { theme } = event
  const c = section.content
  return (
    <div className="mx-auto max-w-xl px-6">
      <Heading theme={theme}>{c.heading}</Heading>
      <div className="mt-8 flex flex-col items-center gap-4">
        {c.email ? (
          <a
            href={`mailto:${c.email}`}
            className="inline-flex min-h-11 items-center gap-2.5 text-sm transition-opacity hover:opacity-75"
            style={{ fontFamily: `'${theme.bodyFont}', sans-serif`, color: theme.primary }}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: theme.secondary }}>
              <Mail className="h-4 w-4" />
            </span>
            {c.email}
          </a>
        ) : null}
        {c.phone ? (
          <a
            href={`tel:${c.phone.replace(/\s/g, '')}`}
            className="inline-flex min-h-11 items-center gap-2.5 text-sm transition-opacity hover:opacity-75"
            style={{ fontFamily: `'${theme.bodyFont}', sans-serif`, color: theme.primary }}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: theme.secondary }}>
              <Phone className="h-4 w-4" />
            </span>
            {c.phone}
          </a>
        ) : null}
        {!c.email && !c.phone && (event.contactEmail || event.contactPhone) ? (
          <p className="text-sm" style={{ fontFamily: `'${theme.bodyFont}', sans-serif`, color: theme.text, opacity: 0.7 }}>
            {event.contactEmail} {event.contactPhone ? `· ${event.contactPhone}` : ''}
          </p>
        ) : null}
      </div>
    </div>
  )
}

// ---------- Divider ----------

function DividerSection({ event }: SectionRendererProps) {
  const { theme } = event
  return (
    <div className="flex items-center justify-center gap-4 px-6" aria-hidden="true">
      <span className="h-px w-16 opacity-40" style={{ backgroundColor: theme.primary }} />
      <span className="h-1.5 w-1.5 rotate-45" style={{ backgroundColor: theme.primary }} />
      <span className="h-px w-16 opacity-40" style={{ backgroundColor: theme.primary }} />
    </div>
  )
}

// ---------- Footer ----------

function FooterSection({ section, event }: SectionRendererProps) {
  const { theme } = event
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-10 text-center" style={{ backgroundColor: theme.primary }}>
      <p className="text-lg font-medium text-white" style={{ fontFamily: `'${theme.headingFont}', serif` }}>
        {section.content.text}
      </p>
      <p
        className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.25em] text-white/60"
        style={{ fontFamily: `'${theme.bodyFont}', sans-serif` }}
      >
        Made with <Heart className="h-3 w-3 fill-current" /> using Online RSVP
      </p>
    </div>
  )
}

// ============================================================
// Default export — section switch + themed wrapper
// ============================================================

export default function SectionRenderer({ section, event, mode, onRsvp }: SectionRendererProps) {
  const settings = section.settings
  const themeT = event.theme

  const paddingClass = sectionPaddingClass(settings)
  const alignClass = settings.align === 'left' ? 'text-left' : 'text-center'
  const hasBgImage = Boolean(settings.bgImage)
  const overlay = typeof settings.overlay === 'number' ? Math.max(0, Math.min(100, settings.overlay)) : 40

  const wrapperStyle: React.CSSProperties = {}
  if (settings.bg) wrapperStyle.backgroundColor = settings.bg
  if (hasBgImage) {
    wrapperStyle.backgroundImage = `url(${settings.bgImage})`
    wrapperStyle.backgroundSize = 'cover'
    wrapperStyle.backgroundPosition = 'center'
  }
  // Apply theme spacing multiplier when customized (overrides the base class)
  if (themeT.spacing !== 1) {
    const base = padBase(settings.padding) * themeT.spacing
    wrapperStyle.paddingTop = Math.round(base)
    wrapperStyle.paddingBottom = Math.round(base)
  }

  const animationClass = mode === 'edit' && settings.animation === 'fade' ? 'animate-float-in' : ''

  let content: React.ReactNode = null
  switch (section.type) {
    case 'hero':
      content = <HeroSection section={section} event={event} mode={mode} onRsvp={onRsvp} />
      break
    case 'text':
      content = <TextSection section={section} event={event} mode={mode} />
      break
    case 'story':
      content = <StorySection section={section} event={event} mode={mode} />
      break
    case 'countdown':
      content = <CountdownSection section={section} event={event} mode={mode} />
      break
    case 'details':
      content = <DetailsSection section={section} event={event} mode={mode} />
      break
    case 'schedule':
      content = <ScheduleSection section={section} event={event} mode={mode} />
      break
    case 'gallery':
      content = <GallerySection section={section} event={event} mode={mode} />
      break
    case 'map':
      content = <MapSection section={section} event={event} mode={mode} />
      break
    case 'accommodation':
      content = <AccommodationSection section={section} event={event} mode={mode} />
      break
    case 'registry':
      content = <RegistrySection section={section} event={event} mode={mode} />
      break
    case 'rsvp':
      content = <RsvpSection section={section} event={event} mode={mode} onRsvp={onRsvp} />
      break
    case 'contact':
      content = <ContactSection section={section} event={event} mode={mode} />
      break
    case 'divider':
      content = <DividerSection section={section} event={event} mode={mode} />
      break
    case 'footer':
      content = <FooterSection section={section} event={event} mode={mode} />
      break
    default:
      content = null
  }

  return (
    <section
      className={`relative w-full overflow-hidden ${paddingClass} ${alignClass} ${animationClass}`}
      style={wrapperStyle}
    >
      {hasBgImage ? (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ backgroundColor: `rgba(0,0,0,${overlay / 100})` }}
          aria-hidden="true"
        />
      ) : null}
      <div className={`relative z-10 w-full ${hasBgImage ? 'text-white' : ''}`}>{content}</div>
    </section>
  )
}

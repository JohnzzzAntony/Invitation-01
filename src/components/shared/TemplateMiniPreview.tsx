'use client'

import { Fragment } from 'react'
import { Calendar, Clock, Home, MapPin } from 'lucide-react'
import type { EventTheme, SectionData } from '@/lib/types'

// Non-interactive miniature website mockup built purely from schema data
// (theme tokens + section list). Used in template cards & marketing hero.
// Everything is pointer-events-none / select-none so cards stay clickable.

const LINE = 'h-1 rounded bg-black/10'

function Chip({ label, primary, radius }: { label: string; primary: string; radius: number }) {
  return (
    <span
      className="inline-block px-2.5 py-0.5 text-[8px] font-medium leading-snug text-white"
      style={{ background: primary, borderRadius: radius }}
    >
      {label}
    </span>
  )
}

function SectionHeading({ text, font }: { text?: string; font: string }) {
  if (!text) return null
  return (
    <div className="text-center text-[10px] font-semibold leading-tight" style={{ fontFamily: `'${font}', serif` }}>
      {text}
    </div>
  )
}

export function TemplateMiniPreview({
  theme,
  sections,
  className,
}: {
  theme: EventTheme
  sections: SectionData[]
  className?: string
}) {
  const radius = theme.buttonStyle === 'pill' ? 999 : theme.buttonStyle === 'square' ? 0 : 8
  const visible = (sections ?? []).filter((s) => s.visible).slice(0, 6)

  const render = (s: SectionData) => {
    const c = s.content ?? {}
    const heading = <SectionHeading text={c.heading} font={theme.headingFont} />
    switch (s.type) {
      case 'hero': {
        const hasImage = !!s.settings.bgImage
        return (
          <div
            className="relative flex min-h-[130px] flex-col items-center justify-center gap-1 px-3 py-5 text-center"
            style={{ background: s.settings.bg ?? (hasImage ? undefined : theme.secondary) }}
          >
            {hasImage && (
              <>
                <div
                  className="absolute inset-0"
                  style={{ backgroundImage: `url(${s.settings.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                />
                <div className="absolute inset-0 bg-black" style={{ opacity: (s.settings.overlay ?? 40) / 100 }} />
              </>
            )}
            <div className={`relative flex flex-col items-center gap-1 ${hasImage ? 'text-white' : ''}`}>
              <div className="text-lg font-semibold leading-tight md:text-xl" style={{ fontFamily: `'${theme.headingFont}', serif` }}>
                {c.heading}
              </div>
              <div className="text-[9px] opacity-80">{c.subheading}</div>
              <div className="text-[8px] uppercase tracking-[0.2em] opacity-70">
                {[c.dateText, c.locationText].filter(Boolean).join(' · ')}
              </div>
              {c.buttonText && <span className="mt-1"><Chip label={c.buttonText} primary={theme.primary} radius={radius} /></span>}
            </div>
          </div>
        )
      }
      case 'countdown':
        return (
          <div className="px-3 py-3 text-center">
            {heading}
            <div className="mt-1.5 flex justify-center gap-1.5">
              {['Days', 'Hrs', 'Min', 'Sec'].map((l) => (
                <div
                  key={l}
                  className="flex w-8 flex-col items-center rounded-md px-1 py-1"
                  style={{ background: theme.secondary, borderRadius: Math.min(radius, 8) }}
                >
                  <span className="text-[10px] font-semibold leading-none">00</span>
                  <span className="mt-0.5 text-[7px] uppercase tracking-wide opacity-60">{l}</span>
                </div>
              ))}
            </div>
          </div>
        )
      case 'details': {
        const cells = [
          { Icon: Calendar, label: c.dateText || '24 Oct 2026' },
          { Icon: Clock, label: c.timeText || '4:00 PM' },
          { Icon: MapPin, label: c.venueText || 'The Grand Hall' },
          { Icon: Home, label: c.addressText || '12 Rosewood Lane' },
        ]
        return (
          <div className="px-3 py-3">
            {heading}
            <div className="mt-1.5 grid grid-cols-2 gap-1.5">
              {cells.map(({ Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-1 rounded-md px-1.5 py-1 text-left"
                  style={{ background: theme.secondary }}
                >
                  <Icon className="h-2.5 w-2.5 shrink-0" style={{ color: theme.primary }} />
                  <span className="truncate text-[8px] opacity-80">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )
      }
      case 'schedule':
        return (
          <div className="px-3 py-3">
            {heading}
            <div className="mx-auto mt-2 max-w-[85%] space-y-2">
              {[0, 1].map((i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: theme.primary }} />
                  <span className={`${LINE} w-8`} />
                  <span className={`${LINE} flex-1`} />
                </div>
              ))}
            </div>
          </div>
        )
      case 'gallery':
        return (
          <div className="px-3 py-3 text-center">
            {heading}
            <div className="mt-1.5 grid grid-cols-3 gap-1">
              {[0, 1, 2].map((i) => (
                <div key={i} className="aspect-square rounded-md" style={{ background: theme.secondary }} />
              ))}
            </div>
          </div>
        )
      case 'rsvp':
        return (
          <div className="flex flex-col items-center gap-1 px-3 py-4 text-center" style={{ background: theme.secondary }}>
            <div className="text-[10px] font-semibold leading-tight" style={{ fontFamily: `'${theme.headingFont}', serif` }}>
              {c.heading}
            </div>
            <div className="text-[8px] opacity-70">{c.subtitle}</div>
            {c.buttonText && <span className="mt-1"><Chip label={c.buttonText} primary={theme.primary} radius={radius} /></span>}
          </div>
        )
      case 'story':
        return (
          <div className="flex items-center gap-2 px-3 py-3">
            <div
              className="h-10 w-10 shrink-0 rounded-md"
              style={
                c.image
                  ? { backgroundImage: `url(${c.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : { background: theme.secondary }
              }
            />
            <div className="min-w-0 flex-1 space-y-1">
              <div className="text-[10px] font-semibold leading-tight" style={{ fontFamily: `'${theme.headingFont}', serif` }}>
                {c.heading}
              </div>
              <div className={`${LINE} w-full`} />
              <div className={`${LINE} w-5/6`} />
              <div className={`${LINE} w-2/3`} />
            </div>
          </div>
        )
      case 'text':
      case 'contact':
        return (
          <div className="px-4 py-3 text-center">
            {heading}
            <div className="mx-auto mt-1 space-y-1">
              <div className={`${LINE} mx-auto w-3/4`} />
              <div className={`${LINE} mx-auto w-1/2`} />
            </div>
          </div>
        )
      case 'footer':
        return (
          <div className="px-3 py-2 text-center text-[8px]" style={{ background: theme.secondary, color: theme.text }}>
            {c.text || 'Made with Online RSVP'}
          </div>
        )
      case 'map':
        return (
          <div className="px-3 py-3">
            {heading}
            <div
              className="mt-1.5 flex h-12 items-center justify-center gap-1.5 rounded-md"
              style={{ background: theme.secondary }}
            >
              <MapPin className="h-3 w-3" style={{ color: theme.primary }} />
              <span className={`${LINE} w-10`} />
            </div>
          </div>
        )
      case 'accommodation':
      case 'registry':
        return (
          <div className="px-3 py-3 text-center">
            {heading}
            <div className="mt-1.5 grid grid-cols-2 gap-1.5">
              {[0, 1].map((i) => (
                <div key={i} className="rounded-md p-1.5" style={{ background: theme.secondary }}>
                  <div className="h-4 w-full rounded-sm bg-black/5" />
                  <div className={`${LINE} mx-auto mt-1 w-3/4`} />
                </div>
              ))}
            </div>
          </div>
        )
      case 'divider':
        return (
          <div className="px-6 py-2">
            <div className="h-px w-full" style={{ background: 'rgba(0,0,0,0.12)' }} />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div
      className={`pointer-events-none select-none overflow-hidden ${className ?? ''}`}
      style={{
        background: theme.background,
        color: theme.text,
        fontFamily: `'${theme.bodyFont}', sans-serif`,
        lineHeight: 1.45,
      }}
      aria-hidden="true"
    >
      {visible.map((s) => (
        <Fragment key={s.id}>{render(s)}</Fragment>
      ))}
    </div>
  )
}

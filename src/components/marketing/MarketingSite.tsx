'use client'

// ============================================================
// Task 6-a — Public marketing homepage (single-page SPA view)
// Sections: header, hero + live mockup, designs, how-it-works,
// features, pricing, FAQ, contact, footer. All internal
// navigation goes through the zustand store.
// ============================================================

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BarChart3,
  Check,
  ChevronRight,
  Clock,
  Heart,
  LayoutTemplate,
  Lock,
  Mail,
  MailCheck,
  Menu,
  Palette,
  Phone,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Users,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import { useApp } from '@/lib/store'
import { api } from '@/lib/api'
import { createSection } from '@/lib/sections'
import type { EventTheme, SectionData, TemplateRecord } from '@/lib/types'
import { TemplateMiniPreview } from '@/components/shared/TemplateMiniPreview'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

// ---------- shared bits ----------

const WARM = '#9A7B5B'

const DEMO_WEDDING_THEME: EventTheme = {
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

function useHeroMockSections(): SectionData[] {
  return useMemo(() => {
    const hero = createSection('hero')
    hero.content = {
      heading: 'John & Emily',
      subheading: 'Are getting married',
      dateText: '24 October 2026',
      locationText: 'Dubai, UAE',
      buttonText: 'RSVP Now',
    }
    return [
      hero,
      createSection('countdown'),
      createSection('details'),
      createSection('rsvp'),
      createSection('footer'),
    ]
  }, [])
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function FadeUp({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  )
}

// ---------- live countdown inside the browser mockup ----------

function MockCountdown() {
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => {
    const update = () => setNow(Date.now())
    const raf = requestAnimationFrame(update)
    const t = setInterval(update, 1000)
    return () => {
      cancelAnimationFrame(raf)
      clearInterval(t)
    }
  }, [])
  const diff = now ? Math.max(0, new Date('2026-10-24T16:00:00').getTime() - now) : 0
  const cells = [
    { label: 'Days', value: now === null ? '--' : Math.floor(diff / 86_400_000) },
    { label: 'Hours', value: now === null ? '--' : Math.floor(diff / 3_600_000) % 24 },
    { label: 'Mins', value: now === null ? '--' : Math.floor(diff / 60_000) % 60 },
    { label: 'Secs', value: now === null ? '--' : Math.floor(diff / 1_000) % 60 },
  ]
  return (
    <div
      className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5"
      aria-label="Live countdown to 24 October 2026"
    >
      {cells.map((c) => (
        <div
          key={c.label}
          className="min-w-[46px] rounded-md border border-black/5 bg-white/95 px-2 py-1.5 text-center shadow-sm backdrop-blur"
        >
          <div className="text-sm font-semibold tabular-nums text-[#272727]">{c.value}</div>
          <div className="text-[9px] font-medium uppercase tracking-wider text-[#73736D]">
            {c.label}
          </div>
        </div>
      ))}
    </div>
  )
}

// ---------- feature visual mocks (pure CSS) ----------

function MockWindow({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-lg shadow-stone-200/60">
      <div className="flex items-center gap-1.5 border-b bg-muted/60 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-[#E7E5DF]" />
        <span className="size-2.5 rounded-full bg-[#D6C7B2]" />
        <span className="size-2.5 rounded-full bg-[#9A7B5B]/60" />
        <span className="ml-2 text-xs font-medium text-muted-foreground">{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

function BuilderMock() {
  return (
    <MockWindow title="Website builder">
      <div className="flex gap-3">
        <div className="w-24 shrink-0 space-y-1.5 rounded-lg bg-muted/70 p-2">
          {['Hero', 'Countdown', 'Details', 'Gallery', 'RSVP'].map((s, i) => (
            <div
              key={s}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[10px] font-medium',
                i === 1 ? 'bg-[#9A7B5B] text-white shadow-sm' : 'text-muted-foreground'
              )}
            >
              <span className={cn('size-1.5 rounded-full', i === 1 ? 'bg-white' : 'bg-[#D6C7B2]')} />
              {s}
            </div>
          ))}
        </div>
        <div className="flex-1 space-y-2 rounded-lg border border-dashed border-[#9A7B5B]/40 bg-[#F6F1EA]/60 p-3">
          <div className="h-2 w-1/2 rounded bg-[#9A7B5B]/70" />
          <div className="h-1.5 w-3/4 rounded bg-[#9A7B5B]/30" />
          <div className="mt-2 flex gap-1.5">
            <div className="h-5 w-14 rounded-md bg-[#9A7B5B]" />
            <div className="h-5 w-14 rounded-md border border-[#9A7B5B]/40 bg-white" />
          </div>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            <div className="h-8 rounded bg-white shadow-sm" />
            <div className="h-8 rounded bg-white shadow-sm" />
            <div className="h-8 rounded bg-white shadow-sm" />
          </div>
        </div>
      </div>
    </MockWindow>
  )
}

function GuestsMock() {
  const stats = [
    { label: 'Total', value: 186, dot: 'bg-[#8A8A82]' },
    { label: 'Attending', value: 121, dot: 'bg-[#7C8A6E]' },
    { label: 'Pending', value: 42, dot: 'bg-[#C9A96A]' },
    { label: 'Declined', value: 23, dot: 'bg-[#B3543F]' },
  ]
  return (
    <MockWindow title="Guest list">
      <div className="grid grid-cols-2 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border bg-background px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              <span className={cn('size-1.5 rounded-full', s.dot)} />
              {s.label}
            </div>
            <div className="mt-0.5 text-xl font-semibold tabular-nums">{s.value}</div>
          </div>
        ))}
      </div>
      <div className="mt-3">
        <div className="mb-1.5 flex justify-between text-[10px] font-medium text-muted-foreground">
          <span>Response rate</span>
          <span>87%</span>
        </div>
        <Progress value={87} className="h-2" />
      </div>
    </MockWindow>
  )
}

function RsvpMock() {
  return (
    <MockWindow title="RSVP form">
      <div className="space-y-3">
        <div>
          <p className="text-xs font-medium">Will you attend?</p>
          <div className="mt-1.5 flex gap-2">
            <div className="flex h-8 flex-1 items-center justify-center gap-1 rounded-full bg-[#7C8A6E] text-[11px] font-medium text-white">
              <Check className="size-3" aria-hidden /> Joyfully accepts
            </div>
            <div className="flex h-8 flex-1 items-center justify-center rounded-full border text-[11px] text-muted-foreground">
              Regretfully declines
            </div>
          </div>
        </div>
        <div>
          <p className="text-xs font-medium">Meal choice</p>
          <div className="mt-1.5 flex h-8 items-center justify-between rounded-md border px-3 text-[11px] text-muted-foreground">
            Grilled salmon <ChevronRight className="size-3" aria-hidden />
          </div>
        </div>
        <div className="flex items-center justify-between rounded-md bg-muted/70 px-3 py-2">
          <span className="text-[11px] font-medium">Bringing a plus-one?</span>
          <span className="flex h-4 w-7 items-center rounded-full bg-[#9A7B5B] px-0.5">
            <span className="ml-auto size-3 rounded-full bg-white shadow-sm" />
          </span>
        </div>
      </div>
    </MockWindow>
  )
}

function InvitationsMock() {
  const cells = Array.from({ length: 25 }, (_, i) => (i * 7 + 3) % 3 !== 0)
  return (
    <MockWindow title="Email invitation">
      <div className="space-y-2.5">
        <div className="rounded-lg border bg-background p-3">
          <div className="h-1.5 w-3/4 rounded bg-[#272727]/70" />
          <div className="mt-1.5 space-y-1">
            <div className="h-1 w-full rounded bg-muted-foreground/20" />
            <div className="h-1 w-5/6 rounded bg-muted-foreground/20" />
            <div className="h-1 w-2/3 rounded bg-muted-foreground/20" />
          </div>
          <div className="mt-2.5 flex items-center gap-3">
            <div className="flex h-7 w-24 items-center justify-center rounded-md bg-[#9A7B5B] text-[10px] font-medium text-white">
              RSVP Now
            </div>
            <div className="grid grid-cols-5 gap-px rounded border bg-white p-1">
              {cells.map((on, i) => (
                <span
                  key={i}
                  className={cn('size-1.5', on ? 'bg-[#272727]' : 'bg-transparent')}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <Sparkles className="size-3 text-[#9A7B5B]" aria-hidden />
          Personalized link + QR code for every guest
        </div>
      </div>
    </MockWindow>
  )
}

// ---------- logo ----------

export function BrandLogo({ dark = false }: { dark?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span
        className="flex size-8 items-center justify-center rounded-lg text-white shadow-sm"
        style={{ backgroundColor: WARM }}
      >
        <Heart className="size-4 fill-current" aria-hidden />
      </span>
      <span
        className={cn(
          'text-[15px] font-semibold tracking-tight',
          dark ? 'text-white' : 'text-foreground'
        )}
      >
        Online RSVP
      </span>
    </span>
  )
}

// ============================================================
// MarketingSite
// ============================================================

const NAV_LINKS = [
  { label: 'Features', id: 'features' },
  { label: 'Designs', id: 'designs' },
  { label: 'Pricing', id: 'pricing' },
  { label: 'FAQ', id: 'faq' },
]

const STEPS = [
  {
    icon: Palette,
    title: 'Choose a design',
    desc: 'Pick from beautiful, ready-made templates for any occasion.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Customize your website',
    desc: 'Change colors, fonts and sections with live drag & drop editing.',
  },
  {
    icon: Users,
    title: 'Add your guests',
    desc: 'Group guests by family or team, or import your whole list from Excel.',
  },
  {
    icon: Send,
    title: 'Send invitations',
    desc: 'Beautiful emails with personalized links and QR codes for every guest.',
  },
  {
    icon: BarChart3,
    title: 'Track RSVPs',
    desc: 'Watch confirmations, meal choices and plus-ones arrive in real time.',
  },
]

const FEATURES = [
  {
    icon: LayoutTemplate,
    title: 'Website Builder',
    desc: 'A stunning event website in minutes — no code, no designers, no stress.',
    bullets: [
      'Drag & drop sections',
      'Live preview while you edit',
      'Device preview for desktop, tablet & mobile',
    ],
    Visual: BuilderMock,
  },
  {
    icon: Users,
    title: 'Guest Management',
    desc: 'Every name, every group, every answer — organized in one calm place.',
    bullets: [
      'Total, confirmed, pending & declined at a glance',
      'Group guests by family, friends or team',
      'Import & export guests from Excel or CSV',
    ],
    Visual: GuestsMock,
  },
  {
    icon: MailCheck,
    title: 'RSVP Management',
    desc: 'Collect exactly the information you need, beautifully formatted.',
    bullets: [
      'Custom RSVP questions',
      'Meal choices and dietary needs',
      'Plus-ones and party sizes handled automatically',
    ],
    Visual: RsvpMock,
  },
  {
    icon: Send,
    title: 'Invitations',
    desc: 'Deliver invitations that feel personal — and chase replies for you.',
    bullets: [
      'Email invitations with personalized links',
      'Automatic reminders for pending guests',
      'QR codes for instant on-the-day check-in',
    ],
    Visual: InvitationsMock,
  },
]

const PRICING = [
  {
    name: 'Starter',
    price: 'Free',
    suffix: 'forever',
    desc: 'Perfect for trying things out or a small get-together.',
    features: ['1 event website', 'Up to 20 guests', 'RSVP form & responses', 'onlinersvp.com sub-domain'],
    cta: 'Start for free',
    featured: false,
  },
  {
    name: 'Pro',
    price: '$49',
    suffix: 'one-time per event',
    desc: 'Everything you need for a wedding or big celebration.',
    features: [
      'Unlimited guests',
      'Custom domain',
      'QR check-in codes',
      'Email invitations & reminders',
      'RSVP analytics',
    ],
    cta: 'Get Pro',
    featured: true,
  },
  {
    name: 'Studio',
    price: '$149',
    suffix: 'lifetime',
    desc: 'For planners and serial celebrants. Pay once, celebrate always.',
    features: ['Everything in Pro', 'Unlimited events', 'Up to 5 team seats', 'Priority support'],
    cta: 'Go Studio',
    featured: false,
  },
]

const FAQS = [
  {
    q: 'How many guests can I invite?',
    a: 'The free Starter plan includes up to 20 guests. Pro removes the limit entirely — invite as many guests as you like for a one-time payment of $49 per event.',
  },
  {
    q: 'Can I use my own domain?',
    a: 'Yes. Pro and Studio events support custom domains (for example emmaandnoah.com). Add your domain in event settings, point one DNS record at us, and we verify it automatically within minutes.',
  },
  {
    q: 'Can guests edit their RSVP after submitting?',
    a: 'Absolutely. Every guest receives a personalized link that lets them view and change their response, meal choice and plus-ones any time until you close the RSVP deadline.',
  },
  {
    q: 'Can I import guests from Excel?',
    a: 'Yes — upload a CSV or XLSX file and we match columns for name, email, group and party size. You can also export the live guest list and every RSVP answer at any time.',
  },
  {
    q: 'Are the templates customizable?',
    a: 'Fully. Every template is a starting point: swap colors, fonts, buttons and spacing, reorder or hide sections, and edit all text and images with the drag & drop builder.',
  },
  {
    q: 'What is your refund policy?',
    a: 'One-time purchases are refundable within 14 days, no questions asked. Email us and the amount is returned to the original payment method within a few business days.',
  },
]

export default function MarketingSite() {
  const user = useApp((s) => s.user)
  const openAuth = useApp((s) => s.openAuth)
  const openOnboarding = useApp((s) => s.openOnboarding)
  const heroSections = useHeroMockSections()

  const startCreating = () => (user ? openOnboarding(null) : openAuth('register'))

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader onStart={startCreating} />
      <main className="flex-1">
        <Hero onStart={startCreating} sections={heroSections} />
        <DesignShowcase user={user} />
        <HowItWorks />
        <FeaturesSection />
        <PricingSection onStart={startCreating} />
        <FaqSection />
        <ContactSection />
      </main>
      <SiteFooter />
    </div>
  )
}

// ---------- header ----------

function SiteHeader({ onStart }: { onStart: () => void }) {
  const openAuth = useApp((s) => s.openAuth)
  const [open, setOpen] = useState(false)

  const nav = (id: string) => {
    setOpen(false)
    scrollToSection(id)
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <button
          type="button"
          onClick={() => scrollToSection('top')}
          className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Online RSVP — back to top"
        >
          <BrandLogo />
        </button>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {NAV_LINKS.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => nav(l.id)}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {l.label}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" className="h-10 px-4" onClick={() => openAuth('login')}>
            Log in
          </Button>
          <Button size="lg" className="h-10 px-5" onClick={onStart}>
            Get Started
          </Button>
        </div>

        <button
          type="button"
          className="flex size-11 items-center justify-center rounded-md text-foreground md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="overflow-hidden border-t bg-background md:hidden"
          >
            <div className="space-y-1 px-4 py-4">
              {NAV_LINKS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => nav(l.id)}
                  className="flex min-h-[44px] w-full items-center rounded-md px-3 text-[15px] font-medium text-foreground hover:bg-accent"
                >
                  {l.label}
                </button>
              ))}
              <div className="flex gap-2 pt-3">
                <Button
                  variant="outline"
                  className="h-11 flex-1"
                  onClick={() => {
                    setOpen(false)
                    openAuth('login')
                  }}
                >
                  Log in
                </Button>
                <Button
                  className="h-11 flex-1"
                  onClick={() => {
                    setOpen(false)
                    onStart()
                  }}
                >
                  Get Started
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

// ---------- hero ----------

function Hero({ onStart, sections }: { onStart: () => void; sections: SectionData[] }) {
  return (
    <section id="top" className="relative overflow-hidden">
      {/* decorative slow-zoom blobs */}
      <div
        aria-hidden
        className="animate-slow-zoom pointer-events-none absolute -top-32 right-[-10%] size-[420px] rounded-full bg-[#9A7B5B]/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-20%] left-[-8%] size-[320px] rounded-full bg-[#C9A96A]/10 blur-3xl"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:py-24 lg:grid-cols-2">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.09 } } }}
        >
          <motion.div variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}>
            <Badge
              variant="outline"
              className="gap-1.5 border-[#9A7B5B]/40 bg-[#F6F1EA] px-3 py-1.5 text-[13px] text-[#6B533B]"
            >
              <Sparkles className="size-3.5 text-[#9A7B5B]" aria-hidden />
              One-time pricing • Unlimited guests
            </Badge>
          </motion.div>

          <motion.h1
            variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
            className="font-display mt-6 text-5xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl"
          >
            Create your perfect event website
          </motion.h1>

          <motion.p
            variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
            className="mt-4 text-xl font-medium text-[#9A7B5B]"
          >
            Beautiful invitations. Easy RSVPs. Happy guests.
          </motion.p>

          <motion.p
            variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
            className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground"
          >
            Build a gorgeous event website, invite everyone you love and collect RSVPs,
            meal choices and plus-ones automatically — all from one simple dashboard.
          </motion.p>

          <motion.div
            variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Button size="lg" className="h-12 px-7 text-base shadow-md" onClick={onStart}>
              Create My Event
              <ChevronRight className="size-4" aria-hidden />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-7 text-base"
              onClick={() => scrollToSection('designs')}
            >
              Explore Designs
            </Button>
          </motion.div>

          <motion.div
            variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
            className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground"
          >
            <span className="flex items-center gap-2">
              <Users className="size-4 text-[#9A7B5B]" aria-hidden />
              12,000+ events created
            </span>
            <span className="flex items-center gap-2">
              <span className="flex" role="img" aria-label="Rated 4.9 out of 5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="size-4 fill-amber-500 text-amber-500" aria-hidden />
                ))}
              </span>
              4.9/5 rating
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-[#9A7B5B]" aria-hidden />
              No credit card required
            </span>
          </motion.div>
        </motion.div>

        {/* browser mockup */}
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="relative"
        >
          <div
            aria-hidden
            className="animate-slow-zoom absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-[#9A7B5B]/15 via-transparent to-[#C9A96A]/15 blur-xl"
          />
          <div className="relative overflow-hidden rounded-2xl border bg-card shadow-2xl shadow-stone-300/50">
            <div className="flex items-center gap-2 border-b bg-muted/60 px-4 py-3">
              <span className="flex gap-1.5" aria-hidden>
                <span className="size-3 rounded-full bg-[#E7E5DF]" />
                <span className="size-3 rounded-full bg-[#D6C7B2]" />
                <span className="size-3 rounded-full bg-[#9A7B5B]/70" />
              </span>
              <span className="ml-2 flex flex-1 items-center gap-1.5 rounded-md bg-background px-3 py-1.5 text-xs text-muted-foreground">
                <Lock className="size-3 text-[#7C8A6E]" aria-hidden />
                john-emily.onlinersvp.com
              </span>
            </div>
            <div className="relative">
              <div className="pointer-events-none select-none" aria-hidden>
                <TemplateMiniPreview
                  theme={DEMO_WEDDING_THEME}
                  sections={sections}
                  className="h-80 w-full md:h-[360px]"
                />
              </div>
              <MockCountdown />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ---------- designs ----------

const DESIGN_CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'wedding', label: 'Wedding' },
  { key: 'birthday', label: 'Birthday' },
  { key: 'baby', label: 'Baby' },
  { key: 'corporate', label: 'Corporate' },
  { key: 'party', label: 'Party' },
]

function DesignShowcase({ user }: { user: ReturnType<typeof useApp.getState>['user'] }) {
  const openAuth = useApp((s) => s.openAuth)
  const openOnboarding = useApp((s) => s.openOnboarding)
  const [templates, setTemplates] = useState<TemplateRecord[] | null>(null)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [cat, setCat] = useState('all')
  const [preview, setPreview] = useState<TemplateRecord | null>(null)

  const load = () => {
    setLoading(true)
    setError(false)
    api<{ templates: TemplateRecord[] }>('/api/templates')
      .then((d) => setTemplates(d.templates))
      .catch(() => {
        setError(true)
        toast.error('Could not load designs. Please try again.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    let alive = true
    api<{ templates: TemplateRecord[] }>('/api/templates')
      .then((d) => {
        if (alive) setTemplates(d.templates)
      })
      .catch(() => {
        if (alive) {
          setError(true)
          toast.error('Could not load designs. Please try again.')
        }
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [])

  const filtered = useMemo(
    () => (templates ?? []).filter((t) => cat === 'all' || t.category === cat),
    [templates, cat]
  )
  const shown = filtered.slice(0, 8)

  const confirmUse = (t: TemplateRecord) => {
    setPreview(null)
    if (user) openOnboarding(t.id)
    else openAuth('register')
  }

  return (
    <section id="designs" className="scroll-mt-20 border-t bg-card/50 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <FadeUp className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#9A7B5B]">Designs</p>
          <h2 className="font-display mt-2 text-4xl font-semibold tracking-tight">
            Popular designs
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Hand-crafted templates for weddings, birthdays, baby showers and more.
            Every design is fully customizable.
          </p>
        </FadeUp>

        <FadeUp delay={0.08} className="mt-8 flex flex-wrap justify-center gap-2">
          {DESIGN_CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setCat(c.key)}
              aria-pressed={cat === c.key}
              className={cn(
                'min-h-[40px] rounded-full border px-4 text-sm font-medium transition-colors',
                cat === c.key
                  ? 'border-transparent bg-primary text-primary-foreground shadow-sm'
                  : 'bg-background text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              {c.label}
            </button>
          ))}
        </FadeUp>

        {loading ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border bg-card p-3">
                <Skeleton className="h-40 w-full rounded-xl" />
                <Skeleton className="mt-3 h-4 w-2/3" />
                <Skeleton className="mt-2 h-3 w-1/3" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="mt-10 text-center">
            <p className="text-muted-foreground">Designs could not be loaded.</p>
            <Button variant="outline" className="mt-4" onClick={load}>
              Try again
            </Button>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {shown.map((t, i) => (
              <FadeUp key={t.id} delay={Math.min(i * 0.05, 0.3)}>
                <div className="group h-full overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div
                    className="pointer-events-none h-40 select-none overflow-hidden border-b bg-muted"
                    aria-hidden
                  >
                    <TemplateMiniPreview
                      theme={t.theme}
                      sections={t.sections}
                      className="h-full w-full transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="truncate text-sm font-semibold">{t.name}</h3>
                      <Badge variant="secondary" className="shrink-0 capitalize">
                        {t.style}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs capitalize text-muted-foreground">
                      {t.category} template
                    </p>
                    <Button variant="outline" className="mt-3 w-full" onClick={() => setPreview(t)}>
                      Preview
                    </Button>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        )}

        {!loading && !error && (
          <FadeUp className="mt-10 text-center">
            <Button
              variant="outline"
              size="lg"
              className="h-11"
              onClick={() => toast.info('All 8 designs are shown in this demo')}
            >
              Explore All Designs
            </Button>
          </FadeUp>
        )}
      </div>

      {/* preview dialog */}
      <Dialog open={!!preview} onOpenChange={(v) => !v && setPreview(null)}>
        <DialogContent className="max-w-lg">
          {preview && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">{preview.name}</DialogTitle>
                <DialogDescription className="capitalize">
                  {preview.category} • {preview.style} style
                </DialogDescription>
              </DialogHeader>
              <div
                className="pointer-events-none h-80 select-none overflow-hidden rounded-xl border bg-muted"
                aria-hidden
              >
                <TemplateMiniPreview
                  theme={preview.theme}
                  sections={preview.sections}
                  className="h-full w-full"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {preview.tags.slice(0, 4).map((tag) => (
                  <Badge key={tag} variant="outline" className="font-normal">
                    {tag}
                  </Badge>
                ))}
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setPreview(null)}>
                  Close
                </Button>
                <Button
                  className="text-white"
                  style={{ backgroundColor: WARM }}
                  onClick={() => confirmUse(preview)}
                >
                  Use This Design
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}

// ---------- how it works ----------

function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <FadeUp className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#9A7B5B]">
            How it works
          </p>
          <h2 className="font-display mt-2 text-4xl font-semibold tracking-tight">
            From idea to RSVPs in five steps
          </h2>
        </FadeUp>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((s, i) => (
            <FadeUp key={s.title} delay={i * 0.07}>
              <div className="relative h-full rounded-2xl border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md after:absolute after:right-[-14px] after:top-1/2 after:z-10 after:hidden after:h-px after:w-7 after:bg-border after:content-[''] lg:after:block lg:last:after:hidden">
                <div className="flex items-start justify-between">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-[#F6F1EA]">
                    <s.icon className="size-5 text-[#9A7B5B]" aria-hidden />
                  </span>
                  <span className="font-display text-4xl font-semibold leading-none text-[#9A7B5B]/25">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="mt-4 text-sm font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------- features ----------

function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-20 border-t bg-card/50 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <FadeUp className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#9A7B5B]">
            Features
          </p>
          <h2 className="font-display mt-2 text-4xl font-semibold tracking-tight">
            Everything your event needs
          </h2>
        </FadeUp>

        <div className="mt-14 space-y-16 md:space-y-24">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
              <FadeUp className={cn(i % 2 === 1 && 'lg:order-2')}>
                <span className="flex size-11 items-center justify-center rounded-xl bg-[#F6F1EA]">
                  <f.icon className="size-5 text-[#9A7B5B]" aria-hidden />
                </span>
                <h3 className="font-display mt-4 text-3xl font-semibold tracking-tight">
                  {f.title}
                </h3>
                <p className="mt-2 text-muted-foreground">{f.desc}</p>
                <ul className="mt-5 space-y-2.5">
                  {f.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-sm">
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#7C8A6E]/15">
                        <Check className="size-3 text-[#5C6B50]" aria-hidden />
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
              </FadeUp>
              <FadeUp delay={0.1} className={cn(i % 2 === 1 && 'lg:order-1')}>
                <f.Visual />
              </FadeUp>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------- pricing ----------

function PricingSection({ onStart }: { onStart: () => void }) {
  return (
    <section id="pricing" className="scroll-mt-20 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <FadeUp className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#9A7B5B]">
            Pricing
          </p>
          <h2 className="font-display mt-2 text-4xl font-semibold tracking-tight">
            Pay once. Celebrate forever.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            No subscriptions, no per-guest fees, no surprises.
          </p>
        </FadeUp>

        <div className="mt-12 grid gap-6 md:grid-cols-3 md:items-start">
          {PRICING.map((p, i) => (
            <FadeUp key={p.name} delay={i * 0.08} className="h-full">
              <div
                className={cn(
                  'relative flex h-full flex-col rounded-2xl border p-6 shadow-sm transition-all duration-300 hover:-translate-y-1',
                  p.featured
                    ? 'border-transparent bg-primary text-primary-foreground shadow-xl md:-translate-y-2 md:hover:-translate-y-3'
                    : 'bg-card hover:shadow-md'
                )}
              >
                {p.featured && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-semibold text-white shadow-md"
                    style={{ backgroundColor: WARM }}
                  >
                    Most popular
                  </span>
                )}
                <h3 className="text-sm font-semibold uppercase tracking-widest opacity-80">
                  {p.name}
                </h3>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-display text-5xl font-semibold">{p.price}</span>
                  <span
                    className={cn('text-sm', p.featured ? 'text-primary-foreground/70' : 'text-muted-foreground')}
                  >
                    {p.suffix}
                  </span>
                </div>
                <p className={cn('mt-2 text-sm', p.featured ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                  {p.desc}
                </p>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <span
                        className={cn(
                          'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full',
                          p.featured ? 'bg-white/15' : 'bg-[#7C8A6E]/15'
                        )}
                      >
                        <Check
                          className={cn('size-3', p.featured ? 'text-[#D9BE8C]' : 'text-[#5C6B50]')}
                          aria-hidden
                        />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  size="lg"
                  className="mt-6 h-11 w-full"
                  variant={p.featured ? 'secondary' : 'outline'}
                  style={p.featured ? { backgroundColor: WARM, color: '#fff' } : undefined}
                  onClick={onStart}
                >
                  {p.cta}
                </Button>
              </div>
            </FadeUp>
          ))}
        </div>

        <FadeUp className="mt-8 text-center text-sm text-muted-foreground">
          One-time pricing. No subscriptions. Ever.
        </FadeUp>
      </div>
    </section>
  )
}

// ---------- FAQ ----------

function FaqSection() {
  return (
    <section id="faq" className="scroll-mt-20 border-t bg-card/50 py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-4">
        <FadeUp className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#9A7B5B]">FAQ</p>
          <h2 className="font-display mt-2 text-4xl font-semibold tracking-tight">
            Questions, answered
          </h2>
        </FadeUp>

        <FadeUp delay={0.1} className="mt-10">
          <Accordion type="single" collapsible className="rounded-2xl border bg-card px-5">
            {FAQS.map((f, i) => (
              <AccordionItem key={f.q} value={`item-${i}`} className="last:border-b-0">
                <AccordionTrigger className="text-left text-[15px] font-medium">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </FadeUp>
      </div>
    </section>
  )
}

// ---------- contact ----------

function ContactSection() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Please fill in all fields before sending.')
      return
    }
    toast.success('Message sent — we will reply within 24 hours')
    setName('')
    setEmail('')
    setMessage('')
  }

  return (
    <section id="contact" className="scroll-mt-20 py-16 md:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-2 lg:gap-16">
        <FadeUp>
          <p className="text-sm font-semibold uppercase tracking-widest text-[#9A7B5B]">Contact</p>
          <h2 className="font-display mt-2 text-4xl font-semibold tracking-tight">
            Talk to a human
          </h2>
          <p className="mt-3 max-w-md text-muted-foreground">
            Planning something special and not sure where to start? Write to us — a real
            person reads every message and replies within one business day.
          </p>
          <div className="mt-8 space-y-4">
            {[
              { icon: Mail, label: 'Email', value: 'hello@onlinersvp.com' },
              { icon: Phone, label: 'Phone', value: '+971 4 000 0000' },
              { icon: Clock, label: 'Hours', value: 'Mon–Fri, 9:00–18:00 GST' },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-[#F6F1EA]">
                  <row.icon className="size-4 text-[#9A7B5B]" aria-hidden />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{row.label}</p>
                  <p className="text-sm font-medium">{row.value}</p>
                </div>
              </div>
            ))}
          </div>
        </FadeUp>

        <FadeUp delay={0.1}>
          <form
            onSubmit={submit}
            className="space-y-4 rounded-2xl border bg-card p-6 shadow-sm"
            aria-label="Contact form"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contact-name">Name</Label>
                <Input
                  id="contact-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="h-11"
                  autoComplete="name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-11"
                  autoComplete="email"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-message">Message</Label>
              <Textarea
                id="contact-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us about your event..."
                className="min-h-28"
              />
            </div>
            <Button type="submit" size="lg" className="h-11 w-full text-base">
              <Send className="size-4" aria-hidden />
              Send message
            </Button>
          </form>
        </FadeUp>
      </div>
    </section>
  )
}

// ---------- footer ----------

function SiteFooter() {
  const stub = () => toast.info('This page is not included in the demo')
  const setView = useApp((s) => s.setView)
  const columns = [
    {
      title: 'Product',
      links: [
        { label: 'Features', action: () => scrollToSection('features') },
        { label: 'Designs', action: () => scrollToSection('designs') },
        { label: 'Pricing', action: () => scrollToSection('pricing') },
        { label: 'FAQ', action: () => scrollToSection('faq') },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', action: stub },
        { label: 'Contact', action: () => scrollToSection('contact') },
        { label: 'Blog', action: stub },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy', action: stub },
        { label: 'Terms', action: stub },
        { label: 'Cookies', action: stub },
      ],
    },
  ]

  return (
    <footer className="mt-auto bg-[#181816] text-stone-300">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div className="max-w-xs">
            <BrandLogo dark />
            <p className="mt-3 text-sm leading-relaxed text-stone-400">
              Beautiful event websites, effortless RSVPs and happy guests — all in one place.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-500">
                  {col.title}
                </h3>
                <ul className="mt-3 space-y-1.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <button
                        type="button"
                        onClick={l.action}
                        className="rounded px-0 py-1.5 text-sm text-stone-300 transition-colors hover:text-white"
                      >
                        {l.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-stone-500 sm:flex-row">
          <p>© 2026 Online RSVP. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <p>Made with care for people who celebrate.</p>
            <button
              type="button"
              onClick={() => setView('admin')}
              className="rounded px-2 py-1 transition-colors hover:text-stone-300"
              aria-label="Platform admin"
            >
              Admin
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}

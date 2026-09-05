'use client'

// Task 6-b — SettingsTab: event settings (wireframe §39–40).
// Sections: General, Privacy, RSVP, Notifications, Custom domain, Danger zone.
import * as React from 'react'
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Globe,
  Loader2,
  PauseCircle,
  ShieldCheck,
  Timer,
  Trash2,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { useApp } from '@/lib/store'
import { api } from '@/lib/api'
import type { EventRecord, EventSettings } from '@/lib/types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { TabHeader } from './shared'

const EVENT_TYPES = ['wedding', 'birthday', 'corporate', 'anniversary', 'party', 'other']

const TIMEZONES = [
  'Asia/Dubai',
  'Asia/Singapore',
  'Asia/Kolkata',
  'Europe/London',
  'Europe/Paris',
  'Europe/Istanbul',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'Australia/Sydney',
]

interface SettingsForm {
  name: string
  type: string
  eventDate: string
  startTime: string
  endTime: string
  timezone: string
  venue: string
  address: string
  description: string
  hostNames: string
  contactEmail: string
  contactPhone: string
  rsvpMode: EventSettings['rsvpMode']
  rsvpPassword: string
  indexable: boolean
  rsvpDeadline: string
  maxGuests: number
  allowPlusOne: boolean
  allowEdit: boolean
  notifyEveryRsvp: boolean
  dailySummary: boolean
  customDomain: string
}

function toForm(event: EventRecord): SettingsForm {
  const s = event.settings
  return {
    name: event.name,
    type: event.type,
    eventDate: event.eventDate,
    startTime: event.startTime,
    endTime: event.endTime,
    timezone: event.timezone,
    venue: event.venue,
    address: event.address,
    description: event.description,
    hostNames: event.hostNames,
    contactEmail: event.contactEmail,
    contactPhone: event.contactPhone,
    rsvpMode: s.rsvpMode,
    rsvpPassword: s.rsvpPassword,
    indexable: s.indexable,
    rsvpDeadline: s.rsvpDeadline,
    maxGuests: s.maxGuests,
    allowPlusOne: s.allowPlusOne,
    allowEdit: s.allowEdit,
    notifyEveryRsvp: s.notifyEveryRsvp,
    dailySummary: s.dailySummary,
    customDomain: s.customDomain,
  }
}

export default function SettingsTab() {
  const { currentEvent, setCurrentEvent, setEvents, setView } = useApp()
  const eventId = currentEvent?.id

  const [form, setForm] = React.useState<SettingsForm | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [domainBusy, setDomainBusy] = React.useState(false)
  const [domainInput, setDomainInput] = React.useState('')
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = React.useState('')

  // Sync local form with the stored event (id or updatedAt change)
  React.useEffect(() => {
    if (currentEvent) {
      setForm(toForm(currentEvent))
      setDomainInput(currentEvent.settings.customDomain)
    }
  }, [currentEvent?.id, currentEvent?.updatedAt])

  const set = <K extends keyof SettingsForm>(key: K, value: SettingsForm[K]) =>
    setForm((f) => (f ? { ...f, [key]: value } : f))

  const refreshEvents = React.useCallback(async () => {
    try {
      const res = await api<{ events: EventRecord[] }>('/api/events')
      setEvents(res.events)
      return res.events
    } catch {
      return []
    }
  }, [setEvents])

  const patchEvent = React.useCallback(
    async (body: Record<string, unknown>, message = 'Settings saved') => {
      if (!eventId) return null
      setSaving(true)
      try {
        const res = await api<{ event: EventRecord }>(`/api/events/${eventId}`, { method: 'PATCH', body })
        setCurrentEvent(res.event)
        toast.success(message)
        refreshEvents()
        return res.event
      } catch {
        toast.error('Could not save settings')
        return null
      } finally {
        setSaving(false)
      }
    },
    [eventId, setCurrentEvent, refreshEvents]
  )

  const settingsPatch = (overrides: Partial<EventSettings>) => ({
    settings: { ...(currentEvent?.settings ?? {}), ...overrides },
  })

  if (!eventId || !currentEvent) return null
  if (!form) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-[#9A7B5B]" />
      </div>
    )
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/${currentEvent.slug}`)
      toast.success('Public link copied')
    } catch {
      toast.error('Could not copy link')
    }
  }

  // ---------- Domain ----------
  const connectDomain = async () => {
    const domain = domainInput.trim().toLowerCase()
    if (!domain || !domain.includes('.')) {
      toast.error('Enter a valid domain, e.g. www.johnandemily.com')
      return
    }
    setDomainBusy(true)
    const updated = await patchEvent(
      settingsPatch({ customDomain: domain, domainStatus: 'pending' }),
      'Domain connected — verifying...'
    )
    if (updated) {
      setTimeout(async () => {
        try {
          const res = await api<{ event: EventRecord }>(`/api/events/${eventId}`, {
            method: 'PATCH',
            // `updated` carries the freshly saved settings (customDomain included)
            body: { settings: { ...updated.settings, domainStatus: 'verified' } },
          })
          setCurrentEvent(res.event)
          toast.success(`${domain} verified — SSL certificate issued`)
          refreshEvents()
        } catch {
          toast.error('Domain verification failed')
        } finally {
          setDomainBusy(false)
        }
      }, 1500)
    } else {
      setDomainBusy(false)
    }
  }

  const removeDomain = async () => {
    await patchEvent(settingsPatch({ customDomain: '', domainStatus: 'none' }), 'Domain removed')
    setDomainInput('')
  }

  // ---------- Danger zone ----------
  const publishAction = async (action: 'pause' | 'archive', message: string) => {
    try {
      const res = await api<{ event: EventRecord }>(`/api/events/${eventId}/publish`, {
        method: 'POST',
        body: { action },
      })
      setCurrentEvent(res.event)
      toast.success(message)
      refreshEvents()
    } catch {
      toast.error('Could not update the event')
    }
  }

  const deleteEvent = async () => {
    try {
      await api(`/api/events/${eventId}`, { method: 'DELETE' })
      toast.success('Event deleted')
      setDeleteOpen(false)
      const remaining = await refreshEvents()
      if (remaining.length > 0) {
        const full = await api<{ event: EventRecord }>(`/api/events/${remaining[0].id}`)
        setCurrentEvent(full.event)
        setView('app')
      } else {
        setCurrentEvent(null)
        setView('onboarding')
      }
    } catch {
      toast.error('Could not delete the event')
    }
  }

  const domainBadge = () => {
    const status = currentEvent.settings.domainStatus
    if (status === 'verified') {
      return (
        <Badge variant="outline" className="gap-1 border-transparent bg-[#7C8A6E1A] text-[#7C8A6E]">
          <CheckCircle2 className="size-3" aria-hidden="true" /> Verified
        </Badge>
      )
    }
    if (status === 'pending') {
      return (
        <Badge variant="outline" className="gap-1 border-transparent bg-[#C9A96A1A] text-[#9A7B5B]">
          <Clock className="size-3" aria-hidden="true" /> Pending
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="gap-1 border-transparent bg-secondary text-muted-foreground">
        <XCircle className="size-3" aria-hidden="true" /> Not connected
      </Badge>
    )
  }

  return (
    <div>
      <TabHeader title="Settings" description="Event details, privacy, RSVP rules and domain." />

      <Tabs defaultValue="general">
        <TabsList className="mb-5 flex w-full flex-wrap justify-start gap-1 overflow-x-auto bg-card p-1 scrollbar-thin sm:w-fit">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="rsvp">RSVP</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="domain">Domain</TabsTrigger>
          <TabsTrigger value="danger" className="text-destructive data-[state=active]:text-destructive">
            Danger
          </TabsTrigger>
        </TabsList>

        {/* ---------------- General ---------------- */}
        <TabsContent value="general" className="animate-float-in">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg">Event information</CardTitle>
              <CardDescription>The essentials guests see on your event page.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="s-name">Event name</Label>
                  <Input id="s-name" value={form.name} onChange={(e) => set('name', e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Event type</Label>
                  <Select value={form.type} onValueChange={(v) => set('type', v)}>
                    <SelectTrigger aria-label="Event type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EVENT_TYPES.map((t) => (
                        <SelectItem key={t} value={t} className="capitalize">
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Event URL</Label>
                <div className="flex items-center gap-2">
                  <Input value={`${currentEvent.slug}`} readOnly aria-label="Event URL slug" className="flex-1" />
                  <Button variant="outline" size="icon" onClick={copyLink} aria-label="Copy public event link">
                    <Copy className="size-4" aria-hidden="true" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(`/${currentEvent.slug}`, '_blank')}
                    aria-label="Open public event page in a new tab"
                  >
                    <ExternalLink className="size-4" aria-hidden="true" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Public address: {typeof window !== 'undefined' ? window.location.origin : ''}/{currentEvent.slug}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="grid gap-2">
                  <Label htmlFor="s-date">Event date</Label>
                  <Input id="s-date" type="date" value={form.eventDate} onChange={(e) => set('eventDate', e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="s-start">Start time</Label>
                  <Input id="s-start" type="time" value={form.startTime} onChange={(e) => set('startTime', e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="s-end">End time</Label>
                  <Input id="s-end" type="time" value={form.endTime} onChange={(e) => set('endTime', e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Timezone</Label>
                  <Select value={form.timezone} onValueChange={(v) => set('timezone', v)}>
                    <SelectTrigger aria-label="Timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {TIMEZONES.map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="s-venue">Venue</Label>
                  <Input id="s-venue" value={form.venue} onChange={(e) => set('venue', e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="s-address">Address</Label>
                  <Input id="s-address" value={form.address} onChange={(e) => set('address', e.target.value)} />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="s-desc">Description</Label>
                <Textarea id="s-desc" rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="s-hosts">Host names</Label>
                  <Input id="s-hosts" value={form.hostNames} onChange={(e) => set('hostNames', e.target.value)} placeholder="John & Emily" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="s-email">Contact email</Label>
                  <Input id="s-email" type="email" value={form.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="s-phone">Contact phone</Label>
                  <Input id="s-phone" value={form.contactPhone} onChange={(e) => set('contactPhone', e.target.value)} />
                </div>
              </div>

              <div className="flex justify-end border-t border-border pt-4">
                <Button
                  onClick={() =>
                    patchEvent({
                      name: form.name,
                      type: form.type,
                      eventDate: form.eventDate,
                      startTime: form.startTime,
                      endTime: form.endTime,
                      timezone: form.timezone,
                      venue: form.venue,
                      address: form.address,
                      description: form.description,
                      hostNames: form.hostNames,
                      contactEmail: form.contactEmail,
                      contactPhone: form.contactPhone,
                    })
                  }
                  disabled={saving}
                  className="bg-[#1F2937] text-white hover:bg-[#111827]"
                >
                  Save changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------- Privacy ---------------- */}
        <TabsContent value="privacy" className="animate-float-in">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-lg">
                <ShieldCheck className="size-5 text-[#9A7B5B]" aria-hidden="true" />
                Privacy
              </CardTitle>
              <CardDescription>Control who can open your event page and respond.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5">
              <div className="grid gap-2">
                <Label>Who can RSVP?</Label>
                <RadioGroup
                  value={form.rsvpMode}
                  onValueChange={(v) => set('rsvpMode', v as EventSettings['rsvpMode'])}
                  className="gap-2"
                >
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 has-[[data-state=checked]]:border-[#9A7B5B]">
                    <RadioGroupItem value="public" className="mt-0.5" />
                    <span>
                      <span className="block text-sm font-medium">Public — anyone with the link</span>
                      <span className="block text-xs text-muted-foreground">
                        Anyone who visits your event page can respond.
                      </span>
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 has-[[data-state=checked]]:border-[#9A7B5B]">
                    <RadioGroupItem value="password" className="mt-0.5" />
                    <span>
                      <span className="block text-sm font-medium">Password protected</span>
                      <span className="block text-xs text-muted-foreground">
                        Guests need a password you share with the invitation.
                      </span>
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 has-[[data-state=checked]]:border-[#9A7B5B]">
                    <RadioGroupItem value="guestlist" className="mt-0.5" />
                    <span>
                      <span className="block text-sm font-medium">Guest list only</span>
                      <span className="block text-xs text-muted-foreground">
                        Only guests on your list can respond via their personalized link.
                      </span>
                    </span>
                  </label>
                </RadioGroup>
              </div>

              {form.rsvpMode === 'password' ? (
                <div className="grid gap-2">
                  <Label htmlFor="s-password">RSVP password</Label>
                  <Input
                    id="s-password"
                    value={form.rsvpPassword}
                    onChange={(e) => set('rsvpPassword', e.target.value)}
                    placeholder="Choose a password guests must enter"
                  />
                </div>
              ) : null}

              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium">Search engine visibility</p>
                  <p className="text-xs text-muted-foreground">
                    Allow search engines to index your event page.
                  </p>
                </div>
                <Switch
                  checked={form.indexable}
                  onCheckedChange={(v) => set('indexable', v)}
                  aria-label="Search engine visibility"
                />
              </div>

              <div className="flex justify-end border-t border-border pt-4">
                <Button
                  onClick={() =>
                    patchEvent(
                      settingsPatch({
                        rsvpMode: form.rsvpMode,
                        rsvpPassword: form.rsvpPassword,
                        indexable: form.indexable,
                      })
                    )
                  }
                  disabled={saving}
                  className="bg-[#1F2937] text-white hover:bg-[#111827]"
                >
                  Save privacy
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------- RSVP ---------------- */}
        <TabsContent value="rsvp" className="animate-float-in">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-lg">
                <Timer className="size-5 text-[#9A7B5B]" aria-hidden="true" />
                RSVP rules
              </CardTitle>
              <CardDescription>Deadlines, plus-ones and editing behaviour.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="s-deadline">RSVP deadline</Label>
                  <Input
                    id="s-deadline"
                    type="date"
                    value={form.rsvpDeadline}
                    onChange={(e) => set('rsvpDeadline', e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="s-max">Maximum guests per response</Label>
                  <Input
                    id="s-max"
                    type="number"
                    min={1}
                    max={20}
                    value={form.maxGuests}
                    onChange={(e) => set('maxGuests', Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium">Allow plus-ones</p>
                  <p className="text-xs text-muted-foreground">Guests may bring an additional person.</p>
                </div>
                <Switch checked={form.allowPlusOne} onCheckedChange={(v) => set('allowPlusOne', v)} aria-label="Allow plus-ones" />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium">Allow editing responses</p>
                  <p className="text-xs text-muted-foreground">Guests can change their RSVP after submitting.</p>
                </div>
                <Switch checked={form.allowEdit} onCheckedChange={(v) => set('allowEdit', v)} aria-label="Allow editing responses" />
              </div>
              <div className="flex justify-end border-t border-border pt-4">
                <Button
                  onClick={() =>
                    patchEvent(
                      settingsPatch({
                        rsvpDeadline: form.rsvpDeadline,
                        maxGuests: Math.max(1, Number(form.maxGuests) || 1),
                        allowPlusOne: form.allowPlusOne,
                        allowEdit: form.allowEdit,
                      })
                    )
                  }
                  disabled={saving}
                  className="bg-[#1F2937] text-white hover:bg-[#111827]"
                >
                  Save RSVP rules
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------- Notifications ---------------- */}
        <TabsContent value="notifications" className="animate-float-in">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-lg">
                <Bell className="size-5 text-[#9A7B5B]" aria-hidden="true" />
                Notifications
              </CardTitle>
              <CardDescription>Choose how you want to hear about new responses.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5">
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium">Notify every RSVP</p>
                  <p className="text-xs text-muted-foreground">
                    Get an alert as soon as a guest responds.
                  </p>
                </div>
                <Switch
                  checked={form.notifyEveryRsvp}
                  onCheckedChange={(v) => set('notifyEveryRsvp', v)}
                  aria-label="Notify every RSVP"
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium">Daily summary</p>
                  <p className="text-xs text-muted-foreground">
                    One email each morning with all new responses and payments.
                  </p>
                </div>
                <Switch
                  checked={form.dailySummary}
                  onCheckedChange={(v) => set('dailySummary', v)}
                  aria-label="Daily summary email"
                />
              </div>
              <div className="flex justify-end border-t border-border pt-4">
                <Button
                  onClick={() =>
                    patchEvent(
                      settingsPatch({
                        notifyEveryRsvp: form.notifyEveryRsvp,
                        dailySummary: form.dailySummary,
                      })
                    )
                  }
                  disabled={saving}
                  className="bg-[#1F2937] text-white hover:bg-[#111827]"
                >
                  Save notifications
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------- Domain ---------------- */}
        <TabsContent value="domain" className="animate-float-in">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-heading text-lg">
                  <Globe className="size-5 text-[#9A7B5B]" aria-hidden="true" />
                  Custom domain
                </CardTitle>
                <CardDescription>
                  Use your own address, e.g. www.johnandemily.com, instead of onlinersvp.com/{currentEvent.slug}.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    placeholder="www.yourdomain.com"
                    aria-label="Custom domain"
                    className="w-full sm:w-80"
                    disabled={domainBusy}
                  />
                  <Button
                    onClick={connectDomain}
                    disabled={domainBusy}
                    className="gap-2 bg-[#9A7B5B] text-white hover:bg-[#8A6D4F]"
                  >
                    {domainBusy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
                    Connect Domain
                  </Button>
                  {currentEvent.settings.customDomain ? (
                    <Button variant="outline" onClick={removeDomain} disabled={domainBusy}>
                      Remove
                    </Button>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  {domainBadge()}
                  {currentEvent.settings.customDomain ? (
                    <span className="text-sm text-muted-foreground">{currentEvent.settings.customDomain}</span>
                  ) : null}
                </div>

                <div className="rounded-xl border border-border bg-[#F8F8F6] p-4">
                  <p className="mb-3 text-sm font-semibold">DNS instructions</p>
                  <p className="mb-3 text-xs text-muted-foreground">
                    Add this record at your domain provider, then connect above. SSL is issued automatically
                    once verified.
                  </p>
                  <div className="overflow-hidden rounded-lg border border-border bg-card">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                          <th className="px-3 py-2 font-medium">Type</th>
                          <th className="px-3 py-2 font-medium">Host</th>
                          <th className="px-3 py-2 font-medium">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-3 py-2.5 font-medium">CNAME</td>
                          <td className="px-3 py-2.5">www</td>
                          <td className="px-3 py-2.5 font-mono text-xs">cname.onlinersvp.com</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ---------------- Danger zone ---------------- */}
        <TabsContent value="danger" className="animate-float-in">
          <Card className="border-destructive/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-lg text-destructive">
                <AlertTriangle className="size-5" aria-hidden="true" />
                Danger zone
              </CardTitle>
              <CardDescription>Irreversible or disruptive actions — handle with care.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4">
                <div>
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <PauseCircle className="size-4 text-muted-foreground" aria-hidden="true" />
                    Pause event
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Temporarily hide the public page and stop new responses.
                  </p>
                </div>
                <Button
                  variant="outline"
                  disabled={currentEvent.status === 'paused'}
                  onClick={() => publishAction('pause', 'Event paused')}
                >
                  Pause
                </Button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4">
                <div>
                  <p className="text-sm font-medium">Archive event</p>
                  <p className="text-xs text-muted-foreground">Move the event out of your active dashboard.</p>
                </div>
                <Button variant="outline" onClick={() => publishAction('archive', 'Event archived')}>
                  Archive
                </Button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4">
                <div>
                  <p className="flex items-center gap-2 text-sm font-medium text-destructive">
                    <Trash2 className="size-4" aria-hidden="true" />
                    Delete event
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Permanently deletes the event, guests, RSVPs and payments.
                  </p>
                </div>
                <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
                  Delete event
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete confirm — typed */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{currentEvent.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the event and all guest data. Type the event name to confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder={currentEvent.name}
            aria-label="Type the event name to confirm deletion"
          />
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteConfirmText('')
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={deleteConfirmText.trim().toLowerCase() !== currentEvent.name.trim().toLowerCase()}
              onClick={(e) => {
                e.preventDefault()
                deleteEvent()
              }}
            >
              Delete forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

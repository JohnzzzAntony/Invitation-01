'use client'

// Task 6-b — InvitationsTab: email campaign manager (wireframe §28–29).
import * as React from 'react'
import {
  CalendarClock,
  Check,
  Clock,
  Eye,
  Mail,
  MailPlus,
  MousePointerClick,
  Send,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { useApp } from '@/lib/store'
import { api, EMAIL_VARIABLES, formatDate, renderEmailVars } from '@/lib/api'
import type { CampaignRecord, CampaignType, GuestRecord } from '@/lib/types'
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
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { EmptyState, TabHeader } from './shared'

const TYPE_LABEL: Record<CampaignType, string> = {
  save_the_date: 'Save the Date',
  invitation: 'Invitation',
  reminder: 'Reminder',
  confirmation: 'Confirmation',
  update: 'Update',
  thank_you: 'Thank you',
  custom: 'Custom',
}

interface CampaignForm {
  name: string
  type: CampaignType
  subject: string
  body: string
  delivery: 'now' | 'schedule' | 'draft'
  scheduledAt: string
}

const EMPTY_FORM: CampaignForm = {
  name: '',
  type: 'invitation',
  subject: '',
  body: '',
  delivery: 'draft',
  scheduledAt: '',
}

export default function InvitationsTab() {
  const { currentEvent } = useApp()
  const eventId = currentEvent?.id

  const [campaigns, setCampaigns] = React.useState<CampaignRecord[] | null>(null)
  const [guests, setGuests] = React.useState<GuestRecord[]>([])
  const [loading, setLoading] = React.useState(true)
  const [failed, setFailed] = React.useState(false)

  const [formOpen, setFormOpen] = React.useState(false)
  const [form, setForm] = React.useState<CampaignForm>(EMPTY_FORM)
  const [saving, setSaving] = React.useState(false)
  const [editing, setEditing] = React.useState<CampaignRecord | null>(null)

  const [sendTarget, setSendTarget] = React.useState<CampaignRecord | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<CampaignRecord | null>(null)
  const [scheduleTarget, setScheduleTarget] = React.useState<CampaignRecord | null>(null)
  const [scheduleValue, setScheduleValue] = React.useState('')
  const [preview, setPreview] = React.useState<CampaignRecord | null>(null)

  const bodyRef = React.useRef<HTMLTextAreaElement>(null)

  const refresh = React.useCallback(async () => {
    if (!eventId) return
    setLoading(true)
    setFailed(false)
    try {
      const [c, g] = await Promise.all([
        api<{ campaigns: CampaignRecord[] }>(`/api/events/${eventId}/campaigns`),
        api<{ guests: GuestRecord[] }>(`/api/events/${eventId}/guests`),
      ])
      setCampaigns(c.campaigns)
      setGuests(g.guests)
    } catch {
      setFailed(true)
    } finally {
      setLoading(false)
    }
  }, [eventId])

  React.useEffect(() => {
    refresh()
  }, [refresh])

  // ---------- Create / edit ----------
  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormOpen(true)
  }

  const openEdit = (c: CampaignRecord) => {
    setEditing(c)
    setForm({
      name: c.name,
      type: c.type as CampaignType,
      subject: c.subject,
      body: c.body,
      delivery: c.status === 'scheduled' ? 'schedule' : 'draft',
      scheduledAt: c.scheduledAt ? new Date(c.scheduledAt).toISOString().slice(0, 16) : '',
    })
    setFormOpen(true)
  }

  const insertVariable = (token: string) => {
    const el = bodyRef.current
    if (!el) {
      setForm((f) => ({ ...f, body: f.body + token }))
      return
    }
    const start = el.selectionStart ?? el.value.length
    const end = el.selectionEnd ?? start
    const next = el.value.slice(0, start) + token + el.value.slice(end)
    setForm((f) => ({ ...f, body: next }))
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start + token.length, start + token.length)
    })
  }

  const saveCampaign = async () => {
    if (!eventId) return
    if (!form.name.trim()) {
      toast.error('Campaign name is required')
      return
    }
    setSaving(true)
    try {
      if (editing) {
        await api(`/api/campaigns/${editing.id}`, {
          method: 'PATCH',
          body: {
            name: form.name.trim(),
            subject: form.subject,
            body: form.body,
            ...(form.delivery === 'schedule' && form.scheduledAt
              ? { action: 'schedule', scheduledAt: new Date(form.scheduledAt).toISOString() }
              : {}),
          },
        })
        toast.success('Campaign updated')
      } else {
        await api(`/api/events/${eventId}/campaigns`, {
          body: {
            name: form.name.trim(),
            type: form.type,
            subject: form.subject || form.name.trim(),
            body: form.body,
            send: form.delivery === 'now',
            scheduledAt:
              form.delivery === 'schedule' && form.scheduledAt ? new Date(form.scheduledAt).toISOString() : undefined,
          },
        })
        toast.success(
          form.delivery === 'now'
            ? 'Invitation sent to your guest list'
            : form.delivery === 'schedule'
              ? 'Campaign scheduled'
              : 'Draft saved'
        )
      }
      setFormOpen(false)
      await refresh()
    } catch {
      toast.error('Could not save the campaign')
    } finally {
      setSaving(false)
    }
  }

  // ---------- Actions ----------
  const sendNow = async () => {
    if (!sendTarget) return
    try {
      await api(`/api/campaigns/${sendTarget.id}`, { method: 'PATCH', body: { action: 'send' } })
      toast.success(`"${sendTarget.name}" sent to all guests`)
      await refresh()
    } catch {
      toast.error('Could not send the campaign')
    } finally {
      setSendTarget(null)
    }
  }

  const schedule = async () => {
    if (!scheduleTarget) return
    if (!scheduleValue) {
      toast.error('Pick a date and time first')
      return
    }
    try {
      await api(`/api/campaigns/${scheduleTarget.id}`, {
        method: 'PATCH',
        body: { action: 'schedule', scheduledAt: new Date(scheduleValue).toISOString() },
      })
      toast.success('Campaign scheduled')
      setScheduleTarget(null)
      setScheduleValue('')
      await refresh()
    } catch {
      toast.error('Could not schedule the campaign')
    }
  }

  const cancelSchedule = async (c: CampaignRecord) => {
    try {
      await api(`/api/campaigns/${c.id}`, { method: 'PATCH', body: { action: 'cancel' } })
      toast.success('Schedule cancelled')
      await refresh()
    } catch {
      toast.error('Could not cancel the schedule')
    }
  }

  const remove = async () => {
    if (!deleteTarget) return
    try {
      await api(`/api/campaigns/${deleteTarget.id}`, { method: 'DELETE' })
      setCampaigns((prev) => (prev ?? []).filter((c) => c.id !== deleteTarget.id))
      toast.success('Campaign deleted')
    } catch {
      toast.error('Could not delete the campaign')
    } finally {
      setDeleteTarget(null)
    }
  }

  // ---------- Preview substitution ----------
  const previewVars = React.useMemo(() => {
    const first = guests[0]
    const name = first?.name ?? 'Sarah Smith'
    const parts = name.split(' ')
    return {
      'guest.first_name': parts[0] ?? 'Sarah',
      'guest.last_name': parts.slice(1).join(' ') || 'Smith',
      'guest.name': name,
      'event.name': currentEvent?.name ?? 'Our Wedding',
      'event.date': formatDate(currentEvent?.eventDate || ''),
      'event.venue': currentEvent?.venue ?? 'The Venue',
      'event.rsvp_url': `${typeof window !== 'undefined' ? window.location.origin : ''}/${currentEvent?.slug ?? ''}`,
    }
  }, [guests, currentEvent])

  const statusBadge = (c: CampaignRecord) => {
    if (c.status === 'sent') {
      return (
        <Badge variant="outline" className="gap-1 border-transparent bg-[#7C8A6E1A] text-[#7C8A6E]">
          <Check className="size-3" aria-hidden="true" /> Sent
        </Badge>
      )
    }
    if (c.status === 'scheduled') {
      return (
        <Badge variant="outline" className="gap-1 border-transparent bg-[#C9A96A1A] text-[#9A7B5B]">
          <Clock className="size-3" aria-hidden="true" /> Scheduled
        </Badge>
      )
    }
    return <Badge variant="secondary" className="font-normal text-muted-foreground">Draft</Badge>
  }

  if (!eventId) return null

  return (
    <div>
      <TabHeader title="Invitations" description="Design, schedule and track your email campaigns.">
        <Button onClick={openCreate} className="gap-2 bg-[#1F2937] text-white hover:bg-[#111827]">
          <Plus className="size-4" aria-hidden="true" />
          Create Invitation
        </Button>
      </TabHeader>

      {failed ? (
        <EmptyState
          title="Could not load campaigns"
          description="Something went wrong while fetching your invitations."
          action={
            <Button variant="outline" onClick={refresh}>
              Try again
            </Button>
          }
        />
      ) : loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="space-y-3 p-5">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-64" />
                <div className="flex gap-6">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (campaigns ?? []).length === 0 ? (
        <EmptyState
          icon={Mail}
          title="No campaigns yet"
          description="Send save-the-dates, invitations and reminders — with open and click tracking built in."
          action={
            <Button onClick={openCreate} className="gap-2 bg-[#1F2937] text-white hover:bg-[#111827]">
              <MailPlus className="size-4" aria-hidden="true" />
              Create Invitation
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {(campaigns ?? []).map((c) => (
            <Card key={c.id}>
              <CardContent className="p-5">
                <div className="flex flex-wrap items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-heading text-lg font-semibold">{c.name}</h3>
                      <Badge variant="outline" className="font-normal text-muted-foreground">
                        {TYPE_LABEL[c.type as CampaignType] ?? c.type}
                      </Badge>
                      {statusBadge(c)}
                    </div>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      Subject: {c.subject || '—'}
                    </p>
                    {c.status === 'scheduled' && c.scheduledAt ? (
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-[#9A7B5B]">
                        <CalendarClock className="size-3.5" aria-hidden="true" />
                        Scheduled for {formatDate(c.scheduledAt)}
                      </p>
                    ) : null}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8" aria-label={`Actions for ${c.name}`}>
                        <MoreHorizontal className="size-4" aria-hidden="true" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => setPreview(c)}>
                        <Eye className="size-4" aria-hidden="true" /> Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer gap-2"
                        disabled={c.status === 'sent'}
                        onClick={() => setSendTarget(c)}
                      >
                        <Send className="size-4" aria-hidden="true" /> Send now
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer gap-2"
                        disabled={c.status === 'sent'}
                        onClick={() => {
                          setScheduleTarget(c)
                          setScheduleValue(c.scheduledAt ? new Date(c.scheduledAt).toISOString().slice(0, 16) : '')
                        }}
                      >
                        <CalendarClock className="size-4" aria-hidden="true" /> Schedule
                      </DropdownMenuItem>
                      {c.status === 'scheduled' ? (
                        <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => cancelSchedule(c)}>
                          <X className="size-4" aria-hidden="true" /> Cancel schedule
                        </DropdownMenuItem>
                      ) : null}
                      <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => openEdit(c)}>
                        <Pencil className="size-4" aria-hidden="true" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                        onClick={() => setDeleteTarget(c)}
                      >
                        <Trash2 className="size-4" aria-hidden="true" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Stats row */}
                <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4">
                  {[
                    { label: 'Sent', value: c.sentCount, icon: Send },
                    { label: 'Opened', value: c.openedCount, icon: Eye },
                    { label: 'Clicked', value: c.clickedCount, icon: MousePointerClick },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="flex items-center gap-2.5">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent">
                        <Icon className="size-3.5 text-[#9A7B5B]" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold leading-none">{value.toLocaleString()}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ---------- Create / edit dialog ---------- */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl scrollbar-thin">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit campaign' : 'Create invitation'}</DialogTitle>
            <DialogDescription>
              Personalize with variables — they are replaced with each guest&apos;s details when sent.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="c-name">Campaign name</Label>
                <Input
                  id="c-name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Official Invitation"
                />
              </div>
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v as CampaignType }))}>
                  <SelectTrigger aria-label="Campaign type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(TYPE_LABEL) as CampaignType[]).map((t) => (
                      <SelectItem key={t} value={t}>
                        {TYPE_LABEL[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="c-subject">Subject line</Label>
              <Input
                id="c-subject"
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                placeholder="You're invited to {{event.name}}"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="c-body">Message</Label>
              <Textarea
                id="c-body"
                ref={bodyRef}
                rows={7}
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                placeholder={'Dear {{guest.first_name}},\n\nWe would love to celebrate with you...'}
              />
              <div className="flex flex-wrap gap-1.5 pt-1" aria-label="Insert variable">
                {EMAIL_VARIABLES.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => insertVariable(v)}
                    className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-[#9A7B5B] transition-colors hover:bg-accent"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {!editing ? (
              <div className="grid gap-2">
                <Label>Delivery</Label>
                <RadioGroup
                  value={form.delivery}
                  onValueChange={(v) => setForm((f) => ({ ...f, delivery: v as CampaignForm['delivery'] }))}
                  className="gap-2"
                >
                  <label className="flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm has-[[data-state=checked]]:border-[#9A7B5B]">
                    <RadioGroupItem value="now" /> Send now
                  </label>
                  <label className="flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm has-[[data-state=checked]]:border-[#9A7B5B]">
                    <RadioGroupItem value="schedule" /> Schedule for later
                  </label>
                  <label className="flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm has-[[data-state=checked]]:border-[#9A7B5B]">
                    <RadioGroupItem value="draft" /> Save as draft
                  </label>
                </RadioGroup>
                {form.delivery === 'schedule' ? (
                  <Input
                    type="datetime-local"
                    value={form.scheduledAt}
                    onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
                    aria-label="Schedule date and time"
                    className="w-fit"
                  />
                ) : null}
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveCampaign} disabled={saving} className="bg-[#1F2937] text-white hover:bg-[#111827]">
              {saving ? 'Saving...' : editing ? 'Save changes' : 'Create campaign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------- Send now confirm ---------- */}
      <AlertDialog open={!!sendTarget} onOpenChange={(open) => !open && setSendTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send &ldquo;{sendTarget?.name}&rdquo; now?</AlertDialogTitle>
            <AlertDialogDescription>
              The email will be delivered to all {guests.length} guests on your list. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#1F2937] text-white hover:bg-[#111827]"
              onClick={(e) => {
                e.preventDefault()
                sendNow()
              }}
            >
              Send now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ---------- Schedule dialog ---------- */}
      <Dialog open={!!scheduleTarget} onOpenChange={(open) => !open && setScheduleTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Schedule campaign</DialogTitle>
            <DialogDescription>Choose when &ldquo;{scheduleTarget?.name}&rdquo; should go out.</DialogDescription>
          </DialogHeader>
          <Input
            type="datetime-local"
            value={scheduleValue}
            onChange={(e) => setScheduleValue(e.target.value)}
            aria-label="Schedule date and time"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleTarget(null)}>
              Cancel
            </Button>
            <Button onClick={schedule} className="bg-[#1F2937] text-white hover:bg-[#111827]">
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------- Delete confirm ---------- */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{deleteTarget?.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove the campaign and its stats.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault()
                remove()
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ---------- Email preview ---------- */}
      <Dialog open={!!preview} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Email preview</DialogTitle>
            <DialogDescription>
              How the email renders for {guests[0]?.name ?? 'a sample guest'} — variables substituted.
            </DialogDescription>
          </DialogHeader>
          {preview ? (
            <div className="overflow-hidden rounded-xl border border-border bg-white">
              {/* Email client chrome */}
              <div className="border-b border-border bg-[#F8F8F6] px-4 py-3">
                <p className="text-sm font-semibold">{renderEmailVars(preview.subject, previewVars)}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  From: {currentEvent?.hostNames || 'Host'} &lt;invitations@onlinersvp.com&gt;
                </p>
              </div>
              <div className="px-5 py-6">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-accent font-heading text-lg font-semibold text-[#9A7B5B]">
                    {(currentEvent?.name ?? 'E')[0]?.toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{currentEvent?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(currentEvent?.eventDate || '')} · {currentEvent?.venue}
                    </p>
                  </div>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {renderEmailVars(preview.body, previewVars)}
                </p>
                <div className="mt-6 flex justify-center">
                  <span className="rounded-full bg-[#9A7B5B] px-6 py-2.5 text-sm font-semibold text-white">
                    RSVP Now
                  </span>
                </div>
                <p className="mt-6 text-center text-[11px] text-muted-foreground">
                  You received this email because you were invited to {currentEvent?.name}.
                </p>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <p className={cn('mt-6 text-center text-xs text-muted-foreground')}>
        {campaigns?.length ?? 0} campaign{(campaigns?.length ?? 0) === 1 ? '' : 's'} · tracking opens and clicks automatically
      </p>
    </div>
  )
}

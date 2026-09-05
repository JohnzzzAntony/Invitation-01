'use client'

// Task 6-b — SubEventsTab: sub-event cards CRUD (wireframe §27).
import * as React from 'react'
import { CalendarDays, Clock, MapPin, Pencil, Plus, Shirt, Trash2, UserCheck } from 'lucide-react'
import { toast } from 'sonner'
import { useApp } from '@/lib/store'
import { api, formatDate, formatDateShort, formatTime } from '@/lib/api'
import type { GroupRecord, SubEventRecord } from '@/lib/types'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { EmptyState, GroupDot, TabHeader } from './shared'

interface SubEventForm {
  name: string
  date: string
  startTime: string
  endTime: string
  venue: string
  description: string
  dressCode: string
  rsvpRequired: boolean
  groupIds: string[]
}

const EMPTY_FORM: SubEventForm = {
  name: '',
  date: '',
  startTime: '',
  endTime: '',
  venue: '',
  description: '',
  dressCode: '',
  rsvpRequired: true,
  groupIds: [],
}

export default function SubEventsTab() {
  const { currentEvent } = useApp()
  const eventId = currentEvent?.id

  const [subEvents, setSubEvents] = React.useState<SubEventRecord[] | null>(null)
  const [groups, setGroups] = React.useState<GroupRecord[]>([])
  const [loading, setLoading] = React.useState(true)
  const [failed, setFailed] = React.useState(false)

  const [formOpen, setFormOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<SubEventRecord | null>(null)
  const [form, setForm] = React.useState<SubEventForm>(EMPTY_FORM)
  const [saving, setSaving] = React.useState(false)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)

  const refresh = React.useCallback(async () => {
    if (!eventId) return
    setLoading(true)
    setFailed(false)
    try {
      const [s, g] = await Promise.all([
        api<{ subEvents: SubEventRecord[] }>(`/api/events/${eventId}/sub-events`),
        api<{ groups: GroupRecord[] }>(`/api/events/${eventId}/groups`),
      ])
      setSubEvents(s.subEvents)
      setGroups(g.groups)
    } catch {
      setFailed(true)
    } finally {
      setLoading(false)
    }
  }, [eventId])

  React.useEffect(() => {
    refresh()
  }, [refresh])

  const groupById = React.useMemo(() => new Map(groups.map((g) => [g.id, g])), [groups])

  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormOpen(true)
  }

  const openEdit = (se: SubEventRecord) => {
    setEditing(se)
    setForm({
      name: se.name,
      date: se.date,
      startTime: se.startTime,
      endTime: se.endTime ?? '',
      venue: se.venue ?? '',
      description: se.description ?? '',
      dressCode: se.dressCode ?? '',
      rsvpRequired: se.rsvpRequired,
      groupIds: [...se.groupIds],
    })
    setFormOpen(true)
  }

  const save = async () => {
    if (!eventId) return
    if (!form.name.trim()) {
      toast.error('Sub-event name is required')
      return
    }
    setSaving(true)
    try {
      const body = {
        name: form.name.trim(),
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime || null,
        venue: form.venue || null,
        description: form.description || null,
        dressCode: form.dressCode || null,
        rsvpRequired: form.rsvpRequired,
        groupIds: form.groupIds,
      }
      if (editing) {
        await api(`/api/sub-events/${editing.id}`, { method: 'PATCH', body })
        toast.success('Sub-event updated')
      } else {
        await api(`/api/events/${eventId}/sub-events`, { body })
        toast.success('Sub-event created')
      }
      setFormOpen(false)
      await refresh()
    } catch {
      toast.error('Could not save the sub-event')
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!deleteId) return
    try {
      await api(`/api/sub-events/${deleteId}`, { method: 'DELETE' })
      setSubEvents((prev) => (prev ?? []).filter((s) => s.id !== deleteId))
      toast.success('Sub-event deleted')
    } catch {
      toast.error('Could not delete the sub-event')
    } finally {
      setDeleteId(null)
    }
  }

  const toggleGroup = (id: string) => {
    setForm((f) => ({
      ...f,
      groupIds: f.groupIds.includes(id) ? f.groupIds.filter((g) => g !== id) : [...f.groupIds, id],
    }))
  }

  if (!eventId) return null

  return (
    <div>
      <TabHeader title="Sub-Events" description="Ceremonies, dinners, brunches — every part of your celebration.">
        <Button onClick={openAdd} className="gap-2 bg-[#1F2937] text-white hover:bg-[#111827]">
          <Plus className="size-4" aria-hidden="true" />
          Add Event
        </Button>
      </TabHeader>

      {failed ? (
        <EmptyState
          title="Could not load sub-events"
          description="Something went wrong while fetching your sub-events."
          action={
            <Button variant="outline" onClick={refresh}>
              Try again
            </Button>
          }
        />
      ) : loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="space-y-3 p-5">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (subEvents ?? []).length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No sub-events yet"
          description="Break your celebration into parts — ceremony, reception, brunch — and control which groups are invited to each."
          action={
            <Button onClick={openAdd} className="gap-2 bg-[#1F2937] text-white hover:bg-[#111827]">
              <Plus className="size-4" aria-hidden="true" />
              Add Event
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {(subEvents ?? []).map((se) => (
            <Card key={se.id} className="flex flex-col">
              <CardContent className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-heading text-lg font-semibold leading-tight">{se.name}</h3>
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(se)} aria-label={`Edit ${se.name}`}>
                      <Pencil className="size-4" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(se.id)}
                      aria-label={`Delete ${se.name}`}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <CalendarDays className="size-4 shrink-0 text-[#9A7B5B]" aria-hidden="true" />
                    {se.date ? formatDateShort(se.date) : 'Date to be announced'}
                  </p>
                  {se.startTime ? (
                    <p className="flex items-center gap-2">
                      <Clock className="size-4 shrink-0 text-[#9A7B5B]" aria-hidden="true" />
                      {formatTime(se.startTime)}
                      {se.endTime ? ` – ${formatTime(se.endTime)}` : ''}
                    </p>
                  ) : null}
                  {se.venue ? (
                    <p className="flex items-center gap-2">
                      <MapPin className="size-4 shrink-0 text-[#9A7B5B]" aria-hidden="true" />
                      <span className="truncate">{se.venue}</span>
                    </p>
                  ) : null}
                </div>

                {se.description ? (
                  <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{se.description}</p>
                ) : null}

                <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-1">
                  {se.dressCode ? (
                    <Badge variant="outline" className="gap-1 border-transparent bg-accent font-normal text-[#9A7B5B]">
                      <Shirt className="size-3" aria-hidden="true" />
                      {se.dressCode}
                    </Badge>
                  ) : null}
                  <Badge
                    variant="outline"
                    className={cn(
                      'gap-1 border-transparent font-normal',
                      se.rsvpRequired ? 'bg-[#7C8A6E1A] text-[#7C8A6E]' : 'bg-secondary text-muted-foreground'
                    )}
                  >
                    <UserCheck className="size-3" aria-hidden="true" />
                    {se.rsvpRequired ? 'RSVP required' : 'Open to all'}
                  </Badge>
                </div>

                {se.groupIds.length > 0 ? (
                  <div className="flex items-center gap-2 border-t border-border pt-3">
                    <span className="text-xs text-muted-foreground">Invited groups:</span>
                    <span className="flex items-center gap-1">
                      {se.groupIds.map((id) => {
                        const g = groupById.get(id)
                        if (!g) return null
                        return (
                          <span key={id} title={g.name} className="inline-flex items-center">
                            <GroupDot color={g.color} />
                          </span>
                        )
                      })}
                      {se.groupIds.some((id) => !groupById.has(id)) ? (
                        <span className="text-xs text-muted-foreground">other groups</span>
                      ) : null}
                    </span>
                  </div>
                ) : (
                  <p className="border-t border-border pt-3 text-xs text-muted-foreground">All groups invited</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add / edit dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg scrollbar-thin">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit sub-event' : 'Add sub-event'}</DialogTitle>
            <DialogDescription>Each part of your celebration can have its own details and guest groups.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="se-name">Name</Label>
              <Input
                id="se-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Wedding Ceremony"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="se-date">Date</Label>
                <Input
                  id="se-date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="se-start">Start time</Label>
                <Input
                  id="se-start"
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="se-end">End time</Label>
                <Input
                  id="se-end"
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="se-venue">Venue</Label>
                <Input
                  id="se-venue"
                  value={form.venue}
                  onChange={(e) => setForm((f) => ({ ...f, venue: e.target.value }))}
                  placeholder="Rose Garden Hall"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="se-dress">Dress code</Label>
                <Input
                  id="se-dress"
                  value={form.dressCode}
                  onChange={(e) => setForm((f) => ({ ...f, dressCode: e.target.value }))}
                  placeholder="Formal / Black tie / Casual"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="se-desc">Description</Label>
              <Textarea
                id="se-desc"
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Tell guests what to expect..."
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium">RSVP required</p>
                <p className="text-xs text-muted-foreground">Guests choose to attend this part separately.</p>
              </div>
              <Switch
                checked={form.rsvpRequired}
                onCheckedChange={(v) => setForm((f) => ({ ...f, rsvpRequired: v }))}
                aria-label="RSVP required for this sub-event"
              />
            </div>
            <div className="grid gap-2">
              <Label>Groups allowed</Label>
              {groups.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No groups yet — leave empty to invite everyone, or create groups in the Guests tab.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {groups.map((g) => {
                    const active = form.groupIds.includes(g.id)
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => toggleGroup(g.id)}
                        aria-pressed={active}
                        aria-label={`Toggle group ${g.name}`}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                          active
                            ? 'border-transparent bg-accent text-foreground'
                            : 'border-border bg-card text-muted-foreground hover:bg-accent/60'
                        )}
                      >
                        <GroupDot color={g.color} />
                        {g.name}
                      </button>
                    )
                  })}
                </div>
              )}
              {form.groupIds.length === 0 && groups.length > 0 ? (
                <p className="text-xs text-muted-foreground">No groups selected — all groups will be invited.</p>
              ) : null}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving} className="bg-[#1F2937] text-white hover:bg-[#111827]">
              {saving ? 'Saving...' : editing ? 'Save changes' : 'Create sub-event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this sub-event?</AlertDialogTitle>
            <AlertDialogDescription>
              Guests will no longer see or RSVP to this part of your celebration.
            </AlertDialogDescription>
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

      <p className="mt-6 text-center text-xs text-muted-foreground">
        {subEvents?.length ?? 0} sub-event{(subEvents?.length ?? 0) === 1 ? '' : 's'} · {formatDate(currentEvent?.eventDate || '')}
      </p>
    </div>
  )
}

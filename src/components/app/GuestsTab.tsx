'use client'

// Task 6-b — GuestsTab: guest CRM (wireframe §21–23).
// Table + filters, bulk actions, import/export CSV, groups manager,
// guest profile sheet, personalized link + QR code.
import * as React from 'react'
import {
  Check,
  Copy,
  Download,
  EllipsisVertical,
  Eye,
  Mail,
  MailOpen,
  Pencil,
  Plus,
  QrCode,
  Trash2,
  Upload,
  UserPlus,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import { useApp } from '@/lib/store'
import { api, downloadCsv, parseCsv } from '@/lib/api'
import type { GuestRecord, GroupRecord, GuestStatus } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Card } from '@/components/ui/card'
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import {
  EmptyState,
  GroupDot,
  ListSkeleton,
  STATUS_COLOR,
  StatusBadge,
  TabHeader,
  timeAgo,
} from './shared'

const STATUSES: GuestStatus[] = ['attending', 'pending', 'declined']

interface GuestForm {
  name: string
  email: string
  groupId: string
  maxParty: number
  meal: string
  dietary: string
  notes: string
}

const EMPTY_FORM: GuestForm = {
  name: '',
  email: '',
  groupId: 'none',
  maxParty: 2,
  meal: '',
  dietary: '',
  notes: '',
}

export default function GuestsTab() {
  const { currentEvent } = useApp()
  const eventId = currentEvent?.id

  const [guests, setGuests] = React.useState<GuestRecord[] | null>(null)
  const [groups, setGroups] = React.useState<GroupRecord[]>([])
  const [loading, setLoading] = React.useState(true)
  const [failed, setFailed] = React.useState(false)

  // Filters
  const [search, setSearch] = React.useState('')
  const [groupFilter, setGroupFilter] = React.useState('all')
  const [statusFilter, setStatusFilter] = React.useState('all')

  // Selection
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [bulkGroup, setBulkGroup] = React.useState('')
  const [bulkBusy, setBulkBusy] = React.useState(false)
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false)

  // Dialogs
  const [formOpen, setFormOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<GuestRecord | null>(null)
  const [form, setForm] = React.useState<GuestForm>(EMPTY_FORM)
  const [saving, setSaving] = React.useState(false)
  const [profileGuest, setProfileGuest] = React.useState<GuestRecord | null>(null)
  const [deleteGuestId, setDeleteGuestId] = React.useState<string | null>(null)
  const [qrGuest, setQrGuest] = React.useState<GuestRecord | null>(null)
  const [qrUrl, setQrUrl] = React.useState<string | null>(null)
  const [qrLoading, setQrLoading] = React.useState(false)

  // Groups manager
  const [groupsOpen, setGroupsOpen] = React.useState(false)
  const [newGroupName, setNewGroupName] = React.useState('')
  const [newGroupColor, setNewGroupColor] = React.useState('#9A7B5B')
  const [editGroup, setEditGroup] = React.useState<GroupRecord | null>(null)
  const [editGroupForm, setEditGroupForm] = React.useState({ name: '', color: '#9A7B5B', description: '' })
  const [deleteGroupId, setDeleteGroupId] = React.useState<string | null>(null)

  const importInputRef = React.useRef<HTMLInputElement>(null)

  // ---------- Data ----------
  const refresh = React.useCallback(async () => {
    if (!eventId) return
    setLoading(true)
    setFailed(false)
    try {
      const [g, gr] = await Promise.all([
        api<{ guests: GuestRecord[] }>(`/api/events/${eventId}/guests`),
        api<{ groups: GroupRecord[] }>(`/api/events/${eventId}/groups`),
      ])
      setGuests(g.guests)
      setGroups(gr.groups)
    } catch {
      setFailed(true)
    } finally {
      setLoading(false)
    }
  }, [eventId])

  React.useEffect(() => {
    setSelected(new Set())
    refresh()
  }, [refresh])

  const patchGuest = React.useCallback(
    async (id: string, body: Record<string, unknown>) => {
      const res = await api<{ guest: GuestRecord }>(`/api/guests/${id}`, { method: 'PATCH', body })
      setGuests((prev) => (prev ?? []).map((g) => (g.id === id ? res.guest : g)))
      setProfileGuest((p) => (p && p.id === id ? res.guest : p))
      return res.guest
    },
    []
  )

  // ---------- Derived ----------
  const filtered = React.useMemo(() => {
    let list = guests ?? []
    const q = search.trim().toLowerCase()
    if (q) list = list.filter((g) => g.name.toLowerCase().includes(q) || g.email.toLowerCase().includes(q))
    if (groupFilter !== 'all') list = list.filter((g) => g.groupId === groupFilter)
    if (statusFilter !== 'all') list = list.filter((g) => g.status === statusFilter)
    return list
  }, [guests, search, groupFilter, statusFilter])

  const groupById = React.useMemo(() => {
    const map = new Map<string, GroupRecord>()
    groups.forEach((g) => map.set(g.id, g))
    return map
  }, [groups])

  const allSelected = filtered.length > 0 && filtered.every((g) => selected.has(g.id))
  const someSelected = filtered.some((g) => selected.has(g.id))

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (allSelected) filtered.forEach((g) => next.delete(g.id))
      else filtered.forEach((g) => next.add(g.id))
      return next
    })
  }

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // ---------- Guest CRUD ----------
  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormOpen(true)
  }

  const openEdit = (guest: GuestRecord) => {
    setEditing(guest)
    setForm({
      name: guest.name,
      email: guest.email,
      groupId: guest.groupId ?? 'none',
      maxParty: guest.maxParty,
      meal: guest.meal ?? '',
      dietary: guest.dietary ?? '',
      notes: guest.notes ?? '',
    })
    setFormOpen(true)
  }

  const saveGuest = async () => {
    if (!eventId) return
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Name and email are required')
      return
    }
    setSaving(true)
    try {
      if (editing) {
        await patchGuest(editing.id, {
          name: form.name.trim(),
          email: form.email.trim(),
          groupId: form.groupId === 'none' ? null : form.groupId,
          maxParty: Math.min(10, Math.max(1, Number(form.maxParty) || 1)),
          meal: form.meal,
          dietary: form.dietary,
          notes: form.notes,
        })
        toast.success('Guest updated')
      } else {
        await api<{ guest: GuestRecord }>(`/api/events/${eventId}/guests`, {
          body: {
            name: form.name.trim(),
            email: form.email.trim(),
            groupId: form.groupId === 'none' ? null : form.groupId,
            maxParty: Math.min(10, Math.max(1, Number(form.maxParty) || 1)),
            notes: form.notes || undefined,
          },
        })
        toast.success('Guest added')
      }
      setFormOpen(false)
      await refresh()
    } catch {
      toast.error('Could not save guest')
    } finally {
      setSaving(false)
    }
  }

  const removeGuest = async () => {
    if (!deleteGuestId) return
    try {
      await api(`/api/guests/${deleteGuestId}`, { method: 'DELETE' })
      setGuests((prev) => (prev ?? []).filter((g) => g.id !== deleteGuestId))
      setSelected((prev) => {
        const next = new Set(prev)
        next.delete(deleteGuestId)
        return next
      })
      toast.success('Guest removed')
    } catch {
      toast.error('Could not remove guest')
    } finally {
      setDeleteGuestId(null)
    }
  }

  // ---------- Link + QR ----------
  const copyLink = async (guest: GuestRecord) => {
    const url = `${window.location.origin}/${currentEvent?.slug}?token=${guest.token}`
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Personalized link copied', {
        description: 'This link opens the guest\u2019s personalized RSVP view.',
      })
    } catch {
      toast.error('Could not copy link')
    }
  }

  const openQr = async (guest: GuestRecord) => {
    setQrGuest(guest)
    setQrUrl(null)
    setQrLoading(true)
    try {
      const { qrDataUrl } = await import('@/lib/qr')
      const url = await qrDataUrl(`${window.location.origin}/${currentEvent?.slug}?token=${guest.token}`)
      setQrUrl(url)
    } catch {
      setQrUrl(null)
    } finally {
      setQrLoading(false)
    }
  }

  // ---------- Bulk ----------
  const bulkAssignGroup = async () => {
    if (!bulkGroup || selected.size === 0) return
    setBulkBusy(true)
    try {
      await Promise.all(
        Array.from(selected).map((id) =>
          api(`/api/guests/${id}`, { method: 'PATCH', body: { groupId: bulkGroup === 'none' ? null : bulkGroup } })
        )
      )
      toast.success(`Group assigned to ${selected.size} guest${selected.size === 1 ? '' : 's'}`)
      setSelected(new Set())
      setBulkGroup('')
      await refresh()
    } catch {
      toast.error('Could not assign group')
    } finally {
      setBulkBusy(false)
    }
  }

  const bulkInvite = async () => {
    setBulkBusy(true)
    try {
      await Promise.all(
        Array.from(selected).map((id) =>
          api(`/api/guests/${id}`, { method: 'PATCH', body: { invited: true, invitedAt: new Date().toISOString() } })
        )
      )
      toast.success(`Invitation sent to ${selected.size} guest${selected.size === 1 ? '' : 's'}`)
      setSelected(new Set())
      await refresh()
    } catch {
      toast.error('Could not send invitations')
    } finally {
      setBulkBusy(false)
    }
  }

  const bulkDelete = async () => {
    setBulkBusy(true)
    try {
      await Promise.all(Array.from(selected).map((id) => api(`/api/guests/${id}`, { method: 'DELETE' })))
      toast.success(`${selected.size} guest${selected.size === 1 ? '' : 's'} removed`)
      setSelected(new Set())
      setBulkDeleteOpen(false)
      await refresh()
    } catch {
      toast.error('Could not remove guests')
    } finally {
      setBulkBusy(false)
    }
  }

  // ---------- Import / Export ----------
  const onImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !eventId) return
    try {
      const text = await file.text()
      const rows = parseCsv(text).filter((r) => r.some((c) => c.trim() !== ''))
      if (rows.length === 0) {
        toast.error('The file appears to be empty')
        return
      }
      // Detect header row (case-insensitive name/email/group columns)
      let headerIdx = -1
      let nameCol = 0
      let emailCol = 1
      let groupCol = -1
      for (let i = 0; i < Math.min(rows.length, 5); i++) {
        const lower = rows[i].map((c) => c.trim().toLowerCase())
        const n = lower.findIndex((c) => c === 'name' || c === 'guest name' || c === 'full name')
        const em = lower.findIndex((c) => c === 'email' || c === 'e-mail' || c === 'email address')
        if (n !== -1 && em !== -1) {
          headerIdx = i
          nameCol = n
          emailCol = em
          const gr = lower.findIndex((c) => c === 'group' || c === 'group name')
          groupCol = gr
          break
        }
      }
      const dataRows = headerIdx >= 0 ? rows.slice(headerIdx + 1) : rows
      const payload = dataRows
        .map((r) => ({
          name: (r[nameCol] ?? '').trim(),
          email: (r[emailCol] ?? '').trim(),
          group: groupCol >= 0 ? (r[groupCol] ?? '').trim() : '',
        }))
        .filter((r) => r.name && r.email)
      if (payload.length === 0) {
        toast.error('No valid rows found — expected name and email columns')
        return
      }
      const res = await api<{ guests: GuestRecord[] }>(`/api/events/${eventId}/guests`, {
        body: { guests: payload },
      })
      toast.success(`Imported ${res.guests.length} guest${res.guests.length === 1 ? '' : 's'}`)
      await refresh()
    } catch {
      toast.error('Import failed — please check the CSV format')
    }
  }

  const exportCsv = () => {
    const header = [
      'Name', 'Email', 'Group', 'RSVP Status', 'Party Size', 'Max Party',
      'Meal', 'Dietary', 'Notes', 'Invited', 'Responded At',
    ]
    const rows = (guests ?? []).map((g) => [
      g.name,
      g.email,
      g.groupName ?? '',
      g.status,
      g.partySize,
      g.maxParty,
      g.meal ?? '',
      g.dietary ?? '',
      g.notes ?? '',
      g.invited ? 'yes' : 'no',
      g.respondedAt ?? '',
    ])
    downloadCsv('guests.csv', [header, ...rows])
    toast.success('Guest list exported')
  }

  // ---------- Groups ----------
  const createGroup = async () => {
    if (!eventId) return
    if (!newGroupName.trim()) {
      toast.error('Group name is required')
      return
    }
    try {
      await api<{ group: GroupRecord }>(`/api/events/${eventId}/groups`, {
        body: { name: newGroupName.trim(), color: newGroupColor },
      })
      setNewGroupName('')
      setNewGroupColor('#9A7B5B')
      await refresh()
      toast.success('Group created')
    } catch {
      toast.error('Could not create group')
    }
  }

  const saveGroupEdit = async () => {
    if (!editGroup) return
    try {
      await api(`/api/groups/${editGroup.id}`, {
        method: 'PATCH',
        body: { name: editGroupForm.name.trim(), color: editGroupForm.color, description: editGroupForm.description },
      })
      setEditGroup(null)
      await refresh()
      toast.success('Group updated')
    } catch {
      toast.error('Could not update group')
    }
  }

  const removeGroup = async () => {
    if (!deleteGroupId) return
    try {
      await api(`/api/groups/${deleteGroupId}`, { method: 'DELETE' })
      toast.success('Group deleted')
      await refresh()
    } catch {
      toast.error('Could not delete group')
    } finally {
      setDeleteGroupId(null)
    }
  }

  // ---------- Render ----------
  if (!eventId) return null

  return (
    <div>
      <TabHeader title="Guests" description={`${guests?.length ?? 0} guests on your list`}>
        <Button onClick={openAdd} className="gap-2 bg-[#1F2937] text-white hover:bg-[#111827]">
          <UserPlus className="size-4" aria-hidden="true" />
          Add Guest
        </Button>
      </TabHeader>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search guests by name or email..."
          aria-label="Search guests"
          className="w-full sm:w-64"
        />
        <Select value={groupFilter} onValueChange={setGroupFilter}>
          <SelectTrigger className="w-[150px]" aria-label="Filter by group">
            <SelectValue placeholder="All groups" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All groups</SelectItem>
            {groups.map((g) => (
              <SelectItem key={g.id} value={g.id}>
                {g.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]" aria-label="Filter by RSVP status">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="attending">Attending</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <input
            ref={importInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            aria-label="Import guests CSV file"
            onChange={onImportFile}
          />
          <Button variant="outline" className="gap-2" onClick={() => importInputRef.current?.click()}>
            <Upload className="size-4" aria-hidden="true" />
            Import CSV
          </Button>
          <Button variant="outline" className="gap-2" onClick={exportCsv}>
            <Download className="size-4" aria-hidden="true" />
            Export CSV
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => setGroupsOpen(true)}>
            <Users className="size-4" aria-hidden="true" />
            Manage Groups
          </Button>
        </div>
      </div>

      {failed ? (
        <EmptyState
          title="Could not load guests"
          description="Something went wrong while fetching your guest list."
          action={
            <Button variant="outline" onClick={refresh}>
              Try again
            </Button>
          }
        />
      ) : loading ? (
        <Card className="p-6">
          <ListSkeleton rows={6} />
        </Card>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={guests?.length ? 'No guests match your filters' : 'No guests yet'}
          description={
            guests?.length
              ? 'Try adjusting the search or filters.'
              : 'Add guests manually or import a CSV file to start inviting.'
          }
          action={
            guests?.length ? undefined : (
              <Button onClick={openAdd} className="gap-2 bg-[#1F2937] text-white hover:bg-[#111827]">
                <Plus className="size-4" aria-hidden="true" />
                Add Guest
              </Button>
            )
          }
        />
      ) : (
        <div className="rounded-xl border border-border bg-card">
          <div className="max-h-[420px] overflow-y-auto scrollbar-thin">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-card">
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                      onCheckedChange={toggleAll}
                      aria-label="Select all guests"
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Group</TableHead>
                  <TableHead>RSVP</TableHead>
                  <TableHead className="text-center">Guests</TableHead>
                  <TableHead className="hidden sm:table-cell">Invited</TableHead>
                  <TableHead className="hidden lg:table-cell">Responded</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((g) => {
                  const group = g.groupId ? groupById.get(g.groupId) : undefined
                  return (
                    <TableRow key={g.id} data-state={selected.has(g.id) ? 'selected' : undefined}>
                      <TableCell>
                        <Checkbox
                          checked={selected.has(g.id)}
                          onCheckedChange={() => toggleOne(g.id)}
                          aria-label={`Select ${g.name}`}
                        />
                      </TableCell>
                      <TableCell>
                        <button
                          type="button"
                          className="text-left"
                          onClick={() => setProfileGuest(g)}
                          aria-label={`View profile of ${g.name}`}
                        >
                          <p className="text-sm font-medium text-foreground hover:underline">{g.name}</p>
                          <p className="text-xs text-muted-foreground">{g.email}</p>
                        </button>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {group ? (
                          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                            <GroupDot color={group.color} />
                            {group.name}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground/60">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={g.status} />
                      </TableCell>
                      <TableCell className="text-center text-sm">{g.partySize}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {g.invited ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-[#7C8A6E]">
                            <Check className="size-3.5" aria-hidden="true" /> Sent
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="size-3.5" aria-hidden="true" /> Not sent
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                        {timeAgo(g.respondedAt)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8" aria-label={`Actions for ${g.name}`}>
                              <EllipsisVertical className="size-4" aria-hidden="true" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => setProfileGuest(g)}>
                              <Eye className="size-4" aria-hidden="true" /> View profile
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => openEdit(g)}>
                              <Pencil className="size-4" aria-hidden="true" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => copyLink(g)}>
                              <Copy className="size-4" aria-hidden="true" /> Copy RSVP link
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => openQr(g)}>
                              <QrCode className="size-4" aria-hidden="true" /> Show QR code
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="text-xs text-muted-foreground">
                              Quick status
                            </DropdownMenuLabel>
                            {STATUSES.map((s) => (
                              <DropdownMenuItem
                                key={s}
                                className="cursor-pointer gap-2"
                                disabled={g.status === s}
                                onClick={() => patchGuest(g.id, { status: s }).catch(() => toast.error('Could not update status'))}
                              >
                                <span className="size-2 rounded-full" style={{ backgroundColor: STATUS_COLOR[s] }} aria-hidden="true" />
                                Mark {s === 'attending' ? 'attending' : s}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                              onClick={() => setDeleteGuestId(g.id)}
                            >
                              <Trash2 className="size-4" aria-hidden="true" /> Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
          <div className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
            Showing {filtered.length} of {guests?.length ?? 0} guests
          </div>
        </div>
      )}

      {/* Bulk action bar */}
      {selected.size > 0 ? (
        <div className="fixed inset-x-0 bottom-16 z-40 mx-auto flex w-[calc(100%-2rem)] max-w-3xl flex-wrap items-center gap-2 rounded-xl border border-border bg-white p-3 shadow-lg md:bottom-6 md:px-4">
          <span className="text-sm font-semibold">{selected.size} selected</span>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Select value={bulkGroup} onValueChange={setBulkGroup}>
              <SelectTrigger className="h-9 w-[170px]" aria-label="Assign group to selected guests">
                <SelectValue placeholder="Assign group..." />
              </SelectTrigger>
              <SelectContent>
                {groups.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.name}
                  </SelectItem>
                ))}
                <SelectItem value="none">No group</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" disabled={!bulkGroup || bulkBusy} onClick={bulkAssignGroup}>
              Apply
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              disabled={bulkBusy}
              onClick={bulkInvite}
            >
              <MailOpen className="size-4" aria-hidden="true" />
              Send invitation
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-destructive hover:text-destructive"
              disabled={bulkBusy}
              onClick={() => setBulkDeleteOpen(true)}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Delete
            </Button>
          </div>
        </div>
      ) : null}

      {/* Add / Edit guest dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit guest' : 'Add guest'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Update this guest\u2019s details.' : 'Add someone to your guest list.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="guest-name">Name</Label>
              <Input
                id="guest-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Sarah Smith"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="guest-email">Email</Label>
              <Input
                id="guest-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="sarah@email.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Group</Label>
                <Select value={form.groupId} onValueChange={(v) => setForm((f) => ({ ...f, groupId: v }))}>
                  <SelectTrigger aria-label="Guest group">
                    <SelectValue placeholder="No group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No group</SelectItem>
                    {groups.map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="guest-max-party">Max party size</Label>
                <Input
                  id="guest-max-party"
                  type="number"
                  min={1}
                  max={10}
                  value={form.maxParty}
                  onChange={(e) => setForm((f) => ({ ...f, maxParty: Number(e.target.value) }))}
                />
              </div>
            </div>
            {editing ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="guest-meal">Meal</Label>
                  <Input
                    id="guest-meal"
                    value={form.meal}
                    onChange={(e) => setForm((f) => ({ ...f, meal: e.target.value }))}
                    placeholder="Chicken"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="guest-dietary">Dietary</Label>
                  <Input
                    id="guest-dietary"
                    value={form.dietary}
                    onChange={(e) => setForm((f) => ({ ...f, dietary: e.target.value }))}
                    placeholder="Vegetarian"
                  />
                </div>
              </div>
            ) : null}
            <div className="grid gap-2">
              <Label htmlFor="guest-notes">Notes</Label>
              <Textarea
                id="guest-notes"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Anything worth remembering about this guest..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveGuest} disabled={saving} className="bg-[#1F2937] text-white hover:bg-[#111827]">
              {saving ? 'Saving...' : editing ? 'Save changes' : 'Add guest'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Guest profile sheet */}
      <Sheet open={!!profileGuest} onOpenChange={(open) => !open && setProfileGuest(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md scrollbar-thin">
          {profileGuest ? (
            <>
              <SheetHeader className="pb-0">
                <SheetTitle className="font-heading text-2xl">{profileGuest.name}</SheetTitle>
                <SheetDescription>{profileGuest.email}</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-5 px-4 pb-8">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">RSVP</p>
                  <div className="mt-1.5">
                    <StatusBadge status={profileGuest.status} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Party</p>
                    <p className="mt-1 text-sm">{profileGuest.partySize} guest{profileGuest.partySize === 1 ? '' : 's'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Group</p>
                    <p className="mt-1 inline-flex items-center gap-1.5 text-sm">
                      {profileGuest.groupId ? (
                        <>
                          <GroupDot color={groupById.get(profileGuest.groupId)?.color} />
                          {profileGuest.groupName ?? groupById.get(profileGuest.groupId)?.name ?? '—'}
                        </>
                      ) : (
                        '—'
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Meal</p>
                    <p className="mt-1 text-sm">{profileGuest.meal ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Dietary</p>
                    <p className="mt-1 text-sm">{profileGuest.dietary ?? '—'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Notes</p>
                  <p className="mt-1 text-sm leading-relaxed">{profileGuest.notes ?? '—'}</p>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => {
                      const g = profileGuest
                      setProfileGuest(null)
                      openEdit(g)
                    }}
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                    Edit
                  </Button>
                  <Button
                    className="flex-1 gap-2 bg-[#1F2937] text-white hover:bg-[#111827]"
                    onClick={() => toast.success(`Message sent to ${profileGuest.email}`)}
                  >
                    <Mail className="size-4" aria-hidden="true" />
                    Send Message
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      {/* QR dialog */}
      <Dialog open={!!qrGuest} onOpenChange={(open) => !open && setQrGuest(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>RSVP QR code</DialogTitle>
            <DialogDescription>
              {qrGuest ? `Personalized RSVP code for ${qrGuest.name}. Guests scan to respond instantly.` : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-2">
            {qrLoading ? (
              <Skeleton className="size-52 rounded-xl" />
            ) : qrUrl ? (
              <img src={qrUrl} alt={`QR code for ${qrGuest?.name}`} className="size-52 rounded-xl border border-border bg-white p-2" />
            ) : (
              <div className="flex size-52 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
                QR code unavailable
              </div>
            )}
            {qrUrl ? (
              <a href={qrUrl} download={`rsvp-qr-${qrGuest?.name?.replace(/\s+/g, '-').toLowerCase() ?? 'guest'}.png`}>
                <Button variant="outline" className="gap-2">
                  <Download className="size-4" aria-hidden="true" />
                  Download PNG
                </Button>
              </a>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete guest confirm */}
      <AlertDialog open={!!deleteGuestId} onOpenChange={(open) => !open && setDeleteGuestId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this guest?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the guest and their RSVP response from your list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault()
                removeGuest()
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk delete confirm */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {selected.size} guest{selected.size === 1 ? '' : 's'}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the selected guests and their RSVP responses.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault()
                bulkDelete()
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Groups manager */}
      <Dialog open={groupsOpen} onOpenChange={setGroupsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Guest groups</DialogTitle>
            <DialogDescription>Organize guests into groups for targeting and conditional logic.</DialogDescription>
          </DialogHeader>
          <div className="max-h-[320px] space-y-2 overflow-y-auto pr-1 scrollbar-thin" aria-label="Existing groups">
            {groups.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No groups yet — create your first one below.</p>
            ) : (
              groups.map((g) => (
                <div
                  key={g.id}
                  className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5"
                >
                  <GroupDot color={g.color} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{g.name}</p>
                    {g.description ? (
                      <p className="truncate text-xs text-muted-foreground">{g.description}</p>
                    ) : null}
                  </div>
                  <span className="text-xs text-muted-foreground">{g.guestCount ?? 0} members</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    aria-label={`Edit group ${g.name}`}
                    onClick={() => {
                      setEditGroup(g)
                      setEditGroupForm({ name: g.name, color: g.color, description: g.description })
                    }}
                  >
                    <Pencil className="size-3.5" aria-hidden="true" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive hover:text-destructive"
                    aria-label={`Delete group ${g.name}`}
                    onClick={() => setDeleteGroupId(g.id)}
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                  </Button>
                </div>
              ))
            )}
          </div>
          <div className="flex items-center gap-2 border-t border-border pt-4">
            <Input
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="New group name"
              aria-label="New group name"
              onKeyDown={(e) => e.key === 'Enter' && createGroup()}
            />
            <input
              type="color"
              value={newGroupColor}
              onChange={(e) => setNewGroupColor(e.target.value)}
              aria-label="New group color"
              className="size-9 shrink-0 cursor-pointer rounded-md border border-input bg-transparent p-1"
            />
            <Button onClick={createGroup} className="gap-1.5 shrink-0 bg-[#9A7B5B] text-white hover:bg-[#8A6D4F]">
              <Plus className="size-4" aria-hidden="true" />
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit group dialog */}
      <Dialog open={!!editGroup} onOpenChange={(open) => !open && setEditGroup(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit group</DialogTitle>
            <DialogDescription>Update the group name, color or description.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="group-name">Name</Label>
              <Input
                id="group-name"
                value={editGroupForm.name}
                onChange={(e) => setEditGroupForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="group-color">Color</Label>
              <input
                id="group-color"
                type="color"
                value={editGroupForm.color}
                onChange={(e) => setEditGroupForm((f) => ({ ...f, color: e.target.value }))}
                className="h-9 w-20 cursor-pointer rounded-md border border-input bg-transparent p-1"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="group-desc">Description</Label>
              <Textarea
                id="group-desc"
                rows={2}
                value={editGroupForm.description}
                onChange={(e) => setEditGroupForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditGroup(null)}>
              Cancel
            </Button>
            <Button onClick={saveGroupEdit} className="bg-[#1F2937] text-white hover:bg-[#111827]">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete group confirm */}
      <AlertDialog open={!!deleteGroupId} onOpenChange={(open) => !open && setDeleteGroupId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this group?</AlertDialogTitle>
            <AlertDialogDescription>
              Guests in this group will remain on your list but will no longer belong to any group.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault()
                removeGroup()
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}

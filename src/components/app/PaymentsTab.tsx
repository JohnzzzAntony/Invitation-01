'use client'

// Task 6-b — PaymentsTab: totals + transactions (wireframe §35).
import * as React from 'react'
import { CreditCard, Download, PlusCircle, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { useApp } from '@/lib/store'
import { api, downloadCsv, formatDateShort, money } from '@/lib/api'
import type { EventStats, PaymentRecord } from '@/lib/types'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState, TabHeader } from './shared'

const TYPE_LABEL: Record<string, string> = {
  donation: 'Donation',
  ticket: 'Ticket',
  gift: 'Gift',
  registry: 'Registry',
}

export default function PaymentsTab() {
  const { currentEvent } = useApp()
  const eventId = currentEvent?.id

  const [stats, setStats] = React.useState<EventStats | null>(null)
  const [payments, setPayments] = React.useState<PaymentRecord[] | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [failed, setFailed] = React.useState(false)

  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [form, setForm] = React.useState({ guestName: '', type: 'donation', amount: '' })
  const [saving, setSaving] = React.useState(false)

  const refresh = React.useCallback(async () => {
    if (!eventId) return
    setLoading(true)
    setFailed(false)
    try {
      const [a, p] = await Promise.all([
        api<{ stats: EventStats }>(`/api/events/${eventId}/analytics`),
        api<{ payments: PaymentRecord[] }>(`/api/events/${eventId}/payments`),
      ])
      setStats(a.stats)
      setPayments(p.payments)
    } catch {
      setFailed(true)
    } finally {
      setLoading(false)
    }
  }, [eventId])

  React.useEffect(() => {
    refresh()
  }, [refresh])

  const recordPayment = async () => {
    if (!eventId) return
    const amount = Number(form.amount)
    if (!form.guestName.trim()) {
      toast.error('Guest name is required')
      return
    }
    if (!amount || amount <= 0) {
      toast.error('Enter an amount greater than zero')
      return
    }
    setSaving(true)
    try {
      await api(`/api/events/${eventId}/payments`, {
        body: {
          guestName: form.guestName.trim(),
          type: form.type,
          amount,
        },
      })
      toast.success('Payment recorded')
      setDialogOpen(false)
      setForm({ guestName: '', type: 'donation', amount: '' })
      await refresh()
    } catch {
      toast.error('Could not record the payment')
    } finally {
      setSaving(false)
    }
  }

  const exportCsv = () => {
    const header = ['Guest', 'Type', 'Amount', 'Status', 'Method', 'Date']
    const rows = (payments ?? []).map((p) => [p.guestName, p.type, p.amount, p.status, p.method, p.createdAt])
    downloadCsv('payments.csv', [header, ...rows])
    toast.success('Payments exported')
  }

  if (!eventId) return null

  return (
    <div>
      <TabHeader title="Payments" description="Collect and track contributions for your event.">
        <Button variant="outline" className="gap-2" onClick={exportCsv} disabled={!payments?.length}>
          <Download className="size-4" aria-hidden="true" />
          Export
        </Button>
        <Button
          onClick={() => setDialogOpen(true)}
          className="gap-2 bg-[#1F2937] text-white hover:bg-[#111827]"
        >
          <PlusCircle className="size-4" aria-hidden="true" />
          Record Payment
        </Button>
      </TabHeader>

      {failed ? (
        <EmptyState
          title="Could not load payments"
          description="Something went wrong while fetching your transactions."
          action={
            <Button variant="outline" onClick={refresh}>
              Try again
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {/* Total collected */}
          {loading ? (
            <Card>
              <CardContent className="space-y-3 p-6">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-40" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <CardContent className="flex flex-wrap items-center gap-6 p-6">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-accent">
                  <Wallet className="size-7 text-[#9A7B5B]" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Total collected
                  </p>
                  <p className="font-heading text-4xl font-semibold text-foreground">
                    {money(stats?.paymentsTotal ?? 0)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {stats?.paymentsCount ?? 0} transaction{(stats?.paymentsCount ?? 0) === 1 ? '' : 's'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Transactions */}
          <Card>
            <CardContent className="p-0">
              <div className="flex items-center justify-between px-5 py-4">
                <h2 className="font-heading text-lg font-semibold">Transactions</h2>
              </div>
              {loading ? (
                <div className="space-y-3 px-5 pb-5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (payments ?? []).length === 0 ? (
                <div className="px-5 pb-8">
                  <EmptyState
                    icon={CreditCard}
                    title="No transactions yet"
                    description="Payments collected through your event page will appear here."
                    className="border-0 bg-transparent"
                  />
                </div>
              ) : (
                <div className="max-h-[420px] overflow-y-auto scrollbar-thin">
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-card">
                      <TableRow>
                        <TableHead>Guest</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden sm:table-cell">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(payments ?? []).map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="text-sm font-medium">{p.guestName}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-transparent bg-accent font-normal text-[#9A7B5B]">
                              {TYPE_LABEL[p.type] ?? p.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-sm font-semibold">{money(p.amount)}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                p.status === 'succeeded'
                                  ? 'border-transparent bg-[#7C8A6E1A] font-normal text-[#7C8A6E]'
                                  : 'border-transparent bg-[#C9A96A1A] font-normal text-[#9A7B5B]'
                              }
                            >
                              {p.status === 'succeeded' ? 'Succeeded' : p.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                            {formatDateShort(p.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Record payment dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Record payment</DialogTitle>
            <DialogDescription>Log a payment received outside the platform, e.g. cash or transfer.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="p-guest">Guest name</Label>
              <Input
                id="p-guest"
                value={form.guestName}
                onChange={(e) => setForm((f) => ({ ...f, guestName: e.target.value }))}
                placeholder="Sarah Smith"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                  <SelectTrigger aria-label="Payment type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="donation">Donation</SelectItem>
                    <SelectItem value="ticket">Ticket</SelectItem>
                    <SelectItem value="gift">Gift</SelectItem>
                    <SelectItem value="registry">Registry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="p-amount">Amount ($)</Label>
                <Input
                  id="p-amount"
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  placeholder="100"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={recordPayment} disabled={saving} className="bg-[#1F2937] text-white hover:bg-[#111827]">
              {saving ? 'Saving...' : 'Record payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

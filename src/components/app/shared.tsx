'use client'

// Shared UI helpers for the event dashboard tabs (Task 6-b).
import * as React from 'react'
import { CheckCircle2, HelpCircle, Inbox, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { GuestStatus } from '@/lib/types'

// ---------- Palette (warm neutrals + status colors, no blue/indigo) ----------
export const ACCENT = '#9A7B5B'
export const STATUS_COLOR: Record<GuestStatus, string> = {
  attending: '#7C8A6E',
  pending: '#C9A96A',
  declined: '#B3543F',
}
export const STATUS_BG: Record<GuestStatus, string> = {
  attending: '#7C8A6E14',
  pending: '#C9A96A1A',
  declined: '#B3543F12',
}

// ---------- Guest status badge ----------
export function StatusBadge({ status, className }: { status: GuestStatus; className?: string }) {
  const map: Record<GuestStatus, { label: string; Icon: React.ElementType }> = {
    attending: { label: 'Attending', Icon: CheckCircle2 },
    pending: { label: 'Pending', Icon: HelpCircle },
    declined: { label: 'Declined', Icon: XCircle },
  }
  const { label, Icon } = map[status] ?? map.pending
  return (
    <Badge
      variant="outline"
      className={cn('gap-1 font-medium border-transparent', className)}
      style={{ color: STATUS_COLOR[status] ?? STATUS_COLOR.pending, backgroundColor: STATUS_BG[status] ?? STATUS_BG.pending }}
    >
      <Icon className="size-3" aria-hidden="true" />
      {label}
    </Badge>
  )
}

export function statusIcon(status: GuestStatus) {
  if (status === 'attending') return CheckCircle2
  if (status === 'declined') return XCircle
  return HelpCircle
}

// ---------- Relative time ("2h ago") ----------
export function timeAgo(iso: string | null): string {
  if (!iso) return '—'
  const then = new Date(iso).getTime()
  if (isNaN(then)) return '—'
  const diff = Date.now() - then
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}

// ---------- Empty state ----------
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ElementType
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/60 px-6 py-14 text-center',
        className
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-accent">
        <Icon className="size-6 text-[#9A7B5B]" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <p className="font-medium text-foreground">{title}</p>
        {description ? <p className="max-w-sm text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  )
}

// ---------- Loading skeleton helpers ----------
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl border border-border bg-card p-6 space-y-4', className)}>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-16" />
    </div>
  )
}

export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="size-9 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  )
}

// ---------- Tab page header ----------
export function TabHeader({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
    </div>
  )
}

// ---------- Colored group dot ----------
export function GroupDot({ color, className }: { color?: string | null; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('inline-block size-2.5 shrink-0 rounded-full', className)}
      style={{ backgroundColor: color || '#8A8A82' }}
    />
  )
}

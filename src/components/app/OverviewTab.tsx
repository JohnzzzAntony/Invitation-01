'use client'

// Task 6-b — OverviewTab: greeting, countdown, stat cards, RSVP rate,
// response trend chart, recent RSVPs, quick actions (wireframe §12).
import * as React from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  CheckCircle2,
  ExternalLink,
  Globe,
  HelpCircle,
  Pencil,
  Users,
  XCircle,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { api, daysUntil, formatDateShort } from '@/lib/api'
import type { EventStats, GuestRecord } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { ACCENT, EmptyState, ListSkeleton, StatCardsSkeleton, StatusBadge, timeAgo } from './shared'

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

const CHART_COLOR = ACCENT

export default function OverviewTab() {
  const { user, currentEvent, setBuilderOpen, openPublic } = useApp()
  const eventId = currentEvent?.id

  const [stats, setStats] = React.useState<EventStats | null>(null)
  const [guests, setGuests] = React.useState<GuestRecord[] | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [failed, setFailed] = React.useState(false)

  const load = React.useCallback(async () => {
    if (!eventId) return
    setLoading(true)
    setFailed(false)
    try {
      const [a, g] = await Promise.all([
        api<{ stats: EventStats }>(`/api/events/${eventId}/analytics`),
        api<{ guests: GuestRecord[] }>(`/api/events/${eventId}/guests`),
      ])
      setStats(a.stats)
      setGuests(g.guests)
    } catch {
      setFailed(true)
    } finally {
      setLoading(false)
    }
  }, [eventId])

  React.useEffect(() => {
    load()
  }, [load])

  const recent = React.useMemo(
    () =>
      (guests ?? [])
        .filter((g) => g.respondedAt)
        .sort((a, b) => new Date(b.respondedAt!).getTime() - new Date(a.respondedAt!).getTime())
        .slice(0, 5),
    [guests]
  )

  if (!currentEvent) return null

  const days = daysUntil(currentEvent.eventDate)
  const firstName = (user?.name ?? '').split(' ')[0] || 'there'
  const trend = (stats?.trend ?? []).map((t) => ({
    ...t,
    label: formatDateShort(t.date).slice(0, 6),
  }))

  const statCards = stats
    ? [
        { label: 'Total guests', value: stats.totalGuests, icon: Users, color: '#1F2937' },
        { label: 'Attending', value: stats.attending, icon: CheckCircle2, color: '#7C8A6E' },
        { label: 'Pending', value: stats.pending, icon: HelpCircle, color: '#C9A96A' },
        { label: 'Declined', value: stats.declined, icon: XCircle, color: '#B3543F' },
      ]
    : []

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {greeting()}, {firstName}
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <p className="text-sm text-muted-foreground">
              {days > 0
                ? `Your event is ${days} day${days === 1 ? '' : 's'} away`
                : 'Your event is happening now'}
            </p>
            <span aria-hidden="true" className="text-muted-foreground">·</span>
            <p className="text-sm text-muted-foreground">{formatDateShort(currentEvent.eventDate)}</p>
            {currentEvent.status === 'published' ? (
              <span className="inline-flex items-center gap-2">
                <span className="inline-block size-2 rounded-full bg-[#7C8A6E]" aria-hidden="true" />
                <span className="text-sm font-medium text-[#7C8A6E]">Published</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  aria-label="View public event site"
                  onClick={() => openPublic(currentEvent.slug)}
                >
                  <ExternalLink className="size-3.5" aria-hidden="true" />
                </Button>
              </span>
            ) : currentEvent.status === 'draft' ? (
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                Draft
              </span>
            ) : (
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium capitalize text-muted-foreground">
                {currentEvent.status}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => openPublic(currentEvent.slug)}
          >
            <Globe className="size-4" aria-hidden="true" />
            View Event
          </Button>
          <Button className="gap-2 bg-[#1F2937] text-white hover:bg-[#111827]" onClick={() => setBuilderOpen(true)}>
            <Pencil className="size-4" aria-hidden="true" />
            Edit Website
          </Button>
        </div>
      </div>

      {failed ? (
        <EmptyState
          title="Could not load dashboard data"
          description="Something went wrong while fetching your event stats."
          action={
            <Button variant="outline" onClick={load}>
              Try again
            </Button>
          }
        />
      ) : (
        <>
          {/* Stat cards */}
          {loading || !stats ? (
            <StatCardsSkeleton />
          ) : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {statCards.map(({ label, value, icon: Icon, color }) => (
                <Card key={label} className="gap-2 py-5">
                  <CardHeader className="px-5">
                    <CardTitle className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      <Icon className="size-4" style={{ color }} aria-hidden="true" />
                      {label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5">
                    <p className="font-heading text-3xl font-semibold" style={{ color }}>
                      {value.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* RSVP rate + trend */}
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  RSVP rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading || !stats ? (
                  <div className="space-y-3">
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-2.5 w-full rounded-full" />
                  </div>
                ) : (
                  <>
                    <p className="font-heading text-4xl font-semibold text-foreground">{stats.rsvpRate}%</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {stats.attending + stats.declined} of {stats.totalGuests} guests responded
                    </p>
                    <Progress
                      value={stats.rsvpRate}
                      className="mt-4 h-2.5 bg-secondary [&>div]:bg-[#9A7B5B]"
                      aria-label={`RSVP rate ${stats.rsvpRate}%`}
                    />
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Guest response trend — last 30 days
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-48 w-full" />
                ) : (
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trend} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                        <defs>
                          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={CHART_COLOR} stopOpacity={0.35} />
                            <stop offset="100%" stopColor={CHART_COLOR} stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E7E5DF" vertical={false} />
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 11, fill: '#73736D' }}
                          tickLine={false}
                          axisLine={{ stroke: '#E7E5DF' }}
                          interval={6}
                        />
                        <YAxis
                          allowDecimals={false}
                          tick={{ fontSize: 11, fill: '#73736D' }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: 10,
                            border: '1px solid #E7E5DF',
                            fontSize: 12,
                          }}
                          labelFormatter={(l) => `Date: ${l}`}
                          formatter={(value) => [`${value} responses`, 'RSVPs']}
                        />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke={CHART_COLOR}
                          strokeWidth={2}
                          fill="url(#trendFill)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent RSVPs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Recent RSVPs</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <ListSkeleton />
              ) : recent.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No responses yet"
                  description="When guests start responding, the latest RSVPs will appear here."
                  className="py-10"
                />
              ) : (
                <ul className="divide-y divide-border">
                  {recent.map((g) => (
                    <li key={g.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-3">
                      <span className="flex size-9 items-center justify-center rounded-full bg-accent text-xs font-semibold text-[#9A7B5B]">
                        {g.name
                          .split(' ')
                          .slice(0, 2)
                          .map((w) => w[0]?.toUpperCase() ?? '')
                          .join('')}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{g.name}</p>
                        <p className="text-xs text-muted-foreground">{g.email}</p>
                      </div>
                      <StatusBadge status={g.status} />
                      <span className="w-20 text-right text-sm text-muted-foreground">
                        {g.status === 'attending' ? `${g.partySize} guest${g.partySize === 1 ? '' : 's'}` : '—'}
                      </span>
                      <span className="w-16 text-right text-xs text-muted-foreground">{timeAgo(g.respondedAt)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

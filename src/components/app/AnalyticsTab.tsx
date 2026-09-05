'use client'

// Task 6-b — AnalyticsTab: KPIs, charts, breakdowns (wireframe §34).
import * as React from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  CheckCircle2,
  Eye,
  HelpCircle,
  Mail,
  MousePointerClick,
  Send,
  Users,
  XCircle,
  BarChart3,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { api, formatDateShort } from '@/lib/api'
import type { EventStats, GuestRecord } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { ACCENT, EmptyState, StatCardsSkeleton, STATUS_COLOR, TabHeader } from './shared'

export default function AnalyticsTab() {
  const { currentEvent } = useApp()
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

  // Meal breakdown
  const meals = React.useMemo(() => {
    const counts = new Map<string, number>()
    ;(guests ?? []).forEach((g) => {
      const m = (g.meal ?? '').trim()
      if (m) counts.set(m, (counts.get(m) ?? 0) + 1)
    })
    const rows = Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
    return rows
  }, [guests])
  const mealsTotal = meals.reduce((s, m) => s + m.count, 0)

  const pieData = stats
    ? [
        { name: 'Attending', value: stats.attending, color: STATUS_COLOR.attending },
        { name: 'Pending', value: stats.pending, color: STATUS_COLOR.pending },
        { name: 'Declined', value: stats.declined, color: STATUS_COLOR.declined },
      ].filter((d) => d.value > 0)
    : []

  const trend = (stats?.trend ?? []).map((t) => ({ ...t, label: formatDateShort(t.date).slice(0, 6) }))

  if (!eventId) return null

  const kpis = stats
    ? [
        { label: 'Total invited', value: stats.invited, icon: Mail, color: '#1F2937' },
        {
          label: 'RSVP submitted',
          value: stats.attending + stats.declined,
          icon: BarChart3,
          color: '#9A7B5B',
        },
        { label: 'Attending', value: stats.attending, icon: CheckCircle2, color: STATUS_COLOR.attending },
        { label: 'Declined', value: stats.declined, icon: XCircle, color: STATUS_COLOR.declined },
        { label: 'Pending', value: stats.pending, icon: HelpCircle, color: STATUS_COLOR.pending },
      ]
    : []

  const emailRates = stats
    ? {
        openRate: stats.emails.sent ? Math.round((stats.emails.opened / stats.emails.sent) * 100) : 0,
        clickRate: stats.emails.sent ? Math.round((stats.emails.clicked / stats.emails.sent) * 100) : 0,
      }
    : { openRate: 0, clickRate: 0 }

  return (
    <div>
      <TabHeader title="Analytics" description="Understand your guests, emails and page traffic." />

      {failed ? (
        <EmptyState
          title="Could not load analytics"
          description="Something went wrong while fetching your event statistics."
          action={
            <Button variant="outline" onClick={load}>
              Try again
            </Button>
          }
        />
      ) : loading || !stats ? (
        <div className="space-y-6">
          <StatCardsSkeleton count={5} />
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
            {kpis.map(({ label, value, icon: Icon, color }) => (
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

          {/* RSVP rate */}
          <Card>
            <CardContent className="flex flex-wrap items-center gap-6 p-6">
              <div className="min-w-48 flex-1">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold">RSVP rate</p>
                  <p className="text-sm font-semibold text-[#9A7B5B]">{stats.rsvpRate}%</p>
                </div>
                <Progress
                  value={stats.rsvpRate}
                  className="h-3 bg-secondary [&>div]:bg-[#9A7B5B]"
                  aria-label={`RSVP rate ${stats.rsvpRate}%`}
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  {stats.attending + stats.declined} of {stats.totalGuests} guests have responded
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-[#F8F8F6] px-5 py-4">
                <Eye className="size-5 text-[#9A7B5B]" aria-hidden="true" />
                <div>
                  <p className="font-heading text-2xl font-semibold leading-none">{stats.pageViews.toLocaleString()}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Page views</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trend + pie */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Guest response trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trend} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                      <defs>
                        <linearGradient id="analyticsFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={ACCENT} stopOpacity={0.35} />
                          <stop offset="100%" stopColor={ACCENT} stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E7E5DF" vertical={false} />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: '#73736D' }}
                        tickLine={false}
                        axisLine={{ stroke: '#E7E5DF' }}
                        interval={4}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 11, fill: '#73736D' }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{ borderRadius: 10, border: '1px solid #E7E5DF', fontSize: 12 }}
                        labelFormatter={(l) => `Date: ${l}`}
                        formatter={(value) => [`${value} responses`, 'RSVPs']}
                      />
                      <Area type="monotone" dataKey="count" stroke={ACCENT} strokeWidth={2} fill="url(#analyticsFill)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Response breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pieData.length === 0 ? (
                  <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
                    No responses yet
                  </div>
                ) : (
                  <>
                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={55}
                            outerRadius={85}
                            paddingAngle={3}
                            strokeWidth={0}
                          >
                            {pieData.map((d) => (
                              <Cell key={d.name} fill={d.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ borderRadius: 10, border: '1px solid #E7E5DF', fontSize: 12 }}
                            formatter={(value, name) => [`${value} guests`, name]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-2 space-y-1.5">
                      {pieData.map((d) => (
                        <div key={d.name} className="flex items-center gap-2 text-sm">
                          <span className="size-2.5 rounded-full" style={{ backgroundColor: d.color }} aria-hidden="true" />
                          <span className="flex-1 text-muted-foreground">{d.name}</span>
                          <span className="font-medium">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Email performance + meals */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Email performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Sent', value: stats.emails.sent, rate: null as number | null, icon: Send },
                  { label: 'Opened', value: stats.emails.opened, rate: emailRates.openRate, icon: Eye },
                  {
                    label: 'Clicked',
                    value: stats.emails.clicked,
                    rate: emailRates.clickRate,
                    icon: MousePointerClick,
                  },
                ].map(({ label, value, rate, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent">
                      <Icon className="size-4.5 text-[#9A7B5B]" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium">{label}</span>
                        <span className="text-muted-foreground">
                          {value.toLocaleString()}
                          {rate !== null ? ` · ${rate}%` : ''}
                        </span>
                      </div>
                      <Progress
                        value={rate ?? 100}
                        className="h-2 bg-secondary [&>div]:bg-[#9A7B5B]"
                        aria-label={`${label} ${rate ?? 100}%`}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Meal choices
                </CardTitle>
              </CardHeader>
              <CardContent>
                {meals.length === 0 ? (
                  <div className="flex h-40 items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Users className="size-4" aria-hidden="true" />
                    No meal preferences collected yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {meals.map((m) => (
                      <div key={m.name}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="truncate font-medium">{m.name}</span>
                          <span className="text-muted-foreground">{m.count}</span>
                        </div>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full bg-[#9A7B5B]"
                            style={{ width: `${Math.round((m.count / mealsTotal) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

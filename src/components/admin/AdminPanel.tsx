'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  BarChart3,
  CalendarCheck,
  CreditCard,
  DollarSign,
  ExternalLink,
  Globe,
  LayoutDashboard,
  LayoutTemplate,
  Mail,
  RefreshCw,
  Search,
  Settings as SettingsIcon,
  ShieldAlert,
  Users as UsersIcon,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { toast } from 'sonner'
import { Logo } from '@/components/shared/Logo'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { api, formatDateShort, money } from '@/lib/api'
import { useApp } from '@/lib/store'
import type { EventStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

// ============================================================
// Super-admin platform console (wireframe §41-43).
// SPA tab navigation via internal state — no next/navigation.
// ============================================================

interface AdminPayload {
  stats: {
    users: number
    events: number
    publishedEvents: number
    rsvps: number
    revenue: number
    paymentsCount: number
    templates: number
    emailsSent: number
    activeDomains: number
    storageGb: number
  }
  recentUsers: { id: string; name: string; email: string; createdAt: string; role: 'user' | 'admin' }[]
  recentEvents: {
    id: string
    name: string
    slug: string
    status: EventStatus
    type: string
    createdAt: string
    guestCount: number
  }[]
  trend: { week: string; users: number; events: number }[]
}

type TabKey =
  | 'dashboard'
  | 'users'
  | 'events'
  | 'templates'
  | 'payments'
  | 'emails'
  | 'reports'
  | 'settings'

const NAV: { key: TabKey; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'users', label: 'Users', icon: UsersIcon },
  { key: 'events', label: 'Events', icon: Globe },
  { key: 'templates', label: 'Templates', icon: LayoutTemplate },
  { key: 'payments', label: 'Payments', icon: CreditCard },
  { key: 'emails', label: 'Emails', icon: Mail },
  { key: 'reports', label: 'Reports', icon: BarChart3 },
  { key: 'settings', label: 'Settings', icon: SettingsIcon },
]

const TEMPLATES = [
  { name: 'Eucalyptus', category: 'Wedding', status: 'published', swatch: '#7C8A6E' },
  { name: 'Modern Minimal', category: 'Wedding', status: 'published', swatch: '#1F2937' },
  { name: 'White Rose', category: 'Wedding', status: 'published', swatch: '#C9B8A8' },
  { name: 'Luxury Gold', category: 'Wedding', status: 'draft', swatch: '#B9975B' },
  { name: 'Dark Wedding', category: 'Wedding', status: 'published', swatch: '#272727' },
]

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    published: 'border-[#7C8A6E]/30 bg-[#7C8A6E]/15 text-[#55663F]',
    draft: 'border-border bg-muted text-muted-foreground',
    paused: 'border-amber-500/30 bg-amber-500/15 text-amber-700',
    archived: 'border-border bg-muted/60 text-muted-foreground',
  }
  const labels: Record<string, string> = {
    published: 'Published',
    draft: 'Draft',
    paused: 'Paused',
    archived: 'Archived',
  }
  return (
    <Badge variant="outline" className={cn('font-medium', styles[status] ?? styles.draft)}>
      {labels[status] ?? status}
    </Badge>
  )
}

function RoleBadge({ role }: { role: string }) {
  if (role === 'admin') {
    return (
      <Badge variant="destructive" className="text-[10px]">
        Admin
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className="text-[10px]">
      User
    </Badge>
  )
}

function KpiCard({
  icon: Icon,
  label,
  value,
  delta,
}: {
  icon: typeof DollarSign
  label: string
  value: string
  delta: string
}) {
  return (
    <Card className="gap-2 py-4">
      <CardContent className="px-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#9A7B5B]/10">
            <Icon className="h-4.5 w-4.5 text-[#9A7B5B]" />
          </div>
        </div>
        <p className="mt-2 text-xs text-[#7C8A6E]">{delta}</p>
      </CardContent>
    </Card>
  )
}

function ChartCard({
  title,
  description,
  data,
  dataKey,
  color,
}: {
  title: string
  description: string
  data: { week: string; users: number; events: number }[]
  dataKey: 'users' | 'events'
  color: string
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E7E5DF" vertical={false} />
              <XAxis
                dataKey="week"
                tickFormatter={(v: string) =>
                  new Date(v).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                }
                tick={{ fontSize: 10, fill: '#73736D' }}
                stroke="#E7E5DF"
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#73736D' }} stroke="#E7E5DF" />
              <ChartTooltip
                cursor={{ fill: 'rgba(154,123,91,0.08)' }}
                contentStyle={{
                  borderRadius: 10,
                  border: '1px solid #E7E5DF',
                  fontSize: 12,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                }}
                labelFormatter={(v) =>
                  `Week of ${new Date(String(v)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                }
              />
              <Bar dataKey={dataKey} fill={color} radius={[3, 3, 0, 0]} maxBarSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Card key={i} className="py-4">
            <CardContent className="space-y-2 px-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function AdminPanel() {
  const user = useApp((s) => s.user)
  const setView = useApp((s) => s.setView)

  const isAdmin = !!user && user.role === 'admin'
  const [tab, setTab] = useState<TabKey>('dashboard')
  const [data, setData] = useState<AdminPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [userQuery, setUserQuery] = useState('')
  const [enableRegistrations, setEnableRegistrations] = useState(true)
  const [maintenanceMode, setMaintenanceMode] = useState(false)

  // All setState calls happen in promise callbacks (async) so the
  // fetch can be safely kicked off from the mount effect below.
  const load = useCallback(() => {
    api<AdminPayload>('/api/admin/stats')
      .then((d) => setData(d))
      .catch((err: Error) => toast.error(err.message || 'Failed to load platform stats'))
      .finally(() => setLoading(false))
  }, [])

  const refresh = useCallback(() => {
    setLoading(true)
    load()
  }, [load])

  useEffect(() => {
    if (isAdmin) load()
  }, [isAdmin, load])

  const stats = data?.stats

  const filteredUsers = useMemo(() => {
    const list = data?.recentUsers ?? []
    const q = userQuery.trim().toLowerCase()
    if (!q) return list
    return list.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    )
  }, [data, userQuery])

  // ---------- Guard ----------
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F8F6] p-6">
        <Card className="w-full max-w-sm text-center">
          <CardContent className="flex flex-col items-center gap-3 p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <ShieldAlert className="h-6 w-6 text-destructive" />
            </div>
            <h2 className="text-lg font-semibold tracking-tight">Admin access required</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              This area is restricted to platform administrators. Sign in with an admin account to
              manage users, events and platform settings.
            </p>
            <Button variant="outline" className="mt-2" onClick={() => setView('marketing')}>
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ---------- Section renderers ----------
  const renderDashboard = () => {
    if (loading || !data || !stats) return <LoadingSkeleton />
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard icon={UsersIcon} label="Users" value={stats.users.toLocaleString()} delta="+3 this week" />
          <KpiCard icon={Globe} label="Active events" value={String(stats.publishedEvents)} delta="+1 this week" />
          <KpiCard icon={CalendarCheck} label="Total RSVPs" value={stats.rsvps.toLocaleString()} delta="+28 this week" />
          <KpiCard icon={DollarSign} label="Revenue" value={money(stats.revenue)} delta="+$120 this week" />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard
            title="New users"
            description="Signups per week — last 12 weeks"
            data={data.trend}
            dataKey="users"
            color="#9A7B5B"
          />
          <ChartCard
            title="Events created"
            description="New events per week — last 12 weeks"
            data={data.trend}
            dataKey="events"
            color="#7C8A6E"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Recent users</CardTitle>
              <CardDescription className="text-xs">Latest registrations across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="scrollbar-thin max-h-64 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.recentUsers.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>
                          <div className="font-medium">{u.name}</div>
                          <div className="text-xs text-muted-foreground">{u.email}</div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {formatDateShort(u.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <RoleBadge role={u.role} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Recent events</CardTitle>
              <CardDescription className="text-xs">Newest event workspaces</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="scrollbar-thin max-h-64 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Guests</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.recentEvents.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell className="max-w-40">
                          <div className="truncate font-medium">{e.name}</div>
                          <div className="truncate text-xs text-muted-foreground">/{e.slug}</div>
                        </TableCell>
                        <TableCell className="text-xs capitalize">{e.type}</TableCell>
                        <TableCell>
                          <StatusBadge status={e.status} />
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{e.guestCount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const renderUsers = () => (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-sm">Users</CardTitle>
            <CardDescription className="text-xs">Showing latest 6 registrations</CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="Search by name or email…"
              className="h-8 pl-8 text-xs"
              aria-label="Search users"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading || !data ? (
          <div className="space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No users match “{userQuery}”.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead className="hidden sm:table-cell">Joined</TableHead>
                <TableHead className="text-right">Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="font-medium">{u.name}</div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </TableCell>
                  <TableCell className="hidden whitespace-nowrap text-xs text-muted-foreground sm:table-cell">
                    {formatDateShort(u.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <RoleBadge role={u.role} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          Full user management, suspensions and data exports ship with the enterprise plan.
        </p>
      </CardContent>
    </Card>
  )

  const renderEvents = () => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Events</CardTitle>
        <CardDescription className="text-xs">Latest event workspaces across all accounts</CardDescription>
      </CardHeader>
      <CardContent>
        {loading || !data ? (
          <div className="space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead className="hidden md:table-cell">Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Created</TableHead>
                <TableHead className="text-right">Guests</TableHead>
                <TableHead className="w-10 text-right" aria-label="Actions" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentEvents.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="max-w-40">
                    <div className="truncate font-medium">{e.name}</div>
                    <div className="truncate text-xs text-muted-foreground">/{e.slug}</div>
                  </TableCell>
                  <TableCell className="hidden text-xs capitalize md:table-cell">{e.type}</TableCell>
                  <TableCell>
                    <StatusBadge status={e.status} />
                  </TableCell>
                  <TableCell className="hidden whitespace-nowrap text-xs text-muted-foreground sm:table-cell">
                    {formatDateShort(e.createdAt)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{e.guestCount}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      aria-label={`View site preview for ${e.name}`}
                      onClick={() =>
                        toast.info('Open public preview from the event dashboard in this demo')
                      }
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )

  const renderTemplates = () => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Templates</CardTitle>
        <CardDescription className="text-xs">Template CMS is managed by the platform team</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Template</TableHead>
              <TableHead className="hidden sm:table-cell">Category</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {TEMPLATES.map((t) => (
              <TableRow key={t.name}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-6 w-6 shrink-0 rounded-md border border-black/10"
                      style={{ background: t.swatch }}
                      aria-hidden="true"
                    />
                    <span className="font-medium">{t.name}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden text-sm sm:table-cell">{t.category}</TableCell>
                <TableCell>
                  <StatusBadge status={t.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )

  const renderPayments = () => (
    <div className="space-y-4">
      {loading || !stats ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <Card key={i}>
              <CardContent className="space-y-2 pt-6">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs font-medium text-muted-foreground">Gross platform revenue</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight">{money(stats.revenue)}</p>
              <p className="mt-2 text-xs text-[#7C8A6E]">All-time across registry gifts, tickets &amp; donations</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs font-medium text-muted-foreground">Payments processed</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight">{stats.paymentsCount.toLocaleString()}</p>
              <p className="mt-2 text-xs text-[#7C8A6E]">Average {money(stats.revenue / Math.max(1, stats.paymentsCount))} per transaction</p>
            </CardContent>
          </Card>
        </div>
      )}
      <Card>
        <CardContent className="pt-6 text-sm leading-relaxed text-muted-foreground">
          Payouts are settled weekly via the platform billing provider. Refunds, disputes and
          chargeback handling are managed in the payment provider dashboard and are out of scope for
          this console.
        </CardContent>
      </Card>
    </div>
  )

  const renderEmails = () => (
    <div className="space-y-4">
      {loading || !stats ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <Card key={i}>
              <CardContent className="space-y-2 pt-6">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs font-medium text-muted-foreground">Emails sent</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight">
                {stats.emailsSent.toLocaleString()}
              </p>
              <p className="mt-2 text-xs text-[#7C8A6E]">Invitations, reminders &amp; confirmations platform-wide</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs font-medium text-muted-foreground">Media storage used</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight">{stats.storageGb.toFixed(1)} GB</p>
              <Progress value={(stats.storageGb / 100) * 100} className="mt-3 h-2" aria-label="Storage used" />
              <p className="mt-2 text-xs text-muted-foreground">{stats.storageGb} GB of 100 GB pool used</p>
            </CardContent>
          </Card>
        </div>
      )}
      <Card>
        <CardContent className="pt-6 text-sm leading-relaxed text-muted-foreground">
          Delivery is handled by the transactional email provider with automatic bounce and spam
          protection. Per-event open and click rates are available in each event analytics tab.
        </CardContent>
      </Card>
    </div>
  )

  const renderReports = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Platform summary</CardTitle>
          <CardDescription className="text-xs">Rolling snapshot of platform health</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            The platform currently serves <span className="font-medium text-foreground">{stats?.users.toLocaleString() ?? '—'} accounts</span>{' '}
            hosting <span className="font-medium text-foreground">{stats?.events ?? '—'} events</span>, of which{' '}
            <span className="font-medium text-foreground">{stats?.publishedEvents ?? '—'}</span> are live on
            custom domains. Guest engagement remains healthy with{' '}
            <span className="font-medium text-foreground">{stats?.rsvps.toLocaleString() ?? '—'} confirmed RSVPs</span>{' '}
            collected to date.
          </p>
          <p>
            Billing volume continues to grow steadily, driven mainly by registry gifting. The
            transactional email pipeline is stable and the media CDN is operating within its
            storage budget.
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Capacity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-medium">Media storage</span>
              <span className="tabular-nums text-muted-foreground">{stats?.storageGb.toFixed(1) ?? '—'} / 100 GB</span>
            </div>
            <Progress value={loading || !stats ? 0 : (stats.storageGb / 100) * 100} className="h-2" aria-label="Media storage capacity" />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-medium">Published events share</span>
              <span className="tabular-nums text-muted-foreground">
                {stats ? `${Math.round((stats.publishedEvents / Math.max(1, stats.events)) * 100)}%` : '—'}
              </span>
            </div>
            <Progress
              value={loading || !stats ? 0 : (stats.publishedEvents / Math.max(1, stats.events)) * 100}
              className="h-2"
              aria-label="Published events share"
            />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-medium">Active custom domains</span>
              <span className="tabular-nums text-muted-foreground">{stats?.activeDomains ?? '—'} / 200</span>
            </div>
            <Progress
              value={loading || !stats ? 0 : (stats.activeDomains / 200) * 100}
              className="h-2"
              aria-label="Active custom domains capacity"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderSettings = () => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Platform settings</CardTitle>
        <CardDescription className="text-xs">Preferences in this demo are local only and not persisted</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="flex items-center justify-between gap-4 rounded-lg px-3 py-3">
          <div>
            <p className="text-sm font-medium">Enable new registrations</p>
            <p className="text-xs text-muted-foreground">Allow visitors to create new accounts</p>
          </div>
          <Switch
            checked={enableRegistrations}
            onCheckedChange={(v) => {
              setEnableRegistrations(v)
              toast.success(v ? 'Registrations enabled' : 'Registrations disabled')
            }}
            aria-label="Enable new registrations"
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between gap-4 rounded-lg px-3 py-3">
          <div>
            <p className="text-sm font-medium">Maintenance mode</p>
            <p className="text-xs text-muted-foreground">Show a maintenance banner on all public sites</p>
          </div>
          <Switch
            checked={maintenanceMode}
            onCheckedChange={(v) => {
              setMaintenanceMode(v)
              toast.success(v ? 'Maintenance mode on' : 'Maintenance mode off')
            }}
            aria-label="Maintenance mode"
          />
        </div>
      </CardContent>
    </Card>
  )

  const renderTab = () => {
    switch (tab) {
      case 'users':
        return renderUsers()
      case 'events':
        return renderEvents()
      case 'templates':
        return renderTemplates()
      case 'payments':
        return renderPayments()
      case 'emails':
        return renderEmails()
      case 'reports':
        return renderReports()
      case 'settings':
        return renderSettings()
      default:
        return renderDashboard()
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F8F8F6]">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setView('marketing')}
            className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Online RSVP — back to home"
          >
            <Logo size="sm" />
          </button>
          <Separator orientation="vertical" className="hidden h-5 sm:block" />
          <h1 className="hidden text-sm font-semibold tracking-tight sm:block">Platform Administration</h1>
          <Badge variant="destructive" className="text-[10px] uppercase tracking-wide">
            Admin
          </Badge>
          <div className="ml-auto">
            <Button variant="ghost" size="sm" onClick={() => setView('marketing')}>
              <ArrowLeft className="h-4 w-4" />
              Exit admin
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1">
        {/* Desktop sidebar */}
        <aside className="hidden w-56 shrink-0 border-r border-border py-6 md:block">
          <nav className="sticky top-20 flex flex-col gap-0.5 px-3" aria-label="Admin sections">
            {NAV.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                aria-current={tab === key ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  tab === key
                    ? 'bg-primary font-medium text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6">
          {/* Mobile chip nav */}
          <div className="scrollbar-thin mb-5 flex gap-2 overflow-x-auto pb-1 md:hidden" role="tablist" aria-label="Admin sections">
            {NAV.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  tab === key
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-white text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>

          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-tight">
              {NAV.find((n) => n.key === tab)?.label}
            </h2>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={refresh} disabled={loading}>
              <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
              Refresh
            </Button>
          </div>

          {renderTab()}
        </main>
      </div>
    </div>
  )
}

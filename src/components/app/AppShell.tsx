'use client'

// Task 6-b — AppShell: top bar, sidebar, mobile nav, tab router, guards.
import * as React from 'react'
import {
  BarChart3,
  Bell,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  CreditCard,
  ExternalLink,
  Globe,
  LayoutDashboard,
  Loader2,
  LogOut,
  Mail,
  MoreHorizontal,
  Plus,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import { useApp } from '@/lib/store'
import { api } from '@/lib/api'
import type { AppTab, EventRecord, EventSummary } from '@/lib/types'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/shared/Logo'
import { ArrowLeft } from 'lucide-react'
import { EmptyState } from './shared'
import OverviewTab from './OverviewTab'
import GuestsTab from './GuestsTab'
import RsvpBuilderTab from './RsvpBuilderTab'
import SubEventsTab from './SubEventsTab'
import InvitationsTab from './InvitationsTab'
import PaymentsTab from './PaymentsTab'
import AnalyticsTab from './AnalyticsTab'
import SettingsTab from './SettingsTab'

interface NotificationItem {
  id: string
  title: string
  body: string | null
  type: string
  read: boolean
  createdAt: string
}

const NAV_ITEMS: { tab: AppTab; label: string; icon: React.ElementType }[] = [
  { tab: 'overview', label: 'Overview', icon: LayoutDashboard },
  { tab: 'website', label: 'Website', icon: Globe },
  { tab: 'guests', label: 'Guests', icon: Users },
  { tab: 'rsvp', label: 'RSVP Form', icon: ClipboardList },
  { tab: 'subevents', label: 'Sub-Events', icon: CalendarDays },
  { tab: 'invitations', label: 'Invitations', icon: Mail },
  { tab: 'payments', label: 'Payments', icon: CreditCard },
  { tab: 'analytics', label: 'Analytics', icon: BarChart3 },
  { tab: 'settings', label: 'Settings', icon: Settings },
]

const MOBILE_MAIN: { tab: AppTab; label: string; icon: React.ElementType }[] = [
  { tab: 'overview', label: 'Home', icon: LayoutDashboard },
  { tab: 'guests', label: 'Guests', icon: Users },
  { tab: 'rsvp', label: 'RSVP', icon: ClipboardList },
  { tab: 'invitations', label: 'Invitations', icon: Mail },
]

const MOBILE_MORE: { tab: AppTab; label: string; icon: React.ElementType }[] = [
  { tab: 'website', label: 'Website', icon: Globe },
  { tab: 'subevents', label: 'Sub-Events', icon: CalendarDays },
  { tab: 'payments', label: 'Payments', icon: CreditCard },
  { tab: 'analytics', label: 'Analytics', icon: BarChart3 },
  { tab: 'settings', label: 'Settings', icon: Settings },
]

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

export default function AppShell() {
  const {
    user,
    events,
    currentEvent,
    appTab,
    setView,
    setAppTab,
    setEvents,
    setCurrentEvent,
    setBuilderOpen,
    openPublic,
    setUser,
    reset,
    openAuth,
  } = useApp()

  const [booting, setBooting] = React.useState(true)
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([])
  const [notifOpen, setNotifOpen] = React.useState(false)
  const [moreOpen, setMoreOpen] = React.useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  // ----- Boot: ensure events list + full current event -----
  React.useEffect(() => {
    let cancelled = false
    async function boot() {
      try {
        let list = events
        if (list.length === 0) {
          const res = await api<{ events: EventRecord[] }>('/api/events')
          list = res.events
          if (!cancelled) setEvents(list)
        }
        if (!cancelled && list.length > 0) {
          const target = currentEvent ?? list[0]
          const full = await api<{ event: EventRecord }>(`/api/events/${target.id}`)
          if (!cancelled) setCurrentEvent(full.event)
        }
      } catch {
        if (!cancelled) toast.error('Could not load your events')
      } finally {
        if (!cancelled) setBooting(false)
      }
    }
    boot()
    return () => {
      cancelled = true
    }
  }, [])

  // ----- Notifications -----
  const loadNotifications = React.useCallback(async () => {
    try {
      const res = await api<{ notifications: NotificationItem[] }>('/api/notifications')
      setNotifications(res.notifications)
    } catch {
      // silent — notifications are non-critical
    }
  }, [])

  React.useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  // ----- Handlers -----
  const selectEvent = React.useCallback(
    async (event: EventRecord) => {
      setCurrentEvent(event)
      try {
        const full = await api<{ event: EventRecord }>(`/api/events/${event.id}`)
        setCurrentEvent(full.event)
      } catch {
        toast.error('Could not open that event')
      }
    },
    [setCurrentEvent]
  )

  const refreshEvents = React.useCallback(async () => {
    try {
      const res = await api<{ events: EventRecord[] }>('/api/events')
      setEvents(res.events)
      return res.events
    } catch {
      return []
    }
  }, [setEvents])

  React.useEffect(() => {
    refreshEvents()
  }, [])

  const markAllRead = async () => {
    try {
      await api('/api/notifications', { method: 'PATCH' })
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      toast.success('All notifications marked as read')
    } catch {
      toast.error('Could not update notifications')
    }
  }

  const handleLogout = async () => {
    try {
      await api('/api/auth/logout', { method: 'POST' })
    } catch {
      // even if the call fails, clear local session
    }
    setUser(null)
    reset()
    setView('marketing')
  }

  const onNavClick = (tab: AppTab) => {
    setAppTab(tab)
    if (tab === 'website') setBuilderOpen(true)
  }

  // ----- Render tab -----
  const renderTab = () => {
    switch (appTab) {
      case 'overview':
        return <OverviewTab />
      case 'guests':
        return <GuestsTab />
      case 'rsvp':
        return <RsvpBuilderTab />
      case 'subevents':
        return <SubEventsTab />
      case 'invitations':
        return <InvitationsTab />
      case 'payments':
        return <PaymentsTab />
      case 'analytics':
        return <AnalyticsTab />
      case 'settings':
        return <SettingsTab />
      case 'website':
        // The full-screen builder overlay is rendered by the root when builderOpen is true.
        return (
          <EmptyState
            icon={Globe}
            title="Website builder"
            description="The website builder opens as a full-screen editor over the dashboard."
            action={
              <Button onClick={() => setBuilderOpen(true)} className="bg-[#9A7B5B] hover:bg-[#8A6D4F] text-white">
                Open builder
              </Button>
            }
          />
        )
      default:
        return null
    }
  }

  // ----- Guards -----
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F8F6] px-4">
        <EmptyState
          title="You are signed out"
          description="Log in to manage your events and guests."
          action={
            <Button onClick={() => openAuth('login')} className="bg-[#1F2937] hover:bg-[#111827] text-white">
              Go to login
            </Button>
          }
        />
      </div>
    )
  }

  if (booting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F8F6]" role="status" aria-label="Loading dashboard">
        <Loader2 className="size-8 animate-spin text-[#9A7B5B]" />
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F8F8F6] px-4">
        <header className="flex items-center justify-between py-4">
          <button
            type="button"
            onClick={() => setView('marketing')}
            aria-label="Back to home page"
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to home
          </button>
          <Logo size="sm" />
        </header>
        <div className="flex flex-1 items-center justify-center pb-24">
          <EmptyState
            icon={Plus}
            title="No events yet"
            description="Create your first event to start collecting RSVPs, managing guests and sending invitations."
            action={
              <Button onClick={() => setView('onboarding')} className="bg-[#1F2937] hover:bg-[#111827] text-white">
                Create your first event
              </Button>
            }
          />
        </div>
      </div>
    )
  }

  const statusBadge = currentEvent?.status === 'published' ? 'Published' : currentEvent?.status === 'draft' ? 'Draft' : currentEvent?.status

  return (
    <div className="min-h-screen bg-[#F8F8F6]">
      {/* ------- Top bar ------- */}
      <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur">
        <div className="flex h-14 items-center gap-2 px-3 sm:px-5">
          {/* Logo */}
          <button
            type="button"
            onClick={() => setView('marketing')}
            aria-label="Back to home page"
            className="flex items-center gap-2 rounded-md px-1.5 py-1 transition-colors hover:bg-accent"
          >
            <span className="flex size-7 items-center justify-center rounded-full bg-[#1F2937] font-heading text-sm font-semibold text-white">
              R
            </span>
            <span className="hidden font-heading text-lg font-semibold tracking-tight text-foreground sm:block">
              Online RSVP
            </span>
          </button>

          <div className="mx-auto flex items-center gap-2">
            {/* Event switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="max-w-[180px] gap-2 sm:max-w-xs"
                  aria-label="Switch event"
                >
                  <span className="truncate">{currentEvent?.name ?? 'Select event'}</span>
                  <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuLabel>Your events</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-72 overflow-y-auto scrollbar-thin">
                  {events.map((ev) => (
                    <DropdownMenuItem
                      key={ev.id}
                      onClick={() => selectEvent(ev)}
                      className="cursor-pointer gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{ev.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(ev as EventSummary).guestCount !== undefined
                            ? `${(ev as EventSummary).guestCount} guests`
                            : ev.type}
                        </p>
                      </div>
                      {currentEvent?.id === ev.id ? (
                        <Badge variant="secondary" className="ml-auto shrink-0">
                          Active
                        </Badge>
                      ) : null}
                    </DropdownMenuItem>
                  ))}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setView('onboarding')} className="cursor-pointer gap-2">
                  <Plus className="size-4" aria-hidden="true" />
                  New event
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {statusBadge && currentEvent ? (
              <Badge
                variant="outline"
                className={cn(
                  'hidden shrink-0 border-transparent md:inline-flex',
                  currentEvent.status === 'published' && 'bg-[#7C8A6E1A] text-[#7C8A6E]',
                  currentEvent.status === 'draft' && 'bg-secondary text-muted-foreground'
                )}
              >
                {statusBadge}
              </Badge>
            ) : null}
          </div>

          <div className="flex items-center gap-1">
            {/* Notifications */}
            <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}>
                  <Bell className="size-4.5" aria-hidden="true" />
                  {unreadCount > 0 ? (
                    <span aria-hidden="true" className="absolute right-2 top-2 size-2 rounded-full bg-[#B3543F]" />
                  ) : null}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between px-2 py-1.5">
                  <p className="text-sm font-semibold">Notifications</p>
                  {unreadCount > 0 ? (
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="text-xs font-medium text-[#9A7B5B] hover:underline"
                    >
                      Mark all read
                    </button>
                  ) : null}
                </div>
                <DropdownMenuSeparator />
                <div className="max-h-80 overflow-y-auto scrollbar-thin">
                  {notifications.length === 0 ? (
                    <p className="px-3 py-8 text-center text-sm text-muted-foreground">No notifications yet</p>
                  ) : (
                    notifications.map((n) => (
                      <DropdownMenuItem key={n.id} className="cursor-pointer gap-2.5 py-2.5" onSelect={(e) => e.preventDefault()}>
                        <span
                          aria-hidden="true"
                          className={cn('mt-1.5 size-2 shrink-0 rounded-full', n.read ? 'bg-transparent' : 'bg-[#9A7B5B]')}
                        />
                        <div className="min-w-0">
                          <p className={cn('truncate text-sm', !n.read && 'font-semibold')}>{n.title}</p>
                          {n.body ? <p className="line-clamp-2 text-xs text-muted-foreground">{n.body}</p> : null}
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-1.5" aria-label="Account menu">
                  <Avatar className="size-7">
                    <AvatarFallback className="bg-[#9A7B5B] text-xs font-semibold text-white">
                      {initials(user.name || user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="hidden size-3.5 text-muted-foreground sm:block" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel>
                  <p className="text-sm font-semibold">{user.name}</p>
                  <p className="text-xs font-normal text-muted-foreground">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer gap-2"
                  disabled={!currentEvent}
                  onClick={() => currentEvent && openPublic(currentEvent.slug)}
                >
                  <ExternalLink className="size-4" aria-hidden="true" />
                  View public site
                </DropdownMenuItem>
                {user.role === 'admin' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer gap-2"
                      onClick={() => useApp.getState().setView('admin')}
                    >
                      <ShieldCheck className="size-4" aria-hidden="true" />
                      Platform admin
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer gap-2" onClick={handleLogout}>
                  <LogOut className="size-4" aria-hidden="true" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* ------- Body ------- */}
      <div className="flex">
        {/* Desktop sidebar */}
        <nav
          aria-label="Dashboard sections"
          className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 flex-col gap-1 overflow-y-auto border-r border-border bg-white p-3 scrollbar-thin md:flex"
        >
          {NAV_ITEMS.map(({ tab, label, icon: Icon }) => (
            <button
              key={tab}
              type="button"
              onClick={() => onNavClick(tab)}
              aria-current={appTab === tab ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                appTab === tab
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
              )}
            >
              <Icon className={cn('size-4.5', appTab === tab ? 'text-[#9A7B5B]' : '')} aria-hidden="true" />
              {label}
            </button>
          ))}

          <div className="mt-auto rounded-xl border border-border bg-[#F8F8F6] p-3">
            <p className="text-xs font-semibold text-foreground">{currentEvent?.name}</p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              onlinersvp.com/{currentEvent?.slug ?? ''}
            </p>
            {currentEvent ? (
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full gap-1.5"
                onClick={() => openPublic(currentEvent.slug)}
              >
                <ExternalLink className="size-3.5" aria-hidden="true" />
                View site
              </Button>
            ) : null}
          </div>
        </nav>

        {/* Content */}
        <main className="min-w-0 flex-1 px-4 py-6 pb-24 sm:px-6 md:px-8 md:pb-10">
          <div key={appTab} className="mx-auto max-w-6xl animate-float-in">
            {renderTab()}
          </div>
        </main>
      </div>

      {/* ------- Mobile bottom nav ------- */}
      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 backdrop-blur md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="grid grid-cols-5">
          {MOBILE_MAIN.map(({ tab, label, icon: Icon }) => (
            <button
              key={tab}
              type="button"
              onClick={() => onNavClick(tab)}
              aria-label={label}
              aria-current={appTab === tab ? 'page' : undefined}
              className={cn(
                'flex min-h-[56px] flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors',
                appTab === tab ? 'text-[#9A7B5B]' : 'text-muted-foreground'
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              {label}
            </button>
          ))}
          <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="More sections"
                className={cn(
                  'flex min-h-[56px] flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors',
                  MOBILE_MORE.some((m) => m.tab === appTab) ? 'text-[#9A7B5B]' : 'text-muted-foreground'
                )}
              >
                <MoreHorizontal className="size-5" aria-hidden="true" />
                More
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl">
              <SheetHeader className="pb-2">
                <SheetTitle>More sections</SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-3 gap-2 pb-6">
                {MOBILE_MORE.map(({ tab, label, icon: Icon }) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      onNavClick(tab)
                      setMoreOpen(false)
                    }}
                    className={cn(
                      'flex min-h-[84px] flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card px-2 text-xs font-medium transition-colors',
                      appTab === tab ? 'border-[#9A7B5B] bg-accent' : 'hover:bg-accent/60'
                    )}
                  >
                    <Icon className="size-5 text-[#9A7B5B]" aria-hidden="true" />
                    {label}
                  </button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </div>
  )
}

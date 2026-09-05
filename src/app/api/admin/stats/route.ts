import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser, unauthorized } from '@/lib/server'

export async function GET() {
  const user = await getSessionUser()
  if (!user || user.role !== 'admin') return unauthorized()

  const [users, events, rsvps, payments, templates, recentUsers, recentEvents] = await Promise.all([
    db.user.count(),
    db.event.count(),
    db.rsvpResponse.count({ where: { attending: true } }),
    db.payment.aggregate({ _sum: { amount: true }, _count: true }),
    db.template.count(),
    db.user.findMany({ orderBy: { createdAt: 'desc' }, take: 6, select: { id: true, name: true, email: true, createdAt: true, role: true } }),
    db.event.findMany({ orderBy: { createdAt: 'desc' }, take: 6, include: { _count: { select: { guests: true } } } }),
  ])

  // 12-week signup + event trend
  const now = Date.now()
  const WEEK = 7 * 24 * 60 * 60 * 1000
  const allUsers = await db.user.findMany({ select: { createdAt: true } })
  const allEvents = await db.event.findMany({ select: { createdAt: true } })
  const trend: { week: string; users: number; events: number }[] = []
  for (let w = 11; w >= 0; w--) {
    const start = new Date(now - (w + 1) * WEEK)
    const end = new Date(now - w * WEEK)
    trend.push({
      week: start.toISOString().slice(0, 10),
      users: allUsers.filter((u) => u.createdAt >= start && u.createdAt < end).length,
      events: allEvents.filter((e) => e.createdAt >= start && e.createdAt < end).length,
    })
  }

  return NextResponse.json({
    stats: {
      users,
      events,
      publishedEvents: await db.event.count({ where: { status: 'published' } }),
      rsvps,
      revenue: payments._sum.amount ?? 0,
      paymentsCount: payments._count,
      templates,
      emailsSent: 1284370, // platform-wide simulated counter
      activeDomains: 142,
      storageGb: 86.4,
    },
    recentUsers,
    recentEvents: recentEvents.map((e) => ({ ...e, guestCount: e._count.guests })),
    trend,
  })
}

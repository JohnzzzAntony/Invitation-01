import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser, notFound, requireEventOwner, unauthorized } from '@/lib/server'
import type { EventStats } from '@/lib/types'

type Ctx = { params: Promise<{ id: string }> }

const DAY = 24 * 60 * 60 * 1000

export async function GET(_req: NextRequest, ctx: Ctx) {
  const user = await getSessionUser()
  if (!user) return unauthorized()
  const { id } = await ctx.params
  const event = await requireEventOwner(id, user.id)
  if (!event) return notFound('Event not found')

  const [guests, responses, campaigns, payments] = await Promise.all([
    db.guest.findMany({ where: { eventId: id } }),
    db.rsvpResponse.findMany({ where: { eventId: id }, orderBy: { createdAt: 'asc' } }),
    db.campaign.findMany({ where: { eventId: id } }),
    db.payment.findMany({ where: { eventId: id } }),
  ])

  const attending = guests.filter((g) => g.status === 'attending').length
  const declined = guests.filter((g) => g.status === 'declined').length
  const pending = guests.filter((g) => g.status === 'pending').length
  const totalAttendees = guests.filter((g) => g.status === 'attending').reduce((s, g) => s + g.partySize, 0)

  // Response trend over the last 30 days
  const now = Date.now()
  const trend: { date: string; count: number }[] = []
  for (let d = 29; d >= 0; d--) {
    const dayStart = new Date(now - d * DAY)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(dayStart.getTime() + DAY)
    const count = responses.filter((r) => r.createdAt >= dayStart && r.createdAt < dayEnd).length
    trend.push({ date: dayStart.toISOString().slice(0, 10), count })
  }

  const emails = campaigns.reduce(
    (acc, c) => ({
      sent: acc.sent + c.sentCount,
      opened: acc.opened + c.openedCount,
      clicked: acc.clicked + c.clickedCount,
    }),
    { sent: 0, opened: 0, clicked: 0 }
  )

  const stats: EventStats = {
    totalGuests: guests.length,
    attending,
    declined,
    pending,
    rsvpRate: guests.length ? Math.round(((attending + declined) / guests.length) * 100) : 0,
    totalAttendees,
    invited: guests.filter((g) => g.invited).length,
    trend,
    emails,
    paymentsTotal: payments.reduce((s, p) => s + p.amount, 0),
    paymentsCount: payments.length,
    // Deterministic simulated page views for the demo dashboard
    pageViews: guests.length * 2 + 137 + (event.name.length % 23),
  }

  return NextResponse.json({ stats })
}

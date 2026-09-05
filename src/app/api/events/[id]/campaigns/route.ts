import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser, notFound, requireEventOwner, unauthorized } from '@/lib/server'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, ctx: Ctx) {
  const user = await getSessionUser()
  if (!user) return unauthorized()
  const { id } = await ctx.params
  const event = await requireEventOwner(id, user.id)
  if (!event) return notFound('Event not found')
  const campaigns = await db.campaign.findMany({ where: { eventId: id }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ campaigns })
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const user = await getSessionUser()
  if (!user) return unauthorized()
  const { id } = await ctx.params
  const event = await requireEventOwner(id, user.id)
  if (!event) return notFound('Event not found')
  try {
    const body = await req.json()
    const name = String(body.name ?? '').trim()
    if (!name) return NextResponse.json({ error: 'Campaign name is required' }, { status: 400 })

    const send = body.send === true
    const scheduled = body.scheduledAt ? new Date(body.scheduledAt) : null
    if (send) {
      // "Send now": mark sent, simulate delivery to all invited guests with tracking stats
      const total = await db.guest.count({ where: { eventId: id } })
      const opened = Math.floor(total * (0.82 + Math.random() * 0.1))
      const clicked = Math.floor(opened * (0.84 + Math.random() * 0.1))
      const campaign = await db.campaign.create({
        data: {
          eventId: id,
          name,
          type: String(body.type ?? 'custom'),
          subject: String(body.subject ?? name),
          body: String(body.body ?? ''),
          status: 'sent',
          sentAt: new Date(),
          sentCount: total,
          openedCount: opened,
          clickedCount: clicked,
        },
      })
      await db.guest.updateMany({ where: { eventId: id }, data: { invited: true, invitedAt: new Date() } })
      return NextResponse.json({ campaign }, { status: 201 })
    }

    const campaign = await db.campaign.create({
      data: {
        eventId: id,
        name,
        type: String(body.type ?? 'custom'),
        subject: String(body.subject ?? name),
        body: String(body.body ?? ''),
        status: scheduled ? 'scheduled' : 'draft',
        scheduledAt: scheduled,
      },
    })
    return NextResponse.json({ campaign }, { status: 201 })
  } catch (e) {
    console.error('create campaign error', e)
    return NextResponse.json({ error: 'Could not create campaign' }, { status: 500 })
  }
}

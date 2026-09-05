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
  const subEvents = await db.subEvent.findMany({ where: { eventId: id }, orderBy: { date: 'asc' } })
  return NextResponse.json({
    subEvents: subEvents.map((s) => ({ ...s, groupIds: JSON.parse(s.groupIds || '[]') })),
  })
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
    if (!name) return NextResponse.json({ error: 'Sub-event name is required' }, { status: 400 })
    const subEvent = await db.subEvent.create({
      data: {
        eventId: id,
        name,
        date: String(body.date ?? ''),
        startTime: String(body.startTime ?? ''),
        endTime: body.endTime ? String(body.endTime) : null,
        venue: body.venue ? String(body.venue) : null,
        description: body.description ? String(body.description) : null,
        dressCode: body.dressCode ? String(body.dressCode) : null,
        rsvpRequired: body.rsvpRequired !== false,
        groupIds: JSON.stringify(Array.isArray(body.groupIds) ? body.groupIds : []),
      },
    })
    return NextResponse.json({ subEvent: { ...subEvent, groupIds: JSON.parse(subEvent.groupIds || '[]') } }, { status: 201 })
  } catch (e) {
    console.error('create sub-event error', e)
    return NextResponse.json({ error: 'Could not create sub-event' }, { status: 500 })
  }
}

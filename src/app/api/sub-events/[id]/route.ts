import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser, notFound, unauthorized } from '@/lib/server'

type Ctx = { params: Promise<{ id: string }> }

async function getOwnedSubEvent(subEventId: string, userId: string) {
  const subEvent = await db.subEvent.findUnique({ where: { id: subEventId }, include: { event: true } })
  if (!subEvent) return { error: notFound('Sub-event not found') as Response, subEvent: null }
  if (subEvent.event.ownerId !== userId) return { error: unauthorized() as Response, subEvent: null }
  return { error: null, subEvent }
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const user = await getSessionUser()
  if (!user) return unauthorized()
  const { id } = await ctx.params
  const { error, subEvent } = await getOwnedSubEvent(id, user.id)
  if (error || !subEvent) return error ?? notFound()
  try {
    const body = await req.json()
    const data: Record<string, unknown> = {}
    for (const f of ['name', 'date', 'startTime'] as const) {
      if (body[f] !== undefined) data[f] = String(body[f])
    }
    for (const f of ['endTime', 'venue', 'description', 'dressCode'] as const) {
      if (body[f] !== undefined) data[f] = body[f] ? String(body[f]) : null
    }
    if (body.rsvpRequired !== undefined) data.rsvpRequired = Boolean(body.rsvpRequired)
    if (body.groupIds !== undefined) data.groupIds = JSON.stringify(body.groupIds)
    const updated = await db.subEvent.update({ where: { id }, data })
    return NextResponse.json({ subEvent: { ...updated, groupIds: JSON.parse(updated.groupIds || '[]') } })
  } catch (e) {
    console.error('update sub-event error', e)
    return NextResponse.json({ error: 'Could not update sub-event' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const user = await getSessionUser()
  if (!user) return unauthorized()
  const { id } = await ctx.params
  const { error, subEvent } = await getOwnedSubEvent(id, user.id)
  if (error || !subEvent) return error ?? notFound()
  await db.subEvent.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { badRequest, getSessionUser, notFound, requireEventOwner, serializeEvent, unauthorized } from '@/lib/server'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, ctx: Ctx) {
  const user = await getSessionUser()
  if (!user) return unauthorized()
  const { id } = await ctx.params
  const event = await db.event.findUnique({ where: { id }, include: { _count: { select: { guests: true } } } })
  if (!event) return notFound('Event not found')
  if (event.ownerId !== user.id && user.role !== 'admin') return unauthorized()
  return NextResponse.json({ event: { ...serializeEvent(event), guestCount: event._count.guests } })
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const user = await getSessionUser()
  if (!user) return unauthorized()
  const { id } = await ctx.params
  const event = await requireEventOwner(id, user.id)
  if (!event) return notFound('Event not found')
  try {
    const body = await req.json()
    const data: Record<string, unknown> = {}
    const stringFields = [
      'name', 'eventDate', 'startTime', 'endTime', 'timezone', 'venue', 'address',
      'description', 'hostNames', 'contactEmail', 'contactPhone',
    ] as const
    for (const f of stringFields) {
      if (body[f] !== undefined) data[f] = String(body[f])
    }
    if (body.slug !== undefined) data.slug = String(body.slug).trim()
    if (body.status !== undefined) data.status = String(body.status)
    if (body.theme !== undefined) data.theme = JSON.stringify(body.theme)
    if (body.sections !== undefined) data.sections = JSON.stringify(body.sections)
    if (body.settings !== undefined) data.settings = JSON.stringify(body.settings)
    if (body.gallery !== undefined) data.gallery = JSON.stringify(body.gallery)
    if (body.accommodations !== undefined) data.accommodations = JSON.stringify(body.accommodations)
    if (body.registryItems !== undefined) data.registryItems = JSON.stringify(body.registryItems)

    if (data.name === '') return badRequest('Event name cannot be empty')
    const updated = await db.event.update({ where: { id }, data })
    return NextResponse.json({ event: serializeEvent(updated) })
  } catch (e) {
    console.error('update event error', e)
    return NextResponse.json({ error: 'Could not update event' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const user = await getSessionUser()
  if (!user) return unauthorized()
  const { id } = await ctx.params
  const event = await requireEventOwner(id, user.id)
  if (!event) return notFound('Event not found')
  await db.event.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

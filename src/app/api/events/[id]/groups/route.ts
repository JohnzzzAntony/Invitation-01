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
  const groups = await db.guestGroup.findMany({
    where: { eventId: id },
    include: { _count: { select: { guests: true } } },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json({
    groups: groups.map((g) => ({
      id: g.id,
      eventId: g.eventId,
      name: g.name,
      color: g.color,
      description: g.description,
      guestCount: g._count.guests,
    })),
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
    if (!name) return NextResponse.json({ error: 'Group name is required' }, { status: 400 })
    const group = await db.guestGroup.create({
      data: {
        eventId: id,
        name,
        color: String(body.color ?? '#9A7B5B'),
        description: String(body.description ?? ''),
      },
    })
    return NextResponse.json({ group }, { status: 201 })
  } catch (e) {
    console.error('create group error', e)
    return NextResponse.json({ error: 'Could not create group' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateToken } from '@/lib/auth'
import { getSessionUser, notFound, serializeGuest, unauthorized } from '@/lib/server'

type Ctx = { params: Promise<{ id: string }> }

async function getOwnedGuest(guestId: string, userId: string) {
  const guest = await db.guest.findUnique({ where: { id: guestId }, include: { event: true, group: true } })
  if (!guest) return { error: notFound('Guest not found') as Response, guest: null }
  if (guest.event.ownerId !== userId) return { error: unauthorized() as Response, guest: null }
  return { error: null, guest }
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const user = await getSessionUser()
  if (!user) return unauthorized()
  const { id } = await ctx.params
  const { error, guest } = await getOwnedGuest(id, user.id)
  if (error || !guest) return error ?? notFound()
  try {
    const body = await req.json()
    const data: Record<string, unknown> = {}
    if (body.name !== undefined) data.name = String(body.name)
    if (body.email !== undefined) data.email = String(body.email)
    if (body.status !== undefined) data.status = String(body.status)
    if (body.partySize !== undefined) data.partySize = Math.max(0, Number(body.partySize))
    if (body.maxParty !== undefined) data.maxParty = Math.max(1, Number(body.maxParty))
    if (body.meal !== undefined) data.meal = body.meal ? String(body.meal) : null
    if (body.dietary !== undefined) data.dietary = body.dietary ? String(body.dietary) : null
    if (body.notes !== undefined) data.notes = body.notes ? String(body.notes) : null
    if (body.groupId !== undefined) data.groupId = body.groupId ? String(body.groupId) : null
    if (body.regenerateToken === true) data.token = generateToken()
    const updated = await db.guest.update({ where: { id }, data, include: { group: true } })
    return NextResponse.json({ guest: serializeGuest(updated) })
  } catch (e) {
    console.error('update guest error', e)
    return NextResponse.json({ error: 'Could not update guest' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const user = await getSessionUser()
  if (!user) return unauthorized()
  const { id } = await ctx.params
  const { error, guest } = await getOwnedGuest(id, user.id)
  if (error || !guest) return error ?? notFound()
  await db.guest.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

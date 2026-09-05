import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser, notFound, unauthorized } from '@/lib/server'

type Ctx = { params: Promise<{ id: string }> }

async function getOwnedGroup(groupId: string, userId: string) {
  const group = await db.guestGroup.findUnique({ where: { id: groupId }, include: { event: true } })
  if (!group) return { error: notFound('Group not found') as Response, group: null }
  if (group.event.ownerId !== userId) return { error: unauthorized() as Response, group: null }
  return { error: null, group }
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const user = await getSessionUser()
  if (!user) return unauthorized()
  const { id } = await ctx.params
  const { error, group } = await getOwnedGroup(id, user.id)
  if (error || !group) return error ?? notFound()
  try {
    const body = await req.json()
    const data: Record<string, unknown> = {}
    if (body.name !== undefined) data.name = String(body.name)
    if (body.color !== undefined) data.color = String(body.color)
    if (body.description !== undefined) data.description = String(body.description)
    const updated = await db.guestGroup.update({ where: { id }, data })
    return NextResponse.json({ group: updated })
  } catch (e) {
    console.error('update group error', e)
    return NextResponse.json({ error: 'Could not update group' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const user = await getSessionUser()
  if (!user) return unauthorized()
  const { id } = await ctx.params
  const { error, group } = await getOwnedGroup(id, user.id)
  if (error || !group) return error ?? notFound()
  await db.guestGroup.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

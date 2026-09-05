import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser, notFound, requireEventOwner, serializeEvent, unauthorized } from '@/lib/server'

type Ctx = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, ctx: Ctx) {
  const user = await getSessionUser()
  if (!user) return unauthorized()
  const { id } = await ctx.params
  const event = await requireEventOwner(id, user.id)
  if (!event) return notFound('Event not found')
  try {
    const { action } = await req.json()
    let status = event.status
    if (action === 'publish') status = 'published'
    else if (action === 'unpublish') status = 'draft'
    else if (action === 'pause') status = 'paused'
    else if (action === 'archive') status = 'archived'
    else return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

    const updated = await db.event.update({ where: { id }, data: { status } })
    return NextResponse.json({ event: serializeEvent(updated) })
  } catch (e) {
    console.error('publish error', e)
    return NextResponse.json({ error: 'Could not change publish state' }, { status: 500 })
  }
}

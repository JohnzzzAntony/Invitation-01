import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser, notFound, unauthorized } from '@/lib/server'

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const user = await getSessionUser()
  if (!user) return unauthorized()
  const { id } = await ctx.params
  const campaign = await db.campaign.findUnique({ where: { id }, include: { event: true } })
  if (!campaign) return notFound('Campaign not found')
  if (campaign.event.ownerId !== user.id) return unauthorized()
  try {
    const body = await req.json()
    const data: Record<string, unknown> = {}
    if (body.action === 'send') {
      const total = await db.guest.count({ where: { eventId: campaign.eventId } })
      const opened = Math.floor(total * (0.82 + Math.random() * 0.1))
      const clicked = Math.floor(opened * (0.84 + Math.random() * 0.1))
      data.status = 'sent'
      data.sentAt = new Date()
      data.sentCount = total
      data.openedCount = opened
      data.clickedCount = clicked
      await db.guest.updateMany({ where: { eventId: campaign.eventId }, data: { invited: true, invitedAt: new Date() } })
    } else if (body.action === 'schedule' && body.scheduledAt) {
      data.status = 'scheduled'
      data.scheduledAt = new Date(body.scheduledAt)
    } else if (body.action === 'cancel') {
      data.status = 'draft'
      data.scheduledAt = null
    }
    if (body.name !== undefined) data.name = String(body.name)
    if (body.subject !== undefined) data.subject = String(body.subject)
    if (body.body !== undefined) data.body = String(body.body)
    const updated = await db.campaign.update({ where: { id }, data })
    return NextResponse.json({ campaign: updated })
  } catch (e) {
    console.error('update campaign error', e)
    return NextResponse.json({ error: 'Could not update campaign' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const user = await getSessionUser()
  if (!user) return unauthorized()
  const { id } = await ctx.params
  const campaign = await db.campaign.findUnique({ where: { id }, include: { event: true } })
  if (!campaign) return notFound('Campaign not found')
  if (campaign.event.ownerId !== user.id) return unauthorized()
  await db.campaign.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

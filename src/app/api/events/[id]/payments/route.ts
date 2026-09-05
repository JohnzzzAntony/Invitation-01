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
  const payments = await db.payment.findMany({ where: { eventId: id }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ payments })
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const user = await getSessionUser()
  if (!user) return unauthorized()
  const { id } = await ctx.params
  const event = await requireEventOwner(id, user.id)
  if (!event) return notFound('Event not found')
  try {
    const body = await req.json()
    const payment = await db.payment.create({
      data: {
        eventId: id,
        guestName: String(body.guestName ?? 'Anonymous'),
        type: String(body.type ?? 'donation'),
        amount: Math.max(0, Number(body.amount ?? 0)),
        status: 'succeeded',
        method: 'stripe',
      },
    })
    return NextResponse.json({ payment }, { status: 201 })
  } catch (e) {
    console.error('create payment error', e)
    return NextResponse.json({ error: 'Could not create payment' }, { status: 500 })
  }
}

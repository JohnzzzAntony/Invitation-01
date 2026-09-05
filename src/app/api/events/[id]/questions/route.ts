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
  const questions = await db.rsvpQuestion.findMany({ where: { eventId: id }, orderBy: { order: 'asc' } })
  return NextResponse.json({
    questions: questions.map((q) => ({
      id: q.id,
      eventId: q.eventId,
      label: q.label,
      type: q.type,
      required: q.required,
      options: JSON.parse(q.options || '[]'),
      showIfAttending: q.showIfAttending,
      order: q.order,
    })),
  })
}

// Bulk save (replace-all semantics keeps ordering simple)
export async function PUT(req: NextRequest, ctx: Ctx) {
  const user = await getSessionUser()
  if (!user) return unauthorized()
  const { id } = await ctx.params
  const event = await requireEventOwner(id, user.id)
  if (!event) return notFound('Event not found')
  try {
    const { questions } = await req.json()
    if (!Array.isArray(questions)) return NextResponse.json({ error: 'questions must be an array' }, { status: 400 })
    await db.rsvpQuestion.deleteMany({ where: { eventId: id } })
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.label || !String(q.label).trim()) continue
      await db.rsvpQuestion.create({
        data: {
          eventId: id,
          label: String(q.label).trim(),
          type: String(q.type ?? 'text'),
          required: Boolean(q.required),
          options: JSON.stringify(Array.isArray(q.options) ? q.options : []),
          showIfAttending: Boolean(q.showIfAttending),
          order: i,
        },
      })
    }
    const saved = await db.rsvpQuestion.findMany({ where: { eventId: id }, orderBy: { order: 'asc' } })
    return NextResponse.json({
      questions: saved.map((q) => ({
        id: q.id,
        eventId: q.eventId,
        label: q.label,
        type: q.type,
        required: q.required,
        options: JSON.parse(q.options || '[]'),
        showIfAttending: q.showIfAttending,
        order: q.order,
      })),
    })
  } catch (e) {
    console.error('save questions error', e)
    return NextResponse.json({ error: 'Could not save questions' }, { status: 500 })
  }
}

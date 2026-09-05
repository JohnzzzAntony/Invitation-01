import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { parseJson, serializeEvent } from '@/lib/server'
import { DEFAULT_SETTINGS, DEFAULT_THEME } from '@/lib/types'
import type { EventRecord, QuestionRecord, SubEventRecord } from '@/lib/types'

type Ctx = { params: Promise<{ slug: string }> }

// Public event data for rendering the public website (no auth).
export async function GET(_req: NextRequest, ctx: Ctx) {
  const { slug } = await ctx.params
  const event = await db.event.findUnique({ where: { slug } })
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

  const subEvents = await db.subEvent.findMany({ where: { eventId: event.id }, orderBy: { date: 'asc' } })
  const questions = await db.rsvpQuestion.findMany({ where: { eventId: event.id }, orderBy: { order: 'asc' } })

  const payload: EventRecord & { subEvents: SubEventRecord[]; questions: QuestionRecord[] } = {
    ...serializeEvent(event),
    theme: { ...DEFAULT_THEME, ...parseJson(event.theme, {}) },
    settings: { ...DEFAULT_SETTINGS, ...parseJson(event.settings, {}) },
    subEvents: subEvents.map((s) => ({
      id: s.id,
      eventId: s.eventId,
      name: s.name,
      date: s.date,
      startTime: s.startTime,
      endTime: s.endTime,
      venue: s.venue,
      description: s.description,
      dressCode: s.dressCode,
      rsvpRequired: s.rsvpRequired,
      groupIds: parseJson<string[]>(s.groupIds, []),
    })),
    questions: questions.map((q) => ({
      id: q.id,
      eventId: q.eventId,
      label: q.label,
      type: q.type as QuestionRecord['type'],
      required: q.required,
      options: parseJson<string[]>(q.options, []),
      showIfAttending: q.showIfAttending,
      order: q.order,
    })),
  }
  return NextResponse.json({ event: payload })
}

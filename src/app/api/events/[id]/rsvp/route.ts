import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { badRequest, notFound, parseJson } from '@/lib/server'
import { DEFAULT_SETTINGS, DEFAULT_THEME } from '@/lib/types'
import type { QuestionRecord, SubEventRecord } from '@/lib/types'

type Ctx = { params: Promise<{ id: string }> }

function eventBasics(event: {
  id: string; name: string; slug: string; eventDate: string; startTime: string; endTime: string
  venue: string; address: string; hostNames: string; timezone: string; settings: string; theme: string
}) {
  return {
    id: event.id,
    name: event.name,
    slug: event.slug,
    eventDate: event.eventDate,
    startTime: event.startTime,
    endTime: event.endTime,
    venue: event.venue,
    address: event.address,
    hostNames: event.hostNames,
    timezone: event.timezone,
    settings: { ...DEFAULT_SETTINGS, ...parseJson(event.settings, {}) },
    theme: { ...DEFAULT_THEME, ...parseJson(event.theme, {}) },
  }
}

// GET: fetch RSVP context — via guest token (?token=), or event defaults
export async function GET(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const event = await db.event.findUnique({ where: { id } })
  if (!event) return notFound('Event not found')

  const token = req.nextUrl.searchParams.get('token')
  const questions = await db.rsvpQuestion.findMany({ where: { eventId: id }, orderBy: { order: 'asc' } })
  const allSubEvents = await db.subEvent.findMany({ where: { eventId: id }, orderBy: { date: 'asc' } })
  const questionRecords: QuestionRecord[] = questions.map((q) => ({
    id: q.id,
    eventId: q.eventId,
    label: q.label,
    type: q.type as QuestionRecord['type'],
    required: q.required,
    options: parseJson<string[]>(q.options, []),
    showIfAttending: q.showIfAttending,
    order: q.order,
  }))

  const subEvents: SubEventRecord[] = allSubEvents.map((s) => ({
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
  }))

  if (token) {
    const guest = await db.guest.findUnique({ where: { token }, include: { group: true } })
    if (!guest || guest.eventId !== id) return notFound('Invitation not found')
    // Filter sub-events visible to this guest's group (conditional guest logic)
    const visibleSubEvents = subEvents.filter(
      (s) => !guest.groupId || s.groupIds.length === 0 || s.groupIds.includes(guest.groupId)
    )
    return NextResponse.json({
      guest: {
        id: guest.id,
        name: guest.name,
        email: guest.email,
        status: guest.status,
        partySize: guest.partySize,
        maxParty: guest.maxParty,
        meal: guest.meal,
        dietary: guest.dietary,
        groupName: guest.group?.name ?? null,
      },
      event: eventBasics(event),
      questions: questionRecords,
      subEvents: visibleSubEvents,
    })
  }

  return NextResponse.json({ guest: null, event: eventBasics(event), questions: questionRecords, subEvents })
}

// POST: submit an RSVP
export async function POST(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const event = await db.event.findUnique({ where: { id } })
  if (!event) return notFound('Event not found')

  try {
    const body = await req.json()
    const attending = Boolean(body.attending)
    const token = body.token ? String(body.token) : null
    const partySize = Math.max(attending ? 1 : 0, Number(body.partySize ?? 1))

    let guest = token ? await db.guest.findUnique({ where: { token } }) : null
    if (guest && guest.eventId !== id) guest = null

    if (!guest) {
      // Public / guestlist mode: match by email or create walk-in guest
      const email = body.email ? String(body.email).trim().toLowerCase() : ''
      const name = String(body.name ?? '').trim()
      if (!name) return badRequest('Name is required')
      if (email) {
        guest = await db.guest.findFirst({ where: { eventId: id, email } })
      }
      if (!guest) {
        guest = await db.guest.create({
          data: {
            eventId: id,
            name,
            email: email || `walkin.${Date.now()}@example.com`,
            token: Math.random().toString(36).slice(2) + Date.now().toString(36),
          },
        })
      }
    }

    // Update guest state
    const updatedGuest = await db.guest.update({
      where: { id: guest.id },
      data: {
        status: attending ? 'attending' : 'declined',
        partySize: attending ? Math.min(partySize, guest.maxParty > 0 ? guest.maxParty : 10) : 0,
        meal: body.meal ? String(body.meal) : guest.meal,
        dietary: body.dietary ? String(body.dietary) : guest.dietary,
        invited: true,
        respondedAt: new Date(),
      },
    })

    // Upsert response
    const existing = await db.rsvpResponse.findFirst({ where: { eventId: id, guestId: guest.id } })
    const answersJson = JSON.stringify(body.answers ?? {})
    if (existing) {
      await db.rsvpResponse.update({ where: { id: existing.id }, data: { attending, partySize, answers: answersJson } })
    } else {
      await db.rsvpResponse.create({ data: { eventId: id, guestId: guest.id, attending, partySize, answers: answersJson } })
    }

    // Notify the event owner
    await db.notification.create({
      data: {
        userId: event.ownerId,
        title: attending ? 'New RSVP' : 'RSVP declined',
        body: attending
          ? `${updatedGuest.name} confirmed attendance with ${partySize} guest${partySize === 1 ? '' : 's'}.`
          : `${updatedGuest.name} unfortunately declined.`,
        type: 'rsvp',
      },
    })

    return NextResponse.json({
      ok: true,
      guest: { name: updatedGuest.name, status: updatedGuest.status, partySize: updatedGuest.partySize },
    })
  } catch (e) {
    console.error('rsvp submit error', e)
    return NextResponse.json({ error: 'Could not submit RSVP' }, { status: 500 })
  }
}

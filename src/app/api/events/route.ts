import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser, parseJson, serializeEvent, unauthorized } from '@/lib/server'
import { generateSlug } from '@/lib/auth'
import { DEFAULT_SETTINGS, DEFAULT_THEME } from '@/lib/types'
import type { EventRecord } from '@/lib/types'

export async function GET() {
  const user = await getSessionUser()
  if (!user) return unauthorized()
  const events = await db.event.findMany({
    where: { ownerId: user.id },
    orderBy: { updatedAt: 'desc' },
    include: { _count: { select: { guests: true } } },
  })
  const payload = events.map((e) => ({
    ...serializeEvent(e),
    guestCount: e._count.guests,
  }))
  return NextResponse.json({ events: payload })
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return unauthorized()
  try {
    const body = await req.json()
    const name = String(body.name ?? '').trim()
    if (!name) return NextResponse.json({ error: 'Event name is required' }, { status: 400 })

    let theme = { ...DEFAULT_THEME }
    let sections: EventRecord['sections'] = []
    if (body.templateId) {
      const template = await db.template.findUnique({ where: { id: String(body.templateId) } })
      if (template) {
        theme = { ...DEFAULT_THEME, ...parseJson<Partial<typeof DEFAULT_THEME>>(template.theme, {}) }
        sections = parseJson<EventRecord['sections']>(template.sections, [])
      }
    }
    if (body.sections) sections = body.sections
    if (body.theme) theme = { ...theme, ...body.theme }

    const event = await db.event.create({
      data: {
        ownerId: user.id,
        name,
        slug: generateSlug(name),
        type: String(body.type ?? 'other'),
        eventDate: String(body.eventDate ?? ''),
        startTime: String(body.startTime ?? '17:00'),
        endTime: String(body.endTime ?? '23:00'),
        timezone: String(body.timezone ?? 'Asia/Dubai'),
        venue: String(body.venue ?? ''),
        address: String(body.address ?? ''),
        description: String(body.description ?? ''),
        hostNames: String(body.hostNames ?? ''),
        contactEmail: user.email,
        contactPhone: String(body.contactPhone ?? ''),
        theme: JSON.stringify(theme),
        sections: JSON.stringify(sections),
        settings: JSON.stringify({ ...DEFAULT_SETTINGS, ...(body.settings ?? {}) }),
        templateId: body.templateId ? String(body.templateId) : null,
        gallery: JSON.stringify([]),
        accommodations: JSON.stringify([]),
        registryItems: JSON.stringify([]),
      },
    })
    return NextResponse.json({ event: serializeEvent(event) }, { status: 201 })
  } catch (e) {
    console.error('create event error', e)
    return NextResponse.json({ error: 'Could not create event' }, { status: 500 })
  }
}

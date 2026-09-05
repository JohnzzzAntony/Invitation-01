import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth'
import type { EventRecord, EventSettings, EventTheme, SessionUser } from '@/lib/types'
import { DEFAULT_SETTINGS, DEFAULT_THEME } from '@/lib/types'
import type { Event, Guest, GuestGroup } from '@prisma/client'

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const store = await cookies()
    const token = store.get(SESSION_COOKIE)?.value
    if (!token) return null
    const payload = verifySessionToken(token)
    if (!payload) return null
    const user = await db.user.findUnique({ where: { id: payload.userId } })
    if (!user) return null
    return { id: user.id, name: user.name, email: user.email, role: user.role === 'admin' ? 'admin' : 'user' }
  } catch {
    return null
  }
}

export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export function notFound(message = 'Not found') {
  return NextResponse.json({ error: message }, { status: 404 })
}

export function badRequest(message = 'Bad request') {
  return NextResponse.json({ error: message }, { status: 400 })
}

export async function requireUser(): Promise<SessionUser | null> {
  return getSessionUser()
}

export async function requireEventOwner(
  eventId: string,
  userId: string
): Promise<Event | null> {
  const event = await db.event.findUnique({ where: { id: eventId } })
  if (!event) return null
  if (event.ownerId !== userId) return null
  return event
}

export function parseJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function serializeEvent(e: Event): EventRecord {
  return {
    id: e.id,
    ownerId: e.ownerId,
    name: e.name,
    slug: e.slug,
    type: e.type,
    status: e.status as EventRecord['status'],
    eventDate: e.eventDate,
    startTime: e.startTime,
    endTime: e.endTime,
    timezone: e.timezone,
    venue: e.venue,
    address: e.address,
    description: e.description,
    hostNames: e.hostNames,
    contactEmail: e.contactEmail,
    contactPhone: e.contactPhone,
    theme: { ...DEFAULT_THEME, ...parseJson<Partial<EventTheme>>(e.theme, {}) },
    sections: parseJson<EventRecord['sections']>(e.sections, []),
    settings: { ...DEFAULT_SETTINGS, ...parseJson<Partial<EventSettings>>(e.settings, {}) },
    gallery: parseJson<EventRecord['gallery']>(e.gallery, []),
    accommodations: parseJson<EventRecord['accommodations']>(e.accommodations, []),
    registryItems: parseJson<EventRecord['registryItems']>(e.registryItems, []),
    templateId: e.templateId,
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  }
}

export function serializeGuest(g: Guest & { group?: GuestGroup | null }): import('@/lib/types').GuestRecord {
  return {
    id: g.id,
    eventId: g.eventId,
    groupId: g.groupId,
    groupName: g.group?.name ?? null,
    name: g.name,
    email: g.email,
    status: g.status as import('@/lib/types').GuestStatus,
    partySize: g.partySize,
    maxParty: g.maxParty,
    meal: g.meal,
    dietary: g.dietary,
    notes: g.notes,
    token: g.token,
    invited: g.invited,
    invitedAt: g.invitedAt?.toISOString() ?? null,
    respondedAt: g.respondedAt?.toISOString() ?? null,
    createdAt: g.createdAt.toISOString(),
  }
}

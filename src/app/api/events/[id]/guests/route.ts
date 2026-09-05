import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateToken } from '@/lib/auth'
import { badRequest, getSessionUser, notFound, requireEventOwner, serializeGuest, unauthorized } from '@/lib/server'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, ctx: Ctx) {
  const user = await getSessionUser()
  if (!user) return unauthorized()
  const { id } = await ctx.params
  const event = await requireEventOwner(id, user.id)
  if (!event) return notFound('Event not found')
  const guests = await db.guest.findMany({
    where: { eventId: id },
    include: { group: true },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json({ guests: guests.map(serializeGuest) })
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const user = await getSessionUser()
  if (!user) return unauthorized()
  const { id } = await ctx.params
  const event = await requireEventOwner(id, user.id)
  if (!event) return notFound('Event not found')
  try {
    const body = await req.json()
    // Bulk import: { guests: [{name, email, group?}] }
    if (Array.isArray(body.guests)) {
      const groups = await db.guestGroup.findMany({ where: { eventId: id } })
      const created: (import('@prisma/client').Guest & { group: import('@prisma/client').GuestGroup | null })[] = []
      for (const g of body.guests) {
        if (!g.name || !g.email) continue
        const groupName = g.group ? String(g.group).trim() : ''
        const groupRec = groupName
          ? groups.find((gr) => gr.name.toLowerCase() === groupName.toLowerCase())
          : undefined
        let groupId = groupRec?.id
        if (groupName && !groupId) {
          const newGroup = await db.guestGroup.create({
            data: { eventId: id, name: groupName, color: '#9A7B5B', description: '' },
          })
          groups.push(newGroup)
          groupId = newGroup.id
        }
        created.push(
          await db.guest.create({
            data: {
              eventId: id,
              groupId: groupId ?? null,
              name: String(g.name).trim(),
              email: String(g.email).trim(),
              maxParty: Number(g.maxParty ?? 2),
              notes: g.notes ? String(g.notes) : null,
              token: generateToken(),
            },
            include: { group: true },
          })
        )
      }
      return NextResponse.json({ guests: created.map(serializeGuest) }, { status: 201 })
    }

    // Single guest
    const name = String(body.name ?? '').trim()
    const email = String(body.email ?? '').trim()
    if (!name) return badRequest('Guest name is required')
    if (!email) return badRequest('Guest email is required')
    const guest = await db.guest.create({
      data: {
        eventId: id,
        groupId: body.groupId ? String(body.groupId) : null,
        name,
        email,
        maxParty: Number(body.maxParty ?? 2),
        notes: body.notes ? String(body.notes) : null,
        token: generateToken(),
      },
      include: { group: true },
    })
    return NextResponse.json({ guest: serializeGuest(guest) }, { status: 201 })
  } catch (e) {
    console.error('create guest error', e)
    return NextResponse.json({ error: 'Could not create guest' }, { status: 500 })
  }
}

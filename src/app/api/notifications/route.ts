import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser, unauthorized } from '@/lib/server'

export async function GET() {
  const user = await getSessionUser()
  if (!user) return unauthorized()
  const notifications = await db.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 30,
  })
  return NextResponse.json({ notifications })
}

export async function PATCH() {
  const user = await getSessionUser()
  if (!user) return unauthorized()
  await db.notification.updateMany({ where: { userId: user.id }, data: { read: true } })
  return NextResponse.json({ ok: true })
}

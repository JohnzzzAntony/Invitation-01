import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { SESSION_COOKIE, createSessionToken, hashPassword } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }
    const normalized = String(email).toLowerCase().trim()
    const existing = await db.user.findUnique({ where: { email: normalized } })
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
    }
    const user = await db.user.create({
      data: { name: String(name).trim(), email: normalized, password: hashPassword(password) },
    })
    const res = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    })
    res.cookies.set(SESSION_COOKIE, createSessionToken(user.id), {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })
    return res
  } catch (e) {
    console.error('register error', e)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}

import crypto from 'crypto'

const SECRET = process.env.AUTH_SECRET || 'online-rsvp-local-dev-secret-key'

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 32).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const candidate = crypto.scryptSync(password, salt, 32).toString('hex')
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(candidate, 'hex'))
}

export function createSessionToken(userId: string): string {
  const payload = { userId, exp: Date.now() + 1000 * 60 * 60 * 24 * 30 }
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
  return `${data}.${sig}`
}

export function verifySessionToken(token: string): { userId: string } | null {
  try {
    const [data, sig] = token.split('.')
    if (!data || !sig) return null
    const expected = crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString())
    if (!payload.userId || payload.exp < Date.now()) return null
    return { userId: payload.userId }
  } catch {
    return null
  }
}

export const SESSION_COOKIE = 'orsvp_session'

export function generateToken(): string {
  return crypto.randomBytes(16).toString('hex')
}

export function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 48) || 'event'
  return `${base}-${crypto.randomBytes(3).toString('hex')}`
}

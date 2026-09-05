'use client'

// Lightweight typed fetch helpers for the SPA.
// All requests are relative (same origin, port 3000).

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export async function api<T>(
  path: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> {
  const res = await fetch(path, {
    method: options.method ?? (options.body ? 'POST' : 'GET'),
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: 'no-store',
  })
  let data: unknown = null
  try {
    data = await res.json()
  } catch {
    // no body
  }
  let message = `Request failed (${res.status})`
  if (data && typeof data === 'object' && 'error' in data) {
    const err = (data as { error: unknown }).error
    if (typeof err === 'string' && err.length > 0) message = err
  }
  if (!res.ok) {
    throw new ApiError(message, res.status)
  }
  return data as T
}

export function formatDate(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatDateShort(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatTime(t: string): string {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  if (isNaN(h)) return t
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 === 0 ? 12 : h % 12
  return `${hour}:${String(m ?? 0).padStart(2, '0')} ${suffix}`
}

export function daysUntil(dateIso: string): number {
  if (!dateIso) return 0
  const target = new Date(`${dateIso}T12:00:00`)
  const now = new Date()
  const diff = target.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export function money(amount: number): string {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

// Simple CSV export helper (client side)
export function downloadCsv(filename: string, rows: (string | number | null | undefined)[][]) {
  const escape = (v: string | number | null | undefined) => {
    const s = v == null ? '' : String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const csv = rows.map((r) => r.map(escape).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// Simple CSV parser (handles quoted fields)
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else inQuotes = false
      } else field += c
    } else if (c === '"') inQuotes = true
    else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n' || c === '\r') {
      if (field !== '' || row.length > 0) {
        row.push(field)
        rows.push(row)
        row = []
        field = ''
      }
      if (c === '\r' && text[i + 1] === '\n') i++
    } else field += c
  }
  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

// Email template variables (invitation personalization)
export const EMAIL_VARIABLES = [
  '{{guest.first_name}}',
  '{{guest.last_name}}',
  '{{guest.name}}',
  '{{event.name}}',
  '{{event.date}}',
  '{{event.venue}}',
  '{{event.rsvp_url}}',
]

export function renderEmailVars(body: string, vars: Record<string, string>): string {
  return body.replace(/\{\{(\w+)\.(\w+)\}\}/g, (match, ns, key) => {
    const v = vars[`${ns}.${key}`]
    return v ?? match
  })
}

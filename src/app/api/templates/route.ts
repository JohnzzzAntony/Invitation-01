import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { parseJson } from '@/lib/server'
import { DEFAULT_THEME } from '@/lib/types'
import type { TemplateRecord } from '@/lib/types'

export async function GET() {
  const templates = await db.template.findMany({
    where: { status: 'published' },
    orderBy: [{ featured: 'desc' }, { createdAt: 'asc' }],
  })
  const payload: TemplateRecord[] = templates.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    category: t.category,
    style: t.style,
    tags: parseJson<string[]>(t.tags, []),
    featured: t.featured,
    status: t.status,
    previewImage: t.previewImage,
    theme: { ...DEFAULT_THEME, ...parseJson(t.theme, {}) },
    sections: parseJson(t.sections, []),
  }))
  return NextResponse.json({ templates: payload })
}

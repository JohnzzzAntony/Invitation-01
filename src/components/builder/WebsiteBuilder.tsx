'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useApp } from '@/lib/store'
import { api } from '@/lib/api'
import {
  SECTION_CATEGORIES,
  SECTION_DEFS,
  createSection,
  getSectionDef,
  reorderSections,
} from '@/lib/sections'
import type { FieldDef } from '@/lib/sections'
import SectionRenderer from '@/components/sections/SectionRenderer'
import type {
  DeviceMode,
  EventRecord,
  EventTheme,
  QuestionRecord,
  RenderEventData,
  SectionData,
  SectionSettings,
  SectionType,
  SubEventRecord,
} from '@/lib/types'
import { DEFAULT_THEME } from '@/lib/types'
import { toast } from 'sonner'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  CloudCheck,
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
  Gift,
  GripVertical,
  Image as ImageIcon,
  Images,
  ListChecks,
  Loader2,
  Mail,
  MailCheck,
  MapPin,
  Minus,
  Monitor,
  PanelBottom,
  PanelLeft,
  Pause,
  Plus,
  Redo2,
  SlidersHorizontal,
  Smartphone,
  Tablet,
  Timer,
  Trash2,
  Type,
  Undo2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

// Lucide icon registry for the section schema
const ICONS: Record<string, LucideIcon> = {
  Image: ImageIcon,
  Type,
  BookOpen,
  Timer,
  CalendarDays,
  ListChecks,
  Images,
  MapPin,
  Building2,
  Gift,
  MailCheck,
  Mail,
  Minus,
  PanelBottom,
}

// ---------- history snapshot ----------

interface Snapshot {
  sections: SectionData[]
  theme: EventTheme
}

const MAX_HISTORY = 50

function newSectionId(): string {
  return `sec_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

// ============================================================
// WebsiteBuilder — full-screen Canva-style website editor
// ============================================================

export default function WebsiteBuilder() {
  const { currentEvent, setCurrentEvent, setBuilderOpen, openPublic } = useApp()
  const eventId = currentEvent?.id ?? null

  // ----- core editor state -----
  const [sections, setSections] = useState<SectionData[]>([])
  const [theme, setTheme] = useState<EventTheme>({ ...DEFAULT_THEME })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [device, setDevice] = useState<DeviceMode>('desktop')
  const [loaded, setLoaded] = useState(false)

  // ----- sub-data for renderer preview -----
  const [subEvents, setSubEvents] = useState<SubEventRecord[]>([])
  const [questions] = useState<QuestionRecord[]>([])

  // ----- autosave -----
  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'dirty'>('saved')
  const dirtyRef = useRef(false)
  const loadedRef = useRef(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stateRef = useRef<Snapshot>({ sections: [], theme: { ...DEFAULT_THEME } })
  stateRef.current = { sections, theme }

  // ----- history (undo/redo) -----
  const historyRef = useRef<{ stack: Snapshot[]; index: number }>({ stack: [], index: -1 })
  const [histVersion, setHistVersion] = useState(0)
  const canUndo = historyRef.current.index > 0
  const canRedo = historyRef.current.index < historyRef.current.stack.length - 1
  void histVersion

  // ----- publish -----
  const [publishing, setPublishing] = useState(false)

  // ----- drag & drop -----
  const [dragId, setDragId] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<{ id: string; pos: 'above' | 'below' } | null>(null)

  // ----- mobile sheets -----
  const [addSheetOpen, setAddSheetOpen] = useState(false)
  const [propsSheetOpen, setPropsSheetOpen] = useState(false)

  const selected = useMemo(() => sections.find((s) => s.id === selectedId) ?? null, [sections, selectedId])

  // ---------- initial load (fresh data) ----------
  useEffect(() => {
    if (!eventId) return
    let cancelled = false
    const load = async () => {
      try {
        const res = await api<{ event: EventRecord }>(`/api/events/${eventId}`)
        if (cancelled) return
        const ev = res.event
        const nextSections: SectionData[] = Array.isArray(ev.sections) ? ev.sections : []
        const nextTheme: EventTheme = { ...DEFAULT_THEME, ...ev.theme }
        setSections(nextSections)
        setTheme(nextTheme)
        historyRef.current = { stack: [{ sections: nextSections, theme: nextTheme }], index: 0 }
        setLoaded(true)
        loadedRef.current = true
        // Sub-events + questions for renderer preview (public endpoint, no auth needed)
        api<{ event: EventRecord & { subEvents?: SubEventRecord[]; questions?: QuestionRecord[] } }>(
          `/api/public/${ev.slug}`
        )
          .then((pub) => {
            if (!cancelled) setSubEvents(pub.event.subEvents ?? [])
          })
          .catch(() => undefined)
      } catch {
        if (!cancelled) toast.error('Could not load event')
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [eventId])

  // ---------- history helpers ----------
  const pushHistory = useCallback((snap: Snapshot) => {
    const h = historyRef.current
    h.stack = h.stack.slice(0, h.index + 1)
    h.stack.push(snap)
    if (h.stack.length > MAX_HISTORY) h.stack.shift()
    h.index = h.stack.length - 1
    setHistVersion((v) => v + 1)
  }, [])

  const commit = useCallback(
    (nextSections: SectionData[], nextTheme: EventTheme) => {
      setSections(nextSections)
      setTheme(nextTheme)
      pushHistory({ sections: nextSections, theme: nextTheme })
    },
    [pushHistory]
  )

  const undo = useCallback(() => {
    const h = historyRef.current
    if (h.index <= 0) return
    h.index -= 1
    const snap = h.stack[h.index]
    setSections(snap.sections)
    setTheme(snap.theme)
    setHistVersion((v) => v + 1)
  }, [])

  const redo = useCallback(() => {
    const h = historyRef.current
    if (h.index >= h.stack.length - 1) return
    h.index += 1
    const snap = h.stack[h.index]
    setSections(snap.sections)
    setTheme(snap.theme)
    setHistVersion((v) => v + 1)
  }, [])

  // ---------- save ----------
  const doSave = useCallback(async () => {
    if (!eventId) return
    setSaveState('saving')
    try {
      const res = await api<{ event: EventRecord }>(`/api/events/${eventId}`, {
        method: 'PATCH',
        body: { sections: stateRef.current.sections, theme: stateRef.current.theme },
      })
      dirtyRef.current = false
      setSaveState('saved')
      setCurrentEvent(res.event)
    } catch {
      setSaveState('dirty')
      toast.error('Could not save changes')
    }
  }, [eventId, setCurrentEvent])

  // Debounced autosave on any change
  useEffect(() => {
    if (!loadedRef.current) return
    dirtyRef.current = true
    setSaveState('dirty')
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      void doSave()
    }, 800)
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [sections, theme, doSave])

  const handleExit = useCallback(async () => {
    if (dirtyRef.current) await doSave()
    setBuilderOpen(false)
  }, [doSave, setBuilderOpen])

  const preview = useCallback(async () => {
    if (dirtyRef.current) await doSave()
    if (currentEvent) openPublic(currentEvent.slug)
  }, [currentEvent, doSave, openPublic])

  // ---------- keyboard shortcuts ----------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo])

  // ---------- section operations ----------
  const patchSection = useCallback(
    (id: string, patch: Partial<SectionData>) => {
      const next = sections.map((s) => (s.id === id ? { ...s, ...patch } : s))
      commit(next, theme)
    },
    [sections, theme, commit]
  )

  const updateContent = useCallback(
    (id: string, key: string, value: string) => {
      const target = sections.find((s) => s.id === id)
      if (!target) return
      patchSection(id, { content: { ...target.content, [key]: value } })
    },
    [sections, patchSection]
  )

  const updateSettings = useCallback(
    (id: string, patch: Partial<SectionSettings>) => {
      const target = sections.find((s) => s.id === id)
      if (!target) return
      patchSection(id, { settings: { ...target.settings, ...patch } })
    },
    [sections, patchSection]
  )

  const addSection = useCallback(
    (type: SectionType) => {
      const sec = createSection(type)
      const selIdx = sections.findIndex((s) => s.id === selectedId)
      let insertAt: number
      if (selIdx >= 0) insertAt = selIdx + 1
      else {
        const last = sections[sections.length - 1]
        insertAt = last?.type === 'footer' ? sections.length - 1 : sections.length
      }
      const next = [...sections]
      next.splice(insertAt, 0, sec)
      commit(next, theme)
      setSelectedId(sec.id)
      setAddSheetOpen(false)
      toast.success(`"${getSectionDef(type).label}" section added`)
    },
    [sections, selectedId, theme, commit]
  )

  const duplicateSection = useCallback(
    (id: string) => {
      const idx = sections.findIndex((s) => s.id === id)
      if (idx < 0) return
      const src = sections[idx]
      const copy: SectionData = {
        ...src,
        id: newSectionId(),
        content: { ...src.content },
        settings: { ...src.settings },
      }
      const next = [...sections]
      next.splice(idx + 1, 0, copy)
      commit(next, theme)
      setSelectedId(copy.id)
    },
    [sections, theme, commit]
  )

  const toggleVisible = useCallback(
    (id: string) => {
      const target = sections.find((s) => s.id === id)
      if (!target) return
      patchSection(id, { visible: !target.visible })
    },
    [sections, patchSection]
  )

  const deleteSection = useCallback(
    (id: string) => {
      const next = sections.filter((s) => s.id !== id)
      commit(next, theme)
      if (selectedId === id) setSelectedId(null)
    },
    [sections, theme, commit, selectedId]
  )

  const moveSection = useCallback(
    (id: string, dir: -1 | 1) => {
      const from = sections.findIndex((s) => s.id === id)
      if (from < 0) return
      const newIndex = from + dir
      if (newIndex < 0 || newIndex >= sections.length) return
      commit(reorderSections(sections, id, newIndex), theme)
    },
    [sections, theme, commit]
  )

  const handleDrop = useCallback(
    (targetRowId: string, pos: 'above' | 'below') => {
      if (!dragId || dragId === targetRowId) {
        setDragId(null)
        setDropTarget(null)
        return
      }
      const from = sections.findIndex((s) => s.id === dragId)
      const target = sections.findIndex((s) => s.id === targetRowId)
      if (from < 0 || target < 0) return
      let newIndex = pos === 'above' ? target : target + 1
      if (from < target) newIndex -= 1
      commit(reorderSections(sections, dragId, newIndex), theme)
      setDragId(null)
      setDropTarget(null)
    },
    [dragId, sections, theme, commit]
  )

  // ---------- publish actions ----------
  const publishAction = useCallback(
    async (action: 'publish' | 'pause' | 'unpublish') => {
      if (!eventId) return
      setPublishing(true)
      try {
        const res = await api<{ event: EventRecord }>(`/api/events/${eventId}/publish`, {
          method: 'POST',
          body: { action },
        })
        setCurrentEvent(res.event)
        if (action === 'publish') toast.success('Event is live!')
        else if (action === 'pause') toast.success('Event site paused')
        else toast.success('Event unpublished')
      } catch {
        toast.error('Could not change publish state')
      } finally {
        setPublishing(false)
      }
    },
    [eventId, setCurrentEvent]
  )

  // ---------- render data for the canvas ----------
  const renderEvent: RenderEventData | null = useMemo(() => {
    if (!currentEvent) return null
    return {
      name: currentEvent.name,
      slug: currentEvent.slug,
      type: currentEvent.type,
      status: currentEvent.status,
      eventDate: currentEvent.eventDate,
      startTime: currentEvent.startTime,
      endTime: currentEvent.endTime,
      venue: currentEvent.venue,
      address: currentEvent.address,
      description: currentEvent.description,
      hostNames: currentEvent.hostNames,
      contactEmail: currentEvent.contactEmail,
      contactPhone: currentEvent.contactPhone,
      theme,
      settings: currentEvent.settings,
      gallery: currentEvent.gallery ?? [],
      accommodations: currentEvent.accommodations ?? [],
      registryItems: currentEvent.registryItems ?? [],
      subEvents,
      questions,
    }
  }, [currentEvent, theme, subEvents, questions])

  const frameStyle: React.CSSProperties =
    device === 'desktop'
      ? { width: '100%', maxWidth: '64rem' }
      : { width: device === 'tablet' ? 768 : 390, maxWidth: '100%' }

  if (!currentEvent) return null

  const published = currentEvent.status === 'published'

  // ---------- panel renderers (shared between desktop panels + mobile sheets) ----------
  const AddPanelBody = (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Add section</h3>
      </div>
      <div className="scrollbar-thin flex-1 overflow-y-auto p-3">
        {SECTION_CATEGORIES.map((cat) => (
          <div key={cat.key} className="mb-4">
            <p className="mb-1.5 px-1 text-[11px] font-medium text-muted-foreground/80">{cat.label}</p>
            <div className="space-y-0.5">
              {SECTION_DEFS.filter((d) => d.category === cat.key).map((def) => {
                  const Icon = ICONS[def.icon] ?? Plus
                  return (
                    <button
                      key={def.type}
                      type="button"
                      title={def.description}
                      onClick={() => addSection(def.type)}
                      className="flex w-full items-start gap-2.5 rounded-md p-2 text-left transition-colors hover:bg-accent"
                    >
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium">{def.label}</span>
                        <span className="block truncate text-xs text-muted-foreground">{def.description}</span>
                      </span>
                    </button>
                  )
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const SectionsListBody = (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Sections</h3>
      </div>
      <div className="scrollbar-thin flex-1 overflow-y-auto p-2">
        {sections.length === 0 ? (
          <p className="p-3 text-sm text-muted-foreground">No sections yet — add one above.</p>
        ) : (
          <div className="space-y-0.5">
            {sections.map((s, idx) => {
              const def = getSectionDef(s.type)
              const isSel = s.id === selectedId
              const dropCls =
                dropTarget?.id === s.id
                  ? dropTarget.pos === 'above'
                    ? 'builder-drop-above'
                    : 'builder-drop-below'
                  : ''
              return (
                <div
                  key={s.id}
                  draggable
                  onDragStart={() => setDragId(s.id)}
                  onDragEnd={() => {
                    setDragId(null)
                    setDropTarget(null)
                  }}
                  onDragOver={(e) => {
                    e.preventDefault()
                    const rect = e.currentTarget.getBoundingClientRect()
                    const pos: 'above' | 'below' = e.clientY < rect.top + rect.height / 2 ? 'above' : 'below'
                    setDropTarget({ id: s.id, pos })
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    handleDrop(s.id, dropTarget?.pos ?? 'above')
                  }}
                  onClick={() => setSelectedId(s.id)}
                  className={`group flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-1.5 text-sm transition-colors ${
                    isSel ? 'bg-accent font-medium' : 'hover:bg-accent/60'
                  } ${dropCls}`}
                >
                  <GripVertical className="h-3.5 w-3.5 shrink-0 cursor-grab text-muted-foreground/60" />
                  <span className="min-w-0 flex-1 truncate">{def.label}</span>
                  {!s.visible ? <EyeOff className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /> : null}
                  <span className="flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                    <button
                      type="button"
                      aria-label="Move up"
                      disabled={idx === 0}
                      onClick={(e) => {
                        e.stopPropagation()
                        moveSection(s.id, -1)
                      }}
                      className="rounded p-1 hover:bg-background disabled:opacity-30"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Move down"
                      disabled={idx === sections.length - 1}
                      onClick={(e) => {
                        e.stopPropagation()
                        moveSection(s.id, 1)
                      }}
                      className="rounded p-1 hover:bg-background disabled:opacity-30"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </span>
                  {isSel ? (
                    <span className="flex shrink-0 items-center">
                      <button
                        type="button"
                        aria-label="Duplicate section"
                        title="Duplicate"
                        onClick={(e) => {
                          e.stopPropagation()
                          duplicateSection(s.id)
                        }}
                        className="rounded p-1 hover:bg-background"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label={s.visible ? 'Hide section' : 'Show section'}
                        title={s.visible ? 'Hide' : 'Show'}
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleVisible(s.id)
                        }}
                        className="rounded p-1 hover:bg-background"
                      >
                        {s.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        type="button"
                        aria-label="Delete section"
                        title="Delete"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteSection(s.id)
                        }}
                        className="rounded p-1 text-destructive hover:bg-background"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )

  const PropsPanelBody = (
    <Tabs defaultValue="sections" className="flex h-full flex-col">
      <div className="border-b p-3">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="sections" className="scrollbar-thin min-h-0 flex-1 overflow-y-auto p-4 pt-4">
        {selected ? (
          <SectionFields
            section={selected}
            theme={theme}
            updateContent={updateContent}
            updateSettings={updateSettings}
          />
        ) : (
          <p className="text-sm text-muted-foreground">Select a section on the canvas to edit its content &amp; design.</p>
        )}
      </TabsContent>
      <TabsContent value="theme" className="scrollbar-thin min-h-0 flex-1 overflow-y-auto p-4">
        <ThemeFields theme={theme} onChange={(patch) => commit(sections, { ...theme, ...patch })} />
      </TabsContent>
    </Tabs>
  )

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* ---------- Top bar ---------- */}
      <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-card px-3">
        <div className="flex min-w-0 items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => void handleExit()}>
            <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Dashboard</span>
          </Button>
          <div className="hidden min-w-0 flex-col md:flex">
            <span className="max-w-52 truncate text-sm font-medium">{currentEvent.name}</span>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              {saveState === 'saving' ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" /> Saving…
                </>
              ) : saveState === 'dirty' ? (
                <>
                  <CloudCheck className="h-3 w-3 opacity-50" /> Unsaved changes
                </>
              ) : (
                <>
                  <CloudCheck className="h-3 w-3 text-emerald-600" /> Saved
                </>
              )}
            </span>
          </div>
        </div>

        {/* Device toolbar */}
        <div className="flex items-center gap-0.5 rounded-lg bg-muted p-1">
          {(
            [
              { key: 'desktop', icon: Monitor, label: 'Desktop' },
              { key: 'tablet', icon: Tablet, label: 'Tablet' },
              { key: 'mobile', icon: Smartphone, label: 'Mobile' },
            ] as const
          ).map((d) => (
            <button
              key={d.key}
              type="button"
              aria-label={`${d.label} preview`}
              title={d.label}
              onClick={() => setDevice(d.key)}
              className={`flex h-7 w-8 items-center justify-center rounded-md transition-colors ${
                device === d.key ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <d.icon className="h-4 w-4" />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" aria-label="Undo" onClick={undo} disabled={!canUndo}>
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Redo" onClick={redo} disabled={!canRedo}>
            <Redo2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => void preview()} className="hidden sm:inline-flex">
            <Eye className="h-4 w-4" /> Preview
          </Button>
          {published ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="text-emerald-700">
                  <BadgeCheck className="h-4 w-4" /> Published
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => void preview()}>
                  <ExternalLink className="h-4 w-4" /> View live site
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => void publishAction('pause')}>
                  <Pause className="h-4 w-4" /> Pause
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => void publishAction('unpublish')}>
                  <Undo2 className="h-4 w-4" /> Unpublish
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" onClick={() => void publishAction('publish')} disabled={publishing}>
              {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CloudCheck className="h-4 w-4" />}
              Publish
            </Button>
          )}
        </div>
      </header>

      {/* ---------- Body ---------- */}
      <div className="relative flex min-h-0 flex-1">
        {/* Left panel (desktop) */}
        <aside className="hidden w-64 shrink-0 flex-col border-r bg-card lg:flex">
          <div className="max-h-[45%] overflow-hidden border-b">{AddPanelBody}</div>
          <div className="min-h-0 flex-1 overflow-hidden">{SectionsListBody}</div>
        </aside>

        {/* Canvas */}
        <main
          className="scrollbar-thin relative flex-1 overflow-y-auto bg-[#EDEBE6]"
          onClick={() => setSelectedId(null)}
        >
          {/* Mobile panel toggles */}
          <div className="absolute top-3 left-3 z-30 flex gap-2 lg:hidden">
            <Sheet open={addSheetOpen} onOpenChange={setAddSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="bg-background shadow-md" aria-label="Add sections">
                  <PanelLeft className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetTitle className="sr-only">Add sections</SheetTitle>
                {AddPanelBody}
              </SheetContent>
            </Sheet>
            <Sheet open={propsSheetOpen} onOpenChange={setPropsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="bg-background shadow-md" aria-label="Section settings">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 overflow-y-auto p-0">
                <SheetTitle className="sr-only">Section settings</SheetTitle>
                {PropsPanelBody}
              </SheetContent>
            </Sheet>
          </div>

          <div
            className="mx-auto my-6 overflow-hidden rounded-lg bg-white shadow-xl transition-[width] duration-300"
            style={frameStyle}
          >
            {!loaded ? (
              <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : sections.length === 0 ? (
              <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center">
                <p className="text-sm text-muted-foreground">This website has no sections yet.</p>
                <Button size="sm" onClick={() => addSection('hero')}>
                  <Plus className="h-4 w-4" /> Add a Hero section
                </Button>
              </div>
            ) : (
              renderEvent &&
              sections.map((s) => {
                const def = getSectionDef(s.type)
                const isSel = s.id === selectedId
                return (
                  <div
                    key={s.id}
                    className={`relative ${isSel ? 'z-10 ring-2 ring-primary' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedId(s.id)
                      setPropsSheetOpen(false)
                    }}
                  >
                    {s.visible ? (
                      <>
                        <SectionRenderer section={s} event={renderEvent} mode="edit" />
                        {isSel ? (
                          <>
                            <span className="absolute top-2 left-2 z-20 rounded bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground shadow">
                              {def.label}
                            </span>
                            <div
                              className="absolute top-2 right-2 z-20 flex items-center gap-0.5 rounded-md border bg-background p-0.5 shadow-md"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                aria-label="Move up"
                                onClick={() => moveSection(s.id, -1)}
                              >
                                <ChevronUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                aria-label="Move down"
                                onClick={() => moveSection(s.id, 1)}
                              >
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                aria-label="Duplicate"
                                onClick={() => duplicateSection(s.id)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                aria-label="Hide"
                                onClick={() => toggleVisible(s.id)}
                              >
                                <EyeOff className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                aria-label="Delete"
                                onClick={() => deleteSection(s.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </>
                        ) : null}
                      </>
                    ) : (
                      <div
                        className="flex cursor-pointer items-center justify-center gap-2 border-b border-dashed bg-muted/70 p-6 text-sm text-muted-foreground"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedId(s.id)
                        }}
                      >
                        <EyeOff className="h-4 w-4" /> Hidden — {def.label}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </main>

        {/* Right panel (desktop) */}
        <aside className="scrollbar-thin hidden w-72 shrink-0 overflow-hidden border-l bg-card xl:flex">
          {PropsPanelBody}
        </aside>
      </div>
    </div>
  )
}

// ============================================================
// Right panel — auto-generated section fields
// ============================================================

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}

function SectionFields({
  section,
  theme,
  updateContent,
  updateSettings,
}: {
  section: SectionData
  theme: EventTheme
  updateContent: (id: string, key: string, value: string) => void
  updateSettings: (id: string, patch: Partial<SectionSettings>) => void
}) {
  const def = getSectionDef(section.type)
  const Icon = ICONS[def.icon] ?? Plus
  const sid = section.id

  const renderField = (f: FieldDef) => {
    const value = section.content[f.key] ?? ''
    switch (f.type) {
      case 'textarea':
        return (
          <FieldRow key={f.key} label={f.label}>
            <Textarea
              id={`f-${sid}-${f.key}`}
              value={value}
              rows={3}
              onChange={(e) => updateContent(sid, f.key, e.target.value)}
            />
          </FieldRow>
        )
      case 'image':
        return (
          <FieldRow key={f.key} label={f.label}>
            <Input
              id={`f-${sid}-${f.key}`}
              value={value}
              placeholder="https://… or /images/…"
              onChange={(e) => updateContent(sid, f.key, e.target.value)}
            />
            {value ? (
              <img
                src={value}
                alt={`${f.label} preview`}
                className="mt-1.5 h-16 w-full rounded-md border object-cover"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            ) : null}
          </FieldRow>
        )
      case 'select':
        return (
          <FieldRow key={f.key} label={f.label}>
            <Select value={value} onValueChange={(v) => updateContent(sid, f.key, v)}>
              <SelectTrigger id={`f-${sid}-${f.key}`} className="w-full">
                <SelectValue placeholder="Choose…" />
              </SelectTrigger>
              <SelectContent>
                {(f.options ?? []).map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>
        )
      case 'number':
        return (
          <FieldRow key={f.key} label={f.label}>
            <Input
              id={`f-${sid}-${f.key}`}
              type="number"
              value={value}
              onChange={(e) => updateContent(sid, f.key, e.target.value)}
            />
          </FieldRow>
        )
      case 'switch':
        return (
          <div key={f.key} className="flex items-center justify-between">
            <Label htmlFor={`f-${sid}-${f.key}`} className="text-xs text-muted-foreground">
              {f.label}
            </Label>
            <Switch
              id={`f-${sid}-${f.key}`}
              checked={value === 'true'}
              onCheckedChange={(v) => updateContent(sid, f.key, v ? 'true' : 'false')}
            />
          </div>
        )
      default:
        return (
          <FieldRow key={f.key} label={f.label}>
            <Input
              id={`f-${sid}-${f.key}`}
              value={value}
              onChange={(e) => updateContent(sid, f.key, e.target.value)}
            />
          </FieldRow>
        )
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{def.label}</p>
          <p className="truncate text-[11px] text-muted-foreground">{def.description}</p>
        </div>
      </div>

      {def.fields.length > 0 ? <div className="space-y-4">{def.fields.map(renderField)}</div> : null}

      <div className="pt-2">
        <p className="mb-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Design</p>
        <div className="space-y-4">
          {/* Background color */}
          <FieldRow label="Background color">
            <div className="flex items-center gap-2">
              <input
                type="color"
                aria-label="Background color picker"
                value={section.settings.bg || '#FFFFFF'}
                onChange={(e) => updateSettings(sid, { bg: e.target.value })}
                className="h-9 w-10 shrink-0 cursor-pointer rounded-md border border-input bg-transparent p-1"
              />
              <Input
                value={section.settings.bg ?? ''}
                placeholder="transparent"
                className="flex-1 font-mono text-xs"
                onChange={(e) => updateSettings(sid, { bg: e.target.value })}
              />
              {section.settings.bg ? (
                <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" aria-label="Clear background" onClick={() => updateSettings(sid, { bg: undefined })}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              ) : null}
            </div>
          </FieldRow>

          {/* Background image */}
          <FieldRow label="Background image">
            <Input
              value={section.settings.bgImage ?? ''}
              placeholder="https://… image URL"
              onChange={(e) => updateSettings(sid, { bgImage: e.target.value || undefined })}
            />
            {section.settings.bgImage ? (
              <img
                src={section.settings.bgImage}
                alt="Background preview"
                className="mt-1.5 h-16 w-full rounded-md border object-cover"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            ) : null}
          </FieldRow>

          {/* Overlay (only with bgImage) */}
          {section.settings.bgImage ? (
            <FieldRow label={`Overlay darkness — ${section.settings.overlay ?? 40}%`}>
              <Slider
                value={[section.settings.overlay ?? 40]}
                min={0}
                max={100}
                step={5}
                onValueChange={(vals) => updateSettings(sid, { overlay: vals[0] })}
              />
            </FieldRow>
          ) : null}

          {/* Padding */}
          <FieldRow label="Padding">
            <Select
              value={section.settings.padding ?? 'md'}
              onValueChange={(v) => updateSettings(sid, { padding: v as SectionSettings['padding'] })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sm">Small</SelectItem>
                <SelectItem value="md">Medium</SelectItem>
                <SelectItem value="lg">Large</SelectItem>
              </SelectContent>
            </Select>
          </FieldRow>

          {/* Align */}
          <FieldRow label="Text alignment">
            <Select
              value={section.settings.align ?? 'center'}
              onValueChange={(v) => updateSettings(sid, { align: v as SectionSettings['align'] })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
              </SelectContent>
            </Select>
          </FieldRow>

          {/* Animation */}
          <FieldRow label="Entry animation">
            <Select
              value={section.settings.animation ?? 'fade'}
              onValueChange={(v) => updateSettings(sid, { animation: v as SectionSettings['animation'] })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="fade">Fade in</SelectItem>
                <SelectItem value="slide">Slide up</SelectItem>
                <SelectItem value="scale">Scale in</SelectItem>
              </SelectContent>
            </Select>
          </FieldRow>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground/70">
        Tip: theme fonts &amp; colors apply automatically ({theme.headingFont} / {theme.bodyFont}).
      </p>
    </div>
  )
}

// ============================================================
// Right panel — theme editor
// ============================================================

const FONT_HEADINGS = ['Cormorant Garamond', 'Playfair Display', 'Inter']
const FONT_BODIES = ['Inter', 'Cormorant Garamond', 'Playfair Display']

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <FieldRow label={label}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label} picker`}
          value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-10 shrink-0 cursor-pointer rounded-md border border-input bg-transparent p-1"
        />
        <Input
          value={value}
          className="flex-1 font-mono text-xs"
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </FieldRow>
  )
}

function ThemeFields({
  theme,
  onChange,
}: {
  theme: EventTheme
  onChange: (patch: Partial<EventTheme>) => void
}) {
  return (
    <div className="space-y-5">
      <div>
        <p className="mb-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Colors</p>
        <div className="space-y-4">
          <ColorField label="Primary" value={theme.primary} onChange={(v) => onChange({ primary: v })} />
          <ColorField label="Secondary" value={theme.secondary} onChange={(v) => onChange({ secondary: v })} />
          <ColorField label="Text" value={theme.text} onChange={(v) => onChange({ text: v })} />
          <ColorField label="Background" value={theme.background} onChange={(v) => onChange({ background: v })} />
        </div>
      </div>

      <div>
        <p className="mb-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Typography</p>
        <div className="space-y-4">
          <FieldRow label="Heading font">
            <Select value={theme.headingFont} onValueChange={(v) => onChange({ headingFont: v })}>
              <SelectTrigger className="w-full" style={{ fontFamily: `'${theme.headingFont}', serif` }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_HEADINGS.map((f) => (
                  <SelectItem key={f} value={f} style={{ fontFamily: `'${f}', serif` }}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>
          <FieldRow label="Body font">
            <Select value={theme.bodyFont} onValueChange={(v) => onChange({ bodyFont: v })}>
              <SelectTrigger className="w-full" style={{ fontFamily: `'${theme.bodyFont}', sans-serif` }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_BODIES.map((f) => (
                  <SelectItem key={f} value={f} style={{ fontFamily: `'${f}', sans-serif` }}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>
        </div>
      </div>

      <div>
        <p className="mb-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Buttons</p>
        <RadioGroup
          value={theme.buttonStyle}
          onValueChange={(v) => onChange({ buttonStyle: v as EventTheme['buttonStyle'] })}
          className="flex gap-4"
        >
          {(['rounded', 'square', 'pill'] as const).map((style) => (
            <div key={style} className="flex items-center gap-1.5">
              <RadioGroupItem value={style} id={`bs-${style}`} />
              <Label htmlFor={`bs-${style}`} className="text-xs capitalize">
                {style}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div>
        <p className="mb-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Shape &amp; spacing</p>
        <div className="space-y-4">
          <FieldRow label={`Border radius — ${theme.borderRadius}px`}>
            <Slider
              value={[theme.borderRadius]}
              min={0}
              max={28}
              step={1}
              onValueChange={(vals) => onChange({ borderRadius: vals[0] })}
            />
          </FieldRow>
          <FieldRow label={`Section spacing — ${theme.spacing.toFixed(2)}×`}>
            <Slider
              value={[theme.spacing]}
              min={0.75}
              max={1.5}
              step={0.05}
              onValueChange={(vals) => onChange({ spacing: vals[0] })}
            />
          </FieldRow>
        </div>
      </div>
    </div>
  )
}

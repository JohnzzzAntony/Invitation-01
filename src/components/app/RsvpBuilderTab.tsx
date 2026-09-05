'use client'

// Task 6-b — RsvpBuilderTab: RSVP form builder + live preview (wireframe §25–26).
import * as React from 'react'
import {
  ArrowDown,
  ArrowUp,
  Asterisk,
  GitBranch,
  Minus,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { useApp } from '@/lib/store'
import { api } from '@/lib/api'
import type { QuestionRecord, QuestionType } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { EmptyState, ListSkeleton, TabHeader } from './shared'

const TYPE_LABEL: Record<QuestionType, string> = {
  text: 'Short text',
  textarea: 'Long text',
  number: 'Number',
  yesno: 'Yes / No',
  select: 'Dropdown',
  radio: 'Radio',
  checkbox: 'Checkbox',
  date: 'Date',
  meal: 'Meal selection',
}

const HAS_OPTIONS: QuestionType[] = ['select', 'radio', 'checkbox', 'meal']

// Serializable form definition (order = array index on save)
function stripMeta(q: QuestionRecord) {
  return {
    label: q.label,
    type: q.type,
    required: q.required,
    options: q.options,
    showIfAttending: q.showIfAttending,
  }
}

function newQuestion(order: number): QuestionRecord {
  return {
    id: `tmp-${Date.now()}-${order}`,
    eventId: '',
    label: '',
    type: 'text',
    required: false,
    options: [],
    showIfAttending: false,
    order,
  }
}

export default function RsvpBuilderTab() {
  const { currentEvent } = useApp()
  const eventId = currentEvent?.id

  const [questions, setQuestions] = React.useState<QuestionRecord[] | null>(null)
  const [initialJson, setInitialJson] = React.useState('[]')
  const [loading, setLoading] = React.useState(true)
  const [failed, setFailed] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  // Editor dialog
  const [editorOpen, setEditorOpen] = React.useState(false)
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null)
  const [draft, setDraft] = React.useState<QuestionRecord>(newQuestion(0))
  const [deleteIndex, setDeleteIndex] = React.useState<number | null>(null)

  // Preview state
  const [previewAttending, setPreviewAttending] = React.useState<'yes' | 'no'>('yes')
  const [previewParty, setPreviewParty] = React.useState(2)
  const [previewAnswers, setPreviewAnswers] = React.useState<Record<string, string | string[]>>({})

  const load = React.useCallback(
    async (silent = false) => {
      if (!eventId) return
      if (!silent) {
        setLoading(true)
        setFailed(false)
      }
      try {
        const res = await api<{ questions: QuestionRecord[] }>(`/api/events/${eventId}/questions`)
        setQuestions(res.questions)
        setInitialJson(JSON.stringify(res.questions.map(stripMeta)))
      } catch {
        setFailed(true)
      } finally {
        setLoading(false)
      }
    },
    [eventId]
  )

  React.useEffect(() => {
    load()
  }, [load])

  const dirty = React.useMemo(() => {
    if (!questions) return false
    return JSON.stringify(questions.map(stripMeta)) !== initialJson
  }, [questions, initialJson])

  const move = (index: number, dir: -1 | 1) => {
    setQuestions((prev) => {
      if (!prev) return prev
      const next = [...prev]
      const target = index + dir
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  const openAdd = () => {
    setEditingIndex(null)
    setDraft(newQuestion(questions?.length ?? 0))
    setEditorOpen(true)
  }

  const openEdit = (index: number) => {
    const q = questions?.[index]
    if (!q) return
    setEditingIndex(index)
    setDraft({ ...q, options: [...q.options] })
    setEditorOpen(true)
  }

  const saveDraft = () => {
    if (!draft.label.trim()) {
      toast.error('The question label is required')
      return
    }
    if (HAS_OPTIONS.includes(draft.type) && draft.options.filter((o) => o.trim()).length === 0) {
      toast.error('Add at least one option for this question type')
      return
    }
    const cleaned: QuestionRecord = {
      ...draft,
      label: draft.label.trim(),
      options: draft.options.map((o) => o.trim()).filter(Boolean),
    }
    setQuestions((prev) => {
      const list = [...(prev ?? [])]
      if (editingIndex !== null && editingIndex < list.length) list[editingIndex] = cleaned
      else list.push(cleaned)
      return list
    })
    setEditorOpen(false)
  }

  const removeQuestion = () => {
    if (deleteIndex === null) return
    setQuestions((prev) => (prev ?? []).filter((_, i) => i !== deleteIndex))
    setDeleteIndex(null)
    toast.success('Question removed — remember to save')
  }

  const saveAll = async () => {
    if (!eventId || !questions) return
    setSaving(true)
    try {
      const res = await api<{ questions: QuestionRecord[] }>(`/api/events/${eventId}/questions`, {
        method: 'PUT',
        body: {
          questions: questions.map((q) => ({
            label: q.label,
            type: q.type,
            required: q.required,
            options: q.options,
            showIfAttending: q.showIfAttending,
          })),
        },
      })
      setQuestions(res.questions)
      setInitialJson(JSON.stringify(res.questions.map(stripMeta)))
      toast.success('RSVP form saved')
    } catch {
      toast.error('Could not save the RSVP form')
    } finally {
      setSaving(false)
    }
  }

  const setPreviewAnswer = (id: string, value: string | string[]) => {
    setPreviewAnswers((prev) => ({ ...prev, [id]: value }))
  }

  const renderPreviewField = (q: QuestionRecord) => {
    const value = previewAnswers[q.id]
    switch (q.type) {
      case 'text':
        return (
          <Input
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => setPreviewAnswer(q.id, e.target.value)}
            placeholder="Your answer..."
          />
        )
      case 'textarea':
        return (
          <Textarea
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => setPreviewAnswer(q.id, e.target.value)}
            placeholder="Your answer..."
            rows={3}
          />
        )
      case 'number':
        return (
          <Input
            type="number"
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => setPreviewAnswer(q.id, e.target.value)}
            placeholder="0"
          />
        )
      case 'date':
        return (
          <Input
            type="date"
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => setPreviewAnswer(q.id, e.target.value)}
          />
        )
      case 'yesno':
        return (
          <RadioGroup
            value={typeof value === 'string' ? value : ''}
            onValueChange={(v) => setPreviewAnswer(q.id, v)}
            className="flex gap-4"
          >
            <label className="flex items-center gap-2 text-sm">
              <RadioGroupItem value="yes" /> Yes
            </label>
            <label className="flex items-center gap-2 text-sm">
              <RadioGroupItem value="no" /> No
            </label>
          </RadioGroup>
        )
      case 'select':
        return (
          <Select value={typeof value === 'string' ? value : ''} onValueChange={(v) => setPreviewAnswer(q.id, v)}>
            <SelectTrigger>
              <SelectValue placeholder="Choose an option..." />
            </SelectTrigger>
            <SelectContent>
              {q.options.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case 'radio':
        return (
          <RadioGroup
            value={typeof value === 'string' ? value : ''}
            onValueChange={(v) => setPreviewAnswer(q.id, v)}
            className="gap-2"
          >
            {q.options.map((o) => (
              <label key={o} className="flex items-center gap-2 text-sm">
                <RadioGroupItem value={o} /> {o}
              </label>
            ))}
          </RadioGroup>
        )
      case 'checkbox': {
        const arr = Array.isArray(value) ? value : []
        return (
          <div className="space-y-2">
            {q.options.map((o) => (
              <label key={o} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={arr.includes(o)}
                  onCheckedChange={(checked) =>
                    setPreviewAnswer(q.id, checked ? [...arr, o] : arr.filter((v) => v !== o))
                  }
                />
                {o}
              </label>
            ))}
          </div>
        )
      }
      case 'meal':
        return (
          <RadioGroup
            value={typeof value === 'string' ? value : ''}
            onValueChange={(v) => setPreviewAnswer(q.id, v)}
            className="gap-2"
          >
            {q.options.map((o) => (
              <label key={o} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm has-[[data-state=checked]]:border-[#9A7B5B]">
                <RadioGroupItem value={o} /> {o}
              </label>
            ))}
          </RadioGroup>
        )
      default:
        return null
    }
  }

  if (!eventId) return null

  return (
    <div>
      <TabHeader
        title="RSVP Form"
        description="Customize the questions guests answer when they respond."
      >
        <Button onClick={saveAll} disabled={saving || !questions} className="gap-2 bg-[#1F2937] text-white hover:bg-[#111827]">
          <span className={cn('size-1.5 rounded-full', dirty ? 'bg-[#C9A96A]' : 'bg-transparent')} aria-hidden="true" />
          <Save className="size-4" aria-hidden="true" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </TabHeader>

      {failed ? (
        <EmptyState
          title="Could not load the RSVP form"
          description="Something went wrong while fetching your questions."
          action={
            <Button variant="outline" onClick={() => load()}>
              Try again
            </Button>
          }
        />
      ) : loading ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <ListSkeleton rows={5} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <ListSkeleton rows={5} />
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-2">
          {/* ---------- Left: question editor ---------- */}
          <div className="space-y-3">
            {(questions ?? []).length === 0 ? (
              <EmptyState
                title="No questions yet"
                description="Add questions to learn meal choices, song requests, dietary needs and more."
                action={
                  <Button onClick={openAdd} className="gap-2 bg-[#9A7B5B] text-white hover:bg-[#8A6D4F]">
                    <Plus className="size-4" aria-hidden="true" />
                    Add Question
                  </Button>
                }
              />
            ) : (
              (questions ?? []).map((q, i) => (
                <div key={q.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                  <div className="flex flex-col">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6"
                      disabled={i === 0}
                      onClick={() => move(i, -1)}
                      aria-label={`Move ${q.label} up`}
                    >
                      <ArrowUp className="size-3.5" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6"
                      disabled={i === (questions?.length ?? 0) - 1}
                      onClick={() => move(i, 1)}
                      aria-label={`Move ${q.label} down`}
                    >
                      <ArrowDown className="size-3.5" aria-hidden="true" />
                    </Button>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {q.label}
                      {q.required ? <Asterisk className="ml-0.5 inline size-3.5 text-[#B3543F]" aria-hidden="true" /> : null}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <Badge variant="secondary" className="font-normal">
                        {TYPE_LABEL[q.type] ?? q.type}
                      </Badge>
                      {q.showIfAttending ? (
                        <Badge variant="outline" className="gap-1 border-transparent bg-[#C9A96A1A] font-normal text-[#9A7B5B]">
                          <GitBranch className="size-3" aria-hidden="true" />
                          Only if attending
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(i)} aria-label={`Edit ${q.label}`}>
                    <Pencil className="size-4" aria-hidden="true" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive hover:text-destructive"
                    onClick={() => setDeleteIndex(i)}
                    aria-label={`Delete ${q.label}`}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              ))
            )}
            {(questions ?? []).length > 0 ? (
              <Button variant="outline" onClick={openAdd} className="w-full gap-2 border-dashed">
                <Plus className="size-4" aria-hidden="true" />
                Add Question
              </Button>
            ) : null}
          </div>

          {/* ---------- Right: live preview ---------- */}
          <Card className="lg:sticky lg:top-20">
            <CardHeader className="border-b border-border bg-[#F8F8F6] rounded-t-xl">
              <CardTitle className="text-sm font-semibold">Live preview — as guests see it</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div>
                <p className="font-heading text-xl font-semibold">Will you attend?</p>
                <RadioGroup
                  value={previewAttending}
                  onValueChange={(v) => setPreviewAttending(v as 'yes' | 'no')}
                  className="mt-3 gap-2"
                >
                  <label className="flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm has-[[data-state=checked]]:border-[#9A7B5B] has-[[data-state=checked]]:bg-accent/50">
                    <RadioGroupItem value="yes" /> Joyfully accepts
                  </label>
                  <label className="flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm has-[[data-state=checked]]:border-[#9A7B5B] has-[[data-state=checked]]:bg-accent/50">
                    <RadioGroupItem value="no" /> Regretfully declines
                  </label>
                </RadioGroup>
              </div>

              {previewAttending === 'yes' ? (
                <>
                  <div>
                    <p className="mb-2 text-sm font-medium">Number of guests</p>
                    <div className="inline-flex items-center gap-3 rounded-lg border border-border px-2 py-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => setPreviewParty((p) => Math.max(1, p - 1))}
                        aria-label="Decrease party size"
                      >
                        <Minus className="size-3.5" aria-hidden="true" />
                      </Button>
                      <span className="w-8 text-center text-sm font-semibold">{previewParty}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => setPreviewParty((p) => Math.min(currentEvent?.settings?.maxGuests ?? 10, p + 1))}
                        aria-label="Increase party size"
                      >
                        <Plus className="size-3.5" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>

                  {(questions ?? [])
                    .filter((q) => !q.showIfAttending || previewAttending === 'yes')
                    .map((q) => (
                      <div key={q.id} className="animate-float-in">
                        <p className="mb-2 text-sm font-medium">
                          {q.label}
                          {q.required ? <Asterisk className="ml-0.5 inline size-3.5 text-[#B3543F]" aria-hidden="true" /> : null}
                        </p>
                        {renderPreviewField(q)}
                      </div>
                    ))}
                </>
              ) : (
                <p className="rounded-lg bg-secondary px-4 py-3 text-sm text-muted-foreground">
                  Questions marked &ldquo;only if attending&rdquo; stay hidden when the guest declines.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ---------- Add / edit question dialog ---------- */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingIndex !== null ? 'Edit question' : 'Add question'}</DialogTitle>
            <DialogDescription>Questions appear on the RSVP form after the attend / decline choice.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="q-label">Question</Label>
              <Input
                id="q-label"
                value={draft.label}
                onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
                placeholder="e.g. A song that will get you on the dance floor"
              />
            </div>
            <div className="grid gap-2">
              <Label>Answer type</Label>
              <Select value={draft.type} onValueChange={(v) => setDraft((d) => ({ ...d, type: v as QuestionType }))}>
                <SelectTrigger aria-label="Question type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(TYPE_LABEL) as QuestionType[]).map((t) => (
                    <SelectItem key={t} value={t}>
                      {TYPE_LABEL[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {HAS_OPTIONS.includes(draft.type) ? (
              <div className="grid gap-2 rounded-lg border border-border bg-[#F8F8F6] p-3">
                <Label>Options</Label>
                {draft.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      value={opt}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          options: d.options.map((o, j) => (j === i ? e.target.value : o)),
                        }))
                      }
                      placeholder={`Option ${i + 1}`}
                      aria-label={`Option ${i + 1}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => setDraft((d) => ({ ...d, options: d.options.filter((_, j) => j !== i) }))}
                      aria-label={`Remove option ${i + 1}`}
                    >
                      <X className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-fit gap-1.5"
                  onClick={() => setDraft((d) => ({ ...d, options: [...d.options, ''] }))}
                >
                  <Plus className="size-3.5" aria-hidden="true" />
                  Add option
                </Button>
              </div>
            ) : null}

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium">Required</p>
                <p className="text-xs text-muted-foreground">Guests must answer before submitting.</p>
              </div>
              <Switch
                checked={draft.required}
                onCheckedChange={(v) => setDraft((d) => ({ ...d, required: v }))}
                aria-label="Question is required"
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium">Only if attending</p>
                <p className="text-xs text-muted-foreground">
                  Show only when guest is attending — conditional logic.
                </p>
              </div>
              <Switch
                checked={draft.showIfAttending}
                onCheckedChange={(v) => setDraft((d) => ({ ...d, showIfAttending: v }))}
                aria-label="Show only when guest is attending"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditorOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveDraft} className="bg-[#1F2937] text-white hover:bg-[#111827]">
              {editingIndex !== null ? 'Save question' : 'Add question'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete question confirm */}
      <AlertDialog open={deleteIndex !== null} onOpenChange={(open) => !open && setDeleteIndex(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this question?</AlertDialogTitle>
            <AlertDialogDescription>
              It will be removed from the form when you save. Existing answers are kept.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault()
                removeQuestion()
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

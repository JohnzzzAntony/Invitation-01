import type { SectionData, SectionType, SectionSettings } from './types'

// ============================================================
// Schema-driven section registry.
// Drives: builder left panel, right property panel, renderer.
// ============================================================

export interface FieldDef {
  key: string
  label: string
  type: 'text' | 'textarea' | 'image' | 'select' | 'number' | 'switch'
  options?: { value: string; label: string }[]
  placeholder?: string
}

export interface SectionDef {
  type: SectionType
  label: string
  category: 'basic' | 'event' | 'media' | 'guestinfo'
  icon: string // lucide icon key, mapped in components
  description: string
  defaultContent: Record<string, string>
  fields: FieldDef[]
}

export const SECTION_DEFS: SectionDef[] = [
  {
    type: 'hero',
    label: 'Hero',
    category: 'event',
    icon: 'Image',
    description: 'Full-screen cover with headline & CTA',
    defaultContent: {
      heading: 'John & Emily',
      subheading: 'We are getting married',
      dateText: '24 October 2026',
      locationText: 'Dubai, UAE',
      buttonText: 'RSVP Now',
    },
    fields: [
      { key: 'heading', label: 'Heading', type: 'text' },
      { key: 'subheading', label: 'Subheading', type: 'text' },
      { key: 'dateText', label: 'Date text', type: 'text' },
      { key: 'locationText', label: 'Location text', type: 'text' },
      { key: 'buttonText', label: 'Button text', type: 'text' },
    ],
  },
  {
    type: 'text',
    label: 'Text',
    category: 'basic',
    icon: 'Type',
    description: 'Heading and paragraph',
    defaultContent: {
      heading: 'A beautiful heading',
      body: 'Write something meaningful for your guests here.',
    },
    fields: [
      { key: 'heading', label: 'Heading', type: 'text' },
      { key: 'body', label: 'Body', type: 'textarea' },
    ],
  },
  {
    type: 'story',
    label: 'Story',
    category: 'basic',
    icon: 'BookOpen',
    description: 'Story with image and text',
    defaultContent: {
      heading: 'Our Story',
      body: 'It started with a chance meeting on a warm summer evening... Eight years, countless adventures and one unforgettable proposal later, we are ready to say "I do".',
      image: '/images/wedding-story.jpg',
    },
    fields: [
      { key: 'heading', label: 'Heading', type: 'text' },
      { key: 'body', label: 'Body', type: 'textarea' },
      { key: 'image', label: 'Image', type: 'image' },
    ],
  },
  {
    type: 'countdown',
    label: 'Countdown',
    category: 'event',
    icon: 'Timer',
    description: 'Live countdown to the big day',
    defaultContent: { heading: 'Counting down to forever' },
    fields: [{ key: 'heading', label: 'Heading', type: 'text' }],
  },
  {
    type: 'details',
    label: 'Event Details',
    category: 'event',
    icon: 'CalendarDays',
    description: 'Date, time, venue & dress code',
    defaultContent: { heading: 'When & Where', note: '' },
    fields: [
      { key: 'heading', label: 'Heading', type: 'text' },
      { key: 'note', label: 'Extra note', type: 'textarea' },
    ],
  },
  {
    type: 'schedule',
    label: 'Schedule',
    category: 'event',
    icon: 'ListChecks',
    description: 'Timeline of sub-events',
    defaultContent: { heading: 'The Schedule' },
    fields: [{ key: 'heading', label: 'Heading', type: 'text' }],
  },
  {
    type: 'gallery',
    label: 'Gallery',
    category: 'media',
    icon: 'Images',
    description: 'Photo grid with lightbox',
    defaultContent: { heading: 'Our Gallery', subtitle: 'A few of our favourite moments' },
    fields: [
      { key: 'heading', label: 'Heading', type: 'text' },
      { key: 'subtitle', label: 'Subtitle', type: 'text' },
    ],
  },
  {
    type: 'map',
    label: 'Map',
    category: 'event',
    icon: 'MapPin',
    description: 'Venue location card',
    defaultContent: { heading: 'Getting There' },
    fields: [{ key: 'heading', label: 'Heading', type: 'text' }],
  },
  {
    type: 'accommodation',
    label: 'Accommodation',
    category: 'guestinfo',
    icon: 'Building2',
    description: 'Where to stay — hotel cards',
    defaultContent: { heading: 'Where to Stay', subtitle: 'Hotels close to the venue' },
    fields: [
      { key: 'heading', label: 'Heading', type: 'text' },
      { key: 'subtitle', label: 'Subtitle', type: 'text' },
    ],
  },
  {
    type: 'registry',
    label: 'Registry',
    category: 'guestinfo',
    icon: 'Gift',
    description: 'Gift funds & donations',
    defaultContent: { heading: 'Our Registry', subtitle: 'Help us celebrate our new beginning' },
    fields: [
      { key: 'heading', label: 'Heading', type: 'text' },
      { key: 'subtitle', label: 'Subtitle', type: 'text' },
    ],
  },
  {
    type: 'rsvp',
    label: 'RSVP',
    category: 'event',
    icon: 'MailCheck',
    description: 'RSVP call-to-action / embedded form',
    defaultContent: {
      heading: 'Will you join us?',
      subtitle: 'Kindly respond before 24 September 2026',
      buttonText: 'RSVP Now',
    },
    fields: [
      { key: 'heading', label: 'Heading', type: 'text' },
      { key: 'subtitle', label: 'Subtitle', type: 'text' },
      { key: 'buttonText', label: 'Button text', type: 'text' },
    ],
  },
  {
    type: 'contact',
    label: 'Contact',
    category: 'guestinfo',
    icon: 'Mail',
    description: 'Contact details',
    defaultContent: {
      heading: 'Contact Us',
      email: 'hello@example.com',
      phone: '+971 50 000 0000',
    },
    fields: [
      { key: 'heading', label: 'Heading', type: 'text' },
      { key: 'email', label: 'Email', type: 'text' },
      { key: 'phone', label: 'Phone', type: 'text' },
    ],
  },
  {
    type: 'divider',
    label: 'Divider',
    category: 'basic',
    icon: 'Minus',
    description: 'Decorative separator',
    defaultContent: {},
    fields: [],
  },
  {
    type: 'footer',
    label: 'Footer',
    category: 'basic',
    icon: 'PanelBottom',
    description: 'Footer with credits',
    defaultContent: { text: 'With love, John & Emily' },
    fields: [{ key: 'text', label: 'Text', type: 'text' }],
  },
]

export const SECTION_CATEGORIES: { key: SectionDef['category']; label: string }[] = [
  { key: 'basic', label: 'Basic' },
  { key: 'event', label: 'Event' },
  { key: 'media', label: 'Media' },
  { key: 'guestinfo', label: 'Guest Information' },
]

export function getSectionDef(type: SectionType): SectionDef {
  return SECTION_DEFS.find((d) => d.type === type) ?? SECTION_DEFS[0]
}

let sectionCounter = 0
export function createSection(type: SectionType): SectionData {
  const def = getSectionDef(type)
  sectionCounter += 1
  return {
    id: `sec_${Date.now().toString(36)}_${sectionCounter}_${Math.random().toString(36).slice(2, 6)}`,
    type,
    visible: true,
    settings: { padding: 'md', align: 'center', animation: 'fade' },
    content: { ...def.defaultContent },
  }
}

// Reorder sections by moving one id to a new index
export function reorderSections(sections: SectionData[], id: string, newIndex: number): SectionData[] {
  const from = sections.findIndex((s) => s.id === id)
  if (from === -1) return sections
  const copy = [...sections]
  const [item] = copy.splice(from, 1)
  copy.splice(Math.max(0, Math.min(newIndex, copy.length)), 0, item)
  return copy
}

export function sectionPaddingClass(settings: SectionSettings): string {
  switch (settings.padding) {
    case 'sm':
      return 'py-8'
    case 'lg':
      return 'py-24 md:py-32'
    default:
      return 'py-16 md:py-24'
  }
}

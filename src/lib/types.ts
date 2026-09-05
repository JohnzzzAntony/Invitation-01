// ============================================================
// Online RSVP — Shared types (client + server contract)
// ============================================================

export type View = 'marketing' | 'auth' | 'onboarding' | 'app' | 'public' | 'admin'
export type AuthMode = 'login' | 'register'
export type AppTab =
  | 'overview'
  | 'website'
  | 'guests'
  | 'rsvp'
  | 'subevents'
  | 'invitations'
  | 'payments'
  | 'analytics'
  | 'settings'
export type EventStatus = 'draft' | 'published' | 'paused' | 'archived'
export type GuestStatus = 'pending' | 'attending' | 'declined'
export type DeviceMode = 'desktop' | 'tablet' | 'mobile'
export type CampaignType =
  | 'save_the_date'
  | 'invitation'
  | 'reminder'
  | 'confirmation'
  | 'update'
  | 'thank_you'
  | 'custom'

export interface SessionUser {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
}

// ---------- Theme (schema-driven design tokens) ----------
export interface EventTheme {
  primary: string
  secondary: string
  text: string
  background: string
  headingFont: string
  bodyFont: string
  buttonStyle: 'rounded' | 'square' | 'pill'
  borderRadius: number // px
  spacing: number // 0.75 – 1.5 multiplier
}

export const DEFAULT_THEME: EventTheme = {
  primary: '#9A7B5B',
  secondary: '#F6F1EA',
  text: '#272727',
  background: '#FFFFFF',
  headingFont: 'Cormorant Garamond',
  bodyFont: 'Inter',
  buttonStyle: 'rounded',
  borderRadius: 8,
  spacing: 1,
}

// ---------- Sections (schema-driven website builder) ----------
export type SectionType =
  | 'hero'
  | 'text'
  | 'story'
  | 'countdown'
  | 'details'
  | 'schedule'
  | 'gallery'
  | 'map'
  | 'accommodation'
  | 'registry'
  | 'rsvp'
  | 'contact'
  | 'divider'
  | 'footer'

export interface SectionSettings {
  height?: 'auto' | 'screen'
  align?: 'left' | 'center'
  bg?: string // background color override
  bgImage?: string
  overlay?: number // 0-100 dark overlay %
  padding?: 'sm' | 'md' | 'lg'
  animation?: 'none' | 'fade' | 'slide' | 'scale'
}

export interface SectionData {
  id: string
  type: SectionType
  visible: boolean
  settings: SectionSettings
  content: Record<string, string>
}

export interface EventSettings {
  rsvpMode: 'public' | 'password' | 'guestlist'
  rsvpPassword: string
  rsvpDeadline: string
  allowPlusOne: boolean
  maxGuests: number
  allowEdit: boolean
  indexable: boolean
  notifyEveryRsvp: boolean
  dailySummary: boolean
  customDomain: string
  domainStatus: 'none' | 'pending' | 'verified'
}

export const DEFAULT_SETTINGS: EventSettings = {
  rsvpMode: 'public',
  rsvpPassword: '',
  rsvpDeadline: '',
  allowPlusOne: true,
  maxGuests: 5,
  allowEdit: true,
  indexable: true,
  notifyEveryRsvp: true,
  dailySummary: false,
  customDomain: '',
  domainStatus: 'none',
}

// ---------- Records (serialized API payloads) ----------
export interface GalleryImage {
  url: string
  caption: string
}

export interface Accommodation {
  id: string
  name: string
  stars: number
  distance: string
  price: string
  description: string
  url: string
}

export interface RegistryItem {
  id: string
  name: string
  description: string
  target: number
  raised: number
  url: string
}

export interface EventRecord {
  id: string
  ownerId: string
  name: string
  slug: string
  type: string
  status: EventStatus
  eventDate: string
  startTime: string
  endTime: string
  timezone: string
  venue: string
  address: string
  description: string
  hostNames: string
  contactEmail: string
  contactPhone: string
  theme: EventTheme
  sections: SectionData[]
  settings: EventSettings
  gallery: GalleryImage[]
  accommodations: Accommodation[]
  registryItems: RegistryItem[]
  templateId: string | null
  createdAt: string
  updatedAt: string
}

export interface EventSummary extends EventRecord {
  guestCount?: number
}

export interface GroupRecord {
  id: string
  eventId: string
  name: string
  color: string
  description: string
  guestCount?: number
}

export interface GuestRecord {
  id: string
  eventId: string
  groupId: string | null
  groupName?: string | null
  name: string
  email: string
  status: GuestStatus
  partySize: number
  maxParty: number
  meal: string | null
  dietary: string | null
  notes: string | null
  token: string
  invited: boolean
  invitedAt: string | null
  respondedAt: string | null
  createdAt: string
}

export type QuestionType =
  | 'yesno'
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'meal'
  | 'date'

export interface QuestionRecord {
  id: string
  eventId: string
  label: string
  type: QuestionType
  required: boolean
  options: string[]
  showIfAttending: boolean
  order: number
}

export interface SubEventRecord {
  id: string
  eventId: string
  name: string
  date: string
  startTime: string
  endTime: string | null
  venue: string | null
  description: string | null
  dressCode: string | null
  rsvpRequired: boolean
  groupIds: string[]
}

export interface CampaignRecord {
  id: string
  eventId: string
  name: string
  type: CampaignType
  subject: string
  body: string
  status: 'draft' | 'scheduled' | 'sent'
  scheduledAt: string | null
  sentAt: string | null
  sentCount: number
  openedCount: number
  clickedCount: number
  createdAt: string
}

export interface PaymentRecord {
  id: string
  eventId: string
  guestName: string
  type: 'donation' | 'ticket' | 'gift' | 'registry'
  amount: number
  status: string
  method: string
  createdAt: string
}

export interface EventStats {
  totalGuests: number
  attending: number
  declined: number
  pending: number
  rsvpRate: number
  totalAttendees: number
  invited: number
  trend: { date: string; count: number }[]
  emails: { sent: number; opened: number; clicked: number }
  paymentsTotal: number
  paymentsCount: number
  pageViews: number
}

export interface TemplateRecord {
  id: string
  name: string
  slug: string
  category: string
  style: string
  tags: string[]
  featured: boolean
  status: string
  previewImage: string
  theme: EventTheme
  sections: SectionData[]
}

// ---------- Public RSVP ----------
export interface RsvpSubmitPayload {
  token?: string // guest token for personalized RSVP
  name?: string // for public/guestlist modes
  email?: string
  attending: boolean
  partySize: number
  answers: Record<string, string | string[]>
  subEventIds?: string[]
}

// ---------- Renderer context ----------
export interface RenderEventData {
  name: string
  slug: string
  type: string
  status: EventStatus
  eventDate: string
  startTime: string
  endTime: string
  venue: string
  address: string
  description: string
  hostNames: string
  contactEmail: string
  contactPhone: string
  theme: EventTheme
  settings: EventSettings
  gallery: GalleryImage[]
  accommodations: Accommodation[]
  registryItems: RegistryItem[]
  subEvents: SubEventRecord[]
  questions?: QuestionRecord[]
}

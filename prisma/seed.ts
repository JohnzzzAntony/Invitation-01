import { PrismaClient } from '@prisma/client'
import { hashPassword, generateToken } from '../src/lib/auth'

const db = new PrismaClient()

// ---------- helpers ----------
function sec(
  type: string,
  content: Record<string, string> = {},
  settings: Record<string, unknown> = {}
) {
  return {
    id: `sec_${Math.random().toString(36).slice(2, 10)}`,
    type,
    visible: true,
    settings: { padding: 'md', align: 'center', animation: 'fade', ...settings },
    content,
  }
}

const FIRST = ['Sarah', 'Michael', 'David', 'Emma', 'James', 'Olivia', 'Daniel', 'Sophia', 'Matthew', 'Isabella', 'Andrew', 'Mia', 'Joshua', 'Charlotte', 'Ryan', 'Amelia', 'Thomas', 'Harper', 'Christopher', 'Evelyn', 'Nathan', 'Abigail', 'Kevin', 'Emily', 'Brian', 'Ella', 'Tyler', 'Grace', 'Aaron', 'Chloe', 'Adam', 'Victoria', 'Nicholas', 'Riley', 'Justin', 'Aria', 'Brandon', 'Lily', 'Samuel', 'Hannah', 'Gregory', 'Zoe', 'Patrick', 'Layla', 'Henry', 'Nora', 'Jack', 'Ava', 'Dennis', 'Mila']
const LAST = ['Smith', 'Brown', 'Wilson', 'Taylor', 'Anderson', 'Clark', 'Lewis', 'Walker', 'Hall', 'Young', 'King', 'Wright', 'Scott', 'Green', 'Baker', 'Adams', 'Nelson', 'Hill', 'Campbell', 'Mitchell', 'Roberts', 'Carter', 'Phillips', 'Evans', 'Turner', 'Parker', 'Collins', 'Edwards', 'Stewart', 'Morris']

let nameIdx = 0
function nextName(): string {
  const f = FIRST[nameIdx % FIRST.length]
  const l = LAST[(nameIdx * 7 + 3) % LAST.length]
  nameIdx++
  return `${f} ${l}`
}

async function main() {
  console.log('Seeding Online RSVP platform...')
  await db.rsvpResponse.deleteMany()
  await db.rsvpQuestion.deleteMany()
  await db.campaign.deleteMany()
  await db.payment.deleteMany()
  await db.subEvent.deleteMany()
  await db.guest.deleteMany()
  await db.guestGroup.deleteMany()
  await db.event.deleteMany()
  await db.template.deleteMany()
  await db.notification.deleteMany()
  await db.user.deleteMany()

  // ---------- Users ----------
  const john = await db.user.create({
    data: {
      email: 'john@example.com',
      name: 'John Carter',
      password: hashPassword('demo1234'),
      role: 'user',
    },
  })
  await db.user.create({
    data: {
      email: 'admin@onlinersvp.com',
      name: 'Platform Admin',
      password: hashPassword('admin1234'),
      role: 'admin',
    },
  })

  // ---------- Templates ----------
  const templates: {
    name: string
    slug: string
    category: string
    style: string
    tags: string[]
    featured: boolean
    previewImage: string
    theme: object
    sections: object[]
  }[] = [
    {
      name: 'Eucalyptus',
      slug: 'eucalyptus',
      category: 'wedding',
      style: 'floral',
      tags: ['wedding', 'floral', 'greenery', 'elegant'],
      featured: true,
      previewImage: '/images/wedding-hero.jpg',
      theme: { primary: '#7C8A6E', secondary: '#F2F4EE', text: '#2E332C', background: '#FFFFFF', headingFont: 'Cormorant Garamond', bodyFont: 'Inter', buttonStyle: 'rounded', borderRadius: 8, spacing: 1 },
      sections: [
        sec('hero', { heading: 'Ava & Noah', subheading: 'Are getting married', dateText: '12 June 2026', locationText: 'Tuscany, Italy', buttonText: 'RSVP Now' }, { height: 'screen', overlay: 30, bgImage: '/images/wedding-hero.jpg' }),
        sec('countdown', { heading: 'Counting down to forever' }),
        sec('details', { heading: 'When & Where' }),
        sec('schedule', { heading: 'The Schedule' }),
        sec('rsvp', { heading: 'Will you join us?', subtitle: 'Kindly respond before 12 May 2026', buttonText: 'RSVP Now' }),
        sec('footer', { text: 'With love, Ava & Noah' }),
      ],
    },
    {
      name: 'Modern Minimal',
      slug: 'modern-minimal',
      category: 'wedding',
      style: 'minimal',
      tags: ['wedding', 'minimal', 'clean', 'modern'],
      featured: true,
      previewImage: '/images/wedding-gallery-1.jpg',
      theme: { primary: '#181816', secondary: '#F5F5F2', text: '#181816', background: '#FFFFFF', headingFont: 'Playfair Display', bodyFont: 'Inter', buttonStyle: 'square', borderRadius: 2, spacing: 1.1 },
      sections: [
        sec('hero', { heading: 'Mia & Lucas', subheading: 'The Wedding', dateText: '05 September 2026', locationText: 'Paris, France', buttonText: 'RSVP' }, { height: 'screen', overlay: 40, bgImage: '/images/wedding-gallery-3.jpg' }),
        sec('text', { heading: 'Welcome', body: 'We would be honoured by your presence as we begin our new chapter together.' }),
        sec('details', { heading: 'The Details' }),
        sec('rsvp', { heading: 'Join us', subtitle: 'Please respond by 05 August 2026', buttonText: 'RSVP' }),
        sec('footer', { text: 'Mia & Lucas' }),
      ],
    },
    {
      name: 'White Rose',
      slug: 'white-rose',
      category: 'wedding',
      style: 'romantic',
      tags: ['wedding', 'romantic', 'blush', 'classic'],
      featured: true,
      previewImage: '/images/wedding-gallery-4.jpg',
      theme: { primary: '#B98A8E', secondary: '#FBF4F2', text: '#3A2E2E', background: '#FFFDFC', headingFont: 'Playfair Display', bodyFont: 'Inter', buttonStyle: 'pill', borderRadius: 24, spacing: 1 },
      sections: [
        sec('hero', { heading: 'Chloe & Jack', subheading: 'Say yes to the date', dateText: '18 July 2026', locationText: 'Santorini, Greece', buttonText: 'RSVP Now' }, { height: 'screen', overlay: 25, bgImage: '/images/wedding-story.jpg' }),
        sec('story', { heading: 'Our Story', body: 'From a small coffee shop in London to the cliffs of Santorini...', image: '/images/wedding-story.jpg' }),
        sec('countdown', { heading: 'Until we say I do' }),
        sec('gallery', { heading: 'Our Gallery', subtitle: 'A few of our favourite moments' }),
        sec('rsvp', { heading: 'Will you be there?', subtitle: 'Kindly respond before 18 June 2026', buttonText: 'RSVP Now' }),
        sec('footer', { text: 'With love, Chloe & Jack' }),
      ],
    },
    {
      name: 'Luxury Gold',
      slug: 'luxury-gold',
      category: 'wedding',
      style: 'luxury',
      tags: ['wedding', 'luxury', 'gold', 'dark'],
      featured: false,
      previewImage: '/images/wedding-gallery-2.jpg',
      theme: { primary: '#C9A96A', secondary: '#1C1A17', text: '#EDE6D8', background: '#141311', headingFont: 'Cormorant Garamond', bodyFont: 'Inter', buttonStyle: 'rounded', borderRadius: 4, spacing: 1.2 },
      sections: [
        sec('hero', { heading: 'Isabella & Alexander', subheading: 'A Celebration of Love', dateText: '31 December 2026', locationText: 'The Ritz, London', buttonText: 'RSVP' }, { height: 'screen', overlay: 55, bgImage: '/images/wedding-gallery-2.jpg', bg: '#141311' }),
        sec('countdown', { heading: 'The Countdown Begins' }),
        sec('details', { heading: 'When & Where' }),
        sec('schedule', { heading: 'Evening Schedule' }),
        sec('registry', { heading: 'Gift Registry', subtitle: 'Your presence is the greatest gift' }),
        sec('rsvp', { heading: 'Reserve Your Place', subtitle: 'Kindly respond before 30 November 2026', buttonText: 'RSVP' }),
        sec('footer', { text: 'Isabella & Alexander' }),
      ],
    },
    {
      name: 'Golden Hour',
      slug: 'golden-hour',
      category: 'birthday',
      style: 'colorful',
      tags: ['birthday', 'party', 'warm', 'fun'],
      featured: true,
      previewImage: '/images/birthday-hero.jpg',
      theme: { primary: '#C97B2D', secondary: '#FDF6EC', text: '#3B2E1F', background: '#FFFCF7', headingFont: 'Playfair Display', bodyFont: 'Inter', buttonStyle: 'pill', borderRadius: 24, spacing: 1 },
      sections: [
        sec('hero', { heading: "Aurora turns 30!", subheading: 'Join the celebration', dateText: '14 November 2026', locationText: 'Rooftop 27, Dubai', buttonText: "I'm coming!" }, { height: 'screen', overlay: 35, bgImage: '/images/birthday-hero.jpg' }),
        sec('countdown', { heading: 'Party starts in' }),
        sec('details', { heading: 'The Party' }),
        sec('rsvp', { heading: "See you there?", subtitle: 'RSVP by 1 November 2026', buttonText: "I'm coming!" }),
        sec('footer', { text: 'See you at the party!' }),
      ],
    },
    {
      name: 'Little Star',
      slug: 'little-star',
      category: 'baby',
      style: 'classic',
      tags: ['baby shower', 'soft', 'sweet'],
      featured: false,
      previewImage: '/images/wedding-gallery-4.jpg',
      theme: { primary: '#A38FB8', secondary: '#F7F4FB', text: '#3D3652', background: '#FFFFFF', headingFont: 'Cormorant Garamond', bodyFont: 'Inter', buttonStyle: 'pill', borderRadius: 20, spacing: 1 },
      sections: [
        sec('hero', { heading: 'Baby Shower', subheading: 'A little star is on the way', dateText: '20 September 2026', locationText: 'Garden Café, Abu Dhabi', buttonText: 'RSVP' }, { height: 'screen', overlay: 25, bgImage: '/images/wedding-gallery-4.jpg' }),
        sec('text', { heading: 'Oh, baby!', body: 'Join us for an afternoon of sweet treats and celebration.' }),
        sec('details', { heading: 'Details' }),
        sec('rsvp', { heading: 'Can you make it?', subtitle: 'RSVP by 10 September 2026', buttonText: 'RSVP' }),
        sec('footer', { text: 'With love, The Reeds' }),
      ],
    },
    {
      name: 'Summit',
      slug: 'summit',
      category: 'corporate',
      style: 'editorial',
      tags: ['corporate', 'conference', 'professional'],
      featured: false,
      previewImage: '/images/corporate-hero.jpg',
      theme: { primary: '#2F6B4F', secondary: '#F0F4F1', text: '#1C2420', background: '#FFFFFF', headingFont: 'Inter', bodyFont: 'Inter', buttonStyle: 'square', borderRadius: 4, spacing: 1.1 },
      sections: [
        sec('hero', { heading: 'Future Summit 2026', subheading: 'Annual Product Conference', dateText: '05 December 2026', locationText: 'Emirates Towers, Dubai', buttonText: 'Register' }, { height: 'screen', overlay: 45, bgImage: '/images/corporate-hero.jpg' }),
        sec('text', { heading: 'About the Summit', body: 'A full day of keynotes, workshops and networking with industry leaders.' }),
        sec('schedule', { heading: 'Agenda' }),
        sec('rsvp', { heading: 'Reserve your seat', subtitle: 'Seats are limited', buttonText: 'Register' }),
        sec('footer', { text: 'Future Summit 2026' }),
      ],
    },
    {
      name: 'Midnight Gala',
      slug: 'midnight-gala',
      category: 'party',
      style: 'dark',
      tags: ['party', 'gala', 'dark', 'glam'],
      featured: false,
      previewImage: '/images/wedding-gallery-3.jpg',
      theme: { primary: '#B85C5C', secondary: '#1A1517', text: '#F2EAEA', background: '#131013', headingFont: 'Playfair Display', bodyFont: 'Inter', buttonStyle: 'pill', borderRadius: 24, spacing: 1.15 },
      sections: [
        sec('hero', { heading: 'Midnight Gala', subheading: 'An evening to remember', dateText: '21 November 2026', locationText: 'Palazzo Versace, Dubai', buttonText: 'RSVP' }, { height: 'screen', overlay: 60, bgImage: '/images/wedding-gallery-3.jpg', bg: '#131013' }),
        sec('countdown', { heading: 'Doors open in' }),
        sec('details', { heading: 'The Night' }),
        sec('rsvp', { heading: 'Will you attend?', subtitle: 'Black tie attire', buttonText: 'RSVP' }),
        sec('footer', { text: 'Midnight Gala' }),
      ],
    },
  ]

  for (const t of templates) {
    await db.template.create({
      data: {
        name: t.name,
        slug: t.slug,
        category: t.category,
        style: t.style,
        tags: JSON.stringify(t.tags),
        featured: t.featured,
        status: 'published',
        previewImage: t.previewImage,
        theme: JSON.stringify(t.theme),
        sections: JSON.stringify(t.sections),
      },
    })
  }
  console.log(`Seeded ${templates.length} templates`)

  // ---------- Main demo event: John & Emily Wedding ----------
  const mainSections = [
    sec('hero', { heading: 'John & Emily', subheading: 'Are getting married', dateText: '24 October 2026', locationText: 'Dubai, UAE', buttonText: 'RSVP Now' }, { height: 'screen', overlay: 32, bgImage: '/images/wedding-hero.jpg' }),
    sec('story', { heading: 'Our Story', body: 'It started with a chance meeting on a warm summer evening in 2018. Eight years, countless adventures and one unforgettable proposal later, we are ready to say "I do" — and we cannot imagine celebrating without you.', image: '/images/wedding-story.jpg' }, { align: 'left', bg: '#F6F1EA' }),
    sec('countdown', { heading: 'Counting down to forever' }),
    sec('details', { heading: 'When & Where', note: 'Ceremony begins promptly at 5:30 PM. Kindly be seated by 5:15 PM.' }),
    sec('schedule', { heading: 'The Schedule' }),
    sec('gallery', { heading: 'Our Gallery', subtitle: 'A few of our favourite moments' }),
    sec('map', { heading: 'Getting There' }),
    sec('accommodation', { heading: 'Where to Stay', subtitle: 'Preferential rates for our guests' }, { bg: '#F6F1EA' }),
    sec('registry', { heading: 'Our Registry', subtitle: 'Help us celebrate our new beginning' }),
    sec('rsvp', { heading: 'Will you join us?', subtitle: 'Kindly respond before 24 September 2026', buttonText: 'RSVP Now' }, { bg: '#F6F1EA' }),
    sec('contact', { heading: 'Questions?', email: 'johnandemily@email.com', phone: '+971 50 123 4567' }),
    sec('footer', { text: 'With love, John & Emily' }),
  ]

  const event = await db.event.create({
    data: {
      ownerId: john.id,
      name: "John & Emily's Wedding",
      slug: 'john-emily',
      type: 'wedding',
      status: 'published',
      eventDate: '2026-10-24',
      startTime: '17:30',
      endTime: '23:00',
      timezone: 'Asia/Dubai',
      venue: 'Grand Ballroom, Palm Jumeirah',
      address: 'Dubai, United Arab Emirates',
      description: 'Join us for an unforgettable evening of love, laughter and celebration.',
      hostNames: 'John Carter & Emily Rose',
      contactEmail: 'johnandemily@email.com',
      contactPhone: '+971 50 123 4567',
      theme: JSON.stringify({ primary: '#9A7B5B', secondary: '#F6F1EA', text: '#272727', background: '#FFFFFF', headingFont: 'Cormorant Garamond', bodyFont: 'Inter', buttonStyle: 'rounded', borderRadius: 8, spacing: 1 }),
      sections: JSON.stringify(mainSections),
      settings: JSON.stringify({ rsvpMode: 'public', rsvpPassword: '', rsvpDeadline: '2026-09-24', allowPlusOne: true, maxGuests: 4, allowEdit: true, indexable: true, notifyEveryRsvp: true, dailySummary: false, customDomain: '', domainStatus: 'none' }),
      gallery: JSON.stringify([
        { url: '/images/wedding-hero.jpg', caption: 'The proposal at sunset' },
        { url: '/images/wedding-story.jpg', caption: 'Engagement in the gardens' },
        { url: '/images/wedding-gallery-1.jpg', caption: 'Reception table styling' },
        { url: '/images/wedding-gallery-2.jpg', caption: 'The cake tasting' },
        { url: '/images/wedding-gallery-3.jpg', caption: 'First dance rehearsal' },
        { url: '/images/wedding-gallery-4.jpg', caption: 'Bridal bouquet' },
      ]),
      accommodations: JSON.stringify([
        { id: 'acc_1', name: 'Grand Hotel Palm', stars: 5, distance: '2.4 km from venue', price: '$180/night', description: 'Luxury beachfront resort with spa access. Mention "Carter-Rose Wedding" for 15% off.', url: 'https://example.com/grand-hotel' },
        { id: 'acc_2', name: 'Airport Hotel Dubai', stars: 4, distance: '5.2 km from venue', price: '$120/night', description: 'Convenient and comfortable with free shuttle to the venue.', url: 'https://example.com/airport-hotel' },
        { id: 'acc_3', name: 'Desert Palm Resort', stars: 5, distance: '8.1 km from venue', price: '$240/night', description: 'Serene polo estate villas, perfect for a weekend escape.', url: 'https://example.com/desert-palm' },
      ]),
      registryItems: JSON.stringify([
        { id: 'reg_1', name: 'Honeymoon Fund', description: 'Help us make our Maldives honeymoon unforgettable.', target: 5000, raised: 2350, url: '' },
        { id: 'reg_2', name: 'Home Fund', description: 'Contribute to our first home together.', target: 3000, raised: 850, url: '' },
        { id: 'reg_3', name: 'Gift Registry', description: 'Our curated wishlist at a partner store.', target: 0, raised: 0, url: 'https://example.com/registry' },
      ]),
    },
  })

  // ---------- Guest groups ----------
  const groupDefs = [
    { name: 'Family', color: '#9A7B5B', count: 52 },
    { name: 'Friends', color: '#7C8A6E', count: 74 },
    { name: "Bride's Family", color: '#B98A8E', count: 30 },
    { name: "Groom's Family", color: '#C9A96A', count: 20 },
    { name: 'VIP', color: '#8A5A44', count: 10 },
  ]
  const groups: Record<string, string> = {}
  for (const g of groupDefs) {
    const rec = await db.guestGroup.create({
      data: { eventId: event.id, name: g.name, color: g.color, description: `${g.name} of the couple` },
    })
    groups[g.name] = rec.id
  }

  // ---------- Guests: 186 with status distribution ----------
  const plan: { group: string; attending: number; declined: number; pending: number }[] = [
    { group: 'Family', attending: 34, declined: 6, pending: 12 },
    { group: 'Friends', attending: 47, declined: 9, pending: 18 },
    { group: "Bride's Family", attending: 22, declined: 4, pending: 4 },
    { group: "Groom's Family", attending: 11, declined: 2, pending: 7 },
    { group: 'VIP', attending: 7, declined: 2, pending: 1 },
  ]
  const meals = ['Chicken', 'Beef', 'Vegetarian', 'Fish']
  const dietaryNotes = ['Vegetarian', 'Gluten free', 'Nut allergy', 'None', '']
  const now = Date.now()
  const DAY = 24 * 60 * 60 * 1000
  let guestIndex = 0

  const questionsData = [
    { label: 'Names of everyone in your party', type: 'textarea', required: true, showIfAttending: true, order: 0 },
    { label: 'Meal preference', type: 'meal', required: true, showIfAttending: true, order: 1, options: meals },
    { label: 'Dietary requirements or allergies', type: 'text', required: false, showIfAttending: true, order: 2 },
    { label: 'A song that will get you on the dance floor', type: 'text', required: false, showIfAttending: true, order: 3 },
    { label: 'Will you stay at one of our partner hotels?', type: 'yesno', required: false, showIfAttending: true, order: 4 },
    { label: 'A message for the couple', type: 'textarea', required: false, showIfAttending: false, order: 5 },
  ]
  const questionRecords: { id: string; label: string; type: string; options: string[] }[] = []
  for (const q of questionsData) {
    const rec = await db.rsvpQuestion.create({
      data: {
        eventId: event.id,
        label: q.label,
        type: q.type,
        required: q.required,
        options: JSON.stringify(q.options ?? []),
        showIfAttending: q.showIfAttending,
        order: q.order,
      },
    })
    questionRecords.push({ id: rec.id, label: q.label, type: q.type, options: q.options ?? [] })
  }
  const mealQ = questionRecords.find((q) => q.type === 'meal')!
  const dietQ = questionRecords.find((q) => q.label.startsWith('Dietary'))!
  const msgQ = questionRecords.find((q) => q.label.startsWith('A message'))!

  for (const p of plan) {
    const statuses: ('attending' | 'declined' | 'pending')[] = [
      ...Array(p.attending).fill('attending'),
      ...Array(p.declined).fill('declined'),
      ...Array(p.pending).fill('pending'),
    ]
    for (const status of statuses) {
      guestIndex++
      const name = guestIndex <= 6
        ? ['Sarah Smith', 'Michael Brown', 'Emma Wilson', 'John Davis', 'Sophia Taylor', 'Daniel Clark'][guestIndex - 1]
        : nextName()
      const attending = status === 'attending'
      const partySize = attending ? (guestIndex % 3 === 0 ? 2 : 1) : status === 'pending' ? 1 : 0
      const respondedAt = status !== 'pending' ? new Date(now - Math.floor(Math.pow(Math.random(), 0.7) * 29 + 1) * DAY) : null
      const invited = status !== 'pending' || Math.random() > 0.35
      const guest = await db.guest.create({
        data: {
          eventId: event.id,
          groupId: groups[p.group],
          name,
          email: `${name.toLowerCase().replace(/[^a-z]/g, '.')}${guestIndex}@example.com`,
          status,
          partySize,
          maxParty: guestIndex % 5 === 0 ? 3 : 2,
          meal: attending ? meals[guestIndex % meals.length] : null,
          dietary: attending && guestIndex % 4 === 0 ? dietaryNotes[guestIndex % 4] : null,
          notes: guestIndex <= 2 ? "Near bride's family seating" : null,
          token: generateToken(),
          invited,
          invitedAt: invited ? new Date(now - 30 * DAY) : null,
          respondedAt,
        },
      })
      if (respondedAt) {
        const answers: Record<string, string> = {}
        if (attending) {
          answers[mealQ.id] = meals[guestIndex % meals.length]
          if (guestIndex % 4 === 0) answers[dietQ.id] = dietaryNotes[guestIndex % 4]
        } else if (guestIndex % 3 === 0) {
          answers[msgQ.id] = 'So sorry to miss it — celebrate big for me!'
        }
        await db.rsvpResponse.create({
          data: {
            eventId: event.id,
            guestId: guest.id,
            attending,
            partySize: attending ? partySize : 0,
            answers: JSON.stringify(answers),
            createdAt: respondedAt,
          },
        })
      }
    }
  }
  console.log(`Seeded ${guestIndex} guests`)

  // ---------- Sub-events ----------
  await db.subEvent.createMany({
    data: [
      { eventId: event.id, name: 'Wedding Ceremony', date: '2026-10-24', startTime: '17:00', endTime: '18:00', venue: 'Grand Ballroom', description: 'The main exchange of vows.', dressCode: 'Formal', rsvpRequired: true, groupIds: JSON.stringify([groups['Family'], groups['Friends'], groups["Bride's Family"], groups["Groom's Family"], groups['VIP']]) },
      { eventId: event.id, name: 'Reception Dinner', date: '2026-10-24', startTime: '19:00', endTime: '23:00', venue: 'Palm Terrace', description: 'Dinner, toasts and dancing under the stars.', dressCode: 'Black tie optional', rsvpRequired: true, groupIds: JSON.stringify([groups['Family'], groups['Friends'], groups["Bride's Family"], groups["Groom's Family"], groups['VIP']]) },
      { eventId: event.id, name: 'Sunday Brunch', date: '2026-10-25', startTime: '11:00', endTime: '13:00', venue: 'Poolside Café', description: 'A relaxed farewell brunch.', dressCode: 'Smart casual', rsvpRequired: true, groupIds: JSON.stringify([groups['Family'], groups['VIP']]) },
    ],
  })

  // ---------- Campaigns ----------
  await db.campaign.createMany({
    data: [
      { eventId: event.id, name: 'Save the Date', type: 'save_the_date', subject: 'Save the Date — John & Emily, 24 October 2026', body: 'Dear {{guest.first_name}},\n\nWe are delighted to announce our wedding on {{event.date}} at {{event.venue}}. Save the date — formal invitation to follow!\n\nWith love,\nJohn & Emily', status: 'sent', sentAt: new Date(now - 45 * DAY), sentCount: 186, openedCount: 171, clickedCount: 143 },
      { eventId: event.id, name: 'Official Invitation', type: 'invitation', subject: "You're invited — John & Emily's Wedding", body: 'Dear {{guest.first_name}},\n\nAfter years of adventures together, we are getting married! Join us on {{event.date}} at {{event.venue}}, {{event.address}}.\n\nRSVP here: {{event.rsvp_url}}\n\nWe cannot wait to celebrate with you.\n\nJohn & Emily', status: 'sent', sentAt: new Date(now - 30 * DAY), sentCount: 186, openedCount: 168, clickedCount: 149 },
      { eventId: event.id, name: 'RSVP Reminder', type: 'reminder', subject: 'Reminder: RSVP for John & Emily\'s Wedding', body: 'Hi {{guest.first_name}},\n\nThis is a friendly reminder to RSVP for our wedding on {{event.date}}. We are holding a seat for you!\n\nRSVP: {{event.rsvp_url}}\n\nJohn & Emily', status: 'scheduled', scheduledAt: new Date(now + 5 * DAY), sentCount: 0, openedCount: 0, clickedCount: 0 },
    ],
  })

  // ---------- Payments ----------
  const paymentNames = ['Sarah Smith', 'David Brown', 'Emma Wilson', 'Michael Brown', 'Sophia Taylor', 'Daniel Clark', 'Olivia Lewis', 'James Walker', 'Grace Hall', 'Henry Young']
  const paymentTypes = ['donation', 'registry', 'gift', 'ticket'] as const
  await db.payment.createMany({
    data: paymentNames.map((guestName, i) => ({
      eventId: event.id,
      guestName,
      type: paymentTypes[i % paymentTypes.length],
      amount: [100, 250, 150, 80, 500, 120, 200, 60, 340, 90][i],
      status: 'succeeded',
      method: 'stripe',
      createdAt: new Date(now - (i * 2 + 1) * DAY),
    })),
  })

  // ---------- Secondary events ----------
  const birthdaySections = [
    sec('hero', { heading: "Aurora turns 30!", subheading: 'Join the celebration', dateText: '14 November 2026', locationText: 'Rooftop 27, Dubai', buttonText: "I'm coming!" }, { height: 'screen', overlay: 35, bgImage: '/images/birthday-hero.jpg' }),
    sec('countdown', { heading: 'Party starts in' }),
    sec('details', { heading: 'The Party' }),
    sec('rsvp', { heading: 'See you there?', subtitle: 'RSVP by 1 November 2026', buttonText: "I'm coming!" }),
    sec('footer', { text: 'See you at the party!' }),
  ]
  const birthday = await db.event.create({
    data: {
      ownerId: john.id,
      name: "Aurora's 30th Birthday",
      slug: 'aurora-30',
      type: 'birthday',
      status: 'draft',
      eventDate: '2026-11-14',
      startTime: '19:00',
      endTime: '23:30',
      timezone: 'Asia/Dubai',
      venue: 'Rooftop 27',
      address: 'Dubai Marina, Dubai',
      description: 'Dinner, drinks and dancing under the stars.',
      hostNames: 'Aurora Reed',
      contactEmail: 'aurora@email.com',
      contactPhone: '',
      theme: JSON.stringify({ primary: '#C97B2D', secondary: '#FDF6EC', text: '#3B2E1F', background: '#FFFCF7', headingFont: 'Playfair Display', bodyFont: 'Inter', buttonStyle: 'pill', borderRadius: 24, spacing: 1 }),
      sections: JSON.stringify(birthdaySections),
      settings: JSON.stringify({ rsvpMode: 'public', rsvpPassword: '', rsvpDeadline: '2026-11-01', allowPlusOne: true, maxGuests: 2, allowEdit: true, indexable: false, notifyEveryRsvp: true, dailySummary: false, customDomain: '', domainStatus: 'none' }),
      gallery: JSON.stringify([{ url: '/images/birthday-hero.jpg', caption: 'Save the date' }]),
      accommodations: JSON.stringify([]),
      registryItems: JSON.stringify([]),
    },
  })
  const bGroup = await db.guestGroup.create({ data: { eventId: birthday.id, name: 'Friends', color: '#C97B2D', description: '' } })
  for (let i = 0; i < 12; i++) {
    await db.guest.create({
      data: {
        eventId: birthday.id,
        groupId: bGroup.id,
        name: nextName(),
        email: `guest${i}.aurora@example.com`,
        status: i < 5 ? 'attending' : i < 8 ? 'declined' : 'pending',
        partySize: i < 5 && i % 2 === 0 ? 2 : 1,
        token: generateToken(),
        invited: i < 8,
        invitedAt: i < 8 ? new Date(now - 10 * DAY) : null,
      },
    })
  }

  const corpSections = [
    sec('hero', { heading: 'Future Summit 2026', subheading: 'Annual Product Conference', dateText: '05 December 2026', locationText: 'Emirates Towers, Dubai', buttonText: 'Register' }, { height: 'screen', overlay: 45, bgImage: '/images/corporate-hero.jpg' }),
    sec('schedule', { heading: 'Agenda' }),
    sec('rsvp', { heading: 'Reserve your seat', subtitle: 'Seats are limited', buttonText: 'Register' }),
    sec('footer', { text: 'Future Summit 2026' }),
  ]
  const corp = await db.event.create({
    data: {
      ownerId: john.id,
      name: 'Future Summit 2026',
      slug: 'future-summit',
      type: 'corporate',
      status: 'published',
      eventDate: '2026-12-05',
      startTime: '09:00',
      endTime: '18:00',
      timezone: 'Asia/Dubai',
      venue: 'Emirates Towers',
      address: 'Sheikh Zayed Road, Dubai',
      description: 'A full day of keynotes, workshops and networking.',
      hostNames: 'Future Labs',
      contactEmail: 'events@futurelabs.io',
      contactPhone: '',
      theme: JSON.stringify({ primary: '#2F6B4F', secondary: '#F0F4F1', text: '#1C2420', background: '#FFFFFF', headingFont: 'Inter', bodyFont: 'Inter', buttonStyle: 'square', borderRadius: 4, spacing: 1.1 }),
      sections: JSON.stringify(corpSections),
      settings: JSON.stringify({ rsvpMode: 'public', rsvpPassword: '', rsvpDeadline: '2026-11-20', allowPlusOne: false, maxGuests: 1, allowEdit: true, indexable: true, notifyEveryRsvp: true, dailySummary: true, customDomain: '', domainStatus: 'none' }),
      gallery: JSON.stringify([{ url: '/images/corporate-hero.jpg', caption: 'Last year summit' }]),
      accommodations: JSON.stringify([]),
      registryItems: JSON.stringify([]),
    },
  })
  const cGroup = await db.guestGroup.create({ data: { eventId: corp.id, name: 'Attendees', color: '#2F6B4F', description: '' } })
  for (let i = 0; i < 24; i++) {
    const name = nextName()
    await db.guest.create({
      data: {
        eventId: corp.id,
        groupId: cGroup.id,
        name,
        email: `attendee${i}.summit@example.com`,
        status: i < 14 ? 'attending' : i < 18 ? 'declined' : 'pending',
        partySize: 1,
        token: generateToken(),
        invited: true,
        invitedAt: new Date(now - 8 * DAY),
      },
    })
  }

  // ---------- Notifications ----------
  await db.notification.createMany({
    data: [
      { userId: john.id, title: 'New RSVP', body: 'Sarah Smith confirmed attendance with 2 guests.', type: 'rsvp', read: false },
      { userId: john.id, title: 'Payment received', body: 'David Brown contributed $250 to the Honeymoon Fund.', type: 'payment', read: false },
      { userId: john.id, title: 'Event published', body: "John & Emily's Wedding is now live at /john-emily.", type: 'system', read: true },
    ],
  })

  // Make the wedding the most recently updated event so it is the default on login
  await db.event.update({ where: { id: event.id }, data: { updatedAt: new Date() } })

  console.log('Seed complete.')
  console.log('  Login: john@example.com / demo1234')
  console.log('  Admin: admin@onlinersvp.com / admin1234')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })

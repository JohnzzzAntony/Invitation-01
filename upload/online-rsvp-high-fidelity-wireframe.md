# Online RSVP — High-Fidelity Product Wireframe & Full Build Specification

## 1. Product Overview

Build a modern, production-ready RSVP/event website SaaS inspired by the feature set of Online-RSVP.

The platform should combine:

- Event website builder
- Invitation builder
- RSVP management
- Guest CRM
- Guest groups
- Sub-events
- Email invitations and reminders
- QR-code RSVP
- Event analytics
- Gallery
- Accommodation
- Registry/donations
- Payments
- Custom domains
- Template marketplace
- Admin/SaaS management

The product should feel like a combination of:

- Canva
- Shopify Theme Editor
- Framer
- Eventbrite

but with a much simpler event-creation workflow.

---

# 2. Core Product Architecture

```text
ONLINE RSVP PLATFORM
│
├── Marketing Website
│   ├── Home
│   ├── Features
│   ├── Designs
│   ├── Pricing
│   ├── FAQ
│   └── Contact
│
├── Authentication
│   ├── Login
│   ├── Register
│   ├── Forgot Password
│   └── Email Verification
│
├── Event Creation
│   ├── Event Type
│   ├── Event Details
│   ├── Template Selection
│   └── Initial Setup
│
├── Event Dashboard
│   ├── Overview
│   ├── Website
│   ├── Design
│   ├── Guests
│   ├── RSVP
│   ├── Invitations
│   ├── Payments
│   ├── Analytics
│   └── Settings
│
├── Event Website Builder
│   ├── Sections
│   ├── Theme
│   ├── Typography
│   ├── Colors
│   ├── Media
│   ├── Responsive Preview
│   └── Publishing
│
├── Public Event Website
│   ├── Hero
│   ├── Story
│   ├── Event Details
│   ├── Schedule
│   ├── Gallery
│   ├── Map
│   ├── Accommodation
│   ├── Registry
│   ├── RSVP
│   └── Contact
│
└── Super Admin
    ├── Users
    ├── Events
    ├── Templates
    ├── Payments
    ├── Domains
    ├── Emails
    ├── Reports
    └── Platform Settings
```

---

# 3. Marketing Website

## 3.1 Header

```text
┌────────────────────────────────────────────────────────────────────┐
│ LOGO      Features   Designs   Pricing   FAQ   Login   [Get Started]│
└────────────────────────────────────────────────────────────────────┘
```

Requirements:

- Sticky navigation
- Responsive mobile menu
- Logo
- Features
- Design gallery
- Pricing
- FAQ
- Login
- Primary CTA
- Optional language selector

---

# 4. Homepage

## 4.1 Hero

```text
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│               Create your perfect event website                   │
│                                                                    │
│       Beautiful invitations. Easy RSVPs. Happy guests.            │
│                                                                    │
│ Create a stunning event website in minutes and manage every guest  │
│ from one simple dashboard.                                         │
│                                                                    │
│       [Create My Event]       [Explore Designs]                   │
│                                                                    │
│          One-time pricing • Unlimited guests                      │
│                                                                    │
│                    ┌──────────────────────┐                        │
│                    │                      │                        │
│                    │  EVENT WEBSITE      │                        │
│                    │     PREVIEW         │                        │
│                    │                      │                        │
│                    └──────────────────────┘                        │
└────────────────────────────────────────────────────────────────────┘
```

Hero requirements:

- Large event website mockup
- Animated preview
- Primary CTA
- Secondary CTA
- Trust indicators
- Responsive layout

---

# 5. Template Showcase

```text
Popular designs

[Wedding] [Birthday] [Baby] [Corporate] [Party]

┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ PREVIEW  │ │ PREVIEW  │ │ PREVIEW  │ │ PREVIEW  │
│          │ │          │ │          │ │          │
└──────────┘ └──────────┘ └──────────┘ └──────────┘

Modern       Floral       Luxury       Minimal

                [Explore All Designs]
```

Template filters:

- Wedding
- Engagement
- Birthday
- Anniversary
- Baby shower
- Corporate
- Party
- Graduation
- Religious
- Other

Style filters:

- Modern
- Minimal
- Luxury
- Floral
- Classic
- Romantic
- Editorial
- Dark
- Colorful

---

# 6. How It Works

```text
01                 02                 03
Choose             Customize          Invite

Design             Event Website      Guests
   │                  │                  │
   └──────────────────┴──────────────────┘
                       │
                       ▼
                  Track RSVPs
```

Steps:

1. Choose a design
2. Customize event
3. Add/import guests
4. Send invitations
5. Track RSVPs

---

# 7. Feature Sections

## 7.1 Website Builder

Show:

- Live website preview
- Drag and drop
- Templates
- Theme customization
- Mobile preview
- Desktop preview
- Section reordering

## 7.2 Guest Management

Show:

- Total guests
- Confirmed
- Pending
- Declined
- Guest groups
- Search/filter
- Import/export

## 7.3 RSVP Management

Show:

- RSVP responses
- Custom questions
- Meal choices
- Dietary requirements
- Plus-one management
- Sub-event responses

## 7.4 Invitations

Show:

- Email invitations
- Save the date
- Reminders
- RSVP confirmations
- QR codes
- Personalized links

---

# 8. Authentication

## Login

```text
┌──────────────────────────────────┐
│             LOGO                 │
│                                  │
│        Welcome back              │
│                                  │
│ Email                            │
│ [________________________]       │
│                                  │
│ Password                         │
│ [________________________]       │
│                                  │
│ [        Sign In        ]        │
│                                  │
│ Forgot password?                 │
│                                  │
│ ───────── OR ─────────           │
│                                  │
│ [ Continue with Google ]         │
│                                  │
│ Don't have an account? Sign up   │
└──────────────────────────────────┘
```

Support:

- Email/password
- Google OAuth
- Email verification
- Password reset
- Session management
- Optional 2FA

---

# 9. Event Creation Flow

## Step 1 — Event Type

```text
Create your event

What are you celebrating?

┌────────────┐ ┌────────────┐ ┌────────────┐
│ Wedding    │ │ Birthday   │ │ Baby       │
└────────────┘ └────────────┘ └────────────┘

┌────────────┐ ┌────────────┐ ┌────────────┐
│ Party      │ │ Corporate  │ │ Other      │
└────────────┘ └────────────┘ └────────────┘

                              [Continue]
```

---

# 10. Event Details

Fields:

```text
Event Name
Event Date
Start Time
End Time
Timezone
Venue
Address
Description
Host Names
Contact Information
```

Example:

```text
Event name
[ John & Emily's Wedding ]

Date
[ 24 / 10 / 2026 ]

Start time
[ 05:30 PM ]

End time
[ 11:00 PM ]

Timezone
[ Asia/Dubai ]

Venue
[ Grand Ballroom ]

Address
[ Dubai, UAE ]

[Continue]
```

---

# 11. Template Selection

```text
Choose your design

Search designs...

Filters:
Wedding | Modern | Floral | Luxury | Minimal

┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ PREVIEW  │ │ PREVIEW  │ │ PREVIEW  │ │ PREVIEW  │
│          │ │          │ │          │ │          │
└──────────┘ └──────────┘ └──────────┘ └──────────┘

[Preview]     [Preview]     [Preview]     [Preview]

[Use This Design]
```

Template marketplace requirements:

- Search
- Categories
- Tags
- Favorites
- Preview
- Desktop/mobile preview
- Duplicate
- Use template
- Admin publishing
- Featured templates

---

# 12. Main Event Dashboard

Route:

```text
/app/events/:eventId
```

Wireframe:

```text
┌─────────────────────────────────────────────────────────────────────┐
│ LOGO       John & Emily Wedding ▼                    🔔  👤         │
├──────────────┬──────────────────────────────────────────────────────┤
│ OVERVIEW     │ Good morning, John 👋                               │
│              │                                                      │
│ Website      │ Your event is 48 days away                          │
│ Design       │                                                      │
│ Guests       │ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐        │
│ RSVP         │ │ Guests │ │ Yes    │ │ Pending│ │ No     │        │
│ Invitations  │ │ 186    │ │ 121    │ │ 42     │ │ 23     │        │
│ Payments     │ └────────┘ └────────┘ └────────┘ └────────┘        │
│ Analytics    │                                                      │
│ Settings     │ RSVP RATE                                            │
│              │ ███████████████████░░░░ 65%                         │
│              │                                                      │
│              │ Recent RSVPs                                         │
│              │ ┌──────────────────────────────────────────────┐   │
│              │ │ Sarah Smith   ✓ Attending   2 guests         │   │
│              │ │ Michael Brown ✓ Attending   1 guest          │   │
│              │ │ David Wilson  ? Pending     —                │   │
│              │ └──────────────────────────────────────────────┘   │
│              │                                                      │
│              │ [View Event]             [Edit Website]             │
└──────────────┴──────────────────────────────────────────────────────┘
```

---

# 13. Website Builder

The website builder is the most important application screen.

Recommended UX:

- Similar to Shopify Theme Editor + Canva + Framer
- Drag/drop sections
- Live preview
- Responsive preview
- Right-side property editor
- Undo/redo
- Autosave
- Duplicate section
- Hide/show section
- Reorder
- Preview
- Publish

Wireframe:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ ← Dashboard   Event Website       Saved ✓   Preview   Publish          │
├──────────────┬───────────────────────────────────────┬─────────────────┤
│ ADD          │                                       │ EDIT            │
│              │                                       │                 │
│ + Section    │          LIVE WEBSITE                 │ Section         │
│ + Text       │                                       │                 │
│ + Image      │       JOHN & EMILY                    │ Background      │
│ + Gallery    │       We're getting married           │ [Image]         │
│ + Schedule   │                                       │                 │
│ + RSVP       │          24 OCT 2026                  │ Overlay         │
│ + Map        │                                       │ ███████         │
│ + Countdown  │             DUBAI                     │                 │
│ + Video      │                                       │ Typography      │
│ + Gifts      │        [ RSVP NOW ]                   │                 │
│ + Hotel      │                                       │ Heading         │
│ + Contact    │                                       │ [Font]          │
│              │                                       │                 │
│ SECTIONS     │                                       │ Button          │
│              │                                       │ [Style]         │
│ ☰ Hero       │                                       │                 │
│ ☰ Story      │                                       │                 │
│ ☰ Schedule   │                                       │                 │
│ ☰ Gallery    │                                       │                 │
│ ☰ RSVP       │                                       │                 │
└──────────────┴───────────────────────────────────────┴─────────────────┘
```

---

# 14. Builder Components

Available components:

```text
Hero
Text
Rich Text
Image
Image Gallery
Video
Story
Event Details
Schedule
Countdown
RSVP
Map
Accommodation
Registry
Donation
Gift
Contact
Social Links
Separator
Spacer
Button
FAQ
Footer
Custom HTML
```

Every section should support:

- Add
- Edit
- Duplicate
- Hide
- Delete
- Drag/reorder
- Desktop settings
- Tablet settings
- Mobile settings

---

# 15. Builder Left Panel

```text
ADD SECTION

Basic
├── Text
├── Image
├── Button
├── Divider
└── Spacer

Event
├── Event Details
├── Schedule
├── Countdown
├── RSVP
└── Map

Media
├── Gallery
├── Video
└── Slideshow

Guest Information
├── Accommodation
├── Registry
├── Gifts
└── Contact
```

---

# 16. Builder Right Panel

```text
SECTION SETTINGS

Layout
├── Width
├── Height
├── Alignment
├── Padding
└── Margin

Background
├── Color
├── Image
├── Video
└── Overlay

Typography
├── Font
├── Size
├── Weight
├── Line Height
└── Letter Spacing

Animation
├── Fade
├── Slide
├── Scale
└── None

Responsive
├── Desktop
├── Tablet
└── Mobile
```

---

# 17. Theme Customization

```text
THEME

Colors

Primary
[ #9A7B5B ]

Secondary
[ #F6F1EA ]

Text
[ #272727 ]

Background
[ #FFFFFF ]

Typography

Heading
[ Cormorant Garamond ▼ ]

Body
[ Inter ▼ ]

Buttons

○ Rounded
○ Square
○ Pill

Spacing
[────────●────]

Border Radius
[────●──────]
```

Global theme tokens should be stored separately from section content.

---

# 18. Responsive Preview

Toolbar:

```text
[ Desktop ] [ Tablet ] [ Mobile ]
```

Mobile preview:

```text
┌────────────────┐
│                │
│   JOHN & EMILY │
│                │
│  We're getting │
│    married     │
│                │
│    24 OCT      │
│                │
│  [ RSVP NOW ]  │
│                │
└────────────────┘
```

All components must support responsive overrides.

---

# 19. Public Event Website

Public route:

```text
/:eventSlug
```

Example:

```text
john-emily.yourplatform.com
```

Hero:

```text
┌─────────────────────────────────────────────┐
│                                             │
│              FULL SCREEN PHOTO              │
│                                             │
│                 JOHN & EMILY                │
│                                             │
│              ARE GETTING MARRIED            │
│                                             │
│                24 OCTOBER 2026              │
│                     DUBAI                   │
│                                             │
│                  [RSVP NOW]                 │
│                                             │
│                    ↓                        │
└─────────────────────────────────────────────┘
```

---

# 20. Public Website Section Order

Default:

```text
HERO
↓
WELCOME
↓
OUR STORY
↓
COUNTDOWN
↓
EVENT DETAILS
↓
SCHEDULE
↓
PHOTO GALLERY
↓
LOCATION / MAP
↓
ACCOMMODATION
↓
REGISTRY
↓
RSVP
↓
CONTACT
↓
FOOTER
```

Users can reorder or remove sections.

---

# 21. Guest Management

Route:

```text
/app/events/:eventId/guests
```

Wireframe:

```text
┌───────────────────────────────────────────────────────────────┐
│ Guests                                      [+ Add Guest]     │
├───────────────────────────────────────────────────────────────┤
│ Search guests...       Group ▼      Status ▼      [Import]    │
│                                                               │
│ □ Name             Group       RSVP       Guests     Actions  │
│                                                               │
│ □ Sarah Smith      Family      ✓ Yes        2       ⋮        │
│ □ David Brown      Friends     ? Pending    1       ⋮        │
│ □ Emma Wilson      Family      ✓ Yes        3       ⋮        │
│ □ John Davis       VIP         ✕ No         0       ⋮        │
│                                                               │
│ 186 guests                                                    │
└───────────────────────────────────────────────────────────────┘
```

Functions:

- Add guest
- Edit guest
- Delete guest
- Search
- Filter
- Sort
- Bulk actions
- Import CSV/XLSX
- Export CSV/XLSX
- Assign group
- Assign sub-events
- Send invitation
- Resend invitation

---

# 22. Guest Profile

```text
┌──────────────────────────────────────────────┐
│ Sarah Smith                              ×   │
├──────────────────────────────────────────────┤
│ Email                                        │
│ sarah@email.com                              │
│                                              │
│ RSVP                                          │
│ ✓ Attending                                  │
│                                              │
│ Party                                         │
│ 2 guests                                     │
│                                              │
│ Group                                         │
│ Family                                       │
│                                              │
│ Meal                                          │
│ Vegetarian                                   │
│                                              │
│ Dietary                                       │
│ Vegetarian                                   │
│                                              │
│ Notes                                         │
│ Near bride's family                          │
│                                              │
│ [Edit] [Send Message]                        │
└──────────────────────────────────────────────┘
```

---

# 23. Guest Groups

```text
Guest Groups

Family                  52
Friends                 74
Bride's Family          30
Groom's Family          30
VIP                     10

[+ Create Group]
```

Group functionality:

- Group name
- Group description
- Color/tag
- Members
- Sub-event permissions
- RSVP questions
- Invitation campaign
- Visibility rules

---

# 24. Conditional Guest Logic

Example:

```text
IF guest.group == "Family"

SHOW:
- Wedding Ceremony
- Reception
- Brunch

IF guest.group == "VIP"

SHOW:
- Wedding Ceremony
- Reception
- VIP Dinner
```

This logic should also control:

- Questions
- Events
- Invitations
- Content visibility
- Ticket/payment requirements

---

# 25. RSVP Form Builder

```text
RSVP FORM

┌─────────────────────────────────────────────┐
│ Will you attend?                            │
│                                             │
│ ○ Joyfully accepts                          │
│ ○ Regretfully declines                      │
└─────────────────────────────────────────────┘

Questions

☰ Number of guests
☰ Guest names
☰ Meal selection
☰ Dietary requirements
☰ Song request
☰ Accommodation
☰ Transportation
☰ Custom question

[+ Add Question]
```

Question types:

- Yes/No
- Short text
- Long text
- Number
- Dropdown
- Radio
- Checkbox
- Date
- File upload
- Meal selection
- Guest selector

---

# 26. Conditional RSVP Questions

```text
Question:
Will you attend?

○ Yes
○ No

IF YES:
    Show:
    - Number of guests
    - Guest names
    - Meal selection
    - Accommodation
    - Transportation

IF NO:
    Show:
    - Optional message
```

The condition engine should support:

- Equals
- Not equals
- Contains
- Greater than
- Less than
- Group membership
- Event participation
- RSVP status

---

# 27. Sub-Events

```text
EVENTS

Wedding Ceremony
24 Oct
05:00 PM

Reception
24 Oct
07:00 PM

Sunday Brunch
25 Oct
11:00 AM

[+ Add Event]
```

Fields:

```text
Name
Date
Start Time
End Time
Venue
Description
Map
Capacity
Guest Groups
RSVP Required
Dress Code
```

---

# 28. Invitation Manager

```text
INVITATIONS

┌────────────────────────────────────────────┐
│ Save the Date                              │
│ Sent: 186                                  │
│ Opened: 171                                │
│ Clicked: 143                               │
│ [View Campaign]                            │
├────────────────────────────────────────────┤
│ Official Invitation                        │
│ Sent: 186                                  │
│ Opened: 168                                │
│ Clicked: 149                               │
│ [View Campaign]                            │
├────────────────────────────────────────────┤
│ RSVP Reminder                              │
│ Scheduled: Oct 10                          │
└────────────────────────────────────────────┘

[Create Invitation]
```

Campaign types:

- Save the Date
- Invitation
- Reminder
- RSVP confirmation
- Event update
- Thank you
- Custom

---

# 29. Email Designer

```text
┌───────────────┬──────────────────────────────┐
│ COMPONENTS    │                              │
│               │       EMAIL PREVIEW          │
│ Text          │                              │
│ Image         │       JOHN & EMILY           │
│ Button        │                              │
│ Divider       │       You're Invited         │
│ Spacer        │                              │
│               │       October 24, 2026        │
│               │       Dubai                  │
│               │                              │
│               │       [RSVP NOW]             │
└───────────────┴──────────────────────────────┘
```

Email system:

- Templates
- Variables
- Personalization
- Campaigns
- Scheduling
- Open tracking
- Click tracking
- Delivery tracking
- Bounce handling
- Unsubscribe handling

Variables:

```text
{{guest.first_name}}
{{guest.last_name}}
{{event.name}}
{{event.date}}
{{event.venue}}
{{event.rsvp_url}}
{{event.map_url}}
```

---

# 30. Personalized RSVP URLs

Every guest can have a unique URL:

```text
/event/john-emily/rsvp?guest=unique-token
```

Requirements:

- Cryptographically secure token
- Token expiration option
- Guest identification
- No sensitive information in URL
- Optional guest-list-only mode
- Ability to regenerate token
- QR code generation

---

# 31. RSVP Guest Experience

## Step 1

```text
You're invited!

John & Emily's Wedding

Please enter your name

[________________________]

[Continue]
```

## Step 2

```text
Hello Sarah! ❤️

Will you be joining us?

[ YES, I'LL BE THERE ]

[ NO, I CAN'T MAKE IT ]
```

## Step 3

```text
Who will be attending?

✓ Sarah Smith
✓ Michael Smith

[ + Add Guest ]

Maximum guests: 2

[Continue]
```

## Step 4

```text
Dinner selection

Sarah
○ Chicken
○ Beef
○ Vegetarian

Michael
○ Chicken
○ Beef
○ Vegetarian

[Continue]
```

## Step 5

```text
Almost done!

Dietary requirements
[________________________]

Song you'd love to hear
[________________________]

[Submit RSVP]
```

## Success

```text
✓

You're confirmed!

We can't wait to see you.

John & Emily
October 24, 2026

[Add to Calendar]
[View Event Website]
```

---

# 32. RSVP Security Modes

## Public RSVP

Anyone with the link can RSVP.

## Password Protected

```text
This event is private.

Enter password

[____________]

[Enter Event]
```

## Guest List Only

```text
Enter your name

[____________]

We found your invitation ✓

[Continue]
```

---

# 33. QR Code

```text
YOUR RSVP QR CODE

        █████████
        ██     ██
        ██ ███ ██
        ██     ██
        █████████

Scan to RSVP

john-emily.yourplatform.com

[Download PNG]
[Download SVG]
[Print]
```

QR codes should support:

- Event URL
- Guest-specific URL
- Invitation URL
- Table/check-in URL
- SVG/PNG
- Print layout

---

# 34. Analytics Dashboard

```text
ANALYTICS

Total invited                186
RSVP submitted               144
Attending                    121
Declined                      23
Pending                       42

RSVP RATE
██████████████████░░░ 77%

EMAIL PERFORMANCE

Sent                          186
Opened                        171
Clicked                       143

GUEST RESPONSE TREND

200 ┤
    │             ╭─────
150 ┤       ╭─────╯
    │  ╭────╯
100 ┤──╯
    └────────────────────
```

Analytics:

- Guests
- RSVP conversion
- Invitation delivery
- Email opens
- Email clicks
- Page views
- RSVP submissions
- Event attendance
- Payment revenue
- Traffic sources
- Device type
- Geographic data where appropriate

---

# 35. Payments

```text
PAYMENTS

Total collected
$4,850

Transactions
────────────────────────────────
Sarah Smith       Donation     $100
David Brown       Ticket       $250
Emma Wilson       Gift         $150

[Export]
```

Support:

- Stripe
- Tickets
- Donations
- Registry
- Gift contributions
- Registration fees
- Payment status
- Refunds
- Webhooks
- Receipts

---

# 36. Accommodation

```text
WHERE TO STAY

Grand Hotel
★★★★★

2.4 km from venue

Starting from $180/night

[View Hotel]

Airport Hotel
★★★★

5.2 km from venue

Starting from $120/night

[View Hotel]
```

Fields:

```text
Hotel Name
Description
Image
Address
Distance
Website
Booking URL
Price
Contact
Map
```

---

# 37. Registry

```text
OUR REGISTRY ❤️

Help us celebrate our new beginning.

[Gift Card]
[Honeymoon Fund]
[Home Fund]

$50    $100    $250    Custom

[Contribute]
```

Support:

- External registry links
- Internal donation items
- Honeymoon fund
- Gift fund
- Custom amount
- Payment integration

---

# 38. Gallery

Builder:

```text
GALLERY

[Upload Photos]

┌────┐ ┌────┐ ┌────┐ ┌────┐
│    │ │    │ │    │ │    │
└────┘ └────┘ └────┘ └────┘

Grid
Masonry
Slider
Fullscreen
```

Features:

- Drag/drop upload
- Multiple upload
- Image optimization
- WebP/AVIF
- Alt text
- Captions
- Reordering
- Lazy loading
- Lightbox
- Video support

---

# 39. Event Settings

```text
SETTINGS

General
├── Event information
├── Event URL
├── Language
└── Timezone

Privacy
├── Password
├── Guest-list restriction
└── Search engine visibility

RSVP
├── Deadline
├── Plus-one settings
├── Maximum guests
└── Allow editing

Notifications
├── Every RSVP
├── Daily summary
└── Disable

Admins
├── Owner
├── Admin
├── Editor
└── Viewer

Integrations
├── Google Analytics
├── Meta Pixel
├── Stripe
├── Google Maps
└── Calendar
```

---

# 40. Custom Domain

```text
EVENT URL

john-emily.yourplatform.com

OR

www.johnandemily.com

[Connect Domain]
```

DNS instructions:

```text
Type       Host       Value

CNAME      www        cname.yourplatform.com
```

Requirements:

- Automatic SSL
- Domain verification
- DNS validation
- Custom subdomain
- Apex domain support if possible
- Domain status
- Remove domain
- Redirect support

---

# 41. Admin Panel

```text
ADMIN

Dashboard

Users
Events
Templates
Payments
Subscriptions
Emails
Reports
Support
Media
Domains
Settings
```

---

# 42. Admin Dashboard

```text
PLATFORM OVERVIEW

Users             24,820
Active Events      8,421
RSVPs             684,210
Revenue           $210,420

New Users
███████████████████

Events Created
██████████████████████

Revenue
████████████████████
```

Admin metrics:

- Total users
- Active users
- New registrations
- Events created
- Published events
- RSVP submissions
- Emails sent
- Revenue
- Failed payments
- Storage
- Active domains

---

# 43. Template CMS

```text
TEMPLATE MANAGER

┌────────────────────────────────────────────┐
│ Template                    Status         │
├────────────────────────────────────────────┤
│ Eucalyptus                 Published       │
│ Modern Minimal             Published       │
│ White Rose                 Published       │
│ Luxury Gold                Draft           │
│ Dark Wedding               Published       │
└────────────────────────────────────────────┘

[+ Create Template]
```

Template structure:

```text
Template
├── ID
├── Name
├── Slug
├── Category
├── Tags
├── Preview images
├── Theme JSON
├── Sections
├── Typography
├── Colors
├── Responsive rules
├── Default content
└── Assets
```

---

# 44. Template Engine

Templates must NOT be hard-coded as individual websites.

Use a schema-driven architecture.

Example:

```json
{
  "template": "modern-wedding",
  "theme": {
    "primary": "#9A7B5B",
    "background": "#FFFFFF",
    "headingFont": "Cormorant Garamond",
    "bodyFont": "Inter"
  },
  "sections": [
    {
      "type": "hero",
      "settings": {
        "height": "100vh",
        "alignment": "center"
      }
    },
    {
      "type": "countdown",
      "settings": {}
    },
    {
      "type": "event-details",
      "settings": {}
    }
  ]
}
```

This architecture allows 100+ templates to use the same rendering engine.

---

# 45. Database Architecture

Recommended tables:

```text
users
profiles

events
event_settings
event_domains

templates
template_sections
template_assets

pages
page_sections
section_settings

guests
guest_groups
guest_group_members

rsvp_forms
rsvp_questions
rsvp_answers

sub_events
sub_event_guests

invitations
invitation_campaigns
email_templates
email_logs

payments
payment_transactions

galleries
gallery_images

accommodations
registry_items

notifications

event_admins

analytics_events
```

---

# 46. Entity Relationships

```text
USER
 │
 └── EVENT
      │
      ├── TEMPLATE
      │
      ├── WEBSITE
      │    ├── Pages
      │    ├── Sections
      │    ├── Gallery
      │    ├── Schedule
      │    └── Modules
      │
      ├── GUESTS
      │    ├── Groups
      │    ├── RSVPs
      │    └── Answers
      │
      ├── SUB-EVENTS
      │
      ├── INVITATIONS
      │
      ├── PAYMENTS
      │
      └── ANALYTICS
```

---

# 47. API Architecture

Recommended REST API:

```text
/api/v1/auth
/api/v1/users
/api/v1/events
/api/v1/events/:id
/api/v1/events/:id/settings
/api/v1/events/:id/pages
/api/v1/events/:id/sections
/api/v1/events/:id/guests
/api/v1/events/:id/groups
/api/v1/events/:id/rsvp
/api/v1/events/:id/questions
/api/v1/events/:id/sub-events
/api/v1/events/:id/invitations
/api/v1/events/:id/payments
/api/v1/events/:id/analytics
/api/v1/events/:id/gallery
/api/v1/templates
/api/v1/domains
/api/v1/admin
```

---

# 48. Recommended Technology Stack

## Frontend

```text
Next.js
React
TypeScript
Tailwind CSS
shadcn/ui
Framer Motion
React Hook Form
Zustand
TanStack Query
```

## Backend

Recommended:

```text
Django
Django REST Framework
PostgreSQL
Redis
Celery
```

Alternative:

```text
Next.js
Node.js
PostgreSQL
Redis
BullMQ
```

For a large event SaaS, Django + PostgreSQL + Next.js is a strong architecture.

---

# 49. Infrastructure

```text
                    CLOUDFLARE
                        │
                        ▼
                    NEXT.JS
                        │
                        ▼
                    API / DJANGO
                        │
              ┌─────────┴─────────┐
              ▼                   ▼
         PostgreSQL             Redis
                                  │
                                  ▼
                               Celery
                                  │
                     ┌────────────┼────────────┐
                     ▼            ▼            ▼
                   Email         Jobs        Media
```

Recommended services:

- Cloudflare
- Vercel or equivalent frontend hosting
- VPS/container infrastructure for Django
- PostgreSQL
- Redis
- S3-compatible object storage
- Cloudinary if desired
- Stripe
- Resend/SendGrid
- Google Maps
- Google Calendar
- Sentry

---

# 50. URL Architecture

```text
/
├── /features
├── /designs
├── /pricing
├── /faq
├── /contact
├── /login
├── /register
│
├── /app
│   ├── /dashboard
│   ├── /events
│   └── /settings
│
├── /event/:id
│   ├── /overview
│   ├── /website
│   ├── /design
│   ├── /guests
│   ├── /rsvp
│   ├── /invitations
│   ├── /payments
│   ├── /analytics
│   └── /settings
│
└── /admin
    ├── /users
    ├── /events
    ├── /templates
    ├── /payments
    └── /analytics
```

Public events:

```text
https://event-slug.yourplatform.com
```

---

# 51. Mobile Dashboard

```text
┌────────────────────────────┐
│ ☰   John & Emily       ⋮   │
├────────────────────────────┤
│                            │
│        Overview            │
│                            │
│ ┌──────────┐ ┌──────────┐ │
│ │ Guests   │ │ RSVP     │ │
│ │ 186      │ │ 65%      │ │
│ └──────────┘ └──────────┘ │
│                            │
│ Recent responses           │
│                            │
│ Sarah Smith                │
│ ✓ Attending                │
│                            │
├────────────────────────────┤
│ Home Guests RSVP More      │
└────────────────────────────┘
```

Mobile requirements:

- Bottom navigation
- Touch-friendly controls
- Swipe interactions
- Mobile builder
- Responsive tables
- Bottom sheets
- Sticky actions

---

# 52. Design System

## Desktop

```text
Max width: 1440px
Sidebar: 260px
Cards: 12–16px radius
Buttons: 10–12px radius
```

## Typography

Display:

```text
Playfair Display
Cormorant Garamond
```

UI:

```text
Inter
Geist
```

## SaaS Colors

```text
Background     #F8F8F6
Surface        #FFFFFF
Text           #181816
Muted          #73736D
Border         #E7E5DF
Primary        #1F2937
```

Event themes should override these colors.

---

# 53. Accessibility

The application must target WCAG 2.2 AA.

Requirements:

- Keyboard navigation
- Visible focus states
- Semantic HTML
- Screen-reader labels
- Color contrast
- Reduced motion
- Accessible forms
- Accessible modals
- Accessible drag/drop alternative
- ARIA only where required

---

# 54. SEO

Public event websites should support:

```text
Title
Meta Description
Open Graph
Twitter/X Card
Canonical URL
Robots settings
Sitemap where appropriate
Structured Data
```

Allow users to disable indexing for private events.

Example:

```text
John & Emily Wedding | October 24, 2026
```

---

# 55. Performance

Target:

```text
LCP < 2.5s
CLS < 0.1
INP < 200ms
```

Implement:

- Image optimization
- Lazy loading
- CDN
- Responsive images
- WebP/AVIF
- Code splitting
- Server-side rendering
- Caching
- Database indexing

---

# 56. Security

Implement:

- HTTPS everywhere
- Secure cookies
- CSRF protection
- Rate limiting
- API authentication
- RBAC
- Input validation
- File validation
- Malware scanning for uploads
- SQL injection protection
- XSS protection
- Content Security Policy
- Audit logs
- Secure invitation tokens
- Payment webhook verification

---

# 57. Roles and Permissions

Roles:

```text
Owner
Admin
Editor
Viewer
```

Permissions:

```text
View event
Edit website
Manage guests
Manage RSVP
Send invitations
Manage payments
Manage domain
Manage settings
Delete event
```

---

# 58. Event State Machine

```text
DRAFT
  │
  ▼
SETUP
  │
  ▼
READY
  │
  ▼
PUBLISHED
  │
  ├──► PAUSED
  │
  └──► ARCHIVED
```

RSVP status:

```text
PENDING
   │
   ├──► ATTENDING
   │
   ├──► DECLINED
   │
   └──► CANCELLED
```

---

# 59. Complete User Journey

```text
LANDING PAGE
     ↓
CREATE ACCOUNT
     ↓
CREATE EVENT
     ↓
SELECT EVENT TYPE
     ↓
ENTER EVENT DETAILS
     ↓
CHOOSE TEMPLATE
     ↓
CUSTOMIZE WEBSITE
     ↓
CONFIGURE RSVP
     ↓
CREATE GUEST GROUPS
     ↓
IMPORT GUESTS
     ↓
CONFIGURE INVITATIONS
     ↓
CONNECT DOMAIN
     ↓
PAY / ACTIVATE
     ↓
PUBLISH
     ↓
SEND INVITATIONS
     ↓
       ┌─────────────────┐
       │                 │
       ▼                 ▼
     GUEST             OWNER
       │                 │
       ▼                 ▼
Visit Website       Dashboard
       │                 │
       ▼                 ▼
     RSVP          Track Responses
       │                 │
       └────────┬────────┘
                ▼
             ANALYTICS
                │
                ▼
            EVENT DAY
```

---

# 60. Recommended MVP

Build these first:

```text
✓ Authentication
✓ Event creation
✓ Event types
✓ Template system
✓ Website builder
✓ Public event website
✓ RSVP
✓ Guest management
✓ Custom RSVP questions
✓ Guest groups
✓ Dashboard
✓ Responsive design
✓ QR codes
✓ Import/export
```

---

# 61. Phase 2

```text
✓ Email invitations
✓ Email reminders
✓ RSVP confirmations
✓ Sub-events
✓ Countdown
✓ Gallery
✓ Google Maps
✓ Calendar integration
✓ Custom domains
✓ Multiple admins
✓ Advanced analytics
```

---

# 62. Phase 3

```text
✓ Stripe payments
✓ Donations
✓ Registry
✓ Accommodation
✓ Tickets
✓ Custom CSS
✓ Advanced automations
✓ SMS
✓ WhatsApp
✓ Marketing integrations
```

---

# 63. Phase 4

```text
✓ AI event website generation
✓ AI invitation generation
✓ AI copywriting
✓ AI RSVP analysis
✓ AI template generation
✓ Template marketplace
✓ Vendor integrations
✓ White-label
✓ Public API
```

---

# 64. Critical Architecture Principle

Do NOT hard-code each event website.

Use:

```text
Template
   ↓
Theme JSON
   ↓
Section Schema
   ↓
Page Builder
   ↓
Renderer
   ↓
Public Event Website
```

The same renderer must be able to generate hundreds of different event websites.

Example:

```text
Template A
    ↓
Hero
Story
Gallery
RSVP

Template B
    ↓
Hero
Countdown
Schedule
Map
RSVP

Template C
    ↓
Hero
Video
Story
Gallery
Registry
RSVP
```

All should use the same component system.

---

# 65. Recommended Component Architecture

```text
components/
│
├── ui/
│   ├── Button
│   ├── Input
│   ├── Modal
│   ├── Dropdown
│   ├── Tabs
│   └── Toast
│
├── builder/
│   ├── BuilderShell
│   ├── LeftPanel
│   ├── Canvas
│   ├── RightPanel
│   ├── SectionToolbar
│   ├── DevicePreview
│   └── HistoryManager
│
├── sections/
│   ├── Hero
│   ├── Story
│   ├── EventDetails
│   ├── Schedule
│   ├── Countdown
│   ├── Gallery
│   ├── Map
│   ├── RSVP
│   ├── Accommodation
│   ├── Registry
│   └── Footer
│
├── dashboard/
│   ├── StatsCards
│   ├── GuestTable
│   ├── RSVPChart
│   └── ActivityFeed
│
└── public-event/
    ├── EventRenderer
    ├── RSVPFlow
    └── EventNavigation
```

---

# 66. Event Builder Data Model

Each section should have:

```json
{
  "id": "section_123",
  "type": "hero",
  "order": 1,
  "visible": true,
  "settings": {
    "backgroundImage": "...",
    "overlayOpacity": 0.35,
    "alignment": "center",
    "height": "100vh"
  },
  "content": {
    "heading": "John & Emily",
    "subheading": "We're getting married",
    "buttonText": "RSVP Now"
  },
  "responsive": {
    "desktop": {},
    "tablet": {},
    "mobile": {}
  }
}
```

---

# 67. Autosave

Builder must autosave.

Recommended flow:

```text
User changes section
        ↓
Local state update
        ↓
Debounce 500–1000ms
        ↓
API save
        ↓
Revision created
        ↓
"Saved" indicator
```

Include:

- Undo
- Redo
- Revision history
- Restore previous version
- Draft/published versions

---

# 68. Publishing

```text
DRAFT
  │
  ▼
Preview
  │
  ▼
Publish
  │
  ▼
Generate/Update public website
  │
  ▼
CDN cache purge
  │
  ▼
LIVE
```

Publishing should not break the currently live version if a new draft contains an error.

---

# 69. Notifications

Support:

```text
New RSVP
RSVP changed
RSVP declined
Payment received
Invitation sent
Invitation failed
Reminder scheduled
Domain connected
Event published
```

Channels:

- In-app
- Email
- Optional SMS
- Optional WhatsApp

---

# 70. Calendar Integration

Support:

- Google Calendar
- Apple Calendar
- Outlook Calendar
- ICS download

Generated event:

```text
Event name
Date
Time
Timezone
Venue
Address
Description
Map link
```

---

# 71. Check-In Feature — Future

Optional future module:

```text
EVENT CHECK-IN

Total guests       186
Checked in         104
Remaining           82

Search guest

Sarah Smith
✓ Checked in

David Brown
[Check In]
```

Can support:

- QR check-in
- Guest search
- Table number
- VIP status
- Attendance timestamp

---

# 72. AI Features — Future

AI Event Generator:

```text
Tell us about your event

"Create a luxury wedding website for John and Emily.
The wedding is in Dubai on October 24.
Use a modern beige and gold style."

[Generate Website]
```

AI generates:

```text
Template
Theme
Hero
Event details
Story copy
Schedule
RSVP
Accommodation
Registry
```

AI invitation generator:

```text
Generate invitation

Tone:
○ Formal
○ Romantic
○ Friendly
○ Luxury

[Generate]
```

---

# 73. Final Product Structure

```text
MARKETING
   │
   ▼
AUTH
   │
   ▼
EVENT CREATION
   │
   ▼
EVENT DASHBOARD
   │
   ├── WEBSITE BUILDER
   │
   ├── GUEST MANAGEMENT
   │
   ├── RSVP BUILDER
   │
   ├── INVITATIONS
   │
   ├── SUB-EVENTS
   │
   ├── PAYMENTS
   │
   ├── GALLERY
   │
   ├── ANALYTICS
   │
   └── SETTINGS
   │
   ▼
PUBLIC EVENT WEBSITE
   │
   ▼
GUEST RSVP
   │
   ▼
EVENT ANALYTICS
```

---

# 74. Final Development Goal

The finished product should allow a non-technical user to go from:

```text
"I need an event website"
```

to:

```text
Beautiful event website
+
Personalized invitations
+
Guest database
+
RSVP system
+
Custom questions
+
Guest groups
+
Sub-events
+
QR codes
+
Email reminders
+
Payments
+
Analytics
+
Custom domain
```

without requiring technical knowledge.

The highest priority is the **schema-driven event builder + reusable template engine + RSVP/guest system**. These three systems should be designed together from the beginning so that new templates and new event types can be added without rebuilding the application.

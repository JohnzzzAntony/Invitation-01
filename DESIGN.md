# DESIGN.md: MyEventOS

## Source
- URL: https://myeventos.com/
- Capture date: 2026-09-09
- Evidence: Firecrawl `branding` scrape, full-page screenshot (1920×8372), page markdown,
  site map (18 URLs), plus live computed styles read from the rendered page
- Artifacts: kept **local only** in `.firecrawl/` (git-ignored). They are a competitor's
  screenshot and page copy, so they are deliberately not committed. Regenerate with:

  ```bash
  firecrawl scrape "https://myeventos.com" --format branding -o ".firecrawl/myeventos-branding.json" --pretty
  firecrawl scrape "https://myeventos.com" --full-page-screenshot --json -o ".firecrawl/shot.json"
  ```

> **Ownership note.** This file describes an *observed* design language so it can inform
> original work. It does not grant any right to MyEventOS's logo, brand name, product
> photography, illustrations or copy. Those are theirs. MyEventOS is also a direct
> competitor in this exact product category (online invitations, RSVP, guest management),
> so reproducing its look *and* its page structure verbatim is a trade-dress risk, not
> just a styling choice. Use the tokens; write your own words and art.

## Reference Screenshot

`.firecrawl/myeventos-screenshot.png` (1920×8372) — local only, see Source above.
The tokens below are the machine-readable form of the same page, and are what the
implementation actually used.

## Design Summary

Warm, editorial, restrained. A near-white page with a cream tint, deep-brown brand
accents, and a high-contrast near-black for primary actions. Big Playfair Display
headings in **medium (500), not bold**, set tight (60px type on a 60px line) against
small, plain Inter body copy. Pill-shaped buttons. Very little chrome: no heavy borders,
almost no shadow, no gradients. The page reads as a magazine spread with product
screenshots dropped into it — the invitation designs themselves carry all the colour.

## Design Tokens

### Colors

| Role | Value | Source |
|---|---|---|
| Brand primary | `#652901` (deep brown) | observed |
| Accent / link | `#5A2A06` | observed |
| Page background | `#FFFFFF` | observed |
| Warm page tint | `#faf7f2` | observed (`theme-color`) |
| Text primary | `#171717` | observed |
| Button primary bg | `#171717` | observed |
| Button primary text | `#FAFAFA` | observed |
| Button secondary bg | `#FFFFFF` | observed |
| Button secondary text | `#0A0A0A` | observed |
| Border / hairline | `#E5E5E5` | observed |
| Alternating section wash | ~3% neutral over white (`oklab(0.97 0 0 / 0.3)`) | observed |

Colour scheme is light-only. The brown is used sparingly — links and small brand marks —
not as a large fill.

### Typography

| Role | Family | Size | Weight | Line height |
|---|---|---|---|---|
| Display / headings | **Playfair Display**, serif | h1 60px, h2 36px | **500** | 60px on h1 (1.0) |
| Body | **Inter Variable**, sans-serif | 16px | 400 | 24px (1.5) |
| Tertiary | Karla | — | — | — |

The defining typographic choice is **Playfair at weight 500 with a 1.0 line height** —
tight, editorial, never bold. Inter is left completely plain.

Recommended fallbacks: `"Playfair Display", Georgia, serif` and
`"Inter", -apple-system, "Segoe UI", sans-serif`.

### Spacing And Layout

- Base unit: **4px** (Tailwind default scale)
- Card/panel radius: **8px**
- Button radius: fully pill (`9999px`; reported as `33554400px`)
- Content column: ~1280px max, inside a full-bleed page
- Section rhythm: generous vertical padding, applied on inner wrappers rather than the
  `<section>` elements themselves
- Shadow: essentially none. Secondary button carries only `0 1px 2px rgba(0,0,0,.05)`

### Motion

| Interaction | Value | Source |
|---|---|---|
| Colour / background / border hover | `0.15s cubic-bezier(0.4, 0, 0.2, 1)` | observed |
| Larger element transitions | `0.3s cubic-bezier(0.4, 0, 0.2, 1)` | observed |
| Scroll reveal | `opacity 0.6s, transform 0.6s` | observed |
| Box shadow | `0.15s cubic-bezier(0.4, 0, 0.2, 1)` | observed |

One easing curve throughout (Tailwind's default `ease-in-out`), two speeds: 150ms for
hover feedback, 600ms for entrance. Sections fade and translate in on scroll. No parallax,
no scroll-jacking, no decorative looping animation.

## Components

- **Buttons** — pill. Primary: near-black fill, off-white text, no shadow. Secondary:
  white, 1px `#E5E5E5` border, whisper of a shadow. Both animate colour over 150ms.
- **Cards** — 8px radius, hairline border, flat. Product screenshots sit inside them
  full-bleed with no inner padding.
- **Nav** — left logo, centred text links, right-aligned "Sign in" + a filled pill CTA.
  Links are plain 400-weight Inter, not uppercase.
- **Pricing** — three tiers (Free / All-in / Build your own) as plain bordered cards.
- **Footer** — multi-column link lists under small caps headings.

## Page Patterns

Homepage section order (from the captured markdown):

1. Hero — one Playfair line, two CTAs, then a wide rail of invitation covers
2. "Fill it in. No designing."
3. Pricing — "Simple pricing, per event"
4. "Make it yours first. Pay when you send it." — three supporting points
5. "Everything a host needs, nothing a host dreads" — long feature list, one h3 each
6. "Ask everything you'll need to plan, once"
7. FAQ — "Questions, answered"
8. Closing CTA — "Your next celebration starts with one link"
9. Footer

Site map (18 URLs): occasion landing pages (`/wedding-invitations`,
`/birthday-invitations`, `/engagement-invitations`, `/save-the-date`,
`/gender-reveal-invitations`), capability pages (`/guest-management`, `/online-rsvp`,
`/digital-invitations`, `/free-online-invitations`, `/for-event-planners`), a `/guides`
content hub with three articles, plus `/privacy`, `/terms`, `/credits`.

That IA is **SEO-led**: one indexable landing page per occasion and per capability. It is
the most transferable idea on the whole site and carries no design-copying risk.

## Content Style

Short declarative sentences, often two clauses split by a full stop —
"Fill it in. No designing." / "Make it yours first. Pay when you send it." Headings state
a benefit and gently name the pain ("Everything a host needs, nothing a host dreads").
CTAs are plain verbs: "Start creating", "Start free". No exclamation marks, no hype.

## Agent Build Instructions

To build something in this visual language **without copying MyEventOS**:

1. Load Playfair Display (500) and Inter. Set headings in Playfair 500 with `line-height: 1`
   at display sizes; leave body copy Inter 16/24.
2. Use a near-white page with a warm tint for alternating bands, one deep brand colour
   used sparingly for links, and near-black for primary buttons.
3. Make every button a pill. Keep borders hairline and shadows almost absent.
4. Use one easing curve (`cubic-bezier(.4,0,.2,1)`), 150ms for hover, 600ms for
   scroll-in fade + translate.
5. Let the product's own artwork supply the colour; keep the surrounding page quiet.
6. Write your own headings, your own photography, your own logo.

## Rerun Inputs

```
workflow: firecrawl-website-design-clone
source_url: https://myeventos.com/
target_stack: static HTML/CSS/JS (Invitara, public/)
output: DESIGN.md
```

/* gen-invites.mjs — build the 3D invitation templates.
 *
 * Emits one static public/invitation-<slug>.html per entry in THEMES below.
 * The five pages are the same document: same sections, same markup, same
 * shell script. A theme supplies a palette, two fonts, the name of a WebGL
 * scene in public/js/invites/, and its words — so the thing that actually
 * differs between templates lives in one readable table instead of being
 * smeared across five near-identical 1,100-line files.
 *
 * Run:  node scripts/gen-invites.mjs   (or: bun run gen:invites)
 *
 * The output files are GENERATED — edit the THEMES table here and re-run
 * rather than hand-editing public/invitation-<slug>.html.
 */

import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/* Google Fonts families each theme may ask for, mapped to the family+weights
   fragment the CSS2 API wants. Keeping this as a table means a theme names a
   face and never has to know about URL syntax. */
const FONT_URL = {
  'Playfair Display': 'Playfair+Display:wght@400;500;600',
  'Cormorant Garamond': 'Cormorant+Garamond:wght@300;400;600',
  'Cinzel': 'Cinzel:wght@400;500;600',
  'Marcellus': 'Marcellus',
  'Italiana': 'Italiana',
  'Great Vibes': 'Great+Vibes',
  'Parisienne': 'Parisienne',
  'Pinyon Script': 'Pinyon+Script',
  'Montserrat': 'Montserrat:wght@200;300;400;500',
  'Jost': 'Jost:wght@200;300;400;500',
  'Karla': 'Karla:wght@300;400;500'
};

/* ------------------------------------------------------------------ *
 *  The five templates                                                 *
 * ------------------------------------------------------------------ */
const THEMES = [
  {
    slug: 'aurora',
    name: 'Aurora',
    scene: 'aurora',
    blurb: 'Northern light over a midnight page — for a winter wedding or a late celebration.',
    accent: '#8fa6ff', accent2: '#dfe6ff', bg: '#080a18', fg: '#eef1fb', muted: '#8d93ad',
    display: 'Italiana', script: 'Pinyon Script', body: 'Jost',
    date: '2027-01-16T17:30:00',
    dateLabel: '16 · 01 · 2027',
    title: 'Under Northern Light',
    nameA: 'Ingrid', nameB: 'Aleksander',
    lede: 'Together with our families, we ask you to join us for an evening beneath the winter sky.',
    storyTitle: 'How the light found us',
    story: [
      'We met on the last night of a research season in Tromsø, both of us outside at two in the morning for the same reason, both of us pretending we were not cold.',
      'Four winters later, on the same stretch of shoreline, Aleksander asked a question he had been carrying since the first one.'
    ],
    storyNote: 'The 14th of February, 2026 — the night we said yes',
    ceremony: { when: 'Saturday, 16 January 2027', at: '5:30 in the evening', where: ['Ishavskatedralen', 'Tromsø, Norway'] },
    party: { when: 'Saturday, 16 January 2027', at: '8:00 in the evening', where: ['Fjellheisen Terrace', 'Tromsø, Norway'] },
    attire: { when: 'Black tie, warmly', at: 'Deep blue, silver & ice', where: ['Bring boots for the walk', 'Coats will be taken at the door'] },
    schedule: [
      ['5:00 pm', 'Guests gather', 'Please be seated by twenty past'],
      ['5:30 pm', 'The ceremony', 'Vows and the exchange of rings'],
      ['6:30 pm', 'Sky watch', 'Aquavit on the terrace, if the light comes'],
      ['8:00 pm', 'Dinner', 'Long tables, short speeches'],
      ['10:00 pm', 'First dance', 'Then the floor is yours'],
      ['1:00 am', 'Last dance', 'The night ends, the winter does not']
    ],
    footerNote: 'Tromsø, Norway · January 2027'
  },
  {
    slug: 'petals',
    name: 'Petals',
    scene: 'petals',
    blurb: 'Roses falling through warm light — a soft, romantic page for a spring or garden wedding.',
    accent: '#e0a3ae', accent2: '#f7e3d4', bg: '#1a1013', fg: '#f7eef0', muted: '#a89096',
    display: 'Cormorant Garamond', script: 'Parisienne', body: 'Karla',
    date: '2027-05-22T16:00:00',
    dateLabel: '22 · 05 · 2027',
    title: 'A Garden in May',
    nameA: 'Rosa', nameB: 'Elias',
    lede: 'We would love you with us in the garden, for the afternoon and all of the evening that follows.',
    storyTitle: 'Two summers and a wall',
    story: [
      'Rosa was repairing the wall at the bottom of the garden. Elias was the neighbour who kept offering advice about the wall, none of it useful, all of it an excuse.',
      'The wall took two summers to finish, which was roughly a year and a half longer than it needed to take.'
    ],
    storyNote: 'The 9th of June, 2026 — beside the finished wall',
    ceremony: { when: 'Saturday, 22 May 2027', at: '4:00 in the afternoon', where: ['The Old Rectory Garden', 'Wiltshire, England'] },
    party: { when: 'Saturday, 22 May 2027', at: '6:30 in the evening', where: ['The Glasshouse', 'The Old Rectory, Wiltshire'] },
    attire: { when: 'Garden formal', at: 'Blush, cream & soft green', where: ['The lawn is uneven — mind your heels', 'Shawls for after sunset'] },
    schedule: [
      ['3:30 pm', 'Arrivals', 'Lemonade on the terrace'],
      ['4:00 pm', 'The ceremony', 'Under the copper beech'],
      ['4:45 pm', 'Photographs', 'And a drink while we are gone'],
      ['6:30 pm', 'Dinner', 'In the glasshouse, as the light goes'],
      ['8:30 pm', 'First dance', 'Then dancing on the lawn'],
      ['12:00 am', 'Carriages', 'Cars from the front gate']
    ],
    footerNote: 'Wiltshire, England · May 2027'
  },
  {
    slug: 'gilded',
    name: 'Gilded',
    scene: 'gilded',
    blurb: 'Turning gold rings in a dust of light — formal, ceremonial, at home at a gala.',
    accent: '#d4af37', accent2: '#f7ecc9', bg: '#0f0d09', fg: '#f6f1e6', muted: '#9c9283',
    display: 'Cinzel', script: 'Great Vibes', body: 'Montserrat',
    date: '2027-10-09T19:00:00',
    dateLabel: '09 · 10 · 2027',
    title: 'The Gilded Evening',
    nameA: 'Vivienne', nameB: 'Aurelio',
    lede: 'You are invited to an evening of dinner, music and dancing, held in the old hall at the top of the hill.',
    storyTitle: 'Nineteen minutes late',
    story: [
      'Aurelio was nineteen minutes late to a dinner he had not wanted to attend. Vivienne had been seated next to the empty chair and had already decided to enjoy the evening regardless.',
      'He has been late to a great many things since, though never, she notes, to anything that mattered.'
    ],
    storyNote: 'The 2nd of March, 2026 — at the top of the same stairs',
    ceremony: { when: 'Saturday, 9 October 2027', at: '7:00 in the evening', where: ['Sala degli Specchi', 'Villa Aurelia, Rome'] },
    party: { when: 'Saturday, 9 October 2027', at: '9:00 in the evening', where: ['The Orangery', 'Villa Aurelia, Rome'] },
    attire: { when: 'Black tie', at: 'Gold, ivory & deep red', where: ['Decorations may be worn', 'No white, with our thanks'] },
    schedule: [
      ['6:30 pm', 'Reception', 'Champagne in the courtyard'],
      ['7:00 pm', 'The ceremony', 'In the hall of mirrors'],
      ['8:00 pm', 'Aperitivo', 'On the upper loggia'],
      ['9:00 pm', 'Dinner', 'Seated, five courses, one speech'],
      ['11:00 pm', 'First dance', 'The orchestra plays until two'],
      ['2:00 am', 'Close', 'Cars at the lower gate']
    ],
    footerNote: 'Rome, Italy · October 2027'
  },
  {
    slug: 'crystal',
    name: 'Crystal',
    scene: 'crystal',
    blurb: 'Cut stones turning in green light — cool and modern, good for a city evening.',
    accent: '#8fd3b0', accent2: '#e9f4ea', bg: '#08120e', fg: '#eaf3ee', muted: '#84998d',
    display: 'Marcellus', script: 'Pinyon Script', body: 'Jost',
    date: '2027-08-14T18:00:00',
    dateLabel: '14 · 08 · 2027',
    title: 'Cut & Polished',
    nameA: 'Mina', nameB: 'Rafael',
    lede: 'A short ceremony, a long dinner, and a view of the whole city while we do it.',
    storyTitle: 'The lift that stopped',
    story: [
      'A lift on the thirty-first floor stopped for fifty minutes with two strangers in it. Mina had a book. Rafael had a bag of pastries he was taking to a meeting he then missed.',
      'They split the pastries. She never finished the book — she has kept it, unfinished, on purpose.'
    ],
    storyNote: 'The 31st of October, 2025 — on the thirty-first floor',
    ceremony: { when: 'Saturday, 14 August 2027', at: '6:00 in the evening', where: ['The Conservatory', 'One Rockwell, Singapore'] },
    party: { when: 'Saturday, 14 August 2027', at: '8:00 in the evening', where: ['Skyline Room, 41st floor', 'One Rockwell, Singapore'] },
    attire: { when: 'Cocktail', at: 'Emerald, jade & ivory', where: ['The terrace is open all evening', 'It stays warm — dress light'] },
    schedule: [
      ['5:30 pm', 'Arrivals', 'Lifts from the main lobby'],
      ['6:00 pm', 'The ceremony', 'Twenty minutes, we promise'],
      ['6:30 pm', 'Drinks', 'On the west terrace, for the sunset'],
      ['8:00 pm', 'Dinner', 'Shared plates, no seating plan'],
      ['10:00 pm', 'Music', 'The room opens up'],
      ['1:00 am', 'Close', 'Night buses run from below']
    ],
    footerNote: 'Singapore · August 2027'
  },
  {
    slug: 'nocturne',
    name: 'Nocturne',
    scene: 'nocturne',
    blurb: 'A constellation drawing and redrawing itself — quiet, restrained, almost monochrome.',
    accent: '#cfc4ab', accent2: '#f4efe3', bg: '#0b0b0d', fg: '#f1efe9', muted: '#8b8880',
    display: 'Playfair Display', script: 'Pinyon Script', body: 'Karla',
    date: '2027-09-25T19:30:00',
    dateLabel: '25 · 09 · 2027',
    title: 'By Starlight',
    nameA: 'Juno', nameB: 'Caspar',
    lede: 'No speeches we have not warned you about, no seating plan you cannot ignore. Just dinner outside, and a very long night.',
    storyTitle: 'Two people with the same map',
    story: [
      'They were introduced by a friend who had grown tired of hearing two separate people describe the same walking route in the same amount of detail.',
      'The friend has since been thanked publicly, at length, and will be thanked again at dinner whether she likes it or not.'
    ],
    storyNote: 'The 21st of December, 2025 — at the top of the ridge',
    ceremony: { when: 'Saturday, 25 September 2027', at: '7:30 in the evening', where: ['The Long Barn', 'Galloway, Scotland'] },
    party: { when: 'Saturday, 25 September 2027', at: '9:00 in the evening', where: ['The Yard', 'The Long Barn, Galloway'] },
    attire: { when: 'Whatever you can dance in', at: 'Dark, warm, and yours', where: ['We are in a field — bring a coat', 'And shoes for wet grass'] },
    schedule: [
      ['7:00 pm', 'Arrivals', 'Park in the top field'],
      ['7:30 pm', 'The ceremony', 'Outside, if the weather allows'],
      ['8:15 pm', 'Fire lit', 'Whisky, and something hot to hold'],
      ['9:00 pm', 'Dinner', 'One long table under the awning'],
      ['11:00 pm', 'Ceilidh', 'A caller, so nobody has an excuse'],
      ['3:00 am', 'Last of us', 'Breakfast for anyone still standing']
    ],
    footerNote: 'Galloway, Scotland · September 2027'
  }
];

/* ------------------------------------------------------------------ *
 *  Page                                                               *
 * ------------------------------------------------------------------ */

const MARKS = {
  rings: '<path d="M9 14.5a5 5 0 1 0 5-5"/><circle cx="9" cy="14.5" r="5"/><path d="M12.5 6.5 14 4l1.5 2.5"/>',
  glass: '<path d="M6 3h12l-1.5 6a4.5 4.5 0 0 1-9 0z"/><path d="M12 13.5V20"/><path d="M8.5 20h7"/>',
  dress: '<path d="M9 3h6l-1 3 4 12-6 3-6-3 4-12z"/><path d="M10 6h4"/>'
};

const other = (slug) =>
  THEMES.filter((t) => t.slug !== slug)
    .map((t) => `<a href="invitation-${t.slug}.html">${esc(t.name)}</a>`)
    .join('\n        ');

function fontsHref(t) {
  const wanted = [t.display, t.script, t.body]
    .map((f) => FONT_URL[f])
    .filter(Boolean)
    .map((frag) => `family=${frag}`)
    .join('&');
  return `https://fonts.googleapis.com/css2?${wanted}&display=swap`;
}

function card(mark, title, d) {
  return `          <article class="iv-card iv-reveal">
            <span class="iv-card-mark" aria-hidden="true"><svg viewBox="0 0 24 24">${MARKS[mark]}</svg></span>
            <h3>${esc(title)}</h3>
            <p>${esc(d.when)}</p>
            <p class="iv-card-when">${esc(d.at)}</p>
            <p class="iv-card-where">${d.where.map(esc).join('<br />')}</p>
          </article>`;
}

function page(t) {
  const couple = `${t.nameA} & ${t.nameB}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(couple)} — ${esc(t.title)} | Invitara</title>
  <meta name="description" content="${esc(t.blurb)}" />
  <meta name="theme-color" content="${t.bg}" />
  <meta name="robots" content="noindex" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="${esc(fontsHref(t))}" rel="stylesheet" />
  <link rel="stylesheet" href="css/invite3d.css" />

  <style>
    :root {
      --iv-accent:   ${t.accent};
      --iv-accent-2: ${t.accent2};
      --iv-bg:       ${t.bg};
      --iv-fg:       ${t.fg};
      --iv-muted:    ${t.muted};
      --iv-display: "${t.display}", Georgia, serif;
      --iv-script:  "${t.script}", cursive;
      --iv-body:    "${t.body}", -apple-system, "Segoe UI", sans-serif;
    }
  </style>
</head>
<body>
  <a class="iv-skip" href="#iv-main">Skip to content</a>

  <div id="iv-loader"><div style="text-align:center"><div class="iv-ring"></div><p class="iv-script" style="color:var(--iv-accent);font-size:22px;margin:0">${esc(couple)}</p></div></div>

  <div id="iv-cursor" aria-hidden="true"></div>

  <canvas id="iv-canvas" aria-hidden="true"></canvas>
  <div class="iv-vignette" aria-hidden="true"></div>

  <main class="iv-content" id="iv-main">

    <!-- Hero -->
    <section class="iv-section iv-hero">
      <div class="iv-wrap">
        <p class="iv-hero-date">${esc(t.dateLabel)}</p>
        <h1>${esc(t.title)}</h1>
        <p class="iv-names iv-display">${esc(t.nameA)}<span class="amp">&amp;</span>${esc(t.nameB)}</p>
        <div class="iv-rule"></div>
        <p class="iv-lede">${esc(t.lede)}</p>

        <div class="iv-count">
          <div class="iv-count-box"><div class="iv-count-num" id="iv-d">00</div><div class="iv-count-lab">Days</div></div>
          <div class="iv-count-box"><div class="iv-count-num" id="iv-h">00</div><div class="iv-count-lab">Hours</div></div>
          <div class="iv-count-box"><div class="iv-count-num" id="iv-m">00</div><div class="iv-count-lab">Minutes</div></div>
          <div class="iv-count-box"><div class="iv-count-num" id="iv-s">00</div><div class="iv-count-lab">Seconds</div></div>
        </div>

        <div class="iv-scroll"><div class="iv-scroll-line"></div><span>Scroll</span></div>
      </div>
    </section>

    <!-- Story -->
    <section class="iv-section">
      <div class="iv-wrap">
        <div class="iv-head iv-reveal">
          <span class="iv-eyebrow">Our story</span>
          <h2>${esc(t.storyTitle)}</h2>
          <div class="iv-rule"></div>
        </div>

        <div class="iv-story">
          <div class="iv-frame iv-reveal">
            <div class="iv-frame-inner">
              <span class="iv-script" style="color:var(--iv-accent);font-size:34px">${esc(t.nameA[0])} &amp; ${esc(t.nameB[0])}</span>
            </div>
          </div>
          <div class="iv-reveal">
            <h3>${esc(t.storyTitle)}</h3>
${t.story.map((p) => `            <p>${esc(p)}</p>`).join('\n')}
            <p style="color:var(--iv-accent);font-size:14px;margin-top:26px">${esc(t.storyNote)}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Details -->
    <section class="iv-section">
      <div class="iv-wrap">
        <div class="iv-head iv-reveal">
          <span class="iv-eyebrow">The day</span>
          <h2>Where and when</h2>
          <div class="iv-rule"></div>
        </div>

        <div class="iv-cards">
${card('rings', 'The ceremony', t.ceremony)}
${card('glass', 'The reception', t.party)}
${card('dress', 'What to wear', t.attire)}
        </div>
      </div>
    </section>

    <!-- Timeline -->
    <section class="iv-section">
      <div class="iv-wrap">
        <div class="iv-head iv-reveal">
          <span class="iv-eyebrow">The order of things</span>
          <h2>How the day runs</h2>
          <div class="iv-rule"></div>
        </div>

        <ol class="iv-timeline">
${t.schedule
  .map(
    ([at, title, note]) => `          <li class="iv-reveal">
            <p class="iv-at">${esc(at)}</p>
            <h3>${esc(title)}</h3>
            <p>${esc(note)}</p>
          </li>`
  )
  .join('\n')}
        </ol>
      </div>
    </section>

    <!-- RSVP -->
    <section class="iv-section">
      <div class="iv-narrow">
        <div class="iv-head iv-reveal">
          <span class="iv-eyebrow">Répondez s'il vous plaît</span>
          <h2>Will you join us?</h2>
          <div class="iv-rule"></div>
        </div>

        <form class="iv-form iv-reveal" id="iv-rsvp" novalidate>
          <p class="iv-error" role="alert" hidden></p>

          <div class="iv-field">
            <label for="iv-name">Your name<span aria-hidden="true">(s)</span></label>
            <input type="text" id="iv-name" name="name" placeholder="e.g. The Okonkwo family" autocomplete="name" required />
          </div>

          <div class="iv-field">
            <fieldset style="border:0;margin:0;padding:0">
              <legend class="iv-label">Will you be there?</legend>
              <div class="iv-choices">
                <label class="iv-choice">
                  <input type="radio" name="iv-attend" value="yes" />
                  <span class="iv-choice-face iv-yes">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none"/><path d="M8 12.4l2.6 2.6L16 9.4" fill="none"/></svg>
                    <span>Joyfully accept</span>
                  </span>
                </label>
                <label class="iv-choice">
                  <input type="radio" name="iv-attend" value="no" />
                  <span class="iv-choice-face iv-no">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none"/><path d="M9 9l6 6M15 9l-6 6" fill="none"/></svg>
                    <span>Regretfully decline</span>
                  </span>
                </label>
              </div>
            </fieldset>
          </div>

          <div class="iv-field">
            <label for="iv-guests">How many of you?</label>
            <select id="iv-guests" name="guests">
              <option>Just me</option>
              <option>Two of us</option>
              <option>Three</option>
              <option>Four</option>
              <option>Five or more</option>
            </select>
          </div>

          <div class="iv-field">
            <label for="iv-notes">Anything we should know?</label>
            <textarea id="iv-notes" name="notes" rows="3" placeholder="Allergies, a song you want played, someone who needs a lift"></textarea>
          </div>

          <button class="iv-submit" type="submit">Send our reply</button>
          <p class="iv-note">This is a design preview — replies are not delivered.</p>
        </form>
      </div>
    </section>
  </main>

  <footer class="iv-footer">
    <p class="iv-script">${esc(couple)}</p>
    <p>${esc(t.footerNote)}</p>
    <p style="margin-top:22px;font-size:12px">
      Other designs:
      ${other(t.slug)}
    </p>
    <p style="font-size:11px;opacity:.6">&copy; <span id="iv-year">2026</span> Invitara</p>
  </footer>

  <div class="iv-toast" id="iv-toast" role="status" aria-live="polite"></div>

  <script>window.INVITE_CONFIG = { scene: ${JSON.stringify(t.scene)}, date: ${JSON.stringify(t.date)} };</script>
  <!-- Three.js is served from this origin, not a CDN: the site's CSP is
       script-src 'self', so a cdnjs tag is blocked in production. -->
  <script src="vendor/three.min.js" defer></script>
  <script src="js/invites/scene-${t.scene}.js" defer></script>
  <script src="js/invites/shell.js" defer></script>
</body>
</html>
`;
}

let n = 0;
for (const t of THEMES) {
  writeFileSync(resolve(ROOT, `public/invitation-${t.slug}.html`), page(t));
  console.log(`  wrote public/invitation-${t.slug}.html   (${t.scene})`);
  n++;
}
console.log(`\n${n} invitation templates generated`);

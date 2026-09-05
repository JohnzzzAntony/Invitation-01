/* ==========================================================================
   Ever RSVP — shared template catalog & event-website renderer
   Format (per reference): Hero → Countdown & details → Our story →
   Gallery → Events → Venue & map → RSVP → Contact/footer.
   Loaded by create.html, checkout.html, editor.html (+ designer.js).
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ *
   *  Icons (inline SVG, stroke = currentColor)                          *
   * ------------------------------------------------------------------ */
  var ICONS = {
    rings:    '<svg viewBox="0 0 24 24"><circle cx="9" cy="14" r="5.5"/><circle cx="15" cy="14" r="5.5"/><path d="M9 8.5 7.5 6h3L9 8.5zm6 0L13.5 6h3L15 8.5z"/></svg>',
    cocktail: '<svg viewBox="0 0 24 24"><path d="M5 4h14l-7 8v7"/><path d="M8.5 12h7M9 20h6"/></svg>',
    dinner:   '<svg viewBox="0 0 24 24"><path d="M4 16a8 8 0 0 1 16 0"/><path d="M2.8 16h18.4M12 8V6.2M10.6 6.2h2.8"/></svg>',
    music:    '<svg viewBox="0 0 24 24"><path d="M9 18.5V6l10-2v12.5"/><circle cx="6.8" cy="18.5" r="2.2"/><circle cx="16.8" cy="16.5" r="2.2"/></svg>',
    calendar: '<svg viewBox="0 0 24 24"><rect x="4" y="5.5" width="16" height="14" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/></svg>',
    clock:    '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.2"/><path d="M12 7.5V12l3 2.2"/></svg>',
    pin:      '<svg viewBox="0 0 24 24"><path d="M12 21s-6.5-5.4-6.5-10a6.5 6.5 0 0 1 13 0c0 4.6-6.5 10-6.5 10z"/><circle cx="12" cy="10.6" r="2.3"/></svg>',
    dress:    '<svg viewBox="0 0 24 24"><path d="M9.5 3.5 12 6l2.5-2.5M9.5 3.5 8 8l1.6 1.2L8 20.5h8l-1.6-11.3L16 8l-1.5-4.5"/></svg>',
    car:      '<svg viewBox="0 0 24 24"><path d="M5 13 6.6 8.2A1.6 1.6 0 0 1 8.1 7h7.8a1.6 1.6 0 0 1 1.5 1.2L19 13M5 13h14v5.4h-2.2M5 13v5.4h2.2M7.6 18.4h8.8"/><circle cx="7.8" cy="18.3" r="1.6"/><circle cx="16.2" cy="18.3" r="1.6"/></svg>',
    bell:     '<svg viewBox="0 0 24 24"><path d="M4 17.5h16M5.5 17.5a6.5 6.5 0 0 1 13 0M12 11V9.2M12 6.6a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4z"/></svg>',
    chair:    '<svg viewBox="0 0 24 24"><circle cx="12" cy="4.6" r="1.9"/><path d="M12 6.5v6M12 12.5H8.4a2 2 0 0 0-2 2V20M12 12.5h3.6a2 2 0 0 1 2 2V20M10 20v-3M14 20v-3"/></svg>',
    snow:     '<svg viewBox="0 0 24 24"><path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9M12 3l-2 2M12 3l2 2M12 21l-2-2M12 21l2-2"/></svg>',
    phone:    '<svg viewBox="0 0 24 24"><path d="M7.6 3.8 9.8 6a1.7 1.7 0 0 1 0 2.4l-1 1a12.8 12.8 0 0 0 5.8 5.8l1-1a1.7 1.7 0 0 1 2.4 0l2.2 2.2a1.7 1.7 0 0 1 0 2.4l-1.1 1.1c-1 1-2.6 1.3-3.9.7A22 22 0 0 1 5 10.8c-.6-1.3-.3-2.9.7-3.9l1-1a1.7 1.7 0 0 1 .9-2.1z"/></svg>',
    mail:     '<svg viewBox="0 0 24 24"><rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="m4.5 7 7.5 6 7.5-6"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24"><path d="M12 3.5a8.4 8.4 0 0 0-7.3 12.7L3.5 20.5l4.4-1.1A8.4 8.4 0 1 0 12 3.5z"/><path d="M9.3 8.4c.6-.2.8 0 1 .5l.5 1.1c.1.3 0 .6-.2.8l-.5.5a6.4 6.4 0 0 0 2.6 2.6l.5-.5c.2-.2.5-.3.8-.2l1.1.5c.5.2.7.4.5 1-.3.9-1.4 1.3-2.3 1A8.6 8.6 0 0 1 8.3 10.7c-.3-.9.1-2 1-2.3z"/></svg>',
    facebook: '<svg viewBox="0 0 24 24"><path d="M14.5 8.5H16V5.8h-2c-2 0-3.2 1.3-3.2 3.3v1.7H9v2.6h1.8v6.8h2.7v-6.8h2.2l.4-2.6h-2.6V9.4c0-.6.3-.9 1-.9z"/></svg>',
    instagram:'<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4.5"/><circle cx="12" cy="12" r="3.6"/><circle cx="16.8" cy="7.2" r="1" fill="currentColor" stroke="none"/></svg>',
    share:    '<svg viewBox="0 0 24 24"><circle cx="6.5" cy="12" r="2.3"/><circle cx="17" cy="6.5" r="2.3"/><circle cx="17" cy="17.5" r="2.3"/><path d="m8.6 10.9 6.3-3.2M8.6 13.1l6.3 3.2"/></svg>',
    heart:    '<svg viewBox="0 0 24 24"><path d="M12 20s-7.2-4.6-7.2-9.8A4.1 4.1 0 0 1 12 7.6a4.1 4.1 0 0 1 7.2 2.6C19.2 15.4 12 20 12 20z"/></svg>',
    camera:   '<svg viewBox="0 0 24 24"><path d="M4 8.5h3l1.6-2.3h6.8L17 8.5h3v10H4z"/><circle cx="12" cy="13.2" r="3.2"/></svg>',
    chevron:  '<svg viewBox="0 0 24 24"><path d="m6 9.5 6 6 6-6"/></svg>'
  };

  /* ------------------------------------------------------------------ *
   *  Photo library (bundled, deployment-safe relative paths)            *
   * ------------------------------------------------------------------ */
  var PHOTOS = [
    { id: 'couple',   src: 'assets/ws-couple.jpg',   label: 'Couple portrait' },
    { id: 'cafe',     src: 'assets/ws-cafe.jpg',     label: 'First meeting' },
    { id: 'proposal', src: 'assets/ws-proposal.jpg', label: 'The proposal' },
    { id: 'rings',    src: 'assets/ws-rings.jpg',    label: 'The rings' },
    { id: 'dance',    src: 'assets/ws-dance.jpg',    label: 'First dance' },
    { id: 'decor',    src: 'assets/ws-decor.jpg',    label: 'Reception decor' },
    { id: 'shoes',    src: 'assets/hero.jpg',        label: 'Bridal style' },
    { id: 'band',     src: 'assets/cta-band.jpg',    label: 'Celebration' }
  ];

  /* ------------------------------------------------------------------ *
   *  Design catalog — one format, many designs.                         *
   *  vars drive the whole site through CSS custom properties.           *
   * ------------------------------------------------------------------ */
  var THEMES = [
    { id: 'emerald',  name: 'Emerald & Gold', category: 'Classic',
      dark: '#17301f', deep: '#10241724', gold: '#c9a45c', bg: '#f7f3e8', ink: '#3c3628', soft: '#efe7d2',
      nameFont: 'vibes', ornament: 'floral' },
    { id: 'maroon',   name: 'Royal Maroon', category: 'Classic',
      dark: '#47161f', deep: '#47161f24', gold: '#d4a95c', bg: '#faf5ec', ink: '#43302c', soft: '#f0e2d4',
      nameFont: 'vibes', ornament: 'floral' },
    { id: 'blush',    name: 'Blush Rose', category: 'Floral',
      dark: '#5c3a40', deep: '#5c3a4024', gold: '#b98a8e', bg: '#faf3ef', ink: '#54423f', soft: '#f2e2dc',
      nameFont: 'paris', ornament: 'floral' },
    { id: 'navy',     name: 'Midnight Navy', category: 'Classic',
      dark: '#1b2a41', deep: '#1b2a4124', gold: '#c8a96a', bg: '#f6f4ee', ink: '#39404d', soft: '#e4e2d8',
      nameFont: 'corm', ornament: 'lines' },
    { id: 'sage',     name: 'Sage Garden', category: 'Floral',
      dark: '#3f5142', deep: '#3f514224', gold: '#9a7b4f', bg: '#f5f6f0', ink: '#3d4438', soft: '#e2e8da',
      nameFont: 'corm', ornament: 'lines' },
    { id: 'champagne',name: 'Champagne Ivory', category: 'Elegant',
      dark: '#6b5d4a', deep: '#6b5d4a24', gold: '#b0955c', bg: '#faf7f0', ink: '#4a4234', soft: '#efe6d4',
      nameFont: 'corm', ornament: 'geo' },
    { id: 'terracotta', name: 'Terracotta Sun', category: 'Modern',
      dark: '#703826', deep: '#70382624', gold: '#c97a4a', bg: '#fbf2ea', ink: '#4f362a', soft: '#f2ddcc',
      nameFont: 'jost', ornament: 'geo' },
    { id: 'lavender', name: 'Lavender Mist', category: 'Modern',
      dark: '#443a63', deep: '#443a6324', gold: '#9a7bc9', bg: '#f7f4fa', ink: '#453e58', soft: '#e7e0f2',
      nameFont: 'paris', ornament: 'geo' }
  ];

  var NAME_FONTS = {
    vibes: { label: 'Script',   cls: 'f-vibes' },
    paris: { label: 'Paris',    cls: 'f-paris' },
    corm:  { label: 'Classic',  cls: 'f-corm' },
    jost:  { label: 'Modern',   cls: 'f-jost' }
  };
  var BODY_FONTS = {
    lato: { label: 'Lato',  cls: '' },
    jost: { label: 'Jost',  cls: 'ws-body-jost' }
  };

  var CUSTOM_KEY = 'ever-rsvp-custom-tpl';

  /* ------------------------------------------------------------------ *
   *  Helpers                                                            *
   * ------------------------------------------------------------------ */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function icon(name, cls) {
    return '<span class="ws-ic' + (cls ? ' ' + cls : '') + '" aria-hidden="true">' +
      (ICONS[name] || ICONS.heart) + '</span>';
  }
  var DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  function dateObj(iso) {
    var d = new Date((iso || '') + 'T17:00:00');
    return isNaN(d.getTime()) ? new Date('2026-11-24T17:00:00') : d;
  }
  function fmtHeroDate(iso) {
    var d = dateObj(iso);
    return d.getDate() + ' \u00b7 ' + MONTHS[d.getMonth()].toUpperCase() + ' \u00b7 ' + d.getFullYear();
  }
  function fmtLongDate(iso) {
    var d = dateObj(iso);
    return MONTHS[d.getMonth()] + ' ' + d.getDate() + ' ' + d.getFullYear();
  }
  function fmtWeekday(iso) {
    return DAYS[dateObj(iso).getDay()];
  }
  function monogram(a, b) {
    return (String(a || 'A').trim().charAt(0) + ' \u00b7 ' + String(b || 'R').trim().charAt(0)).toUpperCase();
  }
  function photoSrc(idOrUrl) {
    if (!idOrUrl) return PHOTOS[0].src;
    if (/^(https?:|data:|\/|assets\/)/.test(idOrUrl)) return idOrUrl;
    for (var i = 0; i < PHOTOS.length; i++) if (PHOTOS[i].id === idOrUrl) return PHOTOS[i].src;
    return PHOTOS[0].src;
  }

  /* ------------------------------------------------------------------ *
   *  Templates: builtin + custom                                        *
   * ------------------------------------------------------------------ */
  function readCustom() {
    try {
      var arr = JSON.parse(localStorage.getItem(CUSTOM_KEY) || '[]');
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }
  function writeCustom(arr) {
    try { localStorage.setItem(CUSTOM_KEY, JSON.stringify(arr)); } catch (e) { /* ignore */ }
  }
  function saveCustomTemplate(t) {
    var arr = readCustom();
    t.id = t.id || ('custom-' + Date.now());
    t.custom = true;
    t.category = 'Custom';
    var found = false;
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].id === t.id) { arr[i] = t; found = true; break; }
    }
    if (!found) arr.push(t);
    writeCustom(arr);
    return t;
  }
  function deleteCustomTemplate(id) {
    writeCustom(readCustom().filter(function (t) { return t.id !== id; }));
  }
  function allTemplates() {
    return THEMES.concat(readCustom());
  }
  function findTemplate(id) {
    var list = allTemplates();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return list[0];
  }

  /* ------------------------------------------------------------------ *
   *  Default website content (mirrors the reference layout)             *
   * ------------------------------------------------------------------ */
  function futureISO(monthsAhead, day) {
    var d = new Date();
    d.setDate(day || 24);
    d.setMonth(d.getMonth() + (monthsAhead || 0));
    var m = String(d.getMonth() + 1); if (m.length < 2) m = '0' + m;
    var dd = String(d.getDate()); if (dd.length < 2) dd = '0' + dd;
    return d.getFullYear() + '-' + m + '-' + dd;
  }

  function siteDefaults() {
    return {
      v: 3,
      templateId: 'emerald',
      nameFont: '',            /* '' = follow the template */
      bodyFont: 'lato',
      accent: 'tpl',           /* 'tpl' or hex */
      btnShape: 'soft',
      spacing: 'normal',
      basics: {
        nameA: 'Ananya', nameB: 'Rohan',
        date: futureISO(3), time: '05:00 PM onwards',
        venue: 'The Grand Palms',
        address: 'No. 123, Palm Avenue, Hennur Main Road',
        city: 'Bengaluru',
        dress: 'Semi formal \u00b7 Pastel shades',
        quote: 'Two hearts, one love, a lifetime together.'
      },
      order: ['hero', 'countdown', 'story', 'gallery', 'events', 'venue', 'rsvp', 'contact'],
      sections: {
        hero: {
          on: true,
          kicker1: "You're invited to", kicker2: 'the wedding of',
          photo: 'couple', btnText: 'Enter invitation'
        },
        countdown: {
          on: true,
          label: 'Countdown to our big day',
          quote: 'Two hearts, one love, a lifetime together.'
        },
        story: {
          on: true, title: 'Our story',
          items: [
            { photo: 'cafe',     title: 'First met',      date: '14 March 2021', text: 'A chance meeting that started it all.' },
            { photo: 'proposal', title: 'Fell in love',   date: '20 July 2022',  text: 'We became inseparable and built beautiful memories.' },
            { photo: 'rings',    title: 'She said yes',   date: '14 February 2025', text: 'The best day of our lives, and the beginning of forever.' },
            { photo: 'dance',    title: 'Forever starts', date: '24 November 2026', text: "We can't wait to celebrate this special day with you all!" }
          ]
        },
        gallery: {
          on: true, title: 'Gallery', btn: 'View more photos',
          items: [
            { src: 'couple' }, { src: 'cafe' }, { src: 'proposal' },
            { src: 'dance' }, { src: 'rings' }, { src: 'decor' }
          ]
        },
        events: {
          on: true, title: 'Events',
          items: [
            { icon: 'rings',    name: 'Wedding ceremony', time: '05:00 PM - 06:30 PM', venue: 'The Grand Palms \u00b7 Main lawn' },
            { icon: 'cocktail', name: 'Cocktails & mocktails', time: '06:30 PM - 07:30 PM', venue: 'The Grand Palms \u00b7 Garden area' },
            { icon: 'dinner',   name: 'Dinner', time: '07:30 PM - 09:30 PM', venue: 'The Grand Palms \u00b7 Banquet hall' },
            { icon: 'music',    name: 'Reception party', time: '09:30 PM onwards', venue: 'The Grand Palms \u00b7 Banquet hall' }
          ]
        },
        venue: {
          on: true,
          name: 'The Grand Palms',
          address: 'No. 123, Palm Avenue, Hennur Main Road, Bengaluru - 560043, Karnataka, India',
          dirUrl: '',
          mapUrl: 'https://www.openstreetmap.org/export/embed.html?bbox=77.5980%2C13.0180%2C77.6380%2C13.0480&layer=mapnik&marker=13.0330%2C77.6180',
          items: [
            { icon: 'car',   label: 'Ample parking' },
            { icon: 'bell',  label: 'Valet service' },
            { icon: 'chair', label: 'Wheelchair accessible' },
            { icon: 'snow',  label: 'AC venue' }
          ]
        },
        rsvp: {
          on: true,
          title: 'Kindly RSVP',
          note: 'Please confirm your presence by',
          deadline: futureISO(2, 10),
          showPhone: true,
          guestsMax: 6,
          meals: ['Vegetarian', 'Non vegetarian', 'Jain', 'Not sure yet'],
          showMsg: true,
          submit: 'Submit RSVP',
          success: 'Thank you! Your reply has been received — we can\u2019t wait to celebrate with you.'
        },
        contact: {
          on: true,
          phone: '+91 98765 43210',
          email: 'ananyaandrohan@gmail.com',
          whatsapp: 'WhatsApp us',
          thanks: 'Thank you for being a part of our special day!',
          social: { wa: true, fb: true, ig: true, share: true },
          copyright: '',
          credit: 'Made with \u2665 for our big day'
        }
      }
    };
  }

  /* ------------------------------------------------------------------ *
   *  Theme CSS variables                                                *
   * ------------------------------------------------------------------ */
  function themeVars(tpl, data) {
    var v = {
      '--ws-dark': tpl.dark, '--ws-gold': tpl.gold,
      '--ws-bg': tpl.bg, '--ws-ink': tpl.ink, '--ws-soft': tpl.soft
    };
    if (data && data.accent && data.accent !== 'tpl' && /^#?[0-9a-fA-F]{3,8}$/.test(data.accent)) {
      v['--ws-gold'] = data.accent.charAt(0) === '#' ? data.accent : '#' + data.accent;
    }
    return v;
  }
  function applyVars(el, vars) {
    for (var k in vars) el.style.setProperty(k, vars[k]);
  }

  /* ------------------------------------------------------------------ *
   *  FULL renderer (editor live preview)                                *
   * ------------------------------------------------------------------ */
  function renderSite(data, opts) {
    opts = opts || {};
    data = data || siteDefaults();
    var tpl = findTemplate(data.templateId);
    var nf = NAME_FONTS[data.nameFont] || NAME_FONTS[tpl.nameFont] || NAME_FONTS.vibes;
    var B = data.basics || {};
    var S = data.sections || {};
    var el = document.createElement('div');
    el.className = 'ws ws-orn-' + (tpl.ornament || 'lines') + ' ' + (BODY_FONTS[data.bodyFont] || BODY_FONTS.lato).cls +
      ' ws-bs-' + (data.btnShape || 'soft') + ' ws-sp-' + (data.spacing || 'normal') +
      (opts.interactive ? ' ws-live' : '');
    applyVars(el, themeVars(tpl, data));
    var order = (data.order && data.order.length) ? data.order : siteDefaults().order;
    var builders = {
      hero: heroHtml, countdown: countdownHtml, story: storyHtml, gallery: galleryHtml,
      events: eventsHtml, venue: venueHtml, rsvp: rsvpHtml, contact: contactHtml
    };
    var html = '';
    order.forEach(function (id) {
      var sec = S[id];
      if (!sec || !sec.on || !builders[id]) return;
      html += builders[id](data, tpl, nf);
    });
    el.innerHTML = html;
    return el;
  }

  /* ---- section builders ------------------------------------------- */
  function heroHtml(d, tpl, nf) {
    var h = d.sections.hero, B = d.basics;
    var navLinks = [['story', 'Our story'], ['events', 'Events'], ['gallery', 'Gallery'], ['venue', 'Venue'], ['rsvp', 'RSVP'], ['contact', 'Contact']];
    var nav = navLinks.map(function (l) {
      return '<a href="#ws-sec-' + l[0] + '" data-goto="' + l[0] + '">' + esc(l[1]) + '</a>';
    }).join('');
    return '' +
      '<header class="ws-hero" id="ws-sec-hero">' +
        '<img class="ws-hero-img" src="' + esc(photoSrc(h.photo)) + '" alt="" aria-hidden="true"/>' +
        '<div class="ws-hero-shade" aria-hidden="true"></div>' +
        '<span class="ws-orn ws-orn-a" aria-hidden="true"></span><span class="ws-orn ws-orn-b" aria-hidden="true"></span>' +
        '<div class="ws-hero-bar">' +
          '<span class="ws-mono">' + esc(monogram(B.nameA, B.nameB)) + '</span>' +
          '<nav class="ws-nav" aria-label="Event sections">' + nav + '</nav>' +
        '</div>' +
        '<div class="ws-hero-inner">' +
          '<p class="ws-kick">' + esc(h.kicker1) + '<br/>' + esc(h.kicker2) + '</p>' +
          '<h1 class="ws-names ' + nf.cls + '">' +
            esc(B.nameA) + ' <span class="ws-amp">\u0026</span><br/>' + esc(B.nameB) + '</h1>' +
          '<span class="ws-div" aria-hidden="true"><i></i>' + icon('heart', 'ws-div-heart') + '<i></i></span>' +
          '<p class="ws-hero-date">' + esc(fmtHeroDate(B.date)) + '</p>' +
          '<a class="ws-btn ws-btn-line" href="#ws-sec-countdown" data-goto="countdown">' + esc(h.btnText || 'Enter invitation') + '</a>' +
        '</div>' +
        '<span class="ws-scroll" aria-hidden="true">' + icon('chevron') + '</span>' +
      '</header>';
  }

  function countdownHtml(d) {
    var c = d.sections.countdown, B = d.basics;
    var cards = [
      { ic: 'calendar', label: 'Date',  l1: fmtLongDate(B.date), l2: fmtWeekday(B.date) },
      { ic: 'clock',    label: 'Time',  l1: esc(B.time), l2: '' },
      { ic: 'pin',      label: 'Venue', l1: esc(B.venue), l2: esc(B.city) },
      { ic: 'dress',    label: 'Dress code', l1: esc(B.dress), l2: '' }
    ];
    var cardsHtml = cards.map(function (c2) {
      return '<div class="ws-dcard">' + icon(c2.ic) +
        '<b>' + c2.label + '</b><span>' + c2.l1 + '</span>' + (c2.l2 ? '<span>' + c2.l2 + '</span>' : '') + '</div>';
    }).join('');
    return '' +
      '<section class="ws-sec ws-count" id="ws-sec-countdown">' +
        '<div class="ws-count-grid">' +
          '<div class="ws-count-left">' +
            '<h2 class="ws-title sm">' + esc(c.label) + '</h2>' +
            '<div class="ws-timer" data-ws-deadline="' + esc(d.basics.date) + 'T17:00:00" aria-label="Countdown timer">' +
              '<span class="ws-tbox"><b data-u="d">00</b><i>Days</i></span>' +
              '<span class="ws-tbox"><b data-u="h">00</b><i>Hours</i></span>' +
              '<span class="ws-tbox"><b data-u="m">00</b><i>Minutes</i></span>' +
              '<span class="ws-tbox"><b data-u="s">00</b><i>Seconds</i></span>' +
            '</div>' +
            '<p class="ws-quote">\u201c' + esc(c.quote) + '\u201d</p>' +
          '</div>' +
          '<div class="ws-details">' + cardsHtml +
            '<a class="ws-btn ws-btn-dark ws-map-link" href="' +
              esc(d.sections.venue.dirUrl || ('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent((d.sections.venue.address || '') + ' ' + (d.basics.city || '')))) +
              '" target="_blank" rel="noopener">' + icon('pin') + ' View on map</a>' +
          '</div>' +
        '</div>' +
      '</section>';
  }

  function storyHtml(d) {
    var s = d.sections.story;
    var items = (s.items || []).map(function (m, i) {
      return '<div class="ws-ms">' +
        '<span class="ws-ms-heart" aria-hidden="true">' + (i > 0 ? icon('heart') : '') + '</span>' +
        '<span class="ws-ms-photo"><img src="' + esc(photoSrc(m.photo)) + '" alt="' + esc(m.title) + '"/></span>' +
        '<b>' + esc(m.title) + '</b><i class="ws-ms-date">' + esc(m.date) + '</i>' +
        '<p>' + esc(m.text) + '</p></div>';
    }).join('');
    return '' +
      '<section class="ws-sec ws-story" id="ws-sec-story">' +
        '<h2 class="ws-title">' + esc(s.title) + '</h2>' +
        '<div class="ws-story-row">' + items + '</div>' +
      '</section>';
  }

  function galleryHtml(d) {
    var g = d.sections.gallery;
    var imgs = (g.items || []).map(function (p) {
      return '<span class="ws-gcell"><img src="' + esc(photoSrc(p.src)) + '" alt="Event photo" loading="lazy"/></span>';
    }).join('');
    return '' +
      '<section class="ws-sec ws-gallery" id="ws-sec-gallery">' +
        '<h2 class="ws-title">' + esc(g.title) + '</h2>' +
        '<div class="ws-gallery-row">' + imgs + '</div>' +
        (g.btn ? '<a class="ws-btn ws-btn-dark" href="#ws-sec-gallery">' + icon('camera') + ' ' + esc(g.btn) + '</a>' : '') +
      '</section>';
  }

  function eventsHtml(d) {
    var e = d.sections.events;
    var cards = (e.items || []).map(function (ev) {
      return '<div class="ws-ecard">' + icon(ev.icon) +
        '<b>' + esc(ev.name) + '</b><span>' + esc(ev.time) + '</span><span class="ws-ec-venue">' + esc(ev.venue) + '</span></div>';
    }).join('');
    return '' +
      '<section class="ws-sec ws-events" id="ws-sec-events">' +
        '<h2 class="ws-title">' + esc(e.title) + '</h2>' +
        '<div class="ws-events-grid">' + cards + '</div>' +
      '</section>';
  }

  function venueHtml(d) {
    var v = d.sections.venue;
    var amen = (v.items || []).map(function (a) {
      return '<div class="ws-am">' + icon(a.icon) + '<span>' + esc(a.label) + '</span></div>';
    }).join('');
    var map = v.mapUrl
      ? '<iframe class="ws-map" src="' + esc(v.mapUrl) + '" title="Venue map" loading="lazy"></iframe>'
      : '<div class="ws-map ws-map-empty">' + icon('pin') + '<p>Map coming soon</p></div>';
    return '' +
      '<section class="ws-sec ws-venue-sec" id="ws-sec-venue">' +
        '<div class="ws-venue-grid">' +
          '<div class="ws-venue-panel">' +
            '<h2 class="ws-title on-dark">' + esc(v.name) + '</h2>' +
            '<address>' + esc(v.address).replace(/\n/g, '<br/>') + '</address>' +
            '<div class="ws-am-row">' + amen + '</div>' +
            '<a class="ws-btn ws-btn-line" target="_blank" rel="noopener" href="' +
              esc(v.dirUrl || ('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(v.address || ''))) +
              '">Get directions ' + icon('share') + '</a>' +
          '</div>' + map +
        '</div>' +
      '</section>';
  }

  function rsvpHtml(d) {
    var r = d.sections.rsvp, B = d.basics;
    var guests = '<option value="">Number of guests</option>';
    for (var i = 1; i <= (parseInt(r.guestsMax, 10) || 6); i++) guests += '<option value="' + i + '">' + i + '</option>';
    var meals = '<option value="">Meal preference</option>';
    (r.meals || []).forEach(function (m) { meals += '<option>' + esc(m) + '</option>'; });
    return '' +
      '<section class="ws-sec ws-rsvp" id="ws-sec-rsvp">' +
        '<div class="ws-rsvp-grid">' +
          '<div class="ws-rsvp-head">' +
            '<h2 class="ws-title">' + esc(r.title) + '</h2>' +
            '<span class="ws-div" aria-hidden="true"><i></i>' + icon('heart', 'ws-div-heart') + '<i></i></span>' +
            '<p>' + esc(r.note) + '<br/><b>' + esc(fmtLongDate(r.deadline)) + '</b></p>' +
          '</div>' +
          '<form class="ws-rsvp-form" novalidate>' +
            '<div class="ws-frow">' +
              '<input type="text" name="name" placeholder="Your name" required/>' +
              (r.showPhone ? '<input type="tel" name="phone" placeholder="Phone number"/>' : '') +
            '</div>' +
            '<div class="ws-frow">' +
              '<select name="guests">' + guests + '</select>' +
              '<select name="attend" required><option value="">Will you attend?</option><option>Joyfully accept</option><option>Regretfully decline</option></select>' +
            '</div>' +
            '<div class="ws-frow">' +
              '<select name="meal">' + meals + '</select>' +
            '</div>' +
            (r.showMsg ? '<textarea name="msg" rows="3" placeholder="Your message (optional)"></textarea>' : '') +
            '<button class="ws-btn ws-btn-dark ws-submit" type="submit">' + esc(r.submit || 'Submit RSVP') + ' ' + icon('heart') + '</button>' +
          '</form>' +
        '</div>' +
      '</section>';
  }

  function contactHtml(d) {
    var c = d.sections.contact, B = d.basics;
    var soc = '';
    if (c.social && c.social.wa) soc += '<a href="https://wa.me/' + esc(String(c.phone).replace(/\D/g, '')) + '" target="_blank" rel="noopener" aria-label="WhatsApp">' + icon('whatsapp') + '</a>';
    if (c.social && c.social.fb) soc += '<a href="#ws-sec-contact" aria-label="Facebook">' + icon('facebook') + '</a>';
    if (c.social && c.social.ig) soc += '<a href="#ws-sec-contact" aria-label="Instagram">' + icon('instagram') + '</a>';
    if (c.social && c.social.share) soc += '<a href="#ws-sec-contact" aria-label="Share">' + icon('share') + '</a>';
    return '' +
      '<footer class="ws-footer" id="ws-sec-contact">' +
        '<div class="ws-foot-grid">' +
          '<div class="ws-foot-col">' +
            '<h3>Get in touch</h3>' +
            '<p>For any queries, feel free to reach out.</p>' +
            '<a class="ws-foot-line" href="tel:' + esc(String(c.phone).replace(/\s/g, '')) + '">' + icon('phone') + esc(c.phone) + '</a>' +
            '<a class="ws-foot-line" href="mailto:' + esc(c.email) + '">' + icon('mail') + esc(c.email) + '</a>' +
            '<a class="ws-foot-line" href="https://wa.me/' + esc(String(c.phone).replace(/\D/g, '')) + '" target="_blank" rel="noopener">' + icon('whatsapp') + esc(c.whatsapp) + '</a>' +
          '</div>' +
          '<div class="ws-foot-col ws-foot-mid">' +
            '<span class="ws-crest"><i></i>' + esc(monogram(B.nameA, B.nameB)) + '<i></i></span>' +
            '<p class="ws-thanks">' + esc(c.thanks) + '</p>' +
          '</div>' +
          '<div class="ws-foot-col ws-foot-right">' +
            '<h3>Share the love</h3>' +
            '<p>Share our invitation with your family and friends</p>' +
            '<div class="ws-soc">' + soc + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="ws-foot-bar">' +
          '<span>\u00a9 ' + new Date().getFullYear() + ' ' + esc(B.nameA + ' & ' + B.nameB) + (c.copyright ? ' \u00b7 ' + esc(c.copyright) : '') + '. All rights reserved.</span>' +
          '<span>' + esc(c.credit) + '</span>' +
        '</div>' +
      '</footer>';
  }

  /* ------------------------------------------------------------------ *
   *  MINI renderer (design cards + checkout summary)                    *
   * ------------------------------------------------------------------ */
  function renderSiteMini(tpl, data, opts) {
    opts = opts || {};
    data = data || siteDefaults();
    if (typeof tpl === 'string') tpl = findTemplate(tpl);
    data.templateId = tpl.id;
    var B = data.basics;
    var nf = NAME_FONTS[data.nameFont] || NAME_FONTS[tpl.nameFont] || NAME_FONTS.vibes;
    var el = document.createElement('div');
    el.className = 'wsm ws-orn-' + (tpl.ornament || 'lines');
    el.setAttribute('aria-hidden', 'true');
    applyVars(el, themeVars(tpl, data));

    var events = (data.sections.events.items || []).slice(0, opts.short ? 2 : 3).map(function (ev) {
      return '<span class="wsm-ev">' + icon(ev.icon) + '<b>' + esc(ev.name) + '</b><i>' + esc(ev.time) + '</i></span>';
    }).join('');
    var story = (data.sections.story.items || []).slice(0, opts.short ? 0 : 4).map(function (m) {
      return '<span class="wsm-ms"><img src="' + esc(photoSrc(m.photo)) + '" alt=""/></span>';
    }).join('');
    var gal = (data.sections.gallery.items || []).slice(0, 6).map(function (p) {
      return '<img src="' + esc(photoSrc(p.src)) + '" alt=""/>';
    }).join('');
    var amen = (data.sections.venue.items || []).slice(0, 4).map(function (a) {
      return '<span>' + icon(a.icon) + esc(a.label) + '</span>';
    }).join('');

    el.innerHTML = '' +
      '<div class="wsm-hero">' +
        '<img class="wsm-hero-img" src="' + esc(photoSrc(data.sections.hero.photo)) + '" alt=""/>' +
        '<span class="wsm-orn wsm-orn-a" aria-hidden="true"></span><span class="wsm-orn wsm-orn-b" aria-hidden="true"></span>' +
        '<span class="wsm-mono">' + esc(monogram(B.nameA, B.nameB)) + '</span>' +
        '<span class="wsm-kick">' + esc(data.sections.hero.kicker2) + '</span>' +
        '<strong class="wsm-names ' + nf.cls + '">' + esc(B.nameA) + ' <i>\u0026</i> ' + esc(B.nameB) + '</strong>' +
        '<span class="wsm-div"><i></i>' + icon('heart') + '<i></i></span>' +
        '<span class="wsm-date">' + esc(fmtHeroDate(B.date)) + '</span>' +
        '<span class="wsm-btn">' + esc(data.sections.hero.btnText || 'Enter invitation') + '</span>' +
      '</div>' +
      '<div class="wsm-count">' +
        '<div class="wsm-timer">' +
          '<span><b>120</b><i>Days</i></span><span><b>08</b><i>Hours</i></span>' +
          '<span><b>45</b><i>Mins</i></span><span><b>32</b><i>Secs</i></span>' +
        '</div>' +
        '<div class="wsm-dcards">' +
          '<span>' + icon('calendar') + '<b>Date</b><i>' + esc(fmtLongDate(B.date)) + '</i></span>' +
          '<span>' + icon('clock') + '<b>Time</b><i>' + esc(B.time) + '</i></span>' +
          '<span>' + icon('pin') + '<b>Venue</b><i>' + esc(B.venue) + '</i></span>' +
          '<span>' + icon('dress') + '<b>Dress</b><i>' + esc(B.dress) + '</i></span>' +
        '</div>' +
      '</div>' +
      (opts.short ? '' :
      '<div class="wsm-story"><span class="wsm-st">' + esc(data.sections.story.title) + '</span>' +
        '<div class="wsm-ms-row">' + story + '</div></div>') +
      '<div class="wsm-gallery">' + gal + '</div>' +
      '<div class="wsm-events"><span class="wsm-st">' + esc(data.sections.events.title) + '</span>' + events + '</div>' +
      (opts.short ? '' :
      '<div class="wsm-venue"><b>' + esc(data.sections.venue.name) + '</b>' + amen + '</div>' +
      '<div class="wsm-rsvp"><b>' + esc(data.sections.rsvp.title) + '</b><span class="wsm-btn wsm-btn-dark">Submit RSVP</span></div>') +
      '<div class="wsm-foot"><span>' + esc(data.sections.contact.thanks) + '</span>' +
        '<span class="wsm-crest">' + esc(monogram(B.nameA, B.nameB)) + '</span></div>'
      ;
    return el;
  }

  /* ------------------------------------------------------------------ *
   *  Live behaviours (editor preview): countdown + anchors + RSVP       *
   * ------------------------------------------------------------------ */
  function tickCountdowns(root) {
    var timers = (root || document).querySelectorAll('[data-ws-deadline]');
    Array.prototype.forEach.call(timers, function (t) {
      var end = new Date(t.getAttribute('data-ws-deadline')).getTime();
      if (isNaN(end)) return;
      var diff = Math.max(0, end - Date.now());
      var d = Math.floor(diff / 864e5),
          h = Math.floor(diff % 864e5 / 36e5),
          m = Math.floor(diff % 36e5 / 6e4),
          s = Math.floor(diff % 6e4 / 1e3);
      var map = { d: d, h: h, m: m, s: s };
      for (var u in map) {
        var node = t.querySelector('[data-u="' + u + '"]');
        if (node) node.textContent = String(map[u]).length < 2 ? '0' + map[u] : String(map[u]);
      }
    });
  }

  function bindSite(root) {
    if (!root || root.__wsBound) return;
    root.__wsBound = true;
    /* smooth anchor scrolling inside the preview */
    root.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('[data-goto]') : null;
      if (!a || !root.contains(a)) return;
      e.preventDefault();
      var target = root.querySelector('#ws-sec-' + a.getAttribute('data-goto'));
      var wrap = root.closest('.ed-canvas-wrap') || document.getElementById('canvas-frame') || root.parentElement;
      if (target && wrap) {
        var top = target.getBoundingClientRect().top - wrap.getBoundingClientRect().top + wrap.scrollTop - 10;
        wrap.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      }
    });
    /* RSVP demo submit */
    root.addEventListener('submit', function (e) {
      var form = e.target.closest ? e.target.closest('.ws-rsvp-form') : null;
      if (!form || !root.contains(form)) return;
      e.preventDefault();
      var name = form.querySelector('[name="name"]');
      var attend = form.querySelector('[name="attend"]');
      if (name && !name.value.trim()) { name.classList.add('ws-err'); name.focus(); return; }
      if (attend && !attend.value) { attend.classList.add('ws-err'); attend.focus(); return; }
      var sec = form.closest('.ws-rsvp');
      var doneMsg = root.__wsData && root.__wsData.sections.rsvp.success;
      var box = document.createElement('div');
      box.className = 'ws-rsvp-done';
      box.innerHTML = '<span class="ws-done-ic" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M7.5 12.5l3 3 6-6.5"/></svg></span>' +
        '<b>RSVP received</b><p>' + esc(doneMsg || 'Thank you!') + '</p>';
      form.hidden = true;
      (form.parentElement || sec).appendChild(box);
    });
    root.addEventListener('input', function (e) {
      if (e.target.classList) e.target.classList.remove('ws-err');
    }, true);
  }

  /* ------------------------------------------------------------------ */
  window.EVER_THEMES = THEMES;
  window.EVER_ICONS = ICONS;
  window.EVER_PHOTOS = PHOTOS;
  window.EVER_NAME_FONTS = NAME_FONTS;
  window.EVER_BODY_FONTS = BODY_FONTS;
  window.EVER_siteDefaults = siteDefaults;
  window.EVER_renderSite = renderSite;
  window.EVER_renderSiteMini = renderSiteMini;
  window.EVER_allTemplates = allTemplates;
  window.EVER_findTemplate = findTemplate;
  window.EVER_saveCustomTemplate = saveCustomTemplate;
  window.EVER_deleteCustomTemplate = deleteCustomTemplate;
  window.EVER_readCustomTemplates = readCustom;
  window.EVER_tickCountdowns = tickCountdowns;
  window.EVER_bindSite = bindSite;
  window.EVER_esc = esc;
  window.EVER_photoSrc = photoSrc;
  window.EVER_fmtHeroDate = fmtHeroDate;
  window.EVER_fmtLongDate = fmtLongDate;
  /* backwards-compatible aliases */
  window.EVER_TEMPLATES = THEMES;
  window.renderSiteMini = function (tpl, data) { return renderSiteMini(tpl, data); };
})();

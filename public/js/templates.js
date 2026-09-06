/* ==========================================================================
   Ever RSVP — core engine v4: multi-layout template catalog
   8 layouts (royal, bloom, fiesta, play, cinema, nest, lumen, noir) x
   27 premium themes across 7 event types. Layouts live in js/layouts/*.js
   and register themselves via EVER_registerLayout (see docs/LAYOUT-SPEC.md).
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
    chevron:  '<svg viewBox="0 0 24 24"><path d="m6 9.5 6 6 6-6"/></svg>',
    gift:     '<svg viewBox="0 0 24 24"><rect x="4" y="9.5" width="16" height="11" rx="1.5"/><path d="M3.5 6.5h17v3h-17zM12 6.5V20.5M12 6.5s-1-3.5-3.5-3.5a1.9 1.9 0 0 0 0 3.5zM12 6.5s1-3.5 3.5-3.5a1.9 1.9 0 0 1 0 3.5z"/></svg>',
    cake:     '<svg viewBox="0 0 24 24"><path d="M4 20.5h16M5.5 20.5v-6a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v6M9.5 12.5V10M14.5 12.5V10M12 12V9"/><path d="M12 7.2a1.4 1.4 0 1 1 0-2.8 1.4 1.4 0 0 1 0 2.8z"/></svg>',
    game:     '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="9" r="1.3" fill="currentColor" stroke="none"/><circle cx="9" cy="15" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="15" r="1.3" fill="currentColor" stroke="none"/></svg>',
    home:     '<svg viewBox="0 0 24 24"><path d="M4 11.5 12 4l8 7.5M6 10v10h12V10M10 20v-6h4v6"/></svg>',
    key:      '<svg viewBox="0 0 24 24"><circle cx="8" cy="8" r="4"/><path d="m11 11 9 9M17 17l2.2-2.2M14 14l2.2-2.2"/></svg>',
    cross:    '<svg viewBox="0 0 24 24"><path d="M12 4v16M7.5 9h9"/></svg>',
    star:     '<svg viewBox="0 0 24 24"><path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.7l5.9-.8z"/></svg>',
    moon:     '<svg viewBox="0 0 24 24"><path d="M20 13.5A8 8 0 0 1 10.5 4 8 8 0 1 0 20 13.5z"/></svg>',
    sun:      '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8"/></svg>',
    leaf:     '<svg viewBox="0 0 24 24"><path d="M19 5c-8 0-13 4-13 11 0 1.5.3 2.6.7 3C8 13 11 10.5 15.5 9.5 11 12 8.2 15 7.2 19c.7.3 1.6.5 2.8.5 7 0 9-7.5 9-14.5z"/></svg>',
    baby:     '<svg viewBox="0 0 24 24"><circle cx="12" cy="10" r="6.5"/><path d="M9.6 9h.01M14.4 9h.01M9.8 12.4a3.2 3.2 0 0 0 4.4 0M12 16.5V21M9 21h6"/></svg>',
    spark:    '<svg viewBox="0 0 24 24"><path d="M12 3v5M12 16v5M3 12h5M16 12h5M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3"/></svg>',
    glass:    '<svg viewBox="0 0 24 24"><path d="M8 3h8l-1 6a3 3 0 0 1-6 0zM12 12v8M8.5 20h7"/></svg>'
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
    { id: 'band',     src: 'assets/cta-band.jpg',    label: 'Celebration' },
    { id: 'balloons', src: 'assets/ev-balloons.jpg', label: 'Balloons & confetti' },
    { id: 'neon',     src: 'assets/ev-neon.jpg',     label: 'Neon party' },
    { id: 'glam',     src: 'assets/ev-glam.jpg',     label: 'Glam party table' },
    { id: 'tropical', src: 'assets/ev-tropical.jpg', label: 'Tropical pool party' },
    { id: 'anniv',    src: 'assets/ev-anniv.jpg',    label: 'Anniversary table' },
    { id: 'silver',   src: 'assets/ev-silver.jpg',   label: 'Silver celebration' },
    { id: 'home',     src: 'assets/ev-home.jpg',     label: 'New home porch' },
    { id: 'cottage',  src: 'assets/ev-cottage.jpg',  label: 'Cottage garden' },
    { id: 'baptism',  src: 'assets/ev-baptism.jpg',  label: 'Christening candles' },
    { id: 'baby',     src: 'assets/ev-baby.jpg',     label: 'Baby shower' },
    { id: 'gala',     src: 'assets/ev-gala.jpg',     label: 'Gala ballroom' },
    { id: 'star',     src: 'assets/ev-star.jpg',     label: 'Star party' }
  ];

  /* ------------------------------------------------------------------ *
   *  Event types                                                        *
   * ------------------------------------------------------------------ */
  var EVENTS = {
    wedding:      { label: 'Wedding',              tagline: 'Ceremonies & receptions' },
    birthday:     { label: 'Birthday',             tagline: 'Every milestone age' },
    anniversary:  { label: 'Anniversary',          tagline: 'Renew & remember' },
    housewarming: { label: 'Housewarming',         tagline: 'New address, open doors' },
    baptism:      { label: 'Baptism & Christening',tagline: 'A blessed beginning' },
    baby:         { label: 'Baby Shower & Kids',   tagline: 'Welcome little ones' },
    gala:         { label: 'Gala & Evening',       tagline: 'Formal affairs' }
  };

  /* ------------------------------------------------------------------ *
   *  Fonts                                                              *
   * ------------------------------------------------------------------ */
  var NAME_FONTS = {
    vibes:  { label: 'Script',    cls: 'f-vibes' },
    paris:  { label: 'Paris',     cls: 'f-paris' },
    corm:   { label: 'Classic',   cls: 'f-corm' },
    jost:   { label: 'Modern',    cls: 'f-jost' },
    pfd:    { label: 'Editorial', cls: 'f-pfd' },
    cinzel: { label: 'Grand',     cls: 'f-cinzel' },
    play:   { label: 'Bubbly',    cls: 'f-play' },
    baloo:  { label: 'Rounded',   cls: 'f-baloo' }
  };
  var BODY_FONTS = {
    lato: { label: 'Lato',  cls: '' },
    jost: { label: 'Jost',  cls: 'ws-body-jost' }
  };

  var CUSTOM_KEY = 'ever-rsvp-custom-tpl';
  var EVENT_KEY  = 'ever-rsvp-event';

  /* ------------------------------------------------------------------ *
   *  Helpers                                                            *
   * ------------------------------------------------------------------ */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  /* Security: only http(s) links and in-page anchors may be used in href/iframe
     sources the owner can type into — blocks javascript:/data:/vbscript: URLs.  */
  function safeUrl(u) {
    var s = String(u || '').trim();
    return /^(https:\/\/|http:\/\/|#[a-z0-9_-]*)/i.test(s) ? s : '';
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
  function initials(s) {
    return String(s || 'E').trim().split(/\s+/).map(function (w) { return w.charAt(0); }).join('').slice(0, 2).toUpperCase() || 'E';
  }
  function photoSrc(idOrUrl) {
    if (!idOrUrl) return PHOTOS[0].src;
    if (/^(https?:|data:|\/|assets\/)/.test(idOrUrl)) return idOrUrl;
    for (var i = 0; i < PHOTOS.length; i++) if (PHOTOS[i].id === idOrUrl) return PHOTOS[i].src;
    return PHOTOS[0].src;
  }
  function directionsUrl(address, city) {
    return 'https://www.google.com/maps/search/?api=1&query=' +
      encodeURIComponent(((address || '') + ' ' + (city || '')).trim());
  }
  function deepMerge(dst, src) {
    if (!src || typeof src !== 'object') return dst;
    for (var k in src) {
      if (!Object.prototype.hasOwnProperty.call(src, k)) continue;
      if (src[k] && typeof src[k] === 'object' && !Array.isArray(src[k]) && dst[k] && typeof dst[k] === 'object' && !Array.isArray(dst[k])) {
        deepMerge(dst[k], src[k]);
      } else if (src[k] !== undefined) {
        dst[k] = src[k];
      }
    }
    return dst;
  }
  function futureISO(monthsAhead, day) {
    var d = new Date();
    d.setDate(day || 24);
    d.setMonth(d.getMonth() + (monthsAhead || 0));
    var m = String(d.getMonth() + 1); if (m.length < 2) m = '0' + m;
    var dd = String(d.getDate()); if (dd.length < 2) dd = '0' + dd;
    return d.getFullYear() + '-' + m + '-' + dd;
  }
  function readJson(key) {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); }
    catch (e) { return null; }
  }
  function writeJson(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* ignore */ }
  }

  /* ------------------------------------------------------------------ *
   *  Layout registry                                                    *
   * ------------------------------------------------------------------ */
  var LAYOUTS = [];
  function registerLayout(def) {
    if (!def || !def.id || !def.render) return;
    def.sections = def.sections || [];
    def.basics = def.basics || [];
    LAYOUTS.push(def);
  }
  function layouts() { return LAYOUTS.slice(); }
  function findLayout(id) {
    for (var i = 0; i < LAYOUTS.length; i++) if (LAYOUTS[i].id === id) return LAYOUTS[i];
    return LAYOUTS[0];
  }
  function layoutOrder(layout) {
    return layout.sections.map(function (s) { return s.id; });
  }

  /* ------------------------------------------------------------------ *
   *  Theme catalog — 27 designs across 8 layouts / 7 event types        *
   * ------------------------------------------------------------------ */
  var THEMES = [
    /* ---- royal — Classic Wedding --------------------------------- */
    { id: 'emerald', name: 'Emerald & Gold', event: 'wedding', layout: 'royal', category: 'Classic',
      dark: '#17301f', gold: '#c9a45c', bg: '#f7f3e8', ink: '#3c3628', soft: '#efe7d2',
      nameFont: 'vibes', ornament: 'floral',
      content: { basics: { nameA: 'Ananya', nameB: 'Rohan' } } },
    { id: 'maroon', name: 'Royal Maroon', event: 'wedding', layout: 'royal', category: 'Classic',
      dark: '#47161f', gold: '#d4a95c', bg: '#faf5ec', ink: '#43302c', soft: '#f0e2d4',
      nameFont: 'vibes', ornament: 'floral',
      content: { basics: { nameA: 'Meera', nameB: 'Arjun' } } },
    { id: 'blush', name: 'Blush Rose', event: 'wedding', layout: 'royal', category: 'Floral',
      dark: '#5c3a40', gold: '#b98a8e', bg: '#faf3ef', ink: '#54423f', soft: '#f2e2dc',
      nameFont: 'paris', ornament: 'floral',
      content: { basics: { nameA: 'Sophie', nameB: 'James' } } },
    { id: 'navy', name: 'Midnight Navy', event: 'wedding', layout: 'royal', category: 'Classic',
      dark: '#1b2a41', gold: '#c8a96a', bg: '#f6f4ee', ink: '#39404d', soft: '#e4e2d8',
      nameFont: 'corm', ornament: 'lines',
      content: { basics: { nameA: 'Elena', nameB: 'Marco' } } },

    /* ---- bloom — Garden & Floral Wedding -------------------------- */
    { id: 'sage', name: 'Sage Garden', event: 'wedding', layout: 'bloom', category: 'Floral',
      dark: '#3f5142', gold: '#9a7b4f', bg: '#f5f6f0', ink: '#3d4438', soft: '#e2e8da',
      nameFont: 'corm', ornament: 'lines',
      content: { basics: { nameA: 'Freya', nameB: 'Oliver' } } },
    { id: 'champagne', name: 'Champagne Ivory', event: 'wedding', layout: 'bloom', category: 'Elegant',
      dark: '#6b5d4a', gold: '#b0955c', bg: '#faf7f0', ink: '#4a4234', soft: '#efe6d4',
      nameFont: 'corm', ornament: 'geo',
      content: { basics: { nameA: 'Charlotte', nameB: 'Henry' } } },
    { id: 'lavender', name: 'Lavender Mist', event: 'wedding', layout: 'bloom', category: 'Floral',
      dark: '#443a63', gold: '#9a7bc9', bg: '#f7f4fa', ink: '#453e58', soft: '#e7e0f2',
      nameFont: 'paris', ornament: 'geo',
      content: { basics: { nameA: 'Isla', nameB: 'Noah' } } },
    { id: 'marigold', name: 'Marigold Saffron', event: 'wedding', layout: 'bloom', category: 'Floral',
      dark: '#7c3f10', gold: '#d99a2b', bg: '#fdf6e7', ink: '#5b3a17', soft: '#f7e7c6',
      nameFont: 'vibes', ornament: 'floral',
      content: { basics: { nameA: 'Priya', nameB: 'Dev' } } },

    /* ---- fiesta — Birthday ---------------------------------------- */
    { id: 'balloonpop', name: 'Balloon Pop', event: 'birthday', layout: 'fiesta', category: 'Playful',
      dark: '#e0447c', gold: '#1f9e8e', bg: '#fff7f9', ink: '#4a2c3a', soft: '#ffe3ee',
      nameFont: 'play', ornament: 'geo',
      content: { basics: { name: 'Aarav', age: '7' } } },
    { id: 'neon', name: 'Neon Eighteen', event: 'birthday', layout: 'fiesta', category: 'Glam',
      dark: '#0d0a16', gold: '#ff4d8d', bg: '#141020', ink: '#f0ebff', soft: '#241c38',
      nameFont: 'jost', ornament: 'geo',
      content: { basics: { name: 'Zoe', age: '18' } } },
    { id: 'glam', name: 'Golden Sixteen', event: 'birthday', layout: 'fiesta', category: 'Glam',
      dark: '#2d2013', gold: '#d4a852', bg: '#fffaf3', ink: '#4a3a28', soft: '#f5e8d0',
      nameFont: 'paris', ornament: 'geo',
      content: { basics: { name: 'Isabella', age: '16' } } },
    { id: 'tropical', name: 'Tropical Fiesta', event: 'birthday', layout: 'fiesta', category: 'Playful',
      dark: '#1f5f5b', gold: '#ff7f5c', bg: '#fff8ef', ink: '#4f3826', soft: '#d8f0ea',
      nameFont: 'play', ornament: 'geo',
      content: { basics: { name: 'Maya', age: '30' } } },
    { id: 'fifty', name: 'Golden Fifty', event: 'birthday', layout: 'fiesta', category: 'Elegant',
      dark: '#33290f', gold: '#b98a2f', bg: '#fbf6ec', ink: '#4c412c', soft: '#f1e6c8',
      nameFont: 'corm', ornament: 'lines',
      content: { basics: { name: 'Robert', age: '50' } } },

    /* ---- cinema — Anniversary ------------------------------------- */
    { id: 'jubilee', name: 'Golden Jubilee', event: 'anniversary', layout: 'cinema', category: 'Elegant',
      dark: '#2a2310', gold: '#c9a45c', bg: '#faf5ea', ink: '#453a26', soft: '#efe4c8',
      nameFont: 'pfd', ornament: 'lines',
      content: { basics: { nameA: 'Grace', nameB: 'Jonathan', years: '50' } } },
    { id: 'silver', name: 'Silver Years', event: 'anniversary', layout: 'cinema', category: 'Elegant',
      dark: '#232c36', gold: '#9fb0c0', bg: '#f6f8fa', ink: '#3a4450', soft: '#e2e8ee',
      nameFont: 'pfd', ornament: 'lines',
      content: { basics: { nameA: 'Helen', nameB: 'David', years: '25' } } },
    { id: 'ruby', name: 'Ruby Romance', event: 'anniversary', layout: 'cinema', category: 'Classic',
      dark: '#3c1420', gold: '#c23b52', bg: '#fbf3f2', ink: '#4c3036', soft: '#f2dcda',
      nameFont: 'pfd', ornament: 'floral',
      content: { basics: { nameA: 'Amara', nameB: 'Kwame', years: '40' } } },

    /* ---- nest — Housewarming -------------------------------------- */
    { id: 'newkeys', name: 'New Keys', event: 'housewarming', layout: 'nest', category: 'Modern',
      dark: '#2f4a3e', gold: '#c98f4e', bg: '#f8f6f1', ink: '#3f3a30', soft: '#e8e2d4',
      nameFont: 'corm', ornament: 'lines',
      content: { basics: { family: 'The Bennetts' },
        sections: { hero: { photo: 'home' } } } },
    { id: 'cottage', name: 'Cottage Welcome', event: 'housewarming', layout: 'nest', category: 'Rustic',
      dark: '#5c4632', gold: '#a4703f', bg: '#faf7ee', ink: '#4a4032', soft: '#ece2cc',
      nameFont: 'corm', ornament: 'floral',
      content: { basics: { family: 'The Hartleys' },
        sections: { hero: { photo: 'cottage' } } } },
    { id: 'hearth', name: 'Modern Hearth', event: 'housewarming', layout: 'nest', category: 'Minimal',
      dark: '#1f1e1b', gold: '#b08b5e', bg: '#f7f6f4', ink: '#33312c', soft: '#e8e5de',
      nameFont: 'jost', ornament: 'geo',
      content: { basics: { family: 'The Moreaus' },
        sections: { hero: { photo: 'home' } } } },

    /* ---- lumen — Baptism & Christening ---------------------------- */
    { id: 'lamb', name: 'Little Lamb', event: 'baptism', layout: 'lumen', category: 'Soft',
      dark: '#6f6851', gold: '#b0a583', bg: '#fbf9f4', ink: '#4c463a', soft: '#efe9da',
      nameFont: 'paris', ornament: 'floral',
      content: { basics: { child: 'Theodore' },
        sections: { hero: { photo: 'baptism' } } } },
    { id: 'sky', name: 'Sky of Grace', event: 'baptism', layout: 'lumen', category: 'Soft',
      dark: '#39586e', gold: '#7fa8c9', bg: '#f4f8fb', ink: '#3a4a58', soft: '#dfeaf2',
      nameFont: 'paris', ornament: 'lines',
      content: { basics: { child: 'Lily' },
        sections: { hero: { photo: 'baptism' } } } },
    { id: 'ivorycross', name: 'Ivory & Gold Cross', event: 'baptism', layout: 'lumen', category: 'Classic',
      dark: '#5c5140', gold: '#c2a05e', bg: '#fbf8f0', ink: '#4a4234', soft: '#efe7d2',
      nameFont: 'corm', ornament: 'geo',
      content: { basics: { child: 'Gabriel' },
        sections: { hero: { photo: 'baptism' } } } },

    /* ---- play — Baby Shower & Kids -------------------------------- */
    { id: 'teddy', name: 'Teddy Hug', event: 'baby', layout: 'play', category: 'Soft',
      dark: '#7a5c44', gold: '#c99a6e', bg: '#faf6ef', ink: '#4a4038', soft: '#efe4d2',
      nameFont: 'play', ornament: 'floral',
      content: { basics: { name: 'Bennett' } } },
    { id: 'sunshine', name: 'Sunshine Sprinkle', event: 'baby', layout: 'play', category: 'Playful',
      dark: '#d99a2b', gold: '#e8862e', bg: '#fffbea', ink: '#5c4a1f', soft: '#f9edcd',
      nameFont: 'baloo', ornament: 'geo',
      content: { basics: { name: 'Sunny' } } },
    { id: 'star', name: 'Little Star', event: 'baby', layout: 'play', category: 'Playful',
      dark: '#1e2a4a', gold: '#e3b23c', bg: '#f7f9fd', ink: '#39445c', soft: '#e4e9f5',
      nameFont: 'baloo', ornament: 'geo',
      content: { basics: { name: 'Aria' } } },

    /* ---- noir — Gala & Evening ------------------------------------ */
    { id: 'gala', name: 'Midnight Gala', event: 'gala', layout: 'noir', category: 'Elegant',
      dark: '#0d0c11', gold: '#c9a45c', bg: '#15141a', ink: '#ece9e2', soft: '#232129',
      nameFont: 'cinzel', ornament: 'lines',
      content: { basics: { host: 'The Ashford Society' } } },
    { id: 'velvet', name: 'Velvet Rope', event: 'gala', layout: 'noir', category: 'Classic',
      dark: '#4a1420', gold: '#c9905c', bg: '#f9f4f4', ink: '#3e262c', soft: '#efdcd9',
      nameFont: 'cinzel', ornament: 'geo',
      content: { basics: { host: 'The Beaumont Committee' } } }
  ];

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
    t.event = t.event || 'wedding';
    t.layout = t.layout || 'royal';
    t.category = t.category || 'Custom';
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
  function allTemplates() { return THEMES.concat(readCustom()); }
  function findTemplate(id) {
    var list = allTemplates();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return list[0];
  }
  function templateExists(id) {
    return THEMES.some(function (t) { return t.id === id; }) ||
      readCustom().some(function (t) { return t.id === id; });
  }

  /* ------------------------------------------------------------------ *
   *  Default site content for a template                                *
   *  (layout defaults + template content overrides)                     *
   * ------------------------------------------------------------------ */
  function siteDefaults(templateId) {
    var tpl = templateId ? findTemplate(templateId) : THEMES[0];
    var layout = findLayout(tpl.layout || 'royal');
    var dflt = layout.defaults ? layout.defaults() : { basics: {}, sections: {} };
    var d = {
      v: 4,
      layoutId: layout.id,
      templateId: tpl.id,
      nameFont: '',            /* '' = follow the template */
      bodyFont: 'lato',
      accent: 'tpl',           /* 'tpl' or hex */
      btnShape: 'soft',
      spacing: 'normal',
      basics: dflt.basics || {},
      order: layoutOrder(layout),
      sections: dflt.sections || {}
    };
    if (tpl.content) {
      if (tpl.content.basics) deepMerge(d.basics, tpl.content.basics);
      if (tpl.content.sections) {
        for (var k in tpl.content.sections) {
          if (!d.sections[k]) d.sections[k] = { on: true };
          deepMerge(d.sections[k], tpl.content.sections[k]);
        }
      }
    }
    return d;
  }

  /* ------------------------------------------------------------------ *
   *  State loader (editor) with v1/v2/v3 → v4 migration                 *
   * ------------------------------------------------------------------ */
  function loadSiteState(flow) {
    flow = flow || {};
    var saved = readJson(EVENT_KEY);
    var wanted = flow.design || (saved && saved.templateId) || '';
    if (wanted && !templateExists(wanted)) wanted = '';
    var d = siteDefaults(wanted || undefined);

    if (!saved || typeof saved !== 'object') return d;

    /* theme-ish top-level fields carry over on every version */
    ['nameFont', 'bodyFont', 'accent', 'btnShape', 'spacing'].forEach(function (k) {
      if (saved[k] !== undefined && saved[k] !== null && saved[k] !== '') d[k] = saved[k];
    });

    var savedLayout = null;
    if (saved.v === 4 && saved.layoutId && LAYOUTS.some(function (l) { return l.id === saved.layoutId; })) {
      savedLayout = saved.layoutId;
    } else if (saved.v === 3) {
      savedLayout = 'royal'; /* v3 sites used the classic wedding format */
    }

    if (saved.v === 4) {
      /* keep user edits; extra section keys are simply ignored by renderers */
      deepMerge(d, saved);
      if (saved.order && Array.isArray(saved.order) && saved.order.length) d.order = saved.order.slice();
    } else if (saved.v === 3) {
      if (saved.basics) deepMerge(d.basics, saved.basics);
      if (saved.sections) {
        for (var k in saved.sections) {
          if (d.sections[k]) deepMerge(d.sections[k], saved.sections[k]);
        }
      }
      if (Array.isArray(saved.order) && saved.order.length === d.order.length) d.order = saved.order.slice();
    } else {
      /* v1/v2 legacy: carry only universal bits */
      var TMAP = { eucalyptus: 'sage', monogram: 'champagne', 'golden-hour': 'champagne',
        midnight: 'navy', 'garden-party': 'sage', ocean: 'navy', ivory: 'champagne' };
      if (saved.sections && saved.sections.rsvp && saved.sections.rsvp.deadline) {
        d.sections.rsvp.deadline = saved.sections.rsvp.deadline;
      }
      if (saved.nameFont === 'classic') d.nameFont = 'corm';
      if (saved.nameFont === 'romantic') d.nameFont = 'paris';
      if (saved.nameFont === 'modern') d.nameFont = 'jost';
      void TMAP;
    }

    /* the design picked in checkout wins, but keep edits when the layout matches */
    if (flow.design && templateExists(flow.design) && flow.design !== d.templateId) {
      var newTpl = findTemplate(flow.design);
      if (newTpl.layout === d.layoutId) {
        d.templateId = flow.design; /* keep user edits */
      } else {
        d = siteDefaults(flow.design); /* new event type → fresh sample content */
      }
    }
    if (!templateExists(d.templateId)) d.templateId = THEMES[0].id;
    var tpl = findTemplate(d.templateId);
    if (!LAYOUTS.some(function (l) { return l.id === d.layoutId; }) || d.layoutId !== (tpl.layout || 'royal')) {
      /* switching layouts keeps overlapping content keys via deepMerge below */
      var keep = { basics: d.basics, sections: d.sections };
      d = siteDefaults(d.templateId);
      deepMerge(d.basics, keep.basics);
      for (var sk in keep.sections) {
        if (d.sections[sk]) deepMerge(d.sections[sk], keep.sections[sk]);
      }
    }
    void savedLayout;
    return d;
  }

  /* ------------------------------------------------------------------ *
   *  Theme CSS variables + root elements                                *
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
  function applyVars(el, tpl, data) {
    var v = themeVars(tpl, data);
    for (var k in v) el.style.setProperty(k, v[k]);
  }
  function siteRoot(data, tpl, opts) {
    opts = opts || {};
    var layout = findLayout(data.layoutId || tpl.layout || 'royal');
    var el = document.createElement('div');
    el.className = 'ws ws-' + layout.id + ' ws-orn-' + (tpl.ornament || 'lines') + ' ' +
      (BODY_FONTS[data.bodyFont] || BODY_FONTS.lato).cls +
      ' ws-bs-' + (data.btnShape || 'soft') + ' ws-sp-' + (data.spacing || 'normal') +
      (opts.interactive ? ' ws-live' : '');
    applyVars(el, tpl, data);
    return el;
  }
  function miniRoot(tpl, data, layoutId) {
    var el = document.createElement('div');
    el.className = 'wsm ws-' + (layoutId || tpl.layout || 'royal') + ' ws-orn-' + (tpl.ornament || 'lines');
    el.setAttribute('aria-hidden', 'true');
    applyVars(el, tpl, data);
    return el;
  }

  /* ------------------------------------------------------------------ *
   *  Shared partials used by layouts                                    *
   * ------------------------------------------------------------------ */
  function timerHtml(dateISO) {
    return '<div class="ws-timer" data-ws-deadline="' + esc(dateISO) + 'T17:00:00" aria-label="Countdown timer">' +
      '<span class="ws-tbox"><b data-u="d">00</b><i>Days</i></span>' +
      '<span class="ws-tbox"><b data-u="h">00</b><i>Hours</i></span>' +
      '<span class="ws-tbox"><b data-u="m">00</b><i>Minutes</i></span>' +
      '<span class="ws-tbox"><b data-u="s">00</b><i>Seconds</i></span>' +
    '</div>';
  }
  function rsvpFormHtml(r) {
    var guests = '<option value="">Number of guests</option>';
    for (var i = 1; i <= (parseInt(r.guestsMax, 10) || 6); i++) guests += '<option value="' + i + '">' + i + '</option>';
    var meals = '<option value="">Meal preference</option>';
    (r.meals || []).forEach(function (m) { meals += '<option>' + esc(m) + '</option>'; });
    return '<form class="ws-rsvp-form" novalidate>' +
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
    '</form>';
  }
  function mapIframe(url, title) {
    var src = safeUrl(url);
    return src
      ? '<iframe class="ws-map" src="' + esc(src) + '" title="' + esc(title || 'Venue map') + '" loading="lazy" referrerpolicy="no-referrer"></iframe>'
      : '<div class="ws-map ws-map-empty">' + icon('pin') + '<p>Map coming soon</p></div>';
  }

  /* ------------------------------------------------------------------ *
   *  Renderers (dispatch to the layout)                                 *
   * ------------------------------------------------------------------ */
  function renderSite(data, opts) {
    data = data || siteDefaults();
    var tpl = findTemplate(data.templateId);
    var layout = findLayout(data.layoutId || tpl.layout || 'royal');
    return layout.render(data, tpl, opts || {});
  }

  function renderSiteMini(tpl, data, opts) {
    opts = opts || {};
    if (typeof tpl === 'string') tpl = findTemplate(tpl);
    data = data || siteDefaults(tpl.id);
    data.templateId = tpl.id;
    var layout = findLayout(tpl.layout || data.layoutId || 'royal');
    if (layout.mini) return layout.mini(data, tpl, opts);
    return miniRoot(tpl, data, layout.id);
  }

  /* ------------------------------------------------------------------ *
   *  Live behaviours: countdown + anchors + RSVP + scroll reveal        *
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
    /* gentle scroll-reveal for site sections (JS-added class: no-JS visitors
       never see hidden content; honours prefers-reduced-motion) */
    var reduceMotion = false;
    try { reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { /* ignore */ }
    if (!reduceMotion && 'IntersectionObserver' in window) {
      var secs = root.querySelectorAll('.ws-sec, .ws-footer');
      Array.prototype.forEach.call(secs, function (sec) { sec.classList.add('ws-anim'); });
      var secIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('ws-in'); secIO.unobserve(en.target); }
        });
      }, { threshold: 0.12 });
      Array.prototype.forEach.call(secs, function (sec) { secIO.observe(sec); });
    }
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
      var doneMsg = root.__wsData && root.__wsData.sections && root.__wsData.sections.rsvp &&
                    root.__wsData.sections.rsvp.success;
      var box = document.createElement('div');
      box.className = 'ws-rsvp-done';
      box.innerHTML = '<span class="ws-done-ic" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M7.5 12.5l3 3 6-6.5"/></svg></span>' +
        '<b>RSVP received</b><p>' + esc(doneMsg || 'Thank you!') + '</p>';
      form.hidden = true;
      (form.parentElement || form.closest('.ws-sec') || root).appendChild(box);
    });
    root.addEventListener('input', function (e) {
      if (e.target.classList) e.target.classList.remove('ws-err');
    }, true);
  }

  /* ------------------------------------------------------------------ */
  window.EVER_EVENTS = EVENTS;
  window.EVER_THEMES = THEMES;
  window.EVER_ICONS = ICONS;
  window.EVER_PHOTOS = PHOTOS;
  window.EVER_NAME_FONTS = NAME_FONTS;
  window.EVER_BODY_FONTS = BODY_FONTS;
  window.EVER_registerLayout = registerLayout;
  window.EVER_layouts = layouts;
  window.EVER_findLayout = findLayout;
  window.EVER_layoutOrder = layoutOrder;
  window.EVER_siteDefaults = siteDefaults;
  window.EVER_loadSiteState = loadSiteState;
  window.EVER_renderSite = renderSite;
  window.EVER_renderSiteMini = renderSiteMini;
  window.EVER_allTemplates = allTemplates;
  window.EVER_findTemplate = findTemplate;
  window.EVER_templateExists = templateExists;
  window.EVER_saveCustomTemplate = saveCustomTemplate;
  window.EVER_deleteCustomTemplate = deleteCustomTemplate;
  window.EVER_readCustomTemplates = readCustom;
  window.EVER_tickCountdowns = tickCountdowns;
  window.EVER_bindSite = bindSite;
  window.EVER_esc = esc;
  window.EVER_safeUrl = safeUrl;
  window.EVER_photoSrc = photoSrc;
  window.EVER_fmtHeroDate = fmtHeroDate;
  window.EVER_fmtLongDate = fmtLongDate;
  window.EVER_fmtWeekday = fmtWeekday;
  window.EVER_dateObj = dateObj;
  window.EVER_monogram = monogram;
  window.EVER_initials = initials;
  window.EVER_directionsUrl = directionsUrl;
  window.EVER_applyVars = applyVars;
  window.EVER_siteRoot = siteRoot;
  window.EVER_miniRoot = miniRoot;
  window.EVER_timerHtml = timerHtml;
  window.EVER_rsvpFormHtml = rsvpFormHtml;
  window.EVER_mapIframe = mapIframe;
  window.EVER_icon = icon;
  window.EVER_deepMerge = deepMerge;
  window.EVER_futureISO = futureISO;
  window.EVER_readJson = readJson;
  window.EVER_writeJson = writeJson;
  window.EVER_EVENT_KEY = EVENT_KEY;
  /* backwards-compatible aliases */
  window.EVER_TEMPLATES = THEMES;
  window.renderSiteMini = function (tpl, data) { return renderSiteMini(tpl, data); };
})();

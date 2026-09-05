/* ============================================================
   Online RSVP — public.js
   App.views.site — guest-facing event website + RSVP flow.
   Extends window.App (app.js). No imports, no frameworks.
   Hash: #/site/<slug> or #/site/<slug>?token=<guestToken>
   Endpoints:
     GET  /api/public/<slug>                       → { event }
     GET  /api/events/<id>/rsvp?token=<token>      → { guest, event, questions, subEvents }
     POST /api/events/<id>/rsvp                    → RSVP submit
   ============================================================ */
'use strict';

(function () {
  var esc = function (s) { return App.esc(s); };

  /* ---------------- Module state ---------------- */
  var site = { ev: null, token: null, failed: false, errStatus: 0 };
  var flow = {
    active: false, step: 1, ev: null, token: null, guest: null, maxParty: 0,
    name: '', email: '', attending: null, partySize: 1,
    subEventIds: [], answers: {}, questions: [], subEvents: []
  };
  var lb = { list: [], idx: 0, bound: false };

  /* ---------------- Small helpers ---------------- */
  // params[0] may be "<slug>" or "<slug>?token=abc" — parse query ourselves.
  function parseSlug(raw) {
    raw = String(raw || '');
    var qi = raw.indexOf('?');
    var slug = qi >= 0 ? raw.slice(0, qi) : raw;
    var token = null;
    if (qi >= 0) {
      raw.slice(qi + 1).split('&').forEach(function (pair) {
        var kv = pair.split('=');
        if (kv[0] === 'token' && kv[1]) {
          try { token = decodeURIComponent(kv[1]); } catch (e) { token = kv[1]; }
        }
      });
    }
    return { slug: slug, token: token };
  }

  // Sanitize values injected into CSS (theme colors / font names / urls).
  function cssSafe(v, fb) {
    var s = String(v == null ? '' : v).replace(/["'`<>{};\\]/g, '').trim();
    return s || fb;
  }
  function cssUrl(u) {
    return "url('" + String(u == null ? '' : u)
      .replace(/\\/g, '%5C').replace(/'/g, '%27').replace(/"/g, '%22').replace(/</g, '%3C') + "')";
  }
  function firstName(name) {
    return String(name || '').trim().split(/\s+/)[0] || 'there';
  }
  function overlayAlpha(ov, fb) {
    var n = ov == null ? fb : Number(ov);
    if (isNaN(n)) n = fb;
    return Math.max(0, Math.min(100, n)) / 100;
  }

  // Apply theme tokens as inline CSS vars on any element (site root or modal panel).
  function applyTheme(el, ev) {
    if (!el) return;
    var t = (ev && ev.theme) || App.DEFAULT_THEME;
    function set(k, v) { el.style.setProperty(k, v); }
    set('--ev-primary', cssSafe(t.primary, '#9A7B5B'));
    set('--ev-secondary', cssSafe(t.secondary, '#F6F1EA'));
    set('--ev-text', cssSafe(t.text, '#272727'));
    set('--ev-bg', cssSafe(t.background, '#FFFFFF'));
    set('--ev-radius', (parseInt(t.borderRadius, 10) || 8) + 'px');
    set('--ev-btn-radius', t.buttonStyle === 'pill' ? '999px' : t.buttonStyle === 'square' ? '0px' : (parseInt(t.borderRadius, 10) || 8) + 'px');
    set('--ev-space', String(Number(t.spacing) || 1));
    set('--ev-font-heading', "'" + cssSafe(t.headingFont, 'Cormorant Garamond') + "', Georgia, serif");
    set('--ev-font-body', "'" + cssSafe(t.bodyFont, 'Inter') + "', system-ui, sans-serif");
  }

  /* ============================================================
     SECTION RENDERERS
     ============================================================ */
  function secOpen(s, type) {
    var st = s.settings || {};
    var pad = st.padding === 'sm' || st.padding === 'lg' ? st.padding : 'md';
    var align = st.align === 'left' ? ' ev-align-left' : ' ev-align-center';
    var style = '';
    if (st.bgImage) {
      var a = overlayAlpha(st.overlay, 35);
      style += 'background-image:linear-gradient(rgba(0,0,0,' + a.toFixed(2) + '),rgba(0,0,0,' + a.toFixed(2) + ')),' + cssUrl(st.bgImage) + ';background-size:cover;background-position:center;color:#fff;';
    } else if (st.bg) {
      style += 'background-color:' + cssSafe(st.bg, 'transparent') + ';';
    }
    return '<section class="ev-sec ev-pad-' + pad + align + '" data-sec-type="' + type + '"' + (style ? ' style="' + style + '"' : '') + '><div class="ev-container">';
  }
  var secClose = '</div></section>';

  function secHead(heading, subtitle) {
    return (heading ? '<h2 class="ev-h2">' + esc(heading) + '</h2>' : '') +
      (subtitle ? '<p class="ev-sub">' + esc(subtitle) + '</p>' : '');
  }

  function rHero(s) {
    var c = s.content || {};
    var st = s.settings || {};
    var style = '';
    var onImage = !!st.bgImage;
    if (onImage) {
      var a = overlayAlpha(st.overlay, 35);
      style = 'background-image:linear-gradient(rgba(0,0,0,' + a.toFixed(2) + '),rgba(0,0,0,' + a.toFixed(2) + ')),' + cssUrl(st.bgImage) + ';background-size:cover;background-position:center;color:#fff;';
    } else if (st.bg) {
      style = 'background-color:' + cssSafe(st.bg, '') + ';';
    } else {
      style = 'background:var(--ev-secondary);color:var(--ev-text);';
    }
    return '<section class="ev-hero' + (st.height === 'auto' ? ' ev-hero-auto' : '') + '" data-sec-type="hero" style="' + style + '">' +
      '<div class="ev-hero-in">' +
        (c.heading ? '<h1 class="ev-display">' + esc(c.heading) + '</h1>' : '') +
        (c.subheading ? '<p class="ev-hero-sub">' + esc(c.subheading) + '</p>' : '') +
        ((c.dateText || c.locationText) ? '<div class="ev-hero-meta">' + esc(c.dateText || '') +
          (c.dateText && c.locationText ? '<span class="ev-meta-dot">•</span>' : '') + esc(c.locationText || '') + '</div>' : '') +
        '<div class="ev-hero-cta"><button class="ev-btn ev-btn-lg" data-scroll-rsvp>' + esc(c.buttonText || 'RSVP Now') + '</button></div>' +
      '</div>' +
      '<button class="ev-scroll' + (onImage ? '' : ' ev-scroll-dark') + '" data-scroll-next aria-label="Scroll to next section">' + App.icon('chevron-down') + '</button>' +
    '</section>';
  }

  function rText(s) {
    var c = s.content || {};
    if (!c.heading && !c.body) return '';
    return secOpen(s, 'text') + secHead(c.heading) +
      (c.body ? '<p class="ev-body-p">' + esc(c.body) + '</p>' : '') + secClose;
  }

  function rStory(s) {
    var c = s.content || {};
    return secOpen(s, 'story') +
      '<div class="ev-story">' +
        (c.image ? '<div class="ev-story-img" role="img" aria-label="' + esc(c.heading || 'Story image') + '" style="background-image:' + cssUrl(c.image) + '"></div>' : '') +
        '<div class="ev-story-body">' +
          (c.heading ? '<h2 class="ev-h2">' + esc(c.heading) + '</h2>' : '') +
          (c.body ? '<p class="ev-body-p">' + esc(c.body) + '</p>' : '') +
        '</div>' +
      '</div>' + secClose;
  }

  function rCountdown(s) {
    var c = s.content || {};
    return secOpen(s, 'countdown') + secHead(c.heading) +
      '<div class="ev-countdown" data-countdown></div>' + secClose;
  }

  function rDetails(s, ev) {
    var c = s.content || {};
    var cells = [
      ['calendar', 'Date', App.fmtDate(ev.eventDate) || 'To be announced'],
      ['clock', 'Time', (App.fmtTime(ev.startTime || '') || 'TBA') + (ev.endTime ? ' – ' + App.fmtTime(ev.endTime) : '')],
      ['map-pin', 'Venue', ev.venue || 'To be announced'],
      ['star', 'Dress code', c.dressCode || 'Formal']
    ];
    return secOpen(s, 'details') + secHead(c.heading || 'When & Where') +
      '<div class="ev-details">' + cells.map(function (cell) {
        return '<div class="ev-detail"><span class="ev-detail-ic" aria-hidden="true">' + App.icon(cell[0]) + '</span>' +
          '<span><span class="ev-detail-label">' + cell[1] + '</span><span class="ev-detail-val">' + esc(cell[2]) + '</span></span></div>';
      }).join('') + '</div>' +
      (c.note ? '<p class="ev-note">' + esc(c.note) + '</p>' : '') + secClose;
  }

  function rSchedule(s, ev) {
    var c = s.content || {};
    var subs = ev.subEvents || [];
    if (!subs.length) return ''; // empty → hide
    var rows = subs.map(function (se) {
      return '<div class="ev-tl-row"><span class="ev-tl-dot" aria-hidden="true"></span>' +
        '<div class="ev-tl-body">' +
          '<div class="ev-tl-top"><span class="ev-tl-name">' + esc(se.name) + '</span>' +
            (se.dressCode ? '<span class="ev-tl-badge">' + esc(se.dressCode) + '</span>' : '') + '</div>' +
          '<div class="ev-tl-meta">' + App.icon('calendar') + ' ' + esc(App.fmtDateShort(se.date)) +
            '<span class="ev-tl-sep">·</span>' + App.icon('clock') + ' ' + esc(App.fmtTime(se.startTime || '')) +
            (se.endTime ? ' – ' + esc(App.fmtTime(se.endTime)) : '') +
            (se.venue ? '<span class="ev-tl-sep">·</span>' + App.icon('map-pin') + ' ' + esc(se.venue) : '') + '</div>' +
          (se.description ? '<p class="ev-tl-desc">' + esc(se.description) + '</p>' : '') +
        '</div></div>';
    }).join('');
    return secOpen(s, 'schedule') + secHead(c.heading || 'The Schedule') +
      '<div class="ev-tl">' + rows + '</div>' + secClose;
  }

  function rGallery(s, ev) {
    var c = s.content || {};
    var g = ev.gallery || [];
    if (!g.length) return '';
    return secOpen(s, 'gallery') + secHead(c.heading || 'Our Gallery', c.subtitle) +
      '<div class="ev-gal">' + g.map(function (img, i) {
        return '<button class="ev-gal-item" data-gal-idx="' + i + '" style="background-image:' + cssUrl(img.url) + '" aria-label="Open photo ' + (i + 1) + ' of ' + g.length + (img.caption ? ': ' + esc(img.caption) : '') + '">' +
          (img.caption ? '<span class="ev-gal-cap">' + esc(img.caption) + '</span>' : '') + '</button>';
      }).join('') + '</div>' + secClose;
  }

  function rMap(s, ev) {
    var c = s.content || {};
    var lat = 25.2048, lon = 55.2708; // default Dubai coords (no geocoding in this build)
    var bbox = (lon - 0.01).toFixed(4) + ',' + (lat - 0.005).toFixed(4) + ',' + (lon + 0.01).toFixed(4) + ',' + (lat + 0.005).toFixed(4);
    var src = 'https://www.openstreetmap.org/export/embed.html?bbox=' + bbox + '&amp;marker=' + encodeURIComponent(lat + ',' + lon);
    var q = encodeURIComponent(ev.address || ev.venue || ev.name || '');
    return secOpen(s, 'map') + secHead(c.heading || 'Getting There') +
      '<div class="ev-map-card">' +
        '<div class="ev-map-wrap"><iframe title="Event location map" src="' + src + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>' +
        '<div class="ev-map-info">' +
          '<span class="ev-map-ic" aria-hidden="true">' + App.icon('map-pin') + '</span>' +
          '<div><div class="ev-map-venue">' + esc(ev.venue || 'Venue') + '</div>' +
            (ev.address ? '<div class="muted small">' + esc(ev.address) + '</div>' : '') + '</div>' +
          '<a class="ev-btn ev-btn-outline ev-btn-sm" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&amp;query=' + q + '">Open in Google Maps ' + App.icon('external-link') + '</a>' +
        '</div>' +
      '</div>' + secClose;
  }

  function rAccommodation(s, ev) {
    var c = s.content || {};
    var list = ev.accommodations || [];
    if (!list.length) return '';
    return secOpen(s, 'accommodation') + secHead(c.heading || 'Where to Stay', c.subtitle) +
      '<div class="ev-acc-grid">' + list.map(function (a) {
        var stars = '';
        var n = Math.max(0, Math.min(5, Number(a.stars) || 0));
        for (var i = 0; i < n; i++) stars += '★';
        return '<div class="ev-acc-card">' +
          '<div class="ev-acc-top"><span class="ev-acc-name">' + esc(a.name) + '</span>' + (stars ? '<span class="ev-stars" aria-label="' + n + ' star hotel">' + stars + '</span>' : '') + '</div>' +
          '<div class="ev-acc-meta">' + (a.distance ? App.icon('map-pin') + ' ' + esc(a.distance) : '') + (a.price ? '<span class="ev-tl-sep">·</span> ' + esc(a.price) : '') + '</div>' +
          '<p class="ev-acc-desc">' + esc(a.description || '') + '</p>' +
          (a.url ? '<a class="ev-btn ev-btn-outline ev-btn-sm" href="' + esc(a.url) + '" target="_blank" rel="noopener">Book a room ' + App.icon('external-link') + '</a>' : '') +
        '</div>';
      }).join('') + '</div>' + secClose;
  }

  function rRegistry(s, ev) {
    var c = s.content || {};
    var list = ev.registryItems || [];
    if (!list.length) return '';
    return secOpen(s, 'registry') + secHead(c.heading || 'Our Registry', c.subtitle) +
      '<div class="ev-reg-grid">' + list.map(function (it) {
        var target = Number(it.target) || 0;
        var raised = Number(it.raised) || 0;
        var pct = target > 0 ? Math.min(100, Math.round(raised / target * 100)) : null;
        var link = it.url ? esc(it.url) : '';
        var amounts = ['$50', '$100', '$250', 'Custom'].map(function (amt) {
          return link
            ? '<a class="ev-chip" href="' + link + '" target="_blank" rel="noopener">' + amt + '</a>'
            : '<button class="ev-chip" type="button" data-reg-thanks>' + amt + '</button>';
        }).join('');
        return '<div class="ev-reg-card">' +
          '<span class="ev-reg-ic" aria-hidden="true">' + App.icon('gift') + '</span>' +
          '<span class="ev-reg-name">' + esc(it.name) + '</span>' +
          '<p class="ev-reg-desc">' + esc(it.description || '') + '</p>' +
          (pct != null
            ? '<div class="ev-reg-progress"><div class="progress"><span style="width:' + pct + '%;background:var(--ev-primary)"></span></div><span class="tiny muted">' + esc(App.money(raised)) + ' of ' + esc(App.money(target)) + ' (' + pct + '%)</span></div>'
            : '') +
          '<div class="ev-reg-amounts">' + amounts + '</div>' +
          (link ? '<a class="ev-reg-link" href="' + link + '" target="_blank" rel="noopener">Contribute ' + App.icon('external-link') + '</a>' : '') +
        '</div>';
      }).join('') + '</div>' + secClose;
  }

  function rRsvp(s) {
    var c = s.content || {};
    return secOpen(s, 'rsvp') +
      '<div class="ev-rsvp-banner">' +
        '<h2 class="ev-h2">' + esc(c.heading || 'Will you join us?') + '</h2>' +
        (c.subtitle ? '<p class="ev-sub">' + esc(c.subtitle) + '</p>' : '') +
        '<button class="ev-btn ev-btn-lg" data-rsvp-open>' + esc(c.buttonText || 'RSVP Now') + '</button>' +
      '</div>' + secClose;
  }

  function rContact(s, ev) {
    var c = s.content || {};
    var email = c.email || ev.contactEmail || '';
    var phone = c.phone || ev.contactPhone || '';
    if (!email && !phone) return '';
    var rows = '';
    if (email) rows += '<a class="ev-contact-row" href="mailto:' + esc(email) + '">' + App.icon('mail') + '<span>' + esc(email) + '</span></a>';
    if (phone) rows += '<a class="ev-contact-row" href="tel:' + esc(String(phone).replace(/[^+0-9]/g, '')) + '">' + App.icon('phone') + '<span>' + esc(phone) + '</span></a>';
    return secOpen(s, 'contact') + secHead(c.heading || 'Contact Us') +
      '<div class="ev-contact-list">' + rows + '</div>' + secClose;
  }

  function rDivider(s) {
    return secOpen(s, 'divider') +
      '<div class="ev-divider" aria-hidden="true"><span class="ev-div-line"></span>' + App.icon('heart') + '<span class="ev-div-line"></span></div>' + secClose;
  }

  function rFooter(s) {
    var c = s.content || {};
    return '<footer class="ev-footer">' +
      (c.text ? '<div class="ev-footer-text">' + esc(c.text) + '</div>' : '') +
      '<a class="ev-footer-link" href="#/">Made with <strong>Online RSVP</strong></a>' +
    '</footer>';
  }

  function renderSections(ev) {
    var out = '';
    var secs = (ev.sections || []).filter(function (s) { return s && s.visible !== false; });
    secs.forEach(function (s) {
      switch (s.type) {
        case 'hero': out += rHero(s); break;
        case 'text': out += rText(s); break;
        case 'story': out += rStory(s); break;
        case 'countdown': out += rCountdown(s); break;
        case 'details': out += rDetails(s, ev); break;
        case 'schedule': out += rSchedule(s, ev); break;
        case 'gallery': out += rGallery(s, ev); break;
        case 'map': out += rMap(s, ev); break;
        case 'accommodation': out += rAccommodation(s, ev); break;
        case 'registry': out += rRegistry(s, ev); break;
        case 'rsvp': out += rRsvp(s); break;
        case 'contact': out += rContact(s, ev); break;
        case 'divider': out += rDivider(s); break;
        case 'footer': out += rFooter(s); break;
        default: break; // unknown type → skip
      }
    });
    return out;
  }

  /* ---------------- Floating chrome / notice ---------------- */
  function floatsHtml() {
    if (App.state.user) {
      return '<button class="ev-float-exit" data-exit-preview>' + App.icon('log-out') + ' Exit preview</button>';
    }
    return '<a class="ev-float-badge" href="#/">Made with ' + App.icon('heart') + ' Online RSVP</a>';
  }

  function noticeHtml(ev) {
    return ev.status && ev.status !== 'published'
      ? '<div class="ev-notice" role="status">' + App.icon('info') + ' Preview — this event is not published yet. Only you (the host) can see it.</div>'
      : '';
  }

  /* ============================================================
     LIGHTBOX
     ============================================================ */
  function lbBody() {
    var img = lb.list[lb.idx] || {};
    return '<div class="ev-lb">' +
      '<img data-lb-img src="' + esc(img.url) + '" alt="' + esc(img.caption || 'Event photo') + '">' +
      '<div class="ev-lb-bar"><span class="ev-lb-cap" data-lb-cap>' + esc(img.caption || '') + '</span>' +
      '<span class="tiny muted ev-lb-count" data-lb-count>' + (lb.idx + 1) + ' / ' + lb.list.length + '</span></div>' +
    '</div>';
  }

  function lbUpdate() {
    if (!App.modal.isOpen()) return;
    var img = lb.list[lb.idx] || {};
    var el = App.qs('[data-lb-img]');
    if (el) { el.src = img.url || ''; el.alt = img.caption || 'Event photo'; }
    var cap = App.qs('[data-lb-cap]');
    if (cap) cap.textContent = img.caption || '';
    var cnt = App.qs('[data-lb-count]');
    if (cnt) cnt.textContent = (lb.idx + 1) + ' / ' + lb.list.length;
  }

  function lbNav(delta) {
    if (!lb.list.length) return;
    lb.idx = (lb.idx + delta + lb.list.length) % lb.list.length;
    lbUpdate();
  }

  function lbKey(e) {
    if (!App.modal.isOpen()) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); lbNav(-1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); lbNav(1); }
  }

  function openLightbox(idx) {
    lb.idx = idx;
    App.modal.open({
      xl: true,
      title: 'Gallery',
      body: lbBody(),
      footer: '<div class="ev-lb-nav" style="width:100%">' +
        '<button class="btn btn-outline" data-lb-prev>' + App.icon('chevron-left') + ' Prev</button>' +
        '<button class="btn btn-outline" data-lb-next>Next ' + App.icon('chevron-right') + '</button></div>',
      onMount: function (panel) {
        panel.querySelector('[data-lb-prev]').addEventListener('click', function () { lbNav(-1); });
        panel.querySelector('[data-lb-next]').addEventListener('click', function () { lbNav(1); });
      }
    });
    if (!lb.bound) {
      lb.bound = true;
      document.addEventListener('keydown', lbKey);
      App.addCleanup(function () {
        document.removeEventListener('keydown', lbKey);
        lb.bound = false;
      });
    }
  }

  /* ============================================================
     RSVP FLOW (modal-based, 5 steps, one reused modal)
     ============================================================ */
  function maxPartySize() {
    if (flow.guest && Number(flow.guest.maxParty) > 0) return Number(flow.guest.maxParty);
    var s = (flow.ev && flow.ev.settings) || {};
    return Number(s.maxGuests) > 0 ? Number(s.maxGuests) : 5;
  }

  function visibleQuestions() {
    return (flow.questions || []).filter(function (q) {
      return !(flow.attending === false && q.showIfAttending);
    });
  }

  function subEventChoices() {
    var list = flow.subEvents || [];
    var required = list.filter(function (se) { return se.rsvpRequired; });
    return required.length ? required : list;
  }

  function flowDots() {
    var out = '';
    for (var i = 1; i <= 5; i++) {
      out += '<span class="ev-dot' + (i === flow.step ? ' cur' : i < flow.step ? ' done' : '') + '"></span>';
    }
    return '<div class="ev-flow-dots" aria-label="Step ' + flow.step + ' of 5">' + out + '</div>';
  }

  function openRsvpFlow() {
    var ev = site.ev;
    if (!ev) return;
    var st = ev.settings || {};
    if (site.token) { startFlow(); return; }
    if (st.rsvpMode === 'password') { passwordGate(st.rsvpPassword); return; }
    if (st.rsvpMode === 'guestlist') { guestlistGate(); return; }
    startFlow();
  }

  function passwordGate(pw) {
    App.modal.open({
      title: 'Private event',
      body: '<p class="muted small" style="margin:0 0 12px">This event is password protected. Please enter the password from your invitation.</p>' +
        '<div class="field"><label class="label" for="ev-pw">Password</label>' +
        '<input class="input" id="ev-pw" type="password" autocomplete="off" placeholder="Event password"></div>',
      footer: '<button class="btn btn-outline" data-pw-cancel>Cancel</button>' +
        '<button class="btn btn-accent" data-pw-ok>Continue</button>',
      onMount: function (panel) {
        function tryPw() {
          var val = panel.querySelector('#ev-pw').value || '';
          if (val === String(pw == null ? '' : pw)) {
            App.modal.close();
            startFlow();
          } else {
            App.toast('Incorrect password — please try again', 'error');
            panel.querySelector('#ev-pw').focus();
          }
        }
        panel.querySelector('[data-pw-cancel]').addEventListener('click', function () { App.modal.close(); });
        panel.querySelector('[data-pw-ok]').addEventListener('click', tryPw);
        panel.querySelector('#ev-pw').addEventListener('keydown', function (e) { if (e.key === 'Enter') tryPw(); });
      }
    });
  }

  function guestlistGate() {
    App.modal.open({
      title: 'Private event',
      body: '<div class="empty" style="padding:18px 6px"><div class="empty-ic">' + App.icon('lock') + '</div>' +
        '<h4>This is a private event</h4><p>Please use your personalized invitation link to RSVP. Contact the host if you have not received one.</p></div>',
      footer: '<button class="btn btn-accent" data-gl-ok>OK</button>',
      onMount: function (panel) {
        panel.querySelector('[data-gl-ok]').addEventListener('click', function () { App.modal.close(); });
      }
    });
  }

  function startFlow() {
    var ev = site.ev;
    if (!ev) return;
    flow.ev = ev;
    flow.token = site.token;
    flow.guest = null;
    flow.maxParty = 0;
    flow.step = 1;
    flow.attending = null;
    flow.partySize = 1;
    flow.subEventIds = [];
    flow.answers = {};
    flow.name = '';
    flow.email = '';
    flow.questions = ev.questions || [];
    flow.subEvents = ev.subEvents || [];

    if (site.token) {
      App.modal.open({
        title: 'RSVP',
        body: '<div class="ev-flow-loading"><span class="spinner spinner-lg" role="status" aria-label="Loading invitation"></span></div>'
      });
      App.api('/api/events/' + encodeURIComponent(ev.id) + '/rsvp?token=' + encodeURIComponent(site.token))
        .then(function (res) {
          if (res && res.guest) {
            flow.guest = res.guest;
            flow.name = res.guest.name || '';
            flow.email = res.guest.email || '';
            flow.maxParty = Number(res.guest.maxParty) || 0;
            if (res.questions) flow.questions = res.questions;
            if (res.subEvents) flow.subEvents = res.subEvents;
          }
          openFlowModal();
        })
        .catch(function () {
          App.toast('Personalized link not found — continuing with public RSVP', 'info');
          openFlowModal();
        });
    } else {
      openFlowModal();
    }
  }

  function openFlowModal() {
    App.modal.open({
      title: esc('RSVP · ' + ((flow.ev && flow.ev.name) || 'Event')),
      body: '<div class="ev-flow" data-flow></div>',
      footer: '<div class="ev-flow-foot" data-flow-foot></div>',
      onMount: function (panel) {
        applyTheme(panel, flow.ev);
        renderFlow();
      }
    });
  }

  /* ---------- step renderers ---------- */
  function step1Html() {
    var g = flow.guest;
    var banner = '';
    if (g) {
      banner = '<div class="ev-invite"><div class="ev-invite-t">' + App.icon('mail-check') + ' You&#39;re invited, ' + esc(firstName(g.name)) + '!</div>' +
        (g.groupName ? '<span class="badge badge-accent">' + App.icon('users') + ' ' + esc(g.groupName) + '</span>' : '') +
        (flow.maxParty > 1 ? '<div class="tiny muted">Party of up to ' + flow.maxParty + ' guests</div>' : '') +
        '</div>';
    }
    return flowDots() + banner +
      '<div class="field"><label class="label" for="fl-name">Your full name <span class="ev-req">*</span></label>' +
      '<input class="input" id="fl-name" value="' + esc(flow.name) + '" placeholder="Jane Doe" autocomplete="name"></div>' +
      '<div class="field"><label class="label" for="fl-email">Email' + (flow.token ? '' : ' <span class="ev-req">*</span>') + '</label>' +
      '<input class="input" id="fl-email" type="email" value="' + esc(flow.email) + '" placeholder="you@example.com" autocomplete="email">' +
      '<div class="hint">' + (flow.token ? 'Only used to send you event updates.' : 'We&#39;ll send your confirmation here.') + '</div></div>';
  }

  function step2Html() {
    return flowDots() +
      '<h3 class="ev-step-title">Will you be attending?</h3>' +
      '<p class="muted small ev-step-subtext">' + esc((flow.ev && flow.ev.name) || '') + '</p>' +
      '<div class="ev-choices">' +
        '<button class="ev-choice" data-attend="yes"><span class="ev-choice-ic yes" aria-hidden="true">' + App.icon('check-circle') + '</span>' +
          '<span class="ev-choice-t">Joyfully accepts</span><span class="ev-choice-s">We can&#39;t wait to celebrate with you</span></button>' +
        '<button class="ev-choice" data-attend="no"><span class="ev-choice-ic no" aria-hidden="true">' + App.icon('x-circle') + '</span>' +
          '<span class="ev-choice-t">Regretfully declines</span><span class="ev-choice-s">You will be missed</span></button>' +
      '</div>';
  }

  function step3Html() {
    var max = maxPartySize();
    var subHtml = '';
    var subs = subEventChoices();
    if (subs.length) {
      subHtml = '<div class="ev-subsection"><span class="ev-q-label">Which events will you join?</span><div class="ev-sub-list">' +
        subs.map(function (se) {
          var checked = flow.subEventIds.indexOf(se.id) >= 0;
          return '<label class="ev-sub-item"><input type="checkbox" data-sub-check="' + esc(se.id) + '"' + (checked ? ' checked' : '') + '>' +
            '<span class="ev-sub-info"><span class="ev-sub-name">' + esc(se.name) + '</span>' +
            '<span class="tiny muted">' + esc(App.fmtDateShort(se.date)) + ' · ' + esc(App.fmtTime(se.startTime || '')) +
            (se.venue ? ' · ' + esc(se.venue) : '') + '</span></span></label>';
        }).join('') + '</div></div>';
    }
    return flowDots() +
      '<h3 class="ev-step-title">Party &amp; events</h3>' +
      '<div class="ev-subsection"><span class="ev-q-label">How many guests (including you)?</span>' +
        '<div class="ev-stepper">' +
          '<button class="icon-btn" type="button" data-fl-minus aria-label="Decrease party size">' + App.icon('minus') + '</button>' +
          '<span class="ev-step-num" data-party-num>' + flow.partySize + '</span>' +
          '<button class="icon-btn" type="button" data-fl-plus aria-label="Increase party size">' + App.icon('user-plus') + '</button>' +
        '</div>' +
        '<div class="hint center">Up to ' + max + ' ' + App.plural(max, 'guest', 'guests') + '</div>' +
      '</div>' + subHtml;
  }

  function qWrap(q, inner) {
    return '<div class="ev-q" data-qwrap="' + esc(q.id) + '">' + inner + '</div>';
  }

  function qField(q) {
    var id = 'fl-q-' + q.id;
    var req = q.required ? ' <span class="ev-req">*</span>' : '';
    var label = '<span class="ev-q-label">' + esc(q.label) + req + '</span>';
    var v = flow.answers[q.id];
    var vs = v == null ? '' : String(v);

    function textInput(type, extra) {
      return '<input class="input" id="' + id + '" type="' + type + '" data-q="' + esc(q.id) + '" data-qtype="' + q.type + '" value="' + esc(vs) + '"' + (extra || '') + '>';
    }
    switch (q.type) {
      case 'yesno':
      case 'radio':
        return qWrap(q, label + '<div class="ev-yn">' + (q.type === 'yesno' ? ['Yes', 'No'] : (q.options || [])).map(function (o) {
          return '<label class="ev-sub-item" style="flex:none"><input type="radio" name="' + id + '" data-q="' + esc(q.id) + '" data-qtype="' + q.type + '" value="' + esc(o) + '"' + (vs === o ? ' checked' : '') + '> ' + esc(o) + '</label>';
        }).join('') + '</div>');
      case 'checkbox':
        var arr = Array.isArray(v) ? v : [];
        return qWrap(q, label + '<div class="ev-yn">' + (q.options || []).map(function (o) {
          return '<label class="ev-sub-item" style="flex:none"><input type="checkbox" data-qopt="' + esc(q.id) + '" value="' + esc(o) + '"' + (arr.indexOf(o) >= 0 ? ' checked' : '') + '> ' + esc(o) + '</label>';
        }).join('') + '</div>');
      case 'meal':
        return qWrap(q, label + '<div class="ev-chips">' + (q.options || []).map(function (o) {
          return '<button type="button" class="ev-chip' + (vs === o ? ' active' : '') + '" data-meal-chip="' + esc(q.id) + '" data-val="' + esc(o) + '">' + esc(o) + '</button>';
        }).join('') + '</div>');
      case 'textarea':
        return qWrap(q, label + '<textarea class="textarea" id="' + id + '" rows="3" data-q="' + esc(q.id) + '" data-qtype="textarea" placeholder="Your answer…">' + esc(vs) + '</textarea>');
      case 'number':
        return qWrap(q, label + textInput('number', ' min="0" step="1"'));
      case 'select':
        return qWrap(q, label + '<select class="select" id="' + id + '" data-q="' + esc(q.id) + '" data-qtype="select"><option value="">— Select —</option>' +
          (q.options || []).map(function (o) { return '<option value="' + esc(o) + '"' + (vs === o ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('') + '</select>');
      case 'date':
        return qWrap(q, label + textInput('date'));
      default: // text
        return qWrap(q, label + textInput('text', ' placeholder="Your answer…"'));
    }
  }

  function step4Html() {
    var qs = visibleQuestions();
    return flowDots() +
      '<h3 class="ev-step-title">A few questions</h3>' +
      '<p class="muted small ev-step-subtext">This helps ' + esc((flow.ev && flow.ev.hostNames) || 'your hosts') + ' plan the day.</p>' +
      (qs.length ? qs.map(qField).join('') : '<p class="muted small center" style="padding:18px 0">No extra questions — continue to review.</p>');
  }

  function step5Html() {
    var att = flow.attending === true
      ? '<span class="badge badge-green">' + App.icon('check') + ' Joyfully accepts</span>'
      : '<span class="badge badge-red">' + App.icon('x') + ' Regretfully declines</span>';
    var rows = [];
    rows.push(['Name', esc(flow.name) + (flow.email ? ' <span class="muted small">· ' + esc(flow.email) + '</span>' : ''), 1]);
    rows.push(['Attendance', att, 2]);
    if (flow.attending) {
      rows.push(['Party size', flow.partySize + ' ' + App.plural(flow.partySize, 'guest', 'guests'), 3]);
      var names = (flow.subEvents || []).filter(function (se) { return flow.subEventIds.indexOf(se.id) >= 0; }).map(function (se) { return esc(se.name); });
      rows.push(['Sub-events', names.length ? names.join(', ') : '<span class="muted">None selected</span>', 3]);
    }
    var qs = visibleQuestions();
    if (qs.length) {
      var ans = qs.map(function (q) {
        var v = flow.answers[q.id];
        var vs = Array.isArray(v) ? v.map(esc).join(', ') : esc(v == null ? '' : v);
        return '<div class="ev-rev-q"><span class="tiny muted">' + esc(q.label) + '</span><span>' + (vs || '<span class="muted">—</span>') + '</span></div>';
      }).join('');
      rows.push(['Your answers', ans, 4]);
    }
    return flowDots() +
      '<h3 class="ev-step-title">Review your response</h3>' +
      '<div class="ev-review">' + rows.map(function (r) {
        return '<div class="ev-rev-row"><div class="ev-rev-head"><span class="ev-rev-label">' + r[0] + '</span>' +
          '<button class="ev-link-btn" type="button" data-fl-edit="' + r[2] + '">Edit</button></div>' +
          '<div class="ev-rev-val">' + r[1] + '</div></div>';
      }).join('') + '</div>';
  }

  function successHtml() {
    var declined = flow.attending === false;
    return '<div class="ev-success' + (declined ? ' declined' : '') + '">' +
      '<div class="ev-success-ic" aria-hidden="true">' + App.icon('check-circle') + '</div>' +
      '<h3 class="ev-step-title">' + (declined ? 'Response received' : 'You&#39;re confirmed!') + '</h3>' +
      '<p class="muted small ev-step-subtext">' + (declined
        ? 'Thank you for letting ' + esc(firstName((flow.ev && flow.ev.hostNames) || 'us')) + ' know, ' + esc(firstName(flow.name)) + '.'
        : 'Thank you, ' + esc(firstName(flow.name)) + ' — we can&#39;t wait to see you!') + '</p>' +
      '<div class="ev-success-sum">' +
        '<div><span class="tiny muted">Event</span><span>' + esc((flow.ev && flow.ev.name) || '') + '</span></div>' +
        '<div><span class="tiny muted">Date</span><span>' + esc(App.fmtDate(flow.ev && flow.ev.eventDate)) + ((flow.ev && flow.ev.startTime) ? ' · ' + esc(App.fmtTime(flow.ev.startTime)) : '') + '</span></div>' +
        (flow.ev && flow.ev.venue ? '<div><span class="tiny muted">Venue</span><span>' + esc(flow.ev.venue) + '</span></div>' : '') +
        (flow.attending ? '<div><span class="tiny muted">Party</span><span>' + flow.partySize + ' ' + App.plural(flow.partySize, 'guest', 'guests') + '</span></div>' : '') +
      '</div>' +
      '<div class="ev-success-actions">' +
        '<button class="ev-btn" type="button" data-ics>' + App.icon('calendar') + ' Add to Calendar</button>' +
        '<button class="ev-btn ev-btn-ghost2" type="button" data-fl-change>Change response</button>' +
      '</div>' +
    '</div>';
  }

  /* ---------- flow collection / validation ---------- */
  function invalid(el, msg) {
    if (el) { el.classList.add('ev-invalid'); el.setAttribute('aria-invalid', 'true'); }
    App.toast(msg, 'error');
  }

  function collectStep1() {
    var nameEl = App.qs('#fl-name');
    var emailEl = App.qs('#fl-email');
    flow.name = nameEl ? nameEl.value.trim() : flow.name;
    flow.email = emailEl ? emailEl.value.trim() : flow.email;
    if (nameEl) nameEl.classList.remove('ev-invalid');
    if (emailEl) emailEl.classList.remove('ev-invalid');
    if (!flow.name) { invalid(nameEl, 'Please enter your name'); return false; }
    if (!flow.token && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(flow.email)) { invalid(emailEl, 'Please enter a valid email address'); return false; }
    return true;
  }

  function collectStep3() {
    flow.subEventIds = App.qsa('[data-sub-check]:checked').map(function (cb) { return cb.getAttribute('data-sub-check'); });
    return true;
  }

  function readAnswer(q) {
    var id = 'fl-q-' + q.id;
    switch (q.type) {
      case 'yesno':
      case 'radio': {
        var r = App.qs('input[name="' + id + '"]:checked');
        return r ? r.value : '';
      }
      case 'checkbox':
        return App.qsa('input[data-qopt="' + q.id + '"]:checked').map(function (cb) { return cb.value; });
      case 'meal': {
        var chip = App.qs('[data-meal-chip="' + q.id + '"].active');
        return chip ? chip.getAttribute('data-val') : '';
      }
      default: {
        var el = App.qs('#' + id);
        return el ? el.value.trim() : '';
      }
    }
  }

  function collectStep4() {
    var ok = true;
    var firstBad = null;
    visibleQuestions().forEach(function (q) {
      var v = readAnswer(q);
      var empty = v == null || v === '' || (Array.isArray(v) && !v.length);
      var w = App.qs('[data-qwrap="' + q.id + '"]');
      if (w) w.classList.remove('ev-q-miss');
      if (empty) {
        if (q.required) {
          ok = false;
          if (w) { w.classList.add('ev-q-miss'); if (!firstBad) firstBad = w; }
        }
        delete flow.answers[q.id];
      } else {
        flow.answers[q.id] = v;
      }
    });
    if (!ok) {
      App.toast('Please answer the required questions', 'error');
      if (firstBad) try { firstBad.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) { /* noop */ }
    }
    return ok;
  }

  function prevStep() {
    if (flow.step === 5) flow.step = flow.attending ? (visibleQuestions().length ? 4 : 3) : 2;
    else if (flow.step === 4) flow.step = 3;
    else if (flow.step === 3) flow.step = 2;
    else flow.step = 1;
    renderFlow();
  }

  /* ---------- submit + ics ---------- */
  function submitRsvp() {
    if (flow.busy) return;
    flow.busy = true;
    var btn = App.qs('[data-fl-submit]');
    if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner" style="width:16px;height:16px;border-width:2px"></span> Submitting…'; }
    var body = {
      name: flow.name.trim(),
      email: flow.email.trim(),
      attending: flow.attending === true,
      partySize: flow.attending ? flow.partySize : 0,
      answers: flow.answers,
      subEventIds: flow.attending ? flow.subEventIds : []
    };
    if (flow.token) body.token = flow.token;
    App.api('/api/events/' + encodeURIComponent(flow.ev.id) + '/rsvp', { method: 'POST', body: body })
      .then(function () {
        flow.busy = false;
        var host = App.qs('[data-flow]');
        var foot = App.qs('[data-flow-foot]');
        if (host) host.innerHTML = successHtml();
        if (foot) foot.innerHTML = '';
        if (host) bindFlow(host.closest('.modal-panel') || host);
      })
      .catch(function (err) {
        flow.busy = false;
        if (btn) { btn.disabled = false; btn.innerHTML = 'Submit RSVP'; }
        App.toast(err.message || 'Could not submit RSVP', 'error');
      });
  }

  function icsStamp(d) {
    function p(n) { return String(n).padStart(2, '0'); }
    return '' + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + 'T' + p(d.getHours()) + p(d.getMinutes()) + p(d.getSeconds());
  }
  function icsText(s) {
    return String(s || '').replace(/\\/g, '\\\\').replace(/([,;])/g, '\\$1').replace(/\n/g, '\\n');
  }

  function downloadIcs() {
    var ev = flow.ev || {};
    var start = new Date(ev.eventDate + 'T' + (ev.startTime || '17:00') + ':00');
    if (isNaN(start.getTime())) start = new Date(ev.eventDate + 'T12:00:00');
    var end = ev.endTime ? new Date(ev.eventDate + 'T' + ev.endTime + ':00') : new Date(start.getTime() + 4 * 3600000);
    if (isNaN(end.getTime()) || end <= start) end = new Date(start.getTime() + 4 * 3600000);
    var ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Online RSVP//EN',
      'BEGIN:VEVENT',
      'UID:' + (ev.id || 'event') + '-' + Date.now() + '@onlinersvp',
      'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''),
      'DTSTART:' + icsStamp(start),
      'DTEND:' + icsStamp(end),
      'SUMMARY:' + icsText(ev.name || 'Event'),
      'LOCATION:' + icsText(ev.venue || ''),
      'DESCRIPTION:' + icsText('You are invited: ' + (ev.name || '') + (ev.address ? ' — ' + ev.address : '')),
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
    var blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = (ev.slug || 'event') + '.ics';
    a.click();
    URL.revokeObjectURL(url);
    App.toast('Calendar file downloaded', 'success');
  }

  /* ---------- flow render + bind ---------- */
  function renderFlow() {
    var host = App.qs('[data-flow]');
    if (!host) return;
    var foot = App.qs('[data-flow-foot]');
    var html = '', fhtml = '';

    if (flow.step === 1) {
      html = step1Html();
      fhtml = '<button class="ev-btn" type="button" data-fl-continue>Continue ' + App.icon('arrow-right') + '</button>';
    } else if (flow.step === 2) {
      html = step2Html();
      fhtml = '<button class="ev-btn ev-btn-ghost2" type="button" data-fl-back>' + App.icon('arrow-left') + ' Back</button>';
    } else if (flow.step === 3) {
      html = step3Html();
      fhtml = '<button class="ev-btn ev-btn-ghost2" type="button" data-fl-back>' + App.icon('arrow-left') + ' Back</button>' +
        '<button class="ev-btn" type="button" data-fl-continue>Continue ' + App.icon('arrow-right') + '</button>';
    } else if (flow.step === 4) {
      html = step4Html();
      fhtml = '<button class="ev-btn ev-btn-ghost2" type="button" data-fl-back>' + App.icon('arrow-left') + ' Back</button>' +
        '<button class="ev-btn" type="button" data-fl-continue>Review ' + App.icon('arrow-right') + '</button>';
    } else {
      html = step5Html();
      fhtml = '<button class="ev-btn ev-btn-ghost2" type="button" data-fl-back>' + App.icon('arrow-left') + ' Back</button>' +
        '<button class="ev-btn" type="button" data-fl-submit>' + App.icon('send') + ' Submit RSVP</button>';
    }

    host.innerHTML = html;
    if (foot) foot.innerHTML = fhtml;
    bindFlow(host.closest('.modal-panel') || host);

    var f = host.querySelector('input, textarea, select') || host.querySelector('.ev-choice');
    if (f) try { f.focus({ preventScroll: true }); } catch (e) { /* noop */ }
  }

  function bindFlow(host) {
    App.qsa('[data-fl-continue]', host).forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (flow.step === 1) { if (!collectStep1()) return; flow.step = 2; }
        else if (flow.step === 3) { collectStep3(); flow.step = 4; }
        else if (flow.step === 4) { if (!collectStep4()) return; flow.step = 5; }
        renderFlow();
      });
    });
    App.qsa('[data-fl-back]', host).forEach(function (btn) {
      btn.addEventListener('click', prevStep);
    });
    App.qsa('[data-attend]', host).forEach(function (btn) {
      btn.addEventListener('click', function () {
        flow.attending = btn.getAttribute('data-attend') === 'yes';
        if (flow.attending) {
          flow.partySize = Math.min(Math.max(1, flow.partySize || 1), maxPartySize());
          flow.step = 3;
        } else {
          flow.partySize = 0;
          flow.subEventIds = [];
          flow.step = 5;
        }
        renderFlow();
      });
    });
    var minus = App.qs('[data-fl-minus]', host);
    var plus = App.qs('[data-fl-plus]', host);
    function setParty(n) {
      var max = maxPartySize();
      flow.partySize = Math.max(1, Math.min(max, n));
      var num = App.qs('[data-party-num]', host);
      if (num) num.textContent = flow.partySize;
      if (minus) minus.disabled = flow.partySize <= 1;
      if (plus) plus.disabled = flow.partySize >= max;
    }
    if (minus) { minus.addEventListener('click', function () { setParty(flow.partySize - 1); }); }
    if (plus) { plus.addEventListener('click', function () { setParty(flow.partySize + 1); }); }
    setParty(flow.partySize);

    App.qsa('[data-meal-chip]', host).forEach(function (chip) {
      chip.addEventListener('click', function () {
        var qid = chip.getAttribute('data-meal-chip');
        App.qsa('[data-meal-chip="' + qid + '"]', host).forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');
      });
    });

    App.qsa('[data-fl-edit]', host).forEach(function (btn) {
      btn.addEventListener('click', function () {
        flow.step = Number(btn.getAttribute('data-fl-edit')) || 1;
        renderFlow();
      });
    });
    var submit = App.qs('[data-fl-submit]', host);
    if (submit) submit.addEventListener('click', submitRsvp);
    var ics = App.qs('[data-ics]', host);
    if (ics) ics.addEventListener('click', downloadIcs);
    var change = App.qs('[data-fl-change]', host);
    if (change) change.addEventListener('click', function () { flow.step = 1; renderFlow(); });

    App.qsa('#fl-name, #fl-email', host).forEach(function (inp) {
      inp.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          var c = App.qs('[data-fl-continue]', host);
          if (c) c.click();
        }
      });
    });
  }

  /* ============================================================
     VIEW
     ============================================================ */
  function paintSite(root, ev) {
    applyTheme(root, ev);
    root.innerHTML = floatsHtml() + noticeHtml(ev) + renderSections(ev);
    document.title = ev.name + ' — Online RSVP';

    // RSVP openers
    App.qsa('[data-rsvp-open]', root).forEach(function (btn) {
      btn.addEventListener('click', openRsvpFlow);
    });
    // Hero CTA → smooth scroll to RSVP section (or open flow if none)
    App.qsa('[data-scroll-rsvp]', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = App.qs('[data-sec-type="rsvp"]', root);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        else openRsvpFlow();
      });
    });
    // Scroll-down chevron → next section
    App.qsa('[data-scroll-next]', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var hero = btn.closest('section');
        var next = hero && hero.nextElementSibling;
        if (next) next.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
    // Gallery lightbox
    App.qsa('[data-gal-idx]', root).forEach(function (item) {
      item.addEventListener('click', function () {
        lb.list = ev.gallery || [];
        openLightbox(Number(item.getAttribute('data-gal-idx')) || 0);
      });
    });
    // Registry thank-you chips (presentational — not an API)
    App.qsa('[data-reg-thanks]', root).forEach(function (chip) {
      chip.addEventListener('click', function () { App.toast('Thank you!', 'success'); });
    });
    // Exit preview
    App.qsa('[data-exit-preview]', root).forEach(function (btn) {
      btn.addEventListener('click', function () { App.navigate('#/app'); });
    });
    // Countdown (bindCountdown registers its own App.addCleanup interval)
    var cd = App.qs('[data-countdown]', root);
    if (cd) {
      App.bindCountdown(cd, ev.eventDate + 'T' + (ev.startTime || '17:00') + ':00');
    }
  }

  function paintError(root, err) {
    root.innerHTML = floatsHtml() +
      '<div class="ev-404"><div class="empty">' +
        '<div class="empty-ic">' + App.icon('heart') + '</div>' +
        '<h4>' + (err && err.status === 404 ? 'Event not found' : 'Something went wrong') + '</h4>' +
        '<p>' + (err && err.status === 404
          ? 'This event link doesn&#39;t exist, or the event may have been removed by its host.'
          : esc((err && err.message) || 'Could not load this event. Please try again.')) + '</p>' +
        '<a class="btn btn-accent" href="#/">Back to home</a>' +
      '</div></div>';
  }

  App.views.site = {
    render: function () {
      return '<div class="ev-root" data-ev-root>' + floatsHtml() +
        '<div class="ev-loading">' +
          '<div class="skeleton ev-sk-hero"></div>' +
          '<div class="ev-sk-body">' +
            '<div class="skeleton ev-sk-line" style="width:42%"></div>' +
            '<div class="skeleton ev-sk-line" style="width:68%"></div>' +
            '<div class="ev-sk-row">' +
              '<div class="skeleton ev-sk-box"></div><div class="skeleton ev-sk-box"></div>' +
              '<div class="skeleton ev-sk-box"></div><div class="skeleton ev-sk-box"></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    },

    mount: function (params) {
      var parsed = parseSlug(params && params[0]);
      site.token = parsed.token || null;
      site.ev = null;
      site.failed = false;
      site.errStatus = 0;

      var root = App.qs('[data-ev-root]');
      if (!root) return;

      // Reset title when leaving the site view
      App.addCleanup(function () {
        document.title = 'Online RSVP — Beautiful event websites & easy RSVPs';
      });

      App.api('/api/public/' + encodeURIComponent(parsed.slug))
        .then(function (res) {
          var ev = res && res.event;
          if (!ev) { var e404 = new Error('Event not found'); e404.status = 404; throw e404; }
          if (!root.isConnected) return; // navigated away mid-fetch
          site.ev = ev;
          App.state.publicEvent = ev;
          paintSite(root, ev);
        })
        .catch(function (err) {
          if (!root.isConnected) return;
          site.failed = true;
          site.errStatus = err && err.status ? err.status : 0;
          paintError(root, err);
        });
    }
  };
})();

/* ==========================================================================
   Ever RSVP — event WEBSITE builder (step 3)
   Left: Content (basics + every website section) / Design tabs.
   Right: live scrolling preview of the full event website.
   ========================================================================== */
(function () {
  'use strict';

  var FLOW_KEY = 'ever-rsvp-flow';
  var EVENT_KEY = 'ever-rsvp-event';

  /* ---------- Catalog / style meta ---------- */

  var ACCENTS = [
    { id: 'tpl',        label: 'Template',   hex: null },
    { id: 'teal',       label: 'Teal',       hex: '#1798b8' },
    { id: 'gold',       label: 'Gold',       hex: '#b9975b' },
    { id: 'sage',       label: 'Sage',       hex: '#7f9c7c' },
    { id: 'terracotta', label: 'Terracotta', hex: '#b3704e' },
    { id: 'navy',       label: 'Navy',       hex: '#22384a' }
  ];

  var SHAPES = [
    { id: 'pill',   label: 'Pill',   radius: '999px' },
    { id: 'soft',   label: 'Soft',   radius: '10px' },
    { id: 'square', label: 'Square', radius: '2px' }
  ];

  /* Every website section: fields, toggles and list editors */
  var SECTIONS = [
    { id: 'hero', label: 'Hero',
      fields: [
        { k: 'kicker',  label: 'Kicker', type: 'text', ph: 'Together with their families' },
        { k: 'tagline', label: 'Tagline under the names', type: 'text', ph: 'are getting married' }
      ] },
    { id: 'countdown', label: 'Countdown',
      fields: [ { k: 'label', label: 'Label', type: 'text', ph: 'Counting down to the big day' } ] },
    { id: 'welcome', label: 'Welcome note',
      fields: [
        { k: 'title', label: 'Title', type: 'text', ph: 'Welcome, dear guests' },
        { k: 'text',  label: 'Message', type: 'textarea', ph: 'We are so excited to celebrate with you…' }
      ] },
    { id: 'story', label: 'Our story',
      fields: [
        { k: 'title', label: 'Title', type: 'text', ph: 'Our story' },
        { k: 'text',  label: 'Text', type: 'textarea', ph: 'Ten years, two cities…' }
      ] },
    { id: 'details', label: 'When & where',
      fields: [
        { k: 'time',      label: 'Time', type: 'text', ph: '4:00 in the afternoon' },
        { k: 'address',   label: 'Address', type: 'text', ph: '420 Lavender Lane, Hillcrest' },
        { k: 'dressCode', label: 'Dress code', type: 'text', ph: 'Garden formal' }
      ] },
    { id: 'schedule', label: 'Schedule',
      fields: [ { k: 'title', label: 'Title', type: 'text', ph: 'The day' } ],
      list: { k: 'items', fields: [
        { k: 'time', label: 'Time', type: 'text', ph: '4:00 PM' },
        { k: 'title', label: 'Title', type: 'text', ph: 'Ceremony' },
        { k: 'desc', label: 'Description', type: 'text', ph: 'Garden lawn' }
      ], blank: { time: '', title: 'New item', desc: '' } } },
    { id: 'gallery', label: 'Gallery',
      fields: [
        { k: 'title', label: 'Title', type: 'text', ph: 'Moments' },
        { k: 'note',  label: 'Caption', type: 'textarea', ph: 'Tag us in your photos…' }
      ] },
    { id: 'rsvp', label: 'RSVP',
      fields: [
        { k: 'title',    label: 'Title', type: 'text', ph: 'Will you join us?' },
        { k: 'deadline', label: 'Reply-by date', type: 'date' },
        { k: 'note',     label: 'Note', type: 'text', ph: 'Kindly reply by 1 May 2026' }
      ],
      checks: [
        { k: 'qMenu', label: 'Ask for menu selection' },
        { k: 'qPlus', label: 'Collect plus-ones' },
        { k: 'qSong', label: 'Collect song requests' }
      ] },
    { id: 'travel', label: 'Travel & stay',
      fields: [
        { k: 'title', label: 'Title', type: 'text', ph: 'Travel & stay' },
        { k: 'text',  label: 'Text', type: 'textarea', ph: 'A block of rooms is held at…' }
      ] },
    { id: 'registry', label: 'Gifts & registry',
      fields: [
        { k: 'title', label: 'Title', type: 'text', ph: 'Gifts' },
        { k: 'text',  label: 'Text', type: 'textarea', ph: 'Your presence is the greatest gift…' }
      ] },
    { id: 'faq', label: 'F.A.Q.', fields: [],
      list: { k: 'items', fields: [
        { k: 'q', label: 'Question', type: 'text', ph: 'Can I bring a plus-one?' },
        { k: 'a', label: 'Answer', type: 'textarea', ph: 'Of course — indicate it on your reply.' }
      ], blank: { q: 'New question', a: '' } } },
    { id: 'contact', label: 'Contact',
      fields: [
        { k: 'email', label: 'E-mail', type: 'text', ph: 'hello@example.com' },
        { k: 'phone', label: 'Phone (optional)', type: 'text', ph: '+1 555 010 2030' }
      ] },
    { id: 'footer', label: 'Footer',
      fields: [ { k: 'hashtag', label: 'Hashtag', type: 'text', ph: '#AmeliaAndNoah' } ] }
  ];

  var ORDER = SECTIONS.map(function (s) { return s.id; });

  /* ---------- State ---------- */

  function futureISO(monthsAhead) {
    var d = new Date();
    d.setDate(14);
    d.setMonth(d.getMonth() + monthsAhead);
    var m = String(d.getMonth() + 1);
    if (m.length < 2) m = '0' + m;
    return d.getFullYear() + '-' + m + '-14';
  }

  function defaults() {
    return {
      v: 2,
      templateId: 'eucalyptus',
      fontPair: 'classic',
      accent: 'tpl',
      btnShape: 'soft',
      spacing: 'normal',
      nameA: 'Amelia', nameB: 'Noah',
      date: futureISO(9), venue: 'Rosewood Barn', city: 'Kent',
      order: ORDER.slice(),
      sections: {
        hero:      { on: true, kicker: 'Together with their families', tagline: 'are getting married' },
        countdown: { on: true, label: 'Counting down to the big day' },
        welcome:   { on: true, title: 'Welcome, dear guests',
                     text: 'We are so excited to celebrate the day with our favorite people. This little site has everything you need — the schedule, directions, where to stay and your reply card.' },
        story:     { on: true, title: 'Our story',
                     text: 'Ten years, two cities and one very spoilt cat — and now, the easy part: a party with all of you.' },
        details:   { on: true, time: '4:00 in the afternoon',
                     address: '420 Lavender Lane, Hillcrest', dressCode: 'Garden formal' },
        schedule:  { on: true, title: 'The day', items: [
                     { time: '4:00 PM', title: 'Ceremony', desc: 'Rosewood garden lawn' },
                     { time: '5:30 PM', title: 'Cocktail hour', desc: 'Terrace bar' },
                     { time: '6:30 PM', title: 'Dinner & dancing', desc: 'The grand barn' } ] },
        gallery:   { on: true, title: 'Moments', note: '' },
        rsvp:      { on: true, title: 'Will you join us?', deadline: futureISO(6),
                     note: 'Kindly reply in good time — every chair counts.', qMenu: true, qPlus: true, qSong: false },
        travel:    { on: false, title: 'Travel & stay',
                     text: 'A block of rooms is held at The Little Inn until April. Mention our wedding for the group rate — the shuttle leaves the lobby at 3:15.' },
        registry:  { on: false, title: 'Gifts',
                     text: 'Your presence is the greatest gift of all. Should you wish to spoil us anyway, a small registry is open with the usual suspects.' },
        faq:       { on: true, items: [
                     { q: 'Can I bring a plus-one?', a: 'Of course — simply note it on your reply and we will save a chair.' },
                     { q: 'Are children welcome?', a: 'Absolutely. We adore your little ones (and so does the cat).' },
                     { q: 'What if it rains?', a: 'The ceremony moves into the glasshouse — same time, same joy.' } ] },
        contact:   { on: true, email: 'hello@ameliaandnoah.com', phone: '+1 (555) 010-2030' },
        footer:    { on: true, hashtag: '#AmeliaAndNoah' }
      }
    };
  }

  var state = defaults();
  var ui = { open: {} };   /* remembered open/closed state of sidebar groups */
  var pvTimer = null;

  /* ---------- Helpers ---------- */

  function readJson(key) {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); }
    catch (e) { return null; }
  }
  function writeJson(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* ignore */ }
  }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function slugify(s) {
    return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'your-event';
  }
  function hexToRgba(hex, a) {
    var h = String(hex || '').replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 10);
    if (isNaN(n)) return 'rgba(0,0,0,' + a + ')';
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }
  var DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  function dateObj() {
    var d = new Date((state.date || '2026-06-14') + 'T12:00:00');
    return isNaN(d.getTime()) ? new Date('2026-06-14T12:00:00') : d;
  }
  function fmtDateLong() {
    var d = dateObj();
    return DAYS[d.getDay()] + ', ' + MONTHS[d.getMonth()] + ' ' + d.getDate() + ' · ' + d.getFullYear();
  }
  function fmtDateShort() {
    var d = dateObj();
    return MONTHS[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  }
  function fmtDeadline(iso) {
    if (!iso) return '';
    var d = new Date(iso + 'T12:00:00');
    if (isNaN(d.getTime())) return iso;
    return MONTHS[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  }
  function findTpl(id) {
    var list = window.EVER_TEMPLATES || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return list[0];
  }
  function accentHex() {
    for (var i = 0; i < ACCENTS.length; i++) {
      if (ACCENTS[i].id === state.accent) return ACCENTS[i].hex || findTpl(state.templateId).btn;
    }
    return findTpl(state.templateId).btn;
  }
  function secMeta(id) {
    for (var i = 0; i < SECTIONS.length; i++) if (SECTIONS[i].id === id) return SECTIONS[i];
    return null;
  }

  /* ---------- Load / save (with v1 migration) ---------- */

  function loadState() {
    var flow = readJson(FLOW_KEY) || {};
    var saved = readJson(EVENT_KEY);
    var d = defaults();
    if (flow.design) d.templateId = flow.design;

    if (saved && saved.v === 2) {
      for (var k in d) {
        if (!Object.prototype.hasOwnProperty.call(d, k)) continue;
        if (k === 'sections') continue;
        if (Object.prototype.hasOwnProperty.call(saved, k)) d[k] = saved[k];
      }
      if (saved.order && saved.order.length === ORDER.length) d.order = saved.order.slice();
      for (var sid in d.sections) {
        if (!Object.prototype.hasOwnProperty.call(d.sections, sid)) continue;
        if (saved.sections && saved.sections[sid]) {
          for (var fk in d.sections[sid]) {
            if (Object.prototype.hasOwnProperty.call(saved.sections[sid], fk)) {
              d.sections[sid][fk] = saved.sections[sid][fk];
            }
          }
        }
      }
    } else if (saved) {
      /* legacy v1 editor state — carry over what still makes sense */
      ['templateId','fontPair','accent','nameA','nameB','date','venue','city'].forEach(function (k) {
        if (Object.prototype.hasOwnProperty.call(saved, k) && saved[k]) d[k] = saved[k];
      });
      if (saved.story) d.sections.story.text = saved.story;
      if (typeof saved.showStory === 'boolean') d.sections.story.on = saved.showStory;
      if (typeof saved.showSchedule === 'boolean') d.sections.schedule.on = saved.showSchedule;
      ['qMenu','qPlus','qSong'].forEach(function (k) {
        if (typeof saved[k] === 'boolean') d.sections.rsvp[k] = saved[k];
      });
    }
    state = d;
  }

  var saveTimer = null;
  function autosave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () { writeJson(EVENT_KEY, state); }, 500);
  }
  function saveNow(silent) {
    clearTimeout(saveTimer);
    writeJson(EVENT_KEY, state);
    if (!silent && window.everToast) window.everToast('Saved — your website lives on this device.');
  }

  /* =====================================================================
     SIDEBAR — content panel
     ===================================================================== */

  var secGroups = document.getElementById('sec-groups');

  function fieldHtml(secId, f, val, listCtx) {
    var attrs = listCtx
      ? ' data-sec="' + secId + '" data-k="' + listCtx.k + '" data-i="' + listCtx.i + '" data-fk="' + f.k + '"'
      : ' data-sec="' + secId + '" data-k="' + f.k + '"';
    var id = 'f-' + secId + '-' + (listCtx ? listCtx.k + '-' + listCtx.i + '-' : '') + f.k;
    var common = ' id="' + id + '" ' + attrs + ' placeholder="' + esc(f.ph || '') + '"';
    var inner = f.type === 'textarea'
      ? '<textarea rows="2"' + common + '>' + esc(val) + '</textarea>'
      : '<input type="' + (f.type === 'date' ? 'date' : 'text') + '" value="' + esc(val) + '"' + common + ' />';
    return '<div class="ed-field' + (listCtx ? ' ed-field-li' : '') + '"><label for="' + id + '">' + f.label + '</label>' + inner + '</div>';
  }

  function listHtml(meta, sec) {
    var cfg = meta.list;
    var out = '<div class="ed-list" data-list="' + cfg.k + '">';
    (sec[cfg.k] || []).forEach(function (item, i) {
      var t = item.title || item.q || ('Item ' + (i + 1));
      out += '<div class="ed-li" data-i="' + i + '">' +
        '<div class="ed-li-head"><b>' + (i + 1) + '. ' + esc(t) + '</b>' +
        '<button type="button" class="li-x" data-act="li-del" data-sec="' + meta.id + '" data-list="' + cfg.k + '" data-i="' + i + '" aria-label="Remove item ' + (i + 1) + '">&times;</button></div>';
      cfg.fields.forEach(function (f) {
        out += fieldHtml(meta.id, f, item[f.k] || '', { k: cfg.k, i: i });
      });
      out += '</div>';
    });
    out += '<button type="button" class="li-add" data-act="li-add" data-sec="' + meta.id + '" data-list="' + cfg.k + '">+ Add item</button>';
    out += '</div>';
    return out;
  }

  function checksHtml(meta, sec) {
    var out = '';
    (meta.checks || []).forEach(function (c) {
      var id = 'ck-' + meta.id + '-' + c.k;
      out += '<label class="ed-check"><input type="checkbox" id="' + id + '" data-sec="' + meta.id + '" data-k="' + c.k + '"' + (sec[c.k] ? ' checked' : '') + ' /><span>' + c.label + '</span></label>';
    });
    return out;
  }

  function groupHtml(meta, sec) {
    var open = ui.open[meta.id] !== false && ui.open[meta.id] !== undefined ? ' open' : (ui.open[meta.id] === undefined && (meta.id === 'hero' || meta.id === 'rsvp') ? ' open' : '');
    var off = sec.on ? '' : ' off';
    var body = '';
    (meta.fields || []).forEach(function (f) {
      body += fieldHtml(meta.id, f, sec[f.k] || '', null);
    });
    if (meta.list) body += listHtml(meta, sec);
    if (meta.checks) {
      body += '<div class="ed-checks">' + checksHtml(meta, sec) + '</div>';
      var hint = meta.id === 'rsvp' ? '<p class="ed-hint">Guests answer these right after accepting.</p>' : '';
      body += hint;
    }
    if (!meta.fields.length && !meta.list && !meta.checks) body = '<p class="ed-hint">Nothing to configure here.</p>';

    return '' +
      '<details class="ed-group sec-group' + off + '"' + open + ' data-sec="' + meta.id + '">' +
        '<summary>' +
          '<span class="sec-sum">' + meta.label + '</span>' +
          '<span class="sec-tools">' +
            '<button type="button" class="sbtn" data-act="up" data-sec="' + meta.id + '" aria-label="Move ' + meta.label + ' up" title="Move up">&#8593;</button>' +
            '<button type="button" class="sbtn" data-act="down" data-sec="' + meta.id + '" aria-label="Move ' + meta.label + ' down" title="Move down">&#8595;</button>' +
            '<button type="button" class="sbtn eye' + (sec.on ? ' on' : '') + '" data-act="eye" data-sec="' + meta.id + '" aria-pressed="' + sec.on + '" aria-label="' + (sec.on ? 'Hide ' : 'Show ') + meta.label + ' section" title="' + (sec.on ? 'Hide section' : 'Show section') + '">' +
              '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.6"/></svg>' +
            '</button>' +
          '</span>' +
        '</summary>' +
        '<div class="ed-body">' + body + '</div>' +
      '</details>';
  }

  function buildContentPanel() {
    if (!secGroups) return;
    secGroups.innerHTML = state.order.map(function (id) {
      return groupHtml(secMeta(id), state.sections[id]);
    }).join('');

    /* remember open/close (toggle does not bubble) */
    Array.prototype.forEach.call(secGroups.querySelectorAll('details.sec-group'), function (d) {
      var id = d.getAttribute('data-sec');
      d.addEventListener('toggle', function () { ui.open[id] = d.open; });
    });
  }

  /* ---------- Field events (delegated) ---------- */

  function onFieldInput(e) {
    var el = e.target;
    var secId = el.getAttribute('data-sec');
    if (el.getAttribute('data-style')) {           /* design panel select */
      state[el.getAttribute('data-style')] = el.value;
      autosave(); render();
      return;
    }
    if (!secId) return;
    var k = el.getAttribute('data-k');
    var val = el.type === 'checkbox' ? el.checked : el.value;
    var i = el.getAttribute('data-i');

    if (secId === '_basic') {
      state[k] = val;
    } else if (i !== null && i !== undefined) {
      state.sections[secId][k][+i][el.getAttribute('data-fk')] = val;
      var li = el.closest('.ed-li');
      if (li) {
        var b = li.querySelector('.ed-li-head b');
        var item = state.sections[secId][k][+i];
        if (b) b.textContent = (+i + 1) + '. ' + (item.title || item.q || 'Item ' + (+i + 1));
      }
    } else {
      state.sections[secId][k] = val;
    }
    autosave(); render();
  }

  function onSidebarClick(e) {
    var btn = e.target.closest('[data-act]');
    if (!btn) return;
    e.preventDefault();          /* keep summary from toggling when using the tools */
    e.stopPropagation();
    var act = btn.getAttribute('data-act');
    var secId = btn.getAttribute('data-sec');

    if (act === 'eye') {
      var s = state.sections[secId];
      s.on = !s.on;
      btn.classList.toggle('on', s.on);
      btn.setAttribute('aria-pressed', String(s.on));
      btn.setAttribute('aria-label', (s.on ? 'Hide ' : 'Show ') + secMeta(secId).label + ' section');
      var grp = secGroups.querySelector('details[data-sec="' + secId + '"]');
      if (grp) grp.classList.toggle('off', !s.on);
      autosave(); render();
      return;
    }

    if (act === 'up' || act === 'down') {
      var idx = state.order.indexOf(secId);
      var to = act === 'up' ? idx - 1 : idx + 1;
      if (to < 0 || to >= state.order.length) return;
      var tmp = state.order[idx];
      state.order[idx] = state.order[to];
      state.order[to] = tmp;
      buildContentPanel();
      autosave(); render();
      return;
    }

    if (act === 'li-add') {
      var cfg = secMeta(secId).list;
      state.sections[secId][cfg.k].push(JSON.parse(JSON.stringify(cfg.blank)));
      buildContentPanel();
      autosave(); render();
      return;
    }

    if (act === 'li-del') {
      var listK = btn.getAttribute('data-list');
      var di = +btn.getAttribute('data-i');
      state.sections[secId][listK].splice(di, 1);
      buildContentPanel();
      autosave(); render();
    }
  }

  /* =====================================================================
     SIDEBAR — design panel
     ===================================================================== */

  function buildTemplateChips() {
    var wrap = document.getElementById('tpl-chips');
    if (!wrap) return;
    wrap.innerHTML = '';
    (window.EVER_TEMPLATES || []).forEach(function (tpl) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'tpl-chip' + (tpl.id === state.templateId ? ' on' : '');
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', String(tpl.id === state.templateId));
      b.title = tpl.name;
      b.innerHTML = '<i style="background:' + tpl.bg + '"></i><span>' + tpl.name + '</span>';
      b.addEventListener('click', function () {
        state.templateId = tpl.id;
        state.accent = 'tpl';
        saveNow(true);
        buildTemplateChips(); buildColorDots(); render();
      });
      wrap.appendChild(b);
    });
  }

  function buildFontCards() {
    var wrap = document.getElementById('font-cards');
    if (!wrap) return;
    wrap.innerHTML = '';
    var pairs = window.EVER_FONT_PAIRS || {};
    Object.keys(pairs).forEach(function (id) {
      var p = pairs[id];
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'font-card' + (id === state.fontPair ? ' on' : '');
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', String(id === state.fontPair));
      b.innerHTML = '<b class="' + p.sampleClass + '">' + p.sample + '</b><span>' + p.label + '</span>';
      b.addEventListener('click', function () {
        state.fontPair = id;
        saveNow(true);
        buildFontCards(); render();
      });
      wrap.appendChild(b);
    });
  }

  function buildColorDots() {
    var wrap = document.getElementById('color-dots');
    if (!wrap) return;
    wrap.innerHTML = '';
    ACCENTS.forEach(function (a) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'c-dot-btn' + (a.id === state.accent ? ' on' : '');
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', String(a.id === state.accent));
      b.title = a.label;
      b.setAttribute('aria-label', a.label + ' accent');
      b.innerHTML = '<i style="background:' + (a.hex || findTpl(state.templateId).btn) + '"></i>';
      b.addEventListener('click', function () {
        state.accent = a.id;
        saveNow(true);
        buildColorDots(); render();
      });
      wrap.appendChild(b);
    });
  }

  function buildShapeRow() {
    var wrap = document.getElementById('shape-row');
    if (!wrap) return;
    wrap.innerHTML = '';
    SHAPES.forEach(function (sh) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'shape-btn' + (sh.id === state.btnShape ? ' on' : '');
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', String(sh.id === state.btnShape));
      b.innerHTML = '<i style="border-radius:' + sh.radius + '"></i><span>' + sh.label + '</span>';
      b.addEventListener('click', function () {
        state.btnShape = sh.id;
        saveNow(true);
        buildShapeRow(); render();
      });
      wrap.appendChild(b);
    });
  }

  /* =====================================================================
     CANVAS — the full event website preview
     ===================================================================== */

  function pvNavHtml() {
    var links = [];
    if (state.sections.story.on) links.push(['pv-sec-story', state.sections.story.title || 'Our story']);
    if (state.sections.schedule.on) links.push(['pv-sec-schedule', state.sections.schedule.title || 'The day']);
    if (state.sections.rsvp.on) links.push(['pv-sec-rsvp', 'RSVP']);
    var r = links.map(function (l) {
      return '<button type="button" class="pv-nav-link" data-goto="' + l[0] + '">' + esc(l[1]) + '</button>';
    }).join('');
    return '' +
      '<div class="pv-nav">' +
        '<span class="pv-brand">' + esc(state.nameA) + ' <i>&middot;</i> ' + esc(state.nameB) + '</span>' +
        '<span class="pv-nav-links">' + r + '</span>' +
      '</div>';
  }

  function pvHeroHtml() {
    var s = state.sections.hero;
    return '' +
      '<section class="pv-hero" id="pv-sec-hero">' +
        '<p class="pv-kicker">' + esc(s.kicker) + '</p>' +
        '<h1 class="pv-names">' + esc(state.nameA) + ' <span class="pv-amp">&amp;</span> ' + esc(state.nameB) + '</h1>' +
        '<p class="pv-tagline">' + esc(s.tagline) + '</p>' +
        '<span class="pv-rule"></span>' +
        '<p class="pv-date">' + esc(fmtDateLong()) + '</p>' +
        '<p class="pv-loc">' + esc(state.venue) + ' &middot; ' + esc(state.city) + '</p>' +
        '<span class="pv-cue" aria-hidden="true">&#8964;</span>' +
      '</section>';
  }

  function pvCountdownHtml() {
    var s = state.sections.countdown;
    return '' +
      '<section class="pv-count" id="pv-sec-countdown">' +
        '<p class="pv-count-label">' + esc(s.label) + '</p>' +
        '<div class="pv-count-grid" data-countdown>' +
          '<span class="pv-cb"><b data-cd="d">0</b><i>Days</i></span>' +
          '<span class="pv-cb"><b data-cd="h">0</b><i>Hours</i></span>' +
          '<span class="pv-cb"><b data-cd="m">0</b><i>Minutes</i></span>' +
          '<span class="pv-cb"><b data-cd="s">0</b><i>Seconds</i></span>' +
        '</div>' +
      '</section>';
  }

  function pvSimpleHtml(id, title, text, alt) {
    return '' +
      '<section class="pv-sec' + (alt ? ' pv-alt' : '') + '" id="pv-sec-' + id + '">' +
        '<h2 class="pv-title">' + esc(title) + '</h2>' +
        '<p class="pv-text">' + esc(text) + '</p>' +
      '</section>';
  }

  function pvDetailsHtml() {
    var s = state.sections.details;
    var cards = '' +
      '<div class="pv-card"><b>When</b><span>' + esc(fmtDateShort()) + '</span></div>' +
      '<div class="pv-card"><b>Ceremony</b><span>' + esc(s.time || '4:00 PM') + '</span></div>' +
      '<div class="pv-card"><b>Where</b><span>' + esc(state.venue) + '<i>' + esc(s.address) + '</i><i>' + esc(state.city) + '</i></span></div>' +
      (s.dressCode ? '<div class="pv-card"><b>Dress code</b><span>' + esc(s.dressCode) + '</span></div>' : '');
    return '' +
      '<section class="pv-sec" id="pv-sec-details">' +
        '<h2 class="pv-title">When &amp; where</h2>' +
        '<div class="pv-cards">' + cards + '</div>' +
      '</section>';
  }

  function pvScheduleHtml() {
    var s = state.sections.schedule;
    var rows = (s.items || []).map(function (it) {
      return '<div class="pv-row">' +
        '<b class="pv-row-time">' + esc(it.time) + '</b>' +
        '<span class="pv-row-dot"><i></i></span>' +
        '<span class="pv-row-body"><b>' + esc(it.title) + '</b><i>' + esc(it.desc) + '</i></span>' +
      '</div>';
    }).join('');
    return '' +
      '<section class="pv-sec pv-alt" id="pv-sec-schedule">' +
        '<h2 class="pv-title">' + esc(s.title) + '</h2>' +
        '<div class="pv-timeline">' + rows + '</div>' +
      '</section>';
  }

  function pvGalleryHtml() {
    var s = state.sections.gallery;
    var accent = accentHex();
    var text = findTpl(state.templateId).text;
    var tiles = '';
    var mixes = [
      [accent, .28, text, .10], [text, .16, accent, .12], [text, .08, accent, .05],
      [accent, .14, text, .06], [text, .12, accent, .20], [accent, .22, text, .04]
    ];
    for (var i = 0; i < 6; i++) {
      var m = mixes[i];
      tiles += '<span class="pv-tile" style="background:linear-gradient(150deg,' +
        hexToRgba(m[0], m[1]) + ',' + hexToRgba(m[2], m[3]) + ')"></span>';
    }
    var note = s.note || ('Tag ' + (state.sections.footer.hashtag || '') + ' — we would love to see the day through your eyes.');
    return '' +
      '<section class="pv-sec" id="pv-sec-gallery">' +
        '<h2 class="pv-title">' + esc(s.title) + '</h2>' +
        '<div class="pv-gallery">' + tiles + '</div>' +
        '<p class="pv-note">' + esc(note) + '</p>' +
      '</section>';
  }

  function pvRsvpHtml() {
    var s = state.sections.rsvp;
    var qs = '';
    if (s.qMenu) qs += '<span class="pv-q">Menu selection</span>';
    if (s.qPlus) qs += '<span class="pv-q">Plus-ones</span>';
    if (s.qSong) qs += '<span class="pv-q">Song requests</span>';
    return '' +
      '<section class="pv-sec" id="pv-sec-rsvp">' +
        '<div class="pv-rsvp-card">' +
          '<h2 class="pv-title">' + esc(s.title) + '</h2>' +
          (s.note ? '<p class="pv-note">' + esc(s.note) + (s.deadline ? ' &middot; reply by ' + esc(fmtDeadline(s.deadline)) : '') + '</p>' : '') +
          '<div class="pv-rsvp-form">' +
            '<div class="pv-rsvp-btns">' +
              '<button type="button" class="pv-btn pv-btn-primary" data-rsvp="yes">Joyfully accept</button>' +
              '<button type="button" class="pv-btn pv-btn-ghost" data-rsvp="no">Regretfully decline</button>' +
            '</div>' +
            (qs ? '<div class="pv-qs">' + qs + '</div>' : '') +
          '</div>' +
        '</div>' +
      '</section>';
  }

  function pvFaqHtml() {
    var s = state.sections.faq;
    var items = (s.items || []).map(function (it, i) {
      return '<details class="pv-faq-i"' + (i === 0 ? ' open' : '') + '>' +
        '<summary>' + esc(it.q) + '</summary>' +
        '<p>' + esc(it.a) + '</p>' +
      '</details>';
    }).join('');
    return '' +
      '<section class="pv-sec pv-alt" id="pv-sec-faq">' +
        '<h2 class="pv-title">Good to know</h2>' +
        '<div class="pv-faq">' + items + '</div>' +
      '</section>';
  }

  function pvContactHtml() {
    var s = state.sections.contact;
    var chips = '';
    if (s.email) chips += '<a class="pv-chip" href="mailto:' + esc(s.email) + '">' + esc(s.email) + '</a>';
    if (s.phone) chips += '<span class="pv-chip">' + esc(s.phone) + '</span>';
    return '' +
      '<section class="pv-sec" id="pv-sec-contact">' +
        '<h2 class="pv-title">Questions?</h2>' +
        '<p class="pv-note">We are one message away.</p>' +
        '<div class="pv-chips">' + chips + '</div>' +
      '</section>';
  }

  function pvTravelHtml(id, title, text) {
    return '' +
      '<section class="pv-sec pv-alt" id="pv-sec-' + id + '">' +
        '<h2 class="pv-title">' + esc(title) + '</h2>' +
        '<p class="pv-text">' + esc(text) + '</p>' +
      '</section>';
  }

  function pvFooterHtml() {
    var s = state.sections.footer;
    return '' +
      '<footer class="pv-footer" id="pv-sec-footer">' +
        '<b class="pv-foot-names">' + esc(state.nameA) + ' &amp; ' + esc(state.nameB) + '</b>' +
        (s.hashtag ? '<span class="pv-foot-tag">' + esc(s.hashtag) + '</span>' : '') +
        '<span class="pv-foot-made">Made with <i aria-hidden="true">&#10084;</i> Ever RSVP</span>' +
      '</footer>';
  }

  function render() {
    var canvas = document.getElementById('canvas');
    if (!canvas) return;

    var tpl = findTpl(state.templateId);
    var accent = accentHex();
    var wrap = document.querySelector('.ed-canvas-wrap');
    var scrollPos = wrap ? wrap.scrollTop : 0;
    if (pvTimer) { clearInterval(pvTimer); pvTimer = null; }

    var root = document.createElement('div');
    root.className = 'pv fm-' + state.fontPair + ' bs-' + state.btnShape + ' sp-' + state.spacing + (tpl.dots ? ' pv-dots' : '');
    root.style.background = tpl.bg;
    root.style.color = tpl.text;
    root.style.setProperty('--pv-accent', accent);
    root.style.setProperty('--pv-btn-text', tpl.btnText);
    if (tpl.dots) {
      root.style.backgroundImage = 'radial-gradient(' + hexToRgba(tpl.text, 0.09) + ' 1px, transparent 1.4px)';
      root.style.backgroundSize = '16px 16px';
    }

    var html = pvNavHtml() + pvHeroHtml();
    var alt = false;
    state.order.forEach(function (id) {
      var s = state.sections[id];
      if (!s.on || id === 'hero') return;
      switch (id) {
        case 'countdown': html += pvCountdownHtml(); break;
        case 'welcome':   html += pvSimpleHtml('welcome', s.title, s.text, (alt = !alt)); break;
        case 'story':     html += pvSimpleHtml('story', s.title, s.text, (alt = !alt)); break;
        case 'details':   html += pvDetailsHtml(); break;
        case 'schedule':  html += pvScheduleHtml(); break;
        case 'gallery':   html += pvGalleryHtml(); break;
        case 'rsvp':      html += pvRsvpHtml(); break;
        case 'travel':    html += pvTravelHtml('travel', s.title, s.text, (alt = !alt)); break;
        case 'registry':  html += pvTravelHtml('registry', s.title, s.text, (alt = !alt)); break;
        case 'faq':       html += pvFaqHtml(); break;
        case 'contact':   html += pvContactHtml(); break;
        case 'footer':    html += pvFooterHtml(); break;
      }
    });
    if (!/pv-footer/.test(html)) html += pvFooterHtml();

    root.innerHTML = html;
    canvas.innerHTML = '';
    canvas.appendChild(root);

    /* countdown ticker */
    var box = root.querySelector('[data-countdown]');
    if (box) {
      var set = function () {
        var diff = dateObj().getTime() - Date.now();
        var past = diff <= 0;
        if (past) diff = 0;
        var d = Math.floor(diff / 864e5);
        var h = Math.floor(diff % 864e5 / 36e5);
        var m = Math.floor(diff % 36e5 / 6e4);
        var sec = Math.floor(diff % 6e4 / 1e3);
        var q = function (sel, v) {
          var el2 = box.querySelector('[data-cd="' + sel + '"]');
          if (el2) el2.textContent = String(v);
        };
        q('d', d); q('h', h); q('m', m); q('s', sec);
        var lbl = root.querySelector('.pv-count-label');
        if (lbl && past && state.sections.countdown.on) lbl.textContent = 'Just married!';
      };
      set();
      pvTimer = setInterval(set, 1000);
    }

    if (wrap) wrap.scrollTop = scrollPos;
  }

  /* ---------- Canvas interactions (delegated; canvas node is persistent) ---------- */

  function bindCanvas() {
    var canvas = document.getElementById('canvas');
    if (!canvas) return;

    canvas.addEventListener('click', function (e) {

      /* nav scroll */
      var go = e.target.closest('[data-goto]');
      if (go) {
        var target = document.getElementById(go.getAttribute('data-goto'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      /* demo RSVP reply */
      var rsvp = e.target.closest('[data-rsvp]');
      if (rsvp) {
        var form = rsvp.closest('.pv-rsvp-form');
        if (form) {
          var yes = rsvp.getAttribute('data-rsvp') === 'yes';
          form.innerHTML = '<p class="pv-thanks">' +
            (yes ? 'Thank you — we cannot wait to celebrate with you!' : 'Thank you — you will be missed!') +
            ' <i>(Demo preview)</i></p>';
        }
      }
    });
  }

  /* =====================================================================
     Tabs / device / save / publish
     ===================================================================== */

  function bindTabs() {
    var t1 = document.getElementById('tab-content');
    var t2 = document.getElementById('tab-design');
    var p1 = document.getElementById('panel-content');
    var p2 = document.getElementById('panel-design');
    if (!t1 || !t2) return;
    function pick(which) {
      var c = which === 'content';
      t1.classList.toggle('on', c);  t2.classList.toggle('on', !c);
      t1.setAttribute('aria-selected', String(c)); t2.setAttribute('aria-selected', String(!c));
      if (p1) p1.hidden = !c;
      if (p2) p2.hidden = c;
    }
    t1.addEventListener('click', function () { pick('content'); });
    t2.addEventListener('click', function () { pick('design'); });
  }

  function bindDevice() {
    var btns = document.querySelectorAll('.ed-dev-btn');
    Array.prototype.forEach.call(btns, function (btn) {
      btn.addEventListener('click', function () {
        Array.prototype.forEach.call(btns, function (b) {
          b.classList.remove('on'); b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('on');
        btn.setAttribute('aria-pressed', 'true');
        var frame = document.getElementById('canvas-frame');
        if (frame) frame.classList.toggle('mobile', btn.getAttribute('data-dev') === 'mobile');
      });
    });
  }

  /* ---------- Publish ---------- */

  function initPublish() {
    var pubOverlay = document.getElementById('pub-overlay');
    var publishBtn = document.getElementById('publish-btn');
    if (!publishBtn || !pubOverlay) return;

    publishBtn.addEventListener('click', function () {
      publishBtn.classList.add('loading');
      publishBtn.disabled = true;

      setTimeout(function () {
        publishBtn.classList.remove('loading');
        publishBtn.disabled = false;

        var flow = readJson(FLOW_KEY) || {};
        flow.published = true;
        flow.slug = slugify(state.nameA) + '-' + slugify(state.nameB);
        writeJson(FLOW_KEY, flow);

        var badge = document.getElementById('ed-badge');
        if (badge) { badge.textContent = 'Published'; badge.classList.add('live'); }

        var urlEl = document.getElementById('pub-url');
        if (urlEl) urlEl.textContent = flow.slug + '.ever-rsvp.com';
        pubOverlay.hidden = false;
        document.body.style.overflow = 'hidden';
      }, 1200);
    });

    function close() {
      pubOverlay.hidden = true;
      document.body.style.overflow = '';
    }
    var closeBtn = document.getElementById('pub-close');
    if (closeBtn) closeBtn.addEventListener('click', close);
    pubOverlay.addEventListener('click', function (e) { if (e.target === pubOverlay) close(); });

    var copyBtn = document.getElementById('copy-url');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var text = document.getElementById('pub-url').textContent;
        function done() {
          copyBtn.textContent = 'Copied!';
          setTimeout(function () { copyBtn.textContent = 'Copy'; }, 1600);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, done);
        } else { done(); }
      });
    }
  }

  function initBadge() {
    var flow = readJson(FLOW_KEY) || {};
    var badge = document.getElementById('ed-badge');
    if (!badge) return;
    if (flow.published) {
      badge.textContent = 'Published';
      badge.classList.add('live');
    } else if (flow.paid) {
      badge.textContent = 'Order ' + (flow.order || 'paid');
    }
  }

  /* ---------- Boot ---------- */

  loadState();

  /* reflect saved state in the static Basics inputs */
  (function fillBasics() {
    var map = { 'ed-nameA': 'nameA', 'ed-nameB': 'nameB', 'ed-date': 'date', 'ed-venue': 'venue', 'ed-city': 'city' };
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.value = state[map[id]] || '';
    });
  })();

  var saveBtn = document.getElementById('save-btn');
  if (saveBtn) saveBtn.addEventListener('click', function () { saveNow(false); });

  var sidebar = document.querySelector('.ed-sidebar');
  if (sidebar) {
    sidebar.addEventListener('input', onFieldInput);
    sidebar.addEventListener('change', onFieldInput);
    sidebar.addEventListener('click', onSidebarClick);
  }

  var spacingSel = document.getElementById('ed-spacing');
  if (spacingSel) spacingSel.value = state.spacing;

  buildContentPanel();
  buildTemplateChips();
  buildFontCards();
  buildColorDots();
  buildShapeRow();
  bindTabs();
  bindDevice();
  bindCanvas();
  initPublish();
  initBadge();
  render();
})();

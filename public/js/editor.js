/* ==========================================================================
   Ever RSVP — event website builder (step 3)
   Left: every field of the reference format (hero, countdown & details,
   story, gallery, events, venue, RSVP, contact) + full design controls.
   Right: live preview rendered by templates.js.
   ========================================================================== */
(function () {
  'use strict';

  var FLOW_KEY = 'ever-rsvp-flow';
  var EVENT_KEY = 'ever-rsvp-event';

  /* ------------------------------------------------------------------ *
   *  Section + field catalogue                                          *
   * ------------------------------------------------------------------ */
  var SECTIONS = [
    { id: 'hero', label: 'Hero',
      fields: [
        { k: 'kicker1', label: 'Kicker line 1', type: 'text', ph: "You're invited to" },
        { k: 'kicker2', label: 'Kicker line 2', type: 'text', ph: 'the wedding of' },
        { k: 'photo',   label: 'Hero photo', type: 'photo' },
        { k: 'btnText', label: 'Button text', type: 'text', ph: 'Enter invitation' }
      ] },
    { id: 'countdown', label: 'Countdown & details',
      fields: [
        { k: 'label', label: 'Countdown label', type: 'text', ph: 'Countdown to our big day' },
        { k: 'quote', label: 'Quote under the timer', type: 'text', ph: 'Two hearts, one love…' }
      ] },
    { id: 'story', label: 'Our story',
      fields: [ { k: 'title', label: 'Section title', type: 'text', ph: 'Our story' } ],
      list: { k: 'items', label: 'Milestone', blank: function () {
        return { photo: 'couple', title: 'New milestone', date: '', text: '' }; },
        fields: [
          { k: 'photo', label: 'Photo', type: 'photo' },
          { k: 'title', label: 'Title', type: 'text', ph: 'First met' },
          { k: 'date',  label: 'Date line', type: 'text', ph: '14 March 2021' },
          { k: 'text',  label: 'Description', type: 'text', ph: 'A chance meeting…' }
        ] } },
    { id: 'gallery', label: 'Gallery',
      fields: [
        { k: 'title', label: 'Section title', type: 'text', ph: 'Gallery' },
        { k: 'btn',   label: 'Button text (empty = hide)', type: 'text', ph: 'View more photos' }
      ],
      list: { k: 'items', label: 'Photo', blank: function () { return { src: 'decor' }; },
        fields: [ { k: 'src', label: 'Photo', type: 'photo' } ] } },
    { id: 'events', label: 'Events',
      fields: [ { k: 'title', label: 'Section title', type: 'text', ph: 'Events' } ],
      list: { k: 'items', label: 'Event', blank: function () {
        return { icon: 'rings', name: 'New event', time: '', venue: '' }; },
        fields: [
          { k: 'icon',  label: 'Icon', type: 'icon' },
          { k: 'name',  label: 'Event name', type: 'text', ph: 'Wedding ceremony' },
          { k: 'time',  label: 'Time', type: 'text', ph: '05:00 PM - 06:30 PM' },
          { k: 'venue', label: 'Venue / hall', type: 'text', ph: 'The Grand Palms · Main lawn' }
        ] } },
    { id: 'venue', label: 'Venue & map',
      fields: [
        { k: 'name',    label: 'Venue name', type: 'text', ph: 'The Grand Palms' },
        { k: 'address', label: 'Full address', type: 'text', ph: 'No. 123, Palm Avenue…' },
        { k: 'dirUrl',  label: 'Directions link (optional)', type: 'text', ph: 'https://maps.google.com/…' },
        { k: 'mapUrl',  label: 'Map embed URL (optional)', type: 'text', ph: 'https://www.openstreetmap.org/…' }
      ],
      list: { k: 'items', label: 'Amenity', blank: function () { return { icon: 'heart', label: 'New amenity' }; },
        fields: [
          { k: 'icon',  label: 'Icon', type: 'icon' },
          { k: 'label', label: 'Label', type: 'text', ph: 'Ample parking' }
        ] } },
    { id: 'rsvp', label: 'RSVP form',
      fields: [
        { k: 'title',       label: 'Heading', type: 'text', ph: 'Kindly RSVP' },
        { k: 'note',        label: 'Note before date', type: 'text', ph: 'Please confirm your presence by' },
        { k: 'deadline',    label: 'Reply deadline', type: 'date' },
        { k: 'showPhone',   label: 'Ask for phone number', type: 'check' },
        { k: 'guestsMax',   label: 'Max guests per reply', type: 'number', min: 1, max: 12 },
        { k: 'showMsg',     label: 'Include message box', type: 'check' },
        { k: 'submit',      label: 'Submit button text', type: 'text', ph: 'Submit RSVP' },
        { k: 'success',     label: 'Success message', type: 'text', ph: 'Thank you!' }
      ],
      list: { k: 'meals', label: 'Meal option', blank: function () { return ''; },
        fields: [ { k: '', label: 'Option', type: 'text', ph: 'Vegetarian' } ] } },
    { id: 'contact', label: 'Contact & footer',
      fields: [
        { k: 'phone',     label: 'Phone', type: 'text', ph: '+91 98765 43210' },
        { k: 'email',     label: 'E-mail', type: 'text', ph: 'hello@example.com' },
        { k: 'whatsapp',  label: 'WhatsApp link text', type: 'text', ph: 'WhatsApp us' },
        { k: 'thanks',    label: 'Thank-you line', type: 'text', ph: 'Thank you for being a part…' },
        { k: 'copyright', label: 'Copyright extra (optional)', type: 'text', ph: '' },
        { k: 'credit',    label: 'Credit line', type: 'text', ph: 'Made with ♥ for our big day' },
        { k: 'social.wa',    label: 'WhatsApp icon', type: 'check' },
        { k: 'social.fb',    label: 'Facebook icon', type: 'check' },
        { k: 'social.ig',    label: 'Instagram icon', type: 'check' },
        { k: 'social.share', label: 'Share icon', type: 'check' }
      ] }
  ];

  var TEMPLATE_MAP = { /* old v1/v2 ids → new themes */
    eucalyptus: 'sage', blush: 'blush', monogram: 'champagne', 'golden-hour': 'champagne',
    midnight: 'navy', 'garden-party': 'sage', ocean: 'navy', terracotta: 'terracotta', ivory: 'champagne'
  };
  var FONT_MAP = { classic: 'corm', romantic: 'paris', modern: 'jost' };

  /* ------------------------------------------------------------------ *
   *  State                                                              *
   * ------------------------------------------------------------------ */
  function defaults() { return window.EVER_siteDefaults(); }

  var state = defaults();
  var ui = { open: {} };
  var pvTimer = null;

  function readJson(key) {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); }
    catch (e) { return null; }
  }
  function writeJson(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* ignore */ }
  }
  function esc(s) { return window.EVER_esc(s); }
  function slugify(s) {
    return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'your-event';
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

  function loadState() {
    var d = defaults();
    var flow = readJson(FLOW_KEY) || {};
    if (flow.design) d.templateId = flow.design;
    var saved = readJson(EVENT_KEY);
    if (saved && saved.v === 3) {
      deepMerge(d, saved);
      if (saved.order && saved.order.length === d.order.length) d.order = saved.order.slice();
    } else if (saved) {
      /* v1/v2 migration — carry what still applies */
      var id = TEMPLATE_MAP[saved.templateId] || saved.templateId;
      if (id) d.templateId = id;
      if (saved.fontPair && FONT_MAP[saved.fontPair]) d.nameFont = FONT_MAP[saved.fontPair];
      ['accent', 'btnShape', 'spacing'].forEach(function (k) {
        if (saved[k]) d[k] = saved[k];
      });
      ['nameA', 'nameB', 'date', 'venue', 'city'].forEach(function (k) {
        if (saved[k]) d.basics[k] = saved[k];
      });
      if (saved.sections) {
        if (saved.sections.schedule && saved.sections.schedule.items) {
          d.sections.events.items = saved.sections.schedule.items.map(function (it) {
            return { icon: 'rings', name: it.title || 'Event', time: it.time || '', venue: it.desc || '' };
          });
        }
        if (saved.sections.rsvp && saved.sections.rsvp.deadline) {
          d.sections.rsvp.deadline = saved.sections.rsvp.deadline;
        }
        if (saved.sections.contact) {
          d.sections.contact.email = saved.sections.contact.email || d.sections.contact.email;
          d.sections.contact.phone = saved.sections.contact.phone || d.sections.contact.phone;
        }
      }
    }
    if (!window.EVER_findTemplate(d.templateId)) d.templateId = 'emerald';
    state = d;
  }

  var saveTimer = null;
  function autosave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () { writeJson(EVENT_KEY, state); }, 350);
  }
  function saveNow() {
    clearTimeout(saveTimer);
    writeJson(EVENT_KEY, state);
  }

  /* ------------------------------------------------------------------ *
   *  Preview                                                            *
   * ------------------------------------------------------------------ */
  function render() {
    var canvas = document.getElementById('canvas');
    if (!canvas || !window.EVER_renderSite) return;
    canvas.innerHTML = '';
    var site = window.EVER_renderSite(state, { interactive: true });
    site.__wsData = state;
    canvas.appendChild(site);
    window.EVER_bindSite(site);
    window.EVER_tickCountdowns(site);
    clearInterval(pvTimer);
    pvTimer = setInterval(function () { window.EVER_tickCountdowns(canvas); }, 1000);
  }

  function refresh() {
    render();
    autosave();
    /* keep flow.design in step for checkout/summary consistency */
    var flow = readJson(FLOW_KEY) || {};
    if (flow.design !== state.templateId) {
      flow.design = state.templateId;
      writeJson(FLOW_KEY, flow);
    }
  }

  /* ------------------------------------------------------------------ *
   *  Sidebar — Basics                                                   *
   * ------------------------------------------------------------------ */
  function bindBasics() {
    document.querySelectorAll('[data-sec="_basic"]').forEach(function (input) {
      var k = input.getAttribute('data-k');
      input.value = state.basics[k] || '';
      input.addEventListener('input', function () {
        state.basics[k] = input.value;
        refresh();
      });
    });
  }

  /* ------------------------------------------------------------------ *
   *  Field renderers                                                    *
   * ------------------------------------------------------------------ */
  function fieldHtml(f, value, onInput) {
    var wrap = document.createElement('div');
    wrap.className = 'ed-field' + (f.type === 'check' ? ' ed-check' : '');
    var id = 'f-' + Math.random().toString(36).slice(2, 8);
    if (f.type === 'check') {
      wrap.innerHTML = '<input type="checkbox" id="' + id + '"' + (value ? ' checked' : '') + '/>' +
        '<label for="' + id + '">' + esc(f.label) + '</label>';
      wrap.querySelector('input').addEventListener('change', function (e) { onInput(e.target.checked); });
      return wrap;
    }
    var label = '<label for="' + id + '">' + esc(f.label) + '</label>';
    var ctl;
    if (f.type === 'date') {
      ctl = '<input id="' + id + '" type="date" value="' + esc(value) + '"/>';
    } else if (f.type === 'number') {
      ctl = '<input id="' + id + '" type="number" min="' + (f.min || 1) + '" max="' + (f.max || 12) + '" value="' + esc(value) + '"/>';
    } else if (f.type === 'photo') {
      var opts = '<option value="">Choose photo…</option>';
      window.EVER_PHOTOS.forEach(function (p) {
        opts += '<option value="' + p.id + '"' + (value === p.id ? ' selected' : '') + '>' + esc(p.label) + '</option>';
      });
      var isUrl = value && String(value).indexOf('/') > -1;
      ctl = '<div class="ed-photo-row">' +
          '<select data-role="pick">' + opts + '</select>' +
          '<input type="text" data-role="url" placeholder="…or paste image URL" value="' + (isUrl ? esc(value) : '') + '"/>' +
        '</div>';
    } else if (f.type === 'icon') {
      var labels = { rings: 'Rings', cocktail: 'Glasses', dinner: 'Dinner', music: 'Music', calendar: 'Calendar',
        clock: 'Clock', pin: 'Pin', dress: 'Dress', car: 'Parking', bell: 'Bell', chair: 'Accessible',
        snow: 'Cooling', phone: 'Phone', mail: 'Mail', whatsapp: 'WhatsApp', facebook: 'Facebook',
        instagram: 'Instagram', share: 'Share', heart: 'Heart', camera: 'Camera' };
      var iopts = '';
      Object.keys(window.EVER_ICONS).forEach(function (k) {
        iopts += '<option value="' + k + '"' + (value === k ? ' selected' : '') + '>' + (labels[k] || k) + '</option>';
      });
      ctl = '<select data-role="icon">' + iopts + '</select>';
    } else {
      ctl = '<input id="' + id + '" type="text" placeholder="' + esc(f.ph || '') + '" value="' + esc(value) + '"/>';
    }
    wrap.innerHTML = label + ctl;

    if (f.type === 'photo') {
      var pick = wrap.querySelector('[data-role="pick"]');
      var url = wrap.querySelector('[data-role="url"]');
      pick.addEventListener('change', function () {
        if (!pick.value) return;
        url.value = '';
        onInput(pick.value);
      });
      url.addEventListener('input', function () {
        onInput(url.value.trim());
      });
    } else if (f.type === 'icon') {
      wrap.querySelector('select').addEventListener('change', function (e) { onInput(e.target.value); });
    } else if (f.type !== 'check') {
      wrap.querySelector('input').addEventListener('input', function (e) { onInput(e.target.value); });
    }
    return wrap;
  }

  function getVal(obj, path) {
    return path.split('.').reduce(function (o, k) { return o ? o[k] : undefined; }, obj);
  }
  function setVal(obj, path, val) {
    var ks = path.split('.');
    var o = obj;
    for (var i = 0; i < ks.length - 1; i++) {
      if (!o[ks[i]] || typeof o[ks[i]] !== 'object') o[ks[i]] = {};
      o = o[ks[i]];
    }
    o[ks[ks.length - 1]] = val;
  }

  /* ------------------------------------------------------------------ *
   *  Sidebar — section groups                                           *
   * ------------------------------------------------------------------ */
  function buildGroups() {
    var host = document.getElementById('sec-groups');
    if (!host) return;
    host.innerHTML = '';
    var order = state.order && state.order.length ? state.order : SECTIONS.map(function (s) { return s.id; });

    order.forEach(function (sid) {
      var meta = null;
      SECTIONS.forEach(function (s) { if (s.id === sid) meta = s; });
      if (!meta) return;
      var sec = state.sections[sid];

      var det = document.createElement('details');
      det.className = 'ed-group' + (ui.open[sid] ? ' open' : '') + (sec.on ? '' : ' sec-off');
      if (ui.open[sid]) det.open = true;

      var sum = document.createElement('summary');
      sum.innerHTML = '<span>' + esc(meta.label) + '</span>' +
        '<span class="sec-tools">' +
          '<button type="button" data-tool="up" aria-label="Move ' + esc(meta.label) + ' up">&#8593;</button>' +
          '<button type="button" data-tool="down" aria-label="Move ' + esc(meta.label) + ' down">&#8595;</button>' +
          '<button type="button" data-tool="eye" aria-label="Show or hide ' + esc(meta.label) + '" aria-pressed="' + sec.on + '">&#128065;</button>' +
        '</span>';

      var body = document.createElement('div');
      body.className = 'ed-body';

      meta.fields.forEach(function (f) {
        body.appendChild(fieldHtml(f, getVal(sec, f.k), function (v) {
          setVal(sec, f.k, v);
          refresh();
        }));
      });

      if (meta.list) buildList(body, meta, sec);

      /* tool buttons */
      sum.querySelectorAll('[data-tool]').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          var tool = btn.getAttribute('data-tool');
          var i = state.order.indexOf(sid);
          if (tool === 'eye') {
            sec.on = !sec.on;
            det.classList.toggle('sec-off', !sec.on);
            btn.setAttribute('aria-pressed', String(sec.on));
          } else if (tool === 'up' && i > 0) {
            state.order.splice(i, 1);
            state.order.splice(i - 1, 0, sid);
            buildGroups();
          } else if (tool === 'down' && i < state.order.length - 1) {
            state.order.splice(i, 1);
            state.order.splice(i + 1, 0, sid);
            buildGroups();
          }
          refresh();
        });
      });
      det.addEventListener('toggle', function () { ui.open[sid] = det.open; });

      det.appendChild(sum);
      det.appendChild(body);
      host.appendChild(det);
    });
  }

  function buildList(body, meta, sec) {
    var cfg = meta.list;
    var arr = sec[cfg.k] = Array.isArray(sec[cfg.k]) ? sec[cfg.k] : [];
    var listBox = document.createElement('div');
    listBox.className = 'ed-list';

    arr.forEach(function (item, idx) {
      var li = document.createElement('div');
      li.className = 'ed-li';
      var head = document.createElement('div');
      head.className = 'ed-li-head';
      head.innerHTML = '<b>' + esc(cfg.label) + ' ' + (idx + 1) + '</b>' +
        '<span>' +
          '<button type="button" data-op="up" aria-label="Move up" ' + (idx === 0 ? 'disabled' : '') + '>&#8593;</button>' +
          '<button type="button" data-op="down" aria-label="Move down" ' + (idx === arr.length - 1 ? 'disabled' : '') + '>&#8595;</button>' +
          '<button type="button" data-op="del" aria-label="Remove">&#10005;</button>' +
        '</span>';
      li.appendChild(head);

      cfg.fields.forEach(function (f) {
        var val = f.k ? (item[f.k] || '') : item;
        li.appendChild(fieldHtml(f, val, function (v) {
          if (f.k) item[f.k] = v; else sec[cfg.k][idx] = v;
          refresh();
        }));
      });

      head.querySelectorAll('[data-op]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var op = btn.getAttribute('data-op');
          if (op === 'del') arr.splice(idx, 1);
          if (op === 'up' && idx > 0) arr.splice(idx - 1, 0, arr.splice(idx, 1)[0]);
          if (op === 'down' && idx < arr.length - 1) arr.splice(idx + 1, 0, arr.splice(idx, 1)[0]);
          buildGroups();
          refresh();
        });
      });
      listBox.appendChild(li);
    });

    var add = document.createElement('button');
    add.type = 'button';
    add.className = 'ed-add';
    add.textContent = '+ Add ' + cfg.label.toLowerCase();
    add.addEventListener('click', function () {
      arr.push(cfg.blank());
      buildGroups();
      refresh();
    });
    listBox.appendChild(add);
    body.appendChild(listBox);
  }

  /* ------------------------------------------------------------------ *
   *  Design panel                                                       *
   * ------------------------------------------------------------------ */
  function accentList() {
    return [
      { id: 'tpl', hex: null, label: 'Template' },
      { id: '#c9a45c', label: 'Gold' },
      { id: '#b98a8e', label: 'Rose' },
      { id: '#9a7b4f', label: 'Bronze' },
      { id: '#7f9c7c', label: 'Sage' },
      { id: '#b3704e', label: 'Clay' },
      { id: '#9a7bc9', label: 'Lilac' }
    ];
  }

  function buildDesign() {
    /* template chips */
    var chips = document.getElementById('tpl-chips');
    chips.innerHTML = '';
    window.EVER_allTemplates().forEach(function (t) {
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'tpl-chip' + (state.templateId === t.id ? ' on' : '');
      chip.setAttribute('role', 'radio');
      chip.setAttribute('aria-checked', String(state.templateId === t.id));
      chip.innerHTML = '<span class="tpl-swatch" style="background:' + esc(t.dark) + '">' +
          '<i style="background:' + esc(t.gold) + '"></i></span>' + esc(t.name) +
        (t.custom ? '<span class="chip-x" role="button" tabindex="0" aria-label="Edit or remove">&#9998;</span>' : '');
      chip.addEventListener('click', function (e) {
        if (e.target.closest('.chip-x')) return;
        state.templateId = t.id;
        buildDesign();
        refresh();
      });
      if (t.custom) {
        var x = chip.querySelector('.chip-x');
        x.addEventListener('click', function () { designerEdit(t.id); });
      }
      chips.appendChild(chip);
    });

    /* "create your own" chip */
    var newChip = document.createElement('button');
    newChip.type = 'button';
    newChip.className = 'tpl-chip tpl-chip-new';
    newChip.setAttribute('data-open-designer', '');
    newChip.innerHTML = '<span class="tpl-swatch new">+</span> New design';
    newChip.__dsnOnSave = function (t) {
      state.templateId = t.id;
      buildDesign();
      refresh();
    };
    chips.appendChild(newChip);

    /* name font */
    var fonts = document.getElementById('font-cards');
    fonts.innerHTML = '';
    var fontOpts = [{ id: '', label: 'Template' }].concat(Object.keys(window.EVER_NAME_FONTS).map(function (k) {
      return { id: k, label: window.EVER_NAME_FONTS[k].label };
    }));
    fontOpts.forEach(function (o) {
      var cls = o.id ? window.EVER_NAME_FONTS[o.id].cls : '';
      var sample = o.id === 'jost' ? 'AA' : 'Aa';
      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'font-card' + (state.nameFont === o.id ? ' on' : '');
      card.setAttribute('role', 'radio');
      card.setAttribute('aria-checked', String(state.nameFont === o.id));
      card.innerHTML = '<span class="font-sample ' + cls + '">' + sample + '</span>' + esc(o.label);
      card.addEventListener('click', function () {
        state.nameFont = o.id;
        buildDesign();
        refresh();
      });
      fonts.appendChild(card);
    });

    /* body font */
    var body = document.getElementById('body-cards');
    body.innerHTML = '';
    Object.keys(window.EVER_BODY_FONTS).forEach(function (k) {
      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'font-card' + (state.bodyFont === k ? ' on' : '');
      card.setAttribute('role', 'radio');
      card.setAttribute('aria-checked', String(state.bodyFont === k));
      card.innerHTML = '<span class="font-sample" style="font-family:' + (k === 'jost' ? 'Jost,sans-serif' : 'Lato,sans-serif') + '">Ag</span>' +
        esc(window.EVER_BODY_FONTS[k].label);
      card.addEventListener('click', function () {
        state.bodyFont = k;
        buildDesign();
        refresh();
      });
      body.appendChild(card);
    });

    /* accent dots + custom color */
    var dots = document.getElementById('color-dots');
    dots.innerHTML = '';
    accentList().forEach(function (a) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'color-dot' + (state.accent === a.id ? ' on' : '');
      dot.style.background = a.hex || 'linear-gradient(135deg,#c9a45c,#7f9c7c,#b98a8e)';
      dot.setAttribute('role', 'radio');
      dot.setAttribute('aria-checked', String(state.accent === a.id));
      dot.setAttribute('aria-label', a.label + ' accent');
      dot.title = a.label;
      dot.addEventListener('click', function () {
        state.accent = a.id;
        buildDesign();
        refresh();
      });
      dots.appendChild(dot);
    });
    var custom = document.createElement('label');
    custom.className = 'color-dot color-dot-custom' + (/^#/.test(state.accent) ? ' on' : '');
    custom.title = 'Custom accent';
    custom.innerHTML = '<input type="color" value="' + (/^#/.test(state.accent) ? esc(state.accent) : '#c9a45c') + '" aria-label="Custom accent color"/>';
    custom.querySelector('input').addEventListener('input', function (e) {
      state.accent = e.target.value;
      buildDesign();
      refresh();
    });
    dots.appendChild(custom);

    /* shape + spacing */
    var shapes = document.getElementById('shape-row');
    shapes.innerHTML = '';
    [['pill', 'Pill'], ['soft', 'Soft'], ['square', 'Square']].forEach(function (s) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'shape-btn' + (state.btnShape === s[0] ? ' on' : '');
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', String(state.btnShape === s[0]));
      b.innerHTML = '<span class="shape-demo sp-' + s[0] + '"></span>' + s[1];
      b.addEventListener('click', function () {
        state.btnShape = s[0];
        buildDesign();
        refresh();
      });
      shapes.appendChild(b);
    });
    var spacing = document.getElementById('ed-spacing');
    spacing.value = state.spacing;
    spacing.onchange = function () { state.spacing = spacing.value; refresh(); };
  }

  function designerEdit(id) {
    var tpl = window.EVER_readCustomTemplates().filter(function (t) { return t.id === id; })[0];
    if (!tpl) return;
    window.EVER_openDesigner({
      template: tpl,
      onSave: function (t) {
        if (state.templateId === id) state.templateId = t.id;
        buildDesign();
        refresh();
      }
    });
  }

  /* ------------------------------------------------------------------ *
   *  Tabs / device / save / publish                                     *
   * ------------------------------------------------------------------ */
  function bindChrome() {
    document.querySelectorAll('.ed-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        document.querySelectorAll('.ed-tab').forEach(function (t) {
          t.classList.remove('on');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('on');
        tab.setAttribute('aria-selected', 'true');
        document.querySelectorAll('.ed-panel').forEach(function (p) { p.hidden = true; });
        var panel = document.getElementById(tab.getAttribute('aria-controls'));
        if (panel) panel.hidden = false;
      });
    });

    document.querySelectorAll('.ed-dev-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.ed-dev-btn').forEach(function (b) {
          b.classList.remove('on');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('on');
        btn.setAttribute('aria-pressed', 'true');
        document.getElementById('canvas-frame').classList.toggle('mobile', btn.getAttribute('data-dev') === 'mobile');
      });
    });

    document.getElementById('save-btn').addEventListener('click', function () {
      saveNow();
      toast('Saved — your website lives on this device.');
    });

    document.getElementById('publish-btn').addEventListener('click', function () {
      saveNow();
      var flow = readJson(FLOW_KEY) || {};
      var slug = slugify(state.basics.nameA + '-' + state.basics.nameB);
      flow.published = true;
      flow.slug = slug;
      writeJson(FLOW_KEY, flow);
      var badge = document.getElementById('ed-badge');
      badge.textContent = 'Published';
      badge.classList.add('published');
      var urlEl = document.getElementById('pub-url');
      if (urlEl) urlEl.textContent = slug + '.ever-rsvp.com';
      document.getElementById('pub-overlay').hidden = false;
      document.body.classList.add('modal-open');
    });
    document.getElementById('pub-close').addEventListener('click', function () {
      document.getElementById('pub-overlay').hidden = true;
      document.body.classList.remove('modal-open');
    });
    var copy = document.getElementById('copy-url');
    if (copy) {
      copy.addEventListener('click', function () {
        var text = document.getElementById('pub-url').textContent;
        var done = function () { copy.textContent = 'Copied!'; setTimeout(function () { copy.textContent = 'Copy'; }, 1600); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, done);
        else done();
      });
    }
  }

  function toast(msg) {
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(t.__tm);
    t.__tm = setTimeout(function () { t.hidden = true; }, 2600);
  }

  function updateBadge() {
    var flow = readJson(FLOW_KEY) || {};
    var badge = document.getElementById('ed-badge');
    if (!badge) return;
    if (flow.published) {
      badge.textContent = 'Published';
      badge.classList.add('published');
    } else if (flow.order) {
      badge.textContent = 'Order ' + flow.order;
    }
  }

  /* ------------------------------------------------------------------ *
   *  Boot                                                               *
   * ------------------------------------------------------------------ */
  loadState();
  bindBasics();
  buildGroups();
  buildDesign();
  bindChrome();
  updateBadge();
  render();
  window.addEventListener('beforeunload', function () { saveNow(); });
})();

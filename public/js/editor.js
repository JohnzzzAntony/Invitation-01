/* ==========================================================================
   Ever RSVP — design editor (step 3): live preview + save + publish
   ========================================================================== */
(function () {
  'use strict';

  var FLOW_KEY = 'ever-rsvp-flow';
  var EVENT_KEY = 'ever-rsvp-event';

  var ACCENTS = [
    { id: 'tpl',       label: 'Template', hex: null },
    { id: 'teal',      label: 'Teal',      hex: '#1798b8' },
    { id: 'gold',      label: 'Gold',      hex: '#b9975b' },
    { id: 'sage',      label: 'Sage',      hex: '#7f9c7c' },
    { id: 'terracotta',label: 'Terracotta',hex: '#b3704e' },
    { id: 'navy',      label: 'Navy',      hex: '#22384a' }
  ];

  var state = {
    templateId: 'eucalyptus',
    fontPair: 'classic',
    accent: 'tpl',
    nameA: 'Amelia',
    nameB: 'Noah',
    date: '2026-06-14',
    venue: 'Rosewood Barn',
    city: 'Kent',
    story: 'Ten years, two cities and one very spoilt cat — and now, the easy part: a party with our favorite people.',
    showStory: true,
    showSchedule: true,
    qMenu: true,
    qPlus: true,
    qSong: false
  };

  /* ---------- State load / save ---------- */
  function readJson(key) {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); }
    catch (e) { return null; }
  }

  function findTpl(id) {
    var list = window.EVER_TEMPLATES || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return list[0];
  }

  function currentTpl() { return findTpl(state.templateId); }

  function currentAccentHex() {
    for (var i = 0; i < ACCENTS.length; i++) {
      if (ACCENTS[i].id === state.accent) {
        return ACCENTS[i].hex || currentTpl().btn;
      }
    }
    return currentTpl().btn;
  }

  function loadState() {
    var flow = readJson(FLOW_KEY) || {};
    var saved = readJson(EVENT_KEY);
    if (saved) {
      for (var k in state) {
        if (Object.prototype.hasOwnProperty.call(saved, k)) state[k] = saved[k];
      }
    } else if (flow.design) {
      state.templateId = flow.design;
    }
  }

  function saveState(silent) {
    try { localStorage.setItem(EVENT_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
    if (!silent && window.everToast) window.everToast('Saved — your edits live on this device.');
  }

  /* ---------- Sidebar build ---------- */
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
        saveState(true);
        buildTemplateChips();
        buildColorDots();
        render();
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
        saveState(true);
        buildFontCards();
        render();
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
      b.innerHTML = '<i style="background:' + (a.hex || currentTpl().btn) + '"></i>';
      b.addEventListener('click', function () {
        state.accent = a.id;
        saveState(true);
        buildColorDots();
        render();
      });
      wrap.appendChild(b);
    });
  }

  /* ---------- Canvas render ---------- */
  function render() {
    var canvas = document.getElementById('canvas');
    if (!canvas || !window.renderInvite) return;
    var data = {
      kicker: 'Together with their families',
      nameA: state.nameA,
      nameB: state.nameB,
      date: state.date,
      venue: state.venue,
      city: state.city,
      fontPair: state.fontPair,
      accent: currentAccentHex(),
      story: state.story,
      showStory: state.showStory,
      showSchedule: state.showSchedule,
      qMenu: state.qMenu,
      qPlus: state.qPlus,
      qSong: state.qSong
    };
    canvas.innerHTML = '';
    canvas.appendChild(window.renderInvite(currentTpl(), data, { size: 'lg', extended: true }));
  }

  /* ---------- Field bindings ---------- */
  var FIELD_MAP = [
    ['ed-nameA', 'nameA', 'value'],
    ['ed-nameB', 'nameB', 'value'],
    ['ed-date', 'date', 'value'],
    ['ed-venue', 'venue', 'value'],
    ['ed-city', 'city', 'value'],
    ['ed-story', 'story', 'value'],
    ['ed-showStory', 'showStory', 'checked'],
    ['ed-showSchedule', 'showSchedule', 'checked'],
    ['ed-qMenu', 'qMenu', 'checked'],
    ['ed-qPlus', 'qPlus', 'checked'],
    ['ed-qSong', 'qSong', 'checked']
  ];

  function bindFields() {
    var timer = null;
    FIELD_MAP.forEach(function (pair) {
      var el = document.getElementById(pair[0]);
      if (!el) return;
      el.addEventListener('input', function () {
        state[pair[1]] = pair[2] === 'checked' ? el.checked : el.value;
        clearTimeout(timer);
        timer = setTimeout(function () { saveState(true); }, 500);
        render();
      });
      el.addEventListener('change', function () {
        state[pair[1]] = pair[2] === 'checked' ? el.checked : el.value;
        saveState(true);
        render();
      });
    });
  }

  function fillFields() {
    FIELD_MAP.forEach(function (pair) {
      var el = document.getElementById(pair[0]);
      if (!el) return;
      if (pair[2] === 'checked') el.checked = !!state[pair[1]];
      else el.value = state[pair[1]];
    });
  }

  /* ---------- Device toggle ---------- */
  var devBtns = document.querySelectorAll('.ed-dev-btn');
  Array.prototype.forEach.call(devBtns, function (btn) {
    btn.addEventListener('click', function () {
      Array.prototype.forEach.call(devBtns, function (b) { b.classList.remove('on'); });
      btn.classList.add('on');
      var frame = document.getElementById('canvas-frame');
      if (frame) frame.classList.toggle('mobile', btn.getAttribute('data-dev') === 'mobile');
    });
  });

  /* ---------- Save & publish ---------- */
  var saveBtn = document.getElementById('save-btn');
  if (saveBtn) saveBtn.addEventListener('click', function () { saveState(false); });

  var pubOverlay = document.getElementById('pub-overlay');
  var publishBtn = document.getElementById('publish-btn');

  function slugify(s) {
    return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'your-event';
  }

  if (publishBtn) {
    publishBtn.addEventListener('click', function () {
      publishBtn.classList.add('loading');
      publishBtn.disabled = true;

      setTimeout(function () {
        publishBtn.classList.remove('loading');
        publishBtn.disabled = false;

        var flow = readJson(FLOW_KEY) || {};
        flow.published = true;
        flow.slug = slugify(state.nameA) + '-' + slugify(state.nameB);
        try { localStorage.setItem(FLOW_KEY, JSON.stringify(flow)); } catch (e) { /* ignore */ }

        var badge = document.getElementById('ed-badge');
        if (badge) { badge.textContent = 'Published'; badge.classList.add('live'); }

        var urlEl = document.getElementById('pub-url');
        if (urlEl) urlEl.textContent = flow.slug + '.ever-rsvp.com';
        if (pubOverlay) {
          pubOverlay.hidden = false;
          document.body.style.overflow = 'hidden';
        }
      }, 1200);
    });
  }

  var pubClose = document.getElementById('pub-close');
  if (pubClose) {
    pubClose.addEventListener('click', function () {
      if (pubOverlay) pubOverlay.hidden = true;
      document.body.style.overflow = '';
    });
  }
  if (pubOverlay) {
    pubOverlay.addEventListener('click', function (e) {
      if (e.target === pubOverlay) {
        pubOverlay.hidden = true;
        document.body.style.overflow = '';
      }
    });
  }

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

  /* ---------- Order badge ---------- */
  (function () {
    var flow = readJson(FLOW_KEY) || {};
    var badge = document.getElementById('ed-badge');
    if (!badge) return;
    if (flow.published) {
      badge.textContent = 'Published';
      badge.classList.add('live');
    } else if (flow.paid) {
      badge.textContent = 'Order ' + (flow.order || 'paid');
    }
  })();

  /* ---------- Boot ---------- */
  loadState();
  fillFields();
  buildTemplateChips();
  buildFontCards();
  buildColorDots();
  bindFields();
  render();
})();

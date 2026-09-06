/* ==========================================================================
   Ever RSVP — design selection page (step 1)
   Multi-event catalog (v4): 8 layouts x 27 themes across 7 occasion types,
   plus user-created designs and the "create your own" builder.
   Chips filter by occasion; the grid groups designs under occasion
   subheadings; each card previews its own layout via EVER_renderSiteMini.
   ========================================================================== */
(function () {
  'use strict';

  var grid = document.getElementById('tpl-grid');
  var emptyMsg = document.getElementById('tpl-empty');
  var chipBox = document.getElementById('event-chips');
  var FLOW_KEY = 'ever-rsvp-flow';

  if (!grid || !window.EVER_allTemplates || !window.EVER_EVENTS) return;

  var EVENTS = window.EVER_EVENTS;
  var currentFilter = 'all';

  function esc(s) {
    return window.EVER_esc ? window.EVER_esc(s) : String(s == null ? '' : s);
  }

  /* ---------- Flow (design pick → checkout) ---------- */
  function readFlow() {
    try { return JSON.parse(localStorage.getItem(FLOW_KEY) || '{}'); }
    catch (e) { return {}; }
  }

  function saveDesign(id) {
    var flow = readFlow();
    flow.design = id;
    flow.paid = false;
    flow.startedAt = new Date().toISOString();
    try { localStorage.setItem(FLOW_KEY, JSON.stringify(flow)); } catch (e) { /* ignore */ }
  }

  function selectDesign(tpl) {
    saveDesign(tpl.id);
    if (window.everToast) window.everToast('\u201c' + tpl.name + '\u201d selected \u2014 taking you to checkout\u2026');
    setTimeout(function () { window.location.href = 'checkout.html'; }, 550);
  }

  /* ---------- Helpers ---------- */
  function eventLabel(ev) {
    return (EVENTS[ev] && EVENTS[ev].label) || 'Event';
  }

  function matchesEvent(tpl, ev) {
    return (tpl.event || 'wedding') === ev;
  }

  /* ---------- Cards ---------- */
  function makeCard(tpl, custom) {
    var card = document.createElement('article');
    card.className = 'tpl-card' + (custom ? ' tpl-card-custom' : '');
    card.setAttribute('data-ev', custom ? 'custom' : (tpl.event || 'wedding'));
    card.setAttribute('data-cat', tpl.category || 'Custom');
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', 'Use the ' + tpl.name + ' design');

    var preview = document.createElement('div');
    preview.className = 'tpl-preview';
    preview.appendChild(window.EVER_renderSiteMini(tpl, null, {}));

    var meta = document.createElement('div');
    meta.className = 'tpl-meta';
    meta.innerHTML =
      '<div><h3>' + esc(tpl.name) + '</h3>' +
      '<span class="tpl-badges">' +
      '<span class="tpl-ev">' + esc(eventLabel(tpl.event)) + '</span>' +
      '<span class="tpl-cat">' + esc(tpl.category || 'Custom') + '</span>' +
      '</span></div>' +
      (custom
        ? '<span class="tpl-tools">' +
          '<button type="button" class="tpl-tool" data-op="edit" aria-label="Edit design">&#9998;</button>' +
          '<button type="button" class="tpl-tool" data-op="del" aria-label="Delete design">&#10005;</button>' +
          '<span class="tpl-use">Use <i aria-hidden="true">&#8594;</i></span></span>'
        : '<span class="tpl-use">Use this design <i aria-hidden="true">&#8594;</i></span>');

    card.appendChild(preview);
    card.appendChild(meta);

    function select() { selectDesign(tpl); }
    card.addEventListener('click', function (e) {
      if (e.target.closest('.tpl-tool')) return;
      select();
    });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(); }
    });

    if (custom) {
      card.querySelector('[data-op="edit"]').addEventListener('click', function () {
        window.EVER_openDesigner({
          template: tpl,
          onSave: function () { renderGrid(); }
        });
      });
      card.querySelector('[data-op="del"]').addEventListener('click', function () {
        window.EVER_deleteCustomTemplate(tpl.id);
        if (window.everToast) window.everToast('Design deleted.');
        renderGrid();
      });
    }
    return card;
  }

  function makeBuilderCard() {
    var card = document.createElement('article');
    card.className = 'tpl-card tpl-card-builder';
    card.setAttribute('data-ev', 'custom');
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', 'Create your own design');
    card.setAttribute('data-open-designer', '');
    card.innerHTML =
      '<div class="tpl-preview tpl-preview-builder"><span aria-hidden="true">+</span>' +
      '<p>Create your own design</p></div>' +
      '<div class="tpl-meta"><div><h3>Your own design</h3><span class="tpl-badges">' +
      '<span class="tpl-cat">Custom</span></span></div>' +
      '<span class="tpl-use">Start creating <i aria-hidden="true">&#8594;</i></span></div>';
    card.__dsnOnSave = function (t) { selectDesign(t); };
    return card;
  }

  function makeGroupTitle(ev) {
    var h = document.createElement('h2');
    h.className = 'tpl-group-title';
    h.innerHTML = esc(EVENTS[ev].label) +
      ' <span class="tpl-group-tag">' + esc(EVENTS[ev].tagline) + '</span>';
    return h;
  }

  /* ---------- Grid rendering ---------- */
  function emptyText(filter) {
    if (filter === 'custom') return 'No custom designs yet \u2014 be the first to create one!';
    if (filter !== 'all' && EVENTS[filter]) {
      return 'No ' + EVENTS[filter].label + ' designs yet \u2014 be the first to create one!';
    }
    return 'No designs in this style yet \u2014 try another filter.';
  }

  function renderGrid() {
    grid.innerHTML = '';
    var all = window.EVER_allTemplates();
    var customs = [];
    var i, shown = 0;
    for (i = 0; i < all.length; i++) if (all[i].custom) customs.push(all[i]);

    if (currentFilter === 'all') {
      /* group under occasion subheadings, in EVER_EVENTS order */
      Object.keys(EVENTS).forEach(function (ev) {
        var cards = [];
        for (var j = 0; j < all.length; j++) if (matchesEvent(all[j], ev)) cards.push(all[j]);
        if (!cards.length) return;
        grid.appendChild(makeGroupTitle(ev));
        cards.forEach(function (t) { grid.appendChild(makeCard(t, !!t.custom)); shown++; });
      });
      grid.appendChild(makeBuilderCard());
    } else if (currentFilter === 'custom') {
      customs.forEach(function (t) { grid.appendChild(makeCard(t, true)); shown++; });
      grid.appendChild(makeBuilderCard());
    } else {
      for (var k = 0; k < all.length; k++) {
        if (matchesEvent(all[k], currentFilter)) {
          grid.appendChild(makeCard(all[k], !!all[k].custom));
          shown++;
        }
      }
    }

    if (emptyMsg) {
      emptyMsg.textContent = emptyText(currentFilter);
      emptyMsg.hidden = shown > 0;
    }
  }

  /* ---------- Occasion filter chips ---------- */
  function buildChips() {
    if (!chipBox) return;
    chipBox.innerHTML = '';
    var defs = [{ ev: 'all', label: 'All designs' }];
    Object.keys(EVENTS).forEach(function (k) {
      defs.push({ ev: k, label: EVENTS[k].label });
    });
    defs.push({ ev: 'custom', label: 'My designs' });

    defs.forEach(function (d) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip' + (d.ev === currentFilter ? ' on' : '');
      b.setAttribute('data-ev', d.ev);
      b.setAttribute('aria-pressed', d.ev === currentFilter ? 'true' : 'false');
      b.textContent = d.label;
      b.addEventListener('click', function () {
        if (currentFilter === d.ev) return;
        currentFilter = d.ev;
        Array.prototype.forEach.call(chipBox.querySelectorAll('.chip'), function (c) {
          var on = c === b;
          c.classList.toggle('on', on);
          c.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        renderGrid();
      });
      chipBox.appendChild(b);
    });
  }

  buildChips();
  renderGrid();
})();

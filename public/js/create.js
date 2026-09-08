/* ==========================================================================
   Ever RSVP — design marketplace (step 1)
   27 themes across 10 layouts and 7 occasions, plus user-created designs.
   Filters: occasion chips + search, style, price band and plan. Each card
   shows its price, plan and editor level, and offers "View design" (detail
   page) or "Use this design" (creates the project and goes to plan choice).
   ========================================================================== */
(function () {
  'use strict';

  var grid = document.getElementById('tpl-grid');
  var emptyMsg = document.getElementById('tpl-empty');
  var countMsg = document.getElementById('tpl-count');
  var chipBox = document.getElementById('event-chips');

  var C = window.EVER_C;
  if (!grid || !window.EVER_allTemplates || !window.EVER_EVENTS || !C) return;

  var EVENTS = window.EVER_EVENTS;

  var filters = { event: 'all', q: '', style: '', price: '', plan: '' };

  function esc(s) {
    return window.EVER_esc ? window.EVER_esc(s) : String(s == null ? '' : s);
  }

  /* ---------- Start a project bound to this one design (§3) ---------- */
  function useDesign(tpl) {
    var project = C.createProject(tpl.id);
    if (!project) {
      if (window.everToast) window.everToast('Could not start an invitation — please try again.');
      return;
    }
    if (window.everToast) window.everToast('“' + tpl.name + '” selected — choose your plan.');
    setTimeout(function () {
      window.location.href = 'plan.html?p=' + encodeURIComponent(project.id);
    }, 450);
  }

  function viewDesign(tpl) {
    window.location.href = 'design.html?id=' + encodeURIComponent(tpl.id);
  }

  /* ---------- Filtering ---------- */
  /* Bands chosen to actually split the catalogue: starting prices (design +
     its cheapest plan) currently run AED 58-108. Keep these in step with the
     <option> labels in create.html. */
  function priceBand(from) {
    if (from < 65) return 'lo';
    if (from <= 100) return 'mid';
    return 'hi';
  }

  function matches(tpl) {
    var meta = C.themeCommerce(tpl);
    if (!meta) return false;

    if (filters.event === 'custom') {
      if (!tpl.custom) return false;
    } else if (filters.event !== 'all') {
      if ((tpl.event || 'wedding') !== filters.event) return false;
    }

    if (filters.style && meta.style !== filters.style) return false;
    if (filters.plan && meta.plans.indexOf(filters.plan) === -1) return false;
    if (filters.price && priceBand(C.startingPrice(tpl)) !== filters.price) return false;

    if (filters.q) {
      var hay = [
        tpl.name, tpl.category, meta.style,
        (EVENTS[tpl.event] && EVENTS[tpl.event].label) || ''
      ].join(' ').toLowerCase();
      if (hay.indexOf(filters.q) === -1) return false;
    }
    return true;
  }

  /* ---------- Cards ---------- */
  function makeCard(tpl, custom) {
    var meta = C.themeCommerce(tpl);
    var card = document.createElement('article');
    card.className = 'tpl-card' + (custom ? ' tpl-card-custom' : '');
    card.setAttribute('data-ev', custom ? 'custom' : (tpl.event || 'wedding'));

    var preview = document.createElement('div');
    preview.className = 'tpl-preview';
    try { preview.appendChild(window.EVER_renderSiteMini(tpl, null, {})); }
    catch (e) { /* preview is decorative — the card still works */ }

    var meta_el = document.createElement('div');
    meta_el.className = 'tpl-meta';
    meta_el.innerHTML =
      '<div class="tpl-head">' +
      '<h3>' + esc(tpl.name) + '</h3>' +
      '<span class="tpl-badges">' +
      '<span class="tpl-ev">' + esc((EVENTS[tpl.event] && EVENTS[tpl.event].label) || 'Event') + '</span>' +
      '<span class="tpl-cat">' + esc(meta.style) + '</span>' +
      '</span></div>' +
      '<p class="tpl-price">From <strong>' + esc(C.money(C.startingPrice(tpl))) + '</strong></p>' +
      '<p class="tpl-plan">' +
      esc(meta.plans.map(function (p) { return C.findPlan(p).name; }).join(' · ')) +
      ' &middot; up to ' + esc(C.findPlan(meta.editorLevel).editorLevel.toLowerCase()) +
      ' editing</p>' +
      '<div class="tpl-actions">' +
      '<button type="button" class="btn btn-ghost btn-sm" data-act="view">View design</button>' +
      '<button type="button" class="btn btn-primary btn-sm" data-act="use">Use design</button>' +
      '</div>' +
      (custom
        ? '<span class="tpl-tools">' +
          '<button type="button" class="tpl-tool" data-op="edit" aria-label="Edit design">&#9998;</button>' +
          '<button type="button" class="tpl-tool" data-op="del" aria-label="Delete design">&#10005;</button>' +
          '</span>'
        : '');

    card.appendChild(preview);
    card.appendChild(meta_el);

    card.querySelector('[data-act="view"]').addEventListener('click', function () { viewDesign(tpl); });
    card.querySelector('[data-act="use"]').addEventListener('click', function () { useDesign(tpl); });
    preview.addEventListener('click', function () { viewDesign(tpl); });

    if (custom) {
      card.querySelector('[data-op="edit"]').addEventListener('click', function () {
        window.EVER_openDesigner({ template: tpl, onSave: function () { renderGrid(); } });
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
      '<div class="tpl-meta"><div class="tpl-head"><h3>Your own design</h3>' +
      '<span class="tpl-badges"><span class="tpl-cat">Custom</span></span></div>' +
      '<p class="tpl-price">From <strong>' + esc(C.money(29 + C.findPlan('basic').price)) + '</strong></p>' +
      '<p class="tpl-plan">Basic · Pro · Advanced</p>' +
      '<div class="tpl-actions"><span class="tpl-use">Start creating <i aria-hidden="true">&#8594;</i></span></div></div>';
    card.__dsnOnSave = function (t) { useDesign(t); };
    return card;
  }

  function makeGroupTitle(ev) {
    var h = document.createElement('h2');
    h.className = 'tpl-group-title';
    h.innerHTML = esc(EVENTS[ev].label) +
      ' <span class="tpl-group-tag">' + esc(EVENTS[ev].tagline) + '</span>';
    return h;
  }

  /* ---------- Grid ---------- */
  function renderGrid() {
    grid.innerHTML = '';
    var all = window.EVER_allTemplates().filter(matches);
    var shown = 0;
    var grouped = filters.event === 'all' && !filters.q && !filters.style &&
                  !filters.price && !filters.plan;

    if (grouped) {
      Object.keys(EVENTS).forEach(function (ev) {
        var cards = all.filter(function (t) { return (t.event || 'wedding') === ev; });
        if (!cards.length) return;
        grid.appendChild(makeGroupTitle(ev));
        cards.forEach(function (t) { grid.appendChild(makeCard(t, !!t.custom)); shown++; });
      });
      grid.appendChild(makeBuilderCard());
    } else {
      all.forEach(function (t) { grid.appendChild(makeCard(t, !!t.custom)); shown++; });
      if (filters.event === 'custom') grid.appendChild(makeBuilderCard());
    }

    if (emptyMsg) emptyMsg.hidden = shown > 0;
    if (countMsg) {
      countMsg.textContent = shown
        ? shown + (shown === 1 ? ' design' : ' designs')
        : '';
    }
  }

  /* ---------- Occasion chips ---------- */
  function buildChips() {
    if (!chipBox) return;
    chipBox.innerHTML = '';
    var defs = [{ ev: 'all', label: 'All designs' }];
    Object.keys(EVENTS).forEach(function (k) { defs.push({ ev: k, label: EVENTS[k].label }); });
    defs.push({ ev: 'custom', label: 'My designs' });

    defs.forEach(function (d) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip' + (d.ev === filters.event ? ' on' : '');
      b.setAttribute('data-ev', d.ev);
      b.setAttribute('aria-pressed', d.ev === filters.event ? 'true' : 'false');
      b.textContent = d.label;
      b.addEventListener('click', function () {
        if (filters.event === d.ev) return;
        filters.event = d.ev;
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

  /* ---------- Select filters ---------- */
  function buildSelects() {
    var style = document.getElementById('f-style');
    C.STYLES.forEach(function (s) {
      var o = document.createElement('option');
      o.value = s; o.textContent = s;
      style.appendChild(o);
    });

    var plan = document.getElementById('f-plan');
    C.PLANS.forEach(function (p) {
      var o = document.createElement('option');
      o.value = p.id; o.textContent = p.name;
      plan.appendChild(o);
    });

    style.addEventListener('change', function () { filters.style = style.value; renderGrid(); });
    plan.addEventListener('change', function () { filters.plan = plan.value; renderGrid(); });

    var price = document.getElementById('f-price');
    price.addEventListener('change', function () { filters.price = price.value; renderGrid(); });

    var search = document.getElementById('tpl-search');
    var t = null;
    search.addEventListener('input', function () {
      clearTimeout(t);
      t = setTimeout(function () {
        filters.q = search.value.trim().toLowerCase();
        renderGrid();
      }, 160);
    });

    document.getElementById('f-reset').addEventListener('click', function () {
      filters = { event: 'all', q: '', style: '', price: '', plan: '' };
      search.value = ''; style.value = ''; price.value = ''; plan.value = '';
      buildChips();
      renderGrid();
    });
  }

  buildChips();
  buildSelects();
  renderGrid();
})();

/* ==========================================================================
   Ever RSVP — design selection page (step 1)
   Builtin themes + user-created designs + "create your own" builder.
   ========================================================================== */
(function () {
  'use strict';

  var grid = document.getElementById('tpl-grid');
  var emptyMsg = document.getElementById('tpl-empty');
  var FLOW_KEY = 'ever-rsvp-flow';

  if (!grid || !window.EVER_allTemplates) return;

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
    window.location.href = 'checkout.html';
  }

  function makeCard(tpl, custom) {
    var card = document.createElement('article');
    card.className = 'tpl-card' + (custom ? ' tpl-card-custom' : '');
    card.setAttribute('data-cat', tpl.category || 'Custom');
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', 'Use the ' + tpl.name + ' design');

    var preview = document.createElement('div');
    preview.className = 'tpl-preview';
    preview.appendChild(window.renderSiteMini(tpl));

    var meta = document.createElement('div');
    meta.className = 'tpl-meta';
    meta.innerHTML =
      '<div><h3>' + window.EVER_esc(tpl.name) + '</h3><span class="tpl-cat">' +
      window.EVER_esc(tpl.category || 'Custom') + '</span></div>' +
      (custom
        ? '<span class="tpl-tools">' +
          '<button type="button" class="tpl-tool" data-op="edit" aria-label="Edit design">&#9998;</button>' +
          '<button type="button" class="tpl-tool" data-op="del" aria-label="Delete design">&#10005;</button>' +
          '<span class="tpl-use">Use <i aria-hidden="true">&#8594;</i></span></span>'
        : '<span class="tpl-use">Use this design <i aria-hidden="true">&#8594;</i></span>');

    card.appendChild(preview);
    card.appendChild(meta);

    function select() { saveDesign(tpl.id); }
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
        renderGrid();
      });
    }
    return card;
  }

  function makeBuilderCard() {
    var card = document.createElement('article');
    card.className = 'tpl-card tpl-card-builder';
    card.setAttribute('data-cat', 'Custom');
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', 'Create your own design');
    card.setAttribute('data-open-designer', '');
    card.innerHTML =
      '<div class="tpl-preview tpl-preview-builder"><span aria-hidden="true">+</span>' +
      '<p>Create your own design</p></div>' +
      '<div class="tpl-meta"><div><h3>Your own design</h3><span class="tpl-cat">Custom</span></div>' +
      '<span class="tpl-use">Start creating <i aria-hidden="true">&#8594;</i></span></div>';
    card.__dsnOnSave = function (t) { saveDesign(t.id); };
    return card;
  }

  function renderGrid() {
    grid.innerHTML = '';
    window.EVER_allTemplates().forEach(function (tpl) {
      grid.appendChild(makeCard(tpl, !!tpl.custom));
    });
    grid.appendChild(makeBuilderCard());

    /* re-apply active filter */
    var on = document.querySelector('.chip.on');
    var cat = on ? on.getAttribute('data-cat') : 'all';
    var visible = 0;
    Array.prototype.forEach.call(grid.children, function (card) {
      var show = cat === 'all' || card.getAttribute('data-cat') === cat;
      card.hidden = !show;
      if (show) visible++;
    });
    if (emptyMsg) emptyMsg.hidden = visible > 0;
  }

  /* Filters */
  var chips = Array.prototype.slice.call(document.querySelectorAll('.chip'));
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.classList.remove('on'); });
      chip.classList.add('on');
      var cat = chip.getAttribute('data-cat');
      var visible = 0;
      Array.prototype.forEach.call(grid.children, function (card) {
        var show = cat === 'all' || card.getAttribute('data-cat') === cat;
        card.hidden = !show;
        if (show) visible++;
      });
      if (emptyMsg) emptyMsg.hidden = visible > 0;
    });
  });

  renderGrid();
})();

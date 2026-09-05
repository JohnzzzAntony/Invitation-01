/* ==========================================================================
   Ever RSVP — design selection page (step 1)
   ========================================================================== */
(function () {
  'use strict';

  var grid = document.getElementById('tpl-grid');
  var emptyMsg = document.getElementById('tpl-empty');
  var FLOW_KEY = 'ever-rsvp-flow';

  if (!grid || !window.EVER_TEMPLATES) return;

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

  /* Build the cards */
  window.EVER_TEMPLATES.forEach(function (tpl) {
    var card = document.createElement('article');
    card.className = 'tpl-card';
    card.setAttribute('data-cat', tpl.category);
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', 'Use the ' + tpl.name + ' design');

    var preview = document.createElement('div');
    preview.className = 'tpl-preview';
    preview.appendChild(window.renderSiteMini(tpl));

    var meta = document.createElement('div');
    meta.className = 'tpl-meta';
    meta.innerHTML =
      '<div><h3>' + tpl.name + '</h3><span class="tpl-cat">' + tpl.category + '</span></div>' +
      '<span class="tpl-use">Use this design <i aria-hidden="true">&#8594;</i></span>';

    card.appendChild(preview);
    card.appendChild(meta);

    function select() { saveDesign(tpl.id); }
    card.addEventListener('click', select);
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(); }
    });

    grid.appendChild(card);
  });

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
})();

/* ==========================================================================
   Ever RSVP — design detail page (?id=<themeId>)
   Shows one design's preview, sections, plans and price, and starts a new
   invitation project bound to it. Live demo renders the real layout with the
   theme's sample content at three viewport sizes.
   ========================================================================== */
(function () {
  'use strict';

  var C = window.EVER_C;
  if (!C || !window.EVER_findTemplate) return;

  var esc = window.EVER_esc;

  function param(name) {
    var m = new RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : '';
  }

  var tpl = window.EVER_findTemplate(param('id'));
  if (!tpl) {
    window.location.replace('create.html');
    return;
  }

  var meta = C.themeCommerce(tpl);
  var EVENTS = window.EVER_EVENTS || {};
  var eventLabel = (EVENTS[tpl.event] && EVENTS[tpl.event].label) || 'Event';

  document.title = tpl.name + ' — ' + eventLabel + ' invitation design | Ever RSVP';

  /* ---------------- Copy ---------------- */
  /* Written from the design's own facts rather than stored per theme, so a
     new theme never ships without a description. */
  /* Feature names keep their own casing — lowercasing the list would turn
     "RSVP" into "rsvp". */
  function description() {
    var top = meta.features.slice(0, 4);
    var list = top.length > 1
      ? top.slice(0, -1).join(', ') + ' and ' + top[top.length - 1]
      : (top[0] || 'everything you need');
    var style = meta.style.toLowerCase();
    return (/^[aeiou]/.test(style) ? 'An ' : 'A ') + style + ' ' + eventLabel.toLowerCase() +
      ' invitation with ' + list + ', in a layout built to read beautifully on a phone. ' +
      'Every word, photo and colour is yours to change.';
  }

  document.getElementById('crumb-name').textContent = tpl.name;
  document.getElementById('detail-name').textContent = tpl.name;
  document.getElementById('detail-event').textContent = eventLabel + ' · ' + meta.style;
  document.getElementById('detail-desc').textContent = description();
  document.getElementById('detail-price').textContent = C.money(C.startingPrice(tpl));

  /* ---------------- Preview ---------------- */
  var previewBox = document.getElementById('detail-preview');
  if (previewBox && window.EVER_renderSiteMini) {
    try { previewBox.appendChild(window.EVER_renderSiteMini(tpl, null, {})); }
    catch (e) { /* a failed preview must not block the purchase path */ }
  }

  /* ---------------- Feature list ---------------- */
  var featBox = document.getElementById('detail-features');
  if (featBox) {
    featBox.innerHTML = meta.features.map(function (f) {
      return '<li>' + esc(f) + '</li>';
    }).join('');
  }

  /* ---------------- Plans available for this design ---------------- */
  var planBox = document.getElementById('detail-plans');
  if (planBox) {
    planBox.innerHTML = meta.plans.map(function (id) {
      var plan = C.findPlan(id);
      var total = meta.basePrice + plan.price;
      return '<div class="dp-plan">' +
        '<div><strong>' + esc(plan.name) + '</strong>' +
        '<span>' + esc(plan.editorLevel) + ' editor</span></div>' +
        '<span class="dp-plan-total">' + esc(C.money(total)) + '</span>' +
        '</div>';
    }).join('') +
    '<p class="dp-plan-note">Totals shown exclude VAT and any optional extras.</p>';
  }

  /* ---------------- Use this design ---------------- */
  /* Creates a project permanently bound to this theme (§3, §9) and moves the
     customer on to plan selection. */
  function useDesign() {
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

  document.getElementById('use-design').addEventListener('click', useDesign);
  document.getElementById('demo-use').addEventListener('click', useDesign);

  /* ---------------- Live demo ---------------- */
  var overlay = document.getElementById('demo-overlay');
  var stage = document.getElementById('demo-stage');
  var lastFocus = null;

  function openDemo() {
    if (!overlay || !stage) return;
    stage.innerHTML = '';
    try {
      var state = window.EVER_siteDefaults(tpl.id);
      stage.appendChild(window.EVER_renderSite(state, tpl, { demo: true }));
      if (window.EVER_tickCountdowns) window.EVER_tickCountdowns(stage);
    } catch (e) {
      stage.innerHTML = '<p class="demo-error">This demo could not be loaded. ' +
        'The design itself is unaffected — try “Use this design”.</p>';
    }
    document.getElementById('demo-bar-name').textContent = tpl.name + ' — live demo';
    lastFocus = document.activeElement;
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    overlay.querySelector('.demo-close').focus();
  }

  function closeDemo() {
    if (!overlay) return;
    overlay.hidden = true;
    stage.innerHTML = '';
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.getElementById('live-demo').addEventListener('click', openDemo);
  overlay.querySelector('.demo-close').addEventListener('click', closeDemo);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !overlay.hidden) closeDemo();
  });

  /* Viewport switch — the stage is width-constrained, not scaled, so the
     design's own responsive rules do the work. */
  Array.prototype.forEach.call(overlay.querySelectorAll('.vp-btn'), function (btn) {
    btn.addEventListener('click', function () {
      Array.prototype.forEach.call(overlay.querySelectorAll('.vp-btn'), function (b) {
        b.classList.toggle('on', b === btn);
      });
      stage.setAttribute('data-vp', btn.getAttribute('data-vp'));
    });
  });
})();

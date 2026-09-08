/* ==========================================================================
   Invitara — plan selection (?p=<projectId>)
   The customer's design is already fixed; here they pick the plan and any
   extras. Every price on the page comes from EVER_C.quote(), so the summary
   can never disagree with checkout.
   ========================================================================== */
(function () {
  'use strict';

  var C = window.EVER_C;
  if (!C) return;

  var esc = window.EVER_esc;

  function param(name) {
    var m = new RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : '';
  }

  /* Fall back to the active project so a refresh without the query string
     still works. */
  var project = C.findProject(param('p')) || C.activeProject();
  if (!project) {
    window.location.replace('create.html');
    return;
  }
  C.setActive(project.id);

  var tpl = window.EVER_findTemplate(project.themeId);
  var meta = C.themeCommerce(project.themeId);
  var EVENTS = window.EVER_EVENTS || {};

  /* Only plans this design supports; keep any earlier choice if still valid. */
  var chosenPlan = meta.plans.indexOf(project.plan) !== -1 ? project.plan : meta.plans[0];
  var chosenAddons = (project.addons || []).slice();

  /* ---------------- Header copy ---------------- */
  document.getElementById('pp-theme').textContent = tpl.name;
  document.getElementById('pp-name').textContent = tpl.name;
  document.getElementById('pp-meta').textContent =
    ((EVENTS[tpl.event] && EVENTS[tpl.event].label) || 'Event') + ' · ' + meta.style;

  var previewBox = document.getElementById('pp-preview');
  if (previewBox && window.EVER_renderSiteMini) {
    try { previewBox.appendChild(window.EVER_renderSiteMini(tpl, null, { short: true })); }
    catch (e) { /* preview is decorative */ }
  }

  /* ---------------- Plan choices ---------------- */
  var planBox = document.getElementById('pp-plans');

  function renderPlans() {
    planBox.innerHTML = '';
    meta.plans.forEach(function (id) {
      var plan = C.findPlan(id);
      var on = id === chosenPlan;
      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'pp-plan' + (on ? ' on' : '');
      card.setAttribute('role', 'radio');
      card.setAttribute('aria-checked', on ? 'true' : 'false');
      card.innerHTML =
        '<span class="pp-plan-head">' +
        '<span class="pp-plan-name">' + esc(plan.name) + '</span>' +
        '<span class="pp-plan-price">' + esc(C.money(plan.price)) + '</span>' +
        '</span>' +
        '<span class="pp-plan-tag">' + esc(plan.tagline) + '</span>' +
        '<span class="pp-plan-editor">' + esc(plan.editorLevel) + ' editor access</span>' +
        '<ul>' + plan.includes.slice(0, 5).map(function (l) {
          return '<li>' + esc(l) + '</li>';
        }).join('') + '</ul>';
      card.addEventListener('click', function () {
        chosenPlan = id;
        /* Drop extras the new plan cannot use. */
        var allowed = C.addonsFor(chosenPlan).map(function (a) { return a.id; });
        chosenAddons = chosenAddons.filter(function (a) { return allowed.indexOf(a) !== -1; });
        renderPlans();
        renderAddons();
        renderSummary();
      });
      planBox.appendChild(card);
    });
  }

  /* ---------------- Add-ons ---------------- */
  var addonBox = document.getElementById('pp-addons');

  function renderAddons() {
    addonBox.innerHTML = '';
    var available = C.addonsFor(chosenPlan);
    if (!available.length) {
      addonBox.innerHTML = '<p class="pp-addons-none">' +
        'Everything is already included in the Advanced plan.</p>';
      return;
    }
    available.forEach(function (a) {
      var locked = C.planRank(chosenPlan) < C.planRank(a.needs);
      var on = chosenAddons.indexOf(a.id) !== -1;
      var row = document.createElement('label');
      row.className = 'pp-addon' + (locked ? ' locked' : '');
      row.innerHTML =
        '<input type="checkbox"' + (on ? ' checked' : '') +
        (locked ? ' disabled' : '') + ' value="' + esc(a.id) + '" />' +
        '<span class="pp-addon-body">' +
        '<span class="pp-addon-name">' + esc(a.name) +
        (locked ? ' <span class="lock-pill">🔒 ' + esc(C.findPlan(a.needs).name) + '</span>' : '') +
        '</span>' +
        '<span class="pp-addon-note">' + esc(a.note) + '</span>' +
        '</span>' +
        '<span class="pp-addon-price">+' + esc(C.money(a.price)) + '</span>';

      var input = row.querySelector('input');
      input.addEventListener('change', function () {
        if (input.checked) {
          if (chosenAddons.indexOf(a.id) === -1) chosenAddons.push(a.id);
        } else {
          chosenAddons = chosenAddons.filter(function (x) { return x !== a.id; });
        }
        renderSummary();
      });
      addonBox.appendChild(row);
    });
  }

  /* ---------------- Live price summary (§50) ---------------- */
  function renderSummary() {
    var q = C.quote({ themeId: project.themeId, plan: chosenPlan, addons: chosenAddons });

    document.getElementById('pp-lines').innerHTML =
      q.lines.map(function (l) {
        return '<li><span>' + esc(l.label) +
          '<em>' + esc(l.detail) + '</em></span>' +
          '<span>' + esc(C.money(l.amount)) + '</span></li>';
      }).join('') +
      '<li class="pl-sub"><span>Subtotal</span><span>' + esc(C.money(q.subtotal)) + '</span></li>' +
      '<li class="pl-vat"><span>VAT (' + Math.round(q.vatRate * 100) + '%)</span>' +
      '<span>' + esc(C.money(q.vat)) + '</span></li>';

    document.getElementById('pp-total').textContent = C.money(q.total);
  }

  /* ---------------- Comparison matrix (collapsed) ---------------- */
  var table = document.getElementById('matrix');
  if (table) {
    function cell(v) {
      if (v === 'Yes') return '<td><span class="mx-yes">✓</span></td>';
      if (v === '—') return '<td><span class="mx-no">—</span></td>';
      return '<td><span class="mx-part">' + esc(v) + '</span></td>';
    }
    table.innerHTML =
      '<thead><tr><th scope="col">Feature</th>' +
      C.PLANS.map(function (p) { return '<th scope="col">' + esc(p.name) + '</th>'; }).join('') +
      '</tr></thead><tbody>' +
      C.MATRIX.map(function (r) {
        return '<tr><th scope="row">' + esc(r.label) + '</th>' +
          cell(r.basic) + cell(r.pro) + cell(r.advanced) + '</tr>';
      }).join('') + '</tbody>';
  }

  /* ---------------- Continue ---------------- */
  document.getElementById('pp-continue').addEventListener('click', function () {
    var q = C.quote({ themeId: project.themeId, plan: chosenPlan, addons: chosenAddons });
    C.updateProject(project.id, {
      plan: chosenPlan,
      addons: chosenAddons,
      customizationPrice: q.customization
    });
    if (project.status === 'DESIGN_SELECTED') C.setStatus(project.id, 'PLAN_SELECTED');
    C.setStatus(project.id, 'CUSTOMIZING');
    C.openProject(project.id);
    window.location.href = 'editor.html';
  });

  renderPlans();
  renderAddons();
  renderSummary();
})();

/* ==========================================================================
   Invitara — pricing page
   Renders the three plan cards, the feature comparison matrix and the
   optional add-ons, all from the single definitions in commerce.js so the
   page can never drift from what the editor actually enforces.
   ========================================================================== */
(function () {
  'use strict';

  var C = window.EVER_C;
  if (!C) return;

  var esc = window.EVER_esc;

  /* ---------------- Plan cards ---------------- */
  function planCard(plan) {
    var card = document.createElement('article');
    card.className = 'plan-card' + (plan.popular ? ' plan-card-popular' : '');

    var includes = plan.includes.map(function (line) {
      return '<li>' + esc(line) + '</li>';
    }).join('');

    card.innerHTML =
      (plan.popular ? '<span class="plan-flag">Most chosen</span>' : '') +
      '<h3 class="plan-name">' + esc(plan.name) + '</h3>' +
      '<p class="plan-tagline">' + esc(plan.tagline) + '</p>' +
      '<p class="plan-price"><span class="plan-cur">' + esc(C.CURRENCY) + '</span>' +
      '<span class="plan-amt">' + plan.price + '</span><span class="plan-plus">+</span></p>' +
      '<p class="plan-price-note">plus the design price</p>' +
      '<p class="plan-editor">Editor access: <strong>' + esc(plan.editorLevel) + '</strong></p>' +
      '<ul class="plan-list">' + includes + '</ul>' +
      '<a class="btn ' + (plan.popular ? 'btn-primary' : 'btn-ghost') +
      ' btn-block" href="create.html">Choose a design</a>';

    return card;
  }

  var grid = document.getElementById('plan-grid');
  if (grid) {
    C.PLANS.forEach(function (p) { grid.appendChild(planCard(p)); });
  }

  /* ---------------- Comparison matrix ---------------- */
  /* "Yes" renders as a tick, "—" as a muted dash, anything else as its own
     word ("Limited", "Advanced"), matching the spec's table. */
  function cell(value) {
    if (value === 'Yes') return '<td><span class="mx-yes" aria-label="Included">✓</span></td>';
    if (value === '—')  return '<td><span class="mx-no" aria-label="Not included">—</span></td>';
    return '<td><span class="mx-part">' + esc(value) + '</span></td>';
  }

  var table = document.getElementById('matrix');
  if (table) {
    var head =
      '<thead><tr><th scope="col">Feature</th>' +
      C.PLANS.map(function (p) {
        return '<th scope="col">' + esc(p.name) +
          '<span class="mx-price">' + esc(C.money(p.price)) + '+</span></th>';
      }).join('') +
      '</tr></thead>';

    var body = '<tbody>' + C.MATRIX.map(function (row) {
      return '<tr><th scope="row">' + esc(row.label) + '</th>' +
        cell(row.basic) + cell(row.pro) + cell(row.advanced) + '</tr>';
    }).join('') + '</tbody>';

    table.innerHTML = head + body;
  }

  /* ---------------- Add-ons ---------------- */
  var addonGrid = document.getElementById('addon-grid');
  if (addonGrid) {
    C.ADDONS.forEach(function (a) {
      var el = document.createElement('div');
      el.className = 'addon-card';
      el.innerHTML =
        '<h3>' + esc(a.name) + '</h3>' +
        '<p class="addon-price">' + esc(C.money(a.price)) + '</p>' +
        '<p>' + esc(a.note) + '</p>' +
        '<p class="addon-needs">Requires the ' +
        esc(C.findPlan(a.needs).name) + ' plan or above</p>';
      addonGrid.appendChild(el);
    });
  }
})();

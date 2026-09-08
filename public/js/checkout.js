/* ==========================================================================
   Invitara — checkout (step 4)
   Itemised order summary from EVER_C.quote(), card validation, and a
   simulated payment that records a real order and advances the project's
   state through PAYMENT_PENDING -> PAID.

   Card data is never persisted — not to localStorage, not to a cookie, not
   anywhere. Only the resulting order record survives, and it holds amounts
   only. See docs/DEPLOY.md §5 for wiring a real payment provider.
   ========================================================================== */
(function () {
  'use strict';

  var C = window.EVER_C;
  var form = document.getElementById('pay-form');
  var successView = document.getElementById('pay-success');
  var payBtn = document.getElementById('pay-btn');

  if (!C) return;

  function param(name) {
    var m = new RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : '';
  }

  /* ---------- The project being paid for ---------- */
  var project = C.findProject(param('p')) || C.activeProject();
  if (!project) {
    window.location.replace('create.html');
    return;
  }
  if (!project.plan) {
    /* Arrived without choosing a plan — that step owns the decision. */
    window.location.replace('plan.html?p=' + encodeURIComponent(project.id));
    return;
  }
  /* Already paid: nothing to buy twice (§57 duplicate-payment protection). */
  if (C.isPaid(project)) {
    window.location.replace('dashboard.html');
    return;
  }
  C.setActive(project.id);

  var tpl = window.EVER_findTemplate(project.themeId);
  var meta = C.themeCommerce(project.themeId);
  var quote = C.quote({
    themeId: project.themeId,
    plan: project.plan,
    addons: project.addons
  });

  /* ---------- Order summary ---------- */
  var esc = window.EVER_esc;

  var previewBox = document.getElementById('summary-preview');
  if (previewBox && tpl) {
    previewBox.innerHTML = '';
    try {
      previewBox.appendChild(
        window.EVER_renderSiteMini(tpl, project.state || null, { short: true })
      );
    } catch (e) { /* preview is decorative */ }
  }

  var nameEl = document.getElementById('summary-design-name');
  if (nameEl && tpl) nameEl.textContent = tpl.name;

  var metaEl = document.getElementById('summary-design-meta');
  if (metaEl && tpl) {
    var EVENTS = window.EVER_EVENTS || {};
    metaEl.textContent =
      ((EVENTS[tpl.event] && EVENTS[tpl.event].label) || 'Event') +
      ' · ' + meta.style + ' · ' + C.findPlan(project.plan).name + ' plan';
  }

  var linesEl = document.getElementById('summary-lines');
  if (linesEl) {
    linesEl.innerHTML =
      quote.lines.map(function (l) {
        return '<li><span>' + esc(l.label) + '<em>' + esc(l.detail) + '</em></span>' +
          '<span>' + esc(C.money(l.amount)) + '</span></li>';
      }).join('') +
      '<li class="pl-sub"><span>Subtotal</span><span>' + esc(C.money(quote.subtotal)) + '</span></li>' +
      (quote.discount
        ? '<li class="pl-disc"><span>Discount</span><span>−' + esc(C.money(quote.discount)) + '</span></li>'
        : '') +
      '<li class="pl-vat"><span>VAT (' + Math.round(quote.vatRate * 100) + '%)</span>' +
      '<span>' + esc(C.money(quote.vat)) + '</span></li>';
  }

  var totalEl = document.getElementById('summary-total');
  if (totalEl) totalEl.textContent = C.money(quote.total);

  var btnLabel = payBtn && payBtn.querySelector('.pay-btn-label');
  if (btnLabel) btnLabel.textContent = 'Pay ' + C.money(quote.total) + ' & create invitation';

  /* ---------- Input formatting ---------- */
  var cardInput = document.getElementById('pay-card');
  var expInput = document.getElementById('pay-exp');
  var cvcInput = document.getElementById('pay-cvc');

  if (cardInput) {
    cardInput.addEventListener('input', function () {
      var digits = cardInput.value.replace(/\D/g, '').slice(0, 16);
      cardInput.value = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    });
  }
  if (expInput) {
    expInput.addEventListener('input', function () {
      var d = expInput.value.replace(/\D/g, '').slice(0, 4);
      expInput.value = d.length > 2 ? d.slice(0, 2) + ' / ' + d.slice(2) : d;
    });
  }
  if (cvcInput) {
    cvcInput.addEventListener('input', function () {
      cvcInput.value = cvcInput.value.replace(/\D/g, '').slice(0, 4);
    });
  }

  /* ---------- Validation ---------- */
  /* Luhn checksum (industry-standard card digit validation) */
  function luhnOk(num) {
    if (!/^\d{13,16}$/.test(num)) return false;
    var sum = 0, alt = false;
    for (var i = num.length - 1; i >= 0; i--) {
      var d = parseInt(num.charAt(i), 10);
      if (alt) { d *= 2; if (d > 9) d -= 9; }
      sum += d;
      alt = !alt;
    }
    return sum % 10 === 0;
  }

  function setError(id, msg) {
    var input = document.getElementById(id);
    var err = input.closest('.pfield').querySelector('.perror');
    if (err) {
      err.textContent = msg;
      err.hidden = !msg;
    }
    if (input) input.closest('.pfield').classList.toggle('invalid', !!msg);
    return !msg;
  }

  function validate() {
    var email = document.getElementById('pay-email').value.trim();
    var name = document.getElementById('pay-name').value.trim();
    var card = cardInput.value.replace(/\s/g, '');
    var exp = expInput.value.replace(/\D/g, '');
    var cvc = cvcInput.value;

    var ok = true;
    ok = setError('pay-email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '' : 'Enter a valid e-mail address.') && ok;
    ok = setError('pay-name', name ? '' : 'Enter the name on the card.') && ok;
    ok = setError('pay-card', luhnOk(card) ? '' : 'Enter a valid card number (Luhn check).') && ok;

    var expOk = false;
    if (exp.length === 4) {
      var mm = parseInt(exp.slice(0, 2), 10);
      var yy = parseInt(exp.slice(2), 10) + 2000;
      var now = new Date();
      expOk = mm >= 1 && mm <= 12 &&
        (yy > now.getFullYear() || (yy === now.getFullYear() && mm >= now.getMonth() + 1));
    }
    ok = setError('pay-exp', expOk ? '' : 'Use a future MM / YY date.') && ok;
    ok = setError('pay-cvc', /^\d{3,4}$/.test(cvc) ? '' : '3–4 digits.') && ok;

    return ok;
  }

  ['pay-email', 'pay-name', 'pay-card', 'pay-exp', 'pay-cvc'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('input', function () { setError(id, ''); });
  });

  /* ---------- Submit (simulated) ---------- */
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate()) return;

      payBtn.classList.add('loading');
      payBtn.disabled = true;
      if (btnLabel) btnLabel.textContent = 'Processing…';

      /* Make sure the editor's latest work is on the project before it is
         locked in as paid. */
      C.syncActiveState();
      if (project.status === 'CUSTOMIZING') C.setStatus(project.id, 'READY_FOR_PAYMENT');

      setTimeout(function () {
        var order = C.createOrder(project.id, quote);
        if (!order) {
          payBtn.classList.remove('loading');
          payBtn.disabled = false;
          if (btnLabel) btnLabel.textContent = 'Try payment again';
          if (window.everToast) {
            window.everToast('That payment could not be completed. Please try again.');
          }
          return;
        }

        var msg = document.getElementById('pay-success-msg');
        if (msg) {
          msg.innerHTML = 'Your order <b>' + esc(order.number) + '</b> is confirmed — ' +
            esc(C.money(order.total)) + ' paid.';
        }
        form.hidden = true;
        successView.hidden = false;
        window.scrollTo({ top: 0, behavior: 'smooth' });

        setTimeout(function () {
          window.location.href = 'editor.html';
        }, 1600);
      }, 1500);
    });
  }
})();

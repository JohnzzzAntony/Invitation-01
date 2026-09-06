/* ==========================================================================
   Ever RSVP — checkout page (step 2): validation + simulated payment
   ========================================================================== */
(function () {
  'use strict';

  var FLOW_KEY = 'ever-rsvp-flow';
  var form = document.getElementById('pay-form');
  var successView = document.getElementById('pay-success');
  var payBtn = document.getElementById('pay-btn');

  function readFlow() {
    try { return JSON.parse(localStorage.getItem(FLOW_KEY) || '{}'); }
    catch (e) { return {}; }
  }

  function writeFlow(flow) {
    try { localStorage.setItem(FLOW_KEY, JSON.stringify(flow)); } catch (e) { /* ignore */ }
  }

  function findTpl(id) {
    if (window.EVER_findTemplate) return window.EVER_findTemplate(id);
    var list = window.EVER_TEMPLATES || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return list[0];
  }

  /* ---------- Order summary ---------- */
  var flow = readFlow();
  if (!flow.design) {
    /* Arrived without picking a design — send them to step 1 */
    window.location.href = 'create.html';
    return;
  }
  var tpl = findTpl(flow.design);

  var previewBox = document.getElementById('summary-preview');
  if (previewBox && window.renderSiteMini) {
    previewBox.appendChild(window.renderSiteMini(tpl, null, { short: true }));
  }
  var nameEl = document.getElementById('summary-design-name');
  if (nameEl) nameEl.textContent = '“' + tpl.name + '” event website';

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
    var err = input.parentElement.querySelector('.perror') || input.closest('.pfield').querySelector('.perror');
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
      var label = payBtn.querySelector('.pay-btn-label');
      if (label) label.textContent = 'Processing…';

      setTimeout(function () {
        /* Privacy by design: only the order number is persisted — card data is
           never written to localStorage, cookies or any server. */
        var order = 'EV-' + String(Math.floor(100000 + Math.random() * 900000));
        flow.paid = true;
        flow.order = order;
        flow.paidAt = new Date().toISOString();
        writeFlow(flow);

        var msg = document.getElementById('pay-success-msg');
        if (msg) msg.innerHTML = 'Your order <b>' + order + '</b> is confirmed.';
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

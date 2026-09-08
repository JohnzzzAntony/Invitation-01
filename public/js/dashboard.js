/* ==========================================================================
   Ever RSVP — customer dashboard
   Project cards (edit / preview / share) and the billing & orders list.
   Everything is read through commerce.js; this file only renders.
   ========================================================================== */
(function () {
  'use strict';

  var C = window.EVER_C;
  if (!C) return;

  var esc = window.EVER_esc;

  /* Customer-facing wording for the internal state machine (§32). */
  var STATUS_LABEL = {
    DRAFT: 'Draft',
    DESIGN_SELECTED: 'Design chosen',
    PLAN_SELECTED: 'Plan chosen',
    CUSTOMIZING: 'In progress',
    READY_FOR_PAYMENT: 'Ready to pay',
    PAYMENT_PENDING: 'Payment processing',
    PAYMENT_FAILED: 'Payment failed',
    RETRY_PAYMENT: 'Retry payment',
    PAID: 'Paid',
    READY_TO_PUBLISH: 'Ready to publish',
    PUBLISHED: 'Published',
    ARCHIVED: 'Archived'
  };

  function statusTone(status) {
    if (status === 'PUBLISHED') return 'ok';
    if (status === 'PAYMENT_FAILED') return 'bad';
    if (C.isPaid({ status: status })) return 'ok';
    return 'wait';
  }

  function fmtDate(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d)) return '';
    return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  }

  /* The event date the customer typed, not the project's creation date. */
  function eventDate(project) {
    var b = (project.state && project.state.basics) || {};
    if (!b.date) return 'Date not set';
    var d = new Date(b.date + 'T00:00:00');
    if (isNaN(d)) return 'Date not set';
    return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function eventName(project) {
    var b = (project.state && project.state.basics) || {};
    if (b.nameA && b.nameB) return b.nameA + ' & ' + b.nameB;
    return b.title || b.nameA || project.themeName;
  }

  /* ---------------- Project cards ---------------- */
  var grid = document.getElementById('project-grid');
  var projectEmpty = document.getElementById('project-empty');

  function projectCard(p) {
    var tpl = window.EVER_findTemplate(p.themeId);
    var plan = p.plan ? C.findPlan(p.plan) : null;
    var EVENTS = window.EVER_EVENTS || {};
    var evLabel = (tpl && EVENTS[tpl.event] && EVENTS[tpl.event].label) || 'Event';

    var card = document.createElement('article');
    card.className = 'dash-card';

    var preview = document.createElement('div');
    preview.className = 'dash-card-preview';
    try {
      if (tpl && window.EVER_renderSiteMini) {
        preview.appendChild(window.EVER_renderSiteMini(tpl, p.state || null, { short: true }));
      }
    } catch (e) { /* a broken preview must not hide the card's actions */ }

    var body = document.createElement('div');
    body.className = 'dash-card-body';
    body.innerHTML =
      '<h3>' + esc(eventName(p)) + '</h3>' +
      '<p class="dash-card-meta">' + esc(evLabel) + ' · ' + esc(eventDate(p)) + '</p>' +
      '<p class="dash-card-theme">' + esc(p.themeName) +
      (plan ? ' · ' + esc(plan.name) + ' plan' : '') + '</p>' +
      '<span class="dash-status dash-status-' + statusTone(p.status) + '">' +
      esc(STATUS_LABEL[p.status] || p.status) + '</span>';

    var actions = document.createElement('div');
    actions.className = 'dash-card-actions';

    var editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'btn btn-ghost btn-sm';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', function () {
      C.openProject(p.id);
      window.location.href = 'editor.html';
    });

    var previewBtn = document.createElement('button');
    previewBtn.type = 'button';
    previewBtn.className = 'btn btn-ghost btn-sm';
    previewBtn.textContent = 'Preview';
    previewBtn.addEventListener('click', function () {
      C.openProject(p.id);
      window.location.href = 'editor.html#preview';
    });

    actions.appendChild(editBtn);
    actions.appendChild(previewBtn);

    /* One primary action per state: pay, publish, or share. */
    if (p.published) {
      var shareBtn = document.createElement('button');
      shareBtn.type = 'button';
      shareBtn.className = 'btn btn-primary btn-sm';
      shareBtn.textContent = 'Share';
      shareBtn.addEventListener('click', function () { openShare(p); });
      actions.appendChild(shareBtn);
    } else if (C.isPaid(p)) {
      var pubBtn = document.createElement('button');
      pubBtn.type = 'button';
      pubBtn.className = 'btn btn-primary btn-sm';
      pubBtn.textContent = 'Publish';
      pubBtn.addEventListener('click', function () {
        /* Publishing runs the editor's checklist, so send them there rather
           than publishing blind from a card. */
        C.openProject(p.id);
        window.location.href = 'editor.html#publish';
      });
      actions.appendChild(pubBtn);
    } else {
      var payBtn = document.createElement('a');
      payBtn.className = 'btn btn-primary btn-sm';
      payBtn.href = 'checkout.html?p=' + encodeURIComponent(p.id);
      payBtn.textContent = 'Checkout';
      actions.appendChild(payBtn);
    }

    var del = document.createElement('button');
    del.type = 'button';
    del.className = 'dash-del';
    del.setAttribute('aria-label', 'Delete this invitation');
    del.innerHTML = '&times;';
    del.addEventListener('click', function () {
      if (!window.confirm('Delete “' + eventName(p) + '”? This cannot be undone.')) return;
      C.deleteProject(p.id);
      if (window.everToast) window.everToast('Invitation deleted.');
      renderProjects();
    });

    body.appendChild(actions);
    card.appendChild(preview);
    card.appendChild(body);
    card.appendChild(del);
    return card;
  }

  function renderProjects() {
    var list = C.allProjects();
    grid.innerHTML = '';
    list.forEach(function (p) { grid.appendChild(projectCard(p)); });
    if (projectEmpty) projectEmpty.hidden = list.length > 0;
  }

  /* ---------------- Orders ---------------- */
  function renderOrders() {
    var list = C.allOrders();
    var box = document.getElementById('order-list');
    var empty = document.getElementById('order-empty');
    box.innerHTML = '';

    list.forEach(function (o) {
      var plan = o.plan ? C.findPlan(o.plan) : null;
      var addonLines = (o.addons || []).map(function (id) {
        var a = C.findAddon(id);
        return a ? '<li><span>' + esc(a.name) + '</span><span>' +
          esc(C.money(a.price)) + '</span></li>' : '';
      }).join('');

      var el = document.createElement('article');
      el.className = 'order-card';
      el.innerHTML =
        '<div class="order-head">' +
        '<div><h3>Order ' + esc(o.number) + '</h3>' +
        '<p>' + esc(fmtDate(o.paidAt)) + '</p></div>' +
        '<span class="order-status">' + esc(o.status) + '</span>' +
        '</div>' +
        '<ul class="order-lines">' +
        '<li><span>' + esc(o.themeName) + '<em>Design</em></span><span>' +
        esc(C.money(o.themePrice)) + '</span></li>' +
        (plan ? '<li><span>' + esc(plan.name) + ' plan<em>Plan</em></span><span>' +
          esc(C.money(o.planPrice)) + '</span></li>' : '') +
        addonLines +
        (o.discount ? '<li class="ol-disc"><span>Discount</span><span>−' +
          esc(C.money(o.discount)) + '</span></li>' : '') +
        '<li class="ol-vat"><span>VAT</span><span>' + esc(C.money(o.vat)) + '</span></li>' +
        '</ul>' +
        '<div class="order-total"><span>Total paid</span><strong>' +
        esc(C.money(o.total)) + '</strong></div>';
      box.appendChild(el);
    });

    if (empty) empty.hidden = list.length > 0;
  }

  /* ---------------- Share sheet ---------------- */
  var shareModal = document.getElementById('share-modal');
  var shareInput = document.getElementById('share-input');

  function openShare(p) {
    var url = C.inviteUrl(p);
    shareInput.value = url;

    var text = 'You are invited — ' + eventName(p);
    document.getElementById('share-wa').href =
      'https://wa.me/?text=' + encodeURIComponent(text + '\n' + url);
    document.getElementById('share-mail').href =
      'mailto:?subject=' + encodeURIComponent(text) +
      '&body=' + encodeURIComponent(text + '\n\n' + url);
    document.getElementById('share-open').href = url;

    var native = document.getElementById('share-native');
    if (navigator.share) {
      native.hidden = false;
      native.onclick = function () {
        navigator.share({ title: text, url: url }).catch(function () { /* dismissed */ });
      };
    }

    shareModal.hidden = false;
    document.body.style.overflow = 'hidden';
    shareModal.querySelector('.modal-close').focus();
  }

  function closeShare() {
    shareModal.hidden = true;
    document.body.style.overflow = '';
  }

  shareModal.querySelector('.modal-close').addEventListener('click', closeShare);
  shareModal.addEventListener('click', function (e) {
    if (e.target === shareModal) closeShare();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !shareModal.hidden) closeShare();
  });

  document.getElementById('share-copy').addEventListener('click', function () {
    shareInput.select();
    var done = function () {
      if (window.everToast) window.everToast('Link copied.');
    };
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareInput.value).then(done, function () {
        document.execCommand('copy'); done();
      });
    } else {
      document.execCommand('copy');
      done();
    }
  });

  /* ---------------- Tabs ---------------- */
  Array.prototype.forEach.call(document.querySelectorAll('.dash-tab'), function (tab) {
    tab.addEventListener('click', function () {
      var name = tab.getAttribute('data-tab');
      Array.prototype.forEach.call(document.querySelectorAll('.dash-tab'), function (t) {
        var on = t === tab;
        t.classList.toggle('on', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      document.getElementById('panel-invites').hidden = name !== 'invites';
      document.getElementById('panel-billing').hidden = name !== 'billing';
    });
  });

  renderProjects();
  renderOrders();
})();

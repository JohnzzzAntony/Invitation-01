/* ==========================================================================
   Ever RSVP — homepage "Pick a design" (§7)

   Deliberately light: the landing page loads templates.js + commerce.js only,
   NOT the ten layout modules or the 850 KB Muhibbi stylesheet. Each card
   paints its own preview from the theme's five colours and display font,
   which is enough to judge a design at thumbnail size and keeps the
   homepage's first load fast (§42). The full layout render lives one click
   away on design.html.
   ========================================================================== */
(function () {
  'use strict';

  var C = window.EVER_C;
  var grid = document.getElementById('pick-grid');
  var chipBox = document.getElementById('pick-chips');
  if (!C || !grid || !window.EVER_THEMES) return;

  var esc = window.EVER_esc;
  var EVENTS = window.EVER_EVENTS || {};
  var THEMES = window.EVER_THEMES;

  var PER_VIEW = 6;
  var current = 'all';

  var FONT_STACK = {
    derivia: '"Derivia","Cormorant Garamond",serif',
    corm: '"Cormorant Garamond",serif',
    pfd: '"Playfair Display",serif',
    cinzel: '"Cinzel",serif',
    vibes: '"Great Vibes",cursive',
    paris: '"Parisienne",cursive',
    jost: '"Jost",sans-serif',
    baloo: '"Baloo 2",cursive',
    pacifico: '"Pacifico",cursive'
  };

  /* A miniature of the invitation: theme background, rule, names in the
     theme's display face, accent underline. No layout code required. */
  function preview(tpl) {
    var basics = (tpl.content && tpl.content.basics) || {};
    var nameA = basics.nameA || tpl.name;
    var nameB = basics.nameB || '';
    var font = FONT_STACK[tpl.nameFont] || FONT_STACK.corm;

    return '<div class="pk-preview" style="background:' + esc(tpl.bg) +
      ';color:' + esc(tpl.ink) + '" aria-hidden="true">' +
      '<span class="pk-rule" style="background:' + esc(tpl.gold) + '"></span>' +
      '<span class="pk-names" style="font-family:' + font + '">' +
      esc(nameA) + (nameB ? '<em style="color:' + esc(tpl.gold) + '">&amp;</em>' + esc(nameB) : '') +
      '</span>' +
      '<span class="pk-sub" style="color:' + esc(tpl.gold) + '">' +
      esc(((EVENTS[tpl.event] && EVENTS[tpl.event].label) || 'Event').toUpperCase()) +
      '</span>' +
      '<span class="pk-rule" style="background:' + esc(tpl.gold) + '"></span>' +
      '</div>';
  }

  function card(tpl) {
    var meta = C.themeCommerce(tpl);
    var el = document.createElement('article');
    el.className = 'pk-card reveal in';
    el.innerHTML =
      preview(tpl) +
      '<div class="pk-body">' +
      '<h3>' + esc(tpl.name) + '</h3>' +
      '<p class="pk-meta">' +
      esc((EVENTS[tpl.event] && EVENTS[tpl.event].label) || 'Event') +
      ' &middot; ' + esc(meta.style) + '</p>' +
      '<p class="pk-price">From <strong>' + esc(C.money(C.startingPrice(tpl))) + '</strong></p>' +
      '<p class="pk-plan">' +
      esc(meta.plans.map(function (id) { return C.findPlan(id).name; }).join(' · ')) +
      ' &middot; up to ' + esc(C.findPlan(meta.editorLevel).editorLevel.toLowerCase()) +
      ' editing</p>' +
      '<div class="pk-actions">' +
      '<a class="btn btn-ghost btn-sm" href="design.html?id=' + encodeURIComponent(tpl.id) + '">View design</a>' +
      '<button class="btn btn-primary btn-sm" type="button">Use design</button>' +
      '</div></div>';

    el.querySelector('button').addEventListener('click', function () {
      var project = C.createProject(tpl.id);
      if (!project) {
        if (window.everToast) window.everToast('Could not start an invitation — please try again.');
        return;
      }
      if (window.everToast) window.everToast('“' + tpl.name + '” selected — choose your plan.');
      setTimeout(function () {
        window.location.href = 'plan.html?p=' + encodeURIComponent(project.id);
      }, 450);
    });

    return el;
  }

  function render() {
    var list = THEMES.filter(function (t) {
      return current === 'all' || (t.event || 'wedding') === current;
    }).slice(0, PER_VIEW);

    grid.innerHTML = '';
    list.forEach(function (t) { grid.appendChild(card(t)); });
  }

  function buildChips() {
    var defs = [{ ev: 'all', label: 'All' }];
    Object.keys(EVENTS).forEach(function (k) { defs.push({ ev: k, label: EVENTS[k].label }); });

    defs.forEach(function (d) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip' + (d.ev === current ? ' on' : '');
      b.setAttribute('aria-pressed', d.ev === current ? 'true' : 'false');
      b.textContent = d.label;
      b.addEventListener('click', function () {
        if (current === d.ev) return;
        current = d.ev;
        Array.prototype.forEach.call(chipBox.querySelectorAll('.chip'), function (c) {
          var on = c === b;
          c.classList.toggle('on', on);
          c.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        render();
      });
      chipBox.appendChild(b);
    });
  }

  buildChips();
  render();
})();

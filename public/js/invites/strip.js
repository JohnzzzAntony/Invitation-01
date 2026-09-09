/* ==========================================================================
   invites/strip.js — the 3D templates, as cards in the design gallery.

   Renders into #invite3d-grid wherever a page provides one (the homepage
   designs section and create.html both do). Reads the generated catalog.js,
   so this file never carries a copy of the template list.

   Each card is a flat CSS swatch built from the theme's two colours — not a
   live WebGL canvas. Five renderers on a gallery page would cost five GPU
   contexts and five render loops to show five thumbnails, which is exactly
   the sort of thing that made this page stutter in the first place. The
   motion lives on the template's own page, one scene at a time.
   ========================================================================== */
(function () {
  'use strict';

  var grid = document.getElementById('invite3d-grid');
  var list = window.INVITE_CATALOG;
  if (!grid || !list || !list.length) return;

  var esc = window.EVER_esc || function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };

  var html = list.map(function (t) {
    return '<a class="iv3-card" href="invitation-' + esc(t.slug) + '.html">' +
      '<span class="iv3-swatch" style="' +
        '--c: ' + esc(t.accent) + ';' +
        '--c2: ' + esc(t.accent2) + ';' +
        '--b: ' + esc(t.bg) + '" aria-hidden="true">' +
        '<span class="iv3-swatch-title">' + esc(t.title) + '</span>' +
        '<span class="iv3-swatch-rule"></span>' +
        '<span class="iv3-swatch-couple">' + esc(t.couple) + '</span>' +
      '</span>' +
      '<span class="iv3-body">' +
        '<span class="iv3-name">' + esc(t.name) + '</span>' +
        '<span class="iv3-blurb">' + esc(t.blurb) + '</span>' +
        '<span class="iv3-cta">View the design <span aria-hidden="true">&#8594;</span></span>' +
      '</span>' +
    '</a>';
  }).join('');

  grid.innerHTML = html;
})();

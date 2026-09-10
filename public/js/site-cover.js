/* ==========================================================================
   site-cover.js — the opt-in "tap to open" cover some designs carry.

   A theme in templates.js may opt in with `cover: true`. When one does,
   EVER_bindSite calls in here and a full-hero overlay is mounted with a
   single button; tapping it fades the cover away and reveals the design
   underneath. Designs without `cover` are untouched and cost nothing: this
   is pure DOM + CSS, no script is ever loaded on their behalf.

   Same mounting rule as site-scene.js: the hero is the one section every
   layout has, so that's where the cover lives. It sits above the scene
   canvas (if any) so a design can carry both a moving background and a
   tap-to-open cover, with the cover always on top until it's dismissed.
   ========================================================================== */
(function () {
  'use strict';

  function reducedMotion() {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) { return false; }
  }

  /* Best-effort label from the design's own content. Falls back to a plain
     "Tap to open" — a design that doesn't expose names yet still works. */
  function labelOf(root) {
    var basics = root.__wsData && root.__wsData.basics;
    if (basics) {
      var a = (basics.nameA || '').trim();
      var b = (basics.nameB || '').trim();
      if (a && b) return a + ' & ' + b;
      if (a) return a;
      if (basics.brand) return String(basics.brand).trim();
    }
    return '';
  }

  function open(cover, hero) {
    if (reducedMotion()) {
      if (cover.parentNode) cover.parentNode.removeChild(cover);
      return;
    }
    var done = false;
    function finish() {
      if (done) return;
      done = true;
      if (cover.parentNode) cover.parentNode.removeChild(cover);
    }
    cover.addEventListener('transitionend', finish);
    window.setTimeout(finish, 900); /* fallback if transitionend never fires */
    /* rAF so the class add is a genuine second frame, not coalesced with mount */
    window.requestAnimationFrame(function () {
      cover.classList.add('ws-cover--opening');
    });
  }

  function mount(root, hero, tpl) {
    var cover = document.createElement('div');
    cover.className = 'ws-cover';
    cover.setAttribute('aria-hidden', 'false');

    var label = labelOf(root);
    var inner = '<div class="ws-cover-inner">' +
        (label ? '<p class="ws-cover-label">' + String(label).replace(/[<>&]/g, function (c) {
          return c === '&' ? '&amp;' : (c === '<' ? '&lt;' : '&gt;');
        }) + '</p>' : '') +
        '<button type="button" class="ws-cover-btn theme-btn">Tap to open</button>' +
      '</div>';
    cover.innerHTML = inner;

    /* Last child so it stacks above the scene canvas (hero's first child)
       and above .ws-hero-inner content alike, without needing to fight
       z-index across every layout's own hero markup. */
    hero.appendChild(cover);

    var btn = cover.querySelector('.ws-cover-btn');
    if (btn) {
      btn.addEventListener('click', function () { open(cover, hero); });
    }
  }

  /**
   * Mount a design's tap-to-open cover, if it has one.
   * Called by EVER_bindSite, so it only ever runs for a full live render —
   * never for the miniatures in the design gallery, which must stay cheap.
   */
  function mountCover(root, tpl) {
    if (!root || !tpl || !tpl.cover) return;
    if (root.__wsCover) return;

    var hero = root.querySelector('#ws-sec-hero') || root.querySelector('.ws-hero');
    if (!hero) return;
    root.__wsCover = true;

    mount(root, hero, tpl);
  }

  window.EVER_mountCover = mountCover;
})();

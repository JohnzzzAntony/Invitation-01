/* ==========================================================================
   invites/shell.js — the parts every 3D invitation template shares

   A template page ships a palette, its words, and the name of a scene. This
   file owns everything else: the WebGL renderer and its single render loop,
   the loader, the countdown, the scroll reveals, the custom cursor and the
   RSVP form.

   Scene contract — a scene module registers itself:

       window.INVITE_SCENES.aurora = function (THREE, renderer, ctx) {
         ...build...
         return {
           frame:  function (t, mouse) {},   // called once per rAF tick
           resize: function (w, h) {},       // called on viewport change
           dispose: function () {}           // called on teardown (optional)
         };
       };

   `ctx` carries { width, height, reduced }. The scene never calls
   requestAnimationFrame, never adds a resize listener and never touches the
   DOM — one loop and one listener serve all five templates, and pausing or
   disabling motion is therefore a single decision made here.

   Plain browser JavaScript, no build step: see the note at the top of
   scripts/check-public-js.mjs.
   ========================================================================== */
(function () {
  'use strict';

  var cfg = window.INVITE_CONFIG || {};
  var doc = document;

  function $(sel) { return doc.querySelector(sel); }
  function $$(sel) { return Array.prototype.slice.call(doc.querySelectorAll(sel)); }

  var reduced = false;
  try {
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) { /* very old browser: treat as "motion is fine" */ }

  doc.documentElement.classList.add('iv-js');

  /* ------------------------------------------------------------------ *
   *  1. The WebGL layer                                                 *
   * ------------------------------------------------------------------ */
  /* Everything here is decorative. If WebGL is unavailable, the context is
     lost, or the named scene simply is not on the page, the invitation is
     still a complete, readable document — so every failure path is a quiet
     return, never a thrown error. */
  var scene3d = null;
  var renderer = null;
  var running = false;
  var rafId = 0;
  var mouse = { x: 0, y: 0 };

  /* Fill rate is what costs on the integrated GPUs most guests are on, and it
     scales with the square of this number: at devicePixelRatio 2 the renderer
     is shading four times the pixels of a 1x buffer for scenes that are all
     soft gradients and bokeh, where the extra samples are close to invisible.
     1.5 keeps the edges clean and cuts that by nearly half.

     A device that reports many cores is allowed the full 2 — the heuristic is
     crude, but it is the only signal a browser gives about how much machine
     is behind the canvas. */
  function pixelRatio() {
    var dpr = window.devicePixelRatio || 1;
    var cores = window.navigator.hardwareConcurrency || 4;
    return Math.min(dpr, cores >= 8 ? 2 : 1.5);
  }

  function startScene() {
    var canvas = doc.getElementById('iv-canvas');
    var factory = (window.INVITE_SCENES || {})[cfg.scene];

    if (!canvas || !factory || typeof window.THREE === 'undefined') return;

    try {
      renderer = new window.THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
    } catch (err) {
      return;                       /* no WebGL — the page reads fine without */
    }

    var w = window.innerWidth;
    var h = window.innerHeight;
    renderer.setPixelRatio(pixelRatio());
    renderer.setSize(w, h, false);

    try {
      scene3d = factory(window.THREE, renderer, { width: w, height: h, reduced: reduced });
    } catch (err) {
      renderer.dispose();
      renderer = null;
      return;
    }

    /* A lost context (GPU reset, laptop switching cards) otherwise leaves the
       loop spinning on a dead renderer. */
    canvas.addEventListener('webglcontextlost', function (ev) {
      ev.preventDefault();
      stopLoop();
    });
    canvas.addEventListener('webglcontextrestored', function () { startLoop(); });

    if (reduced) {
      /* Draw the scene once, so it is a still image rather than a blank
         canvas, and never animate it. */
      scene3d.frame(0, mouse);
      return;
    }
    startLoop();
  }

  var startTime = Date.now();

  function tick() {
    rafId = window.requestAnimationFrame(tick);
    if (!scene3d) return;
    scene3d.frame((Date.now() - startTime) / 1000, mouse);
  }

  function startLoop() {
    if (running || !scene3d || reduced) return;
    running = true;
    rafId = window.requestAnimationFrame(tick);
  }

  function stopLoop() {
    if (!running) return;
    running = false;
    window.cancelAnimationFrame(rafId);
  }

  /* A hidden tab should not be burning a GPU on falling petals. */
  doc.addEventListener('visibilitychange', function () {
    if (doc.hidden) stopLoop(); else startLoop();
  });

  var resizeTimer = 0;
  window.addEventListener('resize', function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      if (!renderer || !scene3d) return;
      var w = window.innerWidth;
      var h = window.innerHeight;
      renderer.setPixelRatio(pixelRatio());
      renderer.setSize(w, h, false);
      scene3d.resize(w, h);
      if (reduced) scene3d.frame(0, mouse);
    }, 150);
  });

  if (!reduced) {
    window.addEventListener('mousemove', function (ev) {
      mouse.x = (ev.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = (ev.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
  }

  /* ------------------------------------------------------------------ *
   *  2. Loader                                                          *
   * ------------------------------------------------------------------ */
  var loaderDone = false;

  function finishLoading() {
    if (loaderDone) return;
    loaderDone = true;

    var loader = doc.getElementById('iv-loader');
    if (loader) {
      loader.classList.add('is-done');
      window.setTimeout(function () { loader.style.display = 'none'; }, 700);
    }
    playIntro();
  }

  /* Whichever comes first: the load event, or a 2.5s cap so a slow CDN font
     can never leave a guest staring at a spinner. */
  window.addEventListener('load', finishLoading);
  window.setTimeout(finishLoading, 2500);

  /* ------------------------------------------------------------------ *
   *  3. Intro + scroll reveals                                          *
   * ------------------------------------------------------------------ */
  /* This used to be GSAP. The site's CSP is `script-src 'self'`, so no CDN
     library loads in production — and the whole of what GSAP was doing here
     is a staggered entrance and a scroll trigger, which are an animation
     delay and an IntersectionObserver. See invite3d.css, `.iv-intro`. */

  function showAll() {
    $$('.iv-reveal').forEach(function (el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }

  function playIntro() {
    /* Added after the loader clears, so the hero does not animate behind it. */
    doc.body.classList.add('iv-intro');
  }

  function bindReveals() {
    if (reduced || !('IntersectionObserver' in window)) { showAll(); return; }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.style.transition =
          'opacity .6s cubic-bezier(.4,0,.2,1), transform .6s cubic-bezier(.4,0,.2,1)';
        en.target.style.opacity = '1';
        en.target.style.transform = 'none';
        io.unobserve(en.target);
      });
    }, { threshold: 0.12 });

    $$('.iv-reveal').forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------------ *
   *  4. Countdown                                                       *
   * ------------------------------------------------------------------ */
  function initCountdown() {
    var box = $('.iv-count');
    if (!box || !cfg.date) return;

    var target = new Date(cfg.date).getTime();
    if (isNaN(target)) return;

    var out = {
      d: doc.getElementById('iv-d'), h: doc.getElementById('iv-h'),
      m: doc.getElementById('iv-m'), s: doc.getElementById('iv-s')
    };
    if (!out.d) return;

    function pad(n) { return n < 10 ? '0' + n : String(n); }

    function update() {
      var diff = Math.max(0, target - Date.now());
      out.d.textContent = pad(Math.floor(diff / 864e5));
      out.h.textContent = pad(Math.floor(diff % 864e5 / 36e5));
      out.m.textContent = pad(Math.floor(diff % 36e5 / 6e4));
      out.s.textContent = pad(Math.floor(diff % 6e4 / 1e3));
    }

    update();
    window.setInterval(update, 1000);
  }

  /* ------------------------------------------------------------------ *
   *  5. Custom cursor                                                   *
   * ------------------------------------------------------------------ */
  function initCursor() {
    var dot = doc.getElementById('iv-cursor');
    var fine = false;
    try { fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches; } catch (e) { /* assume coarse */ }
    if (!dot || !fine || reduced) return;

    doc.body.classList.add('iv-cursor-on');

    var x = 0, y = 0, drawn = false;
    window.addEventListener('mousemove', function (ev) {
      x = ev.clientX; y = ev.clientY;
      if (drawn) return;
      drawn = true;
      window.requestAnimationFrame(function () {
        dot.style.transform = 'translate(' + x + 'px,' + y + 'px)';
        drawn = false;
      });
    }, { passive: true });

    $$('a, button, input, select, textarea, .iv-choice-face, .iv-card').forEach(function (el) {
      el.addEventListener('mouseenter', function () { dot.classList.add('is-grown'); });
      el.addEventListener('mouseleave', function () { dot.classList.remove('is-grown'); });
    });
  }

  /* ------------------------------------------------------------------ *
   *  6. Toast + RSVP                                                    *
   * ------------------------------------------------------------------ */
  var toastTimer = 0;

  function toast(message) {
    var el = doc.getElementById('iv-toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('is-shown');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { el.classList.remove('is-shown'); }, 4200);
  }

  function initForm() {
    var form = doc.getElementById('iv-rsvp');
    if (!form) return;

    var error = form.querySelector('.iv-error');

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();

      var name = form.querySelector('#iv-name');
      var choice = form.querySelector('input[name="iv-attend"]:checked');

      if (!name.value.trim()) {
        error.hidden = false;
        error.textContent = 'Please tell us your name first.';
        name.focus();
        return;
      }
      if (!choice) {
        error.hidden = false;
        error.textContent = 'Please let us know whether you can join us.';
        return;
      }
      error.hidden = true;

      /* This is a template preview: there is no back end behind it, and
         saying so is better than implying a reply was delivered. */
      toast('Thank you, ' + name.value.trim() + '. This is a preview — your reply was not sent.');
      form.reset();
    });
  }

  /* ------------------------------------------------------------------ *
   *  7. Boot                                                            *
   * ------------------------------------------------------------------ */
  function boot() {
    startScene();
    initCountdown();
    initCursor();
    initForm();
    bindReveals();
    doc.getElementById('iv-year') && (doc.getElementById('iv-year').textContent = new Date().getFullYear());
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

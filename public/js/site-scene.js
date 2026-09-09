/* ==========================================================================
   site-scene.js — the animated background some designs carry.

   A theme in templates.js may name a scene (`scene: 'petals'`). When one
   does, EVER_bindSite calls in here and a WebGL layer is mounted into that
   design's hero — over the photograph, behind the names. Designs without a
   scene are untouched and cost nothing: three.js is fetched on demand, so
   the twenty designs that do not use it never download 600KB to find out.

   Why the hero and not the whole page: the hero is the one section every
   layout has, it is already a stacking context (.ws-hero-inner sits at
   z-index 2), and confining the canvas there means the loop can stop the
   moment it scrolls away — which is most of the time a guest spends on the
   page.

   The scene contract is the one the scene modules already implement:

       INVITE_SCENES[name](THREE, renderer, ctx) -> { frame, resize, dispose }

   with ctx = { width, height, reduced, palette }. `palette` carries the
   design's own colours, so one scene serves several designs and looks
   different in each.
   ========================================================================== */
(function () {
  'use strict';

  var THREE_SRC = 'vendor/three.min.js';
  var SCENE_SRC = 'js/invites/scene-';

  var loading = {};

  /* Load a script once, no matter how many callers ask for it. */
  function load(src) {
    if (loading[src]) return loading[src];

    loading[src] = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = resolve;
      s.onerror = function () { reject(new Error('could not load ' + src)); };
      document.head.appendChild(s);
    });
    return loading[src];
  }

  /* The design's colours, as numbers three.js can take directly. `soft` and
     `gold` are the theme's own accent fields; see THEMES in templates.js. */
  function paletteOf(tpl) {
    function hex(v, fallback) {
      var n = parseInt(String(v || '').replace('#', ''), 16);
      return isNaN(n) ? fallback : n;
    }
    return {
      accent:  hex(tpl.gold, 0xd4af37),
      accent2: hex(tpl.soft, 0xf5e6c8),
      gold:    hex(tpl.gold, 0xd4af37),
      soft:    hex(tpl.soft, 0xe6dcd0),
      bg:      hex(tpl.bg,   0x101010)
    };
  }

  function pixelRatio() {
    var dpr = window.devicePixelRatio || 1;
    var cores = window.navigator.hardwareConcurrency || 4;
    return Math.min(dpr, cores >= 8 ? 2 : 1.5);
  }

  function mount(hero, tpl) {
    var reduced = false;
    try {
      reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) { /* old browser: motion is fine */ }

    var canvas = document.createElement('canvas');
    canvas.className = 'ws-scene-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    hero.insertBefore(canvas, hero.firstChild);
    hero.classList.add('ws-has-scene');

    var renderer;
    try {
      renderer = new window.THREE.WebGLRenderer({
        canvas: canvas, antialias: true, alpha: true, powerPreference: 'high-performance'
      });
    } catch (err) {
      /* No WebGL. The hero keeps its photograph and nobody is any wiser. */
      canvas.parentNode.removeChild(canvas);
      hero.classList.remove('ws-has-scene');
      return;
    }

    function size() {
      return { w: hero.clientWidth || 1, h: hero.clientHeight || 1 };
    }

    var d = size();
    renderer.setPixelRatio(pixelRatio());
    renderer.setSize(d.w, d.h, false);

    var scene;
    try {
      scene = window.INVITE_SCENES[tpl.scene](window.THREE, renderer, {
        width: d.w, height: d.h, reduced: reduced, palette: paletteOf(tpl)
      });
    } catch (err) {
      renderer.dispose();
      canvas.parentNode.removeChild(canvas);
      hero.classList.remove('ws-has-scene');
      return;
    }

    var mouse = { x: 0, y: 0 };
    var running = false;
    var raf = 0;
    var t0 = Date.now();
    var visible = true;

    function tick() {
      raf = window.requestAnimationFrame(tick);
      scene.frame((Date.now() - t0) / 1000, mouse);
    }
    function start() {
      if (running || reduced || !visible || document.hidden) return;
      running = true;
      raf = window.requestAnimationFrame(tick);
    }
    function stop() {
      if (!running) return;
      running = false;
      window.cancelAnimationFrame(raf);
    }

    if (reduced) {
      scene.frame(0, mouse);        /* a still frame, never a loop */
    } else {
      /* Only run while the hero is actually on screen. Scrolling down to the
         RSVP form should not leave a render loop burning behind it. */
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          visible = entries[0].isIntersecting;
          if (visible) start(); else stop();
        }, { threshold: 0 }).observe(hero);
      } else {
        visible = true;
      }
      start();

      document.addEventListener('visibilitychange', function () {
        if (document.hidden) stop(); else start();
      });

      hero.addEventListener('mousemove', function (ev) {
        var r = hero.getBoundingClientRect();
        mouse.x = ((ev.clientX - r.left) / r.width - 0.5) * 2;
        mouse.y = ((ev.clientY - r.top) / r.height - 0.5) * 2;
      }, { passive: true });
    }

    canvas.addEventListener('webglcontextlost', function (ev) { ev.preventDefault(); stop(); });
    canvas.addEventListener('webglcontextrestored', start);

    var timer = 0;
    window.addEventListener('resize', function () {
      window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        var n = size();
        renderer.setPixelRatio(pixelRatio());
        renderer.setSize(n.w, n.h, false);
        scene.resize(n.w, n.h);
        if (reduced) scene.frame(0, mouse);
      }, 150);
    });
  }

  /**
   * Mount a design's background scene, if it has one.
   * Called by EVER_bindSite, so it only ever runs for a full live render —
   * never for the miniatures in the design gallery, which must stay cheap.
   */
  function mountScene(root, tpl) {
    if (!root || !tpl || !tpl.scene) return;
    if (root.__wsScene) return;

    var hero = root.querySelector('#ws-sec-hero') || root.querySelector('.ws-hero');
    if (!hero) return;
    root.__wsScene = true;

    load(THREE_SRC)
      .then(function () { return load(SCENE_SRC + tpl.scene + '.js'); })
      .then(function () {
        if (window.THREE && window.INVITE_SCENES && window.INVITE_SCENES[tpl.scene]) {
          mount(hero, tpl);
        }
      })
      .catch(function () { /* decorative: the design renders without it */ });
  }

  window.EVER_mountScene = mountScene;
})();

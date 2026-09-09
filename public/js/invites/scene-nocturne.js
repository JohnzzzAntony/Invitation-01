/* ==========================================================================
   Scene: nocturne — a constellation that keeps redrawing itself.

   Points drift on fixed velocities inside a box; every frame, any pair closer
   than LINK_DIST gets a line drawn between them. Because the points keep
   moving, the web forms and dissolves on its own with no choreography.

   The pair test is O(n^2), which is why COUNT is 90 and not 900: 90 points is
   ~4,000 comparisons a frame, which is nothing, while 900 would be 400,000
   and would drop frames on a phone. The line segments live in one
   pre-allocated buffer that is rewritten in place and its draw range moved —
   allocating a fresh geometry per frame is what usually makes this effect
   stutter.
   ========================================================================== */
(function () {
  'use strict';

  window.INVITE_SCENES = window.INVITE_SCENES || {};

  window.INVITE_SCENES.nocturne = function (THREE, renderer, ctx) {
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60, ctx.width / ctx.height, 0.1, 240);
    camera.position.set(0, 0, 30);

    renderer.setClearColor(0x000000, 0);

    var pal = ctx.palette;
    var COUNT = 90;
    var BOUND = 22;
    var LINK_DIST = 8.5;
    var MAX_LINKS = 900;          /* hard ceiling on segments per frame */

    var pts = [];
    var pos = new Float32Array(COUNT * 3);
    var i, i3;

    for (i = 0; i < COUNT; i++) {
      i3 = i * 3;
      var p = {
        x: (Math.random() - 0.5) * BOUND * 2,
        y: (Math.random() - 0.5) * BOUND * 1.4,
        z: (Math.random() - 0.5) * BOUND,
        vx: (Math.random() - 0.5) * 1.6,
        vy: (Math.random() - 0.5) * 1.6,
        vz: (Math.random() - 0.5) * 1.2
      };
      pts.push(p);
      pos[i3] = p.x; pos[i3 + 1] = p.y; pos[i3 + 2] = p.z;
    }

    var starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    var stars = new THREE.Points(starGeo, new THREE.PointsMaterial({
      size: 0.42,
      color: pal ? pal.accent2 : 0xf2ede1,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    }));
    scene.add(stars);

    var linePos = new Float32Array(MAX_LINKS * 6);
    var lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));

    var lines = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({
      color: pal ? pal.gold : 0xbdb49f,
      transparent: true,
      opacity: 0.34,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    }));
    scene.add(lines);

    var last = 0;

    return {
      frame: function (t, mouse) {
        var dt = last ? Math.min(t - last, 0.05) : 0.016;
        last = t;

        var a, b, p, q, i3b, dx, dy, dz;

        /* Drift, bouncing off the box walls. */
        for (a = 0; a < COUNT; a++) {
          p = pts[a];
          p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
          if (p.x < -BOUND || p.x > BOUND) p.vx *= -1;
          if (p.y < -BOUND * 0.7 || p.y > BOUND * 0.7) p.vy *= -1;
          if (p.z < -BOUND * 0.5 || p.z > BOUND * 0.5) p.vz *= -1;

          i3b = a * 3;
          pos[i3b] = p.x; pos[i3b + 1] = p.y; pos[i3b + 2] = p.z;
        }
        starGeo.attributes.position.needsUpdate = true;

        /* Relink. */
        var n = 0;
        for (a = 0; a < COUNT && n < MAX_LINKS; a++) {
          p = pts[a];
          for (b = a + 1; b < COUNT && n < MAX_LINKS; b++) {
            q = pts[b];
            dx = p.x - q.x; dy = p.y - q.y; dz = p.z - q.z;
            /* Compare squared distances — no sqrt in the inner loop. */
            if (dx * dx + dy * dy + dz * dz > LINK_DIST * LINK_DIST) continue;

            var o = n * 6;
            linePos[o]     = p.x; linePos[o + 1] = p.y; linePos[o + 2] = p.z;
            linePos[o + 3] = q.x; linePos[o + 4] = q.y; linePos[o + 5] = q.z;
            n++;
          }
        }
        lineGeo.attributes.position.needsUpdate = true;
        lineGeo.setDrawRange(0, n * 2);

        stars.rotation.y = t * 0.012;
        lines.rotation.y = t * 0.012;

        camera.position.x += (mouse.x * 2.6 - camera.position.x) * 0.04;
        camera.position.y += (-mouse.y * 1.8 - camera.position.y) * 0.04;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
      },
      resize: function (w, h) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      },
      dispose: function () {
        starGeo.dispose(); stars.material.dispose();
        lineGeo.dispose(); lines.material.dispose();
      }
    };
  };
})();

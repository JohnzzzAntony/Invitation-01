/* ==========================================================================
   Scene: gilded — concentric gold rings turning inside a dust of light.

   This is the descendant of the original prototype's two wireframe tori, with
   the wireframe swapped for real rings. A wireframe torus at low opacity
   reads as a mesh diagram; a set of thin TorusGeometry rings on shared tilted
   axes reads as an armillary sphere, which is the intent.

   The dust is one Points cloud whose colours are baked per-vertex at build
   time — white through gold — so the shimmer costs nothing per frame.
   ========================================================================== */
(function () {
  'use strict';

  window.INVITE_SCENES = window.INVITE_SCENES || {};

  window.INVITE_SCENES.gilded = function (THREE, renderer, ctx) {
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(62, ctx.width / ctx.height, 0.1, 260);
    camera.position.set(0, 0, 34);

    renderer.setClearColor(0x000000, 0);

    var GOLD = new THREE.Color(0xd4af37);
    var PALE = new THREE.Color(0xfff4d8);

    /* ---- Dust ---- */
    var COUNT = 2600;
    var pos = new Float32Array(COUNT * 3);
    var col = new Float32Array(COUNT * 3);
    var c = new THREE.Color();
    var i, i3;

    for (i = 0; i < COUNT; i++) {
      i3 = i * 3;
      pos[i3]     = (Math.random() - 0.5) * 84;
      pos[i3 + 1] = (Math.random() - 0.5) * 84;
      pos[i3 + 2] = (Math.random() - 0.5) * 84;

      c.copy(PALE).lerp(GOLD, Math.random() * 0.85);
      col[i3] = c.r; col[i3 + 1] = c.g; col[i3 + 2] = c.b;
    }

    var dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    dustGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));

    var dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
      size: 0.16,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    }));
    scene.add(dust);

    /* ---- Rings ----
       Radii and tilts are hand-picked rather than generated: evenly spaced
       rings moiré against each other at some camera angles. */
    var RINGS = [
      { r: 15.0, tube: 0.05, tilt: [Math.PI / 2.3, 0, 0],            spin: 0.10, opacity: 0.55 },
      { r: 11.6, tube: 0.04, tilt: [Math.PI / 2.9, Math.PI / 5, 0],  spin: -0.14, opacity: 0.45 },
      { r: 18.4, tube: 0.03, tilt: [Math.PI / 1.9, -Math.PI / 7, 0], spin: 0.07, opacity: 0.32 },
      { r: 8.2,  tube: 0.05, tilt: [Math.PI / 3.4, Math.PI / 3, 0],  spin: -0.19, opacity: 0.60 }
    ];

    var rings = [];
    RINGS.forEach(function (def) {
      var mesh = new THREE.Mesh(
        new THREE.TorusGeometry(def.r, def.tube, 8, 220),
        new THREE.MeshBasicMaterial({
          color: 0xd4af37,
          transparent: true,
          opacity: def.opacity,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        })
      );
      mesh.rotation.set(def.tilt[0], def.tilt[1], def.tilt[2]);
      scene.add(mesh);
      rings.push({ mesh: mesh, spin: def.spin });
    });

    return {
      frame: function (t, mouse) {
        dust.rotation.y = t * 0.018;
        dust.rotation.x = Math.sin(t * 0.05) * 0.06;

        for (var k = 0; k < rings.length; k++) {
          rings[k].mesh.rotation.z = t * rings[k].spin;
        }

        camera.position.x += (mouse.x * 3.4 - camera.position.x) * 0.04;
        camera.position.y += (-mouse.y * 2.4 - camera.position.y) * 0.04;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
      },
      resize: function (w, h) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      },
      dispose: function () {
        dustGeo.dispose();
        dust.material.dispose();
        rings.forEach(function (r) { r.mesh.geometry.dispose(); r.mesh.material.dispose(); });
      }
    };
  };
})();

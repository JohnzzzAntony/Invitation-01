/* ==========================================================================
   Scene: hearth — warm fireflies rising through a housewarming's hero.

   One InstancedMesh of small spheres, additive-blended so overlapping motes
   brighten instead of occluding each other — that additive stacking is what
   sells "glow" without any post-processing bloom pass. Each mote also
   breathes (a slow scale pulse), which reads as flicker at this size.
   ========================================================================== */
(function () {
  'use strict';

  window.INVITE_SCENES = window.INVITE_SCENES || {};

  window.INVITE_SCENES.hearth = function (THREE, renderer, ctx) {
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(56, ctx.width / ctx.height, 0.1, 300);
    camera.position.set(0, 0, 20);

    renderer.setClearColor(0x000000, 0);

    /* Fireflies are sparse by nature — a sky full of them stops looking cozy
       and starts looking like a swarm, so the count tops out much lower than
       petals or confetti even at full desktop area. */
    var area = ctx.width * ctx.height;
    var COUNT = Math.max(26, Math.min(70, Math.round(area / 22000)));
    var pal = ctx.palette;
    var TINTS = pal
      ? [pal.gold, pal.accent, pal.accent2]
      : [0xe8b45a, 0xd4af37, 0xf5cf87];

    var mesh = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.42, 10, 10),
      new THREE.MeshBasicMaterial({
        color: pal ? pal.gold : 0xe8b45a,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      }),
      COUNT
    );
    scene.add(mesh);

    var state = [];
    var dummy = new THREE.Object3D();
    var colour = new THREE.Color();

    for (var i = 0; i < COUNT; i++) {
      state.push({
        x: (Math.random() - 0.5) * 40,
        y: Math.random() * 50 - 25,
        z: (Math.random() - 0.5) * 26 - 3,
        rise: 0.35 + Math.random() * 0.55,
        sway: 0.3 + Math.random() * 0.7,
        phase: Math.random() * Math.PI * 2,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.6 + Math.random() * 0.8,
        scale: 0.45 + Math.random() * 1.15
      });
      mesh.setColorAt(i, colour.setHex(TINTS[i % TINTS.length]));
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

    var last = 0;

    return {
      frame: function (t, mouse) {
        var dt = last ? Math.min(t - last, 0.05) : 0.016;
        last = t;

        for (var i = 0; i < COUNT; i++) {
          var p = state[i];

          p.y += p.rise * dt;
          if (p.y > 25) {
            p.y = -25;
            p.x = (Math.random() - 0.5) * 40;
          }

          var pulse = 0.7 + Math.sin(t * p.pulseSpeed + p.pulsePhase) * 0.3;

          dummy.position.set(p.x + Math.sin(t * 0.25 * p.sway + p.phase) * 2.6, p.y, p.z);
          dummy.scale.setScalar(p.scale * pulse);
          dummy.rotation.set(0, 0, 0);
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);
        }
        mesh.instanceMatrix.needsUpdate = true;

        camera.position.x += (mouse.x * 1.3 - camera.position.x) * 0.035;
        camera.position.y += (-mouse.y * 0.9 - camera.position.y) * 0.035;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
      },
      resize: function (w, h) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      },
      dispose: function () {
        mesh.geometry.dispose();
        mesh.material.dispose();
      }
    };
  };
})();

/* ==========================================================================
   Scene: halo — pale motes spiralling gently inward, for baptisms.

   Shares hearth's additive-glow-sphere technique but the motion is the
   opposite shape on purpose: state is kept in polar coordinates (radius +
   angle) that shrink and turn very slowly, so pieces drift toward the
   centre and quietly recede rather than rising past the frame. Sparse,
   pale, unhurried — reads as serene rather than warm.
   ========================================================================== */
(function () {
  'use strict';

  window.INVITE_SCENES = window.INVITE_SCENES || {};

  var MAX_RADIUS = 24;

  window.INVITE_SCENES.halo = function (THREE, renderer, ctx) {
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(54, ctx.width / ctx.height, 0.1, 300);
    camera.position.set(0, 0, 20);

    renderer.setClearColor(0x000000, 0);

    /* Sparser still than hearth: this is a meditative scattering of light,
       not a field of fireflies, so it stays thin even on a large desktop. */
    var area = ctx.width * ctx.height;
    var COUNT = Math.max(14, Math.min(38, Math.round(area / 42000)));
    var pal = ctx.palette;
    var TINTS = pal
      ? [pal.soft, pal.gold, 0xffffff]
      : [0xf4ecdd, 0xd4af37, 0xffffff];

    var mesh = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.5, 10, 10),
      new THREE.MeshBasicMaterial({
        color: pal ? pal.soft : 0xf4ecdd,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      }),
      COUNT
    );
    scene.add(mesh);

    var state = [];
    var dummy = new THREE.Object3D();
    var colour = new THREE.Color();

    function spawnOuter(p) {
      p.radius = MAX_RADIUS * (0.7 + Math.random() * 0.3);
      p.angle = Math.random() * Math.PI * 2;
      p.y = (Math.random() - 0.5) * 30;
    }

    for (var i = 0; i < COUNT; i++) {
      var p = {
        shrink: 0.25 + Math.random() * 0.35,
        turn: (0.04 + Math.random() * 0.06) * (Math.random() < 0.5 ? -1 : 1),
        drift: 0.15 + Math.random() * 0.25,
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.4 + Math.random() * 0.5,
        scale: 0.5 + Math.random() * 0.9
      };
      spawnOuter(p);
      /* Stagger initial radius so the field does not visibly "reset" in
         unison; without this every mote would reach centre at once. */
      p.radius *= Math.random();
      state.push(p);
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

          p.radius -= p.shrink * dt;
          p.angle += p.turn * dt;
          if (p.radius < 1.2) spawnOuter(p);

          var pulse = 0.75 + Math.sin(t * p.pulseSpeed + p.phase) * 0.25;
          var x = Math.cos(p.angle) * p.radius;
          var z = Math.sin(p.angle) * p.radius * 0.6 - 4;
          var y = p.y + Math.sin(t * p.drift + p.phase) * 1.4;

          dummy.position.set(x, y, z);
          dummy.scale.setScalar(p.scale * pulse);
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);
        }
        mesh.instanceMatrix.needsUpdate = true;

        camera.position.x += (mouse.x * 1.1 - camera.position.x) * 0.03;
        camera.position.y += (-mouse.y * 0.8 - camera.position.y) * 0.03;
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

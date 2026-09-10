/* ==========================================================================
   Scene: confetti — a cannon burst of tumbling paper strips, for birthdays.

   One InstancedMesh of thin planes carries every strip; each is a small
   physics particle (velocity + gravity), not a scripted drift like petals,
   so the burst genuinely arcs and falls instead of just floating down.

   Flat MeshBasicMaterial is deliberate: no lighting means the saturated
   palette tints read at full strength instead of being dimmed and shaded
   into something elegant — this scene wants "party", not "romantic".
   ========================================================================== */
(function () {
  'use strict';

  window.INVITE_SCENES = window.INVITE_SCENES || {};

  var GRAVITY = -17;
  var HALF_W = 24;
  var HALF_H = 27;

  window.INVITE_SCENES.confetti = function (THREE, renderer, ctx) {
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(58, ctx.width / ctx.height, 0.1, 300);
    camera.position.set(0, 0, 22);

    renderer.setClearColor(0x000000, 0);

    /* Small pieces read as confetti only in numbers; scale with the viewport
       like every other scene so phones are not paying for a desktop blizzard. */
    var area = ctx.width * ctx.height;
    var COUNT = Math.max(120, Math.min(300, Math.round(area / 5200)));
    var pal = ctx.palette;
    var TINTS = pal
      ? [pal.accent, pal.accent2, pal.gold, 0xff5d8f, 0x36d1c4, 0xffd23f]
      : [0xff5d8f, 0x36d1c4, 0xffd23f, 0xd4af37, 0xf5e6c8, 0x7ee0ff];

    var mesh = new THREE.InstancedMesh(
      new THREE.PlaneGeometry(0.62, 0.26),
      new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.96
      }),
      COUNT
    );
    scene.add(mesh);

    var state = [];
    var dummy = new THREE.Object3D();
    var colour = new THREE.Color();

    /* `initial` spreads pieces across the whole height with mixed up/down
       velocity so a reduced-motion single frame already looks like a burst
       mid-flight; every later respawn re-launches from below like a cannon. */
    function spawn(p, initial) {
      if (initial) {
        p.x = (Math.random() - 0.5) * HALF_W * 2;
        p.y = (Math.random() - 0.5) * HALF_H * 2;
        p.vy = (Math.random() * 2 - 0.6) * 11;
      } else {
        p.x = (Math.random() - 0.5) * HALF_W * 1.6;
        p.y = -HALF_H - Math.random() * 8;
        p.vy = 13 + Math.random() * 11;
      }
      p.z = (Math.random() - 0.5) * 22;
      p.vx = (Math.random() - 0.5) * 9;
      p.vz = (Math.random() - 0.5) * 5;
      p.rx = (Math.random() - 0.5) * 7;
      p.ry = (Math.random() - 0.5) * 7;
      p.rz = (Math.random() - 0.5) * 7;
      p.scale = 0.55 + Math.random() * 0.75;
    }

    for (var i = 0; i < COUNT; i++) {
      var p = { rotX: Math.random() * Math.PI, rotY: Math.random() * Math.PI, rotZ: Math.random() * Math.PI };
      spawn(p, true);
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

          p.vy += GRAVITY * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.z += p.vz * dt;
          p.rotX += p.rx * dt;
          p.rotY += p.ry * dt;
          p.rotZ += p.rz * dt;

          if (p.y < -HALF_H - 6) spawn(p, false);

          dummy.position.set(p.x, p.y, p.z);
          dummy.rotation.set(p.rotX, p.rotY, p.rotZ);
          dummy.scale.setScalar(p.scale);
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);
        }
        mesh.instanceMatrix.needsUpdate = true;

        camera.position.x += (mouse.x * 1.6 - camera.position.x) * 0.05;
        camera.position.y += (-mouse.y * 1.1 - camera.position.y) * 0.05;
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

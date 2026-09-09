/* ==========================================================================
   Scene: petals — rose petals falling through warm and cool light.

   One InstancedMesh carries all 260 petals, so the whole fall is a single
   draw call; the per-petal state lives in a plain array and is written into
   the instance matrix each tick.

   The petal is a bezier shape whose vertices are then pushed along z by
   x^2 (and a little y^2), which cups it. That curve is the whole trick: a
   flat petal reads as a paper card no matter how it is lit, a cupped one
   catches the key light along one edge and turns as it falls.
   ========================================================================== */
(function () {
  'use strict';

  window.INVITE_SCENES = window.INVITE_SCENES || {};

  function petalGeometry(THREE) {
    var s = new THREE.Shape();
    s.moveTo(0, -0.5);
    s.bezierCurveTo(0.42, -0.28, 0.40, 0.30, 0, 0.55);
    s.bezierCurveTo(-0.40, 0.30, -0.42, -0.28, 0, -0.5);

    var g = new THREE.ShapeGeometry(s, 18);
    var p = g.attributes.position;
    for (var i = 0; i < p.count; i++) {
      var x = p.getX(i);
      var y = p.getY(i);
      p.setZ(i, (x * x) * 0.85 + (y * y) * 0.18);
    }
    g.computeVertexNormals();
    return g;
  }

  window.INVITE_SCENES.petals = function (THREE, renderer, ctx) {
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(58, ctx.width / ctx.height, 0.1, 300);
    camera.position.set(0, 0, 22);

    renderer.setClearColor(0x000000, 0);

    /* Scale the fall with the window. 260 petals across a desktop reads as
       weather; the same 260 on a phone is a blizzard that also happens to be
       260 matrix compositions and a buffer upload every frame, on the weakest
       GPU of the three. Area-proportional keeps the look and the cost sane. */
    var area = ctx.width * ctx.height;
    var COUNT = Math.max(90, Math.min(240, Math.round(area / 7000)));
    var TINTS = [0xf9d3d9, 0xe8a9b6, 0xf5e2c8, 0xdba7a0];

    var mesh = new THREE.InstancedMesh(
      petalGeometry(THREE),
      new THREE.MeshStandardMaterial({
        color: 0xf6c6cf,
        roughness: 0.55,
        metalness: 0.08,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95
      }),
      COUNT
    );
    scene.add(mesh);

    var state = [];
    var dummy = new THREE.Object3D();
    var colour = new THREE.Color();

    for (var i = 0; i < COUNT; i++) {
      state.push({
        x: (Math.random() - 0.5) * 46,
        y: Math.random() * 54 - 27,
        z: (Math.random() - 0.5) * 30 - 4,
        rx: Math.random() * Math.PI,
        ry: Math.random() * Math.PI,
        rz: Math.random() * Math.PI,
        scale: 0.5 + Math.random() * 0.9,
        fall: 0.9 + Math.random() * 1.5,
        spin: (Math.random() - 0.5) * 0.9,
        sway: 0.5 + Math.random() * 1.4,
        phase: Math.random() * Math.PI * 2
      });
      mesh.setColorAt(i, colour.setHex(TINTS[i % TINTS.length]));
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

    /* Warm key, cool rim: the pair is what keeps a pale petal from flattening
       into a silhouette against a dark page. */
    scene.add(new THREE.AmbientLight(0xffe8ec, 0.55));
    var key = new THREE.DirectionalLight(0xffd9c0, 1.0);
    key.position.set(4, 8, 6);
    scene.add(key);
    var rim = new THREE.DirectionalLight(0xa88bd0, 0.5);
    rim.position.set(-6, -3, -4);
    scene.add(rim);

    var last = 0;

    return {
      frame: function (t, mouse) {
        /* Derive dt from the shell's clock and clamp it, so a tab that was
           throttled does not teleport every petal off screen on resume. */
        var dt = last ? Math.min(t - last, 0.05) : 0.016;
        last = t;

        for (var i = 0; i < COUNT; i++) {
          var p = state[i];

          p.y -= p.fall * dt * 2.2;
          if (p.y < -28) {
            p.y = 28;
            p.x = (Math.random() - 0.5) * 46;
          }
          p.rz += p.spin * dt;
          p.rx += p.spin * dt * 0.6;

          dummy.position.set(p.x + Math.sin(t * 0.6 * p.sway + p.phase) * 2.2, p.y, p.z);
          dummy.rotation.set(p.rx, p.ry + t * 0.15, p.rz);
          dummy.scale.setScalar(p.scale);
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);
        }
        mesh.instanceMatrix.needsUpdate = true;

        camera.position.x += (mouse.x * 1.8 + Math.sin(t * 0.1) * 1.6 - camera.position.x) * 0.04;
        camera.position.y += (-mouse.y * 1.2 - camera.position.y) * 0.04;
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

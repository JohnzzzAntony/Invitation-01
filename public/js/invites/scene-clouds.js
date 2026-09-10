/* ==========================================================================
   Scene: clouds — puffy pastel clouds drifting past, for baby showers.

   Two InstancedMeshes, still two draw calls total. The clouds mesh holds
   every puff of every cloud: each instance keeps a fixed local offset from
   its cloud's centre (picked once, in a small cluster), and only the
   centre moves — so a "cloud" is just several instances that happen to
   share one drift path, no per-cloud grouping objects required. A second,
   much sparser mesh of tiny twinkling motes sits behind them as stars.
   ========================================================================== */
(function () {
  'use strict';

  window.INVITE_SCENES = window.INVITE_SCENES || {};

  window.INVITE_SCENES.clouds = function (THREE, renderer, ctx) {
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(56, ctx.width / ctx.height, 0.1, 300);
    camera.position.set(0, 0, 22);

    renderer.setClearColor(0x000000, 0);

    var area = ctx.width * ctx.height;
    var CLOUD_COUNT = Math.max(6, Math.min(16, Math.round(area / 62000)));
    var PUFFS_PER_CLOUD = 5;
    var PUFF_COUNT = CLOUD_COUNT * PUFFS_PER_CLOUD;

    var pal = ctx.palette;
    var TINTS = pal
      ? [pal.soft, 0xdcecff, 0xffd7ec, 0xfff3c4]
      : [0xf5f2ea, 0xdcecff, 0xffd7ec, 0xfff3c4];

    var puffMesh = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.6, 10, 8),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.92 }),
      PUFF_COUNT
    );
    scene.add(puffMesh);

    var clouds = [];
    var puffs = [];
    var dummy = new THREE.Object3D();
    var colour = new THREE.Color();
    var puffIndex = 0;

    for (var c = 0; c < CLOUD_COUNT; c++) {
      var cloud = {
        x: (Math.random() - 0.5) * 48,
        y: Math.random() * 40 - 20,
        z: (Math.random() - 0.5) * 24 - 6,
        speed: 0.4 + Math.random() * 0.7,
        dir: Math.random() < 0.5 ? -1 : 1,
        bobSpeed: 0.2 + Math.random() * 0.3,
        bobPhase: Math.random() * Math.PI * 2,
        scale: 1.1 + Math.random() * 1.4
      };
      clouds.push(cloud);

      var tint = TINTS[c % TINTS.length];
      for (var j = 0; j < PUFFS_PER_CLOUD; j++) {
        var ang = (j / PUFFS_PER_CLOUD) * Math.PI * 2 + Math.random() * 0.6;
        var rad = 0.55 + Math.random() * 0.55;
        puffs.push({
          cloud: cloud,
          ox: Math.cos(ang) * rad,
          oy: Math.sin(ang) * rad * 0.55,
          oz: (Math.random() - 0.5) * 0.4,
          puffScale: 0.6 + Math.random() * 0.55
        });
        puffMesh.setColorAt(puffIndex, colour.setHex(tint));
        puffIndex++;
      }
    }
    if (puffMesh.instanceColor) puffMesh.instanceColor.needsUpdate = true;

    /* Sparse background twinkles — same idea as hearth's pulse, but points
       are static in place, only their scale (and so apparent brightness)
       moves, which is enough for a "sparkle" read at this size. */
    var STAR_COUNT = Math.max(10, Math.min(30, Math.round(area / 70000)));
    var starMesh = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.18, 6, 6),
      new THREE.MeshBasicMaterial({
        color: pal ? pal.gold : 0xffe9a8,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      }),
      STAR_COUNT
    );
    scene.add(starMesh);

    var stars = [];
    for (var s = 0; s < STAR_COUNT; s++) {
      stars.push({
        x: (Math.random() - 0.5) * 50,
        y: Math.random() * 46 - 23,
        z: (Math.random() - 0.5) * 30 - 10,
        speed: 0.8 + Math.random() * 1.4,
        phase: Math.random() * Math.PI * 2,
        scale: 0.5 + Math.random() * 0.8
      });
    }

    var last = 0;

    return {
      frame: function (t, mouse) {
        var dt = last ? Math.min(t - last, 0.05) : 0.016;
        last = t;

        for (var c = 0; c < clouds.length; c++) {
          var cl = clouds[c];
          cl.x += cl.speed * cl.dir * dt;
          if (cl.x > 30) cl.x = -30;
          if (cl.x < -30) cl.x = 30;
        }

        for (var i = 0; i < puffs.length; i++) {
          var pf = puffs[i];
          var cloud = pf.cloud;
          var bob = Math.sin(t * cloud.bobSpeed + cloud.bobPhase) * 1.1;

          dummy.position.set(
            cloud.x + pf.ox * cloud.scale,
            cloud.y + bob + pf.oy * cloud.scale,
            cloud.z + pf.oz
          );
          dummy.scale.setScalar(cloud.scale * pf.puffScale);
          dummy.updateMatrix();
          puffMesh.setMatrixAt(i, dummy.matrix);
        }
        puffMesh.instanceMatrix.needsUpdate = true;

        for (var k = 0; k < stars.length; k++) {
          var st = stars[k];
          var twinkle = 0.4 + Math.max(0, Math.sin(t * st.speed + st.phase)) * 0.8;
          dummy.position.set(st.x, st.y, st.z);
          dummy.scale.setScalar(st.scale * twinkle);
          dummy.updateMatrix();
          starMesh.setMatrixAt(k, dummy.matrix);
        }
        starMesh.instanceMatrix.needsUpdate = true;

        camera.position.x += (mouse.x * 1.4 - camera.position.x) * 0.035;
        camera.position.y += (-mouse.y * 1.0 - camera.position.y) * 0.035;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
      },
      resize: function (w, h) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      },
      dispose: function () {
        puffMesh.geometry.dispose();
        puffMesh.material.dispose();
        starMesh.geometry.dispose();
        starMesh.material.dispose();
      }
    };
  };
})();

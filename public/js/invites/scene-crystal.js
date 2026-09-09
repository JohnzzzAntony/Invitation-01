/* ==========================================================================
   Scene: crystal — a slow bloom of faceted stones turning in green light.

   Flat shading on a low-detail icosahedron is what makes a stone read as cut
   rather than as a ball: `flatShading: true` gives each triangle one normal,
   so every facet takes the key light at its own angle and the silhouette
   sparkles as it turns.

   Two point lights orbit in antiphase. A single fixed light leaves half of
   every stone permanently dead, and the turning is what sells the material.
   ========================================================================== */
(function () {
  'use strict';

  window.INVITE_SCENES = window.INVITE_SCENES || {};

  window.INVITE_SCENES.crystal = function (THREE, renderer, ctx) {
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(56, ctx.width / ctx.height, 0.1, 260);
    camera.position.set(0, 0, 30);

    renderer.setClearColor(0x000000, 0);

    var TINTS = [0x9fd9bd, 0xd8e8d5, 0x74b394, 0xeef2e6, 0xa8c9b4];
    var STONES = 22;
    var stones = [];
    var i;

    for (i = 0; i < STONES; i++) {
      var radius = 0.7 + Math.random() * 1.7;
      var mesh = new THREE.Mesh(
        /* detail 0 keeps it at 20 large facets — the point is the cut. */
        new THREE.IcosahedronGeometry(radius, 0),
        new THREE.MeshStandardMaterial({
          color: TINTS[i % TINTS.length],
          roughness: 0.16,
          metalness: 0.35,
          flatShading: true,
          transparent: true,
          opacity: 0.88
        })
      );

      /* An annulus, not a sphere. Sampling a sphere and calling it "biased
         outward" still puts a third of the stones in front of the headline,
         because the near cap projects straight onto the middle of the screen.
         A ring with a hard inner radius cannot: the centre column stays clear
         for the type, which is the whole job of a background.

         The ring is stretched wider than it is tall to match a landscape
         viewport, and every stone sits behind z=0, in front of nothing. */
      var angle = Math.random() * Math.PI * 2;
      var ring = 17 + Math.random() * 13;

      mesh.position.set(
        Math.cos(angle) * ring * 1.3,
        Math.sin(angle) * ring * 0.8,
        -5 - Math.random() * 16
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

      scene.add(mesh);
      stones.push({
        mesh: mesh,
        sx: (Math.random() - 0.5) * 0.18,
        sy: (Math.random() - 0.5) * 0.18,
        bob: 0.4 + Math.random() * 0.9,
        phase: Math.random() * Math.PI * 2,
        y0: mesh.position.y
      });
    }

    scene.add(new THREE.AmbientLight(0xdfece2, 0.42));

    var lampA = new THREE.PointLight(0xbfffe0, 1.0, 120);
    var lampB = new THREE.PointLight(0xfff2c8, 0.75, 120);
    scene.add(lampA);
    scene.add(lampB);

    var fill = new THREE.DirectionalLight(0x8fb9a2, 0.35);
    fill.position.set(-5, -6, -4);
    scene.add(fill);

    return {
      frame: function (t, mouse) {
        var k;
        for (k = 0; k < stones.length; k++) {
          var s = stones[k];
          s.mesh.rotation.x += s.sx * 0.02;
          s.mesh.rotation.y += s.sy * 0.02;
          s.mesh.position.y = s.y0 + Math.sin(t * 0.5 * s.bob + s.phase) * 1.4;
        }

        lampA.position.set(Math.cos(t * 0.4) * 22, 14, Math.sin(t * 0.4) * 22);
        lampB.position.set(Math.cos(t * 0.4 + Math.PI) * 20, -12, Math.sin(t * 0.4 + Math.PI) * 20);

        camera.position.x += (mouse.x * 3.0 - camera.position.x) * 0.04;
        camera.position.y += (-mouse.y * 2.2 - camera.position.y) * 0.04;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
      },
      resize: function (w, h) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      },
      dispose: function () {
        stones.forEach(function (s) { s.mesh.geometry.dispose(); s.mesh.material.dispose(); });
      }
    };
  };
})();

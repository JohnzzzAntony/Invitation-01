/* ==========================================================================
   Scene: aurora — vertical light ribbons over a slow drift of motes.

   The ribbons are tall, thin planes displaced in the vertex shader by three
   stacked sines at different frequencies. One sine reads as a wobble; three
   at 0.55 / 1.30 / 2.60 read as a current, which is what an aurora looks
   like. All of the displacement happens on the GPU, so the geometry is
   uploaded once and never touched again.

   Additive blending is doing the glow. There is no bloom pass: the templates
   run on the three.js global build, whose post-processing lives in a separate
   set of scripts, and a CSS vignette (.iv-vignette) buys most of the same
   effect for none of the dependency.
   ========================================================================== */
(function () {
  'use strict';

  window.INVITE_SCENES = window.INVITE_SCENES || {};

  var VERT = [
    'uniform float uTime;',
    'uniform float uSeed;',
    'varying vec2 vUv;',
    'varying float vWave;',
    'void main() {',
    '  vUv = uv;',
    '  vec3 p = position;',
    '  float t = uTime * 0.35 + uSeed;',
    '  float w = sin(p.y * 0.55 + t) * 1.9',
    '          + sin(p.y * 1.30 - t * 1.4) * 0.75',
    '          + sin(p.y * 2.60 + t * 0.7) * 0.30;',
    '  p.x += w;',
    '  p.z += cos(p.y * 0.7 + t * 0.9) * 1.2;',
    '  vWave = w;',
    '  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);',
    '}'
  ].join('\n');

  var FRAG = [
    'uniform vec3 uColor;',
    'uniform float uTime;',
    'uniform float uAlpha;',
    'varying vec2 vUv;',
    'varying float vWave;',
    'void main() {',
    /* Fade top and bottom so a ribbon has no cut ends, and fade the two
       long edges so it reads as light rather than as a rectangle. */
    '  float endFade  = smoothstep(0.0, 0.30, vUv.y) * smoothstep(1.0, 0.70, vUv.y);',
    '  float edgeFade = smoothstep(0.0, 0.45, vUv.x) * smoothstep(1.0, 0.55, vUv.x);',
    '  float shimmer  = 0.65 + 0.35 * sin(vUv.y * 14.0 - uTime * 1.6 + vWave);',
    '  gl_FragColor = vec4(uColor * shimmer, endFade * edgeFade * uAlpha);',
    '}'
  ].join('\n');

  window.INVITE_SCENES.aurora = function (THREE, renderer, ctx) {
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60, ctx.width / ctx.height, 0.1, 220);
    camera.position.set(0, 0, 24);

    renderer.setClearColor(0x000000, 0);

    var COLOURS = [0x6f8cff, 0x9d7bff, 0x4fd6c4, 0xc9a7ff, 0x7fb2ff];
    var RIBBONS = 7;
    var mats = [];
    var i;

    for (i = 0; i < RIBBONS; i++) {
      var mat = new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        uniforms: {
          uTime:  { value: 0 },
          uSeed:  { value: i * 1.7 },
          uAlpha: { value: 0.5 },
          uColor: { value: new THREE.Color(COLOURS[i % COLOURS.length]) }
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      });

      var ribbon = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 46, 1, 140), mat);
      ribbon.position.set((i - (RIBBONS - 1) / 2) * 4.6, 0, -i * 2.2);
      ribbon.rotation.z = (i % 2 ? 1 : -1) * 0.05;
      scene.add(ribbon);
      mats.push(mat);
    }

    /* Motes: a static cloud that the whole group rotates, rather than 900
       individually animated sprites. */
    var COUNT = 900;
    var pos = new Float32Array(COUNT * 3);
    for (i = 0; i < COUNT; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 70;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40 - 10;
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    var motes = new THREE.Points(geo, new THREE.PointsMaterial({
      size: 0.13,
      color: 0xdce4ff,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    }));
    scene.add(motes);

    return {
      frame: function (t, mouse) {
        for (var k = 0; k < mats.length; k++) mats[k].uniforms.uTime.value = t;
        motes.rotation.y = t * 0.02;

        camera.position.x += (mouse.x * 2.4 + Math.sin(t * 0.12) * 2.2 - camera.position.x) * 0.04;
        camera.position.y += (-mouse.y * 1.6 - camera.position.y) * 0.04;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
      },
      resize: function (w, h) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      },
      dispose: function () {
        scene.traverse(function (o) {
          if (o.geometry) o.geometry.dispose();
          if (o.material) o.material.dispose();
        });
      }
    };
  };
})();

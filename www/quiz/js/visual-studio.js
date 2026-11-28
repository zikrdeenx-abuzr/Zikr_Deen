(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const canvas = $('modelCanvas');
  const fallback = $('modelFallback');
  const status = $('modelStatus');
  const title = $('modelTitle');
  const description = $('modelDescription');
  const catalog = $('modelCatalog');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const FALLBACK_MODELS = [
    { id: 'cell', title: 'Animal Cell', topic: 'Biology', description: 'Explore the cell membrane, nucleus, mitochondria and organelles.', review_status: 'Offline fallback prototype', fallback: './assets/visuals/biology/cell-structure-2d.svg', alt: 'Animal cell diagram' },
    { id: 'dna', title: 'DNA Double Helix', topic: 'Biology', description: 'Inspect the twisting double-helix strands and base-pair rungs.', review_status: 'Offline fallback prototype', fallback: './assets/visuals/biology/cell-structure-2d.svg', alt: 'DNA diagram' },
    { id: 'brain', title: 'Brain Overview', topic: 'Neuroscience', description: 'View cerebral hemispheres, cerebellum and brainstem layout.', review_status: 'Offline fallback prototype', fallback: './assets/visuals/biology/cell-structure-2d.svg', alt: 'Brain diagram' },
    { id: 'solar', title: 'Solar System', topic: 'Astronomy', description: 'Observe planetary orbits around the Sun (not to scale).', review_status: 'Offline fallback prototype', fallback: './assets/visuals/physics/earth-day-night-2d.svg', alt: 'Solar system diagram' },
    { id: 'geometry', title: '3D Geometry', topic: 'Mathematics', description: 'Study spatial symmetry and multi-axis rotation.', review_status: 'Offline fallback prototype', fallback: './assets/visuals/mathematics/geometry-symmetry-2d.svg', alt: 'Geometry diagram' },
    { id: 'network', title: 'Neural Network', topic: 'Technology & AI', description: 'Visualize connected nodes orbiting a central hub.', review_status: 'Offline fallback prototype', fallback: './assets/visuals/technology/ai-verification-2d.svg', alt: 'AI network diagram' }
  ];

  let gl, program, buffer, indexBuffer, indexCount = 0;
  let loc = {};
  let current = 'cell';
  let yaw = -0.45, pitch = 0.22, zoom = 1;
  let targetYaw = -0.45, targetPitch = 0.22, targetZoom = 1;
  let playing = !reduced, autoRotate = !reduced, frame = 0, raf = 0, models = [];
  let pointers = new Map(), pinchStartDist = 0, pinchStartZoom = 1;
  let resizeObserver = null;

  const requestedModel = new URLSearchParams(location.search).get('model');

  const vertex = `
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    uniform mat4 uMvp;
    uniform mat4 uModel;
    varying vec3 vNormal;
    varying vec3 vPos;
    void main() {
      vec4 p = uModel * vec4(aPosition, 1.0);
      vPos = p.xyz;
      vNormal = mat3(uModel) * aNormal;
      gl_Position = uMvp * vec4(aPosition, 1.0);
    }
  `;

  const fragment = `
    precision mediump float;
    uniform vec3 uColor;
    varying vec3 vNormal;
    varying vec3 vPos;
    void main() {
      vec3 n = normalize(vNormal);
      vec3 lightDir = normalize(vec3(-0.45, 0.8, 1.0));
      vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0));
      vec3 halfDir = normalize(lightDir + viewDir);
      float diff = max(dot(n, lightDir), 0.0);
      float spec = pow(max(dot(n, halfDir), 0.0), 28.0) * 0.28;
      float hemi = 0.5 + 0.5 * n.y;
      float rim = pow(1.0 - max(dot(n, viewDir), 0.0), 2.2);
      vec3 ambient = uColor * mix(0.24, 0.40, hemi);
      vec3 c = ambient + uColor * (0.62 * diff) + vec3(spec) + vec3(0.10, 0.20, 0.15) * rim;
      gl_FragColor = vec4(c, 1.0);
    }
  `;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(s) || 'Shader compile error');
    }
    return s;
  }

  function matMul(a, b) {
    const o = new Float32Array(16);
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        o[c * 4 + r] =
          a[r] * b[c * 4] +
          a[4 + r] * b[c * 4 + 1] +
          a[8 + r] * b[c * 4 + 2] +
          a[12 + r] * b[c * 4 + 3];
      }
    }
    return o;
  }

  function identity() {
    return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  }
  function translate(x, y, z) { const m = identity(); m[12] = x; m[13] = y; m[14] = z; return m; }
  function scale(x, y, z) { const m = identity(); m[0] = x; m[5] = y; m[10] = z; return m; }
  function rotateY(a) { const c = Math.cos(a), s = Math.sin(a); return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]); }
  function rotateX(a) { const c = Math.cos(a), s = Math.sin(a); return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]); }
  function perspective(fov, aspect, near, far) {
    const f = 1 / Math.tan(fov / 2), nf = 1 / (near - far);
    return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0]);
  }

  function sphere(lat = 20, lon = 28) {
    const v = [], n = [], ix = [];
    for (let y = 0; y <= lat; y++) {
      const t = y * Math.PI / lat;
      for (let x = 0; x <= lon; x++) {
        const p = x * 2 * Math.PI / lon;
        const nx = Math.sin(t) * Math.cos(p), ny = Math.cos(t), nz = Math.sin(t) * Math.sin(p);
        v.push(nx, ny, nz);
        n.push(nx, ny, nz);
      }
    }
    for (let y = 0; y < lat; y++) {
      for (let x = 0; x < lon; x++) {
        const a = y * (lon + 1) + x, b = a + lon + 1;
        ix.push(a, a + 1, b, b, a + 1, b + 1);
      }
    }
    return { v, n, ix };
  }

  function init() {
    try {
      gl = canvas.getContext('webgl', { alpha: false, antialias: true, powerPreference: 'low-power' });
      if (!gl) throw new Error('WebGL is unavailable on this browser/device.');
      const p = gl.createProgram();
      gl.attachShader(p, compile(gl.VERTEX_SHADER, vertex));
      gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fragment));
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(p) || 'Program link error');
      }
      program = p;
      loc = {
        pos: gl.getAttribLocation(program, 'aPosition'),
        nor: gl.getAttribLocation(program, 'aNormal'),
        mvp: gl.getUniformLocation(program, 'uMvp'),
        model: gl.getUniformLocation(program, 'uModel'),
        color: gl.getUniformLocation(program, 'uColor')
      };

      const s = sphere();
      const inter = new Float32Array(s.v.length + s.n.length);
      for (let i = 0; i < s.v.length / 3; i++) {
        inter.set(s.v.slice(i * 3, i * 3 + 3), i * 6);
        inter.set(s.n.slice(i * 3, i * 3 + 3), i * 6 + 3);
      }
      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, inter, gl.STATIC_DRAW);

      indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(s.ix), gl.STATIC_DRAW);
      indexCount = s.ix.length;

      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.CULL_FACE);
      gl.clearColor(0.025, 0.075, 0.055, 1);

      fallback.hidden = true;
      canvas.hidden = false;
      return true;
    } catch (e) {
      fallback.hidden = false;
      canvas.hidden = true;
      status.textContent = e.message + ' Showing the accessible 2D fallback instead.';
      return false;
    }
  }

  function hex(h) {
    return [
      parseInt(h.slice(1, 3), 16) / 255,
      parseInt(h.slice(3, 5), 16) / 255,
      parseInt(h.slice(5, 7), 16) / 255
    ];
  }

  function item(x, y, z, sx, sy, sz, color, rot = 0) {
    return { x, y, z, sx, sy, sz, color, rot };
  }

  function scene(id, t) {
    const a = [];
    if (id === 'cell') {
      a.push(item(0, 0, 0, 1.2, 0.82, 0.82, '#438d78'));
      a.push(item(-0.12, 0.02, 0.68, 0.47, 0.48, 0.28, '#d8b66a'));
      a.push(item(0.63, 0.3, -0.12, 0.26, 0.12, 0.15, '#86c7e4', t));
      a.push(item(-0.68, -0.3, -0.05, 0.28, 0.13, 0.15, '#86c7e4', -t));
      a.push(item(0.45, -0.35, 0.1, 0.18, 0.13, 0.14, '#b68bd1'));
    } else if (id === 'dna') {
      for (let i = 0; i < 26; i++) {
        const q = i * 0.34 + t * 0.35, y = (i - 12.5) * 0.075;
        const x = Math.cos(q) * 0.62, z = Math.sin(q) * 0.62;
        a.push(item(x, y, z, 0.09, 0.09, 0.09, '#d8b66a'));
        a.push(item(-x, y, -z, 0.09, 0.09, 0.09, '#83c6e8'));
        if (i % 2 === 0) a.push(item(0, y, 0, 0.045, 0.055, 0.045, '#d8e8cf'));
      }
    } else if (id === 'brain') {
      a.push(item(-0.42, 0.12, 0, 0.7, 0.63, 0.56, '#7fc6a0'));
      a.push(item(0.38, 0.2, 0, 0.67, 0.57, 0.53, '#6eae8f'));
      a.push(item(0.63, -0.4, 0.12, 0.4, 0.31, 0.36, '#d8b66a'));
      a.push(item(0.02, -0.62, 0.02, 0.18, 0.48, 0.18, '#c78d69'));
      a.push(item(-0.05, -0.08, 0.52, 0.28, 0.2, 0.16, '#b68bd1'));
    } else if (id === 'solar') {
      a.push(item(0, 0, 0, 0.36, 0.36, 0.36, '#e8b84e'));
      const colors = ['#8fc4db', '#d8a56b', '#6b9bce', '#b98e6c', '#d8b66a', '#8fb6a0', '#9c8cc8'];
      for (let i = 0; i < 7; i++) {
        const r = 0.65 + i * 0.22, q = t * (0.2 + i * 0.018) + i * 0.7;
        const sz = 0.075 + i * 0.012;
        a.push(item(Math.cos(q) * r, 0, Math.sin(q) * r, sz, sz, sz, colors[i]));
      }
    } else if (id === 'geometry') {
      a.push(item(-0.62, 0, 0, 0.42, 0.42, 0.42, '#83c6e8', t));
      a.push(item(0.35, 0.02, 0, 0.48, 0.48, 0.48, '#d8b66a', -t));
      a.push(item(0, -0.62, 0.1, 0.27, 0.27, 0.27, '#7fc6a0', t * 0.6));
      a.push(item(0, 0.66, -0.1, 0.31, 0.31, 0.31, '#b68bd1', -t * 0.5));
    } else if (id === 'network') {
      for (let i = 0; i < 13; i++) {
        const q = i * 2.399 + t * 0.1, r = 0.4 + (i % 3) * 0.22;
        a.push(item(Math.cos(q) * r, Math.sin(q * 1.4) * 0.62, Math.sin(q) * r, 0.105, 0.105, 0.105, i % 4 === 0 ? '#d8b66a' : '#83c6e8'));
      }
      a.push(item(0, 0, 0, 0.27, 0.27, 0.27, '#7fc6a0'));
    }
    return a;
  }

  function resizeCanvas() {
    if (!gl) return;
    const w = canvas.clientWidth || 300;
    const h = canvas.clientHeight || 300;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rw = Math.round(w * dpr), rh = Math.round(h * dpr);
    if (canvas.width !== rw || canvas.height !== rh) {
      canvas.width = rw;
      canvas.height = rh;
    }
  }

  function draw() {
    if (!gl || gl.isContextLost()) return;
    resizeCanvas();
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    const stride = 24;
    gl.enableVertexAttribArray(loc.pos);
    gl.vertexAttribPointer(loc.pos, 3, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(loc.nor);
    gl.vertexAttribPointer(loc.nor, 3, gl.FLOAT, false, stride, 12);

    const aspect = canvas.width / Math.max(1, canvas.height);
    const proj = perspective(Math.PI / 4, aspect, 0.1, 100);
    const view = translate(0, 0, -4.1 / zoom);
    const rot = matMul(rotateY(yaw), rotateX(pitch));
    const global = matMul(view, rot);

    for (const o of scene(current, frame)) {
      const m = matMul(translate(o.x, o.y, o.z), matMul(rotateY(o.rot), scale(o.sx, o.sy, o.sz)));
      gl.uniformMatrix4fv(loc.model, false, m);
      gl.uniformMatrix4fv(loc.mvp, false, matMul(proj, matMul(global, m)));
      gl.uniform3fv(loc.color, hex(o.color));
      gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, 0);
    }
  }

  function needsDamping() {
    return (
      Math.abs(targetYaw - yaw) > 0.0005 ||
      Math.abs(targetPitch - pitch) > 0.0005 ||
      Math.abs(targetZoom - zoom) > 0.0005
    );
  }

  function tick() {
    raf = 0;
    if (playing) {
      frame += 0.016;
      if (autoRotate && pointers.size === 0) targetYaw += 0.004;
    }
    const ease = reduced ? 1 : 0.16;
    yaw += (targetYaw - yaw) * ease;
    pitch += (targetPitch - pitch) * ease;
    zoom += (targetZoom - zoom) * ease;
    draw();
    if (playing || needsDamping()) {
      raf = requestAnimationFrame(tick);
    }
  }

  function scheduleRender() {
    if (!raf) raf = requestAnimationFrame(tick);
  }

  function play() {
    playing = true;
    if ($('playModel')) $('playModel').textContent = 'Pause animation';
    scheduleRender();
  }

  function pause() {
    playing = false;
    if ($('playModel')) $('playModel').textContent = 'Play animation';
    if (!needsDamping()) {
      cancelAnimationFrame(raf);
      raf = 0;
      draw();
    }
  }

  function resetView() {
    targetYaw = -0.45;
    targetPitch = 0.22;
    targetZoom = 1;
    scheduleRender();
  }

  function setZoom(next) {
    targetZoom = Math.max(0.6, Math.min(2.0, next));
    scheduleRender();
  }

  function select(id) {
    const m = models.find((x) => x.id === id);
    if (!m) return;
    current = id;
    title.textContent = m.title;
    description.textContent = m.description;
    if ($('modelTopic')) $('modelTopic').textContent = m.topic;
    if ($('modelReview')) $('modelReview').textContent = m.review_status;
    fallback.src = m.fallback;
    fallback.alt = m.alt;
    catalog.querySelectorAll('button').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.model === id));
    });
    frame = 0;
    resetView();
  }

  function bind() {
    catalog.addEventListener('click', (e) => {
      const b = e.target.closest('[data-model]');
      if (b) select(b.dataset.model);
    });
    if ($('playModel')) $('playModel').addEventListener('click', () => (playing ? pause() : play()));
    if ($('resetModel')) $('resetModel').addEventListener('click', resetView);
    if ($('zoomIn')) $('zoomIn').addEventListener('click', () => setZoom(targetZoom + 0.14));
    if ($('zoomOut')) $('zoomOut').addEventListener('click', () => setZoom(targetZoom - 0.14));
    if ($('autoRotateModel')) {
      const btn = $('autoRotateModel');
      btn.setAttribute('aria-pressed', String(autoRotate));
      btn.addEventListener('click', () => {
        autoRotate = !autoRotate;
        btn.setAttribute('aria-pressed', String(autoRotate));
        btn.textContent = autoRotate ? 'Auto-rotate: On' : 'Auto-rotate: Off';
        scheduleRender();
      });
    }
    if ($('fullscreenModel')) {
      const fsBtn = $('fullscreenModel');
      const wrap = canvas.parentElement;
      if (!document.fullscreenEnabled) {
        fsBtn.hidden = true;
      } else {
        fsBtn.addEventListener('click', () => {
          if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
          else wrap.requestFullscreen().catch(() => {});
        });
      }
    }

    canvas.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { targetYaw -= 0.14; e.preventDefault(); }
      else if (e.key === 'ArrowRight') { targetYaw += 0.14; e.preventDefault(); }
      else if (e.key === 'ArrowUp') { targetPitch = Math.max(-1.2, targetPitch - 0.14); e.preventDefault(); }
      else if (e.key === 'ArrowDown') { targetPitch = Math.min(1.2, targetPitch + 0.14); e.preventDefault(); }
      else if (e.key === '+' || e.key === '=') { setZoom(targetZoom + 0.14); e.preventDefault(); }
      else if (e.key === '-') { setZoom(targetZoom - 0.14); e.preventDefault(); }
      else return;
      scheduleRender();
    });

    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      setZoom(targetZoom - Math.sign(e.deltaY) * 0.1);
    }, { passive: false });

    canvas.addEventListener('pointerdown', (e) => {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      canvas.setPointerCapture(e.pointerId);
      if (pointers.size === 2) {
        const [p1, p2] = [...pointers.values()];
        pinchStartDist = Math.hypot(p2.x - p1.x, p2.y - p1.y) || 1;
        pinchStartZoom = targetZoom;
      }
    });

    canvas.addEventListener('pointermove', (e) => {
      if (!pointers.has(e.pointerId)) return;
      const prev = pointers.get(e.pointerId);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 1) {
        targetYaw += (e.clientX - prev.x) * 0.0085;
        targetPitch = Math.max(-1.2, Math.min(1.2, targetPitch + (e.clientY - prev.y) * 0.0085));
        scheduleRender();
      } else if (pointers.size === 2) {
        const [p1, p2] = [...pointers.values()];
        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        setZoom(pinchStartZoom * (dist / pinchStartDist));
      }
    });

    const endPointer = (e) => pointers.delete(e.pointerId);
    canvas.addEventListener('pointerup', endPointer);
    canvas.addEventListener('pointercancel', endPointer);

    canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      pause();
      fallback.hidden = false;
      canvas.hidden = true;
      status.textContent = '3D graphics paused because the graphics context was lost. Showing 2D fallback.';
    });

    canvas.addEventListener('webglcontextrestored', () => {
      if (init()) {
        status.textContent = '3D graphics restored.';
        if (!reduced) play();
        else scheduleRender();
      }
    });

    if (window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => scheduleRender());
      resizeObserver.observe(canvas);
    } else {
      window.addEventListener('resize', scheduleRender);
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) pause();
      else if (!reduced) play();
    });
  }

  function boot(list, offlineMode) {
    models = list;
    catalog.innerHTML = models
      .map((m) => `<button type="button" data-model="${m.id}" aria-pressed="false"><b>${m.title}</b><small>${m.topic}</small></button>`)
      .join('');
    const ok = init();
    bind();
    select(models.some((m) => m.id === requestedModel) ? requestedModel : models[0].id);
    if (ok) {
      status.textContent = offlineMode
        ? 'Offline mode active · Drag to rotate, pinch or scroll to zoom.'
        : 'Interactive WebGL model ready. Drag to rotate; pinch or scroll to zoom.';
      if (playing) play();
      else pause();
    } else {
      ['playModel', 'zoomIn', 'zoomOut', 'autoRotateModel'].forEach((id) => {
        if ($(id)) $(id).disabled = true;
      });
    }
  }

  window.ZD3D = {
    select,
    play,
    pause,
    reset: resetView,
    getState: () => ({ current, yaw, pitch, zoom, playing, autoRotate })
  };

  fetch('./data/visual-studio.json')
    .then((r) => {
      if (!r.ok) throw new Error('Visual library could not load');
      return r.json();
    })
    .then((data) => {
      if (!data || !Array.isArray(data.models) || !data.models.length) throw new Error('Empty catalog');
      boot(data.models, false);
    })
    .catch(() => {
      boot(FALLBACK_MODELS, true);
    });
})();
    

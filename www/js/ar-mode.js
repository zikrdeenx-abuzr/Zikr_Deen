/* Zikr Deen App — 360° 3D Namaz Studio & Qibla Compass (Camera-Free Final Version):
   1. Zero Camera Code — koi getUserMedia, video tag ya camera permission nahi.
   2. Edge Flood-Fill Chroma-Key — 06. Sajda mein black patches / cut-out glitch 100% fixed.
   3. Direct 360° Touch Swipe + Pinch Zoom + Auto-Spin + Size/Angle Sliders.
   4. Clean Qibla Direction Compass HUD + GPS location + Snapshot save.
*/
(function () {
  'use strict';
  const ZD = window.ZD, $ = ZD.$, esc = ZD.esc, icon = ZD.icon, R = ZD.R;

  const SET_COUNTS = [48, 48, 48, 36, 48, 48, 48, 9];
  const AR_POSES = [
    { id: 0, name: '01. Qiyam', hi: 'सीधा खड़े होना और निय्यत', step: 0 },
    { id: 1, name: '02. Takbeer', hi: 'तकबीर-ए-तहरीमा (हाथ उठाना)', step: 1 },
    { id: 2, name: '03. Haath Bandhna', hi: 'क़ियाम में हाथ बाँधना', step: 2 },
    { id: 3, name: '04. Ruku', hi: 'रुकू की सही पोज़िशन (90°)', step: 3 },
    { id: 4, name: '05. Qauma', hi: 'रुकू से सीधा खड़े होना', step: 4 },
    { id: 5, name: '06. Sajda', hi: '7 अंगों पर सजदा करना', step: 5 },
    { id: 6, name: '07. Tashahhud', hi: 'क़अदा / तशह्हुद में बैठना', step: 7 },
    { id: 7, name: '08. Salam', hi: 'दाएँ और बाएँ सलाम फेरना', step: 8 }
  ];

  /* ---------- Scoped CSS for clean 3D Studio & smooth touch gestures ---------- */
  function injectStyles() {
    if (document.getElementById('zd-studio360-css')) return;
    const st = document.createElement('style');
    st.id = 'zd-studio360-css';
    st.textContent =
      '#arStage{touch-action:none!important;user-select:none;-webkit-user-select:none;position:relative;overflow:hidden;background:radial-gradient(circle at 50% 34%,#173e2f 0%,#0b1e17 68%,#06120e 100%)!important}' +
      '#arStage .ar-studio-bg{position:absolute;inset:0;z-index:1;pointer-events:none;background:radial-gradient(circle at 50% 34%,#173e2f 0%,#0b1e17 68%,#06120e 100%)}' +
      '#arStage .ar-model-layer,#arStage .ar-model-box,#arStage .ar-hud-tip,#arStage .ar-shadow,#arStage canvas{pointer-events:none!important}' +
      '#arStage .ar-model-layer{position:absolute;inset:0;z-index:3}' +
      '#arStage .ar-qibla-layer{position:absolute;inset:0;z-index:4;pointer-events:none}' +
      '#arStage .ar-hud-tip{position:absolute;bottom:10px;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:11px;padding:5px 12px;border-radius:99px;background:rgba(7,19,15,.78);color:#f4f3e9;border:1px solid rgba(216,182,106,.35);z-index:5}' +
      '#arStage .ar-deg-pill{position:absolute;top:10px;right:10px;font:700 11px system-ui,sans-serif;padding:4px 9px;border-radius:99px;background:rgba(7,19,15,.74);color:#d8b66a;border:1px solid rgba(216,182,106,.35);z-index:5;pointer-events:none}' +
      '#arStage .ar-pose-pill{position:absolute;top:10px;left:10px;font:600 11px system-ui,sans-serif;padding:4px 10px;border-radius:99px;background:rgba(7,19,15,.74);color:#e5eee6;border:1px solid rgba(127,198,160,.3);z-index:5;pointer-events:none;max-width:65%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
      '.ar-quickbar{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0 10px}' +
      '.ar-quickbar .btn.on{background:linear-gradient(130deg,#d8b66a,#a67e3e)!important;color:#17241b!important;border-color:transparent!important}';
    document.head.appendChild(st);
  }

  /* ---------- Qibla math (synced with qibla.js & prayer.js) ---------- */
  const KAABA = { lat: 21.422487, lng: 39.826206 }, D = Math.PI / 180;
  function getPlace() {
    try { const q = JSON.parse(localStorage.getItem('zd-qibla-v1') || 'null'); if (q && isFinite(q.lat) && isFinite(q.lng)) return q; } catch (_) {}
    try { const p = JSON.parse(localStorage.getItem('zd-prayer-v1') || 'null'); if (p && isFinite(p.lat) && isFinite(p.lng)) return { lat: p.lat, lng: p.lng, label: p.label || p.city || 'Saved City' }; } catch (_) {}
    return { lat: 26.8467, lng: 80.9462, label: 'Lucknow, UP' };
  }
  function qiblaBearing(lat, lng) {
    const p1 = lat * D, p2 = KAABA.lat * D, dl = (KAABA.lng - lng) * D;
    const y = Math.sin(dl) * Math.cos(p2), x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl);
    return (Math.atan2(y, x) / D + 360) % 360;
  }
  function qiblaDist(lat, lng) {
    const p1 = lat * D, p2 = KAABA.lat * D, dp = p2 - p1, dl = (KAABA.lng - lng) * D;
    const a = Math.pow(Math.sin(dp / 2), 2) + Math.cos(p1) * Math.cos(p2) * Math.pow(Math.sin(dl / 2), 2);
    return 6371 * 2 * Math.asin(Math.min(1, Math.sqrt(a)));
  }
  function headingFrom(e) {
    if (typeof e.webkitCompassHeading === 'number' && !isNaN(e.webkitCompassHeading)) return e.webkitCompassHeading;
    if (e.alpha == null) return null;
    const a = e.alpha * D, b = (e.beta || 0) * D, g = (e.gamma || 0) * D;
    let east, north;
    if (Math.abs(e.beta || 0) < 45) {
      east = -Math.sin(a) * Math.cos(b);
      north = Math.cos(a) * Math.cos(b);
    } else {
      east = -(Math.cos(a) * Math.sin(g) + Math.sin(a) * Math.sin(b) * Math.cos(g));
      north = Math.cos(a) * Math.sin(b) * Math.cos(g) - Math.sin(a) * Math.sin(g);
    }
    return (Math.atan2(east, north) / D + 360) % 360;
  }

  /* ---------- Edge Flood-Fill Chroma-Key (Fixes 06. Sajda Black Patches) ---------- */
  const keyedCache = new Map();
  const inflight = new Map();
  const offCv = document.createElement('canvas');
  const offCx = offCv.getContext('2d', { willReadFrequently: true });

  function stripBackgroundFloodFill(imgData, W, H) {
    const d = imgData.data;
    const total = W * H;

    // Sample all 4 outer corners to detect studio backdrop color
    const corners = [0, W - 1, (H - 1) * W, total - 1];
    let r0 = 0, g0 = 0, b0 = 0;
    for (let c = 0; c < 4; c++) {
      const idx = corners[c] * 4;
      r0 += d[idx]; g0 += d[idx + 1]; b0 += d[idx + 2];
    }
    r0 /= 4; g0 /= 4; b0 /= 4;

    const bgMask = new Uint8Array(total);
    const queue = new Int32Array(total);
    let head = 0, tail = 0;

    const BG_DIST_SQ = 34 * 34;
    const STEP_DIST_SQ = 20 * 20;

    function isBgCandidate(pIdx) {
      const i = pIdx * 4;
      const dr = d[i] - r0, dg = d[i + 1] - g0, db = d[i + 2] - b0;
      return (dr * dr + dg * dg + db * db) <= BG_DIST_SQ;
    }

    function pushIfBg(pIdx) {
      if (bgMask[pIdx]) return;
      if (isBgCandidate(pIdx)) {
        bgMask[pIdx] = 1;
        queue[tail++] = pIdx;
      }
    }

    // Flood-fill strictly from outer edges so character kurta/topi is never cut
    for (let x = 0; x < W; x++) {
      pushIfBg(x);
      pushIfBg((H - 1) * W + x);
    }
    for (let y = 1; y < H - 1; y++) {
      pushIfBg(y * W);
      pushIfBg(y * W + (W - 1));
    }

    while (head < tail) {
      const p = queue[head++];
      const x = p % W, y = (p - x) / W;
      const pi = p * 4;
      const pr = d[pi], pg = d[pi + 1], pb = d[pi + 2];

      const tryNeighbor = (np) => {
        if (bgMask[np]) return;
        const ni = np * 4;
        const dr0 = d[ni] - r0, dg0 = d[ni + 1] - g0, db0 = d[ni + 2] - b0;
        if ((dr0 * dr0 + dg0 * dg0 + db0 * db0) > BG_DIST_SQ) return;
        const dr = d[ni] - pr, dg = d[ni + 1] - pg, db = d[ni + 2] - pb;
        if ((dr * dr + dg * dg + db * db) <= STEP_DIST_SQ) {
          bgMask[np] = 1;
          queue[tail++] = np;
        }
      };

      if (x > 0) tryNeighbor(p - 1);
      if (x < W - 1) tryNeighbor(p + 1);
      if (y > 0) tryNeighbor(p - W);
      if (y < H - 1) tryNeighbor(p + W);
    }

    for (let p = 0; p < total; p++) {
      if (bgMask[p]) {
        d[p * 4 + 3] = 0;
      } else {
        const x = p % W, y = (p - x) / W;
        const nearBg =
          (x > 0 && bgMask[p - 1]) ||
          (x < W - 1 && bgMask[p + 1]) ||
          (y > 0 && bgMask[p - W]) ||
          (y < H - 1 && bgMask[p + W]);
        if (nearBg) {
          const i = p * 4;
          const dr = d[i] - r0, dg = d[i + 1] - g0, db = d[i + 2] - b0;
          const dist = Math.sqrt(dr * dr + dg * dg + db * db);
          if (dist < 46) {
            d[i + 3] = Math.round(Math.max(0.25, (dist - 24) / 22) * 255);
          }
        }
      }
    }
    return imgData;
  }

  function loadKeyedFrame(setIdx, frameIdx) {
    const N = SET_COUNTS[setIdx] || 1;
    const f = ((frameIdx % N) + N) % N;
    const key = setIdx + ':' + f;
    if (keyedCache.has(key)) return Promise.resolve(keyedCache.get(key));
    if (inflight.has(key)) return inflight.get(key);

    const url = './assets/namaz3d/s' + setIdx + '/' + String(f).padStart(2, '0') + '.webp';
    const prom = new Promise((res) => {
      const im = new Image();
      im.decoding = 'async';
      im.onload = () => {
        try {
          const W = 380, H = Math.round(W * (im.height / Math.max(1, im.width)));
          offCv.width = W;
          offCv.height = H;
          offCx.clearRect(0, 0, W, H);
          offCx.drawImage(im, 0, 0, W, H);
          const cleaned = stripBackgroundFloodFill(offCx.getImageData(0, 0, W, H), W, H);
          offCx.putImageData(cleaned, 0, 0);

          const out = document.createElement('canvas');
          out.width = W;
          out.height = H;
          out.getContext('2d').drawImage(offCv, 0, 0);

          if (keyedCache.size > 60) {
            const oldest = keyedCache.keys().next().value;
            keyedCache.delete(oldest);
          }
          keyedCache.set(key, out);
          res(out);
        } catch (_) {
          res(im);
        }
      };
      im.onerror = () => res(null);
      im.src = url;
    }).finally(() => {
      inflight.delete(key);
    });

    inflight.set(key, prom);
    return prom;
  }

  /* ================= 360° 3D NAMAZ STUDIO & QIBLA VIEW (#/ar-mode) ================= */
  R['ar-mode'] = function () {
    injectStyles();
    const v = $('#view');
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let mode = 'namaz';       // 'namaz' | 'qibla'
    let touchMode = 'rotate'; // 'rotate' (360° swipe) | 'move' (reposition)
    let poseIdx = 2;          // Default: 03. Haath Bandhna
    let rotDeg = 0;           // 0..359
    let scalePct = 100;       // 55..150
    let posX = 50, posY = 54; // % coordinates on stage
    let autoSpin = false, spinRaf = 0, lastSpinTs = 0;
    let heading = null, sinH = 0, cosH = 0, oriHandler = null;

    const place = getPlace();
    const targetB = qiblaBearing(place.lat, place.lng);
    const targetKm = Math.round(qiblaDist(place.lat, place.lng));

    v.innerHTML =
      '<header class="topbar"><button class="ibtn" data-act="back" aria-label="Back">' + icon('back') + '</button>' +
      '<h1>360° 3D Namaz Studio<span class="sub">3D पोज़ व्यूअर · क़िबला डायरेक्शन</span></h1>' +
      '<button class="ibtn" id="arSnapBtn" title="Snapshot" aria-label="Save Snapshot">📸</button></header>' +
      '<main class="ar-wrap">' +
        '<div class="seg" id="arModeSeg" role="tablist" style="margin:6px 0 10px">' +
          '<button type="button" role="tab" data-am="namaz" aria-selected="true">🕌 360° 3D नमाज़</button>' +
          '<button type="button" role="tab" data-am="qibla" aria-selected="false">🧭 क़िबला डायरेक्शन</button>' +
        '</div>' +

        '<div class="ar-stage" id="arStage">' +
          '<div class="ar-studio-bg"><div class="ar-grid-floor"></div></div>' +

          /* 3D Namaz Layer */
          '<div class="ar-model-layer" id="arModelLayer">' +
            '<div class="ar-pose-pill" id="arPosePill">' + esc(AR_POSES[poseIdx].hi) + '</div>' +
            '<div class="ar-deg-pill" id="arDegPill">360° · 0°</div>' +
            '<div class="ar-model-box" id="arModelBox" style="left:50%;top:54%">' +
              '<div class="ar-shadow"></div>' +
              '<canvas id="arPoseCv" width="380" height="640"></canvas>' +
            '</div>' +
            '<div class="ar-hud-tip" id="arHudTip">👆 स्क्रीन पर दाएँ-बाएँ स्लाइड करके 360° घुमाएँ</div>' +
          '</div>' +

          /* Qibla Compass HUD Layer (No Camera) */
          '<div class="ar-qibla-layer" id="arQiblaLayer" hidden>' +
            '<div class="ar-q-top"><span id="arQCity">📍 ' + esc(place.label) + '</span><span>' + Math.round(targetB) + '° · ' + targetKm.toLocaleString('en-IN') + ' km</span></div>' +
            '<div class="ar-q-reticle" id="arQReticle">' +
              '<div class="ar-q-ring"></div>' +
              '<div class="ar-q-kaaba" id="arQKaaba">🕋</div>' +
              '<div class="ar-q-arrow" id="arQArrow">▲</div>' +
            '</div>' +
            '<div class="ar-q-say" id="arQSay">फ़ोन को सीधा पकड़कर चारों तरफ़ घुमाएँ…</div>' +
          '</div>' +
        '</div>' +

        /* Controls for 3D Namaz */
        '<section class="block card" id="arNamazCtrl">' +
          '<div class="ar-poses" id="arPoses">' +
            AR_POSES.map((p, i) => '<button type="button" class="tb-chip' + (i === poseIdx ? ' on' : '') + '" data-ap="' + i + '">' + esc(p.name) + '</button>').join('') +
          '</div>' +
          '<div class="ar-quickbar">' +
            '<button type="button" class="btn sm ghost" id="arAutoBtn">▶ ऑटो 360°</button>' +
            '<button type="button" class="btn sm ghost" id="arTouchToggle">🔄 स्लाइड: 360° घुमाएँ</button>' +
            '<button type="button" class="btn sm ghost" id="arResetBtn">↺ रीसेट</button>' +
          '</div>' +
          '<div class="field"><label for="arRot">🔄 360° एंगल (<b id="arRotVal">0°</b>)</label><input type="range" id="arRot" min="0" max="359" value="0"></div>' +
          '<div class="field"><label for="arScl">🔍 साइज़ (<b id="arSclVal">100%</b>)</label><input type="range" id="arScl" min="55" max="150" value="100"></div>' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">' +
            '<a class="btn sm" id="arFull3dLink" href="./namaz-3d.html?step=2">📖 दुआ और दलील देखें →</a>' +
            '<a class="btn sm ghost" href="#/namaz3d">🕌 3D Namaz Grid</a>' +
          '</div>' +
        '</section>' +

        /* Controls for Qibla Compass */
        '<section class="block card" id="arQiblaCtrl" hidden>' +
          '<p class="muted small" style="margin:0 0 10px">जब स्क्रीन पर <b>🕋 काबा</b> बीच के घेरे में आ जाए और घेरा हरा हो जाए, तो वही क़िबला की सही दिशा है।</p>' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
            '<button type="button" class="btn sm" id="arQGps">📍 GPS से लोकेशन लें</button>' +
            '<a class="btn sm ghost" href="#/qibla">🧭 स्टैंडर्ड कंपास खोलें</a>' +
          '</div>' +
        '</section>' +
      '</main>';

    const stage = $('#arStage');
    const mBox = $('#arModelBox'), pCv = $('#arPoseCv'), pCx = pCv.getContext('2d');
    const rotInput = $('#arRot'), rotVal = $('#arRotVal'), degPill = $('#arDegPill'), posePill = $('#arPosePill');
    const sclInput = $('#arScl'), sclVal = $('#arSclVal');

    let drawReq = 0, lastFrameKey = '';
    async function renderPose(force) {
      const pose = AR_POSES[poseIdx];
      const N = SET_COUNTS[pose.id] || 1;
      const deg = ((Math.round(rotDeg) % 360) + 360) % 360;
      const fIdx = Math.floor((deg / 360) * N) % N;
      const fKey = pose.id + ':' + fIdx;

      rotInput.value = String(deg);
      rotVal.textContent = deg + '°';
      degPill.textContent = '360° · ' + deg + '°';
      if (posePill) posePill.textContent = pose.hi;

      if (!force && fKey === lastFrameKey) return;
      lastFrameKey = fKey;

      const req = ++drawReq;
      const canvasFrame = await loadKeyedFrame(pose.id, fIdx);
      if (req !== drawReq || !canvasFrame) return;

      if (pCv.width !== canvasFrame.width || pCv.height !== canvasFrame.height) {
        pCv.width = canvasFrame.width;
        pCv.height = canvasFrame.height;
      }
      pCx.clearRect(0, 0, pCv.width, pCv.height);
      pCx.drawImage(canvasFrame, 0, 0);

      // Warm neighboring frames for smooth swiping
      loadKeyedFrame(pose.id, fIdx + 1);
      loadKeyedFrame(pose.id, fIdx - 1);
    }

    function updateTransform() {
      mBox.style.left = posX + '%';
      mBox.style.top = posY + '%';
      mBox.style.transform = 'translate(-50%,-50%) scale(' + (scalePct / 100) + ')';
      sclInput.value = String(Math.round(scalePct));
      sclVal.textContent = Math.round(scalePct) + '%';
    }

    /* ---------- Auto-Spin Loop ---------- */
    function stopSpin() {
      autoSpin = false;
      if (spinRaf) { cancelAnimationFrame(spinRaf); spinRaf = 0; }
      const b = $('#arAutoBtn');
      if (b) { b.textContent = '▶ ऑटो 360°'; b.classList.remove('on'); }
    }

    function startSpin() {
      if (reduced) { ZD.toast('Reduced motion चालू है'); return; }
      autoSpin = true;
      lastSpinTs = performance.now();
      const b = $('#arAutoBtn');
      if (b) { b.textContent = '⏸ रोकें'; b.classList.add('on'); }
      const step = (ts) => {
        if (!autoSpin) return;
        const dt = Math.min(0.1, (ts - lastSpinTs) / 1000);
        lastSpinTs = ts;
        rotDeg = (rotDeg + dt * 42) % 360;
        renderPose(false);
        spinRaf = requestAnimationFrame(step);
      };
      spinRaf = requestAnimationFrame(step);
    }

    /* ---------- Direct Stage Touch: 360° Swipe, Pinch Zoom & Optional Move ---------- */
    const activePtrs = new Map();
    let startRot = 0, startX = 0, startY = 0, ox = 50, oy = 54;
    let pinchDist = 0, pinchScale = 100;

    stage.addEventListener('pointerdown', (e) => {
      if (mode !== 'namaz') return;
      if (autoSpin) stopSpin();
      activePtrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      try { stage.setPointerCapture(e.pointerId); } catch (_) {}

      if (activePtrs.size === 1) {
        startX = e.clientX;
        startY = e.clientY;
        startRot = rotDeg;
        ox = posX;
        oy = posY;
      } else if (activePtrs.size === 2) {
        const [p1, p2] = [...activePtrs.values()];
        pinchDist = Math.hypot(p2.x - p1.x, p2.y - p1.y) || 1;
        pinchScale = scalePct;
      }
    });

    stage.addEventListener('pointermove', (e) => {
      if (mode !== 'namaz' || !activePtrs.has(e.pointerId)) return;
      activePtrs.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (activePtrs.size === 2) {
        const [p1, p2] = [...activePtrs.values()];
        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        scalePct = Math.max(55, Math.min(150, pinchScale * (dist / pinchDist)));
        updateTransform();
        return;
      }

      const rect = stage.getBoundingClientRect();
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (touchMode === 'rotate') {
        const degPerPx = 360 / Math.max(220, rect.width * 0.85);
        rotDeg = ((startRot + dx * degPerPx) % 360 + 360) % 360;
        renderPose(false);
      } else {
        posX = Math.max(22, Math.min(78, ox + (dx / Math.max(1, rect.width)) * 100));
        posY = Math.max(26, Math.min(78, oy + (dy / Math.max(1, rect.height)) * 100));
        updateTransform();
      }
    });

    const endPtr = (e) => { activePtrs.delete(e.pointerId); };
    stage.addEventListener('pointerup', endPtr);
    stage.addEventListener('pointercancel', endPtr);

    /* ---------- Compass Sensor for Qibla HUD ---------- */
    async function startCompass() {
      stopCompass();
      try {
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
          const perm = await DeviceOrientationEvent.requestPermission();
          if (perm !== 'granted') {
            $('#arQSay').textContent = 'कंपास अनुमति नहीं मिली — स्टैंडर्ड कंपास देखें।';
            return;
          }
        }
      } catch (_) {}

      oriHandler = (e) => {
        const h = headingFrom(e);
        if (h == null || isNaN(h)) return;
        sinH = sinH * 0.75 + Math.sin(h * D) * 0.25;
        cosH = cosH * 0.75 + Math.cos(h * D) * 0.25;
        heading = (Math.atan2(sinH, cosH) / D + 360) % 360;
        const diff = ((targetB - heading + 540) % 360) - 180;
        const ad = Math.abs(diff);
        const ret = $('#arQReticle'), kb = $('#arQKaaba'), say = $('#arQSay');
        if (!ret) return;
        const shift = Math.max(-110, Math.min(110, diff * 1.8));
        kb.style.transform = 'translateX(' + shift.toFixed(1) + 'px)';
        const ok = ad <= 5;
        ret.classList.toggle('ok', ok);
        say.textContent = ok
          ? '✓ सामने क़िबला की दिशा है (Kaaba)'
          : (diff > 0 ? '👉 दाएँ मुड़ें (' + Math.round(ad) + '°)' : '👈 बाएँ मुड़ें (' + Math.round(ad) + '°)');
      };

      if ('ondeviceorientationabsolute' in window) window.addEventListener('deviceorientationabsolute', oriHandler, true);
      else window.addEventListener('deviceorientation', oriHandler, true);
    }

    function stopCompass() {
      if (oriHandler) {
        window.removeEventListener('deviceorientationabsolute', oriHandler, true);
        window.removeEventListener('deviceorientation', oriHandler, true);
        oriHandler = null;
      }
    }

    /* ---------- UI Event Bindings ---------- */
    $('#arModeSeg').addEventListener('click', (e) => {
      const b = e.target.closest('[data-am]');
      if (!b || b.dataset.am === mode) return;
      mode = b.dataset.am;
      $('#arModeSeg').querySelectorAll('[data-am]').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
      const isN = mode === 'namaz';
      $('#arModelLayer').hidden = !isN;
      $('#arNamazCtrl').hidden = !isN;
      $('#arQiblaLayer').hidden = isN;
      $('#arQiblaCtrl').hidden = isN;
      if (isN) {
        stopCompass();
      } else {
        stopSpin();
        startCompass();
      }
    });

    $('#arPoses').addEventListener('click', (e) => {
      const b = e.target.closest('[data-ap]');
      if (!b) return;
      poseIdx = +b.dataset.ap;
      $('#arPoses').querySelectorAll('[data-ap]').forEach((x) => x.classList.toggle('on', x === b));
      $('#arFull3dLink').href = './namaz-3d.html?step=' + AR_POSES[poseIdx].step;
      renderPose(true);
    });

    $('#arAutoBtn').addEventListener('click', () => (autoSpin ? stopSpin() : startSpin()));

    $('#arTouchToggle').addEventListener('click', () => {
      touchMode = touchMode === 'rotate' ? 'move' : 'rotate';
      const isRot = touchMode === 'rotate';
      $('#arTouchToggle').textContent = isRot ? '🔄 स्लाइड: 360° घुमाएँ' : '✋ स्लाइड: जगह बदलें';
      $('#arTouchToggle').classList.toggle('on', !isRot);
      $('#arHudTip').textContent = isRot
        ? '👆 स्क्रीन पर दाएँ-बाएँ स्लाइड करके 360° घुमाएँ'
        : '✋ उँगली से मॉडल को ऊपर-नीचे या दाएँ-बाएँ रखें';
    });

    $('#arResetBtn').addEventListener('click', () => {
      stopSpin();
      rotDeg = 0; scalePct = 100; posX = 50; posY = 54;
      updateTransform();
      renderPose(true);
    });

    rotInput.addEventListener('input', (e) => {
      if (autoSpin) stopSpin();
      rotDeg = +e.target.value;
      renderPose(false);
    });

    sclInput.addEventListener('input', (e) => {
      scalePct = +e.target.value;
      updateTransform();
    });

    if ($('#arQGps')) {
      $('#arQGps').addEventListener('click', () => {
        if (!navigator.geolocation) { ZD.toast('GPS उपलब्ध नहीं है'); return; }
        ZD.toast('लोकेशन ली जा रही है…');
        navigator.geolocation.getCurrentPosition((pos) => {
          try {
            localStorage.setItem('zd-qibla-v1', JSON.stringify({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              label: 'Meri location (GPS)'
            }));
          } catch (_) {}
          R['ar-mode']();
          ZD.toast('GPS लोकेशन अपडेट हो गई');
        }, () => ZD.toast('GPS लोकेशन नहीं मिल सकी'), { timeout: 12000 });
      });
    }

    // Snapshot Capture (Studio Backdrop + 3D Pose)
    $('#arSnapBtn').addEventListener('click', () => {
      try {
        const W = 720, H = 1080, c = document.createElement('canvas');
        c.width = W; c.height = H;
        const g = c.getContext('2d');
        const gr = g.createLinearGradient(0, 0, 0, H);
        gr.addColorStop(0, '#133326');
        gr.addColorStop(1, '#07130f');
        g.fillStyle = gr;
        g.fillRect(0, 0, W, H);
        if (mode === 'namaz') {
          const mw = W * 0.58 * (scalePct / 100);
          const mh = mw * (pCv.height / Math.max(1, pCv.width));
          const mx = (posX / 100) * W - mw / 2;
          const my = (posY / 100) * H - mh / 2;
          g.drawImage(pCv, mx, my, mw, mh);
        }
        g.fillStyle = 'rgba(0,0,0,0.55)';
        g.fillRect(0, H - 64, W, 64);
        g.fillStyle = '#fde68a';
        g.font = 'bold 24px system-ui,sans-serif';
        g.textAlign = 'center';
        g.fillText('Zikr Deen 3D · ' + AR_POSES[poseIdx].name, W / 2, H - 24);
        c.toBlob((blob) => {
          if (blob) {
            ZD.download('zikr-deen-3d-' + Date.now() + '.png', blob);
            ZD.toast('📸 Snapshot सेव हो गया');
          }
        }, 'image/png');
      } catch (_) {
        ZD.toast('Snapshot नहीं बन सका');
      }
    });

    ZD.onLeave(() => {
      stopSpin();
      stopCompass();
    });

    updateTransform();
    renderPose(true);
  };
})();

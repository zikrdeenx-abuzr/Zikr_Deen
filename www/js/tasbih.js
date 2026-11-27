(function () {
  'use strict';
  const ZD = window.ZD, $ = ZD.$, esc = ZD.esc, icon = ZD.icon, R = ZD.R;
  const SKEY = 'zdTasbihV1';
  const PRESETS = [
    { id: 'subhan', ar: 'سُبْحَانَ اللَّهِ', rom: 'SubhanAllah', mean: 'अल्लाह पाक है · Glory be to Allah', ref: 'तस्बीह-ए-फ़ातिमा · सहीह मुस्लिम: 597', target: 33 },
    { id: 'hamd', ar: 'الْحَمْدُ لِلَّهِ', rom: 'Alhamdulillah', mean: 'सारी तारीफ़ अल्लाह के लिए है · Praise be to Allah', ref: 'तस्बीह-ए-फ़ातिमा · सहीह मुस्लिम: 597', target: 33 },
    { id: 'akbar', ar: 'اللَّهُ أَكْبَرُ', rom: 'Allahu Akbar', mean: 'अल्लाह सबसे बड़ा है · Allah is the Greatest', ref: 'तस्बीह-ए-फ़ातिमा · सहीह मुस्लिम: 597', target: 34 },
    { id: 'tahlil', ar: 'لَا إِلَٰهَ إِلَّا اللَّهُ', rom: 'La ilaha illallah', mean: 'अल्लाह के सिवा कोई माबूद नहीं', ref: 'सहीह बुख़ारी: 6403 · सहीह मुस्लिम: 2691', target: 100 },
    { id: 'istigh', ar: 'أَسْتَغْفِرُ اللَّهَ', rom: 'Astaghfirullah', mean: 'मैं अल्लाह से माफ़ी माँगता हूँ', ref: 'सहीह मुस्लिम: 2702', target: 100 },
    { id: 'durood', ar: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ', rom: 'Durood Sharif', mean: 'ऐ अल्लाह, मुहम्मद ﷺ पर रहमत नाज़िल फ़रमा', ref: 'सहीह मुस्लिम: 408', target: 100 }
  ];
  const FATIMA_SEQ = ['subhan', 'hamd', 'akbar'];
  const BEAD_THEMES = [
    { id: 'wood', name: 'लकड़ी' },
    { id: 'gold', name: 'गोल्ड' },
    { id: 'pearl', name: 'मोती' },
    { id: 'emerald', name: 'एमराल्ड' }
  ];

  function todayISO() {
    try {
      if (ZD && typeof ZD.today === 'function') return ZD.today();
    } catch (_) {}
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function loadT() {
    const td = todayISO();
    try {
      const d = JSON.parse(localStorage.getItem(SKEY) || '{}');
      const sameDay = d.day === td;
      return {
        preset: d.preset || 'subhan',
        custom: d.custom || '',
        count: Number(d.count) || 0,
        set: Math.max(1, Number(d.set) || 1),
        target: d.target === 0 ? 0 : (Number(d.target) || 33),
        total: Math.max(0, Number(d.total) || 0),
        day: td,
        todayCount: sameDay ? Math.max(0, Number(d.todayCount) || 0) : 0,
        vib: d.vib !== false,
        snd: d.snd !== false,
        fatima: !!d.fatima,
        beadTheme: BEAD_THEMES.some(x => x.id === d.beadTheme) ? d.beadTheme : 'wood'
      };
    } catch (_) {
      return {
        preset: 'subhan',
        custom: '',
        count: 0,
        set: 1,
        target: 33,
        total: 0,
        day: td,
        todayCount: 0,
        vib: true,
        snd: true,
        fatima: false,
        beadTheme: 'wood'
      };
    }
  }

  function saveT(s) {
    try {
      s.day = todayISO();
      localStorage.setItem(SKEY, JSON.stringify(s));
    } catch (_) {}
  }

  function ensureStyles() {
    if (document.getElementById('zdTasbihProCss')) return;
    const style = document.createElement('style');
    style.id = 'zdTasbihProCss';
    style.textContent = [
      '.tb-wrap{padding-bottom:20px}',
      '.tb-chips{display:flex;gap:8px;overflow-x:auto;padding:8px 2px 10px;scrollbar-width:none;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;scroll-padding-inline:12px}',
      '.tb-chips::-webkit-scrollbar{display:none}',
      '.tb-chip{flex:none;padding:7px 13px;border-radius:999px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font-size:13px;font-weight:600;transition:background-color .16s ease,color .16s ease,border-color .16s ease}',
      '.tb-chip.on{background:var(--gold);color:var(--on-gold);border-color:var(--gold)}',
      '.tb-custom{margin:0 0 10px}',
      '.tb-custom[hidden]{display:none!important}',
      '.tb-custom input{width:100%;padding:10px 14px;border-radius:12px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font-size:15px}',
      '.tb-stage{text-align:center;padding:14px 12px 14px!important;position:relative;overflow:hidden}',
      '.tb-meta{display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap;font-size:12px;color:var(--muted);margin-bottom:8px}',
      '.tb-pill-m{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:999px;border:1px solid var(--line);background:var(--bg2);color:var(--ink);font-size:12px;font-weight:600;font-variant-numeric:tabular-nums}',
      '.tb-pill-m.on{background:var(--gold);color:var(--on-gold);border-color:var(--gold)}',
      '.tb-ar{font-size:34px;line-height:1.45;color:var(--gold-soft);margin:4px 0 2px}',
      '.tb-mean{font-size:13px;color:var(--ink);opacity:.86;margin-bottom:2px}',
      '.tb-ref{font-size:11.5px;color:var(--muted);margin-bottom:10px}',
      '.tb-orb-box{position:relative;width:186px;height:186px;margin:4px auto 8px;display:grid;place-items:center}',
      '.tb-ring-svg{position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg);pointer-events:none}',
      '.tb-ring-bg{fill:none;stroke:var(--veil2);stroke-width:9}',
      '.tb-ring-fg{fill:none;stroke:var(--gold);stroke-width:9;stroke-linecap:round;transition:stroke-dashoffset .22s cubic-bezier(.22,1,.36,1)}',
      '.tb-tap{position:relative;z-index:1;width:154px;height:154px;border-radius:50%;border:1.5px solid var(--line);background:radial-gradient(circle at 32% 28%,var(--raised),var(--surface));box-shadow:0 8px 24px rgba(0,0,0,.16),inset 0 0 18px var(--veil);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;transition:transform .1s ease}',
      '.tb-tap:active,.tb-tap.pop{transform:scale(.945)}',
      '.tb-num{font-size:46px;font-weight:800;line-height:1;letter-spacing:1px;color:var(--gold-soft);font-variant-numeric:tabular-nums}',
      '.tb-hint{font-size:10px;letter-spacing:1.3px;color:var(--muted);font-weight:700;margin-top:2px}',
      '.tb-rem{font-size:11.5px;color:var(--gold);font-weight:700;margin-top:2px;font-variant-numeric:tabular-nums}',
      '.tb-strand-wrap{margin:10px -4px 10px;padding:8px 0 2px;cursor:pointer;user-select:none;-webkit-user-select:none}',
      '.tb-strand{position:relative;height:82px;display:flex;align-items:flex-start;justify-content:center;padding-top:6px;overflow:hidden}',
      '.tb-string{position:absolute;left:6px;right:6px;top:29px;height:3px;border-radius:3px;background:linear-gradient(90deg,transparent,var(--gold) 12%,var(--gold) 88%,transparent);opacity:.55;pointer-events:none}',
      '.tb-beads-track{position:relative;z-index:2;display:grid;grid-template-columns:repeat(7,1fr);align-items:center;justify-items:center;width:100%;max-width:340px;gap:4px}',
      '.tb-beads-track.anim-fwd{animation:tbSlideFwd .18s cubic-bezier(.22,1,.36,1)}',
      '.tb-beads-track.anim-back{animation:tbSlideBack .18s cubic-bezier(.22,1,.36,1)}',
      '@keyframes tbSlideFwd{from{transform:translateX(18px)}to{transform:translateX(0)}}',
      '@keyframes tbSlideBack{from{transform:translateX(-18px)}to{transform:translateX(0)}}',
      '.tb-bcell{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;min-height:74px}',
      '.tb-bead{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;font-size:11.5px;font-weight:800;font-variant-numeric:tabular-nums;color:#fff9ec;text-shadow:0 1px 2px rgba(0,0,0,.55);box-shadow:0 4px 10px rgba(0,0,0,.28),inset 0 2px 4px rgba(255,255,255,.35),inset 0 -3px 6px rgba(0,0,0,.35);transition:transform .16s ease,opacity .16s ease;margin-top:6px}',
      '.tb-bead.past{opacity:.72;transform:scale(.92)}',
      '.tb-bead.next{opacity:.86;transform:scale(.95)}',
      '.tb-bead.far{opacity:.48;transform:scale(.82)}',
      '.tb-bead.empty{opacity:.18;transform:scale(.76);color:transparent;text-shadow:none}',
      '.tb-bead.goal{box-shadow:0 0 0 2px var(--gold),0 4px 10px rgba(0,0,0,.28),inset 0 2px 4px rgba(255,255,255,.35)}',
      '.tb-bead.cur{width:46px;height:46px;margin-top:0;font-size:16px;opacity:1;transform:scale(1);box-shadow:0 0 0 2.5px var(--gold-soft),0 6px 16px rgba(0,0,0,.34),inset 0 3px 6px rgba(255,255,255,.45),inset 0 -4px 8px rgba(0,0,0,.38)}',
      '.tb-bead.cur.done{box-shadow:0 0 0 3px #22c55e,0 6px 18px rgba(34,197,94,.42),inset 0 3px 6px rgba(255,255,255,.45)}',
      '.tb-strand[data-bt="wood"] .tb-bead{background:radial-gradient(circle at 32% 28%,#d89c5e 0%,#9e5e26 55%,#5b3110 100%)}',
      '.tb-strand[data-bt="gold"] .tb-bead{background:radial-gradient(circle at 32% 28%,#fff0b3 0%,#d4a02c 55%,#7c5508 100%);color:#2a1900;text-shadow:0 1px 0 rgba(255,255,255,.45)}',
      '.tb-strand[data-bt="pearl"] .tb-bead{background:radial-gradient(circle at 32% 28%,#ffffff 0%,#dcd8cf 58%,#9c9689 100%);color:#1f2430;text-shadow:none}',
      '.tb-strand[data-bt="emerald"] .tb-bead{background:radial-gradient(circle at 32% 28%,#6ee7b7 0%,#0f766e 56%,#064e3b 100%)}',
      '.tb-tassel{display:flex;flex-direction:column;align-items:center;margin-top:-1px;pointer-events:none}',
      '.tb-tassel-knot{width:9px;height:6px;border-radius:3px;background:var(--gold);box-shadow:0 1px 3px rgba(0,0,0,.3)}',
      '.tb-tassel-tail{display:flex;gap:2px;margin-top:1px}',
      '.tb-tassel-tail i{display:block;width:2px;height:16px;border-radius:2px;background:linear-gradient(180deg,var(--gold),var(--gold-soft));opacity:.9}',
      '.tb-tassel-tail i:nth-child(2){height:20px}',
      '.tb-tassel-tail i:nth-child(3){height:18px}',
      '.tb-tassel-tail i:nth-child(4){height:20px}',
      '.tb-bead-info{font-size:12px;color:var(--muted);margin-top:2px;font-weight:600;font-variant-numeric:tabular-nums}',
      '.tb-bead-info b{color:var(--gold-soft)}',
      '.tb-ctrl{display:flex;flex-direction:column;gap:8px;margin-top:8px}',
      '.tb-ranges{display:inline-flex;justify-content:center;gap:4px;padding:3px;border-radius:999px;background:var(--bg2);border:1px solid var(--line);margin:0 auto}',
      '.tb-rbtn{min-width:46px;padding:5px 12px;border-radius:999px;border:0;background:transparent;font-size:13px;font-weight:700;color:var(--muted)}',
      '.tb-rbtn.on{background:var(--gold);color:var(--on-gold)}',
      '.tb-acts{display:flex;justify-content:center;gap:6px;flex-wrap:wrap}',
      '.tb-acts .btn.sm{min-height:34px;padding:0 11px;font-size:12.5px}',
      '.tb-acts .btn.sm.on{border-color:var(--gold);color:var(--gold-soft);background:var(--raised)}',
      '.tb-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:10px;padding:12px 14px!important}',
      '.tb-fstats{display:flex;gap:14px;align-items:center}',
      '.tb-fstats b{display:block;font-size:17px;color:var(--gold-soft);line-height:1.15;font-variant-numeric:tabular-nums}',
      '.tb-focus .tb-chips,.tb-focus .tb-custom,.tb-focus .tb-foot,.tb-focus .tb-ranges{display:none!important}',
      '.tb-focus .tb-stage{min-height:calc(100vh - 185px);display:flex;flex-direction:column;justify-content:center}',
      '.tb-focus-bar{display:none;justify-content:center;margin-bottom:8px}',
      '.tb-focus .tb-focus-bar{display:flex}'
    ].join('');
    document.head.appendChild(style);
  }

  let audioCtx = null;
  function softTick(done) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!audioCtx) audioCtx = new AC();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(done ? 780 : 520, audioCtx.currentTime);
      o.frequency.exponentialRampToValueAtTime(done ? 1040 : 280, audioCtx.currentTime + (done ? 0.14 : 0.05));
      g.gain.setValueAtTime(done ? 0.12 : 0.06, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + (done ? 0.18 : 0.06));
      o.connect(g);
      g.connect(audioCtx.destination);
      o.start();
      o.stop(audioCtx.currentTime + (done ? 0.19 : 0.065));
    } catch (_) {}
  }

  let timerId = 0;

  R.tasbih = function () {
    ensureStyles();
    if (timerId) {
      clearInterval(timerId);
      timerId = 0;
    }
    const st = loadT();
    let sec = 0;
    let timerRunning = false;
    let focusMode = false;
    const view = $('#view');
    const RING_R = 84;
    const RING_C = 2 * Math.PI * RING_R;

    function curItem() {
      if (st.preset === 'custom') {
        return {
          ar: st.custom || 'ذِكْرُ اللَّهِ',
          rom: 'Custom Zikr',
          mean: 'अपना पसंदीदा ज़िक्र पढ़ें',
          ref: 'सूरह अल-अहज़ाब (33:41) · अल्लाह को ज़्यादा याद करो'
        };
      }
      return PRESETS.find(x => x.id === st.preset) || PRESETS[0];
    }

    function fmtTime(s) {
      const m = Math.floor(s / 60), r = s % 60, h = Math.floor(m / 60);
      return (h ? h + ':' : '') + String(m % 60).padStart(h ? 2 : 1, '0') + ':' + String(r).padStart(2, '0');
    }

    function startTimer() {
      if (timerRunning) return;
      timerRunning = true;
      timerId = setInterval(() => {
        const tm = $('#tbTime');
        if (!tm) {
          clearInterval(timerId);
          timerId = 0;
          timerRunning = false;
          return;
        }
        sec++;
        tm.textContent = '⏱ ' + fmtTime(sec);
      }, 1000);
    }

    function stopTimer() {
      timerRunning = false;
      if (timerId) {
        clearInterval(timerId);
        timerId = 0;
      }
    }

    if (typeof ZD.onLeave === 'function') {
      ZD.onLeave(stopTimer);
    }

    const beadCellsHTML = [-3, -2, -1, 0, 1, 2, 3].map(off => {
      const tassel = off === 0
        ? '<div class="tb-tassel" aria-hidden="true"><span class="tb-tassel-knot"></span><span class="tb-tassel-tail"><i></i><i></i><i></i><i></i></span></div>'
        : '';
      return '<div class="tb-bcell"><span class="tb-bead" data-boff="' + off + '"></span>' + tassel + '</div>';
    }).join('');

    view.innerHTML =
      '<header class="topbar">' +
        '<button type="button" class="ibtn" data-act="back" aria-label="Back">' + icon('back') + '</button>' +
        '<h1>Tasbih Counter<span class="sub">तस्बीह · Zikr Tracker</span></h1>' +
        '<button type="button" class="ibtn" id="tbThemeBtn" aria-label="Bead style" title="दाने का स्टाइल बदलें" style="font-size:18px">🎨</button>' +
        '<button type="button" class="ibtn' + (st.snd ? ' on' : '') + '" id="tbSnd" aria-label="Sound">' + icon('vol') + '</button>' +
      '</header>' +
      '<main class="tb-wrap" id="tbWrap">' +
        '<div class="tb-chips" id="tbPresets">' +
          PRESETS.map(p => '<button type="button" class="tb-chip' + (st.preset === p.id ? ' on' : '') + '" data-pid="' + p.id + '" aria-pressed="' + (st.preset === p.id) + '">' + esc(p.rom) + '</button>').join('') +
          '<button type="button" class="tb-chip' + (st.preset === 'custom' ? ' on' : '') + '" data-pid="custom" aria-pressed="' + (st.preset === 'custom') + '">+ Custom</button>' +
        '</div>' +
        '<div class="tb-custom" id="tbCustWrap"' + (st.preset === 'custom' ? '' : ' hidden') + '>' +
          '<input id="tbCustIn" type="text" placeholder="अपना ज़िक्र लिखें (e.g. Ya Hayyu Ya Qayyum)" value="' + esc(st.custom) + '" maxlength="80">' +
        '</div>' +
        '<div class="tb-stage card" id="tbStage">' +
          '<div class="tb-focus-bar"><button type="button" class="btn sm ghost" id="tbExitFocus">✕ फ़ोकस मोड बंद करें</button></div>' +
          '<div class="tb-meta">' +
            '<span class="tb-pill-m">Set: <b id="tbSet">' + st.set + '</b></span>' +
            '<button type="button" class="tb-pill-m" id="tbTime" title="Timer pause/resume">⏱ ' + fmtTime(sec) + '</button>' +
            '<button type="button" class="tb-pill-m' + (st.fatima ? ' on' : '') + '" id="tbFatima" aria-pressed="' + st.fatima + '">↻ 33→33→34</button>' +
          '</div>' +
          '<div class="tb-ar ar" lang="ar" id="tbAr"></div>' +
          '<div class="tb-mean" id="tbMean"></div>' +
          '<div class="tb-ref" id="tbRef"></div>' +
          '<div class="tb-orb-box">' +
            '<svg class="tb-ring-svg" viewBox="0 0 186 186" aria-hidden="true">' +
              '<circle class="tb-ring-bg" cx="93" cy="93" r="' + RING_R + '"></circle>' +
              '<circle class="tb-ring-fg" id="tbRingFg" cx="93" cy="93" r="' + RING_R + '" stroke-dasharray="' + RING_C.toFixed(2) + '" stroke-dashoffset="' + RING_C.toFixed(2) + '"></circle>' +
            '</svg>' +
            '<button type="button" class="tb-tap" id="tbTap" aria-label="Count tasbih">' +
              '<span class="tb-num" id="tbNum">000</span>' +
              '<span class="tb-hint">TAP TO COUNT</span>' +
              '<span class="tb-rem" id="tbRem"></span>' +
            '</button>' +
          '</div>' +
          '<div class="tb-strand-wrap" id="tbStrandTap" role="button" tabindex="0" aria-label="Slide numbered tasbih beads">' +
            '<div class="tb-strand" id="tbStrand" data-bt="' + esc(st.beadTheme) + '">' +
              '<div class="tb-string" aria-hidden="true"></div>' +
              '<div class="tb-beads-track" id="tbBeadsTrack">' + beadCellsHTML + '</div>' +
            '</div>' +
            '<div class="tb-bead-info" id="tbBeadInfo"></div>' +
          '</div>' +
          '<div class="tb-ctrl">' +
            '<div class="tb-ranges" id="tbRanges">' +
              [33, 99, 100, 0].map(r => '<button type="button" class="tb-rbtn' + (st.target === r ? ' on' : '') + '" data-r="' + r + '">' + (r || '∞') + '</button>').join('') +
            '</div>' +
            '<div class="tb-acts">' +
              '<button type="button" class="btn sm ghost" id="tbUndo">↩ -1</button>' +
              '<button type="button" class="btn sm ghost" id="tbReset">Reset</button>' +
              '<button type="button" class="btn sm ghost' + (st.vib ? ' on' : '') + '" id="tbVib"></button>' +
              '<button type="button" class="btn sm ghost" id="tbFocus">👁 Focus</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="tb-foot card">' +
          '<div class="tb-fstats">' +
            '<div><span class="muted small">आज का ज़िक्र</span><b id="tbToday">' + st.todayCount.toLocaleString('en-IN') + '</b></div>' +
            '<div><span class="muted small">कुल ज़िक्र</span><b id="tbTot">' + st.total.toLocaleString('en-IN') + '</b></div>' +
          '</div>' +
          '<a class="btn sm ghost" href="#/azkaar">Daily Azkaar →</a>' +
        '</div>' +
      '</main>';

    const elWrap = $('#tbWrap');
    const elPresets = $('#tbPresets');
    const elCustWrap = $('#tbCustWrap');
    const elCustIn = $('#tbCustIn');
    const elSet = $('#tbSet');
    const elTime = $('#tbTime');
    const elFatima = $('#tbFatima');
    const elAr = $('#tbAr');
    const elMean = $('#tbMean');
    const elRef = $('#tbRef');
    const elRingFg = $('#tbRingFg');
    const elTap = $('#tbTap');
    const elNum = $('#tbNum');
    const elRem = $('#tbRem');
    const elStrand = $('#tbStrand');
    const elTrack = $('#tbBeadsTrack');
    const elBeadInfo = $('#tbBeadInfo');
    const elRanges = $('#tbRanges');
    const elVib = $('#tbVib');
    const elFocus = $('#tbFocus');
    const elSnd = $('#tbSnd');
    const elToday = $('#tbToday');
    const elTot = $('#tbTot');
    const beadNodes = elTrack.querySelectorAll('.tb-bead[data-boff]');

    function nudgeChipIfClipped(chipEl) {
      if (!chipEl || !elPresets) return;
      const sr = elPresets.getBoundingClientRect();
      const cr = chipEl.getBoundingClientRect();
      const pad = 10;
      if (cr.left < sr.left + pad) {
        elPresets.scrollBy({ left: cr.left - sr.left - pad, behavior: 'smooth' });
      } else if (cr.right > sr.right - pad) {
        elPresets.scrollBy({ left: cr.right - sr.right + pad, behavior: 'smooth' });
      }
    }

    function syncPresetsInPlace(nudge) {
      const chips = elPresets.querySelectorAll('.tb-chip[data-pid]');
      let activeChip = null;
      for (let i = 0; i < chips.length; i++) {
        const c = chips[i];
        const on = c.dataset.pid === st.preset;
        c.classList.toggle('on', on);
        c.setAttribute('aria-pressed', String(on));
        if (on) activeChip = c;
      }
      elCustWrap.hidden = st.preset !== 'custom';
      if (nudge && activeChip) nudgeChipIfClipped(activeChip);
    }

    function syncBeads(animDir) {
      const tgt = st.target;
      const cur = st.count;
      for (let i = 0; i < beadNodes.length; i++) {
        const node = beadNodes[i];
        const off = Number(node.dataset.boff);
        const val = cur + off;
        let cls = 'tb-bead';
        let txt = '';

        if (off === 0) {
          cls += ' cur';
          if (tgt > 0 && cur >= tgt) cls += ' done';
          txt = String(cur);
        } else if (off < 0) {
          if (val >= 1) {
            cls += off === -3 ? ' past far' : ' past';
            txt = String(val);
          } else {
            cls += ' empty';
          }
        } else {
          if (tgt === 0 || val <= tgt) {
            cls += off === 3 ? ' next far' : ' next';
            if (tgt > 0 && val === tgt) cls += ' goal';
            txt = String(val);
          } else {
            cls += ' empty';
          }
        }
        node.className = cls;
        node.textContent = txt;
      }

      if (animDir === 'fwd' || animDir === 'back') {
        elTrack.classList.remove('anim-fwd', 'anim-back');
        void elTrack.offsetWidth;
        elTrack.classList.add(animDir === 'fwd' ? 'anim-fwd' : 'anim-back');
      }

      if (cur === 0) {
        elBeadInfo.innerHTML = 'धागे पर नंबर: <b>0</b> · अगला दाना: <b>1</b>' + (tgt > 0 ? ' · लक्ष्य: <b>' + tgt + '</b>' : '');
      } else if (tgt > 0 && cur >= tgt) {
        if (st.fatima && FATIMA_SEQ.includes(st.preset)) {
          const nextIdx = (FATIMA_SEQ.indexOf(st.preset) + 1) % FATIMA_SEQ.length;
          const nextP = PRESETS.find(x => x.id === FATIMA_SEQ[nextIdx]);
          elBeadInfo.innerHTML = 'दाना <b>' + cur + ' / ' + tgt + '</b> पूरा ✓ · अगला: <b>' + esc(nextP.rom) + '</b>';
        } else {
          elBeadInfo.innerHTML = 'दाना <b>' + cur + ' / ' + tgt + '</b> पूरा ✓ · अगला टैप नया सेट शुरू करेगा';
        }
      } else {
        elBeadInfo.innerHTML = 'अभी दाना: <b>' + cur + '</b> · अगला: <b>' + (cur + 1) + '</b>' + (tgt > 0 ? ' · बाक़ी: <b>' + (tgt - cur) + '</b>' : '');
      }
    }

    function syncRangesInPlace() {
      const btns = elRanges.querySelectorAll('.tb-rbtn[data-r]');
      for (let i = 0; i < btns.length; i++) {
        btns[i].classList.toggle('on', Number(btns[i].dataset.r) === st.target);
      }
    }

    function syncAll(nudgeChip, animDir) {
      const item = curItem();
      elAr.textContent = item.ar;
      elMean.textContent = item.mean;
      elRef.textContent = item.ref;
      elNum.textContent = String(st.count).padStart(3, '0');
      elSet.textContent = String(st.set);
      elToday.textContent = st.todayCount.toLocaleString('en-IN');
      elTot.textContent = st.total.toLocaleString('en-IN');
      elStrand.dataset.bt = st.beadTheme;

      const frac = st.target > 0 ? Math.min(1, st.count / st.target) : ((st.count % 100) / 100);
      elRingFg.style.strokeDashoffset = (RING_C * (1 - frac)).toFixed(2);
      if (st.target > 0) {
        const rem = Math.max(0, st.target - st.count);
        elRem.textContent = rem === 0 ? ('पूरा ✓ · ' + st.count + ' / ' + st.target) : ('बाक़ी: ' + rem + ' · ' + st.count + ' / ' + st.target);
      } else {
        elRem.textContent = 'असीमित मोड · ∞';
      }

      elFatima.classList.toggle('on', st.fatima);
      elFatima.setAttribute('aria-pressed', String(st.fatima));
      elVib.classList.toggle('on', st.vib);
      elVib.textContent = st.vib ? '📳 Vib ON' : '📳 Vib OFF';
      elSnd.classList.toggle('on', st.snd);
      elFocus.classList.toggle('on', focusMode);
      elWrap.classList.toggle('tb-focus', focusMode);

      syncPresetsInPlace(!!nudgeChip);
      syncRangesInPlace();
      syncBeads(animDir);
    }

    function doCount() {
      if (!timerRunning) startTimer();
      let completed = false;
      let toastMsg = '';

      if (st.target > 0 && st.count >= st.target) {
        if (st.fatima && FATIMA_SEQ.includes(st.preset)) {
          const idx = FATIMA_SEQ.indexOf(st.preset);
          const nextId = FATIMA_SEQ[(idx + 1) % FATIMA_SEQ.length];
          const nextPreset = PRESETS.find(x => x.id === nextId);
          st.preset = nextId;
          st.target = nextPreset.target;
          st.count = 1;
          if (idx === FATIMA_SEQ.length - 1) st.set++;
        } else {
          st.count = 1;
          st.set++;
        }
      } else {
        st.count++;
      }

      st.total++;
      st.todayCount++;

      if (st.target > 0 && st.count === st.target) {
        completed = true;
        if (st.fatima && FATIMA_SEQ.includes(st.preset)) {
          const idx = FATIMA_SEQ.indexOf(st.preset);
          if (idx === 0) toastMsg = 'सुब्हानल्लाह (33) पूरा — अगला टैप अलहम्दुलिल्लाह शुरू करेगा';
          else if (idx === 1) toastMsg = 'अलहम्दुलिल्लाह (33) पूरा — अगला टैप अल्लाहु अकबर शुरू करेगा';
          else toastMsg = 'माशाअल्लाह! मुकम्मल तस्बीह-ए-फ़ातिमा (100) पूरी हुई 🤲';
        } else {
          toastMsg = 'माशाअल्लाह! Set ' + st.set + ' पूरा हुआ (' + st.target + ')';
        }
      }

      saveT(st);
      syncAll(st.fatima && st.count === 1, 'fwd');

      elTap.classList.remove('pop');
      void elTap.offsetWidth;
      elTap.classList.add('pop');

      if (st.vib && navigator.vibrate) navigator.vibrate(completed ? [35, 45, 35] : 14);
      if (st.snd) softTick(completed);
      if (toastMsg) ZD.toast(toastMsg);
    }

    elTap.addEventListener('click', doCount);
    $('#tbStrandTap').addEventListener('click', doCount);
    $('#tbStrandTap').addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        doCount();
      }
    });

    elPresets.addEventListener('click', e => {
      const b = e.target.closest('.tb-chip[data-pid]');
      if (!b) return;
      const nextId = b.dataset.pid;
      if (!nextId) return;
      st.preset = nextId;
      if (!FATIMA_SEQ.includes(nextId)) st.fatima = false;
      const pr = PRESETS.find(x => x.id === nextId);
      if (pr) st.target = pr.target;
      st.count = 0;
      st.set = 1;
      saveT(st);
      syncAll(true);
      if (nextId === 'custom' && elCustIn) {
        setTimeout(() => elCustIn.focus(), 60);
      }
    });

    elCustIn.addEventListener('input', e => {
      st.custom = e.target.value;
      saveT(st);
      elAr.textContent = st.custom || 'ذِكْرُ اللَّهِ';
    });

    elRanges.addEventListener('click', e => {
      const b = e.target.closest('.tb-rbtn[data-r]');
      if (!b) return;
      st.target = Number(b.dataset.r);
      st.fatima = false;
      saveT(st);
      syncAll(false);
    });

    elFatima.addEventListener('click', () => {
      st.fatima = !st.fatima;
      if (st.fatima) {
        st.preset = 'subhan';
        st.target = 33;
        st.count = 0;
        st.set = 1;
        ZD.toast('तस्बीह-ए-फ़ातिमा ऑटो मोड ON (33 → 33 → 34)');
      } else {
        ZD.toast('ऑटो मोड OFF');
      }
      saveT(st);
      syncAll(true);
    });

    elTime.addEventListener('click', () => {
      if (timerRunning) {
        stopTimer();
        ZD.toast('टाइमर रुका');
      } else {
        startTimer();
        ZD.toast('टाइमर चालू');
      }
    });

    $('#tbUndo').addEventListener('click', () => {
      if (st.count <= 0) return;
      st.count--;
      st.total = Math.max(0, st.total - 1);
      st.todayCount = Math.max(0, st.todayCount - 1);
      saveT(st);
      syncAll(false, 'back');
    });

    $('#tbReset').addEventListener('click', () => {
      st.count = 0;
      st.set = 1;
      sec = 0;
      stopTimer();
      elTime.textContent = '⏱ ' + fmtTime(0);
      saveT(st);
      syncAll(false);
      ZD.toast('तस्बीह रीसेट हो गई');
    });

    elVib.addEventListener('click', () => {
      st.vib = !st.vib;
      saveT(st);
      syncAll(false);
    });

    elSnd.addEventListener('click', () => {
      st.snd = !st.snd;
      saveT(st);
      syncAll(false);
    });

    elFocus.addEventListener('click', () => {
      focusMode = !focusMode;
      syncAll(false);
    });

    $('#tbExitFocus').addEventListener('click', () => {
      focusMode = false;
      syncAll(false);
    });

    $('#tbThemeBtn').addEventListener('click', () => {
      const idx = BEAD_THEMES.findIndex(x => x.id === st.beadTheme);
      const next = BEAD_THEMES[(idx + 1) % BEAD_THEMES.length];
      st.beadTheme = next.id;
      saveT(st);
      syncAll(false);
      ZD.toast('तस्बीह स्टाइल: ' + next.name);
    });

    syncAll(true);
  };

  ZD.tasbihHTML = function () {
    const st = loadT();
    return '<section class="block"><a class="card tb-home-card" href="#/tasbih">' +
      '<div class="tb-home-ico">📿</div>' +
      '<div style="flex:1;min-width:0"><div style="font-size:18px;font-weight:600">Tasbih Counter</div>' +
      '<div class="muted small">तस्बीह · आज: ' + st.todayCount.toLocaleString('en-IN') + ' · कुल: ' + st.total.toLocaleString('en-IN') + '</div></div>' +
      icon('back', 'ask-arr') + '</a></section>';
  };
})();

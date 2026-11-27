(function () {
  'use strict';
  const ZD = window.ZD, $ = ZD.$, esc = ZD.esc, icon = ZD.icon, R = ZD.R, P = ZD.player;
  const top = (title, sub, right) => '<header class="topbar"><button type="button" class="ibtn" data-act="back" aria-label="Back">' + icon('back') + '</button><h1>' + esc(title) + (sub ? '<span class="sub">' + esc(sub) + '</span>' : '') + '</h1>' + (right || '') + '</header>';

  const QARI_META = {
    'Alafasy_128kbps': { short: 'Mishary Alafasy', loc: 'Kuwait', ini: 'MA', c1: '#0ea5e9', c2: '#1e3a8a' },
    'Abdurrahmaan_As-Sudais_192kbps': { short: 'Abdur-Rahman Sudais', loc: 'Makkah', ini: 'AS', c1: '#eab308', c2: '#78350f' },
    'Husary_128kbps': { short: 'Khalil Al-Husary', loc: 'Egypt · Tajweed', ini: 'KH', c1: '#10b981', c2: '#064e3b' },
    'Minshawy_Murattal_128kbps': { short: 'Siddiq Al-Minshawi', loc: 'Egypt', ini: 'SM', c1: '#8b5cf6', c2: '#3b0764' },
    'Abdul_Basit_Murattal_128kbps': { short: 'Abdul Basit', loc: 'Egypt', ini: 'AB', c1: '#f97316', c2: '#7c2d12' },
    'Maher_AlMuaiqly_128kbps': { short: 'Maher Al-Muaiqly', loc: 'Makkah', ini: 'MM', c1: '#06b6d4', c2: '#164e63' },
    'Abu_Bakr_Ash-Shaatree_128kbps': { short: 'Abu Bakr Shatri', loc: 'Jeddah', ini: 'BS', c1: '#ec4899', c2: '#831843' }
  };

  function getQariMeta(id, fallbackName) {
    if (QARI_META[id]) return QARI_META[id];
    const low = String(id || '').toLowerCase();
    if (low.includes('alafasy')) return QARI_META['Alafasy_128kbps'];
    if (low.includes('sudais')) return QARI_META['Abdurrahmaan_As-Sudais_192kbps'];
    if (low.includes('husary')) return QARI_META['Husary_128kbps'];
    if (low.includes('minshaw')) return QARI_META['Minshawy_Murattal_128kbps'];
    if (low.includes('basit') || low.includes('samad')) return QARI_META['Abdul_Basit_Murattal_128kbps'];
    if (low.includes('muaiqly') || low.includes('maher')) return QARI_META['Maher_AlMuaiqly_128kbps'];
    if (low.includes('shaatree') || low.includes('shatri')) return QARI_META['Abu_Bakr_Ash-Shaatree_128kbps'];
    const name = fallbackName || id || 'Qari';
    const parts = name.trim().split(/\s+/);
    const ini = ((parts[0] ? parts[0][0] : 'Q') + (parts[1] ? parts[1][0] : 'R')).toUpperCase();
    return { short: name, loc: 'Qari', ini, c1: '#c9a24a', c2: '#3a2a22' };
  }

  ZD.reciterCardsHTML = function (activeId, compact) {
    const cur = activeId || ZD.prefs().reciter;
    return '<div class="qr-strip' + (compact ? ' sm' : '') + '">' +
      ZD.RECITERS.map(r => {
        const m = getQariMeta(r[0], r[1]);
        const on = r[0] === cur;
        return '<button type="button" class="qr-card' + (on ? ' on' : '') + '" data-qari="' + esc(r[0]) + '" aria-pressed="' + (on ? 'true' : 'false') + '">' +
          '<div class="qr-av" style="background:linear-gradient(140deg,' + m.c1 + ',' + m.c2 + ')"><span>' + m.ini + '</span>' + (on ? '<i aria-hidden="true">✓</i>' : '') + '</div>' +
          '<b>' + esc(m.short) + '</b><small>' + esc(m.loc) + '</small></button>';
      }).join('') +
      '</div>';
  };

  function syncQariCardsInPlace(container, activeId, nudgeCard) {
    if (!container) return;
    const cards = container.querySelectorAll('.qr-card[data-qari]');
    let selectedEl = null;
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const isOn = card.dataset.qari === activeId;
      card.classList.toggle('on', isOn);
      card.setAttribute('aria-pressed', isOn ? 'true' : 'false');
      const av = card.querySelector('.qr-av');
      if (av) {
        const tick = av.querySelector('i');
        if (isOn && !tick) {
          const el = document.createElement('i');
          el.setAttribute('aria-hidden', 'true');
          el.textContent = '✓';
          av.appendChild(el);
        } else if (!isOn && tick) {
          tick.remove();
        }
      }
      if (isOn) selectedEl = card;
    }
    if (nudgeCard && selectedEl) {
      const strip = container.querySelector('.qr-strip');
      if (strip) {
        const sr = strip.getBoundingClientRect();
        const cr = selectedEl.getBoundingClientRect();
        const pad = 10;
        if (cr.left < sr.left + pad) {
          strip.scrollBy({ left: cr.left - sr.left - pad, behavior: 'smooth' });
        } else if (cr.right > sr.right - pad) {
          strip.scrollBy({ left: cr.right - sr.right + pad, behavior: 'smooth' });
        }
      }
    }
  }

  ZD.quranTabsHTML = function (tab) {
    const tabs = [['surahs', 'Surah'], ['juz', 'Para'], ['pages', 'Page'], ['hizb', 'Hizb']];
    return '<div class="seg q-seg" role="tablist">' +
      tabs.map(([k, l]) => '<button type="button" role="tab" aria-selected="' + (tab === k) + '" data-go="#/' + k + '">' + l + '</button>').join('') +
      '</div>';
  };

  ZD.quranLastReadHTML = function () {
    const last = ZD.state().last;
    const s = last ? last.s : 1;
    const a = last ? last.a : 1;
    const sr = ZD.surah(s);
    const juz = ZD.juzOf(s, a);
    return '<section class="block"><div class="lr-card">' +
      '<div class="lr-left">' +
        '<div class="lr-kicker">📖 Last Read · Para ' + juz + '</div>' +
        '<div class="lr-title">' + esc(sr.en) + '</div>' +
        '<div class="lr-sub">Ayah ' + a + ' of ' + sr.count + ' · ' + esc(sr.mean) + '</div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">' +
          '<a class="lr-btn" href="#/read/' + s + '/' + a + '">Back to reading →</a>' +
          '<a class="lr-btn ghost" href="#/listen">🎧 Audio Player</a>' +
        '</div>' +
      '</div>' +
      '<div class="lr-art" aria-hidden="true"><div class="lr-book"><span class="ar" lang="ar">' + esc(sr.ar) + '</span><small>القرآن الكريم</small></div></div>' +
      '</div></section>';
  };

  function refFromGlobal(g) {
    g = Math.max(1, Math.min(ZD.TOTAL, Math.round(g)));
    let acc = 0;
    for (let s = 1; s <= 114; s++) {
      const cnt = ZD.surah(s).count;
      if (g <= acc + cnt) return { s, a: g - acc };
      acc += cnt;
    }
    return { s: 114, a: 1 };
  }

  R.pages = function () {
    const J = ZD.juzList();
    const pageStartOfJuz = j => (j === 1 ? 1 : (2 + (j - 1) * 20));
    const pgToRef = pg => {
      pg = Math.max(1, Math.min(604, Math.round(pg)));
      if (pg === 1) return { s: 1, a: 1, j: 1 };
      if (pg === 2) return { s: 2, a: 1, j: 1 };
      const jIdx = Math.min(29, Math.max(0, Math.floor((pg - 2) / 20)));
      const p0 = pageStartOfJuz(jIdx + 1);
      const p1 = jIdx < 29 ? pageStartOfJuz(jIdx + 2) : 605;
      const g0 = ZD.globalAyah(J[jIdx].s, J[jIdx].a);
      const g1 = jIdx < 29 ? ZD.globalAyah(J[jIdx + 1].s, J[jIdx + 1].a) : ZD.TOTAL + 1;
      const frac = (pg - p0) / Math.max(1, p1 - p0);
      const r = refFromGlobal(g0 + Math.floor(frac * (g1 - g0)));
      return { s: r.s, a: r.a, j: jIdx + 1 };
    };

    let curJuz = 1;
    const v = $('#view');
    v.innerHTML = top('Quran Pages', '604 Madani Mushaf Pages') + '<main>' +
      ZD.quranTabsHTML('pages') +
      '<section class="block card"><div class="pg-jump"><input id="pgIn" type="number" min="1" max="604" placeholder="Page नंबर (1–604)"><button type="button" class="btn sm" id="pgGo">खोलें</button></div>' +
      '<div class="pg-jstrip" id="pgJuz">' +
        Array.from({ length: 30 }, (_, i) => '<button type="button" class="tb-chip' + (curJuz === i + 1 ? ' on' : '') + '" data-pj="' + (i + 1) + '">Para ' + (i + 1) + '</button>').join('') +
      '</div></section>' +
      '<section class="block"><div class="pg-pgrid" id="pgGrid"></div></section>' +
      '</main>';

    function drawGrid() {
      const pStart = pageStartOfJuz(curJuz);
      const pEnd = curJuz === 30 ? 604 : (pageStartOfJuz(curJuz + 1) - 1);
      const cells = [];
      for (let pg = pStart; pg <= pEnd; pg++) {
        const r = pgToRef(pg);
        const sr = ZD.surah(r.s);
        cells.push('<a class="pg-tile" href="#/read/' + r.s + '/' + r.a + '"><b>Page ' + pg + '</b><span>' + esc(sr.en) + ' ' + r.s + ':' + r.a + '</span></a>');
      }
      const grid = $('#pgGrid');
      if (grid) grid.innerHTML = cells.join('');
      const chips = document.querySelectorAll('#pgJuz [data-pj]');
      for (let i = 0; i < chips.length; i++) {
        chips[i].classList.toggle('on', Number(chips[i].dataset.pj) === curJuz);
      }
    }

    $('#pgGo').addEventListener('click', () => {
      const n = parseInt($('#pgIn').value, 10);
      if (!n || n < 1 || n > 604) {
        ZD.toast('1 से 604 के बीच पेज नंबर डालें');
        return;
      }
      const r = pgToRef(n);
      location.hash = '#/read/' + r.s + '/' + r.a;
    });

    $('#pgJuz').addEventListener('click', e => {
      const b = e.target.closest('[data-pj]');
      if (!b) return;
      const nextJuz = Number(b.dataset.pj);
      if (!nextJuz || nextJuz === curJuz) return;
      curJuz = nextJuz;
      drawGrid();
    });

    drawGrid();
  };

  R.hizb = function () {
    const J = ZD.juzList();
    const rows = [];
    for (let i = 0; i < 30; i++) {
      const j = J[i];
      const g0 = ZD.globalAyah(j.s, j.a);
      const g1 = i < 29 ? ZD.globalAyah(J[i + 1].s, J[i + 1].a) : ZD.TOTAL + 1;
      const mid = refFromGlobal(g0 + Math.floor((g1 - g0) / 2));
      const sr1 = ZD.surah(j.s);
      const sr2 = ZD.surah(mid.s);
      const h1 = i * 2 + 1;
      const h2 = i * 2 + 2;
      rows.push('<a class="row" href="#/read/' + j.s + '/' + j.a + '"><div class="num"><span>' + h1 + '</span></div><div class="mid"><b>Hizb ' + h1 + ' <small class="muted">· Para ' + (i + 1) + '</small></b><small>' + esc(sr1.en) + ' ' + j.s + ':' + j.a + ' · ' + esc(j.name) + '</small></div><div class="arn" lang="ar">' + esc(sr1.ar) + '</div></a>');
      rows.push('<a class="row" href="#/read/' + mid.s + '/' + mid.a + '"><div class="num"><span>' + h2 + '</span></div><div class="mid"><b>Hizb ' + h2 + ' <small class="muted">· Para ' + (i + 1) + ' (Half)</small></b><small>' + esc(sr2.en) + ' ' + mid.s + ':' + mid.a + '</small></div><div class="arn" lang="ar">' + esc(sr2.ar) + '</div></a>');
    }
    $('#view').innerHTML = top('Hizb Index', '60 Ahzab · 30 Paras') + '<main>' +
      ZD.quranTabsHTML('hizb') +
      '<div style="margin-top:8px">' + rows.join('') + '</div>' +
      '</main>';
  };

  const WAVE_H = [26, 42, 64, 38, 78, 92, 54, 44, 86, 100, 70, 48, 62, 94, 76, 40, 56, 88, 96, 60, 42, 74, 90, 66, 46, 82, 95, 58, 40, 72, 50, 34];
  const fmtSec = s => {
    s = Math.max(0, Math.floor(s || 0));
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  };

  R.listen = function () {
    const v = $('#view');
    let loadedSurah = 0;
    let surahData = null;
    let lastAyahKey = '';
    let lastReciter = '';
    let lastPlaying = null;
    let lastCurStr = '';
    let lastDurStr = '';
    let lastActiveBars = -1;

    const getTarget = () => {
      const cur = P.cur();
      if (cur) return { s: cur.s, a: cur.a, active: true };
      const l = ZD.state().last;
      return l ? { s: l.s, a: l.a, active: false } : { s: 55, a: 1, active: false };
    };

    const initialReciter = (P.cfg && P.cfg.reciter) || ZD.prefs().reciter;

    v.innerHTML = top('Quran Audio Player', 'वेवफॉर्म प्लेयर · Recitations', '<button type="button" class="ibtn" id="wpSetBtn" aria-label="Playback settings">' + icon('repeat') + '</button>') +
      '<main class="wp-wrap">' +
        '<section class="block card wp-stage">' +
          '<div class="wp-medallion" id="wpOrb">' +
            '<div class="wp-ring-spin"></div>' +
            '<div class="wp-disc">' +
              '<div class="wp-ar ar" lang="ar" id="wpSurahAr">الرحمن</div>' +
              '<div class="wp-book-ico" aria-hidden="true">📖</div>' +
            '</div>' +
          '</div>' +
          '<div class="wp-title" id="wpTitle">Ar-Rahman</div>' +
          '<div class="wp-sub" id="wpSub">Ayah 1 · Mishary Alafasy</div>' +
          '<div class="wp-ayah ar" lang="ar" id="wpAyahText">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>' +
          '<div class="wp-wave-wrap">' +
            '<span class="wp-tm" id="wpCur">0:00</span>' +
            '<div class="wp-wave" id="wpWave" role="slider" aria-label="Seek audio" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" tabindex="0">' +
              WAVE_H.map((h, i) => '<i data-wi="' + i + '" style="height:' + h + '%"></i>').join('') +
            '</div>' +
            '<span class="wp-tm" id="wpDur">0:00</span>' +
          '</div>' +
          '<div class="wp-ctrls">' +
            '<button type="button" class="ibtn" id="wpReadBtn" title="Open Reader" aria-label="Open Reader">' + icon('book') + '</button>' +
            '<button type="button" class="ibtn wp-nav" id="wpPrev" aria-label="Previous Ayah">' + icon('prev') + '</button>' +
            '<button type="button" class="wp-play" id="wpPlay" aria-label="Play or Pause">' + icon('play') + '</button>' +
            '<button type="button" class="ibtn wp-nav" id="wpNext" aria-label="Next Ayah">' + icon('next') + '</button>' +
            '<button type="button" class="ibtn" id="wpHifz" title="Repeat & Speed" aria-label="Repeat and Speed">' + icon('gear') + '</button>' +
          '</div>' +
        '</section>' +
        '<section class="block card">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><h2 class="h2" style="margin:0">Recitations (क़ारी चुनें)</h2><span class="muted small">Tap to switch</span></div>' +
          '<div id="wpQariWrap">' + ZD.reciterCardsHTML(initialReciter, true) + '</div>' +
        '</section>' +
      '</main>';

    const elSurahAr = $('#wpSurahAr');
    const elTitle = $('#wpTitle');
    const elSub = $('#wpSub');
    const elAyah = $('#wpAyahText');
    const elPlay = $('#wpPlay');
    const elOrb = $('#wpOrb');
    const elCur = $('#wpCur');
    const elDur = $('#wpDur');
    const elWave = $('#wpWave');
    const elQariWrap = $('#wpQariWrap');
    const waveBars = elWave ? elWave.children : [];

    async function syncAyahText(s, a) {
      if (!elAyah) return;
      if (loadedSurah !== s) {
        loadedSurah = s;
        surahData = null;
        try {
          surahData = await ZD.loadSurah(s);
        } catch (_) {}
      }
      if (!document.body.contains(elAyah)) return;
      const t = getTarget();
      if (t.s === s && surahData && surahData.ayahs && surahData.ayahs[a - 1]) {
        elAyah.textContent = surahData.ayahs[a - 1].ar;
      }
    }

    function syncUI() {
      if (!elWave || !document.body.contains(elWave)) return;
      const t = getTarget();
      const recId = (P.cfg && P.cfg.reciter) || ZD.prefs().reciter;
      const ayahKey = t.s + ':' + t.a;

      if (ayahKey !== lastAyahKey || recId !== lastReciter) {
        const sr = ZD.surah(t.s);
        const recRow = ZD.RECITERS.find(r => r[0] === recId);
        const qm = getQariMeta(recId, recRow ? recRow[1] : '');
        elSurahAr.textContent = sr.ar;
        elTitle.textContent = sr.en + ' (' + sr.n + ')';
        elSub.textContent = 'Ayah ' + t.a + ' / ' + sr.count + ' · Juz ' + ZD.juzOf(t.s, t.a) + ' · ' + qm.short;
        if (ayahKey !== lastAyahKey) {
          lastAyahKey = ayahKey;
          syncAyahText(t.s, t.a);
        }
        if (recId !== lastReciter) {
          lastReciter = recId;
          syncQariCardsInPlace(elQariWrap, recId, false);
        }
      }

      const isPlaying = !!P.playing;
      if (isPlaying !== lastPlaying) {
        lastPlaying = isPlaying;
        elPlay.innerHTML = icon(isPlaying ? 'pause' : 'play');
        elOrb.classList.toggle('playing', isPlaying);
      }

      const au = P.audio;
      const curStr = fmtSec(au && au.currentTime);
      const durStr = fmtSec(au && au.duration);
      if (curStr !== lastCurStr) {
        lastCurStr = curStr;
        elCur.textContent = curStr;
      }
      if (durStr !== lastDurStr) {
        lastDurStr = durStr;
        elDur.textContent = durStr;
      }

      const prog = P.progress();
      const activeBars = Math.round(prog * waveBars.length);
      if (activeBars !== lastActiveBars) {
        const start = lastActiveBars < 0 ? 0 : Math.min(lastActiveBars, activeBars);
        const end = lastActiveBars < 0 ? waveBars.length : Math.max(lastActiveBars, activeBars);
        for (let i = start; i < end; i++) {
          waveBars[i].classList.toggle('on', i < activeBars);
        }
        lastActiveBars = activeBars;
        elWave.setAttribute('aria-valuenow', String(Math.round(prog * 100)));
      }
    }

    elPlay.addEventListener('click', () => {
      if (P.cur()) P.toggle();
      else {
        const t = getTarget();
        ZD.playSurah(t.s, t.a, { keepCfg: true });
      }
    });
    $('#wpPrev').addEventListener('click', () => {
      if (P.cur()) P.prev();
      else {
        const t = getTarget();
        ZD.playSurah(t.s, Math.max(1, t.a - 1), { keepCfg: true });
      }
    });
    $('#wpNext').addEventListener('click', () => {
      if (P.cur()) P.next();
      else {
        const t = getTarget();
        ZD.playSurah(t.s, t.a + 1, { keepCfg: true });
      }
    });
    $('#wpReadBtn').addEventListener('click', () => {
      const t = getTarget();
      location.hash = '#/read/' + t.s + '/' + t.a;
    });
    $('#wpHifz').addEventListener('click', () => ZD.playbackSheet());
    $('#wpSetBtn').addEventListener('click', () => ZD.playbackSheet());

    elWave.addEventListener('click', e => {
      const r = elWave.getBoundingClientRect();
      const frac = Math.max(0, Math.min(1, (e.clientX - r.left) / Math.max(1, r.width)));
      P.seekFrac(frac);
      syncUI();
    });

    elWave.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const delta = e.key === 'ArrowRight' ? 0.05 : -0.05;
        P.seekFrac(P.progress() + delta);
        syncUI();
      }
    });

    elQariWrap.addEventListener('click', e => {
      const b = e.target.closest('.qr-card[data-qari]');
      if (!b) return;
      const id = b.dataset.qari;
      if (!id) return;
      lastReciter = id;
      syncQariCardsInPlace(elQariWrap, id, true);
      const t = getTarget();
      if (typeof ZD.switchReciter === 'function') {
        ZD.switchReciter(id, t.s, t.a);
      } else {
        const p = ZD.prefs();
        p.reciter = id;
        ZD.updateCfg({ reciter: id });
        ZD.save();
        ZD.playSurah(t.s, t.a, { keepCfg: true });
      }
      const recRow = ZD.RECITERS.find(r => r[0] === id);
      const qm = getQariMeta(id, recRow ? recRow[1] : '');
      ZD.toast('Qari: ' + qm.short);
    });

    const unsub = ZD.onPlayer(syncUI);
    ZD.onLeave(unsub);
    syncUI();
  };

  let orbEl = null, orbRaf = 0, orbAnalyser = null, orbData = null, orbAC = null, orbStart = 0;

  function closeOrb() {
    if (orbRaf) {
      cancelAnimationFrame(orbRaf);
      orbRaf = 0;
    }
    if (orbAC) {
      try {
        orbAC.close();
      } catch (_) {}
      orbAC = null;
    }
    orbAnalyser = null;
    orbData = null;
    if (orbEl) {
      orbEl.classList.remove('open');
      const el = orbEl;
      orbEl = null;
      setTimeout(() => {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 220);
    }
  }

  function openOrb(opts) {
    closeOrb();
    opts = opts || {};
    const el = document.createElement('div');
    el.className = 'vo-ov';
    el.id = 'zdVoiceOrb';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', 'AI Voice Assistant Listening');
    el.innerHTML =
      '<div class="vo-top"><span>✨ Ask Zikr Deen · AI Assistant</span><button type="button" class="vo-x" id="voCancel" aria-label="Cancel">✕</button></div>' +
      '<div class="vo-mid">' +
        '<div class="vo-canvas-wrap"><canvas id="voCv" width="320" height="320"></canvas></div>' +
        '<div class="vo-status" id="voStatus">Listening…</div>' +
        '<div class="vo-sub" id="voSub">अपना इस्लामी सवाल साफ़ आवाज़ में बोलें</div>' +
        '<div class="vo-tmr" id="voTmr">0:00</div>' +
      '</div>' +
      '<div class="vo-foot">' +
        '<button type="button" class="vo-btn cancel" id="voCancel2">✕ रद्द करें</button>' +
        '<button type="button" class="vo-btn send" id="voSend">⏹ भेजें (Send)</button>' +
      '</div>';
    document.body.appendChild(el);
    orbEl = el;
    requestAnimationFrame(() => el.classList.add('open'));

    const doCancel = () => {
      if (opts.onCancel) opts.onCancel();
      else closeOrb();
    };
    $('#voCancel', el).addEventListener('click', doCancel);
    $('#voCancel2', el).addEventListener('click', doCancel);
    $('#voSend', el).addEventListener('click', () => {
      if (opts.onStop) opts.onStop();
    });

    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC && opts.stream) {
        orbAC = new AC();
        if (orbAC.state === 'suspended') orbAC.resume().catch(() => {});
        const src = orbAC.createMediaStreamSource(opts.stream);
        orbAnalyser = orbAC.createAnalyser();
        orbAnalyser.fftSize = 128;
        orbAnalyser.smoothingTimeConstant = 0.78;
        src.connect(orbAnalyser);
        orbData = new Uint8Array(orbAnalyser.frequencyBinCount);
      }
    } catch (_) {
      orbAnalyser = null;
    }

    const cv = $('#voCv', el);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const size = 320;
    cv.width = Math.round(size * dpr);
    cv.height = Math.round(size * dpr);
    const c = cv.getContext('2d');
    c.scale(dpr, dpr);
    orbStart = performance.now();

    function drawWave(now) {
      if (!orbEl) return;
      const t = (now - orbStart) / 1000;
      const W = size, H = size, cx = 160, cy = 160, rad = 118;
      c.clearRect(0, 0, W, H);

      let amp = 0.18 + 0.08 * Math.sin(t * 3.2);
      if (orbAnalyser && orbData) {
        try {
          orbAnalyser.getByteTimeDomainData(orbData);
          let sum = 0;
          for (let i = 0; i < orbData.length; i++) {
            const val = (orbData[i] - 128) / 128;
            sum += val * val;
          }
          const rms = Math.sqrt(sum / orbData.length);
          amp = Math.min(1, 0.14 + rms * 3.8);
        } catch (_) {}
      }

      c.save();
      const bg = c.createRadialGradient(cx, cy, rad * 0.25, cx, cy, rad * 1.28);
      bg.addColorStop(0, 'rgba(56,189,248,' + (0.16 + amp * 0.18).toFixed(3) + ')');
      bg.addColorStop(0.65, 'rgba(139,92,246,' + (0.12 + amp * 0.14).toFixed(3) + ')');
      bg.addColorStop(1, 'rgba(15,23,42,0)');
      c.fillStyle = bg;
      c.beginPath();
      c.arc(cx, cy, rad * 1.28, 0, Math.PI * 2);
      c.fill();

      c.strokeStyle = 'rgba(56,189,248,' + (0.55 + amp * 0.4).toFixed(3) + ')';
      c.lineWidth = 2.5 + amp * 2;
      c.beginPath();
      c.arc(cx, cy, rad, 0, Math.PI * 2);
      c.stroke();

      c.beginPath();
      c.arc(cx, cy, rad - 2, 0, Math.PI * 2);
      c.clip();

      const waves = [
        { col: 'rgba(56,189,248,0.85)', freq: 2.4, spd: 3.8, mul: 1.0, lw: 2.8 },
        { col: 'rgba(168,85,247,0.75)', freq: 3.2, spd: -2.9, mul: 0.78, lw: 2.2 },
        { col: 'rgba(250,204,21,0.62)', freq: 1.8, spd: 2.4, mul: 0.55, lw: 1.8 }
      ];
      for (let w = 0; w < waves.length; w++) {
        const wv = waves[w];
        c.strokeStyle = wv.col;
        c.lineWidth = wv.lw;
        c.beginPath();
        for (let x = -rad; x <= rad; x += 4) {
          const nx = x / rad;
          const env = Math.cos(nx * Math.PI * 0.5);
          const y = Math.sin(nx * wv.freq * Math.PI + t * wv.spd) * env * env * (22 + amp * 54) * wv.mul;
          if (x === -rad) c.moveTo(cx + x, cy + y);
          else c.lineTo(cx + x, cy + y);
        }
        c.stroke();
      }
      c.restore();
      orbRaf = requestAnimationFrame(drawWave);
    }
    orbRaf = requestAnimationFrame(drawWave);
  }

  window.addEventListener('hashchange', closeOrb);

  ZD.voiceOrb = {
    open: openOrb,
    close: closeOrb,
    setTime: s => {
      if (!orbEl) return;
      const t = $('#voTmr', orbEl);
      if (t) t.textContent = s;
    },
    setState: (st, sub) => {
      if (!orbEl) return;
      const a = $('#voStatus', orbEl);
      const b = $('#voSub', orbEl);
      const btn = $('#voSend', orbEl);
      if (a && st) a.textContent = st;
      if (b && sub) b.textContent = sub;
      if (btn && /samajh|process/i.test(st || '')) btn.disabled = true;
    }
  };
})();

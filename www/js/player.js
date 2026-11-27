(function () {
  'use strict';
  const ZD = window.ZD, $ = ZD.$;
  const audioDB = ZD.idb('zikrDeenAppAudioV1', 'audio', 'key');
  const akey = (r, s, a) => r + '|' + ZD.pad3(s) + ':' + ZD.pad3(a);
  ZD.audioKey = akey;

  let legacy = undefined;
  async function legacyGet(r, a) {
    if (legacy === undefined) {
      legacy = null;
      try {
        if (indexedDB.databases) {
          const l = await indexedDB.databases();
          if (l.some(d => d.name === 'zikrDeenOfflineAudioV1')) {
            legacy = await new Promise((res, rej) => {
              const q = indexedDB.open('zikrDeenOfflineAudioV1');
              q.onsuccess = () => res(q.result);
              q.onerror = () => rej(q.error);
            });
            if (!legacy.objectStoreNames.contains('recitations')) {
              legacy.close();
              legacy = null;
            }
          }
        }
      } catch (_) {
        legacy = null;
      }
    }
    if (!legacy) return null;
    return new Promise(res => {
      try {
        const q = legacy.transaction('recitations', 'readonly').objectStore('recitations').get(r + '|' + ZD.pad3(a));
        q.onsuccess = () => res(q.result || null);
        q.onerror = () => res(null);
      } catch (_) {
        res(null);
      }
    });
  }

  function getGlobalAyah(s, a) {
    if (typeof ZD.globalAyah === 'function') return ZD.globalAyah(s, a);
    let acc = 0;
    for (let i = 1; i < s; i++) acc += ZD.surah(i).count;
    return acc + a;
  }

  ZD.audioUrls = function (r, s, a) {
    const n = ZD.pad3(s) + ZD.pad3(a);
    const g = getGlobalAyah(s, a);
    const id = String(r || '');
    const low = id.toLowerCase();
    const u = [];
    const add = url => {
      if (url && u.indexOf(url) === -1) u.push(url);
    };

    if (low.includes('muaiqly') || low.includes('maher')) {
      add('https://everyayah.com/data/MaherAlMuaiqly128kbps/' + n + '.mp3');
      add('https://everyayah.com/data/Maher_AlMuaiqly_64kbps/' + n + '.mp3');
      add('https://cdn.islamic.network/quran/audio/128/ar.mahermuaiqly/' + g + '.mp3');
      add('https://cdn.islamic.network/quran/audio/64/ar.mahermuaiqly/' + g + '.mp3');
    } else if (low.includes('basit') || low.includes('samad')) {
      if (id && id !== 'Abdul_Basit_Murattal_128kbps') {
        add('https://everyayah.com/data/' + id + '/' + n + '.mp3');
      }
      add('https://everyayah.com/data/Abdul_Basit_Murattal_192kbps/' + n + '.mp3');
      add('https://everyayah.com/data/Abdul_Basit_Murattal_64kbps/' + n + '.mp3');
      add('https://cdn.islamic.network/quran/audio/192/ar.abdulbasitmurattal/' + g + '.mp3');
      add('https://cdn.islamic.network/quran/audio/64/ar.abdulbasitmurattal/' + g + '.mp3');
    } else if (low.includes('alafasy')) {
      add('https://everyayah.com/data/Alafasy_128kbps/' + n + '.mp3');
      add('https://verses.quran.com/Alafasy/mp3/' + n + '.mp3');
      add('https://cdn.islamic.network/quran/audio/128/ar.alafasy/' + g + '.mp3');
      add('https://everyayah.com/data/Alafasy_64kbps/' + n + '.mp3');
    } else if (low.includes('sudais')) {
      add('https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps/' + n + '.mp3');
      add('https://everyayah.com/data/Abdurrahmaan_As-Sudais_64kbps/' + n + '.mp3');
      add('https://cdn.islamic.network/quran/audio/192/ar.abdurrahmaansudais/' + g + '.mp3');
      add('https://cdn.islamic.network/quran/audio/64/ar.abdurrahmaansudais/' + g + '.mp3');
    } else if (low.includes('husary')) {
      add('https://everyayah.com/data/Husary_128kbps/' + n + '.mp3');
      add('https://everyayah.com/data/Husary_64kbps/' + n + '.mp3');
      add('https://cdn.islamic.network/quran/audio/128/ar.husary/' + g + '.mp3');
      add('https://cdn.islamic.network/quran/audio/64/ar.husary/' + g + '.mp3');
    } else if (low.includes('minshaw')) {
      add('https://everyayah.com/data/Minshawy_Murattal_128kbps/' + n + '.mp3');
      add('https://cdn.islamic.network/quran/audio/128/ar.minshawi/' + g + '.mp3');
    } else if (low.includes('shaatree') || low.includes('shatri')) {
      add('https://everyayah.com/data/Abu_Bakr_Ash-Shaatree_128kbps/' + n + '.mp3');
      add('https://everyayah.com/data/Abu_Bakr_Ash-Shaatree_64kbps/' + n + '.mp3');
      add('https://cdn.islamic.network/quran/audio/128/ar.shaatree/' + g + '.mp3');
      add('https://cdn.islamic.network/quran/audio/64/ar.shaatree/' + g + '.mp3');
    } else {
      if (id) add('https://everyayah.com/data/' + id + '/' + n + '.mp3');
      add('https://everyayah.com/data/Alafasy_128kbps/' + n + '.mp3');
      add('https://cdn.islamic.network/quran/audio/128/ar.alafasy/' + g + '.mp3');
    }

    return u;
  };

  ZD.hasOffline = async function (r, s, a) {
    try {
      if (await audioDB.get(akey(r, s, a))) return true;
    } catch (_) {}
    if (s === 67) {
      const l = await legacyGet(r, a);
      if (l && l.blob) return true;
    }
    return false;
  };

  ZD.offlineCount = async function (r, s) {
    let c = 0;
    try {
      const keys = await audioDB.keys();
      const p = r + '|' + ZD.pad3(s) + ':';
      c = keys.filter(k => String(k).startsWith(p)).length;
    } catch (_) {}
    return c;
  };

  ZD.offlineSummary = async function () {
    const out = {};
    try {
      for (const k of await audioDB.keys()) {
        const m = /^(.+)\|(\d{3}):\d{3}$/.exec(String(k));
        if (m) {
          const id = m[1] + '|' + Number(m[2]);
          out[id] = (out[id] || 0) + 1;
        }
      }
    } catch (_) {}
    return out;
  };

  ZD.deleteSurahAudio = async function (r, s) {
    const p = r + '|' + ZD.pad3(s) + ':';
    try {
      for (const k of await audioDB.keys()) {
        if (String(k).startsWith(p)) await audioDB.del(k);
      }
    } catch (_) {}
  };

  ZD.clearAllAudio = async function () {
    try {
      await audioDB.clear();
    } catch (_) {}
  };

  async function fetchAyah(r, s, a) {
    const key = akey(r, s, a);
    if (await audioDB.get(key)) return 'have';
    let err;
    for (const u of ZD.audioUrls(r, s, a)) {
      try {
        const c = new AbortController();
        const t = setTimeout(() => c.abort(), 30000);
        let resp;
        try {
          resp = await fetch(u, { mode: 'cors', signal: c.signal });
        } finally {
          clearTimeout(t);
        }
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        const blob = await resp.blob();
        if (!blob.size) throw new Error('empty');
        await audioDB.put({ key, blob, t: Date.now() });
        return 'saved';
      } catch (e) {
        err = e;
      }
    }
    throw err || new Error('failed');
  }

  ZD.downloadSurahAudio = async function (r, s, from, to, onProg, stop) {
    const total = to - from + 1;
    let ok = 0, fail = 0;
    try {
      if (navigator.storage && navigator.storage.persist) navigator.storage.persist();
    } catch (_) {}
    for (let a = from; a <= to; a++) {
      if (stop && stop()) break;
      try {
        await fetchAyah(r, s, a);
        ok++;
      } catch (_) {
        fail++;
      }
      if (onProg) onProg(ok + fail, total, fail);
    }
    return { ok, fail, total };
  };

  const au = new Audio();
  au.preload = 'auto';
  let objUrl = '';
  let pre = null;
  let preBusy = '';

  function clearPrefetch() {
    pre = null;
    preBusy = '';
  }

  async function prefetchNext(i, c) {
    const n = P.queue[i + 1];
    if (!n || c.autoNext === false || navigator.onLine === false) return;
    const key = akey(c.reciter, n.s, n.a);
    if ((pre && pre.key === key) || preBusy === key) return;
    try {
      if (await audioDB.get(key)) return;
    } catch (_) {}
    if (n.s === 67) {
      try {
        const l = await legacyGet(c.reciter, n.a);
        if (l && l.blob) return;
      } catch (_) {}
    }
    preBusy = key;
    const urls = ZD.audioUrls(c.reciter, n.s, n.a);
    for (let j = 0; j < Math.min(urls.length, 2); j++) {
      try {
        const ac = new AbortController();
        const t = setTimeout(() => ac.abort(), 20000);
        let r;
        try {
          r = await fetch(urls[j], { mode: 'cors', signal: ac.signal });
        } finally {
          clearTimeout(t);
        }
        if (r && r.ok) {
          const b = await r.blob();
          if (b && b.size > 500 && preBusy === key) {
            pre = { key, blob: b };
            break;
          }
        }
      } catch (_) {}
    }
    if (preBusy === key) preBusy = '';
  }

  const P = ZD.player = {
    queue: [],
    i: -1,
    playing: false,
    waiting: false,
    rep: 0,
    gapT: 0,
    sleepT: 0,
    sleepEnd: 0,
    loop: 0,
    loopDone: 0,
    cfg: null,
    noChain: false,
    listeners: new Set()
  };

  const emit = () => {
    P.listeners.forEach(f => {
      try {
        f(P);
      } catch (_) {}
    });
  };

  ZD.onPlayer = f => {
    P.listeners.add(f);
    return () => P.listeners.delete(f);
  };

  P.cur = () => P.queue[P.i] || null;

  function cfg() {
    const p = ZD.prefs();
    return Object.assign({
      repeat: p.repeat,
      gap: p.gap,
      speed: p.speed,
      reciter: p.reciter,
      autoNext: p.autoNext,
      nextSurah: p.nextSurah
    }, P.cfg || {});
  }

  function freeUrl() {
    if (objUrl) {
      URL.revokeObjectURL(objUrl);
      objUrl = '';
    }
  }

  function applySpeed() {
    const sp = Number(cfg().speed) || 1;
    try {
      au.defaultPlaybackRate = sp;
      au.playbackRate = sp;
    } catch (_) {}
  }

  async function sourceFor(item, c) {
    const urls = ZD.audioUrls(c.reciter, item.s, item.a);
    try {
      const rec = await audioDB.get(akey(c.reciter, item.s, item.a));
      if (rec && rec.blob && rec.blob.size > 500) {
        objUrl = URL.createObjectURL(rec.blob);
        return [objUrl].concat(urls);
      }
    } catch (_) {}
    if (item.s === 67) {
      const l = await legacyGet(c.reciter, item.a);
      if (l && l.blob && l.blob.size > 500) {
        objUrl = URL.createObjectURL(l.blob);
        return [objUrl].concat(urls);
      }
    }
    const key = akey(c.reciter, item.s, item.a);
    if (pre && pre.key === key && pre.blob && pre.blob.size > 500) {
      const b = pre.blob;
      pre = null;
      objUrl = URL.createObjectURL(b);
      return [objUrl].concat(urls);
    }
    return urls;
  }

  function tryUrl(url, my, autoplay) {
    return new Promise(resolve => {
      if (my !== token) {
        resolve('abort');
        return;
      }
      let settled = false;
      let timer = 0;
      const done = status => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        au.removeEventListener('error', onErr);
        au.removeEventListener('canplay', onReady);
        au.removeEventListener('playing', onPlaying);
        resolve(status);
      };
      const onErr = () => done('error');
      const onPlaying = () => done('playing');
      const onReady = () => {
        if (!autoplay) done('loaded');
      };

      au.addEventListener('error', onErr);
      au.addEventListener('canplay', onReady);
      au.addEventListener('playing', onPlaying);

      timer = setTimeout(() => {
        if (au.readyState >= 2) done(au.paused ? 'loaded' : 'playing');
        else done('error');
      }, 12000);

      au.src = url;
      applySpeed();
      try {
        au.load();
      } catch (_) {}

      if (!autoplay) return;

      const pr = au.play();
      if (pr && typeof pr.then === 'function') {
        pr.then(() => {
          if (my !== token) {
            done('abort');
            return;
          }
          applySpeed();
          done('playing');
        }).catch(err => {
          if (my !== token) {
            done('abort');
            return;
          }
          if (err && err.name === 'NotAllowedError') {
            done('blocked');
          } else {
            done('error');
          }
        });
      }
    });
  }

  let token = 0;
  async function load(i, opts) {
    opts = opts || {};
    clearTimeout(P.gapT);
    P.waiting = false;
    const my = ++token;
    P.i = i;
    const item = P.queue[i];
    if (!item) return;
    P.rep = opts.keepRep ? P.rep : 0;
    const c = cfg();
    const autoplay = opts.autoplay !== false;
    freeUrl();
    au.pause();
    P.playing = false;
    setMedia(item);
    emit();

    const urls = await sourceFor(item, c);
    if (my !== token) return;

    let ok = false;
    for (let k = 0; k < urls.length; k++) {
      const st = await tryUrl(urls[k], my, autoplay);
      if (my !== token || st === 'abort') return;
      if (st === 'playing') {
        P.playing = true;
        ok = true;
        break;
      }
      if (st === 'loaded' || st === 'blocked') {
        P.playing = false;
        ok = true;
        break;
      }
    }

    if (my !== token) return;
    if (!ok) {
      P.playing = false;
      au.removeAttribute('src');
      try {
        au.load();
      } catch (_) {}
      emit();
      ZD.toast('ऑडियो लोड नहीं हो सका। इंटरनेट चेक करें या सूरह ऑफ़लाइन डाउनलोड करें।');
      return;
    }

    try {
      prefetchNext(i, c);
    } catch (_) {}
    setMedia(item);
    emit();
  }

  au.addEventListener('loadedmetadata', applySpeed);
  au.addEventListener('playing', () => {
    applySpeed();
    P.playing = true;
    emit();
  });
  au.addEventListener('pause', () => {
    if (!au.ended) {
      P.playing = false;
      emit();
    }
  });
  au.addEventListener('timeupdate', () => {
    emit();
  });
  au.addEventListener('ended', () => {
    const c = cfg();
    const item = P.cur();
    if (!item) return;
    P.rep++;
    const advance = () => {
      if (P.rep < c.repeat) {
        load(P.i, { keepRep: true });
        return;
      }
      if (P.i + 1 < P.queue.length) {
        if (c.autoNext !== false) load(P.i + 1);
        else {
          P.playing = false;
          emit();
        }
        return;
      }
      if (P.loop > 1 && P.loopDone + 1 < P.loop) {
        P.loopDone++;
        load(0);
        return;
      }
      if (c.nextSurah && item.s < 114 && !P.noChain) {
        ZD.playSurah(item.s + 1, 1, { keepCfg: true });
        return;
      }
      P.playing = false;
      emit();
    };
    const gapSec = c.gap > 0 ? c.gap : 0;
    if (gapSec > 0) {
      P.playing = false;
      P.waiting = true;
      emit();
      P.gapT = setTimeout(() => {
        P.waiting = false;
        advance();
      }, gapSec * 1000);
    } else {
      advance();
    }
  });

  P.toggle = function () {
    if (!P.queue.length) return;
    if (P.waiting) {
      clearTimeout(P.gapT);
      P.waiting = false;
      P.rep = Math.max(0, P.rep);
      return load(P.i, { keepRep: true });
    }
    if (au.paused) {
      if (au.src && !au.error && au.networkState !== 3 && au.readyState > 0) {
        au.play().catch(() => load(P.i));
      } else {
        load(P.i);
      }
    } else {
      au.pause();
    }
  };

  P.next = function () {
    if (P.i + 1 < P.queue.length) load(P.i + 1);
    else if (P.i >= 0 && P.queue[P.i].s < 114 && !P.noChain) {
      ZD.playSurah(P.queue[P.i].s + 1, 1, { keepCfg: true });
    }
  };

  P.prev = function () {
    if (au.currentTime > 3) {
      au.currentTime = 0;
      return;
    }
    if (P.i > 0) load(P.i - 1);
    else if (P.i === 0) au.currentTime = 0;
  };

  P.stop = function () {
    token++;
    clearTimeout(P.gapT);
    clearPrefetch();
    au.pause();
    au.removeAttribute('src');
    try {
      au.load();
    } catch (_) {}
    P.playing = false;
    P.waiting = false;
    P.queue = [];
    P.i = -1;
    P.cfg = null;
    P.noChain = false;
    P.loop = 0;
    P.loopDone = 0;
    freeUrl();
    ZD.setSleep(0);
    emit();
  };

  P.seekFrac = f => {
    const frac = Math.max(0, Math.min(1, Number(f) || 0));
    if (au.duration && Number.isFinite(au.duration)) {
      au.currentTime = au.duration * frac;
    }
  };

  P.progress = () => (au.duration && Number.isFinite(au.duration) ? au.currentTime / au.duration : 0);
  P.audio = au;

  ZD.playSurah = function (s, from, opts) {
    opts = opts || {};
    const n = ZD.surah(s).count;
    from = Math.max(1, Math.min(n, from || 1));
    const to = Math.max(from, Math.min(n, opts.to || n));
    P.queue = [];
    for (let a = from; a <= to; a++) P.queue.push({ s, a });
    P.cfg = opts.cfg ? Object.assign({}, opts.cfg) : (opts.keepCfg && P.cfg ? Object.assign({}, P.cfg) : null);
    P.noChain = !!opts.noChain;
    P.loop = opts.loop || (opts.keepCfg ? P.loop : 0);
    if (!opts.keepCfg) P.loopDone = 0;
    P.waiting = false;
    document.body.classList.remove('no-mini');
    return load(0);
  };

  ZD.playAyah = function (s, a, opts) {
    opts = opts || {};
    if (opts.single) {
      P.queue = [{ s, a }];
      P.cfg = opts.cfg ? Object.assign({}, opts.cfg) : null;
      P.noChain = true;
      P.loop = 0;
      P.loopDone = 0;
      document.body.classList.remove('no-mini');
      return load(0);
    }
    return ZD.playSurah(s, a, { cfg: opts.cfg, noChain: opts.noChain });
  };

  ZD.playRange = function (s, from, to, c, loop) {
    return ZD.playSurah(s, from, { to, cfg: c, noChain: true, loop });
  };

  ZD.updateCfg = function (c) {
    if (!c) return;
    const prevReciter = cfg().reciter;
    P.cfg = Object.assign(P.cfg || {}, c);
    if (c.speed) applySpeed();
    if (c.reciter && c.reciter !== prevReciter) {
      clearPrefetch();
      const it = P.cur();
      if (it) setMedia(it);
    }
    emit();
  };

  ZD.switchReciter = function (reciterId, fallbackS, fallbackA) {
    if (!reciterId) return;
    const prevReciter = cfg().reciter;
    const p = ZD.prefs();
    p.reciter = reciterId;
    clearPrefetch();
    P.cfg = Object.assign(P.cfg || {}, { reciter: reciterId });
    ZD.save();
    if (P.cur()) {
      if (prevReciter !== reciterId || !P.playing) {
        return load(P.i, { keepRep: true, autoplay: true });
      }
      emit();
      return;
    }
    if (fallbackS) {
      return ZD.playSurah(fallbackS, fallbackA || 1, { keepCfg: true });
    }
    emit();
  };

  ZD.setSleep = function (min) {
    clearTimeout(P.sleepT);
    P.sleepEnd = 0;
    if (min > 0) {
      P.sleepEnd = Date.now() + min * 60000;
      P.sleepT = setTimeout(() => {
        au.pause();
        P.sleepEnd = 0;
        ZD.toast('स्लीप टाइमर पूरा हुआ');
        emit();
      }, min * 60000);
    }
    emit();
  };

  function setMedia(item) {
    if (!('mediaSession' in navigator) || !item) return;
    const sr = ZD.surah(item.s);
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: sr.en + ' — Ayah ' + item.a,
        artist: (ZD.RECITERS.find(r => r[0] === cfg().reciter) || ['', ''])[1],
        album: 'Zikr Deen',
        artwork: [
          { src: './icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: './icons/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      });
      navigator.mediaSession.setActionHandler('play', () => P.toggle());
      navigator.mediaSession.setActionHandler('pause', () => P.toggle());
      navigator.mediaSession.setActionHandler('nexttrack', () => P.next());
      navigator.mediaSession.setActionHandler('previoustrack', () => P.prev());
    } catch (_) {}
  }

  let wake = null;
  async function syncWake() {
    try {
      if (ZD.prefs().wake && P.playing && 'wakeLock' in navigator) {
        if (!wake) {
          wake = await navigator.wakeLock.request('screen');
          wake.addEventListener('release', () => {
            wake = null;
          });
        }
      } else if (wake) {
        await wake.release();
        wake = null;
      }
    } catch (_) {
      wake = null;
    }
  }
  ZD.onPlayer(syncWake);

  let miniCache = { hidden: null, title: '', sub: '', playing: null, pct: '' };
  function updateMini() {
    const m = $('#mini');
    if (!m) return;
    const it = P.cur();
    if (!it) {
      if (miniCache.hidden !== true) {
        m.hidden = true;
        document.body.classList.add('no-mini');
        miniCache.hidden = true;
      }
      return;
    }
    if (miniCache.hidden !== false) {
      m.hidden = false;
      document.body.classList.remove('no-mini');
      miniCache.hidden = false;
    }
    const sr = ZD.surah(it.s);
    const c = cfg();
    const title = sr.en + ' · ' + it.a + ' / ' + sr.count;
    let sub = (ZD.RECITERS.find(r => r[0] === c.reciter) || ['', ''])[1];
    if (c.repeat > 1) sub += ' · repeat ' + Math.min(P.rep + 1, c.repeat) + '/' + c.repeat;
    if (P.waiting) sub += ' · your turn to recite…';
    if (P.sleepEnd) sub += ' · sleep ' + Math.max(1, Math.round((P.sleepEnd - Date.now()) / 60000)) + 'm';
    const pct = (P.progress() * 100).toFixed(1) + '%';

    if (miniCache.title !== title) {
      $('#miniTitle').textContent = title;
      miniCache.title = title;
    }
    if (miniCache.sub !== sub) {
      $('#miniSub').textContent = sub;
      miniCache.sub = sub;
    }
    if (miniCache.playing !== !!P.playing) {
      $('#miniPlay').innerHTML = ZD.icon(P.playing ? 'pause' : 'play');
      miniCache.playing = !!P.playing;
    }
    if (miniCache.pct !== pct) {
      $('#miniFill').style.width = pct;
      miniCache.pct = pct;
    }
  }
  ZD.onPlayer(updateMini);

  document.addEventListener('DOMContentLoaded', () => {
    if ($('#miniPlay')) $('#miniPlay').addEventListener('click', () => P.toggle());
    if ($('#miniNext')) $('#miniNext').addEventListener('click', () => P.next());
    if ($('#miniPrev')) $('#miniPrev').addEventListener('click', () => P.prev());
    if ($('#miniOpen')) $('#miniOpen').addEventListener('click', () => {
      const it = P.cur();
      if (it) location.hash = '#/read/' + it.s + '/' + it.a;
    });
    if ($('#miniSet')) $('#miniSet').addEventListener('click', () => ZD.playbackSheet());
    if ($('#miniFull')) $('#miniFull').addEventListener('click', () => {
      location.hash = '#/listen';
    });
  });

  ZD.playbackSheet = function () {
    const p = ZD.prefs();
    const c = cfg();
    const rec = ZD.RECITERS.map(r => '<option value="' + r[0] + '"' + (r[0] === c.reciter ? ' selected' : '') + '>' + ZD.esc(r[1]) + '</option>').join('');
    const sp = [0.75, 0.9, 1, 1.15, 1.3, 1.5].map(x => '<option value="' + x + '"' + (x === c.speed ? ' selected' : '') + '>' + x + '×</option>').join('');
    ZD.openSheet(
      '<h3>Playback & Hifz mode</h3>' +
      '<div class="field"><label for="pbRec">Reciter</label><select id="pbRec">' + rec + '</select></div>' +
      '<div class="field"><label for="pbSpeed">Speed</label><select id="pbSpeed">' + sp + '</select></div>' +
      '<div class="field"><label for="pbRep">Repeat each ayah</label><input type="number" id="pbRep" min="1" max="20" value="' + c.repeat + '" style="width:84px"></div>' +
      '<div class="field"><label for="pbGap">Pause after each ayah (seconds) <span class="muted small">— recite it yourself in the gap</span></label><input type="number" id="pbGap" min="0" max="30" value="' + c.gap + '" style="width:84px"></div>' +
      '<div class="field"><label>Continue to next ayah</label><button type="button" class="switch" id="pbAuto" role="switch" aria-checked="' + (c.autoNext !== false) + '" aria-label="Continue to next ayah"></button></div>' +
      '<div class="field"><label>Continue into the next surah</label><button type="button" class="switch" id="pbNext" role="switch" aria-checked="' + (!!c.nextSurah) + '" aria-label="Continue into next surah"></button></div>' +
      '<div class="field"><label for="pbSleep">Sleep timer</label><select id="pbSleep"><option value="0">Off</option><option value="10">10 min</option><option value="20">20 min</option><option value="30">30 min</option><option value="60">60 min</option></select></div>' +
      '<p class="muted small">Tip: Repeat 3× with a 5-second pause works well for memorising one ayah at a time. Speeds above 1.15× can sound choppy on some phones.</p>' +
      '<div style="display:flex;gap:8px;margin-top:8px"><button type="button" class="btn" id="pbDone">Done</button><button type="button" class="btn ghost" id="pbStop">Stop playback</button></div>',
      sh => {
        const apply = (changedId) => {
          const prevRec = cfg().reciter;
          const n = {
            reciter: $('#pbRec', sh).value,
            speed: Number($('#pbSpeed', sh).value),
            repeat: Math.min(20, Math.max(1, Number($('#pbRep', sh).value) || 1)),
            gap: Math.min(30, Math.max(0, Number($('#pbGap', sh).value) || 0)),
            autoNext: $('#pbAuto', sh).getAttribute('aria-checked') === 'true',
            nextSurah: $('#pbNext', sh).getAttribute('aria-checked') === 'true'
          };
          Object.assign(p, n);
          ZD.updateCfg(n);
          ZD.save();
          if (changedId === 'pbRec' && n.reciter !== prevRec && P.cur()) {
            load(P.i, { keepRep: true, autoplay: P.playing });
          } else {
            updateMini();
          }
        };
        sh.addEventListener('change', e => {
          if (e.target.id === 'pbSleep') {
            ZD.setSleep(Number(e.target.value));
            return;
          }
          apply(e.target.id);
        });
        ['pbAuto', 'pbNext'].forEach(id => {
          $('#' + id, sh).addEventListener('click', e => {
            const b = e.currentTarget;
            b.setAttribute('aria-checked', b.getAttribute('aria-checked') !== 'true');
            apply(id);
          });
        });
        $('#pbDone', sh).addEventListener('click', ZD.closeSheet);
        $('#pbStop', sh).addEventListener('click', () => {
          P.stop();
          ZD.closeSheet();
        });
      }
    );
  };
})();

/* Zikr Deen App — Customizable Gemini-TTS Voice Engine (www/js/zd-voice.js)
   - All 21 Gemini-TTS voices (Male + Female) with 1-tap switching & live preview
   - Customizable Tone/Style (Calm, Teacher, Deep, Natural, or Custom Prompt) + Speed
   - Clean Gemini / ChatGPT / Claude style SVG icons exported at window.ZDVoice.icons
   - Phone Cache API + Long-text chunking + Offline browser fallback
*/
(function () {
  'use strict';

  var ICONS = {
    mic: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="2.5" width="6" height="11" rx="3"/><path d="M5.5 10.5a6.5 6.5 0 0 0 13 0"/><path d="M12 17v4"/><path d="M8.5 21h7"/></svg>',
    micOff: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="2" y1="2" x2="22" y2="22"/><path d="M15 9.34V5.5a3 3 0 0 0-5.68-1.33"/><path d="M9 9v1.5a3 3 0 0 0 5.12 2.12"/><path d="M5.5 10.5a6.5 6.5 0 0 0 10.8 4.86"/><path d="M12 17v4"/><path d="M8.5 21h7"/></svg>',
    liveWave: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" aria-hidden="true"><line x1="4" y1="10" x2="4" y2="14"/><line x1="8.5" y1="6.5" x2="8.5" y2="17.5"/><line x1="13" y1="4" x2="13" y2="20"/><line x1="17.5" y1="7.5" x2="17.5" y2="16.5"/><path d="M21 5.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6.6-1.4Z" fill="currentColor" stroke="none"/></svg>',
    speaker: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2.5 9 2.5 15 6 15 11 19 11 5"/><path d="M15.2 8.8a5 5 0 0 1 0 6.4"/><path d="M18.4 5.8a9.2 9.2 0 0 1 0 12.4"/></svg>',
    speakerOff: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2.5 9 2.5 15 6 15 11 19 11 5"/><line x1="22" y1="9" x2="16" y2="15"/><line x1="16" y1="9" x2="22" y2="15"/></svg>',
    stop: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2.5"/></svg>',
    tune: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="17" x2="20" y2="17"/><circle cx="9" cy="7" r="2.2" fill="currentColor"/><circle cx="15" cy="17" r="2.2" fill="currentColor"/></svg>',
    copy: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    plus: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    keyboard: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="5.5" width="19" height="13" rx="2.5"/><path d="M6.5 10h.01M10 10h.01M13.5 10h.01M17 10h.01M7.5 14h9"/></svg>',
    close: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    send: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 2 11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>'
  };

  var VOICES = [
    { name: 'Orus', gender: 'Male', tag: 'Calm & Clear (Hadith / Tarjuma ke liye best)' },
    { name: 'Charon', gender: 'Male', tag: 'Deep & Steady' },
    { name: 'Fenrir', gender: 'Male', tag: 'Warm Narrator' },
    { name: 'Alnilam', gender: 'Male', tag: 'Firm & Clear' },
    { name: 'Algieba', gender: 'Male', tag: 'Smooth Teacher' },
    { name: 'Algenib', gender: 'Male', tag: 'Soft Male' },
    { name: 'Achird', gender: 'Male', tag: 'Friendly' },
    { name: 'Enceladus', gender: 'Male', tag: 'Gentle & Slow' },
    { name: 'Iapetus', gender: 'Male', tag: 'Balanced' },
    { name: 'Puck', gender: 'Male', tag: 'Energetic (Quiz ke liye best)' },
    { name: 'Kore', gender: 'Female', tag: 'Calm Teacher (Best Female)' },
    { name: 'Aoede', gender: 'Female', tag: 'Warm & Expressive' },
    { name: 'Leda', gender: 'Female', tag: 'Youthful & Clear' },
    { name: 'Achernar', gender: 'Female', tag: 'Soft & Calm' },
    { name: 'Autonoe', gender: 'Female', tag: 'Bright & Crisp' },
    { name: 'Callirrhoe', gender: 'Female', tag: 'Easygoing' },
    { name: 'Despina', gender: 'Female', tag: 'Smooth Narration' },
    { name: 'Erinome', gender: 'Female', tag: 'Direct & Clear' },
    { name: 'Gacrux', gender: 'Female', tag: 'Mature & Steady' },
    { name: 'Laomedeia', gender: 'Female', tag: 'Upbeat' },
    { name: 'Pulcherrima', gender: 'Female', tag: 'Polite & Warm' }
  ];

  var STYLES = [
    { id: 'calm', label: 'Calm & Respectful', prompt: 'Speak slowly, calmly, and with deep respect.' },
    { id: 'teacher', label: 'Teacher / Explainer', prompt: 'Speak in a warm, clear, friendly teacher tone.' },
    { id: 'deep', label: 'Deep Narrator', prompt: 'Speak in a steady, measured, serious narrator voice with natural pauses.' },
    { id: 'natural', label: 'Natural Conversational', prompt: 'Speak naturally, clearly, and smoothly.' }
  ];

  var VOICE_NAMES = VOICES.map(function (v) { return v.name; });
  var BASE = 'https://generativelanguage.googleapis.com/v1beta/models/';
  var CACHE_NAME = 'zd-gemini-tts-v2';
  var STORE_KEY = 'zd-voice-prefs-v2';

  var LANG_MAP = {
    hi: { label: 'Hindi in Devanagari script', bcp47: 'hi-IN' },
    hinglish: { label: 'Hinglish (Hindi in Roman script)', bcp47: 'en-IN' },
    ur: { label: 'Urdu in Urdu script', bcp47: 'ur-PK' },
    en: { label: 'Indian English', bcp47: 'en-IN' },
    ar: { label: 'Arabic', bcp47: 'ar-SA' },
    bn: { label: 'Bengali', bcp47: 'bn-IN' },
    id: { label: 'Bahasa Indonesia', bcp47: 'id-ID' },
    tr: { label: 'Turkish', bcp47: 'tr-TR' }
  };

  var MODE_STYLE = {
    assistant: 'You are Ask Zikr Deen assistant.',
    translation: 'You are reading a Quran translation.',
    hadith: 'You are reading an authentic Hadith.'
  };

  var memCache = new Map();
  var currentAudio = null;
  var playToken = 0;
  var speaking = false;
  var coolUntil = 0;

  function loadPrefs() {
    var def = { voice: 'Orus', style: 'calm', speed: 1.0, customPrompt: '' };
    try {
      var raw = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
      if (raw && typeof raw === 'object') {
        if (VOICE_NAMES.indexOf(raw.voice) >= 0) def.voice = raw.voice;
        if (STYLES.some(function (s) { return s.id === raw.style; })) def.style = raw.style;
        var sp = Number(raw.speed);
        if (isFinite(sp) && sp >= 0.7 && sp <= 1.4) def.speed = sp;
        if (typeof raw.customPrompt === 'string') def.customPrompt = raw.customPrompt.slice(0, 120);
      }
    } catch (_) {}
    return def;
  }

  function savePrefs(patch) {
    var next = Object.assign(loadPrefs(), patch || {});
    if (VOICE_NAMES.indexOf(next.voice) < 0) next.voice = 'Orus';
    next.speed = Math.max(0.75, Math.min(1.35, Number(next.speed) || 1));
    next.customPrompt = String(next.customPrompt || '').trim().slice(0, 120);
    try { localStorage.setItem(STORE_KEY, JSON.stringify(next)); } catch (_) {}
    document.dispatchEvent(new CustomEvent('zd:voiceprefs', { detail: next }));
    return next;
  }

  function getCfg() {
    var c = window.ZD_ASK || {};
    var key = (c.key && String(c.key).indexOf('__GEMINI') !== 0) ? String(c.key) : '';
    var proxy = String(c.proxy || '').trim();
    var model = c.voiceModel || 'gemini-2.5-flash-preview-tts';
    return { key: key, proxy: proxy, model: model };
  }

  function hashKey(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return 'tts-' + (h >>> 0).toString(36) + '-' + str.length;
  }

  function splitChunks(text, maxLen) {
    var clean = String(text || '').replace(/\s+/g, ' ').trim();
    if (!clean) return [];
    if (clean.length <= maxLen) return [clean];
    var parts = clean.split(/(?<=[.!?\u0964\u06D4\u061F])\s+/);
    var out = [], buf = '';
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      if ((buf + ' ' + p).trim().length <= maxLen) {
        buf = (buf ? buf + ' ' : '') + p;
      } else {
        if (buf) out.push(buf);
        buf = p.length > maxLen ? p.slice(0, maxLen) : p;
      }
    }
    if (buf) out.push(buf);
    return out;
  }

  function pcmToWav(pcm, rate) {
    var buf = new ArrayBuffer(44 + pcm.length);
    var v = new DataView(buf);
    function wr(o, s) { for (var i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); }
    wr(0, 'RIFF'); v.setUint32(4, 36 + pcm.length, true); wr(8, 'WAVE'); wr(12, 'fmt ');
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true);
    v.setUint16(32, 2, true); v.setUint16(34, 16, true);
    wr(36, 'data'); v.setUint32(40, pcm.length, true);
    new Uint8Array(buf, 44).set(pcm);
    return new Blob([buf], { type: 'audio/wav' });
  }

  async function readCache(key) {
    if (memCache.has(key)) return memCache.get(key);
    try {
      if (typeof caches !== 'undefined') {
        var c = await caches.open(CACHE_NAME);
        var res = await c.match('/' + key);
        if (res) {
          var blob = await res.blob();
          memCache.set(key, blob);
          return blob;
        }
      }
    } catch (_) {}
    return null;
  }

  async function writeCache(key, blob) {
    if (memCache.size >= 36) {
      var first = memCache.keys().next().value;
      memCache.delete(first);
    }
    memCache.set(key, blob);
    try {
      if (typeof caches !== 'undefined') {
        var c = await caches.open(CACHE_NAME);
        await c.put('/' + key, new Response(blob, { headers: { 'Content-Type': 'audio/wav' } }));
      }
    } catch (_) {}
  }

  function buildInstruction(langCode, mode, prefs) {
    var langInfo = LANG_MAP[langCode] || LANG_MAP.hi;
    var stObj = STYLES.find(function (s) { return s.id === prefs.style; }) || STYLES[0];
    var extra = prefs.customPrompt ? (' Additional style: ' + prefs.customPrompt + '.') : '';
    var role = MODE_STYLE[mode] || MODE_STYLE.assistant;
    return role + ' Read the following text aloud in ' + langInfo.label + '. ' + stObj.prompt + extra + ' Preserve the exact wording without adding commentary: ';
  }

  async function fetchGeminiWav(chunk, voice, langCode, mode, prefs) {
    var cfg = getCfg();
    if ((!cfg.proxy && !cfg.key) || (navigator.onLine === false) || Date.now() < coolUntil) {
      throw new Error('tts_unavailable');
    }

    var promptPrefix = buildInstruction(langCode, mode, prefs);
    var cacheKey = hashKey(cfg.model + '|' + voice + '|' + promptPrefix + '|' + chunk);
    var cached = await readCache(cacheKey);
    if (cached) return cached;

    var body = {
      contents: [{ parts: [{ text: promptPrefix + chunk }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } }
      }
    };

    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, 16000) : null;

    try {
      var url = cfg.proxy || (BASE + cfg.model + ':generateContent');
      var headers = { 'content-type': 'application/json' };
      var payload = cfg.proxy ? Object.assign({}, body, { model: cfg.model }) : body;
      if (!cfg.proxy) headers['x-goog-api-key'] = cfg.key;

      var res = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
        signal: ctrl ? ctrl.signal : undefined
      });

      if (res.status === 429) {
        coolUntil = Date.now() + 90 * 1000;
        throw new Error('rate_limited');
      }
      if (!res.ok) throw new Error('tts_' + res.status);

      var data = await res.json();
      var parts = (((data.candidates || [])[0] || {}).content || {}).parts || [];
      var audioPart = null;
      for (var i = 0; i < parts.length; i++) {
        if (parts[i].inlineData && parts[i].inlineData.data) {
          audioPart = parts[i];
          break;
        }
      }
      if (!audioPart) throw new Error('no_audio');

      var rm = /rate=(\d+)/.exec(audioPart.inlineData.mimeType || '');
      var rate = rm ? Number(rm[1]) : 24000;
      var bin = atob(audioPart.inlineData.data);
      var pcm = new Uint8Array(bin.length);
      for (var k = 0; k < bin.length; k++) pcm[k] = bin.charCodeAt(k);

      var wav = pcmToWav(pcm, rate);
      await writeCache(cacheKey, wav);
      return wav;
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  function playBlob(blob, speed, token) {
    return new Promise(function (resolve, reject) {
      if (token !== playToken) return resolve();
      var url = URL.createObjectURL(blob);
      var a = new Audio(url);
      a.playbackRate = speed || 1;
      currentAudio = a;
      function done(err) {
        URL.revokeObjectURL(url);
        if (currentAudio === a) currentAudio = null;
        if (err) reject(err); else resolve();
      }
      a.onended = function () { done(); };
      a.onerror = function () { done(new Error('audio_play_err')); };
      a.play().catch(function (e) { done(e); });
    });
  }

  function fallbackSpeak(text, langCode, speed, token) {
    return new Promise(function (resolve) {
      if (token !== playToken || !window.speechSynthesis) return resolve();
      try {
        window.speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(text);
        u.lang = (LANG_MAP[langCode] || LANG_MAP.hi).bcp47;
        u.rate = speed || 0.96;
        u.onend = resolve;
        u.onerror = resolve;
        window.speechSynthesis.speak(u);
      } catch (_) {
        resolve();
      }
    });
  }

  function stop() {
    playToken++;
    speaking = false;
    try { if (currentAudio) { currentAudio.pause(); currentAudio.currentTime = 0; currentAudio = null; } } catch (_) {}
    try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (_) {}
    document.dispatchEvent(new CustomEvent('zd:voicechange', { detail: { speaking: false } }));
  }

  async function speak(text, opts) {
    opts = opts || {};
    stop();
    var token = playToken;
    var prefs = loadPrefs();
    var voice = VOICE_NAMES.indexOf(opts.voice) >= 0 ? opts.voice : prefs.voice;
    var speed = Number(opts.speed) || prefs.speed;
    var lang = opts.lang || 'hi';
    var mode = opts.mode || 'assistant';
    var chunks = splitChunks(text, 550);
    if (!chunks.length) return;

    speaking = true;
    document.dispatchEvent(new CustomEvent('zd:voicechange', { detail: { speaking: true, voice: voice } }));

    try {
      for (var i = 0; i < chunks.length; i++) {
        if (token !== playToken) break;
        try {
          var wav = await fetchGeminiWav(chunks[i], voice, lang, mode, prefs);
          if (token !== playToken) break;
          await playBlob(wav, speed, token);
        } catch (_) {
          if (token !== playToken) break;
          await fallbackSpeak(chunks[i], lang, speed, token);
        }
      }
    } finally {
      if (token === playToken) {
        speaking = false;
        document.dispatchEvent(new CustomEvent('zd:voicechange', { detail: { speaking: false } }));
      }
    }
  }

  /* ---------- Modern Voice Settings Bottom-Sheet Modal (Zero Old Emojis) ---------- */
  function injectModalCss() {
    if (document.getElementById('zd-voice-modal-css')) return;
    var s = document.createElement('style');
    s.id = 'zd-voice-modal-css';
    s.textContent =
      '#zdVoiceModal{position:fixed;inset:0;z-index:10010;background:rgba(4,12,9,.68);backdrop-filter:blur(4px);display:flex;align-items:flex-end;justify-content:center;padding:10px}' +
      '#zdVoiceModal .zvm-box{width:min(500px,100%);max-height:86vh;overflow:auto;background:#10251f;color:#f4f3e9;border:1px solid #2e5244;border-radius:24px;padding:16px;font-family:system-ui,-apple-system,sans-serif;box-shadow:0 24px 56px rgba(0,0,0,.55)}' +
      '#zdVoiceModal .zvm-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;gap:10px}' +
      '#zdVoiceModal .zvm-head h3{margin:0;font-size:15px;color:#d8b66a;display:flex;align-items:center;gap:8px}' +
      '#zdVoiceModal .zvm-btn{border:1px solid #2e5244;background:#17352a;color:#f4f3e9;border-radius:11px;padding:8px 12px;font-size:12px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:6px}' +
      '#zdVoiceModal .zvm-btn.icon-only{width:34px;height:34px;padding:0;justify-content:center;border-radius:50%}' +
      '#zdVoiceModal .zvm-btn.on,#zdVoiceModal .zvm-btn.pri{background:linear-gradient(130deg,#d8b66a,#a67e3e);color:#17241b;border:0}' +
      '#zdVoiceModal .zvm-tabs{display:flex;gap:6px;margin-bottom:10px}' +
      '#zdVoiceModal .zvm-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-bottom:12px}' +
      '#zdVoiceModal .zvm-v{text-align:left;padding:9px 10px;border-radius:12px;border:1px solid #29483c;background:#0a1b16;color:#f4f3e9;cursor:pointer}' +
      '#zdVoiceModal .zvm-v.on{border-color:#d8b66a;background:#1b3b2e}' +
      '#zdVoiceModal .zvm-v b{display:block;font-size:13px;color:#f4f3e9}' +
      '#zdVoiceModal .zvm-v small{display:block;font-size:10px;color:#a8beb0;margin-top:2px}' +
      '#zdVoiceModal .zvm-row{margin:10px 0}' +
      '#zdVoiceModal label{display:block;font-size:12px;color:#b2c4b8;margin-bottom:5px}' +
      '#zdVoiceModal select,#zdVoiceModal input[type=text]{width:100%;padding:9px 10px;border-radius:11px;border:1px solid #29483c;background:#091914;color:#f4f3e9;font-size:13px}' +
      '#zdVoiceModal .zvm-foot{display:flex;gap:8px;margin-top:14px;flex-wrap:wrap;align-items:center}' +
      '@media(max-width:440px){#zdVoiceModal .zvm-grid{grid-template-columns:1fr}}';
    document.head.appendChild(s);
  }

  function openSettings() {
    injectModalCss();
    var old = document.getElementById('zdVoiceModal');
    if (old) old.remove();

    var prefs = loadPrefs();
    var filter = 'All';

    var wrap = document.createElement('div');
    wrap.id = 'zdVoiceModal';
    document.body.appendChild(wrap);

    function draw() {
      var list = VOICES.filter(function (v) { return filter === 'All' || v.gender === filter; });
      wrap.innerHTML =
        '<div class="zvm-box">' +
          '<div class="zvm-head"><h3>' + ICONS.tune + '<span>Gemini Voice Settings (21)</span></h3><button type="button" class="zvm-btn icon-only" id="zvmClose" aria-label="Close">' + ICONS.close + '</button></div>' +
          '<div class="zvm-tabs">' +
            ['All', 'Male', 'Female'].map(function (g) {
              return '<button type="button" class="zvm-btn' + (filter === g ? ' on' : '') + '" data-g="' + g + '">' +
                (g === 'All' ? 'All (21)' : g === 'Male' ? 'Male (10)' : 'Female (11)') + '</button>';
            }).join('') +
          '</div>' +
          '<div class="zvm-grid">' +
            list.map(function (v) {
              return '<button type="button" class="zvm-v' + (prefs.voice === v.name ? ' on' : '') + '" data-v="' + v.name + '">' +
                '<b>' + v.name + ' <span style="font-size:10px;color:#d8b66a">(' + v.gender + ')</span></b>' +
                '<small>' + v.tag + '</small></button>';
            }).join('') +
          '</div>' +
          '<div class="zvm-row"><label for="zvmStyle">Tone / Style</label>' +
            '<select id="zvmStyle">' + STYLES.map(function (st) {
              return '<option value="' + st.id + '"' + (prefs.style === st.id ? ' selected' : '') + '>' + st.label + '</option>';
            }).join('') + '</select></div>' +
          '<div class="zvm-row"><label for="zvmSpeed">Speed: <b id="zvmSpVal">' + prefs.speed.toFixed(2) + 'x</b></label>' +
            '<input type="range" id="zvmSpeed" min="0.75" max="1.25" step="0.05" value="' + prefs.speed + '" style="width:100%"></div>' +
          '<div class="zvm-row"><label for="zvmCustom">Custom style (optional)</label>' +
            '<input type="text" id="zvmCustom" maxlength="120" placeholder="e.g. slow and gentle like a teacher" value="' + prefs.customPrompt.split('&').join('&amp;').split('"').join('&quot;').split('<').join('&lt;') + '"></div>' +
          '<div class="zvm-foot">' +
            '<button type="button" class="zvm-btn pri" id="zvmTest">' + ICONS.speaker + '<span>Test Voice</span></button>' +
            '<button type="button" class="zvm-btn" id="zvmStop">' + ICONS.stop + '<span>Stop</span></button>' +
            '<button type="button" class="zvm-btn" id="zvmDone" style="margin-left:auto">Save</button>' +
          '</div>' +
        '</div>';

      wrap.querySelector('#zvmClose').onclick = function () { stop(); wrap.remove(); };
      wrap.querySelector('#zvmDone').onclick = function () { savePrefs(prefs); wrap.remove(); };
      wrap.querySelector('#zvmStop').onclick = stop;
      wrap.querySelector('#zvmTest').onclick = function () {
        savePrefs(prefs);
        speak('Assalamu Alaikum! Zikr Deen ki aapki chuni hui Gemini voice ab ready hai.', { lang: 'hinglish', mode: 'assistant' });
      };
      wrap.querySelectorAll('[data-g]').forEach(function (b) {
        b.onclick = function () { filter = b.dataset.g; draw(); };
      });
      wrap.querySelectorAll('[data-v]').forEach(function (b) {
        b.onclick = function () { prefs = savePrefs({ voice: b.dataset.v }); draw(); };
      });
      wrap.querySelector('#zvmStyle').onchange = function (e) { prefs = savePrefs({ style: e.target.value }); };
      wrap.querySelector('#zvmSpeed').oninput = function (e) {
        prefs = savePrefs({ speed: Number(e.target.value) });
        wrap.querySelector('#zvmSpVal').textContent = prefs.speed.toFixed(2) + 'x';
      };
      wrap.querySelector('#zvmCustom').oninput = function (e) {
        prefs = savePrefs({ customPrompt: e.target.value });
      };
    }

    wrap.addEventListener('click', function (e) {
      if (e.target === wrap) { stop(); wrap.remove(); }
    });
    draw();
  }

  window.ZDVoice = {
    icons: ICONS,
    VOICES: VOICES,
    STYLES: STYLES,
    getPrefs: loadPrefs,
    setPrefs: savePrefs,
    getVoice: function () { return loadPrefs().voice; },
    setVoice: function (name) { return savePrefs({ voice: name }); },
    speak: speak,
    stop: stop,
    isSpeaking: function () { return speaking; },
    openSettings: openSettings
  };
})();

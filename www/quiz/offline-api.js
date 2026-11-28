/* Zikr Deen Quiz - runs INSIDE the app, no server.
   Upgraded V2: AbortController timeouts, offline detection, smarter cooldowns, safer JSON extraction. */
(function () {
  'use strict';
  if (typeof window.API_BASE === 'undefined') window.API_BASE = '';
  var realFetch = window.fetch ? window.fetch.bind(window) : null;
  var CFG = window.ZD_ASK || {};
  var KEY = (CFG.key && String(CFG.key).indexOf('__GEMINI') !== 0) ? String(CFG.key) : '';
  var PROXY = String(CFG.proxy || '').trim();
  var TEXT_MODELS = (CFG.models && CFG.models.length) ? CFG.models : ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash'];
  var TTS_MODELS = [CFG.voiceModel || 'gemini-2.5-flash-preview-tts'];
  var VOICES = ['Kore', 'Puck', 'Charon', 'Aoede', 'Fenrir', 'Orus'];
  var BASE = 'https://generativelanguage.googleapis.com/v1beta/models/';
  var LANGS = {
    en: 'English', ar: 'Arabic in Arabic script', id: 'Bahasa Indonesia', ur: 'Urdu in Urdu script',
    hi: 'Hindi in Devanagari script', hinglish: 'Hinglish (Hindi written in Roman letters)',
    bn: 'Bengali in Bengali script', ms: 'Bahasa Melayu', fa: 'Persian/Farsi in Persian script',
    tr: 'Turkish', uz: 'Uzbek', fr: 'French', ru: 'Russian', ha: 'Hausa', sw: 'Swahili',
    de: 'German', es: 'Spanish', zh: 'Simplified Chinese', ko: 'Korean', ja: 'Japanese'
  };
  var SYSTEM = "You are the quiz-maker of \"Ask Zikr Deen\", a learning app. Turn the user's question into ONE quiz question whose correct option answers it.\nModes:\n- islam: Islamic knowledge (Quran, authentic hadith, seerah, history, basic practices).\n- science: ordinary, accurate school/general science.\n- both: ONE question that connects an Islamic text with a scientific fact. Keep them strictly separate: put what the Quran/hadith says in \"why\" (with exact reference in \"ref\"), and the scientific fact, with its source name, in \"sci\". Never claim the Quran \"predicted\" or \"proved\" a scientific finding; frame it as a reflection (tadabbur) and say plainly where the link is only an observation.\nFormats: \"mcq\" = exactly 4 options; \"tf\" = exactly 2 options, the first is True and the second is False (written in the requested language).\nRules:\n- Islamic facts only from the Quran and authentic hadith (Sahih al-Bukhari, Sahih Muslim) or well-established seerah. Give a precise reference. If unsure about a fact or reference, set \"sure\": false and say so in \"why\".\n- Do NOT give fatwas or personal rulings (halal/haram for someone's situation), medical or legal advice, and avoid sectarian disputes. For those, or off-topic questions, reply only {\"refuse\":true,\"msg\":\"...\"} politely advising to ask a qualified scholar or professional, in the requested language.\n- Distractors must be plausible but clearly wrong. Use proper honorifics in the requested language.\n- Write everything in the requested language and script.\nReturn ONLY JSON: {\"q\":\"\",\"o\":[\"\",\"\"],\"a\":0,\"why\":\"\",\"ref\":\"\",\"sci\":\"\",\"emoji\":\"one emoji\",\"topic\":\"short topic\",\"sure\":true}";

  var cool = {};

  function json(o, s) {
    return new Response(JSON.stringify(o), {
      status: s || 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  function fetchWithTimeout(url, opts, timeoutMs) {
    if (!realFetch) return Promise.reject(new Error('no fetch'));
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return Promise.reject(new Error('offline'));
    }
    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, timeoutMs || 20000) : null;
    var reqOpts = ctrl ? Object.assign({}, opts, { signal: ctrl.signal }) : opts;
    return realFetch(url, reqOpts).finally(function () {
      if (timer) clearTimeout(timer);
    });
  }

  function post(path, body, timeoutMs) {
    if (PROXY) {
      var payload = Object.assign({}, body, { model: path.split(':')[0] });
      return fetchWithTimeout(PROXY, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
      }, timeoutMs).then(function (r) {
        if (!r.ok) throw new Error('gemini ' + r.status);
        return r.json();
      });
    }
    if (!KEY) return Promise.reject(new Error('gemini 503'));
    return fetchWithTimeout(BASE + path, {
      method: 'POST',
      headers: { 'x-goog-api-key': KEY, 'content-type': 'application/json' },
      body: JSON.stringify(body)
    }, timeoutMs).then(function (r) {
      if (!r.ok) throw new Error('gemini ' + r.status);
      return r.json();
    });
  }

  function tryModels(list, body, timeoutMs) {
    var now = Date.now();
    var ready = list.filter(function (m) { return (cool[m] || 0) <= now; });
    var order = ready.length ? ready : list;
    var last = null, i = 0;

    function next() {
      if (i >= order.length) return Promise.reject(last || new Error('gemini unavailable'));
      var m = order[i++];
      return post(m + ':generateContent', body, timeoutMs).catch(function (e) {
        last = e;
        if (e && (e.message === 'offline' || e.name === 'AbortError')) throw e;
        var code = Number(String(e.message || '').replace('gemini ', ''));
        if (code === 429) { cool[m] = Date.now() + 2 * 60 * 1000; return next(); }
        if (code >= 500) { cool[m] = Date.now() + 5 * 60 * 1000; return next(); }
        if (code === 404) { cool[m] = Date.now() + 60 * 60 * 1000; return next(); }
        throw e;
      });
    }
    return next();
  }

  function shuffleOptions(o, a) {
    var right = o[a];
    var arr = o.map(function (x) { return [Math.random(), x]; })
      .sort(function (x, y) { return x[0] - y[0]; })
      .map(function (x) { return x[1]; });
    return { o: arr, a: arr.indexOf(right) };
  }

  function parseQuiz(data, format) {
    var parts = (((data.candidates || [])[0] || {}).content || {}).parts || [];
    var text = parts
      .filter(function (p) { return p.text && !p.thought; })
      .map(function (p) { return p.text; })
      .join('')
      .replace(/```json|```/gi, '')
      .trim();
    var start = text.indexOf('{'), end = text.lastIndexOf('}');
    if (start === -1 || end <= start) throw new Error('invalid json');
    var j = JSON.parse(text.slice(start, end + 1));
    if (j.refuse) return { refuse: true, msg: String(j.msg || '').slice(0, 500) };
    var n = format === 'tf' ? 2 : 4;
    if (!j.q || !Array.isArray(j.o) || j.o.length !== n || !Number.isInteger(j.a) || j.a < 0 || j.a >= n) {
      throw new Error('bad shape');
    }
    var o = j.o.map(String), a = j.a;
    if (n === 4) {
      var s = shuffleOptions(o, a);
      o = s.o;
      a = s.a;
    }
    return {
      mcq: {
        q: String(j.q),
        o: o,
        a: a,
        why: String(j.why || '') + (j.sure === false ? ' (\u26a0\ufe0f unverified)' : ''),
        ref: String(j.ref || ''),
        sci: String(j.sci || ''),
        emoji: String(j.emoji || '\ud83d\udcd6').slice(0, 4),
        topic: String(j.topic || '').slice(0, 40)
      }
    };
  }

  function askAllowed() {
    try {
      var k = 'zdQuizAskLog', now = Date.now();
      var a = JSON.parse(localStorage.getItem(k) || '[]').filter(function (t) { return now - t < 3600000; });
      if (a.length >= 15) return false;
      a.push(now);
      localStorage.setItem(k, JSON.stringify(a));
    } catch (e) {}
    return true;
  }

  function handleAsk(body) {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return Promise.resolve(json({ ok: false, error: 'You are offline. Connect to the internet to use Ask Zikr Deen.' }, 503));
    }
    if (!KEY && !PROXY) {
      return Promise.resolve(json({ ok: false, error: 'AI is not configured. Set GEMINI_PROXY_URL in the build workflow and GEMINI_API_KEY on the backend.' }, 503));
    }
    var question = String(body.question || '').trim().slice(0, 240);
    if (question.length < 5) return Promise.resolve(json({ ok: false, error: 'Question is too short.' }, 400));
    if (!askAllowed()) return Promise.resolve(json({ ok: false, error: 'Too many questions this hour. Please try again later.' }, 429));
    var mode = ['islam', 'science', 'both'].indexOf(body.mode) >= 0 ? body.mode : 'islam';
    var format = body.format === 'tf' ? 'tf' : 'mcq';

    return tryModels(TEXT_MODELS, {
      systemInstruction: { parts: [{ text: SYSTEM }] },
      contents: [{ role: 'user', parts: [{ text: 'Requested language: ' + (LANGS[body.lang] || LANGS.hi) + '\nMode: ' + mode + '\nFormat: ' + format + '\nUser question: ' + question }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.4, maxOutputTokens: 4000 }
    }, 22000).then(function (d) {
      var o = parseQuiz(d, format);
      o.ok = true;
      return json(o);
    }).catch(function (err) {
      var msg = (err && err.name === 'AbortError')
        ? 'Request timed out. Please try again on a stable connection.'
        : 'Could not create the quiz right now.';
      return json({ ok: false, error: msg }, 502);
    });
  }

  function pcmToWav(pcm, rate) {
    var buf = new ArrayBuffer(44 + pcm.length), v = new DataView(buf);
    function str(o, s) { for (var i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); }
    str(0, 'RIFF'); v.setUint32(4, 36 + pcm.length, true); str(8, 'WAVE'); str(12, 'fmt ');
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true);
    v.setUint16(34, 16, true); str(36, 'data'); v.setUint32(40, pcm.length, true);
    new Uint8Array(buf, 44).set(pcm);
    return new Blob([buf], { type: 'audio/wav' });
  }

  function handleSpeak(body) {
    if ((!KEY && !PROXY) || (typeof navigator !== 'undefined' && navigator.onLine === false)) {
      return Promise.resolve(json({ ok: false }, 503));
    }
    var text = String(body.text || '').trim().slice(0, 700);
    if (!text) return Promise.resolve(json({ ok: false }, 400));
    var voice = VOICES.indexOf(body.voice) >= 0 ? body.voice : 'Kore';
    var language = LANGS[body.lang] || LANGS.en;

    return tryModels(TTS_MODELS, {
      contents: [{ parts: [{ text: 'Speak the following text in ' + language + '. Use a calm, warm teacher voice. Preserve the original wording and script: ' + text }] }],
      generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } } }
    }, 15000).then(function (d) {
      var ps = (((d.candidates || [])[0] || {}).content || {}).parts || [], part = null;
      for (var i = 0; i < ps.length; i++) if (ps[i].inlineData) { part = ps[i]; break; }
      if (!part) throw new Error('no audio');
      var rm = /rate=(\d+)/.exec(part.inlineData.mimeType || ''), rate = rm ? Number(rm[1]) : 24000;
      var bin = atob(part.inlineData.data), u8 = new Uint8Array(bin.length);
      for (var k = 0; k < bin.length; k++) u8[k] = bin.charCodeAt(k);
      return new Response(pcmToWav(u8, rate), { status: 200, headers: { 'Content-Type': 'audio/wav' } });
    }).catch(function () {
      return json({ ok: false }, 502);
    });
  }

  window.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : (input && input.url) || '';
    var path = url.replace(/^https?:\/\/[^\/]+/, '');
    if (path.indexOf('/api/') === 0) {
      var body = {};
      try { body = JSON.parse((init && init.body) || '{}'); } catch (e) {}
      var route = path.split('?')[0];
      if (route === '/api/ask') return handleAsk(body);
      if (route === '/api/speak') return handleSpeak(body);
      return Promise.resolve(json({ ok: false, error: 'Online-only feature' }, 503));
    }
    return realFetch ? realFetch(input, init) : Promise.reject(new Error('no fetch'));
  };

  function hideOnline() {
    ['playerProfile', 'communityName', 'communityIdentitySetup', 'communityStats'].forEach(function (id) {
      var e = document.getElementById(id);
      var c = e && e.closest('.card');
      if (c) c.style.display = 'none';
    });
  }

  window.ZDOfflineAPI = { version: '2.0', hasProxy: Boolean(PROXY), hasKey: Boolean(KEY) };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hideOnline);
  else hideOnline();
})();

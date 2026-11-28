/* Zikr Deen App — Gemini / ChatGPT / Claude Style Floating Voice Assistant (www/js/zd-live-assistant.js)
   - Modern thin-stroke vector SVG icons (Live Waveform FAB, Clean Outline Mic, Gemini Speaker, Copy, Keyboard, Close)
   - Zero old emojis anywhere in the control bar
   - Works with window.ZD_ASK (js/ask-config.js) + window.ZDVoice (js/zd-voice.js)
*/
(function () {
  'use strict';

  var BASE = 'https://generativelanguage.googleapis.com/v1beta/models/';
  var LANGS = {
    hi: { label: 'हिन्दी', bcp47: 'hi-IN', name: 'Hindi', greet: 'अस्सलामु अलैकुम! मैं ज़िक्र दीन असिस्टेंट हूँ। नीचे माइक या चमकते बटन पर टैप करके अपना सवाल बोलें।' },
    ur: { label: 'اردو', bcp47: 'ur-PK', name: 'Urdu', greet: 'السلام علیکم! میں ذکر دین اسسٹنٹ ہوں۔ نیچے مائیک پر ٹیپ کر کے اپنا سوال بولیں۔' },
    en: { label: 'English', bcp47: 'en-IN', name: 'English', greet: 'Assalamu Alaikum! I am Zikr Deen Assistant. Tap the mic or glowing orb below and ask your question.' }
  };

  var SYSTEM_PROMPT =
    'You are "Ask Zikr Deen", a warm, respectful voice assistant inside an Islamic & science learning app. ' +
    'Keep answers concise (2 to 4 short sentences) so they sound natural when read aloud. ' +
    'Base Islamic answers only on the Quran, authentic Hadith (Sahih al-Bukhari, Sahih Muslim), or well-established Seerah, and mention a brief reference when possible. ' +
    'Do not issue personal fatwas, medical or legal advice, or enter sectarian debates; politely suggest consulting a qualified scholar or professional. ' +
    'Reply in the exact language requested by the user without markdown asterisks or heavy formatting.';

  var FALLBACK_ICONS = {
    mic: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2.5" width="6" height="11" rx="3"/><path d="M5.5 10.5a6.5 6.5 0 0 0 13 0"/><path d="M12 17v4"/><path d="M8.5 21h7"/></svg>',
    liveWave: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><line x1="4" y1="10" x2="4" y2="14"/><line x1="8.5" y1="6.5" x2="8.5" y2="17.5"/><line x1="13" y1="4" x2="13" y2="20"/><line x1="17.5" y1="7.5" x2="17.5" y2="16.5"/><path d="M21 5.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6.6-1.4Z" fill="currentColor" stroke="none"/></svg>',
    speaker: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2.5 9 2.5 15 6 15 11 19 11 5"/><path d="M15.2 8.8a5 5 0 0 1 0 6.4"/><path d="M18.4 5.8a9.2 9.2 0 0 1 0 12.4"/></svg>',
    speakerOff: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2.5 9 2.5 15 6 15 11 19 11 5"/><line x1="22" y1="9" x2="16" y2="15"/><line x1="16" y1="9" x2="22" y2="15"/></svg>',
    tune: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="17" x2="20" y2="17"/><circle cx="9" cy="7" r="2.2" fill="currentColor"/><circle cx="15" cy="17" r="2.2" fill="currentColor"/></svg>',
    copy: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    plus: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    keyboard: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="5.5" width="19" height="13" rx="2.5"/><path d="M6.5 10h.01M10 10h.01M13.5 10h.01M17 10h.01M7.5 14h9"/></svg>',
    close: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    send: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>'
  };

  function ic(name) {
    return (window.ZDVoice && window.ZDVoice.icons && window.ZDVoice.icons[name]) || FALLBACK_ICONS[name] || '';
  }

  var isOpen = false;
  var state = 'idle'; // idle | listening | thinking | speaking
  var muted = false;
  var lang = 'hi';
  var history = [];
  var lastReply = '';
  var lastUserText = '';
  var rec = null;
  var activeCtrl = null;

  function getCfg() {
    var c = window.ZD_ASK || {};
    var key = (c.key && String(c.key).indexOf('__GEMINI') !== 0) ? String(c.key) : '';
    var proxy = String(c.proxy || '').trim();
    var models = (c.models && c.models.length) ? c.models : ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash'];
    return { key: key, proxy: proxy, models: models };
  }

  function injectStyles() {
    if (document.getElementById('zd-live-css')) return;
    var s = document.createElement('style');
    s.id = 'zd-live-css';
    s.textContent =
      '#zdLiveFab{position:fixed;right:16px;bottom:84px;z-index:9980;width:54px;height:54px;border-radius:50%;border:1.5px solid rgba(216,182,106,.75);background:linear-gradient(145deg,#194636,#0c241b);color:#f7f4eb;display:grid;place-items:center;cursor:pointer;box-shadow:0 10px 28px rgba(0,0,0,.38);transition:transform .18s ease}' +
      '#zdLiveFab:active{transform:scale(.93)}' +
      '#zdLiveOverlay{position:fixed;inset:0;z-index:9990;background:rgba(4,12,9,.52);backdrop-filter:blur(4px);display:none;align-items:flex-end;justify-content:center;padding:10px}' +
      '#zdLiveOverlay.open{display:flex}' +
      '.zdl-sheet{width:min(480px,100%);height:min(76vh,620px);background:#fdfcf8;color:#1b2c24;border-radius:28px;box-shadow:0 24px 60px rgba(0,0,0,.42);display:flex;flex-direction:column;overflow:hidden;font-family:system-ui,-apple-system,sans-serif;animation:zdlUp .24s ease}' +
      '@keyframes zdlUp{from{transform:translateY(32px);opacity:0}to{transform:translateY(0);opacity:1}}' +
      '.zdl-handle{width:38px;height:4px;border-radius:99px;background:#cbd5ce;margin:10px auto 4px;flex:none}' +
      '.zdl-top{display:flex;align-items:center;justify-content:space-between;padding:6px 14px 10px;gap:8px;flex:none}' +
      '.zdl-pillgroup{display:flex;align-items:center;gap:4px;background:#eff3ef;padding:4px 8px;border-radius:99px}' +
      '.zdl-ibtn{width:38px;height:38px;border-radius:50%;border:0;background:#eff3ef;color:#1f2937;display:grid;place-items:center;cursor:pointer;transition:background .15s ease}' +
      '.zdl-ibtn:hover{background:#e2e8e4}' +
      '.zdl-pillgroup .zdl-ibtn{background:transparent;width:34px;height:34px}' +
      '.zdl-lang{border:0;background:transparent;color:#1f2937;font:700 12px system-ui,sans-serif;padding:0 6px;cursor:pointer}' +
      '.zdl-body{flex:1;overflow-y:auto;padding:8px 18px 12px;display:flex;flex-direction:column;justify-content:space-between;gap:14px}' +
      '.zdl-reply-text{font-size:17px;line-height:1.65;color:#182b22;margin:0;white-space:pre-wrap}' +
      '.zdl-reply-acts{display:flex;gap:8px;margin-top:12px;align-items:center}' +
      '.zdl-mini{width:36px;height:36px;border:0;background:transparent;color:#374151;border-radius:50%;display:grid;place-items:center;cursor:pointer;transition:background .15s ease}' +
      '.zdl-mini:hover{background:#edf2ee}' +
      '.zdl-user-pill{background:#edf1ee;color:#273b31;border-radius:16px;padding:12px 14px;font-size:15px;font-style:italic;line-height:1.5;min-height:46px}' +
      '.zdl-status{text-align:center;font-size:12px;font-weight:600;color:#4b6b5c;margin:6px 0 4px}' +
      '.zdl-typebar{display:none;gap:6px;padding:0 14px 8px}' +
      '.zdl-typebar.show{display:flex}' +
      '.zdl-typebar input{flex:1;border:1px solid #cbd8cf;border-radius:16px;padding:10px 13px;font-size:14px;background:#fff;color:#182b22}' +
      '.zdl-typebar button{width:42px;height:42px;border:0;border-radius:50%;background:#1e5c45;color:#fff;display:grid;place-items:center;cursor:pointer;flex:none}' +
      '.zdl-dock{display:flex;align-items:center;justify-content:space-between;padding:8px 14px calc(14px + env(safe-area-inset-bottom,0px));gap:10px;flex:none}' +
      '.zdl-cbtn{width:46px;height:46px;border-radius:50%;border:1px solid #e2e7e4;background:#f4f7f5;color:#1f2937;display:grid;place-items:center;cursor:pointer;flex:none;transition:background .16s ease,color .16s ease,border-color .16s ease}' +
      '.zdl-cbtn.active{background:#111827;color:#fff;border-color:#111827}' +
      '.zdl-orb{position:relative;flex:1;max-width:118px;height:54px;border-radius:99px;border:0;cursor:pointer;overflow:hidden;display:grid;place-items:center;color:#1e3a8a;background:radial-gradient(circle at 50% 115%,#4da3ff 0%,#8ec5ff 36%,#eaf4ff 72%,#ffffff 100%);box-shadow:0 6px 20px rgba(77,163,255,.32);transition:transform .2s ease,box-shadow .2s ease}' +
      '.zdl-orb:active{transform:scale(.95)}' +
      '.zdl-orb.listening{color:#065f46;background:radial-gradient(circle at 50% 115%,#16a34a 0%,#6ee7b7 44%,#ecfdf5 85%);box-shadow:0 0 0 6px rgba(22,163,74,.18),0 8px 24px rgba(22,163,74,.35);animation:zdlPulse 1.1s infinite ease-in-out}' +
      '.zdl-orb.thinking{color:#78350f;background:radial-gradient(circle at 50% 115%,#d8b66a 0%,#f6e0a5 48%,#fffbeb 88%);box-shadow:0 0 0 5px rgba(216,182,106,.22);animation:zdlPulse .8s infinite ease-in-out}' +
      '.zdl-orb.speaking{color:#1d4ed8;background:radial-gradient(circle at 50% 115%,#2563eb 0%,#60a5fa 44%,#dbeafe 85%);box-shadow:0 0 0 8px rgba(37,99,235,.18),0 8px 26px rgba(37,99,235,.38);animation:zdlWave .75s infinite alternate ease-in-out}' +
      '@keyframes zdlPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}' +
      '@keyframes zdlWave{from{transform:scale(1,.96)}to{transform:scale(1.06,1.06)}}';
    document.head.appendChild(s);
  }

  function buildUI() {
    if (document.getElementById('zdLiveOverlay')) return;
    injectStyles();

    var fab = document.createElement('button');
    fab.id = 'zdLiveFab';
    fab.type = 'button';
    fab.setAttribute('aria-label', 'Ask Zikr Deen Live Voice');
    fab.title = 'Ask Zikr Deen Live Voice';
    fab.innerHTML = ic('liveWave');
    fab.addEventListener('click', open);
    document.body.appendChild(fab);

    var ov = document.createElement('div');
    ov.id = 'zdLiveOverlay';
    ov.innerHTML =
      '<div class="zdl-sheet" role="dialog" aria-modal="true" aria-label="Ask Zikr Deen Voice Assistant">' +
        '<div class="zdl-handle"></div>' +
        '<div class="zdl-top">' +
          '<button type="button" class="zdl-ibtn" id="zdlVoiceBtn" title="Voice Settings" aria-label="Change Gemini Voice">' + ic('tune') + '</button>' +
          '<div class="zdl-pillgroup">' +
            '<button type="button" class="zdl-lang" id="zdlLangBtn" title="Change Language">हिन्दी</button>' +
            '<button type="button" class="zdl-ibtn" id="zdlMuteBtn" title="Mute / Unmute" aria-label="Toggle Speaker">' + ic('speaker') + '</button>' +
          '</div>' +
        '</div>' +
        '<div class="zdl-body">' +
          '<div>' +
            '<p class="zdl-reply-text" id="zdlReply"></p>' +
            '<div class="zdl-reply-acts">' +
              '<button type="button" class="zdl-mini" id="zdlReplayBtn" title="Listen again" aria-label="Listen again">' + ic('speaker') + '</button>' +
              '<button type="button" class="zdl-mini" id="zdlCopyBtn" title="Copy reply" aria-label="Copy reply">' + ic('copy') + '</button>' +
            '</div>' +
          '</div>' +
          '<div>' +
            '<div class="zdl-user-pill" id="zdlUserText">...</div>' +
            '<div class="zdl-status" id="zdlStatus">Bolne ke liye mic ya glowing orb par tap karein</div>' +
          '</div>' +
        '</div>' +
        '<div class="zdl-typebar" id="zdlTypebar">' +
          '<input type="text" id="zdlInput" maxlength="240" placeholder="Apna sawal yahan likhein...">' +
          '<button type="button" id="zdlSendBtn" aria-label="Send">' + ic('send') + '</button>' +
        '</div>' +
        '<div class="zdl-dock">' +
          '<button type="button" class="zdl-cbtn" id="zdlNewBtn" title="New chat" aria-label="New chat">' + ic('plus') + '</button>' +
          '<button type="button" class="zdl-cbtn" id="zdlTypeToggle" title="Type question" aria-label="Type question">' + ic('keyboard') + '</button>' +
          '<button type="button" class="zdl-orb" id="zdlOrb" aria-label="Tap to speak or stop"></button>' +
          '<button type="button" class="zdl-cbtn" id="zdlMicBtn" title="Mic on/off" aria-label="Microphone">' + ic('mic') + '</button>' +
          '<button type="button" class="zdl-cbtn" id="zdlCloseBtn" title="Close" aria-label="Close">' + ic('close') + '</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(ov);

    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    document.getElementById('zdlCloseBtn').addEventListener('click', close);
    document.getElementById('zdlOrb').addEventListener('click', onOrbTap);
    document.getElementById('zdlMicBtn').addEventListener('click', onOrbTap);

    document.getElementById('zdlVoiceBtn').addEventListener('click', function () {
      if (window.ZDVoice && typeof window.ZDVoice.openSettings === 'function') {
        window.ZDVoice.openSettings();
      } else {
        setStatus('Voice settings ke liye js/zd-voice.js load karein.');
      }
    });

    document.getElementById('zdlMuteBtn').addEventListener('click', function () {
      muted = !muted;
      this.innerHTML = muted ? ic('speakerOff') : ic('speaker');
      if (muted) stopSpeaking();
    });

    document.getElementById('zdlLangBtn').addEventListener('click', function () {
      var order = ['hi', 'ur', 'en'];
      lang = order[(order.indexOf(lang) + 1) % order.length];
      this.textContent = LANGS[lang].label;
      setStatus('Language: ' + LANGS[lang].label);
    });

    document.getElementById('zdlNewBtn').addEventListener('click', function () {
      stopAll();
      history = [];
      lastUserText = '';
      lastReply = LANGS[lang].greet;
      renderText();
      setStatus('New chat — mic par tap karein');
    });

    document.getElementById('zdlTypeToggle').addEventListener('click', function () {
      var bar = document.getElementById('zdlTypebar');
      var show = !bar.classList.contains('show');
      bar.classList.toggle('show', show);
      this.classList.toggle('active', show);
      if (show) document.getElementById('zdlInput').focus();
    });

    document.getElementById('zdlSendBtn').addEventListener('click', submitTyped);
    document.getElementById('zdlInput').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); submitTyped(); }
    });

    document.getElementById('zdlReplayBtn').addEventListener('click', function () {
      if (lastReply) speakReply(lastReply);
    });

    document.getElementById('zdlCopyBtn').addEventListener('click', function () {
      if (!lastReply) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(lastReply).then(function () {
          setStatus('Reply copied');
        }).catch(function () {});
      }
    });

    document.addEventListener('zd:voicechange', function (e) {
      if (!isOpen) return;
      if (e.detail && e.detail.speaking) setState('speaking');
      else if (state === 'speaking') setState('idle');
    });

    window.addEventListener('hashchange', function () {
      if (isOpen) close();
    });
  }

  function setStatus(msg) {
    var el = document.getElementById('zdlStatus');
    if (el) el.textContent = msg;
  }

  function setState(next) {
    state = next;
    var orb = document.getElementById('zdlOrb');
    var mic = document.getElementById('zdlMicBtn');
    if (orb) orb.className = 'zdl-orb' + (state !== 'idle' ? ' ' + state : '');
    if (mic) mic.classList.toggle('active', state === 'listening');

    if (state === 'listening') setStatus('Sun raha hoon... apna sawal bolein');
    else if (state === 'thinking') setStatus('Gemini jawab taiyaar kar raha hai...');
    else if (state === 'speaking') setStatus('Bol raha hoon... (rokne ke liye tap karein)');
    else setStatus('Bolne ke liye mic ya glowing orb par tap karein');
  }

  function renderText() {
    var r = document.getElementById('zdlReply');
    var u = document.getElementById('zdlUserText');
    if (r) r.textContent = lastReply || LANGS[lang].greet;
    if (u) u.textContent = lastUserText || (lang === 'en' ? 'Tap mic and speak...' : 'Mic par tap karein aur bolein...');
  }

  function stopListening() {
    if (rec) {
      try { rec.onend = null; rec.onerror = null; rec.onresult = null; rec.abort(); } catch (_) {}
      rec = null;
    }
  }

  function stopSpeaking() {
    if (window.ZDVoice) window.ZDVoice.stop();
    try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (_) {}
  }

  function stopAll() {
    stopListening();
    stopSpeaking();
    if (activeCtrl) { try { activeCtrl.abort(); } catch (_) {} activeCtrl = null; }
    setState('idle');
  }

  function onOrbTap() {
    if (state === 'speaking' || state === 'thinking') {
      stopAll();
      startListening();
      return;
    }
    if (state === 'listening') {
      stopListening();
      setState('idle');
      return;
    }
    startListening();
  }

  function startListening() {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      document.getElementById('zdlTypebar').classList.add('show');
      setStatus('Is device mein mic speech support nahi mila — neeche type karke poochein.');
      return;
    }

    stopAll();
    var captured = '';
    try {
      rec = new SR();
      rec.lang = LANGS[lang].bcp47;
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      rec.continuous = false;

      rec.onstart = function () { setState('listening'); };
      rec.onresult = function (e) {
        var txt = '';
        for (var i = 0; i < e.results.length; i++) {
          txt += e.results[i][0].transcript;
        }
        captured = txt.trim();
        lastUserText = captured;
        renderText();
      };
      rec.onerror = function (e) {
        stopListening();
        setState('idle');
        if (e && e.error === 'not-allowed') {
          setStatus('Microphone permission allow karein.');
        } else {
          setStatus('Awaaz saaf nahi sunai di — dobara tap karke bolein.');
        }
      };
      rec.onend = function () {
        rec = null;
        if (captured.length >= 2) {
          askGemini(captured);
        } else if (state === 'listening') {
          setState('idle');
        }
      };
      rec.start();
    } catch (_) {
      setState('idle');
      document.getElementById('zdlTypebar').classList.add('show');
      setStatus('Mic start nahi ho saka — neeche type karke poochein.');
    }
  }

  function submitTyped() {
    var inp = document.getElementById('zdlInput');
    var q = String((inp && inp.value) || '').trim();
    if (q.length < 2) return;
    inp.value = '';
    lastUserText = q;
    renderText();
    askGemini(q);
  }

  async function callGeminiModel(model, payload, signal) {
    var cfg = getCfg();
    var url = cfg.proxy || (BASE + model + ':generateContent');
    var headers = { 'content-type': 'application/json' };
    var body = cfg.proxy ? Object.assign({}, payload, { model: model }) : payload;
    if (!cfg.proxy) headers['x-goog-api-key'] = cfg.key;

    var res = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
      signal: signal
    });
    if (!res.ok) throw new Error('http_' + res.status);
    return res.json();
  }

  async function askGemini(question) {
    var cfg = getCfg();
    if (navigator.onLine === false) {
      lastReply = 'Abhi internet band hai. Online aakar dobara poochein.';
      renderText(); setState('idle'); return;
    }
    if (!cfg.proxy && !cfg.key) {
      lastReply = 'AI configure nahi hai. js/ask-config.js mein proxy ya key set karein.';
      renderText(); setState('idle'); return;
    }

    stopSpeaking();
    setState('thinking');

    history.push({ role: 'user', parts: [{ text: 'Reply in ' + LANGS[lang].name + ': ' + question }] });
    if (history.length > 8) history = history.slice(-8);

    var payload = {
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: history,
      generationConfig: { temperature: 0.4, maxOutputTokens: 320 }
    };

    activeCtrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = activeCtrl ? setTimeout(function () { activeCtrl.abort(); }, 20000) : null;

    try {
      var data = null, lastErr = null;
      for (var i = 0; i < cfg.models.length; i++) {
        try {
          data = await callGeminiModel(cfg.models[i], payload, activeCtrl ? activeCtrl.signal : undefined);
          break;
        } catch (err) {
          lastErr = err;
          if (err && err.name === 'AbortError') throw err;
        }
      }
      if (!data) throw lastErr || new Error('no_reply');

      var parts = (((data.candidates || [])[0] || {}).content || {}).parts || [];
      var reply = parts.filter(function (p) { return p.text && !p.thought; }).map(function (p) { return p.text; }).join(' ').trim();
      if (!reply) throw new Error('empty_reply');

      history.push({ role: 'model', parts: [{ text: reply }] });
      lastReply = reply;
      renderText();
      if (!muted) speakReply(reply);
      else setState('idle');
    } catch (_) {
      lastReply = 'Abhi jawab nahi mil saka. Thodi der baad dobara koshish karein.';
      renderText();
      setState('idle');
    } finally {
      if (timer) clearTimeout(timer);
      activeCtrl = null;
    }
  }

  function speakReply(text) {
    if (muted || !text) { setState('idle'); return; }
    if (window.ZDVoice && typeof window.ZDVoice.speak === 'function') {
      setState('speaking');
      window.ZDVoice.speak(text, { lang: lang, mode: 'assistant' });
    } else if (window.speechSynthesis) {
      setState('speaking');
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = LANGS[lang].bcp47;
      u.onend = function () { setState('idle'); };
      u.onerror = function () { setState('idle'); };
      window.speechSynthesis.speak(u);
    } else {
      setState('idle');
    }
  }

  function open() {
    buildUI();
    isOpen = true;
    if (!lastReply) lastReply = LANGS[lang].greet;
    renderText();
    document.getElementById('zdLiveOverlay').classList.add('open');
    if (!muted && history.length === 0) {
      speakReply(lastReply);
    }
  }

  function close() {
    isOpen = false;
    stopAll();
    var ov = document.getElementById('zdLiveOverlay');
    if (ov) ov.classList.remove('open');
  }

  window.ZDAssistant = { open: open, close: close, ask: askGemini };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildUI);
  } else {
    buildUI();
  }
})();

/* Zikr Deen App — Step 2 Main App ↔ Ask Zikr-e-Deen WhatsApp AI & Official Community Hub (#/whatsapp).
   Independent architecture: if WhatsApp backend is offline or unconfigured, the Main App keeps working 100% normally. */
(function () {
  'use strict';
  const ZD = window.ZD, $ = ZD.$, esc = ZD.esc, icon = ZD.icon, R = ZD.R;
  const CFG = window.ZD_WHATSAPP || {};
  const OVERRIDE_KEY = 'zdWaCfg_v1';
  const LINK_KEY = 'zdWaLinkState_v1';

  const isPlaceholder = v => !v || String(v).trim().indexOf('__') === 0 || String(v).includes('PASTE_');

  function getSavedOverrides() {
    try { return JSON.parse(localStorage.getItem(OVERRIDE_KEY) || '{}') || {}; } catch (_) { return {}; }
  }
  function saveOverrides(obj) {
    try { localStorage.setItem(OVERRIDE_KEY, JSON.stringify(obj)); } catch (_) {}
  }
  function getLinkState() {
    try { return JSON.parse(localStorage.getItem(LINK_KEY) || '{}') || {}; } catch (_) { return {}; }
  }
  function saveLinkState(obj) {
    try { localStorage.setItem(LINK_KEY, JSON.stringify(obj)); } catch (_) {}
  }

  function getConfig() {
    const ov = getSavedOverrides();
    const rawNum = !isPlaceholder(ov.assistantNumber)
      ? ov.assistantNumber
      : (!isPlaceholder(CFG.assistantNumber) ? CFG.assistantNumber : '');
    const phone = String(rawNum || '').replace(/\D/g, '');

    const rawInvite = !isPlaceholder(ov.communityInviteUrl)
      ? ov.communityInviteUrl
      : (!isPlaceholder(CFG.communityInviteUrl) ? CFG.communityInviteUrl : '');
    const inviteUrl = /^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9_-]+$/.test(rawInvite) ? rawInvite : '';

    const rawPage = !isPlaceholder(ov.communityPageUrl)
      ? ov.communityPageUrl
      : (!isPlaceholder(CFG.communityPageUrl) ? CFG.communityPageUrl : '');
    const pageUrl = /^https:\/\/[^\s]+$/.test(rawPage) ? rawPage : '';

    return {
      phone: phone.length >= 10 && phone.length <= 15 ? phone : '',
      inviteUrl,
      pageUrl,
      welcome: String(CFG.defaultWelcomeText || 'MENU')
    };
  }

  function waChatUrl(phone, text) {
    return 'https://wa.me/' + phone + '?text=' + encodeURIComponent(String(text || 'MENU'));
  }

  function openExternal(url) {
    if (!url) {
      ZD.toast('पहले सेटअप में ऑफ़िशियल नंबर या लिंक सेट करें');
      return;
    }
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (_) {
      location.href = url;
    }
  }

  function buildProgressShareText() {
    const st = ZD.state ? ZD.state() : {};
    const done = ZD.todayCount ? ZD.todayCount() : 0;
    const goal = (ZD.prefs && ZD.prefs().goal) || 10;
    const mulkSt = (st.mulk && st.mulk.status) || {};
    const mem = Object.values(mulkSt).filter(v => v === 'memorised').length;
    const last = st.last && ZD.surah ? ZD.surah(st.last.s) : null;
    const lastStr = last ? (last.en + ' (Ayah ' + st.last.a + ')') : 'Al-Fatihah';
    return (
      'Assalamu alaikum Ask Zikr-e-Deen! Yeh meri Zikr Deen App progress hai:\n' +
      '• Aaj ki tilawat: ' + done + ' / ' + goal + ' ayat\n' +
      '• Surah Al-Mulk memorised: ' + mem + ' / 30 ayat\n' +
      '• Last Read: ' + lastStr + '\n' +
      'Kripya mujhe aaj ka 5-minute revision plan aur 1 quiz dein.'
    );
  }

  /* ---------- Compact Home Card (2 Required Buttons: WhatsApp AI + Join Community) ---------- */
  ZD.whatsappCardHTML = function () {
    const c = getConfig();
    const aiHref = c.phone ? waChatUrl(c.phone, c.welcome) : '#/whatsapp';
    const commHref = c.inviteUrl || c.pageUrl || '#/whatsapp';
    const aiTarget = c.phone ? ' target="_blank" rel="noopener noreferrer"' : '';
    const commTarget = (c.inviteUrl || c.pageUrl) ? ' target="_blank" rel="noopener noreferrer"' : '';
    return (
      '<section class="block card" style="padding:14px 16px">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px">' +
          '<div>' +
            '<div style="font-size:16px;font-weight:700;color:var(--ink)">Ask Zikr-e-Deen · WhatsApp</div>' +
            '<div class="muted small">WhatsApp AI असिस्टेंट व ऑफ़िशियल लर्निंग कम्युनिटी</div>' +
          '</div>' +
          '<a class="btn sm ghost" href="#/whatsapp">विवरण</a>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' +
          '<a class="btn sm" style="text-align:center;justify-content:center" href="' + esc(aiHref) + '"' + aiTarget + '>✦ WhatsApp AI</a>' +
          '<a class="btn sm ghost" style="text-align:center;justify-content:center" href="' + esc(commHref) + '"' + commTarget + '>🟢 Community</a>' +
        '</div>' +
      '</section>'
    );
  };

  /* ---------- Dedicated Route: #/whatsapp ---------- */
  R.whatsapp = function () {
    const view = () => $('#view');
    const top = (title, sub) =>
      '<header class="topbar"><button class="ibtn" data-act="back" aria-label="Back">' +
      icon('back') + '</button><h1>' + esc(title) +
      (sub ? '<span class="sub">' + esc(sub) + '</span>' : '') + '</h1></header>';

    function draw() {
      const c = getConfig();
      const ls = getLinkState();
      const hasPhone = Boolean(c.phone);
      const hasComm = Boolean(c.inviteUrl || c.pageUrl);
      const commLink = c.inviteUrl || c.pageUrl;

      const quickCmds = [
        ['MENU', '📋 मुख्य मेन्यू'],
        ['SILSILA', '📚 इस्लामी सिलसिला'],
        ['quran 67:1', '📖 सूरह अल-मुल्क'],
        ['ROOT ilm', '🌳 अरबी रूट-ट्री'],
        ['FEYNMAN', '🎓 Feynman मोड'],
        ['MATH', '🧮 मैथ्स ड्रिल'],
        ['ETHICS', '⚖️ Ethics चुनौती']
      ];

      view().innerHTML =
        top('Ask Zikr-e-Deen WhatsApp', 'AI असिस्टेंट · कम्युनिटी · अकाउंट लिंक') +
        '<main id="waHubRoot">' +

        /* 1. WhatsApp AI Assistant Card */
        '<section class="block card">' +
          '<img class="zd-hero-banner" src="./img/visuals/banner-explorer.webp" alt="Ask Zikr-e-Deen Global Explorer" loading="lazy">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px">' +
            '<h2 class="h2" style="margin:0">✦ Ask Zikr-e-Deen WhatsApp AI</h2>' +
            '<span class="muted small" style="font-weight:700">' + (hasPhone ? '🟢 सक्रिय' : '⚙️ सेटअप बाकी') + '</span>' +
          '</div>' +
          '<p class="muted small" style="margin:8px 0 12px">सीधे WhatsApp पर प्रमाणित क़ुरआन/हदीस लर्निंग, इस्लामी सिलसिला पाठ, Arabic Root-Tree, Feynman सिखाकर-सीखो मोड, वेरिफाइड मैथ्स/साइंस क्विज़, वॉइस नोट उत्तर और बच्चों के लिए Family Safe मोड पाएं।</p>' +
          '<div style="display:flex;flex-direction:column;gap:8px">' +
            (hasPhone
              ? '<a class="btn" style="text-align:center;justify-content:center" href="' + esc(waChatUrl(c.phone, c.welcome)) + '" target="_blank" rel="noopener noreferrer">✦ WhatsApp AI चैट शुरू करें (MENU)</a>'
              : '<button class="btn" type="button" id="waNeedNum">✦ WhatsApp AI नंबर सेट करें</button>') +
            '<button class="btn ghost" type="button" id="waShareProg">📊 अपनी ऐप प्रगति WhatsApp AI को भेजें</button>' +
          '</div>' +
          (hasPhone
            ? '<div style="margin-top:12px"><div class="muted small" style="margin-bottom:6px">क्विक स्टार्ट कमांड्स:</div>' +
              '<div style="display:flex;flex-wrap:wrap;gap:6px">' +
              quickCmds.map(q =>
                '<a class="btn sm ghost" href="' + esc(waChatUrl(c.phone, q[0])) + '" target="_blank" rel="noopener noreferrer">' + esc(q[1]) + '</a>'
              ).join('') +
              '</div></div>'
            : '') +
        '</section>' +

        /* 2. Join Official WhatsApp Community Card + Guidelines */
        '<section class="block card">' +
          '<img class="zd-hero-banner" src="./img/visuals/banner-community.webp" alt="Zikr Deen Official WhatsApp Community" loading="lazy">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px">' +
            '<h2 class="h2" style="margin:0">🟢 Official WhatsApp Community</h2>' +
            '<span class="muted small" style="font-weight:700">' + (hasComm ? '🟢 तैयार' : '⚙️ सेटअप बाकी') + '</span>' +
          '</div>' +
          '<p class="muted small" style="margin:8px 0 12px">साप्ताहिक क्विज़, क़ुरआन/नमाज़ रिवीज़न और आधिकारिक ऐप अपडेट्स के लिए स्वेच्छा से जुड़ें। किसी को भी बिना अनुमति ऐड नहीं किया जाता।</p>' +
          (hasComm
            ? '<a class="btn" style="width:100%;text-align:center;justify-content:center" href="' + esc(commLink) + '" target="_blank" rel="noopener noreferrer">🟢 Join WhatsApp Community</a>'
            : '<button class="btn ghost" type="button" id="waNeedComm" style="width:100%">कम्युनिटी लिंक सेट करें</button>') +
          '<div style="margin-top:12px;padding-top:10px;border-top:1px solid var(--line)">' +
            '<div style="font-weight:700;font-size:13px;margin-bottom:6px">कम्युनिटी नियम (Guidelines):</div>' +
            '<ul class="muted small" style="margin:0;padding-left:18px;line-height:1.65">' +
              '<li>अदब और सम्मान बनाए रखें — अपमान, स्पैम या फ़िरक़ावार बहस सख़्त मना है।</li>' +
              '<li>बिना प्रमाणित स्रोत के कोई धार्मिक दावा फ़ॉरवर्ड न करें।</li>' +
              '<li>दूसरों का फ़ोन नंबर या निजी जानकारी शेयर न करें।</li>' +
              '<li>AI के उत्तर शैक्षिक हैं, बाध्यकारी फ़तवा नहीं — जटिल मामलों में प्रमाणित आलिम से पूछें।</li>' +
            '</ul>' +
          '</div>' +
        '</section>' +

        /* 3. Optional Short-Lived Token Account Linking */
        '<section class="block card">' +
          '<h2 class="h2" style="margin:0 0 6px">🔗 वैकल्पिक अकाउंट लिंकिंग (सुरक्षित टोकन)</h2>' +
          '<p class="muted small" style="margin:0 0 10px">अपनी सहमति से 10-मिनट का सिंगल-यूज़ लिंकिंग कोड (जैसे <b>ZD-7K9M-2P4X</b>) यहाँ डालें और WhatsApp पर कन्फ़र्म करें। कोई पासवर्ड शेयर नहीं होता और आप कभी भी <b>UNLINK</b> कर सकते हैं।</p>' +
          '<div style="display:flex;gap:8px;align-items:center">' +
            '<input id="waLinkCode" type="text" placeholder="ZD-XXXX-XXXX" maxlength="14" value="' + esc(ls.lastCode || '') + '" style="flex:1;padding:10px 12px;border-radius:12px;border:1px solid var(--line);background:var(--bg2);color:var(--ink);font-family:monospace;text-transform:uppercase">' +
            '<button class="btn sm" type="button" id="waLinkGo">लिंक करें</button>' +
          '</div>' +
          '<div class="muted small" style="margin-top:8px">प्राइवेसी वादा: WhatsApp पर कभी भी <b>STOP</b> लिखकर ऑटो-रिप्लाई रोकें या <b>DELETE MY DATA</b> भेजकर डेटा हटाएं।</div>' +
        '</section>' +

        /* 4. Optional Local Configuration (for Owner / Testing before GitHub Secret bake) */
        '<section class="block card">' +
          '<details>' +
            '<summary style="cursor:pointer;font-weight:700;font-size:14px">⚙️ कनेक्शन सेटिंग्स (टेस्टिंग / ओनर के लिए)</summary>' +
            '<p class="muted small" style="margin:8px 0">यहाँ केवल पब्लिक WhatsApp नंबर और कम्युनिटी लिंक सेव होते हैं (कोई सीक्रेट की नहीं)।</p>' +
            '<div style="display:grid;gap:8px;margin-top:8px">' +
              '<input id="waCfgNum" type="tel" placeholder="अंतर्राष्ट्रीय नंबर (उदा. 9198XXXXXXXX)" value="' + esc(c.phone) + '" style="padding:9px 12px;border-radius:10px;border:1px solid var(--line);background:var(--bg2);color:var(--ink)">' +
              '<input id="waCfgInvite" type="url" placeholder="https://chat.whatsapp.com/..." value="' + esc(c.inviteUrl) + '" style="padding:9px 12px;border-radius:10px;border:1px solid var(--line);background:var(--bg2);color:var(--ink)">' +
              '<input id="waCfgPage" type="url" placeholder="https://your-wa-site.netlify.app/community.html" value="' + esc(c.pageUrl) + '" style="padding:9px 12px;border-radius:10px;border:1px solid var(--line);background:var(--bg2);color:var(--ink)">' +
              '<div style="display:flex;gap:8px">' +
                '<button class="btn sm" type="button" id="waCfgSave">सेव करें</button>' +
                '<button class="btn sm ghost" type="button" id="waCfgReset">रीसेट</button>' +
              '</div>' +
            '</div>' +
          '</details>' +
        '</section>' +

        '</main>';

      const needNum = $('#waNeedNum');
      if (needNum) needNum.addEventListener('click', () => {
        const det = view().querySelector('details');
        if (det) { det.open = true; det.scrollIntoView({ behavior: 'smooth' }); }
        ZD.toast('नीचे कनेक्शन सेटिंग्स में ऑफ़िशियल WhatsApp नंबर डालें');
      });

      const needComm = $('#waNeedComm');
      if (needComm) needComm.addEventListener('click', () => {
        const det = view().querySelector('details');
        if (det) { det.open = true; det.scrollIntoView({ behavior: 'smooth' }); }
        ZD.toast('नीचे कनेक्शन सेटिंग्स में Community इनवाइट लिंक डालें');
      });

      $('#waShareProg').addEventListener('click', () => {
        const cfg = getConfig();
        if (!cfg.phone) {
          ZD.toast('पहले ऑफ़िशियल WhatsApp AI नंबर सेट करें');
          return;
        }
        openExternal(waChatUrl(cfg.phone, buildProgressShareText()));
      });

      $('#waLinkGo').addEventListener('click', () => {
        const cfg = getConfig();
        const raw = String($('#waLinkCode').value || '').trim().toUpperCase();
        if (!/^ZD-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(raw)) {
          ZD.toast('सही कोड फ़ॉर्मेट डालें (उदा. ZD-7K9M-2P4X)');
          return;
        }
        if (!cfg.phone) {
          ZD.toast('पहले ऑफ़िशियल WhatsApp AI नंबर सेट करें');
          return;
        }
        saveLinkState({ lastCode: raw, updatedAt: new Date().toISOString() });
        openExternal(waChatUrl(cfg.phone, 'LINK ' + raw));
      });

      $('#waCfgSave').addEventListener('click', () => {
        const num = String($('#waCfgNum').value || '').replace(/\D/g, '');
        const inv = String($('#waCfgInvite').value || '').trim();
        const pg = String($('#waCfgPage').value || '').trim();
        if (num && (num.length < 10 || num.length > 15)) {
          ZD.toast('अंतर्राष्ट्रीय नंबर 10–15 अंकों का होना चाहिए (उदा. 9198XXXXXXXX)');
          return;
        }
        if (inv && !/^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9_-]+$/.test(inv)) {
          ZD.toast('मान्य WhatsApp Community इनवाइट लिंक डालें (https://chat.whatsapp.com/...)');
          return;
        }
        saveOverrides({ assistantNumber: num, communityInviteUrl: inv, communityPageUrl: pg });
        ZD.toast('WhatsApp कनेक्शन सेटिंग्स सेव हो गईं');
        draw();
      });

      $('#waCfgReset').addEventListener('click', () => {
        saveOverrides({});
        ZD.toast('डिफ़ॉल्ट सेटिंग्स बहाल हो गईं');
        draw();
      });
    }

    draw();
  };

  /* ---------- More Page: clean WhatsApp AI & Community Card ---------- */
  const oldMore = R.more;
  if (oldMore) {
    R.more = async function () {
      await oldMore.apply(this, arguments);
      const root = $('#moreRoot');
      if (!root) return;
      const s = document.createElement('section');
      s.className = 'block card';
      s.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px">' +
          '<div><h2 class="h2" style="margin:0">WhatsApp AI &amp; Community</h2>' +
          '<p class="muted small" style="margin:4px 0 0">Ask Zikr-e-Deen WhatsApp असिस्टेंट, कम्युनिटी और अकाउंट लिंकिंग</p></div>' +
          '<a class="btn sm" href="#/whatsapp">खोलें</a>' +
        '</div>';
      const firstCard = root.firstChild;
      if (firstCard && firstCard.nextSibling) root.insertBefore(s, firstCard.nextSibling);
      else root.appendChild(s);
    };
  }
})();

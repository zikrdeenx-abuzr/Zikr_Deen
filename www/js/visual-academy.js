/* Zikr Deen App — v43 Global Visual Academy (#/visual-academy)
   Offline-first interactive showcase using crisp WebP visuals:
   1. Arabic Root-Tree Explorer (banner-root-tree.webp)
   2. Science & Islamic Golden Age Bridge (banner-optics, banner-algebra, banner-astrolabe, banner-project)
   3. Interactive Ethics Dilemma Simulator (banner-ethics-truth, banner-ethics-justice)
   4. Global Explorer & Family-Friendly Safe Mode (banner-explorer, banner-family)
*/
(function () {
  'use strict';
  const ZD = window.ZD, $ = ZD.$, esc = ZD.esc, icon = ZD.icon, R = ZD.R;
  const STAT_KEY = 'zdVaStats_v1';

  function bumpStat(k) {
    try {
      const s = JSON.parse(localStorage.getItem(STAT_KEY) || '{}') || {};
      s[k] = (s[k] || 0) + 1;
      localStorage.setItem(STAT_KEY, JSON.stringify(s));
    } catch (_) {}
  }

  const ROOTS = [
    {
      key: 'ilm', root: 'ع - ل - م', roman: 'Ilm (ज्ञान)',
      meaning: 'जानना, समझना और पहचानना',
      words: [
        ['عِلْم', 'Ilm', 'ज्ञान / विज्ञान'],
        ['عَالِم', 'Aalim', 'विद्वान'],
        ['تَعْلِيم', 'Ta\'leem', 'शिक्षा'],
        ['مُعَلِّم', 'Mu\'allim', 'शिक्षक'],
        ['عَالَم', 'Aalam', 'संसार / ब्रह्मांड']
      ]
    },
    {
      key: 'sabr', root: 'ص - ب - ر', roman: 'Sabr (धैर्य)',
      meaning: 'धैर्य रखना, संयम और दृढ़ता',
      words: [
        ['صَبْر', 'Sabr', 'धैर्य / संयम'],
        ['صَابِر', 'Saabir', 'धैर्यवान व्यक्ति'],
        ['اصْطِبَار', 'Istibaar', 'निरंतर दृढ़ता'],
        ['مُصَابَرَة', 'Musaabarah', 'सामूहिक साहस']
      ]
    },
    {
      key: 'rahmah', root: 'ر - ح - م', roman: 'Rahmah (करुणा)',
      meaning: 'दया, करुणा और कोमलता',
      words: [
        ['رَحْمَة', 'Rahmah', 'दया / करुणा'],
        ['رَحْمَٰن', 'Rahman', 'अत्यंत दयालु'],
        ['رَحِيم', 'Raheem', 'निरंतर कृपा करने वाला'],
        ['رَحِم', 'Rahim', 'रिश्तेदारी का बंधन']
      ]
    },
    {
      key: 'salam', root: 'س - ل - م', roman: 'Salam (शांति)',
      meaning: 'शांति, सुरक्षा और निर्मलता',
      words: [
        ['سَلَام', 'Salaam', 'शांति / सलामती'],
        ['إِسْلَام', 'Islam', 'शांति व समर्पण'],
        ['سَلِيم', 'Saleem', 'शुद्ध व निर्मल (क़ल्ब-ए-सलीम)']
      ]
    },
    {
      key: 'adl', root: 'ع - د - ل', roman: 'Adl (न्याय)',
      meaning: 'न्याय, इंसाफ़ और संतुलन',
      words: [
        ['عَدْل', 'Adl', 'न्याय / समानता'],
        ['عَادِل', 'Aadil', 'न्यायप्रिय व्यक्ति'],
        ['اعْتِدَال', 'I\'tidaal', 'संतुलित मध्यम मार्ग']
      ]
    }
  ];

  const SCIENCE_CARDS = [
    {
      img: './img/visuals/banner-optics.webp',
      tag: 'प्रकाशिकी व वैज्ञानिक पद्धति',
      title: 'इब्न अल-हैथम और प्रकाश का विज्ञान',
      desc: 'किताब अल-मनाज़िर (Book of Optics) में इब्न अल-हैथम ने प्रयोग-आधारित जाँच से सिद्ध किया कि दृष्टि तब होती है जब प्रकाश वस्तुओं से टकराकर आँख में प्रवेश करता है—यही आधुनिक कैमरों और वैज्ञानिक पद्धति की नींव है।',
      cta: '🧠 Brain Master खोलें',
      href: './quiz/brain-master.html'
    },
    {
      img: './img/visuals/banner-algebra.webp',
      tag: 'बीजगणित (अल-जबर) व अल्गोरिद्म',
      title: 'अल-ख़्वारिज़्मी से आधुनिक AI तक',
      desc: '9वीं सदी में अल-ख़्वारिज़्मी ने बीजगणित (Algebra) को व्यवस्थित किया और उनके नाम से "Algorithm" शब्द बना—आज हर मोबाइल ऐप, गणित सॉल्वर और AI सिस्टम उन्हीं चरणबद्ध सिद्धांतों पर चलता है।',
      cta: '🔬 3D Visual Studio देखें',
      href: './quiz/visual-studio.html'
    },
    {
      img: './img/visuals/banner-astrolabe.webp',
      tag: 'खगोल विज्ञान व समय गणना',
      title: 'एस्ट्रोलेब और तारों का मानचित्र',
      desc: 'बैत-उल-हिकमा के खगोलविदों ने एस्ट्रोलेब से दिशा, अक्षांश और नमाज़ के सटीक समय की गणना को नई ऊँचाई दी। आप ऐप में लाइव AR क़िबला और नॉलेज स्टार मैप देख सकते हैं।',
      cta: '🌌 Knowledge Star Map',
      href: '#/knowledge-map'
    },
    {
      img: './img/visuals/banner-project.webp',
      tag: 'स्टूडेंट्स के लिए मेंटरशिप',
      title: 'AI और Science Project Mentor',
      desc: 'स्कूल या कॉलेज के साइंस/AI प्रोजेक्ट के लिए अनोखे आइडिया, सामान की लिस्ट, वर्किंग मॉडल और वाइवा के सवाल-जवाब सीधे Ask Zikr-e-Deen AI या WhatsApp AI से तैयार करें।',
      cta: '✦ Ask AI से प्रोजेक्ट पूछें',
      href: '#/ask'
    }
  ];

  const ETHICS_CARDS = [
    {
      id: 'truth',
      img: './img/visuals/banner-ethics-truth.webp',
      title: 'सत्य और फ़ैक्ट-चेकिंग (स्रोत सत्यापन)',
      situation: 'फ़ैमिली ग्रुप में बिना किसी प्रमाणित स्रोत के एक चौंकाने वाला धार्मिक/सामाजिक मैसेज आया है जिस पर लिखा है “10 लोगों को भेजें”। आप क्या करेंगे?',
      options: [
        ['तुरंत सबको फ़ॉरवर्ड करें', '⚠️ बिना सत्यापन जानकारी फैलाना अफ़वाह बढ़ाता है। इस्लामी शिक्षा और डिजिटल साक्षरता दोनों तथ्यों की पुष्टि (तबय्युन) का निर्देश देते हैं।'],
        ['पहले प्रमाणित स्रोत जांचें', '✅ उत्कृष्ट फ़ैसला! प्रमाणित स्रोत जांचना सच्चे ज्ञान और अमानत की पहचान है। अपुष्ट संदेश को आगे न बढ़ाएं।'],
        ['चुपचाप डिलीट कर दें', '👍 सुरक्षित कदम! आपने अफ़वाह को रोका। मौका मिले तो विनम्रता से ग्रुप को भी फ़ैक्ट-चेकिंग की आदत बताएं।']
      ]
    },
    {
      id: 'justice',
      img: './img/visuals/banner-ethics-justice.webp',
      title: 'न्याय, अमानत और ईमानदारी',
      situation: 'आप अपना पुराना फ़ोन बेच रहे हैं जिसकी बैटरी जल्दी उतरती है, लेकिन खरीदार ने इस बारे में नहीं पूछा। आप क्या चुनेंगे?',
      options: [
        ['चुप रहें और बेच दें', '⚠️ जानबूझकर दोष छिपाना ग्राहक का भरोसा तोड़ता है और व्यापार की नैतिकता व बरकत के विरुद्ध है।'],
        ['बैटरी की स्थिति साफ़ बताएं', '✅ बेहतरीन ईमानदारी! साफ़गोई से अटूट विश्वास बनता है और न्याय (अद्ल) व अमानत का हक़ अदा होता है।'],
        ['दाम बढ़ाकर डिस्काउंट दिखाएं', '⚠️ दिखावटी रणनीति से कहीं बड़ा मूल्य पारदर्शिता है। सही तथ्य बताकर उचित मूल्य तय करना ही सर्वोत्तम है।']
      ]
    }
  ];

  R['visual-academy'] = function () {
    const view = () => $('#view');
    const top = (t, sub) =>
      '<header class="topbar"><button class="ibtn" data-act="back" aria-label="Back">' +
      icon('back') + '</button><h1>' + esc(t) +
      (sub ? '<span class="sub">' + esc(sub) + '</span>' : '') + '</h1></header>';

    let tab = 'science';
    let rootIdx = 0;
    const ethicsAnswers = {};

    function draw() {
      let body = '';

      if (tab === 'science') {
        bumpStat('science');
        body = SCIENCE_CARDS.map(c =>
          '<section class="block card">' +
            '<img class="zd-hero-banner" src="' + c.img + '" alt="' + esc(c.title) + '" loading="lazy">' +
            '<div class="muted small" style="font-weight:700;color:var(--gold)">' + esc(c.tag) + '</div>' +
            '<h2 class="h2" style="margin:4px 0 6px">' + esc(c.title) + '</h2>' +
            '<p class="muted small" style="margin:0 0 12px;line-height:1.6">' + esc(c.desc) + '</p>' +
            '<a class="btn sm" href="' + esc(c.href) + '">' + esc(c.cta) + '</a>' +
          '</section>'
        ).join('');
      } else if (tab === 'roots') {
        bumpStat('roots');
        const cur = ROOTS[rootIdx];
        body =
          '<section class="block card">' +
            '<img class="zd-hero-banner" src="./img/visuals/banner-root-tree.webp" alt="Arabic Root Tree" loading="lazy">' +
            '<h2 class="h2" style="margin:0 0 4px">🌳 Arabic Root-Tree Explorer</h2>' +
            '<p class="muted small" style="margin:0 0 8px">एक ही 3-अक्षर अरबी जड़ से कई क़ुरआनी शब्द बनते हैं। नीचे किसी जड़ पर टैप करें:</p>' +
            '<div class="va-root-chips">' +
              ROOTS.map((r, i) =>
                '<button type="button" class="va-root-chip' + (i === rootIdx ? ' on' : '') + '" data-ridx="' + i + '">' + esc(r.root) + ' · ' + esc(r.key) + '</button>'
              ).join('') +
            '</div>' +
            '<div style="padding:10px 12px;border-radius:12px;background:var(--bg2);border:1px solid var(--line);margin-top:8px">' +
              '<div style="font-weight:700;font-size:15px">' + esc(cur.root) + ' — ' + esc(cur.roman) + '</div>' +
              '<div class="muted small">मूल भाव: ' + esc(cur.meaning) + '</div>' +
            '</div>' +
            '<div class="va-branch-list">' +
              cur.words.map(w =>
                '<div class="va-branch" data-glow="1"><div><b>' + esc(w[1]) + '</b><div class="muted small">' + esc(w[2]) + '</div></div><div class="arn" lang="ar" style="font-size:24px;color:var(--gold)">' + esc(w[0]) + '</div></div>'
              ).join('') +
            '</div>' +
          '</section>';
      } else if (tab === 'ethics') {
        body = ETHICS_CARDS.map(e => {
          const picked = ethicsAnswers[e.id];
          return '<section class="block card">' +
            '<img class="zd-hero-banner" src="' + e.img + '" alt="' + esc(e.title) + '" loading="lazy">' +
            '<h2 class="h2" style="margin:0 0 6px">⚖️ ' + esc(e.title) + '</h2>' +
            '<p class="small" style="margin:0 0 12px;line-height:1.6">' + esc(e.situation) + '</p>' +
            '<div style="display:grid;gap:8px">' +
              e.options.map((op, oi) =>
                '<button type="button" class="va-opt-btn" data-eth="' + e.id + '" data-oi="' + oi + '" data-glow="1">' +
                (picked === oi ? '● ' : '○ ') + esc(op[0]) + '</button>'
              ).join('') +
            '</div>' +
            (picked !== undefined
              ? '<div class="va-outcome">' + esc(e.options[picked][1]) + '</div>'
              : '') +
          '</section>';
        }).join('');
      } else {
        body =
          '<section class="block card">' +
            '<img class="zd-hero-banner" src="./img/visuals/banner-explorer.webp" alt="Global Explorer" loading="lazy">' +
            '<h2 class="h2" style="margin:0 0 6px">🌍 Global Explorer &amp; Glass-Box Trust</h2>' +
            '<p class="muted small" style="margin:0 0 12px;line-height:1.6">दुनिया भर के छात्रों और जिज्ञासु पाठकों के लिए शांत, विज्ञापन-मुक्त और प्रमाणित स्रोत-आधारित शिक्षा। WhatsApp AI पर <b>MODE EXPLORER</b> और <b>FEYNMAN</b> मोड के ज़रिए किसी भी भाषा में गहराई से सीखें।</p>' +
            '<a class="btn sm" href="#/whatsapp">✦ WhatsApp AI हब खोलें</a>' +
          '</section>' +
          '<section class="block card">' +
            '<img class="zd-hero-banner" src="./img/visuals/banner-family.webp" alt="Family Safe Learning" loading="lazy">' +
            '<h2 class="h2" style="margin:0 0 6px">🧸 Family-Friendly &amp; Kids Safe Mode</h2>' +
            '<p class="muted small" style="margin:0 0 12px;line-height:1.6">बच्चों और परिवार के लिए सरल भाषा, नैतिक कहानियाँ, आसान क्विज़ और न्यूनतम डेटा संग्रह (कोई अनावश्यक ट्रैकिंग नहीं)। WhatsApp AI में <b>FAMILY ON</b> लिखकर तुरंत चालू करें।</p>' +
            '<a class="btn sm ghost" href="#/progress">🏆 3D मास्टरी बैजेज़ देखें</a>' +
          '</section>';
      }

      view().innerHTML =
        top('Global Visual Academy', 'इस्लाम · विज्ञान · अरबी रूट-ट्री · Ethics') +
        '<main id="vaRoot">' +
          '<div class="va-tabs">' +
            '<button type="button" class="va-tab' + (tab === 'science' ? ' on' : '') + '" data-vatab="science">🔬 साइंस ब्रिज</button>' +
            '<button type="button" class="va-tab' + (tab === 'roots' ? ' on' : '') + '" data-vatab="roots">🌳 अरबी रूट-ट्री</button>' +
            '<button type="button" class="va-tab' + (tab === 'ethics' ? ' on' : '') + '" data-vatab="ethics">⚖️ Ethics लैब</button>' +
            '<button type="button" class="va-tab' + (tab === 'global' ? ' on' : '') + '" data-vatab="global">🌍 ग्लोबल व फैमिली</button>' +
          '</div>' +
          body +
        '</main>';

      $('#vaRoot').addEventListener('click', e => {
        const tb = e.target.closest('[data-vatab]');
        if (tb) { tab = tb.dataset.vatab; draw(); return; }
        const rb = e.target.closest('[data-ridx]');
        if (rb) { rootIdx = Number(rb.dataset.ridx) || 0; draw(); return; }
        const eb = e.target.closest('[data-eth]');
        if (eb) {
          ethicsAnswers[eb.dataset.eth] = Number(eb.dataset.oi);
          bumpStat('ethics');
          draw();
        }
      });
    }

    draw();
  };
})();

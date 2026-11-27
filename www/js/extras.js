(function () {
  'use strict';
  const ZD = window.ZD, $ = ZD.$, esc = ZD.esc, icon = ZD.icon, R = ZD.R;
  const top = (title, sub) => '<header class="topbar"><button type="button" class="ibtn" data-act="back" aria-label="Back">' + icon('back') + '</button><h1>' + esc(title) + (sub ? '<span class="sub">' + esc(sub) + '</span>' : '') + '</h1></header>';

  ZD.quickBarHTML = function () {
    const items = [
      ['#/surahs', '📖', 'Quran', 'क़ुरआन'],
      ['#/zakat', '💰', 'Zakat', 'ज़कात'],
      ['#/tasbih', '📿', 'Zikr', 'तस्बीह'],
      ['#/ruqiyah', '🛡️', 'Ruqiyah', 'रुक़याह'],
      ['#/azkaar', '🤲', 'Dua', 'दुआएँ'],
      ['#/progress', '📊', 'Progress', 'मास्टरी']
    ];
    return '<section class="block"><div class="qa-bar">' +
      items.map(x => '<a class="qa-it" href="' + x[0] + '"><span class="qa-ico">' + x[1] + '</span><b>' + x[2] + '</b><small>' + x[3] + '</small></a>').join('') +
      '</div></section>';
  };

  const ZKEY = 'zdZakatV2';
  const ZKEY_OLD = 'zdZakatV1';
  const TOLA_G = 11.664;
  const NISAB_SILVER_G = 612.36;
  const NISAB_GOLD_G = 87.48;
  const ZAKAT_RATE = 0.025;

  function defaultZ() {
    return {
      tab: 'calc',
      mode: 'quick',
      std: 'silver',
      metalUnit: 'gram',
      hawl: true,
      goldRate: 8200,
      silverRate: 98,
      quickTotal: 0,
      quickDebt: 0,
      cash: 0,
      goldQty: 0,
      silverQty: 0,
      invest: 0,
      business: 0,
      other: 0,
      debt: 0,
      fitraMembers: 1,
      fitraRate: 100
    };
  }

  function loadZ() {
    const def = defaultZ();
    try {
      const raw = localStorage.getItem(ZKEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') return Object.assign(def, parsed);
      }
      const oldRaw = localStorage.getItem(ZKEY_OLD);
      if (oldRaw) {
        const o = JSON.parse(oldRaw);
        if (o && typeof o === 'object') {
          return Object.assign(def, {
            std: o.std === 'gold' ? 'gold' : 'silver',
            goldRate: Number(o.goldRate) > 0 ? Number(o.goldRate) : def.goldRate,
            silverRate: Number(o.silverRate) > 0 ? Number(o.silverRate) : def.silverRate,
            cash: Number(o.cash) || 0,
            goldQty: Number(o.goldG) || 0,
            silverQty: Number(o.silverG) || 0,
            invest: Number(o.invest) || 0,
            business: Number(o.business) || 0,
            other: Number(o.other) || 0,
            debt: Number(o.debt) || 0
          });
        }
      }
    } catch (_) {}
    return def;
  }

  function saveZ(d) {
    try {
      localStorage.setItem(ZKEY, JSON.stringify(d));
    } catch (_) {}
  }

  const numVal = v => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : 0;
  };
  const fmtINR = n => '₹' + Math.round(Math.max(0, Number(n) || 0)).toLocaleString('en-IN');
  const fmtDec = n => (Math.round((Number(n) || 0) * 100) / 100).toLocaleString('en-IN');

  function computeZakat(st) {
    const goldRate = numVal(st.goldRate);
    const silverRate = numVal(st.silverRate);
    const nisab = st.std === 'gold' ? (NISAB_GOLD_G * goldRate) : (NISAB_SILVER_G * silverRate);
    let totalAssets = 0;
    let debt = 0;
    let goldVal = 0;
    let silverVal = 0;
    let goldGrams = 0;
    let silverGrams = 0;

    if (st.mode === 'quick') {
      totalAssets = numVal(st.quickTotal);
      debt = numVal(st.quickDebt);
    } else {
      const unitMul = st.metalUnit === 'tola' ? TOLA_G : 1;
      goldGrams = numVal(st.goldQty) * unitMul;
      silverGrams = numVal(st.silverQty) * unitMul;
      goldVal = goldGrams * goldRate;
      silverVal = silverGrams * silverRate;
      totalAssets = numVal(st.cash) + goldVal + silverVal + numVal(st.invest) + numVal(st.business) + numVal(st.other);
      debt = numVal(st.debt);
    }

    const netWealth = Math.max(0, totalAssets - debt);
    const meetsNisab = nisab > 0 && netWealth >= nisab;
    const hawlOk = st.hawl !== false;
    const due = meetsNisab && hawlOk;
    const projectedZakat = meetsNisab ? (netWealth * ZAKAT_RATE) : 0;
    const zakatAmt = due ? projectedZakat : 0;
    const shortBy = nisab > netWealth ? (nisab - netWealth) : 0;
    const monthlyEst = zakatAmt > 0 ? (zakatAmt / 12) : 0;

    return {
      goldRate,
      silverRate,
      nisab,
      totalAssets,
      debt,
      goldVal,
      silverVal,
      goldGrams,
      silverGrams,
      netWealth,
      meetsNisab,
      hawlOk,
      due,
      projectedZakat,
      zakatAmt,
      shortBy,
      monthlyEst
    };
  }

  function zakatRulesHTML() {
    const qBox = 'padding:10px 12px;border-radius:12px;background:var(--bg2);border-left:3px solid var(--gold);margin:8px 0;font-size:14px;line-height:1.55';
    const refTag = 'display:inline-block;margin-top:4px;font-size:11.5px;color:var(--gold);font-weight:600';
    return '<section class="block card">' +
      '<h2 class="h2">1. ज़कात कितनी फ़र्ज़ है? (सही फ़ॉर्मूला)</h2>' +
      '<div style="' + qBox + '">“और नमाज़ क़ायम करो और ज़कात अदा करो।”<br><span style="' + refTag + '">📖 सूरह अल-बक़रह (2:43)</span></div>' +
      '<div style="' + qBox + '"><b>दर (Rate):</b> कुल शुद्ध बचत का <b>2.5%</b> यानी <b>40वाँ हिस्सा</b> (कुल नेट माल ÷ 40)।<br><b>चाँदी का निसाब:</b> 52.5 तोला = <b>612.36 ग्राम</b> (200 दिरहम)।<br><b>सोने का निसाब:</b> 7.5 तोला = <b>87.48 ग्राम</b> (20 दीनार/मिस्क़ाल)।<br><b>समय की शर्त (हौल):</b> निसाब के बराबर या ज़्यादा माल पर <b>एक इस्लामी (क़मरी) साल</b> पूरा होना ज़रूरी है।<br><span style="' + refTag + '">📚 सहीह बुख़ारी: 1447, 1454 · सुनन अबू दाऊद: 1573</span></div>' +
      '<p class="muted small" style="margin:6px 0 0">आसान उदाहरण: अगर क़र्ज़ घटाकर आपके पास 1 साल से ₹1,00,000 बचे हैं, तो ज़कात = ₹1,00,000 ÷ 40 = <b>₹2,500</b> होगी।</p>' +
    '</section>' +
    '<section class="block card">' +
      '<h2 class="h2">2. ज़कात कौन दे सकता है (किस पर फ़र्ज़ है)?</h2>' +
      '<ul style="margin:6px 0 10px;padding-left:18px;font-size:14.5px;line-height:1.65">' +
        '<li>हर बालिग़, समझदार (आक़िल) और आज़ाद मुसलमान।</li>' +
        '<li>जिसके पास अपनी ज़रूरी चीज़ों और बकाया क़र्ज़ को घटाने के बाद निसाब के बराबर या उससे ज़्यादा माल हो।</li>' +
        '<li>उस माल पर एक क़मरी (इस्लामी) साल गुज़र चुका हो।</li>' +
      '</ul>' +
      '<div class="notice"><span>ℹ️</span><div><b>किन चीज़ों पर ज़कात नहीं लगती:</b> रहने का अपना घर, रोज़मर्रा के कपड़े, इस्तेमाल की गाड़ी/बाइक, फ़ोन, घर का फ़र्नीचर और काम के औज़ार।</div></div>' +
    '</section>' +
    '<section class="block card">' +
      '<h2 class="h2">3. ज़कात के 8 हक़दार (किसे दे सकते हैं?)</h2>' +
      '<p class="muted small" style="margin:0 0 8px">अल्लाह ने क़ुरआन में ज़कात के 8 हक़दार तय किए हैं — <b>सूरह अत-तौबह (9:60)</b>:</p>' +
      '<ol style="margin:0;padding-left:20px;font-size:14.5px;line-height:1.7">' +
        '<li><b>फ़क़ीर:</b> जिनके पास बहुत कम या कुछ भी नहीं है।</li>' +
        '<li><b>मिस्कीन:</b> ज़रूरतमंद जिनकी आमदनी ज़रूरत से कम है।</li>' +
        '<li><b>ज़कात के काम पर लगाए गए लोग:</b> जो इस्लामी इंतज़ाम में ज़कात जमा व बाँटते हैं।</li>' +
        '<li><b>दिल जोड़ने के लिए (मुअल्लफ़तुल क़ुलूब):</b> इस्लाम की तरफ़ दिल नरम करने हेतु।</li>' +
        '<li><b>ग़ुलाम / क़ैद से आज़ाद कराने में।</b></li>' +
        '<li><b>क़र्ज़दार (ग़ारिमीन):</b> जो जायज़ क़र्ज़ चुकाने में असमर्थ हों।</li>' +
        '<li><b>फ़ी सबीलिल्लाह:</b> अल्लाह के रास्ते और दीनी भलाई के कामों में।</li>' +
        '<li><b>इब्नुस-सबील (मुसाफ़िर):</b> जो सफ़र में मजबूर व बेसहारा हो गया हो।</li>' +
      '</ol>' +
      '<div style="margin-top:10px;padding:10px 12px;border-radius:12px;background:rgba(229,127,114,.12);border:1px solid rgba(229,127,114,.35);font-size:13.5px;line-height:1.55">' +
        '<b>⚠️ किसे ज़कात नहीं दे सकते:</b> अपने माता-पिता, दादा-दादी, नाना-नानी, बेटा-बेटी, पोता-पोती, पत्नी और किसी साहिबे-निसाब (अमीर) व्यक्ति को ज़कात नहीं दी जा सकती। (जरूरतमंद भाई-बहन, चाचा, मामू, खाला और पड़ोसी को ज़कात देना और भी बेहतर है।)' +
      '</div>' +
    '</section>';
  }

  function sadaqahGuideHTML(st) {
    const qBox = 'padding:10px 12px;border-radius:12px;background:var(--bg2);border-left:3px solid var(--gold);margin:8px 0;font-size:14px;line-height:1.55';
    const refTag = 'display:inline-block;margin-top:4px;font-size:11.5px;color:var(--gold);font-weight:600';
    const members = Math.max(1, Math.round(numVal(st.fitraMembers) || 1));
    const fRate = numVal(st.fitraRate) || 100;
    const fTotal = members * fRate;

    return '<section class="block card">' +
      '<h2 class="h2">ज़कात, सदक़ा, ख़ैरात और फ़ितरा में फ़र्क़</h2>' +
      '<div style="overflow-x:auto"><table class="tbl">' +
        '<thead><tr><th>प्रकार</th><th>कितना</th><th>कौन दे</th><th>किसे / क्या दें</th></tr></thead>' +
        '<tbody>' +
          '<tr><td><b>ज़कात</b><br><span class="muted small">(फ़र्ज़)</span></td><td><b>2.5%</b> (÷40)</td><td>साहिबे-निसाब (1 साल)</td><td>8 हक़दार (नक़द/ज़रूरी सामान)</td></tr>' +
          '<tr><td><b>फ़ितरा</b><br><span class="muted small">(वाजिब)</span></td><td>~2 किलो गेहूँ या क़ीमत</td><td>साहिबे-निसाब (हर फ़र्द पर)</td><td>ग़रीब व मिस्कीन (ईद से पहले)</td></tr>' +
          '<tr><td><b>नफ़्ल सदक़ा</b><br><span class="muted small">(ऐच्छिक)</span></td><td>कोई सीमा नहीं (₹1+)</td><td>कोई भी, कभी भी</td><td>किसी भी ज़रूरतमंद को पैसा/मदद</td></tr>' +
          '<tr><td><b>ख़ैरात</b><br><span class="muted small">(भलाई)</span></td><td>जितनी हैसियत</td><td>हर इंसान</td><td>खाना, कपड़ा, पानी, दवा, अच्छी बात</td></tr>' +
        '</tbody>' +
      '</table></div>' +
    '</section>' +
    '<section class="block card">' +
      '<h2 class="h2">🌙 सदक़ा-ए-फ़ित्र (फ़ितरा) कैलकुलेटर</h2>' +
      '<p class="muted small" style="margin:0 0 8px">ईद-उल-फ़ित्र की नमाज़ से पहले घर के हर फ़र्द (बड़े व छोटे बच्चे) की तरफ़ से अदा करना वाजिब है। <b>(सहीह बुख़ारी: 1503)</b></p>' +
      '<div class="zk-grid2">' +
        '<label class="zk-f"><span>घर के कुल लोग</span><input type="number" inputmode="numeric" id="zkFitMem" min="1" max="100" value="' + members + '"></label>' +
        '<label class="zk-f"><span>प्रति व्यक्ति रेट (₹)</span><input type="number" inputmode="decimal" id="zkFitRate" min="1" value="' + fRate + '"></label>' +
      '</div>' +
      '<div style="margin-top:12px;padding:12px;border-radius:14px;background:var(--bg2);border:1px solid var(--line);display:flex;justify-content:space-between;align-items:center;gap:10px">' +
        '<div><div class="muted small">कुल सदक़ा-ए-फ़ित्र</div><div class="muted small" id="zkFitFormula">' + members + ' लोग × ' + fmtINR(fRate) + '</div></div>' +
        '<b style="font-size:24px;color:var(--gold-soft)" id="zkFitTotal">' + fmtINR(fTotal) + '</b>' +
      '</div>' +
    '</section>' +
    '<section class="block card">' +
      '<h2 class="h2">🤲 नफ़्ल सदक़ा कौन और कितना दे सकता है?</h2>' +
      '<ul style="margin:6px 0 8px;padding-left:18px;font-size:14.5px;line-height:1.65">' +
        '<li><b>कौन दे सकता है:</b> हर मुसलमान — चाहे अमीर हो या कम आमदनी वाला। इसमें निसाब या 1 साल की कोई शर्त नहीं होती।</li>' +
        '<li><b>कितना दें:</b> कोई तय रकम नहीं — ₹1, ₹10, ₹100 या अपनी हैसियत के मुताबिक़ जो दिल चाहे, दिन या रात कभी भी दे सकते हैं।</li>' +
        '<li><b>किसे दें:</b> ग़रीब, यतीम, विधवा, बीमार, पड़ोसी, ज़रूरतमंद रिश्तेदार या किसी भी नेक काम में।</li>' +
      '</ul>' +
      '<div style="' + qBox + '">“जो लोग अल्लाह की राह में अपना माल ख़र्च करते हैं, उनकी मिसाल उस दाने जैसी है जिससे सात बालियाँ उगती हैं और हर बाली में सौ दाने होते हैं।”<br><span style="' + refTag + '">📖 सूरह अल-बक़रह (2:261)</span></div>' +
      '<div style="' + qBox + '">“सदक़ा कभी माल को कम नहीं करता।”<br><span style="' + refTag + '">📚 सहीह मुस्लिम: 2588</span></div>' +
    '</section>' +
    '<section class="block card">' +
      '<h2 class="h2">🌱 ख़ैरात में क्या-क्या दे सकते हैं?</h2>' +
      '<ul style="margin:6px 0 8px;padding-left:18px;font-size:14.5px;line-height:1.65">' +
        '<li>भूखे को खाना खिलाना, प्यासे को पानी पिलाना और ज़रूरतमंद को कपड़े या दवा दिलाना।</li>' +
        '<li>किसी कमज़ोर की मदद करना, अच्छी और मीठी बात कहना, मुस्कुरा कर मिलना।</li>' +
        '<li>रास्ते से काँटा, पत्थर या तकलीफ़ देने वाली चीज़ हटाना भी सदक़ा और ख़ैरात है।</li>' +
      '</ul>' +
      '<div style="' + qBox + '">“हर अच्छी बात सदक़ा है और रास्ते से तकलीफ़देह चीज़ हटाना भी सदक़ा है।”<br><span style="' + refTag + '">📚 सहीह बुख़ारी: 2989 · सहीह मुस्लिम: 1006, 1009</span></div>' +
      '<div style="' + qBox + '"><b>सदक़ा-ए-जारिया (हमेशा जारी रहने वाला सवाब):</b> मस्जिद बनवाना, पानी का नल/कुआँ लगवाना, फ़ायदेमंद इल्म फैलाना और नेक औलाद — इनका सवाब इंसान के दुनिया से जाने के बाद भी मिलता रहता है।<br><span style="' + refTag + '">📚 सहीह मुस्लिम: 1631</span></div>' +
    '</section>';
  }

  R.zakat = function () {
    const st = loadZ();
    const v = $('#view');

    function renderResult() {
      const resEl = $('#zkRes');
      if (!resEl) return;
      const r = computeZakat(st);
      const stdName = st.std === 'gold' ? 'सोना 87.48g' : 'चाँदी 612.36g';
      const stdFormula = st.std === 'gold'
        ? ('87.48g × ' + fmtINR(r.goldRate) + ' = ' + fmtINR(r.nisab))
        : ('612.36g × ' + fmtINR(r.silverRate) + ' = ' + fmtINR(r.nisab));

      let badgeCls = 'safe';
      let badgeTxt = 'ℹ️ ऊपर अपनी कुल रकम डालें';
      let subTxt = 'ज़कात = शुद्ध बचत का 2.5% (40वाँ हिस्सा)';
      let displayAmt = r.zakatAmt;

      if (r.totalAssets > 0) {
        if (!r.meetsNisab) {
          badgeCls = 'safe';
          badgeTxt = 'ℹ️ निसाब से कम (ज़कात फ़र्ज़ नहीं)';
          subTxt = 'आपका माल निसाब से ' + fmtINR(r.shortBy) + ' कम है — चाहें तो नफ़्ल सदक़ा दे सकते हैं';
        } else if (!r.hawlOk) {
          badgeCls = 'safe';
          badgeTxt = '⏳ निसाब पूरा है (1 क़मरी साल बाद फ़र्ज़)';
          subTxt = '1 इस्लामी साल पूरा होने पर अनुमानित 2.5% ज़कात: ' + fmtINR(r.projectedZakat);
          displayAmt = 0;
        } else {
          badgeCls = 'due';
          badgeTxt = '✅ आप पर ज़कात फ़र्ज़ है (2.5%)';
          subTxt = 'अदा की जाने वाली कुल ज़कात (लगभग ' + fmtINR(r.monthlyEst) + ' / महीना)';
        }
      }

      const stepStyle = 'display:flex;justify-content:space-between;gap:8px;padding:5px 0;border-bottom:1px dashed var(--line);font-size:13px';
      const formulaHtml =
        '<div style="margin-top:12px;padding:10px 12px;border-radius:14px;background:var(--bg2);border:1px solid var(--line);text-align:left">' +
          '<div style="font-size:12px;font-weight:700;color:var(--gold);margin-bottom:4px">📐 पूरा फ़ॉर्मूला (हिसाब कैसे निकला)</div>' +
          '<div style="' + stepStyle + '"><span>1. कुल माल (Assets)</span><b>' + fmtINR(r.totalAssets) + '</b></div>' +
          '<div style="' + stepStyle + '"><span>2. बकाया क़र्ज़ घटाया (Debt)</span><b>− ' + fmtINR(r.debt) + '</b></div>' +
          '<div style="' + stepStyle + '"><span>3. शुद्ध बचत (Net = माल − क़र्ज़)</span><b>' + fmtINR(r.netWealth) + '</b></div>' +
          '<div style="' + stepStyle + '"><span>4. निसाब (' + stdName + ')</span><b>' + fmtINR(r.nisab) + '</b></div>' +
          '<div style="display:flex;justify-content:space-between;gap:8px;padding:6px 0 0;font-size:13.5px;color:var(--gold-soft)"><span>5. ज़कात (' + (r.due ? (fmtINR(r.netWealth) + ' ÷ 40') : '2.5% फ़ॉर्मूला') + ')</span><b>' + fmtINR(displayAmt) + '</b></div>' +
          '<div class="muted" style="font-size:11.5px;margin-top:4px">निसाब हिसाब: ' + stdFormula + '</div>' +
        '</div>';

      resEl.innerHTML =
        '<div class="zk-badge ' + badgeCls + '">' + badgeTxt + '</div>' +
        '<div class="zk-amt">' + fmtINR(displayAmt) + '</div>' +
        '<div class="muted small" style="margin-bottom:12px">' + subTxt + '</div>' +
        '<div class="stat3">' +
          '<div><b>' + fmtINR(r.totalAssets) + '</b><span>कुल माल</span></div>' +
          '<div><b>' + fmtINR(r.netWealth) + '</b><span>शुद्ध बचत</span></div>' +
          '<div><b>' + fmtINR(r.nisab) + '</b><span>निसाब</span></div>' +
        '</div>' +
        formulaHtml;

      const sumEl = $('#zkNisabSum');
      if (sumEl) {
        sumEl.textContent = '⚙️ निसाब व आज का रेट बदलें (अभी: ' + fmtINR(r.nisab) + ')';
      }
      const gValEl = $('#zkGoldVal');
      if (gValEl) {
        gValEl.textContent = r.goldVal > 0 ? ('= ' + fmtINR(r.goldVal) + ' (' + fmtDec(r.goldGrams) + 'g)') : '';
      }
      const sValEl = $('#zkSilverVal');
      if (sValEl) {
        sValEl.textContent = r.silverVal > 0 ? ('= ' + fmtINR(r.silverVal) + ' (' + fmtDec(r.silverGrams) + 'g)') : '';
      }
    }

    function buildCopyText() {
      const r = computeZakat(st);
      const lines = [
        'Zikr Deen — ज़कात हिसाब',
        'तरीका: ' + (st.mode === 'quick' ? 'आसान तरीका' : 'पूरा हिसाब'),
        'कुल माल: ' + fmtINR(r.totalAssets),
        'क़र्ज़ घटाया: ' + fmtINR(r.debt),
        'शुद्ध बचत (Net Wealth): ' + fmtINR(r.netWealth),
        'निसाब (' + (st.std === 'gold' ? 'सोना 87.48g' : 'चाँदी 612.36g') + '): ' + fmtINR(r.nisab),
        '1 इस्लामी साल पूरा: ' + (r.hawlOk ? 'हाँ' : 'नहीं'),
        'कुल ज़कात (2.5% / ÷40): ' + fmtINR(r.zakatAmt)
      ];
      return lines.join('\n');
    }

    function render() {
      const topTabs =
        '<div class="seg" id="zkMainTab" role="tablist">' +
          '<button type="button" role="tab" data-ztab="calc" aria-selected="' + (st.tab === 'calc') + '">🧮 कैलकुलेटर</button>' +
          '<button type="button" role="tab" data-ztab="rules" aria-selected="' + (st.tab === 'rules') + '">📖 ज़कात नियम</button>' +
          '<button type="button" role="tab" data-ztab="sadaqah" aria-selected="' + (st.tab === 'sadaqah') + '">🤲 सदक़ा व ख़ैरात</button>' +
        '</div>';

      let bodyHtml = '';
      if (st.tab === 'rules') {
        bodyHtml = zakatRulesHTML();
      } else if (st.tab === 'sadaqah') {
        bodyHtml = sadaqahGuideHTML(st);
      } else {
        const quickInputs =
          '<section class="block card">' +
            '<h2 class="h2">आसान तरीका (सिर्फ़ कुल रकम डालें)</h2>' +
            '<p class="muted small" style="margin:0 0 8px">कैश, बैंक, सोना-चाँदी व बचत सबको मिलाकर जितनी कुल रकम आपके पास है, नीचे लिखें:</p>' +
            '<label class="zk-f"><span>💰 आपकी कुल बचत / माल (₹)</span><input type="number" inputmode="decimal" id="zkQuickTotal" min="0" value="' + (st.quickTotal > 0 ? st.quickTotal : '') + '" placeholder="जैसे: 150000"></label>' +
            '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">' +
              '<button type="button" class="pill" data-qadd="10000">+₹10k</button>' +
              '<button type="button" class="pill" data-qadd="50000">+₹50k</button>' +
              '<button type="button" class="pill" data-qadd="100000">+₹1 लाख</button>' +
              '<button type="button" class="pill" data-qadd="500000">+₹5 लाख</button>' +
            '</div>' +
            '<label class="zk-f" style="margin-top:12px"><span>➖ बकाया क़र्ज़ / उधार जो चुकाना है (₹ · वैकल्पिक)</span><input type="number" inputmode="decimal" id="zkQuickDebt" min="0" value="' + (st.quickDebt > 0 ? st.quickDebt : '') + '" placeholder="0"></label>' +
          '</section>';

        const unitLabel = st.metalUnit === 'tola' ? 'तोला में (1 तोला = 11.664g)' : 'ग्राम में';
        const detailInputs =
          '<section class="block card">' +
            '<h2 class="h2">1. आपकी कुल संपत्ति (Assets)</h2>' +
            '<label class="zk-f"><span>💵 कैश और बैंक बैलेंस (₹)</span><input type="number" inputmode="decimal" id="zkCash" min="0" value="' + (st.cash > 0 ? st.cash : '') + '" placeholder="जैसे: 50000"></label>' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px"><span style="font-size:13px;font-weight:600;color:var(--muted)">सोना-चाँदी की इकाई चुनें</span><div style="display:flex;gap:6px"><button type="button" class="tb-chip' + (st.metalUnit === 'gram' ? ' on' : '') + '" data-munit="gram">ग्राम (g)</button><button type="button" class="tb-chip' + (st.metalUnit === 'tola' ? ' on' : '') + '" data-munit="tola">तोला</button></div></div>' +
            '<div class="zk-grid2">' +
              '<label class="zk-f"><span>🥇 सोना (' + unitLabel + ')</span><input type="number" inputmode="decimal" id="zkGoldQty" min="0" step="0.1" value="' + (st.goldQty > 0 ? st.goldQty : '') + '" placeholder="0"><small class="muted" id="zkGoldVal" style="display:block;margin-top:3px;min-height:14px"></small></label>' +
              '<label class="zk-f"><span>🥈 चाँदी (' + unitLabel + ')</span><input type="number" inputmode="decimal" id="zkSilverQty" min="0" step="0.1" value="' + (st.silverQty > 0 ? st.silverQty : '') + '" placeholder="0"><small class="muted" id="zkSilverVal" style="display:block;margin-top:3px;min-height:14px"></small></label>' +
            '</div>' +
            '<label class="zk-f"><span>📈 इन्वेस्टमेंट / शेयर / बचत (₹)</span><input type="number" inputmode="decimal" id="zkInv" min="0" value="' + (st.invest > 0 ? st.invest : '') + '" placeholder="0"></label>' +
            '<label class="zk-f"><span>🏪 बिज़नेस का माल / स्टॉक (₹)</span><input type="number" inputmode="decimal" id="zkBiz" min="0" value="' + (st.business > 0 ? st.business : '') + '" placeholder="0"></label>' +
            '<label class="zk-f"><span>🤝 दिया गया क़र्ज़ जो वापस मिलना है (₹)</span><input type="number" inputmode="decimal" id="zkOth" min="0" value="' + (st.other > 0 ? st.other : '') + '" placeholder="0"></label>' +
          '</section>' +
          '<section class="block card">' +
            '<h2 class="h2">2. क़र्ज़ और देनदारी (Liabilities)</h2>' +
            '<label class="zk-f"><span>➖ आपका बकाया क़र्ज़ / बिल (₹)</span><input type="number" inputmode="decimal" id="zkDebt" min="0" value="' + (st.debt > 0 ? st.debt : '') + '" placeholder="0"></label>' +
          '</section>';

        bodyHtml =
          '<section class="block card zk-hero" id="zkRes"></section>' +
          '<div class="seg" id="zkMode" role="tablist">' +
            '<button type="button" role="tab" data-mode="quick" aria-selected="' + (st.mode === 'quick') + '">⚡ आसान तरीका</button>' +
            '<button type="button" role="tab" data-mode="detail" aria-selected="' + (st.mode === 'detail') + '">📋 पूरा हिसाब</button>' +
          '</div>' +
          (st.mode === 'quick' ? quickInputs : detailInputs) +
          '<section class="block card">' +
            '<div class="field" style="padding-top:0;border-bottom:0">' +
              '<label><b>क्या इस माल पर 1 इस्लामी (क़मरी) साल पूरा हो गया है?</b><br><span class="muted small">सहीह हदीस के अनुसार 1 साल पूरा होने पर ज़कात फ़र्ज़ होती है</span></label>' +
              '<button type="button" class="switch" id="zkHawl" role="switch" aria-checked="' + (st.hawl !== false) + '" aria-label="1 lunar year completed"></button>' +
            '</div>' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">' +
              '<button type="button" class="btn sm" id="zkCalcBtn">🧮 ज़कात निकालें</button>' +
              '<button type="button" class="btn sm ghost" id="zkCopy">📋 हिसाब कॉपी करें</button>' +
              '<button type="button" class="btn sm ghost" id="zkReset">साफ़ करें</button>' +
            '</div>' +
          '</section>' +
          '<section class="block card">' +
            '<details id="zkNisabBox">' +
              '<summary id="zkNisabSum" style="font-weight:700;color:var(--gold-soft);cursor:pointer;min-height:36px;display:flex;align-items:center">⚙️ निसाब व आज का रेट बदलें</summary>' +
              '<p class="muted small" style="margin:8px 0">आम तौर पर भारत में <b>चाँदी का निसाब (52.5 तोला = 612.36g)</b> बेहतर व एहतियात वाला माना जाता है। केवल सोना हो तो सोने का निसाब (7.5 तोला = 87.48g) चुनें।</p>' +
              '<div class="seg" id="zkStd" role="tablist">' +
                '<button type="button" role="tab" data-std="silver" aria-selected="' + (st.std === 'silver') + '">चाँदी (612.36g · बेहतर)</button>' +
                '<button type="button" role="tab" data-std="gold" aria-selected="' + (st.std === 'gold') + '">सोना (87.48g)</button>' +
              '</div>' +
              '<div class="zk-grid2">' +
                '<label class="zk-f"><span>सोने का रेट (₹ / ग्राम)</span><input type="number" inputmode="decimal" id="zkGR" min="0" step="10" value="' + st.goldRate + '"></label>' +
                '<label class="zk-f"><span>चाँदी का रेट (₹ / ग्राम)</span><input type="number" inputmode="decimal" id="zkSR" min="0" step="1" value="' + st.silverRate + '"></label>' +
              '</div>' +
            '</details>' +
          '</section>' +
          '<section class="block card"><p class="muted small" style="margin:0">नोट: यह कैलकुलेटर क़ुरआन (2:43, 9:60) और सहीह हदीस (बुख़ारी 1447, 1454) के 2.5% (40वें हिस्से) के नियम पर आधारित है। विशेष मसाइल में किसी आलिम से मशवरा लें।</p></section>';
      }

      v.innerHTML = top('Zakat & Sadaqah', 'ज़कात कैलकुलेटर · सदक़ा व ख़ैरात गाइड') +
        '<main class="zk-wrap">' + topTabs + bodyHtml + '</main>';

      $('#zkMainTab').addEventListener('click', e => {
        const b = e.target.closest('[data-ztab]');
        if (!b) return;
        const next = b.dataset.ztab;
        if (next === st.tab) return;
        st.tab = next;
        saveZ(st);
        render();
        window.scrollTo(0, 0);
      });

      if (st.tab === 'sadaqah') {
        const fm = $('#zkFitMem');
        const fr = $('#zkFitRate');
        const updateFitra = () => {
          const m = Math.max(1, Math.round(numVal(fm && fm.value) || 1));
          const rt = numVal(fr && fr.value) || 0;
          st.fitraMembers = m;
          st.fitraRate = rt > 0 ? rt : 100;
          saveZ(st);
          const totEl = $('#zkFitTotal');
          const fEl = $('#zkFitFormula');
          if (totEl) totEl.textContent = fmtINR(m * rt);
          if (fEl) fEl.textContent = m + ' लोग × ' + fmtINR(rt);
        };
        if (fm) fm.addEventListener('input', updateFitra);
        if (fr) fr.addEventListener('input', updateFitra);
        return;
      }

      if (st.tab !== 'calc') return;

      const bind = (id, key) => {
        const el = $('#' + id);
        if (!el) return;
        el.addEventListener('input', () => {
          st[key] = numVal(parseFloat(el.value));
          saveZ(st);
          renderResult();
        });
      };

      bind('zkGR', 'goldRate');
      bind('zkSR', 'silverRate');
      bind('zkQuickTotal', 'quickTotal');
      bind('zkQuickDebt', 'quickDebt');
      bind('zkCash', 'cash');
      bind('zkGoldQty', 'goldQty');
      bind('zkSilverQty', 'silverQty');
      bind('zkInv', 'invest');
      bind('zkBiz', 'business');
      bind('zkOth', 'other');
      bind('zkDebt', 'debt');

      $('#zkMode').addEventListener('click', e => {
        const b = e.target.closest('[data-mode]');
        if (!b) return;
        const next = b.dataset.mode;
        if (next === st.mode) return;
        st.mode = next;
        saveZ(st);
        render();
      });

      v.querySelectorAll('[data-qadd]').forEach(btn => {
        btn.addEventListener('click', () => {
          const add = Number(btn.dataset.qadd) || 0;
          st.quickTotal = numVal(st.quickTotal) + add;
          saveZ(st);
          const inp = $('#zkQuickTotal');
          if (inp) inp.value = String(st.quickTotal);
          renderResult();
        });
      });

      v.querySelectorAll('[data-munit]').forEach(btn => {
        btn.addEventListener('click', () => {
          const next = btn.dataset.munit;
          if (!next || next === st.metalUnit) return;
          st.metalUnit = next;
          saveZ(st);
          render();
        });
      });

      $('#zkHawl').addEventListener('click', e => {
        st.hawl = !(st.hawl !== false);
        saveZ(st);
        e.currentTarget.setAttribute('aria-checked', String(st.hawl));
        renderResult();
      });

      $('#zkStd').addEventListener('click', e => {
        const b = e.target.closest('[data-std]');
        if (!b) return;
        st.std = b.dataset.std;
        saveZ(st);
        $('#zkStd').querySelectorAll('[data-std]').forEach(x => x.setAttribute('aria-selected', String(x === b)));
        renderResult();
      });

      $('#zkCalcBtn').addEventListener('click', () => {
        renderResult();
        const hero = $('#zkRes');
        if (hero && hero.scrollIntoView) hero.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const r = computeZakat(st);
        if (r.totalAssets <= 0) {
          ZD.toast('कृपया पहले अपनी बचत या माल की रकम लिखें');
        } else if (r.due) {
          ZD.toast('कुल ज़कात: ' + fmtINR(r.zakatAmt));
        } else if (!r.meetsNisab) {
          ZD.toast('आपका माल निसाब से कम है — ज़कात फ़र्ज़ नहीं');
        } else {
          ZD.toast('1 इस्लामी साल पूरा होने पर ज़कात फ़र्ज़ होगी');
        }
      });

      $('#zkCopy').addEventListener('click', async () => {
        const txt = buildCopyText();
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(txt);
            ZD.toast('ज़कात का पूरा हिसाब कॉपी हो गया');
            return;
          }
        } catch (_) {}
        try {
          const ta = document.createElement('textarea');
          ta.value = txt;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          ta.remove();
          ZD.toast('ज़कात का पूरा हिसाब कॉपी हो गया');
        } catch (_) {
          ZD.toast('कॉपी नहीं हो सका');
        }
      });

      $('#zkReset').addEventListener('click', () => {
        Object.assign(st, { quickTotal: 0, quickDebt: 0, cash: 0, goldQty: 0, silverQty: 0, invest: 0, business: 0, other: 0, debt: 0, hawl: true });
        saveZ(st);
        render();
        ZD.toast('हिसाब साफ़ कर दिया गया');
      });

      renderResult();
    }

    render();
    window.scrollTo(0, 0);
  };

  const RKEY = 'zdRuqiyahV1';
  const RUQIYAH_ITEMS = [
    {
      id: 'fatiha',
      title: 'Surah Al-Fatihah (सूरह अल-फ़ातिहा)',
      ref: 'Al-Fatihah 1:1–7 · Sahih al-Bukhari 5736',
      rep: 3,
      ar: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ۝ ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ ۝ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ۝ مَٰلِكِ يَوْمِ ٱلدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ ۝ صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ',
      rom: 'Bismillahir-Rahmanir-Rahim. Al-hamdu lillahi Rabbil-alamin...',
      hi: 'यह सूरह "अश-शिफ़ा" (इलाज और बरकत की सूरह) कहलाती है। बीमार या नज़र-ए-बद के असर पर दम करने के लिए सबसे अफ़ज़ल है।'
    },
    {
      id: 'kursi',
      title: 'Ayat al-Kursi (आयतुल कुर्सी)',
      ref: 'Al-Baqarah 2:255 · Sahih al-Bukhari 2311',
      rep: 3,
      ar: 'ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌۭ وَلَا نَوْمٌۭ ۚ لَّهُۥ مَا فِى ٱلسَّمَٰوَٰتِ وَمَا فِى ٱلْأَرْضِ ۗ مَن ذَا ٱلَّذِى يَشْفَعُ عِندَهُۥٓ إِلَّا بِإِذْنِهِۦ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَىْءٍۢ مِّنْ عِلْمِهِۦٓ إِلَّا بِمَا شَآءَ ۚ وَسِعَ كُرْسِيُّهُ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضَ ۖ وَلَا يَـُٔودُهُۥ حِفْظُهُمَا ۚ وَهُوَ ٱلْعَلِىُّ ٱلْعَظِيمُ',
      rom: 'Allahu la ilaha illa Huwal-Hayyul-Qayyum...',
      hi: 'अल्लाह के सिवा कोई माबूद नहीं, वह हमेशा ज़िंदा और सबका थामने वाला है। सुबह-शाम और सोने से पहले पढ़ने से शैतान से हिफ़ाज़त रहती है।'
    },
    {
      id: 'ikhlas',
      title: 'Surah Al-Ikhlas (सूरह अल-इख़लास)',
      ref: 'Al-Ikhlas 112:1–4 · Sahih al-Bukhari 5017',
      rep: 3,
      ar: 'قُلْ هُوَ ٱللَّهُ أَحَدٌ ۝ ٱللَّهُ ٱلصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ',
      rom: 'Qul Huwallahu Ahad. Allahus-Samad. Lam yalid wa lam yulad. Wa lam yakul-lahu kufuwan ahad.',
      hi: 'कह दीजिए कि वह अल्लाह एक है, अल्लाह बेनियाज़ है, न उसकी कोई औलाद है और न वह किसी से पैदा हुआ।'
    },
    {
      id: 'falaq',
      title: 'Surah Al-Falaq (सूरह अल-फ़लक़)',
      ref: 'Al-Falaq 113:1–5 · Sahih al-Bukhari 5017',
      rep: 3,
      ar: 'قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ ٱلنَّفَّٰثَٰتِ فِى ٱلْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
      rom: 'Qul a\'udhu bi-Rabbil-falaq, min sharri ma khalaq, wa min sharri ghasiqin idha waqab, wa min sharrin-naffathati fil-uqad, wa min sharri hasidin idha hasad.',
      hi: 'मैं सुबह के रब की पनाह माँगता हूँ हर मख़लूक़ के शर से, जादू करने वालों और हसद करने वालों के शर से।'
    },
    {
      id: 'nas',
      title: 'Surah An-Nas (सूरह अन-नास)',
      ref: 'An-Nas 114:1–6 · Sahih al-Bukhari 5017',
      rep: 3,
      ar: 'قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ ۝ مَلِكِ ٱلنَّاسِ ۝ إِلَٰهِ ٱلنَّاسِ ۝ مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ ۝ ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ ۝ مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ',
      rom: 'Qul a\'udhu bi-Rabbin-nas, Malikin-nas, Ilahin-nas, min sharril-waswasil-khannas, alladhi yuwaswisu fi sudurin-nas, minal-jinnati wan-nas.',
      hi: 'मैं लोगों के रब, बादशाह और माबूद की पनाह माँगता हूँ वसवसा डालने वाले के शर से, चाहे वह जिन्नों में से हो या इंसानों में से।'
    },
    {
      id: 'jibril',
      title: 'Jibril (AS) ki Ruqiyah Dua',
      ref: 'Sahih Muslim 2186',
      rep: 3,
      ar: 'بِسْمِ اللَّهِ أَرْقِيكَ، مِنْ كُلِّ شَيْءٍ يُؤْذِيكَ، مِنْ شَرِّ كُلِّ نَفْسٍ أَوْ عَيْنِ حَاسِدٍ، اللَّهُ يَشْفِيكَ، بِسْمِ اللَّهِ أَرْقِيكَ',
      rom: 'Bismillahi arqeeka, min kulli shay\'in yu\'dheeka, min sharri kulli nafsin aw \'ayni hasidin, Allahu yashfeeka, bismillahi arqeeka.',
      hi: 'अल्लाह के नाम से मैं तुम पर दम करता हूँ हर तकलीफ़ देने वाली चीज़ और हर हसद करने वाली नज़र के शर से; अल्लाह तुम्हें शिफ़ा दे।'
    },
    {
      id: 'shifa',
      title: 'Bimari se Shifa ki Dua',
      ref: 'Sahih al-Bukhari 5675',
      rep: 3,
      ar: 'اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَاسَ، اشْفِهِ وَأَنْتَ الشَّافِي، لَا شِفَاءَ إِلَّا شِفَاؤُكَ، شِفَاءً لَا يُغَادِرُ سَقَمًا',
      rom: 'Allahumma Rabban-nasi adh-hibil-ba\'s, ishfi wa Antash-Shafi, la shifa\'a illa shifa\'uka, shifa\'an la yughadiru saqama.',
      hi: 'ऐ अल्लाह, लोगों के रब! तकलीफ़ दूर कर दे और शिफ़ा अता फ़रमा; तू ही शिफ़ा देने वाला है, ऐसी शिफ़ा जो कोई बीमारी न छोड़े।'
    },
    {
      id: 'hifazat',
      title: 'Nazar aur Har Buraai se Panah',
      ref: 'Sahih al-Bukhari 3371',
      rep: 3,
      ar: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ، وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ',
      rom: 'A\'udhu bi-kalimatillahit-tammati min kulli shaytanin wa hammah, wa min kulli \'aynin lammah.',
      hi: 'मैं अल्लाह के मुकम्मल कलिमात की पनाह माँगता हूँ हर शैतान, ज़हरीले जानवर और हर बुरी नज़र से।'
    }
  ];

  function loadRq() {
    try {
      const d = JSON.parse(localStorage.getItem(RKEY) || '{}');
      if (d.day !== ZD.today()) return { day: ZD.today(), c: {}, doneDays: Number(d.doneDays) || 0, countedToday: false };
      return { day: d.day, c: d.c || {}, doneDays: Number(d.doneDays) || 0, countedToday: !!d.countedToday };
    } catch (_) {
      return { day: ZD.today(), c: {}, doneDays: 0, countedToday: false };
    }
  }
  function saveRq(d) {
    try {
      localStorage.setItem(RKEY, JSON.stringify(d));
    } catch (_) {}
  }

  R.ruqiyah = function () {
    const st = loadRq();
    const v = $('#view');
    function render() {
      const totalNeed = RUQIYAH_ITEMS.reduce((s, x) => s + x.rep, 0);
      const totalDone = RUQIYAH_ITEMS.reduce((s, x) => s + Math.min(x.rep, st.c[x.id] || 0), 0);
      const pct = Math.round((totalDone / totalNeed) * 100);
      v.innerHTML = top('Ruqiyah Shariah', 'रुक़याह · शिफ़ा और हिफ़ाज़त') + '<main class="rq-wrap">' +
        '<section class="block card"><div style="display:flex;justify-content:space-between;align-items:center"><div><b>आज की रुक़याह प्रोग्रेस</b><div class="muted small">' + totalDone + ' / ' + totalNeed + ' बार पढ़ा गया</div></div><button type="button" class="btn sm ghost" id="rqReset">Reset</button></div>' +
        '<div class="bar" style="margin-top:10px"><i style="width:' + pct + '%"></i></div></section>' +
        RUQIYAH_ITEMS.map(x => {
          const cur = st.c[x.id] || 0, done = cur >= x.rep;
          return '<section class="block card rq-card' + (done ? ' done' : '') + '">' +
            '<div class="rq-head"><div><b>' + esc(x.title) + '</b><span class="muted small">' + esc(x.ref) + '</span></div>' +
            '<button type="button" class="rq-cnt' + (done ? ' done' : '') + '" data-rq="' + x.id + '">' + (done ? '✓ ' : '') + cur + ' / ' + x.rep + '</button></div>' +
            '<div class="ar-text rq-ar" lang="ar">' + esc(x.ar) + '</div>' +
            '<div class="rq-rom">' + esc(x.rom) + '</div>' +
            '<div class="rq-hi">' + esc(x.hi) + '</div>' +
            '</section>';
        }).join('') +
        '</main>';

      v.querySelectorAll('[data-rq]').forEach(b => b.addEventListener('click', () => {
        const id = b.dataset.rq, item = RUQIYAH_ITEMS.find(x => x.id === id);
        if (!item) return;
        const prev = st.c[id] || 0;
        st.c[id] = prev >= item.rep ? 0 : (prev + 1);
        if (navigator.vibrate) navigator.vibrate(st.c[id] >= item.rep ? [25, 35, 25] : 12);
        const allDone = RUQIYAH_ITEMS.every(x => (st.c[x.id] || 0) >= x.rep);
        if (allDone && !st.countedToday) {
          st.doneDays = (st.doneDays || 0) + 1;
          st.countedToday = true;
          ZD.toast('माशाअल्लाह! आज की मुकम्मल रुक़याह पूरी हुई 🤲');
        }
        saveRq(st);
        render();
      }));
      const rb = $('#rqReset');
      if (rb) rb.addEventListener('click', () => {
        st.c = {};
        st.countedToday = false;
        saveRq(st);
        render();
        ZD.toast('Ruqiyah progress reset');
      });
    }
    render();
  };

  function getTasbihTotal() {
    try {
      return Number(JSON.parse(localStorage.getItem('zdTasbihV1') || '{}').total) || 0;
    } catch (_) {
      return 0;
    }
  }
  function getRuqiyahCount() {
    try {
      const d = JSON.parse(localStorage.getItem(RKEY) || '{}');
      return Object.values(d.c || {}).reduce((a, b) => a + (Number(b) || 0), 0) + (Number(d.doneDays) || 0) * 24;
    } catch (_) {
      return 0;
    }
  }

  R.progress = function () {
    const st = ZD.state() || {};
    const totalRead = ZD.totalRead();
    const streak = ZD.streak();
    const todayC = ZD.todayCount();
    const goal = ZD.prefs().goal || 3;
    const mulkStatus = (st.mulk && st.mulk.status) || {};
    const mulkMem = Object.values(mulkStatus).filter(x => x === 'memorised').length;
    const mulkLearn = Object.values(mulkStatus).filter(x => x === 'learning' || x === 'needs-revision').length;
    const tasbihTot = getTasbihTotal();
    const rqCnt = getRuqiyahCount();
    const bms = (st.bookmarks || []).length;
    const revCnt = (st.rev || []).length;

    const s2 = ZD.step2Stats ? ZD.step2Stats() : { xp: 0, pct: 0, kmDone: 0, kmTotal: 8, salahWins: 0, spotCorrect: 0 };
    const xp = totalRead * 15 + mulkMem * 60 + mulkLearn * 15 + streak * 50 + Math.floor(tasbihTot / 3) + rqCnt * 8 + bms * 5 + s2.xp;
    const level = Math.floor(xp / 500) + 1;
    const ranks = ['नया मुसाफ़िर', 'तालिब-ए-इल्म', 'क़ारी (Learner)', 'हाफ़िज़ पाथ', 'मुत्तक़ी स्कॉलर', 'ज़िक्र-दीन मास्टर'];
    const rankName = ranks[Math.min(ranks.length - 1, Math.floor((level - 1) / 2))];

    const qMastery = Math.min(100, Math.max(totalRead > 0 ? 5 : 0, Math.round((totalRead / 100) * 100)));
    const mMastery = Math.round((mulkMem / 30) * 100);
    const tMastery = Math.min(100, Math.round((tasbihTot / 500) * 100));
    const rMastery = Math.min(100, Math.round((rqCnt / 24) * 100));
    const gMastery = Math.min(100, Math.round((todayC / goal) * 100));
    const overall = Math.round((qMastery + mMastery + tMastery + rMastery + gMastery) / 5);

    const today = ZD.today(), days7 = [];
    const dayNames = ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];
    for (let i = 6; i >= 0; i--) {
      const iso = ZD.addDays(today, -i);
      const cnt = ((st.log && st.log[iso]) || []).length;
      const dt = new Date(iso + 'T12:00:00');
      days7.push({ iso, lbl: dayNames[dt.getDay()], cnt });
    }
    const maxDay = Math.max(goal, ...days7.map(d => d.cnt), 1);

    const subjects = [
      { ico: '📖', name: 'Quran Reading', sub: totalRead + ' आयात पढ़ीं · ' + bms + ' सेव्ड', pct: qMastery, href: '#/surahs', col: '#22c55e' },
      { ico: '🌙', name: 'Surah Al-Mulk Hifz', sub: mulkMem + ' / 30 आयात हिफ़्ज़', pct: mMastery, href: '#/mulk', col: '#eab308' },
      { ico: '📿', name: 'Zikr & Tasbih', sub: tasbihTot.toLocaleString() + ' कुल ज़िक्र', pct: tMastery, href: '#/tasbih', col: '#06b6d4' },
      { ico: '🛡️', name: 'Ruqiyah & Azkaar', sub: 'आज की हिफ़ाज़त और दुआएँ', pct: rMastery, href: '#/ruqiyah', col: '#a855f7' },
      { ico: '🕌', name: '3D Namaz & Salah Builder', sub: 'जीते राउंड: ' + s2.salahWins + ' · गलती पहचानें: ' + s2.spotCorrect + ' सही', pct: s2.pct, href: '#/namaz3d', col: '#f97316' },
      { ico: '🌌', name: 'Islamic Knowledge Star Map', sub: s2.kmDone + ' / ' + s2.kmTotal + ' विषय मास्टर्ड', pct: Math.round((s2.kmDone / Math.max(1, s2.kmTotal)) * 100), href: '#/knowledge-map', col: '#38bdf8' }
    ];

    const vaDone = (function () {
      try {
        return JSON.parse(localStorage.getItem('zdVaStats_v1') || '{}');
      } catch (_) {
        return {};
      }
    })();
    const masteryBadges = [
      { id: 'silsila', img: './img/visuals/badge-silsila.webp', name: 'इब्तिदाई सिलसिला', ok: totalRead >= 3 || streak >= 1, st: (totalRead >= 3 || streak >= 1) ? 'अनलॉक्ड ✓' : '3 आयत पढ़ें' },
      { id: 'hifz', img: './img/visuals/badge-hifz.webp', name: 'क़ुरआन हिफ़्ज़ स्टार', ok: mulkMem >= 1 || revCnt >= 1, st: mulkMem > 0 ? (mulkMem + '/30 हिफ़्ज़') : 'अल-मुल्क शुरू करें' },
      { id: 'feynman', img: './img/visuals/badge-feynman.webp', name: 'Feynman मास्टर', ok: (s2.kmDone || 0) >= 1 || (vaDone.science || 0) >= 1, st: (s2.kmDone || 0) >= 1 ? 'अनलॉक्ड ✓' : 'विज़ुअल एकेडमी' },
      { id: 'math', img: './img/visuals/badge-math.webp', name: 'मैथ्स व लॉजिक', ok: (s2.spotCorrect || 0) >= 1 || (vaDone.science || 0) >= 2, st: (s2.spotCorrect || 0) >= 1 ? 'अनलॉक्ड ✓' : 'क्विज़ / लैब' },
      { id: 'ethics', img: './img/visuals/badge-ethics.webp', name: 'Ethics व अख़लाक़', ok: (vaDone.ethics || 0) >= 1 || rqCnt >= 1, st: (vaDone.ethics || 0) >= 1 ? 'अनलॉक्ड ✓' : 'Ethics चुनौती' },
      { id: 'arabic', img: './img/visuals/badge-arabic.webp', name: 'Arabic Root मास्टर', ok: (vaDone.roots || 0) >= 1 || tasbihTot >= 33, st: (vaDone.roots || 0) >= 1 ? 'अनलॉक्ड ✓' : 'रूट-ट्री देखें' }
    ];
    const badgesHTML = '<section class="block card"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><h2 class="h2" style="margin:0">🏆 3D मास्टरी बैजेज़</h2><a class="btn sm ghost" href="#/visual-academy">Visual Academy</a></div>' +
      '<div class="zd-badge-grid">' +
      masteryBadges.map(b => '<a class="zd-badge-card' + (b.ok ? '' : ' locked') + '" href="#/visual-academy" data-glow="1" style="text-decoration:none">' +
        '<img src="' + b.img + '" alt="' + esc(b.name) + '" loading="lazy">' +
        '<b>' + esc(b.name) + '</b><small>' + esc(b.st) + '</small></a>').join('') +
      '</div></section>';

    const v = $('#view');
    v.innerHTML = top('Progress & Mastery', 'XP डैशबोर्ड · आपकी इबादत और लर्निंग रिपोर्ट') + '<main class="pg-wrap">' +
      '<section class="block card pg-hero">' +
        '<div class="pg-ring-box">' +
          '<div class="pg-ring" style="--p:' + overall + '"><div><b>' + overall + '%</b><span>MASTERY</span></div></div>' +
          '<div class="pg-meta">' +
            '<div class="pg-lvl">LEVEL ' + level + ' · ' + esc(rankName) + '</div>' +
            '<div class="pg-xp">' + xp.toLocaleString() + ' <small>XP</small></div>' +
            '<div class="pg-badges"><span>🔥 ' + streak + ' दिन स्ट्रीक</span><span>📖 आज: ' + todayC + '/' + goal + '</span></div>' +
          '</div>' +
        '</div>' +
      '</section>' +
      '<section class="block card"><div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:12px"><h2 class="h2" style="margin:0">पिछले 7 दिनों की प्रोग्रेस</h2><span class="muted small">आयात / दिन</span></div>' +
        '<div class="pg-chart">' +
        days7.map(d => {
          const hPct = Math.max(8, Math.round((d.cnt / maxDay) * 100));
          return '<div class="pg-col"><span class="pg-val">' + (d.cnt || '') + '</span><div class="pg-bar-wrap"><i style="height:' + hPct + '%" class="' + (d.cnt >= goal ? 'hit' : '') + '"></i></div><span class="pg-day">' + d.lbl + '</span></div>';
        }).join('') +
        '</div>' +
      '</section>' +
      '<section class="block card"><h2 class="h2">विषय अनुसार मास्टरी (Course Progress)</h2>' +
        '<div class="pg-list">' +
        subjects.map(s => '<div class="pg-item"><div class="pg-it-top"><span class="pg-it-ico">' + s.ico + '</span><div style="flex:1;min-width:0"><b>' + esc(s.name) + '</b><div class="muted small">' + esc(s.sub) + '</div></div><a class="btn sm ghost" href="' + s.href + '">खोलें</a></div><div class="pg-pbar"><i style="width:' + s.pct + '%;background:' + s.col + '"></i></div><div class="pg-pct"><span>' + s.pct + '% Mastery</span></div></div>').join('') +
        '</div>' +
      '</section>' +
      badgesHTML +
      '<section class="block card"><div class="stat3"><div><b>' + totalRead + '</b><span>कुल आयात</span></div><div><b>' + revCnt + '</b><span>रिवीज़न लिस्ट</span></div><div><b>' + tasbihTot.toLocaleString() + '</b><span>कुल तस्बीह</span></div></div></section>' +
      '</main>';
  };
})();

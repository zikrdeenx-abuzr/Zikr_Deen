/* Zikr Deen App — Step 1 Features: Home Quick-Actions, Zakat Calculator, Ruqiyah Shariah, XP & Mastery Progress Dashboard */
(function(){'use strict';
const ZD=window.ZD,$=ZD.$,esc=ZD.esc,icon=ZD.icon,R=ZD.R;
const top=(title,sub)=>'<header class="topbar"><button class="ibtn" data-act="back" aria-label="Back">'+icon('back')+'</button><h1>'+esc(title)+(sub?'<span class="sub">'+esc(sub)+'</span>':'')+'</h1></header>';

/* ================= HOME QUICK-ACTIONS BAR (Quran, Zakat, Tasbih, Ruqiyah, Dua) ================= */
ZD.quickBarHTML=function(){
  const items=[
    ['#/surahs','📖','Quran','क़ुरआन'],
    ['#/zakat','💰','Zakat','ज़कात'],
    ['#/tasbih','📿','Zikr','तस्बीह'],
    ['#/ruqiyah','🛡️','Ruqiyah','रुक़याह'],
    ['#/azkaar','🤲','Dua','दुआएँ'],
    ['#/progress','📊','Progress','मास्टरी']
  ];
  return '<section class="block"><div class="qa-bar">'+
    items.map(x=>'<a class="qa-it" href="'+x[0]+'"><span class="qa-ico">'+x[1]+'</span><b>'+x[2]+'</b><small>'+x[3]+'</small></a>').join('')+
  '</div></section>';
};

/* ================= 1. ZAKAT CALCULATOR (#/zakat) ================= */
const ZKEY='zdZakatV1';
function loadZ(){
  try{
    return Object.assign({std:'silver',goldRate:8200,silverRate:98,cash:0,goldG:0,silverG:0,invest:0,business:0,other:0,debt:0},
      JSON.parse(localStorage.getItem(ZKEY)||'{}'));
  }catch(_){
    return {std:'silver',goldRate:8200,silverRate:98,cash:0,goldG:0,silverG:0,invest:0,business:0,other:0,debt:0};
  }
}
function saveZ(d){try{localStorage.setItem(ZKEY,JSON.stringify(d))}catch(_){}}
const fmtINR=n=>'₹'+Math.round(Math.max(0,Number(n)||0)).toLocaleString('en-IN');

R.zakat=function(){
  const st=loadZ();
  const v=$('#view');
  v.innerHTML=top('Zakat Calculator','ज़कात कैलकुलेटर · 2.5% Nisab')+'<main class="zk-wrap">'+
    '<section class="block card zk-hero" id="zkRes"></section>'+
    '<section class="block card"><h2 class="h2">निसाब और आज का रेट (Nisab Standard)</h2>'+
      '<div class="seg" id="zkStd" role="tablist">'+
        '<button type="button" role="tab" data-std="silver" aria-selected="'+(st.std==='silver')+'">चाँदी (612.36g · बेहतर)</button>'+
        '<button type="button" role="tab" data-std="gold" aria-selected="'+(st.std==='gold')+'">सोना (87.48g)</button>'+
      '</div>'+
      '<div class="zk-grid2">'+
        '<label class="zk-f"><span>सोने का रेट (₹ / ग्राम)</span><input type="number" id="zkGR" min="0" step="10" value="'+st.goldRate+'"></label>'+
        '<label class="zk-f"><span>चाँदी का रेट (₹ / ग्राम)</span><input type="number" id="zkSR" min="0" step="1" value="'+st.silverRate+'"></label>'+
      '</div>'+
    '</section>'+
    '<section class="block card"><h2 class="h2">आपकी कुल संपत्ति (Assets)</h2>'+
      '<label class="zk-f"><span>💵 कैश और बैंक बैलेंस (₹)</span><input type="number" id="zkCash" min="0" value="'+(st.cash||'')+'" placeholder="0"></label>'+
      '<div class="zk-grid2">'+
        '<label class="zk-f"><span>🥇 सोना (ग्राम में)</span><input type="number" id="zkGG" min="0" step="0.1" value="'+(st.goldG||'')+'" placeholder="0"></label>'+
        '<label class="zk-f"><span>🥈 चाँदी (ग्राम में)</span><input type="number" id="zkSG" min="0" step="0.1" value="'+(st.silverG||'')+'" placeholder="0"></label>'+
      '</div>'+
      '<label class="zk-f"><span>📈 इन्वेस्टमेंट / शेयर / बचत (₹)</span><input type="number" id="zkInv" min="0" value="'+(st.invest||'')+'" placeholder="0"></label>'+
      '<label class="zk-f"><span>🏪 बिज़नेस का माल / स्टॉक (₹)</span><input type="number" id="zkBiz" min="0" value="'+(st.business||'')+'" placeholder="0"></label>'+
      '<label class="zk-f"><span>🤝 दिया गया क़र्ज़ जो वापस मिलना है (₹)</span><input type="number" id="zkOth" min="0" value="'+(st.other||'')+'" placeholder="0"></label>'+
    '</section>'+
    '<section class="block card"><h2 class="h2">कर्ज़ और देनदारी (Liabilities)</h2>'+
      '<label class="zk-f"><span>➖ आपका बकाया क़र्ज़ / बिल (₹)</span><input type="number" id="zkDebt" min="0" value="'+(st.debt||'')+'" placeholder="0"></label>'+
      '<div style="display:flex;gap:8px;margin-top:12px"><button type="button" class="btn sm ghost" id="zkReset">सब साफ़ करें (Reset)</button></div>'+
    '</section>'+
    '<section class="block card"><p class="muted small" style="margin:0">नोट: ज़कात उस संपत्ति पर फ़र्ज़ होती है जो निसाब के बराबर या उससे ज़्यादा हो और उस पर एक क़मरी साल (हिजरी वर्ष) पूरा हो चुका हो। विशेष मसलों में किसी आलिम से ज़रूर मशवरा करें।</p></section>'+
  '</main>';

  function calc(){
    const goldVal=(Number(st.goldG)||0)*(Number(st.goldRate)||0);
    const silverVal=(Number(st.silverG)||0)*(Number(st.silverRate)||0);
    const totalAssets=(Number(st.cash)||0)+goldVal+silverVal+(Number(st.invest)||0)+(Number(st.business)||0)+(Number(st.other)||0);
    const netWealth=Math.max(0,totalAssets-(Number(st.debt)||0));
    const nisab=st.std==='gold'?(87.48*(Number(st.goldRate)||0)):(612.36*(Number(st.silverRate)||0));
    const due=netWealth>=nisab&&nisab>0;
    const zakatAmt=due?netWealth*0.025:0;
    $('#zkRes').innerHTML=
      '<div class="zk-badge '+(due?'due':'safe')+'">'+(due?'✅ ज़कात फ़र्ज़ है (2.5%)':'ℹ️ निसाब से कम (ज़कात फ़र्ज़ नहीं)')+'</div>'+
      '<div class="zk-amt">'+fmtINR(zakatAmt)+'</div>'+
      '<div class="muted small" style="margin-bottom:12px">कुल अदा की जाने वाली ज़कात</div>'+
      '<div class="stat3">'+
        '<div><b>'+fmtINR(totalAssets)+'</b><span>कुल संपत्ति</span></div>'+
        '<div><b>'+fmtINR(netWealth)+'</b><span>नेट वेल्थ</span></div>'+
        '<div><b>'+fmtINR(nisab)+'</b><span>निसाब ('+(st.std==='gold'?'सोना':'चाँदी')+')</span></div>'+
      '</div>';
  }
  const bind=(id,key)=>{
    const el=$('#'+id);if(!el)return;
    el.addEventListener('input',()=>{st[key]=Math.max(0,parseFloat(el.value)||0);saveZ(st);calc()});
  };
  bind('zkGR','goldRate');bind('zkSR','silverRate');bind('zkCash','cash');
  bind('zkGG','goldG');bind('zkSG','silverG');bind('zkInv','invest');
  bind('zkBiz','business');bind('zkOth','other');bind('zkDebt','debt');

  $('#zkStd').addEventListener('click',e=>{
    const b=e.target.closest('[data-std]');if(!b)return;
    st.std=b.dataset.std;saveZ(st);
    $('#zkStd').querySelectorAll('[data-std]').forEach(x=>x.setAttribute('aria-selected',String(x===b)));
    calc();
  });
  $('#zkReset').addEventListener('click',()=>{
    Object.assign(st,{cash:0,goldG:0,silverG:0,invest:0,business:0,other:0,debt:0});
    saveZ(st);R.zakat();ZD.toast('Zakat calculator reset');
  });
  calc();
};

/* ================= 2. RUQIYAH SHARIAH (#/ruqiyah) ================= */
const RKEY='zdRuqiyahV1';
const RUQIYAH_ITEMS=[
  {id:'fatiha',title:'Surah Al-Fatihah (सूरह अल-फ़ातिहा)',ref:'Al-Fatihah 1:1–7 · Sahih al-Bukhari 5736',rep:3,
   ar:'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ۝ ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ ۝ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ۝ مَٰلِكِ يَوْمِ ٱلدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ ۝ صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ',
   rom:'Bismillahir-Rahmanir-Rahim. Al-hamdu lillahi Rabbil-alamin...',
   hi:'यह सूरह "अश-शिफ़ा" (इलाज और बरकत की सूरह) कहलाती है। बीमार या नज़र-ए-बद के असर पर दम करने के लिए सबसे अफ़ज़ल है।'},
  {id:'kursi',title:'Ayat al-Kursi (आयतुल कुर्सी)',ref:'Al-Baqarah 2:255 · Sahih al-Bukhari 2311',rep:3,
   ar:'ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌۭ وَلَا نَوْمٌۭ ۚ لَّهُۥ مَا فِى ٱلسَّمَٰوَٰتِ وَمَا فِى ٱلْأَرْضِ ۗ مَن ذَا ٱلَّذِى يَشْفَعُ عِندَهُۥٓ إِلَّا بِإِذْنِهِۦ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَىْءٍۢ مِّنْ عِلْمِهِۦٓ إِلَّا بِمَا شَآءَ ۚ وَسِعَ كُرْسِيُّهُ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضَ ۖ وَلَا يَـُٔودُهُۥ حِفْظُهُمَا ۚ وَهُوَ ٱلْعَلِىُّ ٱلْعَظِيمُ',
   rom:'Allahu la ilaha illa Huwal-Hayyul-Qayyum...',
   hi:'अल्लाह के सिवा कोई माबूद नहीं, वह हमेशा ज़िंदा और सबका थामने वाला है। सुबह-शाम और सोने से पहले पढ़ने से शैतान से हिफ़ाज़त रहती है।'},
  {id:'ikhlas',title:'Surah Al-Ikhlas (सूरह अल-इख़लास)',ref:'Al-Ikhlas 112:1–4 · Sahih al-Bukhari 5017',rep:3,
   ar:'قُلْ هُوَ ٱللَّهُ أَحَدٌ ۝ ٱللَّهُ ٱلصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ',
   rom:'Qul Huwallahu Ahad. Allahus-Samad. Lam yalid wa lam yulad. Wa lam yakul-lahu kufuwan ahad.',
   hi:'कह दीजिए कि वह अल्लाह एक है, अल्लाह बेनियाज़ है, न उसकी कोई औलाद है और न वह किसी से पैदा हुआ।'},
  {id:'falaq',title:'Surah Al-Falaq (सूरह अल-फ़लक़)',ref:'Al-Falaq 113:1–5 · Sahih al-Bukhari 5017',rep:3,
   ar:'قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ ٱلنَّفَّٰثَٰتِ فِى ٱلْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
   rom:'Qul a\'udhu bi-Rabbil-falaq, min sharri ma khalaq, wa min sharri ghasiqin idha waqab, wa min sharrin-naffathati fil-uqad, wa min sharri hasidin idha hasad.',
   hi:'मैं सुबह के रब की पनाह माँगता हूँ हर मख़लूक़ के शर से, जादू करने वालों और हसद करने वालों के शर से।'},
  {id:'nas',title:'Surah An-Nas (सूरह अन-नास)',ref:'An-Nas 114:1–6 · Sahih al-Bukhari 5017',rep:3,
   ar:'قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ ۝ مَلِكِ ٱلنَّاسِ ۝ إِلَٰهِ ٱلنَّاسِ ۝ مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ ۝ ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ ۝ مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ',
   rom:'Qul a\'udhu bi-Rabbin-nas, Malikin-nas, Ilahin-nas, min sharril-waswasil-khannas, alladhi yuwaswisu fi sudurin-nas, minal-jinnati wan-nas.',
   hi:'मैं लोगों के रब, बादशाह और माबूद की पनाह माँगता हूँ वसवसा डालने वाले के शर से, चाहे वह जिन्नों में से हो या इंसानों में से।'},
  {id:'jibril',title:'Jibril (AS) ki Ruqiyah Dua',ref:'Sahih Muslim 2186',rep:3,
   ar:'بِسْمِ اللَّهِ أَرْقِيكَ، مِنْ كُلِّ شَيْءٍ يُؤْذِيكَ، مِنْ شَرِّ كُلِّ نَفْسٍ أَوْ عَيْنِ حَاسِدٍ، اللَّهُ يَشْفِيكَ، بِسْمِ اللَّهِ أَرْقِيكَ',
   rom:'Bismillahi arqeeka, min kulli shay\'in yu\'dheeka, min sharri kulli nafsin aw \'ayni hasidin, Allahu yashfeeka, bismillahi arqeeka.',
   hi:'अल्लाह के नाम से मैं तुम पर दम करता हूँ हर तकलीफ़ देने वाली चीज़ और हर हसद करने वाली नज़र के शर से; अल्लाह तुम्हें शिफ़ा दे।'},
  {id:'shifa',title:'Bimari se Shifa ki Dua',ref:'Sahih al-Bukhari 5675',rep:3,
   ar:'اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَاسَ، اشْفِهِ وَأَنْتَ الشَّافِي، لَا شِفَاءَ إِلَّا شِفَاؤُكَ، شِفَاءً لَا يُغَادِرُ سَقَمًا',
   rom:'Allahumma Rabban-nasi adh-hibil-ba\'s, ishfi wa Antash-Shafi, la shifa\'a illa shifa\'uka, shifa\'an la yughadiru saqama.',
   hi:'ऐ अल्लाह, लोगों के रब! तकलीफ़ दूर कर दे और शिफ़ा अता फ़रमा; तू ही शिफ़ा देने वाला है, ऐसी शिफ़ा जो कोई बीमारी न छोड़े।'},
  {id:'hifazat',title:'Nazar aur Har Buraai se Panah',ref:'Sahih al-Bukhari 3371',rep:3,
   ar:'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ، وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ',
   rom:'A\'udhu bi-kalimatillahit-tammati min kulli shaytanin wa hammah, wa min kulli \'aynin lammah.',
   hi:'मैं अल्लाह के मुकम्मल कलिमात की पनाह माँगता हूँ हर शैतान, ज़हरीले जानवर और हर बुरी नज़र से।'}
];

function loadRq(){
  try{
    const d=JSON.parse(localStorage.getItem(RKEY)||'{}');
    if(d.day!==ZD.today())return {day:ZD.today(),c:{},doneDays:Number(d.doneDays)||0};
    return {day:d.day,c:d.c||{},doneDays:Number(d.doneDays)||0};
  }catch(_){return {day:ZD.today(),c:{},doneDays:0}}
}
function saveRq(d){try{localStorage.setItem(RKEY,JSON.stringify(d))}catch(_){}}

R.ruqiyah=function(){
  const st=loadRq();
  const v=$('#view');
  function render(){
    const totalNeed=RUQIYAH_ITEMS.reduce((s,x)=>s+x.rep,0);
    const totalDone=RUQIYAH_ITEMS.reduce((s,x)=>s+Math.min(x.rep,st.c[x.id]||0),0);
    const pct=Math.round((totalDone/totalNeed)*100);
    v.innerHTML=top('Ruqiyah Shariah','रुक़याह · शिफ़ा और हिफ़ाज़त')+'<main class="rq-wrap">'+
      '<section class="block card"><div style="display:flex;justify-content:space-between;align-items:center"><div><b>आज की रुक़याह प्रोग्रेस</b><div class="muted small">'+totalDone+' / '+totalNeed+' बार पढ़ा गया</div></div><button type="button" class="btn sm ghost" id="rqReset">Reset</button></div>'+
      '<div class="bar" style="margin-top:10px"><i style="width:'+pct+'%"></i></div></section>'+
      RUQIYAH_ITEMS.map(x=>{
        const cur=st.c[x.id]||0,done=cur>=x.rep;
        return '<section class="block card rq-card'+(done?' done':'')+'">'+
          '<div class="rq-head"><div><b>'+esc(x.title)+'</b><span class="muted small">'+esc(x.ref)+'</span></div>'+
          '<button type="button" class="rq-cnt'+(done?' done':'')+'" data-rq="'+x.id+'">'+(done?'✓ ':'')+cur+' / '+x.rep+'</button></div>'+
          '<div class="ar-text rq-ar" lang="ar">'+esc(x.ar)+'</div>'+
          '<div class="rq-rom">'+esc(x.rom)+'</div>'+
          '<div class="rq-hi">'+esc(x.hi)+'</div>'+
        '</section>';
      }).join('')+
    '</main>';

    v.querySelectorAll('[data-rq]').forEach(b=>b.addEventListener('click',()=>{
      const id=b.dataset.rq,item=RUQIYAH_ITEMS.find(x=>x.id===id);if(!item)return;
      const prev=st.c[id]||0;
      st.c[id]=prev>=item.rep?0:(prev+1);
      if(navigator.vibrate)navigator.vibrate(st.c[id]>=item.rep?[25,35,25]:12);
      const allDone=RUQIYAH_ITEMS.every(x=>(st.c[x.id]||0)>=x.rep);
      if(allDone&&!st.countedToday){st.doneDays=(st.doneDays||0)+1;st.countedToday=true;ZD.toast('माशाअल्लाह! आज की मुकम्मल रुक़याह पूरी हुई 🤲')}
      saveRq(st);render();
    }));
    const rb=$('#rqReset');
    if(rb)rb.addEventListener('click',()=>{st.c={};saveRq(st);render();ZD.toast('Ruqiyah progress reset')});
  }
  render();
};

/* ================= 3. XP & MASTERY PROGRESS DASHBOARD (#/progress) ================= */
function getTasbihTotal(){
  try{return Number(JSON.parse(localStorage.getItem('zdTasbihV1')||'{}').total)||0}catch(_){return 0}
}
function getRuqiyahCount(){
  try{
    const d=JSON.parse(localStorage.getItem(RKEY)||'{}');
    return Object.values(d.c||{}).reduce((a,b)=>a+(Number(b)||0),0)+(Number(d.doneDays)||0)*24;
  }catch(_){return 0}
}

R.progress=function(){
  const st=ZD.state();
  const totalRead=ZD.totalRead();
  const streak=ZD.streak();
  const todayC=ZD.todayCount();
  const goal=ZD.prefs().goal||3;
  const mulkMem=Object.values(st.mulk.status||{}).filter(x=>x==='memorised').length;
  const mulkLearn=Object.values(st.mulk.status||{}).filter(x=>x==='learning'||x==='needs-revision').length;
  const tasbihTot=getTasbihTotal();
  const rqCnt=getRuqiyahCount();
  const bms=(st.bookmarks||[]).length;
  const revCnt=(st.rev||[]).length;

  // Compute XP and Level
  const s2=ZD.step2Stats?ZD.step2Stats():{xp:0,pct:0,kmDone:0,kmTotal:8,salahWins:0,spotCorrect:0};
  const xp=totalRead*15 + mulkMem*60 + mulkLearn*15 + streak*50 + Math.floor(tasbihTot/3) + rqCnt*8 + bms*5 + s2.xp;
  const level=Math.floor(xp/500)+1;
  const ranks=['नया मुसाफ़िर','तालिब-ए-इल्म','क़ारी (Learner)','हाफ़िज़ पाथ','मुत्तक़ी स्कॉलर','ज़िक्र-दीन मास्टर'];
  const rankName=ranks[Math.min(ranks.length-1,Math.floor((level-1)/2))];

  // Subject Masteries (0..100%)
  const qMastery=Math.min(100,Math.max(totalRead>0?5:0,Math.round((totalRead/100)*100)));
  const mMastery=Math.round((mulkMem/30)*100);
  const tMastery=Math.min(100,Math.round((tasbihTot/500)*100));
  const rMastery=Math.min(100,Math.round((rqCnt/24)*100));
  const gMastery=Math.min(100,Math.round((todayC/goal)*100));
  const overall=Math.round((qMastery+mMastery+tMastery+rMastery+gMastery)/5);

  // Last 7 days bar chart data
  const today=ZD.today(),days7=[];
  const dayNames=['रवि','सोम','मंगल','बुध','गुरु','शुक्र','शनि'];
  for(let i=6;i>=0;i--){
    const iso=ZD.addDays(today,-i);
    const cnt=(st.log[iso]||[]).length;
    const dt=new Date(iso+'T12:00:00');
    days7.push({iso,lbl:dayNames[dt.getDay()],cnt});
  }
  const maxDay=Math.max(goal, ...days7.map(d=>d.cnt), 1);

  const subjects=[
    {ico:'📖',name:'Quran Reading',sub:totalRead+' आयात पढ़ीं · '+bms+' सेव्ड',pct:qMastery,href:'#/surahs',col:'#22c55e'},
    {ico:'🌙',name:'Surah Al-Mulk Hifz',sub:mulkMem+' / 30 आयात हिफ़्ज़',pct:mMastery,href:'#/mulk',col:'#eab308'},
    {ico:'📿',name:'Zikr & Tasbih',sub:tasbihTot.toLocaleString()+' कुल ज़िक्र',pct:tMastery,href:'#/tasbih',col:'#06b6d4'},
    {ico:'🛡️',name:'Ruqiyah & Azkaar',sub:'आज की हिफ़ाज़त और दुआएँ',pct:rMastery,href:'#/ruqiyah',col:'#a855f7'},
    {ico:'🕌',name:'3D Namaz & Salah Builder',sub:'जीते राउंड: '+s2.salahWins+' · गलती पहचानें: '+s2.spotCorrect+' सही',pct:s2.pct,href:'#/namaz3d',col:'#f97316'},{ico:'🌌',name:'Islamic Knowledge Star Map',sub:s2.kmDone+' / '+s2.kmTotal+' विषय मास्टर्ड',pct:Math.round((s2.kmDone/s2.kmTotal)*100),href:'#/knowledge-map',col:'#38bdf8'}
  ];


  const vaDone = (function(){ try{ return JSON.parse(localStorage.getItem('zdVaStats_v1')||'{}'); }catch(_){ return {}; } })();
  const masteryBadges=[
    {id:'silsila',img:'./img/visuals/badge-silsila.webp',name:'इब्तिदाई सिलसिला',ok:totalRead>=3||streak>=1,st:(totalRead>=3||streak>=1)?'अनलॉक्ड ✓':'3 आयत पढ़ें'},
    {id:'hifz',img:'./img/visuals/badge-hifz.webp',name:'क़ुरआन हिफ़्ज़ स्टार',ok:mulkMem>=1||revCnt>=1,st:mulkMem>0?(mulkMem+'/30 हिफ़्ज़'):'अल-मुल्क शुरू करें'},
    {id:'feynman',img:'./img/visuals/badge-feynman.webp',name:'Feynman मास्टर',ok:(s2.kmDone||0)>=1||(vaDone.science||0)>=1,st:(s2.kmDone||0)>=1?'अनलॉक्ड ✓':'विज़ुअल एकेडमी'},
    {id:'math',img:'./img/visuals/badge-math.webp',name:'मैथ्स व लॉजिक',ok:(s2.spotCorrect||0)>=1||(vaDone.science||0)>=2,st:(s2.spotCorrect||0)>=1?'अनलॉक्ड ✓':'क्विज़ / लैब'},
    {id:'ethics',img:'./img/visuals/badge-ethics.webp',name:'Ethics व अख़लाक़',ok:(vaDone.ethics||0)>=1||rqCnt>=1,st:(vaDone.ethics||0)>=1?'अनलॉक्ड ✓':'Ethics चुनौती'},
    {id:'arabic',img:'./img/visuals/badge-arabic.webp',name:'Arabic Root मास्टर',ok:(vaDone.roots||0)>=1||tasbihTot>=33,st:(vaDone.roots||0)>=1?'अनलॉक्ड ✓':'रूट-ट्री देखें'}
  ];
  const badgesHTML='<section class="block card"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><h2 class="h2" style="margin:0">🏆 3D मास्टरी बैजेज़</h2><a class="btn sm ghost" href="#/visual-academy">Visual Academy</a></div>'+
    '<div class="zd-badge-grid">'+
      masteryBadges.map(b=>'<a class="zd-badge-card'+(b.ok?'':' locked')+'" href="#/visual-academy" data-glow="1" style="text-decoration:none">'+
        '<img src="'+b.img+'" alt="'+esc(b.name)+'" loading="lazy">'+
        '<b>'+esc(b.name)+'</b><small>'+esc(b.st)+'</small></a>').join('')+
    '</div></section>';

  const v=$('#view');
  v.innerHTML=top('Progress & Mastery','XP डैशबोर्ड · आपकी इबादत और लर्निंग रिपोर्ट')+'<main class="pg-wrap">'+
    '<section class="block card pg-hero">'+
      '<div class="pg-ring-box">'+
        '<div class="pg-ring" style="--p:'+overall+'"><div><b>'+overall+'%</b><span>MASTERY</span></div></div>'+
        '<div class="pg-meta">'+
          '<div class="pg-lvl">LEVEL '+level+' · '+esc(rankName)+'</div>'+
          '<div class="pg-xp">'+xp.toLocaleString()+' <small>XP</small></div>'+
          '<div class="pg-badges"><span>🔥 '+streak+' दिन स्ट्रीक</span><span>📖 आज: '+todayC+'/'+goal+'</span></div>'+
        '</div>'+
      '</div>'+
    '</section>'+
    '<section class="block card"><div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:12px"><h2 class="h2" style="margin:0">पिछले 7 दिनों की प्रोग्रेस</h2><span class="muted small">आयात / दिन</span></div>'+
      '<div class="pg-chart">'+
        days7.map(d=>{
          const hPct=Math.max(8,Math.round((d.cnt/maxDay)*100));
          return '<div class="pg-col"><span class="pg-val">'+(d.cnt||'')+'</span><div class="pg-bar-wrap"><i style="height:'+hPct+'%" class="'+(d.cnt>=goal?'hit':'')+'"></i></div><span class="pg-day">'+d.lbl+'</span></div>';
        }).join('')+
      '</div>'+
    '</section>'+
    '<section class="block card"><h2 class="h2">विषय अनुसार मास्टरी (Course Progress)</h2>'+
      '<div class="pg-list">'+
        subjects.map(s=>'<div class="pg-item"><div class="pg-it-top"><span class="pg-it-ico">'+s.ico+'</span><div style="flex:1;min-width:0"><b>'+esc(s.name)+'</b><div class="muted small">'+esc(s.sub)+'</div></div><a class="btn sm ghost" href="'+s.href+'">खोलें</a></div><div class="pg-pbar"><i style="width:'+s.pct+'%;background:'+s.col+'"></i></div><div class="pg-pct"><span>'+s.pct+'% Mastery</span></div></div>').join('')+
      '</div>'+
    '</section>'+
    badgesHTML+
    '<section class="block card"><div class="stat3"><div><b>'+totalRead+'</b><span>कुल आयात</span></div><div><b>'+revCnt+'</b><span>रिवीज़न लिस्ट</span></div><div><b>'+tasbihTot.toLocaleString()+'</b><span>कुल तस्बीह</span></div></div></section>'+
  '</main>';
};
})();

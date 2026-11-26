/* Zikr Deen App — Step 2 Interactive Islamic Learning Hub:
   1. 3D Namaz 2x2 Card Grid (#/namaz3d)
   2. Build Your Own Salah Sequence Game (#/salah-builder)
   3. Spot the Mistake — Adaptive 3D Namaz Quiz (#/spot-mistake)
   4. Islamic Knowledge Map — Interactive Star Map (#/knowledge-map)
*/
(function(){'use strict';
const ZD=window.ZD,$=ZD.$,esc=ZD.esc,icon=ZD.icon,R=ZD.R;
const top=(title,sub,right)=>'<header class="topbar"><button class="ibtn" data-act="back" aria-label="Back">'+icon('back')+'</button><h1>'+esc(title)+(sub?'<span class="sub">'+esc(sub)+'</span>':'')+'</h1>'+(right||'')+'</header>';

/* ================= 1. 3D NAMAZ LEARNING GRID (#/namaz3d) ================= */
R.namaz3d=function(){
  const main4=[
    {num:'01',name:'Qiyam',hi:'खड़े होकर नमाज़ पढ़ने और हाथ बाँधने की सही पोज़िशन।',img:'./assets/namaz3d/s2/00.webp',step:2},
    {num:'02',name:'Ruku',hi:'रुकू में पीठ सीधी रखने और घुटनों पर हाथ रखने की सही पोज़िशन।',img:'./assets/namaz3d/s3/08.webp',step:3},
    {num:'03',name:'Sujood',hi:'सात अंगों पर सजदे की सही पोज़िशन और कोहनियों की स्थिति।',img:'./assets/namaz3d/s5/10.webp',step:5},
    {num:'04',name:'Tashahhud',hi:'क़अदा / तशह्हुद में बैठकर पढ़ने और पैरों की सही पोज़िशन।',img:'./assets/namaz3d/s6/08.webp',step:7}
  ];
  const allSteps=[
    {num:'01',name:'Qiyam & Niyyat',img:'./assets/namaz3d/s0/00.webp',step:0},
    {num:'02',name:'Takbeer-e-Tahreema',img:'./assets/namaz3d/s1/00.webp',step:1},
    {num:'03',name:'Haath Bandhna',img:'./assets/namaz3d/s2/00.webp',step:2},
    {num:'04',name:'Ruku',img:'./assets/namaz3d/s3/08.webp',step:3},
    {num:'05',name:'Qauma (Uthna)',img:'./assets/namaz3d/s4/00.webp',step:4},
    {num:'06',name:'Sajda',img:'./assets/namaz3d/s5/10.webp',step:5},
    {num:'07',name:'Jalsa & Tashahhud',img:'./assets/namaz3d/s6/08.webp',step:6},
    {num:'08',name:'Salam Pherna',img:'./assets/namaz3d/s7/00.webp',step:8}
  ];
  $('#view').innerHTML=top('3D Namaz Learning','360° घुमाकर सही नमाज़ सीखें')+'<main class="lh-wrap">'+
    '<section class="block card lh-banner">'+
      '<div><b>360° इंटरैक्टिव 3D नमाज़ गाइड</b><div class="muted small">किसी भी पोज़िशन पर टैप करें और उँगली से 360° घुमाकर दुआ, ऑडियो व हदीस दलील के साथ सीखें।</div></div>'+
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">'+
        '<a class="btn sm" href="./namaz-3d.html?step=9">▶ पूरी नमाज़ वीडियो</a>'+'<a class="btn sm" href="#/ar-mode">📷 AR Camera Mode</a>'+
        '<a class="btn sm ghost" href="#/salah-builder">🧩 नमाज़ खुद बनाएँ</a>'+
        '<a class="btn sm ghost" href="#/spot-mistake">🔎 गलती पहचानें</a>'+
      '</div>'+
    '</section>'+
    '<section class="block"><h2 class="h2">मुख्य 4 पोज़िशन (3D View)</h2>'+
      '<div class="n3-grid">'+
        main4.map(c=>'<a class="n3-card" href="./namaz-3d.html?step='+c.step+'"><div class="n3-img"><img src="'+c.img+'" alt="'+esc(c.name)+'" loading="lazy"><span class="n3-badge">360°</span></div><div class="n3-body"><b>'+c.num+'. '+esc(c.name)+'</b><p>'+esc(c.hi)+'</p></div></a>').join('')+
      '</div>'+
    '</section>'+
    '<section class="block card"><h2 class="h2">सभी 8 स्टेप्स (सीधे 3D व्यूअर खोलें)</h2>'+
      '<div class="n3-mini-grid">'+
        allSteps.map(s=>'<a class="n3-mini" href="./namaz-3d.html?step='+s.step+'"><img src="'+s.img+'" alt="'+esc(s.name)+'" loading="lazy"><span>'+s.num+'. '+esc(s.name)+'</span></a>').join('')+
      '</div>'+
    '</section>'+
  '</main>';
};

/* ================= 2. BUILD YOUR OWN SALAH (#/salah-builder) ================= */
const SB_KEY='zdSalahBuildV1';
const SALAH_STEPS_7=[
  {id:'takbeer',name:'1. तकबीर (Takbeer-e-Tahreema)',sub:'अल्लाहु अकबर कहकर हाथ उठाना',img:'./assets/namaz3d/s1/00.webp'},
  {id:'qiyam',name:'2. क़ियाम (Qiyam & Qira\'at)',sub:'हाथ बाँधकर सना, सूरह फ़ातिहा व सूरह पढ़ना',img:'./assets/namaz3d/s2/00.webp'},
  {id:'ruku',name:'3. रुकू (Ruku)',sub:'पीठ सीधी करके झुकना और तस्बीह पढ़ना',img:'./assets/namaz3d/s3/08.webp'},
  {id:'qauma',name:'4. क़ौमा (Qauma)',sub:'रुकू से सीधा खड़े होकर समीअल्लाहु लिमन हमिदह कहना',img:'./assets/namaz3d/s4/00.webp'},
  {id:'sajda1',name:'5. पहला सजदा (Sajda)',sub:'सात अंगों पर इत्मीनान से सजदा करना',img:'./assets/namaz3d/s5/10.webp'},
  {id:'jalsa',name:'6. जलसा (Jalsa)',sub:'दो सजदों के बीच बैठना और रब्बिग़फ़िरली पढ़ना',img:'./assets/namaz3d/s6/08.webp'},
  {id:'sajda2',name:'7. दूसरा सजदा / अगली रकअत',sub:'दूसरा सजदा करके अगली रकअत के लिए उठना',img:'./assets/namaz3d/s5/10.webp'}
];
const SALAH_STEPS_FULL=SALAH_STEPS_7.concat([
  {id:'tashahhud',name:'8. तशह्हुद और दुरूद (Qa\'dah)',sub:'अत्तहिय्यात, दुरूद शरीफ़ और दुआ पढ़ना',img:'./assets/namaz3d/s6/00.webp'},
  {id:'salam',name:'9. सलाम फेरना (Salam)',sub:'दाएँ और बाएँ अस्सलामु अलैकुम व रहमतुल्लाह कहना',img:'./assets/namaz3d/s7/00.webp'}
]);

function loadSB(){try{return Object.assign({wins:0,bestAcc:0,xp:0},JSON.parse(localStorage.getItem(SB_KEY)||'{}'))}catch(_){return {wins:0,bestAcc:0,xp:0}}}
function saveSB(d){try{localStorage.setItem(SB_KEY,JSON.stringify(d))}catch(_){}}
function shuffleArr(a){const b=a.slice();for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b}

R['salah-builder']=function(){
  const stat=loadSB();
  let mode='rakat1';
  let target=SALAH_STEPS_7;
  let pool=[],placed=[],checked=false,dragIdx=-1;

  function resetRound(){
    target=mode==='full'?SALAH_STEPS_FULL:SALAH_STEPS_7;
    pool=shuffleArr(target.map(x=>x.id));
    if(pool.every((id,i)=>id===target[i].id))pool.reverse();
    placed=[];checked=false;render();
  }
  const byId=id=>target.find(x=>x.id===id);

  function render(){
    const v=$('#view');
    const correctCount=checked?placed.filter((id,i)=>target[i]&&id===target[i].id).length:0;
    const allRight=checked&&placed.length===target.length&&correctCount===target.length;

    v.innerHTML=top('Build Your Own Salah','नमाज़ के स्टेप्स सही क्रम में लगाएँ')+'<main class="lh-wrap">'+
      '<section class="block card">'+
        '<div class="seg" id="sbMode" role="tablist">'+
          '<button type="button" role="tab" data-m="rakat1" aria-selected="'+(mode==='rakat1')+'">1 रकअत (7 स्टेप्स)</button>'+
          '<button type="button" role="tab" data-m="full" aria-selected="'+(mode==='full')+'">पूरी नमाज़ (9 स्टेप्स)</button>'+
        '</div>'+
        '<div class="sb-meta"><span>🏆 जीते हुए राउंड: <b>'+stat.wins+'</b></span><span>⭐ XP: <b>'+stat.xp+'</b></span></div>'+
      '</section>'+
      (checked?'<section class="block card '+(allRight?'sb-win':'sb-try')+'"><b>'+(allRight?'🎉 माशाअल्लाह! बिल्कुल सही क्रम (+50 XP)':'ℹ️ '+correctCount+' / '+target.length+' स्टेप्स सही जगह पर हैं')+'</b><div class="muted small" style="margin-top:4px">'+(allRight?'आपने नमाज़ का सही क्रम पूरी तरह याद कर लिया है।':'लाल रंग वाले स्टेप्स को ↑↓ बटन या टैप करके सही जगह पर ले जाएँ।')+'</div></section>':'')+
      '<section class="block card">'+
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><h2 class="h2" style="margin:0">आपका क्रम ('+placed.length+'/'+target.length+')</h2><button type="button" class="btn sm ghost" id="sbHint">💡 Hint</button></div>'+
        (placed.length?
          '<div class="sb-slots" id="sbSlots">'+
          placed.map((id,i)=>{
            const it=byId(id),ok=checked&&target[i]&&id===target[i].id,bad=checked&&!ok;
            return '<div class="sb-item'+(ok?' ok':'')+(bad?' bad':'')+'" draggable="true" data-slot="'+i+'">'+
              '<span class="sb-num">'+(i+1)+'</span>'+
              '<img src="'+it.img+'" alt="">'+
              '<div class="sb-txt"><b>'+esc(it.name.replace(/^\d+\.\s*/,''))+'</b><span>'+esc(it.sub)+'</span></div>'+
              '<div class="sb-mv">'+
                '<button type="button" data-up="'+i+'"'+(i===0?' disabled':'')+' aria-label="Up">↑</button>'+
                '<button type="button" data-dn="'+i+'"'+(i===placed.length-1?' disabled':'')+' aria-label="Down">↓</button>'+
                '<button type="button" data-rm="'+i+'" aria-label="Remove">✕</button>'+
              '</div></div>';
          }).join('')+'</div>'
          :'<div class="sb-empty">नीचे दिए गए स्टेप्स पर टैप करें — वे यहाँ सही क्रम में जुड़ते जाएँगे।</div>')+
        '<div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">'+
          '<button type="button" class="btn" id="sbCheck" style="flex:1"'+(placed.length<target.length?' disabled':'')+'>✓ क्रम चेक करें</button>'+
          '<button type="button" class="btn ghost" id="sbReset">↻ नया राउंड</button>'+
        '</div>'+
      '</section>'+
      (pool.length?'<section class="block card"><h2 class="h2">बाकी स्टेप्स (टैप करके जोड़ें)</h2><div class="sb-pool" id="sbPool">'+
        pool.map(id=>{
          const it=byId(id);
          return '<button type="button" class="sb-chip" data-add="'+id+'"><img src="'+it.img+'" alt=""><span><b>'+esc(it.name.replace(/^\d+\.\s*/,''))+'</b><small>'+esc(it.sub)+'</small></span></button>';
        }).join('')+'</div></section>':'')+
    '</main>';

    $('#sbMode').addEventListener('click',e=>{
      const b=e.target.closest('[data-m]');if(!b||b.dataset.m===mode)return;
      mode=b.dataset.m;resetRound();
    });
    const poolEl=$('#sbPool');
    if(poolEl)poolEl.addEventListener('click',e=>{
      const b=e.target.closest('[data-add]');if(!b)return;
      const id=b.dataset.add;
      pool=pool.filter(x=>x!==id);placed.push(id);checked=false;render();
    });
    const slotsEl=$('#sbSlots');
    if(slotsEl){
      slotsEl.addEventListener('click',e=>{
        const up=e.target.closest('[data-up]'),dn=e.target.closest('[data-dn]'),rm=e.target.closest('[data-rm]');
        if(up){const i=+up.dataset.up;if(i>0){[placed[i-1],placed[i]]=[placed[i],placed[i-1]];checked=false;render()}}
        else if(dn){const i=+dn.dataset.dn;if(i<placed.length-1){[placed[i+1],placed[i]]=[placed[i],placed[i+1]];checked=false;render()}}
        else if(rm){const i=+rm.dataset.rm;const [id]=placed.splice(i,1);pool.push(id);checked=false;render()}
      });
      slotsEl.addEventListener('dragstart',e=>{const it=e.target.closest('[data-slot]');if(it)dragIdx=+it.dataset.slot});
      slotsEl.addEventListener('dragover',e=>{e.preventDefault()});
      slotsEl.addEventListener('drop',e=>{
        e.preventDefault();const it=e.target.closest('[data-slot]');if(!it||dragIdx<0)return;
        const to=+it.dataset.slot;if(to===dragIdx)return;
        const [mv]=placed.splice(dragIdx,1);placed.splice(to,0,mv);dragIdx=-1;checked=false;render();
      });
    }
    $('#sbHint').addEventListener('click',()=>{
      const nextIdx=placed.length;
      if(nextIdx<target.length){
        const want=target[nextIdx];
        ZD.toast('अगला सही स्टेप: '+want.name);
      }else{
        const badIdx=placed.findIndex((id,i)=>id!==target[i].id);
        if(badIdx>=0)ZD.toast('नंबर '+(badIdx+1)+' पर होना चाहिए: '+target[badIdx].name);
        else ZD.toast('सभी स्टेप्स सही क्रम में हैं! चेक बटन दबाएँ।');
      }
    });
    $('#sbCheck').addEventListener('click',()=>{
      checked=true;
      const okN=placed.filter((id,i)=>id===target[i].id).length;
      const acc=Math.round((okN/target.length)*100);
      if(acc>stat.bestAcc)stat.bestAcc=acc;
      if(okN===target.length){stat.wins++;stat.xp+=50;ZD.toast('माशाअल्लाह! +50 XP मिले 🎉')}
      saveSB(stat);render();
    });
    $('#sbReset').addEventListener('click',resetRound);
  }
  resetRound();
};

/* ================= 3. SPOT THE MISTAKE — ADAPTIVE 3D NAMAZ QUIZ (#/spot-mistake) ================= */
const SM_KEY='zdSpotMistakeV1';
const MISTAKE_QS=[
  {id:'ruku_back',topic:'Ruku',img:'./assets/namaz3d/s3/08.webp',step:3,
   scen:'एक नमाज़ी रुकू में झुका है, लेकिन उसकी पीठ गोल (कूबड़ जैसी) है और सिर ऊपर उठा हुआ है।',
   q:'इस रुकू में क्या गलती है?',
   opts:['पीठ बिल्कुल सीधी (90°) और सिर पीठ के बराबर होना चाहिए','हाथ घुटनों से नीचे टखनों पर होने चाहिए','रुकू में आँखें बंद रखना फ़र्ज़ है','कोई गलती नहीं है'],
   ans:0,
   exp:'सही तरीका: रुकू में हाथ घुटनों पर हों, पीठ बिल्कुल सीधी हो और सिर न ऊपर उठा हो न नीचे झुका हो।',
   ref:'Sahih al-Bukhari 828 · Sahih Muslim 498'},
  {id:'sajda_elbows',topic:'Sajda',img:'./assets/namaz3d/s5/10.webp',step:5,
   scen:'सजदे की हालत में नमाज़ी ने अपनी दोनों कोहनियाँ ज़मीन पर बिछा दी हैं और पेट जाँघों से चिपका लिया है।',
   q:'सजदे में यह कौन-सी आम गलती है?',
   opts:['कोहनियाँ ज़मीन से उठी और बाज़ू बगल से अलग रखने चाहिए','सजदे में सिर्फ़ माथा ज़मीन पर रखना काफ़ी है, नाक नहीं','पैरों की उँगलियाँ पीछे की तरफ़ होनी चाहिए','हाथ सिर के ऊपर होने चाहिए'],
   ans:0,
   exp:'हदीस में सजदे के दौरान कोहनियाँ ज़मीन पर बिछाने से मना किया गया है। कोहनियाँ उठी हुई और बाज़ू शरीर से अलग होने चाहिए।',
   ref:'Sahih al-Bukhari 390, 828 · Sahih Muslim 493'},
  {id:'sajda_7bones',topic:'Sajda',img:'./assets/namaz3d/s5/00.webp',step:5,
   scen:'सजदे में नमाज़ी का माथा ज़मीन पर है, लेकिन नाक और दोनों पैरों की उँगलियाँ ज़मीन से उठी हुई हैं।',
   q:'सजदे के कितने अंगों का ज़मीन से लगना ज़रूरी है?',
   opts:['सिर्फ़ 3 अंग (माथा और दोनों हाथ)','7 अंग: माथा+नाक, दोनों हथेलियाँ, दोनों घुटने, दोनों पैरों की उँगलियाँ','सिर्फ़ माथा और घुटने','5 अंग (नाक ज़रूरी नहीं)'],
   ans:1,
   exp:'नबी ﷺ ने फ़रमाया कि हमें 7 हड्डियों (अंगों) पर सजदा करने का हुक्म दिया गया है: पेशानी व नाक, दोनों हथेलियाँ, दोनों घुटने और दोनों पैरों की उँगलियाँ।',
   ref:'Sahih al-Bukhari 812, 815 · Sahih Muslim 490'},
  {id:'qauma_rush',topic:'Qauma',img:'./assets/namaz3d/s4/00.webp',step:4,
   scen:'नमाज़ी रुकू से आधा उठते ही बिना सीधा खड़े हुए तुरंत सजदे में चला गया।',
   q:'रुकू से उठने (क़ौमा) में यहाँ क्या गलती हुई?',
   opts:['रुकू के बाद सीधा खड़ा होना ज़रूरी नहीं','पूरी तरह सीधा खड़े होकर इत्मीनान से हर हड्डी के अपनी जगह आने तक रुकना ज़रूरी है','क़ौमा में सूरह फ़ातिहा दोबारा पढ़नी होती है','रुकू से उठकर सीधे बैठ जाना चाहिए'],
   ans:1,
   exp:'हदीस में है कि रुकू से उठकर इतना सीधा खड़ा हो कि हर हड्डी अपनी जगह लौट आए (इत्मीनान ज़रूरी है)।',
   ref:'Sahih al-Bukhari 757, 828 · Abu Dawud 730'},
  {id:'jalsa_feet',topic:'Jalsa',img:'./assets/namaz3d/s6/08.webp',step:6,
   scen:'दो सजदों के बीच (जलसा) में नमाज़ी बिना एक पल रुके तुरंत दूसरे सजदे में गिर पड़ा।',
   q:'दो सजदों के बीच जलसा का सही तरीका क्या है?',
   opts:['दोनों सजदे मिलाकर एक ही बार में करने चाहिए','बायाँ पैर बिछाकर उस पर इत्मीनान से बैठें, दायाँ पैर खड़ा रखें और "रब्बिग़फ़िरली" पढ़ें','जलसे में खड़े होकर दुआ माँगनी चाहिए','जलसे में सलाम फेरना चाहिए'],
   ans:1,
   exp:'दो सजदों के बीच इत्मीनान से बैठना (जलसा) नमाज़ का अहम हिस्सा है, जिसमें बायाँ पैर बिछाया जाता है और दायाँ पैर खड़ा रखा जाता है।',
   ref:'Sahih al-Bukhari 757, 828 · Sunan an-Nasa\'i 1158'},
  {id:'qiyam_hands',topic:'Qiyam',img:'./assets/namaz3d/s2/00.webp',step:2,
   scen:'क़ियाम में नमाज़ी ने बायाँ हाथ दाएँ हाथ के ऊपर बाँध लिया है।',
   q:'हाथ बाँधने का सुन्नत तरीका क्या है?',
   opts:['दायाँ हाथ हमेशा बाएँ हाथ/कलाई/बाज़ू के ऊपर रखा जाता है','बायाँ हाथ दाएँ पर रखना सुन्नत है','दोनों हाथ पीछे बाँधने चाहिए','हाथ चेहरे के सामने रखने चाहिए'],
   ans:0,
   exp:'सहीह बुख़ारी (740) के अनुसार लोगों को हुक्म दिया जाता था कि नमाज़ में दायाँ हाथ बाएँ बाज़ू/कलाई पर रखें।',
   ref:'Sahih al-Bukhari 740 · Abu Dawud 726, 727'},
  {id:'takbeer_hands',topic:'Takbeer',img:'./assets/namaz3d/s1/00.webp',step:1,
   scen:'नमाज़ी ने तकबीर-ए-तहरीमा के वक़्त हथेलियाँ अपनी तरफ़ घुमा लीं और बहुत नीचे पेट के पास रखीं।',
   q:'तकबीर-ए-तहरीमा में हाथों की सही स्थिति क्या है?',
   opts:['हथेलियाँ क़िबला की तरफ़ हों और हाथ कंधों या कानों के बराबर उठाएँ','हाथ सिर के ऊपर जोड़ लें','हथेलियाँ ज़मीन की तरफ़ हों','हाथ उठाना मना है'],
   ans:0,
   exp:'हदीसों में दोनों रिवायतें आती हैं कि तकबीर कहते वक़्त हाथ कंधों तक या कानों की लौ तक उठाएँ और हथेलियाँ क़िबला रुख़ हों।',
   ref:'Sahih al-Bukhari 735 · Sahih Muslim 390, 391'},
  {id:'salam_turn',topic:'Salam',img:'./assets/namaz3d/s7/00.webp',step:8,
   scen:'नमाज़ ख़त्म करते समय नमाज़ी ने बिना गर्दन घुमाए सिर्फ़ सामने देखकर सलाम कह दिया।',
   q:'सलाम फेरने का सुन्नत तरीका क्या है?',
   opts:['पहले दाएँ और फिर बाएँ इतनी गर्दन घुमाएँ कि पीछे से गाल की सफ़ेदी दिखे','सिर्फ़ ऊपर देखकर सलाम कहें','पहले बाएँ फिर दाएँ सलाम फेरें','सलाम के वक़्त खड़ा हो जाना चाहिए'],
   ans:0,
   exp:'नबी ﷺ पहले दाएँ और फिर बाएँ सलाम फेरते थे और इतना घूमते कि आपके रुख़सार (गाल) की सफ़ेदी दिखाई देती थी।',
   ref:'Sahih Muslim 582 · Abu Dawud 996'}
];

function loadSM(){try{return Object.assign({solved:0,correct:0,xp:0,wrong:{}},JSON.parse(localStorage.getItem(SM_KEY)||'{}'))}catch(_){return {solved:0,correct:0,xp:0,wrong:{}}}}
function saveSM(d){try{localStorage.setItem(SM_KEY,JSON.stringify(d))}catch(_){}}

R['spot-mistake']=function(){
  const stat=loadSM();
  // Adaptive queue: prioritize previously missed questions first!
  let queue=MISTAKE_QS.slice().sort((a,b)=>(stat.wrong[b.id]||0)-(stat.wrong[a.id]||0));
  let qi=0,picked=-1;

  function render(){
    const v=$('#view');
    const q=queue[qi];
    const weakCnt=Object.values(stat.wrong||{}).filter(x=>x>0).length;
    const isAdaptive=(stat.wrong[q.id]||0)>0;

    v.innerHTML=top('Spot the Mistake','3D नमाज़ में गलती पहचानें (Adaptive Quiz)')+'<main class="lh-wrap">'+
      '<section class="block card sm-head-bar">'+
        '<span>सवाल <b>'+(qi+1)+' / '+queue.length+'</b></span>'+
        '<span>🎯 सही: <b>'+stat.correct+'/'+stat.solved+'</b></span>'+
        '<span>⭐ XP: <b>'+stat.xp+'</b></span>'+
      '</section>'+
      '<section class="block card sm-card">'+
        (isAdaptive?'<div class="sm-adapt">🔁 पिछली गलती के आधार पर रिविज़न सवाल</div>':'')+
        '<div class="sm-visual">'+
          '<img src="'+q.img+'" alt="'+esc(q.topic)+'">'+
          '<a class="sm-3d-btn" href="./namaz-3d.html?step='+q.step+'">🔄 360° देखें</a>'+
        '</div>'+
        '<div class="sm-scen"><b>स्थिति:</b> '+esc(q.scen)+'</div>'+
        '<h2 class="h2" style="margin:10px 0">'+esc(q.q)+'</h2>'+
        '<div class="sm-opts" id="smOpts">'+
          q.opts.map((o,i)=>{
            let cls='sm-opt';
            if(picked>=0){
              if(i===q.ans)cls+=' ok';
              else if(i===picked)cls+=' bad';
            }
            return '<button type="button" class="'+cls+'" data-opt="'+i+'"'+(picked>=0?' disabled':'')+'><span>'+String.fromCharCode(65+i)+'</span><p>'+esc(o)+'</p></button>';
          }).join('')+
        '</div>'+
        (picked>=0?'<div class="sm-exp '+(picked===q.ans?'ok':'bad')+'">'+
          '<b>'+(picked===q.ans?'✅ बिल्कुल सही जवाब! (+25 XP)':'❌ सही जवाब: '+esc(q.opts[q.ans]))+'</b>'+
          '<p>'+esc(q.exp)+'</p>'+
          '<small class="muted">📚 दलील: '+esc(q.ref)+'</small>'+
        '</div>'+
        '<div style="display:flex;gap:8px;margin-top:12px">'+
          '<button type="button" class="btn" id="smNext" style="flex:1">'+(qi<queue.length-1?'अगला सवाल →':'नया Adaptive राउंड शुरू करें ↻')+'</button>'+
        '</div>':'')+
      '</section>'+
      (weakCnt?'<p class="muted small" style="text-align:center;margin:8px 0">Adaptive सिस्टम आपके '+weakCnt+' कमज़ोर टॉपिक्स को अगले राउंड में पहले दिखाएगा।</p>':'')+
    '</main>';

    const optsEl=$('#smOpts');
    if(optsEl&&picked<0){
      optsEl.addEventListener('click',e=>{
        const b=e.target.closest('[data-opt]');if(!b)return;
        picked=+b.dataset.opt;
        stat.solved++;
        if(picked===q.ans){
          stat.correct++;stat.xp+=25;
          if(stat.wrong[q.id])stat.wrong[q.id]=Math.max(0,stat.wrong[q.id]-1);
          ZD.toast('सही जवाब! +25 XP ✅');
        }else{
          stat.wrong[q.id]=(stat.wrong[q.id]||0)+2;
          ZD.toast('सही स्पष्टीकरण नीचे पढ़ें');
        }
        saveSM(stat);render();
      });
    }
    const nxt=$('#smNext');
    if(nxt)nxt.addEventListener('click',()=>{
      picked=-1;
      if(qi<queue.length-1){qi++;render()}
      else{
        queue=MISTAKE_QS.slice().sort((a,b)=>(stat.wrong[b.id]||0)-(stat.wrong[a.id]||0)||(Math.random()-.5));
        qi=0;render();ZD.toast('नया Adaptive राउंड शुरू हुआ');
      }
    });
  }
  render();
};

/* ================= 4. ISLAMIC KNOWLEDGE MAP — INTERACTIVE STAR MAP (#/knowledge-map) ================= */
const KM_KEY='zdKnowMapV1';
const KM_NODES=[
  {id:'iman',name:'ईमान और इस्लाम',en:'Iman & Islam',x:50,y:15,col:'#38bdf8',r:26,link:'#/path',linkLbl:'Start Here खोलें',
   lesson:'इस्लाम के 5 बुनियादी स्तंभ हैं: शहादा (तौहीद व रिसालत की गवाही), नमाज़, ज़कात, रमज़ान के रोज़े और हज। ईमान के 6 अरकान अल्लाह, फ़रिश्तों, किताबों, रसूलों, आख़िरत और तक़दीर पर यक़ीन हैं।',
   q:'इस्लाम के कुल कितने बुनियादी स्तंभ (Pillars) हैं?',opts:['3 स्तंभ','5 स्तंभ','7 स्तंभ'],ans:1},
  {id:'wudu',name:'वुज़ू',en:'Wudu',x:22,y:34,col:'#22d3ee',r:22,link:'#/nsec/2',linkLbl:'वुज़ू का पूरा तरीका',
   lesson:'नमाज़ की क़ुबूलियत के लिए पाकी (वुज़ू) शर्त है। वुज़ू के 4 फ़र्ज़ हैं: चेहरा धोना, दोनों हाथ कोहनियों समेत धोना, सिर का मसह करना और दोनों पैर टखनों समेत धोना (सूरह अल-माइदा 5:6)।',
   q:'क़ुरआन (सूरह अल-माइदा 5:6) के अनुसार वुज़ू के कितने फ़र्ज़ हैं?',opts:['4 फ़र्ज़','2 फ़र्ज़','8 फ़र्ज़'],ans:0},
  {id:'namaz',name:'नमाज़',en:'Namaz',x:50,y:38,col:'#facc15',r:26,link:'#/namaz3d',linkLbl:'3D नमाज़ सीखें',
   lesson:'दिन-रात में 5 वक़्त की फ़र्ज़ नमाज़ें (फ़ज्र, ज़ुहर, अस्र, मग़रिब, इशा) हर बालिग़ मुसलमान पर फ़र्ज़ हैं। नमाज़ दीन का स्तंभ है और क़यामत के दिन सबसे पहले नमाज़ का हिसाब होगा।',
   q:'क़यामत के दिन सबसे पहले किस इबादत का हिसाब लिया जाएगा?',opts:['हज का','नमाज़ का','सदक़े का'],ans:1},
  {id:'quran',name:'क़ुरआन',en:'Quran',x:78,y:34,col:'#4ade80',r:24,link:'#/surahs',linkLbl:'114 सूरह पढ़ें',
   lesson:'क़ुरआन मजीद अल्लाह का कलाम है जो 23 सालों में नबी करीम ﷺ पर नाज़िल हुआ। इसमें 114 सूरह, 30 पारे (Juz) और 6,236 आयात हैं। पहली सूरह अल-फ़ातिहा और सबसे लंबी सूरह अल-बक़रह है।',
   q:'क़ुरआन मजीद में कुल कितनी सूरह हैं?',opts:['99 सूरह','114 सूरह','120 सूरह'],ans:1},
  {id:'tajweed',name:'तजवीद',en:'Tajweed',x:82,y:62,col:'#a78bfa',r:21,link:'#/learn',linkLbl:'आयत-दर-आयत सीखें',
   lesson:'तजवीद का अर्थ है क़ुरआन के हर अरबी हर्फ़ को उसके सही मख़रज (उच्चारण स्थान) और सिफ़ात के साथ ठहर-ठहरकर पढ़ना। "व रत्तिलिल क़ुरआना तरतीला" (सूरह मुज़्ज़म्मिल 73:4)।',
   q:'तजवीद का मुख्य उद्देश्य क्या है?',opts:['बहुत तेज़ पढ़ना','हर अक्षर को सही मख़रज और नियम से पढ़ना','बिना आवाज़ के पढ़ना'],ans:1},
  {id:'hadith',name:'हदीस',en:'Hadith',x:50,y:64,col:'#fb923c',r:23,link:'#/hadith',linkLbl:'हदीस किताबें पढ़ें',
   lesson:'नबी ﷺ के क़ौल (कथन), फ़ेअल (अमल) और तक़रीर को हदीस कहते हैं। सबसे प्रमाणित 6 किताबें "सिहाह सित्ता" हैं: बुख़ारी, मुस्लिम, अबू दाऊद, तिर्मिज़ी, नसाई और इब्ने माजा।',
   q:'हदीस की सबसे प्रसिद्ध 6 किताबों के समूह को क्या कहते हैं?',opts:['सिहाह सित्ता','तफ़सीर','सीरत'],ans:0},
  {id:'seerah',name:'सीरत',en:'Seerah',x:20,y:62,col:'#f472b6',r:22,link:'#/ask',linkLbl:'Ask AI से सीरत पूछें',
   lesson:'हज़रत मुहम्मद ﷺ की विलादत 571 ई. (आमुल-फ़ील) में मक्का में हुई। 40 साल की उम्र में ग़ार-ए-हिरा में पहली वही (सूरह अल-अलक़) नाज़िल हुई और 622 ई. में मदीना हिजरत हुई।',
   q:'नबी करीम ﷺ पर पहली वही किस ग़ार (गुफ़ा) में नाज़िल हुई?',opts:['ग़ार-ए-सौर','ग़ार-ए-हिरा','मस्जिद-ए-क़ुबा'],ans:1},
  {id:'history',name:'इस्लामी इतिहास',en:'Islamic History',x:50,y:86,col:'#34d399',r:22,link:'./quiz/index.html',linkLbl:'Islamic Quiz खेलें',
   lesson:'ख़ुलाफ़ा-ए-राशिदीन (अबू बक्र, उमर, उस्मान, अली रज़ि.) के बाद इस्लामी तहज़ीब ने इल्म, साइंस, गणित (अल-ख़्वारिज़्मी) और चिकित्सा (इब्ने सीना) में पूरी दुनिया को रोशनी दी।',
   q:'हिजरी कैलेंडर की शुरुआत किस ऐतिहासिक घटना से होती है?',opts:['फ़त्ह-ए-मक्का','मदीना की हिजरत','जंग-ए-बद्र'],ans:1}
];
const KM_EDGES=[
  ['iman','wudu'],['iman','namaz'],['iman','quran'],
  ['wudu','namaz'],['namaz','hadith'],['quran','tajweed'],
  ['quran','hadith'],['namaz','seerah'],['seerah','history'],['hadith','history']
];

function loadKM(){try{return Object.assign({done:{},xp:0},JSON.parse(localStorage.getItem(KM_KEY)||'{}'))}catch(_){return {done:{},xp:0}}}
function saveKM(d){try{localStorage.setItem(KM_KEY,JSON.stringify(d))}catch(_){}}

R['knowledge-map']=function(){
  const st=loadKM();
  let selId='iman',zoom=1,picked=-1;
  const nodeById=id=>KM_NODES.find(n=>n.id===id)||KM_NODES[0];

  function render(){
    const doneCnt=KM_NODES.filter(n=>st.done[n.id]).length;
    const masteryPct=Math.round((doneCnt/KM_NODES.length)*100);
    const cur=nodeById(selId);
    const isDone=!!st.done[cur.id];

    const svgLines=KM_EDGES.map(([a,b])=>{
      const na=nodeById(a),nb=nodeById(b);
      const lit=st.done[a]&&st.done[b];
      const active=(a===selId||b===selId);
      return '<line x1="'+na.x+'" y1="'+na.y+'" x2="'+nb.x+'" y2="'+nb.y+'" stroke="'+(lit?'#facc15':(active?'#38bdf8':'rgba(148,163,184,0.34)'))+'" stroke-width="'+(lit||active?'0.9':'0.5')+'" stroke-dasharray="'+(lit?'':'1.4 1.2')+'"/>';
    }).join('');

    const bgStars=Array.from({length:38},(_,i)=>{
      const sx=(i*37+13)%96+2,sy=(i*53+7)%94+3,sr=(i%3===0?0.65:0.35);
      return '<circle cx="'+sx+'" cy="'+sy+'" r="'+sr+'" fill="rgba(255,255,255,'+(0.25+(i%5)*0.12).toFixed(2)+')"/>';
    }).join('');

    $('#view').innerHTML=top('Islamic Knowledge Map','इंटरैक्टिव स्टार मैप · जोड़कर सीखें')+'<main class="lh-wrap">'+
      '<section class="block card km-top">'+
        '<div><b>स्टार मैप मास्टरी: '+masteryPct+'%</b><div class="muted small">'+doneCnt+' / '+KM_NODES.length+' विषय पूरे · ⭐ '+st.xp+' XP</div></div>'+
        '<div class="km-zoom"><button type="button" id="kmZmOut">−</button><button type="button" id="kmZmIn">+</button></div>'+
      '</section>'+
      '<section class="block km-stage">'+
        '<div class="km-canvas" id="kmCanvas" style="transform:scale('+zoom+')">'+
          '<svg class="km-svg" viewBox="0 0 100 100" preserveAspectRatio="none">'+bgStars+svgLines+'</svg>'+
          KM_NODES.map(n=>{
            const ok=!!st.done[n.id],act=n.id===selId;
            return '<button type="button" class="km-node'+(act?' act':'')+(ok?' done':'')+'" data-nid="'+n.id+'" style="left:'+n.x+'%;top:'+n.y+'%;--nc:'+n.col+'">'+
              '<span class="km-orb">'+(ok?'★':'✦')+'</span>'+
              '<em>'+esc(n.name)+'</em>'+
            '</button>';
          }).join('')+
        '</div>'+
      '</section>'+
      '<section class="block card km-detail">'+
        '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px">'+
          '<div><h2 class="h2" style="margin:0">'+esc(cur.name)+'</h2><span class="muted small">'+esc(cur.en)+(isDone?' · ✅ मास्टर्ड (+35 XP)':' · छोटा पाठ और टेस्ट')+'</span></div>'+
          '<a class="btn sm ghost" href="'+cur.link+'">'+esc(cur.linkLbl)+' →</a>'+
        '</div>'+
        '<p class="km-lesson">'+esc(cur.lesson)+'</p>'+
        '<div class="km-quiz">'+
          '<b>📝 मिनी टेस्ट: '+esc(cur.q)+'</b>'+
          '<div class="km-qopts" id="kmQopts">'+
            cur.opts.map((o,i)=>{
              let cls='km-qbtn';
              if(picked>=0){if(i===cur.ans)cls+=' ok';else if(i===picked)cls+=' bad'}
              return '<button type="button" class="'+cls+'" data-ko="'+i+'">'+esc(o)+'</button>';
            }).join('')+
          '</div>'+
        '</div>'+
      '</section>'+
      '<section class="block card"><h2 class="h2">सभी विषय (All Nodes)</h2><div class="km-list">'+
        KM_NODES.map(n=>'<button type="button" class="km-li'+(n.id===selId?' act':'')+'" data-nid="'+n.id+'"><span>'+(st.done[n.id]?'⭐':'☆')+' '+esc(n.name)+'</span><small>'+(st.done[n.id]?'100%':'0%')+'</small></button>').join('')+
      '</div></section>'+
    '</main>';

    $('#kmZmIn').addEventListener('click',()=>{zoom=Math.min(1.45,+(zoom+0.15).toFixed(2));$('#kmCanvas').style.transform='scale('+zoom+')'});
    $('#kmZmOut').addEventListener('click',()=>{zoom=Math.max(0.85,+(zoom-0.15).toFixed(2));$('#kmCanvas').style.transform='scale('+zoom+')'});
    $('#view').querySelectorAll('[data-nid]').forEach(b=>b.addEventListener('click',()=>{
      selId=b.dataset.nid;picked=-1;render();
    }));
    $('#kmQopts').addEventListener('click',e=>{
      const b=e.target.closest('[data-ko]');if(!b)return;
      picked=+b.dataset.ko;
      if(picked===cur.ans){
        if(!st.done[cur.id]){st.done[cur.id]=true;st.xp+=35;saveKM(st);ZD.toast('★ '+cur.name+' स्टार अनलॉक हुआ! +35 XP')}
        else ZD.toast('बिल्कुल सही जवाब! ✅');
      }else{
        ZD.toast('दोबारा कोशिश करें — ऊपर दिए गए पाठ को पढ़ें');
      }
      render();
    });
  }
  render();
};

/* Expose Step 2 XP & Mastery helper for Progress Dashboard */
ZD.step2Stats=function(){
  const sb=loadSB(),sm=loadSM(),km=loadKM();
  const kmDone=KM_NODES.filter(n=>km.done[n.id]).length;
  return {
    xp:(sb.xp||0)+(sm.xp||0)+(km.xp||0),
    salahWins:sb.wins||0,
    spotCorrect:sm.correct||0,
    spotSolved:sm.solved||0,
    kmDone,
    kmTotal:KM_NODES.length,
    pct:Math.min(100,Math.round(((kmDone/KM_NODES.length)*50)+(Math.min(1,sb.wins/2)*25)+(Math.min(1,(sm.correct||0)/5)*25)))
  };
};
})();

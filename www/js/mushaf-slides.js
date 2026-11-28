(function(){'use strict';
const ZD=window.ZD,$=ZD.$,esc=ZD.esc,icon=ZD.icon,P=ZD.player,R=ZD.R;
const view=()=>$('#view');
const BISM='بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';
const AR_DIGITS=['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
const toArNum=n=>String(n).replace(/\d/g,d=>AR_DIGITS[Number(d)]);
const tr=s=>ZD.i18n&&typeof ZD.i18n.t==='function'?ZD.i18n.t(s):s;

const STYLE_ID='zd-mushaf-slides-style';
function ensureStyles(){
  if(document.getElementById(STYLE_ID))return;
  const st=document.createElement('style');
  st.id=STYLE_ID;
  st.textContent=
    '.msl-top-bar{display:flex;gap:8px;align-items:center;justify-content:space-between;flex-wrap:wrap;margin-bottom:10px}'+
    '.msl-slide{background:#fbf7eb;color:#1b1812;border:3px solid #8c6a2b;border-radius:18px;padding:10px;box-shadow:0 12px 30px rgba(0,0,0,.15);touch-action:pan-y}'+
    '.msl-inner{border:1.5px solid #b58d3d;border-radius:12px;padding:14px 16px;min-height:360px;display:flex;flex-direction:column;justify-content:space-between;background:radial-gradient(circle at 50% 0%,#fffdf6,#f6eed8)}'+
    '.msl-head{display:flex;justify-content:space-between;align-items:center;border-bottom:1.5px solid #c9a659;padding-bottom:8px;margin-bottom:12px;font-family:"Amiri",serif;font-size:16px;font-weight:700;color:#5a4115;direction:rtl}'+
    '.msl-surah{text-align:center;margin:10px 0;padding:8px 12px;border:1.5px solid #b58d3d;border-radius:12px;background:linear-gradient(90deg,#efe3c2,#faf3df,#efe3c2);font-family:"Amiri",serif;direction:rtl}'+
    '.msl-surah b{display:block;font-size:21px;color:#3d2b0b}'+
    '.msl-surah small{display:block;font-size:12px;color:#6e5322}'+
    '.msl-bism{text-align:center;font-family:"Amiri",serif;font-size:calc(var(--ar-size, 32px) - 3px);color:#2b1f0a;margin:6px 0 10px;direction:rtl}'+
    '.msl-text{direction:rtl;text-align:justify;text-align-last:center;font-family:"Amiri",serif;font-size:var(--ar-size, 32px);line-height:2.15;color:#15120c;word-spacing:2px}'+
    '.msl-ay{display:inline;border-radius:6px;padding:0 2px;cursor:pointer;transition:background .15s}'+
    '.msl-ay:hover{background:rgba(181,141,61,.18)}'+
    '.msl-ay.playing{background:rgba(181,141,61,.34)}'+
    '.msl-num{display:inline-block;font-size:.78em;color:#7c5818;margin:0 4px;font-weight:700}'+
    '.msl-foot{display:flex;justify-content:space-between;align-items:center;border-top:1.5px solid #c9a659;padding-top:8px;margin-top:14px;font-family:"Amiri",serif;font-size:15px;font-weight:700;color:#5a4115;direction:rtl}'+
    '.msl-nav{display:flex;gap:10px;align-items:center;justify-content:space-between;margin-top:12px}'+
    '.msl-nav .btn{flex:1}'+
    '.msl-jump{display:flex;gap:6px;align-items:center}'+
    '[data-theme="night"] .msl-slide,[data-theme="dark-brown"] .msl-slide,[data-theme="bw"] .msl-slide{background:#151922;color:#f3ecd8;border-color:#c69f4c}'+
    '[data-theme="night"] .msl-inner,[data-theme="dark-brown"] .msl-inner,[data-theme="bw"] .msl-inner{background:#11151d;border-color:#8b6d2e}'+
    '[data-theme="night"] .msl-text,[data-theme="dark-brown"] .msl-text,[data-theme="bw"] .msl-text,[data-theme="night"] .msl-bism,[data-theme="dark-brown"] .msl-bism,[data-theme="bw"] .msl-bism{color:#f5eedc}'+
    '[data-theme="night"] .msl-head,[data-theme="dark-brown"] .msl-head,[data-theme="bw"] .msl-head,[data-theme="night"] .msl-foot,[data-theme="dark-brown"] .msl-foot,[data-theme="bw"] .msl-foot,[data-theme="night"] .msl-num,[data-theme="dark-brown"] .msl-num,[data-theme="bw"] .msl-num{color:#e2bc62}'+
    '[data-theme="night"] .msl-surah,[data-theme="dark-brown"] .msl-surah,[data-theme="bw"] .msl-surah{background:#1b212c;border-color:#9e7b32}'+
    '[data-theme="night"] .msl-surah b,[data-theme="dark-brown"] .msl-surah b,[data-theme="bw"] .msl-surah b{color:#f2d282}';
  document.head.appendChild(st);
}

function top(title,sub,o){
  o=o||{};
  return '<header class="topbar">'+(o.back?'<button class="ibtn" data-act="back" aria-label="Back">'+icon('back')+'</button>':'')+
    '<h1>'+esc(tr(title))+(sub?'<span class="sub">'+esc(tr(sub))+'</span>':'')+'</h1>'+(o.right||'')+'</header>';
}

function juzRange(j){
  const J=ZD.juzList();
  const cur=J[j-1];
  if(!cur)return null;
  const nxt=J[j];
  let endS,endA;
  if(nxt){
    if(nxt.a>1){endS=nxt.s;endA=nxt.a-1}
    else{endS=nxt.s-1;endA=ZD.surah(endS).count}
  }else{
    endS=114;endA=ZD.surah(114).count;
  }
  return{j,name:cur.name,startS:cur.s,startA:cur.a,endS,endA};
}

function paginatePara(loaded,rng,perSlide){
  const items=[];
  loaded.forEach(d=>{
    const sr=ZD.surah(d.n);
    const aStart=d.n===rng.startS?rng.startA:1;
    const aEnd=d.n===rng.endS?rng.endA:sr.count;
    for(let a=aStart;a<=aEnd;a++){
      items.push({s:d.n,surah:sr,a,ar:d.ayahs[a-1].ar,isSurahStart:a===1});
    }
  });
  const slides=[];
  for(let i=0;i<items.length;i+=perSlide){
    slides.push(items.slice(i,i+perSlide));
  }
  return slides;
}

R.mushaf=function(){
  ensureStyles();
  const J=ZD.juzList();
  view().innerHTML=top('مصحف स्लाइड्स · 30 पारे','Pure Arabic · Page by Page',{back:true,right:'<button class="ibtn" data-act="goto" aria-label="Go to ayah">'+icon('hash')+'</button>'})+
    '<main>'+
    '<div class="card" style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">'+
    '<div><b>30 पारे · स्लाइड-बाय-स्लाइड अरबी मुसहफ़</b><div class="muted small">बिना तर्जुमे के · एक-एक पेज स्लाइड करके पढ़ें</div></div>'+
    '<button class="btn sm" id="mslSaveAll">'+icon('down')+' सभी 30 पारे ऑफ़लाइन सेव करें</button></div>'+
    '<div class="bar" style="margin-top:10px" hidden id="mslAllBar"><i style="width:0"></i></div><div class="muted small" id="mslAllStat" style="margin-top:6px"></div></div>'+
    J.map(item=>{
      const rng=juzRange(item.n);
      const s1=ZD.surah(rng.startS),s2=ZD.surah(rng.endS);
      return '<a class="row" href="#/mslide/'+item.n+'/1">'+
        '<div class="num"><span>'+item.n+'</span></div>'+
        '<div class="mid"><b>पारा '+item.n+' ('+toArNum(item.n)+') · '+esc(item.name)+'</b><small>'+esc(s1.en)+' '+rng.startS+':'+rng.startA+' — '+esc(s2.en)+' '+rng.endS+':'+rng.endA+'</small></div>'+
        '<div class="arn" lang="ar">'+esc(s1.ar)+'</div></a>';
    }).join('')+
    '</main>';
  let stop=false;
  ZD.onLeave(()=>{stop=true});
  $('#mslSaveAll').addEventListener('click',async e=>{
    const btn=e.currentTarget,bar=$('#mslAllBar'),st=$('#mslAllStat');
    btn.disabled=true;bar.hidden=false;stop=false;
    const fail=await ZD.downloadAllText((d,t,f)=>{
      bar.firstChild.style.width=(d/t*100)+'%';
      st.textContent=d+' / '+t+(f?' ('+f+' विफल)':'');
    },()=>stop);
    bar.hidden=true;btn.disabled=false;
    st.textContent=fail.length?'कुछ सूरह लोड नहीं हो सकीं, दोबारा कोशिश करें।':'✓ सभी 30 पारे (114 सूरह) ऑफ़लाइन सेव हो गए।';
  });
};

R.mslide=async function(args){
  ensureStyles();
  const j=Math.max(1,Math.min(30,Number(args[0])||1));
  const rng=juzRange(j);
  const perSlide=12;
  view().innerHTML=top('पारा '+j+' ('+toArNum(j)+')',rng.name+' · Slide Reader',{back:true,right:'<button class="ibtn" id="mslPlayPara" aria-label="Play Para">'+icon('play')+'</button><button class="ibtn" data-act="rset" aria-label="Display options">'+icon('gear')+'</button>'})+
    '<main><div id="mslBox"><div class="skeleton"></div><div class="skeleton"></div></div></main>';

  const box=$('#mslBox');
  const surahNums=[];
  for(let s=rng.startS;s<=rng.endS;s++)surahNums.push(s);

  let loaded=[];
  try{
    loaded=await Promise.all(surahNums.map(s=>ZD.loadSurah(s)));
  }catch(e){
    box.innerHTML='<div class="empty"><div class="big">📡</div><p><b>पारा लोड नहीं हो सका।</b></p><p class="small">इंटरनेट से एक बार लोड करें, फिर ऑफ़लाइन चलेगा।</p><button class="btn" id="mslRetry">दोबारा कोशिश करें</button></div>';
    $('#mslRetry').addEventListener('click',()=>ZD.route());
    return;
  }
  if(location.hash.indexOf('#/mslide/'+j)!==0)return;

  const slides=paginatePara(loaded,rng,perSlide);
  let idx=Math.max(0,Math.min(slides.length-1,(Number(args[1])||1)-1));

  const renderSlide=()=>{
    const pageList=slides[idx]||[];
    const firstItem=pageList[0];
    const lastItem=pageList[pageList.length-1];
    const pageNo=idx+1;
    const totalPages=slides.length;
    try{history.replaceState(null,'','#/mslide/'+j+'/'+pageNo)}catch(_){}

    let content='';
    let lastSurahId=0;
    pageList.forEach(item=>{
      if(item.isSurahStart&&item.s!==lastSurahId){
        content+='<div class="msl-surah"><b>سُورَةُ '+esc(item.surah.ar)+'</b><small>آياتها '+toArNum(item.surah.count)+' · '+(item.surah.type==='Meccan'?'مكية':'مدنية')+'</small></div>';
        if(item.s!==1&&item.s!==9)content+='<div class="msl-bism" lang="ar">'+BISM+'</div>';
      }
      if(item.s!==lastSurahId){
        if(content&&!content.endsWith('</div>'))content+='</div>';
        content+='<div class="msl-text" lang="ar">';
        lastSurahId=item.s;
      }
      content+='<span class="msl-ay" id="msl-'+item.s+'-'+item.a+'" data-s="'+item.s+'" data-a="'+item.a+'">'+esc(item.ar)+'<span class="msl-num">﴿'+toArNum(item.a)+'﴾</span></span> ';
    });
    if(content&&!content.endsWith('</div>'))content+='</div>';

    const pageOpts=slides.map((_,k)=>'<option value="'+k+'"'+(k===idx?' selected':'')+'>Page '+(k+1)+' / '+totalPages+'</option>').join('');

    box.innerHTML=
      '<div class="msl-top-bar">'+
      '<a class="btn sm ghost" href="#/mushaf">← सभी 30 पारे</a>'+
      '<div class="msl-jump">'+
      (j>1?'<a class="btn sm ghost" href="#/mslide/'+(j-1)+'/1">पारा '+(j-1)+'</a>':'')+
      '<select id="mslPageSel" class="sl" aria-label="Select slide page">'+pageOpts+'</select>'+
      (j<30?'<a class="btn sm ghost" href="#/mslide/'+(j+1)+'/1">पारा '+(j+1)+'</a>':'')+
      '</div></div>'+
      '<div class="msl-slide" id="mslCard"><div class="msl-inner">'+
      '<div><div class="msl-head"><span>الجزء '+toArNum(j)+'</span><span>صفحة '+toArNum(pageNo)+' / '+toArNum(totalPages)+'</span><span>'+esc(firstItem?firstItem.surah.ar:'')+'</span></div>'+content+'</div>'+
      '<div class="msl-foot"><span>'+(firstItem?esc(firstItem.surah.en)+' '+firstItem.s+':'+firstItem.a:'')+'</span><span>'+(lastItem?esc(lastItem.surah.en)+' '+lastItem.s+':'+lastItem.a:'')+'</span></div>'+
      '</div></div>'+
      '<div class="msl-nav">'+
      '<button type="button" class="btn ghost" id="mslPrev"'+(idx===0?' disabled':'')+'>← पिछला पेज</button>'+
      '<button type="button" class="btn" id="mslNext"'+(idx>=totalPages-1?' disabled':'')+'>अगला पेज →</button>'+
      '</div>';

    $('#mslPrev').addEventListener('click',()=>{if(idx>0){idx--;renderSlide();window.scrollTo(0,0)}});
    $('#mslNext').addEventListener('click',()=>{if(idx<totalPages-1){idx++;renderSlide();window.scrollTo(0,0)}});
    $('#mslPageSel').addEventListener('change',e=>{idx=Number(e.target.value)||0;renderSlide();window.scrollTo(0,0)});

    $('#mslCard').addEventListener('click',e=>{
      const ay=e.target.closest('.msl-ay');
      if(!ay)return;
      const s=Number(ay.dataset.s),a=Number(ay.dataset.a);
      const cur=P.cur();
      if(cur&&cur.s===s&&cur.a===a)P.toggle();
      else{ZD.playAyah(s,a);ZD.setLast(s,a)}
    });

    let sx=0,sy=0;
    const card=$('#mslCard');
    card.addEventListener('touchstart',e=>{
      const t=e.touches[0];if(!t)return;
      sx=t.clientX;sy=t.clientY;
    },{passive:true});
    card.addEventListener('touchend',e=>{
      const t=e.changedTouches[0];if(!t)return;
      const dx=t.clientX-sx,dy=t.clientY-sy;
      if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.4){
        if(dx<0&&idx<totalPages-1){idx++;renderSlide()}
        else if(dx>0&&idx>0){idx--;renderSlide()}
      }
    },{passive:true});

    syncPlay();
  };

  const syncPlay=()=>{
    ZD.$$('.msl-ay.playing').forEach(x=>x.classList.remove('playing'));
    const cur=P.cur();
    if(cur){
      const foundIdx=slides.findIndex(sl=>sl.some(item=>item.s===cur.s&&item.a===cur.a));
      if(foundIdx>=0&&foundIdx!==idx&&P.playing){
        idx=foundIdx;
        renderSlide();
        return;
      }
      const active=$('#msl-'+cur.s+'-'+cur.a);
      if(active)active.classList.add('playing');
    }
  };

  $('#mslPlayPara').addEventListener('click',()=>{
    const cur=P.cur();
    if(cur&&cur.s>=rng.startS&&cur.s<=rng.endS)P.toggle();
    else ZD.playSurah(rng.startS,rng.startA);
  });

  renderSlide();
  const unsub=ZD.onPlayer(syncPlay);
  ZD.onLeave(unsub);
};

ZD.mushafSlideBannerHTML=function(){
  return '<a class="card" href="#/mushaf" style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px;text-decoration:none;color:inherit">'+
    '<div><b>📖 30 पारे · पेज स्लाइड-बाय-स्लाइड (अरबी)</b><div class="muted small">आसान पेज स्लाइडर · बिना तर्जुमे के खालिस अरबी</div></div>'+
    '<span class="btn sm">खोलें</span></a>';
};
})();
        

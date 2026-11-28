(function(){'use strict';
const ZD=window.ZD,$=ZD.$,esc=ZD.esc,icon=ZD.icon,P=ZD.player;
const view=()=>$('#view');
const R=ZD.R={};
let cleanups=[];
ZD.onLeave=f=>cleanups.push(f);
const BISM='بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';
const tr=s=>ZD.i18n&&typeof ZD.i18n.t==='function'?ZD.i18n.t(s):s;
const curLang=()=>ZD.i18n&&typeof ZD.i18n.get==='function'?ZD.i18n.get():'hi';

function top(title,sub,o){o=o||{};
  return '<header class="topbar">'+(o.back?'<button class="ibtn" data-act="back" aria-label="Back">'+icon('back')+'</button>':'')+
  '<h1'+(o.ar?' class="ar" style="direction:rtl"':'')+'>'+esc(tr(title))+(sub?'<span class="sub">'+esc(tr(sub))+'</span>':'')+'</h1>'+(o.right||'')+'</header>'}
const norm=s=>String(s).toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]/g,'');

const NAVMAP={home:'home',surahs:'surahs',juz:'surahs',mushaf:'surahs',mslide:'surahs',pages:'surahs',hizb:'surahs',listen:'surahs',read:'surahs',goto:'surahs',mulk:'mulk',bookmarks:'home',more:'more',ask:'ask',prayer:'home',folders:'folders',learn:'folders',repeat:'folders',puzzle:'folders',revision:'folders',namaz:'folders',path:'folders',nz:'folders',nsec:'folders',tasbih:'folders',zakat:'folders',ruqiyah:'folders',progress:'home',namaz3d:'folders','salah-builder':'folders','spot-mistake':'folders','knowledge-map':'folders',classroom:'folders','ar-mode':'folders',whatsapp:'folders','visual-academy':'folders',azkaar:'folders',hadith:'folders',hbook:'folders',hsec:'folders',hone:'folders'};
async function route(){
  cleanups.forEach(f=>{try{f()}catch(e){}});cleanups=[];ZD.closeSheet();
  const h=location.hash.replace(/^#\/?/,'')||'home',parts=h.split('/'),name=parts[0],args=parts.slice(1);
  ZD.$$('.nav a').forEach(a=>{if(a.dataset.nav===NAVMAP[name])a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
  const fn=R[name]||R.home;view().replaceChildren();
  try{await fn(args)}catch(e){console.error(e);view().innerHTML=top('Something went wrong')+'<main><div class="empty"><div class="big">⚠️</div><p>This page could not be shown.</p><a class="btn" href="#/home">Go home</a></div></main>'}
  if(ZD.i18n)ZD.i18n.apply();
  if(!(name==='read'&&args[1])&&name!=='ask')window.scrollTo(0,0);
}
ZD.route=route;
window.addEventListener('hashchange',route);
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-act="back"]');if(b){e.preventDefault();if(history.length>1)history.back();else location.hash='#/surahs'}
  if(e.target.id==='scrim')ZD.closeSheet();
});

function localeTag(){const l=curLang();return l==='hinglish'?'en-IN':l}
function hijri(){try{return new Intl.DateTimeFormat(localeTag()+'-u-ca-islamic-umalqura',{day:'numeric',month:'long',year:'numeric'}).format(new Date()).replace(/ AH$/,' AH')}catch(e){return''}}
R.home=function(){
  const st=ZD.state(),p=ZD.prefs(),last=st.last,done=ZD.todayCount(),goal=p.goal,pct=Math.min(100,Math.round(done/goal*100));
  const date=new Intl.DateTimeFormat(localeTag(),{weekday:'long',day:'numeric',month:'long'}).format(new Date());
  let resume;
  if(last){const sr=ZD.surah(last.s),prog=Math.round(last.a/sr.count*100);
    resume='<a class="card resume" style="text-decoration:none;color:inherit" href="#/read/'+last.s+'/'+last.a+'"><div class="ring" style="--p:'+prog+'"><b>'+prog+'%</b></div><div style="flex:1;min-width:0"><div class="muted small">'+esc(tr('Resume reading'))+'</div><div style="font-size:19px;font-weight:600">'+esc(sr.en)+'</div><div class="muted small">'+esc(tr('Ayah '+last.a+' of '+sr.count+' · Juz '+ZD.juzOf(last.s,last.a)))+'</div></div><span class="btn sm">'+esc(tr('Continue'))+'</span></a>';
  }else resume='<a class="card resume" style="text-decoration:none;color:inherit" href="#/read/1/1"><div class="ring" style="--p:0"><b>0%</b></div><div style="flex:1"><div class="muted small">'+esc(tr('Start reading'))+'</div><div style="font-size:19px;font-weight:600">Al-Fatihah</div><div class="muted small">'+esc(tr('The Opening · 7 ayat'))+'</div></div><span class="btn sm">'+esc(tr('Begin'))+'</span></a>';
  const mu=st.mulk.status,mem=Object.values(mu).filter(v=>v==='memorised').length,due=ZD.mulkDueList?ZD.mulkDueList().length:0;
  view().innerHTML=top('Zikr Deen',hijri()?date+' · '+hijri():date,{right:'<button class="ibtn" data-act="theme" aria-label="App Theme" style="font-size:18px">🎨</button><button class="ibtn" data-act="lang" aria-label="App Language" style="font-size:18px">🌐</button><button class="ibtn" data-act="goto" aria-label="Go to surah and ayah">'+icon('hash')+'</button>'})+
  '<main>'+
  '<div class="hero"><div class="bism" lang="ar">'+BISM+'</div>'+resume.replace('class="card resume"','class="resume"').replace('style="text-decoration:none;color:inherit"','style="text-decoration:none;color:inherit;display:flex"')+'</div>'+
  (ZD.mushafSlideBannerHTML?ZD.mushafSlideBannerHTML():'')+
  (ZD.quickBarHTML?ZD.quickBarHTML():'')+(ZD.prayerHTML?ZD.prayerHTML():'')+(ZD.tasbihHTML?ZD.tasbihHTML():'')+(ZD.askHTML?ZD.askHTML():'')+(ZD.whatsappCardHTML?ZD.whatsappCardHTML():'')+
  (ZD.dailyHTML?ZD.dailyHTML():'')+
  '<section class="block card"><div style="display:flex;justify-content:space-between;align-items:baseline"><h2 class="h2" style="margin:0">'+esc(tr('Daily goal'))+'</h2><span class="muted small">'+done+' / '+goal+' '+esc(tr('ayat read'))+'</span></div>'+
  '<div class="bar" style="margin:12px 0 4px" role="progressbar" aria-valuemin="0" aria-valuemax="'+goal+'" aria-valuenow="'+Math.min(done,goal)+'"><i style="width:'+pct+'%"></i></div>'+
  '<div class="stat3"><div><b>'+ZD.streak()+'</b><span>'+esc(tr('day streak'))+'</span></div><div><b>'+ZD.totalRead()+'</b><span>'+esc(tr('ayat read'))+'</span></div><div><b>'+st.bookmarks.length+'</b><span>'+esc(tr('saved'))+'</span></div></div>'+
  '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:12px"><span class="muted small">✓</span><a class="btn sm ghost" href="#/progress">📊 XP &amp; Mastery →</a></div></section>'+
  '<section class="block"><h2 class="h2">'+esc(tr('Learning folders'))+'</h2>'+(ZD.foldersHTML?ZD.foldersHTML():'')+'</section>'+
  '<section class="block"><div class="tiles"><button class="tile" data-act="goto">'+icon('hash')+'<b>'+esc(tr('Go to ayah'))+'</b><span>67:15</span></button><a class="tile" href="#/bookmarks">'+icon('mark')+'<b>'+esc(tr('Saved'))+'</b><span>'+esc(tr(st.bookmarks.length+' bookmarks'))+'</span></a></div></section>'+
  '<section class="block card" style="background:linear-gradient(150deg,var(--raised),var(--surface))"><div style="display:flex;gap:14px;align-items:center"><div class="ar" style="font-size:44px;color:var(--gold-soft);line-height:1.1">الملك</div><div style="flex:1"><h2 class="h2" style="margin:0">'+esc(tr('Surah Al-Mulk'))+'</h2><div class="muted small">'+esc(tr(mem+' of 30 ayat memorised'))+(due?' · '+due:'')+'</div></div></div>'+
  '<div class="bar" style="margin:12px 0"><i style="width:'+Math.round(mem/30*100)+'%"></i></div><div style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn sm" href="#/mulk">'+esc(tr('Open Hifz hub'))+'</a><a class="btn sm ghost" href="journey.html">'+esc(tr('30-day journey'))+'</a></div></section>'+
  (deferred?'<section class="block"><button class="btn" data-act="install" style="width:100%">Install Zikr Deen</button></section>':'')+
  '</main>';
};

function indexHead(tab){return ZD.quranTabsHTML?ZD.quranTabsHTML(tab):'<div class="seg" role="tablist"><button role="tab" aria-selected="'+(tab==='surahs')+'" data-go="#/surahs">'+esc(tr('Surah'))+'</button><button role="tab" aria-selected="'+(tab==='juz')+'" data-go="#/juz">'+esc(tr('Juz'))+'</button><button role="tab" aria-selected="'+(tab==='mushaf')+'" data-go="#/mushaf">30 पारे (अरबी)</button></div>'}
document.addEventListener('click',e=>{const g=e.target.closest('[data-go]');if(g)location.hash=g.dataset.go});
R.surahs=async function(){
  const all=ZD.surahs();
  view().innerHTML=top('Quran','114 surahs · 6,236 ayat',{right:'<a class="ibtn" href="#/listen" aria-label="Audio Player" style="font-size:18px;text-decoration:none">🎧</a><button class="ibtn" data-act="goto" aria-label="Go to surah and ayah">'+icon('hash')+'</button>'})+
   '<main>'+(ZD.mushafSlideBannerHTML?ZD.mushafSlideBannerHTML():'')+(ZD.quranLastReadHTML?ZD.quranLastReadHTML():'')+
   (ZD.reciterCardsHTML?'<section class="block"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><h2 class="h2" style="margin:0">'+esc(tr('Listen to Quran by'))+'</h2><a class="small" href="#/listen" style="text-decoration:none;font-weight:600">'+esc(tr('Full Player →'))+'</a></div><div id="qRecWrap">'+ZD.reciterCardsHTML(ZD.prefs().reciter,true)+'</div></section>':'')+
   indexHead('surahs')+'<label class="search">'+icon('search')+'<input id="q" type="search" placeholder="'+esc(tr('Search by name, number or meaning'))+'" autocomplete="off" aria-label="Search surahs"></label><div id="list"></div></main>';
  const qrw=$('#qRecWrap');
  if(qrw)qrw.addEventListener('click',e=>{
    const b=e.target.closest('[data-qari]');if(!b)return;
    const p=ZD.prefs();p.reciter=b.dataset.qari;ZD.updateCfg({reciter:p.reciter});ZD.save();
    qrw.innerHTML=ZD.reciterCardsHTML(p.reciter,true);
    const l=ZD.state().last;ZD.playSurah(l?l.s:1,l?l.a:1);location.hash='#/listen';
  });
  const list=$('#list');let cached=new Set();
  const draw=f=>{const q=norm(f||'');const rows=all.filter(s=>!q||String(s.n)===q||norm(s.en).includes(q)||norm(s.mean).includes(q)||norm(s.ar).includes(q));
    list.innerHTML=rows.length?rows.map(s=>'<div class="row"><a href="#/read/'+s.n+'/1" style="display:flex;align-items:center;gap:12px;flex:1;min-width:0;color:inherit;text-decoration:none"><div class="num"><span>'+s.n+'</span></div><div class="mid"><b>'+esc(s.en)+(cached.has(s.n)?'<i class="dot"></i>':'')+'</b><small>'+esc(s.mean)+' · '+s.count+' <span class="tag">'+esc(tr(s.type))+'</span></small></div><div class="arn" lang="ar">'+esc(s.ar)+'</div></a><div class="acts"><button class="ibtn" data-play="'+s.n+'" aria-label="Play '+esc(s.en)+'">'+icon('play')+'</button></div></div>').join(''):'<div class="empty"><div class="big">🔎</div>'+esc(f)+'</div>'};
  draw('');$('#q').addEventListener('input',e=>draw(e.target.value));
  list.addEventListener('click',e=>{const b=e.target.closest('[data-play]');if(b){e.preventDefault();ZD.playSurah(Number(b.dataset.play),1);ZD.toast(ZD.surah(Number(b.dataset.play)).en)}});
  ZD.cachedSurahs().then(s=>{cached=s;if(location.hash.startsWith('#/surahs'))draw($('#q')&&$('#q').value)});
};
R.juz=function(){
  const J=ZD.juzList();
  view().innerHTML=top('Juz Index','30 paras')+'<main>'+(ZD.mushafSlideBannerHTML?ZD.mushafSlideBannerHTML():'')+indexHead('juz')+J.map(j=>{const sr=ZD.surah(j.s);return '<div class="row"><a href="#/read/'+j.s+'/'+j.a+'" style="display:flex;align-items:center;gap:12px;flex:1;min-width:0;color:inherit;text-decoration:none"><div class="num"><span>'+j.n+'</span></div><div class="mid"><b>'+esc(j.name)+'</b><small>'+esc(sr.en)+' '+j.s+':'+j.a+'</small></div><div class="arn" lang="ar">'+esc(sr.ar)+'</div></a><div class="acts"><a class="btn sm ghost" href="#/mslide/'+j.n+'/1">📖 स्लाइड</a></div></div>'}).join('')+'</main>';
};

function gotoSheet(){
  const opts=ZD.surahs().map(s=>'<option value="'+s.n+'">'+s.n+'. '+esc(s.en)+'</option>').join('');
  ZD.openSheet('<h3>'+esc(tr('Go to ayah'))+'</h3><div class="field"><label for="gS">'+esc(tr('Surah'))+'</label><select id="gS" style="max-width:62%">'+opts+'</select></div><div class="field"><label for="gA">Ayah <span class="muted small" id="gMax"></span></label><input id="gA" type="number" min="1" value="1" inputmode="numeric" style="width:96px"></div><div style="display:flex;gap:8px;margin-top:14px"><button class="btn" id="gGo">'+esc(tr('Open'))+'</button><button class="btn ghost" id="gX">'+esc(tr('Cancel'))+'</button></div>',sh=>{
    const sel=$('#gS',sh),ay=$('#gA',sh),mx=$('#gMax',sh),upd=()=>{const n=ZD.surah(Number(sel.value)).count;ay.max=n;mx.textContent='(1–'+n+')';if(Number(ay.value)>n)ay.value=n};
    sel.addEventListener('change',upd);upd();
    $('#gGo',sh).addEventListener('click',()=>{const s=Number(sel.value),a=Math.max(1,Math.min(ZD.surah(s).count,Math.round(Number(ay.value))||1));ZD.closeSheet();location.hash='#/read/'+s+'/'+a});
    $('#gX',sh).addEventListener('click',ZD.closeSheet);
  });
}
document.addEventListener('click',e=>{if(e.target.closest('[data-act="goto"]'))gotoSheet()});
document.addEventListener('click',e=>{
  if(!e.target.closest('[data-act="theme"]'))return;
  const p=ZD.prefs();
  const list=[
    ['milk','Milk (White)','करंट डिफ़ॉल्ट थीम','#faf7f0','#8a6410'],
    ['cream-green','Creamy Green','क्रीमी ग्रीन','#f2f6ef','#1e7a56'],
    ['cream-yellow','Cream Yellowish','येलोइश क्रीम','#fbf5df','#9e7110'],
    ['brown-white','Brown & White','ब्राउन-व्हाइट','#f8f5f1','#7c4d2b'],
    ['dark-brown','Dark Brown','डार्क ब्राउन','#18100c','#e0b266'],
    ['bw','Black & White','ब्लैक एंड व्हाइट','#09090b','#ffffff'],
    ['night','Royal Night','नीला नाइट','#010f45','#e2bc62']
  ];
  const thHtml='<h3>'+esc(tr('Theme'))+'</h3><div class="th-grid" id="qThGrid">'+
    list.map(t=>'<button type="button" class="th-card'+(p.theme===t[0]?' on':'')+'" data-th="'+t[0]+'"><span class="th-dot" style="background:'+t[3]+'"><i style="background:'+t[4]+'"></i></span><div><b>'+t[1]+'</b><span>'+t[2]+'</span></div></button>').join('')+
    '</div><div class="field"><label for="qBgMot">✨ Dynamic Star Motion</label><input type="checkbox" id="qBgMot"'+(p.bgMotion!==false?' checked':'')+'></div><div class="field"><label for="qGlowMot">🌈 Interactive Glow Border</label><input type="checkbox" id="qGlowMot"'+(p.glowMotion!==false?' checked':'')+'></div>';
  ZD.openSheet(thHtml,sh=>{
    $('#qThGrid',sh).addEventListener('click',ev=>{
      const b=ev.target.closest('[data-th]');if(!b)return;
      p.theme=b.dataset.th;ZD.applyPrefs();ZD.save();
      $('#qThGrid',sh).querySelectorAll('.th-card').forEach(x=>x.classList.toggle('on',x===b));
    });
    $('#qBgMot',sh).addEventListener('change',ev=>{p.bgMotion=ev.target.checked;ZD.applyPrefs();ZD.save()});
    $('#qGlowMot',sh).addEventListener('change',ev=>{p.glowMotion=ev.target.checked;ZD.applyPrefs();ZD.save()});
  });
});

const LANGS=[['en','English','en',false],['hi','हिन्दी','hi',false],['ur','اردو','ur',true],['roman','Roman (Al-Mulk)','en',false],['hinglish','Hinglish (Al-Mulk)','en',false]];
function ayahHTML(d,s,x,langs){
  const a=x.a;let h='<article class="ayah" id="ay-'+a+'" data-a="'+a+'"><div class="ayah-head"><span class="ref">'+a+'</span></div><div class="ar-text" lang="ar">'+esc(x.ar)+'</div>';
  for(const [k,label,lang,rtl] of LANGS){if(!langs[k]||!x[k])continue;h+='<div class="tr'+(rtl?' urdu':'')+'" lang="'+lang+'"><small>'+label+'</small>'+esc(x[k])+'</div>'}
  h+='<div class="ayah-acts">'+
   '<button class="ibtn" data-ay="play" aria-label="Play from ayah '+a+'">'+icon('play')+'</button>'+
   '<button class="ibtn'+(ZD.isBookmarked(s,a)?' on':'')+'" data-ay="mark" aria-label="Bookmark ayah '+a+'" aria-pressed="'+ZD.isBookmarked(s,a)+'">'+icon('mark')+'</button>'+
   '<button class="ibtn'+(ZD.isRead(s,a)?' on':'')+'" data-ay="read" aria-label="Mark ayah '+a+' as read today" aria-pressed="'+ZD.isRead(s,a)+'">'+icon('check')+'</button>'+
   '<button class="ibtn" data-ay="copy" aria-label="Copy ayah '+a+'">'+icon('copy')+'</button>'+
   '<button class="ibtn" data-ay="share" aria-label="Share ayah '+a+' as image">'+icon('share')+'</button></div></article>';
  return h}
R.read=async function(args){
  const s=Number(args[0]),a=Number(args[1]||1);
  if(!ZD.surah(s)){location.replace('#/surahs');return}
  const sr=ZD.surah(s),startA=Math.max(1,Math.min(sr.count,a||1));
  view().innerHTML=top(sr.en,sr.mean+' · '+sr.count+' ayat · '+tr(sr.type),{back:true,right:'<button class="ibtn" data-act="playall" aria-label="Play surah">'+icon('play')+'</button><button class="ibtn" data-act="rset" aria-label="Reading and audio options">'+icon('gear')+'</button>'})+
   '<main><div id="rbody"><div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div></div></main>';
  let d;
  try{d=await ZD.loadSurah(s)}catch(e){
    $('#rbody').innerHTML='<div class="empty"><div class="big">📡</div><p><b>'+esc(sr.en)+'</b></p><button class="btn" id="retry">'+esc(tr('Try again'))+'</button></div>';
    $('#retry').addEventListener('click',()=>route());return}
  if(location.hash.indexOf('#/read/'+s)!==0)return;
  const body=$('#rbody');
  let renderGen=0;
  ZD.onLeave(()=>{renderGen++});
  const draw=()=>{
    const myGen=++renderGen,langs=ZD.prefs().langs,src=d.src||{};
    const footer='<p class="src-note">'+'Arabic: '+esc(src.ar||'')+(src.en?' · English: '+esc(src.en):'')+(src.hi?' · Hindi: '+esc(src.hi):'')+(src.ur?' · Urdu: '+esc(src.ur):'')+'.</p>';
    const firstEnd=Math.min(d.ayahs.length,Math.max(30,startA+15));
    let h=(s!==1&&s!==9)?'<div class="bism-head" lang="ar">'+BISM+'</div>':'';
    for(let i=0;i<firstEnd;i++)h+=ayahHTML(d,s,d.ayahs[i],langs);
    if(firstEnd>=d.ayahs.length)h+=footer;
    body.innerHTML=h;bind();
    if(firstEnd<d.ayahs.length){
      let pos=firstEnd;
      const chunk=()=>{
        if(myGen!==renderGen||location.hash.indexOf('#/read/'+s)!==0)return;
        const end=Math.min(d.ayahs.length,pos+35);
        let part='';for(let i=pos;i<end;i++)part+=ayahHTML(d,s,d.ayahs[i],langs);
        if(end>=d.ayahs.length)part+=footer;
        body.insertAdjacentHTML('beforeend',part);
        pos=end;refreshPlaying();
        if(pos<d.ayahs.length)(window.requestIdleCallback?requestIdleCallback(chunk,{timeout:200}):setTimeout(chunk,16));
      };
      (window.requestIdleCallback?requestIdleCallback(chunk,{timeout:120}):setTimeout(chunk,16));
    }
  };
  let curKey='';
  const refreshPlaying=()=>{const it=P.cur(),on=it&&it.s===s,key=on?it.a+':'+P.playing:'';if(key===curKey)return;const prev=curKey.split(':')[0];curKey=key;
    ZD.$$('.ayah.playing').forEach(e=>e.classList.remove('playing'));ZD.$$('[data-ay="play"]').forEach(b=>{b.innerHTML=icon('play')});
    if(on){const el=$('#ay-'+it.a);if(el){el.classList.add('playing');const b=el.querySelector('[data-ay="play"]');if(b&&P.playing)b.innerHTML=icon('pause');if(String(it.a)!==prev&&P.playing){const r=el.getBoundingClientRect();if(r.top<90||r.bottom>innerHeight-170)el.scrollIntoView({block:'center',behavior:'smooth'})}}}};
  function bind(){
    body.onclick=async e=>{const b=e.target.closest('[data-ay]');if(!b)return;const art=b.closest('.ayah'),a=Number(art.dataset.a),k=b.dataset.ay;
      if(k==='play'){const it=P.cur();if(it&&it.s===s&&it.a===a)P.toggle();else{ZD.playAyah(s,a);ZD.setLast(s,a)}}
      else if(k==='mark'){const on=ZD.toggleBookmark(s,a);b.classList.toggle('on',on);b.setAttribute('aria-pressed',on);ZD.toast(sr.en+' '+s+':'+a)}
      else if(k==='read'){const on=ZD.toggleRead(s,a);b.classList.toggle('on',on);b.setAttribute('aria-pressed',on);if(on){ZD.setLast(s,a);const c=ZD.todayCount(),g=ZD.prefs().goal;ZD.toast(c+' / '+g)}}
      else if(k==='copy')ZD.copy(ZD.ayahPlain(d,a)+'\n— '+sr.en+' '+s+':'+a);
      else if(k==='share'){b.disabled=true;try{await ZD.shareImage(s,a)}catch(err){ZD.toast('Could not create the image')}b.disabled=false}};
    curKey='~';refreshPlaying();
  }
  draw();
  const unsub=ZD.onPlayer(refreshPlaying);ZD.onLeave(unsub);
  if(args[1]){ZD.setLast(s,startA);const el=$('#ay-'+startA);if(el)requestAnimationFrame(()=>el.scrollIntoView({block:'start'}))}
  let tmr=0;const onScroll=()=>{clearTimeout(tmr);tmr=setTimeout(()=>{const els=ZD.$$('.ayah');for(const el of els){if(el.getBoundingClientRect().top>=70){const a=Number(el.dataset.a);const l=ZD.state().last;if(!l||l.s!==s||Math.abs(l.a-a)>0)ZD.setLast(s,a);break}}},500)};
  window.addEventListener('scroll',onScroll,{passive:true});ZD.onLeave(()=>{window.removeEventListener('scroll',onScroll);clearTimeout(tmr)});
  $('[data-act="playall"]').onclick=()=>{const it=P.cur();if(it&&it.s===s)P.toggle();else ZD.playSurah(s,1)};
  $('[data-act="rset"]').onclick=()=>readerSheet(s,d,draw);
};

function toggleRow(label,id,on){return '<div class="field"><label>'+esc(tr(label))+'</label><button class="switch" data-lang="'+id+'" role="switch" aria-checked="'+on+'" aria-label="'+esc(tr(label))+'"></button></div>'}
function readerSheet(s,d,redraw){
  const p=ZD.prefs(),L=p.langs,sr=ZD.surah(s);
  ZD.openSheet('<h3>'+esc(tr('Reading & listening'))+'</h3>'+toggleRow('English translation','en',L.en)+toggleRow('हिन्दी अनुवाद','hi',L.hi)+toggleRow('اردو ترجمہ','ur',L.ur)+
   (s===67?toggleRow('Roman transliteration','roman',L.roman)+toggleRow('Hinglish meaning','hinglish',L.hinglish):'')+
   '<div class="field"><label for="rsAr">'+esc(tr('Arabic size'))+'</label><input type="range" id="rsAr" min="24" max="56" value="'+p.arSize+'"></div>'+
   '<div class="field"><label for="rsTr">'+esc(tr('Translation size'))+'</label><input type="range" id="rsTr" min="13" max="26" value="'+p.trSize+'"></div>'+
   '<div class="field"><label for="rsTh">'+esc(tr('Theme'))+'</label><select id="rsTh"><option value="cream-green">Creamy Green</option><option value="cream-yellow">Cream Yellowish</option><option value="brown-white">Brown &amp; White</option><option value="dark-brown">Dark Brown</option><option value="bw">Black &amp; White</option><option value="night">Royal Night (Blue)</option><option value="milk">Milk (White)</option></select></div>'+
   '<h3 style="margin-top:14px">'+esc(sr.en)+'</h3><p class="muted small" id="dlInfo"></p><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm" id="dlGo">'+icon('down')+' '+esc(tr('Offline library'))+'</button><button class="btn sm ghost" id="dlDel">'+icon('trash')+'</button><button class="btn sm ghost" id="pbOpen">'+icon('repeat')+'</button></div><div class="bar" style="margin-top:10px" hidden id="dlBar"><i style="width:0"></i></div>',sh=>{
    $('#rsTh',sh).value=p.theme;
    sh.addEventListener('click',e=>{const b=e.target.closest('[data-lang]');if(!b)return;const on=b.getAttribute('aria-checked')!=='true';b.setAttribute('aria-checked',on);L[b.dataset.lang]=on;ZD.save();redraw()});
    $('#rsAr',sh).addEventListener('input',e=>{p.arSize=Number(e.target.value);ZD.applyPrefs();ZD.save()});
    $('#rsTr',sh).addEventListener('input',e=>{p.trSize=Number(e.target.value);ZD.applyPrefs();ZD.save()});
    $('#rsTh',sh).addEventListener('change',e=>{p.theme=e.target.value;ZD.applyPrefs();ZD.save()});
    $('#pbOpen',sh).addEventListener('click',()=>{ZD.closeSheet();setTimeout(ZD.playbackSheet,260)});
    const info=$('#dlInfo',sh),bar=$('#dlBar',sh),go=$('#dlGo',sh);let stop=false;
    const refresh=async()=>{const c=await ZD.offlineCount(p.reciter,s),rn=ZD.RECITERS.find(r=>r[0]===p.reciter)[1];info.textContent=c+' / '+sr.count+' · '+rn};refresh();
    go.addEventListener('click',async()=>{go.disabled=true;bar.hidden=false;stop=false;const r=await ZD.downloadSurahAudio(p.reciter,s,1,sr.count,(done,total,fail)=>{bar.firstChild.style.width=(done/total*100)+'%';info.textContent=done+' / '+total},()=>stop);
      bar.hidden=true;go.disabled=false;await refresh();ZD.toast(r.ok+' / '+sr.count)});
    $('#dlDel',sh).addEventListener('click',async()=>{stop=true;await ZD.deleteSurahAudio(p.reciter,s);await refresh()});
    ZD.onLeave(()=>{stop=true});
  });
}

function wrap(g,text,maxW){const words=text.split(/\s+/),lines=[];let line='';for(const w of words){const t=line?line+' '+w:w;if(g.measureText(t).width>maxW&&line){lines.push(line);line=w}else line=t}if(line)lines.push(line);return lines}
ZD.shareImage=async function(s,a){
  const d=await ZD.loadSurah(s),x=d.ayahs[a-1],sr=ZD.surah(s);
  try{await document.fonts.load('48px Amiri','ب')}catch(e){}
  const W=1080,H=1350,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  const gr=g.createLinearGradient(0,0,W,H);gr.addColorStop(0,'#010f45');gr.addColorStop(1,'#0d3a8a');g.fillStyle=gr;g.fillRect(0,0,W,H);
  g.strokeStyle='#d7b25e';g.lineWidth=3;g.strokeRect(36,36,W-72,H-72);g.lineWidth=1;g.strokeRect(54,54,W-108,H-108);
  g.textAlign='center';g.fillStyle='#d7b25e';g.font='46px Amiri, serif';g.direction='rtl';g.fillText(BISM,W/2,150);
  const maxW=W-200,region=640;let size=66,lines;
  for(const z of [66,58,50,44,38,33,29,26]){size=z;g.font=z+'px Amiri, serif';g.direction='rtl';lines=wrap(g,x.ar,maxW);if(lines.length*z*1.85<=region)break}
  const lh=size*1.85,blockH=lines.length*lh,y0=240+(region-blockH)/2+size;
  g.fillStyle='#f3ecd9';lines.forEach((l,i)=>g.fillText(l,W/2,y0+i*lh));
  const trTxt=x.en||x.hinglish||'';if(trTxt){g.direction='ltr';g.font='34px system-ui, sans-serif';g.fillStyle='#cfe0d6';let tl=wrap(g,trTxt,W-220);if(tl.length>6){tl=tl.slice(0,6);tl[5]=tl[5].replace(/\s*\S*$/,'')+'…'}tl.forEach((l,i)=>g.fillText(l,W/2,960+i*48))}
  g.direction='ltr';g.fillStyle='#d7b25e';g.font='bold 36px system-ui, sans-serif';g.fillText('Surah '+sr.en+' · '+s+':'+a,W/2,1240);g.fillStyle='#9db8aa';g.font='28px system-ui, sans-serif';g.fillText('Zikr Deen',W/2,1288);
  const blob=await new Promise(r=>c.toBlob(r,'image/png'));if(!blob)throw new Error('no blob');
  const file=new File([blob],'zikr-deen-'+s+'-'+a+'.png',{type:'image/png'});
  if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:'Zikr Deen'});return}catch(e){if(e&&e.name==='AbortError')return}}
  ZD.download(file.name,blob);ZD.toast('Saved');
};

R.bookmarks=function(){
  const b=ZD.state().bookmarks;
  view().innerHTML=top('Saved',esc(tr(b.length+' bookmarks')))+'<main id="bmRoot">'+(b.length?b.map(x=>{const sr=ZD.surah(x.s),dt=new Date(x.t).toLocaleDateString(localeTag(),{day:'numeric',month:'short',year:'numeric'});
    return '<div class="row"><a href="#/read/'+x.s+'/'+x.a+'" style="display:flex;align-items:center;gap:12px;flex:1;min-width:0;color:inherit;text-decoration:none"><div class="num"><span>'+x.a+'</span></div><div class="mid"><b>'+esc(sr.en)+' '+x.s+':'+x.a+'</b><small>'+esc(tr('Juz'))+' '+ZD.juzOf(x.s,x.a)+' · '+dt+'</small></div><div class="arn" lang="ar">'+esc(sr.ar)+'</div></a><div class="acts"><button class="ibtn" data-bp="'+x.s+':'+x.a+'" aria-label="Play">'+icon('play')+'</button><button class="ibtn" data-bd="'+x.s+':'+x.a+'" aria-label="Remove bookmark">'+icon('trash')+'</button></div></div>'}).join(''):
    '<div class="empty"><div class="big">🔖</div><p>'+esc(tr('Saved'))+'</p><a class="btn" href="#/surahs">'+esc(tr('Quran'))+'</a></div>')+'</main>';
  $('#bmRoot').onclick=e=>{const p=e.target.closest('[data-bp]'),d=e.target.closest('[data-bd]');
    if(p){const [s,a]=p.dataset.bp.split(':').map(Number);ZD.playAyah(s,a)}
    if(d){const [s,a]=d.dataset.bd.split(':').map(Number);ZD.toggleBookmark(s,a);R.bookmarks();ZD.toast('Saved')}};
};

let deferred=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;if(location.hash===''||location.hash==='#/home'||location.hash==='#/more')route()});
window.addEventListener('appinstalled',()=>{deferred=null;ZD.toast('Zikr Deen')});
document.addEventListener('click',async e=>{if(e.target.closest('[data-act="install"]')){if(deferred){deferred.prompt();try{await deferred.userChoice}catch(_){}deferred=null;route()}else ZD.toast('Zikr Deen')}});
const fmtMB=b=>b>1e9?(b/1e9).toFixed(1)+' GB':(b/1e6).toFixed(b>1e8?0:1)+' MB';
R.more=async function(){
  const p=ZD.prefs(),L=p.langs;
  const TH_LIST=[
    ['milk','Milk (White)','करंट डिफ़ॉल्ट थीम','#faf7f0','#8a6410'],
    ['cream-green','Creamy Green','हल्का ग्रीन क्रीम','#f2f6ef','#1e7a56'],
    ['cream-yellow','Cream Yellowish','येलोइश क्रीम','#fbf5df','#9e7110'],
    ['brown-white','Brown & White','ब्राउन-व्हाइट','#f8f5f1','#7c4d2b'],
    ['dark-brown','Dark Brown','डार्क ब्राउन गोल्ड','#18100c','#e0b266'],
    ['bw','Black & White','ब्लैक एंड व्हाइट','#09090b','#ffffff'],
    ['night','Royal Night','नीला नाइट थीम','#010f45','#e2bc62']
  ];
  const thCards='<div class="th-grid" id="thGrid">'+TH_LIST.map(t=>'<button type="button" class="th-card'+(p.theme===t[0]?' on':'')+'" data-th="'+t[0]+'"><span class="th-dot" style="background:'+t[3]+'"><i style="background:'+t[4]+'"></i></span><div><b>'+t[1]+'</b><span>'+t[2]+'</span></div></button>').join('')+'</div>';

  const rec=ZD.RECITERS.map(r=>'<option value="'+r[0]+'"'+(r[0]===p.reciter?' selected':'')+'>'+esc(r[1])+'</option>').join('');
  view().innerHTML=top('More','Settings, offline library & backup')+'<main id="moreRoot">'+
  '<section class="block card"><h2 class="h2">'+esc(tr('Appearance'))+'</h2>'+
   (ZD.i18n?'<div class="field"><label for="sLang">'+esc(tr('App Language'))+'</label><select id="sLang" style="max-width:58%">'+ZD.i18n.optionsHTML()+'</select></div>':'')+
   '<div class="field"><label for="sTh">'+esc(tr('Theme'))+'</label><select id="sTh"><option value="cream-green">Creamy Green</option><option value="cream-yellow">Cream Yellowish</option><option value="brown-white">Brown &amp; White</option><option value="dark-brown">Dark Brown</option><option value="bw">Black &amp; White</option><option value="night">Royal Night (Blue)</option><option value="milk">Milk (White)</option></select></div>'+
   thCards+'<div class="field"><label for="sBgMot">✨</label><input type="checkbox" id="sBgMot"'+(p.bgMotion!==false?' checked':'')+'></div>'+'<div class="field"><label for="sGlowMot">🌈</label><input type="checkbox" id="sGlowMot"'+(p.glowMotion!==false?' checked':'')+'></div>'+'<div class="field"><label for="sIntro">'+esc(tr('Opening intro'))+'</label><select id="sIntro"><option value="always">always</option><option value="daily">daily</option><option value="never">never</option></select></div>'+
   '<div class="field"><label for="sSnd">'+esc(tr('Intro sound'))+'</label><select id="sSnd"><option value="azan">azan</option><option value="reciteonly">recite</option><option value="off">off</option></select></div>'+
   '<div class="field"><label>'+esc(tr('Suno'))+'</label><button class="btn sm" id="sndTry">'+icon('play')+' '+esc(tr('Suno'))+'</button></div>'+
   '<div class="field"><label>'+esc(tr('Opening intro'))+'</label><button class="btn sm" id="introReplay">'+icon('play')+' '+esc(tr('Continue'))+'</button></div>'+
   '<div class="field"><label for="sAr">'+esc(tr('Arabic size'))+'</label><input type="range" id="sAr" min="24" max="56" value="'+p.arSize+'"></div>'+
   '<div class="field"><label for="sTr">'+esc(tr('Translation size'))+'</label><input type="range" id="sTr" min="13" max="26" value="'+p.trSize+'"></div>'+
   '<div class="ayah" style="border:0"><div class="ar-text" lang="ar" id="sPrev">'+BISM+'</div></div></section>'+
  '<section class="block card"><h2 class="h2">'+esc(tr('Reading & listening'))+'</h2>'+toggleRow('English translation','en',L.en)+toggleRow('हिन्दी अनुवाद','hi',L.hi)+toggleRow('اردو ترجمہ','ur',L.ur)+
   '<div class="field"><label for="sGoal">'+esc(tr('Daily goal'))+'</label><input id="sGoal" type="number" min="1" max="100" value="'+p.goal+'" style="width:84px"></div>'+
   '<div class="field"><label for="sRec">'+esc(tr('Default reciter'))+'</label><select id="sRec" style="max-width:60%">'+rec+'</select></div>'+
   '<div class="field"><label>'+esc(tr('Reading & listening'))+'</label><button class="switch" id="sWake" role="switch" aria-checked="'+p.wake+'" aria-label="Wake"></button></div></section>'+
  '<section class="block"><a class="btn" href="#/prayer" style="width:100%">🕌 '+esc(tr('Namaz Timings & Azan'))+'</a></section>'+
  '<section class="block card"><h2 class="h2">'+esc(tr('Offline library'))+'</h2><p class="muted small" id="offInfo"></p><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm" id="offAll">'+icon('down')+' 114</button><button class="btn sm ghost" id="offClr">✕</button></div><div class="bar" style="margin-top:10px" hidden id="offBar"><i style="width:0"></i></div><div id="audList" style="margin-top:12px"></div><p class="muted small" id="offStor"></p></section>'+
  (deferred?'<section class="block"><button class="btn" data-act="install" style="width:100%">Zikr Deen</button></section>':'')+
  '<section class="block card"><h2 class="h2">'+esc(tr('Backup'))+'</h2><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm" id="bkOut">'+esc(tr('Backup'))+'</button><button class="btn sm ghost" id="bkIn">'+esc(tr('Continue'))+'</button><button class="btn sm ghost" id="bkReset">✕</button></div><input type="file" id="bkFile" accept="application/json,.json" hidden></section>'+
  '<section class="block card"><h2 class="h2">'+esc(tr('About'))+'</h2><p class="small">Zikr Deen · <a href="journey.html">'+esc(tr('30-day journey'))+'</a></p><p class="small"><a href="https://www.instagram.com/zikr.deen_/" target="_blank" rel="noopener noreferrer">@zikr.deen_</a></p></section></main>';
  const root=$('#moreRoot');$('#sTh').value=p.theme;const tg=$('#thGrid');if(tg)tg.addEventListener('click',e=>{const b=e.target.closest('[data-th]');if(!b)return;p.theme=b.dataset.th;$('#sTh').value=p.theme;tg.querySelectorAll('.th-card').forEach(x=>x.classList.toggle('on',x===b));ZD.applyPrefs();ZD.save()});$('#sIntro').value=p.intro;$('#sSnd').value=p.introSound;$('#introReplay').addEventListener('click',()=>{try{sessionStorage.setItem('zdReplay','1')}catch(e){}location.reload()});$('#sndTry').addEventListener('click',()=>{if(ZD.sound&&ZD.sound.supported)ZD.sound.preview($('#sSnd').value);else ZD.toast('Try again')});
  root.addEventListener('input',e=>{if(e.target.id==='sAr'){p.arSize=Number(e.target.value);ZD.applyPrefs();ZD.save()}else if(e.target.id==='sTr'){p.trSize=Number(e.target.value);ZD.applyPrefs();ZD.save()}else if(e.target.id==='sGoal'){p.goal=Math.min(100,Math.max(1,Math.round(Number(e.target.value))||3));ZD.save()}});
  root.addEventListener('change',e=>{if(e.target.id==='sBgMot'){p.bgMotion=e.target.checked;ZD.applyPrefs();ZD.save();return}else if(e.target.id==='sGlowMot'){p.glowMotion=e.target.checked;ZD.applyPrefs();ZD.save();return}else if(e.target.id==='sLang'&&ZD.i18n){ZD.i18n.set(e.target.value);return}else if(e.target.id==='sTh'){p.theme=e.target.value;ZD.applyPrefs();ZD.save()}else if(e.target.id==='sRec'){p.reciter=e.target.value;ZD.save();audioList()}else if(e.target.id==='sSnd'){p.introSound=e.target.value;ZD.save()}else if(e.target.id==='sIntro'){p.intro=e.target.value;ZD.save();ZD.toast(e.target.selectedOptions[0].text)}});
  root.addEventListener('click',e=>{const b=e.target.closest('[data-lang]');if(b){const on=b.getAttribute('aria-checked')!=='true';b.setAttribute('aria-checked',on);L[b.dataset.lang]=on;ZD.save()}});
  $('#sWake').addEventListener('click',e=>{const b=e.currentTarget,on=b.getAttribute('aria-checked')!=='true';b.setAttribute('aria-checked',on);p.wake=on;ZD.save()});
  const offInfo=$('#offInfo'),bar=$('#offBar'),all=$('#offAll');let stop=false;ZD.onLeave(()=>{stop=true});
  const refreshText=async()=>{const c=await ZD.cachedSurahs();offInfo.textContent=tr(c.size+' of 114 surahs saved for offline reading.')};
  const audioList=async()=>{const sum=await ZD.offlineSummary(),el=$('#audList');const ent=Object.entries(sum);
    el.innerHTML=ent.length?ent.map(([k,c])=>{const [r,s]=k.split('|'),sr=ZD.surah(Number(s)),rn=(ZD.RECITERS.find(x=>x[0]===r)||[r,r])[1];return '<div class="row" style="padding:8px 2px"><div class="mid"><b>'+esc(sr.en)+'</b><small>'+esc(rn)+' · '+c+' / '+sr.count+'</small></div><button class="ibtn" data-delaud="'+esc(k)+'" aria-label="Remove">'+icon('trash')+'</button></div>'}).join(''):''};
  $('#audList').addEventListener('click',async e=>{const d=e.target.closest('[data-delaud]');if(!d)return;const [r,s]=d.dataset.delaud.split('|');await ZD.deleteSurahAudio(r,Number(s));audioList();storage()});
  const storage=async()=>{try{const e=await navigator.storage.estimate();$('#offStor').textContent=fmtMB(e.usage||0)+(e.quota?' / '+fmtMB(e.quota):'')}catch(_){}};
  refreshText();audioList();storage();
  all.addEventListener('click',async()=>{all.disabled=true;bar.hidden=false;stop=false;const fail=await ZD.downloadAllText((d,t,f)=>{bar.firstChild.style.width=(d/t*100)+'%';offInfo.textContent=d+' / '+t},()=>stop);
    bar.hidden=true;all.disabled=false;await refreshText();storage();ZD.toast(fail.length?'Try again':'Saved')});
  $('#offClr').addEventListener('click',async()=>{await ZD.clearTextCache();await refreshText();storage();ZD.toast('Saved')});
  $('#bkOut').addEventListener('click',()=>{const o=Object.assign({app:'Zikr Deen App',exportedAt:new Date().toISOString()},JSON.parse(JSON.stringify(ZD.state())));ZD.download('zikr-deen-backup-'+ZD.today()+'.json',new Blob([JSON.stringify(o,null,1)],{type:'application/json'}))});
  $('#bkIn').addEventListener('click',()=>$('#bkFile').click());
  $('#bkFile').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;try{if(f.size>3e6)throw new Error('big');const j=JSON.parse(await f.text());if(!j||j.app!=='Zikr Deen App')throw new Error('wrong');if(!confirm('Zikr Deen?'))return;ZD.replaceState(j);ZD.toast('Saved');route()}catch(err){ZD.toast('Try again')}e.target.value=''});
  $('#bkReset').addEventListener('click',()=>{if(confirm('Zikr Deen?')){const keep=ZD.state().prefs;const fresh=ZD.sanitize({prefs:keep});ZD.replaceState(fresh);ZD.toast('Saved');route()}});
};
})();

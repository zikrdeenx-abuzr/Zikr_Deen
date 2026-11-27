(function(){'use strict';
const ZD=window.ZD,$=ZD.$,esc=ZD.esc,icon=ZD.icon,P=ZD.player,R=ZD.R;
const view=()=>$('#view');
const tr=s=>ZD.i18n&&typeof ZD.i18n.t==='function'?ZD.i18n.t(s):s;
const INT=[1,3,7,15,30,60,90];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const pick=a=>a[Math.floor(Math.random()*a.length)];
function top(title,sub,o){o=o||{};return '<header class="topbar">'+(o.back?'<button class="ibtn" data-act="back" aria-label="Back">'+icon('back')+'</button>':'')+'<h1>'+esc(tr(title))+(sub?'<span class="sub">'+esc(tr(sub))+'</span>':'')+'</h1>'+(o.right||'')+'</header>'}
const surahOpts=sel=>ZD.surahs().map(s=>'<option value="'+s.n+'"'+(s.n===sel?' selected':'')+'>'+s.n+'. '+esc(s.en)+' ('+s.count+')</option>').join('');
const numSel=(id,vals,cur,fmt)=>'<select id="'+id+'" class="sl">'+vals.map(v=>'<option value="'+v+'"'+(v===cur?' selected':'')+'>'+fmt(v)+'</option>').join('')+'</select>';
const seg=(id,items,cur)=>'<div class="seg" id="'+id+'" role="tablist">'+items.map(([k,l])=>'<button role="tab" aria-selected="'+(k===cur)+'" data-k="'+k+'">'+esc(tr(l))+'</button>').join('')+'</div>';
async function loadOrFail(s,box){try{return await ZD.loadSurah(s)}catch(e){box.innerHTML='<div class="empty"><div class="big">📡</div><p><b>'+esc(sr.en)+'</b></p><button class="btn" id="retry">'+esc(tr('Try again'))+'</button></div>';$('#retry').addEventListener('click',()=>ZD.route());return null}}
const revDue=()=>{const t=ZD.today();return ZD.state().rev.filter(r=>r.due<=t)};
const mulkDue=()=>ZD.mulkDueList?ZD.mulkDueList().length:0;
const inRevision=s=>ZD.state().rev.some(r=>r.s===s);
function addRevision(s,a1,a2){const st=ZD.state();if(st.rev.some(r=>r.s===s&&r.a1===a1&&r.a2===a2))return false;if(st.rev.length>=300){ZD.toast('Saved');return false}
  st.rev.push({s,a1,a2,stage:0,due:ZD.addDays(ZD.today(),1),added:ZD.today()});ZD.save();return true}

ZD.foldersHTML=function(){
  const due=revDue().length+mulkDue();
  const F=[
    ['#/juz','book','Quran','Juz Index'],
    ['#/surahs','hash','Surahs','114 surahs · 6,236 ayat'],
    ['#/learn','ayah','Ayah by Ayah','Ayah by Ayah'],
    ['#/namaz3d','pray','3D Namaz Grid','3D Namaz Guide'],
    ['#/ar-mode','pray','AR Camera Mode','Qibla Direction'],
    ['#/salah-builder','steps','Namaz','Namaz ka Tareeqa'],
    ['#/spot-mistake','puzzle','Puzzles','3D Namaz Grid'],
    ['#/knowledge-map','moon','Learn','Quran'],
    ['#/classroom','pray','Start here','Learn'],
    ['#/namaz','pray','Namaz','Namaz ka Tareeqa'],
    ['#/nz','pray','Mukammal Namaz','Namaz ka Tareeqa'],
    ['#/tasbih','moon','Daily Azkaar','Daily goal'],
    ['#/ruqiyah','pray','Daily Azkaar','Daily Azkaar'],
    ['#/zakat','hash','Daily goal','Daily goal'],
    ['#/progress','steps','Daily goal','day streak'],
    ['#/azkaar','moon','Daily Azkaar','Daily Azkaar'],
    ['#/hadith','book','Hadith','Kutub-e-Sitta · offline · Hinglish tarjuma'],
    ['#/repeat','repeat','Repeat','Repeat'],
    ['#/puzzle','puzzle','Puzzles','Puzzles'],
    ['#/revision','timer','Revision','Revision'+(due?' · '+due:''),due],
    ['./quiz/index.html','puzzle','Islamic Quiz','Islamic Quiz'],
    ['#/whatsapp','ask','Ask AI','Ask Zikr Deen'],
    ['#/visual-academy','moon','Learning folders','Everything in one place'],
    ['#/path','steps','Start here','Start here']
  ];
  return '<div class="folders">'+F.map(f=>'<a class="folder" href="'+f[0]+'">'+(f[4]?'<i class="badge">'+f[4]+'</i>':'')+icon(f[1])+'<b>'+esc(tr(f[2]))+'</b><span>'+esc(tr(f[3]))+'</span></a>').join('')+
   '<a class="folder wide" href="#/mulk">'+icon('moon')+'<div><b>'+esc(tr('Surah Al-Mulk'))+'</b><span>'+esc(tr('Open Hifz hub'))+'</span></div></a></div>'};
R.folders=function(){view().innerHTML=top('Learn','Everything in one place')+'<main>'+ZD.foldersHTML()+'</main>'};

const LS={rep:3,gap:4,level:0,meaning:false};
const BEGIN=[1,112,113,114,108,103,110,109,105,106,107,67];
R.learn=async function(args){
  const s=Number(args[0]);
  if(!ZD.surah(s)){
    view().innerHTML=top('Ayah by Ayah','Search surah')+'<main><label class="search">'+icon('search')+'<input id="q" type="search" placeholder="'+esc(tr('Search surah'))+'" autocomplete="off" aria-label="Search surah"></label><div id="lst"></div></main>';
    const all=ZD.surahs(),draw=f=>{const q=String(f||'').toLowerCase().replace(/[^a-z0-9]/g,'');const rows=q?all.filter(x=>String(x.n)===q||x.en.toLowerCase().replace(/[^a-z0-9]/g,'').includes(q)||x.mean.toLowerCase().replace(/[^a-z0-9]/g,'').includes(q)):BEGIN.map(n=>all[n-1]);
      $('#lst').innerHTML=(q?'':'<div class="lvl" style="margin-top:4px">'+esc(tr('Start here'))+'</div>')+rows.map(x=>'<a class="row" href="#/learn/'+x.n+'/1"><div class="num"><span>'+x.n+'</span></div><div class="mid"><b>'+esc(x.en)+'</b><small>'+esc(x.mean)+' · '+x.count+'</small></div><div class="arn" lang="ar">'+esc(x.ar)+'</div></a>').join('')};
    draw('');$('#q').addEventListener('input',e=>draw(e.target.value));return}
  const sr=ZD.surah(s);let a=clamp(Number(args[1])||1,1,sr.count);
  view().innerHTML=top(sr.en,'Ayah by Ayah',{back:true})+'<main id="lbody"><div class="skeleton"></div></main>';
  const box=$('#lbody'),d=await loadOrFail(s,box);if(!d)return;
  const draw=()=>{
    const x=d.ayahs[a-1],words=ZD.words(x.ar),langs=ZD.prefs().langs,hs=ZD.hiddenSet(a*7+s,words.length,LS.level);
    try{history.replaceState(null,'','#/learn/'+s+'/'+a)}catch(e){}
    ZD.setLast(s,a);
    box.innerHTML='<div class="card"><div class="progress-line"><div class="bar"><i style="width:'+Math.round((a-1)/sr.count*100)+'%"></i></div><span class="muted small">'+a+' / '+sr.count+'</span></div>'+
     '<div class="lab-ayah" lang="ar" id="lText">'+words.map((w,i)=>'<span class="w'+(hs.has(i)?' hid':'')+'">'+esc(w)+'</span>').join(' ')+'</div>'+
     '<div class="tr" id="lMean" lang="en" '+(LS.meaning?'':'hidden')+'>'+(x.en&&langs.en?'<small>English</small>'+esc(x.en):'')+(x.hi&&langs.hi?'<small style="margin-top:6px">हिन्दी</small>'+esc(x.hi):'')+(!(x.en&&langs.en)&&!(x.hi&&langs.hi)&&x.en?esc(x.en):'')+'</div>'+
     '<button class="btn sm ghost" id="lMeanBtn">'+esc(tr(LS.meaning?'Continue':'Begin'))+'</button></div>'+
    '<section class="block card"><h2 class="h2">'+esc(tr('Suno'))+'</h2><div class="field"><label for="lRep">'+esc(tr('Repeat'))+'</label>'+numSel('lRep',[1,3,5,10],LS.rep,v=>v+'×')+'</div><div class="field"><label for="lGap">'+esc(tr('Repeat'))+'</label>'+numSel('lGap',[0,3,4,6,10],LS.gap,v=>v?v+' s':'0')+'</div><button class="btn" id="lPlay" style="width:100%;margin-top:10px">'+icon('play')+' '+esc(tr('Suno'))+'</button></section>'+
    '<section class="block card"><h2 class="h2">'+esc(tr('Repeat'))+'</h2>'+seg('lLvl',[[0,'Begin'],[50,'Continue'],[100,'Saved']],LS.level)+'</section>'+
    '<div style="display:flex;gap:8px;margin:12px 0"><button class="btn ghost" id="lPrev" '+(a===1?'disabled':'')+' aria-label="Previous ayah">'+icon('prev')+'</button><button class="btn" id="lNext" style="flex:1">'+esc(tr(a<sr.count?'Continue':'Saved'))+'</button></div>';
    $('#lText').addEventListener('click',e=>{const w=e.target.closest('.w.hid');if(w)w.classList.remove('hid')});
    $('#lMeanBtn').addEventListener('click',()=>{LS.meaning=!LS.meaning;draw()});
    $('#lRep').addEventListener('change',e=>{LS.rep=Number(e.target.value)});$('#lGap').addEventListener('change',e=>{LS.gap=Number(e.target.value)});
    $('#lPlay').addEventListener('click',()=>ZD.playRange(s,a,a,{repeat:LS.rep,gap:LS.gap,autoNext:false,nextSurah:false}));
    $('#lLvl').addEventListener('click',e=>{const b=e.target.closest('[data-k]');if(b){LS.level=Number(b.dataset.k);draw()}});
    $('#lPrev').addEventListener('click',()=>{P.stop();a=Math.max(1,a-1);draw();window.scrollTo(0,0)});
    $('#lNext').addEventListener('click',()=>{P.stop();if(a<sr.count){a++;draw();window.scrollTo(0,0)}else done()});
  };
  const done=()=>{
    box.innerHTML='<div class="card" style="text-align:center"><div style="font-size:44px">🌟</div><h2 class="h2" style="margin:6px 0">'+esc(sr.en)+'</h2>'+
     '<div style="display:flex;flex-direction:column;gap:8px;margin-top:10px"><button class="btn" id="dRev">'+esc(tr('Revision'))+'</button><a class="btn ghost" href="#/puzzle/'+s+'">'+esc(tr('Puzzles'))+'</a><a class="btn ghost" href="#/path">'+esc(tr('Start here'))+'</a></div></div>';
    $('#dRev').addEventListener('click',e=>{const ok=addRevision(s,1,sr.count);e.target.disabled=true;e.target.textContent=ok?'✓':esc(tr('Saved'))});
  };
  draw();
};

const RP={s:1,from:1,to:3,rep:3,gap:5,loop:1,speed:1};
R.repeat=function(args){
  if(ZD.surah(Number(args[0]))){RP.s=Number(args[0]);RP.from=Number(args[1])||1;RP.to=Number(args[2])||ZD.surah(RP.s).count}
  const draw=()=>{const sr=ZD.surah(RP.s);RP.from=clamp(RP.from,1,sr.count);RP.to=clamp(RP.to,RP.from,sr.count);
    view().innerHTML=top('Repeat','Repeat')+'<main id="rpRoot">'+
    '<section class="card"><div class="field"><label for="rS">'+esc(tr('Surah'))+'</label><select id="rS" class="sl" style="max-width:62%">'+surahOpts(RP.s)+'</select></div>'+
    '<div class="field"><label for="rF">1</label><input id="rF" type="number" min="1" max="'+sr.count+'" value="'+RP.from+'" inputmode="numeric" style="width:92px"></div>'+
    '<div class="field"><label for="rT">'+sr.count+'</label><input id="rT" type="number" min="1" max="'+sr.count+'" value="'+RP.to+'" inputmode="numeric" style="width:92px"></div>'+
    '<div class="field"><label for="rR">'+esc(tr('Repeat'))+'</label>'+numSel('rR',[1,3,5,7,10,20],RP.rep,v=>v+'×')+'</div>'+
    '<div class="field"><label for="rG">'+esc(tr('Repeat'))+'</label>'+numSel('rG',[0,3,5,8,12],RP.gap,v=>v?v+' s':'0')+'</div>'+
    '<div class="field"><label for="rL">'+esc(tr('Repeat'))+'</label>'+numSel('rL',[1,2,3,5,10],RP.loop,v=>v+'×')+'</div>'+
    '<div class="field"><label for="rSp">1.0×</label>'+numSel('rSp',[0.75,0.9,1,1.15,1.3],RP.speed,v=>v+'×')+'</div>'+
    '<div style="display:flex;gap:8px;margin-top:12px"><button class="btn" id="rGo" style="flex:1">'+icon('play')+' '+esc(tr('Begin'))+'</button><button class="btn ghost" id="rStop">⏹</button></div><p class="muted small" id="rStat" style="margin:10px 0 0"></p></section></main>';
    const g=id=>$(id);
    g('#rS').addEventListener('change',e=>{RP.s=Number(e.target.value);RP.from=1;RP.to=Math.min(ZD.surah(RP.s).count,5);draw()});
    g('#rF').addEventListener('change',e=>{RP.from=Number(e.target.value)||1;if(RP.to<RP.from)RP.to=RP.from;draw()});g('#rT').addEventListener('change',e=>{RP.to=Number(e.target.value)||RP.from;draw()});
    g('#rR').addEventListener('change',e=>{RP.rep=Number(e.target.value)});g('#rG').addEventListener('change',e=>{RP.gap=Number(e.target.value)});g('#rL').addEventListener('change',e=>{RP.loop=Number(e.target.value)});g('#rSp').addEventListener('change',e=>{RP.speed=Number(e.target.value)});
    g('#rGo').addEventListener('click',()=>ZD.playRange(RP.s,RP.from,RP.to,{repeat:RP.rep,gap:RP.gap,speed:RP.speed,autoNext:true,nextSurah:false},RP.loop));
    g('#rStop').addEventListener('click',()=>P.stop());
  };
  draw();
  const un=ZD.onPlayer(p=>{const el=$('#rStat');if(!el)return;const it=p.cur();el.textContent=it&&it.s===RP.s?(it.a+' · '+(Math.min(p.rep+1,RP.rep)+'/'+RP.rep)):'—'});ZD.onLeave(un);
};

const PZ={s:1,mode:'order',score:0,total:0};
R.puzzle=async function(args){
  if(ZD.surah(Number(args[0])))PZ.s=Number(args[0]);
  view().innerHTML=top('Puzzles','Puzzles')+'<main id="pzRoot"><section class="card"><div class="field"><label for="pS">'+esc(tr('Surah'))+'</label><select id="pS" class="sl" style="max-width:62%">'+surahOpts(PZ.s)+'</select></div>'+
   seg('pMode',[['order','Begin'],['missing','Continue'],['next','Agla →']],PZ.mode)+'<div style="display:flex;justify-content:space-between;align-items:center"><span class="muted small" id="pScore"></span><button class="btn sm ghost" id="pNew">'+esc(tr('Continue'))+'</button></div></section><div id="pzBody" class="mt"><div class="skeleton"></div></div></main>';
  const body=$('#pzBody'),d=await loadOrFail(PZ.s,body);if(!d)return;
  const score=()=>{$('#pScore').textContent=PZ.score+' / '+PZ.total};score();
  const trBox=x=>x.en?'<div class="tr" lang="en">'+esc(x.en)+'</div>':'';
  const next=()=>{const m=PZ.mode;if(m==='order')order();else if(m==='missing')missing();else whatNext()};
  function randAyah(minW,maxW){const ids=d.ayahs.map((x,i)=>i).filter(i=>{const n=ZD.words(d.ayahs[i].ar).length;return n>=minW&&n<=maxW});return pick(ids.length?ids:d.ayahs.map((x,i)=>i))}
  function order(){
    const i=randAyah(3,12),x=d.ayahs[i],words=ZD.words(x.ar);let bank=shuffle(words.map((w,k)=>k)),built=[];if(words.length>1&&bank.every((v,k)=>v===k))bank.reverse();let fin=false;
    const paint=()=>{body.innerHTML='<div class="card"><div class="muted small">'+esc(ZD.surah(PZ.s).en)+' · '+(i+1)+'</div>'+trBox(x)+'<div class="built mt" id="built">'+(built.map((k,n)=>'<button class="wchip" data-un="'+n+'">'+esc(words[k])+'</button>').join('')||'')+'</div><div class="chipbank">'+bank.map(k=>'<button class="wchip'+(built.includes(k)?' used':'')+'" data-ch="'+k+'">'+esc(words[k])+'</button>').join('')+'</div><div class="fb" id="fb"></div><div style="display:flex;gap:8px"><button class="btn sm ghost" id="again">✕</button><button class="btn sm" id="nx" hidden>'+esc(tr('Agla →'))+'</button></div></div>';
      const fb=$('#fb');if(built.length===words.length){const ok=built.every((k,n)=>words[k]===words[n]);fb.className='fb '+(ok?'ok':'bad');fb.textContent=ok?'✓':'✕';if(ok&&!fin){fin=true;PZ.score++;PZ.total++;score()}if(ok)$('#nx').hidden=false}else fb.textContent=built.length+' / '+words.length;
      body.onclick=e=>{const c=e.target.closest('[data-ch]'),u=e.target.closest('[data-un]');if(c&&!built.includes(Number(c.dataset.ch))&&built.length<words.length&&!fin){built.push(Number(c.dataset.ch));paint()}if(u&&!fin){built.splice(Number(u.dataset.un),1);paint()}if(e.target.id==='again'&&!fin){bank=shuffle(bank);built=[];paint()}if(e.target.id==='nx')order()};
    };paint();
  }
  function missing(){
    const i=randAyah(4,14),x=d.ayahs[i],words=ZD.words(x.ar),idxs=words.map((w,k)=>k).filter(k=>words[k].replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\s]/g,'').length>=3);const k=pick(idxs.length?idxs:words.map((w,n)=>n)),right=words[k];
    const pool=[...new Set(d.ayahs.flatMap(a=>ZD.words(a.ar)))].filter(w=>w!==right);let opts=shuffle([right,...shuffle(pool).slice(0,3)]);let done=false;
    body.innerHTML='<div class="card"><div class="muted small">'+esc(ZD.surah(PZ.s).en)+' · '+(i+1)+'</div>'+trBox(x)+'<div class="lab-ayah" lang="ar">'+words.map((w,n)=>n===k?'<span class="w hid" style="min-width:2.4em">&nbsp;</span>':esc(w)).join(' ')+'</div>'+opts.map(o=>'<button class="opt" data-o="'+esc(o)+'" lang="ar">'+esc(o)+'</button>').join('')+'<div class="fb" id="fb"></div><button class="btn sm" id="nx" hidden>'+esc(tr('Agla →'))+'</button></div>';
    body.onclick=e=>{if(e.target.id==='nx'){missing();return}const b=e.target.closest('[data-o]');if(!b||done)return;done=true;const ok=b.dataset.o===right;PZ.total++;if(ok)PZ.score++;score();
      ZD.$$('.opt',body).forEach(o=>{if(o.dataset.o===right)o.classList.add('ok');else if(o===b)o.classList.add('bad')});const fb=$('#fb');fb.className='fb '+(ok?'ok':'bad');fb.textContent=ok?'✓':'✕';$('#nx').hidden=false};
  }
  function whatNext(){
    const n=d.ayahs.length;if(n<4){body.innerHTML='<div class="empty"><div class="big">🧩</div><p>—</p></div>';return}
    const i=randAyah(2,16);const a=Math.min(i,n-2),right=a+1;const wrong=shuffle(d.ayahs.map((x,k)=>k).filter(k=>k!==right&&k!==a)).slice(0,3);const opts=shuffle([right,...wrong]);let done=false;
    const fw=(t,k)=>{const w=ZD.words(t);return w.slice(0,k).join(' ')+(w.length>k?' …':'')};
    body.innerHTML='<div class="card"><div class="muted small">'+(a+1)+' → '+(a+2)+'</div><div class="lab-ayah" lang="ar" style="font-size:calc(var(--ar-size) - 6px)">'+esc(fw(d.ayahs[a].ar,14))+'</div>'+opts.map(o=>'<button class="opt" data-o="'+o+'" lang="ar">'+esc(fw(d.ayahs[o].ar,7))+'</button>').join('')+'<div class="fb" id="fb"></div><button class="btn sm" id="nx" hidden>'+esc(tr('Agla →'))+'</button></div>';
    body.onclick=e=>{if(e.target.id==='nx'){whatNext();return}const b=e.target.closest('[data-o]');if(!b||done)return;done=true;const ok=Number(b.dataset.o)===right;PZ.total++;if(ok)PZ.score++;score();
      ZD.$$('.opt',body).forEach(o=>{if(Number(o.dataset.o)===right)o.classList.add('ok');else if(o===b)o.classList.add('bad')});const fb=$('#fb');fb.className='fb '+(ok?'ok':'bad');fb.textContent=ok?'✓':'✕';$('#nx').hidden=false};
  }
  $('#pS').addEventListener('change',e=>{PZ.s=Number(e.target.value);ZD.route()});
  $('#pMode').addEventListener('click',e=>{const b=e.target.closest('[data-k]');if(!b)return;PZ.mode=b.dataset.k;ZD.$$('#pMode button').forEach(x=>x.setAttribute('aria-selected',x===b));next()});
  $('#pNew').addEventListener('click',next);next();
};

R.revision=function(){
  const st=ZD.state(),t=ZD.today(),due=revDue().sort((a,b)=>a.due.localeCompare(b.due)),all=st.rev.slice().sort((a,b)=>a.due.localeCompare(b.due)),later=all.filter(r=>r.due>t),md=mulkDue();
  const label=r=>{const sr=ZD.surah(r.s);return esc(sr.en)+' '+(r.a1===1&&r.a2===sr.count?'':r.a1===r.a2?r.s+':'+r.a1:r.s+':'+r.a1+'–'+r.a2)};
  const idx=r=>st.rev.indexOf(r);
  view().innerHTML=top('Revision','Revision')+'<main id="rvRoot">'+
   '<section class="card"><div class="stat3" style="margin-top:0"><div><b>'+due.length+'</b><span>'+esc(tr('Daily goal'))+'</span></div><div><b>'+st.rev.length+'</b><span>'+esc(tr('Saved'))+'</span></div><div><b>'+md+'</b><span>'+esc(tr('Al-Mulk'))+'</span></div></div>'+
   (md?'<a class="btn sm mt" href="#/mulk/revise">'+esc(tr('Surah Al-Mulk'))+' ('+md+')</a>':'')+'</section>'+
   '<section class="block"><h2 class="h2">'+esc(tr('Revision'))+'</h2>'+(due.length?due.map(r=>'<div class="row"><div class="mid"><b>'+label(r)+'</b><small>'+r.due+'</small></div><div class="acts"><button class="btn sm" data-rv="'+idx(r)+'">'+esc(tr('Begin'))+'</button></div></div>').join(''):'<div class="empty" style="padding:18px"><div class="big">✅</div></div>')+'</section>'+
   '<section class="block card"><h2 class="h2">'+esc(tr('Begin'))+'</h2><div class="field"><label for="aS">'+esc(tr('Surah'))+'</label><select id="aS" class="sl" style="max-width:62%">'+surahOpts(1)+'</select></div><div class="field"><label for="aF">1</label><input id="aF" type="number" min="1" value="1" style="width:92px"></div><div class="field"><label for="aT">7</label><input id="aT" type="number" min="1" value="7" style="width:92px"></div><button class="btn mt" id="aGo" style="width:100%">+ '+esc(tr('Revision'))+'</button></section>'+
   (later.length?'<section class="block"><h2 class="h2">'+esc(tr('Continue'))+'</h2>'+later.map(r=>'<div class="row"><div class="mid"><b>'+label(r)+'</b><small>'+r.due+'</small></div><div class="acts"><button class="ibtn" data-rd="'+idx(r)+'" aria-label="Remove from series">'+icon('trash')+'</button></div></div>').join('')+'</section>':'')+'</main>';
  const sr=()=>ZD.surah(Number($('#aS').value)),fix=()=>{const n=sr().count;$('#aF').max=n;$('#aT').max=n;$('#aT').value=Math.min(n,Number($('#aT').value)||n);if(Number($('#aF').value)>n)$('#aF').value=1};
  $('#aS').addEventListener('change',()=>{$('#aF').value=1;$('#aT').value=sr().count;fix()});$('#aS').dispatchEvent(new Event('change'));
  $('#aGo').addEventListener('click',()=>{const s=Number($('#aS').value),n=ZD.surah(s).count,a1=clamp(Math.round(Number($('#aF').value))||1,1,n),a2=clamp(Math.round(Number($('#aT').value))||n,a1,n);if(addRevision(s,a1,a2)){ZD.toast('Saved');R.revision()}else ZD.toast('Saved')});
  $('#rvRoot').addEventListener('click',e=>{const rv=e.target.closest('[data-rv]'),rd=e.target.closest('[data-rd]');
    if(rd){st.rev.splice(Number(rd.dataset.rd),1);ZD.save();R.revision();ZD.toast('Saved')}
    if(rv)review(st.rev[Number(rv.dataset.rv)])});
};
async function review(r){
  if(!r)return;const sr=ZD.surah(r.s);let d;
  ZD.openSheet('<h3>'+esc(sr.en)+' '+r.a1+(r.a2>r.a1?'–'+r.a2:'')+'</h3><div id="rvBody"><div class="spin"></div></div>');
  try{d=await ZD.loadSurah(r.s)}catch(e){$('#rvBody').innerHTML='<p class="err">!</p>';return}
  const shown=Math.min(r.a2,r.a1+5);let h='<button class="btn sm ghost" id="rvPlay">'+icon('play')+' '+esc(tr('Suno'))+'</button>';
  for(let a=r.a1;a<=shown;a++)h+='<button class="opt" data-a="'+a+'" lang="ar" style="margin:8px 0">'+a+'</button>';
  h+='<div class="rate"><button class="hard" data-rate="forgot">1</button><button data-rate="hard">2</button><button class="good" data-rate="easy">3</button></div>';
  $('#rvBody').innerHTML=h;const sh=$('#sheet');
  sh.addEventListener('click',e=>{const o=e.target.closest('[data-a]');if(o&&o.dataset.a){o.textContent=d.ayahs[Number(o.dataset.a)-1].ar;o.removeAttribute('data-a')}
    if(e.target.closest('#rvPlay'))ZD.playRange(r.s,r.a1,r.a2,{repeat:1,gap:0,autoNext:true,nextSurah:false},1);
    const b=e.target.closest('[data-rate]');if(b){const k=b.dataset.rate;if(k==='easy')r.stage=Math.min(6,r.stage+1);else if(k==='hard')r.stage=Math.max(0,r.stage-1);else r.stage=0;
      r.due=ZD.addDays(ZD.today(),k==='forgot'?1:INT[r.stage]);ZD.save();ZD.closeSheet();ZD.toast(r.due);R.revision()}});
}

const STEPS=[
 ['Takbir','اللَّهُ أَكْبَرُ','اللَّهُ أَكْبَرُ'],
 ['Qiyam','سُبْحَانَكَ اللَّهُمَّ','سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالَى جَدُّكَ وَلَا إِلَهَ غَيْرُكَ'],
 ['Ruku','سُبْحَانَ رَبِّيَ الْعَظِيمِ','سُبْحَانَ رَبِّيَ الْعَظِيمِ'],
 ['Qawmah','سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ','سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ — رَبَّنَا لَكَ الْحَمْدُ'],
 ['Sajdah','سُبْحَانَ رَبِّيَ الْأَعْلَى','سُبْحَانَ رَبِّيَ الْأَعْلَى'],
 ['Qa’dah','التَّحِيَّاتُ لِلَّهِ','التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ'],
 ['Salam','السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ','السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ']];
const SHORT=[[1,'1'],[112,'112'],[108,'108'],[103,'103'],[110,'110'],[109,'109'],[105,'105'],[106,'106'],[113,'113'],[114,'114']];
R.namaz=function(args){
  const tab=args[0]||'steps';
  const tabs='<div class="seg" role="tablist">'+[['steps','Namaz ka Tareeqa'],['rakats','Namaz'],['recite','Quran']].map(([k,l])=>'<button role="tab" aria-selected="'+(k===tab)+'" data-go="#/namaz/'+k+'">'+esc(tr(l))+'</button>').join('')+'</div>';
  let body='';
  if(tab==='rakats'){
    body='<section class="card"><table class="tbl"><tr><th>'+esc(tr('Namaz'))+'</th><th>Fard</th></tr><tr><td>Fajr</td><td>2</td></tr><tr><td>Dhuhr</td><td>4</td></tr><tr><td>Asr</td><td>4</td></tr><tr><td>Maghrib</td><td>3</td></tr><tr><td>Isha</td><td>4</td></tr><tr><td>Jumu’ah</td><td>2</td></tr></table></section>';
  }else if(tab==='recite'){
    body='<section class="card">'+SHORT.map(([n])=>{const sr=ZD.surah(n);return '<div class="row"><div class="num"><span>'+n+'</span></div><div class="mid"><b>'+esc(sr.en)+'</b><small>'+sr.count+'</small></div><div class="acts"><a class="pill" href="#/learn/'+n+'/1">'+esc(tr('Begin'))+'</a><button class="ibtn" data-pl="'+n+'" aria-label="Play '+esc(sr.en)+'">'+icon('play')+'</button></div></div>'}).join('')+'</section>';
  }else{
    body='<ol class="steps">'+STEPS.map(([t2,p,ar])=>'<li><b>'+esc(t2)+'</b>'+(ar?'<div class="ar-line" lang="ar">'+esc(ar)+'</div>':'')+'<p>'+esc(p)+'</p></li>').join('')+'</ol>';
  }
  view().innerHTML=top('Namaz','Namaz ka Tareeqa',{back:false})+'<main id="nzRoot">'+tabs+body+'</main>';
  $('#nzRoot').addEventListener('click',e=>{const b=e.target.closest('[data-pl]');if(b){ZD.playSurah(Number(b.dataset.pl),1,{noChain:true});ZD.toast(ZD.surah(Number(b.dataset.pl)).en)}});
};

const LEVELS=[['1',[1,112,108,103,110]],['2',[109,105,106,113,114]],['3',[107,104,102,101,100]],['4',[67]]];
function pathDone(s){if(s===67){const m=ZD.state().mulk.status;let c=0;for(let i=1;i<=30;i++)if(m[i]==='memorised')c++;return c===30}return inRevision(s)}
R.path=function(args){
  const s=Number(args[0]);
  if(ZD.surah(s)){
    const sr=ZD.surah(s),mulk=s===67;
    view().innerHTML=top(sr.en,sr.mean+' · '+sr.count,{back:true})+'<main id="phRoot"><ol class="steps">'+
     '<li><b>'+esc(tr('Suno'))+'</b><button class="btn sm mt" data-do="listen">'+icon('play')+' '+esc(tr('Suno'))+'</button></li>'+
     '<li><b>'+esc(tr('Quran'))+'</b><a class="btn sm mt" href="#/read/'+s+'/1">'+esc(tr('Quran'))+'</a></li>'+
     '<li><b>'+esc(tr('Ayah by Ayah'))+'</b><a class="btn sm mt" href="'+(mulk?'#/mulk/lab/1':'#/learn/'+s+'/1')+'">'+esc(tr('Begin'))+'</a></li>'+
     '<li><b>'+esc(tr('Puzzles'))+'</b><a class="btn sm mt" href="#/puzzle/'+s+'">'+esc(tr('Puzzles'))+'</a></li>'+
     '<li><b>'+esc(tr('Revision'))+'</b><button class="btn sm mt" data-do="rev">'+(inRevision(s)?'✓':esc(tr('Revision')))+'</button></li></ol></main>';
    $('#phRoot').addEventListener('click',e=>{const b=e.target.closest('[data-do]');if(!b)return;if(b.dataset.do==='listen')ZD.playSurah(s,1,{noChain:true});else{const ok=addRevision(s,1,sr.count);b.textContent=ok?'✓':'✓';ZD.toast('Saved')}});
    return}
  const total=LEVELS.reduce((n,l)=>n+l[1].length,0),done=LEVELS.reduce((n,l)=>n+l[1].filter(pathDone).length,0);
  view().innerHTML=top('Start here','Everything in one place')+'<main><section class="card"><div class="progress-line"><div class="bar"><i style="width:'+Math.round(done/total*100)+'%"></i></div><span class="muted small">'+done+' / '+total+'</span></div></section>'+
   LEVELS.map(([name,list])=>'<div class="lvl">'+esc(name)+'</div>'+list.map(n=>{const sr=ZD.surah(n),dn=pathDone(n);return '<a class="pathrow" href="#/path/'+n+'"><span class="tick'+(dn?' done':'')+'">'+(dn?icon('check'):'')+'</span><div style="flex:1;min-width:0"><b>'+esc(sr.en)+'</b><div class="muted small">'+esc(sr.mean)+' · '+sr.count+'</div></div><span class="arn ar" style="font-size:22px;color:var(--gold-soft)">'+esc(sr.ar)+'</span></a>'}).join('')).join('')+'</main>';
};
})();

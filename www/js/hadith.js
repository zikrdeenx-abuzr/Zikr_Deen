(function(){'use strict';
const ZD=window.ZD,$=ZD.$,$$=ZD.$$,esc=ZD.esc,icon=ZD.icon,R=ZD.R;
const view=()=>$('#view');
const tr=s=>ZD.i18n&&typeof ZD.i18n.t==='function'?ZD.i18n.t(s):s;
const top=(t,sub)=>'<header class="topbar"><button class="ibtn" data-act="back" aria-label="Back">'+icon('back')+'</button><h1>'+esc(tr(t))+(sub?'<span class="sub">'+esc(tr(sub))+'</span>':'')+'</h1></header>';
const BOOKS=[
 ['bukhari','Al-Bukhari','Imam Bukhari','صحيح البخاري',97,1],['muslim','Al-Muslim','Imam Muslim','صحيح مسلم',56,1],
 ['tirmidhi','Al-Tirmizi','Imam Tirmidhi','جامع الترمذي',49,1],['abudawud','Abu Dawood','Imam Abu Dawud','سنن أبي داود',43,1],
 ['nasai','Al-Nasai',"Imam Nasa'i",'سنن النسائي',51,1],['ibnmajah','Sunnan e Ibn e Maja','Imam Ibn Majah','سنن ابن ماجه',37,1],
 ['silsila','Al-Silsila','Shaikh Albani','السلسلة الصحيحة',0,0],['ahmad','Musnad Ahmed','Imam Ahmad','مسند أحمد',0,0]];
const bk=id=>BOOKS.find(b=>b[0]===id);
const REF_BOOKS={bukhari:'Sahih al-Bukhari',muslim:'Sahih Muslim',tirmidhi:'Jami at-Tirmidhi',abudawud:'Sunan Abi Dawud',nasai:"Sunan an-Nasa'i",ibnmajah:'Sunan Ibn Majah'};
const refBook=id=>REF_BOOKS[id]||((bk(id)||[])[1]||'Hadith collection');
function refKey(value){
  let s=String(value==null?'':value).trim().toLowerCase().replace(/\s+/g,'');
  if(!s)return'';
  let m=s.match(/^(\d+)\.([0-9]{1,2})$/);
  if(m){
    const base=Number(m[1]);
    if(!base)return'';
    const dec=m[2].padEnd(2,'0'),n=Number(dec);
    if(n===0)return String(base);
    return n>=1&&n<=26?String(base)+String.fromCharCode(96+n):String(base)+'.'+dec;
  }
  m=s.match(/^(\d+)([a-z])$/);
  if(m){const base=Number(m[1]);return base?String(base)+m[2]:''}
  if(/^\d+$/.test(s)){const base=Number(s);return base?String(base):''}
  return'';
}
function displayRef(value){return refKey(value)||'Unverified'}
function matchedLangText(map,key,publicRef){
  const item=map.get(key);
  if(!item||!item.text)return'';
  if(publicRef&&item.ref&&item.ref!==publicRef)return'';
  return item.text;
}
function matchRefs(list,getAr,wanted){
  let m=list.filter(r=>refKey(getAr(r))===wanted);
  if(!m.length&&/^\d+$/.test(wanted)){
    m=list.filter(r=>{const k=refKey(getAr(r));return k.startsWith(wanted)&&/^[a-z]$/.test(k.slice(wanted.length))});
  }
  return m;
}
function makeInBook(bookNo,hadithNo){return Number(bookNo)>0&&Number(hadithNo)>0?'In-book: Book '+bookNo+', Hadith '+hadithNo:''}
function makeRef(id,value){const n=displayRef(value);return n==='Unverified'?'Reference unverified':refBook(id)+' '+n}
const BASES=['https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/','https://raw.githubusercontent.com/fawazahmed0/hadith-api/1/'];
let dbp=null;
function db(){if(!dbp)dbp=new Promise((res,rej)=>{try{const r=indexedDB.open('zd-hadith',2);r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains('ed'))d.createObjectStore('ed');if(!d.objectStoreNames.contains('hi'))d.createObjectStore('hi')};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}catch(e){rej(e)}});return dbp}
async function idb(store,mode,fn){const d=await db();return new Promise((res,rej)=>{const t=d.transaction(store,mode),s=t.objectStore(store),q=fn(s);t.oncomplete=()=>res(q&&q.result);t.onerror=()=>rej(t.error);t.onabort=()=>rej(t.error||new Error('aborted'))})}
const idbGet=(st,k)=>idb(st,'readonly',s=>s.get(k)).catch(()=>undefined);
const idbSet=(st,k,v)=>idb(st,'readwrite',s=>s.put(v,k));
const idbDel=(st,k)=>idb(st,'readwrite',s=>s.delete(k));
const mem={};
async function local(ed){if(mem[ed])return mem[ed];const r=await idbGet('ed',ed);if(r){if(r.v!==2||!Array.isArray(r.h)||r.h.some(x=>!Array.isArray(x)||x.length<6)){await idbDel('ed',ed).catch(()=>{});return null}r.idx=null;r.no=null;mem[ed]=r}return r||null}
function bySec(L){if(L.idx)return L.idx;const m={};L.h.forEach(x=>{(m[x[2]]=m[x[2]]||[]).push(x)});return L.idx=m}
function byNo(L){if(L.no)return L.no;const m=new Map();L.h.forEach(x=>m.set(x[0],{text:x[1],ref:refKey(x[4])}));return L.no=m}
async function offline(id){const [a,u,e]=await Promise.all(['ara-','urd-','eng-'].map(p=>local(p+id)));return a&&u&&e?{a,u,e}:null}
async function fetchJSON(path,onProg){
  let err;
  for(const base of BASES)for(const ext of ['.min.json','.json']){
    try{
      const r=await fetch(base+path+ext);if(!r.ok){err=new Error('HTTP '+r.status);continue}
      const total=Number(r.headers.get('content-length'))||0;
      if(!r.body||!r.body.getReader||!onProg){return await r.json()}
      const rd=r.body.getReader(),parts=[];let got=0;
      for(;;){const {done,value}=await rd.read();if(done)break;parts.push(value);got+=value.length;onProg(got,total)}
      const buf=new Uint8Array(got);let o=0;parts.forEach(p=>{buf.set(p,o);o+=p.length});
      return JSON.parse(new TextDecoder('utf-8').decode(buf));
    }catch(e){err=e}
  }
  throw err||new Error('fail');
}
async function download(id,onStat){
  const eds=['ara-','urd-','eng-'];let size=0;
  for(let i=0;i<eds.length;i++){
    const ed=eds[i]+id,nm=['Arabic','Urdu','English'][i];
    onStat(nm+' ('+(i+1)+'/3)');
    const j=await fetchJSON('editions/'+ed,(g,t)=>onStat(nm+' ('+(i+1)+'/3) · '+(g/1048576).toFixed(1)+' MB'+(t?' / '+(t/1048576).toFixed(1)+' MB':'')));
    const secs={};const ms=j.metadata&&j.metadata.section;if(ms)for(const k in ms)secs[k]=ms[k];
    const h=(j.hadiths||[]).map(x=>[x.hadithnumber,x.text||'',x.reference&&x.reference.book!=null?x.reference.book:0,(x.grades||[]).map(g=>g.grade).filter(Boolean).join(' · '),x.arabicnumber==null?'':String(x.arabicnumber),x.reference&&x.reference.hadith!=null?x.reference.hadith:null]);
    if(!h.length)throw new Error('empty');
    size+=JSON.stringify(h).length;
    await idbSet('ed',ed,{id:ed,v:2,secs,h,at:Date.now()});delete mem[ed];
  }
  return size;
}
async function removeOffline(id){for(const p of['ara-','urd-','eng-']){await idbDel('ed',p+id);delete mem[p+id]}}
const cache={};
async function api(path){if(cache[path])return cache[path];const j=await fetchJSON(path);cache[path]=j;return j}
const HSYS='You translate Islamic hadith into simple Hinglish (Hindi-Urdu written in Roman letters, easy for everyday Indian readers). Be faithful to the meaning; do not add commentary, explanation or extra hadith. Keep "Allah", "Nabi ﷺ", "Rasulullah ﷺ", names of Sahaba with "(RA)". Output exactly what is asked and nothing else.';
const hiKey=(b,n)=>b+':'+n;
const hiMem={};
async function hiGet(b,n){const k=hiKey(b,n);if(hiMem[k])return hiMem[k];const v=await idbGet('hi',k);if(v)hiMem[k]=v;return v||''}
async function hiSet(b,n,t){hiMem[hiKey(b,n)]=t;try{await idbSet('hi',hiKey(b,n),t)}catch(e){}}
function parseArr(t,n){
  t=String(t).replace(/```json|```/g,'').trim();const a=t.indexOf('['),z=t.lastIndexOf(']');
  if(a<0||z<0)throw new Error('format');const r=JSON.parse(t.slice(a,z+1));
  if(!Array.isArray(r)||r.length!==n)throw new Error('count');return r.map(x=>String(x).trim());
}
async function translate(book,items){
  const body=items.map((x,i)=>(i+1)+'. '+x.en.slice(0,1500)).join('\n\n');
  const prompt='Translate the following '+items.length+' hadiths into simple Hinglish. Return ONLY a JSON array of '+items.length+' strings.\n\n'+body;
  let out,err;
  for(let t=0;t<3;t++){
    try{out=parseArr(await ZD.askOnce(prompt,HSYS),items.length);break}
    catch(e){err=e;if(e.status===429)await new Promise(r=>setTimeout(r,15000*(t+1)));else if(t>=1)break}
  }
  if(!out)throw err||new Error('fail');
  for(let i=0;i<items.length;i++)await hiSet(book,items[i].n,out[i]);
  return out;
}

const LK='zdHdLang';
function appLangCode(){
  try{return window.ZD&&window.ZD.i18n&&typeof window.ZD.i18n.get==='function'?window.ZD.i18n.get():(localStorage.getItem('zdLang')||'en')}catch(e){return'en'}
}
function mapAppLangToHadithTab(appLang){
  if(appLang==='ur'||appLang==='fa'||appLang==='ar')return 'ur';
  if(appLang==='en')return 'en';
  return 'hi';
}
const getLang=()=>mapAppLangToHadithTab(appLangCode());
const setLang=v=>{
  try{localStorage.setItem(LK,v)}catch(e){}
  try{
    if(window.ZD&&window.ZD.i18n&&typeof window.ZD.i18n.set==='function'){
      const cur=window.ZD.i18n.get();
      if(v==='ur'&&cur!=='ur'&&cur!=='fa'&&cur!=='ar')window.ZD.i18n.set('ur');
      else if(v==='en'&&cur!=='en')window.ZD.i18n.set('en');
      else if(v==='hi'&&cur!=='hi'&&cur!=='hinglish')window.ZD.i18n.set('hi');
    }
  }catch(e){}
};
document.addEventListener('zikr:languagechange',e=>{
  const nextAppLang=(e&&e.detail&&e.detail.language)||appLangCode();
  try{localStorage.setItem(LK,mapAppLangToHadithTab(nextAppLang))}catch(_){}
});

const LANGS=[['hi','Hinglish'],['ur','Urdu'],['en','English']];
const seg=cur=>'<div class="seg" id="hdSeg" role="tablist">'+LANGS.map(([k,l])=>'<button role="tab" aria-selected="'+(k===cur)+'" data-k="'+k+'">'+l+'</button>').join('')+'</div>';
const fail=box=>{box.innerHTML='<div class="empty"><div class="big">📡</div><p><b>'+esc(tr('Try again'))+'</b></p><button class="btn" id="retry">'+esc(tr('Try again'))+'</button></div>';$('#retry').addEventListener('click',()=>ZD.route())};
let CUR={};
const nl=t=>esc(t||'');

R.hadith=async function(){
  const st={};await Promise.all(BOOKS.filter(b=>b[5]).map(async b=>{st[b[0]]=!!(await offline(b[0]))}));
  if(location.hash.indexOf('#/hadith')!==0)return;
  view().innerHTML=top('Hadith','Kutub-e-Sitta · offline · Hinglish tarjuma')+'<main>'+
   '<form class="card nz-g" id="hdGo" style="display:flex;gap:8px;align-items:center"><select id="hdB" class="sl">'+BOOKS.filter(b=>b[5]).map(b=>'<option value="'+b[0]+'">'+esc(b[1])+'</option>').join('')+'</select><input id="hdN" type="text" maxlength="12" autocomplete="off" placeholder="455 / 183b"><button class="btn sm" type="submit">'+esc(tr('Continue'))+'</button></form>'+
   BOOKS.map(b=>b[5]?
    '<div class="card hd-bk"><a class="hd-bkh" href="#/hbook/'+b[0]+'"><div style="min-width:0"><b>'+esc(b[1])+'</b><div class="muted small">'+esc(b[2])+' · '+esc(tr('Kitaab '+b[4]))+'</div></div><span class="ar" lang="ar">'+b[3]+'</span></a>'+
     '<div class="hd-dl" id="dl_'+b[0]+'">'+(st[b[0]]?'<span class="hd-ok">✓</span><button class="btn sm ghost" data-rm="'+b[0]+'">✕</button>':'<button class="btn sm" data-dl="'+b[0]+'">⬇</button>')+'</div></div>':
    '<div class="card hd-bk hd-soon"><div class="hd-bkh"><div style="min-width:0"><b>'+esc(b[1])+'</b><div class="muted small">'+esc(b[2])+'</div></div><span class="ar" lang="ar">'+b[3]+'</span></div></div>').join('')+
   '<button class="btn" id="dlAll" style="width:100%;margin-top:12px">⬇ 6</button></main>';
  $('#hdGo').addEventListener('submit',e=>{e.preventDefault();const n=String($('#hdN').value||'').trim().toLowerCase().replace(/\s+/g,'');if(refKey(n))location.hash='#/hone/'+$('#hdB').value+'/'+n;else ZD.toast('455 / 183b')});
  $('#dlAll').addEventListener('click',async e=>{e.target.disabled=true;for(const b of BOOKS.filter(x=>x[5]))if(!st[b[0]]){const ok=await runDl(b[0]);if(!ok)break}R.hadith()});
};
async function runDl(id){
  const box=$('#dl_'+id);if(!box)return false;
  const set=t=>{const b=$('#dl_'+id);if(b)b.innerHTML='<span class="muted small">'+esc(t)+'</span>'};
  try{set('…');await download(id,set);return true}
  catch(e){console.error(e);const b=$('#dl_'+id);if(b)b.innerHTML='<span class="hd-err">!</span> <button class="btn sm" data-dl="'+id+'">'+esc(tr('Try again'))+'</button>';return false}
}
document.addEventListener('click',async e=>{
  const d=e.target.closest('[data-dl]');if(d){d.disabled=true;if(await runDl(d.dataset.dl))R.hadith();return}
  const r=e.target.closest('[data-rm]');if(r){if(confirm('✕')){await removeOffline(r.dataset.rm);R.hadith()}}
});

R.hbook=async function(a){
  const b=bk(a[0]);if(!b||!b[5]){location.hash='#/hadith';return}
  view().innerHTML=top(b[1],b[2])+'<main><p class="muted" style="padding:14px 4px">…</p></main>';
  const L=await local('eng-'+b[0])||await local('ara-'+b[0]);
  if(location.hash.indexOf('#/hbook/')!==0)return;
  if(L){
    const idx=bySec(L),keys=Object.keys(L.secs).filter(k=>idx[k]).sort((x,y)=>x-y);
    const ks=keys.length?keys:Object.keys(idx).sort((x,y)=>x-y);
    $('main').innerHTML=ks.map(k=>'<a class="row" href="#/hsec/'+b[0]+'/'+k+'"><span class="num"><span>'+k+'</span></span><div style="flex:1;min-width:0"><b>'+esc(L.secs[k]||tr('Kitaab '+k))+'</b><div class="muted small">'+esc(tr(idx[k].length+' hadith'))+'</div></div>'+icon('back','nz-arr')+'</a>').join('');
  }else{
    let t='';for(let i=1;i<=b[4];i++)t+='<a class="tile" href="#/hsec/'+b[0]+'/'+i+'" style="align-items:center;padding:14px 8px"><b>'+i+'</b><span style="margin:0">'+esc(tr('Kitaab '+i))+'</span></a>';
    $('main').innerHTML='<div class="tiles" style="grid-template-columns:repeat(3,1fr)">'+t+'</div>';
  }
};

function card(book,h,lang){
  const n=h.n,x=CUR[n];
  let body;
  if(lang==='hi')body='<div class="hd-tr" id="hi_'+n+'">'+(x.hi?nl(x.hi):(x.en?'<button class="btn sm" data-hi="'+n+'">AI · Hinglish</button>':''))+'</div>';
  else body='<div class="hd-tr'+(lang==='ur'?' hd-ur':'')+'">'+nl(lang==='ur'?x.ur:x.en)+'</div>';
  const secondary=x.inBook?'<div class="muted small">'+esc(x.inBook)+'</div>':'';
  return '<article class="card hd" id="h_'+n+'"><div class="hd-top"><div><b>'+esc(x.ref||'Reference unverified')+'</b>'+secondary+'</div><span class="muted small">'+esc(x.g||'')+'</span></div>'+
   '<div class="ar hd-ar" lang="ar">'+esc(x.ar)+'</div>'+body+
   '<div class="nz-btns"><button class="btn sm ghost" data-hcp="'+n+'">'+icon('copy')+' '+esc(tr('Copy'))+'</button><button class="btn sm ghost" data-hai="'+n+'">'+icon('ask')+' '+esc(tr('Ask AI'))+'</button></div></article>'}

document.addEventListener('click',async e=>{
  const c=e.target.closest('[data-hcp]');if(c){const x=CUR[c.dataset.hcp];if(x)ZD.copy(x.ar+'\n\n'+(x.hi||x.en||'')+'\n\n— '+(x.ref||'Reference unverified')+(x.inBook?' · '+x.inBook:'')+' · Zikr Deen App');return}
  const a=e.target.closest('[data-hai]');if(a){const x=CUR[a.dataset.hai];if(x){try{sessionStorage.setItem('zdAskPre',x.ref+' · '+(x.en||'').slice(0,500))}catch(_){}location.hash='#/ask'}return}
  const h=e.target.closest('[data-hi]');if(h){const n=Number(h.dataset.hi)||h.dataset.hi,x=CUR[n];if(!x||!x.en)return;h.disabled=true;h.textContent='…';
    try{const o=await translate(x.book,[{n,en:x.en}]);x.hi=o[0];const b=$('#hi_'+n);if(b)b.textContent=o[0]}catch(err){h.disabled=false;h.textContent=tr('Try again');ZD.toast('Try again')}}
});
async function fillHi(book,nums){for(const n of nums){const t=await hiGet(book,n);if(t&&CUR[n])CUR[n].hi=t}}

let stopFlag=false;
R.hsec=async function(a){
  const id=a[0],sec=a[1],page=Math.max(0,Number(a[2])||0),b=bk(id);if(!b||!sec){location.hash='#/hadith';return}
  let lang=getLang();
  view().innerHTML=top(b[1],'Kitaab '+sec)+'<main>'+seg(lang)+'<div id="hdBox"><p class="muted" style="padding:20px 4px">…</p></div></main>';
  const box=$('#hdBox');
  $('#hdSeg').addEventListener('click',e=>{const k=e.target.closest('[data-k]');if(!k)return;setLang(k.dataset.k);R.hsec(a)});
  const mine=()=>location.hash.indexOf('#/hsec/'+id+'/'+sec)===0;
  try{
    let list=[],name='',all=[];const PER=15;
    const O=await offline(id);
    if(O){
      const ia=bySec(O.a)[sec]||[],ue=byNo(O.u),en=byNo(O.e);
      name=O.e.secs[sec]||O.a.secs[sec]||'';
      all=ia.map(x=>{const publicRef=refKey(x[4]);return {n:x[0],ar:x[1],ur:matchedLangText(ue,x[0],publicRef),en:matchedLangText(en,x[0],publicRef),g:x[3],book:id,ref:makeRef(id,x[4]),inBook:makeInBook(x[2],x[5]),arabicnumber:x[4],hadithnumber:x[0]}});
    }else{
      const [A,U,E]=await Promise.all(['ara-','urd-','eng-'].map(p=>api('editions/'+p+id+'/sections/'+sec)));
      const um=new Map((U.hadiths||[]).map(x=>[x.hadithnumber,{text:x.text,ref:refKey(x.arabicnumber)}])),em=new Map((E.hadiths||[]).map(x=>[x.hadithnumber,{text:x.text,ref:refKey(x.arabicnumber)}]));
      name=A.metadata&&A.metadata.section?Object.values(A.metadata.section)[0]:'';
      all=(A.hadiths||[]).map(x=>{const publicRef=refKey(x.arabicnumber);return {n:x.hadithnumber,ar:x.text,ur:matchedLangText(um,x.hadithnumber,publicRef),en:matchedLangText(em,x.hadithnumber,publicRef),g:(x.grades||[]).map(g=>g.grade).filter(Boolean).join(' · '),book:id,ref:makeRef(id,x.arabicnumber),inBook:makeInBook(x.reference&&x.reference.book,x.reference&&x.reference.hadith),arabicnumber:x.arabicnumber,hadithnumber:x.hadithnumber}});
    }
    if(!mine())return;
    list=all.slice(page*PER,page*PER+PER);
    all.forEach(x=>{CUR[x.n]=x});
    await fillHi(id,all.map(x=>x.n));
    const missPage=list.filter(x=>!x.hi&&x.en).length,missAll=all.filter(x=>!x.hi&&x.en).length;
    const tools=lang==='hi'?'<div class="card nz-g" id="hdTools">'+(missPage?'<button class="btn sm" id="hiPage">AI ('+missPage+')</button> ':'')+(missAll>missPage?'<button class="btn sm ghost" id="hiAll">AI ('+missAll+')</button>':'')+(!missPage&&missAll<=missPage?'<span class="hd-ok">✓</span>':'')+'<div class="muted small" id="hiStat" style="margin-top:6px"></div></div>':'';
    box.innerHTML=(name?'<p class="muted small" style="margin:6px 2px 10px">'+esc(name)+' · '+esc(tr(all.length+' hadith'))+'</p>':'')+tools+
      (list.length?list.map(h=>card(id,h,lang)).join(''):'<p class="muted" style="padding:20px 4px">—</p>')+
      '<div class="nz-nav">'+(page>0?'<a class="btn ghost" href="#/hsec/'+id+'/'+sec+'/'+(page-1)+'">←</a>':'<span></span>')+(all.length>page*PER+PER?'<a class="btn" href="#/hsec/'+id+'/'+sec+'/'+(page+1)+'">→</a>':(Number(sec)<b[4]?'<a class="btn" href="#/hsec/'+id+'/'+(Number(sec)+1)+'">→</a>':''))+'</div>';
    window.scrollTo(0,0);
    const run=async items=>{
      const st=$('#hiStat'),btns=$$('#hdTools .btn');stopFlag=false;btns.forEach(x=>x.disabled=true);
      const stop=document.createElement('button');stop.className='btn sm ghost';stop.textContent='✕';stop.onclick=()=>{stopFlag=true};$('#hdTools').appendChild(stop);
      let done=0;
      for(let i=0;i<items.length&&!stopFlag&&mine();i+=5){
        const grp=items.slice(i,i+5).filter(x=>x.en);if(!grp.length)continue;
        try{const out=await translate(id,grp.map(x=>({n:x.n,en:x.en})));grp.forEach((x,k)=>{x.hi=out[k];const el=$('#hi_'+x.n);if(el)el.textContent=out[k]});done+=grp.length;if(st)st.textContent=done+' / '+items.length}
        catch(err){if(st)st.textContent=done+' / '+items.length;break}
        await new Promise(r=>setTimeout(r,1200));
      }
      stop.remove();if(mine()&&st&&done===items.length)st.textContent='✓';btns.forEach(x=>x.disabled=false);
    };
    const hp=$('#hiPage'),ha=$('#hiAll');
    if(hp)hp.addEventListener('click',()=>run(list.filter(x=>!x.hi&&x.en)));
    if(ha)ha.addEventListener('click',()=>{if(confirm('AI ('+missAll+')?'))run(all.filter(x=>!x.hi&&x.en))});
  }catch(e){console.error(e);if(mine())fail(box)}
};

R.hone=async function(a){
  const id=a[0],input=String(a[1]||'').trim(),wanted=refKey(input),b=bk(id);if(!b||!b[5]||!wanted){location.hash='#/hadith';return}
  let lang=getLang();
  view().innerHTML=top(b[1],displayRef(input))+'<main>'+seg(lang)+'<div id="hdBox"><p class="muted" style="padding:20px 4px">…</p></div></main>';
  $('#hdSeg').addEventListener('click',e=>{const k=e.target.closest('[data-k]');if(!k)return;setLang(k.dataset.k);R.hone(a)});
  const box=$('#hdBox');
  const mine=()=>location.hash.indexOf('#/hone/'+id+'/')===0;
  try{
    let items=[];const O=await offline(id);
    if(O){
      const matches=matchRefs(O.a.h,r=>r[4],wanted).slice(0,12);
      if(!matches.length)throw new Error('nf');
      const ue=byNo(O.u),en=byNo(O.e);
      items=matches.map(rec=>{
        const internalNo=rec[0],publicRef=refKey(rec[4]);
        return {n:internalNo,ar:rec[1],ur:matchedLangText(ue,internalNo,publicRef),en:matchedLangText(en,internalNo,publicRef),g:rec[3],arabicnumber:rec[4],book:id,ref:makeRef(id,rec[4]),inBook:makeInBook(rec[2],rec[5]),hadithnumber:internalNo};
      });
    }else{
      box.innerHTML='<p class="muted" style="padding:20px 4px">…</p>';
      const A=await api('editio

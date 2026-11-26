/* Zikr Deen App — Mukammal Namaz (word by word) + Daily Azkaar folders. Data: js/namaz-data.js */
(function(){'use strict';
const ZD=window.ZD,$=ZD.$,esc=ZD.esc,icon=ZD.icon,R=ZD.R,D=window.ZD_NAMAZ||[];
const view=()=>$('#view');
const top=(t,sub,o)=>{o=o||{};return '<header class="topbar"><button class="ibtn" data-act="back" aria-label="Back">'+icon('back')+'</button><h1>'+esc(t)+(sub?'<span class="sub">'+esc(sub)+'</span>':'')+'</h1>'+(o.right||'')+'</header>'};
const LK='zdNzLang';
const getLang=()=>{try{return localStorage.getItem(LK)||'hi'}catch(e){return'hi'}};
const setLang=v=>{try{localStorage.setItem(LK,v)}catch(e){}};
const secOf=n=>D.find(s=>s.n===Number(n));
const nd=s=>s.b.filter(b=>b.t==='d').length;
const LANGS=[['hi','Hinglish'],['ro','Roman Urdu'],['both','Dono']];
const seg=cur=>'<div class="seg" id="nzSeg" role="tablist">'+LANGS.map(([k,l])=>'<button role="tab" aria-selected="'+(k===cur)+'" data-k="'+k+'">'+l+'</button>').join('')+'</div>';
const nl=t=>esc(t).replace(/\n/g,'<br>');
function dua(d,lang){
  const tarHi='<div class="nz-l"><b>Tarjuma (Hinglish):</b> '+nl(d.hi)+'</div>',tarRo='<div class="nz-l"><b>Tarjuma (Roman Urdu):</b> '+nl(d.tar)+'</div>';
  return '<article class="card nz-d" id="d_'+d.id+'">'+(d.ti?'<h3 class="nz-t">'+esc(d.ti)+'</h3>':'')+
   (d.in||[]).map(x=>'<p class="nz-p">'+esc(x)+'</p>').join('')+
   (d.i?'<button class="nz-img" data-zoom="'+d.i+'" aria-label="Arabic aur word by word, bada karke dekhein"><img src="img/namaz/'+d.i+'.webp" loading="lazy" decoding="async" alt="Arabic dua with word-by-word meaning"></button>':'')+
   '<div class="nz-l"><b>Padhein:</b> '+esc(d.pad)+'</div>'+
   (lang!=='ro'?tarHi:'')+(lang!=='hi'?tarRo:'')+
   (d.no?'<div class="nz-no">'+esc(d.no)+'</div>':'')+
   '<div class="nz-btns"><button class="btn sm ghost" data-cp="'+d.id+'">'+icon('copy')+' Copy</button><button class="btn sm ghost" data-ai="'+d.id+'">'+icon('ask')+' AI se poochein</button></div></article>'}
function blocks(s,lang){
  return s.b.map(b=>b.t==='d'?dua(b,lang):b.t==='i'?'<div class="card nz-tbl"><img src="img/namaz/'+b.i+'.webp" data-zoom="'+b.i+'" loading="lazy" decoding="async" alt="Table"></div>':
   b.h?'<h3 class="nz-t">'+esc(b.s)+'</h3>':'<p class="nz-p'+(/^\d+\./.test(b.s)?' nz-li':'')+'">'+esc(b.s)+'</p>').join('')}
function zoom(id){
  const o=document.createElement('div');o.className='nz-zoom';
  o.innerHTML='<button class="nz-zx" aria-label="Close">✕</button><div class="nz-zs"><img src="img/namaz/'+id+'.webp" alt="Zoomed"></div>';
  o.addEventListener('click',e=>{if(e.target.closest('.nz-zx')||e.target===o)o.remove()});document.body.appendChild(o)}
document.addEventListener('click',e=>{
  const z=e.target.closest('[data-zoom]');if(z){zoom(z.dataset.zoom);return}
  const c=e.target.closest('[data-cp]');if(c){const d=find(c.dataset.cp);if(d)ZD.copy((d.ti?d.ti+'\n':'')+d.pad+'\n\n'+d.hi+'\n\n— Zikr Deen App');return}
  const a=e.target.closest('[data-ai]');if(a){const d=find(a.dataset.ai);if(d){try{sessionStorage.setItem('zdAskPre','Is dua ka matlab aur kab padhni chahiye, Hadees ke hawale se samjhao: '+(d.ti||'')+' — '+d.pad)}catch(_){}location.hash='#/ask'}}
});
function find(id){for(const s of D)for(const b of s.b)if(b.t==='d'&&b.id===id)return b;return null}
function bindSeg(fn){const g=$('#nzSeg');if(g)g.addEventListener('click',e=>{const b=e.target.closest('[data-k]');if(!b)return;setLang(b.dataset.k);fn(b.dataset.k)})}

/* ---------- Mukammal Namaz hub ---------- */
R.nz=function(){
  let lang=getLang();
  view().innerHTML=top('Mukammal Namaz','Shuru se aakhir tak · word by word')+'<main><p class="muted small" style="margin:0 2px 10px">Har dua ka Arabic, har lafz ka matlab, Roman padhai aur tarjuma. Tarjuma Hinglish ya Roman Urdu mein dekhein.</p>'+seg(lang)+
   '<div class="field" style="margin:0 0 10px"><input id="nzq" type="search" placeholder="Dua ya lafz dhoondhein (jaise Qunoot, Sajda…)" aria-label="Search" style="width:100%"></div>'+
   '<div id="nzList"></div></main>';
  const draw=q=>{
    q=(q||'').trim().toLowerCase();const L=$('#nzList');
    if(!q){L.innerHTML=D.map(s=>'<a class="row" href="#/nsec/'+s.n+'"><span class="num"><span>'+s.n+'</span></span><div style="flex:1;min-width:0"><b>'+esc(s.t)+'</b><div class="muted small">'+(nd(s)?nd(s)+' duaein':'Tareeqa / jaankari')+'</div></div>'+icon('back','nz-arr')+'</a>').join('');return}
    const hits=[];for(const s of D)for(const b of s.b)if(b.t==='d'&&(b.ti+' '+b.pad+' '+b.tar+' '+b.hi).toLowerCase().includes(q))hits.push([s,b]);
    L.innerHTML=hits.length?hits.slice(0,40).map(([s,b])=>'<a class="row" href="#/nsec/'+s.n+'/'+b.id+'"><div style="flex:1;min-width:0"><b>'+esc(b.ti||b.pad.slice(0,50))+'</b><div class="muted small">Hissa '+s.n+' · '+esc(b.hi.slice(0,70))+'…</div></div></a>').join(''):'<p class="muted" style="padding:18px 4px">Kuch nahin mila.</p>';
  };
  draw('');$('#nzq').addEventListener('input',e=>draw(e.target.value));bindSeg(k=>{lang=k;R.nz()});
};
R.nsec=function(args){
  const n=Number(args[0]),s=secOf(n);if(!s){location.hash='#/nz';return}
  let lang=getLang();
  const prev=secOf(n-1),next=secOf(n+1);
  view().innerHTML=top('Hissa '+n,s.t)+'<main>'+(nd(s)?seg(lang):'')+blocks(s,lang)+
   '<div class="nz-nav">'+(prev?'<a class="btn ghost" href="#/nsec/'+prev.n+'">← Hissa '+prev.n+'</a>':'<span></span>')+(next?'<a class="btn" href="#/nsec/'+next.n+'">Hissa '+next.n+' →</a>':'')+'</div></main>';
  bindSeg(k=>{lang=k;const y=window.scrollY;R.nsec(args);window.scrollTo(0,y)});
  if(args[1]){const el=document.getElementById('d_'+args[1]);if(el)setTimeout(()=>{el.scrollIntoView({block:'start'});el.classList.add('nz-hl')},60)}
};

/* ---------- Daily Azkaar ---------- */
const GROUPS=[
 ['Subah aur Shaam ke azkaar','Roz subah-shaam padhne ki duaein',[14],'moon'],
 ['Namaz ke baad ke azkaar','Salaam ke foran baad aur sunnat azkaar',[8,13,20],'pray'],
 ['Roz-marra ki duaein','Sone, uthne, khane, safar, ghar aane-jaane ki duaein',[16,15],'repeat'],
 ['Nabi ﷺ ki sab se zyada padhi jaane wali duaein','Chhoti aur asaan duaein',[10],'book'],
 ['Quran ki duaein','Rabbana wali duaein aur Ambiya ki duaein',[17,21,18],'ayah'],
 ['Kab kaun si dua padhein','Ek nazar mein list',[22],'steps']];
R.azkaar=function(){
  const h=new Date().getHours(),feat=h>=3&&h<15?'Subah':'Shaam';
  view().innerHTML=top('Daily Azkaar','Roz ki duaein aur azkaar')+'<main>'+
   '<a class="card ask-card" href="#/nsec/14"><div class="ask-logo">'+icon('moon')+'</div><div style="flex:1"><div style="font-size:18px;font-weight:600">'+feat+' ke azkaar</div><div class="muted small">Abhi padhne ka waqt — Arabic, padhai aur tarjuma</div></div>'+icon('back','ask-arr')+'</a>'+
   '<h2 class="h2" style="margin:18px 2px 6px">Sab azkaar</h2>'+
   GROUPS.map(g=>'<div class="card nz-g"><b>'+esc(g[0])+'</b><div class="muted small">'+esc(g[1])+'</div><div class="nz-chips">'+g[2].map(n=>{const s=secOf(n);return s?'<a class="ask-chip" href="#/nsec/'+n+'">'+esc(s.t.replace(/\s*\(.*$/,'').slice(0,42))+(nd(s)?' · '+nd(s):'')+'</a>':''}).join('')+'</div></div>').join('')+
   '<p class="muted small" style="margin:14px 2px">Poori kitab: <a href="#/nz">Mukammal Namaz (word by word)</a>. Kisi dua ka matlab poochna ho to <a href="#/ask">Ask Zikr Deen</a>.</p></main>';
};
ZD.nzCount=()=>D.reduce((a,s)=>a+nd(s),0);
})();

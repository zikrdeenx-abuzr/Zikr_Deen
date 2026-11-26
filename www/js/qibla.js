/* Zikr Deen App — Qibla direction (works offline).
   Bearing = great-circle direction from your location to the Kaaba. Compass = phone's orientation sensor.
   Location: your own GPS fix if you took one here, otherwise the city saved in Namaz Timings. */
(function(){'use strict';
const ZD=window.ZD,$=ZD.$,esc=ZD.esc,icon=ZD.icon,R=ZD.R;
const KAABA={lat:21.422487,lng:39.826206};
const KEY='zd-qibla-v1',PKEY='zd-prayer-v1';
const D=Math.PI/180;
const DIRS=['Uttar','Uttar-Purv','Purv','Dakshin-Purv','Dakshin','Dakshin-Pashchim','Pashchim','Uttar-Pashchim'];
const dirName=b=>DIRS[Math.round(b/45)%8];

/* ---------- maths ---------- */
function bearing(lat,lng){
  const p1=lat*D,p2=KAABA.lat*D,dl=(KAABA.lng-lng)*D;
  const y=Math.sin(dl)*Math.cos(p2),x=Math.cos(p1)*Math.sin(p2)-Math.sin(p1)*Math.cos(p2)*Math.cos(dl);
  return (Math.atan2(y,x)/D+360)%360;
}
function distKm(lat,lng){
  const p1=lat*D,p2=KAABA.lat*D,dp=p2-p1,dl=(KAABA.lng-lng)*D;
  const a=Math.pow(Math.sin(dp/2),2)+Math.cos(p1)*Math.cos(p2)*Math.pow(Math.sin(dl/2),2);
  return 6371*2*Math.asin(Math.min(1,Math.sqrt(a)));
}
/* compass heading (0 = North, clockwise) of the phone's top edge, or of its back when held upright */
function headingFrom(e){
  if(typeof e.webkitCompassHeading==='number'&&!isNaN(e.webkitCompassHeading))return e.webkitCompassHeading; /* iPhone */
  if(e.alpha==null)return null;
  const a=e.alpha*D,b=(e.beta||0)*D,g=(e.gamma||0)*D;
  let east,north;
  if(Math.abs(e.beta||0)<45){east=-Math.sin(a)*Math.cos(b);north=Math.cos(a)*Math.cos(b)}
  else{east=-(Math.cos(a)*Math.sin(g)+Math.sin(a)*Math.sin(b)*Math.cos(g));north=Math.cos(a)*Math.sin(b)*Math.cos(g)-Math.sin(a)*Math.sin(g)}
  return (Math.atan2(east,north)/D+360)%360;
}

/* ---------- location ---------- */
function readJSON(k){try{const r=JSON.parse(localStorage.getItem(k)||'null');return r&&typeof r==='object'?r:null}catch(e){return null}}
function place(){
  const own=readJSON(KEY);
  if(own&&isFinite(own.lat)&&isFinite(own.lng))return{lat:own.lat,lng:own.lng,label:own.label||'Meri location (GPS)',src:'gps'};
  const pr=readJSON(PKEY);
  if(pr&&isFinite(pr.lat)&&isFinite(pr.lng))return{lat:pr.lat,lng:pr.lng,label:pr.label||pr.city||'Namaz wali location',src:'prayer'};
  return{lat:26.8467,lng:80.9462,label:'Lucknow, Uttar Pradesh',src:'default'};
}

/* ---------- style (injected once) ---------- */
function css(){
  if(document.getElementById('qbCss'))return;
  const s=document.createElement('style');s.id='qbCss';
  s.textContent='.qb-wrap{max-width:340px;margin:6px auto 0;position:relative}'+
  '.qb-svg{width:100%;height:auto;display:block}'+
  '.qb-ring{fill:var(--surface);stroke:var(--line);stroke-width:2;transition:stroke .2s}'+
  '.qb-wrap.ok .qb-ring{stroke:#1f8a4c;stroke-width:4}'+
  '.qb-tick{stroke:var(--muted);stroke-width:1.5}.qb-tick.m{stroke-width:3;stroke:var(--ink)}'+
  '.qb-lbl{font:700 17px var(--sans,system-ui);fill:var(--ink);text-anchor:middle;dominant-baseline:middle}.qb-lbl.n{fill:#c0392b}'+
  '.qb-line{stroke:var(--gold,#b8860b);stroke-width:4;stroke-linecap:round}'+
  '.qb-ptr{fill:var(--ink);transition:fill .2s}.qb-wrap.ok .qb-ptr{fill:#1f8a4c}'+
  '.qb-say{text-align:center;font-size:18px;font-weight:700;min-height:28px;margin:10px 0 2px}.qb-say.ok{color:#1f8a4c}'+
  '.qb-big{text-align:center;font-size:30px;font-weight:800;margin-top:2px}.qb-big small{font-size:14px;font-weight:500;color:var(--muted)}'+
  '.qb-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}';
  document.head.appendChild(s);
}

/* ---------- dial ---------- */
function dialSVG(b){
  let t='';
  for(let i=0;i<360;i+=10){const m=i%90===0,r1=m?124:130,a=i*D;
    t+='<line class="qb-tick'+(m?' m':'')+'" x1="'+(150+Math.sin(a)*r1).toFixed(1)+'" y1="'+(150-Math.cos(a)*r1).toFixed(1)+'" x2="'+(150+Math.sin(a)*140).toFixed(1)+'" y2="'+(150-Math.cos(a)*140).toFixed(1)+'"/>'}
  const L=(txt,deg,c)=>{const a=deg*D;return '<text class="qb-lbl'+(c?' '+c:'')+'" x="'+(150+Math.sin(a)*106).toFixed(1)+'" y="'+(150-Math.cos(a)*106).toFixed(1)+'">'+txt+'</text>'};
  return '<svg class="qb-svg" viewBox="0 0 300 300" role="img" aria-label="Qibla compass">'+
    '<circle class="qb-ring" cx="150" cy="150" r="146"/>'+
    '<g id="qbRot">'+t+L('N',0,'n')+L('E',90)+L('S',180)+L('W',270)+
      '<g transform="rotate('+b.toFixed(2)+' 150 150)"><line class="qb-line" x1="150" y1="150" x2="150" y2="78"/><text x="150" y="58" text-anchor="middle" dominant-baseline="middle" font-size="34">🕋</text></g>'+
    '</g>'+
    '<circle cx="150" cy="150" r="6" fill="var(--ink)"/>'+
    '<polygon class="qb-ptr" points="150,-2 138,22 162,22"/>'+
  '</svg>';
}

/* ---------- page ---------- */
R.qibla=function(){
  css();
  const v=$('#view'),p=place(),B=bearing(p.lat,p.lng),km=distKm(p.lat,p.lng);
  const from=p.src==='gps'?'GPS se':(p.src==='prayer'?'Namaz Timings wali location':'Default location');
  v.innerHTML='<header class="topbar"><button class="ibtn" data-act="back" aria-label="Back">'+icon('back')+'</button><h1>Qibla Direction<span class="sub">Kaaba (Makkah) ki taraf</span></h1></header><main>'+
  '<section class="block card"><div class="qb-wrap" id="qbWrap">'+dialSVG(B)+'</div>'+
    '<div class="qb-say" id="qbSay">Phone seedha (flat) rakhein…</div>'+
    '<div class="qb-big">'+Math.round(B)+'° <small>'+dirName(B)+'</small></div>'+
    '<div class="muted small" style="text-align:center;margin-top:4px">Kaaba tak lagbhag '+Math.round(km).toLocaleString('en-IN')+' km</div>'+
    '<div class="qb-row" style="justify-content:center"><button class="btn sm" id="qbGps">📍 Meri location lein (GPS)</button><button class="btn sm ghost" id="qbRe">🧭 Compass dobara chalu</button><a class="btn sm ghost" href="#/ar-mode">📷 AR Qibla Camera</a></div></section>'+
  '<section class="block card"><div class="muted small">'+esc(p.label)+' · '+p.lat.toFixed(3)+', '+p.lng.toFixed(3)+'</div><div class="muted small">Location: '+from+'. Kahin aur safar par hon to “GPS” dabayein.</div></section>'+
  '<section class="block card"><h2 class="h2">Sahi nishana kaise milega</h2><p class="muted small" style="margin:0">1) Phone ko seedha (flat) pakdein. 2) Phone ko “8” ki shakal me ghumayein (compass calibrate). 3) Magnet, cover ya dhaat ki cheez se door rakhein. 4) Jab upar ka teer 🕋 par aaye aur hara ho jaye — wahi Qibla hai.<br><br>Compass phone ke sensor par chalta hai, isliye kuch degree ka farq ho sakta hai. Zaroori ho to masjid ke mehrab ya kisi aalim se mila lein.</p></section></main>';

  let heading=null,sin=0,cos=0,raf=0,aligned=false,gotEvt=false,noSensorTO=0,evName='';
  const say=$('#qbSay'),wrap=$('#qbWrap'),rot=$('#qbRot');

  function paint(){
    raf=0;if(heading==null||!rot)return;
    rot.setAttribute('transform','rotate('+(-heading).toFixed(1)+' 150 150)');
    const diff=((B-heading+540)%360)-180,ad=Math.abs(diff);
    const ok=ad<=4;
    wrap.classList.toggle('ok',ok);say.classList.toggle('ok',ok);
    if(ok){say.textContent='✓ Qibla ki taraf';if(!aligned){aligned=true;try{navigator.vibrate&&navigator.vibrate(60)}catch(e){}}}
    else{aligned=false;say.textContent=(diff>0?'Daayein ':'Baayein ')+Math.round(ad)+'° ghoomiye'}
  }
  function onOri(e){
    const h=headingFrom(e);if(h==null||isNaN(h))return;
    gotEvt=true;clearTimeout(noSensorTO);
    /* smooth (circular average) so the dial does not jitter */
    sin=sin*.75+Math.sin(h*D)*.25;cos=cos*.75+Math.cos(h*D)*.25;
    heading=(Math.atan2(sin,cos)/D+360)%360;
    if(!raf)raf=requestAnimationFrame(paint);
  }
  function stop(){
    window.removeEventListener('deviceorientationabsolute',onOri,true);
    window.removeEventListener('deviceorientation',onOri,true);
    clearTimeout(noSensorTO);if(raf)cancelAnimationFrame(raf);
  }
  async function start(){
    stop();gotEvt=false;heading=null;sin=0;cos=0;
    try{
      if(typeof DeviceOrientationEvent!=='undefined'&&typeof DeviceOrientationEvent.requestPermission==='function'){
        const r=await DeviceOrientationEvent.requestPermission();
        if(r!=='granted'){say.textContent='Compass ki permission nahi mili';return}
      }
    }catch(e){}
    if('ondeviceorientationabsolute' in window){evName='deviceorientationabsolute';window.addEventListener(evName,onOri,true)}
    else{evName='deviceorientation';window.addEventListener(evName,onOri,true)}
    noSensorTO=setTimeout(()=>{if(!gotEvt)say.textContent='Is phone me compass sensor nahi mila. Upar likhe '+Math.round(B)+'° ('+dirName(B)+') ki taraf rukh karein.'},3000);
  }
  $('#qbRe').addEventListener('click',start);
  $('#qbGps').addEventListener('click',()=>{
    if(!navigator.geolocation){ZD.toast('GPS available nahi hai');return}
    ZD.toast('Location dhoondh raha hoon…');
    navigator.geolocation.getCurrentPosition(pos=>{
      try{localStorage.setItem(KEY,JSON.stringify({lat:pos.coords.latitude,lng:pos.coords.longitude,label:'Meri location (GPS)'}))}catch(e){}
      stop();R.qibla();
    },err=>{ZD.toast(err&&err.code===1?'Location ki permission nahi mili — phone Settings > Apps > Zikr Deen me allow karein':'Location nahi mili — thodi der baad try karein')},{enableHighAccuracy:false,timeout:15000,maximumAge:600000});
  });
  ZD.onLeave(stop);
  start();
  window.scrollTo(0,0);
};

/* ---------- shortcuts on Home and More (added without touching other files) ---------- */
function inject(){
  const view=document.getElementById('view');if(!view)return;
  const pc=document.getElementById('pzCard');
  const homeMain=!pc&&view.querySelector('main .block')&&/#\/ask/.test(view.innerHTML)&&view.querySelector('a.ask-card');
  if(false&&!pc&&homeMain&&!document.getElementById('qbHome')){
    const s=document.createElement('section');s.className='block';s.id='qbHome';
    s.innerHTML='<a class="card" href="#/qibla" style="display:flex;align-items:center;gap:12px;text-decoration:none;color:inherit"><span style="font-size:26px">🧭</span><span><b>Qibla Direction</b><br><span class="muted small">Kaaba ki taraf — live compass</span></span></a>';
    const host=homeMain.closest('section')||homeMain;host.insertAdjacentElement('beforebegin',s);
  }
  if(false&&pc&&!document.getElementById('qbHome')){
    const s=document.createElement('section');s.className='block';s.id='qbHome';
    s.innerHTML='<a class="card" href="#/qibla" style="display:flex;align-items:center;gap:12px;text-decoration:none;color:inherit"><span style="font-size:26px">🧭</span><span><b>Qibla Direction</b><br><span class="muted small">Kaaba ki taraf — live compass</span></span></a>';
    pc.insertAdjacentElement('afterend',s);
  }
  const mb=view.querySelector('a.btn[href="#/prayer"]');
  if(mb&&!document.getElementById('qbMore')){
    const s=document.createElement('section');s.className='block';s.id='qbMore';
    s.innerHTML='<a class="btn" href="#/qibla" style="width:100%">🧭 Qibla Direction</a>';
    const host=mb.closest('section')||mb;host.insertAdjacentElement('afterend',s);
  }
}
function boot(){
  const view=document.getElementById('view');if(!view)return;
  new MutationObserver(inject).observe(view,{childList:true,subtree:true});inject();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();

/* ---------- Qibla folder inside the Learning folders (Home page + Learn tab), next to Namaz / Hadith ---------- */
(function(){
  const old=ZD.foldersHTML;if(typeof old!=='function')return;
  const ico='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M15.6 8.4l-2.1 5.1-5.1 2.1 2.1-5.1z"/></svg>';
  const tile='<a class="folder" href="#/qibla">'+ico+'<b>Qibla Direction</b><span>Kaaba ki taraf · live compass</span></a>';
  ZD.foldersHTML=function(){
    let h=old.apply(this,arguments);
    const k=h.indexOf('<a class="folder" href="#/repeat"');
    return k>=0?h.slice(0,k)+tile+h.slice(k):h.replace('<a class="folder wide"',tile+'<a class="folder wide"');
  };
})();
ZD.qiblaDebug={bearing,distKm,headingFrom};
})();

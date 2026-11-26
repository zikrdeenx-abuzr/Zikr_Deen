/* Zikr Deen App — Account: Google login, usage stats (guest / login users), daily "Ask Zikr Deen" limit,
   cloud backup and the owner dashboard.
   Works only when the build has Firebase (GOOGLE_SERVICES_JSON secret). Without it every function is a harmless no-op
   and the app behaves exactly as before.
   Data goes to Firestore through its REST API (no extra library needed):
     guests/{deviceId}  — anonymous counters of one phone (opens, questions, last day)
     users/{uid}        — name, email, counters and the cloud backup of a Google-login user */
(function(){'use strict';
const ZD=window.ZD,$=ZD.$,esc=ZD.esc,icon=ZD.icon,R=ZD.R;
const C=window.ZD_ACCOUNT||{};
const unset=s=>!s||String(s).indexOf('__')===0;
const PID=unset(C.projectId)?'':String(C.projectId);
const OWNER=unset(C.ownerEmail)?'':String(C.ownerEmail).trim().toLowerCase();
const LIM=Object.assign({guest:5,user:25},C.limits||{});
const ON=!!PID;
const LK='zdAcct_v1',APPKEY='zdApp_v1';
const FS='https://firestore.googleapis.com/v1/projects/'+PID+'/databases/(default)/documents';
const FA=()=>window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.FirebaseAuthentication;

/* ---------- local state ---------- */
const pad=n=>(n<10?'0':'')+n;
function day(d){d=d||new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
function load(){try{return JSON.parse(localStorage.getItem(LK))||{}}catch(e){return{}}}
let S=load();
if(!S.did)S.did='d'+Math.random().toString(36).slice(2,10)+Date.now().toString(36);
if(!S.first)S.first=day();
S.opens=S.opens||0;S.asks=S.asks||0;S.today=S.today||0;S.day=S.day||day();
function save(){try{localStorage.setItem(LK,JSON.stringify(S))}catch(e){}}
function roll(){const t=day();if(S.day!==t){S.day=t;S.today=0}}
save();

const isOwner=()=>!!(OWNER&&S.user&&S.user.email&&S.user.email.toLowerCase()===OWNER);
const canLogin=()=>ON&&!!FA();
function who(){return isOwner()?'owner':S.user?'user':'guest'}
function limitFor(w){
  if(w==='owner')return Infinity;
  if(w==='user')return +LIM.user;
  return canLogin()?+LIM.guest:+LIM.user; /* no login possible (browser) -> use the bigger limit */
}

/* ---------- Firestore REST helpers ---------- */
function val(v){return typeof v==='boolean'?{booleanValue:v}:typeof v==='number'?{integerValue:String(Math.round(v))}:{stringValue:String(v)}}
function fields(o){const f={};Object.keys(o).forEach(k=>{if(o[k]!==undefined&&o[k]!==null)f[k]=val(o[k])});return f}
function fv(f){if(!f)return undefined;if('stringValue' in f)return f.stringValue;if('integerValue' in f)return Number(f.integerValue);if('doubleValue' in f)return Number(f.doubleValue);if('booleanValue' in f)return f.booleanValue;return undefined}
async function token(){const p=FA();if(!p||!S.user)return null;try{const r=await p.getIdToken({forceRefresh:false});return(r&&r.token)||null}catch(e){return null}}
async function req(method,url,body,tok){
  const h={'Content-Type':'application/json'};if(tok)h.Authorization='Bearer '+tok;
  const ctl=new AbortController(),to=setTimeout(()=>ctl.abort(),15000);
  try{
    const r=await fetch(url,{method,headers:h,body:body?JSON.stringify(body):undefined,signal:ctl.signal});
    const j=await r.json().catch(()=>({}));
    if(!r.ok){const e=new Error((j.error&&j.error.message)||('http '+r.status));e.status=r.status;throw e}
    return j;
  }finally{clearTimeout(to)}
}
function patchDoc(col,id,obj,tok){
  const mask=Object.keys(obj).map(k=>'updateMask.fieldPaths='+encodeURIComponent(k)).join('&');
  return req('PATCH',FS+'/'+col+'/'+encodeURIComponent(id)+'?'+mask,{fields:fields(obj)},tok);
}
async function getDoc(col,id,tok){
  try{return await req('GET',FS+'/'+col+'/'+encodeURIComponent(id),null,tok)}
  catch(e){if(e.status===404)return null;throw e}
}
const plat=()=>FA()?'android':'web';
function counters(){roll();return{first:S.first,last:day(),opens:S.opens,asks:S.asks,td:S.today,tday:S.day,plat:plat(),v:2}}

/* ---------- reporting (silent: never blocks the app) ---------- */
let pingT=0,pinging=false;
async function pingNow(){
  if(!ON||pinging)return;pinging=true;
  try{
    const c=counters();
    await patchDoc('guests',S.did,{first:c.first,last:c.last,opens:c.opens,asks:c.asks,td:c.td,tday:c.tday,li:!!S.user,v:2});
    if(S.user){
      const tok=await token();
      if(tok){
        const o={name:S.user.name||'',email:S.user.email||'',first:S.userFirst||c.first,last:c.last,opens:c.opens,asks:c.asks,td:c.td,tday:c.tday,plat:c.plat,v:2};
        await patchDoc('users',S.user.uid,o,tok);
      }
    }
  }catch(e){/* offline or rules not set yet: try again next time */}
  pinging=false;
}
function queue(ms){if(!ON)return;clearTimeout(pingT);pingT=setTimeout(pingNow,ms||6000)}

/* ---------- login / logout / delete ---------- */
async function loadUser(){ /* take the saved counters of this Google account (so a reinstall does not reset the daily limit) */
  const tok=await token();if(!tok||!S.user)return;
  try{
    const d=await getDoc('users',S.user.uid,tok);
    if(d&&d.fields){
      const f=d.fields;
      S.userFirst=fv(f.first)||S.first;
      const a=fv(f.asks);if(typeof a==='number'&&a>S.asks)S.asks=a;
      if(fv(f.tday)===day()){const t=fv(f.td);if(typeof t==='number'&&t>S.today)S.today=t}
    }else S.userFirst=day();
    save();
  }catch(e){if(!S.userFirst){S.userFirst=day();save()}}
}
async function login(){
  if(!ON)throw new Error('Login abhi is app me set nahi hai.');
  const p=FA();if(!p)throw new Error('Google login sirf Android app me chalta hai.');
  const r=await p.signInWithGoogle();const u=r&&r.user;
  if(!u||!u.uid)throw new Error('Login poora nahi hua.');
  S.user={uid:u.uid,email:(u.email||'').toLowerCase(),name:u.displayName||'',photo:u.photoUrl||''};save();
  await loadUser();pingNow();
  return S.user;
}
async function logout(){
  const p=FA();try{if(p)await p.signOut()}catch(e){}
  S.user=null;S.userFirst=undefined;save();pingNow();
}
async function removeAccount(){
  const p=FA(),u=S.user;if(!u)return;
  const tok=await token();
  if(tok){try{await req('DELETE',FS+'/users/'+encodeURIComponent(u.uid),null,tok)}catch(e){if(e.status!==404)throw e}}
  try{if(p)await p.deleteUser()}catch(e){try{if(p)await p.signOut()}catch(_){}}
  S.user=null;S.userFirst=undefined;save();pingNow();
}
async function checkSession(){ /* the login of an earlier open is still valid? */
  const p=FA();if(!ON||!p||!S.user)return;
  try{const r=await p.getCurrentUser();if(!r||!r.user){S.user=null;save()}}catch(e){}
}

/* ---------- cloud backup ---------- */
async function backup(silent){
  const tok=await token();if(!tok||!S.user)throw new Error('Pehle Google se login karein.');
  const raw=localStorage.getItem(APPKEY)||'';
  if(!raw)throw new Error('Abhi backup karne layak kuch nahi hai.');
  if(new Blob([raw]).size>900000)throw new Error('Data bahut bada hai — "More > Backup > Export backup" use karein.');
  await patchDoc('users',S.user.uid,{backup:raw,bkAt:Date.now()},tok);
  S.bk=Date.now();save();
  return raw.length;
}
async function restore(){
  const tok=await token();if(!tok||!S.user)throw new Error('Pehle Google se login karein.');
  const d=await getDoc('users',S.user.uid,tok);
  const raw=d&&d.fields&&fv(d.fields.backup);
  if(!raw)throw new Error('Cloud me abhi koi backup nahi mila.');
  JSON.parse(raw); /* must be valid */
  localStorage.setItem(APPKEY,raw);
  location.reload();
}
function autoBackup(){
  if(!S.user)return;const gap=(+C.autoBackupHours||12)*3600000;
  if(Date.now()-(S.bk||0)<gap)return;
  backup(true).catch(()=>{});
}

/* ---------- daily Ask-AI limit ---------- */
function canAsk(){
  if(!ON)return{ok:true,left:Infinity,limit:Infinity,kind:'off'};
  roll();const k=who(),L=limitFor(k),left=L-S.today;
  return{ok:left>0,left:Math.max(0,left),limit:L,kind:k};
}
function countAsk(){roll();S.today++;S.asks++;save();queue(5000)}
function limitText(){
  const a=canAsk();
  if(a.kind==='guest')return'Aaj ke '+a.limit+' free sawal poore ho gaye. 🌙\n\nGoogle se login karein — phir roz '+LIM.user+' sawal milenge aur aapka progress cloud me safe rahega: [Account / Login](#/account)\n\nYa kal dobara poochein, insha-Allah.';
  return'Aaj ke '+a.limit+' sawal poore ho gaye. 🌙 Kal dobara poochein, insha-Allah. Tab tak Quran, Hadith aur Daily Azkaar me padhte rahein: [Learn](#/folders)';
}
function note(){
  const a=canAsk();if(a.kind==='off'||a.kind==='owner')return'';
  return' Aaj ke bache sawal: '+a.left+'/'+a.limit+'.';
}

/* ---------- owner dashboard ---------- */
const cmp=(f,op,v)=>({fieldFilter:{field:{fieldPath:f},op,value:v}});
async function agg(col,where,tok){
  const sq={from:[{collectionId:col}]};if(where)sq.where=where;
  const r=await req('POST',FS+':runAggregationQuery',{structuredAggregationQuery:{structuredQuery:sq,aggregations:[
    {alias:'n',count:{}},{alias:'asks',sum:{field:{fieldPath:'asks'}}},{alias:'opens',sum:{field:{fieldPath:'opens'}}},{alias:'td',sum:{field:{fieldPath:'td'}}}]}},tok);
  const f=((r&&r[0]||{}).result||{}).aggregateFields||{},g=a=>{const x=f[a];return x?Number(x.integerValue||x.doubleValue||0):0};
  return{n:g('n'),asks:g('asks'),opens:g('opens'),td:g('td')};
}
async function dashboard(){
  const tok=await token();if(!tok)throw new Error('Login ka token nahi mila.');
  const t=day(),w=new Date();w.setDate(w.getDate()-6);const w7=day(w);
  const S_=v=>({stringValue:v});
  const [gAll,gOnly,gToday,uAll,uToday,u7]=await Promise.all([
    agg('guests',null,tok),
    agg('guests',cmp('li','EQUAL',{booleanValue:false}),tok),
    agg('guests',cmp('last','EQUAL',S_(t)),tok),
    agg('users',null,tok),
    agg('users',cmp('last','EQUAL',S_(t)),tok),
    agg('users',cmp('last','GREATER_THAN_OR_EQUAL',S_(w7)),tok)]);
  const g7=await agg('guests',cmp('last','GREATER_THAN_OR_EQUAL',S_(w7)),tok);
  const q=await req('POST',FS+':runQuery',{structuredQuery:{from:[{collectionId:'users'}],orderBy:[{field:{fieldPath:'last'},direction:'DESCENDING'}],limit:25}},tok);
  const rows=(q||[]).filter(x=>x.document).map(x=>{const f=x.document.fields||{};return{name:fv(f.name)||'',email:fv(f.email)||'',last:fv(f.last)||'',asks:fv(f.asks)||0,opens:fv(f.opens)||0}});
  return{gAll,gOnly,gToday,g7,uAll,uToday,u7,rows};
}
function dashHtml(d){
  const tile=(n,l)=>'<div class="card" style="padding:12px;text-align:center"><div style="font-size:26px;line-height:1.1;color:var(--gold-soft)">'+esc(String(n))+'</div><div class="muted small" style="margin-top:4px">'+esc(l)+'</div></div>';
  const rows=d.rows.map(r=>'<div class="field" style="padding:9px 0;align-items:flex-start"><div style="min-width:0"><div>'+esc(r.name||'—')+'</div><div class="muted small" style="word-break:break-all">'+esc(r.email)+'</div></div><div class="muted small" style="text-align:right;flex:none">'+esc(r.last)+'<br>'+r.asks+' sawal · '+r.opens+' open</div></div>').join('');
  return '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">'+
    tile(d.gAll.n,'Total phones (app khola)')+tile(d.gOnly.n,'Sirf guest (bina login)')+
    tile(d.uAll.n,'Google login users')+tile(d.gToday.n,'Aaj active phones')+
    tile(d.g7.n,'7 din me active phones')+tile(d.u7.n,'7 din me active login users')+
    tile(d.gAll.asks,'Total Ask AI sawal')+tile(d.gToday.td,'Aaj ke Ask AI sawal')+
    '</div>'+
    '<p class="muted small" style="margin:10px 2px">Total phones me login wale bhi shamil hain. Sawal ginti har phone ke apne counter se aati hai.</p>'+
    '<h3 class="h2" style="font-size:17px;margin-top:14px">Haal ke login users</h3>'+(rows||'<p class="muted small">Abhi koi login user nahi.</p>');
}

/* ---------- Account page ---------- */
function topbar(sub){return '<header class="topbar"><button class="ibtn" data-act="back" aria-label="Back">'+icon('back')+'</button><h1>Account<span class="sub">'+esc(sub)+'</span></h1></header>'}
R.account=async function(){
  const v=$('#view');
  const draw=()=>{
    const a=canAsk(),u=S.user;
    let h=topbar('Login, backup & aaj ki limit')+'<main id="acctRoot">';
    const mosqueSvg='<svg class="ac-mosque" viewBox="0 0 360 110" preserveAspectRatio="none" aria-hidden="true"><path d="M0 110V86h18V50l6-14 6 14v36h18V74c0-18 16-30 34-30s34 12 34 30v12h16V64c0-26 22-46 48-52 26 6 48 26 48 52v22h16V74c0-18 16-30 34-30s34 12 34 30v12h18V50l6-14 6 14v36h18v24Z" fill="currentColor"/></svg>';
    if(!u){
      h+='<section class="block ac-hero">'+
        '<div class="ac-brand"><span class="ar" lang="ar">ذِكْرُ الدِّين</span><b>Zikr Deen</b><small>Quran · Namaz · Hadith · AI Companion</small></div>'+
        '<div class="ac-perks">'+
          '<div><span>✨</span><b>रोज़ '+LIM.user+' AI सवाल</b><small>Guest में '+limitFor('guest')+' सवाल</small></div>'+
          '<div><span>☁️</span><b>Cloud Backup</b><small>प्रोग्रेस हमेशा सुरक्षित</small></div>'+
        '</div>'+
        '<div class="ac-actions">'+
          (ON&&canLogin()?
            '<button type="button" class="ac-gbtn" id="acLogin"><span class="ac-gico">G</span><span>Google से Sign In करें</span></button>':
            '<div class="ac-note-pill">'+(ON?'Google Login सिर्फ़ Android APK में चलता है':'इस ब्राउज़र प्रीव्यू में गेस्ट मोड चालू है (कोई लिमिट नहीं)')+'</div>')+
          '<a class="ac-guest-btn" href="#/home">Guest के तौर पर जारी रखें →</a>'+
        '</div>'+
        '<p class="ac-msg" id="acMsg"></p>'+
        mosqueSvg+
      '</section>';
    }else{
      h+='<section class="block card"><div style="display:flex;gap:12px;align-items:center">'+
        (u.photo?'<img src="'+esc(u.photo)+'" alt="" width="48" height="48" style="border-radius:50%;flex:none" referrerpolicy="no-referrer">':'<div style="width:48px;height:48px;border-radius:50%;background:var(--line);flex:none"></div>')+
        '<div style="min-width:0"><div style="font-weight:600">'+esc(u.name||'Google user')+(isOwner()?' · Owner':'')+'</div><div class="muted small" style="word-break:break-all">'+esc(u.email)+'</div></div></div>'+
        '<div class="field"><label>Aaj ke Ask AI sawal</label><b>'+(a.kind==='owner'?'Unlimited':(a.limit-a.left)+' / '+a.limit)+'</b></div>'+
        '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button class="btn sm" id="acBk">Cloud backup abhi</button><button class="btn sm ghost" id="acRs">Cloud se restore</button><button class="btn sm ghost" id="acOut">Logout</button></div>'+
        '<p class="muted small" id="acMsg" style="margin-top:8px">'+(S.bk?'Aakhri backup: '+esc(new Date(S.bk).toLocaleString()):'Abhi tak backup nahi liya.')+'</p></section>'+
        '<section class="block card"><h2 class="h2">Account delete karein</h2><p class="muted small">Aapka cloud data (naam, email, counters, backup) hata diya jaayega aur login khatam ho jaayega. Is phone ka progress surakshit rahega.</p><button class="btn sm ghost" id="acDel" style="color:#c0392b;border-color:#c0392b">'+icon('trash')+' Mera account delete karein</button></section>';
    }
    if(ON)h+='<section class="block card"><h2 class="h2">Privacy</h2><p class="muted small">Hum sirf gintiyan rakhte hain: app kitni baar khula, kitne sawal puchhe gaye, aakhri din. Login karne par aapka naam aur email bhi. Aapke sawalon ka text save nahi hota.</p></section>';
    if(isOwner())h+='<section class="block card" id="acDash"><h2 class="h2">Owner dashboard</h2><p class="muted small" id="acDashMsg">Load ho raha hai…</p><div id="acDashBody"></div><button class="btn sm ghost" id="acDashRef" style="margin-top:10px">Refresh</button></section>';
    v.innerHTML=h+'</main>';wire();
  };
  const msg=t=>{const m=$('#acMsg');if(m)m.textContent=t};
  const busy=(b,on)=>{if(b)b.disabled=on};
  function wire(){
    const b=id=>document.getElementById(id);
    if(b('acLogin'))b('acLogin').addEventListener('click',async e=>{
      busy(e.target,true);msg('Google login khul raha hai…');
      try{await login();ZD.toast('Login ho gaya');draw();autoBackup()}
      catch(err){busy(e.target,false);const m=String(err&&err.message||err);
        msg(/cancel/i.test(m)?'Login cancel kiya gaya.':/Google login|set nahi|sirf Android|poora nahi/.test(m)?m:'Login nahi ho saka ['+m.slice(0,80)+']. Firebase me SHA-1 aur Google sign-in check karein.')}
    });
    if(b('acOut'))b('acOut').addEventListener('click',async()=>{if(!confirm('Logout karein?'))return;await logout();ZD.toast('Logout ho gaya');draw()});
    if(b('acBk'))b('acBk').addEventListener('click',async e=>{busy(e.target,true);msg('Backup ho raha hai…');
      try{const n=await backup();msg('Backup ho gaya ✓ ('+Math.round(n/1024)+' KB) — '+new Date().toLocaleString())}catch(err){msg('Backup nahi hua: '+String(err.message||err).slice(0,100))}busy(e.target,false)});
    if(b('acRs'))b('acRs').addEventListener('click',async e=>{
      if(!confirm('Cloud ka backup is phone ke progress ki jagah aa jayega. Aage badhein?'))return;
      busy(e.target,true);msg('Restore ho raha hai…');
      try{await restore()}catch(err){msg('Restore nahi hua: '+String(err.message||err).slice(0,100));busy(e.target,false)}});
    if(b('acDel'))b('acDel').addEventListener('click',async e=>{
      if(!confirm('Account aur cloud data hamesha ke liye delete ho jaayega. Pakka?'))return;
      busy(e.target,true);
      try{await removeAccount();ZD.toast('Account delete ho gaya');draw()}catch(err){busy(e.target,false);ZD.toast('Delete nahi hua: '+String(err.message||err).slice(0,80))}});
    if(b('acDash')){
      const run=async()=>{const m=b('acDashMsg'),body=b('acDashBody');if(m)m.textContent='Load ho raha hai…';
        try{const d=await dashboard();if(!b('acDashBody'))return;body.innerHTML=dashHtml(d);m.textContent='Aaj: '+day()}
        catch(err){if(m)m.textContent='Dashboard nahi khula: '+String(err.message||err).slice(0,120)+(err.status===403?' — Firestore rules me owner email check karein.':'')}};
      b('acDashRef').addEventListener('click',run);run();
    }
  }
  draw();
};

/* ---------- More page: small Account card at the top ---------- */
const oldMore=R.more;
if(oldMore)R.more=async function(){
  await oldMore.apply(this,arguments);
  const root=$('#moreRoot');if(!root)return;
  const u=S.user,s=document.createElement('section');s.className='block card';
  s.innerHTML='<div style="display:flex;align-items:center;justify-content:space-between;gap:12px"><div><h2 class="h2" style="margin:0">Account &amp; Cloud Sync</h2><p class="muted small" style="margin:4px 0 0">'+(u?'Login: '+esc(u.email):'Google Login से रोज़ ज़्यादा AI सवाल और क्लाउड बैकअप')+'</p></div><a class="btn sm" href="#/account">'+(u?'प्रोफ़ाइल':'Sign In')+'</a></div>';
  root.insertBefore(s,root.firstChild);
};

/* ---------- public API + start ---------- */
ZD.acct={on:ON,canAsk,countAsk,limitText,note,state:()=>({user:S.user,kind:who(),today:S.today,asks:S.asks,opens:S.opens}),login,logout,backup,restore,ping:pingNow};
if(ON){
  let first=true;try{first=sessionStorage.getItem('zdAcctOpen')!=='1';sessionStorage.setItem('zdAcctOpen','1')}catch(e){}
  if(first){S.opens++;save()}
  setTimeout(async()=>{await checkSession();if(S.user&&!S.userFirst)await loadUser();await pingNow();autoBackup()},2500);
}
})();

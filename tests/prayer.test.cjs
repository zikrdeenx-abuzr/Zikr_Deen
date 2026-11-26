// Prayer-time property tests (no network). Run: node tests/prayer.test.cjs  (from project root)
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const src=fs.readFileSync(path.join(__dirname,'..','www','js','prayer.js'),'utf8');
const noop=()=>{};const ZD=new Proxy({R:{}},{get:(t,k)=>k in t?t[k]:noop,set:(t,k,v)=>{t[k]=v;return true}});
const ctx={window:{ZD},document:{addEventListener:noop,querySelector:()=>null,getElementById:()=>null},localStorage:{getItem:()=>null,setItem:noop},navigator:{},console,Intl,Date,Math,JSON,Object,Array,String,Number,isFinite,isNaN,parseInt,setTimeout:noop,setInterval:noop,Notification:undefined};
ctx.window.addEventListener=noop;ctx.window.matchMedia=()=>({matches:false});ctx.window.document=ctx.document;ctx.document.body={};ctx.window.localStorage=ctx.localStorage;ctx.window.navigator=ctx.navigator;
vm.createContext(ctx);vm.runInContext(src,ctx);
const P=ctx.window.ZD.prayerCalc;assert.ok(P,'prayerCalc hook missing');
const NAMES=['fajr','sunrise','dhuhr','asr','maghrib','isha'];
// independent solar-noon (NOAA approximation) in hours UTC
function noonUTC(y,m,d,lng){const n=(Date.UTC(y,m-1,d)-Date.UTC(y,0,0))/864e5,g=2*Math.PI/365*(n-1+(12-12)/24);
  const eqt=229.18*(0.000075+0.001868*Math.cos(g)-0.032077*Math.sin(g)-0.014615*Math.cos(2*g)-0.040849*Math.sin(2*g));return 12-lng/15-eqt/60}
let checked=0,nulls=[];
const dates=[[2026,1,15],[2026,3,20],[2026,6,21],[2026,9,23],[2026,12,21]];
for(const c of P.WORLD){
  for(const [y,m,d] of dates){
    const tz=P.tzAt(y,m,d,c[3]),r=P.compute(y,m,d,c[1],c[2],tz,c[4],1);
    const bad=NAMES.filter(k=>!isFinite(r[k]));
    if(bad.length){nulls.push(c[0]+' '+y+'-'+m+'-'+d+': '+bad.join(','));continue}
    // 1) dhuhr matches independent solar noon within 4 minutes
    const dh=(r.dhuhr-tz+24)%24,ref=((noonUTC(y,m,d,c[2])%24)+24)%24,diff=Math.min(Math.abs(dh-ref),24-Math.abs(dh-ref));
    assert.ok(diff*60<4,`${c[0]} ${y}-${m}-${d} dhuhr off by ${(diff*60).toFixed(1)} min`);
    // 2) order within the local day
    const o=[r.fajr,r.sunrise,r.dhuhr,r.asr,r.maghrib,r.isha];
    for(let i=1;i<o.length;i++)assert.ok(o[i]>o[i-1]-1e-9||o[i]+24>o[i-1]&&i===5,`${c[0]} ${y}-${m}-${d} order ${NAMES[i-1]}>${NAMES[i]}`);
    checked++;
  }
}
// 3) high latitude: Oslo in June must still give finite Fajr/Isha (night-portion rule), Tromso polar summer may be missing
const oslo=P.WORLD.find(c=>c[0]==='Oslo'),ro=P.compute(2026,6,21,oslo[1],oslo[2],P.tzAt(2026,6,21,oslo[3]),'mwl',1);
assert.ok(isFinite(ro.fajr)&&isFinite(ro.isha),'Oslo June fajr/isha should be finite with high-latitude rule');
// 4) DST: London summer is UTC+1 and shifts local dhuhr by ~1h versus winter
assert.strictEqual(P.offAt(Date.UTC(2026,0,15,12),'Europe/London'),0);assert.strictEqual(P.offAt(Date.UTC(2026,6,15,12),'Europe/London'),1);assert.strictEqual(P.offAt(Date.UTC(2026,6,15,12),'America/New_York'),-4);assert.strictEqual(P.offAt(Date.UTC(2026,0,15,12),'America/New_York'),-5);
// 5) every suggested method exists
for(const c of P.WORLD)assert.ok(P.METHODS[c[4]],'unknown method '+c[4]);
console.log('PASS prayer: '+checked+' city/date combos checked (dhuhr vs independent solar noon, ordering, high-latitude, methods)');
if(nulls.length)console.log('NOTE times not computable (polar/extreme-latitude, shown as "—" in app):\n  '+nulls.join('\n  '));
if(process.argv[2]==='show'){const f=h=>{h=((h%24)+24)%24;const m=Math.round(h*60);return String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(m%60).padStart(2,'0')};
for(const n of ['Makkah','London','Oslo','Istanbul','Singapore']){const c=P.WORLD.find(x=>x[0]===n),tz=P.tzAt(2026,6,21,c[3]),r=P.compute(2026,6,21,c[1],c[2],tz,c[4],1);console.log(n,'21 Jun 2026 UTC'+(tz>=0?'+':'')+tz,NAMES.map(k=>k+' '+f(r[k])).join(' | '))}}

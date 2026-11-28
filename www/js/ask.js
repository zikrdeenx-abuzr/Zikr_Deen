(function(){'use strict';
const ZD=window.ZD,$=ZD.$,esc=ZD.esc,icon=ZD.icon,R=ZD.R;
const CFG=window.ZD_ASK||{};
if(CFG.proxy&&String(CFG.proxy).indexOf('__')===0)CFG.proxy='';
if(CFG.key&&String(CFG.key).indexOf('__')===0)CFG.key='';
const HKEY='zdAskChat';
const SYSTEM=`You are "Ask Zikr Deen", a careful Islamic knowledge assistant inside the Zikr Deen app.

RULES
1. Answer from the Quran and authentic Sunnah, following the understanding of Ahl as-Sunnah wal-Jamaah. Use web search to verify every ayah, hadith and ruling before answering. Prefer reliable sources: quran.com, sunnah.com, islamqa.info, dorar.net, Darul Uloom / Al-Azhar / Dar al-Ifta websites, Islamweb.
2. Quran: give Surah name and number, e.g. (Al-Baqarah 2:255), with the Arabic text and a short translation. Hadith: give collection and number, e.g. (Sahih al-Bukhari 1), and the grading (sahih / hasan / da'if) when known. NEVER invent or guess an ayah, hadith, narrator or reference. If you cannot verify it, say so clearly.
3. For fiqh questions where scholars differ, state the main views (Hanafi, Maliki, Shafi'i, Hanbali) fairly and without sectarian attack. Do not make takfir or insult any group.
4. You are not a mufti. For serious personal matters (talaq, inheritance, major financial contracts, medical-religious decisions) give the general ruling and advise asking a qualified local scholar.
5. Reply in the SAME language and script as the user: Hindi (Devanagari), Hinglish, Urdu, or English. Keep answers short, clear and kind: first a direct answer, then the evidence, then a brief practical note. For greetings or small talk reply in one short line. Keep the whole answer under about 180 words unless the user asks for detail.
6. If the question is not about Islam, answer briefly and politely and guide back to Islamic topics. Refuse anything harmful, hateful or sectarian.
7. End religious rulings with "Wallahu a'lam" (Allah knows best).
8. UNDERSTAND THE QUESTION FIRST. The user writes Roman Urdu / Hinglish with spelling mistakes (e.g. "raful yadain / rafuluden" = rafa' al-yadain, "ahdees / hadis" = ahadees, "nikl kr do" = nikaal kar do). Work out what they really want and answer exactly that, in depth, not a general overview. If they ask for "all hadith" or "hadith numbers" on a topic: give a complete organised list, collection by collection (Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasa'i, Ibn Majah, Muwatta, Musnad), each with hadith number, the narrating Sahabi and the grading, and quote the Arabic and a short translation of the 2-3 strongest ones. Say clearly if the list is not exhaustive and what remains.
9. HADITH REFERENCES MUST BE VERIFIED. Give a hadith number only after verifying the exact collection AND the exact hadith text on a reliable source such as sunnah.com, dorar.net or islamweb. State the numbering system (prefer Sunnah.com modern reference) and keep any In-book Book/Hadith number separate. In the Zikr Deen/Fawaz Hadith API dataset, hadithnumber is an internal sequence key used only to join language editions; NEVER cite it as the public hadith number. Use the API arabicnumber only after confirming it matches the same hadith text and public reference on the source. For Sahih Muslim, decimal variants such as 183.02 correspond to Sunnah.com 183b; do not treat the internal sequence (for example 455) as the Sunnah.com number. If a reference or match cannot be verified, say "number verify nahi hua" and do not guess.
10. NEVER start an answer with "Assalamu alaikum / Wa alaikum assalam" unless the user's latest message itself is a greeting. Do not repeat greetings, introductions or the user's question. Go straight to the answer.
11. If the question seems cut off or unclear, answer the clear part and ask ONE short clarifying line in the user's own language. Never write notes like "question cut off" in a different script.

APP GUIDE (use this when the user asks where something is in the Zikr Deen app, or how to do something in it)
The app has 6 bottom tabs: Home, Quran, Learn, Al-Mulk, Ask AI, More. When you point to a place, give the path in words AND a tappable link in the form [Name](#/route). Only use routes listed here.
- Home [Home](#/home): Aaj ki Ayah (Al-Mulk) with listen/share, namaz timing card, daily reading goal, streak, Ask Zikr Deen card, Learn folders, Go to ayah, Saved.
- Quran tab [Quran](#/surahs): all 114 surahs (read or listen). Juz index and Mushaf: [Juz index](#/juz). Open any ayah: Home or Quran > "Go to ayah" (e.g. 67:15). Bookmarks: [Saved](#/bookmarks).
- Surah Al-Mulk hifz hub (learn, lab, revision, listening): [Al-Mulk](#/mulk).
- Learn tab [Learn](#/folders) has folders: [Ayah by Ayah](#/learn), [Namaz (steps, rakats, what to recite)](#/namaz), [Mukammal Namaz - word by word, Arabic, Roman, Hinglish tarjuma, 22 hisse](#/nz), [Daily Azkaar - subah-shaam, namaz ke baad, roz-marra duaein](#/azkaar), [Hadith - Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasa'i, Ibn Majah with Arabic, Urdu, English, AI Hinglish](#/hadith), [Repeat](#/repeat), [Puzzles](#/puzzle), [Revision](#/revision), [Start here](#/path).
- Open a specific verified hadith directly inside the app: [Sahih al-Bukhari 1](#/hone/bukhari/1) or [Sahih Muslim 183b](#/hone/muslim/183b) (valid book ids: bukhari, muslim, tirmidhi, abudawud, nasai, ibnmajah — always use verified Sunnah.com public reference).
- Qibla direction (compass to find the Kaaba): Home or Learn > "Qibla Direction" folder [Qibla Direction](#/qibla).
- Namaz timings and Azan: More tab > "Namaz Timings & Azan" [Namaz Timings](#/prayer) (city setting, azan at prayer time, reminders).
- Account / Google login: [Account](#/account) (also a card at the top of the More tab). Guests get a few free Ask AI questions a day; after Google login the daily limit is higher, and progress can be backed up to the cloud and restored on a new phone. The same page has Logout and "Delete my account".
- More tab [More](#/more): appearance (theme, text size), reading and listening settings, offline library (download surahs for offline), backup and restore, about.
- Specific places: Wudu ka tareeqa = Mukammal Namaz > Hissa 2 [Hissa 2](#/nsec/2). Azaan aur jawab = [Hissa 4](#/nsec/4). Namaz ka mukammal tareeqa = [Hissa 5](#/nsec/5). Witr/Qunoot = [Hissa 7](#/nsec/7). Namaz ke baad ke azkaar = [Hissa 8](#/nsec/8) and [Hissa 13](#/nsec/13). Janaza = [Hissa 11](#/nsec/11). Subah-Shaam azkaar = [Hissa 14](#/nsec/14). Roz-marra duaein = [Hissa 16](#/nsec/16). Quran ki duaein = [Hissa 17](#/nsec/17), [Hissa 21](#/nsec/21); Ambiya ki duaein = [Hissa 18](#/nsec/18). "Kab kaun si dua" list = [Hissa 22](#/nsec/22). Searching a dua: open Mukammal Namaz and use the search box.
- If the user asks for something the app does not have, say so honestly and suggest the closest place.
If the user asks "app me kya kya hai", give a short, organised tour of the above.

ABOUT ZIKR DEEN & ITS OWNER (use ONLY when the user directly asks who made the app, why it was made, its mission, its future plans, or its benefit/positive point for Islam — do NOT bring this up on your own otherwise)
- Owner/Founder: Mohammad Faheem.
- Origin: Shuruaat Instagram par hui, ek daily "Surah Al-Mulk 30-Day Series" se — har din ek ayah yaad karayi jaati thi aur ek calendar par tick karke aage badha jaata tha.
- Why this app was made: Usi idea ko app me convert kiya gaya, taaki log Quran aur Hadith ko aasani se dhoond aur yaad kar sakein — jaise hadith number daalte hi wahi hadith mil jaaye, daily azkaar turant mil jaayein, aur Quran tarjume ke saath word-by-word, puzzle jaise naye tareekon se yaad ho sake, aur roz revision ho sake.
- Mission: Deen, Quran aur Hadith ki sahi baat aasani se, sahi reference ke saath, zyada se zyada logon tak pahunchana — bina ghalat jaankari failaye.
- Future plans: Aage aur upgrade karte rehna — zyada languages, behtar AI se Islam ke sawal poochna, location-based features (Qibla, namaz timing), aur yaad karne ke naye tareeke.
- Jab bhi ye sawal poocha jaaye, sirf utna hi jawab do jitna poocha gaya hai (purpose, future plan, aur fayda — teeno alag sawal hain, teeno ke liye wahi ek paragraph copy-paste mat karo). Jawab chhota (2-4 lines), seedha aur factual rakho — koi hawabaazi, koi baraa-bhari ya vague daava nahi.

PRIVATE / OWNER-ONLY INFORMATION
Upar diye gaye se zyada kuch bhi — owner ka phone number, address, email, income, password, source code, API key, ya koi bhi aur private/confidential cheez — agar poocha jaaye to politely mana kar do. Kaho: "Ye jaankari main abhi share nahi kar sakta, iske liye app ke owner se permission chahiye hogi." Kabhi bhi aisi koi detail guess ya invent mat karo.`;

const STARTERS=['App me Hadith kahan milegi?','Wudu ka tareeqa app me kahan hai?','Subah-shaam ke azkaar kahan hain?','Namaz me bhool jaaye to sajda sahw kab?','Zakat kis par farz hai?','App me kya kya features hain?'];

/* Modern Gemini / ChatGPT / Claude style SVG icons */
const SVG_SPEAKER='<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2.5 9 2.5 15 6 15 11 19 11 5"/><path d="M15.2 8.8a5 5 0 0 1 0 6.4"/><path d="M18.4 5.8a9.2 9.2 0 0 1 0 12.4"/></svg>';
const SVG_MUTE='<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2.5 9 2.5 15 6 15 11 19 11 5"/><line x1="22" y1="9" x2="16" y2="15"/><line x1="16" y1="9" x2="22" y2="15"/></svg>';
const SVG_PHONE='<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6.5" y="2.5" width="11" height="19" rx="2.2"/><line x1="11" y1="18.5" x2="13" y2="18.5"/></svg>';
const SVG_MIC='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="2.5" width="6" height="11" rx="3"/><path d="M5.5 10.5a6.5 6.5 0 0 0 13 0"/><path d="M12 17v4"/><path d="M8.5 21h7"/></svg>';
function vIcon(k){
  if(window.ZDVoice&&window.ZDVoice.icons&&window.ZDVoice.icons[k])return window.ZDVoice.icons[k];
  return ({speaker:SVG_SPEAKER,speakerOff:SVG_MUTE,mic:SVG_MIC})[k]||SVG_SPEAKER;
}

function load(){try{return JSON.parse(localStorage.getItem(HKEY)||'[]')}catch(e){return[]}}
function save(h){try{localStorage.setItem(HKEY,JSON.stringify(h.slice(-40)))}catch(e){}}
function hasBackend(){return !!(CFG.proxy||(CFG.key&&CFG.key.indexOf('__')!==0))}

function md(t){
  let s=esc(t);
  s=s.replace(/\[([^\]\n]{1,80})\]\((#\/[a-z0-9\/_-]*)\)/gi,'<a class="ask-link" href="$2">$1</a>').replace(/\[([^\]\n]{1,80})\]\((https:\/\/[^\s)]+)\)/gi,'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  s=s.replace(/\*\*([^*\n]+)\*\*/g,'<b>$1</b>').replace(/(^|[^*])\*([^*\n]+)\*/g,'$1<i>$2</i>');
  s=s.replace(/([\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF][\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF\s\u064B-\u0652\u06D6-\u06ED،؟.]*)/g,m=>{
    const x=m.trim(),hk=(x.match(/[\u064B-\u0652]/g)||[]).length;
    if(hk>=3)return'<span class="ar ask-ar" lang="ar">'+x+'</span> ';
    if(x.replace(/[\s.,،؟]/g,'').length<=3)return'<span class="ar" lang="ar" style="font-size:1.25em;color:var(--gold-soft)">'+x+'</span> ';
    return'<span lang="ur" dir="rtl" style="unicode-bidi:isolate;font-size:1.05em">'+x+'</span> ';
  });
  const lines=s.split('\n'),out=[];
  let inList=false;
  for(const ln of lines){
    const m=ln.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)$/);
    if(m){if(!inList){out.push('<ul>');inList=true}out.push('<li>'+m[1]+'</li>')}
    else{if(inList){out.push('</ul>');inList=false}out.push(ln.trim()?'<p>'+ln+'</p>':'')}
  }
  if(inList)out.push('</ul>');
  return out.join('');
}

const NT=()=>window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.TextToSpeech;
const TTS_OK=('speechSynthesis' in window&&typeof SpeechSynthesisUtterance!=='undefined')||!!NT();
const AC=window.AudioContext||window.webkitAudioContext;
const VOICE_OK=TTS_OK||!!AC;
const BASE='https://generativelanguage.googleapis.com/v1beta/models/';
const VMODEL=CFG.voiceModel||'gemini-2.5-flash-preview-tts';
const VKEY='zdAskVoiceMode',VO={sp:0,pend:'',first:false,said:0};
const GT={ctx:null,gen:0,tail:Promise.resolve(),t:0,src:[],failUntil:0};

function voiceMode(){
  let m='n';
  try{m=localStorage.getItem(VKEY)||'n'}catch(e){}
  if(m!=='n'&&m!=='p'&&m!=='x')m='n';
  if(m==='n'&&!AC)m=TTS_OK?'p':'x';
  if(m==='p'&&!TTS_OK)m=AC?'n':'x';
  return m;
}
function setVoiceMode(m){try{localStorage.setItem(VKEY,m)}catch(e){}}
const VNAME_KEY='zdAskVoiceName',VRATE_KEY='zdAskVoiceRate',AMOD_KEY='zdAskModelMode';
const VOICE_STYLES=[
  ['Orus','Orus (Male) · शांत व साफ़'],
  ['Charon','Charon (Male) · गंभीर और शांत'],
  ['Fenrir','Fenrir (Male) · गहरी आवाज़'],
  ['Alnilam','Alnilam (Male) · स्पष्ट उच्चारण'],
  ['Algieba','Algieba (Male) · स्मूथ टीचर'],
  ['Algenib','Algenib (Male) · हल्की पुरुष आवाज़'],
  ['Achird','Achird (Male) · फ्रेंडली'],
  ['Enceladus','Enceladus (Male) · धीमी और कोमल'],
  ['Iapetus','Iapetus (Male) · संतुलित'],
  ['Puck','Puck (Male) · तेज़ और फ्रेंडली'],
  ['Kore','Kore (Female) · साफ़ और सौम्य'],
  ['Aoede','Aoede (Female) · मधुर आवाज़'],
  ['Leda','Leda (Female) · युवा और स्पष्ट'],
  ['Achernar','Achernar (Female) · सॉफ्ट'],
  ['Autonoe','Autonoe (Female) · ब्राइट'],
  ['Callirrhoe','Callirrhoe (Female) · आरामदायक'],
  ['Despina','Despina (Female) · स्मूथ'],
  ['Erinome','Erinome (Female) · स्पष्ट'],
  ['Gacrux','Gacrux (Female) · परिपक्व'],
  ['Laomedeia','Laomedeia (Female) · उत्साही'],
  ['Pulcherrima','Pulcherrima (Female) · विनम्र']
];
function voiceName(){
  try{
    if(window.ZDVoice&&typeof window.ZDVoice.getVoice==='function'){
      const zv=window.ZDVoice.getVoice();
      if(zv&&VOICE_STYLES.some(x=>x[0]===zv))return zv;
    }
    const v=localStorage.getItem(VNAME_KEY);
    if(v&&VOICE_STYLES.some(x=>x[0]===v))return v;
  }catch(e){}
  return CFG.voiceName||'Orus';
}
function setVoiceName(v){
  try{localStorage.setItem(VNAME_KEY,v)}catch(e){}
  try{if(window.ZDVoice&&typeof window.ZDVoice.setVoice==='function')window.ZDVoice.setVoice(v)}catch(e){}
}
function voiceRate(){
  try{
    if(window.ZDVoice&&typeof window.ZDVoice.getPrefs==='function'){
      const r=Number(window.ZDVoice.getPrefs().speed);
      if(r>=0.7&&r<=1.5)return r;
    }
    const r=parseFloat(localStorage.getItem(VRATE_KEY)||'1');
    if(r>=0.7&&r<=1.5)return r;
  }catch(e){}
  return 1;
}
function setVoiceRate(r){
  try{localStorage.setItem(VRATE_KEY,String(r))}catch(e){}
  try{if(window.ZDVoice&&typeof window.ZDVoice.setPrefs==='function')window.ZDVoice.setPrefs({speed:r})}catch(e){}
}
function aiModelMode(){try{return localStorage.getItem(AMOD_KEY)==='lite'?'lite':'auto'}catch(e){return 'auto'}}
function setAiModelMode(m){try{localStorage.setItem(AMOD_KEY,m==='lite'?'lite':'auto')}catch(e){}}

function voiceUnlock(){
  if(!AC)return;
  try{
    if(!GT.ctx||GT.ctx.state==='closed')GT.ctx=new AC();
    if(GT.ctx.state==='suspended')GT.ctx.resume().catch(()=>{});
  }catch(e){}
}
function voiceStop(){
  VO.sp=0;VO.pend='';VO.first=false;VO.said=0;GT.gen++;GT.tail=Promise.resolve();
  GT.src.forEach(x=>{try{x.stop()}catch(e){}});GT.src=[];GT.t=0;
  try{if(NT())NT().stop()}catch(e){}
  if('speechSynthesis' in window)try{speechSynthesis.cancel()}catch(e){}
}

const AR_RUN=/[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF][\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF\s\u064B-\u0652\u06D6-\u06ED،؟.]*/g;
function speakClean(t){
  return t.replace(/\[([^\]\n]*)\]\((?:#\/|https?:)[^)]*\)/g,'$1')
    .replace(AR_RUN,m=>(m.match(/[\u064B-\u0652]/g)||[]).length>=2?' ':m)
    .replace(/[*_`#>]+/g,'').replace(/^\s*[-•]\s+/gm,'').replace(/\(\s*\)/g,'')
    .replace(/[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/gu,'').replace(/\s+/g,' ').trim();
}
function langOf(s){return /[\u0900-\u097F]/.test(s)?'hi-IN':/[\u0600-\u06FF]/.test(s)?'ur-PK':'en-IN'}

let NTAIL=Promise.resolve();
function nativeSay(s,gen){
  const T=NT();if(!T)return false;
  NTAIL=NTAIL.then(async()=>{
    if(gen!==GT.gen)return;
    try{await T.speak({text:s,lang:langOf(s),rate:voiceRate(),pitch:1,volume:1})}
    catch(e){
      try{if(gen!==GT.gen)return;await T.speak({text:s,lang:'en-US',rate:voiceRate(),pitch:1,volume:1})}
      catch(e2){vtoast('Phone ki awaaz nahi chal saki — Phone Settings > Text-to-speech me Google voice install karein');try{T.openInstall&&T.openInstall()}catch(_){}}
    }
  });
  return true;
}
function deviceSay(s,gen){
  if(!TTS_OK)return;
  const wait=GT.ctx?Math.max(0,(GT.t-GT.ctx.currentTime))*1000:0;
  if(NT()){if(wait>50)setTimeout(()=>{if(gen===GT.gen)nativeSay(s,gen)},wait);else nativeSay(s,gen);return}
  const run=()=>{
    if(gen!==GT.gen)return;
    try{
      if(!speechSynthesis.getVoices().length&&!deviceSay.warned){deviceSay.warned=1;setTimeout(()=>{if(!speechSynthesis.getVoices().length)vtoast('Is phone me Text-to-speech awaaz nahi mili — Phone Settings > Text-to-speech me Google voice install karein')},1500)}
      const u=new SpeechSynthesisUtterance(s);u.lang=langOf(s);u.rate=voiceRate();u.onerror=()=>vtoast('Phone ki awaaz nahi chal saki');speechSynthesis.speak(u);
    }catch(e){}
  };
  if(wait>50)setTimeout(run,wait);else run();
}

function loadCool(k){try{return JSON.parse(sessionStorage.getItem(k)||'{}')}catch(e){return{}}}
function saveCool(k,o){try{sessionStorage.setItem(k,JSON.stringify(o))}catch(e){}}

const VMODELS=[...new Set([...(Array.isArray(CFG.voiceModels)?CFG.voiceModels:[]),VMODEL,'gemini-2.5-flash-preview-tts'])];
const VCOOL=loadCool('zdAskVCool');
async function geminiVoice(text){
  if(!hasBackend()){const e=new Error('tts nokey');e.nokey=true;throw e}
  let last=null,saw429=false;
  const now=Date.now();
  const active=VMODELS.filter(m=>(VCOOL[m]||0)<=now);
  const order=active.length?active:VMODELS;
  for(const m of order){
    try{return await geminiVoice1(text,m)}
    catch(e){
      last=e;
      const st=e.status||0,msg=String(e.message||'');
      if(st===429||/429/.test(msg)){saw429=true;VCOOL[m]=Date.now()+10*60*1000;saveCool('zdAskVCool',VCOOL);continue}
      if(st===400||st===403||st===404||/ (400|403|404)$/.test(msg)){VCOOL[m]=Date.now()+6*60*60*1000;saveCool('zdAskVCool',VCOOL);continue}
      if(st===401)throw e;
      VCOOL[m]=Date.now()+60*1000;saveCool('zdAskVCool',VCOOL);
      continue;
    }
  }
  const err=last||new Error(saw429?'tts 429':'tts failed');
  if(saw429&&!err.status)err.status=429;
  throw err;
}
async function geminiVoice1(text,model){
  const body={contents:[{parts:[{text}]}],generationConfig:{responseModalities:['AUDIO'],speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:voiceName()}}}}};
  const headers={'Content-Type':'application/json'};
  let url;
  if(CFG.proxy){url=CFG.proxy;body.model=model}
  else{url=BASE+model+':generateContent';headers['x-goog-api-key']=CFG.key}
  const ctl=new AbortController(),to=setTimeout(()=>ctl.abort(),16000);
  try{
    const r=await fetch(url,{method:'POST',headers,body:JSON.stringify(body),signal:ctl.signal});
    const j=await r.json().catch(()=>({}));
    if(!r.ok){const e=new Error('tts '+r.status);e.status=r.status;throw e}
    const parts=(((j.candidates||[])[0]||{}).content||{}).parts||[];
    const d=(parts.find(x=>x.inlineData&&x.inlineData.data)||{}).inlineData;
    if(!d)throw new Error('tts empty');
    return d;
  }finally{clearTimeout(to)}
}
async function toBuffer(d){
  const ctx=GT.ctx,bin=atob(d.data),n=bin.length,u8=new Uint8Array(n);
  for(let i=0;i<n;i++)u8[i]=bin.charCodeAt(i);
  const mt=String(d.mimeType||'');
  if(!mt||/L16|pcm/i.test(mt)){
    const rate=+((mt.match(/rate=(\d+)/)||[])[1])||24000,len=n>>1,buf=ctx.createBuffer(1,len,rate),ch=buf.getChannelData(0),dv=new DataView(u8.buffer);
    for(let i=0;i<len;i++)ch[i]=dv.getInt16(i*2,true)/32768;
    return buf;
  }
  return await ctx.decodeAudioData(u8.buffer.slice(0));
}

const VCAP=1600;
function vtoast(m){try{ZD.toast(m)}catch(e){}}
function speakUnit(raw){
  let s=speakClean(raw);if(!s||!/[\p{L}\p{N}]/u.test(s))return;
  if(VO.said>=VCAP)return;
  if(VO.said+s.length>VCAP){s=s.slice(0,VCAP-VO.said);const k=Math.max(s.lastIndexOf('. '),s.lastIndexOf('। '));if(k>200)s=s.slice(0,k+1)}
  VO.said+=s.length;
  const gen=GT.gen;
  if(voiceMode()==='p'||!hasBackend()||!GT.ctx||Date.now()<GT.failUntil){deviceSay(s,gen);return}
  GT.tail=GT.tail.then(async()=>{
    if(gen!==GT.gen)return;
    if(Date.now()<GT.failUntil){deviceSay(s,gen);return}
    try{
      const ctx=GT.ctx;
      if(ctx.state!=='running'){try{await ctx.resume()}catch(e){}}
      if(ctx.state!=='running')throw new Error('audio locked');
      const buf=await toBuffer(await geminiVoice(s));
      if(gen!==GT.gen)return;
      const src=ctx.createBufferSource();src.buffer=buf;const rt=voiceRate();src.playbackRate.value=rt;src.connect(ctx.destination);
      GT.t=Math.max(GT.t,ctx.currentTime+.05);src.start(GT.t);GT.t+=buf.duration/rt;
      GT.src.push(src);src.onended=()=>{GT.src=GT.src.filter(x=>x!==src)};
    }catch(e){
      if(gen!==GT.gen)return;
      const lim=e.status===429||/429/.test(e.message||'');
      GT.failUntil=Date.now()+(lim?15:2)*60*1000;
      vtoast(lim?'सभी Gemini वॉइस मॉडल की फ्री लिमिट पूरी — अभी फोन की आवाज़ चल रही है':'Gemini आवाज़ उपलब्ध नहीं — फोन की आवाज़ चल रही है');
      deviceSay(s,gen);
    }
  });
}
function flushPend(){const t=VO.pend;VO.pend='';VO.first=true;if(t)speakUnit(t)}
function emit(txt,final){
  if(voiceMode()!=='n'){speakUnit(txt);return}
  VO.pend+=(VO.pend?' ':'')+txt;
  if(final||!VO.first||VO.pend.length>=450)flushPend();
}
function voiceFeed(full,final){
  if(!VOICE_OK||voiceMode()==='x'||!document.getElementById('askList'))return;
  full=full.replace(/^\s+/,'');
  if(full.length<VO.sp)voiceStop();
  const rest=full.slice(VO.sp);let cut=-1,m;const re=/[.!?।]+(?=\s)|\n/g;
  while((m=re.exec(rest)))cut=m.index+m[0].length;
  if(final)cut=rest.length;
  if(cut>0){emit(rest.slice(0,cut),final);VO.sp+=cut}
  else if(final&&VO.pend)flushPend();
}
window.addEventListener('hashchange',voiceStop);

function toContents(h){return h.filter(m=>m.t&&!m.l).slice(-12).map(m=>({role:m.r==='u'?'user':'model',parts:[{text:m.t}]}))}
const MODELS=(Array.isArray(CFG.models)&&CFG.models.length)?CFG.models:['gemini-3.8-flash','gemini-3.6-flash','gemini-3.5-flash-lite','gemini-3.1-flash-lite','gemini-2.5-flash','gemini-2.5-flash-lite'];
const MCOOL=loadCool('zdAskMCool');
let SEARCH_OFF=false;
const THK={};
function thinkVariants(model){return /2\.5/.test(model)?[{thinkingBudget:0},null]:[{thinkingLevel:'minimal'},{thinkingLevel:'low'},{thinkingBudget:0},null]}

async function callGemini(model,contents,grounded,sys,opts){
  const vs=thinkVariants(model);let last;
  for(let i=THK[model]||0;i<vs.length;i++){
    try{const j=await callOnce(model,contents,grounded,sys,opts,vs[i]);THK[model]=i;return j}
    catch(e){last=e;if(!(e.status===400&&/think/i.test(e.message||'')))throw e}
  }
  throw last;
}
async function callOnce(model,contents,grounded,sys,opts,th){
  opts=opts||{};
  const gc={temperature:.3,maxOutputTokens:opts.maxTokens||8192};
  if(th)gc.thinkingConfig=th;
  const body={systemInstruction:{parts:[{text:sys||SYSTEM}]},contents,generationConfig:gc};
  if(grounded)body.tools=[{google_search:{}}];
  const headers={'Content-Type':'application/json'};
  const stream=!!opts.onDelta&&!CFG.proxy&&typeof TextDecoder!=='undefined'&&typeof ReadableStream!=='undefined';
  let url;
  if(CFG.proxy){url=CFG.proxy;body.model=model}
  else{url=BASE+model+(stream?':streamGenerateContent?alt=sse':':generateContent');headers['x-goog-api-key']=CFG.key}
  const ctl=new AbortController();let to;
  const baseMs=opts.timeoutMs||(stream?(grounded?28000:22000):(grounded?35000:28000));
  const arm=ms=>{clearTimeout(to);to=setTimeout(()=>ctl.abort(),ms)};
  arm(baseMs);
  try{
    const r=await fetch(url,{method:'POST',headers,body:JSON.stringify(body),signal:ctl.signal});
    if(!r.ok){const j=await r.json().catch(()=>({}));const e=new Error((j.error&&j.error.message)||('HTTP '+r.status));e.status=r.status;throw e}
    if(!stream)return await r.json().catch(()=>({}));
    const rd=r.body.getReader(),dec=new TextDecoder();
    let buf='',text='',meta=null;
    const eat=line=>{
      if(line.slice(0,5)!=='data:')return;
      const d=line.slice(5).trim();if(!d||d==='[DONE]')return;
      let j;try{j=JSON.parse(d)}catch(_){return}
      if(j.error){const e=new Error(j.error.message||'stream error');e.status=j.error.code;throw e}
      const c=(j.candidates||[])[0];if(!c)return;
      const add=((c.content&&c.content.parts)||[]).filter(p=>p.text&&!p.thought).map(p=>p.text).join('');
      if(c.groundingMetadata&&c.groundingMetadata.groundingChunks)meta=c.groundingMetadata;
      if(add){text+=add;opts.onDelta(text)}
    };
    try{
      for(;;){
        const x=await rd.read();if(x.done)break;
        arm(28000);
        buf+=dec.decode(x.value,{stream:true});
        let k;while((k=buf.indexOf('\n'))>=0){eat(buf.slice(0,k).replace(/\r$/,''));buf=buf.slice(k+1)}
      }
      if(buf)eat(buf.replace(/\r$/,''));
    }catch(e){if(text.trim().length<40)throw e}
    return{candidates:[{content:{parts:[{text}]},groundingMetadata:meta||undefined}]};
  }finally{clearTimeout(to)}
}
function parse(j){
  const c=(j.candidates||[])[0];if(!c)throw new Error('empty');
  const text=((c.content&&c.content.parts)||[]).filter(p=>p.text&&!p.thought).map(p=>p.text).join('').trim();
  if(!text)throw new Error('empty');
  const seen={},src=[];
  (((c.groundingMetadata||{}).groundingChunks)||[]).forEach(g=>{const w=g.web;if(w&&w.uri&&!seen[w.uri]){seen[w.uri]=1;src.push({u:w.uri,t:w.title||w.uri})}});
  return{text,src:src.slice(0,5)};
}
function orderedModels(){
  if(aiModelMode()==='lite'){
    const lites=MODELS.filter(x=>/lite/i.test(x));
    const rest=MODELS.filter(x=>!/lite/i.test(x));
    return [...lites,...rest];
  }
  return MODELS;
}
async function ask(history,noSearch,sys,opts){
  opts=opts||{};
  if(!hasBackend()){const e=new Error('nokey');e.nokey=true;throw e}
  const contents=toContents(history);let last;
  const t0=Date.now();let skipSearch=false;
  const mOrd=orderedModels();
  const live=mOrd.filter(m=>(MCOOL[m]||0)<=Date.now()),list=live.length?live:mOrd;
  for(const model of (opts.fast?list.slice(0,3):list)){
    if(last&&Date.now()-t0>65000)break;
    for(const grounded of ((noSearch||SEARCH_OFF||skipSearch)?[false]:[true,false])){
      try{return parse(await callGemini(model,contents,grounded,sys,opts))}
      catch(e){
        e.model=model;e.ms=Date.now()-t0;last=e;
        if(e.status===404){MCOOL[model]=Date.now()+6*3600*1000;saveCool('zdAskMCool',MCOOL);break}
        if(e.status===429){MCOOL[model]=Date.now()+5*60*1000;saveCool('zdAskMCool',MCOOL);break}
        if(grounded&&(e.status===400||e.status===403)&&/ground|search|tool/i.test(e.message||'')){SEARCH_OFF=true;continue}
        if(e.status===401)throw e;
        if(e.name==='AbortError'||/Failed to fetch|NetworkError|Load failed/i.test(e.message||'')){e.offline=true;if(grounded){skipSearch=true;continue}break}
      }
    }
  }
  throw last;
}
function friendly(e){
  const dbg=' [Detail: '+(e.status||e.name||'error')+' — '+String(e.message||'').slice(0,90)+(e.model?' · '+e.model+' '+Math.round((e.ms||0)/1000)+'s':'')+']';
  return friendly0(e)+(e.nokey?'':dbg);
}
function friendly0(e){
  if(e.nokey)return'AI abhi set nahi hai. Build workflow me GEMINI_PROXY_URL ya GEMINI_API_KEY configure hona chahiye.';
  if(e.offline)return'Internet nahi mil raha ya jawab aane me der lagi. Connection check karke dobara try karein.';
  if(e.status===429)return'Abhi bahut zyada sawal aa rahe hain (free limit). Thodi der baad dobara try karein.';
  if(e.status===400||e.status===401||e.status===403)return'AI key me masla hai. App banane wale se kahein ki Gemini API key check karein.';
  return'Jawab nahi mil saka. Thodi der baad dobara try karein.';
}

const GREET=/^\s*(असल|अस्सल|सलाम|वालेकुम|assalam|as-salam|salam|salaam|wa\s?alaikum|walaikum|السلام|سلام|hello|hi\b|hey|namaste|shukr|jazak|thank)/i;
const APPQ=/\b(app|apps|features?)\b|kah+an\s+(hai|hain|milt\w*|mil\w*)|kidhar\s+(hai|hain)/i;
function simpleQ(q){q=(q||'').trim();if(q.length<=25&&GREET.test(q))return true;return APPQ.test(q)&&q.length<=120}

function localReply(q){
  q=(q||'').trim();if(q.length>28||/\?|؟/.test(q))return'';
  const dev=/[\u0900-\u097F]/.test(q),urd=/[\u0600-\u06FF]/.test(q);
  if(/shukr|jazak|thank|शुक्र|जज़ाक|जजाक|شکر|جزاک/i.test(q))return dev?'जज़ाकल्लाहु ख़ैर! कोई और सवाल हो तो पूछिए।':urd?'جزاک اللہ خیر! کوئی اور سوال ہو تو پوچھیے۔':'Jazakallahu khair! Koi aur sawal ho to poochiye.';
  if(/assalam|as-salam|salam|salaam|wa\s?alaikum|walaikum|असल|अस्सल|सलाम|वालेकुम|السلام|سلام/i.test(q))return dev?'वा अलैकुम अस्सलाम वा रहमतुल्लाहि वा बरकातुहू 🌿\nमैं Ask Zikr Deen हूँ। इस्लाम, क़ुरआन, हदीस, नमाज़ या ऐप से जुड़ा कोई भी सवाल पूछिए।':urd?'وعلیکم السلام ورحمۃ اللہ وبرکاتہ 🌿\nمیں Ask Zikr Deen ہوں۔ اسلام، قرآن، حدیث، نماز یا ایپ سے متعلق کوئی بھی سوال پوچھیے۔':'Wa alaikum assalam wa rahmatullahi wa barakatuh 🌿\nMain Ask Zikr Deen hoon. Islam, Quran, Hadith, namaz ya app se jude kisi bhi sawal ke baare me poochiye.';
  if(/^\s*(hello|hi|hey|namaste|नमस्ते|हेलो)\b/i.test(q))return dev?'अस्सलामु अलैकुम 🌿 कहिए, क्या पूछना है?':'Assalamu alaikum 🌿 Kahiye, kya poochna hai?';
  return'';
}

ZD.askOnce=async function(prompt,sys){const a=await ask([{r:'u',t:prompt}],true,sys);return a.text};

const REC_MAX=60;
const MIC_OK=!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia)&&typeof MediaRecorder!=='undefined';
const TR_SYS='You are a speech-to-text engine inside an Islamic Q&A app. Write down exactly what the speaker says and nothing else. Keep the speaker\'s own language: Hindi in Devanagari script, Urdu in Urdu script, English in English. If the speaker mixes Hindi or Urdu with English words, keep them as spoken. Quran or dua words in Arabic: write them in Arabic script. Do NOT answer the question, do NOT translate, do NOT add quotes, labels or notes. If there is no clear human speech, output exactly: NO_SPEECH';

function readAB(b){return b.arrayBuffer?b.arrayBuffer():new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>ok(r.result);r.onerror=()=>no(r.error);r.readAsArrayBuffer(b)})}
function pcmToWav(mono,sr){
  const T=16000,ratio=sr/T,n=Math.max(1,Math.floor(mono.length/ratio)),out=new Int16Array(n);
  for(let i=0;i<n;i++){
    const a=Math.floor(i*ratio),b=Math.min(mono.length,Math.max(a+1,Math.floor((i+1)*ratio)));
    let v=0;for(let k=a;k<b;k++)v+=mono[k];v/=(b-a);
    v=Math.max(-1,Math.min(1,v));out[i]=v<0?v*0x8000:v*0x7FFF;
  }
  const bytes=new Uint8Array(44+n*2),dv=new DataView(bytes.buffer);
  const w=(o,t)=>{for(let i=0;i<t.length;i++)dv.setUint8(o+i,t.charCodeAt(i))};
  w(0,'RIFF');dv.setUint32(4,36+n*2,true);w(8,'WAVE');w(12,'fmt ');dv.setUint32(16,16,true);dv.setUint16(20,1,true);dv.setUint16(22,1,true);
  dv.setUint32(24,T,true);dv.setUint32(28,T*2,true);dv.setUint16(32,2,true);dv.setUint16(34,16,true);w(36,'data');dv.setUint32(40,n*2,true);
  for(let i=0;i<n;i++)dv.setInt16(44+i*2,out[i],true);
  return bytes;
}
function b64(bytes){let s='';for(let i=0;i<bytes.length;i+=0x8000)s+=String.fromCharCode.apply(null,bytes.subarray(i,i+0x8000));return btoa(s)}
async function audioPart(blob){
  const AC2=window.AudioContext||window.webkitAudioContext,ab=await readAB(blob);
  if(AC2){
    let ctx;
    try{
      ctx=new AC2();const buf=await ctx.decodeAudioData(ab.slice(0));
      const len=buf.length,mono=new Float32Array(len),ch=buf.numberOfChannels;
      for(let c=0;c<ch;c++){const d=buf.getChannelData(c);for(let i=0;i<len;i++)mono[i]+=d[i]/ch}
      return{inlineData:{mimeType:'audio/wav',data:b64(pcmToWav(mono,buf.sampleRate))}};
    }catch(e){}
    finally{try{ctx&&ctx.close&&ctx.close()}catch(_){}}
  }
  return{inlineData:{mimeType:(blob.type||'audio/webm').split(';')[0],data:b64(new Uint8Array(ab))}};
}
async function transcribe(blob){
  if(!hasBackend()){const e=new Error('nokey');e.nokey=true;throw e}
  const part=await audioPart(blob);
  const contents=[{role:'user',parts:[part,{text:'Write down exactly what was said in this audio.'}]}];
  const mOrd=orderedModels();
  const live=mOrd.filter(m=>(MCOOL[m]||0)<=Date.now()),list=live.length?live:mOrd;
  let last;
  for(const model of list){
    try{
      const t=parse(await callGemini(model,contents,false,TR_SYS,{timeoutMs:35000,maxTokens:1024})).text.replace(/^["'“”\s]+|["'“”\s]+$/g,'');
      return /^NO_SPEECH\b/i.test(t)?'':t;
    }catch(e){
      if(e.message==='empty')return '';
      e.model=model;last=e;
      if(e.status===404){MCOOL[model]=Date.now()+6*3600*1000;saveCool('zdAskMCool',MCOOL);continue}
      if(e.status===429){MCOOL[model]=Date.now()+5*60*1000;saveCool('zdAskMCool',MCOOL);continue}
      if(e.status===401)throw e;
      if(e.name==='AbortError'||/Failed to fetch|NetworkError|Load failed/i.test(e.message||'')){e.offline=true;continue}
    }
  }
  throw last;
}

function bubble(m,idx){
  if(m.r==='u')return'<div class="ask-m u"><div class="ask-b">'+esc(m.t).replace(/\n/g,'<br>')+'</div></div>';
  const src=(m.s&&m.s.length)?'<div class="ask-src"><span>Sources</span>'+m.s.map(x=>'<a href="'+esc(x.u)+'" target="_blank" rel="noopener noreferrer">'+esc(x.t)+'</a>').join('')+'</div>':'';
  const hasAr=!m.e&&/[\u0600-\u06FF]{3,}/.test(m.t||'');
  const trust=m.e?'':'<div class="ask-trust"><span class="tb '+((m.s&&m.s.length)?'ok':'warn')+'">'+((m.s&&m.s.length)?'🔗 Web sources diye gaye — khud bhi check karein':'⚠️ Koi source link nahi mila — verify karein')+'</span><span class="tb">🤖 AI jawab · fatwa nahi</span>'+(hasAr?'<span class="tb warn">📖 Arabic text AI ne likha ho sakta hai — mushaf/asli kitab se milayein</span>':'')+'</div>';
  return'<div class="ask-m a" data-idx="'+idx+'"><div class="ask-b'+(m.e?' err':'')+'"><div class="ask-txt">'+(m.e?esc(m.t):md(m.t))+'</div>'+src+trust+
    (m.e?'':'<div class="ask-acts">'+(VOICE_OK?'<button class="ask-ab" data-say aria-label="Listen answer" title="सुनें">'+vIcon('speaker')+'</button>':'')+'<button class="ask-ab" data-cp aria-label="Copy answer" title="कॉपी करें">'+icon('copy')+'</button></div>')+'</div></div>';
}

R.ask=async function(){
  let hist=load(),busy=false;
  const v=$('#view');
  v.innerHTML='<header class="topbar"><h1>Ask Zikr Deen<span class="sub">Islamic sawal-jawab · Quran, Hadith &amp; web se</span></h1>'+
   '<span style="display:flex;gap:4px;align-items:center">'+(VOICE_OK?'<button class="ibtn" id="askVoice" type="button" aria-label="Voice on/off"></button>':'')+'<button class="ibtn" id="askCfgBtn" type="button" aria-label="AI &amp; Voice settings">'+icon('gear')+'</button><button class="ibtn" id="askClr" aria-label="Clear chat">'+icon('trash')+'</button></span></header>'+
   '<main class="ask"><div id="askList"></div>'+
   '<p class="ask-note">AI se galti ho sakti hai. Zaroori masail me kisi aalim se zaroor poochein.'+(ZD.acct?esc(ZD.acct.note()):'')+'</p>'+
   '<form class="ask-bar" id="askForm"><canvas id="askWave" class="ask-wave" hidden></canvas><textarea id="askIn" rows="1" placeholder="Apna sawal likhein…" aria-label="Your question" maxlength="2000"></textarea>'+
   (MIC_OK?'<button class="ask-mic-x" id="askMicX" type="button" aria-label="Recording cancel" title="Cancel" hidden>✕</button><button class="ask-mic" id="askMic" type="button" aria-label="Bolkar sawal poochein" title="Bolkar sawal poochein">'+vIcon('mic')+'</button>':'')+'<button class="ask-send" id="askSend" aria-label="Send" type="submit">'+icon('send')+'</button></form></main>';
  const list=$('#askList'),inp=$('#askIn'),send=$('#askSend');
  const draw=()=>{
    if(!hist.length){list.innerHTML='<div class="ask-hello card"><div class="ask-logo">'+icon('ask')+'</div><h2 class="h2" style="margin:0 0 4px">Assalamu Alaikum 👋</h2><p class="muted small" style="margin:0 0 12px">Islam, Quran, Hadith, namaz, roza, zakat — koi bhi sawal poochein. Jawab Quran, sahih Hadith aur bharosemand websites se check karke diya jata hai.</p><div class="ask-chips">'+STARTERS.map(s=>'<button type="button" class="ask-chip" data-q="'+esc(s)+'">'+esc(s)+'</button>').join('')+'</div></div>'}
    else list.innerHTML=hist.map((m,i)=>bubble(m,i)).join('');
  };
  const down=(instant)=>{
    const goBottom=()=>{
      const listEl=$('#askList');
      const last=listEl&&listEl.lastElementChild;
      const sc=document.scrollingElement||document.documentElement;
      if(sc)sc.scrollTo({top:sc.scrollHeight,behavior:instant?'auto':'smooth'});
      if(last)last.scrollIntoView({block:'end',behavior:instant?'auto':'smooth'});
    };
    requestAnimationFrame(()=>{goBottom();setTimeout(goBottom,instant?80:120);if(instant)setTimeout(goBottom,260)});
  };
  const fit=()=>{inp.style.height='auto';inp.style.height=Math.min(120,inp.scrollHeight)+'px'};
  async function go(q){
    q=(q||'').trim();if(!q||busy)return;busy=true;send.disabled=true;voiceStop();voiceUnlock();
    hist.push({r:'u',t:q});inp.value='';fit();draw();
    const lr=localReply(q);if(lr){hist[hist.length-1].l=1;hist.push({r:'a',t:lr,l:1});save(hist.filter(m=>!m.e));busy=false;send.disabled=false;draw();down();voiceFeed(lr,true);return}
    const gate=ZD.acct?ZD.acct.canAsk():{ok:true};
    if(!gate.ok){const lt=ZD.acct.limitText();hist[hist.length-1].l=1;hist.push({r:'a',t:lt,l:1});save(hist.filter(m=>!m.e));busy=false;send.disabled=false;draw();down();return}
    list.insertAdjacentHTML('beforeend','<div class="ask-m a" id="askTyp"><div class="ask-b"><span class="ask-dots"><i></i><i></i><i></i></span> <span class="muted small">Check kar raha hoon…</span></div></div>');down();
    let live=null,lastDown=0;const simple=simpleQ(q);
    const onDelta=t=>{
      if(!live){const ty=$('#askTyp');if(ty)ty.remove();list.insertAdjacentHTML('beforeend','<div class="ask-m a" id="askLive"><div class="ask-b"></div></div>');live=list.querySelector('#askLive .ask-b')}
      if(!live)return;live.innerHTML=md(t);voiceFeed(t,false);
      const n=Date.now();if(n-lastDown>350){lastDown=n;down()}
    };
    try{const a=await ask(hist,simple,undefined,{fast:simple,onDelta});voiceFeed(a.text,true);hist.push({r:'a',t:a.text,s:a.src});if(ZD.acct)ZD.acct.countAsk()}
    catch(e){console.error(e);hist.push({r:'a',t:friendly(e),e:1})}
    save(hist.filter(m=>!m.e));busy=false;send.disabled=false;if(!$('#askList'))return;draw();down();
    const nt=document.querySelector('.ask-note');if(nt&&ZD.acct)nt.textContent='AI se galti ho sakti hai. Zaroori masail me kisi aalim se zaroor poochein.'+ZD.acct.note();
  }
  $('#askForm').addEventListener('submit',e=>{e.preventDefault();voiceUnlock();go(inp.value)});
  inp.addEventListener('input',fit);
  inp.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!/Android|iPhone/i.test(navigator.userAgent)){e.preventDefault();voiceUnlock();go(inp.value)}});
  list.addEventListener('click',e=>{
    const c=e.target.closest('[data-q]');if(c){voiceUnlock();go(c.dataset.q);return}
    const sy=e.target.closest('[data-say]');
    if(sy){
      const row=sy.closest('[data-idx]'),idx=row?parseInt(row.dataset.idx,10):-1;
      const tb=sy.closest('.ask-b').querySelector('.ask-txt');
      const txt=(idx>=0&&hist[idx]&&hist[idx].t)?hist[idx].t:(tb?tb.innerText.trim():'');
      if(txt){
        voiceStop();voiceUnlock();
        if(voiceMode()==='x')setVoiceMode(AC?'n':'p');
        if(voiceMode()==='n')GT.failUntil=0;
        const vb0=$('#askVoice');if(vb0)vb0.innerHTML=voiceMode()==='n'?vIcon('speaker'):SVG_PHONE;
        voiceFeed(txt,true);
        try{ZD.toast('जवाब पढ़कर सुनाया जा रहा है…')}catch(_){}
      }
      return;
    }
    const cp=e.target.closest('[data-cp]');
    if(cp){
      const row=cp.closest('[data-idx]'),idx=row?parseInt(row.dataset.idx,10):-1;
      const tb=cp.closest('.ask-b').querySelector('.ask-txt');
      const txt=(idx>=0&&hist[idx]&&hist[idx].t)?hist[idx].t:(tb?tb.innerText.trim():'');
      if(txt)ZD.copy(txt);
    }
  });
  $('#askClr').addEventListener('click',()=>{if(!hist.length)return;if(confirm('Poori chat saaf kar dein?')){voiceStop();hist=[];save(hist);draw()}});
  const vb=$('#askVoice');
  if(vb){
    const NAME={n:[vIcon('speaker'),'Natural awaaz (Gemini)'],p:[SVG_PHONE,'Phone ki awaaz'],x:[vIcon('speakerOff'),'Awaaz band']};
    const paint=()=>{const m=voiceMode();vb.innerHTML=NAME[m][0];vb.title=NAME[m][1];vb.setAttribute('aria-label','Voice: '+NAME[m][1])};paint();
    vb.addEventListener('click',()=>{
      const order=[AC?'n':null,TTS_OK?'p':null,'x'].filter(Boolean),nx=order[(order.indexOf(voiceMode())+1)%order.length];
      setVoiceMode(nx);if(nx==='n')GT.failUntil=0;voiceStop();voiceUnlock();paint();try{ZD.toast(NAME[nx][1])}catch(e){}
    });
  }
  const cfgBtn=$('#askCfgBtn');
  if(cfgBtn&&ZD.openSheet){
    cfgBtn.addEventListener('click',()=>{
      const sheetHtml='<h3>AI &amp; Voice सेटिंग्स</h3>'+
        '<div class="field"><label for="asMod">AI मॉडल मोड</label><select id="asMod"><option value="auto">Auto (Smart · Gemini Flash)</option><option value="lite">Fast Lite (तेज़ · ज़्यादा फ्री लिमिट)</option></select></div>'+
        (VOICE_OK?'<div class="field"><label for="asVM">वॉइस मोड</label><select id="asVM">'+(AC?'<option value="n">Natural AI आवाज़ (Gemini TTS)</option>':'')+(TTS_OK?'<option value="p">Phone ऑफलाइन आवाज़</option>':'')+'<option value="x">आवाज़ बंद</option></select></div>'+
        (AC?'<div class="field"><label for="asVN">Gemini आवाज़ चुनें (21 Voices)</label><select id="asVN">'+VOICE_STYLES.map(x=>'<option value="'+x[0]+'">'+x[1]+'</option>').join('')+'</select></div>':'')+
        '<div class="field"><label for="asVR">बोलने की स्पीड</label><select id="asVR"><option value="0.85">0.85× (धीरे)</option><option value="1">1.0× (सामान्य)</option><option value="1.15">1.15× (थोड़ा तेज़)</option><option value="1.3">1.3× (तेज़)</option></select></div>'+
        (window.ZDVoice?'<button type="button" class="btn sm ghost" id="asOpenStudio" style="width:100%;margin-top:8px">Open All 21 Voices Studio (Test &amp; Custom Tone)</button>':''):'')+
        '<p class="muted small" style="margin:8px 2px 0">पहले सभी फ्री Gemini वॉइस मॉडल क्रम से चलते हैं। जब सबकी लिमिट पूरी हो जाए, तभी फोन की ऑफलाइन आवाज़ चलती है।</p>';
      ZD.openSheet(sheetHtml,sh=>{
        $('#asMod',sh).value=aiModelMode();
        $('#asMod',sh).addEventListener('change',e=>{setAiModelMode(e.target.value);ZD.toast('AI मॉडल अपडेट हो गया')});
        const vm=$('#asVM',sh);if(vm){vm.value=voiceMode();vm.addEventListener('change',e=>{setVoiceMode(e.target.value);if(e.target.value==='n')GT.failUntil=0;voiceStop();voiceUnlock();if(vb){const NAME2={n:vIcon('speaker'),p:SVG_PHONE,x:vIcon('speakerOff')};vb.innerHTML=NAME2[voiceMode()]||vIcon('speaker')}ZD.toast('वॉइस मोड सेव हो गया')})}
        const vn=$('#asVN',sh);if(vn){vn.value=voiceName();vn.addEventListener('change',e=>{setVoiceName(e.target.value);voiceStop();ZD.toast('आवाज़: '+e.target.value)})}
        const vr=$('#asVR',sh);if(vr){vr.value=String(voiceRate());vr.addEventListener('change',e=>{setVoiceRate(parseFloat(e.target.value)||1);voiceStop();ZD.toast('स्पीड: '+e.target.value+'×')})}
        const os=$('#asOpenStudio',sh);if(os&&window.ZDVoice){os.addEventListener('click',()=>{ZD.closeSheet&&ZD.closeSheet();window.ZDVoice.openSettings()})}
      });
    });
  }
  const mic=$('#askMic'),micX=$('#askMicX');
  if(mic){
    if(!document.getElementById('askMicCss')){
      const st=document.createElement('style');st.id='askMicCss';
      st.textContent='.ask-mic,.ask-mic-x{flex:none;align-self:flex-end;width:44px;height:44px;border-radius:50%;border:0;padding:0;background:rgba(128,128,128,.16);color:inherit;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .15s ease,background .15s ease;-webkit-tap-highlight-color:transparent}.ask-mic:active,.ask-mic-x:active{transform:scale(.94)}.ask-mic-x{font-size:16px}.ask-mic-x[hidden],.ask-wave[hidden]{display:none}.ask-mic[disabled]{opacity:.5}.ask-mic.rec{background:#111;color:#fff}.ask-wave{flex:1;min-width:0;height:44px;align-self:flex-end;color:inherit}';
      document.head.appendChild(st);
    }
    const AUTOSEND=CFG.micAutoSend!==false;
    const ph0=inp.placeholder;
    let rec=null,stream=null,chunks=[],tmr=0,t0=0,cancelled=false;
    const mm=n=>Math.floor(n/60)+':'+('0'+(n%60)).slice(-2);
    const note=m=>{hist.push({r:'a',t:m,e:1});draw();down()};
    const toast=m=>{try{ZD.toast(m)}catch(_){note(m)}};
    const wave=$('#askWave'),MICSVG=mic.innerHTML,STOPSVG='<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="2"/></svg>';
    let actx=null,an=null,wbuf=null,raf=0,lv=[],lastPush=0,smooth=0,peak=0.18,starting=false;
    const idle=()=>{clearInterval(tmr);tmr=0;stopWave();mic.classList.remove('rec');mic.disabled=false;mic.innerHTML=MICSVG;micX.hidden=true;inp.hidden=false;inp.disabled=false;inp.placeholder=ph0;send.disabled=busy};
    function drawPill(c,x,y,w,h){
      const r=Math.min(w/2,h/2);
      c.beginPath();
      c.moveTo(x+r,y);
      c.lineTo(x+w-r,y);
      c.quadraticCurveTo(x+w,y,x+w,y+r);
      c.lineTo(x+w,y+h-r);
      c.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
      c.lineTo(x+r,y+h);
      c.quadraticCurveTo(x,y+h,x,y+h-r);
      c.lineTo(x,y+r);
      c.quadraticCurveTo(x,y,x+r,y);
      c.closePath();
      c.fill();
    }
    function startDraw(){
      if(!wave)return;
      stopWave(true);wave.hidden=false;
      const col=getComputedStyle(wave).color||'#111';
      lv=[];smooth=0;peak=0.18;lastPush=0;
      const frame=ts=>{
        raf=requestAnimationFrame(frame);
        const dpr=window.devicePixelRatio||1,cw=wave.clientWidth||220,ch=44;
        const tw=Math.round(cw*dpr),th=Math.round(ch*dpr);
        if(wave.width!==tw||wave.height!==th){wave.width=tw;wave.height=th}
        let lvl=0;
        if(an){
          an.getByteTimeDomainData(wbuf);
          let sum=0;
          for(let i=0;i<wbuf.length;i++){const x=(wbuf[i]-128)/128;sum+=x*x}
          const rms=Math.sqrt(sum/wbuf.length);
          peak=Math.max(0.14,peak*0.992,rms*1.15);
          lvl=Math.min(1,Math.pow(rms/peak,0.75));
        }else{
          lvl=0.12+0.08*Math.sin(ts/140);
        }
        smooth+=(lvl-smooth)*(lvl>smooth?0.65:0.22);
        if(ts-lastPush>48){lastPush=ts;lv.push(smooth);if(lv.length>600)lv.splice(0,300)}
        const c=wave.getContext('2d'),W=wave.width,H=wave.height;
        c.clearRect(0,0,W,H);
        c.fillStyle=col;
        c.font=(13*dpr)+'px sans-serif';
        c.textBaseline='middle';
        c.fillText(mm(Math.floor((Date.now()-t0)/1000)),2*dpr,H/2);
        const bw=3*dpr,gap=3*dpr,x0=46*dpr,n=Math.max(1,Math.floor((W-x0)/(bw+gap)));
        for(let i=0;i<n;i++){
          const k=lv.length-n+i,v=k>=0?lv[k]:0,bh=Math.max(4*dpr,v*H*0.88);
          c.globalAlpha=k>=0?(0.35+0.65*Math.min(1,v+0.25)):0.18;
          drawPill(c,x0+i*(bw+gap),(H-bh)/2,bw,bh);
        }
        c.globalAlpha=1;
      };
      raf=requestAnimationFrame(frame);
    }
    function attachWave(st){
      try{
        const A=window.AudioContext||window.webkitAudioContext;
        actx=new A();an=actx.createAnalyser();an.fftSize=512;an.smoothingTimeConstant=0.45;
        wbuf=new Uint8Array(an.fftSize);
        actx.createMediaStreamSource(st).connect(an);
        if(actx.state==='suspended')actx.resume().catch(()=>{});
      }catch(_){an=null}
    }
    function stopWave(keepShown){
      if(raf){cancelAnimationFrame(raf);raf=0}
      try{actx&&actx.close()}catch(_){}
      actx=null;an=null;
      if(wave&&!keepShown)wave.hidden=true;
    }
    const release=()=>{try{stream&&stream.getTracks().forEach(t=>t.stop())}catch(_){}stream=null};
    async function start(){
      if(busy||rec||starting)return;
      starting=true;
      voiceStop();voiceUnlock();
      t0=Date.now();cancelled=false;
      mic.classList.add('rec');mic.innerHTML=STOPSVG;micX.hidden=false;inp.hidden=true;send.disabled=true;
      startDraw();
      try{stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}})}
      catch(e){
        starting=false;idle();
        const n=(e&&e.name||'')+' '+(e&&e.message||'');
        note(/NotAllowed|Permission|Security/i.test(n)?'Mic ki ijazat nahi mili. Phone Settings > Apps > Zikr Deen > Permissions > Microphone me "Allow" karein, phir dobara try karein.'
          :/NotFound|Devices/i.test(n)?'Is phone me mic nahi mila.':'Mic shuru nahi ho saka ['+(e&&e.name||'error')+'].');
        return;
      }
      if(!$('#askList')||cancelled){starting=false;release();idle();return}
      let mime='';try{mime=['audio/webm;codecs=opus','audio/webm','audio/mp4','audio/ogg;codecs=opus'].find(t=>MediaRecorder.isTypeSupported(t))||''}catch(_){}
      try{rec=mime?new MediaRecorder(stream,{mimeType:mime}):new MediaRecorder(stream)}
      catch(e){starting=false;release();rec=null;idle();note('Recording shuru nahi ho saki ['+(e&&e.name||'error')+'].');return}
      chunks=[];
      rec.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data)};
      rec.onstop=onStop;
      try{rec.start(250)}catch(_){rec.start()}
      t0=Date.now();starting=false;
      attachWave(stream);
      const tick=()=>{
        if(!$('#askList')){cancelled=true;stop();return}
        if(Math.floor((Date.now()-t0)/1000)>=REC_MAX)stop();
      };
      tick();tmr=setInterval(tick,250);
    }
    function stop(){
      if(rec&&rec.state!=='inactive'){try{rec.stop()}catch(_){onStop()}}
      else if(starting){cancelled=true;idle()}
    }
    async function onStop(){
      const r=rec;if(!r)return;rec=null;clearInterval(tmr);tmr=0;release();
      const secs=(Date.now()-t0)/1000,blob=new Blob(chunks,{type:r.mimeType||'audio/webm'});chunks=[];
      if(cancelled||!$('#askList')){idle();return}
      if(secs<0.45||blob.size<600){idle();toast('Awaaz bahut chhoti thi. Mic dabakar poora sawal boliye.');return}
      stopWave();mic.classList.remove('rec');mic.disabled=true;mic.textContent='⏳';micX.hidden=true;inp.hidden=false;inp.disabled=true;inp.placeholder='Aapki awaaz samajh raha hoon…';
      let txt='';
      try{txt=await transcribe(blob)}
      catch(e){console.error(e);if(!$('#askList'))return;idle();note(friendly(e));return}
      if(!$('#askList'))return;
      idle();
      if(!txt){toast('Awaaz samajh nahi aayi. Thoda qareeb se, saaf boliye.');return}
      inp.value=txt.slice(0,2000);fit();
      if(AUTOSEND)go(inp.value);else inp.focus();
    }
    mic.addEventListener('click',()=>{voiceUnlock();if(rec)stop();else if(starting){cancelled=true;idle()}else start()});
    micX.addEventListener('click',()=>{cancelled=true;stop()});
  }
  draw();if(hist.length)down(true);
  try{const pre=sessionStorage.getItem('zdAskPre');if(pre){sessionStorage.removeItem('zdAskPre');inp.value=pre;fit();inp.focus()}}catch(_){}
};

ZD.askHTML=()=>'<section class="block"><a class="card ask-card" href="#/ask">'+
  '<div class="ask-logo">'+icon('ask')+'</div><div style="flex:1;min-width:0"><div style="font-size:19px;font-weight:600">Ask Zikr Deen</div>'+
  '<div class="muted small">Islam, Quran ya Hadith ka koi bhi sawal — AI se poochein</div></div>'+icon('back','ask-arr')+'</a></section>';
})();

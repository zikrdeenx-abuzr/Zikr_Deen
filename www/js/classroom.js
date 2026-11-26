/* Zikr Deen App — Step 4: Teacher & Student Classroom
   - Teacher Lesson Builder (Certified Lessons with live Quran Ayah loader)
   - Homework Assignment & Submission
   - Student Tilawat Audio Recorder + Teacher Audio Playback (IndexedDB + Cloud Sync)
   - Teacher-Certified Feedback vs General AI Suggestions (Clearly Separated)
   - Student Progress Tracker & Live Session Link
*/
(function(){'use strict';
const ZD=window.ZD,$=ZD.$,esc=ZD.esc,icon=ZD.icon,R=ZD.R;
const CKEY='zdClassroomV1';
const recDB=ZD.idb('zdClassroomAudioV1','clips','id');
const top=(title,sub,right)=>'<header class="topbar"><button class="ibtn" data-act="back" aria-label="Back">'+icon('back')+'</button><h1>'+esc(title)+(sub?'<span class="sub">'+esc(sub)+'</span>':'')+'</h1>'+(right||'')+'</header>';

const C_CFG=window.ZD_ACCOUNT||{};
const PID=(C_CFG.projectId&&String(C_CFG.projectId).indexOf('__')!==0)?String(C_CFG.projectId):'';
const FS_BASE=PID?('https://firestore.googleapis.com/v1/projects/'+PID+'/databases/(default)/documents/classrooms'):'';
const FA=()=>window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.FirebaseAuthentication;

function genCode(){
  const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out='ZD-';
  for(let i=0;i<4;i++)out+=chars[Math.floor(Math.random()*chars.length)];
  return out;
}

function defaultClassroom(){
  const today=ZD.today();
  return {
    role:'student',
    classCode:'ZD-786A',
    className:'Zikr Deen Hifz & Tajweed Circle',
    teacherName:'Ustad Ahmad',
    studentName:'Student',
    liveUrl:'',
    lessons:[
      {
        id:'lsn-1',
        title:'Surah Al-Fatihah — Makharij & Madd',
        surah:1,a1:1,a2:7,
        ar:'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ۝ ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ',
        notes:'हर आयत के आख़िर में रुकें (वक़्फ़ करें) और "الضَّآلِّينَ" में 6 हरकत का मद्द-ए-लाज़िम अदा करें।',
        certified:true,
        createdAt:today
      },
      {
        id:'lsn-2',
        title:'Surah Al-Mulk — Ayat 1 to 5 (Hifz)',
        surah:67,a1:1,a2:5,
        ar:'تَبَٰرَكَ ٱلَّذِى بِيَدِهِ ٱلْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَىْءٍ قَدِيرٌ',
        notes:'क़लक़ला के हुरूफ़ (ق، ط، ب، ج، د) को साफ़ अदा करें और रोज़ाना 5 बार दोहराएँ।',
        certified:true,
        createdAt:today
      }
    ],
    homeworks:[
      {
        id:'hw-1',
        title:'Surah Al-Fatihah की तिलावत रिकॉर्ड करें',
        surah:1,a1:1,a2:7,
        due:ZD.addDays(today,2),
        desc:'पूरी सूरह अल-फ़ातिहा ठहर-ठहर कर तजवीद के साथ पढ़ें और अपनी आवाज़ रिकॉर्ड करके भेजें।',
        status:'reviewed',
        hasAudio:false,
        submittedAt:today,
        teacherFeedback:'माशाअल्लाह! अदायगी बहुत साफ़ है। "مَٰلِكِ يَوْمِ ٱلدِّينِ" में खड़ा ज़बर थोड़ा और स्पष्ट करें।',
        teacherGrade:'Mumtaz (92%)',
        aiTip:'AI अभ्यास सुझाव: आयत 7 में "غَيْرِ ٱلْمَغْضُوبِ" के दौरान ग़ैन (غ) और ज़ाद (ض) के मख़रज का 3 बार अलग से अभ्यास करें।'
      },
      {
        id:'hw-2',
        title:'Surah Al-Ikhlas & Al-Falaq तजवीद अभ्यास',
        surah:112,a1:1,a2:4,
        due:ZD.addDays(today,4),
        desc:'दोनों सूरह की तिलावत रिकॉर्ड करें और क़लक़ला की अदायगी पर ध्यान दें।',
        status:'pending',
        hasAudio:false,
        submittedAt:'',
        teacherFeedback:'',
        teacherGrade:'',
        aiTip:'AI अभ्यास सुझाव: "أَحَدٌ" और "ٱلصَّمَدُ" पर रुकते समय दाल (د) पर हल्का क़लक़ला करें।'
      }
    ],
    students:[
      {id:'stu-self',name:'You (Current Student)',ayatRead:0,hwDone:1,hwTotal:2,score:92,lastActive:today}
    ]
  };
}

function loadCL(){
  try{
    const raw=JSON.parse(localStorage.getItem(CKEY)||'null');
    if(!raw||typeof raw!=='object')return defaultClassroom();
    return Object.assign(defaultClassroom(),raw);
  }catch(_){return defaultClassroom()}
}
let writeQueue=Promise.resolve();
const revisions=new Map();
function saveCL(st, push=true){
  try{localStorage.setItem(CKEY,JSON.stringify(st))}catch(_){}
  if(push && st.role==='teacher' && FS_BASE){
    const snapshot=JSON.parse(JSON.stringify(st));
    writeQueue=writeQueue.then(()=>syncCloudPush(snapshot)).catch(()=>{
      ZD.toast('फ़ोन पर सेव है। क्लाउड अपडेट के लिए अनुमति और नवीनतम क्लास डेटा जाँचें।');
    });
  }
}

async function getIdTok(){
  const p=FA();if(!p)return null;
  try{const r=await p.getIdToken({forceRefresh:false});return (r&&r.token)||null}catch(_){return null}
}

async function syncCloudPush(st){
  if(!FS_BASE||!st.classCode)return;
  const tok=await getIdTok();if(!tok)throw new Error('Sign in required');
  const payload={fields:{
    code:{stringValue:st.classCode},
    className:{stringValue:st.className||''},
    teacherName:{stringValue:st.teacherName||''},
    liveUrl:{stringValue:st.liveUrl||''},
    json:{stringValue:JSON.stringify({lessons:st.lessons,homeworks:st.homeworks,students:st.students})},
    updatedAt:{integerValue:String(Date.now())}
  }};
  const revision=revisions.get(st.classCode);
  const condition=revision?'currentDocument.updateTime='+encodeURIComponent(revision):'currentDocument.exists=false';
  const response=await fetch(FS_BASE+'/'+encodeURIComponent(st.classCode)+'?'+condition,{
    method:'PATCH',
    headers:{'Content-Type':'application/json','Authorization':'Bearer '+tok},
    body:JSON.stringify(payload)
  });
  if(!response.ok)throw new Error("Cloud write failed");
  revisions.set(st.classCode,(await response.json()).updateTime);
}

async function syncCloudPull(st){
  if(!FS_BASE||!st.classCode)return false;
  const tok=await getIdTok();if(!tok)return false;
  const code=st.classCode;
  await writeQueue;
  const r=await fetch(FS_BASE+'/'+encodeURIComponent(code),{
    headers:{'Authorization':'Bearer '+tok}
  });
  if(!r.ok)return false;
  const j=await r.json();
  const f=j&&j.fields;if(!f||!f.json||!f.json.stringValue)return false;
  if(code!==st.classCode)return false;
  const parsed=JSON.parse(f.json.stringValue);
  revisions.set(code,j.updateTime);
  if(f.className&&f.className.stringValue)st.className=f.className.stringValue;
  if(f.teacherName&&f.teacherName.stringValue)st.teacherName=f.teacherName.stringValue;
  if(f.liveUrl)st.liveUrl=f.liveUrl.stringValue||'';
  if(Array.isArray(parsed.lessons))st.lessons=parsed.lessons;
  if(Array.isArray(parsed.homeworks))st.homeworks=parsed.homeworks;
  if(Array.isArray(parsed.students))st.students=parsed.students;
  try{localStorage.setItem(CKEY,JSON.stringify(st))}catch(_){}
  return true;
}

/* ---------- Helper: blob <-> base64 for portable clip playback ---------- */
function blobToDataUrl(blob){
  return new Promise((res,rej)=>{
    const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(blob);
  });
}

let activeAudio=null;
async function playClip(hwId,btn){
  if(activeAudio){try{activeAudio.pause()}catch(_){}activeAudio=null}
  try{
    const rec=await recDB.get(hwId);
    if(!rec||!rec.dataUrl){ZD.toast('इस होमवर्क की रिकॉर्डिंग अभी उपलब्ध नहीं है');return}
    const au=new Audio(rec.dataUrl);
    activeAudio=au;
    if(btn)btn.textContent='⏸ चल रहा है…';
    au.onended=()=>{activeAudio=null;if(btn)btn.textContent='▶ तिलावत सुनें'};
    au.onerror=()=>{activeAudio=null;if(btn)btn.textContent='▶ तिलावत सुनें';ZD.toast('ऑडियो प्ले नहीं हो सका')};
    await au.play();
  }catch(_){
    if(btn)btn.textContent='▶ तिलावत सुनें';
    ZD.toast('तिलावत प्ले करने में समस्या आई');
  }
}

/* ================= MAIN CLASSROOM VIEW (#/classroom) ================= */
R.classroom=function(){
  const st=loadCL();
  let tab=st.role==='teacher'?'lessons':'homework';
  let recHwId='',mediaRec=null,recStream=null,recChunks=[],recTmr=0,recSec=0;

  // Keep student's live progress synced with app reading stats
  const uInfo=(ZD.acct&&ZD.acct.state().user)||null;
  if(uInfo&&uInfo.name)st.studentName=uInfo.name;
  const selfStu=st.students.find(x=>x.id==='stu-self');
  if(selfStu){
    selfStu.name=(st.studentName||'Student')+' (आप)';
    selfStu.ayatRead=ZD.totalRead?ZD.totalRead():0;
    selfStu.hwDone=st.homeworks.filter(h=>h.status!=='pending').length;
    selfStu.hwTotal=st.homeworks.length;
    selfStu.lastActive=ZD.today();
  }

  function stopRecHardware(){
    clearInterval(recTmr);recTmr=0;
    try{if(recStream)recStream.getTracks().forEach(t=>t.stop())}catch(_){}
    recStream=null;mediaRec=null;recHwId='';
  }
  ZD.onLeave(()=>{
    stopRecHardware();
    if(activeAudio){try{activeAudio.pause()}catch(_){}activeAudio=null}
  });

  function render(){
    const isT=st.role==='teacher';
    const doneHw=st.homeworks.filter(h=>h.status!=='pending').length;
    const revHw=st.homeworks.filter(h=>h.status==='reviewed').length;
    const surahOpts=ZD.surahs().map(s=>'<option value="'+s.n+'">'+s.n+'. '+esc(s.en)+'</option>').join('');

    let body='';

    /* --- ROLE & CLASS CODE HEADER CARD --- */
    body+='<section class="block card cl-hero">'+
      '<img class="zd-hero-banner" src="./img/visuals/banner-classroom.webp" alt="Zikr Deen Classroom" loading="lazy">'+
      '<div class="cl-top-row">'+
        '<div><div class="cl-kicker">CLASS CODE: <b id="clCodeTxt">'+esc(st.classCode)+'</b></div>'+
        '<div class="cl-cname">'+esc(st.className)+'</div>'+
        '<div class="muted small">उस्ताद: '+esc(st.teacherName)+' · होमवर्क: '+doneHw+'/'+st.homeworks.length+' पूरे</div></div>'+
        '<button type="button" class="btn sm ghost" id="clCopyCode">📋 कोड</button>'+
      '</div>'+
      '<div class="seg" id="clRoleSeg" role="tablist" style="margin-top:12px">'+
        '<button type="button" role="tab" data-role="student" aria-selected="'+(!isT)+'">🎓 विद्यार्थी (Student)</button>'+
        '<button type="button" role="tab" data-role="teacher" aria-selected="'+isT+'">👨‍🏫 शिक्षक (Teacher)</button>'+
      '</div>'+
      '<div class="cl-sync-row">'+
        '<button type="button" class="btn sm ghost" id="clJoinBtn">🔑 क्लास कोड बदलें / नया बनाएँ</button>'+
        (FS_BASE?'<button type="button" class="btn sm ghost" id="clSyncBtn">☁️ Cloud Sync</button>':'')+
        (st.liveUrl?'<a class="btn sm" href="'+esc(st.liveUrl)+'" target="_blank" rel="noopener noreferrer">🎥 Live Class</a>':'')+
      '</div>'+
    '</section>';

    /* --- SUB-TABS --- */
    if(isT){
      body+='<div class="seg" id="clSubTabs" role="tablist">'+
        '<button type="button" role="tab" data-tab="lessons" aria-selected="'+(tab==='lessons')+'">📚 पाठ बनाएँ ('+st.lessons.length+')</button>'+
        '<button type="button" role="tab" data-tab="homework" aria-selected="'+(tab==='homework')+'">🎙️ होमवर्क व जांच ('+st.homeworks.length+')</button>'+
        '<button type="button" role="tab" data-tab="students" aria-selected="'+(tab==='students')+'">📊 प्रगति</button>'+
      '</div>';
    }else{
      body+='<div class="seg" id="clSubTabs" role="tablist">'+
        '<button type="button" role="tab" data-tab="homework" aria-selected="'+(tab==='homework')+'">📝 मेरा होमवर्क ('+st.homeworks.length+')</button>'+
        '<button type="button" role="tab" data-tab="lessons" aria-selected="'+(tab==='lessons')+'">✅ प्रमाणित पाठ ('+st.lessons.length+')</button>'+
      '</div>';
    }

    /* ==================== TAB 1: HOMEWORK & TILAWAT RECORDING ==================== */
    if(tab==='homework'){
      if(isT){
        body+='<section class="block card"><h2 class="h2">➕ विद्यार्थी को नया होमवर्क भेजें</h2>'+
          '<label class="zk-f"><span>होमवर्क का शीर्षक</span><input type="text" id="hwTtl" placeholder="जैसे: Surah Al-Mulk Ayat 1–5 की तिलावत"></label>'+
          '<div class="zk-grid2">'+
            '<label class="zk-f"><span>सूरह चुनें</span><select id="hwSurah">'+surahOpts+'</select></label>'+
            '<label class="zk-f"><span>आयत रेंज (से - तक)</span><div style="display:flex;gap:6px"><input type="number" id="hwA1" min="1" value="1"><input type="number" id="hwA2" min="1" value="5"></div></label>'+
          '</div>'+
          '<label class="zk-f"><span>तजवीद / अभ्यास निर्देश</span><textarea id="hwDesc" rows="2" class="cl-ta" placeholder="विद्यार्थी को किस बात पर ध्यान देना है..."></textarea></label>'+
          '<button type="button" class="btn" id="hwCreateBtn" style="width:100%;margin-top:12px">📤 होमवर्क भेजें</button>'+
        '</section>';
      }

      body+=st.homeworks.map(hw=>{
        const sr=ZD.surah(hw.surah)||ZD.surah(1);
        const isRec=recHwId===hw.id;
        const stBadge=hw.status==='reviewed'
          ?'<span class="cl-badge ok">✅ शिक्षक द्वारा जाँचा गया</span>'
          :(hw.status==='submitted'?'<span class="cl-badge sub">🎙️ तिलावत भेजी गई</span>':'<span class="cl-badge pend">⏳ बाकी है</span>');

        return '<section class="block card cl-hw-card">'+
          '<div class="cl-hw-top"><div><b>'+esc(hw.title)+'</b><span class="muted small">Surah '+esc(sr.en)+' ('+hw.surah+':'+hw.a1+'–'+hw.a2+') · Due: '+esc(hw.due)+'</span></div>'+stBadge+'</div>'+
          '<p class="cl-desc">'+esc(hw.desc)+'</p>'+
          '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">'+
            '<a class="btn sm ghost" href="#/read/'+hw.surah+'/'+hw.a1+'">📖 आयत पढ़ें</a>'+
            (hw.hasAudio?'<button type="button" class="btn sm" data-play-hw="'+hw.id+'">▶ तिलावत सुनें</button>':'')+
          '</div>'+

          /* Student Recording Controls */
          (!isT?'<div class="cl-rec-box">'+
            (isRec
              ?'<div class="cl-rec-live"><span class="cl-dot"></span><b>रिकॉर्डिंग जारी… '+Math.floor(recSec/60)+':'+String(recSec%60).padStart(2,'0')+'</b><button type="button" class="btn sm" id="hwStopRec">⏹ रोकें और भेजें</button></div>'
              :'<button type="button" class="btn sm" data-start-rec="'+hw.id+'" style="width:100%">🎙️ '+(hw.hasAudio?'दोबारा तिलावत रिकॉर्ड करें':'अपनी तिलावत रिकॉर्ड करके भेजें')+'</button>')+
          '</div>':'')+

          /* CLEARLY SEPARATED: 1) Teacher-Certified Feedback vs 2) General AI Suggestion */
          '<div class="cl-fb-grid">'+
            '<div class="cl-fb teacher">'+
              '<div class="cl-fb-hdr"><span>✅ शिक्षक द्वारा प्रमाणित सुझाव (Teacher-Certified)</span>'+(hw.teacherGrade?'<b>'+esc(hw.teacherGrade)+'</b>':'')+'</div>'+
              (hw.teacherFeedback
                ?'<p>'+esc(hw.teacherFeedback)+'</p>'
                :'<p class="muted small">अभी शिक्षक की समीक्षा बाकी है।</p>')+
              (isT?'<div class="cl-tform">'+
                '<input type="text" data-tgrade="'+hw.id+'" placeholder="ग्रेड (जैसे: Mumtaz 95%)" value="'+esc(hw.teacherGrade||'')+'">'+
                '<textarea rows="2" data-tmsg="'+hw.id+'" placeholder="सुधार के लिए प्रमाणित सुझाव लिखें...">'+esc(hw.teacherFeedback||'')+'</textarea>'+
                '<button type="button" class="btn sm" data-tsave="'+hw.id+'">✓ सुझाव प्रमाणित करें</button>'+
              '</div>':'')+
            '</div>'+
            '<div class="cl-fb ai">'+
              '<div class="cl-fb-hdr"><span>🤖 सामान्य AI अभ्यास सुझाव (General AI Hint)</span><button type="button" class="cl-ai-ref" data-airef="'+hw.id+'">↻ नया AI सुझाव</button></div>'+
              '<p>'+esc(hw.aiTip||'तजवीद के साथ धीरे-धीरे पढ़ें और हर हर्फ़ का मख़रज साफ़ रखें।')+'</p>'+
            '</div>'+
          '</div>'+
        '</section>';
      }).join('');
    }

    /* ==================== TAB 2: TEACHER-CERTIFIED LESSONS ==================== */
    if(tab==='lessons'){
      if(isT){
        body+='<section class="block card"><h2 class="h2">✍️ नया प्रमाणित पाठ बनाएँ</h2>'+
          '<label class="zk-f"><span>पाठ का नाम (Lesson Title)</span><input type="text" id="lsnTtl" placeholder="जैसे: Noon Sakinah & Tanween के नियम"></label>'+
          '<div class="zk-grid2">'+
            '<label class="zk-f"><span>सूरह</span><select id="lsnSurah">'+surahOpts+'</select></label>'+
            '<label class="zk-f"><span>आयत से - तक</span><div style="display:flex;gap:6px"><input type="number" id="lsnA1" min="1" value="1"><input type="number" id="lsnA2" min="1" value="4"></div></label>'+
          '</div>'+
          '<label class="zk-f"><span>उस्ताद के तजवीद और तफ़सीर नोट्स</span><textarea id="lsnNotes" rows="3" class="cl-ta" placeholder="यहाँ पाठ की मुख्य बातें और नियम लिखें..."></textarea></label>'+
          '<button type="button" class="btn" id="lsnAddBtn" style="width:100%;margin-top:12px">✅ प्रमाणित पाठ प्रकाशित करें</button>'+
        '</section>';
      }

      body+=st.lessons.map(ls=>{
        const sr=ZD.surah(ls.surah)||ZD.surah(1);
        return '<section class="block card cl-lsn-card">'+
          '<div class="cl-lsn-top"><span class="cl-cert-pill">✅ शिक्षक द्वारा प्रमाणित पाठ</span><span class="muted small">'+esc(ls.createdAt||'')+'</span></div>'+
          '<h3 style="margin:6px 0 2px;font-size:18px;color:var(--gold-soft)">'+esc(ls.title)+'</h3>'+
          '<div class="muted small">Surah '+esc(sr.en)+' · Ayah '+ls.a1+'–'+ls.a2+'</div>'+
          (ls.ar?'<div class="ar-text cl-ar" lang="ar">'+esc(ls.ar)+'</div>':'')+
          '<p class="cl-desc" style="margin:8px 0 10px">'+esc(ls.notes)+'</p>'+
          '<div style="display:flex;gap:8px;flex-wrap:wrap">'+
            '<a class="btn sm" href="#/read/'+ls.surah+'/'+ls.a1+'">📖 मुसहफ़ में खोलें</a>'+
            (isT?'<button type="button" class="btn sm ghost" data-lsndel="'+ls.id+'">🗑 हटाएँ</button>':'')+
          '</div>'+
        '</section>';
      }).join('');
    }

    /* ==================== TAB 3: STUDENT PROGRESS (TEACHER VIEW) ==================== */
    if(tab==='students'&&isT){
      body+='<section class="block card"><h2 class="h2">📊 विद्यार्थियों की प्रगति (Student Progress)</h2>'+
        '<div class="stat3" style="margin-bottom:14px">'+
          '<div><b>'+st.students.length+'</b><span>विद्यार्थी</span></div>'+
          '<div><b>'+doneHw+'/'+st.homeworks.length+'</b><span>होमवर्क पूरे</span></div>'+
          '<div><b>'+revHw+'</b><span>प्रमाणित समीक्षा</span></div>'+
        '</div>'+
        st.students.map(stu=>{
          const pct=stu.hwTotal?Math.round((stu.hwDone/stu.hwTotal)*100):0;
          return '<div class="pg-item"><div class="pg-it-top"><span class="pg-it-ico">🎓</span><div style="flex:1;min-width:0"><b>'+esc(stu.name)+'</b><div class="muted small">पढ़ी गई आयात: '+stu.ayatRead+' · स्कोर: '+stu.score+'% · सक्रिय: '+esc(stu.lastActive)+'</div></div><b>'+pct+'%</b></div><div class="pg-pbar"><i style="width:'+pct+'%;background:var(--gold)"></i></div></div>';
        }).join('')+
        '<div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--line)">'+
          '<label class="zk-f"><span>🎥 Live Video Class लिंक (Jitsi / Google Meet)</span><div style="display:flex;gap:8px"><input type="url" id="clLiveIn" placeholder="https://meet.jit.si/ZikrDeenClass" value="'+esc(st.liveUrl||'')+'"><button type="button" class="btn sm" id="clLiveSave">Save</button></div></label>'+
        '</div>'+
      '</section>';
    }

    $('#view').innerHTML=top('Teacher & Student Classroom','शिक्षक-विद्यार्थी लाइव पाठ और तिलावत')+'<main class="lh-wrap">'+body+'</main>';

    /* ---------- Event Bindings ---------- */
    $('#clCopyCode').addEventListener('click',()=>ZD.copy(st.classCode));
    $('#clRoleSeg').addEventListener('click',e=>{
      const b=e.target.closest('[data-role]');if(!b||b.dataset.role===st.role)return;
      st.role=b.dataset.role;
      tab=st.role==='teacher'?'lessons':'homework';
      saveCL(st,false);render();
    });
    $('#clSubTabs').addEventListener('click',e=>{
      const b=e.target.closest('[data-tab]');if(!b)return;
      tab=b.dataset.tab;render();
    });

    if($('#clSyncBtn'))$('#clSyncBtn').addEventListener('click',async()=>{
      ZD.toast('Cloud से सिंक हो रहा है…');
      try {
      const ok=await syncCloudPull(st);
      if(ok){render();ZD.toast('Classroom डेटा अपडेट हो गया ✓')}
      else ZD.toast('क्लास नहीं मिली या पढ़ने की अनुमति नहीं है।');
      } catch (_) { ZD.toast('क्लाउड कनेक्शन विफल।'); }
    });

    $('#clJoinBtn').addEventListener('click',()=>{
      const html='<h3>क्लास कोड बदलें या नई क्लास बनाएँ</h3>'+
        '<div class="field"><label for="jcCode">Class Code</label><input id="jcCode" type="text" value="'+esc(st.classCode)+'" style="width:140px;text-transform:uppercase"></div>'+
        '<div class="field"><label for="jcName">Class Name</label><input id="jcName" type="text" value="'+esc(st.className)+'" style="width:62%"></div>'+
        '<div class="field"><label for="jcTch">Ustad Name</label><input id="jcTch" type="text" value="'+esc(st.teacherName)+'" style="width:62%"></div>'+
        '<div style="display:flex;gap:8px;margin-top:14px"><button type="button" class="btn" id="jcSave">Save &amp; Join</button><button type="button" class="btn ghost" id="jcNew">नया कोड बनाएँ</button></div>';
      ZD.openSheet(html,sh=>{
        $('#jcNew',sh).addEventListener('click',()=>{$('#jcCode',sh).value=genCode()});
        $('#jcSave',sh).addEventListener('click',()=>{
          const nextCode=$('#jcCode',sh).value.trim().toUpperCase()||genCode();
          if(nextCode!==st.classCode){
            try {
              localStorage.setItem(CKEY+':'+st.classCode,JSON.stringify(st));
              const saved=JSON.parse(localStorage.getItem(CKEY+':'+nextCode)||'null');
              Object.assign(st,saved||{lessons:[],homeworks:[],students:[],liveUrl:''});
            } catch (_) { ZD.toast('क्लास डेटा सेव नहीं हो पाया।');return; }
          }
          st.classCode=nextCode;
          st.className=$('#jcName',sh).value.trim()||st.className;
          st.teacherName=$('#jcTch',sh).value.trim()||st.teacherName;
          saveCL(st,false);ZD.closeSheet();render();ZD.toast('Class Code: '+st.classCode);
        });
      });
    });

    /* Teacher Create Lesson */
    if($('#lsnAddBtn'))$('#lsnAddBtn').addEventListener('click',async()=>{
      const ttl=$('#lsnTtl').value.trim();
      const s=Number($('#lsnSurah').value)||1;
      const a1=Math.max(1,Number($('#lsnA1').value)||1);
      const a2=Math.max(a1,Number($('#lsnA2').value)||a1);
      const notes=$('#lsnNotes').value.trim()||'तजवीद और ठहराव के साथ पढ़ें।';
      if(!ttl){ZD.toast('कृपया पाठ का नाम लिखें');return}
      let ar='';
      try{const d=await ZD.loadSurah(s);if(d&&d.ayahs)ar=d.ayahs.slice(a1-1,Math.min(a2,a1+2)).map(x=>x.ar).join(' ۝ ')}catch(_){}
      st.lessons.unshift({id:'lsn-'+Date.now(),title:ttl,surah:s,a1,a2,ar,notes,certified:true,createdAt:ZD.today()});
      saveCL(st);render();ZD.toast('✅ प्रमाणित पाठ जुड़ गया');
    });

    $('#view').querySelectorAll('[data-lsndel]').forEach(b=>b.addEventListener('click',()=>{
      st.lessons=st.lessons.filter(x=>x.id!==b.dataset.lsndel);saveCL(st);render();
    }));

    /* Teacher Create Homework */
    if($('#hwCreateBtn'))$('#hwCreateBtn').addEventListener('click',()=>{
      const ttl=$('#hwTtl').value.trim();
      const s=Number($('#hwSurah').value)||1;
      const a1=Math.max(1,Number($('#hwA1').value)||1);
      const a2=Math.max(a1,Number($('#hwA2').value)||a1);
      const desc=$('#hwDesc').value.trim()||'साफ़ आवाज़ और तजवीद के साथ तिलावत रिकॉर्ड करें।';
      if(!ttl){ZD.toast('कृपया होमवर्क का शीर्षक लिखें');return}
      st.homeworks.unshift({
        id:'hw-'+Date.now(),title:ttl,surah:s,a1,a2,due:ZD.addDays(ZD.today(),3),desc,
        status:'pending',hasAudio:false,submittedAt:'',teacherFeedback:'',teacherGrade:'',
        aiTip:'AI अभ्यास सुझाव: रिकॉर्डिंग से पहले 3 बार धीमी गति से सुनकर मख़रज दोहराएँ।'
      });
      saveCL(st);render();ZD.toast('📤 होमवर्क विद्यार्थी को भेज दिया गया');
    });

    /* Student Tilawat Audio Recording */
    $('#view').querySelectorAll('[data-start-rec]').forEach(b=>b.addEventListener('click',async()=>{
      const id=b.dataset.startRec;
      if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia||typeof MediaRecorder==='undefined'){
        ZD.toast('इस डिवाइस पर ऑडियो रिकॉर्डिंग उपलब्ध नहीं है');return;
      }
      try{
        recStream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}});
        recChunks=[];recHwId=id;recSec=0;
        mediaRec=new MediaRecorder(recStream);
        mediaRec.ondataavailable=e=>{if(e.data&&e.data.size)recChunks.push(e.data)};
        mediaRec.onstop=async()=>{
          const blob=new Blob(recChunks,{type:mediaRec&&mediaRec.mimeType||'audio/webm'});
          const savedId=recHwId;
          stopRecHardware();
          if(blob.size>400){
            const dataUrl=await blobToDataUrl(blob);
            await recDB.put({id:savedId,dataUrl,ts:Date.now()});
            const hw=st.homeworks.find(x=>x.id===savedId);
            if(hw){hw.hasAudio=true;hw.status='submitted';hw.submittedAt=ZD.today()}
            saveCL(st);ZD.toast('🎙️ तिलावत इस फ़ोन पर सेव हो गई।');
          }
          render();
        };
        mediaRec.start();
        render();
        recTmr=setInterval(()=>{recSec++;render();if(recSec>=90&&mediaRec&&mediaRec.state!=='inactive')mediaRec.stop()},1000);
      }catch(_){
        stopRecHardware();
        ZD.toast('माइक की अनुमति दें (App Settings > Permissions > Microphone)');
      }
    }));

    if($('#hwStopRec'))$('#hwStopRec').addEventListener('click',()=>{
      if(mediaRec&&mediaRec.state!=='inactive')mediaRec.stop();
    });

    /* Play Student Recorded Tilawat */
    $('#view').querySelectorAll('[data-play-hw]').forEach(b=>b.addEventListener('click',()=>{
      playClip(b.dataset.playHw,b);
    }));

    /* Teacher Certify Improvement Feedback */
    $('#view').querySelectorAll('[data-tsave]').forEach(b=>b.addEventListener('click',()=>{
      const id=b.dataset.tsave;
      const hw=st.homeworks.find(x=>x.id===id);if(!hw)return;
      const msgEl=$('[data-tmsg="'+id+'"]');
      const grEl=$('[data-tgrade="'+id+'"]');
      hw.teacherFeedback=msgEl?msgEl.value.trim():'';
      hw.teacherGrade=grEl?grEl.value.trim():'';
      if(hw.teacherFeedback)hw.status='reviewed';
      saveCL(st);render();ZD.toast('✅ शिक्षक का प्रमाणित सुझाव सेव हो गया');
    }));

    /* Refresh General AI Suggestion (Clearly Separate from Teacher Feedback) */
    $('#view').querySelectorAll('[data-airef]').forEach(b=>b.addEventListener('click',async()=>{
      const hw=st.homeworks.find(x=>x.id===b.dataset.airef);if(!hw)return;
      b.textContent='⏳…';
      const sr=ZD.surah(hw.surah)||ZD.surah(1);
      if(ZD.askOnce){
        try{
          const tip=await ZD.askOnce('Give 1 short practical Tajweed tip in simple Hindi (max 25 words) for reciting Surah '+sr.en+' ayah '+hw.a1+' to '+hw.a2+'.');
          if(tip){hw.aiTip='AI अभ्यास सुझाव: '+tip.trim();saveCL(st);render();return}
        }catch(_){}
      }
      hw.aiTip='AI अभ्यास सुझाव: Surah '+sr.en+' की आयत '+hw.a1+'–'+hw.a2+' में हर हरकत (ज़बर, ज़ेर, पेश) को बिना खींचे साफ़ अदा करें।';
      saveCL(st);render();
    }));

    if($('#clLiveSave'))$('#clLiveSave').addEventListener('click',()=>{
      st.liveUrl=$('#clLiveIn').value.trim();saveCL(st);render();ZD.toast('Live Class लिंक सेव हो गया');
    });
  }
  render();
};
})();

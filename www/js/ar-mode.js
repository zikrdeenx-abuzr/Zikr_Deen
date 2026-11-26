/* Zikr Deen App — Camera AR Learning Mode:
   1. AR 3D Namaz Overlay (Live Camera + Background-Keyed 360° 3D Pose + Drag/Scale/Rotate + Snapshot)
   2. Live AR Qibla Camera Finder (Live Camera + Compass HUD + Kaaba Direction Pointer)
*/
(function(){'use strict';
const ZD=window.ZD,$=ZD.$,esc=ZD.esc,icon=ZD.icon,R=ZD.R;
const SET_COUNTS=[48,48,48,36,48,48,48,9];
const AR_POSES=[
  {id:0,name:'01. Qiyam',hi:'सीधा खड़े होना और निय्यत',step:0},
  {id:1,name:'02. Takbeer',hi:'तकबीर-ए-तहरीमा (हाथ उठाना)',step:1},
  {id:2,name:'03. Haath Bandhna',hi:'क़ियाम में हाथ बाँधना',step:2},
  {id:3,name:'04. Ruku',hi:'रुकू की सही पोज़िशन (90°)',step:3},
  {id:4,name:'05. Qauma',hi:'रुकू से सीधा खड़े होना',step:4},
  {id:5,name:'06. Sajda',hi:'7 अंगों पर सजदा करना',step:5},
  {id:6,name:'07. Tashahhud',hi:'क़अदा / तशह्हुद में बैठना',step:7},
  {id:7,name:'08. Salam',hi:'दाएँ और बाएँ सलाम फेरना',step:8}
];

/* ---------- Qibla math (synced with qibla.js & prayer.js) ---------- */
const KAABA={lat:21.422487,lng:39.826206},D=Math.PI/180;
function getPlace(){
  try{const q=JSON.parse(localStorage.getItem('zd-qibla-v1')||'null');if(q&&isFinite(q.lat)&&isFinite(q.lng))return q}catch(_){}
  try{const p=JSON.parse(localStorage.getItem('zd-prayer-v1')||'null');if(p&&isFinite(p.lat)&&isFinite(p.lng))return{lat:p.lat,lng:p.lng,label:p.label||p.city||'Saved City'}}catch(_){}
  return{lat:26.8467,lng:80.9462,label:'Lucknow, UP'};
}
function qiblaBearing(lat,lng){
  const p1=lat*D,p2=KAABA.lat*D,dl=(KAABA.lng-lng)*D;
  const y=Math.sin(dl)*Math.cos(p2),x=Math.cos(p1)*Math.sin(p2)-Math.sin(p1)*Math.cos(p2)*Math.cos(dl);
  return(Math.atan2(y,x)/D+360)%360;
}
function qiblaDist(lat,lng){
  const p1=lat*D,p2=KAABA.lat*D,dp=p2-p1,dl=(KAABA.lng-lng)*D;
  const a=Math.pow(Math.sin(dp/2),2)+Math.cos(p1)*Math.cos(p2)*Math.pow(Math.sin(dl/2),2);
  return 6371*2*Math.asin(Math.min(1,Math.sqrt(a)));
}
function headingFrom(e){
  if(typeof e.webkitCompassHeading==='number'&&!isNaN(e.webkitCompassHeading))return e.webkitCompassHeading;
  if(e.alpha==null)return null;
  const a=e.alpha*D,b=(e.beta||0)*D,g=(e.gamma||0)*D;
  let east,north;
  if(Math.abs(e.beta||0)<45){east=-Math.sin(a)*Math.cos(b);north=Math.cos(a)*Math.cos(b)}
  else{east=-(Math.cos(a)*Math.sin(g)+Math.sin(a)*Math.sin(b)*Math.cos(g));north=Math.cos(a)*Math.sin(b)*Math.cos(g)-Math.sin(a)*Math.sin(g)}
  return(Math.atan2(east,north)/D+360)%360;
}

/* ---------- Chroma-Key: Strip cream studio background from 3D .webp frame ---------- */
const keyedCache=new Map();
const offCv=document.createElement('canvas');
const offCx=offCv.getContext('2d',{willReadFrequently:true});

function loadKeyedFrame(setIdx,frameIdx){
  const N=SET_COUNTS[setIdx]||1;
  const f=((frameIdx%N)+N)%N;
  const key=setIdx+':'+f;
  if(keyedCache.has(key))return Promise.resolve(keyedCache.get(key));
  const url='./assets/namaz3d/s'+setIdx+'/'+String(f).padStart(2,'0')+'.webp';
  return new Promise(res=>{
    const im=new Image();
    im.decoding='async';
    im.onload=()=>{
      try{
        const W=360,H=Math.round(W*(im.height/Math.max(1,im.width)));
        offCv.width=W;offCv.height=H;
        offCx.clearRect(0,0,W,H);
        offCx.drawImage(im,0,0,W,H);
        const img=offCx.getImageData(0,0,W,H),d=img.data;
        // Sample background color from top-left corner
        const r0=d[0],g0=d[1],b0=d[2];
        for(let i=0;i<d.length;i+=4){
          const dr=d[i]-r0,dg=d[i+1]-g0,db=d[i+2]-b0;
          const dist=Math.sqrt(dr*dr+dg*dg+db*db);
          if(dist<26){
            d[i+3]=0;
          }else if(dist<44){
            d[i+3]=Math.round(((dist-26)/18)*255);
          }
        }
        offCx.putImageData(img,0,0);
        const out=document.createElement('canvas');
        out.width=W;out.height=H;
        out.getContext('2d').drawImage(offCv,0,0);
        if(keyedCache.size>45){
          const firstKey=keyedCache.keys().next().value;
          keyedCache.delete(firstKey);
        }
        keyedCache.set(key,out);
        res(out);
      }catch(_){res(im)}
    };
    im.onerror=()=>res(null);
    im.src=url;
  });
}

/* ================= MAIN AR CAMERA VIEW (#/ar-mode) ================= */
R['ar-mode']=function(){
  const v=$('#view');
  let mode='namaz'; // 'namaz' | 'qibla'
  let poseIdx=2;    // Default: Haath Bandhna (Qiyam)
  let rotDeg=0;     // 0..359
  let scalePct=100; // 55..150
  let posX=50,posY=54; // % coordinates on stage
  let camStream=null,camLive=false,camErr='';
  let heading=null,sinH=0,cosH=0,oriHandler=null;

  const place=getPlace();
  const targetB=qiblaBearing(place.lat,place.lng);
  const targetKm=Math.round(qiblaDist(place.lat,place.lng));

  v.innerHTML=
    '<header class="topbar"><button class="ibtn" data-act="back" aria-label="Back">'+icon('back')+'</button>'+
    '<h1>AR Camera Mode<span class="sub">लाइव कैमरा · 3D नमाज़ व क़िबला</span></h1>'+
    '<button class="ibtn" id="arSnapBtn" title="Snapshot" aria-label="Take Snapshot">📸</button></header>'+
    '<main class="ar-wrap">'+
      '<div class="seg" id="arModeSeg" role="tablist" style="margin:6px 0 10px">'+
        '<button type="button" role="tab" data-am="namaz" aria-selected="true">🕌 3D नमाज़ AR</button>'+
        '<button type="button" role="tab" data-am="qibla" aria-selected="false">🧭 AR क़िबला कैमरा</button>'+
      '</div>'+
      '<div class="ar-stage" id="arStage">'+
        '<video id="arVid" autoplay playsinline muted></video>'+
        '<div class="ar-fallback" id="arFallback">'+
          '<div class="ar-grid-floor"></div>'+
          '<div class="ar-fb-badge" id="arFbMsg">📷 कैमरा शुरू हो रहा है…</div>'+
        '</div>'+
        /* 3D Namaz AR Layer */
        '<div class="ar-model-layer" id="arModelLayer">'+
          '<div class="ar-model-box" id="arModelBox" style="left:50%;top:54%">'+
            '<div class="ar-shadow"></div>'+
            '<canvas id="arPoseCv" width="360" height="640"></canvas>'+
          '</div>'+
          '<div class="ar-hud-tip">☝️ उँगली से खिसकाएँ · स्लाइडर से 360° घुमाएँ</div>'+
        '</div>'+
        /* AR Qibla HUD Layer */
        '<div class="ar-qibla-layer" id="arQiblaLayer" hidden>'+
          '<div class="ar-q-top"><span id="arQCity">📍 '+esc(place.label)+'</span><span>'+Math.round(targetB)+'° · '+targetKm.toLocaleString('en-IN')+' km</span></div>'+
          '<div class="ar-q-reticle" id="arQReticle">'+
            '<div class="ar-q-ring"></div>'+
            '<div class="ar-q-kaaba" id="arQKaaba">🕋</div>'+
            '<div class="ar-q-arrow" id="arQArrow">▲</div>'+
          '</div>'+
          '<div class="ar-q-say" id="arQSay">फ़ोन को सीधा पकड़कर चारों तरफ़ घुमाएँ…</div>'+
        '</div>'+
      '</div>'+

      /* Controls for 3D Namaz AR */
      '<section class="block card" id="arNamazCtrl">'+
        '<div class="ar-poses" id="arPoses">'+
          AR_POSES.map((p,i)=>'<button type="button" class="tb-chip'+(i===poseIdx?' on':'')+'" data-ap="'+i+'">'+esc(p.name)+'</button>').join('')+
        '</div>'+
        '<div class="field"><label for="arRot">🔄 360° घुमाएँ (<b id="arRotVal">0°</b>)</label><input type="range" id="arRot" min="0" max="359" value="0"></div>'+
        '<div class="field"><label for="arScl">🔍 साइज़ (<b id="arSclVal">100%</b>)</label><input type="range" id="arScl" min="55" max="150" value="100"></div>'+
        '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">'+
          '<button type="button" class="btn sm ghost" id="arCamRetry">📷 कैमरा रीस्टार्ट</button>'+
          '<a class="btn sm" id="arFull3dLink" href="./namaz-3d.html?step=2">📖 दुआ और दलील देखें →</a>'+
        '</div>'+
      '</section>'+

      /* Controls for AR Qibla */
      '<section class="block card" id="arQiblaCtrl" hidden>'+
        '<p class="muted small" style="margin:0 0 10px">कैमरा स्क्रीन पर जब <b>🕋 काबा</b> बीच के घेरे में आ जाए और घेरा हरा हो जाए, तो वही क़िबला की सही दिशा है।</p>'+
        '<div style="display:flex;gap:8px;flex-wrap:wrap">'+
          '<button type="button" class="btn sm" id="arQGps">📍 GPS से लोकेशन लें</button>'+
          '<a class="btn sm ghost" href="#/qibla">🧭 स्टैंडर्ड कंपास खोलें</a>'+
        '</div>'+
      '</section>'+
    '</main>';

  const vid=$('#arVid'),fb=$('#arFallback'),fbMsg=$('#arFbMsg');
  const mBox=$('#arModelBox'),pCv=$('#arPoseCv'),pCx=pCv.getContext('2d');

  async function startCamera(){
    stopCamera();
    if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){
      camLive=false;fb.hidden=false;fbMsg.textContent='📷 AR Studio Grid (ब्राउज़र में कैमरा उपलब्ध नहीं)';return;
    }
    try{
      camStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});
      vid.srcObject=camStream;
      await vid.play().catch(()=>{});
      camLive=true;fb.hidden=true;
    }catch(e){
      camLive=false;fb.hidden=false;
      fbMsg.textContent='📷 AR Studio Grid (कैमरा अनुमति दें या यहाँ अभ्यास करें)';
    }
  }
  function stopCamera(){
    if(camStream){try{camStream.getTracks().forEach(t=>t.stop())}catch(_){}camStream=null}
    camLive=false;
  }

  let drawReq=0;
  async function renderPose(){
    const req=++drawReq;
    const pose=AR_POSES[poseIdx];
    const N=SET_COUNTS[pose.id]||1;
    const fIdx=Math.floor((rotDeg/360)*N)%N;
    const canvasFrame=await loadKeyedFrame(pose.id,fIdx);
    if(req!==drawReq||!canvasFrame)return;
    pCv.width=canvasFrame.width;pCv.height=canvasFrame.height;
    pCx.clearRect(0,0,pCv.width,pCv.height);
    pCx.drawImage(canvasFrame,0,0);
    // Preload neighbors for smooth 360 rotation
    loadKeyedFrame(pose.id,fIdx+1);
    loadKeyedFrame(pose.id,fIdx-1);
  }

  function updateTransform(){
    mBox.style.left=posX+'%';
    mBox.style.top=posY+'%';
    mBox.style.transform='translate(-50%,-50%) scale('+(scalePct/100)+')';
  }

  // Drag model across camera screen
  let dragging=false,sx=0,sy=0,ox=50,oy=54;
  mBox.addEventListener('pointerdown',e=>{
    dragging=true;sx=e.clientX;sy=e.clientY;ox=posX;oy=posY;
    try{mBox.setPointerCapture(e.pointerId)}catch(_){}
  });
  mBox.addEventListener('pointermove',e=>{
    if(!dragging)return;
    const stg=$('#arStage').getBoundingClientRect();
    posX=Math.max(15,Math.min(85,ox+((e.clientX-sx)/Math.max(1,stg.width))*100));
    posY=Math.max(20,Math.min(84,oy+((e.clientY-sy)/Math.max(1,stg.height))*100));
    updateTransform();
  });
  ['pointerup','pointercancel'].forEach(ev=>mBox.addEventListener(ev,()=>{dragging=false}));

  // Compass sensor for AR Qibla HUD
  function startCompass(){
    stopCompass();
    oriHandler=e=>{
      const h=headingFrom(e);if(h==null||isNaN(h))return;
      sinH=sinH*0.75+Math.sin(h*D)*0.25;cosH=cosH*0.75+Math.cos(h*D)*0.25;
      heading=(Math.atan2(sinH,cosH)/D+360)%360;
      const diff=((targetB-heading+540)%360)-180,ad=Math.abs(diff);
      const ret=$('#arQReticle'),kb=$('#arQKaaba'),say=$('#arQSay');
      if(!ret)return;
      const shift=Math.max(-110,Math.min(110,diff*1.8));
      kb.style.transform='translateX('+shift.toFixed(1)+'px)';
      const ok=ad<=5;
      ret.classList.toggle('ok',ok);
      say.textContent=ok?'✓ सामने क़िबला की दिशा है (Kaaba)':(diff>0?'👉 दाएँ मुड़ें ('+Math.round(ad)+'°)':'👈 बाएँ मुड़ें ('+Math.round(ad)+'°)');
    };
    if('ondeviceorientationabsolute' in window)window.addEventListener('deviceorientationabsolute',oriHandler,true);
    else window.addEventListener('deviceorientation',oriHandler,true);
  }
  function stopCompass(){
    if(oriHandler){
      window.removeEventListener('deviceorientationabsolute',oriHandler,true);
      window.removeEventListener('deviceorientation',oriHandler,true);
      oriHandler=null;
    }
  }

  // Mode Switch (3D Namaz AR vs AR Qibla Camera)
  $('#arModeSeg').addEventListener('click',e=>{
    const b=e.target.closest('[data-am]');if(!b||b.dataset.am===mode)return;
    mode=b.dataset.am;
    $('#arModeSeg').querySelectorAll('[data-am]').forEach(x=>x.setAttribute('aria-selected',String(x===b)));
    const isN=mode==='namaz';
    $('#arModelLayer').hidden=!isN;
    $('#arNamazCtrl').hidden=!isN;
    $('#arQiblaLayer').hidden=isN;
    $('#arQiblaCtrl').hidden=isN;
    if(isN)stopCompass();else startCompass();
  });

  // Pose Chips, 360 Slider, Scale Slider
  $('#arPoses').addEventListener('click',e=>{
    const b=e.target.closest('[data-ap]');if(!b)return;
    poseIdx=+b.dataset.ap;
    $('#arPoses').querySelectorAll('[data-ap]').forEach(x=>x.classList.toggle('on',x===b));
    $('#arFull3dLink').href='./namaz-3d.html?step='+AR_POSES[poseIdx].step;
    renderPose();
  });
  $('#arRot').addEventListener('input',e=>{
    rotDeg=+e.target.value;$('#arRotVal').textContent=rotDeg+'°';renderPose();
  });
  $('#arScl').addEventListener('input',e=>{
    scalePct=+e.target.value;$('#arSclVal').textContent=scalePct+'%';updateTransform();
  });
  $('#arCamRetry').addEventListener('click',startCamera);

  if($('#arQGps'))$('#arQGps').addEventListener('click',()=>{
    if(!navigator.geolocation){ZD.toast('GPS उपलब्ध नहीं है');return}
    ZD.toast('लोकेशन ली जा रही है…');
    navigator.geolocation.getCurrentPosition(pos=>{
      try{localStorage.setItem('zd-qibla-v1',JSON.stringify({lat:pos.coords.latitude,lng:pos.coords.longitude,label:'Meri location (GPS)'}))}catch(_){}
      R['ar-mode']();ZD.toast('GPS लोकेशन अपडेट हो गई');
    },()=>ZD.toast('GPS लोकेशन नहीं मिल सकी'),{timeout:12000});
  });

  // Snapshot Capture
  $('#arSnapBtn').addEventListener('click',()=>{
    try{
      const stg=$('#arStage'),W=720,H=1080,c=document.createElement('canvas');
      c.width=W;c.height=H;const g=c.getContext('2d');
      if(camLive&&vid.videoWidth){
        const vr=vid.videoWidth/vid.videoHeight,cr=W/H;
        let sw=vid.videoWidth,sh=vid.videoHeight,sx0=0,sy0=0;
        if(vr>cr){sw=sh*cr;sx0=(vid.videoWidth-sw)/2}else{sh=sw/cr;sy0=(vid.videoHeight-sh)/2}
        g.drawImage(vid,sx0,sy0,sw,sh,0,0,W,H);
      }else{
        const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#0f172a');gr.addColorStop(1,'#1e293b');
        g.fillStyle=gr;g.fillRect(0,0,W,H);
      }
      if(mode==='namaz'){
        const mw=W*0.56*(scalePct/100),mh=mw*(pCv.height/Math.max(1,pCv.width));
        const mx=(posX/100)*W-mw/2,my=(posY/100)*H-mh/2;
        g.drawImage(pCv,mx,my,mw,mh);
      }
      g.fillStyle='rgba(0,0,0,0.55)';g.fillRect(0,H-64,W,64);
      g.fillStyle='#fde68a';g.font='bold 24px system-ui,sans-serif';g.textAlign='center';
      g.fillText('Zikr Deen AR · '+AR_POSES[poseIdx].name,W/2,H-24);
      c.toBlob(blob=>{if(blob){ZD.download('zikr-deen-ar-'+Date.now()+'.png',blob);ZD.toast('📸 AR Snapshot सेव हो गया')}},'image/png');
    }catch(_){ZD.toast('Snapshot नहीं बन सका')}
  });

  ZD.onLeave(()=>{stopCamera();stopCompass()});
  updateTransform();
  renderPose();
  startCamera();
};
})();

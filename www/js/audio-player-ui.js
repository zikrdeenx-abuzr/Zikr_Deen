(function(){'use strict';
const ZD=window.ZD,$=ZD.$,esc=ZD.esc,icon=ZD.icon,P=ZD.player,R=ZD.R;
const view=()=>$('#view');
const tr=s=>ZD.i18n&&typeof ZD.i18n.t==='function'?ZD.i18n.t(s):s;

const STYLE_ID='zd-full-player-style';
function ensureStyles(){
  if(document.getElementById(STYLE_ID))return;
  const st=document.createElement('style');
  st.id=STYLE_ID;
  st.textContent=
    '.fp-wrap{min-height:calc(100vh - 130px);padding:14px 16px 32px;display:flex;flex-direction:column;justify-content:space-between;gap:16px;background:radial-gradient(circle at 50% 18%,rgba(46,125,87,.14),transparent 62%)}'+
    '.fp-card{background:#fffdf8;color:#1d2e25;border:1px solid rgba(46,105,74,.22);border-radius:20px;padding:20px 18px;text-align:center;box-shadow:0 14px 34px rgba(22,42,31,.10);max-width:440px;width:100%;margin:0 auto}'+
    '.fp-snum{font-size:13px;font-weight:700;color:#66756b;margin-bottom:4px}'+
    '.fp-ar{font-family:"Amiri",serif;font-size:34px;line-height:1.5;color:#b5862e;margin:6px 0 14px}'+
    '.fp-dl{display:inline-flex;align-items:center;gap:6px;border:1.5px solid #2e8b57;background:#f3fbf6;color:#237346;border-radius:99px;padding:7px 16px;font-size:13px;font-weight:700;cursor:pointer}'+
    '.fp-dl.done{background:#2e8b57;color:#fff}'+
    '.fp-rec-row{display:flex;justify-content:center;align-items:center;gap:8px;margin-top:6px}'+
    '.fp-rec-sel{border:1px solid rgba(46,105,74,.25);background:var(--surface,#fff);color:var(--ink,#1d2e25);border-radius:12px;padding:7px 12px;font-size:13px;font-weight:600;max-width:280px}'+
    '.fp-mid-btns{display:flex;justify-content:center;align-items:center;gap:18px;flex-wrap:wrap;margin:6px 0}'+
    '.fp-cbtn{width:46px;height:46px;border-radius:50%;border:1.5px solid rgba(46,105,74,.28);background:var(--surface,#fff);color:#2d6e4e;display:grid;place-items:center;font-size:13px;font-weight:700;cursor:pointer}'+
    '.fp-cbtn.on{background:#2e8b57;color:#fff;border-color:#2e8b57}'+
    '.fp-time-box{max-width:460px;width:100%;margin:0 auto}'+
    '.fp-slider{width:100%;accent-color:#2e8b57;cursor:pointer;height:6px}'+
    '.fp-times{display:flex;justify-content:space-between;font-size:12px;color:#5f6f65;margin-top:4px;font-variant-numeric:tabular-nums}'+
    '.fp-main-ctrls{display:flex;justify-content:space-around;align-items:center;max-width:460px;width:100%;margin:6px auto 0}'+
    '.fp-ic{background:none;border:0;color:#2e8b57;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;cursor:pointer}'+
    '.fp-ic.on{background:rgba(46,139,87,.14)}'+
    '.fp-play-big{width:64px;height:64px;border-radius:50%;border:0;background:#339954;color:#fff;display:grid;place-items:center;box-shadow:0 10px 24px rgba(51,153,84,.28);cursor:pointer}'+
    '.fp-play-big svg{width:28px;height:28px}'+
    '[data-theme="night"] .fp-card,[data-theme="dark-brown"] .fp-card,[data-theme="bw"] .fp-card{background:#151a22;color:#f3ecd8;border-color:rgba(226,188,98,.30)}'+
    '[data-theme="night"] .fp-ar,[data-theme="dark-brown"] .fp-ar,[data-theme="bw"] .fp-ar{color:#e2bc62}';
  document.head.appendChild(st);
}

const fmtTime=sec=>{
  if(!Number.isFinite(sec)||sec<0)return '00:00';
  const m=Math.floor(sec/60),s=Math.floor(sec%60);
  return String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
};

R.listen=function(){
  ensureStyles();
  const st=ZD.state(),p=ZD.prefs();
  const cur=P.cur()||(st.last?{s:st.last.s,a:st.last.a}:{s:1,a:1});
  let sNum=cur.s||1,aNum=cur.a||1;

  view().innerHTML=
    '<header class="topbar"><button class="ibtn" data-act="back" aria-label="Back">'+icon('back')+'</button>'+
    '<h1>'+esc(tr('Listen'))+'<span class="sub" id="fpSub"></span></h1>'+
    '<a class="ibtn" id="fpReadLink" href="#/read/'+sNum+'/'+aNum+'" aria-label="Read Surah">'+icon('book')+'</a></header>'+
    '<main class="fp-wrap">'+
    '<div>'+
    '<div class="fp-card">'+
    '<div class="fp-snum" id="fpSNum"></div>'+
    '<div class="fp-ar" lang="ar" id="fpAr"></div>'+
    '<button type="button" class="fp-dl" id="fpDl">'+icon('down')+' <span id="fpDlTxt">Download</span></button>'+
    '<div class="muted small" id="fpDlProg" style="margin-top:6px"></div>'+
    '</div>'+
    '<div class="fp-rec-row" style="margin-top:14px">'+
    '<select id="fpRec" class="fp-rec-sel" aria-label="Reciter">'+
    ZD.RECITERS.map(r=>'<option value="'+esc(r[0])+'"'+(r[0]===p.reciter?' selected':'')+'>'+esc(r[1])+'</option>').join('')+
    '</select></div>'+
    '<div class="fp-mid-btns" style="margin-top:16px">'+
    '<button type="button" class="fp-cbtn" id="fpMute" aria-label="Mute">'+icon('vol')+'</button>'+
    '<button type="button" class="fp-cbtn" id="fpSleep" aria-label="Sleep timer">'+icon('timer')+'</button>'+
    '<button type="button" class="fp-cbtn" id="fpSpeed" aria-label="Speed">1×</button>'+
    '<button type="button" class="fp-cbtn" id="fpMark" aria-label="Bookmark">'+icon('mark')+'</button>'+
    '</div></div>'+
    '<div>'+
    '<div class="fp-time-box">'+
    '<input type="range" id="fpSeek" class="fp-slider" min="0" max="1000" value="0" aria-label="Seek">'+
    '<div class="fp-times"><span id="fpCurT">00:00</span><span id="fpTotT">00:00</span></div>'+
    '</div>'+
    '<div class="fp-main-ctrls">'+
    '<button type="button" class="fp-ic" id="fpRep" aria-label="Repeat">'+icon('repeat')+'</button>'+
    '<button type="button" class="fp-ic" id="fpPrev" aria-label="Previous">'+icon('prev')+'</button>'+
    '<button type="button" class="fp-play-big" id="fpPlay" aria-label="Play or pause">'+icon('play')+'</button>'+
    '<button type="button" class="fp-ic" id="fpNext" aria-label="Next">'+icon('next')+'</button>'+
    '<button type="button" class="fp-ic" id="fpList" aria-label="Surah list">'+icon('folders')+'</button>'+
    '</div></div>'+
    '</main>';

  const refreshDlBadge=async()=>{
    const sr=ZD.surah(sNum);
    const cnt=await ZD.offlineCount(p.reciter,sNum);
    const btn=$('#fpDl'),txt=$('#fpDlTxt');
    if(!btn||!txt)return;
    if(cnt>=sr.count){btn.classList.add('done');txt.textContent='Saved ('+sr.count+')'}
    else{btn.classList.remove('done');txt.textContent='Download ('+cnt+'/'+sr.count+')'}
  };

  const paint=()=>{
    const active=P.cur();
    if(active){sNum=active.s;aNum=active.a}
    const sr=ZD.surah(sNum)||ZD.surah(1);
    $('#fpSNum').textContent=sr.n+'. '+sr.en+' · Ayah '+aNum+'/'+sr.count;
    $('#fpAr').textContent='سُورَةُ '+sr.ar;
    $('#fpSub').textContent=sr.en+' · '+aNum+'/'+sr.count;
    $('#fpReadLink').href='#/read/'+sNum+'/'+aNum;
    $('#fpRec').value=p.reciter;
    $('#fpSpeed').textContent=(p.speed||1)+'×';
    $('#fpMark').classList.toggle('on',ZD.isBookmarked(sNum,aNum));
    $('#fpRep').classList.toggle('on',(p.repeat||1)>1);
    $('#fpSleep').classList.toggle('on',!!P.sleepEnd);
    $('#fpMute').classList.toggle('on',!!P.audio.muted);
    $('#fpPlay').innerHTML=icon(P.playing?'pause':'play');
    const dur=P.audio.duration||0,curT=P.audio.currentTime||0;
    $('#fpCurT').textContent=fmtTime(curT);
    $('#fpTotT').textContent=fmtTime(dur);
    if(dur>0)$('#fpSeek').value=String(Math.round(curT/dur*1000));
    refreshDlBadge();
  };

  $('#fpPlay').addEventListener('click',()=>{
    if(P.cur())P.toggle();
    else ZD.playSurah(sNum,aNum);
  });
  $('#fpNext').addEventListener('click',()=>{
    if(P.cur())P.next();
    else ZD.playSurah(Math.min(114,sNum+1),1);
  });
  $('#fpPrev').addEventListener('click',()=>{
    if(P.cur())P.prev();
    else ZD.playSurah(Math.max(1,sNum-1),1);
  });
  $('#fpRep').addEventListener('click',()=>{
    p.repeat=p.repeat>1?1:3;
    ZD.updateCfg({repeat:p.repeat});
    ZD.save();
    ZD.toast('Repeat: '+p.repeat+'×');
    paint();
  });
  $('#fpSpeed').addEventListener('click',()=>{
    const list=[0.75,0.9,1,1.15,1.3,1.5];
    const next=list[(list.indexOf(p.speed)+1)%list.length];
    p.speed=next;
    ZD.updateCfg({speed:next});
    ZD.save();
    paint();
  });
  $('#fpMute').addEventListener('click',()=>{
    P.audio.muted=!P.audio.muted;
    paint();
  });
  $('#fpSleep').addEventListener('click',()=>{
    if(P.sleepEnd){ZD.setSleep(0);ZD.toast('Sleep timer off')}
    else{ZD.setSleep(20);ZD.toast('Sleep timer: 20 min')}
    paint();
  });
  $('#fpMark').addEventListener('click',()=>{
    const on=ZD.toggleBookmark(sNum,aNum);
    ZD.toast(on?'Bookmarked':'Removed bookmark');
    paint();
  });
  $('#fpRec').addEventListener('change',e=>{
    ZD.switchReciter(e.target.value,sNum,aNum);
    paint();
  });
  $('#fpSeek').addEventListener('input',e=>{
    const frac=Number(e.target.value)/1000;
    P.seekFrac(frac);
  });
  $('#fpList').addEventListener('click',()=>{location.hash='#/surahs'});

  let dlStop=false;
  ZD.onLeave(()=>{dlStop=true});
  $('#fpDl').addEventListener('click',async()=>{
    const sr=ZD.surah(sNum),btn=$('#fpDl'),prog=$('#fpDlProg');
    btn.disabled=true;dlStop=false;
    const r=await ZD.downloadSurahAudio(p.reciter,sNum,1,sr.count,(done,tot)=>{
      prog.textContent=done+' / '+tot;
    },()=>dlStop);
    btn.disabled=false;
    prog.textContent=r.ok+' / '+sr.count+' saved';
    refreshDlBadge();
  });

  paint();
  const unsub=ZD.onPlayer(paint);
  ZD.onLeave(unsub);
};
})();

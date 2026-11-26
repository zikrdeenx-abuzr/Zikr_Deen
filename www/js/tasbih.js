/* Zikr Deen App — Premium Interactive Tasbih Counter */
(function(){'use strict';
const ZD=window.ZD,$=ZD.$,esc=ZD.esc,icon=ZD.icon,R=ZD.R;
const SKEY='zdTasbihV1';
const PRESETS=[
  {id:'subhan', ar:'سُبْحَانَ اللَّهِ', rom:'SubhanAllah', mean:'अल्लाह पाक है · Glory be to Allah', target:33},
  {id:'hamd',   ar:'الْحَمْدُ لِلَّهِ', rom:'Alhamdulillah', mean:'सारी तारीफ़ अल्लाह के लिए है · Praise be to Allah', target:33},
  {id:'akbar',  ar:'اللَّهُ أَكْبَرُ', rom:'Allahu Akbar', mean:'अल्लाह सबसे बड़ा है · Allah is the Greatest', target:34},
  {id:'tahlil', ar:'لَا إِلَٰهَ إِلَّا اللَّهُ', rom:'La ilaha illallah', mean:'अल्लाह के सिवा कोई माबूद नहीं', target:100},
  {id:'istigh', ar:'أَسْتَغْفِرُ اللَّهَ', rom:'Astaghfirullah', mean:'मैं अल्लाह से माफ़ी माँगता हूँ', target:100},
  {id:'durood', ar:'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ', rom:'Durood Sharif', mean:'ऐ अल्लाह, मुहम्मद ﷺ पर रहमत नाज़िल फ़रमा', target:100}
];

function loadT(){
  try{
    const d=JSON.parse(localStorage.getItem(SKEY)||'{}');
    return {
      preset:d.preset||'akbar',
      custom:d.custom||'',
      count:Number(d.count)||0,
      set:Number(d.set)||1,
      target:d.target===0?0:(Number(d.target)||100),
      total:Number(d.total)||0,
      vib:d.vib!==false,
      snd:d.snd!==false
    };
  }catch(_){
    return {preset:'akbar',custom:'',count:0,set:1,target:100,total:0,vib:true,snd:true};
  }
}
function saveT(s){try{localStorage.setItem(SKEY,JSON.stringify(s))}catch(_){}}

let audioCtx=null;
function softTick(done){
  try{
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC)return;
    if(!audioCtx)audioCtx=new AC();
    if(audioCtx.state==='suspended')audioCtx.resume();
    const o=audioCtx.createOscillator(),g=audioCtx.createGain();
    o.type='sine';
    o.frequency.setValueAtTime(done?780:520,audioCtx.currentTime);
    o.frequency.exponentialRampToValueAtTime(done?1040:280,audioCtx.currentTime+(done?0.14:0.05));
    g.gain.setValueAtTime(done?0.12:0.06,audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+(done?0.18:0.06));
    o.connect(g);g.connect(audioCtx.destination);
    o.start();o.stop(audioCtx.currentTime+(done?0.19:0.065));
  }catch(_){}
}

let timerId=0;
R.tasbih=function(){
  if(timerId){clearInterval(timerId);timerId=0}
  const st=loadT();
  let sec=0,started=false;
  const view=$('#view');

  function curItem(){
    if(st.preset==='custom')return {ar:st.custom||'ذِكْرُ اللَّهِ',rom:'Custom Zikr',mean:'अपना ज़िक्र पढ़ें'};
    return PRESETS.find(x=>x.id===st.preset)||PRESETS[2];
  }
  function fmtTime(s){
    const m=Math.floor(s/60),r=s%60,h=Math.floor(m/60);
    return (h?h+':':'')+String(m%60).padStart(h?2:1,'0')+':'+String(r).padStart(2,'0');
  }

  function render(){
    const item=curItem();
    const pct=st.target>0?Math.min(100,Math.round((st.count/st.target)*100)):0;
    const countStr=String(st.count).padStart(3,'0');
    view.innerHTML=
      '<header class="topbar"><button class="ibtn" data-act="back" aria-label="Back">'+icon('back')+'</button>'+
      '<h1>Tasbih Counter<span class="sub">तस्बीह · Zikr Tracker</span></h1>'+
      '<button class="ibtn'+(st.snd?' on':'')+'" id="tbSnd" aria-label="Sound">'+icon('vol')+'</button></header>'+
      '<main class="tb-wrap">'+
      '<div class="tb-chips" id="tbPresets">'+
        PRESETS.map(p=>'<button type="button" class="tb-chip'+(st.preset===p.id?' on':'')+'" data-pid="'+p.id+'">'+esc(p.rom)+'</button>').join('')+
        '<button type="button" class="tb-chip'+(st.preset==='custom'?' on':'')+'" data-pid="custom">+ Custom</button>'+
      '</div>'+
      (st.preset==='custom'?'<div class="tb-custom"><input id="tbCustIn" type="text" placeholder="अपना ज़िक्र लिखें (e.g. Ya Hayyu Ya Qayyum)" value="'+esc(st.custom)+'" maxlength="80"></div>':'')+
      '<div class="tb-stage card">'+
        '<div class="tb-meta"><span>Set: <b id="tbSet">'+st.set+'</b></span><span class="tb-timer" id="tbTime">'+fmtTime(sec)+'</span><span>Range: <b id="tbRng">'+(st.target||'∞')+'</b></span></div>'+
        '<div class="tb-ar ar" lang="ar" id="tbAr">'+esc(item.ar)+'</div>'+
        '<div class="tb-mean" id="tbMean">'+esc(item.mean)+'</div>'+
        '<div class="tb-ring-wrap">'+
          '<button type="button" class="tb-tap" id="tbTap" aria-label="Count tasbih">'+
            '<span class="tb-num" id="tbNum">'+countStr+'</span>'+
            '<span class="tb-hint">TAP TO COUNT</span>'+
          '</button>'+
          '<div class="tb-bar"><i id="tbFill" style="width:'+pct+'%"></i></div>'+
        '</div>'+
        '<div class="tb-beads" id="tbBeads" aria-hidden="true">'+
          '<span class="bead b1"></span><span class="bead b2"></span><span class="bead b3"></span><span class="bead b4"></span><span class="bead b5"></span>'+
        '</div>'+
        '<div class="tb-ctrl">'+
          '<div class="tb-ranges" id="tbRanges">'+
            [33,99,100,0].map(r=>'<button type="button" class="tb-rbtn'+(st.target===r?' on':'')+'" data-r="'+r+'">'+(r||'∞')+'</button>').join('')+
          '</div>'+
          '<div class="tb-acts">'+
            '<button type="button" class="btn sm ghost" id="tbUndo">-1 Undo</button>'+
            '<button type="button" class="btn sm ghost" id="tbReset">Reset</button>'+
            '<button type="button" class="btn sm ghost'+(st.vib?' on':'')+'" id="tbVib">'+(st.vib?'📳 Vib ON':'📳 Vib OFF')+'</button>'+
          '</div>'+
        '</div>'+
      '</div>'+
      '<div class="tb-foot card"><div><span class="muted small">Total Lifetime Zikr</span><b id="tbTot" style="font-size:20px;display:block;color:var(--gold-soft)">'+st.total.toLocaleString()+'</b></div>'+
        '<a class="btn sm ghost" href="#/azkaar">Daily Azkaar →</a></div>'+
      '</main>';

    const tapBtn=$('#tbTap'),beads=$('#tbBeads');
    tapBtn.addEventListener('click',e=>{
      if(!started){
        started=true;
        timerId=setInterval(()=>{
          if(!$('#tbTime')){clearInterval(timerId);timerId=0;return}
          sec++;$('#tbTime').textContent=fmtTime(sec);
        },1000);
      }
      st.count++;st.total++;
      let completed=false;
      if(st.target>0&&st.count>=st.target){
        completed=true;
        if(st.count>st.target){st.count=1;st.set++}
      }
      saveT(st);
      $('#tbNum').textContent=String(st.count).padStart(3,'0');
      $('#tbSet').textContent=st.set;
      $('#tbTot').textContent=st.total.toLocaleString();
      if(st.target>0)$('#tbFill').style.width=Math.min(100,Math.round((st.count/st.target)*100))+'%';
      tapBtn.classList.remove('pop');void tapBtn.offsetWidth;tapBtn.classList.add('pop');
      beads.classList.remove('slide');void beads.offsetWidth;beads.classList.add('slide');
      if(st.vib&&navigator.vibrate)navigator.vibrate(completed?[35,45,35]:16);
      if(st.snd)softTick(completed);
      if(completed&&st.count===st.target)ZD.toast('माशाअल्लाह! Set '+st.set+' पूरा हुआ ('+st.target+')');
    });

    $('#tbPresets').addEventListener('click',e=>{
      const b=e.target.closest('[data-pid]');if(!b)return;
      st.preset=b.dataset.pid;
      const pr=PRESETS.find(x=>x.id===st.preset);
      if(pr)st.target=pr.target;
      st.count=0;st.set=1;saveT(st);render();
    });
    const ci=$('#tbCustIn');
    if(ci)ci.addEventListener('input',e=>{st.custom=e.target.value;saveT(st);$('#tbAr').textContent=st.custom||'ذِكْرُ اللَّهِ'});
    $('#tbRanges').addEventListener('click',e=>{
      const b=e.target.closest('[data-r]');if(!b)return;
      st.target=Number(b.dataset.r);saveT(st);render();
    });
    $('#tbUndo').addEventListener('click',()=>{
      if(st.count>0){st.count--;st.total=Math.max(0,st.total-1);saveT(st);render()}
    });
    $('#tbReset').addEventListener('click',()=>{
      st.count=0;st.set=1;sec=0;started=false;
      if(timerId){clearInterval(timerId);timerId=0}
      saveT(st);render();ZD.toast('Tasbih reset');
    });
    $('#tbVib').addEventListener('click',()=>{st.vib=!st.vib;saveT(st);render()});
    $('#tbSnd').addEventListener('click',()=>{st.snd=!st.snd;saveT(st);render()});
  }
  render();
};

ZD.tasbihHTML=function(){
  const st=loadT();
  return '<section class="block"><a class="card tb-home-card" href="#/tasbih">'+
    '<div class="tb-home-ico">📿</div>'+
    '<div style="flex:1;min-width:0"><div style="font-size:18px;font-weight:600">Tasbih Counter</div>'+
    '<div class="muted small">तस्बीह · Zikr & Daily Count · Total: '+st.total.toLocaleString()+'</div></div>'+
    icon('back','ask-arr')+'</a></section>';
};
})();

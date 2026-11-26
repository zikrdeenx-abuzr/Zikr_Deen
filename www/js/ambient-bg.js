/* Zikr Deen App — Subtle Dynamic Starfield & Interactive Click Motion Background */
(function(){'use strict';
const ZD=window.ZD||{};
const reduceMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const PALETTES={
  'dark-brown':  {star:'243,210,149', glow:'224,178,102', alpha:0.65, ripple:'224,178,102'},
  'bw':          {star:'255,255,255', glow:'228,228,231', alpha:0.62, ripple:'255,255,255'},
  'night':       {star:'245,223,163', glow:'116,196,255', alpha:0.68, ripple:'226,188,98'},
  'oled':        {star:'245,223,163', glow:'226,188,98',  alpha:0.60, ripple:'226,188,98'},
  'cream-green': {star:'30,122,86',   glow:'44,142,104',  alpha:0.28, ripple:'30,122,86'},
  'cream-yellow':{star:'158,113,16',  glow:'196,148,38',  alpha:0.30, ripple:'158,113,16'},
  'brown-white': {star:'124,77,43',   glow:'168,116,74',  alpha:0.26, ripple:'124,77,43'},
  'milk':        {star:'138,100,16',  glow:'27,122,98',   alpha:0.24, ripple:'138,100,16'},
  'day':         {star:'143,106,16',  glow:'143,106,16',  alpha:0.26, ripple:'143,106,16'},
  'grey':        {star:'122,90,18',   glow:'29,111,138',  alpha:0.24, ripple:'122,90,18'}
};

let canvas,ctx,W=0,H=0,DPR=1,stars=[],ripples=[],raf=0,running=false,enabled=true;

function getPal(){
  const t=document.documentElement.dataset.theme||'milk';
  return PALETTES[t]||PALETTES.milk;
}

function initStars(){
  const count=Math.min(54,Math.max(30,Math.round((W*H)/16000)));
  stars=[];
  for(let i=0;i<count;i++){
    const big=Math.random()<0.22;
    stars.push({
      x:Math.random()*W,
      y:Math.random()*H,
      vx:(Math.random()-0.5)*0.16,
      vy:(Math.random()-0.5)*0.16 - 0.04,
      bvx:0, bvy:0,
      r:big?(1.5+Math.random()*1.3):(0.7+Math.random()*1.0),
      phase:Math.random()*Math.PI*2,
      speed:0.008+Math.random()*0.014,
      sparkle:big
    });
  }
}

function resize(){
  if(!canvas)return;
  DPR=Math.min(window.devicePixelRatio||1,2);
  W=window.innerWidth;H=window.innerHeight;
  canvas.width=Math.floor(W*DPR);
  canvas.height=Math.floor(H*DPR);
  ctx.setTransform(DPR,0,0,DPR,0,0);
  if(!stars.length)initStars();
}

function impulse(cx,cy){
  if(!enabled||reduceMotion)return;
  ripples.push({x:cx,y:cy,r:8,maxR:Math.min(170,Math.max(110,W*0.26)),a:0.34});
  if(ripples.length>5)ripples.shift();
  for(let i=0;i<stars.length;i++){
    const s=stars[i],dx=s.x-cx,dy=s.y-cy,d=Math.hypot(dx,dy);
    if(d>1&&d<210){
      const f=(1-d/210)*1.35;
      s.bvx+=(dx/d)*f;
      s.bvy+=(dy/d)*f;
    }
  }
}

function drawStar4(x,y,r,col,a){
  ctx.save();
  ctx.translate(x,y);
  ctx.fillStyle='rgba('+col+','+a.toFixed(3)+')';
  ctx.beginPath();
  const o=r*2.2,inn=r*0.42;
  for(let i=0;i<8;i++){
    const ang=i*Math.PI/4,rad=(i%2===0)?o:inn;
    if(i===0)ctx.moveTo(Math.cos(ang)*rad,Math.sin(ang)*rad);
    else ctx.lineTo(Math.cos(ang)*rad,Math.sin(ang)*rad);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function step(){
  if(!running)return;
  ctx.clearRect(0,0,W,H);
  const pal=getPal();

  // Draw click/tap ripples
  for(let i=ripples.length-1;i>=0;i--){
    const rp=ripples[i];
    rp.r+=3.2;
    rp.a*=0.945;
    if(rp.a<0.01||rp.r>rp.maxR){ripples.splice(i,1);continue}
    ctx.beginPath();
    ctx.arc(rp.x,rp.y,rp.r,0,Math.PI*2);
    ctx.strokeStyle='rgba('+pal.ripple+','+(rp.a*pal.alpha*1.35).toFixed(3)+')';
    ctx.lineWidth=1.2;
    ctx.stroke();
  }

  // Draw & animate stars
  for(let i=0;i<stars.length;i++){
    const s=stars[i];
    s.phase+=s.speed;
    s.x+=s.vx+s.bvx;
    s.y+=s.vy+s.bvy;
    s.bvx*=0.93;
    s.bvy*=0.93;
    if(s.x<-12)s.x=W+12;
    if(s.x>W+12)s.x=-12;
    if(s.y<-12)s.y=H+12;
    if(s.y>H+12)s.y=-12;

    const tw=0.45+0.55*Math.sin(s.phase);
    const a=pal.alpha*tw;
    if(s.sparkle){
      drawStar4(s.x,s.y,s.r,pal.star,a);
    }else{
      ctx.beginPath();
      ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fillStyle='rgba('+pal.star+','+a.toFixed(3)+')';
      ctx.fill();
    }
  }
  raf=requestAnimationFrame(step);
}

function start(){
  if(running||!enabled||reduceMotion)return;
  running=true;
  raf=requestAnimationFrame(step);
}
function stop(){
  running=false;
  if(raf){cancelAnimationFrame(raf);raf=0}
  if(ctx)ctx.clearRect(0,0,W,H);
}

function setEnabled(v){
  enabled=!!v;
  if(canvas)canvas.style.display=enabled?'block':'none';
  if(enabled&&!document.hidden)start(); else stop();
}

function boot(){
  canvas=document.getElementById('zdBgCanvas');
  if(!canvas){
    canvas=document.createElement('canvas');
    canvas.id='zdBgCanvas';
    canvas.setAttribute('aria-hidden','true');
    document.body.insertBefore(canvas,document.body.firstChild);
  }
  ctx=canvas.getContext('2d');
  resize();
  window.addEventListener('resize',resize,{passive:true});
  window.addEventListener('pointerdown',e=>{
    if(e.clientX!=null)impulse(e.clientX,e.clientY);
  },{passive:true});
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden)stop(); else if(enabled)start();
  });
  const prefs=ZD.prefs?ZD.prefs():{};
  setEnabled(prefs.bgMotion!==false);
}

ZD.ambientBg={setEnabled,impulse};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);
else boot();
})();

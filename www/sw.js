/* Zikr Deen PWA service worker — app shell + runtime caching. Audio is stored by the app in IndexedDB, not here. */
'use strict';
const CACHE='zikr-deen-app-v46';
const scope=self.registration.scope;
const u=p=>new URL(p,scope).href;
const CORE=['./','index.html','manifest.webmanifest','css/app.css','js/data.js','js/mulk-data.js','js/core.js','js/app-i18n.js','js/player.js','js/views.js','js/mulk.js','js/ambient-bg.js','js/tasbih.js','js/extras.js','js/learning-hub.js','js/ui-premium.js','js/classroom.js','js/ar-mode.js','js/whatsapp-config.js','js/whatsapp-hub.js','js/interactive-motion.js','js/visual-academy.js','js/boot.js','fonts/Amiri-Regular.ttf','icons/icon-192.png','icons/icon-512.png','intro.html','js/folders.js','js/sound.js','js/daily.js','js/prayer.js','js/ask.js','js/qibla.js','js/namaz.js','js/namaz-data.js','js/hadith.js','js/ask-config.js','js/account-config.js','js/account.js','icons/bismillah-ink.png','icons/bismillah-time.png','icons/icon-maskable-192.png','icons/icon-maskable-512.png','icons/icon-maskable-180.png','audio/azan-intro.mp3'].map(u);
const EXTRA=['journey.html','namaz-3d.html'].map(u);
self.addEventListener('install',e=>{e.waitUntil((async()=>{const c=await caches.open(CACHE);await Promise.all(CORE.concat(EXTRA).map(x=>c.add(x).catch(()=>{})));await self.skipWaiting()})())});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);if(url.origin!==self.location.origin||/\.mp4$/i.test(url.pathname))return;
  if(req.mode==='navigate'){
    e.respondWith(fetch(req).then(r=>{if(r&&r.ok){const c=r.clone();caches.open(CACHE).then(ca=>ca.put(req,c))}return r}).catch(async()=>(await caches.match(req,{ignoreSearch:true}))||(await caches.match(u('index.html')))||(await caches.match(u('./')))));
    return;
  }
  /* code, styles, pages: network first (so updates show at once), cache as the offline fallback.
     fonts, icons and baked Quran data: cache first. */
  const heavy=/\.(ttf|png|jpg|webp|json|mp3)$/.test(url.pathname)&&!/manifest/.test(url.pathname);
  if(heavy){e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{if(r&&r.ok){const c=r.clone();caches.open(CACHE).then(ca=>ca.put(req,c))}return r})));return}
  e.respondWith(fetch(req).then(r=>{if(r&&r.ok){const c=r.clone();caches.open(CACHE).then(ca=>ca.put(req,c))}return r}).catch(()=>caches.match(req)));
});

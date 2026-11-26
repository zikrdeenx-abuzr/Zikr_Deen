/* Adds azan sound, Quran icon, fixed signing key and permissions to the generated android project. Safe to run many times. */
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),app=path.join(root,'android','app','src','main'),res=path.join(app,'res');
if(!fs.existsSync(app)){console.error('android folder nahi mila — pehle: npx cap add android');process.exit(1)}
const cp=(from,to)=>{fs.mkdirSync(path.dirname(to),{recursive:true});fs.copyFileSync(from,to)};
// 1) azan sound for the notification channel
cp(path.join(root,'native','azan.mp3'),path.join(res,'raw','azan.mp3'));console.log('azan.mp3 -> res/raw');
// 2) Quran launcher icon (legacy + round + adaptive)
const nres=path.join(root,'native','res'),bg=fs.readFileSync(path.join(root,'native','bgcolor.txt'),'utf8').trim();
fs.readdirSync(nres).forEach(d=>fs.readdirSync(path.join(nres,d)).forEach(f=>cp(path.join(nres,d,f),path.join(res,d,f))));
fs.mkdirSync(path.join(res,'values'),{recursive:true});
fs.writeFileSync(path.join(res,'values','ic_launcher_background.xml'),'<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">'+bg+'</color>\n</resources>\n');
const adaptive='<?xml version="1.0" encoding="utf-8"?>\n<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n    <background android:drawable="@color/ic_launcher_background"/>\n    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>\n</adaptive-icon>\n';
['ic_launcher.xml','ic_launcher_round.xml'].forEach(f=>{fs.mkdirSync(path.join(res,'mipmap-anydpi-v26'),{recursive:true});fs.writeFileSync(path.join(res,'mipmap-anydpi-v26',f),adaptive)});
console.log('Quran icon installed');
// 3) launch screen: plain Quran-green instead of the Capacitor logo
const st=path.join(res,'values','styles.xml');
if(fs.existsSync(st)){let s=fs.readFileSync(st,'utf8');if(s.includes('@drawable/splash')){s=s.split('@drawable/splash').join('@color/ic_launcher_background');fs.writeFileSync(st,s);console.log('splash -> green')}}
// 4) permissions
const mf=path.join(app,'AndroidManifest.xml');let x=fs.readFileSync(mf,'utf8');
const need=['android.permission.POST_NOTIFICATIONS','android.permission.SCHEDULE_EXACT_ALARM','android.permission.RECEIVE_BOOT_COMPLETED','android.permission.VIBRATE','android.permission.WAKE_LOCK','android.permission.CAMERA','android.permission.RECORD_AUDIO','android.permission.MODIFY_AUDIO_SETTINGS','android.permission.ACCESS_COARSE_LOCATION','android.permission.ACCESS_FINE_LOCATION'];
let add='';need.forEach(p=>{if(!x.includes(p))add+='    <uses-permission android:name="'+p+'" />\n'});
if(add){x=x.replace(/(\s*)<\/manifest>/,'\n'+add+'</manifest>');fs.writeFileSync(mf,x);console.log('permissions added')}else console.log('permissions already present');
if(!x.includes('android.hardware.camera')){x=x.replace(/(\s*)<\/manifest>/,'\n    <uses-feature android:name="android.hardware.camera" android:required="false" />\n</manifest>');fs.writeFileSync(mf,x);}
// 5) fixed signing key, so a new APK installs OVER the old one (keeps your data) — same key every build
const gr=path.join(root,'android','app','build.gradle');
if(fs.existsSync(gr)){let g=fs.readFileSync(gr,'utf8');
  const code = process.env.ZD_VERSION_CODE || '46';
  if (!/^[1-9]\d*$/.test(code) || Number(code) > 2100000000) throw new Error('Invalid ZD_VERSION_CODE');
  g = g.replace(/^(\s*versionCode\s+)\d+/m, (_, prefix) => prefix + code)
       .replace(/^(\s*versionName\s+)"[^"]*"/m, '$1"1.0.46"');
  fs.writeFileSync(gr,g);
  if(fs.existsSync(path.join(root,'native','zikr.keystore')) && !g.includes('zikr.keystore')){g+='\n// Zikr Deen: fixed debug key (same on every build)\nandroid {\n    signingConfigs {\n        debug {\n            storeFile file("../../native/zikr.keystore")\n            storePassword "android"\n            keyAlias "zikr"\n            keyPassword "android"\n        }\n    }\n}\n';fs.writeFileSync(gr,g);console.log('fixed signing key set')}}

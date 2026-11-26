/* One command: node scripts/setup.js   (needs Node 18+ and internet, run once on your PC) */
const {execSync}=require('child_process'),fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const run=c=>{console.log('\n> '+c);execSync(c,{cwd:root,stdio:'inherit'})};
run('npm install');
if(!fs.existsSync(path.join(root,'android')))run('npx cap add android');
run('node scripts/patch-android.js');
run('npx cap sync android');
console.log('\nTaiyar! Ab Android Studio kholein:  npx cap open android\nphir  Build > Build Bundle(s) / APK(s) > Build APK(s)');

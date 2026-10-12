// Проверка переводов: каждый язык содержит каждый ключ, плейсхолдеры совпадают, нет пустых строк и забытого русского
const fs=require('fs'),path=require('path'); const D=path.join(__dirname,'..');
const keys=JSON.parse(fs.readFileSync(D+'/i18n/keys.json','utf8')); const ids=Object.keys(keys);
global.localStorage=undefined; require(D+'/js/i18n.js'); const LANGS=NFM_I18N.LANGS.map(x=>x[0]).filter(l=>l!=='ru');
// ключи в коде совпадают с keys.json
const {execSync}=require('child_process'); const cur=execSync('node '+D+'/tools/i18n-keys.js',{encoding:'utf8'}); const now=JSON.parse(fs.readFileSync(D+'/i18n/keys.json','utf8'));
let bad=0; const err=m=>{ bad++; if(bad<60)console.log('✗',m); };
if(Object.keys(now).join()!==ids.join()) err('keys.json устарел — запустите tools/i18n-keys.js и обновите переводы');
const master=fs.readFileSync(D+'/i18n/master.txt','utf8').trim().split('\n'); if(master.join()!==ids.join()) err('master.txt не совпадает с keys.json');
const ph=s=>(s.match(/\{\d+\}/g)||[]).sort().join(',');
const CY=/[А-Яа-яЁёЇїІіЄєҐґ]/;
for(const l of LANGS){ const file=D+'/i18n/'+l+'.js'; if(!fs.existsSync(file)){ err(l+': нет файла'); continue; }
 let d=null; global.NFM_LANG=x=>d=x; eval(fs.readFileSync(file,'utf8'));
 let miss=0; for(const id of ids){ const v=d[id]; if(v==null||!String(v).trim()){ miss++; err(l+': нет ключа '+id+' «'+keys[id]+'»'); continue; }
  if(ph(v)!==ph(keys[id])) err(l+': плейсхолдеры '+id+' «'+keys[id]+'» → «'+v+'»');
  if(l!=='uk'&&CY.test(v)) err(l+': кириллица в '+id+' «'+v+'»'); }
 for(const c of ['ENG','SCO','WAL','NIR','CD','CG']) if(!d['c_'+c]) err(l+': нет названия страны '+c);
 const extra=Object.keys(d).filter(k=>!keys[k]&&!k.startsWith('c_')); if(extra.length) err(l+': лишние ключи '+extra.length);
 console.log(l, miss?('нет '+miss):'OK', Object.keys(d).length); }
console.log(bad?('ОШИБОК: '+bad):'i18n OK — '+LANGS.length+' языков × '+ids.length+' ключей'); process.exit(bad?1:0);

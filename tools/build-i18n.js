// i18n/src/<lang>.txt ("индекс|перевод", индекс — строка в i18n/master.txt; c_XX — названия стран) → i18n/<lang>.js
const fs=require('fs'),path=require('path'); const D=path.join(__dirname,'..');
const ids=fs.readFileSync(D+'/i18n/master.txt','utf8').trim().split('\n');
const parse=l=>{ const o={}; for(const line of fs.readFileSync(D+'/i18n/src/'+l+'.txt','utf8').split('\n')){ if(!line.trim())continue; const i=line.indexOf('|'); const k=line.slice(0,i), v=line.slice(i+1); const id=/^\d+$/.test(k)?ids[+k]:k; if(id===undefined)throw new Error(l+': bad index '+k); if(o[id]!==undefined)throw new Error(l+': duplicate '+k); o[id]=v; } return o; };
const ids6=fs.existsSync(D+'/i18n/master6.txt')?fs.readFileSync(D+'/i18n/master6.txt','utf8').trim().split('\n'):[];
// обновление 6: i18n/src6/<lang>.txt — построчно в порядке i18n/master6.txt
const parse6=l=>{ const f=D+'/i18n/src6/'+l+'.txt'; if(!fs.existsSync(f)) return {}; const L=fs.readFileSync(f,'utf8').replace(/\n$/,'').split('\n'); if(L.length!==ids6.length) throw new Error(l+': src6 lines '+L.length+' != '+ids6.length); const o={}; L.forEach((v,i)=>o[ids6[i]]=v); return o; };
module.exports={parse,ids,ids6};
if(require.main===module){ for(const f of fs.readdirSync(D+'/i18n/src')){ const l=f.replace('.txt',''); const keys=JSON.parse(fs.readFileSync(D+'/i18n/keys.json','utf8')); const all={...parse(l),...parse6(l)}; const o={}; for(const k in all) if(keys[k]||k.startsWith('c_')) o[k]=all[k]; fs.writeFileSync(D+'/i18n/'+l+'.js','NFM_LANG('+JSON.stringify(o)+');\n'); console.log(l,Object.keys(o).length); } }

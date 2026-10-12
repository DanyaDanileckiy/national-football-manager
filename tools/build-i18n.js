// i18n/src/<lang>.txt ("индекс|перевод", индекс — строка в i18n/master.txt; c_XX — названия стран) → i18n/<lang>.js
const fs=require('fs'),path=require('path'); const D=path.join(__dirname,'..');
const ids=fs.readFileSync(D+'/i18n/master.txt','utf8').trim().split('\n');
const parse=l=>{ const o={}; for(const line of fs.readFileSync(D+'/i18n/src/'+l+'.txt','utf8').split('\n')){ if(!line.trim())continue; const i=line.indexOf('|'); const k=line.slice(0,i), v=line.slice(i+1); const id=/^\d+$/.test(k)?ids[+k]:k; if(id===undefined)throw new Error(l+': bad index '+k); if(o[id]!==undefined)throw new Error(l+': duplicate '+k); o[id]=v; } return o; };
module.exports={parse,ids};
if(require.main===module){ for(const f of fs.readdirSync(D+'/i18n/src')){ const l=f.replace('.txt',''); const o=parse(l); fs.writeFileSync(D+'/i18n/'+l+'.js','NFM_LANG('+JSON.stringify(o)+');\n'); console.log(l,Object.keys(o).length); } }

// Собирает все ключи _t("...") из js/*.js → i18n/keys.json; сообщает о русских строках вне _t
const fs=require('fs'),path=require('path'); let acorn; try{acorn=require('acorn');}catch(e){acorn=require('/tmp/i18n/node_modules/acorn');}
const D=path.join(__dirname,'..'); const CY=/[А-Яа-яЁё]/; const keys=new Map(); const stray=[];
const hash=s=>{ let h=0x811c9dc5; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,0x01000193)>>>0; } return h.toString(36); };
for(const f of fs.readdirSync(D+'/js').filter(f=>f.endsWith('.js'))){ const src=fs.readFileSync(D+'/js/'+f,'utf8'); const ast=acorn.parse(src,{ecmaVersion:'latest'});
 (function walk(n,p){ if(!n||typeof n.type!=='string')return;
  if(n.type==='CallExpression'&&n.callee.type==='Identifier'&&n.callee.name==='_t'&&n.arguments[0]&&n.arguments[0].type==='Literal'){ const k=n.arguments[0].value; if(!keys.has(k))keys.set(k,f); }
  else if(n.type==='Literal'&&typeof n.value==='string'&&CY.test(n.value)&&!(p&&p.type==='CallExpression'&&p.callee.name==='_t')) stray.push(f+': '+n.value.slice(0,60));
  else if(n.type==='TemplateElement'&&CY.test(n.value.cooked)&&!/\|\d+\|/.test(n.value.cooked)) stray.push(f+': `'+n.value.cooked.slice(0,60));
  for(const k in n){ const v=n[k]; if(Array.isArray(v))v.forEach(x=>walk(x,n)); else if(v&&typeof v.type==='string')walk(v,n); } })(ast,null); }
const out={}; const ids=new Set(); for(const [k] of keys){ const id=hash(k); if(ids.has(id))throw new Error('collision '+k); ids.add(id); out[id]=k; }
fs.writeFileSync(D+'/i18n/keys.json',JSON.stringify(out,null,0));
console.log('keys',keys.size); if(stray.length)console.log('вне _t:\n'+stray.join('\n'));

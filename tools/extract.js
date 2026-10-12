// Одноразовый перевод исходников на _t(): находит русские строки и заменяет их вызовами.
const fs=require('fs'),acorn=require('/tmp/i18n/node_modules/acorn');
const CY=/[А-Яа-яЁё]/;
const files=process.argv.slice(2);
const keys=new Map(); const warn=[];
function addKey(k,f){ if(!keys.has(k))keys.set(k,new Set()); keys.get(k).add(f); }
for(const f of files){
 const src=fs.readFileSync(f,'utf8');
 const ast=acorn.parse(src,{ecmaVersion:'latest',sourceType:'script'});
 // родители
 (function par(n,p){ n._p=p; for(const k in n){ if(k==='_p')continue; const v=n[k]; if(Array.isArray(v))v.forEach(x=>x&&typeof x.type==='string'&&par(x,n)); else if(v&&typeof v.type==='string')par(v,n);} })(ast,null);
 const isStr=n=>n.type==='Literal'&&typeof n.value==='string';
 const isTpl=n=>n.type==='TemplateLiteral';
 const skipNode=n=>isTpl(n)&&n.quasis.some(q=>/\|\d+\|/.test(q.value.raw));
 const hasCy=n=>(isStr(n)&&CY.test(n.value))||(isTpl(n)&&!skipNode(n)&&n.quasis.some(q=>CY.test(q.value.cooked)));
 const isPlus=n=>n.type==='BinaryExpression'&&n.operator==='+';
 function leaves(n){ return isPlus(n)?leaves(n.left).concat([n.right]):[n]; }
 const inT=n=>{ const p=n._p; return p&&p.type==='CallExpression'&&p.callee.type==='Identifier'&&p.callee.name==='_t'; };
 function cand(n){
  if(inT(n))return false;
  if(isStr(n)&&CY.test(n.value)){ const p=n._p; if(p&&p.type==='Property'&&p.key===n&&!p.computed)return false; if(p&&isPlus(p)&&p.left===n)return false; if(p&&isPlus(p))return false; if(p&&p.type==='BinaryExpression'&&/[=!]=/.test(p.operator)){warn.push(f+': cmp '+n.value);return false;} return true; }
  if(hasCy(n)){ const p=n._p; if(p&&isPlus(p))return false; return true; }
  if(isPlus(n)){ const p=n._p; if(p&&isPlus(p)&&p.left===n)return false; return leaves(n).some(hasCy); }
  return false;
 }
 function kids(n){ const out=[]; for(const k in n){ if(k==='_p')continue; const v=n[k]; if(Array.isArray(v))v.forEach(x=>x&&typeof x.type==='string'&&out.push(x)); else if(v&&typeof v.type==='string')out.push(v);} return out.sort((a,b)=>a.start-b.start); }
 function emit(n){ if(cand(n))return handle(n); const roots=[]; (function col(x){ for(const c of kids(x)){ if(cand(c))roots.push(c); else col(c);} })(n); let s='',pos=n.start; for(const r of roots){ s+=src.slice(pos,r.start)+emit(r); pos=r.end;} return s+src.slice(pos,n.end); }
 const tplEsc=s=>s.replace(/\\/g,'\\\\').replace(/`/g,'\\`').replace(/\$\{/g,'\\${');
 function stream(n){ // элементы: {t:cooked,r:raw} | {e:code}
  const it=[];
  const addN=x=>{ if(isStr(x))it.push({t:x.value,r:tplEsc(x.value)}); else if(isTpl(x)&&!skipNode(x)){ x.quasis.forEach((q,i)=>{ it.push({t:q.value.cooked,r:q.value.raw}); if(i<x.expressions.length)it.push({e:emit(x.expressions[i])}); }); } else it.push({e:'('+emit(x)+')'}); };
  if(isPlus(n)){ const L=leaves(n); let k=0; while(k<L.length&&!(isStr(L[k])||isTpl(L[k])))k++;
   if(k>=2){ // числовой префикс
    let pre=n; for(let i=0;i<L.length-k;i++)pre=pre.left; it.push({e:'('+emit(pre)+')'}); L.splice(0,k); }
   L.forEach(addN);
  } else addN(n);
  return it;
 }
 function handle(n){
  const it=stream(n);
  // разбиение текста на символы с признаком тега
  const seq=[]; let inTag=false, q=null;
  for(const x of it){ if(x.e!==undefined){ seq.push({e:x.e,tag:inTag}); continue; }
   // идём по cooked и raw параллельно невозможно — работаем по cooked, raw заново экранируем
   for(const ch of x.t){ if(!inTag&&ch==='<'){inTag=true;seq.push({c:ch,tag:true});continue;} if(inTag){ if(q){ if(ch===q)q=null; } else if(ch==='"'||ch==="'")q=ch; else if(ch==='>'){inTag=false;seq.push({c:ch,tag:true});continue;} seq.push({c:ch,tag:true,q:!!q}); continue;} seq.push({c:ch,tag:false}); }
  }
  // атрибуты с кириллицей внутри тега: выделить отрезки q-символов
  const out=[]; // {raw} | {e} | {ph:[...]}
  let i=0;
  while(i<seq.length){
   const s=seq[i];
   if(s.tag){ if(s.q&&s.c!==undefined){ let j=i; while(j<seq.length&&seq[j].tag&&seq[j].q&&seq[j].c!==undefined)j++; const seg=seq.slice(i,j); if(seg.some(z=>CY.test(z.c))){out.push({ph:seg});} else seg.forEach(z=>out.push({raw:z.c})); i=j; continue;} out.push(s.e!==undefined?{e:s.e}:{raw:s.c}); i++; continue; }
   let j=i; while(j<seq.length&&!seq[j].tag)j++;
   const run=seq.slice(i,j); i=j;
   // ядро: от первой до последней кириллицы, расширяем пробелами/выражениями/знаками внутри
   const cyIdx=run.map((z,k)=>z.c!==undefined&&CY.test(z.c)?k:-1).filter(k=>k>=0);
   if(!cyIdx.length){ run.forEach(z=>out.push(z.e!==undefined?{e:z.e}:{raw:z.c})); continue; }
   let a=cyIdx[0], b=cyIdx[cyIdx.length-1];
   // расширение влево: выражения, отделённые только пробелами, и слова/цифры
   const word=z=>z.c!==undefined&&/[\p{L}\p{N}]/u.test(z.c);
   const grow=(dir)=>{ for(;;){ let k=dir<0?a-1:b+1, sp=0; while(k>=0&&k<run.length&&run[k].c!==undefined&&/[ \u00a0]/.test(run[k].c)){k+=dir;sp++;}
     if(k<0||k>=run.length)return; const z=run[k];
     if(z.e!==undefined||word(z)||(dir>0&&/[.!?…»)%]/.test(z.c)&&sp===0)||(dir<0&&/[«(№]/.test(z.c)&&sp===0)||(z.c==='-'&&sp===0)){ if(dir<0)a=k; else b=k; } else return; } };
   grow(-1); grow(1);
   run.slice(0,a).forEach(z=>out.push(z.e!==undefined?{e:z.e}:{raw:z.c}));
   out.push({ph:run.slice(a,b+1)});
   run.slice(b+1).forEach(z=>out.push(z.e!==undefined?{e:z.e}:{raw:z.c}));
  }
  const phCode=ph=>{ let k='',args=[]; for(const z of ph){ if(z.e!==undefined){k+='{'+args.length+'}';args.push(z.e);} else k+=z.c; } addKey(k,f); return '_t('+JSON.stringify(k)+(args.length?','+args.join(','):'')+')'; };
  if(out.length===1&&out[0].ph)return phCode(out[0].ph);
  let code='`'; for(const o of out){ if(o.ph)code+='${'+phCode(o.ph)+'}'; else if(o.e!==undefined)code+='${'+o.e+'}'; else code+=tplEsc(o.raw); } return code+'`';
 }
 const res=emit(ast);
 if(process.env.WRITE)fs.writeFileSync(f,res);
}
fs.writeFileSync('/tmp/i18n/keys.json',JSON.stringify([...keys].map(([k,v])=>[k,[...v].join(',')]),null,0));
console.log('keys',keys.size,'chars',[...keys.keys()].join('').length); console.log(warn.join('\n'));

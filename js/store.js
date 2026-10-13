// Хранилище сохранений: IndexedDB + gzip (CompressionStream), запасной вариант — localStorage + LZW
(function(){ const N=globalThis.NFM=globalThis.NFM||{};
 const hasIDB=typeof indexedDB!=='undefined', hasCS=typeof CompressionStream!=='undefined';
 let dbp=null; const db=()=>dbp||(dbp=new Promise((ok,no)=>{ const r=indexedDB.open('nfm',1); r.onupgradeneeded=()=>r.result.createObjectStore('s'); r.onsuccess=()=>ok(r.result); r.onerror=()=>no(r.error); }));
 const tx=(mode,fn)=>db().then(d=>new Promise((ok,no)=>{ const t=d.transaction('s',mode); const st=t.objectStore('s'); const q=fn(st); t.oncomplete=()=>ok(q&&q.result); t.onerror=()=>no(t.error); }));
 const gz=async s=>new Response(new Blob([s]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer();
 const gunz=async b=>new Response(new Blob([b]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
 // v10.1: компактный формат без потерь — игроки и матчи хранятся таблицей (ключи один раз), повторяющиеся строки — словарём,
 // имена авторов голов и подписи стадий восстанавливаются из игроков и ключей перевода, история рейтинга ФИФА — индексами и разностями
 const packL=(arr)=>{ const ks=[],ix={}; for(const o of arr) for(const k in o) if(k[0]!=='_'&&o[k]!==undefined&&ix[k]===undefined){ ix[k]=ks.length; ks.push(k); }
  const v=arr.map(o=>{ const r=new Array(ks.length+1); const miss=[]; for(let i=0;i<ks.length;i++){ const x=o[ks[i]]; if(x===undefined){ r[i+1]=0; miss.push(i); } else r[i+1]=x; } r[0]=miss.length?miss:0; return r; });
  const d={}; for(let i=0;i<ks.length;i++){ const seen=new Map(); let ok=true, n=0; for(const r of v){ if(r[0]&&r[0].includes(i)) continue; const x=r[i+1]; if(typeof x!=='string'){ ok=false; break; } n++; if(!seen.has(x)) seen.set(x,seen.size); }
   if(ok&&n>20&&seen.size*3<n){ d[i]=[...seen.keys()]; for(const r of v){ if(r[0]&&r[0].includes(i)) continue; r[i+1]=seen.get(r[i+1]); } } }
  return {k:ks,v,d}; };
 const unpackL=(pk)=>pk.v.map(r=>{ const o={}; const ms=r[0]?new Set(r[0]):null; for(let i=0;i<pk.k.length;i++) if(!ms||!ms.has(i)){ const dd=pk.d&&pk.d[i]; o[pk.k[i]]=dd?dd[r[i+1]]:r[i+1]; } return o; });
 const tr=globalThis._t||(k=>k); const stOf=f=>{ try{ return tr(f.sk[0],...f.sk[1]); }catch(e){ return null; } };
 N.pack=S=>{ if(!S||!S.P||!S.F) return S; const o=Object.assign({},S); delete o.P; delete o.F;
  o.PK=packL(Object.values(S.P).map(p=>{ if(p.sn&&p.n&&p.sn===p.n.split(' ').pop()){ const c=Object.assign({},p); delete c.sn; c.sn_=1; return c; } return p; }));
  const rr=S.F.map(f=>{ if(!f.r) return {}; const r=f.r; if(!r.sc||!r.sc.length) return r; const c=Object.assign({},r); c.sc=r.sc.map(x=>{ const p=S.P[x[0]]; return p&&p.n===x[1]?[x[0],0,...x.slice(2)]:x; }); return c; });
  const rs=packL(rr); o.FK=packL(S.F.map((f,i)=>{ const c=Object.assign({},f); if(f.r) c.r=rs.v[i]; if(f.sk&&f.st!=null&&stOf(f)===f.st){ delete c.st; } return c; })); o.RK=rs.k; o.RD=rs.d;
  if(S.rkH&&S.rkH.length){ const C=Object.keys(S.T), ci={}; C.forEach((c,i)=>ci[c]=i); if(S.rkH.every(h=>h.o&&h.o.split(',').every(c=>ci[c]!==undefined))){
   o.rkC=C; o.rkH=S.rkH.map(h=>{ const e=Object.assign({},h); e.o=h.o.split(',').map(c=>ci[c].toString(36).padStart(2,'0')).join(''); e.oz=1;
    if(h.p){ const q=h.p.split(',').map(Number); if(q.every(Number.isInteger)){ e.p=q.map((v,i)=>i?q[i-1]-v:v).join(','); e.pz=1; } } return e; }); } }
  return o; };
 N.unpack=L=>{ if(!L||!L.PK) return L; L.P={}; for(const p of unpackL(L.PK)){ if(p.sn_){ delete p.sn_; p.sn=p.n.split(' ').pop(); } L.P[p.id]=p; } delete L.PK;
  if(L.FK){ const rk={k:L.RK||[],d:L.RD||{}}; L.F=unpackL(L.FK).map(f=>{ if(Array.isArray(f.r)){ rk.v=[f.r]; f.r=unpackL(rk)[0]; if(f.r.sc) f.r.sc=f.r.sc.map(x=>x[1]===0&&L.P[x[0]]?[x[0],L.P[x[0]].n,...x.slice(2)]:x); } if(f.sk&&f.st===undefined){ const s=stOf(f); if(s!=null) f.st=s; } return f; }); delete L.FK; delete L.RK; delete L.RD; }
  if(L.rkC&&L.rkH){ const C=L.rkC; L.rkH=L.rkH.map(e=>{ const h=Object.assign({},e); if(e.oz){ const a=[]; for(let i=0;i<e.o.length;i+=2) a.push(C[parseInt(e.o.slice(i,i+2),36)]); h.o=a.join(','); delete h.oz; }
   if(e.pz){ const q=e.p.split(',').map(Number); for(let i=1;i<q.length;i++) q[i]=q[i-1]-q[i]; h.p=q.join(','); delete h.pz; } return h; }); delete L.rkC; }
  return L; };
 const json=S=>JSON.stringify(N.pack(S),(k,v)=>k[0]==='_'?undefined:v);
 N.Store={
  async put(slot,S){ const s=json(S); if(hasIDB&&hasCS){ const b=await gz(s); await tx('readwrite',st=>st.put(b,'s'+slot)); try{localStorage.removeItem('nfm_s'+slot);}catch(e){} return b.byteLength; }
   const z=N.serialize(S); localStorage.setItem('nfm_s'+slot,z); return z.length*2; },
  async get(slot){ if(hasIDB&&hasCS){ try{ const b=await tx('readonly',st=>st.get('s'+slot)); if(b) return N.unpack(JSON.parse(await gunz(b))); }catch(e){ console.warn(e); } }
   const s=localStorage.getItem('nfm_s'+slot); return s?N.deserialize(s):null; },
  async del(slot){ try{localStorage.removeItem('nfm_s'+slot);}catch(e){} if(hasIDB) try{ await tx('readwrite',st=>st.delete('s'+slot)); }catch(e){} }
 };
 N.idle=(fn,t=300)=>(globalThis.requestIdleCallback?requestIdleCallback(fn,{timeout:t}):setTimeout(fn,0));
})();

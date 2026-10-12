// Хранилище сохранений: IndexedDB + gzip (CompressionStream), запасной вариант — localStorage + LZW
(function(){ const N=globalThis.NFM=globalThis.NFM||{};
 const hasIDB=typeof indexedDB!=='undefined', hasCS=typeof CompressionStream!=='undefined';
 let dbp=null; const db=()=>dbp||(dbp=new Promise((ok,no)=>{ const r=indexedDB.open('nfm',1); r.onupgradeneeded=()=>r.result.createObjectStore('s'); r.onsuccess=()=>ok(r.result); r.onerror=()=>no(r.error); }));
 const tx=(mode,fn)=>db().then(d=>new Promise((ok,no)=>{ const t=d.transaction('s',mode); const st=t.objectStore('s'); const q=fn(st); t.oncomplete=()=>ok(q&&q.result); t.onerror=()=>no(t.error); }));
 const gz=async s=>new Response(new Blob([s]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer();
 const gunz=async b=>new Response(new Blob([b]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
 const json=S=>JSON.stringify(S,(k,v)=>k[0]==='_'?undefined:v);
 N.Store={
  async put(slot,S){ const s=json(S); if(hasIDB&&hasCS){ const b=await gz(s); await tx('readwrite',st=>st.put(b,'s'+slot)); try{localStorage.removeItem('nfm_s'+slot);}catch(e){} return b.byteLength; }
   const z=N.serialize(S); localStorage.setItem('nfm_s'+slot,z); return z.length*2; },
  async get(slot){ if(hasIDB&&hasCS){ try{ const b=await tx('readonly',st=>st.get('s'+slot)); if(b) return JSON.parse(await gunz(b)); }catch(e){ console.warn(e); } }
   const s=localStorage.getItem('nfm_s'+slot); return s?N.deserialize(s):null; },
  async del(slot){ try{localStorage.removeItem('nfm_s'+slot);}catch(e){} if(hasIDB) try{ await tx('readwrite',st=>st.delete('s'+slot)); }catch(e){} }
 };
 N.idle=(fn,t=300)=>(globalThis.requestIdleCallback?requestIdleCallback(fn,{timeout:t}):setTimeout(fn,0));
})();

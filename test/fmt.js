// Проверка форматов: node test/fmt.js — один цикл, двойные даты, состав ЧМ, Лиги наций
require('../js/data.js');require('../js/names.js');require('../js/core.js');require('../js/comps.js');require('../js/match.js');
const N=NFM; const S=N.newGame(process.argv[2]||'FR','Т'); N.setS(S); const snaps={};
const _ce=N.evCycle; let fixAll=[]; N.evCycle=(e)=>{ snaps.C=JSON.parse(JSON.stringify(S.C)); snaps.F=S.F.slice(); snaps.nl=JSON.parse(JSON.stringify(S.nl)); _ce(e); };
let r; do{ r=N.advance({autoUser:true,until:'2030-08-02'}); }while(r.stop!=='until'&&r.stop!=='end'&&r.stop!=='guard');
const C=snaps.C, F=snaps.F; let bad=0;
for(const c of Object.values(C)) if(c.kind!=='fr'&&c.stage!=='done'){ console.log('НЕ ЗАВЕРШЁН',c.id,c.stage); bad++; }
const dd={}; for(const f of F){ for(const t of [f.h,f.a]){ const k=t+f.d; if(dd[k]){console.log('ДВА МАТЧА В ДЕНЬ',t,f.d,dd[k],f.c); bad++;} dd[k]=f.c; } }
const wc=C.WC_2026; const by={}; wc.teams.forEach(t=>by[S.T[t].conf]=(by[S.T[t].conf]||0)+1); console.log('ЧМ',wc.teams.length,JSON.stringify(by),'хозяин',S.T[wc.host].n);
const cnt={}; for(const f of F){ if(!f.r||f.c==='FR')continue; const c=C[f.c]; if(!c)continue; cnt[c.conf]=cnt[c.conf]||{}; const k=f.d.slice(0,7); cnt[c.conf][k]=(cnt[c.conf][k]||0)+1; }
for(const k in cnt) console.log(k, Object.keys(cnt[k]).sort().join(' '));
for(const id of ['WQ_UPO_2026','EPO_2026','WQ_IC_2026','UNLQF_2026','UNLPO_2026','WQ_AFC1_2026']){ const c=C[id]; console.log(id, c.ko.map(rd=>rd.map(t=>{const f=F.find(x=>x.id===t.f); const l=t.f1&&F.find(x=>x.id===t.f1); return S.T[t.h].n+'-'+S.T[t.a].n+' '+(l?l.r.hg+':'+l.r.ag+','+f.r.ag+':'+f.r.hg+(f.r.agg?'(сум '+f.r.agg+')':''):f.r.hg+':'+f.r.ag)+(f.r.pen?' пен':f.r.et?' дв':'')+' →'+S.T[t.w].n}).join('; ')).join(' || ')); }
console.log('ЛН УЕФА A:',snaps.nl.UEFA.cur.A.map(t=>t).join(','),'ходы',JSON.stringify(snaps.nl.UEFA.hist.map(h=>h.mv.length)));
const nlA0=C.UNLA_2026.teams, nlA1=C.UNLA_2028.teams; console.log('смена состава A: ушли',nlA0.filter(t=>!nlA1.includes(t)).join(','),'пришли',nlA1.filter(t=>!nlA0.includes(t)).join(','));
console.log(bad?'ОШИБОК '+bad:'OK');
for(const id of ['WQ_CCF2_2026','WQ_CONCACAF_2026','WQ_AFC_2026','WQ_AFC4_2026','WQ_CAF_2026','WQ_UEFA_2026','EQ_2026']){ const c=C[id]; console.log(id,'команд',c.teams.length,'групп',c.groups.length,c.groups.map(g=>g.t.length).join(''),'путёвок',(c.q||[]).length,'byeL',(c.byeL||[]).length); }
const src=wc.src.map(s=>s.q||s.w||s.top); console.log(src.join(' '));

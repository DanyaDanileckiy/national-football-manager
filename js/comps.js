// Турниры: групповые этапы, плей-офф (в т.ч. двухматчевые), стыки, Лиги наций с повышением/понижением, 4-летний календарь
(function(){
const N = globalThis.NFM;
const {R,cl,ri,pick,shuffle}=N; const G=()=>N.getS();
const WIN=N.WIN; const wd=(list)=>list.flatMap(([y,m])=>WIN[m].map(d=>N.ds(y,m,d)));
const elo=c=>G().T[c].elo; const pts=c=>{ const t=G().T[c]; return t.pts??t.elo; };
// ---------- группы ----------
function makeGroups(teams,maxSize,nGroups,start=0,opt={}){ const S=G(); const sorted=teams.slice().sort((a,b)=>pts(b)-pts(a)); const host=opt.host&&sorted.includes(opt.host)?opt.host:null;
 if(host){ sorted.splice(sorted.indexOf(host),1); sorted.unshift(host); } const g=nGroups||Math.ceil(sorted.length/maxSize);
 const conf=t=>S.T[t].conf; const capOf=k=>k==='UEFA'?2:1; const pots=[]; for(let i=0;i<sorted.length;i+=g) pots.push(sorted.slice(i,i+g));
 for(let tries=0;tries<(opt.cap?80:1);tries++){ const Gs=Array.from({length:g},(_,i)=>({n:String.fromCharCode(65+start+i),t:[]})); const log=[]; let ok=true;
  for(let pi=0;pi<pots.length&&ok;pi++){ const pot=shuffle(pots[pi].slice()); if(pi===0&&host){ pot.splice(pot.indexOf(host),1); pot.unshift(host); }
   const used=new Set(), res=[]; let nodes=0;
   const okc=(t,k)=>!opt.cap||Gs[k].t.filter(x=>conf(x)===conf(t)).length<capOf(conf(t));
   const dfs=(i)=>{ if(i===pot.length) return true; if(++nodes>20000) return false; const t=pot[i]; const cand=(pi===0&&host===t)?[0]:shuffle(Gs.map((_,k)=>k)).filter(k=>Gs[k].t.length===pi&&!used.has(k)&&okc(t,k)).sort((x,y)=>x-y);
    // жеребьёвка как в реальности: первая допустимая группа по алфавиту, с проверкой, что остальные команды корзины можно разместить
    for(const k of cand){ used.add(k); res[i]=k; if(dfs(i+1)) return true; used.delete(k); } return false; };
   if(!dfs(0)){ ok=false; break; }
   pot.forEach((t,i)=>{ Gs[res[i]].t.push(t); log.push([pi,t,Gs[res[i]].n]); }); }
  if(ok){ Gs.log=log; Gs.pots=pots; return Gs; } }
 return makeGroups(teams,maxSize,nGroups,start,{host:opt.host}); }
N.makeGroups=makeGroups;
function rr(teams,double){ const a=shuffle(teams.slice()); if(a.length%2)a.push(null); const n=a.length, rounds=[];
 for(let r=0;r<n-1;r++){ const rd=[]; for(let i=0;i<n/2;i++){ const h=a[i],w=a[n-1-i]; if(h&&w) rd.push((r+i)%2?[w,h]:[h,w]); } rounds.push(rd); a.splice(1,0,a.pop()); }
 if(double) return rounds.concat(rounds.map(rd=>rd.map(([h,w])=>[w,h]))); return rounds; }
N.rr=rr;
N.addFix=(d,c,h,a,st,x={})=>{ const S=G(); const f={id:S.nfid++,d,c,h,a,st,...x}; const C=S.C[c]; if(C&&C.quick) f.y=1; S.F.push(f); return f; };
N.drawComp=(c,teams,parts)=>{ const S=G();
 parts = parts || [{t:teams,gsize:c.gsize||4,ng:c.ng,gd:c.gd}];
 c.groups=[]; c.drawLog=null; c.pots=null; for(const p of parts){ if(!p.t.length)continue; const gs= c.league? [{n:'',t:p.t.slice()}] : makeGroups(p.t,p.gsize||4,p.ng,c.groups.length,{host:c.host,cap:c.conf==='ALL'}); if(gs.log){ c.drawLog=(c.drawLog||[]).concat(gs.log); c.pots=(c.pots||[]).concat([gs.pots]); } gs.forEach(g=>g.gd=p.gd); c.groups.push(...gs); }
 if(c.host&&c.groups.length>1){ const gA=c.groups[0]; if(!gA.t.includes(c.host)){ const g=c.groups.find(g=>g.t.includes(c.host)); if(g){ const sw=gA.t[0]; g.t[g.t.indexOf(c.host)]=sw; gA.t[0]=c.host; } } }
 for(const g of c.groups){ const rounds=rr(g.t,c.rr!==1); const gd=g.gd||c.gd; if(rounds.length>gd.length) console.warn('мало дат',c.id,rounds.length,gd.length);
  rounds.forEach((rd,i)=>{ const d=gd[Math.min(i,gd.length-1)]; rd.forEach(([h,a])=>{ if(a===c.host)[h,a]=[a,h]; N.addFix(d,c.id,h,a,(c.league?'':'Группа '+g.n+', ')+'тур '+(i+1),{g:g.n,neu:c.neutral&&h!==c.host&&a!==c.host?1:0}); }); }); delete g.gd; }
 c.stage='groups'; c.teams=teams.slice(); };
N.table=(c,gn)=>{ const S=G(); const g=c.groups.find(x=>x.n===gn); const T={}; g.t.forEach(t=>T[t]={t,p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0});
 for(const f of S.F){ if(f.c!==c.id||f.g!==gn||!f.r||f.ko)continue; const H=T[f.h],A=T[f.a]; if(!H||!A)continue; const [x,y]=[f.r.hg,f.r.ag]; H.p++;A.p++;H.gf+=x;H.ga+=y;A.gf+=y;A.ga+=x; if(x>y){H.w++;A.l++;H.pts+=3}else if(x<y){A.w++;H.l++;A.pts+=3}else{H.d++;A.d++;H.pts++;A.pts++} }
 return Object.values(T).sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga)||b.gf-a.gf||elo(b.t)-elo(a.t)); };
N.ranking=(c)=>{ if(!c.groups||!c.groups.length) return (c.q||[]).map((t,pos)=>({t,pos}));
 const tabs=c.groups.map(g=>N.table(c,g.n)); const out=[]; const mx=Math.max(...tabs.map(t=>t.length));
 for(let pos=0;pos<mx;pos++){ const tier=tabs.map(t=>t[pos]).filter(Boolean).map(r=>({...r,pos})); const norm=r=>r.p?[r.pts/r.p,(r.gf-r.ga)/r.p,r.gf/r.p]:[0,0,0];
  tier.sort((a,b)=>{const A=norm(a),B=norm(b);return B[0]-A[0]||B[1]-A[1]||B[2]-A[2]}); out.push(...tier); }
 return out; };
// ---------- плей-офф ----------
function bracketOrder(n){ let o=[1]; while(o.length<n){ const m=o.length*2; o=o.flatMap(x=>[x,m+1-x]); } return o; }
const RN={32:'1/16 финала',16:'1/8 финала',8:'1/4 финала',4:'1/2 финала',2:'Финал'}; N.RN=RN;
function seedPairs(s,paths){ const n=s.length; if(paths){ const semis=[]; for(let i=0;i<n/2;i++) semis.push([s[i],s[n-1-i]]); const ord=[]; let lo=0,hi=n/2-1; while(lo<=hi){ ord.push(semis[lo++]); if(lo<=hi) ord.push(semis[hi--]); } return ord; }
 if((n&(n-1))===0){ const ord=bracketOrder(n); const p=[]; for(let i=0;i<n;i+=2) p.push([s[ord[i]-1],s[ord[i+1]-1]]); return p; }
 const p=[]; for(let i=0;i<n/2;i++) p.push([s[i],s[n-1-i]]); return p; }
N.startKO=(c,seeds,pairs)=>{ c.ko=[]; c.stage='ko'; c.byeT=null;
 if(!pairs){ let s=seeds.slice(); if(c.byes){ c.byeT=s.slice(0,c.byes); s=s.slice(c.byes); } pairs=seedPairs(s,c.paths); }
 makeRound(c,pairs); };
function kor(c,i){ if(c.kor) return c.kor[Math.min(i,c.kor.length-1)]; return {d:[c.kod[i]],neu:(c.neutral||c.koNeu)?1:0}; }
function roundName(c,i,n){ if(c.rn&&c.rn[i]) return c.rn[i]; return RN[n]||('Раунд '+(i+1)); }
function makeRound(c,pairs){ const S=G(); const i=c.ko.length; const K=kor(c,i); const st=roundName(c,i,pairs.length*2);
 c.ko.push(pairs.map(([h,a])=>{ if(K.d.length===2){ const f1=N.addFix(K.d[0],c.id,h,a,st+', 1-й матч',{ko:1,leg:1}); const f2=N.addFix(K.d[1],c.id,a,h,st+', ответный матч',{ko:1,leg:2,l1:f1.id}); return {h,a,f:f2.id,f1:f1.id}; }
  if(a===c.host)[h,a]=[a,h]; const f=N.addFix(K.d[0],c.id,h,a,st,{ko:1,neu:K.neu&&h!==c.host?1:0}); return {h,a,f:f.id}; })); }
N.fixById=(id)=>{ const S=G(); if(!S._fx||S._fxN!==S.F.length){ S._fx=new Map(S.F.map(f=>[f.id,f])); S._fxN=S.F.length; } return S._fx.get(id)||S.F.find(f=>f.id===id); };
N.onFixDone=(f)=>{ const S=G(); const c=S.C[f.c]; if(!c||c.kind==='fr')return;
 if(c.stage==='groups'){ if(S.F.some(x=>x.c===c.id&&!x.r&&!x.ko))return;
  if(c.adv){ const rk=N.ranking(c); let q=rk.filter(r=>r.pos<c.adv.per); q=q.concat(rk.filter(r=>r.pos===c.adv.per).slice(0,c.adv.best||0)); N.startKO(c,q.map(r=>r.t)); }
  else { c.stage='done'; c.fin=S.d; c.q=N.ranking(c).slice(0,c.slots||0).map(r=>r.t); if(c.lw){ const rk=N.ranking(c); c.w=rk[0].t; c.ru=rk[1]&&rk[1].t; } N.compDone(c); } return; }
 if(c.stage==='ko'){ const rd=c.ko[c.ko.length-1]; const fx=rd.map(t=>N.fixById(t.f)); if(fx.some(x=>!x||!x.r))return; rd.forEach((t,i)=>t.w=fx[i].r.w); const ws=rd.map(t=>t.w);
  if(c.byeT){ const pairs=c.byeT.map((b,i)=>[b,ws[i]]); c.byeT=null; makeRound(c,pairs); return; }
  if(ws.length<=(c.stopAt||1)){ c.q=ws; if(ws.length===1){ c.w=ws[0]; c.ru= ws[0]===rd[0].h?rd[0].a:rd[0].h; } c.stage='done'; c.fin=S.d; N.compDone(c); return; }
  const K=kor(c,c.ko.length); const pairs=[]; for(let i=0;i<ws.length;i+=2){ let p=[ws[i],ws[i+1]]; if(!K.neu&&K.d.length===1&&R()<.5)p.reverse(); pairs.push(p); } makeRound(c,pairs); } };
N.qualOf=(c)=>c? (c.q || ((c.kind==='qual'||c.yq)&&c.groups&&c.groups.length? N.ranking(c).slice(0,c.slots).map(r=>r.t):[])) : [];
N.qualified=N.qualOf;
N.newComp=(o)=>{ const c={stage:'pending',groups:[],rr:2,gsize:4,...o}; G().C[c.id]=c; return c; };
N.topElo=(conf,n,excl=[])=>Object.values(G().T).filter(t=>t.conf===conf&&!excl.includes(t.c)).sort((a,b)=>pts(b.c)-pts(a.c)).slice(0,n).map(t=>t.c);
N.confTeams=(conf)=>Object.values(G().T).filter(t=>t.conf===conf).map(t=>t.c);
// ---------- участники ----------
function srcList(s,out){ const S=G(); const id=s.q||s.from||s.w||s.ru||s.byes||s.fin; const C=id&&S.C[id];
 if(s.top) return N.topElo(s.top,s.n,out); if(s.list) return s.list.filter(t=>S.T[t]&&!out.includes(t)).sort((a,b)=>pts(b)-pts(a)).slice(0,s.n??99); if(!C) return [];
 if(s.fin) return N.finOrder(C).slice(s.at||0,(s.at||0)+s.n);
 if(s.q) return N.qualOf(C).slice(0,s.n??99);
 if(s.from){ const a=C.slots||0; return N.ranking(C).slice(a,a+s.n).map(r=>r.t); }
 if(s.w) return C.q||(C.w?[C.w]:[]);
 if(s.ru) return C.ru?[C.ru]:[];
 if(s.byes) return C.byeL||[];
 return []; }
N.finOrder=(c)=>{ const out=[]; const add=t=>{ if(t&&!out.includes(t)) out.push(t); }; add(c.w); add(c.ru);
 for(let i=(c.ko||[]).length-2;i>=0;i--){ const los=c.ko[i].map(t=>t.w===t.h?t.a:t.h).sort((a,b)=>pts(b)-pts(a)); los.forEach(add); }
 if(c.groups&&c.groups.length) N.ranking(c).forEach(r=>add(r.t)); (c.q||[]).forEach(add); return out; };
N.resolveSrc=(c,pre=[])=>{ const out=pre.slice(); if(c.host&&!out.includes(c.host))out.unshift(c.host); const size=c.size||999;
 for(const s of c.src||[]) for(const t of srcList(s,out)){ if(out.length>=size)break; if(!out.includes(t)) out.push(t); }
 return out.slice(0,size); };
function selTeams(c){ const S=G(); const minus=new Set((c.sel.minus||[]).flatMap(id=>(S.C[id]&&S.C[id].teams)||[]));
 let all=(c.sel.list||N.confTeams(c.conf)).filter(t=>S.T[t]&&!(c.excl||[]).includes(t)&&!minus.has(t)).sort((a,b)=>pts(b)-pts(a)); const s=c.sel; if(s.kings) return N.kingsPick(c);
 if(s.bot){ const k= s.bot==='afc'? Math.max(0,2*(all.length-36)) : s.bot; return all.slice(all.length-k); }
 if(s.top) all=all.slice(0,s.top); return all; }
N.evDraw=(e)=>{ const S=G(); const c=S.C[e.c]; if(!c||c.stage!=='pending')return; let teams;
 if(c.kind==='nl') teams=N.nlTeams(c.conf,c.lg);
 else if(c.sel){ teams=selTeams(c); if(c.host&&!teams.includes(c.host)) teams.unshift(c.host); if(c.size) teams=teams.slice(0,c.size); if(c.src) teams=N.resolveSrc(c,teams); }
 else if(c.src) teams=N.resolveSrc(c);
 else teams=N.confTeams(c.conf).filter(t=>!(c.excl||[]).includes(t));
 if(c.byeTop){ const srt=teams.slice().sort((a,b)=>pts(b)-pts(a)); c.byeL=srt.slice(0,c.byeTop); teams=teams.filter(t=>!c.byeL.includes(t)); }
 if(!teams.length){ c.stage='done'; c.teams=[]; c.q=[]; return; }
 if(c.po){ const seeds=c.seedElo? teams.slice().sort((a,b)=>pts(b)-pts(a)) : teams; if(c.stopAuto) c.stopAt=Math.floor(seeds.length/2); c.teams=teams.slice(); N.startKO(c,seeds); }
 else { let parts=null;
  if(c.busyOf){ const busy=new Set(c.busyOf.flatMap(id=>(S.C[id]&&S.C[id].teams)||[])); const b=teams.filter(t=>busy.has(t)), r=teams.filter(t=>!busy.has(t));
   parts=[{t:r,ng:Math.min(c.ngR,Math.max(1,Math.floor(r.length/4))),gd:c.gd},{t:b,ng:Math.ceil(b.length/4),gd:c.gdB}]; }
  if(c.kind==='final'&&!c.ngFix) c.ng=Math.round(teams.length/4);
  N.drawComp(c,teams,parts); }
 N.drawMail(c); };
N.drawMail=(c)=>{ const S=G(); if(!(c.teams||[]).includes(S.me)) return; let txt='';
 if(c.groups&&c.groups.length&&c.stage==='groups'){ const g=c.groups.find(g=>g.t.includes(S.me)); txt='Наши соперники'+(g.n?' по группе '+g.n:'')+': '+g.t.filter(t=>t!==S.me).map(t=>S.T[t].f+' '+S.T[t].n).join(', ')+'.'; }
 else if(c.ko&&c.ko[0]){ const t=c.ko[0].find(t=>t.h===S.me||t.a===S.me); if(t){ const o=t.h===S.me?t.a:t.h; const f=N.fixById(t.f); txt='Наш соперник: '+S.T[o].f+' '+S.T[o].n+(t.f1?' (два матча, по сумме; при равенстве — д.в. и пенальти, гол на выезде не учитывается)':' (один матч, при ничьей — д.в. и пенальти)')+'.'; }
  else txt='Мы стартуем со второго раунда (свободны в первом).'; }
 N.mail(c.quick&&c.kind==='y'?'Молодёжный штаб':'Федерация футбола','Жеребьёвка: '+c.n,(c.kind==='final'||c.fin?'Мы участвуем в финальном турнире! ':'')+txt+' '+N.expectText(c)); N.setExpect(c); if(!c.quick){ S._stop='draw'; if(c.drawLog) S._drawC=c.id; } };
// ---------- Лиги наций ----------
const NLS={UEFA:{L:['A','B','C','D'],sz:[16,16,16,99],p:'UNL',n:'Лига наций УЕФА',sh:'ЛН'},CONCACAF:{L:['A','B','C'],sz:[16,12,99],p:'CNL',n:'Лига наций КОНКАКАФ',sh:'ЛНК'}};
N.NLS=NLS;
N.nlState=(conf)=>{ const S=G(); S.nl=S.nl||{}; if(!S.nl[conf]){ const cfg=NLS[conf]; const ts=N.confTeams(conf).sort((a,b)=>elo(b)-elo(a)); const cur={}; let i=0; cfg.L.forEach((L,k)=>{ cur[L]=ts.slice(i,i+cfg.sz[k]); i+=cfg.sz[k]; }); S.nl[conf]={cur,next:null,hist:[]}; } return S.nl[conf]; };
N.nlTeams=(conf,L)=>N.nlState(conf).cur[L]||[];
N.nlLeagueOf=(conf,t)=>{ const st=N.nlState(conf); for(const L in st.cur) if(st.cur[L].includes(t)) return L; return null; };
N.fn={};
N.fn.nlStart=(e)=>{ const st=N.nlState(e.conf); if(st.next){ st.cur=st.next; st.next=null; } };
N.fn.nlAfter=(e)=>{ const S=G(); const cfg=NLS[e.conf]; const st=N.nlState(e.conf); const id=L=>cfg.p+L+'_'+e.y; const cs=cfg.L.map(L=>S.C[id(L)]).filter(Boolean);
 if(cs.some(c=>c.stage!=='done')) { N.addEv(N.addD(S.d,7),'fn',{fn:'nlAfter',conf:e.conf,y:e.y}); return; }
 const next={}; cfg.L.forEach(L=>next[L]=st.cur[L].slice()); const mv=[];
 for(let i=0;i<cfg.L.length-1;i++){ const U=S.C[id(cfg.L[i])], Lo=S.C[id(cfg.L[i+1])]; if(!U||!Lo||!U.groups.length||!Lo.groups.length) continue; const k=Math.min(U.groups.length,Lo.groups.length);
  const rkU=N.ranking(U).map(r=>r.t), rkL=N.ranking(Lo).map(r=>r.t); const down=rkU.slice(-k), up=rkL.slice(0,k);
  next[cfg.L[i]]=next[cfg.L[i]].filter(t=>!down.includes(t)).concat(up); next[cfg.L[i+1]]=next[cfg.L[i+1]].filter(t=>!up.includes(t)).concat(down);
  down.forEach(t=>mv.push([t,cfg.L[i],cfg.L[i+1]])); up.forEach(t=>mv.push([t,cfg.L[i+1],cfg.L[i]])); }
 st.next=next; st.hist.push({y:e.y,mv});
 const me=S.me; const mm=mv.find(m=>m[0]===me); if(mm) N.mail('Федерация футбола',cfg.n+': '+(mm[2]<mm[1]?'повышение!':'вылет'),mm[2]<mm[1]?'Сборная выигрывает группу и в следующем розыгрыше выступит в Лиге '+mm[2]+'!':'Сборная заняла последнее место и в следующем розыгрыше опустится в Лигу '+mm[2]+'.');
 const A=S.C[id('A')]; const tabs=A.groups.map(g=>N.table(A,g.n).map(r=>r.t));
 if(e.conf==='UEFA'){
  // 1/4 финала: победитель группы против второго места другой группы (два матча)
  const qf=S.C[cfg.p+'QF_'+e.y]; if(qf&&tabs.length>=4){ const pairs=[[tabs[1][1],tabs[0][0]],[tabs[0][1],tabs[1][0]],[tabs[3][1],tabs[2][0]],[tabs[2][1],tabs[3][0]]]; qf.teams=pairs.flat(); N.startKO(qf,null,pairs); N.drawMail(qf); }
  // стыковые матчи за место в лиге: A3–B2, B3–C2
  const po=S.C[cfg.p+'PO_'+e.y]; if(po){ const pairs=[]; po.meta=[];
   for(let i=0;i<2;i++){ const U=S.C[id(cfg.L[i])], Lo=S.C[id(cfg.L[i+1])]; const third=shuffle(U.groups.map(g=>N.table(U,g.n)[2]).filter(Boolean).map(r=>r.t)); const second=shuffle(Lo.groups.map(g=>N.table(Lo,g.n)[1]).filter(Boolean).map(r=>r.t));
    for(let k=0;k<Math.min(third.length,second.length);k++){ pairs.push([second[k],third[k]]); po.meta.push({hi:third[k],lo:second[k],U:cfg.L[i],L:cfg.L[i+1]}); } }
   po.teams=pairs.flat(); po.stopAt=pairs.length; N.startKO(po,null,pairs); N.drawMail(po); }
 } else { const ff=S.C[cfg.p+'F_'+e.y]; if(ff){ const w=N.ranking(A).filter(r=>r.pos===0).map(r=>r.t); const s=w.concat(N.ranking(A).filter(r=>r.pos===1).map(r=>r.t)).slice(0,4); ff.teams=s; N.startKO(ff,s); N.drawMail(ff); } }
};
N.nlPODone=(c)=>{ const S=G(); const st=N.nlState(c.conf); if(!st.next) return; c.ko[0].forEach((t,i)=>{ const m=c.meta[i]; if(!m) return; if(t.w===m.lo){ // повышение нижнего
  st.next[m.U]=st.next[m.U].filter(x=>x!==m.hi).concat(m.lo); st.next[m.L]=st.next[m.L].filter(x=>x!==m.lo).concat(m.hi);
  if(m.lo===S.me) N.mail('Федерация футбола','Повышение через стыки!','Мы выиграли стыковые матчи и поднимаемся в Лигу '+m.U+'.'); if(m.hi===S.me) N.mail('Федерация футбола','Поражение в стыках','Мы проиграли стыковые матчи и опускаемся в Лигу '+m.L+'.'); } }); };
function nlEdition(conf,y,ko){ const cfg=NLS[conf]; const S=G(); const dts=wd([[y,9],[y,10],[y,11]]);
 N.addEv(N.ds(y,8,1),'fn',{fn:'nlStart',conf});
 cfg.L.forEach((L,i)=>{ const c=N.newComp({id:cfg.p+L+'_'+y,n:cfg.n+' '+y+'/'+((y+1)%100)+' · Лига '+L,sh:cfg.sh+'-'+L,conf,kind:'nl',lg:L,nl:i,gd:dts,gsize:i===cfg.L.length-1&&conf==='UEFA'?4:4,yr:y}); N.addEv(N.ds(y,8,1),'draw',{c:c.id}); });
 N.addEv(N.ds(y,12,1),'fn',{fn:'nlAfter',conf,y});
 const y1=y+1;
 if(conf==='UEFA'){
  N.newComp({id:cfg.p+'QF_'+y,n:cfg.n+' '+y+'/'+(y1%100)+' · 1/4 финала',sh:cfg.sh+'-¼',conf,kind:'nl',yr:y,kor:[{d:wd([[y1,3]])}],stopAt:4,nextFF:cfg.p+'F_'+y,rn:['1/4 финала']});
  N.newComp({id:cfg.p+'F_'+y,n:cfg.n+' '+y+'/'+(y1%100)+' · Финал четырёх',sh:cfg.sh+'-Ф4',conf,kind:'nl',yr:y,kor:[{d:[N.ds(y1,6,11)],neu:1},{d:[N.ds(y1,6,15)],neu:1}],stopAt:1});
  N.newComp({id:cfg.p+'PO_'+y,n:cfg.n+' '+y+'/'+(y1%100)+' · Стыки за место в лиге',sh:cfg.sh+'-ст',conf,kind:'nl',nlpo:1,yr:y,kor:[{d:wd([[y1,3]])}],stopAt:8,rn:['Стыковые матчи']});
 } else N.newComp({id:cfg.p+'F_'+y,n:cfg.n+' '+y+'/'+(y1%100)+' · Финал четырёх',sh:cfg.sh+'-Ф4',conf,kind:'nl',yr:y,kor:[{d:[N.ds(y1,3,20)],neu:1},{d:[N.ds(y1,3,24)],neu:1}],stopAt:1});
}
// ---------- календарь цикла ----------
function finalsDates(y,m,d0,ngd,nko,gap=4){ const s=N.ds(y,m,d0); const gd=[]; for(let i=0;i<ngd;i++)gd.push(N.addD(s,i*gap)); const kod=[]; let cur=N.addD(gd[gd.length-1],5); for(let i=0;i<nko;i++){kod.push(cur);cur=N.addD(cur,4);} return {gd,kod}; }
function chooseHost(conf,top,ex=[]){ return pick(N.topElo(conf,top,ex)); }
N.buildCycle=(Y)=>{ const S=G(); const A=Y,B=Y+1,C=Y+2,E=Y+3,F=Y+4; const id=s=>s+'_'+Y; const D=N.ds; const W=(y,m)=>wd([[y,m]]); const WW=(...l)=>wd(l);
 const euroHost=chooseHost('UEFA',18), afHost=chooseHost('CAF',20), af2Host=chooseHost('CAF',20,[afHost]), acHost=chooseHost('AFC',14);
 const wcHost=pick(Object.values(S.T).filter(t=>t.conf!=='OFC').sort((a,b)=>b.elo-a.elo).slice(0,25)).c; const hc=S.T[wcHost].conf; const h=conf=>hc===conf?1:0;
 const ev=(d,c)=>N.addEv(d,'draw',{c}); const Q=(o,d)=>{ const c=N.newComp({kind:'qual',yr:Y,...o,id:id(o.id)}); ev(d,c.id); return c; };
 const exW=[wcHost]; const wcN='Отбор ЧМ-'+F+' · ';
 // ===== УЕФА =====
 nlEdition('UEFA',A); nlEdition('UEFA',C);
 Q({id:'EQ',n:'Отбор чемпионата Европы '+C,sh:'ОЧЕ',conf:'UEFA',excl:[euroHost],gd:WW([B,3],[B,6],[B,9],[B,10],[B,11]),gdB:WW([B,9],[B,10],[B,11]),busyOf:['UNLQF_'+A,'UNLPO_'+A],ngR:6,slots:20},D(A,12,10));
 Q({id:'EPO',n:'Стыки отбора ЧЕ-'+C,sh:'СтЧЕ',conf:'UEFA',kind:'po',po:1,paths:1,src:[{from:id('EQ'),n:12}],kor:[{d:[D(C,3,20)]},{d:[D(C,3,24)]}],stopAt:3,rn:['Полуфинал пути','Финал пути']},D(B,12,1));
 let fd=finalsDates(C,6,11,3,4); N.newComp({rr:1,id:id('EURO'),n:'Чемпионат Европы '+C,sh:'ЧЕ',conf:'UEFA',kind:'final',gd:fd.gd,kod:fd.kod,ng:6,adv:{per:2,best:4},host:euroHost,neutral:1,src:[{q:id('EQ')},{w:id('EPO')}],size:24,yr:C}); ev(D(C,4,1),id('EURO'));
 Q({id:'WQ_UEFA',n:wcN+'УЕФА',sh:'ОЧМ',conf:'UEFA',excl:exW,gd:WW([E,3],[E,6],[E,9],[E,10],[E,11]),gdB:WW([E,9],[E,10],[E,11]),busyOf:['UNLQF_'+C,'UNLPO_'+C],ngR:6,slots:12-h('UEFA')},D(C,12,10));
 Q({id:'WQ_UPO',n:wcN+'стыки УЕФА',sh:'СтЧМ',conf:'UEFA',kind:'po',po:1,paths:1,src:[{from:id('WQ_UEFA'),n:16}],kor:[{d:[D(F,3,20)]},{d:[D(F,3,24)]}],stopAt:4,rn:['Полуфинал пути','Финал пути']},D(E,12,1));
 // ===== КОНМЕБОЛ: единая лига 18 туров =====
 Q({id:'WQ_CONMEBOL',n:wcN+'КОНМЕБОЛ',sh:'ОЧМ',conf:'CONMEBOL',excl:exW,league:true,gd:WW([A,9],[A,11],[B,3],[B,9],[B,11],[C,3],[C,9],[C,11],[E,9]),slots:6-h('CONMEBOL')},D(A,8,1));
 fd=finalsDates(C,6,14,3,3); N.newComp({rr:1,id:id('COPA'),n:'Копа Америка '+C,sh:'КоА',conf:'CONMEBOL',kind:'final',gd:fd.gd,kod:fd.kod,ng:4,adv:{per:2},neutral:1,src:[{top:'CONMEBOL',n:10},{top:'CONCACAF',n:6}],size:16,yr:C}); ev(D(C,4,20),id('COPA'));
 // ===== КОНКАКАФ =====
 nlEdition('CONCACAF',A); nlEdition('CONCACAF',B);
 for(const y of [B,E]){ const f2=finalsDates(y,6,20,3,3); N.newComp({rr:1,id:id('GOLD'+y),n:'Золотой кубок КОНКАКАФ '+y,sh:'ЗК',conf:'CONCACAF',kind:'final',gd:f2.gd,kod:f2.kod,ng:4,adv:{per:2},neutral:1,src:[{top:'CONCACAF',n:16}],size:16,yr:y}); ev(D(y,5,10),id('GOLD'+y)); }
 Q({id:'WQ_CCF1',n:wcN+'КОНКАКАФ, 1-й раунд',sh:'ОЧМ-1',conf:'CONCACAF',kind:'po',po:1,inter:1,excl:exW,sel:{bot:4},seedElo:1,kor:[{d:W(C,6)}],stopAt:2,rn:['1-й раунд']},D(C,5,1));
 Q({id:'WQ_CCF2',n:wcN+'КОНКАКАФ, 2-й раунд',sh:'ОЧМ-2',conf:'CONCACAF',inter:1,excl:exW,sel:{minus:[id('WQ_CCF1')]},src:[{w:id('WQ_CCF1')}],byeTop:6,ng:6,rr:1,gd:WW([C,9],[C,10],[C,11]),slots:6},D(C,7,1));
 Q({id:'WQ_CONCACAF',n:wcN+'КОНКАКАФ, 3-й раунд',sh:'ОЧМ',conf:'CONCACAF',src:[{byes:id('WQ_CCF2')},{q:id('WQ_CCF2')}],ng:3,gd:WW([E,3],[E,9],[E,10]),slots:6-h('CONCACAF')},D(C,12,1));
 // ===== АФК =====
 Q({id:'ACQ',n:'Отбор Кубка Азии '+B,sh:'ОКАз',conf:'AFC',excl:[acHost],gd:WW([A,9],[A,10],[A,11]),gsize:4,slots:23},D(A,8,1));
 fd=finalsDates(B,1,10,3,4); N.newComp({rr:1,id:id('ASIAN'),n:'Кубок Азии '+B,sh:'КА',conf:'AFC',kind:'final',gd:fd.gd,kod:fd.kod,ng:6,adv:{per:2,best:4},host:acHost,neutral:1,src:[{q:id('ACQ')}],size:24,yr:B}); ev(D(A,12,5),id('ASIAN'));
 Q({id:'WQ_AFC1',n:wcN+'АФК, 1-й раунд',sh:'ОЧМ-1',conf:'AFC',kind:'po',po:1,inter:1,excl:exW,sel:{bot:'afc'},seedElo:1,stopAuto:1,kor:[{d:W(B,3)}],rn:['1-й раунд']},D(B,2,1));
 Q({id:'WQ_AFC2',n:wcN+'АФК, 2-й раунд',sh:'ОЧМ-2',conf:'AFC',inter:1,excl:exW,sel:{minus:[id('WQ_AFC1')]},src:[{w:id('WQ_AFC1')}],ng:9,gd:WW([B,6],[B,9],[B,11]),slots:18},D(B,4,15));
 Q({id:'WQ_AFC',n:wcN+'АФК, 3-й раунд',sh:'ОЧМ',conf:'AFC',src:[{q:id('WQ_AFC2')}],ng:3,gd:WW([C,3],[C,6],[C,9],[C,10],[C,11]),slots:6-h('AFC')},D(B,12,1));
 Q({id:'WQ_AFC4',n:wcN+'АФК, 4-й раунд',sh:'ОЧМ-4',conf:'AFC',src:[{from:id('WQ_AFC'),n:6}],ng:2,rr:1,neutral:1,gd:[D(E,6,5),D(E,6,9),D(E,6,13)],slots:2},D(E,1,15));
 Q({id:'WQ_AFC5',n:wcN+'АФК, 5-й раунд',sh:'ОЧМ-5',conf:'AFC',kind:'po',po:1,inter:1,src:[{from:id('WQ_AFC4'),n:2}],kor:[{d:W(E,9)}],stopAt:1,rn:['5-й раунд']},D(E,7,1));
 // ===== КАФ =====
 Q({id:'AFQ',n:'Отбор Кубка Африки '+B,sh:'ОКА',conf:'CAF',excl:[afHost],gd:WW([A,9],[A,10],[A,11]),gsize:4,slots:23},D(A,8,1));
 fd=finalsDates(B,6,20,3,4); N.newComp({rr:1,id:id('AFCON'),n:'Кубок Африки '+B,sh:'КАН',conf:'CAF',kind:'final',gd:fd.gd,kod:fd.kod,ng:6,adv:{per:2,best:4},host:afHost,neutral:1,src:[{q:id('AFQ')}],size:24,yr:B}); ev(D(B,4,15),id('AFCON'));
 Q({id:'WQ_CAF',n:wcN+'КАФ',sh:'ОЧМ',conf:'CAF',excl:exW,ng:9,gsize:6,gd:WW([B,9],[C,3],[C,9],[E,3],[E,9]),slots:9-h('CAF')},D(B,7,1));
 Q({id:'WQ_CAF2',n:wcN+'КАФ, стыки',sh:'СтКАФ',conf:'CAF',kind:'po',po:1,inter:1,src:[{from:id('WQ_CAF'),n:4}],kor:[{d:[D(E,11,13)],neu:1},{d:[D(E,11,17)],neu:1}],stopAt:1,rn:['1/2 финала','Финал']},D(E,10,1));
 Q({id:'AFQ2',n:'Отбор Кубка Африки '+E,sh:'ОКА',conf:'CAF',excl:[af2Host],gd:WW([B,10],[C,6],[C,11]),gsize:4,slots:23},D(B,8,15));
 fd=finalsDates(E,6,20,3,4); N.newComp({rr:1,id:id('AFCON2'),n:'Кубок Африки '+E,sh:'КАН',conf:'CAF',kind:'final',gd:fd.gd,kod:fd.kod,ng:6,adv:{per:2,best:4},host:af2Host,neutral:1,src:[{q:id('AFQ2')}],size:24,yr:E}); ev(D(E,4,15),id('AFCON2'));
 // ===== ОФК =====
 Q({id:'WQ_OFC1',n:wcN+'ОФК, 1-й раунд',sh:'ОЧМ-1',conf:'OFC',inter:1,excl:exW,sel:{bot:4},league:true,rr:1,neutral:1,gd:[D(B,9,4),D(B,9,8),D(B,10,9)],slots:1},D(B,7,1));
 Q({id:'WQ_OFC2',n:wcN+'ОФК, 2-й раунд',sh:'ОЧМ-2',conf:'OFC',inter:1,excl:exW,sel:{minus:[id('WQ_OFC1')]},src:[{q:id('WQ_OFC1')}],ng:2,rr:1,neutral:1,gd:[D(C,9,4),D(C,9,8),D(C,10,9)],slots:4},D(C,7,1));
 Q({id:'WQ_OFC',n:wcN+'ОФК, финальный раунд',sh:'ОЧМ',conf:'OFC',kind:'po',po:1,src:[{q:id('WQ_OFC2')}],kor:[{d:[D(C,11,13)],neu:1},{d:[D(C,11,17)],neu:1}],stopAt:1,rn:['1/2 финала','Финал']},D(C,10,20));
 fd=finalsDates(C,6,6,3,2,3); N.newComp({rr:1,id:id('OFCNC'),n:'Кубок наций ОФК '+C,sh:'КНО',conf:'OFC',kind:'final',gd:fd.gd,kod:fd.kod,ng:2,adv:{per:2},neutral:1,src:[{top:'OFC',n:8}],size:8,yr:C}); ev(D(C,4,20),id('OFCNC'));
 // ===== межконтинентальные стыки и ЧМ =====
 Q({id:'WQ_IC',n:wcN+'межконтинентальные стыки',sh:'МСт',conf:'ALL',kind:'po',po:1,src:[{from:id('WQ_CONMEBOL'),n:1},{from:id('WQ_CONCACAF'),n:2},{w:id('WQ_AFC5')},{w:id('WQ_CAF2')},{ru:id('WQ_OFC')}],seedElo:1,byes:2,kor:[{d:[D(F,3,20)],neu:1},{d:[D(F,3,24)],neu:1}],stopAt:2,rn:['1-й раунд стыков','Финал стыков']},D(E,11,25));
 fd=finalsDates(F,6,11,3,5); N.newComp({rr:1,id:id('WC'),n:'Чемпионат мира '+F,sh:'ЧМ',conf:'ALL',kind:'final',gd:fd.gd,kod:fd.kod,ng:12,adv:{per:2,best:8},host:wcHost,neutral:1,
  src:[{q:id('WQ_UEFA')},{w:id('WQ_UPO')},{q:id('WQ_CONMEBOL')},{q:id('WQ_CAF')},{q:id('WQ_AFC')},{q:id('WQ_AFC4')},{q:id('WQ_CONCACAF')},{w:id('WQ_OFC')},{w:id('WQ_IC')},{top:'UEFA',n:60}],size:48,yr:F});
 ev(D(F,4,2),id('WC'));
 // окна и товарищеские
 const endD=N.ds(F,8,1); for(const y of [A,B,C,E,F]){ for(const d of N.windowDates(y)) if(d>S.d&&d<endD){ N.addEv(d,'fr'); } for(const m of [3,6,9,10,11]){ const d=N.ds(y,m,WIN[m][0]-6); if(d>S.d&&d<endD) N.addEv(d,'win',{m}); } }
 if(N.buildExtras) N.buildExtras(Y,endD);
 N.addEv(endD,'cycle',{y:F});
 S.cyc={Y,euroHost,afHost,af2Host,acHost,wcHost};
};
// ---------- ожидания федерации ----------
N.lvlNames=['вылет в группе','выход из группы','1/8 финала','1/4 финала','полуфинал','финал','победа'];
const isKOonly=c=>c.po||(c.kind==='nl'&&!c.lg); const isQ=c=>c.kind==='qual'||c.yq;
N.expectLevel=(c)=>{ const S=G(); const ts=(c.teams||[]).slice().sort((a,b)=>S.T[b].elo-S.T[a].elo); const rk=ts.indexOf(S.me); if(rk<0)return null; const n=ts.length;
 if(c.cup) return rk===0?6:5;
 if(isKOonly(c)){ if(c.nlpo){ const m=(c.meta||[]).find(m=>m.hi===S.me||m.lo===S.me); if(!m) return 0; return S.T[S.me].elo>=S.T[m.hi===S.me?m.lo:m.hi].elo?1:0; } const slots=c.stopAt||1; return rk<slots*0.8?1:0; }
 if(isQ(c)||c.kind==='nl'){ const slots=c.kind==='nl'?Math.max(1,Math.round(n/4)):c.slots; return rk<slots*0.8?1:0; }
 const pct=rk/n; return pct<0.04?5:pct<0.1?4:pct<0.25?3:pct<0.5?(n>=24?2:1):pct<0.75?1:0; };
N.expectText=(c)=>{ const l=N.expectLevel(c); if(l===null)return '';
 if(c.nlpo) return l?'Задача: выиграть стыки.':'Задача: дать бой в стыках.';
 if(isQ(c)||c.po) return c.cup?(l?'Задача: выиграть трофей.':'Задача: достойно сыграть.'):c.inter? (l?'Задача федерации: пройти в следующий раунд.':'Задача: побороться за выход в следующий раунд.') : (l?'Задача федерации: выйти в финальный турнир.':'Задача: достойно выступить, борьба за выход будет бонусом.');
 if(c.kind==='nl') return isKOonly(c)?(l?'Задача: пройти дальше.':'Задача: дать бой фаворитам.'):(l?'Задача: побороться за первое место в группе.':'Задача: сохранить место в лиге.'); return 'Задача федерации: '+N.lvlNames[l]+'.'; };
N.setExpect=(c)=>{ if(c){G().u.expect[c.id]=N.expectLevel(c);} };
N.achievedLevel=(c)=>{ const S=G(); const me=S.me;
 if(c.po&&c.cup) return c.w===me?6:(c.teams||[]).includes(me)?(c.ko&&c.ko.length>1&&c.ko[c.ko.length-1].some(t=>t.h===me||t.a===me)?5:4):0;
 if(isQ(c)||c.po) return N.qualOf(c).includes(me)?1:0;
 if(c.lw) return c.w===me?6:c.ru===me?5:0;
 if(c.kind==='nl'){ if(isKOonly(c)) return (c.q||[]).includes(me)?1:0; const g=c.groups.find(g=>g.t.includes(me)); return g&&N.table(c,g.n)[0].t===me?1:0; }
 if(!c.ko||!c.ko.length) return 0; if(c.w===me) return 6; let lv=0; c.ko.forEach((rd)=>{ if(rd.some(t=>t.h===me||t.a===me)){ const n=rd.length*2; lv= n===2?5:n===4?4:n===8?3:n===16?2:1; } }); return lv; };
N.compDone=(c)=>{ const S=G(); const me=S.me; const inC=(c.teams||[]).includes(me);
 if(c.nextFF&&S.C[c.nextFF]){ const ff=S.C[c.nextFF]; const q=c.q; ff.teams=q.slice(); N.startKO(ff,null,[[q[0],q[1]],[q[2],q[3]]]); N.drawMail(ff); }
 if(c.nlpo) N.nlPODone(c);
 if((c.kind==='final'||(c.kind==='nl'&&c.w))&&c.w) N.mail('Новости',(c.n)+': победитель — '+S.T[c.w].n,S.T[c.w].f+' '+S.T[c.w].n+' выигрывает турнир, обыграв в финале '+S.T[c.ru].n+'.');
 if(c.id.startsWith('WC_')||c.id.startsWith('EURO_')) {} 
 if(inC){ const ex=S.u.expect[c.id]??N.expectLevel(c); const got=N.achievedLevel(c); const q=(isQ(c)||c.po)&&!c.cup; const k=c.quick?2:c.minor?3:c.kind==='final'?7:q?(c.inter?6:12):4; const dt=Math.round(cl((got-ex)*k,-30,25));
  N.trust(dt); let txt='Итог: «'+c.n+'» — '+(c.nlpo?(got?'стыки выиграны.':'стыки проиграны.'):q?(got?(c.inter?'выход в следующий раунд!':'путёвка завоёвана!'):(c.inter?'дальше пройти не удалось.':'выйти не удалось.')):c.kind==='nl'?(isKOonly(c)?(got?'проходим дальше.':'выбываем.'):(got?'первое место в группе.':'без первого места.')):N.lvlNames[got]+'.')+' Доверие федерации '+(dt>=0?'+':'')+dt+'.';
  if(q&&got&&!c.inter&&!c.nlpo&&!c.quick){S.u.bud+=25; N.ach('qual');}
  if(c.w===me&&(!c.po||c.cup)){ S.u.tro.push({n:c.n,yr:c.yr||S.d.slice(0,4),t:me,d:S.d}); S.u.bud+=c.quick?10:c.minor?25:c.kind==='final'?80:40; txt+=' 🏆 ТРОФЕЙ! Бюджет федерации пополнен.'; N.ach('trophy'); if(c.id.startsWith('WC'))N.ach('wc'); if(c.kind==='final'&&!c.minor&&c.id.match(/EURO|COPA|AFCON|ASIAN|GOLD|OFCNC/))N.ach('cont'); }
  if(c.kind==='final'&&!c.minor){ S.u.bud+=got*8; if(got>=4)N.ach('semi'); if(got>ex)N.ach('over'); }
  N.mail(c.quick&&c.kind==='y'?'Молодёжный штаб':'Федерация футбола','Итоги: '+c.n,txt); if(!c.quick) S._stop='comp'; N.checkJob(c.kind==='final'); }
};
})();

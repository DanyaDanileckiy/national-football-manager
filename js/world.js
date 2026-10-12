// Мир вокруг: рейтинг ФИФА (формула SUM), молодёжные и региональные турниры, клубная жизнь, давление прессы и болельщиков, двойное гражданство, натурализация
(function(){
const N=globalThis.NFM; const {R,cl,ri,pick,shuffle,gauss}=N; const G=()=>N.getS();
const pois=l=>{ let L=Math.exp(-l),k=0,p=1; do{k++;p*=R()}while(p>L); return k-1; };
// ---------- рейтинг ФИФА ----------
N.seedPts=(S)=>{ for(const c in S.T){ const t=S.T[c]; t.pts=Math.round((820+Math.max(0,t.r-35)*18.5+gauss()*10)*100)/100; } };
N.fifaI=(c,f)=>{ if(!c||c.quick) return 0; if(c.kind==='fr') return 10; if(c.cup) return /^KINGS/.test(c.id)?10:15;
 if(c.kind==='nl') return c.lg?15:25; if(c.kind==='qual'||c.po) return 25;
 if(c.kind==='final'){ if(c.minor) return 15; if(/^WC_/.test(c.id)) return f.ko?60:50; return f.ko?40:35; } return 10; };
N.fifaUpd=(f)=>{ const S=G(); const c=S.C[f.c]; const I=N.fifaI(c,f); if(!I||!f.r) return; const H=S.T[f.h],A=S.T[f.a]; const r=f.r;
 const We=1/(Math.pow(10,-(H.pts-A.pts)/600)+1); let Wh,Wa;
 if(r.pen&&r.hg===r.ag){ Wh=r.w===f.h?0.75:0.5; Wa=r.w===f.a?0.75:0.5; } else { Wh=r.hg>r.ag?1:r.hg<r.ag?0:0.5; Wa=1-Wh; }
 let dH=I*(Wh-We), dA=I*(Wa-(1-We)); if(c.kind==='final'&&f.ko&&!c.minor){ dH=Math.max(0,dH); dA=Math.max(0,dA); }
 H.pts=Math.round((H.pts+dH)*100)/100; A.pts=Math.round((A.pts+dA)*100)/100; r.fp=[+dH.toFixed(2),+dA.toFixed(2)]; };
N.fifaOrder=()=>Object.values(G().T).sort((a,b)=>b.pts-a.pts).map(t=>t.c);
N.fifaRank=(c)=>{ const S=G(); if(!S._rkc||S._rkcD!==S.d+S.F.length){ S._rkc={}; N.fifaOrder().forEach((x,i)=>S._rkc[x]=i+1); S._rkcD=S.d+S.F.length; } return S._rkc[c]; };
function snapshot(){ const S=G(); const o=N.fifaOrder(); S.rkPrev=S.rkCur||null; S.rkCur={d:S.d,pos:Object.fromEntries(o.map((c,i)=>[c,i+1]))};
 S.rkH=S.rkH||[]; S.rkH.push({d:S.d,o:o.join(',')}); if(S.rkH.length>160) S.rkH.shift();
 S.u.rkMe=S.u.rkMe||[]; S.u.rkMe.push([S.d,S.me,S.rkCur.pos[S.me],Math.round(S.T[S.me].pts)]); if(S.u.rkMe.length>200) S.u.rkMe.shift(); }
N.rkMove=(c)=>{ const S=G(); if(!S.rkPrev||!S.rkCur) return 0; return (S.rkPrev.pos[c]||0)-(S.rkCur.pos[c]||0); };
// ---------- сила молодёжных команд ----------
const OFF={17:16,20:11,21:9,23:5};
N.ySquad=(L)=>{ const S=G(); const y17=(S.u.y17||[]).map(id=>S.P[id]).filter(p=>p&&!p.ret&&p.age<=L);
 let el= L<=17? y17 : N.pool(S.me).filter(p=>p.age<=L).concat(y17);
 if(L===23){ const over=N.pool(S.me).filter(p=>p.age>23&&!p.inj).sort((a,b)=>b.o-a.o).slice(0,3); el=el.concat(over); }
 return el.filter(p=>!p.inj).sort((a,b)=>b.o-a.o).slice(0,18); };
function locStr(c){ const S=G(); const t=S.T[c]; const ps=N.pool(c).filter(p=>p.lg===c).sort((a,b)=>b.o-a.o).slice(0,11).map(p=>p.o); while(ps.length<11) ps.push(t.r-12); return ps.reduce((a,b)=>a+b,0)/11; }
N.yStr=(c,C)=>{ const S=G(); const t=S.T[c]; if(C.kind==='loc') return locStr(c); const L=C.age||21; const key=c+L+S.d.slice(0,4); S.yg=S.yg||{}; if(S.yg[key]===undefined) S.yg[key]=Math.round(gauss()*25)/10;
 if(c===S.me){ const sq=N.ySquad(L).slice(0,11); if(sq.length>=9){ const v=sq.map(p=>p.o); while(v.length<11) v.push(t.r-OFF[L]-8); return v.reduce((a,b)=>a+b,0)/11+1; } }
 return t.r-OFF[L]+S.yg[key]; };
N.quickFix=(f)=>{ const S=G(); const c=S.C[f.c]; let a=N.yStr(f.h,c), b=N.yStr(f.a,c); if(!f.neu) a+=1.5;
 const ratio=Math.max(0.3,a)/Math.max(0.3,b); const lam=x=>Math.min(4.2,1.25*Math.pow(x,2.3)); let hg=pois(lam(ratio)), ag=pois(lam(1/ratio));
 const r={hg,ag,et:0,pen:null,sc:[],w:null}; let agg=null; if(f.leg===2){ const l1=N.fixById(f.l1); agg=[hg+l1.r.ag, ag+l1.r.hg]; r.agg=agg; }
 const ko=f.ko&&f.leg!==1; if(ko){ const A_=agg?agg[0]:hg, B_=agg?agg[1]:ag; if(A_===B_){ if(R()<.3){ const p=R()<ratio/(1+ratio); if(p){r.hg++;if(agg)agg[0]++;}else{r.ag++;if(agg)agg[1]++;} r.et=1; }
   const A2=agg?agg[0]:r.hg, B2=agg?agg[1]:r.ag; if(A2===B2){ const w=R()<0.5+ (ratio-1)*0.15; r.pen=w?[ri(4,5),ri(2,4)]:[ri(2,4),ri(4,5)]; if(r.pen[0]===r.pen[1])r.pen[w?0:1]++; r.w=w?f.h:f.a; } else r.w=A2>B2?f.h:f.a; }
  else r.w=A_>B_?f.h:f.a; }
 if(f.h===S.me||f.a===S.me){ const side=f.h===S.me?0:1; const n=side?r.ag:r.hg; const sq=c.kind==='loc'?N.pool(S.me).filter(p=>p.lg===S.me):N.ySquad(c.age||21); const att=sq.filter(p=>p.pos!=='GK');
  for(let i=0;i<n&&att.length;i++){ const p=att[Math.floor(Math.pow(R(),1.6)*att.length)]; const k=['ST','LW','RW','AM'].includes(p.pos)?0:1; const pp=k&&R()<.5?att[Math.floor(R()*att.length)]:p; r.sc.push([pp.id,pp.n,side,ri(3,90),0,0]); }
  if(c.kind==='y') sq.slice(0,14).forEach(p=>{ p.u21=1; p.ycaps=(p.ycaps||0)+1; });
  S.u.yres=S.u.yres||[]; S.u.yres.unshift({d:S.d,c:f.c,o:side?f.h:f.a,s:side?[r.ag,r.hg]:[r.hg,r.ag],pen:r.pen?(side?[r.pen[1],r.pen[0]]:r.pen):null,sc:r.sc.map(x=>x[1].split(' ').pop())}); S.u.yres=S.u.yres.slice(0,60); }
 f.r=r; N.onFixDone(f); };
// ---------- календарь дополнительных турниров ----------
function fds(y,m,d0,ngd,nko,gap=3){ const s=N.ds(y,m,d0); const gd=[]; for(let i=0;i<ngd;i++) gd.push(N.addD(s,i*gap)); const kod=[]; let cur=N.addD(gd[gd.length-1],4); for(let i=0;i<nko;i++){ kod.push(cur); cur=N.addD(cur,gap+1); } return {gd,kod}; }
const ARAB=['SA','IQ','QA','JO','AE','OM','BH','SY','PS','LB','KW','YE','EG','DZ','MA','TN','LY','SD','MR','KM','DJ','SO'];
const GULF=['SA','IQ','QA','AE','OM','BH','KW','YE'];
const AFF=['TH','VN','ID','MY','PH','SG','MM','KH','LA','TL','BN'];
const SAFF=['IN','PK','BD','NP','LK','MV','BT','AF'];
const CONFN={UEFA:'УЕФА',CONMEBOL:'КОНМЕБОЛ',CONCACAF:'КОНКАКАФ',CAF:'КАФ',AFC:'АФК',OFC:'ОФК'};
const YN={UEFA:'чемпионат Европы',CONMEBOL:'чемпионат Южной Америки',CONCACAF:'чемпионат КОНКАКАФ',CAF:'Кубок Африки',AFC:'Кубок Азии',OFC:'чемпионат Океании'};
N.kingsPick=(c)=>{ const S=G(); const H=S.T.TH; const ds=c.kor.map(k=>k.d[0]); const free=t=>!S.F.some(f=>!f.y&&ds.includes(f.d)&&(f.h===t||f.a===t));
 const cand=shuffle(Object.values(S.T).filter(t=>t.c!=='TH'&&Math.abs(t.pts-H.pts)<320&&free(t.c))); const out=['TH']; const used=new Set(['AFC']);
 for(const t of cand){ if(out.length>=4)break; if(!used.has(t.conf)){ used.add(t.conf); out.push(t.c); } } for(const t of cand){ if(out.length>=4)break; if(!out.includes(t.c)) out.push(t.c); } return out; };
N.buildExtras=(Y,endD)=>{ const S=G(); const A=Y,B=Y+1,C=Y+2,E=Y+3,F=Y+4; const id=s=>s+'_'+Y; const D=N.ds; const ev=(d,c)=>{ if(d>=S.d) N.addEv(d,'draw',{c}); };
 const topHost=(confs,n)=>pick(Object.values(S.T).filter(t=>!confs||confs.includes(t.conf)).sort((a,b)=>b.pts-a.pts).slice(0,n)).c;
 const Y_=(o)=>N.newComp({kind:'y',quick:1,yr:Y,neutral:1,rr:1,...o,id:id(o.id)});
 // отбор (быстрый турнир в одном месте: группы по 4, один круг)
 const qual=(key,n,conf,L,slots,d0,excl)=>{ const c=Y_({id:key,n,sh:'U-'+L+' отб.',conf,age:L,yq:1,gsize:4,gd:[d0,N.addD(d0,3),N.addD(d0,6)],slots,sel:{},excl:excl||[]}); ev(N.addD(d0,-30),c.id); return c; };
 const champ=(key,n,conf,L,size,y,m,d,o={})=>{ const ng=size<=10?2:size<=12?3:size<=16?4:size<=24?6:12; const per=2, best=size===12?2:size===24?4:size===48?8:0; const adv=per*ng+best; const nko=Math.round(Math.log2(adv));
  const ngd= size===10?5:3; const fd=fds(y,m,d,ngd,nko); const c=Y_({id:key,n,sh:'U-'+L,conf,age:L,fin:1,ng,ngFix:1,gd:fd.gd,kod:fd.kod,adv:{per,best},size,...o}); ev(N.addD(fd.gd[0],-25),c.id); return c; };
 // ===== U-17: ежегодный ЧМ на 48 команд =====
 const U17S={UEFA:11,CAF:10,AFC:9,CONCACAF:8,CONMEBOL:7,OFC:3};
 for(const y of [A,B,C,E]){ const src=[]; const host=topHost(null,40); for(const k in U17S){ const q=qual('U17Q'+k+y,'Отбор ЧМ U-17 '+y+' · '+CONFN[k],k,17,U17S[k],D(y,9,12),[host]); src.push({q:q.id}); }
  champ('U17WC'+y,'Чемпионат мира U-17 '+y,'ALL',17,48,y,11,5,{host,src}); }
 // ===== U-20: континентальные первенства и ЧМ (B и E) =====
 const U20={UEFA:[8,5,7,1],CONMEBOL:[10,4,1,20],AFC:[16,4,3,1],CAF:[12,4,4,10],CONCACAF:[12,4,6,1],OFC:[8,2,7,5]};
 for(const y of [B,E]){ const src=[];
  for(const k of ['OFC','CONMEBOL','AFC','CAF','CONCACAF','UEFA']){ const [size,top,m,d]=U20[k]; const d0=D(y,m,d); const o={};
   if(N.confTeams(k).length>size){ const q=qual('U20Q'+k+y,'Отбор: '+YN[k]+' U-'+(k==='UEFA'?19:20)+' '+y,k,20,size,N.addD(d0,-60)); o.src=[{q:q.id}]; } else o.sel={};
   const ch=champ('U20'+k+y,(k==='UEFA'?'Чемпионат Европы U-19 ':YN[k][0].toUpperCase()+YN[k].slice(1)+' U-20 ')+y,k,20,size,y,m,d,o); src.push({fin:ch.id,n:top}); }
  champ('U20WC'+y,'Чемпионат мира U-20 '+y,'ALL',20,24,y,9,20,{host:topHost(['UEFA','CONMEBOL','AFC','CAF','CONCACAF'],40),src}); }
 // ===== U-21: молодёжные Евро (B и E) с отборами =====
 for(const [y,qy] of [[B,A],[E,C]]){ const host=topHost(['UEFA'],20); const q=N.newComp({id:id('U21Q'+y),n:'Отбор молодёжного чемпионата Европы U-21 '+y,sh:'U-21 отб.',conf:'UEFA',kind:'y',quick:1,yq:1,age:21,gsize:4,rr:2,gd:N.windowDates(qy).filter(d=>d.slice(5,7)>='09'),slots:15,excl:[host],yr:Y}); ev(D(qy,8,5),q.id);
  champ('U21E'+y,'Молодёжный чемпионат Европы U-21 '+y,'UEFA',21,16,y,6,11,{host,src:[{q:q.id}]}); }
 // ===== Олимпийский турнир (U-23 + 3 игрока старше) =====
 const OQ={AFC:[16,C,1,8,'Кубок Азии U-23'],CAF:[8,B,11,20,'Кубок Африки U-23'],CONMEBOL:[10,C,1,15,'Олимпийский отбор КОНМЕБОЛ U-23'],CONCACAF:[8,C,3,1,'Олимпийский отбор КОНКАКАФ U-23'],OFC:[8,C,2,1,'Олимпийский отбор ОФК U-23']};
 const oq={}; for(const k in OQ){ const [size,y,m,d,nm]=OQ[k]; const d0=D(y,m,d); const o={}; if(N.confTeams(k).length>size){ const q=qual('OQQ'+k,'Отбор: '+nm+' '+y,k,23,size,N.addD(d0,-60)); o.src=[{q:q.id}]; } else o.sel={}; oq[k]=champ('OQ'+k,nm+' '+y,k,23,size,y,m,d,o); }
 const opo=Y_({id:'OQPO',n:'Олимпийский стыковой матч '+C,sh:'U-23 ст.',conf:'ALL',age:23,po:1,inter:1,src:[{fin:oq.AFC.id,at:3,n:1},{fin:oq.CAF.id,at:3,n:1}],kor:[{d:[D(C,4,10)],neu:1}],stopAt:1,rn:['Стыковой матч']}); ev(D(C,3,25),opo.id);
 champ('OLY','Олимпийский футбольный турнир '+C,'ALL',23,16,C,7,20,{host:topHost(['UEFA','CONMEBOL','AFC','CAF','CONCACAF'],30),src:[{fin:oq.OFC.id,n:1},{fin:id('U21E'+B),n:3},{fin:oq.AFC.id,n:3},{fin:oq.CAF.id,n:3},{fin:oq.CONMEBOL.id,n:2},{fin:oq.CONCACAF.id,n:2},{w:opo.id},{fin:id('U21E'+B),at:3,n:3}]});
 // ===== региональные турниры взрослых сборных =====
 const fin=(key,n,sh,list,size,ng,y,m,d,nko,o={})=>{ const fd=fds(y,m,d,o.ngd||3,nko,o.gap||4); const c=N.newComp({id:id(key),n,sh,conf:'ALL',kind:'final',minor:1,rr:1,ng,ngFix:1,gd:fd.gd,kod:fd.kod,adv:{per:2},neutral:1,sel:{list},size,yr:y,...o}); c.conf='ALL_R'; ev(N.addD(fd.gd[0],-30),c.id); return c; };
 fin('ARAB','Кубок арабских наций '+B,'КАН-А',ARAB,16,4,B,12,1,3,{host:pick(['SA','QA','AE','EG','MA','DZ'])});
 fin('GULF','Кубок Персидского залива '+C,'КПЗ',GULF,8,2,C,12,20,2,{host:pick(GULF)});
 fin('SAFF','Чемпионат Южной Азии '+C,'ЧЮА',SAFF,8,2,C,7,1,2,{gap:3,host:pick(SAFF.slice(0,4))});
 for(const y of [A,C]){ const g=[D(y,11,24),D(y,11,27),D(y,11,30),D(y,12,3),D(y,12,6)]; const c=N.newComp({id:id('AFF'+y),n:'Чемпионат Юго-Восточной Азии '+y,sh:'ЧЮВА',conf:'ALL_R',kind:'final',minor:1,rr:1,ng:2,ngFix:1,gd:g,adv:{per:2},kor:[{d:[D(y,12,10),D(y,12,13)]},{d:[D(y,12,17),D(y,12,20)]}],sel:{list:AFF},size:10,yr:y}); ev(D(y,10,25),c.id); }
 const kg=N.newComp({id:id('KINGS'),n:'Королевский кубок '+E,sh:'КК',conf:'ALL',kind:'po',po:1,cup:1,minor:1,host:'TH',sel:{kings:1},kor:[{d:[D(E,3,27)],neu:1},{d:[D(E,3,30)],neu:1}],stopAt:1,rn:['1/2 финала','Финал'],yr:E}); ev(D(E,3,26),kg.id);
 const fz=N.newComp({id:id('FINALISSIMA'),n:'Кубок чемпионов континентов '+F,sh:'КЧК',conf:'ALL',kind:'po',po:1,cup:1,minor:1,src:[{w:id('EURO')},{w:id('COPA')}],kor:[{d:[D(F,3,27)],neu:1}],stopAt:1,rn:['Финал'],yr:F}); ev(D(C,8,1),fz.id);
 // чемпионат африканских наций и Кубок Восточной Азии — только игроки местных лиг
 for(const y of [B,E]){ const fd=fds(y,1,15,3,3,4); const c=N.newComp({id:id('CHAN'+y),n:'Чемпионат африканских наций (игроки местных лиг) '+y,sh:'ЧАН',conf:'CAF',kind:'loc',quick:1,fin:1,rr:1,ng:4,ngFix:1,gd:fd.gd,kod:fd.kod,adv:{per:2},neutral:1,sel:{top:16},size:16,yr:y}); ev(D(y-1,12,10),c.id);
  const e=N.newComp({id:id('EAFF'+y),n:'Кубок Восточной Азии '+y,sh:'КВА',conf:'AFC',kind:'loc',quick:1,league:true,lw:1,rr:1,neutral:1,gd:[D(y,7,15),D(y,7,19),D(y,7,23)],src:[{list:['JP','KR','CN']},{list:['HK','TW','KP','MN','GU','MO'],n:1}],size:4,yr:y}); ev(D(y,6,20),e.id); }
 // ежемесячный рейтинг и клубные новости
 for(let y=A;y<=F;y++) for(let m=1;m<=12;m++){ const d=D(y,m,1); if(d>=S.d&&d<endD) N.addEv(d,'fn',{fn:'month'}); }
};
// ---------- U-17: генерация и выпуск ----------
N.y17Fill=()=>{ const S=G(); const t=S.T[S.me]; S.u.y17=(S.u.y17||[]).filter(id=>S.P[id]&&S.P[id].age<=17&&!S.P[id].ret); const acad=S.u.infra.acad;
 const taken=new Set(N.pool(S.me).map(p=>p.nf?p.n:p.sn).concat(S.u.y17.map(id=>S.P[id].nf?S.P[id].n:S.P[id].sn)));
 while(S.u.y17.length<22){ const pos=N.SQ[S.u.y17.length%N.SQ.length]; const p=N.genPlayer(S.me,pos,Math.round(t.r-16+gauss()*3+(acad-1)),ri(15,17),{caps:0,potB:(acad-1)*3+2,taken}); p.yth=17; S.u.y17.push(p.id); } };
const _evYear=N.evYear; N.evYear=(e)=>{ const S=G(); _evYear(e); const t=S.T[S.me]; const notes=[];
 for(const id of (S.u.y17||[])){ const p=S.P[id]; if(!p)continue; p.age++; N.develop(p,true); if(p.age>=18){ if(p.pot>=t.r-6||p.o>=t.r-12){ delete p.yth; t.pl.push(p.id); notes.push(p.n+' ('+N.POS[p.pos][0]+', '+p.o+'/'+p.pot+')'); } else delete S.P[id]; } }
 const pl=N.pool(S.me); if(pl.length>50){ const val=p=>p.o+(p.age<=22?(p.pot-p.o)*0.5:0)+(S.u.call.includes(p.id)?50:0); const drop=pl.sort((a,b)=>val(a)-val(b)).slice(0,pl.length-50); const ds=new Set(drop.map(p=>p.id)); t.pl=t.pl.filter(id=>!ds.has(id)); drop.forEach(p=>{ if(p.caps>0||(p.rh||[]).length){ p.ret=S.d.slice(0,4); p.rel=1; } else delete S.P[p.id]; }); }
 N.y17Fill(); if(notes.length) N.mail('Молодёжный штаб','Выпуск U-17','Из команды U-17 в общий пул сборной переходят: '+notes.join(', ')+'.');
 const y=S.d.slice(0,4); if(S.yg) for(const k in S.yg) if(!k.endsWith(y)) delete S.yg[k]; };
// ---------- клубная жизнь между окнами ----------
const GR={ST:.55,LW:.35,RW:.35,AM:.28,LM:.18,RM:.18,CM:.1,DM:.05,LB:.04,RB:.04,CB:.05,GK:0};
function clubMonth(){ const S=G(); const m=+S.d.slice(5,7); const off=m===6||m===7; const me=S.T[S.me]; const items=[]; const key=p=>S.u.call.includes(p.id)||p.o>=me.str-6;
 for(const p of N.pool(S.me)){ if(m===8) p.cg=0;
  if(!off){ p.cf=Math.round(cl((p.cf||0)*0.5+gauss()*1.1,-3,3)*10)/10; const lv=N.leagueLvl(p.lg||S.me,p.div);
   const gm=pois(GR[p.pos]*4*Math.pow(cl(p.o/Math.max(40,lv),0.6,1.5),2)*(1+p.cf*0.15)); p.cg=(p.cg||0)+gm;
   p.form=+cl(p.form+(6.4+0.3*p.cf-p.form)*0.4,3,10).toFixed(2); p.mor=Math.round(cl(p.mor+p.cf,5,100));
   if(key(p)){ if(gm>=3) items.push('🔥 '+p.n+' ('+p.club+') забил за месяц '+gm+' гол.'+' — отличная форма.'); else if(p.cf<=-2.2) items.push('🪑 '+p.n+' почти не играет за '+p.club+', форма падает.'); else if(p.cf>=2.4&&p.pos==='GK') items.push('🧤 '+p.n+' — серия сухих матчей за '+p.club+'.'); } }
  if(!off&&!p.inj&&R()<0.022){ p.inj=R()<.7?ri(7,25):ri(26,90); if(key(p)) items.push('🚑 '+p.n+' травмирован в матче за '+p.club+' — пропустит около '+p.inj+' дн.'); }
  if((m===1||m===8)&&R()<0.07){ const old=p.club, oldL=N.leagueLvl(p.lg||S.me,p.div); const q={o:p.o+Math.round(gauss()*3)+(p.age<=24?2:0),t:p.t,pos:p.pos}; N.assignClub(q,S.me); if(q.club!==old){ p.club=q.club; p.lg=q.lg; p.div=q.div; const nl=N.leagueLvl(p.lg,p.div);
    if(nl>oldL+3){ p.mor=cl(p.mor+6,5,100); if(p.age<=27){ const k=pick(['att','def','pas','tec','phy','spd']); p[k]=Math.min(99,p[k]+1); N.upd(p); } } else if(nl<oldL-3) p.form=+cl(p.form+0.3,3,10).toFixed(2);
    if(key(p)) items.push('✍️ Трансфер: '+p.n+' переходит из '+old+' в '+p.club+(S.T[p.lg]?' ('+S.T[p.lg].n+(p.div===2?', 2-й дивизион':'')+')':'')+(nl>oldL+3?' — шаг вверх.':nl<oldL-3?' — ради игровой практики.':'.')); } } }
 if(items.length) N.mail('Скаутская служба','Новости клубов',items.slice(0,9).join('\n')); }
// ---------- давление прессы и болельщиков ----------
const _afterUser=N.afterUser; N.afterUser=(f,m)=>{ const S=G(); const pre=S.u.prs??30, preF=S.u.fan??60; _afterUser(f,m); const side=f.h===S.me?0:1; const c=S.C[f.c];
 const my=S.T[S.me], op=S.T[side?f.h:f.a]; const We=1/(Math.pow(10,-(my.pts-op.pts)/600)+1); const W=m.winner===side?1:m.winner===-1?0.5:0; const off=c.kind!=='fr';
 S.u.f5=(S.u.f5||[]).concat(W===1?'w':W===0.5?'d':'l').slice(-8); const st=S.u.f5; let ls=0,ws=0; for(let i=st.length-1;i>=0&&st[i]==='l';i--)ls++; for(let i=st.length-1;i>=0&&st[i]==='w';i--)ws++;
 const gd=m.score[side]-m.score[1-side];
 S.u.prs=Math.round(cl(pre+(We-W)*(off?24:10)+(ls>=3?6:0)-(ws>=3?4:0)+(gd<=-3?5:0),0,100)); S.u.fan=Math.round(cl(preF+(W-We)*(off?18:8)+(ws>=3?3:0)-(ls>=3?4:0)+(gd>=3?2:0),0,100));
 if(S.u.prs>=75&&pre<75){ N.mail('Пресса','Газеты требуют перемен','Серия неудач вызвала шквал критики. Журналисты обсуждают возможную отставку тренера. Давление прессы: '+S.u.prs+'%. Федерация будет строже оценивать результаты.'); for(const id of S.u.call){ const p=S.P[id]; if(p) p.mor=cl(p.mor-3,5,100); } }
 if(S.u.prs<=15&&pre>15) N.mail('Пресса','Пресса на нашей стороне','Журналисты хвалят работу тренерского штаба.');
 if(S.u.fan<=25&&preF>25) N.mail('Болельщики','Трибуны недовольны','Фанаты освистывают команду, посещаемость домашних матчей падает.');
 if(S.u.fan>=85&&preF<85) N.mail('Болельщики','Страна болеет за сборную!','Билеты на домашние матчи раскупают за минуты.'); };
const _trust=N.trust; N.trust=(d)=>_trust(d<0&&(G().u.prs??30)>=70?Math.round(d*1.3):d);
// ---------- двойное гражданство и натурализация ----------
function dualEvent(){ const S=G(); const me=S.T[S.me]; const opts=Object.values(S.T).filter(t=>t.c!==S.me&&Math.abs(t.pts-me.pts)<450); if(!opts.length) return; const O=pick(opts);
 const pos=pick(N.SQ.filter(p=>p!=='GK')); const p=N.genPlayer(S.me,pos,Math.round(me.r-5+gauss()*5),ri(18,23),{caps:0,pool:R()<.5?O.pool:me.pool,clubNat:R()<.5?O.c:S.me}); p.pend=1; p.dual=O.c;
 N.mail('Скаутская служба','Двойное гражданство: '+p.n,p.n+' ('+p.age+' лет, '+N.POS[p.pos][0]+', '+p.club+', сила '+p.o+', потенциал '+p.pot+') имеет право выступать за нас и за сборную '+O.f+' '+O.n+'. Игрок ещё не определился. Попробуем убедить его?',{type:'dual',pid:p.id,o:O.c}); }
function natEvent(){ const S=G(); const me=S.T[S.me]; const F=pick(Object.values(S.T).filter(t=>t.c!==S.me&&t.r<me.r+5)); const pos=pick(N.SQ);
 const list=N.clubsOf(S.me); const p=N.genPlayer(S.me,pos,Math.round(me.r-3+gauss()*4),ri(25,30),{caps:0,pool:F.pool,club:pick(list.slice(0,10)),lg:S.me}); p.pend=1; p.natFrom=F.c;
 N.mail('Федерация футбола','Запрос на натурализацию',p.n+' ('+p.age+' лет, '+N.POS[p.pos][0]+', сила '+p.o+') — уроженец страны '+F.n+', уже пять лет играет за '+p.club+' и хочет получить паспорт, чтобы выступать за нас. Поддержка запроса стоит 10 единиц бюджета, часть болельщиков может отнестись к этому прохладно.',{type:'nat',pid:p.id}); }
N.dualDecide=(i,yes)=>{ const S=G(); const m=S.u.mail[i]; if(!m||!m.act||m.act.done) return ''; m.act.done=1; const p=S.P[m.act.pid]; if(!p) return ''; const O=S.T[m.act.o], me=S.T[S.me]; delete p.pend;
 const ch=cl(0.45+(me.pts-O.pts)/1100+((S.u.fan??60)-55)/300+(p.o<me.str-4?0.12:0),0.1,0.9);
 if(yes&&R()<ch){ p.t=S.me; me.pl.push(p.id); N.teamStr(S.me); return p.n+' выбрал нашу сборную! Он добавлен в пул.'; }
 p.t=O.c; delete p.dual; O.pl.push(p.id); return yes?p.n+' после раздумий выбрал сборную '+O.n+'.':p.n+' будет выступать за '+O.n+'.'; };
N.natDecide=(i,yes)=>{ const S=G(); const m=S.u.mail[i]; if(!m||!m.act||m.act.done) return ''; const p=S.P[m.act.pid]; if(!p) return '';
 if(yes){ if(S.u.bud<10) return 'Недостаточно бюджета (нужно 10).'; m.act.done=1; S.u.bud-=10; S.u.fan=Math.max(0,(S.u.fan??60)-4); delete p.pend; p.nat=p.natFrom; S.T[S.me].pl.push(p.id); N.teamStr(S.me); return p.n+' получил паспорт и может вызываться в сборную.'; }
 m.act.done=1; delete S.P[p.id]; return 'Запрос отклонён.'; };
const _evWin=N.evWin; N.evWin=(e)=>{ _evWin(e); if(R()<0.3) dualEvent(); if(R()<0.1) natEvent(); };
N.fn.month=()=>{ const S=G(); snapshot(); if(S.rkH.length>1) clubMonth(); S.u.prs=Math.round((S.u.prs??30)+(30-(S.u.prs??30))*0.08); S.u.fan=Math.round((S.u.fan??60)+(60-(S.u.fan??60))*0.08);
 for(let i=0;i<S.u.mail.length;i++){ const m=S.u.mail[i]; if(m.act&&!m.act.done&&N.diffD(m.d,S.d)>45){ if(m.act.type==='dual') N.dualDecide(i,false); else if(m.act.type==='nat'){ m.act.done=1; delete S.P[m.act.pid]; } } } };
// ---------- миграция сохранений v3 → v4 ----------
N.migrate=(S)=>{ if(S.v>=4) return S; N.setS(S); if(S.T[S.me].pts===undefined) N.seedPts(S); S.u.prs=30; S.u.fan=60; S.u.y17=[]; S.u.yres=[]; N.y17Fill();
 const cyc=S.E.find(e=>e.t==='cycle'); const endD=cyc?cyc.d:N.addD(S.d,365); let d=S.d; const [y0,m0]=S.d.split('-').map(Number); for(let k=1;k<60;k++){ const dd=N.ds(y0,m0+k,1); if(dd>=endD)break; N.addEv(dd,'fn',{fn:'month'}); }
 S.v=4; return S; };
})();

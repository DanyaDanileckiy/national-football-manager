// Обновление 7: переговоры о товарищеских матчах, сборы, мировые итоги, жеребьёвки, экипировка, мировая статистика
(function(){
const N=NFM; const G=()=>N.getS(); const {R,cl,ri,pick}=N; const V6=N.v6;
const V7=N.v7={};
const rankOf=c=>N.fifaRank(c)||120;
const add=(k,v)=>{ if(G().u.eco) V6.add(k,+v.toFixed(2)); else G().u.bud=+(G().u.bud+v).toFixed(2); };
// ---------- инициализация ----------
V7.init=(S)=>{ const u=S.u;
 u.kit=u.kit||{sup:null,off:[],hype:55,rel:null,cur:null,hist:[]};
 u.dg=u.dg||{last:S.d,list:[]};
 u.camps=u.camps||[];
 if(!S.strO){ S.strO=Object.keys(S.T); S.strH=[]; }
 if(!S.strH.length) snap(S);
 if(!u.kit.off.length&&!u.kit.sup) V7.kitOffers(); };
const _init=V6.init; V6.init=(S)=>{ _init(S); V7.init(S); };
// ---------- снимки силы команд ----------
function snap(S){ const m=S.d.slice(0,7); if(S.strH.length&&S.strH[S.strH.length-1].d===m) S.strH.pop();
 S.strH.push({d:m,v:S.strO.map(c=>S.T[c]?Math.round((S.T[c].str||N.teamStr(c))*10):0).join(',')}); if(S.strH.length>96) S.strH.shift(); }
const vals=h=>h._a||(h._a=h.v.split(',').map(x=>+x/10));
V7.strAt=(c,back)=>{ const S=G(); const H=S.strH; if(H.length<2&&back>0) return null; const i=Math.max(0,H.length-1-back); const k=S.strO.indexOf(c); return k<0?null:vals(H[i])[k]; };
V7.strD=(c,back)=>{ const a=V7.strAt(c,0), b=V7.strAt(c,back); return a==null||b==null?null:+(a-b).toFixed(1); };
V7.strHist=c=>{ const S=G(); const k=S.strO.indexOf(c); return k<0?[]:S.strH.map(h=>[h.d,vals(h)[k]]); };
V7.movers=(back,n=8,conf)=>{ const S=G(); const L=S.strO.filter(c=>S.T[c]&&(!conf||S.T[c].conf===conf)).map(c=>({c,d:V7.strD(c,back)})).filter(x=>x.d!=null);
 const up=L.slice().sort((a,b)=>b.d-a.d).slice(0,n).filter(x=>x.d>0), dn=L.slice().sort((a,b)=>a.d-b.d).slice(0,n).filter(x=>x.d<0); return {up,dn}; };
// ---------- ежемесячно ----------
const _month=N.fn.month; N.fn.month=(e)=>{ _month(e); const S=G(); if(!S.u.kit) V7.init(S);
 for(const c of S.strO) if(S.T[c]) N.teamStr(c); snap(S); kitMonth(S); digest(S); };
// ---------- мировые итоги ----------
V7.imp=(f)=>{ const S=G(); const c=S.C[f.c]; const r=f.r; const rh=rankOf(f.h), ra=rankOf(f.a);
 let s=0; const k=c?c.kind:'fr';
 if(k==='final') s+= c.minor?18:34; else if(k==='qual') s+=16; else if(k==='nl') s+=11; else if(k==='po') s+=c.minor?10:24; else s+=3;
 if(c&&c.age) s*=0.55;
 if(f.ko) s+=14; if(/финал/i.test(f.st||'')&&!/1\/|полу|четверть/i.test(f.st||'')) s+=12;
 s+=Math.max(0,(160-(rh+ra)/2))/6;
 if(r){ const wl=r.hg>r.ag?[rh,ra]:r.ag>r.hg?[ra,rh]:null; if(wl&&wl[0]>wl[1]) s+=Math.min(30,(wl[0]-wl[1])/3); if(!wl&&Math.abs(rh-ra)>40) s+=Math.min(12,Math.abs(rh-ra)/8);
  s+=Math.min(6,Math.abs(r.hg-r.ag)); }
 return +s.toFixed(1); };
V7.upset=(f)=>{ const r=f.r; if(!r||r.hg===r.ag) return false; const w=r.hg>r.ag?f.h:f.a, l=w===f.h?f.a:f.h; return rankOf(w)-rankOf(l)>=30; };
function digest(S,force){ const u=S.u; const me=S.me; const L=S.F.filter(f=>f.r&&f.d>u.dg.last&&f.d<=S.d&&f.h!==me&&f.a!==me);
 if(L.length<(force?1:6)) return null;
 const top=L.map(f=>({f,s:V7.imp(f)})).sort((a,b)=>b.s-a.s).slice(0,15).map(({f,s})=>({id:f.id,d:f.d,c:f.c,st:f.st||'',h:f.h,a:f.a,hg:f.r.hg,ag:f.r.ag,pen:f.r.pen||null,w:f.r.w||null,
  sc:(f.r.sc||[]).slice(0,8).map(x=>[x[1],x[2],x[3],x[4]===1?1:0]),s,up:V7.upset(f)?1:0}));
 const d={from:u.dg.last,to:S.d,n:L.length,m:top}; u.dg.list.unshift(d); if(u.dg.list.length>12) u.dg.list.length=12; u.dg.last=S.d; u.dg.unread=1;
 N.mail(_t("Мировой футбол"),_t("Мировые итоги"),_t("Сыграно матчей других сборных: {0}. Главные результаты — в разделе «Новости».",L.length)); return d; }
V7.digest=(force)=>digest(G(),force);
// ---------- товарищеские матчи: переговоры ----------
V7.NEU=[['US',()=>_t("Нью-Йорк")],['US',()=>_t("Лос-Анджелес")],['QA',()=>_t("Доха")],['AE',()=>_t("Дубай")],['SA',()=>_t("Эр-Рияд")],['ENG',()=>_t("Лондон")],['CN',()=>_t("Шанхай")],['AU',()=>_t("Сидней")]];
V7.attract=(c)=>{ const S=G(); const t=S.T[c]; const rk=rankOf(c); const stars=S.T[c].pl.map(id=>S.P[id]).filter(p=>p&&p.o>=84).length;
 return +(0.15+2.6*Math.pow(1-rk/212,2.2)+0.12*stars).toFixed(2); };
// fee>0 — получаем мы, fee<0 — платим мы
V7.quote=(opp,ven,ni)=>{ const S=G(); const me=S.me; const am=V7.attract(me), ao=V7.attract(opp); let att;
 const ht=ven==='h'?me:ven==='a'?opp:(V7.NEU[ni]||V7.NEU[0])[0];
 const v=estVen(opp,ven,ni); att=v.att;
 let fee; if(ven==='h') fee=-(ao*0.9)+ (am>ao?0.1:0); else if(ven==='a') fee=am*0.8-(ao>am?0:0.05); else fee=0.35*(att/10000)+am*0.6-ao*0.25;
 return {fee:+fee.toFixed(2),att,cap:v.cap,ht,gate:ven==='h'?+((att/10000)*0.5).toFixed(2):0}; };
function estVen(opp,ven,ni){ const S=G(); const me=S.me; const a=S.T[me].elo, b=S.T[opp].elo; let cap,fill;
 if(ven==='h'){ const st=V6.mainSt&&S.u.st&&S.u.st.length?V6.mainSt():null; cap=st?st.cap:Math.round(cl(6000+(a-1050)*55,4000,85000)/500)*500; fill=cl(0.42+((a+b)/2-1500)/1500+((S.u.fan??60)-55)/250,0.2,1); }
 else if(ven==='a'){ cap=Math.round(cl(6000+(b-1050)*55,4000,85000)/500)*500; fill=cl(0.42+((a+b)/2-1500)/1500,0.2,1); }
 else { cap=[60000,70000,45000,40000,60000,80000,55000,45000][ni]||50000; fill=cl(0.25+(V7.attract(me)+V7.attract(opp))/6,0.15,0.95); }
 return {cap,att:Math.round(cap*fill/100)*100}; }
V7.neg=null;
V7.startNeg=(d,opp,ven,ni)=>{ const q=V7.quote(opp,ven,ni); const n={d,opp,ven,ni:+ni||0,ask:q.fee,q,round:0,mood:1,st:'open'}; V7.neg=n; return n; };
// пользователь предлагает свою сумму (что мы хотим получить; отрицательное — заплатить)
V7.counter=(val)=>{ const n=V7.neg; if(!n||n.st!=='open') return n; n.round++; const gap=val-n.ask; // >0 — хотим больше, чем предлагают
 const tol=0.12+Math.abs(n.ask)*0.08; const p=gap<=0?1:cl(1-gap/(tol*3),0,1)*n.mood;
 if(R()<p){ n.ask=+val.toFixed(2); n.st='agreed'; return n; }
 n.mood*=0.7; if(n.round>=3||R()<0.15*n.round){ n.st='walk'; return n; }
 n.ask=+(n.ask+gap*0.35*(R()*0.5+0.5)).toFixed(2); n.st='open'; return n; };
V7.accept=()=>{ const n=V7.neg; if(!n||n.st==='walk') return false; const S=G(); const me=S.me;
 if(N.busy(me,n.d)||N.busy(n.opp,n.d)) return false;
 const home=n.ven!=='a'; const f=N.addFix(n.d,'FR',home?me:n.opp,home?n.opp:me,_t("Товарищеский матч"));
 f.fee=n.ask; if(n.ven==='n'){ f.neu=1; const nv=V7.NEU[n.ni]||V7.NEU[0]; f.nc=n.ni; const ht=S.T[nv[0]]?nv[0]:me; f.vh=ht; }
 n.st='done'; V7.neg=null; return f; };
const _ven=N.venue; N.venue=(f)=>{ if(f.vn) return f.vn; if(f.nc!=null&&f.neu){ const S=G(); const e=estVen(f.h===S.me?f.a:f.h,'n',f.nc); const m=+f.d.slice(5,7); const hot=['QA','AE','SA'].includes(f.vh)||(m>=6&&m<=8);
  const r=R(); const wx=r<.15?'rain':hot&&r<.6?'heat':r<.3?'wind':r<.55?'cloud':'clear'; f.vn={wx,cap:e.cap,att:e.att,fill:+(e.att/e.cap).toFixed(2),st:(V7.NEU[f.nc]||V7.NEU[0])[1](),neuC:1}; return f.vn; }
 return _ven(f); };
const _ofd=N.onFixDone; N.onFixDone=(f)=>{ if(f.fee!=null&&f.r&&!f.feeP){ f.feeP=1; add('fee',f.fee); } _ofd(f); };
// ---------- тренировочные сборы ----------
V7.CAMPS=[['home',()=>_t("Своя база"),'temp',0.0,0.04],['spain',()=>_t("Испания (умеренный климат)"),'temp',0.9,0.07],['gulf',()=>_t("ОАЭ (жара)"),'hot',1.1,0.08],['alps',()=>_t("Альпы (высокогорье)"),'alt',1.3,0.09],['tropic',()=>_t("Таиланд (влажный климат)"),'hot',0.8,0.07]];
V7.nextTour=()=>{ const S=G(); const me=S.me; const f=S.F.filter(f=>!f.r&&(f.h===me||f.a===me)&&S.C[f.c]&&S.C[f.c].kind==='final'&&!S.C[f.c].age).sort((a,b)=>a.d<b.d?-1:1)[0]; if(!f) return null; const dd=N.diffD(S.d,f.d); return dd<=75?{f,c:S.C[f.c],dd}:null; };
V7.campCost=(loc,days)=>{ const L=V7.CAMPS.find(x=>x[0]===loc)||V7.CAMPS[0]; return +((0.25+L[3])*days/7*1.1+(L[0]==='home'?0:0.4)).toFixed(2); };
V7.campDone=()=>{ const S=G(); const nt=V7.nextTour(); const key=nt?nt.c.id:'w'+S.u.win; return S.u.camps.some(c=>c.k===key); };
V7.camp=(loc,days)=>{ const S=G(); const u=S.u; const L=V7.CAMPS.find(x=>x[0]===loc)||V7.CAMPS[0]; const cost=V7.campCost(loc,days); if(u.bud<cost) return {err:_t("Недостаточно бюджета")}; if(V7.campDone()) return {err:_t("Сбор уже проведён")};
 const nt=V7.nextTour(); const pre=nt?1:0.5; const host=nt&&nt.c.host; const hostHot=host&&['QA','AE','SA','KW','BH','OM','MX','BR','US','EG','NG','IN','TH','ID'].includes(host); const match=nt&&((L[2]==='hot'&&hostHot)||(L[2]==='alt'))?1.35:1;
 add('fac',-cost); const fam=u.fam||(u.fam={tac:50,sp:50,f:'4-3-3'}); const tg=Math.round(days*0.9*pre*(L[0]==='home'?0.8:1)); fam.tac=Math.min(100,fam.tac+tg); fam.sp=Math.min(100,fam.sp+Math.round(tg*0.5));
 const ids=(u.call&&u.call.length?u.call:S.T[S.me].pl).map(id=>S.P[id]).filter(p=>p&&!p.ret); const inj=[]; let fit=0;
 for(const p of ids){ p.fit=Math.min(100,(p.fit||90)+Math.round(days*0.8*match)); p.mor=Math.min(100,(p.mor||60)+2); fit++; if(R()<L[4]*days/14*0.35){ p.inj=Math.max(p.inj||0,ri(3,12)); inj.push(p.n); } }
 const rec={d:S.d,k:nt?nt.c.id:'w'+u.win,loc,days,cost,tg,inj,pre:nt?nt.c.n:null}; u.camps.unshift(rec); if(u.camps.length>20) u.camps.length=20; return rec; };
// ---------- технический спонсор и формы ----------
V7.SUP=['Volantis','Kestrel Sport','Orbita','Taiga Athletic','Meridian','Corvo','Arrowline','Solenne','Bravura','Nimbus Kit'];
V7.kitOffers=()=>{ const S=G(); const u=S.u; const rk=rankOf(S.me); const tro=u.tro.filter(t=>N.diffD(t.d,S.d)<1460).length; const base=0.4+7*Math.pow(1-rk/212,2.4)+0.5*tro+(u.kit.hype-50)/80;
 const used=new Set(); u.kit.off=[0,1,2].map(i=>{ let n; do n=pick(V7.SUP); while(used.has(n)); used.add(n); const y=[2,3,4,5,6][ri(0,4)]; const k=0.8+R()*0.45-(y-4)*0.02;
  return {n,y,fee:+Math.max(0.05,base*k).toFixed(2),bt:+(base*k*0.6+0.3).toFixed(2),bq:+(base*k*0.25+0.1).toFixed(2),mk:+(0.08+R()*0.14).toFixed(2)}; }); return u.kit.off; };
V7.signKit=(i)=>{ const S=G(); const u=S.u; const o=u.kit.off[i]; if(!o) return false; u.kit.sup={...o,from:S.d,until:N.addD(S.d,o.y*365)}; u.kit.off=[]; u.kit.hype=Math.min(100,u.kit.hype+4); N.mail(_t("Федерация футбола"),_t("Технический спонсор"),_t("Подписан контракт с {0} на {1} г.",o.n,o.y)); return true; };
V7.PAT=['plain','stripes','hoops','sash','halves','chevron','pin','band'];
V7.PATN={plain:()=>_t("Однотонная"),stripes:()=>_t("Вертикальные полосы"),hoops:()=>_t("Горизонтальные полосы"),sash:()=>_t("Диагональная лента"),halves:()=>_t("Половины"),chevron:()=>_t("Шеврон"),pin:()=>_t("Тонкие полосы"),band:()=>_t("Поперечная полоса")};
V7.palette=(c)=>{ const k=(N.KITS&&N.KITS[c])||['#2457a6','#ffffff']; const base=[k[0],k[1]]; const dark=h=>{ const n=parseInt(h.slice(1),16); const f=x=>Math.round(x*0.6).toString(16).padStart(2,'0'); return '#'+f(n>>16&255)+f(n>>8&255)+f(n&255); };
 return [...new Set([...base,dark(k[0]),dark(k[1]),'#ffffff','#111111','#c9a227'].map(x=>x.toLowerCase()))]; };
V7.kitCost=()=>2.5;
V7.canRelease=()=>{ const S=G(); const r=S.u.kit.rel; return !r||N.diffD(r,S.d)>=300; };
V7.release=(home,away)=>{ const S=G(); const u=S.u; if(!V7.canRelease()) return {err:_t("Новую форму можно выпускать раз в 10 месяцев")}; const cost=u.kit.sup?0:V7.kitCost(); if(u.bud<cost) return {err:_t("Недостаточно бюджета")};
 if(cost) add('build',-cost); const prev=u.kit.cur; let nov=10; if(prev){ if(prev.home.p!==home.p) nov+=8; if(prev.home.c1!==home.c1) nov+=6; if(prev.away.p!==away.p) nov+=4; } else nov+=10;
 const stars=S.T[S.me].pl.map(id=>S.P[id]).filter(p=>p&&p.o>=82).length; const g=Math.round(nov+((u.fan??60)-50)/4+Math.min(8,stars)+R()*6); u.kit.hype=cl(Math.round(u.kit.hype*0.45+18+g),10,100);
 u.kit.cur={home,away,d:S.d,h0:u.kit.hype}; u.kit.rel=S.d; u.kit.hist.unshift({d:S.d,home,away,hype:u.kit.hype}); if(u.kit.hist.length>10) u.kit.hist.length=10; return {hype:u.kit.hype}; };
const _kit=N.kit; N.kit=(c)=>{ const S=G(); if(S&&c===S.me&&S.u.kit&&S.u.kit.cur){ const h=S.u.kit.cur.home; return [h.c1,h.c2]; } return _kit(c); };
V7.merchK=()=>{ const S=G(); const u=S.u; if(!u.kit) return 1; const stars=S.T[S.me].pl.map(id=>S.P[id]).filter(p=>p&&p.o>=84).length; const form=(S.T[S.me].fl||[]).slice(-6); return +(0.55+u.kit.hype/110+stars*0.04+((u.fan??60)-60)/200).toFixed(3); };
function kitMonth(S){ const u=S.u; const k=u.kit; k.hype=Math.round(cl(k.hype+(55-k.hype)*0.04+((u.fan??60)-60)/40,5,100));
 if(k.sup){ add('kit',k.sup.fee/12); if(S.d>=k.sup.until){ N.mail(_t("Федерация футбола"),_t("Технический спонсор"),_t("Контракт с {0} истёк. Изучите новые предложения.",k.sup.n)); k.sup=null; V7.kitOffers(); } }
 else if(!k.off.length||S.d.slice(5,7)==='01') V7.kitOffers();
 const t=u.tro.length; if(k.sup&&t>(k.tro??t)){ add('kit',k.sup.bt); } k.tro=t;
 k.qd=k.qd||[]; for(const c of Object.values(S.C)) if(c.kind==='final'&&!c.age&&!c.minor&&c.teams&&c.teams.includes(S.me)&&!k.qd.includes(c.id)){ k.qd.push(c.id); if(k.qd.length>30) k.qd.shift(); if(k.sup&&N.diffD(k.sup.from,S.d)>0) add('kit',k.sup.bq); } }
// ---------- жеребьёвка: межконтинентальный плей-офф с разведением конфедераций ----------
const _sk=N.startKO; N.startKO=(c,seeds,pairs)=>{ if(pairs||c.conf!=='ALL'||!c.po||c.cup||c.paths) return _sk(c,seeds,pairs);
 const S=G(); const pt=x=>S.T[x].pts??S.T[x].elo; let s=c.seedElo?seeds.slice():seeds.slice().sort((a,b)=>pt(b)-pt(a)); const byes=c.byes?s.slice(0,c.byes):null; if(byes) s=s.slice(c.byes); const n=s.length; if(n<2||n%2) return _sk(c,seeds,pairs);
 const cf=x=>S.T[x]&&S.T[x].conf; const top=s.slice(0,n/2), bot=s.slice(n/2).reverse();
 for(let i=0;i<top.length;i++) if(cf(top[i])===cf(bot[i])){ for(let j=0;j<bot.length;j++){ if(j===i) continue; if(cf(top[i])!==cf(bot[j])&&cf(top[j])!==cf(bot[i])){ [bot[i],bot[j]]=[bot[j],bot[i]]; break; } } }
 const pr=top.map((t,i)=>[t,bot[i]]); c.sepOK=pr.every(([a,b])=>cf(a)!==cf(b))?1:0; _sk(c,seeds,pr); c.byeT=byes; };
V7.drawRule=(c)=>{ if(!c) return ''; if(c.conf==='ALL') return c.po?_t("Пары составлены по рейтингу ФИФА; команды одной конфедерации не встречаются друг с другом в первом раунде."):_t("Ограничение: в группе не более 2 команд УЕФА и не более 1 команды от каждой другой конфедерации.");
 return _t("Все участники — из одной конфедерации, поэтому дополнительных ограничений нет."); };
// ---------- мировая статистика ----------
V7.cycStart=()=>{ const S=G(); return S.cyc&&S.cyc.Y?N.ds(S.cyc.Y,8,1):String(+S.d.slice(0,4)-1)+'-08-01'; };
V7.stats=()=>{ const S=G(); const from=V7.cycStart(); const g={}, sc={}, big=[], strk={}, cur={};
 const fx=S.F.filter(f=>f.r&&!(S.C[f.c]&&S.C[f.c].age)).sort((a,b)=>a.d<b.d?-1:1);
 for(const f of fx){ const r=f.r; const inC=f.d>=from; if(inC){ g[f.h]=(g[f.h]||0)+r.hg; g[f.a]=(g[f.a]||0)+r.ag; for(const x of r.sc||[]){ const k=x[0]; if(!sc[k]) sc[k]={id:k,n:x[1],t:x[2]===0?f.h:f.a,g:0}; sc[k].g++; } }
  big.push({id:f.id,d:f.d,h:f.h,a:f.a,hg:r.hg,ag:r.ag,m:Math.abs(r.hg-r.ag),c:f.c});
  for(const [t,gf,ga] of [[f.h,r.hg,r.ag],[f.a,r.ag,r.hg]]){ const z=cur[t]||(cur[t]={w:0,u:0}); if(gf>ga){z.w++;z.u++;} else if(gf===ga){z.w=0;z.u++;} else {z.w=0;z.u=0;} const b=strk[t]||(strk[t]={w:0,u:0}); b.w=Math.max(b.w,z.w); b.u=Math.max(b.u,z.u); } }
 const at=Object.values(S.P).filter(p=>p.g>0).sort((a,b)=>b.g-a.g).slice(0,25).map(p=>({id:p.id,n:p.n,t:p.t,g:p.g,caps:p.caps}));
 return {from,cyc:Object.values(sc).sort((a,b)=>b.g-a.g).slice(0,25),at,goals:Object.entries(g).sort((a,b)=>b[1]-a[1]).slice(0,30),big:big.sort((a,b)=>b.m-a.m||(b.hg+b.ag)-(a.hg+a.ag)).slice(0,12),
  sw:Object.entries(strk).sort((a,b)=>b[1].w-a[1].w).slice(0,10),su:Object.entries(strk).sort((a,b)=>b[1].u-a[1].u).slice(0,10),cur}; };
})();

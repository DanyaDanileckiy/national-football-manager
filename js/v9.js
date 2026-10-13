// Обновление 9: дерби и соперничества, карьера тренера, достижения, сценарии (логика, без интерфейса)
(function(){
const N=NFM; const G=()=>N.getS(); const {cl}=N; const V9=N.v9={};
const HEADLESS=typeof document==='undefined';
const rnd=()=>Math.random();
const key=(a,b)=>a<b?a+'-'+b:b+'-'+a;
const LS={ get(k,d){ try{ const v=globalThis.localStorage&&localStorage.getItem(k); return v?JSON.parse(v):d; }catch(e){ return d; } }, set(k,v){ try{ globalThis.localStorage&&localStorage.setItem(k,JSON.stringify(v)); }catch(e){} } };
V9.LS=LS;
// ===================== 1. Дерби и соперничества =====================
V9.RNAME=[_t("Принципиальное противостояние"),_t("Суперкласико Америк"),_t("Старейшее дерби мира"),_t("Иберийское дерби"),_t("Ла-Платское дерби"),_t("Классика КОНКАКАФ"),_t("Классика Восточной Азии"),_t("Магрибское дерби"),_t("Дерби соседей"),_t("Скандинавское дерби"),_t("Балканское дерби"),_t("Эгейское дерби"),_t("Дерби через Ла-Манш"),_t("Классика Европы"),_t("Дерби Персидского залива"),_t("Транстасманское дерби"),_t("Западноафриканское дерби"),_t("Дерби Юго-Восточной Азии"),_t("Тихоокеанское дерби"),_t("Андское дерби"),_t("Центральноамериканское дерби"),_t("Британское дерби"),_t("Новое противостояние")];
// пара:накал(1–3):название
const RAW='AR-BR:3:1 AR-UY:3:4 BR-UY:2:0 AR-CL:2:0 AR-ENG:3:0 CL-PE:2:18 BO-CL:2:18 CO-EC:1:19 ENG-DE:3:13 ENG-SCO:3:2 ENG-FR:2:12 ENG-IE:1:21 ENG-WAL:2:21 IE-NIR:2:21 NL-DE:3:13 DE-IT:2:13 FR-IT:2:13 ES-IT:2:13 FR-DE:2:13 ES-PT:3:3 FR-BE:2:8 NL-BE:2:8 DE-AT:2:8 CZ-SK:2:8 HU-RO:2:8 PL-DE:2:8 DK-SE:2:9 SE-NO:2:9 RS-HR:3:10 HR-BA:2:10 RS-BA:2:10 GR-TR:3:11 MX-US:3:5 US-CA:2:8 MX-CR:2:20 CR-HN:2:20 HN-SV:2:20 JM-TT:2:8 KR-JP:3:6 JP-CN:2:6 CN-KR:2:6 AU-JP:2:0 AU-NZ:2:15 IR-IQ:2:0 IR-SA:2:14 SA-QA:2:14 VN-TH:2:17 ID-MY:3:17 MY-SG:2:17 MA-DZ:3:7 EG-DZ:3:0 TN-DZ:2:7 MA-TN:2:7 EG-MA:1:0 NG-GH:3:16 CI-GH:2:16 SN-CI:1:16 NG-CM:2:0 UZ-IR:1:0 PE-EC:1:19';
V9.RIV={}; for(const s of RAW.split(' ')){ const [p,l,n]=s.split(':'); const [a,b]=p.split('-'); V9.RIV[key(a,b)]={l:+l,n:+n}; }
V9.rival=(a,b)=>{ if(!a||!b||a===b) return null; const k=key(a,b); const st=V9.RIV[k]; const S=G(); const dyn=S&&S.r9&&S.r9[k]||0; const dl=dyn>=6?2:dyn>=3?1:0;
 if(st) return {l:Math.min(3,st.l+(dl>=2?1:0)),n:st.n,dyn:0,k}; if(dl) return {l:dl,n:22,dyn:dyn,k}; return null; };
V9.rivName=r=>r?V9.RNAME[r.n]||V9.RNAME[0]:'';
V9.rivalsOf=c=>{ const S=G(); const out=[]; const seen=new Set(); for(const k in V9.RIV){ const [a,b]=k.split('-'); if((a===c||b===c)&&S.T[a]&&S.T[b]){ const o=a===c?b:a; out.push({c:o,...V9.rival(c,o)}); seen.add(o); } }
 for(const k in (S.r9||{})){ const [a,b]=k.split('-'); if((a===c||b===c)&&S.T[a]&&S.T[b]){ const o=a===c?b:a; if(seen.has(o)) continue; const r=V9.rival(c,o); if(r) out.push({c:o,...r}); } }
 return out.sort((x,y)=>y.l-x.l); };
// головная статистика: компактный журнал матчей пар (дерби + все матчи сборной игрока)
function logH2H(f){ const S=G(); if(f.y||!f.r) return; const k=key(f.h,f.a); const r=V9.rival(f.h,f.a); const mine=f.h===S.me||f.a===S.me;
 if(!r&&!mine&&!(S.h9[k])) return; const c=S.C[f.c]; const L=S.h9[k]=S.h9[k]||[];
 L.push([f.d,f.h,f.a,f.r.hg,f.r.ag,c?(c.sh||''):'',f.r.pen?f.r.pen.join(':'):0,c?(c.kind==='fr'?0:c.kind==='final'?2:1):0,f.r.w||0]); if(L.length>40) L.splice(0,L.length-40); }
V9.h2h=(a,b)=>{ const S=G(); const L=(S.h9&&S.h9[key(a,b)])||[]; const o={p:0,w:0,d:0,l:0,gf:0,ga:0,big:null,bigL:null,last:L.slice(-10).reverse(),all:L};
 for(const x of L){ const my=x[1]===a?x[3]:x[4], op=x[1]===a?x[4]:x[3]; o.p++; o.gf+=my; o.ga+=op; const w=x[8]?(x[8]===a?1:-1):Math.sign(my-op); if(w>0)o.w++; else if(w<0)o.l++; else o.d++;
  if(my-op>0&&(!o.big||my-op>o.big[0]||(my-op===o.big[0]&&my>o.big[1]))) o.big=[my-op,my,op,x]; if(op-my>0&&(!o.bigL||op-my>o.bigL[0]||(op-my===o.bigL[0]&&op>o.bigL[2]))) o.bigL=[op-my,my,op,x]; }
 o.arch=N.v6&&N.v6.oldH2H?N.v6.oldH2H(a,b):null; return o; };
// заголовки прессы: храним ключи, переводим при показе
function hl(k,args,ex){ const S=G(); S.u.hl=S.u.hl||[]; S.u.hl.unshift({d:S.d,k,a:args,...(ex||{})}); if(S.u.hl.length>60) S.u.hl.length=60; S.u.hlU=(S.u.hlU||0)+1; }
V9.hl=hl;
// матч: домашняя поддержка в дерби
const _mo=N.matchOpts; N.matchOpts=(f,auto)=>{ const o=_mo(f,auto); const r=V9.rival(f.h,f.a); if(r){ o.derby=r.l; if(!f.neu&&o.hf>0) o.hf*=1+0.05*r.l; } return o; };
// ===================== 3. Карьера тренера =====================
V9.prestige=c=>{ const t=G().T[c]; return t?cl(Math.round((t.r||50)*1.25-25),5,95):30; };
const yearsLater=(d,y)=>{ const [a,b,c]=d.split('-').map(Number); return N.ds(a+y,b,c); };
function newJob(S,c,why){ const u=S.u; const car=u.car; car.hist.push({c,from:S.d,to:null,why:null,s0:{...u.stat},t0:u.tro.length,rk0:N.fifaRank?N.fifaRank(c)||0:0,dw0:car.dw||0}); car.cEnd=yearsLater(S.d,4); car.ren=null; car.out=null; repPt(S); }
function closeJob(S,why){ const car=S.u.car; const h=car.hist[car.hist.length-1]; if(!h||h.to) return; h.to=S.d; h.why=why; const st=S.u.stat; h.w=st.w-h.s0.w; h.d=st.d-h.s0.d; h.l=st.l-h.s0.l; h.gf=st.gf-h.s0.gf; h.ga=st.ga-h.s0.ga; h.tro=S.u.tro.length-h.t0; h.rk1=N.fifaRank?N.fifaRank(h.c)||0:0; }
V9.jobStats=h=>{ if(h.to) return h; const S=G(); const st=S.u.stat; return {...h,w:st.w-h.s0.w,d:st.d-h.s0.d,l:st.l-h.s0.l,gf:st.gf-h.s0.gf,ga:st.ga-h.s0.ga,tro:S.u.tro.length-h.t0,rk1:N.fifaRank(h.c)||0}; };
function repPt(S){ const car=S.u.car; const last=car.rh[car.rh.length-1]; const v=Math.round(car.rep*10)/10; if(last&&last[0]===S.d){ last[1]=v; return; } car.rh.push([S.d,v]); if(car.rh.length>160) car.rh.splice(0,car.rh.length-160); }
V9.rep=(d)=>{ const S=G(); const car=S.u.car; if(!car||S.u.fired) return; car.rep=cl(car.rep+d,0,100); car.repMax=Math.max(car.repMax||0,car.rep); };
V9.isOut=()=>{ const S=G(); return !!(S&&S.u.fired&&S.u.car&&S.u.car.out); };
// инициализация / миграция старых сейвов
V9.init=(S)=>{ const u=S.u; const fresh=!u.car&&S.d==='2026-08-01'&&!u.stat.w&&!u.stat.d&&!u.stat.l;
 S.h9=S.h9||{}; S.r9=S.r9||{}; u.hl=u.hl||[];
 if(!u.car){ const t=S.T[S.me]; let rep=cl(15+((t.r||50)-50)*0.6,10,45); if(!fresh){ rep+=u.tro.length*6+(u.trust-50)/5+u.stat.w/10; rep=cl(rep,5,90); }
  u.car={rep,repMax:rep,rh:[],hist:[],cEnd:null,ren:null,out:null,dw:0,dec:0};
  const tl=u.teams||[{c:S.me,from:S.d}]; tl.forEach((x,i)=>{ if(i<tl.length-1) u.car.hist.push({c:x.c,from:x.from,to:tl[i+1].from,why:'move',s0:{w:0,d:0,l:0,gf:0,ga:0},t0:0,w:0,d:0,l:0,gf:0,ga:0,tro:0,old:1}); });
  const cur=tl[tl.length-1]; u.car.hist.push({c:S.me,from:cur.from,to:null,s0:fresh?{...u.stat}:{w:0,d:0,l:0,gf:0,ga:0},t0:0,rk0:0,dw0:0});
  u.car.cEnd=yearsLater(S.d>cur.from?S.d:cur.from,fresh?4:2); if(fresh) u.car.cEnd=yearsLater(cur.from,4); repPt(S);
  if(u.fired) u.car.out={since:S.d,why:'fired',off:((S.u.mail.find(m=>m.act&&m.act.type==='fired')||{act:{}}).act.off||[]).map(c=>({c,d:S.d}))};
 }
 if(u.tips===undefined&&fresh) u.tips={on:1,seen:{},v:1};
 if(!u.scn&&N._pendScn&&fresh){ const sc=V9.SCN.find(x=>x.id===N._pendScn); if(sc&&sc.t===S.me) u.scn={id:sc.id,st:'run',from:S.d,end:sc.end}; }
 N._pendScn=null; };
const _v6i=N.v6.init; N.v6.init=(S)=>{ _v6i(S); if(S) V9.init(S); };
// репутация от матчей: результат против ожидания
const _au=N.afterUser; N.afterUser=(f,m)=>{ const S=G(); if(V9.isOut()) return; const side=f.h===S.me?0:1; const me=S.T[S.me], opp=S.T[side?f.h:f.a]; const c=S.C[f.c];
 const we=1/(1+Math.pow(10,-(me.elo-opp.elo+(f.neu?0:side?-80:80))/400));
 const trust0=S.u.trust; _au(f,m);
 const res=m.winner===side?1:m.winner===-1?0.5:0; const K=c.kind==='fr'?0.25:c.kind==='final'?1.6:1; V9.rep(K*(res-we));
 const r=V9.rival(f.h,f.a); const my=m.score[side], op=m.score[1-side];
 if(r){ const L=r.l; const name=V9.rivName(r);
  // дерби: сильнее колебания доверия, морали, давления прессы
  const dt=res===1?L:res===0?-(L+1):0; if(dt) N.trust(dt); S.u.fan=cl((S.u.fan??60)+(res===1?2*L:res===0?-2*L:0),0,100); S.u.prs=cl((S.u.prs??30)+(res===0?4*L:res===1?-2*L:L),0,100);
  for(const id of S.u.call){ const p=S.P[id]; if(p) p.mor=cl(p.mor+(res===1?3*L:res===0?-3*L:0),5,100); }
  if(res===1){ S.u.car.dw=(S.u.car.dw||0)+1; N.ach('d1'); if(my-op>=3) N.ach('drout'); if(S.u.car.dw>=10) N.ach('d10'); V9.rep(0.6*L); }
  else if(res===0) V9.rep(-0.4*L);
  hl(res===1?(my-op>=3?'rw':'w'):res===0?(op-my>=3?'rw':'w'):'d',[res===1?S.me:res===0?opp.c:'',f.h,f.a,(f.r.hg)+':'+(f.r.ag),r.n,f.r.pen?f.r.pen.join(':'):''],{u:1,dt:S.u.trust-trust0});
 }
 // камбэк и серия пенальти
 if(res===1){ let d=0,mn=0; for(const e of m.ev) if(e.t==='goal'){ d+=e.side===side?1:-1; mn=Math.min(mn,d); } if(mn<=-2) N.ach('comeback'); if(m.pens) N.ach('pens'); }
 V9.check(); };
// матчи всего мира: журнал дерби, динамические соперничества, заголовки
const _pf=N.playFix; N.playFix=(f,m)=>{ const S=G(); _pf(f,m); if(f.y||!f.r) return; const out=V9.isOut(); if(out&&(f.h===S.me||f.a===S.me)){ f.u=0; if(f.r) delete f.r.det; }
 logH2H(f); const c=S.C[f.c]; if(!c) return;
 if(f.ko&&f.leg!==1&&c.kind!=='fr'&&c.kind!=='y'&&!c.age){ const k=key(f.h,f.a); const was=V9.rival(f.h,f.a); S.r9[k]=(S.r9[k]||0)+1; const now=V9.rival(f.h,f.a);
  if(now&&now.dyn&&(!was||was.l<now.l)&&now.l===1){ hl('nw',[S.r9[k],f.h,f.a],{nw:1}); if(!out&&(f.h===S.me||f.a===S.me)){ N.ach('dnew'); N.mail(_t("Пресса"),_t("Новое противостояние"),_t("После очередной встречи в плей-офф журналисты заговорили о новом соперничестве: {0} — {1}. Теперь эти матчи — особые.",S.T[f.h].n,S.T[f.a].n)); } } }
 if(f.h!==S.me&&f.a!==S.me&&c.kind!=='fr'){ const r=V9.rival(f.h,f.a); if(r&&r.l>=2&&(c.kind==='final'||r.l===3)){ const w=f.r.w||(f.r.hg>f.r.ag?f.h:f.r.ag>f.r.hg?f.a:''); hl(w?(Math.abs(f.r.hg-f.r.ag)>=3?'rw':'w'):'d',[w,f.h,f.a,f.r.hg+':'+f.r.ag,r.n,f.r.pen?f.r.pen.join(':'):'']); S.u.hlU=Math.max(0,(S.u.hlU||1)-1); } } };
// турниры: репутация, трофеи, сценарии
const LVL={6:'w',5:'f',4:'sf'};
const _cd=N.compDone; N.compDone=(c)=>{ const S=G(); if(V9.isOut()){ const me=S.me; let tmp=null; for(const x in S.T) if(!(c.teams||[]).includes(x)&&x!==me&&!(c.ko||[]).some(rd=>rd.some(t=>t.h===x||t.a===x))){ tmp=x; break; } S.me=tmp||me; try{ _cd(c); } finally{ S.me=me; } return; }
 const me=S.me; const inC=(c.teams||[]).includes(me); const ex=inC?(S.u.expect[c.id]??N.expectLevel(c)):null; const got=inC?N.achievedLevel(c):null;
 _cd(c); if(!inC||c.kind==='y'||c.age) return;
 const q=(c.kind==='qual'||c.yq||c.po)&&!c.cup; const k=c.quick?0.5:c.minor?1:c.kind==='final'?3:q?4:1.5; V9.rep(cl((got-(ex??got))*k,-10,14));
 if(c.w===me&&(!c.po||c.cup)){ V9.rep(c.minor||c.quick?3:/^WC_/.test(c.id)?16:c.kind==='final'?10:5); if(c.kind==='nl') N.ach('nl'); }
 if(c.kind==='final'&&!c.minor&&!c.quick){ if(got>=5) N.ach('final'); const ts=N.topScorers(c.id)[0]; if(ts&&ts.t===me) N.ach('boot'); }
 repPt(S); V9.scnComp(c,got); V9.check(); };
// увольнение и предложения по репутации
const _off=N.offers; N.offers=(fired)=>{ const S=G(); const car=S.u.car; if(!car) return _off(fired);
 if(fired){ closeJob(S,'fired'); V9.rep(-8); car.rep=cl(car.rep-0,0,100); N.ach('fired'); const off=V9.genOffers(true); car.out={since:S.d,why:'fired',off:off.map(c=>({c,d:S.d}))}; repPt(S); V9.scnLeave();
  N.mail(_t("Федерация футбола"),_t("Вы уволены"),off.length?_t("К сожалению, федерация потеряла доверие к вашей работе и приняла решение расторгнуть контракт. Однако вашей кандидатурой заинтересовались другие федерации — выберите новую команду."):_t("Федерация расторгла контракт. Пока предложений нет — придётся подождать, пока о вас вспомнят."),{type:'fired',off});
  if(HEADLESS) S.u.fired=1; return; }
 const off=V9.genOffers(false); off.forEach(t=>N.mail(_t("Федерация {0}",(S.T[t].n)),_t("Предложение о работе"),`${_t("Федерация футбола {0} {1} предлагает вам возглавить национальную сборную. Сила команды",(S.T[t].f),(S.T[t].n))}: ${(N.starsHtml(N.stars(S.T[t])))}. ${_t("Ваша репутация: {0}.",Math.round(car.rep))}`,{type:'offer',t})); };
V9.genOffers=(out)=>{ const S=G(); const car=S.u.car; const rep=car.rep; const cur=S.me; const curP=V9.prestige(cur);
 const pend=new Set(S.u.mail.filter(m=>m.act&&m.act.type==='offer'&&!m.act.done).map(m=>m.act.t)); const all=Object.values(S.T).filter(t=>t.c!==cur&&!pend.has(t.c)&&!(car.out&&car.out.off||[]).some(o=>o.c===t.c));
 let c=all.filter(t=>{ const p=V9.prestige(t.c); return out?(p<=rep+6&&p>=rep-32):(p>=curP+3&&p<=rep+10); });
 if(!c.length) return []; c.sort(()=>rnd()-0.5); const n=out?(rep>=40?3:rep>=22?2:rep>=12?1:(rnd()<0.4?1:0)):(rnd()<0.6?1:2); return c.slice(0,n).map(t=>t.c); };
const _tj=N.takeJob; N.takeJob=(t)=>{ const S=G(); const car=S.u.car; if(car){ closeJob(S,car.out?(car.out.why||'fired'):'move'); if(!car.out) V9.scnLeave(); } _tj(t); if(car){ newJob(S,t); car.rep=cl(car.rep+1,0,100); if(new Set(car.hist.map(h=>h.c)).size>=3) N.ach('jobs3'); } };
const _cj=N.checkJob; N.checkJob=(b)=>{ if(V9.isOut()) return; _cj(b); };
const _ach=N.ach; N.ach=(k)=>{ const S=G(); if(!S||V9.isOut()||!N.ACH[k]) return; const had=S.u.ach[k]; _ach(k); if(!had&&S.u.ach[k]){ const g=LS.get('nfm_ach',{}); if(!g[k]){ g[k]={ts:Date.now(),d:S.d,t:S.me}; LS.set('nfm_ach',g); } if(N.onAch) try{ N.onAch(k); }catch(e){} } };
V9.resign=()=>{ const S=G(); const car=S.u.car; closeJob(S,'resign'); V9.rep(-2); S.u.fired=1; const off=V9.genOffers(true); car.out={since:S.d,why:'resign',off:off.map(c=>({c,d:S.d}))}; repPt(S); V9.scnLeave();
 N.mail(_t("Федерация футбола"),_t("Отставка принята"),_t("Федерация приняла вашу отставку и благодарит за работу.")); };
V9.renew=(yes)=>{ const S=G(); const car=S.u.car; if(!car.ren) return; if(yes){ car.cEnd=yearsLater(car.cEnd,car.ren.y); car.ren=null; N.ach('renew'); N.trust(3); N.mail(_t("Федерация футбола"),_t("Контракт продлён"),_t("Контракт продлён до {0}.",N.fmtD(car.cEnd))); } else { car.ren.no=1; N.ach('declined'); } };
V9.decline=()=>{ const S=G(); S.u.car.dec=(S.u.car.dec||0)+1; N.ach('declined'); };
// ожидание предложений (безработный): шаг времени без управления сборной
V9.waitStep=()=>{ const S=G(); const car=S.u.car; const out=car.out; if(!out) return;
 out.off=(out.off||[]).filter(o=>N.diffD(o.d,S.d)<90); const p=cl(0.12+car.rep/110,0.08,0.8)*(N.diffD(out.since,S.d)>400?1.25:1);
 if(rnd()<p){ const nw=V9.genOffers(true).slice(0,rnd()<0.5?1:2); for(const c of nw){ out.off.push({c,d:S.d}); N.mail(_t("Федерация {0}",S.T[c].n),_t("Предложение о работе"),_t("Федерация футбола {0} {1} готова доверить вам национальную сборную.",S.T[c].f,S.T[c].n)); } }
 car.rep=cl(car.rep-0.4,0,100); };
V9.snap=()=>{ const S=G(); const u=S.u; return {stat:{...u.stat},trust:u.trust,tro:u.tro.length,ach:{...u.ach},ml:u.mail.length,mail:u.mail.slice(),bud:u.bud,press:u.press,call:u.call.slice(),fan:u.fan,prs:u.prs,hl:u.hl.length}; };
V9.restore=(x)=>{ const S=G(); const u=S.u; u.stat=x.stat; u.trust=x.trust; u.tro.length=Math.min(u.tro.length,x.tro); u.ach=x.ach; u.mail=x.mail; u.bud=x.bud; u.press=null; u.call=x.call; u.fan=x.fan; u.prs=x.prs; };
// контракт: ежемесячная проверка
function monthly(){ const S=G(); const u=S.u, car=u.car; if(!car) return;
 if(V9.isOut()){ return; }
 if(car.cEnd){ const left=N.diffD(S.d,car.cEnd);
  if(left<=120&&left>0&&!car.ren){ if(u.trust>=45||HEADLESS){ car.ren={y:u.trust>=70?4:2,d:S.d}; if(HEADLESS){ V9.renew(true); } else N.mail(_t("Федерация футбола"),_t("Продление контракта"),_t("Ваш контракт истекает {0}. Федерация предлагает продлить его на {1} г.",N.fmtD(car.cEnd),car.ren.y),{type:'renew',y:car.ren.y}); }
   else { car.ren={y:0,no:1,d:S.d}; N.mail(_t("Федерация футбола"),_t("Контракт не будет продлён"),_t("Федерация не планирует продлевать ваш контракт, который истекает {0}. Начинайте искать новую работу.",N.fmtD(car.cEnd))); } }
  if(left<=0&&!HEADLESS){ if(car.ren&&!car.ren.no&&car.ren.y){ V9.renew(true); } else { closeJob(S,'end'); u.fired=1; const off=V9.genOffers(true); car.out={since:S.d,why:'end',off:off.map(c=>({c,d:S.d}))}; repPt(S); V9.scnLeave(); N.mail(_t("Федерация футбола"),_t("Контракт истёк"),_t("Срок вашего контракта истёк. Спасибо за работу! Предложения других федераций — в разделе «Карьера»."),{type:'fired',off}); S._stop='fired'; } } }
 car.rep=cl(car.rep+(30-car.rep)*0.004,0,100); if(S.d.slice(5,7)%3===1) repPt(S);
 // предложения при работе
 if(car.rep>=V9.prestige(S.me)+12&&rnd()<0.035&&!HEADLESS) N.offers(false);
 V9.scnTick(); V9.check(); }
const _m=N.fn.month; N.fn.month=(e)=>{ _m(e); monthly(); };
const _ev=N.evYear; N.evYear=(e)=>{ _ev(e); const S=G(); if(S.u.car&&!V9.isOut()) repPt(S); };
// ===================== 4. Достижения =====================
const A=(k,cat,ico,n,d,p)=>({k,cat,ico,n,d,p});
const stat=S=>S.u.stat; const car=S=>S.u.car||{rep:0,hist:[]};
const maxPool=(S,f)=>{ let m=0; for(const p of N.pool(S.me)) m=Math.max(m,f(p)); return m; };
V9.CATS=[['m',_t("Матчи")],['t',_t("Турниры")],['c',_t("Карьера")],['p',_t("Команда")],['r',_t("Дерби")],['s',_t("Сценарии")]];
const NEW=[
 A('w10','m','🔟',_t("Десятка"),_t("10 побед на посту"),S=>[stat(S).w,10]),A('w100','m','💯',_t("Сотня"),_t("100 побед на посту"),S=>[stat(S).w,100]),A('g100','m','⚽',_t("Сто голов"),_t("Ваши сборные забили 100 мячей"),S=>[stat(S).gf,100]),
 A('comeback','m','🔄',_t("Камбэк"),_t("Победите, уступая два мяча")),A('pens','m','🧤',_t("Нервы из стали"),_t("Выиграйте серию пенальти")),
 A('nl','t','🎗️',_t("Лига наций"),_t("Выиграйте Лигу наций")),A('final','t','🥈',_t("Финалист"),_t("Дойдите до финала крупного турнира")),A('wcq','t','🌐',_t("На мировой сцене"),_t("Выведите сборную на чемпионат мира")),
 A('boot','t','👟',_t("Золотая бутса"),_t("Ваш игрок — лучший бомбардир крупного турнира")),A('tro3','t','🏆',_t("Коллекционер"),_t("Выиграйте 3 трофея"),S=>[S.u.tro.length,3]),A('tro10','t','👑',_t("Династия"),_t("Выиграйте 10 трофеев"),S=>[S.u.tro.length,10]),
 A('rep50','c','📈',_t("Имя в профессии"),_t("Репутация тренера 50+"),S=>[Math.round(car(S).rep),50]),A('rep80','c','🌟',_t("Легенда скамейки"),_t("Репутация тренера 80+"),S=>[Math.round(car(S).rep),80]),
 A('jobs3','c','🧳',_t("Кочевник"),_t("Поработайте с тремя сборными"),S=>[new Set(car(S).hist.map(h=>h.c)).size,3]),A('yrs10','c','⏳',_t("Долгожитель"),_t("10 лет тренерской карьеры"),S=>[Math.floor(N.diffD((car(S).hist[0]||{from:S.d}).from,S.d)/365),10]),
 A('fired','c','📉',_t("Горький опыт"),_t("Вас уволили")),A('renew','c','✍️',_t("Продление"),_t("Продлите контракт с федерацией")),A('declined','c','🙅',_t("Себе цену знаю"),_t("Откажитесь от предложения о работе")),
 A('caps100','p','🎖️',_t("Клуб 100"),_t("Ваш игрок достиг отметки в 100 матчей за сборную"),S=>[maxPool(S,p=>(p.rh||[]).length>=20?p.caps||0:0),100]),A('g50','p','🎯',_t("Легенда атаки"),_t("Игрок вашей сборной забил 50 голов"),S=>[maxPool(S,p=>p.g||0),50]),
 A('rank1','p','🥇',_t("Номер один"),_t("Возглавьте рейтинг ФИФА")),A('top10','p','🔝',_t("Элита"),_t("Войдите в топ-10 рейтинга ФИФА")),
 A('d1','r','🔥',_t("Дерби наше"),_t("Выиграйте дерби")),A('d10','r','🌋',_t("Хозяин дерби"),_t("10 побед в дерби"),S=>[car(S).dw||0,10]),A('drout','r','💥',_t("Унижение соперника"),_t("Выиграйте дерби с разницей 3+ мяча")),A('dnew','r','⚔️',_t("Новое противостояние"),_t("Соперничество рождается в плей-офф")),
 A('scn1','s','📜',_t("Сценарист"),_t("Выполните любой сценарий")),A('scn3','s','🎬',_t("Мастер сценариев"),_t("Выполните 3 разных сценария (во всех сохранениях)"),()=>[Object.keys(LS.get('nfm_scn',{})).length,3])];
const OLD={first:['m','🥳'],clean:['m','🧱'],rout:['m','💪'],giant:['m','🗡️'],streak:['m','📶'],w50:['m','5️⃣'],hat:['p','🎩'],qual:['t','🎟️'],semi:['t','4️⃣'],over:['t','🚀'],trophy:['t','🏆'],cont:['t','🗺️'],wc:['t','🌍'],job:['c','🤝'],infra:['p','🏗️'],scout:['p','🔍']};
V9.ACH=[]; for(const k in N.ACH) if(OLD[k]) V9.ACH.push(A(k,OLD[k][0],OLD[k][1],N.ACH[k][0],N.ACH[k][1],k==='w50'?S=>[stat(S).w,50]:null));
for(const a of NEW){ V9.ACH.push(a); N.ACH[a.k]=[a.n,a.d]; }
V9.check=()=>{ const S=G(); if(!S||V9.isOut()) return; for(const a of V9.ACH){ if(!a.p||S.u.ach[a.k]) continue; try{ const [c,m]=a.p(S); if(c>=m) N.ach(a.k); }catch(e){} }
 const rk=N.fifaRank(S.me); if(rk===1) N.ach('rank1'); if(rk&&rk<=10) N.ach('top10');
 for(const c of Object.values(S.C)) if(/^WC_/.test(c.id)&&c.kind==='final'&&(c.teams||[]).includes(S.me)) N.ach('wcq'); };
// ===================== 4б. Сценарии =====================
const SC=(id,t,ico,n,d,goal,end,diff)=>({id,t,ico,n,d,goal,end,diff});
V9.SCN=[
 SC('sm','SM','🗻',_t("Выведи Сан-Марино на Евро"),_t("Самая скромная сборная Европы мечтает о финальном турнире. Пробейтесь на чемпионат Европы 2028 или 2032."),{q:'^EURO_'},'2032-12-31',5),
 SC('it','IT','🇮🇹',_t("Верни Италию на вершину"),_t("Четырёхкратные чемпионы мира пропускали мундиали. Выиграйте чемпионат мира или Европы до конца 2034 года."),{w:'^(WC|EURO)_'},'2034-12-31',3),
 SC('vn','VN','🐉',_t("Вьетнам на чемпионате мира"),_t("Маленькая азиатская сборная с большими амбициями. Выйдите на чемпионат мира 2030 или 2034."),{q:'^WC_'},'2034-12-31',4),
 SC('cv','CV','🏝️',_t("Кабо-Верде — чемпион Африки"),_t("Островная сборная уже удивляла континент. Выиграйте Кубок Африки до конца 2033 года."),{w:'^AFCON2?_'},'2033-12-31',5),
 SC('br','BR','⭐',_t("Шестая звезда Бразилии"),_t("Страна ждёт гексакампеонато. Выиграйте чемпионат мира 2030."),{w:'^WC_'},'2030-12-31',3),
 SC('en','ENG','🦁',_t("Конец годам боли"),_t("Англия ждёт большого трофея с 1966 года. Выиграйте чемпионат мира или Европы до конца 2032 года."),{w:'^(WC|EURO)_'},'2032-12-31',3),
 SC('is','IS','🌋',_t("Исландская сага"),_t("Повторите сказку: дойдите минимум до 1/4 финала чемпионата Европы до конца 2032 года."),{lv:'^EURO_',n:3},'2032-12-31',4),
 SC('in','IN','🐯',_t("Индия: прорыв в Азии"),_t("Выйдите в плей-офф Кубка Азии до конца 2031 года."),{lv:'^ASIAN_',n:2},'2031-12-31',4),
 SC('nz','NZ','🥝',_t("Киви на мундиале"),_t("Выиграйте отбор Океании и выведите Новую Зеландию на чемпионат мира 2030."),{q:'^WC_'},'2030-12-31',2),
 SC('ar','AR','👑',_t("Удержать трон"),_t("Аргентина — эталон. Будьте первыми в рейтинге ФИФА на конец 2028 года."),{rk:1},'2028-12-31',3),
 SC('cw','CW','🐚',_t("Кюрасао: сенсация КОНКАКАФ"),_t("Дойдите до полуфинала Золотого кубка до конца 2031 года."),{lv:'^GOLD',n:4},'2031-12-31',4),
 SC('de','DE','🔧',_t("Германия: перезагрузка"),_t("После неудач — снова в элиту: дойдите до полуфинала чемпионата мира 2030."),{lv:'^WC_',n:4},'2030-12-31',3)];
V9.scn=()=>{ const S=G(); const s=S&&S.u.scn; return s?{...V9.SCN.find(x=>x.id===s.id),...s,st:s.st}:null; };
function scnEnd(won){ const S=G(); const s=S.u.scn; if(!s||s.st!=='run') return; s.st=won?'won':'lost'; s.at=S.d; s.shown=0; s.stat={...S.u.stat}; s.tro=S.u.tro.length;
 if(won){ const g=LS.get('nfm_scn',{}); g[s.id]=g[s.id]||Date.now(); LS.set('nfm_scn',g); N.ach('scn1'); V9.check(); V9.rep(6); }
 const sc=V9.SCN.find(x=>x.id===s.id); N.mail(_t("Сценарий"),(won?'🏆 ':'⌛ ')+sc.n,won?_t("Цель сценария выполнена! Можно продолжать карьеру."):_t("Цель сценария не выполнена. Карьера продолжается без сценария.")); S._stop='scn'; }
V9.scnComp=(c,got)=>{ const S=G(); const s=S.u.scn; if(!s||s.st!=='run') return; const sc=V9.SCN.find(x=>x.id===s.id); const g=sc.goal;
 if(g.w&&new RegExp(g.w).test(c.id)&&c.w===S.me) scnEnd(true);
 if(g.lv&&new RegExp(g.lv).test(c.id)&&c.kind==='final'&&got>=g.n) scnEnd(true); };
V9.scnTick=()=>{ const S=G(); const s=S.u.scn; if(!s||s.st!=='run') return; const sc=V9.SCN.find(x=>x.id===s.id); const g=sc.goal;
 if(g.q){ const re=new RegExp(g.q); for(const c of Object.values(S.C)) if(re.test(c.id)&&c.kind==='final'&&(c.teams||[]).includes(S.me)){ scnEnd(true); return; } }
 if(S.d>sc.end){ if(g.rk) return scnEnd(N.fifaRank(S.me)<=g.rk); scnEnd(false); } };
V9.scnLeave=()=>{ const S=G(); const s=S.u.scn; if(s&&s.st==='run'){ s.left=1; scnEnd(false); } };
})();

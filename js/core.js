// Ядро мира: игроки, сборные, календарь, турниры, симуляция
(function(){
const N = globalThis.NFM = globalThis.NFM || {};
const R=Math.random, cl=(v,a,b)=>v<a?a:v>b?b:v, ri=(a,b)=>a+Math.floor(R()*(b-a+1)), pick=a=>a[Math.floor(R()*a.length)];
const gauss=()=>{let s=0;for(let i=0;i<6;i++)s+=R();return (s-3)/0.7071};
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
Object.assign(N,{R,cl,ri,pick,gauss,shuffle});
// ---------- даты ----------
const pad=n=>(n<10?'0':'')+n;
N.ds=(y,m,d)=>{const t=new Date(Date.UTC(y,m-1,d));return t.getUTCFullYear()+'-'+pad(t.getUTCMonth()+1)+'-'+pad(t.getUTCDate())};
N.addD=(s,n)=>{const [y,m,d]=s.split('-').map(Number);return N.ds(y,m,d+n)};
N.diffD=(a,b)=>Math.round((Date.parse(b)-Date.parse(a))/864e5);
const MON=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const WDAY=['вс','пн','вт','ср','чт','пт','сб'];
N.fmtD=(s,short)=>{const [y,m,d]=s.split('-').map(Number);const w=new Date(Date.UTC(y,m-1,d)).getUTCDay();return short?(d+' '+MON[m-1].slice(0,3)+' '+y):(WDAY[w]+', '+d+' '+MON[m-1]+' '+y)};
const WIN={3:[20,24],6:[5,9],9:[4,8],10:[9,13],11:[13,17]};
N.WIN=WIN;
const wd=(list)=>list.flatMap(([y,m])=>WIN[m].map(d=>N.ds(y,m,d)));
N.windowDates=(y)=>wd([[y,3],[y,6],[y,9],[y,10],[y,11]]);
// ---------- игроки ----------
const RW={GK:{gk:.82,phy:.08,pas:.05,spd:.05},CB:{def:.5,phy:.25,spd:.1,pas:.1,tec:.05},LB:{def:.35,spd:.25,pas:.15,phy:.15,tec:.1},RB:{def:.35,spd:.25,pas:.15,phy:.15,tec:.1},
 DM:{def:.35,pas:.3,phy:.2,tec:.15},CM:{pas:.35,tec:.25,def:.1,att:.15,phy:.15},AM:{pas:.3,tec:.3,att:.3,spd:.1},LM:{pas:.25,spd:.25,tec:.25,att:.15,phy:.1},RM:{pas:.25,spd:.25,tec:.25,att:.15,phy:.1},
 LW:{att:.35,spd:.3,tec:.25,pas:.1},RW:{att:.35,spd:.3,tec:.25,pas:.1},ST:{att:.55,phy:.15,spd:.15,tec:.15}};
const COMPAT={CB:{LB:.9,RB:.9,DM:.85},LB:{RB:.94,LM:.9,CB:.85},RB:{LB:.94,RM:.9,CB:.85},DM:{CM:.96,CB:.85},CM:{DM:.94,AM:.93},AM:{CM:.93,ST:.88,LW:.88,RW:.88},LM:{RM:.93,LW:.93,LB:.85,AM:.86},RM:{LM:.93,RW:.93,RB:.85,AM:.86},LW:{RW:.95,LM:.93,ST:.88},RW:{LW:.95,RM:.93,ST:.88},ST:{LW:.88,RW:.88,AM:.88}};
N.ATTRS=['att','def','pas','tec','phy','spd','gk'];
N.ATTRN={att:'Атака',def:'Оборона',pas:'Пас',tec:'Техника',phy:'Физика',spd:'Скорость',gk:'Вратарь'};
function raw(p,role){const w=RW[role];let s=0;for(const k in w)s+=w[k]*(p[k]||0);return s}
N.compat=(pos,role)=>{ if(pos===role)return 1; if(pos==='GK'||role==='GK')return .35; const c=COMPAT[pos]&&COMPAT[pos][role]; if(c)return c; const g1=N.POS[pos][1],g2=N.POS[role][1]; if(g1===g2)return .82; if((g1+g2).match(/DF|FD/))return .55; return .7; };
N.roleOvr=(p,role)=>{ if(!p||!p.att&&!p.gk)return 30; return raw(p,role)*(0.7+0.3*N.compat(p.pos,role)); };
N.ovr=p=>Math.round(raw(p,p.pos));
N.upd=p=>{p.o=N.ovr(p);return p};
let SS=null; N.setS=s=>{SS=s}; N.getS=()=>SS;
function nameFor(pool){const P=N.NAMES[pool]||N.NAMES.en;return pick(P[0])+' '+pick(P[1])}
function clubFor(o,team){ const t=N.T(team); if(o>=84&&R()<.85) return pick(N.CLUBS[0]); if(o>=77&&R()<.8) return pick(N.CLUBS[R()<.3?0:1]); if(o>=70&&R()<.65) return pick(N.CLUBS[R()<.4?1:2]); if(o>=64&&R()<.3) return pick(N.CLUBS[2]);
 return pick(N.LOCAL)+' ('+(t?t.n:'?')+')'; }
N.clubFor=clubFor;
N.genPlayer=(team,pos,target,age,opt={})=>{
 const S=SS; const t=N.T(team); const p={id:S.nid++,n:nameFor(opt.pool||t.pool),t:team,pos,age:age||ri(19,33)};
 const w=RW[pos]; const key=Object.keys(w).sort((a,b)=>w[b]-w[a]);
 for(const k of N.ATTRS){ if(k==='gk') p.gk = pos==='GK'?target+gauss()*3:ri(8,20); else if(pos==='GK') p[k]= k==='phy'||k==='pas'||k==='spd'?target-12+gauss()*6:ri(15,35); else p[k]= (w[k]?target+gauss()*4:target-16+gauss()*8); }
 for(let it=0;it<3;it++){ const d=target-raw(p,pos); for(const k of N.ATTRS){ if(pos==='GK'&&k!=='gk'&&!w[k])continue; if(pos!=='GK'&&k==='gk')continue; p[k]+=d; } }
 for(const k of N.ATTRS) p[k]=Math.round(cl(p[k],5,99));
 N.upd(p);
 const a=p.age; p.pot=Math.round(cl(p.o+(a<=20?ri(4,16):a<=23?ri(1,9):a<=26?ri(0,4):0)+(opt.potB||0),p.o,97));
 p.form=+(6+R()).toFixed(1); p.mor=ri(55,78); p.fit=100; p.inj=0; p.sus=0; p.yc=0; p.club=opt.club||clubFor(p.o,team);
 p.caps=opt.caps??Math.max(0,Math.round((a-19)*R()*4*(p.o/80))); p.g=0;p.a=0;p.cs=0; p.g0=0; p.pers=ri(0,2); p.rh=[];
 if(opt.dual)p.dual=opt.dual;
 S.P[p.id]=p; return p;
};
const SQ=['GK','GK','GK','CB','CB','CB','CB','LB','RB','LB','RB','DM','DM','CM','CM','CM','AM','LM','RM','LW','RW','ST','ST'];
N.genPool=(team,size)=>{ const t=N.T(team); const r=t.r; const ids=[];
 for(let i=0;i<size;i++){ const pos=SQ[i%SQ.length]; const tier=Math.floor(i/SQ.length);
  const target = tier===0? r+3-((i*0.45))*0.5-((i>=11)?2.5:0)+gauss()*2.5 : r-7-tier*2+gauss()*3; const age= tier>0&&R()<.5?ri(18,22):ri(19,33);
  ids.push(N.genPlayer(team,pos,Math.round(cl(target,25,95)),age).id); }
 for(const id of ids){ const p=SS.P[id]; if(p.age<24) p.caps=Math.min(p.caps,ri(0,10)); if(p.o<r-6) p.caps=Math.floor(p.caps/3); const g=N.POS[p.pos][1]; p.g=Math.round(p.caps*(g==='F'?0.32:g==='M'?0.1:g==='D'?0.03:0)*(0.5+R())); p.a=Math.round(p.caps*(g==='M'?0.12:g==='F'?0.12:0.03)*(0.5+R())); if(g==='G')p.cs=Math.round(p.caps*0.3*R()); }
 t.pl=ids; return ids; };
// ---------- сборные ----------
N.T=c=>SS&&SS.T[c];
N.stars=t=>{const s=cl(Math.round(((t.str||t.r)-46)/8.5*2)/2,0.5,5);return s};
N.starsHtml=s=>{let h='';for(let i=1;i<=5;i++)h+= s>=i?'★':s>=i-.5?'<span class="hs">★</span>':'☆';return h};
N.teamStr=c=>{ const t=N.T(c); const ps=t.pl.map(id=>SS.P[id]).filter(p=>p&&!p.ret); const lu=N.autoLineup(ps,t.form||'4-3-3'); let s=0; lu.xi.forEach((p,i)=>s+=p?N.roleOvr(p,N.FORMS[lu.form][i][0]):30); t.str=Math.round(s/11*10)/10; return t.str; };
N.autoLineup=(players,form)=>{ const F=N.FORMS[form]; const used=new Set(); const xi=new Array(11).fill(null);
 const order=F.map((s,i)=>i).sort((a,b)=>(F[a][0]==='GK'?-1:0)-(F[b][0]==='GK'?-1:0));
 const avail=players.filter(p=>!p.inj&&!p.sus).sort((a,b)=>b.o-a.o);
 for(const i of order){ const role=F[i][0]; let best=null,bv=-1; for(const p of avail){ if(used.has(p.id))continue; const v=N.roleOvr(p,role)*(0.9+0.1*(p.fit/100)); if(v>bv){bv=v;best=p} } if(best){used.add(best.id);xi[i]=best} }
 const rest=avail.filter(p=>!used.has(p.id)); const bench=[]; const gk=rest.find(p=>p.pos==='GK'); if(gk)bench.push(gk);
 for(const p of rest){ if(bench.length>=12)break; if(!bench.includes(p))bench.push(p); }
 return {form,xi,bench}; };
// ---------- новая игра ----------
N.newGame=(team,coach)=>{
 const S={v:2,d:'2026-08-01',me:team,coach:coach||'Тренер',nid:1,nfid:1,P:{},T:{},C:{},F:[],E:[],arch:[],
  u:{trust:55,call:[],xi:null,tac:{ment:0,press:1,tempo:1,width:1,style:'mix'},instr:{},train:{f:'bal',i:1},infra:{base:1,acad:1,med:1,scout:1,stad:1},bud:30,scoutLeft:1,mail:[],tro:[],ach:{},stat:{w:0,d:0,l:0,gf:0,ga:0},u21:{res:[]},teams:[{c:team,from:'2026-08-01'}],found:[],press:null,win:0,expect:{}},log:[]};
 SS=S; for(const t of N.TEAMS){ S.T[t.c]={...t,elo:Math.round(1000+(t.r-40)*20+gauss()*25),form:pick(['4-3-3','4-2-3-1','4-4-2','4-3-3','4-2-3-1','3-5-2','4-1-4-1','5-3-2']),pl:[]}; }
 for(const c in S.T) N.genPool(c, c===team?40:23);
 for(const c in S.T) N.teamStr(c);
 S.C.FR={id:'FR',n:'Товарищеские матчи',sh:'ТМ',kind:'fr',groups:[],stage:'groups'};
 N.buildCycle(2026);
 N.addEv('2027-01-01','year'); N.autoCall(); N.mail('Федерация футбола','Добро пожаловать!','Уважаемый '+S.coach+', федерация рада приветствовать вас на посту главного тренера сборной '+S.T[team].n+'. Мы ждём от вас достойных результатов. Ваш первый вызов уже сформирован — проверьте состав перед ближайшим окном.');
 N.runEvents(S.d); S._stop=null; return S; };
N.addEv=(d,t,x)=>{SS.E.push({d,t,...x})};
N.mail=(from,sub,body,act)=>{SS.u.mail.unshift({d:SS.d,from,sub,body,act,rd:0}); if(SS.u.mail.length>80)SS.u.mail.length=80;};
// ---------- турниры ----------
function makeGroups(teams,maxSize,nGroups){ const sorted=teams.slice().sort((a,b)=>N.T(b).elo-N.T(a).elo); const g=nGroups||Math.ceil(sorted.length/maxSize);
 const G=Array.from({length:g},(_,i)=>({n:String.fromCharCode(65+i),t:[]}));
 for(let i=0;i<sorted.length;i+=g){ const pot=shuffle(sorted.slice(i,i+g)); const order=shuffle(G.map((_,k)=>k)).sort((a,b)=>G[a].t.length-G[b].t.length); pot.forEach((c,k)=>G[order[k]].t.push(c)); }
 return G; }
N.makeGroups=makeGroups;
function rr(teams,double){ const a=teams.slice(); if(a.length%2)a.push(null); const n=a.length, rounds=[];
 for(let r=0;r<n-1;r++){ const rd=[]; for(let i=0;i<n/2;i++){ const h=a[i],w=a[n-1-i]; if(h&&w) rd.push(r%2?[w,h]:[h,w]); } rounds.push(rd); a.splice(1,0,a.pop()); }
 if(double) return rounds.concat(rounds.map(rd=>rd.map(([h,w])=>[w,h]))); return rounds; }
N.addFix=(d,c,h,a,st,x={})=>{ const f={id:SS.nfid++,d,c,h,a,st,...x}; SS.F.push(f); return f; };
N.drawComp=(c,teams)=>{ c.groups= c.league? [{n:'',t:teams.slice()}] : makeGroups(teams,c.gsize||4,c.ng);
 if(c.host){ // хозяин в группе A
  const gA=c.groups[0]; if(!gA.t.includes(c.host)){ const g=c.groups.find(g=>g.t.includes(c.host)); const sw=gA.t[0]; g.t[g.t.indexOf(c.host)]=sw; gA.t[0]=c.host; } }
 for(const g of c.groups){ const rounds=rr(g.t,c.rr===2); rounds.forEach((rd,i)=>{ const d=c.gd[Math.min(i,c.gd.length-1)]; rd.forEach(([h,a])=>{ if(a===c.host)[h,a]=[a,h]; N.addFix(d,c.id,h,a,(c.league?'':'Группа '+g.n+', ')+'тур '+(i+1),{g:g.n,neu:c.neutral&&h!==c.host&&a!==c.host?1:0, })}); }); if(rounds.length>c.gd.length) console.warn('мало дат',c.id,rounds.length,c.gd.length); }
 c.stage='groups'; c.teams=teams.slice(); };
N.table=(c,gn)=>{ const g=c.groups.find(x=>x.n===gn); const T={}; g.t.forEach(t=>T[t]={t,p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0});
 for(const f of SS.F){ if(f.c!==c.id||f.g!==gn||!f.r||f.ko)continue; const H=T[f.h],A=T[f.a]; if(!H||!A)continue; const [x,y]=[f.r.hg,f.r.ag]; H.p++;A.p++;H.gf+=x;H.ga+=y;A.gf+=y;A.ga+=x; if(x>y){H.w++;A.l++;H.pts+=3}else if(x<y){A.w++;H.l++;A.pts+=3}else{H.d++;A.d++;H.pts++;A.pts++} }
 return Object.values(T).sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga)||b.gf-a.gf||N.T(b.t).elo-N.T(a.t).elo); };
N.ranking=(c)=>{ // упорядоченный список: все первые, затем вторые...
 const tabs=c.groups.map(g=>N.table(c,g.n)); const out=[]; const mx=Math.max(...tabs.map(t=>t.length));
 for(let pos=0;pos<mx;pos++){ const tier=tabs.map(t=>t[pos]).filter(Boolean).map(r=>({...r,pos})); const norm=r=>{ const tab=tabs.find(t=>t.some(x=>x.t===r.t)); const n=tab.length; return n>1&&r.p? [r.pts/r.p,(r.gf-r.ga)/r.p,r.gf/r.p]:[0,0,0]; };
  tier.sort((a,b)=>{const A=norm(a),B=norm(b);return B[0]-A[0]||B[1]-A[1]||B[2]-A[2]}); out.push(...tier); }
 return out; };
function bracketOrder(n){ let o=[1]; while(o.length<n){ const m=o.length*2; o=o.flatMap(x=>[x,m+1-x]); } return o; }
const RN={32:'1/16 финала',16:'1/8 финала',8:'1/4 финала',4:'1/2 финала',2:'Финал'};
N.RN=RN;
function startKO(c){ let q; const rk=N.ranking(c);
 if(c.adv.per===1) q=rk.filter(r=>r.pos===0); else { q=rk.filter(r=>r.pos<c.adv.per); q=q.concat(rk.filter(r=>r.pos===c.adv.per).slice(0,c.adv.best||0)); }
 const seeds=q.map(r=>r.t); const n=seeds.length; const ord=bracketOrder(n); const pairs=[];
 for(let i=0;i<n;i+=2) pairs.push([seeds[ord[i]-1],seeds[ord[i+1]-1]]);
 c.ko=[]; c.stage='ko'; makeRound(c,pairs); }
function makeRound(c,pairs){ const ri_=c.ko.length; const d=c.kod[ri_]; const n=pairs.length*2; const st=RN[n]||('Раунд '+(ri_+1));
 c.ko.push(pairs.map(([h,a])=>{ if(a===c.host)[h,a]=[a,h]; const f=N.addFix(d,c.id,h,a,st,{ko:1,neu:(c.neutral||c.koNeu)&&h!==c.host?1:0}); return {h,a,f:f.id}; })); }
N.onFixDone=(f)=>{ const c=SS.C[f.c]; if(!c||c.kind==='fr')return;
 if(c.stage==='groups'){ if(SS.F.some(x=>x.c===c.id&&!x.r&&!x.ko))return; if(c.adv){ startKO(c); } else { c.stage='done'; c.fin=SS.d; N.compDone(c); } return; }
 if(c.stage==='ko'){ const rd=c.ko[c.ko.length-1]; const fx=rd.map(t=>SS.F.find(x=>x.id===t.f)); if(fx.some(x=>!x.r))return; const ws=fx.map(x=>x.r.w);
  if(ws.length===1){ c.stage='done'; c.w=ws[0]; c.ru= ws[0]===fx[0].h?fx[0].a:fx[0].h; c.fin=SS.d; N.compDone(c); return; }
  const pairs=[]; for(let i=0;i<ws.length;i+=2) pairs.push([ws[i],ws[i+1]]); makeRound(c,pairs); } };
N.qualified=(c)=>c.qual||[];
N.newComp=(o)=>{ const c={stage:'pending',groups:[],rr:2,gsize:4,...o}; SS.C[c.id]=c; return c; };
N.topElo=(conf,n,excl=[])=>Object.values(SS.T).filter(t=>t.conf===conf&&!excl.includes(t.c)).sort((a,b)=>b.elo-a.elo).slice(0,n).map(t=>t.c);
N.confTeams=(conf)=>Object.values(SS.T).filter(t=>t.conf===conf).map(t=>t.c);
function finalsDates(y,m,d0,ngd,nko,gap=4){ const s=N.ds(y,m,d0); const gd=[]; for(let i=0;i<ngd;i++)gd.push(N.addD(s,i*gap)); const kod=[]; let cur=N.addD(gd[gd.length-1],5); for(let i=0;i<nko;i++){kod.push(cur);cur=N.addD(cur,i>=nko-3?4:4);} return {gd,kod}; }
function chooseHost(conf,top){ const c=N.topElo(conf,top); return pick(c); }
N.buildCycle=(Y)=>{ const S=SS; const A=Y,B=Y+1,C=Y+2,E=Y+3,F=Y+4; const id=s=>s+'_'+Y;
 const euroHost=chooseHost('UEFA',18), afHost=chooseHost('CAF',20), acHost=chooseHost('AFC',14);
 const wcHost=pick(Object.values(S.T).filter(t=>t.conf!=='OFC').sort((a,b)=>b.elo-a.elo).slice(0,25)).c;
 const addQual=(key,n,sh,conf,dates,gsize,drawD,excl,slots,league)=>{ const c=N.newComp({id:id(key),n,sh,conf,kind:'qual',gd:dates,gsize,league,slots,excl:excl||[],yr:Y}); N.addEv(drawD,'draw',{c:c.id}); return c; };
 // Лига наций УЕФА (A и C годы)
 for(const y of [A,C]){ const dts=wd([[y,9],[y,10],[y,11]]); const fd=y===A?Y+'-08-01':y+'-08-01';
  ['A','B','C','D'].forEach((L,i)=>{ const c=N.newComp({id:id('UNL'+L+y),n:'Лига наций УЕФА '+y+'/'+((y+1)%100)+' · Лига '+L,sh:'ЛН-'+L,conf:'UEFA',kind:'nl',gd:dts,gsize:4,yr:y,nl:i,adv:L==='A'?{per:1}:null,kod:L==='A'?[N.ds(y+1,6,10),N.ds(y+1,6,14)]:null,koNeu:1});
   N.addEv(fd,'draw',{c:c.id}); }); }
 // Лига наций КОНКАКАФ
 ['A','B'].forEach((L,i)=>{ N.newComp({id:id('CNL'+L),n:'Лига наций КОНКАКАФ '+A+'/'+(B%100)+' · Лига '+L,sh:'ЛНК-'+L,conf:'CONCACAF',kind:'nl',gd:wd([[A,9],[A,10],[A,11]]),gsize:4,yr:A,nl:i,adv:L==='A'?{per:1}:null,kod:L==='A'?[N.ds(B,3,20),N.ds(B,3,24)]:null,koNeu:1}); N.addEv(Y+'-08-01','draw',{c:id('CNL'+L)}); });
 // Кубок Африки
 addQual('AFQ','Отбор Кубка Африки '+B,'ОКА','CAF',wd([[A,9],[A,10],[A,11]]),4,Y+'-08-01',[afHost],23);
 let fd=finalsDates(B,6,20,3,4); N.newComp({rr:1,id:id('AFCON'),n:'Кубок Африки '+B,sh:'КАН',conf:'CAF',kind:'final',gd:fd.gd,kod:fd.kod,ng:6,adv:{per:2,best:4},host:afHost,neutral:1,src:[{q:id('AFQ'),n:23}],yr:B}); N.addEv(N.ds(B,4,15),'draw',{c:id('AFCON')});
 // Кубок Азии
 addQual('ACQ','Отбор Кубка Азии '+B,'ОКАз','AFC',wd([[A,9],[A,10],[A,11]]),4,Y+'-08-01',[acHost],23);
 fd=finalsDates(B,1,10,3,4); N.newComp({rr:1,id:id('ASIAN'),n:'Кубок Азии '+B,sh:'КА',conf:'AFC',kind:'final',gd:fd.gd,kod:fd.kod,ng:6,adv:{per:2,best:4},host:acHost,neutral:1,src:[{q:id('ACQ'),n:23}],yr:B}); N.addEv(N.ds(A,12,5),'draw',{c:id('ASIAN')});
 // Евро
 addQual('EQ','Отбор чемпионата Европы '+C,'ОЧЕ','UEFA',wd([[B,3],[B,6],[B,9],[B,10],[B,11]]),6,N.ds(B,2,1),[euroHost],23);
 fd=finalsDates(C,6,11,3,4); N.newComp({rr:1,id:id('EURO'),n:'Чемпионат Европы '+C,sh:'ЧЕ',conf:'UEFA',kind:'final',gd:fd.gd,kod:fd.kod,ng:6,adv:{per:2,best:4},host:euroHost,neutral:1,src:[{q:id('EQ'),n:23}],yr:C}); N.addEv(N.ds(C,3,1),'draw',{c:id('EURO')});
 // Золотой кубок (B и E)
 for(const y of [B,E]){ const f2=finalsDates(y,6,20,3,3); N.newComp({rr:1,id:id('GOLD'+y),n:'Золотой кубок КОНКАКАФ '+y,sh:'ЗК',conf:'CONCACAF',kind:'final',gd:f2.gd,kod:f2.kod,ng:4,adv:{per:2},neutral:1,src:[{top:'CONCACAF',n:16}],yr:y}); N.addEv(N.ds(y,5,10),'draw',{c:id('GOLD'+y)}); }
 // Копа Америка
 fd=finalsDates(C,6,14,3,3); N.newComp({rr:1,id:id('COPA'),n:'Копа Америка '+C,sh:'КоА',conf:'CONMEBOL',kind:'final',gd:fd.gd,kod:fd.kod,ng:4,adv:{per:2},neutral:1,src:[{top:'CONMEBOL',n:10},{top:'CONCACAF',n:6}],yr:C}); N.addEv(N.ds(C,4,20),'draw',{c:id('COPA')});
 // Кубок наций ОФК
 fd=finalsDates(C,6,6,3,2,3); N.newComp({rr:1,id:id('OFCNC'),n:'Кубок наций ОФК '+C,sh:'КНО',conf:'OFC',kind:'final',gd:fd.gd,kod:fd.kod,ng:2,adv:{per:2},neutral:1,src:[{top:'OFC',n:8}],yr:C}); N.addEv(N.ds(C,4,20),'draw',{c:id('OFCNC')});
 // Отбор ЧМ
 const exW=[wcHost];
 addQual('WQ_CONMEBOL','Отбор ЧМ-'+F+' · КОНМЕБОЛ','ОЧМ','CONMEBOL',wd([[B,9],[B,10],[B,11],[C,3],[C,9],[C,10],[C,11],[E,3],[E,6]]),10,N.ds(B,8,1),exW,6,true);
 const d10=wd([[C,9],[C,10],[C,11],[E,3],[E,6]]);
 addQual('WQ_UEFA','Отбор ЧМ-'+F+' · УЕФА','ОЧМ','UEFA',wd([[E,3],[E,6],[E,9],[E,10],[E,11]]),6,N.ds(E,1,20),exW,16);
 addQual('WQ_CAF','Отбор ЧМ-'+F+' · КАФ','ОЧМ','CAF',d10,6,N.ds(C,8,1),exW,9);
 addQual('WQ_AFC','Отбор ЧМ-'+F+' · АФК','ОЧМ','AFC',d10,6,N.ds(C,8,1),exW,8);
 addQual('WQ_CONCACAF','Отбор ЧМ-'+F+' · КОНКАКАФ','ОЧМ','CONCACAF',d10,6,N.ds(C,8,1),exW,6);
 addQual('WQ_OFC','Отбор ЧМ-'+F+' · ОФК','ОЧМ','OFC',d10,6,N.ds(C,8,1),exW,1);
 fd=finalsDates(F,6,11,3,5); N.newComp({rr:1,id:id('WC'),n:'Чемпионат мира '+F,sh:'ЧМ',conf:'ALL',kind:'final',gd:fd.gd,kod:fd.kod,ng:12,adv:{per:2,best:8},host:wcHost,neutral:1,
  src:[{q:id('WQ_UEFA'),n:16},{q:id('WQ_CONMEBOL'),n:6},{q:id('WQ_CAF'),n:9},{q:id('WQ_AFC'),n:8},{q:id('WQ_CONCACAF'),n:6},{q:id('WQ_OFC'),n:1},{q:id('WQ_AFC'),n:9},{q:id('WQ_CONMEBOL'),n:7},{q:id('WQ_CAF'),n:10},{q:id('WQ_CONCACAF'),n:7}],size:48,yr:F});
 N.addEv(N.ds(E,12,10),'draw',{c:id('WC')});
 // окна и товарищеские
 const endD=N.ds(F,8,1); for(const y of [A,B,C,E,F]){ for(const d of N.windowDates(y)) if(d>S.d&&d<endD){ N.addEv(d,'fr'); } for(const m of [3,6,9,10,11]){ const d=N.ds(y,m,WIN[m][0]-6); if(d>S.d&&d<endD) N.addEv(d,'win',{m}); } }
 N.addEv(N.ds(F,8,1),'cycle',{y:F});
 S.cyc={Y,euroHost,afHost,acHost,wcHost};
};
N.resolveSrc=(c)=>{ const out=[]; if(c.host)out.push(c.host); const size=c.size||(c.ng*4);
 for(const s of c.src){ let list; if(s.q){ const q=SS.C[s.q]; list=N.ranking(q).map(r=>r.t).slice(0,s.n); } else list=N.topElo(s.top,s.n,out);
  for(const t of list){ if(out.length>=size)break; if(!out.includes(t)) out.push(t); } }
 return out.slice(0,size); };
N.evDraw=(e)=>{ const c=SS.C[e.c]; let teams;
 if(c.kind==='nl'){ const ts=Object.values(SS.T).filter(t=>t.conf===c.conf).sort((a,b)=>b.elo-a.elo).map(t=>t.c); const per=16; teams= c.conf==='CONCACAF'&&c.nl===1? ts.slice(16): c.nl<3||c.conf!=='UEFA'?ts.slice(c.nl*per,c.nl*per+per):ts.slice(48); }
 else if(c.kind==='qual') teams=N.confTeams(c.conf).filter(t=>!c.excl.includes(t));
 else teams=N.resolveSrc(c);
 if(c.kind==='final') c.ng = Math.round(teams.length/4);
 N.drawComp(c,teams);
 if(teams.includes(SS.me)){ const g=c.groups.find(g=>g.t.includes(SS.me)); N.mail('Федерация футбола','Жеребьёвка: '+c.n,(c.kind==='final'?'Мы участвуем в финальном турнире! ':'')+'Наши соперники'+(g.n?' по группе '+g.n:'')+': '+g.t.filter(t=>t!==SS.me).map(t=>SS.T[t].f+' '+SS.T[t].n).join(', ')+'. '+N.expectText(c)); SS._stop='draw'; N.setExpect(c); }
};
// ---------- ожидания федерации ----------
N.lvlNames=['вылет в группе','выход из группы','1/8 финала','1/4 финала','полуфинал','финал','победа'];
N.expectLevel=(c)=>{ const ts=(c.teams||[]).slice().sort((a,b)=>SS.T[b].elo-SS.T[a].elo); const rk=ts.indexOf(SS.me); if(rk<0)return null; const n=ts.length;
 if(c.kind==='qual'||c.kind==='nl'){ const slots=c.kind==='nl'?Math.max(1,Math.round(n/4)):c.slots; return rk<slots*0.8?1:0; }
 const pct=rk/n; return pct<0.04?5:pct<0.1?4:pct<0.25?3:pct<0.5?(n>=24?2:1):pct<0.75?1:0; };
N.expectText=(c)=>{ const l=N.expectLevel(c); if(l===null)return ''; if(c.kind==='qual') return l?'Задача федерации: выйти в финальный турнир.':'Задача: достойно выступить, борьба за выход будет бонусом.'; if(c.kind==='nl') return l?'Задача: побороться за первое место в группе.':'Задача: сохранить место в лиге.'; return 'Задача федерации: '+N.lvlNames[l]+'.'; };
N.setExpect=(c)=>{ if(c){SS.u.expect[c.id]=N.expectLevel(c);} };
N.achievedLevel=(c)=>{ const me=SS.me; if(c.kind==='qual'){ const q=N.ranking(c).slice(0,c.slots).map(r=>r.t); return q.includes(me)?1:0; }
 if(c.kind==='nl'){ const g=c.groups.find(g=>g.t.includes(me)); return N.table(c,g.n)[0].t===me?1:0; }
 if(!c.ko||!c.ko.length) return 0; if(c.w===me) return 6; let lv=0; c.ko.forEach((rd)=>{ if(rd.some(t=>t.h===me||t.a===me)){ const n=rd.length*2; lv= n===2?5:n===4?4:n===8?3:n===16?2:1; } }); return lv; };
N.compDone=(c)=>{ const S=SS; const me=S.me; const inC=(c.teams||[]).includes(me);
 if(c.kind==='final'||(c.kind==='nl'&&c.ko)){ const w=c.w; if(w) N.mail('Новости',(c.n)+': победитель — '+S.T[w].n,S.T[w].f+' '+S.T[w].n+' выигрывает турнир, обыграв в финале '+S.T[c.ru].n+'.'); }
 if(inC){ const ex=S.u.expect[c.id]??N.expectLevel(c); const got=N.achievedLevel(c); const k=c.kind==='final'?7:c.kind==='qual'?12:4; const dt=Math.round(cl((got-ex)*k,-30,25));
  N.trust(dt); let txt='Итог турнира «'+c.n+'»: '+(c.kind==='qual'?(got?'путёвка завоёвана!':'выйти не удалось.'):c.kind==='nl'?(got?'первое место в группе.':'без первого места.'):N.lvlNames[got]+'.')+' Доверие федерации '+(dt>=0?'+':'')+dt+'.';
  if(c.kind==='qual'&&got){S.u.bud+=25; N.ach('qual');}
  if(c.w===me){ S.u.tro.push({n:c.n,yr:c.yr||S.d.slice(0,4),t:me,d:S.d}); S.u.bud+=c.kind==='final'?80:40; txt+=' 🏆 ТРОФЕЙ! Бюджет федерации пополнен.'; N.ach('trophy'); if(c.id.startsWith('WC'))N.ach('wc'); if(c.kind==='final'&&c.id.match(/EURO|COPA|AFCON|ASIAN|GOLD|OFCNC/))N.ach('cont'); }
  if(c.kind==='final'){ S.u.bud+=got*8; if(got>=4)N.ach('semi'); if(got>ex)N.ach('over'); }
  N.mail('Федерация футбола','Итоги: '+c.n,txt); S._stop='comp'; N.checkJob(c.kind==='final'); }
};
N.trust=(d)=>{ SS.u.trust=Math.round(cl(SS.u.trust+d,0,100)); };
N.checkJob=(big)=>{ const S=SS; if(S.u.trust<=12){ S.u.fired=1; N.offers(true); S._stop='fired'; return; }
 if(big&&S.u.trust>=70) N.offers(false); };
N.offers=(fired)=>{ const S=SS; const my=S.T[S.me]; const all=Object.values(S.T).filter(t=>t.c!==S.me).sort((a,b)=>b.elo-a.elo);
 const ref=my.elo+(fired?-150:120)+ (S.u.trust-60)*3; let c=all.filter(t=>Math.abs(t.elo-ref)<160); if(c.length<3)c=all.filter(t=>Math.abs(t.elo-ref)<320);
 shuffle(c); const off=c.slice(0,fired?3:ri(1,2)).map(t=>t.c);
 if(fired){ N.mail('Федерация футбола','Вы уволены','К сожалению, федерация потеряла доверие к вашей работе и приняла решение расторгнуть контракт. Однако вашей кандидатурой заинтересовались другие федерации — выберите новую команду.',{type:'fired',off}); }
 else off.forEach(t=>N.mail('Федерация '+S.T[t].n,'Предложение о работе','Федерация футбола '+S.T[t].f+' '+S.T[t].n+' предлагает вам возглавить национальную сборную. Сила команды: '+N.starsHtml(N.stars(S.T[t]))+'.',{type:'offer',t})); };
N.takeJob=(t)=>{ const S=SS; const old=S.me; S.me=t; S.u.fired=0; S.u.trust=55; S.u.call=[]; S.u.xi=null; S.u.instr={}; S.u.found=[];
 const tm=S.T[t]; const need=40-tm.pl.length; for(let i=0;i<need;i++){ const pos=SQ[i%SQ.length]; tm.pl.push(N.genPlayer(t,pos,Math.round(tm.r-8+gauss()*4),ri(18,26),{caps:ri(0,5)}).id); }
 for(const id of tm.pl) S.P[id].rh=S.P[id].rh||[];
 S.u.teams.push({c:t,from:S.d}); N.autoCall(); for(const c of Object.values(S.C)) if(c.stage!=='done'&&(c.teams||[]).includes(t)) N.setExpect(c);
 N.mail('Федерация футбола','Новая работа','Вы возглавили сборную '+tm.f+' '+tm.n+'. Удачи! Сформируйте вызов на ближайшее окно.'); N.ach('job'); };
// ---------- вызов и состав ----------
N.pool=(c)=>(N.T(c).pl||[]).map(id=>SS.P[id]).filter(p=>p&&!p.ret);
N.autoCall=()=>{ const S=SS; const ps=N.pool(S.me).filter(p=>!p.inj).sort((a,b)=>(b.o+b.form)-(a.o+a.form)); const call=[]; const need={G:3,D:8,M:8,F:4};
 for(const g in need){ ps.filter(p=>N.POS[p.pos][1]===g).slice(0,need[g]).forEach(p=>call.push(p.id)); }
 S.u.call=call; N.autoXI(); };
N.autoXI=(form)=>{ const S=SS; const f=form||(S.u.xi&&S.u.xi.form)||'4-3-3'; const ps=S.u.call.map(id=>S.P[id]).filter(Boolean); const lu=N.autoLineup(ps,f); S.u.xi={form:f,s:lu.xi.map(p=>p?p.id:null),b:lu.bench.map(p=>p.id)}; };
N.validXI=()=>{ const S=SS,x=S.u.xi; if(!x)return false; const call=new Set(S.u.call); const all=x.s.concat(x.b); if(x.s.some(id=>!id||!call.has(id)||S.P[id].inj||S.P[id].sus))return false; if(new Set(all).size!==all.length)return false; return true; };
N.setup=(c,fx)=>{ const S=SS; const t=S.T[c];
 if(c===S.me){ if(!N.validXI()){ const old=S.u.xi; N.autoXI(old&&old.form); } const x=S.u.xi; const F=N.FORMS[x.form];
  const avail=new Set(S.u.call.filter(id=>!S.P[id].inj&&!S.P[id].sus));
  return {code:c,n:t.n,user:true,on:x.s.map((id,i)=>({p:S.P[id],role:F[i][0]})),bench:x.b.filter(id=>avail.has(id)&&!x.s.includes(id)).slice(0,12).map(id=>S.P[id]),tac:{...S.u.tac},instr:{...S.u.instr},subsLeft:fx&&fx.c==='FR'?6:5}; }
 const ps=N.pool(c).filter(p=>!p.inj&&!p.sus).sort((a,b)=>b.o-a.o).slice(0,23); const lu=N.autoLineup(ps,t.form); const F=N.FORMS[t.form];
 const ment = 0; return {code:c,n:t.n,on:lu.xi.map((p,i)=>({p,role:F[i][0]})).filter(e=>e.p),bench:lu.bench,tac:{ment,press:1,tempo:1,style:'mix'},instr:{}}; };
// ---------- результаты ----------
N.eloUpd=(f,hg,ag)=>{ const H=SS.T[f.h],A=SS.T[f.a]; const ha=f.neu?0:(f.hostA?-80:80); const we=1/(1+Math.pow(10,-(H.elo-A.elo+ha)/400)); const c=SS.C[f.c];
 const K=c.kind==='fr'?18:c.kind==='final'?(f.ko?50:40):32; const gd=Math.abs(hg-ag); const G=gd<=1?1:gd===2?1.5:(11+gd)/8; const w=hg>ag?1:hg<ag?0:0.5; const d=Math.round(K*G*(w-we)); H.elo+=d; A.elo-=d; };
N.playFix=(f,m)=>{ // m — завершённый Match
 const S=SS; const c=S.C[f.c]; const official=c.kind!=='fr'; const r={hg:m.score[0],ag:m.score[1],et:m.extra?1:0,pen:m.pens?m.pens.slice():null,sc:[]};
 r.w = m.winner===0?f.h:m.winner===1?f.a:null;
 for(const e of m.ev) if(e.t==='goal'){ const p=S.P[e.p]; r.sc.push([e.p,p?p.n:'?',e.side,e.m,e.pen?1:0,e.p2||0]); }
 const user = f.h===S.me||f.a===S.me;
 const teams=[f.h,f.a];
 // сняты дисквалификации (отбыли)
 if(official) for(const t of teams) for(const p of N.pool(t)) if(p.sus>0&&!m.ps[p.id]) p.sus--;
 for(const id in m.ps){ const P=m.ps[id]; const p=S.P[id]; if(!p)continue; if(P.min<=0&&!P.g)continue; const side=P.side; const conc=side===0?r.ag:r.hg;
  p.caps++; p.g+=P.g; p.a+=P.a; if(P.role==='GK'&&conc===0&&P.min>=60)p.cs++;
  p.form=+cl(p.form*0.55+P.rt*0.45,3,10).toFixed(2);
  const w=m.winner===side?1:m.winner===-1?0:-1; p.mor=cl(p.mor+(w>0?4:w<0?-4:0)+(P.rt>=7.5?3:P.rt<5.5?-3:0),5,100);
  if(official){ if(P.rc){p.sus=c.kind==='final'?1:ri(1,2);p.yc=0;p._ns=1;} else if(P.yc){p.yc+=P.yc; const lim=c.kind==='final'?2:3; if(p.yc>=lim){p.sus=1;p.yc=0;}} }
  if(P.inj){ const med=p.t===S.me?(1-0.1*(S.u.infra.med-1)):1; p.inj=Math.round(ri(4,40)*med); }
  if(p.t===S.me&&user){ p.rh.push([S.d,P.rt,c.sh||'ТМ',P.g,P.a]); if(p.rh.length>120)p.rh.shift(); }
 }
 if(user){ r.det={st:m.st,ps:Object.entries(m.ps).map(([id,P])=>[+id,S.P[id]?S.P[id].n:'?',P.side,P.rt,P.g,P.a,P.min,P.role,P.yc,P.rc,P.inj?1:0,P.sv]),ev:m.ev.filter(e=>['goal','yc','rc','sub','inj','pk'].includes(e.t)).map(e=>[e.m,e.t,e.side,e.txt])}; f.u=1; }
 f.r=r; N.eloUpd(f,r.hg,r.ag);
 if(user) N.afterUser(f,m);
 N.onFixDone(f);
};
N.afterUser=(f,m)=>{ const S=SS; const side=f.h===S.me?0:1; const my=m.score[side], op=m.score[1-side]; const c=S.C[f.c]; const opp=S.T[side?f.h:f.a]; const me=S.T[S.me];
 const res= m.winner===side?'w':m.winner===-1?'d':'l'; S.u.stat[res]++; if(res==='w')N.ach('first'); S.u.stat.gf+=my; S.u.stat.ga+=op;
 const we=1/(1+Math.pow(10,-(me.elo-opp.elo+(f.neu?0:side?-80:80))/400)); const act=res==='w'?1:res==='d'?0.5:0; const K=c.kind==='fr'?1.5:c.kind==='final'?5:3.5;
 N.trust(Math.round(K*(act-we)+(res==='w'&&c.kind!=='fr'?0.6:0))); S.u.bud+= (res==='w'?4:res==='d'?2:1)+(f.h===S.me?S.u.infra.stad-1:0);
 // не игравшие вызванные
 for(const id of S.u.call){ const p=S.P[id]; if(!m.ps[id]&&p){ p.mor=cl(p.mor-(p.o>=me.str?3:1),5,100); p.form=+(p.form*0.9+6.2*0.1).toFixed(2);} if(p&&p.prom){ if(!m.ps[id]||m.ps[id].from>0){p.mor=cl(p.mor-20,5,100); N.mail(p.n,'Обещание нарушено','Тренер, вы обещали мне место в стартовом составе. Я разочарован.');} p.prom=0; } }
 if(my-op>=5)N.ach('rout'); if(res==='w'&&opp.elo>me.elo+150)N.ach('giant'); if(op===0&&c.kind!=='fr')N.ach('clean');
 const ws=S.F.filter(x=>x.u&&x.r).slice(-10); if(ws.length>=10&&ws.every(x=>x.r.w? x.r.w===S.me : (x.h===S.me?x.r.hg>x.r.ag:x.r.ag>x.r.hg)))N.ach('streak');
 for(const id in m.ps){ const P=m.ps[id]; if(P.side===side&&P.g>=3)N.ach('hat'); }
 if(S.u.stat.w>=50)N.ach('w50');
 if(S.u.trust<=12&&!S.u.fired){ N.checkJob(false); }
 // пресс-конференция
 if(R()<(c.kind==='fr'?0.3:0.65)) S.u.press=N.genPress(res,c,opp,my,op);
};
N.simFix=(f)=>{ const h=N.setup(f.h,f), a=N.setup(f.a,f); const m=new N.Match(h,a,{ko:!!f.ko,neutral:!!f.neu,autoUser:true}); m.sim(); N.playFix(f,m); return m; };
// ---------- товарищеские ----------
N.busy=(c,d)=>SS.F.some(f=>f.d===d&&(f.h===c||f.a===c));
N.evFr=(e)=>{ const S=SS; const d=e.d; const busy=new Set(); for(const f of S.F) if(f.d===d){busy.add(f.h);busy.add(f.a);} // команды в финальном турнире не играют
 for(const c of Object.values(S.C)) if(c.kind==='final'&&c.stage!=='pending'&&c.stage!=='done') c.teams.forEach(t=>busy.add(t));
 const idle=shuffle(Object.keys(S.T).filter(c=>!busy.has(c)&&c!==S.me&&R()<0.7));
 const byConf={}; idle.forEach(c=>{(byConf[S.T[c].conf]=byConf[S.T[c].conf]||[]).push(c)}); const left=[];
 for(const k in byConf){ const l=byConf[k]; while(l.length>=2){ if(R()<.2){left.push(l.pop());continue;} const a=l.pop(); l.sort((x,y)=>Math.abs(S.T[x].elo-S.T[a].elo)-Math.abs(S.T[y].elo-S.T[a].elo)); const b=l.splice(Math.min(l.length-1,ri(0,3)),1)[0]; N.addFix(d,'FR',a,b,'Товарищеский матч'); } left.push(...l); }
 shuffle(left); while(left.length>=2){ N.addFix(d,'FR',left.pop(),left.pop(),'Товарищеский матч'); } };
N.freeDates=()=>{ const S=SS; const y=+S.d.slice(0,4); const out=[]; for(const yy of [y,y+1]) for(const d of N.windowDates(yy)) if(d>S.d&&!N.busy(S.me,d)) out.push(d);
 // нельзя во время финального турнира
 return out.slice(0,8); };
N.schedFriendly=(d,opp,home)=>{ const S=SS; if(N.busy(S.me,d)||N.busy(opp,d))return false; N.addFix(d,'FR',home?S.me:opp,home?opp:S.me,'Товарищеский матч'); S.u.bud=Math.max(0,S.u.bud); return true; };
// ---------- события ----------
N.evYear=(e)=>{ const S=SS; const y=+e.d.slice(0,4); const me=S.me; const notes=[];
 for(const c in S.T){ const t=S.T[c]; const target= c===me?40:23; const keep=[];
  for(const id of t.pl){ const p=S.P[id]; if(!p||p.ret)continue; p.age++; N.develop(p,c===me); 
   const retire = (p.age>=34&&R()<0.3+(p.age-34)*0.2)||(p.age>=31&&p.o<t.r-12&&R()<.35)||p.age>=40;
   if(retire){ if(c===me){p.ret=S.d.slice(0,4); if(p.caps>=20)notes.push(p.n+' ('+p.age+', '+p.caps+' матчей)');} else delete S.P[id]; continue; }
   if(R()<.12) p.club=N.clubFor(p.o,c); keep.push(id); }
  // слабейших отсеиваем из широкого списка ИИ
  let pl=keep; if(c!==me&&pl.length>target+3){ pl.sort((a,b)=>S.P[b].o-S.P[a].o); pl.slice(target+3).forEach(id=>delete S.P[id]); pl=pl.slice(0,target+3); }
  const acad=c===me?S.u.infra.acad:1; const nYouth=Math.max(c===me?2+acad:1,target-pl.length);
  const gks=pl.filter(id=>S.P[id].pos==='GK').length;
  for(let i=0;i<nYouth;i++){ const pos= gks+i<3&&i===0?'GK':pick(SQ); const p=N.genPlayer(c,pos,Math.round(t.r-14+gauss()*4+(acad-1)),ri(17,19),{caps:0,potB:(acad-1)*3}); pl.push(p.id); if(c===me&&p.pot>=t.r)notes.push('🌱 '+p.n+' ('+N.POS[pos][0]+', потенциал '+p.pot+')'); }
  t.pl=pl; N.teamStr(c); }
 N.mail('Федерация футбола','Новый '+y+' год','Игроки стали старше на год. '+(notes.length?'Изменения в пуле: '+notes.join('; ')+'.':'')+' Доверие федерации: '+S.u.trust+'%.'); 
 if(S.u.trust>=75&&R()<.5) N.offers(false);
 N.addEv((y+1)+'-01-01','year'); S._stop='year'; };
N.develop=(p,user)=>{ const a=p.age; let d; const base=user?(1+0.15*(SS.u.infra.base-1)):1;
 if(a<=21) d=(p.pot-p.o)*(0.2+R()*0.3)*base+(p.u21?1:0); else if(a<=24) d=(p.pot-p.o)*(0.15+R()*0.3)*base; else if(a<=29) d=gauss()*1.2; else if(a<=32) d=-R()*2.5; else d=-1-R()*3.5;
 if(Math.abs(d)<0.1)return; const ks=N.ATTRS.filter(k=>p.pos==='GK'?k==='gk'||k==='phy'||k==='pas':k!=='gk');
 for(let it=0;it<3;it++){ const t0=p.o+d; const cur=raw(p,p.pos); const dd=t0-cur; for(const k of ks){ let x=dd; if(d<0&&(k==='spd'||k==='phy'))x*=1.4; p[k]=cl(p[k]+x,5,99); } }
 for(const k of N.ATTRS)p[k]=Math.round(p[k]); delete p.u21; N.upd(p); if(p.pot<p.o)p.pot=p.o; };
N.evWin=(e)=>{ const S=SS; S.u.win++; S.u.scoutLeft=S.u.infra.scout; const my=S.F.filter(f=>!f.r&&(f.h===S.me||f.a===S.me)&&N.diffD(S.d,f.d)<=12);
 // тренировка
 N.training(); N.u21Window();
 N.mail('Штаб сборной','Международное окно',(my.length?'В ближайшее окно у нас '+my.length+' матч(а): '+my.map(f=>N.fmtD(f.d,1)+' — '+S.T[f.h===S.me?f.a:f.h].n).join(', ')+'.':'В этом окне у нас нет официальных матчей — можно назначить товарищеские игры (Соревнования → Товарищеские).')+' Проверьте вызов (18–23 игрока) и состав.'); S._stop='win'; };
N.training=()=>{ const S=SS; const t=S.u.train; const base=1+0.25*(S.u.infra.base-1); const int=[0.6,1,1.5][t.i];
 const map={att:['att','tec'],def:['def','phy'],phys:['phy','spd'],tec:['pas','tec'],bal:['att','def','pas','tec','phy','spd'],gk:['gk']};
 for(const id of S.u.call){ const p=S.P[id]; if(!p)continue; const ks=(map[t.f]||map.bal).filter(k=>p.pos==='GK'?['gk','phy','pas'].includes(k)||t.f==='gk':k!=='gk'); const young=p.age<=24?1.5:p.age>=31?0.5:1; 
  if(p.o<p.pot||p.age<=29){ for(const k of ks) if(R()<0.22*int*base*young/ks.length*2) p[k]=Math.min(99,p[k]+1); }
  if(t.f==='rest'){p.fit=100;p.mor=cl(p.mor+4,5,100);} if(t.f==='tac'){p.form=+cl(p.form+0.25,3,10).toFixed(2);}
  if(t.i===2&&R()<0.03){p.inj=ri(3,14); N.mail('Медицинский штаб','Травма на тренировке',p.n+' травмировался на интенсивной тренировке и выбыл на '+p.inj+' дн.');}
  if(t.i===0)p.fit=Math.min(100,p.fit+10); N.upd(p); }
 N.teamStr(S.me); };
N.u21Window=()=>{ const S=SS; const me=S.T[S.me]; const yng=N.pool(S.me).filter(p=>p.age<=21&&!S.u.call.includes(p.id)).sort((a,b)=>b.o-a.o).slice(0,11);
 if(yng.length<7)return; const str=yng.reduce((s,p)=>s+p.o,0)/yng.length; const opp=pick(Object.values(S.T).filter(t=>t.conf===me.conf&&t.c!==S.me));
 const os=opp.r-9+gauss()*3; const lam=x=>1.3*Math.pow(x,2.2); const ratio=str/os; const g1=pois(lam(ratio)), g2=pois(lam(1/ratio));
 yng.forEach(p=>{p.u21=1; if(R()<.3&&p.o<p.pot){const k=pick(['att','def','pas','tec','phy','spd']); p[k]=Math.min(99,p[k]+1); N.upd(p);} });
 const sc=g1>0?yng.filter(p=>p.pos!=='GK').slice(0,g1).map(p=>p.n.split(' ').pop()):[];
 S.u.u21.res.unshift({d:S.d,o:opp.c,s:[g1,g2],sc}); S.u.u21.res=S.u.u21.res.slice(0,20); };
function pois(l){let L=Math.exp(-l),k=0,p=1;do{k++;p*=R()}while(p>L);return k-1}
N.evCycle=(e)=>{ const S=SS; // архив старых турниров
 for(const c of Object.values(S.C)) if(c.stage==='done'&&c.kind!=='fr'){ S.arch.push({id:c.id,n:c.n,w:c.w||(c.groups[0]&&N.table(c,c.groups[0].n)[0].t),kind:c.kind,ts:N.topScorers(c.id).slice(0,5),yr:c.yr}); delete S.C[c.id]; }
 S.F=S.F.filter(f=>f.u||(S.C[f.c]&&f.c!=='FR')||(!f.r)); N.buildCycle(e.y); N.runEvents(S.d); };
N.topScorers=(cid)=>{ const m={}; for(const f of SS.F){ if(f.c!==cid||!f.r)continue; for(const s of f.r.sc){ const k=s[0]; const team=s[2]===0?f.h:f.a; if(!m[k])m[k]={id:k,n:s[1],t:team,g:0,a:0}; m[k].g++; } for(const s of f.r.sc) if(s[5]){ const k=s[5]; if(!m[k]){const p=SS.P[k]; m[k]={id:k,n:p?p.n:'?',t:s[2]===0?f.h:f.a,g:0,a:0};} m[k].a++; } }
 return Object.values(m).filter(x=>x.g>0).sort((a,b)=>b.g-a.g||b.a-a.a); };
// ---------- шаг календаря ----------
N.userFixToday=()=>SS.F.find(f=>f.d===SS.d&&!f.r&&(f.h===SS.me||f.a===SS.me));
N.processToday=()=>{ const S=SS; for(const f of S.F.filter(f=>f.d===S.d&&!f.r)){ if(f.h===S.me||f.a===S.me)continue; N.simFix(f); } };
N.advance=(opt={})=>{ const S=SS; S._stop=null; let guard=0;
 while(guard++<2000){
  const uf=N.userFixToday(); if(uf&&!opt.autoUser) return {stop:'match',f:uf};
  if(uf&&opt.autoUser){ N.simFix(uf); }
  N.processToday();
  if(S.u.fired&&!opt.autoUser) return {stop:'fired'};
  // следующая дата
  let nd=null; for(const f of S.F) if(!f.r&&f.d>S.d&&(!nd||f.d<nd))nd=f.d; for(const e of S.E) if(e.d>S.d&&(!nd||e.d<nd))nd=e.d;
  if(!nd) return {stop:'end'};
  const days=N.diffD(S.d,nd); N.passDays(days); S.d=nd;
  N.runEvents(nd);
  if(N.userFixToday()&&!opt.autoUser) return {stop:'match',f:N.userFixToday()};
  if(S._stop&&!opt.autoUser&&!opt.noStop) return {stop:S._stop};
  if(opt.until&&S.d>=opt.until) return {stop:'until'};
 } return {stop:'guard'}; };
N.runEvents=(nd)=>{ const S=SS; const evs=S.E.filter(e=>e.d===nd); S.E=S.E.filter(e=>e.d!==nd);
 const ord={cycle:0,year:1,draw:2,win:3,fr:4}; evs.sort((a,b)=>ord[a.t]-ord[b.t]);
 for(const e of evs){ if(e.t==='draw')N.evDraw(e); else if(e.t==='fr')N.evFr(e); else if(e.t==='year')N.evYear(e); else if(e.t==='win')N.evWin(e); else if(e.t==='cycle')N.evCycle(e); } };
N.passDays=(n)=>{ if(n<=0)return; const S=SS; const rec=n*8*(1+0.1*(S.u.infra.med-1)); for(const id in S.P){ const p=S.P[id]; if(p.ret)continue; if(p.fit<100)p.fit=Math.min(100,p.fit+rec); if(p.inj>0)p.inj=Math.max(0,p.inj-n); if(n>20)p.form=+(p.form+(6.5-p.form)*0.15).toFixed(2); if(n>20&&p.mor!==65)p.mor=Math.round(p.mor+(65-p.mor)*0.1); } };
// ---------- пресс-конференции ----------
N.genPress=(res,c,opp,my,op)=>{ const Q=[];
 if(res==='w') Q.push({q:'Победа над '+opp.n+' со счётом '+my+':'+op+'. Ваши впечатления?',a:[['Горжусь ребятами — они выложились полностью.',{mor:4,tr:1}],['Мы можем играть ещё лучше, расслабляться рано.',{mor:-1,form:.2,tr:2}],['Это была моя тактическая победа.',{mor:-4,tr:2}]]});
 else if(res==='l') Q.push({q:'Поражение '+my+':'+op+' от '+opp.n+'. Кто виноват?',a:[['Ответственность целиком на мне.',{mor:3,tr:-1}],['Некоторые игроки сыграли ниже своего уровня.',{mor:-5,form:.2,tr:1}],['Судейство повлияло на результат.',{mor:1,tr:-2}]]});
 else Q.push({q:'Ничья '+my+':'+op+'. Довольны результатом?',a:[['Справедливый итог, двигаемся дальше.',{mor:1}],['Мы должны были побеждать.',{mor:-2,form:.15,tr:1}],['Соперник был очень хорош.',{mor:2,tr:-1}]]});
 Q.push(pick([{q:'Болельщики требуют больше молодёжи в составе. Ваш ответ?',a:[['Молодые получат шанс, когда заслужат.',{tr:1}],['Да, мы будем обновлять состав.',{mor:-2,tr:2,young:4}],['Опыт сейчас важнее.',{mor:2,tr:-1}]]},
  {q:'Какие цели у команды на ближайший турнир?',a:[['Только победа!',{mor:3,tr:2,risk:1}],['Идём от матча к матчу.',{mor:1}],['Мы — аутсайдеры, давления нет.',{mor:-1,tr:-2}]]},
  {q:'Как вы оцениваете физическое состояние игроков?',a:[['Все в порядке, команда готова.',{mor:2}],['Есть проблемы с усталостью, будем ротировать.',{tr:1}],['Клубы перегружают игроков.',{mor:3,tr:-2}]]},
  {q:'Ходят слухи о вашем уходе в другую сборную. Это правда?',a:[['Я полностью сосредоточен на этой команде.',{tr:3,mor:1}],['Никогда не говори никогда.',{tr:-4}],['Без комментариев.',{tr:-1}]]}]));
 return {c:c.n,Q}; };
N.applyPress=(eff)=>{ const S=SS; if(eff.tr)N.trust(eff.tr); for(const id of S.u.call){ const p=S.P[id]; if(!p)continue; if(eff.mor)p.mor=cl(p.mor+eff.mor+ri(-1,1),5,100); if(eff.form)p.form=+cl(p.form+eff.form*(p.pers===2?1.5:p.pers===0?0.5:1),3,10).toFixed(2); }
 if(eff.young) N.pool(S.me).filter(p=>p.age<=22).forEach(p=>p.mor=cl(p.mor+eff.young,5,100)); };
// ---------- разговоры с игроками ----------
N.talk=(p,kind)=>{ const S=SS; if(p.talk===S.u.win)return 'С этим игроком вы уже говорили в этом окне.'; p.talk=S.u.win; let d=0,msg='';
 const good=p.form>=6.8;
 if(kind==='praise'){ d=good?ri(5,9):ri(1,4); if(p.pers===2&&good&&R()<.4){p.form=+(p.form-0.2).toFixed(2);msg='Игрок польщён, но может немного расслабиться.';} else msg=good?'Игрок воодушевлён вашей похвалой.':'Игрок благодарен, но знает, что может лучше.'; }
 else if(kind==='crit'){ if(p.pers===0){d=ri(-12,-6);msg='Игрок болезненно воспринял критику.';} else if(p.pers===2){d=ri(1,5);p.form=+cl(p.form+0.4,3,10).toFixed(2);msg='Игрок принял вызов и хочет доказать вашу неправоту!';} else {d=ri(-3,3);p.form=+cl(p.form+0.2,3,10).toFixed(2);msg='Игрок спокойно выслушал замечания.';} }
 else if(kind==='promise'){ d=ri(8,14); p.prom=1; msg='Игрок рад обещанию место в старте в следующем матче. Не подведите его!'; }
 else if(kind==='comp'){ if(p.pers===2){d=ri(-2,2);p.form=+cl(p.form+0.35,3,10).toFixed(2);msg='Конкуренция подстегнула игрока.';} else {d=ri(-7,-2);msg='Игрок обеспокоен своим местом в составе.';} }
 else if(kind==='rest'){ p.fit=Math.min(100,p.fit+15); d=ri(0,4); msg='Игрок благодарен за возможность восстановиться.'; }
 p.mor=cl(p.mor+d,5,100); return msg+' Мораль '+(d>=0?'+':'')+d+'.'; };
// ---------- скаутинг ----------
N.scout=()=>{ const S=SS; if(S.u.scoutLeft<=0)return null; S.u.scoutLeft--; const t=S.T[S.me]; const lvl=S.u.infra.scout; const found=[];
 const n=ri(2,3)+(lvl>=3?1:0);
 for(let i=0;i<n;i++){ const dual=R()<0.4; const pos=pick(SQ); const strong=Object.values(S.T).filter(x=>x.conf==='UEFA'&&x.r>=74&&x.c!==S.me); const dn=dual?pick(strong):null;
  const p=N.genPlayer(S.me,pos,Math.round(t.r-6+gauss()*5+lvl*1.5),ri(18,27),{caps:0,dual:dn?dn.c:null,pool:dn&&R()<.5?dn.pool:null,club: dn?N.clubFor(t.r+4,dn.c):undefined});
  p.scouted=1; found.push(p.id); }
 S.u.found=found.concat(S.u.found||[]).slice(0,12); return found; };
N.invite=(id)=>{ const S=SS; const p=S.P[id]; if(!p)return ''; const me=S.T[S.me]; let ch=0.8; if(p.dual){ const o=S.T[p.dual]; ch=cl(0.55+(me.elo-o.elo)/600 + (p.o<o.str-4?0.3:0),0.1,0.95); }
 S.u.found=S.u.found.filter(x=>x!==id); if(R()<ch){ delete p.scouted; S.T[S.me].pl.push(id); if(p.dual)N.ach('scout'); return '✅ '+p.n+' согласился выступать за сборную!'+(p.dual?' (отказался от '+S.T[p.dual].n+')':''); } delete S.P[id]; return '❌ '+p.n+' отказался'+(p.dual?' — он предпочёл '+S.T[p.dual].n:'')+'.'; };
// ---------- инфраструктура ----------
N.INFRA={base:['Тренировочная база','Быстрее прогресс игроков на сборах'],acad:['Молодёжная академия','Больше и талантливее воспитанники'],med:['Медицинский центр','Быстрее восстановление и лечение травм'],scout:['Скаутская служба','Больше поисков игроков за окно'],stad:['Национальный стадион','Больше доходов и поддержка болельщиков']};
N.infraCost=l=>[0,40,80,140,220,0][l];
N.upgrade=(k)=>{ const S=SS; const l=S.u.infra[k]; if(l>=5)return false; const c=N.infraCost(l); if(S.u.bud<c)return false; S.u.bud-=c; S.u.infra[k]++; if(Object.values(S.u.infra).every(x=>x>=3))N.ach('infra'); return true; };
// ---------- достижения ----------
N.ACH={first:['Первая победа','Выиграйте первый матч'],clean:['На замке','Официальный матч без пропущенных'],rout:['Разгром','Победа с разницей 5+ мячей'],giant:['Гроза фаворитов','Победите намного более сильного соперника'],hat:['Хет-трик','Игрок сборной забил 3 мяча в матче'],
 qual:['Путёвка','Выйдите в финальный турнир'],semi:['Четвёрка сильнейших','Дойдите до полуфинала турнира'],over:['Выше ожиданий','Превзойдите задачу федерации'],trophy:['Первый трофей','Выиграйте любой турнир'],cont:['Чемпион континента','Выиграйте континентальное первенство'],
 wc:['Чемпион мира','Выиграйте чемпионат мира'],streak:['Серия','10 побед подряд'],w50:['Полсотни','50 побед на посту'],job:['Новый вызов','Возглавьте другую сборную'],infra:['Строитель','Все объекты инфраструктуры 3 уровня+'],scout:['Находка','Пригласите игрока с двойным гражданством']};
N.ach=(k)=>{ const S=SS; if(S.u.ach[k])return; S.u.ach[k]=S.d; N.mail('Достижение','🏅 '+N.ACH[k][0],N.ACH[k][1]+'.'); };
})();
// ---------- сохранение (LZW-сжатие) ----------
(function(){ const N=globalThis.NFM; const LIM=60000;
 const enc=c=>String.fromCharCode(c<0xD800?c:c+0x800), dec=ch=>{const c=ch.charCodeAt(0);return c<0xD800?c:c-0x800};
 N.lzw=(str)=>{ const b=new TextEncoder().encode(str); if(!b.length)return ''; const map=new Map(); let next=256,w=b[0]; const out=[]; let chunk=[];
  const emit=c=>{chunk.push(enc(c)); if(chunk.length>=8192){out.push(chunk.join(''));chunk=[];}};
  for(let i=1;i<b.length;i++){ const k=w*256+b[i]; const v=map.get(k); if(v!==undefined){w=v;continue;} emit(w); if(next<LIM)map.set(k,next++); else {map.clear();next=256;} w=b[i]; }
  emit(w); out.push(chunk.join('')); return out.join(''); };
 N.unlzw=(s)=>{ if(!s)return ''; let dict=[]; let next=256; const get=c=>c<256?[c]:dict[c-256]; const parts=[]; let prev=dec(s[0]); parts.push(get(prev));
  for(let i=1;i<s.length;i++){ const c=dec(s[i]); let e;
   if(next<LIM){ if(c<next) e=get(c); else { const p=get(prev); e=p.concat([p[0]]); } dict.push(get(prev).concat([e[0]])); next++; }
   else { dict=[]; next=256; e=get(c); }
   parts.push(e); prev=c; }
  let len=0; for(const p of parts)len+=p.length; const u=new Uint8Array(len); let o=0; for(const p of parts){u.set(p,o);o+=p.length;} return new TextDecoder().decode(u); };
 N.serialize=(S)=>'L1'+N.lzw(JSON.stringify(S,(k,v)=>k[0]==='_'?undefined:v));
 N.deserialize=(s)=>JSON.parse(s.startsWith('L1')?N.unlzw(s.slice(2)):s);
})();

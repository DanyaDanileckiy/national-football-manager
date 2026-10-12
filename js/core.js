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
const MON=[_t("января"),_t("февраля"),_t("марта"),_t("апреля"),_t("мая"),_t("июня"),_t("июля"),_t("августа"),_t("сентября"),_t("октября"),_t("ноября"),_t("декабря")];
const WDAY=[_t("вс"),_t("пн"),_t("вт"),_t("ср"),_t("чт"),_t("пт"),_t("сб")];
N.fmtD=(s,short)=>{const [y,m,d]=s.split('-').map(Number);if(NFM_I18N.lang!=='ru')return NFM_I18N.date(y,m,d,short);const w=new Date(Date.UTC(y,m-1,d)).getUTCDay();return short?(d+' '+MON[m-1].slice(0,3)+' '+y):(WDAY[w]+', '+d+' '+MON[m-1]+' '+y)};
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
N.ATTRN={att:_t("Атака"),def:_t("Оборона"),pas:_t("Пас"),tec:_t("Техника"),phy:_t("Физика"),spd:_t("Скорость"),gk:_t("Вратарь")};
function raw(p,role){const w=RW[role];let s=0;for(const k in w)s+=w[k]*(p[k]||0);return s}
N.compat=(pos,role)=>{ if(pos===role)return 1; if(pos==='GK'||role==='GK')return .35; const c=COMPAT[pos]&&COMPAT[pos][role]; if(c)return c; const g1=N.POS[pos][1],g2=N.POS[role][1]; if(g1===g2)return .82; if((g1+g2).match(/DF|FD/))return .55; return .7; };
N.roleOvr=(p,role)=>{ if(!p||!p.att&&!p.gk)return 30; return raw(p,role)*(0.7+0.3*N.compat(p.pos,role)); };
N.ovr=p=>Math.round(raw(p,p.pos));
N.upd=p=>{p.o=N.ovr(p);return p};
let SS=null; N.setS=s=>{SS=s}; N.getS=()=>SS;
// ---------- клубы ----------
const FOREIGN={UEFA:'ENG:1 ES:1 DE:1 IT:1 FR:.9 PT:.45 NL:.45 BE:.4 TR:.4 SCO:.2 GR:.25 AT:.3 CH:.3 DK:.2 RU:.2 SA:.2 US:.15',
 CONMEBOL:'ES:1 IT:.7 PT:.8 ENG:.8 FR:.5 DE:.4 BR:.6 AR:.5 MX:.6 US:.5 SA:.4 TR:.2',
 CONCACAF:'US:1.2 MX:.9 ENG:.3 ES:.25 DE:.2 FR:.2 NL:.2 BE:.2 SCO:.3 PT:.2',
 CAF:'FR:1 BE:.7 PT:.6 ENG:.7 ES:.5 IT:.5 DE:.5 TR:.5 SA:.5 QA:.2 AE:.2 CH:.2 DK:.15 US:.15',
 AFC:'JP:.5 KR:.3 SA:.4 QA:.4 AE:.4 DE:.3 ENG:.3 NL:.2 BE:.25 PT:.2 CN:.2',OFC:'ENG:.5 US:.5 SCO:.3 AU:.6 NZ:.4'};
const FW={}; for(const k in FOREIGN){ FW[k]=FOREIGN[k].split(' ').map(x=>{const [c,w]=x.split(':');return [c,+w]}); }
N.leagueLvl=(a,b)=>leagueLvl(a,b); function leagueLvl(cc,div){ const L=N.LEAGUES[cc]; const t=SS.T[cc]; let v=L?L[0]:(t?t.r-6:50); if(div===2)v-=13; return v; }
N.clubsOf=clubsOf; function clubsOf(key){ const S=SS; S.clubs=S.clubs||{}; if(!S.clubs[key]){ const cc=key.split('_')[0]; const L=N.LEAGUES[cc]; const t=SS.T[cc]; const lang=L?L[1]:(t?t.pool.split('+')[0]:'en'); S.clubs[key]=N.clubList(cc,lang); } return S.clubs[key]; }
N.assignClub=(p,nat)=>{ const S=SS; const t=S.T[nat]||S.T[p.t]; const o=p.o; const cands=[];
 const add=(cc,div,w)=>{ if(!S.T[cc])return; const L=leagueLvl(cc,div); if(o>L+9||o<L-16)return; const fit=Math.exp(-Math.pow((o-(L-3))/6.5,2)); cands.push([cc,div,w*fit,L]); };
 add(t.c,1,1.6); if(N.LEAGUES[t.c]) add(t.c,2,1.4);
 for(const [cc,w] of FW[t.conf]||[]) if(cc!==t.c) add(cc,1,w*(t.r<70?0.7:1));
 if(t.pool.includes('mag')||t.pool.includes('afwf')) add('FR',1,.8);
 let ch; if(!cands.length){ ch=[t.c,1,1,leagueLvl(t.c,1)]; } else { let s=cands.reduce((a,c)=>a+c[2],0), r=R()*s; ch=cands[cands.length-1]; for(const c of cands){ r-=c[2]; if(r<=0){ch=c;break;} } }
 const [cc,div,,L]=ch; const list=clubsOf(cc+(div===2?'_2':'')); const idx=Math.round(cl((L+8-o)/22*17+gauss()*1.5,0,17));
 p.club=list[Math.min(list.length-1,idx)]; p.lg=cc; p.div=div===2?2:undefined; };
N.clubFor=(o,team)=>{ const p={o,t:team}; N.assignClub(p,team); return p.club; };
// ---------- игроки ----------
const HB={GK:190,CB:187,LB:178,RB:178,DM:182,CM:179,AM:176,LM:175,RM:175,LW:174,RW:174,ST:183};
const AGEW=[[18,2],[19,4],[20,6],[21,8],[22,9],[23,10],[24,11],[25,11],[26,11],[27,11],[28,10],[29,9],[30,8],[31,6],[32,4],[33,3],[34,2],[35,1]];
N.randAge=(gk)=>{ let s=0; for(const [,w] of AGEW)s+=w; let r=R()*s; for(const [a,w] of AGEW){ r-=w; if(r<=0) return Math.min(37,a+(gk&&R()<.5?ri(1,2):0)); } return 27; };
function takenSet(team){ const S=SS; const t=S.T[team]; const set=new Set(); if(t&&t.pl) for(const id of t.pl){ const q=S.P[id]; if(q&&!q.ret) set.add(q.nf?q.n:q.sn); } return set; }
N.genPlayer=(team,pos,target,age,opt={})=>{
 const S=SS; const t=N.T(team); const nm=N.genName(opt.pool||t.pool,opt.taken||takenSet(team)); const p={id:S.nid++,n:nm.n,sn:nm.sn,t:team,pos,age:age||N.randAge(pos==='GK')}; if(nm.nf)p.nf=1;
 const w=RW[pos];
 for(const k of N.ATTRS){ if(k==='gk') p.gk = pos==='GK'?target+gauss()*3:ri(8,20); else if(pos==='GK') p[k]= k==='phy'||k==='pas'||k==='spd'?target-12+gauss()*6:ri(15,35); else p[k]= (w[k]?target+gauss()*4:target-16+gauss()*8); }
 for(let it=0;it<3;it++){ const d=target-raw(p,pos); for(const k of N.ATTRS){ if(pos==='GK'&&k!=='gk'&&!w[k])continue; if(pos!=='GK'&&k==='gk')continue; p[k]+=d; } }
 for(const k of N.ATTRS) p[k]=Math.round(cl(p[k],5,99));
 N.upd(p);
 const a=p.age; p.pot=Math.round(cl(p.o+(a<=19?ri(6,18):a<=21?ri(4,13):a<=23?ri(1,8):a<=26?ri(0,3):0)+(opt.potB||0),p.o,97));
 const pl=String(t.pool); let hm=0; if(/jp|kr|cn|vn|th|id|in/.test(pl))hm=-4; else if(/scand|se|nl|balk|is|de|be/.test(pl))hm=2; else if(/lat|pt|br|mag|ar/.test(pl))hm=-1;
 p.h=Math.round(HB[pos]+hm+gauss()*4.5+(p.phy-70)*0.08); const lp=['LB','LM','LW'].includes(pos)?.68:pos==='CB'?.22:.18; p.ft=R()<.06?'B':R()<lp?'L':'R';
 p.form=+(6+R()).toFixed(1); p.mor=ri(55,78); p.fit=100; p.inj=0; p.sus=0; p.yc=0;
 if(opt.club){p.club=opt.club;p.lg=opt.lg;} else N.assignClub(p,opt.clubNat||team);
 p.caps=opt.caps??0; p.g=0;p.a=0;p.cs=0; p.pers=ri(0,2); p.rh=[];
 if(opt.dual)p.dual=opt.dual;
 S.P[p.id]=p; if(t&&t.pl&&opt.addToPool) t.pl.push(p.id); return p;
};
const SQ=['GK','GK','GK','CB','CB','CB','CB','LB','RB','LB','RB','DM','DM','CM','CM','CM','AM','LM','RM','LW','RW','ST','ST'];
N.SQ=SQ;
N.genPool=(team,size)=>{ const t=N.T(team); const r=t.r; const ids=[]; t.pl=ids; const taken=new Set();
 for(let i=0;i<size;i++){ const pos=SQ[i%SQ.length]; const tier=Math.floor(i/SQ.length);
  const target = tier===0? r+3-((i*0.45))*0.5-((i>=11)?2.5:0)+gauss()*2.5 : r-7-tier*2+gauss()*3; const age= tier>0&&R()<.5?ri(18,22):N.randAge(pos==='GK');
  ids.push(N.genPlayer(team,pos,Math.round(cl(target,25,95)),age,{taken}).id); }
 // история выступлений: основные игроки — больше матчей и голов
 const ps=ids.map(id=>SS.P[id]); const byPos={}; for(const p of ps){ const g=N.POS[p.pos][1]; (byPos[g]=byPos[g]||[]).push(p); }
 const starters={G:1,D:4,M:4,F:2}, squad={G:3,D:8,M:8,F:4};
 for(const g in byPos){ byPos[g].sort((a,b)=>b.o-a.o).forEach((p,k)=>{ const yrs=Math.max(0,p.age-19-(p.o<r-4?2:0)); const rate= k<starters[g]?ri(5,8):k<squad[g]?ri(2,5):R()*1.2;
   p.caps=Math.round(Math.min(185,yrs*rate*(0.7+R()*0.5))); if(p.age<=20)p.caps=Math.min(p.caps,ri(0,6));
   const gr= p.pos==='ST'?0.38:p.pos==='LW'||p.pos==='RW'?0.24:p.pos==='AM'?0.18:g==='M'?0.07:g==='D'?0.03:0; p.g=Math.round(p.caps*gr*(0.55+R()*0.8)*(k<starters[g]?1.15:0.8));
   p.a=Math.round(p.caps*(g==='M'?0.11:g==='F'?0.12:g==='D'?0.04:0.003)*(0.5+R()*0.9)); if(g==='G')p.cs=Math.round(p.caps*(0.25+0.15*(r-60)/30)*(0.6+R()*0.6)); }); }
 return ids; };
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
 const S={v:4,clubs:{},nl:{},d:'2026-08-01',me:team,coach:coach||_t("Тренер"),nid:1,nfid:1,P:{},T:{},C:{},F:[],E:[],arch:[],
  u:{trust:55,call:[],xi:null,tac:{ment:0,press:1,tempo:1,width:1,style:'mix'},instr:{},train:{f:'bal',i:1},infra:{base:1,acad:1,med:1,scout:1,stad:1},bud:30,scoutLeft:1,mail:[],tro:[],ach:{},stat:{w:0,d:0,l:0,gf:0,ga:0},u21:{res:[]},teams:[{c:team,from:'2026-08-01'}],found:[],press:null,win:0,expect:{}},log:[]};
 SS=S; for(const t of N.TEAMS){ S.T[t.c]={...t,elo:Math.round(1000+(t.r-40)*20+gauss()*25),form:pick(['4-3-3','4-2-3-1','4-4-2','4-3-3','4-2-3-1','3-5-2','4-1-4-1','5-3-2']),pl:[]}; }
 N.seedPts(S); for(const c in S.T) N.genPool(c, c===team?40:23); S.u.prs=30; S.u.fan=60; S.u.yres=[]; N.y17Fill();
 for(const c in S.T) N.teamStr(c);
 S.C.FR={id:'FR',n:_t("Товарищеские матчи"),sh:_t("ТМ"),kind:'fr',groups:[],stage:'groups'};
 N.buildCycle(2026);
 N.addEv('2027-01-01','year'); N.autoCall(); N.mail(_t("Федерация футбола"),_t("Добро пожаловать!"),_t("Уважаемый {0}, федерация рада приветствовать вас на посту главного тренера сборной {1}. Мы ждём от вас достойных результатов. Ваш первый вызов уже сформирован — проверьте состав перед ближайшим окном.",(S.coach),(S.T[team].n)));
 N.runEvents(S.d); S._stop=null; return S; };
N.addEv=(d,t,x)=>{SS.E.push({d,t,...x})};
N.mail=(from,sub,body,act)=>{const K=NFM_I18N.keyOf;SS.u.mail.unshift({d:SS.d,from,sub,body,act,rd:0,fk:K(from),sk:K(sub),bk:K(body)}); if(SS.u.mail.length>80)SS.u.mail.length=80;};
// турниры — см. js/comps.js
N.trust=(d)=>{ SS.u.trust=Math.round(cl(SS.u.trust+d,0,100)); };
N.checkJob=(big)=>{ const S=SS; if(S.u.trust<=12){ S.u.fired=1; N.offers(true); S._stop='fired'; return; }
 if(big&&S.u.trust>=70) N.offers(false); };
N.offers=(fired)=>{ const S=SS; const my=S.T[S.me]; const all=Object.values(S.T).filter(t=>t.c!==S.me).sort((a,b)=>b.elo-a.elo);
 const ref=my.elo+(fired?-150:120)+ (S.u.trust-60)*3; let c=all.filter(t=>Math.abs(t.elo-ref)<160); if(c.length<3)c=all.filter(t=>Math.abs(t.elo-ref)<320);
 shuffle(c); const off=c.slice(0,fired?3:ri(1,2)).map(t=>t.c);
 if(fired){ N.mail(_t("Федерация футбола"),_t("Вы уволены"),_t("К сожалению, федерация потеряла доверие к вашей работе и приняла решение расторгнуть контракт. Однако вашей кандидатурой заинтересовались другие федерации — выберите новую команду."),{type:'fired',off}); }
 else off.forEach(t=>N.mail(_t("Федерация {0}",(S.T[t].n)),_t("Предложение о работе"),`${_t("Федерация футбола {0} {1} предлагает вам возглавить национальную сборную. Сила команды",(S.T[t].f),(S.T[t].n))}: ${(N.starsHtml(N.stars(S.T[t])))}.`,{type:'offer',t})); };
N.takeJob=(t)=>{ const S=SS; const old=S.me; S.me=t; S.u.fired=0; S.u.trust=55; S.u.call=[]; S.u.xi=null; S.u.instr={}; S.u.found=[];
 const tm=S.T[t]; const need=40-tm.pl.length; for(let i=0;i<need;i++){ const pos=SQ[i%SQ.length]; tm.pl.push(N.genPlayer(t,pos,Math.round(tm.r-8+gauss()*4),ri(18,26),{caps:ri(0,5)}).id); }
 for(const id of tm.pl) S.P[id].rh=S.P[id].rh||[];
 S.u.teams.push({c:t,from:S.d}); N.autoCall(); for(const c of Object.values(S.C)) if(c.stage!=='done'&&(c.teams||[]).includes(t)) N.setExpect(c);
 N.mail(_t("Федерация футбола"),_t("Новая работа"),_t("Вы возглавили сборную {0} {1}. Удачи! Сформируйте вызов на ближайшее окно.",(tm.f),(tm.n))); N.ach('job'); };
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
 const ps=N.pool(c).filter(p=>!p.inj&&!p.sus).sort((a,b)=>b.o*(0.8+0.2*b.fit/100)-a.o*(0.8+0.2*a.fit/100)).slice(0,23); const lu=N.autoLineup(ps,t.form); const F=N.FORMS[t.form];
 const ment = 0; return {code:c,n:t.n,on:lu.xi.map((p,i)=>({p,role:F[i][0]})).filter(e=>e.p),bench:lu.bench,tac:{ment,press:1,tempo:1,style:'mix'},instr:{}}; };
// ---------- результаты ----------
N.eloUpd=(f,hg,ag)=>{ const H=SS.T[f.h],A=SS.T[f.a]; const ha=f.neu?0:(f.hostA?-80:80); const we=1/(1+Math.pow(10,-(H.elo-A.elo+ha)/400)); const c=SS.C[f.c];
 const K=c.kind==='fr'?18:c.kind==='final'?(f.ko?50:40):32; const gd=Math.abs(hg-ag); const G=gd<=1?1:gd===2?1.5:(11+gd)/8; const w=hg>ag?1:hg<ag?0:0.5; const d=Math.round(K*G*(w-we)); H.elo+=d; A.elo-=d; };
N.playFix=(f,m)=>{ // m — завершённый Match
 const S=SS; const c=S.C[f.c]; const official=c.kind!=='fr'; const r={hg:m.score[0],ag:m.score[1],et:m.extra?1:0,pen:m.pens?m.pens.slice():null,sc:[]};
 r.w = m.winner===0?f.h:m.winner===1?f.a:null; if(m.agg){ r.w= m.aggW===0?f.h:m.aggW===1?f.a:null; r.agg=[m.tot(0),m.tot(1)]; } if(f.vn){ r.wx=f.vn.wx; r.att=f.vn.att; }
 for(const e of m.ev) if(e.t==='goal'){ const p=S.P[e.p]; r.sc.push([e.p,p?p.n:'?',e.side,e.ml||e.m,e.pen?1:(e.fk?2:0),e.p2||0]); }
 const user = f.h===S.me||f.a===S.me;
 const teams=[f.h,f.a];
 // сняты дисквалификации (отбыли)
 if(official) for(const t of teams) for(const p of N.pool(t)) if(p.sus>0&&!m.ps[p.id]) p.sus--;
 for(const id in m.ps){ const P=m.ps[id]; const p=S.P[id]; if(!p)continue; if(P.min<=0&&!P.g)continue; const side=P.side; const conc=side===0?r.ag:r.hg;
  p.caps++; p.g+=P.g; p.a+=P.a; if(P.role==='GK'&&conc===0&&P.min>=60)p.cs++;
  p.form=+cl(p.form*0.55+P.rt*0.45,3,10).toFixed(2);
  const w=m.winner===side?1:m.winner===-1?0:-1; p.mor=cl(p.mor+(w>0?4:w<0?-4:0)+(P.rt>=7.5?3:P.rt<5.5?-3:0),5,100);
  if(official){ if(P.rc){p.sus=c.kind==='final'?1:ri(1,2);p.yc=0;p._ns=1;} else if(P.yc){p.yc+=P.yc; const lim=c.kind==='final'?2:3; if(p.yc>=lim){p.sus=1;p.yc=0;}} }
  if(P.inj){ const med=p.t===S.me?(1-0.1*(S.u.infra.med-1)):1; const x=R(); p.inj=Math.max(2,Math.round((x<.55?ri(3,10):x<.88?ri(11,35):ri(36,120))*med)); }
  if(p.t===S.me&&user){ p.rh.push([S.d,P.rt,c.sh||_t("ТМ"),P.g,P.a]); if(p.rh.length>120)p.rh.shift(); }
 }
 if(user){ r.det={st:m.st,ps:Object.entries(m.ps).map(([id,P])=>[+id,S.P[id]?S.P[id].n:'?',P.side,P.rt,P.g,P.a,P.min,P.role,P.yc,P.rc,P.inj?1:0,P.sv]),ev:m.ev.filter(e=>['goal','yc','rc','sub','inj','pk','var'].includes(e.t)).map(e=>[e.ml||e.m,e.t,e.side,e.txt])}; f.u=1; }
 f.r=r; N.eloUpd(f,r.hg,r.ag); N.fifaUpd(f);
 if(user) N.afterUser(f,m);
 N.onFixDone(f);
};
N.afterUser=(f,m)=>{ const S=SS; const side=f.h===S.me?0:1; const my=m.score[side], op=m.score[1-side]; const c=S.C[f.c]; const opp=S.T[side?f.h:f.a]; const me=S.T[S.me];
 const res= m.winner===side?'w':m.winner===-1?'d':'l'; S.u.stat[res]++; if(res==='w')N.ach('first'); S.u.stat.gf+=my; S.u.stat.ga+=op;
 const we=1/(1+Math.pow(10,-(me.elo-opp.elo+(f.neu?0:side?-80:80))/400)); const act=res==='w'?1:res==='d'?0.5:0; const K=c.kind==='fr'?1.5:c.kind==='final'?5:3.5;
 N.trust(Math.round(K*(act-we)+(res==='w'&&c.kind!=='fr'?0.6:0))); S.u.bud+= (res==='w'?4:res==='d'?2:1)+(f.h===S.me?S.u.infra.stad-1:0);
 // не игравшие вызванные
 for(const id of S.u.call){ const p=S.P[id]; if(!m.ps[id]&&p){ p.mor=cl(p.mor-(p.o>=me.str?3:1),5,100); p.form=+(p.form*0.9+6.2*0.1).toFixed(2);} if(p&&p.prom){ if(!m.ps[id]||m.ps[id].from>0){p.mor=cl(p.mor-20,5,100); N.mail(p.n,_t("Обещание нарушено"),_t("Тренер, вы обещали мне место в стартовом составе. Я разочарован."));} p.prom=0; } }
 if(my-op>=5)N.ach('rout'); if(res==='w'&&opp.elo>me.elo+150)N.ach('giant'); if(op===0&&c.kind!=='fr')N.ach('clean');
 const ws=S.F.filter(x=>x.u&&x.r).slice(-10); if(ws.length>=10&&ws.every(x=>x.r.w? x.r.w===S.me : (x.h===S.me?x.r.hg>x.r.ag:x.r.ag>x.r.hg)))N.ach('streak');
 for(const id in m.ps){ const P=m.ps[id]; if(P.side===side&&P.g>=3)N.ach('hat'); }
 if(S.u.stat.w>=50)N.ach('w50');
 if(S.u.trust<=12&&!S.u.fired){ N.checkJob(false); }
 // пресс-конференция
 if(R()<(c.kind==='fr'?0.3:0.65)) S.u.press=N.genPress(res,c,opp,my,op);
};
// стадион, погода, посещаемость
const NORTH=new Set(['RU','BY','UA','FI','SE','NO','IS','EE','LV','LT','PL','CZ','SK','DK','FO','SCO','NIR','IE','KZ','CA','US','DE','NL','BE','AT','CH','HU','RO','RS','KP','KR','JP','MN','CN']);
const HOT=new Set(['QA','AE','SA','KW','BH','OM','IQ','EG','SD','ML','NE','TD','MR','SN','NG','GH','CI','BF','IN','PK','TH','VN','KH','MY','ID','SG','MX','BR','CO','VE','PY','JM','HN','SV','GT','CR','PA']);
N.venue=(f)=>{ if(f.vn) return f.vn; const S=SS; const c=S.C[f.c]; const ht=S.T[f.h], at=S.T[f.a]; const host= f.neu? (c&&c.host?c.host:f.h) : f.h; const m=+f.d.slice(5,7);
 const hostT=S.T[host]; const hot=HOT.has(host)||(m>=6&&m<=8&&!NORTH.has(host)), cold=NORTH.has(host)&&(m>=11||m<=3);
 const r=R(); let wx= cold&&r<.12?'snow': r<.2?'rain': hot&&r<.55?'heat': r<.3?'wind': r<.55?'cloud':'clear';
 const big= c&&c.kind==='final'; let cap=Math.round(cl(6000+(hostT.elo-1050)*55+ (R()-.5)*8000, 4000, 85000)/500)*500; if(big) cap=Math.max(cap, ri(35,80)*1000); if(f.neu&&!big) cap=Math.min(cap,ri(15,40)*1000);
 const imp=(c&&c.kind==='fr'?0:0.15)+(f.ko?0.12:0)+(big?0.2:0); const opp=(at.elo+ht.elo)/2; let fill=cl(0.42+imp+(opp-1500)/1500+(R()-.5)*0.25+(ht.elo<1300?-0.08:0),0.2,1);
 if(f.neu&&!big) fill=cl(fill-0.2,0.15,1); if(!f.neu&&f.h===S.me) fill=cl(fill+((S.u.fan??60)-55)/250,0.15,1);
 f.vn={wx,cap,att:Math.round(cap*fill/100)*100,fill:+fill.toFixed(2)}; return f.vn; };
N.matchOpts=(f,auto)=>{ const v=N.venue(f); let agg=null; if(f.leg===2){ const l1=N.fixById(f.l1); if(l1&&l1.r) agg=[l1.r.ag,l1.r.hg]; }
 return {ko:!!f.ko&&f.leg!==1,neutral:!!f.neu,agg,wx:v.wx,hf:f.neu?0:0.55+0.45*v.fill,autoUser:!!auto}; };
N.simFix=(f)=>{ const h=N.setup(f.h,f), a=N.setup(f.a,f); const m=new N.Match(h,a,N.matchOpts(f,true)); m.sim(); N.playFix(f,m); return m; };
// ---------- товарищеские ----------
N.busy=(c,d)=>SS.F.some(f=>f.d===d&&!f.y&&(f.h===c||f.a===c));
N.evFr=(e)=>{ const S=SS; const d=e.d; const busy=new Set(); for(const f of S.F) if(f.d===d&&!f.y){busy.add(f.h);busy.add(f.a);} // команды в финальном турнире не играют
 for(const c of Object.values(S.C)) if(c.kind==='final'&&c.stage!=='pending'&&c.stage!=='done') c.teams.forEach(t=>busy.add(t));
 const idle=shuffle(Object.keys(S.T).filter(c=>!busy.has(c)&&c!==S.me&&R()<0.7));
 const byConf={}; idle.forEach(c=>{(byConf[S.T[c].conf]=byConf[S.T[c].conf]||[]).push(c)}); const left=[];
 for(const k in byConf){ const l=byConf[k]; while(l.length>=2){ if(R()<.2){left.push(l.pop());continue;} const a=l.pop(); l.sort((x,y)=>Math.abs(S.T[x].elo-S.T[a].elo)-Math.abs(S.T[y].elo-S.T[a].elo)); const b=l.splice(Math.min(l.length-1,ri(0,3)),1)[0]; N.addFix(d,'FR',a,b,_t("Товарищеский матч")); } left.push(...l); }
 shuffle(left); while(left.length>=2){ N.addFix(d,'FR',left.pop(),left.pop(),_t("Товарищеский матч")); } };
N.freeDates=()=>{ const S=SS; const y=+S.d.slice(0,4); const out=[]; for(const yy of [y,y+1]) for(const d of N.windowDates(yy)) if(d>S.d&&!N.busy(S.me,d)) out.push(d);
 // нельзя во время финального турнира
 return out.slice(0,8); };
N.schedFriendly=(d,opp,home)=>{ const S=SS; if(N.busy(S.me,d)||N.busy(opp,d))return false; N.addFix(d,'FR',home?S.me:opp,home?opp:S.me,_t("Товарищеский матч")); S.u.bud=Math.max(0,S.u.bud); return true; };
// ---------- события ----------
N.evYear=(e)=>{ const S=SS; const y=+e.d.slice(0,4); const me=S.me; const notes=[];
 for(const c in S.T){ const t=S.T[c]; const target= c===me?40:23; const keep=[];
  for(const id of t.pl){ const p=S.P[id]; if(!p||p.ret)continue; p.age++; N.develop(p,c===me); 
   const retire = (p.age>=34&&R()<0.3+(p.age-34)*0.2)||(p.age>=31&&p.o<t.r-12&&R()<.35)||p.age>=40;
   if(retire){ if(c===me){p.ret=S.d.slice(0,4); if(p.caps>=20)notes.push(`${(p.n)} (${(p.age)}, ${_t("{0} матчей)",(p.caps))}`);} else delete S.P[id]; continue; }
   if(R()<.12) N.assignClub(p,c); keep.push(id); }
  // слабейших отсеиваем из широкого списка ИИ
  let pl=keep; if(c!==me&&pl.length>target+3){ pl.sort((a,b)=>S.P[b].o-S.P[a].o); pl.slice(target+3).forEach(id=>delete S.P[id]); pl=pl.slice(0,target+3); }
  const acad=c===me?S.u.infra.acad:1; const nYouth=Math.max(c===me?2+acad:1,target-pl.length);
  const gks=pl.filter(id=>S.P[id].pos==='GK').length;
  for(let i=0;i<nYouth;i++){ const pos= gks+i<3&&i===0?'GK':pick(SQ); const p=N.genPlayer(c,pos,Math.round(t.r-14+gauss()*4+(acad-1)),ri(17,19),{caps:0,potB:(acad-1)*3}); pl.push(p.id); if(c===me&&p.pot>=t.r)notes.push(`🌱 ${(p.n)} (${(N.POS[pos][0])}, ${_t("потенциал {0})",(p.pot))}`); }
  t.pl=pl; N.teamStr(c); }
 N.mail(_t("Федерация футбола"),_t("Новый {0} год",(y)),`${_t("Игроки стали старше на год. {0} Доверие федерации",(notes.length?`${_t("Изменения в пуле")}: ${(notes.join('; '))}.`:''))}: ${(S.u.trust)}%.`); 
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
 N.mail(_t("Штаб сборной"),_t("Международное окно"),_t("{0} Проверьте вызов (18–23 игрока) и состав.",(my.length?`${_t("В ближайшее окно у нас {0} матч(а)",(my.length))}: ${(my.map(f=>N.fmtD(f.d,1)+' — '+S.T[f.h===S.me?f.a:f.h].n).join(', '))}.`:_t("В этом окне у нас нет официальных матчей — можно назначить товарищеские игры (Соревнования → Товарищеские).")))); S._stop='win'; };
N.training=()=>{ const S=SS; const t=S.u.train; const base=1+0.25*(S.u.infra.base-1); const int=[0.6,1,1.5][t.i];
 const map={att:['att','tec'],def:['def','phy'],phys:['phy','spd'],tec:['pas','tec'],bal:['att','def','pas','tec','phy','spd'],gk:['gk']};
 for(const id of S.u.call){ const p=S.P[id]; if(!p)continue; const ks=(map[t.f]||map.bal).filter(k=>p.pos==='GK'?['gk','phy','pas'].includes(k)||t.f==='gk':k!=='gk'); const young=p.age<=24?1.5:p.age>=31?0.5:1; 
  if(p.o<p.pot||p.age<=29){ for(const k of ks) if(R()<0.22*int*base*young/ks.length*2) p[k]=Math.min(99,p[k]+1); }
  if(t.f==='rest'){p.fit=100;p.mor=cl(p.mor+4,5,100);} if(t.f==='tac'){p.form=+cl(p.form+0.25,3,10).toFixed(2);}
  if(t.i===2&&R()<0.03){p.inj=ri(3,14); N.mail(_t("Медицинский штаб"),_t("Травма на тренировке"),_t("{0} травмировался на интенсивной тренировке и выбыл на {1} дн.",(p.n),(p.inj)));}
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
 for(const c of Object.values(S.C)) if(c.stage==='done'&&c.kind!=='fr'){ S.arch.push({id:c.id,n:c.n,w:c.w||(c.groups&&c.groups[0]&&!c.po?N.table(c,c.groups[0].n)[0].t:null),kind:c.kind,ts:N.topScorers(c.id).slice(0,5),yr:c.yr}); delete S.C[c.id]; }
 S.F=S.F.filter(f=>f.u||(S.C[f.c]&&f.c!=='FR')||(!f.r)); N.buildCycle(e.y); N.runEvents(S.d); };
N.topScorers=(cid)=>{ const m={}; for(const f of SS.F){ if(f.c!==cid||!f.r)continue; for(const s of f.r.sc){ const k=s[0]; const team=s[2]===0?f.h:f.a; if(!m[k])m[k]={id:k,n:s[1],t:team,g:0,a:0}; m[k].g++; } for(const s of f.r.sc) if(s[5]){ const k=s[5]; if(!m[k]){const p=SS.P[k]; m[k]={id:k,n:p?p.n:'?',t:s[2]===0?f.h:f.a,g:0,a:0};} m[k].a++; } }
 return Object.values(m).filter(x=>x.g>0).sort((a,b)=>b.g-a.g||b.a-a.a); };
// ---------- шаг календаря ----------
N.userFixToday=()=>SS.F.find(f=>f.d===SS.d&&!f.r&&!f.y&&(f.h===SS.me||f.a===SS.me));
N.processToday=()=>{ const S=SS; for(const f of S.F.filter(f=>f.d===S.d&&!f.r)){ if(f.y){ N.quickFix(f); continue; } if(f.h===S.me||f.a===S.me)continue; N.simFix(f); } };
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
  if(opt.steps&&guard>=opt.steps) return {stop:'step'};
 } return {stop:'guard'}; };
N.runEvents=(nd)=>{ const S=SS; const evs=S.E.filter(e=>e.d===nd); S.E=S.E.filter(e=>e.d!==nd);
 const ord={cycle:0,year:1,fn:2,draw:3,win:4,fr:5}; evs.sort((a,b)=>ord[a.t]-ord[b.t]);
 for(const e of evs){ if(e.t==='draw')N.evDraw(e); else if(e.t==='fr')N.evFr(e); else if(e.t==='year')N.evYear(e); else if(e.t==='win')N.evWin(e); else if(e.t==='cycle')N.evCycle(e); else if(e.t==='fn'&&N.fn[e.fn])N.fn[e.fn](e); } };
N.passDays=(n)=>{ if(n<=0)return; const S=SS; const rec=n*6*(1+0.1*(S.u.infra.med-1)); for(const id in S.P){ const p=S.P[id]; if(p.ret)continue; if(p.fit<100)p.fit=Math.min(100,p.fit+rec); if(p.inj>0)p.inj=Math.max(0,p.inj-n); if(n>20)p.form=+(p.form+(6.5-p.form)*0.15).toFixed(2); if(n>20&&p.mor!==65)p.mor=Math.round(p.mor+(65-p.mor)*0.1); } };
// ---------- пресс-конференции ----------
N.genPress=(res,c,opp,my,op)=>{ const Q=[];
 if(res==='w') Q.push({q:_t("Победа над {0} со счётом {1}:{2}. Ваши впечатления?",(opp.n),(my),(op)),a:[[_t("Горжусь ребятами — они выложились полностью."),{mor:4,tr:1}],[_t("Мы можем играть ещё лучше, расслабляться рано."),{mor:-1,form:.2,tr:2}],[_t("Это была моя тактическая победа."),{mor:-4,tr:2}]]});
 else if(res==='l') Q.push({q:_t("Поражение {0}:{1} от {2}. Кто виноват?",(my),(op),(opp.n)),a:[[_t("Ответственность целиком на мне."),{mor:3,tr:-1}],[_t("Некоторые игроки сыграли ниже своего уровня."),{mor:-5,form:.2,tr:1}],[_t("Судейство повлияло на результат."),{mor:1,tr:-2}]]});
 else Q.push({q:_t("Ничья {0}:{1}. Довольны результатом?",(my),(op)),a:[[_t("Справедливый итог, двигаемся дальше."),{mor:1}],[_t("Мы должны были побеждать."),{mor:-2,form:.15,tr:1}],[_t("Соперник был очень хорош."),{mor:2,tr:-1}]]});
 Q.push(pick([{q:_t("Болельщики требуют больше молодёжи в составе. Ваш ответ?"),a:[[_t("Молодые получат шанс, когда заслужат."),{tr:1}],[_t("Да, мы будем обновлять состав."),{mor:-2,tr:2,young:4}],[_t("Опыт сейчас важнее."),{mor:2,tr:-1}]]},
  {q:_t("Какие цели у команды на ближайший турнир?"),a:[[_t("Только победа!"),{mor:3,tr:2,risk:1}],[_t("Идём от матча к матчу."),{mor:1}],[_t("Мы — аутсайдеры, давления нет."),{mor:-1,tr:-2}]]},
  {q:_t("Как вы оцениваете физическое состояние игроков?"),a:[[_t("Все в порядке, команда готова."),{mor:2}],[_t("Есть проблемы с усталостью, будем ротировать."),{tr:1}],[_t("Клубы перегружают игроков."),{mor:3,tr:-2}]]},
  {q:_t("Ходят слухи о вашем уходе в другую сборную. Это правда?"),a:[[_t("Я полностью сосредоточен на этой команде."),{tr:3,mor:1}],[_t("Никогда не говори никогда."),{tr:-4}],[_t("Без комментариев."),{tr:-1}]]}]));
 return {c:c.n,Q}; };
N.applyPress=(eff)=>{ const S=SS; if(eff.tr)N.trust(eff.tr); for(const id of S.u.call){ const p=S.P[id]; if(!p)continue; if(eff.mor)p.mor=cl(p.mor+eff.mor+ri(-1,1),5,100); if(eff.form)p.form=+cl(p.form+eff.form*(p.pers===2?1.5:p.pers===0?0.5:1),3,10).toFixed(2); }
 if(eff.young) N.pool(S.me).filter(p=>p.age<=22).forEach(p=>p.mor=cl(p.mor+eff.young,5,100)); };
// ---------- разговоры с игроками ----------
N.talk=(p,kind)=>{ const S=SS; if(p.talk===S.u.win)return _t("С этим игроком вы уже говорили в этом окне."); p.talk=S.u.win; let d=0,msg='';
 const good=p.form>=6.8;
 if(kind==='praise'){ d=good?ri(5,9):ri(1,4); if(p.pers===2&&good&&R()<.4){p.form=+(p.form-0.2).toFixed(2);msg=_t("Игрок польщён, но может немного расслабиться.");} else msg=good?_t("Игрок воодушевлён вашей похвалой."):_t("Игрок благодарен, но знает, что может лучше."); }
 else if(kind==='crit'){ if(p.pers===0){d=ri(-12,-6);msg=_t("Игрок болезненно воспринял критику.");} else if(p.pers===2){d=ri(1,5);p.form=+cl(p.form+0.4,3,10).toFixed(2);msg=_t("Игрок принял вызов и хочет доказать вашу неправоту!");} else {d=ri(-3,3);p.form=+cl(p.form+0.2,3,10).toFixed(2);msg=_t("Игрок спокойно выслушал замечания.");} }
 else if(kind==='promise'){ d=ri(8,14); p.prom=1; msg=_t("Игрок рад обещанию место в старте в следующем матче. Не подведите его!"); }
 else if(kind==='comp'){ if(p.pers===2){d=ri(-2,2);p.form=+cl(p.form+0.35,3,10).toFixed(2);msg=_t("Конкуренция подстегнула игрока.");} else {d=ri(-7,-2);msg=_t("Игрок обеспокоен своим местом в составе.");} }
 else if(kind==='rest'){ p.fit=Math.min(100,p.fit+15); d=ri(0,4); msg=_t("Игрок благодарен за возможность восстановиться."); }
 p.mor=cl(p.mor+d,5,100); return _t("{0} Мораль {1}{2}.",(msg),(d>=0?'+':''),(d)); };
// ---------- скаутинг ----------
N.scout=()=>{ const S=SS; if(S.u.scoutLeft<=0)return null; S.u.scoutLeft--; const t=S.T[S.me]; const lvl=S.u.infra.scout; const found=[];
 const n=ri(2,3)+(lvl>=3?1:0);
 for(let i=0;i<n;i++){ const dual=R()<0.4; const pos=pick(SQ); const strong=Object.values(S.T).filter(x=>x.conf==='UEFA'&&x.r>=74&&x.c!==S.me); const dn=dual?pick(strong):null;
  const p=N.genPlayer(S.me,pos,Math.round(t.r-6+gauss()*5+lvl*1.5),ri(18,27),{caps:0,dual:dn?dn.c:null,pool:dn&&R()<.5?dn.pool:null,clubNat: dn?dn.c:undefined});
  p.scouted=1; found.push(p.id); }
 S.u.found=found.concat(S.u.found||[]).slice(0,12); return found; };
N.invite=(id)=>{ const S=SS; const p=S.P[id]; if(!p)return ''; const me=S.T[S.me]; let ch=0.8; if(p.dual){ const o=S.T[p.dual]; ch=cl(0.55+(me.elo-o.elo)/600 + (p.o<o.str-4?0.3:0),0.1,0.95); }
 S.u.found=S.u.found.filter(x=>x!==id); if(R()<ch){ delete p.scouted; S.T[S.me].pl.push(id); if(p.dual)N.ach('scout'); return `✅ ${_t("{0} согласился выступать за сборную!{1}",(p.n),(p.dual?` ${_t("(отказался от {0})",(S.T[p.dual].n))}`:''))}`; } delete S.P[id]; return `❌ ${_t("{0} отказался{1}.",(p.n),(p.dual?` — ${_t("он предпочёл {0}",(S.T[p.dual].n))}`:''))}`; };
// ---------- инфраструктура ----------
N.INFRA={base:[_t("Тренировочная база"),_t("Быстрее прогресс игроков на сборах")],acad:[_t("Молодёжная академия"),_t("Больше и талантливее воспитанники")],med:[_t("Медицинский центр"),_t("Быстрее восстановление и лечение травм")],scout:[_t("Скаутская служба"),_t("Больше поисков игроков за окно")],stad:[_t("Национальный стадион"),_t("Больше доходов и поддержка болельщиков")]};
N.infraCost=l=>[0,40,80,140,220,0][l];
N.upgrade=(k)=>{ const S=SS; const l=S.u.infra[k]; if(l>=5)return false; const c=N.infraCost(l); if(S.u.bud<c)return false; S.u.bud-=c; S.u.infra[k]++; if(Object.values(S.u.infra).every(x=>x>=3))N.ach('infra'); return true; };
// ---------- достижения ----------
N.ACH={first:[_t("Первая победа"),_t("Выиграйте первый матч")],clean:[_t("На замке"),_t("Официальный матч без пропущенных")],rout:[_t("Разгром"),_t("Победа с разницей 5+ мячей")],giant:[_t("Гроза фаворитов"),_t("Победите намного более сильного соперника")],hat:[_t("Хет-трик"),_t("Игрок сборной забил 3 мяча в матче")],
 qual:[_t("Путёвка"),_t("Выйдите в финальный турнир")],semi:[_t("Четвёрка сильнейших"),_t("Дойдите до полуфинала турнира")],over:[_t("Выше ожиданий"),_t("Превзойдите задачу федерации")],trophy:[_t("Первый трофей"),_t("Выиграйте любой турнир")],cont:[_t("Чемпион континента"),_t("Выиграйте континентальное первенство")],
 wc:[_t("Чемпион мира"),_t("Выиграйте чемпионат мира")],streak:[_t("Серия"),_t("10 побед подряд")],w50:[_t("Полсотни"),_t("50 побед на посту")],job:[_t("Новый вызов"),_t("Возглавьте другую сборную")],infra:[_t("Строитель"),`${_t("Все объекты инфраструктуры 3 уровня")}+`],scout:[_t("Находка"),_t("Пригласите игрока с двойным гражданством")]};
N.ach=(k)=>{ const S=SS; if(S.u.ach[k])return; S.u.ach[k]=S.d; N.mail(_t("Достижение"),'🏅 '+N.ACH[k][0],N.ACH[k][1]+'.'); };
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
// перевод сохранённых строк на текущий язык (после загрузки сохранения)
(function(){ const N=NFM; N.relang=S=>{ const I=NFM_I18N, by={}; N.TEAMS.forEach(t=>by[t.c]=t.n);
 for(const c in S.T) if(by[c])S.T[c].n=by[c];
 for(const id in S.C){ const c=S.C[id]; if(c.nk)c.n=I.re(c.nk); if(c.hk)c.sh=I.re(c.hk); }
 (S.F||[]).forEach(f=>{ if(f.sk)f.st=I.re(f.sk); });
 ((S.u&&S.u.mail)||[]).forEach(m=>{ if(m.fk)m.from=I.re(m.fk); if(m.sk)m.sub=I.re(m.sk); if(m.bk)m.body=I.re(m.bk); }); }; })();

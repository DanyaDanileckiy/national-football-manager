// Update #10: старт 1 января 2027, тактика (движок), настройки игры
(function(){
const N=NFM; const G=()=>N.getS(); const {cl}=N; const V10=N.v10={};
const START='2027-01-01';
// ===================== 1. Старт 1 января 2027 =====================
// новая карьера создаётся с календарём цикла 2026–2030, а осень 2026 года
// (Лига наций, отборы, Кубок Азии и т. д.) досимулируется как история до прихода тренера.
const _ng=N.newGame; N.newGame=(team,coach)=>{ const S=_ng(team,coach); S._pre10=1; return S; };
const KEEP=['u21','yres','y17','rkMe','dg','hl','hlU','kit','call','xi'];
V10.preStart=(S)=>{ N.setS(S); const u0=JSON.parse(JSON.stringify(S.u));
 const st={ach:N.ach,cj:N.checkJob,of:N.offers}; N.ach=()=>{}; N.checkJob=()=>{}; N.offers=()=>{}; N._pre10=1;
 try{ let g=0; while(S.d<START&&g++<50){ const r=N.advance({autoUser:true,until:START,noStop:true}); if(r.stop!=='until'&&r.stop!=='guard') break; } }
 finally{ N.ach=st.ach; N.checkJob=st.cj; N.offers=st.of; N._pre10=0; }
 const keep={}; for(const k of KEEP) if(S.u[k]!==undefined) keep[k]=S.u[k];
 S.u=Object.assign(u0,keep); const u=S.u; S._stop=null;
 for(const f of S.F) if(f.d<START&&f.u){ delete f.u; if(f.r) delete f.r.det; }
 u.teams=[{c:S.me,from:S.d}]; u.expect={}; for(const c of Object.values(S.C)) if(c.stage!=='done'&&(c.teams||[]).includes(S.me)) N.setExpect(c);
 if(u.car){ const h=u.car.hist[u.car.hist.length-1]; if(h){ h.from=S.d; h.s0={w:0,d:0,l:0,gf:0,ga:0}; } const [y,m,d]=S.d.split('-').map(Number); u.car.cEnd=N.ds(y+4,m,d); u.car.rh=[[S.d,Math.round(u.car.rep*10)/10]]; }
 if(u.scn) u.scn.from=S.d; u.mail=u.mail.filter(m=>m.act||m.sub===_t("Добро пожаловать!")); for(const m of u.mail) m.d=S.d;
 const act=Object.values(S.C).filter(c=>c.stage!=='done'&&c.kind!=='fr'&&!/^U\d|^OQ|^OLY/.test(c.id)&&(c.teams||[]).includes(S.me)); if(act.length) N.mail(_t("Федерация футбола"),_t("Положение дел на 1 января"),_t("Чемпионат мира 2026 позади, начинается новый цикл. Сборная продолжает выступления:")+'<br>'+act.map(c=>'• '+c.n+(N.expectText?' — '+N.expectText(c):'')).join('<br>'));
 N.autoCall(); return S; };
const _v6i=N.v6.init; N.v6.init=(S)=>{ _v6i(S); if(!S) return; if(S._pre10){ delete S._pre10; V10.preStart(S); } V10.init(S); };
V10.init=(S)=>{ const u=S.u; V10.migrateTac(u); u.opt=Object.assign({diff:1,inj:1,fat:1,wx:1},u.opt||{}); };
// ===================== 2. Тактика =====================
const DEF={ment:0,line:1,press:1,width:1,tempo:1,pass:1,style:'mix',trap:0,waste:0,tackle:1,focus:'m',roles:{},sp:{rt:'mix',mk:'zone',pk:[]},cond:[],asub:0,opp:{}};
V10.DEF=DEF;
V10.migrateTac=(u)=>{ const t=u.tac||(u.tac={}); if(t.style==='short'){ t.style='poss'; t.pass=0; } else if(t.style==='long'){ t.style='mix'; t.pass=2; }
 for(const k in DEF) if(t[k]===undefined) t[k]=JSON.parse(JSON.stringify(DEF[k]));
 if(!u.tsl){ const f=(u.xi&&u.xi.form)||'4-3-3'; const cp=()=>({form:f,tac:JSON.parse(JSON.stringify({...t,sp:undefined}))}); u.tsl={cur:'A',A:cp(),B:cp(),C:cp()}; }
 u.famH=u.famH||V10.tacHash(t); };
V10.tacHash=(t)=>['ment','line','press','width','tempo','pass','style','trap','tackle','focus'].map(k=>t[k]).join('|');
// пресеты
V10.PRESETS={
 bus:{n:()=>_t("Автобус"),ico:'🚌',form:'5-4-1',t:{ment:-2,line:0,press:0,width:0,tempo:0,pass:1,style:'mix',trap:0,waste:1,tackle:1,focus:'c'}},
 gegen:{n:()=>_t("Гегенпрессинг"),ico:'⚡',form:'4-3-3',t:{ment:1,line:2,press:2,width:1,tempo:2,pass:1,style:'mix',trap:1,waste:0,tackle:2,focus:'m'}},
 tiki:{n:()=>_t("Тики-така"),ico:'🎯',form:'4-3-3 F9',t:{ment:1,line:2,press:2,width:1,tempo:0,pass:0,style:'poss',trap:0,waste:0,tackle:1,focus:'c'}},
 counter:{n:()=>_t("Контратака"),ico:'🏹',form:'4-4-1-1',t:{ment:-1,line:0,press:1,width:1,tempo:2,pass:2,style:'counter',trap:0,waste:0,tackle:1,focus:'m'}},
 long:{n:()=>_t("Длинный мяч"),ico:'🚀',form:'4-4-2',t:{ment:0,line:1,press:1,width:2,tempo:1,pass:2,style:'mix',trap:0,waste:0,tackle:1,focus:'w'}},
 bal:{n:()=>_t("Баланс"),ico:'⚖️',form:'4-2-3-1',t:{ment:0,line:1,press:1,width:1,tempo:1,pass:1,style:'mix',trap:0,waste:0,tackle:1,focus:'m'}},
 wing:{n:()=>_t("Игра через фланги"),ico:'🪽',form:'4-3-3',t:{ment:1,line:1,press:1,width:2,tempo:1,pass:1,style:'mix',trap:0,waste:0,tackle:1,focus:'w'}}};
V10.applyPreset=(k,keepForm)=>{ const S=G(), u=S.u, P=V10.PRESETS[k]; if(!P) return; Object.assign(u.tac,JSON.parse(JSON.stringify(P.t))); u.tac.roles={}; u.tac.preset=k;
 if(!keepForm&&u.xi&&u.xi.form!==P.form) N.autoXI(P.form); };
// действия условных установок
V10.ACTS={att:()=>_t("Атаковать"),allin:()=>_t("Все в атаку"),def:()=>_t("Удержать счёт"),bus:()=>_t("Автобус"),press:()=>_t("Высокий прессинг"),calm:()=>_t("Успокоить игру"),A:()=>_t("Тактика A"),B:()=>_t("Тактика B"),C:()=>_t("Тактика C")};
N.actName=a=>(V10.ACTS[a]||(()=>a))();
V10.WHEN={lose:()=>_t("Проигрываем"),lose2:()=>_t("Проигрываем 2+"),draw:()=>_t("Ничья"),win1:()=>_t("Ведём в 1 мяч"),win:()=>_t("Ведём")};
N.applyAct=(tm,a,m)=>{ const t=tm.tac; if(!t) return;
 if(a==='att'){ t.ment=Math.max(t.ment,1); t.tempo=2; t.press=Math.max(t.press??1,1); t.waste=0; }
 else if(a==='allin'){ t.ment=2; t.tempo=2; t.press=2; t.line=2; t.pass=2; t.waste=0; }
 else if(a==='def'){ t.ment=Math.min(t.ment,-1); t.tempo=0; t.waste=1; t.line=Math.min(t.line??1,1); }
 else if(a==='bus'){ t.ment=-2; t.line=0; t.press=0; t.width=0; t.waste=1; }
 else if(a==='press'){ t.press=2; t.line=2; }
 else if(a==='calm'){ t.tempo=0; t.style='poss'; t.pass=0; }
 else if('ABC'.includes(a)&&tm.user){ const S=G(); const sl=S&&S.u.tsl&&S.u.tsl[a]; if(sl&&m) V10.switchSlot(m,tm.side,sl); } };
// смена схемы/установок по ходу матча (слоты A/B/C)
V10.switchSlot=(m,s,sl)=>{ const tm=m.t[s]; const keep={sp:tm.tac.sp,cond:tm.tac.cond,asub:tm.tac.asub,opp:tm.tac.opp}; tm.tac=Object.assign(JSON.parse(JSON.stringify(sl.tac)),keep);
 if(sl.form&&sl.form!==tm.form&&N.FORMS[sl.form]){ const F=N.FORMS[sl.form]; const on=m.onPitch(s); const used=new Set(); const FR=(N.FORMR||{})[sl.form]||{}; const nw=[];
  const order=F.map((_,i)=>i).sort((a,b)=>(F[a][0]==='GK'?-1:0)-(F[b][0]==='GK'?-1:0));
  for(const i of order){ const role=F[i][0]; let best=null,bv=-1; for(const e of on){ if(used.has(e)) continue; const v=(e.role==='GK')===(role==='GK')?N.roleOvr(e.p,role):-1; if(v>bv){bv=v;best=e;} } if(best){ used.add(best); best.role=role; best.pr=(sl.tac.roles||{})[i]||FR[i]||null; m.ps[best.p.id].role=role; } }
  tm.form=sl.form; }
 m.calc(); };
// ИИ: схема по составу и стиль по сопернику
const AIF=['4-3-3','4-2-3-1','4-4-2','4-1-4-1','3-5-2','5-3-2','4-4-1-1','3-4-3','4-1-2-1-2','5-4-1'];
const hs=(s)=>{ let h=0; for(let i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))>>>0; return h; };
N.aiTac=(c,fx,ps)=>{ const S=G(); const t=S.T[c];
 const mk=S.d.slice(0,4)+'q'+((+S.d.slice(5,7)-1)/3|0); /* v10.1: схема ИИ — раз в квартал */ if(!t.f10||t.f10.m!==mk){ let best=t.form||'4-3-3', bv=-1; const top=ps.slice(0,18);
   for(const f of AIF){ const lu=N.autoLineup(top,f); const F=N.FORMS[f]; let v=0; lu.xi.forEach((p,i)=>v+=p?N.roleOvr(p,F[i][0]):30); v+= (f===t.form?2:0); if(v>bv){bv=v;best=f;} }
   t.f10={m:mk,f:best}; t.form=best; }
 let form=t.f10.f; const tac={ment:0,press:1,tempo:1,line:1,width:1,pass:1,style:'mix',tackle:1};
 const oc=fx?(fx.h===c?fx.a:fx.h):null; const o=oc&&S.T[oc]; if(!o) return {form,tac};
 const d=(t.elo||1500)-(o.elo||1500)+(fx.neu?0:(fx.h===c?60:-60)); const pers=hs(c)%4; // «школа» сборной
 if(d>220){ Object.assign(tac,{ment:1,press:2,line:2,style:'poss',pass:0}); }
 else if(d>80){ Object.assign(tac,{ment:pers===2?1:0,press:pers===0?2:1,line:pers===0?2:1,style:pers===1?'poss':'mix'}); }
 else if(d<-220){ Object.assign(tac,{ment:-2,press:0,line:0,width:0,style:'counter',tempo:2,pass:2}); if(N.FORMS['5-4-1']&&ps.filter(p=>N.POS[p.pos][1]==='D').length>=6) form='5-4-1'; }
 else if(d<-80){ Object.assign(tac,{ment:-1,line:0,style:'counter',tempo:pers===3?2:1,pass:pers===3?2:1}); }
 else { if(pers===0) Object.assign(tac,{press:2,line:2}); else if(pers===1) Object.assign(tac,{style:'poss',pass:0,tempo:0}); else if(pers===3) Object.assign(tac,{pass:2,width:2,focus:'w'}); }
 tac.cond=[{w:'lose',min:70,a:'att'},{w:'win1',min:82,a:'def'}];
 return {form,tac}; };
// сыгранность: частая смена установок её снижает
V10.famCheck=()=>{ const S=G(), u=S.u; if(!u.fam) return; const h=V10.tacHash(u.tac); if(u.famH&&h!==u.famH){ const a=u.famH.split('|'), b=h.split('|'); let n=0; a.forEach((x,i)=>{ if(x!==b[i]) n++; }); u.fam.tac=Math.max(0,Math.round(u.fam.tac-Math.min(12,n*2.5))); } u.famH=h; };
const _su=N.setup; N.setup=(c,fx)=>{ const S=G(); if(c===S.me&&S.u.tac&&S.u.famH!==undefined) V10.famCheck(); return _su(c,fx); };
// товарищеские матчи дополнительно поднимают сыгранность
const _pf=N.playFix; N.playFix=(f,m)=>{ _pf(f,m); const S=G(); if(f.u&&f.c==='FR'&&S.u.fam){ S.u.fam.tac=Math.min(100,S.u.fam.tac+2); S.u.fam.sp=Math.min(100,S.u.fam.sp+1); } };
// ===================== 3. Настройки, влияющие на игру =====================
V10.opt=()=>{ const S=G(); return (S&&S.u.opt)||{diff:1,inj:1,fat:1,wx:1}; };
const _mo=N.matchOpts; N.matchOpts=(f,auto)=>{ const o=_mo(f,auto); const S=G(); if(!S) return o; const me=f.h===S.me||f.a===S.me; const op=V10.opt();
 if(me){ o.injK=[0.5,1,1.8][op.inj??1]; if(!op.fat) o.fatK=0.45; if(!op.wx) o.wx='clear'; o.diff=op.diff??1; } return o; };
// сложность: сила ИИ против нас, финансы, терпение федерации
const MP=N.Match.prototype; const _calc=MP.calc; MP.calc=function(){ _calc.call(this); const df=this.o.diff; if(df===undefined||df===1) return; const k=df===0?1.05:0.96; for(const s of [0,1]) if(this.t[s].user&&this.str&&this.str[s]){ const x=this.str[s]; x.a*=k; x.d*=k; x.m*=k; } };
const _pr=N.prize; N.prize=(v)=>{ const df=V10.opt().diff??1; _pr(v>0?v*[1.25,1,0.8][df]:v); };
const _tr=N.trust; N.trust=(d)=>{ const df=V10.opt().diff??1; _tr(d<0?d*[0.7,1,1.3][df]:d); };
})();

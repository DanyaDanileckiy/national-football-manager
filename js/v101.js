// Update #10.1: кнопки «Авто» (состав, тактика, тренировка) с объяснениями; компактные сейвы
(function(){
const N=NFM; const G=()=>N.getS(); const V101=N.v101={};
const cl=(v,a,b)=>Math.max(a,Math.min(b,v)); const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0; const r0=v=>Math.round(v);
const nm=p=>p?(p.sn||p.n):'—'; const names=(ps,k=3)=>ps.slice(0,k).map(nm).join(', ')+(ps.length>k?' +'+(ps.length-k):'');
// ===================== 1. Сейвы: ранги ФИФА в компактном виде, старые логи матчей =====================
// очки рейтинга на каждую дату истории (для старых сейвов восстанавливаются по матчам)
V101.fillRkP=(S)=>{ const H=S.rkH||[]; if(!H.length||H.every(h=>h.p)) return; const pts={}; for(const c in S.T) pts[c]=S.T[c].pts||0;
 const fx=S.F.filter(f=>f.r&&f.r.fp).sort((a,b)=>a.d<b.d?1:-1); let j=0;
 for(let i=H.length-1;i>=0;i--){ const h=H[i]; while(j<fx.length&&fx[j].d>=h.d){ const f=fx[j]; if(pts[f.h]!=null) pts[f.h]-=f.r.fp[0]; if(pts[f.a]!=null) pts[f.a]-=f.r.fp[1]; j++; } if(!h.p) h.p=h.o.split(',').map(c=>Math.round(pts[c]||0)).join(','); } };
V101.DET=20;
V101.compact=(S)=>{ if(!S||!S.F) return; let k=0;
 for(let i=S.F.length-1;i>=0;i--){ const f=S.F[i]; if(!f.r) continue; if(f.vn){ if(f.r.att==null&&f.vn.att) f.r.att=f.vn.att; if(!f.r.wx&&f.vn.wx) f.r.wx=f.vn.wx; delete f.vn; }
  if(f.r.det&&f.u&&++k>V101.DET) delete f.r.det;
  if(f.r.det&&f.r.det.st) for(const x of f.r.det.st) if(x&&typeof x.xg==='number') x.xg=Math.round(x.xg*100)/100; }
 for(const p of Object.values(S.P)) if(p.rh&&p.rh.length>60&&p.t!==S.me) p.rh=p.rh.slice(-60);
 // турниры, завершённые больше года назад: бомбардиры и таблицы кэшируются, у старых матчей (кроме наших) убираются авторы голов
 for(const c of Object.values(S.C)){ if(c.stage!=='done'||!c.fin||c.kind==='fr'||c.age||c.quick||N.diffD(c.fin,S.d)<365) continue; if(!c.tsC){ c.tsC=N.topScorers(c.id).slice(0,10); if(Array.isArray(c.groups)&&!c.tblC){ c.tblC={}; for(const g of c.groups) if(g&&g.t) c.tblC[g.n]=N.table(c,g.n); } } }
 const lim=S.d.slice(0,4)-1+S.d.slice(4); for(const f of S.F){ if(f.u||!f.r||!f.r.sc||!f.r.sc.length||f.d>=lim) continue; const c=S.C[f.c]; if(c&&c.tsC) f.r.sc=[]; } };
const _mo=N.fn.month; N.fn.month=(e)=>{ _mo(e); V101.compact(G()); };
const _pr=N.prune; N.prune=()=>{ _pr(); V101.compact(G()); };
const _v6i=N.v6.init; N.v6.init=(S)=>{ _v6i(S); if(!S) return; if(!S.v101){ V101.fillRkP(S); V101.compact(S); S.v101=1; } };
// ===================== 2. Данные для автоподбора =====================
V101.next=()=>{ const S=G(); const f=S.F.filter(x=>!x.r&&!x.y&&(x.h===S.me||x.a===S.me)).sort((a,b)=>a.d<b.d?-1:1)[0]; if(!f) return null;
 const oc=f.h===S.me?f.a:f.h; const c=S.C[f.c]; const kind=c?c.kind:'fr'; const imp=kind==='fr'?0:(f.ko||kind==='final'||kind==='po')?2:1;
 return {f,oc,imp,days:Math.max(0,N.diffD(S.d,f.d)),home:!f.neu&&f.h===S.me,away:!f.neu&&f.a===S.me,cn:c?(c.sh||c.n):_t("товарищеский")}; };
V101.opp=(oc)=>{ const S=G(); const t=S.T[oc]; if(!t) return null; const ps=N.pool(oc).filter(p=>!p.inj&&!p.sus).sort((a,b)=>b.o-a.o).slice(0,23); const lu=N.autoLineup(ps,t.form&&N.FORMS[t.form]?t.form:'4-3-3'); const F=N.FORMS[lu.form];
 const fl=[],ce=[]; lu.xi.forEach((p,i)=>{ if(!p) return; const r=F[i][0]; if(r==='GK') return; const v=(p.att+p.spd+p.tec)/3; (['LB','RB','LM','RM','LW','RW'].includes(r)?fl:ce).push(v); });
 const xi=lu.xi.filter(Boolean); const star=xi.filter(p=>p.pos!=='GK').sort((a,b)=>(b.att+b.tec)-(a.att+a.tec))[0];
 return {fl:avg(fl),ce:avg(ce),elo:t.elo||1500,str:t.str||0,star,form:lu.form,n:t.n}; };
V101.me=()=>{ const S=G(); const call=S.u.call.map(id=>S.P[id]).filter(Boolean); const av=call.filter(p=>!p.inj&&!p.sus);
 const grp=g=>av.filter(p=>N.POS[p.pos][1]===g).sort((a,b)=>b.o-a.o); const out=av.filter(p=>p.pos!=='GK').sort((a,b)=>b.o-a.o).slice(0,16);
 const M=grp('M').slice(0,5), F=grp('F').slice(0,4), D=grp('D').slice(0,4);
 return {call,av,out:call.filter(p=>p.inj||p.sus),mTec:avg(M.map(p=>p.tec)),tec:avg(out.map(p=>p.tec)),fSpd:avg(F.map(p=>p.spd)),spd:avg(out.map(p=>p.spd)),dDef:avg(D.map(p=>p.def)),
  fit:avg(av.slice().sort((a,b)=>b.o-a.o).slice(0,14).map(p=>p.fit)),age:avg(call.map(p=>p.age)),elo:S.T[S.me].elo||1500,str:S.T[S.me].str||0}; };
// лучший состав: пары «позиция–игрок» по убыванию оценки (свежесть, травмы, важность матча)
V101.pickXI=(form,nx)=>{ const S=G(); const F=N.FORMS[form]; const av=S.u.call.map(id=>S.P[id]).filter(p=>p&&!p.inj&&!p.sus); const fr=nx&&nx.imp===0, big=nx&&nx.imp===2;
 const sc=(p,role)=>N.roleOvr(p,role)*(0.8+0.2*p.fit/100)-(p.fit<70?(big?2:5):0)+(fr&&p.age<=22?1.5:0);
 const pairs=[]; F.forEach(([role],i)=>{ for(const p of av){ if((role==='GK')!==(p.pos==='GK')&&N.compat(p.pos,role)<0.5) continue; pairs.push([sc(p,role),i,p]); } }); pairs.sort((a,b)=>b[0]-a[0]);
 const xi=new Array(11).fill(null), used=new Set(); for(const [v,i,p] of pairs){ if(xi[i]||used.has(p.id)) continue; xi[i]=p; used.add(p.id); }
 F.forEach(([role],i)=>{ if(xi[i]) return; const p=av.filter(q=>!used.has(q.id)).sort((a,b)=>N.roleOvr(b,role)-N.roleOvr(a,role))[0]; if(p){ xi[i]=p; used.add(p.id); } });
 const rest=av.filter(p=>!used.has(p.id)).sort((a,b)=>b.o-a.o); const bench=[]; const gk=rest.find(p=>p.pos==='GK'); if(gk) bench.push(gk); for(const p of rest){ if(bench.length>=12) break; if(!bench.includes(p)) bench.push(p); }
 const ovr=avg(xi.map((p,i)=>p?N.roleOvr(p,F[i][0]):30)); return {form,xi,bench,ovr}; };
V101.setXI=(lu)=>{ const S=G(); S.u.xi={form:lu.form,s:lu.xi.map(p=>p?p.id:null),b:S.u.call.filter(id=>!lu.xi.some(p=>p&&p.id===id))};
 const ord=lu.bench.map(p=>p.id); S.u.xi.b.sort((a,b)=>{ const x=ord.indexOf(a), y=ord.indexOf(b); return (x<0?99:x)-(y<0?99:y); }); };
// ===================== 3. «Авто»: состав =====================
V101.autoSquad=(withCall)=>{ const S=G(), u=S.u; const why=[]; if(withCall){ N.autoCall(); why.push(_t("Вызваны {0} лучших доступных игроков по уровню и форме: 3 вратаря и запас на каждую линию.",u.call.length)); }
 const nx=V101.next(); const form=(u.xi&&u.xi.form)||'4-3-3'; const lu=V101.pickXI(form,nx); V101.setXI(lu); const me=V101.me();
 const allOut=N.pool(S.me).filter(p=>p.inj||p.sus).sort((a,b)=>b.o-a.o).slice(0,6);
 if(allOut.length) why.push(_t("Травмированные и дисквалифицированные не играют: {0}.",names(allOut)));
 const inXI=new Set(lu.xi.filter(Boolean).map(p=>p.id)); const pure=N.autoLineup(me.av.map(p=>Object.assign(Object.create(p),{fit:100})),form).xi.filter(Boolean);
 const tired=pure.filter(p=>!inXI.has(p.id)&&p.fit<85).map(p=>Object.getPrototypeOf(p));
 if(tired.length) why.push(_t("{0} начнут на скамейке: свежесть всего {1}% — уставший игрок слабее и чаще травмируется.",names(tired,2),r0(Math.min(...tired.map(p=>p.fit)))));
 if(nx&&nx.imp===0){ const yg=lu.xi.filter(p=>p&&p.age<=22); if(yg.length) why.push(_t("Товарищеский матч — шанс для молодых: {0}.",names(yg,2))); }
 else if(nx&&nx.imp===2) why.push(_t("Матч на вылет ({0}) — выходят сильнейшие, даже если немного устали.",nx.cn));
 const key=lu.xi.filter(Boolean).sort((a,b)=>b.o-a.o).slice(0,2); if(why.length<4&&key.length===2) why.push(_t("Лидеры в старте: {0} ({1}) и {2} ({3}).",nm(key[0]),key[0].o,nm(key[1]),key[1].o));
 if(why.length<4) why.push(_t("Средний рейтинг стартового состава на своих позициях — {0}. В запасе {1} игроков, среди них вратарь.",r0(lu.ovr),lu.bench.length));
 return why.slice(0,4); };
// ===================== 4. «Авто»: тактика =====================
const WIDE=['4-2-3-1','4-1-4-1','4-5-1','5-3-2','5-4-1','3-5-2'], TECH=['4-2-3-1','4-3-3 F9','4-1-2-1-2','3-4-2-1'], DEFF=['5-4-1','5-3-2','4-5-1','4-1-4-1'], ATTF=['4-3-3','3-4-3','4-3-3 F9','4-2-3-1'], CNT=['4-4-1-1','4-4-2','4-3-3'];
V101.autoTac=()=>{ const S=G(), u=S.u; N.v10.migrateTac(u); const nx=V101.next(); const me=V101.me(); const op=nx&&V101.opp(nx.oc);
 const d=op?(me.elo-op.elo+(nx.home?60:nx.away?-60:0)):0; const tech=me.mTec>=me.tec+3||me.mTec>=76; const fast=me.fSpd>=me.spd+3||me.fSpd>=80; const flank=!!op&&op.fl-op.ce>=3; const tired=me.fit<85;
 let best=null; for(const f of Object.keys(N.FORMS)){ const lu=V101.pickXI(f,nx); const tags=[]; let b=0;
  if(flank&&WIDE.includes(f)){ b+=1.2; tags.push('fl'); } if(tech&&TECH.includes(f)){ b+=1; tags.push('tec'); } if(d<-150&&DEFF.includes(f)){ b+=1.5; tags.push('def'); } if(d>150&&ATTF.includes(f)){ b+=1; tags.push('att'); } if(fast&&d<0&&CNT.includes(f)){ b+=0.8; tags.push('cnt'); } if(u.xi&&u.xi.form===f) b+=0.4;
  const v=lu.ovr+b; if(!best||v>best.v) best={v,lu,tags}; }
 const lu=best.lu, f=lu.form, tg=best.tags; V101.setXI(lu); const why=[];
 if(tg.includes('fl')&&tg.includes('tec')) why.push(_t("{0}, потому что у соперника сильные фланги, а ваши полузащитники техничные (техника {1}).",f,r0(me.mTec)));
 else if(tg.includes('fl')) why.push(_t("{0}, потому что у соперника сильные фланги — схема с крайними полузащитниками прикрывает края.",f));
 else if(tg.includes('tec')) why.push(_t("{0}, потому что ваши полузащитники техничные (техника {1}) — схема даёт им мяч в центре.",f,r0(me.mTec)));
 else if(tg.includes('def')) why.push(_t("{0} — плотная схема с пятью-шестью игроками обороны против сильного соперника.",f));
 else if(tg.includes('cnt')) why.push(_t("{0} — у ваших нападающих хорошая скорость ({1}), схема подходит для быстрых атак.",f,r0(me.fSpd)));
 else why.push(_t("{0} — в этой схеме ваш состав сильнее всего (рейтинг {1}).",f,r0(lu.ovr)));
 const t=u.tac; Object.assign(t,{ment:0,line:1,press:1,width:1,tempo:1,pass:1,style:'mix',trap:0,waste:0,tackle:1,focus:'m'}); t.preset=null;
 const ss=op?[r0(me.str),r0(op.str)]:[0,0];
 if(!op) why.push(_t("Ближайшего матча нет — сбалансированные установки."));
 else if(d>200){ Object.assign(t,{ment:1,line:2,press:2,style:tech?'poss':'mix',pass:tech?0:1}); why.push(_t("Вы заметно сильнее ({0} против {1} у соперника) — атакуем, высокая линия и прессинг.",ss[0],ss[1])); }
 else if(d>80){ Object.assign(t,{ment:1,press:1,style:tech?'poss':'mix'}); why.push(_t("Вы немного сильнее ({0} против {1}) — смелый настрой, но без риска.",ss[0],ss[1])); }
 else if(d<-200){ Object.assign(t,{ment:-1,line:0,press:0,width:0,style:'counter',tempo:fast?2:1,pass:2,focus:'c'}); why.push(_t("Соперник заметно сильнее ({0} против {1}) — играем от обороны и ловим его на контратаках.",ss[1],ss[0])); }
 else if(d<-80){ Object.assign(t,{ment:0,line:0,style:'counter',tempo:fast?2:1,pass:fast?2:1}); why.push(_t("Соперник чуть сильнее ({0} против {1}) — низкая линия и быстрые атаки в свободные зоны.",ss[1],ss[0])); }
 else { if(fast) Object.assign(t,{tempo:2,pass:2}); why.push(_t("Силы примерно равны ({0} и {1}) — сбалансированные установки.",ss[0],ss[1])); }
 if(flank){ t.width=Math.min(t.width,1); if(t.focus==='w') t.focus='m'; }
 if(tired){ t.press=Math.min(t.press,1); t.tempo=Math.min(t.tempo,1); why.push(_t("Игроки устали (средняя свежесть {0}%) — без изматывающего прессинга и сверхбыстрого темпа.",r0(me.fit))); }
 if(nx&&nx.imp===2){ t.waste=1; t.tackle=1; why.push(_t("Матч на вылет ({0}) — аккуратный отбор и затягивание времени при счёте в нашу пользу.",nx.cn)); }
 t.opp=t.opp||{}; t.opp.mark=0; if(op&&op.star&&op.star.att>=me.dDef+4){ t.opp.mark=op.star.id; why.push(_t("Плотная опека {0}: это лучший атакующий игрок соперника (атака {1}).",nm(op.star),op.star.att)); }
 t.roles={}; const F=N.FORMS[f], FR=N.FORMR[f]||{}; let gain=null; F.forEach(([role],i)=>{ const p=lu.xi[i]; if(!p) return; const def=FR[i]||N.ROLEDEF[role]; const d0=N.roleSuit(p,def); let bk=def,bv=d0; for(const k of N.ROLEOPT[role]||[]){ const v=N.roleSuit(p,k); if(v>bv){bv=v;bk=k;} } if(bk!==def&&bv>=d0+3){ t.roles[i]=bk; if(!gain||bv-d0>gain[2]) gain=[p,bk,bv-d0,bv]; } });
 if(gain&&why.length<4) why.push(_t("Роли подобраны под игроков: например, {0} — «{1}» (подходит на {2}%).",nm(gain[0]),(N.v10.RN||{})[gain[1]]||gain[1],gain[3]));
 return why.slice(0,4); };
// ===================== 5. «Авто»: тренировка =====================
V101.autoTrain=()=>{ const S=G(), u=S.u, t=u.tr2; t.auto=0; N.v6.autoPlan(); const call=u.call.map(id=>S.P[id]).filter(Boolean); const nx=V101.next(); const why=[];
 const tiredN=call.filter(p=>p.fit<80).length; const big=nx&&nx.imp>0, soon=nx&&nx.days<=6;
 const av=k=>avg(call.filter(p=>p.pos!=='GK').map(p=>p[k]));
 if(tiredN>=5) why.push(_t("{0} игроков устали (свежесть ниже 80%) — лёгкая нагрузка, полузащита восстанавливается.",tiredN));
 else if(t.i===2) why.push(_t("Молодой состав (средний возраст {0}) выдержит высокую нагрузку — так игроки растут быстрее.",(+avg(call.map(p=>p.age))).toFixed(1)));
 else if(soon&&big) why.push(_t("До важного матча ({0}) {1} дн. — нормальная нагрузка, чтобы не рисковать травмами.",nx.cn,nx.days));
 else why.push(_t("Нормальная нагрузка: прогресс без лишнего риска травм."));
 if(t.g.M==='tac') why.push(_t("Сыгранность схемы всего {0}% — полузащитники отрабатывают тактику.",u.fam.tac));
 else if(t.g.M==='sp') why.push(_t("Скоро важный матч, а стандарты отработаны на {0}% — полузащита тренирует стандарты.",u.fam.sp));
 if(t.g.D==='def') why.push(_t("Оборона слабее атаки ({0} против {1}) — защитники тренируют игру в обороне.",r0(av('def')),r0(av('att'))));
 const rest=call.filter(p=>p.fit<75); for(const p of rest) t.pl[p.id]='rest';
 const yg=call.filter(p=>p.age<=21&&p.pot-p.o>=6&&p.fit>=75).sort((a,b)=>(b.pot-b.o)-(a.pot-a.o)).slice(0,3);
 for(const p of yg){ const g=N.POS[p.pos][1]; t.pl[p.id]=g==='G'?'gk':g==='D'?'def':g==='F'?'att':(p.tec<p.att?'tac':'att'); }
 if(rest.length) why.push(_t("Индивидуальный отдых: {0} — свежесть ниже 75%.",names(rest,3)));
 if(yg.length) why.push(_t("Молодые таланты с большим потенциалом ({0}) получают индивидуальный план развития.",names(yg,3)));
 if(why.length<2) why.push(_t("Нападающие работают над атакой, вратари — над своей игрой."));
 return why.slice(0,4); };
})();

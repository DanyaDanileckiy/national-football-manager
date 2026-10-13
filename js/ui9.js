// Интерфейс обновления 9: дерби, личные встречи, карьера, достижения, сценарии, подсказки для новичков
(function(){ const N=NFM, X=window.UIX, V9=N.v9; const {SCR,st,top,V,modal,closeM,toast,ask,esc,ic,tf,go,save,refresh,PREF,savePref}=X;
const S=()=>X.getS(); const T=c=>S().T[c]; const UI=window.UI; const I=NFM_I18N;
const tn=c=>`${tf(c)} ${esc(T(c).n)}`; const nm=c=>c&&T(c)?T(c).n:'';
const tabs=(key,list,def)=>{ const cur=st.tab[key]||def; return [cur,`<div class="tabs">${list.map(([k,n])=>`<div class="tab ${cur===k?'on':''}" onclick="UI.st.tab['${key}']='${k}';UI.refresh()">${n}</div>`).join('')}</div>`]; };
const flames=l=>`<span class="flm" aria-label="${l}/3">${'🔥'.repeat(l)}<span class="dim">${'🔥'.repeat(3-l)}</span></span>`;
const pct=(a,b)=>b?Math.round(100*a/b):0;
// ---------- дерби: подписи и заголовки ----------
const lvlTxt=l=>l>=3?_t("Великое дерби"):l===2?_t("Дерби"):_t("Соперничество");
function hlText(h){ const a=h.a||[];
 if(h.k==='nw') return {t:_t("Рождение соперничества"),s:_t("{1} и {2} встретились в плей-офф уже в {0}-й раз",a[0],nm(a[1]),nm(a[2]))};
 if(h.k==='pre') return {t:`«${V9.RNAME[a[0]]||''}»`,s:_t("Скоро матч: {0} — {1}. Страна в ожидании",nm(a[1]),nm(a[2]))};
 const t=`«${V9.RNAME[a[4]]||''}»: ${nm(a[1])} — ${nm(a[2])} ${a[3]}${a[5]?` (${_t("пен.")} ${a[5]})`:''}`;
 return {t,s:h.k==='rw'?_t("Разгром! Победитель дерби: {0}",nm(a[0])):h.k==='w'?_t("Победитель дерби: {0}",nm(a[0])):_t("Ничья в дерби: никто не уступил")}; }
function derbyCard(a,b,f){ const r=V9.rival(a,b); if(!r) return ''; const o=V9.h2h(a,b); const me=S().me; const opp=a===me?b:a;
 return `<div class="card derby"><div class="dhd"><span class="chip r">${ic('zap')} ${lvlTxt(r.l)}</span>${flames(r.l)}</div><div class="dnm">«${esc(V9.rivName(r))}»</div>
 <div class="sm">${r.l>=3?_t("Вся страна смотрит этот матч. Победа поднимет доверие и мораль, поражение ударит больнее обычного."):_t("Особый матч: колебания доверия и морали сильнее, домашние трибуны поддерживают громче.")}</div>
 ${o.p?`<div class="h2hbar">${bar(o)}</div><div class="sm mut ctr">${_t("Матчи в игре: {0} · {1}–{2}–{3} (В–Н–П)",o.p,o.w,o.d,o.l)}</div>`:''}
 <div style="height:8px"></div><button class="btn w sm" onclick="UI.go('h2h','${opp}')">${ic('history')} ${_t("Личные встречи")}</button></div>`; }
function bar(o){ const t=o.w+o.d+o.l||1; return `<i class="w" style="width:${100*o.w/t}%"></i><i class="d" style="width:${100*o.d/t}%"></i><i class="l" style="width:${100*o.l/t}%"></i>`; }
// предматчевый экран: карточка дерби + ссылка на личные встречи
const _pre=SCR.prematch; SCR.prematch=(fid)=>{ _pre(fid); const s=S(); if(!s) return; const f=s.F.find(x=>x.id===fid); if(!f||f.r||st.cur!=='prematch') return; const opp=f.h===s.me?f.a:f.h;
 const first=V().querySelector('.card'); const r=V9.rival(f.h,f.a);
 if(first){ if(r) first.insertAdjacentHTML('afterend',derbyCard(s.me,opp,f)); else first.insertAdjacentHTML('beforeend',`<div class="ctr" style="margin-top:8px"><button class="btn sm gh" onclick="UI.go('h2h','${opp}')">${ic('history')} ${_t("Личные встречи")}</button> <button class="btn sm gh" onclick="UI.go('team','${opp}')">${ic('flag')} ${_t("Профиль команды")}</button></div>`); }
 if(r){ const u=s.u; u.hlPre=u.hlPre||[]; if(!u.hlPre.includes(f.id)){ u.hlPre.push(f.id); if(u.hlPre.length>30) u.hlPre.shift(); V9.hl('pre',[r.n,f.h,f.a]); }
  const vs=V().querySelector('.vs'); if(vs) vs.insertAdjacentHTML('beforebegin',`<div class="dlab">${ic('zap')} ${esc(V9.rivName(r))}</div>`); } tipsFor('prematch'); };
// итоги матча: плашка дерби
const _post=SCR.post; SCR.post=()=>{ _post(); const m=st.m; if(!m) return; const f=m.f; const r=V9.rival(f.h,f.a); if(!r) return; const s=S(); const h=(s.u.hl||[])[0];
 const won=f.r.w?f.r.w===s.me:(f.h===s.me?f.r.hg>f.r.ag:f.r.ag>f.r.hg); const draw=!f.r.w&&f.r.hg===f.r.ag;
 const html=`<div class="card derby ctr"><div class="dnm">«${esc(V9.rivName(r))}»</div><div class="b ${won?'grn':draw?'gold':'red'}">${won?_t("Дерби за нами! Страна ликует."):draw?_t("Ничья в дерби — болельщики ждали большего."):_t("Проигранное дерби — критика будет жёсткой.")}</div>${h&&h.u&&h.dt!=null?`<div class="sm mut">${_t("Доверие федерации")}: ${h.dt>=0?'+':''}${h.dt}</div>`:''}<button class="btn sm gh" style="margin-top:6px" onclick="UI.v9h2hM('${f.h===s.me?f.a:f.h}')">${ic('history')} ${_t("Личные встречи")}</button></div>`;
 const c=V().querySelector('.sb'); if(c) c.insertAdjacentHTML('afterend',html); };
// ---------- личные встречи ----------
function h2hHTML(a,b){ const s=S(); const o=V9.h2h(a,b); const r=V9.rival(a,b); const ar=o.arch;
 const fm=x=>`<div class="mt"><div class="xs mut">${N.fmtD(x[0],1)}${x[5]?' · '+esc(x[5]):''}</div><div class="mtr"><span class="ell right ${x[1]===a?'b':''}">${esc(nm(x[1]))} ${tf(x[1])}</span><b class="scx2">${x[3]}:${x[4]}${x[6]?`<small>${_t("пен.")} ${x[6]}</small>`:''}</b><span class="ell ${x[2]===a?'b':''}">${tf(x[2])} ${esc(nm(x[2]))}</span></div></div>`;
 const big=(z,lab,cls)=>z?`<div class="sm ${cls}" style="margin-top:8px">${lab}</div>${fm(z[3])}`:'';
 return `<div class="card nm"><div class="vs"><div><div class="flag">${T(a).f}</div><div class="tn">${esc(nm(a))}</div></div><div class="ctr">${r?`<div class="chip r">${lvlTxt(r.l)}</div><div>${flames(r.l)}</div>`:'<div class="b" style="font-size:22px">VS</div>'}</div><div><div class="flag">${T(b).f}</div><div class="tn">${esc(nm(b))}</div></div></div>${r?`<div class="ctr dnm">«${esc(V9.rivName(r))}»</div>`:''}</div>
 <div class="card"><h3>${_t("В игре")}</h3>${o.p?`<div class="h2hn"><div><b class="grn">${o.w}</b><span>${_t("Победы")}</span></div><div><b class="gold">${o.d}</b><span>${_t("Ничьи")}</span></div><div><b class="red">${o.l}</b><span>${_t("Поражения")}</span></div><div><b>${o.gf}:${o.ga}</b><span>${_t("Мячи")}</span></div></div><div class="h2hbar">${bar(o)}</div>
  ${big(o.big,_t("Крупнейшая победа"),'grn')}${big(o.bigL,_t("Крупнейшее поражение"),'red')}`:`<div class="mut sm">${_t("Команды ещё не встречались в этой игре.")}</div>`}
  ${ar&&(ar.w+ar.d+ar.l)?`<div class="sm mut" style="margin-top:8px">${_t("Архив до 2026 (сгенерирован)")}: ${ar.w+ar.d+ar.l} · ${ar.w}–${ar.d}–${ar.l} · ${ar.gf}:${ar.ga}</div>`:''}</div>
 ${o.p?`<div class="card"><h3>${_t("Последние встречи")}</h3>${o.last.map(fm).join('')}</div>`:''}`; }
SCR.h2h=(opp)=>{ const s=S(); top(_t("Личные встречи")); let a=s.me,b=opp; if(String(opp).includes('-')) [a,b]=opp.split('-'); if(!T(b)) return UI.home(); V().innerHTML=h2hHTML(a,b)+`<div class="grid2"><button class="btn" onclick="UI.go('team','${b}')">${ic('flag')} ${_t("Профиль команды")}</button><button class="btn" onclick="UI.go('rivals')">${ic('zap')} ${_t("Дерби и соперники")}</button></div>`; tipsFor('h2h'); };
function h2hM(opp){ modal(`<h2>${_t("Личные встречи")}</h2>${h2hHTML(S().me,opp)}<button class="btn gh w" onclick="UI.closeM()">${_t("Закрыть")}</button>`); }
// ---------- профиль команды ----------
SCR.team=(c)=>{ const s=S(); const t=T(c); if(!t) return UI.home(); top(esc(t.n)); const rv=V9.rivalsOf(c); const o=V9.h2h(s.me,c);
 V().innerHTML=`<div class="card ctr nm"><div style="font-size:56px;line-height:1">${t.f}</div><h2 style="margin:6px 0 2px">${esc(t.n)}</h2><div>${X.stars(t)}</div><div class="kpis" style="justify-content:center;margin-top:8px"><span class="chip">${_t("Рейтинг ФИФА")}: <b>#${N.fifaRank(c)||'—'}</b></span><span class="chip">${_t("Эло {0}",t.elo)}</span><span class="chip">${esc(N.CONFS[t.conf]||t.conf)}</span></div></div>
 ${c!==s.me?`<div class="card"><h3>${ic('history')} ${_t("Личные встречи")}</h3>${o.p?`<div class="h2hbar">${bar(o)}</div><div class="sm ctr">${o.w}–${o.d}–${o.l} · ${o.gf}:${o.ga}</div>`:`<div class="sm mut">${_t("Команды ещё не встречались в этой игре.")}</div>`}<div style="height:8px"></div><button class="btn w" onclick="UI.go('h2h','${c}')">${_t("Подробнее")}</button></div>`:''}
 <div class="card"><h3>${ic('zap')} ${_t("Соперники")}</h3>${rv.length?rv.map(x=>`<div class="row c" onclick="UI.go('h2h','${c}-${x.c}')">${tf(x.c)}<div class="f1"><div class="b ell">${esc(nm(x.c))}</div><div class="xs mut ell">«${esc(V9.rivName(x))}»${x.dyn?' · '+_t("новое"):''}</div></div>${flames(x.l)}</div>`).join(''):`<div class="sm mut">${_t("Явных соперников нет — соперничества рождаются в плей-офф.")}</div>`}</div>`; };
SCR.rivals=()=>{ const s=S(); top(_t("Дерби и соперники")); const rv=V9.rivalsOf(s.me); const hl=s.u.hl||[];
 V().innerHTML=`<div class="card"><h3>${ic('zap')} ${_t("Соперники сборной {0}",esc(nm(s.me)))}</h3>${rv.length?rv.map(x=>{ const o=V9.h2h(s.me,x.c); return `<div class="row c" onclick="UI.go('h2h','${x.c}')">${tf(x.c)}<div class="f1"><div class="b ell">${esc(nm(x.c))}</div><div class="xs mut ell">«${esc(V9.rivName(x))}» · ${o.w}–${o.d}–${o.l}</div></div>${flames(x.l)}</div>`; }).join(''):`<div class="sm mut">${_t("Явных соперников нет — соперничества рождаются в плей-офф.")}</div>`}</div>
 <div class="card"><h3>${ic('newspaper')} ${_t("Заголовки")}</h3>${hl.slice(0,8).map(hlRow).join('')||`<div class="sm mut">${_t("Пока тихо.")}</div>`}</div>`; };
function hlRow(h){ const x=hlText(h); return `<div class="hl"><div class="xs mut">${N.fmtD(h.d,1)}${h.u?` · <b class="gold">${_t("ваш матч")}</b>`:''}</div><div class="b">${esc(x.t)}</div><div class="sm">${esc(x.s)}</div></div>`; }
// новости: вкладка «Пресса»
const _news=SCR.news; SCR.news=()=>{ const s=S(); const isP=st.tab.nw7==='p'; if(isP) st.tab.nw7='w'; _news(); if(isP) st.tab.nw7='p'; const tb=V().querySelector('.tabs'); if(!tb) return;
 tb.insertAdjacentHTML('beforeend',`<div class="tab ${isP?'on':''}" onclick="UI.st.tab.nw7='p';UI.refresh()">${_t("Пресса")}${s.u.hlU?` <b class="gold">•</b>`:''}</div>`); if(isP){ tb.querySelectorAll('.tab').forEach((e,i,a)=>{ if(i<a.length-1) e.classList.remove('on'); });
  while(tb.nextSibling) tb.nextSibling.remove(); s.u.hlU=0; tb.insertAdjacentHTML('afterend',`<div class="card">${(s.u.hl||[]).map(hlRow).join('')||`<div class="sm mut">${_t("Пока тихо.")}</div>`}</div>`); } };
// ---------- хаб: плитки и баннеры ----------
const _hub=SCR.hub; SCR.hub=()=>{ const s=S(); if(s.u.scn&&s.u.scn.st!=='run'&&!s.u.scn.shown) return go('scnres',null,true); _hub();
 const tl=(i,t,fn,b)=>`<div class="tile" onclick="${fn}" tabindex="0" role="button"><span class="i">${ic(i)}</span>${t}${b?' <b class="gold">•</b>':''}</div>`;
 const html=tl('user-plus',_t("Карьера"),"UI.go('career')",s.u.car&&s.u.car.ren&&!s.u.car.ren.no&&s.u.car.ren.y)+tl('medal',_t("Достижения"),"UI.go('achs')")+tl('zap',_t("Дерби и соперники"),"UI.go('rivals')",s.u.hlU);
 const x=V().querySelector('.tiles.x6'); if(x) x.insertAdjacentHTML('beforeend',html); else V().insertAdjacentHTML('beforeend',`<div class="tiles x6">${html}</div>`);
 const sc=V9.scn(); const hero=V().querySelector('.hero');
 if(sc&&sc.st==='run'&&hero) hero.insertAdjacentHTML('afterend',`<div class="card scnb c" onclick="UI.go('scen','cur')"><span style="font-size:26px">${sc.ico}</span><div class="f1"><div class="xs mut">${_t("Сценарий")} · ${_t("до {0}",N.fmtD(sc.end,1))}</div><div class="b ell">${esc(sc.n)}</div></div>${ic('chevron-right')}</div>`);
 const nx=s.F.filter(f=>!f.r&&!f.y&&(f.h===s.me||f.a===s.me)).sort((a,b)=>a.d<b.d?-1:1)[0];
 if(nx&&hero){ const r=V9.rival(nx.h,nx.a); if(r){ const ht=hero.querySelector('.htop'); if(ht) ht.insertAdjacentHTML('afterend',`<div class="dlab">${ic('zap')} ${esc(V9.rivName(r))} ${flames(r.l)}</div>`); } }
 if(s.u.tips===undefined) setTimeout(()=>{ if(st.cur==='hub'&&s.u.tips===undefined) offerTips(); },400); else tipsFor('hub'); };
// ---------- карьера ----------
function repChart(rh){ if(!rh||rh.length<2) return `<div class="sm mut">${_t("График появится по ходу карьеры.")}</div>`; /* v10.1: общий интерактивный график */ return N.chart([{d:rh,c:'var(--gold,#f6c445)'}],{H:130,full:true,fmt:v=>String(Math.round(v)),ticks:[25,50,75]}); }
const repLab=r=>r>=80?_t("Легенда"):r>=65?_t("Звезда профессии"):r>=50?_t("Признанный специалист"):r>=35?_t("Крепкий профессионал"):r>=20?_t("Перспективный тренер"):_t("Новичок");
const why=w=>({fired:_t("уволен"),resign:_t("отставка"),end:_t("контракт истёк"),move:_t("перешёл")}[w]||'');
SCR.career=()=>{ const s=S(); const u=s.u; const car=u.car; top(_t("Карьера тренера")); const r=Math.round(car.rep); const hist=car.hist.map(V9.jobStats); const all=hist.reduce((a,h)=>({w:a.w+(h.w||0),d:a.d+(h.d||0),l:a.l+(h.l||0),gf:a.gf+(h.gf||0),ga:a.ga+(h.ga||0)}),{w:0,d:0,l:0,gf:0,ga:0}); const P=all.w+all.d+all.l;
 const bw=bestWin(s); const offers=u.mail.map((m,i)=>[m,i]).filter(([m])=>m.act&&m.act.type==='offer'&&!m.act.done);
 V().innerHTML=`<div class="card ctr nm"><div class="repn"><b>${r}</b><span>/100</span></div><div class="b gold">${repLab(r)}</div><div class="sm mut">${esc(s.coach)} · ${_t("максимум {0}",Math.round(car.repMax||r))}</div>${repChart(car.rh)}</div>
 ${V9.isOut()?`<div class="card ctr"><div class="b red">${_t("Без работы с {0}",N.fmtD(car.out.since,1))}</div><div style="height:8px"></div><button class="btn g w" onclick="UI.go('fired')">${_t("Предложения")}</button></div>`:
 `<div class="card"><h3>${ic('landmark')} ${_t("Текущий контракт")}</h3><div class="row">${tf(s.me)}<div class="f1 b">${esc(nm(s.me))}</div><span class="sm">${_t("до {0}",N.fmtD(car.cEnd,1))}</span></div><div class="sm mut">${_t("Доверие федерации")}: ${u.trust}% · ${_t("осталось {0} мес.",Math.max(0,Math.round(N.diffD(s.d,car.cEnd)/30.4)))}</div>
  ${car.ren&&!car.ren.no&&car.ren.y?`<div class="sm gold" style="margin-top:6px">${_t("Федерация предлагает продление на {0} г.",car.ren.y)}</div><div class="grid2" style="margin-top:6px"><button class="btn g" onclick="UI.v9renew(1)">${_t("Продлить")}</button><button class="btn" onclick="UI.v9renew(0)">${_t("Отказаться")}</button></div>`:car.ren&&car.ren.no?`<div class="sm red" style="margin-top:6px">${_t("Контракт не будет продлён.")}</div>`:''}
  ${offers.length?`<div style="height:8px"></div><div class="sm b">${_t("Предложения о работе")}</div>${offers.map(([m,i])=>`<div class="row c" onclick="UI.openMail(${i})">${tf(m.act.t)}<div class="f1 ell">${esc(nm(m.act.t))}</div>${X.stars(T(m.act.t))}</div>`).join('')}`:''}
  <div style="height:8px"></div><button class="btn r w sm" onclick="UI.v9resign()">${ic('log-out')} ${_t("Подать в отставку")}</button></div>`}
 <div class="card"><h3>${ic('chart-column')} ${_t("Рекорды")}</h3><div class="h2hn"><div><b>${P}</b><span>${_t("Матчи")}</span></div><div><b class="grn">${all.w}</b><span>${_t("Победы")}</span></div><div><b class="gold">${all.d}</b><span>${_t("Ничьи")}</span></div><div><b class="red">${all.l}</b><span>${_t("Поражения")}</span></div></div>
  <div class="sm">${_t("Процент побед")}: <b>${pct(all.w,P)}%</b> · ${_t("Мячи")}: <b>${all.gf}:${all.ga}</b> · ${_t("Победы в дерби")}: <b>${car.dw||0}</b>${bw?`<br>${_t("Крупнейшая победа")}: <b>${tf(bw[1])} ${bw[2]}:${bw[3]} ${tf(bw[4])}</b> (${N.fmtD(bw[0],1)})`:''}</div></div>
 <div class="card"><h3>${ic('history')} ${_t("История работы")}</h3>${hist.slice().reverse().map(h=>`<div class="row">${tf(h.c)}<div class="f1"><div class="b ell">${esc(nm(h.c))}</div><div class="xs mut">${h.from.slice(0,4)}–${h.to?h.to.slice(0,4):_t("н.в.")}${h.why?' · '+why(h.why):''}</div></div><div class="sm right">${h.old?'—':`${h.w}–${h.d}–${h.l}`}${h.tro?` · 🏆${h.tro}`:''}</div></div>`).join('')}</div>
 <div class="card"><h3>${ic('trophy')} ${_t("Трофеи")} (${u.tro.length})</h3>${u.tro.length?u.tro.slice().reverse().map(t=>`<div class="row sm">🏆<div class="f1">${esc(t.n)}</div>${t.t?tf(t.t):''}<span class="mut">${t.yr}</span></div>`).join(''):`<div class="sm mut">${_t("Трофеев пока нет.")}</div>`}</div>`; tipsFor('career'); };
function bestWin(s){ let b=null; for(const f of N.v6.userFix()){ if(!f.r) continue; const d=f.r.hg-f.r.ag; const hW=f.r.hg>f.r.ag; const who=hW?f.h:f.a; if(!s.u.car.hist.some(h=>h.c===who&&f.d>=h.from&&(!h.to||f.d<=h.to))) continue; const gd=Math.abs(d); if(gd&&(!b||gd>b[5])) b=[f.d,f.h,f.r.hg,f.r.ag,f.a,gd]; } return b; }
function resign(){ ask(_t("Подать в отставку? Вы покинете сборную и будете ждать предложений."),_t("Подать в отставку"),()=>{ V9.resign(); save(); go('fired',null,true); }); }
function renewB(y){ V9.renew(!!y); const m=S().u.mail.find(m=>m.act&&m.act.type==='renew'&&!m.act.done); if(m) m.act.done=1; save(); toast(y?_t("Контракт продлён"):_t("Вы отказались от продления")); refresh(); }
// ---------- без работы: предложения, ожидание, конец карьеры ----------
SCR.fired=()=>{ const s=S(); const car=s.u.car; top(_t("Без работы"),false); const out=car.out||{since:s.d,off:[],why:'fired'}; const off=(out.off||[]).filter(o=>T(o.c)); const mon=Math.floor(N.diffD(out.since,s.d)/30.4); const canEnd=mon>=12&&!off.length;
 const head={fired:[_t("Федерация отправила вас в отставку"),'📉'],resign:[_t("Вы подали в отставку"),'🚪'],end:[_t("Контракт истёк"),'📄']}[out.why]||[_t("Без работы"),'💼'];
 V().innerHTML=`<div class="card ctr"><div style="font-size:48px">${head[1]}</div><h2>${head[0]}</h2><div class="sm mut">${_t("Репутация")}: <b class="gold">${Math.round(car.rep)}</b> · ${_t("без работы {0} мес.",mon)}</div></div>
 <div class="card"><h3>${ic('mail')} ${_t("Предложения")}</h3>${off.length?off.map(o=>{ const t=T(o.c); return `<div class="row c" onclick="UI.v9take('${o.c}')">${tf(o.c)}<div class="f1"><div class="b ell">${esc(t.n)}</div><div class="xs mut">#${N.fifaRank(o.c)||'—'} · ${esc(N.CONFS[t.conf]||'')}</div></div>${X.stars(t)}${ic('chevron-right')}</div>`; }).join(''):`<div class="sm mut">${_t("Пока никто не звонит. Чем выше репутация, тем быстрее приходят предложения.")}</div>`}</div>
 <div class="card"><button class="btn g w big" onclick="UI.v9wait(1)">${ic('fast-forward')} ${_t("Ждать месяц")}</button><div style="height:8px"></div><button class="btn w" onclick="UI.v9wait(3)">${_t("Ждать 3 месяца")}</button><div style="height:8px"></div><button class="btn gh w" onclick="UI.go('career')">${ic('user-plus')} ${_t("Карьера тренера")}</button>
 <div style="height:8px"></div><button class="btn r w" ${canEnd?'':'disabled'} onclick="UI.v9over()">${_t("Завершить карьеру")}</button>${canEnd?'':`<div class="xs mut ctr" style="margin-top:4px">${_t("Доступно после 12 месяцев без предложений")}</div>`}</div>`; };
function take(c){ N.takeJob(c); save(); toast(_t("Вы возглавили {0}",X.tn(S().me))); X.home(); }
function wait(n){ const s=S(); const snap=V9.snap(); N.v6.busy(true,_t("Ожидание предложений…")); let k=0; const step=()=>{ const until=N.addD(s.d,30); N.v6.advance({autoUser:true,until,noStop:true}).then(()=>{ V9.restore(snap); V9.waitStep(); k++; const out=s.u.car.out; if(k<n&&out&&!(out.off||[]).length) return step(); N.v6.busy(false); save(); refresh(); if((out.off||[]).length) toast(`📬 ${_t("Новое предложение о работе!")}`); }).catch(e=>{ N.v6.busy(false); V9.restore(snap); toast(esc(e.message),'err'); }); }; step(); }
function over(){ ask(_t("Завершить тренерскую карьеру? Игра закончится."),_t("Завершить карьеру"),()=>{ const s=S(); s.u.car.over=s.d; save(); go('gameover',null,true); }); }
SCR.gameover=()=>{ const s=S(); const car=s.u.car; top(_t("Карьера завершена"),false); const hist=car.hist.map(V9.jobStats); const w=hist.reduce((a,h)=>a+(h.w||0),0), d=hist.reduce((a,h)=>a+(h.d||0),0), l=hist.reduce((a,h)=>a+(h.l||0),0);
 V().innerHTML=`<div class="card ctr nm"><div style="font-size:52px">🎖️</div><h2>${esc(s.coach)}</h2><div class="sm mut">${(car.hist[0]||{from:s.d}).from.slice(0,4)}–${s.d.slice(0,4)}</div><div class="h2hn" style="margin-top:10px"><div><b>${hist.length}</b><span>${_t("Сборные")}</span></div><div><b class="grn">${w}</b><span>${_t("Победы")}</span></div><div><b>${d}</b><span>${_t("Ничьи")}</span></div><div><b class="red">${l}</b><span>${_t("Поражения")}</span></div></div><div class="b gold">🏆 ${s.u.tro.length} · ${_t("Репутация")}: ${Math.round(car.repMax||car.rep)}</div></div>
 <button class="btn g w big" onclick="UI.go('title',null,true)">${ic('house')} ${_t("Главное меню")}</button>`; };
// предложения в почте: продление и отказ
const _om=UI.openMail; UI.openMail=(i)=>{ _om(i); const s=S(); const m=s.u.mail[i]; if(!m||!m.act) return; const box=document.querySelector('#modal .mbox');
 if(m.act.type==='offer'&&!m.act.done){ const b=[...box.querySelectorAll('button')].find(x=>/act\.done=1/.test(x.getAttribute('onclick')||'')); if(b) b.setAttribute('onclick','UI.v9dec('+i+')'); }
 if(m.act.type==='offer'&&V9.isOut()){ const b=[...box.querySelectorAll('button')].find(x=>/acceptJob/.test(x.getAttribute('onclick')||'')); if(b) b.setAttribute('onclick',`UI.S().u.mail[${i}].act.done=1;UI.closeM();UI.v9take('${m.act.t}')`); }
 if(m.act.type==='renew'&&!m.act.done&&s.u.car&&s.u.car.ren&&!s.u.car.ren.no){ const p=box.querySelector('p'); if(p) p.insertAdjacentHTML('afterend',`<button class="btn g w" onclick="UI.closeM();UI.v9renew(1)">${_t("Продлить")}</button><div style="height:6px"></div><button class="btn w" onclick="UI.closeM();UI.v9renew(0)">${_t("Отказаться")}</button>`); }
 if(m.act.type==='fired'&&V9.isOut()){ const b=[...box.querySelectorAll('button')].find(x=>/go\('fired'\)/.test(x.getAttribute('onclick')||'')); if(!b){ const p=box.querySelector('p'); if(p) p.insertAdjacentHTML('afterend',`<button class="btn g w" onclick="UI.closeM();UI.go('fired')">${_t("Предложения")}</button>`); } } };
function dec(i){ const m=S().u.mail[i]; m.act.done=1; V9.decline(); closeM(); save(); refresh(); }
// ---------- достижения ----------
N.onAch=(k)=>{ const a=V9.ACH.find(x=>x.k===k); if(!a||typeof document==='undefined') return; toast(`<div class="achT"><span class="ai">${a.ico}</span><div><div class="xs gold b">${_t("Достижение открыто")}</div><div class="b">${esc(a.n)}</div></div></div>`); };
SCR.achs=()=>{ const s=S(); top(_t("Достижения")); const g=V9.LS.get('nfm_ach',{}); const [cat,tb]=tabs('ach9',[['all',_t("Все")]].concat(V9.CATS),'all'); const L=V9.ACH.filter(a=>cat==='all'||a.cat===cat);
 const mine=s?Object.keys(s.u.ach).filter(k=>V9.ACH.some(a=>a.k===k)).length:0; const gl=Object.keys(g).filter(k=>V9.ACH.some(a=>a.k===k)).length;
 V().innerHTML=`<div class="card"><div class="h2hn"><div><b class="gold">${mine}/${V9.ACH.length}</b><span>${_t("В этой игре")}</span></div><div><b>${gl}/${V9.ACH.length}</b><span>${_t("Во всех сохранениях")}</span></div></div>${s&&s.cheat?`<div class="xs red ctr">${_t("Сейв с читами: достижения не засчитываются")}</div>`:''}</div>${tb}
 <div class="achg">${L.map(a=>{ const d=s&&s.u.ach[a.k]; const gg=g[a.k]; let pr=''; if(!d&&a.p&&s){ try{ const [c,m]=a.p(s); pr=`<div class="pbar"><i style="width:${Math.min(100,100*c/m)}%"></i></div><div class="xs mut">${Math.min(c,m)}/${m}</div>`; }catch(e){} }
  return `<div class="achc ${d?'on':gg?'gl':''}"><div class="ai">${a.ico}</div><div class="f1" style="min-width:0"><div class="b">${esc(a.n)}</div><div class="xs mut">${esc(a.d)}</div>${d?`<div class="xs grn">✓ ${N.fmtD(d,1)}</div>`:gg?`<div class="xs mut">${_t("Открыто в другой игре")}</div>`:''}${pr}</div></div>`; }).join('')}</div>`; tipsFor('achs'); };
// ---------- сценарии ----------
const diffT=d=>'★'.repeat(d)+'<span class="dim">'+'★'.repeat(5-d)+'</span>';
function goalTxt(sc){ const g=sc.goal; return g.w?_t("Цель: выиграть турнир"):g.q?_t("Цель: выйти в финальный турнир"):g.rk?_t("Цель: первое место в рейтинге ФИФА"):_t("Цель: стадия «{0}» или выше",N.lvlNames?N.lvlNames[g.n]:''); }
SCR.scen=(arg)=>{ const s=S(); top(_t("Сценарии")); const won=V9.LS.get('nfm_scn',{});
 if(arg==='cur'&&s&&V9.scn()){ const sc=V9.scn(); V().innerHTML=`<div class="card ctr nm"><div style="font-size:48px">${sc.ico}</div><h2>${esc(sc.n)}</h2><p>${esc(sc.d)}</p><div class="chip">${goalTxt(sc)}</div><div class="sm mut" style="margin-top:8px">${_t("Срок: до {0}",N.fmtD(sc.end))} · ${_t("осталось {0} мес.",Math.max(0,Math.round(N.diffD(s.d,sc.end)/30.4)))}</div><div class="sm b ${sc.st==='won'?'grn':sc.st==='lost'?'red':'gold'}" style="margin-top:6px">${sc.st==='won'?_t("Выполнен"):sc.st==='lost'?_t("Провален"):_t("В процессе")}</div></div>`; return; }
 V().innerHTML=`<div class="card nm"><div class="sm mut">${_t("Готовые старты с целью и сроком. Выполните цель — получите результат и достижение; карьера продолжится в любом случае.")}</div></div>${V9.SCN.map(sc=>{ const t=N.TEAMS.find(x=>x.c===sc.t); return `<div class="card scnc c" onclick="UI.v9scn('${sc.id}')"><div class="row" style="border:0;padding:0"><span style="font-size:30px">${sc.ico}</span><div class="f1" style="min-width:0"><div class="b">${esc(sc.n)}</div><div class="xs mut">${t?t.f+' '+esc(t.n):''} · ${_t("до {0}",sc.end.slice(0,4))}${won[sc.id]?' · <b class="grn">✓</b>':''}</div></div><span class="xs gold">${diffT(sc.diff)}</span></div><div class="sm" style="margin-top:6px">${esc(sc.d)}</div></div>`; }).join('')}`; };
function scnPick(id){ const sc=V9.SCN.find(x=>x.id===id); const t=N.TEAMS.find(x=>x.c===sc.t); if(!t) return;
 modal(`<div class="ctr"><div style="font-size:52px">${sc.ico}</div><h2 style="margin:4px 0">${esc(sc.n)}</h2><div>${t.f} <b>${esc(t.n)}</b></div><p class="sm">${esc(sc.d)}</p><div class="chip">${goalTxt(sc)}</div><div class="sm mut" style="margin-top:6px">${_t("Срок: до {0}",N.fmtD(sc.end))} · ${_t("Сложность")}: <span class="gold">${diffT(sc.diff)}</span></div></div>
 <div style="height:10px"></div><input type="text" id="scnN" placeholder="${_t("Имя тренера")}" value="${esc((st.ng&&st.ng.name)||PREF.coach||'')}"><div style="height:10px"></div><button class="btn g w big" onclick="UI.v9scnGo('${id}')">${ic('play')} ${_t("Начать сценарий")}</button><div style="height:6px"></div><button class="btn gh w" onclick="UI.closeM()">${_t("Назад")}</button>`); }
function scnGo(id){ const sc=V9.SCN.find(x=>x.id===id); const n=document.getElementById('scnN'); st.ng=st.ng||{}; st.ng.name=n?n.value:(st.ng.name||''); N._pendScn=id; UI.start(sc.t); }
SCR.scnres=()=>{ const s=S(); const sc=V9.scn(); if(!sc) return X.home(); s.u.scn.shown=1; save(); top(_t("Итог сценария"),false); const won=sc.st==='won'; const st0=sc.stat||s.u.stat;
 V().innerHTML=`<div class="card ctr nm scnr ${won?'won':'lost'}"><div style="font-size:60px">${won?'🏆':'⌛'}</div><div class="b ${won?'grn':'red'}" style="font-size:22px;font-family:var(--fd);text-transform:uppercase">${won?_t("Сценарий выполнен!"):_t("Сценарий провален")}</div><h2 style="margin:6px 0">${sc.ico} ${esc(sc.n)}</h2><div class="sm mut">${goalTxt(sc)}</div>${sc.left?`<div class="sm red">${_t("Вы покинули сборную до выполнения цели.")}</div>`:''}</div>
 <div class="card"><div class="h2hn"><div><b>${N.diffD(sc.from,sc.at||s.d)}</b><span>${_t("Дней")}</span></div><div><b class="grn">${st0.w}</b><span>${_t("Победы")}</span></div><div><b>${st0.d}</b><span>${_t("Ничьи")}</span></div><div><b class="red">${st0.l}</b><span>${_t("Поражения")}</span></div></div><div class="sm ctr">🏆 ${sc.tro??s.u.tro.length} · ${_t("Репутация")}: ${Math.round(s.u.car.rep)}</div></div>
 <button class="btn g w big" onclick="UI.home()">${_t("Продолжить карьеру")}</button><div style="height:8px"></div><button class="btn gh w" onclick="UI.toMenu()">${ic('house')} ${_t("Главное меню")}</button>`; };
// новая игра и титул: вход в сценарии
const _ng=SCR.newgame; SCR.newgame=()=>{ _ng(); if(st.ng&&!st.ng.conf){ const c=V().querySelector('.card'); if(c) c.insertAdjacentHTML('afterend',`<div class="card scnb c" onclick="UI.go('scen')"><span style="font-size:28px">🎬</span><div class="f1"><div class="b">${_t("Сценарии")}</div><div class="xs mut">${_t("{0} стартов с целью и сроком",V9.SCN.length)}</div></div>${ic('chevron-right')}</div>`); } };
const _title=SCR.title; SCR.title=()=>{ _title(); const g=V().querySelector('.grid2'); if(g) g.insertAdjacentHTML('afterend',`<div style="height:10px"></div><div class="grid2"><button class="btn gh" onclick="UI.go('scen')">🎬 ${_t("Сценарии")}</button><button class="btn gh" onclick="UI.go('achs')">${ic('medal')} ${_t("Достижения")}</button></div>`); };
// ---------- подсказки для новичков (coach marks) ----------
const isVis=e=>{ if(!e) return false; const r=e.getBoundingClientRect(); return r.width>0&&r.height>0&&getComputedStyle(e).visibility!=='hidden'; };
const pickVis=(sel)=>[...document.querySelectorAll(sel)].find(isVis);
const navSel=k=>`#bnav a[onclick="UI.nav('${k}')"], #side a[onclick="UI.nav('${k}')"]`;
const TIPS={
 hub:[['#cont',()=>_t("«Продолжить» двигает календарь до следующего события: международного окна, матча или жеребьёвки.")],
  [navSel('squad'),()=>_t("Состав: перед каждым окном вызовите 18–23 игрока. Для начала подойдёт автовызов.")],
  [navSel('tactics'),()=>_t("Тактика: выберите схему и установки. Нажмите на игроков на поле, чтобы поменять их местами.")],
  ['.meter',()=>_t("Доверие федерации. Победы его поднимают; если оно упадёт слишком низко — вас уволят.")],
  [`.tile[onclick="UI.go('rank')"]`,()=>_t("Рейтинг ФИФА определяет корзины жеребьёвок. Следите за движением своей сборной.")],
  [`.tile[onclick="UI.go('eco')"]`,()=>_t("Экономика: бюджет, спонсоры и стадионы. Долгий минус бьёт по доверию.")],
  [`.tile[onclick="UI.go('career')"]`,()=>_t("Карьера: репутация, контракт и предложения от других сборных.")],
  ['#bnav a:last-child, #side a[onclick="UI.nav(\'settings\')"]',()=>_t("Почта, тренировки и настройки — здесь. Подсказки можно повторить в настройках.")]],
 squad:[['[onclick="UI.autoCall()"], .tabs',()=>_t("Отмечайте игроков, чтобы вызвать их. Автовызов подберёт сильнейших здоровых игроков.")]],
 tactics:[['#pitch, .pitch',()=>_t("Нажмите на одного игрока, затем на другого — они поменяются местами. Повторное нажатие открывает индивидуальную установку.")]],
 prematch:[['.derby',()=>_t("Это дерби! Ставки выше обычного: доверие и мораль меняются сильнее, трибуны поддерживают громче.")],[`[onclick^="UI.startMatch"]`,()=>_t("Сыграйте матч в прямом эфире с заменами и тактикой — или быстро получите результат.")]],
 match:[[`[onclick="UI.tacM()"], [onclick="UI.pp()"]`,()=>_t("Во время матча можно поставить паузу, менять тактику и делать замены.")]],
 rank:[['.tabs',()=>_t("Движение в рейтинге, история команды, топ-10 и очки за каждый матч.")]],
 eco:[['.card',()=>_t("Доходы и расходы федерации по статьям. Здесь же — строительство и расширение стадионов.")]],
 settings:[['#tipsCard',()=>_t("Подсказки можно выключить или показать заново в любой момент.")]],
 career:[['.repn',()=>_t("Репутация растёт от результатов выше ожиданий и трофеев. От неё зависят предложения от других сборных.")]],
 achs:[['.tabs',()=>_t("Достижения хранятся в каждом сохранении и в общем зачёте на этом устройстве.")]]};
let cm=null;
function tipsFor(scr){ const s=S(); if(!s||!s.u.tips||!s.u.tips.on||cm) return; const L=TIPS[scr]; if(!L) return; const seen=s.u.tips.seen; const steps=L.map((x,i)=>[scr+i,x[0],x[1]]).filter(x=>!seen[x[0]]); if(!steps.length) return;
 setTimeout(()=>{ if(st.cur!==scr&&!(scr==='match'&&st.cur==='match')) return; const m=document.getElementById('modal'); if(m&&!m.classList.contains('hidden')) return; const ok=steps.filter(x=>pickVis(x[1])); if(!ok.length) return; showCM(ok,0,scr); },450); }
function showCM(steps,i,scr){ const s=S(); const [id,sel,txt]=steps[i]; const el=pickVis(sel); if(!el){ s.u.tips.seen[id]=1; return i+1<steps.length?showCM(steps,i+1,scr):endCM(); }
 if(scr==='match'&&st.m&&!st.m.paused&&UI.pp){ UI.pp(); cmPaused=1; }
 el.scrollIntoView({block:'center',behavior:'instant'}); if(!cm){ cm=document.createElement('div'); cm.id='cm'; document.body.appendChild(cm); }
 const r=el.getBoundingClientRect(); const pad=6; const vh=innerHeight, vw=innerWidth; const below=r.top+r.height/2<vh/2;
 const total=Object.keys(TIPS).reduce((a,k)=>a+TIPS[k].length,0), done=Object.keys(s.u.tips.seen).length;
 cm.innerHTML=`<div class="cmh" style="top:${r.top-pad}px;left:${r.left-pad}px;width:${r.width+2*pad}px;height:${r.height+2*pad}px"></div>
 <div class="cmb ${below?'dn':'up'}" role="dialog" style="${below?`top:${Math.min(vh-170,r.bottom+14)}px`:`bottom:${Math.min(vh-170,vh-r.top+14)}px`}"><div class="xs gold b">💡 ${_t("Подсказка")} ${i+1}/${steps.length}</div><div class="cmt">${txt()}</div>
 <div class="cmr"><button class="btn sm gh" onclick="UI.v9tip('off')">${_t("Отключить подсказки")}</button><span class="f1"></span><button class="btn sm gh" onclick="UI.v9tip('skip')">${_t("Пропустить")}</button><button class="btn sm g" onclick="UI.v9tip('next')">${i+1<steps.length?_t("Далее"):_t("Понятно")}</button></div><div class="cmp"><i style="width:${Math.min(100,100*(done+1)/total)}%"></i></div></div>`;
 cm.onclick=e=>{ if(e.target===cm) tipAct('next'); }; cm._st={steps,i,scr}; s.u.tips.seen[id]=1; }
let cmPaused=0;
new MutationObserver(()=>{ if(cm&&cm._st&&cm._st.scr!==st.cur&&!(cm._st.scr==='match')) endCM(); }).observe(document.getElementById('view'),{childList:true});
function endCM(){ if(cm){ cm.remove(); cm=null; } if(cmPaused&&st.m&&st.m.paused&&UI.pp){ UI.pp(); } cmPaused=0; save(); }
function tipAct(a){ const s=S(); if(!cm) return; const {steps,i,scr}=cm._st;
 if(a==='off'){ s.u.tips.on=0; endCM(); toast(_t("Подсказки отключены. Включить снова — в настройках.")); return; }
 if(a==='skip'){ for(const x of steps) s.u.tips.seen[x[0]]=1; return endCM(); }
 if(i+1<steps.length) return showCM(steps,i+1,scr); endCM(); }
function offerTips(){ const s=S(); modal(`<div class="ctr"><div style="font-size:44px">💡</div><h2>${_t("Подсказки для новичков")}</h2><p class="sm">${_t("В обновлении 9 появились пошаговые подсказки по основным экранам: вызов, тактика, матч, рейтинг, экономика и настройки. Включить их для этого сохранения?")}</p></div><div class="grid2"><button class="btn gh" onclick="UI.v9tips(0)">${_t("Не нужно")}</button><button class="btn g" onclick="UI.v9tips(1)">${_t("Включить")}</button></div>`); }
function tipsSet(on){ const s=S(); s.u.tips={on:on?1:0,seen:{},v:1}; closeM(); save(); if(on) tipsFor(st.cur); }
const wrapT=k=>{ const f=SCR[k]; if(!f) return; SCR[k]=(a)=>{ f(a); tipsFor(k); }; }; ['squad','tactics','rank','eco'].forEach(wrapT);
const _sm=UI.startMatch; UI.startMatch=(fid,q)=>{ _sm(fid,q); if(!q) setTimeout(()=>tipsFor('match'),900); };
window.addEventListener('resize',()=>{ if(cm&&cm._st){ const {steps,i,scr}=cm._st; showCM(steps,i,scr); } });
// настройки: подсказки и достижения
const _set=SCR.settings; SCR.settings=()=>{ _set(); const s=S(); if(!s) return; const v=V(); const t=s.u.tips||{on:0};
 const c=document.createElement('div'); c.className='card'; c.id='tipsCard'; c.innerHTML=`<h3>💡 ${_t("Подсказки для новичков")}</h3><label class="ck"><input type="checkbox" ${t.on?'checked':''} onchange="UI.v9tipOn(this.checked)"> ${_t("Показывать подсказки")}</label><div style="height:8px"></div><div class="grid2"><button class="btn sm" onclick="UI.v9tipReplay()">${ic('repeat')} ${_t("Показать заново")}</button><button class="btn sm" onclick="UI.go('achs')">${ic('medal')} ${_t("Достижения")}</button></div>`;
 const ref=v.children[1]||null; v.insertBefore(c,ref); tipsFor('settings'); };
function tipOn(on){ const s=S(); s.u.tips=s.u.tips||{seen:{},v:1}; s.u.tips.on=on?1:0; save(); }
function tipReplay(){ const s=S(); s.u.tips={on:1,seen:{},v:1}; save(); toast(_t("Подсказки снова включены")); X.home(); }
// «Назад» Android: закрыть подсказку
const _bk=UI.backKey; if(_bk) UI.backKey=()=>{ if(cm){ endCM(); return 'h'; } return _bk(); };
Object.assign(UI,{v9h2hM:h2hM,v9resign:resign,v9renew:renewB,v9take:take,v9wait:wait,v9over:over,v9dec:dec,v9scn:scnPick,v9scnGo:scnGo,v9tip:tipAct,v9tips:tipsSet,v9tipOn:tipOn,v9tipReplay:tipReplay});
})();

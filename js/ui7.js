// Интерфейс обновления 7
(function(){ const N=NFM, X=window.UIX, V7=N.v7; const {SCR,st,top,V,modal,closeM,toast,esc,ic,tf,go,save,refresh,num}=X;
const S=()=>X.getS(); const T=c=>S().T[c]; const UI=window.UI;
const tabs=(key,list,def)=>{ const cur=st.tab[key]||def; return [cur,`<div class="tabs">${list.map(([k,n])=>`<div class="tab ${cur===k?'on':''}" onclick="UI.st.tab['${k==null?'':key}']='${k}';UI.refresh()">${n}</div>`).join('')}</div>`]; };
const m2=v=>(Math.round(v*100)/100).toFixed(2);
const sg=v=>v==null?'—':'<bdi dir="ltr">'+(v>0?'+':'')+v+'</bdi>';
const cls=v=>v==null?'mut':v>0?'grn':v<0?'red':'mut';
const tn=c=>`${tf(c)} ${esc(T(c).n)}`;
// ===== хаб =====
const _hub=SCR.hub; SCR.hub=()=>{ _hub(); const s=S(); const tl=(i,t,fn,b)=>`<div class="tile" onclick="${fn}" tabindex="0" role="button"><span class="i">${ic(i)}</span>${t}${b?' <b class="gold">•</b>':''}</div>`;
 const x=V().querySelector('.tiles.x6'); const html=tl('newspaper',_t("Новости"),"UI.go('news')",s.u.dg&&s.u.dg.unread)+tl('chart-column',_t("Мировая статистика"),"UI.go('wstat')")+tl('shirt',_t("Экипировка"),"UI.go('kits')")+tl('sun',_t("Тренировочный сбор"),"UI.v7camp()");
 if(x) x.insertAdjacentHTML('beforeend',html); else V().insertAdjacentHTML('beforeend',`<div class="tiles x6">${html}</div>`); };
// ===== товарищеские матчи =====
function friendly(){ const s=S(); const ds=N.freeDates(); if(!ds.length) return toast(_t("Нет свободных дат в ближайших окнах"));
 const me=T(s.me); const opps=Object.values(s.T).filter(t=>t.c!==s.me).sort((a,b)=>Math.abs(a.elo-me.elo)-Math.abs(b.elo-me.elo)).slice(0,70).sort((a,b)=>b.elo-a.elo);
 modal(`<h2>${_t("Товарищеский матч")}</h2><div class="sm mut">${_t("Дата (свободные даты международных окон)")}</div><select id="frd">${ds.map(d=>`<option value="${d}">${N.fmtD(d)}</option>`).join('')}</select><div style="height:8px"></div>
 <div class="sm mut">${_t("Соперник")}</div><select id="fro">${opps.map(t=>`<option value="${t.c}">${t.n} — #${N.fifaRank(t.c)||'—'} · ${N.stars(t)}★</option>`).join('')}</select><div style="height:8px"></div>
 <div class="sm mut">${_t("Место проведения")}</div><select id="frv" onchange="document.getElementById('frnw').style.display=this.value==='n'?'':'none'"><option value="h">${_t("Дома")}</option><option value="a">${_t("В гостях")}</option><option value="n">${_t("Нейтральное поле")}</option></select>
 <div id="frnw" style="display:none;margin-top:8px"><div class="sm mut">${_t("Город")}</div><select id="frn">${V7.NEU.map((x,i)=>`<option value="${i}">${tf(x[0])} ${esc(x[1]())}</option>`).join('')}</select></div>
 <div style="height:10px"></div><button class="btn g w" onclick="UI.v7ask()">${_t("Запросить условия")}</button><div style="height:6px"></div><button class="btn gh w" onclick="UI.closeM()">${_t("Отмена")}</button>`); }
function v7ask(){ const g=id=>document.getElementById(id).value; V7.startNeg(g('frd'),g('fro'),g('frv'),+g('frn')); negView(); }
function feeTxt(v){ return v>=0?`<b class="grn">${_t("Вы получаете {0}",m2(v))}</b>`:`<b class="red">${_t("Вы платите {0}",m2(-v))}</b>`; }
function negView(msg){ const n=V7.neg; if(!n) return closeM(); const s=S(); const q=n.q; const VEN={h:_t("Дома"),a:_t("В гостях"),n:_t("Нейтральное поле")};
 const city=n.ven==='n'?` · ${tf(V7.NEU[n.ni][0])} ${esc(V7.NEU[n.ni][1]())}`:'';
 const st0=n.st==='walk'?`<div class="card nm red b">${_t("Соперник прервал переговоры.")}</div>`:n.st==='agreed'?`<div class="card nm grn b">${_t("Соперник согласен на ваши условия!")}</div>`:'';
 modal(`<h2>${_t("Переговоры о матче")}</h2><div class="row c"><div class="f1">${tn(s.me)} — ${tn(n.opp)}</div></div>
 <div class="sm mut">${N.fmtD(n.d)} · ${VEN[n.ven]}${city}</div>
 <div class="grid2" style="margin:8px 0"><div class="card nm"><div class="sm mut">${_t("Рейтинг ФИФА соперника")}</div><b>#${N.fifaRank(n.opp)||'—'}</b> · ${_t("сила")} ${T(n.opp).str}</div><div class="card nm"><div class="sm mut">${_t("Ожидается зрителей")}</div><b>${num(q.att)}</b> / ${num(q.cap)}</div></div>
 <div class="card nm"><div class="sm mut">${_t("Гонорар за матч")} · ${_t("раунд {0} из 3",n.round+1)}</div><div style="font-size:18px;margin:4px 0">${feeTxt(n.ask)}</div>${q.gate?`<div class="sm mut">${_t("Плюс выручка от билетов ≈ {0}",m2(q.gate))}</div>`:''}
 <div class="sm mut">${_t("Сумма зависит от силы и рейтинга соперника, вашей привлекательности и ожидаемой посещаемости.")}</div></div>${msg||''}${st0}
 ${n.st==='walk'?`<button class="btn gh w" onclick="UI.closeM()">${_t("Закрыть")}</button>`:`
 <button class="btn g w" onclick="UI.v7acc()">${_t("Принять")}</button><div style="height:6px"></div>
 ${n.st==='open'?`<div class="row c" style="gap:6px"><input id="frc" type="number" step="0.05" value="${m2(n.ask+0.2)}" style="flex:1"><button class="btn" onclick="UI.v7ctr()">${_t("Встречное предложение")}</button></div><div class="sm mut">${_t("Положительное число — сколько вы хотите получить, отрицательное — сколько готовы заплатить.")}</div><div style="height:6px"></div>`:''}
 <button class="btn gh w" onclick="UI.v7dec()">${_t("Отказаться")}</button>`}`); }
function v7ctr(){ const v=+document.getElementById('frc').value; if(!isFinite(v)) return; const n=V7.counter(v); negView(n.st==='open'?`<div class="sm gold">${_t("Соперник выдвинул новое предложение.")}</div>`:''); }
function v7acc(){ const w=V7.neg&&V7.neg.st==='walk'; const f=V7.accept(); closeM(); if(!f) return toast(w?_t("Соперник прервал переговоры."):_t("Дата уже занята")); toast(_t("Матч назначен")); save(); refresh(); }
function v7dec(){ V7.neg=null; closeM(); toast(_t("Переговоры прекращены")); }
// ===== тренировочный сбор =====
function v7camp(){ const s=S(); const nt=V7.nextTour(); const done=V7.campDone();
 modal(`<h2>${_t("Тренировочный сбор")}</h2><div class="sm mut">${nt?_t("Перед турниром «{0}» (через {1} дн.) сбор даёт полный эффект.",esc(nt.c.n),nt.dd):_t("Ближайшего финального турнира нет — эффект сбора вдвое меньше.")}</div>
 ${done?`<div class="card nm gold">${_t("Сбор уже проведён")}</div>`:''}
 <div style="height:8px"></div><div class="sm mut">${_t("Место и климат")}</div><select id="cpl" onchange="UI.v7cc()">${V7.CAMPS.map(x=>`<option value="${x[0]}">${esc(x[1]())}</option>`).join('')}</select>
 <div style="height:8px"></div><div class="sm mut">${_t("Продолжительность")}</div><select id="cpd" onchange="UI.v7cc()">${[5,10,14].map(d=>`<option value="${d}">${_t("{0} дней",d)}</option>`).join('')}</select>
 <div id="cpc" class="card nm" style="margin-top:8px"></div>
 <div class="sm mut">${_t("Сбор повышает сыгранность и готовность игроков; есть небольшой риск травм. Жара и высокогорье полезны перед турниром в жарком климате.")}</div>
 <div style="height:8px"></div>${done?'':`<button class="btn g w" onclick="UI.v7cgo()">${_t("Провести сбор")}</button><div style="height:6px"></div>`}<button class="btn gh w" onclick="UI.closeM()">${_t("Отмена")}</button>
 ${s.u.camps.length?`<h3 style="margin-top:10px">${_t("Прошлые сборы")}</h3>`+s.u.camps.slice(0,4).map(c=>`<div class="sm">${N.fmtD(c.d)} · ${esc((V7.CAMPS.find(x=>x[0]===c.loc)||V7.CAMPS[0])[1]())} · ${_t("{0} дней",c.days)} · ${_t("сыгранность")} +${c.tg}${c.inj.length?` · <span class="red">${_t("травмы")}: ${c.inj.map(esc).join(', ')}</span>`:''}</div>`).join(''):''}`); v7cc(); }
function v7cc(){ const e=document.getElementById('cpc'); if(!e) return; const l=document.getElementById('cpl').value, d=+document.getElementById('cpd').value; e.innerHTML=`${_t("Стоимость")}: <b class="gold">${m2(V7.campCost(l,d))}</b> · ${_t("Бюджет")}: ${S().u.bud}`; }
function v7cgo(){ const r=V7.camp(document.getElementById('cpl').value,+document.getElementById('cpd').value); if(r.err) return toast(r.err); closeM(); toast(_t("Сбор проведён: сыгранность +{0}",r.tg)+(r.inj.length?' · '+_t("травмы")+': '+r.inj.join(', '):'')); save(); refresh(); }
// ===== новости =====
SCR.news=()=>{ top(_t("Новости")); const s=S(); const u=s.u; u.dg.unread=0; const [tab,tb]=tabs('nw7',[['w',_t("Мировые итоги")],['c',_t("Новости клубов")]],'w'); let body='';
 if(tab==='w'){ const L=u.dg.list; if(!L.length) body=`<div class="card mut">${_t("Итоги появятся после первого международного окна.")}</div>`; else { const i=Math.min(st.tab.nwi||0,L.length-1); const d=L[i];
  body=`<div class="tabs">${L.slice(0,6).map((x,k)=>`<div class="tab ${k===i?'on':''}" onclick="UI.st.tab.nwi=${k};UI.refresh()">${N.fmtD(x.to)}</div>`).join('')}</div>
  <div class="card nm"><h3>${_t("15 главных матчей")}</h3><div class="sm mut">${_t("{0} — {1}: сыграно {2} матчей. Порядок — по важности: стадия турнира, рейтинг команд, сенсации.",N.fmtD(d.from),N.fmtD(d.to),d.n)}</div></div>
  ${d.m.map((x,k)=>{ const c=s.C[x.c]; const sc=x.sc.map(z=>`${esc(z[0])} ${z[2]}'${z[3]?` (${_t("пен.")})`:''}`); const hs=x.sc.filter(z=>z[1]===0), as=x.sc.filter(z=>z[1]===1);
   return `<div class="card nm"><div class="row c"><span class="mut b" style="min-width:22px">${k+1}</span><div class="f1 sm mut ell">${esc(c?c.n:N.v6.compName?N.v6.compName(x.c):x.c)}${x.st?' · '+esc(x.st):''}</div>${x.up?`<span class="chip y">${_t("Сенсация")}</span>`:''}</div>
   <div class="row c" style="font-size:15px"><div class="f1 ell r">${tn(x.h)}</div><b style="min-width:54px;text-align:center">${x.hg}:${x.ag}</b><div class="f1 ell">${tn(x.a)}</div></div>
   ${x.pen?`<div class="ctr sm mut">${_t("пен.")} ${x.pen.join(':')}</div>`:''}${sc.length?`<div class="row sm mut"><div class="f1 r">${hs.map(z=>`${esc(z[0])} ${z[2]}'`).join(', ')}</div><div style="min-width:54px"></div><div class="f1">${as.map(z=>`${esc(z[0])} ${z[2]}'`).join(', ')}</div></div>`:''}</div>`; }).join('')}`; } }
 else { const ms=u.mail.filter(m=>m.from===_t("Скаутская служба")||m.from===_t("Мировой футбол")); body=ms.length?ms.slice(0,15).map(m=>`<div class="card nm"><div class="sm mut">${N.fmtD(m.d)} · ${esc(m.from)}</div><b>${esc(m.sub)}</b><div class="sm" style="white-space:pre-line">${m.body}</div></div>`).join(''):`<div class="card mut">${_t("Пока нет новостей.")}</div>`; }
 V().innerHTML=tb+body; };
// ===== экипировка =====
function kitSvg(k,txt,cls){ const id='k7'+Math.random().toString(36).slice(2,8); const P='M22 6 L12 10 L2 22 L10 30 L15 26 L15 58 L49 58 L49 26 L54 30 L62 22 L52 10 L42 6 Q32 13 22 6 Z'; const a=k.c2, b=k.c3||k.c2; let pat='';
 if(k.p==='stripes') pat=[0,1,2,3,4].map(i=>`<rect x="${16+i*7}" y="0" width="3.5" height="64" fill="${a}"/>`).join('');
 else if(k.p==='pin') pat=[0,1,2,3,4,5,6,7,8].map(i=>`<rect x="${14+i*4.2}" y="0" width="0.9" height="64" fill="${a}"/>`).join('');
 else if(k.p==='hoops') pat=[0,1,2,3].map(i=>`<rect x="0" y="${18+i*11}" width="64" height="5.5" fill="${a}"/>`).join('');
 else if(k.p==='sash') pat=`<path d="M10 8 L22 6 L56 58 L44 58 Z" fill="${a}"/>`;
 else if(k.p==='halves') pat=`<rect x="32" y="0" width="32" height="64" fill="${a}"/>`;
 else if(k.p==='chevron') pat=`<path d="M12 18 L32 34 L52 18 L52 26 L32 42 L12 26 Z" fill="${a}"/>`;
 else if(k.p==='band') pat=`<rect x="0" y="27" width="64" height="9" fill="${a}"/>`;
 const tc=N.kitTxt?N.kitTxt(k.c1):'#fff';
 return `<svg class="shirt ${cls||''}" viewBox="0 0 64 64" aria-hidden="true" style="${cls==='big'?'width:110px;height:110px':'width:44px;height:44px'}"><defs><clipPath id="${id}"><path d="${P}"/></clipPath><linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient></defs>
 <path d="${P}" fill="${k.c1}"/><g clip-path="url(#${id})">${pat}</g><path d="M2 22 L10 30 L13 27 L5 19 Z M62 22 L54 30 L51 27 L59 19 Z" fill="${b}"/><path d="M22 6 Q32 13 42 6 L39 5 Q32 10 25 5 Z" fill="${b}"/>
 <path d="${P}" fill="url(#${id}g)" stroke="rgba(0,0,0,.45)" stroke-width="1.5" stroke-linejoin="round"/>${txt?`<text x="32" y="44" text-anchor="middle" font-family="Oswald,Inter,sans-serif" font-weight="700" font-size="17" fill="${k.p==='plain'||k.p==='pin'?tc:'#fff'}" stroke="rgba(0,0,0,.4)" stroke-width=".7">${txt}</text>`:''}</svg>`; }
V7.kitSvg=kitSvg;
function draft(){ const s=S(); if(!st.kd){ const cur=s.u.kit.cur; const pal=V7.palette(s.me); st.kd=cur?JSON.parse(JSON.stringify({home:cur.home,away:cur.away})):{home:{p:'plain',c1:pal[0],c2:pal[1],c3:pal[1]},away:{p:'plain',c1:pal[1],c2:pal[0],c3:pal[0]}}; } return st.kd; }
SCR.kits=()=>{ top(_t("Экипировка")); const s=S(); const u=s.u, k=u.kit; const [tab,tb]=tabs('kt7',[['d',_t("Дизайнер формы")],['s',_t("Технический спонсор")]],'d'); let body='';
 const hype=`<div class="card nm"><div class="row c"><div class="f1"><div class="sm mut">${_t("Ажиотаж вокруг формы")}</div><div class="bar"><i style="width:${k.hype}%"></i></div></div><b class="gold" style="margin-left:8px">${k.hype}</b></div><div class="sm mut">${_t("Продажи мерчендайза: ×{0} (ажиотаж, результаты, звёзды, настроение болельщиков)",V7.merchK().toFixed(2))}</div></div>`;
 if(tab==='d'){ const d=draft(); const pal=V7.palette(s.me); const side=st.tab.kts||'home'; const K=d[side];
  const sw=(f)=>`<div class="row" style="gap:6px;flex-wrap:wrap;margin:4px 0">${pal.map(c=>`<span onclick="UI.v7kc('${side}','${f}','${c}')" style="width:28px;height:28px;border-radius:50%;background:${c};border:3px solid ${K[f]===c?'var(--acc)':'rgba(255,255,255,.25)'};display:inline-block;cursor:pointer"></span>`).join('')}</div>`;
  body=`${hype}<div class="card nm"><div class="row c" style="justify-content:space-around"><div class="ctr" onclick="UI.st.tab.kts='home';UI.refresh()" style="opacity:${side==='home'?1:.55}">${kitSvg(d.home,'10','big')}<div class="sm">${_t("Домашняя")}</div></div><div class="ctr" onclick="UI.st.tab.kts='away';UI.refresh()" style="opacity:${side==='away'?1:.55}">${kitSvg(d.away,'10','big')}<div class="sm">${_t("Гостевая")}</div></div></div></div>
  <div class="card nm"><div class="sm mut">${_t("Узор")}</div><select onchange="UI.v7kp('${side}',this.value)">${V7.PAT.map(p=>`<option value="${p}" ${K.p===p?'selected':''}>${V7.PATN[p]()}</option>`).join('')}</select>
  <div class="sm mut" style="margin-top:6px">${_t("Основной цвет")}</div>${sw('c1')}<div class="sm mut">${_t("Цвет узора")}</div>${sw('c2')}<div class="sm mut">${_t("Отделка")}</div>${sw('c3')}<div class="sm mut">${_t("Палитра — цвета флага.")}</div></div>
  <button class="btn g w" ${V7.canRelease()?'':'disabled'} onclick="UI.v7rel()">${_t("Выпустить новую форму")} ${k.sup?'':`(${m2(V7.kitCost())})`}</button>${V7.canRelease()?'':`<div class="sm mut ctr">${_t("Новую форму можно выпускать раз в 10 месяцев")}</div>`}
  ${k.hist.length?`<h3 style="margin-top:10px">${_t("Коллекции")}</h3><div class="row" style="gap:8px;flex-wrap:wrap">${k.hist.map(h=>`<div class="ctr sm">${kitSvg(h.home,'','')}${kitSvg(h.away,'','')}<div>${h.d.slice(0,4)} · ${h.hype}</div></div>`).join('')}</div>`:''}`; }
 else { const sp=k.sup; body=hype+(sp?`<div class="card nm"><h3>${esc(sp.n)}</h3><div class="sm">${_t("Контракт до {0}",N.fmtD(sp.until))} · ${_t("{0} в год",m2(sp.fee))}</div><div class="sm mut">${_t("Бонус за трофей: {0}",m2(sp.bt))} · ${_t("Бонус за выход на турнир: {0}",m2(sp.bq))}</div><div class="sm mut">${_t("Поставщик оплачивает выпуск новой формы.")}</div></div>`:`<div class="card nm mut">${_t("Нет технического спонсора. Предложения зависят от рейтинга и успехов.")}</div>`)
  +(k.off.length&&!sp?k.off.map((o,i)=>`<div class="card nm"><div class="row c"><div class="f1"><b>${esc(o.n)}</b><div class="sm">${_t("{0} г.",o.y)} · <b class="grn">${_t("{0} в год",m2(o.fee))}</b></div><div class="sm mut">${_t("Бонус за трофей: {0}",m2(o.bt))} · ${_t("Бонус за выход на турнир: {0}",m2(o.bq))}</div></div><button class="btn sm g" onclick="UI.v7sign(${i})">${_t("Подписать")}</button></div></div>`).join(''):''); }
 V().innerHTML=tb+body; };
function v7kc(side,f,c){ draft()[side][f]=c; refresh(); }
function v7kp(side,p){ draft()[side].p=p; refresh(); }
function v7rel(){ const d=draft(); const r=V7.release(JSON.parse(JSON.stringify(d.home)),JSON.parse(JSON.stringify(d.away))); if(r.err) return toast(r.err); toast(_t("Новая форма выпущена! Ажиотаж: {0}",r.hype)); save(); refresh(); }
function v7sign(i){ if(V7.signKit(i)){ toast(_t("Контракт подписан")); save(); refresh(); } }
// ===== мировая статистика =====
SCR.wstat=()=>{ top(_t("Мировая статистика")); const s=S(); const [tab,tb]=tabs('ws7',[['str',_t("Сила команд")],['mv',_t("Рост и падение")],['sc',_t("Бомбардиры")],['gl',_t("Голы команд")],['rec',_t("Рекорды")]],'mv'); let body='';
 const confs=['ALL',...Object.keys(N.CONFS)]; const cf=st.tab.wsc||'ALL'; const cft=`<div class="tabs">${confs.map(k=>`<div class="tab ${cf===k?'on':''}" onclick="UI.st.tab.wsc='${k}';UI.refresh()">${k==='ALL'?_t("Мир"):k}</div>`).join('')}</div>`;
 const PER=[[1,_t("Месяц")],[3,_t("3 месяца")],[12,_t("Год")]]; const per=+(st.tab.wsp||12); const pt=`<div class="tabs">${PER.map(([k,n])=>`<div class="tab ${per===k?'on':''}" onclick="UI.st.tab.wsp=${k};UI.refresh()">${n}</div>`).join('')}</div>`;
 const tm=c=>`onclick="UI.st.tab.wst='${c}';UI.st.tab.ws7='str';UI.refresh()"`;
 if(tab==='mv'){ const m=V7.movers(per,10,cf==='ALL'?null:cf); const li=x=>`<div class="row c" ${tm(x.c)}><div class="f1 ell">${tn(x.c)}</div><span class="mut sm" style="margin-right:8px">${T(x.c).str}</span><b class="${cls(x.d)}">${sg(x.d)}</b></div>`;
  body=pt+cft+(s.strH.length<2?`<div class="card mut">${_t("Данные появятся после первого месяца игры.")}</div>`:`<div class="card nm"><h3 class="grn">▲ ${_t("Рост силы")}</h3>${m.up.map(li).join('')||'—'}</div><div class="card nm"><h3 class="red">▼ ${_t("Падение силы")}</h3>${m.dn.map(li).join('')||'—'}</div>`)+`<div class="sm mut">${_t("Сила — общая оценка состава по 100-балльной шкале; снимки делаются ежемесячно.")}</div>`; }
 else if(tab==='str'){ const sel=st.tab.wst||s.me; const H=V7.strHist(sel); const so=st.tab.wso||'str'; const L=Object.values(s.T).filter(t=>cf==='ALL'||t.conf===cf).map(t=>({c:t.c,str:t.str,rk:N.fifaRank(t.c)||999,d1:V7.strD(t.c,1),d3:V7.strD(t.c,3),d12:V7.strD(t.c,12)}));
  const key={str:x=>-x.str,rk:x=>x.rk,d1:x=>-(x.d1??-99),d3:x=>-(x.d3??-99),d12:x=>-(x.d12??-99)}[so]; L.sort((a,b)=>key(a)-key(b));
  const th=(k,n)=>`<th onclick="UI.st.tab.wso='${k}';UI.refresh()" style="cursor:pointer">${n}${so===k?' ▾':''}</th>`;
  body=`<div class="card nm"><h3>${tn(sel)} · ${T(sel).str}</h3>${chart(H)}</div>`+cft+`<div class="card nm" style="overflow-x:auto"><table class="tbl"><tr><th class="l">${_t("Сборная")}</th>${th('rk',_t("ФИФА"))}${th('str',_t("Сила"))}${th('d1','Δ1')}${th('d3','Δ3')}${th('d12','Δ12')}</tr>
  ${L.slice(0,st.tab.wsn||60).map(x=>`<tr ${tm(x.c)} class="${x.c===s.me?'me':''}"><td class="l ell" style="max-width:150px">${tn(x.c)}</td><td>${x.rk<999?x.rk:'—'}</td><td><b>${x.str}</b></td><td class="${cls(x.d1)}">${sg(x.d1)}</td><td class="${cls(x.d3)}">${sg(x.d3)}</td><td class="${cls(x.d12)}">${sg(x.d12)}</td></tr>`).join('')}</table>
  ${L.length>(st.tab.wsn||60)?`<button class="btn gh w" onclick="UI.st.tab.wsn=999;UI.refresh()">${_t("Показать все")}</button>`:''}</div>`; }
 else { const W=V7.stats(); const pl=(x,k)=>`<div class="row c"><span class="mut" style="min-width:22px">${k+1}</span><div class="f1 ell">${tf(x.t)} ${esc(x.n)}</div><b>${x.g}</b></div>`;
  if(tab==='sc'){ const at=st.tab.wsa==='a'; body=`<div class="tabs"><div class="tab ${!at?'on':''}" onclick="UI.st.tab.wsa='c';UI.refresh()">${_t("Этот цикл")}</div><div class="tab ${at?'on':''}" onclick="UI.st.tab.wsa='a';UI.refresh()">${_t("За всё время")}</div></div><div class="card nm">${(at?W.at:W.cyc).map(pl).join('')||'—'}</div>${at?`<div class="sm mut">${_t("Голы действующих и бывших игроков за сборные.")}</div>`:`<div class="sm mut">${_t("С {0}",N.fmtD(W.from))}</div>`}`; }
  else if(tab==='gl') body=`<div class="card nm"><div class="sm mut">${_t("С {0}",N.fmtD(W.from))}</div>${W.goals.map(([c,g],k)=>`<div class="row c" ${tm(c)}><span class="mut" style="min-width:22px">${k+1}</span><div class="f1 ell">${tn(c)}</div><b>${g}</b></div>`).join('')}</div>`;
  else body=`<div class="card nm"><h3>${_t("Крупнейшие победы")}</h3>${W.big.map(x=>`<div class="row c sm"><div class="f1 ell r">${tn(x.h)}</div><b style="min-width:48px;text-align:center">${x.hg}:${x.ag}</b><div class="f1 ell">${tn(x.a)}</div></div><div class="sm mut ctr">${N.fmtD(x.d)}</div>`).join('')}</div>
   <div class="grid2"><div class="card nm"><h3>${_t("Серии побед")}</h3>${W.sw.map(([c,z])=>`<div class="row c sm"><div class="f1 ell">${tn(c)}</div><b>${z.w}</b></div>`).join('')}</div><div class="card nm"><h3>${_t("Серии без поражений")}</h3>${W.su.map(([c,z])=>`<div class="row c sm"><div class="f1 ell">${tn(c)}</div><b>${z.u}</b></div>`).join('')}</div></div>
   <div class="sm mut">${_t("По сыгранным матчам в сохранённой истории.")} <a onclick="UI.go('rank')" style="cursor:pointer;text-decoration:underline">${_t("Рейтинг ФИФА")}</a></div>`; }
 V().innerHTML=tb+body; };
function chart(H){ if(H.length<2) return `<div class="sm mut">${_t("Данные появятся после первого месяца игры.")}</div>`; const W=320,Hh=110; const v=H.map(x=>x[1]); const mn=Math.min(...v)-0.5, mx=Math.max(...v)+0.5; const x=i=>8+i/(H.length-1)*(W-16), y=q=>Hh-14-(q-mn)/(mx-mn)*(Hh-26);
 return `<svg viewBox="0 0 ${W} ${Hh}" class="spark" style="width:100%;height:auto"><polyline fill="none" stroke="var(--acc)" stroke-width="2" points="${v.map((q,i)=>x(i).toFixed(1)+','+y(q).toFixed(1)).join(' ')}"/>
 <text x="4" y="12" font-size="10" fill="currentColor" opacity=".6">${mx.toFixed(1)}</text><text x="4" y="${Hh-2}" font-size="10" fill="currentColor" opacity=".6">${mn.toFixed(1)}</text><text x="${W-4}" y="${Hh-2}" font-size="10" text-anchor="end" fill="currentColor" opacity=".6">${H[0][0]} — ${H[H.length-1][0]}</text></svg>`; }
// ===== жеребьёвка: правило =====
// ===== экономика: ссылка на экипировку =====
const _eco=SCR.eco; SCR.eco=()=>{ _eco(); const s=S(); const k=s.u.kit; V().insertAdjacentHTML('afterbegin',`<div class="card nm row c" onclick="UI.go('kits')" style="cursor:pointer">${k.cur?kitSvg(k.cur.home,'',''):N.teamShirt?N.teamShirt(s.me,'',0,''):''}<div class="f1" style="margin-left:8px"><b>${_t("Экипировка")}</b><div class="sm mut">${k.sup?esc(k.sup.n)+' · '+_t("{0} в год",m2(k.sup.fee)):_t("Нет технического спонсора")} · ${_t("ажиотаж")} ${k.hype}</div></div>${ic('chevron-right')}</div>`); };
Object.assign(UI,{friendly,v7ask,v7ctr,v7acc,v7dec,v7camp,v7cc,v7cgo,v7kc,v7kp,v7rel,v7sign});
X.boot();
})();

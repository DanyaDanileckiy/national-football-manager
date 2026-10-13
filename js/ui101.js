// Интерфейс обновления 10.1: кнопка «Авто» и панель «Почему так» на экранах состава, тактики и тренировки
(function(){ const N=NFM, X=window.UIX, A=N.v101; const {SCR,st,V,toast,esc,save,refresh}=X; const UI=window.UI;
const TT={sq:()=>_t("Почему такой состав"),tac:()=>_t("Почему такая тактика"),tr:()=>_t("Почему такой план тренировок")};
const SC={sq:'squad',tac:'tactics',tr:'training'};
const btn=k=>`<button class="btn g w a101b" onclick="UI.a101('${k}')">✨ ${_t("Авто")}<span class="xs">${({sq:_t("лучший состав и запасные"),tac:_t("схема, роли и установки под соперника"),tr:_t("план тренировок")})[k]}</span></button>`;
const panel=k=>{ const a=st.a101; if(!a||a.k!==k) return ''; return `<div class="card a101" id="a101p"><div class="row" style="border:0;padding:0"><b class="f1">💡 ${TT[k]()}</b><button class="btn sm gh" onclick="UI.a101x()" aria-label="close">✕</button></div><ul>${a.why.map(w=>`<li>${esc(w)}</li>`).join('')}</ul><div class="xs mut">${_t("Это предложение помощника — любую настройку можно изменить вручную.")}</div></div>`; };
const wrap=(scr,k,ok)=>{ const f=SCR[scr]; SCR[scr]=(...a)=>{ f(...a); if(ok&&!ok()) return; const v=V(); if(!v) return; v.insertAdjacentHTML('afterbegin',btn(k)+panel(k)); }; };
wrap('squad','sq',()=>!st.tab.sq||st.tab.sq==='call'); wrap('tactics','tac'); wrap('training','tr');
UI.a101=(k)=>{ let why=[]; try{ why=k==='sq'?A.autoSquad(true):k==='tac'?A.autoTac():A.autoTrain(); }catch(e){ console.error(e); toast(_t("Не удалось подобрать автоматически")); return; }
 st.a101={k,why}; save(); refresh(); const p=document.getElementById('a101p'); if(p&&p.scrollIntoView) p.scrollIntoView({block:'nearest'}); };
UI.a101x=()=>{ st.a101=null; refresh(); };
for(const fn of ['go','nav','home','back']){ const f=UI[fn]; if(typeof f!=='function') continue; UI[fn]=(...a)=>{ const r=f(...a); if(st.a101&&st.cur!==SC[st.a101.k]){ st.a101=null; } return r; }; }
})();

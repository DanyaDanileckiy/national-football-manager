// Интерфейс обновления 8.1: полноэкранный режим, кнопка «Назад», подтверждение выхода
(function(){ const X=window.UIX; const {SCR,st,V,ask,closeM,save,flush,PREF,savePref}=X; const UI=window.UI;
const nat=()=>window.NFMNative||null; // мост Android (MainActivity)
const fsOK=()=>!nat()&&!!(document.fullscreenEnabled||document.webkitFullscreenEnabled);
const fsOn=()=>!!(document.fullscreenElement||document.webkitFullscreenElement);
function fsToggle(){ const d=document, e=d.documentElement;
 if(fsOn()){ (d.exitFullscreen||d.webkitExitFullscreen).call(d); return; }
 const r=(e.requestFullscreen||e.webkitRequestFullscreen).call(e,{navigationUI:'hide'});
 Promise.resolve(r).then(()=>{ try{ const o=screen.orientation; if(o&&o.lock) o.lock('portrait').catch(()=>{}); }catch(x){} }).catch(()=>{}); }
document.addEventListener('fullscreenchange',()=>{ const b=document.getElementById('bfs'); if(b) b.checked=fsOn(); });
function awake(){ const n=nat(); if(n&&n.keepOn) try{ n.keepOn(PREF.awake!==false); }catch(e){} }
function exitApp(){ save(); return Promise.resolve(flush&&flush()).catch(()=>{}).then(()=>{ const n=nat(); if(n&&n.exit) n.exit(); else window.close(); }); }
function exitAsk(){ if(st.m&&!st.m.paused&&UI.pp) UI.pp(); save(); ask(_t("Выйти из игры?"),_t("Выйти"),exitApp); }
function toMenu(){ ask(_t("Выйти в главное меню?"),_t("Выйти"),()=>{ save(); st.stack=[]; X.go('title',null,true); }); }
// Назад: окно → предыдущий экран → главное меню → вопрос о выходе. Возвращает 'h' (обработано).
function backKey(){ try{ const m=document.getElementById('modal');
 if(m&&!m.classList.contains('hidden')){ if(!st.lockM) closeM(); return 'h'; }
 const lock=['match','post','fired','title','newgame'];
 if(st.cur&&lock.indexOf(st.cur)<0){ if(st.stack&&st.stack.length){ UI.back(); return 'h'; } if(st.cur!=='hub'){ UI.home(); return 'h'; } }
 exitAsk(); }catch(e){ return 'x'; } return 'h'; }
const _set=SCR.settings; SCR.settings=()=>{ _set(); const v=V(); let h='';
 if(fsOK()) h+=`<label class="ck"><input type="checkbox" id="bfs" ${fsOn()?'checked':''} onchange="UI.fsToggle()"> ${_t("Полноэкранный режим")}</label>`;
 if(nat()&&nat().keepOn) h+=`<label class="ck"><input type="checkbox" ${PREF.awake!==false?'checked':''} onchange="UI.PREF.awake=this.checked;UI.savePref();UI.awake()"> ${_t("Не гасить экран во время игры")}</label>`;
 if(!h) return; const c=document.createElement('div'); c.className='card'; c.innerHTML=h; const ref=v.lastElementChild&&v.lastElementChild.previousElementSibling; v.insertBefore(c,ref||null); };
Object.assign(UI,{fsToggle,fsOn,exitAsk,exitApp,toMenu,backKey,awake}); awake();
})();

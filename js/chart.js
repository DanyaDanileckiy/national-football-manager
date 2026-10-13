// v10.1: общий компонент линейного графика — подсказка по нажатию/наведению/ведению пальцем, сетка оси Y,
// подписи лет по оси X, подписи лучшего и худшего значения. NFM.chart(series, opts) → HTML.
(function(){ const N=globalThis.NFM=globalThis.NFM||{}; const I=globalThis.NFM_I18N||{};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const cl=(v,a,b)=>Math.max(a,Math.min(b,v));
const REG={}; let seq=0;
// дата: 'YYYY' → год, 'YYYY-MM' / 'YYYY-MM-DD' → «месяц год» или полная дата
const fmtDate=(d,full)=>{ d=String(d); if(!/^\d{4}/.test(d)) return d; if(d.length<7) return d.slice(0,4); const y=+d.slice(0,4), m=+d.slice(5,7), dd=+(d.slice(8,10)||1);
 try{ return new Intl.DateTimeFormat(I.lang||'ru',full&&d.length>=10?{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}:{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(Date.UTC(y,m-1,dd))); }catch(e){ return d.slice(0,7); } };
N.chartDate=fmtDate;
const nice=(sp)=>{ const raw=sp/4; const p=Math.pow(10,Math.floor(Math.log10(raw||1))); const f=raw/p; return (f<1.5?1:f<2.25?2:f<3.5?2.5:f<7.5?5:10)*p; };
// series: [{d:[[date,value],…], c:цвет, name, w, dash, mk:false — без лучшего/худшего, dot:(i)=>цвет|null, info:(i)=>html}]
// opts: {inv — места (меньше лучше), H, W, fmt:v=>текст, min, max, ticks:[…], full — полные даты в подсказке, mini — компактный вид, align:'end' — короткие серии прижаты вправо, legend:false}
N.chart=(series,o={})=>{ series=series.filter(s=>s&&s.d&&s.d.length); const W=o.W||340, H=o.H||(o.mini?74:150), P=o.mini?4:28, R=6, B=o.mini?4:16, T=8; const inv=!!o.inv;
 const fmt=o.fmt||(inv?(v=>'#'+Math.round(v)):(v=>String(Math.round(v*10)/10)));
 const all=series.flatMap(s=>s.d.map(v=>+v[1]).filter(isFinite)); if(all.length<2) return o.empty||'';
 let mn=o.min??Math.min(...all), mx=o.max??Math.max(...all); if(mx-mn<(inv?2:1e-9)){ const m=(mn+mx)/2, h=inv?2:Math.max(0.5,Math.abs(m)*0.05); mn=inv?Math.max(1,m-h):m-h; mx=m+h; } const sp=mx-mn;
 const n=Math.max(...series.map(s=>s.d.length)); const off=s=>o.align==='end'?n-s.d.length:0;
 const X=i=>P+(W-P-R)*(n<2?0:i/(n-1)), Y=v=>{ const k=(v-mn)/sp; return T+(H-T-B)*(inv?k:1-k); };
 let g='';
 if(!o.mini){ // сетка оси Y
  let ticks=o.ticks; if(!ticks){ if(inv) ticks=[1,10,20,30,50,75,100,150,200]; else { const st=nice(sp); ticks=[]; for(let v=Math.ceil(mn/st)*st;v<=mx+1e-9;v+=st) ticks.push(+v.toFixed(6)); } }
  const ys=[]; const tk=(v,strong)=>{ const y=Y(v); if(ys.some(q=>Math.abs(q-y)<10)) return; ys.push(y); g+=`<line x1="${P}" x2="${W-R}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" stroke="var(--line)"${strong?'':' stroke-dasharray="3 3" opacity=".6"'}/><text x="2" y="${(y+4).toFixed(1)}" class="ct">${esc(fmt(v))}</text>`; };
  tk(inv?mn:mx,1); tk(inv?mx:mn,1); for(const v of ticks) if(v>mn&&v<mx) tk(v,0);
  // подписи лет по оси X: примерно каждые 5 лет (на коротком отрезке — чаще)
  const d0=series.reduce((a,s)=>s.d.length===n?s:a,series[0]).d; const yr=d0.map(v=>+String(v[0]).slice(0,4)); const span=(yr[yr.length-1]-yr[0])||0; let xl=[];
  if(isFinite(span)&&span>=2){ const step=span>=12?5:span>=5?2:1; let last=null; d0.forEach((v,i)=>{ const y=yr[i]; if(y!==last&&y%step===0&&i>0){ const x=X(i+off({d:d0})); if(x>P+18&&x<W-30&&(!xl.length||x-xl[xl.length-1][0]>24)) xl.push([x,y]); } last=y; }); }
  for(const [x,y] of xl) g+=`<line x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="${T}" y2="${H-B}" stroke="var(--line)" opacity=".35"/><text x="${x.toFixed(1)}" y="${H-3}" class="ct" text-anchor="middle">${y}</text>`;
  const lab=v=>esc(fmtDate(v[0]).replace(/\s*г\.$/,'')).slice(0,12); const f0=d0[0], f1=d0[d0.length-1];
  if(!xl.length) g+=`<text x="${P}" y="${H-3}" class="ct">${span>=2?String(f0[0]).slice(0,4):lab(f0)}</text>`; if(!(xl.length&&span>=2&&xl[xl.length-1][1]===yr[yr.length-1])) g+=`<text x="${W-R}" y="${H-3}" class="ct" text-anchor="end">${span>=2?String(f1[0]).slice(0,4):lab(f1)}</text>`; }
 for(const s of series){ const k=off(s); g+=`<polyline fill="none" stroke="${s.c}" stroke-width="${s.w||2.2}" stroke-linejoin="round"${s.dash?' stroke-dasharray="4 3"':''} points="${s.d.map((v,i)=>X(i+k).toFixed(1)+','+Y(+v[1]).toFixed(1)).join(' ')}"/>`;
  if(s.dot) s.d.forEach((v,i)=>{ const c=s.dot(i); if(c) g+=`<circle cx="${X(i+k).toFixed(1)}" cy="${Y(+v[1]).toFixed(1)}" r="2.6" fill="${c}"/>`; }); }
 const marks=o.marks!==false; if(marks) for(const s of series){ if(s.mk===false) continue; const k=off(s); let bi=0,wi=0; s.d.forEach((v,i)=>{ const b=+s.d[bi][1], w=+s.d[wi][1]; if(inv?+v[1]<b:+v[1]>b) bi=i; if(inv?+v[1]>w:+v[1]<w) wi=i; }); if(bi===wi) continue;
  const lab=(i,c)=>{ const x=X(i+k), y=Y(+s.d[i][1]); const top=c==='#22d37a'; const ty=top?(y<20?y+14:y-7):(y>H-B-14?y-7:y+14); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${o.mini?3:4}" fill="${c}"/>`+(o.mini?'':`<text x="${cl(x,P+14,W-R-14).toFixed(1)}" y="${cl(ty,10,H-2).toFixed(1)}" class="ct" text-anchor="middle" style="fill:${c};font-weight:700">${esc(fmt(+s.d[i][1]))}</text>`); };
  g+=lab(bi,'#22d37a')+lab(wi,'#ff5d62'); }
 const id='nch'+(++seq); REG[id]={series,W,H,P,R,X,Y,n,off,fmt,o}; if(seq>400){ const k=Object.keys(REG); for(const x of k.slice(0,k.length-200)) delete REG[x]; }
 const tip=`<g class="chg" style="display:none"><line y1="${T-2}" y2="${H-B}" stroke="currentColor" stroke-width="1" opacity=".7"/>${series.map(s=>`<circle r="4.5" fill="${s.c}" stroke="#fff" stroke-width="1.5"/>`).join('')}</g><rect x="0" y="0" width="${W}" height="${H}" fill="transparent"/>`;
 const hint=o.mini||o.legend===false?'':`<div class="xs mut">${marks?`<span class="grn">●</span> ${_t("лучшее")} · <span class="red">●</span> ${_t("худшее")} · `:''}${_t("Нажмите на график или проведите по нему пальцем, чтобы увидеть подробности.")}</div>`;
 return `<div class="ch10w${o.mini?' mini':''}" style="position:relative" onclick="event.stopPropagation()"><svg viewBox="0 0 ${W} ${H}" class="ch10" data-ch="${id}" style="touch-action:pan-y;cursor:crosshair" onpointerdown="NFM.chTip(event,'${id}')" onpointermove="NFM.chTip(event,'${id}')" onpointerleave="if(event.pointerType==='mouse')NFM.chTip(null,'${id}')" role="img">${g}${tip}</svg><div class="chtip" style="display:none"></div></div>${hint}`; };
N.chTip=(e,id)=>{ const C=REG[id]; const svg=document.querySelector(`svg[data-ch="${id}"]`); if(!C||!svg) return; const g=svg.querySelector('.chg'), tp=svg.parentNode.querySelector('.chtip'); if(!e){ g.style.display='none'; tp.style.display='none'; return; }
 const r=svg.getBoundingClientRect(); const vx=(e.clientX-r.left)/r.width*C.W; const gi=cl(Math.round((vx-C.P)/(C.W-C.P-C.R)*(C.n-1)),0,C.n-1); let html='', gx=C.X(gi); const cs=g.querySelectorAll('circle');
 C.series.forEach((s,k)=>{ const i=gi-C.off(s); const cc=cs[k]; if(i<0||i>=s.d.length){ cc.setAttribute('cx',-20); return; } const v=s.d[i]; cc.setAttribute('cx',C.X(gi)); cc.setAttribute('cy',C.Y(+v[1]));
  const pv=i>0?+s.d[i-1][1]:null; const dv=pv==null?0:(C.o.inv?pv-(+v[1]):(+v[1])-pv); const z=Math.abs(dv)<1e-9||+C.fmt(Math.abs(dv)).replace(/[^\d.]/g,'')===0; const ar=z?'':dv>0?`<b class="grn">▲${C.o.inv?Math.round(dv):C.fmt(dv)}</b>`:dv<0?`<b class="red">▼${C.o.inv?Math.round(-dv):C.fmt(-dv)}</b>`:'';
  let extra=''; try{ extra=s.info?s.info(i)||'':''; }catch(err){}
  html+=`<div style="border-inline-start:3px solid ${s.c};padding-inline-start:6px;margin:2px 0">${s.name?`<b>${s.name}</b> · `:''}<b>${esc(C.fmt(+v[1]))}</b> ${ar}<div class="xs mut">${esc(fmtDate(v[0],C.o.full))}</div>${extra}</div>`; });
 g.style.display=''; const ln=g.querySelector('line'); ln.setAttribute('x1',gx); ln.setAttribute('x2',gx); tp.innerHTML=html; tp.style.display='block';
 const px=gx/C.W*r.width; const w=Math.min(240,r.width-8); tp.style.width=w+'px'; tp.style.left=cl(px-w/2,4,r.width-w-4)+'px'; tp.style.top=(r.height+4)+'px'; };
})();

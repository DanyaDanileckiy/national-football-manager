// Графика: футболки, эмблемы турниров, кубки, радар — оригинальные SVG
(function(){
const N=NFM;
const lum=h=>{ const n=parseInt(h.slice(1),16); return ((n>>16)*0.3+((n>>8)&255)*0.59+(n&255)*0.11)/255; };
N.kit=c=>(N.KITS&&N.KITS[c])||['#2457a6','#ffffff'];
N.kitTxt=col=>lum(col)>0.6?'#0b1b30':'#ffffff';
let uid=0;
// футболка: c1 — основной цвет, c2 — отделка, txt — число/подпись
N.shirt=(c1,c2,txt,cls)=>{ const id='s'+(uid++); const tc=N.kitTxt(c1);
 return `<svg class="shirt ${cls||''}" viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient></defs>
 <path d="M22 6 L12 10 L2 22 L10 30 L15 26 L15 58 L49 58 L49 26 L54 30 L62 22 L52 10 L42 6 Q32 13 22 6 Z" fill="${c1}" stroke="rgba(0,0,0,.45)" stroke-width="1.5" stroke-linejoin="round"/>
 <path d="M2 22 L10 30 L13 27 L5 19 Z M62 22 L54 30 L51 27 L59 19 Z" fill="${c2}"/>
 <path d="M22 6 Q32 13 42 6 L39 5 Q32 10 25 5 Z" fill="${c2}"/>
 <path d="M22 6 L12 10 L2 22 L10 30 L15 26 L15 58 L49 58 L49 26 L54 30 L62 22 L52 10 L42 6 Q32 13 22 6 Z" fill="url(#${id})"/>
 ${txt!=null&&txt!==''?`<text x="32" y="44" text-anchor="middle" font-family="Oswald,Inter,sans-serif" font-weight="700" font-size="${String(txt).length>2?15:19}" fill="${tc}" stroke="${tc==='#ffffff'?'rgba(0,0,0,.35)':'rgba(255,255,255,.3)'}" stroke-width=".6">${txt}</text>`:''}</svg>`; };
N.teamShirt=(c,txt,gk,cls)=>{ const [a,b]=N.kit(c); if(gk){ const g=lum(a)>0.5?'#1f2937':'#f6c445'; return N.shirt(g,lum(g)>0.5?'#1f2937':'#f6c445',txt,cls);} return N.shirt(a,b,txt,cls); };
// эмблемы турниров
const CC={UEFA:['#1f4fd1','#7fb0ff'],CONMEBOL:['#0f7a43','#f6c445'],CONCACAF:['#0aa1a8','#9ff3f6'],CAF:['#1f9d55','#f6c445'],AFC:['#c8322b','#ffb4a8'],OFC:['#2a6fdb','#9fd1ff'],ALL:['#b8860b','#ffe8a0']};
N.badge=(c,cls)=>{ if(!c) return ''; const id='b'+(uid++); const [m,l]=CC[c.conf]||CC.ALL; const k=c.kind; const sh=String(c.sh||'').replace(/[<>&]/g,'').slice(0,5);
 const fs=sh.length>4?11:sh.length>3?13:15;
 let shape;
 if(k==='final'||c.cup) shape=`<path d="M32 3 L57 11 L55 37 Q52 52 32 61 Q12 52 9 37 L7 11 Z" fill="url(#${id})" stroke="${l}" stroke-width="2.5"/><path d="M32 9 l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z" fill="${l}"/>`;
 else if(k==='qual'||k==='po') shape=`<path d="M32 3 L57 17 L57 47 L32 61 L7 47 L7 17 Z" fill="url(#${id})" stroke="${l}" stroke-width="2.5"/><path d="M14 20 H50" stroke="${l}" stroke-width="1.5" opacity=".6"/>`;
 else if(k==='nl') shape=`<circle cx="32" cy="32" r="28" fill="url(#${id})" stroke="${l}" stroke-width="2.5"/><circle cx="32" cy="32" r="22" fill="none" stroke="${l}" stroke-width="1" stroke-dasharray="3 3" opacity=".7"/>`;
 else if(k==='y'||k==='loc') shape=`<rect x="6" y="6" width="52" height="52" rx="14" fill="url(#${id})" stroke="${l}" stroke-width="2.5"/><path d="M12 18 Q32 8 52 18" stroke="${l}" stroke-width="1.5" fill="none" opacity=".7"/>`;
 else shape=`<circle cx="32" cy="32" r="28" fill="url(#${id})" stroke="${l}" stroke-width="2.5"/>`;
 return `<svg class="badge ${cls||''}" viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${m}"/><stop offset="1" stop-color="#0a1a30"/></linearGradient></defs>${shape}<text x="32" y="${k==='final'||c.cup?43:38}" text-anchor="middle" font-family="Oswald,Inter,sans-serif" font-weight="700" font-size="${fs}" fill="#fff">${sh}</text></svg>`; };
N.trophySvg=(gold=true)=>{ const id='t'+(uid++); const a=gold?'#ffe28a':'#e8eef5', b=gold?'#c8901c':'#8a97a8';
 return `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><path d="M18 8 H46 V22 Q46 38 32 40 Q18 38 18 22 Z" fill="url(#${id})"/><path d="M18 12 H9 Q8 26 20 28 M46 12 H55 Q56 26 44 28" fill="none" stroke="url(#${id})" stroke-width="3.5" stroke-linecap="round"/><rect x="29" y="39" width="6" height="9" fill="url(#${id})"/><rect x="20" y="48" width="24" height="8" rx="2" fill="url(#${id})"/><path d="M24 12 Q24 26 30 32" stroke="#fff" stroke-opacity=".55" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`; };
N.crest=()=>`<svg class="crest" viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="cr1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#36e38c"/><stop offset="1" stop-color="#0b6b3a"/></linearGradient><linearGradient id="cr2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#14365e"/><stop offset="1" stop-color="#071526"/></linearGradient></defs><path d="M60 4 L108 18 L104 64 Q98 96 60 116 Q22 96 16 64 L12 18 Z" fill="url(#cr2)" stroke="url(#cr1)" stroke-width="5"/><circle cx="60" cy="60" r="26" fill="#fff"/><path d="M60 42 l10 7 -4 12 h-12 l-4 -12z" fill="#0b1b30"/><path d="M60 34 v8 M70 49 l8 -3 M66 61 l5 9 M54 61 l-5 9 M50 49 l-8 -3" stroke="#0b1b30" stroke-width="3" stroke-linecap="round"/><path d="M40 22 l2 4 4 .5 -3 3 .8 4 -3.8-2 -3.8 2 .8-4 -3-3 4-.5z M60 16 l2.4 4.8 5.3.8 -3.8 3.7 .9 5.2 -4.8-2.5 -4.8 2.5 .9-5.2 -3.8-3.7 5.3-.8z M80 22 l2 4 4 .5 -3 3 .8 4 -3.8-2 -3.8 2 .8-4 -3-3 4-.5z" fill="#f6c445"/></svg>`;
N.ballSvg=()=>`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#fff" stroke="#0b1b30" stroke-width="1.4"/><path d="M12 7.2 l4.2 3 -1.6 4.9 h-5.2 l-1.6-4.9z" fill="#0b1b30"/><path d="M12 2.2 V7.2 M16.2 10.2 l4.8-1.6 M14.6 15.1 l3 4.1 M9.4 15.1 l-3 4.1 M7.8 10.2 L3 8.6" stroke="#0b1b30" stroke-width="1.3"/></svg>`;
N.cardSvg=col=>`<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="3" width="12" height="18" rx="2" fill="${col}" stroke="rgba(0,0,0,.4)" transform="rotate(8 12 12)"/></svg>`;
// радар характеристик
N.radar=(labels,vals,col)=>{ const n=labels.length, R=78, cx=120, cy=105; const pt=(i,r)=>{ const a=-Math.PI/2+i*2*Math.PI/n; return [cx+Math.cos(a)*r, cy+Math.sin(a)*r]; };
 const ring=f=>labels.map((_,i)=>pt(i,R*f).map(v=>v.toFixed(1)).join(',')).join(' ');
 const poly=vals.map((v,i)=>pt(i,R*Math.max(.05,v/100)).map(x=>x.toFixed(1)).join(',')).join(' ');
 return `<svg class="radar" viewBox="0 0 240 210" aria-hidden="true">${[.25,.5,.75,1].map(f=>`<polygon points="${ring(f)}" fill="${f===1?'rgba(255,255,255,.03)':'none'}" stroke="rgba(255,255,255,.14)"/>`).join('')}${labels.map((_,i)=>{const [x,y]=pt(i,R);return `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="rgba(255,255,255,.1)"/>`;}).join('')}
 <polygon points="${poly}" fill="${col}" fill-opacity=".35" stroke="${col}" stroke-width="2.2" stroke-linejoin="round"/>${vals.map((v,i)=>{const [x,y]=pt(i,R*Math.max(.05,v/100));return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" fill="#fff"/>`;}).join('')}
 ${labels.map((l,i)=>{const [x,y]=pt(i,R+17);return `<text x="${x.toFixed(1)}" y="${(y+4).toFixed(1)}" text-anchor="middle" font-size="11" font-weight="600" fill="#b9c9de">${l} <tspan fill="#fff" font-weight="800">${vals[i]}</tspan></text>`;}).join('')}</svg>`; };
})();

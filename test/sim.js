// Headless-тест: node test/sim.js [лет] [команда]
globalThis.console=console;
require('../js/i18n.js');require('../js/data.js');require('../js/names.js');require('../js/core.js');require('../js/comps.js');require('../js/world.js');require('../js/match.js');
const N=NFM; const years=+(process.argv[2]||4.5), team=process.argv[3]||'RU';
const t0=Date.now(); const S=N.newGame(team,'Тест'); N.setS(S);
const until=N.ds(2026+Math.floor(years),1+Math.round((years%1)*12),1);
let n=0,goals=0,hw=0,dr=0,favW=0,favN=0,ups=0, dist={}; const seen=new Set();
const allF=[]; const ev={var:0,pen:0,fk:0,yc:0,rc:0,inj:0,et:0,ps:0,add:0,hn:0,hw:0,hd:0}; const _pf=N.playFix; N.playFix=(f,m)=>{_pf(f,m); allF.push(f); for(const e of m.ev){ if(e.t==='var')ev.var++; if(e.t==='goal'&&e.pen)ev.pen++; if(e.t==='goal'&&e.fk)ev.fk++; if(e.t==='yc')ev.yc++; if(e.t==='rc')ev.rc++; if(e.t==='inj')ev.inj++; if(e.t==='add')ev.add++; } if(m.extra)ev.et++; if(m.pens)ev.ps++; if(!f.neu){ const H=S.T[f.h],A=S.T[f.a]; if(Math.abs(H.r-A.r)<4){ev.hn++; if(m.score[0]>m.score[1])ev.hw++; else if(m.score[0]===m.score[1])ev.hd++;}} };
let res; do{ res=N.advance({autoUser:true,until}); }while(res.stop!=='until'&&res.stop!=='end'&&res.stop!=='guard');
for(const f of allF){ if(!f.r)continue; n++; const g=f.r.hg+f.r.ag; goals+=g; dist[g]=(dist[g]||0)+1; if(f.r.hg===f.r.ag)dr++; if(!f.neu&&f.r.hg>f.r.ag)hw++;
 const H=S.T[f.h],A=S.T[f.a]; const diff=(H.r-A.r); if(Math.abs(diff)>=8){ favN++; const fav=diff>0?0:1; const w=f.r.hg>f.r.ag?0:f.r.hg<f.r.ag?1:-1; if(w===fav)favW++; else if(w===1-fav)ups++; } }
console.log('стоп:',res.stop,'дата',S.d,'время',(Date.now()-t0)+'мс');
console.log('матчей',n,'голов/матч',(goals/n).toFixed(2),'ничьи',(dr/n*100).toFixed(1)+'%','фаворит (разница>=8) побеждает',(favW/favN*100).toFixed(1)+'%','сенсаций',(ups/favN*100).toFixed(1)+'%');
console.log('на матч: VAR',(ev.var/allF.length).toFixed(3),'пен-голы',(ev.pen/allF.length).toFixed(2),'голы со штрафных',(ev.fk/allF.length).toFixed(3),'ЖК',(ev.yc/allF.length).toFixed(2),'КК',(ev.rc/allF.length).toFixed(3),'травм',(ev.inj/allF.length).toFixed(2),'д.в.',ev.et,'серий',ev.ps,'равные дома: побед',(ev.hw/ev.hn*100).toFixed(0)+'% ничьих',(ev.hd/ev.hn*100).toFixed(0)+'%');
console.log('распределение тоталов',JSON.stringify(dist));
const arch=S.arch.concat(Object.values(S.C).filter(c=>c.stage==='done'&&c.w).map(c=>({n:c.n,w:c.w})));
for(const a of arch) if(a.w&&(a.kind==='final'||!a.kind||a.kind==='nl')) console.log('🏆',a.n,'—',S.T[a.w].n);
for(const c of Object.values(S.C)) if(c.kind==='final'&&c.w) { const ts=N.topScorers(c.id)[0]; console.log('  бомбардир',c.n,ts&&ts.n,ts&&ts.g); }
const pend=Object.values(S.C).filter(c=>c.stage!=='done'&&c.kind!=='fr').map(c=>c.id+':'+c.stage); console.log('незавершённые',pend.join(' '));
const top=Object.values(S.T).sort((a,b)=>b.elo-a.elo).slice(0,10).map(t=>t.n+' '+t.elo+' ('+t.str+')'); console.log('топ-10 Эло:',top.join(', '));
console.log('сборная',S.T[S.me].n,'стат',JSON.stringify(S.u.stat),'доверие',S.u.trust,'трофеи',S.u.tro.map(t=>t.n).join('; '),'игроков в S.P',Object.keys(S.P).length);
const js=JSON.stringify(S); console.log('размер сейва',(js.length/1024).toFixed(0)+'КБ');
const wc=Object.values(S.C).find(c=>c.id.startsWith('WC')); if(wc&&wc.teams) console.log('ЧМ участники',wc.teams.length);
// проверки
const bad=S.F.filter(f=>f.r&&(isNaN(f.r.hg)||isNaN(f.r.ag))); if(bad.length) throw new Error('NaN результаты');
for(const id in S.P){const p=S.P[id]; if(isNaN(p.o)||isNaN(p.form)||isNaN(p.mor)) throw new Error('NaN игрок '+JSON.stringify(p));}

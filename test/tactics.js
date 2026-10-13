// Влияние тактики на матч: node test/tactics.js [матчей на вариант] [команда] [соперник]
// Каждый вариант сравнивается с базовой (стандартной) тактикой против одного и того же соперника на нейтральном поле.
const seed=7; let s=seed>>>0; Math.random=()=>{s=(s+0x6D2B79F5)|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
['i18n','data','names','core','comps','world','match','v6','v7','v9','v10'].forEach(f=>require('../js/'+f+'.js'));
const N=NFM; const n=+(process.argv[2]||1200), A=process.argv[3]||'PL', B=process.argv[4]||'UA';
const S=N.newGame(A,'T'); N.setS(S); N.v6.init(S);
const DEF=()=>JSON.parse(JSON.stringify(N.v10.DEF));
const base=(c)=>{ const t=N.setup(c,{h:A,a:B,neu:1}); return t; };
const fit0={}; for(const id in S.P) fit0[id]=S.P[id].fit;
function run(mod,opt={}){ s=seed>>>0; const r={gf:0,ga:0,w:0,d:0,poss:0,sh:0,sha:0,xg:0,xga:0,yc:0,fo:0,fit:0,off:0,co:0,hd:0,spg:0,spga:0,n:0};
 for(let i=0;i<n;i++){ for(const id in S.P) S.P[id].fit=100;
  const h=base(A), a=base(B); const form=opt.form||'4-3-3'; h.tac=DEF(); a.tac=DEF(); h.instr={}; a.instr={};
  if(opt.form||opt.roles){ const lu=N.autoLineup(N.pool(A).filter(p=>!p.inj).slice(0,30),form); const F=N.FORMS[form]; const FR=(N.FORMR[form]||{}); h.on=lu.xi.map((p,i)=>({p,role:F[i][0],pr:(opt.roles&&opt.roles(F[i][0],i))||FR[i]||null})); h.bench=lu.bench; }
  else { const lu=N.autoLineup(N.pool(A).filter(p=>!p.inj).slice(0,30),'4-3-3'); const F=N.FORMS['4-3-3']; h.on=lu.xi.map((p,i)=>({p,role:F[i][0]})); h.bench=lu.bench; }
  { const lu=N.autoLineup(N.pool(B).filter(p=>!p.inj).slice(0,30),'4-3-3'); const F=N.FORMS['4-3-3']; a.on=lu.xi.map((p,i)=>({p,role:F[i][0]})); a.bench=lu.bench; }
  if(mod) mod(h.tac,a.tac,h,a); if(opt.user){ h.user=true; }
  const m=new N.Match(h,a,{neutral:true,autoUser:!opt.user}); m.sim();
  r.gf+=m.score[0]; r.ga+=m.score[1]; if(m.score[0]>m.score[1])r.w++; else if(m.score[0]===m.score[1])r.d++;
  const P=m.st[0].poss+m.st[1].poss; r.poss+=m.st[0].poss/P; r.sh+=m.st[0].sh; r.sha+=m.st[1].sh; r.xg+=m.st[0].xg; r.xga+=m.st[1].xg; r.yc+=m.st[0].yc+m.st[0].rc; r.fo+=m.st[0].fo; r.off+=m.st[1].off; r.co+=m.st[0].co;
  r.hd+=m.ev.filter(e=>e.t==='goal'&&e.side===0&&/голов|голов/.test(e.txt)).length;
  r.spg+=m.ev.filter(e=>e.side===0&&e.t==='goal'&&m.ev[m.ev.indexOf(e)-1]&&m.ev[m.ev.indexOf(e)-1].t==='corner').length;
  r.spga+=m.ev.filter(e=>e.side===1&&e.t==='goal'&&m.ev[m.ev.indexOf(e)-1]&&m.ev[m.ev.indexOf(e)-1].t==='corner').length;
  const on=h.on.filter(e=>e.role!=='GK'); r.fit+=on.reduce((x,e)=>x+e.p._mfit,0)/on.length; r.n++; }
 for(const k in r) if(k!=='n') r[k]/=r.n; return r; }
const B0=run(null); const rows=[];
const f=(v,d=2)=>(v>=0?'+':'')+v.toFixed(d);
function row(name,r,expect){ const d={gf:r.gf-B0.gf,ga:r.ga-B0.ga,poss:(r.poss-B0.poss)*100,sh:r.sh-B0.sh,sha:r.sha-B0.sha,yc:r.yc-B0.yc,fo:r.fo-B0.fo,fit:r.fit-B0.fit,off:r.off-B0.off,co:r.co-B0.co,sp:r.spg-B0.spg,spa:r.spga-B0.spga,pts:(3*r.w+r.d-3*B0.w-B0.d)};
 let ok=''; if(expect){ ok=expect(d)?'OK':'??'; } rows.push([name,d,ok]);
 console.log(name.padEnd(28),`GF ${f(d.gf)} GA ${f(d.ga)} Pos ${f(d.poss,1)}% Sh ${f(d.sh,1)} ShA ${f(d.sha,1)} Cards ${f(d.yc)} Fouls ${f(d.fo,1)} Fit ${f(d.fit,1)} OppOff ${f(d.off,2)} Cor ${f(d.co,1)} SPg ${f(d.sp,3)} SPga ${f(d.spa,3)} Pts ${f(d.pts,2)} ${ok}`); }
console.log(`baseline ${A} v ${B} (n=${n}): GF ${B0.gf.toFixed(2)} GA ${B0.ga.toFixed(2)} poss ${(B0.poss*100).toFixed(1)}% sh ${B0.sh.toFixed(1)}/${B0.sha.toFixed(1)} cards ${B0.yc.toFixed(2)} fit ${B0.fit.toFixed(1)} oppOff ${B0.off.toFixed(2)} cor ${B0.co.toFixed(1)}`);
const T=(k,v)=>t=>{t[k]=v;};
console.log('--- instructions');
row('mentality -2 (bus)',run(T('ment',-2)),d=>d.gf<0&&d.ga<0);
row('mentality -1',run(T('ment',-1)),d=>d.gf<0&&d.ga<0);
row('mentality +1',run(T('ment',1)),d=>d.gf>0&&d.ga>0);
row('mentality +2 (all out)',run(T('ment',2)),d=>d.gf>0&&d.ga>0);
row('def. line low',run(T('line',0)),d=>d.off<0&&d.poss<0);
row('def. line high',run(T('line',2)),d=>d.off>0&&d.poss>0&&d.sha<0);
row('pressing low',run(T('press',0)),d=>d.fit>0&&d.poss<0);
row('pressing high',run(T('press',2)),d=>d.fit<0&&d.poss>0&&d.fo>0);
row('width narrow',run(T('width',0)),d=>d.co<0);
row('width wide',run(T('width',2)),d=>d.co>0&&d.sh>0);
row('tempo slow',run(T('tempo',0)),d=>d.sh<0&&d.fit>0);
row('tempo fast',run(T('tempo',2)),d=>d.sh>0&&d.fit<0);
row('passing short',run(T('pass',0)),d=>d.poss>0);
row('passing direct',run(T('pass',2)),d=>d.poss<0);
row('style possession',run(T('style','poss')),d=>d.poss>0&&d.sha<0);
row('style counter',run(T('style','counter')),d=>d.poss<0);
row('offside trap',run(T('trap',1)),d=>d.off>0);
row('time-wasting (when ahead)',run(T('waste',1)),d=>d.sha<0&&d.yc>0);
row('tackling cautious',run(T('tackle',0)),d=>d.yc<0&&d.fo<0);
row('tackling aggressive',run(T('tackle',2)),d=>d.yc>0&&d.fo>0);
row('focus left',run(T('focus','l')),null);
row('focus centre',run(T('focus','c')),null);
row('focus wings',run(T('focus','w')),d=>d.co>0);
console.log('--- set pieces');
row('corners near post',run(t=>{t.sp.rt='near';}),d=>d.sp>0);
row('corners far post',run(t=>{t.sp.rt='far';}),null);
row('corners short',run(t=>{t.sp.rt='short';}),d=>d.sp<0);
row('defending corners man',run(t=>{t.sp.mk='man';}),d=>d.spa<0);
row('pen/fk/ck takers set',run((t,o,h)=>{ const on=h.on.filter(e=>e.role!=='GK'); const worst=on.sort((a,b)=>(a.p.tec+a.p.pas)-(b.p.tec+b.p.pas))[0]; t.sp.ck=worst.p.id; t.sp.fk=worst.p.id; t.sp.pk=[worst.p.id]; }),d=>d.gf<0);
console.log('--- opponent instructions');
row('tight-mark their star',run((t,o,h,a)=>{ const st=a.on.filter(e=>e.role!=='GK').sort((x,y)=>y.p.att-x.p.att)[0]; t.opp={mark:st.p.id}; }),d=>d.ga<0&&d.fo>0);
row('show onto weaker foot',run(t=>{t.opp={foot:1};}),d=>d.ga<0);
console.log('--- in-match rules');
row('if losing after 70 -> attack',run(t=>{t.cond=[{w:'lose',min:70,a:'att'}];}),d=>d.pts>=-0.02);
row('if winning by 1 after 80 -> def',run(t=>{t.cond=[{w:'win1',min:80,a:'def'}];}),d=>d.ga<=0.01);
{ const U0=run(null,{user:true}), U1=run(t=>{t.asub=80;},{user:true}); console.log('auto-sub tired < 80% (vs manual, no subs): avg end fitness',f(U1.fit-U0.fit,1),'GF',f(U1.gf-U0.gf),'GA',f(U1.ga-U0.ga)); rows.push(['auto-sub',{},U1.fit>U0.fit?'OK':'??']); }
console.log('--- player roles (all eligible slots, 4-3-3)');
const RR=(k,pos)=>({roles:(role)=>(pos.includes(role)&&N.ROLEOPT[role].includes(k))?k:null,form:'4-3-3'});
const B1=B0; 
row('GK sweeper keeper',run(null,RR('sk',['GK'])),d=>d.ga<0);
row('CB ball-playing',run(null,RR('bpd',['CB'])),d=>d.poss>0);
row('CB stopper',run(null,RR('stp',['CB'])),d=>d.fo>0);
row('FB wing-back attacking',run(null,RR('wb',['LB','RB'])),d=>d.gf>0&&d.sh>0);
row('FB inverted',run(null,RR('ifb',['LB','RB'])),d=>d.poss>0);
row('DM anchor',run(null,RR('anc',['DM'])),d=>d.ga<0);
row('DM deep-lying playmaker',run(null,RR('dlp',['DM'])),d=>d.poss>0);
row('DM ball-winner/destroyer',run(null,RR('bwm',['DM'])),d=>d.fo>0);
row('CM box-to-box',run(null,RR('b2b',['CM'])),d=>d.fit<0);
row('CM advanced playmaker',run(null,RR('ap',['CM'])),d=>d.gf>0);
row('W winger',run(null,RR('w',['LW','RW'])),d=>d.co>0||d.gf>0);
row('W inside forward',run(null,RR('if',['LW','RW'])),d=>d.gf>0);
row('ST target man',run(null,RR('tm',['ST'])),null);
row('ST poacher',run(null,RR('p',['ST'])),d=>d.gf>0);
row('ST false 9',run(null,RR('f9',['ST'])),d=>d.poss>0);
row('ST pressing forward',run(null,RR('pf',['ST'])),d=>d.sha<0);
console.log('--- formations (auto-picked XI, default roles)');
for(const fm of Object.keys(N.FORMS)) row('formation '+fm,run(null,{form:fm,roles:()=>null}),null);
console.log('--- presets');
const PR={}; for(const k in N.v10.PRESETS){ const P=N.v10.PRESETS[k]; const r=run(t=>{Object.assign(t,JSON.parse(JSON.stringify(P.t)));},{form:P.form,roles:()=>null}); PR[k]=r; row('preset '+k+' ('+P.form+')',r,null); }
const ks=Object.keys(PR); let minD=1e9; for(let i=0;i<ks.length;i++) for(let j=i+1;j<ks.length;j++){ const a=PR[ks[i]],b=PR[ks[j]]; const dd=Math.abs(a.gf-b.gf)+Math.abs(a.ga-b.ga)+Math.abs(a.poss-b.poss)*10+Math.abs(a.fit-b.fit)/5; minD=Math.min(minD,dd); }
console.log('presets min pairwise distance',minD.toFixed(3));
const bad=rows.filter(r=>r[2]==='??'); console.log(`directional checks: ${rows.filter(r=>r[2]==='OK').length} OK, ${bad.length} unexpected${bad.length?': '+bad.map(r=>r[0]).join(', '):''}`);

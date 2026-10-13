// QA harness: node test/qa20.js YEARS TEAM SEED
const seed=+(process.argv[4]||1); let s=seed>>>0; Math.random=()=>{s=(s+0x6D2B79F5)|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
['i18n','data','names','core','comps','world','match','v6','v7','v9','v10','v101'].forEach(f=>require('../js/'+f+'.js'));
const N=NFM, years=+(process.argv[2]||20), team=process.argv[3]||'FR';
const errs=[]; const oe=console.error; process.on('uncaughtException',e=>{errs.push(String(e.stack).slice(0,300));});
const _su=N.setup; let nullXI=0; N.setup=(c,fx)=>{const r=_su(c,fx); if(r.on.length<11||r.on.some(e=>!e.p))nullXI++; return r;};
const OUT=process.env.QA_OUT||'/tmp/nfm-qa/'; require('fs').mkdirSync(OUT,{recursive:true});
const S=N.newGame(team,'QA'); N.setS(S); N.v6.init(S);
const fires=[]; const _cj=N.checkJob; N.checkJob=(b)=>{const was=S.u.fired; _cj(b); if(S.u.fired&&!was){const st=S.u.stat; fires.push({d:S.d,trust:S.u.trust,me:S.me,w:st.w,d_:st.d,l:st.l}); S.u.fired=0; S._stop=null; S.u.trust=55;}}; let trMin=100;
const out={team,seed,years:[],matches:[],winners:[],errs,nan:[]};
const _pf=N.playFix; N.playFix=(f,m)=>{ try{_pf(f,m);}catch(e){errs.push('playFix '+String(e).slice(0,200));return;} const H=S.T[f.h],A=S.T[f.a];
 out.matches.push([S.d.slice(0,4),f.c||'',f.neu?1:0,m.score[0],m.score[1],H.str||0,A.str||0,N.fifaRank(f.h)||0,N.fifaRank(f.a)||0,m.extra?1:0,m.pens?1:0]); };
const top10=()=>N.fifaOrder().slice(0,10);
let prevTop=top10(), t10changes=0, months=0, lastM=S.d.slice(0,7);
for(let y=1;y<=years;y++){ const until=N.ds(2026+y,1,1); const t0=Date.now(); let res;
 do{ try{res=N.advance({autoUser:true,until,steps:40});}catch(e){errs.push('advance '+S.d+' '+String(e.stack).slice(0,300)); res={stop:'err'}; break;}
  trMin=Math.min(trMin,S.u.trust); const m=S.d.slice(0,7); if(m!==lastM){lastM=m; const t=top10(); if(t.join()!==prevTop.join()){t10changes++;} months++; prevTop=t;}
 }while(res.stop==='step');
 const ms=Date.now()-t0; const T=Object.values(S.T);
 for(const t of T){ for(const k of ['str','r','elo','pts']) if(t[k]!=null&&(!isFinite(t[k])||t[k]<0)) out.nan.push([S.d,t.c,k,t[k]]); }
 let save=0; try{save=JSON.stringify(S,(k,v)=>k[0]==='_'?undefined:v).length;}catch(e){errs.push('stringify '+e);}
 const strs=T.map(t=>t.str||0).sort((a,b)=>b-a);
 out.years.push({y:2026+y,stop:res.stop,d:S.d,ms,save,bud:S.u.bud,eco:S.u.eco&&S.u.eco.h.slice(-12),fired:!!S.u.fired,me:S.me,trust:S.u.trust,
  strTop:strs[0],strMed:strs[Math.floor(strs.length/2)],strMin:strs[strs.length-1],strMean:strs.reduce((a,b)=>a+b,0)/strs.length,
  rk:Object.fromEntries(N.fifaOrder().map((c,i)=>[c,i+1])),str:Object.fromEntries(T.map(t=>[t.c,t.str])),top10:top10(),t10changes,months,
  bids:S.bids?JSON.stringify(S.bids).slice(0,400):null,players:Object.keys(S.P).length});
 if(res.stop==='err'||res.stop==='end') break; }
const all=(S.arch||[]).concat(Object.values(S.C).filter(c=>c.stage==='done'&&c.w).map(c=>({n:c.n,w:c.w,kind:c.kind,id:c.id})));
out.winners=all.map(a=>[a.id||'',a.n,a.w,a.kind||'']);
out.nullXI=nullXI; out.fires=fires; out.trMin=trMin; out.hostsCo=S.hostsCo; out.wcH=S.wcH; out.pending=Object.values(S.C).filter(c=>c.stage!=='done'&&c.kind!=='fr'&&c.yr&&c.yr<2026+years-2).map(c=>c.id+':'+c.stage);
out.hosts=S.hosts; out.T=Object.fromEntries(Object.values(S.T).map(t=>[t.c,{n:t.n,conf:t.conf}]));
// tournament group conf check
out.groupViol=[]; for(const c of Object.values(S.C)){ if(!Array.isArray(c.groups)||!c.groups.length)continue; if(!/^(WC|EURO|COPA|ASIAN|AFCON|GOLD)/.test(c.id))continue;
 c.groups.forEach((g,i)=>{const teams=(g.t||g.teams||g); if(!Array.isArray(teams))return; const cnt={}; teams.forEach(x=>{const cf=S.T[x]&&S.T[x].conf; cnt[cf]=(cnt[cf]||0)+1;}); for(const k in cnt) if(c.id.startsWith('WC')&&(k!=='UEFA'&&cnt[k]>1||cnt[k]>2)) out.groupViol.push(c.id+' g'+i+' '+k+'x'+cnt[k]);}); }
out.wcGroups=Object.values(S.C).filter(c=>/^WC_/.test(c.id)&&c.groups).map(c=>({id:c.id,host:c.host,g:c.groups.map(g=>(g.t||g.teams||g))}));
require('fs').writeFileSync(OUT+`run_${team}_${seed}.json`,JSON.stringify(out));
console.log(team,seed,'done',out.years.length,'yrs',out.matches.length,'matches errs',errs.length);

// Сводка QA: node test/qa_report.js [dir]
const fs=require('fs'); const D=(process.argv[2]||process.env.QA_OUT||'/tmp/nfm-qa/').replace(/\/?$/,'/');
const files=fs.readdirSync(D).filter(f=>/^run_.*\.json$/.test(f)).sort(); let M=[]; const R={};
for(const f of files){const o=JSON.parse(fs.readFileSync(D+f)); R[f]=o; M=M.concat(o.matches);}
const pct=(a,b)=>(100*a/Math.max(1,b)).toFixed(1)+'%'; const n=M.length;
const res=m=>m[3]>m[4]?0:m[3]<m[4]?1:-1;
const g=M.reduce((s,m)=>s+m[3]+m[4],0), dr=M.filter(m=>m[3]===m[4]).length, d11=M.filter(m=>m[3]===1&&m[4]===1).length;
const rk=M.filter(m=>m[7]&&m[8]&&m[7]!==m[8]); const favR=rk.filter(m=>res(m)===(m[7]<m[8]?0:1)).length;
const g25=M.filter(m=>Math.abs(m[5]-m[6])>=25); const fav25=g25.filter(m=>res(m)===(m[5]>=m[6]?0:1)).length;
const eq=M.filter(m=>!m[2]&&Math.abs(m[5]-m[6])<3); const eqH=eq.filter(m=>m[3]>m[4]).length;
console.log(`matches ${n} goals ${(g/n).toFixed(2)} draws ${pct(dr,n)} 1-1 ${pct(d11,n)} favRank ${pct(favR,rk.length)} gap25+fav ${pct(fav25,g25.length)} (n=${g25.length}) margin5+ ${pct(M.filter(m=>Math.abs(m[3]-m[4])>=5).length,n)} homeEq ${pct(eqH,eq.length)}`);
for(const [f,o] of Object.entries(R)){ const Y=o.years, a=Y[0], z=Y[Y.length-1];
 const cs=Object.keys(a.str).filter(c=>c in z.str); const sorted=cs.slice().sort((x,y)=>a.str[x]-a.str[y]); const third=Math.floor(sorted.length/3);
 const dr=l=>(l.reduce((s,c)=>s+z.str[c]-a.str[c],0)/l.length).toFixed(1);
 const eh=Y.flatMap(y=>y.eco||[]); const st=eh.reduce((s,e)=>s+(e.stad||0),0), tix=eh.reduce((s,e)=>s+(e.tix||0),0);
 console.log(`${f} yrs ${Y.length} errs ${o.errs.length} nullXI ${o.nullXI} nan ${o.nan.length} | str ${a.strMean.toFixed(1)}->${z.strMean.toFixed(1)} weak ${dr(sorted.slice(0,third))} mid ${dr(sorted.slice(third,2*third))} top ${dr(sorted.slice(2*third))} user ${(z.str[o.team]-a.str[o.team]).toFixed(1)} | bud ${Y.map(y=>Math.round(y.bud)).filter((_,i)=>i%4===0||i===Y.length-1).join(',')} | stad net ${(st+tix).toFixed(0)} (tix ${tix.toFixed(0)} cost ${st.toFixed(0)}) | save ${(z.save/1048576).toFixed(2)}MB max ${(Math.max(...Y.map(y=>y.save))/1048576).toFixed(2)} ms last ${z.ms} max ${Math.max(...Y.map(y=>y.ms))} | fires ${(o.fires||[]).map(x=>x.d.slice(0,4)+'@'+x.trust+'('+x.w+'-'+x.d_+'-'+x.l+')').join(' ')} trMin ${o.trMin}`);
 if(o.errs.length) console.log('  ERR',o.errs[0].slice(0,200));
 const H=o.hosts||{}, HC=o.hostsCo||{}; const rep=[]; const byC={};
 for(const k of Object.keys(H).sort((a,b)=>a.slice(-4)-b.slice(-4))){ const m=k.match(/^([A-Z]+?)2?(\d{4})$/); if(!m) continue; const kk=m[1]==='AFCON'?'AFCON':m[1], y=+m[2]; for(const c of [H[k],HC[k]].filter(Boolean)){ const l=byC[kk+c]=byC[kk+c]||[]; if(l.some(x=>y-x<(kk==='WC'?20:12)))rep.push(kk+':'+c+'@'+y); l.push(y);} }
 const wc=(o.wcH||[]).map(x=>x.y+':'+x.c+(x.co?'+'+x.co:'')).join(' ');
 console.log('  WC hosts',wc,'| host repeats within cooldown:',rep.join(' ')||'none');
}

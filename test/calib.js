require('../js/data.js');require('../js/names.js');require('../js/core.js');require('../js/comps.js');require('../js/world.js');require('../js/match.js');
const N=NFM; const S=N.newGame('ES','x'); N.setS(S);
const pairs=[['ES','FR'],['ES','PL'],['ES','GE'],['ES','LU'],['ES','SM'],['PL','GE'],['FI','LU'],['BR','BO']];
for(const [h,a] of pairs){ let g=[0,0],w=[0,0,0],n=300,mx=0; for(let i=0;i<n;i++){ const m=new N.Match(N.setup(h),N.setup(a),{neutral:true,autoUser:true}).sim(); for(const id in S.P)S.P[id].fit=100; g[0]+=m.score[0];g[1]+=m.score[1]; w[m.winner===0?0:m.winner===1?2:1]++; mx=Math.max(mx,m.score[0]+m.score[1]); }
 console.log(h,S.T[h].str,a,S.T[a].str,'голы',(g[0]/n).toFixed(2),(g[1]/n).toFixed(2),'П/Н/П',w.map(x=>(x/n*100).toFixed(0)).join('/'),'макс',mx); }

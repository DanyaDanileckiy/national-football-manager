// Проверка жеребьёвок: node test/draw.js [лет]
require('../js/i18n.js');require('../js/data.js');require('../js/names.js');require('../js/core.js');require('../js/comps.js');require('../js/world.js');require('../js/match.js');require('../js/v6.js');require('../js/v7.js');require('../js/v9.js');require('../js/v10.js');
const N=NFM; const S=N.newGame('FR','Тест'); N.setS(S); N.v6.init(S); const years=+(process.argv[2]||5);
const KO=[],GR=new Map(); const _sk=N.startKO; N.startKO=(c,se,pa)=>{ _sk(c,se,pa); if(c.conf==='ALL'&&c.po&&!c.cup&&c.ko.length===1) KO.push([c.id,c.ko[0].map(p=>[p.h,p.a])]); };
const _m=N.fn.month; N.fn.month=e=>{ _m(e); for(const c of Object.values(S.C)) if(c.conf==='ALL'&&c.groups&&c.groups.length>1&&!GR.has(c.id)) GR.set(c.id,c.groups.map(g=>g.t.slice())); };
const until=N.ds(2026+years,1,1); let res; do{ res=N.advance({autoUser:true,until}); }while(res.stop!=='until'&&res.stop!=='end'&&res.stop!=='guard');
const cap=c=>c==='UEFA'?2:1; let bad=0,chk=0,ko=0,kob=0;
for(const [id,gs] of GR){ { for(const g of gs){ const n={}; for(const t of g) n[S.T[t].conf]=(n[S.T[t].conf]||0)+1; chk++; if(Object.entries(n).some(([k,v])=>v>cap(k))){ bad++; console.log('нарушение',id,JSON.stringify(n)); } } }
} for(const [id,ps] of KO) for(const [h,a] of ps){ ko++; if(S.T[h].conf===S.T[a].conf){ kob++; console.log('пара одной конфедерации',id,h,a); } }
console.log('турниров',GR.size,'групп проверено',chk,'нарушений',bad,'| пар плей-офф',ko,'одной конф.',kob,'| снимков силы',S.strH.length,'дайджестов',S.u.dg.list.length);
const m=N.v7.movers(12,3); console.log('рост за год',m.up.map(x=>x.c+' +'+x.d).join(', '),'падение',m.dn.map(x=>x.c+' '+x.d).join(', '));
const d=S.u.dg.list[0]; if(d) console.log('дайджест',d.n,d.m.slice(0,4).map(x=>`${x.h} ${x.hg}:${x.ag} ${x.a} (${x.s})`).join('; '));
console.log('кит',JSON.stringify(S.u.kit.off[0]||S.u.kit.sup),'эко',JSON.stringify(S.u.eco.m));
process.exit(bad||kob?1:0);

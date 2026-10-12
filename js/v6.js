// Обновление 6: расширенная статистика, история, экономика и стадионы, тренировки, заявки на турниры, читы
(function(){
const N=NFM; const G=()=>N.getS(); const {R,cl,ri,pick,shuffle}=N;
const V6=N.v6={};
// ---------- детерминированный ГСЧ ----------
const rng=seed=>{ let a=seed>>>0||1; return ()=>{ a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; };
const hs=s=>parseInt(NFM_I18N.hash(String(s)),36);
const seeded=(seed,fn)=>{ const old=N._rng; const r=rng(hs(seed)); N._rng=r; try{ return fn(r); } finally{ N._rng=old; } };
V6.rng=rng; V6.seeded=seeded;
const wpick=(arr,wf,r=R)=>{ let s=0; const w=arr.map(x=>{const v=Math.max(0,wf(x)); s+=v; return v;}); let q=r()*s; for(let i=0;i<arr.length;i++){ q-=w[i]; if(q<=0) return arr[i]; } return arr[arr.length-1]; };
const rankOf=c=>N.fifaRank(c)||100;
// ---------- инициализация / миграция ----------
V6.init=(S)=>{ if(!S) return; N.setS(S); const u=S.u;
 u.eco=u.eco||{b0:u.bud,m:{},h:[]}; u.staff=u.staff||2; u.fam=u.fam||{tac:50,sp:50,f:(u.xi&&u.xi.form)||'4-3-3'};
 u.tr2=u.tr2||{auto:1,i:1,g:{G:'gk',D:'def',M:'tac',F:'att'},pl:{}};
 if(!u.st) u.st=genStadiums(S.me);
 S.hosts=S.hosts||{}; S.hostsCo=S.hostsCo||{}; S.wcH=S.wcH||[{y:2026,c:'US',conf:'CONCACAF'}];
 if(S.cyc&&S.C['WC_'+S.cyc.Y]&&!S.wcH.some(x=>x.y===S.cyc.Y+4)) S.wcH.push({y:S.cyc.Y+4,c:S.cyc.wcHost,conf:S.T[S.cyc.wcHost].conf});
 if(!S.bids&&S.cyc) openBids(S.cyc.Y);
 S.v6=1; };
// стадионы по умолчанию
function genStadiums(c){ const S=G(); const t=S.T[c]; return seeded('st'+c,r=>{ const n=cl(Math.round((t.r-38)/7+r()*1.5),1,9); const out=[]; const used=new Set();
  for(let i=0;i<n;i++){ let city; for(let k=0;k<20;k++){ city=N.townName(t.pool); if(!used.has(city))break; } city=city.charAt(0).toUpperCase()+city.slice(1); used.add(city);
   const big=Math.max(8,Math.round((11+(t.r-40)*0.8)*(i===0?1.35:0.95-i*0.07)+r()*7)); const cap=cl(big,6,90)*1000; const q=cl(Math.round((t.r-40)/12+r()*1.5),1,5);
   out.push({id:i+1,city,cap,q,main:i===0?1:0}); }
  return out; }); }
V6.mainSt=()=>{ const u=G().u; return (u.st||[]).find(s=>s.main&&!s.rd)||(u.st||[]).filter(s=>!s.rd).sort((a,b)=>b.cap-a.cap)[0]; };
// ---------- матч: удары, xG, пасы, отборы, единоборства, тепловые карты ----------
const MP=N.Match.prototype; const W=N.MW;
const BASE={GK:[5,50],CB:[22,50],LB:[30,14],RB:[30,86],DM:[38,50],CM:[50,50],AM:[64,50],LM:[56,14],RM:[56,86],LW:[72,16],RW:[72,84],ST:[82,50]};
const SPREAD={1:[50],2:[36,64],3:[26,50,74]};
MP._init6=function(){ this._trk=!!(this.t[0].user||this.t[1].user); if(!this._trk) return; this._sh=[]; this._ex={}; this._hm={}; this._hb=null; };
MP._e=function(id,s){ return this._ex[id]||(this._ex[id]=[0,0,0,0,0,0,0,s]); };
MP._base=function(){ const hb={}; for(const s of [0,1]){ const on=this.onPitch(s); const cnt={}; for(const e of on) cnt[e.role]=(cnt[e.role]||0)+1; const k={};
  for(const e of on){ const b=BASE[e.role]||[50,50]; let y=b[1]; if(b[1]===50&&cnt[e.role]>1){ const i=k[e.role]=(k[e.role]||0); k[e.role]++; y=(SPREAD[Math.min(3,cnt[e.role])]||[50])[Math.min(i,2)]; } hb[e.p.id]=[b[0],y]; } } this._hb=hb; };
MP._tick6=function(){ const s=this.possSide,o=1-s; const A=this.onPitch(s).filter(e=>e.role!=='GK'), D=this.onPitch(o).filter(e=>e.role!=='GK'); if(!A.length||!D.length) return;
 const X=this.str[s],Y=this.str[o]; const ctl=X.m/(X.m+Y.m);
 const np=2+Math.floor(R()*4)+(X.style==='short'?1:0)-(X.style==='long'?1:0);
 for(let i=0;i<np;i++){ const e=wpick(A,e=>W.mid[e.role]+.15); const P=this._e(e.p.id,s); P[0]++;
  const ok=R()<cl(0.64+((e.p.pas||50)-62)/110+(ctl-.5)*0.35-0.05*(Y.press-1)-(X.style==='long'?0.08:0),0.45,0.95); if(ok)P[1]++; else if(R()<.45){ const d=wpick(D,e=>W.def[e.role]+.2); this._e(d.p.id,o)[4]++; } }
 if(R()<0.5*Y.press){ const d=wpick(D,e=>W.def[e.role]+.2), a=wpick(A,e=>W.att[e.role]+.2); const pw=(d.p.def||50)/((d.p.def||50)+(a.p.tec||50)); const P=this._e(d.p.id,o), Q=this._e(a.p.id,s); P[2]++; if(R()<pw){P[3]++;P[5]++;Q[6]++;} else {P[6]++;Q[5]++;} }
 if(R()<0.3){ const a=pick(A), d=pick(D); const f=p=>(p.phy||50)+((p.h||180)-180)*1.5; const w=R()<f(a.p)/(f(a.p)+f(d.p)); this._e(a.p.id,s)[w?5:6]++; this._e(d.p.id,o)[w?6:5]++; }
 if(!this._hb||this.min%10===0) this._base();
 for(const sd of [0,1]){ if(!this.t[sd].user) continue; const bx=sd===0?this.ball[0]:100-this.ball[0], by=sd===0?this.ball[1]:100-this.ball[1];
  for(const e of this.onPitch(sd)){ const b=this._hb[e.p.id]||BASE[e.role]||[50,50]; const k=e.role==='GK'?0.08:0.33; const px=cl(b[0]*(1-k)+bx*k+(R()-.5)*16,0,99.9), py=cl(b[1]*(1-k*0.8)+by*k*0.8+(R()-.5)*18,0,99.9);
   const h=this._hm[e.p.id]||(this._hm[e.p.id]=new Array(96).fill(0)); h[Math.floor(py/12.5)*12+Math.floor(px/100*12)]++; } } };
const _step=MP.step; MP.step=function(){ if(this._trk===undefined) this._init6(); const r=_step.call(this); if(this._trk&&!this.done) this._tick6(); return r; };
const _rs=MP._resolveShot; MP._resolveShot=function(s,sh,xg,gkE,gkV,kf,pen,isHead,fk){ const S=G();
 if((pen||fk)&&this.t[s].user&&S&&S.u.fam) xg=cl(xg*(1+0.12*(S.u.fam.sp-50)/50),.01,.9);
 if(this._trk===undefined) this._init6(); if(!this._trk||!sh) return _rs.call(this,s,sh,xg,gkE,gkV,kf,pen,isHead,fk);
 const g0=this.score[s], sv0=gkE?this.ps[gkE.p.id].sv:0, n0=this.ev.length; _rs.call(this,s,sh,xg,gkE,gkV,kf,pen,isHead,fk);
 const goal=this.score[s]>g0, save=gkE&&this.ps[gkE.p.id].sv>sv0, vr=this.ev.length>n0&&this.ev[this.ev.length-1].t==='var';
 const one=!pen&&!fk&&!isHead&&xg>=0.28; let x,y;
 if(pen){x=88.5;y=50;} else if(fk){x=70+R()*9;y=22+R()*56;} else { const d=3+Math.pow(1-Math.min(1,xg/0.7),1.4)*32*(0.85+R()*0.3); const a=(R()-.5)*(one?1:isHead?1.3:2.3); x=cl(100-d*Math.cos(a),55,99); y=cl(50+d*Math.sin(a)*1.45,3,97); }
 this._sh.push([s,Math.round(x),Math.round(y),Math.round(xg*100),goal?'g':save?'s':vr?'v':'m',sh.p.id,this.min,pen?1:fk?2:isHead?3:one?4:0,gkE?gkE.p.id:0]); };
const _fin=MP.finish; MP.finish=function(){ const S=G();
 if(S&&S.cheat&&S.u.chw) for(const s of [0,1]) if(this.t[s].user){ const o=1-s; let k=0; while(this.tot(s)<=this.tot(o)&&k++<12){ const e=wpick(this.onPitch(s).filter(e=>e.role!=='GK'),e=>W.shot[e.role]+.1); if(!e)break; this.score[s]++; this.ps[e.p.id].g++; this.log({t:'goal',side:s,p:e.p.id,txt:`⚽ ${e.p.n} (${this.t[s].n}) — ${this.score.join(':')}`}); } this.pens=null; }
 return _fin.call(this); };
// ---------- после матча ----------
const hmStr=h=>{ const mx=Math.max(1,...h); return h.map(v=>Math.round(v/mx*35).toString(36)).join(''); };
const _pf=N.playFix; N.playFix=(f,m)=>{ _pf(f,m); const S=G(); if(!f.u||!f.r||!f.r.det||!m._trk) return; const side=f.h===S.me?0:1; const d=f.r.det;
 f.r.fm=S.u.xi&&S.u.xi.form; d.sh=m._sh; d.ex=m._ex; d.hm={}; for(const id in m._hm) d.hm[id]=hmStr(m._hm[id]);
 // в старых матчах тепловые карты не храним (экономия места)
 const us=S.F.filter(x=>x.u&&x.r&&x.r.det&&x.r.det.hm); for(const x of us.slice(0,-12)) delete x.r.det.hm;
 // карьерная статистика игроков сборной
 const X=id=>{ const p=S.P[id]; if(!p||p.t!==S.me) return null; return p.x||(p.x={sh:0,xg:0,g:0,o1:0,o1g:0,pk:0,pkg:0,pa:0,pc:0,tk:0,tkw:0,int:0,dw:0,dl:0,sot:0,sv:0,xga:0,ga:0,pf:0,ps:0,mt:0}); };
 for(const sh of m._sh){ const [s,,,xg,o,pid,,k,gk]=sh; const a=s===side?X(pid):null; if(a){ a.sh++; a.xg+=xg/100; if(o==='g')a.g++; if(k===4){a.o1++; if(o==='g')a.o1g++;} if(k===1){a.pk++; if(o==='g')a.pkg++;} }
  const g=s!==side?X(gk):null; if(g&&o!=='v'){ g.xga+=xg/100; if(o==='g'||o==='s'){ g.sot++; if(o==='s')g.sv++; else g.ga++; } if(k===1){ g.pf++; if(o!=='g')g.ps++; } } }
 for(const id in m._ex){ const e=m._ex[id]; if(e[7]!==side) continue; const a=X(id); if(!a) continue; a.pa+=e[0]; a.pc+=e[1]; a.tk+=e[2]; a.tkw+=e[3]; a.int+=e[4]; a.dw+=e[5]; a.dl+=e[6]; a.mt++; }
 for(const k in m._ex){ const a=S.P[k]&&S.P[k].x; if(a){ a.xg=+a.xg.toFixed(2); a.xga=+a.xga.toFixed(2); } }
 // сыгранность
 const fam=S.u.fam; if(f.r.fm){ if(fam.f===f.r.fm) fam.tac=Math.min(100,fam.tac+2); else { fam.f=f.r.fm; fam.tac=Math.round(fam.tac*0.65); } }
 // билеты и ТВ
 const c=S.C[f.c]; const kind=c?c.kind:'fr'; const rk=rankOf(S.me);
 add('tv',+(((kind==='final'?2:kind==='fr'?0.4:1))*(1+(210-rk)/280)).toFixed(2));
 if(f.vn&&f.vn.st&&(f.h===S.me||(c&&(c.host===S.me||c.co===S.me)))) add('tix',+((f.vn.att/10000)*(0.3+0.06*(f.vn.q||3))*(kind==='fr'?0.8:1.2)).toFixed(2));
};
// сыгранность в силе команды
const _calc=MP.calc; MP.calc=function(){ _calc.call(this); const S=G(); if(!S||!S.u.fam) return; for(const s of [0,1]) if(this.t[s].user&&this.str[s]){ const k=1+0.03*(S.u.fam.tac-50)/50; this.str[s].a*=k; this.str[s].d*=k; this.str[s].m*=k; } };
// ---------- экономика ----------
function add(k,v){ const S=G(); const m=S.u.eco.m; m[k]=+((m[k]||0)+v).toFixed(2); S.u.bud=+(S.u.bud+v).toFixed(2); }
V6.add=add;
V6.ecoMonth=()=>{ const S=G(); const u=S.u; const rk=rankOf(S.me); const tro=u.tro.filter(t=>N.diffD(t.d,S.d)<1460).length;
 add('spon',+(0.3+2.3*Math.pow(1-rk/211,2)+0.2*tro+(u.trust-50)/120).toFixed(2));
 add('merch',+((((u.fan??60)/100)*1.4*(1-rk/260)+0.1)*(N.v7&&u.kit?N.v7.merchK():1)).toFixed(2));
 add('staff',-+(0.35*u.staff).toFixed(2));
 add('fac',-+(0.12*Object.values(u.infra).reduce((a,b)=>a+b,0)).toFixed(2));
 add('stad',-+((u.st||[]).filter(s=>!s.rd).reduce((a,s)=>a+s.cap/1000*0.0028*(1+0.2*s.q),0)).toFixed(2));
 // строительство
 for(const s of u.st||[]) if(s.rd&&s.rd<=S.d){ const done=s.up; delete s.rd; if(s.up){ if(s.up.cap)s.cap+=s.up.cap; if(s.up.q)s.q=Math.min(5,s.q+1); delete s.up; } N.mail(_t("Федерация футбола"),_t("Стадион готов"),_t("Работы на стадионе в городе {0} завершены. Вместимость: {1}.",s.city,NFM_I18N.num(s.cap))); }
 if(S.cheat&&u.chm) u.bud=Math.max(u.bud,9999);
 if(S.cheat&&u.cht) u.trust=100;
 // итог месяца: «прочее» — призовые и бонусы за результаты
 const rec=Object.values(u.eco.m).reduce((a,b)=>a+b,0); const other=+(u.bud-u.eco.b0-rec).toFixed(2); if(Math.abs(other)>0.01) u.eco.m.prize=+((u.eco.m.prize||0)+other).toFixed(2);
 u.eco.h.push({d:S.d.slice(0,7),...u.eco.m}); if(u.eco.h.length>36) u.eco.h.shift(); u.eco.m={}; u.bud=Math.round(u.bud*10)/10; u.eco.b0=u.bud;
 if(u.bud<0&&!S.cheat){ N.trust(-2); N.mail(_t("Федерация футбола"),_t("Бюджет в минусе"),_t("Расходы превышают доходы. Сократите персонал или содержание объектов.")); } };
const _month=N.fn.month; N.fn.month=(e)=>{ _month(e); if(G().u.eco) V6.ecoMonth(); };
V6.STAFF=[0,1,2,3,4,5];
// стадионы: строительство и расширение
V6.buildCost=(cap,q)=>Math.round(cap/1000*(1.6+0.7*q));
V6.buildTime=(cap)=>Math.round(10+cap/5000);
V6.build=(city,cap,q)=>{ const S=G(); const c=V6.buildCost(cap,q); if(S.u.bud<c) return false; S.u.bud-=c; S.u.eco.b0-=c; add('build',0); S.u.eco.m.build=+((S.u.eco.m.build||0)-c).toFixed(2);
 const id=Math.max(0,...S.u.st.map(s=>s.id))+1; const inst=S.cheat&&S.u.chi; const [y,m,d]=S.d.split('-').map(Number); S.u.st.push({id,city,cap,q,main:0,rd:inst?null:N.ds(y,m+V6.buildTime(cap),d)}); if(inst){} return true; };
V6.expand=(id,kind)=>{ const S=G(); const s=S.u.st.find(x=>x.id===id); if(!s||s.rd) return false; const c=kind==='q'?Math.round(s.cap/1000*1.2):Math.round(10*(2+0.6*s.q)); if(kind==='q'&&s.q>=5) return false; if(kind==='cap'&&s.cap>=100000) return false; if(S.u.bud<c) return false;
 S.u.bud-=c; S.u.eco.b0-=c; S.u.eco.m.build=+((S.u.eco.m.build||0)-c).toFixed(2); const up=kind==='q'?{q:1}:{cap:10000};
 if(S.cheat&&S.u.chi){ if(up.cap)s.cap+=up.cap; else s.q++; return true; } const [y,m,d]=S.d.split('-').map(Number); s.up=up; s.rd=N.ds(y,m+(kind==='q'?6:8),d); return true; };
V6.expandCost=(s,kind)=>kind==='q'?Math.round(s.cap/1000*1.2):Math.round(10*(2+0.6*s.q));
V6.setMain=(id)=>{ for(const s of G().u.st) s.main=s.id===id?1:0; };
// посещаемость и домашнее преимущество
const _ven=N.venue; N.venue=(f)=>{ if(f.vn) return f.vn; const v=_ven(f); const S=G(); if(!S||!S.u.st) return v; const c=S.C[f.c];
 const host=c&&f.neu&&(c.host===S.me||c.co===S.me)&&(!c.co||c.host!==S.me||f.id%2===0||c.co!==S.me); const home=!f.neu&&f.h===S.me;
 if(!home&&!(c&&f.neu&&(c.host===S.me||(c.co===S.me)))) return v;
 const ok=S.u.st.filter(s=>!s.rd); if(!ok.length) return v; let st=home?(V6.mainSt()):ok[f.id%ok.length]; if(home&&c&&c.kind!=='fr'&&f.ko) st=ok.slice().sort((a,b)=>b.cap-a.cap)[0];
 const want=v.cap*v.fill*(1+0.06*(st.q-3))*(home?1:1.1); const att=Math.round(Math.min(st.cap,want)/100)*100; f.vn={...v,cap:st.cap,att,fill:+(att/st.cap).toFixed(2),st:st.city,q:st.q}; return f.vn; };
const _mo=N.matchOpts; N.matchOpts=(f,auto)=>{ const o=_mo(f,auto); if(f.vn&&f.vn.q&&!f.neu) o.hf*=1+0.04*(f.vn.q-3); return o; };
// ---------- тренировки v2 ----------
V6.FOC=['bal','att','def','sp','fit','tac','gk','rest'];
V6.autoPlan=()=>{ const S=G(); const t=S.u.tr2; const call=S.u.call.map(id=>S.P[id]).filter(Boolean);
 const nxt=S.F.filter(f=>!f.r&&(f.h===S.me||f.a===S.me)).sort((a,b)=>a.d<b.d?-1:1)[0]; const soon=nxt&&N.diffD(S.d,nxt.d)<=6; const big=nxt&&S.C[nxt.c]&&S.C[nxt.c].kind!=='fr';
 const avg=k=>{ const l=call.filter(p=>p.pos!=='GK'); return l.reduce((a,p)=>a+p[k],0)/Math.max(1,l.length); };
 const tired=call.filter(p=>p.fit<80).length>=5;
 t.g.G='gk'; t.g.D=tired?'fit':(avg('def')<avg('att')?'def':'bal'); t.g.M=S.u.fam.tac<65?'tac':(big&&soon&&S.u.fam.sp<60?'sp':'bal'); t.g.F=tired?'fit':'att';
 if(tired) t.g.M='rest'; t.i=tired?0:(soon&&big?1:(call.reduce((a,p)=>a+p.age,0)/Math.max(1,call.length)<26?2:1)); t.pl={}; };
N.training=()=>{ const S=G(); const t=S.u.tr2; if(!t) return; if(t.auto) V6.autoPlan();
 const staff=1+0.12*(S.u.staff-2)+0.2*(S.u.infra.base-1); const int=[0.6,1,1.45][t.i]; const map={att:['att','tec'],def:['def','phy'],fit:['phy','spd'],tac:['pas','tec'],bal:['att','def','pas','tec','phy','spd'],gk:['gk','phy'],sp:['tec','att'],rest:[]};
 let tacN=0,spN=0; const inj=[0.004,0.012,0.035][t.i]*(1-0.1*(S.u.infra.med-1))*(1-0.05*(S.u.staff-2));
 for(const id of S.u.call){ const p=S.P[id]; if(!p) continue; const g=N.POS[p.pos][1]; const foc=t.pl[id]||t.g[g]||'bal';
  const ks=(map[foc]||map.bal).filter(k=>p.pos==='GK'?['gk','phy','pas'].includes(k):k!=='gk'); const young=p.age<=24?1.5:p.age>=31?0.5:1;
  if(p.o<p.pot||p.age<=29){ for(const k of ks) if(R()<0.22*int*staff*young/ks.length*2) p[k]=Math.min(99,p[k]+1); }
  if(foc==='rest'){ p.fit=100; p.mor=cl(p.mor+4,5,100); } if(foc==='fit') p.fit=Math.min(100,p.fit+8); if(foc==='tac'){ tacN++; p.form=+cl(p.form+0.15,3,10).toFixed(2); } if(foc==='sp') spN++;
  if(t.i===0) p.fit=Math.min(100,p.fit+10); else if(t.i===2) p.fit=Math.max(60,p.fit-6);
  if(foc!=='rest'&&R()<inj){ p.inj=ri(3,14); N.mail(_t("Медицинский штаб"),_t("Травма на тренировке"),_t("{0} травмировался на интенсивной тренировке и выбыл на {1} дн.",(p.n),(p.inj))); }
  N.upd(p); }
 const n=Math.max(1,S.u.call.length); S.u.fam.tac=Math.round(cl(S.u.fam.tac+(tacN/n)*14*int*staff-1,0,100)); S.u.fam.sp=Math.round(cl(S.u.fam.sp+(spN/n)*18*int*staff-2,0,100));
 N.teamStr(S.me); };
// ---------- читы ----------
const _ach=N.ach; N.ach=(k)=>{ const S=G(); if(S&&S.cheat) return; _ach(k); };
V6.cheatOn=()=>{ const S=G(); S.cheat=1; };
// ---------- заявки на проведение турниров ----------
const BIDK={EURO:{conf:'UEFA',need:6,cap:30000,n:()=>_t("Чемпионат Европы {0}"),off:2},ASIAN:{conf:'AFC',need:5,cap:20000,n:()=>_t("Кубок Азии {0}"),off:1},AFCON:{conf:'CAF',need:5,cap:20000,n:()=>_t("Кубок Африки {0}"),off:1},AFCON2:{conf:'CAF',need:5,cap:20000,n:()=>_t("Кубок Африки {0}"),off:3},WC:{conf:'ALL',need:10,cap:40000,n:()=>_t("Чемпионат мира {0}"),off:4}};
V6.BIDK=BIDK;
N.wcRot=()=>{ const S=G(); return (S.wcH||[]).slice(-2).map(x=>x.conf); };
function openBids(Y){ const S=G(); const F=Y+4; const vote=(m,d)=>N.ds(Y+3,m,d);
 const list=[['ASIAN',vote(3,15)],['AFCON',vote(3,15)],['WC',vote(5,20)],['EURO',vote(9,20)],['AFCON2',vote(9,20)]].map(([k,vd])=>({k,yr:F+BIDK[k].off,vd,u:null,res:null}));
 S.bids={Y:F,list}; for(const b of list) if(vd(b)>S.d) N.addEv(b.vd,'fn',{fn:'bidv',k:b.k}); function vd(b){return b.vd;} }
V6.openBids=openBids;
V6.eligible=(b,c)=>{ const S=G(); const t=S.T[c||S.me]; const K=BIDK[b.k]; if(K.conf==='ALL') return t.conf!=='OFC'||true?!N.wcRot().includes(t.conf):false; return t.conf===K.conf; };
V6.bidPower=(c,co)=>{ const S=G(); const me=c===S.me; const K=null; const t=S.T[c];
 const sts=me?S.u.st.filter(s=>!s.rd||s.rd<'9999'):null; let stad,inf,qual,bud;
 if(me){ const all=S.u.st; stad=all.filter(s=>s.cap>=20000).length+all.filter(s=>s.cap>=40000).length*0.5; qual=all.reduce((a,s)=>a+s.q,0)/Math.max(1,all.length); inf=Object.values(S.u.infra).reduce((a,b)=>a+b,0)/5; bud=S.u.bud; }
 else { const r=rng(hs('bp'+c+S.bids.Y)); stad=cl((t.r-40)/5+r()*3,1,16); qual=cl((t.r-40)/12+r()*1.5,1,5); inf=cl((t.r-40)/12+r()*1.5,1,5); bud=(t.r-40)*6+r()*80; }
 const rk=rankOf(c); return {stad,qual,inf,bud,rk}; };
V6.bidScore=(b,c,co)=>{ const K=BIDK[b.k]; const a=V6.bidPower(c); let st=a.stad; if(co){ const x=V6.bidPower(co); st+=x.stad*0.8; }
 const sc=Math.min(1,st/K.need)*35+(a.qual/5)*12+(a.inf/5)*15+(1-a.rk/211)*20+Math.min(1,Math.max(0,a.bud)/300)*12+(co?-3:0); return Math.round(sc*10)/10; };
V6.bidReq=(b)=>{ const S=G(); const K=BIDK[b.k]; const big=S.u.st.filter(s=>!s.rd&&s.cap>=K.cap*0.5).length; return {need:K.need,cap:K.cap,have:big}; };
V6.submitBid=(k,co)=>{ const S=G(); const b=S.bids&&S.bids.list.find(x=>x.k===k); if(!b||b.res||b.u) return false; if(S.u.bud<10) return false; S.u.bud-=10; S.u.eco.b0-=10; S.u.eco.m.build=+((S.u.eco.m.build||0)-10).toFixed(2); b.u={co:co||null}; return true; };
V6.withdraw=(k)=>{ const S=G(); const b=S.bids.list.find(x=>x.k===k); if(b&&!b.res) b.u=null; };
V6.rivals=(b)=>{ const S=G(); const K=BIDK[b.k]; const r=rng(hs('rv'+b.k+b.yr)); const ex=new Set([S.me]); for(const x of S.bids.list) if(x.res&&x.res.w) ex.add(x.res.w);
 let pool=Object.values(S.T).filter(t=>!ex.has(t.c)&&(K.conf==='ALL'?t.conf!=='OFC'&&!N.wcRot().includes(t.conf):t.conf===K.conf)).sort((a,b)=>b.elo-a.elo).slice(0,K.conf==='ALL'?20:12);
 const n=2+Math.floor(r()*3); const out=[]; while(out.length<n&&pool.length){ const t=wpick(pool,t=>Math.pow(t.r-50,2),r); pool=pool.filter(x=>x!==t); out.push(t.c); } return out; };
N.fn.bidv=(e)=>{ const S=G(); const b=S.bids&&S.bids.list.find(x=>x.k===e.k); if(!b||b.res) return;
 const cands=V6.rivals(b).map(c=>({c,co:null,s:V6.bidScore(b,c)+R()*8})); if(b.u&&V6.eligible(b)) cands.push({c:S.me,co:b.u.co,s:V6.bidScore(b,S.me,b.u.co)+R()*8,me:1});
 cands.sort((x,y)=>y.s-x.s); const w=cands[0]; b.res={w:w.c,co:w.co,sc:cands.map(x=>[x.c,Math.round(x.s)])};
 S.hosts[b.k+b.yr]=w.c; if(w.co) S.hostsCo[b.k+b.yr]=w.co; if(b.k==='WC') S.wcH.push({y:b.yr,c:w.c,conf:S.T[w.c].conf});
 const nm=BIDK[b.k].n().replace('{0}',b.yr); const list=cands.map((x,i)=>`${i+1}. ${S.T[x.c].f} ${S.T[x.c].n}${x.co?' + '+S.T[x.co].n:''} — ${Math.round(x.s)}`).join('<br>');
 if(b.u){ if(w.me){ N.trust(8); S.u.fan=Math.min(100,(S.u.fan??60)+10); N.mail(_t("Федерация футбола"),`🎉 ${nm}`,`${_t("Мы выиграли право провести турнир! Сборная квалифицирована автоматически.")}<br>${list}`); }
  else N.mail(_t("Федерация футбола"),nm,`${_t("Наша заявка проиграла голосование. Хозяин турнира")}: ${S.T[w.c].n}.<br>${list}`); }
 else if(b.k==='WC'||S.T[w.c].conf===S.T[S.me].conf) N.mail(_t("Федерация футбола"),nm,`${_t("Хозяин турнира")}: ${S.T[w.c].f} ${S.T[w.c].n}${w.co?' + '+S.T[w.co].n:''}.<br>${list}`); };
const _bc=N.buildCycle; N.buildCycle=(Y)=>{ const S=G(); _bc(Y); // соорганизаторы
 for(const k in BIDK){ const yr=Y+BIDK[k].off; const co=S.hostsCo&&S.hostsCo[k+yr]; const id=(k==='AFCON2'?'AFCON2':k)+'_'+Y; const c=S.C[id]; if(co&&c&&!c.co&&c.host!==co){ c.co=co; for(const q of Object.values(S.C)) if(q.kind==='qual'&&q.yr===Y&&q.excl&&(q.conf===c.conf||c.conf==='ALL')) q.excl.push(co); } }
 if(S.v6){ if(S.C['WC_'+Y]&&!S.wcH.some(x=>x.y===Y+4)) S.wcH.push({y:Y+4,c:S.C['WC_'+Y].host,conf:S.T[S.C['WC_'+Y].host].conf}); openBids(Y); } };
// ---------- история (сгенерированная) ----------
const REAL={WC:[()=>_t("Чемпионат мира {0}",''),'ALL','1930 UY,1934 IT,1938 IT,1950 UY,1954 DE,1958 BR,1962 BR,1966 ENG,1970 BR,1974 DE,1978 AR,1982 IT,1986 AR,1990 DE,1994 BR,1998 FR,2002 BR,2006 IT,2010 ES,2014 DE,2018 FR,2022 AR'],
 EURO:[()=>_t("Чемпионат Европы {0}",''),'UEFA','1960 RU,1964 ES,1968 IT,1972 DE,1976 CZ,1980 DE,1984 FR,1988 NL,1992 DK,1996 DE,2000 FR,2004 GR,2008 ES,2012 ES,2016 PT,2021 IT,2024 ES'],
 COPA:[()=>_t("Копа Америка {0}",''),'CONMEBOL','1916 UY,1917 UY,1919 BR,1920 UY,1921 AR,1922 BR,1923 UY,1924 UY,1925 AR,1926 UY,1927 AR,1929 AR,1935 UY,1937 AR,1939 PE,1941 AR,1942 UY,1945 AR,1946 AR,1947 AR,1949 BR,1953 PY,1955 AR,1956 UY,1957 AR,1959 AR,1963 BO,1967 UY,1975 PE,1979 PY,1983 UY,1987 UY,1989 BR,1991 AR,1993 AR,1995 UY,1997 BR,1999 BR,2001 CO,2004 BR,2007 BR,2011 UY,2015 CL,2016 CL,2019 BR,2021 AR,2024 AR'],
 GOLD:[()=>_t("Золотой кубок КОНКАКАФ {0}",''),'CONCACAF','1991 US,1993 MX,1996 MX,1998 MX,2000 CA,2002 US,2003 MX,2005 US,2007 US,2009 MX,2011 MX,2013 US,2015 MX,2017 US,2019 MX,2021 US,2023 MX,2025 MX'],
 ASIAN:[()=>_t("Кубок Азии {0}",''),'AFC','1956 KR,1960 KR,1964 IL,1968 IR,1972 IR,1976 IR,1980 KW,1984 SA,1988 SA,1992 JP,1996 SA,2000 JP,2004 JP,2007 IQ,2011 JP,2015 AU,2019 QA,2023 QA'],
 AFCON:[()=>_t("Кубок Африки {0}",''),'CAF','1957 EG,1959 EG,1962 ET,1963 GH,1965 GH,1968 CD,1970 SD,1972 CG,1974 CD,1976 MA,1978 GH,1980 NG,1982 GH,1984 CM,1986 EG,1988 CM,1990 DZ,1992 CI,1994 NG,1996 ZA,1998 EG,2000 CM,2002 CM,2004 TN,2006 EG,2008 EG,2010 EG,2012 ZM,2013 NG,2015 CI,2017 CM,2019 DZ,2021 SN,2023 CI'],
 OFCNC:[()=>_t("Кубок наций ОФК {0}",''),'OFC','1973 NZ,1980 AU,1996 AU,1998 NZ,2000 AU,2002 NZ,2004 AU,2008 NZ,2012 PF,2016 NZ,2024 NZ'],
 AFF:[()=>_t("Чемпионат Юго-Восточной Азии {0}",''),'AFC','1996 TH,1998 SG,2000 TH,2002 TH,2004 SG,2007 SG,2008 VN,2010 MY,2012 SG,2014 TH,2016 TH,2018 VN,2020 TH,2022 TH,2024 VN'],
 EAFF:[()=>_t("Кубок Восточной Азии {0}",''),'AFC','2003 KR,2005 CN,2008 KR,2010 CN,2013 JP,2015 KR,2017 KR,2019 KR,2022 JP'],
 CHAN:[()=>_t("Чемпионат африканских наций (игроки местных лиг) {0}",''),'CAF','2009 CD,2011 TN,2014 LY,2016 CD,2018 MA,2020 MA,2022 SN'],
 FIN:[()=>_t("Кубок чемпионов континентов {0}",''),'ALL','1985 FR,1993 AR,2022 AR']};
// сгенерированные архивы для прочих турниров (вымышленные результаты)
const GEN={KINGS:[()=>_t("Королевский кубок {0}",''),'ALL',1968,2024,2,'TH MY KR JP CN IQ SG ID VN KP UZ SY']};
V6.archive=()=>{ const S=G(); const out=[];
 for(const k in REAL){ const [nk,conf,l]=REAL[k]; out.push({k,n:nk().trim(),conf,real:1,ed:l.split(',').map(x=>{const [y,c]=x.split(' '); return {y:+y,w:c};}).filter(e=>S.T[e.w]).reverse()}); }
 const k='KINGS'; const [nk,conf,y0,y1,st,pool]=GEN.KINGS; const ps=pool.split(' ').filter(c=>S.T[c]); const ed=seeded('arK',r=>{ const a=[]; for(let y=y1;y>=y0;y-=st) a.push({y,w:wpick(ps,c=>Math.pow(Math.max(1,S.T[c].r-45),2.2)*(c==='TH'?3:1),r)}); return a; });
 out.push({k,n:nk().trim(),conf,gen:1,ed});
 // турниры, сыгранные в этой карьере
 for(const a of S.arch.concat(Object.values(S.C).filter(c=>c.stage==='done'&&c.w).map(c=>({id:c.id,n:c.n,w:c.w,kind:c.kind,yr:c.yr})))){ if(!a.w) continue; const kk=a.id.replace(/\d*_?\d+$/,'').replace(/_$/,''); const key={AFCON2:'AFCON',GOLD:'GOLD'}[kk]||kk; let e=out.find(x=>x.k===key); if(!e){ e={k:key,n:String(a.n).replace(/\s*\d{4}(\/\d+)?\s*$/,''),conf:'',ed:[],game:1}; out.push(e); } e.ed.unshift({y:a.yr||+(String(a.id).match(/\d{4}/)||[0])[0],w:a.w,g:1}); }
 for(const e of out) e.ed.sort((a,b)=>b.y-a.y); return out; };
// легенды и рекорды сборной до начала игры (вымышленные игроки)
V6.legends=(c)=>{ const S=G(); const t=S.T[c]; if(!t) return []; return seeded('lg'+c,r=>{ const L=[]; const taken=new Set(); const POSL=['GK','CB','CB','LB','RB','DM','CM','CM','AM','LW','RW','ST','ST','ST'];
  for(let i=0;i<16;i++){ const nm=N.genName(t.pool,taken); const pos=POSL[Math.floor(r()*POSL.length)]; const g1=N.POS[pos][1]; const y1=1950+Math.floor(r()*60); const span=6+Math.floor(r()*11);
   const caps=Math.round((25+r()*90)*(0.55+(t.r-40)/100)); const gr=g1==='F'?0.25+r()*0.3:g1==='M'?0.05+r()*0.15:g1==='D'?r()*0.05:0; L.push({n:nm.n,pos,from:y1,to:Math.min(2025,y1+span),caps,g:Math.round(caps*gr),leg:1}); }
  return L; }); };
V6.oldRecords=(c)=>{ const S=G(); const t=S.T[c]; return seeded('rc'+c,r=>{ const conf=Object.values(S.T).filter(x=>x.conf===t.conf&&x.c!==c); const weak=conf.slice().sort((a,b)=>a.r-b.r).slice(0,8), strong=conf.concat(Object.values(S.T).filter(x=>x.r>=82)).sort((a,b)=>b.r-a.r).slice(0,10);
  const bw=Math.max(3,Math.round(3+(t.r-50)/9+r()*2.5)), bl=Math.max(3,Math.round(4+(80-t.r)/8+r()*2));
  return {win:{g:[bw,Math.floor(r()*2)],o:pick(weak).c,y:1960+Math.floor(r()*60)},loss:{g:[Math.floor(r()*2),bl],o:pick(strong).c,y:1950+Math.floor(r()*65)},unb:Math.round(6+(t.r-40)/3+r()*8),unbY:1970+Math.floor(r()*50)}; }); };
// ретро-рейтинг ФИФА 1993–2025 (сгенерированный, по годам)
V6.pastRank=(c)=>{ const S=G(); const h=S.rkH&&S.rkH[0]; let p0=h?h.o.split(',').indexOf(c)+1:rankOf(c); if(p0<=0)p0=rankOf(c); return seeded('pr'+c,r=>{ const out=[]; let p=p0; for(let y=2025;y>=1993;y--){ out.unshift([String(y),p]); const sd=2+p*0.1; p=Math.round(cl(p+(r()-.5)*2*sd+(p0-p)*0.12,1,211)); } return out; }); };
// очные встречи до 2026 года (сгенерированные)
V6.oldH2H=(a,b)=>{ const S=G(); const A=S.T[a],B=S.T[b]; const k=[a,b].sort().join('-'); return seeded('h2'+k,r=>{ const same=A.conf===B.conf; const n=Math.floor(same?2+r()*14:r()*4); let w=0,d=0,l=0,gf=0,ga=0; const we=1/(1+Math.pow(10,-(A.elo-B.elo)/400));
  for(let i=0;i<n;i++){ const x=r(); const pd=0.26; const res=x<we*(1-pd)?1:x<we*(1-pd)+pd?0:-1; const g1=Math.floor(r()*3), g2=Math.floor(r()*2); if(res>0){w++;gf+=g1+1;ga+=g2;} else if(res<0){l++;gf+=g2;ga+=g1+1;} else {d++;gf+=g2;ga+=g2;} }
  return a<b?{w,d,l,gf,ga}:{w,d,l,gf,ga}; }); };
// ---------- рейтинг: движение по месяцам ----------
V6.rkAt=(i)=>{ const S=G(); const h=S.rkH[i]; if(!h) return null; if(!h._p){ const o=h.o.split(','); const p={}; o.forEach((c,j)=>p[c]=j+1); Object.defineProperty(h,'_p',{value:p,enumerable:false}); } return h._p; };
V6.movers=(i,conf)=>{ const S=G(); const a=V6.rkAt(i-1), b=V6.rkAt(i); if(!a||!b) return []; return Object.keys(b).filter(c=>a[c]&&(!conf||conf==='ALL'||S.T[c].conf===conf)).map(c=>({c,d:a[c]-b[c],p:b[c]})).filter(x=>x.d!==0).sort((x,y)=>y.d-x.d); };
V6.teamRk=(c)=>{ const S=G(); return S.rkH.map((h,i)=>[h.d,V6.rkAt(i)[c]]).filter(x=>x[1]); };
V6.ptsLog=(c)=>{ const S=G(); return S.F.filter(f=>f.r&&f.r.fp&&(f.h===c||f.a===c)).slice(-30).reverse().map(f=>({f,p:f.r.fp[f.h===c?0:1]})); };
// ---------- статистика тренера и сборной ----------
V6.userFix=(c)=>{ const S=G(); return S.F.filter(f=>f.r&&f.u&&(!c||f.h===c||f.a===c)); };
V6.res=(f,c)=>{ const r=f.r; const my=f.h===c?r.hg:r.ag, op=f.h===c?r.ag:r.hg; const w=r.w?(r.w===c?1:-1):(my>op?1:my<op?-1:0); return {my,op,w,opp:f.h===c?f.a:f.h}; };
V6.agg=(fx,c)=>{ const o={p:0,w:0,d:0,l:0,gf:0,ga:0}; for(const f of fx){ const x=V6.res(f,c); o.p++; o.gf+=x.my; o.ga+=x.op; if(x.w>0)o.w++; else if(x.w<0)o.l++; else o.d++; } return o; };
V6.compName=(id)=>{ const S=G(); const c=S.C[id]; if(c) return c.n; const a=S.arch.find(x=>x.id===id); return a?a.n:id; };
// ---------- асинхронный шаг календаря (без подвисаний) ----------
V6.busy=(on,txt)=>{ if(typeof document==='undefined') return; let el=document.getElementById('busy'); if(!el){ el=document.createElement('div'); el.id='busy'; el.innerHTML='<div class="bx"><span class="sp"></span><b></b></div>'; document.body.appendChild(el); }
 el.querySelector('b').textContent=txt||_t("Симуляция…"); el.classList.toggle('on',!!on); };
V6.advance=(opt={})=>new Promise(ok=>{ const S=G(); const t0=performance.now(); let shown=false;
 const run=()=>{ const s=performance.now(); let r; do{ r=N.advance({...opt,steps:1}); }while(r.stop==='step'&&performance.now()-s<14);
  if(r.stop!=='step'){ if(shown) V6.busy(false); return ok(r); }
  if(!shown&&performance.now()-t0>250){ shown=true; } if(shown) V6.busy(true,`${_t("Симуляция…")} ${N.fmtD(G().d,1)}`);
  setTimeout(run,0); };
 setTimeout(run,0); });
})();

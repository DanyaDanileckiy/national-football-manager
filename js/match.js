// Поминутный движок матча
(function(){
const N = globalThis.NFM = globalThis.NFM || {};
const R=Math.random, cl=(v,a,b)=>v<a?a:v>b?b:v;
// калибровка (Update #8): компрессия силы, игра по счёту, домашнее преимущество
const QK=+(typeof process!=="undefined"&&process.env.NFM_QK||0.94), QE=1.3, LD3=0.45, LD2=0.65, LD1=0.85, TR1=1.25, XE=0.35, HA=0.1, HD=0.06, TD=0.5, PM=1.7, HQ=0.28;
const W = { // веса вклада роли в атаку / оборону / центр
 att:{GK:0,CB:.08,LB:.25,RB:.25,DM:.2,CM:.4,LM:.6,RM:.6,AM:.8,LW:.95,RW:.95,ST:1},
 def:{GK:0,CB:1,LB:.8,RB:.8,DM:.8,CM:.5,LM:.4,RM:.4,AM:.25,LW:.12,RW:.12,ST:.1},
 mid:{GK:0,CB:.2,LB:.35,RB:.35,DM:.9,CM:1,LM:.8,RM:.8,AM:.9,LW:.4,RW:.4,ST:.3},
 shot:{GK:0,CB:.35,LB:.3,RB:.3,DM:.5,CM:1,LM:1.4,RM:1.4,AM:2.4,LW:3,RW:3,ST:5}
};
N.MW=W; const NORM={att:4.66,def:5.6,mid:5.3};
function pick(arr,wf){let s=0;const w=arr.map(x=>{const v=Math.max(0,wf(x));s+=v;return v});let r=R()*s;for(let i=0;i<arr.length;i++){r-=w[i];if(r<=0)return arr[i]}return arr[arr.length-1]}
const T = (a)=>a[Math.floor(R()*a.length)];
const nm = p=>p? p.n.split(' ').slice(-1)[0] : '?';
const fullnm = p=>p?p.n:'?';
const ri=(a,b)=>a+Math.floor(R()*(b-a+1));
const WX={rain:_t("Идёт дождь, газон скользкий."),heat:_t("Жара — игрокам будет тяжело."),snow:_t("Идёт снег."),wind:_t("Сильный ветер.")}; N.WXN={clear:`☀️ ${_t("ясно")}`,cloud:`☁️ ${_t("облачно")}`,rain:`🌧 ${_t("дождь")}`,heat:`🌡 ${_t("жара")}`,snow:`❄️ ${_t("снег")}`,wind:`💨 ${_t("ветер")}`};

// ===== Update #10: тактическая модель =====
// роли игроков: ia/id/im — вклад в атаку/оборону/центр, sh — вес удара, as — вес передачи, hd — игра головой,
// fat — расход сил, pr — вклад в прессинг, foul — фолы, cross — навесы/угловые, poss — владение, xgO — xG соперника, sv — вратарь
const RL={
 gk:{}, sk:{xgO:.95,poss:.012,sv:.985},
 cd:{}, bpd:{im:1.3,poss:.014,id:.96}, stp:{id:1.08,foul:1.3,im:.9},
 fb:{}, wb:{ia:1.5,id:.84,fat:1.12,cross:1.15}, ifb:{im:1.35,ia:1.05,id:.93,poss:.012},
 dm:{}, anc:{id:1.2,ia:.6,im:.95}, dlp:{im:1.22,as:1.6,id:.88,poss:.016}, bwm:{id:1.12,pr:.2,foul:1.35,fat:1.08},
 cm:{}, b2b:{ia:1.18,id:1.1,fat:1.18,sh:1.25}, ap:{as:2,im:1.12,ia:1.12,id:.8},
 am:{}, ss:{sh:1.7,ia:1.15,im:.9,id:.8},
 wm:{}, wf:{}, w:{as:1.5,cross:1.18,sh:.8}, if:{sh:1.6,ia:1.12,as:.8},
 af:{}, tm:{hd:2.2,sh:1.1,as:1.3,im:.9,xg:1.05}, p:{sh:1.6,xg:1.12,ia:1.08,im:.8,id:.7}, f9:{sh:.7,as:1.8,im:1.35}, pf:{pr:.25,fat:1.15,id:1.6,sh:.9}
};
N.RL=RL;
N.ROLEOPT={GK:['gk','sk'],CB:['cd','bpd','stp'],LB:['fb','wb','ifb'],RB:['fb','wb','ifb'],DM:['dm','anc','dlp','bwm'],CM:['cm','b2b','dlp','ap','bwm'],AM:['am','ap','ss'],LM:['wm','w','if','wb'],RM:['wm','w','if','wb'],LW:['wf','w','if'],RW:['wf','w','if'],ST:['af','tm','p','f9','pf']};
N.ROLEDEF={GK:'gk',CB:'cd',LB:'fb',RB:'fb',DM:'dm',CM:'cm',AM:'am',LM:'wm',RM:'wm',LW:'wf',RW:'wf',ST:'af'};
// пригодность игрока к роли (0–100) по атрибутам
N.roleSuit=(p,k)=>{ if(!p) return 0; const a=p.att||40,d=p.def||40,pa=p.pas||40,t=p.tec||40,ph=p.phy||40,g=p.gk||30,h=p.h||180; const hh=cl(50+(h-180)*3.5,10,99);
 const f={gk:g,sk:g*.75+pa*.25,cd:d,bpd:d*.6+pa*.25+t*.15,stp:d*.6+ph*.4,fb:d*.6+ph*.4,wb:ph*.4+t*.3+a*.3,ifb:d*.4+pa*.4+t*.2,dm:d*.7+pa*.3,anc:d*.8+ph*.2,dlp:pa*.65+t*.35,bwm:d*.55+ph*.45,
  cm:pa*.5+d*.25+a*.25,b2b:ph*.45+d*.25+a*.3,ap:pa*.5+t*.5,am:pa*.4+t*.3+a*.3,ss:a*.65+t*.35,wm:pa*.4+t*.3+ph*.3,wf:a*.5+t*.5,w:t*.5+pa*.3+ph*.2,if:a*.6+t*.4,
  af:a*.8+t*.2,tm:hh*.5+ph*.3+a*.2,p:a,f9:t*.5+pa*.5,pf:ph*.5+d*.2+a*.3}[k];
 return Math.round(f==null?50:f); };
{ const _rs=N.roleSuit; N.roleSuit=(p,k)=>{ if(!p) return 0; const sg=((((((p.att|0)*128+(p.def|0))*128+(p.pas|0))*128+(p.tec|0))*128+(p.phy|0))*128+(p.spd|0))*128+(p.gk|0); let c=p._su; if(!c||c.s!==sg||c.h!==p.h){ c={s:sg,h:p.h}; Object.defineProperty(p,'_su',{value:c,writable:true,configurable:true,enumerable:false}); } const v=c[k]; return v!==undefined?v:(c[k]=_rs(p,k)); }; }
const rk0=(e)=>{ const k=e.pr||N.ROLEDEF[e.role]; const m=RL[k]||{}; if(!e.pr||!m) return null; const sc=N.roleSuit(e.p,k); const o=Math.max(40,N.roleOvr(e.p,e.role)); const kf=cl(0.75+(sc-o+6)/40,0.35,1.15); return {m,kf}; };
// v10.1: результат зависит только от роли и атрибутов — кэшируется на записи игрока в матче
const rk=(e,tac)=>{ const c=e._rkc; if(c&&c.pr===e.pr&&c.role===e.role&&c.p===e.p) return c.v; const v=rk0(e); Object.defineProperty(e,'_rkc',{value:{pr:e.pr,role:e.role,p:e.p,v},writable:true,configurable:true,enumerable:false}); return v; };
const rm=(r,f,dft=1)=>{ if(!r||r.m[f]==null) return dft; return 1+(r.m[f]-1)*r.kf; };
const ra=(r,f)=>{ if(!r||r.m[f]==null) return 0; return r.m[f]*r.kf; };
// эффекты командных установок (все шкалы 0..2, середина 1 — «стандартно»)
function tfx(tac){ const v=k=>(tac[k]??1)-1; const ment=tac.ment||0, dp=v('press'), dl=v('line'), dw=v('width'), dt=v('tempo'), dd=v('pass'), dk=v('tackle');
 const x={poss:0,q:1,qO:1,xg:1,xgO:1,foul:1,card:1,offO:1,fat:1,corner:1,head:1,focus:tac.focus||'m'};
 x.fat*=1+0.03*ment;
 x.poss+=0.02*dp; x.qO*=1-0.03*dp;
 x.poss+=0.02*dl; x.qO*=1-0.06*dl; x.xgO*=1+0.14*dl; x.offO*=1+0.7*dl;
 x.q*=1+0.04*dw; x.corner*=1+0.3*dw; x.head*=1+0.3*dw; x.xg*=1-0.03*dw; x.qO*=1+0.03*dw;
 x.poss-=0.02*dt; x.fat*=1+0.08*dt;
 x.poss-=0.03*dd; x.q*=1+0.05*dd; x.xg*=1-0.06*dd; x.head*=1+0.35*dd;
 if(tac.style==='poss'){ x.poss+=0.05; x.q*=0.96; x.qO*=0.98; x.fat*=0.95; x.xg*=1.03; } else if(tac.style==='counter'){ x.poss-=0.05; x.xg*=1.08; }
 if(tac.trap){ x.offO*=2.5; x.qO*=0.96; x.xgO*=1.07; }
 x.foul*=1+0.4*dk; x.card*=1+0.5*dk; x.qO*=1-0.035*dk;
 if(x.focus==='c'){ x.xg*=1.05; x.q*=0.97; x.head*=0.8; } else if(x.focus==='w'){ x.corner*=1.2; x.head*=1.3; x.q*=1.02; x.xg*=0.97; }
 const o=tac.opp||{}; if(o.foot){ x.xgO*=0.96; x.qO*=0.98; x.foul*=1.05; } if(o.mark) x.foul*=1.06;
 return x; }
N.tfx=tfx;
// ===== Update #10: тактическая модель (конец) =====
class Match{
 constructor(home,away,o={}){
  this.t=[home,away]; this.o=o; this.min=0; this.done=false; this.ev=[]; this.score=[0,0]; this.ko=!!o.ko; this.neutral=!!o.neutral; this.agg=o.agg||null; this.hf=this.neutral?0:(o.hf??0.85); this.wx=o.wx||'clear'; this.inAdd=false; this.addK=0; this.addN=0; this.injN=0;
  this.st=[0,1].map(()=>({poss:0,sh:0,sot:0,xg:0,fo:0,co:0,yc:0,rc:0,off:0}));
  this.ps={}; this.ball=[50,50]; this.possSide=0; this.pens=null; this.phase=_t("1т");
  for(const s of [0,1]){ const tm=this.t[s]; tm.on=(tm.on||[]).filter(e=>e&&e.p); tm.bench=(tm.bench||[]).filter(Boolean); tm.side=s; tm.subsLeft=tm.subsLeft??5; tm.subWin=0;
   tm.on.forEach(e=>this._init(e.p,s,0,e.role)); tm.bench.forEach(p=>{p._mfit=p.fit;}); }
  this.calc();
 }
 _init(p,s,m,role){ p._mfit = p.fit; if(!this.ps[p.id]) this.ps[p.id]={side:s,rt:6.3,g:0,a:0,sh:0,sot:0,sv:0,fo:0,yc:0,rc:0,from:m,to:null,role,inj:0,og:0}; else {this.ps[p.id].from=m;this.ps[p.id].role=role;} }
 eff(e){const p=e.p;return N.roleOvr(p,e.role)*(0.72+0.28*p._mfit/100)*(1+((p.form||6)-6)*0.015)*(0.95+0.1*(p.mor??60)/100)}
 calc(){
  this.str=[0,1].map(s=>{ const tm=this.t[s], tac=tm.tac||{}; const op=(this.t[1-s].tac||{}).opp; let a=0,d=0,m=0,gk=40; const fx=tfx(tac); let pr=0;
   for(const e of tm.on){ if(e.off) continue; const r=rk(e,tac); if(r){ pr+=ra(r,'pr'); fx.poss+=ra(r,'poss'); if(r.m.foul) fx.foul*=1+(rm(r,'foul')-1)*0.15; if(r.m.xgO) fx.xgO*=rm(r,'xgO'); } }
   for(const e of tm.on){ if(e.off) continue; const v=this.eff(e); if(e.role==='GK'){gk=v;continue}
    let ia=1,id=1,im=1; const ins=(tm.instr||{})[e.p.id]; const r=rk(e,tac); if(r){ ia*=rm(r,'ia'); id*=rm(r,'id'); im*=rm(r,'im'); }
    if(op&&op.mark&&op.mark===e.p.id){ ia*=0.88; im*=0.93; }
    if(ins==='att'){ia=1.15;id=0.85} else if(ins==='hold'){ia=0.85;id=1.12} else if(ins==='free'){ia=1.08;id=0.95}
    a+=W.att[e.role]*v*ia; d+=W.def[e.role]*v*id; m+=W.mid[e.role]*v*im; }
   a/=NORM.att; d/=NORM.def; m/=NORM.mid;
   { let wa=0,wd=0,wm=0; for(const e of tm.on){ if(e.role==='GK') continue; wa+=W.att[e.role]; wd+=W.def[e.role]; wm+=W.mid[e.role]; } // схемы: частичная нормировка, чтобы схема давала компромисс, а не чистую прибавку
    if(wa>0){ a/=Math.pow(wa/NORM.att,1); d/=Math.pow(wd/NORM.def,0.85); m/=Math.pow(wm/NORM.mid,0.9); } }
   const ment=tac.ment||0, press=tac.press??1, tempo=tac.tempo??1;
   a*=1+0.06*ment; d*=1-0.045*ment; m*=1+0.03*(press-1);
   if(tac.style==='counter'){m*=0.95;d*=1.03} m*=1-0.02*((tac.pass??1)-1); fx.qO*=1-0.08*pr;
   if(s===0&&this.hf>0){const k=this.hf/0.85;a*=1+HA*k;d*=1+HD*k;m*=1+0.03*k} if(!this.neutral&&s===1&&this.o.homeAdvBig){d*=0.98}
   return {a,d,m,gk,press,tempo,ment,style:tac.style||'mix',fx}; });
 }
 log(e){e.m=this.min; if(this.inAdd&&this.addK>0)e.ml=this.min+'+'+this.addK;this.ev.push(e);this.cur.push(e);return e}
 onPitch(s){return this.t[s].on.filter(e=>!e.off)}
 step(){
  if(this.done) return [];
  this.cur=[]; const maxMin=this.extra?120:90;
  if(this.min===0&&!this.started){this.started=1; this.log({t:'kick',txt:T([_t("Стартовый свисток! Матч начался."),_t("Арбитр даёт сигнал к началу встречи."),_t("Поехали! Мяч в игре.")])+(WX[this.wx]?' '+WX[this.wx]:'')});}
  if(this.inAdd) this.addK++; else this.min++;
  const [A,B]=this.str;
  // владение
  let pH = 0.5 + (A.m-B.m)/(A.m+B.m)*PM + (A.fx.poss-B.fx.poss)*0.45; pH=cl(pH,.22,.78);
  const s = R()<pH?0:1, o=1-s; this.possSide=s; this.st[s].poss++;
  const X=this.str[s], Y=this.str[o];
  const bx = s===0? 55+R()*25 : 45-R()*25; const kf=[[cl(bx+(R()-.5)*20,5,95),15+R()*70],[bx,20+R()*60]];
  // атака
  let ratio = X.a/Y.d; if(ratio>1.12)ratio=Math.min(1.45,1.12+(ratio-1.12)*0.4); if(ratio<0.89)ratio=0.89-(0.89-ratio)*0.4; let q = QK*0.236*Math.pow(ratio,QE)*(1+0.12*(X.tempo-1))*X.fx.q*Y.fx.qO*(1-0.9*X.fx.poss);
  { const lead=this.score[s]-this.score[o]; if(lead>=3)q*=LD3; else if(lead>=2)q*=LD2; else if(lead===1&&this.min>=60)q*=LD1; else if(lead===-1&&this.min>=60)q*=TR1; else if(lead===0&&this.min>=70)q*=TD; }
  if(X.style==='counter' && pH<.5) q*=1.06; if(this.wasting(s)) q*=0.85; if(this.wasting(o)) q*=0.88; if(this.hf>0) q*= s===0?1+HQ*this.hf/0.85:1-HQ*0.5*this.hf/0.85;
  if(this.onPitch(s).length<11) q*=0.92; if(this.onPitch(o).length<11) q*=1.08; if(this.wx==='snow')q*=0.94; else if(this.wx==='rain')q*=0.98;
  q=cl(q,.04,.55);
  if(R()<q) this.shot(s,ratio,kf);
  if(R()<0.02*X.fx.corner){ this.st[s].co++; this.corner(s); }
  // фолы
  if(R()<0.24*(1+0.3*(Y.press-1))*Y.fx.foul*(this.wx==='rain'?1.06:1)) this.foul(o,s);
  else if(R()<0.012*Y.fx.offO) this.log({t:'off',side:s,txt:T([_t("Офсайд, атака {0} прервана.",(this.t[s].n)),_t("Флажок поднят — положение вне игры.")])}),this.st[s].off++;
  // травмы
  for(const sd of [0,1]) if(R()<0.0019*(this.o.injK??1)){ const e=T(this.onPitch(sd)); if(e&&!this.ps[e.p.id].inj){ this.ps[e.p.id].inj=1; this.injN++; e.inj=true; this.log({t:'inj',side:sd,p:e.p.id,txt:`🚑 ${_t("{0} получает травму и не может продолжать.",(fullnm(e.p)))}`}); if(!this.t[sd].user||this.o.autoUser) this.autoInjSub(sd,e); } }
  // усталость
  for(const sd of [0,1]){ const pr=this.str[sd].press; for(const e of this.onPitch(sd)){ const p=e.p; const ins=(this.t[sd].instr||{})[p.id]; const fx=this.str[sd].fx, r=rk(e,this.t[sd].tac||{}); p._mfit=Math.max(10,p._mfit - (e.role==='GK'?0.05:(this.wx==='heat'?0.31:0.25)*(1.3-(p.phy||60)/150)*(1+0.22*(pr-1))*fx.fat*rm(r,'fat')*(this.o.fatK??1)*(ins==='att'||ins==='mark'?1.1:1))); } }
  this.ball=kf[kf.length-1]; this.kf=kf;
  this.rules(); if(this.min%5===0) this.calc();
  // ИИ замены
  for(const sd of [0,1]) if(!this.t[sd].user||this.o.autoUser) this.aiSubs(sd);
  if(!this.inAdd&&[45,90,105,120].includes(this.min)&&(this.extra||this.min<=90)&&this.min!==this._pe){ this._pe=this.min;
   const n=this.min===45?ri(0,3)+(this.injN>0?1:0):this.min===90?ri(2,6)+Math.min(2,this.injN)+(this.wasting(0)||this.wasting(1)?1:0):this.min===105?ri(0,1):ri(1,3); this.injN=0;
   if(n>0){ this.inAdd=true; this.addN=n; this.addK=0; this.log({t:'add',txt:`⏱ ${_t("Добавлено {0} мин.",(n))}`}); } else this.periodEnd(); }
  else if(this.inAdd&&this.addK>=this.addN){ this.inAdd=false; this.periodEnd(); }
  return this.cur;
 }
 tot(s){ return this.score[s]+(this.agg?this.agg[s]:0); }
 periodEnd(){ const m=this.min;
  if(m===45){ this.log({t:'ht',txt:_t("Перерыв. Счёт {0}.",(this.score.join(':')))}); this.phase=_t("2т"); return; }
  if(m===105){ this.log({t:'ht',txt:_t("Перерыв в дополнительное время.")}); return; }
  const tie=this.tot(0)===this.tot(1);
  if(m===90){ if(this.ko&&tie){ this.extra=true; this.phase=_t("ДВ"); this.log({t:'ht',txt:this.agg?_t("По сумме двух матчей ничья ({0}:{1}) — дополнительное время!",(this.tot(0)),(this.tot(1))):_t("Ничья в основное время — назначено дополнительное время!")}); } else this.finish(); return; }
  if(m===120){ if(this.ko&&tie) this.penalties(); this.finish(); } }
 shot(s,ratio,kf){
  const o=1-s, tm=this.t[s], op=this.t[o]; const st=this.st[s];
  const X=this.str[s], fx=X.fx, tac=tm.tac||{}, om=(op.tac||{}).opp||{}; const isHead = R()<cl(.22*fx.head,.05,.6); const sh = pick(this.onPitch(s).filter(e=>e.role!=='GK'), e=>{ const r=rk(e,tac); return (isHead?(W.shot[e.role]+1.2)*Math.pow(cl(((e.p.h||180)-166)/14,0.2,2.5),2)*(e.p.phy||50)*rm(r,'hd'):W.shot[e.role]*Math.pow(e.p.att||50,1.5))*rm(r,'sh')*((tm.instr||{})[e.p.id]==='att'?1.3:1)*this.flank(e,fx.focus)*(om.mark===e.p.id?0.55:1); });
  if(!sh) return;
  const gkE = this.onPitch(o).find(e=>e.role==='GK'); const gkV = gkE?this.eff(gkE)*rm(rk(gkE,op.tac||{}),'sv'):35;
  let xg = (0.025+0.36*Math.pow(R(),3.1))*Math.pow(ratio,XE)*(1-0.07*(this.str[s].tempo-1))*fx.xg*this.str[o].fx.xgO;
  xg*=rm(rk(sh,tac),'xg'); if(isHead) xg*=0.8; if(this.wx==='wind')xg*=0.95;
  xg=cl(xg,.01,.7);
  this._resolveShot(s,sh,xg,gkE,gkV,kf,false,isHead);
 }
 _resolveShot(s,sh,xg,gkE,gkV,kf,pen,isHead,fk){
  const o=1-s, st=this.st[s], P=this.ps[sh.p.id]; st.sh++; st.xg+=xg; P.sh++;
  const fin=(sh.p.att*0.7+sh.p.tec*0.3); let pg = xg*Math.pow(cl(fin/Math.max(30,gkV),0.75,1.35),0.9)*(0.95+0.1*sh.p._mfit/100);
  pg=cl(pg,.005,.92);
  const tn=this.t[s].n;
  kf.push([s===0?93:7, 40+R()*20]);
  if(R()<pg&&!pen&&R()<0.035){ // VAR
   st.sot++; this.log({t:'var',side:s,p:sh.p.id,txt:`📺 ${_t("Мяч в сетке, но после просмотра VAR гол {0} отменён",(fullnm(sh.p)))} — ${(T([_t("офсайд"),_t("фол в атаке"),_t("игра рукой")]))}.`}); kf[kf.length-1]=[s===0?99:1,50]; return; }
  if(R()<pg){
   this.score[s]++; st.sot++; P.g++; P.sot++; P.rt+= ['ST','LW','RW'].includes(sh.role)?1.05:1.3;
   let as=null; if(!pen && !fk && R()<0.76){ { const tac=this.t[s].tac||{}; as=pick(this.onPitch(s).filter(e=>e!==sh&&e.role!=='GK'),e=>(e.p.pas||50)*(e.role==='AM'||e.role==='LM'||e.role==='RM'||e.role==='LW'||e.role==='RW'?2:1)*rm(rk(e,tac),'as')); } if(as){this.ps[as.p.id].a++; this.ps[as.p.id].rt+=0.7;} }
   for(const e of this.onPitch(s)) this.ps[e.p.id].rt+=0.06;
   for(const e of this.onPitch(o)){ const g=N.POS[e.role][1]; this.ps[e.p.id].rt-= e.role==='GK'?0.35:g==='D'?0.2:0.05; }
   const how = pen?_t("с пенальти"):fk?T([_t("прямым ударом со штрафного"),_t("со штрафного в «девятку»"),_t("со штрафного через стенку")]):isHead?T([_t("головой"),_t("ударом головой после подачи")]):T([_t("низом в угол"),_t("под перекладину"),_t("с линии штрафной"),_t("после быстрого прохода"),_t("добивая мяч"),_t("точным ударом с близкого расстояния"),_t("мощно с левой"),_t("в дальний угол")]);
   const txt = `⚽ ${_t("ГОЛ! {0} ({1}) забивает {2}{3}! {4}",(fullnm(sh.p)),(tn),(how),(as?`. ${_t("Передача")} — ${(nm(as.p))}`:''),(this.score.join(':')))}`;
   this.log({t:'goal',side:s,p:sh.p.id,p2:as?as.p.id:null,pen,fk:fk?1:0,txt}); kf[kf.length-1]=[s===0?99:1,50];
  } else if(R()<0.42){
   st.sot++; P.sot++; P.rt+=0.12; if(gkE){this.ps[gkE.p.id].sv++; this.ps[gkE.p.id].rt+=0.25;}
   const txt = pen? `❌ ${_t("{0} бьёт пенальти — {1} отражает!",(fullnm(sh.p)),(gkE?nm(gkE.p):_t("вратарь")))}` : fk? `🧤 ${_t("Штрафной от {0} — {1} в прыжке забирает мяч.",(nm(sh.p)),(gkE?nm(gkE.p):_t("вратарь")))}` : T([`🧤 ${_t("{0} бьёт, но {1} на месте.",(nm(sh.p)),(gkE?nm(gkE.p):_t("вратарь")))}`,`🧤 ${_t("Отличный сейв! {0} вытаскивает удар {1}.",(gkE?nm(gkE.p):_t("Вратарь")),(nm(sh.p)))}`,`🧤 ${_t("{0} пробивает в створ — вратарь забирает.",(nm(sh.p)))}`]);
   this.log({t:'save',side:s,p:sh.p.id,xg,txt});
   if(R()<.33){st.co++; this.log({t:'corner',side:s,txt:_t("Угловой у ворот соперника. Подаёт {0}.",(this.t[s].n))});}
  } else {
   P.rt-=0.05;
   this.log({t:'miss',side:s,p:sh.p.id,xg,txt: pen?`❌ ${_t("{0} не попадает с пенальти!",(fullnm(sh.p)))}`:fk?_t("{0} бьёт со штрафного — мяч в стенке.",(nm(sh.p))):T([_t("{0} бьёт мимо ворот.",(nm(sh.p))),`${(nm(sh.p))} — ${_t("выше перекладины!")}`,_t("Удар {0} заблокирован защитником.",(nm(sh.p))),_t("Опасно! {0} промахивается совсем чуть-чуть.",(nm(sh.p))),_t("{0} пытается удивить дальним ударом — мимо.",(nm(sh.p)))])});
   if(R()<.25){st.co++;}
  }
 }
 foul(s,victimSide){
  const ft=this.t[s].tac||{}; const e = pick(this.onPitch(s), e=>(e.role==='GK'?0.1:W.def[e.role]+0.3+((this.t[s].instr||{})[e.p.id]==='mark'?0.6:0))*rm(rk(e,ft),'foul')); const ck=this.str[s].fx.card;
  if(!e) return; const P=this.ps[e.p.id]; this.st[s].fo++; P.fo++; P.rt-=0.05;
  let txt=_t("Фол: {0} ({1}) нарушает правила.",(nm(e.p)),(this.t[s].n));
  if(R()<0.014*(1+0.3*(ck-1))){ // пенальти
   this.log({t:'foul',side:s,p:e.p.id,txt:_t("Фол в штрафной! {0} сбивает соперника — пенальти!",(nm(e.p)))});
   const sh = this.taker(victimSide,'pk',0);
   if(!sh) return; const gkE=this.onPitch(s).find(x=>x.role==='GK'); this._resolveShot(victimSide,sh,0.76,gkE,gkE?this.eff(gkE):35,[[victimSide===0?88:12,50]],true,false); return;
  }
  if(R()<0.05){ // опасный штрафной
   const tk=this.taker(victimSide,'fk'); const gkE=this.onPitch(s).find(x=>x.role==='GK');
   if(tk){ this.log({t:'foul',side:s,p:e.p.id,txt:_t("Фол у штрафной: {0} сбивает соперника. Опасный штрафной!",(nm(e.p)))}); this._resolveShot(victimSide,tk,0.05+0.04*R()*((tk.p.tec||60)/80),gkE,gkE?this.eff(gkE):35,[[victimSide===0?78:22,50]],false,false,true); } }
  const r=R();
  if(r<0.003*ck){ this.red(s,e,`🟥 ${_t("Прямая красная! {0} удалён за грубый фол.",(fullnm(e.p)))}`); }
  else if(r<(P.yc?0.07:0.17)*ck){ P.yc++; this.st[s].yc++; P.rt-=0.3;
   if(P.yc>=2){ this.red(s,e,`🟨🟥 ${_t("Вторая жёлтая — {0} покидает поле!",(fullnm(e.p)))}`); }
   else this.log({t:'yc',side:s,p:e.p.id,txt:`🟨 ${_t("Жёлтая карточка")}: ${(fullnm(e.p))} (${(this.t[s].n)}).`}); }
  else if(R()<.35) this.log({t:'foul',side:s,p:e.p.id,txt});
 }
 red(s,e,txt){ const P=this.ps[e.p.id]; P.rc=1; P.rt-=1.5; this.st[s].rc++; e.off=true; P.to=this.min; this.log({t:'rc',side:s,p:e.p.id,txt});
  if(e.role==='GK'){ // ставим полевого в ворота / замена
   const tm=this.t[s]; const gk=tm.bench.find(p=>p.pos==='GK'&&!this.ps[p.id]);
   if(gk&&tm.subsLeft>0&&(!tm.user||this.o.autoUser)){ const out=this.onPitch(s).filter(x=>x.role!=='GK').sort((a,b)=>W.att[b.role]-W.att[a.role])[0]; if(out){this.doSub(s,out.p.id,gk.id); const ng=this.t[s].on.find(x=>x.p===gk); if(ng)ng.role='GK';} }
   else { const f=this.onPitch(s)[this.onPitch(s).length-1]; if(f) f.role='GK'; }
  }
  this.calc(); }
 doSub(s,outId,inId){ const tm=this.t[s]; if(tm.subsLeft<=0) return false; const i=tm.on.findIndex(e=>e.p.id===outId&&!e.off); const bp=tm.bench.find(p=>p.id===inId);
  if(i<0||!bp||this.ps[inId]) return false; const old=tm.on[i]; this.ps[outId].to=this.min; old.off=true; tm.on.splice(i,1,{p:bp,role:old.role,pr:old.pr}); tm.out=(tm.out||[]).concat(old.p); tm.bench=tm.bench.filter(p=>p!==bp);
  this._init(bp,s,this.min,old.role); this.ps[inId].rt=6.2; tm.subsLeft--; this.log({t:'sub',side:s,p:inId,p2:outId,txt:`🔁 ${_t("Замена в {0}: {1} вместо {2}.",(tm.n),(fullnm(bp)),(fullnm(old.p)))}`}); this.calc(); return true; }
 autoInjSub(s,e){ const tm=this.t[s]; const g=N.POS[e.role][1]; const c=tm.bench.filter(p=>!this.ps[p.id]&&!p.inj).sort((a,b)=>N.roleOvr(b,e.role)-N.roleOvr(a,e.role))[0];
  if(c&&tm.subsLeft>0) this.doSub(s,e.p.id,c.id); else { e.off=true; this.ps[e.p.id].to=this.min; this.calc(); } }
 aiSubs(s){ const tm=this.t[s]; if(tm.subsLeft<=0||![58,66,72,78,84].includes(this.min)) return; if(tm.subsLeft<=2&&this.min<72) return;
  const cand=this.onPitch(s).filter(e=>e.role!=='GK').map(e=>({e,sc:e.p._mfit+ (this.ps[e.p.id].rt-6.3)*15})).sort((a,b)=>a.sc-b.sc)[0];
  if(!cand||cand.sc>82) return; const role=cand.e.role; const c=tm.bench.filter(p=>!this.ps[p.id]&&!p.inj&&p.pos!=='GK').sort((a,b)=>N.roleOvr(b,role)-N.roleOvr(a,role))[0];
  if(c) this.doSub(s,cand.e.p.id,c.id); }
 penalties(){ this.pens=[0,0]; const seq=[[],[]]; this.log({t:'ht',txt:_t("Серия пенальти!")});
  const takers=[0,1].map(s=>{ const l=this.onPitch(s).filter(e=>e.role!=='GK').sort((a,b)=>(b.p.att+b.p.tec+b.p.mor/4)-(a.p.att+a.p.tec+a.p.mor/4)); const ord=(((this.t[s].tac||{}).sp||{}).pk||[]); const pre=ord.map(id=>l.find(e=>e.p.id===id)).filter(Boolean); return pre.concat(l.filter(e=>!pre.includes(e))); });
  const gks=[0,1].map(s=>this.onPitch(s).find(e=>e.role==='GK'));
  for(let k=0;k<30;k++){ for(const s of [0,1]){ const tk=takers[s][k%takers[s].length]; const g=gks[1-s]; const gv=g?this.eff(g):40;
    const p = cl(0.74+((tk.p.att+tk.p.tec)/2-gv)/250,0.55,0.9); const ok=R()<p; seq[s].push(ok); if(ok)this.pens[s]++;
    this.log({t:'pk',side:s,p:tk.p.id,ok,txt:`${((ok?'✅ ':'❌ ')+fullnm(tk.p))} (${(this.t[s].n)}) — ${(ok?_t("забивает"):_t("не реализует"))}. ${_t("Серия")}: ${(this.pens.join(':'))}`});
    if(k<5){ const rem0=5-seq[0].length, rem1=5-seq[1].length; if(this.pens[0]+rem0<this.pens[1]||this.pens[1]+rem1<this.pens[0]) return; }
   } if(k>=4&&this.pens[0]!==this.pens[1]) return; } }
 finish(){ this.done=true; const sc=this.score;
  for(const s of [0,1]){ const conc=sc[1-s], diff=sc[s]-sc[1-s];
   for(const id in this.ps){ const P=this.ps[id]; if(P.side!==s) continue; if(P.to===null)P.to=this.min; P.min=P.to-P.from;
    const e=this.t[s].on.find(x=>x.p.id==id)||{p:(this.t[s].out||[]).find(p=>p.id==id)}; const p=e.p||{};
    P.rt += diff>0?0.3:diff<0?-0.3:0; const g=N.POS[P.role][1];
    if(conc===0&&P.min>=60){ if(g==='G')P.rt+=0.6; else if(g==='D')P.rt+=0.35; }
    P.rt += ((N.roleOvr(p,P.role)||60)-70)/30 + (Math.random()+Math.random()+Math.random()-1.5)*0.45;
    if(P.min<20) P.rt = 6+(P.rt-6)*0.5;
    P.rt=Math.round(cl(P.rt,3,10)*10)/10; } }
  const w = this.pens? (this.pens[0]>this.pens[1]?0:1) : sc[0]>sc[1]?0:sc[1]>sc[0]?1:-1; this.winner=w; if(this.agg){ this.aggW=this.pens?w:(this.tot(0)>this.tot(1)?0:this.tot(1)>this.tot(0)?1:-1); }
  this.log({t:'ft',txt:`${_t("Финальный свисток! {0} {1}",(this.t[0].n),(sc[0]))}:${(sc[1])} ${(this.t[1].n)}${(this.pens?` ${_t("(пен. {0})",(this.pens.join(':')))}`:'')}${(this.extra&&!this.pens?` ${_t("(д.в.)")}`:'')}${(this.agg?` · ${_t("по сумме {0}",(this.tot(0)))}:${(this.tot(1))}`:'')}`});
  for(const s of [0,1]) for(const e of this.t[s].on.concat((this.t[s].out||[]).map(p=>({p})))) if(e.p._mfit!==undefined){e.p.fit=Math.round(e.p._mfit);}
 }
 flank(e,f){ if(!f||f==='m') return 1; const L=['LB','LM','LW'].includes(e.role), Rr=['RB','RM','RW'].includes(e.role);
  if(f==='l') return L?1.7:Rr?0.7:1; if(f==='r') return Rr?1.7:L?0.7:1; if(f==='c') return (L||Rr)?0.75:1.15; if(f==='w') return (L||Rr)?1.45:0.9; return 1; }
 taker(s,k,i){ const on=this.onPitch(s).filter(x=>x.role!=='GK'); const sp=(this.t[s].tac||{}).sp||{};
  const want=k==='pk'?(sp.pk||[]):[sp[k]]; for(const id of want){ const e=on.find(x=>x.p.id===id); if(e) return e; }
  const sc=k==='pk'?(x=>x.p.att+x.p.tec):k==='ck'?(x=>x.p.pas*1.2+x.p.tec):(x=>x.p.tec*1.3+x.p.att); return on.sort((a,b)=>sc(b)-sc(a))[0]; }
 wasting(s){ const t=this.t[s].tac||{}; return !!t.waste&&this.min>=55&&this.score[s]>this.score[1-s]; }
 corner(s){ const o=1-s, tac=this.t[s].tac||{}, sp=tac.sp||{}, rt=sp.rt||'mix', dm=((this.t[o].tac||{}).sp||{}).mk||'zone';
  const tk=this.taker(s,'ck'); if(!tk) return; const q=((tk.p.pas||50)*1.2+(tk.p.tec||50))/2.2; const ats=this.onPitch(s).filter(e=>e.role!=='GK'&&e!==tk); if(!ats.length) return;
  const air=x=>x.reduce((a,e)=>a+((e.p.h||180)-178)+((e.p.phy||50)-60)*0.3,0)/Math.max(1,x.length); const hA=air(ats), hD=air(this.onPitch(o).filter(e=>e.role!=='GK'));
  let ps={near:.17,far:.15,short:.10,mix:.15}[rt], xg={near:.085,far:.06+0.005*cl(hA-hD,-6,10),short:.06,mix:.075}[rt];
  if(dm==='man'){ ps*=0.88; xg*=1.02; if(R()<0.012){ this.st[o].fo++; const sh=this.taker(s,'pk'); const gkE=this.onPitch(o).find(x=>x.role==='GK'); this.log({t:'foul',side:o,txt:_t("Фол в штрафной при угловом — пенальти!")}); this._resolveShot(s,sh,0.76,gkE,gkE?this.eff(gkE):35,[[s===0?88:12,50]],true,false); return; } }
  else { xg*=rt==='far'?0.9:1.0; }
  ps*=0.85+0.3*q/80; xg=cl(xg*(0.85+0.3*q/80),.02,.3);
  if(R()>=ps) return; const isHead=rt!=='short';
  const sh=pick(ats,e=>isHead?Math.pow(cl(((e.p.h||180)-166)/14,0.2,2.5),2)*(e.p.phy||50)*rm(rk(e,tac),'hd'):W.shot[e.role]*(e.p.att||50));
  const gkE=this.onPitch(o).find(e=>e.role==='GK'); this.log({t:'corner',side:s,txt:_t("Угловой подаёт {0}.",nm(tk.p))}); this._resolveShot(s,sh,xg,gkE,gkE?this.eff(gkE):35,[[s===0?96:4,s===0?2:98],[s===0?92:8,50]],false,isHead); }
 // условные установки по ходу матча и автозамены уставших
 rules(){ for(const s of [0,1]){ const tm=this.t[s], tac=tm.tac; if(!tac) continue; const lead=this.score[s]-this.score[1-s];
   if(this.wasting(s)&&R()<0.006){ const e=T(this.onPitch(s)); const P=e&&this.ps[e.p.id]; if(P&&!P.yc){ P.yc=1; this.st[s].yc++; P.rt-=0.2; this.log({t:'yc',side:s,p:e.p.id,txt:`🟨 ${_t("Жёлтая за затягивание времени")}: ${fullnm(e.p)} (${tm.n}).`}); } }
   for(const c of tac.cond||[]){ if(c._f||this.min<(c.min||0)) continue; const ok=c.w==='lose'?lead<0:c.w==='draw'?lead===0:c.w==='win1'?lead===1:c.w==='win'?lead>0:c.w==='lose2'?lead<=-2:false; if(!ok) continue;
    c._f=1; N.applyAct&&N.applyAct(tm,c.a,this); this.log({t:'tac',side:s,txt:`📋 ${_t("{0}: тактика меняется по плану",tm.n)} — ${N.actName?N.actName(c.a):c.a}.`}); this.calc(); }
   if(tac.asub&&(!tm.user||!this.o.autoUser||true)&&this.min>=50&&this.min%3===0&&tm.subsLeft>0&&(tm.user&&!this.o.autoUser)){ const e=this.onPitch(s).filter(x=>x.role!=='GK'&&x.p._mfit<tac.asub).sort((a,b)=>a.p._mfit-b.p._mfit)[0];
    if(e){ const c=tm.bench.filter(p=>!this.ps[p.id]&&!p.inj&&p.pos!=='GK').sort((a,b)=>N.roleOvr(b,e.role)-N.roleOvr(a,e.role))[0]; if(c) this.doSub(s,e.p.id,c.id); } } } }
 sim(){ while(!this.done) this.step(); return this; }
}
N.Match=Match;
})();

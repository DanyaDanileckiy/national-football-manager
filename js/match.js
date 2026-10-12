// Поминутный движок матча
(function(){
const N = globalThis.NFM = globalThis.NFM || {};
const R=Math.random, cl=(v,a,b)=>v<a?a:v>b?b:v;
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

class Match{
 constructor(home,away,o={}){
  this.t=[home,away]; this.o=o; this.min=0; this.done=false; this.ev=[]; this.score=[0,0]; this.ko=!!o.ko; this.neutral=!!o.neutral; this.agg=o.agg||null; this.hf=this.neutral?0:(o.hf??0.85); this.wx=o.wx||'clear'; this.inAdd=false; this.addK=0; this.addN=0; this.injN=0;
  this.st=[0,1].map(()=>({poss:0,sh:0,sot:0,xg:0,fo:0,co:0,yc:0,rc:0,off:0}));
  this.ps={}; this.ball=[50,50]; this.possSide=0; this.pens=null; this.phase=_t("1т");
  for(const s of [0,1]){ const tm=this.t[s]; tm.side=s; tm.subsLeft=tm.subsLeft??5; tm.subWin=0;
   tm.on.forEach(e=>this._init(e.p,s,0,e.role)); tm.bench.forEach(p=>{p._mfit=p.fit;}); }
  this.calc();
 }
 _init(p,s,m,role){ p._mfit = p.fit; if(!this.ps[p.id]) this.ps[p.id]={side:s,rt:6.3,g:0,a:0,sh:0,sot:0,sv:0,fo:0,yc:0,rc:0,from:m,to:null,role,inj:0,og:0}; else {this.ps[p.id].from=m;this.ps[p.id].role=role;} }
 eff(e){const p=e.p;return N.roleOvr(p,e.role)*(0.72+0.28*p._mfit/100)*(1+((p.form||6)-6)*0.015)*(0.95+0.1*(p.mor??60)/100)}
 calc(){
  this.str=[0,1].map(s=>{ const tm=this.t[s], tac=tm.tac||{}; let a=0,d=0,m=0,gk=40;
   for(const e of tm.on){ if(e.off) continue; const v=this.eff(e); if(e.role==='GK'){gk=v;continue}
    let ia=1,id=1; const ins=(tm.instr||{})[e.p.id];
    if(ins==='att'){ia=1.15;id=0.85} else if(ins==='hold'){ia=0.85;id=1.12} else if(ins==='free'){ia=1.08;id=0.95}
    a+=W.att[e.role]*v*ia; d+=W.def[e.role]*v*id; m+=W.mid[e.role]*v; }
   a/=NORM.att; d/=NORM.def; m/=NORM.mid;
   const ment=tac.ment||0, press=tac.press??1, tempo=tac.tempo??1;
   a*=1+0.06*ment; d*=1-0.045*ment; m*=1+0.03*(press-1);
   if(tac.style==='short'){m*=1.03;a*=0.98} else if(tac.style==='long'){m*=0.96;a*=1.03} else if(tac.style==='counter'){m*=0.95;d*=1.03}
   if(s===0&&this.hf>0){const k=this.hf/0.85;a*=1+0.065*k;d*=1+0.04*k;m*=1+0.03*k} if(!this.neutral&&s===1&&this.o.homeAdvBig){d*=0.98}
   return {a,d,m,gk,press,tempo,ment,style:tac.style||'mix'}; });
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
  let pH = 0.5 + (A.m-B.m)/(A.m+B.m)*1.8; if(A.style==='counter')pH-=.04; if(B.style==='counter')pH+=.04; pH=cl(pH,.25,.75);
  const s = R()<pH?0:1, o=1-s; this.possSide=s; this.st[s].poss++;
  const X=this.str[s], Y=this.str[o];
  const bx = s===0? 55+R()*25 : 45-R()*25; const kf=[[cl(bx+(R()-.5)*20,5,95),15+R()*70],[bx,20+R()*60]];
  // атака
  let ratio = X.a/Y.d; if(ratio>1.12)ratio=Math.min(1.55,1.12+(ratio-1.12)*0.45); if(ratio<0.89)ratio=0.89-(0.89-ratio)*0.45; let q = 0.236*Math.pow(ratio,1.5)*(1+0.12*(X.tempo-1));
  if(X.style==='counter' && pH<.5) q*=1.06;
  if(this.onPitch(s).length<11) q*=0.92; if(this.onPitch(o).length<11) q*=1.08; if(this.wx==='snow')q*=0.94; else if(this.wx==='rain')q*=0.98;
  q=cl(q,.04,.55);
  if(R()<q) this.shot(s,ratio,kf);
  // фолы
  if(R()<0.24*(1+0.3*(Y.press-1))*(this.wx==='rain'?1.06:1)) this.foul(o,s);
  else if(R()<0.012) this.log({t:'off',side:s,txt:T([_t("Офсайд, атака {0} прервана.",(this.t[s].n)),_t("Флажок поднят — положение вне игры.")])}),this.st[s].off++;
  // травмы
  for(const sd of [0,1]) if(R()<0.0019){ const e=T(this.onPitch(sd)); if(e&&!this.ps[e.p.id].inj){ this.ps[e.p.id].inj=1; this.injN++; e.inj=true; this.log({t:'inj',side:sd,p:e.p.id,txt:`🚑 ${_t("{0} получает травму и не может продолжать.",(fullnm(e.p)))}`}); if(!this.t[sd].user||this.o.autoUser) this.autoInjSub(sd,e); } }
  // усталость
  for(const sd of [0,1]){ const pr=this.str[sd].press; for(const e of this.onPitch(sd)){ const p=e.p; const ins=(this.t[sd].instr||{})[p.id]; p._mfit=Math.max(10,p._mfit - (e.role==='GK'?0.05:(this.wx==='heat'?0.31:0.25)*(1.3-(p.phy||60)/150)*(1+0.22*(pr-1))*(ins==='att'||ins==='mark'?1.1:1))); } }
  this.ball=kf[kf.length-1]; this.kf=kf;
  if(this.min%5===0) this.calc();
  // ИИ замены
  for(const sd of [0,1]) if(!this.t[sd].user||this.o.autoUser) this.aiSubs(sd);
  if(!this.inAdd&&[45,90,105,120].includes(this.min)&&(this.extra||this.min<=90)&&this.min!==this._pe){ this._pe=this.min;
   const n=this.min===45?ri(0,3)+(this.injN>0?1:0):this.min===90?ri(2,6)+Math.min(2,this.injN):this.min===105?ri(0,1):ri(1,3); this.injN=0;
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
  const isHead = R()<.22; const sh = pick(this.onPitch(s).filter(e=>e.role!=='GK'), e=>(isHead?(W.shot[e.role]+1.2)*Math.pow(cl(((e.p.h||180)-166)/14,0.2,2.5),2)*(e.p.phy||50):W.shot[e.role]*Math.pow(e.p.att||50,1.5))*((tm.instr||{})[e.p.id]==='att'?1.3:1));
  if(!sh) return;
  const gkE = this.onPitch(o).find(e=>e.role==='GK'); const gkV = gkE?this.eff(gkE):35;
  let xg = (0.025+0.36*Math.pow(R(),3.1))*Math.pow(ratio,0.6)*(1-0.07*(this.str[s].tempo-1));
  if(isHead) xg*=0.8; if(this.wx==='wind')xg*=0.95;
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
   let as=null; if(!pen && !fk && R()<0.76){ as=pick(this.onPitch(s).filter(e=>e!==sh&&e.role!=='GK'),e=>(e.p.pas||50)*(e.role==='AM'||e.role==='LM'||e.role==='RM'||e.role==='LW'||e.role==='RW'?2:1)); if(as){this.ps[as.p.id].a++; this.ps[as.p.id].rt+=0.7;} }
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
  const e = pick(this.onPitch(s), e=>e.role==='GK'?0.1:W.def[e.role]+0.3+((this.t[s].instr||{})[e.p.id]==='mark'?0.6:0));
  if(!e) return; const P=this.ps[e.p.id]; this.st[s].fo++; P.fo++; P.rt-=0.05;
  let txt=_t("Фол: {0} ({1}) нарушает правила.",(nm(e.p)),(this.t[s].n));
  if(R()<0.014){ // пенальти
   this.log({t:'foul',side:s,p:e.p.id,txt:_t("Фол в штрафной! {0} сбивает соперника — пенальти!",(nm(e.p)))});
   const sh = this.onPitch(victimSide).filter(x=>x.role!=='GK').sort((a,b)=>(b.p.att+b.p.tec)-(a.p.att+a.p.tec))[0];
   const gkE=this.onPitch(s).find(x=>x.role==='GK'); this._resolveShot(victimSide,sh,0.76,gkE,gkE?this.eff(gkE):35,[[victimSide===0?88:12,50]],true,false); return;
  }
  if(R()<0.05){ // опасный штрафной
   const tk=this.onPitch(victimSide).filter(x=>x.role!=='GK').sort((a,b)=>(b.p.tec*1.3+b.p.att)-(a.p.tec*1.3+a.p.att))[0]; const gkE=this.onPitch(s).find(x=>x.role==='GK');
   if(tk){ this.log({t:'foul',side:s,p:e.p.id,txt:_t("Фол у штрафной: {0} сбивает соперника. Опасный штрафной!",(nm(e.p)))}); this._resolveShot(victimSide,tk,0.05+0.04*R()*((tk.p.tec||60)/80),gkE,gkE?this.eff(gkE):35,[[victimSide===0?78:22,50]],false,false,true); } }
  const r=R();
  if(r<0.003){ this.red(s,e,`🟥 ${_t("Прямая красная! {0} удалён за грубый фол.",(fullnm(e.p)))}`); }
  else if(r<(P.yc?0.07:0.17)){ P.yc++; this.st[s].yc++; P.rt-=0.3;
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
  if(i<0||!bp||this.ps[inId]) return false; const old=tm.on[i]; this.ps[outId].to=this.min; old.off=true; tm.on.splice(i,1,{p:bp,role:old.role}); tm.out=(tm.out||[]).concat(old.p); tm.bench=tm.bench.filter(p=>p!==bp);
  this._init(bp,s,this.min,old.role); this.ps[inId].rt=6.2; tm.subsLeft--; this.log({t:'sub',side:s,p:inId,p2:outId,txt:`🔁 ${_t("Замена в {0}: {1} вместо {2}.",(tm.n),(fullnm(bp)),(fullnm(old.p)))}`}); this.calc(); return true; }
 autoInjSub(s,e){ const tm=this.t[s]; const g=N.POS[e.role][1]; const c=tm.bench.filter(p=>!this.ps[p.id]&&!p.inj).sort((a,b)=>N.roleOvr(b,e.role)-N.roleOvr(a,e.role))[0];
  if(c&&tm.subsLeft>0) this.doSub(s,e.p.id,c.id); else { e.off=true; this.ps[e.p.id].to=this.min; this.calc(); } }
 aiSubs(s){ const tm=this.t[s]; if(tm.subsLeft<=0||![58,66,72,78,84].includes(this.min)) return; if(tm.subsLeft<=2&&this.min<72) return;
  const cand=this.onPitch(s).filter(e=>e.role!=='GK').map(e=>({e,sc:e.p._mfit+ (this.ps[e.p.id].rt-6.3)*15})).sort((a,b)=>a.sc-b.sc)[0];
  if(!cand||cand.sc>82) return; const role=cand.e.role; const c=tm.bench.filter(p=>!this.ps[p.id]&&!p.inj&&p.pos!=='GK').sort((a,b)=>N.roleOvr(b,role)-N.roleOvr(a,role))[0];
  if(c) this.doSub(s,cand.e.p.id,c.id); }
 penalties(){ this.pens=[0,0]; const seq=[[],[]]; this.log({t:'ht',txt:_t("Серия пенальти!")});
  const takers=[0,1].map(s=>this.onPitch(s).filter(e=>e.role!=='GK').sort((a,b)=>(b.p.att+b.p.tec+b.p.mor/4)-(a.p.att+a.p.tec+a.p.mor/4)));
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
 sim(){ while(!this.done) this.step(); return this; }
}
N.Match=Match;
})();

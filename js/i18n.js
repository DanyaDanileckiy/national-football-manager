// Локализация: _t('русский текст {0}', арг) → строка на выбранном языке.
// Ключ — русский исходник; словари i18n/<lang>.js хранят переводы по короткому id (хеш исходника).
(function(){
const G=globalThis;
const LANGS=[['ru','Русский'],['en','English'],['es','Español'],['pt','Português'],['de','Deutsch'],['fr','Français'],['it','Italiano'],['pl','Polski'],['uk','Українська'],['he','עברית',1],['ar','العربية',1],['tr','Türkçe'],['ja','日本語'],['zh','简体中文'],['ko','한국어'],['nl','Nederlands'],['cs','Čeština'],['id','Bahasa Indonesia'],['hi','हिन्दी'],['fa','فارسی',1]];
const has=l=>LANGS.some(x=>x[0]===l);
function detect(){ const nav=(G.navigator&&(navigator.languages||[navigator.language]))||[]; for(const x of nav){ if(!x)continue; let l=x.toLowerCase().split('-')[0]; if(l==='iw')l='he'; if(l==='in')l='id'; if(has(l))return l; } return 'ru'; }
let saved=null; try{ saved=G.localStorage&&localStorage.getItem('nfm_lang'); }catch(e){}
const lang=(saved&&has(saved))?saved:(G.document?detect():'ru');
const hash=s=>{ let h=0x811c9dc5; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,0x01000193)>>>0; } return h.toString(36); };
const I=G.NFM_I18N={lang,LANGS,first:!saved,hash,rtl:!!(LANGS.find(x=>x[0]===lang)||[])[2],D:null};
G.NFM_LANG=d=>{ I.D=d; };
const hist=new Map();
G._t=function(k,...a){ let s=k; if(I.D){ const v=I.D[hash(k)]; if(v!=null)s=v; } s=s.replace(/\{(\d+)\}/g,(m,i)=>a[i]==null?'':a[i]);
 hist.set(s,[k,a]); if(hist.size>400){ hist.delete(hist.keys().next().value); } return s; };
// ключ и аргументы для строки, только что полученной из _t (чтобы перевести сохранённые данные при смене языка)
I.keyOf=s=>{ const v=hist.get(s); return v?[v[0],v[1].map(x=>typeof x==='string'||typeof x==='number'?x:'')]:null; };
I.re=(nk)=>nk?_t(nk[0],...nk[1]):null;
I.set=l=>{ try{localStorage.setItem('nfm_lang',l);}catch(e){} location.reload(); };
if(G.document){ const h=document.documentElement; h.lang=lang; h.dir=I.rtl?'rtl':'ltr'; if(lang!=='ru')document.write('<script src="i18n/'+lang+'.js"><\/script>'); }
// названия стран: русские из данных, иначе Intl + поправки
I.country=(c,ru,iso)=>{ if(lang==='ru'||!I.D)return ru; const o=I.D['c_'+c]; if(o)return o; try{ const sh=['HK','MO','PS'].includes(iso); let n=new Intl.DisplayNames([lang],{type:'region',style:sh?'short':'long'}).of(iso)||ru; return n.replace(/\s*[(（][^)）]*[)）]\s*$/,'')||n; }catch(e){ return ru; } };
// даты
I.date=(y,m,d,short)=>{ const o=short?{day:'numeric',month:'short',year:'numeric'}:{weekday:'short',day:'numeric',month:'long',year:'numeric'}; try{ return new Intl.DateTimeFormat(lang,{...o,timeZone:'UTC'}).format(new Date(Date.UTC(y,m-1,d))); }catch(e){ return d+'.'+m+'.'+y; } };
I.num=n=>{ try{ return new Intl.NumberFormat(lang).format(n);}catch(e){return String(n);} };
})();

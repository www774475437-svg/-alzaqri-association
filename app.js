(function(){
'use strict';
const C=window.APP_CONFIG, $=s=>document.querySelector(s), view=$('#view');
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const store={get(k,d){try{const v=localStorage.getItem('zq_'+k);return v==null?d:JSON.parse(v);}catch(e){return d;}},
             set(k,v){try{localStorage.setItem('zq_'+k,JSON.stringify(v));}catch(e){}}};
const ic=p=>'<svg viewBox="0 0 24 24">'+p+'</svg>';
const ICON={
 prayer:ic('<circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/>'),
 athkar:ic('<circle cx="12" cy="12" r="3"/><circle cx="12" cy="4" r="1.5"/><circle cx="12" cy="20" r="1.5"/><circle cx="4" cy="12" r="1.5"/><circle cx="20" cy="12" r="1.5"/><circle cx="6.300" cy="6.300" r="1.500"/><circle cx="17.700" cy="17.700" r="1.500"/><circle cx="17.700" cy="6.300" r="1.500"/><circle cx="6.300" cy="17.700" r="1.500"/>'),
 book:ic('<path d="M12 6c-2-1.500-5-1.500-8-1v13c3-.5 6-.5 8 1 2-1.500 5-1.500 8-1V5c-3-.5-6-.5-8 1zM12 6v13"/>'),
 scroll:ic('<path d="M7 4h11v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1h10M7 4a2 2 0 0 0-2 2v11M10 9h5M10 13h5"/>'),
 heart:ic('<path d="M12 20s-7-4.500-7-10a4 4 0 0 1 7-2.500A4 4 0 0 1 19 10c0 5.500-7 10-7 10z"/>'),
 coin:ic('<circle cx="12" cy="12" r="8"/><path d="M12 8v8M9.500 10.500c0-1 1-1.500 2.500-1.500s2.500.5 2.500 1.500S13.500 12 12 12s-2.500.5-2.500 1.500 1 1.500 2.500 1.500 2.500-.5 2.500-1.500"/>'),
 news:ic('<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M8 9h8M8 13h8M8 16h5"/>'),
 pen:ic('<path d="M5 19l1-4L16 5l3 3L9 18z"/>'),
 build:ic('<path d="M4 20V10l8-6 8 6v10M9 20v-6h6v6"/>'),
 info:ic('<circle cx="12" cy="12" r="8"/><path d="M12 11v5M12 8v.5"/>'),
 tree:ic('<path d="M12 21v-8M12 13c-4 0-6-2-6-5a6 6 0 0 1 12 0c0 3-2 5-6 5z"/>'),
 chart:ic('<path d="M5 19V9M10 19V5M15 19v-7M20 19v-11"/>'),
 user:ic('<circle cx="12" cy="8" r="4"/><path d="M5 20c0-4 3-6 7-6s7 2 7 6"/>'),
 help:ic('<circle cx="12" cy="12" r="8"/><path d="M9.500 9.500a2.500 2.500 0 1 1 3.500 2.300c-.7.4-1 .9-1 1.700M12 16.500v.5"/>'),
 lib:ic('<path d="M5 4v16M9 4v16M13 5l5 15"/>'),
 chat:ic('<path d="M5 6h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-7l-4 3.500V16H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z"/><path d="M8.500 10h7M8.500 12.800h4.500"/>'),
 shield:ic('<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/>')
};
const PAGES=[
 ['forum','منتدى آل الزوقري','chat'],['donations','التبرعات والاشتراك','heart'],['member','بوابة العضو','user'],['zakat','الزكاة','coin'],
 ['prayer','أوقات الصلاة','prayer'],['athkar','الأذكار','athkar'],['quran','القرآن الكريم','book'],
 ['hadiths','الأحاديث','scroll'],['library','المكتبة الإسلامية','lib'],['projects','المشاريع','build'],
 ['news','الأخبار','news'],['articles','المقالات','pen'],['report','التقرير المالي','chart'],
 ['about','عن الجمعية','info'],['history','تاريخ القبيلة','tree'],['help','المساعدة','help'],['admin','لوحة المشرف','shield']
];
const TITLE=Object.fromEntries(PAGES.map(p=>[p[0],p[1]]));
let CONTENT=null;
async function content(){if(CONTENT)return CONTENT;
  try{const r=await fetch('content.json',{cache:'no-cache'});CONTENT=await r.json();store.set('content',CONTENT);}
  catch(e){CONTENT=store.get('content',{})||{};}
  return CONTENT;}
async function getJSON(url,key){try{const r=await fetch(url);if(!r.ok)throw 0;const j=await r.json();if(key)store.set(key,j);return j;}
  catch(e){const c=key?store.get(key,null):null;if(c)return c;throw e;}}
const soon=t=>'<div class="empty">'+esc(t||'سيُضاف المحتوى قريباً بإذن الله')+'</div>';
const loading='<div class="empty">جارٍ التحميل…</div>';
const offline='<div class="empty">تعذّر التحميل. تأكد من الاتصال بالإنترنت ثم حاول مرة أخرى.</div>';

/* ---------- الصلاة ---------- */
const PN={fajr:'الفجر',sunrise:'الشروق',dhuhr:'الظهر',asr:'العصر',maghrib:'المغرب',isha:'العشاء'};
function place(){return store.get('place',null)||Object.assign({},window.CITIES[0]);}
function fmt(h){let m=Math.round(h*60)%1440,H=Math.floor(m/60),M=m%60;const ap=H<12?'ص':'م';H=H%12||12;return H+':'+String(M).padStart(2,'0')+' '+ap;}
function prayerNow(){const p=place(),now=new Date();
  const off=p.tz?Prayer.tzOffset(p.tz,now):-now.getTimezoneOffset()/60;
  const local=new Date(now.getTime()+(off*60+now.getTimezoneOffset())*60000);
  const method=store.get('method',p.m||'isna');
  const t=Prayer.compute(local,p.lat,p.lng,off,method,1);
  const cur=local.getHours()+local.getMinutes()/60+local.getSeconds()/3600;
  let next=null;for(const k of ['fajr','dhuhr','asr','maghrib','isha'])if(t[k]>cur){next=k;break;}
  let left;if(next)left=t[next]-cur;else{next='fajr';left=24-cur+t.fajr;}
  return{p,t,next,left,local,method};}
function leftTxt(h){const m=Math.max(0,Math.round(h*60));const H=Math.floor(m/60),M=m%60;return (H?H+' س ':'')+M+' د';}
function hijri(d){try{return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-latn',{day:'numeric',month:'long',year:'numeric'}).format(d);}catch(e){return '';}}
function nextCard(){const s=prayerNow();
  return '<a class="card next" href="#/prayer" style="text-decoration:none"><div><small>الصلاة القادمة</small><b>'+PN[s.next]+'</b><small>'+esc(s.p.n)+'</small></div><div style="text-align:left"><b>'+fmt(s.t[s.next])+'</b><small>بعد '+leftTxt(s.left)+'</small></div></a>';}
function pagePrayer(){const s=prayerNow(),q=Prayer.qibla(s.p.lat,s.p.lng);
  let h='<div class="card"><label>المدينة</label><select id="city">'+(s.p.gps?'<option selected>موقعي الحالي</option>':'')+
    window.CITIES.map(c=>'<option'+(!s.p.gps&&c.n===s.p.n?' selected':'')+'>'+esc(c.n)+'</option>').join('')+'</select>'+
    '<button class="btn ghost" id="gps" style="margin-top:0">استخدم موقعي الحالي</button>'+
    '<p class="muted" style="margin:8px 0 0">موقعك يُستعمل داخل جهازك فقط لحساب الأوقات، ولا يُرسل إلى أي مكان.</p></div>';
  h+='<div class="card"><h3>'+esc(s.p.n)+'</h3><p class="muted" style="margin:0 0 6px">'+esc(hijri(s.local))+'</p>'+
    Object.keys(PN).map(k=>'<div class="row'+(k===s.next?' on':'')+'"><span>'+PN[k]+'</span><span>'+fmt(s.t[k])+'</span></div>').join('')+
    '<label style="display:block;margin-top:12px">طريقة الحساب</label><select id="method">'+
    Object.keys(Prayer.METHODS).map(k=>'<option value="'+k+'"'+(k===s.method?' selected':'')+'>'+Prayer.METHODS[k].name+'</option>').join('')+'</select></div>';
  h+='<div class="card center"><h3>اتجاه القبلة</h3><div class="compass"><div class="needle" id="needle" style="transform:rotate('+q+'deg)"></div><div class="dot"></div></div>'+
    '<p class="muted" id="qtxt">القبلة على '+Math.round(q)+'° من الشمال باتجاه عقارب الساعة</p></div>';
  view.innerHTML=h;
  $('#city').onchange=e=>{const c=window.CITIES.find(x=>x.n===e.target.value);if(c){store.set('place',c);store.set('method',c.m);pagePrayer();}};
  $('#method').onchange=e=>{store.set('method',e.target.value);pagePrayer();};
  $('#gps').onclick=()=>{if(!navigator.geolocation){alertBox('الجهاز لا يدعم تحديد الموقع');return;}
    $('#gps').textContent='جارٍ تحديد الموقع…';
    navigator.geolocation.getCurrentPosition(pos=>{store.set('place',{n:'موقعي الحالي',gps:1,lat:pos.coords.latitude,lng:pos.coords.longitude,tz:null,m:store.get('method','isna')});pagePrayer();},
      ()=>{$('#gps').textContent='لم يُسمح بالموقع — اختر المدينة من القائمة';},{timeout:15000,maximumAge:86400000});};
  const onO=e=>{const hd=e.webkitCompassHeading!=null?e.webkitCompassHeading:(e.absolute&&e.alpha!=null?360-e.alpha:null);
    const n=$('#needle');if(!n){window.removeEventListener('deviceorientationabsolute',onO);window.removeEventListener('deviceorientation',onO);return;}
    if(hd!=null){n.style.transform='rotate('+(q-hd)+'deg)';$('#qtxt').textContent='وجّه أعلى الجوال نحو السهم الذهبي';}};
  window.addEventListener('deviceorientationabsolute',onO);window.addEventListener('deviceorientation',onO);
}
function alertBox(t){const d=document.createElement('div');d.className='card';d.style.cssText='position:fixed;bottom:110px;left:5%;right:5%;z-index:9;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,.25)';d.textContent=t;document.body.appendChild(d);setTimeout(()=>d.remove(),2600);}

/* ---------- الرئيسية ---------- */
async function pageHome(){
  const main=['donations','member','prayer','athkar','quran','hadiths','projects','news','zakat'];
  let h='<div class="card hero"><img src="icon-192.png" alt=""><h2>'+esc(C.name)+'</h2><p>اشتراكك وتبرعك، وأخبار الجمعية ومشاريعها، في مكان واحد</p></div>';
  h+=nextCard();
  h+='<div class="grid">'+main.map(k=>'<a class="tile" href="#/'+k+'"><i>'+ICON[PAGES.find(p=>p[0]===k)[2]]+'</i>'+TITLE[k].replace(' والاشتراك','')+'</a>').join('')+'</div>';
  h+='<div class="card"><h3>ادعم الجمعية</h3><p class="muted" style="margin:0">اشتراك شهري ثابت، أو تبرع بالمبلغ الذي تختاره، بالبطاقة أو من الحساب البنكي.</p><a class="btn gold" href="#/donations">اشترك أو تبرّع</a></div>';
  h+='<div id="hn"></div>';
  view.innerHTML=h;
  const c=await content();const n=(c.news||[]).slice(0,3);
  if(n.length&&$('#hn'))$('#hn').innerHTML='<div class="card"><h3>آخر الأخبار</h3><div class="list">'+n.map((x,i)=>'<a href="#/news/'+i+'"><span>'+esc(x.title)+'</span><small>'+esc(x.date||'')+'</small></a>').join('')+'</div></div>';
}
function pageMore(){view.innerHTML='<div class="card list">'+PAGES.map(p=>'<a href="#/'+p[0]+'"><span style="display:flex;gap:10px;align-items:center">'+ICON[p[2]]+esc(p[1])+'</span><small>‹</small></a>').join('')+'</div>'+
  '<div class="foot">الإصدار '+esc(C.version)+' · <a href="'+esc(C.developer.link)+'" target="_blank" rel="noopener">تواصل مع المطور: '+esc(C.developer.name)+'</a></div>';}

/* ---------- الأذكار ---------- */
function pageAthkar(id){const cat=window.ATHKAR.find(a=>a.id===id)||window.ATHKAR[new Date().getHours()>=15?1:0];
  view.innerHTML='<div class="chips">'+window.ATHKAR.map(a=>'<button data-id="'+a.id+'"'+(a===cat?' class="on"':'')+'>'+a.title+'</button>').join('')+'</div>'+
    cat.items.map((z,i)=>'<div class="card zikr" data-i="'+i+'"><p>'+esc(z.t)+'</p>'+(z.s?'<div class="muted">'+esc(z.s)+'</div>':'')+
      '<div class="count"><span class="muted">'+(z.n>1?z.n+' مرات':'مرة واحدة')+'</span><button data-n="'+z.n+'" data-c="0">0 / '+z.n+'</button></div></div>').join('');
  view.querySelectorAll('.chips button').forEach(b=>b.onclick=()=>pageAthkar(b.dataset.id));
  view.querySelectorAll('.zikr button').forEach(b=>b.onclick=()=>{let c=+b.dataset.c,n=+b.dataset.n;if(c>=n)return;c++;b.dataset.c=c;b.textContent=c>=n?'تمّ ✓':c+' / '+n;
    if(c>=n){b.closest('.zikr').classList.add('done');}if(navigator.vibrate)navigator.vibrate(c>=n?60:12);});}

/* ---------- القرآن ---------- */
async function pageQuran(n){
  view.innerHTML=loading;
  if(!n){try{const j=await getJSON('https://api.alquran.cloud/v1/surah','surahs');
      const last=store.get('lastSurah',null);
      view.innerHTML=(last?'<a class="btn gold" style="margin:0 0 14px" href="#/quran/'+last.n+'">أكمل القراءة: سورة '+esc(last.name)+'</a>':'')+
        '<input id="sq" placeholder="ابحث عن سورة…" inputmode="search"><div class="card list" id="sl"></div>';
      const draw=q=>{$('#sl').innerHTML=j.data.filter(s=>!q||s.name.replace(/[ً-ْٰ]/g,'').includes(q)||String(s.number)===q)
        .map(s=>'<a href="#/quran/'+s.number+'"><span>'+s.number+'. '+esc(s.name)+'</span><small>'+s.numberOfAyahs+' آية · '+(s.revelationType==='Meccan'?'مكية':'مدنية')+'</small></a>').join('')||soon('لا توجد نتيجة');};
      draw('');$('#sq').oninput=e=>draw(e.target.value.trim());
    }catch(e){view.innerHTML=offline;}return;}
  try{const j=await getJSON('https://api.alquran.cloud/v1/surah/'+n+'/quran-uthmani'),s=j.data;
    setTitle(s.name);store.set('lastSurah',{n:s.number,name:s.name.replace(/^سُورَةُ\s*/,'')});
    const B='بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';let ay=s.ayahs.map(a=>a.text);
    let head='';if(s.number!==1&&s.number!==9){head='<div class="basmala">'+B+'</div>';if(ay[0].startsWith(B))ay[0]=ay[0].slice(B.length).trim();}
    view.innerHTML='<div class="card">'+head+'<div class="ayat">'+ay.map((t,i)=>esc(t)+' <span class="n">﴿'+(i+1)+'﴾</span> ').join('')+'</div></div>'+
      '<div style="display:flex;gap:10px">'+(n<114?'<a class="btn" href="#/quran/'+(n+1)+'">السورة التالية</a>':'')+(n>1?'<a class="btn ghost" href="#/quran/'+(n-1)+'">السابقة</a>':'')+'</div>';
    window.scrollTo(0,0);
  }catch(e){view.innerHTML=offline;}
}

/* ---------- الأحاديث ---------- */
async function pageHadiths(i){view.innerHTML=loading;
  try{const j=await getJSON('https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-nawawi.min.json','nawawi');
    if(i==null){view.innerHTML='<div class="card"><h3>الأربعون النووية</h3><div class="list">'+j.hadiths.map((x,k)=>'<a href="#/hadiths/'+k+'"><span>الحديث '+(k+1)+'</span><small>'+esc(x.text.slice(0,38))+'…</small></a>').join('')+'</div></div>';return;}
    const x=j.hadiths[i];if(!x){view.innerHTML=soon();return;}
    setTitle('الحديث '+(i+1));
    view.innerHTML='<div class="card"><p style="font-size:1.15rem;margin:0">'+esc(x.text)+'</p></div><div style="display:flex;gap:10px">'+
      (i<j.hadiths.length-1?'<a class="btn" href="#/hadiths/'+(i+1)+'">التالي</a>':'')+(i>0?'<a class="btn ghost" href="#/hadiths/'+(i-1)+'">السابق</a>':'')+'</div>';window.scrollTo(0,0);
  }catch(e){view.innerHTML=offline;}}

/* ---------- صفحات المحتوى ---------- */
async function pageList(key,i){const c=await content(),arr=c[key]||[];
  if(i!=null&&arr[i]){const x=arr[i];setTitle(x.title);
    view.innerHTML='<div class="card"><h2>'+esc(x.title)+'</h2>'+(x.date?'<p class="muted">'+esc(x.date)+'</p>':'')+'<div style="white-space:pre-wrap">'+esc(x.body||'')+'</div>'+
      (x.link?'<a class="btn" target="_blank" rel="noopener" href="'+esc(x.link)+'">'+esc(x.linkText||'فتح')+'</a>':'')+
      (key==='projects'?'<a class="btn gold" href="#/donations">تبرّع لهذا المشروع</a>':'')+'</div>';return;}
  view.innerHTML=arr.length?'<div class="card list">'+arr.map((x,k)=>'<a href="#/'+key+'/'+k+'"><span>'+esc(x.title)+'</span><small>'+esc(x.date||x.author||'')+'</small></a>').join('')+'</div>':'<div class="card">'+soon()+'</div>';}
async function pageText(key){const c=await content();let h='<div class="card">'+(c[key]?'<div style="white-space:pre-wrap">'+esc(c[key])+'</div>':soon())+'</div>';
  if(key==='about'&&(c.contact||[]).length)h+='<div class="card"><h3>التواصل مع الجمعية</h3><div class="list">'+c.contact.map(x=>'<a href="'+esc(x.link||'#')+'" target="_blank" rel="noopener"><span>'+esc(x.label)+'</span><small dir="ltr">'+esc(x.value||'')+'</small></a>').join('')+'</div></div>';
  view.innerHTML=h;}
const money=n=>'$'+Number(n||0).toLocaleString('en-US',{maximumFractionDigits:2});
async function pageReport(){const c=await content(),r=c.report||{},inc=r.income||[],exp=r.expenses||[];
  if(!inc.length&&!exp.length){view.innerHTML='<div class="card">'+soon('سيُنشر التقرير المالي هنا قريباً بإذن الله')+'</div>';return;}
  const sum=a=>a.reduce((s,x)=>s+Number(x.amount||0),0),tb=a=>'<table>'+a.map(x=>'<tr><td>'+esc(x.label)+'</td><td>'+money(x.amount)+'</td></tr>').join('')+'</table>';
  view.innerHTML='<div class="card"><h3>التقرير المالي '+esc(r.period||'')+'</h3><div class="row"><span>الإيرادات</span><b>'+money(sum(inc))+'</b></div><div class="row"><span>المصروفات</span><b>'+money(sum(exp))+'</b></div><div class="row on"><span>الرصيد</span><b>'+money(sum(inc)-sum(exp))+'</b></div></div>'+
    '<div class="card"><h3>الإيرادات</h3>'+tb(inc)+'</div><div class="card"><h3>المصروفات</h3>'+tb(exp)+'</div>'+(r.note?'<div class="card muted">'+esc(r.note)+'</div>':'');}

/* ---------- الدفع ---------- */
function payBtn(kind,label,cls){const u=(C.stripe||{})[kind];
  return u?'<a class="btn '+(cls||'')+'" href="'+esc(u)+'" target="_blank" rel="noopener">'+label+'</a>'
          :'<button class="btn '+(cls||'')+'" disabled>'+label+' <span class="soon">قريباً</span></button>';}
function pageDonations(){view.innerHTML=
  '<div class="card"><h3>الاشتراك الشهري</h3><p class="muted" style="margin:0">تُدخل بياناتك مرة واحدة، ثم يُخصم الاشتراك كل شهر تلقائياً. وتستطيع إيقافه متى شئت.</p>'+payBtn('monthly','اشترك شهرياً','gold')+'</div>'+
  '<div class="card"><h3>تبرّع بمبلغ تختاره</h3><p class="muted" style="margin:0">تبرع مرة واحدة بأي مبلغ: صدقة، أو دعم لمشروع من مشاريع الجمعية.</p>'+payBtn('donate','تبرّع الآن')+'</div>'+
  '<div class="card"><h3>الزكاة</h3><p class="muted" style="margin:0">احسب زكاتك ثم ادفعها للجمعية.</p><a class="btn ghost" href="#/zakat">حاسبة الزكاة</a></div>'+
  '<div class="card"><h3>طرق الدفع</h3><div class="row"><span>البطاقة البنكية</span><small class="muted">فوري</small></div><div class="row"><span>الحساب البنكي (داخل أمريكا)</span><small class="muted">يصل خلال أيام</small></div>'+
  '<p class="muted" style="margin:10px 0 0">الدفع يتم في صفحة آمنة من شركة Stripe، والتطبيق لا يرى رقم بطاقتك ولا يحفظه.</p></div>';}
function pageZakat(){view.innerHTML='<div class="card"><h3>حاسبة زكاة المال</h3>'+
  '<label>المال النقدي والأرصدة ($)</label><input id="z1" inputmode="decimal" placeholder="0">'+
  '<label>قيمة الذهب والفضة المدّخرة ($)</label><input id="z2" inputmode="decimal" placeholder="0">'+
  '<label>عروض التجارة والديون المرجوّة ($)</label><input id="z3" inputmode="decimal" placeholder="0">'+
  '<label>الديون التي عليك وتحلّ الآن ($)</label><input id="z4" inputmode="decimal" placeholder="0">'+
  '<label>سعر غرام الذهب اليوم ($) — لحساب النصاب (85 غراماً)</label><input id="z5" inputmode="decimal" placeholder="مثال: 130" value="'+esc(store.get('gold',''))+'">'+
  '<div id="zr" class="empty" style="padding:10px">أدخل الأرقام لتظهر النتيجة</div></div>'+
  '<div class="card"><p class="muted" style="margin:0">تجب الزكاة إذا بلغ المال النصاب وحال عليه الحول، ومقدارها ربع العشر (2.5%). الحاسبة للتقريب، وما أشكل عليك فاسأل عنه أهل العلم.</p>'+payBtn('zakat','ادفع زكاتك للجمعية','gold')+'</div>';
  const v=id=>parseFloat(String($(id).value).replace(/,/g,''))||0;
  const calc=()=>{const net=v('#z1')+v('#z2')+v('#z3')-v('#z4'),g=v('#z5');store.set('gold',$('#z5').value);
    if(net<=0){$('#zr').textContent='أدخل الأرقام لتظهر النتيجة';return;}
    const nis=g*85;let t='<div class="row"><span>المال الخاضع للزكاة</span><b>'+money(net)+'</b></div>';
    if(g>0)t+='<div class="row"><span>النصاب</span><b>'+money(nis)+'</b></div>';
    if(g>0&&net<nis)t+='<div class="row on"><span>لم يبلغ النصاب</span><b>لا زكاة</b></div>';
    else t+='<div class="row on"><span>الزكاة الواجبة</span><b>'+money(net*0.025)+'</b></div>';
    $('#zr').className='';$('#zr').innerHTML=t;};
  view.querySelectorAll('input').forEach(i=>i.oninput=calc);}
function pageMember(){view.innerHTML='<div class="card center"><h3>بوابة العضو</h3><p class="muted">هنا يرى العضو اشتراكه ومدفوعاته وإيصالاته، ويعدّل بياناته.</p>'+
  '<button class="btn" disabled>تسجيل الدخول <span class="soon">قريباً</span></button><button class="btn ghost" disabled>تسجيل عضو جديد <span class="soon">قريباً</span></button></div>'+
  '<div class="card"><h3>اشتراك العضو</h3>'+payBtn('monthly','اشترك شهرياً','gold')+'</div>';}
function pageAdmin(){view.innerHTML='<div class="card center"><h3>لوحة المشرف</h3><p class="muted">منها يضيف المشرف الأخبار والمشاريع والمقالات والتقرير المالي، ويتابع الأعضاء واشتراكاتهم.</p><button class="btn" disabled>دخول المشرف <span class="soon">قريباً</span></button></div>';}
function pageHelp(){const q=[['كيف أشترك شهرياً؟','من صفحة «التبرعات» اضغط «اشترك شهرياً»، ثم أدخل بطاقتك أو حسابك البنكي مرة واحدة.'],
  ['هل أستطيع إيقاف الاشتراك؟','نعم، في أي وقت، من رابط إدارة الاشتراك الذي يصلك على بريدك بعد الدفع.'],
  ['هل بياناتي البنكية محفوظة في التطبيق؟','لا. الدفع يتم في صفحة شركة Stripe، والتطبيق لا يرى رقم البطاقة.'],
  ['كيف أغيّر مدينة أوقات الصلاة؟','من صفحة «الصلاة» اختر مدينتك، أو اضغط «استخدم موقعي الحالي».'],
  ['هل يعمل التطبيق بلا إنترنت؟','أوقات الصلاة والأذكار تعمل بلا إنترنت. والسور والأحاديث التي فتحتها تبقى محفوظة.']];
  view.innerHTML='<div class="card">'+q.map(x=>'<details style="border-bottom:1px solid var(--line);padding:10px 0"><summary><b>'+x[0]+'</b></summary><p class="muted" style="margin:6px 0 0">'+x[1]+'</p></details>').join('')+'</div>'+
  '<a class="btn ghost" target="_blank" rel="noopener" href="'+esc(C.developer.link)+'">تواصل مع المطور</a>';}

/* ---------- منتدى آل الزوقري (وضع المعاينة حتى تُضاف حسابات الأعضاء) ---------- */
const FDEF={open:true,who:'all',hidden:false,auto24:true,gap:60,newRO:false,notify:true};
const fset=()=>Object.assign({},FDEF,store.get('forum',{}));
const fsave=o=>store.set('forum',Object.assign(fset(),o));
const WHO={all:'الجميع',subs:'المشتركون والمشرفون',mods:'المشرفون فقط',dev:'المطور فقط'};
const RULES=['الاحترام بين الأعضاء، وترك السبّ والتجريح.','الكلام فيما ينفع: شؤون الجمعية والقبيلة والتواصل بين أهلها.','يُمنع وضع الروابط الخارجية.','يُمنع وضع أرقام الهواتف.','لا صور في المنتدى، الرسائل نصية فقط.','يُمنع الإعلان والبيع وطلب المال من الأعضاء.','من خالف يُنبَّه أولاً، ثم يُوقف أو يُحظر بقرار المشرف.'];
const MARK={dev:'<span class="mark dev">✓</span><span class="role">المطوّر</span>',mod:'<span class="mark mod">✓</span><span class="role">المشرف</span>',sub:'<span class="mark sub">✓</span>'};
// فحص الرسالة قبل الإرسال: الروابط وأرقام الدول تُمنع، والأرقام الطويلة تذهب إلى «المشكوك فيها»
function checkMsg(t){const n=String(t).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d));
  if(/(https?:\/\/|www\.|t\.me\/|wa\.me\/|\b[a-z0-9-]+\.(com|net|org|me|io|app|co)\b)/i.test(n))return 'link';
  if(/(\+|00)\s?\d[\d\s-]{6,}/.test(n))return 'phone';
  if(/\d[\d\s-]{5,}\d/.test(n)&&n.replace(/\D/g,'').length>6)return 'doubt';
  return 'ok';}
window.checkMsg=checkMsg;
const later=()=>alertBox('يعمل هذا الزر بعد إضافة حسابات الأعضاء');
function pageForum(sub){if(sub==='admin')return pageForumAdmin();if(sub==='rules')return pageForumRules();
  const s=fset(),canSend=s.open&&!s.hidden;
  const sample=[
   {n:C.developer.name,r:'dev',t:'مرحباً بكم في منتدى آل الزوقري. هنا يتواصل أبناء القبيلة وأعضاء الجمعية.',d:'نموذج'},
   {n:'مشرف المنتدى',r:'mod',t:'نرجو قراءة قوانين المنتدى قبل المشاركة.',d:'نموذج'},
   {n:'عضو مشترك',r:'sub',t:'جزاكم الله خيراً على هذا التطبيق.',d:'نموذج',q:'مرحباً بكم في منتدى آل الزوقري…'}];
  view.innerHTML='<div class="forum"><div class="fhead"><div><h2>منتدى آل الزوقري</h2><span class="state'+(canSend?'':' off')+'">'+(s.hidden?'مخفي عن الأعضاء':s.open?'مفتوح · يرسل: '+WHO[s.who]:'الإرسال متوقف')+'</span></div>'+
    '<div style="display:flex;gap:8px"><a class="ibtn" href="#/forum/rules" aria-label="القوانين">'+ICON.scroll+'</a><a class="ibtn" href="#/forum/admin" aria-label="تحكم المطور">'+ICON.shield+'</a></div></div>'+
    '<div class="note">المنتدى الآن في وضع المعاينة: الرسائل الظاهرة نماذج لشكل المنتدى، والإرسال يعمل بعد إضافة حسابات الأعضاء.</div>'+
    sample.map(m=>'<div class="msg"><div class="who"><span>'+esc(m.n)+'</span>'+MARK[m.r]+'<small>'+m.d+'</small></div>'+(m.q?'<div class="reply">'+esc(m.q)+'</div>':'')+'<p>'+esc(m.t)+'</p>'+
      '<div class="acts"><button data-a>ردّ</button><button data-a>إبلاغ</button></div></div>').join('')+
    '<div class="sw" style="border:0"><span>إشعارات المنتدى<small>الرد على رسالتك يصلك دائماً</small></span><input type="checkbox" id="fn"'+(s.notify?' checked':'')+'></div>'+
    (canSend?'<div class="composer"><input placeholder="اكتب رسالتك…" disabled><button id="fl">تسجيل الدخول <span class="soon">قريباً</span></button></div>'
            :'<div class="composer"><input placeholder="الإرسال متوقف الآن" disabled></div>')+'</div>';
  view.querySelectorAll('[data-a]').forEach(b=>b.onclick=later);const fl=$('#fl');if(fl)fl.onclick=later;
  $('#fn').onchange=e=>fsave({notify:e.target.checked});}
function pageForumRules(){setTitle('قوانين المنتدى');
  view.innerHTML='<div class="card forum"><h3>قوانين منتدى آل الزوقري</h3><ol class="rules">'+RULES.map(r=>'<li>'+r+'</li>').join('')+'</ol>'+
    '<p class="muted" style="margin:0">الرابط الخارجي ورقم الهاتف بمفتاح الدولة يُمنعان تلقائياً: في المرة الأولى تنبيه، وفي الثانية يُجمَّد الحساب 5 ساعات.</p></div>'+
    '<button class="btn ghost" id="er">تعديل القوانين (للمطور والمشرفين) <span class="soon">قريباً</span></button>';$('#er').onclick=later;}
function pageForumAdmin(){setTitle('تحكم المنتدى');const s=fset();
  const sw=(k,t,d)=>'<div class="sw"><span>'+t+(d?'<small>'+d+'</small>':'')+'</span><input type="checkbox" data-k="'+k+'"'+(s[k]?' checked':'')+'></div>';
  const row=(t,d)=>'<a href="javascript:void 0" data-l><span>'+t+(d?'<br><small>'+d+'</small>':'')+'</span><small class="soon">قريباً</small></a>';
  view.innerHTML='<div class="note">هذه الصفحة معاينة الآن. بعد إضافة الحسابات لا تظهر إلا للمطور والمشرفين، وتُطبَّق إعداداتها على الجميع.</div>'+
   '<div class="card"><h3>الإرسال</h3>'+sw('open','المنتدى مفتوح للإرسال','عند الإيقاف يختفي مربع الكتابة، وتبقى الرسائل مقروءة')+
     '<div style="padding:10px 2px"><span>من يستطيع الإرسال</span><div class="seg" id="who">'+Object.keys(WHO).map(k=>'<button data-v="'+k+'"'+(s.who===k?' class="on"':'')+'>'+WHO[k]+'</button>').join('')+'</div></div>'+
     '<div style="padding:10px 2px"><span>المدة بين رسالتين للعضو</span><div class="seg three" id="gap">'+[[50,'50 ثانية'],[60,'دقيقة'],[300,'5 دقائق']].map(g=>'<button data-v="'+g[0]+'"'+(s.gap===g[0]?' class="on"':'')+'>'+g[1]+'</button>').join('')+'</div></div>'+
     sw('newRO','العضو الجديد يقرأ فقط في يومه الأول')+'</div>'+
   '<div class="card"><h3>للمطور وحده</h3>'+sw('auto24','إغلاق تلقائي بعد 24 ساعة','يتوقف الإرسال حتى تفتحه من جديد')+sw('hidden','إخفاء المنتدى عن الجميع','لا يراه إلا المطور والمشرفون')+
     '<div class="list">'+row('المشرفون','إضافة مشرف أو إزالته')+'</div></div>'+
   '<div class="card"><h3>المتابعة</h3><div class="list">'+row('الرسائل المشكوك فيها','أرقام طويلة تحتاج نظرك')+row('رسائل قيد المراجعة','قبول أو رفض، مع ملاحظة خاصة للعضو')+row('البلاغات','ما أبلغ عنه الأعضاء')+row('سجل التحذيرات والحظر','من حُذِّر أو حُظر، ومن حظره، ولماذا، وعلى أي رسالة')+'</div></div>'+
   '<div class="card"><h3>الأعضاء</h3><div class="list">'+row('حظر عضو')+row('إيقاف عضو أو تجميده مدة')+row('وضع رسائل عضو تحت المراجعة')+row('علامة «مخالف»','يراها المطور والمشرفون فقط')+'</div></div>'+
   '<div class="card"><h3>ثوابت المنتدى</h3><div class="row"><span>مدة بقاء الرسائل</span><small class="muted">30 يوماً ثم تُحذف</small></div><div class="row"><span>الصور</span><small class="muted">غير مسموحة</small></div><div class="row"><span>تعديل الرسالة</span><small class="muted">لا، الحذف فقط</small></div>'+
     '<div class="row"><span>العلامات</span><span>'+MARK.dev+' '+MARK.mod+' '+MARK.sub+'<span class="role">مشترك</span></span></div></div>';
  view.querySelectorAll('.sw input').forEach(i=>i.onchange=()=>fsave({[i.dataset.k]:i.checked}));
  const seg=(id,key,num)=>view.querySelectorAll('#'+id+' button').forEach(b=>b.onclick=()=>{fsave({[key]:num?+b.dataset.v:b.dataset.v});pageForumAdmin();});
  seg('who','who');seg('gap','gap',1);view.querySelectorAll('[data-l]').forEach(a=>a.onclick=later);}

/* ---------- التنقل ---------- */
function setTitle(t){$('#title').textContent=t;}
function route(){const parts=(location.hash.replace(/^#\/?/,'')||'').split('/'),p=parts[0]||'home',a=parts[1],num=a!=null&&a!==''?parseInt(a,10):null;
  setTitle(p==='home'?C.name:p==='more'?'المزيد':(TITLE[p]||C.name));
  $('#back').hidden=(p==='home');
  document.querySelectorAll('#tabs a').forEach(x=>x.classList.toggle('on',x.dataset.tab===p||(x.dataset.tab==='more'&&!['home','prayer','forum','donations'].includes(p))));
  if(a==null)window.scrollTo(0,0);
  switch(p){case 'home':return pageHome();case 'more':return pageMore();case 'prayer':return pagePrayer();
    case 'athkar':return pageAthkar(a);case 'quran':return pageQuran(num);case 'hadiths':return pageHadiths(num);
    case 'library':case 'projects':case 'news':case 'articles':return pageList(p,num);
    case 'about':case 'history':return pageText(p);case 'report':return pageReport();
    case 'donations':return pageDonations();case 'zakat':return pageZakat();case 'member':return pageMember();
    case 'forum':return pageForum(a);case 'admin':return pageAdmin();case 'help':return pageHelp();default:location.hash='#/';}}
$('#back').onclick=()=>{if(history.length>1)history.back();else location.hash='#/';};
if(store.get('dark',false))document.documentElement.classList.add('dark');
$('#theme').onclick=()=>{const d=document.documentElement.classList.toggle('dark');store.set('dark',d);};
window.addEventListener('hashchange',route);route();
setInterval(()=>{if((location.hash.replace(/^#\/?/,'')||'')==='')pageHome();},60000);
if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});
})();

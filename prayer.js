// حساب أوقات الصلاة والقبلة على الجهاز (بلا إنترنت)
(function(){
const R=Math.PI/180, sin=d=>Math.sin(d*R), cos=d=>Math.cos(d*R), tan=d=>Math.tan(d*R);
const asin=x=>Math.asin(x)/R, acos=x=>Math.acos(Math.max(-1,Math.min(1,x)))/R, atan2=(y,x)=>Math.atan2(y,x)/R, acot=x=>Math.atan(1/x)/R;
const fix=(a,b)=>{a=a-b*Math.floor(a/b);return a<0?a+b:a;};
const METHODS={
  isna:{name:'أمريكا الشمالية (ISNA)',fajr:15,isha:15},
  mwl:{name:'رابطة العالم الإسلامي',fajr:18,isha:17},
  makkah:{name:'أم القرى',fajr:18.5,ishaMin:90},
  egypt:{name:'الهيئة المصرية',fajr:19.5,isha:17.5}
};
function julian(y,m,d){if(m<=2){y-=1;m+=12;}const A=Math.floor(y/100),B=2-A+Math.floor(A/4);
  return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+B-1524.5;}
function sun(jd){const D=jd-2451545.0,g=fix(357.529+0.98560028*D,360),q=fix(280.459+0.98564736*D,360),
  L=fix(q+1.915*sin(g)+0.020*sin(2*g),360),e=23.439-0.00000036*D,RA=fix(atan2(cos(e)*sin(L),cos(L))/15,24);
  return{decl:asin(sin(e)*sin(L)),eqt:q/15-RA};}
function compute(date,lat,lng,tz,methodKey,asrFactor){
  const m=METHODS[methodKey]||METHODS.isna;
  const jd=julian(date.getFullYear(),date.getMonth()+1,date.getDate())-lng/(15*24);
  const mid=t=>fix(12-sun(jd+t).eqt,24);
  const sat=(angle,t,ccw)=>{const d=sun(jd+t).decl,noon=mid(t),
    T=acos((-sin(angle)-sin(d)*sin(lat))/(cos(d)*cos(lat)))/15;return noon+(ccw?-T:T);};
  const asr=(f,t)=>{const d=sun(jd+t).decl;return sat(-acot(f+tan(Math.abs(lat-d))),t,false);};
  let t={fajr:5,sunrise:6,dhuhr:12,asr:13,maghrib:18,isha:18};
  for(let i=0;i<2;i++){const h={};for(const k in t)h[k]=t[k]/24;
    t={fajr:sat(m.fajr,h.fajr,true),sunrise:sat(0.833,h.sunrise,true),dhuhr:mid(h.dhuhr),
       asr:asr(asrFactor||1,h.asr),maghrib:sat(0.833,h.maghrib,false),isha:sat(m.isha||18,h.isha,false)};}
  for(const k in t)t[k]=t[k]+tz-lng/15;
  if(m.ishaMin)t.isha=t.maghrib+m.ishaMin/60;
  t.dhuhr+=1/60;
  for(const k in t)t[k]=fix(t[k],24);
  return t;
}
function qibla(lat,lng){const kLat=21.4225,kLng=39.8262;
  return fix(atan2(sin(kLng-lng),cos(lat)*tan(kLat)-sin(lat)*cos(kLng-lng)),360);}
function tzOffset(tzName,date){try{
  const f=new Intl.DateTimeFormat('en-US',{timeZone:tzName,hour12:false,year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'numeric'});
  const p={};f.formatToParts(date).forEach(x=>p[x.type]=x.value);
  const asUTC=Date.UTC(+p.year,+p.month-1,+p.day,(+p.hour)%24,+p.minute);
  return Math.round((asUTC-date.getTime())/60000)/60;}catch(e){return -date.getTimezoneOffset()/60;}}
window.Prayer={compute,qibla,METHODS,tzOffset};
})();

const V='zaqri-v3';
const SHELL=['./','index.html','styles.css','app.js','prayer.js','data.js','config.js','content.json','manifest.json','icon-192.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k!=='zaqri-data').map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url); if(e.request.method!=='GET')return;
  if(u.hostname==='api.alquran.cloud'||u.hostname==='cdn.jsdelivr.net'){ // محتوى ثابت: من المحفوظ أولاً
    e.respondWith(caches.open('zaqri-data').then(c=>c.match(e.request).then(r=>r||fetch(e.request).then(n=>{if(n.ok)c.put(e.request,n.clone());return n;}))));return;}
  if(u.origin===location.origin){ // ملفات التطبيق: من الشبكة أولاً ثم المحفوظ
    e.respondWith(fetch(e.request).then(n=>{const cp=n.clone();caches.open(V).then(c=>c.put(e.request,cp));return n;}).catch(()=>caches.match(e.request).then(r=>r||caches.match('index.html'))));}
});

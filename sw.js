const CACHE='girly-wb-v3';
const PRECACHE=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(PRECACHE).catch(()=>{})).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  if(url.origin!==self.location.origin)return;
  e.respondWith((async()=>{
    try{
      const res=await fetch(e.request);
      if(res&&res.ok){
        const cache=await caches.open(CACHE);
        cache.put(e.request,res.clone()).catch(()=>{});
      }
      return res;
    }catch(err){
      const cached=await caches.match(e.request);
      if(cached)return cached;
      if(e.request.mode==='navigate'){
        const nav=await caches.match('./index.html',{ignoreSearch:true});
        if(nav)return nav;
      }
      return new Response('离线中，请检查网络',{status:503});
    }
  })());
});

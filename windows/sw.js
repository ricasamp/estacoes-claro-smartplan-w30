const CACHE='claro-smartplan-w30-v1';
const SHELL=['./','./index.html','./manifest.webmanifest'];
const DATA_PATH='./data/sites.json';
const DATA_URL='https://raw.githubusercontent.com/ricasamp/estacoes-claro-smartplan-w30/main/app/src/main/assets/sites.json';
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const u=new URL(event.request.url);
 if(event.request.method!=='GET')return;
 if(u.origin===location.origin && (u.pathname.endsWith('/data/sites.json'))){
   event.respondWith((async()=>{
     const cache=await caches.open(CACHE);
     try{const fresh=await fetch(DATA_URL,{cache:'no-store'});if(!fresh.ok)throw Error('Falha ao atualizar cadastro');await cache.put(event.request,fresh.clone());return fresh}
     catch(e){const saved=await cache.match(event.request);if(saved)return saved;return new Response(JSON.stringify({error:'Base ainda não disponível offline. Conecte à internet para a primeira sincronização.'}),{status:503,headers:{'Content-Type':'application/json'}})}
   })());return;
 }
 if(u.origin===location.origin){event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));return response}).catch(()=>caches.match('./index.html'))))}
});
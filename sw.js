/* Service worker : le réseau d'abord, la copie locale en secours (hors ligne ou site en maintenance). */
const C="ecole-eleves-v8-7";
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(["./","index.html","config.js","manifest.json","icon-192.png"])).catch(()=>{}))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{const r=e.request;if(r.method!=="GET"||new URL(r.url).origin!==location.origin)return;
  e.respondWith(fetch(r).then(res=>{
    if(res.ok){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp));return res}
    /* page introuvable pendant une mise à jour : on garde le joueur dans l'application déjà installée */
    if(res.status===404&&r.mode==="navigate")return caches.match("index.html").then(m=>m||res);
    return res}).catch(()=>caches.match(r).then(m=>m||caches.match("index.html"))))});

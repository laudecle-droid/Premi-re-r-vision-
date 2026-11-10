/* Service worker : le réseau d'abord, la copie locale en secours (hors ligne ou site en maintenance).
   Les scripts et polices externes (Supabase, Google Fonts) sont aussi gardés pour que le site s'ouvre hors connexion. */
const C="ecole-eleves-v9-3";
const EXT=["cdn.jsdelivr.net","fonts.googleapis.com","fonts.gstatic.com"];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(["./","index.html","config.js","manifest.json","icon-192.png"])).catch(()=>{}))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{const r=e.request;if(r.method!=="GET")return;
  const u=new URL(r.url),same=u.origin===location.origin;
  if(!same&&!EXT.includes(u.hostname))return;
  e.respondWith(fetch(r).then(res=>{
    if(res.ok||res.type==="opaque"){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp)).catch(()=>{});return res}
    /* page introuvable pendant une mise à jour : on garde le joueur dans l'application déjà installée */
    if(same&&res.status===404&&r.mode==="navigate")return caches.match("index.html").then(m=>m||res);
    return res}).catch(()=>caches.match(r).then(m=>m||(r.mode==="navigate"?caches.match("index.html"):Response.error()))))});

/* LHA service worker: public content only. Private/auth/payment requests are always network-only. */
const VERSION='lha-v7-20260730-mobile-performance',STATIC=`${VERSION}-static`,MEDIA=`${VERSION}-media`,PAGES=`${VERSION}-pages`;
const CORE=['/','/offline','/favicon.svg','/site.webmanifest','/brand/lha-mark-black.png','/brand/lha-mark-white.png','/brand/lha-wordmark-black.svg','/brand/lha-wordmark-white.svg','/media/hero/lha-hero-poster.webp','/media/hero/lha-hero-poster-mobile.webp'];
const PRIVATE=/\/auth\b|\/account\b|\/checkout\b|\/order-tracking\b|supabase\.co\/auth|\/rest\/v1\/(profiles|user_state|addresses)/i;
const limit=async(name,max)=>{const c=await caches.open(name),keys=await c.keys();await Promise.all(keys.slice(0,Math.max(0,keys.length-max)).map(k=>c.delete(k)))};
self.addEventListener('install',e=>e.waitUntil(caches.open(STATIC).then(c=>c.addAll(CORE))));
self.addEventListener('activate',e=>e.waitUntil((async()=>{for(const k of await caches.keys())if(![STATIC,MEDIA,PAGES].includes(k))await caches.delete(k);await self.clients.claim()})()));
self.addEventListener('fetch',e=>{const r=e.request,u=new URL(r.url);if(r.method!=='GET'||PRIVATE.test(u.href)||u.origin!==location.origin)return;
 if(r.mode==='navigate'){e.respondWith((async()=>{const c=await caches.open(PAGES);try{const ctrl=new AbortController(),t=setTimeout(()=>ctrl.abort(),4500),res=await fetch(r,{signal:ctrl.signal});clearTimeout(t);if(res.ok&&!PRIVATE.test(u.pathname))c.put(r,res.clone());limit(PAGES,24);return res}catch{return await c.match(r)||await caches.match('/offline')}})());return}
 if(/\.(?:png|jpg|jpeg|webp|avif|svg|woff2?)$/i.test(u.pathname)){e.respondWith((async()=>{const c=await caches.open(MEDIA),hit=await c.match(r);const update=fetch(r).then(res=>{if(res.ok){c.put(r,res.clone());limit(MEDIA,160)}return res}).catch(()=>null);return hit||await update||Response.error()})());return}
 if(/\/assets\/.*\.(?:js|css)$/i.test(u.pathname)){e.respondWith(caches.open(STATIC).then(async c=>await c.match(r)||fetch(r).then(res=>{if(res.ok)c.put(r,res.clone());return res})));}
});
self.addEventListener('message',e=>{if(e.data?.type==='SKIP_WAITING')self.skipWaiting();if(e.data?.type==='CLEAR_SAFE_CACHES')e.waitUntil(Promise.all([caches.delete(MEDIA),caches.delete(PAGES)]))});

/* DPDORE — funcionamento sem internet (rede primeiro, com a cópia guardada como alternativa). */
const CACHE = "dpdore-v903-b3e71d04";
const FILES = [
  "./",
  "./index.html",
  "./css/styles.css?v=b3e71d04",
  "./js/vendor/chart.umd.min.js",
  "./js/vendor/xlsx.full.min.js",
  "./js/vendor/jszip.min.js",
  "./js/vendor/pptxgen.min.js",
  "./js/data.js?v=b3e71d04",
  "./js/app.js?v=b3e71d04",
  "./js/pwa.js?v=b3e71d04",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];
const ESPERA_REDE = 3500;
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(FILES.map((f) => fetch(f, { cache: "reload" }).then((r) => (r.ok ? c.put(f, r) : null)).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith("dpdore-") && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  const pasta = new URL("./", self.location.href).pathname;
  /* Só trata pedidos desta origem E da pasta do DPDORE: nunca interfere com outras apps no mesmo domínio. */
  if (req.method !== "GET" || url.origin !== self.location.origin || !url.pathname.startsWith(pasta)) return;
  const chave = req.mode === "navigate" ? "./index.html" : req;
  e.respondWith(new Promise((resolve) => {
    let feito = false; const fim = (r) => { if (!feito && r) { feito = true; resolve(r); } };
    const guardada = () => caches.match(chave, { ignoreSearch: req.mode === "navigate" });
    const t = setTimeout(() => guardada().then(fim), ESPERA_REDE);
    fetch(req).then((res) => { clearTimeout(t); if (res.ok && res.type === "basic") { const c = res.clone(); caches.open(CACHE).then((x) => x.put(chave, c)).catch(() => {}); } fim(res); })
      .catch(() => { clearTimeout(t); guardada().then((r) => fim(r || Response.error())); });
  }));
});

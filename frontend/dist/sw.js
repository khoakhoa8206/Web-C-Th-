/**
 * Service Worker cơ bản — cache-first cho tài nguyên tĩnh (CSS, JS, ảnh nền).
 * KHÔNG cache các request API (điều đó do React Query + Dexie đảm nhiệm ở
 * tầng ứng dụng, có kiểm soát logic online/offline riêng).
 */
const CACHE_NAME = "student-vocab-static-v1";

const STATIC_EXTENSIONS = [".css", ".js", ".png", ".jpg", ".jpeg", ".svg", ".webp", ".woff", ".woff2"];

function isStaticAsset(url) {
  return STATIC_EXTENSIONS.some((ext) => url.pathname.endsWith(ext));
}

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Chỉ can thiệp GET request tới tài nguyên tĩnh cùng origin
  if (event.request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }
  if (!isStaticAsset(url)) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(event.request);
      if (cached) {
        // Cache-first: trả cache ngay, đồng thời âm thầm cập nhật cache ở nền
        fetch(event.request)
          .then((res) => res.ok && cache.put(event.request, res.clone()))
          .catch(() => {});
        return cached;
      }
      try {
        const response = await fetch(event.request);
        if (response.ok) cache.put(event.request, response.clone());
        return response;
      } catch (err) {
        return cached || Response.error();
      }
    })
  );
});

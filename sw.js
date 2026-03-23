// ============================================
// sw.js — DROP-IN REPLACEMENT
// Pre-caches ALL pages at install time
// ============================================

const CACHE_NAME = '2nd-sem-v2'; // Change version to force update

const PRECACHE_URLS = [
  
  // ── Root ──
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  
  // ── Global CSS & JS ──
  '/css/main.css',
  '/js/app.js',
  '/js/data.js',
  
  // ── Shared Unit Engine ──
  '/units-com/base.css',
  '/units-com/engine.js',
  
  // ── PYQ Assets ──
  '/pyq-assets/css/pyq-style.css',
  '/pyq-assets/js/pyq-app.js',
  '/pyq-assets/js/pyq-helpers.js',
  '/pyq-assets/js/pyq-render.js',
  '/pyq-assets/js/pyq-storage.js',
  
  // ── App Resources ──
  '/app-resorses/styles/professional.css',
  '/app-resorses/scripts/navigation.js',
  '/app-resorses/sections/about-app.html',
  '/app-resorses/sections/contact-support.html',
  '/app-resorses/sections/credits-thanks.html',
  '/app-resorses/sections/disclaimer-notice.html',
  '/app-resorses/sections/privacy-policy.html',
  '/app-resorses/sections/professional-hub.html',
  '/app-resorses/sections/send-feedback.html',
  '/app-resorses/sections/terms-conditions.html',
  '/app-resorses/sections/usage-guide.html',
  
  // ── Icons ──
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-180x180.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  
  // ══════════════════════════════════════
  // APPLIED PHYSICS II
  // ══════════════════════════════════════
  '/Applied-Physics-II/Applied-Physics-II-Unit-1.html',
  '/Applied-Physics-II/Applied-Physics-II-Unit-2.html',
  '/Applied-Physics-II/Applied-Physics-II-Unit-3.html',
  '/Applied-Physics-II/Applied-Physics-II-Unit-4.html',
  '/Applied-Physics-II/Applied-Physics-II-Unit-5.html',
  '/Applied-Physics-II/Applied-Physics-II-Unit-6.html',
  '/Applied-Physics-II/Applied-Physics-II-Unit-7.html',
  '/Applied-Physics-II/Formula-Sheet.html',
  '/Applied-Physics-II/all_questions/21.html',
  '/Applied-Physics-II/all_questions/22.html',
  '/Applied-Physics-II/all_questions/23.html',
  '/Applied-Physics-II/all_questions/24.html',
  '/Applied-Physics-II/all_questions/25.html',
  '/Applied-Physics-II/all_answers/index.html',
  '/Applied-Physics-II/all_answers/data/2021.json',
  '/Applied-Physics-II/all_answers/data/2022.json',
  '/Applied-Physics-II/all_answers/data/2023.json',
  '/Applied-Physics-II/all_answers/data/2024.json',
  '/Applied-Physics-II/all_answers/data/2025.json',
  
  // ══════════════════════════════════════
  // ENGINEERING MECHANICS
  // ══════════════════════════════════════
  '/Engineering-Mechanics/Engineering-Mechanics-Unit-1.html',
  '/Engineering-Mechanics/Engineering-Mechanics-Unit-2.html',
  '/Engineering-Mechanics/Engineering-Mechanics-Unit-3.html',
  '/Engineering-Mechanics/Engineering-Mechanics-Unit-4.html',
  '/Engineering-Mechanics/Engineering-Mechanics-Unit-5.html',
  '/Engineering-Mechanics/Engineering-Mechanics-Unit-6.html',
  '/Engineering-Mechanics/Engineering-Mechanics-Motion-in-Plane.html',
  '/Engineering-Mechanics/all_questions/21.html',
  '/Engineering-Mechanics/all_questions/22.html',
  '/Engineering-Mechanics/all_questions/23.html',
  '/Engineering-Mechanics/all_questions/24.html',
  '/Engineering-Mechanics/all_questions/25.html',
  '/Engineering-Mechanics/all_questions/22/6a.jpg',
  '/Engineering-Mechanics/all_questions/22/6c.jpg',
  '/Engineering-Mechanics/all_questions/22/7a.jpg',
  '/Engineering-Mechanics/all_questions/23/fig5a.jpg',
  '/Engineering-Mechanics/all_questions/23/fig5b.jpg',
  '/Engineering-Mechanics/all_questions/23/fig9b.jpg',
  '/Engineering-Mechanics/all_questions/25/3a.jpg',
  '/Engineering-Mechanics/all_questions/25/4b.jpg',
  '/Engineering-Mechanics/all_questions/25/5a.jpg',
  '/Engineering-Mechanics/all_questions/25/9b.jpg',
  '/Engineering-Mechanics/all_answers/index.html',
  '/Engineering-Mechanics/all_answers/data/2021.json',
  '/Engineering-Mechanics/all_answers/data/2022.json',
  '/Engineering-Mechanics/all_answers/data/2023.json',
  '/Engineering-Mechanics/all_answers/data/2024.json',
  '/Engineering-Mechanics/all_answers/data/2025.json',
  
  // ══════════════════════════════════════
  // FEEE
  // ══════════════════════════════════════
  '/FEEE/FEEE-Unit-1.html',
  '/FEEE/FEEE-Unit-2.html',
  '/FEEE/FEEE-Unit-3.html',
  '/FEEE/FEEE-Unit-4.html',
  '/FEEE/FEEE-Unit-5.html',
  '/FEEE/FEEE-Unit-6.html',
  '/FEEE/FEEE-Unit-7.html',
  '/FEEE/Formula-Sheet.html',
  '/FEEE/all_questions/21.html',
  '/FEEE/all_questions/22.html',
  '/FEEE/all_questions/23.html',
  '/FEEE/all_questions/24.html',
  '/FEEE/all_questions/25.html',
  '/FEEE/all_questions/21/fig2b.jpg',
  '/FEEE/all_questions/22/5i.jpg',
  '/FEEE/all_questions/24/2b.jpg',
  '/FEEE/all_answers/index.html',
  '/FEEE/all_answers/data/2021.json',
  '/FEEE/all_answers/data/2022.json',
  '/FEEE/all_answers/data/2023.json',
  '/FEEE/all_answers/data/2024.json',
  '/FEEE/all_answers/data/2025.json',
  
  // ══════════════════════════════════════
  // IT SYSTEMS THEORY
  // ══════════════════════════════════════
  '/IT-Systems-Theory/IT-Systems-Unit-1.html',
  '/IT-Systems-Theory/IT-Systems-Unit-2.html',
  '/IT-Systems-Theory/IT-Systems-Unit-3.html',
  '/IT-Systems-Theory/IT-Systems-HTML5.html',
  '/IT-Systems-Theory/IT-Systems-Unit-4-Cybersecurity.html',
  '/IT-Systems-Theory/base.css',
  '/IT-Systems-Theory/engine.js',
  '/IT-Systems-Theory/all_questions/21.html',
  '/IT-Systems-Theory/all_questions/22.html',
  '/IT-Systems-Theory/all_questions/23.html',
  '/IT-Systems-Theory/all_questions/24.html',
  '/IT-Systems-Theory/all_questions/25.html',
  '/IT-Systems-Theory/all_answers/index.html',
  '/IT-Systems-Theory/all_answers/data/2021.json',
  '/IT-Systems-Theory/all_answers/data/2022.json',
  '/IT-Systems-Theory/all_answers/data/2023.json',
  '/IT-Systems-Theory/all_answers/data/2024.json',
  '/IT-Systems-Theory/all_answers/data/2025.json',
  
  // ══════════════════════════════════════
  // MATHEMATICS II
  // ══════════════════════════════════════
  '/Mathematics-II/Mathematics-II-Unit-1.html',
  '/Mathematics-II/Mathematics-II-Unit-2.html',
  '/Mathematics-II/Mathematics-II-Unit-3.html',
  '/Mathematics-II/Mathematics-II-Unit-4.html',
  '/Mathematics-II/Mathematics-II-Unit-5.html',
  '/Mathematics-II/Mathematics-II-Unit-6.html',
  '/Mathematics-II/Formula-Sheet.html',
  '/Mathematics-II/all_questions/21.html',
  '/Mathematics-II/all_questions/22.html',
  '/Mathematics-II/all_questions/23.html',
  '/Mathematics-II/all_questions/24.html',
  '/Mathematics-II/all_questions/25.html',
  '/Mathematics-II/all_answers/index.html',
  '/Mathematics-II/all_answers/data/2021.json',
  '/Mathematics-II/all_answers/data/2022.json',
  '/Mathematics-II/all_answers/data/2023.json',
  '/Mathematics-II/all_answers/data/2024.json',
  '/Mathematics-II/all_answers/data/2025.json',
  
  // ══════════════════════════════════════
  // PRACTICE QUESTIONS
  // ══════════════════════════════════════
  '/Practice_question/roadmap.html',
  '/Practice_question/css/styles.css',
  '/Practice_question/js/app.js',
  '/Practice_question/js/helper.js',
  '/Practice_question/js/renderer.js',
  '/Practice_question/questions/index.html',
  '/Practice_question/questions/question-day1.js',
  '/Practice_question/questions/question-day2.js',
  '/Practice_question/questions/question-day3.js',
  '/Practice_question/questions/question-day4.js',
  '/Practice_question/questions/question-day5.js',
  '/Practice_question/questions/question-day6.js',
  '/Practice_question/questions/question-day7.js',
  '/Practice_question/questions/question-day8.js',
  '/Practice_question/questions/question-day9.js',
  '/Practice_question/questions/question-day10.js',
];


// ── INSTALL: Cache everything immediately ──
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
    .then((cache) => {
      console.log('[SW] Pre-caching all pages...');
      return cache.addAll(PRECACHE_URLS);
    })
    .then(() => {
      console.log('[SW] All files cached!');
      return self.skipWaiting();
    })
    .catch((err) => {
      console.error('[SW] Pre-cache failed:', err);
    })
  );
});


// ── ACTIVATE: Delete old caches ──
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
    .then((cacheNames) => {
      return Promise.all(
        cacheNames
        .filter((name) => name !== CACHE_NAME)
        .map((name) => {
          console.log('[SW] Deleting old cache:', name);
          return caches.delete(name);
        })
      );
    })
    .then(() => self.clients.claim())
  );
});


// ── FETCH: Cache-first, network fallback ──
self.addEventListener('fetch', (event) => {
  
  // Skip non-GET and cross-origin requests
  if (event.request.method !== 'GET') return;
  
  // Skip external CDN requests (MathJax, fonts, etc.)
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) {
    // Try network first for CDN, cache as backup
    event.respondWith(
      fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clone);
        });
        return response;
      })
      .catch(() => caches.match(event.request))
    );
    return;
  }
  
  // Local files: Cache first, network fallback
  event.respondWith(
    caches.match(event.request)
    .then((cachedResponse) => {
      if (cachedResponse) {
        // Serve from cache instantly
        // Update cache in background (stale-while-revalidate)
        fetch(event.request)
          .then((networkResponse) => {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          })
          .catch(() => {});
        
        return cachedResponse;
      }
      
      // Not cached yet — fetch and cache it
      return fetch(event.request)
        .then((networkResponse) => {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
          return networkResponse;
        })
        .catch(() => {
          // Completely offline and not cached
          if (event.request.destination === 'document') {
            return caches.match('/offline.html');
          }
        });
    })
  );
});
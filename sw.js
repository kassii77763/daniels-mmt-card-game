/**
 * MMT GRADE — Service Worker (v17)
 * Cache-Buster & Offline Resilient Engine
 */

const CACHE_NAME = 'mmt-grade-cache-v20';

// プリキャッシュ対象のコアアセット
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './style.css?v=20261102_v20',
  './app.js?v=20261102_v20',
  './manifest.json?v=20261102_v20',
  './data/cards.json',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/apple-touch-icon.png'
];

// 1. インストール時: コアアセットをキャッシュし即座に待機状態をスキップ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// 2. アクティベーション時: 古いバージョンのキャッシュを一掃し、直ちにクライアントを支配
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.startsWith('mmt-grade-cache-') && cacheName !== CACHE_NAME) {
            console.log('[SW] Purging deprecated cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// 3. フェッチ時: キャッシュ事故防止戦略
// - コアコード (HTML, JS, CSS, JSON): Network First（オンライン時は必ず最新コードを取得）
// - 画像アセット (PNG, JPG, SVG, WebP): Cache First（キャッシュから超高速ロード）
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // GETリクエスト以外、または非HTTPプロトコルはバイパス
  if (req.method !== 'GET') return;
  if (!req.url.startsWith('http://') && !req.url.startsWith('https://')) return;

  const url = new URL(req.url);

  // 画像アセット (Cache First + ネットワークフォールバック)
  const isImage = (
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico')
  );

  if (isImage) {
    event.respondWith(
      caches.match(req).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(req).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, responseToCache);
          });
          return networkResponse;
        });
      })
    );
    return;
  }

  // コアファイル (Network First + オフラインフォールバック)
  event.respondWith(
    fetch(req).then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(req, responseToCache);
        });
      }
      return networkResponse;
    }).catch(() => {
      return caches.match(req).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        // HTMLナビゲーション時のオフラインフォールバック
        if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
          return caches.match('./index.html') || caches.match('./');
        }
      });
    })
  );
});

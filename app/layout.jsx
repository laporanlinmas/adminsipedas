import Script from 'next/script';
import '../app/globals.css';
import { UIProvider } from '../components/UIContext';

export const metadata = {
  title: 'SI-PEDAS — Sistem Informasi Pedestrian Satlinmas',
  description: 'Dashboard Monitoring SI-PEDAS Admin Backend',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/assets/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/assets/icon-192.png', sizes: '192x192', type: 'image/png' }
    ],
    apple: '/assets/icon-192.png',
    shortcut: '/assets/icon-32.png',
  },
  themeColor: '#1e293b',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SI-PEDAS',
  },
  applicationName: 'SI-PEDAS',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" 
          rel="stylesheet" 
        />
        <link href="/css/style.css" rel="stylesheet" />
        <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js" async></script>
        <script src="https://cdn.jsdelivr.net/npm/exif-js" async></script>
        <script src="https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js" async></script>
      </head>
      <body>
        <UIProvider>
          {children}
          
          {/* EXTERNAL SCRIPTS */}
        <Script src="/js/modules/ui/darkmode.js" strategy="beforeInteractive" />
        <Script src="/js/env.js" strategy="beforeInteractive" />
        <Script src="/js/config.js" strategy="beforeInteractive" />
        <Script src="/js/api.js?v=20260406c" strategy="beforeInteractive" />
        <Script src="/js/main.js?v=20260406c" strategy="beforeInteractive" />

        {/* INLINE SCRIPT: GLOBAL CACHE */}
        <Script id="global-cache" strategy="afterInteractive" dangerouslySetInnerHTML={{
          __html: `
            (function () {
              var _gc = {}, TTL = 5 * 60 * 1000;
              window._gcGet = function (k) {
                var e = _gc[k];
                if (!e) return null;
                if (Date.now() - e.ts > TTL) { delete _gc[k]; return null; }
                return e.data;
              };
              window._gcSet = function (k, d) { _gc[k] = { data: d, ts: Date.now() }; };
              window._gcDel = function (k) { delete _gc[k]; };
              window._gcClear = function () { _gc = {}; };
              window._gcRefresh = function (k) {
                var jobs = {
                  dashboard: function () { return apiGet('getDashboard'); },
                  rekap: function () { return apiGet('getRekap'); },
                  satlinmas: function () { return apiGet('getSatlinmas'); },
                  layerPeta: function () { return apiGet('getLayerPeta'); },
                  fotoMarker: function () { return apiGet('getDetailFotoMarkers'); }
                };
                if (jobs[k]) jobs[k]().then(function (d) { window._gcSet(k, d); }).catch(function () { });
              };
              window._prefetchAll = function () {
                var delay = 2000;
                var jobs = [
                  { key: 'dashboard', fn: function () { return apiGet('getDashboard'); } },
                  { key: 'rekap', fn: function () { return apiGet('getRekap'); } },
                  { key: 'satlinmas', fn: function () { return apiGet('getSatlinmas'); } },
                  { key: 'layerPeta', fn: function () { return apiGet('getLayerPeta'); } },
                  { key: 'fotoMarker', fn: function () { return apiGet('getDetailFotoMarkers'); } }
                ];
                jobs.forEach(function (job) {
                  setTimeout(function () {
                    if (window._gcGet(job.key)) return;
                    job.fn().then(function (d) { window._gcSet(job.key, d); }).catch(function () { });
                  }, delay);
                  delay += 1200;
                });
              };
            })();
          `
        }} />

        {/* INLINE SCRIPT: SESSION & SW */}
        <Script id="session-sw" strategy="lazyOnload" dangerouslySetInnerHTML={{
          __html: `
            window._initSession = function () {
              var SESSION_TTL_MS = 15 * 60 * 1000;
              try {
                var saved = localStorage.getItem('_slm');
                if (saved) {
                  var parsed = JSON.parse(saved);
                  var ts = parsed._loginTs || 0;
                  if (ts && (Date.now() - ts) > SESSION_TTL_MS) {
                    localStorage.removeItem('_slm');
                    parsed = null;
                  }
                  if (parsed && parsed.username) {
                    SES = parsed;
                    buildUI();
                    document.getElementById('lp').style.display = 'none';
                    document.getElementById('app').classList.add('on');
                    loadDashboard();
                    if (window._prefetchAll) window._prefetchAll();
                    if (window._sesTimer) clearInterval(window._sesTimer);
                    window._sesTimer = setInterval(function () {
                      var cur = null;
                      try { cur = JSON.parse(localStorage.getItem('_slm') || 'null'); } catch (e) { }
                      if (!cur || !cur._loginTs || (Date.now() - cur._loginTs) > SESSION_TTL_MS) {
                        clearInterval(window._sesTimer);
                        if (typeof _forceLogout === 'function') _forceLogout('Sesi Anda telah berakhir (15 menit). Silakan login kembali.');
                        else {
                          SES = null;
                          localStorage.removeItem('_slm');
                          document.getElementById('app').classList.remove('on');
                          document.getElementById('lp').style.display = '';
                        }
                      }
                    }, 30000);
                  }
                }
              } catch (e) { }
              if (window.applyViewMode) applyViewMode();
              if (window.initDarkMode) initDarkMode();
            };

            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function () {
                navigator.serviceWorker.register('/sw.js')
                  .then(function (reg) { console.log('[SW] Terdaftar:', reg.scope); })
                  .catch(function (err) { console.warn('[SW] Gagal:', err); });
              });
            }
          `
        }} />
        </UIProvider>
      </body>
    </html>
  );
}

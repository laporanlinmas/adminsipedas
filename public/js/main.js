// js/main.js — entry point loader untuk SI-PEDAS
// Hanya api.js dan main.js dipanggil di index.html.
// Semua modul fungsional di-load di sini secara sequential.
(function(){
  var modules = [
    'js/modules/ui.js',
    'js/modules/laporan.js',
    'js/modules/peta.js'
  ];

  var i = 0;
  var timestamp = new Date().getTime(); // Cache busting

  function inputEmbedUrl() {
    return typeof window.getInputEmbedUrl === 'function' ? window.getInputEmbedUrl() : '/api/input-embed';
  }

  function runInputEmbedPreload() {
    try {
      if (!window.SES || String(window.SES.role || '').toLowerCase() !== 'admin') return;
      if (window._inputEmbedPreloaded) return;
      if (!document.getElementById('input-preload-host')) {
        var host = document.createElement('div');
        host.id = 'input-preload-host';
        host.setAttribute('aria-hidden', 'true');
        host.style.cssText = 'position:fixed;left:-99999px;top:0;width:480px;height:800px;opacity:0;pointer-events:none';
        document.body.appendChild(host);
      }
      var ifr = document.createElement('iframe');
      ifr.src = inputEmbedUrl();
      ifr.loading = 'eager';
      ifr.title = 'Input Laporan (preload)';
      ifr.style.cssText = 'width:480px;height:800px;border:none;display:block';
      window._inputEmbedPreloaded = ifr;
      var host2 = document.getElementById('input-preload-host');
      if (host2) host2.appendChild(ifr);
    } catch (e) {}
  }

  /** Dipanggil setelah login admin atau saat init sesi admin (delay ms, default 400) */
  window.scheduleInputEmbedPreload = function(delayMs) {
    var d = typeof delayMs === 'number' ? delayMs : 400;
    setTimeout(runInputEmbedPreload, d);
  };

  function loadNext() {
    if (i >= modules.length) {
      if (window._initSession) window._initSession();
      window.scheduleInputEmbedPreload(400);
      return;
    }
    var script = document.createElement('script');
    script.src = modules[i++] + '?v=' + timestamp;
    script.async = false;
    script.onload = loadNext;
    script.onerror = function(){
      console.error('Gagal memuat modul:', this.src);
      loadNext();
    };
    document.head.appendChild(script);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadNext);
  } else {
    loadNext();
  }
})();

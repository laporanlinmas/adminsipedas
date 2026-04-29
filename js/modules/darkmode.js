/* ══════════════════════════════════════════
   DARK MODE — SI-PEDAS
   initDarkMode() : dipanggil saat app init
   toggleDarkMode(): dipanggil dari tombol dm-btn
   ══════════════════════════════════════════ */

(function () {
  var DM_KEY = 'sipedas_dark';

  function applyDark(dark) {
    var body = document.body;
    if (dark) {
      body.classList.add('dark-mode');
      document.documentElement.classList.add('dark-pre');
    } else {
      body.classList.remove('dark-mode');
      document.documentElement.classList.remove('dark-pre');
    }

    /* Update ikon tombol #dm-btn di topbar */
    var dmBtn = document.getElementById('dm-btn');
    if (dmBtn) {
      var ico = dmBtn.querySelector('i');
      if (ico) {
        ico.className = dark ? 'fas fa-sun' : 'fas fa-moon';
      }
      dmBtn.title = dark ? 'Mode Terang' : 'Mode Gelap';
    }

    /* Update toggle di halaman Pengaturan (jika terbuka) */
    var setBtn = document.getElementById('set-dm-btn');
    if (setBtn) {
      setBtn.classList.toggle('on', dark);
    }

    /* Sinkronisasi Chart.js jika ada */
    if (window.Chart) {
      var textColor = dark ? '#94a3b8' : '#64748b';
      var gridColor = dark ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.05)';

      Chart.defaults.color = textColor;
      if (Chart.defaults.scale && Chart.defaults.scale.grid) {
        Chart.defaults.scale.grid.color = gridColor;
      }

      /* Jika ada chart yang sedang tampil, refresh (khusus di Dashboard) */
      if (window._currentPage === 'db' && typeof window.loadDashboard === 'function') {
        /* Debounce refresh supaya tidak berat saat toggle cepat */
        if (window._dmChartTimeout) clearTimeout(window._dmChartTimeout);
        window._dmChartTimeout = setTimeout(function () {
          loadDashboard();
        }, 150);
      }
    }
  }

  /* ── initDarkMode: baca preferensi, apply ── */
  window.initDarkMode = function () {
    var saved = null;
    try { saved = localStorage.getItem(DM_KEY); } catch (e) { }

    if (saved === null) {
      /* Fallback: ikuti preferensi sistem OS */
      saved = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
        ? 'dark' : 'light';
    }

    applyDark(saved === 'dark');
  };

  /* ── toggleDarkMode: dipanggil dari tombol ── */
  window.toggleDarkMode = function () {
    var isDark = !document.body.classList.contains('dark-mode');
    try { localStorage.setItem(DM_KEY, isDark ? 'dark' : 'light'); } catch (e) { }
    applyDark(isDark);
  };

  /* Pre-apply tanpa flash: baca localStorage sebelum DOM selesai */
  (function () {
    var v = null;
    try { v = localStorage.getItem(DM_KEY); } catch (e) { }
    if (v === 'dark') {
      document.documentElement.classList.add('dark-pre');
    }
  })();
})();

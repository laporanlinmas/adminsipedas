'use client';

import { useUI } from './UIContext';

export default function TopBar() {
  const { toggleSidebar, toggleDarkMode, activePage } = useUI();

  const PAGE_TITLES = {
    'main':                  { title: 'Dashboard Utama', sub: 'Ringkasan seluruh modul SI-PEDAS' },
    'pedestrian:dashboard':  { title: 'Dashboard Pedestrian', sub: 'Statistik & grafik data patroli' },
    'pedestrian:rekap':      { title: 'Rekap Laporan', sub: 'Daftar & cetak laporan patroli' },
    'pedestrian:input':      { title: 'Input Laporan', sub: 'Tambah laporan patroli baru' },
    'pedestrian:peta':       { title: 'Peta Pedestrian', sub: 'Peta interaktif wilayah patroli' },
    'pedestrian:satlinmas':  { title: 'Data Satlinmas', sub: 'Data anggota Satlinmas Pedestrian' },
    'pedestrian:petunjuk':   { title: 'Petunjuk Teknis', sub: 'Panduan penggunaan sistem' },
    'poskamling:dashboard':  { title: 'Dashboard Poskamling', sub: 'Ringkasan data pos keamanan lingkungan' },
    'poskamling:data':       { title: 'Data Poskamling', sub: 'Kelola data pos kamling' },
    'poskamling:peta':       { title: 'Peta Poskamling', sub: 'Persebaran pos kamling di peta' },
    'posyandu:dashboard':    { title: 'Dashboard Posyandu', sub: 'Ringkasan data pos pelayanan terpadu' },
    'posyandu:data':         { title: 'Data Posyandu', sub: 'Kelola data posyandu' },
    'posyandu:peta':         { title: 'Peta Posyandu', sub: 'Persebaran posyandu di peta' },
    'kebencanaan:dashboard': { title: 'Kebencanaan', sub: 'Kesiapsiagaan bencana Satlinmas' },
    'satlinmas:data':        { title: 'Data Satlinmas', sub: 'Database anggota Satlinmas' },
    'settings':              { title: 'Pengaturan', sub: 'Konfigurasi sistem & akun' },
  };

  const pageInfo = PAGE_TITLES[activePage] || { title: 'SI-PEDAS', sub: 'Sistem Informasi Terpadu' };

  return (
    <div className="sticky top-0 z-[100] min-h-[56px] h-auto px-4 py-2 bg-white/70 dark:bg-[#1a1d27]/85 backdrop-blur-[18px] backdrop-saturate-[1.8] border-b border-slate-200 dark:border-white/10 flex items-center justify-between gap-2 shadow-[0_1px_0_var(--border),0_4px_12px_rgba(0,0,0,0.02)] overflow-hidden transition-colors duration-300">
      <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
        <button 
          className="md:hidden bg-transparent border-none text-slate-600 dark:text-slate-400 text-base p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center shrink-0 rounded-lg hover:bg-sblue-lo hover:text-sblue transition-colors" 
          onClick={toggleSidebar}>
          <i className="fas fa-bars"></i>
        </button>
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="text-[0.83rem] font-extrabold text-slate-900 dark:text-slate-200 leading-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-full" id="pgtl">{pageInfo.title}</div>
          <div className="text-[0.58rem] text-slate-500 dark:text-slate-400 mt-[1px] leading-snug whitespace-nowrap overflow-hidden text-ellipsis max-w-full" id="pgsb">{pageInfo.sub}</div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button 
          id="refresh-btn" 
          onClick={() => { if(typeof window !== 'undefined' && window.doRefreshPage) window.doRefreshPage() }} 
          className="w-[34px] h-[34px] rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)] bg-slate-100 border border-slate-200 text-slate-600 dark:bg-white/5 dark:border-white/10 dark:text-slate-400 hover:bg-sblue hover:text-white hover:border-sblue dark:hover:bg-sblue dark:hover:text-white dark:hover:border-sblue hover:scale-105">
          <i className="fas fa-rotate-right"></i>
        </button>
        <button 
          id="dm-btn" 
          onClick={toggleDarkMode} 
          title="Dark Mode" 
          className="w-[34px] h-[34px] rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)] bg-slate-100 border border-slate-200 text-slate-600 dark:bg-white/5 dark:border-white/10 dark:text-slate-400 hover:bg-sblue hover:text-white hover:border-sblue dark:hover:bg-sblue dark:hover:text-white dark:hover:border-sblue hover:scale-105">
          <i className="fas fa-moon"></i>
        </button>
        <div className="hidden items-center gap-[7px] py-1 px-2.5 bg-white border border-slate-200 rounded-full cursor-default transition-all shadow-premium-0 hover:border-slate-300 hover:shadow-premium dark:bg-theme-card dark:border-white/10" id="tb-acct">
          <div className="w-[26px] h-[26px] rounded-lg bg-gradient-to-br from-sblue to-sblue-2 flex items-center justify-center text-[0.68rem] text-white font-extrabold shrink-0" id="tb-av">?</div>
          <div>
            <div className="text-[0.7rem] font-bold text-slate-900 dark:text-slate-200 max-w-[100px] whitespace-nowrap overflow-hidden text-ellipsis" id="tb-un">—</div>
            <div className="text-[0.54rem] text-slate-500 dark:text-slate-400" id="tb-rl">—</div>
          </div>
          <span className="text-[0.5rem] font-extrabold py-0.5 px-[7px] rounded-full uppercase tracking-wider bg-sblue-lo text-sblue" id="tb-bdg">—</span>
        </div>
      </div>
    </div>
  );
}

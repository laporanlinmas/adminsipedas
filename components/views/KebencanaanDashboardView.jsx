'use client';

import { useUI } from '../UIContext';

export default function KebencanaanDashboardView() {
  const { navigateTo } = useUI();

  const modules = [
    { icon: 'fas fa-house-crack', label: 'Gempa Bumi', color: 'bg-amber-500/20 text-amber-400', desc: 'Segera hadir' },
    { icon: 'fas fa-water', label: 'Banjir & Longsor', color: 'bg-blue-500/20 text-blue-400', desc: 'Segera hadir' },
    { icon: 'fas fa-wind', label: 'Angin Kencang', color: 'bg-cyan-500/20 text-cyan-400', desc: 'Segera hadir' },
    { icon: 'fas fa-fire', label: 'Kebakaran', color: 'bg-orange-500/20 text-orange-400', desc: 'Segera hadir' },
  ];

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-50 dark:bg-[#0d1117] animate-[fadeIn_0.3s_ease]">
      <div className="bg-gradient-to-br from-[#271a05] via-[#2d1e09] to-[#1a1006] px-6 pt-7 pb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500 rounded-full blur-[80px] opacity-10"></div>
        <div className="relative z-10">
          <div className="text-[0.6rem] font-bold tracking-widest text-amber-400/60 uppercase mb-1">Modul Kebencanaan</div>
          <h1 className="text-[1.4rem] font-black text-white mb-1">Dashboard Kebencanaan</h1>
          <p className="text-[0.72rem] text-white/40">Monitoring kesiapsiagaan Satlinmas dalam menghadapi situasi darurat</p>
        </div>
      </div>

      <div className="px-4 md:px-6 py-8 flex flex-col items-center justify-center max-w-[800px] mx-auto">
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 text-center mb-8 w-full">
          <i className="fas fa-construction text-amber-400 text-4xl mb-4 block"></i>
          <div className="text-[1rem] font-black text-slate-800 dark:text-white mb-2">Modul Sedang Dikembangkan</div>
          <p className="text-[0.78rem] text-slate-500 dark:text-slate-400 leading-relaxed">
            Fitur monitoring kebencanaan sedang dalam proses pengembangan. Modul ini akan mencakup data titik rawan bencana, protokol penanganan, dan koordinasi antar unit Satlinmas.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full">
          {modules.map(mod => (
            <div key={mod.label} className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-white/[0.06] rounded-2xl p-5 flex flex-col gap-3 opacity-60">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${mod.color}`}>
                <i className={mod.icon}></i>
              </div>
              <div>
                <div className="text-[0.85rem] font-black text-slate-700 dark:text-white">{mod.label}</div>
                <div className="text-[0.68rem] text-slate-400 mt-0.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block"></span> {mod.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => navigateTo('main')} className="mt-8 flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-[0.82rem] font-bold hover:bg-slate-200 dark:hover:bg-white/10 transition-all">
          <i className="fas fa-arrow-left"></i> Kembali ke Dashboard
        </button>
      </div>
    </div>
  );
}

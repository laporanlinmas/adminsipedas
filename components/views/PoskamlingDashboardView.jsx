'use client';

import useSWR from 'swr';
import { useUI } from '../UIContext';

const fetcher = (url) => fetch(url).then(r => r.json());

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className={`rounded-2xl p-4 border flex flex-col gap-2 shadow-sm ${color}`}>
      <div className="flex items-center gap-2 text-[0.7rem] font-bold opacity-80">
        <i className={icon}></i> {label}
      </div>
      <div className="text-[2rem] font-black leading-none">{value ?? '—'}</div>
      {sub && <div className="text-[0.65rem] opacity-60">{sub}</div>}
    </div>
  );
}

export default function PoskamlingDashboardView() {
  const { navigateTo } = useUI();
  const { data, isLoading } = useSWR('/api/proxy?action=getPoskamling', fetcher);
  const rows = data?.data?.data || [];

  // Statistik per kecamatan
  const perKec = {};
  rows.forEach(r => {
    const k = r.kecamatan || 'Tidak Diketahui';
    perKec[k] = (perKec[k] || 0) + 1;
  });
  const kecArr = Object.entries(perKec).sort((a, b) => b[1] - a[1]);

  // Statistik per desa
  const perDesa = {};
  rows.forEach(r => {
    const k = r.desa || 'Tidak Diketahui';
    perDesa[k] = (perDesa[k] || 0) + 1;
  });

  const withCoord = rows.filter(r => r.lat && r.lng).length;
  const withFoto = rows.filter(r => r.foto).length;

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-50 dark:bg-[#0d1117] animate-[fadeIn_0.3s_ease]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#05271a] via-[#092d1e] to-[#061a10] px-6 pt-7 pb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500 rounded-full blur-[80px] opacity-10"></div>
        <div className="relative z-10">
          <div className="text-[0.6rem] font-bold tracking-widest text-emerald-400/60 uppercase mb-1">Modul Poskamling</div>
          <h1 className="text-[1.4rem] font-black text-white mb-1">Dashboard Poskamling</h1>
          <p className="text-[0.72rem] text-white/40">Ringkasan data Pos Keamanan Lingkungan se-Kabupaten Ponorogo</p>
        </div>
      </div>

      <div className="px-4 md:px-6 py-5 flex flex-col gap-6 max-w-[1100px] mx-auto">
        {/* Quick Actions */}
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => navigateTo('poskamling:data')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-[0.78rem] font-bold hover:bg-emerald-600 transition-all shadow-sm">
            <i className="fas fa-table-list"></i> Data Poskamling
          </button>
          <button onClick={() => navigateTo('poskamling:peta')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-[0.78rem] font-bold hover:bg-emerald-500/20 transition-all">
            <i className="fas fa-map-location-dot"></i> Peta Poskamling
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon="fas fa-shield-halved" label="Total Pos" value={rows.length}
            color="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-200" />
          <StatCard icon="fas fa-map-pin" label="Berkoodinat" value={withCoord}
            color="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-500/20 text-blue-800 dark:text-blue-200" />
          <StatCard icon="fas fa-camera" label="Ada Foto" value={withFoto}
            color="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-500/20 text-purple-800 dark:text-purple-200" />
          <StatCard icon="fas fa-map" label="Kecamatan" value={kecArr.length}
            color="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-200" />
        </div>

        {/* Distribusi per Kecamatan */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-100 dark:border-white/[0.06] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5">
            <div className="text-[0.9rem] font-black text-slate-800 dark:text-white flex items-center gap-2">
              <i className="fas fa-chart-bar text-emerald-500"></i> Distribusi per Kecamatan
            </div>
          </div>
          <div className="p-5">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-slate-400 text-[0.8rem] gap-2">
                <i className="fas fa-spinner fa-spin"></i> Memuat data...
              </div>
            ) : kecArr.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <i className="fas fa-shield-halved text-3xl mb-2 opacity-30"></i>
                <p className="text-[0.78rem]">Belum ada data Poskamling.</p>
                <button onClick={() => navigateTo('poskamling:data')} className="mt-3 text-[0.72rem] px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600">+ Tambah Data</button>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {kecArr.map(([kec, count]) => {
                  const pct = Math.round(count / rows.length * 100);
                  return (
                    <div key={kec}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[0.75rem] font-semibold text-slate-700 dark:text-slate-200">{kec}</span>
                        <span className="text-[0.72rem] font-black text-emerald-600 dark:text-emerald-400">{count} pos</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-700" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Daftar terbaru */}
        {rows.length > 0 && (
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-100 dark:border-white/[0.06] shadow-sm overflow-hidden mb-6">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <div className="text-[0.9rem] font-black text-slate-800 dark:text-white flex items-center gap-2">
                <i className="fas fa-list-ul text-emerald-500"></i> Daftar Pos Terbaru
              </div>
              <button onClick={() => navigateTo('poskamling:data')} className="text-[0.7rem] text-emerald-600 dark:text-emerald-400 font-bold hover:underline">Lihat Semua →</button>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-white/[0.04]">
              {rows.slice(0, 5).map((row) => (
                <div key={row._ri} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-shield-halved text-emerald-500 text-[0.85rem]"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[0.82rem] font-bold text-slate-800 dark:text-white truncate">{row.nama}</div>
                    <div className="text-[0.68rem] text-slate-400">{[row.rtrw, row.desa, row.kecamatan].filter(Boolean).join(' · ')}</div>
                  </div>
                  {row.lat && row.lng && (
                    <a href={`https://maps.google.com/maps?q=${row.lat},${row.lng}`} target="_blank" rel="noopener noreferrer"
                      className="text-[0.68rem] px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all">
                      <i className="fas fa-map-pin mr-1"></i>Maps
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

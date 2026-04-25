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

export default function PosyanduDashboardView() {
  const { navigateTo } = useUI();
  const { data, isLoading } = useSWR('/api/proxy?action=getPosyandu', fetcher);
  const rows = data?.data?.data || [];

  const perKec = {};
  rows.forEach(r => { const k = r.kecamatan || 'Tidak Diketahui'; perKec[k] = (perKec[k] || 0) + 1; });
  const kecArr = Object.entries(perKec).sort((a, b) => b[1] - a[1]);
  const withCoord = rows.filter(r => r.lat && r.lng).length;
  const withFoto = rows.filter(r => r.foto).length;

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-50 dark:bg-[#0d1117] animate-[fadeIn_0.3s_ease]">
      <div className="bg-gradient-to-br from-[#270514] via-[#2d0a18] to-[#1a0610] px-6 pt-7 pb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500 rounded-full blur-[80px] opacity-10"></div>
        <div className="relative z-10">
          <div className="text-[0.6rem] font-bold tracking-widest text-rose-400/60 uppercase mb-1">Modul Posyandu</div>
          <h1 className="text-[1.4rem] font-black text-white mb-1">Dashboard Posyandu</h1>
          <p className="text-[0.72rem] text-white/40">Ringkasan data Pos Pelayanan Terpadu se-Kabupaten Ponorogo</p>
        </div>
      </div>

      <div className="px-4 md:px-6 py-5 flex flex-col gap-6 max-w-[1100px] mx-auto">
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => navigateTo('posyandu:data')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500 text-white text-[0.78rem] font-bold hover:bg-rose-600 transition-all shadow-sm">
            <i className="fas fa-table-list"></i> Data Posyandu
          </button>
          <button onClick={() => navigateTo('posyandu:peta')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20 text-[0.78rem] font-bold hover:bg-rose-500/20 transition-all">
            <i className="fas fa-map-location-dot"></i> Peta Posyandu
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon="fas fa-heart-pulse" label="Total Posyandu" value={rows.length}
            color="bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-200" />
          <StatCard icon="fas fa-map-pin" label="Berkoordinat" value={withCoord}
            color="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-500/20 text-blue-800 dark:text-blue-200" />
          <StatCard icon="fas fa-camera" label="Ada Foto" value={withFoto}
            color="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-500/20 text-purple-800 dark:text-purple-200" />
          <StatCard icon="fas fa-map" label="Kecamatan" value={kecArr.length}
            color="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-200" />
        </div>

        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-100 dark:border-white/[0.06] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5">
            <div className="text-[0.9rem] font-black text-slate-800 dark:text-white flex items-center gap-2">
              <i className="fas fa-chart-bar text-rose-500"></i> Distribusi per Kecamatan
            </div>
          </div>
          <div className="p-5">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-slate-400 text-[0.8rem] gap-2"><i className="fas fa-spinner fa-spin"></i> Memuat data...</div>
            ) : kecArr.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <i className="fas fa-heart-pulse text-3xl mb-2 opacity-30"></i>
                <p className="text-[0.78rem]">Belum ada data Posyandu.</p>
                <button onClick={() => navigateTo('posyandu:data')} className="mt-3 text-[0.72rem] px-4 py-2 rounded-xl bg-rose-500 text-white font-bold hover:bg-rose-600">+ Tambah Data</button>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {kecArr.map(([kec, count]) => {
                  const pct = Math.round(count / rows.length * 100);
                  return (
                    <div key={kec}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[0.75rem] font-semibold text-slate-700 dark:text-slate-200">{kec}</span>
                        <span className="text-[0.72rem] font-black text-rose-600 dark:text-rose-400">{count} posyandu</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full transition-all duration-700" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {rows.length > 0 && (
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-100 dark:border-white/[0.06] shadow-sm overflow-hidden mb-6">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <div className="text-[0.9rem] font-black text-slate-800 dark:text-white flex items-center gap-2">
                <i className="fas fa-list-ul text-rose-500"></i> Daftar Posyandu Terbaru
              </div>
              <button onClick={() => navigateTo('posyandu:data')} className="text-[0.7rem] text-rose-600 dark:text-rose-400 font-bold hover:underline">Lihat Semua →</button>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-white/[0.04]">
              {rows.slice(0, 5).map((row) => (
                <div key={row._ri} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-heart-pulse text-rose-500 text-[0.85rem]"></i>
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

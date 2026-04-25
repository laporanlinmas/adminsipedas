'use client';

import useSWR from 'swr';
import { useUI } from '../UIContext';

const fetcher = (url) => fetch(url).then(r => r.json());

function StatCard({ icon, value, label, color, sub }) {
  return (
    <div className={`bg-white dark:bg-[#111827] rounded-2xl p-5 border border-slate-100 dark:border-white/[0.06] shadow-sm flex flex-col gap-2 hover:shadow-md transition-shadow`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${color}`}>
        <i className={icon}></i>
      </div>
      <div className="text-[1.8rem] font-black text-slate-800 dark:text-white leading-none">{value ?? '—'}</div>
      <div className="text-[0.72rem] font-bold text-slate-500 dark:text-slate-400">{label}</div>
      {sub && <div className="text-[0.65rem] text-slate-400">{sub}</div>}
    </div>
  );
}

function ModuleCard({ icon, title, desc, pages, colorFrom, colorTo, iconBg, navigate }) {
  return (
    <button
      onClick={() => navigate(pages[0])}
      className="group bg-white dark:bg-[#111827] rounded-2xl border border-slate-100 dark:border-white/[0.06] shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden text-left hover:-translate-y-1"
    >
      <div className={`h-2 bg-gradient-to-r ${colorFrom} ${colorTo}`}></div>
      <div className="p-5">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4 ${iconBg}`}>
          <i className={icon}></i>
        </div>
        <div className="text-[0.95rem] font-black text-slate-800 dark:text-white mb-1 group-hover:text-sblue transition-colors">{title}</div>
        <div className="text-[0.72rem] text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</div>
        <div className="flex gap-1.5 mt-3 flex-wrap">
          {pages.slice(1).map(p => (
            <button
              key={p}
              onClick={(e) => { e.stopPropagation(); navigate(p); }}
              className="text-[0.6rem] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-all capitalize"
            >
              {p.split(':')[1]}
            </button>
          ))}
        </div>
      </div>
    </button>
  );
}

export default function MainDashboardView() {
  const { navigateTo } = useUI();
  const { data: dashData } = useSWR('/api/proxy?action=getDashboard', fetcher);
  const { data: posData } = useSWR('/api/proxy?action=getPoskamling', fetcher);
  const { data: posyanduData } = useSWR('/api/proxy?action=getPosyandu', fetcher);

  const dash = dashData?.data || {};
  const poskamlingCount = posData?.data?.data?.length ?? 0;
  const posyanduCount = posyanduData?.data?.data?.length ?? 0;

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Selamat Pagi' : now.getHours() < 15 ? 'Selamat Siang' : now.getHours() < 18 ? 'Selamat Sore' : 'Selamat Malam';

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-50 dark:bg-[#0d1117] animate-[fadeIn_0.3s_ease]">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-[#0a1628] via-[#0e2040] to-[#091830] px-6 pt-8 pb-10 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sblue rounded-full blur-[80px]"></div>
          <div className="absolute bottom-0 left-10 w-40 h-40 bg-purple-500 rounded-full blur-[60px]"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <img src="/assets/icon-full.png" alt="" className="w-10 h-10 object-contain drop-shadow-[0_2px_8px_rgba(255,176,32,0.5)]" />
            <div>
              <div className="text-[0.65rem] font-bold tracking-widest uppercase text-white/40">{greeting}</div>
              <div className="text-[1.15rem] font-black tracking-wide bg-gradient-to-r from-[#ffd84d] to-[#ff8c00] bg-clip-text text-transparent">SI-PEDAS</div>
            </div>
          </div>
          <h1 className="text-[1.4rem] md:text-[1.8rem] font-black text-white leading-tight mb-2">
            Dashboard Monitoring<br />
            <span className="text-white/60 text-[1rem] md:text-[1.2rem] font-bold">Sistem Informasi Terpadu Satlinmas</span>
          </h1>
          <p className="text-[0.72rem] text-white/40 leading-relaxed max-w-[520px]">
            Kabupaten Ponorogo — Pantau seluruh aktivitas lapangan Satlinmas secara realtime dalam satu platform.
          </p>
        </div>
      </div>

      <div className="px-4 md:px-6 py-6 flex flex-col gap-8 max-w-[1200px] mx-auto">

        {/* Stats Global */}
        <div>
          <div className="text-[0.7rem] font-extrabold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
            <div className="h-px bg-slate-200 dark:bg-white/10 flex-1"></div>
            Ringkasan Data
            <div className="h-px bg-slate-200 dark:bg-white/10 flex-1"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              icon="fas fa-person-walking"
              value={dash.total}
              label="Laporan Pedestrian"
              color="bg-blue-100 dark:bg-sblue/20 text-sblue"
              sub={`${dash.hariIni ?? 0} hari ini`}
            />
            <StatCard
              icon="fas fa-users"
              value={dash.totalAnggota}
              label="Total Anggota Satlinmas"
              color="bg-purple-100 dark:bg-purple-500/20 text-purple-500"
            />
            <StatCard
              icon="fas fa-shield-halved"
              value={poskamlingCount}
              label="Pos Kamling Terdaftar"
              color="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500"
            />
            <StatCard
              icon="fas fa-heart-pulse"
              value={posyanduCount}
              label="Posyandu Terdaftar"
              color="bg-rose-100 dark:bg-rose-500/20 text-rose-500"
            />
          </div>
        </div>

        {/* Module Grid */}
        <div>
          <div className="text-[0.7rem] font-extrabold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
            <div className="h-px bg-slate-200 dark:bg-white/10 flex-1"></div>
            Modul Aktif
            <div className="h-px bg-slate-200 dark:bg-white/10 flex-1"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ModuleCard
              icon="fas fa-person-walking"
              title="Pedestrian"
              desc="Monitoring patroli, rekap laporan, peta wilayah, dan data anggota Satlinmas Pedestrian."
              pages={['pedestrian:dashboard', 'pedestrian:rekap', 'pedestrian:peta', 'pedestrian:satlinmas']}
              colorFrom="from-blue-500"
              colorTo="to-blue-600"
              iconBg="bg-blue-100 dark:bg-sblue/20 text-sblue"
              navigate={navigateTo}
            />
            <ModuleCard
              icon="fas fa-shield-halved"
              title="Poskamling"
              desc="Data dan peta seluruh Pos Keamanan Lingkungan beserta informasi lengkap lokasi."
              pages={['poskamling:dashboard', 'poskamling:data', 'poskamling:peta']}
              colorFrom="from-emerald-500"
              colorTo="to-emerald-600"
              iconBg="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500"
              navigate={navigateTo}
            />
            <ModuleCard
              icon="fas fa-heart-pulse"
              title="Posyandu"
              desc="Data dan peta seluruh Pos Pelayanan Terpadu beserta informasi lengkap lokasi."
              pages={['posyandu:dashboard', 'posyandu:data', 'posyandu:peta']}
              colorFrom="from-rose-500"
              colorTo="to-rose-600"
              iconBg="bg-rose-100 dark:bg-rose-500/20 text-rose-500"
              navigate={navigateTo}
            />
            <ModuleCard
              icon="fas fa-triangle-exclamation"
              title="Kebencanaan"
              desc="Monitoring potensi bencana dan kesiapsiagaan Satlinmas dalam menghadapi situasi darurat."
              pages={['kebencanaan:dashboard']}
              colorFrom="from-amber-400"
              colorTo="to-orange-500"
              iconBg="bg-amber-100 dark:bg-amber-500/20 text-amber-500"
              navigate={navigateTo}
            />
            <ModuleCard
              icon="fas fa-id-card-clip"
              title="Data Satlinmas"
              desc="Database lengkap seluruh anggota Satlinmas — nama, unit, tanggal lahir, dan kontak WA."
              pages={['satlinmas:data']}
              colorFrom="from-purple-500"
              colorTo="to-purple-600"
              iconBg="bg-purple-100 dark:bg-purple-500/20 text-purple-500"
              navigate={navigateTo}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="pb-6">
          <div className="text-[0.7rem] font-extrabold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
            <div className="h-px bg-slate-200 dark:bg-white/10 flex-1"></div>
            Akses Cepat
            <div className="h-px bg-slate-200 dark:bg-white/10 flex-1"></div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { page: 'pedestrian:input', icon: 'fas fa-plus-circle', label: 'Input Laporan Baru', color: 'bg-sblue/10 text-sblue border-sblue/20 hover:bg-sblue/20' },
              { page: 'pedestrian:rekap', icon: 'fas fa-table-list', label: 'Rekap Laporan', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20' },
              { page: 'pedestrian:peta', icon: 'fas fa-map-location-dot', label: 'Peta Pedestrian', color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20' },
              { page: 'poskamling:data', icon: 'fas fa-shield-halved', label: 'Data Poskamling', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' },
              { page: 'posyandu:data', icon: 'fas fa-heart-pulse', label: 'Data Posyandu', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/20' },
            ].map(item => (
              <button
                key={item.page}
                onClick={() => navigateTo(item.page)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[0.78rem] font-bold transition-all duration-200 ${item.color}`}
              >
                <i className={item.icon}></i>
                {item.label}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

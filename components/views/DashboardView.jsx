'use client';

import { useMemo, useEffect, useState } from 'react';
import useSWR from 'swr';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const fetcher = (url) => fetch(url).then(res => res.json());

export default function DashboardView() {
  const { data, error, isLoading } = useSWR('/api/proxy?action=getDashboard', fetcher);
  
  // Realtime clock
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hariNames = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const bulanNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

  if (isLoading) return <div className="flex-1 flex items-center justify-center p-8 text-slate-400 font-bold"><i className="fas fa-spinner fa-spin mr-2"></i> Memuat Dashboard...</div>;
  if (error || !data?.success) return <div className="flex-1 flex items-center justify-center p-8 text-red-400 font-bold"><i className="fas fa-circle-exclamation mr-2"></i> Gagal memuat data Dashboard.</div>;

  const d = data.data || {};

  // Persiapan data Bar Chart
  const hl = (d.perHari || []).map(x => x.hari);
  const hd = (d.perHari || []).map(x => x.n);
  const barData = {
    labels: hl,
    datasets: [{
      label: 'Laporan',
      data: hd,
      backgroundColor: 'rgba(30,111,217,.12)',
      borderColor: '#1e6fd9',
      borderWidth: 2.5,
      borderRadius: 7,
      borderSkipped: false
    }]
  };
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, ticks: { precision: 0 } }
    }
  };

  // Persiapan Triwulan
  const twColors = ['rgba(30,111,217,.82)','rgba(13,146,104,.82)','rgba(217,119,6,.82)','rgba(124,58,237,.82)'];
  const twBorders = ['#1e6fd9','#0d9268','#d97706','#7c3aed'];
  
  // Logic perhitungan triwulan disederhanakan untuk contoh (sebaiknya ini dikerjakan di backend, tapi kita porting apa adanya)
  let twCounts = [0,0,0,0];
  const BLN = { januari:1,februari:2,maret:3,april:4,mei:5,juni:6,juli:7,agustus:8,september:9,oktober:10,november:11,desember:12 };
  (d.allData || []).forEach(r => {
    const b = String(r.tanggal||'').replace(/^[A-Za-z]+,?\s*/,'').trim().toLowerCase();
    const m = /(\d{1,2})\s+([a-z]+)\s+(\d{4})/.exec(b);
    if(m && BLN[m[2]]) {
      const mo = BLN[m[2]];
      const qi = Math.floor((mo-1)/3);
      if(qi>=0 && qi<=3) twCounts[qi]++;
    }
  });

  const doughnutData = {
    labels: ['Jan–Mar','Apr–Jun','Jul–Sep','Okt–Des'],
    datasets: [{
      data: twCounts,
      backgroundColor: twColors,
      borderColor: twBorders,
      borderWidth: 2,
      hoverOffset: 8
    }]
  };
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '58%',
    plugins: { legend: { display: false } }
  };

  return (
    <div className="w-full flex flex-col gap-3 p-2 md:p-4 max-w-[1400px] mx-auto animate-[fadeIn_0.3s_ease]">
      
      {/* Time & Date Widget */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-theme-card border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-[-50px] right-[-50px] w-[150px] h-[150px] bg-gradient-to-br from-sblue/20 to-transparent rounded-full blur-[20px] pointer-events-none"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="text-[2.2rem] md:text-[2.6rem] font-black tracking-widest text-slate-900 dark:text-white leading-none font-mono">
            {String(time.getHours()).padStart(2,'0')}:{String(time.getMinutes()).padStart(2,'0')}
            <span className="text-[1.2rem] md:text-[1.4rem] text-slate-400 dark:text-white/40 ml-1">:{String(time.getSeconds()).padStart(2,'0')}</span>
          </div>
          <div className="flex flex-col justify-center border-l-2 border-slate-200 dark:border-white/10 pl-4">
            <div className="text-[0.7rem] md:text-[0.8rem] font-bold text-slate-500 dark:text-white/60 tracking-wider uppercase mb-0.5">{hariNames[time.getDay()]}</div>
            <div className="text-[0.75rem] md:text-[0.85rem] font-black text-slate-800 dark:text-white tracking-widest uppercase">
              {time.getDate()} {bulanNames[time.getMonth()]} {time.getFullYear()}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 relative z-10">
          <div className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 text-[0.65rem] font-extrabold uppercase tracking-wider border border-emerald-200 dark:border-emerald-500/20">
            <i className="fas fa-circle-dot animate-pulse"></i> Sistem Aktif
          </div>
        </div>
      </div>

      {/* Statistik Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Laporan', num: d.total||0, icon: 'fa-clipboard-list', cls: 'text-sblue bg-sblue-lo border-sblue/20' },
          { label: 'Pelanggaran', num: d.totalP||0, icon: 'fa-user-slash', cls: 'text-rose-500 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20' },
          { label: 'Hari Ini', num: d.hariIni||0, icon: 'fa-calendar-day', cls: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' },
          { label: 'Pelanggaran Hari Ini', num: d.hariIniP||0, icon: 'fa-triangle-exclamation', cls: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20' },
          { label: 'Total Anggota', num: d.totalAnggota||0, icon: 'fa-users', cls: 'text-purple-600 bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20' }
        ].map((item, idx) => (
          <div key={idx} className="bg-white dark:bg-theme-card border border-slate-200 dark:border-white/10 rounded-xl p-4 flex flex-col justify-center items-center text-center shadow-sm relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md group">
            <div className={`w-[38px] h-[38px] md:w-[44px] md:h-[44px] rounded-full flex items-center justify-center text-[1.1rem] md:text-[1.3rem] mb-2 ${item.cls} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
              <i className={`fas ${item.icon}`}></i>
            </div>
            <div className="text-[1.4rem] md:text-[1.6rem] font-black text-slate-800 dark:text-white leading-none mb-1 font-mono">{item.num}</div>
            <div className="text-[0.6rem] md:text-[0.65rem] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Laporan per Hari */}
        <div className="lg:col-span-2 bg-white dark:bg-theme-card border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-white/5">
            <i className="fas fa-chart-bar text-sblue text-[1.1rem]"></i>
            <span className="text-[0.8rem] md:text-[0.85rem] font-extrabold text-slate-800 dark:text-white tracking-widest uppercase">Laporan per Hari</span>
          </div>
          <div className="flex-1 min-h-[220px] w-full relative">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        {/* Kolom Kanan: Doughnut & Lokasi */}
        <div className="flex flex-col gap-3">
          {/* Triwulan */}
          <div className="bg-white dark:bg-theme-card border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex flex-col">
            <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2">
                <i className="fas fa-chart-pie text-purple-500 text-[1.1rem]"></i>
                <span className="text-[0.8rem] md:text-[0.85rem] font-extrabold text-slate-800 dark:text-white tracking-widest uppercase">Tren Triwulan</span>
              </div>
              <span className="text-[0.6rem] font-mono text-slate-400">Tahun {new Date().getFullYear()}</span>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-[110px] h-[110px] relative shrink-0">
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </div>
              <div className="flex-1 flex flex-col gap-2 w-full">
                {[
                  { label: 'Q1 Jan–Mar', color: '#1e6fd9', n: twCounts[0] },
                  { label: 'Q2 Apr–Jun', color: '#0d9268', n: twCounts[1] },
                  { label: 'Q3 Jul–Sep', color: '#d97706', n: twCounts[2] },
                  { label: 'Q4 Okt–Des', color: '#7c3aed', n: twCounts[3] },
                ].map((l, i) => (
                  <div key={i} className="flex items-center justify-between text-[0.65rem] bg-slate-50 dark:bg-white/5 py-1.5 px-2.5 rounded-lg border border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }}></div>
                      <span className="font-bold text-slate-600 dark:text-slate-300">{l.label}</span>
                    </div>
                    <span className="font-black text-slate-900 dark:text-white">{l.n}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Lokasi */}
          <div className="bg-white dark:bg-theme-card border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex flex-col flex-1">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-white/5">
              <i className="fas fa-map-pin text-rose-500 text-[1.1rem]"></i>
              <span className="text-[0.8rem] md:text-[0.85rem] font-extrabold text-slate-800 dark:text-white tracking-widest uppercase">Top Lokasi Patroli</span>
            </div>
            <div className="flex flex-col gap-2.5">
              {(d.perLokasi || []).length === 0 ? (
                <div className="text-[0.65rem] text-slate-400 text-center py-4">Belum ada data lokasi</div>
              ) : (
                (d.perLokasi || []).slice(0,5).map((lok, i) => {
                  const max = (d.perLokasi || [])[0].n || 1;
                  const pct = Math.round((lok.n / max) * 100);
                  return (
                    <div key={i} className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-[0.65rem]">
                        <span className="font-bold text-slate-700 dark:text-slate-200 truncate pr-2">{lok.lokasi}</span>
                        <span className="font-mono font-black text-sblue">{lok.n}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-sblue rounded-full transition-all duration-1000" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

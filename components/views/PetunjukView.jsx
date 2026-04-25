'use client';

import { useState } from 'react';

const _ptkData = [
  { id: 'ptk-db', ico: 'fa-gauge-high', color: 'var(--blue)', bg: 'rgba(30, 111, 217, 0.12)', title: 'Dashboard', desc: 'Halaman utama menampilkan statistik ringkasan dan grafik data laporan patroli.', poin: ['Statistik total laporan, pelanggaran, & aktivitas hari ini', 'Grafik laporan per hari', 'Top lokasi patroli berdasarkan frekuensi', 'Tren Laporan dalam Format Triwulan', 'Jumlah Anggota Satlinmas Pedestrian'] },
  { id: 'ptk-peta', ico: 'fa-map-location-dot', color: '#0891b2', bg: '#e0f7fa', title: 'Peta Pedestrian', desc: 'Peta interaktif wilayah patroli Satlinmas Pedestrian.', poin: ['Mode Google My Maps menampilkan rute patroli, titik rawan, dan pos jaga', 'Mode Peta Realtime menampilkan laporan lapangan secara langsung', 'Klik layer atau marker untuk melihat detail lokasi', 'Tombol Edit Layer untuk administrator', 'Tombol Refresh untuk memuat ulang peta realtime'] },
  { id: 'ptk-rk', ico: 'fa-table-list', color: 'var(--amber)', bg: 'rgba(245, 158, 11, 0.12)', title: 'Rekap Laporan', desc: 'Melihat, mencari, dan mencetak seluruh laporan patroli.', poin: ['Filter berdasarkan kata kunci, lokasi, personil, atau rentang tanggal', 'Lihat foto dokumentasi langsung dari tabel', 'Cetak laporan tunggal atau kolektif (PDF rekap)', 'Admin dapat edit dan hapus laporan dari halaman ini'] },
  { id: 'ptk-in', ico: 'fa-plus-circle', color: 'var(--green)', bg: 'rgba(16, 185, 129, 0.12)', title: 'Input Laporan (Admin)', desc: 'Menambahkan laporan patroli baru melalui sistem terpusat.', poin: ['Input laporan eksklusif via embed sistem SI-PEDAS terpusat', 'Integrasi otomatis dengan penyimpanan cloud & database', 'Mendukung pengiriman foto dokumentasi beresolusi tinggi dengan watermark', 'Pengamanan data terenkripsi'] },
  { id: 'ptk-ed', ico: 'fa-file-pen', color: 'var(--purple)', bg: 'rgba(139, 92, 246, 0.12)', title: 'Edit Laporan', desc: 'Mengelola dan memperbaiki data laporan. Khusus Admin.', poin: ['Edit semua field laporan', 'Tambah atau hapus foto dari laporan', 'Hapus laporan secara permanen'] },
  { id: 'ptk-sl', ico: 'fa-users', color: 'var(--red)', bg: 'rgba(239, 68, 68, 0.12)', title: 'Data Satlinmas', desc: 'Manajemen data anggota Satlinmas Pedestrian.', poin: ['Tambah, edit, dan hapus data anggota', 'Data mencakup nama, tanggal lahir, unit, dan nomor WhatsApp', 'Usia dihitung otomatis dari tanggal lahir'] },
  { id: 'ptk-acc', ico: 'fa-user-shield', color: 'var(--blue)', bg: 'rgba(30, 111, 217, 0.12)', title: 'Tipe Akun & Hak Akses', desc: 'Dua level pengguna dengan batasan fitur berbeda.', poin: ['Administrator: Akses penuh (Input, Validasi, Edit, Hapus, Cetak).', 'Pengguna (User): Akses terbatas (hanya lihat dan cetak).'] },
  { id: 'ptk-auth', ico: 'fa-circle-info', color: '#34495e', bg: '#f4f7f6', title: 'Informasi Sistem', desc: 'Dikembangkan untuk mendukung efisiensi pelaporan Satlinmas Pedestrian Ponorogo.', poin: ['__PTK_DEV_CARD__'] }
];

export default function PetunjukView() {
  const [openOuter, setOpenOuter] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);

  const renderDevCard = () => (
    <div className="mt-3.5 p-4 bg-white dark:bg-theme-card border border-slate-200 dark:border-white/10 rounded-2xl flex items-center gap-4 shadow-sm relative overflow-hidden">
      <div className="absolute -top-5 -right-5 w-20 h-20 bg-sblue opacity-5 rounded-full blur-[10px]"></div>
      <div className="w-[72px] h-[72px] rounded-2xl border-2 border-slate-100 dark:border-white/5 flex-shrink-0 overflow-hidden shadow-sm bg-slate-100 dark:bg-white/5 flex items-center justify-center">
        <img src="/assets/basith.jpeg" alt="Developer" className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 relative z-10">
        <div className="text-[0.6rem] font-bold text-sblue uppercase tracking-wider mb-0.5">Developer & Designer</div>
        <div className="text-[0.85rem] font-black text-slate-800 dark:text-white mb-2.5">Ahmad Abdul Basith, S.Tr.I.P.</div>
        <a
          href={typeof window !== 'undefined' && typeof window.getSupportWaChatUrl === 'function' ? window.getSupportWaChatUrl() : '#'}
          target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 py-2 px-3.5 bg-[#25d366] text-white rounded-xl text-[0.7rem] font-bold transition-all duration-200 hover:-translate-y-0.5 shadow-[0_3px_8px_rgba(37,211,102,0.3)]"
        >
          <i className="fab fa-whatsapp text-[0.9rem]"></i> Chat Developer
        </a>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-[900px] mx-auto p-4 animate-[fadeIn_0.3s_ease]">
      <div className="bg-white dark:bg-theme-card border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">

        {/* Header Toggle */}
        <button
          onClick={() => setOpenOuter(!openOuter)}
          className="w-full flex items-center justify-between p-5 md:p-6 bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl shadow-inner">
              <i className="fas fa-book-open"></i>
            </div>
            <div className="text-left">
              <h2 className="text-[1.1rem] font-black text-slate-800 dark:text-white">Petunjuk Teknis SI-PEDAS</h2>
              <p className="text-[0.7rem] md:text-[0.75rem] font-bold text-slate-500 dark:text-slate-400 mt-0.5">Panduan fitur & penggunaan sistem</p>
            </div>
          </div>
          <i className={`fas fa-chevron-down text-slate-400 transition-transform duration-300 ${openOuter ? 'rotate-180' : ''}`}></i>
        </button>

        {/* List Panduan */}
        <div className={`transition-all duration-300 overflow-hidden ${openOuter ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="flex flex-col p-2">
            {_ptkData.map((item) => (
              <div key={item.id} className="border-b border-slate-100 dark:border-white/5 last:border-0">
                <button
                  onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                  className={`w-full flex items-center justify-between p-3.5 md:p-4 rounded-xl transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.02] ${openMenuId === item.id ? 'bg-slate-50 dark:bg-white/[0.02]' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-[34px] h-[34px] rounded-lg flex items-center justify-center text-[0.95rem] shrink-0"
                      style={{ backgroundColor: item.bg, color: item.color }}
                    >
                      <i className={item.ico.startsWith('fab') ? item.ico : `fas ${item.ico}`}></i>
                    </div>
                    <span className="text-[0.85rem] font-bold text-slate-700 dark:text-slate-200">{item.title}</span>
                  </div>
                  <i className={`fas fa-chevron-right text-slate-400 text-[0.8rem] transition-transform duration-300 ${openMenuId === item.id ? 'rotate-90' : ''}`}></i>
                </button>

                <div className={`overflow-hidden transition-all duration-300 px-4 md:px-14 ${openMenuId === item.id ? 'max-h-[500px] opacity-100 pb-5' : 'max-h-0 opacity-0 pb-0'}`}>
                  <p className="text-[0.75rem] text-slate-500 dark:text-slate-400 leading-relaxed mb-3">{item.desc}</p>
                  <ul className="pl-4 flex flex-col gap-2 m-0">
                    {item.poin.map((p, idx) => (
                      p === '__PTK_DEV_CARD__'
                        ? <li key={idx} className="list-none m-0 p-0 -ml-4">{renderDevCard()}</li>
                        : <li key={idx} className="text-[0.75rem] text-slate-600 dark:text-slate-300 font-medium leading-relaxed pl-1" style={{ listStyleType: 'disc', listStylePosition: 'outside' }}>{p}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

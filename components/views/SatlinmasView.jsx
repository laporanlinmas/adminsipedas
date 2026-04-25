'use client';

import { useState, useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import { useUI } from '../UIContext';

const fetcher = (url) => fetch(url).then((res) => res.json());
const SLM_PER = 24;

export default function SatlinmasView() {
  const { data, error, isLoading } = useSWR('/api/proxy?action=getSatlinmas', fetcher);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchName, setSearchName] = useState('');
  const [searchUnit, setSearchUnit] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [formData, setFormData] = useState({ nama: '', tglLahir: '', unit: '', wa: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rawData = data?.data || [];

  const filteredData = useMemo(() => {
    return rawData.filter(r => {
      const nm = searchName.toLowerCase();
      const un = searchUnit.toLowerCase();
      if (nm && (r.nama || '').toLowerCase().indexOf(nm) < 0) return false;
      if (un && (r.unit || '').toLowerCase().indexOf(un) < 0) return false;
      return true;
    });
  }, [rawData, searchName, searchUnit]);

  const total = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(total / SLM_PER));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const startIdx = (currentPageSafe - 1) * SLM_PER;
  const currentData = filteredData.slice(startIdx, startIdx + SLM_PER);

  const unitCount = useMemo(() => {
    const counts = {};
    rawData.forEach(r => {
      const k = r.unit || 'Lainnya';
      counts[k] = (counts[k] || 0) + 1;
    });
    return counts;
  }, [rawData]);

  const handlePageChange = (p) => {
    setCurrentPage(p);
    document.getElementById('slm-scroll-top')?.scrollIntoView({ behavior: 'smooth' });
  };

  const getAvClass = (unit) => {
    const u = (unit || '').toLowerCase();
    if (u.includes('satpol') || u.includes('pp')) return 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30';
    if (u.includes('desa')) return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30';
    if (u.includes('kelurahan') || u.includes('kel ')) return 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30';
    return 'bg-sblue-lo text-sblue border border-sblue/20';
  };

  const calculateUsia = (tgl) => {
    if (!tgl) return '';
    const d = new Date(tgl);
    if (isNaN(d.getTime())) return '';
    const now = new Date();
    let usia = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) usia--;
    return usia >= 0 ? usia : '';
  };

  const openModal = (row = null) => {
    setEditRow(row);
    setFormData({
      nama: row?.nama || '',
      tglLahir: row?.tglLahir || '',
      unit: row?.unit || '',
      wa: row?.wa || ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditRow(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama.trim()) {
      alert('Nama wajib diisi!');
      return;
    }
    
    setIsSubmitting(true);
    const action = editRow ? 'updateSatlinmas' : 'addSatlinmas';
    const payload = { ...formData, action };
    if (editRow) payload._ri = editRow._ri;

    try {
      const res = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(r => r.json());

      if (res.success) {
        // Refresh data
        mutate('/api/proxy?action=getSatlinmas');
        closeModal();
      } else {
        alert('Gagal: ' + (res.message || 'Unknown error'));
      }
    } catch (err) {
      alert('Jaringan error!');
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (ri) => {
    if (!confirm('Hapus data anggota ini? Tidak dapat dibatalkan.')) return;
    
    try {
      const res = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deleteSatlinmas', ri })
      }).then(r => r.json());

      if (res.success) {
        mutate('/api/proxy?action=getSatlinmas');
      } else {
        alert('Gagal menghapus: ' + (res.message || 'Unknown error'));
      }
    } catch (err) {
      alert('Jaringan error!');
    }
  };

  if (isLoading) return <div className="flex-1 flex items-center justify-center p-8 text-slate-400 font-bold"><i className="fas fa-spinner fa-spin mr-2"></i> Memuat Data Satlinmas...</div>;
  if (error || !data?.success) return <div className="flex-1 flex items-center justify-center p-8 text-red-400 font-bold"><i className="fas fa-circle-exclamation mr-2"></i> Gagal memuat data Satlinmas.</div>;

  return (
    <div className="w-full h-full flex flex-col relative" id="slm-scroll-top">
      {/* Header & Controls */}
      <div className="bg-white dark:bg-theme-card border-b border-slate-200 dark:border-white/5 sticky top-0 z-20 shadow-sm">
        <div className="p-4 md:px-6 md:py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-[1.1rem] font-black text-slate-800 dark:text-white flex items-center gap-2">
              <i className="fas fa-users text-sblue"></i> Data Satlinmas Pedestrian
            </h1>
            <div className="text-[0.65rem] font-medium text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap gap-2 items-center">
              <span>Total: <strong className="text-slate-800 dark:text-white">{total}</strong> anggota</span>
              <span className="opacity-50">•</span>
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(unitCount).map((k, i) => (
                  <span key={i} className="px-1.5 py-0.5 rounded border border-sblue/20 bg-sblue-lo text-sblue font-bold text-[0.6rem]">{k}: {unitCount[k]}</span>
                ))}
              </div>
            </div>
          </div>
          <button 
            onClick={() => openModal()}
            className="shrink-0 flex items-center justify-center gap-2 py-2.5 px-4 bg-sblue hover:bg-sblue-h text-white rounded-xl text-[0.75rem] font-extrabold tracking-wide shadow-md transition-all hover:-translate-y-0.5"
          >
            <i className="fas fa-user-plus"></i> Tambah Anggota
          </button>
        </div>
        
        {/* Filter Bar */}
        <div className="px-4 pb-4 md:px-6 md:pt-0 flex flex-col sm:flex-row gap-2 items-center">
          <div className="relative flex-1 w-full">
            <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[0.8rem]"></i>
            <input 
              type="text" 
              placeholder="Cari nama anggota..." 
              value={searchName}
              onChange={(e) => { setSearchName(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[0.8rem] text-slate-800 dark:text-white focus:border-sblue focus:ring-1 focus:ring-sblue outline-none transition-all"
            />
          </div>
          <div className="relative flex-1 w-full sm:max-w-[200px]">
            <i className="fas fa-filter absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[0.8rem]"></i>
            <input 
              type="text" 
              placeholder="Filter unit..." 
              value={searchUnit}
              onChange={(e) => { setSearchUnit(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[0.8rem] text-slate-800 dark:text-white focus:border-sblue focus:ring-1 focus:ring-sblue outline-none transition-all"
            />
          </div>
          {(searchName || searchUnit) && (
            <button 
              onClick={() => { setSearchName(''); setSearchUnit(''); setCurrentPage(1); }}
              className="w-full sm:w-10 h-9 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-600 dark:text-slate-300 rounded-xl flex items-center justify-center transition-colors shrink-0"
              title="Reset Filter"
            >
              <i className="fas fa-rotate-left"></i>
            </button>
          )}
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 p-4 md:p-6 bg-slate-50 dark:bg-[#0f172a]">
        {currentData.length === 0 ? (
          <div className="w-full py-12 flex flex-col items-center justify-center text-slate-400">
            <i className="fas fa-users-slash text-4xl mb-3 opacity-50"></i>
            <p className="font-bold text-[0.85rem]">Data tidak ditemukan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentData.map((r, i) => {
              const av = (r.nama || '?').charAt(0).toUpperCase();
              const usia = calculateUsia(r.tglLahir);
              const waLink = r.wa ? `https://wa.me/62${r.wa.replace(/^0/,'').replace(/[^0-9]/g,'')}` : null;
              
              return (
                <div key={i} className="bg-white dark:bg-theme-card border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex gap-4 items-start shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-all group relative overflow-hidden">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black shrink-0 ${getAvClass(r.unit)}`}>
                    {av}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[0.85rem] font-bold text-slate-800 dark:text-white truncate" title={r.nama}>{r.nama}</div>
                    <div className="text-[0.65rem] font-bold text-slate-500 dark:text-slate-400 mb-2 truncate">{r.unit || '—'}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {usia && <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-[0.6rem] font-bold"><i className="fas fa-cake-candles text-[0.55rem] opacity-70"></i> {usia} thn</span>}
                      {waLink && <a href={waLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-[0.6rem] font-bold hover:bg-emerald-100 dark:hover:bg-emerald-500/20"><i className="fab fa-whatsapp text-[0.6rem]"></i> {r.wa}</a>}
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                    <button onClick={() => openModal(r)} className="w-7 h-7 rounded-lg bg-sblue-lo text-sblue hover:bg-sblue hover:text-white flex items-center justify-center text-[0.7rem] transition-colors"><i className="fas fa-pen"></i></button>
                    <button onClick={() => handleDelete(r._ri)} className="w-7 h-7 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white dark:bg-rose-500/10 dark:hover:bg-rose-500 flex items-center justify-center text-[0.7rem] transition-colors"><i className="fas fa-trash"></i></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-theme-card border border-slate-200 dark:border-white/5 rounded-2xl">
            <span className="text-[0.7rem] font-bold text-slate-500">Menampilkan {startIdx + 1}-{Math.min(startIdx + SLM_PER, total)} dari {total}</span>
            <div className="flex items-center gap-1">
              <button disabled={currentPageSafe === 1} onClick={() => handlePageChange(currentPageSafe - 1)} className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 disabled:opacity-30 flex items-center justify-center transition-colors"><i className="fas fa-chevron-left"></i></button>
              
              {/* Simple page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let p = currentPageSafe;
                if (totalPages <= 5) p = i + 1;
                else if (currentPageSafe <= 3) p = i + 1;
                else if (currentPageSafe >= totalPages - 2) p = totalPages - 4 + i;
                else p = currentPageSafe - 2 + i;
                
                return (
                  <button key={p} onClick={() => handlePageChange(p)} className={`w-8 h-8 rounded-lg text-[0.75rem] font-bold flex items-center justify-center transition-colors ${p === currentPageSafe ? 'bg-sblue text-white shadow-md' : 'bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300'}`}>
                    {p}
                  </button>
                );
              })}

              <button disabled={currentPageSafe === totalPages} onClick={() => handlePageChange(currentPageSafe + 1)} className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 disabled:opacity-30 flex items-center justify-center transition-colors"><i className="fas fa-chevron-right"></i></button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Tambah/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={closeModal}></div>
          <div className="bg-white dark:bg-theme-card border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-[400px] relative z-10 shadow-2xl animate-[slideUp_0.3s_ease-out] flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50 dark:bg-white/[0.02]">
              <h3 className="text-[1rem] font-black text-slate-800 dark:text-white flex items-center gap-2">
                {editRow ? <><i className="fas fa-user-pen text-sblue"></i> Edit Anggota</> : <><i className="fas fa-user-plus text-emerald-500"></i> Tambah Anggota</>}
              </h3>
              <button onClick={closeModal} className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400 hover:bg-rose-500 hover:text-white transition-colors flex items-center justify-center">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-[0.65rem] font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5">Nama Lengkap <span className="text-rose-500">*</span></label>
                <input required type="text" value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 rounded-xl text-[0.8rem] text-slate-800 dark:text-white focus:border-sblue focus:ring-1 focus:ring-sblue outline-none transition-all" placeholder="Nama Lengkap" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[0.65rem] font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5">Tanggal Lahir</label>
                  <input type="date" value={formData.tglLahir} onChange={e => setFormData({...formData, tglLahir: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 rounded-xl text-[0.8rem] text-slate-800 dark:text-white focus:border-sblue focus:ring-1 focus:ring-sblue outline-none transition-all" />
                  {formData.tglLahir && <div className="text-[0.65rem] text-sblue font-bold mt-1">Usia: {calculateUsia(formData.tglLahir)} thn</div>}
                </div>
                <div>
                  <label className="block text-[0.65rem] font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5">Unit</label>
                  <select value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 rounded-xl text-[0.8rem] text-slate-800 dark:text-white focus:border-sblue focus:ring-1 focus:ring-sblue outline-none transition-all">
                    <option value="">-- Pilih Unit --</option>
                    <option value="Satpol PP">Satpol PP</option>
                    <option value="Satlinmas Desa/Kelurahan">Satlinmas Desa/Kelurahan</option>
                    <option value="Satgas Linmas Pedestrian">Satgas Linmas Pedestrian</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[0.65rem] font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5">Nomor WhatsApp</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[0.8rem] font-bold text-slate-400">+62</span>
                  <input type="text" value={formData.wa} onChange={e => setFormData({...formData, wa: e.target.value})} className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 rounded-xl text-[0.8rem] text-slate-800 dark:text-white focus:border-sblue focus:ring-1 focus:ring-sblue outline-none transition-all" placeholder="8123xxxxxx" />
                </div>
              </div>
              
              <div className="mt-2 flex gap-2 justify-end">
                <button type="button" onClick={closeModal} className="px-4 py-2 rounded-xl text-[0.75rem] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">Batal</button>
                <button disabled={isSubmitting} type="submit" className="px-5 py-2 rounded-xl bg-sblue hover:bg-sblue-h text-white text-[0.75rem] font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-50">
                  {isSubmitting ? <><i className="fas fa-spinner fa-spin"></i> Menyimpan...</> : <><i className="fas fa-save"></i> Simpan</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

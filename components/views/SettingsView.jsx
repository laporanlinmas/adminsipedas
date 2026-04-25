'use client';

import { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import { useUI } from '../UIContext';

const fetcher = (url) => fetch(url).then(res => res.json());

export default function SettingsView() {
  const { data, error, isLoading } = useSWR('/api/proxy?action=getSettings', fetcher);
  
  const [formData, setFormData] = useState({
    user_fullname: '', user_uname: '', user_pwd: '',
    pdf_judul: '', pdf_nospt: '', pdf_tujuan: '',
    pdf_anggota: '', pdf_pukul: '', pdf_jabatan: '',
    pdf_nama: '', pdf_pangkat: '', pdf_nip: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const session = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('_slm') || 'null') : null;
  const isAdmin = session?.role?.toLowerCase() === 'admin';

  useEffect(() => {
    if (data?.data) {
      setFormData(prev => ({ ...prev, ...data.data }));
    }
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Hanya admin yang dapat menyimpan pengaturan.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateSettings', ...formData })
      }).then(r => r.json());

      if (res.success) {
        alert('Pengaturan berhasil disimpan!');
        mutate('/api/proxy?action=getSettings');
      } else {
        alert('Gagal: ' + (res.message || 'Unknown error'));
      }
    } catch (err) {
      alert('Error saat menyimpan!');
    }
    setIsSubmitting(false);
  };

  if (!isAdmin) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-rose-500 font-bold h-full bg-slate-50 dark:bg-slate-900">
        <i className="fas fa-ban text-4xl mb-3"></i>
        <p>Akses ditolak. Fitur ini hanya untuk Administrator.</p>
      </div>
    );
  }

  if (isLoading) return <div className="flex-1 flex items-center justify-center p-8 text-slate-400 font-bold h-full bg-slate-50 dark:bg-slate-900"><i className="fas fa-spinner fa-spin mr-2"></i> Memuat Pengaturan...</div>;
  if (error || !data?.success) return <div className="flex-1 flex items-center justify-center p-8 text-red-400 font-bold h-full bg-slate-50 dark:bg-slate-900"><i className="fas fa-circle-exclamation mr-2"></i> Gagal memuat pengaturan.</div>;

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-50 dark:bg-[#0f172a] p-4 md:p-6 animate-[fadeIn_0.3s_ease]">
      <div className="max-w-[960px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[1.3rem] font-black text-slate-800 dark:text-white flex items-center gap-2">
              <i className="fas fa-cog text-slate-500"></i> Pengaturan Sistem
            </h1>
            <p className="text-[0.75rem] font-medium text-slate-500 mt-1">Kelola akun, template cetak & konfigurasi global.</p>
          </div>
          <button 
            onClick={handleSave} 
            disabled={isSubmitting}
            className="hidden md:flex px-5 py-2.5 bg-sblue hover:bg-sblue-h text-white rounded-xl text-[0.8rem] font-bold shadow-md items-center gap-2 disabled:opacity-50 transition-all"
          >
            {isSubmitting ? <><i className="fas fa-spinner fa-spin"></i> Menyimpan...</> : <><i className="fas fa-save"></i> Simpan Semua</>}
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          
          {/* Akun Section */}
          <div className="bg-white dark:bg-theme-card border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02]">
              <h2 className="text-[0.95rem] font-black text-slate-800 dark:text-white flex items-center gap-2">
                <i className="fas fa-user-shield text-emerald-500"></i> Manajemen Akun Admin
              </h2>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[0.65rem] font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5">Nama Lengkap</label>
                <input name="user_fullname" value={formData.user_fullname || ''} onChange={handleChange} className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 rounded-xl text-[0.85rem] text-slate-800 dark:text-white focus:border-sblue outline-none transition-all" />
              </div>
              <div>
                <label className="block text-[0.65rem] font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5">Username (Login)</label>
                <input name="user_uname" value={formData.user_uname || ''} onChange={handleChange} className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 rounded-xl text-[0.85rem] text-slate-800 dark:text-white focus:border-sblue outline-none transition-all" />
              </div>
              <div>
                <label className="block text-[0.65rem] font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5">Password Baru</label>
                <input type="password" name="user_pwd" value={formData.user_pwd || ''} onChange={handleChange} placeholder="Kosongkan jika tidak diubah" className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 rounded-xl text-[0.85rem] text-slate-800 dark:text-white focus:border-sblue outline-none transition-all" />
                <p className="text-[0.6rem] text-slate-500 mt-1 mt-1.5"><i className="fas fa-info-circle text-amber-500"></i> Jika diubah, Anda harus login ulang.</p>
              </div>
            </div>
          </div>

          {/* Cetak PDF Section */}
          <div className="bg-white dark:bg-theme-card border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02]">
              <h2 className="text-[0.95rem] font-black text-slate-800 dark:text-white flex items-center gap-2">
                <i className="fas fa-file-pdf text-rose-500"></i> Template Cetak PDF & Laporan
              </h2>
            </div>
            <div className="p-5 flex flex-col gap-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[0.65rem] font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5">Judul Laporan Utama</label>
                  <textarea name="pdf_judul" value={formData.pdf_judul || ''} onChange={handleChange} rows="2" className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 rounded-xl text-[0.85rem] text-slate-800 dark:text-white focus:border-sblue outline-none transition-all" />
                </div>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-[0.65rem] font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5">Nomor SPT Laporan</label>
                    <input name="pdf_nospt" value={formData.pdf_nospt || ''} onChange={handleChange} className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 rounded-xl text-[0.85rem] text-slate-800 dark:text-white focus:border-sblue outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-[0.65rem] font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5">Tujuan Patroli</label>
                    <input name="pdf_tujuan" value={formData.pdf_tujuan || ''} onChange={handleChange} className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 rounded-xl text-[0.85rem] text-slate-800 dark:text-white focus:border-sblue outline-none transition-all" />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-slate-100 dark:border-white/5">
                <div>
                  <label className="block text-[0.65rem] font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5">Anggota Patroli Default</label>
                  <textarea name="pdf_anggota" value={formData.pdf_anggota || ''} onChange={handleChange} rows="2" className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 rounded-xl text-[0.85rem] text-slate-800 dark:text-white focus:border-sblue outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[0.65rem] font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5">Pukul (Waktu)</label>
                  <input name="pdf_pukul" value={formData.pdf_pukul || ''} onChange={handleChange} className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 rounded-xl text-[0.85rem] text-slate-800 dark:text-white focus:border-sblue outline-none transition-all" />
                </div>
              </div>

            </div>
          </div>

          {/* Pejabat TTD Section */}
          <div className="bg-white dark:bg-theme-card border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm mb-20 md:mb-0">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02]">
              <h2 className="text-[0.95rem] font-black text-slate-800 dark:text-white flex items-center gap-2">
                <i className="fas fa-signature text-purple-500"></i> Pejabat Penandatangan Laporan
              </h2>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[0.65rem] font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5">Jabatan Tanda Tangan</label>
                <input name="pdf_jabatan" value={formData.pdf_jabatan || ''} onChange={handleChange} className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 rounded-xl text-[0.85rem] text-slate-800 dark:text-white focus:border-sblue outline-none transition-all" />
              </div>
              <div>
                <label className="block text-[0.65rem] font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5">Nama Pejabat</label>
                <input name="pdf_nama" value={formData.pdf_nama || ''} onChange={handleChange} className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 rounded-xl text-[0.85rem] text-slate-800 dark:text-white focus:border-sblue outline-none transition-all" />
              </div>
              <div>
                <label className="block text-[0.65rem] font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5">Pangkat Pejabat</label>
                <input name="pdf_pangkat" value={formData.pdf_pangkat || ''} onChange={handleChange} className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 rounded-xl text-[0.85rem] text-slate-800 dark:text-white focus:border-sblue outline-none transition-all" />
              </div>
              <div>
                <label className="block text-[0.65rem] font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5">NIP Pejabat</label>
                <input name="pdf_nip" value={formData.pdf_nip || ''} onChange={handleChange} className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 rounded-xl text-[0.85rem] text-slate-800 dark:text-white focus:border-sblue outline-none transition-all" />
              </div>
            </div>
          </div>

          {/* Floating Save Button on Mobile */}
          <div className="fixed bottom-[80px] right-4 md:hidden z-30">
            <button 
              onClick={handleSave} 
              disabled={isSubmitting}
              className="w-14 h-14 bg-sblue text-white rounded-full flex items-center justify-center text-xl shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

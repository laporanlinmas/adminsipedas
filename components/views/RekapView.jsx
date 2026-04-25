'use client';

import { useState, useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import { useUI } from '../UIContext';

const fetcher = (url) => fetch(url).then(res => res.json());
const PER = 15;

export default function RekapView() {
  const { isMobile } = useUI();
  const { data, error, isLoading } = useSWR('/api/proxy?action=getRekap', fetcher);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Modals state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfRow, setPdfRow] = useState(null);
  const [pdfHtml, setPdfHtml] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const rawData = data?.data?.rows || data?.data || [];
  const session = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('_slm') || 'null') : null;
  const isAdmin = session?.role?.toLowerCase() === 'admin';

  // Helper Functions
  const parseISODate = (s) => {
    if (!s) return null;
    const m = /(\d{4})-(\d{2})-(\d{2})/.exec(s);
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
  };
  
  const parseTglID = (s) => {
    if (!s) return null;
    const BLN = { januari: 1, februari: 2, maret: 3, april: 4, mei: 5, juni: 6, juli: 7, agustus: 8, september: 9, oktober: 10, november: 11, desember: 12 };
    const b = s.replace(/^[A-Za-z]+,?\s*/, '').trim().toLowerCase();
    const m = /(\d{1,2})\s+([a-z]+)\s+(\d{4})/.exec(b);
    if (m && BLN[m[2]]) return new Date(+m[3], BLN[m[2]] - 1, +m[1]);
    const m2 = /(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/.exec(s);
    if (m2) return new Date(+m2[3], +m2[2] - 1, +m2[1]);
    return null;
  };

  const filteredData = useMemo(() => {
    return rawData.filter(r => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const searchable = [r.lokasi, r.tanggal, r.hari, r.personil, r.identitas, r.danru, r.namaDanru, r.keterangan].join(' ').toLowerCase();
        if (!searchable.includes(q)) return false;
      }
      if (dateFrom) {
        const df = parseISODate(dateFrom);
        const dt = parseTglID(r.tanggal);
        if (df && (!dt || dt < df)) return false;
      }
      if (dateTo) {
        const dto = parseISODate(dateTo);
        const dt2 = parseTglID(r.tanggal);
        if (dto) {
          dto.setHours(23, 59, 59, 999);
          if (!dt2 || dt2 > dto) return false;
        }
      }
      return true;
    });
  }, [rawData, searchQuery, dateFrom, dateTo]);

  const total = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(total / PER));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const startIdx = (currentPageSafe - 1) * PER;
  const currentData = filteredData.slice(startIdx, startIdx + PER);

  const resetFilters = () => {
    setSearchQuery('');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  const handleDelete = async (ri) => {
    if (!confirm('Hapus laporan ini secara permanen?')) return;
    try {
      const res = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deleteData', ri })
      }).then(r => r.json());
      if (res.success) {
        mutate('/api/proxy?action=getRekap');
      } else {
        alert('Gagal: ' + (res.message || 'Unknown error'));
      }
    } catch (err) {
      alert('Jaringan error!');
    }
  };

  const openGallery = (fotos) => {
    if (!fotos || !fotos.length) return;
    setGalleryImages(fotos);
    setGalleryIndex(0);
    setGalleryOpen(true);
  };

  // PDF Preview Generation
  const generatePdfPreview = async (row) => {
    setIsGeneratingPdf(true);
    try {
      const res = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generateLaporanHtml',
          hari: row.hari || '',
          tanggal: row.tanggal || '',
          tujuan: 'Melaksanakan Monitoring Dan Pengamanan Area Wisata Pedestrian',
          lokasi: row.lokasi || '',
          anggota: 'Regu Pedestrian, Anggota Bidang Linmas, Satpol PP',
          pukul: '16.00 – 00.00 WIB',
          identitas: row.identitas && row.identitas.toUpperCase() !== 'NIHIL' ? row.identitas : '',
          keterangan: row.keterangan || '',
          uraian: row.keterangan || '',
          jabatanTtd: 'Kepala Bidang SDA dan Linmas',
          namaTtd: 'Erry Setiyoso Birowo, SP',
          pangkatTtd: 'Pembina',
          nipTtd: '19751029 200212 1 008',
          fotos: row.fotos || []
        })
      }).then(r => r.json());

      if (res.success) {
        setPdfHtml(res.data?.html || res.html || '');
      } else {
        alert('Gagal generate PDF');
      }
    } catch (err) {
      alert('Error saat memuat preview');
    }
    setIsGeneratingPdf(false);
  };

  const handleOpenPdf = (row) => {
    setPdfRow(row);
    setPdfHtml('');
    setPdfModalOpen(true);
    generatePdfPreview(row);
  };

  const printPdf = () => {
    const iframe = document.getElementById('pdfframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }
  };

  if (isLoading) return <div className="flex-1 flex items-center justify-center p-8 text-slate-400 font-bold"><i className="fas fa-spinner fa-spin mr-2"></i> Memuat Data Rekap...</div>;
  if (error || !data?.success) return <div className="flex-1 flex items-center justify-center p-8 text-red-400 font-bold"><i className="fas fa-circle-exclamation mr-2"></i> Gagal memuat data Rekap.</div>;

  return (
    <div className="w-full h-full flex flex-col relative">
      {/* Header & Filter */}
      <div className="bg-white dark:bg-theme-card border-b border-slate-200 dark:border-white/5 sticky top-0 z-20 shadow-sm">
        <div className="p-4 md:px-6 md:py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h1 className="text-[1.1rem] font-black text-slate-800 dark:text-white flex items-center gap-2">
            <i className="fas fa-table-list text-amber-500"></i> Rekap Laporan
            <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-[0.65rem] text-slate-500 font-mono">{total}</span>
          </h1>
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 min-w-[200px]">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[0.7rem]"></i>
              <input 
                type="text" 
                placeholder="Cari lokasi, personil..." 
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-[0.75rem] outline-none focus:border-sblue"
              />
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-1">
              <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setCurrentPage(1); }} className="bg-transparent text-[0.7rem] outline-none text-slate-600 dark:text-slate-300 w-[100px]" />
              <span className="text-[0.7rem] text-slate-400">-</span>
              <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setCurrentPage(1); }} className="bg-transparent text-[0.7rem] outline-none text-slate-600 dark:text-slate-300 w-[100px]" />
            </div>
            {(searchQuery || dateFrom || dateTo) && (
              <button onClick={resetFilters} className="w-8 h-[30px] flex items-center justify-center bg-slate-100 dark:bg-white/10 rounded-lg hover:bg-slate-200 dark:hover:bg-white/20 transition-colors">
                <i className="fas fa-rotate-left text-[0.75rem] text-slate-600 dark:text-slate-300"></i>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto p-4 md:p-6 bg-slate-50 dark:bg-[#0f172a]">
        {currentData.length === 0 ? (
           <div className="w-full py-12 flex flex-col items-center justify-center text-slate-400">
             <i className="fas fa-inbox text-4xl mb-3 opacity-50"></i>
             <p className="font-bold text-[0.85rem]">Tidak ada data.</p>
           </div>
        ) : isMobile ? (
          /* Mobile Card View */
          <div className="flex flex-col gap-3">
            {currentData.map((r, i) => (
              <div key={i} className="bg-white dark:bg-theme-card border border-slate-200 dark:border-white/10 rounded-xl p-3.5 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-bold text-slate-800 dark:text-white text-[0.8rem] line-clamp-2">{r.lokasi}</div>
                  {r.identitas && r.identitas.toUpperCase() !== 'NIHIL' ? (
                    <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-500 text-[0.6rem] font-bold shrink-0 border border-rose-200 ml-2">Pelanggaran</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[0.6rem] font-bold shrink-0">Nihil</span>
                  )}
                </div>
                <div className="flex flex-col gap-1 text-[0.7rem] text-slate-600 dark:text-slate-400 mb-3">
                  <div className="flex items-center gap-1.5"><i className="fas fa-calendar-day w-3 text-amber-500"></i> {r.hari}, {r.tanggal}</div>
                  <div className="flex items-center gap-1.5"><i className="fas fa-users w-3 text-blue-500"></i> {r.personil}</div>
                  <div className="flex items-center gap-1.5"><i className="fas fa-clipboard w-3 text-teal-500"></i> <span className="line-clamp-1">{r.keterangan || '-'}</span></div>
                </div>
                <div className="flex justify-between items-center border-t border-slate-100 dark:border-white/5 pt-2">
                  <div className="flex items-center gap-2">
                    {(r.fotos || []).length > 0 && (
                      <button onClick={() => openGallery(r.fotos)} className="text-[0.65rem] font-bold px-2 py-1 bg-emerald-50 text-emerald-600 rounded flex items-center gap-1"><i className="fas fa-images"></i> {r.fotos.length}</button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleOpenPdf(r)} className="w-7 h-7 rounded bg-sblue-lo text-sblue flex items-center justify-center hover:bg-sblue hover:text-white transition-colors"><i className="fas fa-file-pdf"></i></button>
                    {isAdmin && (
                      <>
                        <button className="w-7 h-7 rounded bg-purple-50 text-purple-600 flex items-center justify-center hover:bg-purple-500 hover:text-white transition-colors"><i className="fas fa-pen"></i></button>
                        <button onClick={() => handleDelete(r._ri)} className="w-7 h-7 rounded bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors"><i className="fas fa-trash"></i></button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Desktop Table View */
          <div className="bg-white dark:bg-theme-card border border-slate-200 dark:border-white/10 rounded-xl overflow-x-auto shadow-sm">
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-white/[0.02] border-b-2 border-slate-200 dark:border-white/10">
                  <th className="p-3 text-[0.7rem] font-black uppercase text-slate-500 dark:text-slate-400 w-12 text-center">#</th>
                  <th className="p-3 text-[0.7rem] font-black uppercase text-slate-500 dark:text-slate-400 w-24">Tanggal</th>
                  <th className="p-3 text-[0.7rem] font-black uppercase text-slate-500 dark:text-slate-400 w-48">Lokasi</th>
                  <th className="p-3 text-[0.7rem] font-black uppercase text-slate-500 dark:text-slate-400 w-24">Pelanggaran</th>
                  <th className="p-3 text-[0.7rem] font-black uppercase text-slate-500 dark:text-slate-400 w-32">Personil</th>
                  <th className="p-3 text-[0.7rem] font-black uppercase text-slate-500 dark:text-slate-400">Keterangan</th>
                  <th className="p-3 text-[0.7rem] font-black uppercase text-slate-500 dark:text-slate-400 w-20 text-center">Foto</th>
                  <th className="p-3 text-[0.7rem] font-black uppercase text-slate-500 dark:text-slate-400 w-28 text-center sticky right-0 bg-slate-50 dark:bg-[#131b2e] border-l border-slate-200 dark:border-white/5 shadow-[-4px_0_10px_rgba(0,0,0,0.03)] z-10">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((r, i) => (
                  <tr key={i} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                    <td className="p-3 text-[0.7rem] font-mono text-slate-400 text-center">{startIdx + i + 1}</td>
                    <td className="p-3">
                      <div className="text-[0.7rem] font-bold text-slate-700 dark:text-slate-200">{r.tanggal}</div>
                      <div className="text-[0.6rem] text-slate-500">{r.hari}</div>
                    </td>
                    <td className="p-3 text-[0.75rem] font-semibold text-slate-800 dark:text-white leading-relaxed">{r.lokasi}</td>
                    <td className="p-3">
                      {r.identitas && r.identitas.toUpperCase() !== 'NIHIL' ? (
                        <span className="px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 text-[0.65rem] font-bold">Pelanggaran</span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 text-[0.65rem] font-bold">Nihil</span>
                      )}
                    </td>
                    <td className="p-3 text-[0.7rem] text-slate-600 dark:text-slate-300 line-clamp-2" title={r.personil}>{r.personil}</td>
                    <td className="p-3 text-[0.7rem] text-slate-600 dark:text-slate-300 leading-relaxed"><div className="line-clamp-2">{r.keterangan || '-'}</div></td>
                    <td className="p-3 text-center">
                      {(r.fotos || []).length > 0 ? (
                        <button onClick={() => openGallery(r.fotos)} className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-[0.65rem] font-bold hover:bg-emerald-100 transition-colors"><i className="fas fa-images"></i> {r.fotos.length}</button>
                      ) : <span className="text-slate-400 text-[0.7rem]">—</span>}
                    </td>
                    <td className="p-3 text-center sticky right-0 bg-white dark:bg-theme-card group-hover:bg-slate-50 dark:group-hover:bg-white/[0.02] border-l border-slate-100 dark:border-white/5 transition-colors z-10">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => handleOpenPdf(r)} className="w-8 h-8 rounded-lg bg-sblue-lo text-sblue flex items-center justify-center hover:bg-sblue hover:text-white transition-colors" title="Cetak PDF"><i className="fas fa-file-pdf"></i></button>
                        {isAdmin && (
                          <>
                            <button className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 hover:text-slate-900 transition-colors" title="Edit"><i className="fas fa-pen"></i></button>
                            <button onClick={() => handleDelete(r._ri)} className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors" title="Hapus"><i className="fas fa-trash"></i></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between p-4 bg-white dark:bg-theme-card border border-slate-200 dark:border-white/10 rounded-xl">
            <span className="text-[0.7rem] font-bold text-slate-500">Menampilkan {startIdx + 1}-{Math.min(startIdx + PER, total)} dari {total}</span>
            <div className="flex gap-1">
              <button disabled={currentPageSafe === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 disabled:opacity-30"><i className="fas fa-chevron-left"></i></button>
              <button disabled={currentPageSafe === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 disabled:opacity-30"><i className="fas fa-chevron-right"></i></button>
            </div>
          </div>
        )}
      </div>

      {/* PDF Modal */}
      {pdfModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setPdfModalOpen(false)}></div>
          <div className="bg-white dark:bg-theme-card border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] relative z-10 flex flex-col shadow-2xl overflow-hidden animate-[slideUp_0.3s_ease-out]">
            <div className="p-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-white/[0.02]">
              <h3 className="text-[1rem] font-black flex items-center gap-2"><i className="fas fa-file-pdf text-rose-500"></i> Cetak Laporan PDF</h3>
              <button onClick={() => setPdfModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors"><i className="fas fa-times"></i></button>
            </div>
            <div className="flex-1 p-4 bg-slate-100 dark:bg-[#0f172a] overflow-hidden flex flex-col">
              {isGeneratingPdf ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                  <i className="fas fa-spinner fa-spin text-3xl mb-3"></i>
                  <p className="font-bold">Membuat dokumen...</p>
                </div>
              ) : (
                <div className="flex-1 bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm relative">
                  <iframe 
                    id="pdfframe"
                    srcDoc={pdfHtml} 
                    className="w-full h-full border-none bg-white" 
                    title="PDF Preview"
                  />
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-white/5 flex justify-end gap-2 bg-slate-50 dark:bg-white/[0.02]">
              <button onClick={() => setPdfModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-bold text-[0.8rem] hover:bg-slate-300">Tutup</button>
              <button onClick={printPdf} disabled={isGeneratingPdf} className="px-5 py-2 rounded-xl bg-sblue hover:bg-sblue-h text-white font-bold text-[0.8rem] flex items-center gap-2 disabled:opacity-50"><i className="fas fa-print"></i> Cetak / Simpan PDF</button>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Lightbox */}
      {galleryOpen && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/95 backdrop-blur-md">
          <button onClick={() => setGalleryOpen(false)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-rose-500 transition-colors z-10"><i className="fas fa-times text-xl"></i></button>
          
          <button 
            disabled={galleryIndex === 0} 
            onClick={() => setGalleryIndex(i => i - 1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 disabled:opacity-30 transition-colors z-10"
          ><i className="fas fa-chevron-left text-xl"></i></button>
          
          <img src={galleryImages[galleryIndex]} className="max-w-[90vw] max-h-[80vh] object-contain" alt="Gallery" />
          
          <button 
            disabled={galleryIndex === galleryImages.length - 1} 
            onClick={() => setGalleryIndex(i => i + 1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 disabled:opacity-30 transition-colors z-10"
          ><i className="fas fa-chevron-right text-xl"></i></button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/50 text-white font-bold text-sm backdrop-blur-md">
            {galleryIndex + 1} / {galleryImages.length}
          </div>
        </div>
      )}
    </div>
  );
}

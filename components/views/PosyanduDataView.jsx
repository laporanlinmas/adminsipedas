'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';

const fetcher = (url) => fetch(url).then(r => r.json());
const API_URL = '/api/proxy?action=getPosyandu';
const EMPTY_FORM = { nama: '', rtrw: '', desa: '', kecamatan: '', koordinat: '', lat: '', lng: '', foto: '', keterangan: '' };

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[500] flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-[520px] bg-white dark:bg-[#111827] rounded-t-3xl md:rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[92dvh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/[0.06]">
          <div className="text-[0.95rem] font-black text-slate-800 dark:text-white">{title}</div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10 transition-all">
            <i className="fas fa-times text-[0.85rem]"></i>
          </button>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

const inputCls = "w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 rounded-xl text-[0.85rem] text-slate-800 dark:text-white focus:border-rose-500 outline-none transition-all";

export default function PosyanduDataView() {
  const { data, isLoading } = useSWR(API_URL, fetcher);
  const rows = data?.data?.data || [];
  const [search, setSearch] = useState('');
  const [filterKec, setFilterKec] = useState('');
  const [modal, setModal] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const kecamatanList = [...new Set(rows.map(r => r.kecamatan).filter(Boolean))].sort();
  const filtered = rows.filter(r => {
    const q = search.toLowerCase();
    const matchQ = !q || [r.nama, r.desa, r.kecamatan, r.rtrw].some(v => (v || '').toLowerCase().includes(q));
    return matchQ && (!filterKec || r.kecamatan === filterKec);
  });

  const parseKoordinat = (str) => {
    const m = /(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)/.exec(str || '');
    return m ? { lat: m[1], lng: m[2] } : null;
  };

  const openAdd = () => { setEditRow(null); setForm(EMPTY_FORM); setModal(true); };
  const openEdit = (row) => { setEditRow(row); setForm({ ...row }); setModal(true); };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'koordinat') { const p = parseKoordinat(value); if (p) { next.lat = p.lat; next.lng = p.lng; } }
      if ((name === 'lat' || name === 'lng') && next.lat && next.lng) next.koordinat = `${next.lat}, ${next.lng}`;
      return next;
    });
  };

  const handleSave = async () => {
    if (!form.nama.trim()) { alert('Nama Posyandu wajib diisi.'); return; }
    setSaving(true);
    const action = editRow ? 'updatePosyandu' : 'addPosyandu';
    const payload = { action, ...form };
    if (editRow) payload._ri = editRow._ri;
    const res = await fetch('/api/proxy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).then(r => r.json());
    setSaving(false);
    if (res.success) { mutate(API_URL); setModal(false); }
    else alert('Gagal: ' + res.message);
  };

  const handleDelete = async (ri) => {
    const res = await fetch('/api/proxy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'deletePosyandu', ri }) }).then(r => r.json());
    if (res.success) { mutate(API_URL); setDeleteConfirm(null); }
    else alert('Gagal hapus: ' + res.message);
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-50 dark:bg-[#0d1117] animate-[fadeIn_0.3s_ease]">
      <div className="px-4 md:px-6 py-5 max-w-[1100px] mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-[1.2rem] font-black text-slate-800 dark:text-white flex items-center gap-2">
              <i className="fas fa-heart-pulse text-rose-500"></i> Data Posyandu
            </h1>
            <p className="text-[0.7rem] text-slate-500 mt-0.5">Total <strong>{filtered.length}</strong> dari {rows.length} posyandu</p>
          </div>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-[0.8rem] font-bold shadow-sm transition-all">
            <i className="fas fa-plus"></i> Tambah Posyandu
          </button>
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          <div className="flex-1 min-w-[160px] relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[0.8rem]"></i>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama, desa, kecamatan..."
              className="w-full pl-8 pr-3.5 py-2.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 rounded-xl text-[0.82rem] text-slate-800 dark:text-white focus:border-rose-500 outline-none transition-all" />
          </div>
          <select value={filterKec} onChange={e => setFilterKec(e.target.value)}
            className="px-3.5 py-2.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 rounded-xl text-[0.82rem] text-slate-800 dark:text-white focus:border-rose-500 outline-none transition-all">
            <option value="">Semua Kecamatan</option>
            {kecamatanList.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
          {(search || filterKec) && (
            <button onClick={() => { setSearch(''); setFilterKec(''); }} className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 text-[0.82rem] font-bold hover:bg-slate-200 dark:hover:bg-white/10 transition-all">
              <i className="fas fa-rotate-left"></i>
            </button>
          )}
        </div>

        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-100 dark:border-white/[0.06] shadow-sm overflow-hidden mb-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-slate-400 gap-2"><i className="fas fa-spinner fa-spin text-xl"></i><span className="text-[0.85rem]">Memuat data...</span></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <i className="fas fa-heart-pulse text-4xl mb-3 opacity-20"></i>
              <p className="text-[0.85rem] font-semibold">{rows.length === 0 ? 'Belum ada data Posyandu.' : 'Tidak ada hasil pencarian.'}</p>
              {rows.length === 0 && <button onClick={openAdd} className="mt-3 text-[0.75rem] px-4 py-2 rounded-xl bg-rose-500 text-white font-bold hover:bg-rose-600">+ Tambah Posyandu</button>}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[0.78rem]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
                    {['Nama Posyandu', 'RT/RW', 'Desa/Kel', 'Kecamatan', 'Koordinat', 'Foto', 'Aksi'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[0.65rem] font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-white/[0.03]">
                  {filtered.map(row => (
                    <tr key={row._ri} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center flex-shrink-0">
                            <i className="fas fa-heart-pulse text-rose-500 text-[0.75rem]"></i>
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 dark:text-white">{row.nama}</div>
                            {row.keterangan && <div className="text-[0.65rem] text-slate-400 truncate max-w-[160px]">{row.keterangan}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{row.rtrw || '—'}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{row.desa || '—'}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{row.kecamatan || '—'}</td>
                      <td className="px-4 py-3">
                        {row.lat && row.lng ? (
                          <a href={`https://maps.google.com/maps?q=${row.lat},${row.lng}`} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold hover:opacity-80 transition-all text-[0.68rem]">
                            <i className="fas fa-map-pin"></i> {row.lat.substring(0, 6)},{row.lng.substring(0, 6)}
                          </a>
                        ) : <span className="text-slate-400">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {row.foto ? (
                          <a href={row.foto} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[0.68rem] font-bold hover:opacity-80 transition-all">
                            <i className="fas fa-image"></i> Lihat
                          </a>
                        ) : <span className="text-slate-400">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button onClick={() => openEdit(row)} className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 flex items-center justify-center hover:bg-sblue hover:text-white transition-all">
                            <i className="fas fa-pen text-[0.72rem]"></i>
                          </button>
                          <button onClick={() => setDeleteConfirm(row)} className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all">
                            <i className="fas fa-trash text-[0.72rem]"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editRow ? '✏️ Edit Posyandu' : '❤️ Tambah Posyandu'}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.65rem] font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400">Nama Posyandu <span className="text-rose-500">*</span></label>
            <input name="nama" value={form.nama} onChange={handleFormChange} placeholder="Posyandu Mawar" className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5"><label className="text-[0.65rem] font-extrabold uppercase tracking-wide text-slate-500">RT/RW</label><input name="rtrw" value={form.rtrw} onChange={handleFormChange} placeholder="003/007" className={inputCls} /></div>
            <div className="flex flex-col gap-1.5"><label className="text-[0.65rem] font-extrabold uppercase tracking-wide text-slate-500">Desa/Kelurahan</label><input name="desa" value={form.desa} onChange={handleFormChange} placeholder="Desa Bungkuk" className={inputCls} /></div>
          </div>
          <div className="flex flex-col gap-1.5"><label className="text-[0.65rem] font-extrabold uppercase tracking-wide text-slate-500">Kecamatan</label><input name="kecamatan" value={form.kecamatan} onChange={handleFormChange} placeholder="Kecamatan Pulung" className={inputCls} /></div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.65rem] font-extrabold uppercase tracking-wide text-slate-500">Koordinat (Lat, Long)</label>
            <input name="koordinat" value={form.koordinat} onChange={handleFormChange} placeholder="-7.9025, 111.4625" className={inputCls} />
            <p className="text-[0.62rem] text-slate-400 mt-0.5"><i className="fas fa-info-circle text-amber-400"></i> Paste koordinat dari Google Maps, lat & long akan terisi otomatis.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5"><label className="text-[0.65rem] font-extrabold uppercase tracking-wide text-slate-500">Latitude</label><input name="lat" value={form.lat} onChange={handleFormChange} placeholder="-7.9025" className={inputCls} /></div>
            <div className="flex flex-col gap-1.5"><label className="text-[0.65rem] font-extrabold uppercase tracking-wide text-slate-500">Longitude</label><input name="lng" value={form.lng} onChange={handleFormChange} placeholder="111.4625" className={inputCls} /></div>
          </div>
          <div className="flex flex-col gap-1.5"><label className="text-[0.65rem] font-extrabold uppercase tracking-wide text-slate-500">URL Foto</label><input name="foto" value={form.foto} onChange={handleFormChange} placeholder="https://drive.google.com/..." className={inputCls} /></div>
          <div className="flex flex-col gap-1.5"><label className="text-[0.65rem] font-extrabold uppercase tracking-wide text-slate-500">Keterangan</label><textarea name="keterangan" value={form.keterangan} onChange={handleFormChange} rows="2" placeholder="Keterangan tambahan..." className={inputCls} /></div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setModal(false)} className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-[0.85rem] font-bold hover:bg-slate-200 dark:hover:bg-white/10 transition-all">Batal</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-[0.85rem] font-bold transition-all disabled:opacity-50">
              {saving ? <><i className="fas fa-spinner fa-spin mr-2"></i>Menyimpan...</> : <><i className="fas fa-save mr-2"></i>Simpan</>}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="⚠️ Hapus Data">
        <div className="text-center py-4">
          <i className="fas fa-trash text-rose-500 text-3xl mb-4"></i>
          <p className="text-[0.85rem] text-slate-700 dark:text-slate-300 mb-1">Yakin ingin menghapus posyandu ini?</p>
          <p className="text-[0.9rem] font-black text-slate-800 dark:text-white mb-6">"{deleteConfirm?.nama}"</p>
          <div className="flex gap-2">
            <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 text-[0.85rem] font-bold">Batal</button>
            <button onClick={() => handleDelete(deleteConfirm?._ri)} className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-[0.85rem] font-bold">Hapus</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

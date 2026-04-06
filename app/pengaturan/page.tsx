"use client";

import React, { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Panel } from "@/components/ui/DashboardUI";
import { useSession } from "@/context/SessionContext";

export default function PengaturanPage() {
  const { user, isAdmin, isLoading: sessionLoading } = useSession();
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activePanels, setActivePanels] = useState<Record<string, boolean>>({
    akun: true,
    pdfSingle: false,
    pdfKolektif: false,
    peta: false,
    tampilan: false,
    database: false
  });

  // Form States
  const [passOld, setPassOld] = useState("");
  const [passNew, setPassNew] = useState("");
  const [showPassOld, setShowPassOld] = useState(false);
  const [showPassNew, setShowPassNew] = useState(false);

  const [newUn, setNewUn] = useState("");
  const [newRl, setNewRl] = useState("user");
  const [newNm, setNewNm] = useState("");
  const [newPw, setNewPw] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);

  const [pdfSingle, setPdfSingle] = useState<any>({});
  const [pdfKolektif, setPdfKolektif] = useState<any>({});
  const [pdfPeta, setPdfPeta] = useState<any>({});
  const [pdfPreviewHtml, setPdfPreviewHtml] = useState("");

  const previewFrameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (isAdmin) {
      fetchSettings();
    }
  }, [isAdmin]);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/proxy?action=getSettings");
      const result = await res.json();
      if (result.success) {
        const data = result.data || {};
        setSettings(data);
        
        // Map to specific form states
        setPdfSingle({
          pdf_judul: data.pdf_judul || 'LAPORAN KEGIATAN MONITORING DAN PENGAMANAN AREA PEDESTRIAN KABUPATEN PONOROGO',
          pdf_nospt: data.pdf_nospt || '',
          pdf_tujuan: data.pdf_tujuan || 'Melaksanakan Monitoring Dan Pengamanan Area Wisata Pedestrian',
          pdf_anggota: data.pdf_anggota || 'Regu Pedestrian, Anggota Bidang Linmas, Satpol PP',
          pdf_pukul: data.pdf_pukul || '16.00 – 00.00 WIB',
          pdf_jabatan: data.pdf_jabatan || 'Kepala Bidang SDA dan Linmas',
          pdf_nama: data.pdf_nama || 'Erry Setiyoso Birowo, SP',
          pdf_pangkat: data.pdf_pangkat || 'Pembina',
          pdf_nip: data.pdf_nip || '19751029 200212 1 008',
          pdf_kop_aktif: data.pdf_kop_aktif === 'true',
          pdf_kop_instansi: data.pdf_kop_instansi || 'PEMERINTAH KABUPATEN PONOROGO',
          pdf_kop_dinas: data.pdf_kop_dinas || 'SATUAN POLISI PAMONG PRAJA',
          pdf_kop_jalan: data.pdf_kop_jalan || 'Jl. Alun-Alun Utara No. 04 Ponorogo, Jawa Timur',
          pdf_logo_kiri: data.pdf_logo_kiri || '',
          pdf_logo_kanan: data.pdf_logo_kanan || ''
        });

        setPdfKolektif({
          kol_judul: data.kol_judul || 'LAPORAN PATROLI WILAYAH PEDESTRIAN',
          kol_subjudul: data.kol_subjudul || 'SATGAS LINMAS PEDESTRIAN',
          kol_jabatan: data.kol_jabatan || 'Kepala Bidang SDA dan LINMAS',
          kol_nama: data.kol_nama || 'Erry Setiyoso Birowo, SP',
          kol_pangkat: data.kol_pangkat || 'Pembina',
          kol_nip: data.kol_nip || '19751029 200212 1 008'
        });

        setPdfPeta({
          peta_judul: data.peta_judul || 'PETA PEDESTRIAN KABUPATEN PONOROGO',
          peta_jabatan: data.peta_jabatan || 'Kepala Bidang SDA dan Linmas',
          peta_nama: data.peta_nama || 'Erry Setiyoso Birowo, SP'
        });
      }
    } catch (e) {
      alert("Gagal memuat pengaturan");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (pdfSingle.pdf_judul) {
      updatePdfPreview();
    }
  }, [pdfSingle]);

  const updatePdfPreview = async () => {
    try {
      const payload = {
        action: 'generateLaporanHtml',
        ...pdfSingle,
        hari: 'Senin',
        tanggal: '1 Januari 2026',
        tglSurat: '1 Januari 2026',
        lokasi: 'Area Pedestrian Kota Ponorogo',
        identitas: '',
        keterangan: 'Contoh uraian laporan untuk preview template dari menu pengaturan.',
        uraian: 'Contoh uraian laporan untuk preview template dari menu pengaturan.',
        fotos: []
      };
      
      const res = await fetch("/api/proxy", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (result.success) {
        const html = result.data?.html || result.html || '';
        setPdfPreviewHtml(html);
        if (previewFrameRef.current) {
          previewFrameRef.current.srcdoc = html;
        }
      }
    } catch (e) {}
  };

  const togglePanel = (key: string) => {
    setActivePanels((prev: Record<string, boolean>) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, side: 'kiri' | 'kanan') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 300;
        let w = img.width, h = img.height;
        if (w > maxW) { h = Math.round(h * (maxW / w)); w = maxW; }
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        const compressed = canvas.toDataURL('image/jpeg', 0.85);
        setPdfSingle((prev: any) => ({ ...prev, [`pdf_logo_${side}`]: compressed }));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const saveSettings = async (payload: any, successMsg: string) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/proxy", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'saveSettings', ...payload })
      });
      const result = await res.json();
      if (result.success) {
        alert(successMsg);
      } else {
        alert("Gagal: " + result.message);
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const submitPass = async () => {
    if (!passOld || !passNew) return alert("Field wajib diisi");
    saveSettings({ action: 'changePassword', oldPass: passOld, newPass: passNew, username: user?.username }, "Password berhasil diperbarui");
  };

  const submitNewAcc = async () => {
    if (!newUn || !newNm || !newPw) return alert("Field wajib diisi");
    saveSettings({ action: 'createAccount', username: newUn, role: newRl, namaLengkap: newNm, password: newPw }, "Akun berhasil didaftarkan");
  };

  if (sessionLoading) return null;
  if (!isAdmin) {
    return (
      <DashboardLayout title="Akses Ditolak" subtitle="Anda tidak memiliki izin">
        <div style={{ padding: "100px", textAlign: "center" }}>
          <i className="fas fa-lock" style={{ fontSize: "3rem", color: "var(--red)", marginBottom: "20px" }} />
          <h2>Akses Terbatas</h2>
          <p>Halaman ini hanya dapat diakses oleh Administrator.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Pengaturan Sistem" subtitle="Kelola akun, template cetak & konfigurasi">
      <div className="fu" style={{ maxWidth: "960px", margin: "0 auto" }}>
        
        {/* MANAGEMENT AKUN */}
        <div className="panel" style={{ marginBottom: "18px" }}>
          <div className="phd" style={{ cursor: "pointer" }} onClick={() => togglePanel('akun')}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
              <span className="ptl"><i className="fas fa-user-shield" /> Manajemen Akun</span>
              <i className={`fas fa-chevron-down tg-ico`} style={{ transform: activePanels.akun ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .3s' }} />
            </div>
          </div>
          {activePanels.akun && (
            <div className="mbd" style={{ padding: "16px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
              <div className="set-card">
                <p className="set-card-ttl" style={{ color: "var(--blue)" }}><i className="fas fa-key" /> Ganti Password</p>
                <div className="fgrp"><label className="flbl">Password Lama</label>
                  <div className="pw-field-wrap">
                    <input type={showPassOld ? "text" : "password"} className="fctl" value={passOld} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassOld(e.target.value)} />
                    <button className="pw-eye" onClick={() => setShowPassOld(!showPassOld)}><i className={`fas ${showPassOld ? 'fa-eye-slash' : 'fa-eye'}`} /></button>
                  </div>
                </div>
                <div className="fgrp"><label className="flbl">Password Baru</label>
                  <div className="pw-field-wrap">
                    <input type={showPassNew ? "text" : "password"} className="fctl" value={passNew} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassNew(e.target.value)} />
                    <button className="pw-eye" onClick={() => setShowPassNew(!showPassNew)}><i className={`fas ${showPassNew ? 'fa-eye-slash' : 'fa-eye'}`} /></button>
                  </div>
                </div>
                <button className="bp" style={{ width: "100%" }} onClick={submitPass} disabled={isSaving}><i className="fas fa-save" /> Perbarui Password</button>
              </div>

              <div className="set-card">
                <p className="set-card-ttl" style={{ color: "var(--green)" }}><i className="fas fa-user-plus" /> Buat Akun Baru</p>
                <div className="frow">
                  <div className="fcol"><label className="flbl">Username</label><input className="fctl" value={newUn} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewUn(e.target.value)} /></div>
                  <div className="fcol">
                    <label className="flbl">Role</label>
                    <select className="fctl" value={newRl} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewRl(e.target.value)}>
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                <div className="fgrp"><label className="flbl">Nama Lengkap</label><input className="fctl" value={newNm} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewNm(e.target.value)} /></div>
                <div className="fgrp"><label className="flbl">Password</label>
                  <div className="pw-field-wrap">
                    <input type={showNewPw ? "text" : "password"} className="fctl" value={newPw} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPw(e.target.value)} />
                    <button className="pw-eye" onClick={() => setShowNewPw(!showNewPw)}><i className={`fas ${showNewPw ? 'fa-eye-slash' : 'fa-eye'}`} /></button>
                  </div>
                </div>
                <button className="bp" style={{ width: "100%", background: "var(--green)" }} onClick={submitNewAcc} disabled={isSaving}><i className="fas fa-user-check" /> Daftarkan Akun</button>
              </div>
            </div>
          )}
        </div>

        {/* TEMPLATE PDF SINGLE */}
        <div className="panel" style={{ marginBottom: "18px" }}>
          <div className="phd" style={{ cursor: "pointer" }} onClick={() => togglePanel('pdfSingle')}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
              <span className="ptl"><i className="fas fa-file-pdf" style={{ color: "var(--red)" }} /> Template Cetak PDF Laporan Tunggal</span>
              <i className={`fas fa-chevron-down tg-ico`} style={{ transform: activePanels.pdfSingle ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .3s' }} />
            </div>
          </div>
          {activePanels.pdfSingle && (
            <div className="mbd" style={{ padding: "16px" }}>
              <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "10px", padding: "13px", marginBottom: "14px" }}>
                <p style={{ fontSize: ".65rem", color: "var(--blue)", fontWeight: 700, marginBottom: "6px" }}><i className="fas fa-heading" /> Header Laporan</p>
                <div className="fgrp"><label className="flbl">Judul Utama</label>
                  <input className="fctl" value={pdfSingle.pdf_judul} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPdfSingle({...pdfSingle, pdf_judul: e.target.value})} />
                </div>
                <div className="fgrp" style={{ marginTop: "12px", borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                    <label className="flbl" style={{ margin: 0 }}><i className="fas fa-layer-group" /> Gunakan Kop Surat</label>
                    <label className={`set-switch ${pdfSingle.pdf_kop_aktif ? 'on' : ''}`}>
                      <input type="checkbox" checked={pdfSingle.pdf_kop_aktif} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPdfSingle({...pdfSingle, pdf_kop_aktif: e.target.checked})} style={{ display: "none" }} />
                      <span className="set-switch-track" onClick={() => setPdfSingle({...pdfSingle, pdf_kop_aktif: !pdfSingle.pdf_kop_aktif})}><span className="set-switch-knob"></span></span>
                    </label>
                  </div>
                  <div className="frow">
                    <div className="fcol"><label className="flbl">Instansi</label><input className="fctl" value={pdfSingle.pdf_kop_instansi} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPdfSingle({...pdfSingle, pdf_kop_instansi: e.target.value})} /></div>
                    <div className="fcol"><label className="flbl">Dinas / Satuan</label><input className="fctl" value={pdfSingle.pdf_kop_dinas} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPdfSingle({...pdfSingle, pdf_kop_dinas: e.target.value})} /></div>
                  </div>
                  <div className="fgrp" style={{ marginTop: "6px" }}><label className="flbl">Alamat</label><input className="fctl" value={pdfSingle.pdf_kop_jalan} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPdfSingle({...pdfSingle, pdf_kop_jalan: e.target.value})} /></div>
                  
                  <div className="frow" style={{ marginTop: "10px", borderTop: "1px dashed var(--border)", paddingTop: "10px" }}>
                    <div className="fcol">
                      <label className="flbl"><i className="fas fa-image" /> Logo Kiri</label>
                      <div style={{ marginBottom: "6px" }}>
                        {pdfSingle.pdf_logo_kiri ? <img src={pdfSingle.pdf_logo_kiri} style={{ maxHeight: "60px", borderRadius: "4px", border: "1px solid var(--border)" }} /> : <span style={{ fontSize: "0.6rem", color: "var(--muted)" }}>Belum ada logo kiri</span>}
                      </div>
                      <input type="file" accept="image/png, image/jpeg" style={{ fontSize: ".7rem", width: "100%" }} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleLogoUpload(e, 'kiri')} />
                      <button className="bg2" style={{ fontSize: ".65rem", padding: "4px 8px", marginTop: "4px" }} onClick={() => setPdfSingle({...pdfSingle, pdf_logo_kiri: ''})}>Hapus</button>
                    </div>
                    <div className="fcol">
                      <label className="flbl"><i className="fas fa-image" /> Logo Kanan</label>
                      <div style={{ marginBottom: "6px" }}>
                        {pdfSingle.pdf_logo_kanan ? <img src={pdfSingle.pdf_logo_kanan} style={{ maxHeight: "60px", borderRadius: "4px", border: "1px solid var(--border)" }} /> : <span style={{ fontSize: "0.6rem", color: "var(--muted)" }}>Belum ada logo kanan</span>}
                      </div>
                      <input type="file" accept="image/png, image/jpeg" style={{ fontSize: ".7rem", width: "100%" }} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleLogoUpload(e, 'kanan')} />
                      <button className="bg2" style={{ fontSize: ".65rem", padding: "4px 8px", marginTop: "4px" }} onClick={() => setPdfSingle({...pdfSingle, pdf_logo_kanan: ''})}>Hapus</button>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "10px", padding: "13px", marginBottom: "14px" }}>
                 <p style={{ fontSize: ".65rem", color: "var(--blue)", fontWeight: 700, marginBottom: "8px" }}><i className="fas fa-hashtag" /> Nomor & Isi Standar</p>
                 <div className="fgrp"><label className="flbl">Nomor SPT</label><input className="fctl" value={pdfSingle.pdf_nospt} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPdfSingle({...pdfSingle, pdf_nospt: e.target.value})} /></div>
                 <div className="fgrp"><label className="flbl">Tujuan Kegiatan</label><input className="fctl" value={pdfSingle.pdf_tujuan} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPdfSingle({...pdfSingle, pdf_tujuan: e.target.value})} /></div>
                 <div className="frow">
                   <div className="fcol"><label className="flbl">Anggota</label><input className="fctl" value={pdfSingle.pdf_anggota} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPdfSingle({...pdfSingle, pdf_anggota: e.target.value})} /></div>
                   <div className="fcol"><label className="flbl">Pukul</label><input className="fctl" value={pdfSingle.pdf_pukul} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPdfSingle({...pdfSingle, pdf_pukul: e.target.value})} /></div>
                 </div>
              </div>

              <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "10px", padding: "13px", marginBottom: "14px" }}>
                <p style={{ fontSize: ".65rem", color: "var(--gold)", fontWeight: 700, marginBottom: "8px" }}><i className="fas fa-pen-nib" /> Data Pejabat Penandatangan</p>
                <div className="frow">
                  <div className="fcol"><label className="flbl">Jabatan</label><input className="fctl" value={pdfSingle.pdf_jabatan} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPdfSingle({...pdfSingle, pdf_jabatan: e.target.value})} /></div>
                  <div className="fcol"><label className="flbl">Nama Pejabat</label><input className="fctl" value={pdfSingle.pdf_nama} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPdfSingle({...pdfSingle, pdf_nama: e.target.value})} /></div>
                </div>
                <div className="frow">
                  <div className="fcol"><label className="flbl">Pangkat</label><input className="fctl" value={pdfSingle.pdf_pangkat} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPdfSingle({...pdfSingle, pdf_pangkat: e.target.value})} /></div>
                  <div className="fcol"><label className="flbl">NIP</label><input className="fctl" value={pdfSingle.pdf_nip} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPdfSingle({...pdfSingle, pdf_nip: e.target.value})} /></div>
                </div>
              </div>
              
              <button className="bp" style={{ width: "100%" }} onClick={() => saveSettings(pdfSingle, "Pengaturan PDF Tunggal disimpan")} disabled={isSaving}>
                <i className="fas fa-check-double" /> Simpan Pengaturan PDF Tunggal
              </button>

              <div style={{ marginTop: "12px", border: "1px solid var(--border)", borderRadius: "10px", overflow: "hidden", background: "#e8e8e8" }}>
                <div style={{ padding: "7px 10px", background: "var(--card)", borderBottom: "1px solid var(--border)", fontSize: ".65rem", fontWeight: 700, color: "var(--mid)" }}>Preview Template Single PDF</div>
                <iframe ref={previewFrameRef} style={{ width: "100%", height: "380px", border: "none", display: "block" }}></iframe>
              </div>
            </div>
          )}
        </div>

        {/* TEMPLATE PDF KOLEKTIF */}
        <div className="panel" style={{ marginBottom: "18px" }}>
          <div className="phd" style={{ cursor: "pointer" }} onClick={() => togglePanel('pdfKolektif')}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
              <span className="ptl"><i className="fas fa-print" style={{ color: "var(--purple)" }} /> Template Cetak PDF Kolektif</span>
              <i className={`fas fa-chevron-down tg-ico`} style={{ transform: activePanels.pdfKolektif ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .3s' }} />
            </div>
          </div>
          {activePanels.pdfKolektif && (
            <div className="mbd" style={{ padding: "16px" }}>
              <div className="frow">
                <div className="fcol"><label className="flbl">Judul Kolektif</label><input className="fctl" value={pdfKolektif.kol_judul} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPdfKolektif({...pdfKolektif, kol_judul: e.target.value})} /></div>
                <div className="fcol"><label className="flbl">Sub Judul</label><input className="fctl" value={pdfKolektif.kol_subjudul} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPdfKolektif({...pdfKolektif, kol_subjudul: e.target.value})} /></div>
              </div>
              <div className="frow">
                <div className="fcol"><label className="flbl">Jabatan TTD</label><input className="fctl" value={pdfKolektif.kol_jabatan} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPdfKolektif({...pdfKolektif, kol_jabatan: e.target.value})} /></div>
                <div className="fcol"><label className="flbl">Nama Pejabat</label><input className="fctl" value={pdfKolektif.kol_nama} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPdfKolektif({...pdfKolektif, kol_nama: e.target.value})} /></div>
              </div>
              <div className="frow">
                <div className="fcol"><label className="flbl">Pangkat</label><input className="fctl" value={pdfKolektif.kol_pangkat} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPdfKolektif({...pdfKolektif, kol_pangkat: e.target.value})} /></div>
                <div className="fcol"><label className="flbl">NIP</label><input className="fctl" value={pdfKolektif.kol_nip} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPdfKolektif({...pdfKolektif, kol_nip: e.target.value})} /></div>
              </div>
              <button className="bp" style={{ width: "100%", background: "var(--purple)" }} onClick={() => saveSettings(pdfKolektif, "Pengaturan PDF Kolektif disimpan")} disabled={isSaving}>
                <i className="fas fa-check-double" /> Simpan Pengaturan PDF Kolektif
              </button>
            </div>
          )}
        </div>

        {/* TEMPLATE PETA */}
        <div className="panel" style={{ marginBottom: "18px" }}>
          <div className="phd" style={{ cursor: "pointer" }} onClick={() => togglePanel('peta')}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
              <span className="ptl"><i className="fas fa-map-location-dot" style={{ color: "var(--teal)" }} /> Template Cetak Peta</span>
              <i className={`fas fa-chevron-down tg-ico`} style={{ transform: activePanels.peta ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .3s' }} />
            </div>
          </div>
          {activePanels.peta && (
            <div className="mbd" style={{ padding: "16px" }}>
              <div className="fgrp"><label className="flbl">Judul Peta</label><input className="fctl" value={pdfPeta.peta_judul} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPdfPeta({...pdfPeta, peta_judul: e.target.value})} /></div>
              <div className="frow">
                <div className="fcol"><label className="flbl">Jabatan TTD</label><input className="fctl" value={pdfPeta.peta_jabatan} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPdfPeta({...pdfPeta, peta_jabatan: e.target.value})} /></div>
                <div className="fcol"><label className="flbl">Nama Pejabat</label><input className="fctl" value={pdfPeta.peta_nama} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPdfPeta({...pdfPeta, peta_nama: e.target.value})} /></div>
              </div>
              <button className="bp" style={{ width: "100%", background: "var(--teal)" }} onClick={() => saveSettings(pdfPeta, "Pengaturan Peta disimpan")} disabled={isSaving}>
                <i className="fas fa-check-double" /> Simpan Pengaturan Peta
              </button>
            </div>
          )}
        </div>

        {/* DATABASE MAINTENANCE */}
        <div className="panel">
          <div className="phd" style={{ cursor: "pointer" }} onClick={() => togglePanel('database')}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
              <span className="ptl"><i className="fas fa-database" /> Pemeliharaan Struktur Data</span>
              <i className={`fas fa-chevron-down tg-ico`} style={{ transform: activePanels.database ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .3s' }} />
            </div>
          </div>
          {activePanels.database && (
            <div className="mbd" style={{ padding: "16px", textAlign: "center" }}>
              <p style={{ fontSize: ".72rem", color: "var(--muted)", marginBottom: "15px" }}>Gunakan fitur ini untuk memastikan semua sheet tersedia, header lengkap, dan freeze baris atas aktif.<br />Data yang sudah ada tidak dihapus.</p>
              <button 
                className="bg2" 
                style={{ width: "100%", border: "1.5px dashed var(--border)", padding: "14px" }} 
                onClick={async () => {
                  if (!confirm("Jalankan inisiasi struktur?")) return;
                  saveSettings({ action: 'initAllSheets' }, "Struktur database berhasil diperbarui");
                }}
                disabled={isSaving}
              >
                <i className="fas fa-wand-magic-sparkles" style={{ color: "var(--teal)" }} /> Inisiasi / Perbaikan Struktur Sheet
              </button>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}

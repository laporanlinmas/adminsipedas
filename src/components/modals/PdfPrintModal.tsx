"use client";

import React, { useState, useEffect, useRef } from "react";
import { parseTglID } from "@/utils/date";

interface LaporanRow {
  _ri?: number;
  lokasi: string;
  hari: string;
  tanggal: string;
  identitas: string;
  personil: string;
  danru: string;
  namaDanru: string;
  keterangan: string;
  fotos?: string[];
}

interface PdfPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  rows: LaporanRow[]; // If length > 1, it's kolektif
}

export const PdfPrintModal: React.FC<PdfPrintModalProps> = ({ isOpen, onClose, rows }) => {
  const [htmlContent, setHtmlContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const isKolektif = rows.length > 1;
  const singleRow = rows.length === 1 ? rows[0] : null;

  const [settings, setSettings] = useState({
    nospt: "",
    tujuan: "Melaksanakan Monitoring Dan Pengamanan Area Wisata Pedestrian",
    anggota: "Regu Pedestrian, Anggota Bidang Linmas, Satpol PP",
    pukul: "16.00 \u2013 00.00 WIB",
    hari: singleRow?.hari || "",
    tanggal: singleRow?.tanggal || "",
    lokasi: singleRow?.lokasi || "",
    identitas: singleRow?.identitas || "",
    uraian: singleRow?.keterangan || "",
    tglSurat: "",
    jabatanTtd: "Kepala Bidang SDA dan Linmas",
    namaTtd: "Erry Setiyoso Birowo, SP",
    pangkatTtd: "Pembina",
    nipTtd: "19751029 200212 1 008",
    
    // Kop Settings
    kopAktif: false,
    kopInstansi: "PEMERINTAH KABUPATEN PONOROGO",
    kopDinas: "SATUAN POLISI PAMONG PRAJA",
    kopJalan: "Jl. Alun-Alun Utara No. 04 Ponorogo, Jawa Timur",
    kopLogoKiri: "",
    kopLogoKanan: "",
  });

  const [showTtd, setShowTtd] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const BLN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
      const d = new Date();
      const tglStr = `${d.getDate()} ${BLN[d.getMonth()]} ${d.getFullYear()}`;
      
      setSettings(prev => ({
        ...prev,
        tglSurat: tglStr,
        hari: singleRow?.hari || prev.hari,
        tanggal: singleRow?.tanggal || prev.tanggal,
        lokasi: singleRow?.lokasi || prev.lokasi,
        identitas: singleRow?.identitas === "NIHIL" ? "" : (singleRow?.identitas || prev.identitas),
        uraian: singleRow?.keterangan || prev.uraian,
      }));

      // In real scenario we could fetch PDF settings from /api/proxy?action=getSettings
      generatePreview();
    }
  }, [isOpen, rows]);

  // Auto debounced generate preview
  useEffect(() => {
    if (!isOpen) return;
    const to = setTimeout(() => {
      generatePreview();
    }, 700);
    return () => clearTimeout(to);
  }, [settings]);

  const generatePreview = async () => {
    if (!isOpen) return;
    setIsLoading(true);
    setErrorMsg("");
    try {
      if (isKolektif) {
        // Bypass to direct window open for Kolektif right now since generating HTML for many might be heavy or needs direct API 
        // We will pass the IDs as query to /api/proxy?action=printKolektif
        const ids = rows.map((r) => r._ri).filter(Boolean);
        const iframeDoc = iframeRef.current?.contentDocument;
        if (iframeDoc) {
          iframeDoc.open();
          iframeDoc.write(`<div style="padding:20px; text-align:center; font-family:sans-serif;">Tampilan cetak kolektif akan diproses dan diunduh secara langsung dari server. Anda bisa melihatnya saat menekan "Cetak/Print".</div>`);
          iframeDoc.close();
        }
        setIsLoading(false);
        return;
      }

      // Single print preview
      const payload = {
        action: "generateLaporanHtml",
        judulUtama: "LAPORAN KEGIATAN MONITORING DAN PENGAMANAN AREA PEDESTRIAN KABUPATEN PONOROGO",
        judulSub: "",
        ...settings,
        nomorSpt: settings.nospt,
        keterangan: settings.uraian,
        fotos: singleRow?.fotos || [],
      };

      const res = await fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      
      if (result.success) {
        setHtmlContent(result.data?.html || result.html || "");
        const iframeDoc = iframeRef.current?.contentDocument;
        if (iframeDoc) {
          iframeDoc.open();
          iframeDoc.write(result.data?.html || result.html || "");
          iframeDoc.close();
        }
      } else {
        setErrorMsg(result.message || "Gagal membuat preview HTML");
      }
    } catch (err: any) {
      setErrorMsg("Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    if (isKolektif) {
      const ids = rows.map((r) => r._ri).filter(Boolean);
      window.open(`/api/proxy?action=printKolektif&ids=${JSON.stringify(ids)}`, "_blank");
      return;
    }

    const fr = iframeRef.current;
    if (!fr || !fr.contentWindow) return;
    
    fr.contentWindow.focus();
    fr.contentWindow.print();
  };

  if (!isOpen) return null;

  return (
    <div className="mov on" style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000 }}>
      {/* Outer wrapper to mimic modal */}
      <div style={{ background: "var(--card)", width: "95vw", height: "90vh", borderRadius: "12px", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
        {/* Header */}
        <div className="mhd" style={{ padding: "15px 20px" }}>
          <h5><i className="fas fa-print" style={{ color: "var(--blue)" }} /> {isKolektif ? "Cetak Kolektif" : "Cetak Laporan - Preview & Kustomisasi"}</h5>
          <button className="bx" onClick={onClose}>&times;</button>
        </div>
        
        {/* Body Split */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          
          {/* Left Panel: Settings */}
          <div style={{ width: "350px", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column" }}>
            <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
              {isKolektif ? (
                <div style={{ padding: "15px", background: "var(--bg)", borderRadius: "8px", fontSize: ".85rem" }}>
                  Anda akan mencetak <b>{rows.length}</b> laporan sekaligus. Proses kustomisasi khusus untuk kolektif diproses secara otomatis di server agar konsisten.
                </div>
              ) : (
                <>
                  <div className="fcol" style={{ marginBottom: "15px" }}>
                    <label className="flbl" style={{ fontSize: ".7rem", fontWeight: 700 }}>Nomor SPT</label>
                    <input className="fctl" value={settings.nospt} onChange={e => setSettings({...settings, nospt: e.target.value})} placeholder="Contoh: 300.1.2/123/405.15/2026" />
                  </div>
                  
                  <div className="frow" style={{ marginBottom: "15px" }}>
                    <div className="fcol" style={{ flex: 1 }}>
                      <label className="flbl" style={{ fontSize: ".7rem", fontWeight: 700 }}>Hari</label>
                      <input className="fctl" value={settings.hari} onChange={e => setSettings({...settings, hari: e.target.value})} />
                    </div>
                    <div className="fcol" style={{ flex: 1 }}>
                      <label className="flbl" style={{ fontSize: ".7rem", fontWeight: 700 }}>Tanggal</label>
                      <input className="fctl" value={settings.tanggal} onChange={e => setSettings({...settings, tanggal: e.target.value})} />
                    </div>
                  </div>

                  <div className="fcol" style={{ marginBottom: "15px" }}>
                    <label className="flbl" style={{ fontSize: ".7rem", fontWeight: 700 }}>Lokasi / Area</label>
                    <input className="fctl" value={settings.lokasi} onChange={e => setSettings({...settings, lokasi: e.target.value})} />
                  </div>

                  <div className="fcol" style={{ marginBottom: "15px" }}>
                    <label className="flbl" style={{ fontSize: ".7rem", fontWeight: 700 }}>Tujuan</label>
                    <textarea className="fctl" rows={2} value={settings.tujuan} onChange={e => setSettings({...settings, tujuan: e.target.value})}></textarea>
                  </div>

                  <div className="frow" style={{ marginBottom: "15px" }}>
                     <div className="fcol" style={{ flex: 1 }}>
                        <label className="flbl" style={{ fontSize: ".7rem", fontWeight: 700 }}>Personil / Regu</label>
                        <input className="fctl" value={settings.anggota} onChange={e => setSettings({...settings, anggota: e.target.value})} />
                     </div>
                     <div className="fcol" style={{ flex: 1 }}>
                        <label className="flbl" style={{ fontSize: ".7rem", fontWeight: 700 }}>Waktu</label>
                        <input className="fctl" value={settings.pukul} onChange={e => setSettings({...settings, pukul: e.target.value})} />
                     </div>
                  </div>

                  <div className="fcol" style={{ marginBottom: "15px" }}>
                    <label className="flbl" style={{ fontSize: ".7rem", fontWeight: 700 }}>Telah Dilaksanakan / Uraian</label>
                    <textarea className="fctl" rows={3} value={settings.uraian} onChange={e => setSettings({...settings, uraian: e.target.value})}></textarea>
                  </div>

                  <div className="fcol" style={{ marginBottom: "15px" }}>
                    <label className="flbl" style={{ fontSize: ".7rem", fontWeight: 700 }}>Penemuan Identitas</label>
                    <textarea className="fctl" rows={2} value={settings.identitas} onChange={e => setSettings({...settings, identitas: e.target.value})}></textarea>
                  </div>
                  
                  {/* Tanda Tangan Section */}
                  <div style={{ background: "var(--bg)", borderRadius: "8px", border: "1px solid var(--border)", overflow: "hidden", marginBottom: "15px" }}>
                    <div 
                      style={{ padding: "10px", fontSize: ".75rem", fontWeight: 700, display: "flex", justifyContent: "space-between", cursor: "pointer" }}
                      onClick={() => setShowTtd(!showTtd)}
                    >
                      <span style={{ color: "var(--blue)" }}>Setelan Tanda Tangan</span>
                      <i className={`fas fa-chevron-${showTtd ? 'up' : 'down'}`} />
                    </div>
                    {showTtd && (
                      <div style={{ padding: "15px", borderTop: "1px solid var(--border)" }}>
                        <div className="fcol" style={{ paddingBottom: "10px" }}><label className="flbl">Tanggal Surat</label><input className="fctl" value={settings.tglSurat} onChange={e => setSettings({...settings, tglSurat: e.target.value})} /></div>
                        <div className="fcol" style={{ paddingBottom: "10px" }}><label className="flbl">Jabatan</label><input className="fctl" value={settings.jabatanTtd} onChange={e => setSettings({...settings, jabatanTtd: e.target.value})} /></div>
                        <div className="fcol" style={{ paddingBottom: "10px" }}><label className="flbl">Nama Pejabat</label><input className="fctl" value={settings.namaTtd} onChange={e => setSettings({...settings, namaTtd: e.target.value})} /></div>
                        <div className="frow">
                          <div className="fcol"><label className="flbl">Pangkat</label><input className="fctl" value={settings.pangkatTtd} onChange={e => setSettings({...settings, pangkatTtd: e.target.value})} /></div>
                          <div className="fcol"><label className="flbl">NIP</label><input className="fctl" value={settings.nipTtd} onChange={e => setSettings({...settings, nipTtd: e.target.value})} /></div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            
            <div style={{ padding: "15px", borderTop: "1px solid var(--border)", background: "var(--bg)", display: "flex", alignItems: "center", gap: "10px" }}>
              <button className="bg2" style={{ flex: 1, padding: "12px", borderRadius: "8px", fontWeight: 700 }} onClick={onClose}>Batal</button>
              <button className="bp" style={{ flex: 2, padding: "12px", borderRadius: "8px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }} onClick={handlePrint}>
                <i className="fas fa-print" /> Cetak / Print
              </button>
            </div>
          </div>

          {/* Right Panel: Iframe Preview */}
          <div style={{ flex: 1, background: "#525659", display: "flex", flexDirection: "column", position: "relative" }}>
             {/* Overlay Loading */}
             {isLoading && (
               <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexDirection: "column", gap: "10px" }}>
                 <i className="fas fa-spinner fa-spin fa-2x" />
                 <span style={{ fontSize: ".85rem", fontWeight: 700 }}>Menyiapkan Preview...</span>
               </div>
             )}
             {errorMsg && (
               <div style={{ position: "absolute", top: "20px", left: "20px", right: "20px", background: "var(--red)", color: "#fff", padding: "15px", borderRadius: "10px", zIndex: 11, fontSize: ".85rem" }}>
                 <i className="fas fa-exclamation-triangle" /> {errorMsg}
               </div>
             )}
             
             {/* Iframe */}
             <iframe 
               ref={iframeRef} 
               style={{ width: "100%", height: "100%", border: "none", background: "#f0f0f0" }}
               title="PDF Preview"
             />
          </div>

        </div>
      </div>
    </div>
  );
};

"use client";

import React, { useState, useEffect, useRef } from "react";

interface FotoItem {
  url?: string;
  src?: string;
  data?: string;
  mime?: string;
  isNew: boolean;
}

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
  fotosThumb?: string[];
}

interface EditLaporanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  row: LaporanRow | null;
}

export const EditLaporanModal: React.FC<EditLaporanModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  row,
}) => {
  const [formData, setFormData] = useState<LaporanRow>({
    lokasi: "",
    hari: "",
    tanggal: "",
    identitas: "",
    personil: "",
    danru: "",
    namaDanru: "",
    keterangan: "",
  });
  
  const [fotos, setFotos] = useState<FotoItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && row) {
      setFormData(row);
      const initialFotos = (row.fotos || []).map((url) => ({
        url,
        src: url, // using original url for preview
        isNew: false,
      }));
      setFotos(initialFotos);
      setErrorMsg("");
    }
  }, [isOpen, row]);

  if (!isOpen || !row) return null;

  const handleAddPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const files = Array.from(e.target.files);
    const rem = 10 - fotos.length;
    const toProcess = files.slice(0, rem);

    toProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setFotos((prev) => [
            ...prev,
            { src: ev.target!.result as string, data: ev.target!.result as string, mime: file.type, isNew: true },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
    
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handeRemovePhoto = (index: number) => {
    setFotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.lokasi.trim()) {
      setErrorMsg("Lokasi wajib diisi");
      return;
    }

    setIsSaving(true);
    setErrorMsg("");

    try {
      const fPay = fotos.map((f) => {
        if (f.isNew) return { data: f.data, mime: f.mime };
        return f.url || f.src || "";
      });

      const payload = {
        action: "updateLaporan",
        _ri: row._ri,
        lokasi: formData.lokasi,
        hari: formData.hari,
        tanggal: formData.tanggal,
        identitas: formData.identitas,
        personil: formData.personil,
        danru: formData.danru,
        namaDanru: formData.namaDanru,
        keterangan: formData.keterangan,
        fotos: fPay,
      };

      const res = await fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (result.success) {
        onSuccess();
      } else {
        setErrorMsg(result.message || "Gagal menyimpan laporan");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan jaringan");
    } finally {
      setIsSaving(false);
    }
  };

  const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

  return (
    <div className="mov on">
      <div className="mbox" style={{ maxWidth: "600px", width: "95%" }}>
        <div className="mhd">
          <h5><i className="fas fa-file-pen" style={{ color: "var(--blue)" }} /> Edit Laporan</h5>
          <button className="bx" onClick={onClose} disabled={isSaving}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mbd" style={{ maxHeight: "70vh", overflowY: "auto", padding: "15px" }}>
            {errorMsg && (
              <div style={{ padding: "10px", background: "var(--redlo)", color: "var(--red)", borderRadius: "6px", marginBottom: "15px", fontSize: ".8rem", fontWeight: 700 }}>
                {errorMsg}
              </div>
            )}
            
            <div className="frow">
              <div className="fcol">
                <label className="flbl">Lokasi <span className="req">*</span></label>
                <input
                  className="fctl"
                  value={formData.lokasi}
                  onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                  disabled={isSaving}
                  autoFocus
                />
              </div>
              <div className="fcol">
                <label className="flbl">Hari</label>
                <select
                  className="fctl"
                  value={formData.hari}
                  onChange={(e) => setFormData({ ...formData, hari: e.target.value })}
                  disabled={isSaving}
                >
                  <option value="">-- Pilih Hari --</option>
                  {days.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="frow">
              <div className="fcol">
                <label className="flbl">Tanggal</label>
                <input
                  className="fctl"
                  value={formData.tanggal}
                  onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                  disabled={isSaving}
                />
              </div>
              <div className="fcol">
                <label className="flbl">Pelanggaran / Identitas</label>
                <textarea
                  className="fctl"
                  rows={2}
                  placeholder="NIHIL atau identitas pelanggar"
                  value={formData.identitas}
                  onChange={(e) => setFormData({ ...formData, identitas: e.target.value })}
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="fgrp">
              <label className="flbl">Personil</label>
              <input
                className="fctl"
                value={formData.personil}
                onChange={(e) => setFormData({ ...formData, personil: e.target.value })}
                disabled={isSaving}
              />
            </div>

            <div className="frow">
              <div className="fcol">
                <label className="flbl">Danru</label>
                <input
                  className="fctl"
                  value={formData.danru}
                  onChange={(e) => setFormData({ ...formData, danru: e.target.value })}
                  disabled={isSaving}
                />
              </div>
              <div className="fcol">
                <label className="flbl">Nama Danru</label>
                <input
                  className="fctl"
                  value={formData.namaDanru}
                  onChange={(e) => setFormData({ ...formData, namaDanru: e.target.value })}
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="fgrp">
              <label className="flbl">Keterangan / Uraian</label>
              <textarea
                className="fctl"
                rows={3}
                placeholder="Uraian pelaksanaan kegiatan..."
                value={formData.keterangan}
                onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                disabled={isSaving}
              />
              <div style={{ fontSize: ".65rem", color: "var(--muted)", marginTop: "4px" }}>
                <i className="fas fa-info-circle" /> Otomatis menjadi Uraian saat mencetak Kolektif/Single.
              </div>
            </div>

            {/* FOTO UPLOAD */}
            <div className="fgrp">
              <label className="flbl">Foto Lapangan ({fotos.length}/10)</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px" }}>
                {fotos.map((f, i) => (
                  <div key={i} style={{ width: "80px", height: "80px", position: "relative", borderRadius: "8px", overflow: "hidden", background: "#f0f0f0" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={f.src} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => handeRemovePhoto(i)}
                      style={{ position: "absolute", top: "2px", right: "2px", background: "rgba(200,0,0,0.8)", color: "#fff", border: "none", width: "20px", height: "20px", borderRadius: "50%", cursor: "pointer", fontSize: "10px" }}
                    >
                      <i className="fas fa-times" />
                    </button>
                  </div>
                ))}
                {fotos.length < 10 && (
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => fileInputRef.current?.click()}
                    style={{ width: "80px", height: "80px", background: "var(--bg)", border: "2px dashed var(--border)", borderRadius: "8px", color: "var(--muted)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "5px", fontSize: ".7rem", fontWeight: 700 }}
                  >
                    <i className="fas fa-plus" /> Tambah
                  </button>
                )}
              </div>
              <input type="file" accept="image/*" multiple style={{ display: "none" }} ref={fileInputRef} onChange={handleAddPhotos} />
            </div>

          </div>
          <div className="mft">
            <button type="button" className="bg2" onClick={onClose} disabled={isSaving}>Batal</button>
            <button type="submit" className="bp" disabled={isSaving}>
              {isSaving ? <><i className="fas fa-spinner fa-spin" /> Menyimpan...</> : <><i className="fas fa-save" /> Simpan Perubahan</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

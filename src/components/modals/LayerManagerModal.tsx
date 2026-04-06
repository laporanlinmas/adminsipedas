"use client";

import React, { useState, useEffect } from "react";

interface PetaLayer {
  _ri?: number;
  nama: string;
  tipe: string;
  koordinat: string; // JSON
  warna: string;
  tebal: number;
}

interface LayerManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  layers: PetaLayer[];
  onRefresh: () => void;
}

export const LayerManagerModal: React.FC<LayerManagerModalProps> = ({
  isOpen,
  onClose,
  layers,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<"list" | "form">("list");
  const [formData, setFormData] = useState<PetaLayer>({
    nama: "",
    tipe: "Polygon",
    koordinat: "",
    warna: "#1e6fd9",
    tebal: 3,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleEdit = (layer: PetaLayer) => {
    setFormData(layer);
    setActiveTab("form");
    setErrorMsg("");
  };

  const handleAdd = () => {
    setFormData({
      nama: "",
      tipe: "Polygon",
      koordinat: "",
      warna: "#1e6fd9",
      tebal: 3,
    });
    setActiveTab("form");
    setErrorMsg("");
  };

  const handleDelete = async (id?: number) => {
    if (!id || !confirm("Yakin ingin menghapus layer ini?")) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteLayerPeta", _ri: id }),
      });
      const result = await res.json();
      if (result.success) {
        onRefresh();
      } else {
        alert("Gagal menghapus: " + result.message);
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim() || !formData.koordinat.trim()) {
      setErrorMsg("Nama dan Koordinat wajib diisi.");
      return;
    }
    try {
      JSON.parse(formData.koordinat);
    } catch (e) {
      setErrorMsg("Koordinat harus berupa format JSON array yang valid.");
      return;
    }

    setIsSaving(true);
    setErrorMsg("");

    try {
      const payload = {
        action: "saveLayerPeta",
        ...formData,
      };

      const res = await fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      
      if (result.success) {
        onRefresh();
        setActiveTab("list");
      } else {
        setErrorMsg(result.message || "Gagal menyimpan layer");
      }
    } catch (e: any) {
      setErrorMsg("Error: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mov on">
      <div className="mbox" style={{ maxWidth: "600px", width: "95%" }}>
        <div className="mhd">
          <h5><i className="fas fa-layer-group" style={{ color: "var(--blue)" }} /> Manajemen Layer Peta</h5>
          <button className="bx" onClick={onClose} disabled={isSaving}>&times;</button>
        </div>
        
        <div style={{ display: "flex", borderBottom: "1px solid var(--border)", background: "var(--bg)" }}>
           <button 
             style={{ flex: 1, padding: "12px", background: "none", border: "none", fontWeight: 700, color: activeTab === "list" ? "var(--blue)" : "var(--mid)", borderBottom: activeTab === "list" ? "3px solid var(--blue)" : "3px solid transparent", cursor: "pointer" }}
             onClick={() => setActiveTab("list")}
           >
             Daftar Layer
           </button>
           <button 
             style={{ flex: 1, padding: "12px", background: "none", border: "none", fontWeight: 700, color: activeTab === "form" ? "var(--blue)" : "var(--mid)", borderBottom: activeTab === "form" ? "3px solid var(--blue)" : "3px solid transparent", cursor: "pointer" }}
             onClick={() => activeTab === "list" ? handleAdd() : null}
           >
             {formData._ri ? "Edit Layer" : "Tambah Layer Baru"}
           </button>
        </div>

        <div className="mbd" style={{ padding: "0", maxHeight: "65vh", overflowY: "auto" }}>
          {activeTab === "list" && (
            <div style={{ padding: "15px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                 <div style={{ fontSize: ".75rem", fontWeight: 700, color: "var(--muted)" }}>Total: {layers.length} Layer</div>
                 <button className="bp" onClick={handleAdd} style={{ padding: "8px 15px", borderRadius: "8px", fontSize: ".7rem" }}>
                   <i className="fas fa-plus" /> Tambah Baru
                 </button>
              </div>
              
              {layers.length === 0 ? (
                <div className="empty">
                  <i className="fas fa-layer-group" />
                  <p>Tidak ada layer peta</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {layers.map((l, i) => (
                    <div key={i} style={{ padding: "12px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "8px", display: "flex", alignItems: "center", gap: "15px" }}>
                       <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: l.warna, opacity: 0.8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
                         <i className={`fas fa-${l.tipe === "Polygon" ? "draw-polygon" : l.tipe === "Polyline" ? "route" : "location-dot"}`} />
                       </div>
                       <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: ".8rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l.nama}</div>
                          <div style={{ fontSize: ".65rem", color: "var(--muted)", marginTop: "2px" }}>{l.tipe} &middot; Tebal: {l.tebal}px</div>
                       </div>
                       <div style={{ display: "flex", gap: "5px" }}>
                          <button className="be" onClick={() => handleEdit(l)}><i className="fas fa-pen" /></button>
                          <button className="bd" onClick={() => handleDelete(l._ri)}><i className="fas fa-trash" /></button>
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "form" && (
            <form onSubmit={handleSubmit} style={{ padding: "15px" }}>
              {errorMsg && (
                <div style={{ padding: "10px", background: "var(--redlo)", color: "var(--red)", borderRadius: "6px", marginBottom: "15px", fontSize: ".8rem", fontWeight: 700 }}>
                  <i className="fas fa-exclamation-circle" /> {errorMsg}
                </div>
              )}
              
              <div className="fcol" style={{ marginBottom: "12px" }}>
                <label className="flbl">Nama Layer <span className="req">*</span></label>
                <input className="fctl" value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} disabled={isSaving} placeholder="Contoh: Rute Patroli Alun-alun" autoFocus />
              </div>

              <div className="frow" style={{ marginBottom: "12px" }}>
                <div className="fcol" style={{ flex: 2 }}>
                  <label className="flbl">Tipe Geometri</label>
                  <select className="fctl" value={formData.tipe} onChange={e => setFormData({...formData, tipe: e.target.value})} disabled={isSaving}>
                    <option value="Polygon">Polygon (Area Tertutup)</option>
                    <option value="Polyline">Polyline (Garis Rute)</option>
                    <option value="Marker">Marker (Titik Lokasi)</option>
                  </select>
                </div>
                <div className="fcol" style={{ flex: 1 }}>
                  <label className="flbl">Warna Fill / Stroke</label>
                  <div style={{ display: "flex", gap: "5px" }}>
                    <input type="color" className="fctl" style={{ padding: 0, width: "40px", cursor: "pointer" }} value={formData.warna} onChange={e => setFormData({...formData, warna: e.target.value})} disabled={isSaving} />
                    <input className="fctl" value={formData.warna} onChange={e => setFormData({...formData, warna: e.target.value})} disabled={isSaving} style={{ flex: 1 }} />
                  </div>
                </div>
                <div className="fcol" style={{ flex: 1 }}>
                  <label className="flbl">Tebal Garis</label>
                  <input type="number" min="1" max="10" className="fctl" value={formData.tebal} onChange={e => setFormData({...formData, tebal: parseInt(e.target.value) || 3})} disabled={isSaving} />
                </div>
              </div>

              <div className="fcol" style={{ marginBottom: "12px" }}>
                <label className="flbl">Data Koordinat (JSON Array) <span className="req">*</span></label>
                <textarea 
                  className="fctl" 
                  rows={8} 
                  value={formData.koordinat} 
                  onChange={e => setFormData({...formData, koordinat: e.target.value})} 
                  disabled={isSaving}
                  style={{ fontFamily: "var(--mono)", fontSize: ".7rem", lineHeight: 1.5 }}
                />
                <div style={{ fontSize: ".65rem", color: "var(--muted)", marginTop: "5px" }}>
                  Gunakan format [ [lat, lng], [lat, lng] ] untuk polyline/polygon, atau [lat, lng] untuk marker.
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                 <button type="button" className="bg2" style={{ flex: 1, padding: "10px", borderRadius: "8px", fontWeight: 700 }} onClick={() => setActiveTab("list")} disabled={isSaving}>Kembali</button>
                 <button type="submit" className="bp" style={{ flex: 2, padding: "10px", borderRadius: "8px", fontWeight: 700 }} disabled={isSaving}>
                   {isSaving ? <><i className="fas fa-spinner fa-spin" /> Menyimpan...</> : <><i className="fas fa-save" /> Simpan Layer</>}
                 </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

"use client";

import React, { useState, useEffect, useRef } from "react";
import { processImage, getDanru } from "@/utils/image";
import { readExif } from "@/utils/exif";
import { reverseGeocodeForceStreet } from "@/utils/geocoding";
import { parseWAReport } from "@/utils/parser";
import { getTodayID } from "@/utils/date";
import { useUI } from "@/context/UIContext";
import { openIDB, idbMetaSet, idbMetaGet, idbMetaDel, idbSavePhoto, idbDeletePhoto, idbLoadAll, idbClearAll, IDB_TEKS_KEY } from "@/utils/idb";
import { parallelLimit } from "@/utils/concurrency";

interface MobilePhoto {
  data: string;
  mime: string;
  sizeKB: number;
  source: "camera" | "gallery";
  processing?: boolean;
  idbKey?: string;
  exif?: any;
  exifAddr?: any;
  namaFile?: string;
}

export default function MobilePage() {
  const { toast, showGallery } = useUI();
  const [text, setText] = useState("");
  const [photos, setPhotos] = useState<MobilePhoto[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [settings, setSettings] = useState({
    wmCam: true, wmGal: false, minimap: true,
    jalan: "", nodukuh: "", desa: "", kec: "", kab: "", prov: "",
    manualLoc: "", sptNo: ""
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDraftsOpen, setIsDraftsOpen] = useState(false);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [submitProgress, setSubmitProgress] = useState({ step: 0, pct: 0, label: "" });
  const [lastSubmission, setLastSubmission] = useState<{ id: string; url: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const camInputRef = useRef<HTMLInputElement>(null);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const init = async () => {
      await openIDB();
      const savedText = await idbMetaGet(IDB_TEKS_KEY);
      if (savedText) setText(savedText);

      const savedPhotos = await idbLoadAll();
      if (savedPhotos.length > 0) setPhotos(savedPhotos);

      const localSettings = localStorage.getItem("_mob_settings");
      let baseSettings = localSettings ? JSON.parse(localSettings) : settings;

      // Sync with server settings
      try {
        const res = await fetch("/api/proxy?action=getSettings");
        const r = await res.json();
        if (r.success) {
          baseSettings = { ...baseSettings, ...r.data };
        }
      } catch (e) { }

      setSettings(baseSettings);
    };
    init();
  }, []);

  const handleTextChange = (val: string) => {
    setText(val);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      idbMetaSet(IDB_TEKS_KEY, val);
    }, 600);
  };

  const handleSettingChange = (key: string, val: any) => {
    const next = { ...settings, [key]: val };
    setSettings(next);
    localStorage.setItem("_mob_settings", JSON.stringify(next));
  };

  const triggerUpload = (type: "gal" | "cam") => {
    if (type === "gal") fileInputRef.current?.click();
    else camInputRef.current?.click();
  };

  const fetchDrafts = async () => {
    const res = await fetch("/api/proxy?action=listDrafts");
    const r = await res.json();
    if (r.success) setDrafts(r.data);
  };

  const loadDraft = (d: any) => {
    setText(d.data?.text || "");
    if (d.data?.photos) {
      setPhotos(d.data.photos.map((p: any) => ({ ...p, source: p.source || "camera" })));
    }
    setIsDraftsOpen(false);
    toast("Draft dimuat", "ok");
  };

  const deleteDraft = async (id: string) => {
    if (!confirm("Hapus draft ini?")) return;
    const res = await fetch(`/api/proxy?action=deleteDraft&id=${id}`, { method: "POST" });
    const r = await res.json();
    if (r.success) {
      toast("Draft dihapus", "ok");
      fetchDrafts();
    }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>, source: "camera" | "gallery") => {
    const files = e.target.files;
    if (!files || !files.length) return;

    setIsProcessing(true);
    const danruNm = getDanru(text);

    for (let i = 0; i < files.length; i++) {
      if (photos.length >= 10) break;
      const file = files[i];

      try {
        const exif = await readExif(file);
        let exifAddr = null;
        if (exif && exif.gps) {
          exifAddr = await reverseGeocodeForceStreet(exif.gps.lat, exif.gps.lng);
        }

        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve) => {
          reader.onload = (ev) => resolve(ev.target?.result as string);
          reader.readAsDataURL(file);
        });

        const photoObj = { source, exif, exifAddr, ts: Date.now() };
        const wmState = {
          wmCam: settings.wmCam,
          wmGal: settings.wmGal,
          minimap: settings.minimap,
          loc: {
            jalan: settings.jalan || settings.manualLoc,
            nodukuh: settings.nodukuh, desa: settings.desa,
            kec: settings.kec, kab: settings.kab, prov: settings.prov
          },
          lat: exif?.gps?.lat?.toString() || "",
          lng: exif?.gps?.lng?.toString() || ""
        };

        const processed = await processImage(dataUrl, source, photoObj, wmState, danruNm);
        const toSave = { ...processed, source, exif, exifAddr, namaFile: file.name };

        const idbKey = await idbSavePhoto(toSave);
        setPhotos((prev) => [...prev, { ...toSave, idbKey }]);
        toast("Foto diproses", "ok");
      } catch (err) {
        toast("Gagal proses foto", "er");
      }
    }
    setIsProcessing(false);
    e.target.value = "";
  };

  const removePhoto = async (idx: number) => {
    const p = photos[idx];
    if (p && p.idbKey) await idbDeletePhoto(p.idbKey);
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!text.trim()) return toast("Laporan masih kosong", "er");
    if (photos.length === 0) return toast("Lampirkan minimal 1 foto", "er");
    if (isProcessing) return toast("Tunggu foto selesai diproses", "er");

    setIsProcessing(true);
    setSubmitProgress({ step: 1, pct: 10, label: "Menghubungkan ke server..." });

    try {
      await fetch("/api/proxy?action=ping").catch(() => { });
      const total = photos.length;
      let uploadedCount = 0;
      const detailedPhotos: any[] = [];

      const uploadResults = await parallelLimit(
        photos,
        async (idx: number, p: any) => {
          setSubmitProgress({
            step: 2,
            pct: 10 + Math.round((uploadedCount / total) * 70),
            label: `Mengupload foto ${idx + 1} dari ${total}...`
          });

          const res = await fetch("/api/proxy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "uploadFoto",
              data: p.data,
              fileName: `SIPEDAS_${Date.now()}_${idx}.jpg`
            })
          });

          const result = await res.json();
          if (!result.success) throw new Error(result.message);

          uploadedCount++;
          detailedPhotos[idx] = {
            namaFile: result.data.namaFile,
            linkDrive: result.data.linkFile,
            sumber: p.source.toUpperCase(),
            meta: {
              hasGps: !!(p.exif?.gps),
              lat: p.exif?.gps?.lat,
              lng: p.exif?.gps?.lng,
              datetime: p.exif?.datetime || "",
              address: p.exifAddr?.full || ""
            }
          };
          return result.data.linkFile;
        },
        3
      );

      setSubmitProgress({ step: 3, pct: 90, label: "Menyimpan data ke Spreadsheet..." });
      const parsed = parseWAReport(text);
      const postData = {
        action: "addLaporan",
        lokasi: parsed.lokasi || settings.manualLoc || "Lokasi Lapangan",
        hari: parsed.hari || new Date().toLocaleDateString("id-ID", { weekday: "long" }),
        tanggal: parsed.tanggal || getTodayID(),
        identitas: parsed.identitas || "NIHIL",
        personil: parsed.personil || "Petugas Lapangan",
        danru: parsed.danru,
        namaDanru: parsed.namaDanru || getDanru(text),
        keterangan: parsed.uraian || text,
        fotos: uploadResults,
        detailedPhotos
      };

      const finalRes = await fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData)
      });
      const finalResult = await finalRes.json();
      if (!finalResult.success) throw new Error(finalResult.message);

      setSubmitProgress({ step: 4, pct: 100, label: "Laporan Terkirim!" });
      toast("Laporan Terkirim!", "ok");
      setLastSubmission({ id: Date.now().toString(), url: uploadResults[0] });

      setText("");
      setPhotos([]);
      await idbMetaDel(IDB_TEKS_KEY);
      await idbClearAll();

      setTimeout(() => setSubmitProgress({ step: 0, pct: 0, label: "" }), 3000);
    } catch (err: any) {
      toast("Gagal: " + err.message, "er");
      setSubmitProgress({ step: 0, pct: 0, label: "" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div id="mob-app-native" className="on" style={{ background: "var(--navy)", minHeight: "100vh", color: "#fff", position: "relative", overflowX: "hidden" }}>
      <img id="img-linmas" src="/assets/icon-192.png" style={{ display: "none" }} alt="logo" />
      <div className="bg-glow"></div>

      <div className="wrap" style={{ maxWidth: "500px", margin: "0 auto", paddingBottom: "40px" }}>
        <header className="header" style={{ padding: "20px 16px", textAlign: "center" }}>
          <div className="hdr-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
            <span className="app-ver" style={{ fontSize: ".6rem", opacity: .6, fontWeight: 700, letterSpacing: "1px" }}>SIPEDAS NATIVE • VER 4.2.1</span>
            <button className="gear-btn" onClick={() => setIsSettingsOpen(true)} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", width: "32px", height: "32px", borderRadius: "50%" }}>
              <i className="fas fa-cog" />
            </button>
          </div>
          <div className="sipedas-wrap">
            <h1 className="sipedas-title" style={{ fontSize: "2.2rem", fontWeight: 900, letterSpacing: "-1px", margin: 0, color: "var(--blue)" }}>SI-PEDAS</h1>
            <div className="sipedas-badge" style={{ fontSize: ".7rem", fontWeight: 700, opacity: .8 }}>Satpol PP Kabupaten Ponorogo</div>
          </div>
        </header>

        <main className="form-area" style={{ padding: "0 16px" }}>
          {lastSubmission && (
            <div style={{ background: "rgba(34, 197, 94, 0.1)", border: "1px solid rgba(34, 197, 94, 0.3)", borderRadius: "12px", padding: "12px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: ".75rem" }}><i className="fas fa-check-circle" style={{ color: "var(--green)" }} /> Laporan terakhir terkirim.</div>
              <button onClick={() => window.open("/rekap", "_blank")} style={{ background: "var(--green)", border: "none", color: "#fff", padding: "4px 10px", borderRadius: "6px", fontSize: ".7rem", fontWeight: 700 }}>LIHAT HASIL</button>
            </div>
          )}

          <div className="card" style={{ background: "rgba(255,255,255,0.05)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden" }}>
            <div className="card-head" style={{ padding: "12px 16px", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "10px" }}>
              <div className="ci ci-blue" style={{ background: "var(--blue)" }}><i className="fab fa-whatsapp" /></div>
              <h3 style={{ fontSize: ".85rem", margin: 0, flex: 1 }}>Teks Laporan WhatsApp</h3>
            </div>
            <div className="card-body" style={{ padding: "16px" }}>
              <textarea
                className="lap-input"
                placeholder="Tempel format laporan di sini..."
                style={{ width: "100%", height: "140px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#fff", padding: "12px", fontSize: ".85rem", resize: "none" }}
                value={text}
                onChange={(e) => handleTextChange(e.target.value)}
              />
            </div>
          </div>

          <div className="card" style={{ background: "rgba(255,255,255,0.05)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)", marginTop: "16px", overflow: "hidden" }}>
            <div className="card-head" style={{ padding: "12px 16px", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "10px" }}>
              <div className="ci ci-gold" style={{ background: "var(--amber)" }}><i className="fas fa-camera" /></div>
              <h3 style={{ fontSize: ".85rem", margin: 0, flex: 1 }}>Dokumentasi Lapangan</h3>
              <span className="badge-cnt">{photos.length}</span>
            </div>
            <div className="card-body" style={{ padding: "16px" }}>
              <div className="upload-zone" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                <button className="up-btn gal" onClick={() => triggerUpload("gal")}>
                  <i className="fas fa-images" /> <span>GALERI</span>
                </button>
                <button className="up-btn cam" onClick={() => triggerUpload("cam")}>
                  <i className="fas fa-camera" /> <span>KAMERA</span>
                </button>
              </div>

              <div className="foto-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                {photos.map((p, i) => (
                  <div key={i} className="foto-item" style={{ position: "relative", aspectRatio: "1", borderRadius: "10px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <img
                      src={p.data}
                      alt="Foto"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onClick={() => showGallery([(p.data)])}
                    />
                    <div style={{ position: "absolute", top: "4px", right: "4px", display: "flex", gap: "4px" }}>
                      {p.exif?.gps && (
                        <button onClick={() => window.open(`https://www.google.com/maps?q=${p.exif.gps.lat},${p.exif.gps.lng}`, "_blank")} className="mini-btn-gps"><i className="fas fa-map-marker-alt" /></button>
                      )}
                      <button onClick={() => removePhoto(i)} className="mini-btn-del"><i className="fas fa-times" /></button>
                    </div>
                    {(p.exif?.gps || p.exifAddr) && <div className="gps-badge">GPS</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "20px" }}>
            <button className="sub-btn" style={{ background: "rgba(255,255,255,0.05)", border: "1px dashed #ffffff44" }} onClick={() => { fetchDrafts(); setIsDraftsOpen(true); }}>
              <i className="fas fa-folder-open" /> DRAFTS
            </button>
            <button
              className="sub-btn"
              style={{ background: "var(--blue)", border: "none", opacity: (isProcessing || photos.length === 0 || !text.trim()) ? 0.6 : 1 }}
              onClick={handleSubmit}
              disabled={isProcessing || photos.length === 0 || !text.trim()}
            >
              {isProcessing ? <><i className="fas fa-circle-notch fa-spin" /> KIRIM...</> : <><i className="fas fa-paper-plane" /> KIRIM</>}
            </button>
          </div>
        </main>
      </div>

      <input type="file" ref={fileInputRef} hidden accept="image/*" multiple onChange={(e) => handleFile(e, "gallery")} />
      <input type="file" ref={camInputRef} hidden accept="image/*" capture="environment" onChange={(e) => handleFile(e, "camera")} />

      {isProcessing && submitProgress.step > 0 && (
        <div className="sub-overlay">
          <div className="sub-box">
            <i className="fas fa-circle-notch fa-spin sub-spinner" />
            <div className="sub-title">{submitProgress.label}</div>
            <div className="sub-pbar-wrap"><div className="sub-pbar" style={{ width: `${submitProgress.pct}%` }} /></div>
            <div className="sub-step">Langkah {submitProgress.step}/4</div>
          </div>
        </div>
      )}

      {isDraftsOpen && (
        <div className="modal-ov show" onClick={() => setIsDraftsOpen(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-head"><h2><i className="fas fa-folder-open" /> Daftar Draft</h2></div>
            <div className="sheet-body">
              {drafts.length === 0 ? <div className="empty-msg">Tidak ada draft tersimpan.</div> : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {drafts.map((d, i) => (
                    <div key={i} className="draft-card" onClick={() => loadDraft(d)}>
                      <div style={{ flex: 1 }}>
                        <div className="d-title">{d.ts}</div>
                        <div className="d-sub">{d.data?.text?.substring(0, 40)}...</div>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); deleteDraft(d.id); }} className="d-del"><i className="fas fa-trash" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button className="sub-btn" style={{ background: "var(--blue)", marginTop: "20px" }} onClick={async () => {
              const res = await fetch("/api/proxy", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "saveDraft", text, photos: photos.slice(0, 3) })
              });
              if ((await res.json()).success) { toast("Draft Disimpan", "ok"); fetchDrafts(); }
            }}><i className="fas fa-save" /> SIMPAN DRAFT BARU</button>
          </div>
        </div>
      )}

      {/* Settings Modal Integrated */}
      {isSettingsOpen && (
        <div className="modal-ov show" onClick={() => setIsSettingsOpen(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-head"><h2><i className="fas fa-cog" /> Pengaturan</h2></div>
            <div className="sheet-body">
              <div className="s-section">
                <label>WATERMARK & MINIMAP</label>
                <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                  <button onClick={() => handleSettingChange("wmCam", !settings.wmCam)} className={`s-tgl ${settings.wmCam ? 'on' : ''}`}>KAMERA</button>
                  <button onClick={() => handleSettingChange("wmGal", !settings.wmGal)} className={`s-tgl ${settings.wmGal ? 'on' : ''}`}>GALERI</button>
                  <button onClick={() => handleSettingChange("minimap", !settings.minimap)} className={`s-tgl ${settings.minimap ? 'on' : ''}`}>MINIMAP</button>
                </div>
              </div>
              <div className="s-section">
                <label>UNIT / SPT NO</label>
                <input value={settings.sptNo} onChange={(e) => handleSettingChange("sptNo", e.target.value)} placeholder="000/000/000/2026" className="s-input" />
              </div>
              <button onClick={() => { if (confirm("Reset form?")) { setPhotos([]); setText(""); idbClearAll(); setIsSettingsOpen(false); } }} className="reset-btn">RESET FORM</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .ci { width: 32px; height: 32px; border-radius: 8px; display: flex; alignItems: center; justifyContent: center; fontSize: .9rem; }
        .badge-cnt { font-size: .7rem; background: var(--blue); width: 22px; height: 22px; border-radius: 50%; display: flex; alignItems: center; justifyContent: center; }
        .up-btn { height: 75px; border-radius: 14px; border: none; background: #0f172a; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; font-weight: 700; font-size: .7rem; }
        .up-btn i { font-size: 1.3rem; color: var(--blue); }
        .mini-btn-gps { width: 22px; height: 22px; border-radius: 50%; background: #2563ebcc; color: #fff; border: none; font-size: .6rem; }
        .mini-btn-del { width: 22px; height: 22px; border-radius: 50%; background: #dc2626cc; color: #fff; border: none; font-size: .6rem; }
        .gps-badge { position: absolute; top: 4px; left: 4px; background: #22c55eee; color: #fff; padding: 2px 5px; border-radius: 4px; font-size: .5rem; font-weight: 800; }
        .sub-btn { height: 56px; border-radius: 16px; color: #fff; font-size: .9rem; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; }
        .sheet { background: #1e293b; border-radius: 24px 24px 0 0; padding: 20px; max-height: 85vh; overflow-y: auto; position: fixed; bottom: 0; left: 0; right: 0; }
        .sheet-handle { width: 40px; height: 4px; background: #ffffff22; border-radius: 2px; margin: 0 auto 15px; }
        .draft-card { background: #ffffff08; border: 1px solid #ffffff11; border-radius: 12px; padding: 12px; display: flex; align-items: center; cursor: pointer; transition: .2s; }
        .d-title { font-size: .85rem; font-weight: 700; }
        .d-sub { font-size: .65rem; opacity: .5; }
        .d-del { background: none; border: none; color: #ef4444; padding: 10px; }
        .s-section { margin-bottom: 20px; }
        .s-section label { font-size: .65rem; font-weight: 800; color: var(--blue); letter-spacing: 1px; }
        .s-tgl { flex: 1; padding: 10px; border-radius: 10px; border: none; background: #0f172a; color: #fff; font-size: .65rem; font-weight: 700; transition: .3s; }
        .s-tgl.on { background: var(--blue); }
        .s-input { width: 100%; background: #0f172a; border: 1px solid #334155; color: #fff; padding: 12px; border-radius: 10px; margin-top: 8px; font-size: .85rem; }
        .reset-btn { width: 100%; padding: 14px; border-radius: 14px; background: #ef444411; color: #ef4444; border: 1px solid #ef444433; font-weight: 700; font-size: .75rem; margin-top: 10px; }
      `}</style>
    </div>
  );
}

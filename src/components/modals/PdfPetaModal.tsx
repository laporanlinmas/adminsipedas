"use client";

import React, { useState, useEffect } from "react";
import Script from "next/script";
import { useUI } from "@/context/UIContext";

interface PdfPetaModalProps {
  isOpen: boolean;
  onClose: () => void;
  layers: any[];
}

export function PdfPetaModal({ isOpen, onClose, layers }: PdfPetaModalProps) {
  const { toast } = useUI();
  const [paper, setPaper] = useState("a4");
  const [ori, setOri] = useState("landscape");
  const [dpi, setDpi] = useState(2); // HD scale default

  const [isProcessing, setIsProcessing] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [scriptsLoaded, setScriptsLoaded] = useState(false);

  useEffect(() => {
    // Check if scripts already loaded from previous mount
    if ((window as any).html2canvas && ((window as any).jspdf || (window as any).jsPDF)) {
      setScriptsLoaded(true);
    }
  }, [isOpen]);

  const handleScriptLoad = () => {
    if ((window as any).html2canvas && ((window as any).jspdf || (window as any).jsPDF)) {
      setScriptsLoaded(true);
    }
  };

  const handleCetak = async () => {
    if (!scriptsLoaded) {
      toast("Library PDF sedang dimuat. Harap tunggu sejenak.", "inf");
      return;
    }

    setIsProcessing(true);
    setTaskName("Menyiapkan Canvas Renderer...");

    try {
      const PAPER_SIZES: any = {
        a4: { w: 210, h: 297 },
        f4: { w: 215.9, h: 330.2 }
      };

      const pS = PAPER_SIZES[paper];
      const isLS = ori === "landscape";
      const pgW = isLS ? pS.h : pS.w;
      const pgH = isLS ? pS.w : pS.h;

      const MM = 3.7795275591;
      const PAD = 5;
      const HDR_H = 20;
      const FTR_H = 10;
      const cTop = HDR_H + PAD;
      const cBot = pgH - FTR_H - PAD;
      const cH = cBot - cTop;
      const mapAreaW = pgW - PAD * 2;

      // Div offscreen untuk dirender html2canvas
      const offDiv = document.createElement("div");
      offDiv.style.position = "fixed";
      offDiv.style.left = "-9999px";
      offDiv.style.top = "0";
      offDiv.style.width = Math.round(mapAreaW * MM) + "px";
      offDiv.style.height = Math.round(cH * MM) + "px";
      offDiv.style.background = "#e4eaf5";
      offDiv.style.zIndex = "-9999";
      document.body.appendChild(offDiv);

      const L = (window as any).L;
      // Gunakan default coordinates
      const offMap = L.map(offDiv, {
        center: [-7.87148, 111.47032],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
        preferCanvas: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        crossOrigin: 'anonymous'
      }).addTo(offMap);

      // Clone layers
      layers.forEach((l) => {
        try {
          const coords = JSON.parse(l.koordinat);
          let geo: any = null;
          const style = { color: l.warna, weight: Number(l.tebal) || 3, opacity: 0.8 };

          if (l.tipe === "Polygon") {
            geo = L.polygon(coords, style);
          } else if (l.tipe === "Polyline") {
            geo = L.polyline(coords, style);
          } else if (l.tipe === "Marker") {
            geo = L.marker(coords);
          }
          if (geo) geo.addTo(offMap);
        } catch (e) { }
      });

      // Fit bounds
      if (layers.length > 0) {
        const group = L.featureGroup();
        offMap.eachLayer((lay: any) => {
          if (lay instanceof L.Polygon || lay instanceof L.Polyline || lay instanceof L.Marker) {
            group.addLayer(lay);
          }
        });
        if (group.getBounds().isValid()) {
          offMap.fitBounds(group.getBounds(), { padding: [10, 10] });
        }
      }

      setTaskName("Memuat Data Tile Satelit...");
      await new Promise((r) => setTimeout(r, 4500)); // wait for network tiles

      setTaskName(`Merender Resolusi ${dpi}x...`);
      const html2canvas = (window as any).html2canvas;
      const mapCanvas = await html2canvas(offDiv, {
        useCORS: true,
        allowTaint: true,
        scale: dpi,
        backgroundColor: '#e4eaf5',
        logging: false
      });

      setTaskName("Menyusun Berkas PDF...");
      const jsPDF = (window as any).jspdf ? (window as any).jspdf.jsPDF : (window as any).jsPDF;
      const doc = new jsPDF({
        orientation: isLS ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [pgW, pgH]
      });

      // Draw PDF Document
      doc.setFillColor(230, 237, 248); doc.rect(0, 0, pgW, pgH, 'F');

      // Header
      doc.setFillColor(8, 18, 38); doc.rect(0, 0, pgW, HDR_H, 'F');
      doc.setFillColor(12, 26, 56); doc.rect(0, 0, pgW * 0.58, HDR_H, 'F');
      doc.setFillColor(28, 111, 217); doc.rect(0, HDR_H - 1.2, pgW, 1.2, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(isLS ? 11 : 9);
      doc.text('LAPORAN PEMETAAN KAWASAN PEDESTRIAN', PAD + 5, 9);

      doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(155, 193, 235);
      const tglStr = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
      const jamStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      doc.text(`Satlinmas — ${tglStr} pukul ${jamStr}`, PAD + 5, 14.5);

      // Shadow Map Area
      doc.setFillColor(195, 210, 228); doc.roundedRect(PAD + .8, cTop + .8, mapAreaW + .4, cH + .4, 2, 2, 'F');
      doc.setDrawColor(160, 188, 218); doc.setLineWidth(.4);
      doc.roundedRect(PAD, cTop, mapAreaW, cH, 1.5, 1.5, 'S');

      // Map Image
      const imgData = mapCanvas.toDataURL('image/jpeg', 0.95);
      doc.addImage(imgData, 'JPEG', PAD, cTop, mapAreaW, cH);

      // Footer
      const ftY = pgH - FTR_H;
      doc.setFillColor(8, 18, 38); doc.rect(0, ftY, pgW, FTR_H, 'F');
      doc.setFillColor(28, 111, 217); doc.rect(0, ftY, pgW, 1, 'F');
      doc.setTextColor(98, 138, 202); doc.setFont('helvetica', 'bold'); doc.setFontSize(6);
      doc.text('SATLINMAS PONOROGO — PETA PEDESTRIAN', PAD, ftY + 4.5);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(5); doc.setTextColor(72, 108, 162);
      doc.text('SI-PEDAS · Sistem Informasi Pedestrian Satlinmas', PAD, ftY + 8);

      const paperLbl = paper === "a4" ? "A4" : "F4";
      doc.save(`Peta_Pedestrian_${paperLbl}_${new Date().getTime()}.pdf`);

      // Cleanup
      offMap.remove();
      offDiv.remove();

      toast("Tangkapan PDF Peta berhasil disimpan.", "ok");
    } catch (e: any) {
      console.error(e);
      toast("Error render peta: " + e.message, "er");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js" onLoad={handleScriptLoad} />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" onLoad={handleScriptLoad} />

      <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(6,12,28,0.85)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "var(--card)", width: "100%", maxWidth: "450px", borderRadius: "18px", boxShadow: "0 25px 60px rgba(0,0,0,0.5)", overflow: "hidden", display: "flex", flexDirection: "column" }}>

          <div style={{ padding: "16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: ".85rem", fontWeight: 800, color: "var(--purple)", display: "flex", alignItems: "center", gap: "8px" }}>
              <i className="fas fa-file-pdf" /> Konfigurasi Cetak Peta
            </h3>
            <button onClick={onClose} disabled={isProcessing} style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer" }}>
              <i className="fas fa-xmark fa-lg" />
            </button>
          </div>

          <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "15px" }}>

            {/* Kertas Selection */}
            <div>
              <label style={{ fontSize: ".65rem", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Ukuran Kertas</label>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => setPaper("a4")}
                  style={{ flex: 1, padding: "10px", borderRadius: "10px", border: paper === "a4" ? "1.5px solid var(--blue)" : "1.5px solid var(--border)", background: paper === "a4" ? "var(--bluelo)" : "var(--bg)", color: paper === "a4" ? "var(--blue)" : "var(--muted)", fontWeight: 700, cursor: "pointer", transition: "all 0.15s" }}
                >
                  Kertas A4
                </button>
                <button
                  onClick={() => setPaper("f4")}
                  style={{ flex: 1, padding: "10px", borderRadius: "10px", border: paper === "f4" ? "1.5px solid var(--blue)" : "1.5px solid var(--border)", background: paper === "f4" ? "var(--bluelo)" : "var(--bg)", color: paper === "f4" ? "var(--blue)" : "var(--muted)", fontWeight: 700, cursor: "pointer", transition: "all 0.15s" }}
                >
                  Kertas F4 (Folio)
                </button>
              </div>
            </div>

            {/* Orientasi */}
            <div>
              <label style={{ fontSize: ".65rem", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Orientasi Halaman</label>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => setOri("landscape")}
                  style={{ flex: 1, padding: "10px", borderRadius: "10px", border: ori === "landscape" ? "1.5px solid var(--blue)" : "1.5px solid var(--border)", background: ori === "landscape" ? "var(--bluelo)" : "var(--bg)", color: ori === "landscape" ? "var(--blue)" : "var(--muted)", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                >
                  <i className="fas fa-image" /> Landscape
                </button>
                <button
                  onClick={() => setOri("portrait")}
                  style={{ flex: 1, padding: "10px", borderRadius: "10px", border: ori === "portrait" ? "1.5px solid var(--blue)" : "1.5px solid var(--border)", background: ori === "portrait" ? "var(--bluelo)" : "var(--bg)", color: ori === "portrait" ? "var(--blue)" : "var(--muted)", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                >
                  <i className="fas fa-file-lines" /> Portrait
                </button>
              </div>
            </div>

            {/* Rendering DPI */}
            <div>
              <label style={{ fontSize: ".65rem", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Kualitas Render (DPI)</label>
              <div style={{ display: "flex", gap: "10px" }}>
                {[1.5, 2.5, 4].map(val => (
                  <button
                    key={val}
                    onClick={() => setDpi(val)}
                    style={{ flex: 1, padding: "8px", borderRadius: "8px", border: dpi === val ? "1.5px solid var(--teal)" : "1.5px solid var(--border)", background: dpi === val ? "var(--teall)" : "var(--bg)", color: dpi === val ? "var(--teal)" : "var(--muted)", fontWeight: 700, cursor: "pointer" }}
                  >
                    {val === 1.5 ? "Normal" : val === 2.5 ? "Cukup HD" : "Ultra HD"}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: ".6rem", color: "var(--muted)", margin: "8px 0 0" }}>*Kualitas Ultra membutuhkan waktu render hingga 15-20 detik di belakang layar.</p>
            </div>

          </div>

          <div style={{ padding: "14px 20px", background: "var(--bg)", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              {isProcessing && (
                <span style={{ fontSize: ".65rem", fontWeight: 700, color: "var(--blue)" }}>
                  <i className="fas fa-circle-notch fa-spin" /> {taskName}
                </span>
              )}
            </div>

            <button
              onClick={handleCetak}
              disabled={isProcessing}
              style={{ padding: "10px 24px", background: isProcessing ? "var(--border)" : "var(--purple)", color: isProcessing ? "var(--muted)" : "#fff", border: "none", borderRadius: "10px", fontWeight: 800, cursor: isProcessing ? "not-allowed" : "pointer" }}
            >
              {isProcessing ? "Memproses..." : "Render & PDF Sekarang"}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}

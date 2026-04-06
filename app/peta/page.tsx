"use client";

import React, { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Panel } from "@/components/ui/DashboardUI";
import MapComponent from "@/components/map/MapComponent";
import { useSession } from "@/context/SessionContext";
import { useUI } from "@/context/UIContext";
import { LayerManagerModal } from "@/components/modals/LayerManagerModal";
import { PdfPetaModal } from "@/components/modals/PdfPetaModal";

interface PetaLayer {
  _ri?: number;
  nama: string;
  tipe: string;
  koordinat: string; // JSON string from DB
  warna: string;
  tebal: number;
}

interface PhotoMarker {
  id: string;
  lat: number;
  lng: number;
  tgl: string;
  petugas: string;
  foto: string;
}

const STREET_BOUNDS = [
  { id: 'diponegoro', minLat: -7.872245, maxLat: -7.864721, minLng: 111.460848, maxLng: 111.461663 },
  { id: 'jenderal_soedirman', minLat: -7.872330, maxLat: -7.871480, minLng: 111.461556, maxLng: 111.470525 },
  { id: 'hos_cokroaminoto', minLat: -7.871501, maxLat: -7.864891, minLng: 111.469452, maxLng: 111.470504 },
  { id: 'urip_soemoharjo', minLat: -7.865167, maxLat: -7.864636, minLng: 111.461256, maxLng: 111.469474 }
];

const JALAN_GROUPS = [
  { id: 'diponegoro', label: 'Jl. Diponegoro' },
  { id: 'jenderal_soedirman', label: 'Jl. Jend. Soedirman' },
  { id: 'hos_cokroaminoto', label: 'Jl. HOS Cokroaminoto' },
  { id: 'urip_soemoharjo', label: 'Jl. Urip Soemoharjo' },
  { id: 'lainnya', label: 'Area Lainnya' }
];

function resolveKelompok(lat: number, lng: number) {
  for (let i = 0; i < STREET_BOUNDS.length; i++) {
    const b = STREET_BOUNDS[i];
    if (lat >= b.minLat && lat <= b.maxLat && lng >= b.minLng && lng <= b.maxLng) return b.id;
  }
  return 'lainnya';
}

function haversineDistance(la1: number, ln1: number, la2: number, ln2: number) {
  const R = 6371000, p1 = la1 * Math.PI / 180, p2 = la2 * Math.PI / 180;
  const dp = (la2 - la1) * Math.PI / 180, dl = (ln2 - ln1) * Math.PI / 180;
  const a = Math.sin(dp / 2) * Math.sin(dp / 2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calcPolylineLength(coords: any[]) {
  let len = 0;
  let flat = Array.isArray(coords[0]) && Array.isArray(coords[0][0]) ? coords[0] : coords;
  for(let i=0; i<flat.length-1; i++) {
     len += haversineDistance(flat[i][0], flat[i][1], flat[i+1][0], flat[i+1][1]);
  }
  return len < 1000 ? Math.round(len) + ' m' : (len/1000).toFixed(2) + ' km';
}

function calcPolygonArea(coords: any[]) {
  let flat = Array.isArray(coords[0]) && Array.isArray(coords[0][0]) ? coords[0] : coords;
  if(flat.length<3) return '0 m²';
  const R=6371000;
  let a=0, n=flat.length;
  for(let i=0; i<n; i++){
    let j=(i+1)%n;
    a+=(flat[j][1]-flat[i][1])*Math.PI/180*(2+Math.sin(flat[i][0]*Math.PI/180)+Math.sin(flat[j][0]*Math.PI/180));
  }
  let m2 = Math.abs(a*R*R/2);
  return m2 < 10000 ? Math.round(m2) + ' m²' : (m2/10000).toFixed(2) + ' ha';
}

export default function PetaPage() {
  const { isAdmin, isLoading: sessionLoading } = useSession();
  const { toast, showGallery } = useUI();
  const [layers, setLayers] = useState<PetaLayer[]>([]);
  const [photoMarkers, setPhotoMarkers] = useState<PhotoMarker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPhotos, setShowPhotos] = useState(false);
  const [photoFilter, setPhotoFilter] = useState<string>("all");
  const [showRealtime, setShowRealtime] = useState(true);
  const [navPanelOpen, setNavPanelOpen] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  
  const mapInstanceRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);
  const photoGroupRef = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  
  const [showLayerManager, setShowLayerManager] = useState(false);
  const [selectedLyr, setSelectedLyr] = useState<{lat: number, lng: number, nama: string} | null>(null);
  const [fotoRadius, setFotoRadius] = useState(1000);

  useEffect(() => {
    if (isMapReady) {
      fetchAllData();
    }
  }, [isMapReady]);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Geometry Layers
      const resL = await fetch("/api/proxy?action=getLayerPeta");
      const resLJson = await resL.json();
      if (resLJson.success) {
        const layerData = resLJson.data || [];
        setLayers(layerData);
        renderLayersOnMap(layerData);
      }

      // 2. Fetch Photo Markers (Realtime)
      const resP = await fetch("/api/proxy?action=getDetailFotoMarkers");
      const resPJson = await resP.json();
      if (resPJson.success) {
        setPhotoMarkers(resPJson.data || []);
      }
    } catch (e: any) {
      toast("Gagal memuat data peta: " + e.message, "er");
    } finally {
      setIsLoading(false);
    }
  };

  const renderLayersOnMap = (layerData: PetaLayer[]) => {
    const L = window.L;
    const map = mapInstanceRef.current;
    if (!L || !map) return;

    if (layerGroupRef.current) map.removeLayer(layerGroupRef.current);
    layerGroupRef.current = L.featureGroup().addTo(map);

    layerData.forEach((l) => {
      try {
        const coords = JSON.parse(l.koordinat);
        let geo: any = null;
        const style = { color: l.warna, weight: l.tebal || 3, opacity: 0.8 };

        if (l.tipe === "Polygon") {
          geo = L.polygon(coords, style);
        } else if (l.tipe === "Polyline") {
          geo = L.polyline(coords, style);
        } else if (l.tipe === "Marker") {
          geo = L.marker(coords);
        }

        if (geo) {
          geo.bindPopup(`<b>${l.nama}</b><br><small>${l.tipe}</small>`);
          
          if (l.tipe === "Polygon") {
            geo.bindTooltip(`<b>Luas Area: ${calcPolygonArea(coords)}</b>`, {sticky: true, className: 'lf-tip-clean'});
          } else if (l.tipe === "Polyline") {
            geo.bindTooltip(`<b>Jarak Rute: ${calcPolylineLength(coords)}</b>`, {sticky: true, className: 'lf-tip-clean'});
          }

          geo.on('click', (e: any) => {
            let center;
            if (l.tipe === "Marker") center = geo.getLatLng();
            else center = geo.getBounds().getCenter();
            setSelectedLyr({ lat: center.lat, lng: center.lng, nama: l.nama });
            setShowPhotos(true); // Auto show photos layer if they click a map layer
          });
          geo.addTo(layerGroupRef.current);
        }
      } catch (e) {
        console.error("Invalid coordinates for layer:", l.nama);
      }
    });

    if (layerData.length > 0) {
      map.fitBounds(layerGroupRef.current.getBounds(), { padding: [20, 20] });
    }
  };

  const renderPhotoMarkers = (markers: PhotoMarker[]) => {
    const L = window.L;
    const map = mapInstanceRef.current;
    if (!L || !map) return;

    if (photoGroupRef.current) map.removeLayer(photoGroupRef.current);
    photoGroupRef.current = L.featureGroup();

    let filteredM = markers;
    if (photoFilter !== "all") {
      filteredM = markers.filter(m => resolveKelompok(m.lat, m.lng) === photoFilter);
    }

    filteredM.forEach((m) => {
      if (!m.lat || !m.lng) return;
      
      const isKelompok = photoFilter !== "all";
      const markerColor = isKelompok ? "var(--teal)" : "var(--blue)";
      
      const marker = L.marker([m.lat, m.lng], {
        icon: L.divIcon({
          className: "custom-div-icon",
          html: `<div style="background:${markerColor};width:10px;height:10px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 10px rgba(0,0,0,0.3)"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        })
      });

      marker.bindPopup(`
        <div style="width:200px">
          <img src="${m.foto}" style="width:100%;height:120px;object-fit:cover;border-radius:8px;margin-bottom:8px">
          <div style="font-weight:bold;margin-bottom:4px">${m.petugas}</div>
          <div style="font-size:.65rem;color:var(--muted)">${m.tgl}</div>
          <button onclick="window.galOpen?.(['${m.foto}'])" style="margin-top:8px;width:100%;padding:4px;background:var(--blue);color:#fff;border:none;border-radius:4px;font-size:.6rem">Lihat Foto</button>
        </div>
      `);
      marker.addTo(photoGroupRef.current);
    });

    if (showPhotos) photoGroupRef.current.addTo(map);
  };

  useEffect(() => {
    if (showPhotos) {
      renderPhotoMarkers(photoMarkers);
    } else {
      const map = mapInstanceRef.current;
      if (map && photoGroupRef.current) {
        map.removeLayer(photoGroupRef.current);
      }
    }
  }, [showPhotos, photoFilter, photoMarkers]);

  const togglePhotos = (val: boolean) => {
    setShowPhotos(val);
  };

  const navMap = (action: string) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    switch (action) {
      case 'in': map.zoomIn(); break;
      case 'out': map.zoomOut(); break;
      case 'up': map.panBy([0, -80]); break;
      case 'down': map.panBy([0, 80]); break;
      case 'left': map.panBy([-80, 0]); break;
      case 'right': map.panBy([80, 0]); break;
      case 'center': map.flyTo([-7.87148, 111.47032], 13, { animate: true, duration: 1.2 }); break;
    }
  };

  if (sessionLoading) return null;

  return (
    <DashboardLayout title="Peta Pedestrian" subtitle="Visualisasi area monitoring dan rute patroli">
      <div style={{ display: "flex", gap: "10px", height: "calc(100vh - 140px)", minHeight: "500px" }} className="fu">
        
        {/* Sidebar - Desktop Only */}
        <div style={{ width: "260px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "10px" }} className="hide-mobile">
          <Panel title="Kontrol Peta" icon="fa-sliders">
             <div style={{ padding: "10px" }}>
                <p style={{ fontSize: ".65rem", color: "var(--muted)", marginBottom: "10px", fontWeight: 800, textTransform: "uppercase" }}>Overlays</p>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                   <div style={{ display: "flex", flexDirection: "column", background: "var(--bg)", padding: "10px", borderRadius: "10px", border: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <i className="fas fa-camera" style={{ color: "var(--blue)" }} />
                          <span style={{ fontSize: ".72rem", fontWeight: 700 }}>Foto Patroli</span>
                        </div>
                        <label className={`set-switch ${showPhotos ? 'on' : ''}`}>
                           <input type="checkbox" checked={showPhotos} onChange={(e: any) => togglePhotos(e.target.checked)} style={{ display: "none" }} />
                           <span className="set-switch-track" onClick={() => togglePhotos(!showPhotos)}>
                             <span className="set-switch-knob" />
                           </span>
                        </label>
                      </div>
                      
                      {showPhotos && (
                        <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px dashed var(--border)" }}>
                          <select 
                            value={photoFilter} 
                            onChange={(e: any) => setPhotoFilter(e.target.value)}
                            style={{ width: "100%", padding: "5px 8px", fontSize: ".65rem", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--card)", color: "var(--text)", outline: "none" }}
                          >
                            <option value="all">Semua Foto Beredar</option>
                            {JALAN_GROUPS.map(g => (
                              <option key={g.id} value={g.id}>{g.label}</option>
                            ))}
                          </select>
                        </div>
                      )}
                   </div>
                   
                   <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg)", padding: "10px", borderRadius: "10px", border: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <i className="fas fa-satellite" style={{ color: "var(--teal)" }} />
                        <span style={{ fontSize: ".72rem", fontWeight: 700 }}>Peta Realtime</span>
                      </div>
                      <label className={`set-switch ${showRealtime ? 'on' : ''}`}>
                         <input type="checkbox" checked={showRealtime} onChange={(e: any) => setShowRealtime(e.target.checked)} style={{ display: "none" }} />
                         <span className="set-switch-track" onClick={() => setShowRealtime(!showRealtime)}>
                           <span className="set-switch-knob" />
                         </span>
                      </label>
                   </div>
                </div>

                <div style={{ marginTop: "20px" }}>
                   <p style={{ fontSize: ".65rem", color: "var(--muted)", marginBottom: "10px", fontWeight: 800, textTransform: "uppercase" }}>
                      Layer Terdaftar ({layers.length})
                   </p>
                   {isLoading ? (
                     <div style={{ textAlign: "center", padding: "20px" }}><i className="fas fa-circle-notch fa-spin" /></div>
                   ) : (
                     <div style={{ display: "flex", flexDirection: "column", gap: "5px", maxHeight: "280px", overflowY: "auto", paddingRight: "5px" }}>
                        {layers.map((l, i) => (
                           <div key={i} style={{ fontSize: ".68rem", padding: "8px 12px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
                              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: l.warna || "var(--blue)" }} />
                              <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1 }}>{l.nama}</span>
                              <i className={`fas fa-${l.tipe === "Polygon" ? "draw-polygon" : l.tipe === "Polyline" ? "route" : "location-dot"}`} style={{ opacity: 0.3 }} />
                           </div>
                        ))}
                     </div>
                   )}
                </div>
                
                <button 
                  onClick={fetchAllData} 
                  style={{ width: "100%", marginTop: "15px", padding: "10px", borderRadius: "10px", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--mid)", fontSize: ".7rem", fontWeight: 700, cursor: "pointer" }}
                >
                  <i className="fas fa-rotate-right" /> Muat Ulang Peta
                </button>
             </div>
          </Panel>
          
          {isAdmin && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <button className="bp" onClick={() => setShowLayerManager(true)} style={{ width: "100%", height: "40px", borderRadius: "10px", background: "var(--blue)", border: "none", color: "#fff", fontWeight: 700, boxShadow: "0 4px 6px -1px var(--bluelo)" }}>
                 <i className="fas fa-layer-group" /> Manajemen Layer
              </button>
              <button 
                onClick={() => setShowPdfModal(true)} 
                style={{ width: "100%", height: "40px", borderRadius: "10px", background: "var(--purple)", border: "none", color: "#fff", fontWeight: 700, boxShadow: "0 4px 6px -1px rgba(124, 58, 237, 0.4)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
              >
                 <i className="fas fa-file-pdf" /> Eksport Peta (HD)
              </button>
            </div>
          )}
        </div>

        {/* Map Rendering Component */}
        <div style={{ flex: 1, position: "relative" }}>
          <MapComponent 
            onMapReady={(map) => {
              mapInstanceRef.current = map;
              setIsMapReady(true);
            }} 
          />
          
          {/* Custom Nav Panel */}
          <div style={{ position: "absolute", top: "10px", left: "10px", zIndex: 1000, display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
            <button 
              onClick={() => setNavPanelOpen(!navPanelOpen)} 
              title="Navigasi Kustom"
              style={{ width: "30px", height: "30px", borderRadius: "8px", background: navPanelOpen ? "rgba(30,111,217,0.9)" : "rgba(15,23,42,0.9)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".8rem", cursor: "pointer", backdropFilter: "blur(8px)", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}
            >
              <i className="fas fa-compass" />
            </button>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "2px", alignItems: "center", overflow: "hidden", maxHeight: navPanelOpen ? "200px" : "0", opacity: navPanelOpen ? 1 : 0, transition: "all 0.25s ease-out", marginTop: "4px" }}>
              <button className="lf-nav-btn" title="Zoom In" onClick={() => navMap('in')}><i className="fas fa-plus" /></button>
              <button className="lf-nav-btn" title="Zoom Out" onClick={() => navMap('out')}><i className="fas fa-minus" /></button>
              <div style={{ width: "24px", height: "1px", background: "rgba(255,255,255,0.1)", margin: "2px 0" }} />
              <button className="lf-nav-btn" onClick={() => navMap('up')}><i className="fas fa-chevron-up" /></button>
              <div style={{ display: "flex", gap: "2px" }}>
                <button className="lf-nav-btn" onClick={() => navMap('left')}><i className="fas fa-chevron-left" /></button>
                <button className="lf-nav-btn" onClick={() => navMap('right')}><i className="fas fa-chevron-right" /></button>
              </div>
              <button className="lf-nav-btn" onClick={() => navMap('down')}><i className="fas fa-chevron-down" /></button>
              <div style={{ width: "24px", height: "1px", background: "rgba(255,255,255,0.1)", margin: "2px 0" }} />
              <button className="lf-nav-btn" title="Kembali ke Pusat" onClick={() => navMap('center')} style={{ color: "#f59e0b" }}><i className="fas fa-crosshairs" /></button>
            </div>
            
            {/* Inline styles for hover effects safely nested */}
            <style jsx>{`
              .lf-nav-btn {
                width: 28px;
                height: 28px;
                border-radius: 6px;
                background: rgba(15,23,42,0.85);
                color: rgba(255,255,255,0.7);
                border: 1px solid rgba(255,255,255,0.08);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: .65rem;
                cursor: pointer;
                transition: all 0.15s;
              }
              .lf-nav-btn:hover {
                background: rgba(30,111,217,0.8);
                color: #fff;
              }
            `}</style>
          </div>
          
          {/* Legend Minimal */}
          <div style={{ position: "absolute", bottom: "20px", right: "20px", background: "rgba(30, 41, 59, 0.8)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "15px", zIndex: 1000, width: "180px", color: "#fff" }}>
             <p style={{ fontSize: ".6rem", fontWeight: 800, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>Legenda</p>
             <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: ".65rem" }}><span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#1e6fd9" }} /> Rute Patroli</div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: ".65rem" }}><span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#0d9268" }} /> Pos Jaga</div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: ".65rem" }}><span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#c0392b" }} /> Titik Rawan</div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: ".65rem", marginTop: "4px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "4px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--blue)" }} /> Foto Patroli
                </div>
             </div>
          </div>

          {/* Photo Distance Panel */}
          {selectedLyr && (
            <div style={{ position: "absolute", bottom: "20px", left: "20px", zIndex: 1001, background: "var(--card)", border: "1px solid var(--border)", borderRadius: "16px", width: "320px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", maxHeight: "80%" }}>
              <div style={{ padding: "14px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg)", borderRadius: "16px 16px 0 0" }}>
                <div>
                  <div style={{ fontSize: ".75rem", fontWeight: 800, color: "var(--blue)" }}><i className="fas fa-location-dot" /> {selectedLyr.nama}</div>
                  <div style={{ fontSize: ".65rem", color: "var(--muted)", marginTop: "2px" }}><i className="fas fa-camera" /> Foto di sekitar titik layer</div>
                </div>
                <button onClick={() => setSelectedLyr(null)} style={{ background: "transparent", border: "none", color: "var(--red)", cursor: "pointer", padding: "5px" }}><i className="fas fa-xmark fa-lg" /></button>
              </div>
              
              <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: ".65rem", fontWeight: 700 }}>Radius:</span>
                <select value={fotoRadius} onChange={(e: any) => setFotoRadius(Number(e.target.value))} style={{ flex: 1, padding: "5px", fontSize: ".7rem", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--mid)" }}>
                  <option value={500}>500 Meter</option>
                  <option value={1000}>1 Kilometer</option>
                  <option value={2000}>2 Kilometer</option>
                  <option value={5000}>5 Kilometer</option>
                </select>
              </div>

              <div style={{ padding: "10px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
                {(() => {
                  const filtered = photoMarkers.filter(m => haversineDistance(selectedLyr.lat, selectedLyr.lng, m.lat, m.lng) <= fotoRadius);
                  filtered.sort((a,b) => haversineDistance(selectedLyr.lat, selectedLyr.lng, a.lat, a.lng) - haversineDistance(selectedLyr.lat, selectedLyr.lng, b.lat, b.lng));

                  if (filtered.length === 0) {
                    return <div style={{ textAlign: "center", padding: "30px 10px", color: "var(--muted)" }}><i className="fas fa-camera-slash" style={{ fontSize: "2rem", marginBottom: "10px", opacity: 0.2 }} /><p style={{ fontSize: ".7rem" }}>Tidak ada foto dalam radius {fotoRadius < 1000 ? fotoRadius + 'm' : (fotoRadius/1000)+'km'}</p></div>;
                  }

                  return (
                    <>
                      <div style={{ fontSize: ".6rem", color: "var(--mid)", textAlign: "center", fontWeight: 700 }}>Ditemukan {filtered.length} foto</div>
                      {filtered.map((m: any) => {
                        const dist = Math.round(haversineDistance(selectedLyr.lat, selectedLyr.lng, m.lat, m.lng));
                        return (
                          <div key={m.id} style={{ display: "flex", gap: "10px", background: "var(--bg)", padding: "10px", borderRadius: "10px", border: "1px solid var(--border)" }}>
                            <img src={m.foto} onClick={() => window.galOpen?.([m.foto])} style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px", cursor: "pointer", border: "1px solid var(--border)" }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: ".7rem", fontWeight: 700, color: "var(--blue)" }}>{m.petugas}</div>
                              <div style={{ fontSize: ".6rem", color: "var(--muted)", margin: "4px 0" }}><i className="fas fa-clock" /> {m.tgl}</div>
                              <div style={{ fontSize: ".6rem", fontWeight: 800, color: "var(--teal)" }}><i className="fas fa-route" /> {dist} meter dari pusat layer</div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <LayerManagerModal 
        isOpen={showLayerManager}
        onClose={() => setShowLayerManager(false)}
        layers={layers}
        onRefresh={fetchAllData}
      />

      <PdfPetaModal
        isOpen={showPdfModal}
        onClose={() => setShowPdfModal(false)}
        layers={layers}
      />
    </DashboardLayout>
  );
}

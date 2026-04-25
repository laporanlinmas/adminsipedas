'use client';

import { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';

const fetcher = (url) => fetch(url).then(r => r.json());

export default function PoskamlingPetaView() {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersRef = useRef([]);
  const { data, isLoading } = useSWR('/api/proxy?action=getPoskamling', fetcher);
  const rows = data?.data?.data || [];
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Dynamically load Leaflet CSS + JS if not already loaded
    const loadLeaflet = async () => {
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }
      if (!window.L) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }
      return window.L;
    };

    loadLeaflet().then((L) => {
      if (!mapRef.current || leafletMapRef.current) return;

      const map = L.map(mapRef.current, {
        center: [-7.9025, 111.4625],
        zoom: 11,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      leafletMapRef.current = map;
    });

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Update markers when rows change
  useEffect(() => {
    if (!leafletMapRef.current || !window.L) return;
    const L = window.L;
    const map = leafletMapRef.current;

    // Clear old markers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    const validRows = rows.filter(r => r.lat && r.lng);
    if (validRows.length === 0) return;

    const bounds = [];

    validRows.forEach(row => {
      const lat = parseFloat(row.lat);
      const lng = parseFloat(row.lng);
      if (isNaN(lat) || isNaN(lng)) return;

      // Custom emerald marker icon
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:32px;height:32px;background:linear-gradient(135deg,#10b981,#059669);border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2.5px solid #fff;box-shadow:0 3px 12px rgba(16,185,129,0.45)">
          <i class="fas fa-shield-halved" style="transform:rotate(45deg);display:block;text-align:center;line-height:28px;font-size:12px;color:#fff"></i>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -36],
      });

      const mapsUrl = `https://maps.google.com/maps?q=${lat},${lng}`;
      const popupHtml = `
        <div style="font-family:Inter,sans-serif;min-width:180px;max-width:220px">
          <div style="font-size:0.82rem;font-weight:800;color:#065f46;margin-bottom:4px">${row.nama}</div>
          <div style="font-size:0.68rem;color:#6b7280;line-height:1.5">${[row.rtrw, row.desa, row.kecamatan].filter(Boolean).join(' · ')}</div>
          ${row.keterangan ? `<div style="font-size:0.68rem;color:#9ca3af;margin-top:4px">${row.keterangan}</div>` : ''}
          ${row.foto ? `<img src="${row.foto}" style="width:100%;height:80px;object-fit:cover;border-radius:8px;margin-top:8px">` : ''}
          <a href="${mapsUrl}" target="_blank" style="display:inline-flex;align-items:center;gap:5px;margin-top:8px;padding:5px 10px;background:#10b981;color:#fff;border-radius:8px;font-size:0.68rem;font-weight:700;text-decoration:none">
            <i class="fas fa-map-pin"></i> Buka di Maps
          </a>
        </div>
      `;

      const marker = L.marker([lat, lng], { icon })
        .bindPopup(popupHtml, { maxWidth: 240 })
        .addTo(map);

      marker.on('click', () => setSelected(row));
      markersRef.current.push(marker);
      bounds.push([lat, lng]);
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [rows]);

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 relative">
      {/* Topbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#111827]/95 backdrop-blur border-b border-white/[0.06] z-10 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <i className="fas fa-map-location-dot text-emerald-400 text-[0.75rem]"></i>
          </div>
          <div>
            <div className="text-[0.8rem] font-black text-white">Peta Poskamling</div>
            <div className="text-[0.6rem] text-white/40">
              {isLoading ? 'Memuat...' : `${rows.filter(r => r.lat && r.lng).length} pos terpetakan`}
            </div>
          </div>
        </div>
        {isLoading && <i className="fas fa-spinner fa-spin text-emerald-400 text-sm"></i>}
      </div>

      {/* Map */}
      <div ref={mapRef} className="flex-1 w-full z-0" style={{ minHeight: 0 }}></div>

      {/* Info panel jika ada no-coord rows */}
      {!isLoading && rows.length > 0 && rows.filter(r => !r.lat || !r.lng).length > 0 && (
        <div className="absolute bottom-4 left-4 right-4 md:right-auto md:max-w-[300px] bg-[#111827]/90 backdrop-blur border border-amber-500/30 text-amber-300 text-[0.7rem] rounded-xl px-3.5 py-2.5 z-10">
          <i className="fas fa-triangle-exclamation mr-1.5"></i>
          {rows.filter(r => !r.lat || !r.lng).length} pos tanpa koordinat tidak ditampilkan di peta.
        </div>
      )}

      {rows.length === 0 && !isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 text-white z-10">
          <i className="fas fa-shield-halved text-4xl mb-3 opacity-30 text-emerald-400"></i>
          <p className="text-[0.85rem] font-semibold text-white/60">Belum ada data Poskamling dengan koordinat.</p>
        </div>
      )}
    </div>
  );
}

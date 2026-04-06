"use client";

import React, { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    L: any;
  }
}

interface MapComponentProps {
  onMapReady?: (map: any) => void;
}

const PETA_CENTER: [number, number] = [-7.87148, 111.47032];
const PETA_ZOOM = 13;

const TILE_LAYERS = {
  osm: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attr: "&copy; OpenStreetMap",
    label: "OpenStreetMap",
  },
  hybrid: {
    url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
    attr: "Google",
    label: "Google Hybrid",
  },
};

export default function MapComponent({ onMapReady }: MapComponentProps) {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeBaseLayer, setActiveBaseLayer] = useState("osm");

  useEffect(() => {
    // Wait for Leaflet to be available globally
    const checkL = setInterval(() => {
      if (window.L && containerRef.current) {
        clearInterval(checkL);
        initMap();
      }
    }, 100);

    return () => {
      clearInterval(checkL);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const initMap = () => {
    if (mapRef.current) return;

    const L = window.L;
    const map = L.map(containerRef.current, {
      center: PETA_CENTER,
      zoom: PETA_ZOOM,
      zoomControl: false,
    });

    mapRef.current = map;

    // Add Zoom Control at top right
    L.control.zoom({ position: "topright" }).addTo(map);

    // Default Tile Layer
    const osm = L.tileLayer(TILE_LAYERS.osm.url, {
      attribution: TILE_LAYERS.osm.attr,
      maxZoom: 19,
    }).addTo(map);

    setIsLoaded(true);
    if (onMapReady) onMapReady(map);
  };

  const switchBaseLayer = (key: keyof typeof TILE_LAYERS) => {
    if (!mapRef.current || activeBaseLayer === key) return;
    const L = window.L;
    
    // Remove existing layers
    mapRef.current.eachLayer((layer: any) => {
      if (layer instanceof L.TileLayer) {
        mapRef.current.removeLayer(layer);
      }
    });

    // Add new layer
    const config = TILE_LAYERS[key];
    L.tileLayer(config.url, {
      attribution: config.attr,
      maxZoom: 20,
    }).addTo(mapRef.current);

    setActiveBaseLayer(key);
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "12px", overflow: "hidden" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%", background: "#e4eaf5" }} />
      
      {!isLoaded && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(228, 234, 245, 0.8)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
           <i className="fas fa-spinner fa-spin" style={{ fontSize: "2rem", color: "var(--blue)" }} />
           <p style={{ marginTop: "10px", fontWeight: "bold", color: "var(--mid)" }}>Memuat Peta...</p>
        </div>
      )}

      {/* Layer Switcher - Custom Overlay to match legacy design */}
      <div style={{ position: "absolute", top: "10px", left: "10px", zIndex: 1000, display: "flex", gap: "5px" }}>
        {Object.keys(TILE_LAYERS).map((key) => (
          <button
            key={key}
            onClick={() => switchBaseLayer(key as any)}
            style={{
              padding: "6px 12px",
              background: activeBaseLayer === key ? "var(--blue)" : "rgba(30, 41, 59, 0.8)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "20px",
              fontSize: ".65rem",
              fontWeight: "bold",
              cursor: "pointer",
              backdropFilter: "blur(4px)"
            }}
          >
            {TILE_LAYERS[key as keyof typeof TILE_LAYERS].label}
          </button>
        ))}
      </div>
    </div>
  );
}

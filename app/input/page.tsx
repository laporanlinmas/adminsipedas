"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useSession } from "@/context/SessionContext";

export default function InputPage() {
  const { isAdmin, isLoading: sessionLoading } = useSession();
  const [isIframeLoading, setIsIframeLoading] = useState(true);

  if (sessionLoading) return null;

  if (!isAdmin) {
    return (
      <DashboardLayout title="Akses Ditolak" subtitle="Hanya untuk Administrator">
        <div style={{ padding: "100px", textAlign: "center" }}>
          <i className="fas fa-lock" style={{ fontSize: "3rem", color: "var(--red)", marginBottom: "20px" }} />
          <h2>Akses Terbatas</h2>
          <p>Fitur input laporan hanya dapat diakses oleh Administrator.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Input Laporan" subtitle="Input via embed (optimal load)">
      <div className="fu" style={{ height: "calc(100vh - 150px)", minHeight: "500px" }}>
        <div 
          id="in-embed-shell" 
          style={{ 
            width: "100%", 
            height: "100%", 
            border: "1px solid var(--border)", 
            borderRadius: "12px", 
            overflow: "hidden", 
            background: "var(--card)", 
            position: "relative" 
          }}
        >
          {isIframeLoading && (
            <div 
              id="in-embed-loading" 
              style={{ 
                position: "absolute", 
                inset: 0, 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                gap: "10px", 
                background: "var(--card)", 
                color: "var(--muted)", 
                fontSize: ".72rem", 
                fontWeight: "700",
                zIndex: 10
              }}
            >
              <div className="spw">
                <div className="spo" />
                <div className="spi" />
              </div>
              <span>Memuat Form Input...</span>
            </div>
          )}
          
          <iframe
            id="input-iframe"
            src="/api/input-embed"
            title="Input Laporan SI-PEDAS"
            loading="eager"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="camera; microphone; geolocation; clipboard-read; clipboard-write"
            allowFullScreen
            style={{ width: "100%", height: "100%", border: "none" }}
            onLoad={() => setIsIframeLoading(false)}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

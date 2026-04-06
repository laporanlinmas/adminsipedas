"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DigitalClock } from "@/components/dashboard/DigitalClock";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { TopLocations } from "@/components/dashboard/TopLocations";
import { useSession } from "@/context/SessionContext";

export default function DashboardPage() {
  const { user, isLoading: sessionLoading } = useSession();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if we have cached dashboard data
    const cached = localStorage.getItem("dash_cache");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.ts < 5 * 60 * 1000) {
          setData(parsed.data);
          setIsLoading(false);
        }
      } catch (e) {}
    }

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/proxy?action=getDashboard");
      const result = await res.json();
      if (result.success) {
        const dashboardData = result.data || result;
        setData(dashboardData);
        localStorage.setItem("dash_cache", JSON.stringify({ data: dashboardData, ts: Date.now() }));
      } else {
        setError(result.message || "Gagal memuat data dashboard");
      }
    } catch (e: any) {
      setError(e.message || "Terjadi kesalahan jaringan");
    } finally {
      setIsLoading(false);
    }
  };

  if (sessionLoading) return null;

  return (
    <DashboardLayout title="Dashboard" subtitle="Statistik & grafik data patroli">
      <div className="fu">
        <DigitalClock />
        
        {isLoading && !data ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: "2rem", marginBottom: "10px" }} />
            <div>Memuat data statistik...</div>
          </div>
        ) : error ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--red)" }}>
            <i className="fas fa-circle-exclamation" style={{ fontSize: "2rem", marginBottom: "10px" }} />
            <div>{error}</div>
            <button 
              onClick={fetchDashboardData}
              style={{ marginTop: "15px", padding: "8px 16px", background: "var(--blue)", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}
            >
              Coba Lagi
            </button>
          </div>
        ) : (
          <>
            <StatsGrid data={data} />
            <DashboardCharts data={data} />
            <div style={{ marginTop: "12px" }}>
              <TopLocations data={data.perLokasi || []} />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

"use client";

import React, { useEffect, useRef } from "react";
import { Panel } from "@/components/ui/DashboardUI";

interface ChartData {
  perHari?: { hari: string; n: number }[];
  allData?: any[];
}

declare const Chart: any;

export function DashboardCharts({ data }: { data: ChartData }) {
  const barChartRef = useRef<HTMLCanvasElement>(null);
  const donutChartRef = useRef<HTMLCanvasElement>(null);
  const barChartInstance = useRef<any>(null);
  const donutChartInstance = useRef<any>(null);

  useEffect(() => {
    if (typeof Chart === "undefined" || !data) return;

    // 1. Bar Chart: Laporan per Hari
    if (barChartRef.current) {
      if (barChartInstance.current) barChartInstance.current.destroy();
      const labels = (data.perHari || []).map((x) => x.hari);
      const values = (data.perHari || []).map((x) => x.n);

      barChartInstance.current = new Chart(barChartRef.current, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Laporan",
              data: values,
              backgroundColor: "rgba(30,111,217,.12)",
              borderColor: "#1e6fd9",
              borderWidth: 2.5,
              borderRadius: 7,
              borderSkipped: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: true, ticks: { precision: 0 } },
          },
        },
      });
    }

    // 2. Donut Chart: Tren Triwulan
    if (donutChartRef.current) {
      if (donutChartInstance.current) donutChartInstance.current.destroy();
      const twData = calculateTriwulan(data.allData || []);
      
      donutChartInstance.current = new Chart(donutChartRef.current, {
        type: "doughnut",
        data: {
          labels: twData.labels,
          datasets: [
            {
              data: twData.counts,
              backgroundColor: [
                "rgba(30,111,217,.82)",
                "rgba(13,146,104,.82)",
                "rgba(217,119,6,.82)",
                "rgba(124,58,237,.82)",
              ],
              borderColor: ["#1e6fd9", "#0d9268", "#d97706", "#7c3aed"],
              borderWidth: 2,
              hoverOffset: 8,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "58%",
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx: any) => `${ctx.label}: ${ctx.parsed} laporan`,
              },
            },
          },
        },
      });
    }

    return () => {
      if (barChartInstance.current) barChartInstance.current.destroy();
      if (donutChartInstance.current) donutChartInstance.current.destroy();
    };
  }, [data]);

  const calculateTriwulan = (allData: any[]) => {
    const labels = ["Jan–Mar", "Apr–Jun", "Jul–Sep", "Okt–Des"];
    const counts = [0, 0, 0, 0];

    allData.forEach((r) => {
      const tglString = r.tanggal || "";
      // Extract month name from Indonesian date string (e.g., "12 Januari 2024")
      const match = tglString.match(/\d{1,2}\s+([A-Za-z]+)\s+\d{4}/);
      if (match) {
        const bln = match[1].toLowerCase();
        const BLN: Record<string, number> = {
          januari: 0, februari: 1, maret: 2,
          april: 3, mei: 4, juni: 5,
          juli: 6, agustus: 7, september: 8,
          oktober: 9, november: 10, desember: 11
        };
        
        if (BLN[bln] !== undefined) {
          const qi = Math.floor(BLN[bln] / 3);
          counts[qi]++;
        }
      }
    });

    return { labels, counts };
  };

  return (
    <div className="cg2">
      <Panel title="Laporan per Hari" icon="fa-chart-bar" noMargin>
        <div className="chbox">
          <canvas ref={barChartRef}></canvas>
        </div>
      </Panel>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <Panel
          title="Tren Triwulan"
          icon="fa-chart-pie"
          iconColor="var(--purple)"
          noMargin
          extra={<span style={{ fontSize: ".58rem", color: "var(--muted)", fontFamily: "var(--mono)" }}>Tahun {new Date().getFullYear()}</span>}
        >
          <div className="chbox-sm" style={{ marginBottom: "10px" }}>
            <canvas ref={donutChartRef}></canvas>
          </div>
          <div className="tw-legend">
            {[
              { color: "#1e6fd9", label: "Q1 Jan–Mar" },
              { color: "#0d9268", label: "Q2 Apr–Jun" },
              { color: "#d97706", label: "Q3 Jul–Sep" },
              { color: "#7c3aed", label: "Q4 Okt–Des" },
            ].map((l, i) => (
              <div key={i} className="tw-leg-item">
                <div className="tw-leg-dot" style={{ background: l.color }}></div>
                <span>{l.label}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

import React from "react";
import { StatCard } from "@/components/ui/DashboardUI";

interface StatsGridProps {
  data: {
    total?: number;
    totalP?: number;
    hariIni?: number;
    hariIniP?: number;
    totalAnggota?: number;
  };
}

export function StatsGrid({ data }: StatsGridProps) {
  return (
    <div className="sgr">
      <StatCard
        colorClass="cb"
        icon="fa-clipboard-list"
        value={data.total || 0}
        label="Total Laporan"
      />
      <StatCard
        colorClass="cr"
        icon="fa-user-slash"
        value={data.totalP || 0}
        label="Pelanggaran"
      />
      <StatCard
        colorClass="cg"
        icon="fa-calendar-day"
        value={data.hariIni || 0}
        label="Hari Ini"
      />
      <StatCard
        colorClass="ca"
        icon="fa-triangle-exclamation"
        value={data.hariIniP || 0}
        label="Pelanggaran Hari Ini"
      />
      <StatCard
        colorClass="cp"
        icon="fa-users"
        value={data.totalAnggota || 0}
        label="Total Anggota"
      />
    </div>
  );
}

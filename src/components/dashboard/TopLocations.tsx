import React from "react";
import { Panel } from "@/components/ui/DashboardUI";

interface LocationData {
  lokasi: string;
  n: number;
}

export function TopLocations({ data }: { data: LocationData[] }) {
  if (!data || data.length === 0) {
    return (
      <Panel title="Top Lokasi Patroli" icon="fa-map-pin" noMargin>
        <div className="empty">
          <i className="fas fa-map-pin" />
          <p>Belum ada data</p>
        </div>
      </Panel>
    );
  }

  const maxN = data[0].n || 1;

  return (
    <Panel title="Top Lokasi Patroli" icon="fa-map-pin" noMargin>
      <div className="lokbar-list">
        {data.slice(0, 7).map((item, i) => {
          const percentage = Math.round((item.n / maxN) * 100);
          return (
            <div key={i} className="lokbar-item">
              <div className="lokbar-label">
                <span>{item.lokasi}</span>
                <span style={{ color: "var(--blue)", fontFamily: "var(--mono)" }}>{item.n}</span>
              </div>
              <div className="lokbar-track">
                <div className="lokbar-fill" style={{ width: `${percentage}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

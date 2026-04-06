"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "@/context/SessionContext";

const HARI_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const BULAN_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export function DigitalClock() {
  const { user } = useSession();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="dtw" id="dtw">
      <div className="dtw-left">
        <div className="dtw-time">
          <span>{pad(now.getHours())}</span>:
          <span>{pad(now.getMinutes())}</span>
          <span className="dtw-sec">:<span>{pad(now.getSeconds())}</span></span>
        </div>
        <div className="dtw-date">
          {now.getDate()} {BULAN_NAMES[now.getMonth()]} {now.getFullYear()}
        </div>
        <div className="dtw-day">{HARI_NAMES[now.getDay()]}</div>
      </div>
      <div className="dtw-right">
        <div className="dtw-badge">
          <i className="fas fa-circle-dot" /> Sistem Aktif
        </div>
        <div className="dtw-badge">
          <i className="fas fa-user" /> {user?.namaLengkap || user?.username || "—"}
        </div>
        <div className="dtw-dots">
          <div className="dtw-dot" />
          <div className="dtw-dot" />
          <div className="dtw-dot" />
        </div>
      </div>
    </div>
  );
}

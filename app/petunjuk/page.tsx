"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Panel } from "@/components/ui/DashboardUI";

const PTK_DATA = [
  {
    id: "ptk-db",
    ico: "fa-gauge-high",
    color: "var(--blue)",
    bg: "var(--bluelo)",
    title: "Dashboard",
    desc: "Halaman utama menampilkan statistik ringkasan dan grafik data laporan patroli.",
    poin: [
      "Statistik total laporan, pelanggaran, & aktivitas hari ini",
      "Grafik laporan per hari",
      "Top lokasi patroli berdasarkan frekuensi",
      "Tren Laporan dalam Format Triwulan",
      "Jumlah Anggota Satlinmas Pedestrian",
    ],
  },
  {
    id: "ptk-peta",
    ico: "fa-map-location-dot",
    color: "#0891b2",
    bg: "#e0f7fa",
    title: "Peta Pedestrian",
    desc: "Peta interaktif wilayah patroli Satlinmas Pedestrian.",
    poin: [
      "Mode Google My Maps menampilkan rute patroli, titik rawan, dan pos jaga",
      "Mode Peta Realtime menampilkan laporan lapangan secara langsung",
      "Klik layer atau marker untuk melihat detail lokasi",
      "Tombol Edit Layer untuk administrator",
      "Tombol Refresh untuk memuat ulang peta realtime",
    ],
  },
  {
    id: "ptk-rk",
    ico: "fa-table-list",
    color: "var(--amber)",
    bg: "var(--amberl)",
    title: "Rekap Laporan",
    desc: "Melihat, mencari, dan mencetak seluruh laporan patroli.",
    poin: [
      "Filter berdasarkan kata kunci, lokasi, personil, atau rentang tanggal",
      "Lihat foto dokumentasi langsung dari tabel",
      "Cetak laporan tunggal atau kolektif (PDF rekap)",
      "Admin dapat edit dan hapus laporan dari halaman ini",
    ],
  },
  {
    id: "ptk-in",
    ico: "fa-plus-circle",
    color: "var(--green)",
    bg: "var(--greenl)",
    title: "Input Laporan (Admin)",
    desc: "Menambahkan laporan patroli baru.",
    poin: [
      "Input manual: isi form tanggal, hari, lokasi, personil, identitas pelanggar",
      "Format WA: tempel teks laporan dari WhatsApp, sistem otomatis parsing",
      "Lampirkan foto dokumentasi (maks 10 foto)",
      "Minimal 1 foto wajib disertakan",
    ],
  },
  {
    id: "ptk-ed",
    ico: "fa-file-pen",
    color: "var(--purple)",
    bg: "var(--purplel)",
    title: "Edit Laporan",
    desc: "Mengelola dan memperbaiki data laporan. Khusus Admin.",
    poin: [
      "Edit semua field laporan",
      "Tambah atau hapus foto dari laporan",
      "Hapus laporan secara permanen",
    ],
  },
  {
    id: "ptk-sl",
    ico: "fa-users",
    color: "var(--red)",
    bg: "var(--redl)",
    title: "Data Satlinmas",
    desc: "Manajemen data anggota Satlinmas Pedestrian.",
    poin: [
      "Tambah, edit, dan hapus data anggota",
      "Data mencakup nama, tanggal lahir, unit, dan nomor WhatsApp",
      "Usia dihitung otomatis dari tanggal lahir",
    ],
  },
  {
    id: "ptk-acc",
    ico: "fa-user-shield",
    color: "var(--blue)",
    bg: "var(--bluelo)",
    title: "Tipe Akun & Hak Akses",
    desc: "Dua level pengguna dengan batasan fitur berbeda.",
    poin: [
      "Administrator: Akses penuh (Input, Validasi, Edit, Hapus, Cetak).",
      "Pengguna (User): Akses terbatas (hanya lihat dan cetak).",
    ],
  },
  {
    id: "ptk-auth",
    ico: "fa-circle-info",
    color: "#34495e",
    bg: "#f4f7f6",
    title: "Informasi Sistem",
    desc: "Dikembangkan untuk efisiensi pelaporan Satlinmas Pedestrian.",
    poin: [
      "Author: Ahmad Abdul Basith, S.Tr.I.P.",
      '<a href="https://wa.me/6285159686554" target="_blank" style="color:#0d9268;font-weight:bold;"><i class="fab fa-whatsapp"></i> Hubungi 0851-5968-6554</a>',
    ],
  },
];

export default function PetunjukPage() {
  const [openOuter, setOpenOuter] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleMenu = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <DashboardLayout title="Petunjuk Teknis" subtitle="Panduan fitur & penggunaan SI-PEDAS">
      <div className="fu">
        <div className="ptk-section">
          <div className={`ptk-outer ${openOuter ? "open" : ""}`}>
            <button className="ptk-outer-toggle" onClick={() => setOpenOuter(!openOuter)}>
              <div className="ptk-outer-left">
                <div className="ptk-outer-ico">
                  <i className="fas fa-book-open" />
                </div>
                <div>
                  <div className="ptk-outer-title">Petunjuk Teknis SI-PEDAS</div>
                  <div className="ptk-outer-sub">Panduan fitur & penggunaan sistem</div>
                </div>
              </div>
              <i className="fas fa-chevron-down ptk-outer-arr" style={{ transform: openOuter ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .3s' }} />
            </button>
            
            {openOuter && (
              <div className="ptk-menulist on">
                {PTK_DATA.map((item) => (
                  <div className="ptk-menu-item" key={item.id}>
                    <button 
                      className={`ptk-menu-btn ${openId === item.id ? "open" : ""}`}
                      onClick={() => toggleMenu(item.id)}
                    >
                      <div className="ptk-menu-left">
                        <div className="ptk-menu-ico" style={{ background: item.bg, color: item.color }}>
                          <i className={`fas ${item.ico}`} />
                        </div>
                        <span className="ptk-menu-name">{item.title}</span>
                      </div>
                      <i className="fas fa-chevron-right ptk-menu-arr" />
                    </button>
                    {openId === item.id && (
                      <div className="ptk-detail on">
                        <p>{item.desc}</p>
                        <ul>
                          {item.poin.map((p, idx) => (
                            <li key={idx} dangerouslySetInnerHTML={{ __html: p }} />
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Developer Card */}
          <div className="ptk-dev-card">
            <div className="ptk-dev-head">
              <div className="ptk-dev-title">
                <i className="fas fa-code" /> Developer
              </div>
              <div className="ptk-dev-badge">SI-PEDAS Native</div>
            </div>
            <div className="ptk-dev-body">
              <div className="ptk-dev-photo-wrap">
                <img
                  src="/assets/basith.jpeg"
                  alt="Ahmad Abdul Basith"
                  className="ptk-dev-photo"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = "none";
                    if (target.nextElementSibling) {
                      (target.nextElementSibling as HTMLElement).style.display = "flex";
                    }
                  }}
                />
                <div className="ptk-dev-photo-fallback" style={{ display: "none" }}>
                  AB
                </div>
              </div>
              <div className="ptk-dev-info">
                <div className="ptk-dev-name">Ahmad Abdul Basith, S.Tr.I.P</div>
                <div className="ptk-dev-role">System Developer SI-PEDAS</div>
                <a
                  className="ptk-dev-wa"
                  href="https://wa.me/6285159686554"
                  target="_blank"
                  rel="noopener"
                >
                  <i className="fab fa-whatsapp" /> 0851-5968-6554
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

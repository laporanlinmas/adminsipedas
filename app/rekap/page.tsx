"use client";

import React, { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Panel } from "@/components/ui/DashboardUI";
import { useSession } from "@/context/SessionContext";
import { useUI } from "@/context/UIContext";
import { parseTglID } from "@/utils/date";
import { EditLaporanModal } from "@/components/modals/EditLaporanModal";
import { PdfPrintModal } from "@/components/modals/PdfPrintModal";

interface LaporanRow {
  _ri?: number;
  ts: string;
  lokasi: string;
  hari: string;
  tanggal: string;
  identitas: string;
  personil: string;
  danru: string;
  namaDanru: string;
  keterangan: string;
  fotos?: string[];
  fotosThumb?: string[];
}

const PER_PAGE = 15;

export default function RekapPage() {
  const { isAdmin, isLoading: sessionLoading } = useSession();
  const [data, setData] = useState<LaporanRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal States
  const [editRow, setEditRow] = useState<LaporanRow | null>(null);
  const [printRows, setPrintRows] = useState<LaporanRow[]>([]);

  // UI Context Integrations
  const { showGallery, showModal, toast } = useUI();

  useEffect(() => {
    fetchRekapData();
  }, []);

  const fetchRekapData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/proxy?action=getRekap");
      const result = await res.json();
      if (result.success) {
        const rows = (result.data && result.data.rows) ? result.data.rows : (result.data || []);
        setData(rows);
      } else {
        setError(result.message || "Gagal memuat rekap laporan");
      }
    } catch (e: any) {
      setError(e.message || "Terjadi kesalahan jaringan");
    } finally {
      setIsLoading(false);
    }
  };

  // Filtering Logic
  const filteredData = useMemo(() => {
    return data.filter((r) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const mainMatch = 
          (r.lokasi || "").toLowerCase().includes(q) ||
          (r.personil || "").toLowerCase().includes(q) ||
          (r.keterangan || "").toLowerCase().includes(q) ||
          (r.identitas || "").toLowerCase().includes(q) ||
          (r.namaDanru || "").toLowerCase().includes(q);
        if (!mainMatch) return false;
      }

      if (dateFrom || dateTo) {
        const dt = parseTglID(r.tanggal);
        if (!dt) return false;

        if (dateFrom) {
          const df = new Date(dateFrom);
          df.setHours(0, 0, 0, 0);
          if (dt < df) return false;
        }
        if (dateTo) {
          const dto = new Date(dateTo);
          dto.setHours(23, 59, 59, 999);
          if (dt > dto) return false;
        }
      }

      return true;
    });
  }, [data, searchQuery, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / PER_PAGE));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PER_PAGE;
    return filteredData.slice(start, start + PER_PAGE);
  }, [filteredData, currentPage]);

  const handleGallery = (fotos: string[]) => {
    showGallery(fotos, 0);
  };

  const handlePrint = (row: LaporanRow) => {
    setPrintRows([row]);
  };

  const handleKolektif = () => {
    if (filteredData.length === 0) {
      toast("Tidak ada data untuk dicetak kolektif", "er");
      return;
    }
    setPrintRows(filteredData);
  };

  const handleEdit = (row: LaporanRow) => {
    setEditRow(row);
  };

  const handleDelete = (id?: number) => {
    if (!id) return;
    showModal({
      title: "Konfirmasi Hapus",
      content: <p>Yakin ingin menghapus laporan ini secara permanen?</p>,
      onConfirm: async () => {
        try {
          const res = await fetch("/api/proxy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "deleteLaporan", _ri: id }),
          });
          const result = await res.json();
          if (result.success) {
            toast("Laporan berhasil dihapus.", "ok");
            fetchRekapData();
          } else {
            toast("Gagal: " + result.message, "er");
          }
        } catch (e: any) {
          toast("Error: " + e.message, "er");
        }
      },
      confirmLabel: "Hapus",
      cancelLabel: "Batal",
    });
  };

  if (sessionLoading) return null;

  return (
    <DashboardLayout title="Rekap Laporan" subtitle="Data laporan patroli">
      <div className="fu">
        <Panel
          title="Rekap Laporan"
          icon="fa-table-list"
          extra={
            <div className="fbar-right">
              <span style={{ fontSize: ".66rem", color: "var(--muted)", fontFamily: "var(--mono)" }}>
                {filteredData.length} Data
              </span>
              <button className="bppl" onClick={handleKolektif}>
                <i className="fas fa-print" /> Kolektif
              </button>
            </div>
          }
        >
          {/* Filters Area */}
          <div className="fbar">
            <div className="fsrch" style={{ flex: "2 1 150px" }}>
              <i className="fas fa-search fsi" />
              <input
                className="fctl"
                type="text"
                placeholder="Cari lokasi, personil, keterangan..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <label style={{ fontSize: ".65rem", fontWeight: 700, color: "var(--mid)" }}>Dari:</label>
              <input
                className="fctl"
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <label style={{ fontSize: ".65rem", fontWeight: 700, color: "var(--mid)" }}>S/d:</label>
              <input
                className="fctl"
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <button className="bg2" onClick={() => { setSearchQuery(""); setDateFrom(""); setDateTo(""); setCurrentPage(1); }}>
              <i className="fas fa-rotate-left" />
            </button>
          </div>

          {/* Data Table */}
          <div className="rtbl-wrap" style={{ outline: "none" }}>
            <table className="dtbl">
              <thead>
                <tr>
                  <th className="tc-no">#</th>
                  <th className="tc-ts">Waktu</th>
                  <th className="tc-lok">Lokasi</th>
                  <th className="tc-idn">Pelanggaran</th>
                  <th className="tc-per">Personil</th>
                  <th className="tc-dan">Danru</th>
                  <th className="tc-ndn">Nama Danru</th>
                  <th className="tc-ket">Keterangan</th>
                  <th className="tc-fot">Foto</th>
                  <th className="tc-aks">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: "center", padding: "40px" }}>
                      <i className="fas fa-spinner fa-spin" style={{ fontSize: "1.5rem" }} />
                    </td>
                  </tr>
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={10}>
                      <div className="empty">
                        <i className="fas fa-inbox" />
                        <p>Tidak ada data ditemukan</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row, i) => {
                    const startIdx = (currentPage - 1) * PER_PAGE + i + 1;
                    return (
                      <tr key={i}>
                        <td className="tc-no">{startIdx}</td>
                        <td className="tc-ts">
                          <div style={{ fontFamily: "var(--mono)", fontSize: ".68rem", whiteSpace: "nowrap" }}>
                            {row.tanggal}
                            <div style={{ color: "var(--muted)", fontSize: ".6rem" }}>{row.ts?.split(" ")[1] || ""}</div>
                          </div>
                        </td>
                        <td className="tc-lok" style={{ fontWeight: 600 }}>{row.lokasi}</td>
                        <td className="tc-idn">
                          <span className={`chip ${(!row.identitas || row.identitas.toUpperCase() === "NIHIL") ? "cm" : "cr2"}`}>
                             {row.identitas || "Nihil"}
                          </span>
                        </td>
                        <td className="tc-per">{row.personil}</td>
                        <td className="tc-dan"><span className="chip cb2">{row.danru}</span></td>
                        <td className="tc-ndn">{row.namaDanru}</td>
                        <td className="tc-ket">{row.keterangan || "—"}</td>
                        <td className="tc-fot">
                          {row.fotos && row.fotos.length > 0 ? (
                            <button className="bfot" onClick={() => handleGallery(row.fotos!)}>
                              <i className="fas fa-images" /> {row.fotos.length}
                            </button>
                          ) : "—"}
                        </td>
                        <td className="tc-aks">
                          <div style={{ display: "flex", gap: "5px" }}>
                            <button className="bpdf" onClick={() => handlePrint(row)}><i className="fas fa-file-pdf" /></button>
                            {isAdmin && (
                              <>
                                <button className="be" onClick={() => handleEdit(row)}><i className="fas fa-pen" /></button>
                                <button className="bd" onClick={() => handleDelete(row._ri)}><i className="fas fa-trash" /></button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="mcard-list">
            {paginatedData.map((row, i) => (
              <div key={i} className="mcard-item">
                <div className="mcard-row">
                  <div className="lok-wrap"><span className="lok-trunc">{row.lokasi}</span></div>
                  <span className={`chip ${(!row.identitas || row.identitas.toUpperCase() === "NIHIL") ? "cm" : "cr2"}`}>
                     {row.identitas || "Nihil"}
                  </span>
                </div>
                <div className="mcard-meta">
                  <i className="fas fa-calendar" /> {row.hari}, {row.tanggal} <br/>
                  <i className="fas fa-users" /> {row.personil} <br/>
                  <i className="fas fa-user-shield" /> {row.namaDanru} ({row.danru})
                </div>
                <div className="mcard-acts">
                  {row.fotos && row.fotos.length > 0 && (
                    <button className="bfot" onClick={() => handleGallery(row.fotos!)}>
                      <i className="fas fa-images" /> {row.fotos.length}
                    </button>
                  )}
                  <button className="bpdf" onClick={() => handlePrint(row)}><i className="fas fa-file-pdf" /></button>
                  {isAdmin && (
                    <>
                      <button className="be" onClick={() => handleEdit(row)}><i className="fas fa-pen" /></button>
                      <button className="bd" onClick={() => handleDelete(row._ri)}><i className="fas fa-trash" /></button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="pgw">
            <span>{filteredData.length} data tersedia</span>
            <div className="pbs">
               <button className="pb" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>
                 <i className="fas fa-chevron-left" />
               </button>
               {Array.from({ length: totalPages }, (_, idx) => (
                  <button 
                    key={idx} 
                    className={`pb ${currentPage === idx + 1 ? "on" : ""}`}
                    onClick={() => setCurrentPage(idx + 1)}
                  >
                    {idx + 1}
                  </button>
               )).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
               <button className="pb" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>
                 <i className="fas fa-chevron-right" />
               </button>
            </div>
          </div>
        </Panel>
      </div>

      <EditLaporanModal 
        isOpen={editRow !== null} 
        row={editRow} 
        onClose={() => setEditRow(null)} 
        onSuccess={() => {
          setEditRow(null);
          toast("Laporan berhasil diperbarui", "ok");
          fetchRekapData();
        }} 
      />

      <PdfPrintModal 
        isOpen={printRows.length > 0} 
        rows={printRows} 
        onClose={() => setPrintRows([])} 
      />
    </DashboardLayout>
  );
}

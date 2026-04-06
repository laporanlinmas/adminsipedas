"use client";

import React, { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Panel } from "@/components/ui/DashboardUI";
import { useSession } from "@/context/SessionContext";
import { MemberModal } from "@/components/modals/MemberModal";

interface Member {
  _ri?: number;
  nama: string;
  tglLahir: string;
  unit: string;
  wa: string;
  usia?: number | string;
}

const PER_PAGE = 12;

export default function SatlinmasPage() {
  const { isAdmin, isLoading: sessionLoading } = useSession();
  const [data, setData] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Filters & Pagination
  const [searchName, setSearchName] = useState("");
  const [searchUnit, setSearchUnit] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/proxy?action=getSatlinmas");
      const result = await res.json();
      if (result.success) {
        setData(result.data || []);
      }
    } catch (e) {
      console.error("Gagal memuat data satlinmas", e);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    return data.filter((m) => {
      const nm = searchName.toLowerCase();
      const un = searchUnit.toLowerCase();
      if (nm && !(m.nama || "").toLowerCase().includes(nm)) return false;
      if (un && !(m.unit || "").toLowerCase().includes(un)) return false;
      return true;
    });
  }, [data, searchName, searchUnit]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / PER_PAGE));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PER_PAGE;
    return filteredData.slice(start, start + PER_PAGE);
  }, [filteredData, currentPage]);

  const unitStats = useMemo(() => {
    const stats: Record<string, number> = {};
    data.forEach((m) => {
      const k = m.unit || "Lainnya";
      stats[k] = (stats[k] || 0) + 1;
    });
    return stats;
  }, [data]);

  const handleSave = async (formData: any) => {
    setIsSaving(true);
    try {
      const action = formData._ri ? "updateSatlinmas" : "addSatlinmas";
      const res = await fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...formData }),
      });
      const result = await res.json();
      if (result.success) {
        setIsModalOpen(false);
        fetchData();
      } else {
        alert("Gagal menyimpan: " + result.message);
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id?: number) => {
    if (!id || !confirm("Yakin ingin menghapus anggota ini?")) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteSatlinmas", _ri: id }),
      });
      const result = await res.json();
      if (result.success) {
        fetchData();
      } else {
        alert("Gagal menghapus: " + result.message);
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (sessionLoading) return null;

  return (
    <DashboardLayout title="Data Satlinmas" subtitle="Daftar anggota">
      <div className="fu">
        <Panel
          title="Data Satlinmas Pedestrian"
          icon="fa-users"
          extra={
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <div id="slm-meta" style={{ fontSize: ".62rem", color: "var(--muted)", textAlign: "right" }}>
                Total: <strong>{filteredData.length}</strong> anggota
                <br />
                {Object.entries(unitStats).map(([unit, count]) => (
                  <span key={unit} className="chip cb2" style={{ marginLeft: "4px", fontSize: ".55rem" }}>
                    {unit}: {count}
                  </span>
                ))}
              </div>
              {isAdmin && (
                <button
                  className="bp"
                  onClick={() => {
                    setSelectedMember(null);
                    setIsModalOpen(true);
                  }}
                >
                  <i className="fas fa-user-plus" /> Tambah
                </button>
              )}
            </div>
          }
        >
          {/* Filters */}
          <div className="fbar">
            <div className="fsrch" style={{ flex: "2 1 140px" }}>
              <i className="fas fa-search fsi" />
              <input
                className="fctl"
                type="text"
                placeholder="Cari nama..."
                value={searchName}
                onChange={(e) => {
                  setSearchName(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="fsrch" style={{ flex: "1 1 110px" }}>
              <i className="fas fa-search fsi" />
              <input
                className="fctl"
                type="text"
                placeholder="Cari unit..."
                value={searchUnit}
                onChange={(e) => {
                  setSearchUnit(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <button
              className="bg2"
              onClick={() => {
                setSearchName("");
                setSearchUnit("");
                setCurrentPage(1);
              }}
            >
              <i className="fas fa-rotate-left" />
            </button>
          </div>

          {/* Grid display */}
          <div className="ag-grid">
            {isLoading ? (
              <div className="empty" style={{ gridColumn: "1/-1" }}>
                <i className="fas fa-spinner fa-spin" />
                <p>Memuat data...</p>
              </div>
            ) : paginatedData.length === 0 ? (
              <div className="empty" style={{ gridColumn: "1/-1" }}>
                <i className="fas fa-users" />
                <p>Belum ada data.</p>
              </div>
            ) : (
              paginatedData.map((m, i) => {
                const initial = (m.nama || "?").charAt(0).toUpperCase();
                const unit = (m.unit || "").toLowerCase();
                let avCls = "ag-av";
                if (unit.includes("satpol") || unit.includes("pp")) avCls += " satpol";
                else if (unit.includes("desa")) avCls += " desa";
                else if (unit.includes("kelurahan") || unit.includes("kel ")) avCls += " kel";

                const waLink = m.wa
                  ? `https://wa.me/62${m.wa.replace(/^0/, "").replace(/[^0-9]/g, "")}`
                  : null;

                return (
                  <div className="ag-card" key={i}>
                    <div className={avCls}>{initial}</div>
                    <div className="ag-info">
                      <div className="ag-name">{m.nama}</div>
                      <div className="ag-unit">{m.unit || "—"}</div>
                      <div className="ag-meta">
                        {m.usia && (
                          <span className="ag-pill ag-age">
                            <i className="fas fa-cake-candles" /> {m.usia} thn
                          </span>
                        )}
                        {m.tglLahir && (
                          <span className="ag-pill ag-born">
                            <i className="fas fa-calendar" /> {m.tglLahir}
                          </span>
                        )}
                        {waLink && (
                          <a className="ag-pill ag-wa" href={waLink} target="_blank" rel="noopener">
                            <i className="fab fa-whatsapp" /> {m.wa}
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="ag-act">
                      <button
                        className="ag-btn ag-edit"
                        title="Edit"
                        onClick={() => {
                          setSelectedMember(m);
                          setIsModalOpen(true);
                        }}
                      >
                        <i className="fas fa-pen" />
                      </button>
                      <button
                        className="ag-btn ag-del"
                        title="Hapus"
                        onClick={() => handleDelete(m._ri)}
                      >
                        <i className="fas fa-trash" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          <div className="pgw">
            <span>
              Menampilkan {Math.min(filteredData.length, (currentPage - 1) * PER_PAGE + 1)} -{" "}
              {Math.min(filteredData.length, currentPage * PER_PAGE)} dari {filteredData.length} data
            </span>
            <div className="pbs">
              <button
                className="pb"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <i className="fas fa-chevron-left" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let p = currentPage - 2 + i;
                if (totalPages <= 5) p = i + 1;
                else {
                  if (p < 1) p = i + 1;
                  if (p > totalPages) p = totalPages - 4 + i;
                }
                if (p < 1 || p > totalPages) return null;
                return (
                  <button
                    key={p}
                    className={`pb ${currentPage === p ? "on" : ""}`}
                    onClick={() => setCurrentPage(p)}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                className="pb"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <i className="fas fa-chevron-right" />
              </button>
            </div>
          </div>
        </Panel>
      </div>

      <MemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        member={selectedMember}
        isSaving={isSaving}
      />
    </DashboardLayout>
  );
}

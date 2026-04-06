"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "@/context/SessionContext";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function DashboardLayout({ children, title = "Dashboard", subtitle = "Statistik & grafik data patroli" }: DashboardLayoutProps) {
  const { user, isLoading, logout, isAdmin } = useSession();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Check dark mode from local storage or default to on
    const savedDm = localStorage.getItem("dm");
    if (savedDm === "off") {
      setIsDarkMode(false);
      document.body.classList.remove("dark");
    } else {
      setIsDarkMode(true);
      document.body.classList.add("dark");
    }

    // Check sidebar collapse state
    const savedSb = localStorage.getItem("sb_col");
    if (savedSb === "1") {
      setIsSidebarCollapsed(true);
      document.body.classList.add("sb-off");
    }
  }, []);

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    localStorage.setItem("dm", next ? "on" : "off");
    if (next) document.body.classList.add("dark");
    else document.body.classList.remove("dark");
  };

  const toggleSidebarCollapse = () => {
    const next = !isSidebarCollapsed;
    setIsSidebarCollapsed(next);
    localStorage.setItem("sb_col", next ? "1" : "0");
    if (next) document.body.classList.add("sb-off");
    else document.body.classList.remove("sb-off");
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const isActive = (path: string) => pathname === path;

  if (isLoading) {
    return (
      <div id="lov">
        <div className="spw">
          <div className="spo" />
          <div className="spi" />
        </div>
        <span id="lmsg">Memuat...</span>
      </div>
    );
  }

  if (!user && !isLoading) {
    // Redirect to login or show login screen
    // For now, we'll assume the user is handled by index.html login if they go to /
    // If they are on a subpage like /dashboard, we might want to redirect.
  }

  return (
    <div id="app-wrap">
      <div id="app" className="on">
        {/* Sidebar Overlay for Mobile */}
        <div
          id="mbb"
          style={{ display: isMobileSidebarOpen ? "block" : "none" }}
          onClick={() => setIsMobileSidebarOpen(false)}
        />

        <nav className={`sb ${isMobileSidebarOpen ? "on" : ""}`} id="sidebar">
          <div className="sbbr">
            <img src="/assets/icon-full.png" alt="Logo" />
            <div className="sipedas-glow-sb sb-sipedas">SI-PEDAS</div>
            <div className="sb-subtitle">
              Dashboard Monitoring
              <br />
              Sistem Informasi Pedestrian Satlinmas
            </div>
          </div>
          <div className="sbnv">
            <span className="nslbl">Menu Utama</span>
            <Link href="/dashboard" className={`nb ${isActive("/dashboard") ? "on" : ""}`}>
              <i className="fas fa-gauge-high" /> <span>Dashboard</span>
            </Link>
            <Link href="/rekap" className={`nb ${isActive("/rekap") ? "on" : ""}`}>
              <i className="fas fa-table-list" /> <span>Rekap Laporan</span>
            </Link>
            {isAdmin && (
              <Link href="/input" className={`nb ${isActive("/input") ? "on" : ""}`}>
                <i className="fas fa-plus-circle" /> <span>Input Laporan</span>
              </Link>
            )}

            <span className="nslbl">Data &amp; Peta</span>
            <Link href="/satlinmas" className={`nb ${isActive("/satlinmas") ? "on" : ""}`}>
              <i className="fas fa-users" /> <span>Data Satlinmas</span>
            </Link>
            <Link href="/peta" className={`nb nb-peta ${isActive("/peta") ? "on" : ""}`}>
              <i className="fas fa-map-location-dot" /> <span>Peta Pedestrian</span>
            </Link>

            <span className="nslbl">Panduan</span>
            <Link href="/petunjuk" className={`nb nb-ptk ${isActive("/petunjuk") ? "on" : ""}`}>
              <i className="fas fa-book-open" /> <span>Petunjuk Teknis</span>
            </Link>
            {isAdmin && (
              <Link href="/pengaturan" className={`nb ${isActive("/pengaturan") ? "on" : ""}`}>
                <i className="fas fa-gear" /> <span>Pengaturan</span>
              </Link>
            )}
          </div>
          <div className="sbft">
            <button className="lgout" onClick={logout}>
              <i className="fas fa-right-from-bracket" /> <span>Keluar</span>
            </button>
            <button id="sb-col-btn" onClick={toggleSidebarCollapse}>
              <i className={`fas ${isSidebarCollapsed ? "fa-chevron-right" : "fa-chevron-left"}`} id="sb-col-ico" />
            </button>
          </div>
        </nav>

        <div className="main">
          <div className="topb">
            <div className="tbl">
              <button className="hmb" onClick={toggleMobileSidebar}>
                <i className="fas fa-bars" />
              </button>
              <div>
                <div className="pgtl" id="pgtl">
                  {title}
                </div>
                <div className="pgsb" id="pgsb">
                  {subtitle}
                </div>
              </div>
            </div>
            <div className="tbr">
              <button id="refresh-btn" onClick={() => window.location.reload()}>
                <i className="fas fa-rotate-right" />
              </button>
              <button id="dm-btn" onClick={toggleDarkMode} title="Toggle Dark Mode">
                <i className={`fas ${isDarkMode ? "fa-sun" : "fa-moon"}`} />
              </button>
              {user && (
                <div className="tb-acct" style={{ display: "flex" }}>
                  <div className="tb-av">{(user.namaLengkap || user.username || "?").charAt(0).toUpperCase()}</div>
                  <div className="tb-info">
                    <div className="tb-un">{user.namaLengkap || user.username}</div>
                    <div className="tb-rl">{isAdmin ? "Administrator" : "Pengguna"}</div>
                  </div>
                  <span className={`rbdg ${isAdmin ? "adm" : "usr"}`}>{isAdmin ? "Admin" : "User"}</span>
                </div>
              )}
            </div>
          </div>
          <div className="pa">
            {children}
          </div>

          <nav className="bnav" id="bnav">
            <Link href="/dashboard" className={`bni ${isActive("/dashboard") ? "on" : ""}`}>
              <i className="fas fa-gauge-high" /> <span>Dashboard</span>
            </Link>
            <Link href="/rekap" className={`bni ${isActive("/rekap") ? "on" : ""}`}>
              <i className="fas fa-table-list" /> <span>Rekap</span>
            </Link>
            {isAdmin && (
              <Link href="/input" className={`bni ${isActive("/input") ? "on" : ""}`}>
                <i className="fas fa-plus-circle" /> <span>Input</span>
              </Link>
            )}
            <Link href="/satlinmas" className={`bni ${isActive("/satlinmas") ? "on" : ""}`}>
              <i className="fas fa-users" /> <span>Anggota</span>
            </Link>
            <Link href="/peta" className={`bni bni-peta-ico ${isActive("/peta") ? "on" : ""}`}>
              <i className="fas fa-map-location-dot" /> <span>Peta</span>
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
}

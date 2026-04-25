'use client';

import { useEffect } from 'react';
import { useUI } from '../components/UIContext';
import LoadingOverlay from '../components/LoadingOverlay';
import Gallery from '../components/Gallery';
import Modals from '../components/Modals';
import Login from '../components/Login';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';

// Views — Lama (Pedestrian)
import DashboardView from '../components/views/DashboardView';
import InputView from '../components/views/InputView';
import PetunjukView from '../components/views/PetunjukView';
import SatlinmasView from '../components/views/SatlinmasView';
import RekapView from '../components/views/RekapView';
import PetaView from '../components/views/PetaView';
import SettingsView from '../components/views/SettingsView';

// Views — Baru
import MainDashboardView from '../components/views/MainDashboardView';
import PoskamlingDashboardView from '../components/views/PoskamlingDashboardView';
import PoskamlingDataView from '../components/views/PoskamlingDataView';
import PoskamlingPetaView from '../components/views/PoskamlingPetaView';
import PosyanduDashboardView from '../components/views/PosyanduDashboardView';
import PosyanduDataView from '../components/views/PosyanduDataView';
import PosyanduPetaView from '../components/views/PosyanduPetaView';
import KebencanaanDashboardView from '../components/views/KebencanaanDashboardView';

function Router({ page }) {
  switch (page) {
    // ── Dashboard Utama ──────────────────────────────────
    case 'main':                  return <MainDashboardView />;

    // ── Pedestrian ───────────────────────────────────────
    case 'pedestrian:dashboard':  return <DashboardView />;
    case 'pedestrian:rekap':      return <RekapView />;
    case 'pedestrian:input':      return <InputView />;
    case 'pedestrian:peta':       return <PetaView />;
    case 'pedestrian:satlinmas':  return <SatlinmasView />;
    case 'pedestrian:petunjuk':   return <PetunjukView />;

    // ── Poskamling ───────────────────────────────────────
    case 'poskamling:dashboard':  return <PoskamlingDashboardView />;
    case 'poskamling:data':       return <PoskamlingDataView />;
    case 'poskamling:peta':       return <PoskamlingPetaView />;

    // ── Posyandu ─────────────────────────────────────────
    case 'posyandu:dashboard':    return <PosyanduDashboardView />;
    case 'posyandu:data':         return <PosyanduDataView />;
    case 'posyandu:peta':         return <PosyanduPetaView />;

    // ── Kebencanaan ──────────────────────────────────────
    case 'kebencanaan:dashboard': return <KebencanaanDashboardView />;

    // ── Satlinmas Global ─────────────────────────────────
    case 'satlinmas:data':        return <SatlinmasView />;

    // ── Pengaturan ───────────────────────────────────────
    case 'settings':              return <SettingsView />;

    // ── Fallback (legacy compat) ─────────────────────────
    default:
      return (
        <div className="pa" id="ct" style={{ minHeight: '100%' }}>
          {/* Fallback */}
        </div>
      );
  }
}

export default function Page() {
  const { isSidebarOpen, activePage } = useUI();

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window._initSession === 'function') {
      window._initSession();
    }
  }, []);

  return (
    <>
      <LoadingOverlay />
      <div id="tco"></div>
      <Gallery />
      <Modals />

      <div id="app-wrap" className="w-full min-h-screen relative">
        <Login />
        <div id="app" className="hidden [&.on]:flex min-h-screen">
          <Sidebar />

          <div
            className={`flex-1 min-h-screen flex flex-col overflow-hidden transition-all duration-[260ms] ease-in-out ${
              !isSidebarOpen ? 'ml-0 max-w-full' : 'ml-[268px] max-w-[calc(100vw-268px)]'
            }`}
          >
            <TopBar />

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 dark:bg-[#0f172a]" style={{ height: 'calc(100vh - 60px)' }}>
              <Router page={activePage} />
            </div>

            <BottomNav />
          </div>
        </div>
      </div>
    </>
  );
}

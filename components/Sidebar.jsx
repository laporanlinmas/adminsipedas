'use client';

import { useState } from 'react';
import { useUI } from './UIContext';

// Helper: renders a single nav button
function NavBtn({ icon, label, page, activePage, navigateTo, colorClass = '' }) {
  const isActive = activePage === page;
  return (
    <button
      onClick={() => navigateTo(page)}
      className={`w-full flex items-center gap-2.5 py-[10px] px-3 rounded-lg border border-transparent text-left font-semibold transition-all duration-200 mb-0.5 cursor-pointer hover:translate-x-[3px] group text-[0.82rem] ${
        isActive
          ? `bg-gradient-to-br from-sblue/35 to-sblue/10 text-white border-sblue/40 shadow-[0_4px_15px_rgba(30,111,217,0.22)] ${colorClass}`
          : 'text-white/45 hover:bg-white/10 hover:text-white/95 hover:border-white/5'
      }`}
    >
      <i className={`${icon} w-4 text-center text-[0.88rem] shrink-0 transition-all duration-200 group-hover:scale-110 ${isActive ? 'text-blue-300 opacity-100' : 'opacity-60 group-hover:opacity-100'}`}></i>
      {label}
    </button>
  );
}

// Helper: Accordion Module Group
function ModuleGroup({ icon, label, color, bgColor, children, isOpen, onToggle, activePage, pages }) {
  const isModuleActive = pages.some(p => activePage === p);
  return (
    <div className={`mb-1 rounded-xl overflow-hidden transition-all duration-200 ${isModuleActive ? 'bg-white/[0.04]' : ''}`}>
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between py-[10px] px-3 rounded-xl border border-transparent transition-all duration-200 cursor-pointer group text-[0.82rem] font-bold ${
          isModuleActive
            ? 'text-white/90'
            : 'text-white/50 hover:text-white/80 hover:bg-white/5'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[0.75rem] shrink-0 ${bgColor} ${color}`}>
            <i className={icon}></i>
          </div>
          {label}
          {isModuleActive && (
            <span className="ml-1 w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
          )}
        </div>
        <i className={`fas fa-chevron-down text-[0.7rem] text-white/30 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="pl-3 pr-1 pb-1.5">
          {children}
        </div>
      </div>
    </div>
  );
}

// Sub-nav button (inside accordion)
function SubNavBtn({ icon, label, page, activePage, navigateTo }) {
  const isActive = activePage === page;
  return (
    <button
      onClick={() => navigateTo(page)}
      className={`w-full flex items-center gap-2 py-[8px] px-2.5 rounded-lg border border-transparent text-left font-semibold transition-all duration-200 mb-0.5 cursor-pointer group text-[0.78rem] ${
        isActive
          ? 'bg-sblue/25 text-white border-sblue/30'
          : 'text-white/40 hover:bg-white/8 hover:text-white/80'
      }`}
    >
      <i className={`${icon} w-3.5 text-center text-[0.82rem] shrink-0 transition-all duration-200 group-hover:scale-110 ${isActive ? 'text-blue-300' : 'opacity-55 group-hover:opacity-90'}`}></i>
      {label}
    </button>
  );
}

export default function Sidebar() {
  const { isSidebarOpen, toggleSidebar, activePage, navigateTo } = useUI();

  const [openModule, setOpenModule] = useState(() => {
    // Auto-open the active module on mount
    if (typeof activePage === 'string') {
      if (activePage.startsWith('pedestrian')) return 'pedestrian';
      if (activePage.startsWith('poskamling')) return 'poskamling';
      if (activePage.startsWith('posyandu')) return 'posyandu';
      if (activePage.startsWith('kebencanaan')) return 'kebencanaan';
      if (activePage.startsWith('satlinmas')) return 'satlinmas';
    }
    return null;
  });

  const toggleModule = (mod) => setOpenModule(prev => prev === mod ? null : mod);

  const pedestrianPages = [
    'pedestrian:dashboard', 'pedestrian:rekap', 'pedestrian:input',
    'pedestrian:peta', 'pedestrian:satlinmas', 'pedestrian:petunjuk'
  ];
  const poskamlingPages = ['poskamling:dashboard', 'poskamling:data', 'poskamling:peta'];
  const posyanduPages = ['posyandu:dashboard', 'posyandu:data', 'posyandu:peta'];
  const kebencanaanPages = ['kebencanaan:dashboard'];

  return (
    <>
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[199] md:hidden backdrop-blur-[2px]"
          onClick={toggleSidebar}
        />
      )}

      <nav
        id="sidebar"
        className={`w-[268px] min-w-[268px] bg-gradient-to-b from-[#0a1a35] via-[#081428] to-[#060c1a] flex flex-col fixed top-0 left-0 h-full z-[200] overflow-y-auto overflow-x-hidden border-r border-white/5 shadow-[4px_0_24px_rgba(0,0,0,0.35)] transition-all duration-[260ms] ease-in-out ${
          !isSidebarOpen ? '-translate-x-full !shadow-none' : ''
        }`}
      >
        {/* Logo Header */}
        <div className="pt-[22px] px-4 pb-4 border-b border-white/10 flex flex-col items-center justify-center text-center bg-white/[0.025] relative after:content-[''] after:absolute after:bottom-0 after:left-[15%] after:right-[15%] after:h-px after:bg-gradient-to-r after:from-transparent after:via-sblue/50 after:to-transparent">
          <img src="assets/icon-full.png" alt="" className="w-11 h-11 object-contain drop-shadow-[0_3px_10px_rgba(201,149,15,0.45)] mb-2.5 block mx-auto" />
          <div className="text-[0.90rem] font-black tracking-[0.30em] indent-[0.40em] uppercase bg-gradient-to-br from-[#ffd84d] via-[#ffb020] to-[#ff6b2b] bg-clip-text text-transparent w-full text-center mx-auto leading-none drop-shadow-[0_1px_6px_rgba(255,150,20,0.5)] animate-[sipedasPulse_4s_ease-in-out_infinite] mb-0">SI-PEDAS</div>
          <div className="text-[0.52rem] text-white/25 tracking-[0.04em] leading-[1.6] mt-[7px] font-medium text-center w-full">Sistem Informasi Terpadu Pedestrian<br />Satlinmas Kab. Ponorogo</div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-2 pb-0">
          {/* Dashboard Utama */}
          <span className="text-[0.52rem] font-extrabold tracking-[0.14em] uppercase text-white/20 pt-3 px-2.5 pb-[5px] block">Menu Utama</span>

          <NavBtn
            icon="fas fa-house-chimney"
            label="Dashboard Utama"
            page="main"
            activePage={activePage}
            navigateTo={navigateTo}
          />

          {/* Separator */}
          <div className="h-px bg-white/[0.06] mx-2 my-2"></div>
          <span className="text-[0.52rem] font-extrabold tracking-[0.14em] uppercase text-white/20 px-2.5 pb-[5px] block">Modul</span>

          {/* Pedestrian */}
          <ModuleGroup
            icon="fas fa-person-walking"
            label="Pedestrian"
            color="text-blue-300"
            bgColor="bg-sblue/20"
            isOpen={openModule === 'pedestrian'}
            onToggle={() => toggleModule('pedestrian')}
            activePage={activePage}
            pages={pedestrianPages}
          >
            <SubNavBtn icon="fas fa-gauge-high" label="Dashboard" page="pedestrian:dashboard" activePage={activePage} navigateTo={navigateTo} />
            <SubNavBtn icon="fas fa-table-list" label="Rekap Laporan" page="pedestrian:rekap" activePage={activePage} navigateTo={navigateTo} />
            <SubNavBtn icon="fas fa-plus-circle" label="Input Laporan" page="pedestrian:input" activePage={activePage} navigateTo={navigateTo} />
            <SubNavBtn icon="fas fa-map-location-dot" label="Peta Pedestrian" page="pedestrian:peta" activePage={activePage} navigateTo={navigateTo} />
            <SubNavBtn icon="fas fa-users" label="Data Satlinmas" page="pedestrian:satlinmas" activePage={activePage} navigateTo={navigateTo} />
            <SubNavBtn icon="fas fa-book-open" label="Petunjuk Teknis" page="pedestrian:petunjuk" activePage={activePage} navigateTo={navigateTo} />
          </ModuleGroup>

          {/* Poskamling */}
          <ModuleGroup
            icon="fas fa-shield-halved"
            label="Poskamling"
            color="text-emerald-300"
            bgColor="bg-emerald-600/20"
            isOpen={openModule === 'poskamling'}
            onToggle={() => toggleModule('poskamling')}
            activePage={activePage}
            pages={poskamlingPages}
          >
            <SubNavBtn icon="fas fa-gauge-high" label="Dashboard" page="poskamling:dashboard" activePage={activePage} navigateTo={navigateTo} />
            <SubNavBtn icon="fas fa-table-list" label="Data Poskamling" page="poskamling:data" activePage={activePage} navigateTo={navigateTo} />
            <SubNavBtn icon="fas fa-map-location-dot" label="Peta Poskamling" page="poskamling:peta" activePage={activePage} navigateTo={navigateTo} />
          </ModuleGroup>

          {/* Posyandu */}
          <ModuleGroup
            icon="fas fa-heart-pulse"
            label="Posyandu"
            color="text-rose-300"
            bgColor="bg-rose-600/20"
            isOpen={openModule === 'posyandu'}
            onToggle={() => toggleModule('posyandu')}
            activePage={activePage}
            pages={posyanduPages}
          >
            <SubNavBtn icon="fas fa-gauge-high" label="Dashboard" page="posyandu:dashboard" activePage={activePage} navigateTo={navigateTo} />
            <SubNavBtn icon="fas fa-table-list" label="Data Posyandu" page="posyandu:data" activePage={activePage} navigateTo={navigateTo} />
            <SubNavBtn icon="fas fa-map-location-dot" label="Peta Posyandu" page="posyandu:peta" activePage={activePage} navigateTo={navigateTo} />
          </ModuleGroup>

          {/* Kebencanaan */}
          <ModuleGroup
            icon="fas fa-triangle-exclamation"
            label="Kebencanaan"
            color="text-amber-300"
            bgColor="bg-amber-600/20"
            isOpen={openModule === 'kebencanaan'}
            onToggle={() => toggleModule('kebencanaan')}
            activePage={activePage}
            pages={kebencanaanPages}
          >
            <SubNavBtn icon="fas fa-gauge-high" label="Dashboard" page="kebencanaan:dashboard" activePage={activePage} navigateTo={navigateTo} />
          </ModuleGroup>

          {/* Satlinmas (global) */}
          <div className="h-px bg-white/[0.06] mx-2 my-2"></div>
          <NavBtn
            icon="fas fa-id-card-clip"
            label="Data Satlinmas"
            page="satlinmas:data"
            activePage={activePage}
            navigateTo={navigateTo}
          />

          {/* Pengaturan — Admin only */}
          <button
            onClick={() => navigateTo('settings')}
            className={`w-full flex items-center gap-2.5 py-[10px] px-3 rounded-lg border border-transparent text-left font-semibold transition-all duration-200 mb-0.5 cursor-pointer hover:translate-x-[3px] group text-[0.82rem] adm-only hidden ${
              activePage === 'settings'
                ? 'bg-gradient-to-br from-sblue/35 to-sblue/10 text-white border-sblue/40'
                : 'text-white/45 hover:bg-white/10 hover:text-white/95 hover:border-white/5'
            }`}
            id="nav-set"
          >
            <i className={`fas fa-gear w-4 text-center text-[0.88rem] shrink-0 transition-all duration-200 group-hover:scale-110 ${activePage === 'settings' ? 'text-blue-300 opacity-100' : 'opacity-60 group-hover:opacity-100'}`}></i>
            Pengaturan
          </button>
        </div>

        {/* Footer */}
        <div className="p-2.5 border-t border-white/5 flex items-center gap-2">
          <button
            className="flex-1 flex items-center gap-2.5 py-2.5 px-3 rounded-lg border border-[#c0392b]/20 bg-[#c0392b]/10 text-[#ff7373]/70 text-[0.78rem] font-bold transition-all duration-150 text-left overflow-hidden whitespace-nowrap hover:bg-[#c0392b]/15 hover:text-[#ff9898]"
            onClick={() => { if (typeof window !== 'undefined' && window.doLogout) window.doLogout(); }}
          >
            <i className="fas fa-right-from-bracket text-[0.86rem]"></i> Keluar
          </button>

          <button
            id="sb-col-btn"
            onClick={toggleSidebar}
            className={`flex items-center justify-center bg-white/5 border border-white/10 text-white/40 cursor-pointer transition-all duration-200 hover:bg-white/10 hover:text-white ${
              !isSidebarOpen
                ? 'fixed left-4 bottom-4 z-[201] bg-sblue text-white rounded-xl w-10 h-10 shadow-premium-l border-none'
                : 'w-[34px] min-w-[34px] h-[34px] rounded-lg'
            }`}
          >
            <i className={`fas fa-chevron-left transition-transform duration-300 ${!isSidebarOpen ? 'rotate-180' : ''}`} id="sb-col-ico"></i>
          </button>
        </div>
      </nav>
    </>
  );
}

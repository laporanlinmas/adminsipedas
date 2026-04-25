'use client';

import { useState } from 'react';
import { useUI } from './UIContext';

const MODULE_COLORS = {
  main:        'text-slate-300',
  pedestrian:  'text-blue-400',
  poskamling:  'text-emerald-400',
  posyandu:    'text-rose-400',
  kebencanaan: 'text-amber-400',
  satlinmas:   'text-purple-400',
};

// Extract active module from activePage string
function getActiveModule(page) {
  if (!page || page === 'main' || page === 'settings') return page;
  return page.split(':')[0];
}

export default function BottomNav() {
  const { isMobile, activePage, navigateTo, toggleSidebar } = useUI();
  const [showMore, setShowMore] = useState(false);
  const activeModule = getActiveModule(activePage);

  const btnCls = (mod) => {
    const isActive = activeModule === mod;
    const color = isActive ? MODULE_COLORS[mod] || 'text-sblue' : 'text-slate-500';
    return `flex flex-col items-center gap-0.5 text-[0.52rem] font-bold py-1.5 px-2.5 rounded-xl transition-all duration-200 group ${color} ${isActive ? 'bg-white/[0.06]' : 'hover:bg-white/5 hover:text-white/70'}`;
  };

  const iconCls = (mod) => {
    const isActive = activeModule === mod;
    return `text-[1.05rem] transition-transform duration-200 ${isActive ? '-translate-y-0.5 opacity-100' : 'opacity-65 group-hover:opacity-90'}`;
  };

  return (
    <>
      {/* More menu overlay */}
      {showMore && (
        <div className="fixed inset-0 z-[148]" onClick={() => setShowMore(false)} />
      )}

      {/* "More" panel */}
      {showMore && (
        <div className="fixed bottom-[66px] left-0 right-0 z-[149] mx-3">
          <div className="bg-[#111827]/96 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-[0_-8px_32px_rgba(0,0,0,0.5)] flex flex-col gap-0.5">
            <div className="text-[0.52rem] font-extrabold uppercase tracking-widest text-white/25 px-2 pb-1.5">Menu Lainnya</div>
            {[
              { page: 'posyandu:dashboard', icon: 'fas fa-heart-pulse', label: 'Posyandu', color: 'text-rose-400' },
              { page: 'kebencanaan:dashboard', icon: 'fas fa-triangle-exclamation', label: 'Kebencanaan', color: 'text-amber-400' },
              { page: 'satlinmas:data', icon: 'fas fa-id-card-clip', label: 'Satlinmas', color: 'text-purple-400' },
              { page: 'pedestrian:petunjuk', icon: 'fas fa-book-open', label: 'Petunjuk Teknis', color: 'text-violet-400' },
              { page: 'settings', icon: 'fas fa-gear', label: 'Pengaturan', color: 'text-slate-400' },
            ].map(item => (
              <button
                key={item.page}
                onClick={() => { navigateTo(item.page); setShowMore(false); }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[0.8rem] font-semibold transition-all duration-150 hover:bg-white/8 ${
                  activePage === item.page ? `${item.color} bg-white/[0.06]` : 'text-white/60'
                }`}
              >
                <i className={`${item.icon} w-5 text-center text-[0.9rem] ${item.color}`}></i>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <nav
        id="bnav"
        className={`fixed bottom-0 left-0 w-full bg-[#111827]/95 backdrop-blur-[18px] z-[150] flex justify-around px-1 pt-1 pb-[calc(4px+env(safe-area-inset-bottom))] shadow-[0_-5px_25px_rgba(0,0,0,0.2)] border-t border-white/[0.06] transition-transform duration-300 ease-in-out ${
          isMobile ? 'translate-y-0' : 'translate-y-[110%]'
        }`}
      >
        {/* Dashboard Utama */}
        <button className={btnCls('main')} onClick={() => navigateTo('main')}>
          <i className={`fas fa-house-chimney ${iconCls('main')}`}></i>
          Beranda
        </button>

        {/* Pedestrian */}
        <button className={btnCls('pedestrian')} onClick={() => navigateTo('pedestrian:dashboard')}>
          <i className={`fas fa-person-walking ${iconCls('pedestrian')}`}></i>
          Pedestrian
        </button>

        {/* Poskamling */}
        <button className={btnCls('poskamling')} onClick={() => navigateTo('poskamling:dashboard')}>
          <i className={`fas fa-shield-halved ${iconCls('poskamling')}`}></i>
          Poskamling
        </button>

        {/* Peta (contextual — toggles based on module) */}
        <button
          className="flex flex-col items-center gap-0.5 text-[0.52rem] font-bold py-1.5 px-2.5 rounded-xl transition-all duration-200 text-slate-500 hover:bg-white/5 hover:text-white/70 group"
          onClick={() => {
            // Go to peta of current module
            const mod = activeModule;
            if (mod === 'poskamling') navigateTo('poskamling:peta');
            else if (mod === 'posyandu') navigateTo('posyandu:peta');
            else navigateTo('pedestrian:peta');
          }}
        >
          <i className="fas fa-map-location-dot text-[1.05rem] opacity-65 group-hover:opacity-90 transition-all duration-200"></i>
          Peta
        </button>

        {/* More */}
        <button
          className={`flex flex-col items-center gap-0.5 text-[0.52rem] font-bold py-1.5 px-2.5 rounded-xl transition-all duration-200 group ${showMore ? 'text-white bg-white/[0.06]' : 'text-slate-500 hover:bg-white/5 hover:text-white/70'}`}
          onClick={() => setShowMore(prev => !prev)}
        >
          <i className={`fas fa-ellipsis text-[1.05rem] transition-all duration-200 ${showMore ? 'opacity-100' : 'opacity-65 group-hover:opacity-90'}`}></i>
          Lainnya
        </button>
      </nav>
    </>
  );
}

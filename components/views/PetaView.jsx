'use client';

import { useEffect, useRef } from 'react';
import { useUI } from '../UIContext';

export default function PetaView() {
  const { isMobile } = useUI();
  const isLoaded = useRef(false);

  useEffect(() => {
    // Only load once
    if (typeof window !== 'undefined' && window.loadPeta && !isLoaded.current) {
      // Small timeout to ensure DOM is ready
      setTimeout(() => {
        if (document.getElementById('ct')) {
          window.loadPeta();
          isLoaded.current = true;
        }
      }, 100);
    }

    return () => {
      // Cleanup Leaflet when unmounting
      if (typeof window !== 'undefined' && window._destroyLeaflet) {
        window._destroyLeaflet();
      }
    };
  }, []);

  return (
    <div 
      className={`w-full relative overflow-hidden bg-slate-50 dark:bg-[#0f172a] ${isMobile ? 'h-[calc(100dvh-126px)]' : 'h-[calc(100vh-60px)]'}`}
      id="ct"
    >
      {/* Leaflet map and PDF tools will be injected here by peta.js */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400 font-bold h-full">
        <i className="fas fa-spinner fa-spin text-3xl mb-3"></i>
        <p>Memuat Peta Pemetaan...</p>
      </div>
    </div>
  );
}

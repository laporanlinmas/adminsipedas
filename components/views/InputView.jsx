'use client';

import { useUI } from '../UIContext';

export default function InputView() {
  const { isMobile } = useUI();
  
  // URL iframe input
  const inputUrl = typeof window !== 'undefined' && typeof window.getInputEmbedUrl === 'function' 
    ? window.getInputEmbedUrl() 
    : '/api/input-embed';

  return (
    <div className={`w-full max-w-[1400px] mx-auto p-1 md:p-2 animate-[fadeIn_0.3s_ease] ${isMobile ? 'h-[calc(100dvh-126px)]' : 'h-[calc(100vh-118px)]'}`}>
      <div className="w-full h-full min-h-[420px] md:min-h-[560px] border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-theme-card relative shadow-sm">
        <iframe
          src={inputUrl}
          title="Input Laporan SI-PEDAS"
          loading="eager"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="camera; microphone; geolocation; clipboard-read; clipboard-write"
          allowFullScreen
          className="w-full h-full border-none block relative z-10"
        />
      </div>
    </div>
  );
}

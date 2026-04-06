import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SI-PEDAS — Sistem Informasi Pedestrian Satlinmas",
  description: "Dashboard Monitoring SI-PEDAS",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/assets/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/icon-192.png", sizes: "192x192", type: "image/png" }
    ],
    apple: [{ url: "/assets/icon-192.png" }]
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1e293b"
};

import { SessionProvider } from "@/context/SessionContext";
import { UIProvider } from "@/context/UIContext";
import Script from "next/script";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
          rel="stylesheet"
        />
        {/* Leaflet CSS */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css"
        />
        
        {/* Supporting JS */}
        <Script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js" strategy="afterInteractive" />
        <Script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" strategy="afterInteractive" />
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.js" strategy="afterInteractive" />
        <Script src="https://cdn.jsdelivr.net/npm/exif-js" strategy="afterInteractive" />
        <Script src="https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js" strategy="afterInteractive" />
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                  .then(function(reg) { console.log('[SW] Terdaftar:', reg.scope); })
                  .catch(function(err) { console.warn('[SW] Gagal:', err); });
              });
            }
          `}
        </Script>
      </head>
      <body>
        <SessionProvider>
          <UIProvider>
            {children}
          </UIProvider>
        </SessionProvider>
      </body>
    </html>
  );
}


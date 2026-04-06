# 🛡️ SI-PEDAS (Next.js Edition)
### Sistem Informasi Pedestrian Satlinmas — Monitoring Dashboard

> Versi modern SI-PEDAS yang telah dimigrasi dari Vanilla JS ke **Next.js 14 (App Router) + TypeScript**. Dashboard monitoring resmi untuk kegiatan patroli pedestrian Satuan Perlindungan Masyarakat (Satlinmas).

---

## ✨ Fitur Unggulan (React Native Port)

| Fitur | Deskripsi |
|---|---|
| 📉 **Dashboard Real-time** | Statistik agregat, tren mingguan, dan grafik lokasi patroli terpopuler. |
| 📋 **Rekap Laporan** | Tabel data dengan filter tanggal, pencarian, dan fitur cetak PDF otomatis. |
| 📱 **Mobile Reporting** | Antarmuka khusus mobile dengan pengolahan foto native (watermark + compress) di sisi client. |
| 👥 **Data Satlinmas** | Manajemen data anggota Satlinmas dengan filter unit dan usia. |
| 🗺️ **Peta Interaktif** | Visualisasi area pedestrian menggunakan Leaflet.js dengan foto marker real-time. |
| 🔐 **Autentikasi Aman** | Login berbasis role (Admin/User) dengan integrasi Session Context. |

---

## 🛠️ Stack Teknologi

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Bahasa**: [TypeScript](https://www.typescriptlang.org/) (Type-safe core)
- **Styling**: Vanilla CSS (Premium Custom Design)
- **Charts**: [Chart.js](https://www.chartjs.org/) v4.4
- **Maps**: [Leaflet.js](https://leafletjs.com/)
- **Backend API**: Native Next.js API Routes (Proxying Google Sheets & Drive)
- **Database**: Google Sheets (via official `googleapis`)
- **Penyimpanan**: Google Drive (Auto-upload via Service Account)

---

## ⚙️ Konfigurasi Environment (Vercel)

Tambahkan variabel berikut di **Vercel Project Settings**:

```bash
# Google Cloud Credentials
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# Google Sheets IDs
SPREADSHEET_ID=your-spreadsheet-id-laporan

# Google Drive IDs
FOLDER_ID_FOTO=your-drive-folder-id

# External Form (Optional)
INPUT_EMBED_URL=https://laporsipedas.vercel.app/input
```

---

## 📂 Struktur Folder Modern

```text
monitorsipedas/
├── app/                # Next.js 14 App Router (Pages & API)
│   ├── api/proxy/      # Backend Service Proxy (The Heart of API)
│   ├── dashboard/      # Main Dashboard View
│   ├── rekap/          # Data Rekap Laporan
│   ├── mobile/         # Native Mobile Reporting Module
│   └── peta/           # Interactive Map Module
├── src/
│   ├── components/     # UI & Dashboard Shared Components
│   ├── context/        # UIContext (Toasts/Modals) & SessionContext
│   ├── server/         # sheetsService & driveService (Native TS)
│   └── utils/          # Date, Image Processor, & WA Parser
└── public/             # Static Assets (Manifest & Logos)
```

---

## 🚀 Pengembangan Lokal

```bash
# 1. Install dependencies
npm install

# 2. Jalankan server development
npm run dev
```

---

## 📄 Lisensi

© 2026 **Bidang SDA dan Linmas**. Dikembangkan dengan ❤️ untuk kemudahan monitoring Satlinmas.

---
<p align="center">
  <strong>Native React Migration Complete — Optimal & Smooth</strong>
</p>

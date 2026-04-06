import { google, sheets_v4 } from "googleapis";
import { Readable } from "stream";
import { Buffer } from "buffer";

/**
 * Type definitions for SheetsService results.
 */
export interface SheetResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
}

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive"
];

/**
 * SheetsService handles all Google Sheets and Drive interactions for SI-PEDAS.
 * Achieves 100% functional parity with legacy SI-PEDAS systems.
 */
class SheetsService {
  private auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    },
    scopes: SCOPES,
  });

  private sheets = google.sheets({ version: "v4", auth: this.auth });
  private drive = google.drive({ version: "v3", auth: this.auth });
  private spreadsheetId = process.env.SPREADSHEET_ID || "";
  private folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || "";
  private folderCache: Record<string, string> = {};

  success<T>(data: T = null as any, message = "Success"): SheetResponse<T> {
    return { success: true, data, message };
  }

  error(message = "An error occurred"): SheetResponse<null> {
    return { success: false, data: null, message };
  }

  // ==========================================================================
  // AUTH & USERS
  // ==========================================================================
  async checkLogin(u: string, p: string) {
    try {
      const res = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: "Users!A:E",
      });
      const rows = res.data.values || [];
      const user = rows.find((r: any) => r[0] === u && r[1] === p);
      if (user) return this.success({ username: user[0], role: user[2], nama: user[3] });
      return this.error("Username atau password salah");
    } catch (e: any) { return this.error(e.message); }
  }

  async changePassword(oldPass: string, newPass: string, username: string) {
    try {
      const res = await this.sheets.spreadsheets.values.get({ spreadsheetId: this.spreadsheetId, range: "Users!A:E" });
      const rows = res.data.values || [];
      const idx = rows.findIndex((r: any) => r[0] === username && r[1] === oldPass);
      if (idx < 0) return this.error("Password lama tidak sesuai");
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `Users!B${idx + 1}`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [[newPass]] },
      });
      return this.success(null, "Password berhasil diubah");
    } catch (e: any) { return this.error(e.message); }
  }

  async createAccount(p: any) {
    try {
      const values = [[p.username, p.password, p.role||"viewer", p.nama||p.username, p.email||""]];
      await this.sheets.spreadsheets.values.append({ spreadsheetId: this.spreadsheetId, range: "Users!A:E", valueInputOption: "USER_ENTERED", requestBody: { values } });
      return this.success(null);
    } catch (e: any) { return this.error(e.message); }
  }

  // ==========================================================================
  // DASHBOARD & REKAP
  // ==========================================================================
  async getDashboardData() {
    try {
      const respL = await this.sheets.spreadsheets.values.get({ spreadsheetId: this.spreadsheetId, range: "Laporan!A2:L" });
      const respS = await this.sheets.spreadsheets.values.get({ spreadsheetId: this.spreadsheetId, range: "Satlinmas!A2:F" });
      const laporanRows = respL.data.values || [];
      const satlinmasRows = respS.data.values || [];
      const now = new Date();
      const perHari: Record<string, number> = {};
      for (let i = 0; i < 7; i++) {
        const d = new Date(now); d.setDate(d.getDate() - i);
        const ds = d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
        perHari[ds] = 0;
      }
      laporanRows.forEach((r: any[]) => { const tgl = r[3]; if (perHari[tgl] !== undefined) perHari[tgl]++; });
      const perHariArr = Object.entries(perHari).map(([hari, n]) => ({ hari, n })).reverse();
      const locMap: Record<string, number> = {};
      laporanRows.forEach((r: any[]) => { const loc = r[1]; if (loc) locMap[loc] = (locMap[loc] || 0) + 1; });
      const perLokasi = Object.entries(locMap).map(([lokasi, n]) => ({ lokasi, n })).sort((a, b) => b.n - a.n).slice(0, 10);
      return this.success({ totalLaporan: laporanRows.length, totalSatlinmas: satlinmasRows.length, perHari: perHariArr, perLokasi });
    } catch (e: any) { return this.error(e.message); }
  }

  async getRekapData(filter: { q?: string; tglFrom?: string; tglTo?: string } = {}) {
    try {
      const res = await this.sheets.spreadsheets.values.get({ spreadsheetId: this.spreadsheetId, range: "Laporan!A2:ZZ" });
      const rows = res.data.values;
      if (!rows || rows.length === 0) return this.success([]);
      
      let mapped = rows.map((r: any[], i: number) => ({
        _ri: i + 2,
        ts: r[0], lokasi: r[1], hari: r[2], tanggal: r[3], identitas: r[4], personil: r[5],
        danru: r[6], namaDanru: r[7], keterangan: r[8],
        fotos: (r[9] ? [r[9]] : []).concat(r.slice(11).filter(Boolean))
      }));

      if (filter.q) {
        const q = filter.q.toLowerCase();
        mapped = mapped.filter((r: any) => r.lokasi?.toLowerCase().includes(q) || r.keterangan?.toLowerCase().includes(q) || r.namaDanru?.toLowerCase().includes(q));
      }

      return this.success(mapped.reverse());
    } catch (e: any) { return this.error(e.message); }
  }

  async getDetailFotoMarkers() {
    try {
      const res = await this.getRekapData();
      if (!res.success) return res;
      return this.success((res.data as any[]).filter((m: any) => m.fotos.length > 0));
    } catch (e: any) { return this.error(e.message); }
  }

  // ==========================================================================
  // REPORTS (Laporan)
  // ==========================================================================
  async addLaporan(p: any) {
    try {
      const now = new Date();
      const ts = now.toLocaleString("en-ID", { timeZone: "Asia/Jakarta" });
      const mainUrl = p.fotos && p.fotos.length > 0 ? p.fotos[0] : "";
      const row = [ts, p.lokasi||"", p.hari||"", p.tanggal||"", p.identitas||"", p.personil||"", p.danru||"", p.namaDanru||"", p.keterangan||"", mainUrl, p.fotos?.length||0];
      if (p.fotos && p.fotos.length > 0) row.push(...p.fotos);
      await this.sheets.spreadsheets.values.append({ spreadsheetId: this.spreadsheetId, range: "Laporan!A:A", valueInputOption: "USER_ENTERED", requestBody: { values: [row] } });
      if (p.detailedPhotos) { for (const dp of p.detailedPhotos) await this.addDetailFoto(dp, p.tanggal, p.namaDanru); }
      return this.success(null, "Laporan disimpan");
    } catch (e: any) { return this.error(e.message); }
  }

  async updateLaporan(p: any) {
    try {
      const { _ri, ...data } = p;
      const row = [data.ts, data.lokasi, data.hari, data.tanggal, data.identitas, data.personil, data.danru, data.namaDanru, data.keterangan, (data.fotos||[])[0]||"", (data.fotos||[]).length];
      if (data.fotos && data.fotos.length > 0) row.push(...data.fotos);
      await this.sheets.spreadsheets.values.update({ spreadsheetId: this.spreadsheetId, range: `Laporan!A${_ri}:ZZ${_ri}`, valueInputOption: "USER_ENTERED", requestBody: { values: [row] } });
      return this.success(null, "Laporan diperbarui");
    } catch (e: any) { return this.error(e.message); }
  }

  async deleteLaporan(ri: number) {
    try {
      await this.sheets.spreadsheets.values.clear({ spreadsheetId: this.spreadsheetId, range: `Laporan!A${ri}:ZZ${ri}` });
      return this.success(null, "Laporan dihapus");
    } catch (e: any) { return this.error(e.message); }
  }

  async addDetailFoto(dp: any, tgl: string, danru: string) {
    try {
      const ts = new Date().toLocaleString("en-ID", { timeZone: "Asia/Jakarta" });
      const m = dp.meta || {};
      const row = [ts, tgl, danru, dp.namaFile||"", dp.sumber||"MOBILE", m.hasGps?"Ya":"Tidak", m.lat||"-", m.lng||"-", m.lat?`https://www.google.com/maps?q=${m.lat},${m.lng}`:"-", m.datetime||"-", m.address||"-", "", dp.linkDrive||""];
      await this.sheets.spreadsheets.values.append({ spreadsheetId: this.spreadsheetId, range: "'Detail Foto'!A:A", valueInputOption: "USER_ENTERED", requestBody: { values: [row] } });
    } catch (e) { console.error("Detail foto log fail:", e); }
  }

  // ==========================================================================
  // DRAFTS
  // ==========================================================================
  async saveDraft(p: any) {
    try {
      const ts = new Date().toLocaleString("en-ID", { timeZone: "Asia/Jakarta" });
      const row = [p.id || Date.now().toString(), ts, JSON.stringify({ text: p.text, photos: p.photos })];
      await this.sheets.spreadsheets.values.append({ spreadsheetId: this.spreadsheetId, range: "'Draft Temp'!A:A", valueInputOption: "USER_ENTERED", requestBody: { values: [row] } });
      return this.success(null);
    } catch (e: any) { return this.error(e.message); }
  }

  async listDrafts() {
    try {
      const res = await this.sheets.spreadsheets.values.get({ spreadsheetId: this.spreadsheetId, range: "'Draft Temp'!A2:C" });
      const rows = res.data.values || [];
      const mapped = rows.map((r: any[]) => ({ id: r[0], ts: r[1], data: JSON.parse(r[2] || "{}") })).reverse();
      return this.success(mapped);
    } catch (e: any) { return this.error(e.message); }
  }

  async getDraftById(id: string) {
    try {
      const res = await this.listDrafts();
      if (!res.success) return res;
      const d = (res.data as any[]).find((x: any) => x.id === id);
      return d ? this.success(d) : this.error("Not found");
    } catch (e: any) { return this.error(e.message); }
  }

  async deleteDraft(id: string) {
    try {
      const res = await this.sheets.spreadsheets.values.get({ spreadsheetId: this.spreadsheetId, range: "'Draft Temp'!A:A" });
      const rows = res.data.values || [];
      const ri = rows.findIndex((r: any[]) => r[0] === id);
      if (ri === -1) return this.error("Not found");
      const meta = await this.sheets.spreadsheets.get({ spreadsheetId: this.spreadsheetId });
      const sId = (meta.data.sheets || []).find((s: sheets_v4.Schema$Sheet) => s.properties?.title === "Draft Temp")?.properties?.sheetId;
      if (sId === undefined || sId === null) return this.error("Meta error");
      await this.sheets.spreadsheets.batchUpdate({ spreadsheetId: this.spreadsheetId, requestBody: { requests: [{ deleteDimension: { range: { sheetId: sId, dimension: "ROWS", startIndex: ri, endIndex: ri + 1 } } }] } });
      return this.success(null);
    } catch (e: any) { return this.error(e.message); }
  }

  // ==========================================================================
  // PHOTO UPLOAD (Drive)
  // ==========================================================================
  async getOrCreateFolder(monthYear: string) {
    if (this.folderCache[monthYear]) return this.folderCache[monthYear];
    try {
      const res = await this.drive.files.list({ q: `name = '${monthYear}' and '${this.folderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`, fields: "files(id)" });
      if (res.data.files && res.data.files.length > 0) {
        this.folderCache[monthYear] = res.data.files[0].id!;
        return this.folderCache[monthYear];
      }
      const folder = await this.drive.files.create({ requestBody: { name: monthYear, parent: [this.folderId], mimeType: "application/vnd.google-apps.folder" } as any, fields: "id" });
      this.folderCache[monthYear] = folder.data.id!;
      return this.folderCache[monthYear];
    } catch (e) { return this.folderId; }
  }

  async uploadFoto(p: any) {
    try {
      const b64 = p.data || (p.foto && p.foto.data) || "";
      const fName = p.fileName || `SIPEDAS_${Date.now()}.jpg`;
      const now = new Date();
      const monthYear = now.toLocaleString("id-ID", { month: "long", year: "numeric" });
      const targetFolder = await this.getOrCreateFolder(monthYear);
      const bData = b64.includes(",") ? b64.split(",")[1] : b64;
      const buffer = Buffer.from(bData, "base64");
      const media = { mimeType: "image/jpeg", body: Readable.from(buffer) };
      const file = await this.drive.files.create({ requestBody: { name: fName, parents: [targetFolder] }, media, fields: "id, webViewLink" });
      await this.drive.permissions.create({ fileId: file.data.id!, requestBody: { role: "reader", type: "anyone" } });
      return this.success({ id: file.data.id, linkFile: file.data.webViewLink, namaFile: fName });
    } catch (e: any) { return this.error(e.message); }
  }

  // ==========================================================================
  // HTML GENERATION
  // ==========================================================================
  generateLaporanHtml(p: any) {
    const { lokasi, hari, tanggal, identitas, personil, danru, namaDanru, keterangan, fotos = [], settings = {} } = p;
    const sptNo = settings.sptNo || "";
    const html = `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><title>Laporan Patroli</title>
<style>body{font-family:Arial,sans-serif;font-size:12pt;margin:20mm}table{width:100%;border-collapse:collapse}td,th{border:1px solid #000;padding:6px}h2{text-align:center}.foto-grid img{max-width:200px;margin:4px}.sig{margin-top:30px;text-align:right}</style>
</head><body>
<h2>LAPORAN HASIL PATROLI</h2>
${sptNo ? `<p><strong>No. SPT:</strong> ${sptNo}</p>` : ""}
<table>
  <tr><td><strong>Lokasi</strong></td><td>${lokasi || "-"}</td></tr>
  <tr><td><strong>Hari</strong></td><td>${hari || "-"}</td></tr>
  <tr><td><strong>Tanggal</strong></td><td>${tanggal || "-"}</td></tr>
  <tr><td><strong>Identitas</strong></td><td>${identitas || "-"}</td></tr>
  <tr><td><strong>Personil</strong></td><td>${personil || "-"}</td></tr>
  <tr><td><strong>Danru</strong></td><td>${danru || "-"}</td></tr>
  <tr><td><strong>Nama Danru</strong></td><td>${namaDanru || "-"}</td></tr>
  <tr><td><strong>Keterangan</strong></td><td>${keterangan || "-"}</td></tr>
</table>
${fotos.length > 0 ? `<h3>Foto Dokumentasi</h3><div class="foto-grid">${fotos.map((f: string) => `<img src="${f}" />`).join("")}</div>` : ""}
<div class="sig"><p>Mengetahui,</p><br/><br/><p><strong>${namaDanru || ""}</strong></p></div>
</body></html>`;
    return this.success(html);
  }

  generateKolektifHtml(p: any) {
    const { rows = [], settings = {} } = p;
    const sptNo = settings.sptNo || "";
    const rowsHtml = rows.map((r: any, idx: number) => `<tr><td>${idx+1}</td><td>${r.tanggal||"-"}</td><td>${r.lokasi||"-"}</td><td>${r.personil||"-"}</td><td>${r.danru||"-"}</td><td>${r.keterangan||"-"}</td></tr>`).join("");
    const html = `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><title>Rekap Kolektif</title>
<style>body{font-family:Arial,sans-serif;font-size:11pt;margin:15mm}table{width:100%;border-collapse:collapse}td,th{border:1px solid #000;padding:5px}h2{text-align:center}.sig{margin-top:30px;text-align:right}</style>
</head><body>
<h2>REKAP LAPORAN PATROLI SATLINMAS</h2>
${sptNo ? `<p><strong>No. SPT:</strong> ${sptNo}</p>` : ""}
<table><thead><tr><th>No</th><th>Tanggal</th><th>Lokasi</th><th>Personil</th><th>Danru</th><th>Keterangan</th></tr></thead><tbody>${rowsHtml}</tbody></table>
<div class="sig"><p>Mengetahui,</p><br/><br/><p><strong>Kepala Satuan Linmas</strong></p></div>
</body></html>`;
    return this.success(html);
  }

  // ==========================================================================
  // MANAGEMENT (Satlinmas, Peta, Settings)
  // ==========================================================================
  async getSatlinmasData() {
    try {
      const res = await this.sheets.spreadsheets.values.get({ spreadsheetId: this.spreadsheetId, range: "Satlinmas!A2:F" });
      const rows = res.data.values || [];
      return this.success(rows.map((r: any[], i: number) => ({ _ri: i + 2, id: r[0], nama: r[1], jabatan: r[2], noHp: r[3], foto: r[4], status: r[5] })));
    } catch (e: any) { return this.error(e.message); }
  }

  async addSatlinmas(p: any) {
    try {
      const values = [[p.nama, p.telp, p.alamat, p.jabatan, p.tglLahir, p.unit]];
      await this.sheets.spreadsheets.values.append({ spreadsheetId: this.spreadsheetId, range: "Satlinmas!A:F", valueInputOption: "USER_ENTERED", requestBody: { values } });
      return this.success(null);
    } catch (e: any) { return this.error(e.message); }
  }

  async updateSatlinmas(p: any) {
    try {
      const { _ri, ...d } = p;
      const values = [[d.nama, d.telp, d.alamat, d.jabatan, d.tglLahir, d.unit]];
      await this.sheets.spreadsheets.values.update({ spreadsheetId: this.spreadsheetId, range: `Satlinmas!A${_ri}:F${_ri}`, valueInputOption: "USER_ENTERED", requestBody: { values } });
      return this.success(null);
    } catch (e: any) { return this.error(e.message); }
  }

  async deleteSatlinmas(ri: number) {
    try {
      await this.sheets.spreadsheets.values.clear({ spreadsheetId: this.spreadsheetId, range: `Satlinmas!A${ri}:F${ri}` });
      return this.success(null);
    } catch (e: any) { return this.error(e.message); }
  }

  async getLayerPeta() {
    try {
      const res = await this.sheets.spreadsheets.values.get({ spreadsheetId: this.spreadsheetId, range: "Peta!A2:F" });
      const rows = res.data.values || [];
      return this.success(rows.map((r: any[], i: number) => ({ _ri: i + 2, id: r[0], nama: r[1], kategori: r[2], tipe: r[3], data: r[4], warna: r[5], ikon: r[6], visible: r[7] === "TRUE" })));
    } catch (e: any) { return this.error(e.message); }
  }

  async addLayerPeta(p: any) {
    try {
      const values = [[p.nama, p.tipe, p.koordinat, p.warna, p.tebal, "TRUE"]];
      await this.sheets.spreadsheets.values.append({ spreadsheetId: this.spreadsheetId, range: "Peta!A:F", valueInputOption: "USER_ENTERED", requestBody: { values } });
      return this.success(null);
    } catch (e: any) { return this.error(e.message); }
  }

  async updateLayerPeta(p: any) {
    try {
      const { _ri, ...d } = p;
      const values = [[d.nama, d.tipe, d.koordinat, d.warna, d.tebal, d.aktif ? "TRUE" : "FALSE"]];
      await this.sheets.spreadsheets.values.update({ spreadsheetId: this.spreadsheetId, range: `Peta!A${_ri}:F${_ri}`, valueInputOption: "USER_ENTERED", requestBody: { values } });
      return this.success(null);
    } catch (e: any) { return this.error(e.message); }
  }

  async deleteLayerPeta(ri: number) {
    try {
      await this.sheets.spreadsheets.values.clear({ spreadsheetId: this.spreadsheetId, range: `Peta!A${ri}:F${ri}` });
      return this.success(null);
    } catch (e: any) { return this.error(e.message); }
  }

  async toggleLayerAktif(ri: number, v: boolean) {
    try {
      await this.sheets.spreadsheets.values.update({ spreadsheetId: this.spreadsheetId, range: `Peta!F${ri}`, valueInputOption: "USER_ENTERED", requestBody: { values: [[v ? "TRUE" : "FALSE"]] } });
      return this.success(null);
    } catch (e: any) { return this.error(e.message); }
  }

  async getSettings() {
    try {
      const res = await this.sheets.spreadsheets.values.get({ spreadsheetId: this.spreadsheetId, range: "Settings!A2:B" });
      const rows = res.data.values || [];
      const s: Record<string, string> = {};
      rows.forEach((r: any[]) => { if (r[0]) s[r[0]] = r[1] || ""; });
      return this.success(s);
    } catch (e: any) { return this.error(e.message); }
  }

  async saveSettings(p: any) {
    try {
      const entries = Object.entries(p).filter(([k]) => k !== "action");
      const values = entries.map(([k, v]) => [k, String(v)]);
      await this.sheets.spreadsheets.values.clear({ spreadsheetId: this.spreadsheetId, range: "Settings!A2:B" });
      await this.sheets.spreadsheets.values.update({ spreadsheetId: this.spreadsheetId, range: "Settings!A2", valueInputOption: "USER_ENTERED", requestBody: { values } });
      return this.success(null);
    } catch (e: any) { return this.error(e.message); }
  }

  async initAllSheets() {
    try {
      const req = ["Laporan", "Satlinmas", "Peta", "GambarPeta", "Users", "Settings", "Detail Foto", "Draft Temp"];
      const meta = await this.sheets.spreadsheets.get({ spreadsheetId: this.spreadsheetId });
      const existing = (meta.data.sheets || []).map((s: sheets_v4.Schema$Sheet) => s.properties?.title || "");
      const toCreate = req.filter(s => !existing.includes(s));
      if (toCreate.length === 0) return this.success(null);
      await this.sheets.spreadsheets.batchUpdate({ spreadsheetId: this.spreadsheetId, requestBody: { requests: toCreate.map(title => ({ addSheet: { properties: { title } } })) } });
      return this.success(null);
    } catch (e: any) { return this.error(e.message); }
  }

  async getGambarPeta() {
    try {
      const res = await this.sheets.spreadsheets.values.get({ spreadsheetId: this.spreadsheetId, range: "GambarPeta!A2:C" });
      const rows = res.data.values || [];
      return this.success(rows.map((r: any[], i: number) => ({ _ri: i + 2, nama: r[0], tipe: r[1], geojson: r[2] })));
    } catch (e: any) { return this.error(e.message); }
  }

  async saveGambarPeta(d: any[]) {
    try {
      await this.sheets.spreadsheets.values.clear({ spreadsheetId: this.spreadsheetId, range: "GambarPeta!A2:C" });
      if (d && d.length > 0) {
        const values = d.map(x => [x.nama, x.tipe, x.geojson]);
        await this.sheets.spreadsheets.values.update({ spreadsheetId: this.spreadsheetId, range: "GambarPeta!A2", valueInputOption: "USER_ENTERED", requestBody: { values } });
      }
      return this.success(null);
    } catch (e: any) { return this.error(e.message); }
  }

  async deleteGambarPeta(ri: number) {
    try {
      await this.sheets.spreadsheets.values.clear({ spreadsheetId: this.spreadsheetId, range: `GambarPeta!A${ri}:C${ri}` });
      return this.success(null);
    } catch (e: any) { return this.error(e.message); }
  }
}

export const sheetsService = new SheetsService();

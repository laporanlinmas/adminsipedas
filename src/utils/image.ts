import QRCode from 'qrcode';
import { ExifData, fmtExifTime, nowFull } from './exif';
import { AddrResult } from './geocoding';

/**
 * Utility for sophisticated photo processing (Resizing, Advanced Watermarking, and Compression).
 * Features 100% functional parity with the SI-PEDAS legacy system.
 */

interface WatermarkState {
  wmCam: boolean;
  wmGal: boolean;
  minimap: boolean;
  loc: { jalan: string; nodukuh: string; desa: string; kec: string; kab: string; prov: string };
  lat: string;
  lng: string;
}

export function getManualLoc(S: WatermarkState): string {
  const p: string[] = [];
  if (S.loc.jalan) {
    let j = S.loc.jalan;
    if (S.loc.nodukuh) j += ' / ' + S.loc.nodukuh;
    p.push(j);
  } else if (S.loc.nodukuh) {
    p.push(S.loc.nodukuh);
  }
  if (S.loc.desa) p.push(S.loc.desa);
  if (S.loc.kec) p.push('Kec. ' + S.loc.kec);
  if (S.loc.kab) p.push(S.loc.kab);
  if (S.loc.prov) p.push(S.loc.prov);
  p.push('Indonesia');
  return p.length > 1 ? p.join(', ') : 'Ponorogo, Jawa Timur, Indonesia';
}

/**
 * Extracts unit leader name from report text.
 */
export function getDanru(reportText: string): string {
  if (!reportText) return '—';
  const t = reportText.replace(/[*_~`]/g, '').trim();
  let nama = '';
  // 1. Danru N (Nama)
  const m1 = /Danru\s*\d*\s*\(\s*(.*?)\s*\)/i.exec(t);
  if (m1) nama = m1[1];
  // 2. Danru Nama / Danru N Nama
  if (!nama) {
    const m2 = /Danru\s+(?:\d+\s*)?([A-Za-z\s.]+)/i.exec(t);
    if (m2) nama = m2[1];
  }
  if (!nama.trim()) return '—';
  return nama.trim().replace(/\b\w/g, (c) => c.toUpperCase());
}

function wrapTxt(ctx: CanvasRenderingContext2D, txt: string, maxW: number): string[] {
  if (!txt) return [];
  if (ctx.measureText(txt).width <= maxW) return [txt];
  const words = txt.split(/\s+/);
  const lines: string[] = [];
  let cur = '';
  words.forEach((w) => {
    const t = cur ? cur + ' ' + w : w;
    if (ctx.measureText(t).width > maxW && cur) {
      lines.push(cur);
      cur = w;
    } else cur = t;
  });
  if (cur) lines.push(cur);
  return lines.slice(0, 5);
}

export async function makeQRCanvas(lat: number, lng: number, size: number): Promise<HTMLCanvasElement | null> {
  try {
    const url = 'https://www.google.com/maps?q=' + lat.toFixed(6) + ',' + lng.toFixed(6);
    const cvs = document.createElement('canvas');
    cvs.width = size;
    cvs.height = size;
    await QRCode.toCanvas(cvs, url, { width: size, margin: 0, color: { dark: '#000000', light: '#ffffff' } });
    return cvs;
  } catch (e) {
    return null;
  }
}

export function drawWM(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  photo: any,
  S: WatermarkState,
  qrCvs: HTMLCanvasElement | null,
  danruStr: string,
  logoImg: HTMLImageElement | null
) {
  const isCam = photo.source === 'camera';
  const exif: ExifData = photo.exif;
  let lat: number | null = null,
    lng: number | null = null;

  if (isCam && exif && exif.gps) {
    lat = exif.gps.lat;
    lng = exif.gps.lng;
  } else if (S.lat && S.lng) {
    lat = parseFloat(S.lat);
    lng = parseFloat(S.lng);
  }

  const coordStr = lat !== null && lng !== null ? '📡 ' + lat.toFixed(6) + ', ' + lng.toFixed(6) : 'Koordinat tidak tersedia';
  const addrFull = isCam && photo.exifAddr && photo.exifAddr.full ? photo.exifAddr.full : getManualLoc(S);
  const timeStr = isCam ? fmtExifTime(exif) : nowFull() + ' WIB';
  const danru = danruStr || '—';

  const BAR = Math.max(3, Math.round(w * 0.006)),
    PAD = Math.round(w * 0.022),
    PADV = 8;
  const LOGO = Math.round(Math.min(w, h) * 0.1);
  const QR = qrCvs ? Math.max(75, Math.min(200, Math.round(Math.min(w, h) * 0.14))) : 0;
  const QR_PAD = qrCvs ? Math.round(PAD * 0.6) : 0;
  const fT = Math.max(11, Math.round(LOGO * 0.35)),
    fB = Math.max(9, Math.round(LOGO * 0.3)),
    fS = Math.max(7, Math.round(fB * 0.7));
  const LH = Math.round(fB * 1.5),
    TX = BAR + Math.round(PAD * 0.35) + LOGO + Math.round(PAD * 0.45);
  const TW = w - TX - PAD - (qrCvs ? QR + QR_PAD * 2 : 0);

  ctx.font = fB + 'px Arial,sans-serif';
  const addrLines = wrapTxt(ctx, addrFull, TW);
  const nLines = 1 + 1 + 1 + addrLines.length + 1;
  const CONTH = PADV + Math.round(fT * 1.45) + nLines * LH + PADV;
  const STRPH = Math.max(Math.round(h * 0.1), CONTH * 0.8, qrCvs ? QR + PADV * 2 : 0);
  const SY = h - STRPH;

  ctx.save();
  const gr = ctx.createLinearGradient(0, SY, 0, h);
  gr.addColorStop(0, 'rgba(2,6,18,0.42)');
  gr.addColorStop(0.6, 'rgba(2,6,18,0.65)');
  gr.addColorStop(1, 'rgba(2,6,18,0.80)');
  ctx.fillStyle = gr;
  ctx.fillRect(0, SY, w, STRPH);

  const bg = ctx.createLinearGradient(0, SY, 0, h);
  bg.addColorStop(0, 'rgba(26,101,214,0.65)');
  bg.addColorStop(1, 'rgba(26,80,184,0.90)');
  ctx.fillStyle = bg;
  ctx.fillRect(0, SY, BAR, STRPH);

  const lx = BAR + Math.round(PAD * 0.35),
    ly = SY + Math.round((STRPH - LOGO) / 2);

  if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
    try {
      ctx.globalAlpha = 0.65;
      ctx.drawImage(logoImg, lx, ly, LOGO, LOGO);
      ctx.globalAlpha = 1;
    } catch (e) {}
  }

  if (qrCvs && QR > 0) {
    const qx = w - QR - QR_PAD,
      qy = SY + Math.round((STRPH - QR) / 2) - 25;
    ctx.fillStyle = '#ffffff';
    const qPad = 4;
    ctx.fillRect(qx - qPad, qy - qPad, QR + qPad * 2, QR + qPad * 2);
    try {
      ctx.drawImage(qrCvs, qx, qy, QR, QR);
    } catch (e) {}
    ctx.font = 'bold ' + Math.max(7, Math.round(fS * 0.65)) + 'px Arial,sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.70)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('LIHAT LOKASI', qx + QR / 2, qy - 5);
  }

  // MINIMAP FRAME (Parity with Toggle)
  if (S.minimap && lat !== null && lng !== null) {
    const MX = TX + TW - 140, MY = SY + PADV, MW = 120, MH = 80;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(MX, MY, MW, MH);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(MX, MY, MW, MH);
    ctx.font = 'bold 10px Arial,sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText('MAP VIEW', MX + MW/2, MY + MH/2 - 5);
    ctx.font = '8px Arial,sans-serif';
    ctx.fillText('NAVIGASI AKTIF', MX + MW/2, MY + MH/2 + 10);
  }

  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  const tx = TX;
  let ty = SY + PADV;

  ctx.font = '800 ' + fT + 'px Arial,sans-serif';
  ctx.fillStyle = 'rgba(255,210,0,0.90)';
  ctx.fillText('SATLINMAS PEDESTRIAN', tx, ty, TW);
  ty += Math.round(fT * 1.45);

  ctx.font = '700 ' + fB + 'px Arial,sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.90)';
  ctx.fillText('Danru: ' + danru, tx, ty, TW);
  ty += LH;

  ctx.font = '400 ' + fB + 'px Arial,sans-serif';
  ctx.fillStyle = 'rgba(160,210,255,0.90)';
  ctx.fillText(timeStr, tx, ty, TW);
  ty += LH;

  ctx.font = '500 ' + fB + 'px Arial,sans-serif';
  ctx.fillStyle = isCam && photo.exifAddr && photo.exifAddr.road ? 'rgba(180,248,200,0.90)' : 'rgba(160,240,200,0.80)';
  addrLines.forEach((ln) => {
    ctx.fillText(ln, tx, ty, TW);
    ty += LH;
  });

  ctx.font = '400 ' + fS + 'px Arial,sans-serif';
  ctx.fillStyle = 'rgba(140,180,220,0.85)';
  ctx.fillText(coordStr, tx, ty, TW);

  const spF = Math.max(8, Math.round(w * 0.024));
  ctx.font = '900 ' + spF + 'px Arial,sans-serif';
  ctx.fillStyle = 'rgba(255,205,0,0.55)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText('SI-PEDAS', w - Math.round(PAD * 0.5), h - Math.round(PAD * 0.3), Math.round(w * 0.22));

  ctx.font = '400 ' + Math.round(spF * 0.72) + 'px Arial,sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillText('mobile', w - Math.round(PAD * 0.5), h - Math.round(PAD * 0.3) - spF - 2, Math.round(w * 0.18));

  ctx.restore();
}

function b64sz(b: string) {
  return Math.max(0, b.length - (b.indexOf(',') + 1) - (b.endsWith('==') ? 2 : b.endsWith('=') ? 1 : 0)) * 0.75;
}

/**
 * Resizes and adds a watermark to an image.
 */
export async function processImage(
  dataUrl: string,
  source: string,
  photo: any,
  S: WatermarkState,
  danruStr: string,
  MAX_B = 800 * 1024
): Promise<{ data: string; mime: string; sizeKB: number; compressed: boolean; ts: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = async () => {
      const cvs = document.createElement('canvas');
      const ctx = cvs.getContext('2d');
      if (!ctx) {
        resolve(null as any);
        return;
      }

      let w = img.naturalWidth,
        h = img.naturalHeight;
      const mx = 2500;
      if (w > mx || h > mx) {
        if (w > h) {
          h = Math.round((h * mx) / w);
          w = mx;
        } else {
          w = Math.round((w * mx) / h);
          h = mx;
        }
      }
      cvs.width = w;
      cvs.height = h;
      ctx.drawImage(img, 0, 0, w, h);

      const finalize = (qrCvs: HTMLCanvasElement | null) => {
        const useWM = source === 'camera' ? S.wmCam : S.wmGal;
        // Asset Sync: Use icon-192 as default logo for mobile reports
        let logoImg = document.getElementById('img-linmas') as HTMLImageElement;
        if (!logoImg) {
          logoImg = new Image();
          logoImg.src = '/assets/icon-192.png';
        }
        if (useWM) drawWM(ctx, w, h, photo, S, qrCvs, danruStr, logoImg);

        const outMime = 'image/jpeg';
        let q = 0.92;
        let raw = cvs.toDataURL(outMime, q);
        let sz = b64sz(raw);
        let comp = false;
        let out = raw;

        if (sz > MAX_B) {
          comp = true;
          let lo = 0.1,
            hi = q,
            best = raw;
          for (let it = 0; it < 14; it++) {
            const mid = (lo + hi) / 2;
            const trial = cvs.toDataURL(outMime, mid);
            const tsz = b64sz(trial);
            if (tsz <= MAX_B) {
              best = trial;
              lo = mid;
            } else hi = mid;
            if (hi - lo < 0.006) break;
          }
          out = best;
        }
        resolve({ data: out, mime: outMime, sizeKB: Math.round(b64sz(out) / 1024), compressed: comp, ts: photo.ts });
      };

      if (photo.source === 'camera' && photo.exif && photo.exif.gps && S.wmCam) {
        const qrSz = Math.max(90, Math.min(240, Math.round(Math.min(w, h) * 0.16)));
        const qrCvs = await makeQRCanvas(photo.exif.gps.lat, photo.exif.gps.lng, qrSz);
        finalize(qrCvs);
      } else {
        finalize(null);
      }
    };
    img.src = dataUrl;
  });
}

import { NextResponse } from 'next/server';
import {
  checkLogin,
  getDashboardData,
  getRekapData,
  addLaporan,
  updateLaporan,
  deleteLaporan,
  generateLaporanHtml,
  generateKolektifHtml,
  getSatlinmasData,
  addSatlinmas,
  updateSatlinmas,
  deleteSatlinmas,
  getDetailFotoMarkers,
  getLayerPeta,
  addLayerPeta,
  updateLayerPeta,
  deleteLayerPeta,
  toggleLayerAktif,
  saveGambarPeta,
  getGambarPeta,
  deleteGambarPeta,
  changePassword,
  createAccount,
  getSettings,
  saveSettings,
  initAllSheets,
  getPoskamlingData,
  addPoskamling,
  updatePoskamling,
  deletePoskamling,
  getPosyanduData,
  addPosyandu,
  updatePosyandu,
  deletePosyandu,
  success,
  error
} from '../../../lib/sheets-service';

import { uploadFoto } from '../../../lib/drive-service';

// Helper to handle CORS
function setCorsHeaders(res) {
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return res;
}

export async function OPTIONS() {
  const res = new NextResponse(null, { status: 200 });
  return setCorsHeaders(res);
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || '';
    let result;

    switch (action) {
      case 'ping':
        result = success({ pong: true, ts: new Date().toISOString() }, 'pong');
        break;
      case 'getDashboard':
        result = await getDashboardData();
        break;
      case 'getRekap':
        result = await getRekapData({ 
          q: searchParams.get('q') || '', 
          tglFrom: searchParams.get('tglFrom') || '', 
          tglTo: searchParams.get('tglTo') || '' 
        });
        break;
      case 'getSatlinmas':
        result = await getSatlinmasData();
        break;
      case 'getDetailFotoMarkers':
        result = await getDetailFotoMarkers();
        break;
      case 'getLayerPeta':
        result = await getLayerPeta();
        break;
      case 'getGambarPeta':
        result = await getGambarPeta();
        break;
      case 'getSettings':
        result = await getSettings();
        break;
      case 'getPoskamling':
        result = await getPoskamlingData();
        break;
      case 'getPosyandu':
        result = await getPosyanduData();
        break;
      default:
        result = error(`Unknown GET action: '${action}'`);
    }

    const res = NextResponse.json(result);
    return setCorsHeaders(res);
  } catch (err) {
    console.error('[API Error]:', err.stack || err.message);
    const res = NextResponse.json(error('Server Error: ' + err.message));
    return setCorsHeaders(res);
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const action = body.action || '';
    let result;

    switch (action) {
      case 'login':
        result = await checkLogin(body.username, body.password);
        break;
      case 'uploadFoto':
        result = await uploadFoto(body.data);
        break;
      case 'addLaporan':
        result = await addLaporan(body);
        break;
      case 'updateLaporan':
        result = await updateLaporan(body);
        break;
      case 'deleteLaporan':
        result = await deleteLaporan(body.ri);
        break;
      case 'generateLaporanHtml':
        result = generateLaporanHtml(body);
        break;
      case 'generateKolektifHtml':
        result = generateKolektifHtml(body);
        break;
      case 'addSatlinmas':
        result = await addSatlinmas(body);
        break;
      case 'updateSatlinmas':
        result = await updateSatlinmas(body);
        break;
      case 'deleteSatlinmas':
        result = await deleteSatlinmas(body.ri);
        break;
      case 'addLayerPeta':
        result = await addLayerPeta(body);
        break;
      case 'updateLayerPeta':
        result = await updateLayerPeta(body);
        break;
      case 'deleteLayerPeta':
        result = await deleteLayerPeta(body.ri);
        break;
      case 'toggleLayerAktif':
        result = await toggleLayerAktif(body.ri, body.aktif);
        break;
      case 'saveGambarPeta':
        result = await saveGambarPeta(body.drawings);
        break;
      case 'deleteGambarPeta':
        result = await deleteGambarPeta(body.ri);
        break;
      case 'initAllSheets':
        result = await initAllSheets(body);
        break;
      case 'changePassword':
        result = await changePassword(body.oldPass, body.newPass, body.username || '');
        break;
      case 'createAccount':
        result = await createAccount(body);
        break;
      case 'saveSettings':
        result = await saveSettings(body);
        break;
      case 'addPoskamling':
        result = await addPoskamling(body);
        break;
      case 'updatePoskamling':
        result = await updatePoskamling(body);
        break;
      case 'deletePoskamling':
        result = await deletePoskamling(body.ri);
        break;
      case 'addPosyandu':
        result = await addPosyandu(body);
        break;
      case 'updatePosyandu':
        result = await updatePosyandu(body);
        break;
      case 'deletePosyandu':
        result = await deletePosyandu(body.ri);
        break;
      default:
        result = error(`Unknown POST action: '${action}'`);
    }

    const res = NextResponse.json(result);
    return setCorsHeaders(res);
  } catch (err) {
    console.error('[API Error]:', err.stack || err.message);
    const res = NextResponse.json(error('Server Error: ' + err.message));
    return setCorsHeaders(res);
  }
}

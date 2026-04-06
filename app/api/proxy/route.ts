import { NextRequest, NextResponse } from "next/server";
import { sheetsService } from "@/server/sheetsService";

export const runtime = "nodejs";

function withCors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return res;
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 200 }));
}

export async function GET(req: NextRequest) {
  try {
    const action = req.nextUrl.searchParams.get("action") || "";
    let result: any;

    switch (action) {
      case "ping":
        result = sheetsService.success({ pong: true, ts: new Date().toISOString() }, "pong");
        break;
      case "getDashboard":
        result = await sheetsService.getDashboardData();
        break;
      case "getRekap":
        result = await sheetsService.getRekapData({
          q: req.nextUrl.searchParams.get("q") || "",
          tglFrom: req.nextUrl.searchParams.get("tglFrom") || "",
          tglTo: req.nextUrl.searchParams.get("tglTo") || ""
        });
        break;
      case "getSatlinmas":
        result = await sheetsService.getSatlinmasData();
        break;
      case "getDetailFotoMarkers":
        result = await sheetsService.getDetailFotoMarkers();
        break;
      case "getLayerPeta":
        result = await sheetsService.getLayerPeta();
        break;
      case "getGambarPeta":
        result = await sheetsService.getGambarPeta();
        break;
      case "getSettings":
        result = await sheetsService.getSettings();
        break;
      case "listDrafts":
        result = await sheetsService.listDrafts();
        break;
      case "getDraft":
        result = await sheetsService.getDraftById(req.nextUrl.searchParams.get("id") || "");
        break;
      default:
        result = sheetsService.error(`Unknown GET action: '${action}'`);
    }

    return withCors(NextResponse.json(result));
  } catch (e: any) {
    return withCors(NextResponse.json(sheetsService.error("Server Error: " + (e?.message || String(e)))));
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body?.action || "";

    let result: any;
    switch (action) {
      case "login":
        result = await sheetsService.checkLogin(body.username, body.password);
        break;
      case "uploadFoto":
        result = await sheetsService.uploadFoto(body);
        break;
      case "addLaporan":
        result = await sheetsService.addLaporan(body);
        break;
      case "updateLaporan":
        result = await sheetsService.updateLaporan(body);
        break;
      case "deleteLaporan":
        result = await sheetsService.deleteLaporan(body.ri);
        break;
      case "generateLaporanHtml":
        result = sheetsService.generateLaporanHtml(body);
        break;
      case "generateKolektifHtml":
        result = sheetsService.generateKolektifHtml(body);
        break;
      case "addSatlinmas":
        result = await sheetsService.addSatlinmas(body);
        break;
      case "updateSatlinmas":
        result = await sheetsService.updateSatlinmas(body);
        break;
      case "deleteSatlinmas":
        result = await sheetsService.deleteSatlinmas(body.ri);
        break;
      case "addLayerPeta":
        result = await sheetsService.addLayerPeta(body);
        break;
      case "updateLayerPeta":
        result = await sheetsService.updateLayerPeta(body);
        break;
      case "deleteLayerPeta":
        result = await sheetsService.deleteLayerPeta(body.ri);
        break;
      case "toggleLayerAktif":
        result = await sheetsService.toggleLayerAktif(body.ri, body.aktif);
        break;
      case "saveGambarPeta":
        result = await sheetsService.saveGambarPeta(body.drawings);
        break;
      case "deleteGambarPeta":
        result = await sheetsService.deleteGambarPeta(body.ri);
        break;
      case "initAllSheets":
        result = await sheetsService.initAllSheets();
        break;
      case "changePassword":
        result = await sheetsService.changePassword(body.oldPass, body.newPass, body.username || "");
        break;
      case "createAccount":
        result = await sheetsService.createAccount(body);
        break;
      case "saveSettings":
        result = await sheetsService.saveSettings(body);
        break;
      case "saveDraft":
        result = await sheetsService.saveDraft(body);
        break;
      case "deleteDraft":
        result = await sheetsService.deleteDraft(body.id);
        break;
      default:
        result = sheetsService.error(`Unknown POST action: '${action}'`);
    }

    return withCors(NextResponse.json(result));
  } catch (e: any) {
    return withCors(NextResponse.json(sheetsService.error("Server Error: " + (e?.message || String(e)))));
  }
}

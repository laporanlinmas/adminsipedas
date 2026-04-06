import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const target = process.env.INPUT_EMBED_URL || "";
  if (!target) {
    return new NextResponse("INPUT_EMBED_URL is not configured", { status: 500 });
  }
  return NextResponse.redirect(target, { status: 302 });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}

